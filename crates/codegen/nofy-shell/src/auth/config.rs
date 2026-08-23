use crate::env::PROD_WS_ORIGIN;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default)]
pub struct NofyComConfig {
    pub nofy_ws_origin: String,
    pub token_header: String,
    /// External auth provider command (stdout = token, stderr = user UX, exit 0 = success).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub auth_provider_command: Option<String>,
    /// Auth provider label (env: `NOFY_AUTH_PROVIDER_LABEL`).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub auth_provider_label: Option<String>,
    /// Token TTL in seconds for external auth providers that output bare
    /// tokens without `expires_in`. Synthesizes `expires_at` so proactive
    /// refresh works. Env: `NOFY_AUTH_TOKEN_TTL`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub auth_token_ttl: Option<u64>,
}

/// auth.json scope key for session credentials minted by an external auth
/// provider. Plain API keys live under `API_KEY_SCOPE` instead.
pub const NOFY_SESSION_SCOPE: &str = "nofy::session";

impl NofyComConfig {
    /// The auth.json scope key for this config's session credentials.
    pub fn auth_scope(&self) -> String {
        NOFY_SESSION_SCOPE.to_owned()
    }
}

impl Default for NofyComConfig {
    fn default() -> Self {
        Self {
            nofy_ws_origin: std::env::var("NOFY_WS_ORIGIN")
                .unwrap_or_else(|_| PROD_WS_ORIGIN.to_owned()),
            token_header: "nofy-nofy-cli".to_owned(),
            auth_provider_command: std::env::var("NOFY_AUTH_PROVIDER_COMMAND").ok(),
            auth_provider_label: std::env::var("NOFY_AUTH_PROVIDER_LABEL").ok(),
            auth_token_ttl: std::env::var("NOFY_AUTH_TOKEN_TTL")
                .ok()
                .and_then(|v| v.parse().ok()),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Parse a boolean env-var value for nofy's on/off flags. A bare presence
    /// enables the flag, but the common falsy spellings (`0`, `false`, `off`,
    /// `no`, empty) count as disabled.
    fn env_flag_enabled(value: &str) -> bool {
        !matches!(
            value.trim().to_ascii_lowercase().as_str(),
            "" | "0" | "false" | "off" | "no"
        )
    }

    #[test]
    fn auth_scope_is_the_session_scope() {
        assert_eq!(NofyComConfig::default().auth_scope(), NOFY_SESSION_SCOPE);
    }

    #[test]
    fn env_flag_enabled_treats_falsy_spellings_as_off() {
        for off in ["", " ", "0", "false", "FALSE", "off", "No", "  false  "] {
            assert!(!env_flag_enabled(off), "{off:?} should be off");
        }
        for on in ["1", "true", "yes", "on", "enabled"] {
            assert!(env_flag_enabled(on), "{on:?} should be on");
        }
    }
}
