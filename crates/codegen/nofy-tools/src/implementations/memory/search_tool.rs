//! `memory_search` tool — new architecture (`Tool` trait).

use std::sync::Arc;

use super::types::MemorySearchInput;
use crate::types::memory_service::{ListMemoryRequest, MemoryService, SearchRequest};
use crate::types::output::ToolOutput;
use crate::types::tool::{ToolKind, ToolNamespace};

#[derive(Debug, Default)]
pub struct MemorySearchImpl;

impl crate::types::tool_metadata::ToolMetadata for MemorySearchImpl {
    fn kind(&self) -> ToolKind {
        ToolKind::MemorySearch
    }

    fn tool_namespace(&self) -> ToolNamespace {
        ToolNamespace::NofyBuild
    }

    fn description_template(&self) -> &str {
        "Search or list the user's single memory system. Omit query to answer ‘你记得我什么’; \
         otherwise returns ranked results from 关于我 and \
         当前项目 without exposing internal files or storage layers.\n\n\
         Use this proactively when:\n\
         - A question references prior work, decisions, or context you don't have\n\
         - You need project conventions, coding patterns, or user preferences\n\
         - The user mentions something discussed or decided in a previous session\n\
         - Starting work in an unfamiliar part of the codebase\n\
         - After compaction when prior context may have been lost\n\n\
         Saving memories: use `memory_write` to remember, revise, or forget a durable fact. \
         Changes become searchable in the current session before the tool returns.\n\n\
         Memory is historical context, not automatically the current plan. Verify recalled \
         facts against live sources before relying on them."
    }
}

impl nofy_tool_runtime::Tool for MemorySearchImpl {
    type Args = MemorySearchInput;
    type Output = ToolOutput;

    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("memory_search").expect("valid tool id")
    }

    fn description(
        &self,
        _ctx: &::nofy_tool_runtime::ListToolsContext,
    ) -> nofy_tool_types::ToolDescription {
        nofy_tool_types::ToolDescription::new(
            "memory_search",
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
        input: MemorySearchInput,
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
        let max_results = input.max_results.unwrap_or(6);
        let min_score = input.min_score.unwrap_or(0.0);
        let query = input.query.unwrap_or_default();
        if query.trim().is_empty() {
            let list = memory
                .list(ListMemoryRequest { area: None })
                .await
                .map_err(|error| {
                    nofy_tool_runtime::ToolError::execution(
                        nofy_tool_protocol::ToolId::new("memory_search").expect("valid"),
                        format!("memory list failed: {error}"),
                    )
                })?;
            if list.items.is_empty() {
                return Ok(ToolOutput::Text("No memories have been saved yet.".into()));
            }
            let mut output = format!("Remembered {} item(s):\n", list.items.len());
            for item in list.items.into_iter().take(max_results) {
                output.push_str(&format!(
                    "\n- [{}] {}\n  Target: {}\n  Hash: {}\n",
                    item.area.user_label(),
                    item.summary,
                    item.target.id,
                    item.target.expected_hash.as_deref().unwrap_or("unavailable"),
                ));
            }
            return Ok(ToolOutput::Text(output.into()));
        }
        tracing::info!(target: crate::types::memory_service::MEMORY_LOG_TARGET, max_results, "MEMORY_SEARCH: invoked");
        let results = memory
            .search(SearchRequest {
                query,
                max_results,
                min_score,
            })
            .await
            .map_err(|e| {
                nofy_tool_runtime::ToolError::execution(
                    nofy_tool_protocol::ToolId::new("memory_search").expect("valid"),
                    format!("memory search failed: {e}"),
                )
            })?;
        tracing::info!(target: crate::types::memory_service::MEMORY_LOG_TARGET, results = results.hits.len(), "MEMORY_SEARCH: complete");
        if results.hits.is_empty() {
            return Ok(ToolOutput::Text(
                "No memory results found for query.".into(),
            ));
        }
        let mut output = format!("Found {} memory result(s):\n", results.hits.len());
        for (i, result) in results.hits.iter().enumerate() {
            output.push_str(&format!(
                "\n### Result {} (score: {:.2}, area: {})\n**Target:** {}\n**Hash:** {}\n{}\n",
                i + 1,
                result.score,
                result.area.user_label(),
                result.target.id,
                result
                    .target
                    .expected_hash
                    .as_deref()
                    .unwrap_or("unavailable"),
                result.summary,
            ));
        }
        Ok(ToolOutput::Text(output.into()))
    }
}
