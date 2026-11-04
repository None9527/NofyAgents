use super::*;

#[tokio::test]
async fn source_selection_survives_prompt_only_update_and_explicit_session_handoff() {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, _) = setup(dir.path(), true, false);
    let sources = install(&mut registry);
    let base = source_system(&registry, &base, Some("original"), "empty");
    let (target, requests) = super::super::super::target(&mut registry, &base);
    let target = source_system(&registry, &target, Some("replacement"), "empty");
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
        .submit_transition(source_update("sources", &target, 0), &target)
        .await
        .unwrap();
    execute(&supervisor, &registry, "sources").await;
    let mut doc = serde_json::to_value(&target.bundle.document).unwrap();
    doc["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|m| m["reference"] == r("prompt"))
        .unwrap()["config"]["text"] = json!("later prompt, same effective sources");
    let prompt = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
    supervisor
        .submit_transition(change("prompt-only", &prompt, 1), &prompt)
        .await
        .unwrap();
    execute(&supervisor, &registry, "prompt-only").await;
    let live = store.live_execution("run").await.unwrap().unwrap();
    assert_eq!(live.protocol, "nofy.live/v5");
    assert!(live.modules.as_ref().unwrap().context_sources);
    assert!(live.modules.as_ref().unwrap().context_policies);
    assert!(live.modules.as_ref().unwrap().tool_sources);
    release(&supervisor, &store).await;
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "run")
            .await
            .unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    supervisor
        .submit_session_turn(
            "session",
            SessionTurnCommand {
                command_id: "turn-two".into(),
                source_run_id: "run".into(),
                expected_source_revision: 2,
                expected_binding_revision: 0,
                turn: SessionTurnInput::New {
                    run_id: "two".into(),
                    input: PendingInterjection {
                        text: "continue with selected sources".into(),
                        attachments: vec![],
                    },
                },
            },
        )
        .await
        .unwrap();
    let reopened = SqliteStore::open(&dir.path().join("runtime.sqlite")).unwrap();
    let supervisor = RunSupervisor::new(reopened.clone());
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "two")
            .await
            .unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    let selection = reopened
        .session_seed("two")
        .await
        .unwrap()
        .unwrap()
        .modules
        .unwrap();
    assert!(selection.context_sources && selection.context_policies && selection.tool_sources);
    assert_eq!(
        *sources.snapshots.lock().unwrap(),
        ["original", "replacement", "replacement"]
    );
    let requests = requests.lock().unwrap();
    assert_eq!(requests.len(), 2);
    for request in requests.iter() {
        assert!(
            matches!(&request.messages[0], Message::System {content} if content == "later prompt, same effective sources")
        );
        assert!(
            request.messages.iter().any(
                |m| matches!(m, Message::User {content} if content == "retrieved:replacement")
            )
        );
        assert!(
            !request
                .messages
                .iter()
                .any(|m| matches!(m, Message::User {content} if content == "retrieved:original"))
        );
    }
    drop(requests);
    assert_eq!(
        std::fs::read_to_string(dir.path().join("effects")).unwrap(),
        "effect\n"
    );
}
