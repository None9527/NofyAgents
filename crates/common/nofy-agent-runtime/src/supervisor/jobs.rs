//! Persist accepted inputs before starting execution. Agent jobs retain one
//! composition per runtime thread; configuration changes use a new thread.
use super::*;
mod initial;
mod lifecycle;
mod worker;
use initial::{reject_stale, settle_source};
pub(super) use lifecycle::{finish, validate_begin};
mod managed;
#[cfg(feature = "workflow")]
pub use managed::{HumanRecoveryPage, HumanRecoveryTarget};
mod replay;
mod submission;
use crate::mailbox::{
    InitialInputBinding, InitialInputProof, InitialInputReceipt, InputAddress, MailEnvelope,
    MailInput,
};
pub(in crate::supervisor) use managed::ensure_thread_open;
pub(crate) use managed::parking::ParkBinding;
pub(in crate::supervisor) use managed::parking::ensure_not_parked;
pub use managed::parking::{ParkReceipt, ParkRecord, ParkStatus};
pub(in crate::supervisor) use managed::sessions::bind_session;
pub(in crate::supervisor) use managed::sessions::profiles::admission::finish as session_finished;
pub use managed::sessions::{
    ForkSource, SessionBranch, SessionChange, SessionCommand, SessionCommandError, SessionFork,
    SessionPlan, SessionPlanView, SessionPolicyEpoch, SessionPolicySelection, SessionReceipt,
    SessionRecord, SessionRequest, SessionRoute, SessionRouteView, SessionSeedInfo, SessionStart,
    SessionState, SessionTurn, SessionTurnAdmission, SessionTurnCommand, SessionTurnInput,
    SessionView,
};
pub(in crate::supervisor) use managed::transition::ensure_live_owner;
pub(in crate::supervisor) use managed::transition::verify_plan;
pub use managed::transition::{LiveExecution, LiveModuleState, LiveVersionInfo, ModuleUpdate};
pub use managed::{
    Abandonment, ManagedAction, ManagedActionRecord, ManagedCommand, ManagedRun, ManagedRunRequest,
};
use nofy_interjection_core::PendingInterjection;
use sha2::{Digest, Sha256};
pub use submission::{
    ExecutionJobRecord, ExecutionSubmission, JobRecord, JobStatus, JobSubmission, ProgramJobRecord,
    ProgramSubmission,
};

fn digest(bytes: &[u8]) -> String {
    format!("{:x}", Sha256::digest(bytes))
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Source {
    address: InputAddress,
    input_id: String,
    sequence: u64,
    digest: String,
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Saved {
    submission: ExecutionSubmission,
    source: Option<Source>,
}
impl Saved {
    fn digest(&self) -> Result<String, Error> {
        Ok(digest(&serde_json::to_vec(self).map_err(db_error)?))
    }
    fn proof(&self) -> Result<InitialInputProof, Error> {
        Ok(InitialInputProof {
            run_id: self.submission.run_id.clone(),
            thread_id: self.submission.thread_id.clone(),
            digest: self.digest()?,
        })
    }
}
fn status(value: &str) -> Result<JobStatus, Error> {
    match value {
        "queued" => Ok(JobStatus::Queued),
        "initializing" => Ok(JobStatus::Initializing),
        "running" => Ok(JobStatus::Running),
        "waiting" => Ok(JobStatus::Waiting),
        "closed" => Ok(JobStatus::Closed),
        "cancelled" => Ok(JobStatus::Cancelled),
        "abandoned" => Ok(JobStatus::Abandoned),
        _ => Err(Error::Checkpoint("unknown job status".into())),
    }
}
fn insert(
    tx: &rusqlite::Transaction<'_>,
    saved: Saved,
    now: u64,
) -> Result<ExecutionJobRecord, Error> {
    saved.submission.validate()?;
    let hash = saved.digest()?;
    let submission = &saved.submission;
    let thread = submission.thread_key();
    let previous: Option<(u64, String, String)> = tx
        .query_row(
            "SELECT sequence,digest,status FROM agent_runtime_jobs WHERE run_id=?1",
            [&submission.run_id],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
        )
        .optional()
        .map_err(db_error)?;
    if let Some((sequence, old, state)) = previous {
        if old != hash {
            return Err(Error::Checkpoint(
                "job run ID reused with different submission".into(),
            ));
        }
        return Ok(JobRecord {
            sequence,
            digest: hash,
            submission: saved.submission,
            status: status(&state)?,
        });
    }
    ensure_thread_open(tx, &thread)?;
    let exists: bool = tx
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM agent_runtime_runs WHERE id=?1)",
            [&submission.run_id],
            |row| row.get(0),
        )
        .map_err(db_error)?;
    if exists {
        return Err(Error::Checkpoint(
            "job run ID already belongs to a run".into(),
        ));
    }
    let checkpoint: Option<String> = tx
        .query_row(
            "SELECT payload FROM agent_runtime_checkpoints WHERE key=?1",
            [&thread],
            |row| row.get(0),
        )
        .optional()
        .map_err(db_error)?;
    if let Some(checkpoint) = checkpoint {
        let checkpoint: crate::Checkpoint = serde_json::from_str(&checkpoint).map_err(db_error)?;
        if digest(checkpoint.composition.as_bytes()) != submission.composition_digest {
            return Err(Error::Composition(
                "runtime thread composition changed; start a new thread".into(),
            ));
        }
    }
    let queued:Option<String>=tx.query_row("SELECT payload FROM agent_runtime_jobs WHERE thread_key=?1 AND status!='cancelled' ORDER BY sequence LIMIT 1",[&thread],|row|row.get(0)).optional().map_err(db_error)?;
    if let Some(queued) = queued {
        let queued: Saved = serde_json::from_str(&queued).map_err(db_error)?;
        if queued.submission.composition_digest != submission.composition_digest {
            return Err(Error::Composition(
                "thread already has a different submitted composition".into(),
            ));
        }
    }
    let (pending,bytes):(u64,u64)=tx.query_row("SELECT COUNT(*),COALESCE(SUM(length(CAST(payload AS BLOB))),0) FROM agent_runtime_jobs WHERE thread_key=?1 AND status NOT IN ('closed','cancelled','abandoned')",[&thread],|row|Ok((row.get(0)?,row.get(1)?))).map_err(db_error)?;
    let payload = serde_json::to_string(&saved).map_err(db_error)?;
    if pending >= 1024 || bytes.saturating_add(payload.len() as u64) > 32 * 1024 * 1024 {
        return Err(Error::Checkpoint(
            "thread job queue capacity exceeded".into(),
        ));
    }
    managed::sessions::profiles::admission::enqueue(tx, &saved, now)?;
    tx.execute("INSERT INTO agent_runtime_jobs(run_id,thread_key,digest,payload,status,source_sequence) VALUES(?1,?2,?3,?4,'queued',?5)",params![submission.run_id,thread,hash,payload,saved.source.as_ref().map(|source|source.sequence)]).map_err(db_error)?;
    Ok(JobRecord {
        sequence: u64::try_from(tx.last_insert_rowid()).map_err(db_error)?,
        digest: hash,
        submission: saved.submission,
        status: JobStatus::Queued,
    })
}
pub(crate) fn enqueue_next_turn(
    tx: &rusqlite::Transaction<'_>,
    envelope: &MailEnvelope,
    sequence: u64,
    input_digest: &str,
    now: u64,
) -> Result<(), Error> {
    let MailInput::NextTurn {
        run_id,
        snapshot,
        message,
    } = &envelope.input
    else {
        return Ok(());
    };
    let payload: String = tx
        .query_row(
            "SELECT payload FROM agent_runtime_runs WHERE id=?1",
            [&envelope.address.root_run_id],
            |row| row.get(0),
        )
        .map_err(db_error)?;
    let root: ExecutionRecord = serde_json::from_str(&payload).map_err(db_error)?;
    let submission = ExecutionSubmission::next_turn(
        root.snapshot,
        run_id.clone(),
        envelope.address.thread_id.clone(),
        snapshot.clone(),
        digest(root.composition.as_bytes()),
        message.clone(),
    )?;
    insert(
        tx,
        Saved {
            submission,
            source: Some(Source {
                address: envelope.address.clone(),
                input_id: envelope.input_id.clone(),
                sequence,
                digest: input_digest.into(),
            }),
        },
        now,
    )?;
    Ok(())
}
impl RunSupervisor {
    pub async fn submit(&self, submission: JobSubmission) -> Result<JobRecord, Error> {
        submission.validate()?;
        let now = self.store.clock.now_ms();
        self.store
            .transaction(move |tx| {
                insert(
                    tx,
                    Saved {
                        submission: submission.stored(),
                        source: None,
                    },
                    now,
                )
            })
            .await?
            .legacy()
    }
    pub async fn submit_program(
        &self,
        submission: ProgramSubmission,
    ) -> Result<ProgramJobRecord, Error> {
        submission.validate()?;
        let now = self.store.clock.now_ms();
        self.store
            .transaction(move |tx| {
                insert(
                    tx,
                    Saved {
                        submission: submission.stored(),
                        source: None,
                    },
                    now,
                )
            })
            .await?
            .program()
    }
}
impl SqliteStore {
    pub async fn job(&self, run_id: &str) -> Result<Option<JobRecord>, Error> {
        self.execution_job(run_id)
            .await?
            .map(ExecutionJobRecord::legacy)
            .transpose()
    }
    pub async fn program_job(&self, run_id: &str) -> Result<Option<ProgramJobRecord>, Error> {
        self.execution_job(run_id)
            .await?
            .map(ExecutionJobRecord::program)
            .transpose()
    }
    pub async fn execution_job(&self, run_id: &str) -> Result<Option<ExecutionJobRecord>, Error> {
        let run_id = run_id.to_string();
        self.transaction(move |tx| {
            let row: Option<(u64, String, String, String)> = tx
                .query_row(
                    "SELECT sequence,digest,payload,status FROM agent_runtime_jobs WHERE run_id=?1",
                    [run_id],
                    |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?)),
                )
                .optional()
                .map_err(db_error)?;
            row.map(|(sequence, hash, payload, state)| {
                let saved: Saved = serde_json::from_str(&payload).map_err(db_error)?;
                if saved.digest()? != hash {
                    return Err(Error::Checkpoint("job submission digest mismatch".into()));
                }
                saved.submission.validate()?;
                Ok(JobRecord {
                    sequence,
                    digest: hash,
                    submission: saved.submission,
                    status: status(&state)?,
                })
            })
            .transpose()
        })
        .await
    }
}

fn load(
    tx: &rusqlite::Transaction<'_>,
    run_id: &str,
) -> Result<Option<(u64, String, Saved, String)>, Error> {
    let row: Option<(u64, String, String, String)> = tx
        .query_row(
            "SELECT sequence,digest,payload,status FROM agent_runtime_jobs WHERE run_id=?1",
            [run_id],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?)),
        )
        .optional()
        .map_err(db_error)?;
    row.map(|(sequence, hash, payload, state)| {
        let saved: Saved = serde_json::from_str(&payload).map_err(db_error)?;
        if saved.digest()? != hash {
            return Err(Error::Checkpoint("job submission digest mismatch".into()));
        }
        saved.submission.validate()?;
        Ok((sequence, hash, saved, state))
    })
    .transpose()
}
#[derive(Clone)]
struct Admission(InitialInputProof);
struct InitialReceipt {
    store: SqliteStore,
    lease: Lease,
    saved: Saved,
}
impl RunSupervisor {
    pub(super) async fn attach_job(
        &self,
        compiled: &ExecutionPlan,
        input: &RunInput,
        context: &mut RunContext,
        lease: &Lease,
    ) -> Result<Option<String>, Error> {
        let run = context.run_id.clone();
        let lease_check = lease.clone();
        let clock = self.store.clock.clone();
        let saved = self
            .store
            .transaction(move |tx| {
                check_lease(tx, &lease_check, clock.now_ms())?;
                load(tx, &run)
            })
            .await?;
        let Some((_, hash, saved, state)) = saved else {
            return Ok(None);
        };
        if state == "cancelled" || state == "abandoned" {
            return Err(Error::Checkpoint("job was cancelled or abandoned".into()));
        }
        if saved.submission.thread_id != context.thread_id
            || saved.submission.composition_digest
                != digest(compiled.agent.composition_identity().as_bytes())
            || serde_json::to_value(&saved.submission.snapshot).map_err(db_error)?
                != serde_json::to_value(&compiled.snapshot).map_err(db_error)?
        {
            return Err(Error::Checkpoint(
                "job configuration/identity changed".into(),
            ));
        }
        let proof = saved.proof()?;
        let checkpoint = self.store.guarded(lease).load(&lease.key).await?;
        let initialized = checkpoint.as_ref().is_some_and(|checkpoint| {
            checkpoint.state.input_progress.initial.as_ref() == Some(&proof)
        });
        if !input.resume
            && !context
                .capabilities
                .get::<Admission>()
                .is_some_and(|admission| admission.0 == proof)
        {
            return Err(Error::Checkpoint(
                "submitted job must start through the job worker".into(),
            ));
        }
        if input.resume && !initialized {
            return Err(Error::Checkpoint(
                "job initialization must continue through the job worker".into(),
            ));
        }
        let receipt = Arc::new(InitialReceipt {
            store: self.store.clone(),
            lease: lease.clone(),
            saved,
        });
        if initialized {
            receipt.acknowledge().await?;
        }
        context.capabilities.insert(InitialInputBinding(receipt));
        Ok(Some(hash))
    }
}
