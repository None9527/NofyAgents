//! An owned, frozen event is an executable root, not a synthetic model/tool.
//! Hosts install producer authority; documents only select an installed module.
pub mod declarative;
use crate::{hooks::*, registry::*, tool_program::*, *};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Arc;

#[derive(Clone)]
pub struct EventProducer {
    catalog: EventCatalog,
}
impl EventProducer {
    pub fn new(owner: ModuleRef, events: Vec<EventDeclaration>) -> Result<Self, Error> {
        if owner.id == runtime_owner().id {
            return Err(Error::Composition(
                "the runtime event namespace is reserved".into(),
            ));
        }
        Self::owned(owner, events)
    }
    fn owned(owner: ModuleRef, events: Vec<EventDeclaration>) -> Result<Self, Error> {
        if events.is_empty()
            || events.len() > 128
            || owner.id.len() > 4096
            || owner.version.len() > 256
        {
            return Err(Error::Composition(
                "producer requires 1..=128 bounded declarations".into(),
            ));
        }
        let mut catalog = EventCatalog::default();
        for event in events {
            if event.owner != owner || event.name.len() > 256 {
                return Err(Error::Composition(
                    "event declaration belongs to another producer".into(),
                ));
            }
            catalog.declare(event)?;
        }
        Ok(Self { catalog })
    }
    /// Explicit host authority for session coordinator signals only. This does
    /// not authorize publishing model, permission or tool lifecycle events.
    pub fn session() -> Self {
        let runtime = EventCatalog::runtime();
        Self::owned(
            runtime_owner(),
            ["session_idle", "session_end"]
                .into_iter()
                .map(|name| runtime.get(name).expect("session declaration").clone())
                .collect(),
        )
        .expect("session producer")
    }
    pub fn catalog(&self) -> EventCatalog {
        self.catalog.clone()
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct EventProgramDefinition {
    pub schema_version: u32,
    pub host: ToolRuntimeDefinition,
    pub producer: ModuleRef,
    pub event: String,
    pub operation: String,
    pub payload: Value,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct EventCompilationSnapshot {
    pub version: u32,
    pub definition: EventProgramDefinition,
    pub host: ToolCompilationSnapshot,
    pub modules: Vec<ResolvedModule>,
    pub declaration: EventDeclaration,
}
impl EventCompilationSnapshot {
    pub fn restore(&self, registry: &ModuleRegistry) -> Result<CompiledEventProgram, Error> {
        if self.version != 1
            || serde_json::to_vec(self).map_or(true, |v| v.len() > 16 * 1024 * 1024)
        {
            return Err(Error::Composition(
                "unsupported or oversized event snapshot".into(),
            ));
        }
        let registry = crate::compile::restore_modules(
            registry,
            &self.modules,
            &self.host.required_policies,
            &self.host.required_governance,
        )?;
        let registry = crate::compile::restore_modules(
            &registry,
            &self.host.modules,
            &self.host.required_policies,
            &self.host.required_governance,
        )?;
        let compiled = compile_event(self.definition.clone(), &registry)?;
        if serde_json::to_value(&compiled.snapshot).ok() != serde_json::to_value(self).ok() {
            return Err(Error::Composition(
                "restored event producer/host changed".into(),
            ));
        }
        Ok(compiled)
    }
}
#[derive(Clone)]
pub struct CompiledEventProgram {
    pub snapshot: EventCompilationSnapshot,
    pub(crate) agent: Agent,
}
impl CompiledEventProgram {
    pub fn hook_bus(&self) -> &HookBus {
        self.agent.hook_bus().expect("compiled event bus")
    }
    pub fn composition_identity(&self) -> &str {
        self.agent.composition_identity()
    }
    pub fn checkpoint_key(&self, thread: &str) -> String {
        self.agent.checkpoint_key(thread)
    }
    pub fn with_checkpointer(mut self, store: Arc<dyn Checkpointer>) -> Self {
        self.agent = self.agent.with_checkpointer(store);
        self
    }
    pub async fn invoke(&self, input: RunInput, context: RunContext) -> Result<RunOutcome, Error> {
        crate::program::CompiledProgram::for_event(self)?
            .invoke(input, context)
            .await
    }
}
#[derive(Clone)]
pub(crate) struct BoundEvent {
    pub declaration: EventDeclaration,
    pub operation: String,
    pub payload: Value,
}
pub fn compile_event(
    definition: EventProgramDefinition,
    registry: &ModuleRegistry,
) -> Result<CompiledEventProgram, Error> {
    if definition.schema_version != 1
        || definition.operation.trim().is_empty()
        || definition.operation.len() > 1024
        || serde_json::to_vec(&definition.payload).map_or(true, |v| v.len() > 1024 * 1024)
    {
        return Err(Error::Composition(
            "event requires version 1, a bounded operation and payload".into(),
        ));
    }
    let resolved =
        registry.resolve_typed(&[(definition.producer.clone(), ModuleKind::EventProducer)])?;
    let ModuleInstance::EventProducer(producer) = &resolved.instances[&definition.producer] else {
        unreachable!("typed producer resolution")
    };
    let declaration = producer
        .catalog
        .get(&definition.event)
        .cloned()
        .ok_or_else(|| Error::Composition("event is not owned by the installed producer".into()))?;
    crate::settings::validate_json_value(&declaration.payload_schema, &definition.payload)?;
    let host = compile_tools(definition.host.clone(), registry)?;
    let snapshot = EventCompilationSnapshot {
        version: 1,
        definition: EventProgramDefinition {
            host: host.snapshot.definition.clone(),
            ..definition
        },
        host: host.snapshot,
        modules: resolved.snapshot,
        declaration,
    };
    let identity =
        serde_json::to_string(&snapshot).map_err(|e| Error::Composition(e.to_string()))?;
    let agent = host.runtime.event_program(
        BoundEvent {
            declaration: snapshot.declaration.clone(),
            operation: snapshot.definition.operation.clone(),
            payload: snapshot.definition.payload.clone(),
        },
        identity,
    )?;
    Ok(CompiledEventProgram { snapshot, agent })
}
