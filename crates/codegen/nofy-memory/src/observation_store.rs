//! Canonical persistence boundary for captured observations.

use std::path::PathBuf;

use thiserror::Error;

use crate::atomic_file;
use crate::layout::UnifiedMemoryLayout;
use crate::model::{MemoryScope, Observation, ObservationStatus};
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
}
