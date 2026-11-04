use axum::{
    Json, Router,
    extract::{Path, State},
    response::{
        IntoResponse, Response,
        sse::{Event, Sse},
    },
    routing::post,
};
use futures::StreamExt;
use nofy_agent_models::declarative::{ConnectionFactory, ProgrammedModelFactory, ProtocolFactory};
use nofy_agent_runtime::{
    Error, Message, Model, ModelChunk, ModelDelta, ModelRequest, RunContext,
    artifact::ArtifactFactory,
    credentials::CredentialProvider,
    registry::{ModuleFactory, ModuleInstance},
};
use serde_json::{Value, json};
use std::{
    collections::{BTreeMap, VecDeque},
    convert::Infallible,
    sync::{Arc, Mutex},
};

enum Wire {
    Json(Value),
    Sse(Vec<(String, String)>),
    Error(u16, Value),
}
#[derive(Default)]
struct Capture {
    plans: Mutex<VecDeque<Wire>>,
    requests: Mutex<Vec<(String, Value)>>,
}
async fn provider(
    Path(path): Path<String>,
    State(capture): State<Arc<Capture>>,
    headers: axum::http::HeaderMap,
    Json(body): Json<Value>,
) -> Response {
    if path == "messages" {
        assert_eq!(headers["anthropic-version"], "2023-06-01");
        assert_eq!(headers["x-api-key"], "private-profile-token");
    } else {
        assert_eq!(headers["authorization"], "Bearer private-profile-token");
    }
    assert!(!body.to_string().contains("private-profile-token"));
    capture.requests.lock().unwrap().push((path, body));
    let wire = capture
        .plans
        .lock()
        .unwrap()
        .pop_front()
        .expect("unexpected extra physical model request");
    match wire {
        Wire::Json(value) => Json(value).into_response(),
        Wire::Error(status, value) => (
            axum::http::StatusCode::from_u16(status).unwrap(),
            Json(value),
        )
            .into_response(),
        Wire::Sse(frames) => {
            Sse::new(futures::stream::iter(frames.into_iter().map(
                |(event, data)| Ok::<_, Infallible>(Event::default().event(event).data(data)),
            )))
            .into_response()
        }
    }
}
struct Server {
    url: String,
    capture: Arc<Capture>,
    task: tokio::task::JoinHandle<()>,
}
impl Drop for Server {
    fn drop(&mut self) {
        self.task.abort();
    }
}
async fn server(plans: Vec<Wire>) -> Server {
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let url = format!("http://{}/v1/", listener.local_addr().unwrap());
    let capture = Arc::new(Capture {
        plans: Mutex::new(plans.into()),
        ..Default::default()
    });
    let router = Router::new()
        .route("/v1/{*path}", post(provider))
        .with_state(capture.clone());
    let task = tokio::spawn(async move { axum::serve(listener, router).await.unwrap() });
    Server { url, capture, task }
}
struct Credentials;
#[async_trait::async_trait]
impl CredentialProvider for Credentials {
    fn identity(&self) -> &str {
        "profile-authority"
    }
    async fn resolve(&self, reference: &str) -> Result<Option<String>, Error> {
        assert_eq!(reference, "MODEL_KEY");
        Ok(Some("private-profile-token".into()))
    }
}
fn manifest() -> Value {
    serde_json::from_str(include_str!(
        "../../../../presets/coding/modules/models/manifest.json"
    ))
    .unwrap()
}
fn declarations(profile: &str) -> (Value, Value) {
    let bundle = json!({"schema_version":1,"files":{
        "common.rhai":include_str!("../../../../presets/coding/modules/models/common.rhai"),
        "chat_completions.rhai":include_str!("../../../../presets/coding/modules/models/chat_completions.rhai"),
        "responses.rhai":include_str!("../../../../presets/coding/modules/models/responses.rhai"),
        "messages.rhai":include_str!("../../../../presets/coding/modules/models/messages.rhai"),
        "parameters.schema.json":include_str!("../../../../presets/coding/modules/models/parameters.schema.json"),
        "manifest.json":include_str!("../../../../presets/coding/modules/models/manifest.json")}});
    (
        json!({"bundle":bundle}),
        manifest()["profiles"][profile]["protocol"].clone(),
    )
}
fn model(url: &str, profile: &str) -> Arc<dyn Model> {
    let (artifact, config) = declarations(profile);
    let artifact = ArtifactFactory.build(&artifact, &BTreeMap::new()).unwrap();
    let protocol = ProtocolFactory::trusted()
        .build(&config, &BTreeMap::from([("artifact".into(), artifact)]))
        .unwrap();
    let mut config = manifest()["profiles"][profile]["connection"].clone();
    config["base_url"] = json!(url);
    config["allow_insecure_http"] = json!(true);
    config["models"] = json!(["model"]);
    let connection = ConnectionFactory::new(Arc::new(Credentials))
        .unwrap()
        .build(&config, &BTreeMap::new())
        .unwrap();
    match ProgrammedModelFactory::default()
        .build(
            &json!({"model":"model"}),
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
fn request(settings: Value) -> ModelRequest {
    ModelRequest {
        messages: vec![Message::User {
            content: "question".into(),
        }],
        tools: vec![],
        settings,
    }
}
fn chat(text: &str) -> Value {
    json!({"id":"chat_1","model":"model","choices":[{"index":0,"message":{"role":"assistant","content":text},"finish_reason":"stop"}],"usage":{"prompt_tokens":3,"completion_tokens":2}})
}
fn response(text: &str) -> Value {
    json!({"id":"resp_1","status":"completed","output":[{"type":"message","id":"msg_1","role":"assistant","content":[{"type":"output_text","text":text,"annotations":[]}]}],"usage":{"input_tokens":3,"output_tokens":2}})
}
fn message(text: &str) -> Value {
    json!({"id":"msg_1","type":"message","role":"assistant","model":"model","content":[{"type":"text","text":text}],"stop_reason":"end_turn","usage":{"input_tokens":3,"output_tokens":2}})
}

#[tokio::test]
async fn all_profiles_compile_from_artifacts_and_accept_json_responses() {
    for (profile, value) in [
        ("chat_completions", chat("ok")),
        ("responses", response("ok")),
        ("messages", message("ok")),
    ] {
        let server = server(vec![Wire::Json(value)]).await;
        let model = model(&server.url, profile);
        let response = model
            .complete(request(json!({"stream":false})), &RunContext::default())
            .await
            .unwrap();
        assert_eq!(response.output, "ok");
        assert_eq!((response.input_tokens, response.output_tokens), (3, 2));
        model
            .validate_live_history(&response.messages)
            .await
            .unwrap();
    }
}

#[tokio::test]
async fn chat_profile_json_native_history_and_ordinary_budget_are_real_artifact_driven() {
    let server = server(vec![Wire::Json(chat("answer")), Wire::Json(chat("next"))]).await;
    let model = model(&server.url, "chat_completions");
    let request = request(json!({"stream":false,"max_output_tokens":32}));
    let bound = model
        .request_bound(&request, &RunContext::default())
        .await
        .unwrap();
    assert_eq!((bound.max_calls, bound.max_output_tokens), (1, Some(32)));
    let response = model
        .complete(request.clone(), &RunContext::default())
        .await
        .unwrap();
    assert_eq!(response.output, "answer");
    assert_eq!((response.input_tokens, response.output_tokens), (3, 2));
    model
        .validate_live_history(&response.messages)
        .await
        .unwrap();
    let mut next = request;
    next.messages.extend(response.messages.clone());
    model.complete(next, &RunContext::default()).await.unwrap();
    let requests = server.capture.requests.lock().unwrap();
    assert_eq!(requests[0].0, "chat/completions");
    assert_eq!(requests[0].1["max_completion_tokens"], 32);
    assert_eq!(
        requests[1].1["messages"][1],
        json!({"role":"assistant","content":"answer"})
    );
    assert_eq!(model.calls_used(&response), Some(1));
}

fn frames(profile: &str, body: Value) -> Wire {
    let mut frames = Vec::new();
    let mut push = |kind: &str, value: Value| frames.push((kind.to_owned(), value.to_string()));
    match profile {
        "chat_completions" => {
            let mut delta = body["choices"][0]["message"].clone();
            let calls = delta
                .as_object_mut()
                .unwrap()
                .remove("tool_calls")
                .unwrap_or(json!([]));
            push(
                "message",
                json!({"choices":[{"index":0,"delta":delta,"finish_reason":null}]}),
            );
            for (index, invocation) in calls.as_array().unwrap().iter().enumerate() {
                let arguments = invocation["function"]["arguments"].as_str().unwrap();
                push(
                    "message",
                    json!({"choices":[{"index":0,"delta":{"tool_calls":[{"index":index,"id":invocation["id"],"type":"function","function":{"name":invocation["function"]["name"],"arguments":"{"}}]}}]}),
                );
                push(
                    "message",
                    json!({"choices":[{"index":0,"delta":{"tool_calls":[{"index":index,"function":{"arguments":arguments.strip_prefix('{').unwrap()}}]}}]}),
                );
            }
            push(
                "message",
                json!({"choices":[{"index":0,"delta":{},"finish_reason":body["choices"][0]["finish_reason"]}]}),
            );
            push("message", json!({"choices":[],"usage":body["usage"]}));
            frames.push(("message".into(), "[DONE]".into()));
        }
        "responses" => {
            push(
                "response.created",
                json!({"type":"response.created","response":{"id":"resp_1","output":[]}}),
            );
            for (index, item) in body["output"].as_array().unwrap().iter().enumerate() {
                let mut start = item.clone();
                if item["type"] == "function_call" {
                    start["arguments"] = json!("");
                }
                push(
                    "response.output_item.added",
                    json!({"type":"response.output_item.added","output_index":index,"item":start}),
                );
                if item["type"] == "message" {
                    for part in item["content"].as_array().unwrap() {
                        if part["type"] == "output_text" {
                            push(
                                "response.output_text.delta",
                                json!({"type":"response.output_text.delta","delta":part["text"]}),
                            );
                        }
                    }
                } else if item["type"] == "reasoning" {
                    push(
                        "response.reasoning_summary_text.delta",
                        json!({"type":"response.reasoning_summary_text.delta","delta":"consider"}),
                    );
                } else if item["type"] == "function_call" {
                    let arguments = item["arguments"].as_str().unwrap();
                    for fragment in ["{", arguments.strip_prefix('{').unwrap()] {
                        push(
                            "response.function_call_arguments.delta",
                            json!({"type":"response.function_call_arguments.delta","output_index":index,"delta":fragment}),
                        );
                    }
                }
                push(
                    "response.output_item.done",
                    json!({"type":"response.output_item.done","output_index":index,"item":item}),
                );
            }
            push(
                "response.completed",
                json!({"type":"response.completed","response":body}),
            );
        }
        "messages" => {
            let mut start = body.clone();
            start["content"] = json!([]);
            start["stop_reason"] = Value::Null;
            push(
                "message_start",
                json!({"type":"message_start","message":start}),
            );
            for (index, block) in body["content"].as_array().unwrap().iter().enumerate() {
                let mut start = block.clone();
                match block["type"].as_str().unwrap() {
                    "text" => start["text"] = json!(""),
                    "thinking" => {
                        start["thinking"] = json!("");
                        start["signature"] = json!("");
                    }
                    "tool_use" => start["input"] = json!({}),
                    _ => {}
                }
                push(
                    "content_block_start",
                    json!({"type":"content_block_start","index":index,"content_block":start}),
                );
                match block["type"].as_str().unwrap() {
                    "text" => push(
                        "content_block_delta",
                        json!({"type":"content_block_delta","index":index,"delta":{"type":"text_delta","text":block["text"]}}),
                    ),
                    "thinking" => {
                        push(
                            "content_block_delta",
                            json!({"type":"content_block_delta","index":index,"delta":{"type":"thinking_delta","thinking":block["thinking"]}}),
                        );
                        push(
                            "content_block_delta",
                            json!({"type":"content_block_delta","index":index,"delta":{"type":"signature_delta","signature":block["signature"]}}),
                        );
                    }
                    "tool_use" => {
                        let arguments = block["input"].to_string();
                        for fragment in ["{", arguments.strip_prefix('{').unwrap()] {
                            push(
                                "content_block_delta",
                                json!({"type":"content_block_delta","index":index,"delta":{"type":"input_json_delta","partial_json":fragment}}),
                            );
                        }
                    }
                    _ => {}
                }
                push(
                    "content_block_stop",
                    json!({"type":"content_block_stop","index":index}),
                );
            }
            push(
                "message_delta",
                json!({"type":"message_delta","delta":{"stop_reason":body["stop_reason"]},"usage":body["usage"]}),
            );
            push("message_stop", json!({"type":"message_stop"}));
        }
        _ => panic!("unknown profile"),
    }
    Wire::Sse(frames)
}
fn tool_answer(profile: &str) -> Value {
    match profile {
        "chat_completions" => {
            let mut value = chat("answer");
            value["choices"][0]["message"]["reasoning_content"] = json!("consider");
            value["choices"][0]["message"]["tool_calls"] = json!([{"id":"call_1","type":"function","function":{"name":"inspect","arguments":"{\"path\":\"src\"}"}}]);
            value
        }
        "responses" => {
            let mut value = response("answer");
            value["output"].as_array_mut().unwrap().insert(0,json!({"type":"reasoning","id":"reason_1","summary":[{"type":"summary_text","text":"consider"}],"encrypted_content":"sealed"}));
            value["output"].as_array_mut().unwrap().insert(1,json!({"type":"function_call","id":"fc_1","call_id":"call_1","name":"inspect","arguments":"{\"path\":\"src\"}"}));
            value
        }
        "messages" => {
            let mut value = message("answer");
            value["stop_reason"] = json!("tool_use");
            value["content"].as_array_mut().unwrap().insert(
                0,
                json!({"type":"thinking","thinking":"consider","signature":"sealed"}),
            );
            value["content"].as_array_mut().unwrap().insert(
                1,
                json!({"type":"tool_use","id":"call_1","name":"inspect","input":{"path":"src"}}),
            );
            value
        }
        _ => panic!("unknown profile"),
    }
}
fn ordinary(profile: &str, text: &str) -> Value {
    match profile {
        "chat_completions" => chat(text),
        "responses" => response(text),
        "messages" => message(text),
        _ => panic!("profile"),
    }
}

#[tokio::test]
async fn every_protocol_preserves_explicit_tool_blocks_and_business_fields() {
    let payload = json!({"output":{"ticket":"private-business-value"},
        "prompt_text":"ordinary banner", "effective_tool_name":null});
    let raw_value = json!({"value":{"answer":42},"ticket":"preserved-sibling"});
    let structured = json!({"ticket":"structured-id"});
    let cases = [
        (
            json!({"tool_id":"compute","value":payload,
            "model_output":[{"type":"text","text":payload.to_string()}]}),
            payload.to_string(),
            false,
        ),
        (payload.clone(), payload.to_string(), true),
        (raw_value.clone(), raw_value.to_string(), true),
        (
            json!({"content":[{"type":"text","text":"details"}],
            "structuredContent":structured}),
            format!("{structured}\ndetails"),
            false,
        ),
    ];
    for profile in ["chat_completions", "responses", "messages"] {
        for (content, expected, compare_json) in &cases {
            let server = server(vec![Wire::Json(ordinary(profile, "ok"))]).await;
            let model = model(&server.url, profile);
            let mut input = request(json!({"stream":false,"max_output_tokens":16}));
            input.messages.push(Message::Assistant {
                content: String::new(),
                tool_calls: vec![nofy_agent_runtime::ToolCall {
                    id: "call_1".into(),
                    name: "compute".into(),
                    arguments: json!({}),
                }],
            });
            input.messages.push(Message::Tool {
                call_id: "call_1".into(),
                content: content.clone(),
                is_error: false,
            });
            model.complete(input, &RunContext::default()).await.unwrap();
            let requests = server.capture.requests.lock().unwrap();
            let body = &requests[0].1;
            let actual = match profile {
                "chat_completions" => body["messages"]
                    .as_array()
                    .unwrap()
                    .iter()
                    .find(|m| m["role"] == "tool")
                    .unwrap()["content"]
                    .as_str()
                    .unwrap(),
                "responses" => body["input"]
                    .as_array()
                    .unwrap()
                    .iter()
                    .find(|m| m["type"] == "function_call_output")
                    .unwrap()["output"]
                    .as_str()
                    .unwrap(),
                _ => body["messages"]
                    .as_array()
                    .unwrap()
                    .iter()
                    .flat_map(|m| m["content"].as_array().unwrap())
                    .find(|b| b["type"] == "tool_result")
                    .unwrap()["content"][0]["text"]
                    .as_str()
                    .unwrap(),
            };
            if *compare_json {
                // Business JSON object order is not semantic; all fields and
                // values must survive even with serde_json/preserve_order.
                assert_eq!(
                    serde_json::from_str::<Value>(actual).unwrap(),
                    serde_json::from_str::<Value>(expected).unwrap(),
                    "{profile}: {content}"
                );
            } else {
                // Explicit text blocks and MCP text remain byte-exact.
                assert_eq!(actual, expected, "{profile}: {content}");
            }
        }
    }
}

#[tokio::test]
async fn all_three_stream_reasoning_tools_and_replay_signed_native_items_without_reencoding_them_as_text()
 {
    for profile in ["chat_completions", "responses", "messages"] {
        let body = tool_answer(profile);
        let server = server(vec![
            frames(profile, body),
            Wire::Json(ordinary(profile, "next")),
        ])
        .await;
        let model = model(&server.url, profile);
        let mut original = request(json!({"reasoning_effort":"high"}));
        original.tools=serde_json::from_value(json!([{"type":"function","function":{"name":"inspect","parameters":{"type":"object","properties":{"path":{"type":"string"}}}}}])).unwrap();
        let mut stream = model
            .stream(original.clone(), &RunContext::default())
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
        assert_eq!(completed.len(), 1, "{profile}");
        let result = completed.remove(0);
        assert_eq!(result.output, "answer", "{profile}");
        assert!(
            deltas
                .iter()
                .any(|d| matches!(d,ModelDelta::Reasoning {text} if text=="consider")),
            "{profile}"
        );
        assert!(
            deltas
                .iter()
                .filter(|d| matches!(d, ModelDelta::ToolCall { .. }))
                .count()
                >= 2,
            "{profile}"
        );
        assert_eq!(result.tool_calls[0].arguments, json!({"path":"src"}));
        assert_eq!((result.input_tokens, result.output_tokens), (3, 2));
        let mut next = original;
        next.settings["stream"] = json!(false);
        next.messages.extend(result.messages.clone());
        next.messages.push(Message::Tool {call_id:"call_1".into(),content:json!({"prompt_text":"found","content":[{"type":"image","mime_type":"image/png","data":"aGVsbG8="}]}),is_error:false});
        model.complete(next, &RunContext::default()).await.unwrap();
        let requests = server.capture.requests.lock().unwrap();
        let text = requests[1].1.to_string();
        assert!(text.contains("aGVsbG8="), "{profile}");
        if profile == "responses" {
            assert_eq!(requests[1].1["input"][1]["encrypted_content"], "sealed");
        }
        if profile == "messages" {
            assert_eq!(
                requests[1].1["messages"][1]["content"][0]["signature"],
                "sealed"
            );
        }
    }
}
#[tokio::test]
async fn structured_repair_reserves_only_requested_attempts_and_keeps_every_successful_round_in_history()
 {
    for profile in ["chat_completions", "responses", "messages"] {
        let server = server(vec![
            Wire::Json(ordinary(profile, "not JSON")),
            Wire::Json(ordinary(profile, "{\"ok\":true}")),
        ])
        .await;
        let model = model(&server.url, profile);
        let request = request(
            json!({"stream":false,"max_output_tokens":16,"json_schema":{"$defs":{"answer":{"type":"object","required":["ok"],"properties":{"ok":{"const":true}},"additionalProperties":false}},"$ref":"#/$defs/answer"},"structured_output_retries":1}),
        );
        let bound = model
            .request_bound(&request, &RunContext::default())
            .await
            .unwrap();
        assert_eq!(
            (bound.max_calls, bound.max_output_tokens),
            (2, Some(32)),
            "{profile}"
        );
        let result = model
            .complete(request, &RunContext::default())
            .await
            .unwrap();
        assert_eq!(
            result.info.structured_output,
            Some(json!({"ok":true})),
            "{profile}"
        );
        assert_eq!((result.input_tokens, result.output_tokens), (6, 4));
        assert_eq!(model.calls_used(&result), Some(2));
        assert!(result.messages.iter().any(
            |m| matches!(m,Message::User {content} if content.contains("Correct the final answer"))
        ));
        let requests = server.capture.requests.lock().unwrap();
        assert_eq!(requests.len(), 2);
        if profile == "chat_completions" {
            assert_eq!(requests[0].1["response_format"]["type"], "json_schema");
        }
        if profile == "responses" {
            assert_eq!(requests[0].1["text"]["format"]["type"], "json_schema");
            assert_eq!(requests[0].1["store"], false);
        }
        if profile == "messages" {
            assert!(
                requests[0].1["tools"]
                    .as_array()
                    .unwrap()
                    .iter()
                    .any(|t| t["name"] == "StructuredOutput")
            );
            assert!(requests[0].1["output_config"]["format"].is_null());
        }
    }
}

fn failure_code(error: Error) -> String {
    match error {
        Error::ModelFailure(failure) => failure.code.unwrap_or(failure.category),
        other => panic!("{other}"),
    }
}
#[tokio::test]
async fn all_profiles_map_mixed_user_images_and_reject_file_urls_before_network() {
    for profile in ["chat_completions", "responses", "messages"] {
        let server = server(vec![Wire::Json(ordinary(profile, "ok"))]).await;
        let model = model(&server.url, profile);
        let mut input = request(json!({"stream":false}));
        input.messages=serde_json::from_value(json!([{"role":"user_parts","content":[{"type":"text","text":"inspect image"},{"type":"image","url":"data:image/png;base64,aGVsbG8="},{"type":"image","url":"https://example.invalid/image.png"}]}])).unwrap();
        model
            .complete(input.clone(), &RunContext::default())
            .await
            .unwrap();
        let wire = server.capture.requests.lock().unwrap()[0].1.clone();
        match profile {
            "chat_completions" => assert_eq!(
                wire["messages"][0]["content"][1]["image_url"]["url"],
                "data:image/png;base64,aGVsbG8="
            ),
            "responses" => assert_eq!(
                wire["input"][0]["content"][1]["image_url"],
                "data:image/png;base64,aGVsbG8="
            ),
            "messages" => {
                assert_eq!(
                    wire["messages"][0]["content"][1]["source"]["media_type"],
                    "image/png"
                );
                assert_eq!(
                    wire["messages"][0]["content"][2]["source"]["url"],
                    "https://example.invalid/image.png"
                );
            }
            _ => unreachable!(),
        }
        input.messages = serde_json::from_value(
            json!([{"role":"user_parts","content":[{"type":"image","url":"file:///etc/passwd"}]}]),
        )
        .unwrap();
        assert_eq!(
            failure_code(
                model
                    .complete(input, &RunContext::default())
                    .await
                    .unwrap_err()
            ),
            "image_input"
        );
        assert_eq!(server.capture.requests.lock().unwrap().len(), 1);
    }
}
#[tokio::test]
async fn invalid_parameters_foreign_opaque_and_unavailable_tools_do_not_dispatch_requests() {
    for profile in ["chat_completions", "responses", "messages"] {
        let server = server(vec![]).await;
        let model = model(&server.url, profile);
        for (settings, code) in [
            (json!({"structured_output_retries":1}), "invalid_settings"),
            (
                json!({"json_schema":{"$ref":"https://example.invalid/schema"}}),
                "invalid_schema",
            ),
            (
                json!({"tool_choice":{"function":"not-registered"}}),
                "tool_choice",
            ),
            (json!({"tool_choice":"required"}), "tool_choice"),
        ] {
            assert_eq!(
                failure_code(
                    model
                        .request_bound(&request(settings), &RunContext::default())
                        .await
                        .unwrap_err()
                ),
                code,
                "{profile}"
            );
        }
        let mut input = request(json!({"stream":false}));
        input.messages.push(Message::Opaque {
            provider: "foreign/v1".into(),
            value: json!({"signed":"must-not-be-dropped"}),
        });
        assert!(model.validate_live_history(&input.messages).await.is_err());
        assert_eq!(
            failure_code(
                model
                    .complete(input, &RunContext::default())
                    .await
                    .unwrap_err()
            ),
            "opaque_history"
        );
        assert!(server.capture.requests.lock().unwrap().is_empty());
    }
}
#[tokio::test]
async fn repair_exhaustion_is_bounded_and_missing_usage_never_becomes_a_free_success() {
    for profile in ["chat_completions", "responses", "messages"] {
        let mut no_usage = ordinary(profile, "answer");
        no_usage.as_object_mut().unwrap().remove("usage");
        let server = server(vec![
            Wire::Json(ordinary(profile, "invalid")),
            Wire::Json(ordinary(profile, "invalid again")),
            Wire::Json(no_usage),
        ])
        .await;
        let model = model(&server.url, profile);
        let error = model
            .complete(
                request(json!({"stream":false,"json_schema":true,"structured_output_retries":1})),
                &RunContext::default(),
            )
            .await
            .unwrap_err();
        assert_eq!(
            failure_code(error),
            "structured_output_invalid",
            "{profile}"
        );
        assert_eq!(server.capture.requests.lock().unwrap().len(), 2);
        let error = model
            .complete(request(json!({"stream":false})), &RunContext::default())
            .await
            .unwrap_err();
        assert_eq!(failure_code(error), "usage_unavailable", "{profile}");
        assert_eq!(server.capture.requests.lock().unwrap().len(), 3);
    }
}
#[tokio::test]
async fn messages_invalid_finalizer_batch_never_reaches_dispatch_and_closes_all_native_tool_calls_for_repair()
 {
    let mut invalid = message("");
    invalid["content"] = json!([
        {"type":"tool_use","id":"business_1","name":"inspect","input":{"path":"src"}},
        {"type":"tool_use","id":"final_1","name":"StructuredOutput","input":{"value":{"ok":true}}}]);
    invalid["stop_reason"] = json!("tool_use");
    let mut valid = message("");
    valid["content"] = json!([{"type":"tool_use","id":"final_2","name":"StructuredOutput","input":{"value":{"ok":true}}}]);
    let server = server(vec![Wire::Json(invalid), Wire::Json(valid)]).await;
    let model = model(&server.url, "messages");
    let mut input = request(
        json!({"stream":false,"json_schema":{"type":"object","required":["ok"],"properties":{"ok":{"const":true}}},"structured_output_retries":1}),
    );
    input.tools = serde_json::from_value(
        json!([{"type":"function","function":{"name":"inspect","parameters":{"type":"object"}}}]),
    )
    .unwrap();
    let result = model.complete(input, &RunContext::default()).await.unwrap();
    assert!(result.tool_calls.is_empty());
    assert_eq!(result.info.structured_output, Some(json!({"ok":true})));
    let errors = result
        .messages
        .iter()
        .filter(|m| matches!(m, Message::Tool { is_error: true, .. }))
        .count();
    assert_eq!(errors, 2);
    assert!(
        result
            .messages
            .iter()
            .any(|m| matches!(m,Message::Tool {call_id,is_error:false,..} if call_id=="final_2"))
    );
    let requests = server.capture.requests.lock().unwrap();
    assert_eq!(requests.len(), 2);
    let results = &requests[1].1["messages"][2]["content"];
    assert_eq!(results[0]["type"], "tool_result");
    assert_eq!(results[0]["is_error"], true);
    assert_eq!(results[1]["type"], "tool_result");
    assert_eq!(results[1]["is_error"], true);
}
#[tokio::test]
async fn provider_errors_are_typed_without_body_leaks_or_automatic_auth_retries() {
    for profile in ["chat_completions", "responses", "messages"] {
        let server = server(vec![Wire::Error(
            401,
            json!({"error":{"type":"invalid_api_key","message":"secret-canary"}}),
        )])
        .await;
        let model = model(&server.url, profile);
        let error = model
            .complete(request(json!({})), &RunContext::default())
            .await
            .unwrap_err();
        assert!(!error.to_string().contains("secret-canary"));
        match error {
            Error::ModelFailure(failure) => {
                assert_eq!(failure.status, Some(401));
                assert_eq!(failure.category, "authentication");
                assert!(!failure.retryable);
                assert_eq!(failure.code.as_deref(), Some("invalid_api_key"));
            }
            other => panic!("{other}"),
        }
        assert_eq!(server.capture.requests.lock().unwrap().len(), 1);
    }
}

#[tokio::test]
async fn refusal_is_not_repaired_and_length_policy_is_explicit_for_all_profiles() {
    for profile in ["chat_completions", "responses", "messages"] {
        let mut refusal = ordinary(profile, "");
        let mut limited = ordinary(profile, "partial");
        match profile {
            "chat_completions" => {
                refusal["choices"][0]["message"]["refusal"] = json!("declined");
                refusal["choices"][0]["finish_reason"] = json!("content_filter");
                limited["choices"][0]["finish_reason"] = json!("length");
            }
            "responses" => {
                refusal["output"][0]["content"] = json!([{"type":"refusal","refusal":"declined"}]);
                limited["status"] = json!("incomplete");
                limited["incomplete_details"] = json!({"reason":"max_output_tokens"});
            }
            "messages" => {
                refusal["stop_reason"] = json!("refusal");
                limited["stop_reason"] = json!("max_tokens");
            }
            _ => unreachable!(),
        }
        let server = server(vec![
            Wire::Json(refusal),
            Wire::Json(limited.clone()),
            Wire::Json(limited),
        ])
        .await;
        let model = model(&server.url, profile);
        let result = model
            .complete(
                request(json!({"stream":false,"json_schema":true})),
                &RunContext::default(),
            )
            .await
            .unwrap();
        assert!(result.info.refusal.is_some(), "{profile}");
        assert_eq!(model.calls_used(&result), Some(1));
        let error = model
            .complete(request(json!({"stream":false})), &RunContext::default())
            .await
            .unwrap_err();
        assert_eq!(failure_code(error), "completion_length", "{profile}");
        let result = model
            .complete(
                request(json!({"stream":false,"length_policy":"complete_partial"})),
                &RunContext::default(),
            )
            .await
            .unwrap();
        assert_eq!(result.output, "partial");
        assert_eq!(result.info.stop_reason.as_deref(), Some("length"));
        assert_eq!(server.capture.requests.lock().unwrap().len(), 3);
    }
}
#[tokio::test]
async fn unsigned_tool_arguments_and_opaque_metadata_round_trip_through_every_protocol() {
    for profile in ["chat_completions", "responses", "messages"] {
        let mut body = tool_answer(profile);
        let arguments = json!({"id":u64::MAX,"signed":i64::MIN});
        match profile {
            "chat_completions" => {
                body["choices"][0]["message"]["tool_calls"][0]["function"]["arguments"] =
                    json!(arguments.to_string())
            }
            "responses" => body["output"][1]["arguments"] = json!(arguments.to_string()),
            "messages" => body["content"][1]["input"] = arguments.clone(),
            _ => unreachable!(),
        }
        let server = server(vec![
            frames(profile, body),
            Wire::Json(ordinary(profile, "next")),
        ])
        .await;
        let model = model(&server.url, profile);
        let result = model
            .complete(
                request(json!({"reasoning_effort":"high"})),
                &RunContext::default(),
            )
            .await
            .unwrap();
        assert_eq!(result.tool_calls[0].arguments, arguments, "{profile}");
        model.validate_live_history(&result.messages).await.unwrap();
        let mut next = request(json!({"stream":false,"reasoning_effort":"high"}));
        next.messages.extend(result.messages);
        next.messages.push(Message::Tool {
            call_id: "call_1".into(),
            content: json!({"id":u64::MAX}),
            is_error: false,
        });
        model.complete(next, &RunContext::default()).await.unwrap();
        assert!(
            server.capture.requests.lock().unwrap()[1]
                .1
                .to_string()
                .contains("18446744073709551615")
        );
    }
}
#[tokio::test]
async fn selected_tools_and_prompt_cache_metadata_are_mapped_without_product_headers() {
    for profile in ["chat_completions", "responses", "messages"] {
        let server = server(vec![Wire::Json(ordinary(profile, "ok"))]).await;
        let model = model(&server.url, profile);
        let mut input = request(
            json!({"stream":false,"tool_choice":{"function":"inspect"},"reasoning_effort":"high"}),
        );
        input.tools=serde_json::from_value(json!([{"type":"function","function":{"name":"inspect","parameters":{"type":"object"}}}])).unwrap();
        if profile == "responses" {
            input.settings["prompt_cache_key"] = json!("stable-key");
            input.settings["reasoning_summary"] = json!("concise");
        }
        model.complete(input, &RunContext::default()).await.unwrap();
        let body = &server.capture.requests.lock().unwrap()[0].1;
        match profile {
            "chat_completions" => assert_eq!(body["tool_choice"]["function"]["name"], "inspect"),
            "responses" => {
                assert_eq!(body["tool_choice"]["name"], "inspect");
                assert_eq!(body["reasoning"]["summary"], "concise");
                assert_eq!(body["prompt_cache_key"], "stable-key");
            }
            "messages" => {
                assert_eq!(body["tool_choice"]["name"], "inspect");
                assert_eq!(body["thinking"]["type"], "adaptive");
                assert_eq!(
                    body["messages"][0]["content"][0]["cache_control"]["type"],
                    "ephemeral"
                );
                assert!(body["output_config"]["format"].is_null());
            }
            _ => unreachable!(),
        }
    }
}
#[tokio::test]
async fn messages_none_disables_tools_cache_usage_is_counted_and_signed_history_cannot_be_silently_stripped()
 {
    let mut body = message("{\"ok\":true}");
    body["usage"]["cache_creation_input_tokens"] = json!(5);
    body["usage"]["cache_read_input_tokens"] = json!(7);
    let server = server(vec![Wire::Json(body)]).await;
    let model = model(&server.url, "messages");
    let result = model
        .complete(
            request(json!({"stream":false,"tool_choice":"none","json_schema":true})),
            &RunContext::default(),
        )
        .await
        .unwrap();
    assert_eq!(result.input_tokens, 15);
    assert!(server.capture.requests.lock().unwrap()[0].1["tools"].is_null());
    let mut input = request(json!({"stream":false,"reasoning_effort":"none"}));
    input.messages.push(Message::Opaque {provider:"anthropic.messages/v1".into(),value:json!({"role":"assistant","content":[{"type":"thinking","thinking":"private","signature":"sealed"}]})});
    assert_eq!(
        failure_code(
            model
                .complete(input, &RunContext::default())
                .await
                .unwrap_err()
        ),
        "thinking_history"
    );
    assert_eq!(server.capture.requests.lock().unwrap().len(), 1);
}
#[test]
fn protocol_source_selection_requires_the_exact_declared_artifact_and_closed_paths() {
    let (artifact, mut config) = declarations("chat_completions");
    assert!(
        ProtocolFactory::trusted()
            .build(&config, &BTreeMap::new())
            .is_err()
    );
    let artifact = ArtifactFactory.build(&artifact, &BTreeMap::new()).unwrap();
    let deps = BTreeMap::from([("artifact".into(), artifact)]);
    assert_eq!(
        ProtocolFactory::trusted()
            .config_dependencies(&config)
            .unwrap()
            .len(),
        1
    );
    for paths in [
        json!(["../escape"]),
        json!(["/etc/passwd"]),
        json!(["common.rhai", "common.rhai"]),
        json!(["missing.rhai"]),
    ] {
        config["source"]["entries"] = paths;
        assert!(ProtocolFactory::trusted().build(&config, &deps).is_err());
    }
    config["source"] = json!("return true;");
    assert!(ProtocolFactory::trusted().build(&config, &deps).is_err());
}

#[tokio::test]
async fn messages_can_require_or_name_the_declared_finalizer_without_business_tools() {
    let mut value = message("");
    value["stop_reason"] = json!("tool_use");
    value["content"] = json!([{"type":"tool_use","id":"final_1","name":"StructuredOutput","input":{"value":{"ok":true}}}]);
    let server = server(vec![Wire::Json(value.clone()), Wire::Json(value)]).await;
    let model = model(&server.url, "messages");
    for choice in [json!("required"), json!({"function":"StructuredOutput"})] {
        let input = request(
            json!({"stream":false,"tool_choice":choice,"json_schema":true,"structured_output_retries":0}),
        );
        assert_eq!(
            model
                .request_bound(&input, &RunContext::default())
                .await
                .unwrap()
                .max_calls,
            1
        );
        let result = model.complete(input, &RunContext::default()).await.unwrap();
        assert_eq!(result.info.structured_output, Some(json!({"ok":true})));
        assert!(result.tool_calls.is_empty());
    }
    let requests = server.capture.requests.lock().unwrap();
    assert_eq!(requests[0].1["tool_choice"]["type"], "any");
    assert_eq!(requests[1].1["tool_choice"]["name"], "StructuredOutput");
}
