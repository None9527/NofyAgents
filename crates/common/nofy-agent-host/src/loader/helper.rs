//! One immutable bootstrap executable, cached only after a complete byte check.
use super::*;
use std::{
    fs::{File, Metadata, OpenOptions},
    io::Read,
    sync::{Mutex, OnceLock},
};

const MAX_BYTES: u64 = 512 * 1024 * 1024;
#[derive(Clone, Default)]
pub(super) struct Helper(Arc<OnceLock<Installed>>);
struct Installed {
    path: PathBuf,
    digest: String,
    verified: Mutex<Option<Stamp>>,
    #[cfg(test)]
    reads: std::sync::atomic::AtomicUsize,
}
#[derive(PartialEq, Eq)]
struct Stamp {
    size: u64,
    #[cfg(unix)]
    identity: (u64, u64, i64, i64, i64, i64),
}
impl Stamp {
    fn read(meta: Metadata) -> Result<Self> {
        if !meta.is_file() || meta.len() > MAX_BYTES {
            return Err(changed());
        }
        #[cfg(unix)]
        use std::os::unix::fs::MetadataExt;
        Ok(Self {
            size: meta.len(),
            #[cfg(unix)]
            identity: (
                meta.dev(),
                meta.ino(),
                meta.mtime(),
                meta.mtime_nsec(),
                meta.ctime(),
                meta.ctime_nsec(),
            ),
        })
    }
}
fn changed() -> HostError {
    HostError::Unavailable("loader helper binary changed or is unavailable".into())
}
fn read(path: &Path) -> Result<(String, Stamp)> {
    let mut options = OpenOptions::new();
    options.read(true);
    #[cfg(target_os = "linux")]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.custom_flags(libc::O_NOFOLLOW | libc::O_CLOEXEC);
    }
    let mut file: File = options.open(path).map_err(|_| changed())?;
    let before = Stamp::read(file.metadata().map_err(|_| changed())?)?;
    let mut bytes = Vec::new();
    file.by_ref()
        .take(MAX_BYTES + 1)
        .read_to_end(&mut bytes)
        .map_err(|_| changed())?;
    if bytes.len() as u64 > MAX_BYTES
        || before != Stamp::read(file.metadata().map_err(|_| changed())?)?
        || before != Stamp::read(std::fs::symlink_metadata(path).map_err(|_| changed())?)?
    {
        return Err(changed());
    }
    Ok((storage::hash(&bytes), before))
}
impl Helper {
    pub(super) fn install(&self, path: &Path) -> Result<()> {
        let path = std::fs::canonicalize(path).map_err(storage::unavailable)?;
        let (digest, stamp) = read(&path)?;
        self.0
            .set(Installed {
                path,
                digest,
                verified: Mutex::new(Some(stamp)),
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
        let current =
            Stamp::read(std::fs::symlink_metadata(&installed.path).map_err(|_| changed())?)?;
        let mut verified = installed.verified.lock().map_err(|_| changed())?;
        // Other platforms rehash conservatively; there is no Unix inode/ctime
        // identity available here on which to base the positive cache.
        if cfg!(unix) && verified.as_ref() == Some(&current) {
            return Ok(installed.path.clone());
        }
        *verified = None;
        #[cfg(test)]
        installed
            .reads
            .fetch_add(1, std::sync::atomic::Ordering::SeqCst);
        let (digest, stamp) = read(&installed.path)?;
        if digest != installed.digest {
            return Err(changed());
        }
        *verified = Some(stamp);
        Ok(installed.path.clone())
    }
}

#[cfg(all(test, unix))]
mod tests {
    use super::*;
    #[test]
    fn verified_identity_is_cached_but_overwrites_replacements_and_symlinks_are_rechecked() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("helper");
        std::fs::write(&path, b"original-helper").unwrap();
        let helper = Helper::default();
        helper.install(&path).unwrap();
        assert!(helper.path().is_ok());
        assert!(helper.path().is_ok());
        let reads = || {
            helper
                .0
                .get()
                .unwrap()
                .reads
                .load(std::sync::atomic::Ordering::SeqCst)
        };
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
