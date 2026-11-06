use super::*;
use nofy_tool_runtime::ToolCallContext;
use std::{collections::BTreeSet, sync::Arc};

pub(super) struct Session {
    pub connection: Arc<Connection>,
    pub state: tokio::sync::Mutex<State>,
}
pub(super) struct State {
    session: Option<String>,
    next_id: u64,
    usable: bool,
    changes: u64,
    pub server: Value,
}
impl Session {
    pub fn new(connection: Arc<Connection>) -> Self {
        Self {
            connection,
            state: tokio::sync::Mutex::new(State {
                session: None,
                next_id: 1,
                usable: true,
                changes: 0,
                server: Value::Null,
            }),
        }
    }
}
impl Drop for Session {
    fn drop(&mut self) {
        self.connection.close(self.state.get_mut().session.take());
    }
}

/// Dropping an outer Runtime future still issues a bounded, best-effort cancel.
/// A lost response never causes another tools/call POST.
struct RequestGuard {
    connection: Arc<Connection>,
    session: Option<String>,
    id: u64,
    context: ToolCallContext,
    pending: bool,
}
impl Drop for RequestGuard {
    fn drop(&mut self) {
        if self.pending {
            self.connection
                .cancel(self.id, self.session.take(), self.context.clone());
        }
    }
}
impl State {
    pub async fn initialize(
        &mut self,
        connection: &Arc<Connection>,
        context: &ToolCallContext,
        limit: usize,
    ) -> Result<(), ToolError> {
        let result = self
            .request(
                connection,
                "initialize",
                json!({
                    "protocolVersion":PROTOCOL,"capabilities":{},
                    "clientInfo":{"name":"nofy-agent-framework","version":env!("CARGO_PKG_VERSION")}
                }),
                context,
                limit,
            )
            .await?;
        if result.get("protocolVersion").and_then(Value::as_str) != Some(PROTOCOL)
            || !result
                .pointer("/capabilities/tools")
                .is_some_and(Value::is_object)
            || result
                .pointer("/serverInfo/name")
                .and_then(Value::as_str)
                .is_none_or(|v| v.is_empty())
            || !result
                .pointer("/serverInfo/version")
                .is_some_and(Value::is_string)
        {
            self.usable = false;
            return Err(protocol(
                "MCP initialize requires the supported version, tools capability and server identity",
            ));
        }
        self.server = result["serverInfo"].clone();
        // Server instructions are data, never implicitly installed as a Prompt.
        self.usable = false;
        connection
            .notify(
                &json!({"jsonrpc":"2.0","method":"notifications/initialized"}),
                self.session.as_deref(),
                context,
            )
            .await?;
        self.usable = true;
        Ok(())
    }
    pub async fn catalog(
        &mut self,
        connection: &Arc<Connection>,
        context: &ToolCallContext,
        config: &source::Config,
    ) -> Result<BTreeMap<String, Value>, ToolError> {
        let start = self.changes;
        let mut tools = BTreeMap::new();
        let mut cursors = BTreeSet::new();
        let mut cursor = None;
        let mut total = 0usize;
        for _ in 0..config.max_pages {
            let params = cursor
                .as_ref()
                .map_or_else(|| json!({}), |cursor: &String| json!({"cursor":cursor}));
            let result = self
                .request(
                    connection,
                    "tools/list",
                    params,
                    context,
                    config.max_catalog_bytes,
                )
                .await?;
            let page = result
                .get("tools")
                .and_then(Value::as_array)
                .ok_or_else(|| protocol("MCP tools/list requires a tools array"))?;
            for tool in page {
                let name = tool
                    .get("name")
                    .and_then(Value::as_str)
                    .filter(|name| {
                        !name.is_empty() && name.len() <= 128 && !name.chars().any(char::is_control)
                    })
                    .ok_or_else(|| protocol("MCP catalog has an invalid tool name"))?;
                total = total.saturating_add(
                    serde_json::to_vec(tool)
                        .map_err(|_| protocol("MCP catalog is not JSON"))?
                        .len(),
                );
                if total > config.max_catalog_bytes || tools.len() >= config.max_tools {
                    return Err(crate::tool_error(
                        "mcp_catalog_limit",
                        "MCP catalog exceeds configured byte/tool limits",
                    ));
                }
                if tools.insert(name.to_owned(), tool.clone()).is_some() {
                    return Err(protocol("MCP catalog repeats a tool name"));
                }
            }
            match result.get("nextCursor") {
                None | Some(Value::Null) => {
                    if self.changes != start {
                        return Err(crate::tool_error(
                            "mcp_catalog_changed",
                            "MCP catalog changed while it was being read",
                        ));
                    }
                    return Ok(tools);
                }
                Some(Value::String(next))
                    if !next.is_empty() && next.len() <= 4096 && cursors.insert(next.clone()) =>
                {
                    cursor = Some(next.clone())
                }
                _ => return Err(protocol("MCP pagination cursor is invalid or repeated")),
            }
        }
        Err(crate::tool_error(
            "mcp_catalog_limit",
            "MCP catalog exceeds configured page limit",
        ))
    }
    pub async fn request(
        &mut self,
        connection: &Arc<Connection>,
        method: &str,
        params: Value,
        context: &ToolCallContext,
        limit: usize,
    ) -> Result<Value, ToolError> {
        if !self.usable {
            return Err(protocol(
                "MCP session cannot be reused after an interrupted request; acquire a new snapshot",
            ));
        }
        let id = self.next_id;
        self.next_id = self
            .next_id
            .checked_add(1)
            .ok_or_else(|| protocol("MCP request ID exhausted"))?;
        self.usable = false;
        let mut guard = RequestGuard {
            connection: connection.clone(),
            session: self.session.clone(),
            id,
            context: context.clone(),
            pending: method != "initialize",
        };
        let message = json!({"jsonrpc":"2.0","id":id,"method":method,"params":params});
        if let Some(channel) = connection.channel() {
            channel.send(&message).await?;
            let mut received = 0usize;
            loop {
                let message = channel.receive(limit.saturating_sub(received)).await?;
                received = received.saturating_add(
                    serde_json::to_vec(&message)
                        .map_err(|_| protocol("MCP frame is not JSON"))?
                        .len(),
                );
                if received > limit {
                    return Err(crate::tool_error(
                        "output_limit",
                        "MCP response exceeds configured byte limit",
                    ));
                }
                if let Some(result) = self.message(connection, message, id, context).await? {
                    guard.pending = false;
                    self.usable = true;
                    return result;
                }
            }
        }
        let mut response = connection
            .post(&message, self.session.as_deref(), context)
            .await?;
        if let Some(header) = response.headers().get("mcp-session-id") {
            let session = header
                .to_str()
                .ok()
                .filter(|value| {
                    !value.is_empty()
                        && value.len() <= 4096
                        && value.bytes().all(|b| (0x21..=0x7e).contains(&b))
                })
                .ok_or_else(|| protocol("MCP session header is invalid"))?;
            if method == "initialize" {
                self.session = Some(session.into());
            } else if self.session.as_deref() != Some(session) {
                return Err(protocol("MCP server replaced the current session"));
            }
        }
        let content_type = response
            .headers()
            .get(reqwest::header::CONTENT_TYPE)
            .and_then(|value| value.to_str().ok())
            .unwrap_or("")
            .split(';')
            .next()
            .unwrap_or("")
            .trim()
            .to_ascii_lowercase();
        let sse = match content_type.as_str() {
            "application/json" => false,
            "text/event-stream" => true,
            _ => {
                return Err(protocol(
                    "MCP request response requires JSON or SSE content type",
                ));
            }
        };
        let mut bytes = Vec::new();
        let mut decoder = sse::Decoder::default();
        let mut received = 0usize;
        while let Some(chunk) = response
            .chunk()
            .await
            .map_err(|_| crate::tool_error("mcp_transport", "MCP response interrupted"))?
        {
            received = received.saturating_add(chunk.len());
            if received > limit {
                return Err(crate::tool_error(
                    "output_limit",
                    "MCP response exceeds configured byte limit",
                ));
            }
            if sse {
                for message in decoder.push(&chunk)? {
                    if let Some(result) = self.message(connection, message, id, context).await? {
                        guard.pending = false;
                        self.usable = true;
                        return result;
                    }
                }
            } else {
                bytes.extend_from_slice(&chunk);
            }
        }
        if !sse {
            let message =
                serde_json::from_slice(&bytes).map_err(|_| protocol("MCP response is not JSON"))?;
            if let Some(result) = self.message(connection, message, id, context).await? {
                guard.pending = false;
                self.usable = true;
                return result;
            }
        }
        Err(protocol(
            "MCP response ended without its matching JSON-RPC result",
        ))
    }
    async fn message(
        &mut self,
        connection: &Arc<Connection>,
        message: Value,
        id: u64,
        context: &ToolCallContext,
    ) -> Result<Option<Result<Value, ToolError>>, ToolError> {
        if !message.is_object() || message.get("jsonrpc").and_then(Value::as_str) != Some("2.0") {
            return Err(protocol("MCP message is not JSON-RPC 2.0"));
        }
        if let Some(method) = message.get("method") {
            let method = method
                .as_str()
                .ok_or_else(|| protocol("MCP method is not a string"))?;
            if message.get("result").is_some() || message.get("error").is_some() {
                return Err(protocol("MCP request/notification also contains a result"));
            }
            if let Some(server_id) = message.get("id") {
                if !(server_id.is_string()
                    || server_id.as_i64().is_some()
                    || server_id.as_u64().is_some())
                {
                    return Err(protocol("MCP server request ID is invalid"));
                }
                let reply = if method == "ping" {
                    json!({"jsonrpc":"2.0","id":server_id,"result":{}})
                } else {
                    json!({"jsonrpc":"2.0","id":server_id,"error":{"code":-32601,"message":"Client capability not negotiated"}})
                };
                connection
                    .notify(&reply, self.session.as_deref(), context)
                    .await?;
            } else if method == "notifications/tools/list_changed" {
                self.changes = self
                    .changes
                    .checked_add(1)
                    .ok_or_else(|| protocol("MCP catalog change counter exhausted"))?;
            }
            return Ok(None);
        }
        if message.get("id") != Some(&json!(id)) {
            return Err(protocol("MCP response ID differs from its request"));
        }
        match (message.get("result"), message.get("error")) {
            (Some(result), None) if result.is_object() => Ok(Some(Ok(result.clone()))),
            (None, Some(error))
                if error.get("code").and_then(Value::as_i64).is_some()
                    && error.get("message").is_some_and(Value::is_string) =>
            {
                Ok(Some(Err(crate::tool_error(
                    "mcp_rpc_error",
                    format!("MCP server reported protocol error {}", error["code"]),
                )
                .with_details(error.clone()))))
            }
            _ => Err(protocol(
                "MCP response requires one object result or valid error",
            )),
        }
    }
}
