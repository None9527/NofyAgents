//! Explicit physical placement for one logical SQLite history store.
use crate::Error;
use std::{
    fs::{File, OpenOptions},
    io::{Read, Write},
    path::{Path, PathBuf},
};

/// A trusted host owns placement and the cross-process exclusion boundary.
/// Acquiring a location pins it through the returned permit's lifetime.
pub trait SqlitePlacement: Send + Sync {
    fn authority(&self) -> &str;
    fn logical_identity(&self) -> &str;
    fn acquire(&self) -> Result<PlacementPermit, Error>;
}
/// A preparing store may admit observation while rejecting every SQL write.
pub struct PlacementPermit {
    pub(super) path: PathBuf,
    pub(super) writable: bool,
    pub(super) create: bool,
    _guard: Box<dyn Send + Sync>,
}
impl PlacementPermit {
    pub fn new(
        path: PathBuf,
        writable: bool,
        create: bool,
        guard: Box<dyn Send + Sync>,
    ) -> Result<Self, Error> {
        if !path.is_absolute() || create && !writable {
            return Err(failure());
        }
        Ok(Self {
            path,
            writable,
            create,
            _guard: guard,
        })
    }
    pub fn path(&self) -> &Path {
        &self.path
    }
    pub fn writable(&self) -> bool {
        self.writable
    }
}
fn failure() -> Error {
    Error::Checkpoint(
        "managed SQLite placement unavailable; use its original storage authority".into(),
    )
}
fn marker(storage: &Path) -> PathBuf {
    let mut path = storage.as_os_str().to_owned();
    path.push(".placement");
    PathBuf::from(path)
}
/// Presence of a placement seal prevents bootstrapping a missing owner catalog.
pub fn managed(storage: &Path) -> Result<bool, Error> {
    match std::fs::symlink_metadata(marker(storage)) {
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(false),
        Ok(meta) if meta.is_file() && !meta.file_type().is_symlink() => Ok(true),
        _ => Err(failure()),
    }
}
fn expected(authority: &str) -> Result<Vec<u8>, Error> {
    if authority.is_empty()
        || authority.len() > 128
        || !authority
            .bytes()
            .all(|c| c.is_ascii_alphanumeric() || b"._-:/".contains(&c))
    {
        return Err(failure());
    }
    Ok(format!("nofy.sqlite-placement/v1\n{authority}\n").into_bytes())
}
pub(super) fn check(
    storage: &Path,
    placement: Option<&dyn SqlitePlacement>,
    required: bool,
) -> Result<(), Error> {
    let path = marker(storage);
    let meta = match std::fs::symlink_metadata(&path) {
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
            return if required { Err(failure()) } else { Ok(()) };
        }
        Err(_) => return Err(failure()),
        Ok(meta) => meta,
    };
    if !meta.is_file() || meta.file_type().is_symlink() || meta.len() > 512 {
        return Err(failure());
    }
    let bytes = expected(placement.ok_or_else(failure)?.authority())?;
    let mut actual = vec![];
    File::open(path)
        .map_err(|_| failure())?
        .take(513)
        .read_to_end(&mut actual)
        .map_err(|_| failure())?;
    if actual != bytes {
        return Err(failure());
    }
    Ok(())
}
pub(super) fn install(storage: &Path, placement: &dyn SqlitePlacement) -> Result<(), Error> {
    check(storage, Some(placement), false)?;
    let target = marker(storage);
    if target.try_exists().map_err(|_| failure())? {
        return Ok(());
    }
    let parent = target.parent().ok_or_else(failure)?;
    let temp = parent.join(format!(
        ".nofy-placement-{}.tmp",
        nofy_tool_protocol::ToolCallId::new_v7()
    ));
    let result = (|| {
        let mut options = OpenOptions::new();
        options.write(true).create_new(true);
        #[cfg(unix)]
        {
            use std::os::unix::fs::OpenOptionsExt;
            options.mode(0o600);
        }
        let mut file = options.open(&temp).map_err(|_| failure())?;
        file.write_all(&expected(placement.authority())?)
            .map_err(|_| failure())?;
        file.sync_all().map_err(|_| failure())?;
        match std::fs::hard_link(&temp, &target) {
            Ok(()) => {}
            Err(e) if e.kind() == std::io::ErrorKind::AlreadyExists => {
                check(storage, Some(placement), true)?
            }
            Err(_) => return Err(failure()),
        }
        crate::sync_directory(parent).map_err(|_| failure())
    })();
    let _ = std::fs::remove_file(temp);
    result
}
pub(crate) mod fence;
