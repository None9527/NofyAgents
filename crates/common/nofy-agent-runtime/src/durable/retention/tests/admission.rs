use super::*;
use crate::admission::tests::Policy;

#[tokio::test]
async fn guarded_program_admission_rolls_back_and_preserves_effects_and_state_only_updates() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("runtime.sqlite");
    let old = SqliteStore::open(&path).unwrap();
    let policy = Arc::new(Policy::default());
    let store = SqliteStore::open_with_admission(&path, policy.clone()).unwrap();
    assert!(SqliteStore::open(&path).is_err());
    assert!(
        SqliteStore::open_with_admission(
            &path,
            Arc::new(Policy(policy.0.clone(), "another.authority/v1"))
        )
        .is_err()
    );
    assert!(old.execution_job("missing").await.is_err());
    assert!(
        old.save(
            "bypass",
            None,
            Checkpoint {
                version: 1,
                revision: 1,
                composition: "legacy".into(),
                state: Default::default()
            }
        )
        .await
        .is_err()
    );
    assert!(store.load("bypass").await.unwrap().is_none());
    let (registry, compiled, effects) = program();
    let supervisor = RunSupervisor::new(store.clone());
    policy.0.deny.store(true, Ordering::SeqCst);
    assert!(
        supervisor
            .submit_program(
                ProgramSubmission::for_program(&compiled, "thread", "denied", None).unwrap()
            )
            .await
            .is_err()
    );
    assert!(store.execution_job("denied").await.unwrap().is_none());
    policy.0.deny.store(false, Ordering::SeqCst);
    supervisor
        .submit_program(
            ProgramSubmission::for_program(&compiled, "thread", "accepted", None).unwrap(),
        )
        .await
        .unwrap();
    supervisor
        .execute_submitted(&registry, "accepted")
        .await
        .unwrap();
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    let before = policy.0.validations.lock().unwrap().len();
    policy.0.deny.store(true, Ordering::SeqCst);
    policy.0.deny_entry.store(true, Ordering::SeqCst);
    let key = crate::state::checkpoint_key("retained-tool", "thread");
    let mut checkpoint = store.load(&key).await.unwrap().unwrap();
    let revision = checkpoint.revision;
    checkpoint.revision += 1;
    checkpoint.state.data = json!({"modules":[{"factory":"not-a-declaration"}]});
    store.save(&key, Some(revision), checkpoint).await.unwrap();
    assert_eq!(policy.0.validations.lock().unwrap().len(), before);
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    let transient = store
        .acquire("maintenance-control", "control", Duration::from_secs(30))
        .await
        .unwrap();
    store.release(&transient).await.unwrap();
    assert!(store.execution_job("accepted").await.unwrap().is_some());
    assert!(
        supervisor
            .submit_program(
                ProgramSubmission::for_program(&compiled, "new-thread", "blocked", None).unwrap()
            )
            .await
            .is_err()
    );
    assert!(store.execution_job("blocked").await.unwrap().is_none());
    policy.0.deny_entry.store(false, Ordering::SeqCst);
    policy.0.deny.store(false, Ordering::SeqCst);
    assert!(
        store
            .save(
                "uncertified",
                None,
                Checkpoint {
                    version: 1,
                    revision: 1,
                    composition: "unknown-native-identity".into(),
                    state: Default::default()
                }
            )
            .await
            .is_err()
    );
    assert!(store.load("uncertified").await.unwrap().is_none());
    let arbitrary = store
        .acquire("not-an-owned-thread", "arbitrary", Duration::from_secs(30))
        .await
        .unwrap();
    assert!(
        store
            .guarded(&arbitrary)
            .save(
                "forged-owner",
                None,
                Checkpoint {
                    version: 1,
                    revision: 1,
                    composition: "opaque".into(),
                    state: Default::default()
                }
            )
            .await
            .is_err()
    );
    store.release(&arbitrary).await.unwrap();
    assert!(store.load("forged-owner").await.unwrap().is_none());
    let owner = store
        .acquire(key, "owner", Duration::from_secs(30))
        .await
        .unwrap();
    policy.0.deny_entry.store(true, Ordering::SeqCst);
    policy.0.deny.store(true, Ordering::SeqCst);
    let before_inherited = policy.0.validations.lock().unwrap().len();
    store
        .guarded(&owner)
        .save(
            "owned-auxiliary-log",
            None,
            Checkpoint {
                version: 1,
                revision: 1,
                composition: "auxiliary-log-identity".into(),
                state: Default::default(),
            },
        )
        .await
        .unwrap();
    let original = store
        .load(&crate::state::checkpoint_key("retained-tool", "thread"))
        .await
        .unwrap()
        .unwrap();
    store
        .guarded(&owner)
        .save(
            "inherited-child",
            None,
            Checkpoint {
                version: 1,
                revision: 1,
                composition: original.composition,
                state: Default::default(),
            },
        )
        .await
        .unwrap();
    assert_eq!(policy.0.validations.lock().unwrap().len(), before_inherited);
    store.release(&owner).await.unwrap();
    let retained = inventory(&store).await.unwrap();
    assert_eq!(retained.coverage.opaque_compositions, 0);
    assert!(retained.coverage.covered_compositions > 0);
    assert_eq!(policy.0.active.load(Ordering::SeqCst), 0);
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn cancelled_callers_do_not_release_commit_permits_before_blocking_validation_finishes() {
    let dir = tempfile::tempdir().unwrap();
    let policy = Arc::new(Policy::default());
    let store =
        SqliteStore::open_with_admission(&dir.path().join("runtime.sqlite"), policy.clone())
            .unwrap();
    let (_, compiled, _) = program();
    let entered = Arc::new(tokio::sync::Notify::new());
    let (release, wait) = std::sync::mpsc::channel();
    *policy.0.blocker.lock().unwrap() = Some((entered.clone(), wait));
    let writer = store.clone();
    let task = tokio::spawn(async move {
        RunSupervisor::new(writer)
            .submit_program(
                ProgramSubmission::for_program(&compiled, "thread", "cancelled", None).unwrap(),
            )
            .await
    });
    tokio::time::timeout(Duration::from_secs(5), entered.notified())
        .await
        .unwrap();
    task.abort();
    assert!(matches!(task.await, Err(e) if e.is_cancelled()));
    assert_eq!(policy.0.active.load(Ordering::SeqCst), 1);
    policy.0.deny.store(true, Ordering::SeqCst);
    release.send(()).unwrap();
    tokio::time::timeout(Duration::from_secs(5), async {
        while policy.0.active.load(Ordering::SeqCst) != 0 {
            tokio::task::yield_now().await;
        }
    })
    .await
    .unwrap();
    assert!(store.execution_job("cancelled").await.unwrap().is_none());
}
