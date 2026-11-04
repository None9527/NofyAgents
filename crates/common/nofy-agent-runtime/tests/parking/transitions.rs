use super::*;
use std::sync::Mutex;
#[path = "transitions/history.rs"]
mod history;
#[path = "transitions/modules.rs"]
mod modules;
#[path = "transitions/sessions.rs"]
mod sessions;

struct TargetModel(Arc<Mutex<Vec<ModelRequest>>>);
#[async_trait::async_trait]
impl Model for TargetModel {
    async fn request_bound(
        &self,
        _: &ModelRequest,
        _: &RunContext,
    ) -> Result<model::ModelRequestBound, Error> {
        Ok(model::ModelRequestBound {
            max_calls: 1,
            max_input_tokens: Some(10),
            max_output_tokens: Some(5),
        })
    }
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.0.lock().unwrap().push(request);
        Ok(ModelResponse {
            output: "new model".into(),
            input_tokens: 3,
            output_tokens: 2,
            ..Default::default()
        })
    }
}
fn target(
    registry: &mut ModuleRegistry,
    base: &CompiledSystem,
) -> (CompiledSystem, Arc<Mutex<Vec<ModelRequest>>>) {
    let requests = Arc::new(Mutex::new(Vec::new()));
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "model.target",
            "1",
            ModuleInstance::Model(Arc::new(TargetModel(requests.clone()))),
        )))
        .unwrap();
    let mut doc = serde_json::to_value(&base.bundle.document).unwrap();
    doc["modules"]
        .as_array_mut()
        .unwrap()
        .push(json!({"reference":r("new-model"),"factory":"model.target","config":{}}));
    doc["programs"]["chat"]["definition"]["model"] = r("new-model");
    doc["programs"]["chat"]["definition"]["settings"] = json!({"model":{"temperature":0.2}});
    doc["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|m| m["reference"] == r("prompt"))
        .unwrap()["config"]["text"] = json!("new literal {prompt}");
    (
        compile_system(serde_json::from_value(doc).unwrap(), registry).unwrap(),
        requests,
    )
}
async fn park(
    supervisor: &Arc<RunSupervisor>,
    store: &SqliteStore,
    registry: &ModuleRegistry,
    system: &CompiledSystem,
    gates: &Arc<Gates>,
) {
    supervisor
        .submit_managed(request(system, "run"), system)
        .await
        .unwrap();
    let worker = {
        let s = supervisor.clone();
        let r = registry.clone();
        tokio::spawn(async move { s.execute_submitted(&r, "run").await })
    };
    wake(&gates.model_started).await;
    store
        .enqueue_managed_action(action("park", ManagedCommand::Park))
        .await
        .unwrap();
    gates.model_release.notify_one();
    wake(&gates.tool_started).await;
    gates.tool_release.notify_one();
    assert!(matches!(
        worker.await.unwrap().unwrap().unwrap(),
        RunOutcome::Paused { .. }
    ));
}
fn change(id: &str, target: &CompiledSystem, revision: u64) -> ManagedAction {
    action(
        id,
        ManagedCommand::Transition {
            park_command_id: "park".into(),
            expected_revision: revision,
            release: target.bundle.digest.clone(),
            program: "chat".into(),
        },
    )
}
async fn execute(
    supervisor: &RunSupervisor,
    registry: &ModuleRegistry,
    command: &str,
) -> ManagedActionRecord {
    let result = supervisor
        .execute_managed_action(registry, command)
        .await
        .unwrap();
    assert!(result.error.is_none(), "{:?}", result.error);
    result
}
async fn release(supervisor: &RunSupervisor, store: &SqliteStore) {
    store
        .enqueue_managed_action(action(
            "unpark",
            ManagedCommand::Unpark {
                park_command_id: "park".into(),
            },
        ))
        .await
        .unwrap();
    execute(supervisor, &ModuleRegistry::default(), "unpark").await;
}

#[tokio::test]
async fn transition_preserves_identity_effects_budget_and_restores_new_model_prompt_settings() {
    for metered in [false, true] {
        let dir = tempfile::tempdir().unwrap();
        let (store, mut registry, base, gates, _) = setup(dir.path(), metered, true);
        let (new, requests) = target(&mut registry, &base);
        let supervisor = Arc::new(RunSupervisor::new(store.clone()));
        park(&supervisor, &store, &registry, &base, &gates).await;
        let before = checkpoint(&store, &base).await;
        let original = store.execution_job("run").await.unwrap().unwrap();
        let parking = content_digest(&store.parking("run").await.unwrap()).unwrap();
        let c = change("change", &new, 0);
        assert!(store.enqueue_managed_action(c.clone()).await.is_err());
        supervisor.submit_transition(c.clone(), &new).await.unwrap();
        // An accepted immutable proposal survives host/store teardown.
        let reopened = SqliteStore::open(&dir.path().join("runtime.sqlite")).unwrap();
        let recovery = RunSupervisor::new(reopened.clone());
        execute(&recovery, &registry, "change").await;
        let live = reopened.live_execution("run").await.unwrap().unwrap();
        assert_eq!(live.protocol, "nofy.live/v1");
        assert!(live.modules.is_none());
        assert!(
            serde_json::to_value(&live)
                .unwrap()
                .get("modules")
                .is_none()
        );
        assert_eq!(live.revision, 1);
        assert_eq!(live.submission_digest, original.digest);
        assert_eq!(
            content_digest(&live.before).unwrap(),
            content_digest(&before).unwrap()
        );
        let after = checkpoint(&reopened, &base).await;
        assert_eq!(after.revision, before.revision + 1);
        let mut expected = before.clone();
        expected.revision += 1;
        expected.state.messages[0] = Message::System {
            content: "new literal {prompt}".into(),
        };
        assert_eq!(
            content_digest(&after).unwrap(),
            content_digest(&expected).unwrap()
        );
        assert_eq!(
            content_digest(&reopened.parking("run").await.unwrap()).unwrap(),
            parking
        );
        assert_eq!(
            content_digest(
                &reopened
                    .execution_job("run")
                    .await
                    .unwrap()
                    .unwrap()
                    .submission
            )
            .unwrap(),
            content_digest(&original.submission).unwrap()
        );
        assert!(requests.lock().unwrap().is_empty());
        assert_eq!(gates.calls.load(Ordering::SeqCst), 1);
        execute(&recovery, &registry, "change").await;
        recovery.submit_transition(c, &new).await.unwrap();
        assert_eq!(checkpoint(&reopened, &base).await.revision, after.revision);
        // Direct frozen SDK execution must not accidentally use the old model.
        assert!(
            recovery
                .execute_program(
                    base.program("chat").unwrap(),
                    RunInput::resume(),
                    RunContext::new("thread", "run")
                )
                .await
                .is_err()
        );
        release(&recovery, &reopened).await;
        assert!(requests.lock().unwrap().is_empty());
        assert!(matches!(
            recovery
                .execute_submitted(&registry, "run")
                .await
                .unwrap()
                .unwrap(),
            RunOutcome::Completed { .. }
        ));
        let seen = requests.lock().unwrap();
        assert_eq!(seen.len(), 1);
        assert_eq!(seen[0].settings["temperature"], 0.2);
        assert_eq!(
            seen[0].messages[0],
            Message::System {
                content: "new literal {prompt}".into()
            }
        );
        assert!(
            seen[0]
                .messages
                .iter()
                .any(|m| matches!(m,Message::Tool { call_id,.. } if call_id=="effect-1"))
        );
        assert_eq!(
            std::fs::read_to_string(dir.path().join("effects")).unwrap(),
            "effect\n"
        );
        assert_eq!(gates.calls.load(Ordering::SeqCst), 1);
    }
}

#[tokio::test]
async fn transition_rejects_stateful_changes_stale_versions_and_checkpoint_drift() {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, _) = setup(dir.path(), true, false);
    let (new, _) = target(&mut registry, &base);
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    park(&supervisor, &store, &registry, &base, &gates).await;
    for (name, path, value) in [
        (
            "steps",
            "/programs/chat/definition/settings/max_steps",
            json!(5),
        ),
        ("tools", "/programs/chat/definition/tool_packs", json!([])),
        (
            "budget",
            "/modules/5/config/limits/max_model_calls",
            json!(9),
        ),
    ] {
        let mut doc = serde_json::to_value(&new.bundle.document).unwrap();
        if path.ends_with("max_steps") {
            doc["programs"]["chat"]["definition"]["settings"]["max_steps"] = value;
        } else if path.ends_with("tool_packs") {
            doc["programs"]["chat"]["definition"]["tool_packs"] = value;
        } else {
            doc["modules"]
                .as_array_mut()
                .unwrap()
                .iter_mut()
                .find(|m| m["reference"] == r("budget"))
                .unwrap()["config"]["limits"]["max_model_calls"] = value;
        }
        let changed = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
        assert!(
            supervisor
                .submit_transition(change(name, &changed, 0), &changed)
                .await
                .is_err()
        );
        assert!(store.managed_action(name).await.unwrap().is_none());
    }
    assert!(
        supervisor
            .submit_transition(change("stale", &new, 1), &new)
            .await
            .is_err()
    );
    supervisor
        .submit_transition(change("drift", &new, 0), &new)
        .await
        .unwrap();
    let before = checkpoint(&store, &base).await;
    let mut drift = before.clone();
    drift.revision += 1;
    store
        .save("4:chatthread", Some(before.revision), drift.clone())
        .await
        .unwrap();
    let failed = supervisor
        .execute_managed_action(&registry, "drift")
        .await
        .unwrap();
    assert!(failed.error.unwrap().contains("checkpoint changed"));
    assert!(store.live_execution("run").await.unwrap().is_none());
    assert_eq!(
        content_digest(&checkpoint(&store, &base).await).unwrap(),
        content_digest(&drift).unwrap()
    );
}

#[tokio::test]
async fn rollback_is_a_new_version_and_atomic_ack_loss_never_partially_installs_configuration() {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, _) = setup(dir.path(), false, false);
    let (new, requests) = target(&mut registry, &base);
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    park(&supervisor, &store, &registry, &base, &gates).await;
    let before = checkpoint(&store, &base).await;
    supervisor
        .submit_transition(change("change", &new, 0), &new)
        .await
        .unwrap();
    let sql = rusqlite::Connection::open(dir.path().join("runtime.sqlite")).unwrap();
    sql.execute_batch("CREATE TRIGGER lose_live_ack BEFORE UPDATE OF result ON agent_runtime_managed_actions WHEN NEW.command_id='change' BEGIN SELECT RAISE(ABORT,'ack lost'); END;").unwrap();
    assert!(
        supervisor
            .execute_managed_action(&registry, "change")
            .await
            .is_err()
    );
    assert!(store.live_execution("run").await.unwrap().is_none());
    assert_eq!(
        content_digest(&checkpoint(&store, &base).await).unwrap(),
        content_digest(&before).unwrap()
    );
    assert!(
        !store
            .managed_action("change")
            .await
            .unwrap()
            .unwrap()
            .finished
    );
    sql.execute_batch("DROP TRIGGER lose_live_ack").unwrap();
    execute(&supervisor, &registry, "change").await;
    let first = store.live_execution("run").await.unwrap().unwrap();
    assert!(
        supervisor
            .submit_transition(change("outdated", &base, 0), &base)
            .await
            .is_err()
    );
    supervisor
        .submit_transition(change("rollback", &base, 1), &base)
        .await
        .unwrap();
    execute(&supervisor, &registry, "rollback").await;
    let second = store.live_execution("run").await.unwrap().unwrap();
    assert_eq!(second.revision, 2);
    let history = store.live_versions("run", 0, 1).await.unwrap();
    assert_eq!(history.len(), 1);
    assert_eq!(history[0].revision, 1);
    assert_eq!(
        store.live_versions("run", 1, 32).await.unwrap()[0].revision,
        2
    );
    assert!(store.live_versions("run", 0, 33).await.is_err());
    assert_eq!(second.before_digest, first.after_digest);
    assert_eq!(second.after.state.messages[0], before.state.messages[0]);
    assert_eq!(second.after.state.steps, before.state.steps);
    release(&supervisor, &store).await;
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "run")
            .await
            .unwrap()
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(gates.calls.load(Ordering::SeqCst), 2);
    assert!(requests.lock().unwrap().is_empty());
    assert_eq!(
        std::fs::read_to_string(dir.path().join("effects")).unwrap(),
        "effect\n"
    );
}

struct WaitingTarget {
    started: Arc<Notify>,
    calls: Arc<AtomicUsize>,
}

#[tokio::test]
async fn concurrent_proposals_obey_fifo_and_compare_and_swap_without_partial_state() {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, _) = setup(dir.path(), false, false);
    let (new, requests) = target(&mut registry, &base);
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    park(&supervisor, &store, &registry, &base, &gates).await;
    supervisor
        .submit_transition(change("first", &new, 0), &new)
        .await
        .unwrap();
    supervisor
        .submit_transition(change("second", &base, 0), &base)
        .await
        .unwrap();
    assert!(
        supervisor
            .execute_managed_action(&registry, "second")
            .await
            .is_err()
    );
    assert!(
        !store
            .managed_action("second")
            .await
            .unwrap()
            .unwrap()
            .finished
    );
    execute(&supervisor, &registry, "first").await;
    let before = content_digest(&checkpoint(&store, &base).await).unwrap();
    let result = supervisor
        .execute_managed_action(&registry, "second")
        .await
        .unwrap();
    assert!(result.finished);
    assert!(result.error.unwrap().contains("revision changed"));
    assert_eq!(
        store.live_execution("run").await.unwrap().unwrap().revision,
        1
    );
    assert_eq!(
        content_digest(&checkpoint(&store, &base).await).unwrap(),
        before
    );
    assert!(requests.lock().unwrap().is_empty());
}
#[async_trait::async_trait]
impl Model for WaitingTarget {
    async fn request_bound(
        &self,
        _: &ModelRequest,
        _: &RunContext,
    ) -> Result<model::ModelRequestBound, Error> {
        Ok(model::ModelRequestBound {
            max_calls: 1,
            max_input_tokens: Some(10),
            max_output_tokens: Some(5),
        })
    }
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        self.calls.fetch_add(1, Ordering::SeqCst);
        self.started.notify_one();
        std::future::pending().await
    }
}

#[tokio::test]
async fn unknown_effect_after_transition_reconciles_in_original_journal_without_redispatch() {
    for metered in [false, true] {
        let dir = tempfile::tempdir().unwrap();
        let (store, mut registry, base, gates, clock) = setup(dir.path(), metered, false);
        let (new, _) = target(&mut registry, &base);
        let started = Arc::new(Notify::new());
        let calls = Arc::new(AtomicUsize::new(0));
        registry
            .register_factory(Arc::new(InstanceFactory::new(
                "model.live_wait",
                "1",
                ModuleInstance::Model(Arc::new(WaitingTarget {
                    started: started.clone(),
                    calls: calls.clone(),
                })),
            )))
            .unwrap();
        let mut doc = serde_json::to_value(&new.bundle.document).unwrap();
        doc["modules"]
            .as_array_mut()
            .unwrap()
            .iter_mut()
            .find(|m| m["reference"] == r("new-model"))
            .unwrap()["factory"] = json!("model.live_wait");
        let new = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
        let supervisor = Arc::new(RunSupervisor::new(store.clone()));
        park(&supervisor, &store, &registry, &base, &gates).await;
        supervisor
            .submit_transition(change("change", &new, 0), &new)
            .await
            .unwrap();
        execute(&supervisor, &registry, "change").await;
        release(&supervisor, &store).await;
        let worker = {
            let s = supervisor.clone();
            let r = registry.clone();
            tokio::spawn(async move { s.execute_submitted(&r, "run").await })
        };
        wake(&started).await;
        worker.abort();
        let _ = worker.await;
        clock.0.store(32000, Ordering::SeqCst);
        let resumed = supervisor
            .execute_submitted(&registry, "run")
            .await
            .unwrap()
            .unwrap();
        let expected = if metered {
            "budget_uncertain"
        } else {
            "model_uncertain"
        };
        assert!(
            matches!(resumed,RunOutcome::Paused {ref reason,..} if reason["kind"]==expected),
            "{resumed:?}"
        );
        assert_eq!(calls.load(Ordering::SeqCst), 1);
        let target = supervisor
            .model_reconciliation_targets("run", "run")
            .await
            .unwrap()
            .remove(0);
        store
            .enqueue_managed_action(action(
                "evidence",
                ManagedCommand::ReconcileModel {
                    receipt: ModelReconciliation {
                        ticket: target.ticket,
                        result: ModelReconciliationResult::Completed {
                            response: ModelResponse {
                                output: "reconciled live model".into(),
                                input_tokens: 3,
                                output_tokens: 2,
                                ..Default::default()
                            },
                        },
                    },
                },
            ))
            .await
            .unwrap();
        let done = execute(&supervisor, &registry, "evidence").await;
        assert!(
            matches!(done.outcome,Some(RunOutcome::Completed { ref output,..}) if output=="reconciled live model")
        );
        assert_eq!(calls.load(Ordering::SeqCst), 1);
        assert_eq!(gates.calls.load(Ordering::SeqCst), 1);
        assert_eq!(
            std::fs::read_to_string(dir.path().join("effects")).unwrap(),
            "effect\n"
        );
    }
}
