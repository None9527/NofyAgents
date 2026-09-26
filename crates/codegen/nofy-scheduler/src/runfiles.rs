//! Heartbeat/success double files (FR3.5, HM-F10 half).
//!
//! After every run attempt the engine writes TWO files per schedule:
//! `{id}.heartbeat` (last attempt, any outcome) and `{id}.success` (last
//! success). An external watchdog can tell a wedged run (heartbeat fresh,
//! success stale) from a dead scheduler (heartbeat stale) without any
//! protocol. Writes are atomic (temp + rename) and ids are sanitized so a
//! schedule id can never escape the directory.

use std::fs;
use std::io;
use std::path::{Path, PathBuf};

/// Sanitize a schedule id into a safe file stem: alnum/`-`/`_` kept,
/// anything else (notably `/` and `..`) replaced with `_`.
pub fn safe_stem(id: &str) -> String {
    id.chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || c == '-' || c == '_' {
                c
            } else {
                '_'
            }
        })
        .collect()
}

pub struct RunFiles {
    dir: PathBuf,
}

impl RunFiles {
    pub fn new(dir: impl Into<PathBuf>) -> Self {
        Self { dir: dir.into() }
    }

    fn path(&self, id: &str, suffix: &str) -> PathBuf {
        self.dir.join(format!("{}.{}", safe_stem(id), suffix))
    }

    /// Atomic write: temp file in the same directory + rename.
    fn atomic_write(path: &Path, contents: &str) -> io::Result<()> {
        let tmp = path.with_extension("tmp");
        fs::write(&tmp, contents)?;
        fs::rename(&tmp, path)?;
        Ok(())
    }

    /// Record an attempt (any outcome).
    pub fn write_heartbeat(&self, id: &str, timestamp_secs: u64) -> io::Result<()> {
        fs::create_dir_all(&self.dir)?;
        Self::atomic_write(&self.path(id, "heartbeat"), &timestamp_secs.to_string())
    }

    /// Record a success.
    pub fn write_success(&self, id: &str, timestamp_secs: u64) -> io::Result<()> {
        fs::create_dir_all(&self.dir)?;
        Self::atomic_write(&self.path(id, "success"), &timestamp_secs.to_string())
    }

    pub fn read_heartbeat(&self, id: &str) -> io::Result<Option<u64>> {
        Self::read(&self.path(id, "heartbeat"))
    }

    pub fn read_success(&self, id: &str) -> io::Result<Option<u64>> {
        Self::read(&self.path(id, "success"))
    }

    fn read(path: &Path) -> io::Result<Option<u64>> {
        match fs::read_to_string(path) {
            Ok(text) => Ok(text.trim().parse().ok()),
            Err(err) if err.kind() == io::ErrorKind::NotFound => Ok(None),
            Err(err) => Err(err),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn double_files_track_attempt_and_success_separately() {
        let dir = tempfile::tempdir().unwrap();
        let files = RunFiles::new(dir.path());

        assert_eq!(files.read_heartbeat("nightly").unwrap(), None);
        files.write_heartbeat("nightly", 100).unwrap();
        assert_eq!(files.read_heartbeat("nightly").unwrap(), Some(100));
        assert_eq!(
            files.read_success("nightly").unwrap(),
            None,
            "attempt is not success"
        );

        files.write_success("nightly", 105).unwrap();
        assert_eq!(files.read_success("nightly").unwrap(), Some(105));

        // Failed retry: heartbeat advances, success stays.
        files.write_heartbeat("nightly", 200).unwrap();
        assert_eq!(files.read_heartbeat("nightly").unwrap(), Some(200));
        assert_eq!(files.read_success("nightly").unwrap(), Some(105));
    }

    #[test]
    fn ids_cannot_escape_the_directory() {
        assert_eq!(safe_stem("../../etc/passwd"), "______etc_passwd");
        assert_eq!(safe_stem("a/b\\c"), "a_b_c");
        assert_eq!(safe_stem("ok-id_1"), "ok-id_1");

        let dir = tempfile::tempdir().unwrap();
        let files = RunFiles::new(dir.path());
        files.write_heartbeat("../evil", 1).unwrap();
        // The file lands INSIDE the directory under the sanitized stem.
        assert!(dir.path().join("___evil.heartbeat").exists());
        assert_eq!(files.read_heartbeat("../evil").unwrap(), Some(1));
    }

    #[test]
    fn overwrite_is_atomic_shaped() {
        let dir = tempfile::tempdir().unwrap();
        let files = RunFiles::new(dir.path());
        for ts in [1, 2, 3] {
            files.write_heartbeat("x", ts).unwrap();
        }
        assert_eq!(files.read_heartbeat("x").unwrap(), Some(3));
        // No temp litter left behind.
        let leftovers: Vec<_> = fs::read_dir(dir.path())
            .unwrap()
            .filter_map(|e| e.ok())
            .filter(|e| e.path().extension().is_some_and(|x| x == "tmp"))
            .collect();
        assert!(leftovers.is_empty());
    }

    #[test]
    fn read_errors_other_than_missing_propagate() {
        let dir = tempfile::tempdir().unwrap();
        let files = RunFiles::new(dir.path());
        // File slot occupied by a DIRECTORY: read fails, not NotFound.
        fs::create_dir_all(dir.path().join("nightly.heartbeat")).unwrap();
        let err = files.read_heartbeat("nightly").unwrap_err();
        assert_ne!(err.kind(), io::ErrorKind::NotFound);
    }
}
