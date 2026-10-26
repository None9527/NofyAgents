// Per-test-case module for the `pty_e2e` integration test crate.
#[allow(unused_imports)]
use crate::common::*;

/// `/minimal` switches the live resident session in-process and reprints its
/// conversation exactly once under scrollback-native rendering, without a new
/// welcome card. The input and next turn remain usable after the transition.
#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
#[ignore]
async fn minimal_slash_switches_from_fullscreen() {
    let content = ContentController::start().await.expect("start content");
    let sentinel = turn_sentinel(1);
    content.set_response(format!("{sentinel} fullscreen payload."));

    // Isolated project dir for the resident session and both render modes.
    let project = tempfile::tempdir().expect("create project dir");
    std::fs::create_dir_all(project.path().join(".git")).expect("create .git");

    let binary = pager_binary().expect("resolve pager binary");
    // Start fullscreen (default), standalone. Enable query responses *before*
    // the transition so the post-switch minimal probe does not silently downgrade
    // to full-height inline.
    let mut harness = PtyHarness::spawn_with_content_in_dir(
        &binary,
        DEFAULT_ROWS,
        DEFAULT_COLS,
        &content,
        &["--no-leader"],
        Some(project.path()),
    )
    .expect("spawn fullscreen pager");
    harness.set_respond_to_queries(true);
    let original_pid = harness.child_pid();

    harness
        .wait_for_text(WELCOME_SCREEN_SENTINEL, WELCOME_TIMEOUT)
        .expect("welcome text");

    // Establish a real session with content to reprint on the main screen.
    harness
        .inject_keys(format!("{PROMPT}\r").as_bytes())
        .expect("submit turn");
    harness
        .wait_for_text(&sentinel, Duration::from_secs(30))
        .expect("mock response in fullscreen");

    // Switch: `/minimal` should enter scrollback-native mode with the
    // same session. Pace keystrokes so the slash dropdown opens rather than
    // paste-coalescing, then confirm once the description row is visible.
    inject_keys_paced(&mut harness, b"/minimal");
    harness
        .wait_for_text(
            "Reopen this session in minimal (scrollback-native) mode",
            Duration::from_secs(5),
        )
        .expect("slash dropdown offers /minimal");
    harness.update(Duration::from_millis(150));
    harness.inject_keys(b"\r").expect("submit /minimal");

    // The PTY and resident session stay live; wait for minimal's idle status.
    // A `/minimal` transition shows the
    // switch-back form (`… /fullscreen to go back · /help`), not the cold-start
    // `minimal · /help` sentinel alone.
    harness
        .wait_for_text(MINIMAL_SWITCH_BACK_IDLE_SENTINEL, Duration::from_secs(45))
        .unwrap_or_else(|e| {
            panic!(
                "/minimal did not switch session to minimal mode: {e}\nscreen:\n{}",
                harness.screen_contents()
            )
        });
    harness
        .wait_for_full_text(&sentinel, Duration::from_secs(30))
        .unwrap_or_else(|e| {
            panic!(
                "prior turn must be present after /minimal switch: {e}\nfull:\n{}",
                harness.full_text()
            )
        });

    // The resident transition must not leak legacy exec/reopen chrome.
    let screen = harness.screen_contents();
    assert!(
        !screen.contains("Reopening session"),
        "main screen should be cleared on /minimal relaunch; leftover reopen text:\n{screen}"
    );
    assert!(
        screen.contains("Switched to minimal mode"),
        "mode switch is visible\n{screen}"
    );
    assert_eq!(
        harness.child_pid(),
        original_pid,
        "resident mode switch keeps the process"
    );
    assert_eq!(
        harness.full_text().matches(&sentinel).count(),
        1,
        "old response is reprinted exactly once"
    );
    assert!(
        !screen.contains("Nofy Build"),
        "resident switch must not insert another welcome card\n{screen}"
    );
    const DRAFT: &str = "after-switch-draft";
    harness
        .inject_keys(DRAFT.as_bytes())
        .expect("type after switch");
    harness
        .wait_for_text(DRAFT, Duration::from_secs(10))
        .expect("draft remains visible in minimal");
    harness
        .inject_keys(b"-edited")
        .expect("edit draft after switch");
    harness
        .wait_for_text(&format!("{DRAFT}-edited"), Duration::from_secs(10))
        .expect("draft remains editable");
    let next = turn_sentinel(2);
    content.set_response(format!("{next} minimal next turn."));
    harness.inject_keys(b"\r").expect("submit preserved draft");
    harness
        .wait_for_full_text(&next, Duration::from_secs(30))
        .expect("same session answers next turn in minimal");

    assert!(
        !harness.contains_text("panicked"),
        "pager panicked after /minimal\nscreen:\n{}",
        harness.screen_contents()
    );

    quit_minimal(&mut harness);
}
