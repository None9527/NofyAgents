//! Non-clean-death forensics ledger (HM-F3, translated).
//!
//! Append-only JSONL at `<state>/daemon/forensics.jsonl`. Every daemon run
//! writes a `startup` entry; a clean exit appends `clean_shutdown`. The NEXT
//! startup reads the last entry: anything other than `clean_shutdown` means
//! the previous run died non-cleanly (SIGKILL, wedge, panic-abort), so the
//! new run records `unclean_death_detected` with the dead run's pid/starttime
//! — the lifecycle ledger the supervisor and `grok doctor` can query.
//!
//! Cgroup orphan sweep is deliberately out of scope here (needs the daemon's
//! process-tree registry, B1-later); the ledger is the detection half.

use std::fs::{self, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::path::{Path, PathBuf};

use serde_json::{json, Value};

const FILE_NAME: &str = "forensics.jsonl";

pub struct ForensicsLedger {
    path: PathBuf,
}

fn proc_starttime(pid: u32) -> Option<u64> {
    let stat = fs::read_to_string(format!("/proc/{pid}/stat")).ok()?;
    let after_comm = stat.rsplit_once(')')?.1;
    after_comm.split_whitespace().nth(19)?.parse().ok()
}

impl ForensicsLedger {
    /// Open (creating) the ledger under `dir`.
    pub fn open(dir: &Path) -> std::io::Result<Self> {
        fs::create_dir_all(dir)?;
        Ok(Self {
            path: dir.join(FILE_NAME),
        })
    }

    fn append(&self, entry: &Value) -> std::io::Result<()> {
        let mut f = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.path)?;
        writeln!(f, "{entry}")?;
        f.sync_all()
    }

    fn last_entry(&self) -> Option<Value> {
        let f = fs::File::open(&self.path).ok()?;
        // Manual walk, not `lines().last()`: a PERSISTENT read error makes
        // `lines()` yield `Some(Err)` forever, and `last()` would never
        // terminate (hangs the boot path). Stop at the first error and use
        // the last line read successfully — torn-tail tolerance.
        let mut last_line: Option<String> = None;
        for line in BufReader::new(f).lines() {
            match line {
                Ok(l) => last_line = Some(l),
                Err(_) => break,
            }
        }
        serde_json::from_str(&last_line?).ok()
    }

    /// Record this run's startup and classify the previous run.
    /// Returns true iff the previous run died non-cleanly.
    pub fn record_startup(&self) -> std::io::Result<bool> {
        let prev = self.last_entry();
        let prev_clean = prev
            .as_ref()
            .and_then(|v| v.get("kind"))
            .and_then(|k| k.as_str())
            == Some("clean_shutdown");
        let had_previous = prev.is_some();
        let pid = std::process::id();
        self.append(&json!({
            "kind": "startup",
            "pid": pid,
            "starttime": proc_starttime(pid).unwrap_or(0),
            "prev_had_clean_shutdown": prev_clean || !had_previous,
        }))?;
        let unclean = had_previous && !prev_clean;
        if unclean {
            let dead = prev.unwrap();
            self.append(&json!({
                "kind": "unclean_death_detected",
                "dead_pid": dead.get("pid").and_then(|p| p.as_u64()),
                "dead_kind": dead.get("kind").and_then(|k| k.as_str()).unwrap_or("startup"),
                "detected_by_pid": pid,
            }))?;
        }
        Ok(unclean)
    }

    /// Mark a clean exit; the next startup will classify us accordingly.
    pub fn mark_clean_shutdown(&self) -> std::io::Result<()> {
        self.append(&json!({
            "kind": "clean_shutdown",
            "pid": std::process::id(),
        }))
    }

    pub fn path(&self) -> &Path {
        &self.path
    }

    /// All ledger entries in order (U8-09: crash forensics queryable,
    /// not just readable off the raw file). A torn tail truncates the
    /// read, never errors — same discipline as the other append-only
    /// logs. A missing ledger is an empty history.
    pub fn entries(&self) -> Vec<serde_json::Value> {
        let Ok(text) = fs::read_to_string(&self.path) else {
            return Vec::new();
        };
        let mut out = Vec::new();
        for line in text.lines() {
            if line.trim().is_empty() {
                continue;
            }
            match serde_json::from_str::<serde_json::Value>(line) {
                Ok(v) => out.push(v),
                Err(_) => break,
            }
        }
        out
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn first_startup_is_not_unclean() {
        let dir = tempfile::tempdir().unwrap();
        let ledger = ForensicsLedger::open(dir.path()).unwrap();
        assert!(!ledger.record_startup().unwrap());
    }

    #[test]
    fn unclean_previous_run_is_detected() {
        let dir = tempfile::tempdir().unwrap();
        {
            let ledger = ForensicsLedger::open(dir.path()).unwrap();
            ledger.record_startup().unwrap();
            // dropped WITHOUT mark_clean_shutdown = simulated crash
        }
        let ledger = ForensicsLedger::open(dir.path()).unwrap();
        assert!(
            ledger.record_startup().unwrap(),
            "second run must flag the crashed predecessor"
        );
        let text = fs::read_to_string(ledger.path()).unwrap();
        assert!(text.contains("unclean_death_detected"));
    }

    #[test]
    fn clean_previous_run_is_not_flagged() {
        let dir = tempfile::tempdir().unwrap();
        {
            let ledger = ForensicsLedger::open(dir.path()).unwrap();
            ledger.record_startup().unwrap();
            ledger.mark_clean_shutdown().unwrap();
        }
        let ledger = ForensicsLedger::open(dir.path()).unwrap();
        assert!(!ledger.record_startup().unwrap());
    }

    #[test]
    fn append_failure_surfaces_as_error() {
        // The ledger path is a symlink whose target cannot be created
        // (read-only target directory): the append fails, and the error
        // propagates — disk trouble is never silent.
        let dir = tempfile::tempdir().unwrap();
        let ro = dir.path().join("ro");
        std::fs::create_dir(&ro).unwrap();
        let mut perms = std::fs::metadata(&ro).unwrap().permissions();
        perms.set_readonly(true);
        std::fs::set_permissions(&ro, perms).unwrap();
        std::os::unix::fs::symlink(ro.join("missing.jsonl"), dir.path().join(FILE_NAME))
            .unwrap();
        let ledger = ForensicsLedger::open(dir.path()).unwrap();
        assert!(ledger.record_startup().is_err());
    }

    #[test]
    fn directory_at_ledger_path_fails_loud_not_forever() {
        // Regression: a directory at the ledger path makes reads error
        // persistently; last_entry must STOP at the first error (torn-tail
        // tolerance), never loop forever on the boot path. The startup then
        // fails loud at append — the test completing is the liveness proof.
        let dir = tempfile::tempdir().unwrap();
        std::fs::create_dir(dir.path().join(FILE_NAME)).unwrap();
        let ledger = ForensicsLedger::open(dir.path()).unwrap();
        assert!(ledger.record_startup().is_err());
    }
}
