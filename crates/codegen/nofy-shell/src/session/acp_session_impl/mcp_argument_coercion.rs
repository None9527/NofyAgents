//! Conservative MCP argument repair for unambiguous string/container shape mismatches.
//!
//! Repairs are atomic: a failed or over-budget walk leaves both the typed call
//! and its authored JSON unchanged.

use crate::session::mcp_servers::MCP_TOOL_NAME_DELIMITER;
use crate::session::tool_index::ToolMetadata;
use nofy_tools::registry::types::FinalizedToolset;
use nofy_tools::types::tool_io::ToolInput;
use serde::de::{DeserializeSeed, Deserializer, Error, MapAccess, SeqAccess, Visitor};
use serde_json::Value;
use std::collections::HashSet;
use std::fmt;

const MAX_DEPTH: usize = 32;
const MAX_NODES: usize = 10_000;

pub(super) fn input_schema_for<'a>(
    tools: &'a [ToolMetadata],
    qualified_name: &str,
) -> Option<&'a Value> {
    tools
        .iter()
        .find(|tool| tool.qualified_name == qualified_name)
        .map(|tool| &tool.input_schema)
}

pub(super) fn target_name(wire_name: &str, tool_input: &ToolInput) -> Option<String> {
    match tool_input {
        ToolInput::UseTool(input) => Some(input.tool_name.clone()),
        ToolInput::MCPTool(_) if wire_name.contains(MCP_TOOL_NAME_DELIMITER) => {
            Some(wire_name.to_owned())
        }
        _ => None,
    }
}

pub(super) struct CoercionRequest<'a> {
    pub schema: &'a Value,
    pub wire_name: &'a str,
    pub qualified_name: &'a str,
    pub tool_input: &'a mut ToolInput,
    pub raw_input: &'a mut Value,
    pub toolset: &'a FinalizedToolset,
    pub reminder_tag: &'a str,
}

pub(super) fn apply(mut request: CoercionRequest<'_>) -> Option<String> {
    let original = match request.tool_input {
        ToolInput::UseTool(input) => input.tool_input.clone(),
        ToolInput::MCPTool(input) => input.tool_input.clone(),
        _ => return None,
    };
    let mut state = WalkState::default();
    let repaired = match walk(request.schema, original, "", 0, true, &mut state) {
        Ok(value) => value,
        Err(()) => {
            return Some(wrap(
                format!(
                    "The system could not safely coerce the arguments for `{}`. Please provide the correct schema next call.",
                    escape(request.qualified_name, request.reminder_tag)
                ),
                request.reminder_tag,
            ));
        }
    };
    if state.notes.is_empty() {
        return None;
    }

    let wrote = match request.tool_input {
        ToolInput::UseTool(input) => {
            let mut projected = input.clone();
            projected.tool_input = repaired.clone();
            match request
                .toolset
                .model_mcp_arguments(request.wire_name, &projected)
            {
                Ok(raw) if raw.is_object() => {
                    input.tool_input = repaired;
                    *request.raw_input = raw;
                    true
                }
                _ => false,
            }
        }
        ToolInput::MCPTool(input) => {
            input.tool_input = repaired.clone();
            *request.raw_input = repaired;
            true
        }
        _ => false,
    };
    if !wrote {
        return Some(wrap(
            format!(
                "The system could not safely coerce the arguments for `{}`. Please provide the correct schema next call.",
                escape(request.qualified_name, request.reminder_tag)
            ),
            request.reminder_tag,
        ));
    }

    let lines = state
        .notes
        .iter()
        .map(|note| {
            let field = if note.path.is_empty() {
                "the arguments".to_owned()
            } else {
                format!("`{}`", escape(&note.path, request.reminder_tag))
            };
            format!(
                "The requested tool `{}` required {field} to be {}, yet {} was provided. The system coerced and sent the value as {}.",
                escape(request.qualified_name, request.reminder_tag),
                note.expected,
                note.actual,
                note.sent,
            )
        })
        .collect::<Vec<_>>()
        .join("\n");
    Some(wrap(
        format!("{lines} Please provide the correct schema next call."),
        request.reminder_tag,
    ))
}

pub(super) fn append(prompt: String, note: Option<&str>) -> String {
    match note {
        Some(note) if !prompt.is_empty() => format!("{prompt}\n\n{note}"),
        Some(note) => note.to_owned(),
        None => prompt,
    }
}

#[derive(Default)]
struct WalkState {
    nodes: usize,
    notes: Vec<Note>,
}

struct Note {
    path: String,
    expected: &'static str,
    actual: &'static str,
    sent: &'static str,
}

fn walk(
    schema: &Value,
    value: Value,
    path: &str,
    depth: usize,
    root: bool,
    state: &mut WalkState,
) -> Result<Value, ()> {
    state.nodes += 1;
    if depth >= MAX_DEPTH || state.nodes > MAX_NODES {
        return Err(());
    }
    let Some(kind) = eligible_type(schema) else {
        charge(&value, depth, state)?;
        return Ok(value);
    };
    match (kind, value) {
        ("string", Value::Object(_)) | ("string", Value::Array(_)) if root => Err(()),
        ("string", value @ Value::Object(_)) => {
            stringify(path, value, "a JSON object", depth, state)
        }
        ("string", value @ Value::Array(_)) => stringify(path, value, "a JSON array", depth, state),
        ("object", Value::String(text)) => {
            let Value::Object(map) = parse_container(&text)? else {
                return Err(());
            };
            state.notes.push(Note {
                path: path.to_owned(),
                expected: "an object",
                actual: "a JSON-encoded string",
                sent: "an object",
            });
            walk_object(schema, map, path, depth, state)
        }
        ("array", Value::String(text)) => {
            let Value::Array(items) = parse_container(&text)? else {
                return Err(());
            };
            state.notes.push(Note {
                path: path.to_owned(),
                expected: "an array",
                actual: "a JSON-encoded string",
                sent: "an array",
            });
            walk_array(schema, items, path, depth, state)
        }
        ("object", Value::Object(map)) => walk_object(schema, map, path, depth, state),
        ("array", Value::Array(items)) => walk_array(schema, items, path, depth, state),
        ("object", Value::Array(_)) | ("array", Value::Object(_)) => Err(()),
        (_, other) => {
            charge(&other, depth, state)?;
            Ok(other)
        }
    }
}

fn walk_object(
    schema: &Value,
    mut map: serde_json::Map<String, Value>,
    path: &str,
    depth: usize,
    state: &mut WalkState,
) -> Result<Value, ()> {
    let Some(properties) = schema.get("properties").and_then(Value::as_object) else {
        charge(&Value::Object(map.clone()), depth, state)?;
        return Ok(Value::Object(map));
    };
    for (key, child) in &map {
        if !properties.contains_key(key) {
            charge(child, depth + 1, state)?;
        }
    }
    for (key, child_schema) in properties {
        let Some(child) = map.get(key).cloned() else {
            continue;
        };
        let child_path = if path.is_empty() {
            key.clone()
        } else {
            format!("{path}.{key}")
        };
        map.insert(
            key.clone(),
            walk(child_schema, child, &child_path, depth + 1, false, state)?,
        );
    }
    Ok(Value::Object(map))
}

fn walk_array(
    schema: &Value,
    items: Vec<Value>,
    path: &str,
    depth: usize,
    state: &mut WalkState,
) -> Result<Value, ()> {
    let Some(item_schema) = schema.get("items").filter(|value| value.is_object()) else {
        charge(&Value::Array(items.clone()), depth, state)?;
        return Ok(Value::Array(items));
    };
    items
        .into_iter()
        .enumerate()
        .map(|(index, item)| {
            walk(
                item_schema,
                item,
                &format!("{path}[{index}]"),
                depth + 1,
                false,
                state,
            )
        })
        .collect::<Result<Vec<_>, _>>()
        .map(Value::Array)
}

fn stringify(
    path: &str,
    value: Value,
    actual: &'static str,
    depth: usize,
    state: &mut WalkState,
) -> Result<Value, ()> {
    let text = serde_json::to_string(&value).map_err(|_| ())?;
    charge(&value, depth, state)?;
    state.notes.push(Note {
        path: path.to_owned(),
        expected: "a string",
        actual,
        sent: "a JSON-encoded string",
    });
    Ok(Value::String(text))
}

fn charge(value: &Value, depth: usize, state: &mut WalkState) -> Result<(), ()> {
    if depth >= MAX_DEPTH {
        return Err(());
    }
    match value {
        Value::Array(items) => {
            for item in items {
                state.nodes += 1;
                if state.nodes > MAX_NODES {
                    return Err(());
                }
                charge(item, depth + 1, state)?;
            }
        }
        Value::Object(map) => {
            for item in map.values() {
                state.nodes += 1;
                if state.nodes > MAX_NODES {
                    return Err(());
                }
                charge(item, depth + 1, state)?;
            }
        }
        _ => {}
    }
    Ok(())
}

fn eligible_type(schema: &Value) -> Option<&str> {
    let object = schema.as_object()?;
    if ["anyOf", "oneOf", "allOf", "$ref", "enum", "const"]
        .iter()
        .any(|key| object.contains_key(*key))
    {
        return None;
    }
    object.get("type").and_then(Value::as_str)
}

fn parse_container(text: &str) -> Result<Value, ()> {
    let mut deserializer = serde_json::Deserializer::from_str(text.trim());
    UniqueKeys.deserialize(&mut deserializer).map_err(|_| ())?;
    deserializer.end().map_err(|_| ())?;
    serde_json::from_str(text.trim()).map_err(|_| ())
}

struct UniqueKeys;

impl<'de> DeserializeSeed<'de> for UniqueKeys {
    type Value = ();
    fn deserialize<D>(self, deserializer: D) -> Result<(), D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        deserializer.deserialize_any(self)
    }
}

impl<'de> Visitor<'de> for UniqueKeys {
    type Value = ();
    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        formatter.write_str("a JSON value")
    }
    fn visit_bool<E: Error>(self, _: bool) -> Result<(), E> {
        Ok(())
    }
    fn visit_i64<E: Error>(self, _: i64) -> Result<(), E> {
        Ok(())
    }
    fn visit_u64<E: Error>(self, _: u64) -> Result<(), E> {
        Ok(())
    }
    fn visit_f64<E: Error>(self, _: f64) -> Result<(), E> {
        Ok(())
    }
    fn visit_str<E: Error>(self, _: &str) -> Result<(), E> {
        Ok(())
    }
    fn visit_unit<E: Error>(self) -> Result<(), E> {
        Ok(())
    }
    fn visit_seq<A: SeqAccess<'de>>(self, mut seq: A) -> Result<(), A::Error> {
        while seq.next_element_seed(UniqueKeys)?.is_some() {}
        Ok(())
    }
    fn visit_map<A: MapAccess<'de>>(self, mut map: A) -> Result<(), A::Error> {
        let mut seen = HashSet::new();
        while let Some(key) = map.next_key::<String>()? {
            if !seen.insert(key) {
                return Err(Error::custom("duplicate key"));
            }
            map.next_value_seed(UniqueKeys)?;
        }
        Ok(())
    }
}

fn escape(text: &str, tag: &str) -> String {
    super::reminders::escape_reminder_tags(text, tag)
}

fn wrap(body: String, tag: &str) -> String {
    nofy_tools::reminders::wrap_reminder_with_tag(&body, tag)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn repairs_nested_string_container_shapes() {
        let schema = json!({"type":"object","properties":{
            "query":{"type":"string"},
            "filter":{"type":"object"},
            "labels":{"type":"array","items":{"type":"string"}}
        }});
        let value = json!({
            "query":{"repo":"nofy"},
            "filter":"{\"state\":\"open\"}",
            "labels":"[{\"name\":\"bug\"}]"
        });
        let mut state = WalkState::default();
        let repaired = walk(&schema, value, "", 0, true, &mut state).unwrap();
        assert_eq!(repaired["query"], r#"{"repo":"nofy"}"#);
        assert!(repaired["filter"].is_object());
        assert_eq!(repaired["labels"][0], r#"{"name":"bug"}"#);
        assert_eq!(state.notes.len(), 4);
    }

    #[test]
    fn unsafe_or_ambiguous_values_fail_atomically() {
        let schema = json!({"type":"object","properties":{
            "first":{"type":"string"},
            "later":{"type":"object"}
        }});
        let value = json!({"first":{"ok":true},"later":"not json"});
        let mut state = WalkState::default();
        assert!(walk(&schema, value, "", 0, true, &mut state).is_err());
        assert!(parse_container(r#"{"a":1,"a":2}"#).is_err());
    }

    #[test]
    fn root_object_is_never_stringified() {
        let mut state = WalkState::default();
        assert!(
            walk(
                &json!({"type":"string"}),
                json!({"a":1}),
                "",
                0,
                true,
                &mut state
            )
            .is_err()
        );
    }

    #[test]
    fn append_note_preserves_existing_output() {
        assert_eq!(append("result".into(), Some("note")), "result\n\nnote");
        assert_eq!(append(String::new(), Some("note")), "note");
    }
}
