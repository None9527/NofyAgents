use crate::command::properties;
use crate::positional;
use clap::ArgMatches;
use nofy_agent_client::{Engine, Error, Result, SCHEMAS, operation};
use nofy_agent_project::File;
use serde_json::{Value, json};
use std::{io::Read, path::PathBuf};

pub struct Local {
    pub path: PathBuf,
    pub expected_digest: Option<String>,
}
pub struct Input {
    pub value: Value,
    pub local: Option<Local>,
    pub local_create: bool,
    pub stdin: bool,
}
fn option(m: &ArgMatches, key: &str) -> Option<String> {
    m.try_get_one::<String>(key).ok().flatten().cloned()
}
fn assign(value: &mut Value, key: &str, new: Value) -> Result<()> {
    let map = value
        .as_object_mut()
        .ok_or_else(|| Error::new("local_input", "operation input must be an object"))?;
    if map.insert(key.into(), new).is_some() {
        return Err(Error::new(
            "local_input",
            format!("{key} was provided more than once"),
        ));
    }
    Ok(())
}
fn read(path: &str) -> Result<String> {
    if path == "-" {
        let mut text = String::new();
        std::io::stdin().read_to_string(&mut text)?;
        Ok(text)
    } else {
        std::fs::read_to_string(path).map_err(|e| {
            let mut error = Error::new("local_io", format!("cannot read `{path}`: {e}"));
            error.details = json!({"origin": "adapter", "path": path});
            error
        })
    }
}
fn json_text(text: &str) -> Result<String> {
    let text = if let Some(path) = text.strip_prefix('@') {
        read(path)?
    } else {
        text.into()
    };
    let _: Box<serde_json::value::RawValue> = serde_json::from_str(&text)?;
    Ok(text)
}
fn primary(op: &str) -> Option<&'static str> {
    match op {
        "system.validate" | "system.publish" => Some("document_json"),
        "run.start" => Some("request_json"),
        "run.control" => Some("action_json"),
        "run.decide" => Some("decision_json"),
        "run.input" => Some("envelope_json"),
        "session.start" | "session.turn" => Some("request_json"),
        "draft.put" => Some("document_json"),
        "resource.apply" | "resource.inspect" => Some("request_json"),
        _ => None,
    }
}
fn native_input(op: &str, value: &Value) -> bool {
    match op {
        "system.validate" | "system.publish" => {
            value.get("modules").is_some()
                || value.get("system").is_some()
                || value.get("format").is_some()
        }
        "run.start" => value.get("thread_id").is_some(),
        "run.control" => value.get("command").is_some(),
        "run.decide" => value.get("request").is_some() && value.get("allow").is_some(),
        "run.input" => value.get("address").is_some() && value.get("input").is_some(),
        _ => false,
    }
}
/// A flag whose value is one of several tagged shapes (`{"kind": ...}`) may be
/// given as the bare name of a shape that takes nothing else: `--origin managed`.
/// A name that needs more says what, rather than failing as bad JSON.
fn bare_variant(key: &str, variants: &[Value], text: &str) -> Option<Result<Value>> {
    let name = text.trim();
    if name.is_empty() || name.starts_with(['{', '[', '"']) {
        return None;
    }
    let variant = variants
        .iter()
        .find(|v| v.pointer("/properties/kind/const").and_then(Value::as_str) == Some(name))?;
    let needs: Vec<&str> = variant["required"]
        .as_array()
        .into_iter()
        .flatten()
        .filter_map(Value::as_str)
        .filter(|field| *field != "kind")
        .collect();
    if needs.is_empty() {
        return Some(Ok(json!({"kind": name})));
    }
    let flag = format!("--{}", key.replace('_', "-"));
    let mut error = Error::new(
        "local_input",
        format!(
            "{flag}: `{name}` also needs {}; give JSON such as {{\"kind\":\"{name}\",...}}, or its own flags",
            needs.join(", ")
        ),
    );
    error.details = json!({"origin": "adapter", "flag": flag, "needs": needs});
    Some(Err(error))
}
fn parse_property(key: &str, schema: &Value, s: &str) -> Result<Value> {
    if key.ends_with("_json") {
        return Ok(json!(json_text(s)?));
    }
    let reference = schema
        .get("$ref")
        .and_then(Value::as_str)
        .and_then(|s| s.strip_prefix("#/$defs/"));
    if let Some(name) = reference
        && !matches!(name, "Decimal" | "MaybeDecimal" | "NativeJson")
    {
        return parse_property(key, &SCHEMAS["$defs"][name], s);
    }
    if (schema
        .get("$ref")
        .and_then(Value::as_str)
        .is_some_and(|s| s.ends_with("MaybeDecimal"))
        || schema.get("type") == Some(&json!("null"))
        || schema
            .get("anyOf")
            .and_then(Value::as_array)
            .is_some_and(|a| a.iter().any(|s| s["type"] == "null")))
        && matches!(s, "none" | "null")
    {
        return Ok(Value::Null);
    }
    match schema.get("type").and_then(Value::as_str) {
        Some(kind @ ("object" | "array" | "integer" | "number" | "boolean")) => typed(key, kind, s),
        _ if schema.get("oneOf").is_some() || schema.get("allOf").is_some() => {
            if let Some(variants) = schema.get("oneOf").and_then(Value::as_array)
                && let Some(parsed) = bare_variant(key, variants, s)
            {
                return parsed;
            }
            typed(key, "value", s)
        }
        _ => Ok(json!(s)),
    }
}
/// Parse a flag whose value is not plain text, and say which flag and what it
/// expects when the text is not valid. The text itself is not echoed.
fn typed(key: &str, kind: &str, text: &str) -> Result<Value> {
    // Inline JSON, or `@FILE` for the same thing kept in a file, as the `*_json`
    // flags already take it.
    let file;
    let text = match text.strip_prefix('@') {
        Some(path) => {
            file = read(path)?;
            file.as_str()
        }
        None => text,
    };
    serde_json::from_str(text).map_err(|_| {
        let flag = format!("--{}", key.replace('_', "-"));
        let wanted = match kind {
            "integer" => "an integer".to_owned(),
            "number" => "a number".to_owned(),
            "boolean" => "true or false".to_owned(),
            "object" | "array" => format!("a JSON {kind}"),
            _ => "JSON".to_owned(),
        };
        let mut error = Error::new("local_input", format!("{flag}: expected {wanted}"));
        error.details = json!({"origin": "adapter", "flag": flag, "expected": kind});
        error
    })
}
pub async fn prepare(op: &str, m: &ArgMatches, engine: &Engine) -> Result<Input> {
    let descriptor = operation(op)?;
    let props =
        properties(&SCHEMAS["$defs"][descriptor.input_schema.rsplit('/').next().unwrap_or("")]);
    let input_path = option(m, "input");
    let mut stdin = input_path.as_deref() == Some("-");
    let mut value = if let Some(path) = &input_path {
        let text = read(path)?;
        let value: Value = serde_json::from_str(&text)?;
        if native_input(op, &value) {
            let key = primary(op)
                .ok_or_else(|| Error::new("local_input", "native JSON is not accepted here"))?;
            let mut wrapped = json!({});
            wrapped[key] = json!(text);
            wrapped
        } else {
            value
        }
    } else {
        json!({})
    };
    if !value.is_object() {
        return Err(Error::new(
            "local_input",
            "operation input must be an object",
        ));
    }
    for (key, schema) in &props {
        if matches!(
            key.as_str(),
            "target" | "source" | "sources" | "source_bindings" | "set" | "config" | "settings"
        ) {
            continue;
        }
        if key == "empty" {
            if m.try_get_one::<bool>(key).ok().flatten().copied() == Some(true) {
                assign(&mut value, key, json!(true))?;
            }
        } else if let Some(s) = option(m, key) {
            assign(&mut value, key, parse_property(key, schema, &s)?)?;
        }
    }
    if let Some(path) = option(m, "file") {
        let key = primary(op).ok_or_else(|| {
            Error::new(
                "local_input",
                "--file is available only for operations with a native JSON body",
            )
        })?;
        assign(&mut value, key, json!(read(&path)?))?;
        stdin |= path == "-";
    }
    let first = option(m, "arg1");
    let second = option(m, "arg2");
    let mut project = option(m, "project");
    match (first, positional::first(op)) {
        (None, _) => {}
        (Some(path), Some(positional::First::Project)) => {
            if project.replace(path).is_some() {
                return Err(Error::new(
                    "local_input",
                    "project path provided more than once",
                ));
            }
        }
        (Some(text), Some(positional::First::Field(key))) => {
            // The most common slip: a positional that meant something else. Say what
            // this command's positional is, not just that a field repeats.
            if value.get(key).is_some() {
                let flag = format!("--{}", key.replace('_', "-"));
                let mut error = Error::new(
                    "local_input",
                    format!(
                        "`{text}` was read as {key}, which {flag} already gave: the positional argument of `{}` is the {key}",
                        op.replace('.', " ")
                    ),
                );
                error.details = json!({"origin": "adapter", "positional": key, "flag": flag});
                return Err(error);
            }
            assign(&mut value, key, json!(text))?;
        }
        (Some(_), None) => {
            return Err(Error::new(
                "local_input",
                format!(
                    "{op} takes no positional argument; give its fields as --flags or with --input"
                ),
            ));
        }
    }
    if let Some(text) = second {
        let key = positional::second(op, props.contains_key("module")).ok_or_else(|| {
            Error::new(
                "local_input",
                format!("{op} takes at most one positional argument"),
            )
        })?;
        assign(&mut value, key, json!(text))?;
    }
    let module_edit =
        op.starts_with("agent.module.") || op == "agent.tool.add" || op == "agent.configure";
    if module_edit {
        if let Some(path) = option(m, "from") {
            assign(&mut value, "native_module_json", json!(read(&path)?))?;
            stdin |= path == "-";
        }
        let mut sets = serde_json::Map::new();
        for (key, as_json) in [("set", false), ("set-json", true)] {
            if let Some(items) = m.try_get_many::<String>(key).ok().flatten() {
                for item in items {
                    let (p, v) = item.split_once('=').ok_or_else(|| {
                        Error::new("local_input", "--set/--set-json requires /pointer=value")
                    })?;
                    if sets
                        .insert(
                            p.into(),
                            if as_json {
                                serde_json::from_str(v)?
                            } else {
                                json!(v)
                            },
                        )
                        .is_some()
                    {
                        return Err(Error::new(
                            "local_input",
                            "configuration pointer provided twice",
                        ));
                    }
                }
            }
        }
        if !sets.is_empty() {
            if op == "agent.module.use" {
                let mut parameters = value
                    .get("parameters")
                    .cloned()
                    .unwrap_or_else(|| json!({}));
                for (pointer, entry) in sets {
                    nofy_agent_project::pointer_set(&mut parameters, &pointer, entry)?;
                }
                value["parameters"] = parameters;
            } else {
                assign(&mut value, "set", Value::Object(sets))?;
            }
        }
        let mut deps = serde_json::Map::new();
        if let Some(items) = m.try_get_many::<String>("bind").ok().flatten() {
            for item in items {
                let (k, v) = item
                    .split_once('=')
                    .ok_or_else(|| Error::new("local_input", "--bind requires slot=module"))?;
                if deps.insert(k.into(), json!(v)).is_some() {
                    return Err(Error::new("local_input", "dependency slot provided twice"));
                }
            }
        }
        if !deps.is_empty() {
            assign(
                &mut value,
                if op == "agent.module.use" {
                    "bindings"
                } else {
                    "dependencies"
                },
                Value::Object(deps),
            )?;
        }
        let mut sources = serde_json::Map::new();
        let mut bindings = serde_json::Map::new();
        if let Some(items) = m.try_get_many::<String>("source").ok().flatten() {
            for item in items {
                let (pointer, path) = item
                    .split_once('=')
                    .ok_or_else(|| Error::new("local_input", "--source requires /pointer=@path"))?;
                let path = path
                    .strip_prefix('@')
                    .ok_or_else(|| Error::new("local_input", "source path must start with @"))?;
                let bytes = std::fs::read(path)?;
                let basename = std::path::Path::new(path)
                    .file_name()
                    .and_then(|s| s.to_str())
                    .ok_or_else(|| Error::new("local_input", "invalid source file name"))?;
                let module = value
                    .get("id")
                    .or_else(|| value.get("module"))
                    .and_then(Value::as_str)
                    .unwrap_or("source");
                let package_path = format!(
                    "modules/{}/{}/{}",
                    safe_component(module),
                    &nofy_agent_project::digest(pointer.as_bytes())[..12],
                    basename
                );
                nofy_agent_project::safe_path(&package_path)?;
                if bindings
                    .insert(pointer.into(), json!(package_path))
                    .is_some()
                {
                    return Err(Error::new("local_input", "source pointer provided twice"));
                }
                #[cfg(unix)]
                let executable = {
                    use std::os::unix::fs::PermissionsExt;
                    std::fs::metadata(path)?.permissions().mode() & 0o111 != 0
                };
                #[cfg(not(unix))]
                let executable = false;
                sources.insert(
                    package_path,
                    serde_json::to_value(File::bytes(&bytes, executable))?,
                );
            }
        }
        if !sources.is_empty() {
            assign(&mut value, "sources", Value::Object(sources))?;
            assign(&mut value, "source_bindings", Value::Object(bindings))?;
        }
        if op == "agent.module.set" && !value.as_object().is_some_and(|v| v.contains_key("set")) {
            value["set"] = json!({});
        }
    }
    if op == "agent.tool.add" && value.get("slot").is_none() {
        value["slot"] = json!("tools");
    }
    if op == "agent.configure"
        && let Some(path) = option(m, "settings")
    {
        let text = match path.strip_prefix('@') {
            Some(file) => read(file)?,
            None if path.trim_start().starts_with('{') => path.clone(),
            None => read(&path)?,
        };
        assign(&mut value, "settings", serde_json::from_str(&text)?)?;
        stdin |= path == "-";
    }
    if op == "repository.add" {
        let directory = option(m, "host-directory");
        let git = option(m, "git-url");
        if directory.is_some() && git.is_some() {
            return Err(Error::new("local_input", "choose one repository origin"));
        }
        if let Some(host_path) = directory {
            assign(
                &mut value,
                "origin",
                json!({"kind":"directory","host_path":host_path}),
            )?;
        } else if let Some(url) = git {
            assign(
                &mut value,
                "origin",
                json!({"kind":"git","url":url,"reference":option(m,"git-ref").unwrap_or_else(||"HEAD".into()),"subdirectory":option(m,"subdirectory").unwrap_or_default()}),
            )?;
        } else if option(m, "git-ref").is_some() || option(m, "subdirectory").is_some() {
            return Err(Error::new("local_input", "Git flags require --git-url"));
        }
    }
    if op == "module.publish"
        && let Some(path) = option(m, "directory")
    {
        let source = nofy_agent_project::repository::load_package_directory(&absolute(
            PathBuf::from(path),
        )?)?;
        assign(&mut value, "source", serde_json::to_value(source)?)?;
    }
    let mut local = None;
    let local_create = project
        .as_ref()
        .is_some_and(|path| !std::path::Path::new(path).exists())
        && (op == "project.template" || op == "agent.create");
    if let Some(path) = project {
        let path = absolute(PathBuf::from(path))?;
        if local_create {
            if value.get("target").is_some() || value.get("source").is_some() {
                return Err(Error::new(
                    "local_input",
                    "new local project conflicts with an explicit source target",
                ));
            }
            local = Some(Local {
                path,
                expected_digest: None,
            });
        } else {
            let mut source = nofy_agent_project::load_directory(&path)?;
            let before = source.digest()?;
            if let Some(settings) = option(m, "settings").filter(|_| op != "agent.configure") {
                source.settings_json = Some(read(&settings)?);
                stdin |= settings == "-";
            }
            let digest = source.digest()?;
            let write = is_edit(op);
            let mut target = json!({"kind":"source","source":source});
            if write {
                target["expected_digest"] = json!(option(m, "expected_digest").unwrap_or(digest));
            }
            if op.starts_with("project.") {
                assign(&mut value, "source", target["source"].clone())?;
            } else {
                assign(&mut value, "target", target)?;
            }
            if write {
                local = Some(Local {
                    path,
                    expected_digest: Some(before),
                });
            }
        }
    } else if op.starts_with("agent.")
        && op != "agent.list"
        && op != "agent.create"
        && value.get("target").is_none()
    {
        let project_id = option(m, "project_id")
            .or_else(|| value["agent"].as_str().map(str::to_owned))
            .ok_or_else(|| Error::new("local_input", "Agent name or project ID required"))?;
        let mut target = json!({"kind":"project","project_id":project_id});
        if is_edit(op) {
            let revision = if let Some(revision) = option(m, "expected_revision") {
                if matches!(revision.as_str(), "none" | "null") {
                    Value::Null
                } else {
                    json!(revision)
                }
            } else {
                engine
                    .client
                    .get(&["api", "v1", "projects", &project_id])
                    .await?
                    .value()?["revision"]
                    .clone()
            };
            target["expected_revision"] = revision;
        }
        value["target"] = target;
    }
    if op == "agent.create"
        && !local_create
        && value.get("project_id").is_none()
        && value.get("target").is_none()
        && let Some(id) = option(m, "project_id")
    {
        value["project_id"] = json!(id);
    }
    if op == "session.start" && value.get("expected_session_revision").is_none() {
        value["expected_session_revision"] = Value::Null;
    }
    if props.contains_key("command_id") && value.get("command_id").is_none() {
        value["command_id"] = json!(uuid::Uuid::new_v4().to_string());
    }
    if op == "agent.apply" && value.get("system").is_none() {
        let built = engine
            .execute(
                "agent.build",
                json!({"agent":value["agent"],"target":value["target"]}),
            )
            .await;
        if built.is_error() {
            return Err(Error::new(
                "incomplete",
                "source must build before inferring its system name",
            ));
        }
        value["system"] = built.data["system"].clone();
    }
    if props.contains_key("expected_generation") && value.get("expected_generation").is_none() {
        let system = value["system"]
            .as_str()
            .ok_or_else(|| Error::new("local_input", "system is required"))?;
        value["expected_generation"] = match engine
            .client
            .get(&["api", "v1", "systems", system, "active"])
            .await
        {
            Ok(v) => nofy_agent_client::identity(&v.value()?["generation"])
                .map_or(Value::Null, |s| json!(s)),
            Err(e) if e.code == "not_found" => Value::Null,
            Err(e) => return Err(e),
        };
    }
    if op == "credential.put"
        && stdin
        && value.pointer("/value_from/kind").and_then(Value::as_str) == Some("stdin")
    {
        return Err(Error::new(
            "local_input",
            "operation JSON and credential value cannot both read stdin",
        ));
    }
    Ok(Input {
        value,
        local,
        local_create,
        stdin,
    })
}
fn absolute(path: PathBuf) -> Result<PathBuf> {
    Ok(if path.is_absolute() {
        path
    } else {
        std::env::current_dir()?.join(path)
    })
}
fn safe_component(s: &str) -> String {
    let readable: String = s
        .chars()
        .take(48)
        .map(|c| {
            if c.is_ascii_alphanumeric() || matches!(c, '.' | '_' | '-') {
                c
            } else {
                '_'
            }
        })
        .collect();
    format!("{readable}.{}", nofy_agent_project::digest(s.as_bytes()))
}
pub fn is_edit(op: &str) -> bool {
    matches!(
        op,
        "agent.create"
            | "agent.configure"
            | "agent.module.add"
            | "agent.tool.add"
            | "agent.module.set"
            | "agent.module.bind"
            | "agent.module.detach"
            | "agent.module.remove"
            | "agent.module.use"
            | "agent.module.unuse"
    )
}

#[cfg(test)]
mod flag_tests {
    use super::*;

    fn origin() -> Value {
        json!({"$ref": "#/$defs/RepositoryOrigin"})
    }

    #[test]
    fn a_shape_that_takes_nothing_else_is_given_by_its_bare_name() {
        assert_eq!(
            parse_property("origin", &origin(), "managed").unwrap(),
            json!({"kind": "managed"})
        );
    }

    #[test]
    fn json_still_works_and_a_shape_that_needs_more_says_what() {
        assert_eq!(
            parse_property("origin", &origin(), r#"{"kind":"managed"}"#).unwrap(),
            json!({"kind": "managed"})
        );
        let error = parse_property("origin", &origin(), "directory").unwrap_err();
        assert!(error.message.contains("host_path"), "{}", error.message);
        assert!(error.message.contains("--origin"), "{}", error.message);
    }

    #[test]
    fn an_unknown_name_is_still_a_json_error_naming_the_flag() {
        let error = parse_property("origin", &origin(), "bogus").unwrap_err();
        assert!(
            error.message.starts_with("--origin: expected"),
            "{}",
            error.message
        );
    }
}

#[cfg(test)]
mod json_flag_tests {
    use super::*;

    #[test]
    fn a_json_flag_takes_inline_json_or_a_file_with_at() {
        assert_eq!(
            typed("bindings", "object", r#"{"a":1}"#).unwrap(),
            json!({"a": 1})
        );
        let dir = tempfile::tempdir().unwrap();
        let file = dir.path().join("bindings.json");
        std::fs::write(&file, r#"{"b":2}"#).unwrap();
        let at = format!("@{}", file.display());
        assert_eq!(typed("bindings", "object", &at).unwrap(), json!({"b": 2}));
    }

    #[test]
    fn a_file_that_cannot_be_read_is_named_in_the_error() {
        let error = typed("bindings", "object", "@/no/such/dir/bindings.json").unwrap_err();
        assert_eq!(error.code, "local_io");
        assert!(
            error.message.contains("/no/such/dir/bindings.json"),
            "{}",
            error.message
        );
    }
}
