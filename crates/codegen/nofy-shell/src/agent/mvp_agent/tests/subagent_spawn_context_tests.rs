//! Subagent spawn-context inheritance: a child session must inherit the parent's
//! permission handle, goal-loop gate, and configured tool-overrides cutoff so policy,
//! run-state, and a backtest bound can't be bypassed by delegating to a subagent.

use super::{build_minimal_agent_for_tests, make_test_handle};
use agent_client_protocol as acp;
use nofy_acp_lib::AcpAgentGatewaySender as GatewaySender;

/// Subagents inherit the parent permission handle, so a managed `Read(**/.env)`
/// deny still blocks the child — direct read and the `cat .env` shell equivalent.
#[tokio::test]
async fn subagent_spawn_context_inherits_parent_permission_handle() {
    use nofy_workspace::permission::types::{
        PatternMode, PermissionConfig, PermissionRule, RuleAction, ToolFilter,
    };

    let local = tokio::task::LocalSet::new();
    local
        .run_until(async {
            let agent = build_minimal_agent_for_tests();
            let sid = acp::SessionId::new("parent-permission");
            let (tx, _rx) = tokio::sync::mpsc::unbounded_channel();
            let gateway = GatewaySender::new(tx);
            let cwd = nofy_paths::AbsPathBuf::new(std::path::PathBuf::from("/tmp"))
                .expect("absolute cwd");
            let (permission_handle, _events_rx) =
                nofy_workspace::permission::spawn_permission_manager(
                    sid.clone(),
                    gateway,
                    cwd,
                    nofy_workspace::permission::types::ClientType::Generic,
                    Some(PermissionConfig::new(vec![PermissionRule {
                        action: RuleAction::Deny,
                        tool: ToolFilter::Read,
                        pattern: Some("**/.env".to_owned()),
                        pattern_mode: PatternMode::Glob,
                    }])),
                    Vec::new(), // deny_read_globs
                    Vec::new(),
                    false,
                    None,
                );

            let mut handle = make_test_handle("test-model", false, None);
            handle.permission_handle = permission_handle;
            agent.insert_resident(&sid, handle);

            let ctx = agent.build_subagent_spawn_context(sid.0.as_ref());
            let inherited = ctx
                .permission_handle
                .expect("subagent context must inherit parent permission handle");

            // Direct file read and the shell equivalent both hit the parent deny.
            for access in [
                nofy_workspace::permission::AccessKind::Read(Some(".env".into())),
                nofy_workspace::permission::AccessKind::Bash("cat .env".into()),
            ] {
                let decision = inherited
                    .request(
                        access.clone(),
                        acp::ToolCallUpdate::new(acp::ToolCallId::new("tc"), Default::default()),
                        Some("child-session".to_owned()),
                        Some("general-purpose".to_owned()),
                        Some("permission inheritance regression".to_owned()),
                    )
                    .await;
                assert!(
                    matches!(
                        decision,
                        nofy_workspace::permission::Decision::PolicyDeny(_)
                    ),
                    "subagent-inherited handle must enforce parent deny for {access:?}, got {decision:?}"
                );
            }
        })
        .await;
}

/// A subagent shares the parent's `goal_loop_active_gate` Arc, so flipping the
/// parent gate is observed through the child context (same allocation).
#[tokio::test]
async fn subagent_spawn_context_shares_parent_goal_loop_gate() {
    use std::sync::atomic::Ordering::Relaxed;

    let agent = build_minimal_agent_for_tests();
    let sid = acp::SessionId::new("parent-goal");
    let handle = make_test_handle("test-model", false, None);
    // Clone the parent's live gate before the handle moves into `sessions`.
    let parent_gate = handle.tool_context.goal_loop_active_gate.clone();
    agent.insert_resident(&sid, handle);

    let ctx = agent.build_subagent_spawn_context(sid.0.as_ref());

    // Flipping the parent gate must surface through the child flag (shared Arc).
    assert!(!ctx.goal_loop_active.load(Relaxed));
    parent_gate.store(true, Relaxed);
    assert!(
        ctx.goal_loop_active.load(Relaxed),
        "subagent context must observe the parent's goal-loop gate (same Arc)"
    );
}

/// A subagent inherits the parent session's `ask_user_question` gate, so
/// `--no-ask-user` strips the tool from subagents too, while the default keeps it.
#[tokio::test]
async fn subagent_spawn_context_inherits_parent_ask_user_question_gate() {
    let agent = build_minimal_agent_for_tests();

    // Parent with the tool disabled (the `--no-ask-user` case) → child off.
    let sid_off = acp::SessionId::new("parent-no-ask");
    let mut handle_off = make_test_handle("test-model", false, None);
    handle_off.ask_user_question_enabled = false;
    agent.insert_resident(&sid_off, handle_off);
    let ctx_off = agent.build_subagent_spawn_context(sid_off.0.as_ref());
    assert!(
        !ctx_off.ask_user_question_enabled,
        "subagent must inherit the parent's disabled ask_user_question gate (--no-ask-user)"
    );

    // Parent with the tool enabled (the default) → child on.
    let sid_on = acp::SessionId::new("parent-ask");
    let handle_on = make_test_handle("test-model", false, None);
    agent.insert_resident(&sid_on, handle_on);
    let ctx_on = agent.build_subagent_spawn_context(sid_on.0.as_ref());
    assert!(
        ctx_on.ask_user_question_enabled,
        "subagent must inherit the parent's enabled ask_user_question gate"
    );
}

/// A subagent inherits the parent's `process_scope`, so an owner enrolled through it stays visible via the child.
/// End-to-end reaping is covered by the spine's `process_scope_reclaim` tests.
#[tokio::test]
async fn subagent_spawn_context_inherits_parent_process_scope() {
    let agent = build_minimal_agent_for_tests();
    let sid = acp::SessionId::new("parent-process-scope");
    let mut handle = make_test_handle("test-model", false, None);
    let parent_scope = nofy_tty_utils::ProcessScope::new();
    handle.tool_context.process_scope = Some(parent_scope.clone());
    agent.insert_resident(&sid, handle);

    // Hold an owner Arc in the parent scope so live_count == 1.
    let owner = std::sync::Arc::new(nofy_tty_utils::ProcessGroup::new().expect("process group"));
    parent_scope.register(&owner);

    let ctx = agent.build_subagent_spawn_context(sid.0.as_ref());
    let inherited = ctx
        .process_scope
        .expect("subagent context must inherit the parent's process scope");

    assert_eq!(
        inherited.live_count(),
        1,
        "the child sees the owner enrolled through the parent scope"
    );
}

/// Subagents share the parent's env > config > default chain
/// (compiled default is `Segments`). Not pinned to `Summary`.
#[test]
#[serial_test::serial]
fn subagent_spawn_context_resolves_compaction_mode_like_parent() {
    use crate::agent::config::Config;
    use nofy_chat_state::{CompactionDetail, CompactionMode};
    use nofy_test_support::EnvGuard;
    let _mode = EnvGuard::unset("NOFY_COMPACTION_MODE");
    let _detail = EnvGuard::unset("NOFY_COMPACTION_DETAIL");
    let mut ctx = crate::test_support::lsp_runtime::ctx_with_toggle(Default::default());
    assert_eq!(
        ctx.resolve_compaction_mode(),
        CompactionMode::default(),
        "empty spawn context must inherit the compiled Segments default, not Summary"
    );
    let mut summary_cfg = Config::default();
    summary_cfg.features.compaction_mode = Some("summary".into());
    ctx.agent_config = Some(summary_cfg);
    assert_eq!(
        ctx.resolve_compaction_mode(),
        CompactionMode::Summary,
        "parent [features].compaction_mode must win over the default"
    );
    let mut segments_cfg = Config::default();
    segments_cfg.features.compaction_mode = Some("segments".into());
    segments_cfg.features.compaction_detail = Some("balanced".into());
    ctx.agent_config = Some(segments_cfg);
    assert_eq!(
        ctx.resolve_compaction_mode(),
        CompactionMode::Segments(CompactionDetail::Balanced),
        "parent config mode+detail must attach via with_segment_detail"
    );
    let _env_mode = EnvGuard::set("NOFY_COMPACTION_MODE", "transcript");
    assert_eq!(
        ctx.resolve_compaction_mode(),
        CompactionMode::Transcript,
        "NOFY_COMPACTION_MODE must win over parent config"
    );
}

#[test]
fn run_shell_child_passes_parent_compaction_pins_into_spawn() {
    use crate::agent::subagent::SubagentSpawnContext;
    use crate::session::CompactionPins;
    use nofy_agent::prompt::user_message::UserMessageTemplate;
    use nofy_chat_state::CompactionMode;
    let default_child = UserMessageTemplate::Default;
    let mut ctx = crate::test_support::lsp_runtime::ctx_with_toggle(Default::default());
    ctx.parent_compaction = CompactionPins {
        mode: CompactionMode::default(),
        two_pass: true,
    };
    assert_eq!(
        ctx.compaction_pins_for_child(&default_child),
        CompactionPins {
            mode: CompactionMode::default(),
            two_pass: true,
        },
    );
    ctx.parent_compaction = CompactionPins {
        mode: CompactionMode::Summary,
        two_pass: false,
    };
    assert_eq!(
        ctx.compaction_pins_for_child(&default_child),
        CompactionPins {
            mode: CompactionMode::Summary,
            two_pass: false,
        },
    );
    ctx.parent_compaction = CompactionPins {
        mode: CompactionMode::default(),
        two_pass: true,
    };
    assert_eq!(
        SubagentSpawnContext::snapshot_parent_compaction_pins(
            CompactionMode::default(),
            true,
            Some("nofy-build"),
            Some("nofy-build"),
            std::path::Path::new("/tmp"),
        ),
        CompactionPins {
            mode: CompactionMode::default(),
            two_pass: true,
        },
    );
    let spawn_src = include_str!("../../subagent/handle_request.rs");
    assert!(
        spawn_src.contains("ctx.compaction_pins_for_child(&definition.user_message_template)"),
        "run_shell_child must pass compaction_pins_for_child into spawn"
    );
    assert!(
        spawn_src.contains("pins.two_pass"),
        "run_shell_child must pass pins.two_pass into spawn_session_on_thread"
    );
    assert!(
        !spawn_src.contains("CompactionMode::Summary"),
        "run_shell_child must not hard-pin Summary at the spawn site"
    );
    assert!(
        !spawn_src.contains("two_pass_enabled = false")
            && !spawn_src.contains("false, // two_pass"),
        "run_shell_child must not hard-pin two-pass off at the spawn site"
    );
}
