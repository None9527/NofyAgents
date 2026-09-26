//! Run store (integration batch S): durable manifest persistence so a
//! submitted run survives a daemon restart.
//!
//! The journal (batch R) records PROGRESS; the run store records the
//! PLAN (manifest + packs). Together they make full run resumption
//! possible: after a crash the plan reloads from here, progress replays
//! from the journal through the core replay fold (FR11.3).
//!
//! Writes are atomic (tmp file + rename): a crash mid-write can never
//! leave a torn plan behind.

use std::io::Write;
use std::path::{Path, PathBuf};

/// One stored run: everything needed to rebuild a `DaemonRun`.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct StoredRun {
    pub manifest_toml: String,
    pub packs: Vec<serde_json::Value>,
    /// Project routing (W-2): survives crash resumption with the plan.
    #[serde(default)]
    pub cwd: Option<String>,
}

/// Thin on-disk layer for the current run plan.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RunStore {
    path: PathBuf,
}

impl RunStore {
    pub fn open(path: impl Into<PathBuf>) -> Self {
        Self { path: path.into() }
    }

    pub fn path(&self) -> &Path {
        &self.path
    }

    /// Save the plan ATOMICALLY: write a sibling tmp file, sync it, then
    /// rename over the target. A crash at any point leaves either the old
    /// plan or the new one — never a torn file.
    pub fn save(&self, run: &StoredRun) -> std::io::Result<()> {
        let tmp = self.path.with_extension("json.tmp");
        let bytes = serde_json::to_vec(run).expect("stored run serializes");
        {
            let mut file = std::fs::File::create(&tmp)?;
            file.write_all(&bytes)?;
            file.sync_all()?;
        }
        std::fs::rename(&tmp, &self.path)?;
        Ok(())
    }

    /// Load the current plan. `None` when no run is stored (fresh boot).
    /// A corrupt file is an error — the plan is small and precious;
    /// silently dropping it would resurrect nothing while claiming a
    /// clean boot.
    pub fn load(&self) -> std::io::Result<Option<StoredRun>> {
        match std::fs::read_to_string(&self.path) {
            Ok(text) => serde_json::from_str(&text)
                .map(Some)
                .map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidData, e)),
            Err(err) if err.kind() == std::io::ErrorKind::NotFound => Ok(None),
            Err(err) => Err(err),
        }
    }

    /// Remove the stored plan (run completed or aborted).
    pub fn clear(&self) -> std::io::Result<()> {
        match std::fs::remove_file(&self.path) {
            Ok(()) => Ok(()),
            Err(err) if err.kind() == std::io::ErrorKind::NotFound => Ok(()),
            Err(err) => Err(err),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn stored() -> StoredRun {
        StoredRun {
            manifest_toml: "packs = [\"p\"]\n\n[[task]]\nid = \"t1\"\npack = \"p\"\ngoal = \"g\"\n"
                .into(),
            packs: vec![serde_json::json!({"id": "p", "persona": "x"})],
            cwd: None,
        }
    }

    #[test]
    fn save_load_clear_roundtrip() {
        let dir = tempfile::tempdir().unwrap();
        let store = RunStore::open(dir.path().join("run.json"));
        assert_eq!(store.load().unwrap(), None, "fresh boot has no stored run");
        store.save(&stored()).unwrap();
        assert_eq!(store.load().unwrap(), Some(stored()));
        store.clear().unwrap();
        assert_eq!(store.load().unwrap(), None);
        // Clearing twice is fine.
        store.clear().unwrap();
    }

    #[test]
    fn save_is_atomic_no_tmp_left_behind() {
        let dir = tempfile::tempdir().unwrap();
        let store = RunStore::open(dir.path().join("run.json"));
        store.save(&stored()).unwrap();
        // The rename consumed the tmp file.
        assert!(!dir.path().join("run.json.tmp").exists());
        // A second save replaces cleanly.
        let mut next = stored();
        next.manifest_toml = "packs = []".into();
        store.save(&next).unwrap();
        assert_eq!(store.load().unwrap(), Some(next));
    }

    #[test]
    fn corrupt_plan_fails_loud() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("run.json");
        std::fs::write(&path, "{ not json").unwrap();
        let store = RunStore::open(&path);
        assert!(
            store.load().is_err(),
            "a torn plan must surface, never vanish"
        );
    }

    #[test]
    fn path_accessor_exposes_the_store_location() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("run.json");
        let store = RunStore::open(&path);
        assert_eq!(store.path(), path.as_path());
    }

    #[test]
    fn load_and_clear_fail_loud_on_directory_paths() {
        // A directory where the plan file belongs: both reads and deletes
        // fail with a real io error (never NotFound), so they surface.
        let dir = tempfile::tempdir().unwrap();
        let store = RunStore::open(dir.path());
        assert!(store.load().is_err());
        assert!(store.clear().is_err());
    }
}
