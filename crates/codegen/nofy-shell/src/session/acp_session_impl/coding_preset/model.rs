use super::*;

pub(super) async fn execute(state: &mut CodingTurn) -> StageResult {
    let session = state.session.clone();
    let req_id = state.req_id.as_str();
    let mut effective_tools: Vec<ToolSpec> =
        if let Some(ref override_tools) = session.forked_tool_override {
            override_tools.clone()
        } else {
            session.turn_base_tool_specs(&state.tool_definitions)
        };
    if state.structured_output_tool
        && let Some(schema) = state.json_schema.clone()
    {
        effective_tools.push(ToolSpec {
            name: STRUCTURED_OUTPUT_TOOL.to_string(),
            description: Some(
                "Return your final answer as JSON matching the required schema. \
                         Call this exactly once, at the end."
                    .to_string(),
            ),
            parameters: schema,
        });
    }
    let build_req_start = std::time::Instant::now();
    let request = session
        .chat_state_handle
        .build_request(
            effective_tools,
            state.memory_reminder.take(),
            session.memory.is_enabled(),
            None,
            session.session_info.id.to_string(),
            req_id.to_owned(),
        )
        .await
        .expect("chat state actor should be alive");
    nofy_telemetry::unified_log::debug(
        "shell.turn.build_request_done",
        Some(session.session_info.id.0.as_ref()),
        Some(serde_json::json!({
            "build_request_ms": build_req_start.elapsed().as_millis() as u64,
            "loop_index": state.loop_index,
        })),
    );
    let mut request = request;
    request.x_nofy_session_id = Some(session.session_info.id.to_string());
    request.x_nofy_turn_idx = Some(
        session
            .chat_state_handle
            .get_prompt_index()
            .await
            .to_string(),
    );
    request.x_nofy_agent_id = Some(nofy_telemetry::id::agent_id());
    if request.x_nofy_deployment_id.is_none() {
        request.x_nofy_deployment_id = crate::managed_config::resolve_deployment_id(
            crate::managed_config::resolve_deployment_key().as_deref(),
        );
    }
    if state.structured_output_native {
        request.json_schema = state.json_schema.clone();
    }
    request.max_output_tokens = session
        .tool_context
        .clamp_task_model_request(request.max_output_tokens)
        .map_err(|message| acp::Error::internal_error().data(message))?;
    session.emit_event(crate::session::events::Event::PhaseChanged {
        phase: crate::session::events::Phase::WaitingForModel,
    });
    nofy_telemetry::unified_log::info(
        "shell.turn.inference_start",
        Some(session.session_info.id.0.as_ref()),
        Some(serde_json::json!({
            "loop_index": state.loop_index,
            "elapsed_since_turn_start_ms": state.conv_turn_start.elapsed().as_millis() as u64,
        })),
    );
    let model_timer = std::time::Instant::now();
    let (response, latency) = match session
        .run_turn_via_sampler(request.clone(), &mut state.rate_limit_waits)
        .await
    {
        Ok(SamplerTurnOutcome::Response(r, latency)) => (r, latency),
        Err(error) => {
            session.tool_context.fail_task_output_usage_closed();
            return Err(error);
        }
        Ok(SamplerTurnOutcome::CompactAndResubmit) => {
            state.auth_retry_schedule.reset_on_success();
            return Ok(Flow::Restart);
        }
        Ok(SamplerTurnOutcome::RefreshAuthAndResubmit { credential, store }) => {
            if state.auth_retry_schedule.reset_if_incident_spans_suspend() {
                tracing::info!("auth 401 retry: incident spanned a suspend; budget reset");
                nofy_telemetry::unified_log::info(
                    "shell.turn.auth_retry_reset_after_suspend",
                    Some(session.session_info.id.0.as_ref()),
                    Some(serde_json::json!({ "loop_index": state.loop_index })),
                );
            }
            match state.auth_retry_schedule.on_recovered_401(credential) {
                AuthRetryDecision::UnchargedResubmit { resubmit } => {
                    tracing::warn!(
                        resubmit,
                        "auth 401 retry: no credential was sent; resubmitting uncharged"
                    );
                    nofy_telemetry::unified_log::warn(
                        "shell.turn.auth_resubmit_uncharged",
                        Some(session.session_info.id.0.as_ref()),
                        Some(serde_json::json!({
                            "loop_index": state.loop_index,
                            "resubmit": resubmit,
                            "max_resubmits": AuthRetrySchedule::MAX_UNCHARGED_RESUBMITS,
                        })),
                    );
                    session
                        .send_xai_notification(NofySessionUpdate::RetryState(
                            crate::extensions::notification::RetryState::Retrying {
                                attempt: resubmit,
                                max_retries: AuthRetrySchedule::MAX_UNCHARGED_RESUBMITS,
                                reason: "Re-authenticated after 401 (request carried no \
                                             credential); retrying request"
                                    .to_string(),
                            },
                        ))
                        .await;
                    pace_uncharged_resubmit(store, session.auth_manager.as_ref()).await;
                    return Ok(Flow::Restart);
                }
                AuthRetryDecision::Backoff { attempt, delay } => {
                    let delay_ms = delay.as_millis() as u64;
                    tracing::warn!(
                        attempt,
                        delay_ms,
                        "auth 401 retry: backing off before resubmit"
                    );
                    nofy_telemetry::unified_log::warn(
                        "shell.turn.auth_retry_backoff",
                        Some(session.session_info.id.0.as_ref()),
                        Some(serde_json::json!({
                            "loop_index": state.loop_index,
                            "attempt": attempt,
                            "max_retries": AuthRetrySchedule::MAX_RETRIES,
                            "delay_ms": delay_ms,
                        })),
                    );
                    session
                        .send_xai_notification(NofySessionUpdate::RetryState(
                            crate::extensions::notification::RetryState::Retrying {
                                attempt,
                                max_retries: AuthRetrySchedule::MAX_RETRIES,
                                reason: "Re-authenticated after 401; retrying request".to_string(),
                            },
                        ))
                        .await;
                    sleep(delay).await;
                    return Ok(Flow::Restart);
                }
                decision @ (AuthRetryDecision::Exhausted
                | AuthRetryDecision::RunawayGuard { .. }) => {
                    let (awake, wall, suspended) = state.conv_turn_clock.elapsed_split();
                    let duration_note = if suspended >= std::time::Duration::from_secs(1) {
                        format!(
                            " Turn ran {} wall-clock, {} of it suspended.",
                            human_duration(wall),
                            human_duration(suspended)
                        )
                    } else {
                        format!(" Turn ran {} wall-clock.", human_duration(wall))
                    };
                    let (rejections, authenticated) = state.auth_retry_schedule.incident_counts();
                    let uncharged = state.auth_retry_schedule.uncharged_rejections();
                    let msg = match decision {
                        AuthRetryDecision::RunawayGuard { rejections } => {
                            format!(
                                "Auth recovery kept succeeding but {rejections} requests \
                                     were rejected (401) before a credential could be sent, \
                                     with no successful response in between; stopping as a \
                                     runaway guard.{duration_note}"
                            )
                        }
                        _ if authenticated == rejections => {
                            format!(
                                "Auth recovery succeeded but {rejections} authenticated \
                                     inference requests were still rejected (401); giving up \
                                     after {} retries.{duration_note}",
                                AuthRetrySchedule::MAX_RETRIES
                            )
                        }
                        _ => {
                            format!(
                                "Auth retry budget exhausted after {rejections} \
                                     post-recovery 401s ({authenticated} provably carried a \
                                     credential).{duration_note}"
                            )
                        }
                    };
                    tracing::error!(msg);
                    nofy_telemetry::unified_log::error(
                        "shell.turn.auth_retry_exhausted",
                        Some(session.session_info.id.0.as_ref()),
                        Some(serde_json::json!({
                            "loop_index": state.loop_index,
                            "decision": match decision {
                                AuthRetryDecision::RunawayGuard { .. } => "runaway_guard",
                                _ => "exhausted",
                            },
                            "rejections": rejections,
                            "authenticated": authenticated,
                            "uncharged": uncharged,
                            "wall_secs": wall.as_secs(),
                            "awake_secs": awake.as_secs(),
                            "suspended_secs": suspended.as_secs(),
                        })),
                    );
                    return Err(session.fail_turn_auth_budget_exhausted(msg).await);
                }
            }
        }
    };
    state.auth_retry_schedule.reset_on_success();
    let model_elapsed_ms = model_timer.elapsed().as_millis() as u64;
    let usage = response.usage.as_ref();
    let prompt_tokens = usage.map(|u| u.prompt_tokens);
    let cached_prompt_tokens = usage.map(|u| u.cached_prompt_tokens);
    let completion_tokens = usage.map(|u| u.completion_tokens);
    let reasoning_tokens = usage.map(|u| u.reasoning_tokens);
    let ttft_ms = latency.time_to_first_token_ms;
    let tokens_per_sec = match completion_tokens {
        Some(ct) if ct > 0 => {
            let decode_ms = match ttft_ms {
                Some(ttft) if model_elapsed_ms > ttft => model_elapsed_ms - ttft,
                _ => model_elapsed_ms,
            };
            (decode_ms > 0).then(|| {
                let tps = f64::from(ct) * 1000.0 / decode_ms as f64;
                (tps * 10.0).round() / 10.0
            })
        }
        _ => None,
    };
    nofy_telemetry::unified_log::info(
        "shell.turn.inference_done",
        Some(session.session_info.id.0.as_ref()),
        Some(serde_json::json!({
            "loop_index": state.loop_index,
            "model_elapsed_ms": model_elapsed_ms,
            "elapsed_since_turn_start_ms": state.conv_turn_start.elapsed().as_millis() as u64,
            "ttft_ms": ttft_ms,
            "itl_p50_ms": latency.itl_p50_ms,
            "attempts": latency.attempts,
            "prompt_tokens": prompt_tokens,
            "cached_prompt_tokens": cached_prompt_tokens,
            "completion_tokens": completion_tokens,
            "reasoning_tokens": reasoning_tokens,
            "tokens_per_sec": tokens_per_sec,
        })),
    );
    if let Some(usage) = response.usage.as_ref() {
        session
            .chat_state_handle
            .record_token_usage(u64::from(usage.total_tokens));
        session.send_available_commands_update().await;
    }
    state
        .turn_span_totals
        .record(&tracing::Span::current(), &response);
    // Runtime journal: pair with model.requested — usage and stop
    // reason per model response (noop if NOFY_RUNTIME_JOURNAL=0).
    session.runtime_journal.emit(
        nofy_session_journal::EventKind::ModelResponded,
        serde_json::json!({
            "stop_reason": response.stop_reason.as_ref().map(|r| r.as_str()),
            "tool_calls": response.tool_calls().len(),
            "prompt_tokens": response.usage.as_ref().map(|u| u.prompt_tokens),
            "completion_tokens": response.usage.as_ref().map(|u| u.completion_tokens),
        }),
    );
    session.clear_auth_compact_suppression();
    let model_duration_ms = model_timer.elapsed().as_millis() as u64;
    {
        let model_id = session.current_model_id().await;
        nofy_telemetry::session_ctx::log_event(nofy_telemetry::events::ModelResponseReceived {
            model_id,
            duration_ms: model_duration_ms,
            stop_reason: response
                .stop_reason
                .as_ref()
                .map(|r| format!("{r:?}").to_ascii_lowercase()),
            prompt_tokens: response.usage.as_ref().map(|u| u.prompt_tokens),
            completion_tokens: response.usage.as_ref().map(|u| u.completion_tokens),
            reasoning_tokens: response.usage.as_ref().map(|u| u.reasoning_tokens),
            cached_prompt_tokens: response.usage.as_ref().map(|u| u.cached_prompt_tokens),
        });
    }
    session.record_response_token_usage(&response, Some(model_duration_ms));
    let response_completed = session.response_completed_update(&response);
    if let Some(pt) = state.prompt_timing.take() {
        let mcp_count = session.mcp_state.lock().await.configs.len() as u32;
        let mcp_tools = session
            .agent
            .borrow()
            .tool_bridge()
            .tool_definitions()
            .await
            .iter()
            .filter(|t| t.function.name.contains("__"))
            .count() as u32;
        let turn_index = session
            .chat_state_handle
            .get_prompt_index()
            .await
            .saturating_sub(1) as u32;
        pt.emit(
            model_duration_ms,
            turn_index,
            mcp_count,
            mcp_tools,
            session.mcp_strategy,
            session.current_model_id().await,
        );
    }
    state.tool_calls = response.tool_calls().to_vec();
    state
        .metrics_drop_guard
        .record_model_response(state.tool_calls.len());
    let fallback_text = response.fallback_text();
    let stop_reason = response.stop_reason;
    let response_is_empty = response.is_empty();
    state.turn_refused = stop_reason == Some(nofy_sampling_types::StopReason::ContentFilter);
    state.refusal_explanation = response.stop_message.clone();
    state.final_answer_text = state
        .json_schema
        .is_some()
        .then(|| response.assistant_text());
    for item in response.items {
        match item {
            nofy_sampling_types::ConversationItem::Assistant(_) => {
                session.record_assistant_response(item).await;
            }
            _ => {
                session.chat_state_handle.push_tool_result(item);
            }
        }
    }
    if let Some(text) = fallback_text {
        tracing::warn!(
            text_len = text.len(),
            "emitting fallback AgentMessageChunk — no text chunks were streamed"
        );
        session
            .send_update(
                acp::SessionUpdate::AgentMessageChunk(acp::ContentChunk::new(
                    acp::ContentBlock::Text(acp::TextContent::new(text)),
                )),
                None,
            )
            .await;
    }
    if state.turn_refused && response_is_empty {
        let mut notice = "The model provider refused to generate a response \
                     for this turn (content filter)."
            .to_string();
        if let Some(explanation) = state.refusal_explanation.as_deref() {
            notice.push_str("\n\nProvider explanation: ");
            notice.push_str(explanation);
        }
        tracing::warn!(
            has_explanation = state.refusal_explanation.is_some(),
            "model response was a provider refusal — emitting notice chunk"
        );
        session
            .send_update(
                acp::SessionUpdate::AgentMessageChunk(acp::ContentChunk::new(
                    acp::ContentBlock::Text(acp::TextContent::new(notice)),
                )),
                None,
            )
            .await;
    }
    session.send_buffered_xai_update(response_completed).await;
    if stop_reason == Some(nofy_sampling_types::StopReason::Length) && state.tool_calls.is_empty() {
        match state.length_salvage.on_length_stop() {
            super::length_salvage::SalvageStep::Continue { inject_reminder } => {
                if inject_reminder {
                    session
                        .push_system_reminder(super::length_salvage::LENGTH_CONTINUE_REMINDER_BODY);
                }
                tracing::warn!(
                    session_id = %session.session_info.id,
                    retry = state.length_salvage.continues(),
                    max = state.length_salvage.budget(),
                    "Output token limit exceeded — injecting reminder and retrying"
                );
                return Ok(Flow::Restart);
            }
            super::length_salvage::SalvageStep::Exhaust => {
                tracing::error!(
                    session_id = %session.session_info.id,
                    retries = state.length_salvage.continues(),
                    "Output token limit retries exhausted, completing the turn truncated"
                );
            }
            super::length_salvage::SalvageStep::None => {}
        }
    }

    Ok(Flow::Next)
}
