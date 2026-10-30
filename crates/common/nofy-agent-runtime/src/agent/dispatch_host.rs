use super::*;

impl AgentHost<'_> {
    pub(super) async fn commit(&mut self) -> Result<(), Error> {
        if let Some(store) = &self.agent.checkpoint {
            let next = self
                .revision
                .unwrap_or(0)
                .checked_add(1)
                .ok_or_else(|| Error::Checkpoint("checkpoint revision exhausted".into()))?;
            store
                .save(
                    &self.key,
                    self.revision,
                    Checkpoint {
                        version: 1,
                        revision: next,
                        composition: self.agent.composition.clone(),
                        state: self.state.clone(),
                    },
                )
                .await?;
            self.revision = Some(next);
        }
        Ok(())
    }
    pub(super) async fn emit(&self, event: RunEvent) -> Result<(), Error> {
        publish_event(self.agent, &self.context, self.events.as_ref(), event).await
    }
    pub(super) async fn tool(
        &mut self,
        mut call: ToolCall,
        resume: bool,
    ) -> Result<Step<RunOutcome>, Error> {
        let original_id = call.id.clone();
        if let Some(control) = self.prepare_hook_tool(&mut call, resume).await? {
            return Ok(control);
        }
        if !resume && self.agent.hooks.is_none() {
            for middleware in &self.agent.middleware {
                crate::governance::await_resource(
                    &self.context,
                    middleware.before_tool(&mut call, &self.context),
                )
                .await?;
            }
        }
        if call.id != original_id {
            return Err(Error::Tool("middleware changed tool call identity".into()));
        }
        let entry = self.tools.get(&call.name);
        let invalid = match entry {
            None => Some(format!("unregistered tool: {}", call.name)),
            Some(entry) => {
                jsonschema::validate(&entry.definition.function.parameters, &call.arguments)
                    .err()
                    .map(|e| format!("invalid tool arguments: {e}"))
            }
        };
        if let Some(reason) = invalid {
            self.reject_hook_tool(&call, reason, "validation").await?;
            return Ok(Step::Continue);
        }
        let dispatch = entry.expect("validated catalog entry").dispatch.clone();
        if let Some(control) = self
            .run_recipe(crate::recipe::Boundary::BeforeTool, Some(call.clone()))
            .await?
        {
            return Ok(control);
        }
        let resumable = dispatch.is_resumable();
        let floor = self
            .context
            .capabilities
            .get::<crate::policy::PolicyFloor>();
        let mut policies: Vec<Arc<dyn Policy>> = floor
            .as_ref()
            .map(|floor| floor.0.iter().map(|(_, policy)| policy.clone()).collect())
            .unwrap_or_default();
        policies.extend(self.agent.policies.iter().cloned());
        for policy in policies {
            let admission = crate::governance::await_resource(
                &self.context,
                policy.admit(&call, &self.state, &self.context),
            )
            .await?;
            if self.context.cancel.is_cancelled() {
                return Ok(Step::Complete(RunOutcome::Cancelled {
                    state: self.state.clone(),
                }));
            }
            match admission {
                Admission::Allow => {}
                Admission::Deny(reason) => {
                    self.reject_hook_tool(&call, reason, "policy").await?;
                    return Ok(Step::Continue);
                }
                Admission::Pause(reason) => {
                    if self.agent.hooks.is_some() {
                        self.queue_hook(
                            "permission_requested",
                            self.hook_operation(&format!("permission:{}", call.id)),
                            json!({"call":call,"reason":reason}),
                        );
                        self.commit().await?;
                    }
                    return Ok(Step::Complete(RunOutcome::Paused {
                        reason,
                        state: self.state.clone(),
                    }));
                }
            }
        }
        self.state.in_flight = Some(call.clone());
        self.commit().await?;
        self.emit(if resume {
            RunEvent::ToolResumed { call: call.clone() }
        } else {
            RunEvent::ToolStarted { call: call.clone() }
        })
        .await?;
        let mut ctx = crate::tools::call_context(&call.id, &self.context)?;
        if resume
            && let Some(receipt) = self
                .context
                .capabilities
                .get::<crate::reconciliation::ReconciliationInput>()
            && receipt.matches(&self.context, &self.state, &call)
        {
            if resumable {
                receipt
                    .control
                    .reject("reconcile the primitive effect inside this resumable controller")
                    .await?;
                return Err(Error::GovernancePaused(
                    json!({"kind":"reconciliation_requires_primitive","call":call}),
                ));
            }
            ctx.insert(crate::reconciliation::ToolReconciliation(
                (*receipt).clone(),
            ));
        }
        if let Some(command) = &self.state.input_progress.command
            && command.call.id == call.id
        {
            ctx.insert(crate::mailbox::UserToolInvocation::issue(command)?);
        }
        ctx.insert(crate::context::ToolInvocationState(Arc::new(
            self.state.clone(),
        )));
        ctx.insert(nofy_tool_runtime::ResumeInvocation(resume && resumable));
        let control = crate::composition::ChildControl::default();
        ctx.insert(control.clone());
        if let Some(store) = self.agent.checkpoint_store() {
            ctx.insert(crate::composition::ParentCheckpointer(store));
        }
        let completed_call = call.clone();
        let operation = crate::tools::operation_key(&self.state, &self.context, &call)?;
        let result = crate::governance::dispatch_tool(
            dispatch.as_ref(),
            &call,
            ctx,
            &operation,
            &self.state.tool_revision,
            resume,
            |progress| {
                self.emit(RunEvent::ToolProgress {
                    call_id: call.id.clone(),
                    progress,
                })
            },
        )
        .await?;
        let child = control
            .0
            .lock()
            .map_err(|_| Error::Composition("child control poisoned".into()))?
            .take();
        if let Some(child) = child {
            use crate::composition::ChildOutcome;
            return match child {
                ChildOutcome::Paused(reason) => Ok(Step::Complete(RunOutcome::Paused {
                    reason,
                    state: self.state.clone(),
                })),
                ChildOutcome::Cancelled => Ok(Step::Complete(RunOutcome::Cancelled {
                    state: self.state.clone(),
                })),
                ChildOutcome::BudgetExceeded => Ok(Step::Complete(RunOutcome::BudgetExceeded {
                    state: self.state.clone(),
                })),
                ChildOutcome::Failed(error) => {
                    Err(Error::Composition(format!("child failed: {error}")))
                }
                ChildOutcome::Checkpoint(error) => Err(Error::Checkpoint(error)),
            };
        }
        if resumable && let Err(error) = &result {
            return Err(Error::Tool(format!("resumable dispatcher failed: {error}")));
        }
        let (content, is_error) = match result {
            Ok(output) => (
                serde_json::to_value(output).map_err(|e| Error::Tool(e.to_string()))?,
                false,
            ),
            Err(error) => (json!({"error":error.to_string()}), true),
        };
        self.state.messages.push(Message::Tool {
            call_id: call.id.clone(),
            content: content.clone(),
            is_error,
        });
        self.state.pending_tools.pop_front();
        self.state.in_flight = None;
        self.state.hook_progress.prepared_tool = None;
        self.queue_hook(
            if is_error {
                "tool_failure"
            } else {
                "after_tool"
            },
            self.hook_operation(&format!("result:{}", call.id)),
            json!({"call":completed_call,"call_id":call.id,"result":content,"is_error":is_error}),
        );
        self.queue_recipe(
            crate::recipe::Boundary::AfterTool,
            Some(completed_call.clone()),
            Some(self.state.messages.len() - 1),
        )?;
        crate::mailbox::finish_user_command(&mut self.state, &call.id, is_error)?;
        self.commit().await?;
        self.emit(RunEvent::ToolCompleted {
            call_id: call.id,
            result: content,
            is_error,
        })
        .await?;
        Ok(Step::Continue)
    }
}
