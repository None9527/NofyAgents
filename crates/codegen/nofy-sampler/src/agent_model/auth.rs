//! Explicit host-installed credential recovery, scoped to one fixed connection.
use super::*;
use nofy_auth::{AuthCredentialProvider, ModelByok, session_token_auth_gate};
use sha2::{Digest, Sha256};
use std::sync::Arc;

#[derive(Clone, Copy, Debug)]
pub enum AuthRecoveryPolicy {
    /// Facts come from the host's model/auth resolver, never the client module
    /// document. The original session gate is reused unchanged.
    Session {
        is_session_based: bool,
        model_byok: ModelByok,
        endpoint_is_first_party: bool,
    },
    /// An explicitly installed provider (e.g. the original external auth
    /// helper). Its own fresh-mint guard remains authoritative.
    Provider,
}
impl AuthRecoveryPolicy {
    fn active(self) -> bool {
        match self {
            Self::Provider => true,
            Self::Session {
                is_session_based,
                model_byok,
                endpoint_is_first_party,
            } => session_token_auth_gate(is_session_based, model_byok, endpoint_is_first_party),
        }
    }
    fn metadata(self) -> Value {
        match self {
            Self::Provider => json!({"mode":"provider"}),
            Self::Session {
                is_session_based,
                model_byok,
                endpoint_is_first_party,
            } => {
                json!({"mode":"session","is_session_based":is_session_based,"model_byok":model_byok.as_str(),"endpoint_is_first_party":endpoint_is_first_party})
            }
        }
    }
}
/// Credential handles and tokens are not serialized as resource configuration
/// or factory revisions.
/// Constructing this resource does not call the credential provider.
pub struct SamplerAuthRecovery {
    credentials: Arc<dyn AuthCredentialProvider>,
    base_url: reqwest::Url,
    policy: AuthRecoveryPolicy,
    timeout_ms: u64,
    identity: String,
    refresh_lock: tokio::sync::Mutex<()>,
}
impl SamplerAuthRecovery {
    pub fn new(
        credentials: Arc<dyn AuthCredentialProvider>,
        base_url: &str,
        policy: AuthRecoveryPolicy,
        revision: &str,
        timeout_ms: u64,
    ) -> Result<Self, Error> {
        let base_url = reqwest::Url::parse(base_url)
            .map_err(|e| Error::Composition(format!("auth connection: {e}")))?;
        if revision.trim().is_empty()
            || !(1..=600_000).contains(&timeout_ms)
            || !matches!(base_url.scheme(), "http" | "https")
            || base_url.host_str().is_none()
            || !base_url.username().is_empty()
            || base_url.password().is_some()
            || base_url.fragment().is_some()
        {
            return Err(Error::Composition("auth recovery requires a versioned HTTP connection, timeout and no URL credentials".into()));
        }
        if policy.active()
            && let AuthRecoveryPolicy::Session {
                endpoint_is_first_party,
                ..
            } = policy
        {
            let host = base_url.host_str().unwrap_or_default();
            let loopback = host.eq_ignore_ascii_case("localhost")
                || host
                    .trim_matches(['[', ']'])
                    .parse::<std::net::IpAddr>()
                    .is_ok_and(|ip| ip.is_loopback());
            if !endpoint_is_first_party || base_url.scheme() != "https" || loopback {
                return Err(Error::Composition(
                    "session recovery requires a trusted HTTPS bearer endpoint".into(),
                ));
            }
        }
        let identity = format!(
            "auth-recovery:{:x}",
            Sha256::digest(
                serde_json::to_vec(&(base_url.as_str(), policy.metadata(), revision, timeout_ms))
                    .map_err(|e| Error::Composition(e.to_string()))?
            )
        );
        Ok(Self {
            credentials,
            base_url,
            policy,
            timeout_ms,
            identity,
            refresh_lock: tokio::sync::Mutex::new(()),
        })
    }
    pub fn identity(&self) -> &str {
        &self.identity
    }
    pub(super) fn validate_config(&self, config: &SamplerConfig) -> Result<(), Error> {
        if reqwest::Url::parse(&config.base_url).ok().as_ref() != Some(&self.base_url) {
            return Err(Error::Composition(
                "auth recovery connection does not match the installed model".into(),
            ));
        }
        if self.policy.active()
            && matches!(self.policy, AuthRecoveryPolicy::Session { .. })
            && config.auth_scheme != crate::AuthScheme::Bearer
        {
            return Err(Error::Composition(
                "session recovery requires bearer authentication".into(),
            ));
        }
        Ok(())
    }
    pub(super) fn active(&self) -> bool {
        self.policy.active()
    }
    fn apply_token(&self, config: &mut SamplerConfig, token: String) {
        config.api_key = Some(token);
        // Use the exact snapshot selected by this connection's credential
        // provider, not a potentially unrelated ambient bearer resolver.
        config.bearer_resolver = None;
        if matches!(self.policy, AuthRecoveryPolicy::Session { .. }) {
            config
                .extra_headers
                .retain(|name, _| !name.eq_ignore_ascii_case("X-NOFY-Token-Auth"));
            if self.credentials.needs_token_auth_header() {
                config
                    .extra_headers
                    .insert("X-NOFY-Token-Auth".into(), "true".into());
            } else {
                config.extra_headers.shift_remove("X-NOFY-Token-Auth");
            }
        }
    }
    pub(super) fn prepare(&self, config: &mut SamplerConfig) -> Result<(), Error> {
        self.validate_config(config)?;
        if self.active()
            && let Some(token) = self
                .credentials
                .snapshot()
                .token
                .filter(|token| !token.is_empty())
        {
            self.apply_token(config, token);
        }
        Ok(())
    }
    pub(super) async fn refreshed_config(
        &self,
        config: &SamplerConfig,
        cancel: &tokio_util::sync::CancellationToken,
    ) -> Result<Option<SamplerConfig>, Error> {
        self.validate_config(config)?;
        if !self.active() {
            return Ok(None);
        }
        let recover = async {
            let _guard = self.refresh_lock.lock().await;
            // A concurrent request may already have rotated this resource.
            let current = self.credentials.snapshot().token;
            let token = if current
                .as_ref()
                .is_some_and(|token| !token.is_empty() && Some(token) != config.api_key.as_ref())
            {
                current
            } else if self.credentials.refresh_after_unauthorized().await {
                self.credentials.snapshot().token
            } else {
                None
            };
            let Some(token) =
                token.filter(|token| !token.is_empty() && Some(token) != config.api_key.as_ref())
            else {
                return Ok(None);
            };
            let mut next = config.clone();
            self.apply_token(&mut next, token);
            Ok(Some(next))
        };
        tokio::select! {biased;
            _=cancel.cancelled()=>Err(Error::Cancelled),
            result=tokio::time::timeout(std::time::Duration::from_millis(self.timeout_ms),recover)=>result.map_err(|_|Error::Model("credential recovery timed out".into()))?,
        }
    }
}
