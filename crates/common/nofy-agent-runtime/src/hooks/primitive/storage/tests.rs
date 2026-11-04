use super::*;
use crate::{
    Checkpointer,
    durable::Lease,
    governance::{
        BudgetActivity, BudgetClaim, BudgetCost, BudgetDecision, BudgetLimits, BudgetReceipt,
        BudgetRequest, BudgetReservation, BudgetSpec, BudgetStore,
    },
    hooks::{EventCatalog, journal::Saved},
};
use std::time::Duration;

struct Fixture {
    _directory: tempfile::TempDir,
    store: SqliteStore,
    lease: Lease,
    intent: Intent,
    reservations: Vec<BudgetReservation>,
}

async fn fixture(floors: usize, claimed: usize) -> Fixture {
    let directory = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&directory.path().join("runtime.sqlite")).unwrap();
    let lease = store
        .acquire("source", "owner", Duration::from_secs(300))
        .await
        .unwrap();
    let event = HookEvent {
        version: 1,
        id: serde_json::to_string(&(
            "thread",
            "root",
            crate::hooks::runtime_owner(),
            "before_stop",
            "stop:1",
        ))
        .unwrap(),
        name: "before_stop".into(),
        owner: crate::hooks::runtime_owner(),
        scope: crate::events::EventScope::new("agent", &RunContext::new("thread", "root")),
        payload: json!({}),
    };
    let source = RunState {
        execution_run_id: Some("root".into()),
        ..Default::default()
    };
    let mut reservations = Vec::new();
    for index in 0..floors {
        let spec = BudgetSpec {
            scope: BudgetScope {
                root_run_id: "root".into(),
                identity: format!("floor-{index}"),
            },
            limits: BudgetLimits {
                max_tool_calls: Some(1),
                ..Default::default()
            },
        };
        store.enroll(&spec).await.unwrap();
        let request = BudgetRequest {
            operation_id: "hook-call".into(),
            fingerprint: "d".repeat(64),
            reserve: BudgetCost {
                tool_calls: 1,
                ..Default::default()
            },
            depth: 0,
            activity: BudgetActivity::Operation,
            unbounded_tokens: false,
        };
        let BudgetDecision::Granted(reservation) = store.reserve(&spec, &request).await.unwrap()
        else {
            panic!("original reservation");
        };
        if index < claimed {
            assert!(matches!(
                store.claim(&reservation).await.unwrap(),
                BudgetClaim::Dispatch
            ));
        }
        reservations.push(reservation);
    }
    let intent = Intent {
        id: effect_id(&event.id, "subscription", "outer"),
        root: "root".into(),
        root_composition: "root-composition".into(),
        event_id: event.id.clone(),
        event_digest: crate::system::content_digest(&event).unwrap(),
        bus: "bus".into(),
        hook: "subscription".into(),
        journal_key: "outer".into(),
        declaration: EventCatalog::runtime().get("before_stop").unwrap().clone(),
        source: Source {
            key: "source".into(),
            composition: "root-composition".into(),
            graph: false,
            fingerprint: parent_fingerprint(&source, &event).unwrap(),
        },
        tool: "effect".into(),
        operation: "hook-call".into(),
        fingerprint: "d".repeat(64),
        scopes: reservations.iter().map(|r| r.scope().clone()).collect(),
        authority: "native-authority".into(),
    };
    let saved = Saved {
        event,
        hook: intent.hook.clone(),
        decision: None,
        error: None,
        resolved: false,
        controller: None,
        resume: Some(intent.authority.clone()),
    };
    let source_cp = Checkpoint {
        version: 1,
        revision: 0,
        composition: intent.root_composition.clone(),
        state: source,
    };
    let outer_cp = Checkpoint {
        version: 1,
        revision: 0,
        composition: intent.bus.clone(),
        state: RunState {
            data: serde_json::to_value(saved).unwrap(),
            ..Default::default()
        },
    };
    let effect = frame_checkpoint(&Frame {
        version: 1,
        intent: intent.clone(),
        result: None,
        reconciliation: None,
    })
    .unwrap();
    let effect_key = effect_key(&intent.id);
    store
        .transaction(move |tx| {
            tx.execute(
                "INSERT INTO agent_runtime_runs(id,thread_key,payload) VALUES('root','source',?1)",
                [json!({"composition":"root-composition"}).to_string()],
            )
            .map_err(db_error)?;
            tx.execute(
                "INSERT INTO agent_runtime_threads(key,active_run) VALUES('source','root')",
                [],
            )
            .map_err(db_error)?;
            save(tx, "source", None, source_cp)?;
            save(tx, "outer", None, outer_cp)?;
            save(tx, &effect_key, None, effect)?;
            Ok(())
        })
        .await
        .unwrap();
    Fixture {
        _directory: directory,
        store,
        lease,
        intent,
        reservations,
    }
}

async fn receipt(f: &Fixture, resolution: HookResolution) -> HookReconciliation {
    let page = targets(&f.store, "root", None, 10).await.unwrap();
    assert_eq!(page.targets.len(), 1);
    HookReconciliation {
        ticket: page.targets[0].ticket.clone(),
        resolution,
    }
}
fn continue_result() -> Value {
    serde_json::to_value(Ok::<_, ToolError>(TypedToolOutput::from_value(
        nofy_tool_protocol::ToolId::new("effect").unwrap(),
        json!({"decision":"continue"}),
    )))
    .unwrap()
}
async fn snapshot(store: &SqliteStore) -> Vec<Vec<String>> {
    store.transaction(|tx| {
        [
            "SELECT key||':'||revision||':'||payload FROM agent_runtime_checkpoints ORDER BY key",
            "SELECT key||':'||payload FROM agent_runtime_budget_roots ORDER BY key",
            "SELECT root_key||':'||operation_key||':'||payload FROM agent_runtime_budget_operations ORDER BY root_key,operation_key",
            "SELECT root_key||':'||payload FROM agent_runtime_budget_events ORDER BY id",
        ].iter().map(|sql| {
            tx.prepare(sql).map_err(db_error)?.query_map([], |row| row.get(0)).map_err(db_error)?
                .collect::<Result<Vec<String>, _>>().map_err(db_error)
        }).collect()
    }).await.unwrap()
}

#[tokio::test]
async fn partial_claim_reconciliation_is_atomic_with_both_ledgers_and_immutable_command() {
    let f = fixture(2, 1).await;
    let evidence = receipt(
        &f,
        HookResolution::Decision {
            decision: HookDecision::Continue,
        },
    )
    .await;
    assert_eq!(evidence.ticket.kind, HookRecoveryKind::Effect);
    f.store.transaction(|tx| {
        tx.execute_batch("CREATE TRIGGER fail_hook_receipt BEFORE UPDATE ON agent_runtime_checkpoints WHEN OLD.key='outer' BEGIN SELECT RAISE(ABORT,'injected Hook receipt failure'); END;").map_err(db_error)
    }).await.unwrap();
    let before = snapshot(&f.store).await;
    let error = accept(
        &f.store,
        &f.lease,
        "root",
        "root-composition",
        "resolve",
        evidence.clone(),
    )
    .await
    .unwrap_err();
    assert!(
        error.to_string().contains("injected Hook receipt failure"),
        "{error}"
    );
    assert_eq!(snapshot(&f.store).await, before);
    f.store
        .transaction(|tx| {
            tx.execute_batch("DROP TRIGGER fail_hook_receipt")
                .map_err(db_error)
        })
        .await
        .unwrap();
    accept(
        &f.store,
        &f.lease,
        "root",
        "root-composition",
        "resolve",
        evidence.clone(),
    )
    .await
    .unwrap();
    let completed = snapshot(&f.store).await;
    for reservation in &f.reservations {
        let summary = f.store.inspect(reservation.scope()).await.unwrap().unwrap();
        assert_eq!(summary.used.tool_calls, 1);
        assert_eq!(summary.reserved, BudgetCost::default());
        assert_eq!(summary.active_operations, 0);
        assert_eq!(summary.operation_count, 1);
    }
    assert!(
        accepted(&f.store, "root", "resolve", &evidence)
            .await
            .unwrap()
    );
    accept(
        &f.store,
        &f.lease,
        "root",
        "root-composition",
        "resolve",
        evidence.clone(),
    )
    .await
    .unwrap();
    assert_eq!(snapshot(&f.store).await, completed);
    let mut changed = evidence.clone();
    changed.resolution = HookResolution::Error {
        message: "changed".into(),
    };
    assert!(
        accepted(&f.store, "root", "resolve", &changed)
            .await
            .is_err()
    );
    assert!(
        accept(
            &f.store,
            &f.lease,
            "root",
            "root-composition",
            "resolve",
            changed
        )
        .await
        .is_err()
    );
    assert_eq!(snapshot(&f.store).await, completed);
    f.store.transaction(|tx| {
        tx.execute("UPDATE agent_runtime_checkpoints SET payload=json_set(payload,'$.composition','changed') WHERE key LIKE '%hook-resolution-v1%'", []).map_err(db_error)?;
        Ok(())
    }).await.unwrap();
    assert!(
        accepted(&f.store, "root", "resolve", &evidence)
            .await
            .is_err()
    );
}

#[tokio::test]
async fn recorded_result_cannot_be_replaced_and_settles_remaining_original_floor() {
    let f = fixture(2, 2).await;
    let original = BudgetReceipt {
        used: BudgetCost {
            tool_calls: 1,
            ..Default::default()
        },
        value: continue_result(),
    };
    f.store
        .settle(&f.reservations[0], original.clone())
        .await
        .unwrap();
    let evidence = receipt(&f, HookResolution::Recorded).await;
    assert_eq!(evidence.ticket.kind, HookRecoveryKind::Recorded);
    let before = snapshot(&f.store).await;
    let mut changed = evidence.clone();
    changed.resolution = HookResolution::Decision {
        decision: HookDecision::Deny {
            reason: "replacement".into(),
        },
    };
    assert!(
        accept(
            &f.store,
            &f.lease,
            "root",
            "root-composition",
            "replace",
            changed
        )
        .await
        .is_err()
    );
    assert_eq!(snapshot(&f.store).await, before);
    accept(
        &f.store,
        &f.lease,
        "root",
        "root-composition",
        "recorded",
        evidence,
    )
    .await
    .unwrap();
    let cp = f
        .store
        .load(&effect_key(&f.intent.id))
        .await
        .unwrap()
        .unwrap();
    assert_eq!(decode(&cp).unwrap().result, Some(original.value));
    for reservation in &f.reservations {
        let summary = f.store.inspect(reservation.scope()).await.unwrap().unwrap();
        assert_eq!(summary.used.tool_calls, 1);
        assert_eq!(summary.reserved, BudgetCost::default());
    }
}

#[tokio::test]
async fn stale_cross_root_invalid_decision_and_fence_leave_evidence_and_budget_unchanged() {
    let f = fixture(1, 1).await;
    let evidence = receipt(
        &f,
        HookResolution::Decision {
            decision: HookDecision::Continue,
        },
    )
    .await;
    let before = snapshot(&f.store).await;
    let mut candidates = Vec::new();
    let mut stale = evidence.clone();
    stale.ticket.effect_revision += 1;
    candidates.push(stale);
    let mut stale = evidence.clone();
    stale.ticket.hook_revision += 1;
    candidates.push(stale);
    let mut stale = evidence.clone();
    stale.ticket.intent_digest = "0".repeat(64);
    candidates.push(stale);
    let mut stale = evidence.clone();
    stale.ticket.kind = HookRecoveryKind::Recorded;
    candidates.push(stale);
    let mut invalid = evidence.clone();
    invalid.resolution = HookResolution::Decision {
        decision: HookDecision::Patch { payload: json!({}) },
    };
    candidates.push(invalid);
    for candidate in candidates {
        assert!(
            accept(
                &f.store,
                &f.lease,
                "root",
                "root-composition",
                "reject",
                candidate
            )
            .await
            .is_err()
        );
        assert_eq!(snapshot(&f.store).await, before);
    }
    assert!(
        accept(
            &f.store,
            &f.lease,
            "another-root",
            "root-composition",
            "reject",
            evidence.clone()
        )
        .await
        .is_err()
    );
    let mut expired = f.lease.clone();
    expired.owner = "different-owner".into();
    assert!(
        accept(
            &f.store,
            &expired,
            "root",
            "root-composition",
            "reject",
            evidence.clone()
        )
        .await
        .is_err()
    );
    assert_eq!(snapshot(&f.store).await, before);
    for (after, limit) in [(None, 0), (None, 257), (Some("invalid"), 1)] {
        assert!(targets(&f.store, "root", after, limit).await.is_err());
    }
    let mut source = f.store.load("source").await.unwrap().unwrap();
    let revision = source.revision;
    source.revision += 1;
    source.state.steps += 1;
    f.store
        .save("source", Some(revision), source)
        .await
        .unwrap();
    let advanced = snapshot(&f.store).await;
    assert!(
        targets(&f.store, "root", None, 10)
            .await
            .unwrap()
            .targets
            .is_empty()
    );
    assert!(
        accept(
            &f.store,
            &f.lease,
            "root",
            "root-composition",
            "stale-source",
            evidence
        )
        .await
        .is_err()
    );
    assert_eq!(snapshot(&f.store).await, advanced);
}

#[tokio::test]
async fn an_unclaimed_budget_reservation_does_not_create_an_effect_recovery_target() {
    let f = fixture(1, 0).await;
    assert!(
        targets(&f.store, "root", None, 10)
            .await
            .unwrap()
            .targets
            .is_empty()
    );
    let cp = f
        .store
        .load(&effect_key(&f.intent.id))
        .await
        .unwrap()
        .unwrap();
    let outer = f.store.load("outer").await.unwrap().unwrap();
    let candidate = HookReconciliation {
        ticket: HookRecoveryTicket {
            id: f.intent.id.clone(),
            effect_revision: cp.revision,
            hook_revision: outer.revision,
            intent_digest: crate::system::content_digest(&f.intent).unwrap(),
            kind: HookRecoveryKind::Effect,
        },
        resolution: HookResolution::Decision {
            decision: HookDecision::Continue,
        },
    };
    let before = snapshot(&f.store).await;
    assert!(
        accept(
            &f.store,
            &f.lease,
            "root",
            "root-composition",
            "unclaimed",
            candidate
        )
        .await
        .is_err()
    );
    assert_eq!(snapshot(&f.store).await, before);
}

#[tokio::test]
async fn clearing_a_context_binding_cannot_remove_native_effect_authority() {
    let f = fixture(0, 0).await;
    let mut context = RunContext::new("thread", "root");
    context.capabilities.insert(NativeControl::new(
        f.store.guarded(&f.lease),
        "root",
        "root-composition",
    ));
    let services = crate::context::RunServices::capture(&context);
    context.capabilities = Default::default();
    services.restore(&mut context).unwrap();
    let restored = context.capabilities.get::<NativeControl>().unwrap();
    assert_eq!(restored.root, "root");
    assert_eq!(restored.guard.lease.owner, f.lease.owner);
    assert_eq!(restored.storage, f.store.logical_identity());
}
