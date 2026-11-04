use super::*;

impl Agent {
    #[cfg(feature = "sqlite")]
    pub(crate) fn governance_profiles(&self) -> &[Arc<crate::governance::GovernanceProfile>] {
        &self.governance
    }
    #[cfg(feature = "sqlite")]
    pub(crate) fn with_live_budgets(
        mut self,
        target: &Agent,
        bindings: &[crate::governance::BudgetLedgerBinding],
    ) -> Result<Self, Error> {
        let mut profiles =
            std::collections::BTreeMap::<String, crate::governance::BudgetLedgerBinding>::new();
        for binding in bindings {
            if let Some(old) = profiles.get_mut(&binding.profile_identity) {
                if old.ledger_identity != binding.ledger_identity
                    || old.resource_identity != binding.resource_identity
                {
                    return Err(Error::Composition(
                        "live budgets would merge distinct ledgers".into(),
                    ));
                }
                old.profile_aliases
                    .extend(binding.profile_aliases.iter().cloned());
            } else {
                profiles.insert(binding.profile_identity.clone(), binding.clone());
            }
        }
        self.governance = target
            .governance
            .iter()
            .map(|profile| {
                let binding = profiles.get(profile.identity()).ok_or_else(|| {
                    Error::Composition("live budget profile is missing its ledger binding".into())
                })?;
                profile.with_ledger_binding(binding).map(Arc::new)
            })
            .collect::<Result<_, _>>()?;
        Ok(self)
    }
    pub fn with_governance(mut self, profile: Arc<crate::governance::GovernanceProfile>) -> Self {
        self.composition = crate::identity::extend(
            self.spec.settings.scope_identity,
            serde_json::to_string(&(&self.composition, "governance", profile.identity()))
                .expect("profile identity serializes"),
        );
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
