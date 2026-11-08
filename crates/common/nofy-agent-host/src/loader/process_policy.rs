//! Portable process policy declarations and resource identity.
//! Backend support and enforcement remain the responsibility of platform adapters.
use super::{HostError, Result};
use nofy_agent_runtime::{Error, registry::*, system::content_digest};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::{collections::BTreeMap, sync::Arc};
pub mod network;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct Limits {
    pub cpu_seconds: u64,
    pub address_space_bytes: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub network_proxy: Option<network::Config>,
    pub filesystem_mode: FilesystemMode,
    pub writable_directories: std::collections::BTreeSet<String>,
}
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FilesystemMode {
    ReadOnly,
    WorkspaceWrite,
    #[default]
    FullAccess,
}
impl Default for Limits {
    fn default() -> Self {
        Self {
            cpu_seconds: 120,
            address_space_bytes: 2 * 1024 * 1024 * 1024,
            network_proxy: None,
            filesystem_mode: FilesystemMode::FullAccess,
            writable_directories: std::collections::BTreeSet::from(["WORKSPACE".into()]),
        }
    }
}
impl Limits {
    pub fn validate(&self) -> Result<()> {
        if self.writable_directories.len() > 8
            || self.writable_directories.iter().any(|alias| {
                alias.is_empty()
                    || alias.len() > 32
                    || !alias.as_bytes()[0].is_ascii_uppercase()
                    || !alias
                        .bytes()
                        .all(|b| b.is_ascii_uppercase() || b.is_ascii_digit() || b == b'_')
            })
        {
            return Err(HostError::Invalid(
                "invalid writable directory aliases".into(),
            ));
        }
        if let Some(network) = &self.network_proxy {
            network.validate()?;
        }
        if !(1..=600).contains(&self.cpu_seconds)
            || !(64 * 1024 * 1024..=16 * 1024 * 1024 * 1024).contains(&self.address_space_bytes)
        {
            return Err(HostError::Invalid(
                "invalid per-process namespace limits".into(),
            ));
        }
        Ok(())
    }
}
pub(super) struct LimitsFactory;
impl ModuleFactory for LimitsFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "resource.process_namespace_limits".into(),
            revision: "1".into(),
            kind: ModuleKind::Resource,
            config_schema: json!({"type":"object","additionalProperties":false,"properties":{
                "filesystem_mode":{"enum":["read_only","workspace_write","full_access"],"default":"full_access"},
                "writable_directories":{"type":"array","maxItems":8,"uniqueItems":true,"items":{"type":"string","minLength":1,"maxLength":32,"pattern":"^[A-Z][A-Z0-9_]*$"}},
                "network_proxy":{"anyOf":[network::schema(),{"type":"null"}]},
                "cpu_seconds":{"type":"integer","minimum":1,"maximum":600},
                "address_space_bytes":{"type":"integer","minimum":67108864,"maximum":17179869184u64}}}),
            input_schema: None,
            output_schema: None,
            dependencies: Default::default(),
            required_capabilities: Default::default(),
        }
    }
    fn build(
        &self,
        value: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> std::result::Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        let limits: Limits =
            serde_json::from_value(value.clone()).map_err(|e| Error::Composition(e.to_string()))?;
        limits
            .validate()
            .map_err(|e| Error::Composition(e.to_string()))?;
        Ok(ModuleInstance::Resource(Arc::new(ResourceHandle::new(
            format!("namespace-limits:{}", content_digest(&limits)?),
            Arc::new(limits),
        )?)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn portable_limits_preserve_defaults_and_wire_format() {
        let limits: Limits = serde_json::from_value(json!({})).unwrap();
        limits.validate().unwrap();
        assert_eq!(
            serde_json::to_value(&limits).unwrap(),
            json!({
                "cpu_seconds": 120,
                "address_space_bytes": 2147483648u64,
                "filesystem_mode": "full_access",
                "writable_directories": ["WORKSPACE"]
            })
        );
        assert!(serde_json::from_value::<Limits>(json!({"unexpected": true})).is_err());
    }

    #[test]
    fn portable_limits_enforce_bounds_and_aliases() {
        for cpu_seconds in [1, 600] {
            for address_space_bytes in [64 * 1024 * 1024, 16 * 1024 * 1024 * 1024] {
                Limits {
                    cpu_seconds,
                    address_space_bytes,
                    ..Limits::default()
                }
                .validate()
                .unwrap();
            }
        }
        for cpu_seconds in [0, 601] {
            assert!(
                Limits {
                    cpu_seconds,
                    ..Limits::default()
                }
                .validate()
                .is_err()
            );
        }
        for address_space_bytes in [64 * 1024 * 1024 - 1, 16 * 1024 * 1024 * 1024 + 1] {
            assert!(
                Limits {
                    address_space_bytes,
                    ..Limits::default()
                }
                .validate()
                .is_err()
            );
        }
        for alias in [
            "",
            "workspace",
            "1WORKSPACE",
            "WORK-SPACE",
            "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFG",
        ] {
            let limits = Limits {
                writable_directories: [alias.to_owned()].into(),
                ..Limits::default()
            };
            assert!(limits.validate().is_err(), "{alias}");
        }
        let limits = Limits {
            writable_directories: (0..9).map(|i| format!("WORKSPACE_{i}")).collect(),
            ..Limits::default()
        };
        assert!(limits.validate().is_err());
    }

    #[test]
    fn portable_factory_preserves_descriptor_and_resource_identity() {
        let descriptor = LimitsFactory.descriptor();
        assert_eq!(descriptor.factory, "resource.process_namespace_limits");
        assert_eq!(descriptor.revision, "1");
        assert_eq!(descriptor.kind, ModuleKind::Resource);
        assert_eq!(
            descriptor.config_schema["properties"]["network_proxy"],
            json!({"anyOf": [network::schema(), {"type": "null"}]})
        );
        let ModuleInstance::Resource(resource) =
            LimitsFactory.build(&json!({}), &BTreeMap::new()).unwrap()
        else {
            panic!("expected portable resource");
        };
        assert_eq!(
            resource.identity(),
            format!(
                "namespace-limits:{}",
                content_digest(&Limits::default()).unwrap()
            )
        );
        assert_eq!(
            serde_json::to_value(resource.get::<Limits>().unwrap().as_ref()).unwrap(),
            serde_json::to_value(Limits::default()).unwrap()
        );
        for value in [
            json!({"cpu_seconds": 0}),
            json!({"unexpected": true}),
            json!({"network_proxy": {"allowed": []}}),
            json!({"writable_directories": ["WORKSPACE", "WORKSPACE"]}),
        ] {
            assert!(
                LimitsFactory.build(&value, &BTreeMap::new()).is_err(),
                "{value}"
            );
        }
    }

    #[test]
    fn policy_type_identity_is_preserved_with_legacy_exports() {
        let ModuleInstance::Resource(resource) =
            LimitsFactory.build(&json!({}), &BTreeMap::new()).unwrap()
        else {
            panic!("policy resource");
        };
        assert!(resource.get::<Limits>().is_some());
        #[cfg(target_os = "linux")]
        {
            let limits: crate::loader::process_sessions::Limits = Limits::default();
            assert_eq!(
                limits.filesystem_mode,
                crate::loader::process_sessions::FilesystemMode::FullAccess
            );
            let config: crate::loader::process_sessions::network::Config =
                network::Config::default();
            let _: network::Config = config;
        }
    }
}
