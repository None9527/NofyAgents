use crate::*;
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::{
    collections::{BTreeMap, BTreeSet},
    path::PathBuf,
};

fn object_schema() -> Value {
    json!({"type":"object"})
}
fn git_reference() -> String {
    "HEAD".into()
}
fn git_timeout() -> u64 {
    30_000
}

struct LocalSchemas;
impl jsonschema::Retrieve for LocalSchemas {
    fn retrieve(
        &self,
        _: &jsonschema::Uri<String>,
    ) -> std::result::Result<Value, Box<dyn std::error::Error + Send + Sync>> {
        Err("module parameter schemas cannot retrieve external documents".into())
    }
}
pub(crate) fn parameter_validator(schema: &Value) -> Result<jsonschema::Validator> {
    jsonschema::options()
        .with_retriever(LocalSchemas)
        .build(schema)
        .map_err(|_| {
            Error::new(
                "local_input",
                "invalid package parameter schema or unavailable external reference",
            )
        })
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum RepositoryOrigin {
    Managed,
    Directory {
        host_path: PathBuf,
    },
    Git {
        url: String,
        #[serde(default = "git_reference")]
        reference: String,
        #[serde(default)]
        subdirectory: String,
        #[serde(default = "git_timeout")]
        timeout_ms: u64,
    },
}
impl RepositoryOrigin {
    pub fn validate(&self) -> Result<()> {
        match self {
            Self::Managed => Ok(()),
            Self::Directory { host_path } if host_path.is_absolute() => Ok(()),
            Self::Directory { .. } => Err(Error::new("local_input", "host_path must be absolute")),
            Self::Git {
                url,
                reference,
                subdirectory,
                timeout_ms,
            } => {
                if url.is_empty()
                    || url.starts_with('-')
                    || url.chars().any(char::is_control)
                    || reference.is_empty()
                    || reference.starts_with('-')
                    || reference.chars().any(char::is_whitespace)
                    || !(1..=180_000).contains(timeout_ms)
                {
                    return Err(Error::new(
                        "local_input",
                        "invalid Git source, reference or timeout",
                    ));
                }
                if !subdirectory.is_empty() {
                    safe_path(subdirectory)?;
                }
                Ok(())
            }
        }
    }
}

/// A value that is not data but an expression, filled in when the package is
/// used: a parameter, a setting, an input port, a module reference, a
/// conditional list item. Every expression is an object with one `$` key.
pub fn is_expression(value: &Value) -> bool {
    value
        .as_object()
        .is_some_and(|fields| fields.len() == 1 && fields.keys().all(|key| key.starts_with('$')))
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PackageManifest {
    pub format: String,
    pub name: String,
    pub version: String,
    #[serde(default)]
    pub description: String,
    #[serde(default = "object_schema")]
    pub parameters_schema: Value,
    #[serde(default)]
    pub inputs: BTreeMap<String, String>,
    pub modules: Vec<Value>,
    pub exports: BTreeMap<String, String>,
}
impl PackageManifest {
    pub fn from_source(source: &Source) -> Result<Self> {
        source.validate()?;
        complete(source)?;
        let manifest: Self = serde_json::from_value(source.json(&source.declaration)?)?;
        manifest.validate()?;
        Ok(manifest)
    }
    /// The module definitions as written, each with its `$when` wrapper removed
    /// so the definition itself is what is returned. The position in the list is
    /// the position in `modules`.
    pub fn module_definitions(&self) -> impl Iterator<Item = &Value> {
        self.modules
            .iter()
            .map(|m| m.get("$when").and_then(|v| v.get("value")).unwrap_or(m))
    }
    pub fn factories(&self) -> Result<BTreeMap<String, String>> {
        self.modules
            .iter()
            .map(|m| {
                let m = m.get("$when").and_then(|v| v.get("value")).unwrap_or(m);
                let id = text(&m["reference"], "$module")?;
                Ok((id.to_owned(), text(m, "factory")?.to_owned()))
            })
            .collect()
    }
    fn validate(&self) -> Result<()> {
        if self.format != "nofy.module-package/v1" {
            return Err(Error::new(
                "local_input",
                "unsupported module package format",
            ));
        }
        safe_id(&self.name)?;
        safe_id(&self.version)?;
        if self.modules.is_empty() || self.exports.is_empty() {
            return Err(Error::new(
                "local_input",
                "module package requires modules and public exports",
            ));
        }
        parameter_validator(&self.parameters_schema)?;
        let mut names = BTreeSet::new();
        for m in &self.modules {
            let m = m.get("$when").and_then(|v| v.get("value")).unwrap_or(m);
            let id = text(&m["reference"], "$module")?;
            safe_id(id)?;
            if m["reference"].as_object().is_none_or(|v| v.len() != 1)
                || !names.insert(id.to_owned())
                || m.get("config").is_none()
            {
                return Err(Error::new(
                    "local_input",
                    "package module references must be unique source IDs",
                ));
            }
            text(m, "factory")?;
        }
        for (name, kind) in &self.inputs {
            safe_id(name)?;
            if kind.is_empty() {
                return Err(Error::new("local_input", "input port kind is required"));
            }
        }
        for (name, module) in &self.exports {
            safe_id(name)?;
            if !names.contains(module) {
                return Err(Error::new(
                    "local_input",
                    "package export does not name a module",
                ));
            }
        }
        fn refs(
            v: &Value,
            modules: &BTreeSet<String>,
            inputs: &BTreeMap<String, String>,
        ) -> Result<()> {
            if let Some(m) = v.as_object() {
                if m.len() == 1 {
                    if m.contains_key("$literal") {
                        return Ok(());
                    }
                    if let Some(id) = m.get("$module").and_then(Value::as_str)
                        && !modules.contains(id)
                    {
                        return Err(Error::new(
                            "local_input",
                            "package references an undefined internal module",
                        ));
                    }
                    if let Some(id) = m.get("$input").and_then(Value::as_str)
                        && !inputs.contains_key(id)
                    {
                        return Err(Error::new(
                            "local_input",
                            "package references an undeclared input port",
                        ));
                    }
                }
                for v in m.values() {
                    refs(v, modules, inputs)?;
                }
            } else if let Some(a) = v.as_array() {
                for v in a {
                    refs(v, modules, inputs)?;
                }
            }
            Ok(())
        }
        for m in &self.modules {
            refs(m, &names, &self.inputs)?;
        }
        Ok(())
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PackageView {
    #[serde(default)]
    pub yanked: bool,
    pub repository: String,
    pub name: String,
    pub version: String,
    pub digest: String,
    pub manifest: PackageManifest,
    pub source_revision: Option<String>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RepositoryView {
    pub repository: String,
    pub revision: String,
    pub origin: RepositoryOrigin,
    pub source_revision: Option<String>,
    pub package_count: usize,
}
