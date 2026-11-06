use super::*;

impl Agent {
    pub(super) async fn run_inner(
        &self,
        input: RunInput,
        context: RunContext,
        events: Option<mpsc::Sender<RunEvent>>,
        driver_started: &mut bool,
    ) -> Result<RunOutcome, Error> {
        if (input.prompt.is_some() && input.content.is_some())
            || (input.resume && (input.prompt.is_some() || input.content.is_some()))
            || (input.retry_model.is_some() && (!input.resume || input.reconciled.is_some()))
            || (input.resume_cancel_through.is_some() && !input.resume)
        {
            return Err(Error::Composition(
                "choose either new text/content or resume".into(),
            ));
        }
        if self.event_program.is_some()
            && (input.prompt.is_some() || input.content.is_some() || input.reconciled.is_some())
        {
            return Err(Error::Composition(
                "event source input is frozen; root tool reconciliation is not applicable".into(),
            ));
        }
        let message = if let Some(content) = input.content {
            if content.is_empty() {
                return Err(Error::Composition("input content must not be empty".into()));
            }
            let has_images = content
                .iter()
                .any(|part| matches!(part, crate::InputPart::Image { .. }));
            if has_images && !self.model_capabilities().image_input {
                return Err(Error::Composition(
                    "model does not declare image input support".into(),
                ));
            }
            for part in &content {
                if let crate::InputPart::Image { url } = part
                    && !(url.starts_with("https://")
                        || url.starts_with("http://")
                        || url.starts_with("data:image/"))
                {
                    return Err(Error::Composition(
                        "image input must be an HTTP(S) URL or image data URI".into(),
                    ));
                }
            }
            Some(if has_images {
                Message::UserParts { content }
            } else {
                Message::User {
                    content: content
                        .into_iter()
                        .filter_map(|part| match part {
                            crate::InputPart::Text { text } => Some(text),
                            _ => None,
                        })
                        .collect::<Vec<_>>()
                        .join("\n"),
                }
            })
        } else {
            input.prompt.map(|content| Message::User { content })
        };
        let key = self.checkpoint_key(&context.thread_id);
        let existing = if let Some(store) = &self.checkpoint {
            store.load(&key).await?
        } else {
            None
        };
        let revision = existing.as_ref().map(|c| c.revision);
        let mut state = match existing {
            Some(c) => {
                if c.version != 1 || c.composition != self.composition {
                    return Err(Error::Checkpoint("composition/version mismatch".into()));
                }
                if input.resume
                    && c.state
                        .execution_run_id
                        .as_ref()
                        .is_some_and(|run| run != &context.run_id)
                {
                    return Err(Error::Checkpoint(
                        "governed recovery must retain the original run identity".into(),
                    ));
                }
                if input.resume
                    && self.hooks.is_some()
                    && c.state
                        .hook_progress
                        .run_id
                        .as_ref()
                        .is_some_and(|run| run != &context.run_id)
                {
                    return Err(Error::Checkpoint(
                        "hook recovery must retain the original run identity".into(),
                    ));
                }
                if !input.resume && c.state.has_pending_work() {
                    return Err(Error::Checkpoint(
                        "unfinished thread requires explicit resume".into(),
                    ));
                }
                // A newly admitted model-free job can reuse a finished program
                // thread. Only its private, root-bound initial receipt grants
                // this boundary; direct invoke/resume retains the old rules.
                if !input.resume
                    && (self.direct_tool.is_some() || self.event_program.is_some())
                    && c.state.complete
                    && c.state.execution_run_id.as_deref() != Some(context.run_id.as_str())
                    && context
                        .capabilities
                        .get::<crate::mailbox::InitialInputBinding>()
                        .is_some_and(|initial| {
                            initial.matches(&context)
                                && c.state.input_progress.initial.as_ref()
                                    != Some(&initial.0.proof())
                        })
                {
                    RunState::default()
                } else {
                    c.state
                }
            }
            None if input.resume => {
                return Err(Error::Checkpoint("no checkpoint to resume".into()));
            }
            None => RunState::default(),
        };
        if context.cancel.is_cancelled() {
            return Ok(RunOutcome::Cancelled { state });
        }
        if input.resume
            && let Some(initial) = context
                .capabilities
                .get::<crate::mailbox::InitialInputBinding>()
            && state.input_progress.initial.as_ref() != Some(&initial.0.proof())
        {
            return Err(Error::Checkpoint(
                "job initial input has not been committed; resume through the job worker".into(),
            ));
        }
        if input.resume
            && let Some(recovery) = context
                .capabilities
                .get::<crate::governance::ModelRecovery>()
        {
            // A command may have committed immediately before the worker lost
            // its main checkpoint. Ordinary recovery still uses its hook cursor.
            state.control_sequence = recovery
                .sequence()
                .await?
                .checked_add(crate::controllers::epoch(&context).await?)
                .ok_or_else(|| Error::Checkpoint("control sequence exhausted".into()))?;
        }
        let cancel_retry = if input.retry_model.is_none()
            && let Some(cursor) = input.resume_cancel_through
            && let Some(recovery) = context
                .capabilities
                .get::<crate::governance::ModelRecovery>()
            && let Some(ticket) = recovery.cancelled_ticket().await?
            && state
                .context_progress
                .pending
                .as_ref()
                .is_some_and(|pending| {
                    ticket.operation_scope.as_deref() == Some(pending.operation.as_str())
                }) {
            let binding = context
                .capabilities
                .get::<crate::mailbox::MailboxBinding>()
                .ok_or_else(|| {
                    Error::Composition("cancel cursor requires an installed mailbox".into())
                })?;
            binding
                .0
                .acknowledge_cancel(
                    &crate::mailbox::InputAddress::for_run(&self.spec.name, &context),
                    cursor,
                )
                .await?;
            Some(crate::governance::ModelRetryCommand {
                command_id: format!("cancel-resume:{cursor}"),
                ticket,
            })
        } else {
            None
        };
        if let Some(command) = input.retry_model.as_ref().or(cancel_retry.as_ref()) {
            if !crate::governance::is_governed(&context) && !crate::model_journal::enabled(&context)
            {
                return Err(Error::Checkpoint(
                    "model retry requires governance or an explicit model journal".into(),
                ));
            }
            let ticket = &command.ticket;
            let recovery = context
                .capabilities
                .get::<crate::governance::ModelRecovery>()
                .ok_or_else(|| Error::Checkpoint("model retry requires a checkpointer".into()))?;
            let matches_pending = state.pending_model.as_ref().is_some_and(|pending| {
                pending.operation_id == ticket.operation_id && ticket.operation_scope.is_none()
            }) || state.context_progress.pending.as_ref().is_some_and(
                |pending| ticket.operation_scope.as_deref() == Some(pending.operation.as_str()),
            ) || state
                .hook_progress
                .prepared_sources
                .as_ref()
                .and_then(|sources| sources.pending.as_ref())
                .is_some_and(|pending| {
                    ticket.operation_scope.as_deref() == Some(pending.scope.as_str())
                });
            let completed_replay = state.complete && recovery.accepted(command).await?;
            if (!matches_pending && !completed_replay)
                || state.in_flight.is_some()
                || !state.pending_tools.is_empty()
            {
                return Err(Error::Checkpoint(
                    "model retry does not match the pending model/context operation".into(),
                ));
            }
            state.control_sequence = recovery
                .authorize(command)
                .await?
                .checked_add(crate::controllers::epoch(&context).await?)
                .ok_or_else(|| Error::Checkpoint("control sequence exhausted".into()))?;
        }
        let mut tools = self.tools.clone();
        let mut revisions = Vec::new();
        for (id, source) in &self.tool_sources {
            let snapshot = tokio::select! {
                biased;
                _ = context.cancel.cancelled() => return Ok(RunOutcome::Cancelled {state}),
                result = source.snapshot(&context) => result?,
            };
            if snapshot.revision.is_empty() {
                return Err(Error::Composition(format!(
                    "tool source {id} has no revision"
                )));
            }
            revisions.push((
                id,
                snapshot.revision,
                snapshot.catalog.definitions(),
                snapshot.catalog.recovery_modes(),
            ));
            tools.extend(snapshot.catalog)?;
        }
        let tool_revision =
            serde_json::to_string(&revisions).map_err(|e| Error::Composition(e.to_string()))?;
        let catalog_changed =
            !state.tool_revision.is_empty() && state.tool_revision != tool_revision;
        if catalog_changed
            && (input.resume || !state.pending_tools.is_empty() || state.in_flight.is_some())
        {
            return Err(Error::Checkpoint(
                "tool source revision changed during unfinished run".into(),
            ));
        }
        state.tool_revision = tool_revision;
        if let Some((id, value, is_error)) = input.reconciled {
            if state.in_flight.as_ref().map(|c| c.id.as_str()) != Some(id.as_str()) {
                return Err(Error::Checkpoint(
                    "reconciliation does not match pending intent".into(),
                ));
            }
            let call = state
                .in_flight
                .as_ref()
                .expect("reconciliation identity checked");
            let dispatch = &tools
                .get(&call.name)
                .ok_or_else(|| Error::Checkpoint("reconciled tool is no longer installed".into()))?
                .dispatch;
            let operation = crate::tools::operation_key(&state, &context, call)?;
            let (value, is_error) = crate::governance::reconcile_tool(
                dispatch.as_ref(),
                call,
                &context,
                &operation,
                &state.tool_revision,
                &value,
                is_error,
            )
            .await?
            .unwrap_or((value, is_error));
            state.messages.push(Message::Tool {
                call_id: id.clone(),
                content: value,
                is_error,
            });
            state.in_flight = None;
            state.hook_progress.prepared_tool = None;
            state.pending_tools.pop_front();
            crate::mailbox::finish_user_command(&mut state, &id, is_error)?;
        }
        if let Some(message) = message {
            state.control_sequence = 0;
            state.input_progress = Default::default();
            if let Some(initial) = context
                .capabilities
                .get::<crate::mailbox::InitialInputBinding>()
            {
                state.input_progress.initial = Some(initial.0.proof());
                state.execution_run_id = Some(context.run_id.clone());
            }
            if crate::model_journal::enabled(&context)
                || self.recipe.is_some()
                || context
                    .capabilities
                    .get::<crate::governance::BudgetControl>()
                    .is_some()
            {
                state.execution_run_id = Some(context.run_id.clone());
            }
            if !state.pending_tools.is_empty() || state.in_flight.is_some() {
                return Err(Error::Checkpoint(
                    "finish pending tool results before adding input".into(),
                ));
            }
            if state.messages.is_empty() {
                let names = tools.names();
                let content = tokio::select! { biased;
                    _ = context.cancel.cancelled() => return Ok(RunOutcome::Cancelled { state }),
                    result = self.prompt.render(&context, &names) => result?,
                };
                state.messages.push(Message::System { content });
            }
            if catalog_changed && matches!(state.messages.first(), Some(Message::System { .. })) {
                let names = tools.names();
                let content = tokio::select! { biased;
                    _ = context.cancel.cancelled() => return Ok(RunOutcome::Cancelled { state }),
                    result = self.prompt.render(&context, &names) => result?,
                };
                state.messages[0] = Message::System { content };
            }
            state.context_progress = Default::default();
            state.recipe_progress = Default::default();
            if !self.context_policies.is_empty() || self.recipe.is_some() {
                state.hook_progress.input_start_index = Some(state.messages.len());
                state.hook_progress.synthetic_inputs.clear();
            }
            if self.hooks.is_some() {
                state.hook_progress.run_id = Some(context.run_id.clone());
                state.hook_progress.input_start_index = Some(state.messages.len());
                state.hook_progress.synthetic_inputs.clear();
                state.hook_progress.turn = state
                    .hook_progress
                    .turn
                    .checked_add(1)
                    .ok_or_else(|| Error::Checkpoint("hook turn ordinal exhausted".into()))?;
                state.hook_progress.pending_input = Some(message);
                state.hook_progress.stop_done = false;
                state.hook_progress.stop_attempts = 0;
                if !state.hook_progress.session_started {
                    state.hook_progress.session_started = true;
                    state
                        .hook_progress
                        .facts
                        .push_back(crate::hooks::progress::HookFact {
                            name: "session_start".into(),
                            operation: "session-start".into(),
                            payload: json!({"source":"new","agent":self.spec.name}),
                        });
                }
            } else {
                state.messages.push(message);
            }
            state.steps = 0;
            state.complete = false;
            state.completion_info = crate::CompletionInfo::default();
        }
        if let Some(call) = &self.direct_tool {
            if input.resume {
                if state.execution_run_id.as_deref() != Some(context.run_id.as_str()) {
                    return Err(Error::Checkpoint(
                        "tool program run identity changed".into(),
                    ));
                }
            } else {
                self.prepare_direct_tool(&mut state, call, &context)?;
            }
        }
        if self.event_program.is_some() {
            self.prepare_event(&mut state, &context, input.resume)?;
        }
        let mut host = AgentHost {
            agent: self,
            tools,
            context,
            closing: state.complete,
            state,
            key,
            revision,
            events,
        };
        host.commit().await?;
        if let Some(initial) = host
            .context
            .capabilities
            .get::<crate::mailbox::InitialInputBinding>()
        {
            initial.0.acknowledge().await?;
        }
        *driver_started = true;
        match drive(&mut host).await {
            Err(Error::Cancelled) => Ok(RunOutcome::Cancelled { state: host.state }),
            Err(Error::BudgetExceeded) => Ok(RunOutcome::BudgetExceeded { state: host.state }),
            Err(Error::GovernancePaused(reason)) => Ok(RunOutcome::Paused {
                reason,
                state: host.state,
            }),
            result => result,
        }
    }
}
