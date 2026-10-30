use super::*;
use crate::{
    Message, Model, ModelRequest, ModelResponse, ToolCatalog, ToolEntry, registry::*,
    supervisor::jobs::*, system::*,
};
use serde_json::{Value, json};
use std::sync::atomic::{AtomicUsize, Ordering};

struct Effect {
    path: std::path::PathBuf,
    started: Arc<tokio::sync::Notify>,
}
impl nofy_tool_runtime::Tool for Effect {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("effect").unwrap()
    }
    fn description(
        &self,
        _: &nofy_tool_runtime::ListToolsContext,
    ) -> nofy_tool_types::ToolDescription {
        nofy_tool_types::ToolDescription::new("effect", "Durable effect before a lost response")
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
            .open(&self.path)
            .unwrap();
        file.write_all(b"effect\n").unwrap();
        file.sync_all().unwrap();
        self.started.notify_one();
        std::future::pending().await
    }
}
struct ModelWithTool(Arc<AtomicUsize>);
#[async_trait::async_trait]
impl Model for ModelWithTool {
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
                    output: "settled".into(),
                    ..Default::default()
                }
            } else {
                ModelResponse {
                    tool_calls: vec![ToolCall {
                        id: "effect-1".into(),
                        name: "effect".into(),
                        arguments: json!({}),
                    }],
                    ..Default::default()
                }
            },
        )
    }
}
fn setup(
    path: &std::path::Path,
    started: Arc<tokio::sync::Notify>,
    calls: Arc<AtomicUsize>,
    agent: bool,
) -> (ModuleRegistry, CompiledSystem) {
    let mut catalog = ToolCatalog::new();
    catalog
        .insert(ToolEntry::typed(Effect {
            path: path.to_owned(),
            started,
        }))
        .unwrap();
    let mut registry = ModuleRegistry::default();
    for (name, instance) in [
        ("tool.effect", ModuleInstance::ToolPack(catalog)),
        (
            "model.calls",
            ModuleInstance::Model(Arc::new(ModelWithTool(calls))),
        ),
        (
            "prompt.text",
            ModuleInstance::Prompt(Arc::new(crate::StaticPrompt("Act".into()))),
        ),
    ] {
        registry
            .register_factory(Arc::new(InstanceFactory::new(name, "1", instance)))
            .unwrap();
    }
    let r = |id: &str| json!({"id":id,"version":"1"});
    let mut document = json!({"schema_version":1,"name":"root-system","modules":[{"reference":r("effect"),"factory":"tool.effect","config":{}}],"programs":{"main":{"kind":"tool","definition":{"name":"effect-root","tool_packs":[r("effect")]},"call":{"id":"effect-1","name":"effect","arguments":{}}}}});
    if agent {
        document["modules"].as_array_mut().unwrap().extend([
            json!({"reference":r("model"),"factory":"model.calls","config":{}}),
            json!({"reference":r("prompt"),"factory":"prompt.text","config":{}}),
        ]);
        document["programs"]["main"] = json!({"kind":"agent","definition":{"name":"effect-root","model":r("model"),"prompt":r("prompt"),"tool_packs":[r("effect")]}});
    }
    let system = compile_system(serde_json::from_value(document).unwrap(), &registry).unwrap();
    (registry, system)
}
#[tokio::test]
async fn root_evidence_survives_acceptance_and_final_ack_loss_for_agent_and_tool() {
    for agent in [false, true] {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("effects");
        let db = dir.path().join("runtime.sqlite");
        let started = Arc::new(tokio::sync::Notify::new());
        let calls = Arc::new(AtomicUsize::new(0));
        let (registry, system) = setup(&path, started.clone(), calls.clone(), agent);
        let store = SqliteStore::open(&db).unwrap();
        let supervisor = RunSupervisor::new(store.clone())
            .with_lease_ttl(Duration::from_secs(2))
            .unwrap();
        supervisor
            .submit_managed(
                ManagedRunRequest {
                    run_id: "root".into(),
                    thread_id: "thread".into(),
                    system: "root-system".into(),
                    release: system.bundle.digest.clone(),
                    program: "main".into(),
                    input: agent.then(|| nofy_interjection_core::PendingInterjection {
                        text: "act".into(),
                        attachments: vec![],
                    }),
                    parameters: None,
                },
                &system,
            )
            .await
            .unwrap();
        {
            let executing = supervisor.execute_submitted(&registry, "root");
            tokio::pin!(executing);
            tokio::select! {
                result=&mut executing=>panic!("effect should still be waiting: {result:?}"),
                _=started.notified()=>{},
                _=tokio::time::sleep(Duration::from_secs(10))=>panic!("effect was not reached"),
            }
        }
        tokio::time::sleep(Duration::from_millis(2100)).await;
        let target = store.root_recovery_target("root").await.unwrap().unwrap();
        let receipt = RootToolReconciliation {
            model_sequence: target.model_sequence,
            call: target.call,
            result: json!({"recorded":true}),
            is_error: !agent,
        };
        let action = ManagedAction {
            command_id: "evidence".into(),
            run_id: "root".into(),
            command: ManagedCommand::ReconcileRootTool {
                receipt: receipt.clone(),
            },
        };
        store.enqueue_managed_action(action.clone()).await.unwrap();
        let program = system.program("main").unwrap();
        let plan = ExecutionPlan::program(program);
        let lease = store
            .acquire(
                plan.agent.checkpoint_key("thread"),
                "accept-before-exit",
                Duration::from_secs(30),
            )
            .await
            .unwrap();
        supervisor
            .accept_root_tool_reconciliation_leased(
                &plan,
                &RunContext::new("thread", "root"),
                receipt,
                &lease,
            )
            .await
            .unwrap();
        store.release(&lease).await.unwrap();
        drop(supervisor);
        drop(store);
        let store = SqliteStore::open(&db).unwrap();
        let supervisor = RunSupervisor::new(store.clone());
        let settled = supervisor
            .execute_managed_action(&registry, "evidence")
            .await
            .unwrap();
        assert!(settled.finished && settled.error.is_none(), "{settled:?}");
        assert!(
            matches!(settled.outcome, Some(RunOutcome::Completed { .. })),
            "{settled:?}"
        );
        assert_eq!(std::fs::read_to_string(&path).unwrap(), "effect\n");
        assert_eq!(calls.load(Ordering::SeqCst), if agent { 2 } else { 0 });
        store.transaction(|tx| {tx.execute("UPDATE agent_runtime_managed_actions SET result=NULL WHERE command_id='evidence'",[]).map_err(db_error)?;Ok(())}).await.unwrap();
        drop(supervisor);
        drop(store);
        let store = SqliteStore::open(&db).unwrap();
        let supervisor = RunSupervisor::new(store.clone());
        let replay = supervisor
            .execute_managed_action(&registry, "evidence")
            .await
            .unwrap();
        assert!(replay.finished && replay.error.is_none(), "{replay:?}");
        assert_eq!(std::fs::read_to_string(&path).unwrap(), "effect\n");
        assert_eq!(calls.load(Ordering::SeqCst), if agent { 2 } else { 0 });
        if agent {
            supervisor
                .submit_managed(
                    ManagedRunRequest {
                        run_id: "next".into(),
                        thread_id: "thread".into(),
                        system: "root-system".into(),
                        release: system.bundle.digest.clone(),
                        program: "main".into(),
                        input: Some(nofy_interjection_core::PendingInterjection {
                            text: "next turn".into(),
                            attachments: vec![],
                        }),
                        parameters: None,
                    },
                    &system,
                )
                .await
                .unwrap();
            assert!(matches!(
                supervisor
                    .execute_submitted(&registry, "next")
                    .await
                    .unwrap(),
                Some(RunOutcome::Completed { .. })
            ));
            assert!(store.root_recovery_target("root").await.unwrap().is_none());
            let mut stale = action;
            stale.command_id = "old-root-new-command".into();
            store.enqueue_managed_action(stale).await.unwrap();
            let rejected = supervisor
                .execute_managed_action(&registry, "old-root-new-command")
                .await
                .unwrap();
            assert!(rejected.error.is_some(), "{rejected:?}");
            assert_eq!(std::fs::read_to_string(&path).unwrap(), "effect\n");
            assert_eq!(calls.load(Ordering::SeqCst), 3);
        }
    }
}
