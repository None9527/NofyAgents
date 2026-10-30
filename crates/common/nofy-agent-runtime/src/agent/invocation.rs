use super::*;

impl Agent {
    pub(super) async fn run(
        &self,
        input: RunInput,
        mut context: RunContext,
        events: Option<mpsc::Sender<RunEvent>>,
    ) -> Result<RunOutcome, Error> {
        // A mailbox cancellation belongs to this invocation. Parent cancellation
        // still propagates down, while a child can settle its own control result
        // without cancelling and dropping its awaiting parent first.
        context.cancel = context.cancel.child_token();
        let mut budget_guard = None;
        let mut driver_started = false;
        let mut mailbox_cancel = None;
        let mut result = async {
            crate::identity::bind(&mut context, self.spec.settings.scope_identity)?;
            let inherited_budget = context
                .capabilities
                .get::<crate::governance::BudgetControl>();
            let supervised_budget = context
                .capabilities
                .get::<crate::governance::SupervisedBudgetBackend>();
            let lineage = context.capabilities.get::<crate::events::RunLineage>();
            let required_mailbox = context
                .capabilities
                .get::<crate::mailbox::RequiredMailbox>();
            let reconciliation = context
                .capabilities
                .get::<crate::reconciliation::ReconciliationInput>();
            let initial_input = context
                .capabilities
                .get::<crate::mailbox::InitialInputBinding>();
            let mut model_journal = context
                .capabilities
                .get::<crate::model_journal::JournalModels>();
            let mut floor = context
                .capabilities
                .get::<crate::policy::PolicyFloor>()
                .as_deref()
                .cloned()
                .unwrap_or_default();
            floor.extend(&self.required_policies);
            let services = crate::context::RunServices::capture(&context);
            let bound = self.bindings.iter().try_for_each(|binding| {
                binding.bind(&mut context)?;
                if let Some(journal) = context
                    .capabilities
                    .get::<crate::model_journal::JournalModels>()
                {
                    model_journal = Some(journal);
                }
                Ok::<(), Error>(())
            });
            services.restore(&mut context)?;
            bound?;
            if let Some(journal) = model_journal {
                context.capabilities.insert_arc(journal);
            }
            if crate::model_journal::enabled(&context) && self.checkpoint.is_none() {
                return Err(Error::Composition(
                    "model journal binding requires a checkpointer".into(),
                ));
            }
            context
                .capabilities
                .remove::<crate::mailbox::UserToolInvocation>();
            if context
                .capabilities
                .get::<crate::reconciliation::ReconciliationInput>()
                .is_some_and(|receipt| {
                    receipt.thread_id != context.thread_id || receipt.run_id != context.run_id
                })
            {
                context
                    .capabilities
                    .remove::<crate::reconciliation::ReconciliationInput>();
            }
            if let Some(receipt) = reconciliation
                && receipt.thread_id == context.thread_id
                && receipt.run_id == context.run_id
            {
                context.capabilities.insert_arc(receipt);
            }
            context
                .capabilities
                .remove::<crate::mailbox::InitialInputBinding>();
            if let Some(initial) = initial_input
                && initial.matches(&context)
            {
                context.capabilities.insert_arc(initial);
            }
            context.capabilities.insert(floor);
            if let Some(inherited) = inherited_budget {
                context.capabilities.insert_arc(inherited);
            }
            if let Some(supervised) = supervised_budget {
                context.capabilities.insert_arc(supervised);
            }
            if let Some(lineage) = lineage {
                context.capabilities.insert_arc(lineage);
            }
            if let Some(mailbox) = required_mailbox {
                context
                    .capabilities
                    .insert(crate::mailbox::MailboxBinding(mailbox.0.clone()));
                context.capabilities.insert_arc(mailbox);
            }
            if self.model.is_none()
                && !context
                    .capabilities
                    .get::<crate::program::ProgramRoot>()
                    .is_some_and(|root| root.matches(&context))
            {
                // A tool node inherits parent cancellation, never the parent's
                // mailbox recipient or authority to consume another turn.
                context
                    .capabilities
                    .remove::<crate::mailbox::MailboxBinding>();
                // Keep the protected root backend for descendant sampled
                // Agents; they bind their own recorded recipient address.
                context
                    .capabilities
                    .remove::<crate::mailbox::InitialInputBinding>();
            }
            if let Some(binding) = context.capabilities.get::<crate::mailbox::MailboxBinding>() {
                if self.checkpoint.is_none()
                    || (self
                        .checkpoint
                        .as_ref()
                        .is_some_and(|store| store.is_durable())
                        && !binding.0.is_durable())
                {
                    return Err(Error::Composition(
                        "mailbox requires a compatible checkpointer".into(),
                    ));
                }
                mailbox_cancel = Some(
                    crate::mailbox::watch_cancel(
                        &binding,
                        crate::mailbox::InputAddress::for_run(&self.spec.name, &context),
                        &context,
                        input.resume,
                        input.resume_cancel_through,
                    )
                    .await?,
                );
            } else if input.resume_cancel_through.is_some() {
                return Err(Error::Composition(
                    "cancel cursor requires an installed mailbox".into(),
                ));
            }
            budget_guard = Some(
                crate::governance::runtime_prepare(
                    &self.governance,
                    &mut context,
                    self.checkpoint
                        .as_ref()
                        .is_some_and(|store| store.is_durable()),
                )
                .await?,
            );
            // Install after user bindings and per agent, so a child cannot use
            // its parent's recovery authority or checkpoint namespace.
            context
                .capabilities
                .remove::<crate::governance::ModelRecovery>();
            if let Some(store) = &self.checkpoint {
                #[cfg(feature = "workflow")]
                context
                    .capabilities
                    .insert(crate::controllers::ExecutionCheckpoint {
                        key: self.checkpoint_key(&context.thread_id),
                        composition: self.composition.clone(),
                        run_id: Some(context.run_id.clone()),
                    });
                context
                    .capabilities
                    .insert(crate::governance::ModelRecovery::new(
                        store.clone(),
                        &self.composition,
                        &context,
                    ));
            }
            if let Some(hooks) = &self.hooks {
                context
                    .capabilities
                    .insert(crate::hooks::HookBusBinding(hooks.clone()));
                context
                    .capabilities
                    .insert(crate::hooks::HookAgentName(self.spec.name.clone()));
            }
            if self.hooks.is_some()
                && let Some(store) = &self.checkpoint
            {
                context
                    .capabilities
                    .insert(crate::hooks::HookJournalBinding(
                        crate::hooks::HookJournal::new(store.clone()),
                    ));
            }
            publish_event(
                self,
                &context,
                events.as_ref(),
                RunEvent::RunStarted {
                    resume: input.resume,
                },
            )
            .await?;
            if context.cancel.is_cancelled() {
                return Err(crate::governance::cancellation_error(&context));
            }
            self.run_inner(input, context.clone(), events.clone(), &mut driver_started)
                .await
        }
        .await;
        if let Some(error) = mailbox_cancel.as_ref().and_then(|watch| watch.failure()) {
            result = Err(Error::Checkpoint(format!(
                "mailbox control monitoring failed: {error}"
            )));
        }
        self.governance_outcome(&mut result, &context).await;
        // Preflight errors belong to this invocation, not to the persisted
        // turn. They must not replace a settled terminal hook's payload.
        if self.event_program.is_none()
            && (driver_started
                || matches!(&result, Ok(RunOutcome::Cancelled {state}) if state.hook_progress.run_id.as_ref() == Some(&context.run_id)))
        {
            self.finish_hook_outcome(&mut result, &context, events.clone())
                .await;
        }
        use crate::events::RunStatus;
        let (status, reason) = match &result {
            Ok(RunOutcome::Completed { state, .. }) if state.completion_info.refusal.is_some() => (
                RunStatus::Refused,
                Some(json!({"refusal":state.completion_info.refusal})),
            ),
            Ok(RunOutcome::Completed { state, .. })
                if state.completion_info.stop_reason.as_deref() == Some("length") =>
            {
                (RunStatus::Truncated, None)
            }
            Ok(RunOutcome::Completed { .. }) => (RunStatus::Completed, None),
            Ok(RunOutcome::Paused { reason, .. }) => (RunStatus::Paused, Some(reason.clone())),
            Ok(RunOutcome::Cancelled { .. }) => (RunStatus::Cancelled, None),
            Ok(RunOutcome::BudgetExceeded { .. }) => (RunStatus::BudgetExceeded, None),
            Err(Error::ModelFailure(error)) => (
                RunStatus::Failed,
                Some(json!({"error":error.to_string(),"model_failure":error})),
            ),
            Err(error) => (RunStatus::Failed, Some(json!({"error":error.to_string()}))),
        };
        let terminal = publish_event(
            self,
            &context,
            events.as_ref(),
            RunEvent::Terminated { status, reason },
        )
        .await;
        let finished = publish_event(self, &context, events.as_ref(), RunEvent::Finished).await;
        match result {
            Ok(outcome) => {
                terminal?;
                finished?;
                Ok(outcome)
            }
            Err(error) => Err(error),
        }
    }
}
