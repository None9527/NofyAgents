#![cfg(feature = "sqlite")]
#[path = "parking/transitions.rs"]
mod transitions;
use nofy_agent_runtime::{
    durable::{Clock, SqliteStore},
    governance::*,
    registry::*,
    supervisor::{RunSupervisor, jobs::*},
    system::*,
    *,
};
use nofy_interjection_core::PendingInterjection;
use nofy_tool_runtime::{Tool, ToolCallContext};
use nofy_tool_types::ToolDescription;
use serde_json::{Value, json};
use std::{
    path::{Path, PathBuf},
    sync::{
        Arc,
        atomic::{AtomicU64, AtomicUsize, Ordering},
    },
};
use tokio::sync::Notify;

#[derive(Default)]
struct Gates {
    model_started: Notify,
    model_release: Notify,
    tool_started: Notify,
    tool_release: Notify,
    calls: AtomicUsize,
}
struct TestClock(AtomicU64);
impl Clock for TestClock {
    fn now_ms(&self) -> u64 {
        self.0.load(Ordering::SeqCst)
    }
}
struct ModelAtBoundary(Arc<Gates>);
#[async_trait::async_trait]
impl Model for ModelAtBoundary {
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
        self.0.calls.fetch_add(1, Ordering::SeqCst);
        if request
            .messages
            .iter()
            .any(|m| matches!(m, Message::Tool { .. }))
        {
            return Ok(ModelResponse {
                output: "settled".into(),
                input_tokens: 3,
                output_tokens: 2,
                ..Default::default()
            });
        }
        self.0.model_started.notify_one();
        self.0.model_release.notified().await;
        Ok(tool_response())
    }
}
fn tool_response() -> ModelResponse {
    ModelResponse {
        tool_calls: vec![ToolCall {
            id: "effect-1".into(),
            name: "append".into(),
            arguments: json!({}),
        }],
        input_tokens: 3,
        output_tokens: 2,
        ..Default::default()
    }
}
struct Append {
    path: PathBuf,
    gates: Arc<Gates>,
}
impl Tool for Append {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("append").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        ToolDescription::new("append", "One durable append")
    }
    async fn run(
        &self,
        _: ToolCallContext,
        _: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        use std::io::Write;
        let mut file = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.path)
            .unwrap();
        file.write_all(b"effect\n").unwrap();
        file.sync_all().unwrap();
        self.gates.tool_started.notify_one();
        self.gates.tool_release.notified().await;
        Ok(json!({"written":true}))
    }
}
struct ResetBindings;
impl context::ContextBinding for ResetBindings {
    fn bind(&self, context: &mut RunContext) -> Result<(), Error> {
        context.capabilities = Default::default();
        Ok(())
    }
}
fn setup(
    path: &Path,
    metered: bool,
    reset: bool,
) -> (
    SqliteStore,
    ModuleRegistry,
    CompiledSystem,
    Arc<Gates>,
    Arc<TestClock>,
) {
    let clock = Arc::new(TestClock(AtomicU64::new(1000)));
    let store = SqliteStore::open_with_clock(&path.join("runtime.sqlite"), clock.clone()).unwrap();
    let gates = Arc::new(Gates::default());
    let mut tools = ToolCatalog::new();
    tools
        .insert(ToolEntry::typed(Append {
            path: path.join("effects"),
            gates: gates.clone(),
        }))
        .unwrap();
    let mut registry = ModuleRegistry::default();
    for factory in [
        Arc::new(InstanceFactory::new(
            "model.boundary",
            "1",
            ModuleInstance::Model(Arc::new(ModelAtBoundary(gates.clone()))),
        )) as Arc<dyn ModuleFactory>,
        Arc::new(InstanceFactory::new(
            "tools.append",
            "1",
            ModuleInstance::ToolPack(tools),
        )),
        Arc::new(InstanceFactory::new(
            "binding.reset",
            "1",
            ModuleInstance::Binding(Arc::new(ResetBindings)),
        )),
        Arc::new(StaticPromptFactory),
        Arc::new(model_journal::ModelJournalFactory),
    ] {
        registry.register_factory(factory).unwrap();
    }
    let bindings = if reset {
        json!([r("reset"), r("journal")])
    } else {
        json!([r("journal")])
    };
    let mut doc = json!({"schema_version":1,"name":"park-system","modules":[
        {"reference":r("model"),"factory":"model.boundary","config":{}},
        {"reference":r("prompt"),"factory":"prompt.static","config":{"text":"keep state"}},
        {"reference":r("tools"),"factory":"tools.append","config":{}},
        {"reference":r("journal"),"factory":"binding.model_journal","config":{}},
        {"reference":r("reset"),"factory":"binding.reset","config":{}}
    ],"programs":{"chat":{"kind":"agent","definition":{"name":"chat","model":r("model"),"prompt":r("prompt"),"tool_packs":[r("tools")],"bindings":bindings}}}});
    if metered {
        let budget =
            InstalledBudget::install(Arc::new(store.clone()), BudgetLimits::default(), "1", 5)
                .unwrap();
        registry
            .register_factory(Arc::new(
                GovernanceFactory::new([("db".into(), Arc::new(budget))].into()).unwrap(),
            ))
            .unwrap();
        doc["modules"].as_array_mut().unwrap().push(json!({"reference":r("budget"),"factory":"governance.budget","config":{"resource":"db","limits":{"max_model_calls":3,"max_tool_calls":2}}}));
        doc["required_governance"] = json!([r("budget")]);
    }
    let system = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
    (store, registry, system, gates, clock)
}
fn r(id: &str) -> Value {
    json!({"id":id,"version":"1"})
}
fn request(system: &CompiledSystem, run: &str) -> ManagedRunRequest {
    ManagedRunRequest {
        run_id: run.into(),
        thread_id: "thread".into(),
        system: "park-system".into(),
        release: system.bundle.digest.clone(),
        program: "chat".into(),
        input: Some(PendingInterjection {
            text: "work".into(),
            attachments: vec![],
        }),
        parameters: None,
    }
}
fn action(id: &str, command: ManagedCommand) -> ManagedAction {
    ManagedAction {
        command_id: id.into(),
        run_id: "run".into(),
        command,
    }
}
async fn wake(notify: &Notify) {
    tokio::time::timeout(std::time::Duration::from_secs(5), notify.notified())
        .await
        .unwrap();
}
async fn checkpoint(store: &SqliteStore, system: &CompiledSystem) -> Checkpoint {
    let key = system.program("chat").unwrap().snapshot.name().to_string();
    store
        .load(&format!("{}:{}thread", key.len(), key))
        .await
        .unwrap()
        .unwrap()
}

#[tokio::test]
async fn active_model_and_tool_settle_before_park_and_exact_receipt_survives_reopen() {
    use nofy_agent_runtime::mailbox::{
        InputAddress, InputStatus, MailEnvelope, MailInput, MailboxSender,
    };
    for metered in [false, true] {
        let dir = tempfile::tempdir().unwrap();
        let (store, registry, system, gates, _) = setup(dir.path(), metered, true);
        let supervisor = Arc::new(RunSupervisor::new(store.clone()));
        supervisor
            .submit_managed(request(&system, "run"), &system)
            .await
            .unwrap();
        let worker = {
            let s = supervisor.clone();
            let r = registry.clone();
            tokio::spawn(async move { s.execute_submitted(&r, "run").await })
        };
        wake(&gates.model_started).await;
        let address = InputAddress {
            root_run_id: "run".into(),
            run_id: "run".into(),
            thread_id: "thread".into(),
            agent: "chat".into(),
        };
        store
            .submit(MailEnvelope {
                address: address.clone(),
                input_id: "held-input".into(),
                input: MailInput::Interject {
                    message: PendingInterjection {
                        text: "preserve this pending input".into(),
                        attachments: vec![],
                    },
                },
            })
            .await
            .unwrap();
        let parked = action("park", ManagedCommand::Park);
        store.enqueue_managed_action(parked.clone()).await.unwrap();
        store.enqueue_managed_action(parked).await.unwrap();
        assert!(
            store
                .enqueue_managed_action(action("park", ManagedCommand::Resume))
                .await
                .is_err()
        );
        assert!(
            !store
                .managed_action("park")
                .await
                .unwrap()
                .unwrap()
                .finished
        );
        assert!(store.managed_action_heads(0, 20).await.unwrap().is_empty());
        gates.model_release.notify_one();
        wake(&gates.tool_started).await;
        assert_eq!(
            store.parking("run").await.unwrap().unwrap().status,
            ParkStatus::Requested
        );
        gates.tool_release.notify_one();
        let outcome = worker.await.unwrap().unwrap().unwrap();
        assert!(
            matches!(outcome, RunOutcome::Paused { ref reason, .. } if reason["kind"]=="parked")
        );
        assert_eq!(gates.calls.load(Ordering::SeqCst), 1);
        assert_eq!(
            std::fs::read_to_string(dir.path().join("effects")).unwrap(),
            "effect\n"
        );
        let before = serde_json::to_value(checkpoint(&store, &system).await).unwrap();
        let original = serde_json::to_value(
            store
                .execution_job("run")
                .await
                .unwrap()
                .unwrap()
                .submission,
        )
        .unwrap();
        assert!(
            supervisor
                .execute_submitted(&registry, "run")
                .await
                .is_err()
        );
        store
            .enqueue_managed_action(action("blocked-resume", ManagedCommand::Resume))
            .await
            .unwrap();
        let rejected = supervisor
            .execute_managed_action(&registry, "blocked-resume")
            .await
            .unwrap();
        assert!(rejected.error.unwrap().contains("parked"));
        assert_eq!(
            serde_json::to_value(checkpoint(&store, &system).await).unwrap(),
            before
        );
        let reopened = SqliteStore::open(&dir.path().join("runtime.sqlite")).unwrap();
        let recovery = RunSupervisor::new(reopened.clone());
        let record = reopened.parking("run").await.unwrap().unwrap();
        assert_eq!(record.status, ParkStatus::Parked);
        assert_eq!(
            reopened
                .input_status(&address, "held-input")
                .await
                .unwrap()
                .unwrap()
                .status,
            InputStatus::Pending
        );
        assert_eq!(
            record.receipt.unwrap().checkpoint_revision,
            before["revision"].as_u64().unwrap()
        );
        store
            .enqueue_managed_action(action(
                "unpark",
                ManagedCommand::Unpark {
                    park_command_id: "park".into(),
                },
            ))
            .await
            .unwrap();
        assert!(
            recovery
                .execute_managed_action(&ModuleRegistry::default(), "unpark")
                .await
                .unwrap()
                .error
                .is_none()
        );
        assert_eq!(
            serde_json::to_value(checkpoint(&store, &system).await).unwrap(),
            before
        );
        assert_eq!(
            reopened.parking("run").await.unwrap().unwrap().status,
            ParkStatus::Released
        );
        store
            .enqueue_managed_action(action("resume", ManagedCommand::Resume))
            .await
            .unwrap();
        assert!(matches!(
            recovery
                .execute_managed_action(&registry, "resume")
                .await
                .unwrap()
                .outcome,
            Some(RunOutcome::Completed { .. })
        ));
        assert_eq!(gates.calls.load(Ordering::SeqCst), 2);
        assert_eq!(
            reopened
                .input_status(&address, "held-input")
                .await
                .unwrap()
                .unwrap()
                .status,
            InputStatus::Delivered
        );
        assert_eq!(checkpoint(&store,&system).await.state.messages.iter().filter(|m|matches!(m,Message::User {content} if content.contains("preserve this pending input"))).count(),1);
        assert_eq!(
            std::fs::read_to_string(dir.path().join("effects")).unwrap(),
            "effect\n"
        );
        assert_eq!(
            serde_json::to_value(
                store
                    .execution_job("run")
                    .await
                    .unwrap()
                    .unwrap()
                    .submission
            )
            .unwrap(),
            original
        );
        let replay = recovery
            .execute_managed_action(&ModuleRegistry::default(), "park")
            .await
            .unwrap();
        assert!(
            matches!(replay.outcome,Some(RunOutcome::Paused { ref reason,.. }) if reason["kind"]=="parked")
        );
    }
}

#[tokio::test]
async fn uncertain_model_keeps_park_pending_and_evidence_can_settle_without_fifo_deadlock() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, system, gates, clock) = setup(dir.path(), false, false);
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    supervisor
        .submit_managed(request(&system, "run"), &system)
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
    worker.abort();
    let _ = worker.await;
    clock.0.store(32000, Ordering::SeqCst);
    let before = serde_json::to_value(checkpoint(&store, &system).await).unwrap();
    assert!(
        !supervisor
            .execute_managed_action(&registry, "park")
            .await
            .unwrap()
            .finished
    );
    assert_eq!(
        serde_json::to_value(checkpoint(&store, &system).await).unwrap(),
        before
    );
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
                        response: tool_response(),
                    },
                },
            },
        ))
        .await
        .unwrap();
    let heads = store.managed_action_heads(0, 20).await.unwrap();
    assert_eq!(heads.len(), 1);
    assert_eq!(heads[0].2, "evidence");
    assert_eq!(
        store.pending_managed_actions(20).await.unwrap()[0]
            .action
            .command_id,
        "evidence"
    );
    gates.tool_release.notify_one();
    let done = supervisor
        .execute_managed_action(&registry, "evidence")
        .await
        .unwrap();
    assert!(done.error.is_none(), "{done:?}");
    assert_eq!(
        store.parking("run").await.unwrap().unwrap().status,
        ParkStatus::Parked
    );
    assert_eq!(gates.calls.load(Ordering::SeqCst), 1);
    assert_eq!(
        std::fs::read_to_string(dir.path().join("effects")).unwrap(),
        "effect\n"
    );
}

#[tokio::test]
async fn pending_request_can_be_released_without_resources_and_parked_checkpoint_drift_fails_closed()
 {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, system, gates, clock) = setup(dir.path(), false, false);
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    supervisor
        .submit_managed(request(&system, "run"), &system)
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
    worker.abort();
    let _ = worker.await;
    clock.0.store(32000, Ordering::SeqCst);
    let before = serde_json::to_value(checkpoint(&store, &system).await).unwrap();
    store
        .enqueue_managed_action(action(
            "release",
            ManagedCommand::Unpark {
                park_command_id: "park".into(),
            },
        ))
        .await
        .unwrap();
    assert!(
        supervisor
            .execute_managed_action(&ModuleRegistry::default(), "release")
            .await
            .unwrap()
            .error
            .is_none()
    );
    assert_eq!(
        store.parking("run").await.unwrap().unwrap().status,
        ParkStatus::Released
    );
    assert!(
        store
            .managed_action("park")
            .await
            .unwrap()
            .unwrap()
            .finished
    );
    assert_eq!(
        serde_json::to_value(checkpoint(&store, &system).await).unwrap(),
        before
    );
    store
        .enqueue_managed_action(action("park-again", ManagedCommand::Park))
        .await
        .unwrap();
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
                        response: tool_response(),
                    },
                },
            },
        ))
        .await
        .unwrap();
    gates.tool_release.notify_one();
    supervisor
        .execute_managed_action(&registry, "evidence")
        .await
        .unwrap();
    let mut cp = checkpoint(&store, &system).await;
    let revision = cp.revision;
    cp.revision += 1;
    // A trusted external storage writer is outside the supervisor boundary.
    // Its drift must prevent release rather than silently bless another state.
    store
        .save("4:chatthread", Some(revision), cp)
        .await
        .unwrap();
    store
        .enqueue_managed_action(action(
            "drift-release",
            ManagedCommand::Unpark {
                park_command_id: "park-again".into(),
            },
        ))
        .await
        .unwrap();
    let rejected = supervisor
        .execute_managed_action(&ModuleRegistry::default(), "drift-release")
        .await
        .unwrap();
    assert!(rejected.error.unwrap().contains("checkpoint changed"));
    assert_eq!(
        store.parking("run").await.unwrap().unwrap().status,
        ParkStatus::Parked
    );
    store
        .enqueue_managed_action(action(
            "abandon",
            ManagedCommand::Abandon {
                reason: "explicit administrative stop".into(),
                acknowledge_unresolved: true,
            },
        ))
        .await
        .unwrap();
    assert!(
        supervisor
            .execute_managed_action(&ModuleRegistry::default(), "abandon")
            .await
            .unwrap()
            .abandonment
            .is_some()
    );
    assert_eq!(
        store.parking("run").await.unwrap().unwrap().status,
        ParkStatus::Rejected
    );
}

#[tokio::test]
async fn park_receipt_commits_even_if_the_final_run_ack_is_lost_and_cancel_stays_pending() {
    use nofy_agent_runtime::mailbox::{InputAddress, InputInbox, MailboxSender};
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, system, gates, _) = setup(dir.path(), false, false);
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    supervisor
        .submit_managed(request(&system, "run"), &system)
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
    let sql = rusqlite::Connection::open(store.path().unwrap()).unwrap();
    sql.execute_batch("CREATE TRIGGER lose_final_park_ack BEFORE UPDATE ON agent_runtime_runs
        WHEN NEW.id='run' AND json_extract(NEW.payload,'$.status')='paused'
        AND EXISTS(SELECT 1 FROM agent_runtime_managed_actions WHERE command_id='park' AND result IS NOT NULL)
        BEGIN SELECT RAISE(ABORT,'injected final run ack loss'); END;").unwrap();
    gates.model_release.notify_one();
    gates.tool_release.notify_one();
    assert!(
        worker
            .await
            .unwrap()
            .unwrap_err()
            .to_string()
            .contains("final run ack loss")
    );
    sql.execute_batch("DROP TRIGGER lose_final_park_ack;")
        .unwrap();
    let saved = serde_json::to_value(checkpoint(&store, &system).await).unwrap();
    let receipt = supervisor
        .execute_managed_action(&ModuleRegistry::default(), "park")
        .await
        .unwrap();
    assert!(receipt.finished && receipt.error.is_none());
    assert!(matches!(
        store.execution_job("run").await.unwrap().unwrap().status,
        JobStatus::Waiting
    ));
    let address = InputAddress {
        root_run_id: "run".into(),
        run_id: "run".into(),
        thread_id: "thread".into(),
        agent: "chat".into(),
    };
    let cancelled = store.cancel(&address, "cancel-while-parked").await.unwrap();
    assert!(cancelled > 0);
    store
        .enqueue_managed_action(action(
            "unpark",
            ManagedCommand::Unpark {
                park_command_id: "park".into(),
            },
        ))
        .await
        .unwrap();
    assert!(
        supervisor
            .execute_managed_action(&ModuleRegistry::default(), "unpark")
            .await
            .unwrap()
            .error
            .is_none()
    );
    assert_eq!(
        serde_json::to_value(checkpoint(&store, &system).await).unwrap(),
        saved
    );
    let lease = store
        .acquire(
            "4:chatthread",
            "inspect-cancel",
            std::time::Duration::from_secs(2),
        )
        .await
        .unwrap();
    assert_eq!(
        store
            .guarded(&lease)
            .pending_cancel(&address)
            .await
            .unwrap(),
        Some(cancelled)
    );
    store.release(&lease).await.unwrap();
    store
        .enqueue_managed_action(action(
            "resume-cancel",
            ManagedCommand::ResumeAfterCancel { through: cancelled },
        ))
        .await
        .unwrap();
    let completed = supervisor
        .execute_managed_action(&registry, "resume-cancel")
        .await
        .unwrap();
    assert!(
        matches!(completed.outcome, Some(RunOutcome::Completed { .. })),
        "{completed:?}"
    );
    assert_eq!(gates.calls.load(Ordering::SeqCst), 2);
    assert_eq!(
        std::fs::read_to_string(dir.path().join("effects")).unwrap(),
        "effect\n"
    );
}

#[tokio::test]
async fn unsupported_tool_roots_reject_parking_before_admission() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, base, gates, _) = setup(dir.path(), false, false);
    let mut doc = serde_json::to_value(base.bundle.document).unwrap();
    doc["programs"]["chat"] = json!({"kind":"tool","definition":{"name":"tool-root","tool_packs":[r("tools")]},"call":{"id":"effect-1","name":"append","arguments":{}}});
    let system = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
    let mut req = request(&system, "run");
    req.input = None;
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    supervisor.submit_managed(req, &system).await.unwrap();
    let worker = {
        let s = supervisor.clone();
        let r = registry.clone();
        tokio::spawn(async move { s.execute_submitted(&r, "run").await })
    };
    wake(&gates.tool_started).await;
    let rejected = store
        .enqueue_managed_action(action("unsupported", ManagedCommand::Park))
        .await
        .unwrap_err();
    assert!(rejected.to_string().contains("root Agent"));
    assert!(store.managed_action("unsupported").await.unwrap().is_none());
    assert!(store.parking("run").await.unwrap().is_none());
    gates.tool_release.notify_one();
    assert!(matches!(
        worker.await.unwrap().unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
}

struct DelegateModel(Arc<AtomicUsize>);

#[tokio::test]
async fn unknown_tool_effect_keeps_park_pending_until_exact_root_evidence_settles_it() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, system, gates, clock) = setup(dir.path(), false, false);
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    supervisor
        .submit_managed(request(&system, "run"), &system)
        .await
        .unwrap();
    gates.model_release.notify_one();
    let worker = {
        let s = supervisor.clone();
        let r = registry.clone();
        tokio::spawn(async move { s.execute_submitted(&r, "run").await })
    };
    wake(&gates.tool_started).await;
    store
        .enqueue_managed_action(action("park", ManagedCommand::Park))
        .await
        .unwrap();
    worker.abort();
    let _ = worker.await;
    clock.0.store(32000, Ordering::SeqCst);
    assert!(
        !supervisor
            .execute_managed_action(&registry, "park")
            .await
            .unwrap()
            .finished
    );
    let cp = checkpoint(&store, &system).await;
    let receipt = nofy_agent_runtime::supervisor::RootToolReconciliation {
        model_sequence: cp.state.model_sequence,
        call: cp.state.in_flight.unwrap(),
        result: json!({"written":true}),
        is_error: false,
    };
    store
        .enqueue_managed_action(action(
            "tool-evidence",
            ManagedCommand::ReconcileRootTool { receipt },
        ))
        .await
        .unwrap();
    let settled = supervisor
        .execute_managed_action(&registry, "tool-evidence")
        .await
        .unwrap();
    assert!(settled.error.is_none(), "{settled:?}");
    assert_eq!(
        store.parking("run").await.unwrap().unwrap().status,
        ParkStatus::Parked
    );
    assert_eq!(gates.calls.load(Ordering::SeqCst), 1);
    assert_eq!(
        std::fs::read_to_string(dir.path().join("effects")).unwrap(),
        "effect\n"
    );
}

#[tokio::test]
async fn unjournaled_legacy_model_rejects_parking_without_changing_its_execution_contract() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, base, gates, _) = setup(dir.path(), false, false);
    let mut doc = serde_json::to_value(base.bundle.document).unwrap();
    doc["programs"]["chat"]["definition"]["bindings"] = json!([]);
    let system = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    supervisor
        .submit_managed(request(&system, "run"), &system)
        .await
        .unwrap();
    let worker = {
        let s = supervisor.clone();
        let r = registry.clone();
        tokio::spawn(async move { s.execute_submitted(&r, "run").await })
    };
    wake(&gates.model_started).await;
    let before = serde_json::to_value(checkpoint(&store, &system).await).unwrap();
    assert!(before.get("pending_model").is_none());
    let rejected = store
        .enqueue_managed_action(action("unsupported", ManagedCommand::Park))
        .await
        .unwrap_err();
    assert!(rejected.to_string().contains("binding.model_journal"));
    assert!(store.managed_action("unsupported").await.unwrap().is_none());
    assert!(store.parking("run").await.unwrap().is_none());
    assert_eq!(
        serde_json::to_value(checkpoint(&store, &system).await).unwrap(),
        before
    );
    gates.model_release.notify_one();
    gates.tool_release.notify_one();
    assert!(matches!(
        worker.await.unwrap().unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    assert_eq!(gates.calls.load(Ordering::SeqCst), 2);
}
#[async_trait::async_trait]
impl Model for DelegateModel {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.0.fetch_add(1, Ordering::SeqCst);
        Ok(
            if request
                .messages
                .iter()
                .any(|m| matches!(m, Message::Tool { .. }))
            {
                ModelResponse {
                    output: "parent settled".into(),
                    ..Default::default()
                }
            } else {
                ModelResponse {
                    tool_calls: vec![ToolCall {
                        id: "delegate-1".into(),
                        name: "delegate".into(),
                        arguments: json!({"prompt":"child work"}),
                    }],
                    ..Default::default()
                }
            },
        )
    }
}

#[tokio::test]
async fn inherited_park_authority_waits_for_the_complete_child_agent_and_its_tool_chain() {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, _) = setup(dir.path(), false, true);
    let child=nofy_agent_runtime::compile::compile_agent(serde_json::from_value(json!({
        "name":"child","model":r("model"),"prompt":r("prompt"),"tool_packs":[r("tools")],"bindings":[r("reset"),r("journal")]
    })).unwrap(),base.registry()).unwrap();
    let mut delegation = ToolCatalog::new();
    delegation
        .insert(child.agent.as_tool("delegate", "Run child"))
        .unwrap();
    let parent_calls = Arc::new(AtomicUsize::new(0));
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "model.parent",
            "1",
            ModuleInstance::Model(Arc::new(DelegateModel(parent_calls.clone()))),
        )))
        .unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "tools.delegate",
            "1",
            ModuleInstance::ToolPack(delegation),
        )))
        .unwrap();
    let mut doc = serde_json::to_value(base.bundle.document).unwrap();
    doc["modules"].as_array_mut().unwrap().extend([
        json!({"reference":r("parent-model"),"factory":"model.parent","config":{}}),
        json!({"reference":r("delegation"),"factory":"tools.delegate","config":{}}),
    ]);
    doc["programs"]["chat"]["definition"]["model"] = r("parent-model");
    doc["programs"]["chat"]["definition"]["tool_packs"] = json!([r("delegation")]);
    let system = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    supervisor
        .submit_managed(request(&system, "run"), &system)
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
    assert_eq!(
        store.parking("run").await.unwrap().unwrap().status,
        ParkStatus::Requested
    );
    gates.tool_release.notify_one();
    assert!(
        matches!(worker.await.unwrap().unwrap(),Some(RunOutcome::Paused {ref reason,..}) if reason["kind"]=="parked")
    );
    assert_eq!(gates.calls.load(Ordering::SeqCst), 2);
    assert_eq!(parent_calls.load(Ordering::SeqCst), 1);
    let children = store.children("run").await.unwrap();
    assert_eq!(children.len(), 1);
    assert_eq!(children[0].status, "completed");
    assert_eq!(
        std::fs::read_to_string(dir.path().join("effects")).unwrap(),
        "effect\n"
    );
}
