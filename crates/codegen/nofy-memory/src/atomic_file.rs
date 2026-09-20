//! Crash-safe replacement of canonical memory files.

use std::fs::{File, OpenOptions};
use std::io::{self, Write};
use std::path::{Path, PathBuf};

/// Deterministic failure seams used by recovery tests.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AtomicWriteKillPoint {
    TempFileSynced,
    BeforeRename,
}

struct TempFileGuard {
    path: PathBuf,
    armed: bool,
}

impl Drop for TempFileGuard {
    fn drop(&mut self) {
        if self.armed {
            let _ = std::fs::remove_file(&self.path);
        }
    }
}

/// Atomically replace `path` with `contents` and durably sync the rename.
pub fn replace(path: &Path, contents: &[u8]) -> io::Result<()> {
    replace_with_kill_point(path, contents, None)
}

/// [`replace`] with deterministic crash seams for integration tests.
pub fn replace_with_kill_point(
    path: &Path,
    contents: &[u8],
    kill_point: Option<AtomicWriteKillPoint>,
) -> io::Result<()> {
    let parent = path.parent().ok_or_else(|| {
        io::Error::new(io::ErrorKind::InvalidInput, "atomic target has no parent")
    })?;
    std::fs::create_dir_all(parent)?;

    let file_name = path
        .file_name()
        .and_then(|name| name.to_str())
        .ok_or_else(|| {
            io::Error::new(
                io::ErrorKind::InvalidInput,
                "atomic target has no file name",
            )
        })?;
    let temp_path = parent.join(format!(".{file_name}.tmp-{}", uuid::Uuid::new_v4()));
    let mut guard = TempFileGuard {
        path: temp_path.clone(),
        armed: true,
    };
    let mut temp = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&temp_path)?;

    if let Ok(metadata) = std::fs::metadata(path) {
        temp.set_permissions(metadata.permissions())?;
    }
    temp.write_all(contents)?;
    temp.flush()?;
    temp.sync_all()?;

    inject(kill_point, AtomicWriteKillPoint::TempFileSynced)?;
    inject(kill_point, AtomicWriteKillPoint::BeforeRename)?;
    drop(temp);

    replace_path(&temp_path, path)?;
    guard.armed = false;
    sync_parent_directory(parent)?;
    Ok(())
}

fn inject(
    configured: Option<AtomicWriteKillPoint>,
    current: AtomicWriteKillPoint,
) -> io::Result<()> {
    if configured == Some(current) {
        return Err(io::Error::new(
            io::ErrorKind::Interrupted,
            format!("injected atomic-write failure at {current:?}"),
        ));
    }
    Ok(())
}

#[cfg(not(windows))]
fn replace_path(source: &Path, destination: &Path) -> io::Result<()> {
    std::fs::rename(source, destination)
}

#[cfg(windows)]
fn replace_path(source: &Path, destination: &Path) -> io::Result<()> {
    use windows::Win32::Storage::FileSystem::{
        MOVEFILE_REPLACE_EXISTING, MOVEFILE_WRITE_THROUGH, MoveFileExW,
    };
    use windows::core::PCWSTR;

    fn wide(path: &Path) -> Vec<u16> {
        use std::os::windows::ffi::OsStrExt;
        path.as_os_str()
            .encode_wide()
            .chain(std::iter::once(0))
            .collect()
    }

    let source = wide(source);
    let destination = wide(destination);
    unsafe {
        MoveFileExW(
            PCWSTR(source.as_ptr()),
            PCWSTR(destination.as_ptr()),
            MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH,
        )
        .map_err(|error| io::Error::new(io::ErrorKind::Other, error))
    }
}

#[cfg(unix)]
fn sync_parent_directory(parent: &Path) -> io::Result<()> {
    File::open(parent)?.sync_all()
}

#[cfg(not(unix))]
fn sync_parent_directory(_parent: &Path) -> io::Result<()> {
    // MoveFileExW with MOVEFILE_WRITE_THROUGH provides the Windows durability
    // boundary; opening directories for sync is not supported by std.
    Ok(())
}
