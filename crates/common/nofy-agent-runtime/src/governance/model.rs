use super::*;
use crate::{
    Model, ModelChunk, ModelDelta, ModelRequest, ModelResponse, RunContext, model::ModelFailure,
};
use futures::StreamExt;
use serde_json::json;
use std::{
    future::Future,
    time::{SystemTime, UNIX_EPOCH},
};
mod evidence;
mod unmetered;

#[derive(Clone)]
struct OperationScope(String);
pub fn operation_context(context: &RunContext, operation: impl Into<String>) -> RunContext {
    let mut context = context.clone();
    context
        .capabilities
        .insert(OperationScope(operation.into()));
    context
}
pub fn operation_scope(context: &RunContext) -> Option<String> {
    context
        .capabilities
        .get::<OperationScope>()
        .map(|scope| scope.0.clone())
}
fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
        .min(u128::from(u64::MAX)) as u64
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(tag = "outcome", rename_all = "snake_case")]
pub(super) enum CachedModel {
    Completed {
        response: ModelResponse,
    },
    Failed {
        failure: ModelFailure,
        retry_at_ms: u64,
        #[serde(default)]
        accounting: String,
    },
    Stopped {
        reason: String,
        #[serde(default)]
        accounting: String,
    },
}
async fn collect<F, Fut>(
    model: &dyn Model,
    request: ModelRequest,
    context: &RunContext,
    emit: &mut F,
) -> Result<ModelResponse, Error>
where
    F: FnMut(ModelDelta) -> Fut,
    Fut: Future<Output = Result<(), Error>>,
{
    let mut stream = tokio::select! { biased;
        _ = context.cancel.cancelled() => return Err(runtime::cancellation(context)),
        result = model.stream(request,context) => result?,
    };
    let mut response = None;
    loop {
        let next = tokio::select! { biased;
            _ = context.cancel.cancelled() => return Err(runtime::cancellation(context)),
            result = stream.next() => result,
        };
        let Some(chunk) = next else {
            break;
        };
        match chunk? {
            ModelChunk::Delta(delta) if response.is_none() => {
                tokio::select! { biased;
                    _ = context.cancel.cancelled() => return Err(runtime::cancellation(context)),
                    result = emit(delta) => result?,
                }
            }
            ModelChunk::Completed(value) if response.is_none() => response = Some(value),
            _ => {
                return Err(Error::Model(
                    "model yielded content after completion".into(),
                ));
            }
        }
    }
    response.ok_or_else(|| Error::Model("model stream ended without completion".into()))
}
/// The shared model operation boundary, also used by compaction. Without an
/// installed governance profile it retains the existing streaming protocol.
pub async fn sample_model<F, Fut>(
    model: &dyn Model,
    request: ModelRequest,
    context: &RunContext,
    operation_id: &str,
    charge_step: bool,
    mut emit: F,
) -> Result<ModelResponse, Error>
where
    F: FnMut(ModelDelta) -> Fut,
    Fut: Future<Output = Result<(), Error>>,
{
    let Some(control) = context.capabilities.get::<BudgetControl>() else {
        if crate::model_journal::enabled(context) {
            return unmetered::sample(model, request, context, operation_id, &mut emit).await;
        }
        return collect(model, request, context, &mut emit).await;
    };
    let bound =
        crate::governance::await_resource(context, model.request_bound(&request, context)).await?;
    if bound.max_calls == 0 {
        return Err(Error::Composition(
            "model request bound must include at least one call".into(),
        ));
    }
    let unbounded_tokens = bound.max_input_tokens.is_none() || bound.max_output_tokens.is_none();
    if unbounded_tokens
        && control.entries.iter().any(|entry| {
            entry.spec.limits.max_input_tokens.is_some()
                || entry.spec.limits.max_output_tokens.is_some()
                || entry.spec.limits.max_total_tokens.is_some()
        })
    {
        return Err(Error::Composition(
            "hard token budgets require an installed model request bound".into(),
        ));
    }
    let fingerprint = recovery::fingerprint(&request)?;
    let recovery = context.capabilities.get::<ModelRecovery>();
    let generation = match &recovery {
        Some(journal) => {
            journal
                .generation(context, operation_id, &fingerprint)
                .await?
        }
        None => 0,
    };
    let mut actual_input = 0u64;
    let mut actual_output = 0u64;
    for attempt in 0..control.retry.max_attempts {
        // Keep generation zero wire-compatible with existing budget receipts.
        let operation = if generation == 0 {
            serde_json::to_string(&(operation_id, attempt))
        } else {
            serde_json::to_string(&(operation_id, attempt, generation))
        }
        .map_err(|e| Error::Composition(e.to_string()))?;
        let reserved = BudgetCost {
            steps: u64::from(charge_step && attempt == 0),
            model_calls: bound.max_calls,
            input_tokens: bound.max_input_tokens.unwrap_or(0),
            output_tokens: bound.max_output_tokens.unwrap_or(0),
            ..Default::default()
        };
        let evidence = evidence::AttemptEvidence::new(
            recovery.clone(),
            context,
            operation_id,
            &fingerprint,
            generation,
            attempt,
            reserved,
            unbounded_tokens,
        )
        .await?;
        let admission = runtime::reserve(
            context,
            &operation,
            &fingerprint,
            reserved,
            BudgetActivity::Operation,
            unbounded_tokens,
            evidence.result.is_some(),
        )
        .await;
        let admission = match admission {
            Err(Error::GovernancePaused(reason)) if reason["kind"] == "budget_uncertain" => {
                evidence.note().await?;
                return Err(Error::GovernancePaused(reason));
            }
            other => other?,
        };
        let cached = match admission {
            runtime::GroupAdmission::Replay(receipt) => {
                evidence.finish().await?;
                serde_json::from_value(receipt.value)
                    .map_err(|e| Error::Checkpoint(format!("invalid model budget receipt: {e}")))?
            }
            runtime::GroupAdmission::Ready(held) => {
                evidence.note().await?;
                let result = match &evidence.result {
                    Some(ModelReconciliationResult::Completed { response }) => Ok(response.clone()),
                    Some(ModelReconciliationResult::Failed { failure }) => {
                        Err(Error::ModelFailure(failure.clone()))
                    }
                    None => collect(model, request.clone(), context, &mut emit).await,
                };
                let (outcome, used) = match result {
                    Ok(response) => {
                        let mut used = BudgetCost {
                            steps: reserved.steps,
                            model_calls: model
                                .calls_used(&response)
                                .unwrap_or(bound.max_calls)
                                .max(1),
                            input_tokens: response.input_tokens,
                            output_tokens: response.output_tokens,
                            ..Default::default()
                        };
                        if evidence.result.is_some() {
                            used = evidence.conservative_usage(used);
                        }
                        (CachedModel::Completed { response }, used)
                    }
                    Err(Error::Cancelled) => (
                        CachedModel::Stopped {
                            reason: "cancelled".into(),
                            accounting: "reserved_upper_bound".into(),
                        },
                        reserved,
                    ),
                    Err(Error::BudgetExceeded) => (
                        CachedModel::Stopped {
                            reason: "budget_exceeded".into(),
                            accounting: "reserved_upper_bound".into(),
                        },
                        reserved,
                    ),
                    Err(Error::Checkpoint(message)) => return Err(Error::Checkpoint(message)),
                    Err(Error::GovernancePaused(reason)) => {
                        return Err(Error::GovernancePaused(reason));
                    }
                    Err(error) => {
                        let failure = match error {
                            Error::ModelFailure(failure) => failure,
                            error => ModelFailure {
                                category: "adapter".into(),
                                message: error.to_string(),
                                status: None,
                                retryable: false,
                                retry_after_ms: None,
                                code: None,
                                details: Value::Null,
                            },
                        };
                        let backoff = control
                            .retry
                            .base_delay_ms
                            .saturating_mul(1u64.checked_shl(attempt.min(32)).unwrap_or(u64::MAX));
                        let delay = failure
                            .retry_after_ms
                            .unwrap_or(backoff)
                            .min(control.retry.max_delay_ms);
                        (
                            CachedModel::Failed {
                                failure,
                                retry_at_ms: now_ms().saturating_add(delay),
                                accounting: "reserved_upper_bound".into(),
                            },
                            reserved,
                        )
                    }
                };
                let value =
                    serde_json::to_value(&outcome).map_err(|e| Error::Checkpoint(e.to_string()))?;
                let settled = runtime::settle(&held, BudgetReceipt { used, value }).await;
                if settled.is_ok() || matches!(&settled, Err(Error::BudgetExceeded)) {
                    evidence.finish().await?;
                }
                settled?;
                outcome
            }
        };
        match cached {
            CachedModel::Completed { mut response } => {
                if let Some(journal) = &recovery {
                    journal
                        .completed(context, operation_id, &fingerprint, generation)
                        .await?;
                }
                actual_input = actual_input.saturating_add(response.input_tokens);
                actual_output = actual_output.saturating_add(response.output_tokens);
                response.input_tokens = actual_input;
                response.output_tokens = actual_output;
                if response.info.provider.is_null() {
                    response.info.provider = json!({});
                }
                if let Some(provider) = response.info.provider.as_object_mut() {
                    provider.insert(
                        "governance".into(),
                        json!({"attempts":attempt+1,"operation_id":operation_id,"user_retry_generation":generation}),
                    );
                }
                return Ok(response);
            }
            CachedModel::Stopped { reason, .. } if reason == "budget_exceeded" => {
                return Err(Error::BudgetExceeded);
            }
            CachedModel::Stopped { .. } => {
                if let Some(journal) = &recovery {
                    journal
                        .cancelled(context, operation_id, &fingerprint, generation)
                        .await?;
                }
                return Err(Error::Cancelled);
            }
            CachedModel::Failed {
                failure,
                retry_at_ms,
                ..
            } => {
                if !failure.retryable || attempt + 1 >= control.retry.max_attempts {
                    if let Some(journal) = &recovery {
                        journal
                            .failed(context, operation_id, &fingerprint, generation)
                            .await?;
                    }
                    return Err(Error::ModelFailure(failure));
                }
                let delay = retry_at_ms
                    .saturating_sub(now_ms())
                    .min(control.retry.max_delay_ms);
                tokio::select! { biased;
                    _ = context.cancel.cancelled() => return Err(runtime::cancellation(context)),
                    result = emit(ModelDelta::Status { name: "governance_retry".into(), data: json!({"attempt":attempt+2,"maximum":control.retry.max_attempts,"delay_ms":delay}) }) => result?,
                }
                tokio::select! { biased;
                    _ = context.cancel.cancelled() => return Err(runtime::cancellation(context)),
                    _ = tokio::time::sleep(std::time::Duration::from_millis(delay)) => {},
                }
            }
        }
    }
    Err(Error::BudgetExceeded)
}
