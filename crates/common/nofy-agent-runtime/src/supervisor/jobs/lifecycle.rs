use super::*;

pub(in crate::supervisor) fn validate_begin(
    tx: &rusqlite::Transaction<'_>,
    lease: &Lease,
    record: &ExecutionRecord,
    previous: Option<&str>,
    resume: bool,
) -> Result<bool, Error> {
    ensure_live_owner(tx, &lease.key, &record.run_id, &record.snapshot)?;
    let job = load(tx, &record.run_id)?;
    let Some((_, hash, saved, state)) = job else {
        if record.submission.is_some() {
            return Err(Error::Checkpoint("missing submitted job".into()));
        }
        return Ok(false);
    };
    if record.submission.as_deref() != Some(&hash) || state == "cancelled" || state == "abandoned" {
        return Err(Error::Checkpoint(
            "submitted job start is not authorized".into(),
        ));
    }
    if let Some(previous) = previous {
        let previous: ExecutionRecord = serde_json::from_str(previous).map_err(db_error)?;
        if previous.submission != record.submission
            || previous.thread_id != record.thread_id
            || previous.composition != record.composition
            || serde_json::to_value(previous.snapshot).map_err(db_error)?
                != serde_json::to_value(&record.snapshot).map_err(db_error)?
        {
            return Err(Error::Checkpoint(
                "job initialization identity changed".into(),
            ));
        }
        let active: Option<String> = tx
            .query_row(
                "SELECT active_run FROM agent_runtime_threads WHERE key=?1",
                [&lease.key],
                |row| row.get(0),
            )
            .optional()
            .map_err(db_error)?;
        if active.as_deref() != Some(&record.run_id) {
            return Err(Error::Checkpoint("job no longer owns this thread".into()));
        }
    }
    if !resume {
        let checkpoint: Option<String> = tx
            .query_row(
                "SELECT payload FROM agent_runtime_checkpoints WHERE key=?1",
                [&lease.key],
                |row| row.get(0),
            )
            .optional()
            .map_err(db_error)?;
        if let Some(checkpoint) = checkpoint {
            let checkpoint: crate::Checkpoint =
                serde_json::from_str(&checkpoint).map_err(db_error)?;
            if checkpoint.state.input_progress.initial.as_ref() == Some(&saved.proof()?) {
                return Err(Error::Checkpoint(
                    "job input already committed; use resume".into(),
                ));
            }
        }
        tx.execute(
            "UPDATE agent_runtime_jobs SET status='initializing' WHERE run_id=?1",
            [&record.run_id],
        )
        .map_err(db_error)?;
    }
    Ok(!resume && previous.is_some())
}
pub(in crate::supervisor) fn finish(
    tx: &rusqlite::Transaction<'_>,
    lease: &Lease,
    record: &ExecutionRecord,
    now: u64,
) -> Result<(), Error> {
    let Some(expected) = &record.submission else {
        return Ok(());
    };
    let (_, hash, saved, job_state) = load(tx, &record.run_id)?
        .ok_or_else(|| Error::Checkpoint("job disappeared while finishing".into()))?;
    if *expected != hash {
        return Err(Error::Checkpoint("job receipt identity changed".into()));
    }
    let checkpoint: Option<String> = tx
        .query_row(
            "SELECT payload FROM agent_runtime_checkpoints WHERE key=?1",
            [&lease.key],
            |row| row.get(0),
        )
        .optional()
        .map_err(db_error)?;
    let checkpoint = checkpoint
        .map(|payload| serde_json::from_str::<crate::Checkpoint>(&payload).map_err(db_error))
        .transpose()?;
    let initialized = checkpoint.as_ref().is_some_and(|checkpoint| {
        checkpoint.state.input_progress.initial.as_ref()
            == Some(&saved.proof().expect("saved job digest"))
    });
    let safe = initialized
        && job_state == "running"
        && record.status != "failed"
        && checkpoint
            .as_ref()
            .is_some_and(|checkpoint| !checkpoint.state.has_pending_work());
    let state = if record.status == "paused" {
        "waiting"
    } else if record.status == "cancelled" && !initialized {
        settle_source(
            tx,
            &saved,
            Some("queued run cancelled before its initial input was applied"),
            now,
        )?;
        if let Some(source) = &saved.source {
            reject_stale(tx, &source.address, now)?;
        }
        "cancelled"
    } else if safe {
        "closed"
    } else {
        "waiting"
    };
    tx.execute(
        "UPDATE agent_runtime_jobs SET status=?1 WHERE run_id=?2",
        params![state, record.run_id],
    )
    .map_err(db_error)?;
    Ok(())
}
