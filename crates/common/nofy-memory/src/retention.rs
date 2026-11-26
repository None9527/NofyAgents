//! Retention garbage collection for archived files and tombstones.

use std::io;
use std::path::{Path, PathBuf};

use thiserror::Error;

use crate::layout::{ScopeLayout, UnifiedMemoryLayout};
use crate::state::{StateError, UnifiedState};

#[derive(Debug, Error)]
pub enum RetentionError {
    #[error("memory retention I/O failed: {0}")]
    Io(#[from] io::Error),
    #[error("memory retention state failed: {0}")]
    State(#[from] StateError),
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct RetentionReport {
    pub archives_deleted: usize,
    pub tombstones_deleted: usize,
}

/// Remove expired archive files and tombstones that are not referenced by an
/// unfinished operation. Archive age is measured from its durable mtime;
/// tombstones use their explicit retention deadline.
pub fn gc_scope(
    layout: &UnifiedMemoryLayout,
    scope: &ScopeLayout,
    now: i64,
    archive_retention_secs: i64,
) -> Result<RetentionReport, RetentionError> {
    let _scope_write = crate::scope_write_lock::ScopeWriteGuard::acquire(scope.root())?;
    let state = UnifiedState::open(layout.meta_database(), scope.state_database())?;
    let protected = state.incomplete_operation_targets()?;
    let tombstones_deleted = state.delete_expired_tombstones(now, &protected)?;
    let cutoff = now.saturating_sub(archive_retention_secs.max(0));
    let mut archives_deleted = 0;
    let mut files = Vec::new();
    collect_regular_files(&scope.archive_directory(), &mut files)?;
    for path in files {
        let target = path.to_string_lossy();
        if protected.contains(target.as_ref()) {
            continue;
        }
        let modified = std::fs::metadata(&path)?
            .modified()?
            .duration_since(std::time::UNIX_EPOCH)
            .map(|duration| duration.as_secs() as i64)
            .unwrap_or(i64::MIN);
        if modified <= cutoff {
            std::fs::remove_file(&path)?;
            if let Some(parent) = path.parent() {
                nofy_durable_fs::sync_directory(parent)?;
            }
            archives_deleted += 1;
        }
    }
    Ok(RetentionReport {
        archives_deleted,
        tombstones_deleted,
    })
}

fn collect_regular_files(root: &Path, files: &mut Vec<PathBuf>) -> io::Result<()> {
    if !root.is_dir() {
        return Ok(());
    }
    for entry in std::fs::read_dir(root)? {
        let path = entry?.path();
        let metadata = std::fs::symlink_metadata(&path)?;
        if metadata.file_type().is_symlink() {
            continue;
        }
        if metadata.is_dir() {
            collect_regular_files(&path, files)?;
        } else if metadata.is_file() {
            files.push(path);
        }
    }
    Ok(())
}
