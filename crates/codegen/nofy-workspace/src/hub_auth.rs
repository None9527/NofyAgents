//! Hub [`AuthProvider`] from `~/.nofy/auth.json` for the standalone
//! `workspace_server` binary: a plain bearer sourced from the stored
//! credential (API key or external auth-provider token).
//!
//! The in-leader `nofy workspace` exposure does NOT use this path — it sources
//! an in-memory provider from the leader's `AuthManager` (see
//! `LeaderAuthProvider`) to avoid racing the leader's own auth.json writer.

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;

use nofy_computer_hub_sdk::{AuthCredential, AuthIdentity, AuthProvider};
use url::Url;

/// Plain bearer provider that also carries the owner identity parsed from the
/// same auth.json entry, so the workspace can derive `WorkspaceIdentity` from
/// the auth provider — without a second auth.json read.
struct BearerWithIdentity {
    token: String,
    identity: AuthIdentity,
}

impl std::fmt::Debug for BearerWithIdentity {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        // Never log the bearer token; surface only the (non-secret) identity.
        f.debug_struct("BearerWithIdentity")
            .field("identity", &self.identity)
            .finish_non_exhaustive()
    }
}

impl AuthProvider for BearerWithIdentity {
    fn current(&self) -> AuthCredential {
        AuthCredential::bearer(self.token.clone())
    }

    fn identity(&self) -> Option<AuthIdentity> {
        Some(self.identity.clone())
    }
}

/// Owner identity parsed from an auth.json entry, for the [`AuthProvider`]s
/// built here to surface via [`AuthProvider::identity`].
fn identity_from_entry(entry: &AuthEntry) -> AuthIdentity {
    AuthIdentity {
        user_id: entry.user_id.clone(),
        principal_type: entry.principal_type.clone(),
        principal_id: entry.principal_id.clone(),
    }
}

#[derive(Debug, serde::Deserialize)]
struct AuthEntry {
    key: String,
    #[serde(default)]
    user_id: String,
    #[serde(default)]
    refresh_token: Option<String>,
    #[serde(default)]
    oidc_issuer: Option<String>,
    #[serde(default)]
    oidc_client_id: Option<String>,
    #[serde(default)]
    principal_type: Option<String>,
    #[serde(default)]
    principal_id: Option<String>,
    #[serde(default)]
    expires_at: Option<chrono::DateTime<chrono::Utc>>,
}

pub fn default_auth_path() -> anyhow::Result<PathBuf> {
    let nofy = nofy_config::user_nofy_home()
        .ok_or_else(|| anyhow::anyhow!("no user nofy home (set $NOFY_HOME or $HOME)"))?;
    Ok(nofy.join("auth.json"))
}

/// Read the active credential entry and its scope key.
///
/// When several entries qualify, pick the **latest `expires_at`** — the
/// entry the shell is actively refreshing. Entries without an expiry (plain
/// API keys) sort last.
fn read_auth_entry(path: &Path) -> anyhow::Result<(String, AuthEntry)> {
    if !path.exists() {
        anyhow::bail!(
            "No auth credentials found at {}. Set NOFY_API_KEY or configure an auth provider.",
            path.display()
        );
    }

    let content = std::fs::read_to_string(path)
        .map_err(|e| anyhow::anyhow!("failed to read {}: {e}", path.display()))?;
    let entries: BTreeMap<String, AuthEntry> = serde_json::from_str(&content)
        .map_err(|e| anyhow::anyhow!("failed to parse {}: {e}", path.display()))?;

    entries
        .into_iter()
        // Strictly-greater comparison: ties (including all-`None`) keep the
        // first candidate in BTreeMap (alphabetical) order, so single-entry
        // and no-`expires_at` files behave exactly as before.
        .fold(None::<(String, AuthEntry)>, |best, cand| match best {
            Some(b) if cand.1.expires_at <= b.1.expires_at => Some(b),
            _ => Some(cand),
        })
        .ok_or_else(|| {
            anyhow::anyhow!(
                "no auth entry found in {}. Set NOFY_API_KEY or configure an auth provider.",
                path.display()
            )
        })
}

/// Build a hub auth provider for `hub_url`. `auth_config` overrides
/// the default credential path (`~/.nofy/auth.json`).
pub fn provider(
    hub_url: &Url,
    auth_config: Option<&Path>,
) -> anyhow::Result<Arc<dyn AuthProvider>> {
    let _ = hub_url;
    let auth_path = match auth_config {
        Some(p) => p.to_path_buf(),
        None => default_auth_path()?,
    };
    let (_scope_key, entry) = read_auth_entry(&auth_path)?;
    Ok(Arc::new(BearerWithIdentity {
        identity: identity_from_entry(&entry),
        token: entry.key.clone(),
    }))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    fn write_auth_json(dir: &std::path::Path, json: &str) -> PathBuf {
        let path = dir.join("auth.json");
        let mut f = std::fs::File::create(&path).unwrap();
        f.write_all(json.as_bytes()).unwrap();
        path
    }

    #[test]
    fn read_auth_entry_missing_file() {
        let path = PathBuf::from("/nonexistent/auth.json");
        let err = read_auth_entry(&path).unwrap_err();
        assert!(err.to_string().contains("No auth credentials"));
    }

    #[test]
    fn read_auth_entry_tolerates_extra_fields() {
        let dir = tempfile::tempdir().unwrap();
        let path = write_auth_json(
            dir.path(),
            r#"{
            "scope": {
                "key": "tok-1",
                "user_id": "u1",
                "auth_mode": "external",
                "create_time": "2026-01-01T00:00:00Z",
                "email": "test@example.com",
                "first_name": "Test",
                "some_future_field": true
            }
        }"#,
        );

        let (_key, entry) = read_auth_entry(&path).unwrap();
        assert_eq!(entry.key, "tok-1");
    }

    /// With several entries, the one with the latest `expires_at` wins —
    /// that's the entry the user's sessions actively refresh. Entries without
    /// an expiry (plain API keys) sort last.
    #[test]
    fn read_auth_entry_prefers_latest_expiry() {
        let dir = tempfile::tempdir().unwrap();
        let path = write_auth_json(
            dir.path(),
            r#"{
            "aaa-stale": { "key": "tok.a", "expires_at": "2026-01-01T00:00:00Z" },
            "zzz-active": { "key": "tok.z", "expires_at": "2026-06-01T00:00:00Z" }
        }"#,
        );

        let (key, entry) = read_auth_entry(&path).unwrap();
        assert_eq!(key, "zzz-active", "latest expires_at must win");
        assert_eq!(entry.key, "tok.z");

        // An entry with no expires_at never beats one with a timestamp.
        let path = write_auth_json(
            dir.path(),
            r#"{
            "aaa-with-expiry": { "key": "tok.a", "expires_at": "2026-01-01T00:00:00Z" },
            "zzz-no-expiry": { "key": "tok.z" }
        }"#,
        );
        let (key, _) = read_auth_entry(&path).unwrap();
        assert_eq!(key, "aaa-with-expiry");
    }

    #[test]
    fn provider_uses_bearer() {
        let dir = tempfile::tempdir().unwrap();
        let path = write_auth_json(
            dir.path(),
            r#"{ "nofy::session": { "key": "tok-1", "user_id": "u1" } }"#,
        );
        let url = Url::parse("ws://localhost:9988/v1/tools").unwrap();
        let auth = provider(&url, Some(&path)).unwrap();
        match auth.current() {
            AuthCredential::Bearer { token } => assert_eq!(token, "tok-1"),
            _ => panic!("expected Bearer"),
        }
        // Identity is surfaced from the same entry.
        let id = auth.identity().expect("identity present");
        assert_eq!(id.user_id, "u1");
    }
}
