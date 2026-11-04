#![cfg(feature = "sqlite")]
use nofy_agent_runtime::{durable::SqliteStore, memory::ContextSource, *};
use serde_json::{Value, json};
use std::sync::{
    Arc, Mutex,
    atomic::{AtomicBool, AtomicUsize, Ordering},
};

#[derive(Default)]
struct Probe {
    sample: Mutex<Option<Arc<dyn Model>>>,
    revision: AtomicUsize,
    prepared: AtomicUsize,
    executed: AtomicUsize,
    pause: AtomicBool,
    block: AtomicBool,
    entered: tokio::sync::Notify,
    scopes: Mutex<Vec<String>>,
    plans: Mutex<Vec<Value>>,
    requests: Mutex<Vec<ModelRequest>>,
}
struct Source(Arc<Probe>);
#[async_trait::async_trait]
impl ContextSource for Source {
    async fn revision(&self, _: &RunContext) -> Result<Option<String>, Error> {
        Ok(Some(self.0.revision.load(Ordering::SeqCst).to_string()))
    }
    async fn prepare(&self, _: &RunState, _: &RunContext) -> Result<Option<Value>, Error> {
        self.0.prepared.fetch_add(1, Ordering::SeqCst);
        Ok(Some(
            json!({"original_revision":self.0.revision.load(Ordering::SeqCst)}),
        ))
    }
    async fn contribute(&self, _: &RunState, _: &RunContext) -> Result<Vec<Message>, Error> {
        panic!("prepared source must use its persisted plan")
    }
    async fn contribute_prepared(
        &self,
        _: &RunState,
        plan: &Value,
        context: &RunContext,
    ) -> Result<Vec<Message>, Error> {
        self.0.executed.fetch_add(1, Ordering::SeqCst);
        self.0
            .scopes
            .lock()
            .unwrap()
            .push(governance::operation_scope(context).expect("original operation scope"));
        self.0.plans.lock().unwrap().push(plan.clone());
        self.0.entered.notify_one();
        if self.0.block.load(Ordering::SeqCst) {
            std::future::pending::<()>().await;
        }
        if self.0.pause.load(Ordering::SeqCst) {
            return Err(Error::GovernancePaused(json!({"kind":"fixture_pending"})));
        }
        let sample = self.0.sample.lock().unwrap().clone();
        if let Some(model) = sample {
            let scope = governance::operation_scope(context).unwrap();
            let operation = serde_json::to_string(&("prepared-test/v1", scope)).unwrap();
            governance::sample_model(
                model.as_ref(),
                ModelRequest {
                    messages: vec![Message::User {
                        content: plan.to_string(),
                    }],
                    tools: vec![],
                    settings: json!({}),
                },
                context,
                &operation,
                false,
                |_| async { Ok(()) },
            )
            .await?;
        }
        Ok(vec![Message::User {
            content: format!("retrieved revision {}", plan["original_revision"]),
        }])
    }
}
struct Echo(Arc<Probe>);
#[async_trait::async_trait]
impl Model for Echo {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.0.requests.lock().unwrap().push(request.clone());
        Ok(ModelResponse {
            output: request
                .messages
                .iter()
                .filter_map(|m| match m {
                    Message::User { content } => Some(content.as_str()),
                    _ => None,
                })
                .collect::<Vec<_>>()
                .join("|"),
            ..Default::default()
        })
    }
}
fn agent(probe: Arc<Probe>, store: Arc<dyn Checkpointer>) -> Agent {
    let mut components = Components::default();
    components
        .models
        .insert("model".into(), Arc::new(Echo(probe.clone())));
    components
        .prompts
        .insert("prompt".into(), Arc::new(StaticPrompt("system".into())));
    components
        .context_sources
        .insert("source".into(), Arc::new(Source(probe)));
    AgentBuilder::new("prepared-context")
        .model("model")
        .prompt("prompt")
        .context_source("source")
        .compile(&components)
        .unwrap()
        .with_checkpointer(store)
}
#[tokio::test]
async fn original_plan_settles_before_revision_replacement_and_never_enters_transcript() {
    let dir = tempfile::tempdir().unwrap();
    let store = Arc::new(SqliteStore::open(&dir.path().join("state.sqlite")).unwrap());
    let probe = Arc::new(Probe::default());
    probe.pause.store(true, Ordering::SeqCst);
    let agent = agent(probe.clone(), store);
    let first = agent
        .invoke(
            RunInput::new("original user input"),
            RunContext::new("thread", "run"),
        )
        .await
        .unwrap();
    let RunOutcome::Paused { state, .. } = first else {
        panic!("source must pause")
    };
    assert!(state.has_pending_work());
    assert!(
        state
            .hook_progress
            .prepared_sources
            .as_ref()
            .unwrap()
            .pending
            .is_some()
    );
    assert_eq!(probe.requests.lock().unwrap().len(), 0);
    probe.revision.store(1, Ordering::SeqCst);
    probe.pause.store(false, Ordering::SeqCst);
    let result = agent
        .invoke(RunInput::resume(), RunContext::new("thread", "run"))
        .await
        .unwrap();
    let RunOutcome::Completed { output, state } = result else {
        panic!("completion")
    };
    assert!(output.contains("retrieved revision 1"));
    assert!(!output.contains("retrieved revision 0"));
    assert!(
        state.messages.iter().all(
            |m| !matches!(m,Message::User{content} if content.starts_with("retrieved revision"))
        )
    );
    assert!(state.hook_progress.prepared_sources.is_none());
    assert_eq!(probe.prepared.load(Ordering::SeqCst), 2);
    let plans = probe.plans.lock().unwrap();
    assert_eq!(plans.len(), 3);
    assert_eq!(plans[0], plans[1]);
    assert_ne!(plans[1], plans[2]);
    let scopes = probe.scopes.lock().unwrap();
    assert_eq!(scopes[0], scopes[1]);
    assert_ne!(scopes[1], scopes[2]);
}
#[tokio::test]
async fn aborted_owner_reopens_the_original_prepared_plan_without_repreparing() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("state.sqlite");
    let probe = Arc::new(Probe::default());
    probe.block.store(true, Ordering::SeqCst);
    let first = agent(probe.clone(), Arc::new(SqliteStore::open(&path).unwrap()));
    let task = tokio::spawn(async move {
        first
            .invoke(
                RunInput::new("recover me"),
                RunContext::new("thread", "run"),
            )
            .await
    });
    probe.entered.notified().await;
    task.abort();
    assert!(task.await.unwrap_err().is_cancelled());
    probe.block.store(false, Ordering::SeqCst);
    let reopened = agent(probe.clone(), Arc::new(SqliteStore::open(&path).unwrap()));
    let RunOutcome::Completed { state, .. } = reopened
        .invoke(RunInput::resume(), RunContext::new("thread", "run"))
        .await
        .unwrap()
    else {
        panic!("recover prepared work")
    };
    assert!(state.hook_progress.prepared_sources.is_none());
    assert_eq!(probe.prepared.load(Ordering::SeqCst), 1);
    let scopes = probe.scopes.lock().unwrap();
    assert_eq!(scopes.len(), 2);
    assert_eq!(scopes[0], scopes[1]);
}
#[tokio::test]
async fn known_cancellation_retires_the_plan_and_explicit_resume_uses_a_new_scope() {
    let dir = tempfile::tempdir().unwrap();
    let probe = Arc::new(Probe::default());
    probe.block.store(true, Ordering::SeqCst);
    let agent = Arc::new(agent(
        probe.clone(),
        Arc::new(SqliteStore::open(&dir.path().join("state.sqlite")).unwrap()),
    ));
    let context = RunContext::new("thread", "run");
    let cancel = context.cancel.clone();
    let active = agent.clone();
    let task =
        tokio::spawn(async move { active.invoke(RunInput::new("cancel me"), context).await });
    probe.entered.notified().await;
    cancel.cancel();
    let RunOutcome::Cancelled { state } = task.await.unwrap().unwrap() else {
        panic!("cancelled")
    };
    assert!(state.hook_progress.prepared_sources.is_none());
    probe.block.store(false, Ordering::SeqCst);
    assert!(matches!(
        agent
            .invoke(RunInput::resume(), RunContext::new("thread", "run"))
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(probe.prepared.load(Ordering::SeqCst), 2);
    let scopes = probe.scopes.lock().unwrap();
    assert_ne!(scopes[0], scopes[1]);
}
#[tokio::test]
async fn volatile_checkpoint_rejects_effectful_sources_before_execution() {
    let probe = Arc::new(Probe::default());
    let agent = agent(probe.clone(), Arc::new(InMemoryCheckpointer::default()));
    let result = agent
        .invoke(
            RunInput::new("no durable store"),
            RunContext::new("thread", "run"),
        )
        .await;
    assert!(matches!(result,Err(Error::Checkpoint(ref message)) if message.contains("durable")));
    assert_eq!(probe.executed.load(Ordering::SeqCst), 0);
    assert!(probe.requests.lock().unwrap().is_empty());
}

struct FailsOnce(Arc<AtomicUsize>);
#[async_trait::async_trait]
impl Model for FailsOnce {
    async fn request_bound(
        &self,
        _: &ModelRequest,
        _: &RunContext,
    ) -> Result<model::ModelRequestBound, Error> {
        Ok(model::ModelRequestBound {
            max_calls: 1,
            max_input_tokens: Some(16),
            max_output_tokens: Some(1),
        })
    }
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        if self.0.fetch_add(1, Ordering::SeqCst) == 0 {
            return Err(model::ModelFailure {
                category: "provider".into(),
                message: "fixture rejected".into(),
                status: Some(503),
                retryable: false,
                retry_after_ms: None,
                code: None,
                details: Value::Null,
            }
            .into());
        }
        Ok(ModelResponse {
            output: "sample complete".into(),
            input_tokens: 1,
            ..Default::default()
        })
    }
}
#[tokio::test]
async fn settled_source_model_failure_requires_the_exact_retry_ticket_and_keeps_the_original_plan()
{
    use governance::BudgetStore;
    let dir = tempfile::tempdir().unwrap();
    let store = Arc::new(SqliteStore::open(&dir.path().join("state.sqlite")).unwrap());
    let profile = Arc::new(
        governance::GovernanceProfile::new(
            Arc::new(
                governance::InstalledBudget::install(
                    store.clone(),
                    governance::BudgetLimits {
                        max_model_calls: Some(4),
                        ..Default::default()
                    },
                    "prepared@1",
                    1,
                )
                .unwrap(),
            ),
            Default::default(),
            Default::default(),
        )
        .unwrap(),
    );
    let probe = Arc::new(Probe::default());
    let calls = Arc::new(AtomicUsize::new(0));
    *probe.sample.lock().unwrap() = Some(Arc::new(FailsOnce(calls.clone())));
    let agent = agent(probe.clone(), store.clone()).with_governance(profile.clone());
    assert!(matches!(
        agent
            .invoke(
                RunInput::new("keep my plan"),
                RunContext::new("thread", "run")
            )
            .await,
        Err(Error::ModelFailure(_))
    ));
    let ticket = agent
        .model_retry_ticket("thread", "run")
        .await
        .unwrap()
        .unwrap();
    assert_eq!(
        ticket.operation_scope.as_ref().unwrap(),
        &probe.scopes.lock().unwrap()[0]
    );
    assert!(matches!(
        agent
            .invoke(RunInput::resume(), RunContext::new("thread", "run"))
            .await,
        Err(Error::ModelFailure(_))
    ));
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    let mut forged = ticket.clone();
    forged.operation_scope = Some("unrelated-source".into());
    assert!(matches!(
        agent
            .invoke(
                RunInput::retry_model(governance::ModelRetryCommand {
                    command_id: "forged".into(),
                    ticket: forged
                }),
                RunContext::new("thread", "run")
            )
            .await,
        Err(Error::Checkpoint(_))
    ));
    let command = governance::ModelRetryCommand {
        command_id: "retry-original-source".into(),
        ticket,
    };
    let RunOutcome::Completed { state, .. } = agent
        .invoke(
            RunInput::retry_model(command.clone()),
            RunContext::new("thread", "run"),
        )
        .await
        .unwrap()
    else {
        panic!("retry original source")
    };
    assert!(!state.has_pending_work());
    assert!(state.hook_progress.prepared_sources.is_none());
    assert!(matches!(
        agent
            .invoke(
                RunInput::retry_model(command),
                RunContext::new("thread", "run")
            )
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(calls.load(Ordering::SeqCst), 2);
    assert_eq!(probe.prepared.load(Ordering::SeqCst), 1);
    {
        let scopes = probe.scopes.lock().unwrap();
        assert!(scopes.iter().all(|scope| scope == &scopes[0]));
    }
    let budget = store
        .inspect(&governance::BudgetScope {
            root_run_id: "run".into(),
            identity: profile.identity().into(),
        })
        .await
        .unwrap()
        .unwrap();
    assert_eq!(budget.used.model_calls, 3);
    assert_eq!(budget.reserved.model_calls, 0);
}

struct DenyModel;
#[async_trait::async_trait]
impl hooks::HookHandler for DenyModel {
    async fn handle(
        &self,
        _: &hooks::HookEvent,
        _: &RunContext,
    ) -> Result<hooks::HookDecision, Error> {
        Ok(hooks::HookDecision::Deny {
            reason: "inference denied".into(),
        })
    }
}
#[tokio::test]
async fn denied_primary_inference_retires_completed_source_work_without_a_model_request() {
    let dir = tempfile::tempdir().unwrap();
    let probe = Arc::new(Probe::default());
    let catalog = hooks::EventCatalog::runtime();
    let subscription = Arc::new(
        hooks::HookRegistration::new(
            "deny-model".into(),
            catalog.get("before_model").unwrap().clone(),
            hooks::HookRule {
                event: "before_model".into(),
                priority: 0,
                timeout_ms: 1000,
                failure: hooks::FailurePolicy::Closed,
                matches: None,
            },
            Arc::new(DenyModel),
        )
        .unwrap(),
    );
    let agent = agent(
        probe.clone(),
        Arc::new(SqliteStore::open(&dir.path().join("state.sqlite")).unwrap()),
    )
    .with_hooks(hooks::HookBus::new(catalog, vec![subscription]).unwrap());
    let RunOutcome::Completed { output, state } = agent
        .invoke(
            RunInput::new("do not infer"),
            RunContext::new("thread", "run"),
        )
        .await
        .unwrap()
    else {
        panic!("hook must complete with a refusal")
    };
    assert_eq!(output, "inference denied");
    assert!(!state.has_pending_work());
    assert!(state.hook_progress.prepared_sources.is_none());
    assert!(probe.requests.lock().unwrap().is_empty());
    assert_eq!(probe.executed.load(Ordering::SeqCst), 1);
}
