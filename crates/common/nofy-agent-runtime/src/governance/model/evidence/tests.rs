use super::*;
use crate::{InMemoryCheckpointer, governance::*};
use std::sync::atomic::{AtomicUsize, Ordering};

struct WaitingModel {
    known_failures: usize,
    calls: Arc<AtomicUsize>,
    started: Arc<tokio::sync::Notify>,
}
#[async_trait::async_trait]
impl Model for WaitingModel {
    async fn request_bound(
        &self,
        _: &ModelRequest,
        _: &RunContext,
    ) -> Result<crate::model::ModelRequestBound, Error> {
        Ok(crate::model::ModelRequestBound {
            max_calls: 1,
            max_input_tokens: Some(10),
            max_output_tokens: Some(5),
        })
    }
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        if self.calls.fetch_add(1, Ordering::SeqCst) < self.known_failures {
            return Err(Error::Model("known provider rejection".into()));
        }
        self.started.notify_one();
        std::future::pending().await
    }
}
async fn setup() -> (
    RunContext,
    ModelRecovery,
    Arc<InMemoryBudgetStore>,
    BudgetScope,
    WaitingModel,
    super::super::super::runtime::RunBudgetGuard,
) {
    let store = Arc::new(InMemoryBudgetStore::default());
    let profile = Arc::new(
        GovernanceProfile::new(
            Arc::new(
                InstalledBudget::install(
                    store.clone(),
                    BudgetLimits::default(),
                    "model-evidence",
                    1,
                )
                .unwrap(),
            ),
            BudgetLimits {
                max_model_calls: Some(10),
                ..Default::default()
            },
            ModelRetryPolicy::default(),
        )
        .unwrap(),
    );
    let mut context = RunContext::new("thread", "run");
    let guard = runtime::prepare(&[profile.clone()], &mut context, false)
        .await
        .unwrap();
    let scope = BudgetScope {
        root_run_id: "run".into(),
        identity: profile.identity().into(),
    };
    let journal = ModelRecovery::new(
        Arc::new(InMemoryCheckpointer::default()),
        "composition",
        &context,
    );
    context.capabilities.insert(journal.clone());
    (
        context,
        journal,
        store,
        scope,
        WaitingModel {
            known_failures: 0,
            calls: Arc::new(AtomicUsize::new(0)),
            started: Arc::new(tokio::sync::Notify::new()),
        },
        guard,
    )
}

#[tokio::test]
async fn evidence_selects_the_retry_generation_without_replacing_its_settled_failure() {
    let (context, journal, store, scope, mut model, _guard) = setup().await;
    model.known_failures = 1;
    assert!(matches!(
        sample(&model, &context, "operation").await,
        Err(Error::ModelFailure(_))
    ));
    let failure = journal.failure_ticket().await.unwrap().unwrap();
    journal
        .authorize(&ModelRetryCommand {
            command_id: "retry".into(),
            ticket: failure,
        })
        .await
        .unwrap();
    {
        let future = sample(&model, &context, "operation");
        tokio::pin!(future);
        tokio::select! {r=&mut future=>panic!("{r:?}"),_=model.started.notified()=>{}}
    }
    let target = journal.model_targets().await.unwrap().remove(0);
    assert_eq!(target.ticket.request.generation, 1);
    journal
        .accept_model_evidence(
            ModelReconciliation {
                ticket: target.ticket,
                result: ModelReconciliationResult::Completed {
                    response: response("retry-result"),
                },
            },
            true,
        )
        .await
        .unwrap();
    assert_eq!(
        sample(&model, &context, "operation").await.unwrap().output,
        "retry-result"
    );
    assert_eq!(model.calls.load(Ordering::SeqCst), 2);
    let summary = store.inspect(&scope).await.unwrap().unwrap();
    assert_eq!(summary.used.model_calls, 2);
    assert_eq!(summary.used.input_tokens, 20);
    assert_eq!(summary.reserved, BudgetCost::default());
}

#[tokio::test]
async fn evidence_reporting_more_than_the_bound_records_usage_and_blocks_the_original_budget() {
    let (context, journal, store, scope, model, _guard) = setup().await;
    {
        let future = sample(&model, &context, "operation");
        tokio::pin!(future);
        tokio::select! {r=&mut future=>panic!("{r:?}"),_=model.started.notified()=>{}}
    }
    let target = journal.model_targets().await.unwrap().remove(0);
    let mut output = response("over-bound");
    output.input_tokens = 20;
    journal
        .accept_model_evidence(
            ModelReconciliation {
                ticket: target.ticket,
                result: ModelReconciliationResult::Completed { response: output },
            },
            true,
        )
        .await
        .unwrap();
    assert!(matches!(
        sample(&model, &context, "operation").await,
        Err(Error::BudgetExceeded)
    ));
    let summary = store.inspect(&scope).await.unwrap().unwrap();
    assert_eq!(summary.used.input_tokens, 20);
    assert!(summary.blocked.is_some());
    assert_eq!(summary.reserved, BudgetCost::default());
    assert!(journal.model_targets().await.unwrap().is_empty());
    assert_eq!(model.calls.load(Ordering::SeqCst), 1);
}
fn request() -> ModelRequest {
    ModelRequest {
        messages: vec![],
        tools: vec![],
        settings: Value::Null,
    }
}
fn response(output: &str) -> ModelResponse {
    ModelResponse {
        output: output.into(),
        input_tokens: 3,
        output_tokens: 2,
        ..Default::default()
    }
}
async fn sample(
    model: &WaitingModel,
    context: &RunContext,
    operation: &str,
) -> Result<ModelResponse, Error> {
    sample_model(model, request(), context, operation, true, |_| async {
        Ok(())
    })
    .await
}
#[tokio::test]
async fn legacy_claimed_intent_gets_a_ticket_and_consumes_evidence_without_new_io_or_free_usage() {
    let (context, journal, store, scope, model, _guard) = setup().await;
    let control = context.capabilities.get::<BudgetControl>().unwrap();
    let fingerprint = crate::governance::recovery::fingerprint(&request()).unwrap();
    let request = BudgetRequest {
        operation_id: serde_json::to_string(&("operation", 0u32)).unwrap(),
        fingerprint,
        reserve: BudgetCost {
            steps: 1,
            model_calls: 1,
            input_tokens: 10,
            output_tokens: 5,
            ..Default::default()
        },
        depth: 0,
        activity: BudgetActivity::Operation,
        unbounded_tokens: false,
    };
    let BudgetDecision::Granted(held) = store
        .reserve(&control.entries[0].spec, &request)
        .await
        .unwrap()
    else {
        panic!("fresh intent")
    };
    assert!(matches!(
        store.claim(&held).await.unwrap(),
        BudgetClaim::Dispatch
    ));
    assert!(matches!(
        sample(&model, &context, "operation").await,
        Err(Error::GovernancePaused(_))
    ));
    let targets = journal.model_targets().await.unwrap();
    assert_eq!(targets.len(), 1);
    let receipt = ModelReconciliation {
        ticket: targets[0].ticket.clone(),
        result: ModelReconciliationResult::Completed {
            response: response("operator-result"),
        },
    };
    for field in ["scope", "generation", "attempt", "fingerprint"] {
        let mut bad = receipt.clone();
        match field {
            "scope" => bad.ticket.request.operation_scope = Some("wrong".into()),
            "generation" => bad.ticket.request.generation = 1,
            "attempt" => bad.ticket.attempt = 1,
            _ => bad.ticket.request.request_fingerprint = "0".repeat(64),
        };
        assert!(journal.accept_model_evidence(bad, true).await.is_err());
    }
    assert!(
        journal
            .accept_model_evidence(receipt.clone(), false)
            .await
            .is_err()
    );
    journal
        .accept_model_evidence(receipt.clone(), true)
        .await
        .unwrap();
    journal
        .accept_model_evidence(receipt.clone(), false)
        .await
        .unwrap();
    assert!(journal.model_targets().await.unwrap()[0].evidence_accepted);
    assert_eq!(
        sample(&model, &context, "operation").await.unwrap().output,
        "operator-result"
    );
    assert_eq!(
        sample(&model, &context, "operation").await.unwrap().output,
        "operator-result"
    );
    let used = store.inspect(&scope).await.unwrap().unwrap();
    assert_eq!(used.used, request.reserve);
    assert_eq!(used.reserved, BudgetCost::default());
    assert_eq!(used.active_operations, 0);
    assert_eq!(model.calls.load(Ordering::SeqCst), 0);
    assert!(journal.model_targets().await.unwrap().is_empty());
    let mut changed = receipt;
    changed.result = ModelReconciliationResult::Completed {
        response: response("replacement"),
    };
    assert!(journal.accept_model_evidence(changed, true).await.is_err());
}
#[tokio::test]
async fn native_budget_receipt_wins_over_operator_evidence_after_a_lost_acknowledgement() {
    let (context, journal, store, _scope, model, _guard) = setup().await;
    {
        let future = sample(&model, &context, "operation");
        tokio::pin!(future);
        tokio::select! {r=&mut future=>panic!("{r:?}"),_=model.started.notified()=>{}}
    }
    let target = journal.model_targets().await.unwrap().remove(0);
    let receipt = ModelReconciliation {
        ticket: target.ticket.clone(),
        result: ModelReconciliationResult::Completed {
            response: response("operator-result"),
        },
    };
    journal.accept_model_evidence(receipt, true).await.unwrap();
    let control = context.capabilities.get::<BudgetControl>().unwrap();
    let request = BudgetRequest {
        operation_id: serde_json::to_string(&("operation", 0u32)).unwrap(),
        fingerprint: target.ticket.request.request_fingerprint,
        reserve: target.reserved,
        depth: 0,
        activity: BudgetActivity::Operation,
        unbounded_tokens: false,
    };
    let BudgetDecision::Uncertain(held) = store
        .reserve(&control.entries[0].spec, &request)
        .await
        .unwrap()
    else {
        panic!("claimed intent")
    };
    store
        .settle(
            &held,
            BudgetReceipt {
                used: BudgetCost {
                    steps: 1,
                    model_calls: 1,
                    input_tokens: 3,
                    output_tokens: 2,
                    ..Default::default()
                },
                value: json!({"outcome":"completed","response":response("native-result")}),
            },
        )
        .await
        .unwrap();
    assert_eq!(
        sample(&model, &context, "operation").await.unwrap().output,
        "native-result"
    );
    assert!(journal.model_targets().await.unwrap().is_empty());
    assert_eq!(model.calls.load(Ordering::SeqCst), 1);
}
#[tokio::test]
async fn parallel_scoped_intents_keep_distinct_tickets_without_lost_updates() {
    let (context, journal, _store, _scope, model, _guard) = setup().await;
    let first = operation_context(&context, "first-scope");
    let second = operation_context(&context, "second-scope");
    {
        let joined = async {
            tokio::join!(
                sample(&model, &first, "first"),
                sample(&model, &second, "second")
            )
        };
        tokio::pin!(joined);
        let observed = async {
            while model.calls.load(Ordering::SeqCst) < 2 {
                model.started.notified().await
            }
        };
        tokio::select! {r=&mut joined=>panic!("{r:?}"),_=observed=>{}}
    }
    let targets = journal.model_targets().await.unwrap();
    assert_eq!(targets.len(), 2);
    let target = targets
        .into_iter()
        .find(|t| t.ticket.request.operation_scope.as_deref() == Some("first-scope"))
        .unwrap();
    journal
        .accept_model_evidence(
            ModelReconciliation {
                ticket: target.ticket,
                result: ModelReconciliationResult::Completed {
                    response: response("first-result"),
                },
            },
            true,
        )
        .await
        .unwrap();
    assert_eq!(
        sample(&model, &first, "first").await.unwrap().output,
        "first-result"
    );
    assert_eq!(journal.model_targets().await.unwrap().len(), 1);
    assert_eq!(model.calls.load(Ordering::SeqCst), 2);
}

#[tokio::test]
async fn failure_evidence_settles_once_and_issues_the_original_explicit_retry_ticket() {
    let (context, journal, store, scope, model, _guard) = setup().await;
    {
        let future = sample(&model, &context, "operation");
        tokio::pin!(future);
        tokio::select! {r=&mut future=>panic!("{r:?}"),_=model.started.notified()=>{}}
    }
    let target = journal.model_targets().await.unwrap().remove(0);
    let receipt = ModelReconciliation {
        ticket: target.ticket.clone(),
        result: ModelReconciliationResult::Failed {
            failure: crate::model::ModelFailure {
                category: "auth".into(),
                message: "provider rejected the request".into(),
                status: Some(401),
                retryable: false,
                retry_after_ms: None,
                code: None,
                details: Value::Null,
            },
        },
    };
    journal
        .accept_model_evidence(receipt.clone(), true)
        .await
        .unwrap();
    for _ in 0..2 {
        assert!(
            matches!(sample(&model,&context,"operation").await,Err(Error::ModelFailure(failure)) if failure.status==Some(401))
        );
    }
    assert_eq!(model.calls.load(Ordering::SeqCst), 1);
    assert!(journal.model_targets().await.unwrap().is_empty());
    let failure = journal.failure_ticket().await.unwrap().unwrap();
    assert_eq!(failure, target.ticket.request);
    let summary = store.inspect(&scope).await.unwrap().unwrap();
    assert_eq!(summary.used, target.reserved);
    assert_eq!(summary.reserved, BudgetCost::default());
    let mut changed = receipt;
    changed.result = ModelReconciliationResult::Completed {
        response: response("forged-success"),
    };
    assert!(journal.accept_model_evidence(changed, true).await.is_err());
    journal
        .authorize(&ModelRetryCommand {
            command_id: "retry-after-evidence".into(),
            ticket: failure,
        })
        .await
        .unwrap();
    {
        let future = sample(&model, &context, "operation");
        tokio::pin!(future);
        tokio::select! {r=&mut future=>panic!("{r:?}"),_=model.started.notified()=>{}}
    }
    let retry = journal.model_targets().await.unwrap().remove(0);
    assert_eq!(retry.ticket.request.generation, 1);
    journal
        .accept_model_evidence(
            ModelReconciliation {
                ticket: retry.ticket,
                result: ModelReconciliationResult::Completed {
                    response: response("retried"),
                },
            },
            true,
        )
        .await
        .unwrap();
    assert_eq!(
        sample(&model, &context, "operation").await.unwrap().output,
        "retried"
    );
    assert_eq!(model.calls.load(Ordering::SeqCst), 2);
    assert_eq!(
        store
            .inspect(&scope)
            .await
            .unwrap()
            .unwrap()
            .used
            .model_calls,
        2
    );
}
