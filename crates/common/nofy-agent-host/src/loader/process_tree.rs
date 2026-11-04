//! Explicit hard resource boundaries; command execution is a separate layer.
use super::*;
use nofy_agent_runtime::{Error, registry::*, system::content_digest};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
#[cfg(target_os = "linux")]
mod bootstrap;
#[cfg(target_os = "linux")]
mod cgroup;
#[cfg(target_os = "linux")]
mod filter;
#[cfg(target_os = "linux")]
pub(in crate::loader) mod sandbox;
#[cfg(target_os = "linux")]
mod supervisor;
#[cfg(target_os = "linux")]
pub(in crate::loader) use bootstrap::Bootstrap;
#[cfg(target_os = "linux")]
pub use bootstrap::worker_entry;
#[cfg(target_os = "linux")]
use cgroup::Job;
#[cfg(target_os = "linux")]
pub use cgroup::Manager;
#[cfg(target_os = "linux")]
pub use supervisor::{Invocation, Output};
#[cfg(all(test, target_os = "linux"))]
mod tests;

pub const FACTORY: &str = "resource.process_tree_limits";

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(default, deny_unknown_fields)]
pub struct Limits {
    pub max_processes: u32,
    pub max_memory_bytes: u64,
    pub cpu_percent: u32,
}
impl Default for Limits {
    fn default() -> Self {
        Self {
            max_processes: 32,
            max_memory_bytes: 512 * 1024 * 1024,
            cpu_percent: 100,
        }
    }
}
impl Limits {
    pub fn validate(&self) -> Result<()> {
        if !(4..=512).contains(&self.max_processes)
            || !(64 * 1024 * 1024..=8 * 1024 * 1024 * 1024).contains(&self.max_memory_bytes)
            || !(1..=800).contains(&self.cpu_percent)
        {
            return Err(HostError::Invalid("invalid process-tree limits".into()));
        }
        Ok(())
    }
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct Config {
    pub cgroup_root: PathBuf,
    #[serde(default)]
    pub limits: Limits,
}
impl Config {
    pub fn validate(&self) -> Result<()> {
        self.limits.validate()?;
        let path = self
            .cgroup_root
            .to_str()
            .ok_or_else(|| HostError::Invalid("cgroup root must be UTF-8".into()))?;
        if !cfg!(target_os = "linux")
            || path.len() > 4096
            || !path.starts_with("/sys/fs/cgroup/")
            || path
                .split('/')
                .skip(1)
                .any(|p| p.is_empty() || matches!(p, "." | "..") || p.chars().any(char::is_control))
        {
            return Err(HostError::Invalid(
                "an explicit canonical cgroup v2 delegation root is required".into(),
            ));
        }
        Ok(())
    }
    pub fn preflight(&self) -> Result<()> {
        self.validate()?;
        #[cfg(target_os = "linux")]
        {
            cgroup::preflight(self).map(|_| ())
        }
        #[cfg(not(target_os = "linux"))]
        {
            Err(HostError::Unavailable(
                "process-tree control requires Linux cgroup v2".into(),
            ))
        }
    }
}
pub(super) fn config(value: &Value) -> Result<Config> {
    let config: Config = serde_json::from_value(value.clone())
        .map_err(|_| HostError::Invalid("invalid process-tree resource".into()))?;
    config.validate()?;
    Ok(config)
}
pub(super) fn preflight(document: &SystemDocument) -> Result<()> {
    for module in module_walk::collect(document)? {
        if module.factory == FACTORY {
            config(&module.config)?.preflight()?;
        }
    }
    Ok(())
}
pub(super) struct Factory;
impl ModuleFactory for Factory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: FACTORY.into(),
            revision: "1".into(),
            kind: ModuleKind::Resource,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["cgroup_root"],"properties":{
                "cgroup_root":{"type":"string","minLength":1,"maxLength":4096},
                "limits":{"type":"object","additionalProperties":false,"properties":{
                    "max_processes":{"type":"integer","minimum":4,"maximum":512},
                    "max_memory_bytes":{"type":"integer","minimum":67108864,"maximum":8589934592u64},
                    "cpu_percent":{"type":"integer","minimum":1,"maximum":800}
                }}
            }}),
            input_schema: None,
            output_schema: None,
            dependencies: Default::default(),
            required_capabilities: Default::default(),
        }
    }
    fn build(
        &self,
        value: &Value,
        _: &std::collections::BTreeMap<String, ModuleInstance>,
    ) -> std::result::Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        let config = config(value).map_err(|e| Error::Composition(e.to_string()))?;
        let identity = format!("process-tree-limits-v1:{}", content_digest(&config)?);
        Ok(ModuleInstance::Resource(Arc::new(ResourceHandle::new(
            identity,
            Arc::new(config),
        )?)))
    }
}
