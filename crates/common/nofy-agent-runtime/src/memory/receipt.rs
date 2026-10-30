use crate::{Message, RunContext, RunState, events::RunLineage};

/// Proof issued by the runtime only after a completed turn has been committed
/// by a durable checkpointer. JSON and model arguments cannot construct it.
#[derive(Clone)]
pub struct DurableTurnReceipt {
    thread_id: String,
    run_id: String,
    turn_id: String,
    revision: u64,
    messages: Vec<Message>,
    output: String,
    top_level: bool,
}
impl DurableTurnReceipt {
    pub(crate) fn committed(context: &RunContext, state: &RunState, revision: u64) -> Option<Self> {
        if !state.complete
            || !state.hook_progress.stop_done
            || !state.pending_tools.is_empty()
            || state.in_flight.is_some()
            || state.completion_info.refusal.is_some()
            || matches!(
                state.completion_info.stop_reason.as_deref(),
                Some("length" | "max_tokens" | "max_output_tokens")
            )
        {
            return None;
        }
        let start = state.hook_progress.input_start_index?;
        let messages = state
            .messages
            .get(start..)?
            .iter()
            .enumerate()
            .filter(|(offset, _)| {
                state.input_progress.capture.contains_key(&(start + offset))
                    || !state
                        .hook_progress
                        .synthetic_inputs
                        .contains(&(start + offset))
            })
            .map(|(offset, message)| {
                state
                    .input_progress
                    .capture
                    .get(&(start + offset))
                    .unwrap_or(message)
                    .clone()
            })
            .collect();
        Some(Self {
            thread_id: context.thread_id.clone(),
            run_id: context.run_id.clone(),
            turn_id: serde_json::to_string(&(&context.thread_id, state.hook_progress.turn)).ok()?,
            revision,
            messages,
            output: state.output.clone(),
            top_level: context
                .capabilities
                .get::<RunLineage>()
                .is_none_or(|lineage| lineage.parent_run_id.is_none()),
        })
    }
    pub fn thread_id(&self) -> &str {
        &self.thread_id
    }
    pub fn run_id(&self) -> &str {
        &self.run_id
    }
    pub fn turn_id(&self) -> &str {
        &self.turn_id
    }
    pub fn revision(&self) -> u64 {
        self.revision
    }
    pub fn messages(&self) -> &[Message] {
        &self.messages
    }
    pub fn output(&self) -> &str {
        &self.output
    }
    pub fn top_level(&self) -> bool {
        self.top_level
    }
}
