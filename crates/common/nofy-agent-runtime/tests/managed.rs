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
