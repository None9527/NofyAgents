use super::*;
use crate::governance::{ModelReconciliationResult, ModelReconciliationTarget, ModelRecovery};
use std::sync::Arc;
#[cfg(test)]
mod tests;

pub(super) struct AttemptEvidence {
    journal: Option<Arc<ModelRecovery>>,
    target: Option<ModelReconciliationTarget>,
    pub result: Option<ModelReconciliationResult>,
    reserved: BudgetCost,
}
impl AttemptEvidence {
    pub async fn new(
        journal: Option<Arc<ModelRecovery>>,
        context: &RunContext,
        operation: &str,
        fingerprint: &str,
        generation: u32,
        attempt: u32,
        reserved: BudgetCost,
        unbounded_tokens: bool,
    ) -> Result<Self, Error> {
        let target = journal
            .as_ref()
            .map(|j| j.evidence_ticket(context, operation, fingerprint, generation, attempt))
            .transpose()?
            .map(|ticket| ModelReconciliationTarget {
                ticket,
                reserved,
                unbounded_tokens,
                evidence_accepted: false,
                unmetered: false,
            });
        let result = match (&journal, &target) {
            (Some(journal), Some(target)) => journal.model_evidence(&target.ticket).await?,
            _ => None,
        };
        Ok(Self {
            journal,
            target,
            result,
            reserved,
        })
    }
    pub async fn note(&self) -> Result<(), Error> {
        if let (Some(journal), Some(target)) = (&self.journal, &self.target) {
            journal.note_model_attempt(target.clone()).await?;
        }
        Ok(())
    }
    pub async fn finish(&self) -> Result<(), Error> {
        if let (Some(journal), Some(target)) = (&self.journal, &self.target) {
            journal.finish_model_attempt(&target.ticket).await?;
        }
        Ok(())
    }
    pub fn conservative_usage(&self, reported: BudgetCost) -> BudgetCost {
        BudgetCost {
            steps: self.reserved.steps,
            model_calls: self.reserved.model_calls.max(reported.model_calls),
            input_tokens: self.reserved.input_tokens.max(reported.input_tokens),
            output_tokens: self.reserved.output_tokens.max(reported.output_tokens),
            ..Default::default()
        }
    }
}
