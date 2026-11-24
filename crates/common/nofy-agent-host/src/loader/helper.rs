//! One immutable bootstrap executable, cached only after a complete byte check.
use super::*;
use nofy_host_path::{FileIdentity, FileKind};
use sha2::{Digest, Sha256};
use std::{
    fs::{File, OpenOptions},
    io::{Read, Seek, SeekFrom},
    sync::{Mutex, OnceLock},
};

const MAX_BYTES: u64 = 512 * 1024 * 1024;
const HASH_CHUNK_BYTES: usize = 64 * 1024;

#[derive(Clone, Default)]
pub(super) struct Helper(Arc<OnceLock<Installed>>);

struct Pinned {
    file: File,
    exec_path: PathBuf,
    verified: Option<Stamp>,
}

enum Binding {
    /// Platforms with descriptor-addressed execution pin the verified read-only
    /// open file (`O_RDONLY | O_CLOEXEC`) and launch via its descriptor path
    /// (e.g. `/proc/self/fd/<fd>` on Linux), surviving atomic binary upgrades
    /// on disk without re-opening the replaced path.
    Pinned(Mutex<Pinned>),
    /// Fallback for platforms without descriptor-addressed execution.
    Path {
        path: PathBuf,
        verified: Mutex<Option<Stamp>>,
    },
}

struct Installed {
    digest: String,
    binding: Binding,
    #[cfg(test)]
    reads: std::sync::atomic::AtomicUsize,
}

/// What the helper file was when its bytes were last read in full: the same
/// file, with the same size and times. Any difference sends the next use back
/// to a full streaming check.
#[derive(PartialEq, Eq)]
struct Stamp(FileIdentity);

impl Stamp {
    fn of(identity: FileIdentity) -> Result<Self> {
        if identity.kind() != FileKind::File || identity.len() > MAX_BYTES {
            return Err(changed());
        }
        Ok(Self(identity))
    }
    fn of_file(file: &File) -> Result<Self> {
        Self::of(FileIdentity::of_file(file).map_err(|_| changed())?)
    }
    fn of_path(path: &Path) -> Result<Self> {
        Self::of(FileIdentity::of_path(path).map_err(|_| changed())?)
    }
}

fn changed() -> HostError {
    HostError::Unavailable("loader helper binary changed or is unavailable".into())
}

fn hash_file(file: &mut File) -> Result<(String, Stamp)> {
    let before = Stamp::of_file(file)?;
    file.seek(SeekFrom::Start(0)).map_err(|_| changed())?;
    let mut hasher = Sha256::new();
    let mut chunk = vec![0u8; HASH_CHUNK_BYTES];
    let mut total = 0u64;
    loop {
        let count = file.read(&mut chunk).map_err(|_| changed())?;
        if count == 0 {
            break;
        }
        total = total.saturating_add(count as u64);
        if total > MAX_BYTES {
            return Err(changed());
        }
        hasher.update(&chunk[..count]);
    }
    if before != Stamp::of_file(file)? {
        return Err(changed());
    }
    Ok((format!("{:x}", hasher.finalize()), before))
}

fn open_and_hash(path: &Path) -> Result<(File, String, Stamp)> {
    let mut options = OpenOptions::new();
    options.read(true);
    let mut file: File = nofy_host_path::open_no_follow(&options, path).map_err(|_| changed())?;
    let (digest, stamp) = hash_file(&mut file)?;
    if stamp != Stamp::of_path(path)? {
        return Err(changed());
    }
    Ok((file, digest, stamp))
}

impl Helper {
    pub(super) fn install(&self, path: &Path) -> Result<()> {
        let path = std::fs::canonicalize(path).map_err(storage::unavailable)?;
        let (file, digest, stamp) = open_and_hash(&path)?;
        let binding = match nofy_host_path::pinned_executable_path(&file) {
            Some(exec_path) => Binding::Pinned(Mutex::new(Pinned {
                file,
                exec_path,
                verified: Some(stamp),
            })),
            None => Binding::Path {
                path,
                verified: Mutex::new(Some(stamp)),
            },
        };
        self.0
            .set(Installed {
                digest,
                binding,
                #[cfg(test)]
                reads: std::sync::atomic::AtomicUsize::new(1),
            })
            .map_err(|_| HostError::Invalid("loader helper is already bound".into()))
    }
    pub(super) fn bound(&self) -> bool {
        self.0.get().is_some()
    }
    pub(super) fn path(&self) -> Result<PathBuf> {
        let installed = self
            .0
            .get()
            .ok_or_else(|| HostError::Invalid("isolated process helper is not installed".into()))?;
        match &installed.binding {
            Binding::Pinned(pinned) => {
                let mut pinned = pinned.lock().map_err(|_| changed())?;
                let current = Stamp::of_file(&pinned.file)?;
                if pinned.verified.as_ref() == Some(&current) {
                    return Ok(pinned.exec_path.clone());
                }
                pinned.verified = None;
                #[cfg(test)]
                installed
                    .reads
                    .fetch_add(1, std::sync::atomic::Ordering::SeqCst);
                let (digest, stamp) = hash_file(&mut pinned.file)?;
                if digest != installed.digest {
                    return Err(changed());
                }
                pinned.verified = Some(stamp);
                Ok(pinned.exec_path.clone())
            }
            Binding::Path { path, verified } => {
                let current = Stamp::of_path(path)?;
                let mut verified = verified.lock().map_err(|_| changed())?;
                if verified.as_ref() == Some(&current) {
                    return Ok(path.clone());
                }
                *verified = None;
                #[cfg(test)]
                installed
                    .reads
                    .fetch_add(1, std::sync::atomic::Ordering::SeqCst);
                let (_, digest, stamp) = open_and_hash(path)?;
                if digest != installed.digest {
                    return Err(changed());
                }
                *verified = Some(stamp);
                Ok(path.clone())
            }
        }
    }
}

#[cfg(all(test, unix))]
mod tests {
    use super::*;

    #[test]
    fn streaming_hash_matches_whole_buffer_hash_across_multiple_chunks() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("chunked-helper");
        let payload: Vec<u8> = (0..(HASH_CHUNK_BYTES * 3 + 1234))
            .map(|i| (i % 251) as u8)
            .collect();
        std::fs::write(&path, &payload).unwrap();
        let (_, digest, _) = open_and_hash(&path).unwrap();
        assert_eq!(digest, storage::hash(&payload));
    }

    #[test]
    fn pinned_helper_survives_atomic_replacement_and_symlink_swap_but_rejects_inode_tamper() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("helper");
        std::fs::write(&path, b"original-helper").unwrap();
        let helper = Helper::default();
        helper.install(&path).unwrap();
        let resolved = helper.path().unwrap();
        assert_eq!(helper.path().unwrap(), resolved);
        let reads = || {
            helper
                .0
                .get()
                .unwrap()
                .reads
                .load(std::sync::atomic::Ordering::SeqCst)
        };
        assert_eq!(reads(), 1);

        // In-place overwrite mutates the pinned inode itself and must be rejected.
        std::fs::write(&path, b"replaced-helper").unwrap();
        assert!(helper.path().is_err());
        assert_eq!(reads(), 2);

        // Restoring original bytes to the inode verifies again.
        std::fs::write(&path, b"original-helper").unwrap();
        assert!(helper.path().is_ok());
        assert_eq!(reads(), 3);

        // Atomic hot-upgrade replacement with a new v2 binary at the same path:
        // pinned FD execution continues serving the original verified v1 inode.
        let upgrade = dir.path().join("helper-v2");
        std::fs::write(&upgrade, b"upgraded-v2-binary").unwrap();
        std::fs::rename(&upgrade, &path).unwrap();
        if matches!(helper.0.get().unwrap().binding, Binding::Pinned(_)) {
            let pinned_path = helper.path().unwrap();
            assert_eq!(std::fs::read(&pinned_path).unwrap(), b"original-helper");
            // Subsequent calls hit the cached FD stamp with no extra reads.
            let after_upgrade_reads = reads();
            assert_eq!(helper.path().unwrap(), pinned_path);
            assert_eq!(reads(), after_upgrade_reads);

            // Even unlinking and replacing the path with a symlink cannot hijack the pinned FD.
            std::fs::remove_file(&path).unwrap();
            std::os::unix::fs::symlink(dir.path().join("outside"), &path).unwrap();
            let still_pinned = helper.path().unwrap();
            assert_eq!(std::fs::read(&still_pinned).unwrap(), b"original-helper");
        } else {
            assert!(helper.path().is_err());
        }
    }

    #[test]
    fn path_fallback_rechecks_overwrites_replacements_and_rejects_symlinks() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("helper");
        std::fs::write(&path, b"original-helper").unwrap();
        let canonical = std::fs::canonicalize(&path).unwrap();
        let (_, digest, stamp) = open_and_hash(&canonical).unwrap();
        let helper = Helper::default();
        helper
            .0
            .set(Installed {
                digest,
                binding: Binding::Path {
                    path: canonical.clone(),
                    verified: Mutex::new(Some(stamp)),
                },
                reads: std::sync::atomic::AtomicUsize::new(1),
            })
            .ok()
            .unwrap();
        let reads = || {
            helper
                .0
                .get()
                .unwrap()
                .reads
                .load(std::sync::atomic::Ordering::SeqCst)
        };
        assert_eq!(helper.path().unwrap(), canonical);
        assert_eq!(reads(), 1);
        std::fs::write(&path, b"replaced-helper").unwrap();
        assert!(helper.path().is_err());
        assert_eq!(reads(), 2);
        std::fs::write(&path, b"original-helper").unwrap();
        assert!(helper.path().is_ok());
        assert_eq!(reads(), 3);
        let replacement = dir.path().join("new");
        std::fs::write(&replacement, b"original-helper").unwrap();
        std::fs::rename(replacement, &path).unwrap();
        assert!(helper.path().is_ok());
        assert_eq!(reads(), 4);
        std::fs::remove_file(&path).unwrap();
        std::os::unix::fs::symlink(dir.path().join("outside"), &path).unwrap();
        assert!(helper.path().is_err());
    }
}
