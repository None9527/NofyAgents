//! End-to-end smoke for the runtime evolution stack (RTAgent phases A–D):
//! a real turn driven by a scripted model, with the gates on, must
//! produce a durable journal, inject the WorldState frame, and fire the
//! verification-evidence reminder exactly when mutations lack
//! verification — with the verdict flipping to verified after a
//! successful bash run.

use super::support::*;
use super::*;
use std::sync::Arc;
use std::time::Duration;
use nofy_test_support::sse::{
    responses_api_reasoning_then_tool_call_events, responses_api_script_exact,
};
use nofy_test_support::{MockInferenceServer, ScriptedResponse};

/// `SessionActor` turn futures overflow the default test thread stack.
fn block_on_session(f: impl FnOnce() + Send + 'static) {
    std::thread::Builder::new()
        .stack_size(16 * 1024 * 1024)
        .spawn(f)
        .expect("spawn large-stack test thread")
        .join()
        .expect("test thread");
}

fn current_thread_local<F>(f: F)
where
    F: std::future::Future<Output = ()> + 'static,
{
    let rt = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .expect("test runtime");
    tokio::task::LocalSet::new().block_on(&rt, f);
}

fn drain_gateway(mut rx: tokio::sync::mpsc::UnboundedReceiver<nofy_acp_lib::AcpClientMessage>) {
    tokio::task::spawn_local(async move {
        while let Some(msg) = rx.recv().await {
            if let nofy_acp_lib::AcpClientMessage::SessionNotification(args) = msg {
                let _ = args.response_tx.send(Ok(()));
            }
        }
    });
}

/// Normal persistence: ack every blocking variant with success.
fn drain_persistence_ok(mut rx: tokio::sync::mpsc::UnboundedReceiver<PersistenceMsg>) {
    tokio::task::spawn_local(async move {
        while let Some(msg) = rx.recv().await {
            match msg {
                PersistenceMsg::AppendUpdateDurablyAndAck { respond_to, .. } => {
                    let _ = respond_to.send(Ok(()));
                }
                PersistenceMsg::AppendCwdSwitchAndAck { respond_to, .. } => {
                    let _ = respond_to
                        .send(Ok(nofy_chat_state::StrictAppendAck::Appended));
                }
                PersistenceMsg::FlushAndAck { respond_to } => {
                    let _ = respond_to.send(Ok(()));
                }
                PersistenceMsg::ProbeWritable { respond_to } => {
                    let _ = respond_to.send(Ok(()));
                }
                _ => {}
            }
        }
    });
}

async fn actor_with_tools_and_journal(
    server: &MockInferenceServer,
    persistence_tx: tokio::sync::mpsc::UnboundedSender<PersistenceMsg>,
    gateway_tx: tokio::sync::mpsc::UnboundedSender<nofy_acp_lib::AcpClientMessage>,
    session_dir: &std::path::Path,
) -> Arc<SessionActor> {
    use nofy_tools::implementations::nofy_build::bash::BashTool;
    use nofy_tools::implementations::nofy_build::kill_task::KillTaskTool;
    use nofy_tools::implementations::nofy_build::read_file::ReadFileTool;
    use nofy_tools::implementations::nofy_build::search_replace::SearchReplaceTool;
    use nofy_tools::implementations::nofy_build::task_output::TaskOutputTool;
    use nofy_tools::registry::types::ToolConfig;

    let sampling_cfg = nofy_sampler::SamplerConfig {
        api_key: Some("test-key".to_string()),
        base_url: server.url(),
        model: "test".to_string(),
        api_backend: nofy_sampler::ApiBackend::Responses,
        context_window: 256_000,
        max_retries: Some(0),
        idle_timeout_secs: Some(30),
        ..Default::default()
    };
    let (sampler_event_tx, sampler_event_rx) =
        tokio::sync::mpsc::unbounded_channel::<nofy_sampler::SamplingEvent>();
    let sampler_handle = nofy_sampler::SamplerActor::spawn(
        sampling_cfg,
        nofy_sampler::RetryPolicy {
            max_retries: 0,
            rate_limit_retry_threshold: 0,
            ..Default::default()
        },
        sampler_event_tx,
    );

    let mut actor = create_test_actor(0, 256_000, 85, gateway_tx, persistence_tx).await;
    actor.sampler_handle = sampler_handle;
    actor.max_turns = None;
    *actor.agent.borrow_mut() = test_agent_with_tools(vec![
        ToolConfig::for_tool::<ReadFileTool>(),
        ToolConfig::for_tool::<SearchReplaceTool>(),
        ToolConfig::for_tool::<BashTool>(),
        // bash `enabled_background=true` requires these two companions.
        ToolConfig::for_tool::<TaskOutputTool>(),
        ToolConfig::for_tool::<KillTaskTool>(),
    ])
    .await;

    let mut cfg = actor
        .chat_state_handle
        .get_sampling_config()
        .await
        .expect("test actor has sampling config");
    cfg.base_url = server.url();
    cfg.api_backend = nofy_sampling_types::ApiBackend::Responses;
    cfg.model = "test".to_string();
    actor.chat_state_handle.update_sampling_config(cfg);
    let mut creds = actor.chat_state_handle.get_credentials().await;
    creds.api_key = Some("test-key".to_string());
    actor.chat_state_handle.update_credentials(creds);

    // A real journal for this session, bypassing the env gate: the test
    // owns the handle directly.
    actor.runtime_journal = crate::session::runtime_journal::RuntimeJournalHandle::spawn(
        session_dir,
        actor.session_id_string(),
    );

    // Bind the local session so dispatch_tool can route calls; the bound
    // toolset runs against the real fs.
    actor
        .workspace_ops
        .bind_local_session(
            &actor.session_id_string(),
            actor.tool_context.cwd.as_path().to_path_buf(),
            actor.tool_context.hunk_tracker_handle.clone(),
            actor.agent.borrow().tool_bridge().toolset(),
            None,
        )
        .expect("bind_local_session");

    let actor = Arc::new(actor);
    {
        let drainer = actor.clone();
        let mut sampler_event_rx = sampler_event_rx;
        tokio::task::spawn_local(async move {
            while let Some(event) = sampler_event_rx.recv().await {
                drainer.handle_sampling_event(event).await;
            }
        });
    }
    actor
}

/// The full scenario in one test function: the gates are process-global
/// env vars, so the test is `#[serial]` and holds RAII [`EnvGuard`]s.
#[test]
#[serial_test::serial]
fn runtime_evolution_end_to_end_journal_frame_and_verification() {
    use nofy_session_journal::VerificationState;

    block_on_session(|| {
        let _world_state_gate = nofy_test_support::EnvGuard::set(
            crate::session::world_state::WORLD_STATE_ENV,
            "1",
        );
        let _verification_gate = nofy_test_support::EnvGuard::set(
            crate::session::runtime_journal::VERIFICATION_GATE_ENV,
            "1",
        );
        current_thread_local(async {

            let session_dir = tempfile::tempdir().expect("session dir");
            let target = session_dir.path().join("target.txt");
            // The bound toolset runs against the real fs: seed on disk.
            std::fs::write(&target, "base\n").expect("seed target file");

            // Scripted model: (1) read the file (search_replace requires
            // read-before-edit), (2) edit it, (3) run a verification
            // command, (4) answer.
            let server = MockInferenceServer::start()
                .await
                .expect("mock inference server");
            let read_args =
                serde_json::json!({ "target_file": target.display().to_string() }).to_string();
            server.enqueue_response(
                "/v1/responses",
                ScriptedResponse::sse(responses_api_reasoning_then_tool_call_events(
                    "revo-e2e",
                    "call-read",
                    "read_file",
                    &read_args,
                    "test",
                )),
            );
            let sr_args = serde_json::json!({
                "file_path": target.display().to_string(),
                "old_string": "base",
                "new_string": "changed",
            })
            .to_string();
            server.enqueue_response(
                "/v1/responses",
                ScriptedResponse::sse(responses_api_reasoning_then_tool_call_events(
                    "revo-e2e",
                    "call-edit",
                    "search_replace",
                    &sr_args,
                    "test",
                )),
            );
            let bash_args = serde_json::json!({
                "command": "echo verified",
                "description": "verify the edit",
            })
            .to_string();
            server.enqueue_response(
                "/v1/responses",
                ScriptedResponse::sse(responses_api_reasoning_then_tool_call_events(
                    "revo-e2e",
                    "call-verify",
                    "run_terminal_cmd",
                    &bash_args,
                    "test",
                )),
            );
            server.enqueue_response(
                "/v1/responses",
                ScriptedResponse::sse(responses_api_script_exact("done", "test")),
            );

            let (gateway_tx, gateway_rx) =
                tokio::sync::mpsc::unbounded_channel::<nofy_acp_lib::AcpClientMessage>();
            drain_gateway(gateway_rx);
            let (persistence_tx, persistence_rx) =
                tokio::sync::mpsc::unbounded_channel::<PersistenceMsg>();
            drain_persistence_ok(persistence_rx);

            let actor = actor_with_tools_and_journal(
                &server,
                persistence_tx,
                gateway_tx,
                session_dir.path(),
            )
            .await;

            let prompt_blocks = vec![acp::ContentBlock::Text(acp::TextContent::new(
                "edit the file and verify it".to_string(),
            ))];
            tokio::time::timeout(
                Duration::from_secs(60),
                actor.handle_prompt(
                    "revo-e2e",
                    prompt_blocks,
                    PromptMode::Agent,
                    None,
                    None,
                    true,
                    None,
                    None,
                    None,
                ),
            )
            .await
            .expect("turn must finish within timeout")
            .expect("turn must succeed");

            // 1. The journal is durable and carries the full event chain —
            //    the primary proof the tools really ran.
            let journal_path = session_dir
                .path()
                .join(nofy_session_journal::RUNTIME_EVENTS_FILE);
            let journal = nofy_session_journal::SessionJournal::load(journal_path)
                .expect("journal must be loadable");
            let kinds: Vec<nofy_session_journal::EventKind> =
                journal.events().iter().map(|e| e.kind).collect();
            use nofy_session_journal::EventKind;
            assert_eq!(
                kinds.iter().filter(|k| **k == EventKind::ToolInvoked).count(),
                3,
                "all three tool calls journaled: {kinds:?}"
            );
            assert_eq!(
                kinds.iter().filter(|k| **k == EventKind::ToolSucceeded).count(),
                3,
                "all three tool successes journaled: {kinds:?}"
            );

            // 2. The edit really happened on disk (the bound toolset
            //    operates on the real fs).
            assert_eq!(std::fs::read_to_string(&target).unwrap(), "changed\n");
            let reminders: Vec<&serde_json::Value> = journal
                .events()
                .iter()
                .filter(|e| e.kind == EventKind::ReminderInjected)
                .map(|e| &e.payload)
                .collect();
            assert!(
                reminders.iter().any(|p| p["reminder"] == "world_state_frame"),
                "world-state frame injection journaled: {reminders:?}"
            );
            assert!(
                reminders.iter().any(|p| p["reminder"] == "verification_missing"),
                "verification reminder journaled: {reminders:?}"
            );

            // 3. The verification verdict flipped to verified after the
            //    successful bash run (seq-independent: verification must
            //    strictly follow the last mutation).
            match actor.runtime_journal.verification_state() {
                Some(VerificationState::Verified {
                    last_mutation_seq,
                    verification_seq,
                }) => {
                    assert!(
                        verification_seq > last_mutation_seq,
                        "verification must follow the last mutation"
                    );
                    // The last mutation must be the search_replace call.
                    let mutation_event = &journal.events()[last_mutation_seq as usize];
                    assert_eq!(mutation_event.tool_name(), Some("search_replace"));
                }
                other => panic!("expected Verified verdict, got {other:?}"),
            }

            // 4. The model actually saw both reminders in the conversation.
            let conversation = actor.chat_state_handle.get_conversation().await;
            let text: String = conversation
                .iter()
                .filter_map(|item| serde_json::to_string(item).ok())
                .collect::<Vec<_>>()
                .join("\n");
            assert!(
                text.contains("World state (runtime-maintained observation"),
                "world-state frame must reach the conversation"
            );
            assert!(
                text.contains("Verification evidence"),
                "verification reminder must reach the conversation"
            );
        });
    });
}
