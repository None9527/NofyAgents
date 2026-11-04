#![cfg(feature = "sqlite")]
use nofy_agent_runtime::{
    durable::{Clock, SqliteStore},
    governance::*,
};
use serde_json::{Value, json};
use std::sync::{
    Arc,
    atomic::{AtomicU64, AtomicUsize, Ordering},
};

struct ObservedClock {
    now: AtomicU64,
    reads: AtomicUsize,
}
impl Clock for ObservedClock {
    fn now_ms(&self) -> u64 {
        self.reads.fetch_add(1, Ordering::SeqCst);
        self.now.load(Ordering::SeqCst)
    }
}
fn snapshot(path: &std::path::Path) -> Vec<Vec<(String, String)>> {
    let db = rusqlite::Connection::open(path).unwrap();
    ["SELECT key,payload FROM agent_runtime_budget_roots ORDER BY key",
     "SELECT root_key||':'||operation_key,payload FROM agent_runtime_budget_operations ORDER BY root_key,operation_key",
     "SELECT CAST(id AS TEXT),payload FROM agent_runtime_budget_events ORDER BY id"].into_iter().map(|sql| {
        db.prepare(sql).unwrap().query_map([], |row| Ok((row.get(0)?, row.get(1)?))).unwrap().collect::<Result<Vec<_>,_>>().unwrap()
    }).collect()
}

#[tokio::test]
async fn page_keeps_exact_original_summaries_unknown_reservations_clock_and_history() {
    let root = tempfile::tempdir().unwrap();
    let path = root.path().join("budget.sqlite");
    let clock = Arc::new(ObservedClock {
        now: AtomicU64::new(1000),
        reads: AtomicUsize::new(0),
    });
    let store = SqliteStore::open_with_clock(&path, clock.clone()).unwrap();
    assert!(store.budget_page("", 2).await.unwrap().ledgers.is_empty());
    let mut expected = Vec::new();
    for id in ["alpha", "beta", "根运行"] {
        let spec = BudgetSpec {
            scope: BudgetScope {
                root_run_id: id.into(),
                identity: "ledger@1".into(),
            },
            limits: BudgetLimits {
                max_input_tokens: Some(u64::MAX),
                max_duration_ms: Some(10),
                ..Default::default()
            },
        };
        let decision = store
            .reserve(
                &spec,
                &BudgetRequest {
                    operation_id: "unknown-model".into(),
                    fingerprint: "frozen-request".into(),
                    reserve: BudgetCost {
                        input_tokens: 9007199254740993,
                        model_calls: 1,
                        ..Default::default()
                    },
                    depth: 0,
                    activity: BudgetActivity::Operation,
                    unbounded_tokens: false,
                },
            )
            .await
            .unwrap();
        let BudgetDecision::Granted(reservation) = decision else {
            panic!("reservation")
        };
        assert!(matches!(
            store.claim(&reservation).await.unwrap(),
            BudgetClaim::Dispatch
        ));
        expected.push(
            serde_json::to_value(store.inspect(&spec.scope).await.unwrap().unwrap()).unwrap(),
        );
    }
    let before = snapshot(&path);
    let clock_reads = clock.reads.load(Ordering::SeqCst);
    clock.now.store(5000, Ordering::SeqCst);
    let first = store.budget_page("", 2).await.unwrap();
    assert_eq!(first.protocol, "nofy.budget-page/v1");
    let cursor = first.next.unwrap();
    let second = store.budget_page(&cursor, 2).await.unwrap();
    assert!(second.next.is_none());
    let actual: Vec<Value> = first
        .ledgers
        .into_iter()
        .chain(second.ledgers)
        .map(|v| serde_json::to_value(v).unwrap())
        .collect();
    assert_eq!(actual, expected);
    assert_eq!(
        actual[0]["reserved"]["input_tokens"],
        json!(9007199254740993_u64)
    );
    assert_eq!(actual[0]["last_seen_ms"], json!(1000));
    assert_eq!(snapshot(&path), before);
    assert_eq!(clock.reads.load(Ordering::SeqCst), clock_reads);
    drop(store);
    let reopened = SqliteStore::open_with_clock(&path, clock).unwrap();
    assert_eq!(
        serde_json::to_value(reopened.budget_page("", 64).await.unwrap().ledgers).unwrap(),
        json!(expected)
    );
    assert_eq!(snapshot(&path), before);
}

#[tokio::test]
async fn page_rejects_invalid_bounds_and_corrupted_stored_identity() {
    let root = tempfile::tempdir().unwrap();
    let path = root.path().join("budget.sqlite");
    let store = SqliteStore::open(&path).unwrap();
    assert!(store.budget_page("", 0).await.is_err());
    assert!(store.budget_page("", 65).await.is_err());
    assert!(
        store
            .budget_page(&"x".repeat(512 * 1024 + 1), 1)
            .await
            .is_err()
    );
    let spec = BudgetSpec {
        scope: BudgetScope {
            root_run_id: "root".into(),
            identity: "ledger@1".into(),
        },
        limits: BudgetLimits::default(),
    };
    let summary = store.enroll(&spec).await.unwrap();
    let mut payload = serde_json::to_value(summary).unwrap();
    payload["spec"]["scope"]["identity"] = json!("other-ledger");
    let db = rusqlite::Connection::open(path).unwrap();
    db.execute(
        "UPDATE agent_runtime_budget_roots SET payload=?1",
        [payload.to_string()],
    )
    .unwrap();
    assert!(store.budget_page("", 1).await.is_err());
    db.execute("UPDATE agent_runtime_budget_roots SET payload='{'", [])
        .unwrap();
    assert!(store.budget_page("", 1).await.is_err());
}
