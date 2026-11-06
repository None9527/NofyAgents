//! Agents can be dispatched as tools or composed in application workflows.
use crate::{Agent, Error, RunContext, RunInput, RunOutcome, ToolEntry};
use nofy_tool_protocol::ToolId;
use nofy_tool_runtime::{ToolCallContext, ToolDispatch, ToolStream, TypedToolOutput};
use nofy_tool_types::ToolDefinition;
use std::sync::Arc;

/// A per-invocation control rail, separate from model-facing tool errors.
/// Only installed native orchestrators can access this typed capability.
#[derive(Clone, Default)]
pub(crate) struct ChildControl(pub Arc<std::sync::Mutex<Option<ChildOutcome>>>);
pub(crate) enum ChildOutcome {
    Paused(serde_json::Value),
    Cancelled,
    BudgetExceeded,
    Failed(String),
    Checkpoint(String),
}

#[derive(Clone)]
pub(crate) struct ParentCheckpointer(pub Arc<dyn crate::Checkpointer>);

#[async_trait::async_trait]
pub(crate) trait ChildObserver: Send + Sync {
    #[cfg(feature = "workflow")]
    async fn control(&self, _parent: &RunContext, _record: ControlNodeRecord) -> Result<(), Error> {
        Ok(())
    }
    async fn reconciliation(
        &self,
        _child: &RunContext,
        _agent: &Agent,
    ) -> Result<Option<crate::reconciliation::ReconciliationInput>, Error> {
        Ok(None)
    }
    async fn started(
        &self,
        parent: &RunContext,
        child: &RunContext,
        agent: &Agent,
    ) -> Result<(), Error>;
    async fn finished(
        &self,
        child: &RunContext,
        result: &Result<RunOutcome, Error>,
    ) -> Result<(), Error>;
}
#[cfg(feature = "workflow")]
#[cfg_attr(not(feature = "sqlite"), allow(dead_code))]
pub(crate) struct ControlNodeRecord {
    pub context: RunContext,
    pub label: String,
    pub kind: String,
    pub reference: crate::registry::ModuleRef,
    pub node_id: String,
    pub checkpoint_key: String,
    pub composition: String,
    pub status: String,
    pub error: Option<String>,
}
#[derive(Clone)]
pub(crate) struct ChildObserverBinding(pub Arc<dyn ChildObserver>);

struct ChildAgent(Agent);

// A task boundary prevents recursive Agent polling from consuming one host
// stack per level. JoinSet owns the child: dropping an interrupted parent
// aborts its child future, preserving the original uncertain-effect boundary.
async fn invoke_child(
    child: Agent,
    input: RunInput,
    context: RunContext,
) -> Result<RunOutcome, Error> {
    let mut task = tokio::task::JoinSet::new();
    task.spawn(async move { child.invoke(input, context).await });
    task.join_next()
        .await
        .expect("one owned child task")
        .map_err(|error| Error::Checkpoint(format!("child execution interrupted: {error}")))?
}

// Legacy group receipts contain the rendered error. Reconstruct its display
// without adding another composition prefix on every recovery. Checkpoint and
// nonterminal control outcomes never become settled failure receipts.
pub(crate) fn replay_child_failure(error: String) -> Error {
    if let Some(message) = error.strip_prefix("model failed: ") {
        Error::Model(message.into())
    } else if let Some(message) = error.strip_prefix("tool failed: ") {
        Error::Tool(message.into())
    } else {
        Error::Composition(
            error
                .strip_prefix("invalid agent composition: ")
                .unwrap_or(&error)
                .into(),
        )
    }
}

async fn child_hook(
    parent: &RunContext,
    child: &RunContext,
    name: &str,
    payload: serde_json::Value,
    context: &ToolCallContext,
) -> Result<(), nofy_tool_runtime::ToolError> {
    let Some(bus) = parent.capabilities.get::<crate::hooks::HookBusBinding>() else {
        return Ok(());
    };
    let epoch = crate::controllers::epoch(child)
        .await
        .map_err(|e| nofy_tool_runtime::ToolError::custom("child_control", e.to_string()))?;
    let operation = if epoch == 0 {
        format!("child:{}:{name}", child.run_id)
    } else {
        format!("child:{}:control:{epoch}:{name}", child.run_id)
    };
    #[cfg(feature = "workflow")]
    let parent = {
        let mut source = parent.clone();
        source
            .capabilities
            .insert(crate::hooks::HookReplaySource::new(
                name, &operation, &source,
            ));
        source
    };
    let result = bus
        .0
        .emit(
            &crate::hooks::runtime_owner(),
            name,
            &operation,
            payload,
            &parent,
        )
        .await
        .map_err(|e| nofy_tool_runtime::ToolError::custom("child_hook", e.to_string()))?;
    if let crate::hooks::HookDecision::Pause { reason } = result.control {
        let control = context.get::<ChildControl>().ok_or_else(|| {
            nofy_tool_runtime::ToolError::custom(
                "missing_control",
                "child hook suspension requires a control rail",
            )
        })?;
        *control.0.lock().expect("control lock") = Some(ChildOutcome::Paused(reason));
        return Err(nofy_tool_runtime::ToolError::custom(
            "child_control",
            "child hook paused",
        ));
    }
    Ok(())
}

#[async_trait::async_trait]
impl ToolDispatch for ChildAgent {
    fn is_resumable(&self) -> bool {
        true
    }
    fn recovery_identity(&self) -> Option<String> {
        Some(self.0.composition_identity().to_string())
    }
    async fn call(
        &self,
        id: ToolId,
        args: serde_json::Value,
        context: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        let result = async {
            let parent = context.get::<RunContext>().ok_or_else(|| {
                nofy_tool_runtime::ToolError::custom(
                    "missing_context",
                    "child agent requires RunContext",
                )
            })?;
            let mut child_context = (*parent).clone();
            crate::identity::bind(&mut child_context, self.0.spec().settings.scope_identity)
                .map_err(|error| nofy_tool_runtime::ToolError::custom("child_identity", error.to_string()))?;
            let identity = crate::identity::child_id(&child_context, &parent.thread_id, &parent.run_id,
                context.get::<crate::context::ToolInvocationState>().map(|view|view.state().model_sequence), context.call_id.as_str());
            child_context.thread_id = identity.clone();
            child_context.run_id = identity;
            if let Some(control) = parent.capabilities.get::<crate::governance::BudgetControl>() {
                let mut control = (*control).clone();
                control.depth = control.depth.checked_add(1).ok_or_else(|| nofy_tool_runtime::ToolError::custom("child_depth", "child depth overflow"))?;
                child_context.capabilities.insert(control);
            }
            let lineage=parent.capabilities.get::<crate::events::RunLineage>();
            child_context.capabilities.insert(crate::events::RunLineage {
                root_run_id:lineage.as_ref().map_or_else(||parent.run_id.clone(),|lineage|lineage.root_run_id.clone()),
                parent_run_id:Some(parent.run_id.clone()),node_id:Some(context.call_id.as_str().to_string()),
            });
            let input = args.get("prompt").and_then(|v| v.as_str()).ok_or_else(|| {
                nofy_tool_runtime::ToolError::invalid_arguments("prompt must be a string")
            })?;
            let mut child=self.0.clone();
            // One root owns the execution tree's transactional fence. A child
            // keeps its standalone backend only when no parent store is bound.
            if let Some(store)=context.get::<ParentCheckpointer>() {
                child=child.with_checkpointer(store.0.clone());
            }
            let resume=context.get::<nofy_tool_runtime::ResumeInvocation>().is_some_and(|flag| flag.0);
            let has_state=if resume {
                if let Some(store)=child.checkpoint_store() {
                    store.load(&child.checkpoint_key(&child_context.thread_id)).await
                        .map_err(|e| nofy_tool_runtime::ToolError::custom("child_checkpoint",e.to_string()))?.is_some()
                } else { false }
            } else { false };
            let controller=child_context.capabilities.get::<crate::controllers::ControllerBinding>();
            let cancelled=if let Some(controller)=&controller {controller.cancel(&child_context.run_id).await.map_err(|e|nofy_tool_runtime::ToolError::custom("child_control",e.to_string()))?}else{None};
            let retry=if let Some(controller)=&controller {controller.input(&child_context.run_id).await.map_err(|e|nofy_tool_runtime::ToolError::custom("child_control",e.to_string()))?}else{None};
            let epoch=if let Some(controller)=&controller {controller.group_epoch(&child_context.run_id).await.map_err(|e|nofy_tool_runtime::ToolError::custom("child_control",e.to_string()))?}else{0};
            let invocation=if let Some(cancelled)=cancelled {
                let root=child_context.capabilities.get::<crate::events::RunLineage>().map(|lineage|lineage.root_run_id.clone());
                if cancelled.address.run_id!=child_context.run_id || cancelled.address.thread_id!=child_context.thread_id || cancelled.address.agent!=child.spec().name || root.as_deref()!=Some(&cancelled.address.root_run_id) {
                    return Err(nofy_tool_runtime::ToolError::custom("child_control","cancel resume recipient changed"));
                }
                if has_state {RunInput::resume_after_cancel(cancelled.through)} else {RunInput::new(input)}
            }else if let Some(command)=retry {
                if !has_state {return Err(nofy_tool_runtime::ToolError::custom("child_control","retry target has no checkpoint"));}
                RunInput::retry_model(command)
            }else if has_state {RunInput::resume()} else {RunInput::new(input)};
            child_hook(&parent,&child_context,"subagent_start",serde_json::json!({"id":child_context.run_id,"agent":child.spec().name}),&context).await?;
            let observer=parent.capabilities.get::<ChildObserverBinding>();
            if let Some(observer)=&observer {
                observer.0.started(&parent,&child_context,&child).await
                    .map_err(|e| nofy_tool_runtime::ToolError::custom("child_receipt",e.to_string()))?;
                if has_state
                    && let Some(receipt) = observer.0.reconciliation(&child_context, &child).await
                        .map_err(|e| nofy_tool_runtime::ToolError::custom("child_reconciliation",e.to_string()))? {
                        child_context.capabilities.insert(receipt);
                    }
            }
            let cost = crate::governance::BudgetCost { child_calls: 1, ..Default::default() };
            let operation = if epoch==0 {serde_json::to_string(&("child", &child_context.run_id))}else{serde_json::to_string(&("child", &child_context.run_id,"control",epoch))}.expect("child identity serializes");
            let fingerprint = crate::governance::child_fingerprint(child.composition_identity(), input);
            let admission = crate::governance::reserve(&child_context, &operation, &fingerprint, cost,
                crate::governance::BudgetActivity::Child, false, resume).await;
            let outcome = match admission {
                Ok(crate::governance::GroupAdmission::Replay(receipt)) => serde_json::from_value::<Result<RunOutcome,String>>(receipt.value)
                    .map_err(|e| nofy_tool_runtime::ToolError::custom("child_receipt", e.to_string()))?
                    .map_err(replay_child_failure),
                Ok(crate::governance::GroupAdmission::Ready(held)) => {
                    let outcome = invoke_child(child.clone(), invocation, child_context.clone()).await;
                    if matches!(&outcome, Ok(RunOutcome::Completed {..})) || (outcome.is_err() && !matches!(&outcome, Err(Error::Checkpoint(_)))) {
                        let receipt = outcome.as_ref().map(Clone::clone).map_err(ToString::to_string);
                        let receipt = crate::governance::BudgetReceipt { used: cost,
                            value: serde_json::to_value(receipt).map_err(|e| nofy_tool_runtime::ToolError::custom("child_receipt", e.to_string()))? };
                        match crate::governance::settle(&held, receipt).await { Ok(()) => outcome, Err(error) => Err(error) }
                    } else { outcome }
                }
                Err(error) => Err(error),
            };
            let outcome = match outcome {
                Err(Error::BudgetExceeded) => Ok(RunOutcome::BudgetExceeded { state: Default::default() }),
                Err(Error::Cancelled) => Ok(RunOutcome::Cancelled { state: Default::default() }),
                Err(Error::GovernancePaused(reason)) => Ok(RunOutcome::Paused { reason, state: Default::default() }),
                result => result,
            };
            if outcome.is_err() && !matches!(&outcome,Err(Error::Checkpoint(_)))
                && let Some(controller)=&controller
                    && let Err(error)=controller.record_failure(&child_context.run_id,epoch,child.composition_identity()).await {
                        let control=context.get::<ChildControl>().ok_or_else(||nofy_tool_runtime::ToolError::custom("missing_control","child journal requires a runtime control rail"))?;
                        *control.0.lock().map_err(|_|nofy_tool_runtime::ToolError::custom("control_poisoned","child control poisoned"))?=Some(ChildOutcome::Checkpoint(error.to_string()));
                        return Err(nofy_tool_runtime::ToolError::custom("child_retry_journal",error.to_string()));
                    }
            if let Some(observer)=&observer {
                observer.0.finished(&child_context,&outcome).await
                    .map_err(|e| nofy_tool_runtime::ToolError::custom("child_receipt",e.to_string()))?;
            }
            if !matches!(&outcome,Ok(RunOutcome::Paused{..}) | Err(Error::Checkpoint(_))) {
                let status=match &outcome {Ok(RunOutcome::Completed{..})=>"completed",Ok(RunOutcome::Cancelled{..})=>"cancelled",Ok(RunOutcome::BudgetExceeded{..})=>"budget_exceeded",Err(_)=>"failed",_=>"paused"};
                child_hook(&parent,&child_context,"subagent_finished",serde_json::json!({"id":child_context.run_id,"agent":child.spec().name,"status":status}),&context).await?;
            }
            match outcome {
                Ok(RunOutcome::Completed { output, state }) => Ok(TypedToolOutput::from_value(
                    id,
                    serde_json::json!({"output":output,"info":state.completion_info}),
                )),
                result => {
                    let control=context.get::<ChildControl>().ok_or_else(|| nofy_tool_runtime::ToolError::custom("missing_control","child suspension requires a runtime control rail"))?;
                    let result=match result {
                        Ok(RunOutcome::Paused {reason,..})=>ChildOutcome::Paused(serde_json::json!({"kind":"child_paused","thread_id":child_context.thread_id,"run_id":child_context.run_id,"reason":reason})),
                        Ok(RunOutcome::Cancelled {..})=>ChildOutcome::Cancelled,
                        Ok(RunOutcome::BudgetExceeded {..})=>ChildOutcome::BudgetExceeded,
                        Err(Error::Checkpoint(error))=>ChildOutcome::Checkpoint(error),
                        Err(error)=>ChildOutcome::Failed(error.to_string()),
                        Ok(RunOutcome::Completed {..})=>unreachable!(),
                    };
                    *control.0.lock().map_err(|_| nofy_tool_runtime::ToolError::custom("control_poisoned","child control poisoned"))?=Some(result);
                    Err(nofy_tool_runtime::ToolError::custom("child_control","child returned a nonterminal control outcome"))
                }
            }
        }
        .await;
        nofy_tool_runtime::terminal_only(result)
    }
}

impl Agent {
    pub fn as_tool(&self, name: impl Into<String>, description: impl Into<String>) -> ToolEntry {
        ToolEntry {
            definition: ToolDefinition::function(
                name,
                Some(description),
                serde_json::json!({
                    "type":"object", "properties":{"prompt":{"type":"string"}}, "required":["prompt"], "additionalProperties":false
                }),
            ),
            dispatch: Arc::new(ChildAgent(self.clone())),
        }
    }
}

struct SequenceModel {
    steps: usize,
}
#[async_trait::async_trait]
impl crate::Model for SequenceModel {
    async fn complete(
        &self,
        request: crate::ModelRequest,
        _: &RunContext,
    ) -> Result<crate::ModelResponse, Error> {
        let start = request
            .messages
            .iter()
            .rposition(|message| matches!(message, crate::Message::User { .. }))
            .ok_or_else(|| Error::Composition("sequence requires user input".into()))?;
        let crate::Message::User { content: input } = &request.messages[start] else {
            unreachable!()
        };
        let results: Vec<_> = request.messages[start + 1..]
            .iter()
            .filter_map(|message| match message {
                crate::Message::Tool {
                    content, is_error, ..
                } => Some((content, *is_error)),
                _ => None,
            })
            .collect();
        let value = if let Some((result, is_error)) = results.last() {
            if *is_error {
                return Err(Error::Composition(format!(
                    "sequence child failed: {result}"
                )));
            }
            result
                .get("value")
                .and_then(|value| value.get("output"))
                .and_then(serde_json::Value::as_str)
                .ok_or_else(|| Error::Composition("invalid sequence child output".into()))?
                .to_string()
        } else {
            input.clone()
        };
        Ok(if results.len() == self.steps {
            crate::ModelResponse {
                output: value,
                ..Default::default()
            }
        } else if results.len() < self.steps {
            crate::ModelResponse {
                tool_calls: vec![crate::ToolCall {
                    id: format!("sequence_{}", results.len()),
                    name: format!("step_{}", results.len()),
                    arguments: serde_json::json!({"prompt":value}),
                }],
                ..Default::default()
            }
        } else {
            return Err(Error::Composition("sequence has extra results".into()));
        })
    }
}

/// A sequence is an ordinary Agent with a deterministic coordinator. Install a
/// checkpointer and invoke/resume it to preserve every child control outcome.
pub fn sequence_agent(name: impl Into<String>, agents: &[Agent]) -> Result<Agent, Error> {
    if agents.is_empty() {
        return Err(Error::Composition(
            "sequence requires at least one agent".into(),
        ));
    }
    let mut components = crate::Components::default();
    components.models.insert(
        "sequence".into(),
        Arc::new(SequenceModel {
            steps: agents.len(),
        }),
    );
    components.prompts.insert(
        "sequence".into(),
        Arc::new(crate::StaticPrompt(String::new())),
    );
    let mut tools = crate::ToolCatalog::new();
    for (index, agent) in agents.iter().enumerate() {
        tools.insert(agent.as_tool(format!("step_{index}"), format!("Sequence step {index}")))?;
    }
    components.tool_packs.insert("sequence".into(), tools);
    crate::AgentBuilder::new(name)
        .model("sequence")
        .prompt("sequence")
        .tools("sequence")
        .settings(crate::Settings {
            max_steps: agents
                .len()
                .checked_add(1)
                .ok_or_else(|| Error::Composition("too many sequence stages".into()))?,
            ..Default::default()
        })
        .compile(&components)
}

/// Compatibility convenience for callers wanting only the final text. Use
/// sequence_agent for typed pause, cancellation, budget and durable recovery.
pub async fn sequence(
    agents: &[Agent],
    input: String,
    context: RunContext,
) -> Result<String, Error> {
    if agents.is_empty() {
        return Ok(input);
    }
    match sequence_agent("sequence", agents)?
        .invoke(RunInput::new(input), context)
        .await?
    {
        RunOutcome::Completed { output, .. } => Ok(output),
        outcome => Err(Error::Composition(format!("sequence stopped: {outcome:?}"))),
    }
}

/// Application-selected routing keeps business decisions out of the runtime.
pub async fn route(
    agents: &std::collections::BTreeMap<String, Agent>,
    selected: &str,
    input: RunInput,
    mut context: RunContext,
) -> Result<RunOutcome, Error> {
    let agent = agents
        .get(selected)
        .ok_or_else(|| Error::Composition(format!("unregistered route: {selected}")))?;
    context.thread_id = format!("{}:route:{}:{selected}", context.thread_id, selected.len());
    agent.invoke(input, context).await
}

/// Run independent branches concurrently, retaining order and every outcome.
/// Each branch has its own checkpoint namespace and shares parent cancellation.
pub async fn parallel(
    agents: &[Agent],
    input: RunInput,
    context: RunContext,
) -> Vec<Result<RunOutcome, Error>> {
    futures::future::join_all(agents.iter().enumerate().map(|(index, agent)| {
        let mut child = context.clone();
        child.thread_id = format!("{}:parallel:{index}", context.thread_id);
        child.run_id = format!("{}:parallel:{index}", context.run_id);
        agent.invoke(input.clone(), child)
    }))
    .await
}
