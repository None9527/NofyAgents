use super::*;

struct Parent(Arc<Mutex<Vec<ModelRequest>>>);
#[async_trait::async_trait]
impl Model for Parent {
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
        let done = request
            .messages
            .iter()
            .any(|m| matches!(m,Message::Tool{call_id,..} if call_id=="nested-call"));
        self.0.lock().unwrap().push(request);
        Ok(ModelResponse {
            output: if done {
                "nested complete".into()
            } else {
                String::new()
            },
            tool_calls: if done {
                vec![]
            } else {
                vec![ToolCall {
                    id: "nested-call".into(),
                    name: "nested".into(),
                    arguments: json!({"prompt":"continue"}),
                }]
            },
            input_tokens: 3,
            output_tokens: 2,
            ..Default::default()
        })
    }
}

#[tokio::test]
async fn child_exhaustion_keeps_original_pending_model_checkpoint_and_parent_reservations() {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, clock) = setup(dir.path(), true, false);
    let base = configure(
        &registry,
        &base,
        json!({"max_model_calls":2,"max_tool_calls":4,"max_child_calls":1}),
    );
    let resolved = base
        .registry()
        .resolve(&[ModuleRef::new("tools", "1")])
        .unwrap();
    let ModuleInstance::ToolPack(tools) = &resolved.instances[&ModuleRef::new("tools", "1")] else {
        panic!("tools")
    };
    let mut components = Components::default();
    components
        .models
        .insert("child".into(), Arc::new(ModelAtBoundary(gates.clone())));
    components
        .prompts
        .insert("prompt".into(), Arc::new(StaticPrompt("child".into())));
    components.tool_packs.insert("work".into(), tools.clone());
    let child = AgentBuilder::new("nested-worker")
        .model("child")
        .prompt("prompt")
        .tools("work")
        .compile(&components)
        .unwrap()
        .with_governance(profile(&base));
    let mut catalog = ToolCatalog::new();
    catalog
        .insert(child.as_tool("nested", "Nested worker"))
        .unwrap();
    let parent = Arc::new(Mutex::new(Vec::new()));
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "model.parent",
            "1",
            ModuleInstance::Model(Arc::new(Parent(parent.clone()))),
        )))
        .unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "tools.nested",
            "1",
            ModuleInstance::ToolPack(catalog),
        )))
        .unwrap();
    let mut doc = serde_json::to_value(&base.bundle.document).unwrap();
    doc["modules"].as_array_mut().unwrap().extend([
        json!({"reference":r("parent"),"factory":"model.parent","config":{}}),
        json!({"reference":r("nested"),"factory":"tools.nested","config":{}}),
    ]);
    doc["programs"]["chat"]["definition"]["model"] = r("parent");
    doc["programs"]["chat"]["definition"]["tool_packs"] = json!([r("nested")]);
    let base = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
    let ledger = scope(&base);
    let supervisor = RunSupervisor::new(store.clone());
    gates.model_release.notify_one();
    gates.tool_release.notify_one();
    supervisor
        .submit_managed(request(&base, "run"), &base)
        .await
        .unwrap();
    let outcome = supervisor
        .execute_submitted(&registry, "run")
        .await
        .unwrap()
        .unwrap();
    let RunOutcome::BudgetExceeded { state } = outcome else {
        panic!("{outcome:?}")
    };
    assert!(state.in_flight.is_some());
    let children = store.children("run").await.unwrap();
    assert_eq!(children.len(), 1);
    let original = children[0].clone();
    assert_eq!(original.status, "budget_exceeded");
    let child_key = original.checkpoint_key.clone().unwrap();
    let child_before = store.load(&child_key).await.unwrap().unwrap();
    assert!(child_before.state.pending_model.is_some());
    assert_eq!(gates.calls.load(Ordering::SeqCst), 1);
    assert_eq!(parent.lock().unwrap().len(), 1);
    let held = summary(&store, &ledger).await;
    assert_eq!(held.reserved.child_calls, 1);
    assert_eq!(held.reserved.tool_calls, 1);
    assert_eq!(
        std::fs::read_to_string(dir.path().join("effects")).unwrap(),
        "effect\n"
    );
    store
        .enqueue_managed_action(action("park", ManagedCommand::Park))
        .await
        .unwrap();
    assert!(execute(&supervisor, &registry, "park").await.finished);
    let raised = configure(
        &registry,
        &base,
        json!({"max_model_calls":4,"max_tool_calls":4,"max_child_calls":1}),
    );
    supervisor
        .submit_transition(budget_command("raise", &raised, 0), &raised)
        .await
        .unwrap();
    let reopened = SqliteStore::open_with_clock(&dir.path().join("runtime.sqlite"), clock).unwrap();
    let recovery = RunSupervisor::new(reopened.clone());
    execute(&recovery, &registry, "raise").await;
    let live = reopened.live_execution("run").await.unwrap().unwrap();
    assert_eq!(
        content_digest(&live.after.state).unwrap(),
        content_digest(&state).unwrap()
    );
    assert_eq!(
        content_digest(&reopened.load(&child_key).await.unwrap().unwrap()).unwrap(),
        content_digest(&child_before).unwrap()
    );
    assert_eq!(summary(&reopened, &ledger).await.reserved, held.reserved);
    release(&recovery, &reopened).await;
    reopened
        .enqueue_managed_action(action("resume", ManagedCommand::Resume))
        .await
        .unwrap();
    let finished = execute(&recovery, &registry, "resume").await;
    assert!(
        matches!(finished.outcome, Some(RunOutcome::Completed { .. })),
        "{finished:?}"
    );
    let final_child = reopened.children("run").await.unwrap();
    assert_eq!(final_child.len(), 1);
    assert_eq!(final_child[0].run_id, original.run_id);
    assert_eq!(final_child[0].thread_id, original.thread_id);
    assert_eq!(final_child[0].status, "completed");
    assert_eq!(gates.calls.load(Ordering::SeqCst), 2);
    assert_eq!(parent.lock().unwrap().len(), 2);
    assert_eq!(
        std::fs::read_to_string(dir.path().join("effects")).unwrap(),
        "effect\n"
    );
    let budget = summary(&reopened, &ledger).await;
    assert_eq!(budget.used.model_calls, 4);
    assert_eq!(budget.used.tool_calls, 2);
    assert_eq!(budget.used.child_calls, 1);
    assert_eq!(budget.reserved, BudgetCost::default());
    assert_eq!(budget.active_children, 0);
    assert!(execute(&recovery, &registry, "resume").await.finished);
    assert_eq!(gates.calls.load(Ordering::SeqCst), 2);
}
