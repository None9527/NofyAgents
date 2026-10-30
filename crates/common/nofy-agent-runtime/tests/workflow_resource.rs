#![cfg(feature = "workflow")]
use nofy_agent_runtime::{
    registry::*,
    workflow::{compile::CompiledWorkflow, declarative::*},
    *,
};
use serde_json::{Value, json};
use std::sync::Arc;
fn r(id: &str) -> ModuleRef {
    ModuleRef::new(id, "1")
}
fn registry() -> ModuleRegistry {
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(WorkflowResourceFactory))
        .unwrap();
    registry
        .register_factory(Arc::new(ConnectedWorkflowToolFactory))
        .unwrap();
    registry
        .register_factory(Arc::new(ConnectedWorkflowHookFactory))
        .unwrap();
    registry
}
fn leaf() -> Value {
    json!({"host":{"name":"leaf"},"entry":r("main"),"workflows":[{"reference":r("main"),"input_schema":true,"output_schema":true,"nodes":[{"id":"result","input":{"from":"literal","value":{"ok":true}},"action":{"kind":"transform"}}],"output":{"from":"node","node":"result"}}]})
}
fn define(registry: &mut ModuleRegistry, id: &str, doc: Value) {
    registry
        .define(ModuleDefinition {
            reference: r(id),
            factory: "resource.workflow".into(),
            config: json!({"document":doc}),
            dependencies: Default::default(),
        })
        .unwrap();
}
#[test]
fn nested_compilation_is_bounded_and_failure_does_not_poison_the_next_compilation() {
    let mut doc = leaf();
    for _ in 0..18 {
        doc = json!({"host":{"name":"nested"},"entry":r("main"),"modules":[
        {"reference":r("child"),"factory":"resource.workflow","config":{"document":doc}},
        {"reference":r("child-tool"),"factory":"tool.workflow_connected","config":{"name":"nested_tool"},"dependencies":{"workflow":r("child")}}
    ],"tool_runtimes":[{"reference":r("tools"),"definition":{"name":"nested-tools","tool_packs":[r("child-tool")]}}],"workflows":[{"reference":r("main"),"input_schema":true,"output_schema":true,"nodes":[{"id":"run","input":{"from":"object","fields":{"input":{"from":"input"}}},"action":{"kind":"tool","runtime":r("tools"),"tool":"nested_tool"}}],"output":{"from":"node","node":"run"}}]});
    }
    let mut registry = registry();
    define(&mut registry, "nested", doc);
    let error = registry.resolve(&[r("nested")]).err().unwrap();
    assert!(
        error.to_string().contains("compilation exceeds 16"),
        "{error}"
    );
    define(&mut registry, "flat", leaf());
    assert!(registry.resolve(&[r("flat")]).is_ok());
}
struct Rule(bool);
#[async_trait::async_trait]
impl Policy for Rule {
    async fn admit(&self, _: &ToolCall, _: &RunState, _: &RunContext) -> Result<Admission, Error> {
        Ok(if self.0 {
            Admission::Allow
        } else {
            Admission::Deny("host floor".into())
        })
    }
}
#[test]
fn host_floors_are_included_without_client_wires_and_cannot_be_redefined_in_a_document() {
    let mut registry = registry();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "floor",
            "1",
            ModuleInstance::Policy(Arc::new(Rule(false))),
        )))
        .unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "allow",
            "1",
            ModuleInstance::Policy(Arc::new(Rule(true))),
        )))
        .unwrap();
    registry
        .define(ModuleDefinition {
            reference: r("floor"),
            factory: "floor".into(),
            config: json!({}),
            dependencies: Default::default(),
        })
        .unwrap();
    registry.require_policy(r("floor"));
    define(&mut registry, "safe", leaf());
    let resolved = registry.resolve(&[r("safe")]).unwrap();
    let ModuleInstance::Resource(resource) = &resolved.instances[&r("safe")] else {
        panic!("resource required")
    };
    let workflow = resource.get::<CompiledWorkflow>().unwrap();
    assert_eq!(workflow.snapshot.required_policies, vec![r("floor")]);
    assert!(
        workflow
            .snapshot
            .modules
            .iter()
            .any(|m| m.definition.reference == r("floor"))
    );
    let mut malicious = leaf();
    malicious["modules"] = json!([{"reference":r("floor"),"factory":"allow","config":{}}]);
    define(&mut registry, "unsafe", malicious);
    assert!(registry.resolve(&[r("unsafe")]).is_err());
}
