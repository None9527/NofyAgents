use super::*;
use crate::{
    Model, ModelRequest, ModelResponse, governance::*, registry::*, supervisor::jobs::*, system::*,
};
use serde_json::json;

struct EffectModel {
    path: std::path::PathBuf,
    started: Arc<tokio::sync::Notify>,
}
#[async_trait::async_trait]
impl Model for EffectModel {
    async fn request_bound(
        &self,
        _: &ModelRequest,
        _: &RunContext,
    ) -> Result<crate::model::ModelRequestBound, Error> {
        Ok(crate::model::ModelRequestBound {
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
        if request
            .messages
            .iter()
            .any(|m| matches!(m,crate::Message::User {content} if content=="next turn"))
        {
            return Ok(ModelResponse {
                output: "next turn completed".into(),
                input_tokens: 3,
                output_tokens: 2,
                ..Default::default()
            });
        }
        use std::io::Write;
        let mut file = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.path)
            .unwrap();
        file.write_all(b"model\n").unwrap();
        file.sync_all().unwrap();
        self.started.notify_one();
        std::future::pending().await
    }
}
fn setup(
    store: &SqliteStore,
    path: &std::path::Path,
    started: Arc<tokio::sync::Notify>,
    unmetered: bool,
) -> (ModuleRegistry, CompiledSystem, Option<BudgetScope>) {
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "model.wait",
            "1",
            ModuleInstance::Model(Arc::new(EffectModel {
                path: path.to_owned(),
                started,
            })),
        )))
        .unwrap();
    registry
        .register_factory(Arc::new(StaticPromptFactory))
        .unwrap();
    registry
        .register_factory(Arc::new(crate::model_journal::ModelJournalFactory))
        .unwrap();
    registry
        .register_factory(Arc::new(
            declarative::BudgetResourceFactory::new(
                Arc::new(store.clone()),
                "evidence-budget",
                BudgetLimits::default(),
                1,
            )
            .unwrap(),
        ))
        .unwrap();
    registry
        .register_factory(Arc::new(declarative::ConnectedBudgetFactory))
        .unwrap();
    let r = |id: &str| json!({"id":id,"version":"1"});
    let mut document = json!({"schema_version":1,"name":"proof-system","required_governance":[r("quota")],"modules":[
        {"reference":r("model"),"factory":"model.wait","config":{}},
        {"reference":r("prompt"),"factory":"prompt.static","config":{"text":"act"}},
        {"reference":r("ledger"),"factory":"resource.budget","config":{}},
        {"reference":r("quota"),"factory":"governance.budget_connected","config":{"limits":{"max_model_calls":1}},"dependencies":{"budget":r("ledger")}}
    ],"programs":{"chat":{"kind":"agent","definition":{"name":"proof-agent","model":r("model"),"prompt":r("prompt")}}}});
    if unmetered {
        document
            .as_object_mut()
            .unwrap()
            .remove("required_governance");
        document["modules"].as_array_mut().unwrap().truncate(2);
        document["modules"]
            .as_array_mut()
            .unwrap()
            .push(json!({"reference":r("journal"),"factory":"binding.model_journal","config":{}}));
        document["programs"]["chat"]["definition"]["bindings"] = json!([r("journal")]);
    }
    let system = compile_system(serde_json::from_value(document).unwrap(), &registry).unwrap();
    if unmetered {
        return (registry, system, None);
    }
    let resolved = system
        .registry()
        .resolve(&[ModuleRef::new("quota", "1")])
        .unwrap();
    let ModuleInstance::Governance(profile) = &resolved.instances[&ModuleRef::new("quota", "1")]
    else {
        panic!("quota")
    };
    let scope = BudgetScope {
        root_run_id: "root".into(),
        identity: profile.identity().into(),
    };
    (registry, system, Some(scope))
}
#[tokio::test]
async fn model_evidence_and_management_ack_loss_replay_without_new_provider_effect_or_usage() {
    for unmetered in [false, true] {
        for failed in [false, true] {
            let dir = tempfile::tempdir().unwrap();
            let database = dir.path().join("runtime.sqlite");
            let effects = dir.path().join("effects");
            let store = SqliteStore::open(&database).unwrap();
            let started = Arc::new(tokio::sync::Notify::new());
            let (registry, system, scope) = setup(&store, &effects, started.clone(), unmetered);
            let supervisor = RunSupervisor::new(store.clone())
                .with_lease_ttl(Duration::from_secs(2))
                .unwrap();
            supervisor
                .submit_managed(
                    ManagedRunRequest {
                        run_id: "root".into(),
                        thread_id: "thread".into(),
                        system: "proof-system".into(),
                        release: system.bundle.digest.clone(),
                        program: "chat".into(),
                        input: Some(nofy_interjection_core::PendingInterjection {
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
                let running = supervisor.execute_submitted(&registry, "root");
                tokio::pin!(running);
                tokio::select! {result=&mut running=>panic!("{result:?}"),_=started.notified()=>{},_=tokio::time::sleep(Duration::from_secs(10))=>panic!("model not dispatched")}
            }
            tokio::time::sleep(Duration::from_millis(2100)).await;
            let target = supervisor
                .model_reconciliation_targets("root", "root")
                .await
                .unwrap()
                .remove(0);
            let receipt = ModelReconciliation {
                ticket: target.ticket,
                result: if failed {
                    ModelReconciliationResult::Failed {
                        failure: crate::model::ModelFailure {
                            category: "auth".into(),
                            message: "confirmed provider rejection".into(),
                            status: Some(401),
                            retryable: false,
                            retry_after_ms: None,
                            code: None,
                            details: serde_json::Value::Null,
                        },
                    }
                } else {
                    ModelReconciliationResult::Completed {
                        response: ModelResponse {
                            output: "confirmed".into(),
                            input_tokens: 3,
                            output_tokens: 2,
                            ..Default::default()
                        },
                    }
                },
            };
            store
                .enqueue_managed_action(ManagedAction {
                    command_id: "model-evidence".into(),
                    run_id: "root".into(),
                    command: ManagedCommand::ReconcileModel {
                        receipt: receipt.clone(),
                    },
                })
                .await
                .unwrap();
            let plan = ExecutionPlan::program(system.program("chat").unwrap());
            let lease = store
                .acquire(
                    plan.agent.checkpoint_key("thread"),
                    "accept-model-evidence",
                    Duration::from_secs(30),
                )
                .await
                .unwrap();
            supervisor
                .accept_model_reconciliation_leased(
                    &plan,
                    &RunContext::new("thread", "root"),
                    receipt,
                    "model-evidence",
                    &lease,
                )
                .await
                .unwrap();
            store.release(&lease).await.unwrap();
            drop(supervisor);
            drop(store);
            let store = SqliteStore::open(&database).unwrap();
            let supervisor = RunSupervisor::new(store.clone());
            let result = supervisor
                .execute_managed_action(&registry, "model-evidence")
                .await
                .unwrap();
            assert!(
                result.finished && result.error.is_some() == failed,
                "{result:?}"
            );
            if !failed {
                assert!(
                    matches!(result.outcome,Some(RunOutcome::Completed {ref output,..}) if output=="confirmed")
                );
            }
            let used = if let Some(scope) = &scope {
                let used = store.inspect(scope).await.unwrap().unwrap();
                assert_eq!(used.used.model_calls, 1);
                assert_eq!(used.used.input_tokens, 10);
                assert_eq!(used.used.output_tokens, 5);
                assert_eq!(used.reserved, BudgetCost::default());
                Some(used.used)
            } else {
                None
            };
            store.transaction(|tx| {tx.execute("UPDATE agent_runtime_managed_actions SET result=NULL WHERE command_id='model-evidence'",[]).map_err(db_error)?;Ok(())}).await.unwrap();
            drop(supervisor);
            drop(store);
            let store = SqliteStore::open(&database).unwrap();
            let supervisor = RunSupervisor::new(store.clone());
            if !failed {
                supervisor
                    .submit_managed(
                        ManagedRunRequest {
                            run_id: "next".into(),
                            thread_id: "thread".into(),
                            system: "proof-system".into(),
                            release: system.bundle.digest.clone(),
                            program: "chat".into(),
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
            }
            let before = store
                .load(&plan.agent.checkpoint_key("thread"))
                .await
                .unwrap();
            let replay = supervisor
                .execute_managed_action(&registry, "model-evidence")
                .await
                .unwrap();
            assert!(
                replay.finished && replay.error.is_some() == failed,
                "{replay:?}"
            );
            if let Some(scope) = &scope {
                assert_eq!(
                    Some(store.inspect(scope).await.unwrap().unwrap().used),
                    used
                );
            } else {
                store
                    .transaction(|tx| {
                        let count: u64 = tx
                            .query_row("SELECT COUNT(*) FROM agent_runtime_budget_roots", [], |r| {
                                r.get(0)
                            })
                            .map_err(db_error)?;
                        assert_eq!(count, 0);
                        Ok(())
                    })
                    .await
                    .unwrap();
            }
            assert_eq!(std::fs::read_to_string(effects).unwrap(), "model\n");
            if !failed {
                assert_eq!(
                    crate::system::content_digest(&before).unwrap(),
                    crate::system::content_digest(
                        &store
                            .load(&plan.agent.checkpoint_key("thread"))
                            .await
                            .unwrap()
                    )
                    .unwrap()
                );
                let mut stale = store
                    .managed_action("model-evidence")
                    .await
                    .unwrap()
                    .unwrap()
                    .action;
                stale.command_id = "new-command-for-old-root".into();
                store.enqueue_managed_action(stale).await.unwrap();
                assert!(
                    supervisor
                        .execute_managed_action(&registry, "new-command-for-old-root")
                        .await
                        .unwrap()
                        .error
                        .is_some()
                );
                assert_eq!(
                    store
                        .execution_record("next")
                        .await
                        .unwrap()
                        .unwrap()
                        .status,
                    "completed"
                );
            }
        }
    }
}
