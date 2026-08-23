use chrono::{DateTime, Duration, Utc};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use nofy_auth::bearer_suffix;

pub(crate) const TOKEN_TTL: Duration = Duration::days(30);
const DEFAULT_EARLY_INVALIDATION_SECS: u64 = 300; // 5 minutes

/// auth.json scope key for plain API key auth (BYOK env/config keys).
pub(super) const API_KEY_SCOPE: &str = "nofy::api_key";

const BLOCKED_REASON_NO_LOGS: &str = "BLOCKED_REASON_NO_LOGS";
const BLOCKED_REASON_NO_LOGS_MODERATED: &str = "BLOCKED_REASON_NO_LOGS_MODERATED";

/// Fresh-credential / missing-field default: opted out until the user or
/// server enrichment opts in. Single source for `NofyAuth`, `AuthMeta`, and
/// every login-path constructor so the sides cannot drift.
pub(crate) fn default_coding_data_retention_opt_out() -> bool {
    true
}

/// Token provenance.
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum AuthMode {
    /// External auth provider binary (`auth_provider_command`).
    External,
    /// Plain API key (BYOK env/config key).
    ApiKey,
}

/// Wire value of `principal_type` for team OAuth principals (capitalized by
/// the auth service). Single source for every comparison site.
pub(crate) const TEAM_PRINCIPAL_TYPE: &str = "Team";

#[derive(Clone, Serialize, Deserialize)]
pub struct NofyAuth {
    pub key: String,
    pub auth_mode: AuthMode,
    pub create_time: DateTime<Utc>,
    pub user_id: String,
    pub email: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub first_name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub last_name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub profile_image_asset_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub principal_type: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub principal_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub team_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub team_name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub team_role: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub organization_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub organization_name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub organization_role: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub user_blocked_reason: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub team_blocked_reasons: Vec<String>,
    /// Defaults to `true` (opted out) for safer consumer privacy until the
    /// user explicitly shares or server enrichment sets the team preference.
    #[serde(default = "default_coding_data_retention_opt_out")]
    pub coding_data_retention_opt_out: bool,

    /// Deprecated. Kept for deserializing existing auth.json files.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub has_nofy_code_access: Option<bool>,

    /// Refresh token (OIDC/OAuth2 or external provider).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub refresh_token: Option<String>,

    /// Server-provided expiration (from OIDC `expires_in`).
    /// When present, takes precedence over the hardcoded `TOKEN_TTL`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub expires_at: Option<DateTime<Utc>>,

    /// Issuer URL reported by the external auth provider, if any.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub oidc_issuer: Option<String>,

    /// Client id reported by the external auth provider, if any.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub oidc_client_id: Option<String>,
}

impl std::fmt::Debug for NofyAuth {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("NofyAuth")
            .field("key", &bearer_suffix(&self.key))
            .field("auth_mode", &self.auth_mode)
            .field("user_id", &self.user_id)
            .field("expires_at", &self.expires_at)
            .field(
                "refresh_token",
                &self.refresh_token.as_deref().map(bearer_suffix),
            )
            .finish_non_exhaustive()
    }
}

impl NofyAuth {
    /// Seconds since this credential was minted. Negative when the local
    /// clock stepped back past `create_time` (NTP correction, VM restore, or
    /// a sibling machine's clock via an adopted auth.json) — `create_time`
    /// is always stamped from the minting machine's local clock.
    pub(crate) fn mint_age_seconds(&self) -> i64 {
        Utc::now()
            .signed_duration_since(self.create_time)
            .num_seconds()
    }

    pub fn is_team_principal(&self) -> bool {
        self.principal_type.as_deref() == Some(TEAM_PRINCIPAL_TYPE) && self.team_id.is_some()
    }

    /// `true` when the team has Zero Data Retention (ZDR) enabled.
    pub fn is_zdr_team(&self) -> bool {
        self.team_blocked_reasons
            .iter()
            .any(|r| r == BLOCKED_REASON_NO_LOGS || r == BLOCKED_REASON_NO_LOGS_MODERATED)
    }

    /// `true` when the team has ZDR or the user opted out of coding data
    /// retention. Use this for trace-upload and research-data gates.
    /// Product analytics (`telemetry_enabled`) and user-facing sync
    /// features should use `is_zdr_team()` directly.
    pub(crate) fn is_data_collection_disabled(&self) -> bool {
        self.is_zdr_team() || self.coding_data_retention_opt_out
    }

    /// Carry `/user`-derived fields from a previous auth so refresh rebuilds don't drop them.
    pub(crate) fn carry_user_profile_from(&mut self, prev: &NofyAuth) {
        self.user_id = prev.user_id.clone();
        self.email = prev.email.clone();
        self.principal_type = prev.principal_type.clone();
        self.principal_id = prev.principal_id.clone();
        self.team_id = prev.team_id.clone();
        self.team_name = prev.team_name.clone();
        self.team_role = prev.team_role.clone();
        self.organization_id = prev.organization_id.clone();
        self.organization_name = prev.organization_name.clone();
        self.organization_role = prev.organization_role.clone();
        self.user_blocked_reason = prev.user_blocked_reason.clone();
        self.team_blocked_reasons = prev.team_blocked_reasons.clone();
        self.coding_data_retention_opt_out = prev.coding_data_retention_opt_out;
    }
}

impl Default for NofyAuth {
    fn default() -> Self {
        Self {
            key: String::new(),
            auth_mode: AuthMode::External,
            create_time: Utc::now(),
            user_id: String::new(),
            email: None,
            first_name: None,
            last_name: None,
            profile_image_asset_id: None,
            principal_type: None,
            principal_id: None,
            team_id: None,
            team_name: None,
            team_role: None,
            organization_id: None,
            organization_name: None,
            organization_role: None,
            user_blocked_reason: None,
            team_blocked_reasons: vec![],
            coding_data_retention_opt_out: default_coding_data_retention_opt_out(),
            has_nofy_code_access: None,
            refresh_token: None,
            expires_at: None,
            oidc_issuer: None,
            oidc_client_id: None,
        }
    }
}

#[cfg(test)]
impl NofyAuth {
    /// Returns a `NofyAuth` with sensible defaults for tests. Override fields
    /// with struct update syntax:
    /// ```ignore
    /// NofyAuth { key: "my-key".into(), ..NofyAuth::test_default() }
    /// ```
    pub(crate) fn test_default() -> Self {
        Self {
            key: "test-key".into(),
            user_id: "test-user".into(),
            // Tests that exercise collection gates need sharing enabled by
            // default; opt out explicitly when asserting the privacy path.
            coding_data_retention_opt_out: false,
            ..Default::default()
        }
    }
}

pub(crate) type AuthStore = BTreeMap<String, NofyAuth>;

/// User information from the cli-chat-proxy `GET /v1/user` endpoint.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct UserInfo {
    pub(crate) user_id: String,
    #[serde(default)]
    pub(super) email: Option<String>,
    #[serde(default)]
    pub(super) first_name: Option<String>,
    #[serde(default)]
    pub(super) last_name: Option<String>,
    #[serde(default)]
    pub(super) profile_image_asset_id: Option<String>,
    #[serde(default)]
    pub(super) principal_type: Option<String>,
    #[serde(default)]
    pub(super) principal_id: Option<String>,
    #[serde(default)]
    pub(super) team_id: Option<String>,
    #[serde(default)]
    pub(super) team_name: Option<String>,
    #[serde(default)]
    pub(super) team_role: Option<String>,
    #[serde(default)]
    pub(super) organization_id: Option<String>,
    #[serde(default)]
    pub(super) organization_name: Option<String>,
    #[serde(default)]
    pub(super) organization_role: Option<String>,
    #[serde(default)]
    pub(super) user_blocked_reason: Option<String>,
    #[serde(default)]
    pub(super) team_blocked_reasons: Option<Vec<String>>,
    #[serde(default)]
    pub(super) coding_data_retention_opt_out: Option<bool>,
}

/// Look up auth from the store by scope key.
pub fn lookup_auth(map: &AuthStore, scope: &str) -> Option<NofyAuth> {
    map.get(scope).cloned()
}

/// Early-invalidation buffer. Override with `NOFY_AUTH_EARLY_INVALIDATION_SECS`
/// for testing (e.g. `=5` to shrink the buffer to 5 seconds).
pub(super) fn early_invalidation() -> Duration {
    std::env::var("NOFY_AUTH_EARLY_INVALIDATION_SECS")
        .ok()
        .and_then(|v| v.parse::<u64>().ok())
        .map(|s| Duration::seconds(s as i64))
        .unwrap_or_else(|| Duration::seconds(DEFAULT_EARLY_INVALIDATION_SECS as i64))
}

pub(crate) fn is_expired(auth: &NofyAuth) -> bool {
    is_expired_with_buffer(auth, early_invalidation())
}

/// Like [`is_expired`] but with an explicit pre-expiry buffer. Pass
/// `Duration::zero()` for actual (hard) expiry — the instant the token would
/// really be rejected on the wire, with no early-invalidation margin.
pub(crate) fn is_expired_with_buffer(auth: &NofyAuth, buffer: Duration) -> bool {
    if let Some(expires_at) = auth.expires_at {
        Utc::now() >= (expires_at - buffer)
    } else {
        let age = Utc::now().signed_duration_since(auth.create_time);
        age >= (TOKEN_TTL - buffer)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_auth(mode: AuthMode) -> NofyAuth {
        NofyAuth {
            key: "k".into(),
            auth_mode: mode,
            create_time: Utc::now(),
            user_id: "u".into(),
            email: None,
            first_name: None,
            last_name: None,
            profile_image_asset_id: None,
            principal_type: None,
            principal_id: None,
            team_id: None,
            team_name: None,
            team_role: None,
            organization_id: None,
            organization_name: None,
            organization_role: None,
            user_blocked_reason: None,
            team_blocked_reasons: vec![],
            coding_data_retention_opt_out: false,
            has_nofy_code_access: None,
            refresh_token: None,
            expires_at: None,
            oidc_issuer: None,
            oidc_client_id: None,
        }
    }

    #[test]
    fn lookup_auth_returns_external_token() {
        let mut map = AuthStore::new();
        map.insert("scope".into(), make_auth(AuthMode::External));
        assert!(lookup_auth(&map, "scope").is_some());
    }

    #[test]
    fn lookup_auth_returns_api_key_token() {
        let mut map = AuthStore::new();
        map.insert("scope".into(), make_auth(AuthMode::ApiKey));
        assert!(lookup_auth(&map, "scope").is_some());
    }

    /// Pre-default auth.json (no coding_data_retention_opt_out key) must
    /// deserialize as opted-out, not the old fail-open false.
    #[test]
    fn missing_coding_data_retention_opt_out_deserializes_opted_out() {
        let json = r#"{
            "key": "k",
            "auth_mode": "external",
            "create_time": "2020-01-01T00:00:00Z",
            "user_id": "u"
        }"#;
        let auth: NofyAuth = serde_json::from_str(json).unwrap();
        assert!(
            auth.coding_data_retention_opt_out,
            "missing field must default to opted-out"
        );
        assert!(default_coding_data_retention_opt_out());
        assert!(NofyAuth::default().coding_data_retention_opt_out);
    }
}
