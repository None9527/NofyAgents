use axum::{
    Json, Router,
    extract::State,
    response::{IntoResponse, sse::Sse},
    routing::post as route_post,
};
use nofy_agent_host::{
    KernelHost,
    auth::{Authorizer, Scope},
    native,
};
use nofy_agent_runtime::{Error, system::SystemDocument};
use nofy_sampler::agent_model::declarative::CredentialProvider;
use serde_json::{Value, json};
use std::{
    convert::Infallible,
    sync::{
        Arc, Mutex,
        atomic::{AtomicUsize, Ordering},
    },
    time::Duration,
};
use tokio_util::sync::CancellationToken;

const ADMIN: &str = "fixture-administrator-token-00000000000001";
const VIEW: &str = "fixture-viewer-token-000000000000000000001";
const EDIT: &str = "fixture-editor-token-000000000000000000001";
const PUBLISH: &str = "fixture-publisher-token-000000000000000001";
#[path = "http/abandonment.rs"]
mod abandonment;
#[path = "http/approval.rs"]
mod approval;
#[path = "http/budget.rs"]
mod budget;
#[path = "http/code.rs"]
mod code;
#[path = "http/credentials.rs"]
mod credentials;
#[path = "http/declarative.rs"]
mod declarative;
#[path = "http/event.rs"]
mod event;
#[path = "http/human.rs"]
mod human;
#[path = "http/human_hook.rs"]
mod human_hook;
#[path = "http/lifecycle.rs"]
mod lifecycle;
#[path = "http/model_reconciliation.rs"]
mod model_reconciliation;
#[path = "http/parameters.rs"]
mod parameters;
#[path = "http/process.rs"]
mod process;
#[path = "http/reconciliation.rs"]
mod reconciliation;
#[path = "http/root_reconciliation.rs"]
mod root_reconciliation;
#[path = "http/workflow.rs"]
mod workflow;
struct Credentials(Arc<AtomicUsize>);
#[async_trait::async_trait]
impl CredentialProvider for Credentials {
    fn identity(&self) -> &str {
        "http-test-authority"
    }
    async fn resolve(&self, _: &str) -> Result<Option<String>, Error> {
        self.0.fetch_add(1, Ordering::SeqCst);
        Ok(Some("fixture-provider-token".into()))
    }
}
struct Serving {
    url: String,
    task: tokio::task::JoinHandle<()>,
}
impl Drop for Serving {
    fn drop(&mut self) {
        self.task.abort();
    }
}
async fn serve(router: Router) -> Serving {
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let url = format!("http://{}", listener.local_addr().unwrap());
    let task = tokio::spawn(async move { axum::serve(listener, router).await.unwrap() });
    Serving { url, task }
}
async fn provider(
    State(requests): State<Arc<Mutex<Vec<Value>>>>,
    Json(body): Json<Value>,
) -> impl IntoResponse {
    let text = body["messages"]
        .as_array()
        .unwrap()
        .iter()
        .find(|m| m["role"] == "system")
        .unwrap()["content"]
        .as_str()
        .unwrap()
        .to_owned();
    requests.lock().unwrap().push(body);
    let events = nofy_test_support::sse::chat_completion_events_exact(&text, "test-model");
    Sse::new(futures::stream::iter(
        events.into_iter().map(Ok::<_, Infallible>),
    ))
}
fn document(url: &str) -> SystemDocument {
    let mut value: Value = serde_json::from_str(include_str!("../examples/system.json")).unwrap();
    value["modules"][0]["config"]["connection"]["base_url"] = json!(format!("{url}/v1"));
    value["modules"][0]["config"]["models"] = json!(["test-model"]);
    value["modules"][1]["config"]["model"] = json!("test-model");
    value["modules"][2]["config"]["text"] = json!("version one");
    serde_json::from_value(value).unwrap()
}
fn auth() -> Authorizer {
    Authorizer::new(vec![
        (
            ADMIN.into(),
            [
                Scope::Read,
                Scope::Edit,
                Scope::Publish,
                Scope::Resources,
                Scope::Execute,
            ]
            .into(),
        ),
        (VIEW.into(), [Scope::Read].into()),
        (EDIT.into(), [Scope::Read, Scope::Edit].into()),
        (
            PUBLISH.into(),
            [Scope::Read, Scope::Edit, Scope::Publish, Scope::Execute].into(),
        ),
    ])
    .unwrap()
}
async fn host(path: &std::path::Path, reads: Arc<AtomicUsize>) -> KernelHost {
    KernelHost::open(
        path,
        native::registry(Arc::new(Credentials(reads))).unwrap(),
        auth(),
    )
    .await
    .unwrap()
}
async fn request(
    server: &Serving,
    method: reqwest::Method,
    path: &str,
    token: &str,
    body: Value,
) -> (u16, Value) {
    let response = reqwest::Client::new()
        .request(method, format!("{}{path}", server.url))
        .bearer_auth(token)
        .json(&body)
        .send()
        .await
        .unwrap();
    let status = response.status().as_u16();
    let bytes = response.bytes().await.unwrap();
    let value = if bytes.is_empty() {
        Value::Null
    } else {
        serde_json::from_slice(&bytes).unwrap()
    };
    (status, value)
}
async fn post(server: &Serving, path: &str, body: Value) -> Value {
    let (status, value) = request(server, reqwest::Method::POST, path, ADMIN, body).await;
    assert!((200..300).contains(&status), "{status}: {value}");
    value
}
async fn import(server: &Serving, document: &SystemDocument) -> String {
    post(server, "/api/v1/import", json!(document)).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .into()
}
async fn outcome(server: &Serving, id: &str) -> Value {
    tokio::time::timeout(Duration::from_secs(15), async {
        loop {
            let (status, value) = request(
                server,
                reqwest::Method::GET,
                &format!("/api/v1/runs/{id}"),
                ADMIN,
                Value::Null,
            )
            .await;
            assert_eq!(status, 200, "{value}");
            if value["execution"]["status"] != "running" && !value["execution"].is_null() {
                return value;
            }
            tokio::time::sleep(Duration::from_millis(20)).await;
        }
    })
    .await
    .unwrap()
}
fn run(release: &str, id: &str) -> Value {
    json!({"run_id":id,"thread_id":id,"system":"portable-assistant","release":release,"program":"chat","input":{"text":"hello","attachments":[]}})
}
async fn action_result(server: &Serving, id: &str) -> Value {
    let mut last = Value::Null;
    tokio::time::timeout(Duration::from_secs(15), async {
        loop {
            last = request(
                server,
                reqwest::Method::GET,
                &format!("/api/v1/actions/{id}"),
                ADMIN,
                Value::Null,
            )
            .await
            .1;
            if last["finished"] == true {
                return last.clone();
            }
            tokio::time::sleep(Duration::from_millis(10)).await;
        }
    })
    .await
    .unwrap_or_else(|_| panic!("management action did not settle: {last}"))
}

#[tokio::test]
async fn real_api_enforces_scopes_and_pure_preview_then_runs_edited_releases_in_one_process() {
    let requests = Arc::new(Mutex::new(vec![]));
    let provider = serve(
        Router::new()
            .route("/v1/chat/completions", post_handler())
            .with_state(requests.clone()),
    )
    .await;
    let dir = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let host = host(dir.path(), reads.clone()).await;
    let server = serve(host.router()).await;
    let document = document(&provider.url);
    let next_requests = Arc::new(Mutex::new(vec![]));
    let next_provider = serve(
        Router::new()
            .route("/v1/chat/completions", post_handler())
            .with_state(next_requests.clone()),
    )
    .await;
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/catalog",
            "wrong",
            Value::Null
        )
        .await
        .0,
        401
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/import",
            VIEW,
            json!(&document)
        )
        .await
        .0,
        403
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::PUT,
            "/api/v1/drafts/draft",
            EDIT,
            json!({"expected_revision":null,"document":document})
        )
        .await
        .0,
        403
    );
    let preview = post(&server, "/api/v1/validate", json!(&document)).await;
    assert!(preview["digest"].is_string());
    assert_eq!(reads.load(Ordering::SeqCst), 0);
    assert!(requests.lock().unwrap().is_empty());
    let first = import(&server, &document).await;
    post(&server,"/api/v1/apply",json!({"command_id":"apply-one","system":"portable-assistant","release":first,"expected_generation":null})).await;
    let stop = CancellationToken::new();
    let worker_host = host.clone();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 2).await.unwrap() });
    let accepted = post(&server, "/api/v1/runs", run(&first, "first")).await;
    assert_eq!(accepted["request"]["release"], first);
    assert_eq!(
        outcome(&server, "first").await["execution"]["outcome"]["Completed"]["output"],
        "version one"
    );
    let mut next = document.clone();
    next.modules[2].config["text"] = json!("version two");
    next.modules[0].config["connection"]["base_url"] = json!(format!("{}/v1", next_provider.url));
    let second = import(&server, &next).await;
    post(&server,"/api/v1/apply",json!({"command_id":"apply-two","system":"portable-assistant","release":second,"expected_generation":1})).await;
    post(&server, "/api/v1/runs", run(&second, "second")).await;
    assert_eq!(
        outcome(&server, "second").await["execution"]["outcome"]["Completed"]["output"],
        "version two"
    );
    post(&server, "/api/v1/runs", run(&first, "first")).await;
    tokio::time::sleep(Duration::from_millis(50)).await;
    assert_eq!(requests.lock().unwrap().len(), 1);
    assert_eq!(next_requests.lock().unwrap().len(), 1);
    post(&server, "/api/v1/runs", run(&first, "old-again")).await;
    assert_eq!(
        outcome(&server, "old-again").await["execution"]["outcome"]["Completed"]["output"],
        "version one"
    );
    assert_eq!(requests.lock().unwrap().len(), 2);
    let (status, events) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/runs/second/events",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200);
    assert!(!events["events"].as_array().unwrap().is_empty());
    let last = events["events"].as_array().unwrap().last().unwrap()["cursor"]
        .as_u64()
        .unwrap();
    assert!(
        request(
            &server,
            reqwest::Method::GET,
            &format!("/api/v1/runs/second/events?after={last}"),
            VIEW,
            Value::Null
        )
        .await
        .1["events"]
            .as_array()
            .unwrap()
            .is_empty()
    );
    post(&server,"/api/v1/apply",json!({"command_id":"rollback","system":"portable-assistant","release":first,"expected_generation":2})).await;
    stop.cancel();
    worker.await.unwrap();
}
fn post_handler() -> axum::routing::MethodRouter<Arc<Mutex<Vec<Value>>>> {
    route_post(provider)
}

#[tokio::test]
async fn accepted_http_request_survives_server_disconnect_and_reopen_before_worker_dispatch() {
    let requests = Arc::new(Mutex::new(vec![]));
    let provider = serve(
        Router::new()
            .route("/v1/chat/completions", post_handler())
            .with_state(requests.clone()),
    )
    .await;
    let dir = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let initial = host(dir.path(), reads.clone()).await;
    let server = serve(initial.router()).await;
    let release = import(&server, &document(&provider.url)).await;
    let accepted = post(&server, "/api/v1/runs", run(&release, "recovered")).await;
    assert_eq!(accepted["status"], "queued");
    drop(server);
    drop(initial);
    assert!(requests.lock().unwrap().is_empty());
    let restored = host(dir.path(), reads).await;
    let server = serve(restored.router()).await;
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { restored.run_worker(worker_stop, 2).await.unwrap() });
    assert_eq!(
        outcome(&server, "recovered").await["execution"]["status"],
        "completed"
    );
    post(&server, "/api/v1/runs", run(&release, "recovered")).await;
    assert_eq!(requests.lock().unwrap().len(), 1);
    stop.cancel();
    worker.await.unwrap();
}
