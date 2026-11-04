use super::*;
use nofy_agent_runtime::{session_policy::Frozen, supervisor::jobs::*};
mod lifecycle;
use lifecycle::*;

pub(super) fn router() -> Router<KernelHost> {
    Router::new()
        .route("/api/v1/sessions", post(create).get(list))
        .route("/api/v1/sessions/capabilities", get(capabilities))
        .route("/api/v1/sessions/start", post(start))
        .route("/api/v1/sessions/route", post(route))
        .route("/api/v1/sessions/{id}", get(inspect))
        .route("/api/v1/sessions/{id}/turns", get(turns).post(submit_turn))
        .route("/api/v1/sessions/{id}/turns/{run}", get(turn_binding))
        .route("/api/v1/sessions/{id}/policy", get(policy))
        .route("/api/v1/sessions/{id}/plan", post(lifecycle::plan))
        .route(
            "/api/v1/sessions/{id}/metadata",
            axum::routing::patch(metadata),
        )
        .route("/api/v1/sessions/{id}/close", post(close))
        .route("/api/v1/sessions/{id}/reopen", post(reopen))
        .route("/api/v1/sessions/{id}/archive", post(archive))
        .route("/api/v1/sessions/{id}/unarchive", post(unarchive))
        .route("/api/v1/sessions/{id}/reconfigure", post(reconfigure))
        .route("/api/v1/sessions/{id}/commands/{command_id}", get(command))
}
async fn system(
    host: &KernelHost,
    release: &str,
) -> Result<nofy_agent_runtime::system::CompiledSystem> {
    let bundle = host.control.export(release).await?;
    let registry = host.registry.clone();
    Ok(
        tokio::task::spawn_blocking(move || bundle.restore(&registry))
            .await
            .map_err(|e| HostError::Unavailable(e.to_string()))??,
    )
}
async fn state(host: &KernelHost, id: &str) -> Result<SessionState> {
    host.store
        .session_state(id)
        .await?
        .ok_or(HostError::NotFound)
}
fn same_id(route: &str, body: &str) -> Result<()> {
    if route != body {
        return Err(HostError::Invalid(
            "session path and request identity differ".into(),
        ));
    }
    Ok(())
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Create {
    session_id: String,
    root_run_id: String,
}
async fn create(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(request): Json<Create>,
) -> Result<Json<SessionState>> {
    host.auth.require(&headers, Scope::Execute)?;
    let id = request.session_id;
    host.supervisor
        .create_session(SessionRequest {
            id: id.clone(),
            root_run_id: request.root_run_id,
        })
        .await?;
    host.wake.notify_one();
    Ok(Json(state(&host, &id).await?))
}
async fn start(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(request): Json<SessionStart>,
) -> Result<Json<SessionReceipt>> {
    host.auth.require(&headers, Scope::Execute)?;
    if let Some(receipt) = host.supervisor.replay_session_start(&request).await? {
        return Ok(Json(receipt));
    }
    let root: ManagedRunRequest = serde_json::from_str(&request.request_json)
        .map_err(|e| HostError::Invalid(e.to_string()))?;
    let compiled = system(&host, &root.release).await?;
    let _memory = host
        .loader
        .memory_provider
        .admit_program(compiled.program(&root.program)?)
        .await?;
    let receipt = host.supervisor.start_session(request, &compiled).await?;
    host.wake.notify_one();
    Ok(Json(receipt))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Page {
    #[serde(default)]
    after: String,
    #[serde(default = "limit")]
    limit: usize,
    #[serde(default)]
    include_archived: bool,
}
fn limit() -> usize {
    100
}
async fn list(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Query(page): Query<Page>,
) -> Result<Json<Vec<SessionState>>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(
        host.store
            .session_states(&page.after, page.limit, page.include_archived)
            .await?,
    ))
}
async fn inspect(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<SessionState>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(state(&host, &id).await?))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct TurnPage {
    #[serde(default = "zero")]
    after: String,
    #[serde(default = "limit")]
    limit: usize,
}
fn zero() -> String {
    "0".into()
}
fn exact(value: &str) -> Result<u64> {
    let n = value
        .parse::<u64>()
        .map_err(|_| HostError::Invalid("invalid exact session version/cursor".into()))?;
    if n.to_string() != value {
        return Err(HostError::Invalid(
            "noncanonical session version/cursor".into(),
        ));
    }
    Ok(n)
}
async fn turns(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Query(page): Query<TurnPage>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    state(&host, &id).await?;
    let items = host
        .store
        .session_turns(&id, exact(&page.after)?, page.limit)
        .await?;
    let texts = items
        .iter()
        .map(serde_json::to_string)
        .collect::<std::result::Result<Vec<_>, _>>()
        .map_err(|e| HostError::Invalid(e.to_string()))?;
    Ok(Json(json!({"turns_json":texts})))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Turn {
    session_id: String,
    expected_session_revision: String,
    request_json: String,
}
async fn submit_turn(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(request): Json<Turn>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Execute)?;
    same_id(&id, &request.session_id)?;
    let command: SessionTurnCommand = serde_json::from_str(&request.request_json)
        .map_err(|e| HostError::Invalid(e.to_string()))?;
    let run = match &command.turn {
        SessionTurnInput::New { run_id, .. } | SessionTurnInput::Queued { run_id, .. } => {
            run_id.clone()
        }
    };
    host.supervisor
        .submit_session_turn_at(
            &id,
            command,
            Some(exact(&request.expected_session_revision)?),
        )
        .await?;
    host.wake.notify_one();
    Ok(Json(binding(&host, &id, &run).await?))
}
async fn binding(host: &KernelHost, id: &str, run: &str) -> Result<Value> {
    state(host, id).await?;
    let native = host.store.session_turn_binding(id, run).await?;
    let admission = host.store.session_policy_admission(id, run).await?;
    if native.is_none() && admission.is_none() {
        return Err(HostError::NotFound);
    }
    let seed = host.store.session_seed(run).await?;
    let text = |v: &Value| serde_json::to_string(v).map_err(|e| HostError::Invalid(e.to_string()));
    Ok(json!({"session_id":id,"run_id":run,
        "session_revision":admission.as_ref().and_then(|a|a.get("session_revision")).and_then(Value::as_str).unwrap_or("0"),
        "policy_revision":admission.as_ref().and_then(|a|a.get("policy_revision")).and_then(Value::as_str).unwrap_or("0"),
        "native_admission_json":native.map(|v|serde_json::to_value(v)).transpose().map_err(|e|HostError::Invalid(e.to_string()))?.as_ref().map(text).transpose()?,
        "seed_json":seed.map(|v|serde_json::to_value(v)).transpose().map_err(|e|HostError::Invalid(e.to_string()))?.as_ref().map(text).transpose()?,
        "policy_admission_json":admission.as_ref().map(text).transpose()?}))
}
async fn turn_binding(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path((id, run)): Path<(String, String)>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(binding(&host, &id, &run).await?))
}
async fn policy(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(
        host.store
            .session_policy_view(&id)
            .await?
            .ok_or(HostError::NotFound)?,
    ))
}
async fn route(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(request): Json<SessionRoute>,
) -> Result<Json<SessionRouteView>> {
    host.auth.require(&headers, Scope::Read)?;
    let compiled = system(&host, &request.release).await?;
    Ok(Json(
        host.supervisor.route_session(request, &compiled).await?,
    ))
}
async fn selected(host: &KernelHost, change: &SessionChange) -> Result<Option<Frozen>> {
    match change {
        SessionChange::Reconfigure { policy, .. } => {
            let source = system(host, &policy.release).await?;
            Ok(Some(Frozen::select(
                &source.bundle.lock.modules,
                &policy.module,
                &policy.release,
            )?))
        }
        _ => Ok(None),
    }
}
async fn capabilities(State(host): State<KernelHost>, headers: HeaderMap) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(
        json!({"protocol":"nofy.session-control/v1","policy_protocol":"nofy.session-policy/v1",
        "agent_schema_versions":[1,2],"policy_update_boundary":"between_quiescent_turns",
        "policy_input_schema":nofy_agent_runtime::session_policy::input_schema(),
        "policy_output_schema":nofy_agent_runtime::session_policy::proposal_schema(),
        "operations":["start","create","list","inspect","turn","turns","binding","route","policy","plan","metadata","close","reopen","archive","unarchive","reconfigure","command"]}),
    ))
}
