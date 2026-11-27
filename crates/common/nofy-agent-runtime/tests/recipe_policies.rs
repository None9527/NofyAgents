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

struct CountingPolicy(Arc<AtomicUsize>);
#[async_trait::async_trait]
impl Policy for CountingPolicy {
    async fn admit(&self, _: &ToolCall, _: &RunState, _: &RunContext) -> Result<Admission, Error> {
        self.0.fetch_add(1, Ordering::SeqCst);
        Ok(Admission::Allow)
    }
}

struct StrictSchemaTool {
    calls: Arc<AtomicUsize>,
    seen: Arc<std::sync::Mutex<Vec<Value>>>,
}
impl Tool for StrictSchemaTool {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("submit").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        let mut d = ToolDescription::new("submit", "typed payload submit");
        d.arguments_schema = Some(json!({
            "type": "object",
            "required": ["payload"],
            "additionalProperties": false,
            "properties": {
                "payload": {
                    "type": "object",
                    "required": ["id"],
                    "additionalProperties": false,
                    "properties": {
                        "id": {"type": "integer"},
                        "note": {"type": "string"}
                    }
                },
                "tags": {
                    "type": "array",
                    "items": {"type": "string"}
                }
            }
        }));
        d
    }
    async fn run(
        &self,
        _: ToolCallContext,
        args: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        self.calls.fetch_add(1, Ordering::SeqCst);
        self.seen.lock().unwrap().push(args.clone());
        Ok(json!({"accepted": args}))
    }
}

struct SelfCorrectingMalformedModel(Arc<AtomicUsize>);
#[async_trait::async_trait]
impl Model for SelfCorrectingMalformedModel {
    async fn complete(&self, req: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        let turn = self.0.fetch_add(1, Ordering::SeqCst);
        if turn == 0 {
            let mut malformed = std::collections::BTreeMap::new();
            malformed.insert(
                "bad-1".into(),
                ToolCallParseError {
                    message: "EOF while parsing an object".into(),
                    line: Some(1),
                    column: Some(15),
                    raw_excerpt: Some("{\"payload\":{\"id\"".into()),
                },
            );
            return Ok(ModelResponse {
                tool_calls: vec![ToolCall {
                    id: "bad-1".into(),
                    name: "submit".into(),
                    arguments: json!({}),
                }],
                malformed_tool_calls: malformed,
                ..Default::default()
            });
        }
        if turn == 1 {
            let tool_msg = req
                .messages
                .iter()
                .rev()
                .find_map(|m| match m {
                    Message::Tool {
                        content,
                        is_error: true,
                        ..
                    } => Some(content.to_string()),
                    _ => None,
                })
                .expect("malformed parse feedback");
            assert!(tool_msg.contains("malformed tool arguments for submit"));
            assert!(tool_msg.contains("(line 1, column 15)"));
            assert!(tool_msg.contains("{\\\"payload\\\":{\\\"id\\\""));
            return Ok(ModelResponse {
                tool_calls: vec![ToolCall {
                    id: "ok-2".into(),
                    name: "submit".into(),
                    arguments: json!({"payload": {"id": 42}}),
                }],
                ..Default::default()
            });
        }
        Ok(ModelResponse {
            output: "recovered".into(),
            ..Default::default()
        })
    }
}

#[tokio::test]
async fn malformed_tool_call_short_circuits_before_policy_and_exec_then_self_corrects() {
    let model_calls = Arc::new(AtomicUsize::new(0));
    let policy_hits = Arc::new(AtomicUsize::new(0));
    let tool_hits = Arc::new(AtomicUsize::new(0));
    let seen = Arc::new(std::sync::Mutex::new(Vec::new()));
    let mut c = Components::default();
    c.models.insert(
        "m".into(),
        Arc::new(SelfCorrectingMalformedModel(model_calls.clone())),
    );
    c.prompts
        .insert("p".into(), Arc::new(StaticPrompt("test".into())));
    let mut t = ToolCatalog::new();
    t.insert(ToolEntry::typed(StrictSchemaTool {
        calls: tool_hits.clone(),
        seen: seen.clone(),
    }))
    .unwrap();
    c.tool_packs.insert("t".into(), t);
    c.policies
        .insert("pol".into(), Arc::new(CountingPolicy(policy_hits.clone())));
    let agent = AgentBuilder::new("malformed-test")
        .model("m")
        .prompt("p")
        .tools("t")
        .policy("pol")
        .compile(&c)
        .unwrap();

    let RunOutcome::Completed { output, .. } =
        agent.invoke(RunInput::new("go"), context()).await.unwrap()
    else {
        panic!("expected recovery completion")
    };
    assert_eq!(output, "recovered");
    assert_eq!(model_calls.load(Ordering::SeqCst), 3);
    // Policy and tool were skipped on bad-1 and invoked only on ok-2.
    assert_eq!(policy_hits.load(Ordering::SeqCst), 1);
    assert_eq!(tool_hits.load(Ordering::SeqCst), 1);
    assert_eq!(seen.lock().unwrap()[0], json!({"payload": {"id": 42}}));
}

struct SequenceToolModel {
    calls: Arc<AtomicUsize>,
    payloads: Vec<Value>,
}
#[async_trait::async_trait]
impl Model for SequenceToolModel {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        let idx = self.calls.fetch_add(1, Ordering::SeqCst);
        if let Some(args) = self.payloads.get(idx) {
            return Ok(ModelResponse {
                tool_calls: vec![ToolCall {
                    id: format!("call-{idx}"),
                    name: "submit".into(),
                    arguments: args.clone(),
                }],
                ..Default::default()
            });
        }
        Ok(ModelResponse {
            output: "done".into(),
            ..Default::default()
        })
    }
}

#[tokio::test]
async fn safe_tool_argument_coercion_drops_optional_null_unwraps_containers_and_reports_unwrapped_errors()
 {
    for mode in [ToolArgumentCoercion::Strict, ToolArgumentCoercion::Safe] {
        let model_calls = Arc::new(AtomicUsize::new(0));
        let tool_hits = Arc::new(AtomicUsize::new(0));
        let seen = Arc::new(std::sync::Mutex::new(Vec::new()));
        let mut c = Components::default();
        c.models.insert(
            "m".into(),
            Arc::new(SequenceToolModel {
                calls: model_calls.clone(),
                payloads: vec![
                    // 1. Optional nulls + double-encoded object string.
                    json!({"payload": "{\"id\":7,\"note\":null}", "tags": null}),
                    // 2. Double-encoded object string with nested type error (/payload/id).
                    json!({"payload": "{\"id\":\"bad-int\"}"}),
                ],
            }),
        );
        c.prompts
            .insert("p".into(), Arc::new(StaticPrompt("test".into())));
        let mut t = ToolCatalog::new();
        t.insert(ToolEntry::typed(StrictSchemaTool {
            calls: tool_hits.clone(),
            seen: seen.clone(),
        }))
        .unwrap();
        c.tool_packs.insert("t".into(), t);
        let agent = AgentBuilder::new("coerce-test")
            .model("m")
            .prompt("p")
            .tools("t")
            .settings(Settings {
                tool_argument_coercion: mode,
                ..Default::default()
            })
            .compile(&c)
            .unwrap();

        let RunOutcome::Completed { state, .. } =
            agent.invoke(RunInput::new("go"), context()).await.unwrap()
        else {
            panic!("expected completion")
        };

        let tool_msgs: Vec<(&Value, bool)> = state
            .messages
            .iter()
            .filter_map(|m| match m {
                Message::Tool {
                    content, is_error, ..
                } => Some((content, *is_error)),
                _ => None,
            })
            .collect();
        assert_eq!(tool_msgs.len(), 2);

        if mode == ToolArgumentCoercion::Strict {
            assert_eq!(tool_hits.load(Ordering::SeqCst), 0);
            assert!(tool_msgs[0].1);
            assert!(tool_msgs[1].1);
        } else {
            assert_eq!(tool_hits.load(Ordering::SeqCst), 1);
            assert!(!tool_msgs[0].1);
            assert_eq!(seen.lock().unwrap()[0], json!({"payload": {"id": 7}}));
            assert!(tool_msgs[1].1);
            let err2 = tool_msgs[1].0["error"].as_str().unwrap();
            assert!(
                err2.contains("/payload/id"),
                "expected unwrapped nested path /payload/id, got: {err2}"
            );
        }
    }
}

struct VaryingMalformedModel(Arc<AtomicUsize>);
#[async_trait::async_trait]
impl Model for VaryingMalformedModel {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        let n = self.0.fetch_add(1, Ordering::SeqCst);
        let id = format!("mal-{n}");
        let mut malformed = std::collections::BTreeMap::new();
        malformed.insert(
            id.clone(),
            ToolCallParseError {
                message: format!("syntax error variant {n}"),
                line: Some(1),
                column: Some((n + 2) as u64),
                raw_excerpt: Some(format!("{{\"x\":{n}")),
            },
        );
        Ok(ModelResponse {
            tool_calls: vec![ToolCall {
                id,
                name: "effect".into(),
                arguments: json!({"variant": n}),
            }],
            malformed_tool_calls: malformed,
            ..Default::default()
        })
    }
}

#[tokio::test]
async fn consecutive_malformed_tool_calls_trip_repeat_circuit_breaker() {
    let model_calls = Arc::new(AtomicUsize::new(0));
    let effects = Arc::new(AtomicUsize::new(0));
    let policy = Arc::new(
        RepeatStage::new(RepeatConfig {
            max_consecutive_malformed: Some(3),
            ..Default::default()
        })
        .unwrap(),
    );
    let agent = agent(
        Arc::new(VaryingMalformedModel(model_calls.clone())),
        vec![ToolEntry::typed(Effect(effects.clone()))],
        policy,
        Boundary::AfterTool,
    )
    .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));

    let RunOutcome::BudgetExceeded { state } =
        agent.invoke(RunInput::new("go"), context()).await.unwrap()
    else {
        panic!("expected consecutive malformed circuit breaker stop")
    };
    assert_eq!(effects.load(Ordering::SeqCst), 0);
    assert_eq!(model_calls.load(Ordering::SeqCst), 3);
    assert_eq!(
        state.recipe_progress.stage_data("repeat").unwrap()["consecutive_malformed"],
        3
    );
    assert!(
        state
            .recipe_progress
            .limit_reason()
            .unwrap()
            .contains("consecutive malformed tool calls")
    );
}
