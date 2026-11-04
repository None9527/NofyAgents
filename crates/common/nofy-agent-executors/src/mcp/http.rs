use super::*;
use crate::resources::CredentialProvider;
use nofy_tool_runtime::ToolCallContext;
use serde::Deserialize;
use std::{sync::Arc, time::Duration};

pub struct HttpResourceFactory {
    authority: String,
    credentials: Arc<dyn CredentialProvider>,
}
impl HttpResourceFactory {
    pub fn new(authority: &str, credentials: Arc<dyn CredentialProvider>) -> Result<Self, Error> {
        if authority.trim().is_empty() || authority.len() > 4096 {
            return Err(crate::composition("invalid MCP credential authority"));
        }
        Ok(Self {
            authority: authority.into(),
            credentials,
        })
    }
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Config {
    endpoint: String,
    #[serde(default)]
    credential_ref: Option<String>,
}
pub(super) struct Connection {
    endpoint: reqwest::Url,
    credential_ref: Option<String>,
    credentials: Arc<dyn CredentialProvider>,
    client: tokio::sync::OnceCell<reqwest::Client>,
}
impl ModuleFactory for HttpResourceFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "resource.mcp_http",
            ModuleKind::Resource,
            json!({"type":"object","additionalProperties":false,"required":["endpoint"],"properties":{
                "endpoint":{"type":"string","minLength":1,"maxLength":16384},
                "credential_ref":{"type":["string","null"],"minLength":1,"maxLength":128,"pattern":"^[A-Za-z0-9_]+$"}
            }}),
            Default::default(),
        )
    }
    fn build(
        &self,
        value: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        let config: Config = serde_json::from_value(value.clone())
            .map_err(|_| crate::composition("invalid MCP HTTP resource"))?;
        let endpoint = reqwest::Url::parse(&config.endpoint)
            .map_err(|_| crate::composition("invalid MCP endpoint"))?;
        if !matches!(endpoint.scheme(), "http" | "https")
            || endpoint.host_str().is_none()
            || !endpoint.username().is_empty()
            || endpoint.password().is_some()
            || endpoint.query().is_some()
            || endpoint.fragment().is_some()
        {
            return Err(crate::composition(
                "MCP endpoint requires http(s) without URL credentials, query or fragment",
            ));
        }
        let identity =
            nofy_agent_runtime::system::content_digest(&(REVISION, &self.authority, value))?;
        Ok(ModuleInstance::Resource(Arc::new(ResourceHandle::new(
            identity,
            Arc::new(Connection {
                endpoint,
                credential_ref: config.credential_ref,
                credentials: self.credentials.clone(),
                client: Default::default(),
            }),
        )?)))
    }
}
impl Connection {
    async fn request(
        &self,
        method: reqwest::Method,
        session: Option<&str>,
        context: &ToolCallContext,
    ) -> Result<reqwest::RequestBuilder, ToolError> {
        let client = self
            .client
            .get_or_try_init(|| async {
                // Construction stays out of factory compilation and blocking IO.
                tokio::task::spawn_blocking(|| {
                    reqwest::Client::builder()
                        .redirect(reqwest::redirect::Policy::none())
                        .no_proxy()
                        .retry(reqwest::retry::never())
                        .build()
                })
                .await
                .map_err(|_| protocol("MCP client initialization failed"))?
                .map_err(|_| protocol("MCP client initialization failed"))
            })
            .await?;
        let mut request = client
            .request(method, self.endpoint.clone())
            .header("accept", "application/json, text/event-stream")
            .header("mcp-protocol-version", PROTOCOL);
        if let Some(session) = session {
            request = request.header("mcp-session-id", session);
        }
        if let Some(reference) = &self.credential_ref {
            let secret = self.credentials.resolve(reference, context).await?;
            let mut token = reqwest::header::HeaderValue::from_str(&format!("Bearer {secret}"))
                .map_err(|_| {
                    crate::tool_error(
                        "credential_unavailable",
                        "MCP credential cannot be used as an HTTP bearer token",
                    )
                })?;
            token.set_sensitive(true);
            request = request.header(reqwest::header::AUTHORIZATION, token);
        }
        Ok(request)
    }
    pub(super) async fn post(
        &self,
        message: &Value,
        session: Option<&str>,
        context: &ToolCallContext,
    ) -> Result<reqwest::Response, ToolError> {
        let response = self.request(reqwest::Method::POST, session, context).await?
            .json(message).send().await
            .map_err(|_| crate::tool_error("mcp_transport", "MCP HTTP request failed; delivery/effect is unconfirmed, do not retry automatically"))?;
        if !response.status().is_success() {
            let code = if response.status() == reqwest::StatusCode::NOT_FOUND && session.is_some() {
                "mcp_session_expired"
            } else {
                "mcp_http_status"
            };
            return Err(crate::tool_error(
                code,
                format!("MCP HTTP returned status {}", response.status().as_u16()),
            ));
        }
        Ok(response)
    }
    pub(super) async fn notify(
        &self,
        message: &Value,
        session: Option<&str>,
        context: &ToolCallContext,
    ) -> Result<(), ToolError> {
        let response = self.post(message, session, context).await?;
        if response.status() != reqwest::StatusCode::ACCEPTED {
            return Err(protocol("MCP notification/response requires HTTP 202"));
        }
        Ok(())
    }
    pub(super) fn cancel(
        self: &Arc<Self>,
        id: u64,
        session: Option<String>,
        context: ToolCallContext,
    ) {
        let connection = self.clone();
        if let Ok(runtime) = tokio::runtime::Handle::try_current() {
            runtime.spawn(async move {
                let message = json!({"jsonrpc":"2.0","method":"notifications/cancelled","params":{"requestId":id,"reason":"caller stopped waiting"}});
                let _ = tokio::time::timeout(Duration::from_millis(500), connection.notify(&message, session.as_deref(), &context)).await;
            });
        }
    }
    pub(super) fn close(self: &Arc<Self>, session: String) {
        let connection = self.clone();
        if let Ok(runtime) = tokio::runtime::Handle::try_current() {
            runtime.spawn(async move {
                let operation = async {
                    let request = connection
                        .request(
                            reqwest::Method::DELETE,
                            Some(&session),
                            &ToolCallContext::default(),
                        )
                        .await?;
                    request
                        .send()
                        .await
                        .map_err(|_| protocol("MCP session close failed"))?;
                    Ok::<_, ToolError>(())
                };
                let _ = tokio::time::timeout(Duration::from_millis(500), operation).await;
            });
        }
    }
}
