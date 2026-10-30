use super::*;

#[tokio::test]
async fn accepted_old_model_command_reads_closed_outcome_after_a_later_run_seals_the_thread() {
    for unmetered in [false, true] {
        let directory = tempfile::tempdir().unwrap();
        let clock = Arc::new(TestClock(AtomicU64::new(100_000)));
        let store =
            SqliteStore::open_with_clock(&directory.path().join("runtime.sqlite"), clock.clone())
                .unwrap();
        let started = Arc::new(tokio::sync::Notify::new());
        let effects = directory.path().join("effects");
        let (registry, system) = build_system(&store, &effects, started.clone(), unmetered);
        let supervisor = RunSupervisor::new(store.clone())
            .with_lease_ttl(Duration::from_secs(2))
            .unwrap();
        supervisor
            .submit_managed(request(&system, "old", "thread", "act"), &system)
            .await
            .unwrap();
        dispatch(&supervisor, &registry, "old", &started).await;
        clock.0.fetch_add(2100, Ordering::SeqCst);
        let target = supervisor
            .model_reconciliation_targets("old", "old")
            .await
            .unwrap()
            .remove(0);
        let proof = ManagedAction {
            command_id: "old-proof".into(),
            run_id: "old".into(),
            command: ManagedCommand::ReconcileModel {
                receipt: ModelReconciliation {
                    ticket: target.ticket,
                    result: ModelReconciliationResult::Completed {
                        response: ModelResponse {
                            output: "settled old result".into(),
                            input_tokens: 3,
                            output_tokens: 2,
                            ..Default::default()
                        },
                    },
                },
            },
        };
        store.enqueue_managed_action(proof.clone()).await.unwrap();
        let settled = supervisor
            .execute_managed_action(&registry, "old-proof")
            .await
            .unwrap();
        assert!(
            matches!(settled.outcome, Some(RunOutcome::Completed { .. })),
            "{settled:?}"
        );
        // Fault injection: business result committed, final command ACK lost.
        store.transaction(|tx| {tx.execute("UPDATE agent_runtime_managed_actions SET result=NULL WHERE command_id='old-proof'",[]).map_err(db_error)?;Ok(())}).await.unwrap();
        supervisor
            .submit_managed(request(&system, "new", "thread", "act"), &system)
            .await
            .unwrap();
        dispatch(&supervisor, &registry, "new", &started).await;
        clock.0.fetch_add(2100, Ordering::SeqCst);
        store
            .enqueue_managed_action(abandon("new-abandon", "new", "unknown newer request"))
            .await
            .unwrap();
        assert!(
            supervisor
                .execute_managed_action(&ModuleRegistry::default(), "new-abandon")
                .await
                .unwrap()
                .abandonment
                .is_some()
        );
        let before = native_state(&store).await;
        let replay = supervisor
            .execute_managed_action(&registry, "old-proof")
            .await
            .unwrap();
        assert_eq!(
            content_digest(&replay.outcome).unwrap(),
            content_digest(&settled.outcome).unwrap()
        );
        assert!(replay.finished && replay.error.is_none() && replay.abandonment.is_none());
        let mut forged = proof;
        forged.command_id = "unaccepted-old-proof".into();
        store.enqueue_managed_action(forged).await.unwrap();
        assert!(
            supervisor
                .execute_managed_action(&registry, "unaccepted-old-proof")
                .await
                .unwrap()
                .error
                .is_some()
        );
        assert_eq!(native_state(&store).await, before);
        assert_eq!(std::fs::read_to_string(&effects).unwrap(), "model\nmodel\n");
    }
}

async fn dispatch(
    supervisor: &RunSupervisor,
    registry: &ModuleRegistry,
    id: &str,
    started: &tokio::sync::Notify,
) {
    let running = supervisor.execute_submitted(registry, id);
    tokio::pin!(running);
    tokio::select! {result=&mut running=>panic!("{result:?}"),_=started.notified()=>{},_=tokio::time::sleep(Duration::from_secs(10))=>panic!("model not dispatched")}
}
