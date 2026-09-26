//! `nofy lease` — the file-lease surface (FR12.11, U9-06). Active
//! sessions declare their working set (hunks in flight, cwd tree,
//! opened files); leased files are steward-READ-ONLY — a management
//! operation that hits a live lease is refused at load time. Leases
//! carry TTL + heartbeat; an expired lease is no lease. The table is
//! persisted at `$NOFY_HOME/leases.json` so declarations survive the
//! declaring process and stay inspectable.

use std::path::{Path, PathBuf};

use anyhow::{bail, Result};
use clap::Subcommand;
use serde::{Deserialize, Serialize};

/// Default lease lifetime when `--ttl` is not given.
const DEFAULT_TTL_SECS: u64 = 300;

#[derive(Debug, clap::Args, Clone)]
pub struct LeaseArgs {
    #[command(subcommand)]
    pub command: LeaseCommand,
}

#[derive(Debug, Subcommand, Clone)]
pub enum LeaseCommand {
    /// Show live leases (expired entries are swept first).
    List {
        /// Emit machine-readable JSON output.
        #[arg(long)]
        json: bool,
    },
    /// Declare a session's working set: each path becomes leased and
    /// steward-read-only until the TTL lapses.
    Declare {
        /// Session id that owns (and is editing) these files.
        #[arg(long)]
        session: String,
        /// Lease lifetime in seconds (default 300).
        #[arg(long, default_value_t = DEFAULT_TTL_SECS)]
        ttl: u64,
        /// Files to lease.
        #[arg(required = true)]
        paths: Vec<PathBuf>,
    },
    /// Drop a lease before its TTL lapses (or `--all` to clear the
    /// table).
    Release {
        /// Leased path to release.
        path: Option<PathBuf>,
        /// Release every lease.
        #[arg(long)]
        all: bool,
    },
}

/// One persisted lease record.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct LeaseRecord {
    pub path: String,
    pub session: String,
    pub expires: u64,
    pub last_heartbeat: u64,
}

fn lease_file(state_dir: &Path) -> PathBuf {
    state_dir.join("leases.json")
}

/// Load the table, deduplicating by path (last record wins). A missing
/// file is an empty table; a corrupt file fails loud.
fn load(state_dir: &Path) -> Result<Vec<LeaseRecord>> {
    let file = lease_file(state_dir);
    if !file.exists() {
        return Ok(Vec::new());
    }
    let raw = std::fs::read_to_string(&file)?;
    let records: Vec<LeaseRecord> = serde_json::from_str(&raw)
        .map_err(|e| anyhow::anyhow!("{} is corrupt: {e}", file.display()))?;
    let mut by_path: std::collections::BTreeMap<String, LeaseRecord> = Default::default();
    for record in records {
        by_path.insert(record.path.clone(), record);
    }
    Ok(by_path.into_values().collect())
}

/// Atomic write: tmp file + rename, like every other persisted state.
fn save(state_dir: &Path, records: &[LeaseRecord]) -> Result<()> {
    let file = lease_file(state_dir);
    if let Some(parent) = file.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let tmp = file.with_extension("json.tmp");
    let mut sorted: Vec<&LeaseRecord> = records.iter().collect();
    sorted.sort_by(|a, b| a.path.cmp(&b.path));
    std::fs::write(&tmp, serde_json::to_string_pretty(&sorted)?)?;
    std::fs::rename(&tmp, &file)?;
    Ok(())
}

fn now_secs() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

/// Liveness per the policy core (FR12.11): expired = no lease, expiry
/// exclusive. Mirrors `LeaseTable::lease_holder`.
fn is_live(record: &LeaseRecord, now: u64) -> bool {
    now < record.expires
}

/// Execute one lease subcommand against the table under `state_dir`.
pub fn run(args: &LeaseArgs, state_dir: &Path) -> Result<()> {
    match &args.command {
        LeaseCommand::List { json } => {
            let now = now_secs();
            let mut records = load(state_dir)?;
            let swept = records.len();
            records.retain(|r| is_live(r, now));
            let swept = swept - records.len();
            if swept > 0 {
                save(state_dir, &records)?;
            }
            if *json {
                println!("{}", serde_json::to_string_pretty(&records)?);
                return Ok(());
            }
            if records.is_empty() {
                println!("(no live leases)");
                return Ok(());
            }
            println!("{:<60} {:<16} {:>8}", "PATH", "SESSION", "EXPIRES");
            for record in &records {
                println!(
                    "{:<60} {:<16} {:>6}s",
                    record.path,
                    record.session,
                    record.expires.saturating_sub(now)
                );
            }
        }
        LeaseCommand::Declare { session, ttl, paths } => {
            if session.trim().is_empty() {
                bail!("--session must not be empty");
            }
            let now = now_secs();
            let mut records = load(state_dir)?;
            records.retain(|r| is_live(r, now));
            for path in paths {
                let abs = dunce::canonicalize(path)
                    .map_err(|e| anyhow::anyhow!("cannot lease {}: {e}", path.display()))?;
                let key = abs.to_string_lossy().into_owned();
                records.retain(|r| r.path != key);
                records.push(LeaseRecord {
                    path: key,
                    session: session.clone(),
                    expires: now + ttl,
                    last_heartbeat: now,
                });
            }
            save(state_dir, &records)?;
            println!(
                "leased {} path(s) to session `{session}` for {ttl}s; \
                 leased files are steward-read-only while the lease is live",
                paths.len()
            );
        }
        LeaseCommand::Release { path, all } => {
            let now = now_secs();
            let mut records = load(state_dir)?;
            records.retain(|r| is_live(r, now));
            let before = records.len();
            if *all {
                records.clear();
            } else {
                let Some(path) = path else {
                    bail!("give a path to release, or --all");
                };
                let abs = dunce::canonicalize(path)
                    .map_err(|e| anyhow::anyhow!("cannot resolve {}: {e}", path.display()))?;
                let key = abs.to_string_lossy().into_owned();
                records.retain(|r| r.path != key);
            }
            let removed = before - records.len();
            save(state_dir, &records)?;
            if removed == 0 {
                println!("nothing to release (no live lease matched)");
            } else {
                println!("released {removed} lease(s)");
            }
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn declare(state: &Path, session: &str, path: &Path, ttl: u64) {
        run(
            &LeaseArgs {
                command: LeaseCommand::Declare {
                    session: session.to_string(),
                    ttl,
                    paths: vec![path.to_path_buf()],
                },
            },
            state,
        )
        .unwrap();
    }

    #[test]
    fn declare_list_release_roundtrip() {
        let dir = tempfile::tempdir().unwrap();
        let state = dir.path();
        let victim = dir.path().join("editing.rs");
        std::fs::write(&victim, "in flight").unwrap();

        declare(state, "sess-1", &victim, 300);
        let records = load(state).unwrap();
        assert_eq!(records.len(), 1);
        assert_eq!(records[0].session, "sess-1");
        assert!(is_live(&records[0], now_secs()));

        run(
            &LeaseArgs {
                command: LeaseCommand::Release {
                    path: Some(victim.clone()),
                    all: false,
                },
            },
            state,
        )
        .unwrap();
        assert!(load(state).unwrap().is_empty());
    }

    #[test]
    fn expired_lease_is_no_lease() {
        let dir = tempfile::tempdir().unwrap();
        let state = dir.path();
        let victim = dir.path().join("f.rs");
        std::fs::write(&victim, "x").unwrap();

        // ttl 0 expires the instant it is written.
        declare(state, "sess-1", &victim, 0);
        assert!(
            load(state).unwrap().is_empty() || {
                let now = now_secs();
                !load(state).unwrap().iter().any(|r| is_live(r, now))
            },
            "an expired lease must not read as leased"
        );

        // Release of an already-expired lease finds nothing.
        run(
            &LeaseArgs {
                command: LeaseCommand::Release { path: Some(victim), all: false },
            },
            state,
        )
        .unwrap();
        assert!(load(state).unwrap().is_empty());
    }

    #[test]
    fn declare_records_normalized_absolute_paths() {
        let dir = tempfile::tempdir().unwrap();
        let state = dir.path();
        let victim = dir.path().join("g.rs");
        std::fs::write(&victim, "x").unwrap();

        // A non-normalized path must land as a clean absolute key.
        declare(state, "sess-2", &dir.path().join("./g.rs"), 300);

        let records = load(state).unwrap();
        assert_eq!(records.len(), 1);
        assert_eq!(
            records[0].path,
            dunce::canonicalize(&victim).unwrap().to_string_lossy()
        );
    }

    #[test]
    fn release_all_clears_the_table() {
        let dir = tempfile::tempdir().unwrap();
        let state = dir.path();
        for name in ["a.rs", "b.rs"] {
            let f = dir.path().join(name);
            std::fs::write(&f, "x").unwrap();
            declare(state, "sess-1", &f, 300);
        }
        run(
            &LeaseArgs {
                command: LeaseCommand::Release { path: None, all: true },
            },
            state,
        )
        .unwrap();
        assert!(load(state).unwrap().is_empty());
    }
}
