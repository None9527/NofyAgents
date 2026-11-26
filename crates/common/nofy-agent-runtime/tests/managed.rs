#![cfg(feature = "sqlite")]
use nofy_agent_runtime::{
    durable::SqliteStore,
    registry::*,
    supervisor::{DurableApprovalPolicy, RunSupervisor, jobs::*},
    system::*,
    *,
};
use nofy_tool_runtime::{Tool, ToolCallContext};
use nofy_tool_types::ToolDescription;
use serde_json::{Value, json};
use std::{path::PathBuf, sync::Arc};
struct Append(PathBuf);
impl Tool for Append {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("append").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        ToolDescription::new("append", "Append one durable effect")
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
            .open(&self.0)
            .unwrap();
        file.write_all(b"effect\n").unwrap();
        file.sync_all().unwrap();
        Ok(json!({"written":true}))
    }
}
fn setup(
    directory: &std::path::Path,
    approval: bool,
) -> (SqliteStore, ModuleRegistry, CompiledSystem) {
    let store = SqliteStore::open(&directory.join("runtime.sqlite")).unwrap();
    let mut catalog = ToolCatalog::new();
    catalog
        .insert(ToolEntry::typed(Append(directory.join("effects"))))
        .unwrap();
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "tool.append",
            "1",
            ModuleInstance::ToolPack(catalog),
        )))
        .unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "policy.approval",
            "1",
            ModuleInstance::Policy(Arc::new(DurableApprovalPolicy::new(store.clone()))),
        )))
        .unwrap();
    let document=serde_json::from_value(json!({"schema_version":1,"name":"managed","modules":[
        {"reference":{"id":"tools","version":"1"},"factory":"tool.append","config":{}},
        {"reference":{"id":"approval","version":"1"},"factory":"policy.approval","config":{}}
    ],"programs":{"append":{"kind":"tool","definition":{"name":"append-program","tool_packs":[{"id":"tools","version":"1"}],"policies":if approval {json!([{"id":"approval","version":"1"}])}else{json!([])}},"call":{"id":"one","name":"append","arguments":{}}}}})).unwrap();
    let system = compile_system(document, &registry).unwrap();
    (store, registry, system)
}
fn request(system: &CompiledSystem, id: &str) -> ManagedRunRequest {
    ManagedRunRequest {
        approval_mode: None,
        run_id: id.into(),
        thread_id: "thread".into(),
        system: "managed".into(),
        release: system.bundle.digest.clone(),
        program: "append".into(),
        input: None,
        parameters: None,
    }
}
#[tokio::test]
async fn system_required_approval_restores_for_jobs_and_actions_without_dropping_host_floors() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, original) = setup(dir.path(), false);
    let mut document = original.bundle.document;
    document.required_policies = vec![ModuleRef::new("approval", "1")];
    let system = compile_system(document, &registry).unwrap();
    // The generic SDK restore keeps its strict host-context contract.
    assert!(
        system
            .program("append")
            .unwrap()
            .snapshot
            .restore(&registry)
            .is_err()
    );
    let supervisor = RunSupervisor::new(store.clone());
    supervisor
        .submit_managed(request(&system, "system-floor"), &system)
        .await
        .unwrap();
    let mut stricter = registry.clone();
    let required = ModuleRef::new("new-host-floor", "1");
    stricter
        .define(ModuleDefinition {
            reference: required.clone(),
            factory: "policy.approval".into(),
            config: json!({}),
            dependencies: Default::default(),
        })
        .unwrap();
    stricter.require_policy(required);
    assert!(
        supervisor
            .execute_submitted(&stricter, "system-floor")
            .await
            .is_err()
    );
    assert!(
        store
            .execution_record("system-floor")
            .await
            .unwrap()
            .is_none()
    );
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "system-floor")
            .await
            .unwrap(),
        Some(RunOutcome::Paused { .. })
    ));
    assert!(!dir.path().join("effects").exists());
    let approval = store
        .pending_approvals("system-floor")
        .await
        .unwrap()
        .remove(0);
    store.decide(&approval, true).await.unwrap();
    store
        .enqueue_managed_action(ManagedAction {
            command_id: "system-floor-resume".into(),
            run_id: "system-floor".into(),
            command: ManagedCommand::Resume,
        })
        .await
        .unwrap();
    let receipt = supervisor
        .execute_managed_action(&registry, "system-floor-resume")
        .await
        .unwrap();
    assert!(receipt.finished && receipt.error.is_none(), "{receipt:?}");
    assert!(matches!(
        receipt.outcome,
        Some(RunOutcome::Completed { .. })
    ));
    assert_eq!(
        std::fs::read_to_string(dir.path().join("effects")).unwrap(),
        "effect\n"
    );
}
#[tokio::test]
async fn system_required_governance_restores_and_enforces_quota_before_any_effect() {
    use nofy_agent_runtime::governance::*;
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, original) = setup(dir.path(), false);
    let installed =
        InstalledBudget::install(Arc::new(store.clone()), BudgetLimits::default(), "1", 5).unwrap();
    registry
        .register_factory(Arc::new(
            GovernanceFactory::new([("runtime".into(), Arc::new(installed))].into()).unwrap(),
        ))
        .unwrap();
    let quota = ModuleRef::new("quota", "1");
    let mut document = original.bundle.document;
    document.modules.push(ModuleDefinition {
        reference: quota.clone(),
        factory: "governance.budget".into(),
        config: json!({"resource":"runtime","limits":{"max_tool_calls":0}}),
        dependencies: Default::default(),
    });
    document.required_governance = vec![quota.clone()];
    let system = compile_system(document, &registry).unwrap();
    let resolved = system.registry().resolve(&[quota]).unwrap();
    let ModuleInstance::Governance(profile) = &resolved.instances[&ModuleRef::new("quota", "1")]
    else {
        panic!("governance required")
    };
    let scope = BudgetScope {
        root_run_id: "quota-floor".into(),
        identity: profile.identity().into(),
    };
    assert!(store.inspect(&scope).await.unwrap().is_none());
    let supervisor = RunSupervisor::new(store.clone());
    supervisor
        .submit_managed(request(&system, "quota-floor"), &system)
        .await
        .unwrap();
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "quota-floor")
            .await
            .unwrap(),
        Some(RunOutcome::BudgetExceeded { .. })
    ));
    assert!(!dir.path().join("effects").exists());
    assert_eq!(
        store
            .inspect(&scope)
            .await
            .unwrap()
            .unwrap()
            .used
            .tool_calls,
        0
    );
}
#[tokio::test]
async fn invocation_parameters_preserve_old_wire_hash_and_freeze_in_the_atomic_job() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, system) = setup(dir.path(), false);
    let supervisor = RunSupervisor::new(store.clone());
    let original = request(&system, "parameters");
    let wire = serde_json::to_value(&original).unwrap();
    assert!(wire.get("parameters").is_none());
    let roundtrip: ManagedRunRequest = serde_json::from_value(wire.clone()).unwrap();
    assert_eq!(
        content_digest(&roundtrip).unwrap(),
        content_digest(&original).unwrap()
    );
    let mut explicit_null = wire;
    explicit_null["parameters"] = Value::Null;
    let mut request: ManagedRunRequest = serde_json::from_value(explicit_null).unwrap();
    assert_eq!(request.parameters, Some(Value::Null));
    assert_ne!(
        content_digest(&request).unwrap(),
        content_digest(&original).unwrap()
    );
    request.parameters = Some(json!({"value":19}));
    supervisor
        .submit_managed(request.clone(), &system)
        .await
        .unwrap();
    let job = store.execution_job("parameters").await.unwrap().unwrap();
    let snapshot = serde_json::to_value(job.submission.snapshot).unwrap();
    assert_eq!(
        snapshot["program"]["call"]["arguments"],
        json!({"value":19})
    );
    assert!(supervisor.submit_managed(original, &system).await.is_err());
    drop(supervisor);
    drop(store);
    let reopened = SqliteStore::open(&dir.path().join("runtime.sqlite")).unwrap();
    assert_eq!(
        reopened
            .managed_run("parameters")
            .await
            .unwrap()
            .unwrap()
            .request
            .parameters,
        request.parameters
    );
    RunSupervisor::new(reopened)
        .execute_submitted(&registry, "parameters")
        .await
        .unwrap();
    assert_eq!(
        std::fs::read_to_string(dir.path().join("effects")).unwrap(),
        "effect\n"
    );
}
#[tokio::test]
async fn admission_is_atomic_idempotent_and_original_queue_fifo_survives_reopen() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, system) = setup(dir.path(), false);
    let supervisor = RunSupervisor::new(store.clone());
    let first = request(&system, "first");
    let accepted = supervisor
        .submit_managed(first.clone(), &system)
        .await
        .unwrap();
    assert_eq!(
        accepted.sequence,
        supervisor
            .submit_managed(first.clone(), &system)
            .await
            .unwrap()
            .sequence
    );
    let mut changed = first;
    changed.thread_id = "changed".into();
    assert!(supervisor.submit_managed(changed, &system).await.is_err());
    assert!(store.execution_job("changed").await.unwrap().is_none());
    supervisor
        .submit_managed(request(&system, "second"), &system)
        .await
        .unwrap();
    assert_eq!(store.runnable_managed(20).await.unwrap().len(), 1);
    assert!(
        supervisor
            .execute_submitted(&registry, "second")
            .await
            .unwrap()
            .is_none()
    );
    supervisor
        .execute_submitted(&registry, "first")
        .await
        .unwrap();
    drop(supervisor);
    drop(store);
    let (store, registry, _) = setup(dir.path(), false);
    let supervisor = RunSupervisor::new(store.clone());
    assert_eq!(
        store.runnable_managed(20).await.unwrap()[0].request.run_id,
        "second"
    );
    supervisor
        .execute_submitted(&registry, "first")
        .await
        .unwrap();
    supervisor
        .execute_submitted(&registry, "second")
        .await
        .unwrap();
    assert_eq!(
        std::fs::read_to_string(dir.path().join("effects")).unwrap(),
        "effect\neffect\n"
    );
    let all = store.managed_runs(0, 20).await.unwrap();
    assert_eq!(all.len(), 2);
    assert_eq!(
        store.managed_runs(all[0].sequence, 20).await.unwrap().len(),
        1
    );
}
#[tokio::test]
async fn persisted_resume_and_approval_keep_one_effect_and_command_receipt_after_reopen() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, system) = setup(dir.path(), true);
    let supervisor = RunSupervisor::new(store.clone());
    supervisor
        .submit_managed(request(&system, "approval"), &system)
        .await
        .unwrap();
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "approval")
            .await
            .unwrap(),
        Some(RunOutcome::Paused { .. })
    ));
    let approval = store.pending_approvals("approval").await.unwrap().remove(0);
    store.decide(&approval, true).await.unwrap();
    let command = ManagedAction {
        command_id: "resume-one".into(),
        run_id: "approval".into(),
        command: ManagedCommand::Resume,
    };
    let accepted = store.enqueue_managed_action(command.clone()).await.unwrap();
    assert!(!accepted.finished);
    assert_eq!(
        accepted.sequence,
        store
            .enqueue_managed_action(command.clone())
            .await
            .unwrap()
            .sequence
    );
    let mut conflicting = command;
    conflicting.command = ManagedCommand::ResumeAfterCancel { through: 1 };
    assert!(store.enqueue_managed_action(conflicting).await.is_err());
    drop(supervisor);
    drop(store);
    let (store, registry, _) = setup(dir.path(), true);
    let supervisor = RunSupervisor::new(store.clone());
    assert_eq!(store.pending_managed_actions(10).await.unwrap().len(), 1);
    let result = supervisor
        .execute_managed_action(&registry, "resume-one")
        .await
        .unwrap();
    assert!(result.finished);
    assert!(matches!(result.outcome, Some(RunOutcome::Completed { .. })));
    assert!(result.error.is_none());
    let events = store.events("approval", 0, 1000).await.unwrap().len();
    supervisor
        .execute_managed_action(&registry, "resume-one")
        .await
        .unwrap();
    assert_eq!(
        store.events("approval", 0, 1000).await.unwrap().len(),
        events
    );
    assert_eq!(
        std::fs::read_to_string(dir.path().join("effects")).unwrap(),
        "effect\n"
    );
}
#[tokio::test]
async fn invalid_release_and_unmanaged_id_never_create_management_metadata() {
    let dir = tempfile::tempdir().unwrap();
    let (store, _, system) = setup(dir.path(), false);
    let supervisor = RunSupervisor::new(store.clone());
    let mut invalid = request(&system, "invalid");
    invalid.release = "0".repeat(64);
    assert!(supervisor.submit_managed(invalid, &system).await.is_err());
    assert!(store.execution_job("invalid").await.unwrap().is_none());
    supervisor
        .submit_program(
            ProgramSubmission::for_program(
                system.program("append").unwrap(),
                "thread",
                "unmanaged",
                None,
            )
            .unwrap(),
        )
        .await
        .unwrap();
    assert!(
        supervisor
            .submit_managed(request(&system, "unmanaged"), &system)
            .await
            .is_err()
    );
    assert!(store.managed_run("unmanaged").await.unwrap().is_none());
    assert!(store.managed_runs(0, 0).await.is_err());
    assert!(store.pending_managed_actions(257).await.is_err());
}

struct TwoStepModel(Arc<std::sync::atomic::AtomicUsize>);
#[async_trait::async_trait]
impl Model for TwoStepModel {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.0.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
        let tools_done = request
            .messages
            .iter()
            .filter(|m| matches!(m, Message::Tool { .. }))
            .count();
        match tools_done {
            0 => Ok(ModelResponse {
                tool_calls: vec![ToolCall {
                    id: "call-step-1".into(),
                    name: "append".into(),
                    arguments: json!({"step": 1}),
                }],
                ..Default::default()
            }),
            1 => Ok(ModelResponse {
                tool_calls: vec![ToolCall {
                    id: "call-step-2".into(),
                    name: "append".into(),
                    arguments: json!({"step": 2}),
                }],
                ..Default::default()
            }),
            _ => Ok(ModelResponse {
                output: "all-steps-done".into(),
                ..Default::default()
            }),
        }
    }
}

#[tokio::test]
async fn managed_resume_non_closed_crash_before_action_result_is_atomic_and_replays_idempotently() {
    use std::sync::atomic::{AtomicUsize, Ordering};
    let dir = tempfile::tempdir().unwrap();
    let db_path = dir.path().join("runtime.sqlite");
    let effect_path = dir.path().join("effects");
    let model_calls = Arc::new(AtomicUsize::new(0));

    let build_env = |calls: Arc<AtomicUsize>| {
        let store = SqliteStore::open(&db_path).unwrap();
        let mut catalog = ToolCatalog::new();
        catalog
            .insert(ToolEntry::typed(Append(effect_path.clone())))
            .unwrap();
        let mut registry = ModuleRegistry::default();
        registry
            .register_factory(Arc::new(InstanceFactory::new(
                "tool.append",
                "1",
                ModuleInstance::ToolPack(catalog),
            )))
            .unwrap();
        registry
            .register_factory(Arc::new(InstanceFactory::new(
                "policy.approval",
                "1",
                ModuleInstance::Policy(Arc::new(DurableApprovalPolicy::new(store.clone()))),
            )))
            .unwrap();
        registry
            .register_factory(Arc::new(InstanceFactory::new(
                "model.two_step",
                "1",
                ModuleInstance::Model(Arc::new(TwoStepModel(calls))),
            )))
            .unwrap();
        registry
            .register_factory(Arc::new(InstanceFactory::new(
                "prompt.sys",
                "1",
                ModuleInstance::Prompt(Arc::new(StaticPrompt("system".into()))),
            )))
            .unwrap();
        let document = serde_json::from_value(json!({
            "schema_version": 1,
            "name": "two-step-managed",
            "modules": [
                {"reference": {"id": "tools", "version": "1"}, "factory": "tool.append", "config": {}},
                {"reference": {"id": "approval", "version": "1"}, "factory": "policy.approval", "config": {}},
                {"reference": {"id": "model", "version": "1"}, "factory": "model.two_step", "config": {}},
                {"reference": {"id": "prompt", "version": "1"}, "factory": "prompt.sys", "config": {}}
            ],
            "programs": {
                "agent": {
                    "kind": "agent",
                    "definition": {
                        "name": "two-step-agent",
                        "model": {"id": "model", "version": "1"},
                        "prompt": {"id": "prompt", "version": "1"},
                        "tool_packs": [{"id": "tools", "version": "1"}],
                        "policies": [{"id": "approval", "version": "1"}]
                    }
                }
            }
        }))
        .unwrap();
        let system = compile_system(document, &registry).unwrap();
        (store, registry, system)
    };

    let (store, registry, system) = build_env(model_calls.clone());
    let supervisor = RunSupervisor::new(store.clone());
    supervisor
        .submit_managed(
            ManagedRunRequest {
                approval_mode: None,
                run_id: "non-closed-run".into(),
                thread_id: "thread".into(),
                system: "two-step-managed".into(),
                release: system.bundle.digest.clone(),
                program: "agent".into(),
                input: Some(nofy_agent_runtime::PendingInterjection {
                    text: "start".into(),
                    attachments: vec![],
                }),
                parameters: None,
            },
            &system,
        )
        .await
        .unwrap();

    // First execution pauses at approval 1.
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "non-closed-run")
            .await
            .unwrap(),
        Some(RunOutcome::Paused { .. })
    ));
    assert_eq!(model_calls.load(Ordering::SeqCst), 1);
    assert!(!effect_path.exists());

    let approval_1 = store
        .pending_approvals("non-closed-run")
        .await
        .unwrap()
        .remove(0);
    assert_eq!(approval_1.call.id, "call-step-1");
    store.decide(&approval_1, true).await.unwrap();
    store
        .enqueue_managed_action(ManagedAction {
            command_id: "resume-step-1".into(),
            run_id: "non-closed-run".into(),
            command: ManagedCommand::Resume,
        })
        .await
        .unwrap();

    // Inject a fault at the managed_actions result write. Because finish_run and
    // managed_actions.result now commit in a single transaction, both roll back atomically.
    let raw = rusqlite::Connection::open(store.path().unwrap()).unwrap();
    raw.execute_batch(
        "CREATE TRIGGER fail_action_result
         BEFORE UPDATE OF result ON agent_runtime_managed_actions
         WHEN NEW.command_id = 'resume-step-1' AND NEW.result IS NOT NULL
         BEGIN
             SELECT RAISE(ABORT, 'simulated crash before action result');
         END;",
    )
    .unwrap();
    let failed = supervisor
        .execute_managed_action(&registry, "resume-step-1")
        .await;
    assert!(
        matches!(failed, Err(Error::Checkpoint(_))),
        "expected atomic transaction rollback on action result failure: {failed:?}"
    );
    assert_eq!(std::fs::read_to_string(&effect_path).unwrap(), "effect\n");
    assert_eq!(model_calls.load(Ordering::SeqCst), 2);
    assert!(
        !store
            .managed_action("resume-step-1")
            .await
            .unwrap()
            .unwrap()
            .finished
    );
    // finish_run must NOT have committed ahead of managed_actions.result.
    assert_eq!(
        store
            .execution_record("non-closed-run")
            .await
            .unwrap()
            .unwrap()
            .status,
        "running"
    );

    // Clear fault, reopen store, and replay: settles non-Closed Paused receipt with zero re-execution.
    raw.execute_batch("DROP TRIGGER fail_action_result;")
        .unwrap();
    drop(raw);
    drop(supervisor);
    drop(store);

    let (store, registry, _) = build_env(model_calls.clone());
    let supervisor = RunSupervisor::new(store.clone());
    let replayed = supervisor
        .execute_managed_action(&registry, "resume-step-1")
        .await
        .unwrap();
    assert!(
        replayed.finished && replayed.error.is_none(),
        "{replayed:?}"
    );
    assert!(matches!(replayed.outcome, Some(RunOutcome::Paused { .. })));
    assert!(matches!(
        store
            .execution_job("non-closed-run")
            .await
            .unwrap()
            .unwrap()
            .status,
        JobStatus::Waiting
    ));
    assert_eq!(std::fs::read_to_string(&effect_path).unwrap(), "effect\n");
    assert_eq!(model_calls.load(Ordering::SeqCst), 2);

    // Also verify replay when result is manually cleared on a non-Closed (Waiting) run.
    let raw = rusqlite::Connection::open(store.path().unwrap()).unwrap();
    raw.execute(
        "UPDATE agent_runtime_managed_actions SET result = NULL WHERE command_id = 'resume-step-1'",
        [],
    )
    .unwrap();
    drop(raw);
    let backfilled = supervisor
        .execute_managed_action(&registry, "resume-step-1")
        .await
        .unwrap();
    assert!(
        backfilled.finished && backfilled.error.is_none(),
        "{backfilled:?}"
    );
    assert!(matches!(
        backfilled.outcome,
        Some(RunOutcome::Paused { .. })
    ));
    assert_eq!(std::fs::read_to_string(&effect_path).unwrap(), "effect\n");
    assert_eq!(model_calls.load(Ordering::SeqCst), 2);

    // Approving step 2 finishes cleanly with exactly 2 effects total.
    let approval_2 = store
        .pending_approvals("non-closed-run")
        .await
        .unwrap()
        .remove(0);
    assert_eq!(approval_2.call.id, "call-step-2");
    store.decide(&approval_2, true).await.unwrap();
    store
        .enqueue_managed_action(ManagedAction {
            command_id: "resume-step-2".into(),
            run_id: "non-closed-run".into(),
            command: ManagedCommand::Resume,
        })
        .await
        .unwrap();
    let final_receipt = supervisor
        .execute_managed_action(&registry, "resume-step-2")
        .await
        .unwrap();
    assert!(
        final_receipt.finished && final_receipt.error.is_none(),
        "{final_receipt:?}"
    );
    assert!(matches!(
        final_receipt.outcome,
        Some(RunOutcome::Completed { ref output, .. }) if output == "all-steps-done"
    ));
    assert_eq!(
        std::fs::read_to_string(&effect_path).unwrap(),
        "effect\neffect\n"
    );
    assert_eq!(model_calls.load(Ordering::SeqCst), 3);
}

#[tokio::test]
#[cfg(feature = "workflow")]
async fn managed_human_non_closed_crash_before_action_result_replays_without_duplicate_effect() {
    let dir = tempfile::tempdir().unwrap();
    let db_path = dir.path().join("runtime.sqlite");
    let effect_path = dir.path().join("effects");

    let build_env = || {
        let store = SqliteStore::open(&db_path).unwrap();
        let mut catalog = ToolCatalog::new();
        catalog
            .insert(ToolEntry::typed(Append(effect_path.clone())))
            .unwrap();
        let mut registry = ModuleRegistry::default();
        registry
            .register_factory(Arc::new(InstanceFactory::new(
                "tool.append",
                "1",
                ModuleInstance::ToolPack(catalog),
            )))
            .unwrap();
        let reference = ModuleRef::new("main", "1");
        let document = serde_json::from_value(json!({
            "schema_version": 1,
            "name": "two-human-managed",
            "modules": [{"reference": reference, "factory": "tool.append", "config": {}}],
            "programs": {
                "review": {
                    "kind": "workflow",
                    "input": {},
                    "document": {
                        "host": {"name": "review-host"},
                        "entry": reference,
                        "tool_runtimes": [{
                            "reference": reference,
                            "definition": {"name": "effects", "tool_packs": [reference]}
                        }],
                        "workflows": [{
                            "reference": reference,
                            "input_schema": true,
                            "output_schema": true,
                            "nodes": [
                                {
                                    "id": "human_one",
                                    "input": {"from": "literal", "value": {"question": "step-1"}},
                                    "action": {"kind": "human", "response_schema": {"type": "boolean"}}
                                },
                                {
                                    "id": "effect_one",
                                    "needs": ["human_one"],
                                    "input": {"from": "literal", "value": {}},
                                    "action": {"kind": "tool", "runtime": reference, "tool": "append"}
                                },
                                {
                                    "id": "human_two",
                                    "needs": ["effect_one"],
                                    "input": {"from": "literal", "value": {"question": "step-2"}},
                                    "action": {"kind": "human", "response_schema": {"type": "boolean"}}
                                }
                            ],
                            "output": {"from": "node", "node": "human_two", "pointer": ""}
                        }]
                    }
                }
            }
        }))
        .unwrap();
        let system = compile_system(document, &registry).unwrap();
        (store, registry, system)
    };

    let (store, registry, system) = build_env();
    let supervisor = RunSupervisor::new(store.clone());
    supervisor
        .submit_managed(
            ManagedRunRequest {
                approval_mode: None,
                run_id: "human-non-closed".into(),
                thread_id: "thread".into(),
                system: "two-human-managed".into(),
                release: system.bundle.digest.clone(),
                program: "review".into(),
                input: None,
                parameters: None,
            },
            &system,
        )
        .await
        .unwrap();
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "human-non-closed")
            .await
            .unwrap(),
        Some(RunOutcome::Paused { .. })
    ));

    let human_one = store
        .children("human-non-closed")
        .await
        .unwrap()
        .into_iter()
        .find(|c| c.node_id.as_deref() == Some("human_one"))
        .unwrap();
    store
        .enqueue_managed_action(ManagedAction {
            command_id: "answer-one".into(),
            run_id: "human-non-closed".into(),
            command: ManagedCommand::Human {
                target_run_id: human_one.run_id,
                workflow_path: vec![],
                expected_request: json!({"question": "step-1"}),
                value: json!(true),
            },
        })
        .await
        .unwrap();

    let raw = rusqlite::Connection::open(store.path().unwrap()).unwrap();
    raw.execute_batch(
        "CREATE TRIGGER fail_human_action_result
         BEFORE UPDATE OF result ON agent_runtime_managed_actions
         WHEN NEW.command_id = 'answer-one' AND NEW.result IS NOT NULL
         BEGIN
             SELECT RAISE(ABORT, 'simulated crash before human action result');
         END;",
    )
    .unwrap();
    assert!(matches!(
        supervisor
            .execute_managed_action(&registry, "answer-one")
            .await,
        Err(Error::Checkpoint(_))
    ));
    assert_eq!(std::fs::read_to_string(&effect_path).unwrap(), "effect\n");
    assert!(
        !store
            .managed_action("answer-one")
            .await
            .unwrap()
            .unwrap()
            .finished
    );

    raw.execute_batch("DROP TRIGGER fail_human_action_result;")
        .unwrap();
    drop(raw);
    drop(supervisor);
    drop(store);

    let (store, registry, _) = build_env();
    let supervisor = RunSupervisor::new(store.clone());
    let replayed = supervisor
        .execute_managed_action(&registry, "answer-one")
        .await
        .unwrap();
    assert!(
        replayed.finished && replayed.error.is_none(),
        "{replayed:?}"
    );
    assert!(matches!(replayed.outcome, Some(RunOutcome::Paused { .. })));
    assert_eq!(std::fs::read_to_string(&effect_path).unwrap(), "effect\n");

    let human_two = store
        .children("human-non-closed")
        .await
        .unwrap()
        .into_iter()
        .find(|c| c.node_id.as_deref() == Some("human_two"))
        .unwrap();
    store
        .enqueue_managed_action(ManagedAction {
            command_id: "answer-two".into(),
            run_id: "human-non-closed".into(),
            command: ManagedCommand::Human {
                target_run_id: human_two.run_id,
                workflow_path: vec![],
                expected_request: json!({"question": "step-2"}),
                value: json!(true),
            },
        })
        .await
        .unwrap();
    let done = supervisor
        .execute_managed_action(&registry, "answer-two")
        .await
        .unwrap();
    assert!(done.finished && done.error.is_none(), "{done:?}");
    assert!(matches!(done.outcome, Some(RunOutcome::Completed { .. })));
    assert_eq!(std::fs::read_to_string(&effect_path).unwrap(), "effect\n");
}

#[tokio::test]
async fn managed_run_capacity_prunes_oldest_settled_terminal_runs_and_protects_active() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, system) = setup(dir.path(), false);
    let physical = store.path().unwrap();
    let supervisor = RunSupervisor::new(store.clone());

    // Subcase A: 10,000 active (queued) managed runs must still reject at capacity.
    {
        let raw = rusqlite::Connection::open(&physical).unwrap();
        raw.busy_timeout(std::time::Duration::from_secs(5)).unwrap();
        let tx = raw.unchecked_transaction().unwrap();
        {
            let mut job_stmt = tx
                .prepare(
                    "INSERT INTO agent_runtime_jobs(run_id, thread_key, digest, payload, status)
                     VALUES(?1, ?2, 'd', '{}', 'queued')",
                )
                .unwrap();
            let mut run_stmt = tx
                .prepare(
                    "INSERT INTO agent_runtime_managed_runs(run_id, digest, payload)
                     VALUES(?1, 'd', '{}')",
                )
                .unwrap();
            for i in 0..10_000u64 {
                let run_id = format!("active-cap-{i}");
                let thread_key = format!("thread-cap-{i}");
                job_stmt
                    .execute(rusqlite::params![&run_id, &thread_key])
                    .unwrap();
                run_stmt.execute([&run_id]).unwrap();
            }
        }
        tx.commit().unwrap();
    }

    let full_err = supervisor
        .submit_managed(request(&system, "blocked-by-active"), &system)
        .await
        .unwrap_err();
    assert!(
        full_err
            .to_string()
            .contains("managed run capacity exceeded"),
        "expected capacity error when all runs are active, got: {full_err}"
    );

    // Subcase B: fresh store with 4 protected runs at the oldest sequences + 9,996 settled terminal runs.
    let dir2 = tempfile::tempdir().unwrap();
    let (store2, registry2, system2) = setup(dir2.path(), false);
    let physical2 = store2.path().unwrap();
    let supervisor2 = RunSupervisor::new(store2.clone());
    let future_lease_ms = store2.now_ms() + 600_000;

    {
        let raw = rusqlite::Connection::open(&physical2).unwrap();
        raw.busy_timeout(std::time::Duration::from_secs(5)).unwrap();
        let tx = raw.unchecked_transaction().unwrap();
        {
            let mut job_stmt = tx
                .prepare(
                    "INSERT INTO agent_runtime_jobs(run_id, thread_key, digest, payload, status)
                     VALUES(?1, ?2, 'd', '{}', ?3)",
                )
                .unwrap();
            let mut run_stmt = tx
                .prepare(
                    "INSERT INTO agent_runtime_managed_runs(run_id, digest, payload)
                     VALUES(?1, 'd', '{}')",
                )
                .unwrap();
            // 1: active running
            job_stmt
                .execute(rusqlite::params!["keep-running", "tk-running", "running"])
                .unwrap();
            run_stmt.execute(["keep-running"]).unwrap();
            // 2: closed run that still has an unsettled managed action
            job_stmt
                .execute(rusqlite::params![
                    "keep-pending-action",
                    "tk-pending-action",
                    "closed"
                ])
                .unwrap();
            run_stmt.execute(["keep-pending-action"]).unwrap();
            tx.execute(
                "INSERT INTO agent_runtime_managed_actions(command_id, run_id, digest, payload, result)
                 VALUES('unsettled-act', 'keep-pending-action', 'd', '{}', NULL)",
                [],
            )
            .unwrap();
            // 3: failed run with pending work in its active checkpoint (needs reconciliation)
            job_stmt
                .execute(rusqlite::params![
                    "keep-failed-pending",
                    "tk-failed-pending",
                    "failed"
                ])
                .unwrap();
            run_stmt.execute(["keep-failed-pending"]).unwrap();
            tx.execute(
                "INSERT INTO agent_runtime_threads(key, active_run) VALUES('tk-failed-pending', 'keep-failed-pending')",
                [],
            )
            .unwrap();
            let mut pending_state = RunState::default();
            pending_state.pending_tools.push_back(ToolCall {
                id: "tc-1".into(),
                name: "append".into(),
                arguments: json!({}),
            });
            let pending_cp = Checkpoint {
                version: 1,
                revision: 1,
                composition: "c".into(),
                state: pending_state,
            };
            tx.execute(
                "INSERT INTO agent_runtime_checkpoints(key, revision, payload) VALUES('tk-failed-pending', 1, ?1)",
                [serde_json::to_string(&pending_cp).unwrap()],
            )
            .unwrap();
            // 4: closed run with active lease on its thread
            job_stmt
                .execute(rusqlite::params!["keep-leased", "tk-leased", "closed"])
                .unwrap();
            run_stmt.execute(["keep-leased"]).unwrap();
            tx.execute(
                "INSERT INTO agent_runtime_leases(key, owner, fence, expires_ms) VALUES('tk-leased', 'w', 1, ?1)",
                [future_lease_ms as i64],
            )
            .unwrap();

            // 5..=10,000: settled terminal runs across closed/cancelled/abandoned/clean failed
            let statuses = ["closed", "cancelled", "abandoned", "failed"];
            for i in 0..9_996usize {
                let run_id = format!("terminal-{i:05}");
                let thread_key = format!("tk-term-{i:05}");
                let status = statuses[i % statuses.len()];
                job_stmt
                    .execute(rusqlite::params![&run_id, &thread_key, status])
                    .unwrap();
                run_stmt.execute([&run_id]).unwrap();
            }
        }
        tx.commit().unwrap();
    }

    // Submitting past 10,000 must succeed by pruning the oldest settled batch while preserving all 4 protected runs.
    let mut fresh = request(&system2, "fresh-after-gc");
    fresh.thread_id = "fresh-thread".into();
    supervisor2.submit_managed(fresh, &system2).await.unwrap();
    let outcome = supervisor2
        .execute_submitted(&registry2, "fresh-after-gc")
        .await
        .unwrap();
    assert!(matches!(outcome, Some(RunOutcome::Completed { .. })));

    let raw = rusqlite::Connection::open(&physical2).unwrap();
    raw.busy_timeout(std::time::Duration::from_secs(5)).unwrap();
    for protected in [
        "keep-running",
        "keep-pending-action",
        "keep-failed-pending",
        "keep-leased",
        "fresh-after-gc",
        "terminal-09995",
    ] {
        let exists: bool = raw
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM agent_runtime_managed_runs WHERE run_id=?1)",
                [protected],
                |r| r.get(0),
            )
            .unwrap();
        assert!(exists, "expected run `{protected}` to survive GC");
    }
    let oldest_pruned: bool = raw
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM agent_runtime_managed_runs WHERE run_id='terminal-00000')",
            [],
            |r| r.get(0),
        )
        .unwrap();
    assert!(!oldest_pruned, "oldest settled terminal run must be pruned");
    let total: u64 = raw
        .query_row("SELECT COUNT(*) FROM agent_runtime_managed_runs", [], |r| {
            r.get(0)
        })
        .unwrap();
    assert!(
        total < 10_000,
        "rolling GC should reclaim a batch, total={total}"
    );
    drop(raw);

    // Rolling submission of 300 more runs past the pruned window must continue seamlessly.
    for i in 0..300u64 {
        let mut req = request(&system2, &format!("rolling-{i}"));
        req.thread_id = format!("rolling-thread-{i}");
        supervisor2.submit_managed(req, &system2).await.unwrap();
    }
    let _ = registry;
}

#[tokio::test]
async fn managed_action_capacity_prunes_settled_and_rejects_when_all_pending() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, system) = setup(dir.path(), true);
    let physical = store.path().unwrap();
    let supervisor = RunSupervisor::new(store.clone());

    supervisor
        .submit_managed(request(&system, "action-cap-run"), &system)
        .await
        .unwrap();
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "action-cap-run")
            .await
            .unwrap(),
        Some(RunOutcome::Paused { .. })
    ));

    // Seed 32,768 unsettled actions -> enqueue must fail closed.
    {
        let raw = rusqlite::Connection::open(&physical).unwrap();
        raw.busy_timeout(std::time::Duration::from_secs(5)).unwrap();
        let tx = raw.unchecked_transaction().unwrap();
        {
            let mut stmt = tx
                .prepare(
                    "INSERT INTO agent_runtime_managed_actions(command_id, run_id, digest, payload, result)
                     VALUES(?1, 'action-cap-run', 'd', '{}', NULL)",
                )
                .unwrap();
            for i in 0..32_768u64 {
                stmt.execute([format!("act-{i:05}")]).unwrap();
            }
        }
        tx.commit().unwrap();
    }

    let err = store
        .enqueue_managed_action(ManagedAction {
            command_id: "blocked-action".into(),
            run_id: "action-cap-run".into(),
            command: ManagedCommand::Resume,
        })
        .await
        .unwrap_err();
    assert!(
        err.to_string()
            .contains("management command capacity exceeded"),
        "expected capacity error when all actions are pending, got: {err}"
    );

    // Settle actions 10..1010 while leaving 0..10 and 1010..32768 unsettled.
    {
        let raw = rusqlite::Connection::open(&physical).unwrap();
        raw.busy_timeout(std::time::Duration::from_secs(5)).unwrap();
        raw.execute(
            "UPDATE agent_runtime_managed_actions
             SET result = '{\"outcome\":null,\"error\":null}'
             WHERE sequence > 10 AND sequence <= 1010",
            [],
        )
        .unwrap();
    }

    let admitted = store
        .enqueue_managed_action(ManagedAction {
            command_id: "admitted-after-gc".into(),
            run_id: "action-cap-run".into(),
            command: ManagedCommand::Resume,
        })
        .await
        .unwrap();
    assert_eq!(admitted.action.command_id, "admitted-after-gc");

    let raw = rusqlite::Connection::open(&physical).unwrap();
    raw.busy_timeout(std::time::Duration::from_secs(5)).unwrap();
    let pending_remaining: u64 = raw
        .query_row(
            "SELECT COUNT(*) FROM agent_runtime_managed_actions WHERE result IS NULL",
            [],
            |r| r.get(0),
        )
        .unwrap();
    assert_eq!(
        pending_remaining,
        32_768 - 1_000 + 1,
        "all unsettled actions must remain intact"
    );
    let oldest_pending_kept: bool = raw
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM agent_runtime_managed_actions WHERE command_id='act-00000')",
            [],
            |r| r.get(0),
        )
        .unwrap();
    assert!(
        oldest_pending_kept,
        "oldest pending action must never be pruned"
    );
    let oldest_settled_pruned: bool = raw
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM agent_runtime_managed_actions WHERE command_id='act-00010')",
            [],
            |r| r.get(0),
        )
        .unwrap();
    assert!(
        !oldest_settled_pruned,
        "oldest settled action must be pruned"
    );
}
