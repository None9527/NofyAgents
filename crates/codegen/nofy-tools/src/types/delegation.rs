//! Delegation backend (global-awareness kernel seam).
//!
//! Lets the agent autonomously hand a self-contained goal to a background
//! daemon run — the natural-language counterpart of `nofy task submit` /
//! `nofy task list`. The trait is defined here (in nofy-tools) and
//! implemented by the shell layer over the daemon control socket, so tools
//! never depend on nofy-daemon directly. Follows the same injection pattern
//! as [`super::session_recall::SessionRecallProvider`].

use std::sync::Arc;

/// One delegated task's lifecycle state (from the task journal).
#[derive(Debug, Clone, serde::Serialize)]
pub struct DelegatedTaskStatus {
    pub id: String,
    pub state: String,
    /// The run this task belongs to (`-` when unknown).
    pub run: String,
}

/// Backend for submitting/inspecting delegated runs on the daemon.
///
/// Implementations must be `Send + Sync` to be stored in
/// `Arc<dyn DelegationProvider>`.
#[async_trait::async_trait]
pub trait DelegationProvider: Send + Sync {
    /// Submit one self-contained goal as a delegated run. Returns the number
    /// of accepted tasks. Must surface the daemon's refusal verbatim (e.g.
    /// the U4-06 "a delegated run is still active" fail-loud) — never hide
    /// a rejection.
    async fn submit(&self, task_id: &str, goal: &str, cwd: Option<&str>) -> Result<u32, String>;

    /// List every journaled delegated task with its lifecycle state.
    async fn status(&self) -> Result<Vec<DelegatedTaskStatus>, String>;
}

/// Wrapper stored in [`super::resources::Resources`] for delegation.
#[derive(Clone)]
pub struct DelegationAccess(pub Arc<dyn DelegationProvider>);

impl std::fmt::Debug for DelegationAccess {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("DelegationAccess").finish()
    }
}
