//! Cross-operation and cross-process exclusion for canonical memory writes.
//! Only synchronous transactions may hold this guard; never hold it over await.

use std::{
    cell::RefCell,
    collections::HashMap,
    fs::{File, OpenOptions},
    io,
    marker::PhantomData,
    path::{Path, PathBuf},
    rc::Rc,
    sync::{Arc, Weak},
    time::{Duration, Instant},
};

thread_local! {
    // Nested access/manifest calls in one synchronous transaction reuse the
    // same descriptor. Weak entries never extend a lock's lifetime.
    static HELD: RefCell<HashMap<PathBuf, Weak<File>>> = RefCell::new(HashMap::new());
}

pub struct ScopeWriteGuard {
    _file: Arc<File>,
    _same_thread: PhantomData<Rc<()>>,
}

impl ScopeWriteGuard {
    pub fn acquire(root: &Path) -> io::Result<Self> {
        Self::acquire_with_timeout(root, Duration::from_secs(5))
    }

    fn acquire_with_timeout(root: &Path, timeout: Duration) -> io::Result<Self> {
        std::fs::create_dir_all(root)?;
        let root = dunce::canonicalize(root)?;
        if let Some(file) = HELD.with_borrow(|held| held.get(&root).and_then(Weak::upgrade)) {
            return Ok(Self {
                _file: file,
                _same_thread: PhantomData,
            });
        }
        let lock_path = root.join(".write.lock");
        let mut options = OpenOptions::new();
        options.read(true).write(true).create(true).truncate(false);
        #[cfg(unix)]
        {
            use std::os::unix::fs::OpenOptionsExt as _;
            options.mode(0o600).custom_flags(nix::libc::O_NOFOLLOW);
        }
        let file = Arc::new(options.open(&lock_path)?);
        if !file.metadata()?.is_file() {
            return Err(io::Error::new(
                io::ErrorKind::InvalidData,
                "memory write lock is not a regular file",
            ));
        }
        let deadline = Instant::now() + timeout;
        loop {
            match file.try_lock() {
                Ok(()) => break,
                Err(std::fs::TryLockError::WouldBlock) if Instant::now() < deadline => {
                    std::thread::sleep(Duration::from_millis(10))
                }
                Err(std::fs::TryLockError::WouldBlock) => {
                    return Err(io::Error::new(
                        io::ErrorKind::WouldBlock,
                        "memory scope is busy; retry later",
                    ));
                }
                Err(std::fs::TryLockError::Error(error)) => return Err(error),
            }
        }
        HELD.with_borrow_mut(|held| {
            held.retain(|_, file| file.strong_count() != 0);
            held.insert(root, Arc::downgrade(&file));
        });
        // Do not unlink .write.lock: changing its inode splits the lock domain.
        Ok(Self {
            _file: file,
            _same_thread: PhantomData,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn nested_guards_same_thread_share_lock_and_different_scopes_do_not_block() {
        let temp = tempfile::tempdir().unwrap();
        let a = temp.path().join("a");
        let outer = ScopeWriteGuard::acquire(&a).unwrap();
        let inner = ScopeWriteGuard::acquire(&a).unwrap();
        assert!(Arc::ptr_eq(&outer._file, &inner._file));
        let _other = ScopeWriteGuard::acquire(&temp.path().join("b")).unwrap();
        drop(outer);
        let worker_root = a.clone();
        let busy = std::thread::spawn(move || {
            ScopeWriteGuard::acquire_with_timeout(&worker_root, Duration::from_millis(20))
                .err()
                .unwrap()
                .kind()
        })
        .join()
        .unwrap();
        assert_eq!(busy, io::ErrorKind::WouldBlock);
        drop(inner);
        std::thread::spawn(move || {
            let _guard = ScopeWriteGuard::acquire(&a).unwrap();
        })
        .join()
        .unwrap();
    }

    #[test]
    #[allow(clippy::disallowed_methods)] // test fixture: the test kills and waits for the child
    fn independent_process_lock_is_released_on_crash() {
        let temp = tempfile::tempdir().unwrap();
        let mut child = std::process::Command::new(std::env::current_exe().unwrap())
            .arg("--exact")
            .arg("scope_write_lock::tests::process_lock_holder")
            .env("NOFY_MEMORY_LOCK_TEST_ROOT", temp.path())
            .stdin(std::process::Stdio::piped())
            .stdout(std::process::Stdio::null())
            .spawn()
            .unwrap();
        let deadline = Instant::now() + Duration::from_secs(5);
        while !temp.path().join("ready").exists() {
            assert!(
                Instant::now() < deadline,
                "child did not acquire scope lock"
            );
            std::thread::sleep(Duration::from_millis(10));
        }
        assert_eq!(
            ScopeWriteGuard::acquire_with_timeout(temp.path(), Duration::from_millis(20))
                .err()
                .unwrap()
                .kind(),
            io::ErrorKind::WouldBlock
        );
        child.kill().unwrap();
        child.wait().unwrap();
        let _guard = ScopeWriteGuard::acquire(temp.path()).unwrap();
        assert!(temp.path().join(".write.lock").exists());
    }

    #[test]
    fn process_lock_holder() {
        let Some(root) = std::env::var_os("NOFY_MEMORY_LOCK_TEST_ROOT") else {
            return;
        };
        let root = PathBuf::from(root);
        let _guard = ScopeWriteGuard::acquire(&root).unwrap();
        std::fs::write(root.join("ready"), b"ready").unwrap();
        use std::io::Read as _;
        let _ = std::io::stdin().read(&mut [0]);
    }
}
