//! A park is a separate durable control fact, never a rewritten execution
//! snapshot. Only the original root fence can certify or release its boundary.
use super::*;
use rusqlite::Transaction;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ParkStatus {
    Requested,
    Parked,
    Released,
    Rejected,
}
impl ParkStatus {
    fn as_str(&self) -> &'static str {
        match self {
            Self::Requested => "requested",
            Self::Parked => "parked",
            Self::Released => "released",
            Self::Rejected => "rejected",
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ParkReceipt {
    pub checkpoint_revision: u64,
    pub checkpoint_digest: String,
    pub parked_at_ms: u64,
    /// Pending work is retained; only the original budget may be amended.
    #[serde(default, skip_serializing_if = "is_false")]
    pub budget_suspended: bool,
}
fn is_false(value: &bool) -> bool {
    !*value
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ParkRecord {
    pub schema_version: u32,
    pub command_id: String,
    pub run_id: String,
    pub thread_id: String,
    pub submission_digest: String,
    pub composition_digest: String,
    pub status: ParkStatus,
    pub receipt: Option<ParkReceipt>,
    pub released_by: Option<String>,
}

pub(super) fn read(tx: &Transaction<'_>, id: &str) -> Result<Option<ParkRecord>, Error> {
    let row: Option<(String, String, String, String)> = tx
        .query_row(
            "SELECT run_id,thread_key,status,payload FROM agent_runtime_parks WHERE command_id=?1",
            [id],
            |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?)),
        )
        .optional()
        .map_err(db_error)?;
    row.map(|(run, key, status, payload)| {
        let record: ParkRecord = serde_json::from_str(&payload).map_err(db_error)?;
        let (_, hash, saved, _) =
            load(tx, &run)?.ok_or_else(|| Error::Checkpoint("park job missing".into()))?;
        if record.schema_version != 1
            || record.command_id != id
            || record.run_id != run
            || record.thread_id != saved.submission.thread_id
            || record.submission_digest != hash
            || record.composition_digest != saved.submission.composition_digest
            || key != saved.submission.thread_key()
            || status != record.status.as_str()
            || (record.status == ParkStatus::Parked && record.receipt.is_none())
        {
            return Err(Error::Checkpoint("park identity changed".into()));
        }
        Ok(record)
    })
    .transpose()
}

fn save(tx: &Transaction<'_>, record: &ParkRecord) -> Result<(), Error> {
    let changed = tx
        .execute(
            "UPDATE agent_runtime_parks SET status=?1,payload=?2 WHERE command_id=?3",
            params![
                record.status.as_str(),
                serde_json::to_string(record).map_err(db_error)?,
                record.command_id
            ],
        )
        .map_err(db_error)?;
    if changed != 1 {
        return Err(Error::Checkpoint("park disappeared".into()));
    }
    Ok(())
}

pub(super) fn abandon(tx: &Transaction<'_>, run: &str) -> Result<(), Error> {
    let id: Option<String> = tx.query_row(
        "SELECT command_id FROM agent_runtime_parks WHERE run_id=?1 AND status IN ('requested','parked')",
        [run], |r| r.get(0),
    ).optional().map_err(db_error)?;
    if let Some(id) = id {
        let mut record =
            read(tx, &id)?.ok_or_else(|| Error::Checkpoint("park disappeared".into()))?;
        record.status = ParkStatus::Rejected;
        save(tx, &record)?;
    }
    Ok(())
}

pub(in crate::supervisor) fn ensure_not_parked(
    tx: &Transaction<'_>,
    key: &str,
) -> Result<(), Error> {
    let parked: bool = tx.query_row(
        "SELECT EXISTS(SELECT 1 FROM agent_runtime_parks WHERE thread_key=?1 AND status='parked')",
        [key], |r| r.get(0),
    ).map_err(db_error)?;
    if parked {
        return Err(Error::Checkpoint(
            "thread is parked; explicitly unpark before resuming".into(),
        ));
    }
    Ok(())
}

pub(super) fn admit(tx: &Transaction<'_>, action: &ManagedAction) -> Result<(), Error> {
    match &action.command {
        ManagedCommand::Park => {
            let (_, hash, saved, status) = load(tx, &action.run_id)?
                .ok_or_else(|| Error::Checkpoint("park job missing".into()))?;
            if !saved.submission.snapshot.is_agent() {
                return Err(Error::Composition(
                    "parking currently requires a root Agent program".into(),
                ));
            }
            let snapshot = match &saved.submission.snapshot {
                RunSnapshot::Agent(snapshot) => snapshot,
                RunSnapshot::Program(snapshot) => {
                    let crate::program::ProgramSnapshot::Agent { snapshot } = &snapshot.program
                    else {
                        return Err(Error::Composition(
                            "parking requires an Agent snapshot".into(),
                        ));
                    };
                    snapshot
                }
            };
            let journal = snapshot.modules.iter().any(|module| {
                module.factory.factory == "binding.model_journal"
                    && snapshot
                        .agent
                        .bindings
                        .contains(&module.definition.reference)
            });
            if snapshot.required_governance.is_empty()
                && snapshot.agent.governance.is_empty()
                && !journal
            {
                return Err(Error::Composition(
                    "parking requires declared governance or binding.model_journal to retain model dispatch evidence".into(),
                ));
            }
            if matches!(status.as_str(), "closed" | "cancelled" | "abandoned") {
                return Err(Error::Checkpoint("park requires an unfinished run".into()));
            }
            let key = saved.submission.thread_key();
            ensure_thread_open(tx, &key)?;
            let owner: Option<String> = tx
                .query_row(
                    "SELECT active_run FROM agent_runtime_threads WHERE key=?1",
                    [&key],
                    |r| r.get(0),
                )
                .optional()
                .map_err(db_error)?;
            if owner.as_deref() != Some(&action.run_id) {
                return Err(Error::Checkpoint("park no longer owns the thread".into()));
            }
            let record = ParkRecord {
                schema_version: 1,
                command_id: action.command_id.clone(),
                run_id: action.run_id.clone(),
                thread_id: saved.submission.thread_id,
                submission_digest: hash,
                composition_digest: saved.submission.composition_digest,
                status: ParkStatus::Requested,
                receipt: None,
                released_by: None,
            };
            tx.execute(
                "INSERT INTO agent_runtime_parks(command_id,run_id,thread_key,status,payload) VALUES(?1,?2,?3,'requested',?4)",
                params![record.command_id, record.run_id, key, serde_json::to_string(&record).map_err(db_error)?],
            ).map_err(db_error)?;
        }
        ManagedCommand::Unpark { park_command_id } => {
            let record = read(tx, park_command_id)?
                .ok_or_else(|| Error::Checkpoint("park request missing".into()))?;
            if record.run_id != action.run_id {
                return Err(Error::Checkpoint("unpark targets another run".into()));
            }
        }
        _ => {}
    }
    Ok(())
}

pub(super) fn safe(state: &RunState) -> bool {
    !state.complete && !state.has_pending_work() && state.hook_progress.prepared_tool.is_none()
}

pub(super) fn finish_action(
    tx: &Transaction<'_>,
    id: &str,
    result: ActionResult,
) -> Result<(), Error> {
    let changed = tx.execute(
        "UPDATE agent_runtime_managed_actions SET result=?1 WHERE command_id=?2 AND result IS NULL",
        params![serde_json::to_string(&result).map_err(db_error)?, id],
    ).map_err(db_error)?;
    if changed != 1 {
        return Err(Error::Checkpoint("park command receipt changed".into()));
    }
    Ok(())
}

fn confirm(
    tx: &Transaction<'_>,
    lease: &Lease,
    id: &str,
    expected: Option<(u64, String)>,
    now: u64,
) -> Result<Option<RunOutcome>, Error> {
    let mut park = read(tx, id)?.ok_or_else(|| Error::Checkpoint("park request missing".into()))?;
    if park.status != ParkStatus::Requested {
        return Ok(None);
    }
    ensure_thread_open(tx, &lease.key)?;
    let (_, hash, saved, status) =
        load(tx, &park.run_id)?.ok_or_else(|| Error::Checkpoint("park job missing".into()))?;
    if matches!(status.as_str(), "closed" | "cancelled" | "abandoned") {
        return Err(Error::Checkpoint(
            "run ended before a park boundary was reached".into(),
        ));
    }
    let owner: String = tx
        .query_row(
            "SELECT active_run FROM agent_runtime_threads WHERE key=?1",
            [&lease.key],
            |r| r.get(0),
        )
        .map_err(db_error)?;
    if owner != park.run_id || saved.submission.thread_key() != lease.key {
        return Err(Error::Checkpoint("park lost thread ownership".into()));
    }
    let checkpoint: Option<(u64, String)> = tx
        .query_row(
            "SELECT revision,payload FROM agent_runtime_checkpoints WHERE key=?1",
            [&lease.key],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )
        .optional()
        .map_err(db_error)?;
    let Some((revision, payload)) = checkpoint else {
        return Ok(None);
    };
    let checkpoint: crate::Checkpoint = serde_json::from_str(&payload).map_err(db_error)?;
    if checkpoint.version != 1
        || checkpoint.revision != revision
        || digest(checkpoint.composition.as_bytes()) != park.composition_digest
        || checkpoint.state.execution_run_id.as_deref() != Some(&park.run_id)
        || checkpoint.state.input_progress.initial.as_ref() != Some(&saved.proof()?)
        || expected.is_some_and(|(r, state)| {
            r != revision || content_digest(&checkpoint.state).ok().as_ref() != Some(&state)
        })
    {
        return Err(Error::Checkpoint(
            "park checkpoint identity/revision changed".into(),
        ));
    }
    let root: String = tx
        .query_row(
            "SELECT payload FROM agent_runtime_runs WHERE id=?1",
            [&park.run_id],
            |r| r.get(0),
        )
        .map_err(db_error)?;
    let mut root: ExecutionRecord = serde_json::from_str(&root).map_err(db_error)?;
    if root.thread_id != park.thread_id
        || root.submission.as_deref() != Some(&hash)
        || root.composition != checkpoint.composition
        || serde_json::to_value(&root.snapshot).map_err(db_error)?
            != serde_json::to_value(&saved.submission.snapshot).map_err(db_error)?
    {
        return Err(Error::Checkpoint("park execution identity changed".into()));
    }
    let budget_suspended = !safe(&checkpoint.state);
    if budget_suspended {
        // A stopped worker's durable outcome certifies quiescence, not the
        // success or absence of any pending effect. Those intents stay intact.
        let Some(RunOutcome::BudgetExceeded { state }) = &root.outcome else {
            return Ok(None);
        };
        if status != "waiting"
            || root.status != "budget_exceeded"
            || (checkpoint.state.complete && !checkpoint.state.has_pending_work())
            || content_digest(state)? != content_digest(&checkpoint.state)?
        {
            return Ok(None);
        }
    }
    park.status = ParkStatus::Parked;
    park.receipt = Some(ParkReceipt {
        checkpoint_revision: revision,
        checkpoint_digest: digest(payload.as_bytes()),
        parked_at_ms: now,
        budget_suspended,
    });
    let outcome = RunOutcome::Paused {
        reason: serde_json::json!({"kind":"parked","parking":park}),
        state: checkpoint.state,
    };
    root.status = "paused".into();
    root.outcome = Some(outcome.clone());
    root.error = None;
    save(tx, &park)?;
    tx.execute(
        "UPDATE agent_runtime_runs SET payload=?1 WHERE id=?2",
        params![serde_json::to_string(&root).map_err(db_error)?, park.run_id],
    )
    .map_err(db_error)?;
    tx.execute(
        "UPDATE agent_runtime_jobs SET status='waiting' WHERE run_id=?1",
        [&park.run_id],
    )
    .map_err(db_error)?;
    finish_action(
        tx,
        id,
        ActionResult {
            outcome: Some(outcome.clone()),
            error: None,
            abandonment: None,
        },
    )?;
    Ok(Some(outcome))
}

/// Private capability restored after user bindings. Descendants may carry it,
/// but only the original root identity can certify this checkpoint.
#[derive(Clone)]
pub(crate) struct ParkBinding {
    store: SqliteStore,
    lease: Lease,
    run_id: String,
    thread_id: String,
}
impl ParkBinding {
    pub(crate) fn new(store: SqliteStore, lease: Lease, context: &RunContext) -> Self {
        Self {
            store,
            lease,
            run_id: context.run_id.clone(),
            thread_id: context.thread_id.clone(),
        }
    }
    pub(crate) async fn at_boundary(
        &self,
        context: &RunContext,
        state: &RunState,
        revision: Option<u64>,
    ) -> Result<Option<RunOutcome>, Error> {
        if context.run_id != self.run_id || context.thread_id != self.thread_id || !safe(state) {
            return Ok(None);
        }
        let Some(revision) = revision else {
            return Ok(None);
        };
        let expected = content_digest(state)?;
        let lease = self.lease.clone();
        let root = self.run_id.clone();
        let clock = self.store.clock.clone();
        self.store.transaction(move |tx| {
            check_lease(tx, &lease, clock.now_ms())?;
            let id: Option<String> = tx.query_row("SELECT command_id FROM agent_runtime_parks WHERE run_id=?1 AND status='requested'", [root], |r| r.get(0)).optional().map_err(db_error)?;
            let outcome = match id { Some(id) => confirm(tx, &lease, &id, Some((revision, expected)), clock.now_ms()), None => Ok(None) }?;
            check_lease(tx, &lease, clock.now_ms())?;
            Ok(outcome)
        }).await
    }
}

impl SqliteStore {
    /// Latest request, including released/rejected history. The original
    /// action ID and immutable receipt remain available after later requests.
    pub async fn parking(&self, run_id: &str) -> Result<Option<ParkRecord>, Error> {
        let run = run_id.to_owned();
        self.transaction(move |tx| {
            let id: Option<String> = tx.query_row("SELECT command_id FROM agent_runtime_parks WHERE run_id=?1 ORDER BY rowid DESC LIMIT 1", [run], |r| r.get(0)).optional().map_err(db_error)?;
            id.map(|id| read(tx, &id)).transpose().map(Option::flatten)
        }).await
    }
}

fn apply(
    tx: &Transaction<'_>,
    lease: &Lease,
    action: &ManagedAction,
    now: u64,
) -> Result<(), Error> {
    ensure_thread_open(tx, &lease.key)?;
    match &action.command {
        ManagedCommand::Park => {
            confirm(tx, lease, &action.command_id, None, now)?;
        }
        ManagedCommand::Unpark { park_command_id } => {
            let mut park = read(tx, park_command_id)?
                .ok_or_else(|| Error::Checkpoint("park missing".into()))?;
            let (_, _, saved, _) = load(tx, &action.run_id)?
                .ok_or_else(|| Error::Checkpoint("unpark job missing".into()))?;
            if park.run_id != action.run_id || saved.submission.thread_key() != lease.key {
                return Err(Error::Checkpoint("unpark identity changed".into()));
            }
            if park.status == ParkStatus::Parked {
                let owner: String = tx
                    .query_row(
                        "SELECT active_run FROM agent_runtime_threads WHERE key=?1",
                        [&lease.key],
                        |r| r.get(0),
                    )
                    .map_err(db_error)?;
                let (revision, payload): (u64, String) = tx
                    .query_row(
                        "SELECT revision,payload FROM agent_runtime_checkpoints WHERE key=?1",
                        [&lease.key],
                        |r| Ok((r.get(0)?, r.get(1)?)),
                    )
                    .map_err(db_error)?;
                let (expected_revision, expected_digest) = transition::park_checkpoint(tx, &park)?;
                if owner != park.run_id
                    || revision != expected_revision
                    || digest(payload.as_bytes()) != expected_digest
                {
                    return Err(Error::Checkpoint(
                        "parked checkpoint changed; explicit repair is required".into(),
                    ));
                }
            }
            if matches!(park.status, ParkStatus::Requested | ParkStatus::Parked) {
                let pending = park.status == ParkStatus::Requested;
                park.status = ParkStatus::Released;
                park.released_by = Some(action.command_id.clone());
                save(tx, &park)?;
                if pending {
                    finish_action(
                        tx,
                        park_command_id,
                        ActionResult {
                            outcome: None,
                            error: Some("park request released before its boundary".into()),
                            abandonment: None,
                        },
                    )?;
                }
            }
            finish_action(
                tx,
                &action.command_id,
                ActionResult {
                    outcome: None,
                    error: None,
                    abandonment: None,
                },
            )?;
        }
        _ => return Err(Error::Checkpoint("not a parking command".into())),
    }
    Ok(())
}

impl RunSupervisor {
    pub(super) async fn parking_action(
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
        let check = lease.clone();
        let id = record.action.command_id.clone();
        let clock = self.store.clock.clone();
        let result = self.store.transaction(move |tx| {
            check_lease(tx, &check, clock.now_ms())?;
            let current = actions::read(tx, &id)?.ok_or_else(|| Error::Checkpoint("park command missing".into()))?;
            if current.finished { return Ok(current); }
            let earlier: bool = tx.query_row(
                "SELECT EXISTS(SELECT 1 FROM agent_runtime_managed_actions WHERE run_id=?1 AND command_id!=?2 AND result IS NULL AND json_extract(payload,'$.command.kind')!='park' AND (?4 OR sequence<?3 OR json_extract(payload,'$.command.kind')='abandon'))",
                params![current.action.run_id, id, current.sequence, matches!(current.action.command, ManagedCommand::Park)], |r| r.get(0),
            ).map_err(db_error)?;
            if earlier { return Err(Error::Checkpoint("earlier management command is pending".into())); }
            tx.execute_batch("SAVEPOINT parking_action").map_err(db_error)?;
            if let Err(error) = apply(tx, &check, &current.action, clock.now_ms()) {
                tx.execute_batch("ROLLBACK TO parking_action; RELEASE parking_action").map_err(db_error)?;
                if matches!(current.action.command, ManagedCommand::Park)
                    && let Some(mut park) = read(tx, &id)?
                    && park.status == ParkStatus::Requested
                { park.status = ParkStatus::Rejected; save(tx, &park)?; }
                finish_action(tx, &id, ActionResult { outcome: None, error: Some(error.to_string().chars().take(8192).collect()), abandonment: None })?;
            } else {
                tx.execute_batch("RELEASE parking_action").map_err(db_error)?;
            }
            check_lease(tx, &check, clock.now_ms())?;
            actions::read(tx, &id)?.ok_or_else(|| Error::Checkpoint("park command disappeared".into()))
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
