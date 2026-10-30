//! Explicit SQLite persistence. Default runtime users do not load SQLite or
//! discover a database. Checkpoints and lease fences commit in one transaction.
use crate::{Checkpoint, Checkpointer, Error};
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
    connection: Arc<Mutex<Connection>>,
    path: PathBuf,
    pub(crate) clock: Arc<dyn Clock>,
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
        if !path.is_absolute() {
            return Err(Error::Checkpoint(
                "an explicit absolute SQLite path is required".into(),
            ));
        }
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).map_err(db_error)?;
        }
        let mode = nofy_sqlite_journal::JournalMode::for_db_path(path);
        let mut connection = mode.open(path).map_err(db_error)?;
        connection
            .pragma_update(None, "synchronous", "FULL")
            .map_err(db_error)?;
        let tx = connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(db_error)?;
        tx.execute_batch("CREATE TABLE IF NOT EXISTS agent_runtime_schema(version INTEGER NOT NULL);
            CREATE TABLE IF NOT EXISTS agent_runtime_checkpoints(key TEXT PRIMARY KEY,revision INTEGER NOT NULL,payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS agent_runtime_leases(key TEXT PRIMARY KEY,owner TEXT NOT NULL,fence INTEGER NOT NULL,expires_ms INTEGER NOT NULL);
            CREATE TABLE IF NOT EXISTS agent_runtime_runs(id TEXT PRIMARY KEY,thread_key TEXT NOT NULL,payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS agent_runtime_threads(key TEXT PRIMARY KEY,active_run TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS agent_runtime_children(key TEXT PRIMARY KEY,root_id TEXT NOT NULL,payload TEXT NOT NULL);
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
            CREATE TABLE IF NOT EXISTS agent_runtime_reconciliations(key TEXT PRIMARY KEY,root_id TEXT NOT NULL,child_id TEXT NOT NULL,call_id TEXT NOT NULL,payload TEXT NOT NULL,rejection TEXT);
            CREATE TABLE IF NOT EXISTS agent_runtime_jobs(sequence INTEGER PRIMARY KEY AUTOINCREMENT,run_id TEXT NOT NULL UNIQUE,thread_key TEXT NOT NULL,digest TEXT NOT NULL,payload TEXT NOT NULL,status TEXT NOT NULL,source_sequence INTEGER UNIQUE);
            CREATE INDEX IF NOT EXISTS agent_runtime_jobs_fifo ON agent_runtime_jobs(thread_key,sequence);
            CREATE TABLE IF NOT EXISTS agent_runtime_approvals(key TEXT PRIMARY KEY,run_id TEXT NOT NULL,call_json TEXT NOT NULL,payload TEXT NOT NULL,decision INTEGER);
            CREATE TABLE IF NOT EXISTS agent_runtime_managed_runs(run_id TEXT PRIMARY KEY,digest TEXT NOT NULL,payload TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS agent_runtime_managed_actions(sequence INTEGER PRIMARY KEY AUTOINCREMENT,command_id TEXT NOT NULL UNIQUE,run_id TEXT NOT NULL,digest TEXT NOT NULL,payload TEXT NOT NULL,result TEXT);
            CREATE INDEX IF NOT EXISTS agent_runtime_managed_actions_run ON agent_runtime_managed_actions(run_id,sequence);
            CREATE TABLE IF NOT EXISTS agent_runtime_abandoned_runs(run_id TEXT PRIMARY KEY,thread_key TEXT NOT NULL UNIQUE,payload TEXT NOT NULL);")
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
        tx.commit().map_err(db_error)?;
        Ok(Self {
            connection: Arc::new(Mutex::new(connection)),
            path: mode.effective_db_path(path),
            clock,
        })
    }
    pub fn path(&self) -> &Path {
        &self.path
    }
    pub(crate) async fn transaction<T: Send + 'static>(
        &self,
        f: impl FnOnce(&Transaction<'_>) -> Result<T, Error> + Send + 'static,
    ) -> Result<T, Error> {
        let connection = self.connection.clone();
        tokio::task::spawn_blocking(move || {
            let mut connection = connection
                .lock()
                .map_err(|_| Error::Checkpoint("SQLite connection poisoned".into()))?;
            let tx = connection
                .transaction_with_behavior(TransactionBehavior::Immediate)
                .map_err(db_error)?;
            let result = f(&tx)?;
            tx.commit().map_err(db_error)?;
            Ok(result)
        })
        .await
        .map_err(db_error)?
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
        self.transaction(move |tx| {
            let changed=tx.execute("UPDATE agent_runtime_leases SET expires_ms=0 WHERE key=?1 AND owner=?2 AND fence=?3",params![lease.key,lease.owner,lease.fence]).map_err(db_error)?;
            if changed!=1 {return Err(Error::Checkpoint("lease fence lost".into()));} Ok(())
        }).await
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
        self.transaction(move |tx| {
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
        self.transaction(move |tx| {
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
