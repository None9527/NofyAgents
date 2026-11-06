//! Scope-side proofs for roll-forward undo; business state stays in this ledger.
use super::*;

fn invalid() -> StateError {
    StateError::Io(std::io::Error::new(
        std::io::ErrorKind::InvalidData,
        "invalid durable memory operation proof",
    ))
}

impl UnifiedState {
    pub(crate) fn has_incomplete_forget(&self) -> Result<bool, StateError> {
        Ok(self.scope.query_row(
            "SELECT EXISTS(SELECT 1 FROM operations WHERE kind='forget' AND phase NOT IN ('completed','failed'))",
            [], |row| row.get(0),
        )?)
    }
    pub(crate) fn was_forgotten(&self, target: &str) -> Result<bool, StateError> {
        Ok(self.scope.query_row(
            "SELECT EXISTS(SELECT 1 FROM tombstones WHERE target_kind='memory' AND target_id=?1)",
            [target],
            |row| row.get(0),
        )?)
    }

    pub(crate) fn prepare_durable_delete(
        &self,
        id: OperationId,
        path: &Path,
        hash: &str,
    ) -> Result<(), StateError> {
        self.scope.execute(
            "INSERT INTO operations(id,kind,phase,target_path,expected_hash,created_at,updated_at)
             VALUES (?1,'durable_delete','planned',?2,?3,?4,?4)",
            params![
                id.as_uuid().to_string(),
                path.to_string_lossy(),
                hash,
                chrono::Utc::now().timestamp()
            ],
        )?;
        Ok(())
    }

    pub(crate) fn verify_durable_operation(
        &self,
        id: OperationId,
        path: &Path,
        kind: &str,
        hash: &str,
    ) -> Result<(), StateError> {
        let frame: (String, String, String) = self.scope.query_row(
            "SELECT kind,target_path,expected_hash FROM operations WHERE id=?1",
            [id.as_uuid().to_string()],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
        )?;
        if frame
            != (
                kind.to_owned(),
                path.to_string_lossy().into_owned(),
                hash.to_owned(),
            )
        {
            return Err(invalid());
        }
        Ok(())
    }

    pub(crate) fn commit_durable_delete(
        &self,
        id: OperationId,
        path: &Path,
        hash: &str,
    ) -> Result<(), StateError> {
        let tx = self.scope.unchecked_transaction()?;
        tx.execute(
            "DELETE FROM files WHERE path=?1 AND content_hash=?2",
            params![path.to_string_lossy(), hash],
        )?;
        tx.execute("UPDATE operations SET phase='canonical_committed',updated_at=?2 WHERE id=?1 AND phase='planned'", params![id.as_uuid().to_string(),chrono::Utc::now().timestamp()])?;
        tx.commit()?;
        Ok(())
    }

    /// Native completion and evidence visibility have one scope transaction.
    /// A later completion retry must not reset evidence changed by another edit.
    pub(crate) fn complete_durable_undo(
        &self,
        id: OperationId,
        path: &str,
        before: &str,
        after: Option<&str>,
        deactivate: ObservationId,
        reactivate: Option<ObservationId>,
    ) -> Result<(), StateError> {
        let tx = self.scope.unchecked_transaction()?;
        let phase: String = tx.query_row(
            "SELECT phase FROM operations WHERE id=?1",
            [id.as_uuid().to_string()],
            |row| row.get(0),
        )?;
        if phase == "completed" {
            return Ok(());
        }
        if !matches!(
            phase.as_str(),
            "canonical_committed" | "derivatives_rebuilt"
        ) {
            return Err(invalid());
        }
        let now = chrono::Utc::now().timestamp();
        if tx.execute("UPDATE observation_states SET status='superseded',resolved_by=NULL,updated_at=?2 WHERE observation_id=?1", params![deactivate.as_uuid().to_string(),now])? != 1 {
            return Err(invalid());
        }
        if let Some(previous) = reactivate
            && tx.execute("UPDATE observation_states SET status='active',resolved_by=NULL,updated_at=?2 WHERE observation_id=?1", params![previous.as_uuid().to_string(),now])? != 1 {
                return Err(invalid());
            }
        tx.execute("INSERT INTO topic_changes(operation_id,topic_id,previous_hash,next_hash,created_at) VALUES (?1,?2,?3,?4,?5)", params![id.as_uuid().to_string(),path,before,after,now])?;
        tx.execute(
            "UPDATE operations SET phase='completed',updated_at=?2 WHERE id=?1",
            params![id.as_uuid().to_string(), now],
        )?;
        tx.commit()?;
        Ok(())
    }
}
