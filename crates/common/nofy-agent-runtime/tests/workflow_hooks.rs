#![cfg(feature = "workflow")]
use nofy_agent_runtime::{
    hooks::*,
    registry::*,
    workflow::{compile::*, graph::*, modules::*},
    *,
};
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
fn r(id: &str) -> ModuleRef {
    ModuleRef::new(id, "1")
}
fn install(registry: &mut ModuleRegistry, id: &str, instance: ModuleInstance) -> ModuleRef {
    registry
        .register_factory(Arc::new(InstanceFactory::new(id, "1", instance)))
        .unwrap();
    let reference = r(id);
    registry
        .define(ModuleDefinition {
            reference: reference.clone(),
            factory: id.into(),
            config: json!({}),
            dependencies: Default::default(),
        })
        .unwrap();
    reference
}
struct Effect {
    count: Arc<AtomicUsize>,
    started: Option<Arc<tokio::sync::Notify>>,
}
impl Tool for Effect {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("effect").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        ToolDescription::new("effect", "One hook effect")
    }
    async fn run(
        &self,
        _: ToolCallContext,
        args: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        self.count.fetch_add(1, Ordering::SeqCst);
        if let Some(started) = &self.started {
            started.notify_one();
            std::future::pending::<()>().await;
        }
        Ok(args)
    }
}
struct Echo(Arc<AtomicUsize>);
#[async_trait::async_trait]
impl Model for Echo {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        self.0.fetch_add(1, Ordering::SeqCst);
        Ok(ModelResponse {
            output: "done".into(),
            ..Default::default()
        })
    }
}
fn setup(
    human: bool,
    started: Option<Arc<tokio::sync::Notify>>,
) -> (
    ModuleRegistry,
    CompiledWorkflow,
    Agent,
    Arc<AtomicUsize>,
    Arc<AtomicUsize>,
) {
    let mut registry = ModuleRegistry::default();
    let effects = Arc::new(AtomicUsize::new(0));
    let models = Arc::new(AtomicUsize::new(0));
    let mut catalog = ToolCatalog::new();
    catalog
        .insert(ToolEntry::typed(Effect {
            count: effects.clone(),
            started,
        }))
        .unwrap();
    let tools = install(&mut registry, "tools", ModuleInstance::ToolPack(catalog));
    let mut nodes = vec![];
    if human {
        nodes.push(json!({"id":"human","input":{"from":"literal","value":"confirm"},"action":{"kind":"human","response_schema":{"type":"boolean"}}}));
    }
    nodes.push(json!({"id":"effect","needs":if human{vec!["human"]}else{vec![]},"input":{"from":"literal","value":{"checked":true}},"action":{"kind":"tool","runtime":r("effects"),"tool":"effect"}}));
    nodes.push(json!({"id":"decision","needs":["effect"],"input":{"from":"literal","value":{"decision":"continue"}},"action":{"kind":"transform"}}));
    let doc = json!({"entry":r("flow"),"host":{"name":"hook-host"},"tool_runtimes":[{"reference":r("effects"),"definition":{"name":"hook-tools","tool_packs":[tools]}}],"workflows":[{"reference":r("flow"),"input_schema":{"type":"object"},"output_schema":{"type":"object"},"nodes":nodes,"output":{"from":"node","node":"decision"}}]});
    let flow = compile_workflow(serde_json::from_value(doc).unwrap(), &registry).unwrap();
    let library =
        WorkflowLibrary::new(BTreeMap::from([("published@1".into(), flow.clone())])).unwrap();
    registry
        .register_factory(Arc::new(WorkflowHookFactory(library.clone())))
        .unwrap();
    registry
        .register_factory(Arc::new(WorkflowToolFactory(library)))
        .unwrap();
    registry
        .register_factory(Arc::new(HookFactory::new(EventCatalog::runtime())))
        .unwrap();
    for definition in [
        ModuleDefinition {
            reference: r("handler"),
            factory: "hook.workflow".into(),
            config: json!({"workflow":"published@1"}),
            dependencies: Default::default(),
        },
        ModuleDefinition {
            reference: r("hook"),
            factory: "hook.subscription".into(),
            config: json!({"event":"user_input","timeout_ms":1000}),
            dependencies: BTreeMap::from([("handler".into(), r("handler"))]),
        },
    ] {
        registry.define(definition).unwrap();
    }
    let model = install(
        &mut registry,
        "model",
        ModuleInstance::Model(Arc::new(Echo(models.clone()))),
    );
    let prompt = install(
        &mut registry,
        "prompt",
        ModuleInstance::Prompt(Arc::new(StaticPrompt("system".into()))),
    );
    let agent = nofy_agent_runtime::compile::compile_agent(
        serde_json::from_value(
            json!({"name":"parent","model":model,"prompt":prompt,"hooks":[r("hook")]}),
        )
        .unwrap(),
        &registry,
    )
    .unwrap()
    .agent;
    (registry, flow, agent, effects, models)
}
fn context() -> RunContext {
    RunContext::new("thread", "run")
}
#[tokio::test]
async fn configured_workflow_hook_waits_for_exact_human_decision_then_continues_parent() {
    let (_, flow, agent, effects, models) = setup(true, None);
    let store = Arc::new(InMemoryCheckpointer::default());
    let agent = agent.with_checkpointer(store.clone());
    let RunOutcome::Paused { reason, .. } = agent
        .invoke(RunInput::new("question"), context())
        .await
        .unwrap()
    else {
        panic!("expected pause")
    };
    assert_eq!(models.load(Ordering::SeqCst), 0);
    assert_eq!(effects.load(Ordering::SeqCst), 0);
    let waiting = &reason["reason"];
    flow.respond(
        store.as_ref(),
        HumanResponse {
            command_id: "approve".into(),
            thread_id: waiting["thread_id"].as_str().unwrap().into(),
            run_id: waiting["run_id"].as_str().unwrap().into(),
            workflow_identity: flow.identity().into(),
            reference: r("flow"),
            node: "human".into(),
            expected_request: json!("confirm"),
            value: json!(true),
        },
    )
    .await
    .unwrap();
    let RunOutcome::Completed { state, .. } =
        agent.invoke(RunInput::resume(), context()).await.unwrap()
    else {
        panic!("did not complete")
    };
    assert_eq!(
        state
            .messages
            .iter()
            .filter(|m| matches!(m,Message::User{content} if content=="question"))
            .count(),
        1
    );
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    assert_eq!(models.load(Ordering::SeqCst), 1);
    agent.invoke(RunInput::resume(), context()).await.unwrap();
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    assert_eq!(models.load(Ordering::SeqCst), 1);
}
struct LoseCommit {
    inner: InMemoryCheckpointer,
    kind: &'static str,
    identity: String,
    lose: AtomicBool,
}
#[async_trait::async_trait]
impl Checkpointer for LoseCommit {
    async fn load(&self, key: &str) -> Result<Option<Checkpoint>, Error> {
        self.inner.load(key).await
    }
    async fn save(&self, key: &str, expected: Option<u64>, cp: Checkpoint) -> Result<(), Error> {
        let matches = if self.kind == "decision" {
            cp.state.data["decision"]["decision"] == "continue"
        } else {
            cp.composition == self.identity && cp.state.data["started"] == true
        };
        if matches && self.lose.swap(false, Ordering::SeqCst) {
            return Err(Error::Checkpoint(format!("lost {} commit", self.kind)));
        }
        self.inner.save(key, expected, cp).await
    }
}
#[tokio::test]
async fn lost_hook_decision_or_first_graph_commit_resumes_controller_without_repeating_effect() {
    for kind in ["decision", "graph"] {
        let (_, flow, agent, effects, models) = setup(false, None);
        let store = Arc::new(LoseCommit {
            inner: Default::default(),
            kind,
            identity: flow.identity().into(),
            lose: AtomicBool::new(true),
        });
        let agent = agent.with_checkpointer(store);
        assert!(matches!(
            agent.invoke(RunInput::new("question"), context()).await,
            Err(Error::Checkpoint(_))
        ));
        assert_eq!(models.load(Ordering::SeqCst), 0);
        assert!(matches!(
            agent.invoke(RunInput::resume(), context()).await.unwrap(),
            RunOutcome::Completed { .. }
        ));
        assert_eq!(effects.load(Ordering::SeqCst), 1);
        assert_eq!(models.load(Ordering::SeqCst), 1);
    }
}
#[tokio::test]
async fn workflow_tool_factory_registers_published_graph_as_real_tool_module() {
    let (mut registry, _, _, effects, _) = setup(false, None);
    registry
        .define(ModuleDefinition {
            reference: r("published-tool"),
            factory: "tool.workflow".into(),
            config: json!({"workflow":"published@1","name":"flow"}),
            dependencies: Default::default(),
        })
        .unwrap();
    let resolved = registry.resolve(&[r("published-tool")]).unwrap();
    let ModuleInstance::ToolPack(catalog) = &resolved.instances[&r("published-tool")] else {
        panic!("wrong kind")
    };
    assert!(catalog.get("flow").unwrap().dispatch.is_resumable());
    let compiled = nofy_agent_runtime::tool_program::compile_tools(
        serde_json::from_value(json!({"name":"caller","tool_packs":[r("published-tool")]}))
            .unwrap(),
        &registry,
    )
    .unwrap();
    let runtime = compiled
        .runtime
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    assert!(matches!(
        runtime
            .invoke(
                ToolCall {
                    id: "call".into(),
                    name: "flow".into(),
                    arguments: json!({"input":{}})
                },
                RunInput::default(),
                context()
            )
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn timed_out_workflow_controller_resumes_but_unknown_primitive_is_never_reexecuted() {
    use nofy_agent_runtime::governance::*;
    let started = Arc::new(tokio::sync::Notify::new());
    let (_, _, agent, effects, models) = setup(false, Some(started.clone()));
    let ledger = Arc::new(InMemoryBudgetStore::default());
    let profile = Arc::new(
        GovernanceProfile::new(
            Arc::new(
                InstalledBudget::install(
                    ledger,
                    BudgetLimits {
                        max_model_calls: Some(1),
                        max_tool_calls: Some(3),
                        max_child_calls: Some(1),
                        max_concurrent_operations: Some(1),
                        ..Default::default()
                    },
                    "hook-budget",
                    1,
                )
                .unwrap(),
            ),
            BudgetLimits::default(),
            ModelRetryPolicy::default(),
        )
        .unwrap(),
    );
    let agent = agent
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()))
        .with_governance(profile);
    let worker_agent = agent.clone();
    let worker = tokio::spawn(async move {
        worker_agent
            .invoke(RunInput::new("question"), context())
            .await
    });
    tokio::time::timeout(std::time::Duration::from_secs(3), started.notified())
        .await
        .unwrap();
    let RunOutcome::Paused { reason, .. } = worker.await.unwrap().unwrap() else {
        panic!("expected timeout pause")
    };
    assert_eq!(reason["kind"], "hook_controller_timeout");
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    assert_eq!(models.load(Ordering::SeqCst), 0);
    let RunOutcome::Paused { reason, .. } =
        agent.invoke(RunInput::resume(), context()).await.unwrap()
    else {
        panic!("unknown effect should pause")
    };
    assert_eq!(reason["kind"], "hook_workflow_paused");
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    assert_eq!(models.load(Ordering::SeqCst), 0);
}
