use crate::{auth::Scope, *};
use axum::{
    Json, Router,
    extract::{DefaultBodyLimit, Path, Query, State},
    http::{HeaderMap, StatusCode},
    middleware::{self, Next},
    response::{IntoResponse, Response},
    routing::{get, post, put},
};
use nofy_agent_runtime::{
    control::{Activation, ApplyCommand, ApplyReceipt, CatalogView, Draft, Publication},
    registry::ModuleKind,
    system::*,
};
use serde::Deserialize;
use serde_json::{Value, json};
mod credentials;
mod runs;

impl IntoResponse for HostError {
    fn into_response(self) -> Response {
        use nofy_agent_runtime::control::ControlError;
        let (status, code) = match &self {
            Self::Unauthorized => (StatusCode::UNAUTHORIZED, "unauthorized"),
            Self::Forbidden => (StatusCode::FORBIDDEN, "forbidden"),
            Self::NotFound | Self::Control(ControlError::NotFound(_)) => {
                (StatusCode::NOT_FOUND, "not_found")
            }
            Self::Control(ControlError::Conflict { .. } | ControlError::CommandConflict) => {
                (StatusCode::CONFLICT, "conflict")
            }
            Self::Control(ControlError::Busy) => (StatusCode::SERVICE_UNAVAILABLE, "busy"),
            Self::Control(
                ControlError::Storage(_)
                | ControlError::CommitUncertain(_)
                | ControlError::CompileTask(_),
            )
            | Self::Unavailable(_) => (StatusCode::SERVICE_UNAVAILABLE, "unavailable"),
            Self::Runtime(nofy_agent_runtime::Error::Checkpoint(_)) => {
                (StatusCode::CONFLICT, "runtime_conflict")
            }
            _ => (StatusCode::UNPROCESSABLE_ENTITY, "invalid"),
        };
        (
            status,
            Json(json!({"error":{"code":code,"message":self.to_string()}})),
        )
            .into_response()
    }
}
async fn authenticate(
    State(host): State<KernelHost>,
    request: axum::extract::Request,
    next: Next,
) -> Result<Response> {
    host.auth.authenticate(request.headers())?;
    if host.stop.is_cancelled() {
        return Err(HostError::Unavailable("host is shutting down".into()));
    }
    Ok(next.run(request).await)
}
pub(crate) fn router(host: KernelHost) -> Router {
    Router::new()
        .route("/api/v1/catalog", get(catalog))
        .route("/api/v1/modules", get(modules))
        .route("/api/v1/modules/dependencies", post(dependencies))
        .route("/api/v1/validate", post(validate))
        .route("/api/v1/import", post(import))
        .route(
            "/api/v1/drafts/{name}",
            put(save_draft).delete(delete_draft),
        )
        .route("/api/v1/publish", post(publish))
        .route("/api/v1/releases/{release}", get(export))
        .route("/api/v1/releases/{release}/programs", get(programs))
        .route("/api/v1/plan", post(plan))
        .route("/api/v1/apply", post(apply))
        .route("/api/v1/systems/{name}/history", get(history))
        .route("/api/v1/systems/{name}/active", get(active))
        .merge(runs::router())
        .merge(credentials::router())
        .layer(DefaultBodyLimit::max(32 * 1024 * 1024))
        .layer(middleware::from_fn_with_state(host.clone(), authenticate))
        .with_state(host)
}
fn resources(host: &KernelHost, headers: &HeaderMap, document: &SystemDocument) -> Result<()> {
    let descriptors = host.registry.descriptors();
    let mut modules = document.modules.iter().collect::<Vec<_>>();
    for program in document.programs.values() {
        if let ProgramDefinition::Workflow { document, .. } = program {
            modules.extend(document.modules.iter());
        }
    }
    if modules.into_iter().any(|module| {
        descriptors
            .iter()
            .any(|d| d.factory == module.factory && d.kind == ModuleKind::Resource)
    }) {
        host.auth.require(headers, Scope::Resources)?;
    }
    Ok(())
}
async fn catalog(
    State(host): State<KernelHost>,
    headers: HeaderMap,
) -> Result<Json<Option<CatalogView>>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(host.control.inspect().await?))
}
async fn modules(State(host): State<KernelHost>, headers: HeaderMap) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(
        json!({"protocol":"nofy.runtime/v1","factories":host.registry.descriptors()}),
    ))
}
async fn programs(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(release): Path<String>,
) -> Result<Json<Vec<ProgramInterface>>> {
    host.auth.require(&headers, Scope::Read)?;
    let bundle = host.control.export(&release).await?;
    let registry = host.registry.clone();
    let interfaces = tokio::task::spawn_blocking(move || {
        let system = bundle.restore(&registry)?;
        system
            .program_names()
            .into_iter()
            .map(|name| system.program_interface(name))
            .collect::<std::result::Result<Vec<_>, nofy_agent_runtime::Error>>()
    })
    .await
    .map_err(|e| HostError::Unavailable(e.to_string()))??;
    Ok(Json(interfaces))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Dependencies {
    factory: String,
    config: Value,
}
async fn dependencies(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(request): Json<Dependencies>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(
        json!({"dependencies":host.registry.required_dependencies(&request.factory,&request.config)?}),
    ))
}
async fn validate(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(file): Json<SystemFile>,
) -> Result<Json<SystemBundle>> {
    host.auth.require(&headers, Scope::Read)?;
    let registry = host.registry.clone();
    let system = tokio::task::spawn_blocking(move || file.prepare(&registry))
        .await
        .map_err(|e| HostError::Unavailable(e.to_string()))??;
    Ok(Json(system.bundle))
}
async fn import(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(file): Json<SystemFile>,
) -> Result<Json<Publication>> {
    host.auth.require(&headers, Scope::Publish)?;
    let document = match &file {
        SystemFile::Source(d) => d,
        SystemFile::Locked(b) => &b.document,
    };
    resources(&host, &headers, document)?;
    Ok(Json(host.control.install_file(file).await?))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct SaveDraft {
    expected_revision: Option<u64>,
    document: SystemDocument,
}
async fn save_draft(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(name): Path<String>,
    Json(request): Json<SaveDraft>,
) -> Result<Json<Draft>> {
    host.auth.require(&headers, Scope::Edit)?;
    resources(&host, &headers, &request.document)?;
    Ok(Json(
        host.control
            .save_draft(&name, request.expected_revision, request.document)
            .await?,
    ))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Revision {
    revision: u64,
}
async fn delete_draft(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(name): Path<String>,
    Json(request): Json<Revision>,
) -> Result<StatusCode> {
    host.auth.require(&headers, Scope::Edit)?;
    host.control.delete_draft(&name, request.revision).await?;
    Ok(StatusCode::NO_CONTENT)
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Publish {
    draft: String,
    revision: u64,
}
async fn publish(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(request): Json<Publish>,
) -> Result<Json<Publication>> {
    host.auth.require(&headers, Scope::Publish)?;
    let draft = host
        .control
        .inspect()
        .await?
        .and_then(|v| v.data.drafts.get(&request.draft).cloned())
        .ok_or(HostError::NotFound)?;
    resources(&host, &headers, &draft.document)?;
    Ok(Json(
        host.control
            .publish(&request.draft, request.revision)
            .await?,
    ))
}
async fn export(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(release): Path<String>,
) -> Result<Json<SystemBundle>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(host.control.export(&release).await?))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Plan {
    system: String,
    release: String,
}
async fn plan(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(request): Json<Plan>,
) -> Result<Json<SystemDiff>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(
        host.control.plan(&request.system, &request.release).await?,
    ))
}
async fn apply(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(request): Json<ApplyCommand>,
) -> Result<Json<ApplyReceipt>> {
    host.auth.require(&headers, Scope::Publish)?;
    let bundle = host.control.export(&request.release).await?;
    resources(&host, &headers, &bundle.document)?;
    Ok(Json(host.control.apply(request).await?))
}
async fn history(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(name): Path<String>,
) -> Result<Json<Vec<ApplyReceipt>>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(host.control.history(&name).await?))
}
async fn active(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(name): Path<String>,
) -> Result<Json<Activation>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(
        host.control
            .inspect()
            .await?
            .and_then(|v| v.data.active.get(&name).cloned())
            .ok_or(HostError::NotFound)?,
    ))
}
