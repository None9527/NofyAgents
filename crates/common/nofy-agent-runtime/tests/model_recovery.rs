use nofy_agent_runtime::{context_policy::*, governance::*, hooks::*, *};
use serde_json::{Value, json};
use std::sync::{
    Arc, Mutex,
    atomic::{AtomicBool, AtomicUsize, Ordering},
};

struct FailingModel {
    calls: Arc<AtomicUsize>,
    failures: usize,
    wait: Option<Arc<tokio::sync::Notify>>,
}
#[async_trait::async_trait]
impl Model for FailingModel {
    async fn request_bound(
        &self,
        _: &ModelRequest,
        _: &RunContext,
    ) -> Result<model::ModelRequestBound, Error> {
        Ok(model::ModelRequestBound {
            max_calls: 1,
            max_input_tokens: Some(10),
            max_output_tokens: Some(5),
        })
    }
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        let call = self.calls.fetch_add(1, Ordering::SeqCst);
        if let Some(wait) = &self.wait {
            wait.notify_one();
            std::future::pending::<()>().await;
        }
        if call < self.failures {
            return Err(model::ModelFailure {
                category: "auth".into(),
                message: format!("rejected-{call}"),
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
            input_tokens: 3,
            output_tokens: 2,
            ..Default::default()
        })
    }
}
struct Final;
#[async_trait::async_trait]
impl Model for Final {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        Ok(ModelResponse {
            output: "final".into(),
            ..Default::default()
        })
    }
}
fn model(calls: &Arc<AtomicUsize>, failures: usize) -> Arc<dyn Model> {
    Arc::new(FailingModel {
        calls: calls.clone(),
        failures,
        wait: None,
    })
}
fn build(model: Arc<dyn Model>) -> Agent {
    let mut components = Components::default();
    components.models.insert("m".into(), model);
    components
        .prompts
        .insert("p".into(), Arc::new(StaticPrompt("system".into())));
    AgentBuilder::new("recovery")
        .model("m")
        .prompt("p")
        .compile(&components)
        .unwrap()
}
fn profile(store: Arc<dyn BudgetStore>, max: u64) -> Arc<GovernanceProfile> {
    Arc::new(
        GovernanceProfile::new(
            Arc::new(
                InstalledBudget::install(
                    store,
                    BudgetLimits {
                        max_model_calls: Some(max),
                        ..Default::default()
                    },
                    "recovery@1",
                    1,
                )
                .unwrap(),
            ),
            BudgetLimits::default(),
            ModelRetryPolicy::default(),
        )
        .unwrap(),
    )
}
fn context() -> RunContext {
    RunContext::new("thread", "run")
}
async fn command(agent: &Agent, id: &str) -> ModelRetryCommand {
    ModelRetryCommand {
        command_id: id.into(),
        ticket: agent
            .model_retry_ticket("thread", "run")
            .await
            .unwrap()
            .unwrap(),
    }
}
async fn summary(store: &dyn BudgetStore, profile: &GovernanceProfile) -> BudgetSummary {
    store
        .inspect(&BudgetScope {
            root_run_id: "run".into(),
            identity: profile.identity().into(),
        })
        .await
        .unwrap()
        .unwrap()
}
struct Observe(Arc<Mutex<Vec<HookEvent>>>);
#[async_trait::async_trait]
impl HookHandler for Observe {
    async fn handle(&self, event: &HookEvent, _: &RunContext) -> Result<HookDecision, Error> {
        self.0.lock().unwrap().push(event.clone());
        Ok(HookDecision::Continue)
    }
}
fn hook(events: &Arc<Mutex<Vec<HookEvent>>>) -> HookBus {
    let name = "turn_error";
    HookBus::new(
        EventCatalog::runtime(),
        vec![Arc::new(
            HookRegistration::new(
                "errors@1".into(),
                EventCatalog::runtime().get(name).unwrap().clone(),
                HookRule {
                    event: name.into(),
                    priority: 0,
                    timeout_ms: 1000,
                    failure: FailurePolicy::Closed,
                    matches: None,
                },
                Arc::new(Observe(events.clone())),
            )
            .unwrap(),
        )],
    )
    .unwrap()
}

#[tokio::test]
async fn settled_failure_requires_exact_explicit_idempotent_command_and_keeps_costs() {
    let checkpoint = Arc::new(InMemoryCheckpointer::default());
    let ledger = Arc::new(InMemoryBudgetStore::default());
    let p = profile(ledger.clone(), 3);
    let calls = Arc::new(AtomicUsize::new(0));
    let events = Arc::new(Mutex::new(Vec::new()));
    let agent = build(model(&calls, 2))
        .with_checkpointer(checkpoint)
        .with_governance(p.clone())
        .with_hooks(hook(&events));
    assert!(matches!(
        agent.invoke(RunInput::new("query"), context()).await,
        Err(Error::ModelFailure(_))
    ));
    let first = command(&agent, "click-1").await;
    assert_eq!(first.ticket.generation, 0);
    assert!(
        agent
            .invoke(RunInput::new("another"), context())
            .await
            .is_err()
    );
    assert!(matches!(
        agent.invoke(RunInput::resume(), context()).await,
        Err(Error::ModelFailure(_))
    ));
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    assert!(
        agent
            .invoke(
                RunInput::retry_model(first.clone()),
                RunContext::new("thread", "wrong")
            )
            .await
            .is_err()
    );
    let mut wrong = first.clone();
    wrong.ticket.request_fingerprint = "forged".into();
    assert!(
        agent
            .invoke(RunInput::retry_model(wrong), context())
            .await
            .is_err()
    );
    assert!(matches!(
        agent
            .invoke(RunInput::retry_model(first.clone()), context())
            .await,
        Err(Error::ModelFailure(_))
    ));
    let second = command(&agent, "click-2").await;
    assert_eq!(second.ticket.generation, 1);
    assert_eq!(calls.load(Ordering::SeqCst), 2);
    // A repeated HTTP/control command cannot create another paid attempt.
    assert!(matches!(
        agent
            .invoke(RunInput::retry_model(first.clone()), context())
            .await,
        Err(Error::ModelFailure(_))
    ));
    assert_eq!(calls.load(Ordering::SeqCst), 2);
    let mut stale = first.clone();
    stale.command_id = "new-id-old-ticket".into();
    assert!(
        agent
            .invoke(RunInput::retry_model(stale), context())
            .await
            .is_err()
    );
    let mut reused = second.clone();
    reused.command_id = first.command_id;
    assert!(
        agent
            .invoke(RunInput::retry_model(reused), context())
            .await
            .is_err()
    );
    assert!(
        matches!(agent.invoke(RunInput::retry_model(second.clone()), context()).await.unwrap(), RunOutcome::Completed { state, .. } if state.control_sequence == 2)
    );
    assert!(matches!(
        agent
            .invoke(RunInput::retry_model(second), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(calls.load(Ordering::SeqCst), 3);
    assert!(
        agent
            .model_retry_ticket("thread", "run")
            .await
            .unwrap()
            .is_none()
    );
    let used = summary(ledger.as_ref(), &p).await;
    assert_eq!(used.used.model_calls, 3);
    assert_eq!((used.used.input_tokens, used.used.output_tokens), (23, 12));
    assert_eq!(used.reserved, BudgetCost::default());
    let errors = events.lock().unwrap();
    // Replayed failures reuse their event; fresh attempts get new identities.
    assert_eq!(errors.len(), 2);
    assert_ne!(errors[0].id, errors[1].id);
}

#[tokio::test]
async fn explicit_retry_cannot_reset_exhausted_budget() {
    let ledger = Arc::new(InMemoryBudgetStore::default());
    let calls = Arc::new(AtomicUsize::new(0));
    let agent = build(model(&calls, 1))
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()))
        .with_governance(profile(ledger, 1));
    assert!(
        agent
            .invoke(RunInput::new("query"), context())
            .await
            .is_err()
    );
    let command = command(&agent, "retry").await;
    assert!(matches!(
        agent
            .invoke(RunInput::retry_model(command), context())
            .await
            .unwrap(),
        RunOutcome::BudgetExceeded { .. }
    ));
    assert_eq!(calls.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn lost_dispatch_has_no_retry_ticket_and_forgery_cannot_skip_uncertain_intent() {
    let ledger = Arc::new(InMemoryBudgetStore::default());
    let calls = Arc::new(AtomicUsize::new(0));
    let started = Arc::new(tokio::sync::Notify::new());
    let agent = Arc::new(
        build(Arc::new(FailingModel {
            calls: calls.clone(),
            failures: 0,
            wait: Some(started.clone()),
        }))
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()))
        .with_governance(profile(ledger, 4)),
    );
    let running = {
        let agent = agent.clone();
        tokio::spawn(async move { agent.invoke(RunInput::new("query"), context()).await })
    };
    tokio::time::timeout(std::time::Duration::from_secs(2), started.notified())
        .await
        .unwrap();
    running.abort();
    let _ = running.await;
    assert!(
        agent
            .model_retry_ticket("thread", "run")
            .await
            .unwrap()
            .is_none()
    );
    assert!(
        matches!(agent.invoke(RunInput::resume(), context()).await.unwrap(), RunOutcome::Paused { reason, .. } if reason["kind"] == "budget_uncertain")
    );
    let forged = ModelRetryCommand {
        command_id: "forged".into(),
        ticket: ModelRetryTicket {
            thread_id: "thread".into(),
            run_id: "run".into(),
            operation_id: "unknown".into(),
            operation_scope: None,
            request_fingerprint: "unknown".into(),
            generation: 0,
        },
    };
    assert!(
        agent
            .invoke(RunInput::retry_model(forged), context())
            .await
            .is_err()
    );
    assert_eq!(calls.load(Ordering::SeqCst), 1);
}

struct Fault {
    store: Arc<InMemoryCheckpointer>,
    fail_result: bool,
    armed: AtomicBool,
}
#[async_trait::async_trait]
impl Checkpointer for Fault {
    async fn load(&self, key: &str) -> Result<Option<Checkpoint>, Error> {
        self.store.load(key).await
    }
    async fn save(
        &self,
        key: &str,
        expected: Option<u64>,
        checkpoint: Checkpoint,
    ) -> Result<(), Error> {
        let target = checkpoint.state.control_sequence == 1
            && if self.fail_result {
                checkpoint.state.pending_model.is_none()
            } else {
                checkpoint.state.pending_model.is_some()
            };
        if target && self.armed.swap(false, Ordering::SeqCst) {
            return Err(Error::Checkpoint("lost checkpoint commit".into()));
        }
        self.store.save(key, expected, checkpoint).await
    }
}
#[tokio::test]
async fn lost_authorization_or_result_checkpoint_does_not_duplicate_retry() {
    for fail_result in [false, true] {
        let calls = Arc::new(AtomicUsize::new(0));
        let store = Arc::new(InMemoryCheckpointer::default());
        let fault = Arc::new(Fault {
            store: store.clone(),
            fail_result,
            armed: AtomicBool::new(false),
        });
        let bare = build(model(&calls, 1))
            .with_governance(profile(Arc::new(InMemoryBudgetStore::default()), 3));
        let agent = bare.clone().with_checkpointer(fault.clone());
        assert!(
            agent
                .invoke(RunInput::new("query"), context())
                .await
                .is_err()
        );
        let command = command(&agent, "one-click").await;
        fault.armed.store(true, Ordering::SeqCst);
        assert!(matches!(
            agent
                .invoke(RunInput::retry_model(command.clone()), context())
                .await,
            Err(Error::Checkpoint(_))
        ));
        let restored = bare.with_checkpointer(store);
        assert!(matches!(
            restored
                .invoke(
                    if fail_result {
                        RunInput::retry_model(command)
                    } else {
                        RunInput::resume()
                    },
                    context()
                )
                .await
                .unwrap(),
            RunOutcome::Completed { .. }
        ));
        assert_eq!(calls.load(Ordering::SeqCst), 2);
    }
}

struct Summarize {
    first: Arc<dyn Model>,
    second: Arc<dyn Model>,
}
#[async_trait::async_trait]
impl ContextPolicy for Summarize {
    async fn plan(&self, _: &RunState, _: &RunContext) -> Result<Option<Value>, Error> {
        Ok(Some(json!({"summary":true})))
    }
    async fn apply(
        &self,
        state: &RunState,
        _: &Value,
        context: &RunContext,
    ) -> Result<ContextUpdate, Error> {
        let request = ModelRequest {
            messages: vec![],
            tools: vec![],
            settings: json!({}),
        };
        for (index, model) in [&self.first, &self.second].into_iter().enumerate() {
            let op = serde_json::to_string(&(operation_scope(context).unwrap(), index)).unwrap();
            sample_model(
                model.as_ref(),
                request.clone(),
                context,
                &op,
                false,
                |_| async { Ok(()) },
            )
            .await?;
        }
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
#[tokio::test]
async fn compaction_scope_retries_only_failed_model_and_replays_prior_success() {
    let first = Arc::new(AtomicUsize::new(0));
    let second = Arc::new(AtomicUsize::new(0));
    let ledger = Arc::new(InMemoryBudgetStore::default());
    let p = profile(ledger.clone(), 4);
    let agent = build(Arc::new(Final))
        .with_context_policy(
            "summary@1",
            Arc::new(Summarize {
                first: model(&first, 0),
                second: model(&second, 1),
            }),
        )
        .unwrap()
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()))
        .with_governance(p.clone());
    assert!(matches!(
        agent.invoke(RunInput::new("query"), context()).await,
        Err(Error::ModelFailure(_))
    ));
    let command = command(&agent, "retry-summary").await;
    assert!(command.ticket.operation_scope.is_some());
    assert!(matches!(
        agent.invoke(RunInput::resume(), context()).await,
        Err(Error::ModelFailure(_))
    ));
    assert!(matches!(
        agent
            .invoke(RunInput::retry_model(command), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(first.load(Ordering::SeqCst), 1);
    assert_eq!(second.load(Ordering::SeqCst), 2);
    assert_eq!(summary(ledger.as_ref(), &p).await.used.model_calls, 4);
}

#[cfg(feature = "sqlite")]
#[tokio::test]
async fn retry_process_worker() {
    let Ok(directory) = std::env::var("NOFY_MODEL_RECOVERY_WORKER") else {
        return;
    };
    let phase = std::env::var("NOFY_MODEL_RECOVERY_PHASE").unwrap();
    let directory = std::path::Path::new(&directory);
    struct DiskModel {
        log: std::path::PathBuf,
        fail: bool,
    }
    #[async_trait::async_trait]
    impl Model for DiskModel {
        async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
            use std::io::Write;
            writeln!(
                std::fs::OpenOptions::new()
                    .create(true)
                    .append(true)
                    .open(&self.log)
                    .unwrap(),
                "call"
            )
            .unwrap();
            if self.fail {
                return Err(Error::Model("expired credential".into()));
            }
            Ok(ModelResponse {
                output: "recovered".into(),
                ..Default::default()
            })
        }
    }
    let store = Arc::new(durable::SqliteStore::open(&directory.join("runtime.db")).unwrap());
    let agent = build(Arc::new(DiskModel {
        log: directory.join("calls"),
        fail: phase == "fail",
    }))
    .with_checkpointer(store.clone())
    .with_governance(profile(store, 2));
    if phase == "fail" {
        assert!(matches!(
            agent.invoke(RunInput::new("query"), context()).await,
            Err(Error::ModelFailure(_))
        ));
        std::fs::write(
            directory.join("command.json"),
            serde_json::to_vec(&command(&agent, "same-command").await).unwrap(),
        )
        .unwrap();
    } else {
        let command =
            serde_json::from_slice(&std::fs::read(directory.join("command.json")).unwrap())
                .unwrap();
        assert!(matches!(
            agent
                .invoke(RunInput::retry_model(command), context())
                .await
                .unwrap(),
            RunOutcome::Completed { .. }
        ));
    }
}
#[cfg(feature = "sqlite")]
#[test]
fn settled_failure_retries_after_real_process_restart() {
    let temp = tempfile::tempdir().unwrap();
    for phase in ["fail", "retry", "replay"] {
        let result = std::process::Command::new(std::env::current_exe().unwrap())
            .args(["--exact", "retry_process_worker", "--nocapture"])
            .env("NOFY_MODEL_RECOVERY_WORKER", temp.path())
            .env("NOFY_MODEL_RECOVERY_PHASE", phase)
            .output()
            .unwrap();
        assert!(
            result.status.success(),
            "{}",
            format!(
                "{}{}",
                String::from_utf8_lossy(&result.stdout),
                String::from_utf8_lossy(&result.stderr)
            )
        );
    }
    assert_eq!(
        std::fs::read_to_string(temp.path().join("calls"))
            .unwrap()
            .lines()
            .count(),
        2
    );
}
