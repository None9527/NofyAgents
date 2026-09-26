//! B0 measurement loop — crash-recovery e2e for the built binary.
//!
//! Scenario: spawn `nofy agent stdio` with the runtime journal enabled, start a
//! turn whose model response invokes `run_terminal_command sleep 30`, SIGKILL
//! the child while the tool is in flight, then resume the same session in a
//! fresh process and assert:
//!
//! 1. the journal recorded `tool.invoked` for the intent and no outcome before
//!    the kill (unclosed intent on disk);
//! 2. resume (`session/load`) reconciles the torn tail — a
//!    `reconciliation.completed` (and `session.resumed`) event lands;
//! 3. the session is still usable: a follow-up prompt completes.
//!
//! This is the measurement face for the P0 "crash-recovery rate" metric: the
//! test either passes (recovered) or fails (lost work / unusable session).
//!
//! `#[ignore]`d by default — requires a pre-built binary (auto-builds like
//! `test_built_binary_e2e`):
//! ```bash
//! cargo test -p nofy-shell --test crash_recovery_e2e -- --ignored
//! ```

use std::path::{Path, PathBuf};
use std::time::Duration;

use nofy_test_support::sse::{
    chat_completions_reasoning_then_tool_call_events, responses_api_reasoning_then_tool_call_events,
};
use nofy_test_support::*;

const CALL_ID: &str = "call_b0_crash_1";

/// All `runtime_events.jsonl` files under a NOFY_HOME sessions root.
fn journal_files(home: &Path) -> Vec<PathBuf> {
    let mut out = Vec::new();
    let sessions = home.join("sessions");
    let Ok(cwds) = std::fs::read_dir(&sessions) else {
        return out;
    };
    for cwd in cwds.flatten() {
        let Ok(ids) = std::fs::read_dir(cwd.path()) else {
            continue;
        };
        for sid in ids.flatten() {
            let journal = sid.path().join("runtime_events.jsonl");
            if journal.exists() {
                out.push(journal);
            }
        }
    }
    out
}

fn read_journals(home: &Path) -> String {
    let mut all = String::new();
    for j in journal_files(home) {
        if let Ok(text) = std::fs::read_to_string(&j) {
            all.push_str(&text);
        }
    }
    all
}

/// Poll until the journal shows the in-flight tool intent (or give up).
async fn wait_for_tool_intent(home: &Path) -> String {
    for _ in 0..75 {
        let text = read_journals(home);
        if text.contains(CALL_ID) && text.contains("tool.invoked") {
            return text;
        }
        tokio::time::sleep(Duration::from_millis(200)).await;
    }
    panic!(
        "tool intent never landed in journal\njournal dump:\n{}",
        read_journals(home)
    );
}

#[tokio::test(flavor = "current_thread")]
#[ignore = "requires pre-built binary"]
async fn crash_mid_tool_then_resume_reconciles_journal() {
    let local = tokio::task::LocalSet::new();
    local
        .run_until(async {
            let server = MockInferenceServer::start_with_models(vec![
                MockModelEntry::new("test-model").with_api_backend("chat-completions"),
            ])
            .await
            .expect("start mock server");

            // First model response: invoke a long-running shell command so the
            // kill lands while a tool intent is open.
            let args = serde_json::json!({
                "command": "sleep 30",
                "description": "b0 crash window",
                "background": false
            })
            .to_string();
            server.enqueue_response(
                "/v1/chat/completions",
                ScriptedResponse::sse(chat_completions_reasoning_then_tool_call_events(
                    "sleeping",
                    CALL_ID,
                    "run_terminal_command",
                    &args,
                    "test-model",
                )),
            );
            server.enqueue_response(
                "/v1/responses",
                ScriptedResponse::sse(responses_api_reasoning_then_tool_call_events(
                    "sleeping",
                    CALL_ID,
                    "run_terminal_command",
                    &args,
                    "test-model",
                )),
            );

            let cwd = tempfile::tempdir().expect("cwd");
            let mut client = NofyStdioClient::spawn_with_sandbox_env_and_args(
                &server,
                cwd.path(),
                TestSandbox::new(),
                &[("NOFY_RUNTIME_JOURNAL", "1")],
                &[],
            )
            .await;
            client.initialize_with_timeout().await;
            let session = client.create_session_with_timeout(cwd.path()).await;
            let pid = client.child_pid().expect("child pid");
            let home = client.sandbox().nofy_home().to_path_buf();
            let session_for_resume = session.clone();
            // The client owns the sandbox (and thus the NOFY_HOME tempdir).
            // It moves into the prompter below and is dropped when the killed
            // child's prompt future resolves — which would delete the journal
            // out from under this test. Hold the sandbox here instead.
            let _home_guard = client.take_sandbox();

            // Fire the prompt; the child will be killed out from under it.
            let prompter = tokio::task::spawn_local(async move {
                let outcome = client.prompt(&session, "run a long sleep").await;
                (client, outcome)
            });

            // Kill -9 while the tool intent is open.
            let pre_kill = wait_for_tool_intent(&home).await;
            assert!(
                !pre_kill.contains(&format!("\"intent_id\":\"{CALL_ID}\"}}"))
                    || !pre_kill.contains("tool.succeeded"),
                "tool must still be in flight at kill time"
            );
            let status = std::process::Command::new("kill")
                .args(["-9", &pid.to_string()])
                .status()
                .expect("kill");
            assert!(status.success(), "kill -9 failed");
            // The prompt future errors once the pipe dies; reclaim and drop.
            let _ = tokio::time::timeout(Duration::from_secs(30), prompter)
                .await
                .expect("prompter join");

            // Unclosed intent on disk: invoked, no outcome.
            let torn = read_journals(&home);
            assert!(torn.contains("tool.invoked"), "invoked event persisted");
            assert!(
                !torn.contains("tool.succeeded") && !torn.contains("tool.failed"),
                "no outcome may be recorded before the kill"
            );

            // Resume in a fresh process against the same NOFY_HOME.
            server.set_response("recovered fine");
            let mut sandbox2 = TestSandbox::new();
            sandbox2.set_env("NOFY_HOME", home.to_str().expect("home utf8"));
            let mut client2 = NofyStdioClient::spawn_with_sandbox_env_and_args(
                &server,
                cwd.path(),
                sandbox2,
                &[("NOFY_RUNTIME_JOURNAL", "1")],
                &[],
            )
            .await;
            client2.initialize_with_timeout().await;
            client2
                .load_session_with_timeout(&session_for_resume, cwd.path())
                .await;

            // Torn tail reconciled on resume.
            let mut reconciled = String::new();
            for _ in 0..50 {
                reconciled = read_journals(&home);
                if reconciled.contains("reconciliation.completed")
                    && reconciled.contains("session.resumed")
                {
                    break;
                }
                tokio::time::sleep(Duration::from_millis(200)).await;
            }
            assert!(
                reconciled.contains("reconciliation.completed"),
                "resume must reconcile the torn tail\njournal dump:\n{reconciled}"
            );

            // Session still usable after recovery.
            let resp = client2.prompt(&session_for_resume, "are we back?").await;
            assert!(
                resp.is_ok(),
                "post-recovery prompt failed: {:?}",
                resp.err()
            );
            assert!(
                client2.captured_text().contains("recovered fine"),
                "post-recovery answer missing, got: {}",
                client2.captured_text()
            );
            eprintln!("EVAL crash_recovery=pass session={session_for_resume:?}");
            let _ = client2.close().await;
        })
        .await;
}
