//! Durable state ledger for the unified memory model.

use std::path::{Path, PathBuf};

use nofy_sqlite_journal::JournalMode;
use rusqlite::{Connection, OptionalExtension, params};
use thiserror::Error;

use crate::atomic_file;
use crate::model::{
    Observation, ObservationId, ObservationStatus, ObservationView, OperationId, OperationPhase,
};
use crate::schema::{
    UNIFIED_META_SCHEMA_SQL, UNIFIED_SCOPE_SCHEMA_SQL, UNIFIED_STATE_SCHEMA_VERSION,
};

#[derive(Debug, Error)]
pub enum StateError {
    #[error("memory state I/O failed: {0}")]
    Io(#[from] std::io::Error),
    #[error("memory state database failed: {0}")]
    Sql(#[from] rusqlite::Error),
    #[error("observation {0} is immutable and its content hash changed")]
    ImmutableObservation(String),
    #[error("capture lease is stale or already completed")]
    StaleCaptureLease,
    #[error("operation lease is stale or no longer owned by this worker")]
    StaleOperationLease,
    #[error("invalid persisted observation status: {0}")]
    InvalidObservationStatus(String),
    #[error("invalid persisted operation phase: {0}")]
    InvalidOperationPhase(String),
    #[error("injected state failure at {0:?}")]
    Injected(StateKillPoint),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum StateKillPoint {
    DatabaseBeforeCommit,
    DatabaseAfterCommit,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CaptureJobClaim {
    pub job_id: String,
    pub worker_id: String,
    pub generation: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct OperationClaim {
    pub operation_id: OperationId,
    pub worker_id: String,
    pub generation: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DatabaseSettings {
    pub journal_mode: String,
    pub foreign_keys: bool,
    pub busy_timeout_ms: u64,
    pub schema_version: u32,
}

/// Owns the global capture queue and one scope's canonical state connection.
pub struct UnifiedState {
    meta: Connection,
    scope: Connection,
}

impl UnifiedState {
    pub fn open(meta_database: PathBuf, scope_database: PathBuf) -> Result<Self, StateError> {
        let meta = open_database(&meta_database, UNIFIED_META_SCHEMA_SQL)?;
        let scope = open_database(&scope_database, UNIFIED_SCOPE_SCHEMA_SQL)?;
        let state = Self { meta, scope };
        state.recover_interrupted_operations()?;
        Ok(state)
    }

    pub fn meta_settings(&self) -> Result<DatabaseSettings, StateError> {
        database_settings(&self.meta)
    }

    pub fn scope_settings(&self) -> Result<DatabaseSettings, StateError> {
        database_settings(&self.scope)
    }

    pub fn enqueue_capture_job(
        &self,
        job_id: &str,
        payload: &str,
        now: i64,
    ) -> Result<(), StateError> {
        self.meta.execute(
            "INSERT OR IGNORE INTO capture_jobs
             (id, payload, state, generation, created_at, updated_at)
             VALUES (?1, ?2, 'pending', 0, ?3, ?3)",
            params![job_id, payload, now],
        )?;
        Ok(())
    }

    /// Claim one pending or expired job. The incremented generation fences
    /// every older worker, even when it continues running after lease expiry.
    pub fn claim_capture_job(
        &self,
        worker_id: &str,
        now: i64,
        lease_secs: i64,
    ) -> Result<Option<CaptureJobClaim>, StateError> {
        let lease_until = now.saturating_add(lease_secs.max(1));
        let claim = self
            .meta
            .query_row(
                "UPDATE capture_jobs
                 SET state = 'leased', worker_id = ?1,
                     generation = generation + 1, lease_until = ?2, updated_at = ?3
                 WHERE id = (
                     SELECT id FROM capture_jobs
                     WHERE state = 'pending'
                        OR (state = 'leased' AND lease_until <= ?3)
                     ORDER BY created_at, id LIMIT 1
                 )
                 RETURNING id, generation",
                params![worker_id, lease_until, now],
                |row| Ok((row.get::<_, String>(0)?, row.get::<_, u64>(1)?)),
            )
            .optional()?;
        Ok(claim.map(|(job_id, generation)| CaptureJobClaim {
            job_id,
            worker_id: worker_id.to_owned(),
            generation,
        }))
    }

    pub fn complete_capture_job(
        &self,
        claim: &CaptureJobClaim,
        outcome: &str,
        now: i64,
    ) -> Result<(), StateError> {
        let transaction = self.meta.unchecked_transaction()?;
        let changed = transaction.execute(
            "UPDATE capture_jobs
             SET state = 'completed', lease_until = NULL, updated_at = ?4
             WHERE id = ?1 AND state = 'leased' AND worker_id = ?2 AND generation = ?3",
            params![claim.job_id, claim.worker_id, claim.generation, now],
        )?;
        if changed != 1 {
            return Err(StateError::StaleCaptureLease);
        }
        transaction.execute(
            "INSERT INTO capture_outcomes(job_id, generation, outcome, created_at)
             VALUES (?1, ?2, ?3, ?4)",
            params![claim.job_id, claim.generation, outcome, now],
        )?;
        transaction.commit()?;
        Ok(())
    }

    pub fn capture_outcome(&self, job_id: &str) -> Result<Option<String>, StateError> {
        Ok(self
            .meta
            .query_row(
                "SELECT outcome FROM capture_outcomes
                 WHERE job_id = ?1 ORDER BY generation DESC LIMIT 1",
                [job_id],
                |row| row.get(0),
            )
            .optional()?)
    }

    pub fn register_operation(
        &self,
        operation_id: OperationId,
        kind: &str,
        now: i64,
    ) -> Result<(), StateError> {
        self.scope.execute(
            "INSERT OR IGNORE INTO operations
             (id, kind, phase, created_at, updated_at)
             VALUES (?1, ?2, 'planned', ?3, ?3)",
            params![operation_id.as_uuid().to_string(), kind, now],
        )?;
        Ok(())
    }

    pub fn claim_operation(
        &self,
        operation_id: OperationId,
        worker_id: &str,
        now: i64,
        lease_secs: i64,
    ) -> Result<Option<OperationClaim>, StateError> {
        let lease_until = now.saturating_add(lease_secs.max(1));
        let generation = self
            .scope
            .query_row(
                "INSERT INTO operation_claims(operation_id, worker_id, generation, lease_until)
                 VALUES (?1, ?2, 1, ?3)
                 ON CONFLICT(operation_id) DO UPDATE SET
                     worker_id = excluded.worker_id,
                     generation = operation_claims.generation + 1,
                     lease_until = excluded.lease_until
                 WHERE operation_claims.lease_until <= ?4
                 RETURNING generation",
                params![
                    operation_id.as_uuid().to_string(),
                    worker_id,
                    lease_until,
                    now
                ],
                |row| row.get::<_, u64>(0),
            )
            .optional()?;
        Ok(generation.map(|generation| OperationClaim {
            operation_id,
            worker_id: worker_id.to_owned(),
            generation,
        }))
    }

    pub fn advance_operation(
        &self,
        claim: &OperationClaim,
        phase: OperationPhase,
        now: i64,
    ) -> Result<(), StateError> {
        let changed = self.scope.execute(
            "UPDATE operations SET phase = ?2, updated_at = ?3
             WHERE id = ?1 AND EXISTS (
                 SELECT 1 FROM operation_claims
                 WHERE operation_id = ?1 AND worker_id = ?4
                   AND generation = ?5 AND lease_until > ?3
             )",
            params![
                claim.operation_id.as_uuid().to_string(),
                operation_phase_name(phase),
                now,
                claim.worker_id,
                claim.generation
            ],
        )?;
        if changed != 1 {
            return Err(StateError::StaleOperationLease);
        }
        Ok(())
    }

    /// Register an immutable observation file without storing a second copy of
    /// its statement or `supersedes` relation in SQLite.
    pub fn record_observation_file(
        &self,
        observation: &Observation,
        relative_path: &str,
    ) -> Result<(), StateError> {
        observation.validate().map_err(|error| {
            StateError::Io(std::io::Error::new(std::io::ErrorKind::InvalidInput, error))
        })?;
        let id = observation.id.as_uuid().to_string();
        let now = observation.created_at.timestamp();
        let transaction = self.scope.unchecked_transaction()?;
        transaction.execute(
            "INSERT OR IGNORE INTO files
             (id, path, kind, content_hash, immutable, created_at, updated_at)
             VALUES (?1, ?2, 'observation', ?3, 1, ?4, ?4)",
            params![id, relative_path, observation.content_hash.as_str(), now],
        )?;
        let stored_hash: String = transaction.query_row(
            "SELECT content_hash FROM files WHERE id = ?1",
            [&id],
            |row| row.get(0),
        )?;
        if stored_hash != observation.content_hash.as_str() {
            return Err(StateError::ImmutableObservation(id));
        }
        transaction.execute(
            "INSERT OR IGNORE INTO observation_states
             (observation_id, file_id, status, resolved_by, updated_at)
             VALUES (?1, ?1, 'active', NULL, ?2)",
            params![id, now],
        )?;
        transaction.commit()?;
        Ok(())
    }

    pub fn set_observation_status(
        &self,
        observation_id: ObservationId,
        status: ObservationStatus,
        resolved_by: Option<ObservationId>,
    ) -> Result<(), StateError> {
        self.scope.execute(
            "UPDATE observation_states
             SET status = ?2, resolved_by = ?3, updated_at = unixepoch()
             WHERE observation_id = ?1",
            params![
                observation_id.as_uuid().to_string(),
                observation_status_name(status),
                resolved_by.map(|id| id.as_uuid().to_string())
            ],
        )?;
        Ok(())
    }

    pub fn observation_view(
        &self,
        observation: Observation,
    ) -> Result<ObservationView, StateError> {
        let (status, resolved_by): (String, Option<String>) = self.scope.query_row(
            "SELECT status, resolved_by FROM observation_states WHERE observation_id = ?1",
            [observation.id.as_uuid().to_string()],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )?;
        let resolved_by = resolved_by
            .map(|id| uuid::Uuid::parse_str(&id))
            .transpose()
            .map_err(|error| {
                StateError::Io(std::io::Error::new(std::io::ErrorKind::InvalidData, error))
            })?
            .map(ObservationId::try_from)
            .transpose()
            .map_err(|error| {
                StateError::Io(std::io::Error::new(std::io::ErrorKind::InvalidData, error))
            })?;
        Ok(ObservationView {
            observation,
            status: parse_observation_status(&status)?,
            resolved_by,
        })
    }

    pub fn replace_canonical_file(
        &self,
        operation_id: OperationId,
        path: &Path,
        contents: &[u8],
        kill_point: Option<StateKillPoint>,
    ) -> Result<(), StateError> {
        let id = operation_id.as_uuid().to_string();
        let target = path.to_string_lossy().into_owned();
        let hash = blake3::hash(contents).to_hex().to_string();
        let now = chrono::Utc::now().timestamp();
        self.scope.execute(
            "INSERT OR IGNORE INTO operations
             (id, kind, phase, target_path, expected_hash, created_at, updated_at)
             VALUES (?1, 'canonical_replace', 'planned', ?2, ?3, ?4, ?4)",
            params![id, target, hash, now],
        )?;

        atomic_file::replace(path, contents)?;
        inject(kill_point, StateKillPoint::DatabaseBeforeCommit)?;

        let transaction = self.scope.unchecked_transaction()?;
        transaction.execute(
            "INSERT INTO files
             (id, path, kind, content_hash, immutable, created_at, updated_at)
             VALUES (?1, ?2, 'topic', ?3, 0, ?4, ?4)
             ON CONFLICT(path) DO UPDATE SET
                 content_hash = excluded.content_hash,
                 updated_at = excluded.updated_at",
            params![id, target, hash, now],
        )?;
        transaction.execute(
            "UPDATE operations SET phase = 'canonical_committed', updated_at = ?2 WHERE id = ?1",
            params![id, now],
        )?;
        transaction.commit()?;
        inject(kill_point, StateKillPoint::DatabaseAfterCommit)?;
        Ok(())
    }

    pub fn operation_phase(
        &self,
        operation_id: OperationId,
    ) -> Result<Option<OperationPhase>, StateError> {
        self.scope
            .query_row(
                "SELECT phase FROM operations WHERE id = ?1",
                [operation_id.as_uuid().to_string()],
                |row| row.get::<_, String>(0),
            )
            .optional()?
            .map(|phase| parse_operation_phase(&phase))
            .transpose()
    }

    fn recover_interrupted_operations(&self) -> Result<(), StateError> {
        let candidates = {
            let mut statement = self.scope.prepare(
                "SELECT id, target_path, expected_hash FROM operations
                 WHERE phase = 'planned' AND kind = 'canonical_replace'",
            )?;
            statement
                .query_map([], |row| {
                    Ok((
                        row.get::<_, String>(0)?,
                        row.get::<_, String>(1)?,
                        row.get::<_, String>(2)?,
                    ))
                })?
                .collect::<Result<Vec<_>, _>>()?
        };

        for (id, target_path, expected_hash) in candidates {
            let Ok(contents) = std::fs::read(&target_path) else {
                continue;
            };
            let actual_hash = blake3::hash(&contents).to_hex().to_string();
            if actual_hash != expected_hash {
                continue;
            }
            let now = chrono::Utc::now().timestamp();
            let transaction = self.scope.unchecked_transaction()?;
            transaction.execute(
                "INSERT INTO files
                 (id, path, kind, content_hash, immutable, created_at, updated_at)
                 VALUES (?1, ?2, 'topic', ?3, 0, ?4, ?4)
                 ON CONFLICT(path) DO UPDATE SET
                     content_hash = excluded.content_hash,
                     updated_at = excluded.updated_at",
                params![id, target_path, expected_hash, now],
            )?;
            transaction.execute(
                "UPDATE operations SET phase = 'canonical_committed', updated_at = ?2
                 WHERE id = ?1 AND phase = 'planned'",
                params![id, now],
            )?;
            transaction.commit()?;
        }
        Ok(())
    }
}

fn open_database(path: &Path, schema: &str) -> Result<Connection, StateError> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let connection = JournalMode::Wal.open(path)?;
    connection.pragma_update(None, "foreign_keys", true)?;
    connection.execute_batch(schema)?;
    connection.pragma_update(None, "user_version", UNIFIED_STATE_SCHEMA_VERSION)?;
    connection.execute(
        "INSERT OR REPLACE INTO metadata(key, value) VALUES ('schema_version', ?1)",
        [UNIFIED_STATE_SCHEMA_VERSION.to_string()],
    )?;
    Ok(connection)
}

fn database_settings(connection: &Connection) -> Result<DatabaseSettings, StateError> {
    Ok(DatabaseSettings {
        journal_mode: connection.query_row("PRAGMA journal_mode", [], |row| row.get(0))?,
        foreign_keys: connection
            .query_row("PRAGMA foreign_keys", [], |row| row.get::<_, i64>(0))?
            != 0,
        busy_timeout_ms: connection
            .query_row("PRAGMA busy_timeout", [], |row| row.get::<_, u64>(0))?,
        schema_version: connection.query_row("PRAGMA user_version", [], |row| row.get(0))?,
    })
}

fn inject(configured: Option<StateKillPoint>, current: StateKillPoint) -> Result<(), StateError> {
    if configured == Some(current) {
        return Err(StateError::Injected(current));
    }
    Ok(())
}

fn observation_status_name(status: ObservationStatus) -> &'static str {
    match status {
        ObservationStatus::Active => "active",
        ObservationStatus::Superseded => "superseded",
        ObservationStatus::Disputed => "disputed",
    }
}

fn parse_observation_status(value: &str) -> Result<ObservationStatus, StateError> {
    match value {
        "active" => Ok(ObservationStatus::Active),
        "superseded" => Ok(ObservationStatus::Superseded),
        "disputed" => Ok(ObservationStatus::Disputed),
        other => Err(StateError::InvalidObservationStatus(other.to_owned())),
    }
}

fn parse_operation_phase(value: &str) -> Result<OperationPhase, StateError> {
    match value {
        "planned" => Ok(OperationPhase::Planned),
        "evidence_claimed" => Ok(OperationPhase::EvidenceClaimed),
        "canonical_committed" => Ok(OperationPhase::CanonicalCommitted),
        "derivatives_rebuilt" => Ok(OperationPhase::DerivativesRebuilt),
        "evidence_archived" => Ok(OperationPhase::EvidenceArchived),
        "completed" => Ok(OperationPhase::Completed),
        "failed" => Ok(OperationPhase::Failed),
        other => Err(StateError::InvalidOperationPhase(other.to_owned())),
    }
}

fn operation_phase_name(phase: OperationPhase) -> &'static str {
    match phase {
        OperationPhase::Planned => "planned",
        OperationPhase::EvidenceClaimed => "evidence_claimed",
        OperationPhase::CanonicalCommitted => "canonical_committed",
        OperationPhase::DerivativesRebuilt => "derivatives_rebuilt",
        OperationPhase::EvidenceArchived => "evidence_archived",
        OperationPhase::Completed => "completed",
        OperationPhase::Failed => "failed",
    }
}
