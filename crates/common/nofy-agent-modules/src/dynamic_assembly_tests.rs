use super::*;
use nofy_agent_runtime::{governance::*, *};
use nofy_tool_runtime::{Tool, ToolCallContext};
use nofy_tool_types::ToolDescription;
use std::sync::{
    Mutex,
    atomic::{AtomicBool, AtomicUsize, Ordering},
};

fn r(name: &str) -> ModuleRef {
    ModuleRef::new(name, "1")
}
fn agent_request() -> Value {
    json!({"kind":"agent","prompt":"work","document":{
        "modules":[{"reference":r("instructions"),"factory":"prompt.static","config":{"text":"Dynamic specialist"},"dependencies":{}}],
        "agent":{"name":"specialist","model":r("model"),"prompt":r("instructions"),"tool_packs":[r("tools")],"settings":{"max_steps":4,"model":{}}}
    }})
}
fn workflow_request() -> Value {
    json!({"kind":"workflow","input":{},"document":{
        "modules":[],"agents":[],"tool_runtimes":[{"reference":r("runtime"),"definition":{"name":"tools","tool_packs":[r("tools")]}}],
        "entry":r("flow"),"host":{"name":"host"},
        "workflows":[{"reference":r("flow"),"input_schema":{},"output_schema":{},"nodes":[
            {"id":"read","action":{"kind":"tool","runtime":r("runtime"),"tool":"read"}}
        ],"output":{"from":"node","node":"read"}}]
    }})
}

#[derive(Clone)]
struct Child {
    requests: Arc<Mutex<Vec<ModelRequest>>>,
    bindings: Arc<AtomicUsize>,
}
#[async_trait::async_trait]
impl Model for Child {
    fn bind_scope(&self, _: &mut RunContext) -> Result<(), Error> {
        self.bindings.fetch_add(1, Ordering::SeqCst);
        Ok(())
    }
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.requests.lock().unwrap().push(request.clone());
        if request
            .messages
            .iter()
            .any(|m| matches!(m, Message::Tool { .. }))
        {
            Ok(ModelResponse {
                output: "child finished".into(),
                ..Default::default()
            })
        } else {
            Ok(ModelResponse {
                tool_calls: vec![ToolCall {
                    id: "read-call".into(),
                    name: "read".into(),
                    arguments: json!({}),
                }],
                ..Default::default()
            })
        }
    }
}
struct Parent {
    tool_name: &'static str,
    args: Value,
    calls: Arc<AtomicUsize>,
}
#[async_trait::async_trait]
impl Model for Parent {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.calls.fetch_add(1, Ordering::SeqCst);
        if let Some(Message::Tool { content, .. }) = request
            .messages
            .iter()
            .rev()
            .find(|m| matches!(m, Message::Tool { .. }))
        {
            Ok(ModelResponse {
                output: content.to_string(),
                ..Default::default()
            })
        } else {
            Ok(ModelResponse {
                tool_calls: vec![ToolCall {
                    id: "assemble-call".into(),
                    name: self.tool_name.into(),
                    arguments: self.args.clone(),
                }],
                ..Default::default()
            })
        }
    }
}
struct Counter(Arc<AtomicUsize>, Arc<AtomicBool>);
impl Tool for Counter {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("read").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        let mut d = ToolDescription::new("read", "read");
        d.arguments_schema = Some(json!({"type":"object","additionalProperties":false}));
        d
    }
    async fn run(
        &self,
        _: ToolCallContext,
        _: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        let count = self.0.fetch_add(1, Ordering::SeqCst) + 1;
        if self.1.load(Ordering::SeqCst) {
            futures::future::pending::<()>().await;
        }
        Ok(json!({"count":count}))
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
        Ok(if call.name == "read" && !self.0.load(Ordering::SeqCst) {
            Admission::Pause(json!("approval"))
        } else {
            Admission::Allow
        })
    }
}
struct Deny;
#[async_trait::async_trait]
impl Policy for Deny {
    async fn admit(
        &self,
        call: &ToolCall,
        _: &RunState,
        _: &RunContext,
    ) -> Result<Admission, Error> {
        Ok(if call.name == "read" {
            Admission::Deny("host floor".into())
        } else {
            Admission::Allow
        })
    }
}
struct Fixture {
    registry: ModuleRegistry,
    tools: ToolCatalog,
    child: Child,
    effects: Arc<AtomicUsize>,
    hang: Arc<AtomicBool>,
    parent_calls: Arc<AtomicUsize>,
}
impl Fixture {
    fn new() -> Self {
        let mut registry = ModuleRegistry::default();
        registry
            .register_factory(Arc::new(StaticPromptFactory))
            .unwrap();
        registry
            .register_factory(Arc::new(DynamicAssemblyFactory))
            .unwrap();
        let child = Child {
            requests: Default::default(),
            bindings: Default::default(),
        };
        let effects = Arc::new(AtomicUsize::new(0));
        let mut tools = ToolCatalog::new();
        let hang = Arc::new(AtomicBool::new(false));
        tools
            .insert(ToolEntry::typed(Counter(effects.clone(), hang.clone())))
            .unwrap();
        for (name, instance) in [
            ("model", ModuleInstance::Model(Arc::new(child.clone()))),
            ("tools", ModuleInstance::ToolPack(tools)),
        ] {
            registry
                .register_factory(Arc::new(InstanceFactory::new(name, "1", instance)))
                .unwrap();
            registry
                .define(ModuleDefinition {
                    reference: r(name),
                    factory: name.into(),
                    config: json!({}),
                    dependencies: Default::default(),
                })
                .unwrap();
        }
        registry.define(ModuleDefinition {reference:r("dynamic"),factory:"tool.dynamic_assembly".into(),
            config:json!({"name":"assemble","bindings":{"model":"model","tools":"tool_pack"},"max_steps":8,"max_nodes":8}),
            dependencies:BTreeMap::from([("model".into(),r("model")),("tools".into(),r("tools"))])}).unwrap();
        let resolved = registry.resolve(&[r("dynamic")]).unwrap();
        let ModuleInstance::ToolPack(tools) = resolved.instances[&r("dynamic")].clone() else {
            panic!()
        };
        Self {
            registry,
            tools,
            child,
            effects,
            hang,
            parent_calls: Default::default(),
        }
    }
    fn parent(&self, args: Value) -> Agent {
        let mut c = Components::default();
        c.models.insert(
            "parent".into(),
            Arc::new(Parent {
                tool_name: "assemble",
                args,
                calls: self.parent_calls.clone(),
            }),
        );
        c.prompts
            .insert("parent".into(), Arc::new(StaticPrompt("parent".into())));
        c.tool_packs.insert("dynamic".into(), self.tools.clone());
        AgentBuilder::new("parent")
            .model("parent")
            .prompt("parent")
            .tools("dynamic")
            .compile(&c)
            .unwrap()
            .with_checkpointer(Arc::new(InMemoryCheckpointer::default()))
    }
    fn assembly(&self) -> Assembly {
        let mut registry = self.registry.clone();
        registry
            .register_factory(Arc::new(ModelBindingFactory))
            .unwrap();
        registry
            .register_factory(Arc::new(RequestIdentityFactory))
            .unwrap();
        Assembly {
            config: Config {
                name: "assemble".into(),
                bindings: BTreeMap::new(),
                max_steps: 8,
                max_nodes: 8,
            },
            frozen: registry
                .resolve_typed(&[
                    (r("model"), ModuleKind::Model),
                    (r("tools"), ModuleKind::ToolPack),
                ])
                .unwrap()
                .snapshot
                .into_iter()
                .map(|m| (m.definition.reference.clone(), m))
                .collect(),
            registry,
            allowed: BTreeMap::from([
                (r("model"), ModuleKind::Model),
                (r("tools"), ModuleKind::ToolPack),
            ]),
            identity: "test".into(),
            schema: json!({"type":"object","additionalProperties":false,"required":["kind","document"],"properties":{"kind":{"enum":["agent","workflow"]},"document":{"type":"object"},"prompt":{"type":"string","maxLength":65536},"input":{}},"oneOf":[
                {"type":"object","additionalProperties":false,"required":["kind","document","prompt"],"properties":{"kind":{"const":"agent"},"document":{"type":"object"},"prompt":{"type":"string","maxLength":65536}}},
                {"type":"object","additionalProperties":false,"required":["kind","document","input"],"properties":{"kind":{"const":"workflow"},"document":{"type":"object"},"input":{}}}
            ]}),
        }
    }
}
fn context() -> RunContext {
    RunContext::new("root-thread", "root-run")
}

#[test]
fn descriptor_and_schema_publish_allowed_refs_and_reject_undeclared_kinds() {
    let f = Fixture::new();
    let definition = &f.tools.get("assemble").unwrap().definition;
    assert_eq!(definition.function.parameters["type"], json!("object"));
    assert_eq!(
        definition.function.parameters["additionalProperties"],
        json!(false)
    );
    assert!(definition.function.parameters["properties"]["kind"].is_object());
    assert!(definition.function.parameters["properties"]["document"].is_object());
    let text = serde_json::to_string(definition).unwrap();
    assert!(text.contains("model") && text.contains("tools") && text.contains("version"));
    assert!(
        DynamicAssemblyFactory
            .config_dependencies(&json!({"name":"a","bindings":{"evil":"binding"}}))
            .is_err()
    );
    assert!(
        DynamicAssemblyFactory
            .config_dependencies(&json!({"name":"a","bindings":{"m":"model"},"max_steps":257}))
            .is_err()
    );
    assert!(f.tools.get("assemble").unwrap().dispatch.is_resumable());
}

#[test]
fn rejects_authority_escape_local_factories_and_unlisted_dependencies() {
    let f = Fixture::new();
    let a = f.assembly();
    let original = agent_request();
    for field in [
        "policies",
        "governance",
        "bindings",
        "hooks",
        "tool_sources",
        "context_sources",
        "context_policies",
        "middleware",
    ] {
        let mut args = original.clone();
        args["document"]["agent"][field] = json!([r("tools")]);
        assert!(a.prepare(args).is_err(), "{field}");
    }
    for field in ["checkpointer", "recipe", "session_policy"] {
        let mut args = original.clone();
        args["document"]["agent"][field] = json!(r("tools"));
        assert!(a.prepare(args).is_err(), "{field}");
    }
    let mut args = original.clone();
    args["document"]["agent"]["model"] = json!(r("unlisted"));
    assert!(a.prepare(args).is_err());
    let mut args = original.clone();
    args["document"]["modules"][0]["factory"] = json!("tool.shell");
    assert!(a.prepare(args).is_err());
    let mut args = original.clone();
    args["document"]["modules"][0]["dependencies"] = json!({"x":r("tools")});
    assert!(a.prepare(args).is_err());
    let mut args = original.clone();
    args["document"]["modules"][0]["reference"] = json!(r("model"));
    assert!(a.prepare(args).is_err());
    let mut args = original.clone();
    args["document"]["agent"]["settings"]["max_steps"] = json!(9);
    assert!(a.prepare(args).is_err());
    let mut args = original.clone();
    args["document"]["agent"]["tool_packs"] = json!([r("tools"), r("tools")]);
    assert!(a.prepare(args).is_err());
    let mut args = original;
    args["extra"] = json!(true);
    assert!(a.prepare(args).is_err());
    assert_eq!(f.effects.load(Ordering::SeqCst), 0);
}

#[test]
fn workflow_rejects_unrecoverable_waits_cycles_and_oversized_graphs() {
    let f = Fixture::new();
    let a = f.assembly();
    let original = workflow_request();
    let mut args = original.clone();
    args["document"]["workflows"][0]["nodes"][0]["action"] =
        json!({"kind":"human","response_schema":{}});
    assert!(a.prepare(args).is_err());
    let mut args = original.clone();
    args["document"]["workflows"][0]["nodes"][0]["on_error"] = json!({"exhausted":"pause"});
    assert!(a.prepare(args).is_err());
    let mut args = original.clone();
    args["document"]["workflows"][0]["nodes"][0]["needs"] = json!(["read"]);
    assert!(a.prepare(args).is_err());
    let mut args = original.clone();
    args["document"]["workflows"][0]["parallelism"] = json!(9);
    assert!(a.prepare(args).is_err());
    let mut args = original.clone();
    args["document"]["host"]["bindings"] = json!([r("tools")]);
    assert!(a.prepare(args).is_err());
    let mut args = original;
    args["document"]["workflows"][0]["nodes"] =
        json!(vec![json!({"id":"n","action":{"kind":"transform"}}); 9]);
    assert!(a.prepare(args).is_err());
    assert_eq!(f.effects.load(Ordering::SeqCst), 0);
}

#[test]
fn workflow_prompt_nodes_preserve_local_and_explicit_dependency_boundaries() {
    let f = Fixture::new();
    let mut a = f.assembly();
    for name in ["bound-prompt", "unlisted-prompt"] {
        a.registry
            .define(ModuleDefinition {
                reference: r(name),
                factory: "prompt.static".into(),
                config: json!({"text":"host prompt"}),
                dependencies: Default::default(),
            })
            .unwrap();
    }
    a.allowed.insert(r("bound-prompt"), ModuleKind::Prompt);
    let bound = a
        .registry
        .resolve_typed(&[(r("bound-prompt"), ModuleKind::Prompt)])
        .unwrap();
    a.frozen.extend(
        bound
            .snapshot
            .into_iter()
            .map(|module| (module.definition.reference.clone(), module)),
    );

    let original = workflow_request();
    assert!(a.prepare(original.clone()).is_ok());
    let mut local = original.clone();
    local["document"]["modules"] = agent_request()["document"]["modules"].clone();
    local["document"]["workflows"][0]["nodes"][0]["action"] =
        json!({"kind":"prompt","prompt":r("instructions")});
    assert!(a.prepare(local).is_ok());

    let mut bound = original.clone();
    bound["document"]["workflows"][0]["nodes"][0]["action"] =
        json!({"kind":"prompt","prompt":r("bound-prompt")});
    assert!(a.prepare(bound).is_ok());
    for name in ["unlisted-prompt", "missing-prompt", "tools"] {
        let mut args = original.clone();
        args["document"]["workflows"][0]["nodes"][0]["action"] =
            json!({"kind":"prompt","prompt":r(name)});
        assert!(
            matches!(a.prepare(args), Err(Error::Composition(message))
                if message == "dynamic reference is outside its explicitly allowed dependencies"),
            "{name} must be rejected by the prompt allowlist"
        );
    }
    assert_eq!(f.effects.load(Ordering::SeqCst), 0);
}

#[test]
fn complete_request_participates_in_recovery_identity() {
    let f = Fixture::new();
    let a = f.assembly();
    for original in [agent_request(), workflow_request()] {
        let identity = |args| {
            a.prepare(args)
                .unwrap()
                .0
                .dispatch
                .recovery_identity()
                .unwrap()
        };
        assert_eq!(identity(original.clone()), identity(original.clone()));
        let mut changed = original.clone();
        if changed["kind"] == "agent" {
            changed["document"]["agent"]["name"] = json!("different");
        } else {
            changed["document"]["host"]["name"] = json!("different");
        }
        assert_ne!(identity(original), identity(changed));
    }
}

#[tokio::test]
async fn model_authored_agent_executes_with_selected_tools_prompt_and_scope() {
    let f = Fixture::new();
    let result = f
        .parent(agent_request())
        .invoke(RunInput::new("go"), context())
        .await
        .unwrap();
    assert!(matches!(result, RunOutcome::Completed { .. }));
    assert_eq!(f.effects.load(Ordering::SeqCst), 1);
    assert_eq!(f.child.requests.lock().unwrap().len(), 2);
    assert_eq!(f.child.bindings.load(Ordering::SeqCst), 1);
    for request in f.child.requests.lock().unwrap().iter() {
        assert_eq!(request.tools.len(), 1);
        assert_eq!(request.tools[0].function.name, "read");
        assert!(
            matches!(&request.messages[0],Message::System{content} if content=="Dynamic specialist")
        );
    }
}

#[tokio::test]
async fn dynamic_agent_and_workflow_preserve_parent_policy_and_resume_without_duplicate_effects() {
    for args in [agent_request(), workflow_request()] {
        let f = Fixture::new();
        let gate = Arc::new(AtomicBool::new(false));
        let store = Arc::new(InMemoryCheckpointer::default());
        let build = || {
            f.parent(args.clone())
                .with_required_policy("approval", Arc::new(Gate(gate.clone())))
                .unwrap()
                .with_checkpointer(store.clone())
        };
        let result = build()
            .invoke(RunInput::new("go"), context())
            .await
            .unwrap();
        assert!(matches!(result, RunOutcome::Paused { .. }), "{result:?}");
        assert_eq!(f.effects.load(Ordering::SeqCst), 0);
        assert_eq!(f.parent_calls.load(Ordering::SeqCst), 1);
        gate.store(true, Ordering::SeqCst);
        assert!(matches!(
            build().invoke(RunInput::resume(), context()).await.unwrap(),
            RunOutcome::Completed { .. }
        ));
        assert_eq!(f.effects.load(Ordering::SeqCst), 1);
        assert_eq!(f.parent_calls.load(Ordering::SeqCst), 2);
    }
}
#[tokio::test]
async fn policy_denial_cannot_be_bypassed_by_dynamic_tools() {
    for args in [agent_request(), workflow_request()] {
        let f = Fixture::new();
        let _ = f
            .parent(args)
            .with_required_policy("deny", Arc::new(Deny))
            .unwrap()
            .invoke(RunInput::new("go"), context())
            .await;
        assert_eq!(f.effects.load(Ordering::SeqCst), 0);
    }
}
#[tokio::test]
async fn child_budget_and_cancellation_remain_root_owned() {
    let f = Fixture::new();
    let profile = Arc::new(
        GovernanceProfile::new(
            Arc::new(
                InstalledBudget::install(
                    Arc::new(InMemoryBudgetStore::default()),
                    BudgetLimits {
                        max_model_calls: Some(2),
                        ..Default::default()
                    },
                    "budget",
                    1,
                )
                .unwrap(),
            ),
            BudgetLimits::default(),
            ModelRetryPolicy::default(),
        )
        .unwrap(),
    );
    assert!(matches!(
        f.parent(agent_request())
            .with_governance(profile)
            .invoke(RunInput::new("go"), context())
            .await
            .unwrap(),
        RunOutcome::BudgetExceeded { .. }
    ));
    let f = Fixture::new();
    let ctx = context();
    ctx.cancel.cancel();
    assert!(matches!(
        f.parent(agent_request())
            .invoke(RunInput::new("go"), ctx)
            .await
            .unwrap(),
        RunOutcome::Cancelled { .. }
    ));
    assert_eq!(f.effects.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn dynamic_compositions_execute_as_existing_task_children() {
    use nofy_agent_runtime::tasks::declarative::*;
    for args in [agent_request(), workflow_request()] {
        let f = Fixture::new();
        let resource = TasksResourceFactory
            .build(
                &json!({}),
                &BTreeMap::from([("children".into(), ModuleInstance::ToolPack(f.tools.clone()))]),
            )
            .unwrap();
        let deps = BTreeMap::from([("tasks".into(), resource)]);
        let ModuleInstance::Binding(binding) =
            TasksBindingFactory.build(&json!({}), &deps).unwrap()
        else {
            panic!()
        };
        let ModuleInstance::ToolPack(pack) = TasksToolFactory.build(&json!({}), &deps).unwrap()
        else {
            panic!()
        };
        let mut components = Components::default();
        components.models.insert("model".into(),Arc::new(Parent{
            tool_name:"agent_tasks",args:json!({"action":"spawn","task_id":"dynamic-task","tool":"assemble","arguments":args}),
            calls:f.parent_calls.clone()}));
        components
            .prompts
            .insert("prompt".into(), Arc::new(StaticPrompt("coordinate".into())));
        components.tool_packs.insert("tasks".into(), pack);
        let parent = AgentBuilder::new("task-parent")
            .model("model")
            .prompt("prompt")
            .tools("tasks")
            .compile(&components)
            .unwrap()
            .with_binding("tasks", binding)
            .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
        let result = parent.invoke(RunInput::new("go"), context()).await.unwrap();
        assert!(matches!(result, RunOutcome::Completed { .. }), "{result:?}");
        assert_eq!(f.effects.load(Ordering::SeqCst), 1);
    }
}

#[tokio::test]
async fn interrupted_unknown_effect_is_not_replayed_by_dynamic_wrapper() {
    for args in [agent_request(), workflow_request()] {
        let f = Fixture::new();
        f.hang.store(true, Ordering::SeqCst);
        let parent = f.parent(args);
        let running = parent.clone();
        let task =
            tokio::spawn(async move { running.invoke(RunInput::new("go"), context()).await });
        tokio::time::timeout(std::time::Duration::from_secs(5), async {
            while f.effects.load(Ordering::SeqCst) == 0 {
                tokio::task::yield_now().await;
            }
        })
        .await
        .unwrap();
        task.abort();
        let _ = task.await;
        f.hang.store(false, Ordering::SeqCst);
        let result = parent.invoke(RunInput::resume(), context()).await;
        assert!(
            !matches!(result, Ok(RunOutcome::Completed { .. })),
            "ambiguous effect completed: {result:?}"
        );
        assert_eq!(f.effects.load(Ordering::SeqCst), 1);
    }
}

#[tokio::test]
async fn workflow_embedded_agent_uses_selected_model_scope() {
    let f = Fixture::new();
    let child = agent_request();
    let mut args = workflow_request();
    args["document"]["modules"] = child["document"]["modules"].clone();
    args["document"]["agents"] =
        json!([{"reference":r("specialist"),"definition":child["document"]["agent"]}]);
    args["document"]["workflows"][0]["nodes"][0]["action"] =
        json!({"kind":"agent","agent":r("specialist")});
    args["document"]["workflows"][0]["nodes"][0]["input"] =
        json!({"from":"literal","value":"work"});
    let result = f
        .parent(args)
        .invoke(RunInput::new("go"), context())
        .await
        .unwrap();
    assert!(matches!(result, RunOutcome::Completed { .. }), "{result:?}");
    assert_eq!(f.effects.load(Ordering::SeqCst), 1);
    assert_eq!(f.child.bindings.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn published_protocol_examples_are_complete_executable_requests() {
    let f = Fixture::new();
    let text = serde_json::to_value(&f.tools.get("assemble").unwrap().definition).unwrap();
    let description = text["function"]["description"].as_str().unwrap();
    let (_, examples) = description
        .split_once("Complete request examples: agent=")
        .unwrap();
    let (agent, rest) = examples.split_once("; workflow=").unwrap();
    let (workflow, _) = rest.split_once(". Workflow agents").unwrap();
    for (index, text) in [agent, workflow].into_iter().enumerate() {
        let args: Value = serde_json::from_str(text).unwrap();
        f.assembly().prepare(args.clone()).unwrap();
        let result = f
            .parent(args)
            .invoke(
                RunInput::new("go"),
                RunContext::new(format!("example-{index}"), format!("example-run-{index}")),
            )
            .await
            .unwrap();
        assert!(matches!(result, RunOutcome::Completed { .. }), "{result:?}");
    }
    assert_eq!(f.effects.load(Ordering::SeqCst), 2);
}

#[tokio::test]
async fn dynamic_recipes_reopen_from_sqlite_without_retained_factory_instances() {
    for args in [agent_request(), workflow_request()] {
        let directory = tempfile::tempdir().unwrap();
        let path = directory.path().join("dynamic.sqlite");
        {
            let f = Fixture::new();
            let store = Arc::new(durable::SqliteStore::open(&path).unwrap());
            let parent = f
                .parent(args.clone())
                .with_checkpointer(store)
                .with_required_policy("approval", Arc::new(Gate(Arc::new(AtomicBool::new(false)))))
                .unwrap();
            assert!(matches!(
                parent.invoke(RunInput::new("go"), context()).await.unwrap(),
                RunOutcome::Paused { .. }
            ));
            assert_eq!(f.effects.load(Ordering::SeqCst), 0);
        }
        let f = Fixture::new();
        let store = Arc::new(durable::SqliteStore::open(&path).unwrap());
        let parent = f
            .parent(args.clone())
            .with_checkpointer(store)
            .with_required_policy("approval", Arc::new(Gate(Arc::new(AtomicBool::new(true)))))
            .unwrap();
        assert!(matches!(
            parent.invoke(RunInput::resume(), context()).await.unwrap(),
            RunOutcome::Completed { .. }
        ));
        assert_eq!(f.effects.load(Ordering::SeqCst), 1);
        assert_eq!(
            f.parent_calls.load(Ordering::SeqCst),
            1,
            "parent request must come from checkpoint"
        );
        if args["kind"] == "agent" {
            assert_eq!(f.child.requests.lock().unwrap().len(), 1);
        }
    }
}

struct ChangingDependency {
    changed: Arc<AtomicBool>,
    resource: bool,
}
impl ModuleFactory for ChangingDependency {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: if self.resource {
                "resource.changing"
            } else {
                "tool.changing"
            }
            .into(),
            revision: "1".into(),
            kind: if self.resource {
                ModuleKind::Resource
            } else {
                ModuleKind::ToolPack
            },
            config_schema: json!({"type":"object","additionalProperties":false}),
            input_schema: None,
            output_schema: None,
            required_capabilities: Default::default(),
            dependencies: if self.resource {
                BTreeMap::new()
            } else {
                BTreeMap::from([("resource".into(), ModuleKind::Resource)])
            },
        }
    }
    fn build(
        &self,
        _: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        if self.resource {
            Ok(ModuleInstance::Resource(Arc::new(
                ResourceHandle::new(
                    if self.changed.load(Ordering::SeqCst) {
                        "changed"
                    } else {
                        "initial"
                    },
                    Arc::new(()),
                )
                .unwrap(),
            )))
        } else {
            Ok(ModuleInstance::ToolPack(ToolCatalog::new()))
        }
    }
}
#[test]
fn changed_bound_resource_identity_is_rejected_before_first_dynamic_execution() {
    let f = Fixture::new();
    let mut assembly = f.assembly();
    let changed = Arc::new(AtomicBool::new(false));
    for resource in [true, false] {
        let factory = ChangingDependency {
            changed: changed.clone(),
            resource,
        };
        let name = factory.descriptor().factory;
        assembly
            .registry
            .register_factory(Arc::new(factory))
            .unwrap();
        assembly
            .registry
            .define(ModuleDefinition {
                reference: r(if resource {
                    "changing-resource"
                } else {
                    "changing-pack"
                }),
                factory: name,
                config: json!({}),
                dependencies: if resource {
                    BTreeMap::new()
                } else {
                    BTreeMap::from([("resource".into(), r("changing-resource"))])
                },
            })
            .unwrap();
    }
    assembly
        .allowed
        .insert(r("changing-pack"), ModuleKind::ToolPack);
    assembly.frozen = assembly
        .registry
        .resolve_typed(
            &assembly
                .allowed
                .iter()
                .map(|(r, k)| (r.clone(), *k))
                .collect::<Vec<_>>(),
        )
        .unwrap()
        .snapshot
        .into_iter()
        .map(|m| (m.definition.reference.clone(), m))
        .collect();
    let mut agent = agent_request();
    agent["document"]["agent"]["tool_packs"] = json!([r("changing-pack")]);
    let mut workflow = workflow_request();
    workflow["document"]["host"]["tool_packs"] = json!([r("changing-pack")]);
    assert!(assembly.prepare(agent.clone()).is_ok());
    assert!(assembly.prepare(workflow.clone()).is_ok());
    changed.store(true, Ordering::SeqCst);
    for args in [agent, workflow] {
        match assembly.prepare(args) {
            Err(error) => assert!(error.to_string().contains("dependency identity changed")),
            Ok(_) => panic!("changed resource was accepted"),
        }
    }
    assert_eq!(f.effects.load(Ordering::SeqCst), 0);
}
