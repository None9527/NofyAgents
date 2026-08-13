use std::cell::RefCell;
use std::rc::Rc;
use std::sync::Arc;

use tokio::io::AsyncBufReadExt as _;
use tokio::sync::{mpsc, oneshot};

use crate::auth::config::LEGACY_AUTH_SCOPE;
use crate::auth::{AuthManager, NofyAuth, NofyComConfig, parse_output};
use crate::http::TransportFailureKind;
use crate::util::nofy_home;
use nofy_telemetry::events::{LoginFailed, LoginFailureKind};

pub(crate) type StderrCallback = Box<dyn Fn(&str)>;

/// `--oauth` forces the loopback-callback flow; `--device-auth` forces the
/// device flow. `None` falls through to env / config / default.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum LoginTransportOverride {
    /// No CLI override — resolve from env / config / default.
    #[default]
    None,
    /// `--oauth`: force the loopback-callback flow.
    ForceLoopback,
    /// `--device-auth`: force the RFC 8628 device flow.
    ForceDevice,
    /// Transport already resolved (and logged) upstream; the inner flow honors
    /// the carried value (`true` = device, `false` = loopback) without
    /// re-resolving, so it's never re-logged or mis-attributed to `cli`.
    Preresolved(bool),
}

impl LoginTransportOverride {
    /// Resolve from the `--oauth` / `--device-auth` flags. `--oauth` wins if
    /// both are somehow set. Single source of truth for both the CLI
    /// (`run_cli_login`) and ACP (`AuthRequestMeta`) entry points.
    pub fn from_flags(force_loopback: bool, force_device: bool) -> Self {
        if force_loopback {
            Self::ForceLoopback
        } else if force_device {
            Self::ForceDevice
        } else {
            Self::None
        }
    }

    /// Map to a `BoolFlag` CLI value (`Some(true)` = device, `Some(false)` =
    /// loopback, `None` = no override).
    fn as_cli_bool(self) -> Option<bool> {
        match self {
            Self::None => None,
            Self::ForceLoopback => Some(false),
            Self::ForceDevice => Some(true),
            // Not a CLI decision — must never be reported as the `cli` tier.
            Self::Preresolved(_) => None,
        }
    }
}

/// How login presents itself; surfaced to the TUI via `nofy/auth/get_url`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AuthUrlMode {
    /// Loopback-callback flow — TUI shows a copyable URL + paste box.
    Loopback,
    /// External auth provider opened its own browser — TUI shows a waiting status.
    Command,
    /// RFC 8628 device flow — TUI shows the device code + copyable URL, no paste box.
    Device,
}

impl AuthUrlMode {
    /// Wire string for the `nofy/auth/get_url` ACP response.
    pub fn as_wire_str(self) -> &'static str {
        match self {
            Self::Loopback => "loopback",
            Self::Command => "command",
            Self::Device => "device",
        }
    }

    /// Back-compat flag for older clients that only read `external_provider`.
    pub(crate) fn is_external_provider(self) -> bool {
        matches!(self, Self::Command)
    }
}

/// Auth URL pushed from the auth flow to the TUI.
pub struct AuthUrlInfo {
    pub url: String,
    pub mode: AuthUrlMode,
}

/// Non-interactive auth refresh: returns valid credentials if available without
/// ever triggering interactive login (browser, device code, etc.).
///
/// Tries in order:
/// 1. Cached credentials (non-expired)
/// 2. OIDC silent refresh (if expired token has a refresh_token)
/// 3. External auth provider command (if configured)
///
/// Returns `None` when no valid credentials can be obtained non-interactively.
pub async fn try_ensure_fresh_auth(nofy_com_config: &NofyComConfig) -> Option<NofyAuth> {
    try_ensure_fresh_auth_with(&build_startup_auth_manager(nofy_com_config)).await
}

/// Builds and configures the startup `AuthManager`; the policy helpers below
/// take it injected so tests can substitute their own.
fn build_startup_auth_manager(nofy_com_config: &NofyComConfig) -> Arc<AuthManager> {
    let auth_manager = Arc::new(AuthManager::new(
        &nofy_home::nofy_home(),
        nofy_com_config.clone(),
    ));
    // auth()'s OIDC/external refresh needs the refresher configured first.
    auth_manager.configure_refresher(nofy_com_config.auth_provider_command.clone(), None);
    auth_manager
}

/// Policy: cached-valid creds, else silent refresh (no interactive login).
async fn try_ensure_fresh_auth_with(auth_manager: &Arc<AuthManager>) -> Option<NofyAuth> {
    match auth_manager.auth().await {
        Ok(auth) => Some(auth),
        Err(e) => {
            tracing::debug!(error = %e, "try_ensure_fresh_auth: no valid credentials available");
            None
        }
    }
}

/// Readiness-path auth: a bounded refresh plus the expired-but-refreshable
/// cached session, but no cold mint (which can run a provider command up to
/// `STARTUP_AUTH_TIMEOUT`). Minting is deferred to the post-readiness
/// background task, so readiness waits at most `STARTUP_AUTH_REFRESH_TIMEOUT`.
pub(crate) async fn try_noninteractive_auth_no_mint(
    nofy_com_config: &NofyComConfig,
) -> Option<NofyAuth> {
    try_noninteractive_auth_no_mint_with(&build_startup_auth_manager(nofy_com_config)).await
}

/// Policy behind [`try_noninteractive_auth_no_mint`], with the `AuthManager`
/// injected for tests.
async fn try_noninteractive_auth_no_mint_with(auth_manager: &Arc<AuthManager>) -> Option<NofyAuth> {
    match tokio::time::timeout(
        crate::http::STARTUP_AUTH_REFRESH_TIMEOUT,
        try_ensure_fresh_auth_with(auth_manager),
    )
    .await
    {
        Ok(Some(auth)) => return Some(auth),
        Ok(None) => {}
        Err(_elapsed) => {
            tracing::warn!(
                timeout_secs = crate::http::STARTUP_AUTH_REFRESH_TIMEOUT.as_secs(),
                "boot auth refresh timed out; using cached/expired session (mint deferred to background)"
            );
        }
    }
    // Expired-but-refreshable cached session self-heals on the first 401; no
    // cold mint on the readiness path.
    expired_refreshable_session(auth_manager)
}

/// A cached, refreshable session (not BYOK/ApiKey). Reached only after fresh
/// auth failed, so in practice the token is expired but recoverable on 401.
fn expired_refreshable_session(auth_manager: &AuthManager) -> Option<NofyAuth> {
    auth_manager
        .current_or_expired()
        .filter(|a| a.is_xai_auth() && a.refresh_token.is_some())
}

/// Print the CLI "signed in" confirmation, clearing the spinner line first.
fn report_signed_in(auth: &NofyAuth) {
    eprint!("\r\x1b[K");
    match auth.email {
        Some(ref email) => eprintln!("✓ Signed in as {email}"),
        None => eprintln!("✓ Signed in"),
    }
}

/// CLI auth entrypoint. For GUI, use `run_auth_flow_with_stderr_bridge`.
pub async fn ensure_authenticated(
    nofy_com_config: &NofyComConfig,
    reauth: bool,
    message_prefix: Option<&str>,
) -> anyhow::Result<NofyAuth> {
    ensure_authenticated_with_override(
        nofy_com_config,
        reauth,
        message_prefix,
        LoginTransportOverride::None,
    )
    .await
}

/// Like [`ensure_authenticated`] but with an explicit login-transport override
/// (from `--oauth` / `--device-auth`). Used by `run_cli_login`.
pub async fn ensure_authenticated_with_override(
    nofy_com_config: &NofyComConfig,
    reauth: bool,
    message_prefix: Option<&str>,
    login_override: LoginTransportOverride,
) -> anyhow::Result<NofyAuth> {
    let _ = login_override;
    let nofy_home = nofy_home::nofy_home();
    let auth_manager = Arc::new(AuthManager::new(&nofy_home, nofy_com_config.clone()));

    // A cached non-WebLogin credential still satisfies the gate.
    if !reauth && let Some(auth) = auth_manager.current() {
        if auth.auth_mode != super::AuthMode::WebLogin {
            return Ok(auth);
        }
    }

    if let Some(msg) = message_prefix {
        eprintln!("{msg}");
    }

    // Interactive xAI account login was removed in the sanitized build.
    anyhow::bail!(
        "No usable credentials. Interactive login was removed; set NOFY_API_KEY \
         or add api_key/env_key to your config."
    )
}

/// Decides *whether to prompt* for an interactive login (the wire credential is
/// chosen separately by `ShellAuthCredentialProvider`).
///
/// With `has_noninteractive_auth`, only refresh a cached token best-effort (no
/// browser, no cold mint); otherwise require an interactive login.
pub async fn ensure_authenticated_or_noninteractive(
    nofy_com_config: &NofyComConfig,
    has_noninteractive_auth: bool,
    message_prefix: Option<&str>,
) -> anyhow::Result<Option<NofyAuth>> {
    if has_noninteractive_auth {
        Ok(try_ensure_fresh_auth(nofy_com_config).await)
    } else {
        ensure_authenticated(nofy_com_config, false, message_prefix)
            .await
            .map(Some)
    }
}

/// Unified `nofy login` handler for CLI entry points (tui, pager).
///
/// Precedence: `--oauth` forces loopback, `--device-auth` forces device,
/// otherwise `NOFY_LOGIN_DEVICE_FLOW` env / `[auth] login_device_flow` config /
/// loopback default. Both transports run through `run_auth_flow_inner` so the
/// external auth provider and devbox auto-migration are tried first.
pub async fn run_cli_login(
    config: &crate::agent::config::Config,
    oauth: bool,
    device_auth: bool,
    devbox: bool,
) -> anyhow::Result<()> {
    let _ = (config, oauth, device_auth, devbox);
    anyhow::bail!(
        "`login` was removed with the xAI account system. Set NOFY_API_KEY or add \
         api_key/env_key to your config; authentication is API-key based."
    )
}

/// Returns as soon as the post lands (~1.7s cold), so the bound only bites on a
/// black-holed network — where waiting out the HTTP client timeout would be worse.
/// Result of a logout operation. Used by both the CLI subcommand and
/// the ACP `/logout` slash command so the presentation layer can format
/// the outcome without duplicating the auth logic.
pub struct LogoutResult {
    /// `true` if a cached OAuth session was found and cleared.
    pub was_logged_in: bool,
    /// Email of the session that was cleared (if available).
    pub email: Option<String>,
    /// `true` if `NOFY_API_KEY` / `NOFY_API_KEY` env var is set.
    pub api_key_still_set: bool,
}

/// Core logout logic shared by the CLI subcommand and the ACP handler.
///
/// When `scope` is `None`, clears the default scope (same as `/logout`
/// in the TUI). When `Some`, removes only that scope entry.
pub fn perform_logout(
    auth_manager: &AuthManager,
    scope: Option<&str>,
) -> std::io::Result<LogoutResult> {
    let auth = auth_manager.current_or_expired();
    let email = auth.as_ref().and_then(|a| a.email.clone());
    let was_logged_in = auth.is_some();
    // Intentional credential removal must be attributable in
    // unified.jsonl, so a later "auth.json entry gone" can be
    // distinguished from accidental loss (deleted/corrupt file).
    nofy_telemetry::unified_log::info(
        "auth: logout",
        None,
        Some(serde_json::json!({
            "was_logged_in": was_logged_in,
            "scope": scope.unwrap_or("(current)"),
            "user_id": auth.as_ref().map(|a| a.user_id.clone()),
        })),
    );
    if was_logged_in {
        // Order matters for the no-leak guarantee (flush-on-logout
        // parity). Clear the external OTEL identity attrs FIRST so any
        // record emitted from here on cannot carry the prior user's ids; THEN
        // flush already-queued records (which were built with their ids during
        // the active session — that is correct); THEN clear credentials.
        // Clearing identity before the flush closes the window in which a
        // concurrent emission between flush and identity-reset would still
        // stamp the prior user's ids onto a customer-collector record.
        nofy_telemetry::external::set_identity(
            nofy_telemetry::external::IdentityAttrs::default(),
        );
        nofy_telemetry::external::flush();
        if let Some(scope) = scope {
            auth_manager.remove_scope(scope)?;
        } else {
            auth_manager.clear()?;
        }
        // Clear the synced files if no principal remains to own them. A scoped
        // logout that leaves a team (or a deployment key) signed in keeps them.
        crate::managed_config::clear_orphan();
    }
    Ok(LogoutResult {
        was_logged_in,
        email,
        api_key_still_set: crate::agent::auth_method::has_xai_api_key_env(),
    })
}

/// `nofy logout` CLI handler. Calls [`perform_logout`] and formats
/// the result to stderr.
pub fn run_cli_logout(config: &crate::agent::config::Config) -> anyhow::Result<()> {
    let nofy_home = nofy_home::nofy_home();
    let auth_manager = AuthManager::new(&nofy_home, config.nofy_com_config.clone());
    let result = perform_logout(&auth_manager, None)
        .map_err(|e| anyhow::anyhow!("Failed to clear auth: {e}"))?;
    if !result.was_logged_in {
        eprintln!("No cached session to log out of.");
        if result.api_key_still_set {
            eprintln!("You are authenticated via NOFY_API_KEY (environment variable).");
        }
        return Ok(());
    }
    if let Some(email) = result.email {
        eprintln!("Logged out (was signed in as {email})");
    } else {
        eprintln!("Logged out");
    }
    if result.api_key_still_set {
        eprintln!("NOFY_API_KEY is still set and will be used for authentication.");
    }
    Ok(())
}
