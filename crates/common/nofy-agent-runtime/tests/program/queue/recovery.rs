use super::*;

#[tokio::test]
async fn all_programs_recover_record_before_checkpoint_and_checkpoint_before_ack_windows() {
    for kind in kinds() {
        for window in ["checkpoint", "ack"] {
            let temp = tempfile::tempdir().unwrap();
            let path = temp.path().join("runtime.db");
            let store = SqliteStore::open(&path).unwrap();
            let setup = setup(&store, false, false, false, false);
            let program = program(&setup, kind);
            let supervisor = RunSupervisor::new(store.clone());
            let queued = supervisor
                .submit_program(submission(&program, "root"))
                .await
                .unwrap();
            let sql = rusqlite::Connection::open(&path).unwrap();
            if window == "checkpoint" {
                reject_first(&sql, &program)
            } else {
                reject_ack(&sql)
            }
            assert!(
                supervisor
                    .execute_submitted(&setup.registry, "root")
                    .await
                    .is_err(),
                "{kind}/{window}"
            );
            assert_eq!(setup.effects.load(Ordering::SeqCst), 0);
            assert_eq!(setup.models.load(Ordering::SeqCst), 0);
            assert!(store.execution_record("root").await.unwrap().is_some());
            assert!(matches!(
                store.program_job("root").await.unwrap().unwrap().status,
                JobStatus::Waiting
            ));
            let cp = store.load(&program.checkpoint_key("thread")).await.unwrap();
            assert_eq!(cp.is_some(), window == "ack");
            sql.execute_batch(
                "DROP TRIGGER IF EXISTS reject_first; DROP TRIGGER IF EXISTS reject_ack;",
            )
            .unwrap();
            drop(sql);
            let reopened = SqliteStore::open(&path).unwrap();
            let next = RunSupervisor::new(reopened);
            let state = complete(&next, &setup, "root").await;
            assert_eq!(
                state.input_progress.initial.as_ref().unwrap().digest,
                queued.digest
            );
            complete(&next, &setup, "root").await;
            assert_eq!(
                setup.models.load(Ordering::SeqCst),
                usize::from(kind == "agent")
            );
            assert_eq!(
                setup.effects.load(Ordering::SeqCst),
                usize::from(kind != "agent")
            );
            assert!(matches!(
                store.program_job("root").await.unwrap().unwrap().status,
                JobStatus::Closed
            ));
        }
    }
}

#[tokio::test]
async fn v2_next_turn_ack_failure_keeps_the_committed_input_once_after_reopen() {
    let temp = tempfile::tempdir().unwrap();
    let path = temp.path().join("runtime.db");
    let store = SqliteStore::open(&path).unwrap();
    let setup = setup(&store, false, false, false, false);
    let agent = agent(&setup);
    let program = CompiledProgram::for_agent(&agent).unwrap();
    let supervisor = RunSupervisor::new(store.clone());
    supervisor
        .submit_program(submission(&program, "root"))
        .await
        .unwrap();
    complete(&supervisor, &setup, "root").await;
    let address = InputAddress {
        root_run_id: "root".into(),
        run_id: "root".into(),
        thread_id: "thread".into(),
        agent: "queued-agent".into(),
    };
    store
        .submit(MailEnvelope {
            address: address.clone(),
            input_id: "next".into(),
            input: MailInput::NextTurn {
                run_id: "next".into(),
                snapshot: agent.snapshot.clone(),
                message: message("once"),
            },
        })
        .await
        .unwrap();
    let sql = rusqlite::Connection::open(&path).unwrap();
    sql.execute_batch("CREATE TRIGGER lose_source BEFORE UPDATE OF status ON agent_runtime_mailbox WHEN NEW.input_id='next' AND NEW.status='delivered' BEGIN SELECT RAISE(ABORT,'source ack lost'); END;").unwrap();
    assert!(
        supervisor
            .execute_submitted(&setup.registry, "next")
            .await
            .is_err()
    );
    assert_eq!(setup.models.load(Ordering::SeqCst), 1);
    assert!(matches!(
        store
            .input_status(&address, "next")
            .await
            .unwrap()
            .unwrap()
            .status,
        InputStatus::Claimed
    ));
    sql.execute_batch("DROP TRIGGER lose_source").unwrap();
    drop(sql);
    let state = complete(
        &RunSupervisor::new(SqliteStore::open(&path).unwrap()),
        &setup,
        "next",
    )
    .await;
    assert_eq!(
        state
            .messages
            .iter()
            .filter(|m| matches!(m,Message::User {content} if content=="once"))
            .count(),
        1
    );
    assert_eq!(setup.models.load(Ordering::SeqCst), 2);
    assert!(matches!(
        store.program_job("next").await.unwrap().unwrap().status,
        JobStatus::Closed
    ));
    assert!(matches!(
        store
            .input_status(&address, "next")
            .await
            .unwrap()
            .unwrap()
            .status,
        InputStatus::Delivered
    ));
}

#[tokio::test]
async fn queued_model_failure_waits_for_explicit_control_and_does_not_skip_to_a_peer() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let setup = setup(&store, false, false, true, false);
    let agent = agent(&setup);
    let program = CompiledProgram::for_agent(&agent).unwrap();
    let supervisor = RunSupervisor::new(store.clone());
    supervisor
        .submit_program(submission(&program, "root"))
        .await
        .unwrap();
    supervisor
        .submit_program(submission(&program, "peer"))
        .await
        .unwrap();
    assert!(
        supervisor
            .execute_submitted(&setup.registry, "root")
            .await
            .is_err()
    );
    assert!(
        supervisor
            .execute_submitted(&setup.registry, "root")
            .await
            .is_err()
    );
    assert_eq!(setup.models.load(Ordering::SeqCst), 1);
    assert!(matches!(
        store.program_job("root").await.unwrap().unwrap().status,
        JobStatus::Waiting
    ));
    assert!(
        supervisor
            .execute_submitted(&setup.registry, "peer")
            .await
            .unwrap()
            .is_none()
    );
    let ticket = agent
        .agent
        .with_checkpointer(Arc::new(store.clone()))
        .model_retry_ticket("thread", "root")
        .await
        .unwrap()
        .unwrap();
    let command = ModelRetryCommand {
        command_id: "retry".into(),
        ticket,
    };
    assert!(matches!(
        supervisor
            .control_program(
                &program,
                RunControlCommand::RetryModel(command.clone()),
                context()
            )
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert!(matches!(
        store.program_job("root").await.unwrap().unwrap().status,
        JobStatus::Closed
    ));
    assert!(matches!(
        supervisor
            .control_program(
                &program,
                RunControlCommand::RetryModel(command.clone()),
                context()
            )
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    let mut changed = command;
    changed.command_id = "not-accepted".into();
    assert!(
        supervisor
            .control_program(&program, RunControlCommand::RetryModel(changed), context())
            .await
            .is_err()
    );
    assert!(matches!(
        store.program_job("root").await.unwrap().unwrap().status,
        JobStatus::Closed
    ));
    assert_eq!(setup.models.load(Ordering::SeqCst), 2);
    complete(&supervisor, &setup, "peer").await;
    assert_eq!(setup.models.load(Ordering::SeqCst), 3);
}

#[tokio::test]
async fn queued_uncertain_effect_blocks_peers_until_evidence_settles_it() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let setup = setup(&store, false, true, false, true);
    let program = Arc::new(program(&setup, "tool"));
    let supervisor = RunSupervisor::new(store.clone());
    supervisor
        .submit_program(submission(&program, "root"))
        .await
        .unwrap();
    supervisor
        .submit_program(submission(&program, "peer"))
        .await
        .unwrap();
    let worker_store = store.clone();
    let registry = setup.registry.clone();
    let worker = tokio::spawn(async move {
        RunSupervisor::new(worker_store)
            .execute_submitted(&registry, "root")
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
    let cursor = store.cancel(&address, "cancel").await.unwrap();
    assert!(matches!(
        worker.await.unwrap().unwrap(),
        Some(RunOutcome::Cancelled { .. })
    ));
    assert!(
        supervisor
            .execute_submitted(&setup.registry, "peer")
            .await
            .unwrap()
            .is_none()
    );
    assert!(supervisor.cancel_submitted("root").await.is_err());
    assert!(matches!(
        supervisor
            .execute_program(&program, RunInput::resume_after_cancel(cursor), context())
            .await
            .unwrap(),
        RunOutcome::Paused { .. }
    ));
    assert!(matches!(
        store.program_job("root").await.unwrap().unwrap().status,
        JobStatus::Waiting
    ));
    assert_eq!(setup.effects.load(Ordering::SeqCst), 1);
    assert!(matches!(
        supervisor
            .execute_program(
                &program,
                RunInput {
                    resume: true,
                    reconciled: Some(("effect-call".into(), json!({"committed":true}), false)),
                    ..Default::default()
                },
                context()
            )
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert!(matches!(
        store.program_job("root").await.unwrap().unwrap().status,
        JobStatus::Closed
    ));
    assert_eq!(setup.effects.load(Ordering::SeqCst), 1);
    supervisor.cancel_submitted("peer").await.unwrap();
}
