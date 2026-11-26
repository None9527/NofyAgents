#![cfg(feature = "sqlite")]
use nofy_agent_runtime::{
    compile::*,
    durable::*,
    governance::{BudgetLimits, GovernanceFactory, InstalledBudget},
    mailbox::*,
    registry::*,
    supervisor::{RunSupervisor, jobs::*},
    *,
};
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    path::Path,
    sync::{
        Arc, Mutex,
        atomic::{AtomicBool, AtomicU64, AtomicUsize, Ordering},
    },
    time::Duration,
};
use tokio::sync::Notify;

struct Echo {
    seen: Arc<Mutex<Vec<(String, ModelRequest)>>>,
    gate: Option<Arc<Notify>>,
    started: Arc<Notify>,
    gated: AtomicBool,
}
#[async_trait::async_trait]
impl Model for Echo {
    async fn complete(
        &self,
        request: ModelRequest,
        context: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.seen
            .lock()
            .unwrap()
            .push((context.run_id.clone(), request.clone()));
        if let Some(gate) = &self.gate
            && context.run_id == "original"
            && !self.gated.swap(true, Ordering::SeqCst)
        {
            self.started.notify_one();
            gate.notified().await;
        }
        let output = request
            .messages
            .iter()
            .rev()
            .find_map(|m| {
                if let Message::User { content } = m {
                    Some(content.clone())
                } else {
                    None
                }
            })
            .unwrap_or_default();
        Ok(ModelResponse {
            output,
            ..Default::default()
        })
    }
}
fn message(text: &str) -> PendingInterjection<InputPart> {
    PendingInterjection {
        text: text.into(),
        attachments: vec![],
    }
}
fn registry(
    store: &SqliteStore,
    model: Arc<dyn Model>,
    revision: &str,
    prompt: Option<Arc<dyn Prompt>>,
) -> ModuleRegistry {
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "host.model",
            revision,
            ModuleInstance::Model(model),
        )))
        .unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "host.prompt",
            "1",
            ModuleInstance::Prompt(
                prompt.unwrap_or_else(|| Arc::new(StaticPrompt("system".into()))),
            ),
        )))
        .unwrap();
    registry
        .register_factory(Arc::new(
            GovernanceFactory::new(BTreeMap::from([(
                "root".into(),
                Arc::new(
                    InstalledBudget::install(
                        Arc::new(store.clone()),
                        BudgetLimits {
                            max_model_calls: Some(100),
                            ..Default::default()
                        },
                        "host@1",
                        1,
                    )
                    .unwrap(),
                ),
            )]))
            .unwrap(),
        ))
        .unwrap();
    for (id, factory, config) in [
        ("model", "host.model", json!({})),
        ("prompt", "host.prompt", json!({})),
        ("budget", "governance.budget", json!({"resource":"root"})),
    ] {
        registry
            .define(ModuleDefinition {
                reference: ModuleRef::new(id, "1"),
                factory: factory.into(),
                config,
                dependencies: BTreeMap::new(),
            })
            .unwrap();
    }
    registry.require_governance(ModuleRef::new("budget", "1"));
    registry
}
fn compiled(registry: &ModuleRegistry) -> CompiledAgent {
    compile_agent(serde_json::from_value(json!({"name":"queued","model":{"id":"model","version":"1"},"prompt":{"id":"prompt","version":"1"}})).unwrap(),registry).unwrap()
}
type EchoParts = (
    Arc<Echo>,
    Arc<Mutex<Vec<(String, ModelRequest)>>>,
    Arc<Notify>,
);
fn echo(gate: Option<Arc<Notify>>) -> EchoParts {
    let seen = Arc::new(Mutex::new(Vec::new()));
    let started = Arc::new(Notify::new());
    (
        Arc::new(Echo {
            seen: seen.clone(),
            gate,
            started: started.clone(),
            gated: AtomicBool::new(false),
        }),
        seen,
        started,
    )
}
fn next(compiled: &CompiledAgent, id: &str, run: &str, text: &str) -> MailEnvelope {
    MailEnvelope {
        address: InputAddress::for_run("queued", &RunContext::new("thread", "original")),
        input_id: id.into(),
        input: MailInput::NextTurn {
            run_id: run.into(),
            snapshot: compiled.snapshot.clone(),
            message: message(text),
        },
    }
}

#[tokio::test]
async fn submitted_input_is_durable_pure_immutable_and_replays_completed_outcome() {
    let temp = tempfile::tempdir().unwrap();
    let path = temp.path().join("runtime.db");
    let store = SqliteStore::open(&path).unwrap();
    let (model, seen, _) = echo(None);
    let registry = registry(&store, model, "1", None);
    let compiled = compiled(&registry);
    let submission = JobSubmission::for_agent(&compiled, "thread", "job", message("accepted text"));
    let supervisor = RunSupervisor::new(store.clone());
    let first = supervisor.submit(submission.clone()).await.unwrap();
    assert!(matches!(first.status, JobStatus::Queued));
    assert!(seen.lock().unwrap().is_empty());
    assert_eq!(
        supervisor.submit(submission.clone()).await.unwrap().digest,
        first.digest
    );
    let mut changed = submission;
    changed.input = message("different");
    assert!(supervisor.submit(changed).await.is_err());
    assert!(store.record("job").await.unwrap().is_none());
    assert!(
        supervisor
            .execute(
                &compiled,
                RunInput::new("bypass"),
                RunContext::new("thread", "job")
            )
            .await
            .is_err()
    );
    let reopened = SqliteStore::open(&path).unwrap();
    let worker = RunSupervisor::new(reopened.clone());
    let Some(RunOutcome::Completed { output, state }) =
        worker.execute_submitted(&registry, "job").await.unwrap()
    else {
        panic!("not completed")
    };
    assert_eq!(output, "accepted text");
    assert_eq!(
        state
            .messages
            .iter()
            .filter(|m| matches!(m,Message::User {content} if content=="accepted text"))
            .count(),
        1
    );
    assert!(state.input_progress.initial.is_some());
    assert!(matches!(
        reopened.job("job").await.unwrap().unwrap().status,
        JobStatus::Closed
    ));
    assert!(matches!(
        worker.execute_submitted(&registry, "job").await.unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    assert_eq!(seen.lock().unwrap().len(), 1);
}

#[tokio::test]
async fn queued_turns_keep_fifo_and_survive_active_root_switch_without_rerouting_old_interjections()
{
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let gate = Arc::new(Notify::new());
    let (model, seen, started) = echo(Some(gate.clone()));
    let registry = registry(&store, model, "1", None);
    let compiled = Arc::new(compiled(&registry));
    let original = {
        let compiled = compiled.clone();
        let store = store.clone();
        tokio::spawn(async move {
            RunSupervisor::new(store)
                .execute(
                    &compiled,
                    RunInput::new("original text"),
                    RunContext::new("thread", "original"),
                )
                .await
        })
    };
    tokio::time::timeout(Duration::from_secs(3), started.notified())
        .await
        .unwrap();
    let one = next(&compiled, "next-one", "one", "first queued");
    store.submit(one.clone()).await.unwrap();
    let steer = MailEnvelope {
        address: one.address.clone(),
        input_id: "held".into(),
        input: MailInput::Interject {
            message: message("old recipient only"),
        },
    };
    store.submit(steer).await.unwrap();
    let two = next(&compiled, "next-two", "two", "second queued");
    store.submit(two.clone()).await.unwrap();
    gate.notify_one();
    assert!(matches!(
        original.await.unwrap().unwrap(),
        RunOutcome::Completed { .. }
    ));
    let mut wrong_snapshot = next(
        &compiled,
        "wrong-version",
        "wrong-run",
        "different configuration",
    );
    if let MailInput::NextTurn { snapshot, .. } = &mut wrong_snapshot.input {
        snapshot.agent.settings.max_steps += 1;
    }
    assert!(store.submit(wrong_snapshot.clone()).await.is_err());
    assert!(
        store
            .input_status(&wrong_snapshot.address, "wrong-version")
            .await
            .unwrap()
            .is_none()
    );
    assert!(store.job("wrong-run").await.unwrap().is_none());
    let supervisor = RunSupervisor::new(store.clone());
    assert!(
        supervisor
            .execute_submitted(&registry, "two")
            .await
            .unwrap()
            .is_none()
    );
    for (run, text) in [("one", "first queued"), ("two", "second queued")] {
        let Some(RunOutcome::Completed { output, .. }) = supervisor
            .run_next(&registry, "queued", "thread")
            .await
            .unwrap()
        else {
            panic!("not completed")
        };
        assert_eq!(output, text);
        assert!(matches!(
            store.job(run).await.unwrap().unwrap().status,
            JobStatus::Closed
        ));
    }
    assert_eq!(
        store
            .input_status(&one.address, "next-one")
            .await
            .unwrap()
            .unwrap()
            .status,
        InputStatus::Delivered
    );
    assert_eq!(
        store
            .input_status(&two.address, "next-two")
            .await
            .unwrap()
            .unwrap()
            .status,
        InputStatus::Delivered
    );
    assert_eq!(
        store
            .input_status(&one.address, "held")
            .await
            .unwrap()
            .unwrap()
            .status,
        InputStatus::Rejected
    );
    let seen = seen.lock().unwrap();
    assert_eq!(
        seen.iter().map(|(run, _)| run.as_str()).collect::<Vec<_>>(),
        vec!["original", "one", "two"]
    );
    for (_, request) in seen.iter().skip(1) {
        assert!(!request.messages.iter().any(
            |m| matches!(m,Message::User {content} if content.contains("old recipient only"))
        ));
    }
}

#[tokio::test]
async fn cancelling_queued_turn_unprotects_current_run_interjection_without_discarding_it() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let gate = Arc::new(Notify::new());
    let (model, seen, started) = echo(Some(gate.clone()));
    let registry = registry(&store, model, "1", None);
    let compiled = Arc::new(compiled(&registry));
    let original = {
        let compiled = compiled.clone();
        let store = store.clone();
        tokio::spawn(async move {
            RunSupervisor::new(store)
                .execute(
                    &compiled,
                    RunInput::new("original text"),
                    RunContext::new("thread", "original"),
                )
                .await
        })
    };
    tokio::time::timeout(Duration::from_secs(3), started.notified())
        .await
        .unwrap();
    let queued = next(&compiled, "next", "cancel-me", "unused");
    store.submit(queued.clone()).await.unwrap();
    store
        .submit(MailEnvelope {
            address: queued.address.clone(),
            input_id: "steer".into(),
            input: MailInput::Interject {
                message: message("keep this interjection"),
            },
        })
        .await
        .unwrap();
    let supervisor = RunSupervisor::new(store.clone());
    supervisor.cancel_submitted("cancel-me").await.unwrap();
    supervisor.cancel_submitted("cancel-me").await.unwrap();
    assert_eq!(
        store
            .input_status(&queued.address, "steer")
            .await
            .unwrap()
            .unwrap()
            .status,
        InputStatus::Pending
    );
    gate.notify_one();
    assert!(matches!(
        original.await.unwrap().unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(
        store
            .input_status(&queued.address, "steer")
            .await
            .unwrap()
            .unwrap()
            .status,
        InputStatus::Delivered
    );
    assert_eq!(seen.lock().unwrap().len(), 2);
    assert!(
        supervisor
            .run_next(&registry, "queued", "thread")
            .await
            .unwrap()
            .is_none()
    );
}

#[tokio::test]
async fn failed_factory_restore_never_creates_a_run_or_sends_model_io() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let (model, seen, _) = echo(None);
    let original = registry(&store, model.clone(), "1", None);
    let compiled = compiled(&original);
    let supervisor = RunSupervisor::new(store.clone());
    supervisor
        .submit(JobSubmission::for_agent(
            &compiled,
            "thread",
            "run",
            message("query"),
        ))
        .await
        .unwrap();
    let drifted = registry(&store, model, "2", None);
    assert!(supervisor.execute_submitted(&drifted, "run").await.is_err());
    assert!(seen.lock().unwrap().is_empty());
    assert!(store.record("run").await.unwrap().is_none());
    assert!(matches!(
        store.job("run").await.unwrap().unwrap().status,
        JobStatus::Queued
    ));
}

#[tokio::test]
async fn losing_initial_source_ack_preserves_failed_job_and_input_once() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let (model, seen, _) = echo(None);
    let registry = registry(&store, model, "1", None);
    let compiled = compiled(&registry);
    let supervisor = RunSupervisor::new(store.clone());
    supervisor
        .execute(
            &compiled,
            RunInput::new("old"),
            RunContext::new("thread", "original"),
        )
        .await
        .unwrap();
    let input = next(&compiled, "next", "queued", "new input once");
    store.submit(input.clone()).await.unwrap();
    let fault = rusqlite::Connection::open(store.path().unwrap()).unwrap();
    fault.execute_batch("CREATE TRIGGER fail_job_ack BEFORE UPDATE OF status ON agent_runtime_jobs WHEN NEW.status='running' BEGIN SELECT RAISE(ABORT,'lost initial ack'); END;").unwrap();
    assert!(
        supervisor
            .execute_submitted(&registry, "queued")
            .await
            .is_err()
    );
    assert_eq!(seen.lock().unwrap().len(), 1);
    assert!(matches!(
        store.job("queued").await.unwrap().unwrap().status,
        JobStatus::Failed
    ));
    assert_eq!(
        store
            .input_status(&input.address, "next")
            .await
            .unwrap()
            .unwrap()
            .status,
        InputStatus::Claimed
    );
    fault.execute_batch("DROP TRIGGER fail_job_ack;").unwrap();
    let Some(RunOutcome::Completed { state, .. }) = supervisor
        .execute_submitted(&registry, "queued")
        .await
        .unwrap()
    else {
        panic!("not completed")
    };
    assert_eq!(
        state
            .messages
            .iter()
            .filter(|m| matches!(m,Message::User {content} if content=="new input once"))
            .count(),
        1
    );
    assert_eq!(seen.lock().unwrap().len(), 2);
    assert_eq!(
        store
            .input_status(&input.address, "next")
            .await
            .unwrap()
            .unwrap()
            .status,
        InputStatus::Delivered
    );
}

#[tokio::test]
async fn unfinished_model_cannot_lose_thread_ownership_to_a_new_run() {
    struct Failure(AtomicUsize);
    #[async_trait::async_trait]
    impl Model for Failure {
        async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
            if self.0.fetch_add(1, Ordering::SeqCst) == 0 {
                return Err(model::ModelFailure {
                    category: "auth".into(),
                    message: "401".into(),
                    status: Some(401),
                    retryable: false,
                    retry_after_ms: None,
                    code: None,
                    details: Value::Null,
                }
                .into());
            }
            Ok(ModelResponse {
                output: "recovered".into(),
                ..Default::default()
            })
        }
    }
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let registry = registry(&store, Arc::new(Failure(AtomicUsize::new(0))), "1", None);
    let compiled = compiled(&registry);
    let supervisor = RunSupervisor::new(store.clone());
    assert!(
        supervisor
            .execute(
                &compiled,
                RunInput::new("query"),
                RunContext::new("thread", "failed")
            )
            .await
            .is_err()
    );
    assert!(
        supervisor
            .execute(
                &compiled,
                RunInput::new("must not steal"),
                RunContext::new("thread", "new")
            )
            .await
            .is_err()
    );
    assert!(store.record("new").await.unwrap().is_none());
    let ticket = compiled
        .agent
        .clone()
        .with_checkpointer(Arc::new(store))
        .model_retry_ticket("thread", "failed")
        .await
        .unwrap()
        .unwrap();
    assert!(matches!(
        supervisor
            .execute(
                &compiled,
                RunInput::retry_model(nofy_agent_runtime::governance::ModelRetryCommand {
                    command_id: "retry".into(),
                    ticket
                }),
                RunContext::new("thread", "failed")
            )
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
}

#[tokio::test]
async fn cancel_interrupts_pre_input_catalog_loading_and_closes_only_that_job() {
    struct WaitingCatalog {
        started: Arc<Notify>,
    }
    #[async_trait::async_trait]
    impl ToolSource for WaitingCatalog {
        async fn snapshot(&self, context: &RunContext) -> Result<ToolSnapshot, Error> {
            if context.run_id == "blocked" {
                self.started.notify_one();
                std::future::pending::<()>().await;
            }
            Ok(ToolSnapshot {
                revision: "catalog@1".into(),
                catalog: ToolCatalog::new(),
            })
        }
    }
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let (model, seen, _) = echo(None);
    let mut registry = registry(&store, model, "1", None);
    let started = Arc::new(Notify::new());
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "host.catalog",
            "1",
            ModuleInstance::ToolSource(Arc::new(WaitingCatalog {
                started: started.clone(),
            })),
        )))
        .unwrap();
    registry
        .define(ModuleDefinition {
            reference: ModuleRef::new("catalog", "1"),
            factory: "host.catalog".into(),
            config: json!({}),
            dependencies: BTreeMap::new(),
        })
        .unwrap();
    let compiled=compile_agent(serde_json::from_value(json!({"name":"queued","model":{"id":"model","version":"1"},"prompt":{"id":"prompt","version":"1"},"tool_sources":[{"id":"catalog","version":"1"}]})).unwrap(),&registry).unwrap();
    let supervisor = RunSupervisor::new(store.clone());
    supervisor
        .submit(JobSubmission::for_agent(
            &compiled,
            "thread",
            "blocked",
            message("cancel before initial input"),
        ))
        .await
        .unwrap();
    supervisor
        .submit(JobSubmission::for_agent(
            &compiled,
            "thread",
            "following",
            message("next job"),
        ))
        .await
        .unwrap();
    let registry = Arc::new(registry);
    let worker = {
        let registry = registry.clone();
        let store = store.clone();
        tokio::spawn(async move {
            RunSupervisor::new(store)
                .execute_submitted(&registry, "blocked")
                .await
        })
    };
    tokio::time::timeout(Duration::from_secs(3), started.notified())
        .await
        .unwrap();
    store
        .cancel(
            &InputAddress::for_run("queued", &RunContext::new("thread", "blocked")),
            "cancel-initializing",
        )
        .await
        .unwrap();
    assert!(matches!(
        tokio::time::timeout(Duration::from_secs(3), worker)
            .await
            .unwrap()
            .unwrap()
            .unwrap(),
        Some(RunOutcome::Cancelled { .. })
    ));
    assert!(seen.lock().unwrap().is_empty());
    assert!(matches!(
        store.job("blocked").await.unwrap().unwrap().status,
        JobStatus::Cancelled
    ));
    assert!(matches!(
        supervisor
            .run_next(&registry, "queued", "thread")
            .await
            .unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    assert_eq!(seen.lock().unwrap().len(), 1);
}

#[tokio::test]
async fn failed_initial_input_can_be_cancelled_without_running_the_model() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let (model, seen, _) = echo(None);
    let registry = registry(&store, model, "1", None);
    let compiled = compiled(&registry);
    let supervisor = RunSupervisor::new(store.clone());
    let mut input = message("unsupported image");
    input.attachments.push(InputPart::Image {
        url: "https://example.invalid/image.png".into(),
    });
    supervisor
        .submit(JobSubmission::for_agent(
            &compiled,
            "thread",
            "bad-input",
            input,
        ))
        .await
        .unwrap();
    assert!(
        supervisor
            .execute_submitted(&registry, "bad-input")
            .await
            .is_err()
    );
    assert!(seen.lock().unwrap().is_empty());
    store
        .cancel(
            &InputAddress::for_run("queued", &RunContext::new("thread", "bad-input")),
            "cancel-failed-initialization",
        )
        .await
        .unwrap();
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "bad-input")
            .await
            .unwrap(),
        Some(RunOutcome::Cancelled { .. })
    ));
    assert!(matches!(
        store.job("bad-input").await.unwrap().unwrap().status,
        JobStatus::Cancelled
    ));
    supervisor
        .submit(JobSubmission::for_agent(
            &compiled,
            "thread",
            "next",
            message("valid"),
        ))
        .await
        .unwrap();
    assert!(matches!(
        supervisor
            .run_next(&registry, "queued", "thread")
            .await
            .unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    assert_eq!(seen.lock().unwrap().len(), 1);
}

#[tokio::test]
async fn cancellation_of_unapplied_job_is_not_blocked_by_its_expired_budget() {
    struct WaitingPrompt;
    #[async_trait::async_trait]
    impl Prompt for WaitingPrompt {
        async fn render(&self, _: &RunContext, _: &[String]) -> Result<String, Error> {
            std::future::pending().await
        }
    }
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let (model, seen, _) = echo(None);
    let mut registry = registry(&store, model, "1", Some(Arc::new(WaitingPrompt)));
    registry
        .define(ModuleDefinition {
            reference: ModuleRef::new("deadline", "1"),
            factory: "governance.budget".into(),
            config: json!({"resource":"root","limits":{"max_duration_ms":1}}),
            dependencies: BTreeMap::new(),
        })
        .unwrap();
    registry.require_governance(ModuleRef::new("deadline", "1"));
    let compiled = compiled(&registry);
    let supervisor = RunSupervisor::new(store.clone());
    supervisor
        .submit(JobSubmission::for_agent(
            &compiled,
            "thread",
            "expired",
            message("not applied"),
        ))
        .await
        .unwrap();
    assert!(matches!(
        tokio::time::timeout(
            Duration::from_secs(3),
            supervisor.execute_submitted(&registry, "expired")
        )
        .await
        .unwrap()
        .unwrap(),
        Some(RunOutcome::BudgetExceeded { .. })
    ));
    store
        .cancel(
            &InputAddress::for_run("queued", &RunContext::new("thread", "expired")),
            "cancel-expired-initialization",
        )
        .await
        .unwrap();
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "expired")
            .await
            .unwrap(),
        Some(RunOutcome::Cancelled { .. })
    ));
    assert!(seen.lock().unwrap().is_empty());
}

#[tokio::test]
async fn paused_preceding_run_cannot_be_skipped_even_without_an_unpaired_tool() {
    use nofy_agent_runtime::hooks::*;
    struct StopGate;
    #[async_trait::async_trait]
    impl HookHandler for StopGate {
        async fn handle(&self, _: &HookEvent, _: &RunContext) -> Result<HookDecision, Error> {
            Ok(HookDecision::Pause {
                reason: json!({"human":true}),
            })
        }
    }
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let (model, seen, _) = echo(None);
    let mut registry = registry(&store, model, "1", None);
    let hook = Arc::new(
        HookRegistration::new(
            "human@1".into(),
            EventCatalog::runtime().get("before_stop").unwrap().clone(),
            HookRule {
                event: "before_stop".into(),
                priority: 0,
                timeout_ms: 1000,
                failure: FailurePolicy::Closed,
                matches: None,
            },
            Arc::new(StopGate),
        )
        .unwrap(),
    );
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "host.hook",
            "1",
            ModuleInstance::Hook(hook),
        )))
        .unwrap();
    registry
        .define(ModuleDefinition {
            reference: ModuleRef::new("hook", "1"),
            factory: "host.hook".into(),
            config: json!({}),
            dependencies: BTreeMap::new(),
        })
        .unwrap();
    let compiled=compile_agent(serde_json::from_value(json!({"name":"queued","model":{"id":"model","version":"1"},"prompt":{"id":"prompt","version":"1"},"hooks":[{"id":"hook","version":"1"}]})).unwrap(),&registry).unwrap();
    let supervisor = RunSupervisor::new(store.clone());
    let RunOutcome::Paused { state, .. } = supervisor
        .execute(
            &compiled,
            RunInput::new("original"),
            RunContext::new("thread", "original"),
        )
        .await
        .unwrap()
    else {
        panic!("not paused")
    };
    assert!(state.pending_tools.is_empty() && state.in_flight.is_none());
    assert!(state.complete && !state.hook_progress.stop_done);
    assert!(state.has_pending_work());
    store
        .submit(next(&compiled, "queued", "next", "cannot skip human gate"))
        .await
        .unwrap();
    assert!(
        supervisor
            .execute_submitted(&registry, "next")
            .await
            .unwrap()
            .is_none()
    );
    assert_eq!(seen.lock().unwrap().len(), 1);
    assert!(store.record("next").await.unwrap().is_none());
    assert!(matches!(
        store.job("next").await.unwrap().unwrap().status,
        JobStatus::Queued
    ));
}

struct ManualClock(AtomicU64);
impl Clock for ManualClock {
    fn now_ms(&self) -> u64 {
        self.0.load(Ordering::SeqCst)
    }
}
#[tokio::test]
async fn job_process_worker() {
    let Ok(directory) = std::env::var("NOFY_JOB_WORKER") else {
        return;
    };
    let phase = std::env::var("NOFY_JOB_PHASE").unwrap();
    let directory = Path::new(&directory);
    struct DiskModel(std::path::PathBuf);
    #[async_trait::async_trait]
    impl Model for DiskModel {
        async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
            use std::io::Write;
            writeln!(
                std::fs::OpenOptions::new()
                    .create(true)
                    .append(true)
                    .open(&self.0)
                    .unwrap(),
                "call"
            )
            .unwrap();
            Ok(ModelResponse {
                output: "done".into(),
                ..Default::default()
            })
        }
    }
    struct ExitPrompt(bool);
    #[async_trait::async_trait]
    impl Prompt for ExitPrompt {
        async fn render(&self, _: &RunContext, _: &[String]) -> Result<String, Error> {
            if self.0 {
                std::process::exit(93)
            }
            Ok("system".into())
        }
    }
    let store = SqliteStore::open_with_clock(
        &directory.join("runtime.db"),
        Arc::new(ManualClock(AtomicU64::new(if phase == "crash" {
            1000
        } else {
            2000
        }))),
    )
    .unwrap();
    let registry = registry(
        &store,
        Arc::new(DiskModel(directory.join("models.log"))),
        "1",
        Some(Arc::new(ExitPrompt(phase == "crash"))),
    );
    let compiled = compiled(&registry);
    let supervisor = RunSupervisor::new(store.clone())
        .with_lease_ttl(Duration::from_millis(100))
        .unwrap();
    if phase == "crash" {
        supervisor
            .submit(JobSubmission::for_agent(
                &compiled,
                "thread",
                "job",
                message("one initial input"),
            ))
            .await
            .unwrap();
    }
    let Some(RunOutcome::Completed { state, .. }) = supervisor
        .execute_submitted(&registry, "job")
        .await
        .unwrap()
    else {
        panic!("not completed")
    };
    assert_eq!(
        state
            .messages
            .iter()
            .filter(|m| matches!(m,Message::User {content} if content=="one initial input"))
            .count(),
        1
    );
}
#[test]
fn restart_between_run_record_and_initial_checkpoint_never_duplicates_user_input() {
    let temp = tempfile::tempdir().unwrap();
    for (phase, code) in [("crash", 93), ("recover", 0)] {
        let result = std::process::Command::new(std::env::current_exe().unwrap())
            .args(["--exact", "job_process_worker", "--nocapture"])
            .env("NOFY_JOB_WORKER", temp.path())
            .env("NOFY_JOB_PHASE", phase)
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
        1
    );
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn lease_loss_cancels_and_waits_for_bounded_async_cleanup_before_returning_error() {
    use nofy_agent_runtime::tasks::declarative::*;
    use nofy_tool_protocol::ToolId;
    use nofy_tool_runtime::{ToolCallContext, ToolDispatch, ToolStream, TypedToolOutput};
    use nofy_tool_types::ToolDefinition;

    struct ParentSpawner {
        parent_waiting: Arc<Notify>,
    }
    #[async_trait::async_trait]
    impl Model for ParentSpawner {
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
                return Ok(ModelResponse {
                    tool_calls: vec![ToolCall {
                        id: "spawn-bg".into(),
                        name: "agent_tasks".into(),
                        arguments: json!({
                            "action": "spawn",
                            "task_id": "bg-worker",
                            "tool": "bg_driver",
                            "arguments": {}
                        }),
                    }],
                    ..Default::default()
                });
            }
            self.parent_waiting.notify_one();
            std::future::pending().await
        }
    }
    struct BgCleanupDispatch {
        child_started: Arc<Notify>,
        cleanup_finished: Arc<AtomicBool>,
    }
    #[async_trait::async_trait]
    impl ToolDispatch for BgCleanupDispatch {
        fn is_resumable(&self) -> bool {
            true
        }
        fn recovery_identity(&self) -> Option<String> {
            Some("test.bg_cleanup/v1".into())
        }
        async fn call(
            &self,
            id: ToolId,
            _: Value,
            _: ToolCallContext,
        ) -> ToolStream<TypedToolOutput> {
            struct BlockingCleanupGuard(Arc<AtomicBool>);
            impl Drop for BlockingCleanupGuard {
                fn drop(&mut self) {
                    // Simulate cleanup work awaited by tasks::Owner::shutdown().
                    std::thread::sleep(Duration::from_millis(80));
                    self.0.store(true, Ordering::SeqCst);
                }
            }
            let _guard = BlockingCleanupGuard(self.cleanup_finished.clone());
            self.child_started.notify_one();
            std::future::pending::<()>().await;
            nofy_tool_runtime::terminal_only(Ok(TypedToolOutput::from_value(id, json!({}))))
        }
    }

    let temp = tempfile::tempdir().unwrap();
    let clock = Arc::new(ManualClock(AtomicU64::new(1000)));
    let store =
        SqliteStore::open_with_clock(&temp.path().join("runtime.db"), clock.clone()).unwrap();
    let parent_waiting = Arc::new(Notify::new());
    let child_started = Arc::new(Notify::new());
    let cleanup_finished = Arc::new(AtomicBool::new(false));

    let mut reg = ModuleRegistry::default();
    reg.register_factory(Arc::new(InstanceFactory::new(
        "host.parent_model",
        "1",
        ModuleInstance::Model(Arc::new(ParentSpawner {
            parent_waiting: parent_waiting.clone(),
        })),
    )))
    .unwrap();
    reg.register_factory(Arc::new(InstanceFactory::new(
        "host.prompt",
        "1",
        ModuleInstance::Prompt(Arc::new(StaticPrompt("system".into()))),
    )))
    .unwrap();
    for (id, factory, config) in [
        ("parent_model", "host.parent_model", json!({})),
        ("prompt", "host.prompt", json!({})),
    ] {
        reg.define(ModuleDefinition {
            reference: ModuleRef::new(id, "1"),
            factory: factory.into(),
            config,
            dependencies: BTreeMap::new(),
        })
        .unwrap();
    }
    let mut drivers = ToolCatalog::new();
    drivers
        .insert(ToolEntry {
            definition: ToolDefinition::function(
                "bg_driver",
                Some("Background cleanup test driver"),
                json!({"type": "object"}),
            ),
            dispatch: Arc::new(BgCleanupDispatch {
                child_started: child_started.clone(),
                cleanup_finished: cleanup_finished.clone(),
            }),
        })
        .unwrap();
    let resource = TasksResourceFactory
        .build(
            &json!({}),
            &BTreeMap::from([("children".into(), ModuleInstance::ToolPack(drivers))]),
        )
        .unwrap();
    let deps = BTreeMap::from([("tasks".into(), resource)]);
    for (id, instance) in [
        ("tasks", TasksToolFactory.build(&json!({}), &deps).unwrap()),
        (
            "binding",
            TasksBindingFactory.build(&json!({}), &deps).unwrap(),
        ),
    ] {
        reg.register_factory(Arc::new(InstanceFactory::new(id, "1", instance)))
            .unwrap();
        reg.define(ModuleDefinition {
            reference: ModuleRef::new(id, "1"),
            factory: id.into(),
            config: json!({}),
            dependencies: BTreeMap::new(),
        })
        .unwrap();
    }
    let compiled = compile_agent(
        serde_json::from_value(json!({
            "name": "parent",
            "model": {"id": "parent_model", "version": "1"},
            "prompt": {"id": "prompt", "version": "1"},
            "tool_packs": [{"id": "tasks", "version": "1"}],
            "bindings": [{"id": "binding", "version": "1"}]
        }))
        .unwrap(),
        &reg,
    )
    .unwrap();

    let supervisor = RunSupervisor::new(store.clone())
        .with_lease_ttl(Duration::from_millis(90))
        .unwrap();
    let worker = tokio::spawn(async move {
        supervisor
            .execute(
                &compiled,
                RunInput::new("hold-until-lease-lost"),
                RunContext::new("thread", "lease-drain"),
            )
            .await
    });

    tokio::time::timeout(Duration::from_secs(3), async {
        tokio::join!(child_started.notified(), parent_waiting.notified());
    })
    .await
    .unwrap();

    // Advance the manual clock past the lease TTL so the next renewal sees true lease loss.
    clock.0.store(5000, Ordering::SeqCst);

    let outcome = tokio::time::timeout(Duration::from_secs(3), worker)
        .await
        .unwrap()
        .unwrap();
    assert!(
        matches!(outcome, Err(Error::Checkpoint(ref msg)) if msg.contains("lease fence lost or expired")),
        "expected lease loss error, got {outcome:?}"
    );
    assert!(
        cleanup_finished.load(Ordering::SeqCst),
        "supervisor must wait for tasks::Owner::shutdown() cleanup before returning lease loss error"
    );
    // Run receipt must remain unfinalized ('running'), never misclassified as user-cancelled.
    assert_eq!(
        store
            .execution_record("lease-drain")
            .await
            .unwrap()
            .unwrap()
            .status,
        "running"
    );
}

#[tokio::test]
async fn managed_action_renews_lease_continuously_without_expiring_across_ttl() {
    struct SlowResumeModel {
        calls: Arc<AtomicUsize>,
        started: Arc<Notify>,
        release: Arc<Notify>,
    }
    #[async_trait::async_trait]
    impl Model for SlowResumeModel {
        async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
            let n = self.calls.fetch_add(1, Ordering::SeqCst);
            if n == 0 {
                return Err(model::ModelFailure {
                    category: "transient".into(),
                    message: "fail-once".into(),
                    status: Some(503),
                    retryable: false,
                    retry_after_ms: None,
                    code: None,
                    details: Value::Null,
                }
                .into());
            }
            self.started.notify_one();
            self.release.notified().await;
            Ok(ModelResponse {
                output: "renewed-ok".into(),
                ..Default::default()
            })
        }
    }

    use nofy_agent_runtime::system::*;
    let temp = tempfile::tempdir().unwrap();
    let clock = Arc::new(ManualClock(AtomicU64::new(1000)));
    let store =
        SqliteStore::open_with_clock(&temp.path().join("runtime.db"), clock.clone()).unwrap();
    let started = Arc::new(Notify::new());
    let release = Arc::new(Notify::new());
    let calls = Arc::new(AtomicUsize::new(0));
    let mut reg = ModuleRegistry::default();
    reg.register_factory(Arc::new(InstanceFactory::new(
        "host.model",
        "1",
        ModuleInstance::Model(Arc::new(SlowResumeModel {
            calls,
            started: started.clone(),
            release: release.clone(),
        })),
    )))
    .unwrap();
    reg.register_factory(Arc::new(InstanceFactory::new(
        "host.prompt",
        "1",
        ModuleInstance::Prompt(Arc::new(StaticPrompt("system".into()))),
    )))
    .unwrap();
    reg.register_factory(Arc::new(
        GovernanceFactory::new(BTreeMap::from([(
            "root".into(),
            Arc::new(
                InstalledBudget::install(
                    Arc::new(store.clone()),
                    BudgetLimits {
                        max_model_calls: Some(10),
                        ..Default::default()
                    },
                    "host@1",
                    1,
                )
                .unwrap(),
            ),
        )]))
        .unwrap(),
    ))
    .unwrap();
    let doc: SystemDocument = serde_json::from_value(json!({
        "schema_version": 1,
        "name": "renew-sys",
        "modules": [
            {"reference": {"id": "model", "version": "1"}, "factory": "host.model", "config": {}},
            {"reference": {"id": "prompt", "version": "1"}, "factory": "host.prompt", "config": {}},
            {"reference": {"id": "budget", "version": "1"}, "factory": "governance.budget", "config": {"resource": "root"}}
        ],
        "programs": {
            "chat": {
                "kind": "agent",
                "definition": {
                    "name": "renew-agent",
                    "model": {"id": "model", "version": "1"},
                    "prompt": {"id": "prompt", "version": "1"},
                    "governance": [{"id": "budget", "version": "1"}]
                }
            }
        }
    }))
    .unwrap();
    let system = compile_system(doc, &reg).unwrap();
    let supervisor = RunSupervisor::new(store.clone())
        .with_lease_ttl(Duration::from_millis(120))
        .unwrap();
    supervisor
        .submit_managed(
            ManagedRunRequest {
                approval_mode: None,
                run_id: "renew-run".into(),
                thread_id: "thread".into(),
                system: "renew-sys".into(),
                release: system.bundle.digest.clone(),
                program: "chat".into(),
                input: Some(message("hello")),
                parameters: None,
            },
            &system,
        )
        .await
        .unwrap();
    assert!(
        supervisor
            .execute_submitted(&reg, "renew-run")
            .await
            .is_err()
    );

    let ticket = supervisor
        .root_model_retry_ticket("renew-run")
        .await
        .unwrap()
        .unwrap();
    store
        .enqueue_managed_action(ManagedAction {
            command_id: "retry-renew".into(),
            run_id: "renew-run".into(),
            command: ManagedCommand::Control {
                control: nofy_agent_runtime::supervisor::RunControlCommand::RetryModel(
                    nofy_agent_runtime::governance::ModelRetryCommand {
                        command_id: "retry-renew".into(),
                        ticket,
                    },
                ),
            },
        })
        .await
        .unwrap();

    let worker = {
        let store = store.clone();
        let reg = reg.clone();
        tokio::spawn(async move {
            RunSupervisor::new(store)
                .with_lease_ttl(Duration::from_millis(120))
                .unwrap()
                .execute_managed_action(&reg, "retry-renew")
                .await
        })
    };

    tokio::time::timeout(Duration::from_secs(3), started.notified())
        .await
        .unwrap();
    // Advance clock well past the original 120ms TTL in small increments; continuous
    // renewal keeps the lease alive across the entire managed action lifecycle.
    for _ in 0..8 {
        clock.0.fetch_add(30, Ordering::SeqCst);
        tokio::time::sleep(Duration::from_millis(45)).await;
    }
    release.notify_one();

    let receipt = tokio::time::timeout(Duration::from_secs(3), worker)
        .await
        .unwrap()
        .unwrap()
        .unwrap();
    assert!(receipt.finished && receipt.error.is_none(), "{receipt:?}");
    assert!(matches!(
        receipt.outcome,
        Some(RunOutcome::Completed { ref output, .. }) if output == "renewed-ok"
    ));
}

#[tokio::test]
async fn work_command_and_work_owner_capacities_prune_terminal_history_without_touching_active() {
    use nofy_agent_runtime::supervisor::{WorkAction, WorkCommand};

    let dir = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&dir.path().join("work-gc.sqlite")).unwrap();
    let physical = store.path().unwrap();
    let (model, _, _) = echo(None);
    let reg = registry(&store, model, "1", None);
    let document: nofy_agent_runtime::system::SystemDocument = serde_json::from_value(json!({
        "schema_version": 1,
        "name": "work-gc-sys",
        "modules": [
            {"reference": {"id": "model", "version": "1"}, "factory": "host.model", "config": {}},
            {"reference": {"id": "prompt", "version": "1"}, "factory": "host.prompt", "config": {}},
            {"reference": {"id": "budget", "version": "1"}, "factory": "governance.budget", "config": {"resource": "root"}}
        ],
        "programs": {
            "worker": {
                "kind": "agent",
                "definition": {
                    "name": "worker-agent",
                    "model": {"id": "model", "version": "1"},
                    "prompt": {"id": "prompt", "version": "1"}
                }
            }
        }
    }))
    .unwrap();
    let system = nofy_agent_runtime::system::compile_system(document, &reg).unwrap();
    let supervisor = RunSupervisor::new(store.clone());

    // Submit a queued managed run for work_commands testing.
    supervisor
        .submit_managed(
            ManagedRunRequest {
                approval_mode: None,
                run_id: "cmd-target".into(),
                thread_id: "cmd-thread".into(),
                system: "work-gc-sys".into(),
                release: system.bundle.digest.clone(),
                program: "worker".into(),
                input: Some(message("hello")),
                parameters: None,
            },
            &system,
        )
        .await
        .unwrap();

    // Seed 1,024 pending work commands (backed by unsettled managed actions) -> must reject.
    {
        let raw = rusqlite::Connection::open(&physical).unwrap();
        raw.busy_timeout(Duration::from_secs(5)).unwrap();
        let tx = raw.unchecked_transaction().unwrap();
        {
            let mut act_stmt = tx
                .prepare(
                    "INSERT INTO agent_runtime_managed_actions(command_id, run_id, digest, payload, result)
                     VALUES(?1, 'cmd-target', 'd', '{}', NULL)",
                )
                .unwrap();
            let mut cmd_stmt = tx
                .prepare(
                    "INSERT INTO agent_runtime_work_commands(scope, command_id, digest, receipt)
                     VALUES('scope-a', ?1, 'd', ?2)",
                )
                .unwrap();
            for i in 0..1_024u64 {
                let act_id = format!("work-act-{i:04}");
                let cmd_id = format!("work-cmd-{i:04}");
                let receipt = json!({
                    "work_id": "cmd-target",
                    "run_id": "cmd-target",
                    "command_id": &cmd_id,
                    "phase": "accepted",
                    "cancellation_cursor": null,
                    "action_id": &act_id
                })
                .to_string();
                act_stmt.execute([&act_id]).unwrap();
                cmd_stmt
                    .execute(rusqlite::params![&cmd_id, &receipt])
                    .unwrap();
            }
        }
        tx.commit().unwrap();
    }

    let revision = store
        .work_list("cmd-target", None, 16)
        .await
        .unwrap()
        .unwrap()
        .root
        .revision;
    let err = store
        .control_work(
            "scope-a",
            "cmd-target",
            WorkCommand {
                work_id: "cmd-target".into(),
                command_id: "blocked-cmd".into(),
                expected_revision: revision,
                action: WorkAction::Cancel,
            },
            None,
        )
        .await
        .unwrap_err();
    assert!(
        err.to_string().contains("work command capacity exceeded"),
        "expected capacity error when all work commands are pending, got: {err}"
    );

    // Keep oldest 5 actions pending and settle actions 5..205 -> control_work must prune completed batch and succeed.
    {
        let raw = rusqlite::Connection::open(&physical).unwrap();
        raw.busy_timeout(Duration::from_secs(5)).unwrap();
        raw.execute(
            "UPDATE agent_runtime_managed_actions
             SET result = '{\"outcome\":null,\"error\":null}'
             WHERE command_id >= 'work-act-0005' AND command_id < 'work-act-0205'",
            [],
        )
        .unwrap();
    }

    let revision = store
        .work_list("cmd-target", None, 16)
        .await
        .unwrap()
        .unwrap()
        .root
        .revision;
    let receipt = store
        .control_work(
            "scope-a",
            "cmd-target",
            WorkCommand {
                work_id: "cmd-target".into(),
                command_id: "admitted-cmd".into(),
                expected_revision: revision,
                action: WorkAction::Cancel,
            },
            None,
        )
        .await
        .unwrap();
    assert_eq!(receipt["phase"], "settled");

    {
        let raw = rusqlite::Connection::open(&physical).unwrap();
        raw.busy_timeout(Duration::from_secs(5)).unwrap();
        let pending_zero_kept: bool = raw
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM agent_runtime_work_commands WHERE scope='scope-a' AND command_id='work-cmd-0000')",
                [],
                |r| r.get(0),
            )
            .unwrap();
        assert!(
            pending_zero_kept,
            "oldest pending work command must be preserved"
        );
        let completed_five_pruned: bool = raw
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM agent_runtime_work_commands WHERE scope='scope-a' AND command_id='work-cmd-0005')",
                [],
                |r| r.get(0),
            )
            .unwrap();
        assert!(
            !completed_five_pruned,
            "oldest completed work command must be pruned"
        );
    }

    // Now test agent_runtime_work_owners per-session pruning (capacity 64) + active limit 4.
    supervisor
        .submit_managed(
            ManagedRunRequest {
                approval_mode: None,
                run_id: "origin-run".into(),
                thread_id: "origin-thread".into(),
                system: "work-gc-sys".into(),
                release: system.bundle.digest.clone(),
                program: "worker".into(),
                input: Some(message("origin")),
                parameters: None,
            },
            &system,
        )
        .await
        .unwrap();
    supervisor
        .execute_submitted(&reg, "origin-run")
        .await
        .unwrap();
    supervisor
        .create_session(SessionRequest {
            id: "sess-gc".into(),
            root_run_id: "origin-run".into(),
        })
        .await
        .unwrap();

    // Seed 64 settled (closed) background work owners for sess-gc.
    {
        let raw = rusqlite::Connection::open(&physical).unwrap();
        raw.busy_timeout(Duration::from_secs(5)).unwrap();
        let tx = raw.unchecked_transaction().unwrap();
        {
            let mut job_stmt = tx
                .prepare(
                    "INSERT INTO agent_runtime_jobs(run_id, thread_key, digest, payload, status)
                     VALUES(?1, ?2, 'd', '{}', 'closed')",
                )
                .unwrap();
            let mut owner_stmt = tx
                .prepare(
                    "INSERT INTO agent_runtime_work_owners(work_id, run_id, session_id, origin_run_id, command_id, request_digest, kind)
                     VALUES(?1, ?2, 'sess-gc', 'origin-run', ?3, 'd', 'agent')",
                )
                .unwrap();
            for i in 0..64u64 {
                let work_id = format!("work-old-{i:03}");
                let run_id = format!("work-run-old-{i:03}");
                let cmd_id = format!("bg-cmd-{i:03}");
                job_stmt
                    .execute(rusqlite::params![&run_id, &run_id])
                    .unwrap();
                owner_stmt
                    .execute(rusqlite::params![&work_id, &run_id, &cmd_id])
                    .unwrap();
            }
        }
        tx.commit().unwrap();
    }

    // Starting background work #65 must prune oldest 16 terminal work owners and succeed.
    let admitted = supervisor
        .start_work(
            "sess-gc",
            "origin-run",
            "bg-fresh-1",
            ManagedRunRequest {
                approval_mode: None,
                run_id: "ignored".into(),
                thread_id: "ignored".into(),
                system: "work-gc-sys".into(),
                release: system.bundle.digest.clone(),
                program: "worker".into(),
                input: Some(message("bg-1")),
                parameters: None,
            },
            &system,
            None,
            0,
        )
        .await
        .unwrap();
    assert_eq!(admitted.session_id, "sess-gc");

    {
        let raw = rusqlite::Connection::open(&physical).unwrap();
        raw.busy_timeout(Duration::from_secs(5)).unwrap();
        let count: u64 = raw
            .query_row(
                "SELECT COUNT(*) FROM agent_runtime_work_owners WHERE session_id='sess-gc'",
                [],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(count, 64 - 16 + 1);
        let oldest_exists: bool = raw
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM agent_runtime_work_owners WHERE work_id='work-old-000')",
                [],
                |r| r.get(0),
            )
            .unwrap();
        assert!(!oldest_exists, "oldest terminal work owner must be pruned");
    }

    // Active concurrency cap (4 unsettled background runs) must remain strictly enforced.
    for i in 2..=4u64 {
        supervisor
            .start_work(
                "sess-gc",
                "origin-run",
                &format!("bg-fresh-{i}"),
                ManagedRunRequest {
                    approval_mode: None,
                    run_id: "ignored".into(),
                    thread_id: "ignored".into(),
                    system: "work-gc-sys".into(),
                    release: system.bundle.digest.clone(),
                    program: "worker".into(),
                    input: Some(message("bg")),
                    parameters: None,
                },
                &system,
                None,
                0,
            )
            .await
            .unwrap();
    }
    let active_err = supervisor
        .start_work(
            "sess-gc",
            "origin-run",
            "bg-fresh-5",
            ManagedRunRequest {
                approval_mode: None,
                run_id: "ignored".into(),
                thread_id: "ignored".into(),
                system: "work-gc-sys".into(),
                release: system.bundle.digest.clone(),
                program: "worker".into(),
                input: Some(message("bg-5")),
                parameters: None,
            },
            &system,
            None,
            0,
        )
        .await
        .err()
        .expect("5th active background run must fail");
    assert!(
        active_err
            .to_string()
            .contains("four unsettled background runs"),
        "expected active background cap error, got: {active_err}"
    );

    // A session with 64 non-terminal work owners cannot prune any of them and must fail closed at capacity.
    supervisor
        .submit_managed(
            ManagedRunRequest {
                approval_mode: None,
                run_id: "origin-full".into(),
                thread_id: "origin-full-thread".into(),
                system: "work-gc-sys".into(),
                release: system.bundle.digest.clone(),
                program: "worker".into(),
                input: Some(message("origin-full")),
                parameters: None,
            },
            &system,
        )
        .await
        .unwrap();
    supervisor
        .execute_submitted(&reg, "origin-full")
        .await
        .unwrap();
    supervisor
        .create_session(SessionRequest {
            id: "sess-all-active".into(),
            root_run_id: "origin-full".into(),
        })
        .await
        .unwrap();
    {
        let raw = rusqlite::Connection::open(&physical).unwrap();
        raw.busy_timeout(Duration::from_secs(5)).unwrap();
        let tx = raw.unchecked_transaction().unwrap();
        {
            let mut job_stmt = tx
                .prepare(
                    "INSERT INTO agent_runtime_jobs(run_id, thread_key, digest, payload, status)
                     VALUES(?1, ?2, 'd', '{}', 'queued')",
                )
                .unwrap();
            let mut owner_stmt = tx
                .prepare(
                    "INSERT INTO agent_runtime_work_owners(work_id, run_id, session_id, origin_run_id, command_id, request_digest, kind)
                     VALUES(?1, ?2, 'sess-all-active', 'origin-full', ?3, 'd', 'agent')",
                )
                .unwrap();
            for i in 0..64u64 {
                let work_id = format!("work-active-{i:03}");
                let run_id = format!("work-run-active-{i:03}");
                let cmd_id = format!("bg-active-{i:03}");
                job_stmt
                    .execute(rusqlite::params![&run_id, &run_id])
                    .unwrap();
                owner_stmt
                    .execute(rusqlite::params![&work_id, &run_id, &cmd_id])
                    .unwrap();
            }
        }
        tx.commit().unwrap();
    }
    let owner_cap_err = supervisor
        .start_work(
            "sess-all-active",
            "origin-full",
            "bg-active-65",
            ManagedRunRequest {
                approval_mode: None,
                run_id: "ignored".into(),
                thread_id: "ignored".into(),
                system: "work-gc-sys".into(),
                release: system.bundle.digest.clone(),
                program: "worker".into(),
                input: Some(message("bg-65")),
                parameters: None,
            },
            &system,
            None,
            0,
        )
        .await
        .err()
        .expect("65th active background owner must fail");
    assert!(
        owner_cap_err
            .to_string()
            .contains("background work capacity or run identity conflict"),
        "expected work owner capacity error when all owners are active, got: {owner_cap_err}"
    );
}
