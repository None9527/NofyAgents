use super::*;
#[test]
fn agent_messages_remain_separate_from_model_free_parameters() {
    let (registry, _) = factories("1");
    let system = compile_system(document("first"), &registry).unwrap();
    let interface = system.program_interface("chat").unwrap();
    assert!(interface.accepts_message);
    assert!(interface.parameters_schema.is_none() && interface.default_parameters.is_none());
    assert!(
        system
            .program_with_parameters("chat", Some(Value::Null))
            .is_err()
    );
    assert!(system.program_with_parameters("chat", None).is_ok());
}
struct Deny;
#[async_trait::async_trait]
impl Policy for Deny {
    async fn admit(
        &self,
        _: &ToolCall,
        _: &RunState,
        _: &RunContext,
    ) -> std::result::Result<Admission, Error> {
        Ok(Admission::Deny("required".into()))
    }
}
#[tokio::test]
async fn host_floor_is_exported_and_cannot_be_implicitly_weakened() {
    let (mut source, _) = factories("1");
    source
        .register_factory(Arc::new(InstanceFactory::new(
            "policy.deny",
            "1",
            ModuleInstance::Policy(Arc::new(Deny)),
        )))
        .unwrap();
    source
        .define(ModuleDefinition {
            reference: r("floor"),
            factory: "policy.deny".into(),
            config: json!({}),
            dependencies: Default::default(),
        })
        .unwrap();
    source.require_policy(r("floor"));
    let bundle = compile_system(document("first"), &source).unwrap().bundle;
    assert_eq!(bundle.document.required_policies, vec![r("floor")]);
    let (mut target, _) = factories("1");
    target
        .register_factory(Arc::new(InstanceFactory::new(
            "policy.deny",
            "1",
            ModuleInstance::Policy(Arc::new(Deny)),
        )))
        .unwrap();
    let compiled = bundle.restore(&target).unwrap();
    assert!(
        compiled
            .registry()
            .required_policies()
            .contains(&r("floor"))
    );
    assert!(compiled.registry().definition(&r("floor")).is_some());
}
#[cfg(feature = "workflow")]
#[tokio::test]
async fn workflow_local_modules_are_lifted_into_the_portable_system() {
    let (registry, _) = factories("1");
    let mut doc = document("first");
    let flow = json!({"entry":r("flow"),"host":{"name":"flow-host"},"modules":[{"reference":r("wf-prompt"),"factory":"prompt.static","config":{"text":"workflow value"}}],"workflows":[{"reference":r("flow"),"input_schema":{"type":"object"},"output_schema":{"type":"string"},"nodes":[{"id":"prompt","input":{"from":"literal","value":{}},"action":{"kind":"prompt","prompt":r("wf-prompt")}}],"output":{"from":"node","node":"prompt"}}]});
    doc.programs.insert(
        "flow".into(),
        ProgramDefinition::Workflow {
            document: serde_json::from_value(flow).unwrap(),
            input: json!({}),
        },
    );
    let compiled = compile_system(doc, &registry).unwrap();
    assert!(
        compiled
            .bundle
            .document
            .modules
            .iter()
            .any(|m| m.reference == r("wf-prompt"))
    );
    let restored = compiled.bundle.restore(&factories("1").0).unwrap();
    let program = restored
        .program("flow")
        .unwrap()
        .clone()
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    assert!(
        matches!(program.invoke(RunInput::default(),RunContext::new("flow","flow")).await.unwrap(),RunOutcome::Completed{output,..} if output.contains("workflow value"))
    );
}
#[tokio::test]
async fn event_program_uses_the_same_system_lock_and_no_model() {
    let (mut registry, calls) = factories("1");
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "event.session",
            "1",
            ModuleInstance::EventProducer(Arc::new(
                nofy_agent_runtime::event_program::EventProducer::session(),
            )),
        )))
        .unwrap();
    let mut doc = document("first");
    doc.modules.push(ModuleDefinition {
        reference: r("producer"),
        factory: "event.session".into(),
        config: json!({}),
        dependencies: Default::default(),
    });
    doc.programs.insert("idle".into(),serde_json::from_value(json!({"kind":"event","definition":{"schema_version":1,"host":{"name":"session"},"producer":r("producer"),"event":"session_idle","operation":"idle-1","payload":{}}})).unwrap());
    let compiled = compile_system(doc, &registry).unwrap();
    let restored = compiled.bundle.restore(&registry).unwrap();
    assert!(
        matches!(restored.program("idle").unwrap().invoke(RunInput::default(),RunContext::new("idle","idle")).await.unwrap(),RunOutcome::Completed{state,..} if state.messages.is_empty())
    );
    assert_eq!(calls.load(Ordering::SeqCst), 0);
}
struct FileTool(std::path::PathBuf);
impl nofy_tool_runtime::Tool for FileTool {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("persist").unwrap()
    }
    fn description(
        &self,
        _: &nofy_tool_runtime::ListToolsContext,
    ) -> nofy_tool_types::ToolDescription {
        nofy_tool_types::ToolDescription::new("persist", "Append a real effect")
    }
    async fn run(
        &self,
        _: nofy_tool_runtime::ToolCallContext,
        value: Value,
    ) -> std::result::Result<Value, nofy_tool_runtime::ToolError> {
        use std::io::Write;
        std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.0)
            .and_then(|mut f| f.write_all(b"effect\n"))
            .map_err(|e| nofy_tool_runtime::ToolError::custom("filesystem", e.to_string()))?;
        Ok(value)
    }
}
struct FileFactory;
impl ModuleFactory for FileFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "tool.file".into(),
            revision: "1".into(),
            kind: ModuleKind::ToolPack,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["path"],"properties":{"path":{"type":"string"}}}),
            input_schema: None,
            output_schema: None,
            dependencies: Default::default(),
            required_capabilities: Default::default(),
        }
    }
    fn build(
        &self,
        config: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> std::result::Result<ModuleInstance, Error> {
        let mut tools = ToolCatalog::new();
        tools.insert(ToolEntry::typed(FileTool(
            config["path"].as_str().unwrap().into(),
        )))?;
        Ok(ModuleInstance::ToolPack(tools))
    }
}
#[tokio::test]
async fn locked_tool_program_executes_real_effect_once_and_restores_the_same_checkpoint() {
    let temp = tempfile::tempdir().unwrap();
    let path = temp.path().join("effects.log");
    let (mut host, calls) = factories("1");
    host.register_factory(Arc::new(FileFactory)).unwrap();
    let mut doc = document("first");
    doc.modules.push(ModuleDefinition {
        reference: r("effects"),
        factory: "tool.file".into(),
        config: json!({"path":path}),
        dependencies: Default::default(),
    });
    doc.programs.insert("effect".into(),serde_json::from_value(json!({"kind":"tool","definition":{"name":"effect-program","tool_packs":[r("effects")]},"call":{"id":"effect","name":"persist","arguments":{"value":7}}})).unwrap());
    let bundle = compile_system(doc, &host).unwrap().bundle;
    assert!(!path.exists());
    let (mut target, _) = factories("1");
    target.register_factory(Arc::new(FileFactory)).unwrap();
    let compiled = bundle.restore(&target).unwrap();
    let store = Arc::new(InMemoryCheckpointer::default());
    let program = compiled
        .program("effect")
        .unwrap()
        .clone()
        .with_checkpointer(store.clone());
    assert!(matches!(
        program
            .invoke(RunInput::default(), RunContext::new("tool", "tool"))
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    let restored = bundle
        .restore(&target)
        .unwrap()
        .program("effect")
        .unwrap()
        .clone()
        .with_checkpointer(store);
    assert!(matches!(
        restored
            .invoke(RunInput::resume(), RunContext::new("tool", "tool"))
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(std::fs::read_to_string(path).unwrap().lines().count(), 1);
    assert_eq!(calls.load(Ordering::SeqCst), 0);
}
