//! Shell-side `MemoryWriter` implementation for the `memory_write` tool.
//!
//! Wraps the session's memory storage + index: every successful write is
//! on disk AND reindexed (with embeddings when configured) before the tool
//! returns — the model can `memory_search` for a just-written entry in the
//! same session. Injection still happens only at the start of the next
//! session (frozen snapshot), which the tool output communicates.

use std::path::PathBuf;

use nofy_tools::types::memory_writer::{MemoryWriteOutcome, MemoryWriter};

use crate::session::memory::embedding::EmbeddingProvider;

/// The shell's memory writer: storage for file layout + optional backend
/// params for the index/embedding seam.
pub(crate) struct ShellMemoryWriter {
    storage: crate::session::memory::MemoryStorage,
    backend_params: Option<crate::session::memory::MemoryBackendParams>,
}

impl ShellMemoryWriter {
    pub(crate) fn new(
        storage: crate::session::memory::MemoryStorage,
        backend_params: Option<crate::session::memory::MemoryBackendParams>,
    ) -> Self {
        Self {
            storage,
            backend_params,
        }
    }

    fn scope_from_str(scope: &str) -> crate::session::memory::MemoryScope {
        match scope {
            "global" => crate::session::memory::MemoryScope::Global,
            _ => crate::session::memory::MemoryScope::Workspace,
        }
    }

    fn memory_file(&self, scope: &str) -> PathBuf {
        match scope {
            "global" => self.storage.global_memory_file(),
            _ => self.storage.workspace_memory_file(),
        }
    }

    /// Reindex + embed the written file so the change is searchable
    /// immediately. Best-effort: a failed reindex does not fail the write
    /// (the file is already durable; the watcher syncs the index later).
    ///
    /// `MemoryIndex` is `Send` but `!Sync`, so `&MemoryIndex` is `!Send`:
    /// the owned index may live across awaits, but it must never be
    /// *borrowed* across one (same discipline as `MemoryBackendImpl`).
    async fn reindex_and_embed(&self, path: &std::path::Path) {
        let embed_dims = self
            .backend_params
            .as_ref()
            .and_then(|p| p.embed_config.as_ref())
            .map_or(1024, |c| c.dimensions);
        let db_path = self.storage.workspace_dir().join("index.sqlite");
        let Ok(mut index) = crate::session::memory::MemoryIndex::open_or_create(
            &db_path,
            self.storage.clone(),
            Default::default(),
            embed_dims,
        ) else {
            tracing::warn!(path = %path.display(), "memory_write: failed to open index after write");
            return;
        };
        // Sync phase: reindex and collect the chunks that need embeddings.
        let source = self.storage.classify_source(path);
        if let Err(e) = index.reindex_file(path, source, "agent") {
            tracing::warn!(path = %path.display(), error = %e, "memory_write: reindex failed");
            return;
        }
        let missing = index.chunks_without_embeddings().unwrap_or_default();
        if missing.is_empty() {
            return;
        }
        // Async phase: build the provider and embed with no index borrow.
        let Some(ref params) = self.backend_params else {
            return;
        };
        let Some(provider) = params.make_embedding_provider().await else {
            return;
        };
        for batch in missing.chunks(32) {
            let texts: Vec<&str> = batch.iter().map(|(_, text)| text.as_str()).collect();
            match provider.embed_batch(&texts).await {
                Ok(embeddings) => {
                    // Sync phase: upsert back into the owned index.
                    for ((chunk_id, _), embedding) in batch.iter().zip(embeddings.iter()) {
                        let _ = index.upsert_embedding(chunk_id, embedding);
                    }
                }
                Err(e) => {
                    tracing::warn!(
                        path = %path.display(),
                        error = %e,
                        "memory_write: embedding batch failed; FTS search still covers the entry"
                    );
                }
            }
        }
    }
}

type WriteError = Box<dyn std::error::Error + Send + Sync>;

#[async_trait::async_trait]
impl MemoryWriter for ShellMemoryWriter {
    async fn add(&self, scope: &str, content: &str) -> Result<MemoryWriteOutcome, WriteError> {
        let mem_scope = Self::scope_from_str(scope);
        // Ephemeral workspaces (temp dirs) skip workspace-scoped writes by
        // design; say so instead of claiming success.
        if self.storage.is_ephemeral() && mem_scope == crate::session::memory::MemoryScope::Workspace
        {
            return Err(
                "workspace memory is unavailable in an ephemeral (temp-dir) workspace; \
                 use scope=global for cross-project facts"
                    .into(),
            );
        }
        self.storage.append_to_memory(mem_scope, content)?;
        let path = self.memory_file(scope);
        self.reindex_and_embed(&path).await;
        Ok(MemoryWriteOutcome {
            path: path.display().to_string(),
            summary: format!("Added memory entry ({scope} scope)"),
        })
    }

    async fn replace(
        &self,
        scope: &str,
        old_text: &str,
        content: &str,
    ) -> Result<MemoryWriteOutcome, WriteError> {
        let path = self.memory_file(scope);
        let current = std::fs::read_to_string(&path).unwrap_or_default();
        let matches = current.matches(old_text).count();
        match matches {
            0 => {
                return Err(format!(
                    "old_text not found in {scope} memory — read the file with memory_get first"
                )
                .into());
            }
            n if n > 1 => {
                return Err(format!(
                    "old_text matches {n} places in {scope} memory — use a longer unique substring"
                )
                .into());
            }
            _ => {}
        }
        let updated = current.replacen(old_text, content, 1);
        std::fs::write(&path, updated)?;
        self.reindex_and_embed(&path).await;
        Ok(MemoryWriteOutcome {
            path: path.display().to_string(),
            summary: format!("Replaced memory entry ({scope} scope)"),
        })
    }

    async fn remove(&self, scope: &str, old_text: &str) -> Result<MemoryWriteOutcome, WriteError> {
        let path = self.memory_file(scope);
        let current = std::fs::read_to_string(&path).unwrap_or_default();
        let matches = current.matches(old_text).count();
        match matches {
            0 => {
                return Err(format!(
                    "old_text not found in {scope} memory — read the file with memory_get first"
                )
                .into());
            }
            n if n > 1 => {
                return Err(format!(
                    "old_text matches {n} places in {scope} memory — use a longer unique substring"
                )
                .into());
            }
            _ => {}
        }
        let mut updated = current.replacen(old_text, "", 1);
        // Collapse the blank-line seam a removed entry can leave behind.
        while updated.contains("\n\n\n") {
            updated = updated.replace("\n\n\n", "\n\n");
        }
        let updated = updated.trim().to_string();
        std::fs::write(&path, if updated.is_empty() { String::new() } else { format!("{updated}\n") })?;
        self.reindex_and_embed(&path).await;
        Ok(MemoryWriteOutcome {
            path: path.display().to_string(),
            summary: format!("Removed memory entry ({scope} scope)"),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp_writer() -> (tempfile::TempDir, ShellMemoryWriter) {
        let dir = tempfile::tempdir().expect("tempdir");
        let storage = crate::session::memory::MemoryStorage::with_paths(
            dir.path().join("global"),
            dir.path().join("workspace"),
        );
        (dir, ShellMemoryWriter::new(storage, None))
    }

    #[tokio::test]
    async fn add_writes_file_and_reports_path() {
        let (_dir, writer) = temp_writer();
        let outcome = writer
            .add("workspace", "Build uses cargo-make, not plain cargo")
            .await
            .expect("add");
        assert!(outcome.summary.contains("Added"));
        let content = std::fs::read_to_string(&outcome.path).expect("read");
        assert!(content.contains("cargo-make"));
    }

    #[tokio::test]
    async fn replace_requires_unique_match() {
        let (_dir, writer) = temp_writer();
        writer.add("workspace", "fact one").await.unwrap();
        writer.add("workspace", "fact two").await.unwrap();

        let err = writer
            .replace("workspace", "not present", "x")
            .await
            .unwrap_err();
        assert!(err.to_string().contains("not found"));

        writer
            .replace("workspace", "fact one", "fact ONE (revised)")
            .await
            .unwrap();
        let content =
            std::fs::read_to_string(writer.storage.workspace_memory_file()).expect("read");
        assert!(content.contains("fact ONE (revised)"));
        assert!(!content.contains("fact one"));
        assert!(content.contains("fact two"));
    }

    #[tokio::test]
    async fn remove_deletes_entry_and_cleans_seams() {
        let (_dir, writer) = temp_writer();
        writer.add("workspace", "keep me").await.unwrap();
        writer.add("workspace", "drop me").await.unwrap();

        let err = writer.remove("workspace", "nope").await.unwrap_err();
        assert!(err.to_string().contains("not found"));

        writer.remove("workspace", "drop me").await.unwrap();
        let content =
            std::fs::read_to_string(writer.storage.workspace_memory_file()).expect("read");
        assert!(content.contains("keep me"));
        assert!(!content.contains("drop me"));
        assert!(!content.contains("\n\n\n"));
    }

    #[tokio::test]
    async fn ambiguous_old_text_is_rejected() {
        let (_dir, writer) = temp_writer();
        writer.add("workspace", "dup fact").await.unwrap();
        writer.add("workspace", "dup fact").await.unwrap();
        let err = writer
            .replace("workspace", "dup fact", "x")
            .await
            .unwrap_err();
        assert!(err.to_string().contains("2 places"));
    }

    #[tokio::test]
    async fn global_scope_targets_global_file() {
        let (_dir, writer) = temp_writer();
        let outcome = writer
            .add("global", "User prefers concise answers")
            .await
            .expect("add");
        assert_eq!(
            PathBuf::from(&outcome.path),
            writer.storage.global_memory_file()
        );
    }

    #[tokio::test]
    async fn ephemeral_workspace_reports_skip_instead_of_fake_success() {
        let dir = tempfile::tempdir().expect("tempdir");
        // /tmp-style cwd → ephemeral storage (workspace writes skipped).
        let storage = crate::session::memory::MemoryStorage::new(
            std::path::Path::new("/tmp"),
            Some(dir.path()),
        );
        assert!(storage.is_ephemeral(), "test precondition: /tmp is ephemeral");
        let writer = ShellMemoryWriter::new(storage, None);
        let err = writer
            .add("workspace", "should not silently vanish")
            .await
            .unwrap_err();
        assert!(err.to_string().contains("ephemeral"));
    }
}
