use crate::*;
use serde_json::{Map, Value, json};
use std::collections::BTreeMap;

pub type FactoryKinds = BTreeMap<String, String>;

fn body(v: &Value) -> &Value {
    v.get("$when").and_then(|v| v.get("value")).unwrap_or(v)
}
fn body_mut(v: &mut Value) -> &mut Value {
    if v.get("$when").is_some() {
        &mut v["$when"]["value"]
    } else {
        v
    }
}
fn root(doc: &Value) -> &Value {
    doc.get("system").unwrap_or(doc)
}
fn root_mut(doc: &mut Value) -> &mut Value {
    if doc.get("system").is_some() {
        &mut doc["system"]
    } else {
        doc
    }
}
fn name(module: &Value) -> Result<&str> {
    let r = &body(module)["reference"];
    r.get("$module")
        .or_else(|| r.get("id"))
        .and_then(Value::as_str)
        .ok_or_else(|| Error::new("local_input", "module reference requires an ID"))
}
fn index(system: &Value, requested: &str) -> Result<usize> {
    let modules = system["modules"]
        .as_array()
        .ok_or_else(|| Error::new("local_input", "modules must be an array"))?;
    let found: Vec<_> = modules
        .iter()
        .enumerate()
        .filter(|(_, m)| {
            name(m).is_ok_and(|n| n == requested)
                || body(m)["reference"].as_object().is_some_and(|r| {
                    r.get("id")
                        .and_then(Value::as_str)
                        .zip(r.get("version").and_then(Value::as_str))
                        .is_some_and(|(id, v)| format!("{id}@{v}") == requested)
                })
        })
        .map(|(i, _)| i)
        .collect();
    match found.as_slice() {
        [i] => Ok(*i),
        [] => Err(Error::new(
            "not_found",
            format!("module not found: {requested}"),
        )),
        _ => Err(Error::new(
            "conflict",
            "module name is ambiguous; specify id@version",
        )),
    }
}
fn agent<'a>(system: &'a Value, id: &str) -> Result<&'a Value> {
    let program = system["programs"]
        .get(id)
        .ok_or_else(|| Error::new("not_found", format!("Agent not found: {id}")))?;
    if program["kind"] != "agent" {
        return Err(Error::new("local_input", "program is not an Agent"));
    }
    program
        .get("definition")
        .ok_or_else(|| Error::new("local_input", "Agent definition missing"))
}
fn agent_mut<'a>(system: &'a mut Value, id: &str) -> Result<&'a mut Map<String, Value>> {
    agent(system, id)?;
    system["programs"][id]["definition"]
        .as_object_mut()
        .ok_or_else(|| Error::new("local_input", "Agent definition must be an object"))
}
fn reference(system: &Value, requested: &Value) -> Result<Value> {
    if requested.is_object()
        && requested.get("id").and_then(Value::as_str).is_some()
        && requested.get("version").and_then(Value::as_str).is_some()
    {
        return Ok(requested.clone());
    }
    let id = requested
        .as_str()
        .ok_or_else(|| Error::new("local_input", "dependency must be a source ID or ModuleRef"))?;
    let i = index(system, id)?;
    Ok(body(&system["modules"][i])["reference"].clone())
}
fn slot(slot: &str, kind: Option<&str>) -> Result<(&'static str, bool)> {
    let pair = match slot {
        "model" => ("model", false),
        "prompt" => ("prompt", false),
        "session" | "session_policy" => ("session_policy", false),
        "recipe" => ("recipe", false),
        "checkpointer" => ("checkpointer", false),
        "tools" => match kind {
            Some("tool_pack") => ("tool_packs", true),
            Some("tool_source") => ("tool_sources", true),
            None => ("tools", true),
            _ => {
                return Err(Error::new(
                    "local_input",
                    "tools accepts only tool_pack or tool_source",
                ));
            }
        },
        "tool_packs" => ("tool_packs", true),
        "tool_sources" => ("tool_sources", true),
        "context" | "context_sources" => ("context_sources", true),
        "context_policies" => ("context_policies", true),
        "policies" => ("policies", true),
        "governance" => ("governance", true),
        "middleware" => ("middleware", true),
        "bindings" => ("bindings", true),
        "hooks" => ("hooks", true),
        _ => {
            return Err(Error::new(
                "local_input",
                format!("unknown Agent slot: {slot}"),
            ));
        }
    };
    let expected = match pair.0 {
        "tool_packs" => "tool_pack",
        "tool_sources" => "tool_source",
        "context_sources" => "context_source",
        "context_policies" => "context_policy",
        "policies" => "policy",
        "bindings" => "binding",
        "hooks" => "hook",
        other => other,
    };
    if let Some(kind) = kind {
        if pair.0 != "tools" && kind != expected {
            return Err(Error::new(
                "local_input",
                format!("slot {slot} expects {expected}, received {kind}"),
            ));
        }
    }
    Ok(pair)
}
fn attach(
    system: &mut Value,
    agent_id: &str,
    slot_name: &str,
    r: Value,
    kind: Option<&str>,
    replace: bool,
) -> Result<()> {
    let (key, many) = slot(slot_name, kind)?;
    let d = agent_mut(system, agent_id)?;
    if many {
        let items = d
            .entry(key)
            .or_insert_with(|| json!([]))
            .as_array_mut()
            .ok_or_else(|| Error::new("local_input", "Agent list slot must be an array"))?;
        if !items.contains(&r) {
            items.push(r);
        }
    } else {
        if d.get(key).is_some_and(|old| old != &r && !old.is_null()) && !replace {
            return Err(Error::new(
                "conflict",
                "single Agent slot is occupied; use replace_slot to replace it",
            ));
        }
        d.insert(key.into(), r);
    }
    if key == "session_policy" {
        d.insert("schema_version".into(), json!(2));
    }
    Ok(())
}
fn dependencies(system: &Value, input: &Value) -> Result<Value> {
    let mut out = Map::new();
    if let Some(items) = input.get("dependencies") {
        for (key, value) in items
            .as_object()
            .ok_or_else(|| Error::new("local_input", "dependencies must be an object"))?
        {
            out.insert(key.clone(), reference(system, value)?);
        }
    }
    Ok(Value::Object(out))
}
fn source_files(source: &mut Source, input: &Value) -> Result<()> {
    if let Some(files) = input.get("sources") {
        let files: BTreeMap<String, File> = serde_json::from_value(files.clone())?;
        for (path, file) in files {
            safe_path(&path)?;
            file.decode()?;
            source.files.insert(path, file);
        }
    }
    Ok(())
}
fn configure(base: Value, sets: Value, bindings: Value, source: &Source) -> Result<Value> {
    let sets = sets
        .as_object()
        .ok_or_else(|| Error::new("local_input", "set must be an object of JSON Pointers"))?;
    let bindings = bindings
        .as_object()
        .ok_or_else(|| Error::new("local_input", "source_bindings must be an object"))?;
    let mut pointers: Vec<_> = sets.keys().chain(bindings.keys()).cloned().collect();
    pointers.sort();
    for p in &pointers {
        if !p.is_empty() && !p.starts_with('/') {
            return Err(Error::new(
                "local_input",
                "configuration requires JSON Pointers",
            ));
        }
        let bytes = p.as_bytes();
        for (i, b) in bytes.iter().enumerate() {
            if *b == b'~' && !matches!(bytes.get(i + 1), Some(b'0' | b'1')) {
                return Err(Error::new("local_input", "invalid JSON Pointer escape"));
            }
        }
    }
    for pair in pointers.windows(2) {
        if pair[0] == pair[1] || pair[0].is_empty() || pair[1].starts_with(&(pair[0].clone() + "/"))
        {
            return Err(Error::new("local_input", "configuration pointers overlap"));
        }
    }
    for path in bindings.values() {
        source.raw(
            path.as_str()
                .ok_or_else(|| Error::new("local_input", "source binding requires a path"))?,
        )?;
    }
    let (original, mut previous_sets, mut previous_bindings) =
        if let Some(old) = base.get("$configure") {
            (
                old.get("base").cloned().unwrap_or_else(|| json!({})),
                old["set"].as_object().cloned().unwrap_or_default(),
                old["source_bindings"]
                    .as_object()
                    .cloned()
                    .unwrap_or_default(),
            )
        } else {
            (base, Map::new(), Map::new())
        };
    for p in &pointers {
        let keep = |old: &String, _: &mut Value| {
            !(old == p || p.is_empty() || old.starts_with(&(p.clone() + "/")))
        };
        previous_sets.retain(keep);
        previous_bindings.retain(keep);
        // A new child override is applied after its older parent. Retaining the
        // parent is intentional; BTree ordering gives JSON Pointer parents first.
    }
    previous_sets.extend(sets.clone());
    previous_bindings.extend(bindings.clone());
    Ok(
        json!({"$configure":{"base":original,"set":previous_sets,"source_bindings":previous_bindings}}),
    )
}
fn change_refs(v: &mut Value, old: &Value, new: &Value) {
    if v == old {
        *v = new.clone();
        return;
    }
    if let Some(m) = v.as_object_mut() {
        if m.len() == 1 && m.contains_key("$literal") {
            return;
        }
        for child in m.values_mut() {
            change_refs(child, old, new);
        }
    } else if let Some(a) = v.as_array_mut() {
        for child in a {
            change_refs(child, old, new);
        }
    }
}
fn promote(system: &mut Value, i: usize) -> Result<()> {
    let old = body(&system["modules"][i])["reference"].clone();
    if old.get("$module").is_some() {
        return Ok(());
    }
    let id = text(&old, "id")?.to_owned();
    if system["modules"]
        .as_array()
        .into_iter()
        .flatten()
        .filter(|m| name(m).is_ok_and(|n| n == id))
        .count()
        != 1
    {
        return Err(Error::new(
            "conflict",
            "editing requires a unique source module ID",
        ));
    }
    let new = json!({"$module":id});
    // Rewrite structural references only. Literal module config is never scanned.
    for key in ["required_policies", "required_governance"] {
        if let Some(value) = system.get_mut(key) {
            change_refs(value, &old, &new);
        }
    }
    if let Some(programs) = system["programs"].as_object_mut() {
        for p in programs.values_mut() {
            if p["kind"] == "agent" {
                if let Some(d) = p["definition"].as_object_mut() {
                    for (key, value) in d {
                        if !matches!(key.as_str(), "settings" | "name" | "schema_version") {
                            change_refs(value, &old, &new);
                        }
                    }
                }
            }
        }
    }
    if let Some(modules) = system["modules"].as_array_mut() {
        for m in modules {
            if let Some(d) = body_mut(m).get_mut("dependencies") {
                change_refs(d, &old, &new);
            }
        }
    }
    body_mut(&mut system["modules"][i])["reference"] = new;
    let config = body_mut(&mut system["modules"][i])
        .get_mut("config")
        .ok_or_else(|| Error::new("local_input", "module config missing"))?;
    if config.get("$literal").is_none() {
        *config = json!({"$literal":config.clone()});
    }
    Ok(())
}
fn uses(system: &Value, target: &Value, except: usize) -> Vec<String> {
    fn has(v: &Value, r: &Value) -> bool {
        if v == r {
            return true;
        }
        if let Some(m) = v.as_object() {
            if m.len() == 1 && m.contains_key("$literal") {
                return false;
            }
            m.values().any(|c| has(c, r))
        } else {
            v.as_array().is_some_and(|a| a.iter().any(|c| has(c, r)))
        }
    }
    let mut found = vec![];
    for k in ["required_policies", "required_governance"] {
        if has(&system[k], target) {
            found.push(k.into());
        }
    }
    if let Some(p) = system["programs"].as_object() {
        for (id, v) in p {
            if v["kind"] == "agent" {
                if let Some(d) = v["definition"].as_object() {
                    for (slot, v) in d {
                        if slot != "settings" && has(v, target) {
                            found.push(format!("Agent {id}.{slot}"));
                        }
                    }
                }
            }
        }
    }
    if let Some(m) = system["modules"].as_array() {
        for (i, v) in m.iter().enumerate() {
            if i != except
                && (has(&body(v)["dependencies"], target)
                    || target
                        .get("$module")
                        .and_then(Value::as_str)
                        .is_some_and(|id| {
                            crate::render::module_dependencies(&body(v)["config"]).contains(id)
                        }))
            {
                found.push(format!("module {}", name(v).unwrap_or("?")));
            }
        }
    }
    found
}

/// Apply one source operation to a private copy. Callers publish the returned
/// copy with a local digest or managed-project revision compare-and-swap.
pub fn edit(
    source: &mut Source,
    operation: &str,
    input: &Value,
    kinds: &FactoryKinds,
) -> Result<Value> {
    let mut candidate = source.clone();
    source_files(&mut candidate, input)?;
    let mut doc = candidate.json(&candidate.declaration)?;
    let system = root_mut(&mut doc);
    let agent_id = text(input, "agent")?;
    if operation == "agent.create" {
        let programs = system["programs"]
            .as_object_mut()
            .ok_or_else(|| Error::new("local_input", "programs must be an object"))?;
        if programs.contains_key(agent_id) {
            return Err(Error::new("conflict", "Agent already exists"));
        }
        programs.insert(
            agent_id.into(),
            json!({"kind":"agent","definition":{"schema_version":1,"name":agent_id}}),
        );
    } else {
        agent(system, agent_id)?;
        match operation {
            "agent.inspect" | "agent.export" => {
                return Ok(
                    json!({"agent":agent_id,"definition_json":serde_json::to_string(agent(system,agent_id)?)?,"inspection":inspect(source,kinds)?}),
                );
            }
            "agent.module.list" => {
                return Ok(
                    json!({"agent":agent_id,"modules":system["modules"].as_array().into_iter().flatten().map(|m| json!({"id":name(m).unwrap_or("?"),"factory":body(m)["factory"],"reference":body(m)["reference"]})).collect::<Vec<_>>()}),
                );
            }
            "agent.module.inspect" => {
                let i = index(system, text(input, "module")?)?;
                return Ok(
                    json!({"agent":agent_id,"module_json":serde_json::to_string(body(&system["modules"][i]))?}),
                );
            }
            "agent.module.add" | "agent.tool.add" => {
                let r = if let Some(value) = input.get("module_ref") {
                    reference(system, value)?
                } else {
                    let module = if let Some(native) = input.get("native_module_json") {
                        let mut module: Value =
                            serde_json::from_str(native.as_str().ok_or_else(|| {
                                Error::new(
                                    "local_input",
                                    "native_module_json must be a JSON string",
                                )
                            })?)?;
                        for key in ["reference", "factory", "config"] {
                            if module.get(key).is_none() {
                                return Err(Error::new(
                                    "local_input",
                                    format!("native module {key} missing"),
                                ));
                            }
                        }
                        module["config"] = json!({"$literal":module["config"].clone()});
                        module
                    } else {
                        let id = text(input, "id")?;
                        if system["modules"]
                            .as_array()
                            .into_iter()
                            .flatten()
                            .any(|m| name(m).is_ok_and(|n| n == id))
                        {
                            return Err(Error::new("conflict", "source module ID already exists"));
                        }
                        let config = if let Some(raw) = input.get("config_json") {
                            serde_json::from_str(raw.as_str().ok_or_else(|| {
                                Error::new("local_input", "config_json must be a string")
                            })?)?
                        } else {
                            input.get("config").cloned().unwrap_or_else(|| json!({}))
                        };
                        json!({"reference":{"$module":id},"factory":text(input,"factory")?,"config":configure(json!({"$literal":config}),input.get("set").cloned().unwrap_or_else(||json!({})),input.get("source_bindings").cloned().unwrap_or_else(||json!({})),&candidate)?,"dependencies":dependencies(system,input)?})
                    };
                    let id = name(&module)?.to_owned();
                    if let Ok(i) = index(system, &id) {
                        if body(&system["modules"][i]) != &module {
                            return Err(Error::new(
                                "conflict",
                                "module ID already has a different definition",
                            ));
                        }
                    } else {
                        system["modules"]
                            .as_array_mut()
                            .ok_or_else(|| Error::new("local_input", "modules must be an array"))?
                            .push(module.clone());
                    }
                    module["reference"].clone()
                };
                let i = index(
                    system,
                    r.get("$module")
                        .or_else(|| r.get("id"))
                        .and_then(Value::as_str)
                        .ok_or_else(|| Error::new("local_input", "module reference missing"))?,
                )?;
                let factory = body(&system["modules"][i])["factory"]
                    .as_str()
                    .unwrap_or("");
                let kind = kinds.get(factory).map(String::as_str);
                let slot_name = input.get("slot").and_then(Value::as_str).or(
                    if operation == "agent.tool.add" {
                        Some("tools")
                    } else {
                        None
                    },
                );
                if let Some(slot_name) = slot_name {
                    attach(
                        system,
                        agent_id,
                        slot_name,
                        r,
                        kind,
                        input["replace_slot"] == true,
                    )?;
                }
            }
            "agent.module.set" => {
                let i = index(system, text(input, "module")?)?;
                promote(system, i)?;
                let m = body_mut(&mut system["modules"][i]);
                m["config"] = configure(
                    m["config"].clone(),
                    input.get("set").cloned().unwrap_or_else(|| json!({})),
                    input
                        .get("source_bindings")
                        .cloned()
                        .unwrap_or_else(|| json!({})),
                    &candidate,
                )?;
            }
            "agent.module.bind" => {
                let i = index(system, text(input, "module")?)?;
                promote(system, i)?;
                let deps = dependencies(system, input)?;
                let m = body_mut(&mut system["modules"][i]);
                if m.get("dependencies").is_none() {
                    m["dependencies"] = json!({});
                }
                m["dependencies"]
                    .as_object_mut()
                    .ok_or_else(|| Error::new("local_input", "dependencies must be an object"))?
                    .extend(deps.as_object().cloned().unwrap_or_default());
            }
            "agent.module.detach" => {
                let i = index(system, text(input, "module")?)?;
                let r = body(&system["modules"][i])["reference"].clone();
                let kind = body(&system["modules"][i])["factory"]
                    .as_str()
                    .and_then(|f| kinds.get(f))
                    .map(String::as_str);
                let (key, many) = slot(text(input, "slot")?, kind)?;
                let d = agent_mut(system, agent_id)?;
                if many {
                    if let Some(items) = d.get_mut(key).and_then(Value::as_array_mut) {
                        items.retain(|v| v != &r);
                    }
                } else if d.get(key) == Some(&r) {
                    d.remove(key);
                }
            }
            "agent.module.remove" => {
                let i = index(system, text(input, "module")?)?;
                let r = body(&system["modules"][i])["reference"].clone();
                let users = uses(system, &r, i);
                if !users.is_empty() {
                    let mut e = Error::new(
                        "conflict",
                        "detach module and rebind its users before removal",
                    );
                    e.details = json!({"users":users});
                    return Err(e);
                }
                system["modules"]
                    .as_array_mut()
                    .ok_or_else(|| Error::new("local_input", "modules must be an array"))?
                    .remove(i);
            }
            _ => {
                return Err(Error::new(
                    "local_input",
                    format!("unsupported source edit: {operation}"),
                ));
            }
        }
    }
    candidate.put_json(&candidate.declaration.clone(), &doc)?;
    candidate.refresh_manifest()?;
    let view = inspect(&candidate, kinds)?;
    *source = candidate;
    Ok(view)
}

/// Import an exact, already exported module closure. No arbitrary config JSON is
/// interpreted as a dependency and a conflicting definition is never replaced.
pub fn import_modules(source: &mut Source, modules: &[Value]) -> Result<()> {
    let mut doc = source.json(&source.declaration)?;
    let system = root_mut(&mut doc);
    let existing = system["modules"]
        .as_array_mut()
        .ok_or_else(|| Error::new("local_input", "modules must be an array"))?;
    for module in modules {
        let mut normalized = module.clone();
        normalized["config"] = json!({"$literal":module["config"].clone()});
        let module = &normalized;
        let id = name(module)?;
        if let Some(old) = existing.iter().find(|m| name(m).is_ok_and(|n| n == id)) {
            if body(old) != module {
                return Err(Error::new(
                    "conflict",
                    format!("import conflicts with module {id}"),
                ));
            }
        } else {
            existing.push(module.clone());
        }
    }
    source.put_json(&source.declaration.clone(), &doc)?;
    source.refresh_manifest()
}

pub fn agent_names(source: &Source) -> Result<Vec<String>> {
    let doc = source.json(&source.declaration)?;
    Ok(root(&doc)["programs"]
        .as_object()
        .into_iter()
        .flatten()
        .filter(|(_, p)| p["kind"] == "agent")
        .map(|(id, _)| id.clone())
        .collect())
}
