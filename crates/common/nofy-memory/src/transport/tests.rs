use super::*;
use crate::{
    layout::UnifiedMemoryLayout,
    model::{OperationId, ProjectId},
    service::{DurableUndoOptions, NofyMemoryService, NofyMemoryServiceConfig},
    state::UnifiedState,
};
use nofy_memory_types::*;
fn service(root: &Path, project: ProjectId) -> NofyMemoryService {
    let mut config = NofyMemoryServiceConfig::default_for_tests();
    config.root = root.into();
    config.workspace = root.parent().unwrap().join("workspace");
    config.project_id = project;
    NofyMemoryService::new(config)
        .unwrap()
        .with_durable_undo(DurableUndoOptions::default())
        .unwrap()
}

#[tokio::test]
async fn relative_history_paths_resembling_the_normalization_marker_remain_literal() {
    let dir = tempfile::tempdir().unwrap();
    let root = dir.path().join("source");
    let target = dir.path().join("target");
    let project = ProjectId::new();
    let source = service(&root, project);
    remember(
        &source,
        MemoryArea::Project,
        "Relative historical paths remain literal after relocation.",
    )
    .await;
    let scope = UnifiedMemoryLayout::new(&root).project_scope(project);
    let db = rusqlite::Connection::open(scope.state_database()).unwrap();
    assert!(
        db.execute(
            "UPDATE operations SET target_path='@root/history-entry.md' WHERE phase='completed'",
            []
        )
        .unwrap()
            > 0
    );
    drop(db);
    let inventory = inspect_snapshot(&root).unwrap();
    copy_snapshot(&root, &target, &inventory).unwrap();
    let db = rusqlite::Connection::open(
        UnifiedMemoryLayout::new(&target)
            .project_scope(project)
            .state_database(),
    )
    .unwrap();
    let paths = db
        .prepare("SELECT target_path FROM operations WHERE phase='completed'")
        .unwrap()
        .query_map([], |row| row.get::<_, String>(0))
        .unwrap()
        .collect::<Result<Vec<_>, _>>()
        .unwrap();
    assert!(!paths.is_empty());
    assert!(paths.iter().all(|path| path == "@root/history-entry.md"));
    assert_eq!(inspect_snapshot(&root).unwrap(), inventory);
}
async fn remember(service: &NofyMemoryService, area: MemoryArea, text: &str) -> RememberReceipt {
    service
        .remember(RememberRequest {
            area,
            statement: text.into(),
            title: None,
            confirm_sensitive: false,
        })
        .await
        .unwrap()
}
#[tokio::test]
async fn independent_snapshot_preserves_all_projects_tombstones_capture_history_and_undo() {
    let dir = tempfile::tempdir().unwrap();
    let root = dir.path().join("source");
    let target = dir.path().join("target");
    let project = ProjectId::new();
    let other = ProjectId::new();
    let source = service(&root, project);
    let second = service(&root, other);
    let first = remember(&source, MemoryArea::Project, "The build engine uses Rust.").await;
    let another = remember(
        &second,
        MemoryArea::Project,
        "The second project uses a queue.",
    )
    .await;
    let forgotten = remember(
        &source,
        MemoryArea::Personal,
        "My favorite beverage is tea.",
    )
    .await;
    source
        .forget(ForgetRequest {
            target: forgotten.target.clone(),
            confirmed: true,
        })
        .await
        .unwrap();
    let layout = UnifiedMemoryLayout::new(&root);
    let state = UnifiedState::open(
        layout.meta_database(),
        layout.project_scope(project).state_database(),
    )
    .unwrap();
    state
        .enqueue_capture_job("completed-history", "original-input", 11)
        .unwrap();
    let claim = state
        .claim_capture_job_by_id("completed-history", "worker", 12, 30)
        .unwrap()
        .unwrap();
    state
        .complete_capture_job(&claim, "original-completion", 13)
        .unwrap();
    let before = inspect_snapshot(&root).unwrap();
    assert_eq!(before.stats.projects, 2);
    assert!(before.stats.tombstones > 0);
    assert!(before.stats.undo_tokens >= 3);
    assert_eq!(before.stats.capture_jobs, 1);
    let copied = copy_snapshot(&root, &target, &before).unwrap();
    assert_eq!(copied.content_digest, before.content_digest);
    assert_eq!(inspect_snapshot(&root).unwrap(), before);
    let restored = service(&target, project);
    let restored_other = service(&target, other);
    assert_eq!(
        restored.get(first.target.clone()).await.unwrap().body,
        source.get(first.target.clone()).await.unwrap().body
    );
    assert!(
        restored_other
            .get(another.target)
            .await
            .unwrap()
            .body
            .contains("second project")
    );
    assert!(matches!(
        restored.get(forgotten.target).await,
        Err(MemoryServiceError::NotFound)
    ));
    assert!(restored.undo(forgotten.undo_token).await.is_err());
    restored.undo(first.undo_token.clone()).await.unwrap();
    assert!(matches!(
        restored.get(first.target.clone()).await,
        Err(MemoryServiceError::NotFound)
    ));
    assert!(source.get(first.target).await.is_ok());
    let state = UnifiedState::open(
        UnifiedMemoryLayout::new(&target).meta_database(),
        UnifiedMemoryLayout::new(&target)
            .project_scope(project)
            .state_database(),
    )
    .unwrap();
    assert_eq!(
        state
            .capture_outcome("completed-history")
            .unwrap()
            .as_deref(),
        Some("original-completion")
    );
}
#[tokio::test]
async fn incomplete_capture_and_native_transactions_block_without_creating_output() {
    let dir = tempfile::tempdir().unwrap();
    let root = dir.path().join("source");
    let project = ProjectId::new();
    let source = service(&root, project);
    remember(
        &source,
        MemoryArea::Project,
        "The migration keeps original operation identities.",
    )
    .await;
    let layout = UnifiedMemoryLayout::new(&root);
    let state = UnifiedState::open(
        layout.meta_database(),
        layout.project_scope(project).state_database(),
    )
    .unwrap();
    state.enqueue_capture_job("pending", "original", 1).unwrap();
    assert!(inspect_snapshot(&root).is_err());
    let claim = state
        .claim_capture_job_by_id("pending", "worker", 2, 30)
        .unwrap()
        .unwrap();
    state.complete_capture_job(&claim, "done", 3).unwrap();
    assert!(inspect_snapshot(&root).is_ok());
    state
        .register_forget_operation(OperationId::new(), "unsettled", &"a".repeat(64), 4)
        .unwrap();
    assert!(inspect_snapshot(&root).is_err());
    assert!(!dir.path().join("target").exists());
}
#[tokio::test]
async fn stale_plan_and_existing_output_never_replace_original_or_unowned_files() {
    let dir = tempfile::tempdir().unwrap();
    let root = dir.path().join("source");
    let target = dir.path().join("target");
    let source = service(&root, ProjectId::new());
    remember(
        &source,
        MemoryArea::Project,
        "The source snapshot has a stable fingerprint.",
    )
    .await;
    let old = inspect_snapshot(&root).unwrap();
    remember(
        &source,
        MemoryArea::Project,
        "A later edit invalidates that fingerprint.",
    )
    .await;
    assert!(copy_snapshot(&root, &target, &old).is_err());
    assert!(!target.exists());
    let fresh = inspect_snapshot(&root).unwrap();
    copy_snapshot(&root, &target, &fresh).unwrap();
    std::fs::write(target.join("unowned.txt"), b"retain me").unwrap();
    assert!(copy_snapshot(&root, &target, &fresh).is_err());
    assert_eq!(
        std::fs::read(target.join("unowned.txt")).unwrap(),
        b"retain me"
    );
    assert_eq!(inspect_snapshot(&root).unwrap(), fresh);
}
#[cfg(unix)]
#[tokio::test]
async fn links_and_escaped_ledger_paths_are_rejected_before_copy() {
    let dir = tempfile::tempdir().unwrap();
    let root = dir.path().join("source");
    let project = ProjectId::new();
    let source = service(&root, project);
    remember(
        &source,
        MemoryArea::Project,
        "The storage root is explicit.",
    )
    .await;
    let scope = UnifiedMemoryLayout::new(&root).project_scope(project);
    let link = scope.topics_directory().join("outside.md");
    std::fs::write(dir.path().join("outside"), b"not canonical").unwrap();
    std::os::unix::fs::symlink(dir.path().join("outside"), &link).unwrap();
    assert!(inspect_snapshot(&root).is_err());
    std::fs::remove_file(link).unwrap();
    let db = rusqlite::Connection::open(scope.state_database()).unwrap();
    db.execute(
        "UPDATE files SET path='/outside/forged.md' WHERE kind='topic'",
        [],
    )
    .unwrap();
    assert!(inspect_snapshot(&root).is_err());
}
#[tokio::test]
async fn snapshots_omit_derived_vectors_and_rebuild_under_new_dimensions() {
    let dir = tempfile::tempdir().unwrap();
    let root = dir.path().join("source");
    let target = dir.path().join("target");
    let project = ProjectId::new();
    let source = service(&root, project);
    remember(
        &source,
        MemoryArea::Project,
        "The vector index is a disposable projection.",
    )
    .await;
    source
        .search(SearchRequest {
            query: "vector".into(),
            max_results: 5,
            min_score: 0.0,
        })
        .await
        .unwrap();
    let inventory = inspect_snapshot(&root).unwrap();
    copy_snapshot(&root, &target, &inventory).unwrap();
    let scope = UnifiedMemoryLayout::new(&target).project_scope(project);
    assert!(!scope.root().join("index.sqlite").exists());
    let mut config = NofyMemoryServiceConfig::default_for_tests();
    config.root = target;
    config.workspace = dir.path().join("new-workspace");
    config.project_id = project;
    config.embedding_dimensions = 9;
    let restored = NofyMemoryService::new(config)
        .unwrap()
        .with_durable_undo(Default::default())
        .unwrap();
    assert!(
        !restored
            .search(SearchRequest {
                query: "vector".into(),
                max_results: 5,
                min_score: 0.0
            })
            .await
            .unwrap()
            .hits
            .is_empty()
    );
}
