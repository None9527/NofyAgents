//! `delegate_task` / `delegation_status` tools — autonomous delegation.
//!
//! Lets the agent hand a self-contained goal to a background daemon run
//! (and follow up on it) without the user manually running `nofy task
//! submit` / `nofy task list`. Reads the injected
//! [`crate::types::delegation::DelegationProvider`] (implemented by the
//! shell over the daemon control socket). Refusals surface verbatim —
//! including the U4-06 "a delegated run is still active" fail-loud.

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::types::delegation::DelegationAccess;
use crate::types::output::ToolOutput;
use crate::types::tool::{ToolKind, ToolNamespace};

/// Input for the `delegate_task` tool.
#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct DelegateTaskInput {
    /// The complete, self-contained goal for the background run. Must carry
    /// all context it needs (the delegated agent cannot see this
    /// conversation).
    pub goal: String,
    /// Project directory the delegated run works in. Omit to use the
    /// current directory.
    #[serde(default)]
    pub cwd: Option<String>,
    /// Task identifier. Omit to generate one.
    #[serde(default)]
    pub task_id: Option<String>,
}

/// Delegate a self-contained goal to a background daemon run.
#[derive(Debug, Default)]
pub struct DelegateTaskTool;

impl crate::types::tool_metadata::ToolMetadata for DelegateTaskTool {
    fn kind(&self) -> ToolKind {
        ToolKind::Task
    }

    fn tool_namespace(&self) -> ToolNamespace {
        ToolNamespace::NofyBuild
    }

    fn description_template(&self) -> &str {
        "Delegate a self-contained goal to a background daemon run, then \
         keep working (or let the user walk away). The daemon dispatches \
         the goal to a provider agent that executes it with a real tool \
         loop, and an acceptance judge verifies the goal against the \
         actual work before the task settles.\n\n\
         Use this proactively when:\n\
         - A subtask is long-running, mechanical, or safe to run \
         unattended\n\
         - The user wants a result later without watching the work\n\n\
         The goal must be complete and self-contained. Fails loud if \
         another delegated run is still active — check `delegation_status` \
         first."
    }
}

impl nofy_tool_runtime::Tool for DelegateTaskTool {
    type Args = DelegateTaskInput;
    type Output = ToolOutput;

    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("delegate_task").expect("valid tool id")
    }

    fn description(
        &self,
        _ctx: &::nofy_tool_runtime::ListToolsContext,
    ) -> nofy_tool_types::ToolDescription {
        nofy_tool_types::ToolDescription::new(
            "delegate_task",
            crate::types::tool_metadata::ToolMetadata::sanitized_description_template(self),
        )
    }

    fn capabilities(&self) -> nofy_tool_protocol::ToolCapabilities {
        nofy_tool_protocol::ToolCapabilities {
            is_read_only: false,
            ..Default::default()
        }
    }

    async fn run(
        &self,
        ctx: nofy_tool_runtime::ToolCallContext,
        input: DelegateTaskInput,
    ) -> Result<ToolOutput, nofy_tool_runtime::ToolError> {
        use crate::types::tool_metadata::shared_resources;
        let resources = shared_resources(&ctx)?;
        let Some(access) = resources.lock().await.get::<DelegationAccess>().cloned() else {
            return Ok(ToolOutput::Text(
                "Delegation is not available in this session.".into(),
            ));
        };
        if input.goal.trim().is_empty() {
            return Ok(ToolOutput::Text("Refusing to delegate an empty goal.".into()));
        }
        let task_id = input.task_id.clone().unwrap_or_else(generate_task_id);
        let total = access
            .0
            .submit(&task_id, input.goal.trim(), input.cwd.as_deref())
            .await
            .map_err(|e| {
                nofy_tool_runtime::ToolError::execution(
                    nofy_tool_protocol::ToolId::new("delegate_task").expect("valid"),
                    e,
                )
            })?;
        Ok(ToolOutput::Text(
            format!(
                "accepted: delegated task `{task_id}` to a background run \
                 ({total} task(s) in the plan). The acceptance judge settles \
                 it against the actual work. Use `delegation_status` to \
                 follow up."
            )
            .into(),
        ))
    }
}

/// Input for the `delegation_status` tool.
#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct DelegationStatusInput {}

/// List delegated tasks with their lifecycle state.
#[derive(Debug, Default)]
pub struct DelegationStatusTool;

impl crate::types::tool_metadata::ToolMetadata for DelegationStatusTool {
    fn kind(&self) -> ToolKind {
        ToolKind::List
    }

    fn tool_namespace(&self) -> ToolNamespace {
        ToolNamespace::NofyBuild
    }

    fn description_template(&self) -> &str {
        "List delegated tasks with their lifecycle state.\n\n\
         Use this proactively when:\n\
         - You delegated work via `delegate_task` and need to follow up\n\
         - The user asks about background or delegated work\n\n\
         Read-only."
    }
}

impl nofy_tool_runtime::Tool for DelegationStatusTool {
    type Args = DelegationStatusInput;
    type Output = ToolOutput;

    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("delegation_status").expect("valid tool id")
    }

    fn description(
        &self,
        _ctx: &::nofy_tool_runtime::ListToolsContext,
    ) -> nofy_tool_types::ToolDescription {
        nofy_tool_types::ToolDescription::new(
            "delegation_status",
            crate::types::tool_metadata::ToolMetadata::sanitized_description_template(self),
        )
    }

    fn capabilities(&self) -> nofy_tool_protocol::ToolCapabilities {
        nofy_tool_protocol::ToolCapabilities {
            is_read_only: true,
            tool_scope: Some(nofy_tool_protocol::ToolScope::Read),
            ..Default::default()
        }
    }

    async fn run(
        &self,
        ctx: nofy_tool_runtime::ToolCallContext,
        _input: DelegationStatusInput,
    ) -> Result<ToolOutput, nofy_tool_runtime::ToolError> {
        use crate::types::tool_metadata::shared_resources;
        let resources = shared_resources(&ctx)?;
        let Some(access) = resources.lock().await.get::<DelegationAccess>().cloned() else {
            return Ok(ToolOutput::Text(
                "Delegation is not available in this session.".into(),
            ));
        };
        let tasks = access.0.status().await.map_err(|e| {
            nofy_tool_runtime::ToolError::execution(
                nofy_tool_protocol::ToolId::new("delegation_status").expect("valid"),
                format!("delegation status failed: {e}"),
            )
        })?;
        if tasks.is_empty() {
            return Ok(ToolOutput::Text("(no delegated tasks)".into()));
        }
        let mut out = String::from("TASK                     STATE            RUN\n");
        for task in &tasks {
            out.push_str(&format!("{:<24} {:<16} {}\n", task.id, task.state, task.run));
        }
        Ok(ToolOutput::Text(out.into()))
    }
}

/// Default task id: `agt-<unix millis>` — unique enough for one user's
/// delegations, readable in the journal.
fn generate_task_id() -> String {
    let millis = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or(0);
    format!("agt-{millis}")
}
