use super::*;
use crate::credentials::{CredentialMetadata, CredentialView, FileCredentials};
use std::sync::Arc;
pub(super) fn router() -> Router<KernelHost> {
    Router::new()
        .route("/api/v1/credentials", get(inspect))
        .route("/api/v1/credentials/{reference}", put(set).delete(delete))
        .layer(DefaultBodyLimit::max(32 * 1024))
}
fn store(host: &KernelHost) -> Result<Arc<FileCredentials>> {
    host.credentials
        .clone()
        .ok_or_else(|| HostError::Unavailable("credential management is not installed".into()))
}
async fn inspect(
    State(host): State<KernelHost>,
    headers: HeaderMap,
) -> Result<Json<CredentialView>> {
    host.auth.require(&headers, Scope::Resources)?;
    Ok(Json(store(&host)?.inspect().await?))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Update {
    expected_revision: Option<u64>,
    value: String,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Delete {
    expected_revision: Option<u64>,
}
async fn set(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(reference): Path<String>,
    Json(value): Json<Value>,
) -> Result<Json<CredentialMetadata>> {
    host.auth.require(&headers, Scope::Resources)?;
    // Sanitized typed decoding never echoes an invalid credential value.
    let update: Update = serde_json::from_value(value)
        .map_err(|_| HostError::Invalid("invalid credential update".into()))?;
    Ok(Json(
        store(&host)?
            .set(&reference, update.expected_revision, Some(update.value))
            .await?,
    ))
}
async fn delete(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(reference): Path<String>,
    Json(value): Json<Value>,
) -> Result<Json<CredentialMetadata>> {
    host.auth.require(&headers, Scope::Resources)?;
    let delete: Delete = serde_json::from_value(value)
        .map_err(|_| HostError::Invalid("invalid credential deletion".into()))?;
    Ok(Json(
        store(&host)?
            .set(&reference, delete.expected_revision, None)
            .await?,
    ))
}
