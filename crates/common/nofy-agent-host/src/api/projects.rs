use super::*;
use axum::Extension;
use nofy_agent_project::{FactoryKinds, ProjectView, Source};
use serde::Serialize;
use std::{
    collections::{HashMap, VecDeque},
    sync::{Arc, Mutex},
    time::{Duration, Instant},
};

const MAX_CACHED_ARCHIVES: usize = 64;
const MAX_CACHED_ARCHIVE_TOTAL_BYTES: usize = 64 * 1024 * 1024;
const MAX_SINGLE_ARCHIVE_BYTES: usize = 32 * 1024 * 1024;
const ARCHIVE_CACHE_TTL: Duration = Duration::from_secs(15 * 60);

struct CachedArchive {
    bytes: Arc<Vec<u8>>,
    inserted_at: Instant,
}

#[derive(Default)]
struct ArchiveCacheState {
    entries: HashMap<String, CachedArchive>,
    order: VecDeque<String>,
    total_bytes: usize,
}

#[derive(Default)]
struct ArchiveCache {
    state: Mutex<ArchiveCacheState>,
    max_entries: usize,
    max_total_bytes: usize,
    max_single_bytes: usize,
    ttl: Duration,
}

impl ArchiveCache {
    fn new() -> Self {
        Self::with_limits(
            MAX_CACHED_ARCHIVES,
            MAX_CACHED_ARCHIVE_TOTAL_BYTES,
            MAX_SINGLE_ARCHIVE_BYTES,
            ARCHIVE_CACHE_TTL,
        )
    }

    fn with_limits(
        max_entries: usize,
        max_total_bytes: usize,
        max_single_bytes: usize,
        ttl: Duration,
    ) -> Self {
        Self {
            state: Mutex::new(ArchiveCacheState::default()),
            max_entries,
            max_total_bytes,
            max_single_bytes,
            ttl,
        }
    }

    fn prune_expired(state: &mut ArchiveCacheState, now: Instant, ttl: Duration) {
        while let Some(front) = state.order.front() {
            let expired = state
                .entries
                .get(front)
                .is_none_or(|entry| now.saturating_duration_since(entry.inserted_at) >= ttl);
            if !expired {
                break;
            }
            if let Some(key) = state.order.pop_front()
                && let Some(removed) = state.entries.remove(&key)
            {
                state.total_bytes = state.total_bytes.saturating_sub(removed.bytes.len());
            }
        }
    }

    fn insert(&self, digest: String, bytes: Vec<u8>) -> Result<()> {
        if bytes.len() > self.max_single_bytes || bytes.len() > self.max_total_bytes {
            return Err(HostError::Invalid(
                "source archive exceeds in-memory cache limit".into(),
            ));
        }
        let now = Instant::now();
        let mut state = self
            .state
            .lock()
            .map_err(|_| HostError::Unavailable("archive cache unavailable".into()))?;
        Self::prune_expired(&mut state, now, self.ttl);
        if let Some(existing) = state.entries.get_mut(&digest) {
            existing.inserted_at = now;
            state.order.retain(|key| key != &digest);
            state.order.push_back(digest);
            return Ok(());
        }
        let incoming = bytes.len();
        while state.entries.len() >= self.max_entries
            || state.total_bytes.saturating_add(incoming) > self.max_total_bytes
        {
            let Some(oldest) = state.order.pop_front() else {
                break;
            };
            if let Some(removed) = state.entries.remove(&oldest) {
                state.total_bytes = state.total_bytes.saturating_sub(removed.bytes.len());
            }
        }
        state.total_bytes = state.total_bytes.saturating_add(incoming);
        state.entries.insert(
            digest.clone(),
            CachedArchive {
                bytes: Arc::new(bytes),
                inserted_at: now,
            },
        );
        state.order.push_back(digest);
        Ok(())
    }

    fn get(&self, digest: &str) -> Result<Option<Arc<Vec<u8>>>> {
        validate_archive_digest(digest)?;
        let now = Instant::now();
        let mut state = self
            .state
            .lock()
            .map_err(|_| HostError::Unavailable("archive cache unavailable".into()))?;
        Self::prune_expired(&mut state, now, self.ttl);
        let Some(entry) = state.entries.get_mut(digest) else {
            return Ok(None);
        };
        entry.inserted_at = now;
        let bytes = Arc::clone(&entry.bytes);
        state.order.retain(|key| key != digest);
        state.order.push_back(digest.to_owned());
        Ok(Some(bytes))
    }
}

fn validate_archive_digest(id: &str) -> Result<()> {
    if id.len() != 64
        || !id
            .bytes()
            .all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
    {
        return Err(HostError::Source(nofy_agent_project::Error::new(
            "local_input",
            "invalid archive digest",
        )));
    }
    Ok(())
}

fn pack_in_memory(cache: &ArchiveCache, source: &Source) -> Result<Value> {
    let bytes = nofy_agent_project::pack(source)?;
    let digest = nofy_agent_project::digest(&bytes);
    let mut info = nofy_agent_project::archive_info(source, &bytes)?;
    cache.insert(digest.clone(), bytes)?;
    info["uri"] = json!(format!("nofy://source-archives/{digest}"));
    info["download_path"] = json!(format!("/api/v1/source-archives/{digest}"));
    Ok(info)
}

pub(super) fn router() -> Router<KernelHost> {
    let cache = Arc::new(ArchiveCache::new());
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
        .layer(Extension(cache))
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
    Extension(cache): Extension<Arc<ArchiveCache>>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    let store = host.projects.clone();
    let library = host.module_library.clone();
    Ok(Json(
        blocking(move || {
            let source = library.hydrate(&store.get(&id)?.source)?;
            pack_in_memory(&cache, &source)
        })
        .await?,
    ))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Pack {
    source: Source,
}
async fn pack_source(
    State(host): State<KernelHost>,
    Extension(cache): Extension<Arc<ArchiveCache>>,
    headers: HeaderMap,
    Json(q): Json<Pack>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    let library = host.module_library.clone();
    Ok(Json(
        blocking(move || {
            let source = library.hydrate(&q.source)?;
            pack_in_memory(&cache, &source)
        })
        .await?,
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
    Extension(cache): Extension<Arc<ArchiveCache>>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Query(q): Query<Chunk>,
) -> Result<Json<ChunkView>> {
    host.auth.require(&headers, Scope::Read)?;
    if !(1..=1024 * 1024).contains(&q.limit) {
        return Err(HostError::Invalid("chunk limit must be 1..1048576".into()));
    }
    if let Some(archive_bytes) = cache.get(&id)? {
        use base64::Engine;
        let total = archive_bytes.len() as u64;
        if q.offset > total {
            return Err(HostError::Invalid(
                "archive offset exceeds total size".into(),
            ));
        }
        let start = usize::try_from(q.offset)
            .map_err(|_| HostError::Invalid("archive offset exceeds total size".into()))?;
        let end = start.saturating_add(q.limit).min(archive_bytes.len());
        let slice = &archive_bytes[start..end];
        let next = q.offset + slice.len() as u64;
        return Ok(Json(ChunkView {
            offset: q.offset.to_string(),
            next_offset: next.to_string(),
            total: total.to_string(),
            eof: next == total,
            encoding: "base64",
            content: base64::engine::general_purpose::STANDARD.encode(slice),
            sha256: id,
        }));
    }
    let store = host.projects.clone();
    Ok(Json(
        blocking(move || {
            use base64::Engine;
            use std::io::{Read, Seek, SeekFrom};
            let mut options = std::fs::OpenOptions::new();
            options.read(true);
            let mut file = nofy_host_path::open_no_follow(&options, &store.archive_path(&id)?)
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
    Extension(cache): Extension<Arc<ArchiveCache>>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Response> {
    host.auth.require(&headers, Scope::Read)?;
    if let Some(archive_bytes) = cache.get(&id)? {
        let total = archive_bytes.len();
        let stream = async_stream::stream! {
            let mut offset = 0usize;
            while offset < archive_bytes.len() {
                let end = offset.saturating_add(64 * 1024).min(archive_bytes.len());
                yield Ok::<_, std::io::Error>(axum::body::Bytes::copy_from_slice(
                    &archive_bytes[offset..end],
                ));
                offset = end;
            }
        };
        return Ok((
            [
                ("content-type", "application/gzip"),
                ("content-length", &total.to_string()),
            ],
            axum::body::Body::from_stream(stream),
        )
            .into_response());
    }
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
            let mut chunk = vec![0u8; 64 * 1024];
            match file.read(&mut chunk).await {
                Ok(0) => break,
                Ok(n) => {
                    chunk.truncate(n);
                    yield Ok::<_, std::io::Error>(axum::body::Bytes::from(chunk));
                }
                Err(error) => {
                    yield Err(error);
                    break;
                }
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

#[cfg(test)]
mod archive_cache_tests {
    use super::*;

    fn hex_digest(tag: u8) -> String {
        format!("{tag:02x}").repeat(32)
    }

    #[test]
    fn cache_evicts_by_entry_count_and_byte_budget() {
        let cache = ArchiveCache::with_limits(2, 10, 10, Duration::from_secs(60));
        let d1 = hex_digest(1);
        let d2 = hex_digest(2);
        let d3 = hex_digest(3);
        cache.insert(d1.clone(), vec![1; 4]).unwrap();
        cache.insert(d2.clone(), vec![2; 4]).unwrap();
        assert!(cache.get(&d1).unwrap().is_some());
        // Inserting d3 evicts d2 (LRU after d1 was touched) to honor entry cap 2.
        cache.insert(d3.clone(), vec![3; 4]).unwrap();
        assert!(cache.get(&d2).unwrap().is_none());
        assert!(cache.get(&d1).unwrap().is_some());
        assert!(cache.get(&d3).unwrap().is_some());

        // Inserting a 9-byte entry evicts both to honor total byte budget 10.
        let d4 = hex_digest(4);
        cache.insert(d4.clone(), vec![4; 9]).unwrap();
        assert!(cache.get(&d1).unwrap().is_none());
        assert!(cache.get(&d3).unwrap().is_none());
        assert_eq!(cache.get(&d4).unwrap().unwrap().len(), 9);

        // Oversized single entry is rejected without poisoning cache.
        let d5 = hex_digest(5);
        assert!(cache.insert(d5, vec![5; 11]).is_err());
        assert!(cache.get(&d4).unwrap().is_some());
    }

    #[test]
    fn cache_rejects_invalid_digest() {
        let cache = ArchiveCache::new();
        assert!(cache.get("../escape").is_err());
        assert!(cache.get("ABCD").is_err());
    }
}
