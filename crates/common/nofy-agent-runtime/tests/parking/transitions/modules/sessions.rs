use super::*;

#[tokio::test]
async fn tools_and_hook_epoch_cross_roots_and_the_next_live_update_preserves_inherited_capabilities()
 {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, _) = setup(dir.path(), false, true);
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
    supervisor
        .submit_transition(update("modules", &next.system, 0, true, true), &next.system)
        .await
        .unwrap();
    execute(&supervisor, &registry, "modules").await;
    release(&supervisor, &store).await;
    supervisor
        .execute_submitted(&registry, "run")
        .await
        .unwrap();
    let inherited = store
        .live_execution("run")
        .await
        .unwrap()
        .unwrap()
        .modules
        .unwrap();
    let input = SessionTurnCommand {
        command_id: "bind-two".into(),
        source_run_id: "run".into(),
        expected_source_revision: 1,
        expected_binding_revision: 0,
        turn: SessionTurnInput::New {
            run_id: "two".into(),
            input: PendingInterjection {
                text: "new turn".into(),
                attachments: vec![],
            },
        },
    };
    supervisor
        .submit_session_turn("session", input)
        .await
        .unwrap();
    next.probe.block_first.store(true, Ordering::SeqCst);
    let worker = {
        let s = supervisor.clone();
        let r = registry.clone();
        tokio::spawn(async move { s.execute_submitted(&r, "two").await })
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
    assert!(
        matches!(worker.await.unwrap().unwrap(),Some(RunOutcome::Paused{ref reason,..}) if reason["kind"]=="parked")
    );
    assert_eq!(
        store
            .session_seed("two")
            .await
            .unwrap()
            .unwrap()
            .modules
            .as_ref(),
        Some(&inherited)
    );
    let mut doc = serde_json::to_value(&next.system.bundle.document).unwrap();
    doc["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|m| m["reference"] == r("prompt"))
        .unwrap()["config"]["text"] = json!("inherited tools and hooks, new prompt");
    let target = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
    let mut change = change("prompt-two", &target, 0);
    change.run_id = "two".into();
    if let ManagedCommand::Transition {
        park_command_id, ..
    } = &mut change.command
    {
        *park_command_id = "park-two".into();
    }
    supervisor.submit_transition(change, &target).await.unwrap();
    execute(&supervisor, &registry, "prompt-two").await;
    let live = store.live_execution("two").await.unwrap().unwrap();
    assert_eq!(live.revision, 1);
    assert_eq!(live.protocol, "nofy.live/v2");
    assert_eq!(live.modules.as_ref(), Some(&inherited));
    // A legacy prompt command cannot implicitly put original tools back.
    let mut stale = change_for_old(&base);
    if let ManagedCommand::Transition {
        park_command_id, ..
    } = &mut stale.command
    {
        *park_command_id = "park-two".into();
    }
    assert!(supervisor.submit_transition(stale, &base).await.is_err());
    store
        .enqueue_managed_action(ManagedAction {
            command_id: "release-two".into(),
            run_id: "two".into(),
            command: ManagedCommand::Unpark {
                park_command_id: "park-two".into(),
            },
        })
        .await
        .unwrap();
    execute(&supervisor, &registry, "release-two").await;
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "two")
            .await
            .unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    supervisor
        .submit_session_turn(
            "session",
            SessionTurnCommand {
                command_id: "bind-three".into(),
                source_run_id: "two".into(),
                expected_source_revision: 1,
                expected_binding_revision: 0,
                turn: SessionTurnInput::New {
                    run_id: "three".into(),
                    input: PendingInterjection {
                        text: "third turn".into(),
                        attachments: vec![],
                    },
                },
            },
        )
        .await
        .unwrap();
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "three")
            .await
            .unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    assert_eq!(
        store
            .session_seed("three")
            .await
            .unwrap()
            .unwrap()
            .modules
            .as_ref(),
        Some(&inherited)
    );
    assert_eq!(next.effects.load(Ordering::SeqCst), 3);
    assert_eq!(gates.calls.load(Ordering::SeqCst), 1);
    assert!(
        !next
            .hooks
            .lock()
            .unwrap()
            .iter()
            .any(|name| name == "session_start")
    );
    assert_eq!(
        next.hooks
            .lock()
            .unwrap()
            .iter()
            .filter(|name| name.as_str() == "user_input")
            .count(),
        2
    );
    let requests = next.requests.lock().unwrap();
    assert_eq!(
        requests.last().unwrap().messages[0],
        Message::System {
            content: "inherited tools and hooks, new prompt".into()
        }
    );
    assert!(
        requests
            .last()
            .unwrap()
            .tools
            .iter()
            .any(|t| t.function.name == "updated")
    );
    assert!(
        !requests
            .last()
            .unwrap()
            .tools
            .iter()
            .any(|t| t.function.name == "append")
    );
}
fn change_for_old(base: &CompiledSystem) -> ManagedAction {
    ManagedAction {
        command_id: "implicit-rollback".into(),
        run_id: "two".into(),
        command: ManagedCommand::Transition {
            park_command_id: "park-two".into(),
            expected_revision: 1,
            release: base.bundle.digest.clone(),
            program: "chat".into(),
        },
    }
}
