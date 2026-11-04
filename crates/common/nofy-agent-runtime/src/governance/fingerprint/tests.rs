use super::*;
use crate::governance::*;
use serde_json::json;
use std::sync::Arc;

fn original() -> BudgetRequest {
    BudgetRequest {
        operation_id: serde_json::to_string(&("child", "run")).unwrap(),
        fingerprint: serde_json::to_string(&("frozen-composition", "原输入")).unwrap(),
        reserve: BudgetCost {
            child_calls: 1,
            ..Default::default()
        },
        depth: 2,
        activity: BudgetActivity::Child,
        unbounded_tokens: false,
    }
}
fn spec() -> BudgetSpec {
    BudgetSpec {
        scope: BudgetScope {
            root_run_id: "root".into(),
            identity: "original-ledger".into(),
        },
        limits: BudgetLimits {
            max_child_calls: Some(1),
            max_depth: Some(2),
            ..Default::default()
        },
    }
}
fn held(decision: BudgetDecision) -> BudgetReservation {
    match decision {
        BudgetDecision::Granted(r) | BudgetDecision::Uncertain(r) => r,
        value => panic!("original reservation expected: {value:?}"),
    }
}
async fn original_record_contract(store: Arc<dyn BudgetStore>) {
    let original = original();
    let spec = spec();
    let reservation = held(store.reserve(&spec, &original).await.unwrap());
    let mut other_scope = spec.scope.clone();
    other_scope.root_run_id = "another-root".into();
    assert!(
        store
            .claim(&BudgetReservation {
                scope: other_scope,
                request: original.clone()
            })
            .await
            .is_err()
    );
    let mut digest = original.clone();
    digest.fingerprint = child_fingerprint("frozen-composition", "原输入");
    let reattached = held(store.reserve(&spec, &digest).await.unwrap());
    assert_eq!(reattached.request(), &original);
    assert!(matches!(
        store.claim(&reattached).await.unwrap(),
        BudgetClaim::Dispatch
    ));
    let before = store.inspect(&spec.scope).await.unwrap().unwrap();
    let claimed = held(store.reserve(&spec, &digest).await.unwrap());
    assert_eq!(claimed.request(), reservation.request());
    assert!(matches!(
        store.claim(&claimed).await.unwrap(),
        BudgetClaim::Uncertain
    ));
    let after = store.inspect(&spec.scope).await.unwrap().unwrap();
    assert_eq!(after.used, before.used);
    assert_eq!(after.reserved, before.reserved);
    assert_eq!(after.operation_count, 1);
    assert_eq!(after.active_children, 1);
    let mut wrong = digest.clone();
    wrong.fingerprint = child_fingerprint("frozen-composition", "另一个输入");
    assert!(store.reserve(&spec, &wrong).await.is_err());
    let mut wrong = digest.clone();
    wrong.depth += 1;
    assert!(store.reserve(&spec, &wrong).await.is_err());
    let result = BudgetReceipt {
        used: original.reserve,
        value: json!({"effect":"completed once"}),
    };
    store.settle(&claimed, result.clone()).await.unwrap();
    assert!(
        matches!(store.reserve(&spec, &digest).await.unwrap(), BudgetDecision::Replay(receipt) if receipt==result)
    );
    let completed = store.inspect(&spec.scope).await.unwrap().unwrap();
    assert_eq!(completed.used.child_calls, 1);
    assert_eq!(completed.reserved, BudgetCost::default());
    assert_eq!(completed.active_children, 0);
    assert_eq!(completed.operation_count, 1);
}

#[tokio::test]
async fn original_memory_child_reservation_and_receipt_survive_digest_representation() {
    original_record_contract(Arc::new(InMemoryBudgetStore::default())).await;
}

#[cfg(feature = "sqlite")]
#[tokio::test]
async fn original_sqlite_child_request_is_not_rewritten_and_survives_database_reopen() {
    let directory = tempfile::tempdir().unwrap();
    let path = directory.path().join("runtime.sqlite");
    let store = crate::durable::SqliteStore::open(&path).unwrap();
    original_record_contract(Arc::new(store.clone())).await;
    let expected = original();
    let id = expected.operation_id.clone();
    let saved: BudgetRequest = store.transaction(move |tx| {
        let value: String = tx.query_row("SELECT json_extract(payload,'$.request') FROM agent_runtime_budget_operations WHERE operation_key=?1", [id], |r| r.get(0)).map_err(crate::durable::db_error)?;
        serde_json::from_str(&value).map_err(crate::durable::db_error)
    }).await.unwrap();
    assert_eq!(saved, expected);
    let reopened = crate::durable::SqliteStore::open(&path).unwrap();
    let mut digest = expected;
    digest.fingerprint = child_fingerprint("frozen-composition", "原输入");
    assert!(matches!(
        reopened.reserve(&spec(), &digest).await.unwrap(),
        BudgetDecision::Replay(_)
    ));
    assert_eq!(
        reopened
            .inspect(&spec().scope)
            .await
            .unwrap()
            .unwrap()
            .used
            .child_calls,
        1
    );
}

#[test]
fn digest_alias_does_not_accept_another_activity_cost_scope_or_purpose() {
    let old = original();
    let mut digest = old.clone();
    digest.fingerprint = child_fingerprint("frozen-composition", "原输入");
    assert!(same_child_request(&old, &digest));
    for field in 0..6 {
        let mut changed = digest.clone();
        match field {
            0 => changed.operation_id = "another-operation".into(),
            1 => changed.reserve.child_calls += 1,
            2 => changed.activity = BudgetActivity::Operation,
            3 => changed.unbounded_tokens = true,
            4 => changed.depth += 1,
            _ => changed.fingerprint = child_fingerprint("another-composition", "原输入"),
        }
        assert!(!same_child_request(&old, &changed));
    }
    let mut primitive = old.clone();
    primitive.activity = BudgetActivity::Operation;
    let mut matching = digest;
    matching.activity = BudgetActivity::Operation;
    assert!(!same_child_request(&primitive, &matching));
}

#[tokio::test]
async fn mixed_original_and_digest_floors_keep_each_original_claim_and_result() {
    let store = Arc::new(InMemoryBudgetStore::default());
    let old = original();
    let mut digest = old.clone();
    digest.fingerprint = child_fingerprint("frozen-composition", "原输入");
    let mut a = spec();
    a.scope.identity = "floor-a".into();
    let mut b = spec();
    b.scope.identity = "floor-b".into();
    let held_a = held(store.reserve(&a, &old).await.unwrap());
    let held_b = held(store.reserve(&b, &digest).await.unwrap());
    assert!(matches!(
        store.claim(&held_a).await.unwrap(),
        BudgetClaim::Dispatch
    ));
    assert!(matches!(
        store.claim(&held_b).await.unwrap(),
        BudgetClaim::Dispatch
    ));
    let mut context = crate::RunContext::new("thread", "root");
    context
        .capabilities
        .insert(super::super::runtime::BudgetControl {
            entries: vec![
                super::super::runtime::BudgetEntry {
                    store: store.clone(),
                    spec: a.clone(),
                },
                super::super::runtime::BudgetEntry {
                    store: store.clone(),
                    spec: b.clone(),
                },
            ],
            depth: old.depth,
            ..Default::default()
        });
    assert!(matches!(
        super::super::runtime::reserve(
            &context,
            &digest.operation_id,
            &digest.fingerprint,
            digest.reserve,
            BudgetActivity::Child,
            false,
            false
        )
        .await,
        Err(crate::Error::GovernancePaused(_))
    ));
    let super::super::runtime::GroupAdmission::Ready(restored) = super::super::runtime::reserve(
        &context,
        &digest.operation_id,
        &digest.fingerprint,
        digest.reserve,
        BudgetActivity::Child,
        false,
        true,
    )
    .await
    .unwrap() else {
        panic!("original child group expected")
    };
    assert_eq!(restored[0].reservation.request(), &old);
    assert_eq!(restored[1].reservation.request(), &digest);
    let result = BudgetReceipt {
        used: old.reserve,
        value: json!({"success":true}),
    };
    super::super::runtime::settle(&restored, result.clone())
        .await
        .unwrap();
    assert!(matches!(
        super::super::runtime::reserve(&context, &digest.operation_id, &digest.fingerprint, digest.reserve, BudgetActivity::Child, false, true).await.unwrap(),
        super::super::runtime::GroupAdmission::Replay(value) if value==result
    ));
    for floor in [a, b] {
        let sum = store.inspect(&floor.scope).await.unwrap().unwrap();
        assert_eq!(sum.operation_count, 1);
        assert_eq!(sum.used.child_calls, 1);
        assert_eq!(sum.reserved, BudgetCost::default());
        assert_eq!(sum.active_children, 0);
    }
}
