use super::*;
use rusqlite::{Connection, OptionalExtension, params};
const SCHEMA:&str="CREATE TABLE metadata(key TEXT PRIMARY KEY,value TEXT NOT NULL);
 CREATE TABLE namespaces(namespace TEXT PRIMARY KEY,dataset TEXT NOT NULL,status TEXT NOT NULL,payload TEXT NOT NULL);
 CREATE UNIQUE INDEX active_dataset ON namespaces(dataset) WHERE status='active';
 CREATE TABLE transfers(command TEXT PRIMARY KEY,payload TEXT NOT NULL);
 INSERT INTO metadata VALUES('protocol','nofy.memory-transfer/v1'); PRAGMA user_version=1;";
pub(super) fn open(path: &Path, create: bool) -> Result<Option<Connection>> {
    let exists = match std::fs::symlink_metadata(path) {
        Ok(metadata) if metadata.is_file() && !metadata.file_type().is_symlink() => true,
        Ok(_) => return Err(unavailable()),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => false,
        Err(error) => return Err(storage::unavailable(error)),
    };
    if !exists && !create {
        return Ok(None);
    }
    if exists {
        let metadata = std::fs::symlink_metadata(path).map_err(storage::unavailable)?;
        if !metadata.is_file() || metadata.file_type().is_symlink() {
            return Err(unavailable());
        }
    }
    let mut db = if create {
        nofy_sqlite_journal::JournalMode::Wal
            .open(path)
            .map_err(db_error)?
    } else {
        Connection::open_with_flags(path, rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY)
            .map_err(db_error)?
    };
    db.busy_timeout(std::time::Duration::from_secs(5))
        .map_err(db_error)?;
    if !exists {
        let tx = db.transaction().map_err(db_error)?;
        tx.execute_batch(SCHEMA).map_err(db_error)?;
        tx.commit().map_err(db_error)?;
    }
    let protocol: String = db
        .query_row(
            "SELECT value FROM metadata WHERE key='protocol'",
            [],
            |row| row.get(0),
        )
        .map_err(db_error)?;
    let version: u32 = db
        .query_row("PRAGMA user_version", [], |row| row.get(0))
        .map_err(db_error)?;
    if protocol != PROTOCOL || version != 1 {
        return Err(unavailable());
    }
    Ok(Some(db))
}
fn status(value: &Status) -> &'static str {
    match value {
        Status::Vacant => "vacant",
        Status::Active => "active",
        Status::Retired => "retired",
        Status::Preparing => "preparing",
    }
}
pub(super) fn location(db: &Connection, namespace: &str) -> Result<Option<Location>> {
    let row: Option<(String, String, String)> = db
        .query_row(
            "SELECT dataset,status,payload FROM namespaces WHERE namespace=?1",
            [namespace],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
        )
        .optional()
        .map_err(db_error)?;
    row.map(|(dataset, state, payload)| {
        let value: Location = serde_json::from_str(&payload).map_err(|_| unavailable())?;
        if value.namespace != namespace
            || value.dataset != dataset
            || status(&value.status) != state
        {
            return Err(unavailable());
        }
        value.root(Path::new("/"))?;
        Ok(value)
    })
    .transpose()
}
fn set_location(db: &Connection, value: &Location) -> Result<()> {
    db.execute("INSERT INTO namespaces(namespace,dataset,status,payload) VALUES(?1,?2,?3,?4)
       ON CONFLICT(namespace) DO UPDATE SET dataset=excluded.dataset,status=excluded.status,payload=excluded.payload",
       params![value.namespace,value.dataset,status(&value.status),encode(value)?]).map_err(db_error)?;
    Ok(())
}
pub(super) fn record(db: &Connection, command: &str) -> Result<Option<Record>> {
    let payload: Option<String> = db
        .query_row(
            "SELECT payload FROM transfers WHERE command=?1",
            [command],
            |row| row.get(0),
        )
        .optional()
        .map_err(db_error)?;
    payload
        .map(|payload| {
            let record: Record = serde_json::from_str(&payload).map_err(|_| unavailable())?;
            if record.command != command
                || record.intent.plan.protocol != PROTOCOL
                || !digest(&record.intent.generation)
                || !matches!(
                    record.phase.as_str(),
                    "preparing" | "prepared" | "completed" | "aborted"
                )
            {
                return Err(unavailable());
            }
            let mut plan = record.intent.plan.clone();
            let claimed = std::mem::take(&mut plan.fingerprint);
            if hash(&plan)? != claimed {
                return Err(unavailable());
            }
            if record.intent.source.namespace != record.intent.plan.source
                || record.intent.target.namespace != record.intent.plan.target
                || record.intent.source.revision != record.intent.plan.source_revision
                || record.intent.target.revision != record.intent.plan.target_revision
                || record.intent.source.status != Status::Active
                || !matches!(
                    record.intent.target.status,
                    Status::Vacant | Status::Retired
                )
                || !digest(&record.intent.input)
                || !digest(&record.intent.plan.source_backend)
                || !digest(&record.intent.plan.target_backend)
                || record.intent.plan.source == record.intent.plan.target
                || record.intent.plan.inventory.protocol != "nofy.memory-snapshot/v1"
            {
                return Err(unavailable());
            }
            record.intent.source.root(Path::new("/"))?;
            record.intent.target.root(Path::new("/"))?;
            if matches!(record.phase.as_str(), "completed" | "aborted") != record.result.is_some()
                || record.phase == "prepared" && record.intent.staged.is_none()
            {
                return Err(unavailable());
            }
            if let Some(result) = &record.result {
                let mut source = record.intent.source.clone();
                let mut target = record.intent.target.clone();
                source.revision = source.revision.checked_add(1).ok_or_else(unavailable)?;
                target.revision = target.revision.checked_add(1).ok_or_else(unavailable)?;
                source.command = Some(record.command.clone());
                target.command = Some(record.command.clone());
                if record.phase == "completed" {
                    source.status = Status::Retired;
                    target.status = Status::Active;
                    target.dataset = source.dataset.clone();
                    target.generation = record.intent.generation.clone();
                }
                let expected = receipt(&record, &source, &target, &record.phase);
                if encode(result)? != encode(&expected)? {
                    return Err(unavailable());
                }
            }
            Ok(record)
        })
        .transpose()
}
fn set_record(db: &Connection, record: &Record) -> Result<()> {
    db.execute("INSERT INTO transfers(command,payload) VALUES(?1,?2) ON CONFLICT(command) DO UPDATE SET payload=excluded.payload",
        params![record.command,encode(record)?]).map_err(db_error)?;
    Ok(())
}
fn original(db: &Connection, value: &Location) -> Result<bool> {
    Ok(match location(db, &value.namespace)? {
        None => value.revision == 0 && value.generation == "origin",
        Some(mut current) => {
            if current.status == Status::Vacant && value.status == Status::Active {
                current.status = Status::Active;
            }
            current == *value
        }
    })
}
pub(super) fn reserve(db: &mut Connection, record: &Record) -> Result<()> {
    let tx = db
        .transaction_with_behavior(rusqlite::TransactionBehavior::Immediate)
        .map_err(db_error)?;
    if self::record(&tx, &record.command)?.is_some()
        || !original(&tx, &record.intent.source)?
        || !original(&tx, &record.intent.target)?
    {
        return Err(HostError::Control(ControlError::CommandConflict));
    }
    let mut source = record.intent.source.clone();
    source.status = Status::Preparing;
    source.command = Some(record.command.clone());
    let mut target = record.intent.target.clone();
    target.status = Status::Preparing;
    target.command = Some(record.command.clone());
    target.dataset = source.dataset.clone();
    target.generation = record.intent.generation.clone();
    set_location(&tx, &source)?;
    set_location(&tx, &target)?;
    set_record(&tx, record)?;
    tx.commit().map_err(db_error)
}
pub(super) fn verify_pending(db: &Connection, record: &Record) -> Result<()> {
    let source = location(db, &record.intent.plan.source)?.ok_or_else(unavailable)?;
    let target = location(db, &record.intent.plan.target)?.ok_or_else(unavailable)?;
    if source.status != Status::Preparing
        || target.status != Status::Preparing
        || source.command.as_deref() != Some(&record.command)
        || target.command.as_deref() != Some(&record.command)
        || source.generation != record.intent.source.generation
        || target.generation != record.intent.generation
        || source.dataset != record.intent.source.dataset
        || target.dataset != source.dataset
        || source.revision != record.intent.source.revision
        || target.revision != record.intent.target.revision
    {
        return Err(unavailable());
    }
    Ok(())
}
pub(super) fn restage(db: &mut Connection, record: &Record) -> Result<()> {
    let tx = db
        .transaction_with_behavior(rusqlite::TransactionBehavior::Immediate)
        .map_err(db_error)?;
    let previous = self::record(&tx, &record.command)?.ok_or_else(unavailable)?;
    verify_pending(&tx, &previous)?;
    if previous.result.is_some() || previous.intent.staged.is_some() {
        return Err(unavailable());
    }
    let mut target = location(&tx, &record.intent.plan.target)?.ok_or_else(unavailable)?;
    target.generation = record.intent.generation.clone();
    set_location(&tx, &target)?;
    set_record(&tx, record)?;
    tx.commit().map_err(db_error)
}
pub(super) fn prepared(db: &mut Connection, record: &Record) -> Result<()> {
    let tx = db
        .transaction_with_behavior(rusqlite::TransactionBehavior::Immediate)
        .map_err(db_error)?;
    verify_pending(&tx, record)?;
    set_record(&tx, record)?;
    tx.commit().map_err(db_error)
}
fn receipt(record: &Record, source: &Location, target: &Location, phase: &str) -> TransferReceipt {
    TransferReceipt {
        protocol: PROTOCOL.into(),
        command_id: record.command.clone(),
        fingerprint: record.intent.plan.fingerprint.clone(),
        phase: phase.into(),
        plan: record.intent.plan.clone(),
        source: source.into(),
        target: target.into(),
    }
}
pub(super) fn publish(db: &mut Connection, record: &Record) -> Result<TransferReceipt> {
    let tx = db
        .transaction_with_behavior(rusqlite::TransactionBehavior::Immediate)
        .map_err(db_error)?;
    let mut saved = self::record(&tx, &record.command)?.ok_or_else(unavailable)?;
    if let Some(result) = saved.result {
        return Ok(result);
    }
    if saved.phase != "prepared" || saved.intent.staged != record.intent.staged {
        return Err(unavailable());
    }
    verify_pending(&tx, record)?;
    let mut source = location(&tx, &record.intent.plan.source)?.ok_or_else(unavailable)?;
    let mut target = location(&tx, &record.intent.plan.target)?.ok_or_else(unavailable)?;
    source.status = Status::Retired;
    target.status = Status::Active;
    source.revision = source.revision.checked_add(1).ok_or_else(unavailable)?;
    target.revision = target.revision.checked_add(1).ok_or_else(unavailable)?;
    set_location(&tx, &source)?;
    set_location(&tx, &target)?;
    let result = receipt(record, &source, &target, "completed");
    saved.phase = "completed".into();
    saved.result = Some(result.clone());
    set_record(&tx, &saved)?;
    tx.commit().map_err(db_error)?;
    Ok(result)
}
pub(super) fn abort(db: &mut Connection, record: &Record) -> Result<TransferReceipt> {
    let tx = db
        .transaction_with_behavior(rusqlite::TransactionBehavior::Immediate)
        .map_err(db_error)?;
    verify_pending(&tx, record)?;
    let mut source = record.intent.source.clone();
    let mut target = record.intent.target.clone();
    source.revision = source.revision.checked_add(1).ok_or_else(unavailable)?;
    target.revision = target.revision.checked_add(1).ok_or_else(unavailable)?;
    source.command = Some(record.command.clone());
    target.command = Some(record.command.clone());
    set_location(&tx, &source)?;
    set_location(&tx, &target)?;
    let result = receipt(record, &source, &target, "aborted");
    let mut saved = record.clone();
    saved.phase = "aborted".into();
    saved.result = Some(result.clone());
    set_record(&tx, &saved)?;
    tx.commit().map_err(db_error)?;
    Ok(result)
}
