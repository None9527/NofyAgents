//! Optional adapter for the existing Rhai workflow engine. It dispatches the
//! same compiled Agents, rather than implementing another model/tool loop.
pub mod compile;
pub mod declarative;
pub mod graph;
pub mod modules;
pub mod spec;

use crate::{Agent, Error, RunContext, RunInput, RunOutcome};
use nofy_workflow::{
    AgentResult, HostError, Journal, WorkflowHostRequest, WorkflowOutcome, WorkflowRunParams,
};
use std::collections::BTreeMap;
use std::sync::Arc;

/// An explicit shared backend pins the complete workflow recipe and child
/// identities. Durable hosts should supply a lease-fenced backend here.
#[derive(Clone)]
pub struct WorkflowCheckpointer(pub Arc<dyn crate::Checkpointer>);

pub async fn run(
    script: String,
    args: serde_json::Value,
    journal: Journal,
    mut agents: BTreeMap<String, Agent>,
    context: RunContext,
    max_calls: u64,
) -> Result<WorkflowOutcome, Error> {
    let workflow_store = context.capabilities.get::<WorkflowCheckpointer>();
    if let Some(store) = &workflow_store {
        let versions: BTreeMap<_, _> = agents
            .iter()
            .map(|(id, agent)| (id, agent.composition_identity()))
            .collect();
        let composition = serde_json::to_string(&(1u32, &script, &args, versions))
            .map_err(|e| Error::Composition(e.to_string()))?;
        let key = format!(
            "workflow-binding:{}",
            serde_json::to_string(&(context.thread_id.as_str(), context.run_id.as_str()))
                .expect("workflow identity contains strings")
        );
        match store.0.load(&key).await? {
            Some(checkpoint)
                if checkpoint.version == 1 && checkpoint.composition == composition => {}
            Some(_) => {
                return Err(Error::Checkpoint(
                    "workflow recipe/input/agent versions changed".into(),
                ));
            }
            None => {
                store
                    .0
                    .save(
                        &key,
                        None,
                        crate::Checkpoint {
                            version: 1,
                            revision: 1,
                            composition,
                            state: crate::RunState::default(),
                        },
                    )
                    .await?
            }
        }
        agents = agents
            .into_iter()
            .map(|(id, agent)| (id, agent.with_checkpointer(store.0.clone())))
            .collect();
    }
    // Completed journaled calls retain quota and child identity on replay.
    let previous_calls = journal.agent_reservation_count();
    let (host_tx, mut requests) = tokio::sync::mpsc::unbounded_channel();
    let cancel = context.cancel.clone();
    let task = tokio::task::spawn_blocking(move || {
        nofy_workflow::run_workflow(WorkflowRunParams {
            script,
            args,
            journal,
            host_tx,
            cancel,
            max_ops: WorkflowRunParams::DEFAULT_MAX_OPS,
        })
    });
    let mut spent = previous_calls;
    let mut reserved = 0u64;
    let mut tokens = 0u64;
    while let Some(request) = requests.recv().await {
        match request {
            WorkflowHostRequest::ReserveAgentCalls { count, reply } => {
                let total = spent.saturating_add(reserved).saturating_add(count);
                let result = if total > max_calls {
                    Err(HostError::AgentCallQuotaExceeded {
                        requested: total,
                        maximum: max_calls,
                    })
                } else {
                    reserved += count;
                    Ok(())
                };
                let _ = reply.send(result);
            }
            WorkflowHostRequest::ReleaseAgentCalls { count, reply } => {
                reserved = reserved.saturating_sub(count);
                let _ = reply.send(Ok(()));
            }
            WorkflowHostRequest::SpawnAgent { opts, reply } => {
                let id = opts.agent_type.as_deref().unwrap_or("default");
                let unsupported = opts.model.is_some()
                    || opts.effort.is_some()
                    || opts.max_output_tokens.is_some()
                    || opts.output_schema.is_some()
                    || opts.capability_mode.is_some()
                    || opts.isolation_worktree
                    || opts.fork_context
                    || opts.resume_from.is_some();
                let result = if unsupported {
                    Err(HostError::Unsupported("per-call model, output or workspace overrides require an application adapter".into()))
                } else if spent >= max_calls {
                    Err(HostError::BudgetExceeded)
                } else if let Some(agent) = agents.get(id) {
                    spent += 1;
                    reserved = reserved.saturating_sub(1);
                    let mut child = context.clone();
                    let identity = serde_json::to_string(&(
                        context.thread_id.as_str(),
                        context.run_id.as_str(),
                        spent,
                    ))
                    .expect("workflow child identity contains strings and integers");
                    child.thread_id = format!("workflow:{identity}");
                    child.run_id = format!("workflow:{identity}");
                    let start = std::time::Instant::now();
                    let input = if let Some(store) = agent.checkpoint_store() {
                        match store.load(&agent.checkpoint_key(&child.thread_id)).await {
                            Ok(Some(_)) if workflow_store.is_some() => Ok(RunInput::resume()),
                            Ok(Some(_)) => Err(Error::Checkpoint(
                                "workflow resume requires WorkflowCheckpointer".into(),
                            )),
                            Ok(None) => Ok(RunInput::new(opts.prompt)),
                            Err(error) => Err(error),
                        }
                    } else {
                        Ok(RunInput::new(opts.prompt))
                    };
                    let result = match input {
                        Ok(input) => agent.invoke(input, child).await,
                        Err(error) => Err(error),
                    };
                    match result {
                        Ok(RunOutcome::Completed { output, state }) => {
                            let used = state.input_tokens.saturating_add(state.output_tokens);
                            tokens = tokens.saturating_add(used);
                            Ok(AgentResult {
                                agent_id: id.to_string(),
                                success: true,
                                output: serde_json::Value::String(output),
                                cancelled: false,
                                tokens_used: used,
                                duration_ms: start.elapsed().as_millis() as u64,
                            })
                        }
                        Ok(RunOutcome::Cancelled { .. }) => Err(HostError::Cancelled),
                        Ok(RunOutcome::Paused { reason, .. }) if workflow_store.is_some() => {
                            Err(HostError::Paused {
                                kind: nofy_workflow::PauseKind::User,
                                message: reason.to_string(),
                            })
                        }
                        Ok(RunOutcome::Paused { .. }) => Err(HostError::Unsupported(
                            "workflow suspension requires explicit WorkflowCheckpointer".into(),
                        )),
                        Ok(RunOutcome::BudgetExceeded { .. }) => Err(HostError::BudgetExceeded),
                        Err(error) => Err(HostError::Failed(error.to_string())),
                    }
                } else {
                    Err(HostError::Unsupported(format!("unregistered agent: {id}")))
                };
                let _ = reply.send(result);
            }
            WorkflowHostRequest::BudgetQuery { reply } => {
                let _ = reply.send(Ok(nofy_workflow::BudgetState {
                    total: None,
                    spent: tokens,
                    reserved: 0,
                    remaining: None,
                }));
            }
            WorkflowHostRequest::RenderTemplate { reply, .. }
            | WorkflowHostRequest::ReadScratchFile { reply, .. }
            | WorkflowHostRequest::WriteScratchFile { reply, .. }
            | WorkflowHostRequest::GitDiffSince { reply, .. } => {
                let _ = reply.send(Err(HostError::Unsupported(
                    "host filesystem/template capabilities were not installed".into(),
                )));
            }
            WorkflowHostRequest::Phase { .. }
            | WorkflowHostRequest::Log { .. }
            | WorkflowHostRequest::Telemetry { .. } => {}
        }
    }
    task.await
        .map_err(|e| Error::Composition(format!("workflow host failed: {e}")))
}
