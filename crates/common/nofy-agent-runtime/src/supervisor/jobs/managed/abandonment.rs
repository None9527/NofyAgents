//! Administrative termination preserves native evidence and seals the original
//! namespace. It never restores a factory or manufactures a business outcome.
use super::*;

#[cfg(test)]
mod tests;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Abandonment {
    pub schema_version: u32,
    pub command_id: String,
    pub run_id: String,
    pub thread_id: String,
    pub reason: String,
    pub submission_digest: String,
    pub composition_digest: String,
    pub checkpoint_revision: Option<u64>,
    pub checkpoint_digest: Option<String>,
    pub checkpoint_run_id: Option<String>,
    /// Observed root checkpoint only; not a claim about every descendant.
    pub root_pending_work: bool,
    pub child_count: u64,
    pub cancelled_jobs: u64,
    pub rejected_inputs: u64,
    pub superseded_commands: u64,
    pub abandoned_at_ms: u64,
}

pub(in crate::supervisor) fn ensure_thread_open(
    tx: &rusqlite::Transaction<'_>,
    key: &str,
) -> Result<(), Error> {
    let sealed: bool = tx
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM agent_runtime_abandoned_runs WHERE thread_key=?1)",
            [key],
            |r| r.get(0),
        )
        .map_err(db_error)?;
    if sealed {
        return Err(Error::Checkpoint(
            "thread was abandoned and is sealed; choose a new thread".into(),
        ));
    }
    Ok(())
}

fn read(tx: &rusqlite::Transaction<'_>, id: &str) -> Result<Option<Abandonment>, Error> {
    let payload: Option<String> = tx
        .query_row(
            "SELECT payload FROM agent_runtime_abandoned_runs WHERE run_id=?1",
            [id],
            |r| r.get(0),
        )
        .optional()
        .map_err(db_error)?;
    payload
        .map(|s| {
            let receipt: Abandonment = serde_json::from_str(&s).map_err(db_error)?;
            if receipt.schema_version != 1 || receipt.run_id != id {
                return Err(Error::Checkpoint(
                    "abandonment receipt identity changed".into(),
                ));
            }
            Ok(receipt)
        })
        .transpose()
}

impl SqliteStore {
    pub async fn abandonment(&self, run_id: &str) -> Result<Option<Abandonment>, Error> {
        let id = run_id.to_owned();
        self.transaction(move |tx| read(tx, &id)).await
    }
}

impl RunSupervisor {
    pub(super) async fn administrative_action(
        &self,
        job: &ExecutionJobRecord,
        record: &ManagedActionRecord,
    ) -> Result<ManagedActionRecord, Error> {
        let lease = self
            .store
            .acquire(
                job.submission.thread_key(),
                nofy_tool_protocol::ToolCallId::new_v7().to_string(),
                self.ttl,
            )
            .await?;
        let id = record.action.command_id.clone();
        let check = lease.clone();
        let clock = self.store.clock.clone();
        let result = self.store.transaction(move |tx| {
            check_lease(tx, &check, clock.now_ms())?;
            let current = actions::read(tx, &id)?
                .ok_or_else(|| Error::Checkpoint("management command disappeared".into()))?;
            if current.finished { return Ok(current); }
            let earlier: bool = tx.query_row(
                "SELECT EXISTS(SELECT 1 FROM agent_runtime_managed_actions WHERE run_id=?1 AND sequence<?2 AND result IS NULL AND json_extract(payload,'$.command.kind')='abandon')",
                params![current.action.run_id, current.sequence], |r| r.get(0),
            ).map_err(db_error)?;
            if earlier { return Err(Error::Checkpoint("earlier administrative command is pending".into())); }
            // Only this SQLite-only path may roll back its work and record an
            // administrative rejection. No provider/tool IO is in this scope.
            tx.execute_batch("SAVEPOINT administrative_action").map_err(db_error)?;
            let outcome = apply(tx, &check, &current.action, clock.now_ms());
            let result = match outcome {
                Ok(result) => {
                    tx.execute_batch("RELEASE administrative_action").map_err(db_error)?;
                    result
                }
                Err(error) => {
                    tx.execute_batch("ROLLBACK TO administrative_action; RELEASE administrative_action").map_err(db_error)?;
                    ActionResult { outcome: None, error: Some(error.to_string().chars().take(8192).collect()), abandonment: None }
                }
            };
            check_lease(tx, &check, clock.now_ms())?;
            let hash = actions::action_digest(&current.action)?;
            let changed = tx.execute(
                "UPDATE agent_runtime_managed_actions SET result=?1 WHERE command_id=?2 AND digest=?3 AND result IS NULL",
                params![serde_json::to_string(&result).map_err(db_error)?, id, hash],
            ).map_err(db_error)?;
            if changed != 1 { return Err(Error::Checkpoint("management command receipt changed".into())); }
            actions::read(tx, &id)?.ok_or_else(|| Error::Checkpoint("management command disappeared".into()))
        }).await;
        let released = self.store.release(&lease).await;
        match result {
            Ok(record) => {
                released?;
                Ok(record)
            }
            Err(error) => Err(error),
        }
    }
}

fn apply(
    tx: &rusqlite::Transaction<'_>,
    lease: &Lease,
    action: &ManagedAction,
    now: u64,
) -> Result<ActionResult, Error> {
    let ManagedCommand::Abandon { reason, .. } = &action.command else {
        return Err(Error::Checkpoint(
            "run was abandoned; this management command cannot continue it".into(),
        ));
    };
    if let Some(receipt) = read(tx, &action.run_id)? {
        if receipt.reason != *reason {
            return Err(Error::Checkpoint(
                "abandonment receipt cannot be changed".into(),
            ));
        }
        return Ok(ActionResult {
            outcome: None,
            error: None,
            abandonment: Some(receipt),
        });
    }
    let (_, hash, saved, state) = load(tx, &action.run_id)?
        .ok_or_else(|| Error::Checkpoint("management job disappeared".into()))?;
    if saved.submission.thread_key() != lease.key {
        return Err(Error::Checkpoint(
            "abandonment lease identity changed".into(),
        ));
    }
    let payload: String = tx
        .query_row(
            "SELECT payload FROM agent_runtime_runs WHERE id=?1 AND thread_key=?2",
            params![action.run_id, lease.key],
            |r| r.get(0),
        )
        .map_err(db_error)?;
    let mut root: ExecutionRecord = serde_json::from_str(&payload).map_err(db_error)?;
    if state == "closed" {
        let outcome = super::super::replay::cached_outcome(root, &saved.submission, &hash)?;
        return Ok(ActionResult {
            outcome: Some(outcome),
            error: None,
            abandonment: None,
        });
    }
    ensure_thread_open(tx, &lease.key)?;
    let active: String = tx
        .query_row(
            "SELECT active_run FROM agent_runtime_threads WHERE key=?1",
            [&lease.key],
            |r| r.get(0),
        )
        .map_err(db_error)?;
    if active != action.run_id
        || root.run_id != action.run_id
        || root.thread_id != saved.submission.thread_id
        || root.submission.as_deref() != Some(&hash)
        || digest(root.composition.as_bytes()) != saved.submission.composition_digest
        || serde_json::to_value(&root.snapshot).map_err(db_error)?
            != serde_json::to_value(&saved.submission.snapshot).map_err(db_error)?
    {
        return Err(Error::Checkpoint(
            "abandonment root no longer owns its frozen thread".into(),
        ));
    }
    let checkpoint: Option<(u64, String)> = tx
        .query_row(
            "SELECT revision,payload FROM agent_runtime_checkpoints WHERE key=?1",
            [&lease.key],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )
        .optional()
        .map_err(db_error)?;
    let cp = checkpoint
        .as_ref()
        .map(|(revision, payload)| {
            let cp: crate::Checkpoint = serde_json::from_str(payload).map_err(db_error)?;
            if cp.version != 1 || cp.revision != *revision || cp.composition != root.composition {
                return Err(Error::Checkpoint(
                    "abandonment checkpoint metadata changed".into(),
                ));
            }
            Ok(cp)
        })
        .transpose()?;
    let mut query = tx.prepare("SELECT run_id FROM agent_runtime_jobs WHERE thread_key=?1 AND run_id!=?2 AND status NOT IN ('closed','cancelled','abandoned') ORDER BY sequence").map_err(db_error)?;
    let queued = query
        .query_map(params![lease.key, action.run_id], |r| r.get::<_, String>(0))
        .map_err(db_error)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(db_error)?;
    let rejection =
        "thread sealed by administrative abandonment; original inputs and effects retained";
    let mut rejected_inputs =
        super::super::initial::reject_for_root(tx, &action.run_id, rejection, now)?;
    for id in &queued {
        let (_, _, queued, status) =
            load(tx, id)?.ok_or_else(|| Error::Checkpoint("queued job disappeared".into()))?;
        if status != "queued" {
            return Err(Error::Checkpoint(
                "another started job still owns this thread".into(),
            ));
        }
        if let Some(source) = &queued.source {
            let pending: bool = tx.query_row("SELECT status IN ('pending','claimed') FROM agent_runtime_mailbox WHERE sequence=?1", [source.sequence], |r| r.get(0)).map_err(db_error)?;
            rejected_inputs += u64::from(pending);
        }
        settle_source(tx, &queued, Some(rejection), now)?;
        tx.execute(
            "UPDATE agent_runtime_jobs SET status='cancelled' WHERE run_id=?1",
            [id],
        )
        .map_err(db_error)?;
    }
    let superseded = ActionResult {
        outcome: None, error: Some("superseded by administrative abandonment; inspect native evidence for effects already performed".into()), abandonment: None,
    };
    let superseded_commands = tx.execute(
        "UPDATE agent_runtime_managed_actions SET result=?1 WHERE run_id=?2 AND command_id!=?3 AND result IS NULL",
        params![serde_json::to_string(&superseded).map_err(db_error)?, action.run_id, action.command_id],
    ).map_err(db_error)? as u64;
    parking::abandon(tx, &action.run_id)?;
    let child_count = tx
        .query_row(
            "SELECT COUNT(*) FROM agent_runtime_children WHERE root_id=?1",
            [&action.run_id],
            |r| r.get(0),
        )
        .map_err(db_error)?;
    let receipt = Abandonment {
        schema_version: 1,
        command_id: action.command_id.clone(),
        run_id: action.run_id.clone(),
        thread_id: root.thread_id.clone(),
        reason: reason.clone(),
        submission_digest: hash,
        composition_digest: saved.submission.composition_digest,
        checkpoint_revision: checkpoint.as_ref().map(|(revision, _)| *revision),
        checkpoint_digest: checkpoint
            .as_ref()
            .map(|(_, payload)| digest(payload.as_bytes())),
        checkpoint_run_id: cp.as_ref().and_then(|cp| cp.state.execution_run_id.clone()),
        root_pending_work: cp.as_ref().is_some_and(|cp| cp.state.has_pending_work()),
        child_count,
        cancelled_jobs: queued.len() as u64,
        rejected_inputs,
        superseded_commands,
        abandoned_at_ms: now,
    };
    tx.execute(
        "INSERT INTO agent_runtime_abandoned_runs(run_id,thread_key,payload) VALUES(?1,?2,?3)",
        params![
            action.run_id,
            lease.key,
            serde_json::to_string(&receipt).map_err(db_error)?
        ],
    )
    .map_err(db_error)?;
    // Preserve outcome as the last business observation; the administrative
    // receipt is separate and must never be deserialized as RunOutcome.
    root.status = "abandoned".into();
    tx.execute(
        "UPDATE agent_runtime_runs SET payload=?1 WHERE id=?2",
        params![
            serde_json::to_string(&root).map_err(db_error)?,
            action.run_id
        ],
    )
    .map_err(db_error)?;
    tx.execute(
        "UPDATE agent_runtime_jobs SET status='abandoned' WHERE run_id=?1",
        [&action.run_id],
    )
    .map_err(db_error)?;
    Ok(ActionResult {
        outcome: None,
        error: None,
        abandonment: Some(receipt),
    })
}
