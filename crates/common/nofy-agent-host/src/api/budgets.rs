use super::*;
use nofy_agent_runtime::governance::BudgetPage;

pub(super) fn router() -> Router<KernelHost> {
    Router::new().route("/api/v1/budgets", get(list))
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
    32
}
async fn list(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Query(page): Query<Page>,
) -> Result<Json<BudgetPage>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(host.store.budget_page(&page.after, page.limit).await?))
}
