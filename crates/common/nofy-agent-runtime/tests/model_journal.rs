use nofy_agent_runtime::{
    context::ContextBinding, governance::ModelRetryCommand, model_journal::*, *,
};
use serde_json::json;
use std::sync::{
    Arc,
    atomic::{AtomicBool, AtomicUsize, Ordering},
};
struct Provider {
    calls: Arc<AtomicUsize>,
    failures: usize,
}
#[async_trait::async_trait]
impl Model for Provider {
    async fn request_bound(
        &self,
        _: &ModelRequest,
        _: &RunContext,
    ) -> Result<model::ModelRequestBound, Error> {
        panic!("unmetered persistence must not require a budget bound")
    }
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        if self.calls.fetch_add(1, Ordering::SeqCst) < self.failures {
            return Err(model::ModelFailure {
                category: "auth".into(),
                message: "rejected".into(),
                status: Some(401),
                retryable: false,
                retry_after_ms: None,
                code: None,
                details: json!(null),
            }
            .into());
        }
        Ok(ModelResponse {
            output: "complete".into(),
            input_tokens: 3,
            output_tokens: 2,
            info: CompletionInfo {
                provider: json!({"native":true}),
                ..Default::default()
            },
            ..Default::default()
        })
    }
}
struct LoseResult {
    inner: Arc<dyn Checkpointer>,
    failed: AtomicBool,
}
#[async_trait::async_trait]
impl Checkpointer for LoseResult {
    async fn load(&self, key: &str) -> Result<Option<Checkpoint>, Error> {
        self.inner.load(key).await
    }
    async fn save(
        &self,
        key: &str,
        version: Option<u64>,
        checkpoint: Checkpoint,
    ) -> Result<(), Error> {
        if let Some(old) = self.inner.load(key).await? {
            if old.state.pending_model.is_some()
                && checkpoint.state.pending_model.is_none()
                && !self.failed.swap(true, Ordering::SeqCst)
            {
                return Err(Error::Checkpoint("lost primary result commit".into()));
            }
        }
        self.inner.save(key, version, checkpoint).await
    }
}
fn build(calls: Arc<AtomicUsize>, failures: usize) -> Agent {
    let mut components = Components::default();
    components
        .models
        .insert("model".into(), Arc::new(Provider { calls, failures }));
    components
        .prompts
        .insert("prompt".into(), Arc::new(StaticPrompt("act".into())));
    AgentBuilder::new("journal-agent")
        .model("model")
        .prompt("prompt")
        .compile(&components)
        .unwrap()
}
fn context() -> RunContext {
    RunContext::new("thread", "run")
}
#[tokio::test]
async fn native_result_survives_primary_checkpoint_loss_without_another_model_request() {
    let calls = Arc::new(AtomicUsize::new(0));
    let agent = build(calls.clone(), 0)
        .with_binding("journal", Arc::new(ModelJournalBinding))
        .with_checkpointer(Arc::new(LoseResult {
            inner: Arc::new(InMemoryCheckpointer::default()),
            failed: AtomicBool::new(false),
        }));
    assert!(matches!(
        agent.invoke(RunInput::new("query"), context()).await,
        Err(Error::Checkpoint(_))
    ));
    assert!(matches!(
        agent
            .invoke(RunInput::resume(), RunContext::new("thread", "foreign"))
            .await,
        Err(Error::Checkpoint(_))
    ));
    let RunOutcome::Completed { state, output } =
        agent.invoke(RunInput::resume(), context()).await.unwrap()
    else {
        panic!("expected recovered result")
    };
    assert_eq!(output, "complete");
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    assert_eq!(state.messages.len(), 3);
    assert_eq!((state.input_tokens, state.output_tokens), (3, 2));
    assert_eq!(state.completion_info.provider, json!({"native":true}));
}
#[tokio::test]
async fn unmetered_failure_requires_the_original_explicit_retry_and_preserves_generation() {
    let calls = Arc::new(AtomicUsize::new(0));
    let agent = build(calls.clone(), 1)
        .with_binding("journal", Arc::new(ModelJournalBinding))
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    assert!(matches!(
        agent.invoke(RunInput::new("query"), context()).await,
        Err(Error::ModelFailure(_))
    ));
    assert!(matches!(
        agent.invoke(RunInput::resume(), context()).await,
        Err(Error::ModelFailure(_))
    ));
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    let ticket = agent
        .model_retry_ticket("thread", "run")
        .await
        .unwrap()
        .unwrap();
    let result = agent
        .invoke(
            RunInput::retry_model(ModelRetryCommand {
                command_id: "retry".into(),
                ticket,
            }),
            context(),
        )
        .await
        .unwrap();
    assert!(matches!(result, RunOutcome::Completed { .. }));
    assert_eq!(calls.load(Ordering::SeqCst), 2);
    assert!(
        agent
            .model_retry_ticket("thread", "run")
            .await
            .unwrap()
            .is_none()
    );
}
struct ClearBindings;
impl ContextBinding for ClearBindings {
    fn bind(&self, ctx: &mut RunContext) -> Result<(), Error> {
        ctx.capabilities = Default::default();
        Ok(())
    }
}
#[tokio::test]
async fn explicit_persistence_cannot_be_erased_and_missing_checkpoint_fails_before_io() {
    let calls = Arc::new(AtomicUsize::new(0));
    let agent = build(calls.clone(), 0)
        .with_binding("journal", Arc::new(ModelJournalBinding))
        .with_binding("reset", Arc::new(ClearBindings));
    assert!(matches!(
        agent.invoke(RunInput::new("query"), context()).await,
        Err(Error::Composition(_))
    ));
    assert_eq!(calls.load(Ordering::SeqCst), 0);
    assert!(matches!(
        build(calls.clone(), 0)
            .invoke(RunInput::new("legacy"), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(calls.load(Ordering::SeqCst), 1);
}
