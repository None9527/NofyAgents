use super::*;
use crate::{ToolCatalog, ToolEntry, system::*};
use serde_json::{Value, json};
struct Append(std::path::PathBuf);
impl nofy_tool_runtime::Tool for Append {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("append").unwrap()
    }
    fn description(
        &self,
        _: &nofy_tool_runtime::ListToolsContext,
    ) -> nofy_tool_types::ToolDescription {
        nofy_tool_types::ToolDescription::new("append", "Persist one real effect")
    }
    async fn run(
        &self,
        _: nofy_tool_runtime::ToolCallContext,
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
fn setup(path: &std::path::Path) -> (ModuleRegistry, CompiledSystem) {
    let mut catalog = ToolCatalog::new();
    catalog
        .insert(ToolEntry::typed(Append(path.to_owned())))
        .unwrap();
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(crate::registry::InstanceFactory::new(
            "tool.append",
            "1",
            ModuleInstance::ToolPack(catalog),
        )))
        .unwrap();
    let reference = ModuleRef::new("main", "1");
    let document = serde_json::from_value(json!({"schema_version":1,"name":"lost-human-ack","modules":[{"reference":reference,"factory":"tool.append","config":{}}],"programs":{"review":{"kind":"workflow","input":{},"document":{
        "host":{"name":"review-host"},"entry":reference,"tool_runtimes":[{"reference":reference,"definition":{"name":"effects","tool_packs":[reference]}}],"workflows":[{
            "reference":reference,"input_schema":true,"output_schema":true,"nodes":[
                {"id":"human","input":{"from":"literal","value":{"question":"continue"}},"action":{"kind":"human","response_schema":{"type":"boolean"}}},
                {"id":"effect","needs":["human"],"input":{"from":"literal","value":{}},"action":{"kind":"tool","runtime":reference,"tool":"append"}}
            ],"output":{"from":"node","node":"effect"}
        }]
    }}}})).unwrap();
    let system = compile_system(document, &registry).unwrap();
    (registry, system)
}
#[tokio::test]
async fn accepted_human_decision_and_lost_final_action_ack_replay_without_repeating_effect() {
    let dir = tempfile::tempdir().unwrap();
    let database = dir.path().join("runtime.sqlite");
    let effect = dir.path().join("effects");
    let (registry, system) = setup(&effect);
    let store = SqliteStore::open(&database).unwrap();
    let supervisor = RunSupervisor::new(store.clone());
    let request = ManagedRunRequest {
        run_id: "root".into(),
        thread_id: "thread".into(),
        system: "lost-human-ack".into(),
        release: system.bundle.digest.clone(),
        program: "review".into(),
        input: None,
        parameters: None,
    };
    supervisor.submit_managed(request, &system).await.unwrap();
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "root")
            .await
            .unwrap(),
        Some(RunOutcome::Paused { .. })
    ));
    let target = store
        .children("root")
        .await
        .unwrap()
        .into_iter()
        .find(|c| c.kind.as_deref() == Some("workflow_human"))
        .unwrap();
    let action = ManagedAction {
        command_id: "human-answer".into(),
        run_id: "root".into(),
        command: ManagedCommand::Human {
            target_run_id: target.run_id,
            workflow_path: vec![],
            expected_request: json!({"question":"continue"}),
            value: json!(true),
        },
    };
    store.enqueue_managed_action(action.clone()).await.unwrap();
    let job = store.execution_job("root").await.unwrap().unwrap();
    let plan = job.submission.restore(&registry).unwrap();
    let workflow = prepare(&plan.snapshot, &action.command, &registry)
        .await
        .unwrap()
        .unwrap();
    let lease = store
        .acquire(
            job.submission.thread_key(),
            "decision-before-exit",
            std::time::Duration::from_secs(30),
        )
        .await
        .unwrap();
    respond(&supervisor, &plan, &job, &lease, &action, workflow)
        .await
        .unwrap();
    store.release(&lease).await.unwrap();
    assert!(!effect.exists());
    drop(supervisor);
    drop(store);
    let reopened = SqliteStore::open(&database).unwrap();
    let supervisor = RunSupervisor::new(reopened.clone());
    let receipt = supervisor
        .execute_managed_action(&registry, "human-answer")
        .await
        .unwrap();
    assert!(receipt.finished && receipt.error.is_none(), "{receipt:?}");
    assert!(matches!(
        receipt.outcome,
        Some(RunOutcome::Completed { .. })
    ));
    assert_eq!(std::fs::read_to_string(&effect).unwrap(), "effect\n");
    // Fault injection at the acknowledgement boundary: runtime/graph receipts
    // remain durable while the last management acknowledgement is absent.
    reopened.transaction(|tx| {
        tx.execute("UPDATE agent_runtime_managed_actions SET result=NULL WHERE command_id='human-answer'", []).map_err(db_error)?;
        Ok(())
    }).await.unwrap();
    drop(supervisor);
    drop(reopened);
    let supervisor = RunSupervisor::new(SqliteStore::open(&database).unwrap());
    let replay = supervisor
        .execute_managed_action(&registry, "human-answer")
        .await
        .unwrap();
    assert!(replay.finished && replay.error.is_none(), "{replay:?}");
    assert_eq!(std::fs::read_to_string(effect).unwrap(), "effect\n");
}
