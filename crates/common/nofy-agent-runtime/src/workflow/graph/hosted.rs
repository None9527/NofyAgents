use super::*;

pub(super) struct HostedGraphDispatch {
    pub(super) runtime: crate::tool_program::ToolRuntime,
    pub(super) identity: String,
}
#[async_trait::async_trait]
impl ToolDispatch for HostedGraphDispatch {
    fn is_resumable(&self) -> bool {
        true
    }
    fn recovery_identity(&self) -> Option<String> {
        Some(format!("hosted-workflow-v1:{}", self.identity))
    }
    async fn call(
        &self,
        id: ToolId,
        args: Value,
        context: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        let result = async {
            let parent = context
                .get::<RunContext>()
                .ok_or_else(|| invalid("workflow host requires RunContext"))?;
            let store = context
                .get::<ParentCheckpointer>()
                .ok_or_else(|| invalid("workflow host requires root checkpointer"))?;
            let sequence = context
                .get::<crate::context::ToolInvocationState>()
                .map(|v| v.state().model_sequence);
            let key = serde_json::to_vec(&(
                &parent.thread_id,
                &parent.run_id,
                sequence,
                context.call_id.as_str(),
            ))
            .map_err(|e| invalid(e.to_string()))?;
            let mut child = (*parent).clone();
            child.thread_id = format!("workflow-host:{:x}", Sha256::digest(key));
            child.run_id = child.thread_id.clone();
            increment_depth(&mut child)?;
            let lineage = parent.capabilities.get::<crate::events::RunLineage>();
            child.capabilities.insert(crate::events::RunLineage {
                root_run_id: lineage
                    .as_ref()
                    .map_or_else(|| parent.run_id.clone(), |l| l.root_run_id.clone()),
                parent_run_id: Some(parent.run_id.clone()),
                node_id: Some(context.call_id.as_str().into()),
            });
            let call = ToolCall {
                id: "workflow-root".into(),
                name: "workflow_execute".into(),
                arguments: args,
            };
            let program = self
                .runtime
                .clone()
                .with_checkpointer(store.0.clone())
                .program(call)?;
            let has_state = store
                .0
                .load(&program.checkpoint_key(&child.thread_id))
                .await?
                .is_some();
            let observer = parent.capabilities.get::<ChildObserverBinding>();
            if let Some(observer) = &observer {
                observer.0.started(&parent, &child, &program).await?;
            }
            let cost = crate::governance::BudgetCost {
                child_calls: 1,
                ..Default::default()
            };
            let controller = child
                .capabilities
                .get::<crate::controllers::ControllerBinding>();
            let epoch = if let Some(controller) = &controller {
                controller.group_epoch(&child.run_id).await?
            } else {
                0
            };
            let operation = if epoch == 0 {
                format!("workflow-child:{}", child.run_id)
            } else {
                format!("workflow-child:{}:control:{epoch}", child.run_id)
            };
            let fingerprint = format!(
                "{:x}",
                Sha256::digest(
                    serde_json::to_vec(&(program.composition_identity(), &self.identity))
                        .map_err(|e| invalid(e.to_string()))?
                )
            );
            let admission = crate::governance::reserve(
                &child,
                &operation,
                &fingerprint,
                cost,
                crate::governance::BudgetActivity::Child,
                false,
                has_state,
            )
            .await?;
            let outcome = match admission {
                crate::governance::GroupAdmission::Replay(receipt) => {
                    serde_json::from_value::<Result<RunOutcome, String>>(receipt.value)
                        .map_err(|e| Error::Checkpoint(e.to_string()))?
                        .map_err(crate::composition::replay_child_failure)
                }
                crate::governance::GroupAdmission::Ready(held) => {
                    let outcome = program
                        .invoke(
                            if has_state {
                                RunInput::resume()
                            } else {
                                RunInput::default()
                            },
                            child.clone(),
                        )
                        .await;
                    if matches!(&outcome, Ok(RunOutcome::Completed { .. }))
                        || (outcome.is_err() && !matches!(&outcome, Err(Error::Checkpoint(_))))
                    {
                        let value = serde_json::to_value(
                            outcome
                                .as_ref()
                                .map(Clone::clone)
                                .map_err(ToString::to_string),
                        )
                        .map_err(|e| invalid(e.to_string()))?;
                        crate::governance::settle(
                            &held,
                            crate::governance::BudgetReceipt { used: cost, value },
                        )
                        .await?;
                    }
                    outcome
                }
            };
            if outcome.is_err()
                && !matches!(
                    &outcome,
                    Err(Error::Checkpoint(_)
                        | Error::Cancelled
                        | Error::BudgetExceeded
                        | Error::GovernancePaused(_))
                )
                && let Some(controller) = controller
            {
                controller
                    .record_failure(&child.run_id, epoch, program.composition_identity())
                    .await?;
            }
            if let Some(observer) = &observer {
                observer.0.finished(&child, &outcome).await?;
            }
            outcome
        }
        .await;
        let result = match result {
            Ok(RunOutcome::Completed { state, .. }) => {
                let value = state.messages.iter().rev().find_map(|m| match m {
                    Message::Tool {
                        content,
                        is_error: false,
                        ..
                    } => content.get("value").cloned(),
                    _ => None,
                });
                value
                    .ok_or_else(|| {
                        nofy_tool_runtime::ToolError::custom(
                            "workflow_result",
                            "workflow host completed without its result",
                        )
                    })
                    .map(|value| TypedToolOutput::from_value(id, value))
            }
            other => {
                let control = context.get::<ChildControl>();
                if let Some(control) = control {
                    let outcome = match other {
                        Ok(RunOutcome::Paused { reason, .. })
                        | Err(Error::GovernancePaused(reason)) => ChildOutcome::Paused(reason),
                        Ok(RunOutcome::Cancelled { .. }) | Err(Error::Cancelled) => {
                            ChildOutcome::Cancelled
                        }
                        Ok(RunOutcome::BudgetExceeded { .. }) | Err(Error::BudgetExceeded) => {
                            ChildOutcome::BudgetExceeded
                        }
                        Err(Error::Checkpoint(error)) => ChildOutcome::Checkpoint(error),
                        Err(error) => ChildOutcome::Failed(error.to_string()),
                        _ => unreachable!(),
                    };
                    *control.0.lock().expect("workflow host control") = Some(outcome);
                }
                Err(nofy_tool_runtime::ToolError::custom(
                    "workflow_control",
                    "workflow host returned a control outcome",
                ))
            }
        };
        nofy_tool_runtime::terminal_only(result)
    }
}
