//! Configuration compilation over the existing Agent builder. No alternate
//! model/tool loop and no implicit resource discovery live here.
use crate::registry::{ModuleInstance, ModuleRef, ModuleRegistry, ResolvedModule};
use crate::{Agent, AgentBuilder, Components, Error, Settings};
use serde::{Deserialize, Serialize};
use serde_json::Value;

fn version_one() -> u32 {
    1
}
fn default_steps() -> usize {
    32
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct DefinitionSettings {
    #[serde(
        default,
        skip_serializing_if = "crate::settings::InputDelivery::is_default"
    )]
    pub input_delivery: crate::settings::InputDelivery,
    #[serde(default = "default_steps")]
    pub max_steps: usize,
    #[serde(default)]
    pub model: serde_json::Map<String, Value>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub scope_identity: Option<crate::IdentityScheme>,
}
impl Default for DefinitionSettings {
    fn default() -> Self {
        Self {
            input_delivery: Default::default(),
            max_steps: default_steps(),
            model: Default::default(),
            scope_identity: None,
        }
    }
}

/// Versioned configuration entry point. The legacy AgentSpec remains accepted
/// by the legacy builder; new definitions reject unknown options explicitly.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AgentDefinition {
    #[serde(default = "version_one")]
    pub schema_version: u32,
    pub name: String,
    pub model: ModuleRef,
    pub prompt: ModuleRef,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub session_policy: Option<ModuleRef>,
    #[serde(default)]
    pub tool_packs: Vec<ModuleRef>,
    #[serde(default)]
    pub policies: Vec<ModuleRef>,
    #[serde(default)]
    pub tool_sources: Vec<ModuleRef>,
    #[serde(default)]
    pub context_sources: Vec<ModuleRef>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub context_policies: Vec<ModuleRef>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub governance: Vec<ModuleRef>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub recipe: Option<ModuleRef>,
    #[serde(default)]
    pub middleware: Vec<ModuleRef>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub hooks: Vec<ModuleRef>,
    #[serde(default)]
    pub checkpointer: Option<ModuleRef>,
    #[serde(default)]
    pub bindings: Vec<ModuleRef>,
    #[serde(default)]
    pub settings: DefinitionSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompilationSnapshot {
    pub version: u32,
    pub agent: AgentDefinition,
    pub modules: Vec<ResolvedModule>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub required_policies: Vec<ModuleRef>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub required_governance: Vec<ModuleRef>,
}

impl CompilationSnapshot {
    /// Rebind persisted configuration to host-installed implementations. Every
    /// factory revision and definition must match; handles are never persisted.
    pub fn restore(&self, host: &ModuleRegistry) -> Result<CompiledAgent, Error> {
        if self.version != 1 {
            return Err(Error::Composition(
                "unsupported compilation snapshot version".into(),
            ));
        }
        let registry = restore_modules(
            host,
            &self.modules,
            &self.required_policies,
            &self.required_governance,
        )?;
        let restored = compile_agent(self.agent.clone(), &registry)?;
        if serde_json::to_value(&restored.snapshot).ok() != serde_json::to_value(self).ok() {
            return Err(Error::Composition(
                "restored composition does not match persisted snapshot".into(),
            ));
        }
        Ok(restored)
    }
}

pub struct CompiledAgent {
    pub agent: Agent,
    pub snapshot: CompilationSnapshot,
}

/// Portable request body for a configuration client. Definitions are compiled
/// in a private registry copy, never partially published into the host registry.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AgentDocument {
    #[serde(default = "version_one")]
    pub schema_version: u32,
    pub modules: Vec<crate::registry::ModuleDefinition>,
    pub agent: AgentDefinition,
}

pub fn compile_document(
    document: AgentDocument,
    host: &ModuleRegistry,
) -> Result<CompiledAgent, Error> {
    if document.schema_version != 1 {
        return Err(Error::Composition(format!(
            "unsupported document schema version: {}",
            document.schema_version
        )));
    }
    let mut registry = host.clone();
    for definition in document.modules {
        registry.define(definition)?;
    }
    compile_agent(document.agent, &registry)
}

struct SnapshotIdentity;
impl crate::context::ContextBinding for SnapshotIdentity {
    fn bind(&self, _: &mut crate::RunContext) -> Result<(), Error> {
        Ok(())
    }
}

pub fn compile_agent(
    mut definition: AgentDefinition,
    registry: &ModuleRegistry,
) -> Result<CompiledAgent, Error> {
    use crate::registry::ModuleKind;
    for reference in registry.required_governance() {
        if !definition.governance.contains(reference) {
            definition.governance.push(reference.clone());
        }
    }
    for reference in registry.required_policies() {
        if !definition.policies.contains(reference) {
            definition.policies.push(reference.clone());
        }
    }
    if !matches!(definition.schema_version, 1 | 2)
        || definition.schema_version == 1 && definition.session_policy.is_some()
    {
        return Err(Error::Composition(format!(
            "unsupported agent schema version: {}",
            definition.schema_version
        )));
    }
    if definition.name.trim().is_empty() || definition.settings.max_steps == 0 {
        return Err(Error::Composition(
            "agent name and positive max_steps required".into(),
        ));
    }
    let mut roots = vec![
        (definition.model.clone(), ModuleKind::Model),
        (definition.prompt.clone(), ModuleKind::Prompt),
    ];
    for (references, kind) in [
        (&definition.tool_packs, ModuleKind::ToolPack),
        (&definition.policies, ModuleKind::Policy),
        (&definition.tool_sources, ModuleKind::ToolSource),
        (&definition.context_sources, ModuleKind::ContextSource),
        (&definition.context_policies, ModuleKind::ContextPolicy),
        (&definition.governance, ModuleKind::Governance),
        (&definition.middleware, ModuleKind::Middleware),
        (&definition.hooks, ModuleKind::Hook),
        (&definition.bindings, ModuleKind::Binding),
    ] {
        let mut seen = std::collections::BTreeSet::new();
        for reference in references {
            if !seen.insert(reference) {
                return Err(Error::Composition(format!(
                    "duplicate module in agent slot: {}",
                    reference.key()
                )));
            }
            roots.push((reference.clone(), kind));
        }
    }
    roots.extend(
        definition
            .recipe
            .iter()
            .cloned()
            .map(|reference| (reference, ModuleKind::Recipe)),
    );
    roots.extend(
        definition
            .checkpointer
            .iter()
            .cloned()
            .map(|reference| (reference, ModuleKind::Checkpointer)),
    );
    roots.extend(
        definition
            .session_policy
            .iter()
            .cloned()
            .map(|reference| (reference, ModuleKind::SessionPolicy)),
    );
    let resolved = registry.resolve_typed(&roots)?;
    let get = |reference: &ModuleRef, expected: ModuleKind| -> Result<&ModuleInstance, Error> {
        let instance = &resolved.instances[reference];
        if instance.kind() != expected {
            return Err(Error::Composition(format!(
                "agent slot expects {expected:?}, module {} is {:?}",
                reference.key(),
                instance.kind()
            )));
        }
        Ok(instance)
    };
    let mut components = Components::default();
    if let ModuleInstance::Model(model) = get(&definition.model, ModuleKind::Model)? {
        components
            .models
            .insert(definition.model.key(), model.clone());
    }
    if let ModuleInstance::Prompt(prompt) = get(&definition.prompt, ModuleKind::Prompt)? {
        components
            .prompts
            .insert(definition.prompt.key(), prompt.clone());
    }
    let mut builder = AgentBuilder::new(&definition.name)
        .model(definition.model.key())
        .prompt(definition.prompt.key())
        .settings(Settings {
            input_delivery: definition.settings.input_delivery.clone(),
            max_steps: definition.settings.max_steps,
            model: Value::Object(definition.settings.model.clone()),
            scope_identity: definition.settings.scope_identity,
        });
    for reference in &definition.tool_packs {
        if let ModuleInstance::ToolPack(tools) = get(reference, ModuleKind::ToolPack)? {
            components.tool_packs.insert(reference.key(), tools.clone());
            builder = builder.tools(reference.key());
        }
    }
    for reference in &definition.policies {
        if let ModuleInstance::Policy(policy) = get(reference, ModuleKind::Policy)?
            && !registry.required_policies().contains(reference)
        {
            components.policies.insert(reference.key(), policy.clone());
            builder = builder.policy(reference.key());
        }
    }
    for reference in &definition.tool_sources {
        if let ModuleInstance::ToolSource(source) = get(reference, ModuleKind::ToolSource)? {
            components
                .tool_sources
                .insert(reference.key(), source.clone());
            builder = builder.tool_source(reference.key());
        }
    }
    for reference in &definition.context_sources {
        if let ModuleInstance::ContextSource(source) = get(reference, ModuleKind::ContextSource)? {
            components
                .context_sources
                .insert(reference.key(), source.clone());
            builder = builder.context_source(reference.key());
        }
    }
    let mut agent = builder.compile(&components)?;
    if let Some(reference) = &definition.recipe
        && let ModuleInstance::Recipe(recipe) = get(reference, ModuleKind::Recipe)?
    {
        agent = agent.with_recipe(recipe.clone())?;
    }
    for reference in &definition.governance {
        if let ModuleInstance::Governance(profile) = get(reference, ModuleKind::Governance)? {
            agent = agent.with_governance(profile.clone());
        }
    }
    for reference in &definition.context_policies {
        if let ModuleInstance::ContextPolicy(policy) = get(reference, ModuleKind::ContextPolicy)? {
            let resolved_policy = resolved
                .snapshot
                .iter()
                .find(|module| &module.definition.reference == reference)
                .expect("resolved context policy");
            agent = agent.with_context_policy(
                serde_json::to_string(resolved_policy)
                    .map_err(|e| Error::Composition(e.to_string()))?,
                policy.clone(),
            )?;
        }
    }
    for reference in registry.required_policies() {
        if let ModuleInstance::Policy(policy) = get(reference, ModuleKind::Policy)? {
            let resolved = resolved
                .snapshot
                .iter()
                .find(|module| &module.definition.reference == reference)
                .expect("resolved required policy");
            agent = agent.with_required_policy(
                serde_json::to_string(resolved).map_err(|e| Error::Composition(e.to_string()))?,
                policy.clone(),
            )?;
        }
    }
    for reference in &definition.middleware {
        if let ModuleInstance::Middleware(middleware) = get(reference, ModuleKind::Middleware)? {
            agent = agent.with_middleware(middleware.clone());
        }
    }
    if !definition.hooks.is_empty() {
        let mut hooks = Vec::new();
        for reference in &definition.hooks {
            if let ModuleInstance::Hook(hook) = get(reference, ModuleKind::Hook)? {
                let identity = serde_json::to_string(&(reference, &resolved.snapshot))
                    .map_err(|e| Error::Composition(e.to_string()))?;
                hooks.push(hook.versioned(identity)?);
            }
        }
        agent = agent.with_hooks(crate::hooks::HookBus::new(
            crate::hooks::EventCatalog::runtime(),
            hooks,
        )?);
    }
    if let Some(reference) = &definition.checkpointer
        && let ModuleInstance::Checkpointer(store) = get(reference, ModuleKind::Checkpointer)?
    {
        agent = agent.with_checkpointer(store.clone());
    }
    for reference in &definition.bindings {
        if let ModuleInstance::Binding(binding) = get(reference, ModuleKind::Binding)? {
            let identity =
                serde_json::to_string(reference).map_err(|e| Error::Composition(e.to_string()))?;
            agent = agent.with_binding(identity, binding.clone());
        }
    }
    let snapshot = CompilationSnapshot {
        version: 1,
        agent: definition,
        modules: resolved.snapshot,
        required_policies: registry.required_policies().iter().cloned().collect(),
        required_governance: registry.required_governance().iter().cloned().collect(),
    };
    let identity =
        serde_json::to_string(&snapshot).map_err(|e| Error::Composition(e.to_string()))?;
    agent = agent.with_binding(identity, std::sync::Arc::new(SnapshotIdentity));
    Ok(CompiledAgent { agent, snapshot })
}

pub(crate) fn restore_modules(
    host: &ModuleRegistry,
    modules: &[ResolvedModule],
    required_policies: &[ModuleRef],
    required_governance: &[ModuleRef],
) -> Result<ModuleRegistry, Error> {
    if required_policies
        != host
            .required_policies()
            .iter()
            .cloned()
            .collect::<Vec<_>>()
            .as_slice()
    {
        return Err(Error::Composition(
            "host required policy floor changed during restore".into(),
        ));
    }
    if required_governance
        != host
            .required_governance()
            .iter()
            .cloned()
            .collect::<Vec<_>>()
    {
        return Err(Error::Composition(
            "host required governance floor changed during restore".into(),
        ));
    }
    let mut registry = host.clone();
    let descriptors = host.descriptors();
    for module in modules {
        let factory = descriptors
            .iter()
            .find(|descriptor| descriptor.factory == module.factory.factory)
            .ok_or_else(|| {
                Error::Composition(format!(
                    "missing factory during restore: {}",
                    module.factory.factory
                ))
            })?;
        if serde_json::to_value(factory).ok() != serde_json::to_value(&module.factory).ok() {
            return Err(Error::Composition(format!(
                "factory revision/schema changed during restore: {}",
                module.factory.factory
            )));
        }
        if let Some(existing) = registry.definition(&module.definition.reference) {
            if serde_json::to_value(existing).ok() != serde_json::to_value(&module.definition).ok()
            {
                return Err(Error::Composition(format!(
                    "module version changed during restore: {}",
                    module.definition.reference.key()
                )));
            }
        } else {
            registry.define(module.definition.clone())?;
        }
    }
    Ok(registry)
}
