//! Every queue ingress freezes one policy input before the job can dispatch.
use super::*;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub(super) struct Intent {
    pub session_id: String,
    pub run_id: String,
    pub job_digest: String,
    pub policy_revision: u64,
    pub policy: Option<policy::Frozen>,
    pub input: policy::Input,
    pub proposal: Option<policy::Proposal>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SessionPolicyEpoch {
    pub policy_revision: u64,
    pub binding_digest: String,
}
pub(super) fn read_intent(
    tx: &rusqlite::Transaction<'_>,
    run: &str,
) -> Result<Option<Intent>, Error> {
    let row: Option<(String,String,String)> = tx.query_row(
        "SELECT session_id,digest,payload FROM agent_runtime_session_admissions WHERE run_id=?1", [run],
        |r| Ok((r.get(0)?,r.get(1)?,r.get(2)?))).optional().map_err(db_error)?;
    row.map(|(session, hash, payload)| {
        let i: Intent = serde_json::from_str(&payload).map_err(db_error)?;
        if i.run_id != run || i.session_id != session || content_digest(&i)? != hash {
            return Err(Error::Checkpoint(
                "session admission identity changed".into(),
            ));
        }
        if let Some(p) = &i.proposal {
            p.validate(&i.input)?;
        }
        Ok(i)
    })
    .transpose()
}
pub(super) fn save_intent(tx: &rusqlite::Transaction<'_>, i: &Intent) -> Result<(), Error> {
    tx.execute("INSERT INTO agent_runtime_session_admissions(run_id,session_id,digest,payload) VALUES(?1,?2,?3,?4) ON CONFLICT(run_id) DO UPDATE SET digest=excluded.digest,payload=excluded.payload",
        params![i.run_id,i.session_id,content_digest(i)?,serde_json::to_string(i).map_err(db_error)?]).map_err(db_error)?;
    Ok(())
}
pub(in crate::supervisor) fn enqueue(
    tx: &rusqlite::Transaction<'_>,
    saved: &Saved,
    now: u64,
) -> Result<(), Error> {
    let id: Option<String> = tx
        .query_row(
            "SELECT id FROM agent_runtime_sessions WHERE thread_key=?1",
            [saved.submission.thread_key()],
            |r| r.get(0),
        )
        .optional()
        .map_err(db_error)?;
    let Some(id) = id else {
        return Ok(());
    };
    let binding = read(tx, &id)?.ok_or_else(|| Error::Checkpoint("session disappeared".into()))?;
    let mut p = profile(tx, &binding)?;
    open(&p)?;
    if let Some(old) = read_intent(tx, &saved.submission.run_id)? {
        if old.job_digest != saved.digest()? {
            return Err(Error::Checkpoint("session queued intent changed".into()));
        }
        return Ok(());
    }
    let mut summary = state(tx, &binding, &p)?.summary();
    summary.busy |= summary.has_queued_input;
    let input = make_input(
        policy::Phase::AdmitTurn,
        Some(&p),
        Some(summary),
        Some(id.clone()),
        saved.digest()?,
        p.labels.clone(),
        now,
    );
    save_intent(
        tx,
        &Intent {
            session_id: id,
            run_id: saved.submission.run_id.clone(),
            job_digest: saved.digest()?,
            policy_revision: p.policy_revision,
            policy: p.policy.clone(),
            input,
            proposal: None,
        },
    )?;
    p.idle_since_ms = None;
    save_profile(tx, &p)
}
pub(super) fn enroll_intents(
    tx: &rusqlite::Transaction<'_>,
    binding: &Binding,
    p: &Profile,
    input: policy::Input,
    proposal: policy::Proposal,
    now: u64,
) -> Result<(), Error> {
    let (_, hash, _, _) = load(tx, &binding.session.root_run_id)?
        .ok_or_else(|| Error::Checkpoint("session origin missing".into()))?;
    save_intent(
        tx,
        &Intent {
            session_id: p.session_id.clone(),
            run_id: binding.session.root_run_id.clone(),
            job_digest: hash,
            policy_revision: p.policy_revision,
            policy: p.policy.clone(),
            input,
            proposal: Some(proposal),
        },
    )?;
    let mut q=tx.prepare("SELECT payload FROM agent_runtime_jobs WHERE thread_key=?1 AND run_id!=?2 AND status NOT IN ('closed','cancelled','abandoned') ORDER BY sequence").map_err(db_error)?;
    let pending = q
        .query_map(
            params![binding.thread_key, binding.session.root_run_id],
            |r| r.get::<_, String>(0),
        )
        .map_err(db_error)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(db_error)?;
    for payload in pending {
        let saved: Saved = serde_json::from_str(&payload).map_err(db_error)?;
        enqueue(tx, &saved, now)?;
    }
    Ok(())
}
pub(in crate::supervisor) fn epoch(
    tx: &rusqlite::Transaction<'_>,
    run: &str,
) -> Result<Option<SessionPolicyEpoch>, Error> {
    let Some(i) = read_intent(tx, run)? else {
        return Ok(None);
    };
    if i.policy.is_none() {
        return Ok(None);
    }
    Ok(Some(SessionPolicyEpoch {
        policy_revision: i.policy_revision,
        binding_digest: content_digest(&(&i.policy, &i.input))?,
    }))
}
pub(in crate::supervisor::jobs::managed::sessions) fn guard(
    tx: &rusqlite::Transaction<'_>,
    binding: &Binding,
    run: &str,
    hash: &str,
) -> Result<(), Error> {
    let p = profile(tx, binding)?;
    let started: bool = tx
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM agent_runtime_runs WHERE id=?1)",
            [run],
            |r| r.get(0),
        )
        .map_err(db_error)?;
    if !started {
        open(&p)?;
    }
    let Some(i) = read_intent(tx, run)? else {
        if p.policy.is_none() {
            return Ok(());
        }
        return Err(policy::invalid("missing frozen session admission"));
    };
    if i.session_id != binding.session.id
        || i.job_digest != hash
        || (!started && i.policy_revision != p.policy_revision)
    {
        return Err(Error::Checkpoint(
            "session admission version changed".into(),
        ));
    }
    let proposal = i
        .proposal
        .ok_or_else(|| policy::invalid("session policy evaluation required"))?;
    if proposal.decision != policy::Decision::Allow {
        return Err(Error::Composition(format!(
            "policy_rejected: {}",
            proposal.reason
        )));
    }
    Ok(())
}
pub(in crate::supervisor) fn finish(
    tx: &rusqlite::Transaction<'_>,
    key: &str,
    now: u64,
) -> Result<(), Error> {
    let id: Option<String> = tx
        .query_row(
            "SELECT id FROM agent_runtime_sessions WHERE thread_key=?1",
            [key],
            |r| r.get(0),
        )
        .optional()
        .map_err(db_error)?;
    if let Some(id) = id {
        let binding = read(tx, &id)?.ok_or_else(|| Error::Checkpoint("session missing".into()))?;
        let mut p = profile(tx, &binding)?;
        let s = state(tx, &binding, &p)?;
        if !s.busy && !s.has_queued_input && p.idle_since_ms.is_none() {
            p.idle_since_ms = Some(now);
            save_profile(tx, &p)?;
        }
    }
    Ok(())
}
impl RunSupervisor {
    pub(in crate::supervisor) async fn prepare_session_policy(
        &self,
        run: &str,
        registry: Option<&crate::registry::ModuleRegistry>,
    ) -> Result<(), Error> {
        let id = run.to_owned();
        let now = self.store.clock.now_ms();
        let intent = self
            .store
            .transaction(move |tx| {
                if let Some(i) = read_intent(tx, &id)? {
                    return Ok(Some(i));
                }
                let Some((_, _, saved, _)) = load(tx, &id)? else {
                    return Ok(None);
                };
                enqueue(tx, &saved, now)?;
                read_intent(tx, &id)
            })
            .await?;
        let Some(mut i) = intent else {
            return Ok(());
        };
        if i.proposal.is_none() {
            let result = self
                .evaluate_policy(i.policy.as_ref(), i.input.clone(), registry)
                .await;
            i.proposal = Some(match result {
                Ok(p) => p,
                Err(e) => policy::Proposal {
                    decision: policy::Decision::Deny,
                    reason: policy::diagnostic(e),
                    session_id: i.input.request.session_id.clone(),
                    display_name: None,
                    archive: false,
                },
            });
            let value = i.clone();
            self.store
                .transaction(move |tx| {
                    let old = read_intent(tx, &value.run_id)?
                        .ok_or_else(|| Error::Checkpoint("session intent disappeared".into()))?;
                    if content_digest(&(&old.input, &old.policy))?
                        != content_digest(&(&value.input, &value.policy))?
                    {
                        return Err(Error::Checkpoint("session intent changed".into()));
                    }
                    if old.proposal.is_none() {
                        save_intent(tx, &value)?;
                    }
                    Ok(())
                })
                .await?;
        }
        let id = run.to_owned();
        self.store.transaction(move|tx|{
            let i=read_intent(tx,&id)?.ok_or_else(||Error::Checkpoint("session admission missing".into()))?;
            let p=i.proposal.ok_or_else(||policy::invalid("policy decision missing"))?;
            if p.decision!=policy::Decision::Allow {
                tx.execute("UPDATE agent_runtime_jobs SET status='waiting' WHERE run_id=?1 AND status='queued'",[id]).map_err(db_error)?;
                Ok(Some(p.reason))
            } else {Ok(None)}
        }).await?.map_or(Ok(()),|reason|Err(Error::Composition(format!("policy_rejected: {reason}"))))
    }
}
impl SqliteStore {
    pub async fn session_policy_admission(
        &self,
        session: &str,
        run: &str,
    ) -> Result<Option<serde_json::Value>, Error> {
        let session = session.to_owned();
        let run = run.to_owned();
        self.transaction(move|tx|{let i=read_intent(tx,&run)?;
            Ok(i.filter(|i|i.session_id==session).map(|i|serde_json::json!({
                "protocol":"nofy.session.admission/v1","session_id":i.session_id,"run_id":i.run_id,
                "job_digest":i.job_digest,"session_revision":i.input.session.as_ref().map(|s|s.session_revision.clone()).unwrap_or_else(||"0".into()),
                "policy_revision":i.policy_revision.to_string(),"policy":i.policy.as_ref().map(|p|p.identity.clone()),
                "phase":match &i.proposal{None=>"prepared",Some(p) if p.decision==policy::Decision::Allow=>"allowed",_=>"rejected"},
                "proposal":i.proposal})))
        }).await
    }
}
