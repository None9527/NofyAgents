//! Explicit SQLite persistence. Default runtime users do not load SQLite or
//! discover a database. Checkpoints and lease fences commit in one transaction.
use crate::{Checkpoint, Checkpointer, Error};
pub mod placement;
pub mod retention;
pub mod transport;
use rusqlite::{Connection, OptionalExtension, Transaction, TransactionBehavior, params};
use std::{
    path::{Path, PathBuf},
    sync::{Arc, Mutex},
    time::{Duration, SystemTime, UNIX_EPOCH},
};

pub trait Clock: Send + Sync {
    fn now_ms(&self) -> u64;
}
pub struct SystemClock;
impl Clock for SystemClock {
    fn now_ms(&self) -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis()
            .min(i64::MAX as u128) as u64
    }
}
pub(crate) fn db_error(error: impl std::fmt::Display) -> Error {
    Error::Checkpoint(format!("sqlite: {error}"))
}

#[derive(Clone)]
pub struct SqliteStore {
    connection: Arc<Mutex<PlacedConnection>>,
    read_connection: Arc<Mutex<PlacedConnection>>,
    path: PathBuf,
    identity: String,
    placement: Option<Arc<dyn placement::SqlitePlacement>>,
    pub(crate) clock: Arc<dyn Clock>,
    retention_work: Arc<tokio::sync::Semaphore>,
    admission: Option<Arc<dyn crate::admission::CommitAdmission>>,
    require_admission_marker: bool,
    observer: Arc<observe::Observer>,
}
mod observe;
pub use observe::{RuntimeChanges, WorkspaceChanges};
struct PlacedConnection {
    db: Connection,
    path: PathBuf,
    read_only: bool,
    schema: i64,
}
pub(super) fn open_readonly_exact(path: &Path) -> Result<Connection, Error> {
    let mode = nofy_sqlite_journal::JournalMode::for_db_path(path);
    let connection = if mode.effective_db_path(path) == path {
        mode.open_readonly(path).map_err(db_error)?
    } else {
        // Exact physical path on a network mount (caller pinned a non-suffixed
        // snapshot or placed file): mirror `JournalMode::Truncate::open_readonly`
        // without rewriting the filename so WAL `-shm` is never mmap'd.
        let flags =
            rusqlite::OpenFlags::SQLITE_OPEN_READ_WRITE | rusqlite::OpenFlags::SQLITE_OPEN_NO_MUTEX;
        let connection = Connection::open_with_flags(path, flags).map_err(db_error)?;
        connection
            .busy_timeout(Duration::from_secs(5))
            .map_err(db_error)?;
        mode.apply_with_retry(&connection).map_err(db_error)?;
        connection
    };
    connection
        .pragma_update(None, "query_only", true)
        .map_err(db_error)?;
    if mode == nofy_sqlite_journal::JournalMode::Truncate {
        // `JournalMode::Truncate::apply` leaves `locking_mode=NORMAL` pending until
        // the next database access; execute a read so no EXCLUSIVE lock lingers.
        let _: Option<i64> = connection
            .query_row("SELECT 1 FROM sqlite_master LIMIT 1", [], |row| row.get(0))
            .optional()
            .map_err(db_error)?;
    }
    Ok(connection)
}

pub(super) fn connect(path: &Path, writable: bool, create: bool) -> Result<Connection, Error> {
    if !writable {
        return open_readonly_exact(path);
    }
    let mode = nofy_sqlite_journal::JournalMode::for_db_path(path);
    if create && mode.effective_db_path(path) == path {
        return mode.open(path).map_err(db_error);
    }
    let mut flags = rusqlite::OpenFlags::SQLITE_OPEN_READ_WRITE;
    if create {
        flags |= rusqlite::OpenFlags::SQLITE_OPEN_CREATE;
    }
    let connection = Connection::open_with_flags(path, flags).map_err(db_error)?;
    mode.apply_with_retry(&connection).map_err(db_error)?;
    Ok(connection)
}

#[derive(Clone, Debug)]
pub struct Lease {
    pub(crate) key: String,
    pub(crate) owner: String,
    pub(crate) fence: i64,
}
impl Lease {
    pub fn fence(&self) -> i64 {
        self.fence
    }
}

#[derive(Clone)]
pub struct GuardedCheckpointer {
    pub(crate) store: SqliteStore,
    pub(crate) lease: Lease,
}

impl SqliteStore {
    pub fn open(path: &Path) -> Result<Self, Error> {
        Self::open_with_clock(path, Arc::new(SystemClock))
    }
    pub fn open_with_clock(path: &Path, clock: Arc<dyn Clock>) -> Result<Self, Error> {
        Self::open_inner(path, clock, None, None)
    }
    pub fn open_with_admission(
        path: &Path,
        admission: Arc<dyn crate::admission::CommitAdmission>,
    ) -> Result<Self, Error> {
        Self::open_inner(path, Arc::new(SystemClock), Some(admission), None)
    }
    pub fn open_placed(
        path: &Path,
        placement: Arc<dyn placement::SqlitePlacement>,
        admission: Option<Arc<dyn crate::admission::CommitAdmission>>,
    ) -> Result<Self, Error> {
        Self::open_inner(path, Arc::new(SystemClock), admission, Some(placement))
    }
    pub fn open_placed_with_clock(
        path: &Path,
        placement: Arc<dyn placement::SqlitePlacement>,
        admission: Option<Arc<dyn crate::admission::CommitAdmission>>,
        clock: Arc<dyn Clock>,
    ) -> Result<Self, Error> {
        Self::open_inner(path, clock, admission, Some(placement))
    }
    fn open_inner(
        path: &Path,
        clock: Arc<dyn Clock>,
        admission: Option<Arc<dyn crate::admission::CommitAdmission>>,
        placement: Option<Arc<dyn placement::SqlitePlacement>>,
    ) -> Result<Self, Error> {
        let _permit = admission.as_ref().map(|p| p.enter()).transpose()?;
        if !path.is_absolute() {
            return Err(Error::Checkpoint(
                "an explicit absolute SQLite path is required".into(),
            ));
        }
        let mode = nofy_sqlite_journal::JournalMode::for_db_path(path);
        let anchor = mode.effective_db_path(path);
        placement::check(&anchor, placement.as_deref(), false)?;
        let permit = placement.as_ref().map(|p| p.acquire()).transpose()?;
        let effective = permit
            .as_ref()
            .map_or_else(|| anchor.clone(), |p| p.path.clone());
        let writable = permit.as_ref().is_none_or(|p| p.writable);
        let create = permit.as_ref().is_none_or(|p| p.create);
        if placement::managed(&effective)? && !effective.try_exists().map_err(db_error)? {
            return Err(db_error("sealed runtime database is missing"));
        }
        if !create && !effective.try_exists().map_err(db_error)? {
            return Err(db_error("placed runtime database is missing"));
        }
        placement::check(
            &effective,
            placement.as_deref(),
            placement.is_some() && !create,
        )?;
        if create && let Some(parent) = effective.parent() {
            std::fs::create_dir_all(parent).map_err(db_error)?;
        }
        crate::admission::marker::check_full(&effective, admission.as_deref())?;
        let mut connection = connect(&effective, writable, create)?;
        if writable {
            connection
                .pragma_update(None, "synchronous", "FULL")
                .map_err(db_error)?;
            let tx = connection
                .transaction_with_behavior(TransactionBehavior::Immediate)
                .map_err(db_error)?;
            let had_composition_digests: bool = tx
                .query_row(
                    "SELECT EXISTS(SELECT 1 FROM sqlite_master WHERE type='table' AND name='agent_runtime_composition_digests')",
                    [],
                    |row| row.get(0),
                )
                .map_err(db_error)?;
            let had_admission_marker = crate::admission::marker::present(&effective)?;
            tx.execute_batch("CREATE TABLE IF NOT EXISTS agent_runtime_schema(version INTEGER NOT NULL);
            CREATE TABLE IF NOT EXISTS agent_runtime_checkpoints(key TEXT PRIMARY KEY,revision INTEGER NOT NULL,payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS agent_runtime_leases(key TEXT PRIMARY KEY,owner TEXT NOT NULL,fence INTEGER NOT NULL,expires_ms INTEGER NOT NULL);
            CREATE TABLE IF NOT EXISTS agent_runtime_runs(id TEXT PRIMARY KEY,thread_key TEXT NOT NULL,payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS agent_runtime_threads(key TEXT PRIMARY KEY,active_run TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS agent_runtime_children(key TEXT PRIMARY KEY,root_id TEXT NOT NULL,payload TEXT NOT NULL);
            CREATE INDEX IF NOT EXISTS idx_agent_runtime_children_run_id ON agent_runtime_children(json_extract(payload,'$.run_id'),root_id);
            CREATE TABLE IF NOT EXISTS agent_runtime_events(id INTEGER PRIMARY KEY AUTOINCREMENT,root_id TEXT NOT NULL,payload TEXT NOT NULL);
            CREATE INDEX IF NOT EXISTS agent_runtime_events_root_cursor ON agent_runtime_events(root_id,id);
            CREATE TABLE IF NOT EXISTS agent_runtime_event_receipts(root_id TEXT NOT NULL,event_key TEXT NOT NULL,digest TEXT NOT NULL,cursor INTEGER NOT NULL,PRIMARY KEY(root_id,event_key));
            CREATE TABLE IF NOT EXISTS agent_runtime_budget_roots(key TEXT PRIMARY KEY,payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS agent_runtime_budget_operations(root_key TEXT NOT NULL,operation_key TEXT NOT NULL,payload TEXT NOT NULL,PRIMARY KEY(root_key,operation_key));
            CREATE TABLE IF NOT EXISTS agent_runtime_budget_events(id INTEGER PRIMARY KEY AUTOINCREMENT,root_key TEXT NOT NULL,payload TEXT NOT NULL);
            CREATE INDEX IF NOT EXISTS agent_runtime_budget_event_cursor ON agent_runtime_budget_events(root_key,id);
            CREATE TABLE IF NOT EXISTS agent_runtime_mailbox(sequence INTEGER PRIMARY KEY AUTOINCREMENT,address TEXT NOT NULL,input_id TEXT NOT NULL,digest TEXT NOT NULL,payload TEXT NOT NULL,status TEXT NOT NULL,reason TEXT,UNIQUE(address,input_id));
            CREATE INDEX IF NOT EXISTS agent_runtime_mailbox_fifo ON agent_runtime_mailbox(address,status,sequence);
            CREATE TABLE IF NOT EXISTS agent_runtime_cancel(sequence INTEGER PRIMARY KEY AUTOINCREMENT,address TEXT NOT NULL,command_id TEXT NOT NULL,acknowledged INTEGER NOT NULL DEFAULT 0,UNIQUE(address,command_id));
            CREATE INDEX IF NOT EXISTS idx_agent_runtime_cancel_unack ON agent_runtime_cancel(acknowledged,json_extract(address,'$.run_id'),json_extract(address,'$.root_run_id')) WHERE acknowledged=0;
            CREATE TABLE IF NOT EXISTS agent_runtime_reconciliations(key TEXT PRIMARY KEY,root_id TEXT NOT NULL,child_id TEXT NOT NULL,call_id TEXT NOT NULL,payload TEXT NOT NULL,rejection TEXT);
            CREATE TABLE IF NOT EXISTS agent_runtime_jobs(sequence INTEGER PRIMARY KEY AUTOINCREMENT,run_id TEXT NOT NULL UNIQUE,thread_key TEXT NOT NULL,digest TEXT NOT NULL,payload TEXT NOT NULL,status TEXT NOT NULL,source_sequence INTEGER UNIQUE);
            CREATE INDEX IF NOT EXISTS agent_runtime_jobs_fifo ON agent_runtime_jobs(thread_key,sequence);
            CREATE TABLE IF NOT EXISTS agent_runtime_approvals(key TEXT PRIMARY KEY,run_id TEXT NOT NULL,call_json TEXT NOT NULL,payload TEXT NOT NULL,decision INTEGER);
            CREATE TABLE IF NOT EXISTS agent_runtime_managed_runs(run_id TEXT PRIMARY KEY,digest TEXT NOT NULL,payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS agent_runtime_managed_actions(sequence INTEGER PRIMARY KEY AUTOINCREMENT,command_id TEXT NOT NULL UNIQUE,run_id TEXT NOT NULL,digest TEXT NOT NULL,payload TEXT NOT NULL,result TEXT);
            CREATE INDEX IF NOT EXISTS agent_runtime_managed_actions_run ON agent_runtime_managed_actions(run_id,sequence);
            CREATE TABLE IF NOT EXISTS agent_runtime_abandoned_runs(run_id TEXT PRIMARY KEY,thread_key TEXT NOT NULL UNIQUE,payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS agent_runtime_parks(command_id TEXT PRIMARY KEY,run_id TEXT NOT NULL,thread_key TEXT NOT NULL,status TEXT NOT NULL,payload TEXT NOT NULL);
            CREATE UNIQUE INDEX IF NOT EXISTS agent_runtime_active_park ON agent_runtime_parks(thread_key) WHERE status IN ('requested','parked');
            CREATE INDEX IF NOT EXISTS agent_runtime_parks_run ON agent_runtime_parks(run_id);
            CREATE TABLE IF NOT EXISTS agent_runtime_transition_proposals(command_id TEXT PRIMARY KEY,digest TEXT NOT NULL,payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS agent_runtime_live_versions(run_id TEXT NOT NULL,revision INTEGER NOT NULL,command_id TEXT NOT NULL UNIQUE,digest TEXT NOT NULL,payload TEXT NOT NULL,PRIMARY KEY(run_id,revision));
            CREATE TABLE IF NOT EXISTS agent_runtime_sessions(id TEXT PRIMARY KEY,thread_key TEXT NOT NULL UNIQUE,digest TEXT NOT NULL,payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS agent_runtime_session_turns(run_id TEXT PRIMARY KEY,session_id TEXT NOT NULL,sequence INTEGER NOT NULL UNIQUE,submission_digest TEXT NOT NULL,admitted_at_ms INTEGER NOT NULL);
            CREATE INDEX IF NOT EXISTS agent_runtime_session_turns_page ON agent_runtime_session_turns(session_id,sequence);
            CREATE TABLE IF NOT EXISTS agent_runtime_session_commands(command_id TEXT PRIMARY KEY,session_id TEXT NOT NULL,run_id TEXT NOT NULL,revision INTEGER NOT NULL,digest TEXT NOT NULL,payload TEXT NOT NULL,UNIQUE(run_id,revision));
            CREATE TABLE IF NOT EXISTS agent_runtime_session_seeds(run_id TEXT PRIMARY KEY,command_id TEXT NOT NULL UNIQUE,digest TEXT NOT NULL,payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS agent_runtime_session_profiles(session_id TEXT PRIMARY KEY,digest TEXT NOT NULL,payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS agent_runtime_session_titles(session_id TEXT PRIMARY KEY,run_id TEXT NOT NULL,title TEXT NOT NULL,pending INTEGER NOT NULL);
            CREATE INDEX IF NOT EXISTS agent_runtime_session_titles_pending ON agent_runtime_session_titles(session_id) WHERE pending=1;
            CREATE TABLE IF NOT EXISTS agent_runtime_session_admissions(run_id TEXT PRIMARY KEY,session_id TEXT NOT NULL,digest TEXT NOT NULL,payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS agent_runtime_session_ops(command_id TEXT PRIMARY KEY,session_id TEXT NOT NULL,digest TEXT NOT NULL,payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS agent_runtime_session_branches(session_id TEXT PRIMARY KEY,parent_session_id TEXT NOT NULL,command_id TEXT NOT NULL UNIQUE,digest TEXT NOT NULL,payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS agent_runtime_approval_grants(grant_id TEXT PRIMARY KEY,anchor TEXT NOT NULL,policy_id TEXT NOT NULL,rule_key TEXT NOT NULL,active INTEGER NOT NULL,digest TEXT NOT NULL,payload TEXT NOT NULL);
            CREATE INDEX IF NOT EXISTS agent_runtime_approval_grants_match ON agent_runtime_approval_grants(anchor,policy_id,rule_key,active);
            CREATE INDEX IF NOT EXISTS agent_runtime_session_branch_parent ON agent_runtime_session_branches(parent_session_id,session_id);
            CREATE TABLE IF NOT EXISTS agent_runtime_retained_owners(version INTEGER NOT NULL DEFAULT 1,kind TEXT NOT NULL,key TEXT NOT NULL,root_id TEXT NOT NULL,composition_digest TEXT NOT NULL,PRIMARY KEY(kind,key));
            CREATE TABLE IF NOT EXISTS agent_runtime_composition_digests(digest TEXT PRIMARY KEY);")
            .map_err(db_error)?;
            tx.execute_batch(include_str!("supervisor/work/schema.sql"))
                .map_err(db_error)?;
            let versions = tx
                .prepare("SELECT version FROM agent_runtime_schema")
                .map_err(db_error)?
                .query_map([], |row| row.get::<_, i64>(0))
                .map_err(db_error)?
                .collect::<Result<Vec<_>, _>>()
                .map_err(db_error)?;
            if versions.is_empty() {
                tx.execute("INSERT INTO agent_runtime_schema(version) VALUES(1)", [])
                    .map_err(db_error)?;
            } else if versions != [1] {
                return Err(Error::Checkpoint(
                    "unsupported runtime database schema".into(),
                ));
            }
            // Older runtimes recorded execution failures as waiting queue heads.
            // Confirm the original submission and leave its recovery state intact.
            tx.execute(
                "UPDATE agent_runtime_jobs AS j SET status='failed'
                 WHERE j.status='waiting' AND EXISTS (
                   SELECT 1 FROM agent_runtime_runs r
                   WHERE r.id=j.run_id AND r.thread_key=j.thread_key
                     AND json_extract(r.payload,'$.submission')=j.digest
                     AND json_extract(r.payload,'$.status')='failed'
                 )",
                [],
            )
            .map_err(db_error)?;
            crate::admission::marker::check_full(&effective, admission.as_deref())?;
            if !had_composition_digests
                || (admission.is_some()
                    && (!had_admission_marker
                        || retention::commit::needs_composition_backfill(&tx)?))
            {
                retention::commit::backfill_composition_digests(&tx)?;
            }
            if let Some(policy) = &admission {
                retention::commit::initialize(&tx)?;
                crate::admission::marker::install(&effective, policy.as_ref())?;
            }
            if let Some(location) = &placement {
                placement::fence::ensure(&tx, location.authority())?;
                placement::install(&effective, location.as_ref())?;
            }
            tx.commit().map_err(db_error)?;
        } else {
            let versions = connection
                .prepare("SELECT version FROM agent_runtime_schema")
                .map_err(db_error)?
                .query_map([], |r| r.get::<_, u32>(0))
                .map_err(db_error)?
                .collect::<Result<Vec<_>, _>>()
                .map_err(db_error)?;
            if versions != [1] {
                return Err(db_error("unsupported placed runtime database schema"));
            }
            placement::fence::owned_objects(&connection)?;
            if admission.is_some() {
                initialize_retention_temp(&connection, true)?;
            }
        }
        let identity = placement.as_ref().map_or_else(
            || anchor.to_string_lossy().into_owned(),
            |p| p.logical_identity().to_owned(),
        );
        if identity.is_empty() || identity.len() > 16384 {
            return Err(db_error("invalid logical runtime storage identity"));
        }
        let schema = connection
            .pragma_query_value(None, "schema_version", |r| r.get(0))
            .map_err(db_error)?;
        let require_admission_marker =
            admission.is_some() && (writable || crate::admission::marker::present(&effective)?);
        let read_db = connect(&effective, false, false)?;
        let read_schema = read_db
            .pragma_query_value(None, "schema_version", |r| r.get(0))
            .map_err(db_error)?;
        let observer = Arc::new(observe::Observer::new());
        observer.attach(&connection);
        Ok(Self {
            connection: Arc::new(Mutex::new(PlacedConnection {
                db: connection,
                path: effective.clone(),
                read_only: !writable,
                schema,
            })),
            read_connection: Arc::new(Mutex::new(PlacedConnection {
                db: read_db,
                path: effective,
                read_only: true,
                schema: read_schema,
            })),
            path: anchor,
            observer,
            identity,
            placement,
            clock,
            retention_work: Arc::new(tokio::sync::Semaphore::new(2)),
            admission,
            require_admission_marker,
        })
    }
    /// Current physical path snapshot, distinct from the durable identity.
    pub fn path(&self) -> Result<PathBuf, Error> {
        self.location().map(|p| p.path)
    }
    pub fn logical_identity(&self) -> &str {
        &self.identity
    }
    pub fn now_ms(&self) -> u64 {
        self.clock.now_ms()
    }
    fn location(&self) -> Result<placement::PlacementPermit, Error> {
        placement::check(&self.path, self.placement.as_deref(), false)?;
        let permit = match &self.placement {
            Some(p) => p.acquire()?,
            None => placement::PlacementPermit::new(self.path.clone(), true, false, Box::new(()))?,
        };
        placement::check(
            &permit.path,
            self.placement.as_deref(),
            self.placement.is_some(),
        )?;
        Ok(permit)
    }
    /// Install the same admission and placement authority on a completed copy.
    /// This does not publish the destination or authorize a second writer.
    pub fn protect_snapshot(&self, path: &Path) -> Result<(), Error> {
        let meta = path.symlink_metadata().map_err(db_error)?;
        if !path.is_absolute() || !meta.is_file() || meta.file_type().is_symlink() {
            return Err(db_error("invalid runtime snapshot binding"));
        }
        if let Some(policy) = &self.admission {
            crate::admission::marker::install(path, policy.as_ref())?;
        }
        if let Some(placement) = &self.placement {
            let db = open_readonly_exact(path)?;
            placement::fence::owned_objects(&db)?;
            if !matches!(placement::fence::state(&db)?,Some((owner,true,None)) if owner==placement.authority())
            {
                return Err(db_error(
                    "runtime copy must retain the original writable placement authority",
                ));
            }
            placement::install(path, placement.as_ref())?;
        }
        Ok(())
    }
    fn check_admission_marker(&self, path: &Path) -> Result<(), Error> {
        if self.require_admission_marker {
            crate::admission::marker::check_required(path, self.admission.as_deref())
        } else {
            crate::admission::marker::check(path, self.admission.as_deref())
        }
    }
    pub(crate) async fn transaction<T: Send + 'static>(
        &self,
        f: impl FnOnce(&Transaction<'_>) -> Result<T, Error> + Send + 'static,
    ) -> Result<T, Error> {
        self.transaction_scoped(None, f).await
    }
    pub(crate) async fn transaction_owned<T: Send + 'static>(
        &self,
        lease: Lease,
        f: impl FnOnce(&Transaction<'_>) -> Result<T, Error> + Send + 'static,
    ) -> Result<T, Error> {
        self.transaction_scoped(Some(lease), f).await
    }
    /// Execute a pure read-only query on the dedicated `query_only` read connection
    /// using `TransactionBehavior::Deferred`, without contending for write locks.
    pub(crate) async fn read_transaction<T: Send + 'static>(
        &self,
        f: impl FnOnce(&Transaction<'_>) -> Result<T, Error> + Send + 'static,
    ) -> Result<T, Error> {
        let connection = self.read_connection.clone();
        let store = self.clone();
        tokio::task::spawn_blocking(move || {
            let location = store.location()?;
            let mut placed = connection
                .lock()
                .map_err(|_| Error::Checkpoint("SQLite read connection poisoned".into()))?;
            if placed.path != location.path {
                let db = connect(&location.path, false, false)?;
                let schema = db
                    .pragma_query_value(None, "schema_version", |r| r.get(0))
                    .map_err(db_error)?;
                *placed = PlacedConnection {
                    db,
                    path: location.path.clone(),
                    read_only: true,
                    schema,
                };
            }
            placed
                .db
                .pragma_update(None, "query_only", true)
                .map_err(db_error)?;
            let tx = placed
                .db
                .transaction_with_behavior(TransactionBehavior::Deferred)
                .map_err(db_error)?;
            store.check_admission_marker(&location.path)?;
            let result = f(&tx)?;
            tx.commit().map_err(db_error)?;
            Ok(result)
        })
        .await
        .map_err(db_error)?
    }
    async fn transaction_scoped<T: Send + 'static>(
        &self,
        owner: Option<Lease>,
        f: impl FnOnce(&Transaction<'_>) -> Result<T, Error> + Send + 'static,
    ) -> Result<T, Error> {
        let connection = self.connection.clone();
        let admission = self.admission.clone();
        let store = self.clone();
        tokio::task::spawn_blocking(move || {
            let location = store.location()?;
            let mut placed = connection
                .lock()
                .map_err(|_| Error::Checkpoint("SQLite connection poisoned".into()))?;
            if placed.path != location.path || location.writable && placed.read_only {
                let db = connect(&location.path, location.writable, false)?;
                db.pragma_update(None, "synchronous", "FULL")
                    .map_err(db_error)?;
                if admission.is_some() {
                    initialize_retention_temp(&db, !location.writable)?;
                }
                let schema = db
                    .pragma_query_value(None, "schema_version", |r| r.get(0))
                    .map_err(db_error)?;
                store.observer.attach(&db);
                *placed = PlacedConnection {
                    db,
                    path: location.path.clone(),
                    read_only: !location.writable,
                    schema,
                };
            }
            placed
                .db
                .pragma_update(None, "query_only", !location.writable)
                .map_err(db_error)?;
            let known_schema = placed.schema;
            store.observer.clear();
            let tx = placed
                .db
                .transaction_with_behavior(if location.writable {
                    TransactionBehavior::Immediate
                } else {
                    TransactionBehavior::Deferred
                })
                .map_err(db_error)?;
            store.check_admission_marker(&location.path)?;
            let result = f(&tx)?;
            let mut schema: i64 = tx
                .pragma_query_value(None, "schema_version", |r| r.get(0))
                .map_err(db_error)?;
            if location.writable
                && schema != known_schema
                && let Some(owner) = &store.placement
            {
                placement::fence::ensure(&tx, owner.authority())?;
                schema = tx
                    .pragma_query_value(None, "schema_version", |r| r.get(0))
                    .map_err(db_error)?;
            }
            // Only declaration-bearing commits contend with maintenance. Read
            // views, receipts, budget settlement and cancellation must remain
            // available while a persistent deletion is being recovered.
            let changed = admission.is_some() && retention::commit::needed(&tx)?;
            let inherited = if changed {
                retention::commit::inherited_scope(
                    &tx,
                    owner.as_ref(),
                    admission
                        .as_deref()
                        .expect("managed declaration transaction"),
                )?
            } else {
                None
            };
            let permit = match &admission {
                Some(policy) if changed && inherited.is_none() => Some(policy.enter()?),
                _ => None,
            };
            if changed {
                retention::commit::validate(
                    &tx,
                    permit.as_deref(),
                    owner.as_ref(),
                    inherited.as_deref(),
                    admission
                        .as_deref()
                        .expect("managed declaration transaction"),
                )?;
            }
            placement::check(
                &location.path,
                store.placement.as_deref(),
                store.placement.is_some(),
            )?;
            let event_roots = store.observer.resolve_event_roots(&tx)?;
            tx.commit().map_err(db_error)?;
            placed.schema = schema;
            store.observer.committed(event_roots);
            Ok(result)
        })
        .await
        .map_err(db_error)?
    }
    /// Changes committed through this resident store and its clones.
    pub fn observe(&self) -> tokio::sync::watch::Receiver<RuntimeChanges> {
        self.observer.subscribe()
    }
    /// Workspace invalidations (sessions and runs only), quiet during event streams.
    pub fn observe_workspace(&self) -> tokio::sync::watch::Receiver<WorkspaceChanges> {
        self.observer.subscribe_workspace()
    }
    /// Work-state invalidations, quiet during high-frequency event streams.
    pub fn observe_work(&self) -> tokio::sync::watch::Receiver<u64> {
        self.observer.subscribe_work()
    }
    /// Event stream invalidations scoped to a single root run.
    pub fn watch_run(&self, run_id: &str) -> tokio::sync::watch::Receiver<u64> {
        self.observer.watch_run(run_id)
    }
    pub async fn acquire(
        &self,
        key: impl Into<String>,
        owner: impl Into<String>,
        ttl: Duration,
    ) -> Result<Lease, Error> {
        let key = key.into();
        let owner = owner.into();
        let clock = self.clock.clone();
        expiry(0, ttl)?;
        if key.is_empty() || owner.is_empty() {
            return Err(Error::Checkpoint("lease key/owner required".into()));
        }
        self.transaction(move |tx| {
            let now=clock.now_ms();let expiry=expiry(now,ttl)?;
            let current:Option<(i64,i64)>=tx.query_row("SELECT fence,expires_ms FROM agent_runtime_leases WHERE key=?1",[&key],|row|Ok((row.get(0)?,row.get(1)?))).optional().map_err(db_error)?;
            if current.is_some_and(|(_,expires)|expires>now as i64) {return Err(Error::Checkpoint("run already leased".into()));}
            let fence=current.map_or(Some(1),|(fence,_)| fence.checked_add(1)).ok_or_else(|| Error::Checkpoint("lease fence exhausted".into()))?;
            tx.execute("INSERT INTO agent_runtime_leases(key,owner,fence,expires_ms) VALUES(?1,?2,?3,?4)
                ON CONFLICT(key) DO UPDATE SET owner=excluded.owner,fence=excluded.fence,expires_ms=excluded.expires_ms",params![key,owner,fence,expiry]).map_err(db_error)?;
            Ok(Lease {key,owner,fence})
        }).await
    }
    pub async fn renew(&self, lease: &Lease, ttl: Duration) -> Result<(), Error> {
        let lease = lease.clone();
        let clock = self.clock.clone();
        expiry(0, ttl)?;
        self.transaction(move |tx| {
            let now = clock.now_ms();
            let expiry = expiry(now, ttl)?;
            check_lease(tx, &lease, now)?;
            tx.execute(
                "UPDATE agent_runtime_leases SET expires_ms=?1 WHERE key=?2",
                params![expiry, lease.key],
            )
            .map_err(db_error)?;
            Ok(())
        })
        .await
    }
    pub async fn release(&self, lease: &Lease) -> Result<(), Error> {
        let lease = lease.clone();
        self.transaction(move |tx| release_lease(tx, &lease)).await
    }
    /// Commit the final update and release its fence in one durable transaction.
    pub(crate) async fn transaction_and_release<T: Send + 'static>(
        &self,
        lease: Lease,
        finish: impl FnOnce(&Transaction<'_>, &Lease) -> Result<T, Error> + Send + 'static,
    ) -> Result<T, Error> {
        let fence = lease.clone();
        let result = self
            .transaction(move |tx| {
                let result = finish(tx, &fence)?;
                release_lease(tx, &fence)?;
                Ok(result)
            })
            .await;
        if result.is_err() {
            // The update rolled back. Free the lease when its fence still owns it.
            let _ = self.release(&lease).await;
        }
        result
    }
    pub fn guarded(&self, lease: &Lease) -> GuardedCheckpointer {
        GuardedCheckpointer {
            store: self.clone(),
            lease: lease.clone(),
        }
    }
    async fn load_guarded(
        &self,
        key: &str,
        lease: Option<Lease>,
    ) -> Result<Option<Checkpoint>, Error> {
        let key = key.to_string();
        let clock = self.clock.clone();
        self.read_transaction(move |tx| {
            let now = clock.now_ms();
            if let Some(lease) = lease {
                check_lease(tx, &lease, now)?;
            }
            let row: Option<(i64, String)> = tx
                .query_row(
                    "SELECT revision,payload FROM agent_runtime_checkpoints WHERE key=?1",
                    [key],
                    |row| Ok((row.get(0)?, row.get(1)?)),
                )
                .optional()
                .map_err(db_error)?;
            row.map(|(revision, payload)| {
                let checkpoint: Checkpoint = serde_json::from_str(&payload).map_err(db_error)?;
                if i64::try_from(checkpoint.revision).ok() != Some(revision) {
                    return Err(Error::Checkpoint(
                        "checkpoint revision metadata mismatch".into(),
                    ));
                }
                Ok(checkpoint)
            })
            .transpose()
        })
        .await
    }
    async fn save_guarded(
        &self,
        key: &str,
        expected: Option<u64>,
        checkpoint: Checkpoint,
        lease: Option<Lease>,
    ) -> Result<(), Error> {
        let next = expected
            .unwrap_or(0)
            .checked_add(1)
            .ok_or_else(|| Error::Checkpoint("checkpoint revision exhausted".into()))?;
        if next != checkpoint.revision {
            return Err(Error::Checkpoint(
                "checkpoint revision must advance exactly once".into(),
            ));
        }
        let revision = i64::try_from(next).map_err(db_error)?;
        let expected = expected.map(i64::try_from).transpose().map_err(db_error)?;
        let payload = serde_json::to_string(&checkpoint).map_err(db_error)?;
        let key = key.to_string();
        let clock = self.clock.clone();
        self.transaction_scoped(lease.clone(), move |tx| {
            let now=clock.now_ms();
            if let Some(lease)=lease {check_lease(tx,&lease,now)?;}
            let changed=if let Some(expected)=expected {
                tx.execute("UPDATE agent_runtime_checkpoints SET revision=?1,payload=?2 WHERE key=?3 AND revision=?4",params![revision,payload,key,expected]).map_err(db_error)?
            } else {
                tx.execute("INSERT INTO agent_runtime_checkpoints(key,revision,payload) VALUES(?1,?2,?3) ON CONFLICT(key) DO NOTHING",params![key,revision,payload]).map_err(db_error)?
            };
            if changed!=1 {return Err(Error::Checkpoint("concurrent thread update".into()));}Ok(())
        }).await
    }
}

fn initialize_retention_temp(db: &Connection, read_only: bool) -> Result<(), Error> {
    if read_only {
        db.pragma_update(None, "query_only", false)
            .map_err(db_error)?;
    }
    let result = (|| {
        let tx = Transaction::new_unchecked(db, TransactionBehavior::Deferred).map_err(db_error)?;
        retention::commit::initialize(&tx)?;
        tx.commit().map_err(db_error)?;
        Ok(())
    })();
    if read_only {
        let restore = db.pragma_update(None, "query_only", true).map_err(db_error);
        if result.is_ok() {
            restore?;
        }
    }
    result
}

fn expiry(now: u64, ttl: Duration) -> Result<i64, Error> {
    let ttl = u64::try_from(ttl.as_millis()).map_err(db_error)?;
    if ttl == 0 {
        return Err(Error::Checkpoint("positive lease TTL required".into()));
    }
    i64::try_from(
        now.checked_add(ttl)
            .ok_or_else(|| Error::Checkpoint("lease expiry overflow".into()))?,
    )
    .map_err(db_error)
}
fn release_lease(tx: &Transaction<'_>, lease: &Lease) -> Result<(), Error> {
    let changed = tx
        .execute(
            "UPDATE agent_runtime_leases SET expires_ms=0 WHERE key=?1 AND owner=?2 AND fence=?3",
            params![lease.key, lease.owner, lease.fence],
        )
        .map_err(db_error)?;
    if changed != 1 {
        return Err(Error::Checkpoint("lease fence lost".into()));
    }
    Ok(())
}

pub(crate) fn check_lease(tx: &Transaction<'_>, lease: &Lease, now: u64) -> Result<(), Error> {
    let valid:bool=tx.query_row("SELECT EXISTS(SELECT 1 FROM agent_runtime_leases WHERE key=?1 AND owner=?2 AND fence=?3 AND expires_ms>?4)",params![lease.key,lease.owner,lease.fence,i64::try_from(now).map_err(db_error)?],|row|row.get(0)).map_err(db_error)?;
    if valid {
        Ok(())
    } else {
        Err(Error::Checkpoint("lease fence lost or expired".into()))
    }
}

#[async_trait::async_trait]
impl Checkpointer for SqliteStore {
    fn is_durable(&self) -> bool {
        true
    }
    async fn load(&self, key: &str) -> Result<Option<Checkpoint>, Error> {
        self.load_guarded(key, None).await
    }
    async fn save(
        &self,
        key: &str,
        expected: Option<u64>,
        checkpoint: Checkpoint,
    ) -> Result<(), Error> {
        self.save_guarded(key, expected, checkpoint, None).await
    }
}
#[async_trait::async_trait]
impl Checkpointer for GuardedCheckpointer {
    fn is_durable(&self) -> bool {
        true
    }
    async fn load(&self, key: &str) -> Result<Option<Checkpoint>, Error> {
        self.store.load_guarded(key, Some(self.lease.clone())).await
    }
    async fn save(
        &self,
        key: &str,
        expected: Option<u64>,
        checkpoint: Checkpoint,
    ) -> Result<(), Error> {
        self.store
            .save_guarded(key, expected, checkpoint, Some(self.lease.clone()))
            .await
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn readonly_connect_sets_busy_timeout_and_rejects_writes() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("runtime.sqlite");
        let store = SqliteStore::open(&path).unwrap();
        let physical = store.path().unwrap();

        let conn = connect(&physical, false, false).unwrap();
        let timeout: i64 = conn
            .pragma_query_value(None, "busy_timeout", |row| row.get(0))
            .unwrap();
        assert!(
            timeout >= 5000,
            "readonly connection must configure busy_timeout, got {timeout}ms"
        );
        assert!(
            conn.execute(
                "INSERT INTO agent_runtime_leases(key, owner, fence, expires_ms) VALUES('k', 'o', 1, 1)",
                [],
            )
            .is_err(),
            "readonly connection must reject SQL writes"
        );
    }

    #[tokio::test(flavor = "multi_thread", worker_threads = 4)]
    async fn read_transaction_rejects_writes_and_runs_while_writer_holds_immediate_lock() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("runtime.sqlite");
        let store = SqliteStore::open(&path).unwrap();
        let initial = Checkpoint {
            version: 1,
            revision: 1,
            composition: "comp".into(),
            state: crate::RunState::default(),
        };
        store.save("thread-1", None, initial).await.unwrap();

        let write_attempt = store
            .read_transaction(|tx| {
                tx.execute(
                    "INSERT INTO agent_runtime_leases(key, owner, fence, expires_ms) VALUES('ro', 'o', 1, 1)",
                    [],
                )
                .map_err(db_error)?;
                Ok(())
            })
            .await;
        assert!(
            write_attempt.is_err(),
            "read_transaction must execute on a query_only connection"
        );

        // Hold an active BEGIN IMMEDIATE write transaction and verify pure reads
        // still complete on the separate read connection without blocking.
        let entered = Arc::new(tokio::sync::Notify::new());
        let (release_tx, release_rx) = std::sync::mpsc::channel::<()>();
        let writer_store = store.clone();
        let entered_writer = entered.clone();
        let writer = tokio::spawn(async move {
            writer_store
                .transaction(move |tx| {
                    tx.execute(
                        "INSERT INTO agent_runtime_leases(key, owner, fence, expires_ms) VALUES('w', 'owner', 1, 9999)",
                        [],
                    )
                    .map_err(db_error)?;
                    entered_writer.notify_one();
                    release_rx
                        .recv_timeout(Duration::from_secs(5))
                        .map_err(|_| Error::Checkpoint("writer release timed out".into()))?;
                    Ok(())
                })
                .await
        });

        tokio::time::timeout(Duration::from_secs(5), entered.notified())
            .await
            .unwrap();

        let loaded = tokio::time::timeout(Duration::from_secs(2), store.load("thread-1"))
            .await
            .expect("load must not block behind an active write transaction")
            .unwrap()
            .unwrap();
        assert_eq!(loaded.revision, 1);

        let lease_count = tokio::time::timeout(
            Duration::from_secs(2),
            store.read_transaction(|tx| {
                tx.query_row("SELECT COUNT(*) FROM agent_runtime_leases", [], |r| {
                    r.get::<_, i64>(0)
                })
                .map_err(db_error)
            }),
        )
        .await
        .expect("read_transaction must not block behind an active write transaction")
        .unwrap();
        assert_eq!(lease_count, 0);

        release_tx.send(()).unwrap();
        writer.await.unwrap().unwrap();

        let after_commit = store
            .read_transaction(|tx| {
                tx.query_row("SELECT COUNT(*) FROM agent_runtime_leases", [], |r| {
                    r.get::<_, i64>(0)
                })
                .map_err(db_error)
            })
            .await
            .unwrap();
        assert_eq!(after_commit, 1);
    }

    #[tokio::test]
    async fn legacy_migration_creates_indexes_and_query_planner_uses_them() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("legacy.sqlite");
        let store = SqliteStore::open(&path).unwrap();
        // Simulate a legacy database created before these indexes existed.
        store
            .transaction(|tx| {
                tx.execute_batch(
                    "DROP INDEX IF EXISTS idx_agent_runtime_children_run_id;
                     DROP INDEX IF EXISTS idx_agent_runtime_cancel_unack;",
                )
                .map_err(db_error)?;
                Ok(())
            })
            .await
            .unwrap();
        drop(store);

        let migrated = SqliteStore::open(&path).unwrap();
        migrated
            .transaction(|tx| {
                tx.execute(
                    "INSERT INTO agent_runtime_children(key, root_id, payload)
                     VALUES('root:child-1', 'root-1', '{\"run_id\":\"child-1\",\"status\":\"running\"}')",
                    [],
                )
                .map_err(db_error)?;
                tx.execute(
                    "INSERT INTO agent_runtime_cancel(address, command_id, acknowledged)
                     VALUES('{\"root_run_id\":\"root-1\",\"run_id\":\"child-1\",\"thread_id\":\"t\",\"agent\":\"a\"}', 'cmd-1', 0)",
                    [],
                )
                .map_err(db_error)?;
                Ok(())
            })
            .await
            .unwrap();

        let (child_plan, cancel_plan) = migrated
            .read_transaction(|tx| {
                let explain = |sql: &str| -> Result<Vec<String>, Error> {
                    let mut stmt = tx.prepare(sql).map_err(db_error)?;
                    let rows = stmt
                        .query_map([], |row| row.get::<_, String>(3))
                        .map_err(db_error)?
                        .collect::<Result<Vec<_>, _>>()
                        .map_err(db_error)?;
                    Ok(rows)
                };
                let child = explain(
                    "EXPLAIN QUERY PLAN SELECT root_id FROM agent_runtime_children
                     WHERE json_extract(payload, '$.run_id') = 'child-1'",
                )?;
                let cancel = explain(
                    "EXPLAIN QUERY PLAN SELECT EXISTS(
                         SELECT 1 FROM agent_runtime_cancel
                         WHERE acknowledged = 0
                           AND json_extract(address, '$.run_id') = 'child-1'
                           AND json_extract(address, '$.root_run_id') = 'root-1'
                     )",
                )?;
                Ok((child.join("\n"), cancel.join("\n")))
            })
            .await
            .unwrap();

        assert!(
            child_plan.contains("idx_agent_runtime_children_run_id"),
            "expected child query to use idx_agent_runtime_children_run_id, got:\n{child_plan}"
        );
        assert!(
            cancel_plan.contains("idx_agent_runtime_cancel_unack"),
            "expected cancel query to use idx_agent_runtime_cancel_unack, got:\n{cancel_plan}"
        );
    }

    #[tokio::test(flavor = "multi_thread", worker_threads = 4)]
    async fn concurrent_children_and_work_wait_avoid_sqlite_busy() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("stress.sqlite");
        let store = SqliteStore::open(&path).unwrap();

        let root_id = "root-stress".to_string();
        let release = crate::system::content_digest(&"rel").unwrap();
        let req = crate::supervisor::jobs::ManagedRunRequest {
            approval_mode: None,
            run_id: root_id.clone(),
            thread_id: root_id.clone(),
            system: "sys".into(),
            release,
            program: "agent".into(),
            input: None,
            parameters: None,
        };
        let digest = crate::system::content_digest(&req).unwrap();
        let req_json = serde_json::to_string(&req).unwrap();
        let root_tx = root_id.clone();
        store
            .transaction(move |tx| {
                tx.execute(
                    "INSERT INTO agent_runtime_managed_runs(run_id, digest, payload) VALUES(?1, ?2, ?3)",
                    params![root_tx, digest, req_json],
                )
                .map_err(db_error)?;
                tx.execute(
                    "INSERT INTO agent_runtime_jobs(run_id, thread_key, digest, payload, status) VALUES(?1, ?1, ?2, '{}', 'running')",
                    params![root_tx, digest],
                )
                .map_err(db_error)?;
                Ok(())
            })
            .await
            .unwrap();

        let initial_page = store.work_list(&root_id, None, 16).await.unwrap().unwrap();
        let watermark = initial_page.watermark;

        let mut writers = Vec::new();
        for worker_idx in 0..6 {
            let store = store.clone();
            let root = root_id.clone();
            writers.push(tokio::spawn(async move {
                for step in 0..12 {
                    let child_id = format!("child-{worker_idx}-{step}");
                    let key = format!("{root}:{child_id}");
                    let record = crate::supervisor::ChildRunRecord {
                        root_run_id: root.clone(),
                        parent_run_id: root.clone(),
                        run_id: child_id.clone(),
                        thread_id: format!("thread-{child_id}"),
                        agent_name: "worker".into(),
                        kind: Some("agent".into()),
                        checkpoint_key: None,
                        node_id: None,
                        workflow_ref: None,
                        composition: "comp".into(),
                        status: if step % 2 == 0 {
                            "running"
                        } else {
                            "completed"
                        }
                        .into(),
                        error: None,
                    };
                    let payload = serde_json::to_string(&record).unwrap();
                    let root_for_tx = root.clone();
                    store
                        .transaction(move |tx| {
                            tx.execute(
                                "INSERT INTO agent_runtime_children(key, root_id, payload)
                                 VALUES(?1, ?2, ?3)
                                 ON CONFLICT(key) DO UPDATE SET payload = excluded.payload",
                                params![key, root_for_tx, payload],
                            )
                            .map_err(db_error)?;
                            Ok(())
                        })
                        .await?;
                }
                Ok::<_, Error>(())
            }));
        }

        let mut readers = Vec::new();
        for _ in 0..4 {
            let store = store.clone();
            let root = root_id.clone();
            let mut cursor = Some(watermark.clone());
            readers.push(tokio::spawn(async move {
                for _ in 0..10 {
                    let page = store.work_list(&root, None, 32).await?;
                    assert!(page.is_some());
                    let changes = store
                        .wait_work(
                            false,
                            &root,
                            cursor.clone(),
                            Vec::new(),
                            32,
                            Duration::from_millis(250),
                        )
                        .await?;
                    cursor = Some(changes.watermark);
                }
                Ok::<_, Error>(())
            }));
        }

        for task in writers {
            task.await.unwrap().unwrap();
        }
        for task in readers {
            task.await.unwrap().unwrap();
        }
        let final_page = store.work_list(&root_id, None, 64).await.unwrap().unwrap();
        assert_eq!(final_page.items.len(), 64);
    }

    #[tokio::test]
    async fn read_transaction_tracks_placed_path_migration_and_admission_marker_removal() {
        use placement::SqlitePlacement;
        use std::sync::RwLock;

        struct SwitchablePlacement {
            state: RwLock<(PathBuf, bool, bool)>,
        }

        impl placement::SqlitePlacement for SwitchablePlacement {
            fn authority(&self) -> &str {
                "read-tx-placement-test"
            }
            fn logical_identity(&self) -> &str {
                "read-tx-logical-id"
            }
            fn acquire(&self) -> Result<placement::PlacementPermit, Error> {
                let guard = self.state.read().unwrap();
                placement::PlacementPermit::new(guard.0.clone(), guard.1, guard.2, Box::new(()))
            }
        }

        let dir = tempfile::tempdir().unwrap();
        let origin = dir.path().join("origin.sqlite");
        let target = dir.path().join("target.sqlite");
        let policy = Arc::new(crate::admission::tests::Policy::default());
        let location = Arc::new(SwitchablePlacement {
            state: RwLock::new((origin.clone(), true, true)),
        });

        let store =
            SqliteStore::open_placed(&origin, location.clone(), Some(policy.clone())).unwrap();
        location.state.write().unwrap().2 = false;

        store
            .transaction(|tx| {
                tx.execute(
                    "INSERT INTO agent_runtime_events(root_id, payload) VALUES('placed-run', '{\"seq\":1}')",
                    [],
                )
                .map_err(db_error)?;
                Ok(())
            })
            .await
            .unwrap();
        let count_origin: i64 = store
            .read_transaction(|tx| {
                tx.query_row(
                    "SELECT COUNT(*) FROM agent_runtime_events WHERE root_id='placed-run'",
                    [],
                    |r| r.get(0),
                )
                .map_err(db_error)
            })
            .await
            .unwrap();
        assert_eq!(count_origin, 1);

        let snap = transport::inspect_snapshot(&origin).unwrap();
        transport::copy_snapshot(&origin, &target, &snap).unwrap();
        store.protect_snapshot(&target).unwrap();
        transport::retire_snapshot(&origin, &snap, location.authority(), "migrate", 0).unwrap();

        *location.state.write().unwrap() = (target.clone(), true, false);
        // Prime read_transaction on migrated target, then commit another row and read back.
        let count_before: i64 = store
            .read_transaction(|tx| {
                tx.query_row(
                    "SELECT COUNT(*) FROM agent_runtime_events WHERE root_id='placed-run'",
                    [],
                    |r| r.get(0),
                )
                .map_err(db_error)
            })
            .await
            .unwrap();
        assert_eq!(count_before, 1);

        store
            .transaction(|tx| {
                tx.execute(
                    "INSERT INTO agent_runtime_events(root_id, payload) VALUES('placed-run', '{\"seq\":2}')",
                    [],
                )
                .map_err(db_error)?;
                Ok(())
            })
            .await
            .unwrap();
        let count_after: i64 = store
            .read_transaction(|tx| {
                tx.query_row(
                    "SELECT COUNT(*) FROM agent_runtime_events WHERE root_id='placed-run'",
                    [],
                    |r| r.get(0),
                )
                .map_err(db_error)
            })
            .await
            .unwrap();
        assert_eq!(count_after, 2);

        // Reopening a prepared read-only placed store with admission must initialize temp
        // retention triggers cleanly while still enforcing query_only on SQL writes.
        let readonly_location = Arc::new(SwitchablePlacement {
            state: RwLock::new((target.clone(), false, false)),
        });
        let readonly_store =
            SqliteStore::open_placed(&target, readonly_location, Some(policy.clone())).unwrap();
        let readonly_count: i64 = readonly_store
            .read_transaction(|tx| {
                tx.query_row(
                    "SELECT COUNT(*) FROM agent_runtime_events WHERE root_id='placed-run'",
                    [],
                    |r| r.get(0),
                )
                .map_err(db_error)
            })
            .await
            .unwrap();
        assert_eq!(readonly_count, 2);
        assert!(
            readonly_store
                .transaction(|tx| {
                    tx.execute(
                        "INSERT INTO agent_runtime_events(root_id, payload) VALUES('placed-run', '{}')",
                        [],
                    )
                    .map_err(db_error)?;
                    Ok(())
                })
                .await
                .is_err(),
            "prepared read-only placed store must reject SQL writes"
        );

        // Removing the admission marker on target must immediately fail closed on read_transaction.
        let mut marker_name = target.as_os_str().to_owned();
        marker_name.push(".admission");
        std::fs::remove_file(PathBuf::from(marker_name)).unwrap();
        assert!(
            store
                .read_transaction(|tx| {
                    tx.query_row("SELECT COUNT(*) FROM agent_runtime_events", [], |r| {
                        r.get::<_, i64>(0)
                    })
                    .map_err(db_error)
                })
                .await
                .is_err(),
            "read_transaction must fail closed when admission marker is deleted"
        );
    }
}
