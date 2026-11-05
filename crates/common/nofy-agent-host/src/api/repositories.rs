use super::*;
use nofy_agent_project::Source;
use nofy_agent_project::repository::{ModuleStore, RepositoryOrigin, RepositoryView};
mod git;

pub(super) fn router() -> Router<KernelHost> {
    Router::new()
        .route("/api/v1/module-repositories", get(list))
        .route(
            "/api/v1/module-repositories/{repository}",
            get(inspect).put(register).delete(remove),
        )
        .route(
            "/api/v1/module-repositories/{repository}/sync",
            post(synchronize),
        )
        .route(
            "/api/v1/module-repositories/{repository}/packages",
            post(publish),
        )
        .route(
            "/api/v1/module-repositories/{repository}/packages/{name}/{version}",
            get(package),
        )
        .route("/api/v1/module-packages", get(packages))
        .route("/api/v1/module-packages/{digest}", get(source))
        .route("/api/v1/module-packages/gc", post(gc))
        .route(
            "/api/v1/module-repositories/{repository}/packages/{name}/{version}/yank",
            post(yank),
        )
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Yank {
    expected_revision: String,
    yanked: bool,
}
async fn yank(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path((repository, name, version)): Path<(String, String, String)>,
    Json(q): Json<Yank>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Publish)?;
    let store = host.module_library.clone();
    Ok(Json(
        blocking(move || {
            Ok(store.set_yanked(&repository, &name, &version, &q.expected_revision, q.yanked)?)
        })
        .await?,
    ))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct GarbageCollect {
    #[serde(default = "gc_preview")]
    dry_run: bool,
}
fn gc_preview() -> bool {
    true
}
async fn gc(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(q): Json<GarbageCollect>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Publish)?;
    let store = host.module_library.clone();
    Ok(Json(
        blocking(move || Ok(store.garbage_collect(q.dry_run)?)).await?,
    ))
}
async fn blocking<T: Send + 'static>(
    work: impl FnOnce() -> Result<T> + Send + 'static,
) -> Result<T> {
    tokio::task::spawn_blocking(work)
        .await
        .map_err(|_| HostError::Unavailable("module repository worker failed".into()))?
}
fn admit(origin: &RepositoryOrigin, library: &ModuleStore) -> Result<()> {
    origin.validate()?;
    match origin {
        RepositoryOrigin::Managed => Ok(()),
        RepositoryOrigin::Directory { host_path } => {
            let canonical = host_path
                .canonicalize()
                .map_err(|_| HostError::Invalid("module source directory is unavailable".into()))?;
            let private = library
                .root()
                .parent()
                .ok_or_else(|| HostError::Unavailable("module store parent missing".into()))?
                .canonicalize()
                .map_err(|_| HostError::Unavailable("host state is unavailable".into()))?;
            if canonical != *host_path
                || !canonical.is_dir()
                || canonical.starts_with(&private)
                || private.starts_with(&canonical)
            {
                return Err(HostError::Invalid(
                    "module source requires a canonical directory outside private host state"
                        .into(),
                ));
            }
            Ok(())
        }
        RepositoryOrigin::Git { url, .. } => git::admit_url(url, library),
    }
}
async fn list(State(host): State<KernelHost>, headers: HeaderMap) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.module_library.clone();
    Ok(Json(
        blocking(move || Ok(json!({"repositories":store.list()?}))).await?,
    ))
}
async fn inspect(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(repository): Path<String>,
) -> Result<Json<RepositoryView>> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.module_library.clone();
    Ok(Json(blocking(move || Ok(store.get(&repository)?)).await?))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Register {
    origin: RepositoryOrigin,
    expected_revision: Option<String>,
}
async fn register(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(repository): Path<String>,
    Json(q): Json<Register>,
) -> Result<Json<RepositoryView>> {
    host.auth.require(&headers, Scope::Edit)?;
    if !matches!(q.origin, RepositoryOrigin::Managed) {
        host.auth.require(&headers, Scope::Resources)?;
    }
    let store = host.module_library.clone();
    Ok(Json(
        blocking(move || {
            admit(&q.origin, &store)?;
            Ok(store.put(&repository, q.expected_revision.as_deref(), q.origin)?)
        })
        .await?,
    ))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Revision {
    expected_revision: String,
}
async fn remove(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(repository): Path<String>,
    Json(q): Json<Revision>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Edit)?;
    let store = host.module_library.clone();
    Ok(Json(
        blocking(move || Ok(store.remove(&repository, &q.expected_revision)?)).await?,
    ))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Publish {
    expected_revision: String,
    source: Source,
}
async fn publish(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(repository): Path<String>,
    Json(q): Json<Publish>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Publish)?;
    let store = host.module_library.clone();
    Ok(Json(
        blocking(move || {
            let (repository, package) =
                store.publish(&repository, &q.expected_revision, q.source)?;
            Ok(json!({"repository":repository,"package":package}))
        })
        .await?,
    ))
}
async fn synchronize(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(repository): Path<String>,
    Json(q): Json<Revision>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Edit)?;
    host.auth.require(&headers, Scope::Resources)?;
    let store = host.module_library.clone();
    let lookup = store.clone();
    let id = repository.clone();
    let view = blocking(move || {
        let view = lookup.get(&id)?;
        admit(&view.origin, &lookup)?;
        Ok(view)
    })
    .await?;
    if view.revision != q.expected_revision {
        return Err(
            nofy_agent_project::Error::new("conflict", "repository revision changed").into(),
        );
    }
    let (sources, source_revision) = match &view.origin {
        RepositoryOrigin::Managed => {
            return Err(HostError::Invalid(
                "managed module repositories use module.publish".into(),
            ));
        }
        RepositoryOrigin::Directory { host_path } => {
            let path = host_path.clone();
            blocking(move || {
                Ok(nofy_agent_project::repository::load_repository_directory(
                    &path,
                )?)
            })
            .await?
        }
        RepositoryOrigin::Git { .. } => git::collect(&view.origin, store.root()).await?,
    };
    Ok(Json(
        blocking(move || {
            let (repository, packages) =
                store.synchronize(&repository, &q.expected_revision, sources, source_revision)?;
            Ok(json!({"repository":repository,"packages":packages}))
        })
        .await?,
    ))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Page {
    repository: Option<String>,
    #[serde(default)]
    after: String,
    #[serde(default = "page_limit")]
    limit: usize,
}
fn page_limit() -> usize {
    32
}
async fn packages(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Query(q): Query<Page>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.module_library.clone();
    Ok(Json(
        blocking(move || Ok(store.packages(q.repository.as_deref(), &q.after, q.limit)?)).await?,
    ))
}
async fn package(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path((repository, name, version)): Path<(String, String, String)>,
) -> Result<Json<nofy_agent_project::repository::PackageView>> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.module_library.clone();
    Ok(Json(
        blocking(move || Ok(store.package(&repository, &name, &version)?)).await?,
    ))
}
async fn source(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(digest): Path<String>,
) -> Result<Json<Source>> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.module_library.clone();
    Ok(Json(blocking(move || Ok(store.source(&digest)?)).await?))
}
