//! Shell implementation of the agent's cross-session recall backend.
//!
//! Wraps the local session FTS index (`storage::search::execute_search`) so
//! the agent's `session_recall` tool can search the user's *other* sessions
//! across all projects — the natural-language counterpart of
//! `nofy sessions search --all`. Always local; needs no auth.

use nofy_tools::types::session_recall::{SessionRecallHit, SessionRecallProvider};

use crate::session::storage::search::{execute_search, SessionSearchRequest};
use crate::util::nofy_home::nofy_home;

/// Recall backend over the local session index (all projects).
#[derive(Debug, Default)]
pub struct ShellSessionRecall;

#[async_trait::async_trait]
impl SessionRecallProvider for ShellSessionRecall {
    async fn search(&self, query: &str, limit: usize) -> Result<Vec<SessionRecallHit>, String> {
        let root = nofy_home();
        let req = SessionSearchRequest {
            query: query.to_string(),
            cwd: None, // global view: all projects
            limit,
            offset: 0,
            include_content: true,
        };
        let resp = execute_search(&root, &req).await.map_err(|e| e.to_string())?;
        Ok(resp
            .results
            .into_iter()
            .map(|r| SessionRecallHit {
                session_id: r.session_id,
                title: r.title,
                cwd: r.cwd,
                snippet: r.snippet,
                score: r.score as f64,
                updated_at_unix: r.updated_at_unix,
            })
            .collect())
    }
}
