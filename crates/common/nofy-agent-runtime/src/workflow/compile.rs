//! Pure compilation and frozen restoration of configurable workflow programs.
use super::spec::*;
use crate::{
    Agent, Error, Prompt,
    compile::{AgentDefinition, compile_agent},
    registry::*,
    tool_program::*,
};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    collections::{BTreeMap, BTreeSet},
    sync::Arc,
};

fn one() -> u32 {
    1
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AgentProgram {
    pub reference: ModuleRef,
    pub definition: AgentDefinition,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ToolProgram {
    pub reference: ModuleRef,
    pub definition: ToolRuntimeDefinition,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct WorkflowDocument {
    #[serde(default = "one")]
    pub schema_version: u32,
    #[serde(default)]
    pub modules: Vec<ModuleDefinition>,
    #[serde(default)]
    pub agents: Vec<AgentProgram>,
    #[serde(default)]
    pub tool_runtimes: Vec<ToolProgram>,
    pub workflows: Vec<WorkflowSpec>,
    pub entry: ModuleRef,
    pub host: ToolRuntimeDefinition,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct WorkflowCompilationSnapshot {
    pub version: u32,
    pub document: WorkflowDocument,
    pub modules: Vec<ResolvedModule>,
    pub required_policies: Vec<ModuleRef>,
    pub required_governance: Vec<ModuleRef>,
    pub program_identities: BTreeMap<String, String>,
}
impl WorkflowCompilationSnapshot {
    pub fn restore(&self, host: &ModuleRegistry) -> Result<CompiledWorkflow, Error> {
        if self.version != 1 {
            return Err(invalid("unsupported workflow compilation snapshot"));
        }
        let registry = crate::compile::restore_modules(
            host,
            &self.modules,
            &self.required_policies,
            &self.required_governance,
        )?;
        let compiled = compile_workflow(self.document.clone(), &registry)?;
        if serde_json::to_value(&compiled.snapshot).ok() != serde_json::to_value(self).ok() {
            return Err(invalid("restored workflow compilation snapshot changed"));
        }
        Ok(compiled)
    }
}
#[derive(Clone)]
pub struct CompiledWorkflow {
    pub snapshot: WorkflowCompilationSnapshot,
    pub(crate) environment: Arc<Environment>,
    pub(crate) host: ToolRuntime,
}
pub(crate) struct Environment {
    pub identity: String,
    pub entry: ModuleRef,
    pub plans: BTreeMap<ModuleRef, ValidatedWorkflow>,
    pub agents: BTreeMap<ModuleRef, Agent>,
    pub tools: BTreeMap<ModuleRef, ToolRuntime>,
    pub prompts: BTreeMap<ModuleRef, Arc<dyn Prompt>>,
}
impl CompiledWorkflow {
    pub fn identity(&self) -> &str {
        &self.environment.identity
    }
    pub fn entry(&self) -> &WorkflowSpec {
        self.environment.plans[&self.environment.entry].spec()
    }
}

pub fn compile_workflow(
    document: WorkflowDocument,
    host: &ModuleRegistry,
) -> Result<CompiledWorkflow, Error> {
    // Graphs, references, nesting and limits are checked before any factory is
    // instantiated. Config cannot upload a live handle or turn an alias into IO.
    let plans = validate_document(&document)?;
    let mut registry = host.clone();
    for definition in &document.modules {
        if let Some(existing) = registry.definition(&definition.reference) {
            if serde_json::to_value(existing).ok() != serde_json::to_value(definition).ok() {
                return Err(invalid(
                    "workflow module version already defined differently",
                ));
            }
        } else {
            registry.define(definition.clone())?;
        }
    }
    let mut modules = BTreeMap::new();
    let mut identities = BTreeMap::new();
    let mut agents = BTreeMap::new();
    let mut tools = BTreeMap::new();
    for program in &document.agents {
        let compiled = compile_agent(program.definition.clone(), &registry)?;
        identities.insert(
            format!("agent:{}", program.reference.key()),
            compiled.agent.composition_identity().to_string(),
        );
        merge_modules(&mut modules, compiled.snapshot.modules)?;
        agents.insert(program.reference.clone(), compiled.agent);
    }
    for program in &document.tool_runtimes {
        let compiled = compile_tools(program.definition.clone(), &registry)?;
        identities.insert(
            format!("tool:{}", program.reference.key()),
            compiled.runtime.composition_identity().to_string(),
        );
        merge_modules(&mut modules, compiled.snapshot.modules)?;
        tools.insert(program.reference.clone(), compiled.runtime);
    }
    for plan in plans.values() {
        let schemas = plan
            .spec()
            .nodes
            .iter()
            .map(|node| (node.id.clone(), node.output_schema.clone()))
            .collect();
        for node in &plan.spec().nodes {
            if let NodeKind::Tool { runtime, tool } = &node.action
                && let Some(schema) = tools[runtime].tool_schema(tool)?
            {
                check_binding_schema(&node.input, &schema, &plan.spec().input_schema, &schemas)
                    .map_err(|error| {
                        invalid(format!("node {} tool arguments: {error}", node.id))
                    })?;
            }
        }
    }
    let root = compile_tools(document.host.clone(), &registry)?;
    identities.insert(
        "host".into(),
        root.runtime.composition_identity().to_string(),
    );
    merge_modules(&mut modules, root.snapshot.modules)?;
    let prompt_roots: BTreeSet<_> = document
        .workflows
        .iter()
        .flat_map(|s| s.nodes.iter())
        .filter_map(|n| match &n.action {
            NodeKind::Prompt { prompt } => Some(prompt.clone()),
            _ => None,
        })
        .collect();
    let resolved = registry.resolve_typed(
        &prompt_roots
            .into_iter()
            .map(|r| (r, ModuleKind::Prompt))
            .collect::<Vec<_>>(),
    )?;
    let prompts = resolved
        .instances
        .into_iter()
        .filter_map(|(r, i)| match i {
            ModuleInstance::Prompt(p) => Some((r, p)),
            _ => None,
        })
        .collect();
    merge_modules(&mut modules, resolved.snapshot)?;
    // Per-program identities retain the exact implementation and floor; the
    // graph's own recovery identity is a bounded digest of that complete set.
    let snapshot = WorkflowCompilationSnapshot {
        version: 1,
        document,
        modules: modules.into_values().collect(),
        required_policies: registry.required_policies().iter().cloned().collect(),
        required_governance: registry.required_governance().iter().cloned().collect(),
        program_identities: identities,
    };
    let encoded = serde_json::to_vec(&snapshot).map_err(|e| invalid(e.to_string()))?;
    if encoded.len() > 16 * 1024 * 1024 {
        return Err(invalid("workflow compilation snapshot exceeds 16 MiB"));
    }
    let identity = format!("{:x}", Sha256::digest(&encoded));
    let entry = snapshot.document.entry.clone();
    let environment = Arc::new(Environment {
        entry,
        identity,
        plans,
        agents,
        tools,
        prompts,
    });
    let graph_tool = super::graph::entry(
        environment.clone(),
        environment.entry.clone(),
        "workflow_execute".into(),
        "Execute the frozen workflow".into(),
    );
    let host = root
        .runtime
        .constrain_descendants()?
        .with_entry(graph_tool)?;
    Ok(CompiledWorkflow {
        snapshot,
        environment,
        host,
    })
}
fn merge_modules(
    modules: &mut BTreeMap<ModuleRef, ResolvedModule>,
    entries: Vec<ResolvedModule>,
) -> Result<(), Error> {
    for entry in entries {
        if let Some(existing) = modules.get(&entry.definition.reference) {
            if serde_json::to_value(existing).ok() != serde_json::to_value(&entry).ok() {
                return Err(invalid("workflow modules resolved inconsistently"));
            }
        } else {
            modules.insert(entry.definition.reference.clone(), entry);
        }
    }
    Ok(())
}
fn validate_document(
    document: &WorkflowDocument,
) -> Result<BTreeMap<ModuleRef, ValidatedWorkflow>, Error> {
    if document.schema_version != 1
        || document.workflows.is_empty()
        || document.workflows.len() > 128
        || document.agents.len() > 128
        || document.tool_runtimes.len() > 128
        || document.modules.len() > 1024
    {
        return Err(invalid(
            "invalid workflow document version or program count",
        ));
    }
    bounded_value(
        &serde_json::to_value(document).map_err(|e| invalid(e.to_string()))?,
        8 * 1024 * 1024,
        "workflow document",
    )?;
    let agent_ids = unique(document.agents.iter().map(|p| &p.reference))?;
    let tool_ids = unique(document.tool_runtimes.iter().map(|p| &p.reference))?;
    let workflow_ids = unique(document.workflows.iter().map(|p| &p.reference))?;
    if !workflow_ids.contains(&document.entry) {
        return Err(invalid("workflow entry is not defined"));
    }
    let mut plans = BTreeMap::new();
    let mut nested = BTreeMap::new();
    let mut total_nodes = 0;
    for spec in &document.workflows {
        total_nodes += spec.nodes.len();
        if total_nodes > 1024 {
            return Err(invalid("document exceeds 1024 total nodes"));
        }
        let plan = spec.validate()?;
        let mut needs = BTreeSet::new();
        for node in &spec.nodes {
            match &node.action {
                NodeKind::Agent { agent } if !agent_ids.contains(agent) => {
                    return Err(invalid(format!(
                        "node {} references an unknown Agent version",
                        node.id
                    )));
                }
                NodeKind::Tool { runtime, .. } if !tool_ids.contains(runtime) => {
                    return Err(invalid(format!(
                        "node {} references an unknown Tool runtime version",
                        node.id
                    )));
                }
                NodeKind::Subworkflow { workflow } | NodeKind::Loop { workflow, .. } => {
                    if !workflow_ids.contains(workflow) {
                        return Err(invalid(format!(
                            "node {} references an unknown workflow version",
                            node.id
                        )));
                    }
                    needs.insert(workflow.clone());
                }
                _ => {}
            }
        }
        nested.insert(spec.reference.clone(), needs);
        plans.insert(spec.reference.clone(), plan);
    }
    let mut depths = BTreeMap::<ModuleRef, usize>::new();
    let mut expanded = BTreeMap::<ModuleRef, usize>::new();
    while depths.len() < plans.len() {
        let before = depths.len();
        for (id, needs) in &nested {
            if depths.contains_key(id) || !needs.iter().all(|n| depths.contains_key(n)) {
                continue;
            }
            let depth = 1 + needs.iter().map(|n| depths[n]).max().unwrap_or(0);
            if depth > 16 {
                return Err(invalid("workflow nesting exceeds 16"));
            }
            let mut work = 0usize;
            for node in &plans[id].spec().nodes {
                let nested = match &node.action {
                    NodeKind::Subworkflow { workflow } => expanded[workflow],
                    NodeKind::Loop {
                        workflow,
                        max_iterations,
                        ..
                    } => expanded[workflow].saturating_mul(*max_iterations as usize),
                    _ => 0,
                };
                work = work.saturating_add(
                    (1usize.saturating_add(nested))
                        .saturating_mul(node.on_error.retries as usize + 1),
                );
            }
            if work > 8192 {
                return Err(invalid(
                    "workflow expands beyond 8192 scheduled nodes including configured loops/retries",
                ));
            }
            expanded.insert(id.clone(), work);
            depths.insert(id.clone(), depth);
        }
        if before == depths.len() {
            return Err(invalid(
                "recursive workflow references require a bounded loop node calling an acyclic subworkflow",
            ));
        }
    }
    Ok(plans)
}
fn unique<'a>(ids: impl Iterator<Item = &'a ModuleRef>) -> Result<BTreeSet<ModuleRef>, Error> {
    let mut seen = BTreeSet::new();
    for id in ids {
        check_reference(id)?;
        if !seen.insert(id.clone()) {
            return Err(invalid("duplicate program version"));
        }
    }
    Ok(seen)
}
