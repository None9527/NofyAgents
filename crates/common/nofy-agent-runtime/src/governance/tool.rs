use super::*;
use crate::{RunContext, ToolCall};
use futures::StreamExt;
use nofy_tool_runtime::{
    ToolCallContext, ToolDispatch, ToolError, ToolStreamItem, TypedToolOutput,
};
use std::future::Future;

/// Boundary for adapter-owned primitive effects with a serializable native
/// result. Apply schema and the inherited policy floor before entering it.
pub async fn tool_operation<T, F>(
    context: &RunContext,
    call: &ToolCall,
    operation: &str,
    revision: &str,
    execute: F,
) -> Result<T, Error>
where
    T: Serialize + serde::de::DeserializeOwned,
    F: Future<Output = Result<T, Error>>,
{
    let fingerprint = profile::digest(
        &serde_json::to_value((call, revision)).map_err(|e| Error::Composition(e.to_string()))?,
    )?;
    let cost = BudgetCost {
        tool_calls: 1,
        ..Default::default()
    };
    let held = match runtime::reserve(
        context,
        operation,
        &fingerprint,
        cost,
        BudgetActivity::Operation,
        false,
        false,
    )
    .await?
    {
        runtime::GroupAdmission::Replay(receipt) => {
            return serde_json::from_value(receipt.value)
                .map_err(|e| Error::Checkpoint(e.to_string()));
        }
        runtime::GroupAdmission::Ready(held) => held,
    };
    let result = tokio::select! { biased;
        _ = context.cancel.cancelled() => return Err(runtime::cancellation(context)),
        result = execute => result?,
    };
    runtime::settle(
        &held,
        BudgetReceipt {
            used: cost,
            value: serde_json::to_value(&result).map_err(|e| Error::Checkpoint(e.to_string()))?,
        },
    )
    .await?;
    Ok(result)
}

fn fingerprint(
    dispatch: &dyn ToolDispatch,
    call: &ToolCall,
    revision: &str,
) -> Result<String, Error> {
    profile::digest(
        &serde_json::to_value((call, revision, dispatch.recovery_identity()))
            .map_err(|e| Error::Tool(e.to_string()))?,
    )
}
fn reconciled_result(
    call: &ToolCall,
    value: &Value,
    is_error: bool,
) -> Result<Result<TypedToolOutput, ToolError>, Error> {
    Ok(if is_error {
        Err(ToolError::custom("reconciled", value.to_string()))
    } else {
        Ok(TypedToolOutput::from_value(
            nofy_tool_protocol::ToolId::new(&call.name).map_err(|e| Error::Tool(e.to_string()))?,
            value.clone(),
        ))
    })
}

pub(crate) async fn reconcile_tool(
    dispatch: &dyn ToolDispatch,
    call: &ToolCall,
    context: &RunContext,
    operation_id: &str,
    revision: &str,
    value: &Value,
    is_error: bool,
) -> Result<Option<(Value, bool)>, Error> {
    if context.capabilities.get::<BudgetControl>().is_none() {
        return Ok(None);
    }
    if dispatch.is_resumable() {
        return Err(Error::Checkpoint(
            "reconcile the primitive effect inside its resumable controller".into(),
        ));
    }
    let cost = BudgetCost {
        tool_calls: 1,
        ..Default::default()
    };
    let result = reconciled_result(call, value, is_error)?;
    let content = match &result {
        Ok(output) => serde_json::to_value(output).map_err(|e| Error::Checkpoint(e.to_string()))?,
        Err(error) => serde_json::json!({"error":error.to_string()}),
    };
    let receipt = BudgetReceipt {
        used: cost,
        value: serde_json::to_value(result).map_err(|e| Error::Checkpoint(e.to_string()))?,
    };
    match runtime::reserve(
        context,
        operation_id,
        &fingerprint(dispatch, call, revision)?,
        cost,
        BudgetActivity::Operation,
        false,
        true,
    )
    .await?
    {
        runtime::GroupAdmission::Ready(held) => {
            runtime::settle(&held, receipt).await?;
            Ok(Some((content, is_error)))
        }
        runtime::GroupAdmission::Replay(_) => Err(Error::Checkpoint(
            "tool already has a budget receipt; resume to consume its recorded result".into(),
        )),
    }
}

/// Execute an already admitted tool. Hosts must validate its schema and apply
/// their policy floor first. Recovery only reattaches dispatchers declaring an
/// immutable resumable contract; primitive effects require a cached receipt.
pub async fn dispatch_tool<F, Fut>(
    dispatch: &dyn ToolDispatch,
    call: &ToolCall,
    context: ToolCallContext,
    operation_id: &str,
    revision: &str,
    resume: bool,
    mut progress: F,
) -> Result<Result<TypedToolOutput, ToolError>, Error>
where
    F: FnMut(nofy_tool_runtime::ToolProgress) -> Fut,
    Fut: Future<Output = Result<(), Error>>,
{
    let run = context
        .get::<RunContext>()
        .ok_or_else(|| Error::Tool("missing run context".into()))?;
    let fingerprint = fingerprint(dispatch, call, revision)?;
    let reconciliation = context.get::<crate::reconciliation::ToolReconciliation>();
    let cost = BudgetCost {
        tool_calls: 1,
        ..Default::default()
    };
    let activity = if dispatch.is_resumable() {
        BudgetActivity::None
    } else {
        BudgetActivity::Operation
    };
    let held = match runtime::reserve(
        &run,
        operation_id,
        &fingerprint,
        cost,
        activity,
        false,
        (resume && dispatch.is_resumable()) || reconciliation.is_some(),
    )
    .await?
    {
        runtime::GroupAdmission::Replay(receipt) => {
            return serde_json::from_value(receipt.value)
                .map_err(|e| Error::Checkpoint(format!("invalid tool budget receipt: {e}")));
        }
        runtime::GroupAdmission::Ready(held) => held,
    };
    if let Some(receipt) = reconciliation {
        if receipt.0.call != *call
            || receipt.0.thread_id != run.thread_id
            || receipt.0.run_id != run.run_id
            || dispatch.is_resumable()
        {
            return Err(Error::Checkpoint(
                "tool reconciliation scope/controller mismatch".into(),
            ));
        }
        let result = reconciled_result(call, &receipt.0.result, receipt.0.is_error)?;
        runtime::settle(
            &held,
            BudgetReceipt {
                used: cost,
                value: serde_json::to_value(&result)
                    .map_err(|e| Error::Checkpoint(e.to_string()))?,
            },
        )
        .await?;
        return Ok(result);
    }
    let control = context.get::<crate::composition::ChildControl>();
    let id = nofy_tool_protocol::ToolId::new(&call.name).map_err(|e| Error::Tool(e.to_string()))?;
    let execute = async {
        let mut stream = dispatch.call(id, call.arguments.clone(), context).await;
        while let Some(item) = stream.next().await {
            match item {
                ToolStreamItem::Progress(value) => progress(value).await?,
                ToolStreamItem::Terminal(result) => return Ok::<_, Error>(result),
            }
        }
        Ok(Err(ToolError::custom(
            "stream_no_terminal",
            "dispatch stream ended without a terminal item",
        )))
    };
    let result = tokio::select! { biased;
        _ = run.cancel.cancelled() => return Err(runtime::cancellation(&run)),
        result = execute => result?,
    };
    if control
        .as_ref()
        .is_some_and(|control| control.0.lock().map_or(true, |outcome| outcome.is_some()))
    {
        return Ok(result);
    }
    if dispatch.is_resumable() && result.is_err() {
        return Ok(result);
    }
    runtime::settle(
        &held,
        BudgetReceipt {
            used: cost,
            value: serde_json::to_value(&result).map_err(|e| Error::Checkpoint(e.to_string()))?,
        },
    )
    .await?;
    Ok(result)
}

#[cfg(test)]
mod recovery_tests {
    use super::*;
    use crate::reconciliation::{ReconciliationControl, ReconciliationInput, ToolReconciliation};
    use std::sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
    };
    struct Effect(Arc<AtomicUsize>);
    impl nofy_tool_runtime::Tool for Effect {
        type Args = Value;
        type Output = Value;
        fn id(&self) -> nofy_tool_protocol::ToolId {
            nofy_tool_protocol::ToolId::new("effect").unwrap()
        }
        fn description(
            &self,
            _: &nofy_tool_runtime::ListToolsContext,
        ) -> nofy_tool_types::ToolDescription {
            nofy_tool_types::ToolDescription::new("effect", "effect")
        }
        async fn run(&self, _: ToolCallContext, _: Value) -> Result<Value, ToolError> {
            Ok(serde_json::json!({"actual":self.0.fetch_add(1,Ordering::SeqCst)+1}))
        }
    }
    struct Control;
    #[async_trait::async_trait]
    impl ReconciliationControl for Control {
        async fn reject(&self, _: &str) -> Result<(), Error> {
            panic!("cached result must not use the operator proposal")
        }
    }
    #[tokio::test]
    async fn operator_receipt_cannot_replace_a_previously_cached_tool_success() {
        let ledger = Arc::new(InMemoryBudgetStore::default());
        let profile = Arc::new(
            GovernanceProfile::new(
                Arc::new(
                    InstalledBudget::install(
                        ledger.clone(),
                        BudgetLimits {
                            max_tool_calls: Some(1),
                            ..Default::default()
                        },
                        "cache-wins@1",
                        1,
                    )
                    .unwrap(),
                ),
                BudgetLimits::default(),
                ModelRetryPolicy::default(),
            )
            .unwrap(),
        );
        let mut run = RunContext::new("thread", "run");
        let _guard = runtime::prepare(&[profile.clone()], &mut run, false)
            .await
            .unwrap();
        let calls = Arc::new(AtomicUsize::new(0));
        let entry = crate::ToolEntry::typed(Effect(calls.clone()));
        let call = ToolCall {
            id: "call".into(),
            name: "effect".into(),
            arguments: serde_json::json!({}),
        };
        let original = dispatch_tool(
            entry.dispatch.as_ref(),
            &call,
            crate::tools::call_context("call", &run).unwrap(),
            "operation",
            "revision",
            false,
            |_| async { Ok(()) },
        )
        .await
        .unwrap()
        .unwrap();
        let mut context = crate::tools::call_context("call", &run).unwrap();
        context.insert(ToolReconciliation(ReconciliationInput {
            thread_id: "thread".into(),
            run_id: "run".into(),
            model_sequence: 0,
            call: call.clone(),
            result: serde_json::json!({"forged":"replacement"}),
            is_error: false,
            control: Arc::new(Control),
        }));
        let replay = dispatch_tool(
            entry.dispatch.as_ref(),
            &call,
            context,
            "operation",
            "revision",
            true,
            |_| async { Ok(()) },
        )
        .await
        .unwrap()
        .unwrap();
        assert_eq!(original.value, replay.value);
        assert_eq!(replay.value, serde_json::json!({"actual":1}));
        assert_eq!(calls.load(Ordering::SeqCst), 1);
        let summary = ledger
            .inspect(&BudgetScope {
                root_run_id: "run".into(),
                identity: profile.identity().into(),
            })
            .await
            .unwrap()
            .unwrap();
        assert_eq!(summary.used.tool_calls, 1);
        assert_eq!(summary.active_operations, 0);
    }
}
