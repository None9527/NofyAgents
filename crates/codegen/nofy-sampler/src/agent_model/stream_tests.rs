use super::*;
use axum::{
    Json, Router,
    extract::State,
    response::{
        IntoResponse, Response,
        sse::{Event, Sse},
    },
    routing::post,
};
use std::{
    convert::Infallible,
    sync::{
        Arc, Mutex,
        atomic::{AtomicUsize, Ordering},
    },
};
use tokio::sync::Notify;

#[derive(Clone)]
enum Mode {
    Text,
    Repair,
    Invalid,
    FinalTool,
    Failure,
    Refusal,
    Auth(u16, bool),
    AuthRepair,
    AuthByKey,
    Redirect(String),
}
#[derive(Clone)]
struct Mock {
    backend: ApiBackend,
    mode: Mode,
    requests: Arc<Mutex<Vec<Value>>>,
    headers: Arc<Mutex<Vec<axum::http::HeaderMap>>>,
    calls: Arc<AtomicUsize>,
    gate: Option<Arc<Notify>>,
}
struct Server {
    url: String,
    state: Mock,
    task: tokio::task::JoinHandle<()>,
}
impl Drop for Server {
    fn drop(&mut self) {
        self.task.abort();
    }
}

fn final_tool_events(value: Value) -> Vec<Event> {
    [
        json!({"type":"message_start","message":{"id":"message","type":"message","role":"assistant","model":"test-model","content":[],"usage":{"input_tokens":10,"output_tokens":0}}}),
        json!({"type":"content_block_start","index":0,"content_block":{"type":"tool_use","id":"structured-1","name":"StructuredOutput","input":{}}}),
        json!({"type":"content_block_delta","index":0,"delta":{"type":"input_json_delta","partial_json":json!({"value":value}).to_string()}}),
        json!({"type":"content_block_stop","index":0}),
        json!({"type":"message_delta","delta":{"stop_reason":"tool_use"},"usage":{"output_tokens":5}}),
        json!({"type":"message_stop"}),
    ].into_iter().map(|event|Event::default().data(event.to_string())).collect()
}
async fn handle(
    State(state): State<Mock>,
    headers: axum::http::HeaderMap,
    Json(request): Json<Value>,
) -> Response {
    state.requests.lock().unwrap().push(request);
    state.headers.lock().unwrap().push(headers.clone());
    let attempt = state.calls.fetch_add(1, Ordering::SeqCst);
    if let Mode::Redirect(ref target) = state.mode {
        return (
            axum::http::StatusCode::TEMPORARY_REDIRECT,
            [("location", target.as_str())],
        )
            .into_response();
    }
    let rejected = match state.mode {
        Mode::Auth(status, always) if always || attempt == 0 => Some(status),
        Mode::AuthRepair if attempt == 0 => Some(401),
        Mode::AuthByKey
            if !headers.values().any(|value| {
                value
                    .to_str()
                    .is_ok_and(|value| value.contains("fresh-token"))
            }) =>
        {
            Some(401)
        }
        _ => None,
    };
    if let Some(status) = rejected {
        return (
            axum::http::StatusCode::from_u16(status).unwrap(),
            Json(json!({"error":{"message":"mock auth rejection","code":"auth"}})),
        )
            .into_response();
    }
    if matches!(state.mode, Mode::Failure) {
        return (
            axum::http::StatusCode::SERVICE_UNAVAILABLE,
            [("retry-after", "2"), ("x-should-retry", "false")],
            Json(json!({"error":{"message":"mock unavailable","code":"temporary"}})),
        )
            .into_response();
    }
    let text = match state.mode {
        Mode::AuthRepair if attempt == 1 => "not JSON",
        Mode::AuthRepair => r#"{"result":"ok"}"#,
        Mode::Repair if attempt == 0 => "not JSON",
        Mode::Repair => r#"{"result":"ok"}"#,
        Mode::Invalid => "not JSON",
        _ => "hello world",
    };
    let frames = if matches!(state.mode, Mode::Refusal) {
        nofy_test_support::sse::messages_api_events("", "test-model", "refusal")
    } else if matches!(state.mode, Mode::FinalTool) {
        final_tool_events(json!({"result":"ok"}))
    } else {
        match state.backend {
            ApiBackend::ChatCompletions => {
                nofy_test_support::sse::chat_completion_events_exact(text, "test-model")
            }
            ApiBackend::Responses => {
                nofy_test_support::sse::responses_api_events_exact(text, "test-model")
            }
            ApiBackend::Messages => {
                nofy_test_support::sse::messages_api_events(text, "test-model", "end_turn")
            }
        }
    };
    let stream = async_stream::stream! {
        for (index,frame) in frames.into_iter().enumerate() {
            if index==1 && let Some(gate)=&state.gate {gate.notified().await;}
            yield Ok::<_,Infallible>(frame);
        }
    };
    Sse::new(stream).into_response()
}
async fn server(backend: ApiBackend, mode: Mode, gate: Option<Arc<Notify>>) -> Server {
    let state = Mock {
        backend,
        mode,
        gate,
        requests: Arc::new(Mutex::new(Vec::new())),
        headers: Arc::new(Mutex::new(Vec::new())),
        calls: Arc::new(AtomicUsize::new(0)),
    };
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let url = format!("http://{}/v1", listener.local_addr().unwrap());
    let router = Router::new()
        .route("/v1/chat/completions", post(handle))
        .route("/v1/responses", post(handle))
        .route("/v1/messages", post(handle))
        .with_state(state.clone());
    let task = tokio::spawn(async move {
        axum::serve(listener, router).await.unwrap();
    });
    Server { url, state, task }
}
fn model(server: &Server, backend: ApiBackend) -> SamplerModel {
    SamplerModel::new(SamplerConfig {
        base_url: server.url.clone(),
        model: "test-model".into(),
        api_key: Some("test-key".into()),
        api_backend: backend,
        max_retries: Some(0),
        ..Default::default()
    })
}
fn request(settings: Value) -> ModelRequest {
    ModelRequest {
        messages: vec![Message::User {
            content: "hello".into(),
        }],
        tools: vec![],
        settings,
    }
}
fn context() -> RunContext {
    RunContext::new("thread", "run")
}

#[tokio::test]
async fn configured_model_factory_is_pure_and_uses_only_admitted_connections_and_names() {
    use super::factory::{SamplerConnection, SamplerModelFactory};
    use nofy_agent_runtime::registry::{ModuleFactory, ModuleInstance};
    use std::collections::{BTreeMap, BTreeSet};
    let server = server(ApiBackend::ChatCompletions, Mode::Text, None).await;
    let config = model(&server, ApiBackend::ChatCompletions).config;
    let connection = SamplerConnection::new(
        config,
        BTreeSet::from(["test-model".into()]),
        "connection-v1",
    )
    .unwrap();
    let factory =
        SamplerModelFactory::new("v1", BTreeMap::from([("provider".into(), connection)])).unwrap();
    assert!(
        !serde_json::to_string(&factory.descriptor())
            .unwrap()
            .contains("test-key")
    );
    for config in [
        json!({"connection":"other","model":"test-model"}),
        json!({"connection":"provider","model":"unadmitted"}),
        json!({"connection":"provider","model":"test-model","api_key":"injected"}),
    ] {
        assert!(factory.build(&config, &BTreeMap::new()).is_err());
    }
    let ModuleInstance::Model(model) = factory
        .build(
            &json!({"connection":"provider","model":"test-model"}),
            &BTreeMap::new(),
        )
        .unwrap()
    else {
        panic!("model")
    };
    assert_eq!(server.state.calls.load(Ordering::SeqCst), 0);
    assert_eq!(
        model
            .complete(request(json!({})), &context())
            .await
            .unwrap()
            .output,
        "hello world"
    );
    assert_eq!(server.state.calls.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn live_chat_delta_precedes_final_response_and_parameters_reach_the_wire() {
    let gate = Arc::new(Notify::new());
    let server = server(ApiBackend::ChatCompletions, Mode::Text, Some(gate.clone())).await;
    let model = model(&server, ApiBackend::ChatCompletions);
    let mut stream=model.stream(request(json!({"temperature":0.4,"top_p":0.8,"max_output_tokens":128,"reasoning_effort":"low"})),&context()).await.unwrap();
    let mut first = false;
    let mut answer = None;
    while let Some(event) = stream.next().await {
        match event.unwrap() {
            ModelChunk::Delta(ModelDelta::Text { text }) if !first => {
                assert_eq!(text, "hello");
                first = true;
                gate.notify_one();
            }
            ModelChunk::Completed(response) => answer = Some(response),
            _ => {}
        }
    }
    assert!(first);
    let answer = answer.unwrap();
    assert_eq!(answer.output, "hello world");
    assert_eq!(answer.info.stop_reason.as_deref(), Some("stop"));
    let requests = server.state.requests.lock().unwrap();
    let wire = &requests[0];
    assert_eq!(requests.len(), 1);
    assert_eq!(wire["temperature"], 0.4);
    assert_eq!(wire["top_p"], 0.8);
    assert_eq!(wire["reasoning_effort"], "low");
    assert_eq!(
        wire.get("max_completion_tokens")
            .or_else(|| wire.get("max_tokens"))
            .unwrap(),
        128
    );
}

#[tokio::test]
async fn all_existing_backend_streams_keep_text_and_user_image_content() {
    for backend in [
        ApiBackend::ChatCompletions,
        ApiBackend::Responses,
        ApiBackend::Messages,
    ] {
        let server = server(backend.clone(), Mode::Text, None).await;
        let model = model(&server, backend.clone());
        let image = "https://example.invalid/image.png";
        let mut input = request(json!({"max_output_tokens":128}));
        input.messages = vec![Message::UserParts {
            content: vec![
                nofy_agent_runtime::InputPart::Text {
                    text: "describe".into(),
                },
                nofy_agent_runtime::InputPart::Image { url: image.into() },
            ],
        }];
        let mut stream = model.stream(input, &context()).await.unwrap();
        let mut text = String::new();
        let mut output = None;
        while let Some(chunk) = stream.next().await {
            match chunk.unwrap() {
                ModelChunk::Delta(ModelDelta::Text { text: delta }) => text.push_str(&delta),
                ModelChunk::Completed(response) => output = Some(response.output),
                _ => {}
            }
        }
        assert_eq!(text, "hello world");
        assert_eq!(output.as_deref(), Some("hello world"));
        assert!(
            server.state.requests.lock().unwrap()[0]
                .to_string()
                .contains(image)
        );
    }
}

fn answer_schema() -> Value {
    json!({"type":"object","properties":{"result":{"type":"string"}},"required":["result"],"additionalProperties":false})
}
#[tokio::test]
async fn native_structured_output_repairs_are_bounded_and_keep_usage_and_history() {
    let repair = server(ApiBackend::ChatCompletions, Mode::Repair, None).await;
    let repair_model = model(&repair, ApiBackend::ChatCompletions);
    let response = repair_model
        .complete(
            request(json!({"json_schema":answer_schema(),"structured_output_retries":1})),
            &context(),
        )
        .await
        .unwrap();
    assert_eq!(
        response.info.structured_output,
        Some(json!({"result":"ok"}))
    );
    assert_eq!(response.info.provider["structured_output_repairs"], 1);
    assert_eq!(response.input_tokens, 20);
    assert!(response.messages.iter().any(|message|matches!(message,Message::Opaque {value,..} if value.to_string().contains("not JSON"))));
    let requests = repair.state.requests.lock().unwrap();
    assert_eq!(requests.len(), 2);
    assert_eq!(requests[0]["response_format"]["type"], "json_schema");
    assert!(
        requests[1]
            .to_string()
            .contains("Final-answer validation failed")
    );
    drop(requests);
    let invalid = server(ApiBackend::ChatCompletions, Mode::Invalid, None).await;
    let error = model(&invalid, ApiBackend::ChatCompletions)
        .complete(
            request(json!({"json_schema":answer_schema(),"structured_output_retries":1})),
            &context(),
        )
        .await
        .unwrap_err();
    assert!(error.to_string().contains("repair budget exhausted"));
    assert_eq!(invalid.state.calls.load(Ordering::SeqCst), 2);
}

#[tokio::test]
async fn messages_schema_finalization_preserves_tool_pairing_for_later_turns() {
    let server = server(ApiBackend::Messages, Mode::FinalTool, None).await;
    let model = model(&server, ApiBackend::Messages);
    let response = model
        .complete(request(json!({"json_schema":answer_schema()})), &context())
        .await
        .unwrap();
    assert!(response.tool_calls.is_empty());
    assert_eq!(
        response.info.structured_output,
        Some(json!({"result":"ok"}))
    );
    assert!(
        response
            .messages
            .iter()
            .any(|message| matches!(message,Message::Tool {call_id,..} if call_id=="structured-1"))
    );
    let mut next = request(json!({"json_schema":answer_schema()}));
    next.messages.extend(response.messages);
    next.messages.push(Message::User {
        content: "next".into(),
    });
    model.complete(next, &context()).await.unwrap();
    let requests = server.state.requests.lock().unwrap();
    assert_eq!(requests.len(), 2);
    assert!(
        requests[0]["tools"]
            .as_array()
            .unwrap()
            .iter()
            .any(|tool| tool["name"] == "StructuredOutput")
    );
    assert!(
        requests[1].to_string().contains("tool_result")
            && requests[1].to_string().contains("structured-1")
    );
}

#[tokio::test]
async fn unsupported_and_invalid_settings_fail_before_any_provider_request() {
    let server = server(ApiBackend::ChatCompletions, Mode::Text, None).await;
    let model = model(&server, ApiBackend::ChatCompletions);
    for settings in [
        json!({"api_key":"must-not-be-accepted"}),
        json!({"temperature":"hot"}),
        json!({"reasoning_summary":"concise"}),
        json!({"json_schema":{"$ref":"https://example.invalid/schema"}}),
    ] {
        assert!(model.complete(request(settings), &context()).await.is_err());
    }
    assert_eq!(server.state.calls.load(Ordering::SeqCst), 0);
    let mut components = nofy_agent_runtime::Components::default();
    components.models.insert("model".into(), Arc::new(model));
    components.prompts.insert(
        "prompt".into(),
        Arc::new(nofy_agent_runtime::StaticPrompt("test".into())),
    );
    assert!(
        nofy_agent_runtime::AgentBuilder::new("test")
            .model("model")
            .prompt("prompt")
            .settings(nofy_agent_runtime::Settings {
                model: json!({"json_schema":{"$ref":"https://example.invalid/schema"}}),
                ..Default::default()
            })
            .compile(&components)
            .is_err()
    );
}

#[tokio::test]
async fn provider_http_failures_keep_status_retry_guidance_and_code() {
    let server = server(ApiBackend::ChatCompletions, Mode::Failure, None).await;
    let error = model(&server, ApiBackend::ChatCompletions)
        .complete(request(json!({})), &context())
        .await
        .unwrap_err();
    let Error::ModelFailure(error) = error else {
        panic!("untyped model error: {error}")
    };
    assert_eq!(error.status, Some(503));
    assert!(!error.retryable);
    assert_eq!(error.retry_after_ms, Some(2000));
    assert_eq!(error.code.as_deref(), Some("temporary"));
    assert_eq!(server.state.calls.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn provider_refusal_keeps_its_stop_metadata_and_is_not_schema_retried() {
    let server = server(ApiBackend::Messages, Mode::Refusal, None).await;
    let response = model(&server, ApiBackend::Messages)
        .complete(
            request(json!({"json_schema":answer_schema(),"structured_output_retries":5})),
            &context(),
        )
        .await
        .unwrap();
    assert_eq!(response.info.stop_reason.as_deref(), Some("content_filter"));
    assert!(response.info.refusal.is_some());
    assert_eq!(response.info.provider["raw_stop_reason"], "refusal");
    assert!(response.info.structured_output.is_none());
    assert_eq!(server.state.calls.load(Ordering::SeqCst), 1);
}

#[test]
fn structured_finalization_validates_local_refs_at_the_original_schema_root() {
    let schema = json!({"$defs":{"answer":{"type":"object","required":["x"],"properties":{"x":{"type":"integer"}}}},"$ref":"#/$defs/answer"});
    let mut response = ConversationResponse {
        items: vec![ConversationItem::assistant_tool_calls(vec![
            nofy_sampling_types::ToolCall {
                id: "call".into(),
                name: "StructuredOutput".into(),
                arguments: json!({"value":{"x":1}}).to_string().into(),
            },
        ])],
        stop_reason: None,
        usage: None,
        cost_usd_ticks: None,
        message_chunks_emitted: 0,
        doom_loop_signals: Vec::new(),
        stop_message: None,
        message_id: None,
        raw_stop_reason: None,
        stop_sequence: None,
    };
    assert!(structured::finalize(&schema, &response).unwrap().is_some());
    if let ConversationItem::Assistant(assistant) = &mut response.items[0] {
        assistant.tool_calls[0].arguments = json!({"value":{"x":"wrong"}}).to_string().into();
    }
    assert!(structured::finalize(&schema, &response).is_err());
}

#[tokio::test]
async fn provider_bounds_include_repairs_and_governance_counts_actual_http_attempts() {
    use nofy_agent_runtime::{governance::*, *};
    let server = server(ApiBackend::ChatCompletions, Mode::Repair, None).await;
    let native = model(&server, ApiBackend::ChatCompletions)
        .with_request_limits(ProviderRequestLimits {
            max_input_tokens: 100,
            max_output_tokens: 32,
        })
        .unwrap();
    let request_settings = json!({"json_schema":answer_schema(),"structured_output_retries":2});
    let bound = native
        .request_bound(&request(request_settings.clone()), &context())
        .unwrap();
    assert_eq!(
        (
            bound.max_calls,
            bound.max_input_tokens,
            bound.max_output_tokens
        ),
        (3, Some(300), Some(96))
    );
    let ledger = Arc::new(InMemoryBudgetStore::default());
    let profile = Arc::new(
        GovernanceProfile::new(
            Arc::new(
                InstalledBudget::install(
                    ledger.clone(),
                    BudgetLimits {
                        max_model_calls: Some(3),
                        max_total_tokens: Some(400),
                        ..Default::default()
                    },
                    "provider-host-1",
                    1,
                )
                .unwrap(),
            ),
            BudgetLimits::default(),
            ModelRetryPolicy::default(),
        )
        .unwrap(),
    );
    let scope = BudgetScope {
        root_run_id: "run".into(),
        identity: profile.identity().into(),
    };
    let mut components = Components::default();
    components.models.insert("m".into(), Arc::new(native));
    components
        .prompts
        .insert("p".into(), Arc::new(StaticPrompt("test".into())));
    let agent = AgentBuilder::new("provider-budget")
        .model("m")
        .prompt("p")
        .settings(Settings {
            max_steps: 4,
            model: request_settings,
            ..Default::default()
        })
        .compile(&components)
        .unwrap()
        .with_governance(profile);
    assert!(matches!(
        agent
            .invoke(RunInput::new("hello"), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(server.state.calls.load(Ordering::SeqCst), 2);
    let summary = ledger.inspect(&scope).await.unwrap().unwrap();
    assert_eq!(summary.used.model_calls, 2);
    assert_eq!(summary.used.input_tokens, 20);
    assert_eq!(summary.reserved, BudgetCost::default());
    for request in server.state.requests.lock().unwrap().iter() {
        assert_eq!(request["max_tokens"], 32);
    }
}
#[tokio::test]
async fn installed_bounds_reject_routing_and_output_override_before_http() {
    let server = server(ApiBackend::ChatCompletions, Mode::Text, None).await;
    let model = model(&server, ApiBackend::ChatCompletions)
        .with_request_limits(ProviderRequestLimits {
            max_input_tokens: 100,
            max_output_tokens: 32,
        })
        .unwrap();
    assert!(
        model
            .complete(request(json!({"max_output_tokens":33})), &context())
            .await
            .is_err()
    );
    let mut override_context = context();
    let mut config = model.config.clone();
    config.model = "another-model".into();
    override_context.capabilities.insert(config);
    assert!(
        model
            .complete(request(json!({})), &override_context)
            .await
            .is_err()
    );
    assert_eq!(server.state.calls.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn scoped_model_selection_preserves_parent_and_only_reuses_same_connection_credentials() {
    let server = server(ApiBackend::ChatCompletions, Mode::Text, None).await;
    let mut installed = model(&server, ApiBackend::ChatCompletions).config;
    installed.model = "selected-model".into();
    let selected = SamplerModel::new(installed.clone())
        .with_request_limits(ProviderRequestLimits {
            max_input_tokens: 100,
            max_output_tokens: 32,
        })
        .unwrap();
    let mut parent = context();
    let mut inherited = installed.clone();
    inherited.model = "parent-model".into();
    inherited.api_key = Some("rotated-same-origin".into());
    parent.capabilities.insert(inherited.clone());
    let mut child = parent.clone();
    selected.bind_scope(&mut child).unwrap();
    assert_eq!(
        parent.capabilities.get::<SamplerConfig>().unwrap().model,
        "parent-model"
    );
    assert_eq!(
        child.capabilities.get::<SamplerConfig>().unwrap().model,
        "selected-model"
    );
    assert_eq!(
        child
            .capabilities
            .get::<SamplerConfig>()
            .unwrap()
            .api_key
            .as_deref(),
        Some("rotated-same-origin")
    );
    selected.complete(request(json!({})), &child).await.unwrap();
    assert_eq!(
        server.state.requests.lock().unwrap()[0]["model"],
        "selected-model"
    );
    inherited.base_url = "http://127.0.0.1:1/other-origin".into();
    inherited.api_key = Some("must-not-cross-origin".into());
    parent.capabilities.insert(inherited);
    let mut child = parent.clone();
    selected.bind_scope(&mut child).unwrap();
    assert!(child.capabilities.get::<SamplerConfig>().is_none());
    selected.complete(request(json!({})), &child).await.unwrap();
    assert_eq!(server.state.calls.load(Ordering::SeqCst), 2);
    assert_eq!(
        parent
            .capabilities
            .get::<SamplerConfig>()
            .unwrap()
            .api_key
            .as_deref(),
        Some("must-not-cross-origin")
    );
}

struct Credentials {
    token: Mutex<Option<String>>,
    snapshots: AtomicUsize,
    refreshes: AtomicUsize,
    changed: bool,
    started: Notify,
    gate: Option<Arc<Notify>>,
}
impl Credentials {
    fn new(changed: bool) -> Arc<Self> {
        Arc::new(Self {
            token: Mutex::new(Some("stale-token".into())),
            snapshots: AtomicUsize::new(0),
            refreshes: AtomicUsize::new(0),
            changed,
            started: Notify::new(),
            gate: None,
        })
    }
}
impl nofy_auth::HttpAuth for Credentials {
    fn apply(&self, builder: reqwest::RequestBuilder, _: &str) -> reqwest::RequestBuilder {
        builder
    }
}
#[async_trait::async_trait]
impl nofy_auth::AuthCredentialProvider for Credentials {
    fn snapshot(&self) -> nofy_auth::CredentialSnapshot {
        self.snapshots.fetch_add(1, Ordering::SeqCst);
        nofy_auth::CredentialSnapshot {
            token: self.token.lock().unwrap().clone(),
            ..Default::default()
        }
    }
    async fn refresh_after_unauthorized(&self) -> bool {
        self.refreshes.fetch_add(1, Ordering::SeqCst);
        self.started.notify_one();
        if let Some(gate) = &self.gate {
            gate.notified().await;
        }
        if self.changed {
            *self.token.lock().unwrap() = Some("fresh-token".into());
        }
        self.changed
    }
}
fn auth(server: &Server, credentials: Arc<Credentials>) -> Arc<SamplerAuthRecovery> {
    Arc::new(
        SamplerAuthRecovery::new(
            credentials,
            &server.url,
            AuthRecoveryPolicy::Provider,
            "resource-1",
            5000,
        )
        .unwrap(),
    )
}
#[tokio::test]
async fn explicit_model_retry_after_failed_credential_refresh_reloads_provider_without_resetting_budget()
 {
    use nofy_agent_runtime::{governance::*, *};
    let server = server(ApiBackend::ChatCompletions, Mode::AuthByKey, None).await;
    let credentials = Credentials::new(false);
    let sampler = model(&server, ApiBackend::ChatCompletions)
        .with_request_limits(ProviderRequestLimits {
            max_input_tokens: 100,
            max_output_tokens: 32,
        })
        .unwrap()
        .with_auth_recovery(auth(&server, credentials.clone()))
        .unwrap();
    let ledger = Arc::new(InMemoryBudgetStore::default());
    let profile = Arc::new(
        GovernanceProfile::new(
            Arc::new(
                InstalledBudget::install(
                    ledger.clone(),
                    BudgetLimits {
                        max_model_calls: Some(4),
                        ..Default::default()
                    },
                    "explicit-auth@1",
                    1,
                )
                .unwrap(),
            ),
            BudgetLimits::default(),
            ModelRetryPolicy::default(),
        )
        .unwrap(),
    );
    let scope = BudgetScope {
        root_run_id: "run".into(),
        identity: profile.identity().into(),
    };
    let mut components = Components::default();
    components.models.insert("model".into(), Arc::new(sampler));
    components
        .prompts
        .insert("prompt".into(), Arc::new(StaticPrompt("test".into())));
    let agent = AgentBuilder::new("auth-recovery")
        .model("model")
        .prompt("prompt")
        .compile(&components)
        .unwrap()
        .with_governance(profile)
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    let context = || RunContext::new("thread", "run");
    assert!(matches!(
        agent.invoke(RunInput::new("query"), context()).await,
        Err(Error::ModelFailure(_))
    ));
    let command = ModelRetryCommand {
        command_id: "retry-click".into(),
        ticket: agent
            .model_retry_ticket("thread", "run")
            .await
            .unwrap()
            .unwrap(),
    };
    assert_eq!(server.state.calls.load(Ordering::SeqCst), 1);
    assert_eq!(credentials.refreshes.load(Ordering::SeqCst), 1);
    *credentials.token.lock().unwrap() = Some("fresh-token".into());
    // A fresh credential does not authorize replay by itself.
    assert!(matches!(
        agent.invoke(RunInput::resume(), context()).await,
        Err(Error::ModelFailure(_))
    ));
    assert_eq!(server.state.calls.load(Ordering::SeqCst), 1);
    assert!(
        matches!(agent.invoke(RunInput::retry_model(command.clone()), context()).await.unwrap(), RunOutcome::Completed { output, .. } if output == "hello world")
    );
    assert!(matches!(
        agent
            .invoke(RunInput::retry_model(command), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(server.state.calls.load(Ordering::SeqCst), 2);
    assert_eq!(credentials.refreshes.load(Ordering::SeqCst), 1);
    let used = ledger.inspect(&scope).await.unwrap().unwrap();
    // Failed operation keeps its conservative two-call bound; success settles
    // its actual one HTTP request in the same root ledger.
    assert_eq!(used.used.model_calls, 3);
    assert_eq!(used.reserved, BudgetCost::default());
}
#[tokio::test]
async fn auth_401_recovery_keeps_all_three_backend_protocols_and_counts_bounded_failed_usage() {
    for backend in [
        ApiBackend::ChatCompletions,
        ApiBackend::Responses,
        ApiBackend::Messages,
    ] {
        let server = server(backend.clone(), Mode::Auth(401, false), None).await;
        let credentials = Credentials::new(true);
        let model = model(&server, backend)
            .with_request_limits(ProviderRequestLimits {
                max_input_tokens: 100,
                max_output_tokens: 32,
            })
            .unwrap()
            .with_auth_recovery(auth(&server, credentials.clone()))
            .unwrap();
        assert_eq!(credentials.snapshots.load(Ordering::SeqCst), 0);
        let bound = model
            .request_bound(&request(json!({})), &context())
            .unwrap();
        assert_eq!(bound.max_calls, 2);
        assert_eq!(bound.max_input_tokens, Some(200));
        assert_eq!(credentials.snapshots.load(Ordering::SeqCst), 0);
        let response = model
            .complete(request(json!({})), &context())
            .await
            .unwrap();
        assert_eq!(response.output, "hello world");
        assert_eq!(model.calls_used(&response), Some(2));
        assert_eq!(
            response.info.provider["auth_failed_usage"]["accounting"],
            "reserved_upper_bound"
        );
        assert_eq!(credentials.refreshes.load(Ordering::SeqCst), 1);
        assert_eq!(server.state.calls.load(Ordering::SeqCst), 2);
        let headers = server.state.headers.lock().unwrap();
        assert!(
            headers[0]
                .values()
                .any(|v| v.to_str().is_ok_and(|v| v.contains("stale-token")))
        );
        assert!(
            headers[1]
                .values()
                .any(|v| v.to_str().is_ok_and(|v| v.contains("fresh-token")))
        );
        drop(headers);
        assert_eq!(model.config.api_key.as_deref(), Some("test-key"));
        // The next operation uses the current credential without another refresh.
        let response = model
            .complete(request(json!({})), &context())
            .await
            .unwrap();
        assert_eq!(model.calls_used(&response), Some(1));
        assert_eq!(credentials.refreshes.load(Ordering::SeqCst), 1);
    }
}
#[tokio::test]
async fn auth_forbidden_failed_refresh_and_repeated_401_have_no_extra_attempts() {
    for (status, always, changed, calls, refreshes) in [
        (403, true, true, 1, 0),
        (401, true, true, 2, 1),
        (401, true, false, 1, 1),
    ] {
        let server = server(
            ApiBackend::ChatCompletions,
            Mode::Auth(status, always),
            None,
        )
        .await;
        let credentials = Credentials::new(changed);
        let model = model(&server, ApiBackend::ChatCompletions)
            .with_auth_recovery(auth(&server, credentials.clone()))
            .unwrap();
        assert!(
            matches!(model.complete(request(json!({})),&context()).await,Err(Error::ModelFailure(failure)) if failure.status==Some(status))
        );
        assert_eq!(server.state.calls.load(Ordering::SeqCst), calls);
        assert_eq!(credentials.refreshes.load(Ordering::SeqCst), refreshes);
    }
}
#[tokio::test]
async fn session_byok_gates_and_connection_identity_prevent_credential_substitution() {
    use nofy_auth::ModelByok;
    let server = server(ApiBackend::ChatCompletions, Mode::Auth(401, true), None).await;
    let credentials = Credentials::new(true);
    for byok in [ModelByok::Byok, ModelByok::Unknown] {
        let recovery = Arc::new(
            SamplerAuthRecovery::new(
                credentials.clone(),
                &server.url,
                AuthRecoveryPolicy::Session {
                    is_session_based: true,
                    model_byok: byok,
                    endpoint_is_first_party: false,
                },
                "session-1",
                100,
            )
            .unwrap(),
        );
        let model = model(&server, ApiBackend::ChatCompletions)
            .with_auth_recovery(recovery)
            .unwrap();
        assert_eq!(
            model
                .request_bound(&request(json!({})), &context())
                .unwrap()
                .max_calls,
            1
        );
        assert!(
            model
                .complete(request(json!({})), &context())
                .await
                .is_err()
        );
    }
    assert_eq!(credentials.snapshots.load(Ordering::SeqCst), 0);
    assert_eq!(credentials.refreshes.load(Ordering::SeqCst), 0);
    for headers in server.state.headers.lock().unwrap().iter() {
        assert!(!headers.values().any(|v| {
            v.to_str()
                .is_ok_and(|v| v.contains("stale-token") || v.contains("fresh-token"))
        }));
    }
    assert!(
        SamplerAuthRecovery::new(
            credentials.clone(),
            &server.url,
            AuthRecoveryPolicy::Session {
                is_session_based: true,
                model_byok: ModelByok::NotByok,
                endpoint_is_first_party: false
            },
            "bad",
            100
        )
        .is_err()
    );
    let other = Arc::new(
        SamplerAuthRecovery::new(
            credentials.clone(),
            "https://other.example/v1",
            AuthRecoveryPolicy::Provider,
            "other-1",
            100,
        )
        .unwrap(),
    );
    assert!(
        model(&server, ApiBackend::ChatCompletions)
            .with_auth_recovery(other)
            .is_err()
    );
    assert!(
        SamplerAuthRecovery::new(
            credentials,
            "http://localhost/v1",
            AuthRecoveryPolicy::Session {
                is_session_based: true,
                model_byok: ModelByok::NotByok,
                endpoint_is_first_party: true
            },
            "unsafe",
            100
        )
        .is_err()
    );
}
#[tokio::test]
async fn auth_repair_uses_the_same_root_budget_and_keeps_the_factory_build_pure() {
    use super::factory::*;
    use nofy_agent_runtime::{governance::*, registry::*, *};
    use std::collections::{BTreeMap, BTreeSet};
    let server = server(ApiBackend::ChatCompletions, Mode::AuthRepair, None).await;
    let credentials = Credentials::new(true);
    let config = model(&server, ApiBackend::ChatCompletions).config;
    let connection = SamplerConnection::new(
        config,
        BTreeSet::from(["test-model".into()]),
        "connection-1",
    )
    .unwrap()
    .with_request_limits(BTreeMap::from([(
        "test-model".into(),
        ProviderRequestLimits {
            max_input_tokens: 100,
            max_output_tokens: 32,
        },
    )]))
    .unwrap()
    .with_auth_recovery(auth(&server, credentials.clone()))
    .unwrap();
    let factory = SamplerModelFactory::new(
        "factory-1",
        BTreeMap::from([("provider".into(), connection)]),
    )
    .unwrap();
    let ModuleInstance::Model(model) = factory
        .build(
            &json!({"connection":"provider","model":"test-model"}),
            &BTreeMap::new(),
        )
        .unwrap()
    else {
        panic!("model")
    };
    assert_eq!(credentials.snapshots.load(Ordering::SeqCst), 0);
    assert_eq!(server.state.calls.load(Ordering::SeqCst), 0);
    assert!(
        !serde_json::to_string(&factory.descriptor())
            .unwrap()
            .contains("stale-token")
    );
    let store = Arc::new(InMemoryBudgetStore::default());
    let installed = Arc::new(
        InstalledBudget::install(
            store.clone(),
            BudgetLimits {
                max_model_calls: Some(4),
                max_input_tokens: Some(400),
                max_output_tokens: Some(128),
                ..Default::default()
            },
            "host-1",
            1,
        )
        .unwrap(),
    );
    let profile = Arc::new(
        GovernanceProfile::new(
            installed,
            BudgetLimits::default(),
            ModelRetryPolicy::default(),
        )
        .unwrap(),
    );
    let scope = BudgetScope {
        root_run_id: "run".into(),
        identity: profile.identity().into(),
    };
    let mut components = Components::default();
    components.models.insert("m".into(), model);
    components
        .prompts
        .insert("p".into(), Arc::new(StaticPrompt("test".into())));
    let agent=AgentBuilder::new("auth-repair").model("m").prompt("p").settings(Settings {max_steps:4,model:json!({"json_schema":{"type":"object","required":["result"],"properties":{"result":{"type":"string"}},"additionalProperties":false}}),..Default::default()}).compile(&components).unwrap().with_governance(profile);
    let RunOutcome::Completed { state, .. } =
        agent.invoke(RunInput::new("go"), context()).await.unwrap()
    else {
        panic!("complete")
    };
    assert_eq!(server.state.calls.load(Ordering::SeqCst), 3);
    assert_eq!(credentials.refreshes.load(Ordering::SeqCst), 1);
    assert_eq!(state.completion_info.provider["model_http_attempts"], 3);
    assert_eq!(
        state.completion_info.provider["structured_output_repairs"],
        1
    );
    let summary = store.inspect(&scope).await.unwrap().unwrap();
    assert_eq!(summary.used.model_calls, 3);
    assert_eq!(summary.used.input_tokens, 120);
    // The chat fixture reports 2 tokens for "not JSON" and 1 for the
    // repaired JSON; the failed auth request contributes its reserved 32.
    assert_eq!(summary.used.output_tokens, 35);
    assert_eq!(summary.reserved, BudgetCost::default());
}
#[tokio::test]
async fn credential_refresh_wait_is_cancelled_and_concurrent_rejections_share_the_new_key() {
    let server = server(ApiBackend::ChatCompletions, Mode::AuthByKey, None).await;
    let gate = Arc::new(Notify::new());
    let credentials = Arc::new(Credentials {
        token: Mutex::new(Some("stale-token".into())),
        snapshots: AtomicUsize::new(0),
        refreshes: AtomicUsize::new(0),
        changed: true,
        started: Notify::new(),
        gate: Some(gate.clone()),
    });
    let recovery = auth(&server, credentials.clone());
    let model = Arc::new(
        model(&server, ApiBackend::ChatCompletions)
            .with_auth_recovery(recovery)
            .unwrap(),
    );
    let c = context();
    let cancel = c.cancel.clone();
    let pending = model.complete(request(json!({})), &c);
    tokio::pin!(pending);
    tokio::select! {
        result=&mut pending=>panic!("model ended before refresh started: {result:?}"),
        started=tokio::time::timeout(std::time::Duration::from_secs(10),credentials.started.notified())=>started.unwrap(),
    }
    cancel.cancel();
    let result = tokio::time::timeout(std::time::Duration::from_secs(10), &mut pending)
        .await
        .unwrap();
    assert!(matches!(result, Err(Error::Cancelled)));
    assert_eq!(server.state.calls.load(Ordering::SeqCst), 1);
    // A cancelled waiter did not publish credentials. Two new operations both
    // see the stale token; the resource serializes and reuses one refresh.
    let c1 = RunContext::new("one", "one");
    let c2 = RunContext::new("two", "two");
    let (one, two, ()) = tokio::join!(
        model.complete(request(json!({})), &c1),
        model.complete(request(json!({})), &c2),
        async {
            tokio::time::timeout(std::time::Duration::from_secs(2), async {
                while server.state.calls.load(Ordering::SeqCst) < 3 {
                    tokio::task::yield_now().await;
                }
            })
            .await
            .unwrap();
            gate.notify_one();
        }
    );
    assert_eq!(one.unwrap().output, "hello world");
    assert_eq!(two.unwrap().output, "hello world");
    assert_eq!(credentials.refreshes.load(Ordering::SeqCst), 2);
    assert_eq!(server.state.calls.load(Ordering::SeqCst), 5);
}

#[tokio::test]
async fn configured_auth_connection_never_follows_redirects_with_credentials() {
    let target = server(ApiBackend::ChatCompletions, Mode::Text, None).await;
    let source = server(
        ApiBackend::ChatCompletions,
        Mode::Redirect(format!("{}/chat/completions", target.url)),
        None,
    )
    .await;
    let credentials = Credentials::new(true);
    let mut config = model(&source, ApiBackend::ChatCompletions).config;
    config.auth_scheme = crate::AuthScheme::XApiKey;
    let model = SamplerModel::new(config)
        .with_auth_recovery(auth(&source, credentials))
        .unwrap();
    let result = model.complete(request(json!({})), &context()).await;
    assert_eq!(
        target.state.calls.load(Ordering::SeqCst),
        0,
        "credential-scoped request reached a redirect target"
    );
    assert!(matches!(result,Err(Error::ModelFailure(failure)) if failure.status==Some(307)));
}

#[tokio::test]
async fn auth_retry_capacity_is_reserved_before_reading_credentials_or_sending_http() {
    use nofy_agent_runtime::{governance::*, *};
    let server = server(ApiBackend::ChatCompletions, Mode::Auth(401, false), None).await;
    let credentials = Credentials::new(true);
    let model = model(&server, ApiBackend::ChatCompletions)
        .with_request_limits(ProviderRequestLimits {
            max_input_tokens: 100,
            max_output_tokens: 32,
        })
        .unwrap()
        .with_auth_recovery(auth(&server, credentials.clone()))
        .unwrap();
    let profile = Arc::new(
        GovernanceProfile::new(
            Arc::new(
                InstalledBudget::install(
                    Arc::new(InMemoryBudgetStore::default()),
                    BudgetLimits {
                        max_model_calls: Some(1),
                        ..Default::default()
                    },
                    "host-1",
                    1,
                )
                .unwrap(),
            ),
            BudgetLimits::default(),
            ModelRetryPolicy::default(),
        )
        .unwrap(),
    );
    let mut components = Components::default();
    components.models.insert("m".into(), Arc::new(model));
    components
        .prompts
        .insert("p".into(), Arc::new(StaticPrompt("p".into())));
    let agent = AgentBuilder::new("auth-budget")
        .model("m")
        .prompt("p")
        .compile(&components)
        .unwrap()
        .with_governance(profile);
    assert!(matches!(
        agent.invoke(RunInput::new("go"), context()).await.unwrap(),
        RunOutcome::BudgetExceeded { .. }
    ));
    assert_eq!(server.state.calls.load(Ordering::SeqCst), 0);
    assert_eq!(credentials.snapshots.load(Ordering::SeqCst), 0);
    assert_eq!(credentials.refreshes.load(Ordering::SeqCst), 0);
}
#[tokio::test]
async fn local_auth_configuration_errors_are_not_treated_as_an_http_401() {
    let server = server(ApiBackend::ChatCompletions, Mode::Text, None).await;
    let credentials = Credentials::new(true);
    *credentials.token.lock().unwrap() = Some("invalid\nheader".into());
    let model = model(&server, ApiBackend::ChatCompletions)
        .with_auth_recovery(auth(&server, credentials.clone()))
        .unwrap();
    assert!(
        matches!(model.complete(request(json!({})),&context()).await,Err(Error::ModelFailure(failure)) if failure.category=="auth"&&failure.status.is_none())
    );
    assert_eq!(server.state.calls.load(Ordering::SeqCst), 0);
    assert_eq!(credentials.refreshes.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn credential_recovery_has_its_own_bounded_timeout() {
    let server = server(ApiBackend::ChatCompletions, Mode::Auth(401, true), None).await;
    let credentials = Arc::new(Credentials {
        token: Mutex::new(Some("stale-token".into())),
        snapshots: AtomicUsize::new(0),
        refreshes: AtomicUsize::new(0),
        changed: true,
        started: Notify::new(),
        gate: Some(Arc::new(Notify::new())),
    });
    let recovery = Arc::new(
        SamplerAuthRecovery::new(
            credentials.clone(),
            &server.url,
            AuthRecoveryPolicy::Provider,
            "slow-1",
            30,
        )
        .unwrap(),
    );
    let model = model(&server, ApiBackend::ChatCompletions)
        .with_auth_recovery(recovery)
        .unwrap();
    let result = tokio::time::timeout(
        std::time::Duration::from_secs(10),
        model.complete(request(json!({})), &context()),
    )
    .await
    .unwrap();
    assert!(matches!(result,Err(Error::Model(message)) if message.contains("recovery timed out")));
    assert_eq!(server.state.calls.load(Ordering::SeqCst), 1);
    assert_eq!(credentials.refreshes.load(Ordering::SeqCst), 1);
}
