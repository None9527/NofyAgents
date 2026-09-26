//! `nofy trash` — the recoverable-delete surface (W-9). Deletions made
//! through the trash (the agent's `delete_file` tool, or `trash add`)
//! land under `$NOFY_HOME/trash` and stay recoverable until `trash
//! empty`. This module is the user face: list what is recoverable,
//! restore one entry by id, empty deliberately.

use anyhow::{Result, bail};
use clap::Subcommand;

#[derive(Debug, clap::Args, Clone)]
pub struct TrashArgs {
    #[command(subcommand)]
    pub command: TrashCommand,
}

#[derive(Debug, Subcommand, Clone)]
pub enum TrashCommand {
    /// List recoverable trash entries.
    List {
        /// Emit machine-readable JSON output.
        #[arg(long)]
        json: bool,
    },
    /// Move one entry back to its original path (never overwrites).
    Restore {
        /// Entry id (as shown by `trash list`).
        id: String,
    },
    /// Move a path into the trash instead of deleting it.
    Add {
        /// File or directory to trash.
        path: std::path::PathBuf,
    },
    /// Physically remove every staged copy. Irreversible — requires
    /// `--force` so an empty-trash is always a deliberate act.
    Empty {
        #[arg(long)]
        force: bool,
    },
}

/// Execute one trash subcommand against the trash under `state_dir`.
pub fn run(args: &TrashArgs, state_dir: &std::path::Path) -> Result<()> {
    let store = nofy_stewardcore::trash::TrashStore::at(state_dir.join("trash"));
    match &args.command {
        TrashCommand::List { json } => {
            let entries = store.list();
            if *json {
                println!("{}", serde_json::to_string_pretty(&entries)?);
                return Ok(());
            }
            if entries.is_empty() {
                println!("(trash is empty)");
                return Ok(());
            }
            println!("{:<24} {:>10}  {}", "ID", "SIZE", "ORIGINAL PATH");
            for entry in &entries {
                println!(
                    "{:<24} {:>10}  {}",
                    entry.id,
                    human_size(entry.size),
                    entry.original_path
                );
            }
        }
        TrashCommand::Restore { id } => {
            let original = store
                .restore(id)
                .map_err(|e| anyhow::anyhow!("restore failed: {e}"))?;
            println!("restored: {}", original.display());
        }
        TrashCommand::Add { path } => {
            let now = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_secs())
                .unwrap_or(0);
            let entry = store
                .add(path, now)
                .map_err(|e| anyhow::anyhow!("trash add failed: {e}"))?;
            println!(
                "trashed: {} (id {}, restore with `nofy trash restore {}`)",
                entry.original_path, entry.id, entry.id
            );
        }
        TrashCommand::Empty { force } => {
            if !force {
                bail!("emptying the trash is irreversible; re-run with --force");
            }
            let removed = store
                .empty()
                .map_err(|e| anyhow::anyhow!("trash empty failed: {e}"))?;
            println!(
                "emptied: {removed} entr{} removed",
                if removed == 1 { "y" } else { "ies" }
            );
        }
    }
    Ok(())
}

/// Compact human size for the list view.
fn human_size(bytes: u64) -> String {
    const UNITS: [&str; 4] = ["B", "K", "M", "G"];
    let mut value = bytes as f64;
    let mut unit = 0;
    while value >= 1024.0 && unit < UNITS.len() - 1 {
        value /= 1024.0;
        unit += 1;
    }
    if unit == 0 {
        format!("{bytes}B")
    } else {
        format!("{value:.1}{}", UNITS[unit])
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn human_size_formats_units() {
        assert_eq!(human_size(0), "0B");
        assert_eq!(human_size(512), "512B");
        assert_eq!(human_size(2048), "2.0K");
        assert_eq!(human_size(5 * 1024 * 1024), "5.0M");
    }

    #[test]
    fn list_add_restore_roundtrip_through_the_cli_layer() {
        let dir = tempfile::tempdir().unwrap();
        let state = dir.path();
        let victim = dir.path().join("victim.txt");
        std::fs::write(&victim, "recoverable").unwrap();

        run(
            &TrashArgs {
                command: TrashCommand::Add {
                    path: victim.clone(),
                },
            },
            state,
        )
        .unwrap();
        assert!(!victim.exists());

        // List finds it; grab the id from the store directly.
        let store = nofy_stewardcore::trash::TrashStore::at(state.join("trash"));
        let entries = store.list();
        assert_eq!(entries.len(), 1);

        run(
            &TrashArgs {
                command: TrashCommand::Restore {
                    id: entries[0].id.clone(),
                },
            },
            state,
        )
        .unwrap();
        assert_eq!(std::fs::read_to_string(&victim).unwrap(), "recoverable");
    }

    #[test]
    fn empty_without_force_refuses() {
        let dir = tempfile::tempdir().unwrap();
        let err = run(
            &TrashArgs {
                command: TrashCommand::Empty { force: false },
            },
            dir.path(),
        )
        .unwrap_err();
        assert!(err.to_string().contains("--force"), "{err}");
    }
}
