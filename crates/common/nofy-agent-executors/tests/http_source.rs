use axum::{
    Json, Router,
    extract::{Query, State},
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    routing::{get, post},
};
use nofy_agent_executors::{
    declarative::{HttpResourceFactory, HttpToolSourceFactory},
    resources::CredentialProvider,
};
use nofy_agent_runtime::{registry::*, *};
use nofy_tool_protocol::ToolId;
use nofy_tool_runtime::{ToolCallContext, ToolError};
use nofy_tool_types::ToolDefinition;
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
    },
    time::Duration,
};

struct Credentials(Arc<AtomicUsize>);
#[async_trait::async_trait]
impl CredentialProvider for Credentials {
    async fn resolve(&self, _: &str, _: &ToolCallContext) -> Result<String, ToolError> {
        self.0.fetch_add(1, Ordering::SeqCst);
        Ok("external-source-fixture-secret".into())
    }
}
#[derive(Clone, Default)]
struct Service {
    revision: Arc<AtomicUsize>,
    reads: Arc<AtomicUsize>,
    writes: Arc<AtomicUsize>,
}
async fn listing(
    State(state): State<Service>,
    headers: HeaderMap,
    Query(query): Query<BTreeMap<String, String>>,
) -> Response {
    state.reads.fetch_add(1, Ordering::SeqCst);
    if query.get("slow").is_some() {
        tokio::time::sleep(Duration::from_secs(2)).await;
    }
    assert_eq!(
        headers["authorization"],
        "Bearer external-source-fixture-secret"
    );
    let revision = state.revision.load(Ordering::SeqCst).to_string();
    Json(json!({"revision":revision,"tools":[ToolDefinition::function("external", Some("External module"), json!({"type":"object","required":["n"],"additionalProperties":false,"properties":{"n":{"type":"integer"}}}))]})).into_response()
}
async fn invoke(
    State(state): State<Service>,
    headers: HeaderMap,
    Json(body): Json<Value>,
) -> Response {
    assert_eq!(
        headers["authorization"],
        "Bearer external-source-fixture-secret"
    );
    let revision = state.revision.load(Ordering::SeqCst).to_string();
    if body["revision"] != revision {
        return StatusCode::CONFLICT.into_response();
    }
    assert_eq!(body["tool"], "external");
    state.writes.fetch_add(1, Ordering::SeqCst);
    Json(json!({"revision":revision,"value":{"result":body["arguments"]["n"].as_i64().unwrap()+1}}))
        .into_response()
}
struct Server {
    url: String,
    state: Service,
    task: tokio::task::JoinHandle<()>,
}
impl Drop for Server {
    fn drop(&mut self) {
        self.task.abort();
    }
}
async fn server() -> Server {
    let state = Service::default();
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let url = format!("http://{}/api/", listener.local_addr().unwrap());
    let app = Router::new()
        .route("/api/catalog", get(listing))
        .route("/api/invoke", post(invoke))
        .with_state(state.clone());
    let task = tokio::spawn(async move {
        axum::serve(listener, app).await.unwrap();
    });
    Server { url, state, task }
}
fn dependencies(
    url: &str,
    reads: Arc<AtomicUsize>,
    methods: Value,
) -> BTreeMap<String, ModuleInstance> {
    let factory =
        HttpResourceFactory::new("source-authority", Arc::new(Credentials(reads))).unwrap();
    BTreeMap::from([(
        "connection".into(),
        factory
            .build(
                &json!({"base_url":url,"methods":methods,"credential_refs":["source_key"]}),
                &BTreeMap::new(),
            )
            .unwrap(),
    )])
}
fn config() -> Value {
    json!({"catalog_path":"catalog","invoke_path":"invoke","credential_ref":"source_key"})
}
fn source(
    value: &Value,
    dependencies: &BTreeMap<String, ModuleInstance>,
) -> Result<Arc<dyn ToolSource>, Error> {
    let ModuleInstance::ToolSource(source) = HttpToolSourceFactory.build(value, dependencies)?
    else {
        panic!("source")
    };
    Ok(source)
}
#[tokio::test]
async fn declared_http_source_is_pure_to_bind_and_pins_dynamic_calls_and_schema_to_the_version() {
    let server = server().await;
    let credentials = Arc::new(AtomicUsize::new(0));
    let source = source(
        &config(),
        &dependencies(&server.url, credentials.clone(), json!(["GET", "POST"])),
    )
    .unwrap();
    assert_eq!(credentials.load(Ordering::SeqCst), 0);
    assert_eq!(server.state.reads.load(Ordering::SeqCst), 0);
    let context = RunContext::new("thread", "run");
    let old = source.snapshot(&context).await.unwrap();
    let entry = old.catalog.get("external").unwrap();
    let result = entry
        .dispatch
        .call_terminal(
            ToolId::new("external").unwrap(),
            json!({"n":7}),
            ToolCallContext::default(),
        )
        .await
        .unwrap();
    assert_eq!(result.value, json!({"result":8}));
    assert!(
        entry
            .dispatch
            .call_terminal(
                ToolId::new("external").unwrap(),
                json!({"n":"bad"}),
                ToolCallContext::default()
            )
            .await
            .is_err()
    );
    assert!(
        entry
            .dispatch
            .call_terminal(
                ToolId::new("other").unwrap(),
                json!({"n":1}),
                ToolCallContext::default()
            )
            .await
            .is_err()
    );
    assert_eq!(server.state.writes.load(Ordering::SeqCst), 1);
    server.state.revision.store(1, Ordering::SeqCst);
    assert!(
        entry
            .dispatch
            .call_terminal(
                ToolId::new("external").unwrap(),
                json!({"n":7}),
                ToolCallContext::default()
            )
            .await
            .is_err()
    );
    assert_eq!(server.state.writes.load(Ordering::SeqCst), 1);
    let next = source.snapshot(&context).await.unwrap();
    assert_ne!(old.revision, next.revision);
    assert_eq!(
        next.catalog
            .get("external")
            .unwrap()
            .dispatch
            .call_terminal(
                ToolId::new("external").unwrap(),
                json!({"n":8}),
                ToolCallContext::default()
            )
            .await
            .unwrap()
            .value,
        json!({"result":9})
    );
}
#[tokio::test]
async fn source_binding_rejects_paths_credentials_methods_and_unknown_fields_without_any_io() {
    let server = server().await;
    let reads = Arc::new(AtomicUsize::new(0));
    let dependencies = dependencies(&server.url, reads.clone(), json!(["GET", "POST"]));
    for (field, value) in [
        ("catalog_path", json!("../escape")),
        ("invoke_path", json!("https://other.invalid/call")),
        ("credential_ref", json!("not_admitted")),
        ("max_input_bytes", json!(0)),
        ("max_output_bytes", json!(16777217)),
        ("timeout_ms", json!(0)),
        ("unknown", json!(true)),
        ("query", json!({"nested":{}})),
    ] {
        let mut value_config = config();
        value_config[field] = value;
        assert!(source(&value_config, &dependencies).is_err(), "{field}");
    }
    let post_only = self::dependencies(&server.url, reads.clone(), json!(["POST"]));
    assert!(source(&config(), &post_only).is_err());
    assert_eq!(reads.load(Ordering::SeqCst), 0);
    assert_eq!(server.state.reads.load(Ordering::SeqCst), 0);
}
#[tokio::test]
async fn discovery_observes_cancellation_and_request_limits_without_starting_business_effects() {
    let server = server().await;
    let dependencies = dependencies(
        &server.url,
        Arc::new(AtomicUsize::new(0)),
        json!(["GET", "POST"]),
    );
    let mut config = config();
    config["query"] = json!({"slow":true});
    config["timeout_ms"] = json!(20);
    let source = source(&config, &dependencies).unwrap();
    assert!(source.snapshot(&RunContext::new("t", "r")).await.is_err());
    let context = RunContext::new("t", "cancelled");
    context.cancel.cancel();
    assert!(source.snapshot(&context).await.is_err());
    assert_eq!(server.state.writes.load(Ordering::SeqCst), 0);
}
