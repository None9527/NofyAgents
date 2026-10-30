use super::*;

pub(super) async fn execute_node(
    environment: Arc<Environment>,
    node: &NodeSpec,
    attempt: u32,
    input: Value,
    store: Arc<dyn Checkpointer>,
    context: RunContext,
    human: Option<HumanReceipt>,
) -> Result<GraphOutcome, Error> {
    let key = serde_json::to_string(&(&context.thread_id, &context.run_id, &node.id, attempt))
        .map_err(|e| invalid(e.to_string()))?;
    let mut child = node_context(&context, &node.id, attempt)?;
    let operation = format!("workflow-step:{key}");
    let encoded = serde_json::to_vec(&(&environment.identity, node, attempt, &input))
        .map_err(|e| invalid(e.to_string()))?;
    let fingerprint = format!("{:x}", Sha256::digest(encoded));
    let cost = crate::governance::BudgetCost {
        steps: 1,
        ..Default::default()
    };
    // Reserving a deterministic scheduler step uses no active primitive slot.
    let held = match crate::governance::reserve(
        &child,
        &operation,
        &fingerprint,
        cost,
        crate::governance::BudgetActivity::None,
        false,
        true,
    )
    .await?
    {
        crate::governance::GroupAdmission::Replay(_) => None,
        crate::governance::GroupAdmission::Ready(held) => Some(held),
    };
    if let Some(held) = held {
        crate::governance::settle(
            &held,
            crate::governance::BudgetReceipt {
                used: cost,
                value: Value::Null,
            },
        )
        .await?;
    }
    match &node.action {
        NodeKind::Transform | NodeKind::Join { .. } => Ok(GraphOutcome::Completed(input)),
        NodeKind::Condition { equals } => {
            Ok(GraphOutcome::Completed(Value::Bool(&input == equals)))
        }
        NodeKind::Human { .. } => Ok(GraphOutcome::Completed(
            human
                .ok_or_else(|| invalid("human response unavailable"))?
                .value,
        )),
        NodeKind::Prompt { prompt } => {
            let variables = input
                .as_object()
                .ok_or_else(|| invalid("Prompt node input must be a variables object"))?
                .iter()
                .map(|(k, v)| (k.clone(), v.clone()))
                .collect();
            child
                .capabilities
                .insert(crate::prompt::PromptVariables(variables));
            let output = crate::governance::await_resource(
                &child,
                environment.prompts[prompt].render(&child, &[]),
            )
            .await?;
            bounded_value(&Value::String(output.clone()), 1024 * 1024, "prompt output")?;
            Ok(GraphOutcome::Completed(Value::String(output)))
        }
        NodeKind::Tool { runtime, tool } => {
            run_tool_node(
                environment.tools[runtime].clone(),
                ToolCall {
                    id: format!("node:{}:{attempt}", node.id),
                    name: tool.clone(),
                    arguments: input,
                },
                store,
                context.clone(),
                child,
            )
            .await
        }
        NodeKind::Agent { agent } => {
            let prompt = input
                .as_str()
                .ok_or_else(|| invalid("Agent node input must be a prompt string"))?;
            let runtime = crate::tool_program::ToolRuntime::single(
                environment.agents[agent].as_tool("workflow_agent", "Execute the node Agent"),
            )?;
            run_tool_node(
                runtime,
                ToolCall {
                    id: format!("node:{}:{attempt}", node.id),
                    name: "workflow_agent".into(),
                    arguments: json!({"prompt":prompt}),
                },
                store,
                context.clone(),
                child,
            )
            .await
        }
        NodeKind::Subworkflow { workflow } => {
            increment_depth(&mut child)?;
            run_graph(environment, workflow.clone(), input, store, child).await
        }
        NodeKind::Loop {
            workflow,
            max_iterations,
            until,
        } => {
            increment_depth(&mut child)?;
            let mut value = input;
            for iteration in 0..*max_iterations {
                let mut step = child.clone();
                step.thread_id = format!("{}:iteration:{iteration}", child.thread_id);
                step.run_id = step.thread_id.clone();
                tree::observe_iteration(
                    &child,
                    &step,
                    &environment,
                    workflow,
                    &node.id,
                    iteration,
                    "running",
                )
                .await?;
                let result = run_graph(
                    environment.clone(),
                    workflow.clone(),
                    value,
                    store.clone(),
                    step.clone(),
                )
                .await;
                let status = match &result {
                    Ok(GraphOutcome::Completed(_)) => "completed",
                    Ok(GraphOutcome::Paused(_)) | Err(Error::GovernancePaused(_)) => "waiting",
                    Ok(GraphOutcome::Cancelled) | Err(Error::Cancelled) => "cancelled",
                    Ok(GraphOutcome::BudgetExceeded) | Err(Error::BudgetExceeded) => {
                        "budget_exceeded"
                    }
                    _ => "failed",
                };
                tree::observe_iteration(
                    &child,
                    &step,
                    &environment,
                    workflow,
                    &node.id,
                    iteration,
                    status,
                )
                .await?;
                match result? {
                    GraphOutcome::Completed(output) => {
                        if until.evaluate(&output, &BTreeMap::new())? {
                            return Ok(GraphOutcome::Completed(output));
                        }
                        value = output;
                    }
                    control => return Ok(control),
                }
            }
            Ok(GraphOutcome::Failed(
                "workflow loop reached its configured iteration limit".into(),
            ))
        }
    }
}
async fn run_tool_node(
    runtime: crate::tool_program::ToolRuntime,
    call: ToolCall,
    store: Arc<dyn Checkpointer>,
    parent: RunContext,
    context: RunContext,
) -> Result<GraphOutcome, Error> {
    let agent = runtime.with_checkpointer(store.clone()).program(call)?;
    let checkpoint = store
        .load(&agent.checkpoint_key(&context.thread_id))
        .await?;
    let observer = context.capabilities.get::<ChildObserverBinding>();
    let mut child = context.clone();
    if let Some(observer) = &observer {
        observer.0.started(&parent, &child, &agent).await?;
        if checkpoint.is_some() {
            if let Some(receipt) = observer.0.reconciliation(&child, &agent).await? {
                child.capabilities.insert(receipt);
            }
        }
    }
    let input = if checkpoint.is_some() {
        RunInput::resume()
    } else {
        RunInput::default()
    };
    let outcome = agent.invoke(input, child.clone()).await;
    if let Some(observer) = &observer {
        observer.0.finished(&child, &outcome).await?;
    }
    match outcome {
        Ok(RunOutcome::Completed { state, .. }) => {
            match state
                .messages
                .iter()
                .rev()
                .find(|m| matches!(m, Message::Tool { .. }))
            {
                Some(Message::Tool {
                    content,
                    is_error: true,
                    ..
                }) => Ok(GraphOutcome::Failed(content.to_string())),
                Some(Message::Tool {
                    content,
                    is_error: false,
                    ..
                }) => Ok(GraphOutcome::Completed(
                    content
                        .get("value")
                        .cloned()
                        .unwrap_or_else(|| content.clone()),
                )),
                _ => Err(Error::Checkpoint(
                    "workflow Tool node completed without a paired result".into(),
                )),
            }
        }
        Ok(RunOutcome::Paused { reason, .. }) => Ok(GraphOutcome::Paused(reason)),
        Ok(RunOutcome::Cancelled { .. }) => Ok(GraphOutcome::Cancelled),
        Ok(RunOutcome::BudgetExceeded { .. }) => Ok(GraphOutcome::BudgetExceeded),
        Err(error) => Err(error),
    }
}

pub(super) fn increment_depth(context: &mut RunContext) -> Result<(), Error> {
    if let Some(control) = context
        .capabilities
        .get::<crate::governance::BudgetControl>()
    {
        let mut control = (*control).clone();
        control.depth = control
            .depth
            .checked_add(1)
            .ok_or_else(|| invalid("workflow depth overflow"))?;
        context.capabilities.insert(control);
    }
    Ok(())
}

pub(super) fn node_context(
    context: &RunContext,
    node_id: &str,
    attempt: u32,
) -> Result<RunContext, Error> {
    let key = serde_json::to_vec(&(&context.thread_id, &context.run_id, node_id, attempt))
        .map_err(|e| invalid(e.to_string()))?;
    let mut child = context.clone();
    child.thread_id = format!("workflow-node:{:x}", Sha256::digest(key));
    child.run_id = child.thread_id.clone();
    let lineage = context.capabilities.get::<crate::events::RunLineage>();
    child.capabilities.insert(crate::events::RunLineage {
        root_run_id: lineage
            .as_ref()
            .map_or_else(|| context.run_id.clone(), |l| l.root_run_id.clone()),
        parent_run_id: Some(context.run_id.clone()),
        node_id: Some(node_id.into()),
    });
    Ok(child)
}
