use std::sync::Arc;

use crate::auth::{AuthManager, NofyAuth, NofyComConfig};
use crate::util::nofy_home;

/// Non-interactive auth refresh: returns valid credentials if available without
/// ever triggering interactive login.
///
/// Tries in order:
/// 1. Cached credentials (non-expired)
/// 2. External auth provider command (if configured)
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
    // auth()'s external-provider refresh needs the refresher configured first.
    auth_manager.configure_refresher(nofy_com_config.auth_provider_command.clone(), None);
    auth_manager
}

/// Policy: cached-valid creds, else external-provider refresh (no interactive login).
async fn try_ensure_fresh_auth_with(auth_manager: &Arc<AuthManager>) -> Option<NofyAuth> {
    match auth_manager.auth().await {
        Ok(auth) => Some(auth),
        Err(e) => {
            tracing::debug!(error = %e, "try_ensure_fresh_auth: no valid credentials available");
            None
        }
    }
}

/// Readiness-path auth: a bounded refresh, but no cold mint (which can run a
/// provider command up to `STARTUP_AUTH_TIMEOUT`). Minting is deferred to the
/// post-readiness background task, so readiness waits at most
/// `STARTUP_AUTH_REFRESH_TIMEOUT`.
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
        Ok(auth) => auth,
        Err(_elapsed) => {
            tracing::warn!(
                timeout_secs = crate::http::STARTUP_AUTH_REFRESH_TIMEOUT.as_secs(),
                "boot auth refresh timed out; mint deferred to background"
            );
            None
        }
    }
}
