use super::*;

fn policy_system(
    registry: &ModuleRegistry,
    system: &CompiledSystem,
    allowed: Option<&[&str]>,
) -> CompiledSystem {
    let mut doc = serde_json::to_value(&system.bundle.document).unwrap();
    let modules = doc["modules"].as_array_mut().unwrap();
    let definition = json!({"reference":r("editable-policy"),"factory":"policy.tool_scope","config":{"allowed":allowed.unwrap_or(&[])}});
    if let Some(old) = modules
        .iter_mut()
        .find(|module| module["reference"] == r("editable-policy"))
    {
        *old = definition;
    } else {
        modules.push(definition);
    }
    doc["programs"]["chat"]["definition"]["policies"] = if allowed.is_some() {
        json!([r("editable-policy")])
    } else {
        json!([])
    };
    compile_system(serde_json::from_value(doc).unwrap(), registry).unwrap()
}

fn policy_update(id: &str, system: &CompiledSystem, revision: u64) -> ManagedAction {
    let mut command = update(id, system, revision, false, false);
    if let ManagedCommand::UpdateModules { update, .. } = &mut command.command {
        update.policy_set = true;
    }
    command
}

async fn quota(store: &SqliteStore, system: &CompiledSystem) -> Option<BudgetSummary> {
    let reference = ModuleRef::new("budget", "1");
    let resolved = system
        .registry()
        .resolve(std::slice::from_ref(&reference))
        .unwrap();
    let ModuleInstance::Governance(profile) = &resolved.instances[&reference] else {
        panic!("budget profile")
    };
    store
        .inspect(&BudgetScope {
            root_run_id: "run".into(),
            identity: profile.identity().into(),
        })
        .await
        .unwrap()
}

async fn catalog(supervisor: &RunSupervisor, registry: &ModuleRegistry, target: &CompiledSystem) {
    supervisor
        .submit_transition(update("catalog", target, 0, true, true), target)
        .await
        .unwrap();
    execute(supervisor, registry, "catalog").await;
}

#[tokio::test]
async fn policy_replacement_and_removal_recover_atomically_without_resetting_effects_or_budget() {
    for remove in [false, true] {
        let dir = tempfile::tempdir().unwrap();
        let (store, mut registry, base, gates, _) = setup(dir.path(), true, true);
        registry
            .register_factory(Arc::new(nofy_agent_runtime::policy::ToolAllowListFactory))
            .unwrap();
        let base = policy_system(&registry, &base, Some(&["append"]));
        let next = updated(&mut registry, &base, dir.path(), false);
        let supervisor = Arc::new(RunSupervisor::new(store.clone()));
        park(&supervisor, &store, &registry, &base, &gates).await;
        let original = store.execution_job("run").await.unwrap().unwrap();
        catalog(&supervisor, &registry, &next.system).await;
        let target = policy_system(
            &registry,
            &next.system,
            if remove { None } else { Some(&["updated"]) },
        );
        let before = checkpoint(&store, &base).await;
        let budget = content_digest(&quota(&store, &base).await).unwrap();
        assert!(
            supervisor
                .submit_transition(change("unselected", &target, 1), &target)
                .await
                .is_err()
        );
        assert!(store.managed_action("unselected").await.unwrap().is_none());
        let command = policy_update("policies", &target, 1);
        supervisor
            .submit_transition(command.clone(), &target)
            .await
            .unwrap();
        let sql = rusqlite::Connection::open(dir.path().join("runtime.sqlite")).unwrap();
        sql.execute_batch("CREATE TRIGGER lose_policy_ack BEFORE UPDATE OF result ON agent_runtime_managed_actions WHEN NEW.command_id='policies' BEGIN SELECT RAISE(ABORT,'policy ack lost'); END;").unwrap();
        assert!(
            supervisor
                .execute_managed_action(&registry, "policies")
                .await
                .is_err()
        );
        assert_eq!(
            store.live_execution("run").await.unwrap().unwrap().revision,
            1
        );
        assert_eq!(
            content_digest(&checkpoint(&store, &base).await).unwrap(),
            content_digest(&before).unwrap()
        );
        assert_eq!(content_digest(&quota(&store, &base).await).unwrap(), budget);
        assert!(
            !store
                .managed_action("policies")
                .await
                .unwrap()
                .unwrap()
                .finished
        );
        sql.execute_batch("DROP TRIGGER lose_policy_ack").unwrap();

        let reopened = SqliteStore::open(&dir.path().join("runtime.sqlite")).unwrap();
        let recovery = RunSupervisor::new(reopened.clone());
        execute(&recovery, &registry, "policies").await;
        let live = reopened.live_execution("run").await.unwrap().unwrap();
        assert_eq!(live.protocol, "nofy.live/v3");
        assert!(live.modules.as_ref().unwrap().policy_set);
        assert_eq!(live.after.revision, before.revision + 1);
        assert_eq!(
            content_digest(&live.after.state).unwrap(),
            content_digest(&before.state).unwrap()
        );
        assert_eq!(
            content_digest(&quota(&reopened, &base).await).unwrap(),
            budget
        );
        execute(&recovery, &registry, "policies").await;
        assert!(
            recovery
                .submit_transition(command, &target)
                .await
                .unwrap()
                .finished
        );
        assert_eq!(reopened.live_versions("run", 0, 32).await.unwrap().len(), 2);
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
        release(&recovery, &reopened).await;
        assert!(matches!(
            recovery.execute_submitted(&registry, "run").await.unwrap(),
            Some(RunOutcome::Completed { .. })
        ));
        assert_eq!(
            std::fs::read_to_string(dir.path().join("effects")).unwrap(),
            "effect\n"
        );
        assert_eq!(next.effects.load(Ordering::SeqCst), 1);
        let final_budget = quota(&reopened, &base).await.unwrap();
        assert_eq!(final_budget.used.model_calls, 3);
        assert_eq!(final_budget.used.tool_calls, 2);
        assert_eq!(final_budget.reserved, BudgetCost::default());
    }
}

#[tokio::test]
async fn selected_policy_change_preserves_required_floor_and_rejects_its_dependency_rewrite() {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, _) = setup(dir.path(), true, false);
    registry
        .register_factory(Arc::new(nofy_agent_runtime::policy::ToolAllowListFactory))
        .unwrap();
    let base = policy_system(&registry, &base, Some(&["append"]));
    let mut doc = serde_json::to_value(&base.bundle.document).unwrap();
    doc["modules"].as_array_mut().unwrap().push(json!({"reference":r("floor"),"factory":"policy.tool_scope","config":{"allowed":["append"]}}));
    doc["required_policies"] = json!([r("floor")]);
    let base = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
    let next = updated(&mut registry, &base, dir.path(), false);
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    park(&supervisor, &store, &registry, &base, &gates).await;
    catalog(&supervisor, &registry, &next.system).await;
    let target = policy_system(&registry, &next.system, Some(&["updated"]));
    let before = content_digest(&checkpoint(&store, &base).await).unwrap();
    for remove in [false, true] {
        let mut doc = serde_json::to_value(&target.bundle.document).unwrap();
        if remove {
            doc["required_policies"] = json!([]);
        } else {
            doc["modules"]
                .as_array_mut()
                .unwrap()
                .iter_mut()
                .find(|module| module["reference"] == r("floor"))
                .unwrap()["config"]["allowed"] = json!(["append", "updated"]);
        }
        let forbidden = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
        assert!(
            supervisor
                .submit_transition(policy_update("forbidden", &forbidden, 1), &forbidden)
                .await
                .is_err()
        );
        assert!(store.managed_action("forbidden").await.unwrap().is_none());
    }
    assert_eq!(
        content_digest(&checkpoint(&store, &base).await).unwrap(),
        before
    );
    supervisor
        .submit_transition(policy_update("policies", &target, 1), &target)
        .await
        .unwrap();
    execute(&supervisor, &registry, "policies").await;
    release(&supervisor, &store).await;
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "run")
            .await
            .unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    assert_eq!(next.effects.load(Ordering::SeqCst), 0);
    assert!(next.requests.lock().unwrap()[1].messages.iter().any(|message| matches!(message, Message::Tool { call_id, is_error: true, .. } if call_id == "updated-call")));
    assert_eq!(
        std::fs::read_to_string(dir.path().join("effects")).unwrap(),
        "effect\n"
    );
}

#[tokio::test]
async fn selected_policy_cannot_rewrite_a_dependency_shared_with_the_required_floor() {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, _) = setup(dir.path(), false, false);
    registry
        .register_factory(Arc::new(nofy_agent_runtime::policy::ToolAllowListFactory))
        .unwrap();
    registry
        .register_factory(Arc::new(nofy_agent_runtime::policy::OnToolsFactory))
        .unwrap();
    let base = policy_system(&registry, &base, Some(&["append"]));
    let mut doc = serde_json::to_value(&base.bundle.document).unwrap();
    doc["modules"].as_array_mut().unwrap().push(json!({"reference":r("floor"),"factory":"policy.on_tools","config":{"tools":["updated"]},"dependencies":{"policy":r("editable-policy")}}));
    doc["required_policies"] = json!([r("floor")]);
    let base = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
    let next = updated(&mut registry, &base, dir.path(), false);
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    park(&supervisor, &store, &registry, &base, &gates).await;
    catalog(&supervisor, &registry, &next.system).await;
    let target = policy_system(&registry, &next.system, Some(&["updated"]));
    let before = content_digest(&checkpoint(&store, &base).await).unwrap();
    let error = supervisor
        .submit_transition(policy_update("shared", &target, 1), &target)
        .await
        .unwrap_err();
    assert!(
        error
            .to_string()
            .contains("preserved dependency: editable-policy"),
        "{error}"
    );
    assert!(store.managed_action("shared").await.unwrap().is_none());
    assert_eq!(
        content_digest(&checkpoint(&store, &base).await).unwrap(),
        before
    );
    assert_eq!(
        store.live_execution("run").await.unwrap().unwrap().revision,
        1
    );
}

#[tokio::test]
async fn explicit_policy_rollback_is_a_new_version_and_keeps_the_updated_tool_catalog() {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, _) = setup(dir.path(), false, false);
    registry
        .register_factory(Arc::new(nofy_agent_runtime::policy::ToolAllowListFactory))
        .unwrap();
    let base = policy_system(&registry, &base, Some(&["append"]));
    let next = updated(&mut registry, &base, dir.path(), false);
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    park(&supervisor, &store, &registry, &base, &gates).await;
    catalog(&supervisor, &registry, &next.system).await;
    let target = policy_system(&registry, &next.system, Some(&["updated"]));
    supervisor
        .submit_transition(policy_update("policies", &target, 1), &target)
        .await
        .unwrap();
    execute(&supervisor, &registry, "policies").await;
    assert!(
        supervisor
            .submit_transition(change("implicit-rollback", &next.system, 2), &next.system)
            .await
            .is_err()
    );
    supervisor
        .submit_transition(policy_update("rollback", &next.system, 2), &next.system)
        .await
        .unwrap();
    execute(&supervisor, &registry, "rollback").await;
    let live = store.live_execution("run").await.unwrap().unwrap();
    assert_eq!(live.revision, 3);
    assert_eq!(live.protocol, "nofy.live/v3");
    assert!(live.modules.as_ref().unwrap().policy_set);
    assert!(live.modules.as_ref().unwrap().tool_catalog);
    release(&supervisor, &store).await;
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "run")
            .await
            .unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    assert_eq!(next.effects.load(Ordering::SeqCst), 0);
    assert_eq!(next.requests.lock().unwrap().len(), 2);
}

#[tokio::test]
async fn policy_selection_crosses_session_roots_and_survives_a_later_prompt_only_update() {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, _) = setup(dir.path(), false, true);
    registry
        .register_factory(Arc::new(nofy_agent_runtime::policy::ToolAllowListFactory))
        .unwrap();
    let base = policy_system(&registry, &base, Some(&["append"]));
    let next = updated(&mut registry, &base, dir.path(), false);
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    park(&supervisor, &store, &registry, &base, &gates).await;
    supervisor
        .create_session(SessionRequest {
            id: "session".into(),
            root_run_id: "run".into(),
        })
        .await
        .unwrap();
    catalog(&supervisor, &registry, &next.system).await;
    let target = policy_system(&registry, &next.system, Some(&["updated"]));
    supervisor
        .submit_transition(policy_update("policies", &target, 1), &target)
        .await
        .unwrap();
    execute(&supervisor, &registry, "policies").await;
    release(&supervisor, &store).await;
    supervisor
        .execute_submitted(&registry, "run")
        .await
        .unwrap();
    assert_eq!(next.effects.load(Ordering::SeqCst), 1);
    supervisor
        .submit_session_turn(
            "session",
            SessionTurnCommand {
                command_id: "bind-two".into(),
                source_run_id: "run".into(),
                expected_source_revision: 2,
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
    assert!(
        store
            .session_seed("two")
            .await
            .unwrap()
            .unwrap()
            .modules
            .unwrap()
            .policy_set
    );
    let mut doc = serde_json::to_value(&target.bundle.document).unwrap();
    doc["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|module| module["reference"] == r("prompt"))
        .unwrap()["config"]["text"] = json!("same policy, next prompt");
    let prompt = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
    let mut command = change("prompt-two", &prompt, 0);
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
    assert_eq!(live.protocol, "nofy.live/v3");
    assert!(live.modules.unwrap().policy_set);
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
    assert_eq!(next.effects.load(Ordering::SeqCst), 2);
    assert_eq!(
        std::fs::read_to_string(dir.path().join("effects")).unwrap(),
        "effect\n"
    );
}

#[test]
fn unselected_policy_field_preserves_supported_module_command_and_state_encoding() {
    let selection = json!({"tool_catalog":true,"hook_subscriptions":false});
    let update: ModuleUpdate = serde_json::from_value(selection.clone()).unwrap();
    assert!(!update.policy_set);
    assert_eq!(serde_json::to_value(update).unwrap(), selection);
    let state = json!({"tool_catalog":true,"hook_epoch":"existing-hook-epoch"});
    let restored: LiveModuleState = serde_json::from_value(state.clone()).unwrap();
    assert!(!restored.policy_set);
    assert_eq!(serde_json::to_value(restored).unwrap(), state);
}
