use super::*;
use crate::{InMemoryCheckpointer, context::ContextBinding, model_journal::ModelJournalBinding};
use std::sync::{
    Arc,
    atomic::{AtomicUsize, Ordering},
};
struct Waiting {
    calls: Arc<AtomicUsize>,
    started: Arc<tokio::sync::Notify>,
}
#[async_trait::async_trait]
impl Model for Waiting {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        self.calls.fetch_add(1, Ordering::SeqCst);
        self.started.notify_one();
        std::future::pending().await
    }
}
fn setup() -> (RunContext, ModelRecovery, Waiting) {
    let mut ctx = RunContext::new("thread", "run");
    ModelJournalBinding.bind(&mut ctx).unwrap();
    let journal = ModelRecovery::new(
        Arc::new(InMemoryCheckpointer::default()),
        "composition",
        &ctx,
    );
    ctx.capabilities.insert(journal.clone());
    (
        ctx,
        journal,
        Waiting {
            calls: Arc::new(AtomicUsize::new(0)),
            started: Arc::new(tokio::sync::Notify::new()),
        },
    )
}
async fn invoke(model: &Waiting, ctx: &RunContext, id: &str) -> Result<ModelResponse, Error> {
    sample_model(
        model,
        ModelRequest {
            messages: vec![],
            tools: vec![],
            settings: Value::Null,
        },
        ctx,
        id,
        true,
        |_| async { Ok(()) },
    )
    .await
}
fn response(output: &str) -> ModelResponse {
    ModelResponse {
        output: output.into(),
        input_tokens: 3,
        output_tokens: 2,
        info: crate::CompletionInfo {
            provider: json!({"native":true}),
            ..Default::default()
        },
        ..Default::default()
    }
}
#[tokio::test]
async fn unknown_unmetered_intent_waits_for_exact_evidence_and_never_reissues_the_request() {
    let (ctx, journal, model) = setup();
    {
        let future = invoke(&model, &ctx, "operation");
        tokio::pin!(future);
        tokio::select! {r=&mut future=>panic!("{r:?}"),_=model.started.notified()=>{}}
    }
    assert!(matches!(
        invoke(&model, &ctx, "operation").await,
        Err(Error::GovernancePaused(_))
    ));
    let target = journal.model_targets().await.unwrap().remove(0);
    assert!(target.unmetered);
    assert_eq!(target.reserved, BudgetCost::default());
    assert!(!is_governed(&ctx));
    let receipt = ModelReconciliation {
        ticket: target.ticket,
        result: ModelReconciliationResult::Completed {
            response: response("recovered"),
        },
    };
    let mut bad = receipt.clone();
    bad.ticket.request.generation = 1;
    assert!(journal.accept_model_evidence(bad, true).await.is_err());
    journal
        .accept_model_evidence(receipt.clone(), true)
        .await
        .unwrap();
    for _ in 0..2 {
        let result = invoke(&model, &ctx, "operation").await.unwrap();
        assert_eq!(result.output, "recovered");
        assert_eq!((result.input_tokens, result.output_tokens), (3, 2));
        assert_eq!(result.info.provider, json!({"native":true}));
    }
    assert_eq!(model.calls.load(Ordering::SeqCst), 1);
    assert!(journal.model_targets().await.unwrap().is_empty());
    let mut changed = receipt;
    changed.result = ModelReconciliationResult::Completed {
        response: response("replacement"),
    };
    assert!(journal.accept_model_evidence(changed, true).await.is_err());
}
#[tokio::test]
async fn unmetered_native_result_wins_when_operator_evidence_arrived_after_a_lost_ack() {
    let (ctx, journal, model) = setup();
    {
        let future = invoke(&model, &ctx, "operation");
        tokio::pin!(future);
        tokio::select! {r=&mut future=>panic!("{r:?}"),_=model.started.notified()=>{}}
    }
    let target = journal.model_targets().await.unwrap().remove(0);
    journal
        .settle_unmetered(
            &target,
            CachedModel::Completed {
                response: response("native-result"),
            },
        )
        .await
        .unwrap();
    journal
        .accept_model_evidence(
            ModelReconciliation {
                ticket: target.ticket,
                result: ModelReconciliationResult::Completed {
                    response: response("operator-result"),
                },
            },
            true,
        )
        .await
        .unwrap();
    assert_eq!(
        invoke(&model, &ctx, "operation").await.unwrap().output,
        "native-result"
    );
    assert_eq!(model.calls.load(Ordering::SeqCst), 1);
}
#[tokio::test]
async fn parallel_unmetered_scopes_preserve_each_armed_intent_and_result() {
    let (ctx, journal, model) = setup();
    let a = operation_context(&ctx, "a");
    let b = operation_context(&ctx, "b");
    {
        let joined = async { tokio::join!(invoke(&model, &a, "a"), invoke(&model, &b, "b")) };
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
    for target in targets {
        journal
            .accept_model_evidence(
                ModelReconciliation {
                    ticket: target.ticket,
                    result: ModelReconciliationResult::Completed {
                        response: response("scope-result"),
                    },
                },
                true,
            )
            .await
            .unwrap();
    }
    assert_eq!(
        invoke(&model, &a, "a").await.unwrap().output,
        "scope-result"
    );
    assert_eq!(
        invoke(&model, &b, "b").await.unwrap().output,
        "scope-result"
    );
    assert!(journal.model_targets().await.unwrap().is_empty());
    assert_eq!(model.calls.load(Ordering::SeqCst), 2);
}
