use super::*;
use axum::response::sse::{Event, KeepAlive, Sse};
use nofy_agent_runtime::{
    mailbox::{InputAddress, MailEnvelope, MailboxSender},
    supervisor::{ApprovalRequest, jobs::*},
};
use std::{convert::Infallible, time::Duration};
pub(super) fn router() -> Router<KernelHost> {
    Router::new()
        .route("/api/v1/runs", post(submit).get(list))
        .route("/api/v1/runs/{id}", get(inspect))
        .route("/api/v1/runs/{id}/versions", get(versions))
        .route("/api/v1/runs/{id}/events", get(events))
        .route("/api/v1/runs/{id}/stream", get(stream))
        .route("/api/v1/runs/{id}/approvals", get(approvals).post(decide))
        .route("/api/v1/runs/{id}/cancel", post(cancel))
        .route("/api/v1/runs/{id}/inputs", post(input))
        .route("/api/v1/runs/{id}/recovery", get(recovery))
        .route("/api/v1/runs/{id}/recovery/root", get(root_recovery))
        .route("/api/v1/runs/{id}/recovery/models", get(model_recovery))
        .route("/api/v1/runs/{id}/recovery/hooks", get(hook_recovery))
        .route("/api/v1/runs/{id}/recovery/humans", get(human_recovery))
        .route(
            "/api/v1/runs/{id}/recovery/model-retry",
            get(model_retry_ticket),
        )
        .route("/api/v1/actions", post(action))
        .route("/api/v1/actions/{id}", get(action_status))
}
async fn managed(host: &KernelHost, id: &str) -> Result<ManagedRun> {
    host.store.managed_run(id).await?.ok_or(HostError::NotFound)
}
async fn submit(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(request): Json<ManagedRunRequest>,
) -> Result<(StatusCode, Json<ManagedRun>)> {
    host.auth.require(&headers, Scope::Execute)?;
    if let Some(old) = host.store.managed_run(&request.run_id).await? {
        if content_digest(&old.request)? != content_digest(&request)? {
            return Err(HostError::Invalid(
                "run ID reused with a different request".into(),
            ));
        }
        host.wake.notify_one();
        return Ok((StatusCode::OK, Json(old)));
    }
    let bundle = host.control.export(&request.release).await?;
    let registry = host.registry.clone();
    let system = tokio::task::spawn_blocking(move || bundle.restore(&registry))
        .await
        .map_err(|e| HostError::Unavailable(e.to_string()))??;
    let _memory = host
        .loader
        .memory_provider
        .admit_program(system.program(&request.program)?)
        .await?;
    let result = host.supervisor.submit_managed(request, &system).await?;
    host.wake.notify_one();
    Ok((StatusCode::ACCEPTED, Json(result)))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Page {
    #[serde(default)]
    after: u64,
    #[serde(default = "limit")]
    limit: usize,
}
fn limit() -> usize {
    100
}
async fn list(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Query(page): Query<Page>,
) -> Result<Json<Vec<ManagedRun>>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(host.store.managed_runs(page.after, page.limit).await?))
}
#[derive(Default, Deserialize)]
#[serde(rename_all = "snake_case")]
enum RunView {
    Status,
    #[default]
    Full,
}
#[derive(Default, Deserialize)]
#[serde(default, deny_unknown_fields)]
struct InspectQuery {
    view: RunView,
}
async fn inspect(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Query(query): Query<InspectQuery>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    let run = managed(&host, &id).await?;
    if matches!(query.view, RunView::Status) {
        let mut result = host.store.execution_status(&id).await?;
        result["format"] = json!("nofy.run-status/v1");
        result["run"] = json!({"sequence":run.sequence,"status":run.status,"request":{"run_id":run.request.run_id,"thread_id":run.request.thread_id,"system":run.request.system,"release":run.request.release,"program":run.request.program}});
        result["details_read"] =
            json!({"operation":"run.inspect","arguments":{"run_id":id,"view":"full"}});
        return Ok(Json(result));
    }
    Ok(Json(
        json!({"run":run,"execution":host.store.execution_record(&id).await?,"children":host.store.children(&id).await?,"parking":host.store.parking(&id).await?,"live":host.store.live_execution(&id).await?.map(|live|live.info())}),
    ))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct VersionPage {
    #[serde(default)]
    after: u64,
    #[serde(default = "version_limit")]
    limit: usize,
}
fn version_limit() -> usize {
    16
}
async fn versions(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Query(page): Query<VersionPage>,
) -> Result<Json<Vec<LiveVersionInfo>>> {
    host.auth.require(&headers, Scope::Read)?;
    managed(&host, &id).await?;
    Ok(Json(
        host.store
            .live_versions(&id, page.after, page.limit)
            .await?
            .iter()
            .map(LiveExecution::info)
            .collect(),
    ))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct RecoveryPage {
    after: Option<String>,
    #[serde(default = "limit")]
    limit: usize,
}
async fn recovery(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Query(page): Query<RecoveryPage>,
) -> Result<Json<nofy_agent_runtime::supervisor::ChildRecoveryPage>> {
    host.auth.require(&headers, Scope::Read)?;
    managed(&host, &id).await?;
    Ok(Json(
        host.store
            .child_recovery_targets(&id, page.after.as_deref(), page.limit)
            .await?,
    ))
}
async fn root_recovery(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<Option<nofy_agent_runtime::supervisor::RootRecoveryTarget>>> {
    host.auth.require(&headers, Scope::Read)?;
    managed(&host, &id).await?;
    Ok(Json(host.store.root_recovery_target(&id).await?))
}
async fn human_recovery(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<HumanRecoveryPage>> {
    host.auth.require(&headers, Scope::Read)?;
    managed(&host, &id).await?;
    Ok(Json(
        host.supervisor
            .human_recovery_targets(&host.registry, &id)
            .await?,
    ))
}
async fn model_retry_ticket(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<Option<nofy_agent_runtime::governance::ModelRetryTicket>>> {
    host.auth.require(&headers, Scope::Read)?;
    managed(&host, &id).await?;
    Ok(Json(host.supervisor.root_model_retry_ticket(&id).await?))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ModelRecoveryQuery {
    target_run_id: Option<String>,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct HookRecoveryQuery {
    after: Option<String>,
    #[serde(default = "limit")]
    limit: usize,
}
async fn hook_recovery(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Query(page): Query<HookRecoveryQuery>,
) -> Result<Json<nofy_agent_runtime::hooks::primitive::HookRecoveryPage>> {
    host.auth.require(&headers, Scope::Read)?;
    managed(&host, &id).await?;
    Ok(Json(
        host.supervisor
            .hook_reconciliation_targets(&id, page.after.as_deref(), page.limit)
            .await?,
    ))
}
async fn model_recovery(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Query(query): Query<ModelRecoveryQuery>,
) -> Result<Json<Vec<nofy_agent_runtime::governance::ModelReconciliationTarget>>> {
    host.auth.require(&headers, Scope::Read)?;
    managed(&host, &id).await?;
    Ok(Json(
        host.supervisor
            .model_reconciliation_targets(&id, query.target_run_id.as_deref().unwrap_or(&id))
            .await?,
    ))
}
async fn events(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Query(page): Query<Page>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    managed(&host, &id).await?;
    Ok(Json(
        json!({"events":host.store.events(&id,page.after,page.limit).await?}),
    ))
}
async fn stream(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Query(page): Query<Page>,
) -> Result<Response> {
    host.auth.require(&headers, Scope::Read)?;
    managed(&host, &id).await?;
    if !(1..=1000).contains(&page.limit) || page.after > i64::MAX as u64 {
        return Err(HostError::Invalid("invalid event cursor/page limit".into()));
    }
    let after = match headers.get("last-event-id") {
        Some(value) => value
            .to_str()
            .ok()
            .and_then(|value| value.parse::<u64>().ok())
            .filter(|v| *v <= i64::MAX as u64)
            .ok_or_else(|| HostError::Invalid("invalid Last-Event-ID".into()))?,
        None => page.after,
    };
    let frames = async_stream::stream! {
        let mut after=after;
        loop {
            let events=tokio::select! {biased;_=host.stop.cancelled()=>return,result=host.store.events(&id,after,page.limit)=>result};
            match events {
                Ok(events)=>{
                    if events.is_empty() {tokio::select! {biased;_=host.stop.cancelled()=>return,_=tokio::time::sleep(Duration::from_millis(200))=>{}};continue;}
                    for event in events {
                        after=event.cursor;
                        match serde_json::to_string(&event) {
                            Ok(data)=>yield Ok::<_,Infallible>(Event::default().id(after.to_string()).event("runtime").data(data)),
                            Err(_)=>return,
                        }
                    }
                }
                Err(error)=>{yield Ok(Event::default().event("error").data(json!({"message":error.to_string()}).to_string()));return;}
            }
        }
    };
    Ok(Sse::new(frames)
        .keep_alive(KeepAlive::new().interval(Duration::from_secs(10)))
        .into_response())
}
async fn approvals(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<Vec<ApprovalRequest>>> {
    host.auth.require(&headers, Scope::Read)?;
    managed(&host, &id).await?;
    let mut requests = host.store.pending_approvals(&id).await?;
    for child in host.store.children(&id).await? {
        requests.extend(host.store.pending_approvals(&child.run_id).await?);
    }
    Ok(Json(requests))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Decision {
    request: ApprovalRequest,
    allow: bool,
    #[serde(default)]
    scope: nofy_agent_runtime::supervisor::ApprovalScope,
}
async fn decide(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(decision): Json<Decision>,
) -> Result<StatusCode> {
    host.auth.require(&headers, Scope::Execute)?;
    managed(&host, &id).await?;
    if decision.request.run_id != id
        && !host
            .store
            .children(&id)
            .await?
            .iter()
            .any(|c| c.run_id == decision.request.run_id)
    {
        return Err(HostError::Invalid(
            "approval is outside this run tree".into(),
        ));
    }
    host.store
        .decide_scoped(&decision.request, decision.allow, decision.scope)
        .await?;
    Ok(StatusCode::NO_CONTENT)
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Cancel {
    command_id: String,
}
async fn cancel(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(command): Json<Cancel>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Execute)?;
    if command.command_id.trim().is_empty() || command.command_id.len() > 256 {
        return Err(HostError::Invalid(
            "cancel ID requires 1..=256 bytes".into(),
        ));
    }
    managed(&host, &id).await?;
    let Some(record) = host.store.execution_record(&id).await? else {
        host.supervisor.cancel_submitted(&id).await?;
        host.wake.notify_one();
        return Ok(Json(json!({"queued_cancelled":true})));
    };
    let address = InputAddress {
        root_run_id: id.clone(),
        run_id: id,
        thread_id: record.thread_id,
        agent: record.snapshot.name().into(),
    };
    Ok(Json(
        json!({"cursor":host.store.cancel(&address,&command.command_id).await?}),
    ))
}
async fn input(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(envelope): Json<MailEnvelope>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Execute)?;
    managed(&host, &id).await?;
    if envelope.address.root_run_id != id {
        return Err(HostError::Invalid("input is outside this run tree".into()));
    }
    let receipt = host.store.submit(envelope).await?;
    host.wake.notify_one();
    Ok(Json(json!(receipt)))
}
async fn action(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(action): Json<ManagedAction>,
) -> Result<(StatusCode, Json<ManagedActionRecord>)> {
    host.auth.require(&headers, Scope::Execute)?;
    let record = if let ManagedCommand::Transition { release, .. }
    | ManagedCommand::UpdateModules { release, .. } = &action.command
    {
        // Exact replays must not require a release to be reactivated/reloaded.
        if let Some(old) = host.store.managed_action(&action.command_id).await? {
            if content_digest(&old.action)? != content_digest(&action)? {
                return Err(HostError::Invalid("management command ID reused".into()));
            }
            old
        } else {
            let bundle = host.control.export(release).await?;
            let registry = host.registry.clone();
            let system = tokio::task::spawn_blocking(move || bundle.restore(&registry))
                .await
                .map_err(|e| HostError::Unavailable(e.to_string()))??;
            host.supervisor.submit_transition(action, &system).await?
        }
    } else {
        host.store.enqueue_managed_action(action).await?
    };
    host.wake.notify_one();
    Ok((StatusCode::ACCEPTED, Json(record)))
}
async fn action_status(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<ManagedActionRecord>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(
        host.store
            .managed_action(&id)
            .await?
            .ok_or(HostError::NotFound)?,
    ))
}
