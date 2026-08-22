//! Crash-forensics backend (global-awareness kernel seam).
//!
//! Lets the agent autonomously answer "why did it die" questions from the
//! daemon's life/death discipline ledger — the natural-language counterpart
//! of `nofy forensics`. The trait is defined here (in nofy-tools) and
//! implemented by the shell layer over `nofy_daemon::forensics`, so tools
//! never depend on nofy-daemon directly. Follows the same injection pattern
//! as [`super::session_recall::SessionRecallProvider`].

use std::sync::Arc;

/// One lifecycle entry from the forensics ledger.
#[derive(Debug, Clone, serde::Serialize)]
pub struct ForensicsEntry {
    /// `startup`, `clean_shutdown`, `unclean_death_detected`, or other.
    pub kind: String,
    /// The pid this entry is about (startup / clean_shutdown).
    pub pid: Option<u64>,
    /// The dead pid (unclean_death_detected).
    pub dead_pid: Option<u64>,
    /// The last recorded state of the dead run (unclean_death_detected).
    pub dead_kind: Option<String>,
    /// Whether the previous run ended cleanly (startup).
    pub prev_had_clean_shutdown: Option<bool>,
}

/// Backend for reading the daemon's crash-forensics ledger.
///
/// Implementations must be `Send + Sync` to be stored in
/// `Arc<dyn ForensicsProvider>`.
#[async_trait::async_trait]
pub trait ForensicsProvider: Send + Sync {
    /// Return at most `limit` most-recent ledger entries in chronological
    /// order. Must work while the daemon is down — a crash must be askable
    /// about even when nothing runs.
    async fn entries(&self, limit: usize) -> Result<Vec<ForensicsEntry>, String>;
}

/// Wrapper stored in [`super::resources::Resources`] for forensics.
#[derive(Clone)]
pub struct ForensicsAccess(pub Arc<dyn ForensicsProvider>);

impl std::fmt::Debug for ForensicsAccess {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("ForensicsAccess").finish()
    }
}
