use super::*;
mod status;

impl SqliteStore {
    /// Ordered, durable replay for an authorized root run. Tokens and controls
    /// use the same cursor; a disconnected live receiver cannot lose them.
    pub async fn events(
        &self,
        run_id: &str,
        after: u64,
        limit: usize,
    ) -> Result<Vec<crate::events::EventEnvelope>, Error> {
        if !(1..=1000).contains(&limit) {
            return Err(Error::Composition(
                "event page limit must be 1..=1000".into(),
            ));
        }
        let id = run_id.to_string();
        let after = i64::try_from(after).map_err(db_error)?;
        self.transaction(move |tx| {
            let mut statement=tx.prepare("SELECT id,payload FROM agent_runtime_events WHERE root_id=?1 AND id>?2 ORDER BY id LIMIT ?3").map_err(db_error)?;
            statement.query_map(params![id,after,limit],|row|Ok((row.get::<_,i64>(0)?,row.get::<_,String>(1)?))).map_err(db_error)?
                .map(|row| {
                    let (cursor,payload)=row.map_err(db_error)?;
                    let envelope:crate::events::EventEnvelope=serde_json::from_str(&payload).map_err(db_error)?;
                    if envelope.version!=1 || i64::try_from(envelope.cursor).ok()!=Some(cursor) {return Err(Error::Checkpoint("event version/cursor metadata mismatch".into()));}
                    Ok(envelope)
                }).collect()
        }).await
    }
    pub async fn children(&self, root_run_id: &str) -> Result<Vec<ChildRunRecord>, Error> {
        let id = root_run_id.to_string();
        self.transaction(move |tx| {
            let mut statement = tx
                .prepare("SELECT payload FROM agent_runtime_children WHERE root_id=?1 ORDER BY key")
                .map_err(db_error)?;
            statement
                .query_map([id], |row| row.get::<_, String>(0))
                .map_err(db_error)?
                .map(|row| serde_json::from_str(&row.map_err(db_error)?).map_err(db_error))
                .collect()
        })
        .await
    }
    pub async fn record(&self, run_id: &str) -> Result<Option<RunRecord>, Error> {
        self.record_as(run_id).await
    }
    pub async fn execution_record(&self, run_id: &str) -> Result<Option<ExecutionRecord>, Error> {
        self.record_as(run_id).await
    }
    async fn record_as<S: serde::de::DeserializeOwned + Send + 'static>(
        &self,
        run_id: &str,
    ) -> Result<Option<RunRecord<S>>, Error> {
        let id = run_id.to_string();
        self.transaction(move |tx| {
            let row: Option<String> = tx
                .query_row(
                    "SELECT payload FROM agent_runtime_runs WHERE id=?1",
                    [id],
                    |row| row.get(0),
                )
                .optional()
                .map_err(db_error)?;
            row.map(|payload| serde_json::from_str(&payload).map_err(db_error))
                .transpose()
        })
        .await
    }
    pub(super) async fn begin_run(
        &self,
        lease: &Lease,
        record: ExecutionRecord,
        resume: bool,
    ) -> Result<String, Error> {
        let lease = lease.clone();
        let clock = self.clock.clone();
        self.transaction(move |tx| {
            check_lease(tx,&lease,clock.now_ms())?;
            jobs::ensure_thread_open(tx,&lease.key)?;
            jobs::ensure_not_parked(tx,&lease.key)?;
            let previous:Option<String>=tx.query_row("SELECT payload FROM agent_runtime_runs WHERE id=?1",[&record.run_id],|row|row.get(0)).optional().map_err(db_error)?;
            let initializing=jobs::validate_begin(tx,&lease,&record,previous.as_deref(),resume)?;
            if resume {
                let previous:ExecutionRecord=serde_json::from_str(&previous.ok_or_else(||Error::Checkpoint("no run to resume".into()))?).map_err(db_error)?;
                if previous.thread_id!=record.thread_id || previous.composition!=record.composition || serde_json::to_value(previous.snapshot).map_err(db_error)?!=serde_json::to_value(&record.snapshot).map_err(db_error)? {
                    return Err(Error::Checkpoint("run/thread/composition changed during resume".into()));
                }
                let active:Option<String>=tx.query_row("SELECT active_run FROM agent_runtime_threads WHERE key=?1",[&lease.key],|row|row.get(0)).optional().map_err(db_error)?;
                if active.as_deref()!=Some(record.run_id.as_str()) {return Err(Error::Checkpoint("a newer run owns this thread".into()));}
            } else {
                if previous.is_some() && !initializing {return Err(Error::Checkpoint("run ID already exists; use explicit resume".into()));}
                let checkpoint:Option<String>=tx.query_row("SELECT payload FROM agent_runtime_checkpoints WHERE key=?1",[&lease.key],|row|row.get(0)).optional().map_err(db_error)?;
                if let Some(payload)=checkpoint {
                    let checkpoint:crate::Checkpoint=serde_json::from_str(&payload).map_err(db_error)?;
                    if checkpoint.composition!=record.composition {return Err(Error::Checkpoint("thread composition changed; start a new thread".into()));}
                    if checkpoint.state.has_pending_work() {
                        return Err(Error::Checkpoint("thread has unfinished work; resume its existing run".into()));
                    }
                }
            }
            let ledger_root = jobs::bind_session(tx, &lease, &record, clock.now_ms())?;
            let payload=serde_json::to_string(&record).map_err(db_error)?;
            tx.execute("INSERT INTO agent_runtime_runs(id,thread_key,payload) VALUES(?1,?2,?3) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload",params![record.run_id,lease.key,payload]).map_err(db_error)?;
            tx.execute("INSERT INTO agent_runtime_threads(key,active_run) VALUES(?1,?2) ON CONFLICT(key) DO UPDATE SET active_run=excluded.active_run",params![lease.key,record.run_id]).map_err(db_error)?;
            check_lease(tx, &lease, clock.now_ms())?;
            Ok(ledger_root)
        }).await
    }
    pub(super) async fn finish_run(
        &self,
        lease: &Lease,
        record: ExecutionRecord,
    ) -> Result<(), Error> {
        let lease = lease.clone();
        let clock = self.clock.clone();
        self.transaction(move |tx| {
            check_lease(tx, &lease, clock.now_ms())?;
            let payload = serde_json::to_string(&record).map_err(db_error)?;
            let changed = tx
                .execute(
                    "UPDATE agent_runtime_runs SET payload=?1 WHERE id=?2 AND thread_key=?3",
                    params![payload, record.run_id, lease.key],
                )
                .map_err(db_error)?;
            if changed != 1 {
                return Err(Error::Checkpoint("missing run receipt".into()));
            }
            jobs::finish(tx, &lease, &record, clock.now_ms())?;
            jobs::session_finished(tx, &lease.key, clock.now_ms())?;
            Ok(())
        })
        .await
    }
    pub(super) async fn approval(
        &self,
        request: ApprovalRequest,
        lease: Lease,
    ) -> Result<Option<bool>, Error> {
        let clock = self.clock.clone();
        let key = request.key()?;
        self.transaction(move |tx| {
            check_lease(tx,&lease,clock.now_ms())?;
            let call_json=serde_json::to_string(&request.call).map_err(db_error)?;
            let payload=serde_json::to_string(&request).map_err(db_error)?;
            tx.execute("INSERT INTO agent_runtime_approvals(key,run_id,call_json,payload,decision) VALUES(?1,?2,?3,?4,NULL) ON CONFLICT(key) DO NOTHING",params![key,request.run_id,call_json,payload]).map_err(db_error)?;
            let (original,decision):(String,Option<bool>)=tx.query_row("SELECT call_json,decision FROM agent_runtime_approvals WHERE key=?1",[key],|row|Ok((row.get(0)?,row.get(1)?))).map_err(db_error)?;
            if original!=call_json {return Err(Error::Checkpoint("approval call identity/arguments changed".into()));}Ok(decision)
        }).await
    }
    pub async fn pending_approvals(&self, run_id: &str) -> Result<Vec<ApprovalRequest>, Error> {
        let id = run_id.to_string();
        self.transaction(move |tx| {
            let mut statement=tx.prepare("SELECT payload FROM agent_runtime_approvals WHERE run_id=?1 AND decision IS NULL ORDER BY key").map_err(db_error)?;
            statement.query_map([id],|row|row.get::<_,String>(0)).map_err(db_error)?
                .map(|row|serde_json::from_str(&row.map_err(db_error)?).map_err(db_error)).collect()
        }).await
    }
    /// Decisions are idempotent but cannot be changed or applied to a different
    /// tool name/argument/step. Access control belongs to the management host.
    pub async fn decide(&self, request: &ApprovalRequest, allow: bool) -> Result<(), Error> {
        self.decide_scoped(request, allow, ApprovalScope::Once)
            .await
    }
}
