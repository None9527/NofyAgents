use super::*;
use crate::{
    Model, ModelRequest, ModelResponse, governance::*, mailbox::*, registry::*, system::*,
};
use nofy_interjection_core::PendingInterjection;
use serde_json::json;
use std::sync::atomic::{AtomicU64, Ordering};
#[path = "support.rs"]
mod support;
use support::*;
#[path = "closed_receipts.rs"]
mod closed_receipts;

#[tokio::test]
async fn unknown_effect_abandonment_fences_preserves_and_seals_with_atomic_receipts() {
    for unmetered in [false, true] {
        let directory = tempfile::tempdir().unwrap();
        let clock = Arc::new(TestClock(AtomicU64::new(100_000)));
        let path = directory.path().join("runtime.sqlite");
        let store = SqliteStore::open_with_clock(&path, clock.clone()).unwrap();
        let started = Arc::new(tokio::sync::Notify::new());
        let effects = directory.path().join("effects");
        let (registry, system) = build_system(&store, &effects, started.clone(), unmetered);
        let supervisor = RunSupervisor::new(store.clone())
            .with_lease_ttl(Duration::from_secs(2))
            .unwrap();
        supervisor
            .submit_managed(request(&system, "root", "thread", "act"), &system)
            .await
            .unwrap();
        {
            let running = supervisor.execute_submitted(&registry, "root");
            tokio::pin!(running);
            tokio::select! { result=&mut running=>panic!("{result:?}"), _=started.notified()=>{}, _=tokio::time::sleep(Duration::from_secs(10))=>panic!("model not dispatched") }
        }
        let root = store.execution_record("root").await.unwrap().unwrap();
        let address = InputAddress {
            root_run_id: "root".into(),
            run_id: "root".into(),
            thread_id: "thread".into(),
            agent: root.snapshot.name().into(),
        };
        let snapshot = match &system.program("chat").unwrap().snapshot.program {
            crate::program::ProgramSnapshot::Agent { snapshot } => snapshot.clone(),
            _ => panic!("Agent"),
        };
        let next = MailEnvelope {
            address: address.clone(),
            input_id: "next-input".into(),
            input: MailInput::NextTurn {
                run_id: "next".into(),
                snapshot,
                message: message("safe"),
            },
        };
        store.submit(next.clone()).await.unwrap();
        let interject = MailEnvelope {
            address: address.clone(),
            input_id: "interject".into(),
            input: MailInput::Interject {
                message: message("retained input"),
            },
        };
        store.submit(interject.clone()).await.unwrap();
        supervisor
            .submit_managed(request(&system, "queued", "thread", "safe"), &system)
            .await
            .unwrap();
        for id in ["stale-resume", "later-resume"] {
            store
                .enqueue_managed_action(ManagedAction {
                    command_id: id.into(),
                    run_id: "root".into(),
                    command: ManagedCommand::Resume,
                })
                .await
                .unwrap();
        }
        let action = abandon("abandon-one", "root", "operator confirmed unknown outcome");
        let before = native_state(&store).await;
        assert_eq!(before.iter().any(|row| row.0 == "budget-root"), !unmetered);
        store.enqueue_managed_action(action.clone()).await.unwrap();
        assert_eq!(
            store.pending_managed_actions(10).await.unwrap()[0]
                .action
                .command_id,
            "abandon-one"
        );
        assert_eq!(
            store.managed_action_heads(0, 10).await.unwrap()[0].2,
            "abandon-one"
        );
        // Even the administrative path cannot steal a live lease. An empty
        // registry proves it never needs to recover missing provider factories.
        let missing = ModuleRegistry::default();
        assert!(
            supervisor
                .execute_managed_action(&missing, "abandon-one")
                .await
                .unwrap_err()
                .to_string()
                .contains("leased")
        );
        assert!(store.abandonment("root").await.unwrap().is_none());
        clock.0.fetch_add(2100, Ordering::SeqCst);
        assert!(
            supervisor
                .execute_managed_action(&registry, "stale-resume")
                .await
                .unwrap_err()
                .to_string()
                .contains("management command is pending")
        );
        let result = supervisor
            .execute_managed_action(&missing, "abandon-one")
            .await
            .unwrap();
        assert!(
            result.finished && result.error.is_none() && result.outcome.is_none(),
            "{result:?}"
        );
        let receipt = result.abandonment.unwrap();
        assert!(receipt.root_pending_work);
        assert_eq!(receipt.checkpoint_run_id.as_deref(), Some("root"));
        assert_eq!(receipt.cancelled_jobs, 2);
        assert_eq!(receipt.rejected_inputs, 2);
        assert_eq!(receipt.superseded_commands, 2);
        assert_eq!(native_state(&store).await, before);
        let after = store.execution_record("root").await.unwrap().unwrap();
        assert_eq!(after.status, "abandoned");
        assert_eq!(
            serde_json::to_value(after.outcome).unwrap(),
            serde_json::to_value(root.outcome).unwrap()
        );
        assert!(matches!(
            store.execution_job("root").await.unwrap().unwrap().status,
            JobStatus::Abandoned
        ));
        assert!(matches!(
            store.execution_job("next").await.unwrap().unwrap().status,
            JobStatus::Cancelled
        ));
        assert!(matches!(
            store.execution_job("queued").await.unwrap().unwrap().status,
            JobStatus::Cancelled
        ));
        assert!(
            store
                .managed_action("stale-resume")
                .await
                .unwrap()
                .unwrap()
                .error
                .unwrap()
                .contains("superseded")
        );
        for envelope in [next, interject] {
            let delivery = store.submit(envelope.clone()).await.unwrap();
            assert!(matches!(delivery.status, InputStatus::Rejected));
            assert_eq!(
                serde_json::to_value(delivery.envelope).unwrap(),
                serde_json::to_value(envelope).unwrap()
            );
        }
        let denied = MailEnvelope {
            address: address.clone(),
            input_id: "new-input".into(),
            input: MailInput::Interject {
                message: message("never delivered"),
            },
        };
        assert!(store.submit(denied).await.is_err());
        assert!(store.cancel(&address, "new-cancel").await.is_err());
        assert!(
            supervisor
                .execute_submitted(&missing, "root")
                .await
                .is_err()
        );
        let target = supervisor
            .model_reconciliation_targets("root", "root")
            .await
            .unwrap()
            .remove(0);
        let job = store.execution_job("root").await.unwrap().unwrap();
        let lease = store
            .acquire(
                job.submission.thread_key(),
                "cannot-reconcile-sealed",
                Duration::from_secs(30),
            )
            .await
            .unwrap();
        let error = supervisor
            .accept_model_reconciliation_leased(
                &ExecutionPlan::program(system.program("chat").unwrap()),
                &RunContext::new("thread", "root"),
                ModelReconciliation {
                    ticket: target.ticket,
                    result: ModelReconciliationResult::Completed {
                        response: ModelResponse::default(),
                    },
                },
                "sealed-evidence",
                &lease,
            )
            .await
            .unwrap_err();
        assert!(error.to_string().contains("sealed"), "{error}");
        store.release(&lease).await.unwrap();
        assert!(
            supervisor
                .submit_managed(
                    request(&system, "new-same-thread", "thread", "safe"),
                    &system
                )
                .await
                .is_err()
        );
        assert!(
            supervisor
                .execute_program(
                    system.program("chat").unwrap(),
                    RunInput::resume(),
                    RunContext::new("thread", "root")
                )
                .await
                .is_err()
        );
        assert!(
            store
                .enqueue_managed_action(ManagedAction {
                    command_id: "no-resume".into(),
                    run_id: "root".into(),
                    command: ManagedCommand::Resume
                })
                .await
                .is_err()
        );
        // Lost client acknowledgement and an old partially upgraded receipt
        // both read the same terminal fact without touching native storage.
        store.transaction(|tx| {tx.execute("UPDATE agent_runtime_managed_actions SET result=NULL WHERE command_id='abandon-one'",[]).map_err(db_error)?;Ok(())}).await.unwrap();
        drop(supervisor);
        drop(store);
        let store = SqliteStore::open_with_clock(&path, clock).unwrap();
        let supervisor = RunSupervisor::new(store.clone());
        let replay = supervisor
            .execute_managed_action(&missing, "abandon-one")
            .await
            .unwrap();
        assert_eq!(
            content_digest(&replay.abandonment).unwrap(),
            content_digest(&Some(receipt.clone())).unwrap()
        );
        store.enqueue_managed_action(action).await.unwrap();
        for (id, reason, rejected) in [
            ("same-reason", "operator confirmed unknown outcome", false),
            ("changed-reason", "rewrite history", true),
        ] {
            store
                .enqueue_managed_action(abandon(id, "root", reason))
                .await
                .unwrap();
            let result = supervisor
                .execute_managed_action(&missing, id)
                .await
                .unwrap();
            assert_eq!(result.error.is_some(), rejected);
        }
        assert_eq!(native_state(&store).await, before);
        assert_eq!(std::fs::read_to_string(&effects).unwrap(), "model\n");
        assert!(store.runnable_managed(10).await.unwrap().is_empty());
        let (registry, system) = build_system(
            &store,
            &effects,
            Arc::new(tokio::sync::Notify::new()),
            unmetered,
        );
        supervisor
            .submit_managed(request(&system, "fresh", "fresh-thread", "safe"), &system)
            .await
            .unwrap();
        assert!(matches!(
            supervisor
                .execute_submitted(&registry, "fresh")
                .await
                .unwrap(),
            Some(RunOutcome::Completed { .. })
        ));
    }
}

#[tokio::test]
async fn closed_business_outcome_is_immutable_and_abandon_cannot_seal_a_newer_turn() {
    let directory = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&directory.path().join("runtime.sqlite")).unwrap();
    let (registry, system) = build_system(
        &store,
        &directory.path().join("effects"),
        Arc::new(tokio::sync::Notify::new()),
        true,
    );
    let supervisor = RunSupervisor::new(store.clone());
    for id in ["closed", "newer"] {
        supervisor
            .submit_managed(request(&system, id, "thread", "safe"), &system)
            .await
            .unwrap();
        supervisor.execute_submitted(&registry, id).await.unwrap();
    }
    let before = native_state(&store).await;
    store
        .enqueue_managed_action(abandon("old-abandon", "closed", "too late"))
        .await
        .unwrap();
    let result = supervisor
        .execute_managed_action(&ModuleRegistry::default(), "old-abandon")
        .await
        .unwrap();
    assert!(result.error.is_none() && result.abandonment.is_none());
    assert!(matches!(result.outcome, Some(RunOutcome::Completed { .. })));
    assert!(store.abandonment("closed").await.unwrap().is_none());
    assert_eq!(native_state(&store).await, before);
    supervisor
        .submit_managed(request(&system, "third", "thread", "safe"), &system)
        .await
        .unwrap();
}

#[tokio::test]
async fn invalid_abandon_rejects_before_admission_and_failed_transaction_rolls_back_inputs() {
    let directory = tempfile::tempdir().unwrap();
    let clock = Arc::new(TestClock(AtomicU64::new(100_000)));
    let store =
        SqliteStore::open_with_clock(&directory.path().join("runtime.sqlite"), clock.clone())
            .unwrap();
    let started = Arc::new(tokio::sync::Notify::new());
    let (registry, system) = build_system(
        &store,
        &directory.path().join("effects"),
        started.clone(),
        true,
    );
    let supervisor = RunSupervisor::new(store.clone())
        .with_lease_ttl(Duration::from_secs(2))
        .unwrap();
    supervisor
        .submit_managed(request(&system, "root", "thread", "act"), &system)
        .await
        .unwrap();
    {
        let running = supervisor.execute_submitted(&registry, "root");
        tokio::pin!(running);
        tokio::select! {result=&mut running=>panic!("{result:?}"),_=started.notified()=>{},_=tokio::time::sleep(Duration::from_secs(10))=>panic!("not dispatched")}
    }
    for (reason, ack) in [("", true), (" ", true), ("valid", false)] {
        let mut action = abandon("invalid", "root", reason);
        action.command = ManagedCommand::Abandon {
            reason: reason.into(),
            acknowledge_unresolved: ack,
        };
        assert!(store.enqueue_managed_action(action).await.is_err());
    }
    assert!(store.managed_action("invalid").await.unwrap().is_none());
    let address = InputAddress {
        root_run_id: "root".into(),
        run_id: "root".into(),
        thread_id: "thread".into(),
        agent: "abandon-agent".into(),
    };
    let mail = MailEnvelope {
        address: address.clone(),
        input_id: "pending".into(),
        input: MailInput::Interject {
            message: message("retain"),
        },
    };
    store.submit(mail).await.unwrap();
    supervisor
        .submit_managed(
            request(&system, "inconsistent-peer", "thread", "safe"),
            &system,
        )
        .await
        .unwrap();
    store
        .transaction(|tx| {
            tx.execute(
                "UPDATE agent_runtime_jobs SET status='waiting' WHERE run_id='inconsistent-peer'",
                [],
            )
            .map_err(db_error)?;
            Ok(())
        })
        .await
        .unwrap();
    clock.0.fetch_add(2100, Ordering::SeqCst);
    let before = native_state(&store).await;
    let events = store.events("root", 0, 1000).await.unwrap().len();
    store
        .enqueue_managed_action(abandon("reject", "root", "cannot cross ownership"))
        .await
        .unwrap();
    let rejected = supervisor
        .execute_managed_action(&ModuleRegistry::default(), "reject")
        .await
        .unwrap();
    assert!(rejected.finished && rejected.error.is_some());
    assert!(store.abandonment("root").await.unwrap().is_none());
    assert_eq!(native_state(&store).await, before);
    assert_eq!(store.events("root", 0, 1000).await.unwrap().len(), events);
    assert!(matches!(
        store
            .input_status(&address, "pending")
            .await
            .unwrap()
            .unwrap()
            .status,
        InputStatus::Pending
    ));
}

#[test]
fn old_management_receipts_deserialize_without_a_terminal_field() {
    let result: ActionResult =
        serde_json::from_value(json!({"outcome":null,"error":null})).unwrap();
    assert!(result.abandonment.is_none());
    let record:ManagedActionRecord=serde_json::from_value(json!({"sequence":1,"action":{"command_id":"old","run_id":"root","command":{"kind":"resume"}},"finished":false,"outcome":null,"error":null})).unwrap();
    assert!(record.abandonment.is_none());
}
