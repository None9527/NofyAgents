use super::*;
use rusqlite::{Connection, OpenFlags, types::ValueRef};
use std::time::Duration;

pub(super) struct Summary {
    pub digest: String,
    pub tombstones: u64,
    pub undo_tokens: u64,
    pub capture_jobs: u64,
}
fn open(path: &Path) -> TransportResult<Connection> {
    // The owning host pins the private namespace and excludes writers. Validate
    // the actual path before opening SQLite, including any durable WAL.
    drop(regular(path)?);
    Ok(Connection::open_with_flags(
        path,
        OpenFlags::SQLITE_OPEN_READ_ONLY | OpenFlags::SQLITE_OPEN_NO_MUTEX,
    )?)
}
fn table_exists(db: &Connection, name: &str) -> rusqlite::Result<bool> {
    db.query_row(
        "SELECT EXISTS(SELECT 1 FROM sqlite_master WHERE type='table' AND name=?1)",
        [name],
        |row| row.get(0),
    )
}
fn quote(name: &str) -> String {
    format!("\"{}\"", name.replace('"', "\"\""))
}
fn normalized(value: &str, root: &Path) -> TransportResult<String> {
    let path = Path::new(value);
    if !path.is_absolute() {
        if path
            .components()
            .any(|c| !matches!(c, Component::Normal(_)))
        {
            return Err(invalid("non-canonical ledger path"));
        }
        return Ok(value.into());
    }
    let relative = path
        .strip_prefix(root)
        .map_err(|_| invalid("ledger path escapes its original root"))?;
    if relative
        .components()
        .any(|c| !matches!(c, Component::Normal(_)))
    {
        return Err(invalid("non-canonical ledger path"));
    }
    Ok(format!(
        "@root/{}",
        relative
            .to_str()
            .ok_or_else(|| invalid("non-Unicode ledger path"))?
    ))
}
fn path_column(table: &str, column: &str) -> bool {
    matches!(
        (table, column),
        ("files", "path") | ("operations", "target_path") | ("topic_changes", "topic_id")
    )
}
pub(super) fn inspect(path: &Path, root: &Path, meta: bool) -> TransportResult<Summary> {
    let db = open(path)?;
    let version: u32 = db.query_row("PRAGMA user_version", [], |row| row.get(0))?;
    if version != crate::schema::UNIFIED_STATE_SCHEMA_VERSION {
        return Err(invalid("unsupported canonical state version"));
    }
    let check: String = db.query_row("PRAGMA integrity_check", [], |row| row.get(0))?;
    if check != "ok" || db.prepare("PRAGMA foreign_key_check")?.exists([])? {
        return Err(invalid("canonical state is inconsistent"));
    }
    let mut tables =
        db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")?;
    let tables = tables
        .query_map([], |row| row.get::<_, String>(0))?
        .collect::<Result<Vec<_>, _>>()?;
    let allowed = if meta {
        vec![
            "metadata",
            "capture_jobs",
            "capture_outcomes",
            "nofy_service_undo_v1",
        ]
    } else {
        vec![
            "metadata",
            "files",
            "observation_states",
            "operations",
            "operation_claims",
            "topic_changes",
            "tombstones",
            "quarantine",
            "sqlite_sequence",
        ]
    };
    if tables.iter().any(|name| !allowed.contains(&name.as_str())) {
        return Err(invalid("unsupported canonical state table"));
    }
    if meta {
        if db.query_row(
            "SELECT EXISTS(SELECT 1 FROM capture_jobs WHERE state NOT IN ('succeeded','failed'))",
            [],
            |row| row.get::<_, bool>(0),
        )? {
            return Err(invalid("pending capture requires original completion"));
        }
        if table_exists(&db,"nofy_service_undo_v1")? && db.query_row("SELECT EXISTS(SELECT 1 FROM nofy_service_undo_v1 WHERE phase IN ('prepared','executing'))",[],|row|row.get::<_,bool>(0))? {
            return Err(invalid("pending undo requires original completion"));
        }
    } else if db.query_row(
        "SELECT EXISTS(SELECT 1 FROM operations WHERE phase NOT IN ('completed','failed'))",
        [],
        |row| row.get::<_, bool>(0),
    )? {
        return Err(invalid(
            "pending canonical operation requires original completion",
        ));
    }
    let mut hash = blake3::Hasher::new();
    let mut schema = db.prepare(
        "SELECT type,name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type,name",
    )?;
    let mut schema_rows = schema.query([])?;
    while let Some(row) = schema_rows.next()? {
        for index in 0..3 {
            let value: Option<String> = row.get(index)?;
            feed(&mut hash, value.as_deref().unwrap_or("").as_bytes());
        }
    }
    for table in tables {
        feed(&mut hash, table.as_bytes());
        let mut statement = db.prepare(&format!(
            "SELECT * FROM {} ORDER BY {}",
            quote(&table),
            (1..=db
                .prepare(&format!("SELECT * FROM {}", quote(&table)))?
                .column_count())
                .map(|n| n.to_string())
                .collect::<Vec<_>>()
                .join(",")
        ))?;
        let columns = statement
            .column_names()
            .into_iter()
            .map(str::to_owned)
            .collect::<Vec<_>>();
        let mut rows = statement.query([])?;
        while let Some(row) = rows.next()? {
            for (index, column) in columns.iter().enumerate() {
                let value = row.get_ref(index)?;
                match value {
                    ValueRef::Null => feed(&mut hash, b"null"),
                    ValueRef::Integer(n) => {
                        feed(&mut hash, b"integer");
                        feed(&mut hash, &n.to_le_bytes());
                    }
                    ValueRef::Real(n) => {
                        feed(&mut hash, b"real");
                        feed(&mut hash, &n.to_bits().to_le_bytes());
                    }
                    ValueRef::Text(bytes) => {
                        feed(&mut hash, b"text");
                        if path_column(&table, column) {
                            let text = std::str::from_utf8(bytes)
                                .map_err(|_| invalid("non-Unicode ledger path"))?;
                            feed(&mut hash, normalized(text, root)?.as_bytes());
                        } else {
                            feed(&mut hash, bytes);
                        }
                    }
                    ValueRef::Blob(bytes) => {
                        feed(&mut hash, b"blob");
                        feed(&mut hash, bytes);
                    }
                }
            }
        }
    }
    let count = |name: &str| -> TransportResult<u64> {
        Ok(if table_exists(&db, name)? {
            db.query_row(
                &format!("SELECT count(*) FROM {}", quote(name)),
                [],
                |row| row.get(0),
            )?
        } else {
            0
        })
    };
    Ok(Summary {
        digest: hash.finalize().to_hex().to_string(),
        tombstones: count("tombstones")?,
        undo_tokens: count("nofy_service_undo_v1")?,
        capture_jobs: count("capture_jobs")?,
    })
}
pub(super) fn copy(
    source: &Path,
    target: &Path,
    source_root: &Path,
    target_root: &Path,
) -> TransportResult<()> {
    let output = target.to_path_buf();
    let source = open(source)?;
    let mut target = Connection::open(target)?;
    {
        let backup = rusqlite::backup::Backup::new(&source, &mut target)?;
        backup.run_to_completion(256, Duration::from_millis(2), None)?;
    }
    target.pragma_update(None, "journal_mode", "DELETE")?;
    target.pragma_update(None, "foreign_keys", true)?;
    let tx = target.transaction()?;
    for (table, column) in [
        ("files", "path"),
        ("operations", "target_path"),
        ("topic_changes", "topic_id"),
    ] {
        if !table_exists(&tx, table)? {
            continue;
        }
        let mut statement = tx.prepare(&format!(
            "SELECT rowid,{} FROM {} WHERE {} IS NOT NULL",
            quote(column),
            quote(table),
            quote(column)
        ))?;
        let values = statement
            .query_map([], |row| {
                Ok((row.get::<_, i64>(0)?, row.get::<_, String>(1)?))
            })?
            .collect::<Result<Vec<_>, _>>()?;
        drop(statement);
        for (rowid, value) in values {
            // Relative history paths are literal data, including names that
            // happen to start with our normalized absolute-path marker.
            if !Path::new(&value).is_absolute() {
                continue;
            }
            let normalized = normalized(&value, source_root)?;
            if let Some(relative) = normalized.strip_prefix("@root/") {
                let mapped = target_root
                    .join(relative)
                    .to_str()
                    .ok_or_else(|| invalid("non-Unicode target root"))?
                    .to_owned();
                tx.execute(
                    &format!(
                        "UPDATE {} SET {}=?1 WHERE rowid=?2",
                        quote(table),
                        quote(column)
                    ),
                    rusqlite::params![mapped, rowid],
                )?;
            }
        }
    }
    tx.commit()?;
    // A new snapshot must not transport deleted plaintext in free pages.
    target.execute_batch("PRAGMA secure_delete=ON; VACUUM;")?;
    drop(target);
    nofy_durable_fs::sync_file(&output)?;
    Ok(())
}
