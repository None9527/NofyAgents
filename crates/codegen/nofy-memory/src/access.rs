//! Single policy boundary for canonical unified-memory files.

use std::collections::BTreeMap;
use std::path::{Component, Path, PathBuf};

use serde::Serialize;
use thiserror::Error;

use crate::atomic_file;
use crate::layout::ScopeLayout;
use crate::model::{ContentHash, OperationId, OperationPhase, TopicPath};
use crate::state::{StateError, UnifiedState};

#[derive(Debug, Error)]
pub enum AccessError {
    #[error("memory access I/O failed: {0}")]
    Io(#[from] std::io::Error),
    #[error("memory state update failed: {0}")]
    State(#[from] StateError),
    #[error("memory manifest serialization failed: {0}")]
    Manifest(#[from] serde_json::Error),
    #[error("memory path must be normalized and relative: {0}")]
    InvalidPath(String),
    #[error("memory path is protected from writes: {0}")]
    ProtectedPath(String),
    #[error("memory path escapes the scope through a symlink: {0}")]
    SymlinkEscape(String),
    #[error("topic changed since it was read")]
    StaleHash,
    #[error("topic destination already exists: {0}")]
    DestinationExists(String),
    #[error("injected access failure at {0:?}")]
    Injected(AccessKillPoint),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AccessKillPoint {
    AfterCanonicalBeforeManifest,
    AfterManifestBeforeLedger,
}

#[derive(Debug, Serialize)]
struct Manifest {
    schema_version: u32,
    topics: BTreeMap<String, String>,
}

/// Canonical file operations. Callers cannot bypass path, hash, manifest, or
/// ledger checks by choosing a different memory action.
pub struct MemoryAccess {
    scope: ScopeLayout,
    state: UnifiedState,
}

impl MemoryAccess {
    pub fn open(meta_database: PathBuf, scope: ScopeLayout) -> Result<Self, AccessError> {
        std::fs::create_dir_all(scope.root())?;
        std::fs::create_dir_all(scope.topics_directory())?;
        std::fs::create_dir_all(scope.observations_directory())?;
        let state = UnifiedState::open(meta_database, scope.state_database())?;
        Ok(Self { scope, state })
    }

    /// Validate a scope-relative write path. Only canonical topic files are
    /// writable; observations, the manifest, SQLite, and hidden internals are
    /// protected.
    pub fn validate_write_path(&self, relative: &Path) -> Result<PathBuf, AccessError> {
        validate_lexical(relative)?;
        let first = relative.components().next();
        if !matches!(first, Some(Component::Normal(name)) if name == "topics") {
            return Err(AccessError::ProtectedPath(relative.display().to_string()));
        }
        if relative
            .components()
            .any(|component| matches!(component, Component::Normal(name) if name.to_string_lossy().starts_with('.')))
        {
            return Err(AccessError::ProtectedPath(relative.display().to_string()));
        }
        let target = self.scope.root().join(relative);
        self.validate_canonical_parent(&target)?;
        Ok(target)
    }

    pub fn update_topic(
        &self,
        operation_id: OperationId,
        relative_topic: &Path,
        expected_hash: &ContentHash,
        content: &str,
        kill_point: Option<AccessKillPoint>,
    ) -> Result<(), AccessError> {
        let target = self.topic_target(relative_topic)?;
        let previous = std::fs::read(&target)?;
        require_hash(&previous, expected_hash)?;
        let previous_manifest = read_optional(&self.scope.manifest_file())?;
        let next_hash = hash_bytes(content.as_bytes());

        self.state
            .replace_canonical_file(operation_id, &target, content.as_bytes(), None)?;
        if let Err(error) = inject(kill_point, AccessKillPoint::AfterCanonicalBeforeManifest) {
            self.rollback_update(
                operation_id,
                &target,
                &previous,
                previous_manifest.as_deref(),
            )?;
            return Err(error);
        }
        if let Err(error) = self
            .rebuild_manifest()
            .and_then(|_| inject(kill_point, AccessKillPoint::AfterManifestBeforeLedger))
        {
            self.rollback_update(
                operation_id,
                &target,
                &previous,
                previous_manifest.as_deref(),
            )?;
            return Err(error);
        }
        if let Err(error) = self.state.record_operation_phase(
            operation_id,
            OperationPhase::DerivativesRebuilt,
            chrono::Utc::now().timestamp(),
        ) {
            self.rollback_update(
                operation_id,
                &target,
                &previous,
                previous_manifest.as_deref(),
            )?;
            return Err(error.into());
        }

        if let Err(error) = self.state.complete_topic_change(
            operation_id,
            &scope_relative_string(self.scope.root(), &target)?,
            Some(expected_hash.as_str()),
            Some(&next_hash),
            chrono::Utc::now().timestamp(),
        ) {
            self.rollback_update(
                operation_id,
                &target,
                &previous,
                previous_manifest.as_deref(),
            )?;
            return Err(error.into());
        }
        Ok(())
    }

    pub fn rename_topic(
        &self,
        operation_id: OperationId,
        previous_topic: &Path,
        next_topic: &Path,
        expected_hash: &ContentHash,
        kill_point: Option<AccessKillPoint>,
    ) -> Result<(), AccessError> {
        let previous = self.topic_target(previous_topic)?;
        let next = self.topic_target(next_topic)?;
        let bytes = std::fs::read(&previous)?;
        require_hash(&bytes, expected_hash)?;
        if next.exists() {
            return Err(AccessError::DestinationExists(next.display().to_string()));
        }
        let old_manifest = read_optional(&self.scope.manifest_file())?;
        let now = chrono::Utc::now().timestamp();
        self.state
            .register_operation(operation_id, "topic_rename", now)?;

        std::fs::rename(&previous, &next)?;
        sync_rename(&previous, &next)?;
        if let Err(error) =
            self.state
                .record_operation_phase(operation_id, OperationPhase::CanonicalCommitted, now)
        {
            self.rollback_rename(operation_id, &previous, &next, old_manifest.as_deref())?;
            return Err(error.into());
        }
        if let Err(error) = inject(kill_point, AccessKillPoint::AfterCanonicalBeforeManifest) {
            self.rollback_rename(operation_id, &previous, &next, old_manifest.as_deref())?;
            return Err(error);
        }
        if let Err(error) = self
            .rebuild_manifest()
            .and_then(|_| inject(kill_point, AccessKillPoint::AfterManifestBeforeLedger))
        {
            self.rollback_rename(operation_id, &previous, &next, old_manifest.as_deref())?;
            return Err(error);
        }
        if let Err(error) =
            self.state
                .record_operation_phase(operation_id, OperationPhase::DerivativesRebuilt, now)
        {
            self.rollback_rename(operation_id, &previous, &next, old_manifest.as_deref())?;
            return Err(error.into());
        }
        if let Err(error) = self.state.complete_topic_rename(
            operation_id,
            &previous,
            &next,
            expected_hash.as_str(),
            now,
        ) {
            self.rollback_rename(operation_id, &previous, &next, old_manifest.as_deref())?;
            return Err(error.into());
        }
        Ok(())
    }

    pub fn delete_topic(
        &self,
        operation_id: OperationId,
        relative_topic: &Path,
        expected_hash: &ContentHash,
        kill_point: Option<AccessKillPoint>,
    ) -> Result<(), AccessError> {
        let target = self.topic_target(relative_topic)?;
        let bytes = std::fs::read(&target)?;
        require_hash(&bytes, expected_hash)?;
        let old_manifest = read_optional(&self.scope.manifest_file())?;
        let now = chrono::Utc::now().timestamp();
        self.state
            .register_operation(operation_id, "topic_delete", now)?;

        std::fs::remove_file(&target)?;
        atomic_file::sync_parent_directory(target.parent().expect("validated topic parent"))?;
        if let Err(error) =
            self.state
                .record_operation_phase(operation_id, OperationPhase::CanonicalCommitted, now)
        {
            self.rollback_delete(operation_id, &target, &bytes, old_manifest.as_deref())?;
            return Err(error.into());
        }
        if let Err(error) = inject(kill_point, AccessKillPoint::AfterCanonicalBeforeManifest) {
            self.rollback_delete(operation_id, &target, &bytes, old_manifest.as_deref())?;
            return Err(error);
        }
        if let Err(error) = self
            .rebuild_manifest()
            .and_then(|_| inject(kill_point, AccessKillPoint::AfterManifestBeforeLedger))
        {
            self.rollback_delete(operation_id, &target, &bytes, old_manifest.as_deref())?;
            return Err(error);
        }
        if let Err(error) =
            self.state
                .record_operation_phase(operation_id, OperationPhase::DerivativesRebuilt, now)
        {
            self.rollback_delete(operation_id, &target, &bytes, old_manifest.as_deref())?;
            return Err(error.into());
        }
        if let Err(error) =
            self.state
                .complete_topic_delete(operation_id, &target, expected_hash.as_str(), now)
        {
            self.rollback_delete(operation_id, &target, &bytes, old_manifest.as_deref())?;
            return Err(error.into());
        }
        Ok(())
    }

    pub fn rebuild_manifest(&self) -> Result<(), AccessError> {
        let mut topics = BTreeMap::new();
        collect_topics(
            self.scope.root(),
            &self.scope.topics_directory(),
            &mut topics,
        )?;
        let manifest = Manifest {
            schema_version: 1,
            topics,
        };
        let bytes = serde_json::to_vec_pretty(&manifest)?;
        atomic_file::replace(&self.scope.manifest_file(), &bytes)?;
        Ok(())
    }

    fn topic_target(&self, relative_topic: &Path) -> Result<PathBuf, AccessError> {
        let text = relative_topic.to_string_lossy().into_owned();
        TopicPath::parse(text.clone()).map_err(|_| AccessError::InvalidPath(text.clone()))?;
        self.validate_write_path(&Path::new("topics").join(relative_topic))
    }

    fn validate_canonical_parent(&self, target: &Path) -> Result<(), AccessError> {
        let canonical_root = dunce::canonicalize(self.scope.root())?;
        let parent = target
            .parent()
            .ok_or_else(|| AccessError::InvalidPath(target.display().to_string()))?;
        let canonical_parent = dunce::canonicalize(parent)?;
        if !canonical_parent.starts_with(&canonical_root) {
            return Err(AccessError::SymlinkEscape(target.display().to_string()));
        }
        if target.exists() {
            let canonical_target = dunce::canonicalize(target)?;
            if !canonical_target.starts_with(&canonical_root) {
                return Err(AccessError::SymlinkEscape(target.display().to_string()));
            }
        }
        Ok(())
    }

    fn rollback_update(
        &self,
        operation_id: OperationId,
        target: &Path,
        previous: &[u8],
        manifest: Option<&[u8]>,
    ) -> Result<(), AccessError> {
        self.state
            .replace_canonical_file(operation_id, target, previous, None)?;
        restore_manifest(&self.scope.manifest_file(), manifest)?;
        self.state.mark_operation_failed(
            operation_id,
            "topic update rolled back",
            chrono::Utc::now().timestamp(),
        )?;
        Ok(())
    }

    fn rollback_rename(
        &self,
        operation_id: OperationId,
        previous: &Path,
        next: &Path,
        manifest: Option<&[u8]>,
    ) -> Result<(), AccessError> {
        if next.exists() {
            std::fs::rename(next, previous)?;
            sync_rename(next, previous)?;
        }
        restore_manifest(&self.scope.manifest_file(), manifest)?;
        self.state.mark_operation_failed(
            operation_id,
            "topic rename rolled back",
            chrono::Utc::now().timestamp(),
        )?;
        Ok(())
    }

    fn rollback_delete(
        &self,
        operation_id: OperationId,
        target: &Path,
        previous: &[u8],
        manifest: Option<&[u8]>,
    ) -> Result<(), AccessError> {
        atomic_file::replace(target, previous)?;
        restore_manifest(&self.scope.manifest_file(), manifest)?;
        self.state.mark_operation_failed(
            operation_id,
            "topic delete rolled back",
            chrono::Utc::now().timestamp(),
        )?;
        Ok(())
    }
}

fn validate_lexical(path: &Path) -> Result<(), AccessError> {
    if path.as_os_str().is_empty()
        || path.is_absolute()
        || !path
            .components()
            .all(|component| matches!(component, Component::Normal(_)))
    {
        return Err(AccessError::InvalidPath(path.display().to_string()));
    }
    Ok(())
}

fn require_hash(bytes: &[u8], expected: &ContentHash) -> Result<(), AccessError> {
    if hash_bytes(bytes) != expected.as_str() {
        return Err(AccessError::StaleHash);
    }
    Ok(())
}

fn hash_bytes(bytes: &[u8]) -> String {
    blake3::hash(bytes).to_hex().to_string()
}

fn inject(
    configured: Option<AccessKillPoint>,
    current: AccessKillPoint,
) -> Result<(), AccessError> {
    if configured == Some(current) {
        return Err(AccessError::Injected(current));
    }
    Ok(())
}

fn read_optional(path: &Path) -> Result<Option<Vec<u8>>, std::io::Error> {
    match std::fs::read(path) {
        Ok(bytes) => Ok(Some(bytes)),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(error) => Err(error),
    }
}

fn restore_manifest(path: &Path, previous: Option<&[u8]>) -> std::io::Result<()> {
    match previous {
        Some(bytes) => atomic_file::replace(path, bytes),
        None => match std::fs::remove_file(path) {
            Ok(()) => atomic_file::sync_parent_directory(
                path.parent().expect("manifest always has a parent"),
            ),
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(()),
            Err(error) => Err(error),
        },
    }
}

fn sync_rename(previous: &Path, next: &Path) -> std::io::Result<()> {
    let previous_parent = previous.parent().expect("validated topic parent");
    let next_parent = next.parent().expect("validated topic parent");
    atomic_file::sync_parent_directory(previous_parent)?;
    if previous_parent != next_parent {
        atomic_file::sync_parent_directory(next_parent)?;
    }
    Ok(())
}

fn scope_relative_string(root: &Path, path: &Path) -> Result<String, AccessError> {
    path.strip_prefix(root)
        .map(|relative| relative.to_string_lossy().replace('\\', "/"))
        .map_err(|_| AccessError::SymlinkEscape(path.display().to_string()))
}

fn collect_topics(
    scope_root: &Path,
    directory: &Path,
    topics: &mut BTreeMap<String, String>,
) -> Result<(), AccessError> {
    for entry in std::fs::read_dir(directory)? {
        let entry = entry?;
        let file_type = entry.file_type()?;
        if file_type.is_symlink() {
            continue;
        }
        let path = entry.path();
        if file_type.is_dir() {
            collect_topics(scope_root, &path, topics)?;
        } else if file_type.is_file() && path.extension().is_some_and(|extension| extension == "md")
        {
            let relative = scope_relative_string(scope_root, &path)?;
            topics.insert(relative, hash_bytes(&std::fs::read(path)?));
        }
    }
    Ok(())
}
