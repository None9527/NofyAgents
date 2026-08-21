//! `delete_file` — recoverable deletion (W-9). Files and directories go
//! to the Nofy trash (`$NOFY_HOME/trash`) instead of being unlinked, so
//! a deletion can always be undone with `nofy trash restore <id>`. The
//! tool is the agent-facing half; the user face lives in
//! `nofy-pager::trash_cmd`.

use crate::types::requirements::Expr;
use crate::types::tool::{ToolKind, ToolNamespace};

/// Canonical tool name advertised by `FileTrashDeleteTool::id()`.
pub const FILE_TRASH_DELETE_TOOL_NAME: &str = "delete_file";

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, schemars::JsonSchema)]
pub struct FileTrashDeleteInput {
    /// Path of the file or directory to delete (recoverably).
    #[schemars(description = "Path of the file or directory to move to the trash")]
    pub path: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, schemars::JsonSchema)]
pub struct FileTrashDeleteOutput {
    pub success: bool,
    pub message: String,
}

impl nofy_tool_runtime::ToolOutput for FileTrashDeleteOutput {}

#[derive(Debug, Default)]
pub struct FileTrashDeleteTool;

/// The trash root for this process: `$NOFY_HOME/trash`, falling back to
/// `~/.nofy/trash` — the same home convention the daemon and CLI use.
fn trash_root() -> Result<std::path::PathBuf, String> {
    if let Ok(home) = std::env::var("NOFY_HOME") {
        if !home.trim().is_empty() {
            return Ok(std::path::PathBuf::from(home).join("trash"));
        }
    }
    let home = std::env::var("HOME").map_err(|_| "neither NOFY_HOME nor HOME is set".to_string())?;
    Ok(std::path::PathBuf::from(home).join(".nofy").join("trash"))
}

fn now_secs() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

impl crate::types::tool_metadata::ToolMetadata for FileTrashDeleteTool {
    fn kind(&self) -> ToolKind {
        ToolKind::Other
    }

    fn tool_namespace(&self) -> ToolNamespace {
        ToolNamespace::NofyBuild
    }

    fn description_template(&self) -> &str {
        r#"Delete a file or directory RECOVERABLY: it moves to the Nofy trash instead of being permanently removed.

Use this instead of `rm` whenever something should go away — deletions stay restorable via `nofy trash restore <id>` until the trash is emptied. Returns the trash entry id and the original path on success."#
    }

    fn requires_expr(&self) -> Expr<crate::types::requirements::ToolRequirement> {
        Expr::True
    }
}

impl nofy_tool_runtime::Tool for FileTrashDeleteTool {
    type Args = FileTrashDeleteInput;
    type Output = FileTrashDeleteOutput;

    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new(FILE_TRASH_DELETE_TOOL_NAME).expect("valid tool id")
    }

    fn description(
        &self,
        _ctx: &::nofy_tool_runtime::ListToolsContext,
    ) -> nofy_tool_types::ToolDescription {
        nofy_tool_types::ToolDescription::new(
            FILE_TRASH_DELETE_TOOL_NAME,
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

    #[tracing::instrument(
        name = "tool.delete_file",
        skip_all,
        fields(path = %input.path)
    )]
    async fn run(
        &self,
        _ctx: nofy_tool_runtime::ToolCallContext,
        input: FileTrashDeleteInput,
    ) -> Result<FileTrashDeleteOutput, nofy_tool_runtime::ToolError> {
        let target = std::path::PathBuf::from(&input.path);
        if !target.exists() {
            return Ok(FileTrashDeleteOutput {
                success: false,
                message: format!("path '{}' does not exist", input.path),
            });
        }
        let root = trash_root().map_err(|e| {
            nofy_tool_runtime::ToolError::custom("trash_root", e)
        })?;
        let store = nofy_stewardcore::trash::TrashStore::at(root);
        match store.add(&target, now_secs()) {
            Ok(entry) => Ok(FileTrashDeleteOutput {
                success: true,
                message: format!(
                    "Moved '{}' to the trash (id {}). Restore with `nofy trash restore {}`.",
                    entry.original_path, entry.id, entry.id
                ),
            }),
            Err(e) => Ok(FileTrashDeleteOutput {
                success: false,
                message: format!("trash move failed for '{}': {e}", input.path),
            }),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn trash_root_prefers_nofy_home() {
        // The resolver honors NOFY_HOME and falls back to ~/.nofy.
        let _guard = nofy_test_support::env::EnvGuard::set("NOFY_HOME", "/tmp/trash-root-probe");
        let root = trash_root().unwrap();
        assert_eq!(root, std::path::PathBuf::from("/tmp/trash-root-probe/trash"));
        drop(_guard);
        let _unset = nofy_test_support::env::EnvGuard::unset("NOFY_HOME");
        let fallback = trash_root().unwrap();
        assert!(fallback.ends_with(".nofy/trash"), "{fallback:?}");
    }

    #[test]
    fn staged_name_is_collision_safe() {
        // Two entries with the same stem never share a staged name —
        // verified through the store's add path.
        let dir = tempfile::tempdir().unwrap();
        let store = nofy_stewardcore::trash::TrashStore::at(dir.path().join("trash"));
        let mut names = std::collections::BTreeSet::new();
        for i in 0..2 {
            let p = dir.path().join("same.txt");
            std::fs::write(&p, format!("v{i}")).unwrap();
            let entry = store.add(&p, 900 + i as u64).unwrap();
            assert!(names.insert(entry.staged), "staged names never collide");
        }
    }
}
