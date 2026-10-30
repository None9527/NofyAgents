//! Portable declarative systems over the existing Agent/Tool/workflow/Event
//! compiler. Preparing a system validates and binds modules without doing IO.
mod compile;
mod input;
pub use input::SystemFile;
pub(crate) mod invocation;
pub use invocation::ProgramInterface;
mod lock;
use crate::{
    Error, ToolCall,
    compile::AgentDefinition,
    event_program::EventProgramDefinition,
    program::{CompiledProgram, ExecutionSnapshot},
    registry::*,
    tool_program::ToolRuntimeDefinition,
};
pub use compile::compile_system;
pub use lock::{SystemChange, SystemChangeKind, SystemDiff};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SystemDocument {
    pub schema_version: u32,
    pub name: String,
    #[serde(default)]
    pub modules: Vec<ModuleDefinition>,
    #[serde(default)]
    pub required_policies: Vec<ModuleRef>,
    #[serde(default)]
    pub required_governance: Vec<ModuleRef>,
    pub programs: BTreeMap<String, ProgramDefinition>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum ProgramDefinition {
    Agent {
        definition: AgentDefinition,
    },
    Tool {
        definition: ToolRuntimeDefinition,
        call: ToolCall,
    },
    Event {
        definition: EventProgramDefinition,
    },
    #[cfg(feature = "workflow")]
    Workflow {
        document: crate::workflow::compile::WorkflowDocument,
        input: serde_json::Value,
    },
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LockedProgram {
    pub snapshot: ExecutionSnapshot,
    pub composition_digest: String,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SystemLock {
    pub schema_version: u32,
    pub protocol: String,
    pub modules: Vec<ResolvedModule>,
    pub programs: BTreeMap<String, LockedProgram>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SystemBundle {
    pub schema_version: u32,
    pub document: SystemDocument,
    pub lock: SystemLock,
    pub digest: String,
}
#[derive(Clone)]
pub struct CompiledSystem {
    pub bundle: SystemBundle,
    pub(crate) programs: BTreeMap<String, CompiledProgram>,
    pub(crate) registry: ModuleRegistry,
}
impl CompiledSystem {
    pub fn registry(&self) -> &ModuleRegistry {
        &self.registry
    }
    pub fn program(&self, name: &str) -> Result<&CompiledProgram, Error> {
        self.programs
            .get(name)
            .ok_or_else(|| Error::Composition(format!("system program not found: {name}")))
    }
    pub fn program_names(&self) -> Vec<&str> {
        self.programs.keys().map(String::as_str).collect()
    }
}
impl SystemBundle {
    /// Verify the complete export before installing any definitions in a
    /// private registry. The destination need only install matching factories.
    pub fn restore(&self, host: &ModuleRegistry) -> Result<CompiledSystem, Error> {
        self.validate()?;
        let compiled = compile_system(self.document.clone(), host)?;
        if compiled.bundle.digest != self.digest {
            return Err(Error::Composition(
                "system factory, resource contract, floor or lock changed".into(),
            ));
        }
        Ok(compiled)
    }
    pub fn validate(&self) -> Result<(), Error> {
        if self.schema_version != 1
            || self.lock.schema_version != 1
            || self.lock.protocol != "nofy.runtime/v1"
            || digest(&(&self.document, &self.lock))? != self.digest
            || serde_json::to_vec(self).map_or(true, |v| v.len() > 32 * 1024 * 1024)
        {
            return Err(Error::Composition(
                "invalid, changed or oversized system bundle".into(),
            ));
        }
        Ok(())
    }
}
pub(crate) fn canonical(value: serde_json::Value) -> serde_json::Value {
    match value {
        serde_json::Value::Object(fields) => {
            let sorted = fields.into_iter().collect::<BTreeMap<_, _>>();
            serde_json::Value::Object(sorted.into_iter().map(|(k, v)| (k, canonical(v))).collect())
        }
        serde_json::Value::Array(values) => {
            serde_json::Value::Array(values.into_iter().map(canonical).collect())
        }
        other => other,
    }
}
pub(crate) fn digest<T: Serialize>(value: &T) -> Result<String, Error> {
    let value =
        canonical(serde_json::to_value(value).map_err(|e| Error::Composition(e.to_string()))?);
    let bytes = serde_json::to_vec(&value).map_err(|e| Error::Composition(e.to_string()))?;
    Ok(digest_bytes(&bytes))
}
pub(crate) fn digest_bytes(bytes: &[u8]) -> String {
    use sha2::{Digest, Sha256};
    format!("{:x}", Sha256::digest(bytes))
}
pub(crate) fn bounded_name(value: &str) -> Result<(), Error> {
    if value.trim().is_empty() || value.len() > 256 {
        return Err(Error::Composition(
            "system/control name requires 1..=256 bytes".into(),
        ));
    }
    Ok(())
}

/// Stable JSON content identity, independent of object insertion order.
pub fn content_digest<T: Serialize>(value: &T) -> Result<String, Error> {
    digest(value)
}
