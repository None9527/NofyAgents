use nofy_agent_runtime::{event_program::*, hooks::*, registry::*, system::*, *};
use serde_json::{Value, json};
use std::sync::Arc;
fn r(id: &str) -> ModuleRef {
    ModuleRef::new(id, "1")
}
fn schema() -> Value {
    json!({"type":["integer","null"]})
}
struct Persist(std::path::PathBuf);
impl nofy_tool_runtime::Tool for Persist {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("persist").unwrap()
    }
    fn description(
        &self,
        _: &nofy_tool_runtime::ListToolsContext,
    ) -> nofy_tool_types::ToolDescription {
        nofy_tool_types::ToolDescription::new("persist", "Persist invocation data")
    }
    async fn run(
        &self,
        _: nofy_tool_runtime::ToolCallContext,
        value: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        std::fs::write(&self.0, serde_json::to_vec(&value).unwrap()).unwrap();
        Ok(value)
    }
}
fn setup(path: &std::path::Path) -> (ModuleRegistry, CompiledSystem) {
    let mut registry = ModuleRegistry::default();
    let mut entry = ToolEntry::typed(Persist(path.to_owned()));
    entry.definition.function.parameters = schema();
    let mut catalog = ToolCatalog::new();
    catalog.insert(entry).unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "tool.persist",
            "1",
            ModuleInstance::ToolPack(catalog),
        )))
        .unwrap();
    let producer = EventProducer::new(
        r("business"),
        vec![EventDeclaration {
            name: "business.input".into(),
            owner: r("business"),
            payload_schema: schema(),
            deny: false,
            pause: false,
            patch: false,
            stop: false,
        }],
    )
    .unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "event.business",
            "1",
            ModuleInstance::EventProducer(Arc::new(producer)),
        )))
        .unwrap();
    let document = serde_json::from_value(json!({"schema_version":1,"name":"parameters","modules":[
        {"reference":r("tools"),"factory":"tool.persist","config":{}},
        {"reference":r("producer"),"factory":"event.business","config":{}}
    ],"programs":{
        "persist":{"kind":"tool","definition":{"name":"persist","tool_packs":[r("tools")]},"call":{"id":"fixed-call","name":"persist","arguments":7}},
        "event":{"kind":"event","definition":{"schema_version":1,"host":{"name":"business-host"},"producer":r("producer"),"event":"business.input","operation":"fixed-operation","payload":7}}
    }})).unwrap();
    let compiled = compile_system(document, &registry).unwrap();
    (registry, compiled)
}
async fn output(program: &nofy_agent_runtime::program::CompiledProgram) -> String {
    match program
        .clone()
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()))
        .invoke(RunInput::default(), RunContext::new("thread", "run"))
        .await
        .unwrap()
    {
        RunOutcome::Completed { output, .. } => output,
        other => panic!("{other:?}"),
    }
}
#[test]
fn program_interface_preserves_explicit_null_defaults_when_reading_its_wire_format() {
    let wire = json!({"name":"null-input","kind":"workflow","accepts_message":false,"parameters_schema":true,"default_parameters":null});
    let interface: ProgramInterface = serde_json::from_value(wire.clone()).unwrap();
    assert_eq!(interface.default_parameters, Some(Value::Null));
    assert_eq!(serde_json::to_value(interface).unwrap(), wire);
}
#[tokio::test]
async fn tool_and_event_parameters_freeze_only_data_and_leave_release_defaults_intact() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("input.json");
    let (registry, system) = setup(&path);
    let original = serde_json::to_value(&system.bundle).unwrap();
    assert!(!path.exists());
    for value in [json!(9), Value::Null] {
        let tool = system
            .program_with_parameters("persist", Some(value.clone()))
            .unwrap();
        let snapshot = &tool.snapshot;
        let nofy_agent_runtime::program::ProgramSnapshot::Tool { call, .. } = &snapshot.program
        else {
            panic!("tool")
        };
        assert_eq!(call.id, "fixed-call");
        assert_eq!(call.name, "persist");
        assert_eq!(call.arguments, value);
        let restored = snapshot.restore(&registry).unwrap();
        output(&restored).await;
        assert_eq!(
            serde_json::from_slice::<Value>(&std::fs::read(&path).unwrap()).unwrap(),
            value
        );
        let event = system
            .program_with_parameters("event", Some(value.clone()))
            .unwrap();
        let nofy_agent_runtime::program::ProgramSnapshot::Event { snapshot } =
            &event.snapshot.program
        else {
            panic!("event")
        };
        assert_eq!(snapshot.definition.operation, "fixed-operation");
        assert_eq!(snapshot.definition.producer, r("producer"));
        let result: HookResult =
            serde_json::from_str(&output(&event.snapshot.restore(&registry).unwrap()).await)
                .unwrap();
        assert_eq!(result.payload, value);
    }
    for name in ["persist", "event"] {
        let interface = system.program_interface(name).unwrap();
        assert_eq!(interface.parameters_schema, Some(schema()));
        assert_eq!(interface.default_parameters, Some(json!(7)));
        assert!(!interface.accepts_message);
        assert!(
            system
                .program_with_parameters(name, Some(json!("wrong")))
                .is_err()
        );
        assert!(
            system
                .program_with_parameters(name, Some(json!("x".repeat(1024 * 1024))))
                .is_err()
        );
        assert_eq!(
            serde_json::to_value(system.program_with_parameters(name, None).unwrap().snapshot)
                .unwrap(),
            serde_json::to_value(&system.program(name).unwrap().snapshot).unwrap()
        );
    }
    assert_eq!(serde_json::to_value(&system.bundle).unwrap(), original);
}
#[cfg(feature = "workflow")]
#[tokio::test]
async fn root_workflow_parameters_are_validated_and_snapshot_restorable() {
    let doc = serde_json::from_value(json!({"schema_version":1,"name":"flow","programs":{"flow":{"kind":"workflow","input":7,"document":{
        "host":{"name":"flow-host"},"entry":r("main"),"workflows":[{"reference":r("main"),"input_schema":schema(),"output_schema":schema(),"nodes":[{"id":"result","input":{"from":"input"},"action":{"kind":"transform"}}],"output":{"from":"node","node":"result"}}]
    }}}})).unwrap();
    let registry = ModuleRegistry::default();
    let system = compile_system(doc, &registry).unwrap();
    for value in [json!(19), Value::Null] {
        let program = system
            .program_with_parameters("flow", Some(value.clone()))
            .unwrap();
        let restored = program.snapshot.restore(&registry).unwrap();
        let result: Value = serde_json::from_str(&output(&restored).await).unwrap();
        assert_eq!(result["value"], value);
    }
    assert!(
        system
            .program_with_parameters("flow", Some(json!({"bad":true})))
            .is_err()
    );
    assert_eq!(
        system.program_interface("flow").unwrap().default_parameters,
        Some(json!(7))
    );
}
