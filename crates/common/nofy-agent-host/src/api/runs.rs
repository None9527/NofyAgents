use super::client_protocol::{EventEncoding, EventPage, exact_event, exact_page};
use super::*;
use axum::response::sse::{Event, KeepAlive, Sse};
use nofy_agent_runtime::{
    mailbox::{InputAddress, MailEnvelope, MailboxSender},
    supervisor::{ApprovalRequest, jobs::*},
};
use std::{
    collections::HashMap,
    convert::Infallible,
    sync::{Arc, Mutex},
    time::Duration,
};
mod input_receipts;

const MAX_GLOBAL_RUN_STREAMS: usize = 128;
const MAX_STREAMS_PER_RUN: usize = 16;
const MAX_RUN_STREAM_LIFETIME: Duration = Duration::from_secs(3600);

#[derive(Default)]
struct RunStreamCounts {
    total: usize,
    per_run: HashMap<String, usize>,
}

struct RunStreamLimiter {
    max_global: usize,
    max_per_run: usize,
    state: Mutex<RunStreamCounts>,
}

struct RunStreamPermit {
    limiter: Arc<RunStreamLimiter>,
    run_id: String,
}

impl RunStreamLimiter {
    fn new(max_global: usize, max_per_run: usize) -> Self {
        Self {
            max_global,
            max_per_run,
            state: Mutex::new(RunStreamCounts::default()),
        }
    }

    fn try_acquire(self: &Arc<Self>, run_id: &str) -> Result<RunStreamPermit> {
        let mut counts = self
            .state
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        if counts.total >= self.max_global {
            return Err(HostError::Unavailable(
                "too many concurrent run event streams".into(),
            ));
        }
        let current_run = counts.per_run.get(run_id).copied().unwrap_or(0);
        if current_run >= self.max_per_run {
            return Err(HostError::Unavailable(
                "too many concurrent event streams for this run".into(),
            ));
        }
        counts.total += 1;
        *counts.per_run.entry(run_id.to_owned()).or_insert(0) += 1;
        Ok(RunStreamPermit {
            limiter: self.clone(),
            run_id: run_id.to_owned(),
        })
    }
}

impl Drop for RunStreamPermit {
    fn drop(&mut self) {
        let mut counts = self
            .limiter
            .state
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        counts.total = counts.total.saturating_sub(1);
        if let Some(count) = counts.per_run.get_mut(&self.run_id) {
            if *count <= 1 {
                counts.per_run.remove(&self.run_id);
            } else {
                *count -= 1;
            }
        }
    }
}

pub(super) fn router() -> Router<KernelHost> {
    let stream_limiter = Arc::new(RunStreamLimiter::new(
        MAX_GLOBAL_RUN_STREAMS,
        MAX_STREAMS_PER_RUN,
    ));
    Router::new()
        .merge(crate::work::router())
        .route("/api/v1/runs", post(submit).get(list))
        .route("/api/v1/runs/{id}", get(inspect))
        .route("/api/v1/runs/{id}/versions", get(versions))
        .route("/api/v1/runs/{id}/events", get(events))
        .route(
            "/api/v1/runs/{id}/stream",
            get(stream).layer(axum::Extension(stream_limiter)),
        )
        .route("/api/v1/runs/{id}/approvals", get(approvals).post(decide))
        .route("/api/v1/runs/{id}/cancel", post(cancel))
        .route("/api/v1/runs/{id}/inputs", post(input))
        .route(
            "/api/v1/runs/{id}/inputs/{input_id}",
            get(input_receipts::inspect),
        )
        .route("/api/v1/runs/{id}/recovery", get(recovery))
        .route("/api/v1/runs/{id}/recovery/root", get(root_recovery))
        .route("/api/v1/runs/{id}/recovery/models", get(model_recovery))
        .route("/api/v1/runs/{id}/recovery/hooks", get(hook_recovery))
        .route("/api/v1/runs/{id}/recovery/humans", get(human_recovery))
        .route(
            "/api/v1/runs/{id}/recovery/model-retry",
            get(model_retry_ticket),
        )
        .route("/api/v1/actions", post(action))
        .route("/api/v1/actions/{id}", get(action_status))
}
async fn managed(host: &KernelHost, id: &str) -> Result<ManagedRun> {
    host.store.managed_run(id).await?.ok_or(HostError::NotFound)
}
async fn submit(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(request): Json<ManagedRunRequest>,
) -> Result<(StatusCode, Json<ManagedRun>)> {
    host.auth.require(&headers, Scope::Execute)?;
    if let Some(old) = host.store.managed_run(&request.run_id).await? {
        if content_digest(&old.request)? != content_digest(&request)? {
            return Err(HostError::Invalid(
                "run ID reused with a different request".into(),
            ));
        }
        host.wake.notify_one();
        return Ok((StatusCode::OK, Json(old)));
    }
    let bundle = host.control.export(&request.release).await?;
    let registry = host.registry.clone();
    let system = tokio::task::spawn_blocking(move || bundle.restore(&registry))
        .await
        .map_err(|e| HostError::Unavailable(e.to_string()))??;
    let _memory = host
        .loader
        .memory_provider
        .admit_program(system.program(&request.program)?)
        .await?;
    let result = host.supervisor.submit_managed(request, &system).await?;
    host.wake.notify_one();
    Ok((StatusCode::ACCEPTED, Json(result)))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Page {
    #[serde(default)]
    after: u64,
    #[serde(default = "limit")]
    limit: usize,
}
fn limit() -> usize {
    100
}
async fn list(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Query(page): Query<Page>,
) -> Result<Json<Vec<ManagedRun>>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(host.store.managed_runs(page.after, page.limit).await?))
}
#[derive(Default, Deserialize)]
#[serde(rename_all = "snake_case")]
pub(crate) enum RunView {
    Status,
    #[default]
    Full,
}
#[derive(Default, Deserialize)]
#[serde(default, deny_unknown_fields)]
struct InspectQuery {
    view: RunView,
}
async fn inspect(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Query(query): Query<InspectQuery>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    inspect_run(&host.store, &id, query.view).await.map(Json)
}

pub(crate) async fn inspect_run(store: &SqliteStore, id: &str, view: RunView) -> Result<Value> {
    let run = store.managed_run(id).await?.ok_or(HostError::NotFound)?;
    if matches!(view, RunView::Status) {
        let mut result = store.execution_status(id).await?;
        result["format"] = json!("nofy.run-status/v1");
        result["run"] = json!({"sequence":run.sequence,"status":run.status,"request":{"run_id":run.request.run_id,"thread_id":run.request.thread_id,"system":run.request.system,"release":run.request.release,"program":run.request.program}});
        result["details_read"] =
            json!({"operation":"run.inspect","arguments":{"run_id":id,"view":"full"}});
        return Ok(result);
    }
    Ok(
        json!({"run":run,"execution":store.execution_record(id).await?,
        "children":store.children(id).await?,"parking":store.parking(id).await?,
        "live":store.live_execution(id).await?.map(|live|live.info())}),
    )
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct VersionPage {
    #[serde(default)]
    after: u64,
    #[serde(default = "version_limit")]
    limit: usize,
}
fn version_limit() -> usize {
    16
}
async fn versions(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Query(page): Query<VersionPage>,
) -> Result<Json<Vec<LiveVersionInfo>>> {
    host.auth.require(&headers, Scope::Read)?;
    managed(&host, &id).await?;
    Ok(Json(
        host.store
            .live_versions(&id, page.after, page.limit)
            .await?
            .iter()
            .map(LiveExecution::info)
            .collect(),
    ))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct RecoveryPage {
    after: Option<String>,
    #[serde(default = "limit")]
    limit: usize,
}
async fn recovery(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Query(page): Query<RecoveryPage>,
) -> Result<Json<nofy_agent_runtime::supervisor::ChildRecoveryPage>> {
    host.auth.require(&headers, Scope::Read)?;
    managed(&host, &id).await?;
    Ok(Json(
        host.store
            .child_recovery_targets(&id, page.after.as_deref(), page.limit)
            .await?,
    ))
}
async fn root_recovery(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<Option<nofy_agent_runtime::supervisor::RootRecoveryTarget>>> {
    host.auth.require(&headers, Scope::Read)?;
    managed(&host, &id).await?;
    Ok(Json(host.store.root_recovery_target(&id).await?))
}
async fn human_recovery(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<HumanRecoveryPage>> {
    host.auth.require(&headers, Scope::Read)?;
    managed(&host, &id).await?;
    Ok(Json(
        host.supervisor
            .human_recovery_targets(&host.registry, &id)
            .await?,
    ))
}
async fn model_retry_ticket(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<Option<nofy_agent_runtime::governance::ModelRetryTicket>>> {
    host.auth.require(&headers, Scope::Read)?;
    managed(&host, &id).await?;
    Ok(Json(host.supervisor.root_model_retry_ticket(&id).await?))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ModelRecoveryQuery {
    target_run_id: Option<String>,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct HookRecoveryQuery {
    after: Option<String>,
    #[serde(default = "limit")]
    limit: usize,
}
async fn hook_recovery(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Query(page): Query<HookRecoveryQuery>,
) -> Result<Json<nofy_agent_runtime::hooks::primitive::HookRecoveryPage>> {
    host.auth.require(&headers, Scope::Read)?;
    managed(&host, &id).await?;
    Ok(Json(
        host.supervisor
            .hook_reconciliation_targets(&id, page.after.as_deref(), page.limit)
            .await?,
    ))
}
async fn model_recovery(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Query(query): Query<ModelRecoveryQuery>,
) -> Result<Json<Vec<nofy_agent_runtime::governance::ModelReconciliationTarget>>> {
    host.auth.require(&headers, Scope::Read)?;
    managed(&host, &id).await?;
    Ok(Json(
        host.supervisor
            .model_reconciliation_targets(&id, query.target_run_id.as_deref().unwrap_or(&id))
            .await?,
    ))
}
async fn events(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Query(page): Query<EventPage>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Read)?;
    managed(&host, &id).await?;
    let after = page.cursor()?;
    let events = host.store.events(&id, after, page.limit).await?;
    Ok(Json(match page.encoding {
        EventEncoding::Native => json!({"events":events}),
        EventEncoding::Exact => exact_page(&events, after)?,
    }))
}
async fn stream(
    State(host): State<KernelHost>,
    axum::Extension(limiter): axum::Extension<Arc<RunStreamLimiter>>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Query(page): Query<EventPage>,
) -> Result<Response> {
    host.auth.require(&headers, Scope::Read)?;
    managed(&host, &id).await?;
    let after = page.resume_after(&headers)?;
    let permit = limiter.try_acquire(&id)?;
    Ok(build_run_stream(host, id, page, after, permit, MAX_RUN_STREAM_LIFETIME).into_response())
}

fn build_run_stream(
    host: KernelHost,
    id: String,
    page: EventPage,
    after: u64,
    permit: RunStreamPermit,
    max_lifetime: Duration,
) -> Sse<impl futures::Stream<Item = std::result::Result<Event, Infallible>>> {
    let mut changes = host.store.watch_run(&id);
    let frames = async_stream::stream! {
        let _permit = permit;
        let deadline = tokio::time::Instant::now() + max_lifetime;
        let mut after = after;
        loop {
            if tokio::time::Instant::now() >= deadline {
                return;
            }
            let observed = *changes.borrow_and_update();
            let events = tokio::select! {
                biased;
                _ = host.stop.cancelled() => return,
                _ = tokio::time::sleep_until(deadline) => return,
                result = host.store.events(&id, after, page.limit) => result,
            };
            match events {
                Ok(events) => {
                    if events.is_empty() {
                        if *changes.borrow_and_update() == observed {
                            loop {
                                tokio::select! {
                                    biased;
                                    _ = host.stop.cancelled() => return,
                                    _ = tokio::time::sleep_until(deadline) => return,
                                    result = changes.changed() => {
                                        if result.is_err() {
                                            return;
                                        }
                                    }
                                }
                                if *changes.borrow_and_update() != observed {
                                    break;
                                }
                            }
                        }
                        // Batch bursts of committed tokens without querying an idle journal.
                        let batch_until = deadline
                            .min(tokio::time::Instant::now() + Duration::from_millis(100));
                        tokio::select! {
                            biased;
                            _ = host.stop.cancelled() => return,
                            _ = tokio::time::sleep_until(batch_until) => {},
                        }
                        continue;
                    }
                    for event in events {
                        after = event.cursor;
                        let data = match page.encoding {
                            EventEncoding::Native => serde_json::to_string(&event),
                            EventEncoding::Exact => {
                                exact_event(&event).and_then(|event| serde_json::to_string(&event))
                            }
                        };
                        match data {
                            Ok(data) => {
                                yield Ok::<_, Infallible>(
                                    Event::default()
                                        .id(after.to_string())
                                        .event("runtime")
                                        .data(data),
                                );
                            }
                            Err(_) => return,
                        }
                    }
                }
                Err(error) => {
                    yield Ok(
                        Event::default()
                            .event("error")
                            .data(json!({ "message": error.to_string() }).to_string()),
                    );
                    return;
                }
            }
        }
    };
    Sse::new(frames).keep_alive(KeepAlive::new().interval(Duration::from_secs(10)))
}
async fn approvals(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<Vec<nofy_agent_runtime::supervisor::PendingApproval>>> {
    host.auth.require(&headers, Scope::Read)?;
    managed(&host, &id).await?;
    let mut requests = host.store.pending_approval_options(&id).await?;
    for child in host.store.children(&id).await? {
        requests.extend(host.store.pending_approval_options(&child.run_id).await?);
    }
    Ok(Json(requests))
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Decision {
    request: ApprovalRequest,
    allow: bool,
    #[serde(default)]
    continue_run: bool,
    #[serde(default)]
    scope: nofy_agent_runtime::supervisor::ApprovalScope,
}
async fn decide(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(decision): Json<Decision>,
) -> Result<StatusCode> {
    host.auth.require(&headers, Scope::Execute)?;
    managed(&host, &id).await?;
    if decision.request.run_id != id
        && !host
            .store
            .children(&id)
            .await?
            .iter()
            .any(|c| c.run_id == decision.request.run_id)
    {
        return Err(HostError::Invalid(
            "approval is outside this run tree".into(),
        ));
    }
    if decision.continue_run {
        host.store
            .decide_scoped_and_continue(&id, &decision.request, decision.allow, decision.scope)
            .await?;
        host.wake.notify_one();
    } else {
        host.store
            .decide_scoped(&decision.request, decision.allow, decision.scope)
            .await?;
    }
    Ok(StatusCode::NO_CONTENT)
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Cancel {
    command_id: String,
}
async fn cancel(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(command): Json<Cancel>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Execute)?;
    if command.command_id.trim().is_empty() || command.command_id.len() > 256 {
        return Err(HostError::Invalid(
            "cancel ID requires 1..=256 bytes".into(),
        ));
    }
    managed(&host, &id).await?;
    let Some(record) = host.store.execution_record(&id).await? else {
        host.supervisor.cancel_submitted(&id).await?;
        host.wake.notify_one();
        return Ok(Json(json!({"queued_cancelled":true})));
    };
    let address = InputAddress {
        root_run_id: id.clone(),
        run_id: id,
        thread_id: record.thread_id,
        agent: record.snapshot.name().into(),
    };
    Ok(Json(
        json!({"cursor":host.store.cancel(&address,&command.command_id).await?}),
    ))
}
async fn input(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(envelope): Json<MailEnvelope>,
) -> Result<Json<Value>> {
    host.auth.require(&headers, Scope::Execute)?;
    managed(&host, &id).await?;
    if envelope.address.root_run_id != id {
        return Err(HostError::Invalid("input is outside this run tree".into()));
    }
    let receipt = host.store.submit(envelope).await?;
    host.wake.notify_one();
    Ok(Json(json!(receipt)))
}
async fn action(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Json(action): Json<ManagedAction>,
) -> Result<(StatusCode, Json<ManagedActionRecord>)> {
    host.auth.require(&headers, Scope::Execute)?;
    let record = if let ManagedCommand::Transition { release, .. }
    | ManagedCommand::UpdateModules { release, .. } = &action.command
    {
        // Exact replays must not require a release to be reactivated/reloaded.
        if let Some(old) = host.store.managed_action(&action.command_id).await? {
            if content_digest(&old.action)? != content_digest(&action)? {
                return Err(HostError::Invalid("management command ID reused".into()));
            }
            old
        } else {
            let bundle = host.control.export(release).await?;
            let registry = host.registry.clone();
            let system = tokio::task::spawn_blocking(move || bundle.restore(&registry))
                .await
                .map_err(|e| HostError::Unavailable(e.to_string()))??;
            host.supervisor.submit_transition(action, &system).await?
        }
    } else {
        host.store.enqueue_managed_action(action).await?
    };
    host.wake.notify_one();
    Ok((StatusCode::ACCEPTED, Json(record)))
}
async fn action_status(
    State(host): State<KernelHost>,
    headers: HeaderMap,
    Path(id): Path<String>,
) -> Result<Json<ManagedActionRecord>> {
    host.auth.require(&headers, Scope::Read)?;
    Ok(Json(
        host.store
            .managed_action(&id)
            .await?
            .ok_or(HostError::NotFound)?,
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

    async fn test_host_with_run(run_id: &str) -> (tempfile::TempDir, KernelHost, String) {
        let dir = tempfile::tempdir().unwrap();
        let token = "run-stream-fixture-000000000000000001".to_string();
        let mut registry = native::registry(Arc::new(
            EnvironmentCredentials::new("runs", "NOFY_RUNS_FIXTURE_").unwrap(),
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
            token.clone(),
            [Scope::Read, Scope::Execute, Scope::Publish].into(),
        )])
        .unwrap();
        let host = KernelHost::open(&dir.path().join("state"), registry, auth)
            .await
            .unwrap();
        let document: SystemDocument = serde_json::from_value(json!({
            "schema_version": 1,
            "name": "sse-test",
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
        let request = ManagedRunRequest {
            approval_mode: None,
            run_id: run_id.into(),
            thread_id: format!("thread-{run_id}"),
            system: "sse-test".into(),
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
        (dir, host, token)
    }

    #[test]
    fn run_stream_limiter_enforces_per_run_and_global_limits_and_cleans_up() {
        let limiter = Arc::new(RunStreamLimiter::new(5, 2));
        let p1 = limiter.try_acquire("run-a").unwrap();
        let p2 = limiter.try_acquire("run-a").unwrap();
        let err = limiter.try_acquire("run-a").err().unwrap();
        assert_eq!(
            err.into_response().status(),
            StatusCode::SERVICE_UNAVAILABLE
        );

        let p3 = limiter.try_acquire("run-b").unwrap();
        let p4 = limiter.try_acquire("run-b").unwrap();
        let p5 = limiter.try_acquire("run-c").unwrap();
        let global_err = limiter.try_acquire("run-d").err().unwrap();
        assert_eq!(
            global_err.into_response().status(),
            StatusCode::SERVICE_UNAVAILABLE
        );

        drop(p1);
        let p6 = limiter.try_acquire("run-a").unwrap();
        drop((p2, p3, p4, p5, p6));

        let counts = limiter.state.lock().unwrap();
        assert_eq!(counts.total, 0);
        assert!(counts.per_run.is_empty());
    }

    #[tokio::test]
    async fn run_stream_http_rejects_excess_connections_and_respects_max_lifetime() {
        let (_dir, host, token) = test_host_with_run("sse-cap-run").await;

        // Verify max lifetime closes an idle stream and frees its permit.
        let limiter = Arc::new(RunStreamLimiter::new(4, 1));
        let permit = limiter.try_acquire("sse-cap-run").unwrap();
        assert!(limiter.try_acquire("sse-cap-run").is_err());
        let page: EventPage = serde_json::from_value(json!({})).unwrap();
        let response = build_run_stream(
            host.clone(),
            "sse-cap-run".into(),
            page,
            0,
            permit,
            Duration::from_millis(80),
        )
        .into_response();
        let mut body = response.into_body().into_data_stream();
        let ended = tokio::time::timeout(Duration::from_secs(2), body.next())
            .await
            .expect("stream must close after max_lifetime");
        assert!(ended.is_none());
        drop(body);
        assert!(
            limiter.try_acquire("sse-cap-run").is_ok(),
            "permit must be released after max_lifetime expiry"
        );

        // Verify real HTTP /api/v1/runs/{id}/stream enforces MAX_STREAMS_PER_RUN.
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let url = format!("http://{}", listener.local_addr().unwrap());
        let stop = tokio_util::sync::CancellationToken::new();
        let shutdown = stop.clone();
        let router = host.router();
        let server = tokio::spawn(async move {
            axum::serve(listener, router)
                .with_graceful_shutdown(async move { shutdown.cancelled().await })
                .await
                .unwrap();
        });

        let client = reqwest::Client::new();
        let mut open_streams = Vec::new();
        for _ in 0..MAX_STREAMS_PER_RUN {
            let resp = client
                .get(format!("{url}/api/v1/runs/sse-cap-run/stream"))
                .bearer_auth(&token)
                .send()
                .await
                .unwrap();
            assert_eq!(resp.status(), StatusCode::OK);
            open_streams.push(resp);
        }

        let rejected = client
            .get(format!("{url}/api/v1/runs/sse-cap-run/stream"))
            .bearer_auth(&token)
            .send()
            .await
            .unwrap();
        assert_eq!(rejected.status(), StatusCode::SERVICE_UNAVAILABLE);

        // Dropping one active stream frees a slot once the server observes disconnect.
        open_streams.pop();
        let reopened = tokio::time::timeout(Duration::from_secs(3), async {
            loop {
                let resp = client
                    .get(format!("{url}/api/v1/runs/sse-cap-run/stream"))
                    .bearer_auth(&token)
                    .send()
                    .await
                    .unwrap();
                if resp.status() == StatusCode::OK {
                    break resp;
                }
                tokio::time::sleep(Duration::from_millis(20)).await;
            }
        })
        .await
        .expect("dropping a stream must release a run SSE slot");
        assert_eq!(reopened.status(), StatusCode::OK);

        drop(reopened);
        drop(open_streams);
        host.shutdown();
        stop.cancel();
        server.await.unwrap();
    }
}
