use nofy_memory::{
    access::{AccessError, AccessKillPoint, MemoryAccess},
    layout::UnifiedMemoryLayout,
    model::{ContentHash, OperationId},
    scope_write_lock::ScopeWriteGuard,
};
use std::{
    path::Path,
    sync::{Arc, Barrier, mpsc},
    time::Duration,
};

fn hash(text: &str) -> ContentHash {
    ContentHash::parse(blake3::hash(text.as_bytes()).to_hex().to_string()).unwrap()
}

#[test]
fn concurrent_operations_cannot_both_commit_the_same_read_hash() {
    let temp = tempfile::tempdir().unwrap();
    let layout = UnifiedMemoryLayout::new(temp.path());
    let scope = layout.personal_scope();
    let access = MemoryAccess::open(layout.meta_database(), scope.clone()).unwrap();
    access
        .create_topic(OperationId::new(), Path::new("shared.md"), "initial")
        .unwrap();
    let barrier = Arc::new(Barrier::new(3));
    let mut workers = Vec::new();
    for replacement in ["first", "second"] {
        let root = temp.path().to_path_buf();
        let start = barrier.clone();
        workers.push(std::thread::spawn(move || {
            let layout = UnifiedMemoryLayout::new(root);
            let access =
                MemoryAccess::open(layout.meta_database(), layout.personal_scope()).unwrap();
            start.wait();
            access.update_topic(
                OperationId::new(),
                Path::new("shared.md"),
                &hash("initial"),
                replacement,
                None,
            )
        }));
    }
    barrier.wait();
    let results = workers
        .into_iter()
        .map(|worker| worker.join().unwrap())
        .collect::<Vec<_>>();
    assert_eq!(results.iter().filter(|result| result.is_ok()).count(), 1);
    assert_eq!(
        results
            .iter()
            .filter(|result| matches!(result, Err(AccessError::StaleHash)))
            .count(),
        1
    );
    let actual = std::fs::read_to_string(scope.topics_directory().join("shared.md")).unwrap();
    assert!(matches!(actual.as_str(), "first" | "second"));
}

#[test]
fn rollback_finishes_before_waiting_user_write_and_cannot_overwrite_it() {
    let temp = tempfile::tempdir().unwrap();
    let layout = UnifiedMemoryLayout::new(temp.path());
    let scope = layout.personal_scope();
    let access = MemoryAccess::open(layout.meta_database(), scope.clone()).unwrap();
    access
        .create_topic(OperationId::new(), Path::new("shared.md"), "initial")
        .unwrap();
    let guard = ScopeWriteGuard::acquire(scope.root()).unwrap();
    let root = temp.path().to_path_buf();
    let (started_tx, started_rx) = mpsc::channel();
    let (done_tx, done_rx) = mpsc::channel();
    let worker = std::thread::spawn(move || {
        let layout = UnifiedMemoryLayout::new(root);
        let access = MemoryAccess::open(layout.meta_database(), layout.personal_scope()).unwrap();
        started_tx.send(()).unwrap();
        access
            .update_topic(
                OperationId::new(),
                Path::new("shared.md"),
                &hash("initial"),
                "user correction",
                None,
            )
            .unwrap();
        done_tx.send(()).unwrap();
    });
    started_rx.recv().unwrap();
    assert!(done_rx.recv_timeout(Duration::from_millis(30)).is_err());
    assert!(
        access
            .update_topic(
                OperationId::new(),
                Path::new("shared.md"),
                &hash("initial"),
                "failed consolidation",
                Some(AccessKillPoint::AfterCanonicalBeforeManifest)
            )
            .is_err()
    );
    assert_eq!(
        std::fs::read_to_string(scope.topics_directory().join("shared.md")).unwrap(),
        "initial"
    );
    drop(guard);
    done_rx.recv_timeout(Duration::from_secs(5)).unwrap();
    worker.join().unwrap();
    assert_eq!(
        std::fs::read_to_string(scope.topics_directory().join("shared.md")).unwrap(),
        "user correction"
    );
    let manifest: serde_json::Value =
        serde_json::from_slice(&std::fs::read(scope.manifest_file()).unwrap()).unwrap();
    assert_eq!(
        manifest["topics"]["topics/shared.md"],
        hash("user correction").as_str()
    );
}
