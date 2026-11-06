#![cfg(feature = "sqlite")]
use nofy_agent_runtime::{
    compile::*, durable::*, events::RunEvent, hooks::*, mailbox::*, registry::*,
    supervisor::RunSupervisor, *,
};
use nofy_interjection_core::PendingInterjection;
use nofy_tool_runtime::{Tool, ToolCallContext};
use nofy_tool_types::ToolDescription;
use serde_json::{Value, json};
use std::{
    path::Path,
    sync::{
        Arc, Mutex,
        atomic::{AtomicBool, AtomicU64, AtomicUsize, Ordering},
    },
    time::Duration,
};
use tokio::sync::Notify;

fn context() -> RunContext {
    RunContext::new("thread", "run")
}
#[tokio::test]
async fn steering_and_follow_up_have_independent_all_and_single_delivery_modes() {
    for (mode, expected_calls) in [("all", 3), ("one_at_a_time", 5)] {
        let dir = tempfile::tempdir().unwrap();
        let store = SqliteStore::open(&dir.path().join("runtime.db")).unwrap();
        let gate = Arc::new(Notify::new());
        let (model, requests, started) = scripted(Some(gate.clone()), false, false);
        let mut registry = ModuleRegistry::default();
        registry
            .register_factory(Arc::new(StaticPromptFactory))
            .unwrap();
        registry
            .register_factory(Arc::new(InstanceFactory::new(
                "test.model",
                "1",
                ModuleInstance::Model(model),
            )))
            .unwrap();
        let compiled=compile_document(serde_json::from_value(json!({"modules":[{"reference":{"id":"m","version":"1"},"factory":"test.model","config":{}},{"reference":{"id":"p","version":"1"},"factory":"prompt.static","config":{"text":"system"}}],"agent":{"name":"mail","model":{"id":"m","version":"1"},"prompt":{"id":"p","version":"1"},"settings":{"input_delivery":{"steering":mode,"follow_up":mode}}}})).unwrap(),&registry).unwrap();
        let worker = tokio::spawn({
            let store = store.clone();
            async move {
                RunSupervisor::new(store)
                    .execute(&compiled, RunInput::new("query"), context())
                    .await
            }
        });
        started.notified().await;
        for (id, text, follow) in [
            ("follow-one", "follow one", true),
            ("follow-two", "follow two", true),
            ("steer-one", "steer one", false),
            ("steer-two", "steer two", false),
        ] {
            let mut input = envelope(id, text);
            if follow {
                input.input = MailInput::FollowUp {
                    message: PendingInterjection {
                        text: text.into(),
                        attachments: vec![],
                    },
                };
            }
            store.submit(input).await.unwrap();
        }
        gate.notify_one();
        let result = tokio::time::timeout(Duration::from_secs(10), worker)
            .await
            .unwrap()
            .unwrap()
            .unwrap();
        assert!(matches!(result, RunOutcome::Completed { .. }), "{result:?}");
        let requests = requests.lock().unwrap();
        assert_eq!(requests.len(), expected_calls, "{mode}");
        let text = |request: &ModelRequest| serde_json::to_string(&request.messages).unwrap();
        assert!(text(&requests[1]).contains("steer one"));
        assert!(!text(&requests[1]).contains("follow one"));
        let last = text(requests.last().unwrap());
        assert!(last.contains("follow one") && last.contains("follow two"));
    }
}
fn address() -> InputAddress {
    InputAddress::for_run("mail", &context())
}
fn envelope(id: &str, text: &str) -> MailEnvelope {
    MailEnvelope {
        address: address(),
        input_id: id.into(),
        input: MailInput::Interject {
            message: PendingInterjection {
                text: text.into(),
                attachments: vec![],
            },
        },
    }
}
fn compile(
    model: Arc<dyn Model>,
    tools: Option<ToolCatalog>,
    hook: Option<Arc<HookRegistration>>,
) -> CompiledAgent {
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(StaticPromptFactory))
        .unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "test.model",
            "1",
            ModuleInstance::Model(model),
        )))
        .unwrap();
    let mut modules = vec![
        json!({"reference":{"id":"m","version":"1"},"factory":"test.model","config":{}}),
        json!({"reference":{"id":"p","version":"1"},"factory":"prompt.static","config":{"text":"system"}}),
    ];
    let mut definition =
        json!({"name":"mail","model":{"id":"m","version":"1"},"prompt":{"id":"p","version":"1"}});
    if let Some(tools) = tools {
        registry
            .register_factory(Arc::new(InstanceFactory::new(
                "test.tools",
                "1",
                ModuleInstance::ToolPack(tools),
            )))
            .unwrap();
        modules
            .push(json!({"reference":{"id":"t","version":"1"},"factory":"test.tools","config":{}}));
        definition["tool_packs"] = json!([{"id":"t","version":"1"}]);
    }
    if let Some(hook) = hook {
        registry
            .register_factory(Arc::new(InstanceFactory::new(
                "test.hook",
                "1",
                ModuleInstance::Hook(hook),
            )))
            .unwrap();
        modules
            .push(json!({"reference":{"id":"h","version":"1"},"factory":"test.hook","config":{}}));
        definition["hooks"] = json!([{"id":"h","version":"1"}]);
    }
    compile_document(
        serde_json::from_value(json!({"modules":modules,"agent":definition})).unwrap(),
        &registry,
    )
    .unwrap()
}
struct Script {
    requests: Arc<Mutex<Vec<ModelRequest>>>,
    started: Arc<Notify>,
    gate: Option<Arc<Notify>>,
    tools: bool,
    pause: bool,
}
#[async_trait::async_trait]
impl Model for Script {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        let first = {
            let mut requests = self.requests.lock().unwrap();
            let first = requests.is_empty();
            requests.push(request);
            first
        };
        if first {
            self.started.notify_one();
            if let Some(gate) = &self.gate {
                gate.notified().await;
            }
            if self.pause {
                return Err(Error::GovernancePaused(json!({"kind":"test_hold"})));
            }
        }
        Ok(ModelResponse {
            output: "final".into(),
            tool_calls: if first && self.tools {
                (1..=2)
                    .map(|n| ToolCall {
                        id: format!("call-{n}"),
                        name: "effect".into(),
                        arguments: json!({"n":n}),
                    })
                    .collect()
            } else {
                vec![]
            },
            ..Default::default()
        })
    }
}
fn scripted(
    gate: Option<Arc<Notify>>,
    tools: bool,
    pause: bool,
) -> (Arc<Script>, Arc<Mutex<Vec<ModelRequest>>>, Arc<Notify>) {
    let requests = Arc::new(Mutex::new(Vec::new()));
    let started = Arc::new(Notify::new());
    (
        Arc::new(Script {
            requests: requests.clone(),
            started: started.clone(),
            gate,
            tools,
            pause,
        }),
        requests,
        started,
    )
}
async fn paused(path: &Path) -> (SqliteStore, CompiledAgent) {
    let store = SqliteStore::open(path).unwrap();
    let (model, _, _) = scripted(None, false, true);
    let compiled = compile(model, None, None);
    assert!(matches!(
        RunSupervisor::new(store.clone())
            .execute(&compiled, RunInput::new("query"), context())
            .await
            .unwrap(),
        RunOutcome::Paused { .. }
    ));
    (store, compiled)
}
async fn consumer(store: &SqliteStore) -> (Lease, GuardedCheckpointer) {
    // Same documented checkpoint/thread namespace used by the supervisor.
    let lease = store
        .acquire("4:mailthread", "test-worker", Duration::from_secs(10))
        .await
        .unwrap();
    let guarded = store.guarded(&lease);
    (lease, guarded)
}

#[tokio::test]
async fn queue_is_durable_idempotent_bounded_and_checks_exact_recorded_recipient() {
    let temp = tempfile::tempdir().unwrap();
    let path = temp.path().join("runtime.db");
    let store = SqliteStore::open(&path).unwrap();
    assert!(store.submit(envelope("a", "one")).await.is_err());
    let (store, _) = paused(&path).await;
    let first = store.submit(envelope("a", "one")).await.unwrap();
    assert_eq!(first.status, InputStatus::Pending);
    assert_eq!(
        store.submit(envelope("a", "one")).await.unwrap().sequence,
        first.sequence
    );
    assert!(store.submit(envelope("a", "different")).await.is_err());
    let mut wrong = envelope("wrong", "text");
    wrong.address.thread_id = "other".into();
    assert!(store.submit(wrong).await.is_err());
    let mut wrong = envelope("wrong", "text");
    wrong.address.run_id = "unrecorded-child".into();
    assert!(store.submit(wrong).await.is_err());
    let mut oversized = envelope("large", &"x".repeat(65537));
    assert!(store.submit(oversized.clone()).await.is_err());
    oversized.input_id = "".into();
    assert!(store.submit(oversized).await.is_err());
    drop(store);
    let store = SqliteStore::open(&path).unwrap();
    let (lease, guarded) = consumer(&store).await;
    let claimed = guarded
        .claim(&address(), InputKind::Interject)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(claimed.sequence, first.sequence);
    assert_eq!(claimed.status, InputStatus::Claimed);
    assert_eq!(
        guarded
            .claim(&address(), InputKind::Interject)
            .await
            .unwrap()
            .unwrap()
            .sequence,
        first.sequence
    );
    let mut forged = claimed.clone();
    forged.digest = "modified".into();
    assert!(guarded.acknowledge(&forged, None).await.is_err());
    guarded.acknowledge(&claimed, None).await.unwrap();
    guarded.acknowledge(&claimed, None).await.unwrap();
    assert!(
        guarded
            .acknowledge(&claimed, Some("different disposition".into()))
            .await
            .is_err()
    );
    assert!(
        guarded
            .claim(&address(), InputKind::Interject)
            .await
            .unwrap()
            .is_none()
    );
    assert_eq!(
        store
            .input_status(&address(), "a")
            .await
            .unwrap()
            .unwrap()
            .status,
        InputStatus::Delivered
    );
    store.release(&lease).await.unwrap();
}

#[tokio::test]
async fn held_next_turn_protects_fifo_and_keeps_its_compilation_snapshot() {
    let temp = tempfile::tempdir().unwrap();
    let (store, compiled) = paused(&temp.path().join("runtime.db")).await;
    let next = MailEnvelope {
        address: address(),
        input_id: "next".into(),
        input: MailInput::NextTurn {
            run_id: "next-run".into(),
            snapshot: compiled.snapshot.clone(),
            message: PendingInterjection {
                text: "new turn".into(),
                attachments: vec![],
            },
        },
    };
    store.submit(next.clone()).await.unwrap();
    store
        .submit(envelope("later", "cannot jump ahead"))
        .await
        .unwrap();
    let (lease, guarded) = consumer(&store).await;
    assert!(
        guarded
            .claim(&address(), InputKind::Interject)
            .await
            .unwrap()
            .is_none()
    );
    assert!(
        guarded
            .claim(&address(), InputKind::NextTurn)
            .await
            .unwrap()
            .is_none()
    );
    store.release(&lease).await.unwrap();
    assert!(matches!(
        RunSupervisor::new(store.clone())
            .execute(&compiled, RunInput::resume(), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    let (lease, guarded) = consumer(&store).await;
    let head = guarded
        .claim(&address(), InputKind::NextTurn)
        .await
        .unwrap()
        .unwrap();
    let MailInput::NextTurn {
        snapshot, run_id, ..
    } = head.envelope.input
    else {
        panic!("wrong input")
    };
    assert_eq!(run_id, "next-run");
    assert_eq!(
        serde_json::to_value(snapshot).unwrap(),
        serde_json::to_value(compiled.snapshot).unwrap()
    );
    assert!(
        guarded
            .claim(&address(), InputKind::Interject)
            .await
            .unwrap()
            .is_none()
    );
    store.release(&lease).await.unwrap();
}

struct Effect {
    count: Arc<AtomicUsize>,
    started: Arc<Notify>,
    gate: Arc<Notify>,
}
impl Tool for Effect {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("effect").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        let mut d = ToolDescription::new("effect", "record effect");
        d.arguments_schema =
            Some(json!({"type":"object","properties":{"n":{"type":"integer"}},"required":["n"]}));
        d
    }
    async fn run(
        &self,
        _: ToolCallContext,
        arguments: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        if self.count.fetch_add(1, Ordering::SeqCst) == 0 {
            self.started.notify_one();
            self.gate.notified().await;
        }
        Ok(arguments)
    }
}
struct Capture(Arc<Mutex<Vec<Message>>>);
#[async_trait::async_trait]
impl HookHandler for Capture {
    async fn handle(&self, _: &HookEvent, context: &RunContext) -> Result<HookDecision, Error> {
        if let Some(receipt) = context.capabilities.get::<memory::DurableTurnReceipt>() {
            *self.0.lock().unwrap() = receipt.messages().to_vec();
        }
        Ok(HookDecision::Continue)
    }
}
#[tokio::test]
async fn interjections_wait_for_all_tool_results_keep_fifo_and_capture_raw_user_text() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let (model, requests, _) = scripted(None, true, false);
    let count = Arc::new(AtomicUsize::new(0));
    let started = Arc::new(Notify::new());
    let gate = Arc::new(Notify::new());
    let mut tools = ToolCatalog::new();
    tools
        .insert(ToolEntry::typed(Effect {
            count: count.clone(),
            started: started.clone(),
            gate: gate.clone(),
        }))
        .unwrap();
    let captured = Arc::new(Mutex::new(Vec::new()));
    let hook = Arc::new(
        HookRegistration::new(
            "capture@1".into(),
            EventCatalog::runtime().get("turn_done").unwrap().clone(),
            HookRule {
                event: "turn_done".into(),
                priority: 0,
                timeout_ms: 1000,
                failure: FailurePolicy::Closed,
                matches: None,
            },
            Arc::new(Capture(captured.clone())),
        )
        .unwrap(),
    );
    let compiled = compile(model, Some(tools), Some(hook));
    let worker = {
        let store = store.clone();
        tokio::spawn(async move {
            RunSupervisor::new(store)
                .execute(&compiled, RunInput::new("original"), context())
                .await
        })
    };
    tokio::time::timeout(Duration::from_secs(3), started.notified())
        .await
        .unwrap();
    store.submit(envelope("one", "first steer")).await.unwrap();
    let mut image = envelope("image", "unsupported image");
    let MailInput::Interject { message } = &mut image.input else {
        unreachable!()
    };
    message.attachments.push(InputPart::Image {
        url: "https://example.invalid/image.png".into(),
    });
    store.submit(image).await.unwrap();
    store.submit(envelope("two", "second steer")).await.unwrap();
    gate.notify_one();
    let RunOutcome::Completed { state, .. } = worker.await.unwrap().unwrap() else {
        panic!("not completed")
    };
    assert_eq!(count.load(Ordering::SeqCst), 2);
    assert_eq!(requests.lock().unwrap().len(), 2);
    {
        let messages = &requests.lock().unwrap()[1].messages;
        let a = messages
            .iter()
            .position(|m| matches!(m,Message::Tool {call_id,..} if call_id=="call-1"))
            .unwrap();
        let b = messages
            .iter()
            .position(|m| matches!(m,Message::Tool {call_id,..} if call_id=="call-2"))
            .unwrap();
        let first = messages.iter().position(|m| matches!(m,Message::User {content} if content.contains("<user_query>\nfirst steer"))).unwrap();
        let second = messages.iter().position(|m| matches!(m,Message::User {content} if content.contains("<user_query>\nsecond steer"))).unwrap();
        assert!(a < b && b < first && first < second);
    }
    assert_eq!(state.input_progress.capture.len(), 2);
    {
        let captured = captured.lock().unwrap();
        for text in ["original", "first steer", "second steer"] {
            assert!(
                captured
                    .iter()
                    .any(|m| matches!(m,Message::User {content} if content==text))
            );
        }
        assert!(!captured.iter().any(
        |m| matches!(m,Message::User {content} if content.contains("The user sent a message while"))
    ));
    }
    assert_eq!(
        store
            .input_status(&address(), "image")
            .await
            .unwrap()
            .unwrap()
            .status,
        InputStatus::Rejected
    );
    let events = store.events("run", 0, 1000).await.unwrap();
    let statuses: Vec<_> = events
        .into_iter()
        .filter_map(|e| {
            if let RunEvent::Input {
                input_id, status, ..
            } = e.event
            {
                Some((input_id, status))
            } else {
                None
            }
        })
        .collect();
    assert_eq!(
        statuses,
        vec![
            ("one".into(), InputStatus::Delivered),
            ("image".into(), InputStatus::Rejected),
            ("two".into(), InputStatus::Delivered)
        ]
    );
}

#[tokio::test]
async fn durable_cancel_interrupts_blocked_model_and_requires_observed_resume_cursor() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let (model, requests, started) = scripted(Some(Arc::new(Notify::new())), false, false);
    let compiled = Arc::new(compile(model, None, None));
    let worker = {
        let store = store.clone();
        let compiled = compiled.clone();
        tokio::spawn(async move {
            RunSupervisor::new(store)
                .execute(&compiled, RunInput::new("query"), context())
                .await
        })
    };
    tokio::time::timeout(Duration::from_secs(3), started.notified())
        .await
        .unwrap();
    let cursor = store.cancel(&address(), "stop-1").await.unwrap();
    assert_eq!(store.cancel(&address(), "stop-1").await.unwrap(), cursor);
    assert!(matches!(
        tokio::time::timeout(Duration::from_secs(3), worker)
            .await
            .unwrap()
            .unwrap()
            .unwrap(),
        RunOutcome::Cancelled { .. }
    ));
    let supervisor = RunSupervisor::new(store.clone());
    assert!(matches!(
        supervisor
            .execute(&compiled, RunInput::resume(), context())
            .await
            .unwrap(),
        RunOutcome::Cancelled { .. }
    ));
    assert_eq!(requests.lock().unwrap().len(), 1);
    assert!(
        supervisor
            .execute(
                &compiled,
                RunInput::resume_after_cancel(cursor + 100),
                context()
            )
            .await
            .is_err()
    );
    let second = store.cancel(&address(), "stop-2").await.unwrap();
    // A newer cancellation is never swallowed by acknowledging an older one.
    assert!(matches!(
        supervisor
            .execute(&compiled, RunInput::resume_after_cancel(cursor), context())
            .await
            .unwrap(),
        RunOutcome::Cancelled { .. }
    ));
    assert!(matches!(
        supervisor
            .execute(&compiled, RunInput::resume_after_cancel(second), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(requests.lock().unwrap().len(), 2);
}

#[tokio::test]
async fn explicit_cancel_resume_reopens_only_the_settled_cancelled_compaction_operation() {
    use nofy_agent_runtime::{
        context_policy::*,
        governance::{
            BudgetLimits, GovernanceProfile, InstalledBudget, ModelRetryPolicy, operation_scope,
            sample_model,
        },
    };
    struct Compact {
        model: Arc<dyn Model>,
    }
    #[async_trait::async_trait]
    impl ContextPolicy for Compact {
        async fn plan(&self, _: &RunState, _: &RunContext) -> Result<Option<Value>, Error> {
            Ok(Some(json!({"compact":true})))
        }
        async fn apply(
            &self,
            state: &RunState,
            _: &Value,
            context: &RunContext,
        ) -> Result<ContextUpdate, Error> {
            let operation = serde_json::to_string(&(operation_scope(context).unwrap(), 0)).unwrap();
            sample_model(
                self.model.as_ref(),
                ModelRequest {
                    messages: vec![],
                    tools: vec![],
                    settings: json!({}),
                },
                context,
                &operation,
                false,
                |_| async { Ok(()) },
            )
            .await?;
            Ok(ContextUpdate {
                messages: state.messages.clone(),
                retained_from: 0,
                retained_at: 0,
                input_tokens: 0,
                output_tokens: 0,
                metadata: json!({}),
            })
        }
    }
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let (summary, requests, started) = scripted(Some(Arc::new(Notify::new())), false, false);
    let (model, _, _) = scripted(None, false, false);
    let mut compiled = compile(model, None, None);
    let profile = Arc::new(
        GovernanceProfile::new(
            Arc::new(
                InstalledBudget::install(
                    Arc::new(store.clone()),
                    BudgetLimits {
                        max_model_calls: Some(4),
                        ..Default::default()
                    },
                    "cancel-compact@1",
                    1,
                )
                .unwrap(),
            ),
            BudgetLimits::default(),
            ModelRetryPolicy::default(),
        )
        .unwrap(),
    );
    compiled.agent = compiled
        .agent
        .with_context_policy("compact@1", Arc::new(Compact { model: summary }))
        .unwrap()
        .with_governance(profile);
    let compiled = Arc::new(compiled);
    let worker = {
        let compiled = compiled.clone();
        let store = store.clone();
        tokio::spawn(async move {
            RunSupervisor::new(store)
                .execute(&compiled, RunInput::new("query"), context())
                .await
        })
    };
    tokio::time::timeout(Duration::from_secs(3), started.notified())
        .await
        .unwrap();
    let cursor = store.cancel(&address(), "cancel-compaction").await.unwrap();
    assert!(matches!(
        worker.await.unwrap().unwrap(),
        RunOutcome::Cancelled { .. }
    ));
    assert_eq!(requests.lock().unwrap().len(), 1);
    let result = RunSupervisor::new(store)
        .execute(&compiled, RunInput::resume_after_cancel(cursor), context())
        .await
        .unwrap();
    assert!(matches!(result, RunOutcome::Completed { .. }), "{result:?}");
    assert_eq!(requests.lock().unwrap().len(), 2);
}

struct ManualClock(AtomicU64);
impl Clock for ManualClock {
    fn now_ms(&self) -> u64 {
        self.0.load(Ordering::SeqCst)
    }
}
#[tokio::test]
async fn replaced_root_lease_fences_mailbox_claim_ack_and_cancel_ack() {
    let temp = tempfile::tempdir().unwrap();
    let path = temp.path().join("runtime.db");
    let (_, _) = paused(&path).await;
    let clock = Arc::new(ManualClock(AtomicU64::new(1000)));
    let store = SqliteStore::open_with_clock(&path, clock.clone()).unwrap();
    store.submit(envelope("one", "hello")).await.unwrap();
    let cursor = store.cancel(&address(), "stop").await.unwrap();
    let lease = store
        .acquire("4:mailthread", "old", Duration::from_millis(100))
        .await
        .unwrap();
    let old = store.guarded(&lease);
    let claim = old
        .claim(&address(), InputKind::Interject)
        .await
        .unwrap()
        .unwrap();
    clock.0.store(1200, Ordering::SeqCst);
    let fresh = store
        .acquire("4:mailthread", "new", Duration::from_secs(1))
        .await
        .unwrap();
    let current = store.guarded(&fresh);
    assert!(old.claim(&address(), InputKind::Interject).await.is_err());
    assert!(old.acknowledge(&claim, None).await.is_err());
    assert!(old.pending_cancel(&address()).await.is_err());
    assert!(old.acknowledge_cancel(&address(), cursor).await.is_err());
    assert_eq!(
        current
            .claim(&address(), InputKind::Interject)
            .await
            .unwrap()
            .unwrap()
            .sequence,
        claim.sequence
    );
    current.acknowledge(&claim, None).await.unwrap();
    current
        .acknowledge_cancel(&address(), cursor)
        .await
        .unwrap();
    store.release(&fresh).await.unwrap();
}

struct FaultInbox {
    inner: GuardedCheckpointer,
    fail: AtomicBool,
    exit: bool,
}
#[async_trait::async_trait]
impl InputInbox for FaultInbox {
    fn identity(&self) -> String {
        self.inner.identity()
    }
    fn is_durable(&self) -> bool {
        true
    }
    async fn claim(&self, a: &InputAddress, k: InputKind) -> Result<Option<MailDelivery>, Error> {
        self.inner.claim(a, k).await
    }
    async fn acknowledge(&self, d: &MailDelivery, r: Option<String>) -> Result<(), Error> {
        if self.fail.swap(false, Ordering::SeqCst) {
            if self.exit {
                std::process::exit(93)
            }
            return Err(Error::Checkpoint("lost mailbox ack".into()));
        }
        self.inner.acknowledge(d, r).await
    }
    async fn pending_cancel(&self, a: &InputAddress) -> Result<Option<u64>, Error> {
        self.inner.pending_cancel(a).await
    }
    async fn acknowledge_cancel(&self, a: &InputAddress, c: u64) -> Result<(), Error> {
        self.inner.acknowledge_cancel(a, c).await
    }
}
#[tokio::test]
async fn lost_ack_replays_delivery_receipt_without_injecting_user_input_twice() {
    let temp = tempfile::tempdir().unwrap();
    let (store, compiled) = paused(&temp.path().join("runtime.db")).await;
    store.submit(envelope("one", "exactly once")).await.unwrap();
    let (lease, guarded) = consumer(&store).await;
    let mut ctx = context();
    ctx.capabilities.insert(MailboxBinding(Arc::new(FaultInbox {
        inner: guarded.clone(),
        fail: AtomicBool::new(true),
        exit: false,
    })));
    let agent = compiled
        .agent
        .clone()
        .with_checkpointer(Arc::new(guarded.clone()));
    assert!(matches!(
        agent.invoke(RunInput::resume(), ctx).await,
        Err(Error::Checkpoint(_))
    ));
    let mut ctx = context();
    ctx.capabilities.insert(MailboxBinding(Arc::new(guarded)));
    let RunOutcome::Completed { state, .. } = agent.invoke(RunInput::resume(), ctx).await.unwrap()
    else {
        panic!("not completed")
    };
    assert_eq!(state.messages.iter().filter(|m|matches!(m,Message::User {content} if content.contains("<user_query>\nexactly once"))).count(),1);
    assert_eq!(
        store
            .input_status(&address(), "one")
            .await
            .unwrap()
            .unwrap()
            .status,
        InputStatus::Delivered
    );
    store.release(&lease).await.unwrap();
}

struct FaultCheckpoint {
    inner: GuardedCheckpointer,
    after_ack: bool,
    fail: AtomicBool,
}
#[async_trait::async_trait]
impl Checkpointer for FaultCheckpoint {
    fn is_durable(&self) -> bool {
        true
    }
    async fn load(&self, key: &str) -> Result<Option<Checkpoint>, Error> {
        self.inner.load(key).await
    }
    async fn save(
        &self,
        key: &str,
        expected: Option<u64>,
        checkpoint: Checkpoint,
    ) -> Result<(), Error> {
        if checkpoint.state.input_progress.capture.len() == 1
            && checkpoint.state.input_progress.unacknowledged.is_none() == self.after_ack
            && self.fail.swap(false, Ordering::SeqCst)
        {
            return Err(Error::Checkpoint("lost input checkpoint".into()));
        }
        self.inner.save(key, expected, checkpoint).await
    }
}
#[tokio::test]
async fn lost_transcript_or_ack_checkpoint_never_discards_or_duplicates_an_input() {
    for after_ack in [false, true] {
        let temp = tempfile::tempdir().unwrap();
        let (store, compiled) = paused(&temp.path().join("runtime.db")).await;
        store.submit(envelope("one", "persist me")).await.unwrap();
        let (lease, guarded) = consumer(&store).await;
        let agent = compiled
            .agent
            .clone()
            .with_checkpointer(Arc::new(FaultCheckpoint {
                inner: guarded.clone(),
                after_ack,
                fail: AtomicBool::new(true),
            }));
        let mut ctx = context();
        ctx.capabilities
            .insert(MailboxBinding(Arc::new(guarded.clone())));
        assert!(matches!(
            agent.invoke(RunInput::resume(), ctx).await,
            Err(Error::Checkpoint(_))
        ));
        assert_eq!(
            store
                .input_status(&address(), "one")
                .await
                .unwrap()
                .unwrap()
                .status,
            if after_ack {
                InputStatus::Delivered
            } else {
                InputStatus::Claimed
            }
        );
        let agent = compiled.agent.with_checkpointer(Arc::new(guarded.clone()));
        let mut ctx = context();
        ctx.capabilities.insert(MailboxBinding(Arc::new(guarded)));
        let RunOutcome::Completed { state, .. } =
            agent.invoke(RunInput::resume(), ctx).await.unwrap()
        else {
            panic!("not completed")
        };
        assert_eq!(state.messages.iter().filter(|m|matches!(m,Message::User {content} if content.contains("<user_query>\npersist me"))).count(),1);
        assert_eq!(
            store
                .input_status(&address(), "one")
                .await
                .unwrap()
                .unwrap()
                .status,
            InputStatus::Delivered
        );
        store.release(&lease).await.unwrap();
    }
}

#[tokio::test]
async fn mailbox_process_worker() {
    let Ok(directory) = std::env::var("NOFY_MAILBOX_WORKER") else {
        return;
    };
    let directory = Path::new(&directory);
    let phase = std::env::var("NOFY_MAILBOX_PHASE").unwrap();
    struct DiskModel(std::path::PathBuf);
    #[async_trait::async_trait]
    impl Model for DiskModel {
        async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
            use std::io::Write;
            let first = std::fs::read_to_string(&self.0)
                .unwrap_or_default()
                .is_empty();
            writeln!(
                std::fs::OpenOptions::new()
                    .create(true)
                    .append(true)
                    .open(&self.0)
                    .unwrap(),
                "call"
            )
            .unwrap();
            if first {
                return Err(Error::GovernancePaused(json!({"kind":"hold"})));
            }
            Ok(ModelResponse {
                output: "final".into(),
                ..Default::default()
            })
        }
    }
    let clock = Arc::new(ManualClock(AtomicU64::new(if phase == "crash" {
        1000
    } else {
        2000
    })));
    let store = SqliteStore::open_with_clock(&directory.join("runtime.db"), clock).unwrap();
    let compiled = compile(
        Arc::new(DiskModel(directory.join("models.log"))),
        None,
        None,
    );
    if phase == "crash" {
        assert!(matches!(
            RunSupervisor::new(store.clone())
                .execute(&compiled, RunInput::new("query"), context())
                .await
                .unwrap(),
            RunOutcome::Paused { .. }
        ));
        store
            .submit(envelope("durable", "survive exit"))
            .await
            .unwrap();
    }
    let lease = store
        .acquire("4:mailthread", "process", Duration::from_millis(100))
        .await
        .unwrap();
    let guarded = store.guarded(&lease);
    let mut ctx = context();
    ctx.capabilities.insert(MailboxBinding(Arc::new(FaultInbox {
        inner: guarded.clone(),
        fail: AtomicBool::new(phase == "crash"),
        exit: true,
    })));
    let RunOutcome::Completed { state, .. } = compiled
        .agent
        .with_checkpointer(Arc::new(guarded))
        .invoke(RunInput::resume(), ctx)
        .await
        .unwrap()
    else {
        panic!("not completed")
    };
    assert_eq!(state.messages.iter().filter(|m|matches!(m,Message::User {content} if content.contains("<user_query>\nsurvive exit"))).count(),1);
    assert_eq!(
        store
            .input_status(&address(), "durable")
            .await
            .unwrap()
            .unwrap()
            .status,
        InputStatus::Delivered
    );
    store.release(&lease).await.unwrap();
}
#[test]
fn abrupt_process_exit_after_transcript_commit_recovers_claim_and_ack_without_duplicate() {
    let temp = tempfile::tempdir().unwrap();
    for (phase, code) in [("crash", 93), ("recover", 0)] {
        let result = std::process::Command::new(std::env::current_exe().unwrap())
            .args(["--exact", "mailbox_process_worker", "--nocapture"])
            .env("NOFY_MAILBOX_WORKER", temp.path())
            .env("NOFY_MAILBOX_PHASE", phase)
            .output()
            .unwrap();
        assert_eq!(
            result.status.code(),
            Some(code),
            "{}{}",
            String::from_utf8_lossy(&result.stdout),
            String::from_utf8_lossy(&result.stderr)
        );
    }
    assert_eq!(
        std::fs::read_to_string(temp.path().join("models.log"))
            .unwrap()
            .lines()
            .count(),
        2
    );
}

#[tokio::test]
async fn control_store_failure_stops_io_and_reports_failure_instead_of_user_cancellation() {
    struct BrokenControl(AtomicUsize);
    #[async_trait::async_trait]
    impl InputInbox for BrokenControl {
        fn identity(&self) -> String {
            "broken-test@1".into()
        }
        async fn claim(
            &self,
            _: &InputAddress,
            _: InputKind,
        ) -> Result<Option<MailDelivery>, Error> {
            Ok(None)
        }
        async fn acknowledge(&self, _: &MailDelivery, _: Option<String>) -> Result<(), Error> {
            unreachable!()
        }
        async fn pending_cancel(&self, _: &InputAddress) -> Result<Option<u64>, Error> {
            if self.0.fetch_add(1, Ordering::SeqCst) == 0 {
                Ok(None)
            } else {
                Err(Error::Checkpoint("control read unavailable".into()))
            }
        }
        async fn acknowledge_cancel(&self, _: &InputAddress, _: u64) -> Result<(), Error> {
            unreachable!()
        }
    }
    let (model, _, _) = scripted(Some(Arc::new(Notify::new())), false, false);
    let compiled = compile(model, None, None);
    let agent = compiled
        .agent
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    let mut ctx = context();
    ctx.capabilities
        .insert(MailboxBinding(Arc::new(BrokenControl(AtomicUsize::new(0)))));
    let result = tokio::time::timeout(
        Duration::from_secs(2),
        agent.invoke(RunInput::new("query"), ctx),
    )
    .await
    .unwrap();
    assert!(
        matches!(result,Err(Error::Checkpoint(message)) if message.contains("control read unavailable"))
    );
}

struct ProofTool(Arc<Mutex<Vec<bool>>>);
impl Tool for ProofTool {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("effect").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        let mut d = ToolDescription::new("effect", "proof test");
        d.arguments_schema = Some(json!({"type":"object"}));
        d
    }
    async fn run(
        &self,
        ctx: ToolCallContext,
        args: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        let authorized = ctx
            .get::<UserToolInvocation>()
            .is_some_and(|proof| proof.admits(&ctx, &self.id(), &args));
        let run = ctx.get::<RunContext>().unwrap();
        assert!(run.capabilities.get::<UserToolInvocation>().is_none());
        assert!(
            nofy_agent_runtime::tools::call_context("nested", &run)
                .unwrap()
                .get::<UserToolInvocation>()
                .is_none()
        );
        self.0.lock().unwrap().push(authorized);
        Ok(json!({"authorized":authorized}))
    }
}
fn tool_input(id: &str, args: Value) -> MailEnvelope {
    MailEnvelope {
        address: address(),
        input_id: id.into(),
        input: MailInput::Tool {
            call: ToolCall {
                id: String::new(),
                name: "effect".into(),
                arguments: args,
            },
        },
    }
}
#[tokio::test]
async fn user_tool_proof_is_consumed_and_cannot_be_forged_by_model_arguments_or_call_id() {
    use nofy_agent_runtime::governance::{
        BudgetLimits, BudgetScope, BudgetStore, GovernanceProfile, InstalledBudget,
        ModelRetryPolicy,
    };
    struct Forge {
        calls: AtomicUsize,
        id: Arc<Mutex<String>>,
        started: Arc<Notify>,
        gate: Arc<Notify>,
    }
    #[async_trait::async_trait]
    impl Model for Forge {
        async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
            match self.calls.fetch_add(1, Ordering::SeqCst) {
                0 => {
                    self.started.notify_one();
                    self.gate.notified().await;
                    Ok(ModelResponse {
                        output: "ready".into(),
                        ..Default::default()
                    })
                }
                1 => Ok(ModelResponse {
                    tool_calls: vec![ToolCall {
                        id: self.id.lock().unwrap().clone(),
                        name: "effect".into(),
                        arguments: json!({"n":1,"user_initiated":true}),
                    }],
                    ..Default::default()
                }),
                _ => Ok(ModelResponse {
                    output: "final".into(),
                    ..Default::default()
                }),
            }
        }
    }
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let seen = Arc::new(Mutex::new(Vec::new()));
    let mut tools = ToolCatalog::new();
    tools
        .insert(ToolEntry::typed(ProofTool(seen.clone())))
        .unwrap();
    let id = Arc::new(Mutex::new(String::new()));
    let started = Arc::new(Notify::new());
    let gate = Arc::new(Notify::new());
    let captured = Arc::new(Mutex::new(Vec::new()));
    let capture = Arc::new(
        HookRegistration::new(
            "capture-command@1".into(),
            EventCatalog::runtime().get("turn_done").unwrap().clone(),
            HookRule {
                event: "turn_done".into(),
                priority: 0,
                timeout_ms: 1000,
                failure: FailurePolicy::Closed,
                matches: None,
            },
            Arc::new(Capture(captured.clone())),
        )
        .unwrap(),
    );
    let mut compiled = compile(
        Arc::new(Forge {
            calls: AtomicUsize::new(0),
            id: id.clone(),
            started: started.clone(),
            gate: gate.clone(),
        }),
        Some(tools),
        Some(capture),
    );
    let profile = Arc::new(
        GovernanceProfile::new(
            Arc::new(
                InstalledBudget::install(
                    Arc::new(store.clone()),
                    BudgetLimits {
                        max_model_calls: Some(3),
                        max_tool_calls: Some(2),
                        ..Default::default()
                    },
                    "user-command@1",
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
        root_run_id: "run".into(),
        identity: profile.identity().into(),
    };
    compiled.agent = compiled.agent.with_governance(profile);
    let compiled = Arc::new(compiled);
    let supervisor = RunSupervisor::new(store.clone());
    let worker = {
        let compiled = compiled.clone();
        let store = store.clone();
        tokio::spawn(async move {
            RunSupervisor::new(store)
                .execute(&compiled, RunInput::new("query"), context())
                .await
        })
    };
    tokio::time::timeout(Duration::from_secs(3), started.notified())
        .await
        .unwrap();
    let input = tool_input("user-command", json!({"n":1}));
    let receipt = store.submit(input.clone()).await.unwrap();
    *id.lock().unwrap() = format!("host-input:{}:{}", receipt.sequence, receipt.digest);
    gate.notify_one();
    let RunOutcome::Completed { state, .. } = worker.await.unwrap().unwrap() else {
        panic!("not completed")
    };
    assert_eq!(*seen.lock().unwrap(), vec![true, false]);
    {
        let capture = captured.lock().unwrap();
        assert!(
            capture
                .iter()
                .any(|m| matches!(m,Message::User {content} if content=="query"))
        );
        assert!(!capture.iter().any(
            |m| matches!(m,Message::Tool {content,..} if content["value"]["authorized"]==true)
        ));
        assert!(capture.iter().any(
            |m| matches!(m,Message::Tool {content,..} if content["value"]["authorized"]==false)
        ));
    }
    let summary = store.inspect(&scope).await.unwrap().unwrap();
    assert_eq!(summary.used.tool_calls, 2);
    assert_eq!(summary.used.model_calls, 3);
    assert!(state.input_progress.command.is_none());
    assert_eq!(
        store.submit(input).await.unwrap().status,
        InputStatus::Delivered
    );
    assert!(matches!(
        supervisor
            .execute(&compiled, RunInput::resume(), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(*seen.lock().unwrap(), vec![true, false]);
}
#[tokio::test]
async fn user_command_still_requires_exact_permission_and_survives_approval_pause() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let (model, _, _) = scripted(None, false, true);
    let seen = Arc::new(Mutex::new(Vec::new()));
    let mut tools = ToolCatalog::new();
    tools
        .insert(ToolEntry::typed(ProofTool(seen.clone())))
        .unwrap();
    let mut compiled = compile(model, Some(tools), None);
    compiled.agent = compiled
        .agent
        .with_required_policy(
            "approval@1",
            Arc::new(nofy_agent_runtime::supervisor::DurableApprovalPolicy::new(
                store.clone(),
            )),
        )
        .unwrap();
    let supervisor = RunSupervisor::new(store.clone());
    assert!(matches!(
        supervisor
            .execute(&compiled, RunInput::new("query"), context())
            .await
            .unwrap(),
        RunOutcome::Paused { .. }
    ));
    store
        .submit(tool_input("manual", json!({"n":1})))
        .await
        .unwrap();
    let RunOutcome::Paused { state, .. } = supervisor
        .execute(&compiled, RunInput::resume(), context())
        .await
        .unwrap()
    else {
        panic!("not paused")
    };
    assert!(state.input_progress.command.is_some());
    assert!(seen.lock().unwrap().is_empty());
    let requests = store.pending_approvals("run").await.unwrap();
    assert_eq!(requests.len(), 1);
    let mut wrong = requests[0].clone();
    wrong.call.arguments = json!({"n":2});
    assert!(store.decide(&wrong, true).await.is_err());
    store.decide(&requests[0], true).await.unwrap();
    assert!(matches!(
        supervisor
            .execute(&compiled, RunInput::resume(), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(*seen.lock().unwrap(), vec![true]);
}
