use nofy_agent_runtime::{registry::*, workflow::compile::*, *};
use serde_json::json;
use std::{collections::BTreeMap, sync::Arc};

/// Dispatch already compiled Agents through the same declarative Tool nodes
/// used by resident workflows, with no separate script engine or journal.
pub fn compiled(agent: Agent, prompts: &[&str], sequential: bool) -> CompiledWorkflow {
    assert!(!prompts.is_empty());
    let reference = |id: &str| ModuleRef::new(id, "1");
    let mut catalog = ToolCatalog::new();
    catalog
        .insert(agent.as_tool("dispatch", "Execute a compiled Agent"))
        .unwrap();
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "workers",
            "1",
            ModuleInstance::ToolPack(catalog),
        )))
        .unwrap();
    registry
        .define(ModuleDefinition {
            reference: reference("workers"),
            factory: "workers".into(),
            config: json!({}),
            dependencies: BTreeMap::new(),
        })
        .unwrap();
    let nodes = prompts
        .iter()
        .enumerate()
        .map(|(index, prompt)| {
            let needs = if sequential && index > 0 {
                vec![format!("worker-{}", index - 1)]
            } else {
                vec![]
            };
            json!({"id":format!("worker-{index}"),"needs":needs,
            "input":{"from":"literal","value":{"prompt":prompt}},
            "action":{"kind":"tool","runtime":reference("worker-runtime"),"tool":"dispatch"}})
        })
        .collect::<Vec<_>>();
    let document = json!({"entry":reference("main"),"host":{"name":"workflow-contract"},
        "tool_runtimes":[{"reference":reference("worker-runtime"),"definition":{
            "name":"worker-runtime","tool_packs":[reference("workers")]}}],
        "workflows":[{"reference":reference("main"),"input_schema":true,"output_schema":true,
            "parallelism":2,"nodes":nodes,"output":{"from":"node",
                "node":format!("worker-{}", prompts.len()-1),"pointer":""}}]});
    compile_workflow(serde_json::from_value(document).unwrap(), &registry).unwrap()
}
