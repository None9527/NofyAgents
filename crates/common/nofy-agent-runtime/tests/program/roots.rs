use super::*;

#[tokio::test]
async fn tool_root_needs_no_model_and_keeps_real_approval_and_cached_receipts() {
    let temp = tempfile::tempdir().unwrap();
    let path = temp.path().join("runtime.db");
    let store = SqliteStore::open(&path).unwrap();
    let setup = setup(&store, true, false, false, true);
    let program = CompiledProgram::for_tool(&tool(&setup), call()).unwrap();
    let supervisor = RunSupervisor::new(store.clone());
    let outcome = supervisor
        .execute_program(&program, RunInput::default(), context())
        .await;
    assert!(
        matches!(&outcome, Ok(RunOutcome::Paused { .. })),
        "{outcome:?}"
    );
    assert_eq!(setup.effects.load(Ordering::SeqCst), 0);
    let requests = store.pending_approvals("root").await.unwrap();
    assert_eq!(requests.len(), 1);
    store.decide(&requests[0], true).await.unwrap();
    let restored = program.snapshot.restore(&setup.registry).unwrap();
    for input in [RunInput::resume(), RunInput::resume()] {
        assert!(matches!(
            supervisor
                .execute_program(&restored, input, context())
                .await
                .unwrap(),
            RunOutcome::Completed { .. }
        ));
    }
    assert_eq!(setup.effects.load(Ordering::SeqCst), 1);
    assert_eq!(setup.models.load(Ordering::SeqCst), 0);
    let summary = totals(&store, &setup).await;
    assert_eq!(summary.used.model_calls, 0);
    assert_eq!(summary.used.steps, 0);
    assert_eq!(summary.used.tool_calls, 1);
    let record = store.execution_record("root").await.unwrap().unwrap();
    assert_eq!(record.status, "completed");
    assert_eq!(record.snapshot.name(), "tool-root");
    assert!(!record.snapshot.is_agent());
    assert!(store.record("root").await.is_err());
    let reopened = SqliteStore::open(&path).unwrap();
    assert!(matches!(
        RunSupervisor::new(reopened)
            .execute_program(&restored, RunInput::resume(), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(setup.effects.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn pure_root_rejects_agent_mail_but_persistent_cancel_preserves_unknown_effect() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let setup = setup(&store, false, true, false, true);
    let program = Arc::new(CompiledProgram::for_tool(&tool(&setup), call()).unwrap());
    let worker_store = store.clone();
    let worker_program = program.clone();
    let worker = tokio::spawn(async move {
        RunSupervisor::new(worker_store)
            .execute_program(&worker_program, RunInput::default(), context())
            .await
    });
    tokio::time::timeout(Duration::from_secs(10), setup.started.notified())
        .await
        .unwrap();
    let address = InputAddress {
        root_run_id: "root".into(),
        run_id: "root".into(),
        thread_id: "thread".into(),
        agent: "tool-root".into(),
    };
    assert!(
        store
            .submit(MailEnvelope {
                address: address.clone(),
                input_id: "ordinary".into(),
                input: MailInput::Tool {
                    call: ToolCall {
                        id: String::new(),
                        name: "effect".into(),
                        arguments: json!({})
                    }
                }
            })
            .await
            .is_err()
    );
    let cursor = store.cancel(&address, "cancel-root").await.unwrap();
    assert!(matches!(
        tokio::time::timeout(Duration::from_secs(10), worker)
            .await
            .unwrap()
            .unwrap()
            .unwrap(),
        RunOutcome::Cancelled { .. }
    ));
    assert!(matches!(
        RunSupervisor::new(store.clone())
            .execute_program(&program, RunInput::resume_after_cancel(cursor), context())
            .await
            .unwrap(),
        RunOutcome::Paused { .. }
    ));
    assert_eq!(setup.effects.load(Ordering::SeqCst), 1);
    assert_eq!(setup.models.load(Ordering::SeqCst), 0);
    let summary = totals(&store, &setup).await;
    assert_eq!(summary.used.tool_calls + summary.reserved.tool_calls, 1);
}

#[tokio::test]
async fn legacy_record_wire_and_source_api_survive_next_to_version_two_agent_roots() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let setup = setup(&store, false, false, false, false);
    let compiled = compile_agent(
        serde_json::from_value(json!({"name":"agent","model":r("model"),"prompt":r("prompt")}))
            .unwrap(),
        &setup.registry,
    )
    .unwrap();
    let supervisor = RunSupervisor::new(store.clone());
    assert!(matches!(
        supervisor
            .execute(&compiled, RunInput::new("task"), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    let legacy: RunRecord = store.record("root").await.unwrap().unwrap();
    assert_eq!(legacy.snapshot.agent.name, "agent");
    let wire = serde_json::to_value(&legacy).unwrap();
    assert_eq!(wire["snapshot"]["version"], 1);
    assert!(wire["snapshot"].get("program").is_none());
    assert_eq!(
        wire,
        serde_json::to_value(store.execution_record("root").await.unwrap().unwrap()).unwrap()
    );
    let program = CompiledProgram::for_agent(&compiled).unwrap();
    let next = RunContext::new("other", "v2");
    assert!(matches!(
        supervisor
            .execute_program(&program, RunInput::new("task"), next.clone())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert!(matches!(
        supervisor
            .execute_program(&program, RunInput::resume(), next)
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(
        store
            .execution_record("v2")
            .await
            .unwrap()
            .unwrap()
            .snapshot
            .name(),
        "agent"
    );
    assert_eq!(setup.models.load(Ordering::SeqCst), 2);
    assert!(matches!(
        supervisor
            .execute(&compiled, RunInput::resume(), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
}

#[tokio::test]
async fn frozen_call_and_program_kind_cannot_change_on_resume() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let setup = setup(&store, false, false, false, true);
    let runtime = tool(&setup);
    let program = CompiledProgram::for_tool(&runtime, call()).unwrap();
    let supervisor = RunSupervisor::new(store.clone());
    assert!(matches!(
        supervisor
            .execute_program(&program, RunInput::default(), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    let before = serde_json::to_value(store.execution_record("root").await.unwrap()).unwrap();
    let changed = CompiledProgram::for_tool(
        &runtime,
        ToolCall {
            arguments: json!({"value":8}),
            ..call()
        },
    )
    .unwrap();
    assert!(
        supervisor
            .execute_program(&changed, RunInput::resume(), context())
            .await
            .is_err()
    );
    assert!(
        supervisor
            .execute_program(&program, RunInput::new("invented prompt"), context())
            .await
            .is_err()
    );
    assert_eq!(
        before,
        serde_json::to_value(store.execution_record("root").await.unwrap()).unwrap()
    );
    assert_eq!(setup.effects.load(Ordering::SeqCst), 1);
    let mut snapshot = program.snapshot.clone();
    snapshot.version = 3;
    assert!(snapshot.restore(&setup.registry).is_err());
    let mut mixed = serde_json::to_value(&program.snapshot).unwrap();
    let legacy = compile_agent(
        serde_json::from_value(
            json!({"name":"wrong-kind", "model":r("model"), "prompt":r("prompt")}),
        )
        .unwrap(),
        &setup.registry,
    )
    .unwrap();
    mixed["agent"] = serde_json::to_value(legacy.snapshot.agent).unwrap();
    mixed["modules"] = serde_json::to_value(legacy.snapshot.modules).unwrap();
    assert!(serde_json::from_value::<RunSnapshot>(mixed.clone()).is_err());
    mixed["version"] = json!(1);
    assert!(serde_json::from_value::<RunSnapshot>(mixed).is_err());
}

#[tokio::test]
async fn tool_root_can_retry_a_real_child_without_a_sampled_coordinator() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let mut setup = setup(&store, false, false, true, false);
    let child = compile_agent(
        serde_json::from_value(json!({"name":"child", "model":r("model"), "prompt":r("prompt")}))
            .unwrap(),
        &setup.registry,
    )
    .unwrap();
    let mut pack = ToolCatalog::new();
    pack.insert(child.agent.as_tool("child", "Delegate"))
        .unwrap();
    install(
        &mut setup.registry,
        "children",
        ModuleInstance::ToolPack(pack),
    );
    let runtime = compile_tools(serde_json::from_value(json!({"name":"delegate-root", "scope_identity":"hashed_v1", "tool_packs":[r("children")], "governance":[r("budget")]})).unwrap(), &setup.registry).unwrap();
    let program = CompiledProgram::for_tool(
        &runtime,
        ToolCall {
            id: "child-call".into(),
            name: "child".into(),
            arguments: json!({"prompt":"task"}),
        },
    )
    .unwrap();
    let supervisor = RunSupervisor::new(store.clone());
    assert!(
        supervisor
            .execute_program(&program, RunInput::default(), context())
            .await
            .is_err()
    );
    let child = store
        .children("root")
        .await
        .unwrap()
        .into_iter()
        .find(|c| c.agent_name == "child")
        .unwrap();
    assert!(child.run_id.starts_with("child-hash-v1:"));
    let command = ModelRetryCommand {
        command_id: "retry-child".into(),
        ticket: supervisor
            .child_model_retry_ticket("root", &child.run_id)
            .await
            .unwrap()
            .unwrap(),
    };
    assert!(matches!(
        supervisor
            .control_program(&program, RunControlCommand::RetryModel(command), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(setup.models.load(Ordering::SeqCst), 2);
    assert_eq!(setup.effects.load(Ordering::SeqCst), 0);
    assert_eq!(totals(&store, &setup).await.active_children, 0);
}
