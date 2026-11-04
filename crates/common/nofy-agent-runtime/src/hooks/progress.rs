use crate::{Message, ToolCall};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::VecDeque;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct HookProgress {
    pub turn: u64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub run_id: Option<String>,
    pub session_started: bool,
    pub pending_input: Option<Message>,
    pub prepared_tool: Option<PreparedTool>,
    pub prepared_model: Option<PreparedModel>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub prepared_sources: Option<PreparedSources>,
    #[serde(default, skip_serializing_if = "zero")]
    pub source_sequence: u64,
    pub facts: VecDeque<HookFact>,
    pub stop_done: bool,
    pub stop_attempts: u32,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub input_start_index: Option<usize>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub synthetic_inputs: Vec<usize>,
}
impl HookProgress {
    pub fn is_empty(&self) -> bool {
        self.turn == 0
            && self.run_id.is_none()
            && !self.session_started
            && self.pending_input.is_none()
            && self.prepared_tool.is_none()
            && self.prepared_model.is_none()
            && self.prepared_sources.is_none()
            && self.source_sequence == 0
            && self.facts.is_empty()
            && !self.stop_done
            && self.stop_attempts == 0
            && self.input_start_index.is_none()
            && self.synthetic_inputs.is_empty()
    }
}
fn zero(value: &u64) -> bool {
    *value == 0
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PreparedSources {
    pub protocol: String,
    pub revisions: Vec<Option<String>>,
    pub input_digest: String,
    pub next: usize,
    pub messages: Vec<Message>,
    pub pending: Option<PreparedSource>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PreparedSource {
    pub index: usize,
    pub plan: Value,
    pub scope: String,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PreparedTool {
    pub call: ToolCall,
    pub hooks_done: bool,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PreparedModel {
    pub request: Value,
    pub operation: String,
    pub hooks_done: bool,
    #[serde(default)]
    pub context_revisions: Vec<Option<String>>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HookFact {
    pub name: String,
    pub operation: String,
    pub payload: Value,
}
