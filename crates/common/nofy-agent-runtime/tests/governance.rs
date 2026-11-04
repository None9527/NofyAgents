use nofy_agent_runtime::governance::*;
use serde_json::json;
use std::sync::{
    Arc,
    atomic::{AtomicU64, Ordering},
};

fn spec() -> BudgetSpec {
    BudgetSpec {
        scope: BudgetScope {
            root_run_id: "root-run".into(),
            identity: "host-budget@1".into(),
        },
        limits: BudgetLimits {
            max_steps: Some(2),
            max_model_calls: Some(2),
            max_total_tokens: Some(20),
            max_concurrent_operations: Some(2),
            max_depth: Some(2),
            ..Default::default()
        },
    }
}
fn request(id: &str, input: u64, output: u64) -> BudgetRequest {
    BudgetRequest {
        operation_id: id.into(),
        fingerprint: format!("request:{id}:v1"),
        reserve: BudgetCost {
            steps: 1,
            model_calls: 1,
            input_tokens: input,
            output_tokens: output,
            ..Default::default()
        },
        depth: 0,
        activity: BudgetActivity::Operation,
        unbounded_tokens: false,
    }
}
fn granted(decision: BudgetDecision) -> BudgetReservation {
    let BudgetDecision::Granted(reservation) = decision else {
        panic!("expected granted")
    };
    reservation
}
async fn contract(store: Arc<dyn BudgetStore>) {
    let spec = spec();
    let first = request("first", 10, 5);
    let reservation = granted(store.reserve(&spec, &first).await.unwrap());
    assert!(matches!(
        store.claim(&reservation).await.unwrap(),
        BudgetClaim::Dispatch
    ));
    assert!(matches!(
        store.claim(&reservation).await.unwrap(),
        BudgetClaim::Uncertain
    ));
    assert!(matches!(
        store.reserve(&spec, &first).await.unwrap(),
        BudgetDecision::Uncertain(_)
    ));
    let mut changed = first.clone();
    changed.fingerprint = "changed-request".into();
    assert!(store.reserve(&spec, &changed).await.is_err());
    let second = request("second", 5, 5);
    assert!(
        matches!(store.reserve(&spec, &second).await.unwrap(), BudgetDecision::Denied(BudgetDenial { dimension, .. }) if dimension == "total_tokens")
    );
    let receipt = BudgetReceipt {
        used: BudgetCost {
            steps: 1,
            model_calls: 1,
            input_tokens: 4,
            output_tokens: 2,
            ..Default::default()
        },
        value: json!({"answer":"cached"}),
    };
    let summary = store.settle(&reservation, receipt.clone()).await.unwrap();
    assert_eq!(summary.used.input_tokens, 4);
    assert_eq!(summary.reserved, BudgetCost::default());
    assert_eq!(
        store
            .settle(&reservation, receipt.clone())
            .await
            .unwrap()
            .used,
        summary.used
    );
    assert!(
        matches!(store.reserve(&spec, &first).await.unwrap(), BudgetDecision::Replay(actual) if actual == receipt)
    );
    assert!(
        store
            .settle(
                &reservation,
                BudgetReceipt {
                    value: json!({"answer":"altered"}),
                    ..receipt
                }
            )
            .await
            .is_err()
    );
    granted(store.reserve(&spec, &second).await.unwrap());
    let summary = store.inspect(&spec.scope).await.unwrap().unwrap();
    assert_eq!(summary.operation_count, 2);
    assert_eq!(summary.active_operations, 1);
    let mut wider = spec.clone();
    wider.limits.max_total_tokens = Some(100);
    assert!(
        store
            .reserve(&wider, &request("third", 1, 1))
            .await
            .is_err()
    );
    let events = store.events(&spec.scope, 0, 100).await.unwrap();
    assert_eq!(
        events
            .iter()
            .map(|event| event.kind.as_str())
            .collect::<Vec<_>>(),
        [
            "reserved",
            "dispatch_claimed",
            "denied",
            "settled",
            "reserved"
        ]
    );
    assert_eq!(
        store
            .events(&spec.scope, events[2].cursor, 100)
            .await
            .unwrap()
            .len(),
        2
    );
    assert!(store.events(&spec.scope, 0, 0).await.is_err());
}
#[tokio::test]
async fn reservation_settlement_and_uncertain_contract_in_memory() {
    contract(Arc::new(InMemoryBudgetStore::default())).await;
}

#[tokio::test]
async fn races_share_the_same_root_and_never_overgrant() {
    let store = Arc::new(InMemoryBudgetStore::default());
    let mut spec = spec();
    spec.limits.max_model_calls = Some(1);
    let mut tasks = Vec::new();
    for index in 0..16 {
        let store = store.clone();
        let spec = spec.clone();
        tasks.push(tokio::spawn(async move {
            store
                .reserve(&spec, &request(&format!("op-{index}"), 1, 1))
                .await
                .unwrap()
        }));
    }
    let mut grants = 0;
    for task in tasks {
        if matches!(task.await.unwrap(), BudgetDecision::Granted(_)) {
            grants += 1;
        }
    }
    assert_eq!(grants, 1);
    assert_eq!(
        store
            .inspect(&spec.scope)
            .await
            .unwrap()
            .unwrap()
            .reserved
            .model_calls,
        1
    );
}

#[tokio::test]
async fn only_one_worker_can_claim_a_reserved_dispatch() {
    let store = Arc::new(InMemoryBudgetStore::default());
    let reservation = granted(store.reserve(&spec(), &request("one", 1, 1)).await.unwrap());
    let mut tasks = Vec::new();
    for _ in 0..16 {
        let store = store.clone();
        let reservation = reservation.clone();
        tasks.push(tokio::spawn(async move {
            store.claim(&reservation).await.unwrap()
        }));
    }
    let mut dispatched = 0;
    for task in tasks {
        if matches!(task.await.unwrap(), BudgetClaim::Dispatch) {
            dispatched += 1;
        }
    }
    assert_eq!(dispatched, 1);
}

#[tokio::test]
async fn expiry_between_reservation_and_dispatch_never_authorizes_io() {
    let now = Arc::new(AtomicU64::new(1000));
    let reader = now.clone();
    let store = InMemoryBudgetStore::with_clock(Arc::new(move || reader.load(Ordering::SeqCst)));
    let mut spec = spec();
    spec.limits.max_duration_ms = Some(10);
    let reservation = granted(store.reserve(&spec, &request("one", 1, 1)).await.unwrap());
    now.store(1010, Ordering::SeqCst);
    assert!(matches!(
        store.claim(&reservation).await.unwrap(),
        BudgetClaim::Denied(_)
    ));
    assert!(
        store
            .settle(
                &reservation,
                BudgetReceipt {
                    used: BudgetCost {
                        model_calls: 1,
                        ..Default::default()
                    },
                    value: json!({})
                }
            )
            .await
            .is_err()
    );
    store
        .settle(
            &reservation,
            BudgetReceipt {
                used: BudgetCost::default(),
                value: json!({"not_dispatched":true}),
            },
        )
        .await
        .unwrap();
}
#[tokio::test]
async fn actual_usage_overrun_is_recorded_and_blocks_future_calls() {
    let store = InMemoryBudgetStore::default();
    let spec = spec();
    let reservation = granted(store.reserve(&spec, &request("first", 1, 1)).await.unwrap());
    assert!(matches!(
        store.claim(&reservation).await.unwrap(),
        BudgetClaim::Dispatch
    ));
    let receipt = BudgetReceipt {
        used: BudgetCost {
            model_calls: 1,
            input_tokens: 50,
            ..Default::default()
        },
        value: json!({"model_exceeded_bound":true}),
    };
    let summary = store.settle(&reservation, receipt).await.unwrap();
    assert_eq!(summary.used.input_tokens, 50);
    assert!(summary.blocked.is_some());
    assert!(matches!(
        store.reserve(&spec, &request("next", 1, 1)).await.unwrap(),
        BudgetDecision::Denied(_)
    ));
}
#[tokio::test]
async fn absolute_deadline_survives_clock_rollback_and_reenrollment() {
    let clock = Arc::new(AtomicU64::new(1000));
    let clock_read = clock.clone();
    let store =
        InMemoryBudgetStore::with_clock(Arc::new(move || clock_read.load(Ordering::SeqCst)));
    let mut spec = spec();
    spec.limits.max_duration_ms = Some(10);
    let reservation = granted(store.reserve(&spec, &request("first", 1, 1)).await.unwrap());
    store
        .settle(
            &reservation,
            BudgetReceipt {
                used: BudgetCost::default(),
                value: json!({"not_dispatched":true}),
            },
        )
        .await
        .unwrap();
    clock.store(2000, Ordering::SeqCst);
    assert!(
        matches!(store.reserve(&spec,&request("expired",1,1)).await.unwrap(), BudgetDecision::Denied(BudgetDenial { reason, .. }) if reason == "deadline_exceeded")
    );
    clock.store(1001, Ordering::SeqCst);
    assert!(matches!(
        store
            .reserve(&spec, &request("rollback", 1, 1))
            .await
            .unwrap(),
        BudgetDecision::Denied(_)
    ));
    let summary = store.inspect(&spec.scope).await.unwrap().unwrap();
    assert_eq!(summary.deadline_ms, Some(1010));
    assert_eq!(summary.created_at_ms, 1000);
}

#[tokio::test]
async fn enrolling_before_resource_wait_starts_the_deadline_without_charging_work() {
    let clock = Arc::new(AtomicU64::new(1000));
    let reader = clock.clone();
    let store = InMemoryBudgetStore::with_clock(Arc::new(move || reader.load(Ordering::SeqCst)));
    let mut spec = spec();
    spec.limits.max_duration_ms = Some(10);
    assert_eq!(store.enroll(&spec).await.unwrap().deadline_ms, Some(1010));
    clock.store(1011, Ordering::SeqCst);
    assert_eq!(store.enroll(&spec).await.unwrap().created_at_ms, 1000);
    assert!(matches!(
        store.reserve(&spec, &request("first", 1, 1)).await.unwrap(),
        BudgetDecision::Denied(_)
    ));
    assert_eq!(
        store.inspect(&spec.scope).await.unwrap().unwrap().used,
        BudgetCost::default()
    );
}
#[tokio::test]
async fn depth_and_child_slots_are_distinct_from_primitive_concurrency() {
    let store = InMemoryBudgetStore::default();
    let mut spec = spec();
    spec.limits.max_active_children = Some(1);
    spec.limits.max_concurrent_operations = Some(1);
    let mut child = request("child", 0, 0);
    child.reserve = BudgetCost {
        child_calls: 1,
        ..Default::default()
    };
    child.activity = BudgetActivity::Child;
    child.depth = 1;
    granted(store.reserve(&spec, &child).await.unwrap());
    granted(
        store
            .reserve(&spec, &request("child-model", 1, 1))
            .await
            .unwrap(),
    );
    child.operation_id = "sibling".into();
    assert!(
        matches!(store.reserve(&spec,&child).await.unwrap(), BudgetDecision::Denied(BudgetDenial { dimension, .. }) if dimension == "active_children")
    );
    child.depth = 3;
    child.operation_id = "too-deep".into();
    assert!(
        matches!(store.reserve(&spec,&child).await.unwrap(), BudgetDecision::Denied(BudgetDenial { dimension, .. }) if dimension == "depth")
    );
}

#[cfg(feature = "sqlite")]
mod sqlite {
    use super::*;
    use nofy_agent_runtime::Error;
    use nofy_agent_runtime::durable::{Clock, SqliteStore};
    use std::time::Duration;
    struct TestClock(AtomicU64);
    impl Clock for TestClock {
        fn now_ms(&self) -> u64 {
            self.0.load(Ordering::SeqCst)
        }
    }
    #[tokio::test]
    async fn same_contract_is_atomic_and_persistent_in_sqlite() {
        let dir = tempfile::tempdir().unwrap();
        contract(Arc::new(
            SqliteStore::open(&dir.path().join("ledger.sqlite")).unwrap(),
        ))
        .await;
    }
    #[tokio::test]
    async fn reopening_keeps_unknown_reservations_and_cached_receipts() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("ledger.sqlite");
        let spec = spec();
        let request = request("first", 4, 4);
        {
            let store = SqliteStore::open(&path).unwrap();
            let reservation = granted(store.reserve(&spec, &request).await.unwrap());
            assert!(matches!(
                store.claim(&reservation).await.unwrap(),
                BudgetClaim::Dispatch
            ));
        }
        let reopened = SqliteStore::open(&path).unwrap();
        let BudgetDecision::Uncertain(reservation) =
            reopened.reserve(&spec, &request).await.unwrap()
        else {
            panic!("must not regrant after restart")
        };
        reopened
            .settle(
                &reservation,
                BudgetReceipt {
                    used: BudgetCost {
                        model_calls: 1,
                        input_tokens: 2,
                        ..Default::default()
                    },
                    value: json!({"reconciled":"receipt"}),
                },
            )
            .await
            .unwrap();
        drop(reopened);
        let reopened = SqliteStore::open(&path).unwrap();
        assert!(matches!(
            reopened.reserve(&spec, &request).await.unwrap(),
            BudgetDecision::Replay(_)
        ));
        assert_eq!(
            reopened
                .inspect(&spec.scope)
                .await
                .unwrap()
                .unwrap()
                .used
                .input_tokens,
            2
        );
    }
    #[tokio::test]
    async fn reservation_before_dispatch_can_be_claimed_after_restart_and_legacy_intents_remain_unknown()
     {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("budget.sqlite");
        let spec = spec();
        let request = request("reserved", 1, 1);
        {
            let store = SqliteStore::open(&path).unwrap();
            granted(store.reserve(&spec, &request).await.unwrap());
        }
        let store = SqliteStore::open(&path).unwrap();
        let BudgetDecision::Uncertain(reservation) = store.reserve(&spec, &request).await.unwrap()
        else {
            panic!("existing reservation")
        };
        assert!(matches!(
            store.claim(&reservation).await.unwrap(),
            BudgetClaim::Dispatch
        ));
        let legacy = self::super::request("legacy", 1, 1);
        granted(store.reserve(&spec, &legacy).await.unwrap());
        let key = serde_json::to_string(&spec.scope).unwrap();
        {
            let db = rusqlite::Connection::open(store.path().unwrap()).unwrap();
            let payload: String = db.query_row("SELECT payload FROM agent_runtime_budget_operations WHERE root_key=?1 AND operation_key=?2",rusqlite::params![&key,&legacy.operation_id],|row| row.get(0)).unwrap();
            let mut payload: serde_json::Value = serde_json::from_str(&payload).unwrap();
            payload.as_object_mut().unwrap().remove("dispatched");
            db.execute("UPDATE agent_runtime_budget_operations SET payload=?1 WHERE root_key=?2 AND operation_key=?3",rusqlite::params![payload.to_string(),key,legacy.operation_id]).unwrap();
        }
        let BudgetDecision::Uncertain(reservation) = store.reserve(&spec, &legacy).await.unwrap()
        else {
            panic!("legacy unknown")
        };
        assert!(matches!(
            store.claim(&reservation).await.unwrap(),
            BudgetClaim::Uncertain
        ));
    }
    #[tokio::test]
    async fn independent_connections_share_atomic_limits() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("ledger.sqlite");
        let stores = [
            Arc::new(SqliteStore::open(&path).unwrap()),
            Arc::new(SqliteStore::open(&path).unwrap()),
        ];
        let mut spec = spec();
        spec.limits.max_model_calls = Some(1);
        let mut tasks = Vec::new();
        for index in 0..8 {
            let store = stores[index % 2].clone();
            let spec = spec.clone();
            tasks.push(tokio::spawn(async move {
                store
                    .reserve(&spec, &request(&format!("op-{index}"), 1, 1))
                    .await
                    .unwrap()
            }));
        }
        let mut grants = 0;
        for task in tasks {
            if matches!(task.await.unwrap(), BudgetDecision::Granted(_)) {
                grants += 1;
            }
        }
        assert_eq!(grants, 1);
    }
    #[tokio::test]
    async fn expired_workers_cannot_spend_or_settle_and_deadlines_do_not_reset() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("ledger.sqlite");
        let clock = Arc::new(TestClock(AtomicU64::new(1000)));
        let store = SqliteStore::open_with_clock(&path, clock.clone()).unwrap();
        let first = store
            .acquire("thread", "old", Duration::from_millis(10))
            .await
            .unwrap();
        let old = store.guarded(&first);
        let mut spec = spec();
        spec.limits.max_duration_ms = Some(500);
        let reservation = granted(old.reserve(&spec, &request("first", 1, 1)).await.unwrap());
        clock.0.store(1100, Ordering::SeqCst);
        let second = store
            .acquire("thread", "new", Duration::from_millis(1000))
            .await
            .unwrap();
        let receipt = BudgetReceipt {
            used: BudgetCost::default(),
            value: json!({"not_started":true}),
        };
        assert!(matches!(
            old.settle(&reservation, receipt.clone()).await,
            Err(Error::Checkpoint(_))
        ));
        assert!(old.reserve(&spec, &request("fenced", 1, 1)).await.is_err());
        store
            .guarded(&second)
            .settle(&reservation, receipt)
            .await
            .unwrap();
        clock.0.store(1600, Ordering::SeqCst);
        drop(store);
        let reopened = SqliteStore::open_with_clock(&path, clock).unwrap();
        assert!(matches!(
            reopened
                .reserve(&spec, &request("expired", 1, 1))
                .await
                .unwrap(),
            BudgetDecision::Denied(_)
        ));
        assert_eq!(
            reopened
                .inspect(&spec.scope)
                .await
                .unwrap()
                .unwrap()
                .deadline_ms,
            Some(1500)
        );
    }
}
