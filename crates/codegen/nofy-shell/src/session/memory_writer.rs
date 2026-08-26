//! Shell-side `MemoryWriter` implementation for the `memory_write` tool.
//!
//! Wraps the session's memory storage + index: every successful write is
//! on disk AND reindexed (with embeddings when configured) before the tool
//! returns — the model can `memory_search` for a just-written entry in the
//! same session. Injection still happens only at the start of the next
//! session (frozen snapshot), which the tool output communicates.
//!
//! Boundedness: each store has a character budget. Single operations are
//! executed as one-op batches, so every write goes through the same
//! atomic apply-then-check-budget path; an over-budget result writes
//! nothing and reports the current content so the agent can free room
//! and retry in a single batch.

use std::path::PathBuf;

use nofy_config_types::MemoryBudgetConfig;
use nofy_tools::types::memory_writer::{MemoryOp, MemoryUsage, MemoryWriteOutcome, MemoryWriter};

use crate::session::memory::embedding::EmbeddingProvider;

/// The shell's memory writer: storage for file layout + optional backend
/// params for the index/embedding seam + store budgets.
pub(crate) struct ShellMemoryWriter {
    storage: crate::session::memory::MemoryStorage,
    backend_params: Option<crate::session::memory::MemoryBackendParams>,
    budget: MemoryBudgetConfig,
}

impl ShellMemoryWriter {
    pub(crate) fn new(
        storage: crate::session::memory::MemoryStorage,
        backend_params: Option<crate::session::memory::MemoryBackendParams>,
        budget: MemoryBudgetConfig,
    ) -> Self {
        Self {
            storage,
            backend_params,
            budget,
        }
    }

    fn scope_from_str(scope: &str) -> crate::session::memory::MemoryScope {
        match scope {
            "global" | "user" => crate::session::memory::MemoryScope::Global,
            _ => crate::session::memory::MemoryScope::Workspace,
        }
    }

    fn memory_file(&self, scope: &str) -> PathBuf {
        match scope {
            "global" => self.storage.global_memory_file(),
            "user" => self.storage.global_user_file(),
            _ => self.storage.workspace_memory_file(),
        }
    }

    fn budget_limit(&self, scope: &str) -> usize {
        match scope {
            "global" => self.budget.global_chars,
            "user" => self.budget.user_chars,
            _ => self.budget.workspace_chars,
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

/// Apply operations to `content` in order (pure string surgery). Returns
/// the new content and one summary line per applied operation.
fn apply_ops_to_content(
    scope: &str,
    content: &str,
    ops: &[MemoryOp],
) -> Result<(String, Vec<String>), String> {
    let mut current = content.to_string();
    let mut summaries = Vec::with_capacity(ops.len());
    for (i, op) in ops.iter().enumerate() {
        match op {
            MemoryOp::Add(entry) => {
                let normalized = crate::session::memory::storage::normalize_memory_content(entry);
                if normalized.is_empty() {
                    return Err(format!("operation {}: content must be non-empty", i + 1));
                }
                if current.trim().is_empty() {
                    current = normalized;
                } else {
                    current = format!("{}\n\n{}", current.trim_end(), normalized);
                }
                summaries.push(format!("added entry ({scope} scope)"));
            }
            MemoryOp::Replace { old, new } => {
                let matches = current.matches(old.as_str()).count();
                match matches {
                    0 => {
                        return Err(format!(
                            "operation {}: old_text not found in {scope} memory — read the file with memory_get first",
                            i + 1
                        ));
                    }
                    n if n > 1 => {
                        return Err(format!(
                            "operation {}: old_text matches {n} places in {scope} memory — use a longer unique substring",
                            i + 1
                        ));
                    }
                    _ => {}
                }
                current = current.replacen(old.as_str(), new, 1);
                summaries.push(format!("replaced entry ({scope} scope)"));
            }
            MemoryOp::Remove(old) => {
                let matches = current.matches(old.as_str()).count();
                match matches {
                    0 => {
                        return Err(format!(
                            "operation {}: old_text not found in {scope} memory — read the file with memory_get first",
                            i + 1
                        ));
                    }
                    n if n > 1 => {
                        return Err(format!(
                            "operation {}: old_text matches {n} places in {scope} memory — use a longer unique substring",
                            i + 1
                        ));
                    }
                    _ => {}
                }
                current = current.replacen(old.as_str(), "", 1);
                summaries.push(format!("removed entry ({scope} scope)"));
            }
        }
    }
    // Collapse blank-line seams removals can leave behind.
    while current.contains("\n\n\n") {
        current = current.replace("\n\n\n", "\n\n");
    }
    // Removing an entry's text from its bullet line can leave a bare
    // marker ("- ", "* ") behind; drop those lines too.
    let current = current
        .lines()
        .filter(|line| !matches!(line.trim(), "-" | "*" | "+"))
        .collect::<Vec<_>>()
        .join("\n");
    let current = current.trim().to_string();
    Ok((if current.is_empty() { String::new() } else { format!("{current}\n") }, summaries))
}

#[async_trait::async_trait]
impl MemoryWriter for ShellMemoryWriter {
    async fn add(&self, scope: &str, content: &str) -> Result<MemoryWriteOutcome, WriteError> {
        self.apply_batch(scope, &[MemoryOp::Add(content.to_string())])
            .await
    }

    async fn replace(
        &self,
        scope: &str,
        old_text: &str,
        content: &str,
    ) -> Result<MemoryWriteOutcome, WriteError> {
        self.apply_batch(
            scope,
            &[MemoryOp::Replace {
                old: old_text.to_string(),
                new: content.to_string(),
            }],
        )
        .await
    }

    async fn remove(&self, scope: &str, old_text: &str) -> Result<MemoryWriteOutcome, WriteError> {
        self.apply_batch(scope, &[MemoryOp::Remove(old_text.to_string())])
            .await
    }

    async fn apply_batch(
        &self,
        scope: &str,
        ops: &[MemoryOp],
    ) -> Result<MemoryWriteOutcome, WriteError> {
        if ops.is_empty() {
            return Err("no operations provided".into());
        }
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
        let path = self.memory_file(scope);
        let current = std::fs::read_to_string(&path).unwrap_or_default();
        let (updated, summaries) = apply_ops_to_content(scope, &current, ops)
            .map_err(|e| -> WriteError { e.into() })?;

        // Budget gate: enforced on the FINAL content only, so one batch can
        // free room and add in the same call.
        if self.budget.enabled {
            let limit = self.budget_limit(scope);
            if updated.chars().count() > limit {
                return Err(format!(
                    "memory budget exceeded: {scope} store would use {}/{} chars (limit {}). \
                     Current usage: {}/{}. Current content:\n{}\n\
                     Free room by removing or shortening stale entries, then reissue ONE batch \
                     (operations array) that frees room and adds the new entry together.",
                    updated.chars().count(),
                    limit,
                    limit,
                    current.chars().count(),
                    limit,
                    current.trim_end()
                )
                .into());
            }
        }

        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::write(&path, updated)?;
        self.reindex_and_embed(&path).await;
        Ok(MemoryWriteOutcome {
            path: path.display().to_string(),
            summary: format!(
                "Applied {} operation(s): {}",
                summaries.len(),
                summaries.join("; ")
            ),
        })
    }

    async fn usage(&self, scope: &str) -> Result<MemoryUsage, WriteError> {
        let path = self.memory_file(scope);
        let content = std::fs::read_to_string(&path).unwrap_or_default();
        Ok(MemoryUsage {
            used_chars: content.chars().count(),
            limit_chars: self.budget_limit(scope),
            content,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp_writer() -> (tempfile::TempDir, ShellMemoryWriter) {
        temp_writer_with_budget(MemoryBudgetConfig::default())
    }

    fn temp_writer_with_budget(
        budget: MemoryBudgetConfig,
    ) -> (tempfile::TempDir, ShellMemoryWriter) {
        let dir = tempfile::tempdir().expect("tempdir");
        let storage = crate::session::memory::MemoryStorage::with_paths(
            dir.path().join("global"),
            dir.path().join("workspace"),
        );
        (dir, ShellMemoryWriter::new(storage, None, budget))
    }

    #[tokio::test]
    async fn add_writes_file_and_reports_path() {
        let (_dir, writer) = temp_writer();
        let outcome = writer
            .add("workspace", "Build uses cargo-make, not plain cargo")
            .await
            .expect("add");
        assert!(outcome.summary.contains("added entry"));
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
        assert!(
            !content.lines().any(|l| matches!(l.trim(), "-" | "*" | "+")),
            "bare bullet marker left behind by removal: {content:?}"
        );
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
        let writer = ShellMemoryWriter::new(storage, None, MemoryBudgetConfig::default());
        let err = writer
            .add("workspace", "should not silently vanish")
            .await
            .unwrap_err();
        assert!(err.to_string().contains("ephemeral"));
    }

    #[tokio::test]
    async fn over_budget_add_is_rejected_with_current_content() {
        let budget = MemoryBudgetConfig {
            enabled: true,
            workspace_chars: 60,
            ..Default::default()
        };
        let (_dir, writer) = temp_writer_with_budget(budget);
        writer.add("workspace", "first fact").await.unwrap();
        let err = writer
            .add("workspace", "this entry is far too long to fit the remaining budget")
            .await
            .unwrap_err();
        let msg = err.to_string();
        assert!(msg.contains("budget exceeded"), "got: {msg}");
        assert!(msg.contains("first fact"), "rejection must show current content: {msg}");
        // Nothing was written.
        let content =
            std::fs::read_to_string(writer.storage.workspace_memory_file()).expect("read");
        assert!(!content.contains("far too long"));
    }

    #[tokio::test]
    async fn batch_can_free_room_and_add_in_one_call() {
        // Limit 40: lone add reaches 44 chars (overflow), but the batch that
        // removes "stale fact" first lands at 30 chars (fits).
        let budget = MemoryBudgetConfig {
            enabled: true,
            workspace_chars: 40,
            ..Default::default()
        };
        let (_dir, writer) = temp_writer_with_budget(budget);
        writer.add("workspace", "stale fact").await.unwrap();

        // A lone add would overflow, but a batch that removes first fits.
        let lone = writer.add("workspace", "a brand new important fact").await;
        assert!(lone.is_err(), "lone add must overflow the budget");

        let outcome = writer
            .apply_batch(
                "workspace",
                &[
                    MemoryOp::Remove("stale fact".to_string()),
                    MemoryOp::Add("a brand new important fact".to_string()),
                ],
            )
            .await
            .expect("batch should fit after freeing room");
        assert!(outcome.summary.contains("2 operation(s)"));
        let content =
            std::fs::read_to_string(writer.storage.workspace_memory_file()).expect("read");
        assert!(!content.contains("stale fact"));
        assert!(content.contains("brand new"));
    }

    #[tokio::test]
    async fn failed_batch_op_writes_nothing() {
        let (_dir, writer) = temp_writer();
        writer.add("workspace", "keeper").await.unwrap();
        let err = writer
            .apply_batch(
                "workspace",
                &[
                    MemoryOp::Add("would be added".to_string()),
                    MemoryOp::Remove("does not exist".to_string()),
                ],
            )
            .await
            .unwrap_err();
        assert!(err.to_string().contains("operation 2"));
        let content =
            std::fs::read_to_string(writer.storage.workspace_memory_file()).expect("read");
        assert!(!content.contains("would be added"), "atomic batch must roll back");
    }

    #[tokio::test]
    async fn budget_disabled_allows_unbounded() {
        let budget = MemoryBudgetConfig {
            enabled: false,
            workspace_chars: 10,
            ..Default::default()
        };
        let (_dir, writer) = temp_writer_with_budget(budget);
        writer
            .add("workspace", "much longer than ten characters")
            .await
            .expect("budget disabled → no enforcement");
    }

    #[tokio::test]
    async fn usage_reports_chars_and_limit() {
        let (_dir, writer) = temp_writer();
        writer.add("workspace", "hello world").await.unwrap();
        let usage = writer.usage("workspace").await.expect("usage");
        assert_eq!(usage.limit_chars, MemoryBudgetConfig::default().workspace_chars);
        assert!(usage.used_chars > 0);
        assert!(usage.content.contains("hello world"));
    }
}
