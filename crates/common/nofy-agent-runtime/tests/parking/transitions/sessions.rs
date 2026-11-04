use super::*;

fn adopt(
    store: &SqliteStore,
    run: &str,
    command: &str,
    source: &str,
    revision: u64,
    binding: u64,
) -> impl std::future::Future<Output = SessionTurnCommand> {
    let store = store.clone();
    let run = run.to_owned();
    let command = command.to_owned();
    let source = source.to_owned();
    async move {
        SessionTurnCommand {
            command_id: command,
            source_run_id: source,
            expected_source_revision: revision,
            expected_binding_revision: binding,
            turn: SessionTurnInput::Queued {
                submission_digest: store.execution_job(&run).await.unwrap().unwrap().digest,
                run_id: run,
            },
        }
    }
}

#[tokio::test]
async fn changed_model_prompt_carries_into_queued_and_chained_roots_without_rewriting_inputs_or_budget()
 {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, _) = setup(dir.path(), true, true);
    let (next, requests) = target(&mut registry, &base);
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
        .submit_managed(request(&base, "two"), &base)
        .await
        .unwrap();
    let original = store.execution_job("two").await.unwrap().unwrap();
    let command = adopt(&store, "two", "bind-two", "run", 0, 0).await;
    let first = supervisor
        .submit_session_turn("session", command.clone())
        .await
        .unwrap();
    let three = SessionTurnCommand {
        command_id: "bind-three".into(),
        source_run_id: "two".into(),
        expected_source_revision: 0,
        expected_binding_revision: 0,
        turn: SessionTurnInput::New {
            run_id: "three".into(),
            input: PendingInterjection {
                text: "third input".into(),
                attachments: vec![],
            },
        },
    };
    supervisor
        .submit_session_turn("session", three)
        .await
        .unwrap();
    supervisor
        .submit_transition(change("change", &next, 0), &next)
        .await
        .unwrap();
    execute(&supervisor, &registry, "change").await;
    release(&supervisor, &store).await;
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "run")
            .await
            .unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    let before = checkpoint(&store, &base).await;
    // Source expected revision is a real CAS, not a hint. Input stays queued.
    assert!(
        supervisor
            .execute_submitted(&registry, "two")
            .await
            .is_err()
    );
    assert!(store.session_seed("two").await.unwrap().is_none());
    assert_eq!(
        content_digest(&before).unwrap(),
        content_digest(&checkpoint(&store, &base).await).unwrap()
    );
    let replacement = adopt(&store, "two", "rebind-two", "run", 1, 1).await;
    let rebound = supervisor
        .submit_session_turn("session", replacement.clone())
        .await
        .unwrap();
    assert_eq!(rebound.revision, 2);
    assert_eq!(
        content_digest(&first).unwrap(),
        content_digest(
            &supervisor
                .submit_session_turn("session", command)
                .await
                .unwrap()
        )
        .unwrap()
    );
    assert!(
        supervisor
            .submit_session_turn("session", adopt(&store, "two", "stale", "run", 1, 1).await)
            .await
            .is_err()
    );
    let db = rusqlite::Connection::open(store.path().unwrap()).unwrap();
    db.execute_batch("CREATE TRIGGER fail_start BEFORE INSERT ON agent_runtime_runs WHEN NEW.id='two' BEGIN SELECT RAISE(ABORT,'injected start failure'); END;").unwrap();
    assert!(
        supervisor
            .execute_submitted(&registry, "two")
            .await
            .is_err()
    );
    let seed = store.session_seed("two").await.unwrap().unwrap();
    assert_eq!(seed.source_revision, 1);
    assert_eq!(seed.source_command_id.as_deref(), Some("change"));
    assert_eq!(seed.command_id, "rebind-two");
    assert_eq!(seed.release, next.bundle.digest);
    assert_eq!(seed.checkpoint_revision, before.revision);
    assert!(store.execution_record("two").await.unwrap().is_none());
    assert_eq!(
        content_digest(&before).unwrap(),
        content_digest(&checkpoint(&store, &base).await).unwrap()
    );
    assert!(
        supervisor
            .submit_session_turn("session", adopt(&store, "two", "late", "run", 1, 2).await)
            .await
            .is_err()
    );
    assert!(
        supervisor
            .execute_program(
                base.program("chat").unwrap(),
                RunInput::new("bypass"),
                RunContext::new("thread", "two")
            )
            .await
            .is_err()
    );
    db.execute_batch("DROP TRIGGER fail_start").unwrap();
    let reopened = SqliteStore::open(&store.path().unwrap()).unwrap();
    let recovered = RunSupervisor::new(reopened.clone());
    assert!(matches!(
        recovered.execute_submitted(&registry, "two").await.unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    let after = reopened.execution_job("two").await.unwrap().unwrap();
    assert_eq!(original.digest, after.digest);
    assert_eq!(
        content_digest(&original.submission).unwrap(),
        content_digest(&after.submission).unwrap()
    );
    assert_eq!(gates.calls.load(Ordering::SeqCst), 1);
    let seen = requests.lock().unwrap();
    assert_eq!(seen.len(), 2);
    assert_eq!(
        seen[1].messages[0],
        Message::System {
            content: "new literal {prompt}".into()
        }
    );
    drop(seen);
    assert!(matches!(
        recovered
            .execute_submitted(&registry, "three")
            .await
            .unwrap(),
        Some(RunOutcome::BudgetExceeded { .. })
    ));
    let chained = reopened.session_seed("three").await.unwrap().unwrap();
    assert_eq!(chained.source_revision, 0);
    assert_eq!(
        chained.source_seed_command_id.as_deref(),
        Some("rebind-two")
    );
    assert_eq!(chained.composition_digest, seed.composition_digest);
    assert_eq!(requests.lock().unwrap().len(), 2);
    let cp = checkpoint(&reopened, &base).await;
    assert_eq!(cp.composition, before.composition);
    assert_eq!(
        cp.state.input_progress.initial.as_ref().unwrap().run_id,
        "three"
    );
    assert_eq!(
        std::fs::read_to_string(dir.path().join("effects")).unwrap(),
        "effect\n"
    );
    assert_eq!(
        content_digest(&reopened.execution_record("run").await.unwrap()).unwrap(),
        content_digest(&store.execution_record("run").await.unwrap()).unwrap()
    );
}
