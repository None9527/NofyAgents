use super::*;
use crate::hooks::{
    HookEvent,
    primitive::{self, HookReconciliation, HookRecoveryPage},
};
use std::collections::BTreeMap;

impl RunSupervisor {
    async fn hook_parent_path(
        &self,
        root: &str,
        event: &HookEvent,
        store: Arc<dyn Checkpointer>,
    ) -> Result<(), Error> {
        if event.scope.root_run_id != root {
            return Err(Error::Checkpoint(
                "Hook recovery event belongs to another root".into(),
            ));
        }
        if event.scope.run_id == root {
            return Ok(());
        }
        let record = self
            .store
            .execution_record(root)
            .await?
            .ok_or_else(|| Error::Checkpoint("Hook recovery root missing".into()))?;
        let id = root.to_owned();
        let key: String = self
            .store
            .transaction(move |tx| {
                tx.query_row(
                    "SELECT thread_key FROM agent_runtime_runs WHERE id=?1",
                    [id],
                    |r| r.get(0),
                )
                .map_err(db_error)
            })
            .await?;
        let cp = store
            .load(&key)
            .await?
            .ok_or_else(|| Error::Checkpoint("Hook root checkpoint missing".into()))?;
        if cp.composition != record.composition {
            return Err(Error::Checkpoint(
                "Hook recovery root composition changed".into(),
            ));
        }
        let children = self
            .store
            .children(root)
            .await?
            .into_iter()
            .map(|child| (child.run_id.clone(), child))
            .collect::<BTreeMap<_, _>>();
        let target = children
            .get(&event.scope.run_id)
            .ok_or_else(|| Error::Checkpoint("Hook source is not a recorded descendant".into()))?;
        if target.thread_id != event.scope.thread_id {
            return Err(Error::Checkpoint("Hook source thread changed".into()));
        }
        let scheme = match &record.snapshot {
            crate::program::RunSnapshot::Agent(snapshot) => snapshot.agent.settings.scope_identity,
            crate::program::RunSnapshot::Program(snapshot) => match &snapshot.program {
                crate::program::ProgramSnapshot::Agent { snapshot } => {
                    snapshot.agent.settings.scope_identity
                }
                crate::program::ProgramSnapshot::Tool { snapshot, .. } => {
                    snapshot.definition.scope_identity
                }
                crate::program::ProgramSnapshot::Event { snapshot } => {
                    snapshot.definition.host.scope_identity
                }
                #[cfg(feature = "workflow")]
                crate::program::ProgramSnapshot::Workflow { snapshot, .. } => {
                    snapshot.document.host.scope_identity
                }
            },
        };
        let mut context = RunContext::new(&record.thread_id, root);
        crate::identity::bind(&mut context, scheme)?;
        let binding = crate::controllers::ControllerBinding::new(
            store.clone(),
            &record.composition,
            &context,
        );
        super::super::child_retry::recovery_path(
            &cp,
            target,
            &context,
            &children,
            &binding,
            store,
            super::super::child_retry::RecoveryMode::Effect,
        )
        .await?;
        Ok(())
    }

    pub async fn hook_reconciliation_targets(
        &self,
        root: &str,
        after: Option<&str>,
        limit: usize,
    ) -> Result<HookRecoveryPage, Error> {
        let mut page = primitive::targets(&self.store, root, after, limit).await?;
        let mut active = Vec::new();
        for target in page.targets {
            match self
                .hook_parent_path(root, &target.event, Arc::new(self.store.clone()))
                .await
            {
                Ok(()) => active.push(target),
                Err(Error::Checkpoint(_)) => {}
                Err(error) => return Err(error),
            }
        }
        page.targets = active;
        Ok(page)
    }

    /// Records operator evidence under the original root lease. Execution is
    /// resumed explicitly, through the same program and Loader path.
    pub async fn reconcile_hook(
        &self,
        root: &str,
        command: &str,
        receipt: HookReconciliation,
    ) -> Result<(), Error> {
        receipt.validate()?;
        crate::system::bounded_name(root)?;
        crate::system::bounded_name(command)?;
        let id = root.to_owned();
        let key: String = self
            .store
            .transaction(move |tx| {
                tx.query_row(
                    "SELECT thread_key FROM agent_runtime_runs WHERE id=?1",
                    [id],
                    |r| r.get(0),
                )
                .map_err(db_error)
            })
            .await?;
        let lease = self
            .store
            .acquire(
                &key,
                nofy_tool_protocol::ToolCallId::new_v7().to_string(),
                self.ttl,
            )
            .await?;
        let result = self
            .accept_hook_receipt(root, command, receipt, &lease)
            .await;
        let released = self.store.release(&lease).await;
        match result {
            Ok(()) => released,
            Err(error) => Err(error),
        }
    }

    async fn accept_hook_receipt(
        &self,
        root: &str,
        command: &str,
        receipt: HookReconciliation,
        lease: &Lease,
    ) -> Result<(), Error> {
        if primitive::accepted(&self.store, root, command, &receipt).await? {
            return Ok(());
        }
        let record = self
            .store
            .execution_record(root)
            .await?
            .ok_or_else(|| Error::Checkpoint("Hook recovery root missing".into()))?;
        let root_id = root.to_owned();
        let check = lease.clone();
        let clock = self.store.clock.clone();
        self.store.transaction(move|tx| {
            check_lease(tx,&check,clock.now_ms())?;
            jobs::ensure_thread_open(tx,&check.key)?;
            let owns:bool=tx.query_row("SELECT EXISTS(SELECT 1 FROM agent_runtime_runs WHERE id=?1 AND thread_key=?2)",params![root_id,check.key],|r|r.get(0)).map_err(db_error)?;
            if !owns {return Err(Error::Checkpoint("Hook recovery lease belongs to another root thread".into()));} Ok(())
        }).await?;
        // The native target lookup and acceptance use the same immutable
        // intent ticket. The root fence keeps its controller path stationary.
        let target = primitive::target(&self.store, root, &receipt.ticket).await?;
        self.hook_parent_path(root, &target.event, Arc::new(self.store.guarded(lease)))
            .await?;
        primitive::accept(
            &self.store,
            lease,
            root,
            &record.composition,
            command,
            receipt,
        )
        .await
    }

    pub(in crate::supervisor) async fn accept_hook_reconciliation_leased(
        &self,
        compiled: &ExecutionPlan,
        context: &RunContext,
        receipt: HookReconciliation,
        command: &str,
        lease: &Lease,
    ) -> Result<(), Error> {
        if lease.key != compiled.agent.checkpoint_key(&context.thread_id) {
            return Err(Error::Checkpoint(
                "Hook evidence root lease mismatch".into(),
            ));
        }
        let root = self
            .store
            .execution_record(&context.run_id)
            .await?
            .ok_or_else(|| Error::Checkpoint("Hook recovery root missing".into()))?;
        if root.thread_id != context.thread_id
            || root.composition != compiled.agent.composition_identity()
            || serde_json::to_value(&root.snapshot).map_err(db_error)?
                != serde_json::to_value(&compiled.snapshot).map_err(db_error)?
        {
            return Err(Error::Checkpoint(
                "Hook evidence root identity/composition changed".into(),
            ));
        }
        self.accept_hook_receipt(&context.run_id, command, receipt, lease)
            .await
    }

    pub(in crate::supervisor) async fn hook_command_accepted(
        &self,
        action: &jobs::ManagedAction,
    ) -> Result<bool, Error> {
        let jobs::ManagedCommand::ReconcileHook { receipt } = &action.command else {
            return Ok(false);
        };
        primitive::accepted(&self.store, &action.run_id, &action.command_id, receipt).await
    }
}
