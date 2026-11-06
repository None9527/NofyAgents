//! Root evidence uses the same immutable receipt journal and native primitive
//! boundary as descendant evidence. It never dispatches the external effect.
use super::*;
#[cfg(test)]
mod tests;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RootToolReconciliation {
    pub model_sequence: u64,
    pub call: ToolCall,
    pub result: serde_json::Value,
    pub is_error: bool,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RootRecoveryTarget {
    pub run_id: String,
    pub thread_id: String,
    pub checkpoint_revision: u64,
    pub model_sequence: u64,
    pub call: ToolCall,
}

impl RunSupervisor {
    pub(in crate::supervisor) async fn accept_root_tool_reconciliation_leased(
        &self,
        compiled: &ExecutionPlan,
        context: &RunContext,
        receipt: RootToolReconciliation,
        lease: &Lease,
    ) -> Result<(), Error> {
        use crate::program::ProgramSnapshot;
        let primitive_host = match &compiled.snapshot {
            RunSnapshot::Agent(_) => true,
            RunSnapshot::Program(snapshot) => matches!(
                &snapshot.program,
                ProgramSnapshot::Agent { .. } | ProgramSnapshot::Tool { .. }
            ),
        };
        if !primitive_host {
            return Err(Error::Checkpoint(
                "reconcile the primitive inside this root controller".into(),
            ));
        }
        if lease.key != compiled.agent.checkpoint_key(&context.thread_id)
            || serde_json::to_vec(&receipt).map_err(db_error)?.len() > 1024 * 1024
        {
            return Err(Error::Composition(
                "invalid root reconciliation lease or receipt size".into(),
            ));
        }
        crate::tool_program::validate_call(&receipt.call)?;
        let root = self
            .store
            .execution_record(&context.run_id)
            .await?
            .ok_or_else(|| Error::Checkpoint("no root run to reconcile".into()))?;
        if root.thread_id != context.thread_id
            || root.composition != compiled.agent.composition_identity()
            || serde_json::to_value(&root.snapshot).map_err(db_error)?
                != serde_json::to_value(&compiled.snapshot).map_err(db_error)?
        {
            return Err(Error::Checkpoint(
                "root reconciliation identity/composition mismatch".into(),
            ));
        }
        let checkpoint = self
            .store
            .guarded(lease)
            .load(&lease.key)
            .await?
            .ok_or_else(|| Error::Checkpoint("missing root checkpoint".into()))?;
        if checkpoint.composition != root.composition
            || checkpoint.state.execution_run_id.as_deref() != Some(&context.run_id)
        {
            return Err(Error::Checkpoint(
                "root reconciliation checkpoint identity changed".into(),
            ));
        }
        let pending = checkpoint.state.model_sequence == receipt.model_sequence
            && checkpoint.state.in_flight.as_ref() == Some(&receipt.call)
            && checkpoint.state.pending_tools.front() == Some(&receipt.call);
        let root_id = context.run_id.clone();
        let clock = self.store.clock.clone();
        let lease = lease.clone();
        self.store.transaction(move |tx| {
            check_lease(tx, &lease, clock.now_ms())?;
            jobs::ensure_thread_open(tx, &lease.key)?;
            let active: Option<String> = tx.query_row("SELECT active_run FROM agent_runtime_threads WHERE key=?1",[&lease.key],|r|r.get(0)).optional().map_err(db_error)?;
            if active.as_deref() != Some(&root_id) { return Err(Error::Checkpoint("root no longer owns this thread".into())); }
            let key = key(&root_id, &root_id, receipt.model_sequence, &receipt.call.id);
            let candidate = ChildReconciliation {child_run_id:root_id.clone(),model_sequence:Some(receipt.model_sequence),call:receipt.call,result:receipt.result,is_error:receipt.is_error};
            let old: Option<String> = tx.query_row("SELECT payload FROM agent_runtime_reconciliations WHERE key=?1",[&key],|r|r.get(0)).optional().map_err(db_error)?;
            if let Some(old) = old {
                let old: Saved = serde_json::from_str(&old).map_err(db_error)?;
                return if same(&candidate, &old.receipt) && old.thread_id == root.thread_id && old.composition == root.composition {
                    Ok(())
                } else { Err(Error::Checkpoint("root reconciliation receipt cannot be changed".into())) };
            }
            if !pending { return Err(Error::Checkpoint("reconciliation does not match root's persisted operation".into())); }
            let count:u64 = tx.query_row("SELECT COUNT(*) FROM agent_runtime_reconciliations WHERE root_id=?1",[&root_id],|r|r.get(0)).map_err(db_error)?;
            if count >= 8192 { return Err(Error::Checkpoint("root reconciliation receipt capacity exceeded".into())); }
            let call_id = candidate.call.id.clone();
            let saved = Saved {model_sequence:candidate.model_sequence.expect("explicit epoch"),receipt:candidate,thread_id:root.thread_id,composition:root.composition};
            tx.execute("INSERT INTO agent_runtime_reconciliations(key,root_id,child_id,call_id,payload) VALUES(?1,?2,?2,?3,?4)",params![key,root_id,call_id,serde_json::to_string(&saved).map_err(db_error)?]).map_err(db_error)?;
            Ok(())
        }).await
    }
}

impl SqliteStore {
    /// Advisory root call only. The action rechecks owner, snapshot and complete
    /// operation under the root lease; resumable controllers reject evidence.
    pub async fn root_recovery_target(
        &self,
        root: &str,
    ) -> Result<Option<RootRecoveryTarget>, Error> {
        crate::system::bounded_name(root)?;
        let root = root.to_owned();
        self.transaction(move |tx| {
            // One field per SELECT column, in column order.
            struct RootRow {
                thread_id: String,
                revision: u64,
                call: Option<String>,
                front: Option<String>,
                owner: Option<String>,
                epoch: u64,
                composition: bool,
                version: u32,
            }
            let row = tx.query_row(
                "SELECT json_extract(r.payload,'$.thread_id'),p.revision,json_extract(p.payload,'$.state.in_flight'),json_extract(p.payload,'$.state.pending_tools[0]'),json_extract(p.payload,'$.state.execution_run_id'),COALESCE(json_extract(p.payload,'$.state.model_sequence'),0),json_extract(p.payload,'$.composition')=json_extract(r.payload,'$.composition'),json_extract(p.payload,'$.version')
                FROM agent_runtime_runs r JOIN agent_runtime_threads t ON t.key=r.thread_key AND t.active_run=r.id JOIN agent_runtime_checkpoints p ON p.key=r.thread_key WHERE r.id=?1",[&root],
                |r| Ok(RootRow {
                    thread_id: r.get(0)?,
                    revision: r.get(1)?,
                    call: r.get(2)?,
                    front: r.get(3)?,
                    owner: r.get(4)?,
                    epoch: r.get(5)?,
                    composition: r.get(6)?,
                    version: r.get(7)?,
                })).optional().map_err(db_error)?;
            let Some(RootRow { thread_id, revision, call, front, owner, epoch, composition, version }) = row else {return Ok(None)};
            if owner.as_deref() != Some(&root) || !composition || version != 1 {return Err(Error::Checkpoint("root recovery checkpoint identity changed".into()));}
            let Some(call) = call else {return Ok(None)};
            let call:ToolCall = serde_json::from_str(&call).map_err(db_error)?;
            let front:Option<ToolCall> = front.map(|s|serde_json::from_str(&s).map_err(db_error)).transpose()?;
            if front.as_ref() != Some(&call) {return Err(Error::Checkpoint("root recovery intent is not its pending operation".into()));}
            let target = RootRecoveryTarget {run_id:root,thread_id,checkpoint_revision:revision,model_sequence:epoch,call};
            if serde_json::to_vec(&target).map_err(db_error)?.len() > 8 * 1024 * 1024 {return Err(Error::Checkpoint("root recovery target exceeds response limit".into()));}
            Ok(Some(target))
        }).await
    }
}
