//! Existing Linux session lifecycle and transports. No alternative unconfined path.
use super::super::tree::launch::GuestLaunch;
use super::*;
use crate::loader::{
    process_sessions::{self, Launch},
    process_tree,
};
use nofy_agent_executors::mcp::{Connection, StdioChannel, StdioProvider};
use nofy_agent_runtime::{RunContext, ToolCatalog, ToolEntry};
use tokio_util::sync::CancellationToken;

pub(crate) struct ProcessSession {
    config: Config,
    env: Arc<Environment>,
    artifact: Arc<ArtifactBundle>,
    limits: Arc<process_sessions::Limits>,
    directories: BTreeMap<String, Arc<crate::loader::directories::Directory>>,
    identity: String,
}

pub(super) fn session(
    config: Config,
    value: &Value,
    deps: &BTreeMap<String, ModuleInstance>,
) -> std::result::Result<ModuleInstance, Error> {
    let resource = |slot: &str| {
        let Some(ModuleInstance::Resource(r)) = deps.get(slot) else {
            return Err(error(format!("missing session resource {slot}")));
        };
        Ok(r)
    };
    let env = resource("environment")?
        .get::<Environment>()
        .ok_or_else(|| error("incompatible session environment"))?;
    let artifact = resource("artifact")?
        .get::<ArtifactBundle>()
        .ok_or_else(|| error("incompatible session artifact"))?;
    if !artifact.files.contains_key(&config.entrypoint) {
        return Err(error("session entrypoint missing from artifact"));
    }
    let limits = resource("limits")?
        .get::<process_sessions::Limits>()
        .ok_or_else(|| error("namespace limits resource required"))?;
    let mut directories = BTreeMap::new();
    for (alias, slot) in &config.directories {
        directories.insert(
            alias.clone(),
            resource(slot)?
                .get::<crate::loader::directories::Directory>()
                .ok_or_else(|| error("session directory resource required"))?,
        );
    }
    let launch = GuestLaunch::from_entry(
        &env.runtime,
        &config.entrypoint,
        &config.args,
        &config.directories,
    )
    .map_err(error)?;
    launch
        .preflight(
            &env.loader.private_root,
            &env.runtime,
            &artifact,
            &directories,
        )
        .map_err(error)?;
    let identities = deps
        .iter()
        .filter_map(|(k, v)| {
            if let ModuleInstance::Resource(r) = v {
                Some((k, r.identity()))
            } else {
                None
            }
        })
        .collect::<Vec<_>>();
    let identity = format!(
        "process-session-v1:{}",
        content_digest(&(value, identities))?
    );
    Ok(ModuleInstance::Resource(Arc::new(ResourceHandle::new(
        identity.clone(),
        Arc::new(ProcessSession {
            config,
            env,
            artifact,
            limits,
            directories,
            identity,
        }),
    )?)))
}

pub(super) fn terminal(
    value: &Value,
    deps: &BTreeMap<String, ModuleInstance>,
) -> std::result::Result<ModuleInstance, Error> {
    let Some(ModuleInstance::Resource(handle)) = deps.get("session") else {
        return Err(error("terminal requires a session resource"));
    };
    let session = handle
        .get::<ProcessSession>()
        .ok_or_else(|| error("incompatible terminal resource"))?;
    let name = value["name"].as_str().unwrap_or("terminal");
    let mut catalog = ToolCatalog::new();
    catalog.insert(ToolEntry{definition:nofy_tool_types::ToolDefinition::function(name,Some(value["description"].as_str().unwrap_or("Start, poll, write, resize or close a declared interactive process. Reuse start_id/command_id when querying an uncertain receipt.")),terminal_schema()),dispatch:Arc::new(TerminalDispatch(session))})?;
    Ok(ModuleInstance::ToolPack(catalog))
}

pub(super) fn stdio(
    _value: &Value,
    deps: &BTreeMap<String, ModuleInstance>,
) -> std::result::Result<ModuleInstance, Error> {
    let Some(ModuleInstance::Resource(handle)) = deps.get("session") else {
        return Err(error("stdio MCP requires a session resource"));
    };
    let session = handle
        .get::<ProcessSession>()
        .ok_or_else(|| error("incompatible stdio session"))?;
    if session.config.terminal {
        return Err(error("stdio MCP requires pipes, not PTY"));
    }
    let identity = format!("mcp-stdio-v1:{}", session.identity());
    Ok(ModuleInstance::Resource(Arc::new(ResourceHandle::new(
        identity,
        Arc::new(Connection::stdio(Arc::new(Provider(session)))),
    )?)))
}

impl ProcessSession {
    pub(crate) fn identity(&self) -> &str {
        &self.identity
    }
    pub(crate) fn manager(&self) -> &process_sessions::Manager {
        &self.env.loader.process_sessions
    }
    pub(crate) async fn start(&self, owner: &str, start_id: &str) -> Result<Value> {
        let loader = self.env.loader.clone();
        let artifact = self.artifact.clone();
        let runtime = self.env.runtime.clone();
        let directories = self.directories.clone();
        let config = self.config.clone();
        let permit = loader
            .preparation_work
            .clone()
            .acquire_owned()
            .await
            .map_err(error)
            .map_err(HostError::Runtime)?;
        let (helper, sandbox, hold, launch) = tokio::task::spawn_blocking(move || -> Result<_> {
            let _permit = permit;
            let lease = loader.cache.shared()?;
            let helper = loader.helper()?;
            match &runtime {
                launch::RuntimeSource::Locked(manifest) => {
                    loader.images.materialize(
                        manifest,
                        loader
                            .cache
                            .quarantined_bytes(lifecycle::CacheKind::Image)?,
                    )?;
                }
                launch::RuntimeSource::Local(local) => local.preflight(&loader.private_root)?,
                _ => {
                    return Err(HostError::Invalid(
                        "session requires a local or locked runtime".into(),
                    ));
                }
            }
            let actual = loader.artifacts.materialize(&artifact)?;
            let launch = GuestLaunch::from_entry(
                &runtime,
                &config.entrypoint,
                &config.args,
                &config.directories,
            )?;
            let mut sandbox =
                launch.preflight(&loader.private_root, &runtime, &artifact, &directories)?;
            if actual != sandbox.artifact {
                return Err(HostError::Invalid("session cache layout changed".into()));
            }
            let scratch = tree::launch::scratch(&loader.scratch)?;
            sandbox.root = scratch.path().join("root");
            std::fs::create_dir(&sandbox.root).map_err(storage::unavailable)?;
            for directory in directories.values() {
                directory.prepare()?;
            }
            sandbox.validate()?;
            Ok((
                helper,
                sandbox,
                lifecycle::CacheUse {
                    scratch,
                    _lease: lease,
                },
                launch,
            ))
        })
        .await
        .map_err(storage::unavailable)??;
        self.manager()
            .start(
                owner,
                &self.identity,
                start_id,
                Launch {
                    helper,
                    profile: process_tree::Bootstrap {
                        parent_pid: std::process::id(),
                        program: launch.program,
                        arguments: launch.arguments,
                        environment: launch.environment,
                        cwd: "/nofy/scratch".into(),
                        sandbox: Some(sandbox),
                        session: None,
                    },
                    timeout: Duration::from_millis(self.config.timeout_ms),
                    output_limit: self.config.max_output_bytes,
                    terminal: self.config.terminal,
                    rows: self.config.rows,
                    columns: self.config.columns,
                },
                (*self.limits).clone(),
                hold,
            )
            .await
    }
    pub(crate) async fn operation(&self, owner: &str, args: &Value) -> Result<Value> {
        let text = |key: &str| {
            args.get(key)
                .and_then(Value::as_str)
                .ok_or_else(|| HostError::Invalid(format!("missing terminal {key}")))
        };
        let op = text("op")?;
        if op == "start" {
            return self.start(owner, text("start_id")?).await;
        }
        let id = text("session_id")?;
        let manager = self.manager();
        let resource = self.identity();
        match op {
            "poll" => {
                let stdout = args["stdout_cursor"].as_u64().unwrap_or(0);
                let stderr = args["stderr_cursor"].as_u64().unwrap_or(0);
                let limit = args["limit"].as_u64().unwrap_or(65536) as usize;
                let view = manager.poll(id, owner, resource, stdout, stderr, limit)?;
                if args["wait_ms"].as_u64().unwrap_or(0) > 0
                    && !view["eof"].as_bool().unwrap_or(true)
                {
                    manager
                        .wait(
                            id,
                            owner,
                            resource,
                            view["revision"].as_u64().unwrap_or(0),
                            args["wait_ms"].as_u64().unwrap_or(0),
                        )
                        .await?;
                }
                manager.poll(id, owner, resource, stdout, stderr, limit)
            }
            "write" => {
                manager
                    .write(
                        id,
                        owner,
                        resource,
                        text("command_id")?,
                        args["text"].as_str().unwrap_or("").as_bytes().to_vec(),
                        args["eof"].as_bool().unwrap_or(false),
                    )
                    .await
            }
            "resize" => {
                manager
                    .resize(
                        id,
                        owner,
                        resource,
                        args["rows"]
                            .as_u64()
                            .and_then(|v| v.try_into().ok())
                            .ok_or_else(|| HostError::Invalid("missing rows".into()))?,
                        args["columns"]
                            .as_u64()
                            .and_then(|v| v.try_into().ok())
                            .ok_or_else(|| HostError::Invalid("missing columns".into()))?,
                    )
                    .await
            }
            "close" => manager.close(id, owner, resource).await,
            _ => Err(HostError::Invalid("unknown terminal operation".into())),
        }
    }
}

struct TerminalDispatch(Arc<ProcessSession>);
#[async_trait::async_trait]
impl ToolDispatch for TerminalDispatch {
    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        args: Value,
        context: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        let result = async {
            nofy_agent_runtime::settings::validate_json_value(&terminal_schema(), &args)
                .map_err(tool_error)?;
            let run = context
                .get::<RunContext>()
                .ok_or_else(|| tool_error("terminal requires an owning run"))?;
            let value = self
                .0
                .operation(&format!("thread:{}", run.thread_id), &args)
                .await
                .map_err(tool_error)?;
            Ok(TypedToolOutput::from_value(id, value))
        }
        .await;
        nofy_tool_runtime::terminal_only(result)
    }
}

struct Provider(Arc<ProcessSession>);
#[async_trait::async_trait]
impl StdioProvider for Provider {
    async fn open(
        &self,
        _: &ToolCallContext,
    ) -> std::result::Result<Arc<dyn StdioChannel>, ToolError> {
        let start_id = nofy_tool_protocol::ToolCallId::new_v7().to_string();
        let owner = format!("mcp:{start_id}");
        let started = self.0.start(&owner, &start_id).await.map_err(tool_error)?;
        let id = started["session_id"]
            .as_str()
            .ok_or_else(|| tool_error("missing stdio receipt"))?
            .to_string();
        Ok(Arc::new(Channel {
            resource: self.0.clone(),
            owner,
            id,
            cursor: tokio::sync::Mutex::new((0, Vec::new())),
            closed: CancellationToken::new(),
        }))
    }
}
struct Channel {
    resource: Arc<ProcessSession>,
    owner: String,
    id: String,
    cursor: tokio::sync::Mutex<(u64, Vec<u8>)>,
    closed: CancellationToken,
}
#[async_trait::async_trait]
impl StdioChannel for Channel {
    async fn send(&self, message: &Value) -> std::result::Result<(), ToolError> {
        if self.closed.is_cancelled() {
            return Err(tool_error("MCP stdio channel closed"));
        }
        let mut bytes = serde_json::to_vec(message).map_err(tool_error)?;
        bytes.push(b'\n');
        let receipt = self
            .resource
            .manager()
            .write(
                &self.id,
                &self.owner,
                self.resource.identity(),
                nofy_tool_protocol::ToolCallId::new_v7().as_ref(),
                bytes,
                false,
            )
            .await
            .map_err(tool_error)?;
        if receipt.pointer("/receipt/state").and_then(Value::as_str) != Some("committed") {
            return Err(tool_error(
                "MCP frame delivery is uncertain; do not resend automatically",
            ));
        }
        Ok(())
    }
    async fn receive(&self, limit: usize) -> std::result::Result<Value, ToolError> {
        let mut cursor = self.cursor.lock().await;
        loop {
            if let Some(end) = cursor.1.iter().position(|b| *b == b'\n') {
                if end > limit {
                    return Err(tool_error("MCP stdio frame exceeds response limit"));
                }
                let frame: Vec<_> = cursor.1.drain(..=end).collect();
                if frame[..end].iter().all(u8::is_ascii_whitespace) {
                    continue;
                }
                return serde_json::from_slice(&frame).map_err(|_| {
                    tool_error(
                        "MCP stdio emitted a non-JSON frame; stdout must contain protocol only",
                    )
                });
            }
            if cursor.1.len() > limit {
                return Err(tool_error("MCP stdio frame exceeds response limit"));
            }
            let view = self
                .resource
                .manager()
                .poll(
                    &self.id,
                    &self.owner,
                    self.resource.identity(),
                    cursor.0,
                    0,
                    65536,
                )
                .map_err(tool_error)?;
            if view
                .pointer("/stdout/dropped_before")
                .and_then(Value::as_u64)
                .unwrap_or(0)
                > cursor.0
            {
                return Err(tool_error(
                    "MCP stdio output overran its retained stream; session is unusable",
                ));
            }
            use base64::Engine;
            let bytes = base64::engine::general_purpose::STANDARD
                .decode(view["stdout"]["data_base64"].as_str().unwrap_or(""))
                .map_err(tool_error)?;
            cursor.0 = view["stdout"]["next_cursor"]
                .as_u64()
                .ok_or_else(|| tool_error("invalid stdio cursor"))?;
            cursor.1.extend(bytes);
            if cursor.1.contains(&b'\n') {
                continue;
            }
            if view["eof"].as_bool() == Some(true) {
                return Err(tool_error(format!(
                    "MCP stdio ended (code {}): {}",
                    view["exit_code"],
                    view["stderr"]["text"].as_str().unwrap_or("")
                )));
            }
            tokio::select! {_=self.closed.cancelled()=>return Err(tool_error("MCP stdio closed")),r=self.resource.manager().wait(&self.id,&self.owner,self.resource.identity(),view["revision"].as_u64().unwrap_or(0),30000)=>r.map_err(tool_error)?}
        }
    }
    fn close(&self) {
        self.closed.cancel();
        let resource = self.resource.clone();
        let owner = self.owner.clone();
        let id = self.id.clone();
        if let Ok(runtime) = tokio::runtime::Handle::try_current() {
            runtime.spawn(async move {
                let _ = resource
                    .manager()
                    .close(&id, &owner, resource.identity())
                    .await;
            });
        }
    }
}
impl Drop for Channel {
    fn drop(&mut self) {
        self.close();
    }
}
