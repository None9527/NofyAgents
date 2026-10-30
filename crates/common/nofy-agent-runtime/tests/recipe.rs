use nofy_agent_runtime::{recipe::*, registry::*, *};
use nofy_tool_runtime::{Tool, ToolCallContext};
use nofy_tool_types::ToolDescription;
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    sync::{
        Arc,
        atomic::{AtomicBool, AtomicUsize, Ordering},
    },
};

struct Calls(Arc<AtomicUsize>);
#[async_trait::async_trait]
impl Model for Calls {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.0.fetch_add(1, Ordering::SeqCst);
        Ok(
            if request
                .messages
                .iter()
                .any(|message| matches!(message, Message::Tool { .. }))
            {
                ModelResponse {
                    output: "done".into(),
                    ..Default::default()
                }
            } else {
                ModelResponse {
                    tool_calls: vec![ToolCall {
                        id: "effect-1".into(),
                        name: "effect".into(),
                        arguments: json!({}),
                    }],
                    ..Default::default()
                }
            },
        )
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
fn agent(calls: Arc<AtomicUsize>, effects: Arc<AtomicUsize>) -> Agent {
    let mut components = Components::default();
    components.models.insert("m".into(), Arc::new(Calls(calls)));
    components
        .prompts
        .insert("p".into(), Arc::new(StaticPrompt("test".into())));
    let mut catalog = ToolCatalog::new();
    catalog.insert(ToolEntry::typed(Effect(effects))).unwrap();
    components.tool_packs.insert("t".into(), catalog);
    AgentBuilder::new("recipe")
        .model("m")
        .prompt("p")
        .tools("t")
        .compile(&components)
        .unwrap()
}
fn context() -> RunContext {
    RunContext::new("thread", "run")
}
struct AwaitApproval;
#[async_trait::async_trait]
impl AgentStage for AwaitApproval {
    fn evaluate(&self, _: &StageInput<'_>, context: &RunContext) -> Result<StageEffect, Error> {
        Ok(StageEffect {
            action: if context
                .capabilities
                .get::<bool>()
                .is_some_and(|approved| *approved)
            {
                StageAction::Next
            } else {
                StageAction::Pause {
                    reason: json!({"kind":"stage_approval"}),
                }
            },
            ..Default::default()
        })
    }
}
#[tokio::test]
async fn pure_stage_pause_resumes_at_the_same_boundary_before_actual_dispatch() {
    let calls = Arc::new(AtomicUsize::new(0));
    let effects = Arc::new(AtomicUsize::new(0));
    let recipe = Arc::new(
        RuntimeRecipe::new(
            "approval-1",
            vec![StageBinding {
                name: "approval".into(),
                at: Boundary::BeforeTool,
                stage: Arc::new(AwaitApproval),
            }],
        )
        .unwrap(),
    );
    let agent = agent(calls.clone(), effects.clone())
        .with_recipe(recipe)
        .unwrap()
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    assert!(
        matches!(agent.invoke(RunInput::new("go"),context()).await.unwrap(),RunOutcome::Paused {reason,..} if reason["kind"]=="stage_approval")
    );
    assert_eq!(effects.load(Ordering::SeqCst), 0);
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    assert!(matches!(
        agent
            .invoke(RunInput::resume(), RunContext::new("thread", "wrong-run"))
            .await,
        Err(Error::Checkpoint(_))
    ));
    let mut context = context();
    context.capabilities.insert(true);
    assert!(matches!(
        agent.invoke(RunInput::resume(), context).await.unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    assert_eq!(calls.load(Ordering::SeqCst), 2);
}
struct Observe;
impl AgentStage for Observe {
    fn supports(&self, boundary: Boundary) -> bool {
        boundary == Boundary::AfterTool
    }
    fn evaluate(&self, input: &StageInput<'_>, _: &RunContext) -> Result<StageEffect, Error> {
        let result = input.result.expect("after_tool result");
        assert!(!result.is_error);
        assert_eq!(input.call.unwrap().name, "effect");
        Ok(StageEffect {
            data: Some(
                json!({"applications":input.data["applications"].as_u64().unwrap_or(0)+1,"result":result.content}),
            ),
            action: StageAction::Feedback {
                content: "continue with the verified tool result".into(),
            },
        })
    }
}
struct FailStageCommit {
    inner: InMemoryCheckpointer,
    failed: AtomicBool,
}
#[async_trait::async_trait]
impl Checkpointer for FailStageCommit {
    async fn load(&self, key: &str) -> Result<Option<Checkpoint>, Error> {
        self.inner.load(key).await
    }
    async fn save(&self, key: &str, expected: Option<u64>, row: Checkpoint) -> Result<(), Error> {
        if row.state.recipe_progress.stage_data("observe").is_some()
            && !self.failed.swap(true, Ordering::SeqCst)
        {
            return Err(Error::Checkpoint("simulated lost stage commit".into()));
        }
        self.inner.save(key, expected, row).await
    }
}
#[tokio::test]
async fn after_tool_stage_survives_result_commit_and_its_effect_is_applied_once() {
    let calls = Arc::new(AtomicUsize::new(0));
    let effects = Arc::new(AtomicUsize::new(0));
    let recipe = Arc::new(
        RuntimeRecipe::new(
            "observe-1",
            vec![StageBinding {
                name: "observe".into(),
                at: Boundary::AfterTool,
                stage: Arc::new(Observe),
            }],
        )
        .unwrap(),
    );
    let agent = agent(calls.clone(), effects.clone())
        .with_recipe(recipe)
        .unwrap()
        .with_checkpointer(Arc::new(FailStageCommit {
            inner: Default::default(),
            failed: AtomicBool::new(false),
        }));
    assert!(matches!(
        agent.invoke(RunInput::new("go"), context()).await,
        Err(Error::Checkpoint(_))
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    let RunOutcome::Completed { state, .. } =
        agent.invoke(RunInput::resume(), context()).await.unwrap()
    else {
        panic!("completed")
    };
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    assert_eq!(calls.load(Ordering::SeqCst), 2);
    assert_eq!(
        state.recipe_progress.stage_data("observe").unwrap()["applications"],
        1
    );
    let result_index = state
        .messages
        .iter()
        .position(|message| matches!(message, Message::Tool { .. }))
        .unwrap();
    assert!(
        matches!(&state.messages[result_index+1],Message::User {content} if content=="continue with the verified tool result")
    );
}
#[test]
fn recipe_configuration_resolves_arbitrary_declared_stage_dependencies_before_build() {
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(LiteralStageFactory))
        .unwrap();
    registry.register_factory(Arc::new(RecipeFactory)).unwrap();
    for (id, factory, config, deps) in [
        (
            "first",
            "stage.literal",
            json!({"data":{"step":1}}),
            BTreeMap::new(),
        ),
        (
            "second",
            "stage.literal",
            json!({"data":{"step":2}}),
            BTreeMap::new(),
        ),
        (
            "recipe",
            "runtime.recipe",
            json!({"stages":[{"name":"one","at":"before_model","stage":"a"},{"name":"two","at":"before_model","stage":"b"}]}),
            BTreeMap::from([
                ("a".into(), ModuleRef::new("first", "1")),
                ("b".into(), ModuleRef::new("second", "1")),
            ]),
        ),
    ] {
        registry
            .define(ModuleDefinition {
                reference: ModuleRef::new(id, "1"),
                factory: factory.into(),
                config,
                dependencies: deps,
            })
            .unwrap();
    }
    let expected=registry.required_dependencies("runtime.recipe",&json!({"stages":[{"name":"one","at":"before_model","stage":"a"},{"name":"two","at":"before_model","stage":"b"}]})).unwrap();
    assert_eq!(
        expected,
        BTreeMap::from([
            ("a".into(), ModuleKind::Stage),
            ("b".into(), ModuleKind::Stage)
        ])
    );
    assert!(
        registry
            .resolve_typed(&[(ModuleRef::new("recipe", "1"), ModuleKind::Recipe)])
            .is_ok()
    );
    assert!(
        RecipeFactory
            .build(
                &json!({"stages":[{"name":"bad","at":"model","stage":"a"}]}),
                &BTreeMap::new()
            )
            .is_err()
    );
    let ModuleInstance::Stage(reject) = LiteralStageFactory
        .build(
            &json!({"action":{"kind":"reject_tool","reason":"blocked"}}),
            &BTreeMap::new(),
        )
        .unwrap()
    else {
        panic!("stage")
    };
    assert!(
        RuntimeRecipe::new(
            "bad-1",
            vec![StageBinding {
                name: "bad".into(),
                at: Boundary::AfterModel,
                stage: reject
            }]
        )
        .is_err()
    );
}
#[tokio::test]
async fn compiled_recipe_is_publicly_configured_and_remains_in_the_snapshot() {
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(LiteralStageFactory))
        .unwrap();
    registry.register_factory(Arc::new(RecipeFactory)).unwrap();
    let calls = Arc::new(AtomicUsize::new(0));
    let effects = Arc::new(AtomicUsize::new(0));
    let mut catalog = ToolCatalog::new();
    catalog
        .insert(ToolEntry::typed(Effect(effects.clone())))
        .unwrap();
    for (id, instance) in [
        ("m", ModuleInstance::Model(Arc::new(Calls(calls)))),
        (
            "p",
            ModuleInstance::Prompt(Arc::new(StaticPrompt("test".into()))),
        ),
        ("t", ModuleInstance::ToolPack(catalog)),
    ] {
        registry
            .register_factory(Arc::new(InstanceFactory::new(id, "1", instance)))
            .unwrap();
    }
    let document=serde_json::from_value(json!({"modules":[
        {"reference":{"id":"m","version":"1"},"factory":"m","config":{}},
        {"reference":{"id":"p","version":"1"},"factory":"p","config":{}},
        {"reference":{"id":"t","version":"1"},"factory":"t","config":{}},
        {"reference":{"id":"guard","version":"1"},"factory":"stage.literal","config":{"action":{"kind":"reject_tool","reason":"configured guard"}}},
        {"reference":{"id":"recipe","version":"1"},"factory":"runtime.recipe","config":{"stages":[{"name":"guard","at":"before_tool","stage":"guard"}]},"dependencies":{"guard":{"id":"guard","version":"1"}}}
    ],"agent":{"name":"configured-recipe","model":{"id":"m","version":"1"},"prompt":{"id":"p","version":"1"},"tool_packs":[{"id":"t","version":"1"}],"recipe":{"id":"recipe","version":"1"}}})).unwrap();
    let compiled = compile::compile_document(document, &registry).unwrap();
    assert_eq!(compiled.snapshot.modules.len(), 5);
    assert!(compiled.snapshot.restore(&registry).is_ok());
    assert!(matches!(
        compiled
            .agent
            .invoke(RunInput::new("go"), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 0);
}
