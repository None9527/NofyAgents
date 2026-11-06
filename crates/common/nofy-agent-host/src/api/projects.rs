use super::*;
use nofy_agent_project::{FactoryKinds, ProjectView, Source};
use serde::Serialize;

pub(super) fn router() -> Router<KernelHost> {
    Router::new()
        .route("/api/v1/presets", get(presets))
        .route("/api/v1/presets/{id}", get(template))
        .route("/api/v1/projects", get(list).post(create))
        .route("/api/v1/projects/{id}", get(inspect).delete(delete_project))
        .route("/api/v1/projects/{id}/edits", post(edit))
        .route("/api/v1/projects/{id}/build", post(build))
        .route("/api/v1/projects/{id}/preview", post(preview))
        .route("/api/v1/projects/{id}/source", get(source))
        .route("/api/v1/projects/{id}/archive", post(archive))
        .route("/api/v1/source-archives", post(pack_source))
        .route("/api/v1/source-archives/{digest}", get(download))
        .route("/api/v1/source-archives/{digest}/chunks", get(chunk))
}
fn kinds(host: &KernelHost) -> FactoryKinds {
    host.registry
        .descriptors()
        .into_iter()
        .map(|d| {
            (
                d.factory,
                serde_json::to_value(d.kind)
                    .ok()
                    .and_then(|v| v.as_str().map(str::to_owned))
                    .unwrap_or_default(),
            )
        })
        .collect()
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct DeleteProject {
    expected_revision: String,
}
async fn delete_project(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(q): Json<DeleteProject>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Edit)?;
    let store = host.projects.clone();
    Ok(Json(
        blocking(move || Ok(store.delete(&id, &q.expected_revision)?)).await?,
    ))
}
fn view(
    project: ProjectView,
    kinds: &FactoryKinds,
    library: &nofy_agent_project::repository::ModuleStore,
) -> Result<Value> {
    let resolved = library.hydrate(&project.source);
    let mut inspection = match resolved {
        Ok(source) => nofy_agent_project::inspect(&source, kinds)?,
        Err(error) => {
            let mut inspection = nofy_agent_project::inspect(&project.source, kinds)?;
            inspection["status"] = json!("incomplete");
            inspection["issue"] =
                json!({"code":error.code,"message":error.message,"details":error.details});
            inspection
        }
    };
    inspection["source_digest"] = json!(project.source_digest);
    Ok(
        json!({"project_id":project.project_id,"revision":project.revision,"source_digest":project.source_digest,"source":project.source,"inspection":inspection}),
    )
}
async fn blocking<T: Send + 'static>(f: impl FnOnce() -> Result<T> + Send + 'static) -> Result<T> {
    tokio::task::spawn_blocking(f)
        .await
        .map_err(|e| HostError::Unavailable(e.to_string()))?
}
async fn presets(State(host): State<KernelHost>, headers: HeaderMap) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    let registry = host.templates.clone();
    Ok(Json(
        blocking(move || match registry {
            Some(r) => Ok(r.list()?),
            None => Ok(json!({"format":"nofy.preset-registry/v1","presets":[]})),
        })
        .await?,
    ))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct TemplateQuery {
    version: Option<String>,
    agent: Option<String>,
}
async fn template(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Query(q): Query<TemplateQuery>,
) -> Result<Json<Source>> {
    host.auth.require(&headers, Scope::Read)?;
    let registry = host.templates.clone().ok_or(HostError::NotFound)?;
    Ok(Json(
        blocking(move || Ok(registry.get(&id, q.version.as_deref(), q.agent.as_deref())?)).await?,
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
    32
}
async fn list(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Query(q): Query<Page>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.projects.clone();
    let kinds = kinds(&host);
    let library = host.module_library.clone();
    Ok(Json(
        blocking(move || {
            let page = store.list(&q.after, q.limit)?;
            let cursor = if page.len() == q.limit {
                page.last().map(|p| p.project_id.clone())
            } else {
                None
            };
            let items = page
                .into_iter()
                .map(|p| view(p, &kinds, &library))
                .collect::<Result<Vec<_>>>()?;
            Ok(json!({"projects":items,"next_cursor":cursor}))
        })
        .await?,
    ))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Create {
    project_id: String,
    agent: Option<String>,
    preset: Option<String>,
    version: Option<String>,
    source: Option<Source>,
    expected_revision: Option<String>,
}
async fn create(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(q): Json<Create>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Edit)?;
    let store = host.projects.clone();
    let templates = host.templates.clone();
    let kinds = kinds(&host);
    let library = host.module_library.clone();
    Ok(Json(
        blocking(move || {
            let source = match (q.source, q.preset) {
                (Some(_), Some(_)) => {
                    return Err(HostError::Invalid("choose source or preset".into()));
                }
                (Some(s), None) => s,
                (None, Some(id)) => templates.ok_or(HostError::NotFound)?.get(
                    &id,
                    q.version.as_deref(),
                    q.agent.as_deref(),
                )?,
                (None, None) => {
                    let agent = q.agent.as_deref().ok_or_else(|| {
                        HostError::Invalid("agent required for empty project".into())
                    })?;
                    Source::empty(agent, &q.project_id)?
                }
            };
            view(
                store.put(&q.project_id, q.expected_revision.as_deref(), source)?,
                &kinds,
                &library,
            )
        })
        .await?,
    ))
}
async fn inspect(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.projects.clone();
    let kinds = kinds(&host);
    let library = host.module_library.clone();
    Ok(Json(
        blocking(move || view(store.get(&id)?, &kinds, &library)).await?,
    ))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Edit {
    expected_revision: String,
    operation: String,
    input: Value,
}
async fn edit(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(q): Json<Edit>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Edit)?;
    let store = host.projects.clone();
    let kinds = kinds(&host);
    let library = host.module_library.clone();
    if !matches!(
        q.operation.as_str(),
        "agent.create"
            | "agent.delete"
            | "agent.configure"
            | "agent.module.add"
            | "agent.tool.add"
            | "agent.module.set"
            | "agent.module.bind"
            | "agent.module.detach"
            | "agent.module.remove"
            | "agent.module.use"
            | "agent.module.unuse"
    ) {
        return Err(HostError::Invalid("unregistered project edit".into()));
    }
    if q.input
        .get("module_ref")
        .and_then(Value::as_str)
        .is_some_and(|v| v.starts_with("nofy://"))
    {
        return Err(HostError::Invalid(
            "import cross-release module closures before editing".into(),
        ));
    }
    Ok(Json(
        blocking(move || {
            view(
                store.update(&id, Some(&q.expected_revision), |before| {
                    let mut source = before.cloned().ok_or_else(|| {
                        nofy_agent_project::Error::new("not_found", "project not found")
                    })?;
                    if let Some(imported) = q.input.get("imported_modules") {
                        let modules: Vec<Value> = serde_json::from_value(imported.clone())?;
                        nofy_agent_project::import_modules(&mut source, &modules)?;
                    }
                    match q.operation.as_str() {
                        "agent.module.use" => {
                            let package = library.package(
                                nofy_agent_project::text(&q.input, "repository")?,
                                nofy_agent_project::text(&q.input, "name")?,
                                nofy_agent_project::text(&q.input, "version")?,
                            )?;
                            nofy_agent_project::repository::use_package(
                                &mut source,
                                &package,
                                &q.input,
                                &kinds,
                            )?;
                        }
                        "agent.module.unuse" => {
                            let agent = nofy_agent_project::text(&q.input, "agent")?;
                            if !nofy_agent_project::agent_names(&source)?
                                .iter()
                                .any(|a| a == agent)
                            {
                                return Err(nofy_agent_project::Error::new(
                                    "not_found",
                                    "Agent not found",
                                ));
                            }
                            nofy_agent_project::repository::unuse_package(
                                &mut source,
                                nofy_agent_project::text(&q.input, "alias")?,
                            )?;
                        }
                        _ => {
                            nofy_agent_project::edit(&mut source, &q.operation, &q.input, &kinds)?;
                        }
                    }
                    Ok(source)
                })?,
                &kinds,
                &library,
            )
        })
        .await?,
    ))
}
async fn source(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<Source>> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.projects.clone();
    Ok(Json(blocking(move || Ok(store.get(&id)?.source)).await?))
}
async fn build(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.projects.clone();
    let kinds = kinds(&host);
    let library = host.module_library.clone();
    Ok(Json(
        blocking(move || {
            let p = store.get(&id)?;
            let mut result = nofy_agent_project::build(&library.hydrate(&p.source)?, &kinds)?;
            result["source_digest"] = json!(p.source_digest);
            result["project_id"] = json!(p.project_id);
            result["revision"] = json!(p.revision);
            Ok(result)
        })
        .await?,
    ))
}
async fn preview(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.projects.clone();
    let kinds = kinds(&host);
    let library = host.module_library.clone();
    let built = blocking(move || {
        let project = store.get(&id)?;
        let mut result = nofy_agent_project::build(&library.hydrate(&project.source)?, &kinds)?;
        result["source_digest"] = json!(project.source_digest);
        Ok(result)
    })
    .await?;
    let file =
        DeploymentFile::from_json(built["deployment_json"].as_str().unwrap_or("").as_bytes())?;
    let file = host.loader.prepare_deployment(file, false).await?;
    let registry = host.registry.clone();
    let system = blocking(move || Ok(file.prepare(&registry)?)).await?;
    let name = &system.bundle.document.name;
    let active = host
        .control
        .inspect()
        .await?
        .and_then(|v| v.data.active.get(name).cloned());
    let previous = match &active {
        Some(a) => Some(host.control.export(&a.release).await?),
        None => None,
    };
    Ok(Json(
        json!({"system":name,"candidate_release":system.bundle.digest,"expected_generation":active.as_ref().map(|v|v.generation.to_string()),"diff_json":serde_json::to_string(&system.bundle.diff(previous.as_ref())?).map_err(|e|HostError::Invalid(e.to_string()))?,"published":false}),
    ))
}
async fn archive(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.projects.clone();
    let library = host.module_library.clone();
    Ok(Json(
        blocking(move || Ok(store.archive(&library.hydrate(&store.get(&id)?.source)?)?)).await?,
    ))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Pack {
    source: Source,
}
async fn pack_source(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(q): Json<Pack>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.projects.clone();
    let library = host.module_library.clone();
    Ok(Json(
        blocking(move || Ok(store.archive(&library.hydrate(&q.source)?)?)).await?,
    ))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Chunk {
    #[serde(default)]
    offset: u64,
    #[serde(default = "chunk_limit")]
    limit: usize,
}
fn chunk_limit() -> usize {
    64 * 1024
}
#[derive(Serialize)]
struct ChunkView {
    offset: String,
    next_offset: String,
    total: String,
    eof: bool,
    encoding: &'static str,
    content: String,
    sha256: String,
}
async fn chunk(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Query(q): Query<Chunk>,
) -> Result<Json<ChunkView>> {
    host.auth.require(&headers, Scope::Read)?;
    if !(1..=1024 * 1024).contains(&q.limit) {
        return Err(HostError::Invalid("chunk limit must be 1..1048576".into()));
    }
    let store = host.projects.clone();
    Ok(Json(
        blocking(move || {
            use base64::Engine;
            use std::io::{Read, Seek, SeekFrom};
            let mut file = std::fs::File::open(store.archive_path(&id)?)
                .map_err(|e| HostError::Unavailable(e.to_string()))?;
            let total = file
                .metadata()
                .map_err(|e| HostError::Unavailable(e.to_string()))?
                .len();
            if q.offset > total {
                return Err(HostError::Invalid(
                    "archive offset exceeds total size".into(),
                ));
            }
            file.seek(SeekFrom::Start(q.offset))
                .map_err(|e| HostError::Unavailable(e.to_string()))?;
            let mut bytes = vec![];
            file.take(q.limit as u64)
                .read_to_end(&mut bytes)
                .map_err(|e| HostError::Unavailable(e.to_string()))?;
            let next = q.offset + bytes.len() as u64;
            Ok(ChunkView {
                offset: q.offset.to_string(),
                next_offset: next.to_string(),
                total: total.to_string(),
                eof: next == total,
                encoding: "base64",
                content: base64::engine::general_purpose::STANDARD.encode(bytes),
                sha256: id,
            })
        })
        .await?,
    ))
}
async fn download(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Response> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.projects.clone();
    let path = blocking(move || Ok(store.archive_path(&id)?)).await?;
    let mut file = tokio::fs::File::open(path)
        .await
        .map_err(|e| HostError::Unavailable(e.to_string()))?;
    let total = file
        .metadata()
        .await
        .map_err(|e| HostError::Unavailable(e.to_string()))?
        .len();
    let stream = async_stream::stream! {
        use tokio::io::AsyncReadExt;
        loop {
            let mut chunk=vec![0u8;64*1024];
            match file.read(&mut chunk).await {
                Ok(0)=>break,
                Ok(n)=>{chunk.truncate(n);yield Ok::<_,std::io::Error>(axum::body::Bytes::from(chunk));},
                Err(error)=>{yield Err(error);break;}
            }
        }
    };
    Ok((
        [
            ("content-type", "application/gzip"),
            ("content-length", &total.to_string()),
        ],
        axum::body::Body::from_stream(stream),
    )
        .into_response())
}
