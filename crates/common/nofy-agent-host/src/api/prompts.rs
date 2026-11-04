use super::*;
use crate::loader::prompts::PromptRequest;
use axum::Extension;
use nofy_agent_modules::prompt::PromptPreview;

pub(super) fn router() -> Router<KernelHost> {
    Router::new()
        .route("/api/v1/prompts/preview", post(preview))
        .route("/api/v1/prompts/status", get(status))
        .route("/api/v1/scopes/status", get(scope_status))
        .route("/api/v1/models/status", get(model_status))
        .route("/api/v1/code/status", get(code_status))
        .layer(DefaultBodyLimit::max(2 * 1024 * 1024))
}
async fn code_status(
    State(host): State<KernelHost>,
    headers: HeaderMap,
) -> Result<Json<crate::loader::code::CodeStatus>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(host.loader.code_status()))
}
async fn model_status(
    State(host): State<KernelHost>,
    headers: HeaderMap,
) -> Result<Json<crate::loader::models::ModelStatus>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(host.loader.model_status()))
}
async fn scope_status(
    State(host): State<KernelHost>,
    headers: HeaderMap,
) -> Result<Json<crate::loader::scopes::ScopeStatus>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(host.loader.scope_status()))
}
async fn status(
    State(host): State<KernelHost>,
    headers: HeaderMap,
) -> Result<Json<crate::loader::prompts::PromptStatus>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(host.loader.prompt_status()))
}
async fn preview(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Extension(loader::ManagementAdmission(permit)): Extension<loader::ManagementAdmission>,
    Json(request): Json<PromptRequest>,
) -> Result<Json<PromptPreview>> {
    host.auth.require(&headers, Scope::Read)?;
    if host.stop.is_cancelled() {
        return Err(HostError::Unavailable("host is shutting down".into()));
    }
    Ok(Json(
        host.loader
            .render_prompt(request, host.stop.clone(), Some(permit))
            .await?,
    ))
}
