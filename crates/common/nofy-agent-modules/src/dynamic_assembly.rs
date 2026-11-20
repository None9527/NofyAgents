//! Bounded model-authored compositions over explicitly installed dependencies.
//! No new IO capabilities, mutable publication, or alternate execution loop.
use nofy_agent_runtime::{
    Error, Model, RunContext, ToolCatalog, ToolEntry,
    compile::{AgentDefinition, AgentDocument, compile_document},
    context::ContextBinding,
    registry::*,
    tool_program::ToolRuntimeDefinition,
    workflow::{
        compile::{WorkflowDocument, compile_workflow},
        spec::{FailureAction, NodeKind},
    },
};
use nofy_tool_runtime::{ToolCallContext, ToolDispatch, ToolStream, TypedToolOutput};
use nofy_tool_types::ToolDefinition;
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::{
    collections::{BTreeMap, BTreeSet},
    sync::Arc,
};

pub struct DynamicAssemblyFactory;
fn invalid(message: impl Into<String>) -> Error {
    Error::Composition(message.into())
}
fn steps() -> usize {
    64
}
fn nodes() -> usize {
    64
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Config {
    name: String,
    bindings: BTreeMap<String, ModuleKind>,
    #[serde(default = "steps")]
    max_steps: usize,
    #[serde(default = "nodes")]
    max_nodes: usize,
}
fn config(value: &Value) -> Result<Config, Error> {
    nofy_agent_runtime::settings::validate_json_value(
        &DynamicAssemblyFactory.descriptor().config_schema,
        value,
    )?;
    serde_json::from_value(value.clone()).map_err(|e| invalid(e.to_string()))
}
impl ModuleFactory for DynamicAssemblyFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "tool.dynamic_assembly".into(),
            revision: "1".into(),
            kind: ModuleKind::ToolPack,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["name","bindings"],"properties":{
                "name":{"type":"string","minLength":1,"maxLength":128},
                "bindings":{"type":"object","minProperties":1,"maxProperties":128,"additionalProperties":{"enum":["model","tool_pack","prompt"]}},
                "max_steps":{"type":"integer","minimum":1,"maximum":256},
                "max_nodes":{"type":"integer","minimum":1,"maximum":128}}}),
            input_schema: None,
            output_schema: None,
            dependencies: Default::default(),
            required_capabilities: Default::default(),
        }
    }
    fn config_dependencies(&self, value: &Value) -> Result<BTreeMap<String, ModuleKind>, Error> {
        Ok(config(value)?.bindings)
    }
    fn build(
        &self,
        _: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        Err(invalid(
            "dynamic assembly must be built through ModuleRegistry",
        ))
    }
    fn build_with_context(
        &self,
        value: &Value,
        _: &BTreeMap<String, ModuleInstance>,
        context: &ModuleBuildContext<'_>,
    ) -> Result<ModuleInstance, Error> {
        let config = config(value)?;
        nofy_tool_protocol::ToolId::new(&config.name).map_err(|e| invalid(e.to_string()))?;
        let allowed = config
            .bindings
            .iter()
            .map(|(slot, kind)| {
                context
                    .definition()
                    .dependencies
                    .get(slot)
                    .cloned()
                    .map(|reference| (reference, *kind))
                    .ok_or_else(|| invalid("missing dynamic dependency"))
            })
            .collect::<Result<BTreeMap<_, _>, _>>()?;
        let mut registry = context.dependency_registry()?;
        // Capture the exact dependency closure, including mandatory host floors.
        let roots = allowed
            .iter()
            .map(|(r, k)| (r.clone(), *k))
            .collect::<Vec<_>>();
        let resolved = registry.resolve_typed(&roots)?;
        context.verify_dependencies(&resolved.snapshot)?;
        let identity = format!(
            "dynamic-assembly-v1:{}",
            nofy_agent_runtime::system::content_digest(&(
                value,
                &resolved.snapshot,
                registry.required_policies(),
                registry.required_governance()
            ))?
        );
        registry.register_factory(Arc::new(ModelBindingFactory))?;
        registry.register_factory(Arc::new(RequestIdentityFactory))?;
        let choices = allowed
            .iter()
            .map(|(reference, kind)| json!({"reference":reference,"kind":kind}))
            .collect::<Vec<_>>();
        let description = format!(
            "Compile and execute a model-authored AgentDocument or WorkflowDocument. Available dependencies: {}. Local modules may only use prompt.static with no dependencies. Agents may select these models, prompts and tool packs, literal prompts and model settings; no bindings, permissions, checkpointers, scope identity, or other authority changes. Limits: {} steps/agent, {} total workflow nodes, 16 agents, 16 tool runtimes, 8 workflows, parallelism <=8. Dynamic Human nodes and pause-on-error are unsupported. Re-enter exactly the same arguments on resume. Workflow input is wrapped automatically.",
            json!(choices),
            config.max_steps,
            config.max_nodes
        );
        let prompt_ref = ModuleRef::new("instructions", "1");
        let agent_example = allowed.iter().find(|(_, kind)| **kind == ModuleKind::Model).map(|(model, _)| {
            let packs = allowed.iter().filter(|(_, kind)| **kind == ModuleKind::ToolPack).map(|(reference, _)| reference).collect::<Vec<_>>();
            json!({"kind":"agent","prompt":"Task to execute","document":{"modules":[{"reference":prompt_ref,"factory":"prompt.static","config":{"text":"Specialist instructions"}}],"agent":{"name":"specialist","model":model,"prompt":prompt_ref,"tool_packs":packs,"settings":{"max_steps":config.max_steps,"model":{}}}}})
        });
        let flow_ref = ModuleRef::new("flow", "1");
        let workflow_example = json!({"kind":"workflow","input":{"task":"work"},"document":{"modules":[],"agents":[],"tool_runtimes":[],"entry":flow_ref,"host":{"name":"host"},"workflows":[{"reference":flow_ref,"input_schema":{},"output_schema":{},"nodes":[{"id":"copy","action":{"kind":"transform"},"input":{"from":"input"}}],"output":{"from":"node","node":"copy"}}]}});
        let workflow_example = if let Some(example) = &agent_example {
            let agent_ref = ModuleRef::new("specialist", "1");
            json!({"kind":"workflow","input":"Task to execute","document":{"modules":example["document"]["modules"],"agents":[{"reference":agent_ref,"definition":example["document"]["agent"]}],"tool_runtimes":[],"entry":flow_ref,"host":{"name":"host"},"workflows":[{"reference":flow_ref,"input_schema":{"type":"string"},"output_schema":{},"nodes":[{"id":"prepare","action":{"kind":"transform"},"input":{"from":"input"}},{"id":"execute","needs":["prepare"],"action":{"kind":"agent","agent":agent_ref},"input":{"from":"node","node":"prepare"}}],"output":{"from":"node","node":"execute"}}]}})
        } else {
            workflow_example
        };
        let description = format!(
            "{description} Complete request examples: agent={}; workflow={}. Workflow agents are {{reference,definition}} entries (definition uses the agent example); Agent nodes use action={{kind:agent,agent:reference}} and a prompt STRING input. Tool runtimes are {{reference,definition:{{name,tool_packs}}}}; Tool nodes use action={{kind:tool,runtime:reference,tool:name}}. Add needs edges before reading another node output; inputs support from=literal (value), input (pointer), node (node,pointer), object (fields), array (items).",
            agent_example.map_or_else(
                || "unavailable (no allowed model)".into(),
                |v| v.to_string()
            ),
            workflow_example
        );
        let schema = json!({"type":"object","additionalProperties":false,"required":["kind","document"],"properties":{"kind":{"enum":["agent","workflow"]},"document":{"type":"object"},"prompt":{"type":"string","maxLength":65536},"input":{}},"oneOf":[
            {"type":"object","additionalProperties":false,"required":["kind","document","prompt"],"properties":{"kind":{"const":"agent"},"document":{"type":"object"},"prompt":{"type":"string","maxLength":65536}}},
            {"type":"object","additionalProperties":false,"required":["kind","document","input"],"properties":{"kind":{"const":"workflow"},"document":{"type":"object"},"input":{}}}
        ]});
        let dispatch = Arc::new(Assembly {
            config: config.clone(),
            registry,
            allowed,
            identity,
            schema: schema.clone(),
            frozen: resolved
                .snapshot
                .into_iter()
                .map(|module| (module.definition.reference.clone(), module))
                .collect(),
        });
        let mut catalog = ToolCatalog::new();
        catalog.insert(ToolEntry {
            definition: ToolDefinition::function(&config.name, Some(&description), schema),
            dispatch,
        })?;
        Ok(ModuleInstance::ToolPack(catalog))
    }
}

#[derive(Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
enum Request {
    Agent {
        document: AgentDocument,
        prompt: String,
    },
    Workflow {
        document: WorkflowDocument,
        input: Value,
    },
}
struct Assembly {
    config: Config,
    registry: ModuleRegistry,
    allowed: BTreeMap<ModuleRef, ModuleKind>,
    identity: String,
    schema: Value,
    frozen: BTreeMap<ModuleRef, ResolvedModule>,
}
impl Assembly {
    fn verify_snapshot(&self, actual: &[ResolvedModule]) -> Result<(), Error> {
        for module in actual {
            if let Some(expected) = self.frozen.get(&module.definition.reference)
                && nofy_agent_runtime::system::content_digest(expected)?
                    != nofy_agent_runtime::system::content_digest(module)?
            {
                return Err(invalid(
                    "dynamic dependency identity changed after assembly binding",
                ));
            }
        }
        Ok(())
    }
    fn modules(&self, modules: &[ModuleDefinition]) -> Result<BTreeSet<ModuleRef>, Error> {
        if modules.len() > 32 {
            return Err(invalid("at most 32 local prompt modules"));
        }
        let mut prompts = BTreeSet::new();
        for module in modules {
            if module.factory != "prompt.static"
                || !module.dependencies.is_empty()
                || self.registry.definition(&module.reference).is_some()
                || module.reference.id.starts_with("__dynamic_")
                || !prompts.insert(module.reference.clone())
            {
                return Err(invalid(
                    "only unique new prompt.static modules without dependencies are allowed",
                ));
            }
            nofy_agent_runtime::settings::validate_json_value(
                &StaticPromptFactory.descriptor().config_schema,
                &module.config,
            )?;
            if module.config["text"]
                .as_str()
                .is_none_or(|s| s.len() > 65536)
            {
                return Err(invalid("dynamic prompt exceeds 64 KiB"));
            }
        }
        Ok(prompts)
    }
    fn allowed(&self, reference: &ModuleRef, kind: ModuleKind) -> Result<(), Error> {
        if self.allowed.get(reference) != Some(&kind) {
            return Err(invalid(
                "dynamic reference is outside its explicitly allowed dependencies",
            ));
        }
        Ok(())
    }
    fn agent(
        &self,
        agent: &mut AgentDefinition,
        prompts: &BTreeSet<ModuleRef>,
        generated: &mut BTreeMap<ModuleRef, ModuleDefinition>,
    ) -> Result<(), Error> {
        if agent.name.trim().is_empty()
            || agent.name.len() > 128
            || agent.name.chars().any(char::is_control)
            || agent.settings.max_steps == 0
            || agent.settings.max_steps > self.config.max_steps
            || agent.settings.scope_identity.is_some()
            || agent.settings.input_delivery.duplex
            || agent.session_policy.is_some()
            || !agent.policies.is_empty()
            || !agent.governance.is_empty()
            || !agent.tool_sources.is_empty()
            || !agent.context_sources.is_empty()
            || !agent.context_policies.is_empty()
            || !agent.middleware.is_empty()
            || !agent.hooks.is_empty()
            || !agent.bindings.is_empty()
            || agent.recipe.is_some()
            || agent.checkpointer.is_some()
        {
            return Err(invalid(
                "dynamic agent changes authority or exceeds its bounds",
            ));
        }
        self.allowed(&agent.model, ModuleKind::Model)?;
        if !prompts.contains(&agent.prompt) {
            self.allowed(&agent.prompt, ModuleKind::Prompt)?;
        }
        for pack in &agent.tool_packs {
            self.allowed(pack, ModuleKind::ToolPack)?;
        }
        let reference = ModuleRef::new(
            format!(
                "__dynamic_model_{}",
                nofy_agent_runtime::system::content_digest(&agent.model)?
            ),
            "1",
        );
        generated
            .entry(reference.clone())
            .or_insert_with(|| ModuleDefinition {
                reference: reference.clone(),
                factory: "binding.dynamic_model".into(),
                config: json!({}),
                dependencies: BTreeMap::from([("model".into(), agent.model.clone())]),
            });
        agent.bindings.push(reference);
        Ok(())
    }
    fn tools(&self, tools: &ToolRuntimeDefinition) -> Result<(), Error> {
        if tools.scope_identity.is_some()
            || !tools.tool_sources.is_empty()
            || !tools.policies.is_empty()
            || !tools.governance.is_empty()
            || !tools.hooks.is_empty()
            || !tools.bindings.is_empty()
            || tools.checkpointer.is_some()
        {
            return Err(invalid("dynamic tool runtime cannot change authority"));
        }
        for pack in &tools.tool_packs {
            self.allowed(pack, ModuleKind::ToolPack)?;
        }
        Ok(())
    }
    fn prepare(&self, args: Value) -> Result<(ToolEntry, Value), Error> {
        if serde_json::to_vec(&args)
            .map_err(|e| invalid(e.to_string()))?
            .len()
            > 512 * 1024
        {
            return Err(invalid("dynamic request exceeds 512 KiB"));
        }
        nofy_agent_runtime::settings::validate_json_value(&self.schema, &args)?;
        let fingerprint = nofy_agent_runtime::system::content_digest(&(&self.identity, &args))?;
        let request: Request = serde_json::from_value(args).map_err(|e| invalid(e.to_string()))?;
        match request {
            Request::Agent {
                mut document,
                prompt,
            } => {
                let prompts = self.modules(&document.modules)?;
                let mut generated = BTreeMap::new();
                self.agent(&mut document.agent, &prompts, &mut generated)?;
                document.modules.extend(generated.into_values());
                // Stable child name prevents a changed name from selecting a fresh
                // checkpoint; full original request still participates in identity.
                document.agent.name = "dynamic-agent".into();
                let compiled = compile_document(document, &self.registry)?;
                self.verify_snapshot(&compiled.snapshot.modules)?;
                let child = compiled.agent.with_binding(
                    format!("dynamic-request:{fingerprint}"),
                    Arc::new(RequestIdentity),
                );
                Ok((
                    child.as_tool(&self.config.name, "Dynamic child"),
                    json!({"prompt":prompt}),
                ))
            }
            Request::Workflow {
                mut document,
                input,
            } => {
                let prompts = self.modules(&document.modules)?;
                if document.agents.len() > 16
                    || document.tool_runtimes.len() > 16
                    || document.workflows.len() > 8
                    || document
                        .workflows
                        .iter()
                        .map(|w| w.nodes.len())
                        .sum::<usize>()
                        > self.config.max_nodes
                {
                    return Err(invalid("dynamic workflow exceeds composition bounds"));
                }
                let mut generated = BTreeMap::new();
                for program in &mut document.agents {
                    self.agent(&mut program.definition, &prompts, &mut generated)?;
                }
                for program in &document.tool_runtimes {
                    self.tools(&program.definition)?;
                }
                self.tools(&document.host)?;
                for workflow in &document.workflows {
                    if workflow.parallelism > 8 {
                        return Err(invalid("dynamic workflow parallelism exceeds 8"));
                    }
                    for node in &workflow.nodes {
                        if matches!(node.action, NodeKind::Human { .. })
                            || node.on_error.exhausted == FailureAction::Pause
                        {
                            return Err(invalid(
                                "dynamic Human nodes and pause-on-error require unsupported managed provenance; use a static workflow",
                            ));
                        }
                        if let NodeKind::Prompt { prompt } = &node.action
                            && !prompts.contains(prompt)
                        {
                            self.allowed(prompt, ModuleKind::Prompt)?;
                        }
                    }
                }
                document.modules.extend(generated.into_values());
                document.host.name = "dynamic-workflow-host".into();
                let request_ref = ModuleRef::new("__dynamic_request", "1");
                document.modules.push(ModuleDefinition {
                    reference: request_ref.clone(),
                    factory: "binding.dynamic_request".into(),
                    config: json!({"fingerprint":fingerprint}),
                    dependencies: Default::default(),
                });
                document.host.bindings.push(request_ref);
                let workflow = compile_workflow(document, &self.registry)?;
                self.verify_snapshot(&workflow.snapshot.modules)?;
                Ok((
                    workflow.as_tool(&self.config.name, "Dynamic workflow"),
                    json!({"input": input}),
                ))
            }
        }
    }
}
struct RequestIdentity;
impl ContextBinding for RequestIdentity {
    fn bind(&self, _: &mut RunContext) -> Result<(), Error> {
        Ok(())
    }
}
struct ModelBinding(Arc<dyn Model>);
impl ContextBinding for ModelBinding {
    fn bind(&self, context: &mut RunContext) -> Result<(), Error> {
        self.0.bind_scope(context)
    }
}
struct ModelBindingFactory;
impl ModuleFactory for ModelBindingFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "binding.dynamic_model".into(),
            revision: "1".into(),
            kind: ModuleKind::Binding,
            config_schema: json!({"type":"object","additionalProperties":false}),
            input_schema: None,
            output_schema: None,
            required_capabilities: Default::default(),
            dependencies: BTreeMap::from([("model".into(), ModuleKind::Model)]),
        }
    }
    fn build(
        &self,
        config: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(
            &self.descriptor().config_schema,
            config,
        )?;
        let Some(ModuleInstance::Model(model)) = dependencies.get("model") else {
            return Err(invalid("dynamic model binding requires a model"));
        };
        Ok(ModuleInstance::Binding(Arc::new(ModelBinding(
            model.clone(),
        ))))
    }
}
#[async_trait::async_trait]
impl ToolDispatch for Assembly {
    fn is_resumable(&self) -> bool {
        true
    }
    fn recovery_identity(&self) -> Option<String> {
        Some(self.identity.clone())
    }
    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        args: Value,
        context: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        if id.as_str() != self.config.name {
            return nofy_tool_runtime::terminal_only(Err(
                nofy_tool_runtime::ToolError::invalid_arguments("dynamic tool identity mismatch"),
            ));
        }
        match self.prepare(args) {
            Ok((entry, args)) => entry.dispatch.call(id, args, context).await,
            Err(error) => nofy_tool_runtime::terminal_only(Err(
                nofy_tool_runtime::ToolError::invalid_arguments(error.to_string()),
            )),
        }
    }
}

struct RequestIdentityFactory;
impl ModuleFactory for RequestIdentityFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "binding.dynamic_request".into(),
            revision: "1".into(),
            kind: ModuleKind::Binding,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["fingerprint"],"properties":{"fingerprint":{"type":"string","minLength":1}}}),
            input_schema: None,
            output_schema: None,
            required_capabilities: Default::default(),
            dependencies: Default::default(),
        }
    }
    fn build(
        &self,
        config: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(
            &self.descriptor().config_schema,
            config,
        )?;
        Ok(ModuleInstance::Binding(Arc::new(RequestIdentity)))
    }
}

#[cfg(test)]
#[path = "dynamic_assembly_tests.rs"]
mod tests;
