use super::*;

fn input_event(
    tx: &rusqlite::Transaction<'_>,
    source: &Source,
    kind: crate::mailbox::InputKind,
    state: crate::mailbox::InputStatus,
    reason: Option<String>,
    now: u64,
) -> Result<(), Error> {
    let mut event = crate::events::EventEnvelope {
        version: 1,
        cursor: 0,
        timestamp_ms: now,
        scope: crate::events::EventScope {
            root_run_id: source.address.root_run_id.clone(),
            run_id: source.address.run_id.clone(),
            thread_id: source.address.thread_id.clone(),
            parent_run_id: None,
            node_id: None,
            agent: source.address.agent.clone(),
        },
        event: crate::events::RunEvent::Input {
            input_id: source.input_id.clone(),
            sequence: source.sequence,
            kind,
            status: state,
            reason,
        },
    };
    tx.execute(
        "INSERT INTO agent_runtime_events(root_id,payload) VALUES(?1,'')",
        [&source.address.root_run_id],
    )
    .map_err(db_error)?;
    event.cursor = u64::try_from(tx.last_insert_rowid()).map_err(db_error)?;
    tx.execute(
        "UPDATE agent_runtime_events SET payload=?1 WHERE id=?2",
        params![
            serde_json::to_string(&event).map_err(db_error)?,
            event.cursor
        ],
    )
    .map_err(db_error)?;
    Ok(())
}
pub(super) fn settle_source(
    tx: &rusqlite::Transaction<'_>,
    saved: &Saved,
    rejection: Option<&str>,
    now: u64,
) -> Result<(), Error> {
    let Some(source) = &saved.source else {
        return Ok(());
    };
    let (address,input_id,hash,payload,state):(String,String,String,String,String)=tx.query_row("SELECT address,input_id,digest,payload,status FROM agent_runtime_mailbox WHERE sequence=?1",[source.sequence],|row|Ok((row.get(0)?,row.get(1)?,row.get(2)?,row.get(3)?,row.get(4)?))).map_err(db_error)?;
    let envelope: MailEnvelope = serde_json::from_str(&payload).map_err(db_error)?;
    if address != source.address.key()?
        || input_id != source.input_id
        || hash != source.digest
        || envelope.fingerprint()? != hash
    {
        return Err(Error::Checkpoint("queued source identity changed".into()));
    }
    let expected = if rejection.is_some() {
        "rejected"
    } else {
        "delivered"
    };
    if state != expected {
        if state != "pending" && state != "claimed" {
            return Err(Error::Checkpoint(
                "queued source already settled differently".into(),
            ));
        }
        tx.execute(
            "UPDATE agent_runtime_mailbox SET status=?1,reason=?2 WHERE sequence=?3",
            params![expected, rejection, source.sequence],
        )
        .map_err(db_error)?;
        input_event(
            tx,
            source,
            crate::mailbox::InputKind::NextTurn,
            if rejection.is_some() {
                crate::mailbox::InputStatus::Rejected
            } else {
                crate::mailbox::InputStatus::Delivered
            },
            rejection.map(str::to_string),
            now,
        )?;
    }
    // These inputs explicitly addressed the old run. They never become input
    // to a new run just because a queued turn switched the thread owner.
    Ok(())
}
pub(super) fn reject_stale(
    tx: &rusqlite::Transaction<'_>,
    address: &InputAddress,
    now: u64,
) -> Result<(), Error> {
    let mut query=tx.prepare("SELECT sequence,input_id,digest,payload FROM agent_runtime_mailbox WHERE address=?1 AND status IN ('pending','claimed') ORDER BY sequence").map_err(db_error)?;
    let pending = query
        .query_map([address.key()?], |row| {
            Ok((
                row.get::<_, u64>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
            ))
        })
        .map_err(db_error)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(db_error)?;
    for (sequence, input_id, hash, payload) in pending {
        let envelope: MailEnvelope = serde_json::from_str(&payload).map_err(db_error)?;
        if !matches!(envelope.input, MailInput::NextTurn { .. }) {
            let reason = "recipient completed before this input could be delivered";
            tx.execute(
                "UPDATE agent_runtime_mailbox SET status='rejected',reason=?1 WHERE sequence=?2",
                params![reason, sequence],
            )
            .map_err(db_error)?;
            input_event(
                tx,
                &Source {
                    address: envelope.address,
                    input_id,
                    sequence,
                    digest: hash,
                },
                envelope.input.kind(),
                crate::mailbox::InputStatus::Rejected,
                Some(reason.into()),
                now,
            )?;
        }
    }
    Ok(())
}

/// Administrative closure rejects pending input without deleting its original
/// payload, digest or delivery history. Reuse native Input rejection events.
pub(super) fn reject_for_root(
    tx: &rusqlite::Transaction<'_>,
    root: &str,
    reason: &str,
    now: u64,
) -> Result<u64, Error> {
    let mut query = tx.prepare("SELECT sequence,address,input_id,digest,payload FROM agent_runtime_mailbox WHERE status IN ('pending','claimed') AND json_extract(payload,'$.address.root_run_id')=?1 ORDER BY sequence").map_err(db_error)?;
    let rows = query
        .query_map([root], |r| {
            Ok((
                r.get::<_, u64>(0)?,
                r.get::<_, String>(1)?,
                r.get::<_, String>(2)?,
                r.get::<_, String>(3)?,
                r.get::<_, String>(4)?,
            ))
        })
        .map_err(db_error)?
        .collect::<Result<Vec<_>, _>>()
        .map_err(db_error)?;
    let count = rows.len() as u64;
    for (sequence, address, input_id, hash, payload) in rows {
        let envelope: MailEnvelope = serde_json::from_str(&payload).map_err(db_error)?;
        if envelope.address.root_run_id != root
            || envelope.address.key()? != address
            || envelope.input_id != input_id
            || envelope.fingerprint()? != hash
        {
            return Err(Error::Checkpoint("abandoned input identity changed".into()));
        }
        let kind = envelope.input.kind();
        tx.execute(
            "UPDATE agent_runtime_mailbox SET status='rejected',reason=?1 WHERE sequence=?2",
            params![reason, sequence],
        )
        .map_err(db_error)?;
        input_event(
            tx,
            &Source {
                address: envelope.address,
                input_id,
                sequence,
                digest: hash,
            },
            kind,
            crate::mailbox::InputStatus::Rejected,
            Some(reason.into()),
            now,
        )?;
    }
    Ok(count)
}

#[async_trait::async_trait]
impl InitialInputReceipt for InitialReceipt {
    fn proof(&self) -> InitialInputProof {
        self.saved.proof().expect("validated saved submission")
    }
    async fn acknowledge(&self) -> Result<(), Error> {
        let lease = self.lease.clone();
        let clock = self.store.clock.clone();
        let saved = self.saved.clone();
        self.store.transaction(move |tx| {
            check_lease(tx,&lease,clock.now_ms())?;
            let proof=saved.proof()?;
            let (hash,active):(Option<String>,Option<String>)=(tx.query_row("SELECT digest FROM agent_runtime_jobs WHERE run_id=?1",[&proof.run_id],|row|row.get(0)).optional().map_err(db_error)?,tx.query_row("SELECT active_run FROM agent_runtime_threads WHERE key=?1",[&lease.key],|row|row.get(0)).optional().map_err(db_error)?);
            if hash.as_deref()!=Some(&proof.digest) || active.as_deref()!=Some(&proof.run_id) {return Err(Error::Checkpoint("job acknowledgment no longer owns the thread".into()));}
            let payload:String=tx.query_row("SELECT payload FROM agent_runtime_checkpoints WHERE key=?1",[&lease.key],|row|row.get(0)).map_err(db_error)?;
            let checkpoint:crate::Checkpoint=serde_json::from_str(&payload).map_err(db_error)?;
            if checkpoint.state.input_progress.initial.as_ref()!=Some(&proof) || checkpoint.state.execution_run_id.as_ref()!=Some(&proof.run_id)
                || digest(checkpoint.composition.as_bytes())!=saved.submission.composition_digest
            {return Err(Error::Checkpoint("job input checkpoint proof is missing or changed".into()));}
            settle_source(tx,&saved,None,clock.now_ms())?;
            if let Some(source)=&saved.source {reject_stale(tx,&source.address,clock.now_ms())?;}
            tx.execute("UPDATE agent_runtime_jobs SET status='running' WHERE run_id=?1 AND status NOT IN ('closed','cancelled','abandoned')",[proof.run_id]).map_err(db_error)?;
            Ok(())
        }).await
    }
}
