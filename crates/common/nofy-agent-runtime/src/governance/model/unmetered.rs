use super::*;
use crate::governance::{ModelReconciliationTarget, recovery::UnmeteredAdmission};
#[cfg(test)]
mod tests;

pub(super) async fn sample<F, Fut>(
    model: &dyn Model,
    request: ModelRequest,
    context: &RunContext,
    operation: &str,
    emit: &mut F,
) -> Result<ModelResponse, Error>
where
    F: FnMut(ModelDelta) -> Fut,
    Fut: Future<Output = Result<(), Error>>,
{
    let journal = context
        .capabilities
        .get::<ModelRecovery>()
        .ok_or_else(|| Error::Composition("model journal requires a checkpointer".into()))?;
    let fingerprint = recovery::fingerprint(&request)?;
    let generation = journal.generation(context, operation, &fingerprint).await?;
    let ticket = journal.evidence_ticket(context, operation, &fingerprint, generation, 0)?;
    let target = ModelReconciliationTarget {
        ticket: ticket.clone(),
        reserved: BudgetCost::default(),
        unbounded_tokens: true,
        evidence_accepted: false,
        unmetered: true,
    };
    let admission = journal.start_unmetered(target.clone()).await?;
    let cached = match admission {
        UnmeteredAdmission::Replay(result) => result,
        admission => {
            journal.note_model_attempt(target.clone()).await?;
            let evidence = journal.model_evidence(&ticket).await?;
            let result = match evidence {
                Some(ModelReconciliationResult::Completed { response }) => Ok(response),
                Some(ModelReconciliationResult::Failed { failure }) => {
                    Err(Error::ModelFailure(failure))
                }
                None if matches!(admission, UnmeteredAdmission::Uncertain) => {
                    return Err(Error::GovernancePaused(
                        json!({"kind":"model_uncertain","ticket":ticket,"unmetered":true}),
                    ));
                }
                None => collect(model, request, context, emit).await,
            };
            let outcome = match result {
                Ok(response) => CachedModel::Completed { response },
                Err(Error::Cancelled) => CachedModel::Stopped {
                    reason: "cancelled".into(),
                    accounting: "unmetered".into(),
                },
                Err(Error::BudgetExceeded) => CachedModel::Stopped {
                    reason: "budget_exceeded".into(),
                    accounting: "unmetered".into(),
                },
                Err(error @ (Error::Checkpoint(_) | Error::GovernancePaused(_))) => {
                    return Err(error);
                }
                Err(error) => {
                    let failure = match error {
                        Error::ModelFailure(failure) => failure,
                        other => ModelFailure {
                            category: "adapter".into(),
                            message: other.to_string(),
                            status: None,
                            retryable: false,
                            retry_after_ms: None,
                            code: None,
                            details: Value::Null,
                        },
                    };
                    CachedModel::Failed {
                        failure,
                        retry_at_ms: 0,
                        accounting: "unmetered".into(),
                    }
                }
            };
            journal.settle_unmetered(&target, outcome).await?
        }
    };
    journal.finish_model_attempt(&ticket).await?;
    match cached {
        CachedModel::Completed { response } => {
            journal
                .completed(context, operation, &fingerprint, generation)
                .await?;
            Ok(response)
        }
        CachedModel::Failed { failure, .. } => {
            journal
                .failed(context, operation, &fingerprint, generation)
                .await?;
            Err(Error::ModelFailure(failure))
        }
        CachedModel::Stopped { reason, .. } if reason == "budget_exceeded" => {
            Err(Error::BudgetExceeded)
        }
        CachedModel::Stopped { .. } => {
            journal
                .cancelled(context, operation, &fingerprint, generation)
                .await?;
            Err(Error::Cancelled)
        }
    }
}
