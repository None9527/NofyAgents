use super::*;
use serde_json::Value;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PolicySelection {
    pub release: String,
    pub module: crate::registry::ModuleRef,
}
fn present_name<'de, D: serde::Deserializer<'de>>(
    d: D,
) -> Result<Option<Option<String>>, D::Error> {
    Option::<String>::deserialize(d).map(Some)
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum SessionChange {
    Metadata {
        #[serde(
            default,
            skip_serializing_if = "Option::is_none",
            deserialize_with = "present_name"
        )]
        display_name: Option<Option<String>>,
        #[serde(default, skip_serializing_if = "Option::is_none")]
        labels: Option<Labels>,
    },
    Close,
    Reopen,
    Archive,
    Unarchive,
    Reconfigure {
        source_run_id: String,
        expected_source_revision: String,
        policy: PolicySelection,
    },
}
impl SessionChange {
    pub fn operation(&self) -> &'static str {
        match self {
            Self::Metadata { .. } => "session.metadata",
            Self::Close => "session.close",
            Self::Reopen => "session.reopen",
            Self::Archive => "session.archive",
            Self::Unarchive => "session.unarchive",
            Self::Reconfigure { .. } => "session.reconfigure",
        }
    }
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SessionCommand {
    pub session_id: String,
    pub command_id: String,
    pub expected_session_revision: String,
    pub change: SessionChange,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SessionPlan {
    pub session_id: String,
    pub expected_session_revision: String,
    pub change: SessionChange,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SessionPlanView {
    pub session_id: String,
    pub expected_session_revision: String,
    pub change: SessionChange,
    pub applicable: bool,
    pub blocking_reasons: Vec<String>,
    pub proposal: Option<policy::Proposal>,
    pub policy: Option<policy::Identity>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SessionError {
    pub code: String,
    pub message: String,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SessionReceipt {
    pub session_id: String,
    pub command_id: String,
    pub operation: String,
    pub request_digest: String,
    pub phase: String,
    pub session_revision: Option<String>,
    pub policy_revision: Option<String>,
    pub session: Option<SessionState>,
    pub run_id: Option<String>,
    pub error: Option<SessionError>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub(super) struct Operation {
    pub receipt: SessionReceipt,
    pub request: Value,
    pub prepared: Option<super::start::Prepared>,
}
pub(super) fn operation(
    tx: &rusqlite::Transaction<'_>,
    id: &str,
) -> Result<Option<Operation>, Error> {
    let row: Option<(String, String, String)> = tx
        .query_row(
            "SELECT session_id,digest,payload FROM agent_runtime_session_ops WHERE command_id=?1",
            [id],
            |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
        )
        .optional()
        .map_err(db_error)?;
    row.map(|(session, hash, payload)| {
        let o: Operation = serde_json::from_str(&payload).map_err(db_error)?;
        if o.receipt.command_id != id
            || o.receipt.session_id != session
            || content_digest(&o)? != hash
            || content_digest(&(&o.receipt.operation, &o.request))? != o.receipt.request_digest
        {
            return Err(Error::Checkpoint("session command identity changed".into()));
        }
        Ok(o)
    })
    .transpose()
}
pub(super) fn save_operation(tx: &rusqlite::Transaction<'_>, o: &Operation) -> Result<(), Error> {
    tx.execute("INSERT INTO agent_runtime_session_ops(command_id,session_id,digest,payload) VALUES(?1,?2,?3,?4) ON CONFLICT(command_id) DO UPDATE SET digest=excluded.digest,payload=excluded.payload",
        params![o.receipt.command_id,o.receipt.session_id,content_digest(o)?,serde_json::to_string(o).map_err(db_error)?]).map_err(db_error)?;
    Ok(())
}
pub(super) fn previous(
    tx: &rusqlite::Transaction<'_>,
    id: &str,
    hash: &str,
) -> Result<Option<SessionReceipt>, Error> {
    if let Some(o) = operation(tx, id)? {
        if o.receipt.request_digest != hash {
            return Err(Error::Checkpoint(
                "session command ID reused with different request".into(),
            ));
        }
        return Ok(Some(o.receipt));
    }
    if handoff::admission(tx, id)?.is_some() {
        return Err(Error::Checkpoint(
            "command ID belongs to a session turn".into(),
        ));
    }
    Ok(None)
}
fn source_proof(
    tx: &rusqlite::Transaction<'_>,
    b: &Binding,
    run: &str,
    expected: u64,
) -> Result<(), Error> {
    let (_, hash, saved, status) =
        load(tx, run)?.ok_or_else(|| Error::Checkpoint("session source missing".into()))?;
    if status != "closed" {
        return Err(Error::Checkpoint("session source must be closed".into()));
    }
    let owner: String = tx
        .query_row(
            "SELECT active_run FROM agent_runtime_threads WHERE key=?1",
            [&b.thread_key],
            |r| r.get(0),
        )
        .map_err(db_error)?;
    if owner != run {
        return Err(Error::Checkpoint(
            "session source no longer owns the thread".into(),
        ));
    }
    let (revision, payload): (u64, String) = tx
        .query_row(
            "SELECT revision,payload FROM agent_runtime_checkpoints WHERE key=?1",
            [&b.thread_key],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )
        .map_err(db_error)?;
    let cp: crate::Checkpoint = serde_json::from_str(&payload).map_err(db_error)?;
    let payload: String = tx
        .query_row(
            "SELECT payload FROM agent_runtime_runs WHERE id=?1 AND thread_key=?2",
            params![run, b.thread_key],
            |r| r.get(0),
        )
        .map_err(db_error)?;
    let root: ExecutionRecord = serde_json::from_str(&payload).map_err(db_error)?;
    let effective = transition::effective(tx, run)?;
    if cp.version != 1
        || cp.revision != revision
        || cp.state.has_pending_work()
        || cp.state.execution_run_id.as_deref() != Some(run)
        || cp.state.input_progress.initial.as_ref() != Some(&saved.proof()?)
        || digest(cp.composition.as_bytes()) != saved.submission.composition_digest
        || root.run_id != run
        || root.thread_id != b.session.thread_id
        || root.submission.as_ref() != Some(&hash)
        || content_digest(&root.snapshot)? != content_digest(&saved.submission.snapshot)?
        || root.composition != cp.composition
        || root.error.is_some()
        || root
            .outcome
            .as_ref()
            .is_none_or(|o| outcome_status(o) != root.status)
        || effective.as_ref().map_or(0, |v| v.revision) != expected
    {
        return Err(Error::Checkpoint(
            "session source checkpoint/version proof changed".into(),
        ));
    }
    Ok(())
}
fn check_change(
    tx: &rusqlite::Transaction<'_>,
    b: &Binding,
    p: &Profile,
    change: &SessionChange,
    frozen: Option<&policy::Frozen>,
) -> Result<(), Error> {
    match change {
        SessionChange::Metadata {
            display_name,
            labels: values,
        } => {
            if display_name.is_none() && values.is_none() {
                return Err(Error::Composition("metadata change is empty".into()));
            }
            if display_name
                .as_ref()
                .and_then(|n| n.as_ref())
                .is_some_and(|s| s.len() > 4096 || s.chars().any(char::is_control))
            {
                return Err(Error::Composition("invalid session display name".into()));
            }
            if let Some(v) = values {
                labels(v)?;
            }
        }
        SessionChange::Reconfigure {
            source_run_id,
            expected_source_revision,
            policy: selected,
        } => {
            idle(tx, b, p)?;
            source_proof(tx, b, source_run_id, revision(expected_source_revision)?)?;
            let f = frozen.ok_or_else(|| policy::invalid("selected policy closure required"))?;
            if f.identity.release != selected.release || f.identity.module != selected.module {
                return Err(policy::invalid("selected policy identity mismatch"));
            }
        }
        _ => idle(tx, b, p)?,
    }
    Ok(())
}
impl RunSupervisor {
    pub async fn replay_session_command(
        &self,
        request: &SessionCommand,
    ) -> Result<Option<SessionReceipt>, Error> {
        let op = request.change.operation();
        let body = serde_json::to_value(request).map_err(db_error)?;
        let hash = content_digest(&(op, &body))?;
        let id = request.command_id.clone();
        self.store
            .transaction(move |tx| previous(tx, &id, &hash))
            .await
    }
    pub async fn plan_session(
        &self,
        request: SessionPlan,
        frozen: Option<policy::Frozen>,
    ) -> Result<SessionPlanView, Error> {
        bounded_name(&request.session_id)?;
        let expected = revision(&request.expected_session_revision)?;
        if let Some(f) = &frozen {
            f.restore(
                self.session_registry
                    .as_deref()
                    .ok_or_else(|| policy::invalid("session registry required"))?,
            )?;
        }
        let lookup = request.session_id.clone();
        let change = request.change.clone();
        let target = frozen.clone();
        let (p, s, blocking) = self
            .store
            .transaction(move |tx| {
                let b = read(tx, &lookup)?
                    .ok_or_else(|| Error::Composition("session not found".into()))?;
                let p = profile(tx, &b)?;
                let result = if p.revision != expected {
                    Err(Error::Checkpoint("session revision changed".into()))
                } else {
                    check_change(tx, &b, &p, &change, target.as_ref())
                };
                let s = state(tx, &b, &p)?;
                Ok((
                    p,
                    s,
                    result
                        .err()
                        .map(|e| e.to_string())
                        .into_iter()
                        .collect::<Vec<_>>(),
                ))
            })
            .await?;
        let proposal = if matches!(request.change, SessionChange::Archive) {
            let i = make_input(
                policy::Phase::Retention,
                Some(&p),
                Some(s.summary()),
                Some(request.session_id.clone()),
                content_digest(&request)?,
                p.labels.clone(),
                self.store.clock.now_ms(),
            );
            Some(self.evaluate_policy(p.policy.as_ref(), i, None).await?)
        } else {
            None
        };
        Ok(SessionPlanView {
            session_id: request.session_id,
            expected_session_revision: request.expected_session_revision,
            change: request.change,
            applicable: blocking.is_empty(),
            blocking_reasons: blocking,
            proposal,
            policy: frozen
                .as_ref()
                .or(p.policy.as_ref())
                .map(|f| f.identity.clone()),
        })
    }
    pub async fn session_command(
        &self,
        request: SessionCommand,
        frozen: Option<policy::Frozen>,
    ) -> Result<SessionReceipt, Error> {
        bounded_name(&request.session_id)?;
        bounded_name(&request.command_id)?;
        let expected = revision(&request.expected_session_revision)?;
        let op = request.change.operation().to_owned();
        let body = serde_json::to_value(&request).map_err(db_error)?;
        let hash = content_digest(&(&op, &body))?;
        let check = request.command_id.clone();
        let wanted = hash.clone();
        if let Some(old) = self
            .store
            .transaction(move |tx| previous(tx, &check, &wanted))
            .await?
        {
            return Ok(old);
        }
        if let Some(f) = &frozen {
            f.restore(
                self.session_registry
                    .as_deref()
                    .ok_or_else(|| policy::invalid("session registry required"))?,
            )?;
        }
        self.store
            .transaction(move |tx| {
                if let Some(old) = previous(tx, &request.command_id, &hash)? {
                    return Ok(old);
                }
                let b = read(tx, &request.session_id)?
                    .ok_or_else(|| Error::Composition("session not found".into()))?;
                let mut p = profile(tx, &b)?;
                if p.revision != expected {
                    return Err(Error::Checkpoint("session revision changed".into()));
                }
                check_change(tx, &b, &p, &request.change, frozen.as_ref())?;
                match request.change {
                    SessionChange::Metadata {
                        display_name,
                        labels,
                    } => {
                        if let Some(n) = display_name {
                            p.display_name = n;
                        }
                        if let Some(v) = labels {
                            p.labels = v;
                        }
                    }
                    SessionChange::Close => p.lifecycle = "closed".into(),
                    SessionChange::Reopen => p.lifecycle = "open".into(),
                    SessionChange::Archive => p.archived = true,
                    SessionChange::Unarchive => p.archived = false,
                    SessionChange::Reconfigure { .. } => {
                        p.policy = frozen;
                        p.last_policy_command = Some(request.command_id.clone());
                        p.policy_revision = p
                            .policy_revision
                            .checked_add(1)
                            .ok_or_else(|| Error::Checkpoint("policy revision exhausted".into()))?;
                    }
                }
                p.revision = p
                    .revision
                    .checked_add(1)
                    .ok_or_else(|| Error::Checkpoint("session revision exhausted".into()))?;
                save_profile(tx, &p)?;
                let receipt = SessionReceipt {
                    session_id: request.session_id,
                    command_id: request.command_id,
                    operation: op,
                    request_digest: hash,
                    phase: "applied".into(),
                    session_revision: Some(p.revision.to_string()),
                    policy_revision: Some(p.policy_revision.to_string()),
                    session: Some(state(tx, &b, &p)?),
                    run_id: None,
                    error: None,
                };
                save_operation(
                    tx,
                    &Operation {
                        receipt: receipt.clone(),
                        request: body,
                        prepared: None,
                    },
                )?;
                Ok(receipt)
            })
            .await
    }
}
impl SqliteStore {
    pub async fn session_command_receipt(
        &self,
        session: &str,
        id: &str,
    ) -> Result<Option<SessionReceipt>, Error> {
        bounded_name(session)?;
        bounded_name(id)?;
        let session = session.to_owned();
        let id = id.to_owned();
        self.transaction(move |tx| {
            Ok(operation(tx, &id)?
                .filter(|o| o.receipt.session_id == session)
                .map(|o| o.receipt))
        })
        .await
    }
}
