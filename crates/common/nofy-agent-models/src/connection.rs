use crate::{failure, invalid};
use nofy_agent_runtime::{Error, credentials::CredentialProvider};
use reqwest::{
    Client, Url,
    header::{HeaderMap, HeaderName, HeaderValue},
};
use serde::{Deserialize, Serialize};
use std::{
    collections::{BTreeMap, BTreeSet},
    sync::Arc,
    time::Duration,
};
use tokio::sync::Semaphore;

#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct HeaderCredential {
    pub reference: String,
    #[serde(default)]
    pub prefix: String,
}
#[derive(Clone, Default, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct EndpointLimits {
    pub max_input_tokens: u64,
    pub max_output_tokens: u64,
}
fn yes() -> bool {
    true
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Tls {
    #[serde(default = "yes")]
    pub system_roots: bool,
    #[serde(default)]
    pub roots_pem: Vec<String>,
    #[serde(default)]
    pub identity_ref: Option<String>,
}
impl Default for Tls {
    fn default() -> Self {
        Self {
            system_roots: true,
            roots_pem: Vec::new(),
            identity_ref: None,
        }
    }
}
fn timeout() -> u64 {
    120000
}
fn idle() -> u64 {
    30000
}
fn workers() -> usize {
    4
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Config {
    pub base_url: String,
    pub models: BTreeSet<String>,
    #[serde(default)]
    pub headers: BTreeMap<String, String>,
    #[serde(default)]
    pub header_credentials: BTreeMap<String, HeaderCredential>,
    #[serde(default)]
    pub query: BTreeMap<String, String>,
    #[serde(default)]
    pub tls: Tls,
    #[serde(default)]
    pub proxy_url: Option<String>,
    #[serde(default)]
    pub allow_insecure_http: bool,
    #[serde(default = "timeout")]
    pub timeout_ms: u64,
    #[serde(default = "idle")]
    pub idle_timeout_ms: u64,
    #[serde(default = "workers")]
    pub max_concurrency: usize,
    /// Endpoint-enforced per-physical-request guarantees, not token estimates.
    #[serde(default)]
    pub endpoint_limits: BTreeMap<String, EndpointLimits>,
}
pub(crate) struct Connection {
    pub config: Config,
    pub base: Url,
    pub credentials: Arc<dyn CredentialProvider>,
    pub slots: Arc<Semaphore>,
}
fn reference(value: &str) -> bool {
    !value.is_empty()
        && value.len() <= 128
        && value
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b == b'_')
}
fn header(name: &str) -> Result<HeaderName, Error> {
    let name = HeaderName::from_bytes(name.as_bytes())
        .map_err(|_| invalid("invalid model header name"))?;
    if matches!(
        name.as_str(),
        "host"
            | "content-length"
            | "transfer-encoding"
            | "connection"
            | "content-type"
            | "accept"
            | "proxy-authorization"
    ) {
        return Err(invalid("model transport owns framing headers"));
    }
    Ok(name)
}
impl Connection {
    pub fn new(config: Config, credentials: Arc<dyn CredentialProvider>) -> Result<Self, Error> {
        let base =
            Url::parse(&config.base_url).map_err(|_| invalid("invalid model connection URL"))?;
        if base.as_str() != config.base_url
            || base.host_str().is_none()
            || !base.username().is_empty()
            || base.password().is_some()
            || base.query().is_some()
            || base.fragment().is_some()
            || !base.path().ends_with('/')
            || base.path().contains('%')
            || !(base.scheme() == "https"
                || (base.scheme() == "http" && config.allow_insecure_http))
        {
            return Err(invalid(
                "model connection requires a canonical HTTPS directory URL; plain HTTP requires explicit opt-in",
            ));
        }
        if !(1..=1024).contains(&config.models.len())
            || config
                .models
                .iter()
                .any(|m| m.trim().is_empty() || m.len() > 256)
            || config.headers.len() + config.header_credentials.len() > 64
            || config.query.len() > 64
            || config
                .query
                .iter()
                .any(|(k, v)| k.is_empty() || k.len() > 256 || v.len() > 8192)
            || !(1..=32).contains(&config.max_concurrency)
            || !(1..=600000).contains(&config.timeout_ms)
            || !(1..=600000).contains(&config.idle_timeout_ms)
        {
            return Err(invalid("invalid model connection limits"));
        }
        let mut names = BTreeSet::new();
        for (name, value) in &config.headers {
            let name = header(name)?;
            if !names.insert(name.as_str().to_owned())
                || value.len() > 8192
                || HeaderValue::from_str(value).is_err()
            {
                return Err(invalid("invalid or duplicate model header"));
            }
            if matches!(name.as_str(), "authorization" | "x-api-key" | "api-key") {
                return Err(invalid("authentication must use a credential reference"));
            }
        }
        for (name, binding) in &config.header_credentials {
            let name = header(name)?;
            if !names.insert(name.as_str().to_owned())
                || !reference(&binding.reference)
                || binding.prefix.len() > 64
                || HeaderValue::from_str(&binding.prefix).is_err()
            {
                return Err(invalid("invalid or duplicate model credential binding"));
            }
        }
        if config.tls.roots_pem.len() > 32
            || config.tls.roots_pem.iter().map(String::len).sum::<usize>() > 1024 * 1024
            || config
                .tls
                .identity_ref
                .as_ref()
                .is_some_and(|r| !reference(r))
        {
            return Err(invalid("invalid explicit model TLS material"));
        }
        for pem in &config.tls.roots_pem {
            reqwest::Certificate::from_pem(pem.as_bytes())
                .map_err(|_| invalid("invalid model root certificate"))?;
        }
        if let Some(proxy) = &config.proxy_url {
            let url = Url::parse(proxy).map_err(|_| invalid("invalid explicit model proxy"))?;
            if !matches!(url.scheme(), "http" | "https" | "socks5" | "socks5h")
                || url.host_str().is_none()
                || !url.username().is_empty()
                || url.password().is_some()
                || url.query().is_some()
                || url.fragment().is_some()
            {
                return Err(invalid(
                    "model proxy must not contain credentials, query or fragment",
                ));
            }
        }
        if config.endpoint_limits.iter().any(|(name, limit)| {
            !config.models.contains(name)
                || limit.max_input_tokens == 0
                || limit.max_output_tokens == 0
                || limit.max_input_tokens > u64::MAX / 8
                || limit.max_output_tokens > u64::MAX / 8
        }) {
            return Err(invalid("invalid endpoint-enforced model limits"));
        }
        Ok(Self {
            slots: Arc::new(Semaphore::new(config.max_concurrency)),
            config,
            base,
            credentials,
        })
    }
    pub fn endpoint(&self, path: &str) -> Result<Url, Error> {
        if path.is_empty()
            || path.len() > 2048
            || path.starts_with('/')
            || path.contains(['?', '#', '\\', '%'])
            || path.split('/').any(|segment| matches!(segment, "." | ".."))
        {
            return Err(failure("endpoint_escape"));
        }
        let mut url = self
            .base
            .join(path)
            .map_err(|_| failure("endpoint_escape"))?;
        if url.origin() != self.base.origin()
            || !url.path().starts_with(self.base.path())
            || !url.username().is_empty()
            || url.password().is_some()
            || url.fragment().is_some()
            || url.query().is_some()
        {
            return Err(failure("endpoint_escape"));
        }
        if !self.config.query.is_empty() {
            url.query_pairs_mut().extend_pairs(&self.config.query);
        }
        Ok(url)
    }
    async fn credential(&self, reference: &str) -> Result<String, Error> {
        self.credentials
            .resolve(reference)
            .await
            .map_err(|_| failure("credential_unavailable"))?
            .filter(|v| !v.trim().is_empty() && v.len() <= 1024 * 1024)
            .ok_or_else(|| failure("credential_unavailable"))
    }
    pub async fn client(&self) -> Result<(Client, HeaderMap), Error> {
        let mut builder = Client::builder()
            .no_proxy()
            .redirect(reqwest::redirect::Policy::none())
            .timeout(Duration::from_millis(self.config.timeout_ms))
            .tls_built_in_root_certs(self.config.tls.system_roots);
        if let Some(proxy) = &self.config.proxy_url {
            builder = builder.proxy(reqwest::Proxy::all(proxy).map_err(|_| failure("proxy"))?);
        }
        for pem in &self.config.tls.roots_pem {
            builder = builder.add_root_certificate(
                reqwest::Certificate::from_pem(pem.as_bytes())
                    .map_err(|_| failure("root_certificate"))?,
            );
        }
        if let Some(reference) = &self.config.tls.identity_ref {
            let identity = self.credential(reference).await?;
            builder = builder.identity(
                reqwest::Identity::from_pem(identity.as_bytes())
                    .map_err(|_| failure("client_identity"))?,
            );
        }
        let mut headers = HeaderMap::new();
        for (name, value) in &self.config.headers {
            headers.insert(
                header(name)?,
                HeaderValue::from_str(value).map_err(|_| failure("header"))?,
            );
        }
        for (name, binding) in &self.config.header_credentials {
            let value = self.credential(&binding.reference).await?;
            if value.len() + binding.prefix.len() > 16384 {
                return Err(failure("credential_header_limit"));
            }
            let mut value = HeaderValue::from_str(&format!("{}{value}", binding.prefix))
                .map_err(|_| failure("credential_header"))?;
            value.set_sensitive(true);
            headers.insert(header(name)?, value);
        }
        let client = builder.build().map_err(|_| failure("http_client"))?;
        Ok((client, headers))
    }
}
