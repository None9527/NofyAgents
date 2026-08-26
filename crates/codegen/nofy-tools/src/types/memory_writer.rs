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

/// One operation inside a batch write.
#[derive(Debug, Clone)]
pub enum MemoryOp {
    /// Append a new entry.
    Add(String),
    /// Replace the unique fragment `old` with `new`.
    Replace { old: String, new: String },
    /// Remove the unique fragment.
    Remove(String),
}

/// Current size of a memory store against its budget.
#[derive(Debug, Clone)]
pub struct MemoryUsage {
    /// Characters currently used (whole file).
    pub used_chars: usize,
    /// Character budget for this store.
    pub limit_chars: usize,
    /// The store's current content (for surfacing on budget rejection).
    pub content: String,
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

    /// Apply a batch of operations atomically against the store's budget.
    ///
    /// All operations are applied in order to an in-memory copy; the budget
    /// is checked only on the FINAL result. On success the file is written
    /// once. On budget overflow or any failed operation nothing is written
    /// and the error carries the current usage so the caller can free room
    /// and retry in one batch.
    async fn apply_batch(
        &self,
        scope: &str,
        ops: &[MemoryOp],
    ) -> Result<MemoryWriteOutcome, Box<dyn std::error::Error + Send + Sync>>;

    /// Report the store's current size against its budget.
    async fn usage(
        &self,
        scope: &str,
    ) -> Result<MemoryUsage, Box<dyn std::error::Error + Send + Sync>>;
}
