//! Product-level memory journey against the real `nofy` binary.
//!
//! This is ignored by default because it requires a pre-built binary:
//! `NOFY_BINARY=target/debug/nofy cargo test -p nofy-shell --test memory_product_e2e -- --ignored`

use std::path::Path;

use nofy_test_support::sse::{
    responses_api_reasoning_then_tool_call_events, responses_api_script_exact,
};
use nofy_test_support::*;
use serde_json::Value;

const MODEL: &str = "grok-4.5";
const FACT: &str = "我的默认技术栈是 Rust workspace";

async fn memory_server() -> MockInferenceServer {
    MockInferenceServer::start_with_models(vec![
        MockModelEntry::with_agent_type(MODEL, "nofy-build").with_api_backend("responses"),
    ])
    .await
    .expect("start mock inference server")
}

async fn memory_client(server: &MockInferenceServer, cwd: &Path, home: &Path) -> NofyStdioClient {
    let mut sandbox = TestSandbox::new();
    sandbox.set_env("NOFY_HOME", home.to_str().expect("NOFY_HOME utf8"));
    sandbox.set_env("NOFY_MEMORY", "1");
    NofyStdioClient::spawn_with_sandbox_env_and_args(server, cwd, sandbox, &[], &[]).await
}

fn updates_of_kind<'a>(updates: &'a [Value], kind: &str) -> Vec<&'a Value> {
    updates
        .iter()
        .filter(|value| {
            value
                .pointer("/update/sessionUpdate")
                .and_then(Value::as_str)
                == Some(kind)
        })
        .collect()
}

fn request_bodies_contain(server: &MockInferenceServer, needle: &str) -> bool {
    server
        .request_bodies()
        .iter()
        .any(|body| body.to_string().contains(needle))
}

#[tokio::test(flavor = "current_thread")]
#[ignore = "requires pre-built binary"]
async fn memory_write_reference_and_quiet_irrelevant_turn_survive_process_restart() {
    tokio::task::LocalSet::new()
        .run_until(async {
            let cwd = tempfile::tempdir().expect("cwd");
            let home = tempfile::tempdir().expect("shared NOFY_HOME");

            // Process A: the model performs an explicit write. The user sees a
            // trusted receipt emitted by the shell, not model-authored prose.
            let writer_server = memory_server().await;
            let arguments = serde_json::json!({
                "action": "remember",
                "scope": "personal",
                "statement": FACT,
                "confirmed": false,
            })
            .to_string();
            let writer_tool = writer_server.expect_response(
                "memory write tool call",
                InferenceRequestMatcher::foreground(InferenceEndpoint::Responses),
                ScriptedResponse::sse(responses_api_reasoning_then_tool_call_events(
                    "save the explicit preference",
                    "call_memory_write",
                    "memory_write",
                    &arguments,
                    MODEL,
                )),
            );
            let writer_final = writer_server.expect_response(
                "memory write final answer",
                InferenceRequestMatcher::foreground(InferenceEndpoint::Responses),
                ScriptedResponse::sse(responses_api_script_exact("记好了。", MODEL)),
            );
            writer_server.set_response("fallback");

            let mut writer = memory_client(&writer_server, cwd.path(), home.path()).await;
            writer.initialize_with_timeout().await;
            let session = writer.create_session_with_timeout(cwd.path()).await;
            writer
                .prompt_with_timeout(&session, "请记住：我的默认技术栈是 Rust workspace")
                .await
                .expect("memory write prompt");
            writer_tool.assert_satisfied();
            writer_final.assert_satisfied();
            let updates = writer.captured_nofy_session_updates();
            let receipts = updates_of_kind(&updates, "memory_write_receipt");
            assert_eq!(receipts.len(), 1, "trusted updates: {updates:#?}");
            let receipt = receipts[0]
                .pointer("/update/receipt")
                .and_then(Value::as_str)
                .expect("public receipt");
            assert!(receipt.contains("已记住到“关于我”"), "receipt: {receipt}");
            assert!(receipt.contains(FACT), "receipt: {receipt}");
            assert!(
                !receipt.contains("operation_id"),
                "receipt leaked coordinates"
            );
            assert!(!writer.captured_text().contains("已记住到“关于我”"));
            writer.close().await.expect("writer exits");

            // Process B: a relevant first turn reopens the same durable memory,
            // injects the exact fact, and reports the fact actually used.
            let reader_server = memory_server().await;
            let reader_answer = reader_server.expect_response(
                "relevant memory answer",
                InferenceRequestMatcher::foreground(InferenceEndpoint::Responses),
                ScriptedResponse::sse(responses_api_script_exact(
                    "你的默认技术栈是 Rust workspace。",
                    MODEL,
                )),
            );
            reader_server.set_response("fallback");
            let mut reader = memory_client(&reader_server, cwd.path(), home.path()).await;
            reader.initialize_with_timeout().await;
            let session = reader.create_session_with_timeout(cwd.path()).await;
            reader
                .prompt_with_timeout(&session, "我的默认技术栈和 workspace 偏好是什么？")
                .await
                .expect("relevant memory prompt");
            reader_answer.assert_satisfied();
            assert!(
                request_bodies_contain(&reader_server, FACT),
                "relevant inference request did not contain durable fact: {:#?}",
                reader_server.request_bodies()
            );
            let updates = reader.captured_nofy_session_updates();
            let references = updates_of_kind(&updates, "memory_reference_used");
            assert_eq!(references.len(), 1, "trusted updates: {updates:#?}");
            assert_eq!(
                references[0]
                    .pointer("/update/references/0/summary")
                    .and_then(Value::as_str),
                Some(FACT)
            );
            assert_eq!(
                references[0]
                    .pointer("/update/references/0/area_label")
                    .and_then(Value::as_str),
                Some("关于我")
            );
            reader.close().await.expect("reader exits");

            // Process C: an unrelated query remains quiet. The fact is absent
            // both from the model request and from trusted UI provenance.
            let quiet_server = memory_server().await;
            let quiet_answer = quiet_server.expect_response(
                "irrelevant answer",
                InferenceRequestMatcher::foreground(InferenceEndpoint::Responses),
                ScriptedResponse::sse(responses_api_script_exact(
                    "香蕉奶昔可以用香蕉和牛奶制作。",
                    MODEL,
                )),
            );
            quiet_server.set_response("fallback");
            let mut quiet = memory_client(&quiet_server, cwd.path(), home.path()).await;
            quiet.initialize_with_timeout().await;
            let session = quiet.create_session_with_timeout(cwd.path()).await;
            quiet
                .prompt_with_timeout(&session, "香蕉奶昔怎么做？")
                .await
                .expect("irrelevant prompt");
            quiet_answer.assert_satisfied();
            assert!(
                !request_bodies_contain(&quiet_server, FACT),
                "irrelevant inference request leaked durable fact: {:#?}",
                quiet_server.request_bodies()
            );
            let updates = quiet.captured_nofy_session_updates();
            assert!(
                updates_of_kind(&updates, "memory_reference_used").is_empty(),
                "irrelevant turn emitted provenance: {updates:#?}"
            );
            quiet.close().await.expect("quiet reader exits");
        })
        .await;
}
