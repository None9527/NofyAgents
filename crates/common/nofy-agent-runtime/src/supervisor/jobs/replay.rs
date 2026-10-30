//! Closed submissions are immutable readbacks, even through the direct
//! execution/control entry. Runtime deadlines cannot rewrite a settled result.
use super::*;

pub(super) fn cached_outcome(
    record: ExecutionRecord,
    submission: &ExecutionSubmission,
    hash: &str,
) -> Result<RunOutcome, Error> {
    if record.submission.as_deref() != Some(hash)
        || record.run_id != submission.run_id
        || record.thread_id != submission.thread_id
        || digest(record.composition.as_bytes()) != submission.composition_digest
        || serde_json::to_value(&record.snapshot).map_err(db_error)?
            != serde_json::to_value(&submission.snapshot).map_err(db_error)?
    {
        return Err(Error::Checkpoint(
            "closed job receipt identity changed".into(),
        ));
    }
    let outcome = record
        .outcome
        .ok_or_else(|| Error::Checkpoint("closed job has no outcome".into()))?;
    if record.status != outcome_status(&outcome) || record.error.is_some() {
        return Err(Error::Checkpoint("closed job result/status changed".into()));
    }
    Ok(outcome)
}

impl RunSupervisor {
    pub(in crate::supervisor) async fn closed_job(
        &self,
        compiled: &ExecutionPlan,
        input: &RunInput,
        context: &RunContext,
        lease: &Lease,
        cancellation: Option<&ChildCancelResumeCommand>,
    ) -> Result<Option<RunOutcome>, Error> {
        let root = context.run_id.clone();
        let thread = context.thread_id.clone();
        let snapshot = serde_json::to_value(&compiled.snapshot).map_err(db_error)?;
        let composition = compiled.agent.composition_identity().to_string();
        let lease_check = lease.clone();
        let clock = self.store.clock.clone();
        let result = self
            .store
            .transaction(move |tx| {
                check_lease(tx, &lease_check, clock.now_ms())?;
                let Some((_, hash, saved, state)) = load(tx, &root)? else {
                    return Ok(None);
                };
                if state != "closed" {
                    return Ok(None);
                };
                let active: String = tx
                    .query_row(
                        "SELECT active_run FROM agent_runtime_threads WHERE key=?1",
                        [&lease_check.key],
                        |row| row.get(0),
                    )
                    .map_err(db_error)?;
                let payload: String = tx
                    .query_row(
                        "SELECT payload FROM agent_runtime_runs WHERE id=?1",
                        [&root],
                        |row| row.get(0),
                    )
                    .map_err(db_error)?;
                let record: ExecutionRecord = serde_json::from_str(&payload).map_err(db_error)?;
                if active != root
                    || record.thread_id != thread
                    || record.composition != composition
                    || serde_json::to_value(&record.snapshot).map_err(db_error)? != snapshot
                {
                    return Err(Error::Checkpoint(
                        "closed job no longer owns this runtime thread/composition".into(),
                    ));
                }
                cached_outcome(record, &saved.submission, &hash).map(Some)
            })
            .await?;
        let Some(outcome) = result else {
            return Ok(None);
        };
        if !input.resume
            || input.reconciled.is_some()
            || (input.retry_model.is_some() && input.resume_cancel_through.is_some())
        {
            return Err(Error::Checkpoint(
                "closed job accepts cached resume or an already accepted control command".into(),
            ));
        }
        let guarded = Arc::new(self.store.guarded(lease));
        let controllers = crate::controllers::ControllerBinding::new(
            guarded.clone(),
            compiled.agent.composition_identity(),
            context,
        );
        if let Some(command) = &input.retry_model {
            let child = controllers.accepted(command).await?;
            let accepted = if command.ticket.run_id == context.run_id
                && command.ticket.thread_id == context.thread_id
            {
                crate::governance::ModelRecovery::new(
                    guarded.clone(),
                    compiled.agent.composition_identity(),
                    context,
                )
                .accepted(command)
                .await?
            } else {
                child
            };
            if !accepted {
                return Err(Error::Checkpoint(
                    "closed job cannot accept a new model retry".into(),
                ));
            }
        }
        if let Some(command) = cancellation {
            if !controllers.accepted_cancel(command).await? {
                return Err(Error::Checkpoint(
                    "closed job cannot accept a new cancel resume".into(),
                ));
            }
        }
        if let Some(through) = input.resume_cancel_through {
            use crate::mailbox::InputInbox;
            guarded
                .acknowledge_cancel(
                    &InputAddress {
                        root_run_id: context.run_id.clone(),
                        run_id: context.run_id.clone(),
                        thread_id: context.thread_id.clone(),
                        agent: compiled.agent.spec().name.clone(),
                    },
                    through,
                )
                .await?;
        }
        Ok(Some(outcome))
    }
}
