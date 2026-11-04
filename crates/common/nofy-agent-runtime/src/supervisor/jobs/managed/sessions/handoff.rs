//! Input admission is immutable and explicitly late-bound. Original frozen
//! submissions and their mailbox provenance remain the storage identity.
use super::*;
mod seed;
pub(crate) use seed::{read_seed, verify_start};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum SessionTurnInput {
    New {
        run_id: String,
        input: PendingInterjection<crate::InputPart>,
    },
    Queued {
        run_id: String,
        submission_digest: String,
    },
}
impl SessionTurnInput {
    fn run_id(&self) -> &str {
        match self {
            Self::New { run_id, .. } | Self::Queued { run_id, .. } => run_id,
        }
    }
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SessionTurnCommand {
    pub command_id: String,
    pub source_run_id: String,
    pub expected_source_revision: u64,
    #[serde(default)]
    pub expected_binding_revision: u64,
    pub turn: SessionTurnInput,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SessionTurnAdmission {
    pub protocol: String,
    pub session_id: String,
    pub revision: u64,
    pub command: SessionTurnCommand,
    pub submission_digest: String,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SessionSeedInfo {
    pub protocol: String,
    pub session_id: String,
    pub run_id: String,
    pub command_id: String,
    pub binding_revision: u64,
    pub submission_digest: String,
    pub source_run_id: String,
    pub previous_owner_run_id: String,
    pub source_revision: u64,
    pub source_command_id: Option<String>,
    pub source_seed_command_id: Option<String>,
    pub checkpoint_revision: u64,
    pub checkpoint_digest: String,
    pub composition_digest: String,
    pub release: String,
    pub program: String,
    pub modules: Option<transition::LiveModuleState>,
    pub prepared_at_ms: u64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub session_policy: Option<SessionPolicyEpoch>,
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub(crate) struct Seed {
    pub info: SessionSeedInfo,
    pub snapshot: RunSnapshot,
    pub base_composition_digest: String,
    pub source_submission_digest: String,
}

fn command_digest(command: &SessionTurnCommand) -> Result<String, Error> {
    bounded_name(&command.command_id)?;
    bounded_name(&command.source_run_id)?;
    bounded_name(command.turn.run_id())?;
    if command.source_run_id == command.turn.run_id()
        || command.expected_source_revision > 32
        || command.expected_binding_revision >= 32
    {
        return Err(Error::Composition(
            "invalid session source or binding revision".into(),
        ));
    }
    match &command.turn {
        SessionTurnInput::New { input, .. } => crate::mailbox::validate_message(input)?,
        SessionTurnInput::Queued {
            submission_digest, ..
        } if submission_digest.len() != 64
            || !submission_digest.bytes().all(|b| b.is_ascii_hexdigit()) =>
        {
            return Err(Error::Composition(
                "session adoption requires exact job digest".into(),
            ));
        }
        _ => {}
    }
    content_digest(command)
}

pub(super) fn admission(
    tx: &rusqlite::Transaction<'_>,
    command_id: &str,
) -> Result<Option<SessionTurnAdmission>, Error> {
    let row:Option<(String,String,u64,String,String)>=tx.query_row(
        "SELECT session_id,run_id,revision,digest,payload FROM agent_runtime_session_commands WHERE command_id=?1",[command_id],
        |r|Ok((r.get(0)?,r.get(1)?,r.get(2)?,r.get(3)?,r.get(4)?))).optional().map_err(db_error)?;
    row.map(|(session, run, revision, hash, payload)| {
        let a: SessionTurnAdmission = serde_json::from_str(&payload).map_err(db_error)?;
        if a.protocol != "nofy.session.turn/v1"
            || a.session_id != session
            || a.command.command_id != command_id
            || a.command.turn.run_id() != run
            || a.revision != revision
            || revision != a.command.expected_binding_revision + 1
            || content_digest(&a)? != hash
        {
            return Err(Error::Checkpoint(
                "session turn command identity changed".into(),
            ));
        }
        command_digest(&a.command)?;
        let (_, digest, _, _) =
            load(tx, &run)?.ok_or_else(|| Error::Checkpoint("session turn job missing".into()))?;
        if digest != a.submission_digest {
            return Err(Error::Checkpoint("session turn submission changed".into()));
        }
        Ok(a)
    })
    .transpose()
}
pub(crate) fn latest_admission(
    tx: &rusqlite::Transaction<'_>,
    run: &str,
) -> Result<Option<SessionTurnAdmission>, Error> {
    let id:Option<String>=tx.query_row("SELECT command_id FROM agent_runtime_session_commands WHERE run_id=?1 ORDER BY revision DESC LIMIT 1",[run],|r|r.get(0)).optional().map_err(db_error)?;
    id.map(|id| {
        admission(tx, &id)?.ok_or_else(|| Error::Checkpoint("session admission missing".into()))
    })
    .transpose()
}

fn predecessor(
    tx: &rusqlite::Transaction<'_>,
    binding: &Binding,
    source: &str,
    run: &str,
) -> Result<(), Error> {
    let (target_sequence, _, target, _) =
        load(tx, run)?.ok_or_else(|| Error::Checkpoint("target job missing".into()))?;
    compatible(binding, &target)?;
    let previous:Option<String>=tx.query_row("SELECT run_id FROM agent_runtime_jobs WHERE thread_key=?1 AND sequence<?2 AND status NOT IN ('cancelled','abandoned') ORDER BY sequence DESC LIMIT 1",
        params![binding.thread_key,target_sequence],|r|r.get(0)).optional().map_err(db_error)?;
    if previous.as_deref() != Some(source) {
        return Err(Error::Checkpoint(
            "session source is not the immediate live predecessor".into(),
        ));
    }
    let (_, _, saved, state) =
        load(tx, source)?.ok_or_else(|| Error::Checkpoint("source job missing".into()))?;
    compatible(binding, &saved)?;
    let member:bool=tx.query_row("SELECT EXISTS(SELECT 1 FROM agent_runtime_session_turns WHERE session_id=?1 AND run_id=?2)",params![binding.session.id,source],|r|r.get(0)).map_err(db_error)?;
    let accepted = latest_admission(tx, source)?;
    if matches!(state.as_str(), "cancelled" | "abandoned")
        || (!member
            && accepted
                .as_ref()
                .is_none_or(|a| a.session_id != binding.session.id))
    {
        return Err(Error::Checkpoint(
            "session source is not an enrolled or bound predecessor".into(),
        ));
    }
    Ok(())
}

impl RunSupervisor {
    pub async fn submit_session_turn(
        &self,
        session_id: &str,
        command: SessionTurnCommand,
    ) -> Result<SessionTurnAdmission, Error> {
        self.submit_session_turn_at(session_id, command, None).await
    }
    pub async fn submit_session_turn_at(
        &self,
        session_id: &str,
        command: SessionTurnCommand,
        expected_session_revision: Option<u64>,
    ) -> Result<SessionTurnAdmission, Error> {
        bounded_name(session_id)?;
        let hash = command_digest(&command)?;
        let session_id = session_id.to_owned();
        let now = self.store.clock.now_ms();
        self.store.transaction(move|tx| {
            if let Some(old)=admission(tx,&command.command_id)? {
                if old.session_id!=session_id || command_digest(&old.command)?!=hash {
                    return Err(Error::Checkpoint("session command ID reused".into()));
                }
                return Ok(old);
            }
            if profiles::command_claimed(tx,&command.command_id)?{return Err(Error::Checkpoint("command ID belongs to a session operation".into()));}
            let binding=read(tx,&session_id)?.ok_or_else(||Error::Checkpoint("session not found".into()))?;
            let p=profiles::profile(tx,&binding)?;profiles::open(&p)?;
            if expected_session_revision.is_some_and(|n|n!=p.revision){return Err(Error::Checkpoint("session revision changed".into()));}
            ensure_thread_open(tx,&binding.thread_key)?;
            let run=command.turn.run_id().to_owned();
            let previous=latest_admission(tx,&run)?;
            if previous.as_ref().map_or(0,|a|a.revision)!=command.expected_binding_revision
                || previous.as_ref().is_some_and(|a|a.session_id!=session_id) {
                return Err(Error::Checkpoint("session binding revision changed".into()));
            }
            let started:bool=tx.query_row("SELECT EXISTS(SELECT 1 FROM agent_runtime_runs WHERE id=?1) OR EXISTS(SELECT 1 FROM agent_runtime_session_seeds WHERE run_id=?1)",[&run],|r|r.get(0)).map_err(db_error)?;
            if started {return Err(Error::Checkpoint("session turn already prepared or started".into()));}
            match &command.turn {
                SessionTurnInput::New {input,..} => {
                    if load(tx,&run)?.is_some() {return Err(Error::Checkpoint("use explicit queued adoption for an existing run".into()));}
                    let (_,_,origin,_)=load(tx,&binding.session.root_run_id)?.ok_or_else(||Error::Checkpoint("session origin missing".into()))?;
                    let mut submission=origin.submission;
                    submission.run_id=run.clone(); submission.input=Some(input.clone());
                    insert(tx,Saved{submission,source:None},now)?;
                }
                SessionTurnInput::Queued {submission_digest,..} => {
                    let (_,digest,_,state)=load(tx,&run)?.ok_or_else(||Error::Checkpoint("queued session turn missing".into()))?;
                    if *submission_digest!=digest || state!="queued" {
                        return Err(Error::Checkpoint("queued session input changed or already started".into()));
                    }
                }
            }
            predecessor(tx,&binding,&command.source_run_id,&run)?;
            let (_,job_hash,saved,_)=load(tx,&run)?.ok_or_else(||Error::Checkpoint("session job missing".into()))?;
            // Explicit adoption may add scheduling metadata, never rewrite a
            // prior managed request or the original Job/mailbox payload.
            if read_request(tx,&run)?.is_none() {
                let count:u64=tx.query_row("SELECT COUNT(*) FROM agent_runtime_managed_runs",[],|r|r.get(0)).map_err(db_error)?;
                if count>=10000 {return Err(Error::Checkpoint("managed run capacity exceeded".into()));}
                let request=ManagedRunRequest {run_id:run.clone(),thread_id:binding.session.thread_id.clone(),
                    system:binding.session.system.clone(),release:binding.session.release.clone(),program:binding.session.program.clone(),
                    input:saved.submission.input,parameters:None};
                tx.execute("INSERT INTO agent_runtime_managed_runs(run_id,digest,payload) VALUES(?1,?2,?3)",params![run,request_digest(&request)?,serde_json::to_string(&request).map_err(db_error)?]).map_err(db_error)?;
            }
            let accepted=SessionTurnAdmission {protocol:"nofy.session.turn/v1".into(),session_id,revision:command.expected_binding_revision+1,command,submission_digest:job_hash};
            tx.execute("INSERT INTO agent_runtime_session_commands(command_id,session_id,run_id,revision,digest,payload) VALUES(?1,?2,?3,?4,?5,?6)",
                params![accepted.command.command_id,accepted.session_id,run,accepted.revision,content_digest(&accepted)?,serde_json::to_string(&accepted).map_err(db_error)?]).map_err(db_error)?;
            Ok(accepted)
        }).await
    }
}

impl SqliteStore {
    pub async fn session_turn_binding(
        &self,
        session: &str,
        run: &str,
    ) -> Result<Option<SessionTurnAdmission>, Error> {
        bounded_name(session)?;
        bounded_name(run)?;
        let session = session.to_owned();
        let run = run.to_owned();
        self.transaction(move |tx| {
            let value = latest_admission(tx, &run)?;
            if value.as_ref().is_some_and(|a| a.session_id != session) {
                return Ok(None);
            }
            Ok(value)
        })
        .await
    }
    pub async fn session_seed(&self, run: &str) -> Result<Option<SessionSeedInfo>, Error> {
        bounded_name(run)?;
        let run = run.to_owned();
        self.transaction(move |tx| Ok(read_seed(tx, &run)?.map(|s| s.info)))
            .await
    }
}
