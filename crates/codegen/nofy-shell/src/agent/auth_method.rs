use agent_client_protocol as acp;

use crate::agent::config::ModelEntry;

/// Shared, live handle to the agent's current ACP auth method id.
///
/// `Arc` so a clone can cross the per-session-thread boundary at spawn; the
/// `ArcSwapOption` interior lets the agent's `authenticate` handler publish a
/// new method that every running session's per-turn auth gate observes on its
/// next turn -- no re-spawn. `None` until the first `authenticate`. Auth is
/// process-global (one user, one `AuthManager`), so all sessions sharing one
/// cell is correct.
pub(crate) type SharedAuthMethodId = std::sync::Arc<arc_swap::ArcSwapOption<acp::AuthMethodId>>;

/// Construct a [`SharedAuthMethodId`]. `None` is the pre-`authenticate` state.
pub(crate) fn new_shared_auth_method_id(initial: Option<acp::AuthMethodId>) -> SharedAuthMethodId {
    std::sync::Arc::new(arc_swap::ArcSwapOption::new(
        initial.map(std::sync::Arc::new),
    ))
}

/// Env var that, when set, advertises `nofy.api_key` as a viable auth method.
///
/// Kept as a constant so test code and the production check stay in sync.
pub const NOFY_API_KEY_ENV_VAR: &str = "NOFY_API_KEY";

/// Read the API key from the environment.
pub(crate) fn read_xai_api_key_env() -> Result<String, std::env::VarError> {
    std::env::var(NOFY_API_KEY_ENV_VAR)
}

/// Returns `true` when `NOFY_API_KEY` is set.
pub fn has_xai_api_key_env() -> bool {
    read_xai_api_key_env().is_ok()
}

/// Whether `nofy.api_key` should be advertised (and pushed FIRST) when building
/// the `auth_methods` list at `initialize()` time.
///
/// Regression: `nofy.api_key` must stay first when only per-model credentials
/// exist (no global `NOFY_API_KEY`). Deferring it made BYOK users fail startup
/// authentication because the pager uses `auth_methods.first()` eagerly.
///
/// [`build_auth_methods`] consumes this predicate and pins the ordering;
/// its tests catch call-site and predicate regressions.
///
/// Probes `std::env` at call time and consults each `ModelEntry` for a
/// resolvable api_key/env_key -- both inputs can change between calls, so the
/// result is not cached.
///
/// Presence-only for the first-party env key (treats it as usable). Startup
/// paths that have run the validity probe should call
/// [`should_advertise_xai_api_key_with_env_ok`] with the probe result instead.
pub(crate) fn should_advertise_xai_api_key<'a, I>(models: I) -> bool
where
    I: IntoIterator<Item = &'a ModelEntry>,
{
    should_advertise_xai_api_key_with_env_ok(models, true)
}

/// Single advertise policy for `nofy.api_key`: BYOK and first-party env gated
/// by `first_party_env_ok` (probe result, or `true` for presence-only).
/// BYOK still advertises without a probe.
pub(crate) fn should_advertise_xai_api_key_with_env_ok<'a, I>(
    models: I,
    first_party_env_ok: bool,
) -> bool
where
    I: IntoIterator<Item = &'a ModelEntry>,
{
    let has_byok = models.into_iter().any(ModelEntry::has_own_credentials);
    has_byok || (has_xai_api_key_env() && first_party_env_ok)
}

/// Inputs to [`build_auth_methods`].
///
/// Booleans are computed by the caller (`MvpAgent::initialize()`) because they
/// depend on async side effects (token refresh) and shared mutable state
/// (`AuthManager`). The list-construction logic itself is pure so it can be
/// unit-tested without any of that machinery.
pub struct AuthMethodsBuildInputs {
    /// True if `nofy.api_key` should be advertised AT ALL. Initialize
    /// callers compute via [`should_advertise_xai_api_key_with_env_ok`] after
    /// the validity probe; presence-only paths may use
    /// [`should_advertise_xai_api_key`].
    pub has_external_api_key: bool,
    /// True if a cached session token is available (either present at startup
    /// or recovered via silent refresh).
    pub has_cached_token: bool,
}

/// Output of [`build_auth_methods`].
pub struct BuiltAuthMethods {
    /// Auth methods in advertised order. ORDER IS THE CONTRACT: the pager
    /// authenticates eagerly with the first/default method.
    pub methods: Vec<acp::AuthMethod>,
    /// The default `auth_method_id` to install on the agent. `cached_token`
    /// wins over `nofy.api_key` when both are present.
    pub default_auth_method_id: Option<acp::AuthMethodId>,
}

/// Build the `auth_methods` list and default `auth_method_id` from
/// pre-computed inputs.
///
/// REGRESSION GUARD: when `has_external_api_key` is true, the **first** entry
/// MUST be `nofy.api_key`. A prior change deferred it to the END for per-model
/// credentials, which broke eager startup auth for per-model-key users.
/// Unit tests lock this.
///
/// Ordering (when each method is enabled):
/// 1. `nofy.api_key`     (if `has_external_api_key`)
/// 2. `cached_token`    (if `has_cached_token`)
///
/// `default_auth_method_id`: `cached_token` if present, else `nofy.api_key`,
/// else `None`.
pub fn build_auth_methods(inputs: AuthMethodsBuildInputs) -> BuiltAuthMethods {
    let AuthMethodsBuildInputs {
        has_external_api_key,
        has_cached_token,
    } = inputs;

    let mut methods: Vec<acp::AuthMethod> = Vec::new();
    let mut default_auth_method_id: Option<acp::AuthMethodId> = None;

    if has_external_api_key {
        methods.push(xai_api_key_auth_method());
        default_auth_method_id = Some(acp::AuthMethodId::new(NOFY_API_KEY_METHOD_ID));
    }

    if has_cached_token {
        methods.push(cached_token_auth_method());
        // cached_token wins over nofy.api_key for default_auth_method_id so
        // is_session_based_auth() returns true and provider refresh stays alive.
        let overrode_api_key = default_auth_method_id.is_some();
        default_auth_method_id = Some(acp::AuthMethodId::new(CACHED_TOKEN_AUTH_METHOD_ID));
        if overrode_api_key {
            nofy_telemetry::unified_log::info(
                "auth method priority: cached_token overrides nofy.api_key for default_auth_method_id",
                None,
                Some(serde_json::json!({
                    "has_external_api_key": has_external_api_key,
                    "has_cached_token": has_cached_token,
                })),
            );
        }
    }

    BuiltAuthMethods {
        methods,
        default_auth_method_id,
    }
}

/// ACP session auth method. Use `is_session_based_method` for classification.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AuthMethodKind {
    XaiApiKey,
    CachedToken,
    Unknown,
}

impl AuthMethodKind {
    pub fn from_id(id: &acp::AuthMethodId) -> Self {
        match id.0.as_ref() {
            NOFY_API_KEY_METHOD_ID => Self::XaiApiKey,
            CACHED_TOKEN_AUTH_METHOD_ID => Self::CachedToken,
            _ => Self::Unknown,
        }
    }

    /// API key auth: no auth.json, no refresh, no user interaction.
    pub fn is_api_key(self) -> bool {
        matches!(self, Self::XaiApiKey)
    }

    /// `true` for session-based methods (cached_token).
    pub(crate) fn is_session_based(self) -> bool {
        matches!(self, Self::CachedToken)
    }
}

/// `true` for session-based ACP methods (cached_token).
pub(crate) fn is_session_based_method(method_id: &acp::AuthMethodId) -> bool {
    AuthMethodKind::from_id(method_id).is_session_based()
}

pub(crate) use nofy_auth::{ModelByok, session_token_auth_gate};

pub const AUTH_ERROR_SESSION_EXPIRED: &str = "Session expired. Check your API key configuration.";

pub const AUTH_ERROR_API_KEY: &str =
    "Authentication failed. Set NOFY_API_KEY or add api_key to ~/.nofy/config.toml.";

/// Next ACP method id when `cached_token` cannot proceed (missing / expired),
/// or `None` when no API-key credentials are advertiseable.
pub(crate) fn method_id_after_cached_token_unavailable(
    has_external_api_key: bool,
) -> Option<&'static str> {
    has_external_api_key.then_some(NOFY_API_KEY_METHOD_ID)
}

/// Error when no API key credentials are available.
pub const PREFERRED_API_KEY_UNAVAILABLE: &str =
    "No API key is configured (set NOFY_API_KEY or model api_key/env_key in config.toml).";

pub const NOFY_API_KEY_METHOD_ID: &str = "api_key";
pub(crate) fn xai_api_key_auth_method() -> acp::AuthMethod {
    acp::AuthMethod::Agent(
        acp::AuthMethodAgent::new(
            acp::AuthMethodId::new(NOFY_API_KEY_METHOD_ID),
            "API key".to_string(),
        )
        .description(Some(format!(
            "{NOFY_API_KEY_ENV_VAR} or api_key/env_key in config.toml"
        ))),
    )
}

pub const CACHED_TOKEN_AUTH_METHOD_ID: &str = "cached_token";
pub(crate) fn cached_token_auth_method() -> acp::AuthMethod {
    acp::AuthMethod::Agent(
        acp::AuthMethodAgent::new(
            acp::AuthMethodId::new(CACHED_TOKEN_AUTH_METHOD_ID),
            "cached_token".to_string(),
        )
        .description(Some("Cached token from ~/.nofy/auth.json".to_string())),
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::agent::config::{Config, resolve_model_list};
    use agent_client_protocol as acp;
    use serial_test::serial;

    /// When API-key credentials are advertiseable, fall through from a dead
    /// `cached_token` to non-interactive `nofy.api_key`.
    #[test]
    fn after_cached_token_unavailable_prefers_api_key_when_advertiseable() {
        assert_eq!(
            method_id_after_cached_token_unavailable(true),
            Some(NOFY_API_KEY_METHOD_ID),
        );
    }

    /// No advertiseable API-key credentials → no fallthrough.
    #[test]
    fn after_cached_token_unavailable_is_none_without_api_key() {
        assert_eq!(method_id_after_cached_token_unavailable(false), None);
    }

    /// Classifier matrix for all auth method variants.
    #[test]
    fn auth_method_kind_classifier_matrix() {
        let cached_id = acp::AuthMethodId::new(CACHED_TOKEN_AUTH_METHOD_ID);
        let cached_kind = AuthMethodKind::from_id(&cached_id);
        assert!(cached_kind.is_session_based());
        assert!(is_session_based_method(&cached_id));

        let api_id = acp::AuthMethodId::new(NOFY_API_KEY_METHOD_ID);
        let api_kind = AuthMethodKind::from_id(&api_id);
        assert!(!api_kind.is_session_based());
        assert!(api_kind.is_api_key());
        assert!(!is_session_based_method(&api_id));
        assert!(!is_session_based_method(&acp::AuthMethodId::new(
            "unknown-method"
        )));
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    /// Default inputs to `build_auth_methods` representing a user with no
    /// credentials anywhere. Tests override only the fields they care about.
    fn default_inputs() -> AuthMethodsBuildInputs {
        AuthMethodsBuildInputs {
            has_external_api_key: false,
            has_cached_token: false,
        }
    }

    fn method_ids(built: &BuiltAuthMethods) -> Vec<&str> {
        built.methods.iter().map(|m| m.id().0.as_ref()).collect()
    }

    fn default_id(built: &BuiltAuthMethods) -> Option<&str> {
        built
            .default_auth_method_id
            .as_ref()
            .map(|id| id.0.as_ref())
    }

    fn first_kind(methods: &[acp::AuthMethod]) -> Option<AuthMethodKind> {
        methods.first().map(|m| AuthMethodKind::from_id(m.id()))
    }

    /// BYOK with only per-model credentials must list `nofy.api_key` first.
    #[test]
    fn byok_first_method_is_xai_api_key() {
        let built = build_auth_methods(AuthMethodsBuildInputs {
            has_external_api_key: true,
            has_cached_token: true,
        });
        assert_eq!(
            method_ids(&built),
            [NOFY_API_KEY_METHOD_ID, CACHED_TOKEN_AUTH_METHOD_ID]
        );
        assert_eq!(first_kind(&built.methods), Some(AuthMethodKind::XaiApiKey));
        // default prefers the cached session token.
        assert_eq!(default_id(&built), Some(CACHED_TOKEN_AUTH_METHOD_ID));
    }

    /// Cached-token-only users advertise just `cached_token`.
    #[test]
    fn session_only_user_advertises_cached_token() {
        let built = build_auth_methods(AuthMethodsBuildInputs {
            has_external_api_key: false,
            has_cached_token: true,
        });
        assert_eq!(method_ids(&built), [CACHED_TOKEN_AUTH_METHOD_ID]);
        assert_eq!(default_id(&built), Some(CACHED_TOKEN_AUTH_METHOD_ID));
    }

    /// No credentials → empty list, no default.
    #[test]
    fn no_credentials_advertises_nothing() {
        let built = build_auth_methods(default_inputs());
        assert!(built.methods.is_empty());
        assert!(built.default_auth_method_id.is_none());
    }

    use nofy_test_support::EnvGuard;

    /// Per-model `env_key` BYOK advertises without a global env var.
    #[test]
    #[serial]
    fn enterprise_byok_config_advertises_api_key() {
        const TEST_ENV_VAR: &str = "TEST_ENTERPRISE_REGRESSION_AUTH_TOKEN";

        // Make sure no global key is masking the per-model path we're trying
        // to exercise. Held until end-of-scope so we restore on panic too.
        let _global = EnvGuard::unset(NOFY_API_KEY_ENV_VAR);

        let dm = crate::models::default_model();
        let toml: toml::Value = toml::from_str(&format!(
            r#"
            [model."{dm}"]
            model = "{dm}"
            base_url = "https://inference.example.com/v1"
            context_window = 200000
            env_key = "{TEST_ENV_VAR}"
            "#,
        ))
        .unwrap();
        let cfg = Config::new_from_toml_cfg(&toml).expect("config should parse");
        let models = resolve_model_list(&cfg, None);
        let model = models.get(dm).expect("enterprise-style model should exist");
        assert_eq!(
            model.env_key.as_ref().map(|k| k.names()),
            Some(vec![TEST_ENV_VAR])
        );

        // Without the env var present, has_own_credentials() returns false,
        // the predicate returns false. Confirms the predicate isn't trivially true.
        {
            let _unset = EnvGuard::unset(TEST_ENV_VAR);
            assert!(!should_advertise_xai_api_key(models.values()));
        }

        // With the env var present (the actual enterprise scenario), the
        // predicate returns true and the builder MUST put `nofy.api_key`
        // first so the pager's `startup_auth_metadata()` sees a
        // non-interactive first method.
        {
            let _set = EnvGuard::set(TEST_ENV_VAR, "enterprise-secret-token");
            assert!(should_advertise_xai_api_key(models.values()));
            let built = build_auth_methods(AuthMethodsBuildInputs {
                has_external_api_key: true,
                has_cached_token: false,
            });
            assert_eq!(
                first_kind(&built.methods),
                Some(AuthMethodKind::XaiApiKey),
                "BYOK: nofy.api_key must be auth_methods.first()",
            );
        }
    }

    /// `NOFY_API_KEY` alone (no per-model creds) also triggers
    /// advertising `nofy.api_key` as the first method.
    #[test]
    #[serial]
    fn global_external_api_key_advertises_xai_api_key_first() {
        let _set = EnvGuard::set(NOFY_API_KEY_ENV_VAR, "nofy-external-key");
        let cfg = Config::default();
        let models = resolve_model_list(&cfg, None);
        assert!(should_advertise_xai_api_key(models.values()));
        let built = build_auth_methods(AuthMethodsBuildInputs {
            has_external_api_key: true,
            ..default_inputs()
        });
        assert_eq!(first_kind(&built.methods), Some(AuthMethodKind::XaiApiKey));
    }

    #[test]
    #[serial]
    fn env_key_probe_unusable_suppresses_advertise_without_byok() {
        let _set = EnvGuard::set(NOFY_API_KEY_ENV_VAR, "nofy-dead-key");
        let cfg = Config::default();
        let models = resolve_model_list(&cfg, None);
        assert!(
            should_advertise_xai_api_key(models.values()),
            "presence-only helper still sees the env key"
        );
        assert!(
            !should_advertise_xai_api_key_with_env_ok(models.values(), false),
            "probe-unusable env key alone must not advertise"
        );
    }

    #[test]
    #[serial]
    fn env_key_probe_ok_still_advertises() {
        let _set = EnvGuard::set(NOFY_API_KEY_ENV_VAR, "nofy-live-key");
        let cfg = Config::default();
        let models = resolve_model_list(&cfg, None);
        assert!(should_advertise_xai_api_key_with_env_ok(
            models.values(),
            true
        ));
    }
}
