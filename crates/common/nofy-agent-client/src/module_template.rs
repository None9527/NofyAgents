//! A minimal, valid module package to start from.
//!
//! Writing the first package by hand means knowing every field of `module.json`
//! and keeping the file list in `source-files.json` right. This returns a source
//! set that already publishes, so the author starts from something that works and
//! changes it. It is pure data: the same answer for the command line and for MCP,
//! and nothing is read from or written to the kernel.
use crate::*;
use nofy_agent_project::{Source, repository::PackageManifest, safe_id};
use serde_json::{Value, json};
use std::collections::BTreeMap;

pub(crate) fn module_template(input: &Value) -> Result<Envelope> {
    let name = input
        .get("name")
        .and_then(Value::as_str)
        .unwrap_or("my-module");
    let version = input
        .get("version")
        .and_then(Value::as_str)
        .unwrap_or("0.1.0");
    let kind = input.get("kind").and_then(Value::as_str).unwrap_or("tool");
    safe_id(name)?;
    safe_id(version)?;
    let (module, description) = match kind {
        "tool" => (
            json!({
                "reference": {"$module": name},
                "factory": "tool.rhai",
                "config": {
                    "contract": {
                        "name": "example_tool",
                        "description": "Doubles an integer. Replace this with what your tool does.",
                        "effect": "read_only",
                        "input_schema": {
                            "type": "object",
                            "required": ["value"],
                            "properties": {"value": {"type": "integer"}}
                        }
                    },
                    "source": "#{result: args.value * 2}"
                }
            }),
            "A starting point: one Rhai tool.",
        ),
        "prompt" => (
            json!({
                "reference": {"$module": name},
                "factory": "prompt.static",
                "config": {"text": "You are a helpful assistant. Replace this with your prompt."}
            }),
            "A starting point: one static prompt.",
        ),
        other => {
            return Err(Error::new(
                "local_input",
                format!("kind `{other}` is not one of: tool, prompt"),
            ));
        }
    };
    let manifest = json!({
        "format": "nofy.module-package/v1",
        "name": name,
        "version": version,
        "description": description,
        "parameters_schema": {"type": "object"},
        "inputs": {},
        "modules": [module],
        "exports": {"main": name}
    });
    let mut source = Source {
        files: BTreeMap::new(),
        declaration: "module.json".into(),
        settings_json: None,
    };
    source.put_json("module.json", &manifest)?;
    // The file list is the allowlist of what gets published; this writes it from
    // the files the source actually holds, where the author can see and review it.
    source.refresh_manifest()?;
    // The template must itself be a package the kernel's structure rules accept.
    PackageManifest::from_source(&source)?;
    Ok(Envelope::ok(
        "module.template",
        json!({
            "source": source,
            "package": {"name": name, "version": version, "exports": {"main": name}},
            "next": [{
                "operation": "module.publish",
                "cli": "nofy module publish",
                "note": "Edit module.json as needed, then publish this source set to a repository (repository.add first if there is none). The kernel checks it against its factories before it becomes an immutable version."
            }]
        }),
    ))
}
