//! Shared work operations for embedded tools and authenticated transports.
use crate::{HostError, KernelHost, Result, auth::Scope};
use axum::{
    Json, Router,
    extract::{Path, State},
    http::HeaderMap,
    routing::post,
};
use nofy_agent_client::{operation, schema, validate};
use nofy_agent_runtime::{
    Error, RunContext, RunOutcome, ToolCatalog, ToolEntry,
    control::ControlPlane,
    durable::SqliteStore,
    events::RunLineage,
    program::{ProgramSnapshot, RunSnapshot},
    registry::{ModuleDescriptor, ModuleFactory, ModuleInstance, ModuleKind, ModuleRegistry},
    supervisor::{RunSupervisor, WorkCaller, WorkCommand, jobs::ManagedRunRequest},
    system::{ProgramDefinition, SystemBundle},
};
use nofy_tool_runtime::{
    ToolCallContext, ToolDispatch, ToolError, ToolStream, TypedToolOutput,
    dispatch::ApprovalEffect, terminal_only,
};
use nofy_tool_types::ToolDefinition;
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    sync::{Arc, OnceLock, Weak},
    time::Duration,
};
use tokio::sync::Notify;

const OPERATIONS: [&str; 6] = ["list", "inspect", "targets", "start", "wait", "control"];
const RUN_INSPECT: &str = "run.inspect";

pub(crate) struct WorkService {
    pub store: SqliteStore,
    pub background: OnceLock<Background>,
}

pub(crate) struct Background {
    pub control: ControlPlane,
    pub registry: Arc<ModuleRegistry>,
    pub supervisor: Arc<RunSupervisor>,
    pub loader: crate::loader::Loader,
    pub wake: Arc<Notify>,
}

pub(crate) struct Factory(pub Weak<WorkService>);

impl ModuleFactory for Factory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "tool.sdk_work".into(),
            revision: "1".into(),
            kind: ModuleKind::ToolPack,
            config_schema: json!({
                "type":"object",
                "additionalProperties":false,
                "properties":{"background_targets":{
                    "type":"array","maxItems":16,"uniqueItems":true,
                    "items":{"type":"string","minLength":1,"maxLength":256}
                }}
            }),
            input_schema: None,
            output_schema: None,
            dependencies: Default::default(),
            required_capabilities: Default::default(),
        }
    }

    fn build(
        &self,
        _: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> std::result::Result<ModuleInstance, Error> {
        let mut catalog = ToolCatalog::new();
        for tool in nofy_agent_runtime::tasks::declarative::attached_work_tools() {
            catalog.insert(tool)?;
        }
        for path in OPERATIONS.into_iter().chain([RUN_INSPECT]) {
            let (op, name) = if path == RUN_INSPECT {
                (RUN_INSPECT.to_owned(), "sdk_run_inspect".to_owned())
            } else {
                (format!("work.{path}"), format!("sdk_work_{path}"))
            };
            let descriptor = operation(&op).map_err(|e| Error::Composition(e.to_string()))?;
            let input =
                schema(&descriptor.input_schema).map_err(|e| Error::Composition(e.to_string()))?;
            catalog.insert(ToolEntry {
                definition: ToolDefinition::function(name, Some(&descriptor.summary), input),
                dispatch: Arc::new(Dispatch {
                    service: self.0.clone(),
                    path,
                }),
            })?;
        }
        Ok(ModuleInstance::ToolPack(catalog))
    }
}

struct Dispatch {
    service: Weak<WorkService>,
    path: &'static str,
}

#[async_trait::async_trait]
impl ToolDispatch for Dispatch {
    fn approval_effect(&self) -> ApprovalEffect {
        match self.path {
            "start" | "control" => ApprovalEffect::Unknown,
            _ => ApprovalEffect::ReadOnly,
        }
    }

    fn is_resumable(&self) -> bool {
        true
    }

    fn recovery_identity(&self) -> Option<String> {
        Some(format!("sdk-work-{}-v1", self.path))
    }

    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        args: Value,
        context: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        let result = async {
            let ctx = context.get::<RunContext>().ok_or(HostError::Forbidden)?;
            if ctx
                .capabilities
                .get::<RunLineage>()
                .is_some_and(|lineage| lineage.root_run_id != ctx.run_id)
            {
                return Err(HostError::Forbidden);
            }
            let service = self
                .service
                .upgrade()
                .ok_or_else(|| HostError::Unavailable("work service stopped".into()))?;
            let caller = WorkCaller::from_context(&ctx).ok_or(HostError::Forbidden)?;
            if self.path == RUN_INSPECT {
                service.inspect_run(args, &caller).await
            } else {
                service.execute(self.path, args, Some(&caller)).await
            }
        }
        .await;
        terminal_only(
            result
                .map(|v| TypedToolOutput::from_value(id, v))
                .map_err(|e: HostError| ToolError::custom("sdk_work", e.to_string())),
        )
    }
}

pub(crate) fn router() -> Router<KernelHost> {
    Router::new().route("/api/v1/work/{operation}", post(external))
}

async fn external(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(path): Path<String>,
    Json(args): Json<Value>,
) -> Result<Json<Value>> {
    host.auth.require(
        &headers,
        if matches!(path.as_str(), "start" | "control") {
            Scope::Execute
        } else {
            Scope::Read
        },
    )?;
    host.work.execute(&path, args, None).await.map(Json)
}

impl WorkService {
    async fn inspect_run(&self, args: Value, caller: &WorkCaller) -> Result<Value> {
        validate(RUN_INSPECT, &args).map_err(|e| HostError::Invalid(e.to_string()))?;
        let id = required(args["run_id"].as_str(), "run_id")?;
        if !self.store.work_scope_allows(caller.run_id(), id).await? {
            return Err(HostError::Forbidden);
        }
        let view = if args["view"] == "full" {
            crate::api::RunView::Full
        } else {
            crate::api::RunView::Status
        };
        crate::api::inspect_run(&self.store, id, view).await
    }

    fn background(&self) -> Result<&Background> {
        self.background
            .get()
            .ok_or_else(|| HostError::Unavailable("background work service unavailable".into()))
    }

    async fn execute(&self, path: &str, args: Value, proof: Option<&WorkCaller>) -> Result<Value> {
        if !OPERATIONS.contains(&path) {
            return Err(HostError::NotFound);
        }
        validate(&format!("work.{path}"), &args).map_err(|e| HostError::Invalid(e.to_string()))?;
        let caller = proof.map(WorkCaller::run_id);
        let explicit = args["session_id"].as_str();
        let own_session = match caller {
            Some(run) => self.store.work_session(run).await?,
            None => None,
        };
        if caller.is_some() && explicit.is_some() && explicit != own_session.as_deref() {
            return Err(HostError::Forbidden);
        }
        let session = explicit.or(own_session.as_deref());
        if let Some(session_id) = explicit
            && self.store.session(session_id).await?.is_none()
        {
            return Err(HostError::NotFound);
        }
        let work = args["work_id"].as_str();
        let run = args["run_id"].as_str();
        let limit = args["limit"].as_u64().unwrap_or(24) as usize;
        let after = args["after"].as_str().map(str::to_owned);
        let session_view = run.is_none()
            && work.is_none()
            && session.is_some()
            && (explicit.is_some()
                || args["view"] == "session"
                || matches!(path, "targets" | "start" | "wait"));
        let root = match (run, work, session_view) {
            (Some(id), _, _) => Some(self.store.work_root_run(id).await?),
            (_, Some(id), _) => Some(
                self.store
                    .locate_work(id)
                    .await?
                    .ok_or(HostError::NotFound)?,
            ),
            (_, _, false) => caller.map(str::to_owned),
            _ => None,
        };
        if let Some(root) = &root {
            if let Some(caller) = caller
                && !self.store.work_scope_allows(caller, root).await?
            {
                return Err(HostError::Forbidden);
            }
            if let Some(session_id) = explicit
                && self.store.work_session(root).await?.as_deref() != Some(session_id)
            {
                return Err(HostError::NotFound);
            }
        }
        match path {
            "list" if session_view => Ok(json!(
                self.store
                    .session_work_list(session.unwrap(), after, limit)
                    .await?
            )),
            "list" => Ok(json!(
                self.store
                    .work_list(
                        required(root.as_deref(), "run_id or session_id")?,
                        after,
                        limit
                    )
                    .await?
                    .ok_or(HostError::NotFound)?
            )),
            "inspect" => {
                let work = required(work, "work_id")?;
                let root = required(root.as_deref(), "run_id")?;
                let node = self
                    .store
                    .work_inspect(root, work)
                    .await?
                    .ok_or(HostError::NotFound)?;
                let include_result = args["include_result"] == true;
                let is_root = node.run_id == root;
                let workflow = node.kind == "workflow";
                let mut value = serde_json::to_value(node)
                    .map_err(|err| HostError::Unavailable(err.to_string()))?;
                if include_result
                    && is_root
                    && let Some(record) = self.store.execution_record(root).await?
                    && let Some(RunOutcome::Completed { output, .. }) = record.outcome
                {
                    let truncated = output.chars().count() > 16384;
                    value["result"] = json!({"output":output.chars().take(16384).collect::<String>(),"truncated":truncated});
                    if workflow
                        && !truncated
                        && let Ok(envelope) = serde_json::from_str::<Value>(&output)
                        && let Some(result) = envelope.get("value")
                    {
                        value["result"]["value"] = result.clone();
                    }
                }
                Ok(value)
            }
            "wait" => {
                let scope = if session_view {
                    session
                } else {
                    root.as_deref()
                };
                let scope = required(scope, "run_id or session_id")?;
                if !session_view && self.store.work_inspect(scope, scope).await?.is_none() {
                    return Err(HostError::NotFound);
                }
                let ids = args["work_ids"]
                    .as_array()
                    .into_iter()
                    .flatten()
                    .filter_map(Value::as_str)
                    .map(str::to_owned)
                    .collect();
                let timeout = Duration::from_millis(args["timeout_ms"].as_u64().unwrap_or(0));
                Ok(json!(
                    self.store
                        .wait_work(session_view, scope, after, ids, limit, timeout)
                        .await?
                ))
            }
            "targets" | "start" => {
                let Some(session) = session else {
                    if path == "targets" && caller.is_some() {
                        return Ok(json!({"background":[]}));
                    }
                    return Err(HostError::Invalid("session_id is required".into()));
                };
                self.background_operation(path, &args, session, proof).await
            }
            "control" => {
                let root = required(root.as_deref(), "run_id or work_id")?;
                let kind = args["action"].as_str().unwrap();
                if let Some(caller) = caller {
                    let node = self
                        .store
                        .work_inspect(root, root)
                        .await?
                        .ok_or(HostError::NotFound)?;
                    if caller == root || node.parent_work_id.is_none() || kind == "human" {
                        return Err(HostError::Forbidden);
                    }
                }
                let owner = self.store.work_session(root).await?;
                let scope = nofy_agent_runtime::system::content_digest(&(
                    if owner.is_some() { "session" } else { "root" },
                    owner.as_deref().unwrap_or(root),
                ))?;
                let action = if kind == "retry_model" {
                    let ticket = parse_json(args["ticket_json"].as_str(), "ticket_json")?
                        .ok_or_else(|| HostError::Invalid("ticket_json is required".into()))?;
                    json!({"kind":kind,"ticket":ticket})
                } else if kind == "human" {
                    let mut answer = parse_json(args["response_json"].as_str(), "response_json")?
                        .ok_or_else(|| {
                        HostError::Invalid("response_json is required".into())
                    })?;
                    answer
                        .as_object_mut()
                        .ok_or_else(|| {
                            HostError::Invalid("human response must be an object".into())
                        })?
                        .insert("kind".into(), json!("human"));
                    answer
                } else {
                    json!({"kind":kind})
                };
                let command: WorkCommand = serde_json::from_value(json!({
                    "work_id":work,"command_id":args["command_id"],
                    "expected_revision":args["expected_revision"],"action":action,
                }))
                .map_err(|e| HostError::Invalid(e.to_string()))?;
                let receipt = self
                    .store
                    .control_work(&scope, root, command, proof.cloned())
                    .await?;
                self.background()?.wake.notify_one();
                Ok(receipt)
            }
            _ => Err(HostError::NotFound),
        }
    }

    async fn background_operation(
        &self,
        path: &str,
        args: &Value,
        session: &str,
        proof: Option<&WorkCaller>,
    ) -> Result<Value> {
        let service = self.background()?;
        let origin = match proof.map(WorkCaller::run_id) {
            Some(run) => run.to_owned(),
            None => {
                let view = self
                    .store
                    .session(session)
                    .await?
                    .ok_or(HostError::NotFound)?;
                view.active_run_id.unwrap_or(view.session.root_run_id)
            }
        };
        let managed = self
            .store
            .managed_run(&origin)
            .await?
            .ok_or(HostError::NotFound)?;
        let release = managed.request.release;
        let bundle = service.control.export(&release).await?;
        let mut grants = granted_targets(&bundle, &managed.request.program);
        let live = self.store.live_execution(&origin).await?;
        if let Some(live) = &live {
            let effective = match &live.snapshot {
                RunSnapshot::Agent(snapshot)
                | RunSnapshot::Program(nofy_agent_runtime::program::ExecutionSnapshot {
                    program: ProgramSnapshot::Agent { snapshot },
                    ..
                }) => Some(snapshot),
                _ => None,
            };
            grants.retain(|target| {
                effective.is_some_and(|snapshot| {
                    snapshot.modules.iter().any(|module| {
                        module.definition.factory == "tool.sdk_work"
                            && snapshot
                                .agent
                                .tool_packs
                                .contains(&module.definition.reference)
                            && module.definition.config["background_targets"]
                                .as_array()
                                .is_some_and(|items| {
                                    items.iter().any(|value| value.as_str() == Some(target))
                                })
                    })
                })
            });
        }
        if path == "targets" {
            let targets = grants
                .into_iter()
                .filter_map(|program| {
                    let kind = program_kind(&bundle, program)?;
                    let parameters_schema =
                        if let Some(ProgramDefinition::Workflow { document, .. }) =
                            bundle.document.programs.get(program)
                        {
                            document
                                .workflows
                                .iter()
                                .find(|spec| spec.reference == document.entry)
                                .map(|spec| &spec.input_schema)
                        } else {
                            None
                        };
                    Some(json!({"program":program,"release":release,"kind":kind,
                        "accepts_message":kind=="agent","parameters_schema":parameters_schema}))
                })
                .collect::<Vec<_>>();
            return Ok(json!({"session_id":session,"background":targets}));
        }
        let program = required(args["program"].as_str(), "program")?;
        let kind = program_kind(&bundle, program).ok_or(HostError::Forbidden)?;
        if !grants.contains(&program) || args["release"] != release {
            return Err(HostError::Forbidden);
        }
        let text = args["text"].as_str();
        let parameters = args.get("parameters").cloned();
        if (kind == "agent") != text.is_some() || (kind == "agent" && parameters.is_some()) {
            return Err(HostError::Invalid(
                "Agent targets require text. Workflow targets accept parameters.".into(),
            ));
        }
        let request: ManagedRunRequest = serde_json::from_value(json!({
            "system":managed.request.system,"release":release,"program":program,
            "run_id":"","thread_id":"","approval_mode":managed.request.approval_mode,
            "input":text.map(|text|json!({"text":text,"attachments":[]})),
        }))
        .map_err(|e| HostError::Invalid(e.to_string()))?;
        let request = ManagedRunRequest {
            parameters,
            ..request
        };
        let registry = service.registry.clone();
        let system = tokio::task::spawn_blocking(move || bundle.restore(&registry))
            .await
            .map_err(|e| HostError::Unavailable(e.to_string()))??;
        let _memory = service
            .loader
            .memory_provider
            .admit_program(system.program(program)?)
            .await?;
        let receipt = service
            .supervisor
            .start_work(
                session,
                &origin,
                args["command_id"].as_str().unwrap(),
                request,
                &system,
                proof.cloned(),
                live.as_ref().map_or(0, |view| view.revision),
            )
            .await?;
        service.wake.notify_one();
        Ok(json!(receipt))
    }
}

fn granted_targets<'a>(bundle: &'a SystemBundle, origin: &str) -> Vec<&'a str> {
    let Some(ProgramDefinition::Agent { definition }) = bundle.document.programs.get(origin) else {
        return Vec::new();
    };
    bundle
        .document
        .modules
        .iter()
        .filter(|m| m.factory == "tool.sdk_work" && definition.tool_packs.contains(&m.reference))
        .flat_map(|m| {
            m.config["background_targets"]
                .as_array()
                .into_iter()
                .flatten()
        })
        .filter_map(Value::as_str)
        .filter(|target| *target != origin)
        .collect()
}

fn program_kind(bundle: &SystemBundle, program: &str) -> Option<&'static str> {
    match bundle.document.programs.get(program)? {
        ProgramDefinition::Agent { .. } => Some("agent"),
        ProgramDefinition::Workflow { .. } => Some("workflow"),
        _ => None,
    }
}

fn required<'a>(v: Option<&'a str>, name: &str) -> Result<&'a str> {
    v.ok_or_else(|| HostError::Invalid(format!("{name} is required")))
}

fn parse_json(raw: Option<&str>, field: &str) -> Result<Option<Value>> {
    raw.map(|v| serde_json::from_str(v).map_err(|_| HostError::Invalid(format!("invalid {field}"))))
        .transpose()
}
