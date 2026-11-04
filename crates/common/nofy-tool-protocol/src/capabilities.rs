//! Product-neutral tool capability metadata.

use serde::{Deserialize, Serialize};

/// Declared tool capabilities. These are metadata, not an independent
/// scheduler, authorization mechanism or transport implementation.
#[derive(Debug, Clone, Default, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ToolCapabilities {
    /// Partial-result stream declaration; absent means no partial results.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub streaming: Option<StreamingSpec>,

    /// Whether the tool cooperates with invocation cancellation.
    #[serde(default)]
    pub supports_cancel: bool,

    /// Declared concurrency limit. Absent means no tool-specific limit.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub max_concurrency: Option<u32>,

    /// Whether the tool declares itself read-only.
    #[serde(default)]
    pub is_read_only: bool,

    /// Opaque behavior version, compared bytewise rather than as semver.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub behavior_version: Option<String>,

    /// Declared whole-frame byte budget; the execution transport owns enforcement.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub max_frame_bytes: Option<u32>,

    /// Declared per-call timeout in milliseconds; no implicit service default.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub timeout_ms: Option<u64>,

    /// Declared external-state access scope; does not imply leader routing.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub tool_scope: Option<ToolScope>,
}

/// Self-describing partial-result stream metadata.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct StreamingSpec {
    /// Stable discriminator stamped on generic progress events.
    pub subkind: String,

    /// UTF-8-safe delta byte cap, independent of whole-frame byte limits.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub max_delta_bytes: Option<u32>,
}

/// Declared external-state access, not an authorization grant.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ToolScope {
    Read,
    Write,
}
