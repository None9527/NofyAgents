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
 CREATE INDEX IF NOT EXISTS nofy_undo_scope ON nofy_service_undo_v1(area,target,phase);
 CREATE TABLE IF NOT EXISTS nofy_memory_remember_calls_v1(
 owner TEXT NOT NULL, call_key TEXT NOT NULL, request_hash TEXT NOT NULL, receipt TEXT,
 native_operation_id TEXT, native_generation INTEGER,
 PRIMARY KEY(owner,call_key));";

#[cfg(feature = "agent-runtime")]
#[derive(Serialize, Deserialize)]
struct RememberCommit {
    target: MemoryTarget,
    undo_token: UndoToken,
    snapshot_generation: u64,
}

#[cfg(feature = "agent-runtime")]
impl RememberCommit {
    fn receipt(self, request: &RememberRequest) -> RememberReceipt {
        RememberReceipt {
            target: self.target,
            area_label: request.area.user_label().to_owned(),
            summary: request.statement.trim().to_owned(),
            undo_token: self.undo_token,
            snapshot_generation: self.snapshot_generation,
        }
    }
}

#[cfg(feature = "agent-runtime")]
struct RememberCall {
    owner: String,
    key: String,
    request_hash: String,
}

#[cfg(feature = "agent-runtime")]
impl RememberCall {
    fn bound_request_hash(&self, id: OperationId) -> String {
        let mut digest = blake3::Hasher::new_derive_key("nofy memory remember call binding v2");
        digest.update(self.owner.as_bytes());
        digest.update(self.key.as_bytes());
        digest.update(self.request_hash.as_bytes());
        digest.update(id.as_uuid().as_bytes());
        format!("v2:{}", digest.finalize().to_hex())
    }
}

#[cfg(feature = "agent-runtime")]
struct RememberClaim {
    commit: Option<RememberCommit>,
    native_id: Option<OperationId>,
}

#[cfg(feature = "agent-runtime")]
impl NofyMemoryService {
    pub(crate) async fn remember_for_call(
        &self,
        operation_id: &str,
        request: RememberRequest,
        lookup_only: bool,
    ) -> MemoryServiceResult<Option<RememberReceipt>> {
        self.require_enabled()?;
        if self.durable_undo.is_none() {
            return if lookup_only {
                Ok(None)
            } else {
                self.remember(request).await.map(Some)
            };
        }
        let call = self.remember_call(operation_id, &request)?;
        let scope = self.scope_layout(&request.area);
        let _scope_write = crate::scope_write_lock::ScopeWriteGuard::acquire(scope.root())
            .map_err(internal_error)?;
        let store = self.durable_store()?;
        let fresh_id = OperationId::new();
        let (native_id, target) = if !lookup_only && store.claim_remember(&call, fresh_id)? {
            let (target, entry) = self.write_remembered_topic(&request, fresh_id)?;
            self.remember_undo(fresh_id, entry)?;
            (fresh_id, target)
        } else {
            let Some(RememberClaim { commit, native_id }) = store.load_remember(&call)? else {
                return pending_remember(lookup_only);
            };
            if let Some(commit) = commit {
                return Ok(Some(commit.receipt(&request)));
            }
            let Some(native_id) = native_id else {
                return pending_remember(lookup_only);
            };
            let Some(target) =
                self.verify_remembered_topic(&store, &call, &request.area, native_id)?
            else {
                return pending_remember(lookup_only);
            };
            (native_id, target)
        };
        let commit = RememberCommit {
            target,
            undo_token: UndoToken {
                operation_id: native_id.as_uuid().to_string(),
                generation: 1,
            },
            snapshot_generation: store.remember_generation(&call, native_id)?,
        };
        store.complete_remember(&call, native_id, &commit)?;
        Ok(Some(commit.receipt(&request)))
    }

    fn remember_call(
        &self,
        operation_id: &str,
        request: &RememberRequest,
    ) -> MemoryServiceResult<RememberCall> {
        Ok(RememberCall {
            owner: self.undo_owner(),
            key: blake3::hash(operation_id.as_bytes()).to_hex().to_string(),
            request_hash: blake3::hash(&serde_json::to_vec(request).map_err(internal_error)?)
                .to_hex()
                .to_string(),
        })
    }

    fn verify_remembered_topic(
        &self,
        store: &Store,
        call: &RememberCall,
        area: &MemoryArea,
        native_id: OperationId,
    ) -> MemoryServiceResult<Option<MemoryTarget>> {
        let token = native_id.as_uuid().to_string();
        let row = match store.load(&call.owner, &token) {
            Ok(row) => row,
            Err(MemoryServiceError::NotFound) => return Ok(None),
            Err(error) => return Err(error),
        };
        if &row.area != area {
            return Err(corrupt());
        }
        if !matches!(row.phase.as_str(), "prepared" | "available") {
            return Ok(None);
        }
        let Some(Data {
            entry:
                UndoEntry::Created {
                    relative_path,
                    current_hash,
                    ..
                },
            ..
        }) = row.data
        else {
            return Err(corrupt());
        };
        let expected_path = format!("remembered-{}.md", row.target);
        if relative_path != Path::new(&expected_path) {
            return Err(corrupt());
        }
        if !self
            .access(area)?
            .proves_topic_creation(native_id, &relative_path, &current_hash)
            .map_err(internal_error)?
        {
            return Ok(None);
        }
        if row.phase == "prepared" {
            self.refresh_index()?;
            self.activate_undo(native_id, area)?;
        }
        Ok(Some(MemoryTarget {
            id: row.target,
            expected_hash: Some(current_hash.as_str().to_owned()),
        }))
    }
}

#[cfg(feature = "agent-runtime")]
fn pending_remember(lookup_only: bool) -> MemoryServiceResult<Option<RememberReceipt>> {
    if lookup_only {
        Ok(None)
    } else {
        Err(MemoryServiceError::Unavailable(
            "memory call has no committed receipt".into(),
        ))
    }
}

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

#[cfg(feature = "agent-runtime")]
impl Store {
    fn claim_remember(&self, call: &RememberCall, id: OperationId) -> MemoryServiceResult<bool> {
        // This autocommit precedes observation and topic writes. A conflicting
        // claim must recover its existing native operation instead of writing.
        let inserted = self.0.execute(
            "INSERT INTO nofy_memory_remember_calls_v1(owner,call_key,request_hash,native_operation_id)
             VALUES (?1,?2,?3,?4) ON CONFLICT(owner,call_key) DO NOTHING",
            params![call.owner, call.key, call.bound_request_hash(id), id.as_uuid().to_string()],
        ).map_err(internal_error)?;
        Ok(inserted == 1)
    }

    fn load_remember(&self, call: &RememberCall) -> MemoryServiceResult<Option<RememberClaim>> {
        let row: Option<(String, Option<String>, Option<String>)> = self
            .0
            .query_row(
                "SELECT request_hash,receipt,native_operation_id FROM nofy_memory_remember_calls_v1
             WHERE owner=?1 AND call_key=?2",
                params![call.owner, call.key],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
            )
            .optional()
            .map_err(internal_error)?;
        let Some((digest, receipt, id)) = row else {
            return Ok(None);
        };
        let native_id = id.as_deref().map(operation).transpose()?;
        if digest != call.request_hash
            && native_id.is_none_or(|id| digest != call.bound_request_hash(id))
        {
            return Err(MemoryServiceError::Rejected(
                "memory call identity does not match its bound request and native operation".into(),
            ));
        }
        Ok(Some(RememberClaim {
            commit: receipt
                .as_deref()
                .map(|value| serde_json::from_str(value).map_err(|_| corrupt()))
                .transpose()?,
            native_id,
        }))
    }

    fn remember_generation(
        &self,
        call: &RememberCall,
        id: OperationId,
    ) -> MemoryServiceResult<u64> {
        let tx =
            rusqlite::Transaction::new_unchecked(&self.0, rusqlite::TransactionBehavior::Immediate)
                .map_err(internal_error)?;
        let binding = call.bound_request_hash(id);
        let id = id.as_uuid().to_string();
        let current: Option<u64> = tx
            .query_row(
                "SELECT native_generation FROM nofy_memory_remember_calls_v1
             WHERE owner=?1 AND call_key=?2 AND native_operation_id=?3
               AND request_hash IN (?4,?5)",
                params![call.owner, call.key, id, call.request_hash, binding],
                |row| row.get(0),
            )
            .map_err(internal_error)?;
        let generation = if let Some(generation) = current {
            generation
        } else {
            let generation =
                crate::state::increment_snapshot_generation(&tx).map_err(internal_error)?;
            tx.execute(
                "UPDATE nofy_memory_remember_calls_v1 SET native_generation=?4
                 WHERE owner=?1 AND call_key=?2 AND native_operation_id=?3",
                params![call.owner, call.key, id, generation],
            )
            .map_err(internal_error)?;
            generation
        };
        tx.commit().map_err(internal_error)?;
        Ok(generation)
    }

    fn complete_remember(
        &self,
        call: &RememberCall,
        id: OperationId,
        commit: &RememberCommit,
    ) -> MemoryServiceResult<()> {
        let stored = self
            .0
            .execute(
                "UPDATE nofy_memory_remember_calls_v1 SET receipt=?7
             WHERE owner=?1 AND call_key=?2 AND request_hash IN (?3,?4) AND native_operation_id=?5
               AND native_generation=?6 AND receipt IS NULL",
                params![
                    call.owner,
                    call.key,
                    call.request_hash,
                    call.bound_request_hash(id),
                    id.as_uuid().to_string(),
                    commit.snapshot_generation,
                    serde_json::to_string(commit).map_err(internal_error)?
                ],
            )
            .map_err(internal_error)?;
        if stored != 1 {
            return Err(corrupt());
        }
        Ok(())
    }
}

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
            for (column, sql) in [
                (
                    "native_operation_id",
                    "ALTER TABLE nofy_memory_remember_calls_v1 ADD COLUMN native_operation_id TEXT",
                ),
                (
                    "native_generation",
                    "ALTER TABLE nofy_memory_remember_calls_v1 ADD COLUMN native_generation INTEGER",
                ),
            ] {
                let exists: bool = tx.query_row(
                    "SELECT EXISTS(SELECT 1 FROM pragma_table_info('nofy_memory_remember_calls_v1') WHERE name=?1)",
                    [column],
                    |row| row.get(0),
                ).map_err(internal_error)?;
                if !exists {
                    tx.execute(sql, []).map_err(internal_error)?;
                }
            }
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
