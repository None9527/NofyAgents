use super::declarative::*;
use super::*;
use axum::{
    Json, Router,
    extract::State,
    response::{IntoResponse, sse::Sse},
    routing::post,
};
use nofy_agent_runtime::{registry::*, system::*};
use std::{
    convert::Infallible,
    sync::{
        Arc, Mutex,
        atomic::{AtomicUsize, Ordering},
    },
};
#[derive(Clone)]
struct Endpoint {
    backend: ApiBackend,
    requests: Arc<Mutex<Vec<Value>>>,
    headers: Arc<Mutex<Vec<axum::http::HeaderMap>>>,
}
struct Server {
    url: String,
    state: Endpoint,
    task: tokio::task::JoinHandle<()>,
}
impl Drop for Server {
    fn drop(&mut self) {
        self.task.abort();
    }
}
async fn handle(
    State(state): State<Endpoint>,
    headers: axum::http::HeaderMap,
    Json(body): Json<Value>,
) -> impl IntoResponse {
    state.requests.lock().unwrap().push(body);
    state.headers.lock().unwrap().push(headers);
    let frames = match state.backend {
        ApiBackend::ChatCompletions => {
            nofy_test_support::sse::chat_completion_events_exact("hello world", "test-model")
        }
        ApiBackend::Responses => {
            nofy_test_support::sse::responses_api_events_exact("hello world", "test-model")
        }
        ApiBackend::Messages => {
            nofy_test_support::sse::messages_api_events("hello world", "test-model", "end_turn")
        }
    };
    Sse::new(futures_util::stream::iter(
        frames.into_iter().map(Ok::<_, Infallible>),
    ))
}
async fn server(backend: ApiBackend) -> Server {
    let state = Endpoint {
        backend,
        requests: Arc::new(Mutex::new(vec![])),
        headers: Arc::new(Mutex::new(vec![])),
    };
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let url = format!("http://{}/v1", listener.local_addr().unwrap());
    let app = Router::new()
        .route("/v1/chat/completions", post(handle))
        .route("/v1/responses", post(handle))
        .route("/v1/messages", post(handle))
        .with_state(state.clone());
    let task = tokio::spawn(async move { axum::serve(listener, app).await.unwrap() });
    Server { url, state, task }
}
struct Credentials {
    identity: String,
    value: Mutex<Option<String>>,
    reads: AtomicUsize,
}
#[async_trait::async_trait]
impl CredentialProvider for Credentials {
    fn identity(&self) -> &str {
        &self.identity
    }
    async fn resolve(&self, reference: &str) -> Result<Option<String>, Error> {
        assert_eq!(reference, "TOKEN");
        self.reads.fetch_add(1, Ordering::SeqCst);
        Ok(self.value.lock().unwrap().clone())
    }
}
fn credentials(identity: &str) -> Arc<Credentials> {
    Arc::new(Credentials {
        identity: identity.into(),
        value: Mutex::new(Some("private-credential-one".into())),
        reads: AtomicUsize::new(0),
    })
}
fn registry(credentials: Arc<Credentials>) -> ModuleRegistry {
    let mut r = ModuleRegistry::default();
    r.register_factory(Arc::new(SamplerResourceFactory::new(credentials).unwrap()))
        .unwrap();
    r.register_factory(Arc::new(ConnectedModelFactory)).unwrap();
    r.register_factory(Arc::new(StaticPromptFactory)).unwrap();
    r
}
fn reference(id: &str) -> ModuleRef {
    ModuleRef::new(id, "1")
}
fn document(url: &str, backend: ApiBackend) -> SystemDocument {
    serde_json::from_value(json!({"schema_version":1,"name":"declarative-provider","modules":[
        {"reference":reference("connection"),"factory":"resource.sampler","config":{"connection":{"base_url":url,"api_backend":backend,"max_retries":0,"max_completion_tokens":16,"auth_scheme":if backend==ApiBackend::Messages{"x_api_key"}else{"bearer"}},"models":["test-model"],"credential_ref":"TOKEN","header_refs":{"x-resource-credential":"TOKEN"},"request_limits":{"test-model":{"max_input_tokens":64,"max_output_tokens":32}}}},
        {"reference":reference("model"),"factory":"model.connected","config":{"model":"test-model"},"dependencies":{"connection":reference("connection")}},
        {"reference":reference("prompt"),"factory":"prompt.static","config":{"text":"resource-defined system"}}
    ],"programs":{"chat":{"kind":"agent","definition":{"name":"resource-agent","model":reference("model"),"prompt":reference("prompt")}}}})).unwrap()
}
async fn run(system: &CompiledSystem, id: &str) -> Result<nofy_agent_runtime::RunOutcome, Error> {
    let mut context = RunContext::new(id, id);
    context.capabilities.insert(SamplerConfig {
        base_url: "http://127.0.0.1:9".into(),
        model: "do-not-use".into(),
        api_key: Some("do-not-send".into()),
        ..Default::default()
    });
    system
        .program("chat")?
        .invoke(nofy_agent_runtime::RunInput::new("user message"), context)
        .await
}
#[tokio::test]
async fn declarative_connection_is_pure_streams_all_native_backends_and_resolves_credentials_only_at_call()
 {
    for backend in [
        ApiBackend::ChatCompletions,
        ApiBackend::Responses,
        ApiBackend::Messages,
    ] {
        let server = server(backend.clone()).await;
        let credentials = credentials("project-authority");
        let host = registry(credentials.clone());
        let system = compile_system(document(&server.url, backend.clone()), &host).unwrap();
        let bytes = serde_json::to_string(&system.bundle).unwrap();
        assert!(!bytes.contains("private-credential-one"));
        assert!(!bytes.contains("do-not-send"));
        assert_eq!(credentials.reads.load(Ordering::SeqCst), 0);
        assert!(server.state.requests.lock().unwrap().is_empty());
        let outcome = run(&system, "first").await.unwrap();
        assert!(
            matches!(outcome,nofy_agent_runtime::RunOutcome::Completed{output,..} if output=="hello world")
        );
        *credentials.value.lock().unwrap() = Some("private-credential-two".into());
        assert!(matches!(
            run(&system, "second").await.unwrap(),
            nofy_agent_runtime::RunOutcome::Completed { .. }
        ));
        let headers = server.state.headers.lock().unwrap();
        assert_eq!(headers.len(), 2);
        assert_eq!(
            headers[0]["x-resource-credential"],
            "private-credential-one"
        );
        assert_eq!(
            headers[1]["x-resource-credential"],
            "private-credential-two"
        );
        let auth = if backend == ApiBackend::Messages {
            "x-api-key"
        } else {
            "authorization"
        };
        assert!(
            headers[1][auth]
                .to_str()
                .unwrap()
                .contains("private-credential-two")
        );
        let requests = server.state.requests.lock().unwrap();
        assert_eq!(requests.len(), 2);
        assert!(requests.iter().all(|r| r["model"] == "test-model"));
    }
}
#[tokio::test]
async fn adding_an_unrelated_connection_keeps_old_program_identity_and_locked_restore() {
    let server = server(ApiBackend::ChatCompletions).await;
    let credentials = credentials("project-authority");
    let host = registry(credentials.clone());
    let original =
        compile_system(document(&server.url, ApiBackend::ChatCompletions), &host).unwrap();
    let mut next = original.bundle.document.clone();
    let mut extra = next
        .modules
        .iter()
        .find(|m| m.reference == reference("connection"))
        .unwrap()
        .clone();
    extra.reference = reference("another-connection");
    extra.config["models"] = json!(["another-model"]);
    extra.config["request_limits"] = json!({});
    next.modules.push(extra);
    let next = compile_system(next, &host).unwrap();
    assert_ne!(original.bundle.digest, next.bundle.digest);
    assert_eq!(
        original.program("chat").unwrap().composition_identity(),
        next.program("chat").unwrap().composition_identity()
    );
    let target = registry(credentials);
    let restored = original.bundle.restore(&target).unwrap();
    assert!(matches!(
        run(&restored, "restored").await.unwrap(),
        nofy_agent_runtime::RunOutcome::Completed { .. }
    ));
}
#[tokio::test]
async fn wrong_authority_resource_type_names_and_connection_fields_fail_before_model_io() {
    let server = server(ApiBackend::ChatCompletions).await;
    let credentials = credentials("project-authority");
    let host = registry(credentials.clone());
    let source = document(&server.url, ApiBackend::ChatCompletions);
    let bundle = compile_system(source.clone(), &host).unwrap().bundle;
    assert!(
        bundle
            .restore(&registry(self::credentials("another-authority")))
            .is_err()
    );
    for field in ["api_key", "model", "env_http_headers", "unrecognized"] {
        let mut source = source.clone();
        source.modules[0].config["connection"][field] = json!("inline-value");
        assert!(compile_system(source, &host).is_err(), "{field}");
    }
    let mut invalid_model = source.clone();
    invalid_model.modules[1].config["model"] = json!("unadmitted");
    assert!(compile_system(invalid_model, &host).is_err());
    let mut invalid_dependency = source.clone();
    invalid_dependency.modules[1]
        .dependencies
        .insert("connection".into(), reference("prompt"));
    assert!(compile_system(invalid_dependency, &host).is_err());
    assert_eq!(credentials.reads.load(Ordering::SeqCst), 0);
    assert!(server.state.requests.lock().unwrap().is_empty());
}
#[tokio::test]
async fn missing_credential_is_known_failure_without_http_and_request_bounds_use_original_sampler()
{
    let server = server(ApiBackend::ChatCompletions).await;
    let credentials = credentials("project-authority");
    *credentials.value.lock().unwrap() = None;
    let host = registry(credentials);
    let system = compile_system(document(&server.url, ApiBackend::ChatCompletions), &host).unwrap();
    let resolved = system
        .registry()
        .resolve_typed(&[(reference("model"), ModuleKind::Model)])
        .unwrap();
    let ModuleInstance::Model(model) = &resolved.instances[&reference("model")] else {
        panic!("model")
    };
    let bound=model.request_bound(&ModelRequest{messages:vec![],tools:vec![],settings:json!({"json_schema":{"type":"object"},"structured_output_retries":1,"max_output_tokens":12})},&RunContext::new("bound","bound")).unwrap();
    assert_eq!(bound.max_calls, 2);
    assert_eq!(bound.max_input_tokens, Some(128));
    assert_eq!(bound.max_output_tokens, Some(24));
    assert!(
        matches!(run(&system,"missing").await,Err(Error::ModelFailure(failure)) if failure.code.as_deref()==Some("credential_unavailable"))
    );
    assert!(server.state.requests.lock().unwrap().is_empty());
}
