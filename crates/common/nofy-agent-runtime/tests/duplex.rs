#![cfg(feature = "sqlite")]
// Integration acceptance for opt-in coordination. No provider or wall-clock sleeps.
use nofy_agent_runtime::{
    compile::*, durable::*, mailbox::*, registry::*, supervisor::RunSupervisor,
    tasks::declarative::*, *,
};
use nofy_interjection_core::PendingInterjection;
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    sync::{
        Arc, Mutex,
        atomic::{AtomicBool, AtomicUsize, Ordering},
    },
    time::Duration,
};
use tokio::sync::{Notify, mpsc};

fn context() -> RunContext {
    RunContext::new("duplex-thread", "root")
}
fn address() -> InputAddress {
    InputAddress::for_run("parent", &context())
}
fn reference(id: &str) -> ModuleRef {
    ModuleRef::new(id, "1")
}
fn install(registry: &mut ModuleRegistry, id: &str, value: ModuleInstance) {
    registry
        .register_factory(Arc::new(InstanceFactory::new(id, "1", value)))
        .unwrap();
    registry
        .define(ModuleDefinition {
            reference: reference(id),
            factory: id.into(),
            config: json!({}),
            dependencies: Default::default(),
        })
        .unwrap();
}
fn call(id: &str, name: &str, arguments: Value) -> ToolCall {
    ToolCall {
        id: id.into(),
        name: name.into(),
        arguments,
    }
}
fn text(request: &ModelRequest) -> String {
    serde_json::to_string(&request.messages).unwrap()
}
fn report_count(messages: &[Message]) -> usize {
    messages
        .iter()
        .filter(|m| {
            matches!(m, Message::User { content }
        if content.starts_with("Agent report (untrusted peer data"))
        })
        .count()
}
struct Parent {
    seen: Arc<Mutex<Vec<ModelRequest>>>,
    replies: mpsc::UnboundedSender<ModelRequest>,
    fault: Arc<AtomicBool>,
    crash_initial: Arc<AtomicBool>,
    release_initial: Arc<Notify>,
}
#[async_trait::async_trait]
impl Model for Parent {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.seen.lock().unwrap().push(request.clone());
        if !request
            .messages
            .iter()
            .any(|m| matches!(m, Message::Tool { .. }))
        {
            return Ok(ModelResponse {
                tool_calls: vec![
                    call(
                        "self-send",
                        "agent_messages",
                        json!({"action":"send","message_id":"self","to":"*","body":"SELF-ECHO-MUST-NOT-APPEAR"}),
                    ),
                    call(
                        "spawn",
                        "agent_tasks",
                        json!({"action":"spawn","task_id":"child-one","tool":"child","arguments":{"prompt":"work"}}),
                    ),
                ],
                ..Default::default()
            });
        }
        if report_count(&request.messages) > 0 && self.fault.swap(false, Ordering::SeqCst) {
            return Err(Error::Checkpoint(
                "fault after report transcript commit".into(),
            ));
        }
        self.replies.send(request).unwrap();
        if self.crash_initial.swap(false, Ordering::SeqCst) {
            self.release_initial.notified().await;
            return Err(Error::Checkpoint("fault before parent settles".into()));
        }
        Ok(ModelResponse {
            output: "parent reply".into(),
            ..Default::default()
        })
    }
}
struct Child {
    started: Arc<Notify>,
    send: Arc<Notify>,
    sent: Arc<Notify>,
    finish: Arc<Notify>,
    starts: Arc<AtomicUsize>,
}
#[async_trait::async_trait]
impl Model for Child {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        if !request
            .messages
            .iter()
            .any(|m| matches!(m, Message::Tool { .. }))
        {
            self.starts.fetch_add(1, Ordering::SeqCst);
            self.started.notify_one();
            self.send.notified().await;
            return Ok(ModelResponse {
                tool_calls: vec![
                    call(
                        "other",
                        "agent_messages",
                        json!({"action":"send","message_id":"other","to":"someone-else","body":"OTHER-RECIPIENT-MUST-NOT-APPEAR"}),
                    ),
                    call(
                        "direct",
                        "agent_messages",
                        json!({"action":"send","message_id":"direct","to":"root","body":"DIRECT-PEER-REPORT"}),
                    ),
                    call(
                        "broadcast",
                        "agent_messages",
                        json!({"action":"send","message_id":"broadcast","to":"*","body":"BROADCAST-PEER-REPORT"}),
                    ),
                ],
                ..Default::default()
            });
        }
        self.sent.notify_one();
        self.finish.notified().await;
        Ok(ModelResponse {
            output: "child done".into(),
            ..Default::default()
        })
    }
}
struct Fixture {
    compiled: Arc<CompiledAgent>,
    replies: mpsc::UnboundedReceiver<ModelRequest>,
    seen: Arc<Mutex<Vec<ModelRequest>>>,
    started: Arc<Notify>,
    send: Arc<Notify>,
    sent: Arc<Notify>,
    finish: Arc<Notify>,
    starts: Arc<AtomicUsize>,
    fault: Arc<AtomicBool>,
    crash_initial: Arc<AtomicBool>,
    release_initial: Arc<Notify>,
}
fn fixture(duplex: bool) -> Fixture {
    let (tx, replies) = mpsc::unbounded_channel();
    let seen = Arc::new(Mutex::new(vec![]));
    let started = Arc::new(Notify::new());
    let send = Arc::new(Notify::new());
    let sent = Arc::new(Notify::new());
    let finish = Arc::new(Notify::new());
    let starts = Arc::new(AtomicUsize::new(0));
    let fault = Arc::new(AtomicBool::new(false));
    let crash_initial = Arc::new(AtomicBool::new(false));
    let release_initial = Arc::new(Notify::new());
    let mut registry = ModuleRegistry::default();
    install(
        &mut registry,
        "parent-model",
        ModuleInstance::Model(Arc::new(Parent {
            seen: seen.clone(),
            replies: tx,
            fault: fault.clone(),
            crash_initial: crash_initial.clone(),
            release_initial: release_initial.clone(),
        })),
    );
    install(
        &mut registry,
        "child-model",
        ModuleInstance::Model(Arc::new(Child {
            started: started.clone(),
            send: send.clone(),
            sent: sent.clone(),
            finish: finish.clone(),
            starts: starts.clone(),
        })),
    );
    install(
        &mut registry,
        "prompt",
        ModuleInstance::Prompt(Arc::new(StaticPrompt("test".into()))),
    );
    install(
        &mut registry,
        "messages",
        MessagesToolFactory
            .build(&json!({}), &BTreeMap::new())
            .unwrap(),
    );
    let child = compile_agent(
        serde_json::from_value(json!({
            "name":"child", "model":reference("child-model"), "prompt":reference("prompt"),
            "tool_packs":[reference("messages")]
        }))
        .unwrap(),
        &registry,
    )
    .unwrap();
    let mut children = ToolCatalog::new();
    children
        .insert(child.agent.as_tool("child", "deterministic child"))
        .unwrap();
    let resource = TasksResourceFactory
        .build(
            &json!({}),
            &BTreeMap::from([("children".into(), ModuleInstance::ToolPack(children))]),
        )
        .unwrap();
    let deps = BTreeMap::from([("tasks".into(), resource)]);
    install(
        &mut registry,
        "tasks",
        TasksToolFactory.build(&json!({}), &deps).unwrap(),
    );
    install(
        &mut registry,
        "binding",
        TasksBindingFactory.build(&json!({}), &deps).unwrap(),
    );
    let compiled = compile_agent(serde_json::from_value(json!({
        "name":"parent", "model":reference("parent-model"), "prompt":reference("prompt"),
        "tool_packs":[reference("messages"),reference("tasks")], "bindings":[reference("binding")],
        "settings":{"input_delivery":{"duplex":duplex}}
    })).unwrap(), &registry).unwrap();
    Fixture {
        compiled: Arc::new(compiled),
        replies,
        seen,
        started,
        send,
        sent,
        finish,
        starts,
        fault,
        crash_initial,
        release_initial,
    }
}
fn run(
    store: &SqliteStore,
    fixture: &Fixture,
    input: RunInput,
) -> tokio::task::JoinHandle<Result<RunOutcome, Error>> {
    let store = store.clone();
    let compiled = fixture.compiled.clone();
    tokio::spawn(async move {
        RunSupervisor::new(store)
            .execute(&compiled, input, context())
            .await
    })
}
async fn notified(notify: &Notify) {
    tokio::time::timeout(Duration::from_secs(10), notify.notified())
        .await
        .expect("fixture reached boundary");
}
async fn reply(fixture: &mut Fixture) -> ModelRequest {
    tokio::time::timeout(Duration::from_secs(10), fixture.replies.recv())
        .await
        .unwrap()
        .unwrap()
}
async fn outcome(
    worker: tokio::task::JoinHandle<Result<RunOutcome, Error>>,
) -> Result<RunOutcome, Error> {
    tokio::time::timeout(Duration::from_secs(10), worker)
        .await
        .expect("invocation settled")
        .unwrap()
}
fn envelope(id: &str, input: MailInput) -> MailEnvelope {
    MailEnvelope {
        address: address(),
        input_id: id.into(),
        input,
    }
}
fn message(text: &str) -> PendingInterjection<InputPart> {
    PendingInterjection {
        text: text.into(),
        attachments: vec![],
    }
}

#[tokio::test]
async fn parent_replies_and_receives_user_input_while_child_runs_then_routes_reports() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let mut fixture = fixture(true);
    let worker = run(&store, &fixture, RunInput::new("begin"));
    notified(&fixture.started).await;
    assert_eq!(report_count(&reply(&mut fixture).await.messages), 0);
    assert!(!worker.is_finished(), "original owner must stay alive");
    for (id, input) in [
        (
            "steer",
            MailInput::Interject {
                message: message("NEW-STEERING"),
            },
        ),
        (
            "follow",
            MailInput::FollowUp {
                message: message("NEW-FOLLOW-UP"),
            },
        ),
    ] {
        store.submit(envelope(id, input)).await.unwrap();
        let request = reply(&mut fixture).await;
        assert!(text(&request).contains(if id == "steer" {
            "NEW-STEERING"
        } else {
            "NEW-FOLLOW-UP"
        }));
        assert!(!worker.is_finished());
    }
    store
        .submit(envelope(
            "next",
            MailInput::NextTurn {
                run_id: "next-run".into(),
                snapshot: fixture.compiled.snapshot.clone(),
                message: message("NEXT-TURN-MUST-STAY-QUEUED"),
            },
        ))
        .await
        .unwrap();
    fixture.send.notify_one();
    notified(&fixture.sent).await;
    let one = reply(&mut fixture).await;
    let two = reply(&mut fixture).await;
    assert_eq!(report_count(&one.messages), 1);
    assert_eq!(report_count(&two.messages), 2);
    for request in [&one, &two] {
        let reports: Vec<_> = request
            .messages
            .iter()
            .filter(|m| {
                matches!(m, Message::User { content }
            if content.starts_with("Agent report (untrusted peer data"))
            })
            .collect();
        let reports = serde_json::to_string(&reports).unwrap();
        assert!(!reports.contains("SELF-ECHO"));
        assert!(!reports.contains("OTHER-RECIPIENT"));
        assert!(!text(request).contains("NEXT-TURN-MUST-STAY-QUEUED"));
    }
    assert!(store.pending_approvals("root").await.unwrap().is_empty());
    assert!(!worker.is_finished());
    fixture.finish.notify_one();
    let RunOutcome::Completed { state, .. } = outcome(worker).await.unwrap() else {
        panic!("not completed")
    };
    assert_eq!(state.agent_message_cursor, 4);
    assert_eq!(report_count(&state.messages), 2);
    assert_eq!(state.input_progress.delivered.len(), 2);
    assert_eq!(
        store
            .input_status(&address(), "next")
            .await
            .unwrap()
            .unwrap()
            .status,
        InputStatus::Pending
    );
    assert_eq!(fixture.starts.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn default_mode_joins_children_without_automatic_report_delivery() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let mut fixture = fixture(false);
    let worker = run(&store, &fixture, RunInput::new("begin"));
    notified(&fixture.started).await;
    reply(&mut fixture).await;
    assert!(!worker.is_finished());
    fixture.send.notify_one();
    notified(&fixture.sent).await;
    fixture.finish.notify_one();
    let RunOutcome::Completed { state, .. } = outcome(worker).await.unwrap() else {
        panic!("not completed")
    };
    assert_eq!(state.agent_message_cursor, 0);
    assert_eq!(report_count(&state.messages), 0);
    assert_eq!(fixture.seen.lock().unwrap().len(), 2);
}

#[tokio::test]
async fn committed_reports_and_child_sends_recover_without_duplicate_delivery() {
    let temp = tempfile::tempdir().unwrap();
    let path = temp.path().join("runtime.db");
    let store = SqliteStore::open(&path).unwrap();
    let mut fixture = fixture(true);
    fixture.fault.store(true, Ordering::SeqCst);
    let worker = run(&store, &fixture, RunInput::new("begin"));
    notified(&fixture.started).await;
    reply(&mut fixture).await;
    fixture.send.notify_one();
    let result = outcome(worker).await;
    assert!(
        matches!(result, Err(Error::Checkpoint(ref s)) if s.contains("fault after report")),
        "{result:?}"
    );
    // Reopen the real database and supervisor. Child sends already have durable
    // tool receipts; the pending parent model sees the already-committed report.
    drop(store);
    let store = SqliteStore::open(&path).unwrap();
    fixture.finish.notify_one();
    let worker = run(&store, &fixture, RunInput::resume());
    let RunOutcome::Completed { state, .. } = outcome(worker).await.unwrap() else {
        panic!("not recovered")
    };
    assert_eq!(state.agent_message_cursor, 4);
    assert_eq!(report_count(&state.messages), 2);
    assert!(state.input_progress.delivered.is_empty());
    assert!(state.input_progress.capture.is_empty());
    assert_eq!(fixture.starts.load(Ordering::SeqCst), 1);
    let seen = fixture.seen.lock().unwrap();
    assert_eq!(report_count(&seen[2].messages), 1);
    assert_eq!(
        serde_json::to_value(&seen[2]).unwrap(),
        serde_json::to_value(&seen[3]).unwrap()
    );
}

#[tokio::test]
async fn cancellation_while_idle_releases_the_original_invocation() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let mut fixture = fixture(true);
    let worker = run(&store, &fixture, RunInput::new("begin"));
    notified(&fixture.started).await;
    reply(&mut fixture).await;
    store.cancel(&address(), "cancel-duplex").await.unwrap();
    assert!(matches!(
        outcome(worker).await.unwrap(),
        RunOutcome::Cancelled { .. }
    ));
    assert_eq!(fixture.starts.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn reopened_board_delivers_pending_reports_without_notification_or_frozen_request_mutation() {
    let temp = tempfile::tempdir().unwrap();
    let path = temp.path().join("runtime.db");
    let store = SqliteStore::open(&path).unwrap();
    let mut fixture = fixture(true);
    fixture.crash_initial.store(true, Ordering::SeqCst);
    let worker = run(&store, &fixture, RunInput::new("begin"));
    notified(&fixture.started).await;
    let frozen = reply(&mut fixture).await;
    assert_eq!(report_count(&frozen.messages), 0);
    fixture.send.notify_one();
    notified(&fixture.sent).await;
    // All child sends are committed while the parent model is still active.
    assert_eq!(fixture.seen.lock().unwrap().len(), 2);
    fixture.release_initial.notify_one();
    assert!(
        matches!(outcome(worker).await, Err(Error::Checkpoint(ref s)) if s.contains("before parent settles"))
    );
    drop(store);
    let store = SqliteStore::open(&path).unwrap();
    fixture.finish.notify_one();
    let RunOutcome::Completed { state, .. } = outcome(run(&store, &fixture, RunInput::resume()))
        .await
        .unwrap()
    else {
        panic!("not recovered")
    };
    assert_eq!(state.agent_message_cursor, 4);
    assert_eq!(report_count(&state.messages), 2);
    assert!(state.input_progress.delivered.is_empty());
    assert_eq!(fixture.starts.load(Ordering::SeqCst), 1);
    let seen = fixture.seen.lock().unwrap();
    assert_eq!(
        serde_json::to_value(&seen[1]).unwrap(),
        serde_json::to_value(&seen[2]).unwrap()
    );
}

struct RootPolicy(Arc<Mutex<Vec<(String, String)>>>);
#[async_trait::async_trait]
impl Policy for RootPolicy {
    async fn admit(
        &self,
        call: &ToolCall,
        _: &RunState,
        context: &RunContext,
    ) -> Result<Admission, Error> {
        self.0
            .lock()
            .unwrap()
            .push((context.run_id.clone(), call.name.clone()));
        Ok(Admission::Allow)
    }
}
#[tokio::test]
async fn coordination_preserves_root_policy_and_shared_budget() {
    use nofy_agent_runtime::governance::*;
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let mut fixture = fixture(true);
    let admissions = Arc::new(Mutex::new(Vec::new()));
    let profile = Arc::new(
        GovernanceProfile::new(
            Arc::new(
                InstalledBudget::install(
                    Arc::new(store.clone()),
                    BudgetLimits {
                        max_model_calls: Some(20),
                        max_tool_calls: Some(20),
                        max_child_calls: Some(2),
                        ..Default::default()
                    },
                    "duplex-root-budget",
                    1,
                )
                .unwrap(),
            ),
            BudgetLimits::default(),
            ModelRetryPolicy::default(),
        )
        .unwrap(),
    );
    let scope = BudgetScope {
        root_run_id: "root".into(),
        identity: profile.identity().into(),
    };
    let compiled = Arc::get_mut(&mut fixture.compiled).unwrap();
    compiled.agent = compiled
        .agent
        .clone()
        .with_governance(profile)
        .with_required_policy(
            "root-test-policy@1",
            Arc::new(RootPolicy(admissions.clone())),
        )
        .unwrap();
    let worker = run(&store, &fixture, RunInput::new("begin"));
    notified(&fixture.started).await;
    reply(&mut fixture).await;
    fixture.send.notify_one();
    notified(&fixture.sent).await;
    reply(&mut fixture).await;
    reply(&mut fixture).await;
    fixture.finish.notify_one();
    assert!(matches!(
        outcome(worker).await.unwrap(),
        RunOutcome::Completed { .. }
    ));
    let summary = store.inspect(&scope).await.unwrap().unwrap();
    assert_eq!(summary.used.model_calls, 6);
    assert_eq!(summary.used.tool_calls, 5);
    assert_eq!(summary.used.child_calls, 1);
    assert_eq!(summary.active_children, 0);
    let admissions = admissions.lock().unwrap();
    assert!(
        admissions
            .iter()
            .any(|(run, tool)| run == "root" && tool == "agent_tasks")
    );
    assert_eq!(
        admissions
            .iter()
            .filter(|(run, tool)| run != "root" && tool == "agent_messages")
            .count(),
        3
    );
}

#[test]
fn duplex_is_opt_in_and_default_serialization_identity_is_unchanged() {
    let old: Settings = serde_json::from_value(json!({})).unwrap();
    let explicit: Settings =
        serde_json::from_value(json!({"input_delivery":{"duplex":false}})).unwrap();
    assert!(!old.input_delivery.duplex);
    assert_eq!(
        serde_json::to_value(&old).unwrap(),
        serde_json::to_value(&explicit).unwrap()
    );
    assert!(
        serde_json::to_value(&old)
            .unwrap()
            .get("input_delivery")
            .is_none()
    );
    let enabled: Settings =
        serde_json::from_value(json!({"input_delivery":{"duplex":true}})).unwrap();
    assert_eq!(
        serde_json::to_value(&enabled).unwrap()["input_delivery"]["duplex"],
        true
    );
    assert_ne!(
        serde_json::to_value(&old).unwrap(),
        serde_json::to_value(&enabled).unwrap()
    );
}

struct IdentityModel(Arc<AtomicUsize>);
#[async_trait::async_trait]
impl Model for IdentityModel {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        self.0.fetch_add(1, Ordering::SeqCst);
        Ok(ModelResponse {
            output: "done".into(),
            ..Default::default()
        })
    }
}

#[tokio::test]
async fn plain_duplex_checkpoint_retains_run_identity_and_new_turn_resets_cursor() {
    let calls = Arc::new(AtomicUsize::new(0));
    let store = Arc::new(InMemoryCheckpointer::default());
    let mut components = Components::default();
    components
        .models
        .insert("model".into(), Arc::new(IdentityModel(calls.clone())));
    components
        .prompts
        .insert("prompt".into(), Arc::new(StaticPrompt("test".into())));
    let settings = serde_json::from_value(json!({"input_delivery":{"duplex":true}})).unwrap();
    let agent = AgentBuilder::new("plain")
        .model("model")
        .prompt("prompt")
        .settings(settings)
        .compile(&components)
        .unwrap()
        .with_checkpointer(store.clone());
    let original = RunContext::new("identity-thread", "original-run");
    let RunOutcome::Completed { state, .. } = agent
        .invoke(RunInput::new("first"), original)
        .await
        .unwrap()
    else {
        panic!("initial turn did not complete")
    };
    assert_eq!(state.execution_run_id.as_deref(), Some("original-run"));
    assert_eq!(calls.load(Ordering::SeqCst), 1);

    // Seed a previously committed receiver cursor through the public
    // Checkpointer API; no task, hook, governance, or model-journal binding.
    let key = "5:plainidentity-thread";
    let mut checkpoint = store.load(key).await.unwrap().unwrap();
    assert_eq!(
        checkpoint.state.execution_run_id.as_deref(),
        Some("original-run")
    );
    let revision = checkpoint.revision;
    checkpoint.revision += 1;
    checkpoint.state.agent_message_cursor = 17;
    store.save(key, Some(revision), checkpoint).await.unwrap();

    let changed = RunContext::new("identity-thread", "different-run");
    let result = agent.invoke(RunInput::resume(), changed.clone()).await;
    assert!(
        matches!(result, Err(Error::Checkpoint(ref message)) if message.contains("original run identity"))
    );
    assert_eq!(
        calls.load(Ordering::SeqCst),
        1,
        "invalid resume must not dispatch a model"
    );
    assert_eq!(
        store
            .load(key)
            .await
            .unwrap()
            .unwrap()
            .state
            .agent_message_cursor,
        17
    );

    let RunOutcome::Completed { state, .. } = agent
        .invoke(RunInput::new("new turn"), changed)
        .await
        .unwrap()
    else {
        panic!("new prompt under a new run must be accepted")
    };
    assert_eq!(calls.load(Ordering::SeqCst), 2);
    assert_eq!(state.execution_run_id.as_deref(), Some("different-run"));
    assert_eq!(state.agent_message_cursor, 0);
    let checkpoint = store.load(key).await.unwrap().unwrap();
    assert_eq!(
        checkpoint.state.execution_run_id.as_deref(),
        Some("different-run")
    );
    assert_eq!(checkpoint.state.agent_message_cursor, 0);
}
