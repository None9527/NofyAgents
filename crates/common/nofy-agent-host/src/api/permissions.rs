use super::*;
pub(super) fn router() -> Router<KernelHost> {
    Router::new()
        .route("/api/v1/approval-grants", get(grants))
        .route("/api/v1/approval-grants/{id}/revoke", post(revoke))
        .route("/api/v1/command-analysis", post(analyze))
}
#[derive(Deserialize)]
#[serde(default, deny_unknown_fields)]
struct Page {
    after: String,
    limit: usize,
    include_revoked: bool,
}
impl Default for Page {
    fn default() -> Self {
        Self {
            after: String::new(),
            limit: 64,
            include_revoked: false,
        }
    }
}
async fn grants(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Query(page): Query<Page>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(json!(
        host.store
            .approval_grants(&page.after, page.limit, page.include_revoked)
            .await?
    )))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Revoke {
    expected_revision: String,
    command_id: String,
}
async fn revoke(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(request): Json<Revoke>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Execute)?;
    let revision = request
        .expected_revision
        .parse::<u64>()
        .map_err(|_| HostError::Invalid("expected exact grant revision".into()))?;
    if revision.to_string() != request.expected_revision {
        return Err(HostError::Invalid("noncanonical grant revision".into()));
    }
    Ok(Json(json!(
        host.store
            .revoke_approval_grant(&id, revision, &request.command_id)
            .await?
    )))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Command {
    command: Value,
}
async fn analyze(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(request): Json<Command>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(json!(
        nofy_agent_runtime::policy::command::analyze_command(&request.command)?
    )))
}
