#![cfg_attr(rustfmt, rustfmt::skip)]
    use super::*;

    /// Build an `nofy/settings/update` carrying only the scheduler flag.
    fn scheduler_background_loops_update(value: bool) -> acp::ExtNotification {
        acp::ExtNotification::new(
            "nofy/settings/update",
            std::sync::Arc::from(
                serde_json::value::to_raw_value(&serde_json::json!({
                    "scheduler_background_loops": value
                }))
                .unwrap(),
            ),
        )
    }

    /// Drain the `/loop` instruction the pager actually stored for a session.
    fn loop_instruction(app: &mut AppView, args: &str) -> String {
        use crate::app::actions::Action;

        // `/loop` is `required_tools()`-gated and the registry fails closed
        // until the toolset is advertised, so a bare test agent never reaches
        // the command.
        if let Some(agent) = app.agents.get_mut(&AgentId(0)) {
            agent
                .prompt
                .slash_controller
                .registry_mut()
                .set_available_tools(
                    [nofy_tools::implementations::nofy_build::SCHEDULER_CREATE_TOOL_NAME]
                        .into_iter()
                        .map(str::to_string)
                        .collect(),
                );
        }
        let effects =
            crate::app::dispatch::dispatch(Action::SendPrompt(format!("/loop {args}")), app);
        let blocks = effects
            .iter()
            .find_map(|e| match e {
                Effect::SendPromptBlocks { blocks, .. } => Some(blocks),
                _ => None,
            })
            .expect("/loop must enqueue an instruction and drain it");
        match &blocks[0] {
            acp::ContentBlock::Text(text) => text.text.clone(),
            other => panic!("expected a text prompt block, got {other:?}"),
        }
    }

    /// `/loop`'s wording must describe THIS session's fires. The shell pins the
    /// fire mode when a session's actor spawns, so a mid-session settings push
    /// carrying the opposite value must not change the instruction: describing
    /// detached fires as in-session drops the self-contained state those fires
    /// need.
    #[test]
    fn loop_fire_mode_follows_session_not_later_settings_push() {
        use crate::app::actions::{Action, TaskResult};
        use nofy_tools::implementations::nofy_build::{
            LoopFireMode, loop_schedule_instruction,
        };

        let mut app = make_app_with_agent("sess-loop");
        // Seed says detached; only the session's own answer can produce the
        // in-session wording asserted below.
        app.scheduler_background_loops_seed = true;
        crate::app::dispatch::dispatch(
            Action::TaskComplete(TaskResult::SessionCreated {
                agent_id: AgentId(0),
                session_id: acp::SessionId::new("sess-loop"),
                models: None,
                scheduler_background_loops: Some(false),
            }),
            &mut app,
        );

        assert!(handle_ext_notification(
            &scheduler_background_loops_update(true),
            &mut app
        ));

        assert_eq!(
            loop_instruction(&mut app, "5m check ci"),
            loop_schedule_instruction("5m check ci", LoopFireMode::InSession),
            "a pushed flip must not re-describe fires this session already pinned"
        );
    }

    /// The value is session-scoped, not frozen for the process: resuming a
    /// session adopts the mode that resume's spawn pinned.
    #[test]
    fn loop_fire_mode_adopts_the_loaded_session_value() {
        use crate::app::actions::{Action, TaskResult};
        use nofy_tools::implementations::nofy_build::{
            LoopFireMode, loop_schedule_instruction,
        };

        let mut app = make_app_with_agent("sess-loop-load");
        // Opposite of both the seed and the pre-resume value, so only the load
        // response can produce the detached wording asserted below.
        app.scheduler_background_loops_seed = false;
        crate::app::dispatch::dispatch(
            Action::TaskComplete(TaskResult::SessionCreated {
                agent_id: AgentId(0),
                session_id: acp::SessionId::new("sess-loop-load"),
                models: None,
                scheduler_background_loops: Some(false),
            }),
            &mut app,
        );
        crate::app::dispatch::dispatch(
            Action::TaskComplete(TaskResult::SessionLoaded {
                agent_id: AgentId(0),
                session_id: acp::SessionId::new("sess-loop-load"),
                models: None,
                code_restored: false,
                restore_summary: None,
                restore_degree: None,
                running_prompt_id: None,
                scheduler_background_loops: Some(true),
            }),
            &mut app,
        );

        assert_eq!(
            loop_instruction(&mut app, "5m check ci"),
            loop_schedule_instruction("5m check ci", LoopFireMode::Detached),
            "resume must adopt the value its own spawn pinned"
        );
    }

    #[test]
    fn settings_update_re_resolves_group_tool_verbs_from_local_layers() {
        // The expected value comes from the same chain the handler resolves,
        // so the test holds regardless of host config/env.
        let requirements = nofy_shell::config::load_merged_requirements();
        let user_config = nofy_shell::config::load_from_disk().ok();
        let managed_config = nofy_shell::config::load_managed_config().ok();
        let expected = nofy_shell::util::config::resolve_group_tool_verbs(
            requirements.as_ref(),
            user_config.as_ref(),
            managed_config.as_ref(),
        )
        .value;
        let mut app = make_app_with_agent("sess-1");

        // Seed the cache opposite to the expected outcome so only a real
        // re-resolve can pass.
        crate::appearance::cache::set_group_tool_verbs(!expected);
        assert!(handle_ext_notification(&blank_settings_update(), &mut app));
        assert_eq!(
            crate::appearance::cache::load_group_tool_verbs(),
            expected,
            "a settings push must re-resolve the local chain into the cache"
        );
        // Restore default (on) for other tests that share the process cache.
        crate::appearance::cache::set_group_tool_verbs(true);
    }

    #[test]
    fn settings_update_re_resolves_collapsed_edit_blocks_from_local_layers() {
        // The expected value comes from the same chain the handler resolves,
        // so the test holds regardless of host config/env.
        let requirements = nofy_shell::config::load_merged_requirements();
        let user_config = nofy_shell::config::load_from_disk().ok();
        let managed_config = nofy_shell::config::load_managed_config().ok();
        let expected = nofy_shell::util::config::resolve_collapsed_edit_blocks(
            requirements.as_ref(),
            user_config.as_ref(),
            managed_config.as_ref(),
        )
        .value;
        let mut app = make_app_with_agent("sess-1");

        // Seed the cache opposite to the expected outcome so only a real
        // re-resolve can pass.
        crate::appearance::cache::set_collapsed_edit_blocks(!expected);
        assert!(handle_ext_notification(&blank_settings_update(), &mut app));
        assert_eq!(
            crate::appearance::cache::load_collapsed_edit_blocks(),
            expected,
            "a settings push must re-resolve the local chain into the cache"
        );
        // Restore default (off) for other tests that share the process cache.
        crate::appearance::cache::set_collapsed_edit_blocks(false);
    }

    /// A collapsed_edit_blocks flip re-materializes on-default Edit rows in
    /// the live transcript (the same policy the settings toggle applies via
    /// `apply_collapsed_edit_blocks_flip`).
    #[test]
    fn settings_update_collapsed_edit_blocks_flip_refolds_live_edits() {
        use crate::scrollback::types::DisplayMode;

        let requirements = nofy_shell::config::load_merged_requirements();
        let user_config = nofy_shell::config::load_from_disk().ok();
        let managed_config = nofy_shell::config::load_managed_config().ok();
        let expected = nofy_shell::util::config::resolve_collapsed_edit_blocks(
            requirements.as_ref(),
            user_config.as_ref(),
            managed_config.as_ref(),
        )
        .value;

        // Seed the cache opposite to the local resolution so the push is a
        // real flip on every host.
        crate::appearance::cache::set_collapsed_edit_blocks(!expected);
        let mut app = make_app_with_agent("sess-1");
        let id = {
            let sb = &mut app.agents.get_mut(&AgentId(0)).unwrap().scrollback;
            sb.push_block(crate::scrollback::block::RenderBlock::ToolCall(
                crate::scrollback::blocks::tool::ToolCallBlock::Edit(
                    crate::scrollback::blocks::tool::EditToolCallBlock::new("f.rs", vec![]),
                ),
            ))
        };
        assert_eq!(
            app.agents[&AgentId(0)].scrollback.get_by_id(id).unwrap().display_mode,
            if expected { DisplayMode::Expanded } else { DisplayMode::Collapsed },
            "the pre-push cache value materializes the row"
        );

        assert!(handle_ext_notification(&blank_settings_update(), &mut app));
        assert_eq!(
            app.agents[&AgentId(0)].scrollback.get_by_id(id).unwrap().display_mode,
            if expected { DisplayMode::Collapsed } else { DisplayMode::Expanded },
            "the flip must re-materialize the Edit row from the local resolution"
        );
        // Restore default (off) for other tests that share the process cache.
        crate::appearance::cache::set_collapsed_edit_blocks(false);
    }

    /// The live-refresh flip mirrors `set_group_tool_verbs_inner`'s stale
    /// group-expansion cleanup: a previously expanded verb slot must not
    /// survive a flip as an expanded header.
    #[test]
    fn settings_update_flip_resets_stale_group_expansion() {
        crate::appearance::cache::set_group_tool_verbs(true);
        let mut app = make_app_with_agent("sess-1");
        {
            let sb = &mut app.agents.get_mut(&AgentId(0)).unwrap().scrollback;
            for i in 0..3 {
                sb.push_block(crate::scrollback::block::RenderBlock::read(
                    format!("f{i}.rs"),
                    None,
                ));
            }
            sb.prepare_layout(80, 40);
            sb.set_selected(Some(0));
            assert!(sb.toggle_group_expansion());
            sb.prepare_layout(80, 40);
            let info = sb.get_cached_entry_layouts().unwrap()[0];
            assert!(info.group_collapse_header, "expanded verb slot armed");
        }

        assert!(handle_ext_notification(&blank_settings_update(), &mut app));
        if crate::appearance::cache::load_group_tool_verbs() {
            // The local layers resolve on, so no flip occurred and the cleanup
            // path didn't run — nothing to assert on this machine.
            return;
        }
        let sb = &mut app.agents.get_mut(&AgentId(0)).unwrap().scrollback;
        sb.prepare_layout(80, 40);
        let info = sb.get_cached_entry_layouts().unwrap()[0];
        assert!(
            !info.group_collapse_header,
            "the flip must drop the stale expansion"
        );
        assert!(
            sb.get_cached_entry_height(1).unwrap_or(0) > 0,
            "rows render individually after the flip"
        );
    }

    #[test]
    fn auto_gate_killswitch_clears_all_agents_regardless_of_active_mirror() {
        // Two agents both in auto; the active tab's global mirror reads "ask"
        // (a tab switch / Shift+Tab re-anchored it away from auto). A
        // mid-session gate kill-switch (`auto_permission_mode_enabled=false`)
        // must clear the per-session auto flag on BOTH agents. The old code
        // gated this fan-out on `current_ui.permission_mode == "auto"`, so it
        // skipped background agents and left stale `auto_mode` that
        // `switch_to_agent` could re-anchor back to "auto" on return.
        let mut app = make_app_two_agents();
        app.auto_mode_gate = true;
        for agent in app.agents.values_mut() {
            agent.session.auto_mode = true;
        }
        // Active tab's mirror is NOT "auto" — the old bug's skip condition.
        app.current_ui.permission_mode = Some("ask".into());

        let killswitch = acp::ExtNotification::new(
            "nofy/settings/update",
            serde_json::value::to_raw_value(
                &serde_json::json!({ "auto_permission_mode_enabled": false }),
            )
            .unwrap()
            .into(),
        );
        let _ = handle_ext_notification(&killswitch, &mut app);

        assert!(!app.auto_mode_gate, "gate must be off after kill-switch");
        for (id, agent) in &app.agents {
            assert!(
                !agent.session.auto_mode,
                "agent {id:?} auto_mode must be cleared by the kill-switch"
            );
        }
    }

    #[test]
    fn auto_gate_killswitch_notifies_agents_to_leave_auto() {
        // The kill-switch must tell live sessions to leave Auto, else the agent
        // keeps classifier-approving while the UI shows "Ask". The notification is
        // CLIENT-scoped, so exactly ONE fires regardless of how many tabs were in
        // auto; it omits `yolo_mode` so a sibling always-approve tab is preserved.
        let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel();
        let mut app = AppView::new(tx, ModelState::default(), Vec::new());
        // Two auto agents + one always-approve sibling, all with live sessions.
        app.agents.insert(AgentId(0), make_agent(Some("sess-0")));
        app.agents.insert(AgentId(1), make_agent(Some("sess-1")));
        app.agents.insert(AgentId(2), make_agent(Some("sess-yolo")));
        app.auto_mode_gate = true;
        app.agents.get_mut(&AgentId(0)).unwrap().session.auto_mode = true;
        app.agents.get_mut(&AgentId(1)).unwrap().session.auto_mode = true;
        app.agents.get_mut(&AgentId(2)).unwrap().session.yolo_mode = true;

        let killswitch = acp::ExtNotification::new(
            "nofy/settings/update",
            serde_json::value::to_raw_value(
                &serde_json::json!({ "auto_permission_mode_enabled": false }),
            )
            .unwrap()
            .into(),
        );
        let _ = handle_ext_notification(&killswitch, &mut app);

        assert!(!app.auto_mode_gate, "gate must be off after kill-switch");
        // Sibling always-approve is untouched — the kill-switch clears only auto.
        assert!(
            app.agents[&AgentId(2)].session.is_yolo(),
            "sibling always-approve must stay yolo after the auto kill-switch"
        );

        let mut leave_auto_notifs = 0;
        while let Ok(msg) = rx.try_recv() {
            if let nofy_acp_lib::AcpAgentMessage::ExtNotification(args) = msg {
                if args.request.method.as_ref() != "nofy/yolo_mode_changed" {
                    continue;
                }
                let params: serde_json::Value =
                    serde_json::from_str(args.request.params.get()).unwrap();
                assert_eq!(params["auto_mode"], serde_json::json!(false));
                assert_eq!(params["permission_mode"], serde_json::json!("ask"));
                assert!(
                    params.get("yolo_mode").is_none(),
                    "yolo_mode must be omitted so a sibling always-approve session is preserved"
                );
                leave_auto_notifs += 1;
            }
        }
        assert_eq!(
            leave_auto_notifs, 1,
            "exactly one client-scoped leave-auto notification, regardless of agent count"
        );
    }

    /// The settings path must not touch announcements: the shell already emits
    /// gen-ordered `nofy/announcements/update` for every announcements change,
    /// and a gen-less apply here could clobber a newer push.
    #[test]
    fn settings_update_ignores_announcements_payload() {
        let mut app = make_app_with_agent("sess-ann");
        app.active_announcements = vec![critical_announcement("from-push")];
        app.announcements_last_gen = 7;

        let notif = acp::ExtNotification::new(
            "nofy/settings/update",
            serde_json::value::to_raw_value(&serde_json::json!({
                "announcements": [critical_announcement("from-settings")],
            }))
            .unwrap()
            .into(),
        );
        let _ = handle_ext_notification(&notif, &mut app);

        assert_eq!(
            app.active_announcements,
            vec![critical_announcement("from-push")],
            "settings/update must not replace the pushed announcements"
        );
        assert_eq!(app.announcements_last_gen, 7, "watermark untouched");
    }


    /// User-owned mode must not re-arm default_yolo or rewrite UI on a push.
    #[test]
    fn permission_mode_user_claim_blocks_soft_default_rearm() {
        let mut app = make_app_with_agent("sess-user-claim");
        app.auto_mode_gate = true;
        app.permission_mode_from_soft_default = false;
        app.current_ui.permission_mode = Some("ask".into());
        app.default_yolo = false;

        let _ = handle_ext_notification(&blank_settings_update(), &mut app);
        assert!(
            !app.default_yolo,
            "user-claimed mode must not re-arm default_yolo on a settings push"
        );
        assert_eq!(
            app.current_ui.permission_mode.as_deref(),
            Some("ask"),
            "user-claimed UI must not be rewritten by the soft-default rearm"
        );
        assert!(
            !app.permission_mode_from_soft_default,
            "user claim origin stays false"
        );
    }

    /// Positive wiring: a push with the latch held must reach the applier
    /// through the real handler. The handler's ambient effective-config read
    /// decides WHICH mode wins (exact outcomes are pinned on the applier with
    /// injected TOML), so this asserts the applier's host-independent
    /// signature instead: the non-canonical sentinel display is rewritten to
    /// a canonical mode, latch preserved.
    #[test]
    fn permission_mode_soft_default_push_reaches_applier() {
        let mut app = make_app_with_agent("sess-wire-pm");
        app.auto_mode_gate = true;
        app.permission_mode_from_soft_default = true;
        // Outside the applier's output alphabet — only the applier rewrites it.
        app.current_ui.permission_mode = Some("sentinel-not-a-mode".into());

        let _ = handle_ext_notification(&blank_settings_update(), &mut app);
        let display = app
            .current_ui
            .permission_mode
            .as_deref()
            .expect("applier always writes a display mode");
        assert!(
            matches!(display, "ask" | "auto" | "always-approve" | "default"),
            "soft push must rewrite the sentinel display via the applier, got {display:?}"
        );
        assert!(
            app.permission_mode_from_soft_default,
            "a soft re-arm must keep SoftDefault origin"
        );
    }

    /// `[ui] permission_mode` TOML value for the applier tests.
    fn ui_with_permission_mode(mode: &str) -> toml::Value {
        toml::from_str(&format!("[ui]\npermission_mode = \"{mode}\"\n")).unwrap()
    }

    /// Soft-origin recompute with injected TOML (deterministic — no host
    /// config): a `[ui] permission_mode = "always-approve"` arms
    /// default_yolo + UI, keeps the soft latch, and persists nothing.
    #[test]
    fn permission_mode_soft_default_applies_toml_always_approve() {
        let mut app = make_app_with_agent("sess-pm");
        app.auto_mode_gate = true;
        app.permission_mode_from_soft_default = true;
        app.current_ui.permission_mode = None;
        app.default_yolo = false;

        let ui = ui_with_permission_mode("always-approve");
        super::super::settings::apply_soft_default_permission_mode(&mut app, ui.get("ui"));
        assert!(app.default_yolo, "TOML always-approve must arm default_yolo");
        assert_eq!(
            app.current_ui.permission_mode.as_deref(),
            Some("always-approve"),
        );
        assert!(
            app.permission_mode_from_soft_default,
            "a soft re-arm must keep SoftDefault origin"
        );
        assert!(
            app.pending_effects.is_empty(),
            "a soft default must never be persisted to disk"
        );
    }

    /// No `[ui]` permission key: the soft always-approve drops back to the
    /// interactive default — never a re-armed always-approve.
    #[test]
    fn permission_mode_soft_default_without_toml_falls_back_to_ask() {
        let mut app = make_app_with_agent("sess-null-pm");
        app.auto_mode_gate = true;
        app.permission_mode_from_soft_default = true;
        app.current_ui.permission_mode = Some("always-approve".into());
        app.default_yolo = true;

        super::super::settings::apply_soft_default_permission_mode(&mut app, None);
        assert!(!app.default_yolo, "no TOML key must disarm a soft always-approve");
        assert_ne!(
            app.current_ui.permission_mode.as_deref(),
            Some("always-approve"),
            "the soft always-approve must be cleared from the UI mirror"
        );
        assert!(app.permission_mode_from_soft_default);
        assert!(
            app.pending_effects.is_empty(),
            "a soft default must never be persisted to disk"
        );
    }

    /// Policy pin and auto gate clamp a soft re-arm to Ask enforcement/display.
    #[test]
    fn permission_mode_soft_default_respects_pin_and_gate() {
        let mut app = make_app_with_agent("sess-pin-pm");
        app.permission_mode_from_soft_default = true;
        app.yolo_policy_block = Some("pinned");
        app.default_yolo = false;
        let ui = ui_with_permission_mode("always-approve");
        super::super::settings::apply_soft_default_permission_mode(&mut app, ui.get("ui"));
        assert!(!app.default_yolo, "policy pin must block a TOML always-approve");
        assert_eq!(app.current_ui.permission_mode.as_deref(), Some("ask"));

        let mut app = make_app_with_agent("sess-gate-pm");
        app.permission_mode_from_soft_default = true;
        app.auto_mode_gate = false;
        let ui = ui_with_permission_mode("auto");
        super::super::settings::apply_soft_default_permission_mode(&mut app, ui.get("ui"));
        assert!(!app.default_yolo);
        assert_eq!(
            app.current_ui.permission_mode.as_deref(),
            Some("ask"),
            "gated-off Auto must display as Ask"
        );
    }
