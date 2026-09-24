use super::*;
use nofy_tool_types::ForegroundSpawnInterrupt;
use nofy_tools::implementations::nofy_build::task::backend::ChannelBackend;

const HAND_OFF_TIMEOUT: std::time::Duration = std::time::Duration::from_secs(2);

impl SessionActor {
    pub(super) async fn hand_off_foreground_subagents(
        &self,
        prompt_id: &str,
        interrupt: ForegroundSpawnInterrupt,
    ) -> HashMap<String, String> {
        let Some(event_tx) = self.tool_context.subagent_event_tx.clone() else {
            return HashMap::new();
        };
        let backend = ChannelBackend::for_session(event_tx, self.session_id_string());
        let handed_off = match tokio::time::timeout(
            HAND_OFF_TIMEOUT,
            backend.hand_off_foreground_for_prompt(prompt_id),
        )
        .await
        {
            Ok(handed_off) => handed_off,
            Err(_) => {
                tracing::warn!(
                    prompt_id,
                    "subagent coordinator did not answer the foreground handoff"
                );
                return HashMap::new();
            }
        };

        handed_off
            .into_iter()
            .map(|child| {
                let text = nofy_tool_types::format_subagent_backgrounded_on_turn_end(
                    &child.subagent_id,
                    &child.subagent_type,
                    &child.description,
                    &self.tool_context.task_output_tool_name,
                    interrupt,
                    child.state,
                    self.tool_context.auto_wake_enabled,
                );
                (child.tool_call_id, text)
            })
            .collect()
    }
}
