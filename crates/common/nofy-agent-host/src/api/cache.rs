use super::*;
use crate::loader::lifecycle::{CacheCommand, CacheReceipt, CacheView};
pub(super) fn router() -> Router<KernelHost> {
    Router::new()
        .route("/api/v1/loader/cache", get(inspect).post(collect))
        .route("/api/v1/loader/cache/receipts/{revision}", get(receipt))
        .layer(DefaultBodyLimit::max(4096))
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
    8
}
async fn inspect(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Query(page): Query<Page>,
) -> Result<Json<CacheView>> {
    host.auth.require(&headers, Scope::Read)?;
    let cache = host.loader.cache.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || cache.inspect(&page.after, page.limit))
            .await
            .map_err(|e| HostError::Unavailable(e.to_string()))??,
    ))
}
async fn collect(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(command): Json<CacheCommand>,
) -> Result<Json<CacheReceipt>> {
    host.auth.require(&headers, Scope::Resources)?;
    let cache = host.loader.cache.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || cache.collect(command))
            .await
            .map_err(|e| HostError::Unavailable(e.to_string()))??,
    ))
}
async fn receipt(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(revision): Path<u64>,
) -> Result<Json<CacheReceipt>> {
    host.auth.require(&headers, Scope::Read)?;
    let cache = host.loader.cache.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || cache.receipt(revision))
            .await
            .map_err(|e| HostError::Unavailable(e.to_string()))??,
    ))
}
