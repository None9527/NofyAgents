use super::*;

pub(super) async fn execute(state: &mut CodingTurn) -> StageResult {
    let session = state.session.clone();
    if session.tool_context.task_output_token_budget.is_none()
        && session.two_pass_active()
        && !session.compaction.prefire.has_cache()
        && session.should_prefire_two_pass().await
        && session.compaction.prefire.try_begin()
    {
        let actor = std::sync::Arc::clone(&session);
        let handle = tokio::task::spawn_local(async move {
            actor.run_prefire_pass1().await;
        });
        session.compaction.prefire.set_handle(handle);
    }
    if session.tool_context.task_output_token_budget.is_none() {
        session.refresh_token_if_expired().await;
    }
    if session.tool_context.task_output_token_budget.is_none()
        && let Some(trigger_info) = session.check_auto_compact_needed().await
        && let Err(e) = session.run_compact_only(trigger_info).await
    {
        tracing::error!(error = %e, "Pre-sampling auto-compaction failed");
        if SessionActor::is_auth_compact_error(&e) {
            return Err(session.surface_compact_auth_failure(e).await);
        }
    }

    Ok(Flow::Next)
}
