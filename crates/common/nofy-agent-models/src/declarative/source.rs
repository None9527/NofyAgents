use crate::{
    invalid,
    program::{Limits, Protocol},
};
use nofy_agent_runtime::{
    Error, ModelCapabilities,
    artifact::{ArtifactBundle, entry_path},
    registry::{ModuleInstance, ModuleKind},
};
use serde::Deserialize;
use std::collections::{BTreeMap, BTreeSet};

#[derive(Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
enum Source {
    Inline {
        text: String,
    },
    Artifact {
        entries: Vec<String>,
        #[serde(default)]
        settings_schema: Option<String>,
    },
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub(super) struct Declaration {
    source: Source,
    capabilities: ModelCapabilities,
    #[serde(default)]
    limits: Limits,
}
impl Declaration {
    pub fn dependencies(&self) -> BTreeMap<String, ModuleKind> {
        match self.source {
            Source::Inline { .. } => BTreeMap::new(),
            Source::Artifact { .. } => BTreeMap::from([("artifact".into(), ModuleKind::Resource)]),
        }
    }
    pub fn resolve(mut self, deps: &BTreeMap<String, ModuleInstance>) -> Result<Protocol, Error> {
        let source = match self.source {
            Source::Inline { text } => text,
            Source::Artifact {
                entries,
                settings_schema,
            } => {
                if entries.is_empty() || entries.len() > 16 {
                    return Err(invalid("protocol requires 1..=16 ordered artifact entries"));
                }
                let Some(ModuleInstance::Resource(resource)) = deps.get("artifact") else {
                    return Err(invalid("protocol requires its declared artifact resource"));
                };
                let bundle = resource
                    .get::<ArtifactBundle>()
                    .ok_or_else(|| invalid("protocol artifact has another resource type"))?;
                bundle.validate()?;
                if let Some(path) = settings_schema {
                    entry_path(&path)?;
                    if self.capabilities.settings_schema.is_some() {
                        return Err(invalid(
                            "model settings schema must have one declared source",
                        ));
                    }
                    let text = bundle.files.get(&path).ok_or_else(|| {
                        invalid("model settings schema is absent from its artifact")
                    })?;
                    if text.len() > 65536 {
                        return Err(invalid("model settings schema exceeds 65536 bytes"));
                    }
                    self.capabilities.settings_schema = Some(
                        serde_json::from_str(text)
                            .map_err(|_| invalid("invalid JSON model settings schema artifact"))?,
                    );
                }
                let mut source = String::new();
                let mut seen = BTreeSet::new();
                for path in entries {
                    entry_path(&path)?;
                    if !seen.insert(path.clone()) {
                        return Err(invalid("duplicate protocol source entry"));
                    }
                    let text = bundle.files.get(&path).ok_or_else(|| {
                        invalid("protocol source entry is absent from its artifact")
                    })?;
                    if text.len() + 1 > 65536usize.saturating_sub(source.len()) {
                        return Err(invalid("combined protocol source exceeds 65536 bytes"));
                    }
                    source.push_str(text);
                    source.push('\n');
                }
                source
            }
        };
        Ok(Protocol {
            source,
            capabilities: self.capabilities,
            limits: self.limits,
        })
    }
}
