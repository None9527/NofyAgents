use nofy_agent_runtime::{
    recipe::{policies::*, *},
    *,
};
use nofy_tool_runtime::{Tool, ToolCallContext};
use nofy_tool_types::ToolDescription;
use serde_json::{Value, json};
use std::sync::{
    Arc,
    atomic::{AtomicBool, AtomicUsize, Ordering},
};

struct Repeat(Arc<AtomicUsize>);
#[async_trait::async_trait]
impl Model for Repeat {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        let n = self.0.fetch_add(1, Ordering::SeqCst);
        Ok(ModelResponse {
            tool_calls: vec![ToolCall {
                id: format!("effect-{n}"),
                name: "effect".into(),
                arguments: json!({}),
            }],
            ..Default::default()
        })
    }
}
struct Effect(Arc<AtomicUsize>);
impl Tool for Effect {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("effect").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        let mut d = ToolDescription::new("effect", "one effect");
        d.arguments_schema = Some(json!({"type":"object"}));
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
fn agent(
    model: Arc<dyn Model>,
    tools: Vec<ToolEntry>,
    stage: Arc<dyn AgentStage>,
    at: Boundary,
) -> Agent {
    let mut c = Components::default();
    c.models.insert("m".into(), model);
    c.prompts
        .insert("p".into(), Arc::new(StaticPrompt("test".into())));
    let mut t = ToolCatalog::new();
    for entry in tools {
        t.insert(entry).unwrap();
    }
    c.tool_packs.insert("t".into(), t);
    let name = if at == Boundary::BeforeStop {
        "length"
    } else {
        "repeat"
    };
    let recipe = Arc::new(
        RuntimeRecipe::new(
            "policy-1",
            vec![StageBinding {
                name: name.into(),
                at,
                stage,
            }],
        )
        .unwrap(),
    );
    AgentBuilder::new("policy")
        .model("m")
        .prompt("p")
        .tools("t")
        .compile(&c)
        .unwrap()
        .with_recipe(recipe)
        .unwrap()
}
fn context() -> RunContext {
    RunContext::new("thread", "run")
}
#[tokio::test]
async fn repeat_policy_uses_actual_results_and_persists_nudge_and_hard_stop() {
    let calls = Arc::new(AtomicUsize::new(0));
    let effects = Arc::new(AtomicUsize::new(0));
    let policy = Arc::new(
        RepeatStage::new(RepeatConfig {
            problematic_tools: ["effect".into()].into(),
            ..Default::default()
        })
        .unwrap(),
    );
    let agent = agent(
        Arc::new(Repeat(calls.clone())),
        vec![ToolEntry::typed(Effect(effects.clone()))],
        policy,
        Boundary::AfterTool,
    )
    .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    let RunOutcome::BudgetExceeded { state } =
        agent.invoke(RunInput::new("go"), context()).await.unwrap()
    else {
        panic!("repeat hard stop")
    };
    assert_eq!(effects.load(Ordering::SeqCst), 8);
    assert_eq!(calls.load(Ordering::SeqCst), 8);
    assert_eq!(
        state.recipe_progress.stage_data("repeat").unwrap()["run_len"],
        8
    );
    assert!(state.recipe_progress.limit_reason().is_some());
    assert_eq!(state.messages.iter().filter(|message|matches!(message,Message::User {content} if content.contains("has repeated the same action"))).count(),1);
    assert!(matches!(
        agent.invoke(RunInput::resume(), context()).await.unwrap(),
        RunOutcome::BudgetExceeded { .. }
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 8);
}
struct LengthModel {
    calls: Arc<AtomicUsize>,
    piece: String,
    always_length: bool,
    structured: bool,
}
#[async_trait::async_trait]
impl Model for LengthModel {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        let n = self.calls.fetch_add(1, Ordering::SeqCst);
        Ok(ModelResponse {
            output: if n < 2 {
                self.piece.clone()
            } else {
                "done".into()
            },
            info: CompletionInfo {
                stop_reason: Some(
                    if self.always_length || n < 2 {
                        "length"
                    } else {
                        "stop"
                    }
                    .into(),
                ),
                structured_output: self.structured.then(|| json!({"done":true})),
                ..Default::default()
            },
            ..Default::default()
        })
    }
}
struct FailBufferCommit {
    inner: InMemoryCheckpointer,
    failed: AtomicBool,
}
#[async_trait::async_trait]
impl Checkpointer for FailBufferCommit {
    async fn load(&self, key: &str) -> Result<Option<Checkpoint>, Error> {
        self.inner.load(key).await
    }
    async fn save(&self, key: &str, expected: Option<u64>, row: Checkpoint) -> Result<(), Error> {
        if row.state.recipe_progress.text_buffer("length").is_some()
            && !self.failed.swap(true, Ordering::SeqCst)
        {
            return Err(Error::Checkpoint("lost text buffer commit".into()));
        }
        self.inner.save(key, expected, row).await
    }
}
#[tokio::test]
async fn length_policy_accumulates_real_text_and_restores_without_duplicate_prefixes() {
    let calls = Arc::new(AtomicUsize::new(0));
    let piece = "part ".repeat(8000);
    let agent = agent(
        Arc::new(LengthModel {
            calls: calls.clone(),
            piece: piece.clone(),
            always_length: false,
            structured: false,
        }),
        vec![],
        Arc::new(LengthStage::new(LengthConfig::default()).unwrap()),
        Boundary::BeforeStop,
    )
    .with_checkpointer(Arc::new(FailBufferCommit {
        inner: Default::default(),
        failed: AtomicBool::new(false),
    }));
    assert!(matches!(
        agent.invoke(RunInput::new("go"), context()).await,
        Err(Error::Checkpoint(_))
    ));
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    let RunOutcome::Completed { output, state } =
        agent.invoke(RunInput::resume(), context()).await.unwrap()
    else {
        panic!("completed")
    };
    assert_eq!(calls.load(Ordering::SeqCst), 3);
    assert_eq!(output, format!("{piece}{piece}done"));
    assert_eq!(state.completion_info.stop_reason.as_deref(), Some("stop"));
    assert!(state.recipe_progress.text_buffer("length").is_none());
    assert_eq!(state.messages.iter().filter(|message|matches!(message,Message::User {content} if content==nofy_agent_runtime::coding::length::LENGTH_CONTINUE_REMINDER_BODY)).count(),1);
}
#[tokio::test]
async fn length_exhaustion_keeps_truncated_status_and_never_rewrites_structured_output() {
    for structured in [false, true] {
        let calls = Arc::new(AtomicUsize::new(0));
        let agent = agent(
            Arc::new(LengthModel {
                calls: calls.clone(),
                piece: "part".into(),
                always_length: true,
                structured,
            }),
            vec![],
            Arc::new(
                LengthStage::new(LengthConfig {
                    max_continues: 1,
                    ..Default::default()
                })
                .unwrap(),
            ),
            Boundary::BeforeStop,
        );
        let RunOutcome::Completed { output, state } =
            agent.invoke(RunInput::new("go"), context()).await.unwrap()
        else {
            panic!("completed")
        };
        assert_eq!(calls.load(Ordering::SeqCst), if structured { 1 } else { 2 });
        assert_eq!(output, if structured { "part" } else { "partpart" });
        assert_eq!(state.completion_info.stop_reason.as_deref(), Some("length"));
        assert_eq!(
            state.completion_info.structured_output.is_some(),
            structured
        );
    }
}
#[tokio::test]
async fn text_accumulation_bound_fails_without_claiming_a_complete_answer() {
    let calls = Arc::new(AtomicUsize::new(0));
    let agent = agent(
        Arc::new(LengthModel {
            calls: calls.clone(),
            piece: "123456".into(),
            always_length: true,
            structured: false,
        }),
        vec![],
        Arc::new(
            LengthStage::new(LengthConfig {
                max_continues: 2,
                max_accumulated_bytes: 10,
            })
            .unwrap(),
        ),
        Boundary::BeforeStop,
    );
    assert!(
        matches!(agent.invoke(RunInput::new("go"),context()).await,Err(Error::Composition(message)) if message.contains("byte limit"))
    );
    assert_eq!(calls.load(Ordering::SeqCst), 2);
}
