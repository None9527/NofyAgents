use super::*;

impl RunSupervisor {
    pub async fn run_next(
        &self,
        registry: &crate::registry::ModuleRegistry,
        agent: &str,
        thread_id: &str,
    ) -> Result<Option<RunOutcome>, Error> {
        let thread = crate::state::checkpoint_key(agent, thread_id);
        let next=self.store.transaction(move |tx|tx.query_row(
            "SELECT run_id FROM agent_runtime_jobs WHERE thread_key=?1 AND status NOT IN ('closed','cancelled','abandoned') ORDER BY sequence LIMIT 1",
            [thread],|row|row.get::<_,String>(0),
        ).optional().map_err(db_error)).await?;
        match next {
            Some(run) => self.execute_submitted(registry, &run).await,
            None => Ok(None),
        }
    }
    /// Runs only the queue head. Suspended preceding work keeps this job queued;
    /// an already closed submission returns its recorded outcome.
    pub async fn execute_submitted(
        &self,
        registry: &crate::registry::ModuleRegistry,
        run_id: &str,
    ) -> Result<Option<RunOutcome>, Error> {
        let job = self
            .store
            .execution_job(run_id)
            .await?
            .ok_or_else(|| Error::Checkpoint("job does not exist".into()))?;
        if matches!(job.status, JobStatus::Abandoned) {
            return Err(Error::Checkpoint(
                "run was abandoned; its thread is sealed".into(),
            ));
        }
        if matches!(job.status, JobStatus::Cancelled) {
            return Ok(None);
        }
        if matches!(job.status, JobStatus::Closed) {
            let record =
                self.store.execution_record(run_id).await?.ok_or_else(|| {
                    Error::Checkpoint("closed job is missing its run receipt".into())
                })?;
            return replay::cached_outcome(record, &job.submission, &job.digest).map(Some);
        }
        let host = registry.clone();
        let submission = job.submission.clone();
        let managed = self.store.managed_run(run_id).await?.is_some();
        let compiled = tokio::task::spawn_blocking(move || {
            let scope = if managed {
                super::managed::restore_scope(&submission.snapshot, &host)?
            } else {
                host
            };
            submission.restore(&scope)
        })
        .await
        .map_err(|e| Error::Checkpoint(format!("job restore task failed: {e}")))??;
        if digest(compiled.agent.composition_identity().as_bytes())
            != job.submission.composition_digest
        {
            return Err(Error::Checkpoint(
                "job factory/resource composition changed".into(),
            ));
        }
        let lease = self
            .store
            .acquire(
                job.submission.thread_key(),
                nofy_tool_protocol::ToolCallId::new_v7().to_string(),
                self.ttl,
            )
            .await?;
        let result = self.execute_submitted_leased(&compiled, job, &lease).await;
        let released = self.store.release(&lease).await;
        match result {
            Ok(result) => {
                released?;
                Ok(result)
            }
            Err(error) => Err(error),
        }
    }
    async fn execute_submitted_leased(
        &self,
        compiled: &ExecutionPlan,
        job: ExecutionJobRecord,
        lease: &Lease,
    ) -> Result<Option<RunOutcome>, Error> {
        let root = job.submission.run_id.clone();
        let lease_check = lease.clone();
        let clock = self.store.clock.clone();
        let saved=self.store.transaction(move |tx| {
            check_lease(tx,&lease_check,clock.now_ms())?;
            let (sequence,_,saved,state)=load(tx,&root)?.ok_or_else(||Error::Checkpoint("job disappeared".into()))?;
            if state=="cancelled" || state=="closed" || state=="abandoned" {return Ok(None);}
            let head:Option<u64>=tx.query_row("SELECT sequence FROM agent_runtime_jobs WHERE thread_key=?1 AND status NOT IN ('closed','cancelled','abandoned') ORDER BY sequence LIMIT 1",[&lease_check.key],|row|row.get(0)).optional().map_err(db_error)?;
            if head!=Some(sequence){return Ok(None);}
            let active:Option<String>=tx.query_row("SELECT active_run FROM agent_runtime_threads WHERE key=?1",[&lease_check.key],|row|row.get(0)).optional().map_err(db_error)?;
            let checkpoint:Option<String>=tx.query_row("SELECT payload FROM agent_runtime_checkpoints WHERE key=?1",[&lease_check.key],|row|row.get(0)).optional().map_err(db_error)?;
            let checkpoint=checkpoint.map(|payload|serde_json::from_str::<crate::Checkpoint>(&payload).map_err(db_error)).transpose()?;
            if active.as_ref().is_some_and(|active|*active!=root) {
                let payload:String=tx.query_row("SELECT payload FROM agent_runtime_runs WHERE id=?1",[active.as_ref().expect("active run")],|row|row.get(0)).map_err(db_error)?;
                let previous:ExecutionRecord=serde_json::from_str(&payload).map_err(db_error)?;
                if matches!(previous.status.as_str(),"running"|"paused") || checkpoint.as_ref().is_some_and(|checkpoint|checkpoint.state.has_pending_work()){return Ok(None);}
            }
            let initialized=checkpoint.as_ref().is_some_and(|checkpoint|checkpoint.state.input_progress.initial.as_ref()==Some(&saved.proof().expect("saved job digest")));
            if let Some(source)=&saved.source {
                let source_state:String=tx.query_row("SELECT status FROM agent_runtime_mailbox WHERE sequence=?1 AND digest=?2",params![source.sequence,source.digest],|row|row.get(0)).map_err(db_error)?;
                if source_state=="rejected" {return Err(Error::Checkpoint("queued source input was rejected".into()));}
                if !initialized {
                    reject_stale(tx,&source.address,clock.now_ms())?;
                    let first:Option<u64>=tx.query_row("SELECT sequence FROM agent_runtime_mailbox WHERE address=?1 AND status IN ('pending','claimed') ORDER BY sequence LIMIT 1",[source.address.key()?],|row|row.get(0)).optional().map_err(db_error)?;
                    if first!=Some(source.sequence){return Ok(None);}
                    tx.execute("UPDATE agent_runtime_mailbox SET status='claimed' WHERE sequence=?1",[source.sequence]).map_err(db_error)?;
                }
            }
            tx.execute("UPDATE agent_runtime_jobs SET status='initializing' WHERE run_id=?1",[&root]).map_err(db_error)?;
            Ok(Some((saved,initialized)))
        }).await?;
        let Some((saved, initialized)) = saved else {
            return Ok(None);
        };
        let mut context = RunContext::new(&saved.submission.thread_id, &saved.submission.run_id);
        let input = if initialized {
            RunInput::resume()
        } else {
            context.capabilities.insert(Admission(saved.proof()?));
            saved.submission.initial_input()
        };
        self.invoke_plan_leased(compiled, input, context, lease)
            .await
            .map(Some)
    }
    /// Cancels a submission that has not acquired a worker or created a run.
    pub async fn cancel_submitted(&self, run_id: &str) -> Result<(), Error> {
        let run = run_id.to_string();
        let clock = self.store.clock.clone();
        self.store
            .transaction(move |tx| {
                let (_, _, saved, state) = load(tx, &run)?
                    .ok_or_else(|| Error::Checkpoint("job does not exist".into()))?;
                if state == "cancelled" {
                    return Ok(());
                }
                let exists: bool = tx
                    .query_row(
                        "SELECT EXISTS(SELECT 1 FROM agent_runtime_runs WHERE id=?1)",
                        [&run],
                        |row| row.get(0),
                    )
                    .map_err(db_error)?;
                if state != "queued" || exists {
                    return Err(Error::Checkpoint(
                        "job already has a worker; cancel its run instead".into(),
                    ));
                }
                settle_source(
                    tx,
                    &saved,
                    Some("queued run cancelled before it started"),
                    clock.now_ms(),
                )?;
                tx.execute(
                    "UPDATE agent_runtime_jobs SET status='cancelled' WHERE run_id=?1",
                    [run],
                )
                .map_err(db_error)?;
                Ok(())
            })
            .await
    }
}
