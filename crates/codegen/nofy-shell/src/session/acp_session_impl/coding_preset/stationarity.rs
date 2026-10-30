use super::*;

pub(super) async fn execute(state: &mut CodingTurn) -> StageResult {
    let session = state.session.clone();
    session.emit_event(crate::session::events::Event::LoopStarted {
        loop_index: state.loop_index,
    });
    state.loop_index += 1;
    if state.identical_tool_calls.run_len >= state.identical_tool_calls.hard_stop_threshold() {
        let run_len = state.identical_tool_calls.run_len;
        let tool_name = state.identical_tool_calls.tool_name.clone();
        let true_noop = state.identical_tool_calls.is_true_noop_run;
        let problematically_repeating = state.identical_tool_calls.is_problematically_repeating();
        tracing::warn!(
            session_id = %session.session_info.id,
            tool_name = %tool_name,
            run_len,
            true_noop,
            "action stationarity: ending turn after repeated identical tool calls"
        );
        nofy_telemetry::unified_log::warn(
            "shell.turn.action_stationarity_stop",
            Some(session.session_info.id.0.as_ref()),
            Some(serde_json::json!({
                "loop_index": state.loop_index,
                "tool_name": tool_name,
                "run_len": run_len,
                "true_noop": true_noop,
                "problematically_repeating": problematically_repeating,
            })),
        );
        nofy_telemetry::session_ctx::log_event(nofy_telemetry::events::ActionStationarityStop {
            true_noop,
            problematically_repeating,
            run_len,
            tool_name: tool_name.clone(),
        });
        let snapshot = session
            .finalize_turn_bookkeeping(&state.turn_span_totals)
            .await;
        return Ok(Flow::Finish(TurnOutcome::StationarityEnded {
            snapshot: Box::new(snapshot),
        }));
    }
    if state.identical_tool_calls.take_nudge() {
        let run_len = state.identical_tool_calls.run_len;
        let tool_name = state.identical_tool_calls.tool_name.clone();
        let problematically_repeating = state.identical_tool_calls.is_problematically_repeating();
        tracing::warn!(
            session_id = %session.session_info.id,
            tool_name = %tool_name,
            run_len,
            "action stationarity: nudging model to break repeated identical tool calls"
        );
        nofy_telemetry::unified_log::warn(
            "shell.turn.action_stationarity_nudge",
            Some(session.session_info.id.0.as_ref()),
            Some(serde_json::json!({
                "loop_index": state.loop_index,
                "tool_name": tool_name,
                "run_len": run_len,
                "problematically_repeating": problematically_repeating,
            })),
        );
        nofy_telemetry::session_ctx::log_event(nofy_telemetry::events::ActionStationarityNudge {
            problematically_repeating,
            run_len,
            tool_name: tool_name.clone(),
        });
        let reminder = session
            .tool_bridge_handle()
            .render_prompt(
                ACTION_STATIONARITY_NUDGE_TEMPLATE,
                &serde_json::json!({
                    "tool_name": tool_name,
                    "run_len": run_len,
                }),
            )
            .await
            .unwrap_or_else(|| ACTION_STATIONARITY_NUDGE_TEMPLATE.to_string());
        session.push_system_reminder(&reminder);
    }

    Ok(Flow::Next)
}
