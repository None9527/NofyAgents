//! A retired physical database rejects writers even through an old connection.
use super::super::{Error, db_error};
use rusqlite::{Connection, OptionalExtension};
use sha2::{Digest, Sha256};
use std::collections::BTreeSet;

const TABLE: &str = "nofy_runtime_placement_v1";
const DDL: &str = "CREATE TABLE nofy_runtime_placement_v1(id INTEGER PRIMARY KEY CHECK(id=1),version INTEGER NOT NULL,authority TEXT NOT NULL,writable INTEGER NOT NULL CHECK(writable IN(0,1)),command TEXT)";
const PREFIX: &str = "nofy_runtime_guard_";
fn quote(s: &str) -> String {
    format!("\"{}\"", s.replace('"', "\"\""))
}
fn tables(db: &Connection) -> Result<Vec<String>, Error> {
    db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT GLOB 'sqlite_*' AND name<>?1 ORDER BY name").map_err(db_error)?
        .query_map([TABLE], |r| r.get(0)).map_err(db_error)?.collect::<Result<_, _>>().map_err(db_error)
}
fn trigger(table: &str, op: &str) -> (String, String) {
    let name = format!(
        "{PREFIX}{:x}_{}",
        Sha256::digest(table.as_bytes()),
        op.to_ascii_lowercase()
    );
    let sql = format!(
        "CREATE TRIGGER {} BEFORE {op} ON {} WHEN (SELECT writable FROM {TABLE} WHERE id=1) IS NOT 1 BEGIN SELECT RAISE(ABORT,'runtime storage retired'); END",
        quote(&name),
        quote(table)
    );
    (name, sql)
}
pub(crate) fn state(db: &Connection) -> Result<Option<(String, bool, Option<String>)>, Error> {
    let sql: Option<String> = db
        .query_row(
            "SELECT sql FROM sqlite_master WHERE name=?1 AND type='table'",
            [TABLE],
            |r| r.get(0),
        )
        .optional()
        .map_err(db_error)?;
    let Some(sql) = sql else {
        return Ok(None);
    };
    if sql != DDL {
        return Err(db_error("invalid runtime placement schema"));
    }
    let rows = db
        .prepare(&format!(
            "SELECT id,version,authority,writable,command FROM {TABLE}"
        ))
        .map_err(db_error)?
        .query_map([], |r| {
            Ok((
                r.get::<_, i64>(0)?,
                r.get::<_, i64>(1)?,
                r.get::<_, String>(2)?,
                r.get::<_, i64>(3)?,
                r.get::<_, Option<String>>(4)?,
            ))
        })
        .map_err(db_error)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(db_error)?;
    if rows.len() != 1
        || rows[0].0 != 1
        || rows[0].1 != 1
        || rows[0].2.is_empty()
        || !matches!(rows[0].3, 0 | 1)
        || (rows[0].3 == 0) != rows[0].4.is_some()
    {
        return Err(db_error("invalid runtime placement ownership"));
    }
    let (_, _, owner, writable, command) = rows.into_iter().next().expect("one owner");
    Ok(Some((owner, writable == 1, command)))
}
/// Verify every excluded metadata object; unknown objects never disappear
/// silently from the data fingerprint.
pub(crate) fn owned_objects(db: &Connection) -> Result<BTreeSet<String>, Error> {
    let mut owned = BTreeSet::new();
    if state(db)?.is_some() {
        owned.insert(TABLE.into());
        for table in tables(db)? {
            for op in ["INSERT", "UPDATE", "DELETE"] {
                let (name, expected) = trigger(&table, op);
                let actual: Option<String> = db
                    .query_row(
                        "SELECT sql FROM sqlite_master WHERE type='trigger' AND name=?1",
                        [&name],
                        |r| r.get(0),
                    )
                    .optional()
                    .map_err(db_error)?;
                if actual.as_deref() != Some(&expected) {
                    return Err(db_error("runtime placement guard missing or changed"));
                }
                owned.insert(name);
            }
        }
    }
    let mut stmt = db
        .prepare("SELECT name FROM sqlite_master WHERE substr(name,1,?1)=?2 OR name=?3")
        .map_err(db_error)?;
    let names = stmt
        .query_map(rusqlite::params![PREFIX.len(), PREFIX, TABLE], |r| {
            r.get::<_, String>(0)
        })
        .map_err(db_error)?;
    for name in names {
        if !owned.contains(&name.map_err(db_error)?) {
            return Err(db_error("unknown runtime placement metadata"));
        }
    }
    Ok(owned)
}
/// Called inside the writer transaction after creating any new runtime table.
pub(crate) fn ensure(db: &Connection, authority: &str) -> Result<(), Error> {
    match state(db)? {
        None => {
            db.execute_batch(DDL).map_err(db_error)?;
            db.execute(
                &format!("INSERT INTO {TABLE} VALUES(1,1,?1,1,NULL)"),
                [authority],
            )
            .map_err(db_error)?;
        }
        Some((owner, true, None)) if owner == authority => {}
        _ => {
            return Err(db_error(
                "runtime database is retired or belongs to another placement",
            ));
        }
    }
    for table in tables(db)? {
        for op in ["INSERT", "UPDATE", "DELETE"] {
            let (name, sql) = trigger(&table, op);
            let actual: Option<String> = db
                .query_row(
                    "SELECT sql FROM sqlite_master WHERE type='trigger' AND name=?1",
                    [&name],
                    |r| r.get(0),
                )
                .optional()
                .map_err(db_error)?;
            match actual {
                None => db.execute_batch(&sql).map_err(db_error)?,
                Some(v) if v == sql => {}
                _ => return Err(db_error("runtime placement guard changed")),
            }
        }
    }
    owned_objects(db)?;
    Ok(())
}
pub(crate) fn retire(db: &Connection, authority: &str, command: &str) -> Result<(), Error> {
    owned_objects(db)?;
    match state(db)? {
        Some((owner, true, None)) if owner == authority => {
            db.execute(
                &format!("UPDATE {TABLE} SET writable=0,command=?1 WHERE id=1"),
                [command],
            )
            .map_err(db_error)?;
        }
        Some((owner, false, Some(id))) if owner == authority && id == command => {}
        _ => return Err(db_error("runtime retirement ownership conflict")),
    }
    Ok(())
}
pub(crate) fn release(db: &Connection, authority: &str, command: &str) -> Result<(), Error> {
    owned_objects(db)?;
    match state(db)? {
        Some((owner, true, None)) if owner == authority => {}
        Some((owner, false, Some(id))) if owner == authority && id == command => {
            db.execute(
                &format!("UPDATE {TABLE} SET writable=1,command=NULL WHERE id=1"),
                [],
            )
            .map_err(db_error)?;
        }
        _ => return Err(db_error("runtime retirement ownership conflict")),
    }
    Ok(())
}
