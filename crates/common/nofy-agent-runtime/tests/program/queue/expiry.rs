use super::*;

struct ManualClock(Arc<std::sync::atomic::AtomicU64>);
impl Clock for ManualClock {
    fn now_ms(&self) -> u64 {
        self.0.load(Ordering::SeqCst)
    }
}
fn deadline_program(setup: &mut Setup, store: &SqliteStore, kind: &str) -> CompiledProgram {
    let short = Arc::new(
        GovernanceProfile::new(
            Arc::new(
                InstalledBudget::install(
                    Arc::new(store.clone()),
                    BudgetLimits {
                        max_duration_ms: Some(100_000),
                        max_model_calls: Some(8),
                        max_steps: Some(32),
                        max_tool_calls: Some(16),
                        max_child_calls: Some(8),
                        ..Default::default()
                    },
                    "deadline@1",
                    1,
                )
                .unwrap(),
            ),
            BudgetLimits::default(),
            ModelRetryPolicy::default(),
        )
        .unwrap(),
    );
    install(
        &mut setup.registry,
        "deadline",
        ModuleInstance::Governance(short),
    );
    let compiled = program(setup, kind);
    match compiled.snapshot.program {
        ProgramSnapshot::Event { .. } => unreachable!("legacy queue fixtures have no events"),
        ProgramSnapshot::Agent { mut snapshot } => {
            snapshot.agent.governance = vec![r("deadline")];
            CompiledProgram::for_agent(&compile_agent(snapshot.agent, &setup.registry).unwrap())
                .unwrap()
        }
        ProgramSnapshot::Tool { mut snapshot, call } => {
            snapshot.definition.governance = vec![r("deadline")];
            CompiledProgram::for_tool(
                &compile_tools(snapshot.definition, &setup.registry).unwrap(),
                call,
            )
            .unwrap()
        }
        #[cfg(feature = "workflow")]
        ProgramSnapshot::Workflow {
            mut snapshot,
            input,
        } => {
            snapshot.document.host.governance = vec![r("deadline")];
            CompiledProgram::for_workflow(
                &nofy_agent_runtime::workflow::compile::compile_workflow(
                    snapshot.document,
                    &setup.registry,
                )
                .unwrap(),
                input,
            )
            .unwrap()
        }
    }
}

#[tokio::test]
async fn closed_submissions_keep_their_original_result_through_direct_resume_after_deadline_or_cancel()
 {
    for kind in kinds() {
        let temp = tempfile::tempdir().unwrap();
        let ticks = Arc::new(std::sync::atomic::AtomicU64::new(1_000));
        let store = SqliteStore::open_with_clock(
            &temp.path().join("runtime.db"),
            Arc::new(ManualClock(ticks.clone())),
        )
        .unwrap();
        let mut setup = setup(&store, false, false, false, false);
        let program = deadline_program(&mut setup, &store, kind);
        let supervisor = RunSupervisor::new(store.clone());
        supervisor
            .submit_program(submission(&program, "root"))
            .await
            .unwrap();
        complete(&supervisor, &setup, "root").await;
        let expected = serde_json::to_value(store.execution_record("root").await.unwrap()).unwrap();
        assert!(matches!(
            supervisor
                .execute_program(&program, RunInput::resume(), context())
                .await
                .unwrap(),
            RunOutcome::Completed { .. }
        ));
        assert!(matches!(
            store.program_job("root").await.unwrap().unwrap().status,
            JobStatus::Closed
        ));
        ticks.store(1_000_000, Ordering::SeqCst);
        let cancelled = context();
        cancelled.cancel.cancel();
        assert!(matches!(
            supervisor
                .execute_program(&program, RunInput::resume(), cancelled)
                .await
                .unwrap(),
            RunOutcome::Completed { .. }
        ));
        assert_eq!(
            serde_json::to_value(store.execution_record("root").await.unwrap()).unwrap(),
            expected
        );
        complete(&supervisor, &setup, "root").await;
        assert_eq!(
            setup.models.load(Ordering::SeqCst),
            usize::from(kind == "agent")
        );
        assert_eq!(
            setup.effects.load(Ordering::SeqCst),
            usize::from(kind != "agent")
        );
        assert!(
            supervisor
                .execute_program(
                    &program,
                    RunInput {
                        resume: true,
                        reconciled: Some(("changed".into(), json!({}), false)),
                        ..Default::default()
                    },
                    context()
                )
                .await
                .is_err()
        );
        assert_eq!(
            serde_json::to_value(store.execution_record("root").await.unwrap()).unwrap(),
            expected
        );
    }
}

#[tokio::test]
async fn cancellation_before_initial_commit_closes_only_that_program_job_and_unblocks_its_peer() {
    for kind in kinds() {
        let temp = tempfile::tempdir().unwrap();
        let ticks = Arc::new(std::sync::atomic::AtomicU64::new(1_000));
        let store = SqliteStore::open_with_clock(
            &temp.path().join("runtime.db"),
            Arc::new(ManualClock(ticks.clone())),
        )
        .unwrap();
        let mut setup = setup(&store, false, false, false, false);
        let program = deadline_program(&mut setup, &store, kind);
        let supervisor = RunSupervisor::new(store.clone());
        supervisor
            .submit_program(submission(&program, "root"))
            .await
            .unwrap();
        supervisor
            .submit_program(submission(&program, "peer"))
            .await
            .unwrap();
        let sql = rusqlite::Connection::open(store.path().unwrap()).unwrap();
        reject_first(&sql, &program);
        assert!(
            supervisor
                .execute_submitted(&setup.registry, "root")
                .await
                .is_err()
        );
        ticks.store(1_000_000, Ordering::SeqCst);
        let address = InputAddress {
            root_run_id: "root".into(),
            run_id: "root".into(),
            thread_id: "thread".into(),
            agent: program.snapshot.name().into(),
        };
        store.cancel(&address, "cancel-unapplied").await.unwrap();
        assert!(matches!(
            supervisor
                .execute_submitted(&setup.registry, "root")
                .await
                .unwrap(),
            Some(RunOutcome::Cancelled { .. })
        ));
        assert!(matches!(
            store.program_job("root").await.unwrap().unwrap().status,
            JobStatus::Cancelled
        ));
        assert_eq!(setup.models.load(Ordering::SeqCst), 0);
        assert_eq!(setup.effects.load(Ordering::SeqCst), 0);
        sql.execute_batch("DROP TRIGGER reject_first").unwrap();
        drop(sql);
        complete(&supervisor, &setup, "peer").await;
        assert_eq!(
            setup.models.load(Ordering::SeqCst),
            usize::from(kind == "agent")
        );
        assert_eq!(
            setup.effects.load(Ordering::SeqCst),
            usize::from(kind != "agent")
        );
    }
}
