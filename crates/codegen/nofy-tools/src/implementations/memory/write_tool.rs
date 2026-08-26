//! `memory_write` tool — active memory writes (add / replace / remove).
//!
//! Complements the read-only `memory_search` / `memory_get` surface: the
//! agent can deliberately persist durable facts instead of relying on
//! editing memory files through generic file tools. Writes are governed:
//! the tool is not read-only, so it flows through the permission system
//! and the runtime journal's tool-intent chain like any other mutation.
//!
//! Boundedness: each store has a character budget enforced on the final
//! result of a (batch of) operation(s); an over-budget write is rejected
//! with the current content shown so the agent can free room and retry in
//! one batch.
//!
//! Frozen-snapshot semantics: a successful write lands on disk and in the
//! search index immediately, but the current session's injected memory
//! snapshot is not refreshed (injection happens once at session start to
//! protect the prompt cache). The tool says so in its output.

use std::sync::Arc;

use super::types::{MemoryWriteAction, MemoryWriteInput, MemoryWriteScope};
use crate::types::memory_writer::{MemoryOp, MemoryWriter};
use crate::types::output::ToolOutput;
use crate::types::tool::{ToolKind, ToolNamespace};

/// Hard cap for a single entry payload (chars). Curated memory holds
/// compact durable facts, not transcripts; oversized payloads are
/// rejected at the tool boundary (store-level budgets apply on top).
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
        "Write to cross-session memory. Save durable facts, decisions, and user preferences \
         that future sessions should know.\n\n\
         SCOPES (where + what):\n\
         - user: WHO the user is — name, role, preferences, communication style, workflow \
           habits. Preferences change: REPLACE the stale entry instead of appending a \
           contradictory one.\n\
         - workspace: this project — conventions, decisions, architecture, tool quirks.\n\
         - global: cross-project facts that are not about the user.\n\n\
         HOW: prefer ONE batch call via the `operations` array (each item: {action, \
         content?, old_text?}). The batch applies atomically and the character budget is \
         checked only on the FINAL result — so one call can remove/shorten stale entries \
         to free room AND add new ones. Use the bare action/content/old_text fields only \
         for a single lone change.\n\n\
         IF FULL: an add is rejected with the current entries shown. Reissue as ONE batch \
         that removes or shortens enough stale entries and adds the new one together.\n\n\
         WHEN: save proactively when the user states a preference, correction, or personal \
         detail, or you learn a stable fact about their environment or conventions. \
         Priority: user preferences & corrections > environment facts > procedures. The \
         best memory stops the user repeating themselves.\n\n\
         SKIP: trivial or obvious info, easily re-discovered facts, raw data dumps, task \
         progress, completed-work logs, temporary TODO state. Reusable procedures belong \
         in skills, not memory.\n\n\
         Writes are saved to disk and indexed immediately, but only injected into context \
         at the start of the next session."
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
            MemoryWriteScope::User => "user",
        };

        // Assemble the operation list: explicit batch, or a single op from
        // the bare fields.
        let ops: Vec<MemoryOp> = if let Some(batch) = input.operations {
            if batch.is_empty() {
                return Err(nofy_tool_runtime::ToolError::execution(
                    tool_id,
                    "operations array must not be empty".to_string(),
                ));
            }
            let mut ops = Vec::with_capacity(batch.len());
            for (i, op) in batch.into_iter().enumerate() {
                ops.push(build_op(tool_id.clone(), i + 1, op.action, op.content, op.old_text)?);
            }
            ops
        } else {
            let Some(action) = input.action else {
                return Err(nofy_tool_runtime::ToolError::execution(
                    tool_id,
                    "provide either `action` (single op) or `operations` (batch)".to_string(),
                ));
            };
            vec![build_op(tool_id.clone(), 1, action, input.content, input.old_text)?]
        };

        tracing::info!(
            target: crate::types::memory_backend::MEMORY_LOG_TARGET,
            scope,
            ops = ops.len(),
            "MEMORY_WRITE: invoked"
        );

        let outcome = writer
            .apply_batch(scope, &ops)
            .await
            .map_err(|e| nofy_tool_runtime::ToolError::execution(tool_id.clone(), e.to_string()))?;

        let usage = writer.usage(scope).await.ok();
        let budget_note = usage.map_or_else(String::new, |u| {
            format!("\nStore usage: {}/{} chars.", u.used_chars, u.limit_chars)
        });

        Ok(ToolOutput::Text(
            format!(
                "{} ({}){}\nSaved to disk and indexed; it will be injected into context at the start of the next session.",
                outcome.summary, outcome.path, budget_note
            )
            .into(),
        ))
    }
}

/// Validate and convert one tool-level operation into the writer's `MemoryOp`.
fn build_op(
    tool_id: nofy_tool_protocol::ToolId,
    nth: usize,
    action: MemoryWriteAction,
    content: Option<String>,
    old_text: Option<String>,
) -> Result<MemoryOp, nofy_tool_runtime::ToolError> {
    let err = |msg: String| nofy_tool_runtime::ToolError::execution(tool_id, msg);
    match action {
        MemoryWriteAction::Add | MemoryWriteAction::Replace => {
            let content = content.unwrap_or_default();
            let trimmed = content.trim();
            if trimmed.is_empty() {
                return Err(err(format!(
                    "operation {nth}: content must be a non-empty entry"
                )));
            }
            if trimmed.chars().count() > MAX_WRITE_CHARS {
                return Err(err(format!(
                    "operation {nth}: content exceeds the {MAX_WRITE_CHARS}-char limit for one memory entry; split it into smaller facts"
                )));
            }
            if matches!(action, MemoryWriteAction::Replace) {
                require_old_text(&old_text, nth)?;
            }
            Ok(match action {
                MemoryWriteAction::Add => MemoryOp::Add(trimmed.to_string()),
                _ => MemoryOp::Replace {
                    old: old_text.unwrap(),
                    new: trimmed.to_string(),
                },
            })
        }
        MemoryWriteAction::Remove => {
            require_old_text(&old_text, nth)?;
            Ok(MemoryOp::Remove(old_text.unwrap()))
        }
    }
}

fn require_old_text(
    old_text: &Option<String>,
    nth: usize,
) -> Result<(), nofy_tool_runtime::ToolError> {
    if old_text
        .as_deref()
        .map(str::trim)
        .map_or(true, str::is_empty)
    {
        return Err(nofy_tool_runtime::ToolError::execution(
            nofy_tool_protocol::ToolId::new("memory_write").expect("valid"),
            format!("operation {nth}: old_text is required for replace/remove and must be a non-empty unique substring"),
        ));
    }
    Ok(())
}
