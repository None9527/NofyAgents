use super::*;

pub(super) async fn execute(state: &mut CodingTurn) -> StageResult {
    let session = state.session.clone();
    for tc in &state.tool_calls {
        if let Some((server, tool)) = crate::session::mcp_servers::parse_mcp_tool_name(&tc.name) {
            let span = tracing::Span::current();
            span.record("mcp_server.name", server.as_str());
            span.record("mcp_tool.name", tool.as_str());
        }
        state.turn_tools_called.push(tc.name.clone());
    }
    let step_signature = step_signature(&state.tool_calls);
    let step_tool_name = state
        .tool_calls
        .iter()
        .map(|tc| tc.name.clone())
        .min()
        .unwrap_or_default();
    let tool_bridge = session.tool_bridge_handle();
    let step_tool_kinds = state
        .tool_calls
        .iter()
        .map(|tc| tool_bridge.tool_kind(&tc.name))
        .collect::<Vec<_>>();
    let step_problematic = step_is_problematically_repeating(&step_tool_kinds);
    let is_true_noop = session.is_run_true_step(&state.tool_calls).await;
    state.identical_tool_calls.observe(
        &step_signature,
        &step_tool_name,
        step_problematic,
        is_true_noop,
    );
    if is_true_noop {
        nofy_telemetry::session_ctx::log_event(nofy_telemetry::events::ShellTrueNoop {
            tool_name: step_tool_name.clone(),
        });
    }
    let tool_call_responses: Vec<ToolCallResponse> = std::mem::take(&mut state.tool_calls)
        .into_iter()
        .map(|tc| ToolCallResponse {
            id: tc.id.as_ref().to_owned(),
            kind: "function".to_string(),
            function: crate::sampling::types::ToolCallFunction {
                name: tc.name,
                arguments: tc.arguments.as_ref().to_owned(),
            },
        })
        .collect();
    session.emit_event(crate::session::events::Event::PhaseChanged {
        phase: crate::session::events::Phase::ToolExecution,
    });
    let execute_tool_calls_result = session.execute_tool_calls(tool_call_responses).await;
    match execute_tool_calls_result {
        Ok(ToolLoop::PermissionReject { tool_name, reason }) => {
            return Ok(Flow::Finish(TurnOutcome::Cancelled {
                category: Some(crate::session::events::CancellationCategory::PermissionRejected),
                context: Some(serde_json::json!({
                    "tool_name": tool_name,
                    "reason": reason,
                })),
            }));
        }
        Ok(ToolLoop::HookDenied { .. }) => {}
        Ok(ToolLoop::Cancelled) => {
            return Ok(Flow::Finish(TurnOutcome::Cancelled {
                category: Some(crate::session::events::CancellationCategory::PermissionCancelled),
                context: None,
            }));
        }
        Ok(ToolLoop::FollowupMessage(followup_message)) => {
            session
                .add_followup_message_as_user_turn(&followup_message)
                .await;
            return Ok(Flow::Restart);
        }
        _ => {}
    }

    Ok(Flow::Next)
}
