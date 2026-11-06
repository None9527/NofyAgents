//! Configurable model-free tool execution. A ToolRuntime shares Agent's real
//! schema, policy, hook, budget, cancellation and reconciliation boundary.
use crate::registry::{ModuleInstance, ModuleKind, ModuleRef, ModuleRegistry, ResolvedModule};
use crate::{Agent, Error, RunContext, RunInput, RunOutcome, ToolCall, ToolCatalog};
use serde::{Deserialize, Serialize};
use std::collections::BTreeSet;

fn one() -> u32 {
    1
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ToolRuntimeDefinition {
    #[serde(default = "one")]
    pub schema_version: u32,
    pub name: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub scope_identity: Option<crate::IdentityScheme>,
    #[serde(default)]
    pub tool_packs: Vec<ModuleRef>,
    #[serde(default)]
    pub tool_sources: Vec<ModuleRef>,
    #[serde(default)]
    pub policies: Vec<ModuleRef>,
    #[serde(default)]
    pub governance: Vec<ModuleRef>,
    #[serde(default)]
    pub hooks: Vec<ModuleRef>,
    #[serde(default)]
    pub bindings: Vec<ModuleRef>,
    #[serde(default)]
    pub checkpointer: Option<ModuleRef>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ToolCompilationSnapshot {
    pub version: u32,
    pub definition: ToolRuntimeDefinition,
    pub modules: Vec<ResolvedModule>,
    pub required_policies: Vec<ModuleRef>,
    pub required_governance: Vec<ModuleRef>,
}
impl ToolCompilationSnapshot {
    pub fn restore(&self, host: &ModuleRegistry) -> Result<CompiledToolRuntime, Error> {
        if self.version != 1 {
            return Err(Error::Composition("unsupported tool snapshot".into()));
        }
        let registry = crate::compile::restore_modules(
            host,
            &self.modules,
            &self.required_policies,
            &self.required_governance,
        )?;
        let compiled = compile_tools(self.definition.clone(), &registry)?;
        if serde_json::to_value(&compiled.snapshot).ok() != serde_json::to_value(self).ok() {
            return Err(Error::Composition(
                "restored tool runtime snapshot changed".into(),
            ));
        }
        Ok(compiled)
    }
}

pub struct CompiledToolRuntime {
    pub runtime: ToolRuntime,
    pub snapshot: ToolCompilationSnapshot,
}

#[derive(Clone)]
pub struct ToolRuntime {
    agent: Agent,
}
impl ToolRuntime {
    pub(crate) fn event_program(
        &self,
        event: crate::event_program::BoundEvent,
        identity: String,
    ) -> Result<Agent, Error> {
        self.agent
            .clone()
            .constrain_program_descendants()?
            .bind_event_program(event, identity)
    }

    pub(crate) fn tool_schema(&self, name: &str) -> Result<Option<serde_json::Value>, Error> {
        self.agent.program_tool_schema(name)
    }

    #[cfg(feature = "workflow")]
    pub(crate) fn constrain_descendants(mut self) -> Result<Self, Error> {
        self.agent = self.agent.constrain_program_descendants()?;
        Ok(self)
    }

    #[cfg(feature = "workflow")]
    pub(crate) fn with_entry(mut self, entry: crate::ToolEntry) -> Result<Self, Error> {
        self.agent.add_program_tool(entry)?;
        Ok(self)
    }
    #[cfg(feature = "workflow")]
    pub(crate) fn single(entry: crate::ToolEntry) -> Result<Self, Error> {
        Self {
            agent: Agent::tool_program("workflow-node".into(), ToolCatalog::new()),
        }
        .with_entry(entry)
    }
    pub(crate) fn program(&self, call: ToolCall) -> Result<Agent, Error> {
        self.agent.bind_tool_program(call)
    }

    pub fn with_checkpointer(mut self, store: std::sync::Arc<dyn crate::Checkpointer>) -> Self {
        self.agent = self.agent.with_checkpointer(store);
        self
    }
    pub fn composition_identity(&self) -> &str {
        self.agent.composition_identity()
    }
    pub fn checkpoint_key(&self, thread_id: &str) -> String {
        self.agent.checkpoint_key(thread_id)
    }
    pub async fn invoke(
        &self,
        call: ToolCall,
        input: RunInput,
        context: RunContext,
    ) -> Result<RunOutcome, Error> {
        validate_call(&call)?;
        self.agent.invoke_tool_program(call, input, context).await
    }
}

pub(crate) fn validate_call(call: &ToolCall) -> Result<(), Error> {
    if call.id.is_empty()
        || call.name.is_empty()
        || serde_json::to_vec(call).map_or(true, |v| v.len() > 1024 * 1024)
    {
        return Err(Error::Composition(
            "tool call identity required and call must fit 1 MiB".into(),
        ));
    }
    Ok(())
}

pub fn compile_tools(
    mut definition: ToolRuntimeDefinition,
    registry: &ModuleRegistry,
) -> Result<CompiledToolRuntime, Error> {
    if definition.schema_version != 1
        || definition.name.trim().is_empty()
        || definition.name.len() > 4096
    {
        return Err(Error::Composition(
            "tool runtime requires version 1 and a bounded name".into(),
        ));
    }
    for (references, required) in [
        (&mut definition.policies, registry.required_policies()),
        (&mut definition.governance, registry.required_governance()),
    ] {
        for reference in required {
            if !references.contains(reference) {
                references.push(reference.clone());
            }
        }
    }
    let mut roots = Vec::new();
    for (references, kind) in [
        (&definition.tool_packs, ModuleKind::ToolPack),
        (&definition.tool_sources, ModuleKind::ToolSource),
        (&definition.policies, ModuleKind::Policy),
        (&definition.governance, ModuleKind::Governance),
        (&definition.hooks, ModuleKind::Hook),
        (&definition.bindings, ModuleKind::Binding),
    ] {
        let mut seen = BTreeSet::new();
        for reference in references {
            if !seen.insert(reference) {
                return Err(Error::Composition("duplicate tool runtime module".into()));
            }
            roots.push((reference.clone(), kind));
        }
    }
    roots.extend(
        definition
            .checkpointer
            .iter()
            .cloned()
            .map(|r| (r, ModuleKind::Checkpointer)),
    );
    let resolved = registry.resolve_typed(&roots)?;
    let mut catalog = ToolCatalog::new();
    for reference in &definition.tool_packs {
        if let ModuleInstance::ToolPack(pack) = &resolved.instances[reference] {
            catalog.extend(pack.clone())?;
        }
    }
    let mut agent = Agent::tool_program(definition.name.clone(), catalog);
    agent.set_scope_identity(definition.scope_identity);
    for reference in &definition.tool_sources {
        if let ModuleInstance::ToolSource(source) = &resolved.instances[reference] {
            agent.tool_source(reference.key(), source.clone());
        }
    }
    for reference in &definition.policies {
        if let ModuleInstance::Policy(policy) = &resolved.instances[reference] {
            if registry.required_policies().contains(reference) {
                let identity = serde_json::to_string(&(reference, &resolved.snapshot))
                    .map_err(|e| Error::Composition(e.to_string()))?;
                agent = agent.with_required_policy(identity, policy.clone())?;
            } else {
                agent.tool_policy(policy.clone());
            }
        }
    }
    for reference in &definition.governance {
        if let ModuleInstance::Governance(profile) = &resolved.instances[reference] {
            agent = agent.with_governance(profile.clone());
        }
    }
    for reference in &definition.bindings {
        if let ModuleInstance::Binding(binding) = &resolved.instances[reference] {
            agent = agent.with_binding(reference.key(), binding.clone());
        }
    }
    if !definition.hooks.is_empty() {
        let hooks = definition
            .hooks
            .iter()
            .map(|reference| {
                let ModuleInstance::Hook(hook) = &resolved.instances[reference] else {
                    unreachable!()
                };
                hook.versioned(
                    serde_json::to_string(&(reference, &resolved.snapshot))
                        .map_err(|e| Error::Composition(e.to_string()))?,
                )
            })
            .collect::<Result<Vec<_>, Error>>()?;
        agent = agent.with_hooks(crate::hooks::HookBus::new(
            crate::hooks::EventCatalog::runtime(),
            hooks,
        )?);
    }
    if let Some(reference) = &definition.checkpointer
        && let ModuleInstance::Checkpointer(store) = &resolved.instances[reference]
    {
        agent = agent.with_checkpointer(store.clone());
    }
    let snapshot = ToolCompilationSnapshot {
        version: 1,
        definition,
        modules: resolved.snapshot,
        required_policies: registry.required_policies().iter().cloned().collect(),
        required_governance: registry.required_governance().iter().cloned().collect(),
    };
    let identity =
        serde_json::to_string(&snapshot).map_err(|e| Error::Composition(e.to_string()))?;
    struct Identity;
    impl crate::context::ContextBinding for Identity {
        fn bind(&self, _: &mut RunContext) -> Result<(), Error> {
            Ok(())
        }
    }
    agent = agent.with_binding(identity, std::sync::Arc::new(Identity));
    Ok(CompiledToolRuntime {
        runtime: ToolRuntime { agent },
        snapshot,
    })
}
