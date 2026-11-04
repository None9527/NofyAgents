//! Explicit, immutable thread enrollment. Current ownership remains in the
//! original thread table; only the fenced private backend gets a ledger alias.
use super::*;
pub(super) mod handoff;
pub(in crate::supervisor) mod profiles;
pub use handoff::{SessionSeedInfo, SessionTurnAdmission, SessionTurnCommand, SessionTurnInput};
pub use profiles::admission::SessionPolicyEpoch;
pub use profiles::{
    SessionChange, SessionCommand, SessionCommandError, SessionPlan, SessionPlanView,
    SessionPolicySelection, SessionReceipt, SessionRoute, SessionRouteView, SessionStart,
    SessionState,
};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SessionRequest {
    pub id: String,
    pub root_run_id: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SessionRecord {
    pub protocol: String,
    pub id: String,
    pub root_run_id: String,
    pub budget_root_run_id: String,
    pub agent_name: String,
    pub thread_id: String,
    pub system: String,
    pub program: String,
    pub release: String,
    pub created_at_ms: u64,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SessionView {
    pub session: SessionRecord,
    pub active_run_id: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SessionTurn {
    pub sequence: u64,
    pub run_id: String,
    pub submission_digest: String,
    pub admitted_at_ms: u64,
    pub status: JobStatus,
}

#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Binding {
    session: SessionRecord,
    thread_key: String,
    submission_digest: String,
    composition_digest: String,
    snapshot_digest: String,
}

fn page(limit: usize) -> Result<(), Error> {
    if !(1..=256).contains(&limit) {
        return Err(Error::Composition(
            "session page limit must be 1..=256".into(),
        ));
    }
    Ok(())
}

fn read(tx: &rusqlite::Transaction<'_>, id: &str) -> Result<Option<Binding>, Error> {
    let row: Option<(String, String, String)> = tx
        .query_row(
            "SELECT thread_key,digest,payload FROM agent_runtime_sessions WHERE id=?1",
            [id],
            |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
        )
        .optional()
        .map_err(db_error)?;
    row.map(|(key, hash, payload)| {
        let binding: Binding = serde_json::from_str(&payload).map_err(db_error)?;
        let s = &binding.session;
        if !matches!(s.protocol.as_str(), "nofy.session/v1" | "nofy.session/v2")
            || s.id != id
            || key != binding.thread_key
            || key != crate::state::checkpoint_key(&s.agent_name, &s.thread_id)
            || s.budget_root_run_id != s.root_run_id
            || content_digest(&binding)? != hash
        {
            return Err(Error::Checkpoint("session identity changed".into()));
        }
        let (_, original, saved, _) = load(tx, &s.root_run_id)?
            .ok_or_else(|| Error::Checkpoint("session origin job missing".into()))?;
        if original != binding.submission_digest
            || saved.submission.thread_key() != key
            || saved.submission.composition_digest != binding.composition_digest
            || content_digest(&saved.submission.snapshot)? != binding.snapshot_digest
        {
            return Err(Error::Checkpoint("session origin proof changed".into()));
        }
        Ok(binding)
    })
    .transpose()
}

fn view(tx: &rusqlite::Transaction<'_>, binding: Binding) -> Result<SessionView, Error> {
    let active_run_id = tx
        .query_row(
            "SELECT active_run FROM agent_runtime_threads WHERE key=?1",
            [&binding.thread_key],
            |r| r.get(0),
        )
        .optional()
        .map_err(db_error)?;
    Ok(SessionView {
        session: binding.session,
        active_run_id,
    })
}

fn member(
    tx: &rusqlite::Transaction<'_>,
    binding: &Binding,
    run: &str,
    now: u64,
) -> Result<(), Error> {
    let (sequence, hash, saved, _) = load(tx, run)?
        .ok_or_else(|| Error::Checkpoint("session requires a frozen submitted job".into()))?;
    compatible(binding, &saved)?;
    tx.execute("INSERT INTO agent_runtime_session_turns(run_id,session_id,sequence,submission_digest,admitted_at_ms) VALUES(?1,?2,?3,?4,?5) ON CONFLICT(run_id) DO NOTHING",
        params![run,binding.session.id,sequence,hash,now]).map_err(db_error)?;
    let (id, old_sequence, old_hash): (String, u64, String) = tx.query_row(
        "SELECT session_id,sequence,submission_digest FROM agent_runtime_session_turns WHERE run_id=?1", [run],
        |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
    ).map_err(db_error)?;
    if id != binding.session.id || old_sequence != sequence || old_hash != hash {
        return Err(Error::Checkpoint("session turn admission changed".into()));
    }
    Ok(())
}

fn compatible(binding: &Binding, saved: &Saved) -> Result<(), Error> {
    if !saved.submission.snapshot.is_agent()
        || saved.submission.thread_key() != binding.thread_key
        || saved.submission.composition_digest != binding.composition_digest
        || content_digest(&saved.submission.snapshot)? != binding.snapshot_digest
    {
        return Err(Error::Composition(
            "session configuration changed; explicit version handoff required".into(),
        ));
    }
    Ok(())
}

/// A NextTurn has no independent managed request. An explicit session can
/// authorize only its exact original frozen configuration, never arbitrary
/// uploaded floors. Final membership/ownership still commits under the lease.
pub(super) async fn restore_authority(
    store: &SqliteStore,
    job: &ExecutionJobRecord,
) -> Result<bool, Error> {
    let job = job.clone();
    store
        .transaction(move |tx| {
            let id: Option<String> = tx
                .query_row(
                    "SELECT id FROM agent_runtime_sessions WHERE thread_key=?1",
                    [job.submission.thread_key()],
                    |r| r.get(0),
                )
                .optional()
                .map_err(db_error)?;
            let Some(id) = id else {
                return Ok(false);
            };
            let binding =
                read(tx, &id)?.ok_or_else(|| Error::Checkpoint("session disappeared".into()))?;
            let (_, hash, saved, _) = load(tx, &job.submission.run_id)?
                .ok_or_else(|| Error::Checkpoint("session job disappeared".into()))?;
            if hash != job.digest
                || content_digest(&saved.submission)? != content_digest(&job.submission)?
            {
                return Err(Error::Checkpoint(
                    "session restore submission changed".into(),
                ));
            }
            compatible(&binding, &saved)?;
            Ok(true)
        })
        .await
}

/// Called in begin_run's root-lease transaction, before any runtime dispatch.
pub(in crate::supervisor) fn bind_session(
    tx: &rusqlite::Transaction<'_>,
    lease: &Lease,
    record: &ExecutionRecord,
    now: u64,
) -> Result<String, Error> {
    check_lease(tx, lease, now)?;
    let id: Option<String> = tx
        .query_row(
            "SELECT id FROM agent_runtime_sessions WHERE thread_key=?1",
            [&lease.key],
            |r| r.get(0),
        )
        .optional()
        .map_err(db_error)?;
    let Some(id) = id else {
        return Ok(record.run_id.clone());
    };
    let binding = read(tx, &id)?.ok_or_else(|| Error::Checkpoint("session disappeared".into()))?;
    let (_, hash, saved, _) = load(tx, &record.run_id)?
        .ok_or_else(|| Error::Checkpoint("session run requires a submitted job".into()))?;
    if record.submission.as_ref() != Some(&hash)
        || record.thread_id != saved.submission.thread_id
        || digest(record.composition.as_bytes()) != binding.composition_digest
        || content_digest(&record.snapshot)? != binding.snapshot_digest
    {
        return Err(Error::Checkpoint("session run identity changed".into()));
    }
    profiles::admission::guard(tx, &binding, &record.run_id, &hash)?;
    member(tx, &binding, &record.run_id, now)?;
    Ok(binding.session.budget_root_run_id)
}

pub(super) fn budget_root(
    tx: &rusqlite::Transaction<'_>,
    run: &str,
    thread_key: &str,
) -> Result<String, Error> {
    let session: Option<String> = tx
        .query_row(
            "SELECT id FROM agent_runtime_sessions WHERE thread_key=?1",
            [thread_key],
            |row| row.get(0),
        )
        .optional()
        .map_err(db_error)?;
    let Some(session) = session else {
        return Ok(run.to_owned());
    };
    let binding =
        read(tx, &session)?.ok_or_else(|| Error::Checkpoint("budget session missing".into()))?;
    let (sequence, hash, saved, _) =
        load(tx, run)?.ok_or_else(|| Error::Checkpoint("budget root submission missing".into()))?;
    compatible(&binding, &saved)?;
    let member: (String, u64, String) = tx.query_row("SELECT session_id,sequence,submission_digest FROM agent_runtime_session_turns WHERE run_id=?1", [run], |row| Ok((row.get(0)?,row.get(1)?,row.get(2)?))).map_err(db_error)?;
    if member != (session, sequence, hash) {
        return Err(Error::Checkpoint(
            "budget session membership changed".into(),
        ));
    }
    Ok(binding.session.budget_root_run_id)
}

fn enroll(
    tx: &rusqlite::Transaction<'_>,
    request: SessionRequest,
    check: &Lease,
    now: u64,
) -> Result<Binding, Error> {
    check_lease(tx, check, now)?;
    if let Some(old) = read(tx, &request.id)? {
        if old.session.root_run_id != request.root_run_id {
            return Err(Error::Checkpoint(
                "session ID reused with a different root".into(),
            ));
        }
        return Ok(old);
    }
    ensure_thread_open(tx, &check.key)?;
    let (_, hash, saved, state) = load(tx, &request.root_run_id)?
        .ok_or_else(|| Error::Checkpoint("session origin job missing".into()))?;
    let managed = read_request(tx, &request.root_run_id)?
        .ok_or_else(|| Error::Composition("session origin must be a managed Agent".into()))?;
    if saved.submission.thread_key() != check.key
        || !saved.submission.snapshot.is_agent()
        || state == "cancelled"
        || state == "abandoned"
    {
        return Err(Error::Composition("invalid session origin".into()));
    }
    let conflict: bool = tx.query_row("SELECT EXISTS(SELECT 1 FROM agent_runtime_sessions WHERE thread_key=?1) OR EXISTS(SELECT 1 FROM agent_runtime_runs WHERE thread_key=?1 AND id!=?2) OR EXISTS(SELECT 1 FROM agent_runtime_jobs WHERE thread_key=?1 AND run_id!=?2 AND status!='cancelled' AND sequence<(SELECT sequence FROM agent_runtime_jobs WHERE run_id=?2))",
        params![check.key,request.root_run_id], |r| r.get(0)).map_err(db_error)?;
    if conflict {
        return Err(Error::Checkpoint("session requires an unclaimed thread and its first root; existing budgets cannot be merged".into()));
    }
    let binding = Binding {
        session: SessionRecord {
            protocol: "nofy.session/v2".into(),
            id: request.id,
            root_run_id: request.root_run_id.clone(),
            budget_root_run_id: request.root_run_id,
            agent_name: saved.submission.snapshot.name().into(),
            thread_id: saved.submission.thread_id,
            system: managed.system,
            program: managed.program,
            release: managed.release,
            created_at_ms: now,
        },
        thread_key: check.key.clone(),
        submission_digest: hash,
        composition_digest: saved.submission.composition_digest,
        snapshot_digest: content_digest(&saved.submission.snapshot)?,
    };
    tx.execute(
        "INSERT INTO agent_runtime_sessions(id,thread_key,digest,payload) VALUES(?1,?2,?3,?4)",
        params![
            binding.session.id,
            binding.thread_key,
            content_digest(&binding)?,
            serde_json::to_string(&binding).map_err(db_error)?
        ],
    )
    .map_err(db_error)?;
    member(tx, &binding, &binding.session.root_run_id, now)?;
    check_lease(tx, check, now)?;
    Ok(binding)
}

impl RunSupervisor {
    /// Enroll the exact original first root, preserving its ledger and input.
    pub async fn create_session(&self, request: SessionRequest) -> Result<SessionView, Error> {
        bounded_name(&request.id)?;
        bounded_name(&request.root_run_id)?;
        if let Some(old) = self.store.session(&request.id).await? {
            if old.session.root_run_id != request.root_run_id {
                return Err(Error::Checkpoint(
                    "session ID reused with a different root".into(),
                ));
            }
            return Ok(old);
        }
        let job = self
            .store
            .execution_job(&request.root_run_id)
            .await?
            .ok_or_else(|| Error::Checkpoint("session origin job missing".into()))?;
        let managed = self
            .store
            .managed_run(&request.root_run_id)
            .await?
            .ok_or_else(|| Error::Composition("session origin must be a managed Agent".into()))?;
        let snapshot = crate::session_policy::agent_snapshot(&job.submission.snapshot)
            .ok_or_else(|| Error::Composition("session origin must be an Agent".into()))?;
        let frozen =
            crate::session_policy::Frozen::from_snapshot(snapshot, &managed.request.release)?;
        let now = self.store.clock.now_ms();
        let input = profiles::make_input(
            crate::session_policy::Phase::Create,
            None,
            None,
            Some(request.id.clone()),
            content_digest(&request)?,
            Default::default(),
            now,
        );
        let proposal = self
            .evaluate_policy(frozen.as_ref(), input.clone(), None)
            .await?;
        if proposal.decision != crate::session_policy::Decision::Allow {
            return Err(Error::Composition(format!(
                "policy_rejected: {}",
                proposal.reason
            )));
        }
        let lease = self
            .store
            .acquire(
                job.submission.thread_key(),
                nofy_tool_protocol::ToolCallId::new_v7().to_string(),
                self.ttl,
            )
            .await?;
        let check = lease.clone();
        let expected = job.digest;
        let clock = self.store.clock.clone();
        let result = self
            .store
            .transaction(move |tx| {
                if let Some(old) = read(tx, &request.id)? {
                    if old.session.root_run_id != request.root_run_id {
                        return Err(Error::Checkpoint(
                            "session ID reused with a different root".into(),
                        ));
                    }
                    return view(tx, old);
                }
                if load(tx, &request.root_run_id)?.is_none_or(|(_, hash, _, _)| hash != expected) {
                    return Err(Error::Checkpoint("session origin changed".into()));
                }
                let binding = enroll(tx, request, &check, clock.now_ms())?;
                profiles::install(
                    tx,
                    &binding,
                    frozen,
                    Default::default(),
                    input,
                    proposal,
                    now,
                )?;
                check_lease(tx, &check, clock.now_ms())?;
                view(tx, binding)
            })
            .await;
        let released = self.store.release(&lease).await;
        match result {
            Ok(v) => {
                released?;
                Ok(v)
            }
            Err(e) => Err(e),
        }
    }
}

impl SqliteStore {
    pub async fn session(&self, id: &str) -> Result<Option<SessionView>, Error> {
        bounded_name(id)?;
        let id = id.to_owned();
        self.transaction(move |tx| read(tx, &id)?.map(|s| view(tx, s)).transpose())
            .await
    }

    pub async fn sessions(&self, after: &str, limit: usize) -> Result<Vec<SessionView>, Error> {
        if !after.is_empty() {
            bounded_name(after)?;
        }
        page(limit)?;
        let after = after.to_owned();
        self.transaction(move |tx| {
            let mut q = tx
                .prepare("SELECT id FROM agent_runtime_sessions WHERE id>?1 ORDER BY id LIMIT ?2")
                .map_err(db_error)?;
            let ids = q
                .query_map(params![after, limit], |r| r.get::<_, String>(0))
                .map_err(db_error)?
                .collect::<Result<Vec<_>, _>>()
                .map_err(db_error)?;
            ids.into_iter()
                .map(|id| {
                    read(tx, &id)?
                        .ok_or_else(|| Error::Checkpoint("session disappeared".into()))
                        .and_then(|b| view(tx, b))
                })
                .collect()
        })
        .await
    }

    pub async fn session_turns(
        &self,
        id: &str,
        after: u64,
        limit: usize,
    ) -> Result<Vec<SessionTurn>, Error> {
        bounded_name(id)?;
        page(limit)?;
        let after = i64::try_from(after).map_err(db_error)?;
        let id = id.to_owned();
        self.transaction(move |tx| {
            let binding = read(tx, &id)?.ok_or_else(|| Error::Checkpoint("session not found".into()))?;
            let mut q = tx.prepare("SELECT t.sequence,t.run_id,t.submission_digest,t.admitted_at_ms,j.status,j.digest,j.sequence,j.thread_key FROM agent_runtime_session_turns t LEFT JOIN agent_runtime_jobs j ON j.run_id=t.run_id WHERE t.session_id=?1 AND t.sequence>?2 ORDER BY t.sequence LIMIT ?3").map_err(db_error)?;
            q.query_map(params![id,after,limit], |r| Ok((r.get::<_,u64>(0)?,r.get::<_,String>(1)?,r.get::<_,String>(2)?,r.get::<_,u64>(3)?,r.get::<_,String>(4)?,r.get::<_,String>(5)?,r.get::<_,u64>(6)?,r.get::<_,String>(7)?)))
                .map_err(db_error)?.map(|row| {
                    let (sequence,run_id,submission_digest,admitted_at_ms,state,hash,job_sequence,thread) = row.map_err(db_error)?;
                    if submission_digest != hash || sequence != job_sequence || thread != binding.thread_key {
                        return Err(Error::Checkpoint("session turn proof changed".into()));
                    }
                    Ok(SessionTurn { sequence,run_id,submission_digest,admitted_at_ms,status: status(&state)? })
                }).collect()
        }).await
    }
}
