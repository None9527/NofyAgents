//! Lossless provider item conversion and native stream adapters.
use super::*;

pub(super) fn item(message: Message) -> Result<ConversationItem, Error> {
    Ok(match message {
        Message::System { content } => ConversationItem::system(content),
        Message::User { content } => ConversationItem::user(content),
        Message::UserParts { content } => ConversationItem::user_with_parts(
            content
                .into_iter()
                .map(|part| match part {
                    nofy_agent_runtime::InputPart::Text { text } => {
                        Ok(nofy_sampling_types::conversation::ContentPart::Text {
                            text: text.into(),
                        })
                    }
                    nofy_agent_runtime::InputPart::Image { url }
                        if url.starts_with("https://")
                            || url.starts_with("http://")
                            || url.starts_with("data:image/") =>
                    {
                        Ok(nofy_sampling_types::conversation::ContentPart::Image {
                            url: url.into(),
                        })
                    }
                    _ => Err(Error::Model(
                        "image input requires an HTTP(S) URL or image data URI".into(),
                    )),
                })
                .collect::<Result<Vec<_>, _>>()?,
        ),
        Message::Assistant {
            content,
            tool_calls,
        } => {
            let calls = tool_calls
                .into_iter()
                .map(|call| nofy_sampling_types::ToolCall {
                    id: call.id.into(),
                    name: call.name,
                    arguments: call.arguments.to_string().into(),
                })
                .collect();
            let mut value = ConversationItem::assistant_tool_calls(calls);
            if let ConversationItem::Assistant(ref mut assistant) = value {
                assistant.content = content.into();
            }
            value
        }
        Message::Tool {
            call_id, content, ..
        } => {
            let payload = content.get("value").unwrap_or(&content);
            let prompt_text = payload
                .get("prompt_text")
                .and_then(serde_json::Value::as_str);
            let blocks = content
                .get("model_output")
                .or_else(|| payload.get("content"))
                .and_then(serde_json::Value::as_array);
            let mut texts = Vec::new();
            let mut images = Vec::new();
            for block in blocks.into_iter().flatten() {
                match block.get("type").and_then(serde_json::Value::as_str) {
                    Some("text") => {
                        if let Some(text) = block.get("text").and_then(serde_json::Value::as_str) {
                            texts.push(text.to_owned());
                        }
                    }
                    Some("image") => {
                        let mime = block
                            .get("mime_type")
                            .or_else(|| block.get("mimeType"))
                            .and_then(serde_json::Value::as_str);
                        let data = block.get("data").and_then(serde_json::Value::as_str);
                        if let (Some(mime), Some(data)) = (mime, data) {
                            images.push(nofy_sampling_types::conversation::ContentPart::Image {
                                url: format!("data:{mime};base64,{data}").into(),
                            });
                        } else {
                            texts.push(block.to_string());
                        }
                    }
                    _ => texts.push(block.to_string()),
                }
            }
            let text = prompt_text.map(str::to_owned).unwrap_or_else(|| {
                if texts.is_empty() {
                    payload.to_string()
                } else {
                    texts.join("\n")
                }
            });
            ConversationItem::tool_result_with_images(call_id, text, images)
        }
        Message::Opaque { provider, value } => {
            if provider != "nofy-sampler" {
                return Err(Error::Model(format!(
                    "unsupported opaque item provider: {provider}"
                )));
            }
            serde_json::from_value(value).map_err(|e| Error::Model(e.to_string()))?
        }
    })
}

pub(super) fn converted(response: ConversationResponse) -> Result<ModelResponse, Error> {
    if !response
        .items
        .iter()
        .any(|item| matches!(item, ConversationItem::Assistant(_)))
    {
        return Err(Error::Model("sampler returned no assistant turn".into()));
    }
    let output = response.assistant_text();
    let tool_calls = response
        .tool_calls()
        .iter()
        .map(|call| {
            Ok(ToolCall {
                id: call.id.to_string(),
                name: call.name.clone(),
                arguments: serde_json::from_str(&call.arguments)
                    .map_err(|e| Error::Model(format!("invalid tool arguments: {e}")))?,
            })
        })
        .collect::<Result<Vec<_>, Error>>()?;
    let info = CompletionInfo {
        stop_reason: response
            .stop_reason
            .map(|reason| reason.as_str().to_string()),
        refusal: if response.stop_reason == Some(nofy_sampling_types::StopReason::ContentFilter) {
            Some(
                response
                    .stop_message
                    .clone()
                    .unwrap_or_else(|| "provider refused the response".into()),
            )
        } else {
            None
        },
        structured_output: None,
        hook_stop_reason: None,
        provider: json!({"usage":response.usage,"cost_usd_ticks":response.cost_usd_ticks,"stop_message":response.stop_message,"doom_loop_signals":response.doom_loop_signals,
            "message_id":response.message_id,"raw_stop_reason":response.raw_stop_reason,"stop_sequence":response.stop_sequence}),
    };
    let input_tokens = response
        .usage
        .as_ref()
        .map_or(0, |usage| u64::from(usage.prompt_tokens));
    let output_tokens = response
        .usage
        .as_ref()
        .map_or(0, |usage| u64::from(usage.completion_tokens));
    Ok(ModelResponse {
        messages: opaque(response.items)?,
        output,
        tool_calls,
        input_tokens,
        output_tokens,
        info,
    })
}
pub(super) fn opaque(items: Vec<ConversationItem>) -> Result<Vec<Message>, Error> {
    items
        .into_iter()
        .map(|value| {
            Ok(Message::Opaque {
                provider: "nofy-sampler".into(),
                value: serde_json::to_value(value).map_err(|e| Error::Model(e.to_string()))?,
            })
        })
        .collect()
}
pub(super) fn status(name: &str, data: Value) -> ModelChunk {
    ModelChunk::Delta(ModelDelta::Status {
        name: name.into(),
        data,
    })
}

pub(super) fn provider_failure(info: crate::events::SamplingErrorInfo) -> Error {
    nofy_agent_runtime::model::ModelFailure {
        category: info.kind.as_str().into(),
        message: info.message,
        status: info.status_code,
        retryable: info.is_retryable && info.should_retry != Some(false),
        retry_after_ms: info
            .retry_after_secs
            .map(|seconds| seconds.saturating_mul(1000)),
        code: info.error_code.map(|code|code.as_str().to_string()),
        details:json!({"should_retry":info.should_retry,"sent_credential":info.credential,"model_metadata":info.model_metadata,
            "empty_response_context":info.empty_response_context,"doom_loop_triggers":info.doom_loop_triggers,"doom_loop_aborted_at_chunk":info.doom_loop_aborted_at_chunk}),
    }
    .into()
}
pub(super) fn sampling_failure(error: nofy_sampling_types::SamplingError) -> Error {
    provider_failure(crate::events::SamplingErrorInfo::from(&error))
}

// Only raw HTTP opening errors use this adapter. SamplingClient's
// auth_rejected constructor is reached by its exact HTTP 401 arms; local
// configuration Auth errors and already-streamed failures keep their original
// status and never enter automatic request recovery.
pub(super) fn sampling_http_failure(error: nofy_sampling_types::SamplingError) -> Error {
    let unauthorized = matches!(&error, nofy_sampling_types::SamplingError::Auth { .. });
    let mut info = crate::events::SamplingErrorInfo::from(&error);
    if unauthorized {
        info.status_code = Some(401);
    }
    provider_failure(info)
}

pub(super) async fn provider_stream(
    client: &SamplingClient,
    request: ConversationRequest,
) -> Result<futures_util::stream::BoxStream<'static, crate::events::SamplingEvent>, Error> {
    let id = crate::types::RequestId::random();
    let idle = std::time::Duration::from_secs(300);
    Ok(match client.api_backend() {
        ApiBackend::ChatCompletions => {
            let (raw, metadata) = client
                .conversation_stream(request)
                .await
                .map_err(sampling_http_failure)?;
            crate::stream::stream_chat_completions(raw, metadata, id, idle).boxed()
        }
        ApiBackend::Responses => {
            let (raw, metadata, signals) = client
                .conversation_stream_responses(request)
                .await
                .map_err(sampling_http_failure)?;
            crate::stream::stream_responses(raw, metadata, id, idle, signals).boxed()
        }
        ApiBackend::Messages => {
            let (raw, metadata) = client
                .conversation_stream_messages(request)
                .await
                .map_err(sampling_http_failure)?;
            crate::stream::stream_messages(raw, metadata, id, idle).boxed()
        }
    })
}
