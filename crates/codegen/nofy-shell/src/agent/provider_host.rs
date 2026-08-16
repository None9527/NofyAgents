//! Daemon provider-loop host (app-level integration).
//!
//! The shell registers as the daemon's execution provider when — and only
//! when — `NOFY_DAEMON_SOCK` is set (default off: unset env means the loop
//! never starts and no new outbound calls exist). Two jobs are served with
//! the shipped stacks:
//!
//! - `SearchPoll` — search delegation: the query runs on the shell's FTS
//!   index ([`crate::session::storage::search::execute_search`]) and the
//!   rows reduce to the wire answer (hit count + matched session ids).
//! - `TaskPoll` — a `TaskDispatch` maps through [`crate::agent::pack_join`]
//!   into a real agent assembly; the goal then rides one inference call
//!   whose system prompt is the assembled agent's rendered prompt.

use std::path::{Path, PathBuf};
use std::sync::Arc;

use nofy_daemon::provider::ProviderClient;

use crate::agent::config::Config as AgentConfig;
use crate::agent::pack_join::{self, PackJoin};

/// Gate: path of the daemon control socket (`{NOFY_HOME}/daemon/control.sock`).
pub const DAEMON_SOCK_ENV: &str = "NOFY_DAEMON_SOCK";

/// Provider identity registered on the daemon control plane.
pub const PROVIDER_ID: &str = "shell-provider";

/// The gate read: `Some(socket)` only when the env is set and non-empty.
/// Absent gate = zero behavior change (the loop is never spawned).
pub fn daemon_socket_from_env() -> Option<PathBuf> {
    std::env::var(DAEMON_SOCK_ENV)
        .ok()
        .filter(|v| !v.trim().is_empty())
        .map(PathBuf::from)
}

/// Spawn the gated provider loop. Returns `None` when the gate env is
/// absent — the default, preserving zero-outbound startup.
pub fn spawn_provider_host(agent_config: AgentConfig) -> Option<std::thread::JoinHandle<()>> {
    let sock = daemon_socket_from_env()?;
    Some(std::thread::spawn(move || {
        run_provider_loop(&sock, &agent_config);
    }))
}

/// Connect (with retry backoff) and serve the provider loop until the
/// process exits; a dropped daemon connection is retried, never fatal.
/// One runtime outlives every reconnect so tasks spawned onto it (search
/// index workers) survive a dropped connection.
fn run_provider_loop(sock: &Path, agent_config: &AgentConfig) {
    let rt = match tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
    {
        Ok(rt) => rt,
        Err(e) => {
            tracing::error!(error = %e, "provider runtime build failed; loop not started");
            return;
        }
    };
    let mut backoff = std::time::Duration::from_millis(250);
    loop {
        match ProviderClient::connect(sock, PROVIDER_ID) {
            Ok(client) => {
                tracing::info!(socket = %sock.display(), "provider registered on daemon");
                backoff = std::time::Duration::from_millis(250);
                if let Err(e) = serve_loop(client, &rt, agent_config) {
                    tracing::warn!(error = %e, "provider loop ended; reconnecting");
                }
            }
            Err(e) => {
                tracing::debug!(error = %e, socket = %sock.display(), "daemon not reachable yet");
            }
        }
        std::thread::sleep(backoff);
        backoff = (backoff * 2).min(std::time::Duration::from_secs(15));
    }
}

/// One connection's worth of polling: search jobs first (a client is
/// blocked on them), then task dispatches; idle when both are empty.
fn serve_loop(
    mut client: ProviderClient<std::os::unix::net::UnixStream>,
    rt: &tokio::runtime::Runtime,
    agent_config: &AgentConfig,
) -> Result<(), nofy_channel::frame::FrameError> {
    use nofy_control_schema::methods::ControlResponse;
    loop {
        if let Some((request_id, query)) = client.search_poll_once()? {
            let root = crate::util::nofy_home::nofy_home();
            let (hits, sessions) = rt.block_on(delegate_session_search(&root, &query));
            client.answer_search(&request_id, hits, sessions)?;
            continue;
        }
        match client.poll_once()? {
            Some(dispatch) => {
                let task_id = match &dispatch {
                    ControlResponse::TaskDispatch { task_id, .. } => task_id.clone(),
                    other => {
                        tracing::warn!(?other, "unexpected dispatch frame ignored");
                        continue;
                    }
                };
                let ok = rt.block_on(execute_dispatch(&dispatch, agent_config));
                client.report(&task_id, ok)?;
            }
            None => std::thread::sleep(nofy_daemon::provider::POLL_IDLE),
        }
    }
}

/// Search delegation seam: run one query on the shell FTS stack and reduce
/// the rows to the wire answer. Failures degrade to an empty fail-closed
/// answer (a blocked client gets "no hits", never a hang). While the index
/// reports an in-flight bootstrap, an empty answer is a false negative, so
/// the query is retried (bounded) until the index settles — the same
/// re-query contract the ACP extension surfaces via `bootstrapping`.
pub(crate) async fn delegate_session_search(root: &Path, query: &str) -> (u32, Vec<String>) {
    let req = crate::session::storage::search::SessionSearchRequest {
        query: query.to_string(),
        cwd: None,
        limit: 100,
        offset: 0,
        include_content: false,
    };
    let deadline = tokio::time::Instant::now() + std::time::Duration::from_secs(6);
    loop {
        match crate::session::storage::search::execute_search(root, &req).await {
            Ok(resp) => {
                if resp.results.is_empty()
                    && resp.bootstrapping
                    && tokio::time::Instant::now() < deadline
                {
                    tokio::time::sleep(std::time::Duration::from_millis(250)).await;
                    continue;
                }
                return search_answer_from_response(&resp);
            }
            Err(error) => {
                tracing::warn!(%error, "provider search delegation failed");
                return (0, Vec::new());
            }
        }
    }
}

/// Reduce one search response to the wire answer: hit count + matched
/// session identities. Pure, so the delegation seam is unit-testable
/// without the process-global bootstrap worker.
pub(crate) fn search_answer_from_response(
    resp: &crate::session::storage::search::SessionSearchResponse,
) -> (u32, Vec<String>) {
    let sessions: Vec<String> = resp
        .results
        .iter()
        .map(|r| r.session_id.clone())
        .collect();
    let hits = resp.total_estimate.unwrap_or(sessions.len()) as u32;
    (hits, sessions)
}

/// Dispatch execution seam: pack join → agent assembly → one inference
/// call carrying the assembled system prompt. Returns the task outcome.
async fn execute_dispatch(
    dispatch: &nofy_control_schema::methods::ControlResponse,
    agent_config: &AgentConfig,
) -> bool {
    use nofy_control_schema::methods::ControlResponse;
    let (join, goal) = match dispatch {
        ControlResponse::TaskDispatch { goal, .. } => {
            let Some(join) = pack_join::join_from_dispatch(dispatch) else {
                return false;
            };
            (join, goal.clone())
        }
        _ => return false,
    };
    match run_provider_task(&join, &goal, agent_config).await {
        Ok(()) => {
            tracing::info!(task_id = %join.task_id, pack = %join.pack_id, "provider task completed");
            true
        }
        Err(error) => {
            tracing::warn!(task_id = %join.task_id, %error, "provider task failed");
            false
        }
    }
}

/// Assemble the dispatched agent (pack persona/skills, DS-P3 shadowing)
/// and ride one real inference call with the rendered system prompt.
async fn run_provider_task(
    join: &PackJoin,
    goal: &str,
    agent_config: &AgentConfig,
) -> anyhow::Result<()> {
    let cwd = std::env::current_dir()?;
    let builder = nofy_agent::AgentBuilder::new(
        cwd,
        Arc::new(nofy_tools::computer::local::LocalTerminalBackend::new()),
        nofy_tools::notification::ToolNotificationHandle::noop(),
    );
    let builder = pack_join::apply_to_builder(builder, join);
    let agent = builder.build().await?;

    let sampler_config = crate::agent::config::provider_task_sampling_config(agent_config);
    let client = nofy_sampler::SamplingClient::new(sampler_config)?;
    let request = nofy_sampling_types::ConversationRequest {
        items: vec![
            nofy_sampling_types::ConversationItem::system(agent.system_prompt().to_string()),
            nofy_sampling_types::ConversationItem::user(goal.to_string()),
        ],
        model: None,
        x_nofy_conv_id: Some(format!("provider-{}", join.task_id)),
        x_nofy_req_id: Some(format!("provider-{}", join.task_id)),
        ..Default::default()
    };
    let response = client.conversation_collect(request).await?;
    anyhow::ensure!(
        !response.items.is_empty(),
        "provider task got an empty model response"
    );
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn row(session_id: &str, title: &str) -> crate::session::storage::search_fts::SessionSearchRow {
        crate::session::storage::search_fts::SessionSearchRow {
            session_id: session_id.to_string(),
            cwd: "/ws".to_string(),
            title: title.to_string(),
            updated_at_unix: 1,
            score: 1.0,
            matched_fields: vec!["content".to_string()],
            snippet: None,
        }
    }

    /// The delegation reduction (no daemon, no global bootstrap worker):
    /// real `SessionSearchRow`s — including a CJK-titled session — reduce to
    /// the wire answer (hit count + matched session identities), and an
    /// empty response reduces to a fail-closed zero.
    #[test]
    fn search_answer_reduction_maps_rows_to_wire_answer() {
        use crate::session::storage::search::SessionSearchResponse;

        let resp = SessionSearchResponse {
            results: vec![
                row("seed-cjk-1", "跨项目中文检索命中测试"),
                row("seed-2", "second"),
            ],
            next_offset: None,
            total_estimate: Some(2),
            bootstrapping: false,
        };
        let (hits, sessions) = search_answer_from_response(&resp);
        assert_eq!(hits, 2);
        assert_eq!(sessions, vec!["seed-cjk-1".to_string(), "seed-2".to_string()]);

        // No total_estimate → falls back to the row count.
        let resp = SessionSearchResponse {
            results: vec![row("only", "t")],
            next_offset: None,
            total_estimate: None,
            bootstrapping: false,
        };
        assert_eq!(search_answer_from_response(&resp), (1, vec!["only".into()]));

        // Empty → fail-closed zero, no identities.
        let resp = SessionSearchResponse {
            results: vec![],
            next_offset: None,
            total_estimate: Some(0),
            bootstrapping: false,
        };
        assert_eq!(search_answer_from_response(&resp), (0, Vec::new()));
    }

    /// The delegation wiring drives the shipped `execute_search` stack on a
    /// fresh root and degrades to a fail-closed zero (never a hang, never a
    /// panic). Content-level CJK hits through the full bootstrap are proven
    /// by `provider_loop_e2e` on the built binary; content assertions here
    /// would race the process-global bootstrap worker (see `search.rs`).
    #[tokio::test(flavor = "multi_thread", worker_threads = 2)]
    async fn search_delegation_seam_empty_root_is_fail_closed_zero() {
        let root = tempfile::tempdir().unwrap();
        let outcome = tokio::time::timeout(
            std::time::Duration::from_secs(30),
            delegate_session_search(root.path(), "中文检索"),
        )
        .await
        .expect("delegation must not hang");
        assert_eq!(outcome, (0, Vec::new()), "an empty root yields zero hits");
    }

    #[test]
    #[serial_test::serial]
    fn gate_absent_means_no_provider_loop() {
        // The default environment (env unset) must never spawn the loop:
        // zero behavior change and zero new outbound calls.
        let _guard = nofy_test_support::env::EnvGuard::unset(DAEMON_SOCK_ENV);
        assert!(daemon_socket_from_env().is_none());
        assert!(
            spawn_provider_host(AgentConfig::default()).is_none(),
            "an unset gate must not spawn the provider loop"
        );
    }

    #[test]
    #[serial_test::serial]
    fn gate_set_resolves_socket_path() {
        let _guard =
            nofy_test_support::env::EnvGuard::set(DAEMON_SOCK_ENV, "/tmp/ctl/control.sock");
        assert_eq!(
            daemon_socket_from_env(),
            Some(PathBuf::from("/tmp/ctl/control.sock"))
        );
    }

    #[test]
    #[serial_test::serial]
    fn gate_blank_is_treated_as_absent() {
        let _guard = nofy_test_support::env::EnvGuard::set(DAEMON_SOCK_ENV, "   ");
        assert!(
            daemon_socket_from_env().is_none(),
            "a whitespace-only gate must stay off"
        );
    }
}
