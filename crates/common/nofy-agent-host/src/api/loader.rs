use super::*;
use crate::loader::{
    artifacts::ArtifactInfo,
    runtimes::{RuntimeInstall, RuntimeManifest},
};
use nofy_agent_runtime::artifact::ArtifactBundle;
#[derive(Clone)]
pub(super) struct ManagementAdmission(pub std::sync::Arc<tokio::sync::OwnedSemaphorePermit>);
pub(super) async fn resource_backpressure(
    State(host): State<KernelHost>,
    mut request: axum::extract::Request,
    next: Next,
) -> Result<Response> {
    let path = request
        .extensions()
        .get::<axum::extract::MatchedPath>()
        .map(|p| p.as_str())
        .unwrap_or_default();
    let heavy = matches!(
        path,
        "/api/v1/validate"
            | "/api/v1/import"
            | "/api/v1/drafts/{name}"
            | "/api/v1/runtime-images"
            | "/api/v1/runtime-images/{digest}"
            | "/api/v1/releases/{release}/deployment"
            | "/api/v1/runtimes"
            | "/api/v1/runtimes/probe"
            | "/api/v1/loader/cache"
            | "/api/v1/loader/references"
            | "/api/v1/prompts/preview"
    );
    // Runs, cancellation, approvals, actions and event streams never wait here.
    // This layer executes after authentication and before JSON extraction.
    let _permit = if heavy {
        Some(std::sync::Arc::new(tokio::select! {biased;
            _=host.stop.cancelled()=>return Err(HostError::Unavailable("host is shutting down".into())),
            permit=host.loader.management_work.clone().acquire_owned()=>permit.map_err(|e|HostError::Unavailable(e.to_string()))?,
        }))
    } else {
        None
    };
    if let Some(permit) = &_permit {
        request
            .extensions_mut()
            .insert(ManagementAdmission(permit.clone()));
    }
    Ok(next.run(request).await)
}
pub(super) fn router() -> Router<KernelHost> {
    Router::new()
        .route("/api/v1/artifacts", post(put_artifact).get(artifacts))
        .route("/api/v1/artifacts/{digest}", get(artifact))
        .route("/api/v1/runtimes", post(install_runtime).get(runtimes))
        .route("/api/v1/runtimes/probe", post(probe))
        .route("/api/v1/runtime-images", post(put_image).get(images))
        .route("/api/v1/runtime-images/{digest}", get(image))
        .route("/api/v1/releases/{release}/deployment", get(deployment))
}
async fn put_image(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(image): Json<crate::loader::images::RuntimeImage>,
) -> Result<Json<crate::loader::images::ImageInfo>> {
    host.auth.require(&headers, Scope::Resources)?;
    let store = host.loader.images.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || store.put(image))
            .await
            .map_err(|e| HostError::Unavailable(e.to_string()))??,
    ))
}
async fn image(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(digest): Path<String>,
) -> Result<Json<crate::loader::images::RuntimeImage>> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.loader.images.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || store.get(&digest))
            .await
            .map_err(|e| HostError::Unavailable(e.to_string()))??,
    ))
}
async fn images(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Query(page): Query<ImagePage>,
) -> Result<Json<Vec<crate::loader::images::ImageInfo>>> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.loader.images.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || store.list(&page.after, page.limit))
            .await
            .map_err(|e| HostError::Unavailable(e.to_string()))??,
    ))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ImagePage {
    #[serde(default)]
    after: String,
    #[serde(default = "image_page_limit")]
    limit: usize,
}
fn image_page_limit() -> usize {
    8
}
async fn deployment(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(release): Path<String>,
    Query(options): Query<ExportOptions>,
) -> Result<Json<crate::loader::deployment::SourcedDeployment>> {
    host.auth.require(&headers, Scope::Read)?;
    let bundle = host.control.export(&release).await?;
    match options.mode {
        ExportMode::Sources => Ok(Json(host.loader.export_sourced_deployment(bundle).await?)),
    }
}
#[derive(Deserialize, Default)]
#[serde(rename_all = "snake_case")]
enum ExportMode {
    #[default]
    Sources,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ExportOptions {
    #[serde(default)]
    mode: ExportMode,
}
async fn put_artifact(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(bundle): Json<ArtifactBundle>,
) -> Result<Json<ArtifactInfo>> {
    host.auth.require(&headers, Scope::Resources)?;
    let store = host.loader.artifacts.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || store.put(bundle))
            .await
            .map_err(|e| HostError::Unavailable(e.to_string()))??,
    ))
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
    100
}
async fn artifacts(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Query(page): Query<Page>,
) -> Result<Json<Vec<ArtifactInfo>>> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.loader.artifacts.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || store.list(&page.after, page.limit))
            .await
            .map_err(|e| HostError::Unavailable(e.to_string()))??,
    ))
}
async fn artifact(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(digest): Path<String>,
) -> Result<Json<ArtifactBundle>> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.loader.artifacts.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || store.get(&digest))
            .await
            .map_err(|e| HostError::Unavailable(e.to_string()))??,
    ))
}
async fn runtimes(
    State(host): State<KernelHost>,
    headers: HeaderMap,
) -> Result<Json<Vec<RuntimeManifest>>> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.loader.runtimes.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || store.list())
            .await
            .map_err(|e| HostError::Unavailable(e.to_string()))??,
    ))
}
async fn install_runtime(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(request): Json<RuntimeInstall>,
) -> Result<Json<RuntimeManifest>> {
    host.auth.require(&headers, Scope::Resources)?;
    let loader = host.loader.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || {
            loader.probe()?;
            loader.runtimes.install(request)
        })
        .await
        .map_err(|e| HostError::Unavailable(e.to_string()))??,
    ))
}
async fn probe(State(host): State<KernelHost>, headers: HeaderMap) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Resources)?;
    let loader = host.loader.clone();
    Ok(Json(
        tokio::task::spawn_blocking(move || loader.probe())
            .await
            .map_err(|e| HostError::Unavailable(e.to_string()))??,
    ))
}

#[cfg(test)]
mod tests {
    use super::*;
    #[tokio::test]
    async fn heavy_body_waits_for_admission_but_reads_and_cancel_remain_responsive() {
        use crate::{auth::Authorizer, native};
        use nofy_agent_runtime::credentials::EnvironmentCredentials;
        let dir = tempfile::tempdir().unwrap();
        let token = "admission-fixture-0000000000000000000001";
        let registry = native::registry(std::sync::Arc::new(
            EnvironmentCredentials::new("admission", "NOFY_ADMISSION_FIXTURE_").unwrap(),
        ))
        .unwrap();
        let auth =
            Authorizer::new(vec![(token.into(), [Scope::Read, Scope::Execute].into())]).unwrap();
        let host = KernelHost::open(dir.path(), registry, auth).await.unwrap();
        let held = host
            .loader
            .management_work
            .clone()
            .acquire_many_owned(2)
            .await
            .unwrap();
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let url = format!("http://{}", listener.local_addr().unwrap());
        let stop = tokio_util::sync::CancellationToken::new();
        let shutdown = stop.clone();
        let router = host.router();
        let server = tokio::spawn(async move {
            axum::serve(listener, router)
                .with_graceful_shutdown(async move { shutdown.cancelled().await })
                .await
                .unwrap()
        });
        let client = reqwest::Client::new();
        let send = |url: String| {
            let client = client.clone();
            async move {
                client
                    .post(format!("{url}/api/v1/validate"))
                    .bearer_auth(token)
                    .header("content-type", "application/json")
                    .body("{")
                    .send()
                    .await
                    .unwrap()
            }
        };
        let mut pending = tokio::spawn(send(url.clone()));
        assert!(
            tokio::time::timeout(std::time::Duration::from_millis(100), &mut pending)
                .await
                .is_err()
        );
        let modules = tokio::time::timeout(
            std::time::Duration::from_secs(2),
            client
                .get(format!("{url}/api/v1/modules"))
                .bearer_auth(token)
                .send(),
        )
        .await
        .unwrap()
        .unwrap();
        assert_eq!(modules.status(), 200);
        let cancel = tokio::time::timeout(
            std::time::Duration::from_secs(2),
            client
                .post(format!("{url}/api/v1/runs/missing/cancel"))
                .bearer_auth(token)
                .json(&json!({"command_id":"missing"}))
                .send(),
        )
        .await
        .unwrap()
        .unwrap();
        assert!(cancel.status().is_client_error());
        drop(held);
        assert_eq!(
            tokio::time::timeout(std::time::Duration::from_secs(2), pending)
                .await
                .unwrap()
                .unwrap()
                .status(),
            400
        );
        let held = host
            .loader
            .management_work
            .clone()
            .acquire_many_owned(2)
            .await
            .unwrap();
        let mut waiting = tokio::spawn(send(url));
        assert!(
            tokio::time::timeout(std::time::Duration::from_millis(100), &mut waiting)
                .await
                .is_err()
        );
        host.shutdown();
        assert_eq!(
            tokio::time::timeout(std::time::Duration::from_secs(2), waiting)
                .await
                .unwrap()
                .unwrap()
                .status(),
            503
        );
        drop(held);
        stop.cancel();
        server.await.unwrap();
    }
}
