use super::*;

pub(super) async fn execute(state: &mut CodingTurn) -> StageResult {
    let session = state.session.clone();
    let req_id = state.req_id.as_str();
    if state.tool_calls.is_empty() {
        if !state.schema_ok
            && !state.turn_refused
            && let Some(gate_cfg) = session.todo_gate_policy()
        {
            let collected = session.collect_todo_gate_input(req_id).await;
            let input = collected.as_input();
            if let TodoGateDecision::Nudge { reminder, reason } = evaluate_todo_gate(&input) {
                if state.todo_gate_fires < gate_cfg.max_fires_per_prompt {
                    state.todo_gate_fires += 1;
                    tracing::info!(
                        prompt_id = %req_id,
                        pending = ?input.pending,
                        unbacked_in_progress = ?input.in_progress_unbacked,
                        backed_in_progress = ?input.in_progress_backed,
                        backing_task_count = input.backing_task_count,
                        todo_gate_fires = state.todo_gate_fires,
                        reason = reason.as_str(),
                        "turn-end TodoGate: nudging model to advance remaining todos"
                    );
                    session
                        .events
                        .emit(crate::session::events::Event::TodoGateFired {
                            fires: state.todo_gate_fires,
                            pending: input.pending.len(),
                            in_progress: input.in_progress_unbacked.len()
                                + input.in_progress_backed.len(),
                            reason: reason.as_str(),
                        });
                    let rendered = session
                        .tool_bridge_handle()
                        .render_prompt(&reminder, &serde_json::json!({}))
                        .await
                        .unwrap_or(reminder);
                    session.push_system_reminder(&rendered);
                    return Ok(Flow::Restart);
                }
                let cap = gate_cfg.max_fires_per_prompt;
                tracing::warn!(
                    prompt_id = %req_id,
                    todo_gate_cap = cap,
                    "turn-end TodoGate: exhausted retries, falling through"
                );
                session
                    .events
                    .emit(crate::session::events::Event::TodoGateExhausted {
                        pending: input.pending.len(),
                    });
                session.push_system_reminder(&format!(
                    "The agent attempted to end this turn {cap} times \
                             with todos still pending or in_progress. Falling through \
                             to user. If you want autonomous progress, prompt the agent \
                             to continue explicitly, or clean up the todo list."
                ));
            }
        }
        if session.drain_interjections_at_safe_point().await {
            tracing::info!("Drained interjection(s) before turn completion — continuing");
            return Ok(Flow::Restart);
        }
        let snapshot = session
            .finalize_turn_bookkeeping(&state.turn_span_totals)
            .await;
        if session.drain_pending_interjections().await {
            tracing::info!("Drained late interjection(s) during turn-end bookkeeping — continuing");
            return Ok(Flow::Restart);
        }
        let structured_output = match (
            state.structured_output_validator.as_ref(),
            state.final_answer_text.as_ref(),
        ) {
            (Some(validator), Some(text)) => Some(validate_structured_output(validator, text)),
            _ => None,
        };
        return Ok(Flow::Finish(TurnOutcome::Completed {
            snapshot: Box::new(snapshot),
            tools_called: std::mem::take(&mut state.turn_tools_called),
            structured_output,
            refusal: state
                .turn_refused
                .then(|| state.refusal_explanation.clone().unwrap_or_default()),
        }));
    }
    if state.structured_output_tool
        && let Some(validator) = state.structured_output_validator.as_ref()
    {
        match session
            .handle_structured_output_tool_call(
                &mut state.tool_calls,
                validator,
                &mut state.structured_output_retries,
            )
            .await
        {
            StructuredOutputStep::Complete(validated) => {
                state
                    .turn_tools_called
                    .push(STRUCTURED_OUTPUT_TOOL.to_string());
                let snapshot = session
                    .finalize_turn_bookkeeping(&state.turn_span_totals)
                    .await;
                return Ok(Flow::Finish(TurnOutcome::Completed {
                    snapshot: Box::new(snapshot),
                    tools_called: std::mem::take(&mut state.turn_tools_called),
                    structured_output: Some(validated),
                    refusal: None,
                }));
            }
            StructuredOutputStep::Retry => return Ok(Flow::Restart),
            StructuredOutputStep::Proceed => {}
        }
    }

    Ok(Flow::Next)
}
