//! `memory_get` tool — new architecture (`Tool` trait).

use std::sync::Arc;

use super::types::MemoryGetInput;
use crate::types::memory_service::{MemoryService, MemoryTarget};
use crate::types::output::ToolOutput;
use crate::types::tool::{ToolKind, ToolNamespace};

#[derive(Debug, Default)]
pub struct MemoryGetImpl;

impl crate::types::tool_metadata::ToolMetadata for MemoryGetImpl {
    fn kind(&self) -> ToolKind {
        ToolKind::MemoryGet
    }

    fn tool_namespace(&self) -> ToolNamespace {
        ToolNamespace::NofyBuild
    }

    fn description_template(&self) -> &str {
        "Read one memory by the stable target ID and hash returned by memory_search. \
         Returns its human-readable title, area, body, and revision without exposing internal paths.\n\n\
         Memory is historical context, not automatically the current plan. Verify recalled facts \
         against live sources before relying on them."
    }
}

impl nofy_tool_runtime::Tool for MemoryGetImpl {
    type Args = MemoryGetInput;
    type Output = ToolOutput;

    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("memory_get").expect("valid tool id")
    }

    fn description(
        &self,
        _ctx: &::nofy_tool_runtime::ListToolsContext,
    ) -> nofy_tool_types::ToolDescription {
        nofy_tool_types::ToolDescription::new(
            "memory_get",
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
        input: MemoryGetInput,
    ) -> Result<ToolOutput, nofy_tool_runtime::ToolError> {
        use crate::types::tool_metadata::shared_resources;
        let resources = shared_resources(&ctx)?;
        let Some(memory) = resources
            .lock()
            .await
            .get::<Arc<dyn MemoryService>>()
            .cloned()
        else {
            return Ok(ToolOutput::Text(
                "Memory is not enabled. Use --experimental-memory to enable.".into(),
            ));
        };
        tracing::info!(target: crate::types::memory_backend::MEMORY_LOG_TARGET,"MEMORY_GET: invoked");
        let target = MemoryTarget {
            id: input.target_id,
            expected_hash: input.expected_hash,
        };
        let document = memory
            .get(target.clone())
            .await
            .map_err(|e| {
                nofy_tool_runtime::ToolError::execution(
                    nofy_tool_protocol::ToolId::new("memory_get").expect("valid"),
                    format!("memory get failed: {e}"),
                )
            })?;
        let explanation = memory.explain(target).await.map_err(|e| {
            nofy_tool_runtime::ToolError::execution(
                nofy_tool_protocol::ToolId::new("memory_get").expect("valid"),
                format!("memory explanation failed: {e}"),
            )
        })?;
        let output = format!(
            "**{}**\n**Area:** {}\n**Revision:** {}\n**Target:** {}\n**Why remembered:** {}\n**Remembered at:** {}\n\n{}",
            document.title,
            document.area.user_label(),
            document.revision,
            document.target.id,
            explanation.source,
            explanation.remembered_at,
            document.body,
        );
        Ok(ToolOutput::Text(output.into()))
    }
}
