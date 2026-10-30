//! Shared canonical Goal state and lifecycle, independent of the shell.
use serde::{Deserialize, Serialize};
pub mod state;
pub use state::*;
/// Same rescue/panel budget used by the original verifier.
pub const GOAL_VERIFIER_PANEL_MAX_BYTES: usize = 512 * 1024;

/// A model + the harness whose system prompt / toolset flavor that model must
/// run against. The pair is the atomic configurable unit because a model is
/// only guaranteed to work with a compatible harness (cursor vs nofy-build).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct GoalRoleModel {
    /// Model id, e.g. "grok-4". Resolved against available models at
    /// spawn time; unknown/unauthorized ⇒ fail-open to current model.
    pub model: String,
    /// Harness `agent_type` (e.g. "cursor", "nofy-build-plan") whose
    /// `AgentDefinition` decides the role subagent's harness flavor (system
    /// prompt + cursor-vs-nofy-build toolset), applied REGARDLESS of the
    /// session/parent agent. Resolved by NAME (project/plugin/builtin lookup,
    /// then re-flavored by the subagent toolset resolver) — NOT via the main
    /// session's env/ACP/strict-harness precedence chain. NOT a subagent type:
    /// the role always spawns `general-purpose`, so the harness only re-flavors
    /// that toolset. An `agent_type` that doesn't resolve, that resolves to a
    /// strict harness whose flavor the subagent system can't represent (e.g.
    /// `codex`), or whose role toolset can't satisfy the role, fails open to the
    /// session model + harness before commit.
    pub agent_type: String,
}
