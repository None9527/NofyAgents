//! A package published to this kernel is checked against this kernel's factories
//! before it becomes an immutable version, so a mistake the author can fix is
//! reported while they can still fix it. Publishing is immutable: a package that
//! only fails when someone selects it can only be replaced by a new version.
use nofy_agent_project::repository::{PackageManifest, is_expression};
use nofy_agent_runtime::registry::{ModuleKind, ModuleRegistry};
use serde_json::{Value, json};
use std::collections::{BTreeMap, BTreeSet};

/// One problem, located by JSON Pointer into `module.json`.
pub(super) struct Issue {
    pub path: String,
    pub message: String,
}

fn kind_name(kind: ModuleKind) -> String {
    json!(kind).as_str().unwrap_or("unknown").to_owned()
}

pub(super) fn check_package(registry: &ModuleRegistry, manifest: &PackageManifest) -> Vec<Issue> {
    let definitions: Vec<&Value> = manifest.module_definitions().collect();
    // Kinds of the package's own modules, for checking what is wired to what.
    let mut kinds: BTreeMap<&str, ModuleKind> = BTreeMap::new();
    for module in &definitions {
        let descriptor = module["factory"]
            .as_str()
            .and_then(|factory| registry.descriptor(factory));
        if let (Some(id), Some(descriptor)) = (module["reference"]["$module"].as_str(), descriptor)
        {
            kinds.insert(id, descriptor.kind);
        }
    }
    let mut issues = Vec::new();
    for (index, module) in definitions.iter().enumerate() {
        let at = format!("/modules/{index}");
        let id = module["reference"]["$module"].as_str().unwrap_or("?");
        let Some(factory) = module["factory"].as_str() else {
            continue;
        };
        let check = match registry.check_module(factory, &module["config"], &is_expression) {
            Ok(check) => check,
            Err(_) => {
                issues.push(Issue {
                    path: format!("{at}/factory"),
                    message: format!(
                        "module `{id}`: factory `{factory}` is not installed on this kernel; `nofy describe` lists the installed factories"
                    ),
                });
                continue;
            }
        };
        for issue in check.issues {
            issues.push(Issue {
                path: format!("{at}/config{}", issue.path),
                message: format!("module `{id}`: {}", issue.message),
            });
        }
        let bound: BTreeMap<&str, &Value> = module["dependencies"]
            .as_object()
            .map(|fields| fields.iter().map(|(k, v)| (k.as_str(), v)).collect())
            .unwrap_or_default();
        let ports: BTreeSet<&str> = check.ports.keys().map(String::as_str).collect();
        for (port, kind) in &check.ports {
            if !bound.contains_key(port.as_str()) {
                issues.push(Issue {
                    path: format!("{at}/dependencies/{port}"),
                    message: format!(
                        "module `{id}`: dependency port `{port}` ({}) is not bound; give it an internal module or a package input",
                        kind_name(*kind)
                    ),
                });
            }
        }
        for (name, value) in &bound {
            let Some(expected) = check.ports.get(*name) else {
                // With placeholders the factory may derive ports not yet known.
                if check.ports_complete && !ports.contains(name) {
                    issues.push(Issue {
                        path: format!("{at}/dependencies/{name}"),
                        message: format!(
                            "module `{id}`: `{name}` is not a dependency port of factory `{factory}` (it has: {})",
                            ports.iter().copied().collect::<Vec<_>>().join(", ")
                        ),
                    });
                }
                continue;
            };
            let actual = match (value["$module"].as_str(), value["$input"].as_str()) {
                (Some(target), _) => kinds.get(target).map(|kind| kind_name(*kind)),
                (_, Some(input)) => manifest.inputs.get(input).cloned(),
                _ => None,
            };
            if let Some(actual) = actual.filter(|actual| *actual != kind_name(*expected)) {
                issues.push(Issue {
                    path: format!("{at}/dependencies/{name}"),
                    message: format!(
                        "module `{id}`: dependency `{name}` takes a {} but is wired to a {actual}",
                        kind_name(*expected)
                    ),
                });
            }
        }
    }
    issues
}
