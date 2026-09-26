//! Trash (W-9): deletions are recoverable until explicitly emptied.
//!
//! A [`TrashStore`] owns one directory (conventionally
//! `$NOFY_HOME/trash`): staged copies live under `stage/`, and an
//! append-only `manifest.jsonl` records every lifecycle event —
//! `added`, `restored`, `emptied` — with the same fold discipline as the
//! other durable logs (torn tail truncates, never errors). `list` is the
//! fold projection: added minus restored minus emptied.
//!
//! Restore is fail-loud: an original path that exists again is never
//! overwritten — the caller decides, not the trash.

use std::fs;
use std::io;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

/// One lifecycle event in the trash manifest.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum TrashEvent {
    /// A path moved into the trash.
    Added {
        id: String,
        original_path: String,
        /// File name inside `stage/`.
        staged: String,
        deleted_at: u64,
        size: u64,
    },
    /// A staged entry moved back to its original path.
    Restored { id: String },
    /// The whole trash emptied (staged copies physically removed).
    Emptied {},
}

/// One live (recoverable) trash entry — the fold projection.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TrashEntry {
    pub id: String,
    pub original_path: String,
    pub staged: String,
    pub deleted_at: u64,
    pub size: u64,
}

/// Parse a manifest, tolerating a torn tail (single writer, append-only:
/// only the tail can corrupt).
pub fn parse_manifest(text: &str) -> Vec<TrashEvent> {
    let mut events = Vec::new();
    for line in text.lines() {
        if line.trim().is_empty() {
            continue;
        }
        match serde_json::from_str::<TrashEvent>(line) {
            Ok(event) => events.push(event),
            Err(_) => break,
        }
    }
    events
}

/// Fold manifest events into live entries (insertion order preserved).
pub fn fold(events: &[TrashEvent]) -> Vec<TrashEntry> {
    let mut live: Vec<TrashEntry> = Vec::new();
    for event in events {
        match event {
            TrashEvent::Added {
                id,
                original_path,
                staged,
                deleted_at,
                size,
            } => live.push(TrashEntry {
                id: id.clone(),
                original_path: original_path.clone(),
                staged: staged.clone(),
                deleted_at: *deleted_at,
                size: *size,
            }),
            TrashEvent::Restored { id } => live.retain(|e| &e.id != id),
            TrashEvent::Emptied {} => live.clear(),
        }
    }
    live
}

/// Collision-safe staged file name: `<stem>-<id><ext>`.
fn staged_name(original: &Path, id: &str) -> String {
    let stem = original
        .file_stem()
        .map(|s| s.to_string_lossy().into_owned())
        .unwrap_or_else(|| "item".into());
    match original
        .extension()
        .map(|e| e.to_string_lossy().into_owned())
    {
        Some(ext) if !ext.is_empty() => format!("{stem}-{id}.{ext}"),
        _ => format!("{stem}-{id}"),
    }
}

/// Directory size in bytes (regular files only, recursive; read errors
/// degrade to a partial count — size is advisory).
fn dir_size(path: &Path) -> u64 {
    let mut total = 0;
    let mut stack = vec![path.to_path_buf()];
    while let Some(next) = stack.pop() {
        let Ok(meta) = fs::symlink_metadata(&next) else {
            continue;
        };
        if meta.is_dir() {
            if let Ok(entries) = fs::read_dir(&next) {
                for entry in entries.flatten() {
                    stack.push(entry.path());
                }
            }
        } else {
            total += meta.len();
        }
    }
    total
}

/// The on-disk trash. All operations are fail-loud.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TrashStore {
    root: PathBuf,
}

impl TrashStore {
    pub fn at(root: impl Into<PathBuf>) -> Self {
        Self { root: root.into() }
    }

    pub fn root(&self) -> &Path {
        &self.root
    }

    pub fn stage_dir(&self) -> PathBuf {
        self.root.join("stage")
    }

    fn manifest_path(&self) -> PathBuf {
        self.root.join("manifest.jsonl")
    }

    fn append(&self, event: &TrashEvent) -> io::Result<()> {
        fs::create_dir_all(&self.root)?;
        let mut file = fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(self.manifest_path())?;
        use std::io::Write;
        let mut line = serde_json::to_string(event).expect("trash event serializes");
        line.push('\n');
        file.write_all(line.as_bytes())?;
        file.sync_data()?;
        Ok(())
    }

    /// Move `path` into the trash. The entry id is the staged suffix —
    /// short, unique, and stable. Directories move whole. The recorded
    /// original path is ABSOLUTE: a restore must land where the file
    /// lived, not where the restoring process happens to run.
    pub fn add(&self, path: &Path, now: u64) -> io::Result<TrashEntry> {
        let meta = fs::symlink_metadata(path)?;
        let size = if meta.is_dir() {
            dir_size(path)
        } else {
            meta.len()
        };
        let original = dunce::canonicalize(path).unwrap_or_else(|_| path.to_path_buf());
        fs::create_dir_all(self.stage_dir())?;
        // Unique id: second + pid + a counter against existing entries.
        let existing: std::collections::BTreeSet<String> =
            self.list().into_iter().map(|e| e.id).collect();
        let mut counter = 0u32;
        let id = loop {
            let candidate = format!("{now}-{}-{counter}", std::process::id());
            if !existing.contains(&candidate) {
                break candidate;
            }
            counter += 1;
        };
        let staged = staged_name(path, &id);
        fs::rename(path, self.stage_dir().join(&staged)).or_else(|e| {
            // Cross-device rename: fall back to copy+remove for files.
            if meta.is_file() {
                fs::copy(path, self.stage_dir().join(&staged))?;
                fs::remove_file(path)?;
                Ok(())
            } else {
                Err(e)
            }
        })?;
        let entry = TrashEntry {
            id: id.clone(),
            original_path: original.to_string_lossy().into_owned(),
            staged: staged.clone(),
            deleted_at: now,
            size,
        };
        self.append(&TrashEvent::Added {
            id,
            original_path: entry.original_path.clone(),
            staged,
            deleted_at: now,
            size,
        })?;
        Ok(entry)
    }

    /// Live entries: the manifest fold.
    pub fn list(&self) -> Vec<TrashEntry> {
        let text = fs::read_to_string(self.manifest_path()).unwrap_or_default();
        fold(&parse_manifest(&text))
    }

    /// Move one entry back to its original path. Fails loud when the
    /// entry is unknown, the staged copy is gone, or the original path
    /// is occupied again (never overwrite).
    pub fn restore(&self, id: &str) -> io::Result<PathBuf> {
        let entry = self
            .list()
            .into_iter()
            .find(|e| e.id == id)
            .ok_or_else(|| {
                io::Error::new(
                    io::ErrorKind::NotFound,
                    format!("no live trash entry with id '{id}'"),
                )
            })?;
        let staged_path = self.stage_dir().join(&entry.staged);
        if !staged_path.exists() {
            return Err(io::Error::new(
                io::ErrorKind::NotFound,
                format!("staged copy for '{id}' is missing"),
            ));
        }
        let original = PathBuf::from(&entry.original_path);
        if original.exists() {
            return Err(io::Error::new(
                io::ErrorKind::AlreadyExists,
                format!(
                    "original path '{}' exists again; refusing to overwrite",
                    entry.original_path
                ),
            ));
        }
        if let Some(parent) = original.parent() {
            fs::create_dir_all(parent)?;
        }
        fs::rename(&staged_path, &original).or_else(|_| {
            // Cross-device fallback for regular files.
            if staged_path.is_file() {
                fs::copy(&staged_path, &original)?;
                fs::remove_file(&staged_path)?;
                Ok(())
            } else {
                Err(io::Error::new(
                    io::ErrorKind::Other,
                    "cannot restore directory across devices",
                ))
            }
        })?;
        self.append(&TrashEvent::Restored { id: id.to_string() })?;
        Ok(original)
    }

    /// Physically remove every staged copy and seal the manifest with an
    /// `emptied` event. Returns how many live entries were removed.
    pub fn empty(&self) -> io::Result<usize> {
        let live = self.list();
        for entry in &live {
            let staged_path = self.stage_dir().join(&entry.staged);
            if staged_path.is_dir() {
                fs::remove_dir_all(&staged_path).ok();
            } else {
                fs::remove_file(&staged_path).ok();
            }
        }
        if !live.is_empty() {
            self.append(&TrashEvent::Emptied {})?;
        }
        Ok(live.len())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn add_list_restore_roundtrip() {
        let dir = tempfile::tempdir().unwrap();
        let trash = TrashStore::at(dir.path().join("trash"));
        let victim = dir.path().join("notes.txt");
        fs::write(&victim, "keep me").unwrap();
        let canonical_victim = dunce::canonicalize(&victim).unwrap();

        let entry = trash.add(&victim, 100).unwrap();
        assert!(!victim.exists(), "the path left its place");
        assert_eq!(entry.size, 7);
        assert_eq!(trash.list().len(), 1);

        let restored = trash.restore(&entry.id).unwrap();
        assert_eq!(restored, canonical_victim);
        assert_eq!(fs::read_to_string(&victim).unwrap(), "keep me");
        assert!(trash.list().is_empty(), "restored entries leave the list");
    }

    #[test]
    fn directories_move_whole() {
        let dir = tempfile::tempdir().unwrap();
        let trash = TrashStore::at(dir.path().join("trash"));
        let subtree = dir.path().join("proj");
        fs::create_dir_all(subtree.join("inner")).unwrap();
        fs::write(subtree.join("inner/a.txt"), "aa").unwrap();

        let entry = trash.add(&subtree, 200).unwrap();
        assert_eq!(entry.size, 2);
        let restored = trash.restore(&entry.id).unwrap();
        assert_eq!(
            fs::read_to_string(restored.join("inner/a.txt")).unwrap(),
            "aa"
        );
    }

    #[test]
    fn restore_refuses_occupied_original() {
        let dir = tempfile::tempdir().unwrap();
        let trash = TrashStore::at(dir.path().join("trash"));
        let victim = dir.path().join("x.txt");
        fs::write(&victim, "one").unwrap();
        let entry = trash.add(&victim, 300).unwrap();
        fs::write(&victim, "someone came back").unwrap();
        let err = trash.restore(&entry.id).unwrap_err();
        assert_eq!(err.kind(), io::ErrorKind::AlreadyExists);
        assert_eq!(fs::read_to_string(&victim).unwrap(), "someone came back");
        assert_eq!(trash.list().len(), 1, "the entry stays recoverable");
    }

    #[test]
    fn restore_unknown_or_missing_fails_loud() {
        let dir = tempfile::tempdir().unwrap();
        let trash = TrashStore::at(dir.path().join("trash"));
        assert_eq!(
            trash.restore("ghost").unwrap_err().kind(),
            io::ErrorKind::NotFound
        );
        let victim = dir.path().join("y.txt");
        fs::write(&victim, "y").unwrap();
        let entry = trash.add(&victim, 400).unwrap();
        fs::remove_file(trash.stage_dir().join(&entry.staged)).unwrap();
        assert_eq!(
            trash.restore(&entry.id).unwrap_err().kind(),
            io::ErrorKind::NotFound,
            "a vanished staged copy is named, not silent"
        );
    }

    #[test]
    fn empty_removes_staged_and_seals_the_manifest() {
        let dir = tempfile::tempdir().unwrap();
        let trash = TrashStore::at(dir.path().join("trash"));
        for name in ["a.txt", "b.txt"] {
            let p = dir.path().join(name);
            fs::write(&p, name).unwrap();
            trash.add(&p, 500).unwrap();
        }
        assert_eq!(trash.empty().unwrap(), 2);
        assert!(trash.list().is_empty());
        let leftovers: Vec<_> = fs::read_dir(trash.stage_dir())
            .map(|e| e.flatten().collect())
            .unwrap_or_default();
        assert!(leftovers.is_empty(), "stage is physically cleared");
        // Post-empty adds start fresh.
        let p = dir.path().join("c.txt");
        fs::write(&p, "c").unwrap();
        trash.add(&p, 600).unwrap();
        assert_eq!(trash.list().len(), 1);
    }

    #[test]
    fn manifest_fold_is_torn_tail_tolerant() {
        let events = vec![
            TrashEvent::Added {
                id: "1-a".into(),
                original_path: "/tmp/a".into(),
                staged: "a-1-a".into(),
                deleted_at: 1,
                size: 1,
            },
            TrashEvent::Restored { id: "1-a".into() },
        ];
        let mut text = String::new();
        for e in &events {
            text.push_str(&serde_json::to_string(e).unwrap());
            text.push('\n');
        }
        text.push_str("{\"kind\":\"add"); // torn write
        assert_eq!(parse_manifest(&text), events);
        assert!(fold(&events).is_empty());
    }

    #[test]
    fn ids_are_unique_within_a_second() {
        let dir = tempfile::tempdir().unwrap();
        let trash = TrashStore::at(dir.path().join("trash"));
        let mut ids = std::collections::BTreeSet::new();
        for i in 0..3 {
            let p = dir.path().join(format!("f{i}.txt"));
            fs::write(&p, "x").unwrap();
            let entry = trash.add(&p, 700).unwrap();
            assert!(ids.insert(entry.id), "ids never collide");
        }
        assert_eq!(trash.list().len(), 3);
    }

    #[test]
    fn relative_paths_are_recorded_absolute() {
        // A restore must land where the file LIVED, not where the
        // restoring process happens to run — original paths are absolute.
        let dir = tempfile::tempdir().unwrap();
        let trash = TrashStore::at(dir.path().join("trash"));
        let victim = dir.path().join("rel.txt");
        fs::write(&victim, "relative").unwrap();
        let canonical_victim = dunce::canonicalize(&victim).unwrap();
        // Add via a relative path from inside the temp dir.
        let saved_cwd = std::env::current_dir().unwrap();
        std::env::set_current_dir(dir.path()).unwrap();
        let entry = TrashStore::at(dir.path().join("trash"))
            .add(Path::new("rel.txt"), 800)
            .unwrap();
        std::env::set_current_dir(&saved_cwd).unwrap();
        assert!(
            Path::new(&entry.original_path).is_absolute(),
            "the recorded path is absolute: {}",
            entry.original_path
        );
        // Restore from ANY cwd lands at the true original location.
        let restored = trash.restore(&entry.id).unwrap();
        assert_eq!(restored, canonical_victim);
        assert_eq!(fs::read_to_string(&victim).unwrap(), "relative");
    }
}
