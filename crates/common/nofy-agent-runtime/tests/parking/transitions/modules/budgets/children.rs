use super::*;

struct ChildrenModel;
#[async_trait::async_trait]
impl Model for ChildrenModel {
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
        let done = request.messages.iter().filter(|message| matches!(message, Message::Tool { call_id, .. } if call_id.starts_with("child-call-"))).count() == 2;
        Ok(ModelResponse {
            output: if done {
                "children complete".into()
            } else {
                String::new()
            },
            tool_calls: if done {
                vec![]
            } else {
                ["old-child", "middle-child"]
                    .into_iter()
                    .enumerate()
                    .map(|(index, name)| ToolCall {
                        id: format!("child-call-{index}"),
                        name: name.into(),
                        arguments: json!({"prompt":"continue"}),
                    })
                    .collect()
            },
            input_tokens: 3,
            output_tokens: 2,
            ..Default::default()
        })
    }
}

struct RetryChild(Arc<Mutex<Vec<ModelRequest>>>);
#[async_trait::async_trait]
impl Model for RetryChild {
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
        let attempt = {
            let mut seen = self.0.lock().unwrap();
            seen.push(request);
            seen.len()
        };
        if attempt == 1 {
            return Err(model::ModelFailure {
                category: "transport".into(),
                message: "retry same child".into(),
                retryable: true,
                retry_after_ms: Some(0),
                status: Some(503),
                code: None,
                details: Value::Null,
            }
            .into());
        }
        Ok(ModelResponse {
            output: "retried child".into(),
            input_tokens: 3,
            output_tokens: 2,
            ..Default::default()
        })
    }
}

fn child(name: &str, quota: Arc<GovernanceProfile>, model: Arc<dyn Model>) -> Agent {
    let mut components = Components::default();
    components.models.insert("model".into(), model);
    components
        .prompts
        .insert("prompt".into(), Arc::new(StaticPrompt("child".into())));
    AgentBuilder::new(name)
        .model("model")
        .prompt("prompt")
        .compile(&components)
        .unwrap()
        .with_governance(quota)
}

#[tokio::test]
async fn original_and_intermediate_child_profiles_inherit_current_scope_without_opening_ledgers() {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, _) = setup(dir.path(), true, true);
    let ledger = scope(&base);
    let middle = configure(
        &registry,
        &base,
        json!({"max_model_calls":6,"max_tool_calls":8}),
    );
    let old_requests = Arc::new(Mutex::new(Vec::new()));
    let middle_requests = Arc::new(Mutex::new(Vec::new()));
    let mut tools = ToolCatalog::new();
    tools
        .insert(
            child(
                "old-child",
                profile(&base),
                Arc::new(RetryChild(old_requests.clone())),
            )
            .as_tool("old-child", "Original profile"),
        )
        .unwrap();
    tools
        .insert(
            child(
                "middle-child",
                profile(&middle),
                Arc::new(TargetModel(middle_requests.clone())),
            )
            .as_tool("middle-child", "Intermediate profile"),
        )
        .unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "tools.children",
            "1",
            ModuleInstance::ToolPack(tools),
        )))
        .unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "model.children",
            "1",
            ModuleInstance::Model(Arc::new(ChildrenModel)),
        )))
        .unwrap();
    let final_budget = configure(
        &registry,
        &middle,
        json!({"max_model_calls":10,"max_tool_calls":8}),
    );
    let mut doc = serde_json::to_value(&final_budget.bundle.document).unwrap();
    doc["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|module| module["reference"] == r("budget"))
        .unwrap()["config"]["retry"] = json!({"max_attempts":2,"base_delay_ms":0,"max_delay_ms":0});
    doc["modules"].as_array_mut().unwrap().extend([
        json!({"reference":r("children"),"factory":"tools.children","config":{}}),
        json!({"reference":r("children-model"),"factory":"model.children","config":{}}),
    ]);
    doc["programs"]["chat"]["definition"]["tool_packs"] = json!([r("children")]);
    doc["programs"]["chat"]["definition"]["model"] = r("children-model");
    let target = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    park(&supervisor, &store, &registry, &base, &gates).await;
    supervisor
        .submit_transition(budget_command("middle", &middle, 0), &middle)
        .await
        .unwrap();
    execute(&supervisor, &registry, "middle").await;
    let mut command = budget_command("final", &target, 1);
    if let ManagedCommand::UpdateModules { update, .. } = &mut command.command {
        update.tool_catalog = true;
    }
    supervisor
        .submit_transition(command, &target)
        .await
        .unwrap();
    execute(&supervisor, &registry, "final").await;
    let live = store.live_execution("run").await.unwrap().unwrap();
    assert_eq!(live.modules.unwrap().budgets[0].profile_aliases.len(), 3);
    release(&supervisor, &store).await;
    let result = supervisor
        .execute_submitted(&registry, "run")
        .await
        .unwrap()
        .unwrap();
    assert!(matches!(result, RunOutcome::Completed { .. }), "{result:?}");
    assert_eq!(old_requests.lock().unwrap().len(), 2);
    assert_eq!(middle_requests.lock().unwrap().len(), 1);
    let budget = summary(&store, &ledger).await;
    assert_eq!(budget.used.model_calls, 6);
    assert_eq!(budget.used.child_calls, 2);
    assert_eq!(budget.reserved, BudgetCost::default());
    assert_eq!(budget.active_children, 0);
    let sql = rusqlite::Connection::open(dir.path().join("runtime.sqlite")).unwrap();
    let count: u64 = sql
        .query_row(
            "SELECT count(*) FROM agent_runtime_budget_roots",
            [],
            |row| row.get(0),
        )
        .unwrap();
    assert_eq!(count, 1);
    assert_eq!(
        std::fs::read_to_string(dir.path().join("effects")).unwrap(),
        "effect\n"
    );
}

#[tokio::test]
async fn session_seed_and_later_prompt_updates_keep_original_budget_root_and_updated_limits() {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, _) = setup(dir.path(), true, true);
    let ledger = scope(&base);
    let next = updated(&mut registry, &base, dir.path(), false);
    let first = configure(
        &registry,
        &next.system,
        json!({"max_model_calls":6,"max_tool_calls":8}),
    );
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    park(&supervisor, &store, &registry, &base, &gates).await;
    supervisor
        .create_session(SessionRequest {
            id: "session".into(),
            root_run_id: "run".into(),
        })
        .await
        .unwrap();
    let mut command = budget_command("first", &first, 0);
    if let ManagedCommand::UpdateModules { update, .. } = &mut command.command {
        update.tool_catalog = true;
        update.hook_subscriptions = true;
    }
    supervisor.submit_transition(command, &first).await.unwrap();
    execute(&supervisor, &registry, "first").await;
    release(&supervisor, &store).await;
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "run")
            .await
            .unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    assert_eq!(summary(&store, &ledger).await.used.model_calls, 3);
    supervisor
        .submit_session_turn(
            "session",
            SessionTurnCommand {
                command_id: "bind-two".into(),
                source_run_id: "run".into(),
                expected_source_revision: 1,
                expected_binding_revision: 0,
                turn: SessionTurnInput::New {
                    run_id: "two".into(),
                    input: PendingInterjection {
                        text: "next".into(),
                        attachments: vec![],
                    },
                },
            },
        )
        .await
        .unwrap();
    next.probe.block_first.store(true, Ordering::SeqCst);
    let worker = {
        let supervisor = supervisor.clone();
        let registry = registry.clone();
        tokio::spawn(async move { supervisor.execute_submitted(&registry, "two").await })
    };
    wake(&next.probe.started).await;
    store
        .enqueue_managed_action(ManagedAction {
            command_id: "park-two".into(),
            run_id: "two".into(),
            command: ManagedCommand::Park,
        })
        .await
        .unwrap();
    next.probe.released.notify_one();
    assert!(matches!(
        worker.await.unwrap().unwrap(),
        Some(RunOutcome::Paused { .. })
    ));
    let seeded = store.session_seed("two").await.unwrap().unwrap();
    assert_eq!(
        seeded.modules.unwrap().budgets[0].ledger_identity,
        ledger.identity
    );
    let second = configure(
        &registry,
        &first,
        json!({"max_model_calls":8,"max_tool_calls":8}),
    );
    let mut command = budget_command("second", &second, 0);
    command.run_id = "two".into();
    if let ManagedCommand::UpdateModules {
        park_command_id, ..
    } = &mut command.command
    {
        *park_command_id = "park-two".into();
    }
    supervisor
        .submit_transition(command, &second)
        .await
        .unwrap();
    execute(&supervisor, &registry, "second").await;
    assert_eq!(
        summary(&store, &ledger).await.spec.limits.max_model_calls,
        Some(8)
    );
    let mut doc = serde_json::to_value(&second.bundle.document).unwrap();
    doc["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|module| module["reference"] == r("prompt"))
        .unwrap()["config"]["text"] = json!("same amended quota, new prompt");
    let prompt = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
    let mut command = change("prompt-two", &prompt, 1);
    command.run_id = "two".into();
    if let ManagedCommand::Transition {
        park_command_id, ..
    } = &mut command.command
    {
        *park_command_id = "park-two".into();
    }
    supervisor
        .submit_transition(command, &prompt)
        .await
        .unwrap();
    execute(&supervisor, &registry, "prompt-two").await;
    let live = store.live_execution("two").await.unwrap().unwrap();
    assert_eq!(live.protocol, "nofy.live/v4");
    assert_eq!(
        live.modules.unwrap().budgets[0].ledger_identity,
        ledger.identity
    );
    store
        .enqueue_managed_action(ManagedAction {
            command_id: "unpark-two".into(),
            run_id: "two".into(),
            command: ManagedCommand::Unpark {
                park_command_id: "park-two".into(),
            },
        })
        .await
        .unwrap();
    execute(&supervisor, &registry, "unpark-two").await;
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "two")
            .await
            .unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    let finished = summary(&store, &ledger).await;
    assert_eq!(finished.used.model_calls, 5);
    assert_eq!(finished.reserved, BudgetCost::default());
    assert_eq!(next.effects.load(Ordering::SeqCst), 2);
    let other = BudgetScope {
        root_run_id: "two".into(),
        identity: ledger.identity.clone(),
    };
    assert!(store.inspect(&other).await.unwrap().is_none());
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "run")
            .await
            .unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    assert_eq!(
        content_digest(&summary(&store, &ledger).await).unwrap(),
        content_digest(&finished).unwrap()
    );
    assert_eq!(next.effects.load(Ordering::SeqCst), 2);
}
