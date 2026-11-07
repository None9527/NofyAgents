//! Whole-store SQLite snapshots. The caller excludes source writers and owns
//! the explicit destination; this module does not move admission or ownership.
use super::{Error, db_error};
use rusqlite::{Connection, OpenFlags, types::ValueRef};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{fs::OpenOptions, path::Path, time::Duration};
#[cfg(test)]
mod tests;
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct RuntimeSnapshot {
    pub protocol: String,
    pub fingerprint: String,
    pub tables: u64,
    pub rows: u64,
    pub bytes: u64,
}
fn failure(message: &str) -> Error {
    Error::Checkpoint(message.into())
}
fn quote(s: &str) -> String {
    format!("\"{}\"", s.replace('"', "\"\""))
}
fn feed(hash: &mut Sha256, bytes: &[u8]) {
    hash.update((bytes.len() as u64).to_le_bytes());
    hash.update(bytes);
}
pub(super) fn readonly(path: &Path) -> Result<Connection, Error> {
    let meta = path.symlink_metadata().map_err(db_error)?;
    if !path.is_absolute() || !meta.is_file() || meta.file_type().is_symlink() {
        return Err(failure(
            "runtime snapshot requires a real absolute database file",
        ));
    }
    let db = Connection::open_with_flags(
        path,
        OpenFlags::SQLITE_OPEN_READ_ONLY | OpenFlags::SQLITE_OPEN_NO_MUTEX,
    )
    .map_err(db_error)?;
    db.busy_timeout(Duration::from_secs(5)).map_err(db_error)?;
    Ok(db)
}
pub fn inspect_snapshot(path: &Path) -> Result<RuntimeSnapshot, Error> {
    let mut db = readonly(path)?;
    let tx = db
        .transaction_with_behavior(rusqlite::TransactionBehavior::Deferred)
        .map_err(db_error)?;
    let result = inventory(&tx)?;
    tx.commit().map_err(db_error)?;
    Ok(result)
}
fn inventory(tx: &Connection) -> Result<RuntimeSnapshot, Error> {
    let owned = super::placement::fence::owned_objects(tx)?;
    let versions = tx
        .prepare("SELECT version FROM agent_runtime_schema")
        .map_err(db_error)?
        .query_map([], |r| r.get::<_, u32>(0))
        .map_err(db_error)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(db_error)?;
    if versions != [1] {
        return Err(failure("unsupported runtime snapshot schema"));
    }
    let integrity: String = tx
        .query_row("PRAGMA integrity_check", [], |r| r.get(0))
        .map_err(db_error)?;
    if integrity != "ok"
        || tx
            .prepare("PRAGMA foreign_key_check")
            .map_err(db_error)?
            .exists([])
            .map_err(db_error)?
    {
        return Err(failure("inconsistent runtime snapshot"));
    }
    let tables = tx
        .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        .map_err(db_error)?
        .query_map([], |r| r.get::<_, String>(0))
        .map_err(db_error)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(db_error)?
        .into_iter()
        .filter(|n| !owned.contains(n))
        .collect::<Vec<_>>();
    let mut hash = Sha256::new();
    let mut stats = RuntimeSnapshot {
        protocol: "nofy.runtime-snapshot/v1".into(),
        fingerprint: String::new(),
        tables: tables.len() as u64,
        rows: 0,
        bytes: 0,
    };
    {
        let mut schema = tx
            .prepare("SELECT type,name,sql FROM sqlite_master ORDER BY type,name")
            .map_err(db_error)?;
        let mut rows = schema.query([]).map_err(db_error)?;
        while let Some(row) = rows.next().map_err(db_error)? {
            let name: String = row.get(1).map_err(db_error)?;
            if owned.contains(&name) {
                continue;
            }
            for n in 0..3 {
                let text: Option<String> = row.get(n).map_err(db_error)?;
                feed(&mut hash, text.as_deref().unwrap_or("").as_bytes());
            }
        }
    }
    for table in tables {
        feed(&mut hash, table.as_bytes());
        let shape = tx
            .prepare(&format!("SELECT * FROM {}", quote(&table)))
            .map_err(db_error)?;
        let columns = shape.column_count();
        let order = shape
            .column_names()
            .into_iter()
            .map(|n| format!("typeof({0}) COLLATE BINARY,{0} COLLATE BINARY", quote(n)))
            .collect::<Vec<_>>()
            .join(",");
        let mut statement = tx
            .prepare(&format!("SELECT * FROM {} ORDER BY {order}", quote(&table)))
            .map_err(db_error)?;
        let mut rows = statement.query([]).map_err(db_error)?;
        while let Some(row) = rows.next().map_err(db_error)? {
            stats.rows += 1;
            feed(&mut hash, b"row");
            for n in 0..columns {
                match row.get_ref(n).map_err(db_error)? {
                    ValueRef::Null => feed(&mut hash, b"null"),
                    ValueRef::Integer(v) => {
                        feed(&mut hash, b"integer");
                        feed(&mut hash, &v.to_le_bytes());
                        stats.bytes += 8;
                    }
                    ValueRef::Real(v) => {
                        feed(&mut hash, b"real");
                        feed(&mut hash, &v.to_bits().to_le_bytes());
                        stats.bytes += 8;
                    }
                    ValueRef::Text(v) => {
                        feed(&mut hash, b"text");
                        feed(&mut hash, v);
                        stats.bytes += v.len() as u64;
                    }
                    ValueRef::Blob(v) => {
                        feed(&mut hash, b"blob");
                        feed(&mut hash, v);
                        stats.bytes += v.len() as u64;
                    }
                }
            }
        }
    }
    stats.fingerprint = format!("{:x}", hash.finalize());
    Ok(stats)
}
/// Compare the business snapshot and exclude new execution owners under the
/// same SQLite writer lock that retires this source. File routing is not enough
/// to stop an already opened connection to the old physical database.
pub fn retire_snapshot(
    path: &Path,
    expected: &RuntimeSnapshot,
    authority: &str,
    command: &str,
    now: u64,
) -> Result<(), Error> {
    readonly(path)?;
    let mut db =
        Connection::open_with_flags(path, OpenFlags::SQLITE_OPEN_READ_WRITE).map_err(db_error)?;
    db.busy_timeout(Duration::from_secs(5)).map_err(db_error)?;
    db.pragma_update(None, "synchronous", "FULL")
        .map_err(db_error)?;
    let tx = db
        .transaction_with_behavior(rusqlite::TransactionBehavior::Immediate)
        .map_err(db_error)?;
    if inventory(&tx)? != *expected {
        return Err(failure("runtime source changed before retirement"));
    }
    let live: bool = tx
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM agent_runtime_leases WHERE expires_ms>?1)",
            [now],
            |r| r.get(0),
        )
        .map_err(db_error)?;
    if live {
        return Err(failure("runtime source still has a live execution lease"));
    }
    super::placement::fence::retire(&tx, authority, command)?;
    tx.commit().map_err(db_error)
}
pub fn release_retirement(path: &Path, authority: &str, command: &str) -> Result<(), Error> {
    readonly(path)?;
    let mut db =
        Connection::open_with_flags(path, OpenFlags::SQLITE_OPEN_READ_WRITE).map_err(db_error)?;
    db.busy_timeout(Duration::from_secs(5)).map_err(db_error)?;
    db.pragma_update(None, "synchronous", "FULL")
        .map_err(db_error)?;
    let tx = db
        .transaction_with_behavior(rusqlite::TransactionBehavior::Immediate)
        .map_err(db_error)?;
    super::placement::fence::release(&tx, authority, command)?;
    tx.commit().map_err(db_error)
}
/// No row or payload is rewritten. Pending effects and their original storage
/// proofs travel together; reopening authority is supplied separately by host.
pub fn copy_snapshot(
    source: &Path,
    target: &Path,
    expected: &RuntimeSnapshot,
) -> Result<RuntimeSnapshot, Error> {
    if !target.is_absolute() || source == target {
        return Err(failure("runtime snapshot needs a distinct absolute target"));
    }
    if inspect_snapshot(source)? != *expected {
        return Err(failure("runtime snapshot changed before copy"));
    }
    let source_db = readonly(source)?;
    if super::placement::fence::state(&source_db)?.is_some_and(|(_, writable, _)| !writable) {
        return Err(failure(
            "retired source requires its original prepared copy; restore transfer metadata",
        ));
    }
    let mut options = OpenOptions::new();
    options.write(true).create_new(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.mode(0o600);
    }
    options
        .open(target)
        .map_err(db_error)?
        .sync_all()
        .map_err(db_error)?;
    let mut target_db = Connection::open(target).map_err(db_error)?;
    {
        let backup = rusqlite::backup::Backup::new(&source_db, &mut target_db).map_err(db_error)?;
        backup
            .run_to_completion(256, Duration::from_millis(2), None)
            .map_err(db_error)?;
    }
    target_db
        .pragma_update(None, "journal_mode", "DELETE")
        .map_err(db_error)?;
    drop(target_db);
    drop(source_db);
    nofy_durable_fs::sync_file(target).map_err(db_error)?;
    nofy_durable_fs::sync_directory(
        target
            .parent()
            .ok_or_else(|| failure("runtime snapshot target has no parent"))?,
    )
    .map_err(db_error)?;
    let copied = inspect_snapshot(target)?;
    if copied != *expected || inspect_snapshot(source)? != *expected {
        return Err(failure(
            "runtime snapshot copy did not retain its original facts",
        ));
    }
    Ok(copied)
}
