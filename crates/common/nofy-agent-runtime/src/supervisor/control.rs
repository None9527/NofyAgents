use super::*;
use crate::mailbox::InputAddress;
use crate::{controllers::ControllerBinding, durable::GuardedCheckpointer, mailbox::InputInbox};
use std::collections::BTreeMap;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct ChildCancelResumeCommand {
    pub command_id: String,
    pub address: InputAddress,
    pub through: u64,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(
    tag = "kind",
    content = "command",
    rename_all = "snake_case",
    deny_unknown_fields
)]
pub enum RunControlCommand {
    RetryModel(crate::governance::ModelRetryCommand),
    ResumeChildCancel(ChildCancelResumeCommand),
}
pub(super) struct PendingChildCancel(pub ChildCancelResumeCommand);
impl RunSupervisor {
    pub async fn control_program(
        &self,
        compiled: &CompiledProgram,
        command: RunControlCommand,
        mut context: RunContext,
    ) -> Result<RunOutcome, Error> {
        let input = match command {
            RunControlCommand::RetryModel(command) => RunInput::retry_model(command),
            RunControlCommand::ResumeChildCancel(command) => {
                context.capabilities.insert(PendingChildCancel(command));
                RunInput::resume()
            }
        };
        self.execute_program(compiled, input, context).await
    }
    /// Apply an explicit command to the original root. Command acceptance is
    /// persisted before the resumed loop can dispatch an effect.
    pub async fn control(
        &self,
        compiled: &CompiledAgent,
        command: RunControlCommand,
        mut context: RunContext,
    ) -> Result<RunOutcome, Error> {
        match command {
            RunControlCommand::RetryModel(command) => {
                self.execute(compiled, RunInput::retry_model(command), context)
                    .await
            }
            RunControlCommand::ResumeChildCancel(command) => {
                context.capabilities.insert(PendingChildCancel(command));
                self.execute(compiled, RunInput::resume(), context).await
            }
        }
    }
    pub(super) async fn authorize_child_cancel(
        &self,
        compiled: &ExecutionPlan,
        context: &RunContext,
        command: &ChildCancelResumeCommand,
        binding: &ControllerBinding,
        store: Arc<GuardedCheckpointer>,
    ) -> Result<(), Error> {
        command.address.key()?;
        if command.command_id.trim().is_empty()
            || command.command_id.len() > 256
            || command.through == 0
            || command.through > i64::MAX as u64
            || command.address.root_run_id != context.run_id
            || command.address.run_id == context.run_id
        {
            return Err(Error::Checkpoint(
                "invalid descendant cancel resume identity".into(),
            ));
        }
        if crate::governance::ModelRecovery::new(
            store.clone(),
            compiled.agent.composition_identity(),
            context,
        )
        .command_seen(&command.command_id)
        .await?
        {
            return Err(Error::Checkpoint(
                "control command ID already belongs to a root model retry".into(),
            ));
        }
        if binding.accepted_cancel(command).await? {
            return Ok(());
        }
        let root = store
            .load(&compiled.agent.checkpoint_key(&context.thread_id))
            .await?
            .ok_or_else(|| Error::Checkpoint("root checkpoint missing".into()))?;
        if root.version != 1 || root.composition != compiled.agent.composition_identity() {
            return Err(Error::Checkpoint("root checkpoint identity changed".into()));
        }
        let children = self
            .store
            .children(&context.run_id)
            .await?
            .into_iter()
            .map(|c| (c.run_id.clone(), c))
            .collect::<BTreeMap<_, _>>();
        let child = children.get(&command.address.run_id).ok_or_else(|| {
            Error::Checkpoint("cancel resume target is not a recorded descendant".into())
        })?;
        if child.kind.as_deref().is_some_and(|kind| kind != "agent")
            || child.agent_name != command.address.agent
            || child.thread_id != command.address.thread_id
            || !matches!(
                child.status.as_str(),
                "cancelled" | "running" | "paused" | "failed"
            )
        {
            return Err(Error::Checkpoint(
                "cancel resume target is not an unfinished Agent".into(),
            ));
        }
        if let Some(cp) = store
            .load(&crate::state::checkpoint_key(
                &child.agent_name,
                &child.thread_id,
            ))
            .await?
        {
            if cp.version != 1
                || cp.composition != child.composition
                || cp.state.execution_run_id.as_deref() != Some(&child.run_id)
            {
                return Err(Error::Checkpoint(
                    "cancelled child checkpoint is complete or changed".into(),
                ));
            }
        }
        // Validate active ownership through the actual fenced consumer; then
        // bind the exact still-unacknowledged cursor, not a later cancellation.
        store.pending_cancel(&command.address).await?;
        let key = command.address.key()?;
        let through = command.through;
        let lease = store.lease.clone();
        let clock = store.store.clock.clone();
        self.store.transaction(move|tx| {
            crate::durable::check_lease(tx,&lease,clock.now_ms())?;
            let exists:bool=tx.query_row("SELECT EXISTS(SELECT 1 FROM agent_runtime_cancel WHERE address=?1 AND sequence=?2 AND acknowledged=0)",params![key,through],|row|row.get(0)).map_err(db_error)?;
            if !exists {return Err(Error::Checkpoint("cancel resume cursor is unknown or already acknowledged".into()))}
            Ok(())
        }).await?;
        let path = super::child_retry::recovery_path(
            &root,
            child,
            context,
            &children,
            binding,
            store,
            super::child_retry::RecoveryMode::Cancel,
        )
        .await?;
        binding
            .authorize_cancel(
                command,
                &context.run_id,
                &path.runs,
                &path.graphs,
                &path.hooks,
            )
            .await
    }
}
