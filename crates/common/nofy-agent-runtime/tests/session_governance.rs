use nofy_agent_runtime::{governance::*, hooks::*, *};
use serde_json::{Value, json};
use std::sync::{
    Arc,
    atomic::{AtomicUsize, Ordering},
};
struct Never;
#[async_trait::async_trait]
impl Model for Never {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        panic!("session signal must not sample")
    }
}
struct Effect(Arc<AtomicUsize>);
#[async_trait::async_trait]
impl HookHandler for Effect {
    async fn handle(&self, event: &HookEvent, context: &RunContext) -> Result<HookDecision, Error> {
        let call = ToolCall {
            id: "session-effect".into(),
            name: "effect".into(),
            arguments: json!({"event":event.id}),
        };
        match policy::admit_required(&call, &RunState::default(), context).await? {
            Admission::Allow => {}
            Admission::Deny(reason) => return Err(Error::Composition(reason)),
            Admission::Pause(reason) => return Err(Error::GovernancePaused(reason)),
        }
        let value: Value = tool_operation(
            context,
            &call,
            &format!("session-effect:{}", event.id),
            "1",
            async {
                self.0.fetch_add(1, Ordering::SeqCst);
                Ok(json!({}))
            },
        )
        .await?;
        assert_eq!(value, json!({}));
        Ok(HookDecision::Continue)
    }
}
fn agent(counter: Arc<AtomicUsize>) -> Agent {
    let mut components = Components::default();
    components.models.insert("never".into(), Arc::new(Never));
    components
        .prompts
        .insert("prompt".into(), Arc::new(StaticPrompt("system".into())));
    let registration = HookRegistration::new(
        "session-end-1".into(),
        EventCatalog::runtime().get("session_end").unwrap().clone(),
        HookRule {
            event: "session_end".into(),
            priority: 0,
            timeout_ms: 1000,
            failure: FailurePolicy::Open,
            matches: None,
        },
        Arc::new(Effect(counter)),
    )
    .unwrap();
    AgentBuilder::new("session")
        .model("never")
        .prompt("prompt")
        .compile(&components)
        .unwrap()
        .with_hooks(HookBus::new(EventCatalog::runtime(), vec![Arc::new(registration)]).unwrap())
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()))
}
fn profile(max_tools: u64) -> Arc<GovernanceProfile> {
    Arc::new(
        GovernanceProfile::new(
            Arc::new(
                InstalledBudget::install(
                    Arc::new(InMemoryBudgetStore::default()),
                    BudgetLimits {
                        max_tool_calls: Some(max_tools),
                        ..Default::default()
                    },
                    "session-budget",
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
fn signal() -> SessionSignal {
    SessionSignal::End {
        reason: "closed".into(),
    }
}
#[tokio::test]
async fn session_hook_uses_own_budget_caches_result_and_never_fails_open_over_limit() {
    for allowed in [0, 1] {
        let effects = Arc::new(AtomicUsize::new(0));
        let agent = agent(effects.clone()).with_governance(profile(allowed));
        if allowed == 0 {
            assert!(matches!(
                agent.notify_session(signal(), context()).await,
                Err(Error::BudgetExceeded)
            ));
            assert_eq!(effects.load(Ordering::SeqCst), 0);
        } else {
            agent.notify_session(signal(), context()).await.unwrap();
            agent.notify_session(signal(), context()).await.unwrap();
            assert_eq!(effects.load(Ordering::SeqCst), 1);
        }
    }
}
struct Clear;
impl nofy_agent_runtime::context::ContextBinding for Clear {
    fn bind(&self, context: &mut RunContext) -> Result<(), Error> {
        context.capabilities = Default::default();
        Ok(())
    }
}
struct Parent {
    child: Agent,
}
#[async_trait::async_trait]
impl Model for Parent {
    async fn complete(
        &self,
        _: ModelRequest,
        context: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.child.notify_session(signal(), context.clone()).await?;
        Ok(Default::default())
    }
}
#[tokio::test]
async fn child_session_notification_cannot_clear_inherited_root_budget() {
    let effects = Arc::new(AtomicUsize::new(0));
    let child = agent(effects.clone()).with_binding("clear-1", Arc::new(Clear));
    let mut components = Components::default();
    components
        .models
        .insert("parent".into(), Arc::new(Parent { child }));
    components
        .prompts
        .insert("prompt".into(), Arc::new(StaticPrompt("system".into())));
    let parent = AgentBuilder::new("parent")
        .model("parent")
        .prompt("prompt")
        .compile(&components)
        .unwrap()
        .with_governance(profile(0));
    assert!(matches!(
        parent
            .invoke(RunInput::new("task"), context())
            .await
            .unwrap(),
        RunOutcome::BudgetExceeded { .. }
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 0);
}
#[tokio::test]
async fn cancelled_session_signal_starts_no_effect() {
    let effects = Arc::new(AtomicUsize::new(0));
    let agent = agent(effects.clone()).with_governance(profile(1));
    let context = context();
    context.cancel.cancel();
    assert!(matches!(
        agent.notify_session(signal(), context).await,
        Err(Error::Cancelled)
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 0);
}

struct Deny;
#[async_trait::async_trait]
impl Policy for Deny {
    async fn admit(&self, _: &ToolCall, _: &RunState, _: &RunContext) -> Result<Admission, Error> {
        Ok(Admission::Deny("host denied effect".into()))
    }
}
#[tokio::test]
async fn session_binding_cannot_clear_required_host_policy() {
    let effects = Arc::new(AtomicUsize::new(0));
    let agent = agent(effects.clone())
        .with_governance(profile(1))
        .with_required_policy("deny-effect", Arc::new(Deny))
        .unwrap()
        .with_binding("clear-1", Arc::new(Clear));
    agent.notify_session(signal(), context()).await.unwrap();
    assert_eq!(effects.load(Ordering::SeqCst), 0);
}
struct Slow(Arc<AtomicUsize>);
#[async_trait::async_trait]
impl HookHandler for Slow {
    async fn handle(&self, _: &HookEvent, _: &RunContext) -> Result<HookDecision, Error> {
        tokio::time::sleep(std::time::Duration::from_secs(1)).await;
        self.0.fetch_add(1, Ordering::SeqCst);
        Ok(HookDecision::Continue)
    }
}
#[tokio::test]
async fn session_deadline_cancels_handler_and_preserves_budget_failure_classification() {
    let effects = Arc::new(AtomicUsize::new(0));
    let registration = HookRegistration::new(
        "slow-session-1".into(),
        EventCatalog::runtime().get("session_end").unwrap().clone(),
        HookRule {
            event: "session_end".into(),
            priority: 0,
            timeout_ms: 2000,
            failure: FailurePolicy::Open,
            matches: None,
        },
        Arc::new(Slow(effects.clone())),
    )
    .unwrap();
    let profile = Arc::new(
        GovernanceProfile::new(
            Arc::new(
                InstalledBudget::install(
                    Arc::new(InMemoryBudgetStore::default()),
                    BudgetLimits {
                        max_duration_ms: Some(5),
                        ..Default::default()
                    },
                    "session-deadline",
                    1,
                )
                .unwrap(),
            ),
            BudgetLimits::default(),
            ModelRetryPolicy::default(),
        )
        .unwrap(),
    );
    let agent = agent(effects.clone())
        .with_hooks(HookBus::new(EventCatalog::runtime(), vec![Arc::new(registration)]).unwrap())
        .with_governance(profile);
    assert!(matches!(
        tokio::time::timeout(
            std::time::Duration::from_secs(2),
            agent.notify_session(signal(), context())
        )
        .await
        .unwrap(),
        Err(Error::BudgetExceeded)
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 0);
}
