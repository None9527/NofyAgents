//! Atomic file writes, shared by the managed-cache marker, the signature
//! sidecar, and downstream identifier caches (e.g. the telemetry agent id).

use std::io;
use std::path::{Path, PathBuf};

#[cfg(not(windows))]
const SYMLINK_FOLLOW_LIMIT: u8 = if cfg!(target_os = "linux") { 40 } else { 32 };

/// Follow parent and leaf file-symlinks up to the kernel hop cap, then
/// tmp+rename the referent so a user symlink into another tree survives.
#[cfg(not(windows))]
pub fn resolve_atomic_destination(path: &Path) -> io::Result<PathBuf> {
    let mut current = if path.is_absolute() {
        path.to_path_buf()
    } else {
        std::env::current_dir()?.join(path)
    };
    let mut hops = 0u8;
    loop {
        if hops >= SYMLINK_FOLLOW_LIMIT {
            return Err(io::Error::new(
                io::ErrorKind::InvalidInput,
                "too many symlink hops",
            ));
        }
        match std::fs::symlink_metadata(&current) {
            Ok(meta) if meta.file_type().is_symlink() => {
                let target = std::fs::read_link(&current)?;
                current = if target.is_absolute() {
                    target
                } else {
                    current
                        .parent()
                        .unwrap_or_else(|| Path::new("."))
                        .join(target)
                };
                hops += 1;
            }
            Ok(_) | Err(_) => return Ok(current),
        }
    }
}

#[cfg(windows)]
pub fn resolve_atomic_destination(path: &Path) -> io::Result<PathBuf> {
    Ok(path.to_path_buf())
}

/// Atomic temp + rename so a torn write can't leave a half-written file. The temp
/// name is unique per writer (pid + counter) and `create_new`, so concurrent
/// writers don't collide. `mode` (unix only) is applied at temp-file creation, so
/// the final file never exists with looser permissions.
pub fn write_atomically(
    final_path: &Path,
    contents: &str,
    mode: Option<u32>,
) -> std::io::Result<()> {
    use std::io::Write as _;
    use std::sync::atomic::{AtomicU64, Ordering};
    static WRITE_NONCE: AtomicU64 = AtomicU64::new(0);

    let final_path = resolve_atomic_destination(final_path)?;
    let dir = final_path.parent().unwrap_or_else(|| Path::new("."));
    let name = final_path
        .file_name()
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_else(|| "file".to_owned());
    let nonce = WRITE_NONCE.fetch_add(1, Ordering::Relaxed);
    let tmp = dir.join(format!("{name}.{}.{nonce}.tmp", std::process::id()));
    let mut options = std::fs::OpenOptions::new();
    options.write(true).create_new(true);
    #[cfg(unix)]
    if let Some(mode) = mode {
        use std::os::unix::fs::OpenOptionsExt as _;
        options.mode(mode);
    }
    #[cfg(not(unix))]
    let _ = mode;
    let result = options.open(&tmp).and_then(|mut f| {
        f.write_all(contents.as_bytes())?;
        f.sync_all()?;
        let created = f.metadata()?;
        #[cfg(all(test, unix))]
        BEFORE_ATOMIC_RENAME.with_borrow_mut(|hook| {
            if let Some(hook) = hook.as_mut() {
                hook(&tmp);
            }
        });
        verify_created_file(&tmp, &created)?;
        std::fs::rename(&tmp, &final_path)?;
        // A competing legitimate writer may already have replaced ours.
        // Report the race, but never remove its successfully committed data.
        verify_created_file(&final_path, &created)
    });
    if result.is_err() {
        let _ = std::fs::remove_file(&tmp);
    }
    result
}

fn verify_created_file(path: &Path, created: &std::fs::Metadata) -> io::Result<()> {
    let landed = std::fs::symlink_metadata(path)?;
    #[cfg(unix)]
    let matches = {
        use std::os::unix::fs::MetadataExt as _;
        landed.is_file() && landed.dev() == created.dev() && landed.ino() == created.ino()
    };
    #[cfg(not(unix))]
    let matches = {
        let _ = created;
        landed.is_file()
    };
    if matches {
        Ok(())
    } else {
        Err(io::Error::new(
            io::ErrorKind::InvalidData,
            "atomic-write temporary file identity changed",
        ))
    }
}

#[cfg(all(test, unix))]
type AtomicRenameHook = Option<Box<dyn FnMut(&Path)>>;
#[cfg(all(test, unix))]
thread_local! {
    static BEFORE_ATOMIC_RENAME: std::cell::RefCell<AtomicRenameHook> = const { std::cell::RefCell::new(None) };
}

#[cfg(all(test, unix))]
mod tests {
    use super::*;
    use std::fs;
    use std::os::unix::fs::symlink;

    #[test]
    fn swapped_temp_regular_file_is_not_published() {
        let dir = tempfile::tempdir().unwrap();
        let dest = dir.path().join("config.json");
        fs::write(&dest, "original").unwrap();
        BEFORE_ATOMIC_RENAME.with_borrow_mut(|hook| {
            *hook = Some(Box::new(|tmp| {
                fs::remove_file(tmp).unwrap();
                fs::write(tmp, "substituted").unwrap();
            }))
        });
        let result = write_atomically(&dest, "intended", Some(0o600));
        BEFORE_ATOMIC_RENAME.with_borrow_mut(|hook| *hook = None);
        assert_eq!(result.unwrap_err().kind(), io::ErrorKind::InvalidData);
        assert_eq!(fs::read_to_string(&dest).unwrap(), "original");
    }

    #[test]
    fn swapped_temp_symlink_never_overwrites_its_target() {
        let dir = tempfile::tempdir().unwrap();
        let victim = dir.path().join("victim.json");
        fs::write(&victim, "protected").unwrap();
        let target = victim.clone();
        BEFORE_ATOMIC_RENAME.with_borrow_mut(|hook| {
            *hook = Some(Box::new(move |tmp| {
                fs::remove_file(tmp).unwrap();
                symlink(&target, tmp).unwrap();
            }))
        });
        let dest = dir.path().join("config.json");
        let result = write_atomically(&dest, "intended", None);
        BEFORE_ATOMIC_RENAME.with_borrow_mut(|hook| *hook = None);
        assert_eq!(result.unwrap_err().kind(), io::ErrorKind::InvalidData);
        assert_eq!(fs::read_to_string(&victim).unwrap(), "protected");
        assert!(!dest.exists());
    }

    #[test]
    fn resolve_atomic_destination_follows_leaf_symlink() {
        let dir = tempfile::tempdir().unwrap();
        let real = dir.path().join("real.json");
        fs::write(&real, b"old").unwrap();
        let link = dir.path().join("link.json");
        symlink(&real, &link).unwrap();
        let dest = resolve_atomic_destination(&link).unwrap();
        assert_eq!(dest, real);
        write_atomically(&link, "new", None).unwrap();
        assert_eq!(fs::read_to_string(&real).unwrap(), "new");
        assert!(link.symlink_metadata().unwrap().file_type().is_symlink());
    }
}
