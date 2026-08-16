//! B1-4 measurement: cursor-based delta reconnect (BufferedDelta pattern).
//!
//! The run outlives the connection: updates persist to `updates.jsonl` with
//! per-event ids. A reconnecting client sends `_meta.cursor` = the last event
//! it saw; the server replays only the delta (events after the cursor) and
//! falls back to full replay when the cursor is unknown.
//!
//! Asserts:
//! 1. delta reconnect: replayed text contains chunks AFTER the cursor and not
//!    the chunks before it;
//! 2. stale cursor fallback: a bogus cursor yields the FULL history.
//!
//! `#[ignore]`d by default — requires a pre-built binary:
//! ```bash
//! cargo test -p nofy-shell --test reconnect_delta_e2e -- --ignored
//! ```

use nofy_test_support::sse::chat_completion_script_exact;
use nofy_test_support::*;

#[tokio::test(flavor = "current_thread")]
#[ignore = "requires pre-built binary"]
async fn reconnect_with_cursor_replays_only_delta() {
    let local = tokio::task::LocalSet::new();
    local
        .run_until(async {
            let server = MockInferenceServer::start_with_models(vec![
                MockModelEntry::new("test-model").with_api_backend("chat-completions"),
            ])
            .await
            .expect("start mock server");
            // Word-by-word chunks => several distinct eventIds.
            server.enqueue_response(
                "/v1/chat/completions",
                ScriptedResponse::sse(chat_completion_script_exact(
                    "alpha beta gamma delta",
                    "test-model",
                )),
            );

            let cwd = tempfile::tempdir().expect("cwd");
            let mut client = NofyStdioClient::spawn(&server, cwd.path()).await;
            client.initialize_with_timeout().await;
            let session = client.create_session_with_timeout(cwd.path()).await;
            // Keep the first client's NOFY_HOME alive across reconnects.
            let home = client.sandbox().nofy_home().to_path_buf();
            let _home_guard = client.take_sandbox();
            client
                .prompt(&session, "say the words")
                .await
                .expect("prompt");
            let text = client.captured_text();
            assert!(text.contains("alpha") && text.contains("delta"), "live text: {text}");
            let ids = client.captured_event_ids();
            assert!(
                ids.len() >= 2,
                "expected multiple eventIds (chunk merge may coalesce words), got {ids:?}"
            );
            // Cursor = a mid-stream event the replay path forwards verbatim
            // (merged text ACUs are dropped on replay by design, so the cursor
            // must sit on a replayable event; live layout is deterministic for
            // this scripted response). Replay must then skip everything up to
            // and including the cursor and deliver the later replayables.
            assert!(ids.len() >= 7, "live layout: {ids:?}");
            let cursor = ids[2].clone();
            let later_replayable = ids[6].clone();
            let _ = client.close().await;

            // Delta reconnect against the same NOFY_HOME.
            server.set_response("post-reconnect answer");
            let client2 = NofyStdioClient::spawn_with_home(&server, cwd.path(), &home).await;
            client2.initialize_with_timeout().await;
            client2
                .load_session_with_cursor(&session, cwd.path(), &cursor)
                .await;
            // Structural delta semantics (chunk merging makes text-shape
            // assertions brittle): the cursor event and everything before it
            // must not be replayed; the tail must be.
            let delta_ids = client2.captured_event_ids();
            eprintln!("DEBUG live={ids:?} cursor={cursor} delta={delta_ids:?}");
            assert!(
                !delta_ids.contains(&cursor),
                "cursor event must not be replayed, got {delta_ids:?}"
            );
            assert!(
                delta_ids.contains(&later_replayable),
                "replayable events after the cursor must be delivered, got {delta_ids:?}"
            );
            assert!(
                !ids[..=2].iter().any(|id| delta_ids.contains(id)),
                "nothing at or before the cursor may be replayed, got {delta_ids:?}"
            );

            // Stale cursor falls back to full replay.
            let client3 = NofyStdioClient::spawn_with_home(&server, cwd.path(), &home).await;
            client3.initialize_with_timeout().await;
            client3
                .load_session_with_cursor(&session, cwd.path(), "no-such-event-id")
                .await;
            let full_ids = client3.captured_event_ids();
            assert!(
                full_ids.contains(&cursor) && full_ids.contains(&later_replayable),
                "bogus cursor must fall back to full replay, got {full_ids:?}"
            );
            assert!(
                full_ids.len() > delta_ids.len(),
                "full replay must be a strict superset of delta, full={full_ids:?} delta={delta_ids:?}"
            );
            eprintln!(
                "EVAL reconnect_delta=pass live={} delta={} full={} cursor_skipped=true fallback=true",
                ids.len(),
                delta_ids.len(),
                full_ids.len()
            );
        })
        .await;
}
