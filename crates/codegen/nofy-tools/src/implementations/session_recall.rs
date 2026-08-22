//! `session_recall` tool — autonomous cross-session recall.
//!
//! Lets the agent bring information from the user's *other* conversations
//! into the current one, in natural-language interaction, without the user
//! manually running any command. Reads the injected
//! [`crate::types::session_recall::SessionRecallProvider`] (implemented by
//! the shell over the local session FTS index). Complements
//! `memory_search` (curated memory) with raw cross-session recall.

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::types::output::ToolOutput;
use crate::types::session_recall::SessionRecallAccess;
use crate::types::tool::{ToolKind, ToolNamespace};

/// Input for the `session_recall` tool.
#[derive(Debug, Clone, Deserialize, Serialize, JsonSchema)]
pub struct SessionRecallInput {
    /// What to look for in the user's other sessions. Use concrete terms
    /// (a file, a decision, an error, a topic) rather than conversational
    /// phrasing.
    pub query: String,
    /// Maximum number of hits to return. Defaults to 5.
    #[serde(default)]
    pub max_results: Option<usize>,
}

/// Recall relevant context from the user's other sessions.
#[derive(Debug, Default)]
pub struct SessionRecallTool;

impl crate::types::tool_metadata::ToolMetadata for SessionRecallTool {
    fn kind(&self) -> ToolKind {
        ToolKind::MemorySearch
    }

    fn tool_namespace(&self) -> ToolNamespace {
        ToolNamespace::NofyBuild
    }

    fn description_template(&self) -> &str {
        "Search the user's OTHER conversations (across all projects) for \
         relevant context and bring it into this one. Returns ranked hits \
         with session title, project, and a matching snippet.\n\n\
         Use this proactively when:\n\
         - The user references something discussed or done in another \
         conversation or window that you cannot see here\n\
         - The user asks 'what did we decide / do before' across sessions\n\
         - You need prior context from a different project or window\n\n\
         Prefer `memory_search` for curated long-term knowledge; use this \
         for raw prior-conversation detail."
    }
}

impl nofy_tool_runtime::Tool for SessionRecallTool {
    type Args = SessionRecallInput;
    type Output = ToolOutput;

    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("session_recall").expect("valid tool id")
    }

    fn description(
        &self,
        _ctx: &::nofy_tool_runtime::ListToolsContext,
    ) -> nofy_tool_types::ToolDescription {
        nofy_tool_types::ToolDescription::new(
            "session_recall",
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
        input: SessionRecallInput,
    ) -> Result<ToolOutput, nofy_tool_runtime::ToolError> {
        use crate::types::tool_metadata::shared_resources;
        let resources = shared_resources(&ctx)?;
        let Some(access) = resources.lock().await.get::<SessionRecallAccess>().cloned() else {
            return Ok(ToolOutput::Text(
                "Session recall is not available in this session.".into(),
            ));
        };
        let limit = input.max_results.unwrap_or(5);
        let hits = access.0.search(&input.query, limit).await.map_err(|e| {
            nofy_tool_runtime::ToolError::execution(
                nofy_tool_protocol::ToolId::new("session_recall").expect("valid"),
                format!("session recall failed: {e}"),
            )
        })?;
        if hits.is_empty() {
            return Ok(ToolOutput::Text(
                "No matching prior sessions found.".into(),
            ));
        }
        let mut out = String::new();
        for hit in &hits {
            let title = if hit.title.is_empty() {
                "(untitled)"
            } else {
                &hit.title
            };
            out.push_str(&format!(
                "session {} (project: {}, score {:.2}) — {}\n",
                hit.session_id, hit.cwd, hit.score, title
            ));
            if let Some(snippet) = &hit.snippet {
                out.push_str(&format!("  {}\n", snippet.trim()));
            }
        }
        Ok(ToolOutput::Text(out.into()))
    }
}
