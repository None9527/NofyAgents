//! SQLite-backed memory index with FTS5 keyword search and optional sqlite-vec KNN.
//!
//! The index stores chunked text from memory files, with:
//! - A `chunks` table for structured metadata
//! - A contentless FTS5 virtual table for BM25 keyword search
//! - An optional `chunks_vec` vec0 table for vector similarity (when sqlite-vec is available)
//!
//! ## sqlite-vec Initialization
//!
//! Call [`init_sqlite_vec()`] once before creating any `MemoryIndex`.
//! This registers the sqlite-vec extension globally via `std::sync::Once`.

use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::sync::Once;

use nofy_sqlite_journal::JournalMode;
use rusqlite::{OptionalExtension, params};
use thiserror::Error;

use super::chunker::{chunk_hash, chunk_markdown};
use super::layout::{ScopeLayout, UnifiedMemoryLayout};
use super::model::{MemoryScope, Observation, ObservationKind, ProjectId, ProjectValidity};
use super::schema;
use super::storage::MemoryStorage;
use crate::config::MemoryIndexConfig;
pub(crate) mod semantic;

static SQLITE_VEC_INIT: Once = Once::new();

/// Register the sqlite-vec extension globally. Must be called before any
/// `MemoryIndex::open_or_create()`. Safe to call multiple times (Once guard).
pub fn init_sqlite_vec() {
    SQLITE_VEC_INIT.call_once(|| {
        // SAFETY: sqlite_vec::sqlite3_vec_init has the C ABI signature expected by
        // sqlite3_auto_extension. The explicit type annotation on transmute makes
        // this compiler-verified — if sqlite-vec changes its init signature, the
        // annotation will cause a compile error instead of silent UB.
        // We pin sqlite-vec to exact version =0.1.7-alpha.2; any bump must re-verify.
        unsafe {
            rusqlite::ffi::sqlite3_auto_extension(Some(std::mem::transmute::<
                *const (),
                unsafe extern "C" fn(
                    *mut rusqlite::ffi::sqlite3,
                    *mut *mut std::ffi::c_char,
                    *const rusqlite::ffi::sqlite3_api_routines,
                ) -> i32,
            >(
                sqlite_vec::sqlite3_vec_init as *const (),
            )));
        }
    });
}

/// A record from the `chunks` table.
#[derive(Debug, Clone)]
pub struct ChunkRecord {
    pub rowid: i64,
    pub id: String,
    pub path: String,
    pub start_line: usize,
    pub end_line: usize,
    pub text: String,
    pub hash: String,
    pub source: String,
    pub access_count: i64,
    pub created_at: i64,
}

/// Result of a FTS5 keyword search.
#[derive(Debug, Clone)]
pub struct FtsResult {
    pub chunk_id: String,
    pub rowid: i64,
    pub rank: f64,
}

/// Result of reindexing a file.
#[derive(Debug, Clone, Copy, Default)]
pub struct ReindexResult {
    pub added: usize,
    pub updated: usize,
    pub removed: usize,
}

/// Git validity used while searching the Personal + current Project indexes.
#[derive(Debug, Clone, Default, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct UnifiedSearchContext {
    pub git_ref: Option<String>,
    pub anchor_commit: Option<String>,
}

#[derive(Debug, Clone)]
pub(crate) struct IndexedObjectMetadata {
    pub object_kind: String,
    pub object_hash: String,
    pub canonical_path: String,
    pub validity_kind: String,
    pub git_ref: Option<String>,
    pub anchor_commit: Option<String>,
    pub observation_kind: Option<String>,
    pub observation_status: String,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct UnifiedRebuildResult {
    pub topics: usize,
    pub observations: usize,
    pub chunks: usize,
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct UnifiedRefreshStats {
    pub files_skipped: usize,
    pub files_hashed: usize,
    pub files_reindexed: usize,
    pub files_removed: usize,
}

#[derive(Debug, Error)]
pub enum UnifiedIndexError {
    #[error("unified index database failed: {0}")]
    Database(#[from] rusqlite::Error),
    #[error("unified index I/O failed: {0}")]
    Io(#[from] std::io::Error),
    #[error("invalid canonical observation: {0}")]
    Observation(#[from] serde_json::Error),
}

/// Pair of rebuildable per-scope indexes used by the single memory system.
/// Canonical Markdown and the state ledgers remain the source of truth.
pub struct UnifiedMemoryIndex {
    layout: UnifiedMemoryLayout,
    project_id: ProjectId,
    personal: MemoryIndex,
    project: MemoryIndex,
}

/// SQLite-backed memory index.
pub struct MemoryIndex {
    db: rusqlite::Connection,
    #[expect(dead_code, reason = "used by later PRs for reindex_all / file reads")]
    storage: MemoryStorage,
    chunk_config: MemoryIndexConfig,
    /// Whether sqlite-vec loaded successfully (FTS always available).
    vec_available: bool,
    embedding_dimensions: usize,
    last_refresh_stats: UnifiedRefreshStats,
}

impl UnifiedMemoryIndex {
    pub fn open(
        root: &Path,
        project_id: ProjectId,
        config: MemoryIndexConfig,
        dimensions: usize,
    ) -> Result<Self, UnifiedIndexError> {
        let layout = UnifiedMemoryLayout::new(root);
        let personal_scope = layout.personal_scope();
        let project_scope = layout.project_scope(project_id);
        std::fs::create_dir_all(personal_scope.root())?;
        std::fs::create_dir_all(project_scope.root())?;
        let personal = MemoryIndex::open_or_create(
            &personal_scope.root().join("index.sqlite"),
            MemoryStorage::new_flat(personal_scope.root(), personal_scope.root()),
            config.clone(),
            dimensions,
        )?;
        let project = MemoryIndex::open_or_create(
            &project_scope.root().join("index.sqlite"),
            MemoryStorage::new_flat(project_scope.root(), project_scope.root()),
            config,
            dimensions,
        )?;
        Ok(Self {
            layout,
            project_id,
            personal,
            project,
        })
    }

    pub fn rebuild(&mut self) -> Result<UnifiedRebuildResult, UnifiedIndexError> {
        let personal_scope = self.layout.personal_scope();
        let project_scope = self.layout.project_scope(self.project_id);
        let personal = self
            .personal
            .rebuild_unified_scope(&personal_scope, &MemoryScope::Personal)?;
        let project = self
            .project
            .rebuild_unified_scope(&project_scope, &MemoryScope::Project(self.project_id))?;
        Ok(UnifiedRebuildResult {
            topics: personal.topics + project.topics,
            observations: personal.observations + project.observations,
            chunks: personal.chunks + project.chunks,
        })
    }

    /// Incrementally refresh only files or status ledgers that changed.
    pub fn refresh(&mut self) -> Result<UnifiedRebuildResult, UnifiedIndexError> {
        let personal_scope = self.layout.personal_scope();
        let project_scope = self.layout.project_scope(self.project_id);
        let personal = self
            .personal
            .refresh_unified_scope(&personal_scope, &MemoryScope::Personal)?;
        let project = self
            .project
            .refresh_unified_scope(&project_scope, &MemoryScope::Project(self.project_id))?;
        Ok(UnifiedRebuildResult {
            topics: personal.topics + project.topics,
            observations: personal.observations + project.observations,
            chunks: personal.chunks + project.chunks,
        })
    }

    pub fn last_refresh_stats(&self) -> UnifiedRefreshStats {
        UnifiedRefreshStats {
            files_skipped: self.personal.last_refresh_stats.files_skipped
                + self.project.last_refresh_stats.files_skipped,
            files_hashed: self.personal.last_refresh_stats.files_hashed
                + self.project.last_refresh_stats.files_hashed,
            files_reindexed: self.personal.last_refresh_stats.files_reindexed
                + self.project.last_refresh_stats.files_reindexed,
            files_removed: self.personal.last_refresh_stats.files_removed
                + self.project.last_refresh_stats.files_removed,
        }
    }

    pub fn repair_required(&self) -> bool {
        self.personal.repair_required() || self.project.repair_required()
    }

    pub fn repair(&mut self) -> Result<UnifiedRebuildResult, UnifiedIndexError> {
        self.rebuild()
    }

    pub fn delete_derived_indexes(
        root: &Path,
        project_id: ProjectId,
    ) -> Result<(), std::io::Error> {
        let layout = UnifiedMemoryLayout::new(root);
        for scope in [layout.personal_scope(), layout.project_scope(project_id)] {
            let database = scope.root().join("index.sqlite");
            let mut candidates = vec![database.clone()];
            for mode in [JournalMode::for_db_path(&database), JournalMode::Truncate] {
                let effective = mode.effective_db_path(&database);
                if !candidates.contains(&effective) {
                    candidates.push(effective);
                }
            }
            for db in candidates {
                let mut paths = vec![db.clone()];
                for suffix in ["-journal", "-wal", "-shm"] {
                    let mut sidecar = db.as_os_str().to_os_string();
                    sidecar.push(suffix);
                    paths.push(PathBuf::from(sidecar));
                }
                for path in paths {
                    match std::fs::remove_file(path) {
                        Ok(()) => {}
                        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}
                        Err(error) => return Err(error),
                    }
                }
            }
        }
        Ok(())
    }

    pub(crate) fn indexes(&self) -> [&MemoryIndex; 2] {
        [&self.personal, &self.project]
    }
}

impl MemoryIndex {
    /// Open or create the index database at `db_path`.
    ///
    /// `dimensions` sets the embedding vector size for the `chunks_vec` table.
    /// If sqlite-vec failed to load (call `init_sqlite_vec()` first), the
    /// index gracefully degrades to FTS-only mode.
    pub fn open_or_create(
        db_path: &Path,
        storage: MemoryStorage,
        config: MemoryIndexConfig,
        dimensions: usize,
    ) -> Result<Self, rusqlite::Error> {
        // Ensure parent directory exists
        if let Some(parent) = db_path.parent() {
            let _ = std::fs::create_dir_all(parent);
        }

        // The mode decision statfs's the parent dir created above.
        Self::open_or_create_with_journal_mode(
            db_path,
            storage,
            config,
            dimensions,
            JournalMode::for_db_path(db_path),
        )
    }

    /// Open with an explicit journal mode — the seam tests use to exercise
    /// the network-filesystem decision on a local disk.
    fn open_or_create_with_journal_mode(
        db_path: &Path,
        storage: MemoryStorage,
        config: MemoryIndexConfig,
        dimensions: usize,
        journal_mode: JournalMode,
    ) -> Result<Self, rusqlite::Error> {
        // busy_timeout + journal pragma live in the helper (see JournalMode::open).
        let db = journal_mode.open(db_path)?;

        // Check if sqlite-vec loaded (graceful fallback if not)
        let vec_available =
            match db.query_row("SELECT vec_version()", [], |r| r.get::<_, String>(0)) {
                Ok(v) => {
                    tracing::info!(version = %v, "sqlite-vec loaded");
                    true
                }
                Err(_) => {
                    static WARNED: std::sync::Once = std::sync::Once::new();
                    WARNED.call_once(|| {
                        tracing::warn!("sqlite-vec not available, falling back to FTS-only search");
                    });
                    false
                }
            };

        // Create schema
        db.execute_batch(&schema::schema_sql(dimensions, vec_available))?;

        // Existing legacy indexes are upgraded in place. These columns are
        // derivative metadata only; canonical objects remain in Markdown +
        // the scope ledger and can always rebuild the database from scratch.
        for (name, definition) in [
            ("origin", "TEXT NOT NULL DEFAULT 'agent'"),
            ("object_id", "TEXT NOT NULL DEFAULT ''"),
            ("object_kind", "TEXT NOT NULL DEFAULT 'legacy'"),
            ("scope_kind", "TEXT NOT NULL DEFAULT 'legacy'"),
            ("project_id", "TEXT"),
            ("validity_kind", "TEXT NOT NULL DEFAULT 'project_wide'"),
            ("git_ref", "TEXT"),
            ("anchor_commit", "TEXT"),
            ("revision", "INTEGER NOT NULL DEFAULT 0"),
            ("object_hash", "TEXT NOT NULL DEFAULT ''"),
            ("observation_kind", "TEXT"),
            ("observation_status", "TEXT NOT NULL DEFAULT 'active'"),
        ] {
            ensure_column(&db, "chunks", name, definition)?;
        }
        db.execute_batch(
            "CREATE INDEX IF NOT EXISTS idx_chunks_object ON chunks(object_id, object_kind);
             CREATE INDEX IF NOT EXISTS idx_chunks_scope ON chunks(scope_kind, project_id);
             CREATE TABLE IF NOT EXISTS indexed_files (
                 path TEXT PRIMARY KEY,
                 file_kind TEXT NOT NULL,
                 size INTEGER NOT NULL,
                 mtime_secs INTEGER NOT NULL,
                 mtime_nanos INTEGER NOT NULL,
                 content_hash TEXT NOT NULL,
                 indexed_at_secs INTEGER NOT NULL,
                 indexed_at_nanos INTEGER NOT NULL
             );",
        )?;

        // Store/verify embedding dimensions in meta table
        let stored_dims: Option<String> = db
            .query_row(schema::GET_META_SQL, params!["embedding_dimensions"], |r| {
                r.get(0)
            })
            .ok();

        match stored_dims {
            Some(ref s) if s.parse::<usize>().ok() == Some(dimensions) => {
                // Dimensions match — nothing to do
            }
            Some(ref s) => {
                // Dimension mismatch — recreate vec table
                tracing::warn!(
                    stored = %s,
                    requested = dimensions,
                    "embedding dimension mismatch, recreating chunks_vec"
                );
                if vec_available {
                    let _ = db.execute("DROP TABLE IF EXISTS chunks_vec", []);
                    db.execute_batch(&format!(
                        "CREATE VIRTUAL TABLE IF NOT EXISTS chunks_vec USING vec0(\n    \
                         chunk_id TEXT PRIMARY KEY,\n    \
                         embedding FLOAT[{dimensions}]\n);"
                    ))?;
                }
                db.execute(
                    schema::UPSERT_META_SQL,
                    params!["embedding_dimensions", dimensions.to_string()],
                )?;
            }
            None => {
                // First time — store dimensions
                db.execute(
                    schema::UPSERT_META_SQL,
                    params!["embedding_dimensions", dimensions.to_string()],
                )?;
            }
        }

        Ok(Self {
            db,
            storage,
            chunk_config: config,
            vec_available,
            embedding_dimensions: dimensions,
            last_refresh_stats: UnifiedRefreshStats::default(),
        })
    }

    /// Whether sqlite-vec is available for vector operations.
    pub fn vec_available(&self) -> bool {
        self.vec_available
    }

    /// Embedding dimensions configured for this index.
    pub fn embedding_dimensions(&self) -> usize {
        self.embedding_dimensions
    }

    /// Direct access to the underlying SQLite connection (test-only).
    #[cfg(test)]
    pub(crate) fn db(&self) -> &rusqlite::Connection {
        &self.db
    }

    // -----------------------------------------------------------------------
    // Indexing
    // -----------------------------------------------------------------------

    /// Reindex a single memory file. Compares chunk hashes to avoid redundant work.
    ///
    /// `source` should be `"global"`, `"workspace"`, or `"session"`.
    pub fn reindex_file(
        &mut self,
        path: &Path,
        source: &str,
        origin: &str,
    ) -> Result<ReindexResult, rusqlite::Error> {
        let content = match std::fs::read_to_string(path) {
            Ok(c) => c,
            Err(e) => {
                tracing::warn!(path = %path.display(), error = %e, "failed to read file for reindexing");
                return Ok(ReindexResult::default());
            }
        };

        let new_chunks = chunk_markdown(&content, &self.chunk_config);
        let path_str = path.to_string_lossy().to_string();

        // Load existing chunks for this path
        let existing = self.get_chunks_for_path(&path_str)?;

        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64;

        let mut result = ReindexResult::default();
        let mut seen_ids = std::collections::HashSet::new();

        // Wrap all mutations in a transaction so partial failures don't leave
        // the index inconsistent between chunks, FTS, and vec tables.
        let tx = self.db.transaction()?;

        for (i, chunk) in new_chunks.iter().enumerate() {
            let chunk_id = format!("{}:{}", path_str, i);
            let hash = chunk_hash(&chunk.text);
            seen_ids.insert(chunk_id.clone());

            match existing.get(&chunk_id) {
                Some(old) if old.hash == hash => {
                    // Unchanged — skip
                }
                Some(old) => {
                    // Changed: update chunk, delete stale FTS entry, insert new one
                    tx.execute(
                        "UPDATE chunks SET text = ?1, hash = ?2, start_line = ?3, \
                         end_line = ?4, updated_at = ?5, origin = ?6 WHERE id = ?7",
                        params![
                            chunk.text,
                            hash,
                            chunk.start_line,
                            chunk.end_line,
                            now,
                            origin,
                            chunk_id
                        ],
                    )?;
                    // Delete old FTS entry and insert new one
                    tx.execute(
                        "INSERT INTO chunks_fts(chunks_fts, rowid, text) VALUES('delete', ?1, ?2)",
                        params![old.rowid, old.text],
                    )?;
                    let new_rowid: Option<i64> = tx
                        .query_row(
                            "SELECT rowid FROM chunks WHERE id = ?1",
                            params![chunk_id],
                            |row| row.get(0),
                        )
                        .ok();
                    if let Some(rid) = new_rowid {
                        tx.execute(
                            "INSERT INTO chunks_fts(rowid, text) VALUES (?1, ?2)",
                            params![rid, chunk.text],
                        )?;
                    }
                    // Delete stale embedding (will be re-embedded later)
                    if self.vec_available {
                        let _ = tx.execute(
                            "DELETE FROM chunks_vec WHERE chunk_id = ?1",
                            params![chunk_id],
                        );
                    }
                    result.updated += 1;
                }
                None => {
                    // New chunk
                    tx.execute(
                        "INSERT INTO chunks (id, path, start_line, end_line, text, hash, source, \
                         origin, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
                        params![
                            chunk_id,
                            path_str,
                            chunk.start_line,
                            chunk.end_line,
                            chunk.text,
                            hash,
                            source,
                            origin,
                            now,
                            now,
                        ],
                    )?;
                    let rowid = tx.last_insert_rowid();
                    tx.execute(
                        "INSERT INTO chunks_fts(rowid, text) VALUES (?1, ?2)",
                        params![rowid, chunk.text],
                    )?;
                    result.added += 1;
                }
            }
        }

        // Delete chunks no longer in file
        for (old_id, old_record) in &existing {
            if !seen_ids.contains(old_id) {
                tx.execute(
                    "INSERT INTO chunks_fts(chunks_fts, rowid, text) VALUES('delete', ?1, ?2)",
                    params![old_record.rowid, old_record.text],
                )?;
                if self.vec_available {
                    let _ = tx.execute(
                        "DELETE FROM chunks_vec WHERE chunk_id = ?1",
                        params![old_id],
                    );
                }
                tx.execute("DELETE FROM chunks WHERE id = ?1", params![old_id])?;
                result.removed += 1;
            }
        }

        tx.commit()?;
        Ok(result)
    }

    fn rebuild_unified_scope(
        &mut self,
        scope_layout: &ScopeLayout,
        scope: &MemoryScope,
    ) -> Result<UnifiedRebuildResult, UnifiedIndexError> {
        self.last_refresh_stats = UnifiedRefreshStats::default();
        let now = current_file_timestamp();
        let mut topics = Vec::new();
        collect_markdown_files(&scope_layout.topics_directory(), &mut topics)?;
        topics.sort();

        let mut observation_files = Vec::new();
        collect_markdown_files(
            &scope_layout.observations_directory(),
            &mut observation_files,
        )?;
        observation_files.sort();
        let statuses = read_observation_statuses(&scope_layout.state_database())?;
        let statuses_hash = hash_observation_statuses(&statuses);

        let mut final_hashes = Vec::with_capacity(topics.len() + observation_files.len());
        let mut parsed_topics = Vec::with_capacity(topics.len());
        for path in topics {
            let stat = stat_file(&path)?;
            let bytes = std::fs::read(&path)?;
            let content_hash = hash_bytes(&bytes);
            let path_str = path.to_string_lossy().into_owned();
            self.last_refresh_stats.files_hashed += 1;
            final_hashes.push((path_str.clone(), content_hash.clone()));
            parsed_topics.push((path, path_str, bytes, content_hash, stat));
        }

        let mut observation_records = Vec::with_capacity(observation_files.len());
        let mut all_obs_files = Vec::with_capacity(observation_files.len());
        for path in observation_files {
            let stat = stat_file(&path)?;
            let bytes = std::fs::read(&path)?;
            let content_hash = hash_bytes(&bytes);
            let path_str = path.to_string_lossy().into_owned();
            self.last_refresh_stats.files_hashed += 1;
            final_hashes.push((path_str.clone(), content_hash.clone()));
            all_obs_files.push((path_str, stat, content_hash.clone()));
            let observation: Observation = serde_json::from_str(&observation_json(&bytes)?)?;
            if &observation.scope != scope {
                tracing::warn!(path = %path.display(), "ignoring observation stored in the wrong scope");
                continue;
            }
            let status = statuses
                .get(&observation.id.as_uuid().to_string())
                .cloned()
                .unwrap_or_else(|| "active".to_owned());
            observation_records.push((path, content_hash, observation, status));
        }

        let fingerprint = fingerprint_from_hashes(&mut final_hashes, &statuses);
        let superseded = superseded_observation_ids(&observation_records);

        self.clear_derived_index()?;
        let mut result = UnifiedRebuildResult::default();
        let tx = self.db.transaction()?;
        for (path, path_str, bytes, content_hash, stat) in parsed_topics {
            result.chunks += insert_topic_in_tx(
                &tx,
                &self.chunk_config,
                scope_layout,
                scope,
                &path,
                &bytes,
                &content_hash,
            )?;
            upsert_indexed_file_in_tx(&tx, &path_str, "topic", stat, &content_hash, now)?;
            result.topics += 1;
            self.last_refresh_stats.files_reindexed += 1;
        }
        for (path, content_hash, observation, mut status) in observation_records {
            if superseded.contains(&observation.id.as_uuid().to_string()) {
                status = "superseded".to_owned();
            }
            result.chunks += insert_unified_text_in_tx(
                &tx,
                &self.chunk_config,
                &UnifiedDocument {
                    path: &path,
                    object_id: &observation.id.as_uuid().to_string(),
                    object_kind: "observation",
                    scope,
                    validity: observation.project_validity.as_ref(),
                    revision: 1,
                    object_hash: &content_hash,
                    observation_kind: Some(observation_kind_name(observation.kind)),
                    observation_status: &status,
                    text: &observation.statement,
                    created_at: observation.created_at.timestamp(),
                },
            )?;
            result.observations += 1;
            self.last_refresh_stats.files_reindexed += 1;
        }
        for (path_str, stat, content_hash) in all_obs_files {
            upsert_indexed_file_in_tx(&tx, &path_str, "observation", stat, &content_hash, now)?;
        }
        tx.execute(schema::UPSERT_META_SQL, params!["repair_required", "0"])?;
        tx.execute(schema::UPSERT_META_SQL, params!["indexed_files_ready", "1"])?;
        tx.execute(
            schema::UPSERT_META_SQL,
            params!["observation_statuses_hash", statuses_hash],
        )?;
        tx.execute(
            schema::UPSERT_META_SQL,
            params!["canonical_fingerprint", fingerprint],
        )?;
        tx.commit()?;
        Ok(result)
    }

    fn refresh_unified_scope(
        &mut self,
        scope_layout: &ScopeLayout,
        scope: &MemoryScope,
    ) -> Result<UnifiedRebuildResult, UnifiedIndexError> {
        if self.repair_required() || !self.indexed_files_ready()? {
            return self.rebuild_unified_scope(scope_layout, scope);
        }
        self.last_refresh_stats = UnifiedRefreshStats::default();
        let now = current_file_timestamp();
        let mut topic_paths = Vec::new();
        collect_markdown_files(&scope_layout.topics_directory(), &mut topic_paths)?;
        topic_paths.sort();

        let mut obs_paths = Vec::new();
        collect_markdown_files(&scope_layout.observations_directory(), &mut obs_paths)?;
        obs_paths.sort();

        let cached_files = self.load_indexed_files()?;
        let statuses = read_observation_statuses(&scope_layout.state_database())?;
        let statuses_hash = hash_observation_statuses(&statuses);
        let stored_statuses_hash: Option<String> = self
            .db
            .query_row(schema::GET_META_SQL, ["observation_statuses_hash"], |row| {
                row.get(0)
            })
            .optional()?;
        let statuses_changed = stored_statuses_hash.as_deref() != Some(statuses_hash.as_str());

        let mut seen_paths = HashSet::with_capacity(topic_paths.len() + obs_paths.len());
        let mut final_hashes = Vec::with_capacity(topic_paths.len() + obs_paths.len());
        let mut dirty_topics = Vec::new();
        let mut stat_updates = Vec::new();

        for path in topic_paths {
            let path_str = path.to_string_lossy().into_owned();
            seen_paths.insert(path_str.clone());
            let stat = stat_file(&path)?;
            if let Some(cached) = cached_files.get(&path_str)
                && can_skip_hash(cached, "topic", stat, now)
            {
                self.last_refresh_stats.files_skipped += 1;
                final_hashes.push((path_str, cached.content_hash.clone()));
                continue;
            }
            let bytes = std::fs::read(&path)?;
            let content_hash = hash_bytes(&bytes);
            self.last_refresh_stats.files_hashed += 1;
            final_hashes.push((path_str.clone(), content_hash.clone()));
            if let Some(cached) = cached_files.get(&path_str)
                && cached.file_kind == "topic"
                && cached.content_hash == content_hash
            {
                if let Some(stat) = stat
                    && !stat.is_symlink
                {
                    stat_updates.push((path_str, "topic", stat, content_hash));
                }
            } else {
                dirty_topics.push((path, path_str, bytes, content_hash, stat));
            }
        }

        let mut obs_dirty = false;
        let mut obs_prefetched: HashMap<String, (Vec<u8>, String, Option<FileStat>)> =
            HashMap::new();
        for path in &obs_paths {
            let path_str = path.to_string_lossy().into_owned();
            seen_paths.insert(path_str.clone());
            let stat = stat_file(path)?;
            if let Some(cached) = cached_files.get(&path_str)
                && can_skip_hash(cached, "observation", stat, now)
            {
                self.last_refresh_stats.files_skipped += 1;
                final_hashes.push((path_str, cached.content_hash.clone()));
                continue;
            }
            let bytes = std::fs::read(path)?;
            let content_hash = hash_bytes(&bytes);
            self.last_refresh_stats.files_hashed += 1;
            final_hashes.push((path_str.clone(), content_hash.clone()));
            if let Some(cached) = cached_files.get(&path_str)
                && cached.file_kind == "observation"
                && cached.content_hash == content_hash
            {
                if let Some(stat) = stat
                    && !stat.is_symlink
                {
                    stat_updates.push((
                        path_str.clone(),
                        "observation",
                        stat,
                        content_hash.clone(),
                    ));
                }
            } else {
                obs_dirty = true;
            }
            obs_prefetched.insert(path_str, (bytes, content_hash, stat));
        }

        let mut removed_topics = Vec::new();
        let mut removed_obs_count = 0usize;
        for (path_str, record) in &cached_files {
            if !seen_paths.contains(path_str) {
                if record.file_kind == "topic" {
                    removed_topics.push(path_str.clone());
                } else {
                    removed_obs_count += 1;
                    obs_dirty = true;
                }
            }
        }

        let fingerprint = fingerprint_from_hashes(&mut final_hashes, &statuses);
        let stored_fp: Option<String> = self
            .db
            .query_row(schema::GET_META_SQL, ["canonical_fingerprint"], |row| {
                row.get(0)
            })
            .optional()?;
        let needs_obs_sync = obs_dirty || statuses_changed;

        if dirty_topics.is_empty() && removed_topics.is_empty() && !needs_obs_sync {
            if stored_fp.as_deref() != Some(fingerprint.as_str()) {
                return self.rebuild_unified_scope(scope_layout, scope);
            }
            if !stat_updates.is_empty() {
                let tx = self.db.transaction()?;
                for (path_str, kind, stat, content_hash) in stat_updates {
                    upsert_indexed_file_in_tx(
                        &tx,
                        &path_str,
                        kind,
                        Some(stat),
                        &content_hash,
                        now,
                    )?;
                }
                tx.commit()?;
            }
            return Ok(UnifiedRebuildResult::default());
        }

        let obs_rebuild = if needs_obs_sync {
            let mut observation_records = Vec::with_capacity(obs_paths.len());
            let mut all_obs_files = Vec::with_capacity(obs_paths.len());
            for path in obs_paths {
                let path_str = path.to_string_lossy().into_owned();
                let (bytes, content_hash, stat) = match obs_prefetched.remove(&path_str) {
                    Some(existing) => existing,
                    None => {
                        let stat = stat_file(&path)?;
                        let bytes = std::fs::read(&path)?;
                        let content_hash = hash_bytes(&bytes);
                        self.last_refresh_stats.files_hashed += 1;
                        (bytes, content_hash, stat)
                    }
                };
                all_obs_files.push((path_str, stat, content_hash.clone()));
                let observation: Observation = serde_json::from_str(&observation_json(&bytes)?)?;
                if &observation.scope != scope {
                    tracing::warn!(path = %path.display(), "ignoring observation stored in the wrong scope");
                    continue;
                }
                let status = statuses
                    .get(&observation.id.as_uuid().to_string())
                    .cloned()
                    .unwrap_or_else(|| "active".to_owned());
                observation_records.push((path, content_hash, observation, status));
            }
            Some((observation_records, all_obs_files))
        } else {
            None
        };

        let mut result = UnifiedRebuildResult::default();
        let tx = self.db.transaction()?;
        for path_str in &removed_topics {
            delete_path_in_tx(&tx, self.vec_available, path_str)?;
            tx.execute("DELETE FROM indexed_files WHERE path = ?1", [path_str])?;
            self.last_refresh_stats.files_removed += 1;
        }
        for (path, path_str, bytes, content_hash, stat) in dirty_topics {
            delete_path_in_tx(&tx, self.vec_available, &path_str)?;
            result.chunks += insert_topic_in_tx(
                &tx,
                &self.chunk_config,
                scope_layout,
                scope,
                &path,
                &bytes,
                &content_hash,
            )?;
            upsert_indexed_file_in_tx(&tx, &path_str, "topic", stat, &content_hash, now)?;
            result.topics += 1;
            self.last_refresh_stats.files_reindexed += 1;
        }
        if let Some((observation_records, all_obs_files)) = obs_rebuild {
            let existing_obs_paths = {
                let mut stmt = tx.prepare(
                    "SELECT DISTINCT path FROM chunks WHERE origin = 'canonical' AND object_kind = 'observation'",
                )?;
                stmt.query_map([], |row| row.get::<_, String>(0))?
                    .collect::<Result<Vec<_>, _>>()?
            };
            for path_str in existing_obs_paths {
                delete_path_in_tx(&tx, self.vec_available, &path_str)?;
            }
            tx.execute(
                "DELETE FROM indexed_files WHERE file_kind = 'observation'",
                [],
            )?;
            self.last_refresh_stats.files_removed += removed_obs_count;
            let superseded = superseded_observation_ids(&observation_records);
            for (path, content_hash, observation, mut status) in observation_records {
                if superseded.contains(&observation.id.as_uuid().to_string()) {
                    status = "superseded".to_owned();
                }
                result.chunks += insert_unified_text_in_tx(
                    &tx,
                    &self.chunk_config,
                    &UnifiedDocument {
                        path: &path,
                        object_id: &observation.id.as_uuid().to_string(),
                        object_kind: "observation",
                        scope,
                        validity: observation.project_validity.as_ref(),
                        revision: 1,
                        object_hash: &content_hash,
                        observation_kind: Some(observation_kind_name(observation.kind)),
                        observation_status: &status,
                        text: &observation.statement,
                        created_at: observation.created_at.timestamp(),
                    },
                )?;
                result.observations += 1;
                self.last_refresh_stats.files_reindexed += 1;
            }
            for (path_str, stat, content_hash) in all_obs_files {
                upsert_indexed_file_in_tx(&tx, &path_str, "observation", stat, &content_hash, now)?;
            }
        }
        for (path_str, kind, stat, content_hash) in stat_updates {
            if kind == "topic" || !needs_obs_sync {
                upsert_indexed_file_in_tx(&tx, &path_str, kind, Some(stat), &content_hash, now)?;
            }
        }
        tx.execute(schema::UPSERT_META_SQL, params!["repair_required", "0"])?;
        tx.execute(schema::UPSERT_META_SQL, params!["indexed_files_ready", "1"])?;
        tx.execute(
            schema::UPSERT_META_SQL,
            params!["observation_statuses_hash", statuses_hash],
        )?;
        tx.execute(
            schema::UPSERT_META_SQL,
            params!["canonical_fingerprint", fingerprint],
        )?;
        tx.commit()?;
        Ok(result)
    }

    fn indexed_files_ready(&self) -> Result<bool, rusqlite::Error> {
        let ready: Option<String> = self
            .db
            .query_row(schema::GET_META_SQL, ["indexed_files_ready"], |row| {
                row.get(0)
            })
            .optional()?;
        Ok(ready.as_deref() == Some("1"))
    }

    fn load_indexed_files(&self) -> Result<HashMap<String, IndexedFileRecord>, rusqlite::Error> {
        let mut stmt = self.db.prepare(
            "SELECT path, file_kind, size, mtime_secs, mtime_nanos, content_hash, indexed_at_secs, indexed_at_nanos
             FROM indexed_files",
        )?;
        let rows = stmt.query_map([], |row| {
            let mtime_nanos = u32::try_from(row.get::<_, i64>(4)?).unwrap_or(0);
            let indexed_at_nanos = u32::try_from(row.get::<_, i64>(7)?).unwrap_or(0);
            Ok((
                row.get::<_, String>(0)?,
                IndexedFileRecord {
                    file_kind: row.get(1)?,
                    size: row.get(2)?,
                    mtime: FileTimestamp {
                        secs: row.get(3)?,
                        nanos: mtime_nanos,
                    },
                    content_hash: row.get(5)?,
                    indexed_at: FileTimestamp {
                        secs: row.get(6)?,
                        nanos: indexed_at_nanos,
                    },
                },
            ))
        })?;
        let mut map = HashMap::new();
        for row in rows {
            let (path, record) = row?;
            map.insert(path, record);
        }
        Ok(map)
    }

    fn clear_derived_index(&mut self) -> Result<(), rusqlite::Error> {
        let transaction = self.db.transaction()?;
        transaction.execute(schema::UPSERT_META_SQL, params!["repair_required", "1"])?;
        transaction.execute(
            "DELETE FROM meta WHERE key IN ('indexed_files_ready', 'observation_statuses_hash', 'canonical_fingerprint')",
            [],
        )?;
        transaction.execute(
            "INSERT INTO chunks_fts(chunks_fts) VALUES('delete-all')",
            [],
        )?;
        if self.vec_available {
            transaction.execute("DELETE FROM chunks_vec", [])?;
        }
        transaction.execute("DELETE FROM chunks", [])?;
        transaction.execute("DELETE FROM indexed_files", [])?;
        transaction.commit()
    }

    pub(crate) fn chunk_is_eligible(&self, chunk_id: &str, context: &UnifiedSearchContext) -> bool {
        let Some(metadata) = self.object_metadata(chunk_id).ok().flatten() else {
            return false;
        };
        if metadata.object_kind == "legacy" {
            return true;
        }
        if metadata.object_kind == "observation" && metadata.observation_status != "active" {
            return false;
        }
        if metadata.validity_kind == "branch_local"
            && (metadata.git_ref.as_ref() != context.git_ref.as_ref()
                || metadata.anchor_commit.as_ref() != context.anchor_commit.as_ref())
        {
            return false;
        }
        let hash_matches = std::fs::read(&metadata.canonical_path)
            .is_ok_and(|bytes| hash_bytes(&bytes) == metadata.object_hash);
        if !hash_matches {
            let _ = self
                .db
                .execute(schema::UPSERT_META_SQL, params!["repair_required", "1"]);
            return false;
        }
        true
    }

    pub(crate) fn object_priority(&self, chunk_id: &str) -> f64 {
        match self
            .object_metadata(chunk_id)
            .ok()
            .flatten()
            .and_then(|metadata| metadata.observation_kind)
            .as_deref()
        {
            Some("user_correction") => 1.35,
            Some("explicit") => 1.20,
            _ => 1.0,
        }
    }

    fn object_metadata(
        &self,
        chunk_id: &str,
    ) -> Result<Option<IndexedObjectMetadata>, rusqlite::Error> {
        self.db
            .query_row(
                "SELECT object_kind, object_hash, path, validity_kind, git_ref,
                        anchor_commit, observation_kind, observation_status
                 FROM chunks WHERE id = ?1",
                [chunk_id],
                |row| {
                    Ok(IndexedObjectMetadata {
                        object_kind: row.get(0)?,
                        object_hash: row.get(1)?,
                        canonical_path: row.get(2)?,
                        validity_kind: row.get(3)?,
                        git_ref: row.get(4)?,
                        anchor_commit: row.get(5)?,
                        observation_kind: row.get(6)?,
                        observation_status: row.get(7)?,
                    })
                },
            )
            .optional()
    }

    fn repair_required(&self) -> bool {
        self.db
            .query_row(schema::GET_META_SQL, ["repair_required"], |row| {
                row.get::<_, String>(0)
            })
            .is_ok_and(|value| value == "1")
    }

    // -----------------------------------------------------------------------
    // Search
    // -----------------------------------------------------------------------

    /// FTS5 keyword search. Returns results ranked by BM25 score.
    ///
    /// Applies stop word filtering to improve precision for conversational
    /// queries. When all words are stop words, returns empty results — the
    /// caller (`hybrid_search`) falls back to the vector search path.
    pub fn search_fts_by_sources(
        &self,
        query: &str,
        limit: usize,
        sources: &[&str],
    ) -> Result<Vec<FtsResult>, rusqlite::Error> {
        if sources.is_empty() {
            return Ok(vec![]);
        }
        let keywords = super::query_expansion::extract_keywords(query);
        let fts_query = keywords.join(" OR ");
        if fts_query.is_empty() {
            return Ok(vec![]);
        }

        let placeholders: Vec<String> = sources
            .iter()
            .enumerate()
            .map(|(i, _)| format!("?{}", i + 3))
            .collect();
        let sql = format!(
            "SELECT f.rowid, f.rank FROM chunks_fts f \
             JOIN chunks c ON f.rowid = c.rowid \
             WHERE chunks_fts MATCH ?1 AND c.source IN ({}) \
             ORDER BY f.rank LIMIT ?2",
            placeholders.join(", ")
        );
        let mut stmt = self.db.prepare(&sql)?;
        let mut params_vec: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();
        params_vec.push(Box::new(fts_query));
        params_vec.push(Box::new(limit as i64));
        for s in sources {
            params_vec.push(Box::new(s.to_string()));
        }
        let param_refs: Vec<&dyn rusqlite::types::ToSql> =
            params_vec.iter().map(|p| p.as_ref()).collect();

        let rows = stmt
            .query_map(param_refs.as_slice(), |row| {
                Ok((row.get::<_, i64>(0)?, row.get::<_, f64>(1)?))
            })?
            .collect::<Result<Vec<_>, _>>()?;

        self.resolve_fts_rowids(rows)
    }

    pub fn search_fts(&self, query: &str, limit: usize) -> Result<Vec<FtsResult>, rusqlite::Error> {
        let keywords = super::query_expansion::extract_keywords(query);
        let fts_query = keywords.join(" OR ");
        let mut results = if fts_query.is_empty() {
            Vec::new()
        } else {
            let mut stmt = self.db.prepare(
                "SELECT rowid, rank FROM chunks_fts WHERE chunks_fts MATCH ?1 \
                 ORDER BY rank LIMIT ?2",
            )?;
            let rows = stmt
                .query_map(params![fts_query, limit], |row| {
                    Ok((row.get::<_, i64>(0)?, row.get::<_, f64>(1)?))
                })?
                .collect::<Result<Vec<_>, _>>()?;
            self.resolve_fts_rowids(rows)?
        };

        // W-11: CJK substring fallback. unicode61 indexes CJK runs as single
        // tokens, so sub-run queries never MATCH; without embeddings (BYOK)
        // that left Chinese memory entries unsearchable. Memory corpora are
        // small, so an instr() scan over chunk text is cheap.
        let probes = super::query_expansion::cjk_probes(query);
        if !probes.is_empty() {
            let mut seen: std::collections::HashSet<i64> =
                results.iter().map(|r| r.rowid).collect();
            let mut stmt = self
                .db
                .prepare("SELECT rowid FROM chunks WHERE instr(text, ?1) > 0 LIMIT ?2")?;
            for probe in probes {
                let rowids = stmt
                    .query_map(params![probe, limit], |row| row.get::<_, i64>(0))?
                    .collect::<Result<Vec<_>, _>>()?;
                for rowid in rowids {
                    if seen.insert(rowid) {
                        results.push(FtsResult {
                            chunk_id: String::new(),
                            rowid,
                            rank: 0.0,
                        });
                    }
                }
            }
            // chunk_ids for fallback rows are resolved lazily below.
            for r in results.iter_mut() {
                if r.chunk_id.is_empty()
                    && let Ok(id) = self.db.query_row(
                        "SELECT id FROM chunks WHERE rowid = ?1",
                        params![r.rowid],
                        |row| row.get::<_, String>(0),
                    )
                {
                    r.chunk_id = id;
                }
            }
            results.retain(|r| !r.chunk_id.is_empty());
            results.truncate(limit);
        }
        Ok(results)
    }

    fn resolve_fts_rowids(&self, rows: Vec<(i64, f64)>) -> Result<Vec<FtsResult>, rusqlite::Error> {
        let mut results = Vec::with_capacity(rows.len());
        for (rowid, rank) in rows {
            if let Ok(chunk_id) = self.db.query_row(
                "SELECT id FROM chunks WHERE rowid = ?1",
                params![rowid],
                |row| row.get::<_, String>(0),
            ) {
                results.push(FtsResult {
                    chunk_id,
                    rowid,
                    rank,
                });
            }
        }
        Ok(results)
    }

    /// Get a chunk by its ID.
    pub fn get_chunk(&self, id: &str) -> Result<Option<ChunkRecord>, rusqlite::Error> {
        let mut stmt = self.db.prepare(
            "SELECT rowid, id, path, start_line, end_line, text, hash, source, access_count, \
             created_at FROM chunks WHERE id = ?1",
        )?;
        let result = stmt
            .query_row(params![id], |row| {
                Ok(ChunkRecord {
                    rowid: row.get(0)?,
                    id: row.get(1)?,
                    path: row.get(2)?,
                    start_line: row.get::<_, i64>(3)? as usize,
                    end_line: row.get::<_, i64>(4)? as usize,
                    text: row.get(5)?,
                    hash: row.get(6)?,
                    source: row.get(7)?,
                    access_count: row.get(8)?,
                    created_at: row.get(9)?,
                })
            })
            .ok();
        Ok(result)
    }

    /// Return the current value of the reindex claim from meta.
    ///
    /// An empty string means no claim is active.  A non-empty claim means
    /// a session currently owns the reindex lock (or a crashed session left
    /// a stale one).  Used by `nofy memory doctor` to detect stuck states.
    pub fn get_reindex_claim(&self) -> String {
        self.db
            .query_row(
                "SELECT value FROM meta WHERE key = 'reindex_claim'",
                [],
                |r| r.get::<_, String>(0),
            )
            .unwrap_or_default()
    }

    /// Return all distinct file paths that have at least one indexed chunk.
    ///
    /// Used by `nofy memory doctor` to detect orphaned chunks (chunks whose
    /// source file has since been deleted).
    pub fn all_indexed_paths(&self) -> Result<Vec<String>, rusqlite::Error> {
        let mut stmt = self
            .db
            .prepare("SELECT DISTINCT path FROM chunks ORDER BY path")?;
        let paths = stmt
            .query_map([], |r| r.get::<_, String>(0))?
            .filter_map(|r| r.ok())
            .collect();
        Ok(paths)
    }

    /// Record an access to a chunk (increments access_count, updates last_accessed).
    pub fn record_access(&mut self, chunk_id: &str) -> Result<(), rusqlite::Error> {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64;
        self.db.execute(
            "UPDATE chunks SET access_count = access_count + 1, last_accessed = ?1 WHERE id = ?2",
            params![now, chunk_id],
        )?;
        Ok(())
    }

    // -----------------------------------------------------------------------
    // Vector operations (no-op if !vec_available)
    // -----------------------------------------------------------------------

    /// Return chunks that don't have embeddings yet.
    pub fn chunks_without_embeddings(&self) -> Result<Vec<(String, String)>, rusqlite::Error> {
        if !self.vec_available {
            return Ok(vec![]);
        }
        let mut stmt = self.db.prepare(
            "SELECT c.id, c.text FROM chunks c \
             LEFT JOIN chunks_vec_rowids v ON v.id = c.id \
             WHERE v.id IS NULL",
        )?;
        let results = stmt
            .query_map([], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
            })?
            .collect::<Result<Vec<_>, _>>()?;
        Ok(results)
    }

    /// Insert or update an embedding for a chunk.
    pub fn upsert_embedding(
        &self,
        chunk_id: &str,
        embedding: &[f32],
    ) -> Result<(), rusqlite::Error> {
        if !self.vec_available {
            return Ok(());
        }
        let embedding_bytes: Vec<u8> = embedding.iter().flat_map(|f| f.to_le_bytes()).collect();
        self.db.execute(
            "INSERT OR REPLACE INTO chunks_vec(chunk_id, embedding) VALUES (?1, ?2)",
            params![chunk_id, embedding_bytes],
        )?;
        Ok(())
    }

    /// KNN vector search. Returns (chunk_id, distance) pairs.
    pub fn vector_search(
        &self,
        query_embedding: &[f32],
        k: usize,
    ) -> Result<Vec<(String, f32)>, rusqlite::Error> {
        if !self.vec_available {
            return Ok(vec![]);
        }
        let query_bytes: Vec<u8> = query_embedding
            .iter()
            .flat_map(|f| f.to_le_bytes())
            .collect();
        let mut stmt = self.db.prepare(
            "SELECT chunk_id, distance FROM chunks_vec \
             WHERE embedding MATCH ?1 AND k = ?2 ORDER BY distance",
        )?;
        let results = stmt
            .query_map(params![query_bytes, k], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, f32>(1)?))
            })?
            .collect::<Result<Vec<_>, _>>()?;
        Ok(results)
    }

    // -----------------------------------------------------------------------
    // Reindex claim coordination (multi-agent)
    // -----------------------------------------------------------------------

    /// Try to claim exclusive reindex rights using the `meta` table.
    ///
    /// Uses an atomic UPDATE: succeeds only if unclaimed (empty) or stale
    /// (older than `stale_threshold_secs`). Returns `true` if claimed.
    /// Under SQLite's serialized writer model, at most one agent wins.
    pub fn try_claim_reindex(&self, stale_threshold_secs: i64) -> bool {
        let pid = std::process::id();
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs() as i64;
        let claim_value = format!("{pid}:{now}");
        let stale_cutoff = now - stale_threshold_secs;

        let rows = self
            .db
            .execute(
                "UPDATE meta SET value = ?1 WHERE key = 'reindex_claim' \
             AND (value = '' OR CAST(SUBSTR(value, INSTR(value, ':') + 1) AS INTEGER) < ?2)",
                params![claim_value, stale_cutoff],
            )
            .unwrap_or_else(|e| {
                tracing::warn!(error = %e, "reindex claim SQL failed, treating as claim-fail");
                0
            });

        rows == 1
    }

    /// Release the reindex claim. Call after reindex completes.
    pub fn release_claim(&self) {
        let _ = self
            .db
            .execute("UPDATE meta SET value = '' WHERE key = 'reindex_claim'", []);
    }

    // -----------------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------------

    /// Delete all indexed chunks for a given file path.
    ///
    /// Called when the watcher detects a file-removal event.  Without this,
    /// chunks from deleted memory files remain searchable indefinitely.
    ///
    /// Deletes from all three tables (`chunks`, `chunks_fts`, `chunks_vec`) in
    /// a single transaction so the index stays consistent even on partial failure.
    ///
    /// Returns the number of chunks removed, which is 0 when the path was not
    /// previously indexed (idempotent).
    pub fn delete_path(&mut self, path: &Path) -> Result<usize, rusqlite::Error> {
        let path_str = path.to_string_lossy().to_string();
        let existing = self.get_chunks_for_path(&path_str)?;

        if existing.is_empty() {
            return Ok(0);
        }

        let tx = self.db.transaction()?;
        for (chunk_id, record) in &existing {
            // Contentless FTS5 requires the original text for the 'delete' command.
            tx.execute(
                "INSERT INTO chunks_fts(chunks_fts, rowid, text) VALUES('delete', ?1, ?2)",
                params![record.rowid, record.text],
            )?;
            if self.vec_available {
                let _ = tx.execute(
                    "DELETE FROM chunks_vec WHERE chunk_id = ?1",
                    params![chunk_id],
                );
            }
            tx.execute("DELETE FROM chunks WHERE id = ?1", params![chunk_id])?;
        }
        tx.commit()?;

        tracing::debug!(
            path = %path.display(),
            count = existing.len(),
            "memory index: deleted chunks for removed file"
        );
        Ok(existing.len())
    }

    /// Get all existing chunks for a path, keyed by chunk ID.
    fn get_chunks_for_path(
        &self,
        path: &str,
    ) -> Result<HashMap<String, ChunkRecord>, rusqlite::Error> {
        let mut stmt = self.db.prepare(
            "SELECT rowid, id, path, start_line, end_line, text, hash, source, access_count, \
             created_at FROM chunks WHERE path = ?1",
        )?;
        let rows = stmt.query_map(params![path], |row| {
            Ok(ChunkRecord {
                rowid: row.get(0)?,
                id: row.get(1)?,
                path: row.get(2)?,
                start_line: row.get::<_, i64>(3)? as usize,
                end_line: row.get::<_, i64>(4)? as usize,
                text: row.get(5)?,
                hash: row.get(6)?,
                source: row.get(7)?,
                access_count: row.get(8)?,
                created_at: row.get(9)?,
            })
        })?;
        let mut map = HashMap::new();
        for row in rows {
            let record = row?;
            map.insert(record.id.clone(), record);
        }
        Ok(map)
    }

    /// Get the rowid for a chunk by its text ID.
    #[expect(
        dead_code,
        reason = "used by future reindex_all and non-transactional paths"
    )]
    fn get_rowid(&self, id: &str) -> Result<Option<i64>, rusqlite::Error> {
        self.db
            .query_row(
                "SELECT rowid FROM chunks WHERE id = ?1",
                params![id],
                |row| row.get(0),
            )
            .ok()
            .map_or(Ok(None), |v| Ok(Some(v)))
    }

    /// Insert an FTS5 entry for a chunk. Uses contentless FTS5 — manual management.
    #[expect(
        dead_code,
        reason = "used by future reindex_all and non-transactional paths"
    )]
    fn insert_fts_entry(&self, rowid: i64, text: &str) -> Result<(), rusqlite::Error> {
        self.db.execute(
            "INSERT INTO chunks_fts(rowid, text) VALUES (?1, ?2)",
            params![rowid, text],
        )?;
        Ok(())
    }

    /// Delete an FTS5 entry. For contentless FTS5, this requires the original text.
    #[expect(
        dead_code,
        reason = "used by future reindex_all and non-transactional paths"
    )]
    fn delete_fts_entry(&self, rowid: i64, text: &str) -> Result<(), rusqlite::Error> {
        self.db.execute(
            "INSERT INTO chunks_fts(chunks_fts, rowid, text) VALUES('delete', ?1, ?2)",
            params![rowid, text],
        )?;
        Ok(())
    }
}

#[derive(Default)]
struct TopicIndexMetadata {
    id: Option<String>,
    revision: u64,
    validity: Option<ProjectValidity>,
}

fn parse_topic_metadata(text: &str) -> TopicIndexMetadata {
    let mut values = HashMap::new();
    if let Some(line) = text.lines().next()
        && let Some(metadata) = line
            .strip_prefix("<!-- nofy-memory:")
            .and_then(|value| value.strip_suffix(" -->"))
    {
        for pair in metadata.split(';') {
            if let Some((key, value)) = pair.trim().split_once('=') {
                values.insert(key.trim(), value.trim());
            }
        }
    }
    let validity = match values.get("validity").copied() {
        Some("branch_local") => {
            let git_ref = values.get("git_ref").copied().unwrap_or_default();
            let anchor_commit = values.get("anchor_commit").copied().unwrap_or_default();
            if git_ref.is_empty() || anchor_commit.is_empty() {
                None
            } else {
                Some(ProjectValidity::BranchLocal {
                    git_ref: git_ref.to_owned(),
                    anchor_commit: anchor_commit.to_owned(),
                })
            }
        }
        _ => Some(ProjectValidity::ProjectWide),
    };
    TopicIndexMetadata {
        id: values
            .get("id")
            .and_then(|value| uuid::Uuid::parse_str(value).ok())
            .map(|id| id.to_string()),
        revision: values
            .get("revision")
            .and_then(|value| value.parse().ok())
            .unwrap_or(1),
        validity,
    }
}

fn collect_markdown_files(directory: &Path, files: &mut Vec<PathBuf>) -> std::io::Result<()> {
    if !directory.is_dir() {
        return Ok(());
    }
    let mut entries = std::fs::read_dir(directory)?.collect::<Result<Vec<_>, _>>()?;
    entries.sort_by_key(std::fs::DirEntry::file_name);
    for entry in entries {
        let path = entry.path();
        if path.is_dir() {
            collect_markdown_files(&path, files)?;
        } else if path.extension().is_some_and(|extension| extension == "md") {
            files.push(path);
        }
    }
    Ok(())
}

fn read_observation_statuses(database: &Path) -> Result<HashMap<String, String>, rusqlite::Error> {
    let mode = JournalMode::for_db_path(database);
    if !mode.effective_db_path(database).is_file() {
        return Ok(HashMap::new());
    }
    let connection = mode.open_readonly(database)?;
    let mut statement =
        connection.prepare("SELECT observation_id, status FROM observation_states")?;
    statement
        .query_map([], |row| Ok((row.get(0)?, row.get(1)?)))?
        .collect()
}

const RACY_CLEAN_MARGIN_NANOS: i128 = 50_000_000;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
struct FileTimestamp {
    secs: i64,
    nanos: u32,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
struct FileStat {
    size: i64,
    mtime: FileTimestamp,
    is_symlink: bool,
}

#[derive(Debug, Clone)]
struct IndexedFileRecord {
    file_kind: String,
    size: i64,
    mtime: FileTimestamp,
    content_hash: String,
    indexed_at: FileTimestamp,
}

struct UnifiedDocument<'a> {
    path: &'a Path,
    object_id: &'a str,
    object_kind: &'a str,
    scope: &'a MemoryScope,
    validity: Option<&'a ProjectValidity>,
    revision: u64,
    object_hash: &'a str,
    observation_kind: Option<&'a str>,
    observation_status: &'a str,
    text: &'a str,
    created_at: i64,
}

fn system_time_to_timestamp(time: std::time::SystemTime) -> Option<FileTimestamp> {
    match time.duration_since(std::time::UNIX_EPOCH) {
        Ok(duration) => Some(FileTimestamp {
            secs: i64::try_from(duration.as_secs()).ok()?,
            nanos: duration.subsec_nanos(),
        }),
        Err(error) => {
            let duration = error.duration();
            let secs = i64::try_from(duration.as_secs()).ok()?;
            let nanos = duration.subsec_nanos();
            if nanos == 0 {
                Some(FileTimestamp {
                    secs: secs.checked_neg()?,
                    nanos: 0,
                })
            } else {
                Some(FileTimestamp {
                    secs: secs.checked_add(1)?.checked_neg()?,
                    nanos: 1_000_000_000 - nanos,
                })
            }
        }
    }
}

fn current_file_timestamp() -> FileTimestamp {
    system_time_to_timestamp(std::time::SystemTime::now())
        .unwrap_or(FileTimestamp { secs: 0, nanos: 0 })
}

fn stat_file(path: &Path) -> std::io::Result<Option<FileStat>> {
    let meta = std::fs::symlink_metadata(path)?;
    if meta.file_type().is_symlink() {
        return Ok(Some(FileStat {
            size: 0,
            mtime: FileTimestamp { secs: 0, nanos: 0 },
            is_symlink: true,
        }));
    }
    if !meta.is_file() {
        return Ok(None);
    }
    let Ok(size) = i64::try_from(meta.len()) else {
        return Ok(None);
    };
    let Some(mtime) = meta.modified().ok().and_then(system_time_to_timestamp) else {
        return Ok(None);
    };
    Ok(Some(FileStat {
        size,
        mtime,
        is_symlink: false,
    }))
}

fn is_racy_clean(mtime: FileTimestamp, indexed_at: FileTimestamp, now: FileTimestamp) -> bool {
    if mtime.nanos == 0 {
        return indexed_at.secs <= mtime.secs || now.secs <= mtime.secs;
    }
    let elapsed = |later: FileTimestamp, earlier: FileTimestamp| -> Option<i128> {
        let later_ns = i128::from(later.secs) * 1_000_000_000 + i128::from(later.nanos);
        let earlier_ns = i128::from(earlier.secs) * 1_000_000_000 + i128::from(earlier.nanos);
        later_ns.checked_sub(earlier_ns)
    };
    elapsed(indexed_at, mtime).is_none_or(|delta| delta < RACY_CLEAN_MARGIN_NANOS)
        || elapsed(now, mtime).is_none_or(|delta| delta < RACY_CLEAN_MARGIN_NANOS)
}

fn can_skip_hash(
    cached: &IndexedFileRecord,
    file_kind: &str,
    stat: Option<FileStat>,
    now: FileTimestamp,
) -> bool {
    let Some(stat) = stat else {
        return false;
    };
    if stat.is_symlink
        || cached.size < 0
        || cached.file_kind != file_kind
        || cached.size != stat.size
        || cached.mtime != stat.mtime
    {
        return false;
    }
    !is_racy_clean(stat.mtime, cached.indexed_at, now)
}

fn hash_observation_statuses(statuses: &HashMap<String, String>) -> String {
    let mut pairs: Vec<(&String, &String)> = statuses.iter().collect();
    pairs.sort_unstable();
    let mut hasher = blake3::Hasher::new();
    for (id, status) in pairs {
        hasher.update((id.len() as u64).to_le_bytes().as_slice());
        hasher.update(id.as_bytes());
        hasher.update((status.len() as u64).to_le_bytes().as_slice());
        hasher.update(status.as_bytes());
    }
    hasher.finalize().to_hex().to_string()
}

fn fingerprint_from_hashes(
    files: &mut [(String, String)],
    statuses: &HashMap<String, String>,
) -> String {
    files.sort_unstable();
    let mut hasher = blake3::Hasher::new();
    hasher.update(b"nofy-index-v2:");
    for (path, content_hash) in files.iter() {
        hasher.update((path.len() as u64).to_le_bytes().as_slice());
        hasher.update(path.as_bytes());
        hasher.update(content_hash.as_bytes());
    }
    let mut status_pairs: Vec<(&String, &String)> = statuses.iter().collect();
    status_pairs.sort_unstable();
    for (id, status) in status_pairs {
        hasher.update((id.len() as u64).to_le_bytes().as_slice());
        hasher.update(id.as_bytes());
        hasher.update(status.as_bytes());
    }
    hasher.finalize().to_hex().to_string()
}

fn superseded_observation_ids(
    observations: &[(PathBuf, String, Observation, String)],
) -> HashSet<String> {
    // Corrections are immutable evidence. Their supersedes edges are the
    // authoritative projection even if an interrupted writer has not yet
    // updated the older observation's mutable status row.
    observations
        .iter()
        .filter(|(_, _, observation, status)| {
            *status == "active" && observation.kind == ObservationKind::UserCorrection
        })
        .flat_map(|(_, _, observation, _)| {
            observation
                .supersedes
                .iter()
                .map(|id| id.as_uuid().to_string())
        })
        .collect()
}

fn delete_path_in_tx(
    tx: &rusqlite::Transaction<'_>,
    vec_available: bool,
    path_str: &str,
) -> Result<usize, rusqlite::Error> {
    let existing = {
        let mut stmt = tx.prepare("SELECT rowid, id, text FROM chunks WHERE path = ?1")?;
        stmt.query_map(params![path_str], |row| {
            Ok((
                row.get::<_, i64>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
            ))
        })?
        .collect::<Result<Vec<_>, _>>()?
    };
    for (rowid, chunk_id, text) in &existing {
        tx.execute(
            "INSERT INTO chunks_fts(chunks_fts, rowid, text) VALUES('delete', ?1, ?2)",
            params![rowid, text],
        )?;
        if vec_available {
            let _ = tx.execute(
                "DELETE FROM chunks_vec WHERE chunk_id = ?1",
                params![chunk_id],
            );
        }
        tx.execute("DELETE FROM chunks WHERE id = ?1", params![chunk_id])?;
    }
    Ok(existing.len())
}

fn upsert_indexed_file_in_tx(
    tx: &rusqlite::Transaction<'_>,
    path_str: &str,
    file_kind: &str,
    stat: Option<FileStat>,
    content_hash: &str,
    indexed_at: FileTimestamp,
) -> Result<(), rusqlite::Error> {
    let (size, mtime_secs, mtime_nanos) = match stat {
        Some(stat) if !stat.is_symlink => (stat.size, stat.mtime.secs, i64::from(stat.mtime.nanos)),
        _ => (-1, 0, 0),
    };
    tx.execute(
        "INSERT INTO indexed_files
         (path, file_kind, size, mtime_secs, mtime_nanos, content_hash, indexed_at_secs, indexed_at_nanos)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
         ON CONFLICT(path) DO UPDATE SET
             file_kind = excluded.file_kind,
             size = excluded.size,
             mtime_secs = excluded.mtime_secs,
             mtime_nanos = excluded.mtime_nanos,
             content_hash = excluded.content_hash,
             indexed_at_secs = excluded.indexed_at_secs,
             indexed_at_nanos = excluded.indexed_at_nanos",
        params![
            path_str,
            file_kind,
            size,
            mtime_secs,
            mtime_nanos,
            content_hash,
            indexed_at.secs,
            i64::from(indexed_at.nanos),
        ],
    )?;
    Ok(())
}

fn insert_topic_in_tx(
    tx: &rusqlite::Transaction<'_>,
    chunk_config: &MemoryIndexConfig,
    scope_layout: &ScopeLayout,
    scope: &MemoryScope,
    path: &Path,
    bytes: &[u8],
    content_hash: &str,
) -> Result<usize, rusqlite::Error> {
    let text = String::from_utf8_lossy(bytes);
    let relative = path
        .strip_prefix(scope_layout.topics_directory())
        .unwrap_or(path)
        .to_string_lossy();
    let metadata = parse_topic_metadata(&text);
    let scope_key = scope_key(scope);
    let validity = match scope {
        MemoryScope::Personal => None,
        MemoryScope::Project(_) => metadata.validity.as_ref(),
    };
    let object_id = metadata.id.unwrap_or_else(|| {
        uuid::Uuid::new_v5(
            &uuid::Uuid::NAMESPACE_URL,
            format!("nofy-topic:{scope_key}:{relative}").as_bytes(),
        )
        .to_string()
    });
    insert_unified_text_in_tx(
        tx,
        chunk_config,
        &UnifiedDocument {
            path,
            object_id: &object_id,
            object_kind: "topic",
            scope,
            validity,
            revision: metadata.revision,
            object_hash: content_hash,
            observation_kind: None,
            observation_status: "active",
            text: &text,
            created_at: file_created_at(path),
        },
    )
}

fn insert_unified_text_in_tx(
    tx: &rusqlite::Transaction<'_>,
    chunk_config: &MemoryIndexConfig,
    doc: &UnifiedDocument<'_>,
) -> Result<usize, rusqlite::Error> {
    let chunks = chunk_markdown(doc.text, chunk_config);
    let path_text = doc.path.to_string_lossy();
    let (scope_kind, project_id) = match doc.scope {
        MemoryScope::Personal => ("personal", None),
        MemoryScope::Project(project_id) => ("project", Some(project_id.as_uuid().to_string())),
    };
    let (validity_kind, git_ref, anchor_commit) = match doc.validity {
        None | Some(ProjectValidity::ProjectWide) => ("project_wide", None, None),
        Some(ProjectValidity::BranchLocal {
            git_ref,
            anchor_commit,
        }) => (
            "branch_local",
            Some(git_ref.as_str()),
            Some(anchor_commit.as_str()),
        ),
    };
    let source = format!("{scope_kind}_{}", doc.object_kind);
    let now = chrono::Utc::now().timestamp();
    for (position, chunk) in chunks.iter().enumerate() {
        let chunk_id = format!("{}:{}:{position}", doc.object_kind, doc.object_id);
        tx.execute(
            "INSERT INTO chunks
             (id, path, start_line, end_line, text, hash, source, origin,
              object_id, object_kind, scope_kind, project_id, validity_kind,
              git_ref, anchor_commit, revision, object_hash, observation_kind,
              observation_status, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'canonical', ?8, ?9,
                     ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20)",
            params![
                chunk_id,
                path_text.as_ref(),
                chunk.start_line as i64,
                chunk.end_line as i64,
                chunk.text,
                chunk_hash(&chunk.text),
                source,
                doc.object_id,
                doc.object_kind,
                scope_kind,
                project_id,
                validity_kind,
                git_ref,
                anchor_commit,
                doc.revision as i64,
                doc.object_hash,
                doc.observation_kind,
                doc.observation_status,
                doc.created_at,
                now,
            ],
        )?;
        let rowid = tx.last_insert_rowid();
        tx.execute(
            "INSERT INTO chunks_fts(rowid, text) VALUES (?1, ?2)",
            params![rowid, chunk.text],
        )?;
    }
    Ok(chunks.len())
}

fn observation_json(bytes: &[u8]) -> Result<String, std::io::Error> {
    let text = String::from_utf8_lossy(bytes);
    let start = text.find("```json").ok_or_else(|| {
        std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            "observation is missing a JSON fence",
        )
    })? + "```json".len();
    let rest = &text[start..];
    let end = rest.find("```").ok_or_else(|| {
        std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            "observation JSON fence is not terminated",
        )
    })?;
    Ok(rest[..end].trim().to_owned())
}

fn observation_kind_name(kind: ObservationKind) -> &'static str {
    match kind {
        ObservationKind::User => "user",
        ObservationKind::UserCorrection => "user_correction",
        ObservationKind::Feedback => "feedback",
        ObservationKind::Project => "project",
        ObservationKind::Reference => "reference",
        ObservationKind::Explicit => "explicit",
    }
}

fn scope_key(scope: &MemoryScope) -> String {
    match scope {
        MemoryScope::Personal => "personal".to_owned(),
        MemoryScope::Project(project_id) => format!("project:{}", project_id.as_uuid()),
    }
}

fn hash_bytes(bytes: &[u8]) -> String {
    blake3::hash(bytes).to_hex().to_string()
}

fn file_created_at(path: &Path) -> i64 {
    path.metadata()
        .and_then(|metadata| metadata.modified())
        .ok()
        .and_then(|time| time.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|duration| duration.as_secs() as i64)
        .unwrap_or_else(|| chrono::Utc::now().timestamp())
}

fn ensure_column(
    database: &rusqlite::Connection,
    table: &str,
    column: &str,
    definition: &str,
) -> Result<(), rusqlite::Error> {
    let mut statement = database.prepare(&format!("PRAGMA table_info({table})"))?;
    let exists = statement
        .query_map([], |row| row.get::<_, String>(1))?
        .filter_map(Result::ok)
        .any(|name| name == column);
    drop(statement);
    if !exists {
        database.execute_batch(&format!(
            "ALTER TABLE {table} ADD COLUMN {column} {definition}"
        ))?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn test_storage(tmp: &TempDir) -> MemoryStorage {
        let global = tmp.path().join("memory");
        let workspace = global.join("test_ws");
        MemoryStorage::with_paths(global, workspace)
    }

    fn test_index(tmp: &TempDir) -> MemoryIndex {
        let db_path = tmp.path().join("test.sqlite");
        let storage = test_storage(tmp);
        MemoryIndex::open_or_create(&db_path, storage, MemoryIndexConfig::default(), 1536).unwrap()
    }

    #[test]
    fn test_open_or_create_new_db() {
        let tmp = TempDir::new().unwrap();
        let idx = test_index(&tmp);
        assert_eq!(idx.embedding_dimensions(), 1536);
    }

    #[test]
    fn test_open_or_create_reopens_existing() {
        let tmp = TempDir::new().unwrap();
        let db_path = tmp.path().join("test.sqlite");
        let storage = test_storage(&tmp);

        // Create
        {
            let _idx = MemoryIndex::open_or_create(
                &db_path,
                storage.clone(),
                MemoryIndexConfig::default(),
                1536,
            )
            .unwrap();
        }

        // Reopen
        let idx =
            MemoryIndex::open_or_create(&db_path, storage, MemoryIndexConfig::default(), 1536)
                .unwrap();
        assert_eq!(idx.embedding_dimensions(), 1536);
    }

    fn journal_mode(idx: &MemoryIndex) -> String {
        idx.db()
            .query_row("PRAGMA journal_mode", [], |r| r.get(0))
            .unwrap()
    }

    #[test]
    fn test_open_or_create_uses_wal_on_local_fs() {
        // Ambient kill-switch would override the decision; skip if set.
        if std::env::var("NOFY_SQLITE_JOURNAL_MODE").is_ok() {
            return;
        }
        let tmp = TempDir::new().unwrap();
        assert_eq!(journal_mode(&test_index(&tmp)), "wal");
    }

    #[test]
    fn test_network_mode_uses_fresh_per_host_truncate_db() {
        // Network mode opens a per-host sibling of the given path (the
        // legacy shared file is left untouched — a live old binary can flip
        // it back to WAL at any time) in rollback-journal mode.
        let tmp = TempDir::new().unwrap();
        let db_path = tmp.path().join("test.sqlite");
        let storage = test_storage(&tmp);

        let idx = MemoryIndex::open_or_create_with_journal_mode(
            &db_path,
            storage,
            MemoryIndexConfig::default(),
            512,
            JournalMode::Truncate,
        )
        .unwrap();
        assert_eq!(journal_mode(&idx), "truncate");
        assert_eq!(idx.embedding_dimensions(), 512);
        drop(idx);

        let eff = JournalMode::Truncate.effective_db_path(&db_path);
        assert_ne!(eff, db_path);
        assert!(eff.exists());
        let base = eff.display().to_string();
        assert!(!std::fs::exists(format!("{base}-wal")).unwrap());
        assert!(!std::fs::exists(format!("{base}-shm")).unwrap());
    }

    #[test]
    fn test_reindex_file_adds_chunks() {
        let tmp = TempDir::new().unwrap();
        let mut idx = test_index(&tmp);

        // Write a test memory file
        let file_path = tmp.path().join("test.md");
        std::fs::write(&file_path, "# Title\n\nSome content here.").unwrap();

        let result = idx.reindex_file(&file_path, "workspace", "agent").unwrap();
        assert_eq!(result.added, 1);
        assert_eq!(result.updated, 0);
        assert_eq!(result.removed, 0);
    }

    #[test]
    fn test_reindex_file_detects_changes() {
        let tmp = TempDir::new().unwrap();
        let mut idx = test_index(&tmp);

        let file_path = tmp.path().join("test.md");
        std::fs::write(&file_path, "# Title\n\nOriginal content.").unwrap();
        let r1 = idx.reindex_file(&file_path, "workspace", "agent").unwrap();
        assert_eq!(r1.added, 1);

        // Modify file
        std::fs::write(&file_path, "# Title\n\nUpdated content.").unwrap();
        let r2 = idx.reindex_file(&file_path, "workspace", "agent").unwrap();
        assert_eq!(r2.updated, 1);
        assert_eq!(r2.added, 0);
    }

    #[test]
    fn test_reindex_file_removes_deleted_chunks() {
        let tmp = TempDir::new().unwrap();
        let mut idx = test_index(&tmp);

        let file_path = tmp.path().join("test.md");
        // Write file with content that produces 2+ chunks
        let big = format!(
            "## Section 1\n\n{}\n\n## Section 2\n\n{}",
            "A".repeat(2000),
            "B".repeat(2000)
        );
        std::fs::write(&file_path, &big).unwrap();
        let r1 = idx.reindex_file(&file_path, "workspace", "agent").unwrap();
        assert!(r1.added >= 2, "should add at least 2 chunks");

        // Shrink to 1 chunk
        std::fs::write(&file_path, "## Only Section\n\nSmall.").unwrap();
        let r2 = idx.reindex_file(&file_path, "workspace", "agent").unwrap();
        assert!(r2.removed > 0, "should remove old chunks");
    }

    #[test]
    fn test_reindex_unchanged_is_noop() {
        let tmp = TempDir::new().unwrap();
        let mut idx = test_index(&tmp);

        let file_path = tmp.path().join("test.md");
        std::fs::write(&file_path, "# Static\n\nContent.").unwrap();

        let r1 = idx.reindex_file(&file_path, "workspace", "agent").unwrap();
        assert_eq!(r1.added, 1);

        let r2 = idx.reindex_file(&file_path, "workspace", "agent").unwrap();
        assert_eq!(r2.added, 0);
        assert_eq!(r2.updated, 0);
        assert_eq!(r2.removed, 0);
    }

    #[test]
    fn test_fts_search() {
        let tmp = TempDir::new().unwrap();
        let mut idx = test_index(&tmp);

        let file_path = tmp.path().join("test.md");
        std::fs::write(&file_path, "# Guide\n\nRust programming language tutorial.").unwrap();
        idx.reindex_file(&file_path, "workspace", "agent").unwrap();

        let results = idx.search_fts("rust programming", 10).unwrap();
        assert!(!results.is_empty(), "FTS should find 'rust programming'");
    }

    #[test]
    fn test_fts_search_no_match() {
        let tmp = TempDir::new().unwrap();
        let mut idx = test_index(&tmp);

        let file_path = tmp.path().join("test.md");
        std::fs::write(&file_path, "# Guide\n\nPython tutorial.").unwrap();
        idx.reindex_file(&file_path, "workspace", "agent").unwrap();

        let results = idx.search_fts("haskell monads", 10).unwrap();
        assert!(results.is_empty(), "FTS should not find unrelated query");
    }

    #[test]
    fn test_fts_search_cjk_substring_fallback() {
        // W-11: unicode61 indexes CJK runs as single tokens, so a sub-run
        // query (single char / partial word) never MATCHes. The instr()
        // fallback must restore recall for Chinese memory entries.
        let tmp = TempDir::new().unwrap();
        let mut idx = test_index(&tmp);

        let file_path = tmp.path().join("memory.md");
        std::fs::write(&file_path, "## Preferences\n\n- 最喜欢的茶:碧螺春\n").unwrap();
        idx.reindex_file(&file_path, "global", "agent").unwrap();

        // Single-char sub-run query.
        let results = idx.search_fts("茶", 10).unwrap();
        assert!(
            !results.is_empty(),
            "single CJK char should match via fallback"
        );

        // Whole-run query.
        let results = idx.search_fts("碧螺春", 10).unwrap();
        assert!(!results.is_empty(), "whole CJK run should match");

        // Mixed-language query.
        let results = idx.search_fts("favorite tea 碧螺春", 10).unwrap();
        assert!(!results.is_empty(), "mixed query should match");

        // Unrelated CJK stays empty.
        let results = idx.search_fts("火车", 10).unwrap();
        assert!(results.is_empty(), "unrelated CJK should not match");
    }

    #[test]
    fn test_get_chunk_and_record_access() {
        let tmp = TempDir::new().unwrap();
        let mut idx = test_index(&tmp);

        let file_path = tmp.path().join("test.md");
        std::fs::write(&file_path, "# Test\n\nChunk content.").unwrap();
        idx.reindex_file(&file_path, "workspace", "agent").unwrap();

        let path_str = file_path.to_string_lossy().to_string();
        let chunk_id = format!("{path_str}:0");

        let chunk = idx.get_chunk(&chunk_id).unwrap();
        assert!(chunk.is_some());
        let chunk = chunk.unwrap();
        assert_eq!(chunk.access_count, 0);

        idx.record_access(&chunk_id).unwrap();
        let chunk = idx.get_chunk(&chunk_id).unwrap().unwrap();
        assert_eq!(chunk.access_count, 1);
    }

    #[test]
    fn test_sqlite_vec_loads_and_reports_version() {
        init_sqlite_vec();
        let conn = rusqlite::Connection::open_in_memory().unwrap();
        let version: String = conn
            .query_row("SELECT vec_version()", [], |r| r.get(0))
            .unwrap();
        assert!(!version.is_empty(), "sqlite-vec should report a version");
    }

    // -----------------------------------------------------------------------
    // Append-then-reindex regression test
    // -----------------------------------------------------------------------

    /// Simulates the `/memory append` → immediate-reindex flow.
    ///
    /// Previously the TUI's `AppendMemory` action wrote the file and returned
    /// without reindexing.  Appended content was only searchable after a future
    /// watcher-driven sync or the next session startup.  The fix reindexes
    /// immediately after append; this test ensures that regression cannot silently
    /// re-appear.
    #[test]
    fn test_append_then_reindex_is_immediately_searchable() {
        let tmp = TempDir::new().unwrap();
        let mut idx = test_index(&tmp);

        // Simulate MemoryStorage::append_to_memory writing the file.
        let mem_file = tmp.path().join("workspace_memory.md");
        std::fs::write(
            &mem_file,
            "## Rust Tip\n\nAlways prefer references over clones.",
        )
        .unwrap();

        // The content is NOT yet in the index — search returns nothing.
        let pre = idx.search_fts("prefer references over clones", 10).unwrap();
        assert!(
            pre.is_empty(),
            "content must not be searchable before reindex_file is called"
        );

        // Immediate reindex (what reindex_appended_memory in app.rs does).
        idx.reindex_file(&mem_file, "workspace", "agent").unwrap();

        // Now the content must be searchable without watcher or restart.
        let post = idx.search_fts("prefer references over clones", 10).unwrap();
        assert!(
            !post.is_empty(),
            "appended content must be immediately searchable after reindex_file"
        );
    }

    // -----------------------------------------------------------------------
    // delete_path tests
    // -----------------------------------------------------------------------

    /// Deleting an indexed file removes all its chunks and they are no longer searchable.
    #[test]
    fn test_delete_path_removes_chunks_and_fts_entries() {
        let tmp = TempDir::new().unwrap();
        let mut idx = test_index(&tmp);

        let file_path = tmp.path().join("removeme.md");
        std::fs::write(&file_path, "# Rust Guide\n\nRust ownership rules.").unwrap();
        idx.reindex_file(&file_path, "workspace", "agent").unwrap();

        // Precondition: FTS finds the file.
        let pre = idx.search_fts("rust ownership", 10).unwrap();
        assert!(!pre.is_empty(), "should find content before deletion");

        // Delete the path from the index (simulating a watcher Remove event).
        let removed = idx.delete_path(&file_path).unwrap();
        assert!(removed >= 1, "should report at least 1 chunk removed");

        // Post-condition: FTS no longer returns the deleted content.
        let post = idx.search_fts("rust ownership", 10).unwrap();
        assert!(
            post.is_empty(),
            "deleted file must not be searchable after delete_path"
        );
    }

    /// delete_path is idempotent — calling it twice (or on an unindexed file) is safe.
    #[test]
    fn test_delete_path_idempotent() {
        let tmp = TempDir::new().unwrap();
        let mut idx = test_index(&tmp);

        let file_path = tmp.path().join("idempotent.md");
        std::fs::write(&file_path, "# Entry\n\nSome content.").unwrap();
        idx.reindex_file(&file_path, "workspace", "agent").unwrap();

        let first = idx.delete_path(&file_path).unwrap();
        assert!(first >= 1);

        // Calling again on an already-deleted path returns 0 without error.
        let second = idx.delete_path(&file_path).unwrap();
        assert_eq!(second, 0, "second delete_path must be a no-op (idempotent)");
    }

    /// delete_path on a path that was never indexed returns 0.
    #[test]
    fn test_delete_path_never_indexed_returns_zero() {
        let tmp = TempDir::new().unwrap();
        let mut idx = test_index(&tmp);

        let phantom = tmp.path().join("phantom.md");
        let removed = idx.delete_path(&phantom).unwrap();
        assert_eq!(removed, 0, "unindexed path must return 0");
    }

    /// delete_path does not affect chunks from other files.
    #[test]
    fn test_delete_path_does_not_affect_other_files() {
        let tmp = TempDir::new().unwrap();
        let mut idx = test_index(&tmp);

        let keep = tmp.path().join("keep.md");
        let remove = tmp.path().join("remove.md");
        std::fs::write(&keep, "# Keep\n\nPython tutorial.").unwrap();
        std::fs::write(&remove, "# Remove\n\nRust tutorial.").unwrap();

        idx.reindex_file(&keep, "workspace", "agent").unwrap();
        idx.reindex_file(&remove, "workspace", "agent").unwrap();

        idx.delete_path(&remove).unwrap();

        // Python content from keep.md is still searchable.
        let keep_results = idx.search_fts("python", 10).unwrap();
        assert!(
            !keep_results.is_empty(),
            "chunks from other files must survive delete_path"
        );

        // Rust content from remove.md is gone.
        let remove_results = idx.search_fts("rust", 10).unwrap();
        assert!(
            remove_results.is_empty(),
            "chunks from deleted file must not appear"
        );
    }

    // -----------------------------------------------------------------------
    // access tracking + admin helper tests
    // -----------------------------------------------------------------------

    /// record_access increments access_count and sets last_accessed.
    #[test]
    fn test_record_access_increments_count() {
        let tmp = TempDir::new().unwrap();
        let mut idx = test_index(&tmp);

        let file = tmp.path().join("note.md");
        std::fs::write(&file, "# Guide\n\nRust testing.").unwrap();
        idx.reindex_file(&file, "workspace", "agent").unwrap();

        let path_str = file.to_string_lossy().to_string();
        let chunk_id = format!("{path_str}:0");

        // Initial access_count should be 0.
        let chunk_before = idx.get_chunk(&chunk_id).unwrap().unwrap();
        assert_eq!(chunk_before.access_count, 0, "access_count starts at 0");

        // Record two accesses.
        idx.record_access(&chunk_id).unwrap();
        idx.record_access(&chunk_id).unwrap();

        let chunk_after = idx.get_chunk(&chunk_id).unwrap().unwrap();
        assert_eq!(chunk_after.access_count, 2, "access_count must increment");
    }

    /// get_reindex_claim returns empty string when no claim is active.
    #[test]
    fn test_get_reindex_claim_empty_by_default() {
        let tmp = TempDir::new().unwrap();
        let idx = test_index(&tmp);
        assert_eq!(
            idx.get_reindex_claim(),
            "",
            "claim must be empty on fresh index"
        );
    }

    /// all_indexed_paths returns distinct paths for indexed chunks.
    #[test]
    fn test_all_indexed_paths() {
        let tmp = TempDir::new().unwrap();
        let mut idx = test_index(&tmp);

        let f1 = tmp.path().join("a.md");
        let f2 = tmp.path().join("b.md");
        std::fs::write(&f1, "# Alpha\n\nalpha content.").unwrap();
        std::fs::write(&f2, "# Beta\n\nbeta content.").unwrap();
        idx.reindex_file(&f1, "workspace", "agent").unwrap();
        idx.reindex_file(&f2, "workspace", "agent").unwrap();

        let paths = idx.all_indexed_paths().unwrap();
        let path_strs: Vec<&str> = paths.iter().map(String::as_str).collect();

        assert!(
            path_strs.contains(&f1.to_string_lossy().as_ref()),
            "a.md must be in indexed paths"
        );
        assert!(
            path_strs.contains(&f2.to_string_lossy().as_ref()),
            "b.md must be in indexed paths"
        );
        assert_eq!(
            paths.len(),
            2,
            "exactly two distinct paths should be indexed"
        );
    }

    /// all_indexed_paths returns empty for a fresh empty index.
    #[test]
    fn test_all_indexed_paths_empty_index() {
        let tmp = TempDir::new().unwrap();
        let idx = test_index(&tmp);
        let paths = idx.all_indexed_paths().unwrap();
        assert!(paths.is_empty(), "fresh index has no indexed paths");
    }

    // -----------------------------------------------------------------------
    // reindex maintenance path regression tests
    // -----------------------------------------------------------------------

    /// Regression test for the reindex maintenance flow:
    ///
    /// 1. Index a file.
    /// 2. Delete the file from disk (simulates a user removing a session log).
    /// 3. Run the same orphan-removal logic as `nofy memory reindex`:
    ///    compare `all_indexed_paths()` against current files and call
    ///    `delete_path()` for paths that no longer exist.
    /// 4. Verify the stale chunks are gone and are no longer searchable.
    ///
    /// This proves that `nofy memory reindex`'s Phase 1 actually fixes the
    /// state that `nofy memory doctor` warns about.
    #[test]
    fn test_reindex_maintenance_removes_orphaned_chunks() {
        let tmp = TempDir::new().unwrap();
        let mut idx = test_index(&tmp);

        // Seed the index with a file containing uniquely-identifiable content.
        let file = tmp.path().join("session.md");
        std::fs::write(&file, "# Session\n\nXyzzy-orphan-regression-token.").unwrap();
        idx.reindex_file(&file, "workspace", "agent").unwrap();

        // Precondition: the content is searchable.
        let before = idx.search_fts("orphan-regression-token", 10).unwrap();
        assert!(
            !before.is_empty(),
            "should find content before file is deleted"
        );

        // Delete the file — now it is orphaned in the index.
        std::fs::remove_file(&file).unwrap();

        // Simulate `nofy memory reindex` Phase 1: compare indexed vs current.
        let current: std::collections::BTreeSet<String> = vec![].into_iter().collect(); // empty = no files
        let indexed = idx.all_indexed_paths().unwrap();
        for path in &indexed {
            if !current.contains(path) {
                idx.delete_path(std::path::Path::new(path)).unwrap();
            }
        }

        // Postcondition: stale chunks are gone; search returns nothing.
        let after = idx.search_fts("orphan-regression-token", 10).unwrap();
        assert!(
            after.is_empty(),
            "orphaned chunks must be removed after reindex maintenance"
        );
    }

    /// A fresh (non-stale) reindex claim blocks `try_claim_reindex`.
    ///
    /// Verifies that `nofy memory reindex` Phase 0 correctly bails when a
    /// live session holds a fresh claim — i.e., the CLI cannot steal a live
    /// session's lock and then mutate the index concurrently.
    #[test]
    fn test_try_claim_reindex_fails_when_fresh_claim_held() {
        let tmp = TempDir::new().unwrap();
        let idx = test_index(&tmp);

        // First caller claims unconditionally (stale threshold = i64::MAX means
        // any pre-existing claim is already "expired").
        let first = idx.try_claim_reindex(i64::MAX);
        assert!(first, "first claim should succeed on fresh index");

        // A second caller with STALE_SECS=60 must fail because the claim was
        // set moments ago and is not yet older than 60 seconds.
        let second = idx.try_claim_reindex(60);
        assert!(
            !second,
            "CLI reindex must not steal a fresh claim held by a live session"
        );

        // After the first owner releases, the CLI can claim successfully.
        idx.release_claim();
        let third = idx.try_claim_reindex(60);
        assert!(
            third,
            "CLI reindex must succeed after the live session releases"
        );
        idx.release_claim();
    }

    /// `nofy memory reindex` Phase 3 resets the stale reindex claim.
    ///
    /// Verifies that `release_claim()` clears `meta.reindex_claim` so that
    /// `nofy memory doctor` no longer reports a stale lock after reindex runs.
    #[test]
    fn test_reindex_maintenance_resets_stale_claim() {
        let tmp = TempDir::new().unwrap();
        let idx = test_index(&tmp);

        // Acquire the claim using stale_secs=0 (steals any existing claim)
        // so we start with a known non-empty claim value.
        let claimed = idx.try_claim_reindex(0);
        assert!(claimed, "try_claim_reindex should succeed on a fresh index");
        assert!(
            !idx.get_reindex_claim().is_empty(),
            "claim must be set before Phase 3"
        );

        // Simulate `nofy memory reindex` Phase 3: release the claim.
        idx.release_claim();

        assert_eq!(
            idx.get_reindex_claim(),
            "",
            "release_claim must reset the claim so doctor reports no stale lock"
        );
    }

    #[test]
    fn test_reindex_records_origin() {
        let tmp = TempDir::new().unwrap();
        let mut idx = test_index(&tmp);

        let file_path = tmp.path().join("test.md");
        std::fs::write(&file_path, "# Title\n\nOwner-written note.").unwrap();
        idx.reindex_file(&file_path, "workspace", "owner").unwrap();

        let origin: String = idx
            .db
            .query_row(
                "SELECT origin FROM chunks WHERE path = ?1",
                params![file_path.to_string_lossy().to_string()],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(origin, "owner");

        // A later reindex by another writer updates the origin with the
        // content (file-level provenance, openclaw-style downgrade).
        std::fs::write(&file_path, "# Title\n\nAgent-revised note.").unwrap();
        idx.reindex_file(&file_path, "workspace", "agent").unwrap();
        let origin: String = idx
            .db
            .query_row(
                "SELECT origin FROM chunks WHERE path = ?1",
                params![file_path.to_string_lossy().to_string()],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(origin, "agent");
    }

    #[test]
    fn test_legacy_db_gains_origin_column() {
        let tmp = TempDir::new().unwrap();
        let db_path = tmp.path().join("legacy.sqlite");

        // Build a pre-provenance database: the old schema without `origin`.
        {
            let db = rusqlite::Connection::open(&db_path).unwrap();
            db.execute_batch(
                "CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);\n\
                 CREATE TABLE chunks (\n\
                     rowid INTEGER PRIMARY KEY AUTOINCREMENT,\n\
                     id TEXT UNIQUE NOT NULL,\n\
                     path TEXT NOT NULL,\n\
                     start_line INTEGER NOT NULL,\n\
                     end_line INTEGER NOT NULL,\n\
                     text TEXT NOT NULL,\n\
                     hash TEXT NOT NULL,\n\
                     source TEXT NOT NULL,\n\
                     created_at INTEGER NOT NULL,\n\
                     updated_at INTEGER NOT NULL,\n\
                     access_count INTEGER DEFAULT 0,\n\
                     last_accessed INTEGER\n\
                 );",
            )
            .unwrap();
        }

        // Opening migrates idempotently.
        let storage = test_storage(&tmp);
        let mut idx =
            MemoryIndex::open_or_create(&db_path, storage, MemoryIndexConfig::default(), 1536)
                .unwrap();

        let file_path = tmp.path().join("test.md");
        std::fs::write(&file_path, "# Title\n\nMigrated content.").unwrap();
        let result = idx.reindex_file(&file_path, "workspace", "agent").unwrap();
        assert_eq!(result.added, 1);

        let origin: String = idx
            .db
            .query_row(
                "SELECT origin FROM chunks WHERE path = ?1",
                params![file_path.to_string_lossy().to_string()],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(origin, "agent");

        // Re-opening is a no-op migration (idempotent).
        drop(idx);
        let storage = test_storage(&tmp);
        MemoryIndex::open_or_create(&db_path, storage, MemoryIndexConfig::default(), 1536).unwrap();
    }

    #[test]
    fn test_delete_derived_indexes_removes_truncate_per_host_and_journal_sidecars() {
        let tmp = TempDir::new().unwrap();
        let project_id = ProjectId::new();
        let layout = UnifiedMemoryLayout::new(tmp.path());

        let mut expected_removed = Vec::new();
        for scope in [layout.personal_scope(), layout.project_scope(project_id)] {
            std::fs::create_dir_all(scope.root()).unwrap();
            let base = scope.root().join("index.sqlite");
            let per_host = JournalMode::Truncate.effective_db_path(&base);
            for db in [base, per_host] {
                for suffix in ["", "-journal", "-wal", "-shm"] {
                    let mut p = db.as_os_str().to_os_string();
                    p.push(suffix);
                    let path = PathBuf::from(p);
                    std::fs::write(&path, b"placeholder").unwrap();
                    expected_removed.push(path);
                }
            }
        }

        UnifiedMemoryIndex::delete_derived_indexes(tmp.path(), project_id).unwrap();

        for path in expected_removed {
            assert!(
                !path.exists(),
                "expected derived index artifact to be removed: {}",
                path.display()
            );
        }
    }

    fn set_file_mtime(path: &Path, time: std::time::SystemTime) {
        let file = std::fs::OpenOptions::new().write(true).open(path).unwrap();
        file.set_modified(time).unwrap();
    }

    #[test]
    fn unified_refresh_skips_unmodified_files_and_recomputes_same_length_mtime_edits() {
        let tmp = TempDir::new().unwrap();
        let root = tmp.path().join("memory");
        let project_id = ProjectId::new();
        let topics_dir = root.join("personal/topics");
        std::fs::create_dir_all(&topics_dir).unwrap();

        let id_a = uuid::Uuid::new_v4();
        let id_b = uuid::Uuid::new_v4();
        let id_c = uuid::Uuid::new_v4();
        let topic_a = topics_dir.join("a.md");
        let topic_b = topics_dir.join("b.md");
        let topic_c = topics_dir.join("c.md");

        let body_a =
            format!("<!-- nofy-memory: id={id_a}; revision=1 -->\n# A\n\nKeep zebra note.\n");
        let body_b_v1 =
            format!("<!-- nofy-memory: id={id_b}; revision=1 -->\n# B\n\nToken alpha value.\n");
        let body_b_v2 =
            format!("<!-- nofy-memory: id={id_b}; revision=1 -->\n# B\n\nToken bravo value.\n");
        let body_c =
            format!("<!-- nofy-memory: id={id_c}; revision=1 -->\n# C\n\nDrop quartz note.\n");
        assert_eq!(
            body_b_v1.len(),
            body_b_v2.len(),
            "same-length edit precondition"
        );

        let old_time = std::time::SystemTime::now() - std::time::Duration::from_secs(5);
        for (path, content) in [
            (&topic_a, &body_a),
            (&topic_b, &body_b_v1),
            (&topic_c, &body_c),
        ] {
            std::fs::write(path, content).unwrap();
            set_file_mtime(path, old_time);
        }

        let mut index =
            UnifiedMemoryIndex::open(&root, project_id, MemoryIndexConfig::default(), 4).unwrap();
        let first = index.refresh().unwrap();
        assert_eq!(first.topics, 3);
        let first_stats = index.last_refresh_stats();
        assert_eq!(first_stats.files_hashed, 3);
        assert_eq!(first_stats.files_reindexed, 3);

        // Second refresh with unmodified files past the racy-clean window must skip all disk reads & blake3.
        let second = index.refresh().unwrap();
        assert_eq!(second, UnifiedRebuildResult::default());
        let second_stats = index.last_refresh_stats();
        assert_eq!(second_stats.files_skipped, 3);
        assert_eq!(second_stats.files_hashed, 0);
        assert_eq!(second_stats.files_reindexed, 0);

        // Overwrite topic_b with the EXACT same byte length and an updated mtime.
        let newer_time = std::time::SystemTime::now() - std::time::Duration::from_secs(2);
        std::fs::write(&topic_b, &body_b_v2).unwrap();
        set_file_mtime(&topic_b, newer_time);

        let third = index.refresh().unwrap();
        assert_eq!(third.topics, 1);
        let third_stats = index.last_refresh_stats();
        assert_eq!(third_stats.files_skipped, 2);
        assert_eq!(third_stats.files_hashed, 1);
        assert_eq!(third_stats.files_reindexed, 1);

        assert!(
            !index.indexes()[0]
                .search_fts("bravo", 10)
                .unwrap()
                .is_empty(),
            "same-length modified file must be reindexed"
        );
        assert!(
            index.indexes()[0]
                .search_fts("alpha", 10)
                .unwrap()
                .is_empty(),
            "stale token from same-length file must be removed"
        );
        assert!(
            !index.indexes()[0]
                .search_fts("zebra", 10)
                .unwrap()
                .is_empty(),
            "untouched file must remain indexed"
        );

        // Delete topic_c: remaining two files are still skipped, deleted file is removed.
        std::fs::remove_file(&topic_c).unwrap();
        let fourth = index.refresh().unwrap();
        assert_eq!(fourth.topics, 0);
        let fourth_stats = index.last_refresh_stats();
        assert_eq!(fourth_stats.files_skipped, 2);
        assert_eq!(fourth_stats.files_hashed, 0);
        assert_eq!(fourth_stats.files_removed, 1);
        assert!(
            index.indexes()[0]
                .search_fts("quartz", 10)
                .unwrap()
                .is_empty(),
            "deleted topic must be removed from FTS"
        );
    }

    #[test]
    fn unified_refresh_rehashes_racy_clean_whole_second_and_forced_rebuild() {
        let tmp = TempDir::new().unwrap();
        let root = tmp.path().join("memory");
        let project_id = ProjectId::new();
        let topics_dir = root.join("personal/topics");
        std::fs::create_dir_all(&topics_dir).unwrap();

        let id = uuid::Uuid::new_v4();
        let topic = topics_dir.join("racy.md");
        let v1 = format!("<!-- nofy-memory: id={id}; revision=1 -->\n# Racy\n\nWord delta.\n");
        let v2 = format!("<!-- nofy-memory: id={id}; revision=1 -->\n# Racy\n\nWord gamma.\n");
        assert_eq!(v1.len(), v2.len());

        // Pin to the current whole second (nanos == 0) so the file is racy-clean.
        let now_secs = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let coarse_time = std::time::UNIX_EPOCH + std::time::Duration::from_secs(now_secs);
        std::fs::write(&topic, &v1).unwrap();
        set_file_mtime(&topic, coarse_time);

        let mut index =
            UnifiedMemoryIndex::open(&root, project_id, MemoryIndexConfig::default(), 4).unwrap();
        index.refresh().unwrap();

        // Overwrite with identical length AND identical whole-second mtime.
        std::fs::write(&topic, &v2).unwrap();
        set_file_mtime(&topic, coarse_time);

        let refreshed = index.refresh().unwrap();
        assert_eq!(refreshed.topics, 1);
        let stats = index.last_refresh_stats();
        assert_eq!(stats.files_skipped, 0);
        assert_eq!(stats.files_hashed, 1);
        assert!(
            !index.indexes()[0]
                .search_fts("gamma", 10)
                .unwrap()
                .is_empty(),
            "racy-clean same-second edit must never be skipped"
        );
        assert!(
            index.indexes()[0]
                .search_fts("delta", 10)
                .unwrap()
                .is_empty()
        );

        // Forced rebuild always re-hashes even old files.
        let old_time = std::time::SystemTime::now() - std::time::Duration::from_secs(10);
        set_file_mtime(&topic, old_time);
        index.refresh().unwrap();
        index.rebuild().unwrap();
        let rebuild_stats = index.last_refresh_stats();
        assert_eq!(rebuild_stats.files_skipped, 0);
        assert_eq!(rebuild_stats.files_hashed, 1);
    }
}
