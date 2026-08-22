//! Cross-session recall backend (global-awareness kernel seam).
//!
//! Lets the agent autonomously bring information from *other* conversations
//! into the current one — the natural-language counterpart of
//! `nofy sessions search --all`. The trait is defined here (in nofy-tools)
//! and implemented by the shell layer over the local session FTS index, so
//! tools never depend on nofy-shell directly. Follows the same injection
//! pattern as [`super::memory_backend::MemoryBackend`] and
//! [`super::resources::McpResourceProvider`].

use std::sync::Arc;

/// One ranked hit from another session.
#[derive(Debug, Clone, serde::Serialize)]
pub struct SessionRecallHit {
    pub session_id: String,
    pub title: String,
    /// The project directory the hit session belongs to (attribution).
    pub cwd: String,
    pub snippet: Option<String>,
    pub score: f64,
    pub updated_at_unix: i64,
}

/// Backend for searching the user's other sessions (local, all projects).
///
/// Implementations must be `Send + Sync` to be stored in
/// `Arc<dyn SessionRecallProvider>`.
#[async_trait::async_trait]
pub trait SessionRecallProvider: Send + Sync {
    /// Search other sessions for `query`, returning at most `limit` ranked
    /// hits. Should exclude nothing by scope (global view) — the agent
    /// decides relevance.
    async fn search(&self, query: &str, limit: usize) -> Result<Vec<SessionRecallHit>, String>;
}

/// Wrapper stored in [`super::resources::Resources`] for session recall.
#[derive(Clone)]
pub struct SessionRecallAccess(pub Arc<dyn SessionRecallProvider>);

impl std::fmt::Debug for SessionRecallAccess {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("SessionRecallAccess").finish()
    }
}
