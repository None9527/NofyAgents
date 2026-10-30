use nofy_agent_runtime::Error;
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::collections::BTreeMap;

fn object_schema() -> Value {
    json!({"type":"object"})
}
fn any_schema() -> Value {
    json!({})
}
fn timeout() -> u64 {
    30_000
}
fn byte_limit() -> usize {
    1_048_576
}

/// Declaration for governance/audit. It does not authorize automatic replay;
/// external tool effects keep the runtime's uncertain-intent reconciliation.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EffectSemantics {
    #[default]
    Unknown,
    ReadOnly,
    Idempotent,
    NonIdempotent,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ToolContract {
    pub name: String,
    #[serde(default)]
    pub description: String,
    #[serde(default)]
    pub effect: EffectSemantics,
    #[serde(default = "object_schema")]
    pub input_schema: Value,
    #[serde(default = "any_schema")]
    pub output_schema: Value,
    #[serde(default)]
    pub output_pointer: Option<String>,
    #[serde(default = "timeout")]
    pub timeout_ms: u64,
    #[serde(default = "byte_limit")]
    pub max_input_bytes: usize,
    #[serde(default = "byte_limit")]
    pub max_output_bytes: usize,
}
impl ToolContract {
    pub fn validate(&self) -> Result<(), Error> {
        nofy_tool_protocol::ToolId::new(&self.name)
            .map_err(|e| crate::composition(e.to_string()))?;
        nofy_agent_runtime::settings::validate_json_schema(&self.input_schema)?;
        nofy_agent_runtime::settings::validate_json_schema(&self.output_schema)?;
        if !(1..=600_000).contains(&self.timeout_ms)
            || !(1..=16_777_216).contains(&self.max_input_bytes)
            || !(1..=16_777_216).contains(&self.max_output_bytes)
        {
            return Err(crate::composition(
                "tool timeout/byte limits are outside supported bounds",
            ));
        }
        if let Some(pointer) = &self.output_pointer {
            validate_pointer(pointer)?;
        }
        Ok(())
    }
}

/// Typed bindings do not interpolate code, shell arguments, URLs or headers.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum JsonBinding {
    Input {
        #[serde(default)]
        pointer: String,
    },
    Literal {
        value: Value,
    },
    Object {
        fields: BTreeMap<String, JsonBinding>,
    },
    Array {
        items: Vec<JsonBinding>,
    },
}
impl Default for JsonBinding {
    fn default() -> Self {
        Self::Input {
            pointer: String::new(),
        }
    }
}
impl JsonBinding {
    pub fn validate(&self) -> Result<(), Error> {
        self.validate_depth(0)
    }
    fn validate_depth(&self, depth: usize) -> Result<(), Error> {
        if depth > 64 {
            return Err(crate::composition("input mapping exceeds 64 levels"));
        }
        match self {
            Self::Input { pointer } => validate_pointer(pointer),
            Self::Literal { .. } => Ok(()),
            Self::Object { fields } => fields
                .values()
                .try_for_each(|v| v.validate_depth(depth + 1)),
            Self::Array { items } => items.iter().try_for_each(|v| v.validate_depth(depth + 1)),
        }
    }
    pub fn render(&self, input: &Value) -> Result<Value, nofy_tool_runtime::ToolError> {
        match self {
            Self::Input { pointer } => input
                .pointer(pointer)
                .cloned()
                .ok_or_else(|| crate::tool_error("input_mapping", "input pointer does not exist")),
            Self::Literal { value } => Ok(value.clone()),
            Self::Object { fields } => fields
                .iter()
                .map(|(k, v)| Ok((k.clone(), v.render(input)?)))
                .collect::<Result<serde_json::Map<_, _>, _>>()
                .map(Value::Object),
            Self::Array { items } => items
                .iter()
                .map(|v| v.render(input))
                .collect::<Result<Vec<_>, _>>()
                .map(Value::Array),
        }
    }
}
pub(crate) fn validate_pointer(pointer: &str) -> Result<(), Error> {
    if !pointer.is_empty() && !pointer.starts_with('/') {
        return Err(crate::composition(
            "JSON pointer must be empty or start with /",
        ));
    }
    let mut chars = pointer.chars();
    while let Some(c) = chars.next() {
        if c == '~' && !matches!(chars.next(), Some('0' | '1')) {
            return Err(crate::composition("invalid JSON pointer escape"));
        }
    }
    Ok(())
}

pub(crate) fn descriptor(
    factory: &str,
    revision: &str,
    schema: Value,
) -> nofy_agent_runtime::registry::ModuleDescriptor {
    nofy_agent_runtime::registry::ModuleDescriptor {
        factory: factory.into(),
        revision: revision.into(),
        kind: nofy_agent_runtime::registry::ModuleKind::ToolPack,
        config_schema: schema,
        input_schema: None,
        output_schema: None,
        required_capabilities: Default::default(),
        dependencies: Default::default(),
    }
}

pub(crate) fn contract_schema() -> Value {
    json!({"type":"object","additionalProperties":false,"required":["name"],"properties":{
        "name":{"type":"string","minLength":1},"description":{"type":"string"},"effect":{"enum":["unknown","read_only","idempotent","non_idempotent"]},
        "input_schema":{"type":["object","boolean"]},"output_schema":{"type":["object","boolean"]},
        "output_pointer":{"type":["string","null"]},"timeout_ms":{"type":"integer","minimum":1,"maximum":600000},
        "max_input_bytes":{"type":"integer","minimum":1,"maximum":16777216},"max_output_bytes":{"type":"integer","minimum":1,"maximum":16777216}
    }})
}

pub(crate) fn binding_schema() -> Value {
    json!({"oneOf":[
        {"type":"object","required":["kind"],"additionalProperties":false,"properties":{"kind":{"const":"input"},"pointer":{"type":"string"}}},
        {"type":"object","required":["kind","value"],"additionalProperties":false,"properties":{"kind":{"const":"literal"},"value":{}}},
        {"type":"object","required":["kind","fields"],"additionalProperties":false,"properties":{"kind":{"const":"object"},"fields":{"type":"object","additionalProperties":{"$ref":"#/$defs/binding"}}}},
        {"type":"object","required":["kind","items"],"additionalProperties":false,"properties":{"kind":{"const":"array"},"items":{"type":"array","items":{"$ref":"#/$defs/binding"}}}}
    ]})
}
