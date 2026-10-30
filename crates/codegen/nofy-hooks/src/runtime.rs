//! Compatibility handler over the original dispatcher, matcher, trust snapshot
//! and HTTP/command runners. Hosts choose this OR their legacy fire site.
use crate::{
    discovery::HookRegistry,
    event::{HookEventEnvelope, HookEventName, HookPayload},
    trust::DisabledHooks,
};
use nofy_agent_runtime::{
    Error, RunContext,
    hooks::{HookDecision, HookEvent, HookHandler},
};
use serde_json::{Value, json};
use std::{path::PathBuf, sync::Arc};

mod execution;

pub struct LegacyDispatcher {
    registry: HookRegistry,
    disabled: Arc<DisabledHooks>,
    workspace: PathBuf,
}
impl LegacyDispatcher {
    async fn record_results(
        &self,
        results: &[crate::result::HookRunResult],
        event: &HookEvent,
        context: &RunContext,
    ) -> Result<(), Error> {
        let Some(sink) = context
            .capabilities
            .get::<nofy_agent_runtime::events::EventSinkBinding>()
        else {
            return Ok(());
        };
        for result in results {
            use crate::result::HookRunResult::*;
            let (hook, status) = match result {
                Success { hook_name, .. } => (hook_name, "legacy_completed"),
                Skipped { hook_name } => (hook_name, "legacy_skipped"),
                Blocked { hook_name, .. } => (hook_name, "legacy_blocked"),
                Failed { hook_name, .. } => (hook_name, "legacy_failed_fail_open"),
            };
            // Expanded legacy HTTP URLs remain in the original diagnostics;
            // the public event rail carries the outcome without secret values.
            sink.0
                .record(
                    event.scope.clone(),
                    nofy_agent_runtime::events::RunEvent::Hook {
                        event_id: event.id.clone(),
                        event_name: event.name.clone(),
                        hook: hook.clone(),
                        status: status.into(),
                        detail: None,
                    },
                )
                .await?;
        }
        Ok(())
    }
    pub fn new(
        mut registry: HookRegistry,
        disabled: Arc<DisabledHooks>,
        workspace: PathBuf,
    ) -> Result<Self, Error> {
        if !workspace.is_absolute() {
            return Err(Error::Composition(
                "legacy hook workspace must be absolute".into(),
            ));
        }
        registry.recompile_matchers();
        Ok(Self {
            registry,
            disabled,
            workspace,
        })
    }
    fn envelope(&self, event: &HookEvent) -> Result<HookEventEnvelope, Error> {
        use HookEventName as Name;
        let call = event.payload.get("call").unwrap_or(&Value::Null);
        let mut tool_name = call
            .get("name")
            .and_then(Value::as_str)
            .unwrap_or("")
            .to_owned();
        let tool_id = call
            .get("id")
            .or_else(|| event.payload.get("call_id"))
            .and_then(Value::as_str)
            .unwrap_or("")
            .to_owned();
        let mut input = call.get("arguments").cloned().unwrap_or_else(|| json!({}));
        if tool_name == "use_tool"
            && let (Some(name), Some(arguments)) = (
                input.get("tool_name").and_then(Value::as_str),
                input.get("tool_input"),
            )
        {
            tool_name = name.into();
            input = arguments.clone();
        }
        let (input, truncated) = crate::event::truncate_payload(input);
        let subagent = event
            .scope
            .parent_run_id
            .as_ref()
            .map(|_| event.scope.agent.clone());
        let output = event
            .payload
            .get("output")
            .and_then(Value::as_str)
            .map(crate::event::clip_assistant_message);
        let (name, payload) = match event.name.as_str() {
            "session_start" => (
                Name::SessionStart,
                HookPayload::SessionStart {
                    source: "startup".into(),
                    model_id: None,
                    agent_type: Some(event.scope.agent.clone()),
                },
            ),
            "session_end" => (
                Name::SessionEnd,
                HookPayload::SessionEnd {
                    reason: event
                        .payload
                        .get("reason")
                        .and_then(Value::as_str)
                        .unwrap_or("closed")
                        .into(),
                    turn_count: None,
                    tool_call_count: None,
                },
            ),
            "user_input" => (
                Name::UserPromptSubmit,
                HookPayload::UserPromptSubmit {
                    prompt: event
                        .payload
                        .pointer("/message/content")
                        .and_then(Value::as_str)
                        .map(str::to_owned),
                },
            ),
            "before_tool" => (
                Name::PreToolUse,
                HookPayload::PreToolUse {
                    tool_name,
                    tool_use_id: tool_id,
                    tool_input: input,
                    tool_input_truncated: truncated,
                    subagent_type: subagent,
                },
            ),
            "after_tool" => {
                let (result, result_truncated) = crate::event::truncate_payload(
                    event.payload.get("result").cloned().unwrap_or(Value::Null),
                );
                (
                    Name::PostToolUse,
                    HookPayload::PostToolUse {
                        tool_name,
                        tool_use_id: tool_id,
                        tool_input: input,
                        tool_result: result,
                        tool_input_truncated: truncated,
                        tool_result_truncated: result_truncated,
                        duration_ms: None,
                        is_backgrounded: false,
                        subagent_type: subagent,
                    },
                )
            }
            "tool_failure" => (
                Name::PostToolUseFailure,
                HookPayload::PostToolUseFailure {
                    tool_name,
                    tool_use_id: tool_id,
                    tool_input: input,
                    tool_input_truncated: truncated,
                    error: event
                        .payload
                        .get("result")
                        .or_else(|| event.payload.get("reason"))
                        .map(Value::to_string)
                        .unwrap_or_else(|| "tool failed".into()),
                    subagent_type: subagent,
                },
            ),
            "permission_denied" => (
                Name::PermissionDenied,
                HookPayload::PermissionDenied {
                    tool_name,
                    tool_use_id: tool_id,
                    tool_input: input,
                    tool_input_truncated: truncated,
                },
            ),
            "before_stop" => (
                Name::Stop,
                HookPayload::Stop {
                    reason: "completed".into(),
                    stop_hook_active: event
                        .payload
                        .get("stop_hook_active")
                        .and_then(Value::as_bool)
                        .unwrap_or(false),
                    last_assistant_message: output,
                    background_tasks: None,
                    session_crons: None,
                },
            ),
            "turn_error" => (
                Name::StopFailure,
                HookPayload::StopFailure {
                    error: crate::event::StopFailureKind::Unknown,
                    error_details: event.payload.get("error").map(Value::to_string),
                    last_assistant_message: output,
                    subagent_type: subagent,
                },
            ),
            "turn_cancelled" => (
                Name::StopCancelled,
                HookPayload::StopCancelled {
                    reason: if event.payload.get("reason").and_then(Value::as_str)
                        == Some("budget_exceeded")
                    {
                        crate::event::StopCancelledReason::MaxTurns
                    } else {
                        crate::event::StopCancelledReason::UserInterrupt
                    },
                    cancelled_by: if event.payload.get("reason").and_then(Value::as_str)
                        == Some("budget_exceeded")
                    {
                        crate::event::CancelledBy::Runtime
                    } else {
                        crate::event::CancelledBy::User
                    },
                    cancel_trigger: None,
                    reason_details: None,
                    last_assistant_message: output,
                    subagent_type: subagent,
                },
            ),
            "before_compact" => (
                Name::PreCompact,
                HookPayload::PreCompact {
                    source: event
                        .payload
                        .get("source")
                        .and_then(Value::as_str)
                        .unwrap_or("auto")
                        .into(),
                },
            ),
            "after_compact" => (
                Name::PostCompact,
                HookPayload::PostCompact {
                    source: event
                        .payload
                        .get("source")
                        .and_then(Value::as_str)
                        .unwrap_or("auto")
                        .into(),
                },
            ),
            "subagent_start" => (
                Name::SubagentStart,
                HookPayload::SubagentStart {
                    subagent_id: event
                        .payload
                        .get("id")
                        .and_then(Value::as_str)
                        .unwrap_or("")
                        .into(),
                    subagent_type: event
                        .payload
                        .get("agent")
                        .and_then(Value::as_str)
                        .unwrap_or("agent")
                        .into(),
                    description: None,
                },
            ),
            "subagent_stop" => (
                Name::SubagentStop,
                HookPayload::SubagentStop {
                    phase: crate::event::SubagentStopPhase::Gate,
                    subagent_id: event
                        .payload
                        .get("id")
                        .and_then(Value::as_str)
                        .unwrap_or("")
                        .into(),
                    subagent_type: event
                        .payload
                        .get("agent")
                        .and_then(Value::as_str)
                        .unwrap_or("agent")
                        .into(),
                    stop_hook_active: Some(
                        event
                            .payload
                            .get("stop_hook_active")
                            .and_then(Value::as_bool)
                            .unwrap_or(false),
                    ),
                    last_assistant_message: output,
                },
            ),
            other => {
                return Err(Error::Composition(format!(
                    "legacy dispatcher has no event mapping: {other}"
                )));
            }
        };
        let workspace = self.workspace.to_string_lossy().into_owned();
        Ok(HookEventEnvelope {
            hook_event_name: name,
            session_id: event.scope.thread_id.clone(),
            cwd: workspace.clone(),
            workspace_root: workspace,
            timestamp: chrono::Utc::now().to_rfc3339(),
            transcript_path: None,
            client_identifier: None,
            prompt_id: Some(event.scope.run_id.clone()),
            permission_mode: None,
            payload,
        })
    }
}
#[async_trait::async_trait]
impl HookHandler for LegacyDispatcher {
    async fn handle(&self, event: &HookEvent, context: &RunContext) -> Result<HookDecision, Error> {
        let execution = execution::RuntimeExecution::new(event, context);
        let result = self.dispatch(event, context, &execution).await;
        execution.finish(result)
    }
}
impl LegacyDispatcher {
    async fn dispatch(
        &self,
        event: &HookEvent,
        context: &RunContext,
        execution: &dyn crate::runner::HookExecution,
    ) -> Result<HookDecision, Error> {
        let envelope = self.envelope(event)?;
        let workspace = self.workspace.to_string_lossy();
        let run = crate::runner::RunContext {
            session_id: &event.scope.thread_id,
            workspace_root: &workspace,
            process_scope: context
                .capabilities
                .get::<nofy_tools::util::ProcessScope>()
                .map(|scope| (*scope).clone()),
            disabled: self.disabled.clone(),
        };
        match envelope.hook_event_name.traits().gate {
            crate::event::GateKind::Tool => {
                let result = crate::dispatcher::dispatch_pre_tool_use_with_execution(
                    &self.registry,
                    &envelope,
                    &run,
                    execution,
                )
                .await;
                self.record_results(&result.results, event, context).await?;
                Ok(match result.decision {
                    crate::result::HookDecision::Allow => HookDecision::Continue,
                    crate::result::HookDecision::Deny { reason, .. } => {
                        HookDecision::Deny { reason }
                    }
                })
            }
            crate::event::GateKind::Stop => {
                let result = crate::dispatcher::dispatch_stop_with_execution(
                    &self.registry,
                    envelope.hook_event_name,
                    &envelope,
                    &run,
                    execution,
                )
                .await;
                if let Some(stop) = &result.prevent_continuation {
                    self.record_results(&result.results, event, context).await?;
                    return Ok(HookDecision::Stop {
                        reason: Some(stop.reason.clone()),
                    });
                }
                if result.wants_continuation() {
                    self.record_results(&result.results, event, context).await?;
                    let mut feedback: Vec<_> = result
                        .blocks
                        .into_iter()
                        .map(|block| block.reason)
                        .collect();
                    feedback.extend(result.additional_context);
                    Ok(HookDecision::Deny {
                        reason: feedback.join("\n"),
                    })
                } else {
                    self.record_results(&result.results, event, context).await?;
                    Ok(HookDecision::Continue)
                }
            }
            crate::event::GateKind::Observe => {
                let results = crate::dispatcher::dispatch_non_blocking_with_execution(
                    &self.registry,
                    envelope.hook_event_name,
                    &envelope,
                    &run,
                    execution,
                )
                .await;
                self.record_results(&results, event, context).await?;
                Ok(HookDecision::Continue)
            }
        }
    }
}
