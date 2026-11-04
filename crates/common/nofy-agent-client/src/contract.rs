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
}
pub static OPERATIONS: LazyLock<Vec<Operation>> = LazyLock::new(|| {
    serde_json::from_value(CATALOG["operations"].clone()).expect("embedded catalog operations")
});
pub fn operation(name: &str) -> Result<&'static Operation> {
    OPERATIONS
        .iter()
        .find(|o| o.operation == name)
        .ok_or_else(|| {
            Error::new(
                "unsupported_operation",
                format!("unknown operation: {name}"),
            )
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
            {
                if names.insert(name.into()) {
                    collect(&SCHEMAS["$defs"][name], names);
                }
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
    Ok(
        json!({"$schema":"https://json-schema.org/draft/2020-12/schema","type":"object","allOf":[reference],"$defs":defs}),
    )
}
pub fn validate(operation_name: &str, input: &Value) -> Result<()> {
    let operation = operation(operation_name)?;
    let schema = schema(&operation.input_schema)?;
    let validator = jsonschema::validator_for(&schema)
        .map_err(|_| Error::new("local_input", "invalid embedded operation Schema"))?;
    if let Some(error) = validator.iter_errors(input).next() {
        return Err(Error {
            code: "local_input".into(),
            message: format!(
                "input does not match {} at {}",
                operation.operation, error.instance_path
            ),
            details: json!({"origin":"adapter","schema":operation.input_schema,"path":error.instance_path.to_string()}),
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
    fn from(_: serde_json::Error) -> Self {
        Self::new("local_input", "invalid JSON data")
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
