pub(crate) mod connection;
use crate::{
    config::{self, JsonBinding, ToolContract},
    resources::CredentialProvider,
};
use nofy_agent_runtime::{
    Error,
    registry::{ModuleDescriptor, ModuleFactory, ModuleInstance},
};
use nofy_tool_runtime::{ToolCallContext, ToolDispatch, ToolStream, TypedToolOutput};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use sha2::{Digest, Sha256};
use std::{
    collections::{BTreeMap, BTreeSet},
    sync::Arc,
    time::Duration,
};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
#[serde(rename_all = "UPPERCASE")]
pub enum Method {
    Get,
    Post,
    Put,
    Patch,
    Delete,
}
impl Method {
    fn wire(&self) -> reqwest::Method {
        match self {
            Self::Get => reqwest::Method::GET,
            Self::Post => reqwest::Method::POST,
            Self::Put => reqwest::Method::PUT,
            Self::Patch => reqwest::Method::PATCH,
            Self::Delete => reqwest::Method::DELETE,
        }
    }
}

pub struct HttpConnection {
    base: reqwest::Url,
    client: reqwest::Client,
    methods: BTreeSet<Method>,
    credential_refs: BTreeSet<String>,
    credentials: Arc<dyn CredentialProvider>,
    identity: String,
}
impl HttpConnection {
    /// Explicit host installation. Redirects and ambient proxies are disabled;
    /// a client document can only select paths under this admitted base URL.
    pub fn install(
        base: &str,
        revision: &str,
        methods: BTreeSet<Method>,
        credential_refs: BTreeSet<String>,
        credentials: Arc<dyn CredentialProvider>,
    ) -> Result<Self, Error> {
        let base = connection::base(base)?;
        if revision.trim().is_empty() || methods.is_empty() {
            return Err(crate::composition("HTTP methods/revision required"));
        }
        let client = reqwest::Client::builder()
            .redirect(reqwest::redirect::Policy::none())
            .no_proxy()
            .build()
            .map_err(|_| crate::composition("HTTP client initialization failed"))?;
        let identity =
            serde_json::to_string(&(base.as_str(), revision, &methods, &credential_refs))
                .map_err(|e| crate::composition(e.to_string()))?;
        Ok(Self {
            base,
            client,
            methods,
            credential_refs,
            credentials,
            identity,
        })
    }
    fn endpoint(&self, path: &str) -> Result<reqwest::Url, Error> {
        connection::endpoint(&self.base, path)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct HttpToolConfig {
    pub contract: ToolContract,
    pub connection: String,
    pub path: String,
    pub method: Method,
    #[serde(default)]
    pub input: JsonBinding,
    #[serde(default)]
    pub credential_ref: Option<String>,
}

pub struct HttpToolFactory {
    connections: BTreeMap<String, Arc<HttpConnection>>,
    revision: String,
}
impl HttpToolFactory {
    pub fn new(
        revision: &str,
        connections: BTreeMap<String, Arc<HttpConnection>>,
    ) -> Result<Self, Error> {
        if revision.trim().is_empty() {
            return Err(crate::composition("HTTP factory revision required"));
        }
        let manifest: Vec<_> = connections
            .iter()
            .map(|(id, c)| (id, &c.identity))
            .collect();
        let digest = Sha256::digest(
            serde_json::to_vec(&manifest).map_err(|e| crate::composition(e.to_string()))?,
        );
        Ok(Self {
            connections,
            revision: format!("{revision}:{digest:x}"),
        })
    }
}
impl ModuleFactory for HttpToolFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        config::descriptor(
            "tool.http",
            &self.revision,
            json!({"type":"object","additionalProperties":false,"required":["contract","connection","path","method"],"properties":{
            "contract":config::contract_schema(),"connection":{"type":"string","enum":self.connections.keys().collect::<Vec<_>>()},"path":{"type":"string"},
            "method":{"enum":["GET","POST","PUT","PATCH","DELETE"]},"input":{"$ref":"#/$defs/binding"},"credential_ref":{"type":["string","null"]}
        },"$defs":{"binding":config::binding_schema()}}),
        )
    }
    fn build(
        &self,
        config: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        let config: HttpToolConfig = serde_json::from_value(config.clone())
            .map_err(|e| crate::composition(format!("tool.http: {e}")))?;
        config.contract.validate()?;
        config.input.validate()?;
        let connection = self
            .connections
            .get(&config.connection)
            .cloned()
            .ok_or_else(|| crate::composition("HTTP connection not admitted"))?;
        if !connection.methods.contains(&config.method) {
            return Err(crate::composition(
                "HTTP method not admitted by host connection",
            ));
        }
        if let Some(reference) = &config.credential_ref
            && !connection.credential_refs.contains(reference)
        {
            return Err(crate::composition(
                "HTTP credential reference not admitted by host connection",
            ));
        }
        let endpoint = connection.endpoint(&config.path)?;
        let contract = config.contract.clone();
        Ok(ModuleInstance::ToolPack(crate::catalog(
            &contract,
            Arc::new(HttpDispatch {
                connection,
                config,
                endpoint,
            }),
        )?))
    }
}

struct HttpDispatch {
    connection: Arc<HttpConnection>,
    config: HttpToolConfig,
    endpoint: reqwest::Url,
}
#[async_trait::async_trait]
impl ToolDispatch for HttpDispatch {
    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        args: Value,
        ctx: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        let operation = async {
            crate::validate_input(&self.config.contract, &args)?;
            let input = self.config.input.render(&args)?;
            if serde_json::to_vec(&input)
                .map_err(|_| crate::tool_error("input_mapping", "mapped HTTP input is not JSON"))?
                .len()
                > self.config.contract.max_input_bytes
            {
                return Err(crate::tool_error(
                    "input_limit",
                    "mapped HTTP input exceeds byte limit",
                ));
            }
            let mut request = self
                .connection
                .client
                .request(self.config.method.wire(), self.endpoint.clone());
            if self.config.method == Method::Get {
                let fields = input.as_object().ok_or_else(|| {
                    crate::tool_error("input_mapping", "GET input must be an object")
                })?;
                let query: Vec<_> = fields
                    .iter()
                    .map(|(k, v)| {
                        let value = match v {
                            Value::String(s) => s.clone(),
                            Value::Number(_) | Value::Bool(_) => v.to_string(),
                            _ => {
                                return Err(crate::tool_error(
                                    "input_mapping",
                                    "GET query values must be scalar",
                                ));
                            }
                        };
                        Ok((k, value))
                    })
                    .collect::<Result<_, _>>()?;
                request = request.query(&query);
            } else {
                request = request.json(&input);
            }
            if let Some(reference) = &self.config.credential_ref {
                let secret = self.connection.credentials.resolve(reference, &ctx).await?;
                request = request.bearer_auth(secret);
            }
            let mut response = request
                .send()
                .await
                .map_err(|_| crate::tool_error("http_transport", "HTTP request failed"))?;
            if !response.status().is_success() {
                return Err(crate::tool_error(
                    "http_status",
                    format!("HTTP tool returned status {}", response.status().as_u16()),
                ));
            }
            let mut bytes = Vec::new();
            while let Some(chunk) = response
                .chunk()
                .await
                .map_err(|_| crate::tool_error("http_transport", "HTTP response interrupted"))?
            {
                if chunk.len()
                    > self
                        .config
                        .contract
                        .max_output_bytes
                        .saturating_sub(bytes.len())
                {
                    return Err(crate::tool_error(
                        "output_limit",
                        "HTTP response exceeds configured byte limit",
                    ));
                }
                bytes.extend_from_slice(&chunk);
            }
            let value = serde_json::from_slice(&bytes)
                .map_err(|_| crate::tool_error("invalid_output", "HTTP response is not JSON"))?;
            crate::output(&self.config.contract, value)
                .map(|value| TypedToolOutput::from_value(id, value))
        };
        let cancel = ctx
            .get::<nofy_tool_runtime::Cancellation>()
            .map(|cancel| cancel.0.clone())
            .unwrap_or_default();
        let result = tokio::select! {biased;
            _=cancel.cancelled()=>Err(crate::tool_error("cancelled","HTTP tool cancelled")),
            result=tokio::time::timeout(Duration::from_millis(self.config.contract.timeout_ms),operation)=>result.unwrap_or_else(|_|Err(crate::tool_error("timeout","HTTP tool timed out"))),
        };
        nofy_tool_runtime::terminal_only(result)
    }
}
