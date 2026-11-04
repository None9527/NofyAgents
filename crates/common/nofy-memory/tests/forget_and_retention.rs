use std::sync::{Arc, Mutex};

use chrono::{Duration, Utc};
use nofy_memory::layout::UnifiedMemoryLayout;
use nofy_memory::migration_backup::{BackupReceipt, MigrationKeyStore};
use nofy_memory::model::ProjectId;
use nofy_memory::retention::{gc_migration_backup, gc_scope, persist_migration_backup_receipt};
use nofy_memory::service::{NofyMemoryService, NofyMemoryServiceConfig};
use nofy_memory::state::UnifiedState;
use nofy_memory_types::{
    ForgetRequest, MemoryArea, MemoryService, RememberRequest, SnapshotRequest,
};
use rusqlite::{Connection, params};

#[derive(Default)]
struct FakeKeyStore {
    deleted: Mutex<Vec<String>>,
    fail_delete: bool,
}

impl MigrationKeyStore for FakeKeyStore {
    fn store(&self, _key_id: &str, _secret: &str) -> Result<(), String> {
        Ok(())
    }

    fn delete(&self, key_id: &str) -> Result<(), String> {
        if self.fail_delete {
            return Err("injected credential-store failure".to_owned());
        }
        self.deleted.lock().unwrap().push(key_id.to_owned());
        Ok(())
    }
}

fn service(
    root: &std::path::Path,
    project_id: ProjectId,
    key_store: Arc<dyn MigrationKeyStore>,
) -> NofyMemoryService {
    NofyMemoryService::new(NofyMemoryServiceConfig {
        root: root.to_path_buf(),
        workspace: root.join("workspace"),
        project_id,
        migration_key_store: key_store,
        ..NofyMemoryServiceConfig::default_for_tests()
    })
    .unwrap()
}

fn remember(statement: &str) -> RememberRequest {
    RememberRequest {
        area: MemoryArea::Personal,
        statement: statement.to_owned(),
        title: None,
        confirm_sensitive: false,
    }
}

fn install_backup(root: &std::path::Path, delete_after: chrono::DateTime<Utc>) -> BackupReceipt {
    let path = root
        .parent()
        .unwrap()
        .join("memory.legacy.20260921T000000Z.tar.age");
    std::fs::write(&path, b"encrypted legacy bytes").unwrap();
    let receipt = BackupReceipt {
        path,
        key_id: "backup-key-1".to_owned(),
        delete_after,
    };
    persist_migration_backup_receipt(root, &receipt).unwrap();
    receipt
}

#[tokio::test]
async fn forget_destroys_recoverable_backup_and_invalidates_all_service_generations() {
    let temp = tempfile::tempdir().unwrap();
    let root = temp.path().join("memory");
    let project_id = ProjectId::new();
    let key_store = Arc::new(FakeKeyStore::default());
    let memory = service(&root, project_id, key_store.clone());
    let peer = service(&root, project_id, key_store.clone());
    let remembered = memory
        .remember(remember("My employer is Example Incorporated."))
        .await
        .unwrap();
    let generation_before = peer
        .snapshot(SnapshotRequest {
            query: None,
            max_items: 10,
        })
        .await
        .unwrap()
        .generation;
    let backup = install_backup(&root, Utc::now() + Duration::days(7));

    let receipt = memory
        .forget(ForgetRequest {
            target: remembered.target.clone(),
            confirmed: true,
        })
        .await
        .unwrap();

    assert!(receipt.forgotten);
    assert!(!backup.path.exists(), "recoverable ciphertext must be gone");
    assert_eq!(
        key_store.deleted.lock().unwrap().as_slice(),
        ["backup-key-1"]
    );
    assert!(!root.join("migration-backup.json").exists());
    assert!(memory.get(remembered.target.clone()).await.is_err());
    let generation_after = peer
        .snapshot(SnapshotRequest {
            query: None,
            max_items: 10,
        })
        .await
        .unwrap()
        .generation;
    assert!(generation_after > generation_before);

    let state = Connection::open(root.join("personal/state.sqlite")).unwrap();
    let tombstone: (String, String, String, String) = state
        .query_row(
            "SELECT target_id, previous_hash, reason, target_kind FROM tombstones",
            [],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?)),
        )
        .unwrap();
    assert_eq!(tombstone.0, remembered.target.id);
    assert_eq!(tombstone.1.len(), 64);
    assert_eq!(tombstone.2, "user_request");
    assert_eq!(tombstone.3, "memory");
    let serialized = format!("{tombstone:?}");
    assert!(!serialized.contains("Example Incorporated"));
    assert!(!serialized.contains('/'));
}

#[tokio::test]
async fn credential_store_failure_commits_only_tombstone_and_reports_incomplete_forget() {
    let temp = tempfile::tempdir().unwrap();
    let root = temp.path().join("memory");
    let project_id = ProjectId::new();
    let key_store = Arc::new(FakeKeyStore {
        fail_delete: true,
        ..FakeKeyStore::default()
    });
    let memory = service(&root, project_id, key_store);
    let remembered = memory
        .remember(remember("My private codename is Bluebird."))
        .await
        .unwrap();
    let backup = install_backup(&root, Utc::now() + Duration::days(7));

    let error = memory
        .forget(ForgetRequest {
            target: remembered.target.clone(),
            confirmed: true,
        })
        .await
        .unwrap_err();

    assert!(error.to_string().contains("尚未完全忘记"), "{error}");
    assert!(backup.path.exists());
    assert!(memory.get(remembered.target).await.is_ok());
    let state = Connection::open(root.join("personal/state.sqlite")).unwrap();
    let count: i64 = state
        .query_row("SELECT COUNT(*) FROM tombstones", [], |row| row.get(0))
        .unwrap();
    assert_eq!(count, 1, "tombstone must commit before backup destruction");
}

#[test]
fn retention_gc_deletes_only_expired_unreferenced_records_and_due_backup() {
    let temp = tempfile::tempdir().unwrap();
    let root = temp.path().join("memory");
    let layout = UnifiedMemoryLayout::new(&root);
    let scope = layout.personal_scope();
    let state = UnifiedState::open(layout.meta_database(), scope.state_database()).unwrap();
    let now = Utc::now().timestamp();
    drop(state);

    std::fs::create_dir_all(scope.archive_directory()).unwrap();
    let expired = scope.archive_directory().join("expired.md");
    let held = scope.archive_directory().join("held.md");
    let fresh = scope.archive_directory().join("fresh.md");
    for path in [&expired, &held, &fresh] {
        std::fs::write(path, "archived evidence").unwrap();
    }
    let old = filetime::FileTime::from_unix_time(now - 31 * 24 * 60 * 60, 0);
    filetime::set_file_mtime(&expired, old).unwrap();
    filetime::set_file_mtime(&held, old).unwrap();

    let database = scope.state_database();
    let connection = Connection::open(&database).unwrap();
    connection
        .execute(
            "INSERT INTO operations(id, kind, phase, target_path, created_at, updated_at)
             VALUES ('pending', 'forget', 'planned', ?1, ?2, ?2)",
            params![held.to_string_lossy(), now],
        )
        .unwrap();
    for (id, target, deadline) in [
        ("expired", "expired-id", now - 1),
        ("held", held.to_string_lossy().as_ref(), now - 1),
        ("fresh", "fresh-id", now + 60),
    ] {
        connection
            .execute(
                "INSERT INTO tombstones
                 (id, target_kind, target_id, previous_hash, reason, created_at, retention_deadline)
                 VALUES (?1, 'memory', ?2, 'opaque-hash', 'user_request', ?3, ?4)",
                params![id, target, now - 100, deadline],
            )
            .unwrap();
    }
    drop(connection);

    let backup = install_backup(&root, Utc::now() - Duration::seconds(1));
    let key_store = FakeKeyStore::default();
    let backup_deleted = gc_migration_backup(&root, &key_store, Utc::now()).unwrap();
    let report = gc_scope(&layout, &scope, now, 30 * 24 * 60 * 60).unwrap();

    assert!(backup_deleted);
    assert!(!backup.path.exists());
    assert_eq!(report.archives_deleted, 1);
    assert_eq!(report.tombstones_deleted, 1);
    assert!(!expired.exists());
    assert!(held.exists());
    assert!(fresh.exists());
    let connection = Connection::open(database).unwrap();
    let remaining: Vec<String> = connection
        .prepare("SELECT id FROM tombstones ORDER BY id")
        .unwrap()
        .query_map([], |row| row.get(0))
        .unwrap()
        .map(Result::unwrap)
        .collect();
    assert_eq!(remaining, ["fresh", "held"]);
}
