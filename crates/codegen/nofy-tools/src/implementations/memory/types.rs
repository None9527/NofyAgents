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
    /// Global memory — shared across all workspaces (`~/.nofy/memory/MEMORY.md`).
    Global,
    /// Workspace-scoped memory — specific to this project.
    Workspace,
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

/// Input for the `memory_write` tool.
#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct MemoryWriteInput {
    /// What to do: `add`, `replace`, or `remove`.
    pub action: MemoryWriteAction,
    /// Which store to write: `global` (cross-project) or `workspace`
    /// (this project only). Prefer `workspace` unless the fact is truly
    /// project-independent (user preferences, environment facts).
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
}

/// Output schema for `memory_write` (used for JSON Schema generation only).
#[derive(Debug, JsonSchema)]
pub struct MemoryWriteOutput {
    /// Human-readable result: what changed and where.
    pub result: String,
}
