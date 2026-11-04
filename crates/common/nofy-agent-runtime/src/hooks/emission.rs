use super::*;

impl HookBus {
    pub async fn emit(
        &self,
        owner: &ModuleRef,
        name: &str,
        operation: &str,
        payload: Value,
        context: &RunContext,
    ) -> Result<HookResult, Error> {
        let declaration = self
            .catalog
            .get(name)
            .ok_or_else(|| Error::Composition(format!("undeclared hook event: {name}")))?;
        if &declaration.owner != owner || operation.trim().is_empty() {
            return Err(Error::Composition(
                "event producer/version or stable operation identity does not match".into(),
            ));
        }
        crate::settings::validate_json_value(&declaration.payload_schema, &payload)?;
        let mut event = HookEvent {
            version: 1,
            id: serde_json::to_string(&(
                &context.thread_id,
                &context.run_id,
                owner,
                name,
                operation,
            ))
            .map_err(|e| Error::Composition(e.to_string()))?,
            name: name.into(),
            owner: owner.clone(),
            scope: crate::events::EventScope::new(
                context
                    .capabilities
                    .get::<HookAgentName>()
                    .map(|name| name.0.clone())
                    .unwrap_or_else(|| "hooks".into()),
                context,
            ),
            payload,
        };
        #[cfg(feature = "workflow")]
        let replayable = context
            .capabilities
            .get::<HookReplaySource>()
            .is_some_and(|source| source.matches(owner, name, operation, context));
        #[cfg(feature = "workflow")]
        if replayable
            && let Some(controller) = context
                .capabilities
                .get::<crate::controllers::ControllerBinding>()
        {
            controller.alias_hook(&mut event, operation).await?;
        }
        #[cfg(feature = "workflow")]
        let source = HookSourceEvent {
            event: event.clone(),
            replayable,
        };
        let chain = context
            .capabilities
            .get::<HookChain>()
            .as_deref()
            .cloned()
            .unwrap_or_default();
        if chain.0.len() >= 16 || chain.0.contains(&event.id) {
            return Err(Error::Composition(
                "hook recursion/depth limit exceeded".into(),
            ));
        }
        let journal = context.capabilities.get::<HookJournalBinding>();
        let mut stop_blocks = Vec::new();
        for registration in self.registrations.iter().filter(|r| r.rule.event == name) {
            if registration.rule.matches.as_ref().is_some_and(|matcher| {
                event.payload.pointer(&matcher.pointer) != Some(&matcher.equals)
            }) {
                continue;
            }
            let mut child = context.clone();
            #[cfg(feature = "workflow")]
            child.capabilities.insert(source.clone());
            let mut child_chain = chain.clone();
            child_chain.0.push(event.id.clone());
            child.capabilities.insert(child_chain);
            child.capabilities.insert(HookInvocation {
                event_id: event.id.clone(),
                hook_identity: registration.identity.clone(),
            });
            primitive::bind(self, registration, &event, &mut child);
            let record = if let Some(journal) = &journal {
                Some(
                    journal
                        .0
                        .begin(&self.identity, registration, &event, &child)
                        .await?,
                )
            } else {
                None
            };
            if let Some(record) = &record {
                primitive::bind_record(&mut child, &record.key);
            }
            let cached = record.as_ref().and_then(|record| record.cached.clone());
            if record.as_ref().is_some_and(|record| record.uncertain) {
                return Ok(HookResult {
                    payload: event.payload,
                    control: cached.expect("uncertain hook has a pause"),
                });
            }
            let decision = if let Some(cached) = cached {
                if let Some(command) = primitive::reconciled(&child).await?
                    && let Some(sink) = context
                        .capabilities
                        .get::<crate::events::EventSinkBinding>()
                {
                    let key = crate::system::content_digest(&(
                        "hook-reconciled",
                        &command,
                        &event.id,
                        &registration.identity,
                    ))?;
                    sink.0
                        .record_once(
                            event.scope.clone(),
                            crate::events::RunEvent::Hook {
                                event_id: event.id.clone(),
                                event_name: event.name.clone(),
                                hook: registration.identity.clone(),
                                status: "reconciled".into(),
                                detail: Some(command),
                            },
                            &key,
                        )
                        .await?;
                }
                cached
            } else {
                self.audit(&event, registration, "started", None, context)
                    .await?;
                let execution = tokio::select! {biased;
                    _=context.cancel.cancelled()=>return Err(Error::Cancelled),
                    result=tokio::time::timeout(Duration::from_millis(registration.rule.timeout_ms),registration.handler.handle(&event,&child))=>match result {
                        Ok(result)=>result,
                        Err(_) if registration.handler.can_resume(&child)=>return Err(Error::GovernancePaused(json!({"kind":"hook_controller_timeout","event_id":event.id,"hook":registration.identity}))),
                        Err(_)=>Err(Error::Composition("hook timed out".into())),
                    },
                };
                let checked = execution.and_then(|decision| {
                    declaration.check(&decision)?;
                    Ok(decision)
                });
                match checked {
                    Err(Error::Cancelled) => return Err(Error::Cancelled),
                    Err(error @ (Error::BudgetExceeded | Error::GovernancePaused(_))) => {
                        return Err(error);
                    }
                    Err(error @ Error::Checkpoint(_)) => return Err(error),
                    Ok(decision) => {
                        if matches!(decision, HookDecision::Pause { .. }) && journal.is_none() {
                            return Err(Error::Composition(
                                "hook pause requires an explicit journal".into(),
                            ));
                        }
                        if let (Some(journal), Some(record)) = (&journal, &record) {
                            journal
                                .0
                                .finish(
                                    &self.identity,
                                    registration,
                                    &event,
                                    record,
                                    &decision,
                                    None,
                                )
                                .await?;
                        }
                        self.audit(&event, registration, "completed", None, context)
                            .await?;
                        decision
                    }
                    Err(error) => {
                        let message = error.to_string();
                        if let (Some(journal), Some(record)) = (&journal, &record) {
                            journal
                                .0
                                .finish(
                                    &self.identity,
                                    registration,
                                    &event,
                                    record,
                                    &HookDecision::Continue,
                                    Some(message.clone()),
                                )
                                .await?;
                        }
                        self.audit(
                            &event,
                            registration,
                            "failed",
                            Some(message.clone()),
                            context,
                        )
                        .await?;
                        match registration.rule.failure {
                            FailurePolicy::Open => HookDecision::Continue,
                            FailurePolicy::Closed => return Err(Error::Composition(message)),
                        }
                    }
                }
            };
            declaration.check(&decision)?;
            match decision {
                HookDecision::Continue => {}
                HookDecision::Patch { payload } => event.payload = payload,
                HookDecision::Deny { reason } if declaration.stop => stop_blocks.push(reason),
                control => {
                    return Ok(HookResult {
                        payload: event.payload,
                        control,
                    });
                }
            }
        }
        Ok(HookResult {
            payload: event.payload,
            control: if stop_blocks.is_empty() {
                HookDecision::Continue
            } else {
                HookDecision::Deny {
                    reason: stop_blocks.join("\n"),
                }
            },
        })
    }
    async fn audit(
        &self,
        event: &HookEvent,
        registration: &HookRegistration,
        status: &str,
        detail: Option<String>,
        context: &RunContext,
    ) -> Result<(), Error> {
        if let Some(sink) = context
            .capabilities
            .get::<crate::events::EventSinkBinding>()
        {
            sink.0
                .record(
                    event.scope.clone(),
                    crate::events::RunEvent::Hook {
                        event_id: event.id.clone(),
                        event_name: event.name.clone(),
                        hook: registration.identity.clone(),
                        status: status.into(),
                        detail,
                    },
                )
                .await?;
        }
        Ok(())
    }
}
