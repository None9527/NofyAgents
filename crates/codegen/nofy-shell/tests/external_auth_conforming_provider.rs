//! The external-auth contract under the sanitized fork, end to end.
//!
//! The fork removed interactive login from `ensure_authenticated`
//! (`auth/flow.rs`: "Interactive xAI account login was removed in the
//! sanitized build" — it unconditionally `bail!`s once no cached credential
//! satisfies the gate). This test pins that fail-closed contract for a
//! conforming external provider (`README.md` /
//! `docs/user-guide/02-authentication.md` skeleton):
//!
//! 1. The headless boot probe (`NOFY_AUTH_EXPIRED=1`) still reaches the
//!    provider through the silent-refresh path, and the provider's decline
//!    still yields "no credentials" (`try_ensure_fresh_auth` → `None`).
//! 2. `ensure_authenticated` then fails closed: it returns the
//!    "Interactive login was removed" error fast, never walks the provider's
//!    interactive mint branch (no `expired=unset` invocation, the SSO token
//!    is never produced), and never reaches a browser login (bounded by
//!    `LOGIN_BUDGET` — a regression that reintroduces browser login hangs
//!    past the budget instead of failing silently).

#![cfg(unix)]

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::time::{Duration, Instant};

use chrono::Utc;
use nofy_shell::auth::{
    AuthMode, NofyAuth, NofyComConfig, ensure_authenticated, try_ensure_fresh_auth,
};

const STALE_TOKEN: &str = "stale-token-the-provider-will-not-renew";
const SSO_TOKEN: &str = "token-minted-by-the-interactive-flow";

/// A regression here reaches the browser login, which hangs rather than fails.
const LOGIN_BUDGET: Duration = Duration::from_secs(60);

/// Fail-closed must be fast: there is no provider prompt and no network login
/// to wait on. Loose enough for a loaded CI runner; tight enough to catch any
/// path that blocks on an interactive flow.
const FAIL_CLOSED_BUDGET: Duration = Duration::from_secs(20);

/// The skeleton published in `README.md` and `docs/user-guide/02-authentication.md`,
/// which operators copy.
fn write_conforming_provider(home: &Path) -> String {
    use std::os::unix::fs::PermissionsExt;

    let log = invocation_log(home);
    let script = home.join("acme-auth.sh");
    std::fs::write(
        &script,
        format!(
            "#!/bin/sh\n\
             echo \"expired=${{NOFY_AUTH_EXPIRED:-unset}}\" >> {log}\n\
             if [ \"$NOFY_AUTH_EXPIRED\" = \"1\" ]; then\n\
             \x20   echo 'SSO session lapsed; cannot mint without the user' >&2\n\
             \x20   exit 1\n\
             fi\n\
             echo 'Authenticating via Acme Corp SSO...' >&2\n\
             printf '%s' {SSO_TOKEN}\n",
            log = log.display(),
        ),
    )
    .expect("write provider script");
    std::fs::set_permissions(&script, std::fs::Permissions::from_mode(0o755))
        .expect("chmod provider script");
    script.display().to_string()
}

fn invocation_log(home: &Path) -> PathBuf {
    home.join("provider-invocations")
}

fn invocations(home: &Path) -> Vec<String> {
    std::fs::read_to_string(invocation_log(home))
        .map(|s| s.lines().map(str::to_owned).collect())
        .unwrap_or_default()
}

fn seed_expired_credential(home: &Path, scope: &str) {
    let expired = NofyAuth {
        key: STALE_TOKEN.to_owned(),
        auth_mode: AuthMode::External,
        expires_at: Some(Utc::now() - chrono::Duration::hours(1)),
        ..NofyAuth::default()
    };
    let store: BTreeMap<String, NofyAuth> = [(scope.to_owned(), expired)].into_iter().collect();
    std::fs::write(
        home.join("auth.json"),
        serde_json::to_string(&store).expect("serialize auth store"),
    )
    .expect("write auth.json");
}

fn dead_endpoint() -> String {
    let listener = std::net::TcpListener::bind("127.0.0.1:0").expect("bind");
    let port = listener.local_addr().expect("addr").port();
    drop(listener);
    format!("http://127.0.0.1:{port}")
}

#[tokio::test]
async fn expired_credentials_fail_closed_without_interactive_login() {
    let home = tempfile::tempdir().expect("nofy home");
    let provider = write_conforming_provider(home.path());
    let dead = dead_endpoint();

    // SAFETY: single-threaded test entry, before any thread that reads the
    // environment is spawned. `nofy_home()` memoizes, so this must stay the
    // only test in the binary.
    unsafe {
        std::env::set_var("NOFY_HOME", home.path());
        std::env::set_var("NOFY_CLI_CHAT_PROXY_BASE_URL", &dead);
        std::env::set_var("NOFY_API_BASE_URL", &dead);
        std::env::remove_var("NOFY_API_KEY");
        std::env::remove_var("NOFY_API_KEY");
        std::env::set_var("NOFY_TELEMETRY_ENABLED", "false");
        std::env::set_var("NOFY_FEEDBACK_ENABLED", "false");
        std::env::set_var("NOFY_TRACE_UPLOAD", "false");
    }

    let config = NofyComConfig {
        auth_provider_command: Some(provider),
        ..NofyComConfig::default()
    };
    seed_expired_credential(home.path(), &config.auth_scope());

    // Headless boot probe: still reaches the provider with NOFY_AUTH_EXPIRED=1,
    // and the provider's decline still means "no credentials".
    assert!(
        try_ensure_fresh_auth(&config).await.is_none(),
        "the provider declines a run it cannot complete silently"
    );
    assert_eq!(
        invocations(home.path()),
        ["expired=1"],
        "the headless refresh is the run the flag exists for"
    );

    // Fail-closed: the fork removed interactive login, so an expired session
    // must error out instead of minting through the provider or a browser.
    let started = Instant::now();
    let error = tokio::time::timeout(LOGIN_BUDGET, ensure_authenticated(&config, false, None))
        .await
        .expect("fail-closed must not reach a browser login (hangs past the budget)")
        .expect_err("expired credentials must fail closed; interactive login was removed");
    let elapsed = started.elapsed();

    let message = error.to_string();
    assert!(
        message.contains("Interactive login was removed"),
        "the fail-closed error must name the removed interactive login: {message}"
    );
    assert!(
        message.contains("NOFY_API_KEY"),
        "the fail-closed error must point at the API-key replacement: {message}"
    );
    assert_eq!(
        invocations(home.path()),
        ["expired=1"],
        "the provider's interactive mint branch must never run (no SSO token minted)"
    );
    assert!(
        elapsed < FAIL_CLOSED_BUDGET,
        "fail-closed must not wait on a prompt or network login; took {elapsed:?}"
    );
}
