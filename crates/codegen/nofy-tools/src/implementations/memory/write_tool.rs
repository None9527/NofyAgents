//! `memory_write` tool — remember, revise, and forget through one service.

use std::sync::Arc;

use super::types::{MemoryWriteAction, MemoryWriteInput, MemoryWriteOutput, MemoryWriteScope};
use crate::types::memory_service::{
    ForgetRequest, MemoryArea, MemoryService, MemoryTarget, RememberRequest, ReviseTopicRequest,
    UndoToken,
};
use crate::types::output::ToolOutput;
use crate::types::tool::{ToolKind, ToolNamespace};

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
        "Manage the user's single memory system. Use `remember` for a new durable fact, \
         `revise` with target_id + expected_hash to correct one, and `forget` with the same \
         stable target plus explicit confirmation to remove one. Use `undo` with the operation ID \
         returned by a recent remember/revise. Choose `personal` for 关于我 or `project` for \
         当前项目. Credentials and secrets are never stored."
    }
}

impl nofy_tool_runtime::Tool for MemoryWriteImpl {
    type Args = MemoryWriteInput;
    type Output = MemoryWriteOutput;

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
    ) -> Result<MemoryWriteOutput, nofy_tool_runtime::ToolError> {
        use crate::types::tool_metadata::shared_resources;
        let tool_id = nofy_tool_protocol::ToolId::new("memory_write").expect("valid");
        let resources = shared_resources(&ctx)?;
        let Some(memory) = resources
            .lock()
            .await
            .get::<Arc<dyn MemoryService>>()
            .cloned()
        else {
            return Err(nofy_tool_runtime::ToolError::execution(
                tool_id.clone(),
                "Memory is not enabled. Enable memory before using this tool.".to_owned(),
            ));
        };
        let output = match input.action {
            MemoryWriteAction::Remember => {
                let statement = require_statement(&tool_id, input.statement)?;
                let area = match input.scope.ok_or_else(|| {
                    nofy_tool_runtime::ToolError::execution(
                        tool_id.clone(),
                        "scope is required for remember".to_owned(),
                    )
                })? {
                    MemoryWriteScope::Personal => MemoryArea::Personal,
                    MemoryWriteScope::Project => MemoryArea::Project,
                };
                let receipt = memory
                    .remember(RememberRequest {
                        area,
                        statement,
                        title: None,
                        confirm_sensitive: input.confirmed,
                    })
                    .await
                    .map_err(|error| execution(&tool_id, error))?;
                MemoryWriteOutput {
                    public_receipt: format!(
                        "已记住到“{}”：{}。撤销",
                        receipt.area_label, receipt.summary
                    ),
                    action: MemoryWriteAction::Remember,
                    area_label: Some(receipt.area_label),
                    summary: Some(receipt.summary),
                    target_id: Some(receipt.target.id),
                    expected_hash: receipt.target.expected_hash,
                    undo_operation_id: Some(receipt.undo_token.operation_id),
                    undo_generation: Some(receipt.undo_token.generation),
                }
            }
            MemoryWriteAction::Revise => {
                let statement = require_statement(&tool_id, input.statement)?;
                let receipt = memory
                    .revise(ReviseTopicRequest {
                        target: require_target(&tool_id, input.target_id, input.expected_hash)?,
                        replacement: statement,
                    })
                    .await
                    .map_err(|error| execution(&tool_id, error))?;
                MemoryWriteOutput {
                    public_receipt: format!("已纠正记忆：{}。撤销", receipt.summary),
                    action: MemoryWriteAction::Revise,
                    area_label: None,
                    summary: Some(receipt.summary),
                    target_id: Some(receipt.target.id),
                    expected_hash: receipt.target.expected_hash,
                    undo_operation_id: Some(receipt.undo_token.operation_id),
                    undo_generation: Some(receipt.undo_token.generation),
                }
            }
            MemoryWriteAction::Forget => {
                let receipt = memory
                    .forget(ForgetRequest {
                        target: require_target(&tool_id, input.target_id, input.expected_hash)?,
                        confirmed: input.confirmed,
                    })
                    .await
                    .map_err(|error| execution(&tool_id, error))?;
                MemoryWriteOutput {
                    public_receipt: receipt.summary.clone(),
                    action: MemoryWriteAction::Forget,
                    area_label: None,
                    summary: Some(receipt.summary),
                    target_id: None,
                    expected_hash: None,
                    undo_operation_id: None,
                    undo_generation: None,
                }
            }
            MemoryWriteAction::Undo => {
                let operation_id = input
                    .undo_operation_id
                    .filter(|value| !value.trim().is_empty())
                    .ok_or_else(|| {
                        nofy_tool_runtime::ToolError::execution(
                            tool_id.clone(),
                            "undo_operation_id is required for undo".to_owned(),
                        )
                    })?;
                let receipt = memory
                    .undo(UndoToken {
                        operation_id,
                        generation: input.undo_generation.unwrap_or(1),
                    })
                    .await
                    .map_err(|error| execution(&tool_id, error))?;
                MemoryWriteOutput {
                    public_receipt: "已撤销最近的记忆操作。".to_owned(),
                    action: MemoryWriteAction::Undo,
                    area_label: None,
                    summary: None,
                    target_id: None,
                    expected_hash: None,
                    undo_operation_id: None,
                    undo_generation: Some(receipt.snapshot_generation),
                }
            }
        };
        Ok(output)
    }
}

fn require_statement(
    tool_id: &nofy_tool_protocol::ToolId,
    statement: Option<String>,
) -> Result<String, nofy_tool_runtime::ToolError> {
    let statement = statement.unwrap_or_default();
    let statement = statement.trim();
    if statement.is_empty() {
        return Err(nofy_tool_runtime::ToolError::execution(
            tool_id.clone(),
            "statement is required for remember/revise".to_owned(),
        ));
    }
    if statement.chars().count() > MAX_WRITE_CHARS {
        return Err(nofy_tool_runtime::ToolError::execution(
            tool_id.clone(),
            format!("statement exceeds the {MAX_WRITE_CHARS}-character limit"),
        ));
    }
    Ok(statement.to_owned())
}

fn require_target(
    tool_id: &nofy_tool_protocol::ToolId,
    id: Option<String>,
    expected_hash: Option<String>,
) -> Result<MemoryTarget, nofy_tool_runtime::ToolError> {
    let id = id.filter(|value| !value.trim().is_empty()).ok_or_else(|| {
        nofy_tool_runtime::ToolError::execution(
            tool_id.clone(),
            "target_id is required for revise/forget".to_owned(),
        )
    })?;
    if expected_hash.is_none() {
        return Err(nofy_tool_runtime::ToolError::execution(
            tool_id.clone(),
            "expected_hash is required for revise/forget".to_owned(),
        ));
    }
    Ok(MemoryTarget { id, expected_hash })
}

fn execution(
    tool_id: &nofy_tool_protocol::ToolId,
    error: impl std::fmt::Display,
) -> nofy_tool_runtime::ToolError {
    nofy_tool_runtime::ToolError::execution(tool_id.clone(), error.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn public_receipt_hides_opaque_coordinates_while_prompt_keeps_them() {
        let output = MemoryWriteOutput {
            public_receipt: "已记住到“关于我”：默认使用 Rust。撤销".to_owned(),
            action: MemoryWriteAction::Remember,
            area_label: Some("关于我".to_owned()),
            summary: Some("默认使用 Rust".to_owned()),
            target_id: Some("topic-opaque".to_owned()),
            expected_hash: Some("hash-opaque".to_owned()),
            undo_operation_id: Some("undo-opaque".to_owned()),
            undo_generation: Some(7),
        };

        assert!(!output.public_receipt.contains("topic-opaque"));
        assert!(!output.public_receipt.contains("hash-opaque"));
        assert!(!output.public_receipt.contains("undo-opaque"));

        let prompt = ToolOutput::MemoryWrite(output).to_prompt_format();
        assert!(prompt.contains("topic-opaque"));
        assert!(prompt.contains("hash-opaque"));
        assert!(prompt.contains("undo-opaque"));
    }

    #[test]
    fn memory_write_output_round_trips_through_registry_shape() {
        let output = ToolOutput::MemoryWrite(MemoryWriteOutput {
            public_receipt: "已纠正记忆：使用稳定版 Rust。撤销".to_owned(),
            action: MemoryWriteAction::Revise,
            area_label: None,
            summary: Some("使用稳定版 Rust".to_owned()),
            target_id: Some("topic-1".to_owned()),
            expected_hash: Some("hash-1".to_owned()),
            undo_operation_id: Some("undo-1".to_owned()),
            undo_generation: Some(2),
        });

        let json = serde_json::to_value(&output).unwrap();
        let decoded: ToolOutput = serde_json::from_value(json).unwrap();
        let ToolOutput::MemoryWrite(decoded) = decoded else {
            panic!("expected memory write output");
        };
        assert_eq!(decoded.public_receipt, "已纠正记忆：使用稳定版 Rust。撤销");
        assert_eq!(decoded.target_id.as_deref(), Some("topic-1"));
    }
}
