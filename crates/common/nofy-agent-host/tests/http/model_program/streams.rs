//! Wire fixtures exercise the shipped external programs inside real helpers;
//! they do not implement a second model adapter or call an external provider.
use super::*;
use futures::StreamExt;
use nofy_agent_runtime::{
    Message, ModelChunk, ModelDelta, ModelRequest, RunContext,
    registry::{ModuleInstance, ModuleRef},
};

fn answer(profile: &str, text: &str, tool: bool) -> Value {
    let args = json!({"id":u64::MAX,"signed":i64::MIN});
    match profile {
        "chat_completions" => {
            let mut value = json!({"choices":[{"index":0,"message":{"role":"assistant","content":text},"finish_reason":"stop"}],"usage":{"prompt_tokens":3,"completion_tokens":2}});
            if tool {
                value["choices"][0]["message"]["reasoning_content"] = json!("consider");
                value["choices"][0]["message"]["tool_calls"] = json!([{"id":"call_1","type":"function","function":{"name":"inspect","arguments":args.to_string()}}]);
            }
            value
        }
        "responses" => {
            let mut output = vec![];
            if tool {
                output.push(json!({"type":"reasoning","id":"reason_1","summary":[{"type":"summary_text","text":"consider"}],"encrypted_content":"sealed"}));
                output.push(json!({"type":"function_call","id":"fc_1","call_id":"call_1","name":"inspect","arguments":args.to_string()}));
            }
            output.push(json!({"type":"message","role":"assistant","content":[{"type":"output_text","text":text}]}));
            json!({"id":"resp_1","status":"completed","output":output,"usage":{"input_tokens":3,"output_tokens":2}})
        }
        "messages" => {
            let mut content = vec![];
            if tool {
                content.push(json!({"type":"thinking","thinking":"consider","signature":"sealed"}));
                content
                    .push(json!({"type":"tool_use","id":"call_1","name":"inspect","input":args}));
            }
            content.push(json!({"type":"text","text":text}));
            json!({"id":"msg_1","type":"message","role":"assistant","model":"test-model","content":content,"stop_reason":if tool {"tool_use"} else {"end_turn"},"usage":{"input_tokens":3,"output_tokens":2}})
        }
        _ => unreachable!(),
    }
}
fn frames(profile: &str, body: Value) -> Vec<(String, String)> {
    let mut frames = Vec::new();
    let mut push = |kind: &str, value: Value| frames.push((kind.to_owned(), value.to_string()));
    match profile {
        "chat_completions" => {
            let mut delta = body["choices"][0]["message"].clone();
            let calls = delta.as_object_mut().unwrap().remove("tool_calls").unwrap();
            push(
                "message",
                json!({"choices":[{"index":0,"delta":delta,"finish_reason":null}]}),
            );
            for (index, call) in calls.as_array().unwrap().iter().enumerate() {
                let arguments = call["function"]["arguments"].as_str().unwrap();
                push(
                    "message",
                    json!({"choices":[{"index":0,"delta":{"tool_calls":[{"index":index,"id":call["id"],"type":"function","function":{"name":"inspect","arguments":"{"}}]}}]}),
                );
                push(
                    "message",
                    json!({"choices":[{"index":0,"delta":{"tool_calls":[{"index":index,"function":{"arguments":arguments.strip_prefix('{').unwrap()}}]}}]}),
                );
            }
            push(
                "message",
                json!({"choices":[{"index":0,"delta":{},"finish_reason":"tool_calls"}]}),
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
                match item["type"].as_str().unwrap() {
                    "message" => push(
                        "response.output_text.delta",
                        json!({"type":"response.output_text.delta","delta":"答"}),
                    ),
                    "reasoning" => push(
                        "response.reasoning_summary_text.delta",
                        json!({"type":"response.reasoning_summary_text.delta","delta":"consider"}),
                    ),
                    "function_call" => {
                        let arguments = item["arguments"].as_str().unwrap();
                        for fragment in ["{", arguments.strip_prefix('{').unwrap()] {
                            push(
                                "response.function_call_arguments.delta",
                                json!({"type":"response.function_call_arguments.delta","output_index":index,"delta":fragment}),
                            );
                        }
                    }
                    _ => unreachable!(),
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
                    _ => unreachable!(),
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
                    _ => unreachable!(),
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
        _ => unreachable!(),
    }
    frames
}

#[tokio::test]
async fn three_external_protocols_stream_and_replay_signed_unsigned_history_through_helpers() {
    for profile in ["chat_completions", "responses", "messages"] {
        let release = CancellationToken::new();
        let frame_release = release.clone();
        let captured = Arc::new(Mutex::new(Vec::<Value>::new()));
        let requests = captured.clone();
        let provider = serve(Router::new().route(
            "/v1/{*path}",
            route_post(move |Json(body): Json<Value>| {
                let requests = requests.clone();
                let frame_release = frame_release.clone();
                async move {
                    requests.lock().unwrap().push(body.clone());
                    if body["stream"] == true {
                        let events = frames(profile, answer(profile, "答", true))
                            .into_iter()
                            .map(|(event, data)| {
                                Ok::<_, Infallible>(
                                    axum::response::sse::Event::default()
                                        .event(event)
                                        .data(data),
                                )
                            });
                        let delayed = futures::stream::once(async move {
                            frame_release.cancelled().await;
                            futures::stream::iter(events)
                        })
                        .flatten();
                        Sse::new(delayed).into_response()
                    } else {
                        Json(answer(profile, "next", false)).into_response()
                    }
                }
            }),
        ))
        .await;
        let dir = tempfile::tempdir().unwrap();
        let kernel = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
        let artifact = protocol_artifact();
        let manifest: Value =
            serde_json::from_str(artifact["files"]["manifest.json"].as_str().unwrap()).unwrap();
        let r = |id: &str| json!({"id":id,"version":"1"});
        let source = json!({"schema_version":1,"name":"isolated-profile","modules":[
            {"reference":r("code"),"factory":"resource.artifact","config":{"bundle":artifact}},
            {"reference":r("protocol"),"factory":"resource.model_protocol","config":manifest["profiles"][profile]["protocol"],"dependencies":{"artifact":r("code")}},
            {"reference":r("connection"),"factory":"resource.model_connection","config":{"base_url":format!("{}/v1/",provider.url),"allow_insecure_http":true,"models":["test-model"],"headers":{"anthropic-version":"2023-06-01"}}},
            {"reference":r("model"),"factory":"model.programmed","config":{"model":"test-model"},"dependencies":{"protocol":r("protocol"),"connection":r("connection")}},
            {"reference":r("prompt"),"factory":"prompt.static","config":{"text":"test"}}
        ],"programs":{"chat":{"kind":"agent","definition":{"name":"chat","model":r("model"),"prompt":r("prompt")}}}});
        let prepared = kernel
            .control()
            .prepare(serde_json::from_value(source).unwrap())
            .unwrap();
        let resolved = prepared
            .registry()
            .resolve(&[ModuleRef::new("model", "1")])
            .unwrap();
        let ModuleInstance::Model(model) = &resolved.instances[&ModuleRef::new("model", "1")]
        else {
            panic!("model");
        };
        let mut original = ModelRequest { messages: vec![Message::User {content:"test".into()}], tools:serde_json::from_value(json!([{"type":"function","function":{"name":"inspect","parameters":{"type":"object"}}}])).unwrap(), settings:json!({"reasoning_effort":"high"}) };
        let mut stream = model
            .stream(original.clone(), &RunContext::default())
            .await
            .unwrap();
        // Request state is already in the Rust session while the provider
        // waits. A lost idle evaluator must not resend that physical request.
        isolation::until(|| {
            captured.lock().unwrap().len() == 1 && kernel.loader().model_status().in_flight == 0
        })
        .await;
        let old = isolation::pidfd(kernel.loader().model_status().worker_pids[0]);
        isolation::signal(&old, libc::SIGKILL);
        isolation::until(|| isolation::dead(&old)).await;
        release.cancel();
        let (mut deltas, mut completed) = (vec![], vec![]);
        while let Some(chunk) = stream.next().await {
            match chunk.unwrap() {
                ModelChunk::Delta(delta) => deltas.push(delta),
                ModelChunk::Completed(response) => completed.push(response),
            }
        }
        assert_eq!(completed.len(), 1, "{profile}");
        let result = completed.remove(0);
        assert_eq!(result.output, "答", "{profile}");
        assert_eq!(
            result.tool_calls[0].arguments,
            json!({"id":u64::MAX,"signed":i64::MIN}),
            "{profile}"
        );
        assert_eq!((result.input_tokens, result.output_tokens), (3, 2));
        assert!(
            deltas
                .iter()
                .any(|d| matches!(d, ModelDelta::Reasoning {text} if text=="consider")),
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
        model.validate_live_history(&result.messages).await.unwrap();
        original.settings["stream"] = json!(false);
        original.messages.extend(result.messages);
        original.messages.push(Message::Tool {
            call_id: "call_1".into(),
            content: json!({"id":u64::MAX}),
            is_error: false,
        });
        assert_eq!(
            model
                .complete(original, &RunContext::default())
                .await
                .unwrap()
                .output,
            "next"
        );
        let text = {
            let requests = captured.lock().unwrap();
            assert_eq!(requests.len(), 2);
            requests[1].to_string()
        };
        assert!(text.contains("18446744073709551615"), "{profile}");
        if profile != "chat_completions" {
            assert!(text.contains("sealed"), "{profile}");
        }
        let loader = kernel.loader().clone();
        assert_eq!(loader.model_status().started, 2);
        assert_eq!(loader.model_status().in_flight, 0);
        kernel.shutdown();
        tokio::time::timeout(Duration::from_secs(5), async {
            while !loader.model_status().worker_pids.is_empty() {
                tokio::time::sleep(Duration::from_millis(5)).await;
            }
        })
        .await
        .unwrap();
    }
}
