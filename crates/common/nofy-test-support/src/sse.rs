//! Deterministic SSE fixtures for framework contract tests.
//! Fixed fixture usage is not real provider usage or a model implementation.

use axum::response::sse::Event;
use serde_json::json;

/// One unnamed SSE data frame, without endpoint or product behavior.
#[derive(Debug, Clone)]
pub struct SseEvent {
    pub data: String,
}

impl SseEvent {
    fn data(data: impl Into<String>) -> Self {
        Self { data: data.into() }
    }
}

/// Axum frames preserving text bytes, followed by usage and DONE.
pub fn chat_completion_events_exact(text: &str, model: &str) -> Vec<Event> {
    scripted_to_axum(chat_completion_script_exact(text, model))
}

/// Text deltas reconstruct the input byte-for-byte.
pub fn chat_completion_script_exact(text: &str, model: &str) -> Vec<SseEvent> {
    chat_completion_script_from_deltas(&chat_completion_deltas(text), model)
}

fn chat_completion_deltas(text: &str) -> Vec<String> {
    space_prefixed_deltas(text.split(' '))
}

fn space_prefixed_deltas<'a>(words: impl Iterator<Item = &'a str>) -> Vec<String> {
    words
        .enumerate()
        .map(|(i, word)| {
            if i == 0 {
                word.to_owned()
            } else {
                format!(" {word}")
            }
        })
        .collect()
}

fn chat_completion_script_from_deltas(deltas: &[String], model: &str) -> Vec<SseEvent> {
    let n = deltas.len();
    let mut events = Vec::new();

    for (i, content) in deltas.iter().enumerate() {
        let finish_reason = if i + 1 == n {
            json!("stop")
        } else {
            json!(null)
        };

        let chunk = if i == 0 {
            json!({
                "id": "chatcmpl-test",
                "object": "chat.completion.chunk",
                "created": 1234567890,
                "model": model,
                "choices": [{
                    "index": 0,
                    "delta": { "role": "assistant", "content": content },
                    "finish_reason": finish_reason
                }]
            })
        } else {
            json!({
                "id": "chatcmpl-test",
                "object": "chat.completion.chunk",
                "created": 1234567890,
                "model": model,
                "choices": [{
                    "index": 0,
                    "delta": { "content": content },
                    "finish_reason": finish_reason
                }]
            })
        };
        events.push(SseEvent::data(chunk.to_string()));
    }

    events.push(SseEvent::data(
        json!({
            "id": "chatcmpl-test",
            "object": "chat.completion.chunk",
            "created": 1234567890,
            "model": model,
            "choices": [],
            "usage": {
                "prompt_tokens": 10,
                "completion_tokens": n,
                "total_tokens": 10 + n
            }
        })
        .to_string(),
    ));
    events.push(SseEvent::data("[DONE]"));
    events
}

/// Reasoning, an exact tool call, usage and DONE in that order.
pub fn chat_completions_reasoning_then_tool_call_events(
    reasoning: &str,
    call_id: &str,
    name: &str,
    arguments: &str,
    model: &str,
) -> Vec<SseEvent> {
    let mut events = Vec::new();
    for word in reasoning.split_whitespace() {
        events.push(SseEvent::data(
            json!({
                "id": "chatcmpl-test",
                "object": "chat.completion.chunk",
                "created": 1234567890,
                "model": model,
                "choices": [{
                    "index": 0,
                    "delta": { "reasoning_content": format!("{word} ") },
                    "finish_reason": null
                }]
            })
            .to_string(),
        ));
    }
    events.push(SseEvent::data(
        json!({
            "id": "chatcmpl-test",
            "object": "chat.completion.chunk",
            "created": 1234567890,
            "model": model,
            "choices": [{
                "index": 0,
                "delta": {
                    "role": "assistant",
                    "content": null,
                    "tool_calls": [{
                        "index": 0,
                        "id": call_id,
                        "type": "function",
                        "function": { "name": name, "arguments": arguments }
                    }]
                },
                "finish_reason": null
            }]
        })
        .to_string(),
    ));
    events.push(SseEvent::data(
        json!({
            "id": "chatcmpl-test",
            "object": "chat.completion.chunk",
            "created": 1234567890,
            "model": model,
            "choices": [{
                "index": 0,
                "delta": {},
                "finish_reason": "tool_calls"
            }],
            "usage": {
                "prompt_tokens": 10,
                "completion_tokens": 20,
                "total_tokens": 30
            }
        })
        .to_string(),
    ));
    events.push(SseEvent::data("[DONE]"));
    events
}

fn scripted_to_axum(events: Vec<SseEvent>) -> Vec<Event> {
    events
        .into_iter()
        .map(|event| Event::default().data(event.data))
        .collect()
}
