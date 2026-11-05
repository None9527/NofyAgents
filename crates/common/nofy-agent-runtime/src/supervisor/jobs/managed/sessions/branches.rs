//! Copy validated history into a new root; never rewind effects or their ledger.
use super::*;
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ForkSource {
    pub source_session_id: String,
    pub expected_source_session_revision: String,
    pub source_run_id: String,
    pub expected_source_revision: u64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub through_message: Option<usize>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SessionFork {
    pub start: SessionStart,
    pub source: ForkSource,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SessionBranch {
    pub protocol: String,
    pub session_id: String,
    pub parent_session_id: String,
    pub source_run_id: String,
    pub source_revision: u64,
    pub through_message: usize,
    pub source_execution_digest: String,
    pub seed_digest: String,
    pub command_id: String,
    pub root_run_id: String,
    pub created_at_ms: u64,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub(in crate::supervisor::jobs::managed::sessions) struct BranchSeed {
    pub source: ForkSource,
    pub execution_digest: String,
    pub composition: String,
    pub messages: Vec<crate::Message>,
    pub policy: Option<crate::session_policy::Frozen>,
}
fn source_record(
    tx: &rusqlite::Transaction<'_>,
    source: &ForkSource,
) -> Result<(ExecutionRecord, profiles::Profile), Error> {
    bounded_name(&source.source_session_id)?;
    bounded_name(&source.source_run_id)?;
    let binding = read(tx, &source.source_session_id)?
        .ok_or_else(|| Error::Checkpoint("fork source session missing".into()))?;
    let profile = profiles::profile(tx, &binding)?;
    if profile.revision.to_string() != source.expected_source_session_revision {
        return Err(Error::Checkpoint(
            "fork source session revision changed".into(),
        ));
    }
    let belongs:bool=tx.query_row("SELECT EXISTS(SELECT 1 FROM agent_runtime_session_turns WHERE run_id=?1 AND session_id=?2)",params![source.source_run_id,source.source_session_id],|r|r.get(0)).map_err(db_error)?;
    let (_, hash, saved, status) = load(tx, &source.source_run_id)?
        .ok_or_else(|| Error::Checkpoint("fork source turn missing".into()))?;
    let payload: String = tx
        .query_row(
            "SELECT payload FROM agent_runtime_runs WHERE id=?1 AND thread_key=?2",
            params![source.source_run_id, binding.thread_key],
            |r| r.get(0),
        )
        .map_err(db_error)?;
    let record: ExecutionRecord = serde_json::from_str(&payload).map_err(db_error)?;
    if record.outcome.as_ref().is_some_and(|outcome| {
        let state = match outcome {
            crate::RunOutcome::Completed { state, .. }
            | crate::RunOutcome::Paused { state, .. }
            | crate::RunOutcome::Cancelled { state }
            | crate::RunOutcome::BudgetExceeded { state } => state,
        };
        saved.proof().map_or(true, |proof| {
            state.input_progress.initial.as_ref() != Some(&proof)
        })
    }) {
        return Err(Error::Checkpoint(
            "fork source initial input proof changed".into(),
        ));
    }
    let live = transition::effective(tx, &source.source_run_id)?;
    if !belongs
        || status != "closed"
        || record.error.is_some()
        || !record.snapshot.is_agent()
        || record.run_id != source.source_run_id
        || record.thread_id != binding.session.thread_id
        || record.submission.as_deref() != Some(&hash)
        || live.as_ref().map_or(0, |v| v.revision) != source.expected_source_revision
        || record
            .outcome
            .as_ref()
            .is_none_or(|o| outcome_status(o) != record.status)
        || saved.submission.thread_key() != binding.thread_key
    {
        return Err(Error::Checkpoint(
            "fork requires an original closed Agent turn at its exact live version".into(),
        ));
    }
    Ok((record, profile))
}
fn history(record: &ExecutionRecord, through: Option<usize>) -> Result<Vec<crate::Message>, Error> {
    let state = match record
        .outcome
        .as_ref()
        .ok_or_else(|| Error::Checkpoint("fork source outcome missing".into()))?
    {
        crate::RunOutcome::Completed { state, .. }
        | crate::RunOutcome::Paused { state, .. }
        | crate::RunOutcome::Cancelled { state }
        | crate::RunOutcome::BudgetExceeded { state } => state,
    };
    if state.has_pending_work() {
        return Err(Error::Checkpoint(
            "fork cannot copy unresolved effects".into(),
        ));
    }
    let end = through.unwrap_or(state.messages.len());
    if end == 0 || end > state.messages.len() {
        return Err(Error::Composition(
            "fork message boundary is outside history".into(),
        ));
    }
    let messages = state.messages[..end].to_vec();
    if opaque_turn_boundary(&state.messages, end)? {
        // Native calls can live entirely inside Opaque messages. The closed
        // source proves their effects settled; never parse provider internals.
        return Ok(messages);
    }
    let mut pending = std::collections::BTreeSet::new();
    for message in &messages {
        match message {
            crate::Message::Assistant { tool_calls, .. } => {
                if !pending.is_empty() {
                    return Err(Error::Composition(
                        "rewind crosses unresolved tool calls".into(),
                    ));
                }
                for call in tool_calls {
                    if !pending.insert(call.id.clone()) {
                        return Err(Error::Composition(
                            "duplicate tool call in branch history".into(),
                        ));
                    }
                }
            }
            crate::Message::Tool { call_id, .. } => {
                if !pending.remove(call_id) {
                    return Err(Error::Composition(
                        "rewind has a tool result without its call".into(),
                    ));
                }
            }
            crate::Message::Opaque { .. } => {}
            _ if !pending.is_empty() => {
                return Err(Error::Composition(
                    "rewind interrupts a tool call/result group".into(),
                ));
            }
            _ => {}
        }
    }
    if !pending.is_empty() {
        return Err(Error::Composition(
            "rewind boundary leaves tool calls without results".into(),
        ));
    }
    Ok(messages)
}
fn opaque_turn_boundary(messages: &[crate::Message], end: usize) -> Result<bool, Error> {
    let opaque = messages[..end]
        .iter()
        .any(|m| matches!(m, crate::Message::Opaque { .. }));
    if opaque
        && end < messages.len()
        && !matches!(
            messages[end],
            crate::Message::User { .. } | crate::Message::UserParts { .. }
        )
    {
        return Err(Error::Composition(
            "opaque native history can only be rewound at a completed user-turn boundary".into(),
        ));
    }
    Ok(opaque)
}

#[cfg(test)]
mod native_history_boundaries {
    use super::*;
    #[test]
    fn opaque_turns_are_preserved_whole_without_guessing_their_native_calls() {
        use crate::Message;
        let messages = vec![
            Message::System {
                content: "system".into(),
            },
            Message::User {
                content: "first".into(),
            },
            Message::Opaque {
                provider: "declared.protocol".into(),
                value: serde_json::json!({"sealed":"native tool call"}),
            },
            Message::Tool {
                call_id: "native-call".into(),
                content: "actual result".into(),
                is_error: false,
            },
            Message::Opaque {
                provider: "declared.protocol".into(),
                value: serde_json::json!({"sealed":"native answer"}),
            },
            Message::User {
                content: "second".into(),
            },
            Message::Assistant {
                content: "answer".into(),
                tool_calls: vec![],
            },
        ];
        assert!(!opaque_turn_boundary(&messages, 2).unwrap());
        for end in [3, 4] {
            assert!(opaque_turn_boundary(&messages, end).is_err());
        }
        assert!(opaque_turn_boundary(&messages, 5).unwrap());
        assert!(opaque_turn_boundary(&messages, messages.len()).unwrap());
    }
}
pub(super) async fn prepare(
    store: &SqliteStore,
    source: ForkSource,
    target: &ExecutionSubmission,
    request: &ManagedRunRequest,
) -> Result<BranchSeed, Error> {
    let target = target.clone();
    let request = request.clone();
    store.transaction(move |tx| {
        let (record,profile)=source_record(tx,&source)?;
        let binding=read(tx,&source.source_session_id)?.ok_or_else(||Error::Checkpoint("source session missing".into()))?;
        let live=transition::effective(tx,&source.source_run_id)?;
        let release=live.as_ref().map_or(&binding.session.release,|v|&v.release);
        let program=live.as_ref().map_or(&binding.session.program,|v|&v.program);
        if request.thread_id==binding.session.thread_id||request.system!=binding.session.system||&request.release!=release||&request.program!=program
            ||content_digest(&target.snapshot)?!=content_digest(&record.snapshot)?||target.composition_digest!=digest(record.composition.as_bytes()) {
            return Err(Error::Composition("fork target must use a new thread and the source turn's exact frozen program; inspect its live release first".into()));
        }
        let messages=history(&record,source.through_message)?;
        Ok(BranchSeed{source,execution_digest:content_digest(&record)?,composition:record.composition,messages,policy:profile.policy})
    }).await
}
pub(super) fn install(
    tx: &rusqlite::Transaction<'_>,
    seed: &BranchSeed,
    session: &str,
    command: &str,
    target: &ManagedRunRequest,
    now: u64,
) -> Result<(), Error> {
    let (_, depth) = lineage_root(tx, &seed.source.source_session_id)?;
    if depth >= 128 {
        return Err(Error::Composition(
            "session branch depth limit (128) reached".into(),
        ));
    }
    let (source, _) = source_record(tx, &seed.source)?;
    if content_digest(&source)? != seed.execution_digest {
        return Err(Error::Checkpoint(
            "fork source execution changed during preparation".into(),
        ));
    }
    let key = crate::state::checkpoint_key(source.snapshot.name(), &target.thread_id);
    let used:bool=tx.query_row("SELECT EXISTS(SELECT 1 FROM agent_runtime_checkpoints WHERE key=?1) OR EXISTS(SELECT 1 FROM agent_runtime_runs WHERE thread_key=?1) OR EXISTS(SELECT 1 FROM agent_runtime_sessions WHERE thread_key=?1) OR EXISTS(SELECT 1 FROM agent_runtime_jobs WHERE thread_key=?1)",[&key],|r|r.get(0)).map_err(db_error)?;
    if used {
        return Err(Error::Checkpoint(
            "fork target thread has already been used".into(),
        ));
    }
    let checkpoint = crate::Checkpoint {
        version: 1,
        revision: 0,
        composition: seed.composition.clone(),
        state: crate::RunState {
            messages: seed.messages.clone(),
            ..Default::default()
        },
    };
    tx.execute(
        "INSERT INTO agent_runtime_checkpoints(key,revision,payload) VALUES(?1,0,?2)",
        params![key, serde_json::to_string(&checkpoint).map_err(db_error)?],
    )
    .map_err(db_error)?;
    let record = SessionBranch {
        protocol: "nofy.session-branch/v1".into(),
        session_id: session.into(),
        parent_session_id: seed.source.source_session_id.clone(),
        source_run_id: seed.source.source_run_id.clone(),
        source_revision: seed.source.expected_source_revision,
        through_message: seed.messages.len(),
        source_execution_digest: seed.execution_digest.clone(),
        seed_digest: content_digest(&checkpoint)?,
        command_id: command.into(),
        root_run_id: target.run_id.clone(),
        created_at_ms: now,
    };
    tx.execute("INSERT INTO agent_runtime_session_branches(session_id,parent_session_id,command_id,digest,payload) VALUES(?1,?2,?3,?4,?5)",params![record.session_id,record.parent_session_id,record.command_id,content_digest(&record)?,serde_json::to_string(&record).map_err(db_error)?]).map_err(db_error)?;
    Ok(())
}
impl RunSupervisor {
    pub async fn fork_session(
        &self,
        command: SessionFork,
        system: &CompiledSystem,
    ) -> Result<SessionReceipt, Error> {
        self.start_session_branch(command.start, system, Some(command.source))
            .await
    }
}
impl SqliteStore {
    pub async fn session_tree(&self, session: &str) -> Result<serde_json::Value, Error> {
        bounded_name(session)?;
        let session = session.to_owned();
        self.transaction(move |tx| {
            if read(tx,&session)?.is_none(){return Err(Error::Checkpoint("session not found".into()));}
            let (root, _) = lineage_root(tx, &session)?;
            let mut query=tx.prepare("WITH RECURSIVE tree(id,depth) AS (SELECT ?1,0 UNION ALL SELECT b.session_id,t.depth+1 FROM agent_runtime_session_branches b JOIN tree t ON b.parent_session_id=t.id WHERE t.depth<128) SELECT b.digest,b.payload FROM tree t JOIN agent_runtime_session_branches b ON b.session_id=t.id ORDER BY t.depth,b.session_id LIMIT 10001").map_err(db_error)?;
            let rows=query.query_map([&root],|r|Ok((r.get::<_,String>(0)?,r.get::<_,String>(1)?))).map_err(db_error)?.collect::<Result<Vec<_>,_>>().map_err(db_error)?;
            if rows.len()>10000{return Err(Error::Checkpoint("session tree exceeds query capacity".into()));}
            let mut branches=Vec::new();
            for (hash,payload) in rows{let branch:SessionBranch=serde_json::from_str(&payload).map_err(db_error)?;if content_digest(&branch)?!=hash||branch.protocol!="nofy.session-branch/v1"{return Err(Error::Checkpoint("session lineage identity changed".into()));}branches.push(branch);}
            Ok(serde_json::json!({"protocol":"nofy.session-tree/v1","root_session_id":root,"selected_session_id":session,"branches":branches,"rewind_effects":"preserved","budget":"each operator-created branch has an independent root; original ledger is unchanged"}))
        }).await
    }
}
fn lineage_root(tx: &rusqlite::Transaction<'_>, session: &str) -> Result<(String, usize), Error> {
    let mut current = session.to_owned();
    let mut visited = std::collections::BTreeSet::new();
    for depth in 0..=128 {
        if !visited.insert(current.clone()) {
            return Err(Error::Checkpoint("session lineage contains a cycle".into()));
        }
        let parent: Option<String> = tx
            .query_row(
                "SELECT parent_session_id FROM agent_runtime_session_branches WHERE session_id=?1",
                [&current],
                |r| r.get(0),
            )
            .optional()
            .map_err(db_error)?;
        match parent {
            Some(parent) => current = parent,
            None => return Ok((current, depth)),
        }
    }
    Err(Error::Checkpoint(
        "session lineage exceeds supported depth (128)".into(),
    ))
}
