//! Retention and recoverable-copy destruction for unified memory.

use std::fs::File;
use std::io;
use std::path::{Path, PathBuf};

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::atomic_file;
use crate::layout::{ScopeLayout, UnifiedMemoryLayout};
use crate::migration_backup::{
    BackupError, BackupReceipt, MigrationKeyStore, forget_legacy_backup,
};
use crate::state::{StateError, UnifiedState};

const MIGRATION_BACKUP_RECORD: &str = "migration-backup.json";

#[derive(Debug, Error)]
pub enum RetentionError {
    #[error("memory retention I/O failed: {0}")]
    Io(#[from] io::Error),
    #[error("memory retention metadata is invalid: {0}")]
    Json(#[from] serde_json::Error),
    #[error("memory retention state failed: {0}")]
    State(#[from] StateError),
    #[error("memory retention backup failed: {0}")]
    Backup(#[from] BackupError),
    #[error("unsafe migration backup path: {0}")]
    UnsafeBackupPath(String),
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct RetentionReport {
    pub archives_deleted: usize,
    pub tombstones_deleted: usize,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
struct PersistedBackupReceipt {
    path: PathBuf,
    key_id: String,
    delete_after: DateTime<Utc>,
}

impl From<&BackupReceipt> for PersistedBackupReceipt {
    fn from(receipt: &BackupReceipt) -> Self {
        Self {
            path: receipt.path.clone(),
            key_id: receipt.key_id.clone(),
            delete_after: receipt.delete_after,
        }
    }
}

impl From<PersistedBackupReceipt> for BackupReceipt {
    fn from(receipt: PersistedBackupReceipt) -> Self {
        Self {
            path: receipt.path,
            key_id: receipt.key_id,
            delete_after: receipt.delete_after,
        }
    }
}

pub fn persist_migration_backup_receipt(
    active_root: &Path,
    receipt: &BackupReceipt,
) -> Result<(), RetentionError> {
    std::fs::create_dir_all(active_root)?;
    validate_backup_path(active_root, &receipt.path)?;
    atomic_file::replace(
        &active_root.join(MIGRATION_BACKUP_RECORD),
        &serde_json::to_vec_pretty(&PersistedBackupReceipt::from(receipt))?,
    )?;
    Ok(())
}

pub fn load_migration_backup_receipt(
    active_root: &Path,
) -> Result<Option<BackupReceipt>, RetentionError> {
    let path = active_root.join(MIGRATION_BACKUP_RECORD);
    if !path.is_file() {
        return Ok(None);
    }
    let receipt: PersistedBackupReceipt = serde_json::from_slice(&std::fs::read(path)?)?;
    validate_backup_path(active_root, &receipt.path)?;
    Ok(Some(receipt.into()))
}

/// Destroy the migration key before the encrypted archive. The receipt is
/// removed only after both steps succeed, so a partial failure is visible and
/// cannot be reported as a successful forget.
pub fn destroy_migration_backup(
    active_root: &Path,
    key_store: &dyn MigrationKeyStore,
) -> Result<bool, RetentionError> {
    let Some(receipt) = load_migration_backup_receipt(active_root)? else {
        return Ok(false);
    };
    forget_legacy_backup(&receipt.path, &receipt.key_id, key_store)?;
    let record = active_root.join(MIGRATION_BACKUP_RECORD);
    std::fs::remove_file(&record)?;
    atomic_file::sync_parent_directory(active_root)?;
    Ok(true)
}

pub fn gc_migration_backup(
    active_root: &Path,
    key_store: &dyn MigrationKeyStore,
    now: DateTime<Utc>,
) -> Result<bool, RetentionError> {
    let Some(receipt) = load_migration_backup_receipt(active_root)? else {
        return Ok(false);
    };
    if receipt.delete_after > now {
        return Ok(false);
    }
    destroy_migration_backup(active_root, key_store)
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
                File::open(parent)?.sync_all()?;
            }
            archives_deleted += 1;
        }
    }
    Ok(RetentionReport {
        archives_deleted,
        tombstones_deleted,
    })
}

fn validate_backup_path(active_root: &Path, backup: &Path) -> Result<(), RetentionError> {
    let expected_parent = active_root
        .parent()
        .ok_or_else(|| RetentionError::UnsafeBackupPath(backup.display().to_string()))?;
    let valid_name = backup
        .file_name()
        .and_then(|name| name.to_str())
        .is_some_and(|name| name.starts_with("memory.legacy.") && name.ends_with(".tar.age"));
    if backup.parent() != Some(expected_parent) || !valid_name {
        return Err(RetentionError::UnsafeBackupPath(
            backup.display().to_string(),
        ));
    }
    Ok(())
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
