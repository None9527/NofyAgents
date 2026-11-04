use super::*;
use crate::loader::references::{ReferenceReport, ReferenceRequest};
pub(super) fn router() -> Router<KernelHost> {
    Router::new()
        .route("/api/v1/loader/references", post(inspect))
        .layer(DefaultBodyLimit::max(16384))
}
async fn inspect(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(request): Json<ReferenceRequest>,
) -> Result<Json<ReferenceReport>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(host.inspect_references(request).await?))
}
