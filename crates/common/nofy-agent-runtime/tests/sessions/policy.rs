use super::*;

fn configured(
    path: &Path,
    when_busy: &str,
    max_calls: u64,
) -> (
    SqliteStore,
    ModuleRegistry,
    CompiledSystem,
    Arc<AtomicUsize>,
    Arc<TestClock>,
    BudgetScope,
) {
    let (store, mut registry, system, calls, clock, scope) = setup(path, max_calls);
    registry
        .register_factory(Arc::new(nofy_agent_runtime::session_policy::RulesFactory))
        .unwrap();
    let mut document = serde_json::to_value(&system.bundle.document).unwrap();
    document["modules"].as_array_mut().unwrap().push(json!({"reference":r("session"),"factory":"session_policy.rules","config":{
        "naming":{"prefix":"developer"},"admission":{"when_busy":when_busy},
        "routing":{"mode":"labels","keys":["project"]},"history":{"archive_after_idle_seconds":"1"}}}));
    document["programs"]["chat"]["definition"]["schema_version"] = json!(2);
    document["programs"]["chat"]["definition"]["session_policy"] = r("session");
    let system = compile_system(serde_json::from_value(document).unwrap(), &registry).unwrap();
    (store, registry, system, calls, clock, scope)
}
fn start(system: &CompiledSystem, command: &str) -> SessionStart {
    SessionStart {
        session_id: "conversation".into(),
        command_id: command.into(),
        expected_session_revision: (),
        request_json: serde_json::to_string(&request(system, "one")).unwrap(),
        labels: [("project".into(), "nofy".into())].into(),
    }
}
fn mutation(id: &str, revision: &str, change: SessionChange) -> SessionCommand {
    SessionCommand {
        session_id: "conversation".into(),
        command_id: id.into(),
        expected_session_revision: revision.into(),
        change,
    }
}
#[tokio::test]
async fn atomic_start_replay_lifecycle_and_budget_survive_reopen() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, system, calls, _, scope) = configured(dir.path(), "queue", 4);
    let supervisor = RunSupervisor::new(store.clone()).with_session_registry(registry.clone());
    let command = start(&system, "start");
    let first = supervisor
        .start_session(command.clone(), &system)
        .await
        .unwrap();
    assert_eq!(first.phase, "applied");
    assert_eq!(calls.load(Ordering::SeqCst), 0);
    let s = first.session.as_ref().unwrap();
    assert_eq!(s.display_name.as_deref(), Some("developer conversation"));
    assert_eq!(s.labels.get("project").map(String::as_str), Some("nofy"));
    assert!(
        supervisor
            .session_command(mutation("close-busy", "0", SessionChange::Close), None)
            .await
            .is_err()
    );
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "one")
            .await
            .unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    let before = store.inspect(&scope).await.unwrap().unwrap();
    let closed = supervisor
        .session_command(mutation("close", "0", SessionChange::Close), None)
        .await
        .unwrap();
    assert_eq!(closed.session_revision.as_deref(), Some("1"));
    let changed = supervisor
        .session_command(mutation("archive", "1", SessionChange::Archive), None)
        .await
        .unwrap();
    assert_eq!(changed.session_revision.as_deref(), Some("2"));
    assert!(
        store
            .session_states("", 100, false)
            .await
            .unwrap()
            .is_empty()
    );
    assert_eq!(store.session_states("", 100, true).await.unwrap().len(), 1);
    // A successful command replays its original fact after later revisions.
    assert_eq!(
        serde_json::to_value(&first).unwrap(),
        serde_json::to_value(
            supervisor
                .start_session(command.clone(), &system)
                .await
                .unwrap()
        )
        .unwrap()
    );
    let mut different = command;
    different
        .labels
        .insert("project".into(), "different".into());
    assert!(supervisor.start_session(different, &system).await.is_err());
    let reopened = SqliteStore::open_with_clock(
        &dir.path().join("runtime.sqlite"),
        Arc::new(TestClock(AtomicU64::new(2000))),
    )
    .unwrap();
    let supervisor = RunSupervisor::new(reopened.clone()).with_session_registry(registry.clone());
    supervisor
        .session_command(mutation("unarchive", "2", SessionChange::Unarchive), None)
        .await
        .unwrap();
    supervisor
        .session_command(mutation("reopen", "3", SessionChange::Reopen), None)
        .await
        .unwrap();
    let after = reopened.inspect(&scope).await.unwrap().unwrap();
    assert_eq!(before.used, after.used);
    assert_eq!(before.deadline_ms, after.deadline_ms);
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    let route = supervisor
        .route_session(
            SessionRoute {
                system: system.bundle.document.name.clone(),
                release: system.bundle.digest.clone(),
                program: "chat".into(),
                session_id: None,
                labels: [("project".into(), "nofy".into())].into(),
            },
            &system,
        )
        .await
        .unwrap();
    assert_eq!(route.status, "unique");
    assert_eq!(route.selected_session_id.as_deref(), Some("conversation"));
}

#[tokio::test]
async fn raw_run_and_next_turn_cannot_bypass_busy_policy_and_keep_input() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, system, calls, _, _) = configured(dir.path(), "reject", 5);
    let supervisor = RunSupervisor::new(store.clone()).with_session_registry(registry.clone());
    supervisor
        .start_session(start(&system, "start"), &system)
        .await
        .unwrap();
    // Direct managed ingress is queued while the first root is still pending.
    supervisor
        .submit_managed(request(&system, "two"), &system)
        .await
        .unwrap();
    let frozen = store.execution_job("two").await.unwrap().unwrap();
    supervisor
        .execute_submitted(&registry, "one")
        .await
        .unwrap();
    assert!(
        supervisor
            .execute_submitted(&registry, "two")
            .await
            .is_err()
    );
    let blocked = store.execution_job("two").await.unwrap().unwrap();
    assert_eq!(blocked.digest, frozen.digest);
    assert!(matches!(blocked.status, JobStatus::Waiting));
    assert!(store.execution_record("two").await.unwrap().is_none());
    let proof = store
        .session_policy_admission("conversation", "two")
        .await
        .unwrap()
        .unwrap();
    assert_eq!(proof["phase"], "rejected");
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    let program::ProgramSnapshot::Agent { snapshot } =
        system.program("chat").unwrap().snapshot.program.clone()
    else {
        panic!("Agent")
    };
    let envelope = MailEnvelope {
        address: InputAddress::for_run("chat", &RunContext::new("thread", "one")),
        input_id: "next-mail".into(),
        input: MailInput::NextTurn {
            run_id: "three".into(),
            snapshot,
            message: PendingInterjection {
                text: "original mail".into(),
                attachments: vec![],
            },
        },
    };
    let accepted = MailboxSender::submit(&store, envelope.clone())
        .await
        .unwrap();
    let original = store.execution_job("three").await.unwrap().unwrap();
    assert!(
        supervisor
            .execute_submitted(&registry, "three")
            .await
            .is_err()
    );
    assert_eq!(
        store.execution_job("three").await.unwrap().unwrap().digest,
        original.digest
    );
    assert_eq!(
        store
            .input_status(&envelope.address, "next-mail")
            .await
            .unwrap()
            .unwrap()
            .digest,
        accepted.digest
    );
    assert!(store.execution_record("three").await.unwrap().is_none());
    assert!(
        supervisor
            .session_command(mutation("blocked-close", "0", SessionChange::Close), None)
            .await
            .is_err()
    );
}

#[tokio::test]
async fn policy_reconfigure_is_fenced_and_next_seed_records_exact_epoch() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, system, calls, _, scope) = configured(dir.path(), "queue", 5);
    let supervisor = RunSupervisor::new(store.clone()).with_session_registry(registry.clone());
    supervisor
        .start_session(start(&system, "start"), &system)
        .await
        .unwrap();
    supervisor
        .execute_submitted(&registry, "one")
        .await
        .unwrap();
    let before = store.inspect(&scope).await.unwrap().unwrap();
    let mut document = serde_json::to_value(&system.bundle.document).unwrap();
    document["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|m| m["factory"] == "session_policy.rules")
        .unwrap()["config"]["naming"]["prefix"] = json!("updated");
    let target = compile_system(serde_json::from_value(document).unwrap(), &registry).unwrap();
    let frozen = nofy_agent_runtime::session_policy::Frozen::select(
        &target.bundle.lock.modules,
        &ModuleRef::new("session", "1"),
        &target.bundle.digest,
    )
    .unwrap();
    let change:SessionChange=serde_json::from_value(json!({"kind":"reconfigure","source_run_id":"one","expected_source_revision":"0","policy":{"release":target.bundle.digest,"module":r("session")}})).unwrap();
    let invalid = mutation("bad-policy", "99", change.clone());
    assert!(
        supervisor
            .session_command(invalid, Some(frozen.clone()))
            .await
            .is_err()
    );
    let request = mutation("policy", "0", change);
    let changed = supervisor
        .session_command(request.clone(), Some(frozen.clone()))
        .await
        .unwrap();
    assert_eq!(changed.policy_revision.as_deref(), Some("1"));
    assert_eq!(changed.session.as_ref().unwrap().budget_root_run_id, "one");
    assert_eq!(
        serde_json::to_value(&changed).unwrap(),
        serde_json::to_value(supervisor.session_command(request, None).await.unwrap()).unwrap()
    );
    let command:SessionTurnCommand=serde_json::from_value(json!({"command_id":"turn-two","source_run_id":"one","expected_source_revision":0,"turn":{"kind":"new","run_id":"two","input":{"text":"continue","attachments":[]}}})).unwrap();
    assert!(
        supervisor
            .submit_session_turn_at("conversation", command.clone(), Some(0))
            .await
            .is_err()
    );
    supervisor
        .submit_session_turn_at("conversation", command, Some(1))
        .await
        .unwrap();
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "two")
            .await
            .unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    let seed = store.session_seed("two").await.unwrap().unwrap();
    assert_eq!(seed.protocol, "nofy.session.seed/v2");
    assert_eq!(seed.session_policy.as_ref().unwrap().policy_revision, 1);
    let after = store.inspect(&scope).await.unwrap().unwrap();
    assert_eq!(after.used.model_calls, before.used.model_calls + 1);
    assert_eq!(after.deadline_ms, before.deadline_ms);
    assert_eq!(calls.load(Ordering::SeqCst), 2);
}

#[tokio::test]
async fn rejected_start_has_receipt_without_half_job_or_session() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, system, _, _, _) = configured(dir.path(), "queue", 5);
    let supervisor = RunSupervisor::new(store.clone()).with_session_registry(registry);
    supervisor
        .submit_managed(request(&system, "one"), &system)
        .await
        .unwrap();
    let receipt = supervisor
        .start_session(start(&system, "cannot-adopt"), &system)
        .await
        .unwrap();
    assert_eq!(receipt.phase, "rejected");
    assert!(store.session("conversation").await.unwrap().is_none());
    assert!(
        store
            .session_command_receipt("conversation", "cannot-adopt")
            .await
            .unwrap()
            .is_some()
    );
    assert_eq!(store.managed_runs(0, 100).await.unwrap().len(), 1);
}

#[tokio::test]
async fn missing_or_rehashed_policy_authority_cannot_dispatch_the_root() {
    let dir = tempfile::tempdir().unwrap();
    let (store, registry, system, calls, _, _) = configured(dir.path(), "queue", 5);
    let supervisor = RunSupervisor::new(store.clone()).with_session_registry(registry.clone());
    supervisor
        .start_session(start(&system, "start"), &system)
        .await
        .unwrap();
    let db = rusqlite::Connection::open(store.path().unwrap()).unwrap();
    let (hash,payload):(String,String)=db.query_row("SELECT digest,payload FROM agent_runtime_session_profiles WHERE session_id='conversation'",[],|r|Ok((r.get(0)?,r.get(1)?))).unwrap();
    let mut changed: Value = serde_json::from_str(&payload).unwrap();
    changed["policy"]["identity"]["release"] = json!("forged-release");
    db.execute("UPDATE agent_runtime_session_profiles SET digest=?1,payload=?2 WHERE session_id='conversation'",rusqlite::params![content_digest(&changed).unwrap(),serde_json::to_string(&changed).unwrap()]).unwrap();
    assert!(store.session_state("conversation").await.is_err());
    assert!(
        supervisor
            .execute_submitted(&registry, "one")
            .await
            .is_err()
    );
    assert_eq!(calls.load(Ordering::SeqCst), 0);
    assert!(store.execution_record("one").await.unwrap().is_none());
    db.execute(
        "DELETE FROM agent_runtime_session_profiles WHERE session_id='conversation'",
        [],
    )
    .unwrap();
    assert!(store.session_state("conversation").await.is_err());
    db.execute("INSERT INTO agent_runtime_session_profiles(session_id,digest,payload) VALUES('conversation',?1,?2)",rusqlite::params![hash,payload]).unwrap();
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "one")
            .await
            .unwrap(),
        Some(RunOutcome::Completed { .. })
    ));
    assert_eq!(calls.load(Ordering::SeqCst), 1);
}

#[path = "branches.rs"]
mod branch_tests;
