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
use nofy_interjection_core::PendingInterjection;
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
fn echo(
    gate: Option<Arc<Notify>>,
) -> (
    Arc<Echo>,
    Arc<Mutex<Vec<(String, ModelRequest)>>>,
    Arc<Notify>,
) {
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
async fn losing_initial_source_ack_keeps_job_waiting_and_never_repeats_initial_input() {
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
        JobStatus::Waiting
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
