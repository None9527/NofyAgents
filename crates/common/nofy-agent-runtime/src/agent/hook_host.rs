use super::*;
use crate::hooks::{
    HookDecision, HookResult,
    progress::{HookFact, PreparedModel, PreparedTool},
    runtime_owner,
};

impl Agent {
    /// A host calls this when its session coordinator has actually settled idle
    /// or is closing. An invocation ending is not itself a session shutdown.
    pub async fn notify_session(
        &self,
        signal: crate::hooks::SessionSignal,
        mut context: RunContext,
    ) -> Result<HookResult, Error> {
        let Some(bus) = &self.hooks else {
            return Ok(HookResult {
                payload: Value::Null,
                control: HookDecision::Continue,
            });
        };
        crate::identity::bind(&mut context, self.spec.settings.scope_identity)?;
        let inherited_budget = context
            .capabilities
            .get::<crate::governance::BudgetControl>();
        let supervised_budget = context
            .capabilities
            .get::<crate::governance::SupervisedBudgetBackend>();
        let lineage = context.capabilities.get::<crate::events::RunLineage>();
        let mut floor = context
            .capabilities
            .get::<crate::policy::PolicyFloor>()
            .as_deref()
            .cloned()
            .unwrap_or_default();
        floor.extend(&self.required_policies);
        let services = crate::context::RunServices::capture(&context);
        let bound = self
            .bindings
            .iter()
            .try_for_each(|binding| binding.bind(&mut context));
        services.restore(&mut context)?;
        bound?;
        context.capabilities.insert(floor);
        if let Some(budget) = inherited_budget {
            context.capabilities.insert_arc(budget);
        }
        if let Some(supervised) = supervised_budget {
            context.capabilities.insert_arc(supervised);
        }
        if let Some(lineage) = lineage {
            context.capabilities.insert_arc(lineage);
        }
        let _budget_guard = crate::governance::runtime_prepare(
            &self.governance,
            &mut context,
            self.checkpoint
                .as_ref()
                .is_some_and(|store| store.is_durable()),
        )
        .await?;
        context
            .capabilities
            .insert(crate::hooks::HookAgentName(self.spec.name.clone()));
        if let Some(store) = &self.checkpoint {
            context
                .capabilities
                .insert(crate::hooks::HookJournalBinding(
                    crate::hooks::HookJournal::new(store.clone()),
                ));
        }
        let (name, payload) = match signal {
            crate::hooks::SessionSignal::Idle => ("session_idle", json!({})),
            crate::hooks::SessionSignal::End { reason } => {
                ("session_end", json!({"reason":reason}))
            }
        };
        bus.emit(&runtime_owner(), name, name, payload, &context)
            .await
            .map_err(|error| match error {
                Error::Cancelled => crate::governance::cancellation_error(&context),
                other => other,
            })
    }
    pub(super) async fn finish_hook_outcome(
        &self,
        result: &mut Result<RunOutcome, Error>,
        context: &RunContext,
        events: Option<mpsc::Sender<RunEvent>>,
    ) {
        if self.hooks.is_none() {
            return;
        }
        let (name, payload, state) = match &*result {
            Ok(RunOutcome::Cancelled { state }) => (
                "turn_cancelled",
                json!({"reason":"cancelled","output":state.output}),
                Some(state.clone()),
            ),
            Ok(RunOutcome::BudgetExceeded { state }) => (
                "turn_cancelled",
                json!({"reason":"budget_exceeded","output":state.output}),
                Some(state.clone()),
            ),
            Err(error) => ("turn_error", json!({"error":error.to_string()}), None),
            _ => return,
        };
        let key = self.checkpoint_key(&context.thread_id);
        let existing = if let Some(store) = &self.checkpoint {
            match store.load(&key).await {
                Ok(value) => value,
                Err(_) => return,
            }
        } else {
            None
        };
        if existing.as_ref().is_some_and(|checkpoint| {
            checkpoint.composition != self.composition
                || checkpoint
                    .state
                    .execution_run_id
                    .as_ref()
                    .is_some_and(|run| run != &context.run_id)
                || checkpoint
                    .state
                    .hook_progress
                    .run_id
                    .as_ref()
                    .is_some_and(|run| run != &context.run_id)
        }) {
            return;
        }
        let revision = existing.as_ref().map(|checkpoint| checkpoint.revision);
        let state = state
            .or_else(|| existing.map(|checkpoint| checkpoint.state))
            .unwrap_or_default();
        let mut cleanup = context.clone();
        cleanup.cancel = tokio_util::sync::CancellationToken::new();
        let mut host = AgentHost {
            agent: self,
            tools: self.tools.clone(),
            context: cleanup,
            closing: state.complete,
            state,
            key,
            revision,
            events,
        };
        let operation = host.hook_operation(&format!("terminal:{name}"));
        if !host
            .state
            .hook_progress
            .facts
            .iter()
            .any(|fact| fact.operation == operation)
        {
            host.queue_hook(name, operation.clone(), payload.clone());
        }
        if host.commit().await.is_err() {
            return;
        }
        // A cancelled run has a bounded cleanup window; dropping a command
        // handler in this window uses the same process-tree ownership guards.
        if let Ok(Ok(HookResult {
            control: HookDecision::Continue,
            ..
        })) = tokio::time::timeout(
            std::time::Duration::from_millis(500),
            host.hook(name, &operation, payload),
        )
        .await
        {
            host.state
                .hook_progress
                .facts
                .retain(|fact| fact.operation != operation);
            let _ = host.commit().await;
        }
        if let Ok(RunOutcome::Cancelled { state } | RunOutcome::BudgetExceeded { state }) = result {
            *state = host.state;
        }
    }
}

impl AgentHost<'_> {
    pub(super) fn hook_operation(&self, operation: &str) -> String {
        if let Some(command) = &self.state.input_progress.command {
            return format!(
                "turn:{}:control:{}:user-tool:{}:{}:{operation}",
                self.state.hook_progress.turn,
                self.state.control_sequence,
                command.delivery.sequence,
                command.delivery.digest
            );
        }
        if self.state.control_sequence == 0 {
            format!("turn:{}:{operation}", self.state.hook_progress.turn)
        } else {
            format!(
                "turn:{}:control:{}:{operation}",
                self.state.hook_progress.turn, self.state.control_sequence
            )
        }
    }
    pub(super) fn queue_hook(&mut self, name: &str, operation: String, payload: Value) {
        if self.agent.hooks.is_some() {
            self.state.hook_progress.facts.push_back(HookFact {
                name: name.into(),
                operation,
                payload,
            });
        }
    }
    pub(super) async fn hook(
        &self,
        name: &str,
        operation: &str,
        payload: Value,
    ) -> Result<HookResult, Error> {
        match &self.agent.hooks {
            None => Ok(HookResult {
                payload,
                control: HookDecision::Continue,
            }),
            Some(bus) => {
                let mut context = self.context.clone();
                #[cfg(feature = "workflow")]
                context
                    .capabilities
                    .insert(crate::hooks::HookReplaySource::new(
                        name, operation, &context,
                    ));
                context
                    .capabilities
                    .remove::<crate::memory::DurableTurnReceipt>();
                if name == "turn_done"
                    && self
                        .agent
                        .checkpoint
                        .as_ref()
                        .is_some_and(|store| store.is_durable())
                {
                    if let Some(receipt) = self.revision.and_then(|revision| {
                        crate::memory::DurableTurnReceipt::committed(
                            &context,
                            &self.state,
                            revision,
                        )
                    }) {
                        context.capabilities.insert(receipt);
                    }
                }
                match bus
                    .emit(&runtime_owner(), name, operation, payload, &context)
                    .await
                {
                    Err(Error::Cancelled) => {
                        self.context.cancel.cancel();
                        Ok(HookResult {
                            payload: Value::Null,
                            control: HookDecision::Pause {
                                reason: json!({"kind":"cancelled"}),
                            },
                        })
                    }
                    Ok(result)
                        if matches!(result.control, HookDecision::Pause { .. })
                            && self.agent.checkpoint.is_none() =>
                    {
                        Err(Error::Composition(
                            "agent hook pause requires a checkpointer for the run state".into(),
                        ))
                    }
                    result => result,
                }
            }
        }
    }
    pub(super) fn hook_pause(&self, reason: Value) -> Step<RunOutcome> {
        if self.context.cancel.is_cancelled() {
            Step::Complete(RunOutcome::Cancelled {
                state: self.state.clone(),
            })
        } else {
            Step::Complete(RunOutcome::Paused {
                reason,
                state: self.state.clone(),
            })
        }
    }
    pub(super) async fn drain_hook_facts(&mut self) -> Result<Option<Step<RunOutcome>>, Error> {
        while let Some(fact) = self.state.hook_progress.facts.front().cloned() {
            let result = self.hook(&fact.name, &fact.operation, fact.payload).await?;
            if let HookDecision::Pause { reason } = result.control {
                return Ok(Some(self.hook_pause(reason)));
            }
            if !matches!(result.control, HookDecision::Continue) {
                return Err(Error::Composition(
                    "fact hook attempted to change completed work".into(),
                ));
            }
            self.state.hook_progress.facts.pop_front();
            self.commit().await?;
        }
        Ok(None)
    }
    pub(super) async fn refuse_hook(&mut self, reason: String) -> Result<(), Error> {
        self.state.complete = true;
        self.state.output = reason.clone();
        self.state.completion_info.refusal = Some(reason);
        self.state.hook_progress.pending_input = None;
        self.state.hook_progress.prepared_model = None;
        if self
            .state
            .hook_progress
            .prepared_sources
            .as_ref()
            .is_some_and(|sources| sources.pending.is_none())
        {
            self.state.hook_progress.prepared_sources = None;
        }
        self.state.hook_progress.stop_done = true;
        self.queue_hook(
            "turn_done",
            self.hook_operation("refused"),
            json!({"output":self.state.output,"info":self.state.completion_info}),
        );
        self.commit().await
    }
    pub(super) async fn prepare_hook_input(&mut self) -> Result<Option<Step<RunOutcome>>, Error> {
        let Some(message) = self.state.hook_progress.pending_input.clone() else {
            return Ok(None);
        };
        let result = self
            .hook(
                "user_input",
                &self.hook_operation("input"),
                json!({"message":message}),
            )
            .await?;
        match result.control {
            HookDecision::Pause { reason } => return Ok(Some(self.hook_pause(reason))),
            HookDecision::Deny { reason } => {
                self.refuse_hook(reason).await?;
                return Ok(Some(Step::Continue));
            }
            _ => {}
        }
        let message: Message = serde_json::from_value(
            result
                .payload
                .get("message")
                .cloned()
                .ok_or_else(|| Error::Composition("user input hook removed message".into()))?,
        )
        .map_err(|e| Error::Composition(e.to_string()))?;
        match &message {
            Message::User { .. } => {}
            Message::UserParts { content } if !content.is_empty() => {
                for part in content {
                    if let crate::InputPart::Image { url } = part {
                        if !self.agent.model_capabilities().image_input
                            || !(url.starts_with("http://")
                                || url.starts_with("https://")
                                || url.starts_with("data:image/"))
                        {
                            return Err(Error::Composition(
                                "hook produced unsupported image input".into(),
                            ));
                        }
                    }
                }
            }
            _ => {
                return Err(Error::Composition(
                    "input hook may only produce a user message".into(),
                ));
            }
        }
        self.state.messages.push(message.clone());
        self.state.hook_progress.pending_input = None;
        self.queue_hook(
            "turn_start",
            self.hook_operation("start"),
            json!({"message":message}),
        );
        self.commit().await?;
        Ok(Some(Step::Continue))
    }
    pub(super) async fn prepare_hook_tool(
        &mut self,
        call: &mut ToolCall,
        resume: bool,
    ) -> Result<Option<Step<RunOutcome>>, Error> {
        if self.agent.hooks.is_none() || resume {
            return Ok(None);
        }
        if let Some(prepared) = &self.state.hook_progress.prepared_tool {
            if prepared.call.id != call.id {
                return Err(Error::Checkpoint(
                    "prepared hook tool identity changed".into(),
                ));
            }
            *call = prepared.call.clone();
            if prepared.hooks_done {
                return Ok(None);
            }
        } else {
            let original = call.id.clone();
            for middleware in &self.agent.middleware {
                crate::governance::await_resource(
                    &self.context,
                    middleware.before_tool(call, &self.context),
                )
                .await?;
            }
            if call.id != original {
                return Err(Error::Tool("middleware changed tool call identity".into()));
            }
            self.state.hook_progress.prepared_tool = Some(PreparedTool {
                call: call.clone(),
                hooks_done: false,
            });
            self.commit().await?;
        }
        let mut payload = json!({"call":call});
        if let Some(command) = &self.state.input_progress.command
            && command.call.id == call.id
        {
            payload["input_source"] = json!({"kind":"user_command","input_id":command.delivery.envelope.input_id,"sequence":command.delivery.sequence});
        }
        let result = self
            .hook(
                "before_tool",
                &self.hook_operation(&format!("tool:{}", call.id)),
                payload,
            )
            .await?;
        match result.control {
            HookDecision::Pause { reason } => return Ok(Some(self.hook_pause(reason))),
            HookDecision::Deny { reason } => {
                self.reject_hook_tool(call, reason, "hook").await?;
                return Ok(Some(Step::Continue));
            }
            _ => {}
        }
        let patched: ToolCall = serde_json::from_value(
            result
                .payload
                .get("call")
                .cloned()
                .ok_or_else(|| Error::Tool("hook removed tool call".into()))?,
        )
        .map_err(|e| Error::Tool(e.to_string()))?;
        if patched.id != call.id {
            return Err(Error::Tool("hook changed tool call identity".into()));
        }
        *call = patched;
        self.state.hook_progress.prepared_tool = Some(PreparedTool {
            call: call.clone(),
            hooks_done: true,
        });
        if let Some(front) = self.state.pending_tools.front_mut() {
            *front = call.clone();
        }
        self.commit().await?;
        Ok(None)
    }
    pub(super) async fn reject_hook_tool(
        &mut self,
        call: &ToolCall,
        reason: String,
        source: &str,
    ) -> Result<(), Error> {
        self.state.in_flight = None;
        self.state.hook_progress.prepared_tool = None;
        self.state.messages.push(Message::Tool {
            call_id: call.id.clone(),
            content: json!({"error":reason}),
            is_error: true,
        });
        self.state.pending_tools.pop_front();
        let event = if source == "policy" {
            "permission_denied"
        } else {
            "tool_failure"
        };
        self.queue_hook(
            event,
            self.hook_operation(&format!("denied:{}", call.id)),
            json!({"call":call,"reason":reason,"source":source}),
        );
        crate::mailbox::finish_user_command(&mut self.state, &call.id, true)?;
        self.commit().await
    }
    pub(super) async fn context_revisions(&self) -> Result<Vec<Option<String>>, Error> {
        let mut revisions = Vec::with_capacity(self.agent.context_sources.len());
        for source in &self.agent.context_sources {
            revisions.push(
                crate::governance::await_resource(&self.context, source.revision(&self.context))
                    .await?,
            );
        }
        Ok(revisions)
    }
    pub(super) async fn model_hook_request(
        &mut self,
    ) -> Result<Result<ModelRequest, Step<RunOutcome>>, Error> {
        // A paused before_model hook may outlive an external forget operation.
        // Never reuse its old retrieved memory just because the hook is done.
        for _ in 0..3 {
            if self.state.hook_progress.prepared_sources.is_none()
                && let Some(control) = self.prepare_context().await?
            {
                return Ok(Err(control));
            }
            let revisions = self.context_revisions().await?;
            if self
                .state
                .hook_progress
                .prepared_model
                .as_ref()
                .is_some_and(|prepared| prepared.context_revisions != revisions)
            {
                self.state.hook_progress.prepared_model = None;
                self.commit().await?;
            }
            let prepared = self.state.hook_progress.prepared_model.clone();
            let (mut request, operation, done) = if let Some(prepared) = prepared {
                (
                    serde_json::from_value(prepared.request)
                        .map_err(|e| Error::Checkpoint(e.to_string()))?,
                    prepared.operation,
                    prepared.hooks_done,
                )
            } else {
                let mut request = ModelRequest {
                    messages: self.state.messages.clone(),
                    tools: self.tools.definitions(),
                    settings: self.agent.spec.settings.model.clone(),
                };
                let Some(messages) = self.context_source_messages(&revisions).await? else {
                    continue;
                };
                request.messages.extend(messages);
                for middleware in &self.agent.middleware {
                    crate::governance::await_resource(
                        &self.context,
                        middleware.before_model(&mut request, &self.context),
                    )
                    .await?;
                }
                if self.context_revisions().await? != revisions {
                    continue;
                }
                let operation = self.hook_operation(&format!(
                    "model:{}:{}",
                    self.state.steps + 1,
                    serde_json::to_string(&revisions)
                        .map_err(|e| Error::Composition(e.to_string()))?
                ));
                if self.agent.hooks.is_some() {
                    self.state.hook_progress.prepared_model = Some(PreparedModel {
                        request: serde_json::to_value(&request)
                            .map_err(|e| Error::Composition(e.to_string()))?,
                        operation: operation.clone(),
                        hooks_done: false,
                        context_revisions: revisions.clone(),
                    });
                    self.commit().await?;
                }
                (request, operation, false)
            };
            if self.agent.hooks.is_some() && !done {
                let result = self
                    .hook("before_model", &operation, json!({"request":request}))
                    .await?;
                match result.control {
                    HookDecision::Pause { reason } => return Ok(Err(self.hook_pause(reason))),
                    HookDecision::Deny { reason } => {
                        self.refuse_hook(reason).await?;
                        return Ok(Err(Step::Continue));
                    }
                    _ => {}
                }
                request =
                    serde_json::from_value(
                        result.payload.get("request").cloned().ok_or_else(|| {
                            Error::Composition("hook removed model request".into())
                        })?,
                    )
                    .map_err(|e| Error::Composition(e.to_string()))?;
                for tool in &request.tools {
                    if self.tools.get(&tool.function.name).is_none() {
                        return Err(Error::Composition(
                            "hook advertised an unregistered tool".into(),
                        ));
                    }
                }
                self.state.hook_progress.prepared_model = Some(PreparedModel {
                    request: serde_json::to_value(&request)
                        .map_err(|e| Error::Composition(e.to_string()))?,
                    operation,
                    hooks_done: true,
                    context_revisions: revisions.clone(),
                });
                self.commit().await?;
            }
            if self.context_revisions().await? != revisions {
                self.state.hook_progress.prepared_model = None;
                self.commit().await?;
                continue;
            }
            validate_model_settings(self.agent.sampled_model()?, &request.settings)?;
            return Ok(Ok(request));
        }
        Err(Error::Checkpoint(
            "context changed repeatedly during request preparation".into(),
        ))
    }
    pub(super) async fn before_hook_stop(&mut self) -> Result<Option<Step<RunOutcome>>, Error> {
        if self.agent.hooks.is_none() || self.state.hook_progress.stop_done {
            return Ok(None);
        }
        let subagent = self
            .context
            .capabilities
            .get::<crate::events::RunLineage>()
            .is_some_and(|lineage| lineage.parent_run_id.is_some());
        let gate = if subagent
            && self.agent.hooks.as_ref().is_some_and(|bus| {
                bus.registrations()
                    .iter()
                    .any(|registration| registration.declaration.name == "subagent_stop")
            }) {
            "subagent_stop"
        } else {
            "before_stop"
        };
        let result = self
            .hook(
                gate,
                &self.hook_operation(&format!("stop:{}", self.state.steps)),
                json!({"output":self.state.output,"info":self.state.completion_info,"stop_hook_active":self.state.hook_progress.stop_attempts>0,"id":self.context.run_id,"agent":self.agent.spec.name}),
            )
            .await?;
        match result.control {
            HookDecision::Pause { reason } => return Ok(Some(self.hook_pause(reason))),
            HookDecision::Deny { reason } => {
                self.state.hook_progress.stop_attempts =
                    self.state.hook_progress.stop_attempts.saturating_add(1);
                self.state.complete = false;
                self.state
                    .hook_progress
                    .synthetic_inputs
                    .push(self.state.messages.len());
                self.state.messages.push(Message::User {
                    content: format!("Stop hook requests further work: {reason}"),
                });
                self.commit().await?;
                return Ok(Some(Step::Continue));
            }
            HookDecision::Stop {
                reason: Some(reason),
            } => {
                self.state.completion_info.hook_stop_reason = Some(reason);
            }
            _ => {}
        }
        self.state.hook_progress.stop_done = true;
        self.queue_hook(
            "turn_done",
            self.hook_operation("done"),
            json!({"output":self.state.output,"info":self.state.completion_info}),
        );
        self.commit().await?;
        Ok(Some(Step::Continue))
    }
}
