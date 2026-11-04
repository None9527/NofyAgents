use nofy_agent_client::{
    CATALOG, Engine, Envelope, Error, OPERATIONS, SCHEMA_JSON, refs_from_input, schema,
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
        Self {
            engine,
            http_identity: false,
        }
    }
    pub fn http(mut engine: Engine) -> Self {
        engine.client = engine.client.without_token();
        Self {
            engine,
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
            .with_instructions("Use nofy_describe and nofy_schema before editing. Targets are managed projects with explicit revision CAS, or explicit source collections. Native DTO JSON remains in native_json; refs preserve exact identities. Credentials are provisioned through the private CLI. MCP request cancellation only stops waiting; inspect original business IDs before retrying. Source archives are read in explicit offset/eof chunks.")
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
        self.engine(&context)?;
        let mut tools = vec![];
        for operation in OPERATIONS.iter().filter(|o| o.mcp_tool.is_some()) {
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
            let description = format!(
                "{}。操作 {}。先用 nofy_schema 查询工厂配置或操作契约；结果 status 与业务执行状态分别读取，原生 DTO 在 data.native_json，控制标识在 refs。",
                description(&operation.operation),
                operation.operation
            );
            tools.push(
                Tool::new_with_raw(
                    operation.mcp_tool.clone().unwrap_or_default(),
                    Some(description.into()),
                    input,
                )
                .with_raw_output_schema(Arc::new(output))
                .with_annotations(
                    ToolAnnotations::new()
                        .read_only(read_only)
                        .destructive(!read_only)
                        .idempotent(read_only),
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
        let operation = OPERATIONS
            .iter()
            .find(|o| o.mcp_tool.as_deref() == Some(request.name.as_ref()))
            .ok_or_else(|| McpError::invalid_params("unknown Nofy tool", None))?;
        let engine = self.engine(&context)?;
        let input = Value::Object(request.arguments.unwrap_or_default());
        let output = tokio::select! {biased;
            _=context.ct.cancelled()=>{let mut e=Error::new(if readonly(&operation.operation){"cancelled"}else{"result_unconfirmed"},"request wait cancelled; inspect the original business IDs before retrying");e.unconfirmed=!readonly(&operation.operation);e.refs=refs_from_input(&input);Envelope::failed(&operation.operation,e)},
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
        self.engine(&context)?;
        Ok(ListResourcesResult::with_all_items(vec![
            Resource::new("nofy://schemas/contracts", "Nofy operation contracts")
                .with_mime_type("application/schema+json"),
            Resource::new("nofy://schemas/operations", "Nofy operation catalog")
                .with_mime_type("application/json"),
            Resource::new("nofy://presets/index", "Registered source presets")
                .with_mime_type("application/json"),
        ]))
    }
    async fn list_resource_templates(
        &self,
        request: Option<PaginatedRequestParams>,
        context: RequestContext<RoleServer>,
    ) -> Result<ListResourceTemplatesResult, McpError> {
        no_cursor(request)?;
        self.engine(&context)?;
        Ok(ListResourceTemplatesResult::with_all_items(vec![
            ResourceTemplate::new(
                "nofy://projects/{project_id}/source",
                "Managed source project",
            )
            .with_mime_type("application/json"),
            ResourceTemplate::new(
                "nofy://source-archives/{digest}{?offset,limit}",
                "Source archive chunk (base64 with offset, total, eof)",
            )
            .with_mime_type("application/json"),
        ]))
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
        "nofy://schemas/contracts" => return Ok(SCHEMA_JSON.into()),
        "nofy://schemas/operations" => return Ok(CATALOG.to_string()),
        "nofy://presets/index" => {
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
            Ok(engine
                .client
                .get(&["api", "v1", "projects", parts[0], "source"])
                .await?
                .text)
        }
        Some("source-archives") if parts.len() == 1 => {
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
pub async fn serve_http(
    engine: Engine,
    listen: SocketAddr,
    origins: Vec<String>,
    hosts: Vec<String>,
) -> anyhow::Result<()> {
    let listener = tokio::net::TcpListener::bind(listen).await?;
    let cancel = CancellationToken::new();
    let shutdown = cancel.clone();
    eprintln!(
        "Nofy MCP listening at http://{}/mcp",
        listener.local_addr()?
    );
    axum::serve(listener, http_router(engine, origins, hosts, cancel))
        .with_graceful_shutdown(async move {
            let _ = tokio::signal::ctrl_c().await;
            shutdown.cancel();
        })
        .await?;
    Ok(())
}
fn readonly(op: &str) -> bool {
    matches!(
        op,
        "describe"
            | "schema"
            | "project.template"
            | "project.inspect"
            | "project.build"
            | "agent.list"
            | "agent.inspect"
            | "agent.export"
            | "agent.build"
            | "agent.plan"
            | "agent.module.list"
            | "agent.module.inspect"
            | "draft.get"
            | "system.validate"
            | "system.plan"
            | "system.active"
            | "system.history"
            | "system.export"
            | "system.programs"
            | "run.list"
            | "run.inspect"
            | "run.events"
            | "run.approvals"
            | "run.recovery"
            | "action.inspect"
            | "session.list"
            | "session.inspect"
            | "session.turns"
            | "session.route"
            | "session.plan"
            | "session.policy"
            | "session.command"
            | "session.binding"
            | "resource.list"
            | "resource.inspect"
            | "budget.list"
            | "credential.list"
    )
}
fn description(op: &str) -> &'static str {
    match op {
        "describe" => "发现内核权限、工厂、预设、操作与会话协议",
        "schema" => "查询操作输入输出或已安装工厂及配置派生依赖",
        "project.template" => "取得空工程或指定版本预设的完整源码集合",
        "project.inspect" => "检查源码工程并列出未绑定的模型和 Prompt",
        "project.build" | "agent.build" => "纯数据渲染部署声明，不执行工程脚本",
        "project.pack" => "登记仅含源码和依赖清单的归档，返回摘要和分块读取 URI",
        "agent.create" => "创建允许缺项的 Agent 声明和源码工程",
        "agent.module.add" | "agent.tool.add" => {
            "添加工厂配置、原生模块或发布闭包，连接依赖并挂入 Agent 插槽"
        }
        "agent.module.set" => "用 JSON Pointer 修改模块配置或明确绑定源码文件",
        "agent.module.bind" => "连接模块的有名依赖槽",
        "agent.module.detach" => "从 Agent 指定插槽解除引用",
        "agent.module.remove" => "移除没有使用者的模块；仍被引用时返回冲突",
        "agent.apply" => "构建、发布并按原 generation 激活；返回已完成阶段和原始回执",
        "session.start" => "按声明的 SessionPolicy 原子创建会话与首根运行",
        "session.turn" => "按原会话和运行版本接纳后继轮次，复用预算与恢复身份",
        "session.reconfigure" => "在已关闭且静止的边界切换冻结会话策略闭包",
        "run.start" => "通过内核统一执行路径提交持久运行",
        "run.events" => "按原游标读取事件，可有限等待；不取消业务运行",
        "run.control" => "提交原生命令，执行停驻、恢复、更新或效果核对",
        "run.cancel" => "用明确业务命令 ID 请求取消指定运行",
        "system.publish" => "校验并发布完整部署或指定版本的原生草稿",
        "system.apply" | "system.rollback" => "按原 generation 与固定 command_id 激活指定发布",
        _ if op.starts_with("session.") => "查询或控制内核持久会话；写操作携带固定命令与原会话版本",
        _ if op.starts_with("resource.") => "管理内核登记的资源，权限由内核裁决",
        _ => "通过统一开发协议操作声明、持久运行及控制面事实",
    }
}
