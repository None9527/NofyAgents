//! Model evidence belongs to the recorded Agent's original recovery journal.
//! The root lease protects admission; the native sampler consumes the receipt.
use super::*;
use crate::governance::{ModelReconciliation, ModelReconciliationTarget, ModelRecovery};
#[cfg(test)]
mod tests;

struct Target {
    context: RunContext,
    composition: String,
    checkpoint_key: String,
}
impl RunSupervisor {
    async fn model_target(&self, root: &ExecutionRecord, target: &str) -> Result<Target, Error> {
        if target == root.run_id {
            if !root.snapshot.is_agent() {
                return Err(Error::Checkpoint(
                    "model evidence root must be a sampled Agent".into(),
                ));
            }
            return Ok(Target {
                context: RunContext::new(&root.thread_id, &root.run_id),
                composition: root.composition.clone(),
                checkpoint_key: crate::state::checkpoint_key(root.snapshot.name(), &root.thread_id),
            });
        }
        let root_id = root.run_id.clone();
        let target_id = target.to_owned();
        let child: ChildRunRecord = self
            .store
            .transaction(move |tx| {
                let payload: Option<String> = tx
                    .query_row(
                        "SELECT payload FROM agent_runtime_children WHERE key=?1 AND root_id=?2",
                        params![super::super::child_key(&root_id, &target_id), root_id],
                        |r| r.get(0),
                    )
                    .optional()
                    .map_err(db_error)?;
                let child: ChildRunRecord = serde_json::from_str(&payload.ok_or_else(|| {
                    Error::Checkpoint("model evidence target is not a recorded descendant".into())
                })?)
                .map_err(db_error)?;
                if child.root_run_id != root_id || child.run_id != target_id {
                    return Err(Error::Checkpoint(
                        "model evidence child identity changed".into(),
                    ));
                }
                Ok(child)
            })
            .await?;
        if child.kind.as_deref().is_some_and(|kind| kind != "agent") {
            return Err(Error::Checkpoint(
                "model evidence target must be a sampled Agent".into(),
            ));
        }
        Ok(Target {
            context: RunContext::new(&child.thread_id, &child.run_id),
            composition: child.composition,
            checkpoint_key: child.checkpoint_key.unwrap_or_else(|| {
                crate::state::checkpoint_key(&child.agent_name, &child.thread_id)
            }),
        })
    }
    /// Advisory pending intents for one root or recorded Agent descendant.
    /// No uploaded checkpoint address, model or request can create a target.
    pub async fn model_reconciliation_targets(
        &self,
        root: &str,
        target: &str,
    ) -> Result<Vec<ModelReconciliationTarget>, Error> {
        crate::system::bounded_name(root)?;
        if target.is_empty() || target.len() > 4096 {
            return Err(Error::Composition("invalid model recovery target".into()));
        }
        let root = self
            .store
            .execution_record(root)
            .await?
            .ok_or_else(|| Error::Checkpoint("root run not found".into()))?;
        let target = self.model_target(&root, target).await?;
        let cp = self
            .store
            .load(&target.checkpoint_key)
            .await?
            .ok_or_else(|| Error::Checkpoint("model target checkpoint missing".into()))?;
        validate(&cp, &target)?;
        ModelRecovery::new(
            Arc::new(self.store.clone()),
            &target.composition,
            &target.context,
        )
        .model_targets()
        .await
    }
    pub(in crate::supervisor) async fn accept_model_reconciliation_leased(
        &self,
        compiled: &ExecutionPlan,
        context: &RunContext,
        receipt: ModelReconciliation,
        command_id: &str,
        lease: &Lease,
    ) -> Result<(), Error> {
        receipt.validate()?;
        if lease.key != compiled.agent.checkpoint_key(&context.thread_id) {
            return Err(Error::Checkpoint(
                "model evidence root lease mismatch".into(),
            ));
        }
        let root = self
            .store
            .execution_record(&context.run_id)
            .await?
            .ok_or_else(|| Error::Checkpoint("root run not found".into()))?;
        if root.thread_id != context.thread_id
            || root.composition != compiled.agent.composition_identity()
            || serde_json::to_value(&root.snapshot).map_err(db_error)?
                != serde_json::to_value(&compiled.snapshot).map_err(db_error)?
        {
            return Err(Error::Checkpoint(
                "model evidence root identity/composition changed".into(),
            ));
        }
        let root_id = context.run_id.clone();
        let clock = self.store.clock.clone();
        let check = lease.clone();
        self.store
            .transaction(move |tx| {
                check_lease(tx, &check, clock.now_ms())?;
                jobs::ensure_thread_open(tx, &check.key)?;
                let active: Option<String> = tx
                    .query_row(
                        "SELECT active_run FROM agent_runtime_threads WHERE key=?1",
                        [&check.key],
                        |r| r.get(0),
                    )
                    .optional()
                    .map_err(db_error)?;
                if active.as_deref() != Some(&root_id) {
                    return Err(Error::Checkpoint(
                        "model evidence root no longer owns this thread".into(),
                    ));
                }
                Ok(())
            })
            .await?;
        let target = self
            .model_target(&root, &receipt.ticket.request.run_id)
            .await?;
        if target.context.thread_id != receipt.ticket.request.thread_id {
            return Err(Error::Checkpoint(
                "model evidence target thread changed".into(),
            ));
        }
        let guarded = Arc::new(self.store.guarded(lease));
        let cp = guarded
            .load(&target.checkpoint_key)
            .await?
            .ok_or_else(|| Error::Checkpoint("model target checkpoint missing".into()))?;
        validate(&cp, &target)?;
        let job = self
            .store
            .execution_job(&context.run_id)
            .await?
            .ok_or_else(|| Error::Checkpoint("model evidence job missing".into()))?;
        let journal = ModelRecovery::new(guarded, &target.composition, &target.context);
        journal
            .accept_model_command(
                receipt,
                !matches!(job.status, crate::supervisor::jobs::JobStatus::Closed),
                Some(command_id),
            )
            .await
    }
    pub(in crate::supervisor) async fn model_command_accepted(
        &self,
        action: &crate::supervisor::jobs::ManagedAction,
    ) -> Result<bool, Error> {
        let crate::supervisor::jobs::ManagedCommand::ReconcileModel { receipt } = &action.command
        else {
            return Ok(false);
        };
        let root = self
            .store
            .execution_record(&action.run_id)
            .await?
            .ok_or_else(|| Error::Checkpoint("model evidence root missing".into()))?;
        let target = self
            .model_target(&root, &receipt.ticket.request.run_id)
            .await?;
        ModelRecovery::new(
            Arc::new(self.store.clone()),
            &target.composition,
            &target.context,
        )
        .model_command_accepted(&action.command_id, receipt)
        .await
    }
}
fn validate(cp: &crate::Checkpoint, target: &Target) -> Result<(), Error> {
    if cp.version != 1
        || cp.composition != target.composition
        || cp.state.execution_run_id.as_deref() != Some(&target.context.run_id)
    {
        return Err(Error::Checkpoint(
            "model target checkpoint identity changed".into(),
        ));
    }
    Ok(())
}
