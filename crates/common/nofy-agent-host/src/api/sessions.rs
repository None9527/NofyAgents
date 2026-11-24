use super::*;
use axum::response::sse::{Event, KeepAlive, Sse};
use nofy_agent_runtime::{session_policy::Frozen, supervisor::jobs::*};
use std::{
    convert::Infallible,
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
    },
    time::Duration,
};
mod lifecycle;
use lifecycle::*;

const MAX_WORKSPACE_STREAMS: usize = 64;
const MAX_WORKSPACE_STREAM_LIFETIME: Duration = Duration::from_secs(3600);
const WORKSPACE_COALESCE_WINDOW: Duration = Duration::from_millis(100);

struct WorkspaceStreamLimiter {
    max_streams: usize,
    active: AtomicUsize,
}

struct WorkspaceStreamPermit {
    limiter: Arc<WorkspaceStreamLimiter>,
}

impl WorkspaceStreamLimiter {
    fn new(max_streams: usize) -> Self {
        Self {
            max_streams,
            active: AtomicUsize::new(0),
        }
    }

    fn try_acquire(self: &Arc<Self>) -> Result<WorkspaceStreamPermit> {
        let mut current = self.active.load(Ordering::Acquire);
        loop {
            if current >= self.max_streams {
                return Err(HostError::Unavailable(
                    "too many concurrent workspace change streams".into(),
                ));
            }
            match self.active.compare_exchange_weak(
                current,
                current + 1,
                Ordering::AcqRel,
                Ordering::Acquire,
            ) {
                Ok(_) => {
                    return Ok(WorkspaceStreamPermit {
                        limiter: self.clone(),
                    });
                }
                Err(observed) => current = observed,
            }
        }
    }
}

impl Drop for WorkspaceStreamPermit {
    fn drop(&mut self) {
        self.limiter.active.fetch_sub(1, Ordering::Release);
    }
}

pub(super) fn router() -> Router<KernelHost> {
    let changes_limiter = Arc::new(WorkspaceStreamLimiter::new(MAX_WORKSPACE_STREAMS));
    Router::new()
        .route(
            "/api/v1/workspace/changes",
            get(changes).layer(axum::Extension(changes_limiter)),
        )
        .route("/api/v1/sessions", post(create).get(list))
        .route("/api/v1/sessions/capabilities", get(capabilities))
        .route("/api/v1/sessions/start", post(start))
        .route("/api/v1/sessions/fork", post(fork))
        .route("/api/v1/sessions/route", post(route))
        .route("/api/v1/sessions/{id}", get(inspect))
        .route("/api/v1/sessions/{id}/tree", get(tree))
        .route("/api/v1/sessions/{id}/turns", get(turns).post(submit_turn))
        .route("/api/v1/sessions/{id}/turns/{run}", get(turn_binding))
        .route("/api/v1/sessions/{id}/policy", get(policy))
        .route("/api/v1/sessions/{id}/plan", post(lifecycle::plan))
        .route(
            "/api/v1/sessions/{id}/metadata",
            axum::routing::patch(metadata),
        )
        .route("/api/v1/sessions/{id}/close", post(close))
        .route("/api/v1/sessions/{id}/reopen", post(reopen))
        .route("/api/v1/sessions/{id}/archive", post(archive))
        .route("/api/v1/sessions/{id}/unarchive", post(unarchive))
        .route("/api/v1/sessions/{id}/reconfigure", post(reconfigure))
        .route("/api/v1/sessions/{id}/commands/{command_id}", get(command))
}
async fn changes(
    State(host): State<KernelHost>,
    axum::Extension(limiter): axum::Extension<Arc<WorkspaceStreamLimiter>>,
    headers: HeaderMap,
) -> Result<Response> {
    host.auth.require(&headers, Scope::Read)?;
    let permit = limiter.try_acquire()?;
    Ok(build_workspace_stream(
        host,
        permit,
        WORKSPACE_COALESCE_WINDOW,
        MAX_WORKSPACE_STREAM_LIFETIME,
    )
    .into_response())
}

fn build_workspace_stream(
    host: KernelHost,
    permit: WorkspaceStreamPermit,
    coalesce_window: Duration,
    max_lifetime: Duration,
) -> Sse<impl futures::Stream<Item = std::result::Result<Event, Infallible>>> {
    let mut changes = host.store.observe_workspace();
    let frames = async_stream::stream! {
        let _permit = permit;
        let deadline = tokio::time::Instant::now() + max_lifetime;
        let mut previous = *changes.borrow_and_update();
        // This stream carries invalidations. Every connection reconciles from
        // authoritative reads, so invalidations need no independent replay log.
        yield Ok::<_, Infallible>(
            Event::default()
                .event("workspace")
                .data(r#"{"sessions":true,"runs":true}"#),
        );
        loop {
            if tokio::time::Instant::now() >= deadline {
                break;
            }
            tokio::select! {
                biased;
                _ = host.stop.cancelled() => break,
                _ = tokio::time::sleep_until(deadline) => break,
                result = changes.changed() => {
                    if result.is_err() {
                        break;
                    }
                }
            }
            let coalesce_until = deadline.min(tokio::time::Instant::now() + coalesce_window);
            tokio::select! {
                biased;
                _ = host.stop.cancelled() => break,
                _ = tokio::time::sleep_until(coalesce_until) => {},
            }
            let current = *changes.borrow_and_update();
            let sessions = previous.sessions != current.sessions;
            let runs = previous.runs != current.runs;
            previous = current;
            if sessions || runs {
                yield Ok(
                    Event::default()
                        .event("workspace")
                        .data(json!({ "sessions": sessions, "runs": runs }).to_string()),
                );
            }
        }
    };
    Sse::new(frames).keep_alive(KeepAlive::new().interval(Duration::from_secs(10)))
}
async fn system(
    host: &KernelHost,
    release: &str,
) -> Result<nofy_agent_runtime::system::CompiledSystem> {
    let bundle = host.control.export(release).await?;
    let registry = host.registry.clone();
    Ok(
        tokio::task::spawn_blocking(move || bundle.restore(&registry))
            .await
            .map_err(|e| HostError::Unavailable(e.to_string()))??,
    )
}
async fn state(host: &KernelHost, id: &str) -> Result<SessionState> {
    host.store
        .session_state(id)
        .await?
        .ok_or(HostError::NotFound)
}
fn same_id(route: &str, body: &str) -> Result<()> {
    if route != body {
        return Err(HostError::Invalid(
            "session path and request identity differ".into(),
        ));
    }
    Ok(())
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Create {
    session_id: String,
    root_run_id: String,
}
async fn create(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(request): Json<Create>,
) -> Result<Json<SessionState>> {
    host.auth.require(&headers, Scope::Execute)?;
    let id = request.session_id;
    host.supervisor
        .create_session(SessionRequest {
            id: id.clone(),
            root_run_id: request.root_run_id,
        })
        .await?;
    host.wake.notify_one();
    Ok(Json(state(&host, &id).await?))
}
async fn start(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(request): Json<SessionStart>,
) -> Result<Json<SessionReceipt>> {
    host.auth.require(&headers, Scope::Execute)?;
    if let Some(receipt) = host.supervisor.replay_session_start(&request).await? {
        return Ok(Json(receipt));
    }
    let root: ManagedRunRequest = serde_json::from_str(&request.request_json)
        .map_err(|e| HostError::Invalid(e.to_string()))?;
    let compiled = system(&host, &root.release).await?;
    let _memory = host
        .loader
        .memory_provider
        .admit_program(compiled.program(&root.program)?)
        .await?;
    let receipt = host.supervisor.start_session(request, &compiled).await?;
    host.wake.notify_one();
    Ok(Json(receipt))
}
async fn fork(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(request): Json<SessionFork>,
) -> Result<Json<SessionReceipt>> {
    host.auth.require(&headers, Scope::Execute)?;
    if let Some(receipt) = host.supervisor.replay_session_fork(&request).await? {
        return Ok(Json(receipt));
    }
    let root: ManagedRunRequest = serde_json::from_str(&request.start.request_json)
        .map_err(|e| HostError::Invalid(e.to_string()))?;
    let compiled = system(&host, &root.release).await?;
    let _memory = host
        .loader
        .memory_provider
        .admit_program(compiled.program(&root.program)?)
        .await?;
    let receipt = host.supervisor.fork_session(request, &compiled).await?;
    host.wake.notify_one();
    Ok(Json(receipt))
}
async fn tree(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    // An unknown session is "not found" here as it is everywhere else; the store
    // would report it as a checkpoint conflict.
    state(&host, &id).await?;
    Ok(Json(host.store.session_tree(&id).await?))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Page {
    #[serde(default)]
    after: String,
    #[serde(default = "limit")]
    limit: usize,
    #[serde(default)]
    include_archived: bool,
}
fn limit() -> usize {
    100
}
async fn list(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Query(page): Query<Page>,
) -> Result<Json<Vec<SessionState>>> {
    host.auth.require(&headers, Scope::Read)?;
    let rows = host
        .store
        .session_states(&page.after, page.limit, page.include_archived)
        .await?;
    Ok(Json(host.store.project_session_titles(rows).await?))
}
async fn inspect(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<SessionState>> {
    host.auth.require(&headers, Scope::Read)?;
    let session = state(&host, &id).await?;
    let mut projected = host.store.project_session_titles(vec![session]).await?;
    projected.pop().map(Json).ok_or(HostError::NotFound)
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct TurnPage {
    #[serde(default = "zero")]
    after: String,
    #[serde(default = "limit")]
    limit: usize,
}
fn zero() -> String {
    "0".into()
}
fn exact(value: &str) -> Result<u64> {
    let n = value
        .parse::<u64>()
        .map_err(|_| HostError::Invalid("invalid exact session version/cursor".into()))?;
    if n.to_string() != value {
        return Err(HostError::Invalid(
            "noncanonical session version/cursor".into(),
        ));
    }
    Ok(n)
}
async fn turns(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Query(page): Query<TurnPage>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    state(&host, &id).await?;
    let items = host
        .store
        .session_turns(&id, exact(&page.after)?, page.limit)
        .await?;
    let texts = items
        .iter()
        .map(serde_json::to_string)
        .collect::<std::result::Result<Vec<_>, _>>()
        .map_err(|e| HostError::Invalid(e.to_string()))?;
    Ok(Json(json!({"turns_json":texts})))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Turn {
    session_id: String,
    expected_session_revision: String,
    request_json: String,
}
async fn submit_turn(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(request): Json<Turn>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Execute)?;
    same_id(&id, &request.session_id)?;
    let command: SessionTurnCommand = serde_json::from_str(&request.request_json)
        .map_err(|e| HostError::Invalid(e.to_string()))?;
    let run = match &command.turn {
        SessionTurnInput::New { run_id, .. } | SessionTurnInput::Queued { run_id, .. } => {
            run_id.clone()
        }
    };
    host.supervisor
        .submit_session_turn_at(
            &id,
            command,
            Some(exact(&request.expected_session_revision)?),
        )
        .await?;
    host.wake.notify_one();
    Ok(Json(binding(&host, &id, &run).await?))
}
async fn binding(host: &KernelHost, id: &str, run: &str) -> Result<Value> {
    state(host, id).await?;
    let native = host.store.session_turn_binding(id, run).await?;
    let admission = host.store.session_policy_admission(id, run).await?;
    if native.is_none() && admission.is_none() {
        return Err(HostError::NotFound);
    }
    let seed = host.store.session_seed(run).await?;
    let text = |v: &Value| serde_json::to_string(v).map_err(|e| HostError::Invalid(e.to_string()));
    Ok(json!({"session_id":id,"run_id":run,
        "session_revision":admission.as_ref().and_then(|a|a.get("session_revision")).and_then(Value::as_str).unwrap_or("0"),
        "policy_revision":admission.as_ref().and_then(|a|a.get("policy_revision")).and_then(Value::as_str).unwrap_or("0"),
        "native_admission_json":native.map(serde_json::to_value).transpose().map_err(|e|HostError::Invalid(e.to_string()))?.as_ref().map(text).transpose()?,
        "seed_json":seed.map(serde_json::to_value).transpose().map_err(|e|HostError::Invalid(e.to_string()))?.as_ref().map(text).transpose()?,
        "policy_admission_json":admission.as_ref().map(text).transpose()?}))
}
async fn turn_binding(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path((id, run)): Path<(String, String)>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(binding(&host, &id, &run).await?))
}
async fn policy(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(
        host.store
            .session_policy_view(&id)
            .await?
            .ok_or(HostError::NotFound)?,
    ))
}
async fn route(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(request): Json<SessionRoute>,
) -> Result<Json<SessionRouteView>> {
    host.auth.require(&headers, Scope::Read)?;
    let compiled = system(&host, &request.release).await?;
    Ok(Json(
        host.supervisor.route_session(request, &compiled).await?,
    ))
}
async fn selected(host: &KernelHost, change: &SessionChange) -> Result<Option<Frozen>> {
    match change {
        SessionChange::Reconfigure { policy, .. } => {
            let source = system(host, &policy.release).await?;
            Ok(Some(Frozen::select(
                &source.bundle.lock.modules,
                &policy.module,
                &policy.release,
            )?))
        }
        _ => Ok(None),
    }
}
async fn capabilities(State(host): State<KernelHost>, headers: HeaderMap) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(
        json!({"protocol":"nofy.session-control/v1","policy_protocol":"nofy.session-policy/v1",
        "agent_schema_versions":[1,2],"policy_update_boundary":"between_quiescent_turns",
        "policy_input_schema":nofy_agent_runtime::session_policy::input_schema(),
        "policy_output_schema":nofy_agent_runtime::session_policy::proposal_schema(),
        "operations":["start","create","fork","rewind","tree","list","inspect","turn","turns","binding","route","policy","plan","metadata","close","reopen","archive","unarchive","reconfigure","command"]}),
    ))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{auth::Authorizer, native};
    use axum::response::IntoResponse;
    use futures::StreamExt;
    use nofy_agent_runtime::{
        Model, ModelRequest, ModelResponse, RunContext,
        credentials::EnvironmentCredentials,
        registry::{InstanceFactory, ModuleInstance},
    };

    struct DummyModel;

    #[async_trait::async_trait]
    impl Model for DummyModel {
        async fn complete(
            &self,
            _: ModelRequest,
            _: &RunContext,
        ) -> std::result::Result<ModelResponse, nofy_agent_runtime::Error> {
            Ok(ModelResponse {
                output: "ok".into(),
                ..Default::default()
            })
        }
    }

    #[test]
    fn workspace_stream_limiter_enforces_cap_and_releases_on_drop() {
        let limiter = Arc::new(WorkspaceStreamLimiter::new(2));
        let p1 = limiter.try_acquire().unwrap();
        let p2 = limiter.try_acquire().unwrap();
        let err = limiter.try_acquire().err().unwrap();
        assert_eq!(
            err.into_response().status(),
            StatusCode::SERVICE_UNAVAILABLE
        );

        drop(p1);
        let p3 = limiter.try_acquire().unwrap();
        drop((p2, p3));
        assert_eq!(limiter.active.load(Ordering::Acquire), 0);
    }

    #[tokio::test]
    async fn workspace_changes_coalesces_bursts_and_closes_at_max_lifetime() {
        let dir = tempfile::tempdir().unwrap();
        let token = "workspace-stream-fixture-000000000001".to_string();
        let mut registry = native::registry(Arc::new(
            EnvironmentCredentials::new("sessions", "NOFY_SESSIONS_FIXTURE_").unwrap(),
        ))
        .unwrap();
        registry
            .register_factory(Arc::new(InstanceFactory::new(
                "test.dummy_model",
                "1",
                ModuleInstance::Model(Arc::new(DummyModel)),
            )))
            .unwrap();
        let auth = Authorizer::new(vec![(
            token,
            [Scope::Read, Scope::Execute, Scope::Publish].into(),
        )])
        .unwrap();
        let host = KernelHost::open(&dir.path().join("state"), registry, auth)
            .await
            .unwrap();
        let document: SystemDocument = serde_json::from_value(json!({
            "schema_version": 1,
            "name": "ws-test",
            "modules": [
                {
                    "reference": { "id": "model", "version": "1" },
                    "factory": "test.dummy_model",
                    "config": {}
                },
                {
                    "reference": { "id": "prompt", "version": "1" },
                    "factory": "prompt.static",
                    "config": { "text": "hello" }
                }
            ],
            "programs": {
                "main": {
                    "kind": "agent",
                    "definition": {
                        "name": "main",
                        "model": { "id": "model", "version": "1" },
                        "prompt": { "id": "prompt", "version": "1" }
                    }
                }
            }
        }))
        .unwrap();
        let compiled = SystemFile::Source(document)
            .prepare(&host.registry)
            .unwrap();

        let limiter = Arc::new(WorkspaceStreamLimiter::new(1));
        let permit = limiter.try_acquire().unwrap();
        let response = build_workspace_stream(
            host.clone(),
            permit,
            Duration::from_millis(80),
            Duration::from_millis(350),
        )
        .into_response();
        let mut body = response.into_body().into_data_stream();

        // First frame is emitted immediately on subscribe.
        let initial = tokio::time::timeout(Duration::from_secs(2), body.next())
            .await
            .unwrap()
            .unwrap()
            .unwrap();
        assert!(
            String::from_utf8_lossy(&initial).contains(r#"{"sessions":true,"runs":true}"#),
            "unexpected initial frame: {}",
            String::from_utf8_lossy(&initial)
        );

        // Submit 6 rapid runs within the coalesce window; they must merge into 1 frame.
        for idx in 0..6 {
            let request = ManagedRunRequest {
                approval_mode: None,
                run_id: format!("burst-run-{idx}"),
                thread_id: format!("burst-thread-{idx}"),
                system: "ws-test".into(),
                release: compiled.bundle.digest.clone(),
                program: "main".into(),
                input: Some(
                    serde_json::from_value(json!({"text": "hello", "attachments": []})).unwrap(),
                ),
                parameters: None,
            };
            host.supervisor
                .submit_managed(request, &compiled)
                .await
                .unwrap();
        }

        let mut coalesced_frames = 0usize;
        while let Some(chunk) = tokio::time::timeout(Duration::from_secs(2), body.next())
            .await
            .expect("stream must terminate at max_lifetime")
        {
            let bytes = chunk.unwrap();
            let text = String::from_utf8_lossy(&bytes);
            if text.contains("event: workspace") {
                coalesced_frames += 1;
            }
        }
        assert_eq!(
            coalesced_frames, 1,
            "rapid burst of 6 commits should coalesce into a single workspace frame"
        );
        drop(body);
        assert_eq!(
            limiter.active.load(Ordering::Acquire),
            0,
            "stream permit must be released after max_lifetime closes the stream"
        );
    }
}
