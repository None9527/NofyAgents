use super::*;

impl Agent {
    pub fn with_governance(mut self, profile: Arc<crate::governance::GovernanceProfile>) -> Self {
        self.composition =
            serde_json::to_string(&(&self.composition, "governance", profile.identity()))
                .expect("profile identity serializes");
        self.governance.push(profile);
        self
    }
    pub(super) async fn governance_outcome(
        &self,
        result: &mut Result<RunOutcome, Error>,
        context: &RunContext,
    ) {
        if let Ok(RunOutcome::Cancelled { state }) = result {
            if matches!(
                crate::governance::cancellation_error(context),
                Error::BudgetExceeded
            ) {
                *result = Ok(RunOutcome::BudgetExceeded {
                    state: state.clone(),
                });
            }
            return;
        }
        let reason = match result {
            Err(Error::Cancelled) => None,
            Err(Error::BudgetExceeded) => None,
            Err(Error::GovernancePaused(reason)) => Some(reason.clone()),
            _ => return,
        };
        let state = if let Some(store) = &self.checkpoint {
            match store.load(&self.checkpoint_key(&context.thread_id)).await {
                Ok(Some(checkpoint))
                    if checkpoint.composition == self.composition
                        && checkpoint
                            .state
                            .execution_run_id
                            .as_ref()
                            .is_some_and(|id| id == &context.run_id) =>
                {
                    checkpoint.state
                }
                Ok(_) => RunState::default(),
                Err(_) => return,
            }
        } else {
            RunState::default()
        };
        *result = Ok(if let Some(reason) = reason {
            RunOutcome::Paused { reason, state }
        } else if matches!(result, Err(Error::BudgetExceeded))
            || matches!(
                crate::governance::cancellation_error(context),
                Error::BudgetExceeded
            )
        {
            RunOutcome::BudgetExceeded { state }
        } else {
            RunOutcome::Cancelled { state }
        });
    }
}
