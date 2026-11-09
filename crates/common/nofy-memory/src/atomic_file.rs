//! Crash-safe replacement of canonical memory files.

use std::fs::OpenOptions;
use std::io::{self, Write};
use std::path::{Path, PathBuf};

/// Hard-exit seam present only in the unit-test executable, never in a host.
#[cfg(test)]
pub(crate) fn undo_test_exit(point: &str) {
    if std::env::var("NOFY_MEMORY_UNDO_TEST_EXIT").ok().as_deref() == Some(point) {
        std::process::exit(73);
    }
}

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
    #[cfg(test)]
    let temp_path = tests::override_temp_path(temp_path);
    let mut guard = TempFileGuard {
        path: temp_path.clone(),
        armed: false,
    };
    let mut temp = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&temp_path)?;
    guard.armed = true;

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

fn replace_path(source: &Path, destination: &Path) -> io::Result<()> {
    nofy_durable_fs::replace_file(source, destination)
}

pub(crate) fn sync_parent_directory(parent: &Path) -> io::Result<()> {
    nofy_durable_fs::sync_directory(parent)
}

#[cfg(test)]
mod tests;
