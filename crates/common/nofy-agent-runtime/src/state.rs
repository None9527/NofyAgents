use crate::{Error, Message, ToolCall};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::{
    collections::{BTreeMap, VecDeque},
    sync::Mutex,
};

pub(crate) fn checkpoint_key(name: &str, thread_id: &str) -> String {
    format!("{}:{}{}", name.len(), name, thread_id)
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct RunState {
    #[serde(
        default,
        skip_serializing_if = "crate::mailbox::InputProgress::is_empty"
    )]
    pub input_progress: crate::mailbox::InputProgress,
    #[serde(
        default,
        skip_serializing_if = "crate::recipe::RecipeProgress::is_empty"
    )]
    pub recipe_progress: crate::recipe::RecipeProgress,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub execution_run_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pending_model: Option<crate::model::PendingModel>,
    #[serde(default, skip_serializing_if = "is_zero")]
    pub model_sequence: u64,
    /// Explicit control commands distinguish new hook producers from replayed facts.
    #[serde(default, skip_serializing_if = "is_zero")]
    pub control_sequence: u64,
    pub messages: Vec<Message>,
    #[serde(default)]
    pub tool_revision: String,
    pub steps: usize,
    pub input_tokens: u64,
    pub output_tokens: u64,
    pub pending_tools: VecDeque<ToolCall>,
    /// A durable intent without a committed result must be reconciled by the
    /// application, never automatically replayed after a crash.
    pub in_flight: Option<ToolCall>,
    pub data: serde_json::Value,
    pub complete: bool,
    pub output: String,
    #[serde(default)]
    pub completion_info: crate::CompletionInfo,
    #[serde(
        default,
        skip_serializing_if = "crate::hooks::progress::HookProgress::is_empty"
    )]
    pub hook_progress: crate::hooks::progress::HookProgress,
    #[serde(
        default,
        skip_serializing_if = "crate::context_policy::ContextProgress::is_empty"
    )]
    pub context_progress: crate::context_policy::ContextProgress,
}
fn is_zero(value: &u64) -> bool {
    *value == 0
}
impl RunState {
    pub fn has_pending_work(&self) -> bool {
        !self.pending_tools.is_empty()
            || self.in_flight.is_some()
            || self.pending_model.is_some()
            || self.recipe_progress.pending.is_some()
            || self.hook_progress.pending_input.is_some()
            || self.hook_progress.prepared_model.is_some()
            || self.context_progress.pending.is_some()
            || self.input_progress.pending.is_some()
            || self.input_progress.unacknowledged.is_some()
            || self.input_progress.command.is_some()
            || !self.hook_progress.facts.is_empty()
            || (self.complete
                && self.hook_progress.run_id.is_some()
                && !self.hook_progress.stop_done)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Checkpoint {
    pub version: u32,
    pub revision: u64,
    pub composition: String,
    pub state: RunState,
}

#[async_trait]
pub trait Checkpointer: Send + Sync {
    /// Only durable backends may certify a completed turn for automatic capture.
    fn is_durable(&self) -> bool {
        false
    }
    async fn load(&self, key: &str) -> Result<Option<Checkpoint>, Error>;
    /// Compare-and-swap. `expected=None` creates a previously absent thread.
    async fn save(
        &self,
        key: &str,
        expected: Option<u64>,
        checkpoint: Checkpoint,
    ) -> Result<(), Error>;
}

#[derive(Default)]
pub struct InMemoryCheckpointer(Mutex<BTreeMap<String, Checkpoint>>);

#[async_trait]
impl Checkpointer for InMemoryCheckpointer {
    async fn load(&self, key: &str) -> Result<Option<Checkpoint>, Error> {
        Ok(self
            .0
            .lock()
            .map_err(|_| Error::Checkpoint("store poisoned".into()))?
            .get(key)
            .cloned())
    }
    async fn save(
        &self,
        key: &str,
        expected: Option<u64>,
        checkpoint: Checkpoint,
    ) -> Result<(), Error> {
        let mut rows = self
            .0
            .lock()
            .map_err(|_| Error::Checkpoint("store poisoned".into()))?;
        if rows.get(key).map(|c| c.revision) != expected {
            return Err(Error::Checkpoint("concurrent thread update".into()));
        }
        rows.insert(key.to_string(), checkpoint);
        Ok(())
    }
}
