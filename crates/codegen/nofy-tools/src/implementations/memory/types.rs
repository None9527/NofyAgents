//! Input/output types for memory tools.

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

/// Input for the `memory_search` tool.
#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct MemorySearchInput {
    /// The search query string. Use specific technical terms rather than
    /// conversational language. Good: "authentication middleware patterns".
    /// Bad: "that thing we discussed about auth".
    pub query: String,
    /// Maximum number of results to return.
    ///
    /// When omitted the backend-configured value is used (typically 6 from
    /// `[memory.search].max_results`), so leaving this unset is preferred
    /// for normal queries.
    #[serde(default)]
    pub max_results: Option<usize>,
    /// Minimum relevance score threshold.
    ///
    /// When omitted the backend-configured value is used (typically 0.0 from
    /// `[memory.search].min_score`).
    #[serde(default)]
    pub min_score: Option<f64>,
}

/// Output schema for `memory_search` (used for JSON Schema generation only).
#[derive(Debug, JsonSchema)]
pub struct MemorySearchOutput {
    /// Formatted search results as markdown text.
    pub results: String,
}

/// Input for the `memory_get` tool.
#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct MemoryGetInput {
    /// Path to the memory file to read.
    pub path: String,
    /// 1-based start line, matching the line numbers in the tool's output
    /// (default: beginning of file). 0 is accepted and treated as 1.
    #[serde(default)]
    pub from: Option<usize>,
    /// Maximum number of lines to return (default: all).
    #[serde(default)]
    pub lines: Option<usize>,
}

/// Output schema for `memory_get` (used for JSON Schema generation only).
#[derive(Debug, JsonSchema)]
pub struct MemoryGetOutput {
    /// File content (optionally line-limited).
    pub content: String,
}

/// Which memory store a write targets.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum MemoryWriteScope {
    /// Global memory — cross-project facts (`~/.nofy/memory/MEMORY.md`).
    Global,
    /// Workspace-scoped memory — specific to this project.
    Workspace,
    /// User profile — who the user is: preferences, communication style,
    /// workflow habits (cross-project, `~/.nofy/memory/USER.md`).
    User,
}

/// What a `memory_write` call does to the target store.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum MemoryWriteAction {
    /// Append a new entry to the memory file.
    Add,
    /// Replace the unique fragment `old_text` with `content`.
    Replace,
    /// Remove the unique fragment `old_text`.
    Remove,
}

/// One operation inside a batch write.
#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct MemoryWriteOpInput {
    /// What to do.
    pub action: MemoryWriteAction,
    /// Entry text for `add`, replacement text for `replace`.
    #[serde(default)]
    pub content: Option<String>,
    /// Unique substring identifying the entry for `replace`/`remove`.
    #[serde(default)]
    pub old_text: Option<String>,
}

/// Input for the `memory_write` tool.
#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct MemoryWriteInput {
    /// What to do: `add`, `replace`, or `remove` (single-op shape). Omit
    /// when using `operations`.
    #[serde(default)]
    pub action: Option<MemoryWriteAction>,
    /// Which store to write: `workspace` (project conventions, decisions),
    /// `global` (cross-project facts), or `user` (who the user is:
    /// preferences, style, habits).
    pub scope: MemoryWriteScope,
    /// The entry text for `add`, or the replacement text for `replace`.
    /// Ignored for `remove`. Keep entries to one or two sentences —
    /// a durable fact or decision, not a transcript.
    #[serde(default)]
    pub content: Option<String>,
    /// A short unique substring identifying the existing entry to replace
    /// or remove. Must match exactly one line region of the target file;
    /// zero or multiple matches are rejected. Required for `replace` and
    /// `remove`, ignored for `add`.
    #[serde(default)]
    pub old_text: Option<String>,
    /// Batch shape: operations applied atomically in one call against the
    /// store's character budget (checked on the FINAL result). Preferred
    /// when making multiple changes or when the store is full — remove or
    /// shorten stale entries AND add the new one together.
    #[serde(default, deserialize_with = "deserialize_operations_lenient")]
    pub operations: Option<Vec<MemoryWriteOpInput>>,
}

/// Some models stringify nested arrays and pass `operations` as a JSON
/// string instead of an array. Accept both shapes rather than failing the
/// whole call at the schema boundary.
fn deserialize_operations_lenient<'de, D>(
    deserializer: D,
) -> Result<Option<Vec<MemoryWriteOpInput>>, D::Error>
where
    D: serde::Deserializer<'de>,
{
    use serde::de::Error;
    let value: Option<serde_json::Value> = Option::deserialize(deserializer)?;
    match value {
        None | Some(serde_json::Value::Null) => Ok(None),
        Some(v @ serde_json::Value::Array(_)) => {
            serde_json::from_value(v).map_err(Error::custom)
        }
        Some(serde_json::Value::String(s)) => serde_json::from_str(&s).map_err(|e| {
            Error::custom(format!(
                "operations was a string that does not parse as an array of \
                 {{action, content?, old_text?}} objects: {e}"
            ))
        }),
        Some(other) => Err(Error::custom(format!(
            "operations must be an array of {{action, content?, old_text?}} objects, got: {other}"
        ))),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn operations_accepts_real_array() {
        let input: MemoryWriteInput = serde_json::from_str(
            r#"{"scope":"workspace","operations":[{"action":"remove","old_text":"x"}]}"#,
        )
        .unwrap();
        assert_eq!(input.operations.expect("array must parse").len(), 1);
    }

    #[test]
    fn operations_accepts_stringified_array() {
        let input: MemoryWriteInput = serde_json::from_str(
            r#"{"scope":"workspace","operations":"[{\"action\":\"add\",\"content\":\"y\"}]"}"#,
        )
        .unwrap();
        let ops = input.operations.expect("stringified array must parse");
        assert!(matches!(ops[0].action, MemoryWriteAction::Add));
    }

    #[test]
    fn operations_rejects_garbage_string() {
        let err = serde_json::from_str::<MemoryWriteInput>(
            r#"{"scope":"workspace","operations":"not json"}"#,
        )
        .unwrap_err();
        assert!(err.to_string().contains("does not parse"));
    }
}

/// Output schema for `memory_write` (used for JSON Schema generation only).
#[derive(Debug, JsonSchema)]
pub struct MemoryWriteOutput {
    /// Human-readable result: what changed and where.
    pub result: String,
}
