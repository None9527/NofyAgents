#![cfg(feature = "workflow")]
use nofy_agent_runtime::{
    governance::*,
    registry::*,
    workflow::{compile::*, graph::*, spec::*},
    *,
};
use nofy_tool_runtime::{Tool, ToolCallContext};
use nofy_tool_types::ToolDescription;
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
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
            dependencies: BTreeMap::new(),
        })
        .unwrap();
    reference
}
fn node(id: &str, needs: &[&str], input: Value, action: Value) -> Value {
    json!({"id":id,"needs":needs,"input":input,"action":action})
}
fn input(pointer: &str) -> Value {
    json!({"from":"input","pointer":pointer})
}
fn value(v: Value) -> Value {
    json!({"from":"literal","value":v})
}
fn output(node: &str, pointer: &str) -> Value {
    json!({"from":"node","node":node,"pointer":pointer})
}
fn spec(id: &str, nodes: Vec<Value>, out: Value) -> Value {
    json!({"reference":r(id),"input_schema":true,"output_schema":true,"parallelism":4,"nodes":nodes,"output":out})
}
fn document(workflows: Vec<Value>) -> Value {
    json!({"entry":r("main"),"host":{"name":"graph-host"},"workflows":workflows})
}
fn compiled(doc: Value, registry: &ModuleRegistry) -> CompiledWorkflow {
    compile_workflow(serde_json::from_value(doc).unwrap(), registry).unwrap()
}
fn result(outcome: RunOutcome) -> Value {
    let RunOutcome::Completed { state, .. } = outcome else {
        panic!("workflow did not complete: {outcome:?}")
    };
    match state.messages.last().unwrap() {
        Message::Tool {
            content,
            is_error: false,
            ..
        } => content["value"].clone(),
        m => panic!("invalid terminal {m:?}"),
    }
}
fn context() -> RunContext {
    RunContext::new("thread", "root")
}
struct Effect {
    count: Arc<AtomicUsize>,
    fail: usize,
}
impl Tool for Effect {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("effect").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        ToolDescription::new("effect", "Return supplied JSON")
    }
    async fn run(
        &self,
        _: ToolCallContext,
        args: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        let n = self.count.fetch_add(1, Ordering::SeqCst);
        if n < self.fail {
            return Err(nofy_tool_runtime::ToolError::custom(
                "known_failure",
                "temporary",
            ));
        }
        Ok(args)
    }
}
fn tools(registry: &mut ModuleRegistry, count: Arc<AtomicUsize>, fail: usize) -> Value {
    let mut catalog = ToolCatalog::new();
    catalog
        .insert(ToolEntry::typed(Effect { count, fail }))
        .unwrap();
    let reference = install(registry, "tools", ModuleInstance::ToolPack(catalog));
    json!({"reference":r("effects"),"definition":{"name":"effect-host","tool_packs":[reference]}})
}
fn tool() -> Value {
    json!({"kind":"tool","runtime":r("effects"),"tool":"effect"})
}
struct EchoModel {
    calls: Arc<AtomicUsize>,
    barrier: Option<Arc<tokio::sync::Barrier>>,
}
#[async_trait::async_trait]
impl Model for EchoModel {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.calls.fetch_add(1, Ordering::SeqCst);
        if let Some(barrier) = &self.barrier {
            barrier.wait().await;
        }
        let prompt = request
            .messages
            .iter()
            .find_map(|m| match m {
                Message::User { content } => Some(content.clone()),
                _ => None,
            })
            .unwrap_or_default();
        Ok(ModelResponse {
            output: prompt,
            ..Default::default()
        })
    }
}
#[test]
fn compiler_rejects_cycles_dangling_edges_nonancestor_refs_bad_ports_and_unbounded_nesting() {
    let base = spec(
        "main",
        vec![
            node("a", &[], value(json!(1)), json!({"kind":"transform"})),
            node("b", &["a"], output("a", ""), json!({"kind":"transform"})),
        ],
        output("b", ""),
    );
    let mut cases = vec![];
    let mut x = base.clone();
    x["nodes"][0]["needs"] = json!(["b"]);
    cases.push(x);
    let mut x = base.clone();
    x["nodes"][1]["needs"] = json!(["ghost"]);
    cases.push(x);
    let mut x = base.clone();
    x["nodes"][1]["needs"] = json!([]);
    cases.push(x);
    let mut x = base.clone();
    x["nodes"][0]["input_schema"] = json!({"type":"string"});
    cases.push(x);
    let mut x = base.clone();
    x["nodes"][0]["output_schema"] = json!({"type":"integer"});
    x["nodes"][1]["input_schema"] = json!({"type":"string"});
    cases.push(x);
    let mut x = base.clone();
    x["nodes"][1]["input"] = output("a", "bad-pointer");
    cases.push(x);
    let mut x = base.clone();
    x["nodes"][1]["input"] = output("a", "/~2");
    cases.push(x);
    for case in cases {
        assert!(
            serde_json::from_value::<WorkflowSpec>(case)
                .unwrap()
                .validate()
                .is_err()
        );
    }
    let recursive = document(vec![spec(
        "main",
        vec![node(
            "a",
            &[],
            input(""),
            json!({"kind":"subworkflow","workflow":r("main")}),
        )],
        output("a", ""),
    )]);
    assert!(
        compile_workflow(
            serde_json::from_value(recursive).unwrap(),
            &ModuleRegistry::default()
        )
        .is_err()
    );
    let mut too_many = base;
    too_many["nodes"][0]["on_error"] = json!({"retries":17});
    assert!(
        serde_json::from_value::<WorkflowSpec>(too_many)
            .unwrap()
            .validate()
            .is_err()
    );
}
#[tokio::test]
async fn condition_branches_all_settled_join_and_structured_output_use_no_model() {
    let a = node(
        "a",
        &[],
        input(""),
        json!({"kind":"condition","equals":true}),
    );
    let mut yes = node(
        "yes",
        &["a"],
        value(json!("yes")),
        json!({"kind":"transform"}),
    );
    yes["when"] = json!({"value":output("a",""),"equals":true});
    let mut no = node(
        "no",
        &["a"],
        value(json!("no")),
        json!({"kind":"transform"}),
    );
    no["when"] = json!({"value":output("a",""),"equals":false});
    let join = node(
        "join",
        &["yes", "no"],
        json!({"from":"object","fields":{"yes":output("yes",""),"no":output("no","")}}),
        json!({"kind":"join","mode":"all_settled"}),
    );
    let doc = document(vec![spec(
        "main",
        vec![a, yes, no, join],
        output("join", ""),
    )]);
    let flow = compiled(doc, &ModuleRegistry::default())
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    assert_eq!(
        result(
            flow.invoke(json!(true), RunInput::default(), context())
                .await
                .unwrap()
        ),
        json!({"yes":"yes","no":null})
    );
    assert_eq!(
        result(
            flow.invoke(json!(true), RunInput::resume(), context())
                .await
                .unwrap()
        ),
        json!({"yes":"yes","no":null})
    );
}
#[tokio::test]
async fn configuration_retrieves_tool_runs_actual_agents_in_parallel_and_joins() {
    let mut registry = ModuleRegistry::default();
    let effects = Arc::new(AtomicUsize::new(0));
    let models = Arc::new(AtomicUsize::new(0));
    let tool_host = tools(&mut registry, effects.clone(), 0);
    let model = install(
        &mut registry,
        "model",
        ModuleInstance::Model(Arc::new(EchoModel {
            calls: models.clone(),
            barrier: Some(Arc::new(tokio::sync::Barrier::new(2))),
        })),
    );
    let prompt = install(
        &mut registry,
        "prompt",
        ModuleInstance::Prompt(Arc::new(StaticPrompt("analyze".into()))),
    );
    let retrieve = node("retrieve", &[], input(""), tool());
    let a = node(
        "a",
        &["retrieve"],
        output("retrieve", "/query"),
        json!({"kind":"agent","agent":r("worker")}),
    );
    let b = node(
        "b",
        &["retrieve"],
        output("retrieve", "/query"),
        json!({"kind":"agent","agent":r("worker")}),
    );
    let join = node(
        "join",
        &["a", "b"],
        json!({"from":"object","fields":{"a":output("a","/output"),"b":output("b","/output")}}),
        json!({"kind":"join"}),
    );
    let mut doc = document(vec![spec(
        "main",
        vec![retrieve, a, b, join],
        output("join", ""),
    )]);
    doc["tool_runtimes"] = json!([tool_host]);
    doc["agents"] = json!([{"reference":r("worker"),"definition":{"name":"worker","model":model,"prompt":prompt}}]);
    let flow =
        compiled(doc, &registry).with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    let output = tokio::time::timeout(
        std::time::Duration::from_secs(3),
        flow.invoke(json!({"query":"evidence"}), RunInput::default(), context()),
    )
    .await
    .unwrap()
    .unwrap();
    assert_eq!(result(output), json!({"a":"evidence","b":"evidence"}));
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    assert_eq!(models.load(Ordering::SeqCst), 2);
    flow.invoke(json!({"query":"evidence"}), RunInput::resume(), context())
        .await
        .unwrap();
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    assert_eq!(models.load(Ordering::SeqCst), 2);
}
#[tokio::test]
async fn human_decision_is_exact_immutable_and_does_not_repeat_a_completed_peer() {
    let mut registry = ModuleRegistry::default();
    let effects = Arc::new(AtomicUsize::new(0));
    let tool_host = tools(&mut registry, effects.clone(), 0);
    let effect = node("effect", &[], value(json!({"value":1})), tool());
    let human = node(
        "human",
        &[],
        value(json!({"question":"approve"})),
        json!({"kind":"human","response_schema":{"type":"boolean"}}),
    );
    let join = node(
        "join",
        &["effect", "human"],
        output("human", ""),
        json!({"kind":"join"}),
    );
    let mut doc = document(vec![spec(
        "main",
        vec![effect, human, join],
        output("join", ""),
    )]);
    doc["tool_runtimes"] = json!([tool_host]);
    let store = Arc::new(InMemoryCheckpointer::default());
    let flow = compiled(doc, &registry).with_checkpointer(store.clone());
    let RunOutcome::Paused { reason, .. } = flow
        .invoke(json!({}), RunInput::default(), context())
        .await
        .unwrap()
    else {
        panic!("expected human pause")
    };
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    let thread = reason["thread_id"].as_str().unwrap();
    let run = reason["run_id"].as_str().unwrap();
    let response = HumanResponse {
        command_id: "decision".into(),
        thread_id: thread.into(),
        run_id: run.into(),
        workflow_identity: flow.identity().into(),
        reference: r("main"),
        node: "human".into(),
        expected_request: json!({"question":"approve"}),
        value: json!(true),
    };
    let mut bad = response.clone();
    bad.expected_request = json!({"question":"different"});
    assert!(flow.respond(store.as_ref(), bad).await.is_err());
    flow.respond(store.as_ref(), response.clone())
        .await
        .unwrap();
    flow.respond(store.as_ref(), response.clone())
        .await
        .unwrap();
    let mut bad = response;
    bad.value = json!(false);
    assert!(flow.respond(store.as_ref(), bad).await.is_err());
    assert_eq!(
        result(
            flow.invoke(json!({}), RunInput::resume(), context())
                .await
                .unwrap()
        ),
        json!(true)
    );
    assert_eq!(effects.load(Ordering::SeqCst), 1);
}
#[tokio::test]
async fn retries_are_bounded_and_exhausted_failure_is_cached_on_resume() {
    for fail in [1, 3] {
        let mut registry = ModuleRegistry::default();
        let effects = Arc::new(AtomicUsize::new(0));
        let tool_host = tools(&mut registry, effects.clone(), fail);
        let mut effect = node("effect", &[], input(""), tool());
        effect["on_error"] = json!({"retries":1,"exhausted":"fail"});
        let mut doc = document(vec![spec("main", vec![effect], output("effect", ""))]);
        doc["tool_runtimes"] = json!([tool_host]);
        let flow =
            compiled(doc, &registry).with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
        let outcome = flow
            .invoke(json!({"value":1}), RunInput::default(), context())
            .await;
        if fail == 1 {
            assert_eq!(result(outcome.unwrap()), json!({"value":1}));
        } else {
            assert!(outcome.is_err());
        }
        assert_eq!(effects.load(Ordering::SeqCst), 2);
        let outcome = flow
            .invoke(json!({"value":1}), RunInput::resume(), context())
            .await;
        if fail == 1 {
            assert!(outcome.is_ok());
        } else {
            assert!(outcome.is_err());
        }
        assert_eq!(effects.load(Ordering::SeqCst), 2);
    }
}
#[tokio::test]
async fn finite_loop_and_subworkflow_replay_frozen_iterations_without_effect() {
    let mut registry = ModuleRegistry::default();
    let effects = Arc::new(AtomicUsize::new(0));
    let tool_host = tools(&mut registry, effects.clone(), 0);
    let leaf = spec(
        "leaf",
        vec![node("effect", &[], input(""), tool())],
        output("effect", ""),
    );
    let main = spec(
        "main",
        vec![node(
            "loop",
            &[],
            input(""),
            json!({"kind":"loop","workflow":r("leaf"),"max_iterations":3,"until":{"value":input("/done"),"equals":true}}),
        )],
        output("loop", ""),
    );
    let mut doc = document(vec![main, leaf]);
    doc["tool_runtimes"] = json!([tool_host]);
    let flow =
        compiled(doc, &registry).with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    assert_eq!(
        result(
            flow.invoke(json!({"done":true}), RunInput::default(), context())
                .await
                .unwrap()
        ),
        json!({"done":true})
    );
    flow.invoke(json!({"done":true}), RunInput::resume(), context())
        .await
        .unwrap();
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    let other = RunContext::new("other", "other");
    assert!(
        flow.invoke(json!({"done":false}), RunInput::default(), other.clone())
            .await
            .is_err()
    );
    assert_eq!(effects.load(Ordering::SeqCst), 4);
    assert!(
        flow.invoke(json!({"done":false}), RunInput::resume(), other)
            .await
            .is_err()
    );
    assert_eq!(effects.load(Ordering::SeqCst), 4);
}

#[tokio::test]
async fn model_zero_budget_allows_pure_tool_workflow_and_real_step_limit_blocks_before_effect() {
    for steps in [0, 1] {
        let mut registry = ModuleRegistry::default();
        let effects = Arc::new(AtomicUsize::new(0));
        let tool_host = tools(&mut registry, effects.clone(), 0);
        let ledger = Arc::new(InMemoryBudgetStore::default());
        let profile = Arc::new(
            GovernanceProfile::new(
                Arc::new(
                    InstalledBudget::install(
                        ledger.clone(),
                        BudgetLimits {
                            max_model_calls: Some(0),
                            max_tool_calls: Some(2),
                            max_steps: Some(steps),
                            ..Default::default()
                        },
                        "root-budget",
                        1,
                    )
                    .unwrap(),
                ),
                BudgetLimits::default(),
                ModelRetryPolicy::default(),
            )
            .unwrap(),
        );
        let budget = install(
            &mut registry,
            "budget",
            ModuleInstance::Governance(profile.clone()),
        );
        registry.require_governance(budget);
        let mut doc = document(vec![spec(
            "main",
            vec![node("effect", &[], input(""), tool())],
            output("effect", ""),
        )]);
        doc["tool_runtimes"] = json!([tool_host]);
        let flow =
            compiled(doc, &registry).with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
        let outcome = flow
            .invoke(json!({"value":3}), RunInput::default(), context())
            .await
            .unwrap();
        if steps == 0 {
            assert!(matches!(outcome, RunOutcome::BudgetExceeded { .. }));
            assert_eq!(effects.load(Ordering::SeqCst), 0);
        } else {
            assert_eq!(result(outcome), json!({"value":3}));
            assert_eq!(effects.load(Ordering::SeqCst), 1);
        }
        let summary = ledger
            .inspect(&BudgetScope {
                root_run_id: "root".into(),
                identity: profile.identity().into(),
            })
            .await
            .unwrap()
            .unwrap();
        assert_eq!(summary.used.model_calls, 0);
        assert_eq!(summary.used.steps, steps);
        if steps == 1 {
            assert_eq!(summary.used.tool_calls, 2);
        }
    }
}
struct EffectGate(Arc<std::sync::atomic::AtomicBool>);
#[async_trait::async_trait]
impl Policy for EffectGate {
    async fn admit(
        &self,
        call: &ToolCall,
        _: &RunState,
        _: &RunContext,
    ) -> Result<Admission, Error> {
        Ok(if call.name == "effect" && !self.0.load(Ordering::SeqCst) {
            Admission::Pause(json!({"approval":"effect"}))
        } else {
            Admission::Allow
        })
    }
}
struct ScriptModel {
    root: bool,
    calls: Arc<AtomicUsize>,
}
#[async_trait::async_trait]
impl Model for ScriptModel {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.calls.fetch_add(1, Ordering::SeqCst);
        if request
            .messages
            .iter()
            .any(|m| matches!(m, Message::Tool { .. }))
        {
            return Ok(ModelResponse {
                output: "finished".into(),
                ..Default::default()
            });
        }
        Ok(ModelResponse {
            tool_calls: vec![ToolCall {
                id: "model-call".into(),
                name: if self.root { "flow" } else { "effect" }.into(),
                arguments: if self.root {
                    json!({"input":"task"})
                } else {
                    json!({"verified":true})
                },
            }],
            ..Default::default()
        })
    }
}
#[tokio::test]
async fn agent_workflow_tool_child_agent_approval_preserves_workflow_host_policy() {
    let mut registry = ModuleRegistry::default();
    let effects = Arc::new(AtomicUsize::new(0));
    let root_calls = Arc::new(AtomicUsize::new(0));
    let worker_calls = Arc::new(AtomicUsize::new(0));
    let tool_host = tools(&mut registry, effects.clone(), 0);
    let allowed = Arc::new(std::sync::atomic::AtomicBool::new(false));
    let policy = install(
        &mut registry,
        "flow-policy",
        ModuleInstance::Policy(Arc::new(EffectGate(allowed.clone()))),
    );
    let root_model = install(
        &mut registry,
        "root-model",
        ModuleInstance::Model(Arc::new(ScriptModel {
            root: true,
            calls: root_calls.clone(),
        })),
    );
    let worker_model = install(
        &mut registry,
        "worker-model",
        ModuleInstance::Model(Arc::new(ScriptModel {
            root: false,
            calls: worker_calls.clone(),
        })),
    );
    let prompt = install(
        &mut registry,
        "prompt",
        ModuleInstance::Prompt(Arc::new(StaticPrompt("system".into()))),
    );
    let mut doc = document(vec![spec(
        "main",
        vec![node(
            "worker",
            &[],
            input(""),
            json!({"kind":"agent","agent":r("worker")}),
        )],
        output("worker", "/output"),
    )]);
    doc["host"]["policies"] = json!([policy]);
    doc["agents"] = json!([{"reference":r("worker"),"definition":{"name":"worker","model":worker_model,"prompt":prompt,"tool_packs":[r("tools")]}}]);
    doc["tool_runtimes"] = json!([tool_host]);
    let flow = compiled(doc, &registry);
    let mut pack = ToolCatalog::new();
    pack.insert(flow.as_tool("flow", "Configured workflow"))
        .unwrap();
    let pack = install(&mut registry, "flow-tools", ModuleInstance::ToolPack(pack));
    let root = nofy_agent_runtime::compile::compile_agent(
        serde_json::from_value(
            json!({"name":"root-agent","model":root_model,"prompt":prompt,"tool_packs":[pack]}),
        )
        .unwrap(),
        &registry,
    )
    .unwrap()
    .agent
    .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    assert!(matches!(
        root.invoke(RunInput::new("start"), context())
            .await
            .unwrap(),
        RunOutcome::Paused { .. }
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 0);
    assert_eq!(root_calls.load(Ordering::SeqCst), 1);
    assert_eq!(worker_calls.load(Ordering::SeqCst), 1);
    allowed.store(true, Ordering::SeqCst);
    assert!(matches!(
        root.invoke(RunInput::resume(), context()).await.unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    assert_eq!(root_calls.load(Ordering::SeqCst), 2);
    assert_eq!(worker_calls.load(Ordering::SeqCst), 2);
    root.invoke(RunInput::resume(), context()).await.unwrap();
    assert_eq!(effects.load(Ordering::SeqCst), 1);
}

struct LoseGraphResult {
    inner: InMemoryCheckpointer,
    identity: String,
    lose: std::sync::atomic::AtomicBool,
}
#[async_trait::async_trait]
impl Checkpointer for LoseGraphResult {
    async fn load(&self, key: &str) -> Result<Option<Checkpoint>, Error> {
        self.inner.load(key).await
    }
    async fn save(&self, key: &str, expected: Option<u64>, cp: Checkpoint) -> Result<(), Error> {
        if cp.composition == self.identity
            && cp.state.data["nodes"]["effect"]["status"] == "completed"
            && self.lose.swap(false, Ordering::SeqCst)
        {
            return Err(Error::Checkpoint("lost graph result".into()));
        }
        self.inner.save(key, expected, cp).await
    }
}
#[tokio::test]
async fn graph_result_cas_failure_can_resume_through_agent_tool_without_repeating_effect() {
    let mut registry = ModuleRegistry::default();
    let effects = Arc::new(AtomicUsize::new(0));
    let tool_host = tools(&mut registry, effects.clone(), 0);
    let root_calls = Arc::new(AtomicUsize::new(0));
    let root_model = install(
        &mut registry,
        "root-model",
        ModuleInstance::Model(Arc::new(ScriptModel {
            root: true,
            calls: root_calls.clone(),
        })),
    );
    let prompt = install(
        &mut registry,
        "prompt",
        ModuleInstance::Prompt(Arc::new(StaticPrompt("system".into()))),
    );
    let mut doc = document(vec![spec(
        "main",
        vec![node("effect", &[], value(json!({"ok":true})), tool())],
        output("effect", ""),
    )]);
    doc["tool_runtimes"] = json!([tool_host]);
    let flow = compiled(doc, &registry);
    let store = Arc::new(LoseGraphResult {
        inner: Default::default(),
        identity: flow.identity().into(),
        lose: std::sync::atomic::AtomicBool::new(true),
    });
    let mut pack = ToolCatalog::new();
    pack.insert(flow.as_tool("flow", "Configured workflow"))
        .unwrap();
    let pack = install(&mut registry, "flow-tools", ModuleInstance::ToolPack(pack));
    let root = nofy_agent_runtime::compile::compile_agent(
        serde_json::from_value(
            json!({"name":"root-agent","model":root_model,"prompt":prompt,"tool_packs":[pack]}),
        )
        .unwrap(),
        &registry,
    )
    .unwrap()
    .agent
    .with_checkpointer(store);
    assert!(
        matches!(root.invoke(RunInput::new("start"),context()).await,Err(Error::Checkpoint(message)) if message.contains("lost graph result"))
    );
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    assert_eq!(root_calls.load(Ordering::SeqCst), 1);
    assert!(matches!(
        root.invoke(RunInput::resume(), context()).await.unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    assert_eq!(root_calls.load(Ordering::SeqCst), 2);
}
struct VariablesPrompt;
#[async_trait::async_trait]
impl Prompt for VariablesPrompt {
    async fn render(&self, context: &RunContext, _: &[String]) -> Result<String, Error> {
        Ok(context
            .capabilities
            .get::<nofy_agent_runtime::prompt::PromptVariables>()
            .unwrap()
            .0["name"]
            .as_str()
            .unwrap()
            .to_string())
    }
}
#[tokio::test]
async fn prompt_node_receives_explicit_values_and_compilation_restore_freezes_versions() {
    let mut registry = ModuleRegistry::default();
    let prompt = install(
        &mut registry,
        "variables-prompt",
        ModuleInstance::Prompt(Arc::new(VariablesPrompt)),
    );
    let doc = document(vec![spec(
        "main",
        vec![node(
            "prompt",
            &[],
            input(""),
            json!({"kind":"prompt","prompt":prompt}),
        )],
        output("prompt", ""),
    )]);
    let flow = compiled(doc, &registry);
    let snapshot = serde_json::from_str::<WorkflowCompilationSnapshot>(
        &serde_json::to_string(&flow.snapshot).unwrap(),
    )
    .unwrap();
    let flow = snapshot
        .restore(&registry)
        .unwrap()
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    assert_eq!(
        result(
            flow.invoke(
                json!({"name":"bound variables"}),
                RunInput::default(),
                context()
            )
            .await
            .unwrap()
        ),
        json!("bound variables")
    );
    assert!(snapshot.restore(&ModuleRegistry::default()).is_err());
}

#[cfg(feature = "sqlite")]
struct FileEffect(std::path::PathBuf);
#[cfg(feature = "sqlite")]
impl Tool for FileEffect {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("effect").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        ToolDescription::new("effect", "Persist one effect")
    }
    async fn run(
        &self,
        _: ToolCallContext,
        args: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        use std::io::Write;
        let mut file = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.0)
            .unwrap();
        writeln!(file, "effect").unwrap();
        file.sync_all().unwrap();
        Ok(args)
    }
}
#[test]
#[cfg(feature = "sqlite")]
fn workflow_process_worker() {
    let Ok(dir) = std::env::var("NOFY_GRAPH_WORKER_DIR") else {
        return;
    };
    let dir = std::path::PathBuf::from(dir);
    let mode = std::env::var("NOFY_GRAPH_WORKER_MODE").unwrap();
    tokio::runtime::Builder::new_current_thread().enable_all().build().unwrap().block_on(async move{
        let store=Arc::new(nofy_agent_runtime::durable::SqliteStore::open(&dir.join("runtime.db")).unwrap());let mut registry=ModuleRegistry::default();
        let mut catalog=ToolCatalog::new();catalog.insert(ToolEntry::typed(FileEffect(dir.join("effects.log")))).unwrap();let pack=install(&mut registry,"tools",ModuleInstance::ToolPack(catalog));
        let doc=document(vec![spec("main",vec![node("human",&[],value(json!({"question":"continue"})),json!({"kind":"human","response_schema":{"type":"boolean"}})),node("effect",&["human"],value(json!({"executed":true})),tool())],output("effect",""))]);
        let mut doc=doc;doc["tool_runtimes"]=json!([{"reference":r("effects"),"definition":{"name":"file-host","tool_packs":[pack]}}]);
        let flow=if mode=="pause"{compiled(doc,&registry)}else{serde_json::from_slice::<WorkflowCompilationSnapshot>(&std::fs::read(dir.join("snapshot.json")).unwrap()).unwrap().restore(&registry).unwrap()}.with_checkpointer(store.clone());
        if mode=="pause"{
            std::fs::write(dir.join("snapshot.json"),serde_json::to_vec(&flow.snapshot).unwrap()).unwrap();
            assert!(matches!(flow.invoke(json!({}),RunInput::default(),context()).await.unwrap(),RunOutcome::Paused{..}));
            assert!(!dir.join("effects.log").exists());std::process::exit(97);
        }
        let state=flow.inspect(store.as_ref(),"thread","root",&r("main")).await.unwrap().unwrap();assert!(matches!(state.nodes.get("human"),Some(NodeProgress::Waiting{..})));
        flow.respond(store.as_ref(),HumanResponse {command_id:"continue-once".into(),thread_id:"thread".into(),run_id:"root".into(),workflow_identity:flow.identity().into(),reference:r("main"),node:"human".into(),expected_request:json!({"question":"continue"}),value:json!(true)}).await.unwrap();
        assert_eq!(result(flow.invoke(json!({}),RunInput::resume(),context()).await.unwrap()),json!({"executed":true}));
        flow.invoke(json!({}),RunInput::resume(),context()).await.unwrap();assert_eq!(std::fs::read_to_string(dir.join("effects.log")).unwrap(),"effect\n");
    });
}
#[test]
#[cfg(feature = "sqlite")]
fn real_process_exit_at_human_wait_restores_sqlite_and_executes_remaining_effect_once() {
    let dir = tempfile::Builder::new()
        .prefix("nofy-workflow-restart-")
        .tempdir()
        .unwrap()
        .keep();
    for (mode, code) in [("pause", 97), ("recover", 0)] {
        let output = std::process::Command::new(std::env::current_exe().unwrap())
            .args(["--exact", "workflow_process_worker", "--nocapture"])
            .env("NOFY_GRAPH_WORKER_DIR", &dir)
            .env("NOFY_GRAPH_WORKER_MODE", mode)
            .output()
            .unwrap();
        std::fs::write(dir.join(format!("{mode}.stdout")), &output.stdout).unwrap();
        std::fs::write(dir.join(format!("{mode}.stderr")), &output.stderr).unwrap();
        assert_eq!(
            output.status.code(),
            Some(code),
            "worker {mode} failed; artifacts {}",
            dir.display()
        );
    }
    assert_eq!(
        std::fs::read_to_string(dir.join("effects.log")).unwrap(),
        "effect\n"
    );
}

struct FactCapture(Arc<std::sync::Mutex<Vec<String>>>);
#[async_trait::async_trait]
impl nofy_agent_runtime::hooks::HookHandler for FactCapture {
    async fn handle(
        &self,
        event: &nofy_agent_runtime::hooks::HookEvent,
        _: &RunContext,
    ) -> Result<nofy_agent_runtime::hooks::HookDecision, Error> {
        self.0.lock().unwrap().push(event.name.clone());
        Ok(nofy_agent_runtime::hooks::HookDecision::Continue)
    }
}
#[tokio::test]
async fn workflow_node_fact_producers_are_real_and_recovery_does_not_duplicate_completed_hooks() {
    use nofy_agent_runtime::hooks::*;
    let mut registry = ModuleRegistry::default();
    let captured = Arc::new(std::sync::Mutex::new(Vec::new()));
    let mut hooks = vec![];
    for name in ["workflow_start", "workflow_end", "node_start", "node_end"] {
        let hook = HookRegistration::new(
            format!("{name}-1"),
            EventCatalog::runtime().get(name).unwrap().clone(),
            HookRule {
                event: name.into(),
                priority: 0,
                timeout_ms: 1000,
                failure: FailurePolicy::Closed,
                matches: None,
            },
            Arc::new(FactCapture(captured.clone())),
        )
        .unwrap();
        hooks.push(install(
            &mut registry,
            name,
            ModuleInstance::Hook(Arc::new(hook)),
        ));
    }
    let mut doc = document(vec![spec(
        "main",
        vec![
            node(
                "human",
                &[],
                value(json!("confirm")),
                json!({"kind":"human","response_schema":{"type":"boolean"}}),
            ),
            node(
                "result",
                &["human"],
                output("human", ""),
                json!({"kind":"transform"}),
            ),
        ],
        output("result", ""),
    )]);
    doc["host"]["hooks"] = json!(hooks);
    let store = Arc::new(InMemoryCheckpointer::default());
    let flow = compiled(doc, &registry).with_checkpointer(store.clone());
    assert!(matches!(
        flow.invoke(json!({}), RunInput::default(), context())
            .await
            .unwrap(),
        RunOutcome::Paused { .. }
    ));
    assert_eq!(
        *captured.lock().unwrap(),
        vec!["workflow_start", "node_start"]
    );
    flow.respond(
        store.as_ref(),
        HumanResponse {
            command_id: "confirm".into(),
            thread_id: "thread".into(),
            run_id: "root".into(),
            workflow_identity: flow.identity().into(),
            reference: r("main"),
            node: "human".into(),
            expected_request: json!("confirm"),
            value: json!(true),
        },
    )
    .await
    .unwrap();
    assert_eq!(
        result(
            flow.invoke(json!({}), RunInput::resume(), context())
                .await
                .unwrap()
        ),
        json!(true)
    );
    let expected = vec![
        "workflow_start",
        "node_start",
        "node_end",
        "node_start",
        "node_end",
        "workflow_end",
    ];
    assert_eq!(*captured.lock().unwrap(), expected);
    flow.invoke(json!({}), RunInput::resume(), context())
        .await
        .unwrap();
    assert_eq!(*captured.lock().unwrap(), expected);
}

struct WaitingModel(Arc<tokio::sync::Notify>);
#[async_trait::async_trait]
impl Model for WaitingModel {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        self.0.notify_one();
        std::future::pending().await
    }
}
#[tokio::test]
#[cfg(feature = "sqlite")]
async fn persistent_child_cancel_reaches_agent_nested_inside_workflow_tool() {
    use nofy_agent_runtime::{
        durable::SqliteStore,
        mailbox::{InputAddress, MailboxSender},
        supervisor::RunSupervisor,
    };
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let mut registry = ModuleRegistry::default();
    let started = Arc::new(tokio::sync::Notify::new());
    let worker = install(
        &mut registry,
        "waiting",
        ModuleInstance::Model(Arc::new(WaitingModel(started.clone()))),
    );
    let root_model = install(
        &mut registry,
        "root-model",
        ModuleInstance::Model(Arc::new(ScriptModel {
            root: true,
            calls: Arc::new(AtomicUsize::new(0)),
        })),
    );
    let prompt = install(
        &mut registry,
        "prompt",
        ModuleInstance::Prompt(Arc::new(StaticPrompt("system".into()))),
    );
    let mut doc = document(vec![spec(
        "main",
        vec![node(
            "worker",
            &[],
            input(""),
            json!({"kind":"agent","agent":r("worker")}),
        )],
        output("worker", "/output"),
    )]);
    doc["agents"] = json!([{"reference":r("worker"),"definition":{"name":"waiting-agent","model":worker,"prompt":prompt}}]);
    let flow = compiled(doc, &registry);
    let mut pack = ToolCatalog::new();
    pack.insert(flow.as_tool("flow", "Child workflow")).unwrap();
    let pack = install(&mut registry, "flow-tools", ModuleInstance::ToolPack(pack));
    let root = nofy_agent_runtime::compile::compile_agent(
        serde_json::from_value(
            json!({"name":"root-agent","model":root_model,"prompt":prompt,"tool_packs":[pack]}),
        )
        .unwrap(),
        &registry,
    )
    .unwrap();
    let worker = {
        let store = store.clone();
        tokio::spawn(async move {
            RunSupervisor::new(store)
                .execute(&root, RunInput::new("start"), context())
                .await
        })
    };
    tokio::time::timeout(std::time::Duration::from_secs(3), started.notified())
        .await
        .unwrap();
    let child = store
        .children("root")
        .await
        .unwrap()
        .into_iter()
        .find(|child| child.agent_name == "waiting-agent")
        .unwrap();
    store
        .cancel(
            &InputAddress {
                root_run_id: "root".into(),
                run_id: child.run_id,
                thread_id: child.thread_id,
                agent: child.agent_name,
            },
            "stop-child",
        )
        .await
        .unwrap();
    assert!(matches!(
        tokio::time::timeout(std::time::Duration::from_secs(3), worker)
            .await
            .unwrap()
            .unwrap()
            .unwrap(),
        RunOutcome::Cancelled { .. }
    ));
}

#[tokio::test]
#[cfg(feature = "sqlite")]
async fn stable_workflow_events_survive_lost_graph_ack_without_duplicate_cursor_or_effect() {
    use nofy_agent_runtime::{durable::SqliteStore, supervisor::RunSupervisor};
    let temp = tempfile::tempdir().unwrap();
    let path = temp.path().join("runtime.db");
    let store = SqliteStore::open(&path).unwrap();
    let mut registry = ModuleRegistry::default();
    let effects = Arc::new(AtomicUsize::new(0));
    let tool_host = tools(&mut registry, effects.clone(), 0);
    let root_calls = Arc::new(AtomicUsize::new(0));
    let root_model = install(
        &mut registry,
        "root-model",
        ModuleInstance::Model(Arc::new(ScriptModel {
            root: true,
            calls: root_calls.clone(),
        })),
    );
    let prompt = install(
        &mut registry,
        "prompt",
        ModuleInstance::Prompt(Arc::new(StaticPrompt("system".into()))),
    );
    let mut doc = document(vec![spec(
        "main",
        vec![node("effect", &[], value(json!({"ok":true})), tool())],
        output("effect", ""),
    )]);
    doc["tool_runtimes"] = json!([tool_host]);
    let flow = compiled(doc, &registry);
    let mut pack = ToolCatalog::new();
    pack.insert(flow.as_tool("flow", "graph")).unwrap();
    let pack = install(&mut registry, "flow-tools", ModuleInstance::ToolPack(pack));
    let root = nofy_agent_runtime::compile::compile_agent(
        serde_json::from_value(
            json!({"name":"root-agent","model":root_model,"prompt":prompt,"tool_packs":[pack]}),
        )
        .unwrap(),
        &registry,
    )
    .unwrap();
    let sql = rusqlite::Connection::open(&path).unwrap();
    sql.execute_batch("CREATE TRIGGER lose_graph_event_ack BEFORE UPDATE ON agent_runtime_checkpoints WHEN json_extract(NEW.payload,'$.state.data.nodes.effect.status')='completed' AND json_array_length(json_extract(NEW.payload,'$.state.data.facts'))=0 BEGIN SELECT RAISE(ABORT,'lost graph event ack'); END;").unwrap();
    assert!(matches!(
        RunSupervisor::new(store.clone())
            .execute(&root, RunInput::new("start"), context())
            .await,
        Err(Error::Checkpoint(_))
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    let events = store.events("root", 0, 1000).await.unwrap();
    let ends=events.iter().filter(|e|matches!(&e.event,agent::RunEvent::Workflow{name,node_id,..} if name=="node_end" && node_id.as_deref()==Some("effect"))).collect::<Vec<_>>();
    assert_eq!(ends.len(), 1);
    let first_cursor = ends[0].cursor;
    sql.execute_batch("DROP TRIGGER lose_graph_event_ack")
        .unwrap();
    drop(sql);
    let reopened = SqliteStore::open(&path).unwrap();
    assert!(matches!(
        RunSupervisor::new(reopened.clone())
            .execute(&root, RunInput::resume(), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    assert_eq!(root_calls.load(Ordering::SeqCst), 2);
    let events = reopened.events("root", 0, 1000).await.unwrap();
    let ends=events.iter().filter(|e|matches!(&e.event,agent::RunEvent::Workflow{name,node_id,..} if name=="node_end" && node_id.as_deref()==Some("effect"))).collect::<Vec<_>>();
    assert_eq!(ends.len(), 1);
    assert_eq!(ends[0].cursor, first_cursor);
    assert!(
        events
            .iter()
            .any(|e| matches!(&e.event,agent::RunEvent::Workflow{name,..} if name=="workflow_end"))
    );
}

#[tokio::test]
#[cfg(feature = "sqlite")]
async fn control_tree_records_human_branch_join_subworkflow_and_iteration_without_changing_calls() {
    use nofy_agent_runtime::{
        durable::SqliteStore,
        mailbox::{InputAddress, MailEnvelope, MailInput, MailboxSender},
        supervisor::{ChildReconciliation, RunSupervisor},
    };
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let mut registry = ModuleRegistry::default();
    let calls = Arc::new(AtomicUsize::new(0));
    let model = install(
        &mut registry,
        "root-model",
        ModuleInstance::Model(Arc::new(ScriptModel {
            root: true,
            calls: calls.clone(),
        })),
    );
    let prompt = install(
        &mut registry,
        "prompt",
        ModuleInstance::Prompt(Arc::new(StaticPrompt("system".into()))),
    );
    let condition = node(
        "condition",
        &[],
        value(json!(true)),
        json!({"kind":"condition","equals":true}),
    );
    let human = node(
        "human",
        &["condition"],
        value(json!("continue")),
        json!({"kind":"human","response_schema":{"type":"boolean"}}),
    );
    let mut skipped = node(
        "skipped",
        &["condition"],
        value(json!(false)),
        json!({"kind":"transform"}),
    );
    skipped["when"] = json!({"value":output("condition",""),"equals":false});
    let sub = node(
        "sub",
        &["human"],
        value(json!({"done":true})),
        json!({"kind":"subworkflow","workflow":r("leaf")}),
    );
    let loop_ = node(
        "loop",
        &["sub"],
        output("sub", ""),
        json!({"kind":"loop","workflow":r("leaf"),"max_iterations":2,"until":{"value":input("/done"),"equals":true}}),
    );
    let join = node(
        "join",
        &["loop", "skipped"],
        output("loop", ""),
        json!({"kind":"join","mode":"all_settled"}),
    );
    let leaf = spec(
        "leaf",
        vec![node("leaf", &[], input(""), json!({"kind":"transform"}))],
        output("leaf", ""),
    );
    let flow = compiled(
        document(vec![
            spec(
                "main",
                vec![condition, human, skipped, sub, loop_, join],
                output("join", ""),
            ),
            leaf,
        ]),
        &registry,
    );
    let mut pack = ToolCatalog::new();
    pack.insert(flow.as_tool("flow", "Control tree")).unwrap();
    let pack = install(&mut registry, "flow-tools", ModuleInstance::ToolPack(pack));
    let compiled = nofy_agent_runtime::compile::compile_agent(
        serde_json::from_value(
            json!({"name":"root-agent","model":model,"prompt":prompt,"tool_packs":[pack]}),
        )
        .unwrap(),
        &registry,
    )
    .unwrap();
    let supervisor = RunSupervisor::new(store.clone());
    let RunOutcome::Paused { reason, .. } = supervisor
        .execute(&compiled, RunInput::new("start"), context())
        .await
        .unwrap()
    else {
        panic!("expected human")
    };
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    let children = store.children("root").await.unwrap();
    let human = children
        .iter()
        .find(|c| c.kind.as_deref() == Some("workflow_human"))
        .unwrap();
    assert_eq!(human.status, "waiting");
    assert!(human.checkpoint_key.is_some());
    let address = InputAddress {
        root_run_id: "root".into(),
        run_id: human.run_id.clone(),
        thread_id: human.thread_id.clone(),
        agent: human.agent_name.clone(),
    };
    assert!(store.cancel(&address, "wrong-control").await.is_err());
    assert!(
        store
            .submit(MailEnvelope {
                address,
                input_id: "wrong-input".into(),
                input: MailInput::Interject {
                    message: nofy_interjection_core::PendingInterjection {
                        text: "no".into(),
                        attachments: vec![]
                    }
                }
            })
            .await
            .is_err()
    );
    assert!(
        supervisor
            .reconcile_child(
                &compiled,
                &context(),
                ChildReconciliation {
                    child_run_id: human.run_id.clone(),
                    call: ToolCall {
                        id: "fake".into(),
                        name: "effect".into(),
                        arguments: json!({})
                    },
                    result: json!({}),
                    is_error: false,
                    model_sequence: Some(0)
                }
            )
            .await
            .is_err()
    );
    flow.respond(
        &store,
        HumanResponse {
            command_id: "continue".into(),
            thread_id: reason["thread_id"].as_str().unwrap().into(),
            run_id: reason["run_id"].as_str().unwrap().into(),
            workflow_identity: flow.identity().into(),
            reference: r("main"),
            node: "human".into(),
            expected_request: json!("continue"),
            value: json!(true),
        },
    )
    .await
    .unwrap();
    assert!(matches!(
        supervisor
            .execute(&compiled, RunInput::resume(), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(calls.load(Ordering::SeqCst), 2);
    let children = store.children("root").await.unwrap();
    let ids = children
        .iter()
        .map(|c| c.run_id.as_str())
        .collect::<std::collections::BTreeSet<_>>();
    for child in &children {
        assert!(
            child.parent_run_id == "root" || ids.contains(child.parent_run_id.as_str()),
            "orphan {}",
            child.run_id
        );
        assert_ne!(child.run_id, child.parent_run_id);
    }
    for kind in [
        "workflow_condition",
        "workflow_human",
        "workflow_subworkflow",
        "workflow_loop",
        "workflow_iteration",
        "workflow_join",
    ] {
        assert!(
            children
                .iter()
                .any(|c| c.kind.as_deref() == Some(kind) && c.status == "completed"),
            "missing {kind}"
        );
    }
    assert!(
        children
            .iter()
            .any(|c| c.node_id.as_deref() == Some("skipped") && c.status == "skipped")
    );
    let snapshot = serde_json::to_value(&children).unwrap();
    supervisor
        .execute(&compiled, RunInput::resume(), context())
        .await
        .unwrap();
    assert_eq!(
        serde_json::to_value(store.children("root").await.unwrap()).unwrap(),
        snapshot
    );
}

#[tokio::test]
async fn corrupted_checkpoint_with_unknown_node_fails_closed_without_abort() {
    let registry = ModuleRegistry::default();
    let store: Arc<dyn Checkpointer> = Arc::new(InMemoryCheckpointer::default());
    let flow = compiled(
        document(vec![spec(
            "main",
            vec![node(
                "step",
                &[],
                value(json!("ok")),
                json!({"kind":"transform"}),
            )],
            output("step", ""),
        )]),
        &registry,
    )
    .with_checkpointer(store.clone());

    let reference = r("main");
    let ctx = context();
    let key =
        serde_json::to_string(&("workflow-graph-v1", &ctx.thread_id, &ctx.run_id, &reference))
            .unwrap();
    let corrupt = WorkflowProgress {
        version: 1,
        run_id: ctx.run_id.clone(),
        reference: reference.clone(),
        input: json!({}),
        nodes: BTreeMap::from([(
            "ghost-node".into(),
            NodeProgress::Running {
                attempt: 0,
                input: json!({}),
            },
        )]),
        output: None,
        facts: Default::default(),
        started: true,
        human: BTreeMap::new(),
        halted: None,
        control_epoch: 0,
        recovering: None,
    };
    store
        .save(
            &key,
            None,
            Checkpoint {
                version: 1,
                revision: 1,
                composition: flow.identity().into(),
                state: RunState {
                    data: serde_json::to_value(&corrupt).unwrap(),
                    ..Default::default()
                },
            },
        )
        .await
        .unwrap();

    assert!(matches!(
        flow.inspect(store.as_ref(), &ctx.thread_id, &ctx.run_id, &reference)
            .await,
        Err(Error::Checkpoint(_))
    ));
    assert!(matches!(
        flow.invoke(json!({}), RunInput::resume(), ctx).await,
        Err(Error::Checkpoint(_))
    ));
}

#[cfg(feature = "sqlite")]
struct CoordinatedSibling {
    calls: Arc<AtomicUsize>,
    started: Arc<tokio::sync::Notify>,
    release: Arc<tokio::sync::Notify>,
    aborted: Arc<std::sync::atomic::AtomicBool>,
}

#[cfg(feature = "sqlite")]
impl Tool for CoordinatedSibling {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("sibling").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        ToolDescription::new(
            "sibling",
            "Wait until released without being cancelled by peer pause",
        )
    }
    async fn run(
        &self,
        _: ToolCallContext,
        args: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        struct DropGuard {
            aborted: Arc<std::sync::atomic::AtomicBool>,
            completed: bool,
        }
        impl Drop for DropGuard {
            fn drop(&mut self) {
                if !self.completed {
                    self.aborted.store(true, Ordering::SeqCst);
                }
            }
        }
        self.calls.fetch_add(1, Ordering::SeqCst);
        let mut guard = DropGuard {
            aborted: self.aborted.clone(),
            completed: false,
        };
        self.started.notify_one();
        self.release.notified().await;
        guard.completed = true;
        Ok(args)
    }
}

#[tokio::test]
#[cfg(feature = "sqlite")]
async fn parallel_peer_pause_preserves_running_sibling_and_completes_without_duplicate_effect() {
    use nofy_agent_runtime::{
        durable::SqliteStore,
        supervisor::{DurableApprovalPolicy, RunSupervisor, jobs::*},
        system::*,
    };
    let dir = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&dir.path().join("runtime.sqlite")).unwrap();
    let gated_calls = Arc::new(AtomicUsize::new(0));
    let sibling_calls = Arc::new(AtomicUsize::new(0));
    let sibling_started = Arc::new(tokio::sync::Notify::new());
    let sibling_release = Arc::new(tokio::sync::Notify::new());
    let sibling_aborted = Arc::new(std::sync::atomic::AtomicBool::new(false));

    let mut gated_catalog = ToolCatalog::new();
    gated_catalog
        .insert(ToolEntry::typed(Effect {
            count: gated_calls.clone(),
            fail: 0,
        }))
        .unwrap();
    let mut sibling_catalog = ToolCatalog::new();
    sibling_catalog
        .insert(ToolEntry::typed(CoordinatedSibling {
            calls: sibling_calls.clone(),
            started: sibling_started.clone(),
            release: sibling_release.clone(),
            aborted: sibling_aborted.clone(),
        }))
        .unwrap();

    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "tool.gated",
            "1",
            ModuleInstance::ToolPack(gated_catalog),
        )))
        .unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "tool.sibling",
            "1",
            ModuleInstance::ToolPack(sibling_catalog),
        )))
        .unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "policy.approval",
            "1",
            ModuleInstance::Policy(Arc::new(DurableApprovalPolicy::new(store.clone()))),
        )))
        .unwrap();

    let doc: SystemDocument = serde_json::from_value(json!({
        "schema_version": 1,
        "name": "parallel-pause-system",
        "modules": [
            {"reference": r("gated-pack"), "factory": "tool.gated", "config": {}},
            {"reference": r("sibling-pack"), "factory": "tool.sibling", "config": {}},
            {"reference": r("approval"), "factory": "policy.approval", "config": {}}
        ],
        "programs": {
            "parallel": {
                "kind": "workflow",
                "input": {},
                "document": {
                    "host": {"name": "parallel-host"},
                    "entry": r("main"),
                    "tool_runtimes": [
                        {
                            "reference": r("gated-rt"),
                            "definition": {
                                "name": "gated-rt",
                                "tool_packs": [r("gated-pack")],
                                "policies": [r("approval")]
                            }
                        },
                        {
                            "reference": r("sibling-rt"),
                            "definition": {
                                "name": "sibling-rt",
                                "tool_packs": [r("sibling-pack")]
                            }
                        }
                    ],
                    "workflows": [{
                        "reference": r("main"),
                        "input_schema": true,
                        "output_schema": true,
                        "parallelism": 2,
                        "nodes": [
                            {
                                "id": "gated",
                                "needs": [],
                                "input": {"from": "literal", "value": {"branch": "a"}},
                                "action": {"kind": "tool", "runtime": r("gated-rt"), "tool": "effect"}
                            },
                            {
                                "id": "sibling",
                                "needs": [],
                                "input": {"from": "literal", "value": {"branch": "b"}},
                                "action": {"kind": "tool", "runtime": r("sibling-rt"), "tool": "sibling"}
                            },
                            {
                                "id": "join",
                                "needs": ["gated", "sibling"],
                                "input": {
                                    "from": "object",
                                    "fields": {
                                        "a": {"from": "node", "node": "gated", "pointer": ""},
                                        "b": {"from": "node", "node": "sibling", "pointer": ""}
                                    }
                                },
                                "action": {"kind": "join"}
                            }
                        ],
                        "output": {"from": "node", "node": "join", "pointer": ""}
                    }]
                }
            }
        }
    }))
    .unwrap();
    let system = compile_system(doc, &registry).unwrap();
    let supervisor = RunSupervisor::new(store.clone());
    supervisor
        .submit_managed(
            ManagedRunRequest {
                approval_mode: None,
                run_id: "parallel-pause".into(),
                thread_id: "thread".into(),
                system: "parallel-pause-system".into(),
                release: system.bundle.digest.clone(),
                program: "parallel".into(),
                input: None,
                parameters: None,
            },
            &system,
        )
        .await
        .unwrap();

    let worker = {
        let store = store.clone();
        let registry = registry.clone();
        tokio::spawn(async move {
            RunSupervisor::new(store)
                .execute_submitted(&registry, "parallel-pause")
                .await
        })
    };

    tokio::time::timeout(
        std::time::Duration::from_secs(3),
        sibling_started.notified(),
    )
    .await
    .unwrap();
    let approval = tokio::time::timeout(std::time::Duration::from_secs(3), async {
        loop {
            let pending = store.pending_approvals("parallel-pause").await.unwrap();
            if let Some(request) = pending.into_iter().next() {
                break request;
            }
            tokio::time::sleep(std::time::Duration::from_millis(10)).await;
        }
    })
    .await
    .unwrap();

    // Give the graph loop time to observe node `gated` pausing while `sibling` is still running.
    tokio::time::timeout(std::time::Duration::from_secs(3), async {
        loop {
            let children = store.children("parallel-pause").await.unwrap();
            if children.iter().any(|c| {
                c.node_id.as_deref() == Some("gated")
                    && c.kind.as_deref() == Some("workflow_tool")
                    && c.status == "waiting"
            }) {
                break;
            }
            tokio::time::sleep(std::time::Duration::from_millis(10)).await;
        }
    })
    .await
    .unwrap();

    // Node `gated` pausing must NOT kill or cancel the still-running sibling.
    assert!(!sibling_aborted.load(Ordering::SeqCst));
    let mid_page = store
        .work_list("parallel-pause", None, 64)
        .await
        .unwrap()
        .unwrap();
    assert!(
        mid_page
            .items
            .iter()
            .all(|item| item.status != "cancelled" && item.native_status != "cancelled"),
        "running sibling must never be marked cancelled while peer pauses: {:?}",
        mid_page
            .items
            .iter()
            .map(|i| (&i.node_id, &i.kind, &i.status, &i.native_status))
            .collect::<Vec<_>>()
    );

    // Let sibling finish naturally; workflow should settle in Paused with zero cancelled items.
    sibling_release.notify_one();
    let paused = tokio::time::timeout(std::time::Duration::from_secs(3), worker)
        .await
        .unwrap()
        .unwrap()
        .unwrap();
    assert!(matches!(paused, Some(RunOutcome::Paused { .. })));
    assert!(!sibling_aborted.load(Ordering::SeqCst));
    assert_eq!(sibling_calls.load(Ordering::SeqCst), 1);
    assert_eq!(gated_calls.load(Ordering::SeqCst), 0);

    let paused_children = store.children("parallel-pause").await.unwrap();
    assert!(
        paused_children.iter().all(|c| c.status != "cancelled"),
        "paused workflow must not record cancelled children: {paused_children:?}"
    );
    let paused_page = store
        .work_list("parallel-pause", None, 64)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(paused_page.root.status, "waiting");
    assert!(
        paused_page
            .items
            .iter()
            .all(|item| item.status != "cancelled" && item.native_status != "cancelled"),
        "work.list must not report cancelled items during peer pause"
    );
    assert!(
        paused_page
            .items
            .iter()
            .any(|item| item.node_id.as_deref() == Some("gated") && item.status == "waiting")
    );
    assert!(
        paused_page
            .items
            .iter()
            .any(|item| item.node_id.as_deref() == Some("sibling") && item.status == "completed")
    );

    // Approve `gated` and resume: DAG converges to Completed without repeating `sibling`.
    store.decide(&approval, true).await.unwrap();
    store
        .enqueue_managed_action(ManagedAction {
            command_id: "resume-parallel".into(),
            run_id: "parallel-pause".into(),
            command: ManagedCommand::Resume,
        })
        .await
        .unwrap();
    let resumed = supervisor
        .execute_managed_action(&registry, "resume-parallel")
        .await
        .unwrap();
    assert!(resumed.finished && resumed.error.is_none(), "{resumed:?}");
    let Some(outcome) = resumed.outcome else {
        panic!("expected completed outcome after approval");
    };
    assert_eq!(
        result(outcome),
        json!({"a": {"branch": "a"}, "b": {"branch": "b"}})
    );
    assert_eq!(gated_calls.load(Ordering::SeqCst), 1);
    assert_eq!(sibling_calls.load(Ordering::SeqCst), 1);
}

#[tokio::test]
#[cfg(feature = "sqlite")]
async fn external_cancel_immediately_cancels_parallel_batch_and_marks_children_cancelled() {
    use nofy_agent_runtime::{durable::SqliteStore, supervisor::RunSupervisor, system::*};
    let dir = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&dir.path().join("runtime.sqlite")).unwrap();
    let started_a = Arc::new(tokio::sync::Notify::new());
    let started_b = Arc::new(tokio::sync::Notify::new());
    let release_a = Arc::new(tokio::sync::Notify::new());
    let release_b = Arc::new(tokio::sync::Notify::new());
    let aborted_a = Arc::new(std::sync::atomic::AtomicBool::new(false));
    let aborted_b = Arc::new(std::sync::atomic::AtomicBool::new(false));

    let mut catalog_a = ToolCatalog::new();
    catalog_a
        .insert(ToolEntry::typed(CoordinatedSibling {
            calls: Arc::new(AtomicUsize::new(0)),
            started: started_a.clone(),
            release: release_a,
            aborted: aborted_a.clone(),
        }))
        .unwrap();
    let mut catalog_b = ToolCatalog::new();
    catalog_b
        .insert(ToolEntry::typed(CoordinatedSibling {
            calls: Arc::new(AtomicUsize::new(0)),
            started: started_b.clone(),
            release: release_b,
            aborted: aborted_b.clone(),
        }))
        .unwrap();

    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "tool.a",
            "1",
            ModuleInstance::ToolPack(catalog_a),
        )))
        .unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "tool.b",
            "1",
            ModuleInstance::ToolPack(catalog_b),
        )))
        .unwrap();

    let doc: SystemDocument = serde_json::from_value(json!({
        "schema_version": 1,
        "name": "parallel-cancel-system",
        "modules": [
            {"reference": r("pack-a"), "factory": "tool.a", "config": {}},
            {"reference": r("pack-b"), "factory": "tool.b", "config": {}}
        ],
        "programs": {
            "parallel": {
                "kind": "workflow",
                "input": {},
                "document": {
                    "host": {"name": "cancel-host"},
                    "entry": r("main"),
                    "tool_runtimes": [
                        {"reference": r("rt-a"), "definition": {"name": "rt-a", "tool_packs": [r("pack-a")]}},
                        {"reference": r("rt-b"), "definition": {"name": "rt-b", "tool_packs": [r("pack-b")]}}
                    ],
                    "workflows": [{
                        "reference": r("main"),
                        "input_schema": true,
                        "output_schema": true,
                        "parallelism": 2,
                        "nodes": [
                            {
                                "id": "node_a",
                                "needs": [],
                                "input": {"from": "literal", "value": {"n": "a"}},
                                "action": {"kind": "tool", "runtime": r("rt-a"), "tool": "sibling"}
                            },
                            {
                                "id": "node_b",
                                "needs": [],
                                "input": {"from": "literal", "value": {"n": "b"}},
                                "action": {"kind": "tool", "runtime": r("rt-b"), "tool": "sibling"}
                            },
                            {
                                "id": "join",
                                "needs": ["node_a", "node_b"],
                                "input": {"from": "literal", "value": true},
                                "action": {"kind": "join"}
                            }
                        ],
                        "output": {"from": "node", "node": "join", "pointer": ""}
                    }]
                }
            }
        }
    }))
    .unwrap();
    let system = compile_system(doc, &registry).unwrap();
    let run_ctx = RunContext::new("cancel-thread", "cancel-root");
    let external_cancel = run_ctx.cancel.clone();

    let worker = {
        let store = store.clone();
        tokio::spawn(async move {
            let program = system.program("parallel").unwrap();
            RunSupervisor::new(store)
                .execute_program(program, RunInput::default(), run_ctx)
                .await
        })
    };

    tokio::time::timeout(std::time::Duration::from_secs(3), async {
        tokio::join!(started_a.notified(), started_b.notified());
    })
    .await
    .unwrap();

    // True external cancellation immediately stops both siblings and returns Cancelled.
    external_cancel.cancel();
    let outcome = tokio::time::timeout(std::time::Duration::from_secs(3), worker)
        .await
        .unwrap()
        .unwrap()
        .unwrap();
    assert!(
        matches!(outcome, RunOutcome::Cancelled { .. }),
        "{outcome:?}"
    );
    assert!(aborted_a.load(Ordering::SeqCst));
    assert!(aborted_b.load(Ordering::SeqCst));
}

#[tokio::test]
#[cfg(feature = "sqlite")]
async fn targeted_child_cancel_marks_only_target_cancelled_and_peer_waiting() {
    use nofy_agent_runtime::{
        durable::SqliteStore,
        mailbox::{InputAddress, MailboxSender},
        supervisor::RunSupervisor,
    };
    let dir = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&dir.path().join("runtime.sqlite")).unwrap();
    let mut registry = ModuleRegistry::default();
    let started_a = Arc::new(tokio::sync::Notify::new());
    let started_b = Arc::new(tokio::sync::Notify::new());
    let model_a = install(
        &mut registry,
        "wait-a",
        ModuleInstance::Model(Arc::new(WaitingModel(started_a.clone()))),
    );
    let model_b = install(
        &mut registry,
        "wait-b",
        ModuleInstance::Model(Arc::new(WaitingModel(started_b.clone()))),
    );
    let root_model = install(
        &mut registry,
        "root-model",
        ModuleInstance::Model(Arc::new(ScriptModel {
            root: true,
            calls: Arc::new(AtomicUsize::new(0)),
        })),
    );
    let prompt = install(
        &mut registry,
        "prompt",
        ModuleInstance::Prompt(Arc::new(StaticPrompt("system".into()))),
    );
    let mut doc = document(vec![spec(
        "main",
        vec![
            node(
                "branch_a",
                &[],
                input(""),
                json!({"kind": "agent", "agent": r("worker_a")}),
            ),
            node(
                "branch_b",
                &[],
                input(""),
                json!({"kind": "agent", "agent": r("worker_b")}),
            ),
            node(
                "join",
                &["branch_a", "branch_b"],
                value(json!(true)),
                json!({"kind": "join"}),
            ),
        ],
        output("join", ""),
    )]);
    doc["agents"] = json!([
        {"reference": r("worker_a"), "definition": {"name": "agent-a", "model": model_a, "prompt": prompt}},
        {"reference": r("worker_b"), "definition": {"name": "agent-b", "model": model_b, "prompt": prompt}}
    ]);
    let flow = compiled(doc, &registry);
    let mut pack = ToolCatalog::new();
    pack.insert(flow.as_tool("flow", "Parallel agents"))
        .unwrap();
    let pack = install(&mut registry, "flow-tools", ModuleInstance::ToolPack(pack));
    let root = nofy_agent_runtime::compile::compile_agent(
        serde_json::from_value(json!({
            "name": "root-agent",
            "model": root_model,
            "prompt": prompt,
            "tool_packs": [pack]
        }))
        .unwrap(),
        &registry,
    )
    .unwrap();

    let worker = {
        let store = store.clone();
        tokio::spawn(async move {
            RunSupervisor::new(store)
                .execute(&root, RunInput::new("start"), context())
                .await
        })
    };
    tokio::time::timeout(std::time::Duration::from_secs(3), async {
        tokio::join!(started_a.notified(), started_b.notified());
    })
    .await
    .unwrap();

    let target_a = store
        .children("root")
        .await
        .unwrap()
        .into_iter()
        .find(|c| c.agent_name == "agent-a")
        .unwrap();
    store
        .cancel(
            &InputAddress {
                root_run_id: "root".into(),
                run_id: target_a.run_id,
                thread_id: target_a.thread_id,
                agent: target_a.agent_name,
            },
            "cancel-branch-a",
        )
        .await
        .unwrap();
    let outcome = tokio::time::timeout(std::time::Duration::from_secs(3), worker)
        .await
        .unwrap()
        .unwrap()
        .unwrap();
    assert!(
        matches!(outcome, RunOutcome::Cancelled { .. }),
        "{outcome:?}"
    );

    let children = store.children("root").await.unwrap();
    assert!(
        children.iter().any(|c| {
            c.node_id.as_deref() == Some("branch_a")
                && c.kind.as_deref() == Some("workflow_agent")
                && c.status == "cancelled"
        }),
        "explicitly cancelled branch_a control node must be cancelled: {children:?}"
    );
    assert!(
        children.iter().any(|c| {
            c.node_id.as_deref() == Some("branch_b")
                && c.kind.as_deref() == Some("workflow_agent")
                && c.status == "waiting"
        }),
        "peer-interrupted branch_b control node must be waiting, not cancelled: {children:?}"
    );
}
