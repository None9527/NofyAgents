use super::*;
use crate::durable::{
    SqliteStore,
    placement::{PlacementPermit, SqlitePlacement},
};
use std::{
    path::PathBuf,
    sync::{Arc, RwLock},
};
struct Location {
    path: RwLock<(PathBuf, bool, bool)>,
}
impl SqlitePlacement for Location {
    fn authority(&self) -> &str {
        "transport-test-owner"
    }
    fn logical_identity(&self) -> &str {
        "transport-test-logical-history"
    }
    fn acquire(&self) -> Result<PlacementPermit, Error> {
        let v = self.path.read().unwrap();
        PlacementPermit::new(v.0.clone(), v.1, v.2, Box::new(()))
    }
}
fn placed(path: &Path) -> (SqliteStore, Arc<Location>) {
    let location = Arc::new(Location {
        path: RwLock::new((path.into(), true, true)),
    });
    let store = SqliteStore::open_placed(path, location.clone(), None).unwrap();
    location.path.write().unwrap().2 = false;
    (store, location)
}
#[tokio::test]
async fn whole_sqlite_copy_preserves_types_sequence_unknown_tables_and_fixed_identity() {
    let dir = tempfile::tempdir().unwrap();
    let origin = dir.path().join("source.sqlite");
    let target = dir.path().join("target.sqlite");
    let (store, location) = placed(&origin);
    store.transaction(|tx|{
        tx.execute_batch("CREATE TABLE extension_data(id INTEGER PRIMARY KEY AUTOINCREMENT,bytes BLOB,text TEXT,n INTEGER,r REAL,missing TEXT); INSERT INTO extension_data VALUES(29,x'00FF01','原始历史',9223372036854775807,1.25,NULL); CREATE TABLE sqlitex_extension(value TEXT); INSERT INTO sqlitex_extension VALUES('retained extension'); INSERT INTO agent_runtime_budget_roots VALUES('root','{\"preserve\":true}');").map_err(db_error)?;Ok(())
    }).await.unwrap();
    let expected = inspect_snapshot(&origin).unwrap();
    assert_eq!(
        copy_snapshot(&origin, &target, &expected).unwrap(),
        expected
    );
    store.protect_snapshot(&target).unwrap();
    retire_snapshot(&origin, &expected, location.authority(), "move", 0).unwrap();
    assert!(copy_snapshot(&origin, &dir.path().join("retired-copy.sqlite"), &expected).is_err());
    assert_eq!(inspect_snapshot(&origin).unwrap(), expected);
    let old = Connection::open(&origin).unwrap();
    assert!(
        old.execute(
            "INSERT INTO agent_runtime_leases VALUES('late','owner',1,1)",
            []
        )
        .is_err()
    );
    assert!(old.execute("UPDATE extension_data SET n=0", []).is_err());
    assert!(
        old.execute("UPDATE sqlitex_extension SET value='late write'", [])
            .is_err()
    );
    *location.path.write().unwrap() = (target.clone(), true, false);
    assert_eq!(store.path().unwrap(), target);
    assert_eq!(store.logical_identity(), "transport-test-logical-history");
    store
        .transaction(|tx| {
            tx.execute("INSERT INTO extension_data(text) VALUES('latest')", [])
                .map_err(db_error)?;
            Ok(())
        })
        .await
        .unwrap();
    let db = Connection::open(&target).unwrap();
    let preserved: (Vec<u8>, String, i64, f64, Option<String>) = db
        .query_row(
            "SELECT bytes,text,n,r,missing FROM extension_data WHERE id=29",
            [],
            |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?, r.get(4)?)),
        )
        .unwrap();
    assert_eq!(
        preserved,
        (vec![0, 255, 1], "原始历史".into(), i64::MAX, 1.25, None)
    );
    assert_eq!(
        db.query_row(
            "SELECT id FROM extension_data WHERE text='latest'",
            [],
            |r| r.get::<_, i64>(0)
        )
        .unwrap(),
        30
    );
    assert_eq!(
        old.query_row("SELECT COUNT(*) FROM extension_data", [], |r| r
            .get::<_, i64>(0))
            .unwrap(),
        1
    );
}
#[tokio::test]
async fn preparing_is_read_only_and_retired_writers_cannot_bypass_with_cached_handles() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("runtime.sqlite");
    let unplaced = SqliteStore::open(&path).unwrap();
    let (store, location) = placed(&path);
    assert!(unplaced.transaction(|_| Ok(())).await.is_err());
    location.path.write().unwrap().1 = false;
    store
        .transaction(|tx| {
            let count: i64 = tx
                .query_row("SELECT COUNT(*) FROM agent_runtime_leases", [], |r| {
                    r.get(0)
                })
                .map_err(db_error)?;
            assert_eq!(count, 0);
            Ok(())
        })
        .await
        .unwrap();
    assert!(
        store
            .transaction(|tx| {
                tx.execute("INSERT INTO agent_runtime_leases VALUES('k','o',1,1)", [])
                    .map_err(db_error)?;
                Ok(())
            })
            .await
            .is_err()
    );
    let reopened = SqliteStore::open_placed(&path, location.clone(), None).unwrap();
    assert!(
        reopened
            .transaction(|tx| {
                tx.execute("DELETE FROM agent_runtime_budget_roots", [])
                    .map_err(db_error)?;
                Ok(())
            })
            .await
            .is_err()
    );
    location.path.write().unwrap().1 = true;
    let plan = inspect_snapshot(&path).unwrap();
    retire_snapshot(&path, &plan, location.authority(), "owner-command", 0).unwrap();
    retire_snapshot(&path, &plan, location.authority(), "owner-command", 0).unwrap();
    assert!(release_retirement(&path, location.authority(), "another-command").is_err());
    assert!(
        store
            .acquire("new-owner", "writer", Duration::from_secs(1))
            .await
            .is_err()
    );
    release_retirement(&path, location.authority(), "owner-command").unwrap();
    store
        .acquire("new-owner", "writer", Duration::from_secs(1))
        .await
        .unwrap();
}
#[tokio::test]
async fn stale_inventory_live_owners_and_changed_guards_fail_without_overwriting() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("runtime.sqlite");
    let target = dir.path().join("copy.sqlite");
    let (store, location) = placed(&path);
    let initial = inspect_snapshot(&path).unwrap();
    let lease = store
        .acquire("run", "owner", Duration::from_secs(30))
        .await
        .unwrap();
    assert!(copy_snapshot(&path, &target, &initial).is_err());
    assert!(!target.exists());
    let live = inspect_snapshot(&path).unwrap();
    assert!(
        retire_snapshot(
            &path,
            &live,
            location.authority(),
            "blocked",
            store.now_ms()
        )
        .is_err()
    );
    store.release(&lease).await.unwrap();
    let plan = inspect_snapshot(&path).unwrap();
    copy_snapshot(&path, &target, &plan).unwrap();
    let bytes = std::fs::read(&target).unwrap();
    assert!(copy_snapshot(&path, &target, &plan).is_err());
    assert_eq!(std::fs::read(&target).unwrap(), bytes);
    let db = Connection::open(&path).unwrap();
    let name:String=db.query_row("SELECT name FROM sqlite_master WHERE type='trigger' AND name GLOB 'nofy_runtime_guard_*' LIMIT 1",[],|r|r.get(0)).unwrap();
    db.execute_batch(&format!("DROP TRIGGER {}", quote(&name)))
        .unwrap();
    assert!(inspect_snapshot(&path).is_err());
}
