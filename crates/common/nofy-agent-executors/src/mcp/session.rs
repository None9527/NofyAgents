use super::*;
use nofy_tool_runtime::ToolCallContext;
use std::{collections::BTreeSet, sync::Arc};

pub(super) struct Session {
    pub connection: Arc<Connection>,
    state: tokio::sync::Mutex<State>,
    stdio_io: tokio::sync::Mutex<()>,
    reconnect: tokio::sync::Mutex<()>,
}

struct State {
    session: Option<String>,
    next_id: u64,
    initialized: bool,
    stdio_usable: bool,
    changes: u64,
    close_context: Option<ToolCallContext>,
    server: Value,
}

impl Session {
    pub fn new(connection: Arc<Connection>) -> Self {
        Self {
            connection,
            state: tokio::sync::Mutex::new(State {
                session: None,
                next_id: 1,
                initialized: false,
                stdio_usable: true,
                changes: 0,
                close_context: None,
                server: Value::Null,
            }),
            stdio_io: tokio::sync::Mutex::new(()),
            reconnect: tokio::sync::Mutex::new(()),
        }
    }

    pub async fn server_info(&self) -> Value {
        self.state.lock().await.server.clone()
    }

    async fn allocate_id(
        &self,
        context: &ToolCallContext,
    ) -> Result<(u64, Option<String>), ToolError> {
        let mut state = self.state.lock().await;
        let id = state.next_id;
        state.next_id = state
            .next_id
            .checked_add(1)
            .ok_or_else(|| protocol("MCP request ID exhausted"))?;
        state.close_context = Some(context.clone());
        Ok((id, state.session.clone()))
    }

    async fn invalidate_http_session(&self, used_session: Option<&str>, send_close: bool) {
        let (stale, close_context) = {
            let mut state = self.state.lock().await;
            if state.session.as_deref() != used_session {
                return;
            }
            state.initialized = false;
            (state.session.take(), state.close_context.clone())
        };
        if send_close && stale.is_some() {
            self.connection.close(stale, close_context);
        }
    }

    pub async fn initialize(
        &self,
        context: &ToolCallContext,
        limit: usize,
    ) -> Result<(), ToolError> {
        let _reconnect = self.reconnect.lock().await;
        if self.state.lock().await.initialized {
            return Ok(());
        }
        let (result, new_session) = self
            .exchange(
                "initialize",
                json!({
                    "protocolVersion": PROTOCOL,
                    "capabilities": {},
                    "clientInfo": {
                        "name": "nofy-agent-framework",
                        "version": env!("CARGO_PKG_VERSION")
                    }
                }),
                None,
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
            if new_session.is_some() {
                self.connection.close(new_session, Some(context.clone()));
            }
            if self.connection.channel().is_some() {
                self.state.lock().await.stdio_usable = false;
            }
            return Err(protocol(
                "MCP initialize requires the supported version, tools capability and server identity",
            ));
        }
        let server = result["serverInfo"].clone();
        // Server instructions are data, never implicitly installed as a Prompt.
        if let Err(error) = self
            .connection
            .notify(
                &json!({"jsonrpc": "2.0", "method": "notifications/initialized"}),
                new_session.as_deref(),
                context,
            )
            .await
        {
            if new_session.is_some() {
                self.connection.close(new_session, Some(context.clone()));
            }
            if self.connection.channel().is_some() {
                self.state.lock().await.stdio_usable = false;
            }
            return Err(error);
        }
        let mut state = self.state.lock().await;
        state.session = new_session;
        state.server = server;
        state.initialized = true;
        state.close_context = Some(context.clone());
        Ok(())
    }

    async fn ensure_initialized(
        &self,
        context: &ToolCallContext,
        limit: usize,
    ) -> Result<(), ToolError> {
        let (initialized, is_stdio, stdio_usable) = {
            let state = self.state.lock().await;
            (
                state.initialized,
                self.connection.channel().is_some(),
                state.stdio_usable,
            )
        };
        if is_stdio {
            if !stdio_usable {
                return Err(protocol(
                    "MCP session cannot be reused after an interrupted request; acquire a new snapshot",
                ));
            }
            return Ok(());
        }
        if !initialized {
            self.initialize(context, limit).await?;
        }
        Ok(())
    }

    pub async fn catalog(
        &self,
        context: &ToolCallContext,
        config: &source::Config,
    ) -> Result<BTreeMap<String, Value>, ToolError> {
        self.ensure_initialized(context, config.max_catalog_bytes)
            .await?;
        let start = self.state.lock().await.changes;
        let mut tools = BTreeMap::new();
        let mut cursors = BTreeSet::new();
        let mut cursor = None;
        let mut total = 0usize;
        for _ in 0..config.max_pages {
            let params = cursor
                .as_ref()
                .map_or_else(|| json!({}), |cursor: &String| json!({"cursor": cursor}));
            let result = self
                .request("tools/list", params, context, config.max_catalog_bytes)
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
                    if self.state.lock().await.changes != start {
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
        &self,
        method: &str,
        params: Value,
        context: &ToolCallContext,
        limit: usize,
    ) -> Result<Value, ToolError> {
        self.ensure_initialized(context, limit).await?;
        let session = {
            let mut state = self.state.lock().await;
            state.close_context = Some(context.clone());
            state.session.clone()
        };
        let (value, _) = self
            .exchange(method, params, session, context, limit)
            .await?;
        Ok(value)
    }

    async fn exchange(
        &self,
        method: &str,
        params: Value,
        session_override: Option<String>,
        context: &ToolCallContext,
        limit: usize,
    ) -> Result<(Value, Option<String>), ToolError> {
        if let Some(channel) = self.connection.channel() {
            let _stdio = self.stdio_io.lock().await;
            let id = {
                let mut state = self.state.lock().await;
                if !state.stdio_usable {
                    return Err(protocol(
                        "MCP session cannot be reused after an interrupted request; acquire a new snapshot",
                    ));
                }
                let id = state.next_id;
                state.next_id = state
                    .next_id
                    .checked_add(1)
                    .ok_or_else(|| protocol("MCP request ID exhausted"))?;
                state.stdio_usable = false;
                state.close_context = Some(context.clone());
                id
            };
            let mut guard = RequestGuard {
                connection: self.connection.clone(),
                session: None,
                id,
                context: context.clone(),
                pending: method != "initialize",
            };
            let message = json!({"jsonrpc": "2.0", "id": id, "method": method, "params": params});
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
                if let Some(result) = self.message(message, id, None, context).await? {
                    guard.pending = false;
                    self.state.lock().await.stdio_usable = true;
                    return result.map(|value| (value, None));
                }
            }
        }

        let (id, current_session) = self.allocate_id(context).await?;
        let active_session = if method == "initialize" {
            None
        } else {
            session_override.or(current_session)
        };
        let mut guard = RequestGuard {
            connection: self.connection.clone(),
            session: active_session.clone(),
            id,
            context: context.clone(),
            pending: method != "initialize",
        };
        let message = json!({"jsonrpc": "2.0", "id": id, "method": method, "params": params});
        let mut response = match self
            .connection
            .post(&message, active_session.as_deref(), context)
            .await
        {
            Ok(response) => response,
            Err(error) => {
                guard.pending = false;
                let code = error
                    .details
                    .as_ref()
                    .and_then(|d| d.get("code"))
                    .and_then(Value::as_str);
                if code == Some("mcp_session_expired") {
                    self.invalidate_http_session(active_session.as_deref(), false)
                        .await;
                } else if code == Some("mcp_transport") {
                    self.invalidate_http_session(active_session.as_deref(), true)
                        .await;
                }
                return Err(error);
            }
        };
        let mut discovered_session = active_session.clone();
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
                discovered_session = Some(session.into());
            } else if active_session.as_deref() != Some(session) {
                guard.pending = false;
                self.invalidate_http_session(active_session.as_deref(), true)
                    .await;
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
                guard.pending = false;
                return Err(protocol(
                    "MCP request response requires JSON or SSE content type",
                ));
            }
        };
        let mut bytes = Vec::new();
        let mut decoder = sse::Decoder::default();
        let mut received = 0usize;
        while let Some(chunk) = match response.chunk().await {
            Ok(chunk) => chunk,
            Err(_) => {
                guard.pending = false;
                self.invalidate_http_session(active_session.as_deref(), true)
                    .await;
                return Err(crate::tool_error(
                    "mcp_transport",
                    "MCP response interrupted",
                ));
            }
        } {
            received = received.saturating_add(chunk.len());
            if received > limit {
                guard.pending = false;
                return Err(crate::tool_error(
                    "output_limit",
                    "MCP response exceeds configured byte limit",
                ));
            }
            if sse {
                for message in decoder.push(&chunk)? {
                    if let Some(result) = self
                        .message(message, id, discovered_session.as_deref(), context)
                        .await?
                    {
                        guard.pending = false;
                        return result.map(|value| (value, discovered_session));
                    }
                }
            } else {
                bytes.extend_from_slice(&chunk);
            }
        }
        if !sse {
            let message =
                serde_json::from_slice(&bytes).map_err(|_| protocol("MCP response is not JSON"))?;
            if let Some(result) = self
                .message(message, id, discovered_session.as_deref(), context)
                .await?
            {
                guard.pending = false;
                return result.map(|value| (value, discovered_session));
            }
        }
        guard.pending = false;
        self.invalidate_http_session(active_session.as_deref(), true)
            .await;
        Err(protocol(
            "MCP response ended without its matching JSON-RPC result",
        ))
    }

    async fn message(
        &self,
        message: Value,
        id: u64,
        session: Option<&str>,
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
                    json!({"jsonrpc": "2.0", "id": server_id, "result": {}})
                } else {
                    json!({
                        "jsonrpc": "2.0",
                        "id": server_id,
                        "error": {"code": -32601, "message": "Client capability not negotiated"}
                    })
                };
                self.connection.notify(&reply, session, context).await?;
            } else if method == "notifications/tools/list_changed" {
                let mut state = self.state.lock().await;
                state.changes = state
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

impl Drop for Session {
    fn drop(&mut self) {
        let state = self.state.get_mut();
        let session = state.session.take();
        let context = state.close_context.take();
        self.connection.close(session, context);
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
