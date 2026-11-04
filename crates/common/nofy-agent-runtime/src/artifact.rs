//! Portable source packages. The factory is pure; persistence/materialization
//! belongs to the management loader and actual execution boundary.
use crate::{Error, registry::*, system::content_digest};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    path::{Component, Path},
    sync::Arc,
};
fn composition(message: impl Into<String>) -> Error {
    Error::Composition(message.into())
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ArtifactBundle {
    pub schema_version: u32,
    pub files: BTreeMap<String, String>,
}
pub fn entry_path(value: &str) -> Result<(), Error> {
    if value.is_empty()
        || value.len() > 256
        || value.contains(['\\', '\0'])
        || value
            .split('/')
            .any(|s| s.is_empty() || s == "." || s == "..")
        || Path::new(value)
            .components()
            .any(|c| !matches!(c, Component::Normal(_)))
    {
        return Err(composition(
            "artifact entry must be a bounded normalized relative path",
        ));
    }
    Ok(())
}
impl ArtifactBundle {
    pub fn validate(&self) -> Result<(), Error> {
        if self.schema_version != 1 || self.files.is_empty() || self.files.len() > 128 {
            return Err(composition("artifact requires version 1 and 1..=128 files"));
        }
        let mut size = 0usize;
        for (path, text) in &self.files {
            entry_path(path)?;
            size = size.saturating_add(text.len());
            if text.len() > 1024 * 1024 || size > 2 * 1024 * 1024 {
                return Err(composition(
                    "artifact exceeds 1 MiB/file or 2 MiB total source",
                ));
            }
            if self
                .files
                .keys()
                .any(|other| other.starts_with(&format!("{path}/")))
            {
                return Err(composition("artifact file conflicts with a directory"));
            }
        }
        if serde_json::to_vec(self).map_or(true, |bytes| bytes.len() > 4 * 1024 * 1024) {
            return Err(composition("encoded artifact exceeds 4 MiB"));
        }
        Ok(())
    }
    pub fn digest(&self) -> Result<String, Error> {
        self.validate()?;
        content_digest(self)
    }
    pub fn bytes(&self) -> usize {
        self.files.values().map(String::len).sum()
    }
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Config {
    bundle: ArtifactBundle,
}
pub struct ArtifactFactory;
impl ModuleFactory for ArtifactFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "resource.artifact".into(),
            revision: "source-package-v1".into(),
            kind: ModuleKind::Resource,
            config_schema: json!({"type":"object","required":["bundle"],"additionalProperties":false,"properties":{"bundle":{"type":"object","required":["schema_version","files"],"additionalProperties":false,"properties":{"schema_version":{"const":1},"files":{"type":"object","minProperties":1,"maxProperties":128,"additionalProperties":{"type":"string","maxLength":1048576}}}}}}),
            input_schema: None,
            output_schema: None,
            required_capabilities: Default::default(),
            dependencies: Default::default(),
        }
    }
    fn build(
        &self,
        value: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        let config: Config =
            serde_json::from_value(value.clone()).map_err(|e| composition(e.to_string()))?;
        let digest = config.bundle.digest()?;
        Ok(ModuleInstance::Resource(Arc::new(ResourceHandle::new(
            format!("artifact-v1:{digest}"),
            Arc::new(config.bundle),
        )?)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn packages_are_canonical_closed_and_bounded() {
        let a: ArtifactBundle = serde_json::from_value(
            json!({"schema_version":1,"files":{"b.py":"pass","a.py":"print(1)"}}),
        )
        .unwrap();
        let b: ArtifactBundle = serde_json::from_value(
            json!({"files":{"a.py":"print(1)","b.py":"pass"},"schema_version":1}),
        )
        .unwrap();
        assert_eq!(a.digest().unwrap(), b.digest().unwrap());
        for path in [
            "/root.py",
            "../escape",
            "a/../escape",
            "a//b",
            "a/./b",
            "a\\b",
            "",
        ] {
            assert!(
                ArtifactBundle {
                    schema_version: 1,
                    files: [(path.into(), "x".into())].into()
                }
                .validate()
                .is_err(),
                "{path}"
            );
        }
        assert!(
            ArtifactBundle {
                schema_version: 1,
                files: [("a".into(), "x".into()), ("a/b".into(), "x".into())].into()
            }
            .validate()
            .is_err()
        );
        assert!(
            ArtifactBundle {
                schema_version: 1,
                files: [("main".into(), "x".repeat(1024 * 1024 + 1))].into()
            }
            .validate()
            .is_err()
        );
        let ModuleInstance::Resource(handle) = ArtifactFactory
            .build(&json!({"bundle":a.clone()}), &Default::default())
            .unwrap()
        else {
            panic!("resource")
        };
        assert_eq!(
            handle.identity(),
            format!("artifact-v1:{}", a.digest().unwrap())
        );
        assert_eq!(
            handle.get::<ArtifactBundle>().unwrap().digest().unwrap(),
            a.digest().unwrap()
        );
        assert!(
            ArtifactFactory
                .build(&json!({"digest":a.digest().unwrap()}), &Default::default())
                .is_err()
        );
    }
}
