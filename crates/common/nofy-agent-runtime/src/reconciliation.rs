//! Operator receipts are delivered to the actual child tool boundary. Accepting
//! evidence does not edit a transcript or release a budget reservation.
use crate::{Error, RunContext, RunState, ToolCall};
use serde_json::Value;
use std::sync::Arc;

#[async_trait::async_trait]
pub(crate) trait ReconciliationControl: Send + Sync {
    async fn reject(&self, reason: &str) -> Result<(), Error>;
}
#[derive(Clone)]
pub(crate) struct ReconciliationInput {
    pub thread_id: String,
    pub run_id: String,
    pub model_sequence: u64,
    pub call: ToolCall,
    pub result: Value,
    pub is_error: bool,
    pub control: Arc<dyn ReconciliationControl>,
}
impl ReconciliationInput {
    pub fn matches(&self, context: &RunContext, state: &RunState, call: &ToolCall) -> bool {
        self.thread_id == context.thread_id
            && self.run_id == context.run_id
            && self.model_sequence == state.model_sequence
            && self.call == *call
    }
}
#[derive(Clone)]
pub(crate) struct ToolReconciliation(pub ReconciliationInput);
