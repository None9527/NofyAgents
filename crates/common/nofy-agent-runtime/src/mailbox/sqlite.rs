use super::*;
use crate::{
    durable::{GuardedCheckpointer, SqliteStore, check_lease, db_error},
    supervisor::{ChildRunRecord, ExecutionRecord},
};
use rusqlite::{OptionalExtension, Transaction, params};

fn recipient(
    tx: &Transaction<'_>,
    address: &InputAddress,
    active: bool,
    mail: bool,
) -> Result<(String, String), Error> {
    let (thread_key, payload): (String, String) = tx
        .query_row(
            "SELECT thread_key,payload FROM agent_runtime_runs WHERE id=?1",
            [&address.root_run_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .optional()
        .map_err(db_error)?
        .ok_or_else(|| Error::Checkpoint("mailbox root run does not exist".into()))?;
    let root: ExecutionRecord = serde_json::from_str(&payload).map_err(db_error)?;
    if active {
        if root.status == "abandoned" {
            return Err(Error::Checkpoint(
                "run was abandoned; its thread is sealed".into(),
            ));
        }
        let current: String = tx
            .query_row(
                "SELECT active_run FROM agent_runtime_threads WHERE key=?1",
                [&thread_key],
                |row| row.get(0),
            )
            .map_err(db_error)?;
        if current != address.root_run_id {
            return Err(Error::Checkpoint(
                "a newer run owns the input thread".into(),
            ));
        }
    }
    let status = if address.run_id == address.root_run_id {
        if root.thread_id != address.thread_id || root.snapshot.name() != address.agent {
            return Err(Error::Checkpoint("mailbox root recipient mismatch".into()));
        }
        if mail && !root.snapshot.is_agent() {
            return Err(Error::Checkpoint(
                "model-free root accepts cancellation, not Agent mail".into(),
            ));
        }
        root.status
    } else {
        let key =
            serde_json::to_string(&(&address.root_run_id, &address.run_id)).map_err(db_error)?;
        let payload: String = tx
            .query_row(
                "SELECT payload FROM agent_runtime_children WHERE key=?1",
                [key],
                |row| row.get(0),
            )
            .optional()
            .map_err(db_error)?
            .ok_or_else(|| Error::Checkpoint("mailbox recipient is not a recorded child".into()))?;
        let child: ChildRunRecord = serde_json::from_str(&payload).map_err(db_error)?;
        if child.thread_id != address.thread_id
            || child.agent_name != address.agent
            || child.root_run_id != address.root_run_id
        {
            return Err(Error::Checkpoint("mailbox child recipient mismatch".into()));
        }
        if active && child.kind.as_deref().is_some_and(|kind| kind != "agent") {
            return Err(Error::Checkpoint(
                "this control/tool node is not an Agent mailbox recipient".into(),
            ));
        }
        child.status
    };
    Ok((thread_key, status))
}
type Row = (u64, String, String, String, Option<String>);
fn read_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<Row> {
    Ok((
        row.get(0)?,
        row.get(1)?,
        row.get(2)?,
        row.get(3)?,
        row.get(4)?,
    ))
}
fn decode((sequence, digest, payload, status, reason): Row) -> Result<MailDelivery, Error> {
    let delivery = MailDelivery {
        sequence,
        digest,
        envelope: serde_json::from_str(&payload).map_err(db_error)?,
        status: match status.as_str() {
            "pending" => InputStatus::Pending,
            "claimed" => InputStatus::Claimed,
            "delivered" => InputStatus::Delivered,
            "rejected" => InputStatus::Rejected,
            _ => return Err(Error::Checkpoint("unknown mailbox status".into())),
        },
        reason,
    };
    delivery.validate()?;
    Ok(delivery)
}
fn terminal(status: &str) -> bool {
    matches!(status, "completed" | "refused" | "truncated")
}

#[async_trait::async_trait]
impl MailboxSender for SqliteStore {
    async fn submit(&self, envelope: MailEnvelope) -> Result<MailDelivery, Error> {
        let digest = envelope.fingerprint()?;
        let address = envelope.address.key()?;
        let payload = serde_json::to_string(&envelope).map_err(db_error)?;
        self.transaction(move |tx| {
            // Existing receipts remain inspectable/idempotent after a newer turn
            // starts, but no new input may target the superseded run.
            recipient(tx, &envelope.address, false, true)?;
            let old = tx.query_row("SELECT sequence,digest,payload,status,reason FROM agent_runtime_mailbox WHERE address=?1 AND input_id=?2", params![address,envelope.input_id], read_row).optional().map_err(db_error)?;
            if let Some(old) = old {
                let old = decode(old)?;
                if old.digest != digest { return Err(Error::Checkpoint("input ID reused with different payload".into())); }
                return Ok(old);
            }
            let (_, status) = recipient(tx, &envelope.address, true, true)?;
            if terminal(&status) && !matches!(envelope.input, MailInput::NextTurn { .. }) {
                return Err(Error::Checkpoint("completed run accepts queued next turns only".into()));
            }
            let (total, pending, bytes): (u64, u64, u64) = tx.query_row(
                "SELECT COUNT(*),COALESCE(SUM(status IN ('pending','claimed')),0),COALESCE(SUM(CASE WHEN status IN ('pending','claimed') THEN length(CAST(payload AS BLOB)) ELSE 0 END),0) FROM agent_runtime_mailbox WHERE address=?1",
                [&address], |row| Ok((row.get(0)?,row.get(1)?,row.get(2)?)),
            ).map_err(db_error)?;
            if total >= 8192 || pending >= 1024 || bytes.saturating_add(payload.len() as u64) > 8 * 1024 * 1024 {
                return Err(Error::Checkpoint("mailbox capacity exceeded".into()));
            }
            tx.execute("INSERT INTO agent_runtime_mailbox(address,input_id,digest,payload,status) VALUES(?1,?2,?3,?4,'pending')", params![address,envelope.input_id,digest,payload]).map_err(db_error)?;
            let sequence=u64::try_from(tx.last_insert_rowid()).map_err(db_error)?;
            crate::supervisor::jobs::enqueue_next_turn(tx,&envelope,sequence,&digest)?;
            Ok(MailDelivery { sequence, digest, envelope, status: InputStatus::Pending, reason: None })
        }).await
    }
    async fn input_status(
        &self,
        address: &InputAddress,
        input_id: &str,
    ) -> Result<Option<MailDelivery>, Error> {
        let address = address.clone();
        let key = address.key()?;
        let input_id = input_id.to_string();
        self.transaction(move |tx| {
            recipient(tx, &address, false, true)?;
            tx.query_row("SELECT sequence,digest,payload,status,reason FROM agent_runtime_mailbox WHERE address=?1 AND input_id=?2", params![key,input_id],read_row)
                .optional().map_err(db_error)?.map(decode).transpose()
        }).await
    }
    async fn cancel(&self, address: &InputAddress, command_id: &str) -> Result<u64, Error> {
        let address = address.clone();
        let key = address.key()?;
        let command_id = command_id.to_string();
        if command_id.trim().is_empty() || command_id.len() > 256 {
            return Err(Error::Composition("cancel ID must be 1..=256 bytes".into()));
        }
        self.transaction(move |tx| {
            recipient(tx, &address, false, false)?;
            let old = tx
                .query_row(
                    "SELECT sequence FROM agent_runtime_cancel WHERE address=?1 AND command_id=?2",
                    params![key, command_id],
                    |row| row.get(0),
                )
                .optional()
                .map_err(db_error)?;
            if let Some(old) = old {
                return Ok(old);
            }
            let (_, status) = recipient(tx, &address, true, false)?;
            if terminal(&status) {
                return Err(Error::Checkpoint("cannot cancel a completed run".into()));
            }
            let total: u64 = tx
                .query_row(
                    "SELECT COUNT(*) FROM agent_runtime_cancel WHERE address=?1",
                    [&key],
                    |row| row.get(0),
                )
                .map_err(db_error)?;
            if total >= 8192 {
                return Err(Error::Checkpoint("cancel journal capacity exceeded".into()));
            }
            tx.execute(
                "INSERT INTO agent_runtime_cancel(address,command_id) VALUES(?1,?2)",
                params![key, command_id],
            )
            .map_err(db_error)?;
            u64::try_from(tx.last_insert_rowid()).map_err(db_error)
        })
        .await
    }
}

#[async_trait::async_trait]
impl InputInbox for GuardedCheckpointer {
    fn identity(&self) -> String {
        format!("sqlite-mailbox-v1:{}", self.store.path().display())
    }
    fn is_durable(&self) -> bool {
        true
    }
    async fn claim(
        &self,
        address: &InputAddress,
        kind: InputKind,
    ) -> Result<Option<MailDelivery>, Error> {
        let address = address.clone();
        let key = address.key()?;
        let lease = self.lease.clone();
        let clock = self.store.clock.clone();
        self.store.transaction(move |tx| {
            check_lease(tx,&lease,clock.now_ms())?;
            let (root_key, status) = recipient(tx,&address,true,true)?;
            if root_key != lease.key { return Err(Error::Checkpoint("mailbox claim belongs to another root lease".into())); }
            if kind == InputKind::NextTurn && !terminal(&status) { return Ok(None); }
            let head = tx.query_row("SELECT sequence,digest,payload,status,reason FROM agent_runtime_mailbox WHERE address=?1 AND status IN ('pending','claimed') ORDER BY sequence LIMIT 1",[&key],read_row).optional().map_err(db_error)?;
            let Some(head) = head else { return Ok(None); };
            let mut head = decode(head)?;
            if head.envelope.input.kind() != kind { return Ok(None); }
            tx.execute("UPDATE agent_runtime_mailbox SET status='claimed' WHERE sequence=?1",[head.sequence]).map_err(db_error)?;
            head.status = InputStatus::Claimed;
            Ok(Some(head))
        }).await
    }
    async fn acknowledge(
        &self,
        delivery: &MailDelivery,
        rejection: Option<String>,
    ) -> Result<(), Error> {
        delivery.validate()?;
        if rejection.as_ref().is_some_and(|reason| reason.len() > 4096) {
            return Err(Error::Composition("input rejection exceeds 4 KiB".into()));
        }
        let delivery = delivery.clone();
        let lease = self.lease.clone();
        let clock = self.store.clock.clone();
        self.store.transaction(move |tx| {
            check_lease(tx,&lease,clock.now_ms())?;
            let (root_key, _) = recipient(tx,&delivery.envelope.address,true,true)?;
            if root_key != lease.key { return Err(Error::Checkpoint("mailbox ack belongs to another root lease".into())); }
            let old = decode(tx.query_row("SELECT sequence,digest,payload,status,reason FROM agent_runtime_mailbox WHERE sequence=?1",[delivery.sequence],read_row).map_err(db_error)?)?;
            if old.digest != delivery.digest { return Err(Error::Checkpoint("mailbox ack payload mismatch".into())); }
            let expected = if rejection.is_some() { InputStatus::Rejected } else { InputStatus::Delivered };
            if old.status == expected && old.reason == rejection { return Ok(()); }
            if old.status != InputStatus::Claimed { return Err(Error::Checkpoint("input ack requires the original claimed delivery".into())); }
            let status = if rejection.is_some() { "rejected" } else { "delivered" };
            tx.execute("UPDATE agent_runtime_mailbox SET status=?1,reason=?2 WHERE sequence=?3",params![status,rejection,delivery.sequence]).map_err(db_error)?;
            Ok(())
        }).await
    }
    async fn pending_cancel(&self, address: &InputAddress) -> Result<Option<u64>, Error> {
        let address = address.clone();
        let key = address.key()?;
        let lease = self.lease.clone();
        let clock = self.store.clock.clone();
        self.store.transaction(move |tx| {
            check_lease(tx,&lease,clock.now_ms())?;
            let (root_key, _) = recipient(tx,&address,true,false)?;
            if root_key != lease.key { return Err(Error::Checkpoint("cancel read belongs to another root lease".into())); }
            tx.query_row("SELECT MAX(sequence) FROM agent_runtime_cancel WHERE address=?1 AND acknowledged=0",[key],|row|row.get(0)).map_err(db_error)
        }).await
    }
    async fn acknowledge_cancel(&self, address: &InputAddress, through: u64) -> Result<(), Error> {
        let address = address.clone();
        let key = address.key()?;
        let lease = self.lease.clone();
        let clock = self.store.clock.clone();
        self.store.transaction(move |tx| {
            check_lease(tx,&lease,clock.now_ms())?;
            let (root_key, _) = recipient(tx,&address,true,false)?;
            if root_key != lease.key { return Err(Error::Checkpoint("cancel ack belongs to another root lease".into())); }
            let exists: bool = tx.query_row("SELECT EXISTS(SELECT 1 FROM agent_runtime_cancel WHERE address=?1 AND sequence=?2)",params![key,through],|row|row.get(0)).map_err(db_error)?;
            if !exists { return Err(Error::Checkpoint("cancel resume cursor does not exist for this recipient".into())); }
            tx.execute("UPDATE agent_runtime_cancel SET acknowledged=1 WHERE address=?1 AND sequence<=?2",params![key,through]).map_err(db_error)?;
            Ok(())
        }).await
    }
}
