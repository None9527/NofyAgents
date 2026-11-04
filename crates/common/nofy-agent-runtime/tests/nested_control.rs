use nofy_agent_runtime::*;
use nofy_tool_runtime::{Tool, ToolCallContext};
use nofy_tool_types::ToolDescription;
use serde_json::{Value, json};
use std::sync::{
    Arc,
    atomic::{AtomicBool, AtomicUsize, Ordering},
};

#[cfg(feature = "workflow")]
#[path = "support/workflow_contract.rs"]
mod workflow_graph_contract;

struct Counter(Arc<AtomicUsize>);
impl Tool for Counter {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("effect").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        let mut d = ToolDescription::new("effect", "Count one real side effect");
        d.arguments_schema = Some(json!({"type":"object","additionalProperties":false}));
        d
    }
    async fn run(
        &self,
        _: ToolCallContext,
        _: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        Ok(json!({"count":self.0.fetch_add(1,Ordering::SeqCst)+1}))
    }
}
struct Calls {
    tool: &'static str,
    count: Arc<AtomicUsize>,
}
#[async_trait::async_trait]
impl Model for Calls {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.count.fetch_add(1, Ordering::SeqCst);
        Ok(
            if let Some(Message::Tool { content, .. }) = request.messages.last() {
                ModelResponse {
                    output: content.to_string(),
                    ..Default::default()
                }
            } else {
                ModelResponse {
                    tool_calls: vec![ToolCall {
                        id: "same-provider-id".into(),
                        name: self.tool.into(),
                        arguments: if self.tool == "child" {
                            json!({"prompt":"query"})
                        } else {
                            json!({})
                        },
                    }],
                    ..Default::default()
                }
            },
        )
    }
}
struct Gate(Arc<AtomicBool>);
#[async_trait::async_trait]
impl Policy for Gate {
    async fn admit(
        &self,
        call: &ToolCall,
        _: &RunState,
        _: &RunContext,
    ) -> Result<Admission, Error> {
        Ok(if self.0.load(Ordering::SeqCst) {
            Admission::Allow
        } else {
            Admission::Pause(json!({"approve":call.id}))
        })
    }
}

fn parent(
    store: Arc<dyn Checkpointer>,
    approved: Arc<AtomicBool>,
    effects: Arc<AtomicUsize>,
    parent_calls: Arc<AtomicUsize>,
    child_calls: Arc<AtomicUsize>,
    child_budget: usize,
) -> Agent {
    let mut c = Components::default();
    c.models.insert(
        "parent".into(),
        Arc::new(Calls {
            tool: "child",
            count: parent_calls,
        }),
    );
    c.models.insert(
        "child".into(),
        Arc::new(Calls {
            tool: "effect",
            count: child_calls,
        }),
    );
    c.prompts.insert(
        "prompt".into(),
        Arc::new(StaticPrompt("testing nested control".into())),
    );
    c.policies
        .insert("approval".into(), Arc::new(Gate(approved)));
    let mut tools = ToolCatalog::new();
    tools.insert(ToolEntry::typed(Counter(effects))).unwrap();
    c.tool_packs.insert("effects".into(), tools);
    let child = AgentBuilder::new("child")
        .model("child")
        .prompt("prompt")
        .tools("effects")
        .policy("approval")
        .settings(Settings {
            max_steps: child_budget,
            ..Default::default()
        })
        .compile(&c)
        .unwrap();
    let mut delegation = ToolCatalog::new();
    delegation
        .insert(child.as_tool("child", "Invoke child"))
        .unwrap();
    c.tool_packs.insert("delegation".into(), delegation);
    AgentBuilder::new("parent")
        .model("parent")
        .prompt("prompt")
        .tools("delegation")
        .compile(&c)
        .unwrap()
        .with_checkpointer(store)
}

#[tokio::test]
async fn child_approval_reaches_parent_and_resume_does_not_resample_or_repeat_effects() {
    let store = Arc::new(InMemoryCheckpointer::default());
    let approved = Arc::new(AtomicBool::new(false));
    let effects = Arc::new(AtomicUsize::new(0));
    let p = Arc::new(AtomicUsize::new(0));
    let c = Arc::new(AtomicUsize::new(0));
    let agent = parent(
        store.clone(),
        approved.clone(),
        effects.clone(),
        p.clone(),
        c.clone(),
        8,
    );
    let context = || RunContext::new("thread", "run1");
    let paused = agent
        .invoke(RunInput::new("query"), context())
        .await
        .unwrap();
    assert!(matches!(paused,RunOutcome::Paused {ref reason,..} if reason["kind"]=="child_paused"));
    assert_eq!(effects.load(Ordering::SeqCst), 0);
    assert_eq!(p.load(Ordering::SeqCst), 1);
    assert_eq!(c.load(Ordering::SeqCst), 1);
    approved.store(true, Ordering::SeqCst);
    // Rebuild both agents to prove continuation uses the parent's checkpointer,
    // rather than hidden state in the original dispatcher instance.
    let rebuilt = parent(store, approved, effects.clone(), p.clone(), c.clone(), 8);
    assert!(matches!(
        rebuilt.invoke(RunInput::resume(), context()).await.unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    assert_eq!(p.load(Ordering::SeqCst), 2);
    assert_eq!(c.load(Ordering::SeqCst), 2);
    assert!(matches!(
        rebuilt.invoke(RunInput::resume(), context()).await.unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 1);
}

struct LoseParentResult {
    inner: InMemoryCheckpointer,
    fail: AtomicBool,
}
#[async_trait::async_trait]
impl Checkpointer for LoseParentResult {
    async fn load(&self, key: &str) -> Result<Option<Checkpoint>, Error> {
        self.inner.load(key).await
    }
    async fn save(
        &self,
        key: &str,
        expected: Option<u64>,
        checkpoint: Checkpoint,
    ) -> Result<(), Error> {
        if key.starts_with("6:parent")
            && matches!(checkpoint.state.messages.last(), Some(Message::Tool { .. }))
            && checkpoint.state.in_flight.is_none()
            && self.fail.swap(false, Ordering::SeqCst)
        {
            return Err(Error::Checkpoint("simulated lost parent result".into()));
        }
        self.inner.save(key, expected, checkpoint).await
    }
}

#[tokio::test]
async fn child_result_can_be_reattached_after_parent_commit_fails() {
    let store = Arc::new(LoseParentResult {
        inner: InMemoryCheckpointer::default(),
        fail: AtomicBool::new(true),
    });
    let effects = Arc::new(AtomicUsize::new(0));
    let p = Arc::new(AtomicUsize::new(0));
    let c = Arc::new(AtomicUsize::new(0));
    let agent = parent(
        store,
        Arc::new(AtomicBool::new(true)),
        effects.clone(),
        p,
        c.clone(),
        8,
    );
    assert!(
        agent
            .invoke(RunInput::new("query"), RunContext::new("thread", "run"))
            .await
            .is_err()
    );
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    assert_eq!(c.load(Ordering::SeqCst), 2);
    assert!(matches!(
        agent
            .invoke(RunInput::resume(), RunContext::new("thread", "run"))
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    assert_eq!(c.load(Ordering::SeqCst), 2);
}

#[tokio::test]
async fn child_budget_exhaustion_is_control_not_a_model_facing_tool_error() {
    let effects = Arc::new(AtomicUsize::new(0));
    let p = Arc::new(AtomicUsize::new(0));
    let agent = parent(
        Arc::new(InMemoryCheckpointer::default()),
        Arc::new(AtomicBool::new(true)),
        effects.clone(),
        p.clone(),
        Arc::new(AtomicUsize::new(0)),
        1,
    );
    assert!(matches!(
        agent
            .invoke(RunInput::new("query"), RunContext::new("thread", "run"))
            .await
            .unwrap(),
        RunOutcome::BudgetExceeded { .. }
    ));
    assert_eq!(p.load(Ordering::SeqCst), 1);
    assert_eq!(effects.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn typed_sequence_resumes_the_paused_stage_and_does_not_repeat_completed_stages() {
    let store = Arc::new(InMemoryCheckpointer::default());
    let approved = Arc::new(AtomicBool::new(false));
    let effects = Arc::new(AtomicUsize::new(0));
    let agent = parent(
        store.clone(),
        approved.clone(),
        effects.clone(),
        Arc::new(AtomicUsize::new(0)),
        Arc::new(AtomicUsize::new(0)),
        8,
    );
    let sequence =
        nofy_agent_runtime::composition::sequence_agent("sequence", &[agent.clone(), agent])
            .unwrap()
            .with_checkpointer(store);
    assert!(matches!(
        sequence
            .invoke(RunInput::new("query"), RunContext::new("thread", "run"))
            .await
            .unwrap(),
        RunOutcome::Paused { .. }
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 0);
    approved.store(true, Ordering::SeqCst);
    assert!(matches!(
        sequence
            .invoke(RunInput::resume(), RunContext::new("thread", "run"))
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 2);
    sequence
        .invoke(RunInput::resume(), RunContext::new("thread", "run"))
        .await
        .unwrap();
    assert_eq!(effects.load(Ordering::SeqCst), 2);
}

#[cfg(feature = "workflow")]
#[tokio::test]
async fn declarative_sequential_and_parallel_graphs_preserve_pause_resume_and_effects() {
    for sequential in [true, false] {
        let store = Arc::new(InMemoryCheckpointer::default());
        let approved = Arc::new(AtomicBool::new(false));
        let effects = Arc::new(AtomicUsize::new(0));
        let agent = parent(
            store.clone(),
            approved.clone(),
            effects.clone(),
            Arc::new(AtomicUsize::new(0)),
            Arc::new(AtomicUsize::new(0)),
            8,
        );
        let context = || RunContext::new("workflow-thread", "workflow-run");
        let graph = workflow_graph_contract::compiled(agent.clone(), &["one", "two"], sequential)
            .with_checkpointer(store.clone());
        let paused = graph
            .invoke(json!({}), RunInput::default(), context())
            .await
            .unwrap();
        assert!(matches!(paused, RunOutcome::Paused { .. }));
        assert_eq!(effects.load(Ordering::SeqCst), 0);
        let changed = workflow_graph_contract::compiled(agent, &["one", "different"], sequential)
            .with_checkpointer(store);
        let rejected = changed
            .invoke(json!({}), RunInput::resume(), context())
            .await;
        assert!(matches!(rejected, Err(Error::Checkpoint(_))));
        assert_eq!(effects.load(Ordering::SeqCst), 0);
        approved.store(true, Ordering::SeqCst);
        for _ in 0..2 {
            let outcome = graph
                .invoke(json!({}), RunInput::resume(), context())
                .await
                .unwrap();
            assert!(matches!(outcome, RunOutcome::Completed { .. }));
            assert_eq!(effects.load(Ordering::SeqCst), 2);
        }
    }
}
