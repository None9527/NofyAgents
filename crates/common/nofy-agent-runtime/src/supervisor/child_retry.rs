use super::*;
#[cfg(feature = "workflow")]
mod workflow;
use crate::{
    controllers::ControllerBinding,
    governance::{ModelRecovery, ModelRetryCommand, ModelRetryTicket},
};
use std::collections::{BTreeMap, BTreeSet};
fn pending(state: &RunState, ticket: &ModelRetryTicket) -> bool {
    state
        .pending_model
        .as_ref()
        .is_some_and(|p| p.operation_id == ticket.operation_id && ticket.operation_scope.is_none())
        || state
            .context_progress
            .pending
            .as_ref()
            .is_some_and(|p| ticket.operation_scope.as_deref() == Some(p.operation.as_str()))
}
async fn checkpoint(
    store: &dyn Checkpointer,
    child: &ChildRunRecord,
) -> Result<crate::Checkpoint, Error> {
    let cp = store
        .load(&crate::state::checkpoint_key(
            &child.agent_name,
            &child.thread_id,
        ))
        .await?
        .ok_or_else(|| Error::Checkpoint("child has no checkpoint".into()))?;
    if cp.version != 1
        || cp.composition != child.composition
        || cp.state.execution_run_id.as_deref() != Some(child.run_id.as_str())
    {
        return Err(Error::Checkpoint(
            "child recovery checkpoint identity changed".into(),
        ));
    }
    Ok(cp)
}
impl RunSupervisor {
    /// Inspect a known model failure of a recorded descendant. This issues no
    /// retry authority; execute with retry_model validates the complete path.
    pub async fn child_model_retry_ticket(
        &self,
        root_run_id: &str,
        child_run_id: &str,
    ) -> Result<Option<ModelRetryTicket>, Error> {
        if self.store.execution_record(root_run_id).await?.is_none() {
            return Err(Error::Checkpoint("root run not found".into()));
        }
        let child = self
            .store
            .children(root_run_id)
            .await?
            .into_iter()
            .find(|c| c.run_id == child_run_id)
            .ok_or_else(|| Error::Checkpoint("retry target is not a recorded child".into()))?;
        if child.kind.as_deref().is_some_and(|kind| kind != "agent") {
            return Err(Error::Checkpoint(
                "retry ticket targets a sampled Agent".into(),
            ));
        }
        let cp = checkpoint(&self.store, &child).await?;
        let recovery = ModelRecovery::new(
            Arc::new(self.store.clone()),
            &child.composition,
            &RunContext::new(&child.thread_id, &child.run_id),
        );
        Ok(recovery
            .failure_ticket()
            .await?
            .filter(|ticket| pending(&cp.state, ticket)))
    }
    pub(super) async fn authorize_child_retry(
        &self,
        compiled: &ExecutionPlan,
        context: &RunContext,
        command: &ModelRetryCommand,
        binding: &ControllerBinding,
        store: Arc<dyn Checkpointer>,
    ) -> Result<(), Error> {
        if command.command_id.trim().is_empty() || command.command_id.len() > 256 {
            return Err(Error::Checkpoint("invalid child retry command ID".into()));
        }
        if ModelRecovery::new(
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
        if binding.accepted(command).await? {
            return Ok(());
        }
        let root = store
            .load(&compiled.agent.checkpoint_key(&context.thread_id))
            .await?
            .ok_or_else(|| Error::Checkpoint("root has no checkpoint".into()))?;
        if root.version != 1 || root.composition != compiled.agent.composition_identity() {
            return Err(Error::Checkpoint("root composition/version changed".into()));
        }
        let children = self
            .store
            .children(&context.run_id)
            .await?
            .into_iter()
            .map(|c| (c.run_id.clone(), c))
            .collect::<BTreeMap<_, _>>();
        let target = children.get(&command.ticket.run_id).ok_or_else(|| {
            Error::Checkpoint("model ticket does not target this root's descendant".into())
        })?;
        if target.thread_id != command.ticket.thread_id {
            return Err(Error::Checkpoint("child retry thread mismatch".into()));
        }
        let cp = checkpoint(store.as_ref(), target).await?;
        let recovery = ModelRecovery::new(
            store.clone(),
            &target.composition,
            &RunContext::new(&target.thread_id, &target.run_id),
        );
        if recovery.failure_ticket().await?.as_ref() != Some(&command.ticket)
            || !pending(&cp.state, &command.ticket)
            || cp.state.in_flight.is_some()
            || !cp.state.pending_tools.is_empty()
            || !cp.state.hook_progress.facts.is_empty()
        {
            return Err(Error::Checkpoint(
                "child model retry ticket is stale, unknown, or not at a model boundary".into(),
            ));
        }
        let path = recovery_path(
            &root,
            target,
            context,
            &children,
            binding,
            store,
            RecoveryMode::Model,
        )
        .await?;
        binding
            .authorize(
                command,
                &context.run_id,
                &path.runs,
                &path.graphs,
                &path.hooks,
            )
            .await
    }
}

fn parent_call(cp: &crate::Checkpoint) -> Result<&crate::ToolCall, Error> {
    if cp.state.complete || !cp.state.hook_progress.facts.is_empty() {
        return Err(Error::Checkpoint(
            "parent is complete or has unsettled Hook facts".into(),
        ));
    }
    cp.state
        .in_flight
        .as_ref()
        .filter(|call| cp.state.pending_tools.front() == Some(*call))
        .ok_or_else(|| Error::Checkpoint("parent is not waiting at this child boundary".into()))
}
async fn check_group_boundary(
    binding: &ControllerBinding,
    current: &ChildRunRecord,
    mode: RecoveryMode,
) -> Result<(), Error> {
    if mode == RecoveryMode::Effect {
        return if matches!(
            current.status.as_str(),
            "paused" | "running" | "budget_exceeded" | "cancelled"
        ) && !binding
            .settled_failure(&current.run_id, &current.composition)
            .await?
        {
            Ok(())
        } else {
            Err(Error::Checkpoint(
                "Hook source is no longer an unsettled descendant".into(),
            ))
        };
    }
    if binding
        .settled_failure(&current.run_id, &current.composition)
        .await?
        || current.status == "paused"
        || (mode == RecoveryMode::Cancel
            && matches!(current.status.as_str(), "cancelled" | "running" | "failed"))
    {
        Ok(())
    } else {
        Err(Error::Checkpoint("resume the interrupted controller to settle its known result before requesting model retry".into()))
    }
}

#[derive(Clone, Copy, PartialEq, Eq)]
pub(super) enum RecoveryMode {
    Model,
    Cancel,
    Effect,
}
pub(super) struct RecoveryPath {
    pub runs: Vec<String>,
    pub graphs: Vec<crate::controllers::GraphRoute>,
    pub hooks: Vec<crate::controllers::HookRoute>,
}
pub(super) async fn recovery_path(
    root: &crate::Checkpoint,
    target: &ChildRunRecord,
    context: &RunContext,
    children: &BTreeMap<String, ChildRunRecord>,
    binding: &ControllerBinding,
    store: Arc<dyn Checkpointer>,
    mode: RecoveryMode,
) -> Result<RecoveryPath, Error> {
    let mut path = Vec::new();
    #[cfg(feature = "workflow")]
    let mut routes = Vec::new();
    #[cfg(not(feature = "workflow"))]
    let routes = Vec::new();
    #[cfg(feature = "workflow")]
    let mut hook_routes = Vec::new();
    #[cfg(not(feature = "workflow"))]
    let hook_routes = Vec::new();
    let mut seen = BTreeSet::new();
    let mut current = target;
    loop {
        if !seen.insert(current.run_id.clone()) || path.len() >= 128 {
            return Err(Error::Checkpoint(
                "invalid/cyclic child controller path".into(),
            ));
        }
        path.push(current.run_id.clone());
        let parent = if current.parent_run_id == context.run_id {
            None
        } else {
            Some(children.get(&current.parent_run_id).ok_or_else(|| {
                Error::Checkpoint("child controller has an unrecorded parent".into())
            })?)
        };
        let (parent_thread, parent_run) = parent
            .map_or((&context.thread_id, &context.run_id), |p| {
                (&p.thread_id, &p.run_id)
            });
        match current.kind.as_deref().unwrap_or("agent") {
            "agent" => {
                check_group_boundary(binding, current, mode).await?;
                let parent_cp = match parent {
                    Some(parent) => checkpoint(store.as_ref(), parent).await?,
                    None => root.clone(),
                };
                let call = parent_call(&parent_cp)?;
                let expected = crate::identity::child_id(
                    context,
                    parent_thread,
                    parent_run,
                    Some(parent_cp.state.model_sequence),
                    &call.id,
                );
                if expected != current.run_id || expected != current.thread_id {
                    return Err(Error::Checkpoint(
                        "child retry path does not match the frozen parent call".into(),
                    ));
                }
            }
            #[cfg(feature = "workflow")]
            "tool_program" if current.run_id.starts_with("workflow-hook:") => {
                hook_routes.push(
                    workflow::hook_route(
                        current,
                        parent_thread,
                        parent_run,
                        binding,
                        store.clone(),
                    )
                    .await?,
                );
            }
            #[cfg(feature = "workflow")]
            "tool_program" if current.run_id.starts_with("workflow-host:") => {
                check_group_boundary(binding, current, mode).await?;
                let parent_cp = match parent {
                    Some(parent) => checkpoint(store.as_ref(), parent).await?,
                    None => root.clone(),
                };
                let call = parent_call(&parent_cp)?;
                use sha2::{Digest, Sha256};
                let expected = format!(
                    "workflow-host:{:x}",
                    Sha256::digest(
                        serde_json::to_vec(&(
                            parent_thread,
                            parent_run,
                            Some(parent_cp.state.model_sequence),
                            &call.id
                        ))
                        .map_err(db_error)?
                    )
                );
                let host_cp = checkpoint(store.as_ref(), current).await?;
                let host_call = parent_call(&host_cp)?;
                if expected != current.run_id
                    || current.thread_id != expected
                    || host_call.name != "workflow_execute"
                    || host_call.id != "workflow-root"
                {
                    return Err(Error::Checkpoint("workflow host retry path changed".into()));
                }
            }
            #[cfg(feature = "workflow")]
            "tool_program" | "workflow_subworkflow" | "workflow_loop" => {
                if let Some(route) = workflow::graph_route(
                    current,
                    parent_thread,
                    parent_run,
                    children,
                    store.as_ref(),
                    mode,
                )
                .await?
                {
                    routes.push(route);
                }
            }
            #[cfg(feature = "workflow")]
            "workflow_iteration" => {
                let parent = parent
                    .ok_or_else(|| Error::Checkpoint("iteration has no loop parent".into()))?;
                let suffix = current
                    .run_id
                    .strip_prefix(&format!("{}:iteration:", parent.run_id))
                    .ok_or_else(|| Error::Checkpoint("iteration identity changed".into()))?;
                let index: u32 = suffix.parse().map_err(db_error)?;
                let status_at_boundary = matches!(current.status.as_str(), "failed" | "waiting")
                    || (mode == RecoveryMode::Cancel
                        && matches!(current.status.as_str(), "cancelled" | "running"));
                if parent.kind.as_deref() != Some("workflow_loop")
                    || suffix != index.to_string()
                    || index >= 128
                    || current.thread_id != current.run_id
                    || !status_at_boundary
                {
                    return Err(Error::Checkpoint(
                        "iteration is not at the failed loop boundary".into(),
                    ));
                }
            }
            _ => {
                return Err(Error::Composition(
                    "unsupported child recovery controller".into(),
                ));
            }
        }
        if parent.is_none() {
            break;
        }
        current = parent.expect("parent checked");
    }
    Ok(RecoveryPath {
        runs: path,
        graphs: routes,
        hooks: hook_routes,
    })
}
