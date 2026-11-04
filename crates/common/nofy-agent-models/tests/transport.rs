use axum::{
    Json, Router,
    body::{Body, Bytes},
    extract::State,
    http::{HeaderMap, StatusCode},
    response::{
        IntoResponse, Response,
        sse::{Event, Sse},
    },
    routing::post,
};
use futures::{Stream, StreamExt};
use nofy_agent_models::declarative::*;
use nofy_agent_runtime::{
    Error, Message, Model, ModelChunk, ModelDelta, ModelRequest, RunContext,
    credentials::CredentialProvider,
    registry::{ModuleFactory, ModuleInstance},
};
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    convert::Infallible,
    pin::Pin,
    sync::{
        Arc, Mutex,
        atomic::{AtomicUsize, Ordering},
    },
    task::{Context, Poll},
    time::Duration,
};

#[derive(Default)]
struct Authority {
    reads: AtomicUsize,
    value: Mutex<String>,
}
#[async_trait::async_trait]
impl CredentialProvider for Authority {
    fn identity(&self) -> &str {
        "wire-authority"
    }
    async fn resolve(&self, _: &str) -> Result<Option<String>, Error> {
        self.reads.fetch_add(1, Ordering::SeqCst);
        Ok(Some(self.value.lock().unwrap().clone()))
    }
}
#[derive(Default)]
struct Observed {
    requests: Mutex<Vec<(HeaderMap, Value)>>,
    dropped: Arc<AtomicUsize>,
}
struct PendingBody {
    first: Option<Bytes>,
    dropped: Arc<AtomicUsize>,
}
impl Stream for PendingBody {
    type Item = Result<Bytes, Infallible>;
    fn poll_next(mut self: Pin<&mut Self>, _: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        match self.first.take() {
            Some(bytes) => Poll::Ready(Some(Ok(bytes))),
            None => Poll::Pending,
        }
    }
}
impl Drop for PendingBody {
    fn drop(&mut self) {
        self.dropped.fetch_add(1, Ordering::SeqCst);
    }
}
async fn invoke(
    State(observed): State<Arc<Observed>>,
    headers: HeaderMap,
    Json(request): Json<Value>,
) -> Response {
    observed
        .requests
        .lock()
        .unwrap()
        .push((headers, request.clone()));
    let settings = &request["request"]["settings"];
    let scenario = settings["scenario"].as_str().unwrap_or("normal");
    let text = if request["attempt"] == 0 {
        "中"
    } else {
        "文"
    };
    let final_wire = json!({"text":text,"finished":true,"input_tokens":3,"output_tokens":2,
        "messages":[{"role":"opaque","provider":"wire-fixture","value":{"raw":[1,2,3]}}],
        "tool_calls":[{"id":"call-1","name":"inspect","arguments":{"path":"a"}}]});
    match scenario {
        "429" => (
            StatusCode::TOO_MANY_REQUESTS,
            [("retry-after", "2")],
            "must-not-appear-in-error",
        )
            .into_response(),
        "redirect" => (
            StatusCode::TEMPORARY_REDIRECT,
            [("location", "/elsewhere")],
            "",
        )
            .into_response(),
        "huge" => Response::builder()
            .body(Body::from(format!("data: {}", "x".repeat(4096))))
            .unwrap(),
        "pending" => Response::builder()
            .header("content-type", "text/event-stream")
            .body(Body::from_stream(PendingBody {
                first: Some(Bytes::from_static(
                    b"data: {\"deltas\":[{\"kind\":\"text\",\"text\":\"first\"}]}\n\n",
                )),
                dropped: observed.dropped.clone(),
            }))
            .unwrap(),
        _ if settings["mode"] == "json" => Json(final_wire).into_response(),
        _ => {
            let first = json!({"deltas":[{"kind":"reasoning","text":"think"},
                {"kind":"tool_call","index":0,"id":"call-1","name":"inspect","arguments":"{\"path\":"},
                {"kind":"tool_call","index":0,"id":null,"name":null,"arguments":"\"a\"}"},
                {"kind":"text","text":"中"}]});
            let mut frames = vec![first];
            if scenario != "truncated" {
                frames.push(final_wire);
            }
            Sse::new(futures::stream::iter(frames.into_iter().map(|v| {
                Ok::<_, Infallible>(Event::default().event("wire").data(v.to_string()))
            })))
            .into_response()
        }
    }
}
struct Server {
    url: String,
    task: tokio::task::JoinHandle<()>,
    observed: Arc<Observed>,
}
impl Drop for Server {
    fn drop(&mut self) {
        self.task.abort();
    }
}
async fn server() -> Server {
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let url = format!("http://{}/", listener.local_addr().unwrap());
    let observed = Arc::new(Observed::default());
    let app = Router::new()
        .route("/invoke", post(invoke))
        .with_state(observed.clone());
    let task = tokio::spawn(async move { axum::serve(listener, app).await.unwrap() });
    Server {
        url,
        task,
        observed,
    }
}
fn request(settings: Value) -> ModelRequest {
    ModelRequest {
        messages: vec![Message::User {
            content: "source input".into(),
        }],
        tools: vec![],
        settings,
    }
}
fn program(limits: Value) -> Value {
    json!({"source":{"kind":"inline","text":include_str!("wire.rhai")},"capabilities":{"streaming":true,"image_input":true,"structured_output":true},"limits":limits})
}
fn connection(url: &str) -> Value {
    json!({"base_url":url,"models":["wire"],"allow_insecure_http":true,"max_concurrency":1,
        "header_credentials":{"authorization":{"reference":"API_KEY","prefix":"Bearer "}},
        "endpoint_limits":{"wire":{"max_input_tokens":10,"max_output_tokens":20}}})
}
fn build(url: &str, authority: Arc<Authority>, limits: Value) -> Arc<dyn Model> {
    build_config(connection(url), authority, limits)
}
fn build_config(config: Value, authority: Arc<Authority>, limits: Value) -> Arc<dyn Model> {
    let protocol = ProtocolFactory::trusted()
        .build(&program(limits), &BTreeMap::new())
        .unwrap();
    let connection = ConnectionFactory::new(authority)
        .unwrap()
        .build(&config, &BTreeMap::new())
        .unwrap();
    match ProgrammedModelFactory::default()
        .build(
            &json!({"model":"wire"}),
            &BTreeMap::from([
                ("protocol".into(), protocol),
                ("connection".into(), connection),
            ]),
        )
        .unwrap()
    {
        ModuleInstance::Model(model) => model,
        _ => panic!("model kind"),
    }
}

#[tokio::test]
async fn idle_deadline_input_caps_and_unavailable_credentials_are_enforced() {
    let server = server().await;
    let authority = authority();
    let mut config = connection(&server.url);
    config["idle_timeout_ms"] = json!(20);
    let model = build_config(config, authority.clone(), json!({"max_input_bytes":256}));
    let mut large = request(json!({}));
    large.messages = vec![Message::User {
        content: "x".repeat(1024),
    }];
    assert_eq!(
        code(
            model
                .complete(large, &RunContext::default())
                .await
                .unwrap_err()
        ),
        "json_byte_limit"
    );
    assert_eq!(authority.reads.load(Ordering::SeqCst), 0);
    assert!(server.observed.requests.lock().unwrap().is_empty());
    // Use normal input/state limits for the pending response's bookkeeping.
    let mut config = connection(&server.url);
    config["idle_timeout_ms"] = json!(20);
    let model = build_config(config, authority.clone(), json!({}));
    assert_eq!(
        code(
            model
                .complete(
                    request(json!({"scenario":"pending"})),
                    &RunContext::default()
                )
                .await
                .unwrap_err()
        ),
        "idle_deadline"
    );
    assert_eq!(server.observed.requests.lock().unwrap().len(), 1);
    *authority.value.lock().unwrap() = "".into();
    assert_eq!(
        code(
            model
                .complete(request(json!({"mode":"json"})), &RunContext::default())
                .await
                .unwrap_err()
        ),
        "credential_unavailable"
    );
    *authority.value.lock().unwrap() = "canary\r\ninvalid-header".into();
    let error = model
        .complete(request(json!({"mode":"json"})), &RunContext::default())
        .await
        .unwrap_err();
    assert!(!error.to_string().contains("canary"));
    assert_eq!(code(error), "credential_header");
    assert_eq!(server.observed.requests.lock().unwrap().len(), 1);
    *authority.value.lock().unwrap() = "recovered-token".into();
    model
        .complete(request(json!({"mode":"json"})), &RunContext::default())
        .await
        .unwrap();
    assert_eq!(server.observed.requests.lock().unwrap().len(), 2);
}
fn authority() -> Arc<Authority> {
    Arc::new(Authority {
        reads: AtomicUsize::new(0),
        value: Mutex::new("first-token".into()),
    })
}
#[tokio::test]
async fn cancellation_before_start_or_while_queued_is_not_reported_as_truncated_completion() {
    let server = server().await;
    let authority = authority();
    let model = build(&server.url, authority.clone(), json!({}));
    let cancelled = RunContext::default();
    cancelled.cancel.cancel();
    let error = model
        .complete(request(json!({})), &cancelled)
        .await
        .unwrap_err();
    assert!(matches!(error, Error::Cancelled), "{error:?}");
    assert_eq!(authority.reads.load(Ordering::SeqCst), 0);
    let mut first = model
        .stream(
            request(json!({"scenario":"pending"})),
            &RunContext::default(),
        )
        .await
        .unwrap();
    first.next().await.unwrap().unwrap();
    let queued = RunContext::default();
    let mut second = model
        .stream(request(json!({"mode":"json"})), &queued)
        .await
        .unwrap();
    queued.cancel.cancel();
    let result = tokio::time::timeout(Duration::from_secs(5), second.next())
        .await
        .unwrap()
        .unwrap();
    assert!(matches!(result, Err(Error::Cancelled)), "{result:?}");
    assert_eq!(server.observed.requests.lock().unwrap().len(), 1);
    drop(first);
    drop(second);
    tokio::time::timeout(
        Duration::from_secs(5),
        model.complete(request(json!({"mode":"json"})), &RunContext::default()),
    )
    .await
    .unwrap()
    .unwrap();
}
fn code(error: Error) -> String {
    match error {
        Error::ModelFailure(failure) => failure.code.unwrap_or(failure.category),
        other => panic!("{other}"),
    }
}

#[tokio::test]
async fn streamed_reasoning_tool_arguments_opaque_history_and_live_secret_rotation() {
    let server = server().await;
    let authority = authority();
    let model = build(&server.url, authority.clone(), json!({}));
    assert_eq!(authority.reads.load(Ordering::SeqCst), 0);
    assert!(server.observed.requests.lock().unwrap().is_empty());
    let mut stream = model
        .stream(request(json!({})), &RunContext::default())
        .await
        .unwrap();
    let mut deltas = vec![];
    let mut completed = vec![];
    while let Some(chunk) = stream.next().await {
        match chunk.unwrap() {
            ModelChunk::Delta(delta) => deltas.push(delta),
            ModelChunk::Completed(response) => completed.push(response),
        }
    }
    assert_eq!(deltas.len(), 4);
    assert!(matches!(&deltas[0],ModelDelta::Reasoning {text} if text=="think"));
    assert!(matches!(&deltas[2],ModelDelta::ToolCall {arguments:Some(args),..} if args=="\"a\"}"));
    assert_eq!(completed.len(), 1);
    let response = &completed[0];
    assert_eq!(response.output, "中");
    assert_eq!((response.input_tokens, response.output_tokens), (3, 2));
    assert_eq!(response.tool_calls[0].arguments, json!({"path":"a"}));
    assert_eq!(response.info.provider["wire"], "preserved");
    assert_eq!(model.calls_used(response), Some(1));
    model
        .validate_live_history(&response.messages)
        .await
        .unwrap();
    assert!(
        model
            .validate_live_history(&[Message::Opaque {
                provider: "foreign".into(),
                value: json!({})
            }])
            .await
            .is_err()
    );
    *authority.value.lock().unwrap() = "rotated-token".into();
    model
        .complete(request(json!({"mode":"json"})), &RunContext::default())
        .await
        .unwrap();
    let requests = server.observed.requests.lock().unwrap();
    assert_eq!(requests.len(), 2);
    assert_eq!(requests[0].0["authorization"], "Bearer first-token");
    assert_eq!(requests[1].0["authorization"], "Bearer rotated-token");
    for (headers, body) in requests.iter() {
        assert!(!headers.contains_key("user-agent"));
        assert!(
            !headers
                .keys()
                .any(|name| name.as_str().starts_with("x-nofy"))
        );
        assert_eq!(body["request"]["messages"][0]["content"], "source input");
        assert!(!body.to_string().contains("token"));
    }
}
#[tokio::test]
async fn explicit_followups_have_aggregate_budget_and_no_hidden_retries() {
    let server = server().await;
    let model = build(&server.url, authority(), json!({"max_requests":2}));
    let request = request(json!({"mode":"json","next":true}));
    let bounds = model
        .request_bound(&request, &RunContext::default())
        .await
        .unwrap();
    assert_eq!(
        (
            bounds.max_calls,
            bounds.max_input_tokens,
            bounds.max_output_tokens
        ),
        (2, Some(20), Some(40))
    );
    let response = model
        .complete(request, &RunContext::default())
        .await
        .unwrap();
    assert_eq!(response.output, "中文");
    assert_eq!((response.input_tokens, response.output_tokens), (6, 4));
    assert_eq!(model.calls_used(&response), Some(2));
    assert_eq!(server.observed.requests.lock().unwrap().len(), 2);
    let error = model
        .complete(
            crate::request(json!({"mode":"json","next":true,"repeat":true})),
            &RunContext::default(),
        )
        .await
        .unwrap_err();
    assert_eq!(code(error), "request_count");
    assert_eq!(server.observed.requests.lock().unwrap().len(), 4);
}
#[tokio::test]
async fn truncation_frame_count_response_caps_and_path_escape_fail_closed() {
    let server = server().await;
    for (settings, limits, expected) in [
        (
            json!({"scenario":"truncated"}),
            json!({}),
            "truncated_stream",
        ),
        (json!({}), json!({"max_frames":1}), "frame_count"),
        (
            json!({"scenario":"huge"}),
            json!({"max_frame_bytes":256}),
            "frame_limit",
        ),
        (
            json!({"scenario":"huge"}),
            json!({"max_response_bytes":256}),
            "response_limit",
        ),
        (
            json!({"path":"https://elsewhere.invalid/"}),
            json!({}),
            "endpoint_escape",
        ),
        (json!({"path":"../escape"}), json!({}), "endpoint_escape"),
        (
            json!({"path":"%2e%2e/escape"}),
            json!({}),
            "endpoint_escape",
        ),
    ] {
        let model = build(&server.url, authority(), limits);
        let error = model
            .complete(request(settings), &RunContext::default())
            .await
            .unwrap_err();
        assert_eq!(code(error), expected);
    }
    assert_eq!(server.observed.requests.lock().unwrap().len(), 4);
}
#[tokio::test]
async fn errors_do_not_leak_bodies_or_follow_redirects() {
    let server = server().await;
    let model = build(&server.url, authority(), json!({}));
    let error = model
        .complete(request(json!({"scenario":"429"})), &RunContext::default())
        .await
        .unwrap_err();
    assert!(!error.to_string().contains("must-not-appear"));
    match error {
        Error::ModelFailure(failure) => {
            assert_eq!(failure.status, Some(429));
            assert!(failure.retryable);
            assert_eq!(failure.retry_after_ms, Some(2000));
        }
        other => panic!("{other}"),
    }
    let error = model
        .complete(
            request(json!({"scenario":"redirect"})),
            &RunContext::default(),
        )
        .await
        .unwrap_err();
    assert!(matches!(error,Error::ModelFailure(failure) if failure.status==Some(307)));
    assert_eq!(server.observed.requests.lock().unwrap().len(), 2);
}
#[tokio::test]
async fn stream_drop_and_explicit_cancellation_retire_real_http_work_and_release_admission() {
    let server = server().await;
    let model = build(&server.url, authority(), json!({}));
    for explicit in [false, true] {
        let context = RunContext::default();
        let mut stream = model
            .stream(request(json!({"scenario":"pending"})), &context)
            .await
            .unwrap();
        assert!(matches!(
            stream.next().await.unwrap().unwrap(),
            ModelChunk::Delta(_)
        ));
        if explicit {
            context.cancel.cancel();
            assert!(matches!(
                stream.next().await.unwrap(),
                Err(Error::Cancelled)
            ));
        }
        drop(stream);
        tokio::time::timeout(
            Duration::from_secs(5),
            model.complete(request(json!({"mode":"json"})), &RunContext::default()),
        )
        .await
        .unwrap()
        .unwrap();
    }
    tokio::time::timeout(Duration::from_secs(5), async {
        while server.observed.dropped.load(Ordering::SeqCst) != 2 {
            tokio::task::yield_now().await;
        }
    })
    .await
    .unwrap();
}
#[test]
fn declarations_reject_ambient_auth_unknown_fields_duplicate_headers_and_wrong_dependencies() {
    let factory = ConnectionFactory::new(authority()).unwrap();
    for patch in [
        json!({"api_key":"secret"}),
        json!({"headers":{"authorization":"secret"}}),
        json!({"headers":{"X-Test":"one","x-test":"two"}}),
        json!({"headers":{"host":"escape"}}),
        json!({"base_url":"http://example.invalid/","allow_insecure_http":false}),
        json!({"base_url":"https://user:secret@example.invalid/"}),
        json!({"tls":{"identity_ref":"bad-ref"}}),
        json!({"proxy_url":"http://user:secret@proxy.invalid/"}),
    ] {
        let mut config = connection("https://example.invalid/v1/");
        config
            .as_object_mut()
            .unwrap()
            .extend(patch.as_object().unwrap().clone());
        assert!(factory.build(&config, &BTreeMap::new()).is_err(), "{patch}");
    }
    let plain = connection("https://example.invalid/v1/");
    let a = factory.build(&plain, &BTreeMap::new()).unwrap();
    let b = factory.build(&plain, &BTreeMap::new()).unwrap();
    match (&a, &b) {
        (ModuleInstance::Resource(a), ModuleInstance::Resource(b)) => {
            assert_eq!(a.identity(), b.identity())
        }
        _ => panic!("resource kind"),
    }
    assert!(
        ProgrammedModelFactory::default()
            .build(
                &json!({"model":"wire"}),
                &BTreeMap::from([("protocol".into(), a.clone()), ("connection".into(), a)])
            )
            .is_err()
    );
    let mut invalid = program(json!({}));
    invalid["source"]["text"] = json!("eval(\"1\")");
    assert!(
        ProtocolFactory::trusted()
            .build(&invalid, &BTreeMap::new())
            .is_err()
    );
}
#[tokio::test]
async fn operation_limits_stop_programs_before_network_and_do_not_poison_following_calls() {
    let server = server().await;
    let source = "if args.phase == \"history\" {return true;} let n=0; while true {n+=1;}";
    let config = json!({"source":{"kind":"inline","text":source},"capabilities":{},"limits":{"max_step_operations":1000}});
    let protocol = ProtocolFactory::trusted()
        .build(&config, &BTreeMap::new())
        .unwrap();
    let connection = ConnectionFactory::new(authority())
        .unwrap()
        .build(&connection(&server.url), &BTreeMap::new())
        .unwrap();
    let factory = ProgrammedModelFactory::default();
    let model = match factory
        .build(
            &json!({"model":"wire"}),
            &BTreeMap::from([
                ("protocol".into(), protocol),
                ("connection".into(), connection),
            ]),
        )
        .unwrap()
    {
        ModuleInstance::Model(model) => model,
        _ => panic!("model kind"),
    };
    let error = tokio::time::timeout(
        Duration::from_secs(5),
        model.complete(request(json!({})), &RunContext::default()),
    )
    .await
    .unwrap()
    .unwrap_err();
    assert_eq!(code(error), "program");
    assert!(server.observed.requests.lock().unwrap().is_empty());
    build(&server.url, authority(), json!({}))
        .complete(request(json!({"mode":"json"})), &RunContext::default())
        .await
        .unwrap();
}
