//! SQL schema constants for the memory index.
//!
//! The index uses three tables:
//! - `meta` — key-value metadata (embedding dimensions, schema version)
//! - `chunks` — indexed text chunks with blake3 content hashes
//! - `chunks_fts` — contentless FTS5 virtual table for BM25 keyword search
//!
//! When sqlite-vec is available, a fourth table is created:
//! - `chunks_vec` — vec0 virtual table for KNN vector search

/// Schema version. Bump when making breaking schema changes that require
/// dropping and recreating tables.
pub const SCHEMA_VERSION: u32 = 1;

/// Generate the SQL schema for the memory index.
///
/// `dimensions` controls the embedding vector size for `chunks_vec`.
/// If `vec_available` is false, the `chunks_vec` table is not created.
///
/// Connection pragmas (busy_timeout, journal_mode) are applied on the open
/// path (`nofy_sqlite_journal::JournalMode::open`) — the journal mode depends
/// on the database's filesystem.
pub fn schema_sql(dimensions: usize, vec_available: bool) -> String {
    let mut sql = format!(
        r#"
CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chunks (
    rowid INTEGER PRIMARY KEY AUTOINCREMENT,
    id TEXT UNIQUE NOT NULL,
    path TEXT NOT NULL,
    start_line INTEGER NOT NULL,
    end_line INTEGER NOT NULL,
    text TEXT NOT NULL,
    hash TEXT NOT NULL,
    source TEXT NOT NULL,
    origin TEXT NOT NULL DEFAULT 'agent',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    access_count INTEGER DEFAULT 0,
    last_accessed INTEGER
);

CREATE INDEX IF NOT EXISTS idx_chunks_path ON chunks(path);
CREATE INDEX IF NOT EXISTS idx_chunks_hash ON chunks(hash);

CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(text, content='');

INSERT OR IGNORE INTO meta(key, value) VALUES ('reindex_claim', '');
"#
    );

    if vec_available {
        sql.push_str(&format!(
            "\nCREATE VIRTUAL TABLE IF NOT EXISTS chunks_vec USING vec0(\n    \
             chunk_id TEXT PRIMARY KEY,\n    \
             embedding FLOAT[{dimensions}]\n);\n"
        ));
    }

    sql
}

/// SQL to insert or update an embedding dimension record in the meta table.
pub const UPSERT_META_SQL: &str = "INSERT OR REPLACE INTO meta(key, value) VALUES (?1, ?2)";

/// SQL to query a meta value by key.
pub const GET_META_SQL: &str = "SELECT value FROM meta WHERE key = ?1";

/// Durable unified-memory ledger schema version.
pub const UNIFIED_STATE_SCHEMA_VERSION: u32 = 1;

/// Global capture queue and process-independent metadata (`meta.sqlite`).
pub const UNIFIED_META_SCHEMA_SQL: &str = r#"
CREATE TABLE IF NOT EXISTS metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS capture_jobs (
    id TEXT PRIMARY KEY,
    payload TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'queued',
    worker_id TEXT,
    generation INTEGER NOT NULL DEFAULT 0,
    lease_until INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_capture_jobs_claimable
    ON capture_jobs(state, lease_until, created_at);
CREATE TABLE IF NOT EXISTS capture_outcomes (
    job_id TEXT NOT NULL,
    generation INTEGER NOT NULL,
    outcome TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY(job_id, generation),
    FOREIGN KEY(job_id) REFERENCES capture_jobs(id) ON DELETE CASCADE
);
"#;

/// Per-scope canonical state ledger (`state.sqlite`).
pub const UNIFIED_SCOPE_SCHEMA_SQL: &str = r#"
CREATE TABLE IF NOT EXISTS metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY,
    path TEXT NOT NULL UNIQUE,
    kind TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    immutable INTEGER NOT NULL CHECK(immutable IN (0, 1)),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS observation_states (
    observation_id TEXT PRIMARY KEY,
    file_id TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK(status IN ('active', 'superseded', 'disputed')),
    resolved_by TEXT,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY(file_id) REFERENCES files(id) ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS operations (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    phase TEXT NOT NULL,
    target_path TEXT,
    expected_hash TEXT,
    error TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS operation_claims (
    operation_id TEXT PRIMARY KEY,
    worker_id TEXT NOT NULL,
    generation INTEGER NOT NULL,
    lease_until INTEGER NOT NULL,
    FOREIGN KEY(operation_id) REFERENCES operations(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS topic_changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operation_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    previous_hash TEXT,
    next_hash TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(operation_id) REFERENCES operations(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS tombstones (
    id TEXT PRIMARY KEY,
    target_kind TEXT NOT NULL,
    target_id TEXT NOT NULL,
    previous_hash TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    retention_deadline INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS quarantine (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_kind TEXT NOT NULL,
    record_id TEXT,
    reason TEXT NOT NULL,
    payload TEXT NOT NULL,
    created_at INTEGER NOT NULL
);
"#;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_schema_sql_without_vec() {
        let sql = schema_sql(1536, false);
        assert!(sql.contains("CREATE TABLE IF NOT EXISTS chunks"));
        assert!(sql.contains("CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts"));
        assert!(!sql.contains("chunks_vec"));
        // Connection pragmas live on the open path, not in the schema batch.
        assert!(!sql.contains("PRAGMA"));
    }

    #[test]
    fn test_schema_sql_with_vec() {
        let sql = schema_sql(384, true);
        assert!(sql.contains("chunks_vec"));
        assert!(sql.contains("FLOAT[384]"));
    }

    #[test]
    fn test_schema_sql_different_dimensions() {
        let sql = schema_sql(768, true);
        assert!(sql.contains("FLOAT[768]"));
    }
}
