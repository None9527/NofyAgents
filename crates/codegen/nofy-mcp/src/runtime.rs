//! Optional connected-MCP adapter. The application owns connection lifecycle;
//! this source selects explicit admitted clients and pins them for a whole run.
use crate::servers::{McpClient, McpState};
use nofy_agent_runtime::{Error, RunContext, ToolCatalog, ToolEntry, ToolSnapshot, ToolSource};
use nofy_tool_runtime::{ToolCallContext, ToolDispatch, ToolStream, TypedToolOutput};
use std::sync::Arc;
use tokio::sync::Mutex;

/// Pure configuration factory over connections the host already admitted.
/// A client may select a subset, never introduce a new server command/URL.
pub struct McpToolSourceFactory {
    state: Arc<Mutex<McpState>>,
    admitted: std::collections::BTreeSet<String>,
    revision: String,
    epoch: String,
}
impl McpToolSourceFactory {
    pub fn new(
        state: Arc<Mutex<McpState>>,
        admitted: std::collections::BTreeSet<String>,
        revision: &str,
    ) -> Result<Self, Error> {
        if revision.trim().is_empty() || admitted.iter().any(|name| name.trim().is_empty()) {
            return Err(Error::Composition(
                "MCP admission requires nonempty revision/server names".into(),
            ));
        }
        let revision = serde_json::to_string(&(revision, &admitted))
            .map_err(|e| Error::Composition(e.to_string()))?;
        Ok(Self {
            state,
            admitted,
            revision,
            epoch: nofy_tool_protocol::ToolCallId::new_v7().to_string(),
        })
    }
}
impl nofy_agent_runtime::registry::ModuleFactory for McpToolSourceFactory {
    fn descriptor(&self) -> nofy_agent_runtime::registry::ModuleDescriptor {
        nofy_agent_runtime::registry::ModuleDescriptor {
            factory: "tool.mcp".into(),
            revision: self.revision.clone(),
            kind: nofy_agent_runtime::registry::ModuleKind::ToolSource,
            config_schema: serde_json::json!({"type":"object","additionalProperties":false,"required":["servers"],"properties":{"servers":{"type":"array","minItems":1,"uniqueItems":true,"items":{"type":"string","enum":self.admitted}}}}),
            input_schema: None,
            output_schema: None,
            dependencies: Default::default(),
            required_capabilities: Default::default(),
        }
    }
    fn build(
        &self,
        config: &serde_json::Value,
        _: &std::collections::BTreeMap<String, nofy_agent_runtime::registry::ModuleInstance>,
    ) -> Result<nofy_agent_runtime::registry::ModuleInstance, Error> {
        #[derive(serde::Deserialize)]
        #[serde(deny_unknown_fields)]
        struct Config {
            servers: Vec<String>,
        }
        let mut config: Config = serde_json::from_value(config.clone())
            .map_err(|e| Error::Composition(format!("tool.mcp: {e}")))?;
        config.servers.sort();
        if config.servers.is_empty()
            || config.servers.iter().any(|s| !self.admitted.contains(s))
            || config.servers.windows(2).any(|s| s[0] == s[1])
        {
            return Err(Error::Composition(
                "MCP config must select unique admitted servers".into(),
            ));
        }
        Ok(nofy_agent_runtime::registry::ModuleInstance::ToolSource(
            Arc::new(McpToolSource {
                state: self.state.clone(),
                servers: config.servers,
                epoch: self.epoch.clone(),
            }),
        ))
    }
}

pub struct McpToolSource {
    state: Arc<Mutex<McpState>>,
    servers: Vec<String>,
    epoch: String,
}
impl McpToolSource {
    pub fn new(state: Arc<Mutex<McpState>>, mut servers: Vec<String>) -> Result<Self, Error> {
        servers.sort();
        if servers.iter().any(String::is_empty) || servers.windows(2).any(|s| s[0] == s[1]) {
            return Err(Error::Composition(
                "MCP source requires unique nonempty server names".into(),
            ));
        }
        Ok(Self {
            state,
            servers,
            epoch: nofy_tool_protocol::ToolCallId::new_v7().to_string(),
        })
    }
}
struct BoundTool {
    client: Arc<McpClient>,
    raw_name: String,
}
#[async_trait::async_trait]
impl ToolDispatch for BoundTool {
    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        args: serde_json::Value,
        context: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        let result = async {
            if !args.is_object() {
                return Err(nofy_tool_runtime::ToolError::invalid_arguments(
                    "MCP arguments must be an object",
                ));
            }
            let operation = self.client.call_tool(&self.raw_name, args);
            let timeout =
                std::time::Duration::from_secs(self.client.tool_timeout_for(&self.raw_name));
            let result = tokio::time::timeout(timeout, operation)
                .await
                .map_err(|_| {
                    nofy_tool_runtime::ToolError::custom("mcp_timeout", "MCP tool timed out")
                })?
                .map_err(|e| nofy_tool_runtime::ToolError::custom("mcp_call", e.to_string()))?;
            let value = serde_json::to_value(&result)
                .map_err(|e| nofy_tool_runtime::ToolError::custom("mcp_output", e.to_string()))?;
            if result.is_error == Some(true) {
                return Err(nofy_tool_runtime::ToolError::custom(
                    "mcp_tool_error",
                    value.to_string(),
                ));
            }
            Ok(TypedToolOutput::from_value(id, value))
        };
        let result = if let Some(cancel) = context.get::<nofy_tool_runtime::Cancellation>() {
            tokio::select! {biased;
                _=cancel.0.cancelled()=>Err(nofy_tool_runtime::ToolError::custom("cancelled","MCP call cancelled")),
                result=result=>result,
            }
        } else {
            result.await
        };
        nofy_tool_runtime::terminal_only(result)
    }
}
#[async_trait::async_trait]
impl ToolSource for McpToolSource {
    async fn snapshot(&self, _: &RunContext) -> Result<ToolSnapshot, Error> {
        let clients = {
            let state = self.state.lock().await;
            self.servers
                .iter()
                .map(|name| {
                    state.get_client(name).cloned().ok_or_else(|| {
                        Error::Composition(format!("MCP client not admitted: {name}"))
                    })
                })
                .collect::<Result<Vec<_>, _>>()?
        };
        let mut catalog = ToolCatalog::new();
        let mut revisions = Vec::new();
        for client in clients {
            let service = client
                .ensure_initialized()
                .await
                .map_err(|e| Error::Composition(format!("MCP initialization failed: {e}")))?;
            let disabled = self
                .state
                .lock()
                .await
                .disabled_tools
                .get(client.server_name())
                .cloned()
                .unwrap_or_default();
            let mut cursor = None;
            let mut seen = std::collections::HashSet::new();
            loop {
                let page = service
                    .list_tools(Some(
                        crate::rmcp::model::PaginatedRequestParams::default()
                            .with_cursor(cursor.clone()),
                    ))
                    .await
                    .map_err(|e| Error::Composition(format!("MCP tools/list failed: {e}")))?;
                for tool in page.tools {
                    let meta = tool
                        .meta
                        .as_ref()
                        .and_then(|m| serde_json::to_value(m).ok());
                    let visible = meta
                        .as_ref()
                        .and_then(|m| m.pointer("/ui/visibility"))
                        .and_then(serde_json::Value::as_array)
                        .map(|values| values.iter().any(|v| v.as_str() == Some("model")))
                        .unwrap_or(true);
                    if !visible || disabled.contains(tool.name.as_ref()) {
                        continue;
                    }
                    let raw = tool.name.to_string();
                    catalog.insert(ToolEntry {
                        definition: nofy_tool_types::ToolDefinition::function(
                            format!("{}__{}", client.server_name(), raw),
                            tool.description.as_deref(),
                            serde_json::Value::Object((*tool.input_schema).clone()),
                        ),
                        dispatch: Arc::new(BoundTool {
                            client: client.clone(),
                            raw_name: raw,
                        }),
                    })?;
                }
                match page.next_cursor {
                    Some(next) if seen.insert(next.clone()) => cursor = Some(next),
                    Some(_) => {
                        return Err(Error::Composition(
                            "MCP tools/list repeated a cursor".into(),
                        ));
                    }
                    None => break,
                }
            }
            revisions.push((client.server_name().to_owned(), client.client_id()));
        }
        Ok(ToolSnapshot {
            revision: serde_json::to_string(&(&self.epoch, revisions))
                .map_err(|e| Error::Composition(e.to_string()))?,
            catalog,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::{Value, json};
    #[tokio::test]
    async fn configuration_factory_selects_only_admitted_servers_and_executes_real_transport() {
        use nofy_agent_runtime::registry::{ModuleFactory, ModuleInstance};
        let state = Arc::new(Mutex::new(McpState::new(vec![])));
        let factory = McpToolSourceFactory::new(
            state.clone(),
            std::collections::BTreeSet::from(["shop".into()]),
            "admission-v1",
        )
        .unwrap();
        let ModuleInstance::ToolSource(source) = factory
            .build(&json!({"servers":["shop"]}), &Default::default())
            .unwrap()
        else {
            panic!("source")
        };
        // Construction is pure: admission can exist before connection warm-up.
        assert!(state.lock().await.owned_clients.is_empty());
        for config in [
            json!({"servers":["other"]}),
            json!({"servers":["shop","shop"]}),
            json!({"servers":[]}),
            json!({"servers":["shop"],"command":"sh"}),
        ] {
            assert!(factory.build(&config, &Default::default()).is_err());
        }
        state
            .lock()
            .await
            .owned_clients
            .insert("shop".into(), client("configured"));
        let snapshot = source.snapshot(&RunContext::default()).await.unwrap();
        let output = snapshot
            .catalog
            .get("shop__lookup")
            .unwrap()
            .dispatch
            .call_terminal(
                nofy_tool_protocol::ToolId::new("shop__lookup").unwrap(),
                json!({}),
                ToolCallContext::default(),
            )
            .await
            .unwrap();
        assert_eq!(output.value["content"][0]["text"], "configured");
        assert_eq!(output.value["content"][1]["type"], "image");
    }
    struct Invoker(&'static str);
    #[async_trait::async_trait]
    impl crate::acp_transport::AcpReverseInvoker for Invoker {
        async fn invoke(
            &self,
            _: &str,
            message: Value,
            _: std::time::Duration,
        ) -> Result<Value, String> {
            let result = match message["method"].as_str().unwrap_or("") {
                "initialize" => {
                    json!({"protocolVersion":message["params"]["protocolVersion"],"capabilities":{"tools":{}},"serverInfo":{"name":"runtime-test","version":"1"}})
                }
                "tools/list" => json!({"tools":[
                    {"name":"lookup","description":"Lookup","inputSchema":{"type":"object"}},
                    {"name":"app","description":"App only","inputSchema":{"type":"object"},"_meta":{"ui":{"visibility":["app"]}}}
                ]}),
                "tools/call" => {
                    json!({"content":[{"type":"text","text":self.0},{"type":"image","mimeType":"image/png","data":"AA=="}],"isError":false})
                }
                _ => json!({}),
            };
            Ok(json!({"jsonrpc":"2.0","id":message["id"],"result":result}))
        }
    }
    fn client(label: &'static str) -> Arc<McpClient> {
        Arc::new(McpClient::new_acp(
            "shop".into(),
            label.into(),
            Arc::new(Invoker(label)),
            None,
            None,
        ))
    }
    #[tokio::test]
    async fn mcp_source_is_send_filters_visibility_and_pins_client_across_refresh() {
        let state = Arc::new(Mutex::new(McpState::new(vec![])));
        state
            .lock()
            .await
            .owned_clients
            .insert("shop".into(), client("old"));
        let source = Arc::new(McpToolSource::new(state.clone(), vec!["shop".into()]).unwrap());
        let source_copy = source.clone();
        let old = tokio::spawn(async move { source_copy.snapshot(&RunContext::default()).await })
            .await
            .unwrap()
            .unwrap();
        assert_eq!(old.catalog.names(), vec!["shop__lookup"]);
        let recreated = McpToolSource::new(state.clone(), vec!["shop".into()]).unwrap();
        assert_ne!(
            old.revision,
            recreated
                .snapshot(&RunContext::default())
                .await
                .unwrap()
                .revision,
            "a recreated source must not reuse an in-process client counter as durable identity"
        );

        state
            .lock()
            .await
            .owned_clients
            .insert("shop".into(), client("new"));
        let new = source.snapshot(&RunContext::default()).await.unwrap();
        assert_ne!(old.revision, new.revision);
        let result = old
            .catalog
            .get("shop__lookup")
            .unwrap()
            .dispatch
            .call_terminal(
                nofy_tool_protocol::ToolId::new("shop__lookup").unwrap(),
                json!({}),
                ToolCallContext::default(),
            )
            .await
            .unwrap();
        assert!(
            old.catalog
                .get("shop__lookup")
                .unwrap()
                .dispatch
                .call_terminal(
                    nofy_tool_protocol::ToolId::new("shop__lookup").unwrap(),
                    json!("invalid"),
                    ToolCallContext::default()
                )
                .await
                .is_err()
        );
        assert_eq!(result.value["content"][0]["text"], "old");
        assert_eq!(result.value["content"][1]["type"], "image");
        state
            .lock()
            .await
            .disabled_tools
            .entry("shop".into())
            .or_default()
            .insert("lookup".into());
        assert!(
            source
                .snapshot(&RunContext::default())
                .await
                .unwrap()
                .catalog
                .names()
                .is_empty()
        );
    }
    #[tokio::test]
    async fn unadmitted_connections_fail_before_any_mcp_call() {
        let source = McpToolSource::new(
            Arc::new(Mutex::new(McpState::new(vec![]))),
            vec!["missing".into()],
        )
        .unwrap();
        assert!(source.snapshot(&RunContext::default()).await.is_err());
    }
}
