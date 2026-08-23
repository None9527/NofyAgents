pub(crate) mod api_key_probe;
pub(crate) mod attribution;
mod auth_provider;
mod config;
pub mod credential_provider;
pub mod error;
mod external_auth;
mod flow;
mod jwt;
pub(crate) mod manager;
mod model;
pub(crate) mod recovery;
pub(crate) mod refresh;
mod storage;
mod token_output;
pub(crate) mod token_type;
pub(crate) use api_key_probe::{
    DEFAULT_PROBE_TIMEOUT, first_party_env_key_allows_advertise, should_probe_first_party_env_key,
};
pub use auth_provider::{AuthProviderConfig, AuthProviderRef};
pub(crate) use auth_provider::{
    PROVIDER_TIMEOUT_CEILING_SECS, PROVIDER_TOKEN_EXPIRY_SKEW_SECS, ProviderRefreshOutcome,
};
#[cfg(test)]
pub(crate) use auth_provider::{test_backdate_provider_mint, test_counting_provider};
pub use config::NofyComConfig;
pub(crate) use external_auth::{parse_output, refresh_with_command};
pub(crate) use flow::try_noninteractive_auth_no_mint;
pub use flow::try_ensure_fresh_auth;
pub use jwt::{is_jwt_expired_or_near, parse_jwt_expiration};
mod meta;
pub use error::{AuthError, RefreshTokenError, RefreshTokenFailedReason};
pub use manager::{AuthManager, shared_api_key_provider};
pub(crate) use manager::{AuthRemedy, SilentRefresh};
pub use meta::AuthMeta;
pub use model::{AuthMode, NofyAuth, lookup_auth};
pub(crate) use model::{TOKEN_TTL, UserInfo, is_expired};
pub(crate) use refresh::DiagnosticUploader;
pub use storage::{clear_api_key, read_api_key, read_auth_json, store_api_key};
