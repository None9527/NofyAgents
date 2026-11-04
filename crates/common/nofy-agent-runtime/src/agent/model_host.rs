use super::*;

impl AgentHost<'_> {
    pub(super) async fn model_step(&mut self) -> Result<Step<RunOutcome>, Error> {
        if self.state.pending_model.is_none() {
            if let Some(control) = self
                .run_recipe(crate::recipe::Boundary::BeforeModel, None)
                .await?
            {
                return Ok(control);
            }
            self.flush_recipe_feedback().await?;
        }
        let persistent_model = crate::model_journal::enabled(&self.context)
            || self
                .context
                .capabilities
                .get::<crate::governance::BudgetControl>()
                .is_some();
        let pending = if let Some(pending) = self.state.pending_model.clone() {
            if self.context_revisions().await? != pending.context_revisions {
                return Err(Error::GovernancePaused(
                    json!({"kind":"model_context_changed","operation_id":pending.operation_id}),
                ));
            }
            pending
        } else {
            let request = match self.model_hook_request().await? {
                Ok(request) => request,
                Err(control) => return Ok(control),
            };
            self.state.steps += 1;
            self.state.model_sequence = self
                .state
                .model_sequence
                .checked_add(1)
                .ok_or_else(|| Error::Checkpoint("model sequence exhausted".into()))?;
            let pending = crate::model::PendingModel {
                operation_id: serde_json::to_string(&(
                    "model",
                    &self.context.thread_id,
                    &self.context.run_id,
                    self.state.model_sequence,
                ))
                .map_err(|e| Error::Checkpoint(e.to_string()))?,
                request,
                context_revisions: self.context_revisions().await?,
            };
            if persistent_model {
                self.state.pending_model = Some(pending.clone());
            }
            self.state.hook_progress.prepared_sources = None;
            self.commit().await?;
            pending
        };
        self.emit(RunEvent::ModelStarted {
            step: self.state.steps,
        })
        .await?;
        let result = crate::governance::sample_model(
            self.agent.sampled_model()?,
            pending.request,
            &self.context,
            &pending.operation_id,
            true,
            |delta| self.emit(RunEvent::ModelDelta { delta }),
        )
        .await;
        // A known cancellation is settled by the shared boundary. Explicitly
        // continuing starts another logical request; an abruptly lost worker
        // retains its pending identity and must reconcile the claimed intent.
        if matches!(result, Err(Error::Cancelled)) && persistent_model {
            self.state.pending_model = None;
            self.state.hook_progress.prepared_model = None;
            self.commit().await?;
        }
        let response = result?;

        let mut ids = std::collections::HashSet::new();
        if response
            .tool_calls
            .iter()
            .any(|call| call.id.is_empty() || !ids.insert(&call.id))
        {
            return Err(Error::Model("empty or duplicate tool call id".into()));
        }
        self.state.input_tokens = self
            .state
            .input_tokens
            .saturating_add(response.input_tokens);
        self.state.output_tokens = self
            .state
            .output_tokens
            .saturating_add(response.output_tokens);
        if response.messages.is_empty() {
            self.state.messages.push(Message::Assistant {
                content: response.output.clone(),
                tool_calls: response.tool_calls.clone(),
            });
        } else {
            self.state.messages.extend(response.messages);
        }
        self.state.pending_tools = response.tool_calls.into();
        self.state.complete = self.state.pending_tools.is_empty();
        self.state.output = response.output.clone();
        self.state.completion_info = response.info.clone();
        self.state.hook_progress.prepared_model = None;
        self.state.pending_model = None;
        self.queue_hook("after_model",self.hook_operation(&format!("model-result:{}",self.state.steps)),json!({"output":self.state.output,"info":self.state.completion_info,"tool_calls":self.state.pending_tools}));
        self.queue_recipe(crate::recipe::Boundary::AfterModel, None, None)?;
        self.commit().await?;
        self.emit(RunEvent::ModelUsage {
            input_tokens: response.input_tokens,
            output_tokens: response.output_tokens,
            info: response.info,
        })
        .await?;
        self.emit(RunEvent::ModelCompleted {
            output: response.output,
        })
        .await?;
        Ok(Step::Continue)
    }
}
