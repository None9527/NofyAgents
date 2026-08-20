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

    #[test]
    fn parentless_path_surfaces_the_open_error() {
        // A path with no parent skips create_dir_all; open("") fails.
        let err = ScheduleLock::acquire("")
            .err()
            .expect("parentless path cannot open");
        assert_eq!(err.kind(), io::ErrorKind::NotFound);
    }

    #[test]
    fn parent_creation_failure_propagates() {
        let dir = tempfile::tempdir().unwrap();
        let blocker = dir.path().join("blocker");
        std::fs::write(&blocker, "x").unwrap();
        // Parent path occupied by a regular file: create_dir_all fails.
        assert!(ScheduleLock::acquire(blocker.join("schedule.lock")).is_err());
    }

    #[test]
    fn path_accessor_returns_the_lock_path() {
        let dir = tempfile::tempdir().unwrap();
        let lock_path = dir.path().join("schedule.lock");
        let lock = ScheduleLock::acquire(&lock_path)
            .unwrap()
            .expect("free lock acquires");
        assert_eq!(lock.path(), lock_path);
    }

    #[test]
    fn every_path_type_walks_the_full_happy_path() {
        let dir = tempfile::tempdir().unwrap();
        // Owned PathBuf and borrowed &str instantiations both acquire.
        let owned = dir.path().join("owned.lock");
        let lock = ScheduleLock::acquire(owned.clone())
            .unwrap()
            .expect("free lock acquires");
        assert_eq!(lock.path(), owned);
        drop(lock);
        let borrowed: &str = owned.to_str().unwrap();
        assert!(ScheduleLock::acquire(borrowed).unwrap().is_some());
    }

    #[test]
    fn every_path_type_sees_each_reachable_error_branch() {
        let dir = tempfile::tempdir().unwrap();
        let blocker = dir.path().join("blocker");
        std::fs::write(&blocker, "x").unwrap();
        // Owned PathBuf: open failure (parentless), create_dir_all failure.
        assert!(ScheduleLock::acquire(PathBuf::from("")).is_err());
        assert!(ScheduleLock::acquire(blocker.join("schedule.lock")).is_err());
        // Borrowed &PathBuf: same two failure shapes.
        let empty = PathBuf::new();
        assert!(ScheduleLock::acquire(&empty).is_err());
        let blocked_ref = blocker.join("schedule.lock");
        assert!(ScheduleLock::acquire(&blocked_ref).is_err());
        // Borrowed &str: create_dir_all failure.
        let blocked_path = blocker.join("schedule.lock");
        let blocked: &str = blocked_path.to_str().unwrap();
        assert!(ScheduleLock::acquire(blocked).is_err());
        // Refusal while held, once per path type.
        let held_path = dir.path().join("held.lock");
        let held = ScheduleLock::acquire(held_path.clone())
            .unwrap()
            .expect("free lock acquires");
        assert!(ScheduleLock::acquire(held_path.clone()).unwrap().is_none());
        assert!(ScheduleLock::acquire(&held_path).unwrap().is_none());
        let held_str: &str = held_path.to_str().unwrap();
        assert!(ScheduleLock::acquire(held_str).unwrap().is_none());
        drop(held);
    }
}
