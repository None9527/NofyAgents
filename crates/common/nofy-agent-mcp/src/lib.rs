use nofy_agent_client::{
    Engine, Envelope, Error, Operation, SCHEMA_JSON, SCHEMAS, Toolset, nearest, refs_from_input,
    schema,
};
use rmcp::{
    ErrorData as McpError, RoleServer, ServerHandler, ServiceExt, model::*, service::RequestContext,
};
use serde_json::{Value, json};
use std::{borrow::Cow, net::SocketAddr, sync::Arc};
use tokio_util::sync::CancellationToken;

#[derive(Clone)]
pub struct NofyServer {
    engine: Engine,
    http_identity: bool,
}
impl NofyServer {
    pub fn stdio(engine: Engine) -> Self {
        let visibility = engine.operation_view().toolset().mcp();
        Self {
            engine: engine.with_operation_view(visibility),
            http_identity: false,
        }
    }
    pub fn http(mut engine: Engine) -> Self {
        engine.client = engine.client.without_token();
        let visibility = engine.operation_view().toolset().mcp();
        Self {
            engine: engine.with_operation_view(visibility),
            http_identity: true,
        }
    }
    fn engine(&self, context: &RequestContext<RoleServer>) -> Result<Engine, McpError> {
        if !self.http_identity {
            return Ok(self.engine.clone());
        }
        let token = context
            .extensions
            .get::<axum::http::request::Parts>()
            .and_then(|p| bearer(&p.headers))
            .ok_or_else(|| {
                McpError::invalid_request("request Bearer identity is required", None)
            })?;
        Ok(self.engine.for_token(token))
    }
}
fn no_cursor(request: Option<PaginatedRequestParams>) -> Result<(), McpError> {
    if request.and_then(|r| r.cursor).is_some() {
        Err(McpError::invalid_params(
            "this list is returned in one complete page",
            None,
        ))
    } else {
        Ok(())
    }
}
fn protocol_error(e: Error) -> McpError {
    McpError::invalid_request(e.message, Some(json!({"code":e.code,"details":e.details})))
}
impl ServerHandler for NofyServer {
    fn supported_protocol_versions(&self) -> Cow<'static, [ProtocolVersion]> {
        Cow::Borrowed(ProtocolVersion::known_up_to(&ProtocolVersion::V_2025_11_25))
    }
    fn get_info(&self) -> ServerConfig {
        ServerConfig::new(ServerCapabilities::builder().enable_tools().enable_resources().build())
            .with_protocol_version(ProtocolVersion::V_2025_11_25)
            .with_server_info(Implementation::new("nofy-agent-mcp",env!("CARGO_PKG_VERSION")))
            .with_instructions("Start with nofy_describe to see this connection's toolset and nofy_schema for an operation's exact contract. Check business state and receipts separately from request acceptance. Cancelling an MCP request stops waiting; inspect its original business IDs before retrying.")
    }
    async fn initialize(
        &self,
        request: InitializeRequestParams,
        context: RequestContext<RoleServer>,
    ) -> Result<InitializeResult, McpError> {
        self.engine(&context)?
            .client
            .authorize()
            .await
            .map_err(protocol_error)?;
        context.peer.set_peer_info(request.clone());
        self.negotiate_initialize(&request)
    }
    async fn list_tools(
        &self,
        request: Option<PaginatedRequestParams>,
        context: RequestContext<RoleServer>,
    ) -> Result<ListToolsResult, McpError> {
        no_cursor(request)?;
        let engine = self.engine(&context)?;
        let mut tools = vec![];
        for operation in engine.operation_view().operations() {
            let input = schema(&operation.input_schema)
                .map_err(protocol_error)?
                .as_object()
                .cloned()
                .ok_or_else(|| McpError::internal_error("tool input Schema missing", None))?;
            let output = schema(&operation.output_schema)
                .map_err(protocol_error)?
                .as_object()
                .cloned()
                .ok_or_else(|| McpError::internal_error("tool output Schema missing", None))?;
            let read_only = readonly(&operation.operation);
            tools.push(
                Tool::new_with_raw(
                    operation.mcp_tool.clone().unwrap_or_default(),
                    Some(tool_description(operation).into()),
                    input,
                )
                .with_raw_output_schema(Arc::new(output))
                .with_annotations(
                    ToolAnnotations::new()
                        .read_only(read_only)
                        .destructive(!read_only)
                        .idempotent(idempotent(operation)),
                ),
            );
        }
        Ok(ListToolsResult::with_all_items(tools))
    }
    async fn call_tool(
        &self,
        request: CallToolRequestParams,
        context: RequestContext<RoleServer>,
    ) -> Result<CallToolResponse, McpError> {
        let engine = self.engine(&context)?;
        let view = engine.operation_view();
        let operation = view
            .operations()
            .find(|o| o.mcp_tool.as_deref() == Some(request.name.as_ref()))
            .ok_or_else(|| {
                let suggestions = nearest(
                    request.name.as_ref(),
                    view.operations().filter_map(|o| o.mcp_tool.as_deref()),
                );
                let message = if suggestions.is_empty() {
                    format!(
                        "Nofy tool `{}` is unavailable in the `{}` toolset",
                        request.name,
                        view.toolset().name()
                    )
                } else {
                    format!(
                        "unknown Nofy tool `{}`; did you mean {}?",
                        request.name,
                        suggestions.join(" or ")
                    )
                };
                McpError::invalid_params(
                    message,
                    Some(json!({"toolset":view.toolset().name(),"suggestions":suggestions})),
                )
            })?;
        let input = Value::Object(request.arguments.unwrap_or_default());
        let output = tokio::select! {biased;
            _ = context.ct.cancelled() => {
                let read_only = readonly(&operation.operation);
                let mut e = Error::new(
                    if read_only { "cancelled" } else { "result_unconfirmed" },
                    "request wait cancelled; inspect the original business IDs before retrying",
                );
                e.unconfirmed = !read_only;
                e.refs = refs_from_input(&input);
                Envelope::failed(&operation.operation, e)
            },
            output=engine.execute(&operation.operation,input.clone())=>output,
        };
        let error = output.is_error();
        let value = serde_json::to_value(output)
            .map_err(|_| McpError::internal_error("result serialization failed", None))?;
        Ok(if error {
            CallToolResult::structured_error(value)
        } else {
            CallToolResult::structured(value)
        }
        .into())
    }
    async fn list_resources(
        &self,
        request: Option<PaginatedRequestParams>,
        context: RequestContext<RoleServer>,
    ) -> Result<ListResourcesResult, McpError> {
        no_cursor(request)?;
        let engine = self.engine(&context)?;
        let mut resources = vec![
            Resource::new("nofy://schemas/operations", "Nofy operation catalog")
                .with_mime_type("application/json"),
        ];
        if engine.operation_view().toolset() == Toolset::Full {
            resources.push(
                Resource::new("nofy://schemas/contracts", "Nofy operation contracts")
                    .with_mime_type("application/schema+json"),
            );
        }
        if engine.require_operation("project.template").is_ok() {
            resources.push(
                Resource::new("nofy://presets/index", "Registered source presets")
                    .with_mime_type("application/json"),
            );
        }
        Ok(ListResourcesResult::with_all_items(resources))
    }
    async fn list_resource_templates(
        &self,
        request: Option<PaginatedRequestParams>,
        context: RequestContext<RoleServer>,
    ) -> Result<ListResourceTemplatesResult, McpError> {
        no_cursor(request)?;
        let engine = self.engine(&context)?;
        let mut templates = vec![];
        if engine.require_operation("agent.export").is_ok() {
            templates.push(
                ResourceTemplate::new(
                    "nofy://projects/{project_id}/source",
                    "Managed source project",
                )
                .with_mime_type("application/json"),
            );
        }
        if engine.require_operation("project.pack").is_ok() {
            templates.push(
                ResourceTemplate::new(
                    "nofy://source-archives/{digest}{?offset,limit}",
                    "Source archive chunk (base64 with offset, total, eof)",
                )
                .with_mime_type("application/json"),
            );
        }
        Ok(ListResourceTemplatesResult::with_all_items(templates))
    }
    async fn read_resource(
        &self,
        request: ReadResourceRequestParams,
        context: RequestContext<RoleServer>,
    ) -> Result<ReadResourceResponse, McpError> {
        let engine = self.engine(&context)?;
        let text = read_resource(&engine, &request.uri)
            .await
            .map_err(protocol_error)?;
        Ok(ReadResourceResult::new(vec![
            ResourceContents::text(text, request.uri).with_mime_type("application/json"),
        ])
        .into())
    }
}
fn bearer(headers: &axum::http::HeaderMap) -> Option<String> {
    headers
        .get(axum::http::header::AUTHORIZATION)?
        .to_str()
        .ok()?
        .strip_prefix("Bearer ")
        .filter(|s| !s.is_empty() && !s.chars().any(char::is_whitespace))
        .map(str::to_owned)
}
async fn read_resource(engine: &Engine, uri: &str) -> nofy_agent_client::Result<String> {
    match uri {
        "nofy://schemas/contracts" if engine.operation_view().toolset() == Toolset::Full => {
            return Ok(SCHEMA_JSON.into());
        }
        "nofy://schemas/operations" => return Ok(engine.operation_view().catalog().to_string()),
        "nofy://presets/index" => {
            engine.require_operation("project.template")?;
            return Ok(match &engine.templates {
                Some(r) => r.list()?.to_string(),
                None => engine.client.get(&["api", "v1", "presets"]).await?.text,
            });
        }
        _ => {}
    }
    let url =
        url::Url::parse(uri).map_err(|_| Error::new("local_input", "invalid Nofy resource URI"))?;
    if url.scheme() != "nofy"
        || url.fragment().is_some()
        || !url.username().is_empty()
        || url.password().is_some()
    {
        return Err(Error::new("local_input", "unsupported resource URI"));
    }
    let parts: Vec<_> = url.path_segments().into_iter().flatten().collect();
    match url.host_str() {
        Some("projects") if parts.len() == 2 && parts[1] == "source" && url.query().is_none() => {
            engine.require_operation("agent.export")?;
            Ok(engine
                .client
                .get(&["api", "v1", "projects", parts[0], "source"])
                .await?
                .text)
        }
        Some("source-archives") if parts.len() == 1 => {
            engine.require_operation("project.pack")?;
            let mut query = vec![];
            let mut seen = std::collections::BTreeSet::new();
            for (k, v) in url.query_pairs() {
                if !matches!(k.as_ref(), "offset" | "limit")
                    || !seen.insert(k.to_string())
                    || v.parse::<u64>().is_err()
                {
                    return Err(Error::new(
                        "local_input",
                        "archive resource accepts unique numeric offset and limit",
                    ));
                }
                query.push((k.into_owned(), v.into_owned()));
            }
            Ok(engine
                .client
                .request(
                    "GET",
                    &["api", "v1", "source-archives", parts[0], "chunks"],
                    &query,
                    None,
                )
                .await?
                .text)
        }
        _ => Err(Error::new(
            "local_input",
            "resource URI is outside registered schemas, projects and archives",
        )),
    }
}
pub async fn serve_stdio(engine: Engine) -> anyhow::Result<()> {
    engine.client.authorize().await?;
    let running = NofyServer::stdio(engine)
        .serve(rmcp::transport::stdio())
        .await?;
    running.waiting().await?;
    Ok(())
}
#[derive(Clone)]
struct HttpAuth {
    engine: Engine,
}
async fn authenticate(
    axum::extract::State(state): axum::extract::State<HttpAuth>,
    request: axum::extract::Request,
    next: axum::middleware::Next,
) -> axum::response::Response {
    use axum::response::IntoResponse;
    let Some(token) = bearer(request.headers()) else {
        return (
            axum::http::StatusCode::UNAUTHORIZED,
            [("www-authenticate", "Bearer")],
            axum::Json(json!({"error":"Bearer token required"})),
        )
            .into_response();
    };
    match state.engine.for_token(token).client.authorize().await {
        Ok(_) => next.run(request).await,
        Err(e) => {
            let status = if e.code == "unauthorized" {
                axum::http::StatusCode::UNAUTHORIZED
            } else if e.code == "forbidden" {
                axum::http::StatusCode::FORBIDDEN
            } else {
                axum::http::StatusCode::SERVICE_UNAVAILABLE
            };
            (
                status,
                axum::Json(json!({"error":{"code":e.code,"message":e.message}})),
            )
                .into_response()
        }
    }
}
pub fn http_router(
    mut engine: Engine,
    origins: Vec<String>,
    hosts: Vec<String>,
    cancel: CancellationToken,
) -> axum::Router {
    use rmcp::transport::streamable_http_server::{
        StreamableHttpServerConfig, StreamableHttpService, session::local::LocalSessionManager,
    };
    engine.client = engine.client.without_token();
    let server = NofyServer::http(engine.clone());
    let mut config = StreamableHttpServerConfig::default()
        .with_legacy_session_mode(false)
        .with_allowed_origins(origins)
        .enforce_origin_validation()
        .with_cancellation_token(cancel);
    config.max_request_body_bytes = 32 * 1024 * 1024;
    if !hosts.is_empty() {
        config = config.with_allowed_hosts(hosts);
    }
    let service = StreamableHttpService::new(
        move || Ok(server.clone()),
        Arc::new(LocalSessionManager::default()),
        config,
    );
    axum::Router::new()
        .nest_service("/mcp", service)
        .layer(axum::middleware::from_fn_with_state(
            HttpAuth { engine },
            authenticate,
        ))
}
pub fn check_listen(address: SocketAddr, allow_non_loopback: bool) -> Result<(), String> {
    if address.ip().is_loopback() {
        return Ok(());
    }
    if !allow_non_loopback {
        return Err(format!(
            "refusing to listen on non-loopback address {address}: the MCP HTTP server is plain HTTP \
             with Bearer tokens; pass --allow-non-loopback only behind TLS termination or a tunnel"
        ));
    }
    eprintln!(
        "warning: MCP HTTP server listening on non-loopback {address} without TLS; \
         access tokens are sent in clear text unless a TLS proxy or tunnel protects this port"
    );
    Ok(())
}

fn effective_allowed_hosts(listen: SocketAddr, hosts: Vec<String>) -> Vec<String> {
    if !hosts.is_empty() {
        return hosts;
    }
    let mut defaults = vec![listen.to_string()];
    if listen.port() == 80 {
        defaults.push(match listen.ip() {
            std::net::IpAddr::V4(ip) => ip.to_string(),
            std::net::IpAddr::V6(ip) => format!("[{ip}]"),
        });
    }
    if listen.ip().is_loopback() {
        defaults.push(format!("localhost:{}", listen.port()));
        if listen.port() == 80 {
            defaults.push("localhost".into());
        }
    }
    defaults
}

pub async fn serve_http(
    engine: Engine,
    listen: SocketAddr,
    allow_non_loopback: bool,
    origins: Vec<String>,
    hosts: Vec<String>,
) -> anyhow::Result<()> {
    check_listen(listen, allow_non_loopback).map_err(anyhow::Error::msg)?;
    let listener = tokio::net::TcpListener::bind(listen).await?;
    let bound = listener.local_addr()?;
    let hosts = effective_allowed_hosts(bound, hosts);
    let cancel = CancellationToken::new();
    let shutdown = cancel.clone();
    eprintln!("Nofy MCP listening at http://{bound}/mcp");
    axum::serve(listener, http_router(engine, origins, hosts, cancel))
        .with_graceful_shutdown(async move {
            let _ = nofy_tty_utils::shutdown_signal().await;
            shutdown.cancel();
        })
        .await?;
    Ok(())
}
/// What a client sees for a tool: the operation's own one-sentence summary, then
/// the shared reading instructions. The summary comes from the catalog, so every
/// tool is described by what it does and not by a generic note.
fn tool_description(operation: &Operation) -> String {
    format!(
        "{} Operation: {}. Query nofy_schema first for the contract and assembly guide: it gives dependencies, slots, prerequisites, examples, next steps and recovery. Read the result status and the business execution state separately; the native DTO is in data.native_json and exact control identifiers are in refs.",
        operation.summary, operation.operation
    )
}
/// Whether repeating the exact call changes nothing more: reads, and writes that
/// carry a caller-chosen `command_id`. The kernel replays the recorded outcome of
/// a command it has already seen instead of executing it again.
fn idempotent(operation: &Operation) -> bool {
    fn carries_command_id(node: &Value, depth: usize) -> bool {
        let Some(map) = node.as_object() else {
            return false;
        };
        if map
            .get("properties")
            .and_then(Value::as_object)
            .is_some_and(|p| p.contains_key("command_id"))
        {
            return true;
        }
        if depth > 4 {
            return false;
        }
        if let Some(target) = map
            .get("$ref")
            .and_then(Value::as_str)
            .and_then(|r| r.strip_prefix("#/$defs/"))
            && carries_command_id(&SCHEMAS["$defs"][target], depth + 1)
        {
            return true;
        }
        ["allOf", "oneOf", "anyOf"].iter().any(|key| {
            map.get(*key)
                .and_then(Value::as_array)
                .is_some_and(|items| items.iter().any(|item| carries_command_id(item, depth + 1)))
        })
    }
    readonly(&operation.operation)
        || schema(&operation.input_schema).is_ok_and(|s| carries_command_id(&s, 0))
}
/// Whether the operation only reads. The catalog's read-only scope hint
/// (`scope_hint == ["read"]`) must imply membership here; a test enforces it, so
/// a new read operation cannot silently be advertised as destructive.
const READ_ONLY: &[&str] = &[
    "describe",
    "schema",
    "project.template",
    "project.inspect",
    "project.build",
    "agent.list",
    "agent.inspect",
    "agent.export",
    "agent.build",
    "agent.plan",
    "agent.module.list",
    "agent.module.inspect",
    "repository.list",
    "repository.inspect",
    "module.list",
    "module.inspect",
    "module.export",
    "draft.get",
    "system.validate",
    "system.plan",
    "system.active",
    "system.history",
    "system.export",
    "system.programs",
    "run.list",
    "run.inspect",
    "work.list",
    "work.inspect",
    "work.targets",
    "work.wait",
    "run.events",
    "run.approvals",
    "run.recovery",
    "action.inspect",
    "session.list",
    "session.inspect",
    "session.turns",
    "session.route",
    "session.plan",
    "session.policy",
    "session.command",
    "session.binding",
    "resource.list",
    "resource.inspect",
    "budget.list",
    "credential.list",
    "command.analyze",
    "permission.grants",
    "session.tree",
];
fn readonly(op: &str) -> bool {
    READ_ONLY.contains(&op)
}

#[cfg(test)]
mod tests {
    use super::*;
    use nofy_agent_client::OPERATIONS;
    use std::collections::BTreeSet;

    fn tools() -> impl Iterator<Item = &'static Operation> {
        OPERATIONS.iter().filter(|o| o.mcp_tool.is_some())
    }

    #[test]
    fn read_only_annotation_follows_the_catalog_scopes() {
        for operation in OPERATIONS.iter() {
            let needs_only_read = operation.scope_hint == ["read"];
            if needs_only_read {
                assert!(
                    readonly(&operation.operation),
                    "{} needs only the read scope, so it must be advertised as read-only",
                    operation.operation
                );
            }
            if readonly(&operation.operation) {
                assert!(
                    !operation
                        .scope_hint
                        .iter()
                        .any(|s| matches!(s.as_str(), "edit" | "publish" | "execute")),
                    "{} is advertised as read-only but needs {:?}",
                    operation.operation,
                    operation.scope_hint
                );
            }
        }
    }

    #[test]
    fn read_only_list_names_only_real_operations() {
        let known: BTreeSet<_> = OPERATIONS.iter().map(|o| o.operation.as_str()).collect();
        for name in READ_ONLY {
            assert!(
                known.contains(name),
                "READ_ONLY lists unknown operation {name}"
            );
        }
        assert_eq!(
            READ_ONLY.iter().collect::<BTreeSet<_>>().len(),
            READ_ONLY.len(),
            "READ_ONLY lists an operation twice"
        );
    }

    #[test]
    fn every_tool_is_described_by_its_own_english_summary() {
        let mut seen = BTreeSet::new();
        for operation in tools() {
            let description = tool_description(operation);
            assert!(
                !operation.summary.trim().is_empty(),
                "{} has no summary",
                operation.operation
            );
            assert!(
                seen.insert(operation.summary.as_str()),
                "{} shares its summary with another operation",
                operation.operation
            );
            assert!(
                !description
                    .chars()
                    .any(|c| ('\u{4e00}'..='\u{9fff}').contains(&c)),
                "{} description is not English",
                operation.operation
            );
        }
    }

    #[test]
    fn replayed_commands_are_idempotent_and_other_writes_are_not() {
        let mut replayable = Vec::new();
        for operation in tools() {
            let carries = operation
                .input_schema
                .rsplit('/')
                .next()
                .is_some_and(|name| {
                    SCHEMAS["$defs"][name]
                        .to_string()
                        .contains("\"command_id\"")
                });
            if idempotent(operation) {
                assert!(
                    readonly(&operation.operation) || carries,
                    "{} is advertised as idempotent but is neither a read nor takes a command_id",
                    operation.operation
                );
            }
            if !readonly(&operation.operation) && carries && operation.scope_hint != ["read"] {
                replayable.push(operation.operation.as_str());
                assert!(
                    idempotent(operation),
                    "{} takes a command_id",
                    operation.operation
                );
            }
        }
        assert!(
            replayable.contains(&"run.cancel") && replayable.contains(&"session.start"),
            "{replayable:?}"
        );
        assert!(!idempotent(
            OPERATIONS
                .iter()
                .find(|o| o.operation == "agent.module.set")
                .unwrap()
        ));
    }

    #[test]
    fn only_secret_writes_are_missing_from_mcp() {
        let missing: Vec<_> = OPERATIONS
            .iter()
            .filter(|o| o.mcp_tool.is_none())
            .map(|o| o.operation.as_str())
            .collect();
        assert_eq!(missing, ["credential.put", "credential.delete"]);
    }

    #[test]
    fn every_tool_publishes_resolvable_input_and_output_schemas() {
        for operation in tools() {
            for reference in [&operation.input_schema, &operation.output_schema] {
                let schema = schema(reference)
                    .unwrap_or_else(|e| panic!("{}: {reference}: {e}", operation.operation));
                assert!(schema.is_object(), "{}: {reference}", operation.operation);
            }
        }
    }

    #[test]
    fn loopback_listen_is_allowed_and_non_loopback_requires_opt_in() {
        for loopback in ["127.0.0.1:7332", "[::1]:7332", "127.0.0.2:1"] {
            assert!(check_listen(loopback.parse().unwrap(), false).is_ok());
        }
        for exposed in ["0.0.0.0:7332", "[::]:7332", "192.168.1.5:7332"] {
            let address = exposed.parse().unwrap();
            assert!(check_listen(address, false).is_err(), "{exposed}");
            assert!(check_listen(address, true).is_ok(), "{exposed}");
        }
    }

    #[test]
    fn empty_allowed_hosts_defaults_to_the_listening_address() {
        assert_eq!(
            effective_allowed_hosts("127.0.0.1:7332".parse().unwrap(), vec![]),
            vec!["127.0.0.1:7332", "localhost:7332"]
        );
        assert_eq!(
            effective_allowed_hosts("[::1]:7332".parse().unwrap(), vec![]),
            vec!["[::1]:7332", "localhost:7332"]
        );
        assert_eq!(
            effective_allowed_hosts("192.168.1.5:7332".parse().unwrap(), vec![]),
            vec!["192.168.1.5:7332"]
        );
        assert_eq!(
            effective_allowed_hosts(
                "127.0.0.1:7332".parse().unwrap(),
                vec!["mcp.example.com".into()]
            ),
            vec!["mcp.example.com"]
        );
    }

    #[tokio::test]
    async fn default_allowed_hosts_rejects_mismatched_host_headers_against_dns_rebinding() {
        let auth_listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let auth_addr = auth_listener.local_addr().unwrap();
        let auth_app = axum::Router::new().fallback(|| async {
            (
                axum::http::StatusCode::OK,
                axum::Json(json!({"scopes":["read"]})),
            )
        });
        let auth_server = tokio::spawn(async move {
            axum::serve(auth_listener, auth_app).await.unwrap();
        });
        let client = nofy_agent_client::KernelClient::new(
            &format!("http://{auth_addr}"),
            None,
            std::time::Duration::from_secs(5),
        )
        .unwrap();
        let engine = Engine::new(client);

        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let bound = listener.local_addr().unwrap();
        let hosts = effective_allowed_hosts(bound, vec![]);
        let cancel = CancellationToken::new();
        let router = http_router(engine, vec![], hosts, cancel.clone());
        let mcp_server = tokio::spawn(async move {
            axum::serve(listener, router).await.unwrap();
        });

        let http = reqwest::Client::new();
        let url = format!("http://{bound}/mcp");
        let rebount = http
            .post(&url)
            .bearer_auth("test-token")
            .header(reqwest::header::HOST, "attacker.example")
            .json(&json!({}))
            .send()
            .await
            .unwrap();
        assert_eq!(rebount.status(), reqwest::StatusCode::FORBIDDEN);

        let wrong_port = http
            .post(&url)
            .bearer_auth("test-token")
            .header(reqwest::header::HOST, "127.0.0.1:1")
            .json(&json!({}))
            .send()
            .await
            .unwrap();
        assert_eq!(wrong_port.status(), reqwest::StatusCode::FORBIDDEN);

        let matched = http
            .post(&url)
            .bearer_auth("test-token")
            .header(reqwest::header::HOST, bound.to_string())
            .json(&json!({}))
            .send()
            .await
            .unwrap();
        assert_ne!(matched.status(), reqwest::StatusCode::FORBIDDEN);

        cancel.cancel();
        mcp_server.abort();
        auth_server.abort();
    }
}
