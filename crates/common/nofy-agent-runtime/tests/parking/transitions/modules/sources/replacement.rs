use super::*;

#[tokio::test]
async fn replacement_reopens_atomic_update_and_runs_new_context_policy_and_dynamic_tool_without_repeating_effects()
 {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, _) = setup(dir.path(), true, false);
    let sources = install(&mut registry);
    let base = source_system(&registry, &base, Some("original"), "empty");
    let next = updated(&mut registry, &base, dir.path(), false);
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "model.source-aware",
            "1",
            ModuleInstance::Model(Arc::new(SourceModel(next.requests.clone()))),
        )))
        .unwrap();
    // The new tool is discovered through ToolSource, not installed statically.
    let mut doc = serde_json::to_value(&next.system.bundle.document).unwrap();
    doc["modules"]
        .as_array_mut()
        .unwrap()
        .push(json!({"reference":r("source-model"),"factory":"model.source-aware","config":{}}));
    doc["programs"]["chat"]["definition"]["model"] = r("source-model");
    doc["programs"]["chat"]["definition"]["tool_packs"] = json!([r("tools")]);
    doc["programs"]["chat"]["definition"]["hooks"] = json!([]);
    let next_system = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
    let target = source_system(
        &registry,
        &next_system,
        Some("replacement"),
        "updated-tools",
    );
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    park(&supervisor, &store, &registry, &base, &gates).await;
    let before = checkpoint(&store, &base).await;
    let original = store.execution_job("run").await.unwrap().unwrap();
    let budget = content_digest(&quota(&store, &base).await).unwrap();
    for field in ["context_sources", "context_policies", "tool_sources"] {
        let mut command = source_update(&format!("missing-{field}"), &target, 0);
        if let ManagedCommand::UpdateModules { update, .. } = &mut command.command {
            match field {
                "context_sources" => update.context_sources = false,
                "context_policies" => update.context_policies = false,
                _ => update.tool_sources = false,
            }
        }
        assert!(
            supervisor
                .submit_transition(command, &target)
                .await
                .is_err()
        );
        assert!(
            store
                .managed_action(&format!("missing-{field}"))
                .await
                .unwrap()
                .is_none()
        );
    }
    let command = source_update("sources", &target, 0);
    supervisor
        .submit_transition(command.clone(), &target)
        .await
        .unwrap();
    assert_eq!(*sources.snapshots.lock().unwrap(), ["original"]);
    assert_eq!(*sources.contexts.lock().unwrap(), ["original"]);
    assert!(sources.policies.lock().unwrap().is_empty());
    let sql = rusqlite::Connection::open(dir.path().join("runtime.sqlite")).unwrap();
    sql.execute_batch("CREATE TRIGGER lose_source_ack BEFORE UPDATE OF result ON agent_runtime_managed_actions WHEN NEW.command_id='sources' BEGIN SELECT RAISE(ABORT,'source ack lost'); END;").unwrap();
    assert!(
        supervisor
            .execute_managed_action(&registry, "sources")
            .await
            .is_err()
    );
    assert!(store.live_execution("run").await.unwrap().is_none());
    assert_eq!(
        content_digest(&checkpoint(&store, &base).await).unwrap(),
        content_digest(&before).unwrap()
    );
    assert_eq!(content_digest(&quota(&store, &base).await).unwrap(), budget);
    sql.execute_batch("DROP TRIGGER lose_source_ack").unwrap();
    let reopened = SqliteStore::open(&dir.path().join("runtime.sqlite")).unwrap();
    let recovery = RunSupervisor::new(reopened.clone());
    execute(&recovery, &registry, "sources").await;
    let live = reopened.live_execution("run").await.unwrap().unwrap();
    assert_eq!(live.protocol, "nofy.live/v5");
    let mut expected = before.clone();
    expected.revision += 1;
    expected.state.tool_revision.clear();
    assert_eq!(
        content_digest(&live.after).unwrap(),
        content_digest(&expected).unwrap()
    );
    assert_eq!(
        content_digest(&quota(&reopened, &base).await).unwrap(),
        budget
    );
    execute(&recovery, &registry, "sources").await;
    assert!(
        recovery
            .submit_transition(command, &target)
            .await
            .unwrap()
            .finished
    );
    release(&recovery, &reopened).await;
    assert!(matches!(
        recovery.execute_submitted(&registry, "run").await.unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    let requests = next.requests.lock().unwrap();
    assert_eq!(requests.len(), 2);
    assert!(
        requests[0]
            .messages
            .iter()
            .any(|m| matches!(m, Message::User { content } if content == "retrieved:replacement"))
    );
    assert!(
        !requests[0]
            .messages
            .iter()
            .any(|m| matches!(m, Message::User { content } if content == "retrieved:original"))
    );
    assert!(requests[0].messages.iter().any(
        |m| matches!(m, Message::Assistant { content, .. } if content == "compacted:replacement")
    ));
    assert!(
        requests[0]
            .tools
            .iter()
            .any(|t| t.function.name == "updated")
    );
    drop(requests);
    assert_eq!(
        *sources.snapshots.lock().unwrap(),
        ["original", "replacement"]
    );
    assert!(!sources.policies.lock().unwrap().is_empty());
    assert!(
        sources
            .policies
            .lock()
            .unwrap()
            .iter()
            .all(|p| p == "replacement")
    );
    assert_eq!(next.effects.load(Ordering::SeqCst), 1);
    assert_eq!(
        std::fs::read_to_string(dir.path().join("effects")).unwrap(),
        "effect\n"
    );
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
    let quota = quota(&reopened, &base).await.unwrap();
    assert_eq!(quota.used.model_calls, 3);
    assert_eq!(quota.used.tool_calls, 2);
    assert_eq!(quota.reserved, BudgetCost::default());
}

#[tokio::test]
async fn explicit_removal_and_rollback_keep_the_original_state_and_do_not_poll_retired_sources() {
    for rollback in [false, true] {
        let dir = tempfile::tempdir().unwrap();
        let (store, mut registry, base, gates, _) = setup(dir.path(), false, false);
        let sources = install(&mut registry);
        let base = source_system(&registry, &base, Some("original"), "empty");
        let replacement = source_system(&registry, &base, Some("replacement"), "empty");
        let removed = source_system(&registry, &replacement, None, "empty");
        let supervisor = Arc::new(RunSupervisor::new(store.clone()));
        park(&supervisor, &store, &registry, &base, &gates).await;
        let state = checkpoint(&store, &base).await.state;
        supervisor
            .submit_transition(source_update("replace", &replacement, 0), &replacement)
            .await
            .unwrap();
        execute(&supervisor, &registry, "replace").await;
        let target = if rollback { &base } else { &removed };
        supervisor
            .submit_transition(source_update("finish", target, 1), target)
            .await
            .unwrap();
        execute(&supervisor, &registry, "finish").await;
        let live = store.live_execution("run").await.unwrap().unwrap();
        assert_eq!(live.revision, 2);
        assert_eq!(live.protocol, "nofy.live/v5");
        assert_eq!(
            content_digest(&live.after.state.context_progress).unwrap(),
            content_digest(&state.context_progress).unwrap()
        );
        assert_eq!(live.after.state.messages, state.messages);
        release(&supervisor, &store).await;
        assert!(matches!(
            supervisor
                .execute_submitted(&registry, "run")
                .await
                .unwrap(),
            Some(RunOutcome::Completed { .. })
        ));
        assert_eq!(
            *sources.snapshots.lock().unwrap(),
            if rollback {
                vec!["original", "original"]
            } else {
                vec!["original"]
            }
        );
        assert!(
            sources
                .contexts
                .lock()
                .unwrap()
                .iter()
                .all(|s| s == "original")
        );
        assert!(
            sources
                .policies
                .lock()
                .unwrap()
                .iter()
                .all(|s| s == "original")
        );
        assert_eq!(
            std::fs::read_to_string(dir.path().join("effects")).unwrap(),
            "effect\n"
        );
    }
}
