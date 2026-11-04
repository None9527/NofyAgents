//! Roll-forward variant of the existing canonical access boundary.
use super::*;
use crate::model::ObservationId;

impl MemoryAccess {
    /// No rollback under this operation ID: committed is durable evidence of
    /// the authorized mutation even if a later writer has changed the topic.
    pub(crate) fn undo_durable(
        &self,
        id: OperationId,
        relative: &Path,
        before: &ContentHash,
        after: Option<&str>,
        deactivate: ObservationId,
        reactivate: Option<ObservationId>,
    ) -> Result<(), AccessError> {
        let _write = crate::scope_write_lock::ScopeWriteGuard::acquire(self.scope.root())?;
        let target = self.topic_target(relative)?;
        let phase = self.state.operation_phase(id)?;
        let next_hash = after.map(|text| hash_bytes(text.as_bytes()));
        if phase.is_some() {
            self.state.verify_durable_operation(
                id,
                &target,
                if after.is_some() {
                    "canonical_replace"
                } else {
                    "durable_delete"
                },
                next_hash.as_deref().unwrap_or(before.as_str()),
            )?;
        }
        if phase == Some(OperationPhase::Completed) {
            return Ok(());
        }
        if matches!(phase, None | Some(OperationPhase::Planned)) {
            if let Some(text) = after {
                // UnifiedState::open already adopts an interrupted atomic
                // replacement only when the original target/hash proof matches.
                require_hash(&std::fs::read(&target)?, before)?;
                self.state
                    .replace_canonical_file(id, &target, text.as_bytes(), None)?;
            } else {
                self.stage_durable_delete(id, &target, before, phase.is_none())?;
            }
        } else if !matches!(
            phase,
            Some(OperationPhase::CanonicalCommitted | OperationPhase::DerivativesRebuilt)
        ) {
            return Err(AccessError::StaleHash);
        }
        #[cfg(test)]
        atomic_file::undo_test_exit("canonical");
        if after.is_none() {
            self.clear_durable_stage(id, before)?;
        }
        self.rebuild_manifest()?;
        self.state.complete_durable_undo(
            id,
            &scope_relative_string(self.scope.root(), &target)?,
            before.as_str(),
            next_hash.as_deref(),
            deactivate,
            reactivate,
        )?;
        #[cfg(test)]
        atomic_file::undo_test_exit("native_complete");
        Ok(())
    }

    fn stage_path(&self, id: OperationId) -> Result<PathBuf, AccessError> {
        let directory = self.scope.root().join(".undo-delete");
        match std::fs::symlink_metadata(&directory) {
            Ok(metadata) if metadata.is_dir() && !metadata.file_type().is_symlink() => {}
            Ok(_) => {
                return Err(AccessError::ProtectedPath(
                    "invalid undo stage directory".into(),
                ));
            }
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
                let mut builder = std::fs::DirBuilder::new();
                #[cfg(unix)]
                {
                    use std::os::unix::fs::DirBuilderExt;
                    builder.mode(0o700);
                }
                builder.create(&directory)?;
                atomic_file::sync_parent_directory(self.scope.root())?;
            }
            Err(error) => return Err(error.into()),
        }
        Ok(directory.join(id.as_uuid().to_string()))
    }

    fn stage_durable_delete(
        &self,
        id: OperationId,
        target: &Path,
        before: &ContentHash,
        fresh: bool,
    ) -> Result<(), AccessError> {
        let stage = self.stage_path(id)?;
        let staged = regular_optional(&stage)?;
        let current = regular_optional(target)?;
        if fresh {
            if staged.is_some() {
                return Err(AccessError::DestinationExists("unowned undo stage".into()));
            }
            require_hash(current.as_deref().ok_or(AccessError::StaleHash)?, before)?;
            self.state
                .prepare_durable_delete(id, target, before.as_str())?;
        }
        match (current, staged) {
            (Some(bytes), None) => {
                require_hash(&bytes, before)?;
                std::fs::rename(target, &stage)?;
                #[cfg(test)]
                atomic_file::undo_test_exit("delete_staged");
            }
            (None, Some(bytes)) => require_hash(&bytes, before)?,
            _ => return Err(AccessError::StaleHash),
        }
        atomic_file::sync_parent_directory(target.parent().expect("validated topic parent"))?;
        atomic_file::sync_parent_directory(stage.parent().expect("owned stage parent"))?;
        self.state
            .commit_durable_delete(id, target, before.as_str())?;
        Ok(())
    }

    fn clear_durable_stage(
        &self,
        id: OperationId,
        before: &ContentHash,
    ) -> Result<(), AccessError> {
        let stage = self.stage_path(id)?;
        if let Some(bytes) = regular_optional(&stage)? {
            require_hash(&bytes, before)?;
            std::fs::remove_file(&stage)?;
            atomic_file::sync_parent_directory(stage.parent().expect("owned stage parent"))?;
        }
        Ok(())
    }

    pub(crate) fn revoke_durable_undo(
        &self,
        id: OperationId,
        created: bool,
        before: &ContentHash,
    ) -> Result<(), AccessError> {
        let phase = self.state.operation_phase(id)?;
        if matches!(phase, None | Some(OperationPhase::Failed)) {
            // A claimed ID alone does not own any pre-existing filesystem
            // object. Never erase it or report cleanup complete by guessing.
            let directory = self.scope.root().join(".undo-delete");
            match std::fs::symlink_metadata(&directory) {
                Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(()),
                Err(error) => return Err(error.into()),
                Ok(metadata) if !metadata.is_dir() || metadata.file_type().is_symlink() => {
                    return Err(AccessError::ProtectedPath(
                        "invalid undo stage directory".into(),
                    ));
                }
                Ok(_) => {}
            }
            if regular_optional(&directory.join(id.as_uuid().to_string()))?.is_some() {
                return Err(AccessError::ProtectedPath(
                    "unowned undo stage needs explicit reconciliation".into(),
                ));
            }
            return Ok(());
        }
        if phase == Some(OperationPhase::Completed) {
            return Ok(());
        }
        if created {
            self.clear_durable_stage(id, before)?;
        }
        self.state.mark_operation_failed(
            id,
            "revoked by confirmed forget",
            chrono::Utc::now().timestamp(),
        )?;
        Ok(())
    }
}

fn regular_optional(path: &Path) -> Result<Option<Vec<u8>>, AccessError> {
    match std::fs::symlink_metadata(path) {
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(None),
        Err(error) => return Err(error.into()),
        Ok(metadata) if !metadata.is_file() || metadata.file_type().is_symlink() => {
            return Err(AccessError::ProtectedPath("invalid undo target".into()));
        }
        Ok(metadata) if metadata.len() > 1024 * 1024 => {
            return Err(AccessError::ProtectedPath(
                "undo target exceeds 1 MiB".into(),
            ));
        }
        Ok(_) => {}
    }
    Ok(Some(std::fs::read(path)?))
}
