//! Canonical persistence boundary for captured observations.

use std::path::PathBuf;

use thiserror::Error;

use crate::atomic_file;
use crate::layout::UnifiedMemoryLayout;
use crate::model::{MemoryScope, Observation, ObservationId, ObservationStatus};
use crate::state::{StateError, UnifiedState};

#[derive(Debug, Error)]
pub enum ObservationStoreError {
    #[error("observation store I/O failed: {0}")]
    Io(#[from] std::io::Error),
    #[error("observation store state failed: {0}")]
    State(#[from] StateError),
    #[error("observation serialization failed: {0}")]
    Json(#[from] serde_json::Error),
}

#[derive(Debug, Clone)]
pub struct ObservationStore {
    layout: UnifiedMemoryLayout,
}

impl ObservationStore {
    pub fn new(root: PathBuf) -> Self {
        Self {
            layout: UnifiedMemoryLayout::new(root),
        }
    }

    pub fn persist(
        &self,
        observation: &Observation,
        status: ObservationStatus,
    ) -> Result<PathBuf, ObservationStoreError> {
        let scope = self.layout.scope(&observation.scope);
        let relative = format!("observations/{}.md", observation.id.as_uuid());
        let path = scope.root().join(&relative);
        let body = format!(
            "<!-- nofy-memory: immutable=true -->\n```json\n{}\n```\n",
            serde_json::to_string_pretty(observation)?
        );
        atomic_file::replace(&path, body.as_bytes())?;
        let state = UnifiedState::open(self.layout.meta_database(), scope.state_database())?;
        state.record_observation_file(observation, &relative)?;
        if status != ObservationStatus::Active {
            state.set_observation_status(observation.id, status, None)?;
        }
        Ok(path)
    }

    pub fn quarantine(
        &self,
        scope: &MemoryScope,
        record_id: Option<&str>,
        reason: &str,
        payload: &str,
        now: i64,
    ) -> Result<(), ObservationStoreError> {
        let scope = self.layout.scope(scope);
        let state = UnifiedState::open(self.layout.meta_database(), scope.state_database())?;
        state.quarantine_capture(record_id, reason, payload, now)?;
        Ok(())
    }

    pub fn forget(
        &self,
        scope: &MemoryScope,
        observation_id: ObservationId,
        target_id: &str,
        reason: &str,
    ) -> Result<(), ObservationStoreError> {
        let scope_layout = self.layout.scope(scope);
        let path = scope_layout
            .observations_directory()
            .join(format!("{}.md", observation_id.as_uuid()));
        let bytes = std::fs::read(&path)?;
        let salt = uuid::Uuid::new_v4();
        let salted_previous_hash = blake3::hash(
            format!(
                "{salt}:{}:{}",
                observation_id.as_uuid(),
                blake3::hash(&bytes).to_hex()
            )
            .as_bytes(),
        )
        .to_hex()
        .to_string();
        std::fs::remove_file(&path)?;
        atomic_file::sync_parent_directory(
            path.parent().expect("observation path always has a parent"),
        )?;
        let now = chrono::Utc::now().timestamp();
        let state = UnifiedState::open(self.layout.meta_database(), scope_layout.state_database())?;
        state.forget_observation(
            observation_id,
            target_id,
            &salted_previous_hash,
            reason,
            now,
            now.saturating_add(30 * 24 * 60 * 60),
        )?;
        Ok(())
    }
}
