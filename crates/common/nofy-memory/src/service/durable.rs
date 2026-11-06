//! Versioned receipts in the original global SQLite ledger, not a second store.
use super::*;
use nofy_sqlite_journal::JournalMode;
use rusqlite::{Connection, OptionalExtension, params};
use serde::{Deserialize, Serialize};

const PROTOCOL: &str = "nofy.memory-undo/v1";
const MAX_RECORD: usize = 1024 * 1024;
const TABLE: &str = "CREATE TABLE IF NOT EXISTS nofy_service_undo_v1(
 owner TEXT NOT NULL, token TEXT NOT NULL, area TEXT NOT NULL, target TEXT NOT NULL,
 phase TEXT NOT NULL, payload TEXT, bytes INTEGER NOT NULL, undo_id TEXT, receipt TEXT,
 PRIMARY KEY(owner,token));
 CREATE INDEX IF NOT EXISTS nofy_undo_scope ON nofy_service_undo_v1(area,target,phase);";

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct DurableUndoOptions {
    pub max_pending: u32,
    pub max_bytes: u64,
}
impl Default for DurableUndoOptions {
    fn default() -> Self {
        Self {
            max_pending: 1024,
            max_bytes: 64 * 1024 * 1024,
        }
    }
}
impl DurableUndoOptions {
    pub fn validate(&self) -> MemoryServiceResult<()> {
        if !(1..=65536).contains(&self.max_pending)
            || !(4096..=1024 * 1024 * 1024).contains(&self.max_bytes)
        {
            return Err(MemoryServiceError::InvalidRequest(
                "invalid durable undo limits".into(),
            ));
        }
        Ok(())
    }
}

#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Data {
    entry: UndoEntry,
    deactivate: ObservationId,
    reactivate: Option<ObservationId>,
}
struct Row {
    area: MemoryArea,
    target: String,
    phase: String,
    data: Option<Data>,
    undo_id: Option<OperationId>,
    receipt: Option<UndoReceipt>,
}
struct Store(Connection);
fn corrupt() -> MemoryServiceError {
    MemoryServiceError::Unavailable("invalid durable memory undo ledger".into())
}
fn area_name(area: &MemoryArea) -> &'static str {
    match area {
        MemoryArea::Personal => "personal",
        MemoryArea::Project => "project",
    }
}
fn parse_area(value: &str) -> MemoryServiceResult<MemoryArea> {
    match value {
        "personal" => Ok(MemoryArea::Personal),
        "project" => Ok(MemoryArea::Project),
        _ => Err(corrupt()),
    }
}
fn operation(token: &str) -> MemoryServiceResult<OperationId> {
    OperationId::try_from(Uuid::parse_str(token).map_err(|_| corrupt())?).map_err(|_| corrupt())
}

impl Store {
    fn open(path: &Path, create: bool) -> MemoryServiceResult<Option<Self>> {
        if !create && !path.try_exists().map_err(internal_error)? {
            return Ok(None);
        }
        let db = JournalMode::Wal.open(path).map_err(internal_error)?;
        if !create {
            let exists: bool = db.query_row("SELECT EXISTS(SELECT 1 FROM sqlite_master WHERE type='table' AND name='nofy_service_undo_v1')", [], |row| row.get(0)).map_err(internal_error)?;
            if !exists {
                return Ok(None);
            }
        }
        db.execute_batch(crate::schema::UNIFIED_META_SCHEMA_SQL)
            .map_err(internal_error)?;
        let previous: Option<String> = db
            .query_row(
                "SELECT value FROM metadata WHERE key='memory_undo_protocol'",
                [],
                |row| row.get(0),
            )
            .optional()
            .map_err(internal_error)?;
        if previous.as_deref().is_some_and(|value| value != PROTOCOL) {
            return Err(corrupt());
        }
        if create {
            // DDL that finds existing tables can establish a read snapshot.
            // Reserve the writer before it, rather than later upgrading that
            // snapshot while a peer initializes or commits a receipt.
            let tx =
                rusqlite::Transaction::new_unchecked(&db, rusqlite::TransactionBehavior::Immediate)
                    .map_err(internal_error)?;
            tx.execute_batch(TABLE).map_err(internal_error)?;
            tx.execute(
                "INSERT OR IGNORE INTO metadata(key,value) VALUES ('memory_undo_protocol',?1)",
                [PROTOCOL],
            )
            .map_err(internal_error)?;
            tx.commit().map_err(internal_error)?;
        } else if previous.as_deref() != Some(PROTOCOL) {
            return Err(corrupt());
        }
        Ok(Some(Self(db)))
    }
    fn load(&self, owner: &str, token: &str) -> MemoryServiceResult<Row> {
        // One field per SELECT column, in column order.
        struct UndoRow {
            area: String,
            target: String,
            phase: String,
            payload: Option<String>,
            undo_id: Option<String>,
            receipt: Option<String>,
        }
        let raw = self.0.query_row(
            "SELECT area,target,phase,payload,undo_id,receipt FROM nofy_service_undo_v1 WHERE owner=?1 AND token=?2",
            params![owner,token], |row| Ok(UndoRow {
                area: row.get(0)?,
                target: row.get(1)?,
                phase: row.get(2)?,
                payload: row.get(3)?,
                undo_id: row.get(4)?,
                receipt: row.get(5)?,
            }),
        ).optional().map_err(internal_error)?;
        let UndoRow {
            area,
            target,
            phase,
            payload,
            undo_id,
            receipt,
        } = raw.ok_or(MemoryServiceError::NotFound)?;
        if phase == "revoked" {
            return Err(MemoryServiceError::NotFound);
        }
        if !matches!(
            phase.as_str(),
            "prepared" | "available" | "executing" | "completed"
        ) {
            return Err(corrupt());
        }
        operation(&target)?;
        let area = parse_area(&area)?;
        let data: Option<Data> = payload
            .map(|text| serde_json::from_str(&text).map_err(internal_error))
            .transpose()?;
        if let Some(data) = &data {
            let (stored_area, path) = data.entry.location();
            if stored_area != &area
                || crate::model::TopicPath::parse(path.to_string_lossy().into_owned()).is_err()
            {
                return Err(corrupt());
            }
        }
        let receipt = receipt
            .map(|text| serde_json::from_str(&text).map_err(internal_error))
            .transpose()?;
        let undo_id = undo_id.as_deref().map(operation).transpose()?;
        if (phase == "completed") != receipt.is_some()
            || (phase != "completed" && data.is_none())
            || (phase == "executing" && undo_id.is_none())
        {
            return Err(corrupt());
        }
        Ok(Row {
            area,
            target,
            phase,
            data,
            undo_id,
            receipt,
        })
    }
    fn prepare(
        &self,
        owner: &str,
        token: &str,
        target: &str,
        data: &Data,
        options: DurableUndoOptions,
        source_bytes: usize,
    ) -> MemoryServiceResult<()> {
        let payload = serde_json::to_string(data).map_err(internal_error)?;
        let bytes = payload.len().max(source_bytes);
        if bytes > MAX_RECORD {
            return Err(MemoryServiceError::InvalidRequest(
                "durable undo record exceeds 1 MiB".into(),
            ));
        }
        let tx = self.0.unchecked_transaction().map_err(internal_error)?;
        // Acquire the SQLite writer before checking capacity across processes.
        tx.execute(
            "UPDATE metadata SET value=value WHERE key='memory_undo_protocol'",
            [],
        )
        .map_err(internal_error)?;
        let (count,used): (u64,u64) = tx.query_row("SELECT count(*),coalesce(sum(bytes),0) FROM nofy_service_undo_v1 WHERE owner=?1 AND phase IN ('prepared','available','executing')", [owner], |row| Ok((row.get(0)?,row.get(1)?))).map_err(internal_error)?;
        if count >= u64::from(options.max_pending)
            || used.saturating_add(bytes as u64) > options.max_bytes
        {
            return Err(MemoryServiceError::Unavailable(
                "durable undo capacity exhausted; preserve or resolve existing receipts".into(),
            ));
        }
        tx.execute("INSERT INTO nofy_service_undo_v1(owner,token,area,target,phase,payload,bytes) VALUES (?1,?2,?3,?4,'prepared',?5,?6)", params![owner,token,area_name(data.entry.location().0),target,payload,bytes as u64]).map_err(internal_error)?;
        tx.commit().map_err(internal_error)?;
        Ok(())
    }
    fn activate(&self, owner: &str, token: &str) -> MemoryServiceResult<()> {
        self.0.execute("UPDATE nofy_service_undo_v1 SET phase='available' WHERE owner=?1 AND token=?2 AND phase='prepared'", params![owner,token]).map_err(internal_error)?;
        Ok(())
    }
    fn claim(&self, owner: &str, token: &str) -> MemoryServiceResult<OperationId> {
        let id = OperationId::new();
        if self.0.execute("UPDATE nofy_service_undo_v1 SET phase='executing',undo_id=?3 WHERE owner=?1 AND token=?2 AND phase='available'", params![owner,token,id.as_uuid().to_string()]).map_err(internal_error)? != 1 { return Err(corrupt()); }
        Ok(id)
    }
    fn complete(&self, owner: &str, token: &str) -> MemoryServiceResult<UndoReceipt> {
        let tx = self.0.unchecked_transaction().map_err(internal_error)?;
        tx.execute(
            "UPDATE metadata SET value=value WHERE key='memory_undo_protocol'",
            [],
        )
        .map_err(internal_error)?;
        let phase: String = tx
            .query_row(
                "SELECT phase FROM nofy_service_undo_v1 WHERE owner=?1 AND token=?2",
                params![owner, token],
                |row| row.get(0),
            )
            .map_err(internal_error)?;
        if phase != "executing" {
            return Err(corrupt());
        }
        let generation: u64 = tx.query_row("INSERT INTO metadata(key,value) VALUES ('snapshot_generation','1') ON CONFLICT(key) DO UPDATE SET value=CAST(CAST(metadata.value AS INTEGER)+1 AS TEXT) RETURNING CAST(value AS INTEGER)", [], |row| row.get(0)).map_err(internal_error)?;
        let receipt = UndoReceipt {
            restored: true,
            snapshot_generation: generation,
        };
        tx.execute("UPDATE nofy_service_undo_v1 SET phase='completed',payload=NULL,bytes=0,receipt=?3 WHERE owner=?1 AND token=?2 AND phase='executing'", params![owner,token,serde_json::to_string(&receipt).map_err(internal_error)?]).map_err(internal_error)?;
        tx.commit().map_err(internal_error)?;
        Ok(receipt)
    }
}

impl NofyMemoryService {
    /// Explicit opt-in; no migration of pre-existing ephemeral receipts.
    pub fn with_durable_undo(&self, options: DurableUndoOptions) -> MemoryServiceResult<Self> {
        options.validate()?;
        if !self.undo.lock().map_err(|_| corrupt())?.is_empty() {
            return Err(MemoryServiceError::Unavailable(
                "ephemeral undo receipts require explicit migration".into(),
            ));
        }
        if self.durable_undo.is_none() {
            Store::open(&self.layout().meta_database(), true)?;
        }
        Ok(Self {
            config: self.config.clone(),
            undo: self.undo.clone(),
            query_context: self.query_context.clone(),
            durable_undo: Some(options),
        })
    }
    fn undo_owner(&self) -> String {
        self.config.project_id.as_uuid().to_string()
    }
    fn durable_store(&self) -> MemoryServiceResult<Store> {
        // Initialization belongs to the explicit mode installation. Ordinary
        // operations must not reinitialize the ledger, or silently recreate it
        // after its accepted schema/protocol has disappeared.
        Store::open(&self.layout().meta_database(), false)?.ok_or_else(corrupt)
    }
    pub(super) fn prepare_undo(
        &self,
        id: OperationId,
        target: &str,
        entry: &UndoEntry,
        deactivate: ObservationId,
        reactivate: Option<ObservationId>,
        bytes: usize,
    ) -> MemoryServiceResult<()> {
        if let Some(options) = self.durable_undo {
            self.durable_store()?.prepare(
                &self.undo_owner(),
                &id.as_uuid().to_string(),
                target,
                &Data {
                    entry: entry.clone(),
                    deactivate,
                    reactivate,
                },
                options,
                bytes,
            )?;
        }
        Ok(())
    }
    pub(super) fn activate_undo(
        &self,
        id: OperationId,
        area: &MemoryArea,
    ) -> MemoryServiceResult<()> {
        if self
            .memory_state(area)?
            .operation_phase(id)
            .map_err(internal_error)?
            != Some(crate::model::OperationPhase::Completed)
        {
            return Err(corrupt());
        }
        self.durable_store()?
            .activate(&self.undo_owner(), &id.as_uuid().to_string())
    }
    #[cfg(feature = "agent-runtime")]
    pub(super) fn persistent_area(&self, token: &UndoToken) -> MemoryServiceResult<MemoryArea> {
        // Scope admission reads metadata, never the stored plaintext preimage.
        let area: Option<String> = self.durable_store()?.0.query_row("SELECT area FROM nofy_service_undo_v1 WHERE owner=?1 AND token=?2 AND phase<>'revoked'", params![self.undo_owner(),token.operation_id], |row| row.get(0)).optional().map_err(internal_error)?;
        parse_area(&area.ok_or(MemoryServiceError::NotFound)?)
    }
    pub(super) fn ensure_undo_ready(
        &self,
        area: &MemoryArea,
        except: Option<&str>,
    ) -> MemoryServiceResult<()> {
        let state = self.memory_state(area)?;
        if state.has_incomplete_forget().map_err(internal_error)? {
            return Err(MemoryServiceError::Unavailable("memory scope has an incomplete forget; finish cleanup before new writes or learning".into()));
        }
        let Some(store) = Store::open(&self.layout().meta_database(), false)? else {
            return Ok(());
        };
        let mut query = store.0.prepare("SELECT token,undo_id FROM nofy_service_undo_v1 WHERE phase='executing' AND area=?1 AND (area='personal' OR owner=?2)").map_err(internal_error)?;
        let pending = query
            .query_map(params![area_name(area), self.undo_owner()], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
            })
            .map_err(internal_error)?;
        for item in pending {
            let (token, id) = item.map_err(internal_error)?;
            if except == Some(token.as_str()) {
                continue;
            }
            if state
                .operation_phase(operation(&id)?)
                .map_err(internal_error)?
                != Some(crate::model::OperationPhase::Completed)
            {
                return Err(MemoryServiceError::Unavailable(
                    "memory scope has an unfinished durable undo; retry its token first".into(),
                ));
            }
        }
        Ok(())
    }
    pub(super) fn revoke_undos(&self, target: &str, area: &MemoryArea) -> MemoryServiceResult<()> {
        let Some(store) = Store::open(&self.layout().meta_database(), false)? else {
            return Ok(());
        };
        let rows = {
            let mut query = store.0.prepare("SELECT owner,token FROM nofy_service_undo_v1 WHERE target=?1 AND area=?2 AND (area='personal' OR owner=?3) AND phase IN ('prepared','available','executing')").map_err(internal_error)?;
            query
                .query_map(params![target, area_name(area), self.undo_owner()], |row| {
                    Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
                })
                .map_err(internal_error)?
                .collect::<Result<Vec<_>, _>>()
                .map_err(internal_error)?
        };
        for (owner, token) in rows {
            let row = store.load(&owner, &token)?;
            if let Some(id) = row.undo_id {
                let data = row.data.as_ref().ok_or_else(corrupt)?;
                let (created, hash) = match &data.entry {
                    UndoEntry::Created { current_hash, .. } => (true, current_hash),
                    UndoEntry::Revised { current_hash, .. } => (false, current_hash),
                };
                self.access(area)?
                    .revoke_durable_undo(id, created, hash)
                    .map_err(internal_error)?;
            }
            store.0.execute("UPDATE nofy_service_undo_v1 SET phase='revoked',payload=NULL,bytes=0 WHERE owner=?1 AND token=?2 AND phase<>'completed'", params![owner,token]).map_err(internal_error)?;
        }
        Ok(())
    }
    pub(super) fn persistent_undo(&self, token: UndoToken) -> MemoryServiceResult<UndoReceipt> {
        if token.generation != 1 {
            return Err(MemoryServiceError::Conflict);
        }
        let source_id = operation(&token.operation_id)?;
        let store = self.durable_store()?;
        let owner = self.undo_owner();
        let area = store.load(&owner, &token.operation_id)?.area;
        let scope = self.scope_layout(&area);
        let _write = crate::scope_write_lock::ScopeWriteGuard::acquire(scope.root())
            .map_err(internal_error)?;
        let row = store.load(&owner, &token.operation_id)?;
        if let Some(receipt) = row.receipt {
            return Ok(receipt);
        }
        let state = self.memory_state(&area)?;
        if state.was_forgotten(&row.target).map_err(internal_error)? {
            self.revoke_undos(&row.target, &area)?;
            return Err(MemoryServiceError::NotFound);
        }
        self.ensure_undo_ready(&area, Some(&token.operation_id))?;
        if row.phase == "prepared" {
            if state.operation_phase(source_id).map_err(internal_error)?
                != Some(crate::model::OperationPhase::Completed)
            {
                return Err(MemoryServiceError::Unavailable(
                    "source memory operation has not completed".into(),
                ));
            }
            store.activate(&owner, &token.operation_id)?;
        }
        let data = row.data.ok_or_else(corrupt)?;
        let id = if let Some(id) = row.undo_id {
            id
        } else {
            // Conflicts are not queued intents and do not consume the token.
            let topic = self.locate_topic(&row.target)?;
            let (area, path) = data.entry.location();
            if &topic.area != area || topic.relative_path != path {
                return Err(MemoryServiceError::Conflict);
            }
            let before = match &data.entry {
                UndoEntry::Created { current_hash, .. }
                | UndoEntry::Revised { current_hash, .. } => current_hash,
            };
            if &topic.content_hash != before {
                return Err(MemoryServiceError::Conflict);
            }
            store.claim(&owner, &token.operation_id)?
        };
        #[cfg(test)]
        crate::atomic_file::undo_test_exit("claimed");
        let (path, before, after) = match &data.entry {
            UndoEntry::Created {
                relative_path,
                current_hash,
                ..
            } => (relative_path, current_hash, None),
            UndoEntry::Revised {
                relative_path,
                current_hash,
                previous_content,
                ..
            } => (relative_path, current_hash, Some(previous_content.as_str())),
        };
        self.access(&area)?
            .undo_durable(id, path, before, after, data.deactivate, data.reactivate)
            .map_err(internal_error)?;
        self.refresh_index()?;
        let receipt = store.complete(&owner, &token.operation_id)?;
        #[cfg(test)]
        crate::atomic_file::undo_test_exit("receipt");
        Ok(receipt)
    }
}

#[cfg(test)]
mod tests;
