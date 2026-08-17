//! Cross-process schedule lock (FR3.5, HM-F10 half).
//!
//! Two scheduler processes pointed at the same schedule set must not both
//! fire it: acquisition takes an exclusive `flock` on a lock file. The
//! lock is advisory and process-lifetime scoped — when the holder dies
//! (even `kill -9`), the kernel drops the lock and the next scheduler
//! acquires. `acquire` returning `None` means "someone else is running
//! it"; the caller backs off instead of double-firing.

use std::fs::{File, OpenOptions};
use std::io;
use std::path::{Path, PathBuf};

use fs2::FileExt;

pub struct ScheduleLock {
    file: File,
    path: PathBuf,
}

impl ScheduleLock {
    /// Try to take the exclusive lock. `Ok(None)` = held elsewhere.
    pub fn acquire(path: impl AsRef<Path>) -> io::Result<Option<Self>> {
        let path = path.as_ref().to_path_buf();
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        let file = OpenOptions::new().create(true).write(true).open(&path)?;
        match file.try_lock_exclusive() {
            Ok(()) => Ok(Some(Self { file, path })),
            Err(err) if err.kind() == io::ErrorKind::WouldBlock => Ok(None),
            Err(err) => Err(err),
        }
    }

    pub fn path(&self) -> &Path {
        &self.path
    }
}

impl Drop for ScheduleLock {
    fn drop(&mut self) {
        // Unlock explicitly; closing the file would release it anyway.
        let _ = fs2::FileExt::unlock(&self.file);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn second_acquirer_is_refused_while_held() {
        let dir = tempfile::tempdir().unwrap();
        let lock_path = dir.path().join("schedule.lock");

        let first = ScheduleLock::acquire(&lock_path).unwrap();
        assert!(first.is_some(), "first acquisition must succeed");

        // A second, independent file description on the same path is
        // refused while the first holds the lock.
        let second = ScheduleLock::acquire(&lock_path).unwrap();
        assert!(second.is_none(), "lock must be exclusive");

        // Drop the holder: the lock becomes available again.
        drop(first);
        let third = ScheduleLock::acquire(&lock_path).unwrap();
        assert!(third.is_some(), "lock must be released on drop");
    }

    #[test]
    fn acquire_creates_parent_dirs() {
        let dir = tempfile::tempdir().unwrap();
        let nested = dir.path().join("a/b/c/schedule.lock");
        let lock = ScheduleLock::acquire(&nested).unwrap();
        assert!(lock.is_some());
        assert!(nested.exists());
    }
}
