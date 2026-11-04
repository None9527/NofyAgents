//! Mutable session metadata augments immutable origin proofs in the same store.
use super::*;
use crate::session_policy::{self as policy, Labels};
pub(in crate::supervisor) mod admission;
mod commands;
mod queries;
mod start;
pub use commands::{
    PolicySelection as SessionPolicySelection, SessionChange, SessionCommand,
    SessionError as SessionCommandError, SessionPlan, SessionPlanView, SessionReceipt,
};
pub use queries::{SessionRoute, SessionRouteView};
pub use start::SessionStart;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub(super) struct Profile {
    pub protocol: String,
    pub session_id: String,
    pub revision: u64,
    pub policy_revision: u64,
    pub display_name: Option<String>,
    pub labels: Labels,
    pub lifecycle: String,
    pub archived: bool,
    pub policy: Option<policy::Frozen>,
    #[serde(default)]
    pub last_policy_command: Option<String>,
    pub idle_since_ms: Option<u64>,
}
impl Profile {
    pub(super) fn new(binding: &Binding, policy: Option<policy::Frozen>, labels: Labels) -> Self {
        Self {
            protocol: "nofy.session-profile/v1".into(),
            session_id: binding.session.id.clone(),
            revision: 0,
            policy_revision: 0,
            display_name: None,
            labels,
            lifecycle: "open".into(),
            archived: false,
            policy,
            last_policy_command: None,
            idle_since_ms: None,
        }
    }
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SessionState {
    pub session_id: String,
    pub session_revision: String,
    pub policy_revision: String,
    pub display_name: Option<String>,
    pub labels: Labels,
    pub lifecycle: String,
    pub archived: bool,
    pub busy: bool,
    pub has_queued_input: bool,
    pub root_run_id: String,
    pub budget_root_run_id: String,
    pub thread_id: String,
    pub system: String,
    pub program: String,
    pub release: String,
    pub active_run_id: Option<String>,
    pub policy: Option<policy::Identity>,
    pub native_view_json: String,
}
impl SessionState {
    pub fn summary(&self) -> policy::Summary {
        policy::Summary {
            session_id: self.session_id.clone(),
            session_revision: self.session_revision.clone(),
            policy_revision: self.policy_revision.clone(),
            display_name: self.display_name.clone(),
            labels: self.labels.clone(),
            lifecycle: self.lifecycle.clone(),
            archived: self.archived,
            busy: self.busy,
            has_queued_input: self.has_queued_input,
        }
    }
}
pub(super) fn profile(tx: &rusqlite::Transaction<'_>, binding: &Binding) -> Result<Profile, Error> {
    let row: Option<(String, String)> = tx
        .query_row(
            "SELECT digest,payload FROM agent_runtime_session_profiles WHERE session_id=?1",
            [&binding.session.id],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )
        .optional()
        .map_err(db_error)?;
    let Some((hash, payload)) = row else {
        // Supported pre-profile state has no hidden policy. Its immutable v1
        // enrollment remains the origin proof; the first explicit edit is CAS 0.
        if binding.session.protocol != "nofy.session/v1" {
            return Err(Error::Checkpoint(
                "session profile authority missing".into(),
            ));
        }
        let (_, _, saved, _) = load(tx, &binding.session.root_run_id)?
            .ok_or_else(|| Error::Checkpoint("session origin missing".into()))?;
        if policy::agent_snapshot(&saved.submission.snapshot)
            .is_some_and(|s| s.agent.session_policy.is_some())
        {
            return Err(Error::Checkpoint("session policy profile missing".into()));
        }
        let edited:bool=tx.query_row("SELECT EXISTS(SELECT 1 FROM agent_runtime_session_ops WHERE session_id=?1 AND json_extract(payload,'$.receipt.phase')='applied')",[&binding.session.id],|r|r.get(0)).map_err(db_error)?;
        if edited {
            return Err(Error::Checkpoint(
                "session profile removed after a command".into(),
            ));
        }
        return Ok(Profile::new(binding, None, Default::default()));
    };
    let value: Profile = serde_json::from_str(&payload).map_err(db_error)?;
    if value.protocol != "nofy.session-profile/v1"
        || value.session_id != binding.session.id
        || !matches!(value.lifecycle.as_str(), "open" | "closed")
        || content_digest(&value)? != hash
    {
        return Err(Error::Checkpoint("session profile identity changed".into()));
    }
    if value.policy_revision == 0 {
        let (_, _, saved, _) = load(tx, &binding.session.root_run_id)?
            .ok_or_else(|| Error::Checkpoint("session origin missing".into()))?;
        let expected = policy::agent_snapshot(&saved.submission.snapshot)
            .map(|s| policy::Frozen::from_snapshot(s, &binding.session.release))
            .transpose()?
            .flatten();
        if serde_json::to_value(&expected).map_err(db_error)?
            != serde_json::to_value(&value.policy).map_err(db_error)?
            || value.last_policy_command.is_some()
        {
            return Err(Error::Checkpoint(
                "initial session policy origin changed".into(),
            ));
        }
    } else {
        let id = value
            .last_policy_command
            .as_ref()
            .ok_or_else(|| Error::Checkpoint("session policy command missing".into()))?;
        let op = commands::operation(tx, id)?
            .ok_or_else(|| Error::Checkpoint("session policy receipt missing".into()))?;
        let expected = value.policy.as_ref().map(|p| &p.identity);
        if op.receipt.phase != "applied"
            || op.receipt.operation != "session.reconfigure"
            || op.receipt.session_id != value.session_id
            || op.receipt.policy_revision.as_deref()
                != Some(value.policy_revision.to_string().as_str())
            || serde_json::to_value(&expected).map_err(db_error)?
                != serde_json::to_value(op.receipt.session.as_ref().and_then(|s| s.policy.as_ref()))
                    .map_err(db_error)?
        {
            return Err(Error::Checkpoint(
                "session policy handoff receipt changed".into(),
            ));
        }
    }
    Ok(value)
}
pub(super) fn save_profile(tx: &rusqlite::Transaction<'_>, p: &Profile) -> Result<(), Error> {
    tx.execute("INSERT INTO agent_runtime_session_profiles(session_id,digest,payload) VALUES(?1,?2,?3) ON CONFLICT(session_id) DO UPDATE SET digest=excluded.digest,payload=excluded.payload",
        params![p.session_id,content_digest(p)?,serde_json::to_string(p).map_err(db_error)?]).map_err(db_error)?;
    Ok(())
}
pub(super) fn state(
    tx: &rusqlite::Transaction<'_>,
    binding: &Binding,
    p: &Profile,
) -> Result<SessionState, Error> {
    let owner: Option<String> = tx
        .query_row(
            "SELECT active_run FROM agent_runtime_threads WHERE key=?1",
            [&binding.thread_key],
            |r| r.get(0),
        )
        .optional()
        .map_err(db_error)?;
    let busy: bool = tx.query_row("SELECT EXISTS(SELECT 1 FROM agent_runtime_runs r JOIN agent_runtime_threads t ON t.active_run=r.id WHERE t.key=?1 AND json_extract(r.payload,'$.status') IN ('running','paused'))",
        [&binding.thread_key], |r| r.get(0)).map_err(db_error)?;
    let pending: bool = tx.query_row("SELECT EXISTS(SELECT 1 FROM agent_runtime_jobs WHERE thread_key=?1 AND status NOT IN ('closed','cancelled','abandoned'))",
        [&binding.thread_key], |r| r.get(0)).map_err(db_error)?;
    let native = SessionView {
        session: binding.session.clone(),
        active_run_id: owner.clone(),
    };
    Ok(SessionState {
        session_id: p.session_id.clone(),
        session_revision: p.revision.to_string(),
        policy_revision: p.policy_revision.to_string(),
        display_name: p.display_name.clone(),
        labels: p.labels.clone(),
        lifecycle: p.lifecycle.clone(),
        archived: p.archived,
        busy,
        has_queued_input: pending,
        root_run_id: binding.session.root_run_id.clone(),
        budget_root_run_id: binding.session.budget_root_run_id.clone(),
        thread_id: binding.session.thread_id.clone(),
        system: binding.session.system.clone(),
        program: binding.session.program.clone(),
        release: binding.session.release.clone(),
        active_run_id: owner,
        policy: p.policy.as_ref().map(|f| f.identity.clone()),
        native_view_json: serde_json::to_string(&native).map_err(db_error)?,
    })
}
pub(super) fn open(p: &Profile) -> Result<(), Error> {
    if p.lifecycle != "open" {
        return Err(Error::Composition("session_closed".into()));
    }
    if p.archived {
        return Err(Error::Composition("session_archived".into()));
    }
    Ok(())
}
pub(super) fn install(
    tx: &rusqlite::Transaction<'_>,
    binding: &Binding,
    frozen: Option<policy::Frozen>,
    labels: Labels,
    input: policy::Input,
    proposal: policy::Proposal,
    now: u64,
) -> Result<(), Error> {
    let mut p = Profile::new(binding, frozen, labels);
    p.display_name = proposal.display_name.clone();
    save_profile(tx, &p)?;
    admission::enroll_intents(tx, binding, &p, input, proposal, now)?;
    admission::finish(tx, &binding.thread_key, now)
}
pub(super) fn idle(
    tx: &rusqlite::Transaction<'_>,
    binding: &Binding,
    p: &Profile,
) -> Result<(), Error> {
    let s = state(tx, binding, p)?;
    if s.busy || s.has_queued_input {
        return Err(Error::Checkpoint(
            "session busy: unfinished or queued work".into(),
        ));
    }
    let cp: Option<String> = tx
        .query_row(
            "SELECT payload FROM agent_runtime_checkpoints WHERE key=?1",
            [&binding.thread_key],
            |r| r.get(0),
        )
        .optional()
        .map_err(db_error)?;
    if let Some(cp) = cp {
        let cp: crate::Checkpoint = serde_json::from_str(&cp).map_err(db_error)?;
        if cp.state.has_pending_work() {
            return Err(Error::Checkpoint("session busy: pending effects".into()));
        }
    }
    Ok(())
}
pub(super) fn revision(value: &str) -> Result<u64, Error> {
    let n = value
        .parse::<u64>()
        .map_err(|_| Error::Composition("invalid exact session revision".into()))?;
    if n.to_string() != value {
        return Err(Error::Composition("noncanonical session revision".into()));
    }
    Ok(n)
}
pub(super) fn labels(value: &Labels) -> Result<(), Error> {
    if value.len() > 256
        || value.iter().any(|(k, v)| {
            k.is_empty() || k.len() > 1024 || v.len() > 4096 || k.chars().any(char::is_control)
        })
    {
        return Err(Error::Composition("invalid session labels".into()));
    }
    Ok(())
}
pub(super) fn command_claimed(tx: &rusqlite::Transaction<'_>, id: &str) -> Result<bool, Error> {
    Ok(commands::operation(tx, id)?.is_some())
}
pub(super) fn make_input(
    phase: policy::Phase,
    p: Option<&Profile>,
    summary: Option<policy::Summary>,
    session_id: Option<String>,
    request_digest: String,
    labels: Labels,
    now: u64,
) -> policy::Input {
    policy::Input {
        protocol: "nofy.session-policy/v1".into(),
        phase,
        now_ms: now.to_string(),
        idle_since_ms: p.and_then(|p| p.idle_since_ms.map(|n| n.to_string())),
        session: summary,
        request: policy::Request {
            session_id,
            request_digest,
            labels,
        },
        candidates: vec![],
        parameters_json: "null".into(),
    }
}
impl RunSupervisor {
    pub(super) async fn evaluate_policy(
        &self,
        frozen: Option<&policy::Frozen>,
        input: policy::Input,
        registry: Option<&crate::registry::ModuleRegistry>,
    ) -> Result<policy::Proposal, Error> {
        let proposal = match frozen {
            None => policy::Proposal::allow(&input),
            Some(frozen) => {
                let registry = registry
                    .or(self.session_registry.as_deref())
                    .ok_or_else(|| policy::invalid("session policy registry required"))?;
                frozen
                    .restore(registry)?
                    .evaluate(input.clone(), tokio_util::sync::CancellationToken::new())
                    .await?
            }
        };
        proposal.validate(&input)?;
        Ok(proposal)
    }
}
impl SqliteStore {
    pub async fn session_state(&self, id: &str) -> Result<Option<SessionState>, Error> {
        bounded_name(id)?;
        let id = id.to_owned();
        self.transaction(move |tx| {
            let Some(binding) = read(tx, &id)? else {
                return Ok(None);
            };
            state(tx, &binding, &profile(tx, &binding)?).map(Some)
        })
        .await
    }
    pub async fn session_states(
        &self,
        after: &str,
        limit: usize,
        include_archived: bool,
    ) -> Result<Vec<SessionState>, Error> {
        page(limit)?;
        let after = after.to_owned();
        self.transaction(move |tx| {
            let mut query = tx.prepare("SELECT s.id FROM agent_runtime_sessions s LEFT JOIN agent_runtime_session_profiles p ON p.session_id=s.id WHERE s.id>?1 AND (?3 OR COALESCE(json_extract(p.payload,'$.archived'),0)=0) ORDER BY s.id LIMIT ?2").map_err(db_error)?;
            let ids = query.query_map(params![after,limit,include_archived], |r| r.get::<_,String>(0)).map_err(db_error)?
                .collect::<Result<Vec<_>,_>>().map_err(db_error)?;
            let mut result = vec![];
            for id in ids { let binding = read(tx,&id)?.ok_or_else(|| Error::Checkpoint("session missing".into()))?;
                let p=profile(tx,&binding)?; if include_archived || !p.archived { result.push(state(tx,&binding,&p)?); }
            }
            Ok(result)
        }).await
    }
}
