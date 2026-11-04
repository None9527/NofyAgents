use std::sync::{Arc, Barrier};

use nofy_memory::layout::UnifiedMemoryLayout;
use nofy_memory::service::{NofyMemoryService, NofyMemoryServiceConfig};
use nofy_memory_types::{
    ForgetRequest, MemoryArea, MemoryService, MemoryServiceError, RememberRequest,
    ReviseTopicRequest,
};

fn service() -> (tempfile::TempDir, Arc<NofyMemoryService>) {
    let temp = tempfile::tempdir().unwrap();
    let memory = NofyMemoryService::new(NofyMemoryServiceConfig {
        root: temp.path().join("memory"),
        workspace: temp.path().join("workspace"),
        ..NofyMemoryServiceConfig::default_for_tests()
    })
    .unwrap();
    (temp, Arc::new(memory))
}

fn remember(statement: &str) -> RememberRequest {
    RememberRequest {
        area: MemoryArea::Personal,
        statement: statement.into(),
        title: None,
        confirm_sensitive: false,
    }
}

#[tokio::test]
async fn conflicts_do_not_consume_created_or_revised_receipts() {
    let (_temp, memory) = service();
    let first = memory
        .remember(remember("Use blue headings."))
        .await
        .unwrap();
    let second = memory
        .revise(ReviseTopicRequest {
            target: first.target.clone(),
            replacement: "Use green headings.".into(),
        })
        .await
        .unwrap();
    let third = memory
        .revise(ReviseTopicRequest {
            target: second.target.clone(),
            replacement: "Use orange headings.".into(),
        })
        .await
        .unwrap();
    assert!(memory.undo(first.undo_token.clone()).await.is_err());
    assert!(memory.undo(second.undo_token.clone()).await.is_err());
    let mut invalid = third.undo_token.clone();
    invalid.generation += 1;
    assert!(matches!(
        memory.undo(invalid).await,
        Err(MemoryServiceError::Conflict)
    ));
    memory.undo(third.undo_token).await.unwrap();
    memory.undo(second.undo_token).await.unwrap();
    assert_eq!(
        memory.get(first.target.clone()).await.unwrap().body.trim(),
        "Use blue headings."
    );
    memory.undo(first.undo_token.clone()).await.unwrap();
    assert!(matches!(
        memory.get(first.target).await,
        Err(MemoryServiceError::NotFound)
    ));
    assert!(matches!(
        memory.undo(first.undo_token).await,
        Err(MemoryServiceError::NotFound)
    ));
}

async fn retry_after_index_failure(revise: bool) {
    let (temp, memory) = service();
    let first = memory
        .remember(remember("Use blue headings."))
        .await
        .unwrap();
    let original_target = first.target.clone();
    let (token, target, generation) = if revise {
        let revised = memory
            .revise(ReviseTopicRequest {
                target: first.target.clone(),
                replacement: "Use green headings.".into(),
            })
            .await
            .unwrap();
        (
            revised.undo_token,
            revised.target,
            revised.snapshot_generation,
        )
    } else {
        (first.undo_token, first.target, first.snapshot_generation)
    };
    let layout = UnifiedMemoryLayout::new(temp.path().join("memory"));
    let index = layout.personal_scope().root().join("index.sqlite");
    let backup = index.with_extension("sqlite.saved");
    std::fs::rename(&index, &backup).unwrap();
    std::fs::create_dir(&index).unwrap();
    assert!(memory.undo(token.clone()).await.is_err());
    if revise {
        assert_eq!(
            memory.get(original_target).await.unwrap().body.trim(),
            "Use blue headings."
        );
    } else {
        assert!(matches!(
            memory.get(target.clone()).await,
            Err(MemoryServiceError::NotFound)
        ));
    }
    let changes = || {
        rusqlite::Connection::open(layout.personal_scope().state_database())
            .unwrap()
            .query_row("SELECT count(*) FROM topic_changes", [], |row| {
                row.get::<_, u64>(0)
            })
            .unwrap()
    };
    let applied_changes = changes();
    assert!(memory.undo(token.clone()).await.is_err());
    assert_eq!(changes(), applied_changes);
    std::fs::remove_dir(&index).unwrap();
    std::fs::rename(&backup, &index).unwrap();
    let result = memory.undo(token.clone()).await.unwrap();
    assert!(result.restored);
    assert_eq!(result.snapshot_generation, generation + 1);
    assert_eq!(
        changes(),
        applied_changes,
        "retry must not repeat the write"
    );
    assert!(matches!(
        memory.undo(token).await,
        Err(MemoryServiceError::NotFound)
    ));
}

#[tokio::test]
async fn created_undo_retries_index_completion_without_repeating_delete() {
    retry_after_index_failure(false).await;
}

#[tokio::test]
async fn revised_undo_retries_index_completion_without_repeating_update() {
    retry_after_index_failure(true).await;
}

#[tokio::test]
async fn completing_an_applied_undo_does_not_overwrite_a_later_revision() {
    let (temp, memory) = service();
    let first = memory
        .remember(remember("Use blue headings."))
        .await
        .unwrap();
    let revised = memory
        .revise(ReviseTopicRequest {
            target: first.target.clone(),
            replacement: "Use green headings.".into(),
        })
        .await
        .unwrap();
    let index = temp.path().join("memory/personal/index.sqlite");
    let backup = index.with_extension("sqlite.saved");
    std::fs::rename(&index, &backup).unwrap();
    std::fs::create_dir(&index).unwrap();
    assert!(memory.undo(revised.undo_token.clone()).await.is_err());
    std::fs::remove_dir(&index).unwrap();
    std::fs::rename(&backup, &index).unwrap();
    let later = memory
        .revise(ReviseTopicRequest {
            target: first.target,
            replacement: "Use orange headings.".into(),
        })
        .await
        .unwrap();
    let completed = memory.undo(revised.undo_token).await.unwrap();
    assert_eq!(completed.snapshot_generation, later.snapshot_generation + 1);
    assert_eq!(
        memory.get(later.target).await.unwrap().body.trim(),
        "Use orange headings."
    );
}

#[tokio::test]
async fn confirmed_forget_revokes_all_matching_receipts_but_not_other_topics() {
    let (_temp, memory) = service();
    let first = memory
        .remember(remember("Use blue headings."))
        .await
        .unwrap();
    let revised = memory
        .revise(ReviseTopicRequest {
            target: first.target.clone(),
            replacement: "Use green headings.".into(),
        })
        .await
        .unwrap();
    let other = memory
        .remember(remember("Use short paragraphs."))
        .await
        .unwrap();
    assert!(matches!(
        memory
            .forget(ForgetRequest {
                target: revised.target,
                confirmed: false,
            })
            .await,
        Err(MemoryServiceError::ConfirmationRequired(_))
    ));
    assert!(matches!(
        memory
            .forget(ForgetRequest {
                target: first.target.clone(),
                confirmed: true,
            })
            .await,
        Err(MemoryServiceError::Conflict)
    ));
    memory.undo(revised.undo_token).await.unwrap();
    let revised = memory
        .revise(ReviseTopicRequest {
            target: first.target.clone(),
            replacement: "Use orange headings.".into(),
        })
        .await
        .unwrap();
    let view = memory.with_query_options(Default::default(), Some(Default::default()));
    view.forget(ForgetRequest {
        target: revised.target,
        confirmed: true,
    })
    .await
    .unwrap();
    for token in [first.undo_token, revised.undo_token] {
        assert!(matches!(
            memory.undo(token).await,
            Err(MemoryServiceError::NotFound)
        ));
    }
    memory.undo(other.undo_token).await.unwrap();
}

async fn failed_backup_forget(directory: bool) {
    let (temp, memory) = service();
    let first = memory
        .remember(remember("Use blue headings."))
        .await
        .unwrap();
    let revised = memory
        .revise(ReviseTopicRequest {
            target: first.target.clone(),
            replacement: "Use green headings.".into(),
        })
        .await
        .unwrap();
    let receipt = temp.path().join("memory/migration-backup.json");
    if directory {
        std::fs::create_dir(&receipt).unwrap();
    } else {
        std::fs::write(&receipt, b"{").unwrap();
    }
    assert!(
        memory
            .forget(ForgetRequest {
                target: revised.target.clone(),
                confirmed: true,
            })
            .await
            .is_err()
    );
    assert!(memory.get(revised.target).await.is_ok());
    for token in [first.undo_token, revised.undo_token] {
        assert!(matches!(
            memory.undo(token).await,
            Err(MemoryServiceError::NotFound)
        ));
    }
}

#[tokio::test]
async fn forget_intent_revokes_receipts_even_when_backup_cleanup_fails() {
    failed_backup_forget(false).await;
    failed_backup_forget(true).await;
}

#[test]
fn a_directory_at_the_backup_receipt_path_is_not_absence() {
    let temp = tempfile::tempdir().unwrap();
    assert!(
        nofy_memory::retention::load_migration_backup_receipt(temp.path())
            .unwrap()
            .is_none()
    );
    std::fs::create_dir(temp.path().join("migration-backup.json")).unwrap();
    assert!(nofy_memory::retention::load_migration_backup_receipt(temp.path()).is_err());
}

#[cfg(unix)]
#[test]
fn valid_backup_receipt_links_remain_readable_but_dangling_links_are_errors() {
    use nofy_memory::migration_backup::BackupReceipt;
    use nofy_memory::retention::{load_migration_backup_receipt, persist_migration_backup_receipt};
    let temp = tempfile::tempdir().unwrap();
    let root = temp.path().join("memory");
    let receipt = BackupReceipt {
        path: temp.path().join("memory.legacy.20260921T000000Z.tar.age"),
        key_id: "unused-local-metadata".into(),
        delete_after: chrono::Utc::now(),
    };
    persist_migration_backup_receipt(&root, &receipt).unwrap();
    let record = root.join("migration-backup.json");
    let linked = root.join("backup-receipt.json");
    std::fs::rename(&record, &linked).unwrap();
    std::os::unix::fs::symlink(&linked, &record).unwrap();
    let loaded = load_migration_backup_receipt(&root).unwrap().unwrap();
    assert_eq!(loaded.path, receipt.path);
    assert_eq!(loaded.key_id, receipt.key_id);
    std::fs::remove_file(&linked).unwrap();
    assert!(load_migration_backup_receipt(&root).is_err());
}

#[tokio::test]
async fn simultaneous_undo_consumes_the_receipt_only_once() {
    let (_temp, memory) = service();
    let first = memory
        .remember(remember("Use blue headings."))
        .await
        .unwrap();
    let start = Arc::new(Barrier::new(3));
    let mut tasks = Vec::new();
    for _ in 0..2 {
        let memory = memory.clone();
        let token = first.undo_token.clone();
        let start = start.clone();
        tasks.push(std::thread::spawn(move || {
            start.wait();
            tokio::runtime::Builder::new_current_thread()
                .build()
                .unwrap()
                .block_on(memory.undo(token))
        }));
    }
    start.wait();
    let results: Vec<_> = tasks.into_iter().map(|task| task.join().unwrap()).collect();
    assert_eq!(results.iter().filter(|result| result.is_ok()).count(), 1);
    assert_eq!(
        results
            .iter()
            .filter(|result| matches!(result, Err(MemoryServiceError::NotFound)))
            .count(),
        1
    );
    assert_eq!(
        results
            .into_iter()
            .find_map(Result::ok)
            .unwrap()
            .snapshot_generation,
        first.snapshot_generation + 1
    );
}
