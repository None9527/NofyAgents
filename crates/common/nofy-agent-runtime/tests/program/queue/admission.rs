use super::*;

#[tokio::test]
async fn program_submission_is_pure_has_no_invented_input_and_keeps_legacy_digest_bytes() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let setup = setup(&store, false, false, false, true);
    let program = program(&setup, "tool");
    let supervisor = RunSupervisor::new(store.clone());
    let request = submission(&program, "root");
    let queued = supervisor.submit_program(request.clone()).await.unwrap();
    assert!(matches!(queued.status, JobStatus::Queued));
    assert!(queued.submission.input.is_none());
    assert_eq!(
        supervisor.submit_program(request).await.unwrap().digest,
        queued.digest
    );
    assert!(store.execution_record("root").await.unwrap().is_none());
    assert_eq!(setup.effects.load(Ordering::SeqCst), 0);
    assert_eq!(setup.models.load(Ordering::SeqCst), 0);
    let state = complete(&supervisor, &setup, "root").await;
    assert!(
        state
            .messages
            .iter()
            .all(|m| !matches!(m, Message::User { .. } | Message::UserParts { .. }))
    );
    assert_eq!(
        state.input_progress.initial.as_ref().unwrap().digest,
        queued.digest
    );
    assert!(matches!(
        store.program_job("root").await.unwrap().unwrap().status,
        JobStatus::Closed
    ));
    assert_eq!(setup.effects.load(Ordering::SeqCst), 1);
    assert_eq!(totals(&store, &setup).await.used.model_calls, 0);
    assert_eq!(totals(&store, &setup).await.used.steps, 0);

    let legacy =
        JobSubmission::for_agent(&agent(&setup), "old-thread", "legacy", message("old input"));
    #[derive(Serialize)]
    struct LegacySaved<'a> {
        submission: &'a JobSubmission,
        source: Option<Value>,
    }
    let bytes = serde_json::to_vec(&LegacySaved {
        submission: &legacy,
        source: None,
    })
    .unwrap();
    let saved = supervisor.submit(legacy.clone()).await.unwrap();
    assert_eq!(saved.digest, format!("{:x}", Sha256::digest(&bytes)));
    let sql = rusqlite::Connection::open(store.path()).unwrap();
    let payload: String = sql
        .query_row(
            "SELECT payload FROM agent_runtime_jobs WHERE run_id='legacy'",
            [],
            |r| r.get(0),
        )
        .unwrap();
    assert_eq!(payload.as_bytes(), bytes);
    let old: JobRecord = store.job("legacy").await.unwrap().unwrap();
    assert_eq!(old.submission.snapshot.agent.name, "queued-agent");
    assert_eq!(old.submission.input.text, "old input");
    assert_eq!(
        serde_json::to_value(legacy).unwrap(),
        serde_json::to_value(old.submission).unwrap()
    );
}

#[tokio::test]
async fn model_free_queue_runs_each_admitted_root_once_on_the_same_thread() {
    for kind in kinds().into_iter().filter(|k| *k != "agent") {
        let temp = tempfile::tempdir().unwrap();
        let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
        let setup = setup(&store, false, false, false, false);
        let program = program(&setup, kind);
        let supervisor = RunSupervisor::new(store.clone());
        let first = supervisor
            .submit_program(submission(&program, "root"))
            .await
            .unwrap();
        let second = supervisor
            .submit_program(submission(&program, "second"))
            .await
            .unwrap();
        assert!(first.sequence < second.sequence);
        assert!(
            supervisor
                .execute_submitted(&setup.registry, "second")
                .await
                .unwrap()
                .is_none()
        );
        assert!(store.execution_record("second").await.unwrap().is_none());
        complete(&supervisor, &setup, "root").await;
        let state = complete(&supervisor, &setup, "second").await;
        assert_eq!(state.execution_run_id.as_deref(), Some("second"));
        assert_eq!(
            state.input_progress.initial.as_ref().unwrap().digest,
            second.digest
        );
        assert!(
            state
                .messages
                .iter()
                .all(|m| !matches!(m, Message::User { .. } | Message::UserParts { .. }))
        );
        assert_eq!(setup.effects.load(Ordering::SeqCst), 2);
        assert_eq!(setup.models.load(Ordering::SeqCst), 0);
        complete(&supervisor, &setup, "root").await;
        assert_eq!(setup.effects.load(Ordering::SeqCst), 2);
        assert_eq!(
            store
                .execution_record("second")
                .await
                .unwrap()
                .unwrap()
                .status,
            "completed"
        );
        supervisor
            .submit_program(submission(&program, "cancelled"))
            .await
            .unwrap();
        supervisor.cancel_submitted("cancelled").await.unwrap();
        assert!(
            supervisor
                .execute_submitted(&setup.registry, "cancelled")
                .await
                .unwrap()
                .is_none()
        );
    }
}

#[tokio::test]
async fn mixed_agent_queue_and_v2_next_turn_keep_the_original_fifo_and_wire() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let setup = setup(&store, false, false, false, false);
    let agent = agent(&setup);
    let program = CompiledProgram::for_agent(&agent).unwrap();
    let supervisor = RunSupervisor::new(store.clone());
    supervisor
        .submit(JobSubmission::for_agent(
            &agent,
            "thread",
            "legacy",
            message("first"),
        ))
        .await
        .unwrap();
    supervisor
        .submit_program(
            ProgramSubmission::for_program(&program, "thread", "root", Some(message("second")))
                .unwrap(),
        )
        .await
        .unwrap();
    assert!(
        supervisor
            .execute_submitted(&setup.registry, "root")
            .await
            .unwrap()
            .is_none()
    );
    complete(&supervisor, &setup, "legacy").await;
    complete(&supervisor, &setup, "root").await;
    let address = InputAddress {
        root_run_id: "root".into(),
        run_id: "root".into(),
        thread_id: "thread".into(),
        agent: "queued-agent".into(),
    };
    let delivery = store
        .submit(MailEnvelope {
            address: address.clone(),
            input_id: "third-input".into(),
            input: MailInput::NextTurn {
                run_id: "third".into(),
                snapshot: agent.snapshot.clone(),
                message: message("third"),
            },
        })
        .await
        .unwrap();
    let queued = store.program_job("third").await.unwrap().unwrap();
    assert_eq!(queued.submission.schema_version, 2);
    assert!(store.job("third").await.is_err());
    let state = complete(&supervisor, &setup, "third").await;
    let users: Vec<_> = state
        .messages
        .iter()
        .filter_map(|m| {
            if let Message::User { content } = m {
                Some(content.as_str())
            } else {
                None
            }
        })
        .collect();
    assert_eq!(users, vec!["first", "second", "third"]);
    assert_eq!(setup.models.load(Ordering::SeqCst), 3);
    assert!(matches!(
        store
            .input_status(&address, "third-input")
            .await
            .unwrap()
            .unwrap()
            .status,
        InputStatus::Delivered
    ));
    assert_eq!(
        delivery.sequence,
        store
            .input_status(&address, "third-input")
            .await
            .unwrap()
            .unwrap()
            .sequence
    );
    complete(&supervisor, &setup, "legacy").await;
    assert_eq!(setup.models.load(Ordering::SeqCst), 3);
}

#[tokio::test]
async fn changed_or_mixed_submissions_fail_without_overwriting_accepted_jobs() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let setup = setup(&store, false, false, false, false);
    let pure = program(&setup, "tool");
    let sampled = program(&setup, "agent");
    let supervisor = RunSupervisor::new(store.clone());
    assert!(
        ProgramSubmission::for_program(&pure, "thread", "bad", Some(message("invented"))).is_err()
    );
    assert!(ProgramSubmission::for_program(&sampled, "thread", "bad", None).is_err());
    let request = submission(&pure, "root");
    let original = supervisor.submit_program(request.clone()).await.unwrap();
    let mut changed = request.clone();
    changed.snapshot.version = 1;
    assert!(supervisor.submit_program(changed).await.is_err());
    let mut changed = request.clone();
    changed.schema_version = 1;
    assert!(supervisor.submit_program(changed).await.is_err());
    let mut changed = request.clone();
    changed.composition_digest = "0".repeat(64);
    assert!(supervisor.submit_program(changed).await.is_err());
    let mut changed = request;
    changed.thread_id = "other".into();
    assert!(supervisor.submit_program(changed).await.is_err());
    assert_eq!(
        store.program_job("root").await.unwrap().unwrap().digest,
        original.digest
    );
    assert!(store.execution_record("root").await.unwrap().is_none());
    assert_eq!(setup.effects.load(Ordering::SeqCst), 0);
    assert_eq!(setup.models.load(Ordering::SeqCst), 0);
}
