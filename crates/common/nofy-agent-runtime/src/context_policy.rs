//! Checkpointed context transformations, separate from ephemeral retrieval.
use crate::{Error, Message, RunContext, RunState};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::BTreeSet;

#[async_trait::async_trait]
pub trait ContextPolicy: Send + Sync {
    /// A serializable proposal. No history is changed until its gate permits it.
    async fn plan(&self, state: &RunState, context: &RunContext) -> Result<Option<Value>, Error>;
    async fn apply(
        &self,
        state: &RunState,
        plan: &Value,
        context: &RunContext,
    ) -> Result<ContextUpdate, Error>;
}
pub struct ContextUpdate {
    pub messages: Vec<Message>,
    /// Original messages from this index must be retained byte-for-byte.
    pub retained_from: usize,
    /// Start of that exact retained range in the replacement history.
    pub retained_at: usize,
    pub input_tokens: u64,
    pub output_tokens: u64,
    pub metadata: Value,
}
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct ContextProgress {
    pub step: usize,
    pub sequence: u64,
    pub completed: BTreeSet<String>,
    pub pending: Option<PreparedContext>,
}
impl ContextProgress {
    pub fn is_empty(&self) -> bool {
        self.step == 0 && self.sequence == 0 && self.completed.is_empty() && self.pending.is_none()
    }
}
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PreparedContext {
    pub policy: String,
    pub operation: String,
    pub plan: Value,
}
