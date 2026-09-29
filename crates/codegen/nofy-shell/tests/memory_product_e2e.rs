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

fn find_memory_write_output(value: &Value) -> Option<Value> {
    if value.get("result").is_some()
        && value.get("action").is_some()
        && value.get("target_id").is_some()
    {
        return Some(value.clone());
    }
    match value {
        Value::String(text) => serde_json::from_str::<Value>(text)
            .ok()
            .and_then(|nested| find_memory_write_output(&nested)),
        Value::Array(values) => values.iter().find_map(find_memory_write_output),
        Value::Object(values) => values.values().find_map(find_memory_write_output),
        _ => None,
    }
}

fn latest_memory_write_output(server: &MockInferenceServer) -> Value {
    server
        .request_bodies()
        .iter()
        .rev()
        .find_map(find_memory_write_output)
        .unwrap_or_else(|| {
            panic!(
                "no memory_write output in requests: {:#?}",
                server.request_bodies()
            )
        })
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

#[tokio::test(flavor = "current_thread")]
#[ignore = "requires pre-built binary"]
async fn correction_then_forget_remains_authoritative_across_restarts() {
    tokio::task::LocalSet::new()
        .run_until(async {
            let cwd = tempfile::tempdir().expect("cwd");
            let home = tempfile::tempdir().expect("shared NOFY_HOME");
            let original = "我的默认编辑器是 Vim";
            let corrected = "我的默认编辑器是 Helix";

            let remember_server = memory_server().await;
            let remember_args = serde_json::json!({
                "action": "remember",
                "scope": "personal",
                "statement": original,
            })
            .to_string();
            let remember_tool = remember_server.expect_response(
                "remember editor",
                InferenceRequestMatcher::foreground(InferenceEndpoint::Responses),
                ScriptedResponse::sse(responses_api_reasoning_then_tool_call_events(
                    "remember editor preference",
                    "call_remember_editor",
                    "memory_write",
                    &remember_args,
                    MODEL,
                )),
            );
            let remember_final = remember_server.expect_response(
                "remember editor final",
                InferenceRequestMatcher::foreground(InferenceEndpoint::Responses),
                ScriptedResponse::sse(responses_api_script_exact("已处理。", MODEL)),
            );
            remember_server.set_response("fallback");
            let mut remember = memory_client(&remember_server, cwd.path(), home.path()).await;
            remember.initialize_with_timeout().await;
            let session = remember.create_session_with_timeout(cwd.path()).await;
            remember
                .prompt_with_timeout(&session, "请记住我的默认编辑器是 Vim")
                .await
                .expect("remember editor prompt");
            remember_tool.assert_satisfied();
            remember_final.assert_satisfied();
            let remembered = latest_memory_write_output(&remember_server);
            let target_id = remembered["target_id"]
                .as_str()
                .expect("remember target id");
            let expected_hash = remembered["expected_hash"]
                .as_str()
                .expect("remember expected hash");
            remember.close().await.expect("remember process exits");

            let revise_server = memory_server().await;
            let revise_args = serde_json::json!({
                "action": "revise",
                "statement": corrected,
                "target_id": target_id,
                "expected_hash": expected_hash,
            })
            .to_string();
            let revise_tool = revise_server.expect_response(
                "revise editor",
                InferenceRequestMatcher::foreground(InferenceEndpoint::Responses),
                ScriptedResponse::sse(responses_api_reasoning_then_tool_call_events(
                    "correct editor preference",
                    "call_revise_editor",
                    "memory_write",
                    &revise_args,
                    MODEL,
                )),
            );
            let revise_final = revise_server.expect_response(
                "revise editor final",
                InferenceRequestMatcher::foreground(InferenceEndpoint::Responses),
                ScriptedResponse::sse(responses_api_script_exact("已纠正。", MODEL)),
            );
            revise_server.set_response("fallback");
            let mut revise = memory_client(&revise_server, cwd.path(), home.path()).await;
            revise.initialize_with_timeout().await;
            let session = revise.create_session_with_timeout(cwd.path()).await;
            revise
                .prompt_with_timeout(&session, "纠正：我的默认编辑器现在是 Helix")
                .await
                .expect("revise editor prompt");
            revise_tool.assert_satisfied();
            revise_final.assert_satisfied();
            let updates = revise.captured_nofy_session_updates();
            let receipts = updates_of_kind(&updates, "memory_write_receipt");
            assert_eq!(receipts.len(), 1, "trusted updates: {updates:#?}");
            assert!(
                receipts[0]
                    .pointer("/update/receipt")
                    .and_then(Value::as_str)
                    .is_some_and(|receipt| receipt.contains(corrected))
            );
            let revised = latest_memory_write_output(&revise_server);
            let revised_target = revised["target_id"].as_str().expect("revised target id");
            let revised_hash = revised["expected_hash"]
                .as_str()
                .expect("revised expected hash");
            revise.close().await.expect("revise process exits");

            let recall_server = memory_server().await;
            let recall_answer = recall_server.expect_response(
                "recall corrected editor",
                InferenceRequestMatcher::foreground(InferenceEndpoint::Responses),
                ScriptedResponse::sse(responses_api_script_exact("Helix。", MODEL)),
            );
            recall_server.set_response("fallback");
            let mut recall = memory_client(&recall_server, cwd.path(), home.path()).await;
            recall.initialize_with_timeout().await;
            let session = recall.create_session_with_timeout(cwd.path()).await;
            recall
                .prompt_with_timeout(&session, "默认编辑器")
                .await
                .expect("recall corrected editor");
            recall_answer.assert_satisfied();
            assert!(request_bodies_contain(&recall_server, corrected));
            assert!(!request_bodies_contain(&recall_server, original));
            recall.close().await.expect("recall process exits");

            let forget_server = memory_server().await;
            let forget_args = serde_json::json!({
                "action": "forget",
                "target_id": revised_target,
                "expected_hash": revised_hash,
                "confirmed": true,
            })
            .to_string();
            let forget_tool = forget_server.expect_response(
                "forget editor",
                InferenceRequestMatcher::foreground(InferenceEndpoint::Responses),
                ScriptedResponse::sse(responses_api_reasoning_then_tool_call_events(
                    "forget editor preference",
                    "call_forget_editor",
                    "memory_write",
                    &forget_args,
                    MODEL,
                )),
            );
            let forget_final = forget_server.expect_response(
                "forget editor final",
                InferenceRequestMatcher::foreground(InferenceEndpoint::Responses),
                ScriptedResponse::sse(responses_api_script_exact("已忘记。", MODEL)),
            );
            forget_server.set_response("fallback");
            let mut forget = memory_client(&forget_server, cwd.path(), home.path()).await;
            forget.initialize_with_timeout().await;
            let session = forget.create_session_with_timeout(cwd.path()).await;
            forget
                .prompt_with_timeout(&session, "确认忘记我的默认编辑器")
                .await
                .expect("forget editor prompt");
            forget_tool.assert_satisfied();
            forget_final.assert_satisfied();
            let updates = forget.captured_nofy_session_updates();
            assert_eq!(
                updates_of_kind(&updates, "memory_write_receipt").len(),
                1,
                "trusted updates: {updates:#?}"
            );
            forget.close().await.expect("forget process exits");

            let absent_server = memory_server().await;
            let absent_answer = absent_server.expect_response(
                "forgotten editor remains absent",
                InferenceRequestMatcher::foreground(InferenceEndpoint::Responses),
                ScriptedResponse::sse(responses_api_script_exact("没有相关记忆。", MODEL)),
            );
            absent_server.set_response("fallback");
            let mut absent = memory_client(&absent_server, cwd.path(), home.path()).await;
            absent.initialize_with_timeout().await;
            let session = absent.create_session_with_timeout(cwd.path()).await;
            absent
                .prompt_with_timeout(&session, "Helix 编辑器偏好是什么？")
                .await
                .expect("forgotten editor query");
            absent_answer.assert_satisfied();
            assert!(!request_bodies_contain(&absent_server, corrected));
            assert!(
                updates_of_kind(
                    &absent.captured_nofy_session_updates(),
                    "memory_reference_used"
                )
                .is_empty()
            );
            absent.close().await.expect("absent process exits");
        })
        .await;
}

#[tokio::test(flavor = "current_thread")]
#[ignore = "requires pre-built binary"]
async fn rejected_secret_write_never_emits_success_receipt() {
    tokio::task::LocalSet::new()
        .run_until(async {
            let cwd = tempfile::tempdir().expect("cwd");
            let home = tempfile::tempdir().expect("NOFY_HOME");
            let server = memory_server().await;
            let arguments = serde_json::json!({
                "action": "remember",
                "scope": "personal",
                "statement": "My API key is secret-value",
                "confirmed": true,
            })
            .to_string();
            let rejected_tool = server.expect_response(
                "rejected secret write",
                InferenceRequestMatcher::foreground(InferenceEndpoint::Responses),
                ScriptedResponse::sse(responses_api_reasoning_then_tool_call_events(
                    "attempt secret write",
                    "call_rejected_secret",
                    "memory_write",
                    &arguments,
                    MODEL,
                )),
            );
            let final_answer = server.expect_response(
                "secret rejection final",
                InferenceRequestMatcher::foreground(InferenceEndpoint::Responses),
                ScriptedResponse::sse(responses_api_script_exact("不会保存凭据。", MODEL)),
            );
            server.set_response("fallback");
            let mut client = memory_client(&server, cwd.path(), home.path()).await;
            client.initialize_with_timeout().await;
            let session = client.create_session_with_timeout(cwd.path()).await;
            client
                .prompt_with_timeout(&session, "请记住我的 API key")
                .await
                .expect("secret write turn completes with tool error");
            rejected_tool.assert_satisfied();
            final_answer.assert_satisfied();
            let updates = client.captured_nofy_session_updates();
            assert!(
                updates_of_kind(&updates, "memory_write_receipt").is_empty(),
                "failed write emitted success receipt: {updates:#?}"
            );
            assert!(request_bodies_contain(
                &server,
                "凭据和密钥永远不会写入记忆"
            ));
            client.close().await.expect("client exits");
        })
        .await;
}

#[tokio::test(flavor = "current_thread")]
#[ignore = "requires pre-built binary"]
async fn project_memory_is_visible_only_in_the_same_project() {
    tokio::task::LocalSet::new()
        .run_until(async {
            let project_a = tempfile::tempdir().expect("project A");
            let project_b = tempfile::tempdir().expect("project B");
            let home = tempfile::tempdir().expect("shared NOFY_HOME");
            let fact = "本项目的构建代号是 ORCHID-4729";

            let writer_server = memory_server().await;
            let arguments = serde_json::json!({
                "action": "remember",
                "scope": "project",
                "statement": fact,
            })
            .to_string();
            let tool = writer_server.expect_response(
                "write project memory",
                InferenceRequestMatcher::foreground(InferenceEndpoint::Responses),
                ScriptedResponse::sse(responses_api_reasoning_then_tool_call_events(
                    "remember project code",
                    "call_project_memory",
                    "memory_write",
                    &arguments,
                    MODEL,
                )),
            );
            let final_answer = writer_server.expect_response(
                "write project memory final",
                InferenceRequestMatcher::foreground(InferenceEndpoint::Responses),
                ScriptedResponse::sse(responses_api_script_exact("已记住。", MODEL)),
            );
            writer_server.set_response("fallback");
            let mut writer = memory_client(&writer_server, project_a.path(), home.path()).await;
            writer.initialize_with_timeout().await;
            let session = writer.create_session_with_timeout(project_a.path()).await;
            writer
                .prompt_with_timeout(&session, "记住当前项目的构建代号 ORCHID-4729")
                .await
                .expect("project memory write");
            tool.assert_satisfied();
            final_answer.assert_satisfied();
            writer.close().await.expect("writer exits");

            let same_server = memory_server().await;
            let same_answer = same_server.expect_response(
                "same project recall",
                InferenceRequestMatcher::foreground(InferenceEndpoint::Responses),
                ScriptedResponse::sse(responses_api_script_exact("ORCHID-4729。", MODEL)),
            );
            same_server.set_response("fallback");
            let mut same = memory_client(&same_server, project_a.path(), home.path()).await;
            same.initialize_with_timeout().await;
            let session = same.create_session_with_timeout(project_a.path()).await;
            same.prompt_with_timeout(&session, "ORCHID-4729")
                .await
                .expect("same project recall");
            same_answer.assert_satisfied();
            assert!(request_bodies_contain(&same_server, fact));
            let updates = same.captured_nofy_session_updates();
            let references = updates_of_kind(&updates, "memory_reference_used");
            assert_eq!(references.len(), 1, "trusted updates: {updates:#?}");
            assert_eq!(
                references[0]
                    .pointer("/update/references/0/area_label")
                    .and_then(Value::as_str),
                Some("当前项目")
            );
            same.close().await.expect("same-project reader exits");

            let other_server = memory_server().await;
            let other_answer = other_server.expect_response(
                "other project remains isolated",
                InferenceRequestMatcher::foreground(InferenceEndpoint::Responses),
                ScriptedResponse::sse(responses_api_script_exact("没有相关项目记忆。", MODEL)),
            );
            other_server.set_response("fallback");
            let mut other = memory_client(&other_server, project_b.path(), home.path()).await;
            other.initialize_with_timeout().await;
            let session = other.create_session_with_timeout(project_b.path()).await;
            other
                .prompt_with_timeout(&session, "ORCHID-4729")
                .await
                .expect("other project query");
            other_answer.assert_satisfied();
            assert!(!request_bodies_contain(&other_server, fact));
            assert!(
                updates_of_kind(
                    &other.captured_nofy_session_updates(),
                    "memory_reference_used"
                )
                .is_empty()
            );
            other.close().await.expect("other-project reader exits");
        })
        .await;
}
