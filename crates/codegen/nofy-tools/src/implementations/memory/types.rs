//! Input/output types for memory tools.

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

/// Input for the `memory_search` tool.
#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct MemorySearchInput {
    /// Optional search query. Omit it to list everything currently remembered.
    /// When searching, use specific technical terms rather than
    /// conversational language. Good: "authentication middleware patterns".
    /// Bad: "that thing we discussed about auth".
    #[serde(default)]
    pub query: Option<String>,
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
    /// Stable target ID returned by memory_search/list/remember.
    pub target_id: String,
    /// Hash returned with the target. Required for consistent reads.
    #[serde(default)]
    pub expected_hash: Option<String>,
}

/// Output schema for `memory_get` (used for JSON Schema generation only).
#[derive(Debug, JsonSchema)]
pub struct MemoryGetOutput {
    /// Human-readable memory content.
    pub content: String,
}

/// Which memory store a write targets.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum MemoryWriteScope {
    /// Cross-project preferences and personal facts.
    Personal,
    /// Decisions and facts limited to the current project.
    Project,
}

/// What a `memory_write` call does to the target store.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum MemoryWriteAction {
    Remember,
    Revise,
    Forget,
    Undo,
}

/// Input for the `memory_write` tool.
#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct MemoryWriteInput {
    pub action: MemoryWriteAction,
    /// User-facing area for `remember`: `personal` or `project`.
    /// The service infers the area from the stable target for revise/forget.
    #[serde(default)]
    pub scope: Option<MemoryWriteScope>,
    /// Statement for remember/revise.
    #[serde(default)]
    pub statement: Option<String>,
    /// Stable target ID for revise/forget.
    #[serde(default)]
    pub target_id: Option<String>,
    /// Expected target hash for revise/forget.
    #[serde(default)]
    pub expected_hash: Option<String>,
    /// Required confirmation for irreversible forget or sensitive remember.
    #[serde(default)]
    pub confirmed: bool,
    /// Operation ID returned by a recent remember/revise, for `undo`.
    #[serde(default)]
    pub undo_operation_id: Option<String>,
    /// Generation returned with the undo token. Defaults to 1 for the current contract.
    #[serde(default)]
    pub undo_generation: Option<u64>,
}

/// Output schema for `memory_write` (used for JSON Schema generation only).
#[derive(Debug, JsonSchema)]
pub struct MemoryWriteOutput {
    /// Human-readable result: what changed and where.
    pub result: String,
}
