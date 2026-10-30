use nofy_agent_runtime::{governance::*, *};
use nofy_tool_runtime::{Tool, ToolCallContext};
use nofy_tool_types::ToolDescription;
use serde_json::{Value, json};
use std::sync::{
    Arc,
    atomic::{AtomicUsize, Ordering},
};
use tokio::sync::Notify;

struct Script {
    calls: Arc<AtomicUsize>,
    tool: Option<&'static str>,
    retry_once: bool,
    bound: bool,
    overrun: bool,
}
#[async_trait::async_trait]
impl Model for Script {
    fn request_bound(
        &self,
        _: &ModelRequest,
        _: &RunContext,
    ) -> Result<model::ModelRequestBound, Error> {
        Ok(model::ModelRequestBound {
            max_calls: 1,
            max_input_tokens: self.bound.then_some(10),
            max_output_tokens: self.bound.then_some(10),
        })
    }
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        let attempt = self.calls.fetch_add(1, Ordering::SeqCst);
        if self.retry_once && attempt == 0 {
            return Err(model::ModelFailure {
                category: "transport".into(),
                message: "temporary".into(),
                status: Some(503),
                retryable: true,
                retry_after_ms: None,
                code: None,
                details: Value::Null,
            }
            .into());
        }
        let tool_calls = if request
            .messages
            .iter()
            .any(|message| matches!(message, Message::Tool { .. }))
        {
            vec![]
        } else {
            self.tool
                .map(|name| ToolCall {
                    id: "provider-id".into(),
                    name: name.into(),
                    arguments: if name == "child" {
                        json!({"prompt":"child query"})
                    } else {
                        json!({})
                    },
                })
                .into_iter()
                .collect()
        };
        Ok(ModelResponse {
            output: "answer".into(),
            tool_calls,
            input_tokens: if self.overrun { 11 } else { 3 },
            output_tokens: 2,
            ..Default::default()
        })
    }
}
fn script(calls: Arc<AtomicUsize>, tool: Option<&'static str>) -> Arc<dyn Model> {
    Arc::new(Script {
        calls,
        tool,
        retry_once: false,
        bound: false,
        overrun: false,
    })
}
struct Effect(Arc<AtomicUsize>);
impl Tool for Effect {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("effect").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        let mut description = ToolDescription::new("effect", "Record one effect");
        description.arguments_schema = Some(json!({"type":"object","additionalProperties":false}));
        description
    }
    async fn run(
        &self,
        _: ToolCallContext,
        _: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        Ok(json!({"count":self.0.fetch_add(1, Ordering::SeqCst)+1}))
    }
}
fn build(model: Arc<dyn Model>, tools: Vec<ToolEntry>) -> Agent {
    let mut components = Components::default();
    components.models.insert("model".into(), model);
    components
        .prompts
        .insert("prompt".into(), Arc::new(StaticPrompt("test".into())));
    let mut catalog = ToolCatalog::new();
    for entry in tools {
        catalog.insert(entry).unwrap();
    }
    components.tool_packs.insert("tools".into(), catalog);
    AgentBuilder::new("governed")
        .model("model")
        .prompt("prompt")
        .tools("tools")
        .compile(&components)
        .unwrap()
}
fn profile(
    store: Arc<dyn BudgetStore>,
    limits: BudgetLimits,
    attempts: u32,
    delay: u64,
) -> Arc<GovernanceProfile> {
    Arc::new(
        GovernanceProfile::new(
            Arc::new(InstalledBudget::install(store, limits, "host-1", attempts).unwrap()),
            BudgetLimits::default(),
            ModelRetryPolicy {
                max_attempts: attempts,
                base_delay_ms: delay,
                max_delay_ms: delay,
            },
        )
        .unwrap(),
    )
}
fn scope(profile: &GovernanceProfile) -> BudgetScope {
    BudgetScope {
        root_run_id: "run".into(),
        identity: profile.identity().into(),
    }
}
fn context() -> RunContext {
    RunContext::new("thread", "run")
}

#[tokio::test]
async fn model_and_tool_limits_stop_real_dispatch_and_preserve_usage() {
    for (model_limit, tool_limit, expected_effects) in [(1, 1, 1), (2, 0, 0)] {
        let ledger = Arc::new(InMemoryBudgetStore::default());
        let profile = profile(
            ledger.clone(),
            BudgetLimits {
                max_model_calls: Some(model_limit),
                max_tool_calls: Some(tool_limit),
                ..Default::default()
            },
            1,
            0,
        );
        let calls = Arc::new(AtomicUsize::new(0));
        let effects = Arc::new(AtomicUsize::new(0));
        let agent = build(
            script(calls.clone(), Some("effect")),
            vec![ToolEntry::typed(Effect(effects.clone()))],
        )
        .with_governance(profile.clone());
        assert!(matches!(
            agent
                .invoke(RunInput::new("query"), context())
                .await
                .unwrap(),
            RunOutcome::BudgetExceeded { .. }
        ));
        assert_eq!(calls.load(Ordering::SeqCst), 1);
        assert_eq!(effects.load(Ordering::SeqCst), expected_effects);
        let summary = ledger.inspect(&scope(&profile)).await.unwrap().unwrap();
        assert_eq!(summary.used.model_calls, 1);
        assert_eq!(summary.used.input_tokens, 3);
        assert_eq!(summary.used.tool_calls, expected_effects as u64);
    }
}
#[tokio::test]
async fn child_inherits_total_model_budget_and_depth_before_invocation() {
    for limits in [
        BudgetLimits {
            max_model_calls: Some(1),
            ..Default::default()
        },
        BudgetLimits {
            max_depth: Some(0),
            ..Default::default()
        },
    ] {
        let ledger = Arc::new(InMemoryBudgetStore::default());
        let profile = profile(ledger.clone(), limits, 1, 0);
        let parent_calls = Arc::new(AtomicUsize::new(0));
        let child_calls = Arc::new(AtomicUsize::new(0));
        let child = build(script(child_calls.clone(), None), vec![]);
        let agent = build(
            script(parent_calls.clone(), Some("child")),
            vec![child.as_tool("child", "child")],
        )
        .with_governance(profile.clone());
        assert!(matches!(
            agent
                .invoke(RunInput::new("query"), context())
                .await
                .unwrap(),
            RunOutcome::BudgetExceeded { .. }
        ));
        assert_eq!(parent_calls.load(Ordering::SeqCst), 1);
        assert_eq!(child_calls.load(Ordering::SeqCst), 0);
        assert_eq!(
            ledger
                .inspect(&scope(&profile))
                .await
                .unwrap()
                .unwrap()
                .used
                .model_calls,
            1
        );
    }
}
#[tokio::test]
async fn unsupported_token_bounds_fail_before_call_and_overrun_blocks_tools() {
    let calls = Arc::new(AtomicUsize::new(0));
    let p = profile(
        Arc::new(InMemoryBudgetStore::default()),
        BudgetLimits {
            max_total_tokens: Some(100),
            ..Default::default()
        },
        1,
        0,
    );
    assert!(matches!(
        build(script(calls.clone(), None), vec![])
            .with_governance(p)
            .invoke(RunInput::new("query"), context())
            .await,
        Err(Error::Composition(_))
    ));
    assert_eq!(calls.load(Ordering::SeqCst), 0);
    let ledger = Arc::new(InMemoryBudgetStore::default());
    let p = profile(
        ledger.clone(),
        BudgetLimits {
            max_total_tokens: Some(100),
            ..Default::default()
        },
        1,
        0,
    );
    let effects = Arc::new(AtomicUsize::new(0));
    let model = Arc::new(Script {
        calls: calls.clone(),
        tool: Some("effect"),
        retry_once: false,
        bound: true,
        overrun: true,
    });
    let agent =
        build(model, vec![ToolEntry::typed(Effect(effects.clone()))]).with_governance(p.clone());
    assert!(matches!(
        agent
            .invoke(RunInput::new("query"), context())
            .await
            .unwrap(),
        RunOutcome::BudgetExceeded { .. }
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 0);
    let summary = ledger.inspect(&scope(&p)).await.unwrap().unwrap();
    assert_eq!(summary.used.input_tokens, 11);
    assert!(summary.blocked.is_some());
}
#[tokio::test]
async fn retries_charge_every_attempt_and_cancel_during_backoff_is_bounded() {
    for cancel in [false, true] {
        let ledger = Arc::new(InMemoryBudgetStore::default());
        let p = profile(
            ledger.clone(),
            BudgetLimits {
                max_model_calls: Some(2),
                ..Default::default()
            },
            2,
            if cancel { 1000 } else { 0 },
        );
        let calls = Arc::new(AtomicUsize::new(0));
        let model = Arc::new(Script {
            calls: calls.clone(),
            tool: None,
            retry_once: true,
            bound: false,
            overrun: false,
        });
        let agent = build(model, vec![]).with_governance(p.clone());
        let ctx = context();
        let cancellation = ctx.cancel.clone();
        let running = tokio::spawn(async move { agent.invoke(RunInput::new("query"), ctx).await });
        if cancel {
            while calls.load(Ordering::SeqCst) == 0 {
                tokio::task::yield_now().await;
            }
            cancellation.cancel();
        }
        let outcome = tokio::time::timeout(std::time::Duration::from_secs(1), running)
            .await
            .unwrap()
            .unwrap()
            .unwrap();
        assert!(if cancel {
            matches!(outcome, RunOutcome::Cancelled { .. })
        } else {
            matches!(outcome, RunOutcome::Completed { .. })
        });
        let expected = if cancel { 1 } else { 2 };
        assert_eq!(calls.load(Ordering::SeqCst), expected);
        assert_eq!(
            ledger
                .inspect(&scope(&p))
                .await
                .unwrap()
                .unwrap()
                .used
                .model_calls,
            expected as u64
        );
    }
}
struct WaitingSource;
#[async_trait::async_trait]
impl memory::ContextSource for WaitingSource {
    async fn contribute(&self, _: &RunState, _: &RunContext) -> Result<Vec<Message>, Error> {
        std::future::pending().await
    }
}
#[tokio::test]
async fn deadline_includes_waiting_for_context_resources() {
    // Use the public builder to install a source; no private timer access.
    let mut components = Components::default();
    components
        .models
        .insert("m".into(), script(Arc::new(AtomicUsize::new(0)), None));
    components
        .prompts
        .insert("p".into(), Arc::new(StaticPrompt("test".into())));
    components
        .context_sources
        .insert("wait".into(), Arc::new(WaitingSource));
    let p = profile(
        Arc::new(InMemoryBudgetStore::default()),
        BudgetLimits {
            max_duration_ms: Some(30),
            ..Default::default()
        },
        1,
        0,
    );
    let agent = AgentBuilder::new("waiting")
        .model("m")
        .prompt("p")
        .context_source("wait")
        .compile(&components)
        .unwrap()
        .with_governance(p);
    let outcome = tokio::time::timeout(
        std::time::Duration::from_secs(1),
        agent.invoke(RunInput::new("query"), context()),
    )
    .await
    .unwrap()
    .unwrap();
    assert!(matches!(outcome, RunOutcome::BudgetExceeded {state} if state.messages.len()==2));
}

#[path = "governance_runtime/recovery.rs"]
mod recovery;
