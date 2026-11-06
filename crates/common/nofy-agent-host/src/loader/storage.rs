use super::*;
use std::{
    fs::{File, OpenOptions},
    io::{Read, Write},
};

pub(super) fn directory(path: &Path) -> Result<PathBuf> {
    if !path.is_absolute() {
        return Err(HostError::Invalid("loader path must be absolute".into()));
    }
    if !path.exists() {
        let mut builder = std::fs::DirBuilder::new();
        builder.recursive(true);
        #[cfg(unix)]
        {
            use std::os::unix::fs::DirBuilderExt;
            builder.mode(0o700);
        }
        builder.create(path).map_err(unavailable)?;
    }
    let meta = std::fs::symlink_metadata(path).map_err(unavailable)?;
    if !meta.is_dir() || meta.file_type().is_symlink() {
        return Err(HostError::Unavailable(
            "loader directory is not a real directory".into(),
        ));
    }
    std::fs::canonicalize(path).map_err(unavailable)
}
pub(super) fn read(path: &Path, max: u64) -> Result<Vec<u8>> {
    let meta = std::fs::symlink_metadata(path).map_err(unavailable)?;
    if !meta.is_file() || meta.len() > max {
        return Err(HostError::Unavailable(
            "invalid loader file type or size".into(),
        ));
    }
    let mut bytes = Vec::new();
    File::open(path)
        .map_err(unavailable)?
        .take(max + 1)
        .read_to_end(&mut bytes)
        .map_err(unavailable)?;
    if bytes.len() as u64 > max {
        return Err(HostError::Unavailable("loader file exceeds limit".into()));
    }
    Ok(bytes)
}
pub(super) struct StoreLock {
    _native: File,
    _commit: Option<super::admission::CommitLease>,
    owner: u32,
}
impl Drop for StoreLock {
    fn drop(&mut self) {
        unlock_local(&self._native, self.owner);
    }
}
/// A metadata transaction ends in its creating process. Closing an inherited
/// descriptor is not permission for a fork child to unlock the live parent.
pub(super) fn unlock_local(file: &File, owner: u32) {
    if std::process::id() != owner {
        return;
    }
    loop {
        match fs2::FileExt::unlock(file) {
            Err(error) if error.kind() == std::io::ErrorKind::Interrupted => continue,
            _ => break,
        }
    }
}
pub(super) fn lock(root: &Path) -> Result<StoreLock> {
    let commit = super::admission::resource_lease(root)?;
    let path = root.join("catalog.lock");
    if path.exists()
        && !std::fs::symlink_metadata(&path)
            .map_err(unavailable)?
            .is_file()
    {
        return Err(HostError::Unavailable("invalid loader lock".into()));
    }
    let mut options = OpenOptions::new();
    options.read(true).write(true).create(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.mode(0o600);
    }
    let file = options.open(path).map_err(unavailable)?;
    let start = std::time::Instant::now();
    loop {
        match fs2::FileExt::try_lock_exclusive(&file) {
            Ok(()) => {
                return Ok(StoreLock {
                    _native: file,
                    _commit: commit,
                    owner: std::process::id(),
                });
            }
            Err(e)
                if e.kind() == std::io::ErrorKind::WouldBlock
                    && start.elapsed() < std::time::Duration::from_secs(2) =>
            {
                std::thread::sleep(std::time::Duration::from_millis(5))
            }
            Err(e) => return Err(unavailable(e)),
        }
    }
}
pub(super) fn atomic(path: &Path, bytes: &[u8], mode: u32, replace: bool) -> Result<()> {
    let parent = path
        .parent()
        .ok_or_else(|| HostError::Invalid("loader file has no parent".into()))?;
    let mut tmp = tempfile::NamedTempFile::new_in(parent).map_err(unavailable)?;
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        tmp.as_file()
            .set_permissions(std::fs::Permissions::from_mode(mode))
            .map_err(unavailable)?;
    }
    #[cfg(not(unix))]
    let _ = mode;
    tmp.write_all(bytes).map_err(unavailable)?;
    tmp.as_file().sync_all().map_err(unavailable)?;
    if replace {
        tmp.persist(path).map_err(unavailable)?;
    } else {
        match tmp.persist_noclobber(path) {
            Ok(_) => {}
            Err(e) if e.error.kind() == std::io::ErrorKind::AlreadyExists => {
                if read(path, bytes.len() as u64)? != bytes {
                    return Err(HostError::Unavailable(
                        "immutable loader content changed".into(),
                    ));
                }
            }
            Err(e) => return Err(unavailable(e)),
        }
    }
    nofy_agent_runtime::sync_directory(parent).map_err(|_| {
        HostError::Control(nofy_agent_runtime::control::ControlError::CommitUncertain(
            "loader write may have committed; read the exact digest before retrying".into(),
        ))
    })?;
    Ok(())
}
pub(super) fn unavailable(error: impl std::fmt::Display) -> HostError {
    HostError::Unavailable(format!("loader storage: {error}"))
}
pub(super) fn hash(bytes: &[u8]) -> String {
    use sha2::{Digest, Sha256};
    format!("{:x}", Sha256::digest(bytes))
}
pub(super) fn digest(value: &str) -> Result<()> {
    if value.len() != 64
        || !value
            .bytes()
            .all(|c| c.is_ascii_hexdigit() && !c.is_ascii_uppercase())
    {
        return Err(HostError::Invalid(
            "expected lowercase SHA256 digest".into(),
        ));
    }
    Ok(())
}
