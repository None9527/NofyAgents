//! Resumable DAG driver. Nodes keep stable invocation identities and call the
//! shared ToolRuntime/Agent boundaries; completed nodes are never rerun.
mod hosted;
mod human;
mod node;
mod recovery;
mod state;
mod tree;
use crate::events::RunEvent;
use hosted::HostedGraphDispatch;
use node::{execute_node, increment_depth};
pub use state::{
    GraphFact, GraphHalt, HumanReceipt, HumanResponse, NodeProgress, WorkflowProgress,
};
use state::{graph_key, save_progress, validate_state};

use super::{
    compile::{CompiledWorkflow, Environment},
    spec::*,
};
use crate::{
    composition::{ChildControl, ChildObserverBinding, ChildOutcome, ParentCheckpointer},
    *,
};
use futures::{StreamExt, future::BoxFuture};
use nofy_tool_protocol::ToolId;
use nofy_tool_runtime::{ToolCallContext, ToolDispatch, ToolStream, TypedToolOutput};
use nofy_tool_types::ToolDefinition;
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use sha2::{Digest, Sha256};
use std::{
    collections::{BTreeMap, BTreeSet},
    sync::Arc,
};

enum GraphOutcome {
    Completed(Value),
    Paused(Value),
    Cancelled,
    BudgetExceeded,
    Failed(String),
    Checkpoint(String),
}
struct GraphDispatch {
    environment: Arc<Environment>,
    entry: crate::registry::ModuleRef,
}
pub(super) fn entry(
    environment: Arc<Environment>,
    reference: crate::registry::ModuleRef,
    name: String,
    description: String,
) -> ToolEntry {
    let spec = environment.plans[&reference].spec();
    ToolEntry {
        definition: ToolDefinition::function(
            name,
            Some(description),
            json!({"type":"object","properties":{"input":spec.input_schema},"required":["input"],"additionalProperties":false}),
        ),
        dispatch: Arc::new(GraphDispatch {
            environment,
            entry: reference,
        }),
    }
}
impl CompiledWorkflow {
    pub fn with_checkpointer(mut self, store: Arc<dyn Checkpointer>) -> Self {
        self.host = self.host.with_checkpointer(store);
        self
    }
    pub fn as_tool(&self, name: impl Into<String>, description: impl Into<String>) -> ToolEntry {
        let mut tool = entry(
            self.environment.clone(),
            self.environment.entry.clone(),
            name.into(),
            description.into(),
        );
        tool.dispatch = Arc::new(HostedGraphDispatch {
            runtime: self.host.clone(),
            identity: self.identity().into(),
        });
        tool
    }
    /// Root workflows are admitted controller Tools, using no sampled model.
    /// This counts the controller Tool plus actual nested Tool/Agent operations.
    pub async fn invoke(
        &self,
        input: Value,
        recovery: RunInput,
        context: RunContext,
    ) -> Result<RunOutcome, Error> {
        self.host
            .invoke(
                ToolCall {
                    id: "workflow-root".into(),
                    name: "workflow_execute".into(),
                    arguments: json!({"input":input}),
                },
                recovery,
                context,
            )
            .await
    }
}

#[async_trait::async_trait]
impl ToolDispatch for GraphDispatch {
    fn is_resumable(&self) -> bool {
        true
    }
    fn recovery_identity(&self) -> Option<String> {
        Some(format!(
            "workflow-v1:{}:{}",
            self.environment.identity,
            self.entry.key()
        ))
    }
    async fn call(
        &self,
        id: ToolId,
        args: Value,
        context: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        let outcome = async {
            let parent = context
                .get::<RunContext>()
                .ok_or_else(|| invalid("workflow requires RunContext"))?;
            let store = context
                .get::<ParentCheckpointer>()
                .ok_or_else(|| invalid("workflow requires a shared checkpointer"))?;
            let input = args
                .get("input")
                .ok_or_else(|| invalid("workflow input required"))?
                .clone();
            // The admitted model-free host already owns this invocation's
            // unique run and checkpoint. Keep that scope as the graph parent.
            let child = (*parent).clone();
            run_graph(
                self.environment.clone(),
                self.entry.clone(),
                input,
                store.0.clone(),
                child,
            )
            .await
        }
        .await;
        let outcome = match outcome {
            Err(Error::Cancelled) => GraphOutcome::Cancelled,
            Err(Error::BudgetExceeded) => GraphOutcome::BudgetExceeded,
            Err(Error::GovernancePaused(reason)) => GraphOutcome::Paused(reason),
            Err(Error::Checkpoint(error)) => GraphOutcome::Checkpoint(error),
            Err(error) => GraphOutcome::Failed(error.to_string()),
            Ok(outcome) => outcome,
        };
        let result = match outcome {
            GraphOutcome::Completed(value) => Ok(TypedToolOutput::from_value(id, value)),
            other => {
                let control = context.get::<ChildControl>();
                if let Some(control) = control {
                    let outcome = match other {
                        GraphOutcome::Paused(reason) => ChildOutcome::Paused(reason),
                        GraphOutcome::Cancelled => ChildOutcome::Cancelled,
                        GraphOutcome::BudgetExceeded => ChildOutcome::BudgetExceeded,
                        GraphOutcome::Failed(error) => ChildOutcome::Failed(error),
                        GraphOutcome::Checkpoint(error) => ChildOutcome::Checkpoint(error),
                        _ => unreachable!(),
                    };
                    *control.0.lock().expect("workflow control lock") = Some(outcome);
                }
                Err(nofy_tool_runtime::ToolError::custom(
                    "workflow_control",
                    "workflow did not complete; inspect its control outcome",
                ))
            }
        };
        nofy_tool_runtime::terminal_only(result)
    }
}
struct Frame {
    store: Arc<dyn Checkpointer>,
    key: String,
    revision: Option<u64>,
    state: WorkflowProgress,
    environment: Arc<Environment>,
    context: RunContext,
}
impl Frame {
    async fn commit(&mut self) -> Result<(), Error> {
        self.revision = Some(
            save_progress(
                self.store.as_ref(),
                &self.key,
                &self.environment.identity,
                self.revision,
                &self.state,
            )
            .await?,
        );
        Ok(())
    }
    fn fact(&mut self, name: &str, operation: String, payload: Value) {
        let operation = if self.state.control_epoch == 0 {
            operation
        } else {
            format!("control:{}:{operation}", self.state.control_epoch)
        };
        self.state.facts.push_back(GraphFact {
            name: name.into(),
            operation,
            payload,
        });
    }
    async fn flush(&mut self) -> Result<(), Error> {
        while let Some(fact) = self.state.facts.front().cloned() {
            if let Some(sink) = self
                .context
                .capabilities
                .get::<crate::events::EventSinkBinding>()
            {
                let scope = crate::events::EventScope::new(
                    format!(
                        "workflow:{}@{}",
                        self.state.reference.id, self.state.reference.version
                    ),
                    &self.context,
                );
                let encoded = serde_json::to_vec(&(
                    &self.context.thread_id,
                    &self.context.run_id,
                    &self.state.reference,
                    &fact.name,
                    &fact.operation,
                ))
                .map_err(|e| Error::Checkpoint(e.to_string()))?;
                let key = format!("workflow:{:x}", Sha256::digest(encoded));
                sink.0
                    .record_once(
                        scope,
                        RunEvent::Workflow {
                            reference: self.state.reference.clone(),
                            operation_id: fact.operation.clone(),
                            name: fact.name.clone(),
                            node_id: fact
                                .payload
                                .get("node")
                                .and_then(Value::as_str)
                                .map(str::to_string),
                            payload: fact.payload.clone(),
                        },
                        &key,
                    )
                    .await?;
            }
            if let Some(bus) = self
                .context
                .capabilities
                .get::<crate::hooks::HookBusBinding>()
            {
                let mut source_context = self.context.clone();
                source_context
                    .capabilities
                    .insert(crate::controllers::ExecutionCheckpoint {
                        key: self.key.clone(),
                        composition: self.environment.identity.clone(),
                        run_id: None,
                    });
                source_context
                    .capabilities
                    .insert(crate::hooks::HookReplaySource::new(
                        &fact.name,
                        &fact.operation,
                        &source_context,
                    ));
                let result = bus
                    .0
                    .emit(
                        &crate::hooks::runtime_owner(),
                        &fact.name,
                        &fact.operation,
                        fact.payload.clone(),
                        &source_context,
                    )
                    .await?;
                if let crate::hooks::HookDecision::Pause { reason } = result.control {
                    return Err(Error::GovernancePaused(reason));
                }
            }
            self.state.facts.pop_front();
            self.commit().await?;
        }
        Ok(())
    }
}
fn run_graph(
    environment: Arc<Environment>,
    reference: crate::registry::ModuleRef,
    input: Value,
    store: Arc<dyn Checkpointer>,
    context: RunContext,
) -> BoxFuture<'static, Result<GraphOutcome, Error>> {
    Box::pin(async move {
        bounded_value(&input, 1024 * 1024, "workflow input")?;
        let plan = environment
            .plans
            .get(&reference)
            .ok_or_else(|| invalid("unknown workflow version"))?
            .clone();
        crate::settings::validate_json_value(&plan.spec().input_schema, &input)?;
        let key = graph_key(&context.thread_id, &context.run_id, &reference);
        let old = store.load(&key).await?;
        let revision = old.as_ref().map(|c| c.revision);
        let state = if let Some(cp) = old {
            if cp.version != 1 || cp.composition != environment.identity {
                return Err(Error::Checkpoint(
                    "workflow state composition changed".into(),
                ));
            }
            let state: WorkflowProgress = serde_json::from_value(cp.state.data)
                .map_err(|e| Error::Checkpoint(e.to_string()))?;
            validate_state(&state, &context.run_id, &reference)?;
            if state.input != input {
                return Err(Error::Checkpoint(
                    "workflow input changed on recovery".into(),
                ));
            }
            state
        } else {
            WorkflowProgress {
                version: 1,
                run_id: context.run_id.clone(),
                reference: reference.clone(),
                input,
                nodes: BTreeMap::new(),
                output: None,
                facts: Default::default(),
                started: false,
                human: BTreeMap::new(),
                halted: None,
                control_epoch: 0,
                recovering: None,
            }
        };
        let mut frame = Frame {
            store,
            key,
            revision,
            state,
            environment,
            context,
        };
        for id in frame.state.nodes.keys().cloned().collect::<Vec<_>>() {
            frame.observe_node(&id, None).await?;
        }
        if !frame.state.started {
            frame.state.started = true;
            frame.fact(
                "workflow_start",
                "workflow-start".into(),
                json!({"workflow":reference,"input":frame.state.input}),
            );
            frame.commit().await?;
        }
        frame.flush().await?;
        frame.apply_recovery().await?;
        frame.flush().await?;
        frame.restore_failed_halt().await?;
        if let Some(halted) = &frame.state.halted {
            return Ok(match halted {
                GraphHalt::Failed { error, .. } => GraphOutcome::Failed(error.clone()),
                GraphHalt::Paused { reason, .. } => GraphOutcome::Paused(reason.clone()),
            });
        }
        if let Some(output) = &frame.state.output {
            return Ok(GraphOutcome::Completed(output.clone()));
        }
        loop {
            if frame.context.cancel.is_cancelled() {
                return Err(crate::governance::cancellation_error(&frame.context));
            }
            frame.restore_failed_halt().await?;
            if let Some(halted) = &frame.state.halted {
                return Ok(match halted {
                    GraphHalt::Failed { error, .. } => GraphOutcome::Failed(error.clone()),
                    GraphHalt::Paused { reason, .. } => GraphOutcome::Paused(reason.clone()),
                });
            }
            let values = frame
                .state
                .nodes
                .iter()
                .filter_map(|(k, v)| v.value().map(|v| (k.clone(), v)))
                .collect::<BTreeMap<_, _>>();
            let settled = frame
                .state
                .nodes
                .iter()
                .filter(|(_, v)| v.settled())
                .map(|(k, _)| k.clone())
                .collect::<BTreeSet<_>>();
            if settled.len() == plan.spec().nodes.len() {
                let output = plan.spec().output.evaluate(&frame.state.input, &values)?;
                crate::settings::validate_json_value(&plan.spec().output_schema, &output)?;
                frame.state.output = Some(output.clone());
                frame.fact(
                    "workflow_end",
                    "workflow-end".into(),
                    json!({"workflow":reference,"output":output}),
                );
                frame.commit().await?;
                frame.flush().await?;
                return Ok(GraphOutcome::Completed(output));
            }
            // Resume already-issued boundaries before admitting new work. Any
            // completed peer remains committed when another branch suspends.
            let mut batch = frame
                .state
                .nodes
                .iter()
                .filter(|(_, v)| !v.settled())
                .map(|(k, _)| k.clone())
                .collect::<Vec<_>>();
            if let Some(id) = &frame.state.recovering {
                batch.retain(|node| node == id);
            }
            let issued = batch.iter().cloned().collect();
            let remaining = if frame.state.recovering.is_some() {
                0
            } else {
                plan.spec().parallelism.saturating_sub(batch.len())
            };
            batch.extend(
                plan.ready_batch(&settled, &issued)
                    .into_iter()
                    .take(remaining),
            );
            if batch.is_empty() {
                return Err(Error::Checkpoint(
                    "workflow has no runnable or waiting node".into(),
                ));
            }
            let mut work = Vec::new();
            for id in batch {
                let node = plan
                    .spec()
                    .nodes
                    .iter()
                    .find(|n| n.id == id)
                    .expect("validated node")
                    .clone();
                if !frame.state.nodes.contains_key(&id) {
                    let blocked = node.needs.iter().any(|n| {
                        matches!(
                            frame.state.nodes.get(n),
                            Some(NodeProgress::Skipped | NodeProgress::Failed { .. })
                        )
                    });
                    let join = matches!(
                        node.action,
                        NodeKind::Join {
                            mode: JoinMode::AllSettled | JoinMode::AllSettledRecords
                        }
                    );
                    let condition = node
                        .when
                        .as_ref()
                        .map(|p| p.evaluate(&frame.state.input, &values))
                        .transpose()?
                        .unwrap_or(true);
                    if (blocked && !join) || !condition {
                        frame.state.nodes.insert(id.clone(), NodeProgress::Skipped);
                        frame.observe_node(&id, None).await?;
                        frame.fact(
                            "node_end",
                            format!("node:{id}:skipped"),
                            json!({"node":id,"status":"skipped"}),
                        );
                        frame.commit().await?;
                        continue;
                    }
                    let input = if matches!(
                        node.action,
                        NodeKind::Join {
                            mode: JoinMode::AllSettledRecords
                        }
                    ) {
                        let records = node
                            .needs
                            .iter()
                            .map(|id| {
                                (
                                    id.clone(),
                                    serde_json::to_value(
                                        frame.state.nodes.get(id).expect("settled dependency"),
                                    )
                                    .expect("node progress"),
                                )
                            })
                            .collect::<serde_json::Map<_, _>>();
                        Value::Object(records)
                    } else {
                        node.input.evaluate(&frame.state.input, &values)?
                    };
                    crate::settings::validate_json_value(&node.input_schema, &input)?;
                    frame.state.nodes.insert(
                        id.clone(),
                        NodeProgress::Running {
                            attempt: 0,
                            input: input.clone(),
                        },
                    );
                    frame.observe_node(&id, None).await?;
                    frame.fact(
                        "node_start",
                        format!("node:{id}:0:start"),
                        json!({"node":id,"attempt":0,"input":input}),
                    );
                    frame.commit().await?;
                }
                let (attempt, input) = match &frame.state.nodes[&id] {
                    NodeProgress::Running { attempt, input }
                    | NodeProgress::Waiting { attempt, input, .. } => (*attempt, input.clone()),
                    _ => continue,
                };
                if matches!(node.action, NodeKind::Human { .. })
                    && !frame.state.human.contains_key(&id)
                {
                    frame.state.nodes.insert(
                        id.clone(),
                        NodeProgress::Waiting {
                            attempt,
                            input: input.clone(),
                            reason: json!({"kind":"human","request":input}),
                        },
                    );
                    frame.observe_node(&id, None).await?;
                    frame.commit().await?;
                    continue;
                }
                work.push((node, attempt, input));
            }
            frame.flush().await?;
            if work.is_empty() {
                if frame.state.nodes.values().any(|s| !s.settled()) {
                    return Ok(GraphOutcome::Paused(
                        json!({"kind":"workflow_waiting","thread_id":frame.context.thread_id,"run_id":frame.context.run_id,"workflow":reference}),
                    ));
                }
                continue;
            }
            let mut futures = futures::stream::FuturesUnordered::new();
            let batch_cancel = frame.context.cancel.child_token();
            for (node, attempt, input) in work {
                let environment = frame.environment.clone();
                let mut context = frame.context.clone();
                context.cancel = batch_cancel.child_token();
                let store = frame.store.clone();
                let human = frame.state.human.get(&node.id).cloned();
                futures.push(async move {
                    let result = execute_node(
                        environment,
                        &node,
                        attempt,
                        input.clone(),
                        store,
                        context,
                        human,
                    )
                    .await;
                    (node, attempt, input, result)
                });
            }
            let mut control = None;
            let mut first_control = None;
            while let Some((node, attempt, input, result)) = futures.next().await {
                let result = match result {
                    Ok(GraphOutcome::Completed(output)) => {
                        match crate::settings::validate_json_value(&node.output_schema, &output) {
                            Ok(()) => Ok(GraphOutcome::Completed(output)),
                            Err(e) => Err(e),
                        }
                    }
                    r => r,
                };
                let observed_status = match &result {
                    Ok(GraphOutcome::Cancelled) | Err(Error::Cancelled) => Some("cancelled"),
                    Ok(GraphOutcome::BudgetExceeded) | Err(Error::BudgetExceeded) => {
                        Some("budget_exceeded")
                    }
                    Err(Error::GovernancePaused(_)) => Some("waiting"),
                    _ => None,
                };
                match result {
                    Ok(GraphOutcome::Completed(output)) => {
                        frame.state.nodes.insert(
                            node.id.clone(),
                            NodeProgress::Completed {
                                attempt,
                                output: output.clone(),
                            },
                        );
                        frame.fact(
                            "node_end",
                            format!("node:{}:{attempt}:end", node.id),
                            json!({"node":node.id,"attempt":attempt,"output":output}),
                        );
                    }
                    Ok(GraphOutcome::Paused(reason)) => {
                        frame.state.nodes.insert(
                            node.id.clone(),
                            NodeProgress::Waiting {
                                attempt,
                                input,
                                reason: reason.clone(),
                            },
                        );
                        control = Some(GraphOutcome::Paused(reason));
                    }
                    Ok(GraphOutcome::Cancelled) => {
                        control = Some(GraphOutcome::Cancelled);
                    }
                    Ok(GraphOutcome::BudgetExceeded) => {
                        control = Some(GraphOutcome::BudgetExceeded);
                    }
                    Ok(GraphOutcome::Failed(error))
                    | Err(Error::Composition(error))
                    | Err(Error::Tool(error))
                    | Err(Error::Model(error)) => {
                        if attempt < node.on_error.retries {
                            frame.state.nodes.insert(
                                node.id.clone(),
                                NodeProgress::Running {
                                    attempt: attempt + 1,
                                    input,
                                },
                            );
                            frame.fact("node_failure",format!("node:{}:{attempt}:failure",node.id),json!({"node":node.id,"attempt":attempt,"error":error,"retry":attempt+1}));
                            frame.fact(
                                "node_start",
                                format!("node:{}:{}:start", node.id, attempt + 1),
                                json!({"node":node.id,"attempt":attempt+1}),
                            );
                        } else {
                            frame.state.nodes.insert(
                                node.id.clone(),
                                NodeProgress::Failed {
                                    attempt,
                                    error: error.clone(),
                                },
                            );
                            frame.fact(
                                "node_failure",
                                format!("node:{}:{attempt}:failure", node.id),
                                json!({"node":node.id,"attempt":attempt,"error":error}),
                            );
                            match node.on_error.exhausted {
                                FailureAction::Continue => {}
                                FailureAction::Fail => {
                                    frame.state.halted = Some(GraphHalt::Failed {
                                        node: node.id.clone(),
                                        error: error.clone(),
                                    });
                                    control = Some(GraphOutcome::Failed(error));
                                }
                                FailureAction::Pause => {
                                    let reason = json!({"kind":"workflow_node_failed","node":node.id,"error":error});
                                    frame.state.halted = Some(GraphHalt::Paused {
                                        node: node.id.clone(),
                                        reason: reason.clone(),
                                    });
                                    control = Some(GraphOutcome::Paused(reason));
                                }
                            }
                        }
                    }
                    Err(Error::GovernancePaused(reason)) => {
                        control = Some(GraphOutcome::Paused(reason));
                    }
                    Err(Error::Cancelled) => {
                        control = Some(GraphOutcome::Cancelled);
                    }
                    Err(Error::BudgetExceeded) => {
                        control = Some(GraphOutcome::BudgetExceeded);
                    }
                    Ok(GraphOutcome::Checkpoint(error)) => return Err(Error::Checkpoint(error)),
                    Err(error) => return Err(error),
                }
                if frame.state.recovering.as_ref() == Some(&node.id)
                    && frame
                        .state
                        .nodes
                        .get(&node.id)
                        .is_some_and(NodeProgress::settled)
                {
                    frame.state.recovering = None;
                }
                frame.observe_node(&node.id, observed_status).await?;
                frame.commit().await?;
                if control.is_some() && first_control.is_none() {
                    first_control = control.take();
                    batch_cancel.cancel();
                }
            }
            frame.flush().await?;
            if frame.context.cancel.is_cancelled() {
                return Err(crate::governance::cancellation_error(&frame.context));
            }
            if let Some(control) = first_control.or(control) {
                return Ok(control);
            }
        }
    })
}
