use super::*;
use crate::{context_policy::*, hooks::HookDecision};

impl Agent {
    pub fn with_context_policy(
        mut self,
        identity: impl Into<String>,
        policy: Arc<dyn ContextPolicy>,
    ) -> Result<Self, Error> {
        let identity = identity.into();
        if identity.trim().is_empty() || self.context_policies.iter().any(|(id, _)| id == &identity)
        {
            return Err(Error::Composition(
                "context policies need unique versioned identities".into(),
            ));
        }
        self.composition = crate::identity::extend(
            self.spec.settings.scope_identity,
            serde_json::to_string(&(&self.composition, "context_policy", &identity))
                .map_err(|e| Error::Composition(e.to_string()))?,
        );
        self.context_policies.push((identity, policy));
        Ok(self)
    }
}
impl AgentHost<'_> {
    pub(super) async fn prepare_context(&mut self) -> Result<Option<Step<RunOutcome>>, Error> {
        if self.agent.context_policies.is_empty() {
            return Ok(None);
        }
        if self.state.context_progress.step != self.state.steps {
            self.state.context_progress.step = self.state.steps;
            self.state.context_progress.completed.clear();
            self.state.context_progress.pending = None;
        }
        let policies = self.agent.context_policies.clone();
        for (identity, policy) in &policies {
            if self.state.context_progress.completed.contains(identity) {
                continue;
            }
            let prepared = if let Some(pending) = self.state.context_progress.pending.clone() {
                if pending.policy != *identity {
                    return Err(Error::Checkpoint("pending context policy changed".into()));
                }
                pending
            } else {
                let Some(plan) = policy.plan(&self.state, &self.context).await? else {
                    self.state
                        .context_progress
                        .completed
                        .insert(identity.clone());
                    continue;
                };
                if serde_json::to_vec(&plan)
                    .map_err(|e| Error::Composition(e.to_string()))?
                    .len()
                    > 65536
                {
                    return Err(Error::Composition("context plan exceeds 64 KiB".into()));
                }
                self.state.context_progress.sequence = self
                    .state
                    .context_progress
                    .sequence
                    .checked_add(1)
                    .ok_or_else(|| Error::Checkpoint("context sequence exhausted".into()))?;
                let prepared = PreparedContext {
                    policy: identity.clone(),
                    operation: self.hook_operation(&format!(
                        "compact:{}:{}:{}",
                        self.state.model_sequence,
                        self.state.steps,
                        self.state.context_progress.sequence
                    )),
                    plan,
                };
                self.state.context_progress.pending = Some(prepared.clone());
                self.commit().await?;
                prepared
            };
            let gate = self
                .hook(
                    "before_compact",
                    &prepared.operation,
                    json!({"policy":identity,"plan":prepared.plan}),
                )
                .await?;
            match gate.control {
                HookDecision::Pause { reason } => return Ok(Some(self.hook_pause(reason))),
                HookDecision::Deny { .. } => {
                    self.state.context_progress.pending = None;
                    self.state
                        .context_progress
                        .completed
                        .insert(identity.clone());
                    self.commit().await?;
                    continue;
                }
                _ => {}
            }
            let update = {
                let operation_context =
                    crate::governance::operation_context(&self.context, &prepared.operation);
                let apply = policy.apply(&self.state, &prepared.plan, &operation_context);
                tokio::pin!(apply);
                tokio::select! {
                    biased;
                    _ = self.context.cancel.cancelled() => {
                        // Give admitted adapters a bounded opportunity to settle
                        // cancellation receipts before dropping their future.
                        let _ = tokio::time::timeout(std::time::Duration::from_millis(500), &mut apply).await;
                        return Err(crate::governance::cancellation_error(&self.context));
                    },
                    result = &mut apply => result?,
                }
            };
            self.commit_context(identity, prepared.operation, update)
                .await?;
            return Ok(Some(Step::Continue));
        }
        Ok(None)
    }
    async fn commit_context(
        &mut self,
        identity: &str,
        operation: String,
        update: ContextUpdate,
    ) -> Result<(), Error> {
        let retained = self
            .state
            .messages
            .get(update.retained_from..)
            .ok_or_else(|| {
                Error::Composition("context policy returned an invalid retained range".into())
            })?;
        let end = update
            .retained_at
            .checked_add(retained.len())
            .ok_or_else(|| Error::Composition("context range overflow".into()))?;
        if update.messages.get(update.retained_at..end) != Some(retained)
            || self.state.messages.first().is_some_and(|first| {
                matches!(first, Message::System { .. }) && update.messages.first() != Some(first)
            })
            || self
                .state
                .hook_progress
                .input_start_index
                .is_some_and(|start| start < update.retained_from)
        {
            return Err(Error::Composition(
                "context policy changed the system prefix or current turn".into(),
            ));
        }
        if serde_json::to_vec(&update.messages)
            .map_err(|e| Error::Composition(e.to_string()))?
            .len()
            > 16 * 1024 * 1024
        {
            return Err(Error::Composition(
                "compacted context exceeds 16 MiB".into(),
            ));
        }
        let before = self.state.messages.len();
        self.state.hook_progress.input_start_index = self
            .state
            .hook_progress
            .input_start_index
            .map(|index| index - update.retained_from + update.retained_at);
        self.state.hook_progress.synthetic_inputs = self
            .state
            .hook_progress
            .synthetic_inputs
            .iter()
            .filter(|index| **index >= update.retained_from)
            .map(|index| index - update.retained_from + update.retained_at)
            .chain(
                (0..update.messages.len())
                    .filter(|index| *index < update.retained_at || *index >= end),
            )
            .collect();
        self.state.messages = update.messages;
        self.state.input_progress.capture = self
            .state
            .input_progress
            .capture
            .iter()
            .filter(|(index, _)| **index >= update.retained_from)
            .map(|(index, message)| {
                (
                    index - update.retained_from + update.retained_at,
                    message.clone(),
                )
            })
            .collect();
        self.state.input_tokens = self.state.input_tokens.saturating_add(update.input_tokens);
        self.state.output_tokens = self
            .state
            .output_tokens
            .saturating_add(update.output_tokens);
        self.state.hook_progress.prepared_model = None;
        self.state.context_progress.pending = None;
        self.state
            .context_progress
            .completed
            .insert(identity.into());
        self.queue_hook("after_compact", operation, json!({"policy":identity,"before_messages":before,"after_messages":self.state.messages.len(),"metadata":update.metadata}));
        self.commit().await?;
        self.emit(RunEvent::ModelUsage {
            input_tokens: update.input_tokens,
            output_tokens: update.output_tokens,
            info: crate::CompletionInfo {
                provider: json!({"purpose":"context_compaction","policy":identity}),
                ..Default::default()
            },
        })
        .await
    }
}
