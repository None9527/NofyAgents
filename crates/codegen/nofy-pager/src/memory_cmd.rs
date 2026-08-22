use std::io::Write;
use std::path::PathBuf;

use anyhow::{bail, Result};
use clap::Subcommand;
use nofy_shell::session::memory::storage::MemoryStorage;
use serde::{Deserialize, Serialize};

#[derive(Debug, clap::Args, Clone)]
pub struct MemoryArgs {
    #[command(subcommand)]
    pub command: MemoryCommand,
}

#[derive(Debug, Subcommand, Clone)]
pub enum MemoryCommand {
    /// Clear memory files (workspace by default)
    Clear {
        /// Clear workspace-scoped memory (MEMORY.md, sessions/, index.sqlite)
        #[arg(long, group = "scope")]
        workspace: bool,
        /// Clear global MEMORY.md
        #[arg(long, group = "scope")]
        global: bool,
        /// Clear both workspace and global memory
        #[arg(long, group = "scope")]
        all: bool,
        /// Skip confirmation prompt
        #[arg(long, short = 'y')]
        yes: bool,
    },
    /// Register a directory as a managed knowledge root (U9-05). New
    /// roots are read-only by default: nofy indexes them but never
    /// modifies their files.
    AddDir {
        /// Directory to manage.
        path: PathBuf,
    },
    /// List managed knowledge roots and their modes.
    Dirs,
    /// Unregister a managed knowledge root (files stay untouched).
    RemoveDir {
        /// Directory to stop managing.
        path: PathBuf,
    },
}

/// One managed knowledge root (FR12.1/AC-12: an unselected root gets
/// zero indexing; a new root starts read-only).
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ManagedRoot {
    pub path: String,
    /// `read-only` = indexed, never modified by nofy (the only mode a
    /// new root can start in).
    pub mode: String,
    pub added_at: u64,
}

fn roots_file() -> PathBuf {
    nofy_shell::util::nofy_home::nofy_home()
        .join("memory")
        .join("roots.json")
}

fn load_roots(file: &std::path::Path) -> Result<Vec<ManagedRoot>> {
    if !file.exists() {
        return Ok(Vec::new());
    }
    let raw = std::fs::read_to_string(file)?;
    serde_json::from_str(&raw)
        .map_err(|e| anyhow::anyhow!("{} is corrupt: {e}", file.display()))
}

fn save_roots(file: &std::path::Path, roots: &[ManagedRoot]) -> Result<()> {
    if let Some(parent) = file.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let tmp = file.with_extension("json.tmp");
    std::fs::write(&tmp, serde_json::to_string_pretty(roots)?)?;
    std::fs::rename(&tmp, file)?;
    Ok(())
}

/// Register a directory as a managed root; new roots start read-only.
/// Returns a human-readable outcome line.
fn add_root(file: &std::path::Path, path: &std::path::Path) -> Result<String> {
    let abs = std::fs::canonicalize(path)
        .map_err(|e| anyhow::anyhow!("cannot manage {}: {e}", path.display()))?;
    if !abs.is_dir() {
        bail!("{} is not a directory", abs.display());
    }
    let key = abs.to_string_lossy().into_owned();
    let mut roots = load_roots(file)?;
    if roots.iter().any(|r| r.path == key) {
        return Ok(format!("already managed: {key}"));
    }
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    roots.push(ManagedRoot {
        path: key.clone(),
        mode: "read-only".to_string(),
        added_at: now,
    });
    save_roots(file, &roots)?;
    Ok(format!("managed: {key} (read-only: indexed, never modified by nofy)"))
}

/// Unregister a managed root; the files themselves stay untouched.
/// Returns a human-readable outcome line.
fn remove_root(file: &std::path::Path, path: &std::path::Path) -> Result<String> {
    let abs = std::fs::canonicalize(path)
        .map_err(|e| anyhow::anyhow!("cannot resolve {}: {e}", path.display()))?;
    let key = abs.to_string_lossy().into_owned();
    let mut roots = load_roots(file)?;
    let before = roots.len();
    roots.retain(|r| r.path != key);
    if roots.len() == before {
        bail!("{key} is not a managed root");
    }
    save_roots(file, &roots)?;
    Ok(format!("no longer managed: {key} (files left untouched)"))
}

struct ClearTarget {
    label: &'static str,
    path: PathBuf,
    clear: fn(&MemoryStorage) -> std::io::Result<bool>,
}

fn workspace_target(storage: &MemoryStorage) -> ClearTarget {
    ClearTarget {
        label: "workspace memory",
        path: storage.workspace_dir().to_path_buf(),
        clear: |s| s.clear_workspace(),
    }
}

fn global_target(storage: &MemoryStorage) -> ClearTarget {
    ClearTarget {
        label: "global MEMORY.md",
        path: storage.global_memory_file(),
        clear: |s| s.clear_global(),
    }
}

pub fn run(args: MemoryArgs) -> Result<()> {
    match args.command {
        MemoryCommand::Clear {
            global, all, yes, ..
        } => {
            let cwd = std::env::current_dir().unwrap_or_else(|_| ".".into());
            let storage = MemoryStorage::new(&cwd, None);

            let targets = if all {
                vec![workspace_target(&storage), global_target(&storage)]
            } else if global {
                vec![global_target(&storage)]
            } else {
                vec![workspace_target(&storage)]
            };

            run_clear(&storage, &targets, yes)
        }
        MemoryCommand::AddDir { path } => {
            println!("{}", add_root(&roots_file(), &path)?);
            Ok(())
        }
        MemoryCommand::Dirs => {
            let roots = load_roots(&roots_file())?;
            if roots.is_empty() {
                println!("(no managed roots; add one with `nofy memory add-dir <path>`)");
                return Ok(());
            }
            println!("{:<60} {:<10}", "ROOT", "MODE");
            for root in &roots {
                println!("{:<60} {:<10}", root.path, root.mode);
            }
            Ok(())
        }
        MemoryCommand::RemoveDir { path } => {
            println!("{}", remove_root(&roots_file(), &path)?);
            Ok(())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn add_root_starts_read_only_and_dedupes() {
        let dir = tempfile::tempdir().unwrap();
        let file = dir.path().join("memory/roots.json");
        let target = dir.path().join("knowledge");
        std::fs::create_dir(&target).unwrap();

        let msg = add_root(&file, &target).unwrap();
        assert!(msg.contains("read-only"), "{msg}");

        let roots = load_roots(&file).unwrap();
        assert_eq!(roots.len(), 1);
        assert_eq!(roots[0].mode, "read-only");
        assert_eq!(roots[0].path, target.to_string_lossy());

        // Second add is a no-op, not a duplicate.
        let again = add_root(&file, &target).unwrap();
        assert!(again.starts_with("already managed"), "{again}");
        assert_eq!(load_roots(&file).unwrap().len(), 1);
    }

    #[test]
    fn add_root_refuses_files_and_missing_paths() {
        let dir = tempfile::tempdir().unwrap();
        let file = dir.path().join("roots.json");
        let plain = dir.path().join("plain.txt");
        std::fs::write(&plain, "x").unwrap();

        assert!(add_root(&file, &plain).unwrap_err().to_string().contains("not a directory"));
        assert!(add_root(&file, &dir.path().join("nope")).is_err());
    }

    #[test]
    fn remove_root_unregisters_without_touching_files() {
        let dir = tempfile::tempdir().unwrap();
        let file = dir.path().join("roots.json");
        let target = dir.path().join("knowledge");
        std::fs::create_dir(&target).unwrap();
        std::fs::write(target.join("note.md"), "keep me").unwrap();

        add_root(&file, &target).unwrap();
        let msg = remove_root(&file, &target).unwrap();
        assert!(msg.contains("untouched"), "{msg}");
        assert!(load_roots(&file).unwrap().is_empty());
        assert!(target.join("note.md").exists(), "files must stay put");

        // Removing something never managed fails loud.
        let err = remove_root(&file, &target).unwrap_err();
        assert!(err.to_string().contains("not a managed root"), "{err}");
    }
}

fn run_clear(storage: &MemoryStorage, targets: &[ClearTarget], skip_confirm: bool) -> Result<()> {
    let existing: Vec<_> = targets.iter().filter(|t| t.path.exists()).collect();

    if existing.is_empty() {
        println!("Nothing to clear \u{2014} no memory files found.");
        return Ok(());
    }

    println!("The following will be deleted:");
    for t in &existing {
        println!("  {}: {}", t.label, t.path.display());
    }

    if !skip_confirm {
        print!("\nAre you sure? [y/N] ");
        std::io::stdout().flush()?;

        let mut input = String::new();
        std::io::stdin().read_line(&mut input)?;
        if !matches!(input.trim().to_ascii_lowercase().as_str(), "y" | "yes") {
            println!("Cancelled.");
            return Ok(());
        }
    }

    let mut cleared = false;
    let mut errors: Vec<String> = Vec::new();
    for t in targets {
        match (t.clear)(storage) {
            Ok(true) => {
                cleared = true;
                println!("  Cleared: {}", t.label);
            }
            Ok(false) => {} // nothing to clear for this scope
            Err(e) => {
                errors.push(format!("{}: {e}", t.label));
            }
        }
    }

    if cleared && errors.is_empty() {
        println!("Memory cleared.");
    } else if cleared {
        println!("Memory partially cleared. Errors:");
        for e in &errors {
            eprintln!("  {e}");
        }
    } else if !errors.is_empty() {
        eprintln!("Failed to clear memory:");
        for e in &errors {
            eprintln!("  {e}");
        }
        return Err(anyhow::anyhow!("clear failed"));
    }

    Ok(())
}
