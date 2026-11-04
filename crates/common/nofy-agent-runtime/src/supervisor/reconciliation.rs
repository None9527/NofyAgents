use super::*;
mod hook;
use crate::reconciliation::{ReconciliationControl, ReconciliationInput};
mod model;
mod root;
mod targets;
pub use root::{RootRecoveryTarget, RootToolReconciliation};
pub use targets::{ChildRecoveryPage, ChildRecoveryTarget};

#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Saved {
    receipt: ChildReconciliation,
    model_sequence: u64,
    thread_id: String,
    composition: String,
}
fn key(root: &str, child: &str, sequence: u64, call: &str) -> String {
    serde_json::to_string(&(root, child, sequence, call)).expect("scalar tuple")
}
fn same(receipt: &ChildReconciliation, old: &ChildReconciliation) -> bool {
    receipt.child_run_id == old.child_run_id
        && receipt.call == old.call
        && receipt.result == old.result
        && receipt.is_error == old.is_error
}
impl RunSupervisor {
    pub async fn reconcile_program_child(
        &self,
        compiled: &CompiledProgram,
        context: &RunContext,
        receipt: ChildReconciliation,
    ) -> Result<(), Error> {
        self.accept_child_reconciliation(&ExecutionPlan::program(compiled), context, receipt)
            .await
    }
    pub(super) async fn accept_child_reconciliation(
        &self,
        compiled: &ExecutionPlan,
        context: &RunContext,
        receipt: ChildReconciliation,
    ) -> Result<(), Error> {
        if serde_json::to_vec(&receipt).map_err(db_error)?.len() > 1024 * 1024 {
            return Err(Error::Composition(
                "child reconciliation exceeds 1 MiB".into(),
            ));
        }
        let lease = self
            .store
            .acquire(
                compiled.agent.checkpoint_key(&context.thread_id),
                nofy_tool_protocol::ToolCallId::new_v7().to_string(),
                self.ttl,
            )
            .await?;
        let result = self
            .accept_child_reconciliation_leased(compiled, context, receipt, &lease)
            .await;
        let released = self.store.release(&lease).await;
        match result {
            Ok(()) => released,
            Err(error) => Err(error),
        }
    }
    pub(in crate::supervisor) async fn accept_child_reconciliation_leased(
        &self,
        compiled: &ExecutionPlan,
        context: &RunContext,
        receipt: ChildReconciliation,
        lease: &Lease,
    ) -> Result<(), Error> {
        if lease.key != compiled.agent.checkpoint_key(&context.thread_id)
            || serde_json::to_vec(&receipt).map_err(db_error)?.len() > 1024 * 1024
        {
            return Err(Error::Composition(
                "invalid child reconciliation lease or receipt size".into(),
            ));
        }
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
        let child = self
            .store
            .children(&context.run_id)
            .await?
            .into_iter()
            .find(|child| child.run_id == receipt.child_run_id)
            .ok_or_else(|| {
                Error::Checkpoint(
                    "reconciliation target is not a recorded child of this run".into(),
                )
            })?;
        if child
            .kind
            .as_deref()
            .is_some_and(|kind| kind != "agent" && kind != "tool_program")
        {
            return Err(Error::Checkpoint(
                "reconcile the admitted primitive inside this workflow control node".into(),
            ));
        }
        self.store.begin_run(lease, root, true).await?;
        let checkpoint = self
            .store
            .guarded(lease)
            .load(&crate::state::checkpoint_key(
                &child.agent_name,
                &child.thread_id,
            ))
            .await?
            .ok_or_else(|| Error::Checkpoint("missing child checkpoint".into()))?;
        if checkpoint.composition != child.composition {
            return Err(Error::Checkpoint(
                "child reconciliation composition changed".into(),
            ));
        }
        let epoch = receipt
            .model_sequence
            .unwrap_or(checkpoint.state.model_sequence);
        let pending = checkpoint.state.model_sequence == epoch
            && checkpoint.state.in_flight.as_ref() == Some(&receipt.call)
            && checkpoint.state.pending_tools.front() == Some(&receipt.call);
        let root_id = context.run_id.clone();
        let clock = self.store.clock.clone();
        let lease = (*lease).clone();
        self.store.transaction(move |tx| {
            check_lease(tx,&lease,clock.now_ms())?;
            jobs::ensure_thread_open(tx,&lease.key)?;
            // A missing epoch in legacy requests cannot select a later
            // operation that happened to reuse a provider call ID.
            if receipt.model_sequence.is_none() {
                let mut query=tx.prepare("SELECT payload FROM agent_runtime_reconciliations WHERE root_id=?1 AND child_id=?2 AND call_id=?3 LIMIT 2").map_err(db_error)?;
                let old=query.query_map(params![root_id,child.run_id,receipt.call.id],|row|row.get::<_,String>(0)).map_err(db_error)?
                    .map(|row| serde_json::from_str::<Saved>(&row.map_err(db_error)?).map_err(db_error)).collect::<Result<Vec<_>,_>>()?;
                if old.len()==1 && same(&receipt,&old[0].receipt) { return Ok(()); }
                if !old.is_empty() { return Err(Error::Checkpoint("reused child call ID requires an explicit model_sequence".into())); }
            }
            let key=key(&root_id,&child.run_id,epoch,&receipt.call.id);
            let old:Option<String>=tx.query_row("SELECT payload FROM agent_runtime_reconciliations WHERE key=?1",[&key],|row|row.get(0)).optional().map_err(db_error)?;
            if let Some(old)=old {
                let old:Saved=serde_json::from_str(&old).map_err(db_error)?;
                return if same(&receipt,&old.receipt) {Ok(())}else{Err(Error::Checkpoint("child reconciliation receipt cannot be changed".into()))};
            }
            if !pending {return Err(Error::Checkpoint("reconciliation does not match child's persisted operation".into()));}
            let count:u64=tx.query_row("SELECT COUNT(*) FROM agent_runtime_reconciliations WHERE root_id=?1",[&root_id],|row|row.get(0)).map_err(db_error)?;
            if count>=8192 {return Err(Error::Checkpoint("root reconciliation receipt capacity exceeded".into()));}
            let call_id=receipt.call.id.clone();let child_id=child.run_id.clone();let mut receipt=receipt;receipt.model_sequence=Some(epoch);
            let saved=Saved {receipt,model_sequence:epoch,thread_id:child.thread_id,composition:child.composition};
            tx.execute("INSERT INTO agent_runtime_reconciliations(key,root_id,child_id,call_id,payload) VALUES(?1,?2,?3,?4,?5)",params![key,root_id,child_id,call_id,serde_json::to_string(&saved).map_err(db_error)?]).map_err(db_error)?;
            Ok(())
        }).await
    }
}
struct ReceiptControl {
    store: SqliteStore,
    identity: SupervisedIdentity,
    key: String,
}
#[async_trait::async_trait]
impl ReconciliationControl for ReceiptControl {
    async fn reject(&self, reason: &str) -> Result<(), Error> {
        let lease = self.identity.lease.clone();
        let clock = self.store.clock.clone();
        let key = self.key.clone();
        let reason = reason.chars().take(1024).collect::<String>();
        self.store
            .transaction(move |tx| {
                check_lease(tx, &lease, clock.now_ms())?;
                tx.execute(
                    "UPDATE agent_runtime_reconciliations SET rejection=?1 WHERE key=?2",
                    params![reason, key],
                )
                .map_err(db_error)?;
                Ok(())
            })
            .await
    }
}
impl TreeObserver {
    pub(super) async fn reconciliation_input(
        &self,
        context: &RunContext,
        agent: &crate::Agent,
    ) -> Result<Option<ReconciliationInput>, Error> {
        let checkpoint = self
            .store
            .guarded(&self.identity.lease)
            .load(&agent.checkpoint_key(&context.thread_id))
            .await?;
        let Some(checkpoint) = checkpoint else {
            if context.run_id == self.identity.run_id {
                return Ok(None);
            }
            return Err(Error::Checkpoint("missing child checkpoint".into()));
        };
        let Some(call) = &checkpoint.state.in_flight else {
            return Ok(None);
        };
        if checkpoint.composition != agent.composition_identity() {
            return Err(Error::Checkpoint(
                "child reconciliation composition changed".into(),
            ));
        }
        let key = key(
            &self.identity.run_id,
            &context.run_id,
            checkpoint.state.model_sequence,
            &call.id,
        );
        let lease = self.identity.lease.clone();
        let clock = self.store.clock.clone();
        let lookup = key.clone();
        let row=self.store.transaction(move |tx| {
            check_lease(tx,&lease,clock.now_ms())?;
            tx.query_row("SELECT payload FROM agent_runtime_reconciliations WHERE key=?1 AND rejection IS NULL",[lookup],|row|row.get::<_,String>(0)).optional().map_err(db_error)
        }).await?;
        let Some(row) = row else { return Ok(None) };
        let saved: Saved = serde_json::from_str(&row).map_err(db_error)?;
        if saved.composition != checkpoint.composition
            || saved.thread_id != context.thread_id
            || saved.receipt.child_run_id != context.run_id
            || saved.receipt.model_sequence != Some(saved.model_sequence)
            || saved.receipt.call != *call
            || saved.model_sequence != checkpoint.state.model_sequence
        {
            return Err(Error::Checkpoint("child operator receipt changed".into()));
        }
        Ok(Some(ReconciliationInput {
            thread_id: context.thread_id.clone(),
            run_id: context.run_id.clone(),
            model_sequence: saved.model_sequence,
            call: saved.receipt.call,
            result: saved.receipt.result,
            is_error: saved.receipt.is_error,
            control: Arc::new(ReceiptControl {
                store: self.store.clone(),
                identity: self.identity.clone(),
                key,
            }),
        }))
    }
}
