//! Backend-agnostic trait for memory writes.
//!
//! `MemoryWriter` is defined in `nofy-tools` to keep the tool crate
//! backend-agnostic. The concrete implementation lives in `nofy-shell`
//! (it needs the memory storage + index + embedding provider).
//!
//! Separate from [`super::memory_backend::MemoryBackend`] on purpose:
//! the backend trait is a read-only search surface; writes are a
//! distinct, governed capability (the write tool is not read-only, so
//! writes flow through the permission system and the runtime journal's
//! tool-intent chain like any other mutation).

/// Result of a successful memory write: the file that changed and a
/// human-readable summary of the change.
#[derive(Debug, Clone)]
pub struct MemoryWriteOutcome {
    /// Absolute path of the memory file that was written.
    pub path: String,
    /// Human-readable summary (e.g. "added entry (3 lines)").
    pub summary: String,
}

/// Backend-agnostic interface for memory mutations.
///
/// Implementations must be `Send + Sync` to be stored as
/// `Arc<dyn MemoryWriter>` on shared tool resources. Implementations
/// own durability: a successful return means the entry is on disk and
/// the search index has been updated.
#[async_trait::async_trait]
pub trait MemoryWriter: Send + Sync {
    /// Append a new entry to the store's memory file.
    async fn add(
        &self,
        scope: &str,
        content: &str,
    ) -> Result<MemoryWriteOutcome, Box<dyn std::error::Error + Send + Sync>>;

    /// Replace the unique fragment `old_text` with `content`.
    ///
    /// Fails unless `old_text` matches exactly once in the file.
    async fn replace(
        &self,
        scope: &str,
        old_text: &str,
        content: &str,
    ) -> Result<MemoryWriteOutcome, Box<dyn std::error::Error + Send + Sync>>;

    /// Remove the unique fragment `old_text`.
    ///
    /// Fails unless `old_text` matches exactly once in the file.
    async fn remove(
        &self,
        scope: &str,
        old_text: &str,
    ) -> Result<MemoryWriteOutcome, Box<dyn std::error::Error + Send + Sync>>;
}
