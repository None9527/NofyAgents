use super::*;

pub(super) async fn execute(state: &mut CodingTurn) -> StageResult {
    let session = state.session.clone();
    session.drain_interjections_at_safe_point().await;
    session.flush_pending_skill_reminders().await;
    session.inject_pending_monitor_events().await;
    state.memory_reminder = session.first_turn_memory_reminder().await;
    if state.memory_reminder.is_some() {
        session
            .memory
            .injection_count
            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        tracing::info!(
            target: nofy_telemetry::memory_log::TARGET,
            "MEMORY_INJECT: first-turn memory context injected"
        );
    }
    session.maybe_inject_mcp_reminder().await;

    Ok(Flow::Next)
}
