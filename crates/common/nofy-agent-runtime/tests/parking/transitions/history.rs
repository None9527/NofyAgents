use super::*;
use std::{sync::atomic::AtomicBool, time::Duration};

struct HistoryModel {
    entered: Notify,
    release: Notify,
    validations: AtomicUsize,
    block_on: usize,
    reject: AtomicBool,
}
#[async_trait::async_trait]
impl Model for HistoryModel {
    async fn validate_live_history(&self, _: &[Message]) -> Result<(), Error> {
        if self.validations.fetch_add(1, Ordering::SeqCst) + 1 == self.block_on {
            self.entered.notify_one();
            self.release.notified().await;
        }
        if self.reject.load(Ordering::SeqCst) {
            return Err(Error::Composition(
                "retained native history rejected".into(),
            ));
        }
        Ok(())
    }
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        Err(Error::Model(
            "history validation must not dispatch a model".into(),
        ))
    }
}
fn history_target(
    registry: &mut ModuleRegistry,
    base: &CompiledSystem,
    block_on: usize,
) -> (CompiledSystem, Arc<HistoryModel>) {
    let model = Arc::new(HistoryModel {
        entered: Notify::new(),
        release: Notify::new(),
        validations: AtomicUsize::new(0),
        block_on,
        reject: AtomicBool::new(false),
    });
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "model.history",
            "1",
            ModuleInstance::Model(model.clone()),
        )))
        .unwrap();
    let mut doc = serde_json::to_value(&base.bundle.document).unwrap();
    doc["modules"].as_array_mut().unwrap().push(json!({
        "reference":r("history"),"factory":"model.history","config":{},
    }));
    doc["programs"]["chat"]["definition"]["model"] = r("history");
    (
        compile_system(serde_json::from_value(doc).unwrap(), registry).unwrap(),
        model,
    )
}

#[tokio::test]
async fn admission_history_wait_holds_no_write_lock_and_rejects_checkpoint_or_park_drift() {
    for drift in ["checkpoint", "park"] {
        let dir = tempfile::tempdir().unwrap();
        let (store, mut registry, base, gates, _) = setup(dir.path(), true, false);
        let (target, model) = history_target(&mut registry, &base, 1);
        let supervisor = Arc::new(RunSupervisor::new(store.clone()));
        park(&supervisor, &store, &registry, &base, &gates).await;
        let before = checkpoint(&store, &base).await;
        let submitting = {
            let supervisor = supervisor.clone();
            tokio::spawn(async move {
                supervisor
                    .submit_transition(change("change", &target, 0), &target)
                    .await
            })
        };
        wake(&model.entered).await;
        // This uses the same store connection; a transaction held by the
        // validator would prevent even this query from completing.
        tokio::time::timeout(Duration::from_secs(1), store.managed_action("park"))
            .await
            .unwrap()
            .unwrap();
        if drift == "checkpoint" {
            let mut changed = before.clone();
            changed.revision += 1;
            changed.state.messages.push(Message::User {
                content: "concurrent input".into(),
            });
            tokio::time::timeout(
                Duration::from_secs(1),
                store.save("4:chatthread", Some(before.revision), changed),
            )
            .await
            .unwrap()
            .unwrap();
        } else {
            tokio::time::timeout(Duration::from_secs(1), release(&supervisor, &store))
                .await
                .unwrap();
        }
        model.release.notify_one();
        assert!(submitting.await.unwrap().is_err());
        assert!(store.managed_action("change").await.unwrap().is_none());
        assert!(store.live_execution("run").await.unwrap().is_none());
        assert_eq!(gates.calls.load(Ordering::SeqCst), 1);
    }
}

#[tokio::test]
async fn execution_history_wait_preserves_lease_without_locking_database_and_commits_once() {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, clock) = setup(dir.path(), false, false);
    let (target, model) = history_target(&mut registry, &base, 2);
    let supervisor = Arc::new(
        RunSupervisor::new(store.clone())
            .with_lease_ttl(Duration::from_millis(120))
            .unwrap(),
    );
    park(&supervisor, &store, &registry, &base, &gates).await;
    let before = checkpoint(&store, &base).await;
    let command = change("change", &target, 0);
    supervisor
        .submit_transition(command.clone(), &target)
        .await
        .unwrap();
    let applying = {
        let supervisor = supervisor.clone();
        let registry = registry.clone();
        tokio::spawn(async move { supervisor.execute_managed_action(&registry, "change").await })
    };
    wake(&model.entered).await;
    for _ in 0..10 {
        clock.0.fetch_add(20, Ordering::SeqCst);
        tokio::time::sleep(Duration::from_millis(25)).await;
        assert_eq!(checkpoint(&store, &base).await.revision, before.revision);
    }
    assert!(
        store
            .acquire("4:chatthread", "contender", Duration::from_millis(120))
            .await
            .is_err()
    );
    model.release.notify_one();
    let applied = applying.await.unwrap().unwrap();
    assert!(applied.finished && applied.error.is_none(), "{applied:?}");
    assert_eq!(
        checkpoint(&store, &base).await.revision,
        before.revision + 1
    );
    assert_eq!(model.validations.load(Ordering::SeqCst), 2);
    // Replay does not evaluate history a third time or rewrite the checkpoint.
    supervisor
        .submit_transition(command, &target)
        .await
        .unwrap();
    execute(&supervisor, &registry, "change").await;
    assert_eq!(model.validations.load(Ordering::SeqCst), 2);
    assert_eq!(gates.calls.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn execution_history_drift_or_rejection_is_a_durable_failure_without_partial_install() {
    for drift in [false, true] {
        let dir = tempfile::tempdir().unwrap();
        let (store, mut registry, base, gates, clock) = setup(dir.path(), true, false);
        let (target, model) = history_target(&mut registry, &base, 2);
        let supervisor = Arc::new(RunSupervisor::new(store.clone()));
        park(&supervisor, &store, &registry, &base, &gates).await;
        let before = checkpoint(&store, &base).await;
        supervisor
            .submit_transition(change("change", &target, 0), &target)
            .await
            .unwrap();
        let applying = {
            let supervisor = supervisor.clone();
            let registry = registry.clone();
            tokio::spawn(
                async move { supervisor.execute_managed_action(&registry, "change").await },
            )
        };
        wake(&model.entered).await;
        let mut expected = before.clone();
        if drift {
            expected.revision += 1;
            store
                .save("4:chatthread", Some(before.revision), expected.clone())
                .await
                .unwrap();
        } else {
            model.reject.store(true, Ordering::SeqCst);
        }
        model.release.notify_one();
        let failed = applying.await.unwrap().unwrap();
        assert!(failed.finished);
        let error = failed.error.unwrap();
        assert!(
            error.contains(if drift {
                "checkpoint changed"
            } else {
                "native history rejected"
            }),
            "{error}"
        );
        assert!(store.live_execution("run").await.unwrap().is_none());
        assert_eq!(
            content_digest(&checkpoint(&store, &base).await).unwrap(),
            content_digest(&expected).unwrap()
        );
        let reopened =
            SqliteStore::open_with_clock(&dir.path().join("runtime.sqlite"), clock).unwrap();
        let failed = RunSupervisor::new(reopened)
            .execute_managed_action(&registry, "change")
            .await
            .unwrap();
        assert!(failed.finished && failed.error.is_some());
        assert_eq!(model.validations.load(Ordering::SeqCst), 2);
        assert_eq!(gates.calls.load(Ordering::SeqCst), 1);
    }
}

#[tokio::test]
async fn concurrent_exact_admission_replays_the_frozen_result_after_its_old_history_wait() {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, _) = setup(dir.path(), false, false);
    let (target, model) = history_target(&mut registry, &base, 1);
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    park(&supervisor, &store, &registry, &base, &gates).await;
    let command = change("change", &target, 0);
    let submitting = {
        let supervisor = supervisor.clone();
        let target = target.clone();
        let command = command.clone();
        tokio::spawn(async move { supervisor.submit_transition(command, &target).await })
    };
    wake(&model.entered).await;
    let accepted = supervisor
        .submit_transition(command, &target)
        .await
        .unwrap();
    assert!(!accepted.finished);
    let applied = execute(&supervisor, &registry, "change").await;
    model.release.notify_one();
    let replay = submitting.await.unwrap().unwrap();
    assert!(replay.finished && replay.error.is_none());
    assert_eq!(
        content_digest(&replay).unwrap(),
        content_digest(&applied).unwrap()
    );
    assert_eq!(
        store.live_execution("run").await.unwrap().unwrap().revision,
        1
    );
    assert_eq!(model.validations.load(Ordering::SeqCst), 3);
    assert_eq!(gates.calls.load(Ordering::SeqCst), 1);
}
