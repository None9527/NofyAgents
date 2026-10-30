use super::*;

pub(super) async fn execute(state: &mut CodingTurn) -> StageResult {
    let session = state.session.clone();
    // RTAgent B2: update the no-progress streak (iterations without
    // new mutations) and let the governor end a dead run early — but
    // only when the journal's live gauge exists to prove nothing is
    // in flight (absence of observation is not evidence of idle).
    let ledger_len = session
        .tool_context
        .agent_write_ledger
        .lock()
        .unwrap()
        .len();
    if ledger_len > state.last_ledger_len {
        state.last_ledger_len = ledger_len;
        state.no_new_info_streak = 0;
    } else {
        state.no_new_info_streak += 1;
    }
    // The governor governs *budgeted* runs: with a numeric max-turns
    // limit a dead run burns host budget, so early-stop is a service.
    // An unlimited interactive run has a human present who cancels;
    // mutation-based no-progress would kill legitimate read-heavy
    // turns (analysis, Q&A) that write no files.
    if state.no_new_info_streak >= nofy_convergence::DEFAULT_NO_PROGRESS_LIMIT
        && session.max_turns.is_some()
        && session.runtime_journal.open_intent_count().is_some()
    {
        let prompt_index = *session.tool_context.prompt_index.lock().await;
        let limit_for_consult = state
            .convergence_extended_limit
            .get()
            .or(session.max_turns)
            .unwrap_or(usize::MAX);
        if let Some(nofy_convergence::BudgetDecision::Finish {
            reason: nofy_convergence::FinishReason::NoProgress,
        }) = session
            .convergence_consult(
                prompt_index,
                state.tool_turn_count as u64,
                limit_for_consult,
                state.no_new_info_streak,
            )
            .await
        {
            tracing::info!(
                session_id = %session.session_info.id,
                streak = state.no_new_info_streak,
                "convergence governor ended the run early: no progress"
            );
            return Ok(Flow::Finish(TurnOutcome::Cancelled {
                category: Some(crate::session::events::CancellationCategory::NoProgress),
                context: Some(serde_json::json!({
                    "reason": "convergence_no_progress",
                    "streak": state.no_new_info_streak,
                })),
            }));
        }
    }
    let next_turn = state.tool_turn_count + 1;
    let effective_limit = state.convergence_extended_limit.get().or(session.max_turns);
    if let Some(limit) = effective_limit
        && next_turn > limit
    {
        // RTAgent B1: consult the governor at the boundary. An earned
        // extension raises the effective limit and the run continues;
        // any other decision stops the run here as before.
        let prompt_index = *session.tool_context.prompt_index.lock().await;
        let earned_extension = session
            .convergence_consult(prompt_index, state.tool_turn_count as u64, limit, 0)
            .await
            .and_then(|decision| match decision {
                nofy_convergence::BudgetDecision::Extend { new_soft_budget } => {
                    Some(new_soft_budget)
                }
                _ => None,
            });
        if let Some(new_limit) = earned_extension {
            tracing::info!(
                session_id = %session.session_info.id,
                tool_turn_count = state.tool_turn_count,
                old_limit = limit,
                new_limit,
                "convergence earned a budget extension; continuing"
            );
            state
                .convergence_extended_limit
                .set(Some(new_limit as usize));
        } else {
            tracing::info!(
                session_id = %session.session_info.id,
                tool_turn_count = state.tool_turn_count,
                limit,
                "max-turns limit reached, stopping"
            );
            return Ok(Flow::Finish(TurnOutcome::MaxTurnsReached { limit }));
        }
    }
    state.tool_turn_count = next_turn;
    if session.tool_context.task_output_token_budget.is_none()
        && let Some(trigger_info) = session.check_preflight_overflow().await
    {
        if let Err(e) = session.run_compact_only(trigger_info).await {
            tracing::error!(error = %e, "Preflight overflow compaction failed");
            if SessionActor::is_auth_compact_error(&e) {
                return Err(session.surface_compact_auth_failure(e).await);
            }
        }
        return Ok(Flow::Restart);
    }

    Ok(Flow::Next)
}
