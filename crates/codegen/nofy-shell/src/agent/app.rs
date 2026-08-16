use parking_lot::Mutex;
use std::pin::Pin;
use std::rc::Rc;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};

use agent_client_protocol as acp;
use tokio::io::{AsyncBufReadExt as _, AsyncWriteExt as _, BufReader, simplex};
use tokio::sync::{Mutex as TokioMutex, mpsc};
use tokio::time::Duration;
use tokio_util::compat::{TokioAsyncReadCompatExt as _, TokioAsyncWriteCompatExt as _};
use tracing::{debug, info, warn};

use nofy_acp_lib::{
    AcpAgentGatewayReceiver as GatewayReceiver, AcpAgentGatewaySender as GatewaySender,
    LineBufferedRead,
};

use crate::agent::config::{Config as AgentConfig, ModelEntry};
use crate::agent::init::{bootstrap, exit_on_config_error};
use crate::agent::models::{ModelFetchAuth, prefetch_models_blocking};
use crate::agent::mvp_agent::MvpAgent;
use crate::auth::{AuthManager, AuthMode, NofyAuth, NofyComConfig};
use crate::extensions::session_admin::{InternalMethod, internal_request_line};
use crate::util::nofy_home;
use dirs;

const MAX_BUFFER_SIZE: usize = 8 * 1024 * 1024;

use indexmap::IndexMap;

/// Spawn the agent inside a LocalSet and return a handle to the I/O future.
fn spawn_agent_local(
    agent_config: AgentConfig,
    auth_manager: Arc<AuthManager>,
    prefetched_models: Option<IndexMap<String, ModelEntry>>,
    memory_config: Option<crate::config::MemoryConfig>,
    outgoing: impl futures::AsyncWrite + Unpin + 'static,
    incoming: impl futures::AsyncRead + Unpin + 'static,
) -> impl std::future::Future<Output = Result<(), acp::Error>> {
    let (gw_tx, gw_rx) = tokio::sync::mpsc::unbounded_channel();
    let gateway = GatewaySender::new(gw_tx);
    let mut agent = MvpAgent::new(gateway, &agent_config, auth_manager, prefetched_models)
        .unwrap_or_else(exit_on_config_error);
    // Background the catalog refresh so readiness never blocks on the network.
    agent.models_manager.spawn_background_refresh();
    if let Some(mc) = memory_config {
        agent.set_memory_config(mc);
    }
    let incoming = LineBufferedRead::spawn_local(incoming);
    let (conn, handle_io) = acp::AgentSideConnection::new(agent, outgoing, incoming, |fut| {
        tokio::task::spawn_local(fut);
    });
    tokio::task::spawn_local(
        GatewayReceiver::new(gw_rx, conn)
            .with_on_meta(nofy_file_utils::trace_context::span_from_meta_traceparent)
            .run(),
    );
    handle_io
}

fn internal_reload_request_line(
    id: &str,
    method: InternalMethod,
    params: serde_json::Value,
) -> String {
    internal_request_line(id, method, params)
}

/// Start a skills file watcher and wire it to inject `nofy/internal/reload_skills`
/// messages into the shared ACP incoming stream when SKILL.md files change on disk.
///
/// or `None` if no directories could be watched.
fn spawn_skills_file_watcher<W>(
    acp_incoming_tx: &Arc<TokioMutex<W>>,
    skills_paths: &[String],
) -> Option<tokio::task::JoinHandle<()>>
where
    W: tokio::io::AsyncWrite + Unpin + Send + 'static,
{
    let cwd = std::env::current_dir().unwrap_or_default();
    let workspace_user_dir = nofy_agent::prompt::workspace_user::optional_workspace_user_dir();
    let (mut watcher, mut skills_rx) = crate::config::watcher::SkillsFileWatcher::start(
        Some(cwd.as_path()),
        workspace_user_dir.as_deref(),
        skills_paths,
    )?;
    let skills_tx = acp_incoming_tx.clone();
    let task = tokio::spawn(async move {
        while let Some(change) = skills_rx.recv().await {
            let created_discovery_dir = watcher.refresh_new_discovery_dirs();
            let (id, method) = match change {
                crate::config::watcher::DiscoveryChange::Skills if !created_discovery_dir => {
                    info!("Skill directory changed on disk, reloading skills for all sessions");
                    ("skills-reload", InternalMethod::ReloadSkills)
                }
                crate::config::watcher::DiscoveryChange::Skills => {
                    info!("Discovery directory created on disk, reloading skills and workflows");
                    ("skills-reload", InternalMethod::ReloadSkills)
                }
                crate::config::watcher::DiscoveryChange::Workflows => {
                    info!(
                        "Workflow directory changed on disk, re-advertising commands for all sessions"
                    );
                    ("workflows-reload", InternalMethod::ReloadWorkflows)
                }
            };
            let line = internal_reload_request_line(id, method, serde_json::json!({}));
            let mut tx = skills_tx.lock().await;
            if let Err(e) = tx.write_all(line.as_bytes()).await {
                warn!(
                    error = %e,
                    "failed to inject skills reload into ACP stream"
                );
            }
        }
    });
    Some(task)
}

/// Register the process-lifetime runtime so shared filesystem watchers
/// ([`nofy_fsnotify::shared`]) run their event loops on a runtime that outlives
/// individual sessions (each session builds its own short-lived runtime).
/// Idempotent — safe to call from every agent entrypoint.
fn register_fs_watch_runtime() {
    nofy_fsnotify::set_runtime_handle(tokio::runtime::Handle::current());
}

pub async fn run_stdio_agent(
    agent_config: &AgentConfig,
    prefetched_models: Option<IndexMap<String, ModelEntry>>,
    memory_config: Option<crate::config::MemoryConfig>,
) -> anyhow::Result<()> {
    register_fs_watch_runtime();
    // Daemon provider loop (NOFY_DAEMON_SOCK-gated, default off): when the
    // gate is set this runtime registers as the daemon's execution provider
    // and serves search + dispatched tasks on the control socket.
    let _provider_host = crate::agent::provider_host::spawn_provider_host(agent_config.clone());
    // A stdio agent is a protocol child speaking over pipes inherited from
    // whoever spawned it (nofy-desktop, IDE clients, the agent SDKs, a parent
    // agent's subagent harness) — it is useless without that parent. stdin
    // EOF already triggers shutdown below, but an agent wedged mid-turn (or
    // under thread exhaustion) may never read stdin again; bind to parent
    // death (Linux `PR_SET_PDEATHSIG(SIGTERM)`, no-op elsewhere) so the
    // kernel reaps it instead of leaving an orphan accumulating pid slots on
    // shared hosts. The leader entrypoint intentionally does NOT do this —
    // it is designed to outlive its clients.
    if let Err(error) = nofy_tty_utils::kill_current_process_on_parent_death() {
        tracing::warn!(
            %error,
            "failed to bind to parent death; agent will not die with its \
             parent — stdin EOF remains the only cleanup"
        );
    }
    // Stamp binary version into unified log entries so zombie processes
    // are identifiable by version in diagnostic logs.
    nofy_telemetry::unified_log::set_version(nofy_version::VERSION);

    // Clean up orphaned upload queue temp files from previous sessions (best-effort).
    // Uses DEFAULT_MAX_AGE to stay in sync with the upload queue's retry policy.
    nofy_file_utils::queue::cleanup_orphaned_uploads(
        &nofy_home::nofy_home(),
        nofy_file_utils::queue::DEFAULT_MAX_AGE,
    );

    // Log the client that launched us (set by nofy-desktop when spawning `nofy agent stdio`).
    // This appears early in unified.jsonl and is extremely useful for auth diagnostics.
    if let Ok(version) = std::env::var("NOFY_CLIENT_VERSION") {
        crate::unified_log::info(
            "NOFY_CLIENT_VERSION",
            None,
            Some(serde_json::json!({ "version": version })),
        );
    }

    let _total_timer = crate::instrumentation_timer!("startup.stdio_agent_total");
    let outgoing = tokio::io::stdout().compat_write();
    // Non-blocking boot: catalog refreshes in the background, not before readiness.
    let agent_config = agent_config.clone();

    // Use a simplex intermediary between stdin and the agent so we can
    // inject internal messages (e.g. skill-reload) alongside real client
    // input. This mirrors the pattern used by `run_leader`.
    let (acp_incoming_rx, acp_incoming_tx) = simplex(MAX_BUFFER_SIZE);
    let incoming = acp_incoming_rx.compat();
    let acp_incoming_tx = Arc::new(TokioMutex::new(acp_incoming_tx));

    // Bridge stdin to the simplex writer. A dedicated OS thread does the
    // blocking stdin reads (see `nofy_acp_lib::spawn_stdin_line_reader`): on
    // Windows `tokio::io::stdin()` only delivers buffered lines from a
    // redirected pipe at EOF, so a persistent ACP client (which keeps stdin
    // open) would hang the `initialize` handshake. The forwarder writes each
    // complete line to the simplex so injected internal messages (from the
    // skills watcher) never interleave mid-line with client data.
    let stdin_tx = acp_incoming_tx.clone();
    let (stdin_closed_tx, stdin_closed_rx) = tokio::sync::oneshot::channel();
    let mut stdin_lines = nofy_acp_lib::spawn_stdin_line_reader();
    tokio::spawn(async move {
        while let Some(line) = stdin_lines.recv().await {
            let mut tx = stdin_tx.lock().await;
            if tx.write_all(&line).await.is_err() {
                break;
            }
        }
        // Signal that stdin closed. The actual simplex shutdown is performed
        // on the LocalSet so pending ACP request handlers can flush their
        // responses first (they run on the same LocalSet and would be
        // starved by an immediate cross-thread shutdown).
        let _ = stdin_closed_tx.send(());
    });

    let _skills_watcher = spawn_skills_file_watcher(&acp_incoming_tx, &agent_config.skills.paths);

    let local_set = tokio::task::LocalSet::new();
    let result = local_set
        .run_until(async move {
            // Shut down the simplex writer on the LocalSet so it's cooperative with ACP handlers.
            let simplex_tx = acp_incoming_tx;
            tokio::task::spawn_local(async move {
                let _ = stdin_closed_rx.await;
                tokio::time::sleep(Duration::from_millis(100)).await;
                let mut tx = simplex_tx.lock().await;
                let _ = tx.shutdown().await;
            });

            // Create the auth manager here (not in `spawn_agent_local`) so the session-start refresh can
            // drive a token refresh before bootstrap reads policy; the same manager goes to the agent.
            let auth_manager = Arc::new(agent_config.create_auth_manager());
            // Proactive token refresh; runs until process exit.
            auth_manager.start_proactive_refresh(tokio_util::sync::CancellationToken::new());
            // Pause refreshes across system sleep so an OIDC refresh can't straddle a
            // suspend (which can revoke the refresh token and force re-login).
            // `nofy agent stdio` is a local/interactive entrypoint (spawned by
            // nofy-desktop), so it needs the gate like the leader and pager paths;
            // no-op where the OS listener is unavailable.
            auth_manager.start_system_power_listener();

            // Restore managed policy right before bootstrap reads it (no stale window after prefetch).
            crate::managed_config::ensure_managed_policy_present(&auth_manager).await;
            apply_otel_config(&auth_manager, &agent_config.nofy_com_config);
            let handle_io = spawn_agent_local(
                agent_config,
                auth_manager,
                prefetched_models,
                memory_config,
                outgoing,
                incoming,
            );
            handle_io.await?;
            Ok::<(), anyhow::Error>(())
        })
        .await;
    // Kill PTY child processes so they don't outlive the agent.
    crate::terminal::pty_session::close_all().await;

    // Brief grace period for the upload queue worker to finish in-flight uploads.
    // The worker runs on the tokio runtime (not the LocalSet), so it continues
    // after the LocalSet drops. The channel closes when all senders drop (agent
    // exit), and the worker drains remaining items before exiting.
    tokio::time::sleep(std::time::Duration::from_secs(2)).await;

    result
}

pub async fn run_headless(
    agent_config: &AgentConfig,
    reauthenticate: bool,
    memory_config: Option<crate::config::MemoryConfig>,
) -> anyhow::Result<()> {
    let _ = (agent_config, reauthenticate, memory_config);
    anyhow::bail!(
        "headless mode depended on the nofy.com relay and xAI account login, \
         which were removed in the sanitized build; use `agent stdio` (ACP) instead"
    )
}

/// Close the external-OTEL gate before telemetry init; see
/// [`crate::agent::otel_gate`].
pub fn suppress_otel() {
    crate::agent::otel_gate::suppress();
}

/// Startup external-OTEL gate for an in-process (embedded) agent. Mirrors the
/// leader startup gate so the pager process is fail-closed by construction at
/// the agent boundary.
pub fn apply_otel_config(auth_manager: &AuthManager, nofy_com_config: &NofyComConfig) {
    suppress_otel();
    // Session presence is disk-based (valid or expired), not refresh success: an
    // expired session the refresher will renew still has a remote policy, so it
    // must keep the gate closed.
    let has_session = auth_manager.current().is_some() || auth_manager.read_disk_auth().is_some();
    if crate::agent::otel_gate::should_open_at_startup(crate::agent::otel_gate::StartupGate {
        channel: crate::agent::otel_gate::resolved_policy_channel(),
        has_session,
        session_pending: crate::agent::otel_gate::is_session_pending(has_session, nofy_com_config),
    }) {
        crate::agent::otel_gate::open_at_startup();
    }
}

/// Leader mode was removed in the sanitized build (it depended on the
/// nofy.com relay and xAI account login). The signature is kept minimal and
/// always bails; use `agent stdio` (ACP) instead.
pub async fn run_leader(
    agent_config: &AgentConfig,
    no_exit_on_disconnect: bool,
    relay_on_demand: bool,
    memory_config: Option<crate::config::MemoryConfig>,
) -> anyhow::Result<()> {
    let _ = (
        agent_config,
        no_exit_on_disconnect,
        relay_on_demand,
        memory_config,
    );
    anyhow::bail!(
        "leader mode depended on the nofy.com relay and xAI account login, \
         which were removed in the sanitized build; use `agent stdio` (ACP) instead"
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::AtomicU32;
    use tokio::sync::watch;
    use tokio_util::sync::CancellationToken;

    /// The embedded startup gate (every pager `--no-leader` / fallback path) must be
    /// fail-closed by construction: a session user stays closed until the agent
    /// resolves settings, even when an env API key is also present (the key must
    /// not bypass the session's remote policy).
    #[test]
    #[serial_test::serial]
    fn embedded_otel_gate_keeps_a_session_user_fail_closed() {
        use crate::agent::auth_method::NOFY_API_KEY_ENV_VAR;
        use nofy_telemetry::external::{
            is_settings_gate_open, mark_external_otel_settings_resolved,
        };

        unsafe fn set_or_clear(key: &str, value: Option<std::ffi::OsString>) {
            match value {
                Some(v) => unsafe { std::env::set_var(key, v) },
                None => unsafe { std::env::remove_var(key) },
            }
        }

        /// Restores the api-key env and reopens the gate on drop so no state leaks.
        struct Restore {
            key: Option<std::ffi::OsString>,
            proxy: Option<std::ffi::OsString>,
        }
        impl Drop for Restore {
            fn drop(&mut self) {
                // SAFETY: serialized by `#[serial]`.
                unsafe {
                    set_or_clear(NOFY_API_KEY_ENV_VAR, self.key.take());
                    set_or_clear(PROXY_ENV_VAR, self.proxy.take());
                }
                mark_external_otel_settings_resolved();
            }
        }

        const PROXY_ENV_VAR: &str = "NOFY_CLI_CHAT_PROXY_BASE_URL";
        let _restore = Restore {
            key: std::env::var_os(NOFY_API_KEY_ENV_VAR),
            proxy: std::env::var_os(PROXY_ENV_VAR),
        };
        let cfg = NofyComConfig::default();

        // SAFETY: serialized by `#[serial]`.
        unsafe {
            std::env::set_var(NOFY_API_KEY_ENV_VAR, "test-key");
            std::env::remove_var(PROXY_ENV_VAR);
        }

        let session = NofyAuth {
            // Far-future expiry so `current()` accepts it regardless of clock skew
            // or a leaked `NOFY_AUTH_EARLY_INVALIDATION_SECS` buffer; the gate reads
            // session presence via `current()`, which filters expired tokens.
            expires_at: chrono::DateTime::from_timestamp(9_999_999_999, 0),
            auth_mode: AuthMode::Oidc,
            oidc_issuer: Some(crate::auth::NOFY_OAUTH2_ISSUER.to_string()),
            ..NofyAuth::test_default()
        };
        let with_session = {
            let dir = tempfile::tempdir().unwrap();
            let am = Arc::new(AuthManager::new(dir.path(), NofyComConfig::default()));
            am.hot_swap(session);
            am
        };
        apply_otel_config(&with_session, &cfg);
        assert!(
            !is_settings_gate_open(),
            "a session user must boot fail-closed even with an env key set"
        );
    }

    #[test]
    fn internal_reload_request_line_carries_id_params_and_newline() {
        let line = internal_reload_request_line(
            "config-reload-models",
            InternalMethod::ReloadModels,
            serde_json::json!({}),
        );
        assert!(line.ends_with('\n'), "must be a newline-terminated line");
        let msg: serde_json::Value = serde_json::from_str(line.trim_end()).unwrap();
        assert_eq!(
            msg["method"], "_nofy/internal/reload_models",
            "wire method must carry the `_` ext prefix or the ACP decoder \
             rejects it with method_not_found"
        );
        assert_eq!(msg["id"], "config-reload-models");
        assert_eq!(msg["jsonrpc"], "2.0");

        // Params must pass through verbatim (project-MCP reload carries cwd).
        let line = internal_reload_request_line(
            "config-reload-project-mcp",
            InternalMethod::ReloadProjectMcpServers,
            serde_json::json!({ "cwd": "/repo/x" }),
        );
        let msg: serde_json::Value = serde_json::from_str(line.trim_end()).unwrap();
        assert_eq!(msg["params"]["cwd"], "/repo/x");

        let line = internal_reload_request_line(
            "config-auth-cleared",
            InternalMethod::AuthCleared,
            serde_json::json!({}),
        );
        let msg: serde_json::Value = serde_json::from_str(line.trim_end()).unwrap();
        assert_eq!(msg["method"], "_nofy/internal/auth_cleared");
    }
}
