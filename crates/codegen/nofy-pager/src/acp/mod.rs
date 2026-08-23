//! ACP (Agent Communication Protocol) connection management.
//!
//! Handles spawning the agent process, initializing the protocol,
//! authenticating, and providing the channel for communication.

pub mod leader_bridge;
pub mod meta;
pub mod model_state;
pub mod spawn;
pub mod tracker;
mod version_mismatch;

pub(crate) use version_mismatch::{is_version_mismatch_banner, version_mismatch_banner};

use nofy_telemetry::startup;
pub use nofy_telemetry::startup::{
    AgentKind, Owner, StartupOutcome, StartupPhase, StartupTimer,
};

use anyhow::Result;
use tokio_util::sync::CancellationToken;

use crate::client_identity::{PAGER_CLIENT_TYPE, PAGER_CLIENT_VERSION};
use agent_client_protocol as acp;
use nofy_acp_lib::{AcpAgentTx, AcpClientRx, acp_send};
use nofy_shell::agent::auth_method::AuthMethodKind;
use nofy_shell::agent::config::Config as AgentConfig;
use nofy_shell::sampling::types::ReasoningEffort;

pub use model_state::ModelState;

/// Construct a `METHOD_NOT_FOUND` error for `WaitForTerminalExit`.
///
/// Both the interactive pager and headless mode reject this ACP method
/// (the adapter falls back to polling). Centralised here so the error
/// code and message format stay in sync.
pub(crate) fn wait_for_exit_not_supported(context: &str) -> acp::Error {
    acp::Error::new(
        acp::ErrorCode::MethodNotFound.into(),
        format!("{context} does not handle WaitForTerminalExit"),
    )
}

/// Result of connecting to an agent.
pub struct AcpConnection {
    /// Send requests to the agent.
    pub tx: AcpAgentTx,
    /// Receive notifications from the agent.
    pub rx: AcpClientRx,
    /// Available models and current selection.
    pub models: ModelState,
    /// Whether the agent is a nofy-shell instance.
    pub is_nofy_shell: bool,
    /// Auth methods advertised by the agent.
    pub auth_methods: Vec<acp::AuthMethod>,
    /// Cancellation token to stop the agent.
    pub cancel: CancellationToken,
    /// In-process agent worker thread (`connect` only). Join after cancel so
    /// session actors can flush SessionEnd hooks. `None` in leader mode.
    pub agent_thread: Option<std::thread::JoinHandle<anyhow::Result<()>>>,
    /// ACP-advertised slash commands parsed from `InitializeResponse.meta.availableCommands`.
    /// Seeded into every new `AgentSession` so autocomplete has shell builtins
    /// and skills immediately, before any `AvailableCommandsUpdate` arrives.
    pub available_commands: Vec<acp::AvailableCommand>,
    // NOTE: Startup announcements from InitializeResponse.meta are not yet supported.
    // Requires shell to include announcements in initialize metadata.
    // When available, add field: startup_announcements: Option<Vec<nofy_announcements::RemoteAnnouncement>>
    /// Auth response metadata from eager authentication (cached token / API key).
    /// Contains `team_name`, etc. `None` when no credential authenticated.
    pub auth_meta: Option<serde_json::Value>,
    /// Leader connection status. `Some` only when connected via leader.
    pub leader_status_rx: Option<tokio::sync::watch::Receiver<leader_bridge::ConnectionStatus>>,
    /// Whether cancel-rewind is enabled (resolved by shell from config layers).
    pub cancel_rewind_enabled: bool,
    /// Whether the session-recap feature is rolled out for this connection,
    /// resolved by the shell (remote settings / config / env; default OFF) and
    /// advertised in `InitializeResponse.meta.sessionRecap`. The client gates
    /// its automatic away-recap poll and the manual `/recap` on this so a
    /// disabled feature produces zero `nofy/recap` traffic. Defaults to `false`
    /// when absent (e.g. an older shell that predates the feature).
    pub session_recap_available: bool,
    /// `AuthManager` for pager-side authenticated channels.
    ///
    /// In-process mode shares the agent's instance (single token cache); leader
    /// mode builds a dedicated one off the same local `auth.json`. Either way it
    /// resolves a fresh bearer per request via the refresh chain.
    pub auth_manager: std::sync::Arc<nofy_shell::auth::AuthManager>,
}

/// CLI flags that affect agent configuration, threaded from PagerArgs.
#[derive(Debug, Clone, Default)]
pub struct ConnectFlags {
    pub subagents: bool,
    pub experimental_memory: bool,
    pub no_memory: bool,
    /// Session-scoped `--todo-gate` override. Forces
    /// `ReminderPolicy.todo_gate.enabled = true` for this session.
    pub todo_gate: bool,
    /// Session-scoped `--laziness-debug-log <path>` override. When set,
    /// the Layer-3 classifier fires after every turn regardless of the
    /// per-model enable gate, and the full outcome is appended to the
    /// given JSONL file. Observation-only (no nudges). Prototype/eval
    /// use only; not persisted to config.toml.
    pub laziness_debug_log: Option<std::path::PathBuf>,
    /// Storage mode override.
    pub storage_mode: Option<String>,
    /// Client identifier for ACP Initialize metadata.
    pub client_identifier: Option<String>,
    /// Hunk tracker mode for ACP Initialize capabilities.
    pub hunk_tracker_mode: Option<String>,
    /// Terminal capability in ACP Initialize.
    pub terminal: bool,
    /// Filesystem read capability in ACP Initialize.
    pub fs_read: bool,
    /// Filesystem write capability in ACP Initialize.
    pub fs_write: bool,
    /// Override the entire system prompt.
    pub system_prompt_override: Option<String>,
    /// Extra rules appended to the system prompt (from `--rules`).
    pub rules: Option<String>,
    /// Override reasoning effort for all models.
    pub reasoning_effort_override: Option<ReasoningEffort>,
    /// CLI permission rules from --allow / --deny flags.
    /// Not supported in leader mode (agent config is set at leader startup).
    pub permission_rules: Vec<nofy_workspace::permission::types::PermissionRule>,
    /// Seed agent sessions with always-approve (YOLO) permission mode.
    pub default_yolo_mode: bool,
    /// Seed agent sessions with auto (classifier) permission mode.
    /// Ignored when `default_yolo_mode` is true.
    pub default_auto_mode: bool,
}

/// Connect to an agent: spawn, initialize, authenticate.
pub async fn connect(cancel: &CancellationToken, flags: ConnectFlags) -> Result<AcpConnection> {
    startup::enter(StartupPhase::LoadConfig);
    let raw_config = nofy_shell::config::load_effective_config()
        .map_err(|e| anyhow::anyhow!("Failed to load config: {}", e))?;
    let mut agent_config = AgentConfig::new_from_toml_cfg(&raw_config)
        .map_err(|e| anyhow::anyhow!("Failed to create agent config: {}", e))?;

    agent_config.resolve_runtime_fields(&nofy_shell::agent::config::RuntimeResolutionContext {
        raw_config: &raw_config,
        is_headless: false,
        cli_subagents: Some(flags.subagents),
        cli_session_summary_model: None,
        cli_experimental_memory: flags.experimental_memory,
        cli_no_memory: flags.no_memory,
        todo_gate: flags.todo_gate,
        laziness_debug_log: flags.laziness_debug_log.as_deref(),
        storage_mode: flags.storage_mode.as_deref(),
    });

    // Permission mode seeds for every session this agent creates (CLI / config).
    agent_config.default_yolo_mode = flags.default_yolo_mode;
    agent_config.default_auto_mode = flags.default_auto_mode && !flags.default_yolo_mode;

    if let Some(effort) = flags.reasoning_effort_override {
        agent_config.reasoning_effort_override = Some(effort);
    }
    // Agent connect intentionally leaves hub URL unset; provider hub is
    // WorkspaceStartArgs only.

    if !flags.permission_rules.is_empty() {
        agent_config.cli_agent_overrides.permission_rules = flags.permission_rules.clone();
    }

    let memory_config = agent_config.memory_config.clone();
    let spawned = spawn::spawn_nofy_shell(agent_config, cancel, memory_config).await?;
    let auth_manager = spawned.auth_manager.clone();
    let (tx, rx) = (spawned.channel.tx, spawned.channel.rx);

    startup::enter(StartupPhase::AcpInitialize);
    let (
        models,
        is_nofy_shell,
        auth_methods,
        default_auth_method_id,
        available_commands,
        cancel_rewind_enabled,
        session_recap_available,
    ) = initialize(&tx, &flags).await?;

    startup::enter(StartupPhase::EagerAuth);
    let auth_meta = bounded_eager_auth(&tx, &auth_methods, default_auth_method_id.as_ref()).await;

    Ok(AcpConnection {
        tx,
        rx,
        models,
        is_nofy_shell,
        auth_methods,
        cancel: spawned.cancel,
        agent_thread: Some(spawned.thread_handle),
        available_commands,
        auth_meta,
        leader_status_rx: None,
        cancel_rewind_enabled,
        session_recap_available,
        auth_manager,
    })
}

/// Connect to a leader process and return an `AcpConnection`.
///
/// Leader mode was removed in the sanitized build (it depended on the
/// nofy.com relay and xAI account login); callers fall back to the embedded
/// in-process agent when this fails.
pub async fn connect_via_leader(
    cancel: &CancellationToken,
    flags: ConnectFlags,
    raw_config: &toml::Value,
) -> Result<AcpConnection> {
    let _ = (cancel, flags, raw_config);
    anyhow::bail!(
        "leader mode was removed in the sanitized build; \
         falling back to the embedded agent"
    )
}

/// Build the per-session `_meta` for `InitializeRequest` (TUI and leader).
fn build_initialize_meta(flags: &ConnectFlags) -> serde_json::Value {
    let client_type = flags
        .client_identifier
        .as_deref()
        .unwrap_or(PAGER_CLIENT_TYPE);
    let mut meta = serde_json::json!({
        "clientType": client_type,
        "clientVersion": PAGER_CLIENT_VERSION,
    });
    if let Some(spo) = &flags.system_prompt_override {
        meta["systemPromptOverride"] = serde_json::Value::String(spo.clone());
    }
    if let Some(rules) = &flags.rules {
        meta["rules"] = serde_json::Value::String(rules.clone());
    }
    meta
}

/// Build `client_capabilities.meta`. The hunk-tracker mode is canonicalized at
/// this connect read so the agent runs exactly what the settings modal displays.
fn client_capabilities_meta(flags: &ConnectFlags) -> serde_json::Value {
    let hunk_mode =
        crate::settings::canonical_hunk_tracker_mode(flags.hunk_tracker_mode.as_deref());
    serde_json::json!({
        "nofy/incrementalBashOutput": true,
        "nofy/hunkTracker": { "mode": hunk_mode },
        "nofy/bashOutputNoColor": true,
        "nofy/gitHeadChanged": true,
    })
}

/// Parse `defaultAuthMethodId` from `InitializeResponse.meta`.
///
/// The agent is the source of truth for preferred-method selection (including
/// `[auth] preferred_method`); clients must not re-derive api_key vs session.
pub fn parse_default_auth_method_id(meta: Option<&acp::Meta>) -> Option<acp::AuthMethodId> {
    meta.and_then(|m| m.get("defaultAuthMethodId"))
        .and_then(|v| v.as_str())
        .map(|s| acp::AuthMethodId::new(s.to_owned()))
}

/// Send InitializeRequest and parse the response.
async fn initialize(
    tx: &AcpAgentTx,
    flags: &ConnectFlags,
) -> Result<(
    ModelState,
    bool,
    Vec<acp::AuthMethod>,
    Option<acp::AuthMethodId>,
    Vec<acp::AvailableCommand>,
    bool,
    bool,
)> {
    let req = acp::InitializeRequest::new(acp::ProtocolVersion::V1)
        .client_capabilities(
            acp::ClientCapabilities::new()
                .fs(acp::FileSystemCapabilities::new()
                    .read_text_file(flags.fs_read)
                    .write_text_file(flags.fs_write))
                .terminal(flags.terminal)
                .meta(client_capabilities_meta(flags).as_object().cloned()),
        )
        .meta(build_initialize_meta(flags).as_object().cloned());

    let resp: acp::InitializeResponse = acp_send(req, tx).await?;

    // Check if this is a nofy-shell agent
    let is_nofy_shell = resp
        .meta
        .as_ref()
        .and_then(|m| m.get("nofyShell"))
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    // Parse model state from response meta
    let models: ModelState = resp
        .meta
        .as_ref()
        .and_then(|m| m.get("modelState"))
        .and_then(|v| serde_json::from_value::<acp::SessionModelState>(v.clone()).ok())
        .into();

    // Parse available commands from response meta (shell builtins + skills).
    // These seed the slash command registry so autocomplete works immediately.
    let available_commands = parse_available_commands(resp.meta.as_ref());

    let cancel_rewind_enabled = resp
        .meta
        .as_ref()
        .and_then(|m| m.get("cancelRewind"))
        .and_then(|v| v.as_bool())
        .unwrap_or(true);

    let session_recap_available = parse_session_recap_available(resp.meta.as_ref());
    let default_auth_method_id = parse_default_auth_method_id(resp.meta.as_ref());

    Ok((
        models,
        is_nofy_shell,
        resp.auth_methods,
        default_auth_method_id,
        available_commands,
        cancel_rewind_enabled,
        session_recap_available,
    ))
}

/// Parse `availableCommands` from an `InitializeResponse.meta` value.
///
/// Extracted as a standalone function for testability (the full `initialize()`
/// function requires an ACP connection).
pub fn parse_available_commands(meta: Option<&acp::Meta>) -> Vec<acp::AvailableCommand> {
    meta.and_then(|m| m.get("availableCommands"))
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default()
}

/// Parse `sessionRecap` from `InitializeResponse.meta` (shell rollout gate).
///
/// Default `false` when missing or non-bool so older agents and dark-launch
/// defaults produce zero automatic recap traffic.
pub fn parse_session_recap_available(meta: Option<&acp::Meta>) -> bool {
    meta.and_then(|m| m.get("sessionRecap"))
        .and_then(|v| v.as_bool())
        .unwrap_or(false)
}


/// Attempt eager (non-interactive) auth with an advertised method.
///
/// Errors from `authenticate` are caught so the connection still succeeds;
/// the pager then starts unauthenticated and guides the user to configure
/// an API key.
async fn eager_auth(
    tx: &AcpAgentTx,
    auth_methods: &[acp::AuthMethod],
    default_auth_method_id: Option<&acp::AuthMethodId>,
) -> Option<serde_json::Value> {
    if auth_methods.is_empty() {
        return None;
    }
    authenticate(tx, auth_methods, default_auth_method_id)
        .await
        .ok()
        .flatten()
}

/// [`eager_auth`] bounded by `STARTUP_AUTH_REFRESH_TIMEOUT`, so a hung agent
/// cannot gate the first draw. On timeout the pager starts unauthenticated.
async fn bounded_eager_auth(
    tx: &AcpAgentTx,
    auth_methods: &[acp::AuthMethod],
    default_auth_method_id: Option<&acp::AuthMethodId>,
) -> Option<serde_json::Value> {
    match tokio::time::timeout(
        nofy_shell::http::STARTUP_AUTH_REFRESH_TIMEOUT,
        eager_auth(tx, auth_methods, default_auth_method_id),
    )
    .await
    {
        Ok(meta) => meta,
        Err(_) => None,
    }
}

/// Authenticate with the agent using the agent's chosen default method.
///
/// Prefer `defaultAuthMethodId` from initialize meta when present and listed.
/// Do not re-derive api_key vs session ordering client-side (that has regressed
/// OIDC refresh before). Legacy fallback: `cached_token` then first method.
///
/// Returns the response `meta` (contains `team_name`, etc.) so callers can
/// propagate it to the UI.
async fn authenticate(
    tx: &AcpAgentTx,
    auth_methods: &[acp::AuthMethod],
    default_auth_method_id: Option<&acp::AuthMethodId>,
) -> Result<Option<serde_json::Value>> {
    let method_id = select_eager_auth_method(auth_methods, default_auth_method_id)
        .ok_or_else(|| anyhow::anyhow!("No auth methods available"))?;
    crate::unified_log::info(
        "pager eager auth method selected",
        None,
        Some(serde_json::json!({
            "method_id": method_id.0.as_ref(),
            "from_default_auth_method_id": default_auth_method_id
                .is_some_and(|d| d.0.as_ref() == method_id.0.as_ref()),
            "methods_count": auth_methods.len(),
            "first_method": auth_methods.first().map(|m| m.id().0.as_ref()),
        })),
    );

    let resp: acp::AuthenticateResponse =
        acp_send(acp::AuthenticateRequest::new(method_id), tx).await?;
    Ok(resp.meta.map(serde_json::Value::Object))
}

/// Pick the method id for eager authenticate.
///
/// 1. Agent's `defaultAuthMethodId` when present in the advertised list
/// 2. Legacy: `cached_token` if advertised, else first method
pub fn select_eager_auth_method(
    auth_methods: &[acp::AuthMethod],
    default_auth_method_id: Option<&acp::AuthMethodId>,
) -> Option<acp::AuthMethodId> {
    if let Some(default_id) = default_auth_method_id
        && auth_methods.iter().any(|m| m.id() == default_id)
    {
        return Some(default_id.clone());
    }
    let cached_token_method = auth_methods
        .iter()
        .find(|m| AuthMethodKind::from_id(m.id()) == AuthMethodKind::CachedToken);
    cached_token_method
        .or_else(|| auth_methods.first())
        .map(|m| m.id().clone())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_available_commands_from_meta() {
        let meta = serde_json::json!({
            "availableCommands": [
                {
                    "name": "compact",
                    "description": "Compact conversation history",
                    "input": { "hint": "<focus>" }
                },
                {
                    "name": "flush",
                    "description": "Flush memory"
                }
            ]
        });
        let cmds = parse_available_commands(meta.as_object());
        assert_eq!(cmds.len(), 2);
        assert_eq!(cmds[0].name, "compact");
        assert_eq!(cmds[0].description, "Compact conversation history");
        assert!(cmds[0].input.is_some());
        assert_eq!(cmds[1].name, "flush");
        assert!(cmds[1].input.is_none());
    }

    #[test]
    fn parse_available_commands_missing_key_returns_empty() {
        let meta = serde_json::json!({ "nofyShell": true });
        let cmds = parse_available_commands(meta.as_object());
        assert!(cmds.is_empty());
    }

    #[test]
    fn parse_available_commands_none_meta_returns_empty() {
        let cmds = parse_available_commands(None);
        assert!(cmds.is_empty());
    }

    #[test]
    fn parse_available_commands_invalid_json_returns_empty() {
        let meta = serde_json::json!({
            "availableCommands": "not-an-array"
        });
        let cmds = parse_available_commands(meta.as_object());
        assert!(cmds.is_empty());
    }

    #[test]
    fn parse_session_recap_available_true() {
        let meta = serde_json::json!({ "sessionRecap": true });
        assert!(parse_session_recap_available(meta.as_object()));
    }

    #[test]
    fn parse_session_recap_available_false_explicit() {
        let meta = serde_json::json!({ "sessionRecap": false });
        assert!(!parse_session_recap_available(meta.as_object()));
    }

    #[test]
    fn parse_session_recap_available_defaults_off_when_missing() {
        let meta = serde_json::json!({ "nofyShell": true, "cancelRewind": true });
        assert!(!parse_session_recap_available(meta.as_object()));
        assert!(!parse_session_recap_available(None));
    }

    #[test]
    fn parse_session_recap_available_non_bool_defaults_off() {
        let meta = serde_json::json!({ "sessionRecap": "yes" });
        assert!(!parse_session_recap_available(meta.as_object()));
    }


    #[test]
    fn build_initialize_meta_includes_rules_when_set() {
        let flags = ConnectFlags {
            rules: Some("Always reply in French.".into()),
            ..Default::default()
        };
        let meta = build_initialize_meta(&flags);
        assert_eq!(meta["rules"], "Always reply in French.");
    }

    #[test]
    fn build_initialize_meta_omits_rules_when_unset() {
        let flags = ConnectFlags::default();
        let meta = build_initialize_meta(&flags);
        assert!(
            meta.get("rules").is_none(),
            "rules key must be absent when --rules is not set; meta={meta:?}"
        );
    }

    #[test]
    fn build_initialize_meta_carries_system_prompt_override() {
        let flags = ConnectFlags {
            system_prompt_override: Some("YOU ARE A PIRATE.".into()),
            ..Default::default()
        };
        let meta = build_initialize_meta(&flags);
        assert_eq!(meta["systemPromptOverride"], "YOU ARE A PIRATE.");
    }

    #[test]
    fn build_initialize_meta_uses_custom_client_identifier_when_set() {
        let flags = ConnectFlags {
            client_identifier: Some("zed".into()),
            ..Default::default()
        };
        let meta = build_initialize_meta(&flags);
        assert_eq!(meta["clientType"], "zed");
    }

    #[test]
    fn client_capabilities_meta_defaults_absent_or_blank_mode_to_agent_only() {
        // Rows 1 & 2 of the truth table: nothing set, and a set-but-blank value,
        // both advertise the `agent_only` default (never `""` → AllDirty).
        let absent = client_capabilities_meta(&ConnectFlags::default());
        assert_eq!(absent["nofy/hunkTracker"]["mode"], "agent_only");
        let blank = client_capabilities_meta(&ConnectFlags {
            hunk_tracker_mode: Some("   ".into()),
            ..Default::default()
        });
        assert_eq!(blank["nofy/hunkTracker"]["mode"], "agent_only");
    }

    #[test]
    fn client_capabilities_meta_canonicalizes_off_and_mixed_case() {
        // Mixed-case / alias values are canonicalized so the agent runtime
        // matches the modal display.
        for raw in ["off", "OFF", "Disabled"] {
            let meta = client_capabilities_meta(&ConnectFlags {
                hunk_tracker_mode: Some(raw.into()),
                ..Default::default()
            });
            assert_eq!(meta["nofy/hunkTracker"]["mode"], "off", "raw={raw}");
        }
    }
}
