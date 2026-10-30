use super::*;

impl RunSupervisor {
    /// Reconcile only a recorded descendant of this exact active root run.
    /// This records an operator's evidence; it never retries the external call.
    pub async fn reconcile_child(
        &self,
        compiled: &CompiledAgent,
        context: &RunContext,
        receipt: ChildReconciliation,
    ) -> Result<(), Error> {
        self.accept_child_reconciliation(&ExecutionPlan::legacy(compiled), context, receipt)
            .await
    }
    pub fn new(store: SqliteStore) -> Self {
        Self {
            store,
            ttl: Duration::from_secs(30),
        }
    }
    pub fn with_lease_ttl(mut self, ttl: Duration) -> Result<Self, Error> {
        if ttl < Duration::from_millis(30) {
            return Err(Error::Composition(
                "supervisor lease TTL must be at least 30ms".into(),
            ));
        }
        self.ttl = ttl;
        Ok(self)
    }
    pub async fn execute(
        &self,
        compiled: &CompiledAgent,
        input: RunInput,
        context: RunContext,
    ) -> Result<RunOutcome, Error> {
        self.execute_plan(&ExecutionPlan::legacy(compiled), input, context)
            .await
    }
    pub async fn execute_program(
        &self,
        compiled: &CompiledProgram,
        input: RunInput,
        context: RunContext,
    ) -> Result<RunOutcome, Error> {
        self.execute_plan(&ExecutionPlan::program(compiled), input, context)
            .await
    }
    async fn execute_plan(
        &self,
        compiled: &ExecutionPlan,
        input: RunInput,
        context: RunContext,
    ) -> Result<RunOutcome, Error> {
        if context.run_id.is_empty()
            || context.thread_id.is_empty()
            || (compiled.snapshot.is_agent()
                && !input.resume
                && input.prompt.is_none()
                && input.content.is_none())
            || (!compiled.snapshot.is_agent()
                && (input.prompt.is_some() || input.content.is_some()))
            || (input.resume && (input.prompt.is_some() || input.content.is_some()))
        {
            return Err(Error::Composition(
                "supervised run requires IDs and either new input or explicit resume".into(),
            ));
        }
        let key = compiled.agent.checkpoint_key(&context.thread_id);
        let owner = nofy_tool_protocol::ToolCallId::new_v7().to_string();
        let lease = self.store.acquire(key, owner, self.ttl).await?;
        let result = self
            .invoke_plan_leased(compiled, input, context, &lease)
            .await;
        let released = self.store.release(&lease).await;
        match result {
            Ok(outcome) => {
                released?;
                Ok(outcome)
            }
            Err(error) => Err(error),
        }
    }
    pub(super) async fn invoke_plan_leased(
        &self,
        compiled: &ExecutionPlan,
        input: RunInput,
        mut context: RunContext,
        lease: &Lease,
    ) -> Result<RunOutcome, Error> {
        context.cancel = context.cancel.child_token();
        let cancel = context.cancel.clone();
        let future = self.execute_leased(compiled, input, context, lease);
        tokio::pin!(future);
        let mut ticker = tokio::time::interval(self.ttl / 3);
        ticker.tick().await;
        loop {
            tokio::select! {biased;
                _=ticker.tick()=>{if let Err(error)=self.store.renew(lease,self.ttl).await {cancel.cancel();return Err(error)}}
                result=&mut future=>return result,
            }
        }
    }
    async fn execute_leased(
        &self,
        compiled: &ExecutionPlan,
        mut input: RunInput,
        mut context: RunContext,
        lease: &Lease,
    ) -> Result<RunOutcome, Error> {
        let cancel_request = context
            .capabilities
            .remove::<control::PendingChildCancel>()
            .map(|command| command.0.clone());
        crate::identity::bind(&mut context, compiled.agent.spec().settings.scope_identity)?;
        let descendant_retry = input.retry_model.as_ref().is_some_and(|command| {
            command.ticket.run_id != context.run_id || command.ticket.thread_id != context.thread_id
        });
        if descendant_retry && (!input.resume || input.reconciled.is_some()) {
            return Err(Error::Composition(
                "child model retry requires exclusive explicit resume".into(),
            ));
        }
        if cancel_request.is_some()
            && (!input.resume
                || input.retry_model.is_some()
                || input.reconciled.is_some()
                || input.resume_cancel_through.is_some())
        {
            return Err(Error::Composition(
                "descendant cancel resume requires an exclusive control command".into(),
            ));
        }
        if let Some(outcome) = self
            .closed_job(compiled, &input, &context, lease, cancel_request.as_ref())
            .await?
        {
            return Ok(outcome);
        }
        let previous_record = if input.retry_model.is_some() || cancel_request.is_some() {
            self.store.execution_record(&context.run_id).await?
        } else {
            None
        };
        let submission = self
            .attach_job(compiled, &input, &mut context, lease)
            .await?;
        let mut record = RunRecord {
            submission,
            run_id: context.run_id.clone(),
            thread_id: context.thread_id.clone(),
            snapshot: compiled.snapshot.clone(),
            composition: compiled.agent.composition_identity().to_string(),
            status: "running".into(),
            outcome: None,
            error: None,
        };
        self.store
            .begin_run(lease, record.clone(), input.resume)
            .await?;
        let identity = SupervisedIdentity {
            run_id: context.run_id.clone(),
            lease: lease.clone(),
        };
        context.capabilities.insert(identity.clone());
        context.capabilities.insert(crate::events::RunLineage {
            root_run_id: context.run_id.clone(),
            parent_run_id: None,
            node_id: None,
        });
        if matches!(compiled.snapshot, RunSnapshot::Program(_)) {
            context.capabilities.insert(crate::program::ProgramRoot {
                thread_id: context.thread_id.clone(),
                run_id: context.run_id.clone(),
            });
        }
        context
            .capabilities
            .insert(crate::events::EventSinkBinding(Arc::new(
                DurableEventSink {
                    store: self.store.clone(),
                    identity: identity.clone(),
                },
            )));
        let observer = Arc::new(TreeObserver {
            store: self.store.clone(),
            identity,
        });
        if input.resume {
            if let Some(receipt) = observer
                .reconciliation_input(&context, &compiled.agent)
                .await?
            {
                context.capabilities.insert(receipt);
            }
        }
        context
            .capabilities
            .insert(crate::composition::ChildObserverBinding(observer));
        context.cancel = context.cancel.child_token();
        let guarded = Arc::new(self.store.guarded(lease));
        context
            .capabilities
            .insert(crate::mailbox::RequiredMailbox(guarded.clone()));
        context
            .capabilities
            .insert(crate::governance::SupervisedBudgetBackend {
                root_run_id: context.run_id.clone(),
                store: guarded.clone(),
            });
        let controllers = crate::controllers::ControllerBinding::new(
            guarded.clone(),
            compiled.agent.composition_identity(),
            &context,
        );
        let accepted = async {
            if let Some(command) = input.retry_model.as_ref() {
                controllers.accepted(command).await?;
                if command.ticket.run_id != context.run_id
                    || command.ticket.thread_id != context.thread_id
                {
                    self.authorize_child_retry(
                        compiled,
                        &context,
                        command,
                        &controllers,
                        guarded.clone(),
                    )
                    .await?;
                    input.retry_model = None;
                }
            }
            if let Some(command) = &cancel_request {
                self.authorize_child_cancel(
                    compiled,
                    &context,
                    command,
                    &controllers,
                    guarded.clone(),
                )
                .await?;
            }
            Ok::<(), Error>(())
        }
        .await;
        if let Err(error) = accepted {
            if let Some(previous) = previous_record {
                self.store.finish_run(lease, previous).await?;
            }
            return Err(error);
        }
        use crate::mailbox::InputInbox;
        let acknowledgments = async {
            for cancellation in controllers.cancel_inputs().await? {
                guarded
                    .acknowledge_cancel(&cancellation.address, cancellation.through)
                    .await?;
            }
            Ok::<(), Error>(())
        }
        .await;
        let result = match acknowledgments {
            Err(error) => Err(error),
            Ok(()) => {
                context.capabilities.insert(controllers);
                compiled
                    .agent
                    .clone()
                    .with_checkpointer(guarded)
                    .invoke(input, context)
                    .await
            }
        };
        match &result {
            Ok(outcome) => {
                record.status = outcome_status(outcome).into();
                record.outcome = Some(outcome.clone());
            }
            Err(error) => {
                record.status = "failed".into();
                record.error = Some(error.to_string());
            }
        }
        self.store.finish_run(lease, record).await?;
        result
    }
}
