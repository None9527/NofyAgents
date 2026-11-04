use super::*;

#[tokio::test]
async fn seed_write_failure_is_atomic_and_a_prepared_checkpoint_drift_never_dispatches() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, system, calls, _, _) = setup(dir.path(), 3);
    let supervisor = RunSupervisor::new(store.clone());
    supervisor
        .submit_managed(request(&system, "one"), &system)
        .await
        .unwrap();
    supervisor.create_session(session()).await.unwrap();
    supervisor
        .submit_session_turn("conversation", new("two", "two", "one"))
        .await
        .unwrap();
    supervisor
        .execute_submitted(&registry, "one")
        .await
        .unwrap();
    let before = content_digest(&checkpoint(&store).await).unwrap();
    let db = rusqlite::Connection::open(store.path().unwrap()).unwrap();
    db.execute_batch("CREATE TRIGGER fail_seed BEFORE INSERT ON agent_runtime_session_seeds BEGIN SELECT RAISE(ABORT,'injected seed failure'); END;").unwrap();
    assert!(
        supervisor
            .execute_submitted(&registry, "two")
            .await
            .is_err()
    );
    assert!(store.session_seed("two").await.unwrap().is_none());
    assert!(store.execution_record("two").await.unwrap().is_none());
    assert_eq!(before, content_digest(&checkpoint(&store).await).unwrap());
    db.execute_batch("DROP TRIGGER fail_seed; CREATE TRIGGER fail_run BEFORE INSERT ON agent_runtime_runs WHEN NEW.id='two' BEGIN SELECT RAISE(ABORT,'injected start failure'); END;").unwrap();
    assert!(
        supervisor
            .execute_submitted(&registry, "two")
            .await
            .is_err()
    );
    assert!(store.session_seed("two").await.unwrap().is_some());
    db.execute_batch("DROP TRIGGER fail_run; UPDATE agent_runtime_checkpoints SET payload=json_set(payload,'$.revision',revision+1),revision=revision+1 WHERE key='4:chatthread';").unwrap();
    assert!(
        supervisor
            .execute_submitted(&registry, "two")
            .await
            .is_err()
    );
    assert!(store.execution_record("two").await.unwrap().is_none());
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    assert_eq!(
        store
            .session_turns("conversation", 0, 10)
            .await
            .unwrap()
            .len(),
        1
    );
}
fn new(command: &str, run: &str, source: &str) -> SessionTurnCommand {
    SessionTurnCommand {
        command_id: command.into(),
        source_run_id: source.into(),
        expected_source_revision: 0,
        expected_binding_revision: 0,
        turn: SessionTurnInput::New {
            run_id: run.into(),
            input: PendingInterjection {
                text: run.into(),
                attachments: vec![],
            },
        },
    }
}
#[tokio::test]
async fn admission_is_atomic_exact_and_cancellation_can_be_explicitly_rebound_without_losing_input()
{
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, system, calls, _, scope) = setup(dir.path(), 3);
    let supervisor = RunSupervisor::new(store.clone());
    supervisor
        .submit_managed(request(&system, "one"), &system)
        .await
        .unwrap();
    supervisor.create_session(session()).await.unwrap();
    let db = rusqlite::Connection::open(store.path().unwrap()).unwrap();
    db.execute_batch("CREATE TRIGGER fail_binding BEFORE INSERT ON agent_runtime_session_commands BEGIN SELECT RAISE(ABORT,'injected admission failure'); END;").unwrap();
    assert!(
        supervisor
            .submit_session_turn("conversation", new("two", "two", "one"))
            .await
            .is_err()
    );
    assert!(store.execution_job("two").await.unwrap().is_none());
    assert!(store.managed_run("two").await.unwrap().is_none());
    db.execute_batch("DROP TRIGGER fail_binding").unwrap();
    let first = supervisor
        .submit_session_turn("conversation", new("two", "two", "one"))
        .await
        .unwrap();
    assert_eq!(
        content_digest(&first).unwrap(),
        content_digest(
            &supervisor
                .submit_session_turn("conversation", new("two", "two", "one"))
                .await
                .unwrap()
        )
        .unwrap()
    );
    assert!(
        supervisor
            .submit_session_turn("conversation", new("two", "different", "one"))
            .await
            .is_err()
    );
    supervisor
        .submit_session_turn("conversation", new("three", "three", "two"))
        .await
        .unwrap();
    assert!(
        supervisor
            .execute_submitted(&registry, "two")
            .await
            .unwrap()
            .is_none()
    );
    supervisor
        .execute_submitted(&registry, "one")
        .await
        .unwrap();
    supervisor.cancel_submitted("two").await.unwrap();
    let original = store.execution_job("three").await.unwrap().unwrap();
    assert!(
        supervisor
            .execute_submitted(&registry, "three")
            .await
            .is_err()
    );
    let corrected = SessionTurnCommand {
        command_id: "correct".into(),
        source_run_id: "one".into(),
        expected_source_revision: 0,
        expected_binding_revision: 1,
        turn: SessionTurnInput::Queued {
            run_id: "three".into(),
            submission_digest: original.digest.clone(),
        },
    };
    supervisor
        .submit_session_turn("conversation", corrected)
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
        store.execution_job("three").await.unwrap().unwrap().digest,
        original.digest
    );
    assert_eq!(calls.load(Ordering::SeqCst), 2);
    assert_eq!(
        store
            .inspect(&scope)
            .await
            .unwrap()
            .unwrap()
            .used
            .model_calls,
        2
    );
    assert!(
        store
            .inspect(&BudgetScope {
                root_run_id: "three".into(),
                identity: scope.identity
            })
            .await
            .unwrap()
            .is_none()
    );
}
