use super::*;
use crate::loader::sources::*;
pub(super) fn router() -> Router<KernelHost> {
    Router::new()
        .route("/api/v1/runtime-sources", get(sources))
        .route(
            "/api/v1/runtime-sources/{id}",
            get(source).put(update).delete(remove),
        )
        .route(
            "/api/v1/runtime-acquisitions",
            get(acquisitions).post(acquire),
        )
        .route("/api/v1/runtime-acquisitions/{id}", get(acquisition))
        .layer(DefaultBodyLimit::max(16384))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Page {
    #[serde(default)]
    after: String,
    #[serde(default = "limit")]
    limit: usize,
}
fn limit() -> usize {
    16
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Update {
    expected_revision: Option<u64>,
    policy: SourcePolicy,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Remove {
    expected_revision: Option<u64>,
}
async fn sources(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Query(page): Query<Page>,
) -> Result<Json<SourcePage>> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.loader.sources.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || store.list(&page.after, page.limit))
            .await
            .map_err(|e| HostError::Unavailable(e.to_string()))??,
    ))
}
async fn source(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<impl serde::Serialize>> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.loader.sources.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || store.get(&id))
            .await
            .map_err(|e| HostError::Unavailable(e.to_string()))??,
    ))
}
async fn update(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(update): Json<Update>,
) -> Result<Json<impl serde::Serialize>> {
    host.auth.require(&headers, Scope::Resources)?;
    let store = host.loader.sources.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || {
            store.set(&id, update.expected_revision, Some(update.policy))
        })
        .await
        .map_err(|e| HostError::Unavailable(e.to_string()))??,
    ))
}
async fn remove(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(update): Json<Remove>,
) -> Result<Json<impl serde::Serialize>> {
    host.auth.require(&headers, Scope::Resources)?;
    let store = host.loader.sources.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || store.set(&id, update.expected_revision, None))
            .await
            .map_err(|e| HostError::Unavailable(e.to_string()))??,
    ))
}
async fn acquisitions(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Query(page): Query<Page>,
) -> Result<Json<AcquisitionPage>> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.loader.sources.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || store.acquisitions(&page.after, page.limit))
            .await
            .map_err(|e| HostError::Unavailable(e.to_string()))??,
    ))
}
async fn acquisition(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<Acquisition>> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.loader.sources.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || store.acquisition(&id))
            .await
            .map_err(|e| HostError::Unavailable(e.to_string()))??,
    ))
}
async fn acquire(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(command): Json<AcquireImage>,
) -> Result<Json<Acquisition>> {
    host.auth.require(&headers, Scope::Resources)?;
    Ok(Json(
        host.loader
            .acquire_image(command, host.stop.clone())
            .await?,
    ))
}
