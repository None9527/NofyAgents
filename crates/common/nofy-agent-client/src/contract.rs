use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::{collections::BTreeMap, sync::LazyLock};

pub const PROTOCOL: &str = "nofy.kernel/v1";
pub const CATALOG_JSON: &str = include_str!("../contracts/operations.json");
pub const SCHEMA_JSON: &str = include_str!("../contracts/contracts.schema.json");
pub static SCHEMAS: LazyLock<Value> =
    LazyLock::new(|| serde_json::from_str(SCHEMA_JSON).expect("embedded contract JSON"));
pub static CATALOG: LazyLock<Value> =
    LazyLock::new(|| serde_json::from_str(CATALOG_JSON).expect("embedded operation catalog"));
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Operation {
    pub operation: String,
    pub cli: String,
    pub mcp_tool: Option<String>,
    pub input_schema: String,
    pub output_schema: String,
    pub scope_hint: Vec<String>,
    /// One-sentence description, shown in CLI help and MCP tool listings. Read
    /// only: serializing an `Operation` keeps its published shape.
    #[serde(default, skip_serializing)]
    pub summary: String,
}
pub static OPERATIONS: LazyLock<Vec<Operation>> = LazyLock::new(|| {
    serde_json::from_value(CATALOG["operations"].clone()).expect("embedded catalog operations")
});
/// The names closest to `name`, nearest first, at most three. A name is
/// suggested when it is a small edit away or one contains the other, so both a
/// typo (`run.inspekt`) and a fragment (`inspect`) lead somewhere.
pub fn nearest<'a>(name: &str, candidates: impl IntoIterator<Item = &'a str>) -> Vec<String> {
    fn distance(a: &str, b: &str) -> usize {
        let b: Vec<char> = b.chars().collect();
        let mut row: Vec<usize> = (0..=b.len()).collect();
        for (i, ca) in a.chars().enumerate() {
            let mut previous = row[0];
            row[0] = i + 1;
            for (j, cb) in b.iter().enumerate() {
                let current = row[j + 1];
                row[j + 1] = (previous + usize::from(ca != *cb))
                    .min(row[j] + 1)
                    .min(current + 1);
                previous = current;
            }
        }
        row[b.len()]
    }
    let wanted = name.trim().to_lowercase();
    if wanted.is_empty() {
        return Vec::new();
    }
    let limit = (wanted.chars().count() / 3).max(2);
    let mut scored: Vec<(usize, &str)> = candidates
        .into_iter()
        .filter_map(|candidate| {
            let lowered = candidate.to_lowercase();
            let score = distance(&wanted, &lowered);
            let related = lowered.contains(&wanted) || wanted.contains(&lowered);
            (score <= limit || related)
                .then_some((if related { score.min(limit) } else { score }, candidate))
        })
        .collect();
    scored.sort();
    scored
        .into_iter()
        .take(3)
        .map(|(_, c)| c.to_owned())
        .collect()
}
pub fn operation(name: &str) -> Result<&'static Operation> {
    OPERATIONS
        .iter()
        .find(|o| o.operation == name)
        .ok_or_else(|| {
            let suggestions = nearest(name, OPERATIONS.iter().map(|o| o.operation.as_str()));
            let mut error = Error::new(
                "unsupported_operation",
                if suggestions.is_empty() {
                    format!("unknown operation: {name}; `describe` lists the operations")
                } else {
                    format!(
                        "unknown operation: {name}; did you mean {}?",
                        suggestions.join(" or ")
                    )
                },
            );
            error.details = json!({"origin": "adapter", "suggestions": suggestions});
            error
        })
}
pub fn schema(name: &str) -> Result<Value> {
    let name = name.rsplit('/').next().unwrap_or(name);
    if SCHEMAS["$defs"].get(name).is_none() {
        return Err(Error::new("local_input", "unknown contract Schema"));
    }
    fn collect(value: &Value, names: &mut std::collections::BTreeSet<String>) {
        if let Some(m) = value.as_object() {
            if let Some(name) = m
                .get("$ref")
                .and_then(Value::as_str)
                .and_then(|s| s.strip_prefix("#/$defs/"))
                && names.insert(name.into())
            {
                collect(&SCHEMAS["$defs"][name], names);
            }
            for child in m.values() {
                collect(child, names);
            }
        } else if let Some(a) = value.as_array() {
            for child in a {
                collect(child, names);
            }
        }
    }
    let reference = json!({"$ref":format!("#/$defs/{name}")});
    let mut names = std::collections::BTreeSet::new();
    collect(&reference, &mut names);
    let defs: serde_json::Map<String, Value> = names
        .into_iter()
        .map(|name| {
            let value = SCHEMAS["$defs"][&name].clone();
            (name, value)
        })
        .collect();
    let mut result = SCHEMAS["$defs"][name].clone();
    let (properties, required) = exposed_fields(&result, &mut Default::default());
    if !properties.is_empty() {
        result["properties"] = Value::Object(properties);
    }
    if !required.is_empty() {
        result["required"] = json!(required);
    }
    if result.get("type").is_none() {
        result["type"] = json!("object");
    }
    result["$schema"] = json!("https://json-schema.org/draft/2020-12/schema");
    result["$defs"] = Value::Object(defs);
    Ok(result)
}
// Model gateways commonly read only top-level properties. Surface the union
// of admissible fields while keeping the original combinators authoritative.
fn exposed_fields(
    value: &Value,
    seen: &mut std::collections::BTreeSet<String>,
) -> (
    serde_json::Map<String, Value>,
    std::collections::BTreeSet<String>,
) {
    let mut fields = value
        .get("properties")
        .and_then(Value::as_object)
        .cloned()
        .unwrap_or_default();
    let mut required = value
        .get("required")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
        .filter_map(Value::as_str)
        .map(str::to_owned)
        .collect::<std::collections::BTreeSet<_>>();
    let mut merge = |more: serde_json::Map<String, Value>| {
        for (key, schema) in more {
            if let Some(previous) = fields.get(&key) {
                if previous != &schema {
                    fields.insert(key, json!({"anyOf":[previous,schema]}));
                }
            } else {
                fields.insert(key, schema);
            }
        }
    };
    if let Some(name) = value
        .get("$ref")
        .and_then(Value::as_str)
        .and_then(|r| r.strip_prefix("#/$defs/"))
        && seen.insert(name.into())
    {
        let (more, keys) = exposed_fields(&SCHEMAS["$defs"][name], seen);
        merge(more);
        required.extend(keys);
        seen.remove(name);
    }
    for mode in ["allOf", "oneOf", "anyOf"] {
        if let Some(branches) = value.get(mode).and_then(Value::as_array) {
            let mut common: Option<std::collections::BTreeSet<String>> = None;
            for branch in branches {
                let (more, keys) = exposed_fields(branch, seen);
                merge(more);
                if mode == "allOf" {
                    required.extend(keys);
                } else {
                    common = Some(match common {
                        None => keys,
                        Some(old) => old.intersection(&keys).cloned().collect(),
                    });
                }
            }
            if let Some(common) = common {
                required.extend(common);
            }
        }
    }
    (fields, required)
}
/// Say what the contract requires, from the schema keyword that failed. The
/// offending value is deliberately not echoed: an input can hold a secret and
/// the message is returned to logs as well as to the caller.
fn violation(error: &jsonschema::ValidationError<'_>) -> String {
    use jsonschema::error::{TypeKind, ValidationErrorKind as Kind};
    fn short(value: &Value) -> String {
        let text = value.to_string();
        if text.chars().count() > 160 {
            format!("{}…", text.chars().take(160).collect::<String>())
        } else {
            text
        }
    }
    match &error.kind {
        Kind::AdditionalProperties { unexpected } => {
            format!("unknown fields: {}", unexpected.join(", "))
        }
        Kind::Type { kind } => match kind {
            TypeKind::Single(only) => format!("expected {only}"),
            TypeKind::Multiple(set) => format!(
                "expected {}",
                set.iter().map(|t| t.to_string()).collect::<Vec<_>>().join(" or ")
            ),
        },
        Kind::Enum { options } => format!("must be one of {}", short(options)),
        Kind::Constant { expected_value } => format!("must equal {}", short(expected_value)),
        Kind::Minimum { limit } => format!("must be at least {limit}"),
        Kind::Maximum { limit } => format!("must be at most {limit}"),
        Kind::ExclusiveMinimum { limit } => format!("must be greater than {limit}"),
        Kind::ExclusiveMaximum { limit } => format!("must be less than {limit}"),
        Kind::MinLength { limit } => format!("must be at least {limit} characters"),
        Kind::MaxLength { limit } => format!("must be at most {limit} characters"),
        Kind::MinItems { limit } => format!("must have at least {limit} items"),
        Kind::MaxItems { limit } => format!("must have at most {limit} items"),
        Kind::MinProperties { limit } => format!("must have at least {limit} properties"),
        Kind::MaxProperties { limit } => format!("must have at most {limit} properties"),
        Kind::Pattern { pattern } => format!("must match the pattern {pattern}"),
        Kind::UniqueItems => "items must be unique".to_owned(),
        Kind::OneOfNotValid => {
            "matches none of the allowed shapes (oneOf); check the discriminating field, usually `kind`"
                .to_owned()
        }
        Kind::OneOfMultipleValid => "matches more than one allowed shape (oneOf)".to_owned(),
        Kind::AnyOf => "matches none of the allowed shapes (anyOf)".to_owned(),
        _ => format!(
            "value violates {}",
            error.schema_path.to_string().rsplit('/').next().unwrap_or("contract")
        ),
    }
}
pub fn validate(operation_name: &str, input: &Value) -> Result<()> {
    let operation = operation(operation_name)?;
    let schema = schema(&operation.input_schema)?;
    let validator = jsonschema::validator_for(&schema)
        .map_err(|_| Error::new("local_input", "invalid embedded operation Schema"))?;
    if validator.iter_errors(input).next().is_some() {
        fn issue(error: &jsonschema::ValidationError<'_>, prefix: &str) -> Value {
            let mut path = format!("{prefix}{}", error.instance_path);
            let message = if let jsonschema::error::ValidationErrorKind::Required { property } =
                &error.kind
            {
                if let Some(name) = property.as_str() {
                    path.push('/');
                    path.push_str(&name.replace('~', "~0").replace('/', "~1"));
                }
                "required field is missing".to_owned()
            } else {
                violation(error)
            };
            json!({"path":path,"schema_path":error.schema_path.to_string(),"message":message})
        }
        let mut issues = validator
            .iter_errors(input)
            .take(8)
            .map(|error| issue(&error, ""))
            .collect::<Vec<_>>();
        if issues.iter().any(|i| i["path"] == "/target")
            && let Some(target) = input.get("target")
        {
            let mode = target["kind"].as_str();
            let write = target.get("expected_revision").is_some()
                || target.get("expected_digest").is_some()
                || matches!(
                    operation_name,
                    "agent.configure"
                        | "agent.create"
                        | "agent.module.add"
                        | "agent.module.set"
                        | "agent.module.bind"
                        | "agent.module.detach"
                        | "agent.module.remove"
                        | "agent.module.use"
                        | "agent.module.unuse"
                        | "agent.tool.add"
                );
            let name = if write { "WriteTarget" } else { "ReadTarget" };
            if let Some(branch) = SCHEMAS["$defs"][name]["oneOf"]
                .as_array()
                .and_then(|branches| {
                    branches
                        .iter()
                        .find(|b| b["properties"]["kind"]["const"].as_str() == mode)
                })
            {
                let target_schema = json!({"allOf":[branch],"$defs":SCHEMAS["$defs"]});
                if let Ok(check) = jsonschema::validator_for(&target_schema) {
                    let exact = check
                        .iter_errors(target)
                        .take(8)
                        .map(|error| issue(&error, "/target"))
                        .collect::<Vec<_>>();
                    if !exact.is_empty() {
                        issues.retain(|i| i["path"] != "/target");
                        issues.extend(exact);
                    }
                }
            }
        }
        let path = issues
            .first()
            .and_then(|v| v["path"].as_str())
            .unwrap_or("");
        let first = issues
            .first()
            .and_then(|v| v["message"].as_str())
            .unwrap_or("invalid value");
        let at = if path.is_empty() {
            "the input root"
        } else {
            path
        };
        return Err(Error {
            code: "local_input".into(),
            message: format!(
                "input does not match {} at {at}: {first}",
                operation.operation
            ),
            details: json!({"origin":"adapter","schema":operation.input_schema,"path":path,"issues":issues}),
            unconfirmed: false,
            refs: Default::default(),
        });
    }
    Ok(())
}
#[derive(Debug, thiserror::Error)]
#[error("{message}")]
pub struct Error {
    pub code: String,
    pub message: String,
    pub details: Value,
    pub unconfirmed: bool,
    pub refs: BTreeMap<String, Option<String>>,
}
pub type Result<T> = std::result::Result<T, Error>;
impl Error {
    pub fn new(code: &str, message: impl Into<String>) -> Self {
        Self {
            code: code.into(),
            message: message.into(),
            details: json!({"origin":"adapter"}),
            unconfirmed: false,
            refs: Default::default(),
        }
    }
}
impl From<nofy_agent_project::Error> for Error {
    fn from(e: nofy_agent_project::Error) -> Self {
        Self {
            code: e.code,
            message: e.message,
            details: e.details,
            unconfirmed: false,
            refs: Default::default(),
        }
    }
}
impl From<serde_json::Error> for Error {
    /// Say where and what kind of JSON problem, never the offending text.
    fn from(e: serde_json::Error) -> Self {
        use serde_json::error::Category;
        let message = match e.classify() {
            Category::Syntax => format!(
                "invalid JSON syntax at line {} column {}",
                e.line(),
                e.column()
            ),
            Category::Data => format!(
                "JSON value has the wrong shape or type at line {} column {}",
                e.line(),
                e.column()
            ),
            Category::Eof => "JSON ended unexpectedly".to_owned(),
            Category::Io => "JSON could not be read".to_owned(),
        };
        Self::new("local_input", message)
    }
}
impl From<std::io::Error> for Error {
    fn from(e: std::io::Error) -> Self {
        Self::new("local_io", e.to_string())
    }
}
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Envelope {
    pub protocol: String,
    pub operation: String,
    pub status: String,
    pub data: Value,
    pub error: Option<Value>,
    pub refs: BTreeMap<String, Option<String>>,
    pub next_cursor: Option<String>,
}
impl Envelope {
    pub fn ok(operation: &str, data: Value) -> Self {
        Self {
            protocol: PROTOCOL.into(),
            operation: operation.into(),
            status: "ok".into(),
            data,
            error: None,
            refs: Default::default(),
            next_cursor: None,
        }
    }
    pub fn failed(operation: &str, e: Error) -> Self {
        Self {
            protocol: PROTOCOL.into(),
            operation: operation.into(),
            status: if e.unconfirmed {
                "unconfirmed"
            } else {
                "error"
            }
            .into(),
            data: Value::Null,
            error: Some(json!({"code":e.code,"message":e.message,"details":e.details})),
            refs: e.refs,
            next_cursor: None,
        }
    }
    pub fn is_error(&self) -> bool {
        self.error.is_some()
    }
}
pub fn text<'a>(v: &'a Value, k: &str) -> Result<&'a str> {
    v.get(k)
        .and_then(Value::as_str)
        .ok_or_else(|| Error::new("local_input", format!("{k} is required")))
}
pub fn exact(v: &Value) -> Result<Value> {
    if v.is_null() {
        return Ok(Value::Null);
    }
    let s = v
        .as_str()
        .ok_or_else(|| Error::new("local_input", "version must be a decimal string or null"))?;
    let n = s
        .parse::<u64>()
        .map_err(|_| Error::new("local_input", "version exceeds native u64 range"))?;
    if n.to_string() != s {
        return Err(Error::new("local_input", "noncanonical decimal string"));
    }
    Ok(json!(n))
}
pub fn exact_field(v: &mut Value, key: &str) -> Result<()> {
    if let Some(old) = v.get_mut(key) {
        *old = exact(old)?;
    }
    Ok(())
}
pub fn identity(v: &Value) -> Option<String> {
    match v {
        Value::String(s) => Some(s.clone()),
        Value::Number(n) => Some(n.to_string()),
        _ => None,
    }
}
