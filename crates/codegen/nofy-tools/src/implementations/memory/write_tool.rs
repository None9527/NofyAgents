//! `memory_write` tool — active memory writes (add / replace / remove).
//!
//! Complements the read-only `memory_search` / `memory_get` surface: the
//! agent can deliberately persist durable facts instead of relying on
//! editing memory files through generic file tools. Writes are governed:
//! the tool is not read-only, so it flows through the permission system
//! and the runtime journal's tool-intent chain like any other mutation.
//!
//! Frozen-snapshot semantics: a successful write lands on disk and in the
//! search index immediately, but the current session's injected memory
//! snapshot is not refreshed (injection happens once at session start to
//! protect the prompt cache). The tool says so in its output.

use std::sync::Arc;

use super::types::{MemoryWriteAction, MemoryWriteInput, MemoryWriteScope};
use crate::types::memory_writer::MemoryWriter;
use crate::types::output::ToolOutput;
use crate::types::tool::{ToolKind, ToolNamespace};

/// Hard cap for a single write payload (chars). Curated memory holds
/// compact durable facts, not transcripts; oversized payloads are
/// rejected at the tool boundary.
pub const MAX_WRITE_CHARS: usize = 1000;

#[derive(Debug, Default)]
pub struct MemoryWriteImpl;

impl crate::types::tool_metadata::ToolMetadata for MemoryWriteImpl {
    fn kind(&self) -> ToolKind {
        ToolKind::MemoryWrite
    }

    fn tool_namespace(&self) -> ToolNamespace {
        ToolNamespace::NofyBuild
    }

    fn description_template(&self) -> &str {
        "Write to cross-session memory. Use this to deliberately persist durable facts, \
         decisions, or user preferences that future sessions should know.\n\n\
         Actions:\n\
         - add: append a new entry (one or two sentences — a durable fact, not a transcript)\n\
         - replace: replace an existing entry identified by a short unique substring (old_text)\n\
         - remove: delete an existing entry identified by a short unique substring (old_text)\n\n\
         Scopes:\n\
         - workspace: this project only (default choice for project conventions, decisions, patterns)\n\
         - global: all projects (user preferences, environment facts, workflow habits)\n\n\
         Use this proactively when:\n\
         - The user states a lasting preference (\"I prefer ...\", \"always use ...\")\n\
         - A decision is made that future sessions must respect\n\
         - You discover a durable project fact (build quirk, convention) worth keeping\n\n\
         Writes are saved to disk and indexed immediately, but only injected into context \
         at the start of the next session. Update stale entries with replace or remove \
         instead of appending contradictions."
    }
}

impl nofy_tool_runtime::Tool for MemoryWriteImpl {
    type Args = MemoryWriteInput;
    type Output = ToolOutput;

    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("memory_write").expect("valid tool id")
    }

    fn description(
        &self,
        _ctx: &::nofy_tool_runtime::ListToolsContext,
    ) -> nofy_tool_types::ToolDescription {
        nofy_tool_types::ToolDescription::new(
            "memory_write",
            crate::types::tool_metadata::ToolMetadata::sanitized_description_template(self),
        )
    }

    fn capabilities(&self) -> nofy_tool_protocol::ToolCapabilities {
        nofy_tool_protocol::ToolCapabilities {
            is_read_only: false,
            tool_scope: Some(nofy_tool_protocol::ToolScope::Write),
            ..Default::default()
        }
    }

    async fn run(
        &self,
        ctx: nofy_tool_runtime::ToolCallContext,
        input: MemoryWriteInput,
    ) -> Result<ToolOutput, nofy_tool_runtime::ToolError> {
        use crate::types::tool_metadata::shared_resources;
        let tool_id = nofy_tool_protocol::ToolId::new("memory_write").expect("valid");
        let resources = shared_resources(&ctx)?;
        let Some(writer) = resources
            .lock()
            .await
            .get::<Arc<dyn MemoryWriter>>()
            .cloned()
        else {
            return Ok(ToolOutput::Text(
                "Memory is not enabled. Use --experimental-memory to enable.".into(),
            ));
        };

        let scope = match input.scope {
            MemoryWriteScope::Global => "global",
            MemoryWriteScope::Workspace => "workspace",
        };

        // Validate the payload at the tool boundary.
        let content = input.content.unwrap_or_default();
        match input.action {
            MemoryWriteAction::Add | MemoryWriteAction::Replace => {
                let trimmed = content.trim();
                if trimmed.is_empty() {
                    return Err(nofy_tool_runtime::ToolError::execution(
                        tool_id,
                        "content must be a non-empty entry".to_string(),
                    ));
                }
                if trimmed.chars().count() > MAX_WRITE_CHARS {
                    return Err(nofy_tool_runtime::ToolError::execution(
                        tool_id,
                        format!(
                            "content exceeds the {MAX_WRITE_CHARS}-char limit for one memory entry; split it into smaller facts"
                        ),
                    ));
                }
            }
            MemoryWriteAction::Remove => {}
        }
        if matches!(input.action, MemoryWriteAction::Replace | MemoryWriteAction::Remove)
            && input
                .old_text
                .as_deref()
                .map(str::trim)
                .map_or(true, str::is_empty)
        {
            return Err(nofy_tool_runtime::ToolError::execution(
                tool_id,
                "old_text is required for replace/remove and must be a non-empty unique substring".to_string(),
            ));
        }

        tracing::info!(
            target: crate::types::memory_backend::MEMORY_LOG_TARGET,
            action = ?input.action,
            scope,
            "MEMORY_WRITE: invoked"
        );

        let outcome = match input.action {
            MemoryWriteAction::Add => writer.add(scope, content.trim()).await,
            MemoryWriteAction::Replace => {
                writer
                    .replace(scope, input.old_text.as_deref().unwrap(), content.trim())
                    .await
            }
            MemoryWriteAction::Remove => {
                writer
                    .remove(scope, input.old_text.as_deref().unwrap())
                    .await
            }
        }
        .map_err(|e| nofy_tool_runtime::ToolError::execution(tool_id, e.to_string()))?;

        Ok(ToolOutput::Text(
            format!(
                "{} ({})\nSaved to disk and indexed; it will be injected into context at the start of the next session.",
                outcome.summary, outcome.path
            )
            .into(),
        ))
    }
}
