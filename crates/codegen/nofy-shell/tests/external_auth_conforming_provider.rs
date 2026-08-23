//! The external-auth contract under the sanitized fork, end to end.
//!
//! Interactive login does not exist in this build: `try_ensure_fresh_auth`
//! is the only entry point, and it only ever runs the provider's silent
//! refresh (`NOFY_AUTH_EXPIRED=1`). This test pins that contract for a
//! conforming external provider (`README.md` /
//! `docs/user-guide/02-authentication.md` skeleton):
//!
//! The headless boot probe (`NOFY_AUTH_EXPIRED=1`) reaches the provider
//! through the silent-refresh path, and the provider's decline yields
//! "no credentials" (`try_ensure_fresh_auth` → `None`) without ever running
//! the provider's interactive mint branch.

#![cfg(unix)]

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

use chrono::Utc;
use nofy_shell::auth::{AuthMode, NofyAuth, NofyComConfig, try_ensure_fresh_auth};

const STALE_TOKEN: &str = "stale-token-the-provider-will-not-renew";
const SSO_TOKEN: &str = "token-minted-by-the-interactive-flow";

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
async fn expired_credentials_fail_closed_without_interactive_mint() {
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
        std::env::set_var("NOFY_TELEMETRY_ENABLED", "false");
        std::env::set_var("NOFY_FEEDBACK_ENABLED", "false");
        std::env::set_var("NOFY_TRACE_UPLOAD", "false");
    }

    let config = NofyComConfig {
        auth_provider_command: Some(provider),
        ..NofyComConfig::default()
    };
    seed_expired_credential(home.path(), &config.auth_scope());

    // Headless boot probe: reaches the provider with NOFY_AUTH_EXPIRED=1,
    // and the provider's decline means "no credentials".
    assert!(
        try_ensure_fresh_auth(&config).await.is_none(),
        "the provider declines a run it cannot complete silently"
    );
    assert_eq!(
        invocations(home.path()),
        ["expired=1"],
        "only the silent-refresh probe may run; the interactive mint branch \
         must never be invoked (no SSO token minted)"
    );
}
