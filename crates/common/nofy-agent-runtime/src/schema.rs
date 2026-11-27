//! Local-only Schema compilation shared by declarations and value validation.
//! Only immutable validators are retained, never input values or decisions.
use crate::Error;
use serde_json::Value;
use std::{
    collections::VecDeque,
    io::Write,
    sync::{Arc, Mutex, OnceLock},
};

const MAX_KEY: usize = 8 * 1024;
const MAX_KEYS: usize = 128 * 1024;
const MAX_ENTRIES: usize = 32;
type Compiled = Result<Arc<jsonschema::Validator>, String>;
type Slot = Arc<OnceLock<Compiled>>;
struct Entry {
    key: Vec<u8>,
    slot: Slot,
}
#[derive(Default)]
struct Cache {
    entries: VecDeque<Entry>,
    bytes: usize,
}
impl Cache {
    fn slot(&mut self, key: Vec<u8>) -> Slot {
        if let Some(index) = self.entries.iter().position(|entry| entry.key == key) {
            let entry = self.entries.remove(index).expect("known cache entry");
            let slot = entry.slot.clone();
            self.entries.push_back(entry);
            return slot;
        }
        while self.entries.len() >= MAX_ENTRIES || self.bytes + key.len() > MAX_KEYS {
            let old = self.entries.pop_front().expect("nonempty bounded cache");
            self.bytes -= old.key.len();
        }
        self.bytes += key.len();
        let slot = Arc::new(OnceLock::new());
        self.entries.push_back(Entry {
            key,
            slot: slot.clone(),
        });
        slot
    }
}
struct Key(Vec<u8>);
impl Write for Key {
    fn write(&mut self, bytes: &[u8]) -> std::io::Result<usize> {
        if self.0.len().saturating_add(bytes.len()) > MAX_KEY {
            return Err(std::io::Error::other("schema cache key limit"));
        }
        self.0
            .try_reserve(bytes.len())
            .map_err(std::io::Error::other)?;
        self.0.extend_from_slice(bytes);
        Ok(bytes.len())
    }
    fn flush(&mut self) -> std::io::Result<()> {
        Ok(())
    }
}
fn key(schema: &Value) -> Option<Vec<u8>> {
    let mut key = Key(Vec::new());
    serde_json::to_writer(&mut key, schema).ok()?;
    Some(key.0)
}
fn local_refs(value: &Value) -> bool {
    match value {
        Value::Object(fields) => fields.iter().all(|(key, value)| {
            if matches!(key.as_str(), "$ref" | "$dynamicRef" | "$recursiveRef") {
                value
                    .as_str()
                    .is_some_and(|reference| reference.starts_with('#'))
            } else {
                local_refs(value)
            }
        }),
        Value::Array(values) => values.iter().all(local_refs),
        _ => true,
    }
}
fn compile(schema: &Value) -> Compiled {
    if !local_refs(schema) {
        return Err(
            "tool schema requires external references; inline it before registration".into(),
        );
    }
    jsonschema::validator_for(schema)
        .map(Arc::new)
        .map_err(|error| format!("invalid tool schema: {error}"))
}
pub(crate) fn compiled(schema: &Value) -> Result<Arc<jsonschema::Validator>, Error> {
    static CACHE: OnceLock<Mutex<Cache>> = OnceLock::new();
    let slot = key(schema).and_then(|key| {
        CACHE
            .get_or_init(Default::default)
            .lock()
            .ok()
            .map(|mut cache| cache.slot(key))
    });
    match slot {
        Some(slot) => slot
            .get_or_init(|| compile(schema))
            .as_ref()
            .map(Arc::clone)
            .map_err(|message| Error::Composition(message.clone())),
        None => compile(schema).map_err(Error::Composition),
    }
}

const MAX_VALIDATION_ERRORS: usize = 8;
const MAX_COERCE_DEPTH: usize = 16;
const MAX_COERCE_DECODE_BYTES: usize = 256 * 1024;

pub(crate) fn validate_with_details(
    schema: &Value,
    value: &Value,
) -> Result<Result<(), Vec<(String, String)>>, Error> {
    let validator = compiled(schema)?;
    let errors: Vec<(String, String)> = validator
        .iter_errors(value)
        .take(MAX_VALIDATION_ERRORS)
        .map(|err| {
            let path = err.instance_path.to_string();
            let path = if path.is_empty() { "/".into() } else { path };
            (path, err.to_string())
        })
        .collect();
    if errors.is_empty() {
        Ok(Ok(()))
    } else {
        Ok(Err(errors))
    }
}

/// Deterministic, zero-guesswork argument coercion guided strictly by the tool's
/// local JSON Schema:
/// 1. Drops `null` values on optional object properties whose schema disallows `null`.
/// 2. Unwraps a single layer of JSON-encoded string when the schema expects an
///    `object` or `array` and does not accept `string`.
///
/// Returns `Some(coerced)` only when at least one transformation was applied.
pub(crate) fn coerce_tool_arguments(schema: &Value, value: &Value) -> Option<Value> {
    coerce_node(schema, value, 0)
}

fn schema_allows_type(schema: &Value, expected: &str) -> bool {
    let Some(obj) = schema.as_object() else {
        return matches!(schema, Value::Bool(true));
    };
    if let Some(ty) = obj.get("type") {
        match ty {
            Value::String(s) => return s == expected,
            Value::Array(arr) => {
                return arr.iter().any(|item| item.as_str() == Some(expected));
            }
            _ => {}
        }
    }
    for key in ["anyOf", "oneOf"] {
        if let Some(branches) = obj.get(key).and_then(Value::as_array)
            && branches.iter().any(|b| schema_allows_type(b, expected))
        {
            return true;
        }
    }
    if let Some(const_val) = obj.get("const") {
        return value_matches_type(const_val, expected);
    }
    if let Some(enum_vals) = obj.get("enum").and_then(Value::as_array) {
        return enum_vals.iter().any(|v| value_matches_type(v, expected));
    }
    if expected == "object" && (obj.contains_key("properties") || obj.contains_key("required")) {
        return true;
    }
    if expected == "array" && obj.contains_key("items") {
        return true;
    }
    false
}

fn value_matches_type(value: &Value, expected: &str) -> bool {
    match expected {
        "null" => value.is_null(),
        "boolean" => value.is_boolean(),
        "integer" => value.is_i64() || value.is_u64(),
        "number" => value.is_number(),
        "string" => value.is_string(),
        "array" => value.is_array(),
        "object" => value.is_object(),
        _ => false,
    }
}

fn coerce_node(schema: &Value, value: &Value, depth: usize) -> Option<Value> {
    if depth >= MAX_COERCE_DEPTH {
        return None;
    }
    match value {
        Value::String(text) => {
            if text.len() > MAX_COERCE_DECODE_BYTES || schema_allows_type(schema, "string") {
                return None;
            }
            let wants_object = schema_allows_type(schema, "object");
            let wants_array = schema_allows_type(schema, "array");
            if !wants_object && !wants_array {
                return None;
            }
            let parsed: Value = serde_json::from_str(text.trim()).ok()?;
            let matches_target =
                (wants_object && parsed.is_object()) || (wants_array && parsed.is_array());
            if !matches_target {
                return None;
            }
            Some(coerce_node(schema, &parsed, depth + 1).unwrap_or(parsed))
        }
        Value::Object(map) => {
            let schema_obj = schema.as_object()?;
            let properties = schema_obj.get("properties").and_then(Value::as_object)?;
            let required: std::collections::BTreeSet<&str> = schema_obj
                .get("required")
                .and_then(Value::as_array)
                .map(|arr| arr.iter().filter_map(Value::as_str).collect())
                .unwrap_or_default();
            let mut changed = false;
            let mut next = serde_json::Map::with_capacity(map.len());
            for (k, v) in map {
                if let Some(prop_schema) = properties.get(k) {
                    if v.is_null()
                        && !required.contains(k.as_str())
                        && !schema_allows_type(prop_schema, "null")
                    {
                        changed = true;
                        continue;
                    }
                    if let Some(coerced) = coerce_node(prop_schema, v, depth + 1) {
                        changed = true;
                        next.insert(k.clone(), coerced);
                    } else {
                        next.insert(k.clone(), v.clone());
                    }
                } else {
                    next.insert(k.clone(), v.clone());
                }
            }
            changed.then_some(Value::Object(next))
        }
        Value::Array(items) => {
            let item_schema = schema.as_object()?.get("items")?;
            if !item_schema.is_object() {
                return None;
            }
            let mut changed = false;
            let mut next = Vec::with_capacity(items.len());
            for item in items {
                if let Some(coerced) = coerce_node(item_schema, item, depth + 1) {
                    changed = true;
                    next.push(coerced);
                } else {
                    next.push(item.clone());
                }
            }
            changed.then_some(Value::Array(next))
        }
        _ => None,
    }
}

#[cfg(test)]
mod tests;
