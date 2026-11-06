//! Seed preparation owns no business execution. It freezes only after the
//! actual predecessor is closed and its original checkpoint proves the input.
use super::*;

pub(crate) fn read_seed(tx: &rusqlite::Transaction<'_>, run: &str) -> Result<Option<Seed>, Error> {
    let row: Option<(String, String, String)> = tx
        .query_row(
            "SELECT command_id,digest,payload FROM agent_runtime_session_seeds WHERE run_id=?1",
            [run],
            |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
        )
        .optional()
        .map_err(db_error)?;
    row.map(|(command, hash, payload)| {
        let seed: Seed = serde_json::from_str(&payload).map_err(db_error)?;
        let a = admission(tx, &command)?
            .ok_or_else(|| Error::Checkpoint("seed admission missing".into()))?;
        let binding = read(tx, &a.session_id)?
            .ok_or_else(|| Error::Checkpoint("seed session missing".into()))?;
        let (_, job_hash, saved, _) =
            load(tx, run)?.ok_or_else(|| Error::Checkpoint("seed job missing".into()))?;
        compatible(&binding, &saved)?;
        let s = &seed.info;
        let (_, source_hash, source, _) = load(tx, &s.source_run_id)?
            .ok_or_else(|| Error::Checkpoint("seed source job missing".into()))?;
        compatible(&binding, &source)?;
        let epoch = profiles::admission::epoch(tx, run)?;
        let policy_matches = serde_json::to_value(&s.session_policy).map_err(db_error)?
            == serde_json::to_value(&epoch).map_err(db_error)?;
        if s.protocol
            != if s.session_policy.is_some() {
                "nofy.session.seed/v2"
            } else {
                "nofy.session.seed/v1"
            }
            || !policy_matches
            || s.run_id != run
            || a.command.turn.run_id() != run
            || s.session_id != a.session_id
            || s.command_id != command
            || s.binding_revision != a.revision
            || s.submission_digest != job_hash
            || s.submission_digest != a.submission_digest
            || s.source_run_id != a.command.source_run_id
            || s.source_revision != a.command.expected_source_revision
            || seed.base_composition_digest != binding.composition_digest
            || seed.source_submission_digest != source_hash
            || content_digest(&seed)? != hash
        {
            return Err(Error::Checkpoint("session seed identity changed".into()));
        }
        if latest_admission(tx, run)?.is_none_or(|latest| latest.command.command_id != command) {
            return Err(Error::Checkpoint("session seed binding changed".into()));
        }
        transition::validate_seed(&saved.submission.snapshot, &seed.snapshot, &s.modules)?;
        Ok(seed)
    })
    .transpose()
}

/// What a closed predecessor run proves for a session seed. The three strings
/// are different digests/ids; named fields keep them from being swapped.
struct SourceCheckpoint {
    checkpoint: crate::Checkpoint,
    /// Digest of the stored checkpoint payload.
    checkpoint_digest: String,
    /// Submission digest of the source job.
    source_hash: String,
    source: Saved,
    /// Run id that currently owns the thread.
    owner: String,
}

fn source_checkpoint(
    tx: &rusqlite::Transaction<'_>,
    binding: &Binding,
    a: &SessionTurnAdmission,
) -> Result<Option<SourceCheckpoint>, Error> {
    predecessor(
        tx,
        binding,
        &a.command.source_run_id,
        a.command.turn.run_id(),
    )?;
    let source = &a.command.source_run_id;
    let (_, hash, saved, state) =
        load(tx, source)?.ok_or_else(|| Error::Checkpoint("source missing".into()))?;
    if state != "closed" {
        return Ok(None);
    }
    let owner: String = tx
        .query_row(
            "SELECT active_run FROM agent_runtime_threads WHERE key=?1",
            [&binding.thread_key],
            |r| r.get(0),
        )
        .map_err(db_error)?;
    if owner != *source {
        let (_, _, _, owner_state) =
            load(tx, &owner)?.ok_or_else(|| Error::Checkpoint("session owner missing".into()))?;
        // Cancellation before its input checkpoint can leave an initializing
        // owner. Its cancelled receipt is explicit; do not erase or reroute it.
        if owner_state != "cancelled" {
            return Err(Error::Checkpoint(
                "session predecessor no longer owns the thread".into(),
            ));
        }
    }
    let (revision, payload): (u64, String) = tx
        .query_row(
            "SELECT revision,payload FROM agent_runtime_checkpoints WHERE key=?1",
            [&binding.thread_key],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )
        .map_err(db_error)?;
    let cp: crate::Checkpoint = serde_json::from_str(&payload).map_err(db_error)?;
    let root_payload: String = tx
        .query_row(
            "SELECT payload FROM agent_runtime_runs WHERE id=?1 AND thread_key=?2",
            params![source, binding.thread_key],
            |r| r.get(0),
        )
        .map_err(db_error)?;
    let root: ExecutionRecord = serde_json::from_str(&root_payload).map_err(db_error)?;
    if cp.version != 1
        || cp.revision != revision
        || cp.state.has_pending_work()
        || cp.state.execution_run_id.as_deref() != Some(source)
        || cp.state.input_progress.initial.as_ref() != Some(&saved.proof()?)
        || digest(cp.composition.as_bytes()) != saved.submission.composition_digest
        || root.run_id != *source
        || root.thread_id != binding.session.thread_id
        || root.submission.as_ref() != Some(&hash)
        || content_digest(&root.snapshot)? != content_digest(&saved.submission.snapshot)?
        || root.composition != cp.composition
        || root.error.is_some()
        || root
            .outcome
            .as_ref()
            .is_none_or(|outcome| outcome_status(outcome) != root.status)
    {
        return Err(Error::Checkpoint(
            "source is not a closed, quiescent checkpoint with its original input proof".into(),
        ));
    }
    Ok(Some(SourceCheckpoint {
        checkpoint: cp,
        checkpoint_digest: digest(payload.as_bytes()),
        source_hash: hash,
        source: saved,
        owner,
    }))
}

pub(crate) fn verify_start(
    tx: &rusqlite::Transaction<'_>,
    key: &str,
    run: &str,
) -> Result<bool, Error> {
    let Some(seed) = read_seed(tx, run)? else {
        return Ok(false);
    };
    let binding = read(tx, &seed.info.session_id)?
        .ok_or_else(|| Error::Checkpoint("session missing".into()))?;
    if binding.thread_key != key {
        return Err(Error::Checkpoint("seed thread changed".into()));
    }
    let owner: String = tx
        .query_row(
            "SELECT active_run FROM agent_runtime_threads WHERE key=?1",
            [key],
            |r| r.get(0),
        )
        .map_err(db_error)?;
    let payload: String = tx
        .query_row(
            "SELECT payload FROM agent_runtime_checkpoints WHERE key=?1",
            [key],
            |r| r.get(0),
        )
        .map_err(db_error)?;
    let cp: crate::Checkpoint = serde_json::from_str(&payload).map_err(db_error)?;
    let (_, _, saved, _) =
        load(tx, run)?.ok_or_else(|| Error::Checkpoint("seed job missing".into()))?;
    if owner == run
        && cp.state.execution_run_id.as_deref() == Some(run)
        && cp.state.input_progress.initial.as_ref() == Some(&saved.proof()?)
    {
        return Ok(true);
    }
    if (owner != run && owner != seed.info.previous_owner_run_id)
        || cp.revision != seed.info.checkpoint_revision
        || digest(payload.as_bytes()) != seed.info.checkpoint_digest
    {
        return Err(Error::Checkpoint(
            "prepared session checkpoint or owner changed".into(),
        ));
    }
    let current = transition::effective(tx, &seed.info.source_run_id)?;
    let version = current.as_ref().map_or(0, |v| v.revision);
    let command = current.as_ref().map(|v| v.command_id.clone());
    if version != seed.info.source_revision || command != seed.info.source_command_id {
        return Err(Error::Checkpoint(
            "prepared session source version changed".into(),
        ));
    }
    Ok(true)
}

impl RunSupervisor {
    pub(in crate::supervisor) async fn prepare_session_turn(
        &self,
        job: &ExecutionJobRecord,
    ) -> Result<bool, Error> {
        let run = job.submission.run_id.clone();
        let check = run.clone();
        let pending = self
            .store
            .transaction(move |tx| {
                Ok(latest_admission(tx, &check)?.is_some() && read_seed(tx, &check)?.is_none())
            })
            .await?;
        if !pending {
            return Ok(true);
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
        let clock = self.store.clock.clone();
        let expected = job.digest.clone();
        let result=self.store.transaction(move|tx| {
            check_lease(tx,&check,clock.now_ms())?;
            ensure_thread_open(tx,&check.key)?; ensure_not_parked(tx,&check.key)?;
            if read_seed(tx,&run)?.is_some() {return Ok(true);}
            let a=latest_admission(tx,&run)?.ok_or_else(||Error::Checkpoint("session turn admission disappeared".into()))?;
            let binding=read(tx,&a.session_id)?.ok_or_else(||Error::Checkpoint("session missing".into()))?;
            let (sequence,hash,saved,state)=load(tx,&run)?.ok_or_else(||Error::Checkpoint("target job missing".into()))?;
            if hash!=expected || binding.thread_key!=check.key || a.submission_digest!=hash {
                return Err(Error::Checkpoint("session target identity changed".into()));
            }
            if state=="cancelled" || state=="closed" || state=="abandoned" {return Ok(false);}
            let head:Option<u64>=tx.query_row("SELECT sequence FROM agent_runtime_jobs WHERE thread_key=?1 AND status NOT IN ('closed','cancelled','abandoned') ORDER BY sequence LIMIT 1",[&check.key],|r|r.get(0)).optional().map_err(db_error)?;
            if head!=Some(sequence) {return Ok(false);}
            let Some(SourceCheckpoint{checkpoint:cp,checkpoint_digest,source_hash,source,owner})=source_checkpoint(tx,&binding,&a)? else {return Ok(false);};
            let effective=transition::effective(tx,&a.command.source_run_id)?;
            if effective.as_ref().map_or(0,|v|v.revision)!=a.command.expected_source_revision {
                return Err(Error::Checkpoint("session expected source revision changed".into()));
            }
            let (snapshot,composition_digest,release,program,modules,source_command_id)=match effective {
                Some(v)=>(v.snapshot,v.composition_digest,v.release,v.program,v.modules,Some(v.command_id)),
                None=>(source.submission.snapshot,source.submission.composition_digest,binding.session.release.clone(),binding.session.program.clone(),None,None),
            };
            transition::validate_seed(&saved.submission.snapshot,&snapshot,&modules)?;
            let source_seed_command_id=read_seed(tx,&a.command.source_run_id)?.map(|s|s.info.command_id);
            let session_policy=profiles::admission::epoch(tx,&run)?;
            let seed=Seed {info:SessionSeedInfo {protocol:if session_policy.is_some(){"nofy.session.seed/v2"}else{"nofy.session.seed/v1"}.into(),session_id:a.session_id,
                run_id:run.clone(),command_id:a.command.command_id,binding_revision:a.revision,submission_digest:hash,
                source_run_id:a.command.source_run_id,previous_owner_run_id:owner,source_revision:a.command.expected_source_revision,
                source_command_id,source_seed_command_id,checkpoint_revision:cp.revision,checkpoint_digest,
                composition_digest,release,program,modules,prepared_at_ms:clock.now_ms(),session_policy},
                snapshot,base_composition_digest:saved.submission.composition_digest,source_submission_digest:source_hash};
            let payload=serde_json::to_string(&seed).map_err(db_error)?;
            if payload.len()>16*1024*1024 {return Err(Error::Checkpoint("session seed exceeds 16 MiB".into()));}
            tx.execute("INSERT INTO agent_runtime_session_seeds(run_id,command_id,digest,payload) VALUES(?1,?2,?3,?4)",params![run,seed.info.command_id,content_digest(&seed)?,payload]).map_err(db_error)?;
            check_lease(tx,&check,clock.now_ms())?;
            Ok(true)
        }).await;
        let released = self.store.release(&lease).await;
        match result {
            Ok(value) => {
                released?;
                Ok(value)
            }
            Err(error) => Err(error),
        }
    }
}
