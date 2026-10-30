use super::*;

impl RunHost for AgentHost<'_> {
    type Output = RunOutcome;
    type Error = Error;

    async fn advance(&mut self) -> Result<Step<RunOutcome>, Error> {
        if self.context.cancel.is_cancelled() {
            return Ok(Step::Complete(RunOutcome::Cancelled {
                state: self.state.clone(),
            }));
        }
        if self.agent.event_program.is_some() {
            return self.advance_event().await;
        }
        if self.state.recipe_progress.halted.is_some() {
            return Err(Error::BudgetExceeded);
        }
        if let Some(control) = self.drain_recipe().await? {
            return Ok(control);
        }
        if let Some(control) = self.drain_hook_facts().await? {
            return Ok(control);
        }
        if let Some(control) = self.prepare_hook_input().await? {
            return Ok(control);
        }
        if let Some(call) = self.state.in_flight.clone() {
            if self
                .context
                .capabilities
                .get::<crate::governance::BudgetControl>()
                .is_some()
                || self
                    .context
                    .capabilities
                    .get::<crate::reconciliation::ReconciliationInput>()
                    .is_some_and(|receipt| receipt.matches(&self.context, &self.state, &call))
                || self
                    .tools
                    .get(&call.name)
                    .is_some_and(|entry| entry.dispatch.is_resumable())
            {
                return self.tool(call, true).await;
            }
            return Ok(Step::Complete(RunOutcome::Paused {
                reason: json!({"kind":"uncertain_tool","call":self.state.in_flight}),
                state: self.state.clone(),
            }));
        }
        if let Some(call) = self.state.pending_tools.front().cloned() {
            return self.tool(call, false).await;
        }
        if let Some(control) = self.drain_inputs().await? {
            return Ok(control);
        }
        if self.agent.model.is_none() && !self.state.complete {
            self.finish_direct_tool().await?;
        }
        if self.state.complete {
            if let Some(control) = self
                .run_recipe(crate::recipe::Boundary::BeforeStop, None)
                .await?
            {
                return Ok(control);
            }
            if !self.state.complete {
                return Ok(Step::Continue);
            }
            if let Some(control) = self.before_hook_stop().await? {
                return Ok(control);
            }
            return Ok(Step::Complete(RunOutcome::Completed {
                output: self.state.output.clone(),
                state: self.state.clone(),
            }));
        }
        if self.state.pending_model.is_none()
            && self.state.steps >= self.agent.spec.settings.max_steps
        {
            return Ok(Step::Complete(RunOutcome::BudgetExceeded {
                state: self.state.clone(),
            }));
        }
        self.model_step().await
    }
}
