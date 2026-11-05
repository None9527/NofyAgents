use super::*;
use crate::config::ToolContract;
use nofy_agent_runtime::{RunContext, ToolCatalog, ToolEntry, ToolSnapshot, ToolSource};
use nofy_tool_protocol::ToolId;
use nofy_tool_runtime::{ToolCallContext, ToolDispatch, ToolStream, TypedToolOutput};
use nofy_tool_types::ToolDefinition;
use serde::{Deserialize, Serialize};
use std::{collections::BTreeSet, sync::Arc, time::Duration};

pub struct ToolSourceFactory;
fn namespace() -> String {
    "mcp".into()
}
fn timeout() -> u64 {
    30_000
}
fn bytes() -> usize {
    1_048_576
}
fn catalog_bytes() -> usize {
    4_194_304
}
fn tools() -> usize {
    1024
}
fn pages() -> usize {
    64
}
#[derive(Clone, Deserialize, Serialize)]
#[serde(deny_unknown_fields)]
pub(super) struct Config {
    #[serde(default = "namespace")]
    namespace: String,
    #[serde(default)]
    allowed_tools: Option<BTreeSet<String>>,
    #[serde(default)]
    aliases: BTreeMap<String, String>,
    #[serde(default = "timeout")]
    timeout_ms: u64,
    #[serde(default = "bytes")]
    max_input_bytes: usize,
    #[serde(default = "bytes")]
    max_output_bytes: usize,
    #[serde(default = "catalog_bytes")]
    pub max_catalog_bytes: usize,
    #[serde(default = "tools")]
    pub max_tools: usize,
    #[serde(default = "pages")]
    pub max_pages: usize,
}
impl Config {
    fn contract(&self, name: String, tool: &Value) -> Result<ToolContract, ToolError> {
        let input = tool
            .get("inputSchema")
            .filter(|schema| {
                schema.is_object() && schema.get("type").and_then(Value::as_str) == Some("object")
            })
            .ok_or_else(|| protocol("MCP tool requires an object inputSchema"))?;
        if let Some(description) = tool.get("description")
            && !description.is_string()
        {
            return Err(protocol("MCP tool description must be a string"));
        }
        if tool
            .pointer("/execution/taskSupport")
            .and_then(Value::as_str)
            == Some("required")
        {
            return Err(protocol("MCP tool requires unsupported task execution"));
        }
        if let Some(schema) = tool.get("outputSchema") {
            if !schema.is_object() || schema.get("type").and_then(Value::as_str) != Some("object") {
                return Err(protocol("MCP outputSchema must describe an object"));
            }
            nofy_agent_runtime::settings::validate_json_schema(schema).map_err(|_| {
                protocol("MCP outputSchema is invalid or references an external resource")
            })?;
        }
        let contract = ToolContract {
            name,
            description: tool
                .get("description")
                .and_then(Value::as_str)
                .unwrap_or("")
                .into(),
            effect: Default::default(),
            input_schema: input.clone(),
            output_schema: json!({}),
            output_pointer: None,
            timeout_ms: self.timeout_ms,
            max_input_bytes: self.max_input_bytes,
            max_output_bytes: self.max_output_bytes,
        };
        contract
            .validate()
            .map_err(|_| protocol("MCP inputSchema or local tool binding is invalid"))?;
        Ok(contract)
    }
}
impl ModuleFactory for ToolSourceFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        descriptor(
            "tool_source.mcp",
            ModuleKind::ToolSource,
            json!({"type":"object","additionalProperties":false,"properties":{
                "namespace":{"type":"string","minLength":1,"maxLength":64,"pattern":"^[A-Za-z0-9_-]+$"},
                "allowed_tools":{"type":["array","null"],"maxItems":1024,"uniqueItems":true,"items":{"type":"string","minLength":1,"maxLength":128}},
                "aliases":{"type":"object","maxProperties":1024,"propertyNames":{"minLength":1,"maxLength":128},"additionalProperties":{"type":"string","minLength":1,"maxLength":128,"pattern":"^[A-Za-z0-9_-]+$"}},
                "timeout_ms":{"type":"integer","minimum":1,"maximum":600000},
                "max_input_bytes":{"type":"integer","minimum":1,"maximum":16777216},
                "max_output_bytes":{"type":"integer","minimum":1,"maximum":16777216},
                "max_catalog_bytes":{"type":"integer","minimum":1,"maximum":16777216},
                "max_tools":{"type":"integer","minimum":1,"maximum":1024},
                "max_pages":{"type":"integer","minimum":1,"maximum":1024}
            }}),
            BTreeMap::from([("connection".into(), ModuleKind::Resource)]),
        )
    }
    fn build(
        &self,
        value: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        let config: Config = serde_json::from_value(value.clone())
            .map_err(|_| crate::composition("invalid MCP source"))?;
        let Some(ModuleInstance::Resource(handle)) = dependencies.get("connection") else {
            return Err(crate::composition(
                "MCP source requires its connection resource",
            ));
        };
        let connection = handle.get::<Connection>().ok_or_else(|| {
            crate::composition("MCP source connection has a different resource type")
        })?;
        let identity =
            nofy_agent_runtime::system::content_digest(&(REVISION, handle.identity(), &config))?;
        Ok(ModuleInstance::ToolSource(Arc::new(Source {
            config,
            connection,
            identity,
        })))
    }
}
struct Source {
    config: Config,
    connection: Arc<Connection>,
    identity: String,
}
#[async_trait::async_trait]
impl ToolSource for Source {
    async fn snapshot(&self, context: &RunContext) -> Result<ToolSnapshot, Error> {
        let call_context = nofy_agent_runtime::tools::call_context(
            &format!("mcp_catalog_{}", self.identity),
            context,
        )?;
        nofy_agent_runtime::governance::await_resource(context, async {
            tokio::time::timeout(
                Duration::from_millis(self.config.timeout_ms),
                self.discover(&call_context),
            )
            .await
            .unwrap_or_else(|_| Err(crate::tool_error("timeout", "MCP discovery timed out")))
            .map_err(|e| Error::Tool(e.to_string()))
        })
        .await
    }
}
impl Source {
    async fn discover(&self, context: &ToolCallContext) -> Result<ToolSnapshot, ToolError> {
        let session = Arc::new(session::Session::new(self.connection.open(context).await?));
        let mut state = session.state.lock().await;
        state
            .initialize(&session.connection, context, self.config.max_catalog_bytes)
            .await?;
        let tools = state
            .catalog(&session.connection, context, &self.config)
            .await?;
        let catalog_digest = digest(&tools)?;
        let revision = digest(&(REVISION, &self.identity, &state.server, &catalog_digest))?;
        if let Some(allowed) = &self.config.allowed_tools
            && allowed.iter().any(|name| !tools.contains_key(name))
        {
            return Err(protocol(
                "MCP catalog is missing an explicitly allowed tool",
            ));
        }
        let mut catalog = ToolCatalog::new();
        for (remote_name, tool) in &tools {
            if self
                .config
                .allowed_tools
                .as_ref()
                .is_some_and(|allowed| !allowed.contains(remote_name))
            {
                continue;
            }
            let local_name = format!(
                "{}_{}",
                self.config.namespace,
                self.config.aliases.get(remote_name).unwrap_or(remote_name)
            );
            let contract = self.config.contract(local_name, tool)?;
            catalog
                .insert(ToolEntry {
                    definition: ToolDefinition::function(
                        &contract.name,
                        Some(&contract.description),
                        contract.input_schema.clone(),
                    ),
                    dispatch: Arc::new(Dispatch {
                        contract,
                        remote_name: remote_name.clone(),
                        config: self.config.clone(),
                        session: session.clone(),
                        catalog_digest: catalog_digest.clone(),
                        output_schema: tool.get("outputSchema").cloned(),
                    }),
                })
                .map_err(|_| protocol("MCP tool names collide or require explicit aliases"))?;
        }
        drop(state);
        Ok(ToolSnapshot { revision, catalog })
    }
}
struct Dispatch {
    contract: ToolContract,
    remote_name: String,
    config: Config,
    session: Arc<session::Session>,
    catalog_digest: String,
    output_schema: Option<Value>,
}
#[async_trait::async_trait]
impl ToolDispatch for Dispatch {
    async fn call(
        &self,
        id: ToolId,
        args: Value,
        context: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        let cancel = context
            .get::<nofy_tool_runtime::Cancellation>()
            .map(|c| c.0.clone())
            .unwrap_or_default();
        let operation = async {
            if id.as_str() != self.contract.name {
                return Err(protocol("MCP call differs from its local catalog binding"));
            }
            crate::validate_input(&self.contract, &args)?;
            let mut state = self.session.state.lock().await;
            let current = state
                .catalog(&self.session.connection, &context, &self.config)
                .await?;
            if digest(&current)? != self.catalog_digest {
                return Err(crate::tool_error(
                    "mcp_catalog_changed",
                    "MCP catalog differs from the admitted snapshot; call was not sent",
                ));
            }
            let value = state
                .request(
                    &self.session.connection,
                    "tools/call",
                    json!({"name":self.remote_name,"arguments":args}),
                    &context,
                    self.config.max_output_bytes,
                )
                .await?;
            validate_result(&value, self.output_schema.as_ref())?;
            if value.get("isError").and_then(Value::as_bool) == Some(true) {
                let detail = serde_json::to_string(&value)
                    .map_err(|_| protocol("MCP error result is not JSON"))?;
                return Err(crate::tool_error(
                    "mcp_tool_error",
                    format!("MCP tool failed: {detail}"),
                )
                .with_details(value));
            }
            Ok(TypedToolOutput::from_value(id, value))
        };
        let result = tokio::select! { biased;
            _ = cancel.cancelled() => Err(crate::tool_error("cancelled", "MCP tool cancelled")),
            result = tokio::time::timeout(Duration::from_millis(self.config.timeout_ms), operation) => result.unwrap_or_else(|_| Err(crate::tool_error("timeout", "MCP tool timed out"))),
        };
        nofy_tool_runtime::terminal_only(result)
    }
}
fn validate_result(value: &Value, schema: Option<&Value>) -> Result<(), ToolError> {
    let content = value
        .get("content")
        .and_then(Value::as_array)
        .ok_or_else(|| protocol("MCP tool result requires a content array"))?;
    for block in content {
        let valid = match block.get("type").and_then(Value::as_str) {
            Some("text") => block.get("text").is_some_and(Value::is_string),
            Some("image" | "audio") => {
                block.get("data").is_some_and(Value::is_string)
                    && block.get("mimeType").is_some_and(Value::is_string)
            }
            Some("resource") => block.get("resource").is_some_and(Value::is_object),
            Some("resource_link") => {
                block.get("uri").is_some_and(Value::is_string)
                    && block.get("name").is_some_and(Value::is_string)
            }
            _ => false,
        };
        if !valid {
            return Err(protocol(
                "MCP tool result contains an invalid content block",
            ));
        }
    }
    if value
        .get("isError")
        .is_some_and(|error| !error.is_boolean())
        || value
            .get("structuredContent")
            .is_some_and(|output| !output.is_object())
    {
        return Err(protocol("MCP result has invalid isError/structuredContent"));
    }
    if value.get("isError").and_then(Value::as_bool) != Some(true)
        && let Some(schema) = schema
    {
        let output = value
            .get("structuredContent")
            .ok_or_else(|| protocol("MCP result is missing declared structuredContent"))?;
        nofy_agent_runtime::settings::validate_json_value(schema, output)
            .map_err(|_| protocol("MCP structuredContent does not match outputSchema"))?;
    }
    Ok(())
}
