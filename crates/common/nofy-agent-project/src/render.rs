use crate::*;
use serde_json::{Map, Value, json};
use std::collections::{BTreeMap, BTreeSet};

#[derive(Clone)]
enum Node {
    Data(Value),
    Ref(String),
    Array(Vec<Node>),
    Object(BTreeMap<String, Node>),
    Overlay(Box<Node>, BTreeMap<String, Value>),
}
struct Renderer<'a> {
    source: &'a Source,
    settings: Value,
    bindings: Map<String, Value>,
    ready: BTreeMap<String, Value>,
    active: BTreeSet<String>,
}
fn merge(a: &mut Value, b: Value) {
    match (a, b) {
        (Value::Object(a), Value::Object(b)) => {
            for (k, v) in b {
                merge(a.entry(k).or_insert(Value::Null), v)
            }
        }
        (a, b) => *a = b,
    }
}
fn defaults(schema: &Value) -> Value {
    if let Some(value) = schema.get("default") {
        return value.clone();
    }
    let mut out = Map::new();
    if let Some(props) = schema.get("properties").and_then(Value::as_object) {
        for (k, s) in props {
            let v = defaults(s);
            if !v.is_null() {
                out.insert(k.clone(), v);
            }
        }
    }
    if out.is_empty() {
        Value::Null
    } else {
        Value::Object(out)
    }
}
impl<'a> Renderer<'a> {
    fn new(source: &'a Source) -> Result<Self> {
        source.validate()?;
        let project = if source.files.contains_key("project.json") {
            source.json("project.json")?
        } else {
            json!({})
        };
        let settings = if let Some(text) = &source.settings_json {
            serde_json::from_str(text)?
        } else {
            let path = project
                .get("settings")
                .and_then(Value::as_str)
                .unwrap_or("settings.json");
            if source.files.contains_key(path) {
                source.json(path)?
            } else {
                json!({})
            }
        };
        if !settings.is_object() {
            return Err(Error::new("local_input", "settings must be an object"));
        }
        let schema = project
            .get("settings_schema")
            .and_then(Value::as_str)
            .unwrap_or("settings.schema.json");
        let mut values = if source.files.contains_key(schema) {
            defaults(&source.json(schema)?)
        } else {
            json!({})
        };
        if !values.is_object() {
            values = json!({});
        }
        merge(&mut values, settings);
        let bindings = if let Some(path) = project.get("prepare").and_then(Value::as_str) {
            source
                .json(path)?
                .get("parameters")
                .and_then(Value::as_object)
                .cloned()
                .ok_or_else(|| Error::new("local_input", "prepare requires a parameters object"))?
        } else {
            Map::new()
        };
        Ok(Self {
            source,
            settings: values,
            bindings,
            ready: Default::default(),
            active: Default::default(),
        })
    }
    fn parameter(&mut self, path: &str) -> Result<Value> {
        if path.is_empty() {
            return Ok(self.settings.clone());
        }
        if !path.starts_with('/') {
            return Err(Error::new(
                "local_input",
                "parameter must be a JSON Pointer",
            ));
        }
        let first = path[1..]
            .split('/')
            .next()
            .unwrap_or("")
            .replace("~1", "/")
            .replace("~0", "~");
        if self.bindings.contains_key(&first) {
            if !self.ready.contains_key(&first) {
                if !self.active.insert(first.clone()) {
                    return Err(Error::new("local_input", "cyclic parameter derivation"));
                }
                let expression = self.bindings[&first].clone();
                let node = self.expand(&expression, 0)?;
                let value = plain(node)?;
                self.active.remove(&first);
                self.ready.insert(first.clone(), value);
            }
            let suffix = &path[1..]
                .split_once('/')
                .map_or("".to_owned(), |(_, rest)| format!("/{rest}"));
            return self.ready[&first]
                .pointer(suffix)
                .cloned()
                .ok_or_else(|| Error::incomplete(format!("missing parameter {path}")));
        }
        self.settings
            .pointer(path)
            .cloned()
            .ok_or_else(|| Error::incomplete(format!("missing parameter {path}")))
    }
    fn data(&mut self, value: &Value, depth: usize) -> Result<Value> {
        plain(self.expand(value, depth + 1)?)
    }
    fn expand(&mut self, v: &Value, depth: usize) -> Result<Node> {
        if depth > 128 {
            return Err(Error::new(
                "local_input",
                "declaration expression nesting exceeded",
            ));
        }
        if let Some(items) = v.as_array() {
            let mut out = vec![];
            for item in items {
                if let Some(c) = item
                    .as_object()
                    .filter(|o| o.len() == 1)
                    .and_then(|o| o.get("$when"))
                {
                    let enabled = self
                        .parameter(text(c, "parameter")?)?
                        .as_bool()
                        .ok_or_else(|| {
                            Error::new("local_input", "when requires a boolean parameter")
                        })?;
                    if enabled {
                        out.push(
                            self.expand(
                                c.get("value").ok_or_else(|| {
                                    Error::new("local_input", "when value missing")
                                })?,
                                depth + 1,
                            )?,
                        );
                    }
                } else {
                    out.push(self.expand(item, depth + 1)?);
                }
            }
            return Ok(Node::Array(out));
        }
        let Some(object) = v.as_object() else {
            return Ok(Node::Data(v.clone()));
        };
        if object.len() == 1 {
            let (key, arg) = object
                .iter()
                .next()
                .ok_or_else(|| Error::new("local_input", "expression missing"))?;
            match key.as_str() {
                "$literal" => return Ok(Node::Data(arg.clone())),
                "$file" => {
                    return Ok(Node::Data(json!(self.source.raw(
                        arg.as_str().ok_or_else(|| Error::new(
                            "local_input",
                            "file path must be a string"
                        ))?
                    )?)));
                }
                "$json" => {
                    let value = self.source.json(text(arg, "path")?)?;
                    let p = arg.get("pointer").and_then(Value::as_str).unwrap_or("");
                    return Ok(Node::Data(value.pointer(p).cloned().ok_or_else(|| {
                        Error::incomplete(format!("missing JSON include pointer {p}"))
                    })?));
                }
                "$parameter" => {
                    return Ok(Node::Data(self.parameter(arg.as_str().ok_or_else(
                        || Error::new("local_input", "parameter pointer required"),
                    )?)?));
                }
                "$setting" => {
                    let p = arg
                        .as_str()
                        .ok_or_else(|| Error::new("local_input", "setting pointer required"))?;
                    return Ok(Node::Data(self.settings.pointer(p).cloned().ok_or_else(
                        || Error::incomplete(format!("missing setting {p}")),
                    )?));
                }
                "$module" => {
                    return Ok(Node::Ref(
                        arg.as_str()
                            .filter(|s| !s.is_empty())
                            .ok_or_else(|| Error::new("local_input", "module name required"))?
                            .into(),
                    ));
                }
                "$when" => {
                    return Err(Error::new(
                        "local_input",
                        "when is allowed only as a list item",
                    ));
                }
                "$lookup" => {
                    let value = self.data(
                        arg.get("value")
                            .ok_or_else(|| Error::new("local_input", "lookup value missing"))?,
                        depth,
                    )?;
                    let key = self.data(
                        arg.get("key")
                            .ok_or_else(|| Error::new("local_input", "lookup key missing"))?,
                        depth,
                    )?;
                    return Ok(Node::Data(
                        value
                            .get(key.as_str().ok_or_else(|| {
                                Error::new("local_input", "lookup key must be a string")
                            })?)
                            .cloned()
                            .ok_or_else(|| Error::incomplete("lookup entry missing"))?,
                    ));
                }
                "$merge" => {
                    let mut out = json!({});
                    for e in arg
                        .as_array()
                        .ok_or_else(|| Error::new("local_input", "merge requires an array"))?
                    {
                        let value = self.data(e, depth)?;
                        if !value.is_object() {
                            return Err(Error::new("local_input", "merge values must be objects"));
                        }
                        merge(&mut out, value);
                    }
                    return Ok(Node::Data(out));
                }
                "$values" => {
                    let value = self.data(arg, depth)?;
                    return Ok(Node::Data(json!(
                        value
                            .as_object()
                            .ok_or_else(|| Error::new("local_input", "values requires an object"))?
                            .values()
                            .cloned()
                            .collect::<Vec<_>>()
                    )));
                }
                "$concat" => {
                    let mut out = vec![];
                    for e in arg
                        .as_array()
                        .ok_or_else(|| Error::new("local_input", "concat requires an array"))?
                    {
                        let value = self.data(e, depth)?;
                        out.extend(
                            value
                                .as_array()
                                .ok_or_else(|| {
                                    Error::new("local_input", "concat items must be arrays")
                                })?
                                .iter()
                                .cloned(),
                        );
                    }
                    return Ok(Node::Data(json!(out)));
                }
                "$coalesce" => {
                    for e in arg
                        .as_array()
                        .ok_or_else(|| Error::new("local_input", "coalesce requires an array"))?
                    {
                        match self.data(e, depth) {
                            Ok(v) if !v.is_null() => return Ok(Node::Data(v)),
                            Ok(_) => {}
                            Err(e) if matches!(e.code.as_str(), "incomplete" | "not_found") => {}
                            Err(e) => return Err(e),
                        }
                    }
                    return Err(Error::incomplete("no coalesce value available"));
                }
                "$if" => {
                    let condition = self
                        .data(
                            arg.get("condition")
                                .ok_or_else(|| Error::new("local_input", "if condition missing"))?,
                            depth,
                        )?
                        .as_bool()
                        .ok_or_else(|| Error::new("local_input", "if requires a boolean"))?;
                    return self.expand(
                        arg.get(if condition { "then" } else { "else" })
                            .ok_or_else(|| Error::new("local_input", "if branch missing"))?,
                        depth + 1,
                    );
                }
                "$select" => {
                    let values = self.data(
                        arg.get("items")
                            .ok_or_else(|| Error::new("local_input", "select items missing"))?,
                        depth,
                    )?;
                    let mut out = vec![];
                    for item in values
                        .as_array()
                        .ok_or_else(|| Error::new("local_input", "select requires an array"))?
                    {
                        let accept = if let Some(field) = arg.get("field").and_then(Value::as_str) {
                            let value = item.pointer(field).ok_or_else(|| {
                                Error::incomplete(format!("select field missing: {field}"))
                            })?;
                            if let Some(test) = arg.get("equals") {
                                value == test
                            } else if let Some(test) = arg.get("not_equals") {
                                value != test
                            } else {
                                return Err(Error::new("local_input", "select comparison missing"));
                            }
                        } else {
                            true
                        };
                        if accept {
                            let pointer = arg.get("value").and_then(Value::as_str).unwrap_or("");
                            out.push(
                                item.pointer(pointer)
                                    .cloned()
                                    .ok_or_else(|| Error::incomplete("selected value missing"))?,
                            );
                        }
                    }
                    return Ok(Node::Data(json!(out)));
                }
                "$configure" => {
                    let sets = arg
                        .get("set")
                        .and_then(Value::as_object)
                        .cloned()
                        .unwrap_or_default();
                    let mut overrides: BTreeMap<String, Value> = sets.into_iter().collect();
                    if let Some(files) = arg.get("source_bindings").and_then(Value::as_object) {
                        for (pointer, path) in files {
                            overrides.insert(
                                pointer.clone(),
                                json!(self.source.raw(path.as_str().ok_or_else(|| {
                                    Error::new("local_input", "source binding path required")
                                })?)?),
                            );
                        }
                    }
                    if let Some(value) = overrides.remove("") {
                        let mut value = value;
                        for (p, v) in overrides {
                            pointer_set(&mut value, &p, v)?;
                        }
                        return Ok(Node::Data(value));
                    }
                    let base = self.expand(
                        arg.get("base").ok_or_else(|| {
                            Error::new("local_input", "configuration base missing")
                        })?,
                        depth + 1,
                    )?;
                    return Ok(Node::Overlay(Box::new(base), overrides));
                }
                _ => {}
            }
        }
        Ok(Node::Object(
            object
                .iter()
                .map(|(k, v)| Ok((k.clone(), self.expand(v, depth + 1)?)))
                .collect::<Result<_>>()?,
        ))
    }
}
fn plain(node: Node) -> Result<Value> {
    materialize(
        &node,
        &mut Versions {
            definitions: Default::default(),
            ready: Default::default(),
            active: Default::default(),
        },
    )
}
struct Versions {
    definitions: BTreeMap<String, Node>,
    ready: BTreeMap<String, Value>,
    active: BTreeSet<String>,
}
fn version(id: &str, state: &mut Versions) -> Result<Value> {
    if let Some(value) = state.ready.get(id) {
        return Ok(value.clone());
    }
    if !state.active.insert(id.into()) || state.active.len() > 128 {
        return Err(Error::new("local_input", "cyclic module dependency"));
    }
    let definition = state
        .definitions
        .get(id)
        .cloned()
        .ok_or_else(|| Error::incomplete(format!("module not defined: {id}")))?;
    let mut body = match definition {
        Node::Object(m) => m,
        _ => return Err(Error::new("local_input", "invalid module definition")),
    };
    body.remove("reference");
    let mut value = materialize(&Node::Object(body), state)?;
    value
        .as_object_mut()
        .ok_or_else(|| Error::new("local_input", "invalid module body"))?
        .insert("id".into(), json!(id));
    let r = json!({"id":id,"version":json_digest(&value)?});
    state.active.remove(id);
    state.ready.insert(id.into(), r.clone());
    Ok(r)
}
fn materialize(node: &Node, state: &mut Versions) -> Result<Value> {
    match node {
        Node::Data(v) => Ok(v.clone()),
        Node::Ref(id) => version(id, state),
        Node::Array(items) => Ok(Value::Array(
            items
                .iter()
                .map(|n| materialize(n, state))
                .collect::<Result<_>>()?,
        )),
        Node::Object(items) => Ok(Value::Object(
            items
                .iter()
                .map(|(k, n)| Ok((k.clone(), materialize(n, state)?)))
                .collect::<Result<_>>()?,
        )),
        Node::Overlay(base, sets) => {
            let mut value = materialize(base, state)?;
            for (p, v) in sets {
                pointer_set(&mut value, p, v.clone())?;
            }
            Ok(value)
        }
    }
}
fn render(source: &Source, kinds: &crate::FactoryKinds) -> Result<Value> {
    let mut r = Renderer::new(source)?;
    let document = source.json(&source.declaration)?;
    let template = if document.get("format").and_then(Value::as_str) == Some("nofy.preset/v1") {
        document
            .get("system")
            .ok_or_else(|| Error::new("local_input", "preset system missing"))?
    } else {
        &document
    };
    let tree = r.expand(template, 0)?;
    let mut versions = Versions {
        definitions: Default::default(),
        ready: Default::default(),
        active: Default::default(),
    };
    if let Node::Object(root) = &tree {
        if let Some(Node::Array(modules)) = root.get("modules") {
            for module in modules {
                let Node::Object(fields) = module else {
                    return Err(Error::new("local_input", "module must be an object"));
                };
                match fields.get("reference") {
                    Some(Node::Ref(id)) => {
                        if versions
                            .definitions
                            .insert(id.clone(), module.clone())
                            .is_some()
                        {
                            return Err(Error::new("local_input", "duplicate source module name"));
                        }
                    }
                    Some(reference) => {
                        let value = plain(reference.clone())?;
                        let id = text(&value, "id")?;
                        if versions.ready.contains_key(id) {
                            return Err(Error::new(
                                "local_input",
                                "ambiguous native module IDs; use explicit JSON references",
                            ));
                        }
                        versions.ready.insert(id.into(), value);
                    }
                    None => return Err(Error::new("local_input", "module reference missing")),
                }
            }
        }
    }
    let mut system = materialize(&tree, &mut versions)?;
    normalize_tools(&mut system, kinds)?;
    Ok(system)
}
fn normalize_tools(system: &mut Value, kinds: &crate::FactoryKinds) -> Result<()> {
    let factory_by_ref: BTreeMap<String, String> = system
        .get("modules")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
        .map(|m| Ok((json_digest(&m["reference"])?, text(m, "factory")?.into())))
        .collect::<Result<_>>()?;
    if let Some(programs) = system.get_mut("programs").and_then(Value::as_object_mut) {
        for p in programs.values_mut() {
            if p.get("kind").and_then(Value::as_str) != Some("agent") {
                continue;
            }
            let Some(d) = p.get_mut("definition").and_then(Value::as_object_mut) else {
                continue;
            };
            if let Some(tools) = d.remove("tools") {
                for r in tools
                    .as_array()
                    .ok_or_else(|| Error::new("local_input", "tools must be an array"))?
                {
                    let factory = factory_by_ref
                        .get(&json_digest(r)?)
                        .ok_or_else(|| Error::incomplete("tool module missing"))?;
                    let kind = kinds.get(factory).ok_or_else(|| {
                        Error::incomplete(format!(
                            "factory kind needed to resolve tools: {factory}"
                        ))
                    })?;
                    let slot = match kind.as_str() {
                        "tool_pack" => "tool_packs",
                        "tool_source" => "tool_sources",
                        _ => {
                            return Err(Error::new(
                                "local_input",
                                "tools accepts only tool packs or tool sources",
                            ));
                        }
                    };
                    let array = d
                        .entry(slot)
                        .or_insert_with(|| json!([]))
                        .as_array_mut()
                        .ok_or_else(|| Error::new("local_input", "tool slot must be an array"))?;
                    if !array.contains(r) {
                        array.push(r.clone());
                    }
                }
            }
        }
    }
    Ok(())
}
pub fn inspect(source: &Source, kinds: &crate::FactoryKinds) -> Result<Value> {
    source.validate()?;
    let doc = source.json(&source.declaration)?;
    let system = doc.get("system").unwrap_or(&doc);
    let mut missing = vec![];
    let mut agents = vec![];
    if let Some(programs) = system.get("programs").and_then(Value::as_object) {
        for (name, p) in programs {
            if p.get("kind").and_then(Value::as_str) == Some("agent") {
                agents.push(name.clone());
                for slot in ["model", "prompt"] {
                    if p.get("definition")
                        .and_then(|d| d.get(slot))
                        .is_none_or(Value::is_null)
                    {
                        missing.push(format!("{name}.{slot}"));
                    }
                }
            }
        }
    }
    let issue = render(source, kinds)
        .err()
        .map(|e| json!({"code":e.code,"message":e.message,"details":e.details}));
    Ok(
        json!({"source_digest":source.digest()?,"agents":agents,"missing_slots":missing,"status":if missing.is_empty()&&issue.is_none(){"complete"}else{"incomplete"},"issue":issue}),
    )
}
pub fn build(source: &Source, kinds: &crate::FactoryKinds) -> Result<Value> {
    let readiness = inspect(source, kinds)?;
    if !readiness["missing_slots"]
        .as_array()
        .is_some_and(Vec::is_empty)
    {
        let mut e = Error::incomplete("Agent model/prompt slots are missing");
        e.details = readiness;
        return Err(e);
    }
    let system = render(source, kinds)?;
    let value = json!({"format":"nofy.deployment/v2","system":system,"runtime_sources":[]});
    Ok(
        json!({"deployment_json":serde_json::to_string_pretty(&value)?,"source_digest":source.digest()?,"system":value["system"]["name"],"programs":value["system"]["programs"].as_object().map(|m|m.keys().cloned().collect::<Vec<_>>()).unwrap_or_default()}),
    )
}
pub(crate) fn module_dependencies(value: &Value) -> BTreeSet<String> {
    fn walk(v: &Value, out: &mut BTreeSet<String>) {
        if let Some(m) = v.as_object() {
            if m.len() == 1 && m.contains_key("$literal") {
                return;
            }
            if m.len() == 1 {
                if let Some(id) = m.get("$module").and_then(Value::as_str) {
                    out.insert(id.into());
                    return;
                }
            }
            for child in m.values() {
                walk(child, out)
            }
        } else if let Some(a) = v.as_array() {
            for child in a {
                walk(child, out)
            }
        }
    }
    let mut out = BTreeSet::new();
    walk(value, &mut out);
    out
}
