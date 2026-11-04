use std::convert::Infallible;

use axum::response::{IntoResponse, Sse};
use nofy_test_support::sse;
use serde_json::{Value, json};

#[test]
fn exact_text_keeps_whitespace_unicode_empty_text_and_terminal_usage() {
    for text in ["", "plain text", " a  b ", "line\n\t中文 🦀\n", "\n\n"] {
        let events = sse::chat_completion_script_exact(text, "contract-model");
        assert_eq!(events.last().unwrap().data, "[DONE]");
        let chunks: Vec<Value> = events[..events.len() - 1]
            .iter()
            .map(|event| serde_json::from_str(&event.data).unwrap())
            .collect();
        let content: String = chunks
            .iter()
            .filter_map(|chunk| chunk["choices"][0]["delta"]["content"].as_str())
            .collect();
        assert_eq!(content, text);
        assert_eq!(chunks[0]["choices"][0]["delta"]["role"], "assistant");
        assert_eq!(
            chunks[chunks.len() - 2]["choices"][0]["finish_reason"],
            "stop"
        );
        let usage = &chunks.last().unwrap()["usage"];
        assert_eq!(usage["prompt_tokens"], 10);
        assert_eq!(usage["completion_tokens"], chunks.len() - 1);
        assert_eq!(usage["total_tokens"], 10 + chunks.len() - 1);
        for chunk in chunks {
            assert_eq!(chunk["model"], "contract-model");
            assert_eq!(chunk["object"], "chat.completion.chunk");
        }
    }
}

#[test]
fn reasoning_tool_frames_keep_call_identity_raw_arguments_and_terminal_order() {
    let arguments = r#"{"budget":18446744073709551615,"text":"中文\nnext"}"#;
    let events = sse::chat_completions_reasoning_then_tool_call_events(
        "inspect first",
        "call-42",
        "inspect",
        arguments,
        "contract-model",
    );
    assert_eq!(events.len(), 5);
    assert_eq!(events.last().unwrap().data, "[DONE]");
    let chunks: Vec<Value> = events[..4]
        .iter()
        .map(|event| serde_json::from_str(&event.data).unwrap())
        .collect();
    let reasoning: String = chunks
        .iter()
        .filter_map(|chunk| chunk["choices"][0]["delta"]["reasoning_content"].as_str())
        .collect();
    assert_eq!(reasoning, "inspect first ");
    let call = &chunks[2]["choices"][0]["delta"]["tool_calls"][0];
    assert_eq!(
        call,
        &json!({"index":0,"id":"call-42","type":"function",
        "function":{"name":"inspect","arguments":arguments}})
    );
    assert_eq!(chunks[3]["choices"][0]["finish_reason"], "tool_calls");
    assert_eq!(
        chunks[3]["usage"],
        json!({"prompt_tokens":10,"completion_tokens":20,"total_tokens":30})
    );
    let empty = sse::chat_completions_reasoning_then_tool_call_events(
        "",
        "call-43",
        "inspect",
        "{}",
        "contract-model",
    );
    assert_eq!(empty.len(), 3);
    assert_eq!(empty.last().unwrap().data, "[DONE]");
}

#[tokio::test]
async fn axum_frames_match_scripted_data_without_dropping_bytes_or_terminal_marker() {
    let text = " first  line\n中文 🦀 ";
    let expected: String = sse::chat_completion_script_exact(text, "contract-model")
        .iter()
        .map(|event| format!("data: {}\n\n", event.data))
        .collect();
    let events = sse::chat_completion_events_exact(text, "contract-model");
    let response = Sse::new(futures_util::stream::iter(
        events.into_iter().map(Ok::<_, Infallible>),
    ))
    .into_response();
    let body = axum::body::to_bytes(response.into_body(), 1024 * 1024)
        .await
        .unwrap();
    assert_eq!(body.as_ref(), expected.as_bytes());
}
