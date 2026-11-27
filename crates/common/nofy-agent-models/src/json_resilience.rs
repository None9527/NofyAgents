//! Pure, bounded, zero-guesswork JSON & JSON Schema resilience primitives exposed
//! to declarative model protocol scripts. Policy decisions (whether to enable
//! lexical repair, strict tool schemas, or fallback retries) live in protocol
//! modules, never hardcoded in the Rust transport.
use crate::count_encoded;
use serde_json::{Map, Value, json};
use std::collections::BTreeSet;

const MAX_STRICT_DEPTH: usize = 32;

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct ParseDetail {
    pub message: String,
    pub line: u64,
    pub column: u64,
}

pub(crate) fn parse_detailed(text: &str, max_bytes: usize) -> Result<Value, ParseDetail> {
    if text.len() > max_bytes {
        return Err(ParseDetail {
            message: "JSON byte limit exceeded".into(),
            line: 1,
            column: 1,
        });
    }
    serde_json::from_str::<Value>(text).map_err(|err| ParseDetail {
        message: err.to_string(),
        line: err.line() as u64,
        column: err.column() as u64,
    })
}

/// Deterministic lexical-only JSON repair inside string literals:
/// 1. Strips a leading UTF-8 BOM.
/// 2. Escapes unescaped ASCII control characters (`0x00..=0x1F`) inside strings.
/// 3. Doubles invalid backslash escapes inside strings (including a lone trailing `\`).
///
/// Never inserts closing braces/quotes, never strips trailing commas, and never
/// alters tokens outside string literals.
pub(crate) fn repair_lexical(text: &str, max_bytes: usize) -> Result<String, &'static str> {
    let trimmed = text.strip_prefix('\u{FEFF}').unwrap_or(text);
    if trimmed.len() > max_bytes {
        return Err("JSON byte limit");
    }
    let bytes = trimmed.as_bytes();
    let mut out = String::with_capacity(trimmed.len());
    let mut in_string = false;
    let mut i = 0;
    while i < bytes.len() {
        let b = bytes[i];
        if !in_string {
            if b == b'"' {
                in_string = true;
            }
            let ch = trimmed[i..].chars().next().unwrap_or('\0');
            if out.len().saturating_add(ch.len_utf8()) > max_bytes {
                return Err("JSON byte limit");
            }
            out.push(ch);
            i += ch.len_utf8();
            continue;
        }
        if b == b'"' {
            in_string = false;
            if out.len().saturating_add(1) > max_bytes {
                return Err("JSON byte limit");
            }
            out.push('"');
            i += 1;
            continue;
        }
        if b == b'\\' {
            if i + 1 >= bytes.len() {
                if out.len().saturating_add(2) > max_bytes {
                    return Err("JSON byte limit");
                }
                out.push_str("\\\\");
                i += 1;
                continue;
            }
            let next = bytes[i + 1];
            let valid_simple =
                matches!(next, b'"' | b'\\' | b'/' | b'b' | b'f' | b'n' | b'r' | b't');
            let valid_unicode = next == b'u'
                && i + 6 <= bytes.len()
                && bytes[i + 2..i + 6].iter().all(u8::is_ascii_hexdigit);
            if valid_simple {
                if out.len().saturating_add(2) > max_bytes {
                    return Err("JSON byte limit");
                }
                out.push('\\');
                out.push(next as char);
                i += 2;
            } else if valid_unicode {
                if out.len().saturating_add(6) > max_bytes {
                    return Err("JSON byte limit");
                }
                out.push_str(&trimmed[i..i + 6]);
                i += 6;
            } else {
                // Invalid escape sequence: double the backslash and let the next
                // iteration process the following character normally (including control chars).
                if out.len().saturating_add(2) > max_bytes {
                    return Err("JSON byte limit");
                }
                out.push_str("\\\\");
                i += 1;
            }
            continue;
        }
        if b < 0x20 {
            let escaped = match b {
                b'\n' => "\\n".to_string(),
                b'\r' => "\\r".to_string(),
                b'\t' => "\\t".to_string(),
                0x08 => "\\b".to_string(),
                0x0c => "\\f".to_string(),
                other => format!("\\u{other:04x}"),
            };
            if out.len().saturating_add(escaped.len()) > max_bytes {
                return Err("JSON byte limit");
            }
            out.push_str(&escaped);
            i += 1;
            continue;
        }
        let ch = trimmed[i..].chars().next().unwrap_or('\0');
        if out.len().saturating_add(ch.len_utf8()) > max_bytes {
            return Err("JSON byte limit");
        }
        out.push(ch);
        i += ch.len_utf8();
    }
    Ok(out)
}

/// Detects when a model concatenated two or more complete JSON objects in a single
/// arguments payload (e.g. `{"a":1}{"b":2}`). Returns the objects only when `>= 2`
/// complete JSON objects consume the entire trimmed input without trailing garbage.
pub(crate) fn split_concatenated(text: &str, max_bytes: usize, max_items: usize) -> Vec<Value> {
    let trimmed = text.trim();
    if trimmed.is_empty() || trimmed.len() > max_bytes || !trimmed.starts_with('{') {
        return Vec::new();
    }
    let mut stream = serde_json::Deserializer::from_str(trimmed).into_iter::<Value>();
    let mut objects = Vec::new();
    for item in &mut stream {
        match item {
            Ok(Value::Object(map)) => {
                if objects.len() >= max_items {
                    return Vec::new();
                }
                objects.push(Value::Object(map));
            }
            _ => return Vec::new(),
        }
    }
    if objects.len() >= 2 && trimmed[stream.byte_offset()..].trim().is_empty() {
        objects
    } else {
        Vec::new()
    }
}

/// Strips a single outer markdown code fence (e.g. ```` ```json\n...\n``` ````)
/// when the entire trimmed text is enclosed in one fence block.
pub(crate) fn strip_fence(text: &str) -> &str {
    let trimmed = text.trim();
    let Some(rest) = trimmed.strip_prefix("```") else {
        return trimmed;
    };
    let Some(nl) = rest.find('\n') else {
        return trimmed;
    };
    let lang = rest[..nl].trim();
    if lang.contains('`') || lang.len() > 32 {
        return trimmed;
    }
    let body = &rest[nl + 1..];
    let Some(inner) = body.strip_suffix("```") else {
        return trimmed;
    };
    inner.trim()
}

/// Transforms a local JSON Schema into provider-strict form (`additionalProperties: false`,
/// all properties in `required` with originally optional properties wrapped as nullable,
/// unsupported validation keywords folded into `description`).
/// Returns `None` when the schema uses constructs that cannot be losslessly expressed
/// under strict constrained decoding (e.g. `$ref`, `oneOf`, dynamic maps, empty `{}`).
pub(crate) fn make_strict_schema(schema: &Value, max_bytes: usize) -> Option<Value> {
    let transformed = strict_node(schema, 0)?;
    if !transformed.is_object() {
        return None;
    }
    count_encoded(&transformed, max_bytes).ok()?;
    Some(transformed)
}

const UNSUPPORTED_STRICT_KEYWORDS: &[&str] = &[
    "$ref",
    "$defs",
    "definitions",
    "$dynamicRef",
    "$recursiveRef",
    "oneOf",
    "not",
    "patternProperties",
    "dependencies",
    "dependentRequired",
    "dependentSchemas",
    "if",
    "then",
    "else",
    "prefixItems",
    "contains",
    "propertyNames",
];

const FOLDABLE_CONSTRAINTS: &[&str] = &[
    "minimum",
    "maximum",
    "exclusiveMinimum",
    "exclusiveMaximum",
    "multipleOf",
    "minLength",
    "maxLength",
    "pattern",
    "minItems",
    "maxItems",
    "uniqueItems",
    "default",
];

const STANDARD_STRICT_FORMATS: &[&str] = &[
    "date-time",
    "time",
    "date",
    "duration",
    "email",
    "hostname",
    "ipv4",
    "ipv6",
    "uuid",
    "uri",
];

fn strict_node(schema: &Value, depth: usize) -> Option<Value> {
    if depth >= MAX_STRICT_DEPTH {
        return None;
    }
    let obj = schema.as_object()?;
    if obj.is_empty() {
        return None;
    }
    for banned in UNSUPPORTED_STRICT_KEYWORDS {
        if obj.contains_key(*banned) {
            return None;
        }
    }
    let mut out = Map::new();
    let mut notes = Vec::new();
    let mut existing_desc: Option<String> = None;

    for (key, value) in obj {
        if key == "description" {
            if let Some(s) = value.as_str() {
                existing_desc = Some(s.to_string());
            }
            continue;
        }
        if FOLDABLE_CONSTRAINTS.contains(&key.as_str()) {
            notes.push(format!("{key}={value}"));
            continue;
        }
        if key == "format" {
            if value
                .as_str()
                .is_some_and(|fmt| STANDARD_STRICT_FORMATS.contains(&fmt))
            {
                out.insert(key.clone(), value.clone());
            } else {
                notes.push(format!("format={value}"));
            }
            continue;
        }
        match key.as_str() {
            "properties" | "required" | "additionalProperties" | "items" | "anyOf" | "allOf" => {}
            _ => {
                out.insert(key.clone(), value.clone());
            }
        }
    }

    if let Some(branches) = obj.get("anyOf") {
        let arr = branches.as_array()?;
        if arr.is_empty() {
            return None;
        }
        let mut next = Vec::with_capacity(arr.len());
        for branch in arr {
            next.push(strict_node(branch, depth + 1)?);
        }
        out.insert("anyOf".into(), Value::Array(next));
    }

    if let Some(branches) = obj.get("allOf") {
        let arr = branches.as_array()?;
        if arr.is_empty() {
            return None;
        }
        let mut next = Vec::with_capacity(arr.len());
        for branch in arr {
            next.push(strict_node(branch, depth + 1)?);
        }
        out.insert("allOf".into(), Value::Array(next));
    }

    if let Some(items) = obj.get("items") {
        out.insert("items".into(), strict_node(items, depth + 1)?);
    }

    let is_object = obj.get("type").is_some_and(type_includes_object)
        || obj.contains_key("properties")
        || obj.contains_key("required");

    if is_object {
        if let Some(ap) = obj.get("additionalProperties")
            && *ap != Value::Bool(false)
        {
            // Dynamic map / open object cannot be expressed under strict additionalProperties: false.
            return None;
        }
        let orig_required: BTreeSet<&str> = obj
            .get("required")
            .and_then(Value::as_array)
            .map(|arr| arr.iter().filter_map(Value::as_str).collect())
            .unwrap_or_default();
        let props = match obj.get("properties") {
            Some(Value::Object(map)) => map,
            None => {
                // Bare `{"type":"object"}` with no properties is open-ended unless explicitly closed.
                if obj.get("additionalProperties") == Some(&Value::Bool(false)) {
                    out.insert("properties".into(), json!({}));
                    out.insert("required".into(), json!([]));
                    out.insert("additionalProperties".into(), Value::Bool(false));
                    attach_description(&mut out, existing_desc, &notes);
                    return Some(Value::Object(out));
                }
                return None;
            }
            Some(_) => return None,
        };
        let mut strict_props = Map::with_capacity(props.len());
        let mut strict_required = Vec::with_capacity(props.len());
        for (prop_name, prop_schema) in props {
            let mut strict_prop = strict_node(prop_schema, depth + 1)?;
            if !orig_required.contains(prop_name.as_str()) && !schema_is_nullable(&strict_prop) {
                strict_prop = make_nullable(strict_prop);
            }
            strict_props.insert(prop_name.clone(), strict_prop);
            strict_required.push(Value::String(prop_name.clone()));
        }
        out.insert("properties".into(), Value::Object(strict_props));
        out.insert("required".into(), Value::Array(strict_required));
        out.insert("additionalProperties".into(), Value::Bool(false));
    }

    attach_description(&mut out, existing_desc, &notes);
    Some(Value::Object(out))
}

fn attach_description(out: &mut Map<String, Value>, existing: Option<String>, notes: &[String]) {
    if notes.is_empty() {
        if let Some(desc) = existing {
            out.insert("description".into(), Value::String(desc));
        }
        return;
    }
    let suffix = format!("[constraints: {}]", notes.join(", "));
    let combined = match existing {
        Some(desc) if !desc.is_empty() => format!("{desc} {suffix}"),
        _ => suffix,
    };
    out.insert("description".into(), Value::String(combined));
}

fn type_includes_object(ty: &Value) -> bool {
    match ty {
        Value::String(s) => s == "object",
        Value::Array(arr) => arr.iter().any(|v| v.as_str() == Some("object")),
        _ => false,
    }
}

fn schema_is_nullable(schema: &Value) -> bool {
    let Some(obj) = schema.as_object() else {
        return false;
    };
    if let Some(ty) = obj.get("type") {
        match ty {
            Value::String(s) if s == "null" => return true,
            Value::Array(arr) if arr.iter().any(|v| v.as_str() == Some("null")) => return true,
            _ => {}
        }
    }
    if let Some(branches) = obj.get("anyOf").and_then(Value::as_array)
        && branches.iter().any(schema_is_nullable)
    {
        return true;
    }
    if let Some(enum_vals) = obj.get("enum").and_then(Value::as_array)
        && enum_vals.iter().any(Value::is_null)
    {
        return true;
    }
    false
}

fn make_nullable(schema: Value) -> Value {
    if let Value::Object(mut obj) = schema {
        if let Some(Value::Array(branches)) = obj.get_mut("anyOf") {
            branches.push(json!({"type": "null"}));
            return Value::Object(obj);
        }
        let desc = obj.remove("description");
        let mut wrapped = Map::new();
        if let Some(d) = desc {
            wrapped.insert("description".into(), d);
        }
        wrapped.insert(
            "anyOf".into(),
            Value::Array(vec![Value::Object(obj), json!({"type": "null"})]),
        );
        return Value::Object(wrapped);
    }
    json!({"anyOf": [schema, {"type": "null"}]})
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn lexical_repair_fixes_control_chars_and_invalid_escapes_without_guessing_structure() {
        let bom_and_ctrl = "\u{FEFF}{\"text\":\"line1\nline2\t\\d\\u12\"}";
        let repaired = repair_lexical(bom_and_ctrl, 4096).unwrap();
        let parsed = parse_detailed(&repaired, 4096).unwrap();
        assert_eq!(parsed["text"], "line1\nline2\t\\d\\u12");

        // Truncated JSON stays unparseable: never guess closing braces.
        let truncated = "{\"path\":\"src/main.rs\"";
        let repaired_trunc = repair_lexical(truncated, 4096).unwrap();
        assert!(parse_detailed(&repaired_trunc, 4096).is_err());
    }

    #[test]
    fn split_concatenated_detects_multiple_objects_only_when_complete() {
        let split = split_concatenated("{\"a\":1}{\"b\":2}", 4096, 16);
        assert_eq!(split, vec![json!({"a": 1}), json!({"b": 2})]);
        assert!(split_concatenated("{\"a\":1}", 4096, 16).is_empty());
        assert!(split_concatenated("{\"a\":1}{\"b\":", 4096, 16).is_empty());
    }

    #[test]
    fn strip_fence_removes_outer_markdown_json_fence_only() {
        assert_eq!(strip_fence("```json\n{\"ok\":true}\n```"), "{\"ok\":true}");
        assert_eq!(strip_fence("```\n[1,2]\n```"), "[1,2]");
        assert_eq!(strip_fence("plain text"), "plain text");
    }

    #[test]
    fn make_strict_schema_closes_objects_wraps_optionals_and_folds_constraints() {
        let schema = json!({
            "type": "object",
            "required": ["path"],
            "properties": {
                "path": {"type": "string", "minLength": 1, "description": "Target file"},
                "limit": {"type": "integer", "minimum": 1, "maximum": 100}
            }
        });
        let strict = make_strict_schema(&schema, 65536).unwrap();
        assert_eq!(strict["additionalProperties"], false);
        let req: Vec<&str> = strict["required"]
            .as_array()
            .unwrap()
            .iter()
            .filter_map(Value::as_str)
            .collect();
        assert!(req.contains(&"path") && req.contains(&"limit"));
        assert!(
            strict["properties"]["path"]["description"]
                .as_str()
                .unwrap()
                .contains("minLength=1")
        );
        assert!(strict["properties"]["limit"]["anyOf"].is_array());

        // Unsupported $ref returns None so callers can fall back to non-strict.
        assert!(make_strict_schema(&json!({"$ref": "#/$defs/x"}), 65536).is_none());
        // Open map object returns None.
        assert!(make_strict_schema(&json!({"type": "object"}), 65536).is_none());
    }
}
