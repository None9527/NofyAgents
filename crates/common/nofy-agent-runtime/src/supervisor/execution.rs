use super::*;
use std::sync::atomic::{AtomicBool, Ordering};
use tokio_util::sync::CancellationToken;

const RENEW_TRANSIENT_RETRIES: usize = 3;
const LEASE_LOSS_DRAIN_TIMEOUT: Duration = Duration::from_secs(5);

pub(super) type ActionSettler = Box<
    dyn FnOnce(
            &rusqlite::Transaction<'_>,
            Result<RunOutcome, String>,
        ) -> Result<jobs::ManagedActionRecord, Error>
        + Send,
>;

pub(super) enum ManagedActionExecution {
    Settled(Box<jobs::ManagedActionRecord>),
    Unsettled(Box<Result<RunOutcome, Error>>),
}

fn is_transient_renew_error(error: &Error) -> bool {
    let Error::Checkpoint(message) = error else {
        return false;
    };
    let Some(sqlite_message) = message.strip_prefix("sqlite: ") else {
        return false;
    };
    let lower = sqlite_message.to_ascii_lowercase();
    lower.contains("database is locked")
        || lower.contains("database table is locked")
        || lower.contains("database file is locked")
        || lower.contains("database is busy")
        || lower.contains("sqlite_busy")
        || lower.contains("sqlite_locked")
        || lower.contains("locking protocol")
}

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
            session_registry: None,
        }
    }
    pub fn with_session_registry(mut self, registry: crate::registry::ModuleRegistry) -> Self {
        self.session_registry = Some(Arc::new(registry));
        self
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
            || (compiled.effective_snapshot().is_agent()
                && !input.resume
                && input.prompt.is_none()
                && input.content.is_none())
            || (!compiled.effective_snapshot().is_agent()
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
    pub(super) async fn run_leased<T, F>(
        &self,
        lease: &Lease,
        cancel: CancellationToken,
        lease_lost: Arc<AtomicBool>,
        future: F,
    ) -> Result<T, Error>
    where
        F: std::future::Future<Output = Result<T, Error>>,
    {
        self.run_leased_with_drain_timeout(
            lease,
            cancel,
            lease_lost,
            LEASE_LOSS_DRAIN_TIMEOUT,
            future,
        )
        .await
    }
    async fn run_leased_with_drain_timeout<T, F>(
        &self,
        lease: &Lease,
        cancel: CancellationToken,
        lease_lost: Arc<AtomicBool>,
        drain_timeout: Duration,
        future: F,
    ) -> Result<T, Error>
    where
        F: std::future::Future<Output = Result<T, Error>>,
    {
        tokio::pin!(future);
        let mut ticker = tokio::time::interval(self.ttl / 3);
        ticker.set_missed_tick_behavior(tokio::time::MissedTickBehavior::Delay);
        ticker.tick().await;
        let retry_delay =
            (self.ttl / 12).clamp(Duration::from_millis(5), Duration::from_millis(100));
        loop {
            tokio::select! {
                biased;
                _ = ticker.tick() => {
                    let mut attempts = 0usize;
                    let renew_error = loop {
                        let renew = self.store.renew(lease, self.ttl);
                        tokio::pin!(renew);
                        let renew_result = tokio::select! {
                            biased;
                            result = &mut future => return result,
                            renew_result = &mut renew => renew_result,
                        };
                        match renew_result {
                            Ok(()) => break None,
                            Err(error)
                                if is_transient_renew_error(&error)
                                    && attempts < RENEW_TRANSIENT_RETRIES =>
                            {
                                attempts += 1;
                                let delay = tokio::time::sleep(retry_delay);
                                tokio::pin!(delay);
                                tokio::select! {
                                    biased;
                                    result = &mut future => return result,
                                    _ = &mut delay => {}
                                }
                            }
                            Err(error) => break Some(error),
                        }
                    };
                    if let Some(error) = renew_error {
                        lease_lost.store(true, Ordering::SeqCst);
                        cancel.cancel();
                        let _ = tokio::time::timeout(drain_timeout, &mut future).await;
                        return Err(error);
                    }
                }
                result = &mut future => return result,
            }
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
        let lease_lost = Arc::new(AtomicBool::new(false));
        self.run_leased(lease, cancel, lease_lost.clone(), async {
            match self
                .execute_leased_inner(compiled, input, context, lease, None, lease_lost)
                .await?
            {
                ManagedActionExecution::Unsettled(result) => *result,
                ManagedActionExecution::Settled(_) => Err(Error::Checkpoint(
                    "unmanaged execution returned a managed action receipt".into(),
                )),
            }
        })
        .await
    }
    pub(super) async fn execute_leased_for_action(
        &self,
        compiled: &ExecutionPlan,
        input: RunInput,
        context: RunContext,
        lease: &Lease,
        action_settler: ActionSettler,
        lease_lost: Arc<AtomicBool>,
    ) -> Result<ManagedActionExecution, Error> {
        self.execute_leased_inner(
            compiled,
            input,
            context,
            lease,
            Some(action_settler),
            lease_lost,
        )
        .await
    }
    async fn finish_run_with_action(
        &self,
        lease: &Lease,
        record: ExecutionRecord,
        settler: ActionSettler,
        execution: Result<RunOutcome, Error>,
    ) -> Result<jobs::ManagedActionRecord, Error> {
        let lease = lease.clone();
        let clock = self.store.clock.clone();
        let action_outcome = execution.map_err(|error| error.to_string());
        self.store
            .transaction(move |tx| {
                let now = clock.now_ms();
                check_lease(tx, &lease, now)?;
                let payload = serde_json::to_string(&record).map_err(db_error)?;
                let changed = tx
                    .execute(
                        "UPDATE agent_runtime_runs SET payload=?1 WHERE id=?2 AND thread_key=?3",
                        params![payload, record.run_id, lease.key],
                    )
                    .map_err(db_error)?;
                if changed != 1 {
                    return Err(Error::Checkpoint("missing run receipt".into()));
                }
                jobs::finish(tx, &lease, &record, now)?;
                jobs::session_finished(tx, &lease.key, now)?;
                settler(tx, action_outcome)
            })
            .await
    }
    async fn execute_leased_inner(
        &self,
        compiled: &ExecutionPlan,
        mut input: RunInput,
        mut context: RunContext,
        lease: &Lease,
        action_settler: Option<ActionSettler>,
        lease_lost: Arc<AtomicBool>,
    ) -> Result<ManagedActionExecution, Error> {
        let setup = async {
            let check = lease.clone();
            let root = context.run_id.clone();
            let expected = compiled.live_identity();
            let clock = self.store.clock.clone();
            let approval_mode = self
                .store
                .transaction(move |tx| {
                    check_lease(tx, &check, clock.now_ms())?;
                    jobs::verify_plan(tx, &root, expected.as_ref())?;
                    Ok(jobs::read_managed_request(tx, &root)?
                        .and_then(|request| request.approval_mode))
                })
                .await?;
            if let Some(mode) = approval_mode {
                context.capabilities.insert(TurnApprovalPolicy {
                    store: self.store.clone(),
                    mode,
                });
            }
            let cancel_request = context
                .capabilities
                .remove::<control::PendingChildCancel>()
                .map(|command| command.0.clone());
            crate::identity::bind(&mut context, compiled.agent.spec().settings.scope_identity)?;
            let descendant_retry = input.retry_model.as_ref().is_some_and(|command| {
                command.ticket.run_id != context.run_id
                    || command.ticket.thread_id != context.thread_id
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
                return Ok(Err(outcome));
            }
            let previous_record = if input.retry_model.is_some() || cancel_request.is_some() {
                self.store.execution_record(&context.run_id).await?
            } else {
                None
            };
            let submission = self
                .attach_job(compiled, &input, &mut context, lease)
                .await?;
            self.prepare_session_policy(&context.run_id, self.session_registry.as_deref())
                .await?;
            let record = RunRecord {
                submission,
                run_id: context.run_id.clone(),
                thread_id: context.thread_id.clone(),
                snapshot: compiled.snapshot.clone(),
                composition: compiled.agent.composition_identity().to_string(),
                status: "running".into(),
                outcome: None,
                error: None,
                model_failure: None,
            };
            let ledger_root_run_id = self
                .store
                .begin_run(lease, record.clone(), input.resume)
                .await?;
            let identity = SupervisedIdentity {
                run_id: context.run_id.clone(),
                lease: lease.clone(),
            };
            context.capabilities.insert(identity.clone());
            if compiled.effective_snapshot().is_agent() {
                context.capabilities.insert(jobs::ParkBinding::new(
                    self.store.clone(),
                    lease.clone(),
                    &context,
                ));
            }
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
            if input.resume
                && let Some(receipt) = observer
                    .reconciliation_input(&context, &compiled.agent)
                    .await?
            {
                context.capabilities.insert(receipt);
            }
            context
                .capabilities
                .insert(crate::composition::ChildObserverBinding(observer));
            Ok(Ok((
                cancel_request,
                previous_record,
                record,
                ledger_root_run_id,
            )))
        }
        .await;
        let (cancel_request, previous_record, mut record, ledger_root_run_id) = match setup {
            Ok(Ok(parts)) => parts,
            Ok(Err(closed_outcome)) => {
                return Ok(ManagedActionExecution::Unsettled(Box::new(Ok(
                    closed_outcome,
                ))));
            }
            Err(error) => {
                if lease_lost.load(Ordering::SeqCst) {
                    return Err(Error::Checkpoint("lease fence lost or expired".into()));
                }
                return Ok(ManagedActionExecution::Unsettled(Box::new(Err(error))));
            }
        };
        context.cancel = context.cancel.child_token();
        let guarded = Arc::new(self.store.guarded(lease));
        context
            .capabilities
            .insert(crate::hooks::primitive::NativeControl::new(
                guarded.as_ref().clone(),
                &context.run_id,
                compiled.agent.composition_identity(),
            ));
        context
            .capabilities
            .insert(crate::mailbox::RequiredMailbox(guarded.clone()));
        context
            .capabilities
            .insert(crate::governance::SupervisedBudgetBackend {
                root_run_id: context.run_id.clone(),
                ledger_root_run_id,
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
            if lease_lost.load(Ordering::SeqCst) {
                return Err(Error::Checkpoint("lease fence lost or expired".into()));
            }
            if let Some(previous) = previous_record {
                if let Some(settler) = action_settler {
                    let settled = self
                        .finish_run_with_action(lease, previous, settler, Err(error))
                        .await?;
                    return Ok(ManagedActionExecution::Settled(Box::new(settled)));
                }
                self.store.finish_run(lease, previous).await?;
            }
            return Ok(ManagedActionExecution::Unsettled(Box::new(Err(error))));
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
                    .runtime_agent()
                    .clone()
                    .with_checkpointer(guarded)
                    .invoke(input, context)
                    .await
            }
        };
        if lease_lost.load(Ordering::SeqCst) {
            return Err(Error::Checkpoint("lease fence lost or expired".into()));
        }
        match &result {
            Ok(outcome) => {
                record.status = outcome_status(outcome).into();
                record.outcome = Some(outcome.clone());
            }
            Err(error) => {
                record.status = "failed".into();
                record.error = Some(error.to_string());
                if let Error::ModelFailure(failure) = error
                    && failure.category == crate::model::MODEL_EVALUATOR_FAILURE_CATEGORY
                {
                    record.model_failure = Some(failure.clone());
                }
            }
        }
        if let Some(settler) = action_settler {
            let settled = self
                .finish_run_with_action(lease, record, settler, result)
                .await?;
            return Ok(ManagedActionExecution::Settled(Box::new(settled)));
        }
        self.store.finish_run(lease, record).await?;
        Ok(ManagedActionExecution::Unsettled(Box::new(result)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::AtomicU64;

    struct TestClock(AtomicU64);
    impl crate::durable::Clock for TestClock {
        fn now_ms(&self) -> u64 {
            self.0.load(Ordering::SeqCst)
        }
    }

    #[test]
    fn transient_renew_error_distinguishes_sqlite_busy_from_lease_loss() {
        assert!(is_transient_renew_error(&Error::Checkpoint(
            "sqlite: database is locked".into()
        )));
        assert!(is_transient_renew_error(&Error::Checkpoint(
            "sqlite: database table is locked".into()
        )));
        assert!(is_transient_renew_error(&Error::Checkpoint(
            "sqlite: Error code 5: The database file is locked".into()
        )));
        assert!(!is_transient_renew_error(&Error::Checkpoint(
            "lease fence lost or expired".into()
        )));
        assert!(!is_transient_renew_error(&Error::Checkpoint(
            "sqlite: attempt to write a readonly database".into()
        )));
        assert!(!is_transient_renew_error(&Error::Cancelled));
    }

    #[tokio::test]
    async fn run_leased_waits_for_async_cleanup_on_lease_loss_and_bounds_stuck_futures() {
        let dir = tempfile::tempdir().unwrap();
        let clock = Arc::new(TestClock(AtomicU64::new(1000)));
        let store = SqliteStore::open_with_clock(&dir.path().join("runtime.sqlite"), clock.clone())
            .unwrap();
        let supervisor = RunSupervisor::new(store.clone())
            .with_lease_ttl(Duration::from_millis(60))
            .unwrap();

        // 1. Cooperative async cleanup completes during drain before Err is returned.
        let lease = store
            .acquire("lease-key-1", "owner-1", Duration::from_millis(60))
            .await
            .unwrap();
        let cancel = CancellationToken::new();
        let lease_lost = Arc::new(AtomicBool::new(false));
        let cleaned_up = Arc::new(AtomicBool::new(false));
        let started = Arc::new(tokio::sync::Notify::new());
        let cancel_inner = cancel.clone();
        let cleaned_inner = cleaned_up.clone();
        let started_inner = started.clone();

        let clock_trigger = clock.clone();
        let trigger = tokio::spawn(async move {
            started.notified().await;
            clock_trigger.0.store(5000, Ordering::SeqCst);
        });
        let outcome: Result<(), Error> = supervisor
            .run_leased_with_drain_timeout(
                &lease,
                cancel,
                lease_lost.clone(),
                Duration::from_secs(2),
                async move {
                    started_inner.notify_one();
                    cancel_inner.cancelled().await;
                    tokio::time::sleep(Duration::from_millis(80)).await;
                    cleaned_inner.store(true, Ordering::SeqCst);
                    Err(Error::Cancelled)
                },
            )
            .await;
        trigger.await.unwrap();
        assert!(
            matches!(outcome, Err(Error::Checkpoint(ref msg)) if msg.contains("lease fence lost or expired")),
            "{outcome:?}"
        );
        assert!(lease_lost.load(Ordering::SeqCst));
        assert!(cleaned_up.load(Ordering::SeqCst));

        // 2. Unresponsive future is bounded by the drain timeout and still returns lease loss.
        clock.0.store(10_000, Ordering::SeqCst);
        let lease2 = store
            .acquire("lease-key-2", "owner-2", Duration::from_millis(60))
            .await
            .unwrap();
        let cancel2 = CancellationToken::new();
        let lease_lost2 = Arc::new(AtomicBool::new(false));
        let started2 = Arc::new(tokio::sync::Notify::new());
        let started2_inner = started2.clone();
        let clock_trigger2 = clock.clone();
        let trigger2 = tokio::spawn(async move {
            started2.notified().await;
            clock_trigger2.0.store(20_000, Ordering::SeqCst);
        });
        let start = std::time::Instant::now();
        let outcome2: Result<(), Error> = supervisor
            .run_leased_with_drain_timeout(
                &lease2,
                cancel2,
                lease_lost2.clone(),
                Duration::from_millis(80),
                async move {
                    started2_inner.notify_one();
                    std::future::pending::<Result<(), Error>>().await
                },
            )
            .await;
        trigger2.await.unwrap();
        assert!(
            matches!(outcome2, Err(Error::Checkpoint(ref msg)) if msg.contains("lease fence lost or expired")),
            "{outcome2:?}"
        );
        assert!(lease_lost2.load(Ordering::SeqCst));
        assert!(start.elapsed() < Duration::from_secs(2));
    }
}
