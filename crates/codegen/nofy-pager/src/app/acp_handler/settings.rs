use super::*;

/// Handle `nofy/models/update` — model list changed (etag-triggered refresh).
pub(super) fn handle_models_update(notif: &acp::ExtNotification, app: &mut AppView) -> bool {
    if let Ok(model_state) = serde_json::from_str::<acp::SessionModelState>(notif.params.get()) {
        use crate::acp::model_state::ModelState;
        let new_models = ModelState::from(Some(model_state));
        tracing::info!(
            count = new_models.available.len(),
            "models updated via nofy/models/update"
        );

        let shell_fallback_current = new_models.current.clone();

        // Override app-level default with the active agent's model.
        let mut app_models = new_models.clone();
        if let ActiveView::Agent(id) = app.active_view
            && let Some(agent) = app.agents.get(&id)
            && let Some(ref agent_model) = agent.session.models.current
            && app_models.available.contains_key(agent_model)
        {
            app_models.current = Some(agent_model.clone());
        }

        app.models = app_models;

        for agent in app.agents.values_mut() {
            // Log when an update drops the agent's active model — this is the
            // moment the status bar visibly "switches model mid-conversation"
            // (the agent falls back to the shell's current model below).
            if let Some(ref current) = agent.session.models.current
                && !new_models.available.contains_key(current)
            {
                tracing::warn!(
                    current_model = %current.0,
                    fallback = ?shell_fallback_current.as_ref().map(|m| m.0.as_ref()),
                    available_count = new_models.available.len(),
                    "models update removed this agent's current model; falling back"
                );
            }
            agent
                .session
                .models
                .update_catalog(new_models.available.clone(), shell_fallback_current.clone());
        }
        true
    } else {
        tracing::warn!("Failed to parse nofy/models/update");
        false
    }
}

/// Handle `nofy/settings/update` — locally resolved settings refreshed on `/new`.
pub(super) fn handle_settings_update(notif: &acp::ExtNotification, app: &mut AppView) -> bool {
    let Ok(update) = serde_json::from_str::<PagerSettingsUpdate>(notif.params.get()) else {
        tracing::warn!("Failed to parse nofy/settings/update");
        return false;
    };

    {
        // Keep the pager's auto-permission-mode gate live with the shell's
        // disk-resolved value. Refresh the startup snapshot so the Shift+Tab
        // cycle and the settings modal both reflect a config change without a
        // restart.
        let v = update.auto_permission_mode_enabled;
        app.auto_mode_gate = v;
        // Mid-session kill switch: when the gate just went off, drop displayed
        // Auto to Ask + clear every agent's per-session flag (shared with the
        // startup reconcile), AND tell live sessions to leave Auto. Clearing only
        // the display would let the agent keep classifier-approving while the UI
        // shows "Ask" — the emergency-off must actually disable enforcement.
        if !app.auto_mode_gate {
            // Sessions to notify: agents that HAD Auto on (capture before the
            // downgrade clears the flag) and have a live session id.
            let leaving_auto: Vec<acp::SessionId> = app
                .agents
                .values()
                .filter(|a| a.session.is_auto())
                .filter_map(|a| a.session.session_id.clone())
                .collect();
            super::super::dispatch::downgrade_displayed_auto_if_gated(app);
            notify_sessions_leave_auto(app, &leaving_auto);
        }
        // Reveal/hide `/auto` on every slash surface in lockstep with the gate
        // (covers both a mid-session kill-switch and re-enablement).
        app.sync_permission_mode_slash_gate();
    }

    // While the soft default still owns the mode, a push re-arms
    // `default_yolo` + UI for the next `/new` from the local config; once the
    // user claims a mode (Shift+Tab / settings / `/mode`) the latch is
    // cleared and pushes leave it alone.
    if app.permission_mode_from_soft_default {
        // One config read at the I/O boundary; the applier is deterministic.
        let root = nofy_shell::config::load_effective_config().ok();
        apply_soft_default_permission_mode(app, root.as_ref().and_then(|r| r.get("ui")));
    }

    // Load config layers once for the group_tool_verbs + collapsed_edit_blocks
    // resolution. Loaded unconditionally: the UI flags re-resolve on every
    // update (see below), and updates are rare (post-auth refresh, `/new`),
    // so three small TOML reads are fine.
    let (requirements, user_config, managed_config) = (
        nofy_shell::config::load_merged_requirements(),
        nofy_shell::config::load_from_disk().ok(),
        nofy_shell::config::load_managed_config().ok(),
    );

    // Re-resolve the full local chain into the render cache (mirrors the
    // event_loop.rs startup resolve) so mid-session local config edits surface
    // on `/new`.
    let resolved = nofy_shell::util::config::resolve_group_tool_verbs(
        requirements.as_ref(),
        user_config.as_ref(),
        managed_config.as_ref(),
    )
    .value;
    // On a real flip, re-fold every live transcript (mirrors dispatch's
    // set_group_tool_verbs_inner); unchanged values keep `/new` cheap.
    // Stale expansion ids describe the old grouping shape — drop them so the
    // re-fold can't reopen a verb slot expanded or mark a coincident dense
    // group expanded (see `clear_group_expansion`).
    if resolved != crate::appearance::cache::load_group_tool_verbs() {
        crate::appearance::cache::set_group_tool_verbs(resolved);
        for agent in app.agents.values_mut() {
            agent.scrollback.clear_group_expansion();
            agent.scrollback.invalidate_heights();
            for child in agent.subagent_views.values_mut() {
                child.scrollback.clear_group_expansion();
                child.scrollback.invalidate_heights();
            }
        }
    }

    let resolved = nofy_shell::util::config::resolve_collapsed_edit_blocks(
        requirements.as_ref(),
        user_config.as_ref(),
        managed_config.as_ref(),
    )
    .value;
    // On a real flip, re-materialize on-default Edit rows + repaint suffixes
    // in every live transcript (mirrors dispatch's
    // set_collapsed_edit_blocks_inner); unchanged values keep `/new` cheap.
    let prev = crate::appearance::cache::load_collapsed_edit_blocks();
    if resolved != prev {
        crate::appearance::cache::set_collapsed_edit_blocks(resolved);
        for agent in app.agents.values_mut() {
            agent
                .scrollback
                .apply_collapsed_edit_blocks_flip(prev, resolved);
            for child in agent.subagent_views.values_mut() {
                child
                    .scrollback
                    .apply_collapsed_edit_blocks_flip(prev, resolved);
            }
        }
    }

    // `scheduler_background_loops` is deliberately absent from this handler,
    // unlike the flags above. A live session's scheduled fires keep the mode
    // the shell pinned when the session's actor spawned, so applying a pushed
    // flip here would make `/loop` promise a runtime those fires never get.
    // The per-session value arrives on the `session/new` / `session/load`
    // response instead (`AgentView::scheduler_background_loops`).

    // Tips arrive already merged from the config layers by the shell.
    app.tips = update.tips;
    if !app.tips.is_empty() {
        let nofy_home = nofy_tools::util::nofy_home::nofy_home();
        app.tip = nofy_shell::util::tips::pick_and_advance(&app.tips, &nofy_home);
    } else {
        app.tip = None;
    }

    // Dropdown tags arrive already resolved (local [slash_command_tags] + env)
    // by the shell.
    *app.command_tags.borrow_mut() = update.slash_command_tags.into_iter().collect();

    tracing::info!("settings updated via nofy/settings/update");
    true
}

/// Re-arm the next `/new` from the local `[ui]` config's `permission_mode`.
/// Live sessions stay untouched; nothing is persisted.
pub(super) fn apply_soft_default_permission_mode(
    app: &mut AppView,
    effective_ui: Option<&toml::Value>,
) {
    let mode = nofy_shell::util::config::resolve_permission_mode(effective_ui);
    app.default_yolo = mode.is_always_approve() && app.yolo_policy_block.is_none();
    let auto = mode.is_auto() && app.auto_mode_gate && !app.default_yolo;
    app.current_ui.permission_mode = Some(if auto {
        "auto".to_string()
    } else if app.default_yolo {
        "always-approve".to_string()
    } else {
        nofy_shell::util::config::resolved_display_permission_mode(effective_ui).to_string()
    });
}

/// Tell live sessions to leave Auto on the mid-session kill-switch: fire the
/// `nofy/yolo_mode_changed` notification the agent maps to
/// `SetAutoMode { enabled: false }`, fire-and-forget over the shared ACP channel.
/// The notification is CLIENT-scoped (the agent applies it to every session of
/// the sending client), so one send covers all affected sessions. `yolo_mode` is
/// deliberately OMITTED — the agent skips the yolo branch when the key is absent,
/// so a sibling tab's always-approve is preserved; only auto is cleared.
pub(super) fn notify_sessions_leave_auto(app: &AppView, session_ids: &[acp::SessionId]) {
    if session_ids.is_empty() {
        return;
    }
    let params = serde_json::json!({
        "auto_mode": false,
        "permission_mode": "ask",
    });
    let notification = acp::ExtNotification::new(
        "nofy/yolo_mode_changed",
        serde_json::value::to_raw_value(&params)
            .expect("serialize yolo_mode_changed params")
            .into(),
    );
    let (response_tx, _response_rx) = tokio::sync::oneshot::channel();
    let args = nofy_acp_lib::AcpArgs {
        request: notification,
        response_tx,
    };
    let _ = app.acp_tx.send(args.into());
}

/// Handle `nofy/sessions/changed` — the leader broadcasts roster
/// upserts/removals to all clients (FleetView dashboard).
pub(super) fn handle_sessions_changed(notif: &acp::ExtNotification, app: &mut AppView) -> bool {
    let Ok(changed) = serde_json::from_str::<crate::app::roster::RosterChanged>(notif.params.get())
    else {
        tracing::warn!("Failed to parse nofy/sessions/changed");
        return false;
    };
    let mut affected = false;
    for entry in changed.upserted {
        app.upsert_roster_entry(entry);
        affected = true;
    }
    for sid in changed.removed {
        app.remove_roster_entry(&sid);
        affected = true;
    }
    affected
}

pub(super) fn handle_announcements_update(notif: &acp::ExtNotification, app: &mut AppView) -> bool {
    let Ok(parsed) =
        serde_json::from_str::<nofy_announcements::AnnouncementsRefreshed>(notif.params.get())
    else {
        return false;
    };

    if parsed.r#gen <= app.announcements_last_gen {
        return false;
    }

    // The push carries the shell's fully resolved list (config layers +
    // `NOFY_ANNOUNCEMENTS_OVERRIDE` already merged).
    apply_announcements_update(app, parsed.r#gen, &parsed.announcements);
    true
}

/// Apply half of [`handle_announcements_update`], with the list injected so
/// the prune behavior is unit-testable without disk state.
pub(super) fn apply_announcements_update(
    app: &mut AppView,
    next_gen: u64,
    pushed: &[nofy_announcements::RemoteAnnouncement],
) {
    let announcements = nofy_announcements::filter_expired(pushed.to_vec());

    app.announcement = match app.announcement.as_ref() {
        Some(current) => announcements
            .iter()
            .find(|a| *a == current)
            .cloned()
            .or_else(|| pick_random_announcement(&announcements)),
        None => pick_random_announcement(&announcements),
    };
    app.active_announcements = announcements;
    app.announcements_last_gen = next_gen;
    // Opportunistic per-ID prune on a real update (never per frame) so the hidden set cannot grow unboundedly.
    if nofy_announcements::prune_hidden_announcement_ids(
        &mut app.hidden_announcement_ids,
        &app.active_announcements,
    ) {
        app.pending_effects
            .push(Effect::PersistAnnouncementsHidden {
                hidden_ids: app.hidden_announcement_ids.clone(),
            });
    }
    app.sync_session_announcement_slash_gate();
}

pub(super) fn pick_random_announcement(
    announcements: &[nofy_announcements::RemoteAnnouncement],
) -> Option<nofy_announcements::RemoteAnnouncement> {
    if announcements.is_empty() {
        return None;
    }
    use rand::Rng;
    let idx = rand::rng().random_range(0..announcements.len());
    announcements.get(idx).cloned()
}

/// Deserialization type for the `nofy/settings/update` notification payload.
///
/// This is intentionally a separate struct from `SettingsUpdateNotification` in
/// `nofy-shell/src/agent/mvp_agent.rs`. The shell side derives `Serialize`
/// and owns the canonical field set; this pager side derives `Deserialize`.
/// Keeping them separate avoids coupling the pager to shell internals
/// and lets each side evolve independently (e.g. adding a shell-only field
/// doesn't require a pager change).
///
/// **Keep in sync** with field names/types in `SettingsUpdateNotification` at
/// `nofy-shell/src/agent/mvp_agent.rs` when adding fields that both sides
/// need.
#[derive(serde::Deserialize)]
pub(super) struct PagerSettingsUpdate {
    #[serde(default)]
    tips: Vec<String>,
    #[serde(default)]
    slash_command_tags: std::collections::BTreeMap<String, String>,
    #[serde(default)]
    auto_permission_mode_enabled: bool,
}
