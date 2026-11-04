use super::*;
use crate::loader::unload::{
    UnloadCommand, UnloadPlan, UnloadReceipt, UnloadRequest, UnloadStatus,
};

pub(super) fn router() -> Router<KernelHost> {
    Router::new()
        .route("/api/v1/loader/unload/plan", post(plan))
        .route("/api/v1/loader/unload", get(status).post(unload))
        .route("/api/v1/loader/unload/receipts/{revision}", get(receipt))
        .layer(DefaultBodyLimit::max(16384))
}
async fn plan(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(request): Json<UnloadRequest>,
) -> Result<Json<UnloadPlan>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(host.plan_unload(request).await?))
}
async fn unload(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(command): Json<UnloadCommand>,
) -> Result<Json<UnloadReceipt>> {
    host.auth.require(&headers, Scope::Resources)?;
    Ok(Json(host.unload_objects(command).await?))
}
async fn status(State(host): State<KernelHost>, headers: HeaderMap) -> Result<Json<UnloadStatus>> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.loader.unload.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || store.status())
            .await
            .map_err(|e| HostError::Unavailable(e.to_string()))??,
    ))
}
async fn receipt(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(revision): Path<u64>,
) -> Result<Json<UnloadReceipt>> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.loader.unload.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || store.receipt(revision))
            .await
            .map_err(|e| HostError::Unavailable(e.to_string()))??,
    ))
}
