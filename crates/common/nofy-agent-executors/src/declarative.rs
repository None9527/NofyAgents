//! Stable declarative HTTP factories. Building validates only; native clients
//! are initialized at execution and all IO uses the existing HTTP dispatch.
mod source;
use crate::{
    config::{self, JsonBinding, ToolContract},
    http::{HttpConnection, HttpToolConfig, HttpToolFactory, Method},
    resources::CredentialProvider,
};
use nofy_agent_runtime::{Error, registry::*};
use nofy_tool_runtime::{ToolCallContext, ToolDispatch, ToolError, ToolStream, TypedToolOutput};
use serde::Deserialize;
use serde_json::{Value, json};
pub use source::HttpToolSourceFactory;
use std::{
    collections::{BTreeMap, BTreeSet},
    sync::Arc,
    time::Duration,
};
pub struct HttpResourceFactory {
    authority: String,
    credentials: Arc<dyn CredentialProvider>,
}
pub struct ConnectedHttpToolFactory;
impl HttpResourceFactory {
    pub fn new(authority: &str, credentials: Arc<dyn CredentialProvider>) -> Result<Self, Error> {
        if authority.trim().is_empty() || authority.len() > 4096 {
            return Err(crate::composition("HTTP credential authority is invalid"));
        }
        Ok(Self {
            authority: authority.into(),
            credentials,
        })
    }
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ResourceConfig {
    base_url: String,
    methods: BTreeSet<Method>,
    #[serde(default)]
    credential_refs: BTreeSet<String>,
}
struct HttpResource {
    config: ResourceConfig,
    base: reqwest::Url,
    credentials: Arc<dyn CredentialProvider>,
    client: tokio::sync::OnceCell<Arc<HttpConnection>>,
}
impl HttpResource {
    async fn client(&self) -> Result<Arc<HttpConnection>, ToolError> {
        self.client
            .get_or_try_init(|| async {
                let base = self.config.base_url.clone();
                let methods = self.config.methods.clone();
                let refs = self.config.credential_refs.clone();
                let credentials = self.credentials.clone();
                tokio::task::spawn_blocking(move || {
                    HttpConnection::install(&base, "declarative-v1", methods, refs, credentials)
                })
                .await
                .map_err(|_| {
                    crate::tool_error("http_connection", "HTTP client initialization task failed")
                })?
                .map(Arc::new)
                .map_err(|_| {
                    crate::tool_error("http_connection", "HTTP client initialization failed")
                })
            })
            .await
            .cloned()
    }
}
fn descriptor(
    factory: &str,
    kind: ModuleKind,
    schema: Value,
    dependencies: BTreeMap<String, ModuleKind>,
) -> ModuleDescriptor {
    ModuleDescriptor {
        factory: factory.into(),
        revision: "1".into(),
        kind,
        config_schema: schema,
        input_schema: None,
        output_schema: None,
        required_capabilities: Default::default(),
        dependencies,
    }
}
impl ModuleFactory for HttpResourceFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "resource.http",
            ModuleKind::Resource,
            json!({"type":"object","additionalProperties":false,"required":["base_url","methods"],"properties":{
                "base_url":{"type":"string","maxLength":16384},"methods":{"type":"array","minItems":1,"maxItems":5,"uniqueItems":true,"items":{"enum":["GET","POST","PUT","PATCH","DELETE"]}},
                "credential_refs":{"type":"array","maxItems":1024,"uniqueItems":true,"items":{"type":"string","minLength":1,"maxLength":128,"pattern":"^[A-Za-z0-9_]+$"}}
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
        let config: ResourceConfig = serde_json::from_value(value.clone())
            .map_err(|_| crate::composition("invalid HTTP resource"))?;
        let base = crate::http::connection::base(&config.base_url)?;
        let identity = serde_json::to_string(&(
            "http-resource-v1",
            nofy_agent_runtime::system::content_digest(value)?,
            &self.authority,
        ))
        .map_err(|e| crate::composition(e.to_string()))?;
        Ok(ModuleInstance::Resource(Arc::new(ResourceHandle::new(
            identity,
            Arc::new(HttpResource {
                config,
                base,
                credentials: self.credentials.clone(),
                client: Default::default(),
            }),
        )?)))
    }
}
#[derive(Clone, Deserialize)]
#[serde(deny_unknown_fields)]
struct ToolConfig {
    contract: ToolContract,
    path: String,
    method: Method,
    #[serde(default)]
    input: JsonBinding,
    #[serde(default)]
    credential_ref: Option<String>,
}
impl ModuleFactory for ConnectedHttpToolFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "tool.http_connected",
            ModuleKind::ToolPack,
            json!({"type":"object","additionalProperties":false,"required":["contract","path","method"],"properties":{
            "contract":config::contract_schema(),"path":{"type":"string","maxLength":16384},"method":{"enum":["GET","POST","PUT","PATCH","DELETE"]},
            "input":{"$ref":"#/$defs/binding"},"credential_ref":{"type":["string","null"],"maxLength":128}
        },"$defs":{"binding":config::binding_schema()}}),
            BTreeMap::from([("connection".into(), ModuleKind::Resource)]),
        )
    }
    fn build(
        &self,
        value: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        let config: ToolConfig = serde_json::from_value(value.clone())
            .map_err(|_| crate::composition("invalid connected HTTP tool"))?;
        config.contract.validate()?;
        config.input.validate()?;
        let Some(ModuleInstance::Resource(resource)) = dependencies.get("connection") else {
            return Err(crate::composition(
                "HTTP tool requires its connection resource",
            ));
        };
        let resource = resource
            .get::<HttpResource>()
            .ok_or_else(|| crate::composition("HTTP connection resource has another type"))?;
        crate::http::connection::endpoint(&resource.base, &config.path)?;
        if !resource.config.methods.contains(&config.method)
            || config
                .credential_ref
                .as_ref()
                .is_some_and(|r| !resource.config.credential_refs.contains(r))
        {
            return Err(crate::composition(
                "HTTP method or credential reference is not admitted by its resource",
            ));
        }
        let contract = config.contract.clone();
        Ok(ModuleInstance::ToolPack(crate::catalog(
            &contract,
            Arc::new(ConnectedDispatch { resource, config }),
        )?))
    }
}
struct ConnectedDispatch {
    resource: Arc<HttpResource>,
    config: ToolConfig,
}
#[async_trait::async_trait]
impl ToolDispatch for ConnectedDispatch {
    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        args: Value,
        context: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        let cancel = context
            .get::<nofy_tool_runtime::Cancellation>()
            .map(|c| c.0.clone())
            .unwrap_or_default();
        let operation = async {
            let connection = self.resource.client().await?;
            let factory = HttpToolFactory::new(
                "declarative-v1",
                BTreeMap::from([("bound".into(), connection)]),
            )
            .map_err(|_| crate::tool_error("http_connection", "HTTP connection cannot bind"))?;
            let config = HttpToolConfig {
                contract: self.config.contract.clone(),
                connection: "bound".into(),
                path: self.config.path.clone(),
                method: self.config.method.clone(),
                input: self.config.input.clone(),
                credential_ref: self.config.credential_ref.clone(),
            };
            let config = serde_json::to_value(config).map_err(|_| {
                crate::tool_error("http_connection", "HTTP configuration cannot serialize")
            })?;
            let ModuleInstance::ToolPack(catalog) = factory
                .build(&config, &Default::default())
                .map_err(|_| crate::tool_error("http_connection", "HTTP tool cannot bind"))?
            else {
                return Err(crate::tool_error(
                    "http_connection",
                    "HTTP tool binding type changed",
                ));
            };
            let dispatch = catalog
                .get(&self.config.contract.name)
                .ok_or_else(|| crate::tool_error("http_connection", "HTTP tool binding missing"))?
                .dispatch
                .clone();
            Ok::<_, ToolError>(dispatch.call(id, args, context).await)
        };
        match tokio::select! {biased;
            _=cancel.cancelled()=>Err(crate::tool_error("cancelled","HTTP tool cancelled")),
            result=tokio::time::timeout(Duration::from_millis(self.config.contract.timeout_ms),operation)=>result.unwrap_or_else(|_|Err(crate::tool_error("timeout","HTTP tool timed out"))),
        } {
            Ok(stream) => stream,
            Err(error) => nofy_tool_runtime::terminal_only(Err(error)),
        }
    }
}
