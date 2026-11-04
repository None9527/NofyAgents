use nofy_memory::{
    model::ProjectId,
    service::{DurableUndoOptions, NofyMemoryService, NofyMemoryServiceConfig},
};
use nofy_memory_types::*;
use std::sync::{Arc, Barrier};

fn config(root: &std::path::Path) -> NofyMemoryServiceConfig {
    NofyMemoryServiceConfig {
        root: root.join("memory"),
        workspace: root.join("workspace"),
        automatic_learning_enabled: false,
        ..NofyMemoryServiceConfig::default_for_tests()
    }
}
fn open(config: &NofyMemoryServiceConfig) -> NofyMemoryService {
    NofyMemoryService::new(config.clone())
        .unwrap()
        .with_durable_undo(DurableUndoOptions::default())
        .unwrap()
}
fn note(text: &str) -> RememberRequest {
    RememberRequest {
        area: MemoryArea::Personal,
        statement: text.into(),
        title: None,
        confirm_sensitive: false,
    }
}
async fn search(service: &NofyMemoryService) -> Vec<String> {
    service
        .search(SearchRequest {
            query: "release headings".into(),
            max_results: 100,
            min_score: 0.0,
        })
        .await
        .unwrap()
        .hits
        .into_iter()
        .map(|hit| hit.summary)
        .collect()
}

#[tokio::test]
async fn reopen_preserves_tokens_conflicts_and_exact_success_replay_without_relearning() {
    let temp = tempfile::tempdir().unwrap();
    let config = config(temp.path());
    let service = open(&config);
    let first = service
        .remember(note("Release headings use blue."))
        .await
        .unwrap();
    let revised = service
        .revise(ReviseTopicRequest {
            target: first.target.clone(),
            replacement: "Release headings use green.".into(),
        })
        .await
        .unwrap();
    drop(service);
    let service = open(&config);
    assert!(matches!(
        service.undo(first.undo_token.clone()).await,
        Err(MemoryServiceError::Conflict)
    ));
    let receipt = service.undo(revised.undo_token.clone()).await.unwrap();
    assert!(
        search(&service)
            .await
            .iter()
            .all(|text| !text.contains("green"))
    );
    drop(service);
    let service = open(&config);
    assert_eq!(service.undo(revised.undo_token).await.unwrap(), receipt);
    let deleted = service.undo(first.undo_token.clone()).await.unwrap();
    assert!(search(&service).await.is_empty());
    assert_eq!(
        service
            .consolidate(ConsolidateRequest {
                area: MemoryArea::Personal,
                mode: ConsolidationMode::Active
            })
            .await
            .unwrap()
            .processed,
        0
    );
    assert_eq!(service.undo(first.undo_token).await.unwrap(), deleted);
    assert!(
        service
            .list(ListMemoryRequest { area: None })
            .await
            .unwrap()
            .items
            .is_empty()
    );
}

#[tokio::test]
async fn reservation_limits_fail_before_new_observations_and_do_not_evict_receipts() {
    let temp = tempfile::tempdir().unwrap();
    let config = config(temp.path());
    let options = DurableUndoOptions {
        max_pending: 1,
        ..Default::default()
    };
    let service = NofyMemoryService::new(config.clone())
        .unwrap()
        .with_durable_undo(options)
        .unwrap();
    let first = service
        .remember(note("Release headings use blue."))
        .await
        .unwrap();
    assert!(
        service
            .remember(note("Release headings use green."))
            .await
            .is_err()
    );
    assert_eq!(
        std::fs::read_dir(config.root.join("personal/observations"))
            .unwrap()
            .count(),
        1
    );
    assert_eq!(
        service
            .list(ListMemoryRequest { area: None })
            .await
            .unwrap()
            .items
            .len(),
        1
    );
    let receipt = service.undo(first.undo_token.clone()).await.unwrap();
    service
        .remember(note("Release headings use orange."))
        .await
        .unwrap();
    assert_eq!(service.undo(first.undo_token).await.unwrap(), receipt);
}

#[tokio::test]
async fn personal_forget_revokes_pending_preimages_across_project_owners() {
    let temp = tempfile::tempdir().unwrap();
    let config = config(temp.path());
    let source = open(&config);
    let first = source
        .remember(note("Release headings use blue."))
        .await
        .unwrap();
    let mut peer_config = config.clone();
    peer_config.project_id = ProjectId::new();
    let peer = open(&peer_config);
    assert!(matches!(
        peer.undo(first.undo_token.clone()).await,
        Err(MemoryServiceError::NotFound)
    ));
    let revised = peer
        .revise(ReviseTopicRequest {
            target: first.target,
            replacement: "Release headings use green.".into(),
        })
        .await
        .unwrap();
    peer.forget(ForgetRequest {
        target: revised.target,
        confirmed: true,
    })
    .await
    .unwrap();
    assert!(matches!(
        source.undo(first.undo_token).await,
        Err(MemoryServiceError::NotFound)
    ));
    assert!(matches!(
        peer.undo(revised.undo_token).await,
        Err(MemoryServiceError::NotFound)
    ));
    let db = rusqlite::Connection::open(config.root.join("meta.sqlite")).unwrap();
    let payloads: u64 = db
        .query_row(
            "SELECT count(*) FROM nofy_service_undo_v1 WHERE payload IS NOT NULL",
            [],
            |row| row.get(0),
        )
        .unwrap();
    assert_eq!(payloads, 0);
}

#[tokio::test]
async fn index_failure_reopen_and_later_edit_do_not_repeat_effects_or_reset_evidence() {
    let temp = tempfile::tempdir().unwrap();
    let config = config(temp.path());
    let service = open(&config);
    let first = service
        .remember(note("Release headings use blue."))
        .await
        .unwrap();
    let revised = service
        .revise(ReviseTopicRequest {
            target: first.target.clone(),
            replacement: "Release headings use green.".into(),
        })
        .await
        .unwrap();
    let index = config.root.join("personal/index.sqlite");
    let backup = index.with_extension("saved");
    std::fs::rename(&index, &backup).unwrap();
    std::fs::create_dir(&index).unwrap();
    assert!(service.undo(revised.undo_token.clone()).await.is_err());
    std::fs::remove_dir(&index).unwrap();
    std::fs::rename(&backup, &index).unwrap();
    drop(service);
    let service = open(&config);
    let latest = service
        .revise(ReviseTopicRequest {
            target: first.target,
            replacement: "Release headings use orange.".into(),
        })
        .await
        .unwrap();
    let receipt = service.undo(revised.undo_token.clone()).await.unwrap();
    assert_eq!(
        service.get(latest.target).await.unwrap().body.trim(),
        "Release headings use orange."
    );
    let summaries = search(&service).await;
    assert!(
        summaries
            .iter()
            .all(|text| !text.contains("green") && !text.contains("blue")),
        "{summaries:?}"
    );
    assert_eq!(service.undo(revised.undo_token).await.unwrap(), receipt);
}

#[tokio::test]
async fn concurrent_clients_replay_one_effect_and_one_generation() {
    let temp = tempfile::tempdir().unwrap();
    let config = config(temp.path());
    let service = open(&config);
    let first = service
        .remember(note("Release headings use blue."))
        .await
        .unwrap();
    let start = Arc::new(Barrier::new(3));
    let mut workers = Vec::new();
    for _ in 0..2 {
        let service = open(&config);
        let token = first.undo_token.clone();
        let start = start.clone();
        workers.push(std::thread::spawn(move || {
            start.wait();
            tokio::runtime::Builder::new_current_thread()
                .build()
                .unwrap()
                .block_on(service.undo(token))
                .unwrap()
        }));
    }
    start.wait();
    let mut receipts = workers.into_iter().map(|worker| worker.join().unwrap());
    let receipt = receipts.next().unwrap();
    assert_eq!(receipts.next().unwrap(), receipt);
    assert_eq!(receipt.snapshot_generation, first.snapshot_generation + 1);
    let db = rusqlite::Connection::open(config.root.join("personal/state.sqlite")).unwrap();
    assert_eq!(
        db.query_row("SELECT count(*) FROM topic_changes", [], |row| row
            .get::<_, u64>(0))
            .unwrap(),
        2
    );
}

#[tokio::test]
async fn original_session_tokens_are_not_silently_migrated_and_unknown_protocol_is_rejected() {
    let temp = tempfile::tempdir().unwrap();
    let config = config(temp.path());
    let service = NofyMemoryService::new(config.clone()).unwrap();
    let first = service
        .remember(note("Release headings use blue."))
        .await
        .unwrap();
    assert!(service.with_durable_undo(Default::default()).is_err());
    drop(service);
    let legacy = NofyMemoryService::new(config.clone()).unwrap();
    assert!(matches!(
        legacy.undo(first.undo_token).await,
        Err(MemoryServiceError::NotFound)
    ));
    drop(legacy);
    let service = open(&config);
    drop(service);
    let db = rusqlite::Connection::open(config.root.join("meta.sqlite")).unwrap();
    db.execute(
        "UPDATE metadata SET value='unsupported' WHERE key='memory_undo_protocol'",
        [],
    )
    .unwrap();
    assert!(
        NofyMemoryService::new(config)
            .unwrap()
            .with_durable_undo(Default::default())
            .is_err()
    );
}
