// Per-test-case module for the `pty_e2e` integration test crate.
#[allow(unused_imports)]
use crate::common::*;

/// The long-history case below is bottom anchored because history filled the
/// screen. A short conversation must remain content anchored, not acquire a
/// blank band merely because the window was resized.
#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
#[ignore]
async fn minimal_resize_short_history_stays_content_anchored() {
    let content = ContentController::start().await.expect("start content");
    const ANSWER: &str = "short-resize-answer";
    const DRAFT: &str = "short-resize-draft";
    content.set_response(ANSWER.to_string());
    let mut harness = spawn_minimal(&content);
    wait_minimal_ready(&mut harness);
    harness
        .inject_keys(format!("{PROMPT}\r").as_bytes())
        .expect("submit prompt");
    harness
        .wait_for_text(ANSWER, Duration::from_secs(30))
        .expect("short answer rendered");
    harness
        .wait_for_text(MINIMAL_IDLE_SENTINEL, Duration::from_secs(30))
        .expect("turn completed");
    harness.inject_keys(DRAFT.as_bytes()).expect("type draft");
    for (rows, cols) in [(30, 80), (40, 110)] {
        harness.resize(rows, cols).expect("resize");
        harness.update(Duration::from_millis(800));
        harness
            .wait_for_text(DRAFT, Duration::from_secs(10))
            .expect("draft remains visible");
        let screen = harness.screen_contents();
        let answer_row = screen
            .lines()
            .position(|line| line.contains(ANSWER))
            .expect("short committed answer must remain on screen");
        let (cursor_row, _) = harness.cursor_position();
        assert!(
            answer_row < usize::from(cursor_row),
            "prompt follows committed content\n{screen}"
        );
        // The welcome card itself can reflow into more rows on narrowing, so
        // absolute cursor height is not a content-anchoring invariant.
        assert!(
            usize::from(cursor_row) - answer_row <= 5,
            "short answer must stay adjacent to its prompt after resize\n{screen}"
        );
        let last_non_blank = screen
            .lines()
            .enumerate()
            .filter(|(_, line)| !line.trim().is_empty())
            .map(|(row, _)| row)
            .last()
            .unwrap();
        assert!(
            last_non_blank + 2 < usize::from(rows),
            "short conversation must leave blank space below its live band\n{screen}"
        );
        assert_eq!(
            harness.full_text().matches(ANSWER).count(),
            1,
            "resize never re-emits short history"
        );
    }
    quit_minimal(&mut harness);
}

/// Resize hazard: minimal mode uses only the built-in viewport
/// machinery and never re-emits committed history (`resize_purge_rerender` /
/// `emit_to_scrollback` are forbidden). The terminal reflows committed
/// scrollback natively on resize. This commits a tall response into native
/// scrollback, resizes the terminal smaller (rows AND cols), and asserts the
/// committed content survives (not wiped, not double-printed), the pager does
/// not panic or exit, and the prompt is still functional afterwards.
#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
#[ignore]
async fn minimal_resize_preserves_committed_scrollback() {
    let content = ContentController::start().await.expect("start content");
    // Sentinel on the first rendered row; 80 code-block rows >> screen, so the
    // head scrolls into native scrollback once the block commits. (Prose would
    // markdown-reflow into one short on-screen paragraph — see `tall_response`.)
    content.set_response(tall_response(MOCK_RESPONSE_SENTINEL, 80));

    let mut harness = spawn_minimal(&content);
    wait_minimal_ready(&mut harness);
    harness
        .inject_keys(format!("{PROMPT}\r").as_bytes())
        .expect("submit prompt");

    // Precondition: the committed head must be in native scrollback first.
    let deadline = Instant::now() + Duration::from_secs(40);
    while Instant::now() < deadline && !harness.scrollback_text().contains(MOCK_RESPONSE_SENTINEL) {
        harness.update(Duration::from_millis(100));
    }
    assert!(
        harness.scrollback_text().contains(MOCK_RESPONSE_SENTINEL),
        "precondition: committed block must reach scrollback before the resize\nscrollback:\n{}",
        harness.scrollback_text()
    );
    harness
        .wait_for_text(MINIMAL_IDLE_SENTINEL, Duration::from_secs(30))
        .expect("first turn completes before resizing");
    let committed_count = harness.full_text().matches(MOCK_RESPONSE_SENTINEL).count();
    assert_eq!(committed_count, 1, "precondition: one committed response");
    // Keep a real draft live through both size changes. A misplaced viewport
    // can preserve old history while silently hiding or dropping prompt input.
    const DRAFT: &str = "resize-draft-still-editable";
    harness.inject_keys(DRAFT.as_bytes()).expect("type draft");
    harness
        .wait_for_text(DRAFT, Duration::from_secs(10))
        .expect("draft is visible before resize");

    // Resize smaller in both dimensions. The terminal reflows committed history
    // natively; minimal must neither reprint (double-print) nor wipe it.
    harness.resize(30, 80).expect("resize smaller");
    harness.update(Duration::from_millis(800));

    assert!(
        harness.is_running().expect("poll pager liveness"),
        "pager exited during resize\nscreen:\n{}",
        harness.screen_contents()
    );
    assert!(
        !harness.contains_text("panicked"),
        "pager panicked after resize\nscreen:\n{}",
        harness.screen_contents()
    );
    assert!(
        harness.contains_full_text(MOCK_RESPONSE_SENTINEL),
        "committed content must survive the resize reflow\nfull:\n{}",
        harness.full_text()
    );
    assert_eq!(
        harness.full_text().matches(MOCK_RESPONSE_SENTINEL).count(),
        committed_count,
        "shrink must not re-emit committed history"
    );
    harness
        .wait_for_text(DRAFT, Duration::from_secs(10))
        .expect("draft survives shrink");
    let (row, _) = harness.cursor_position();
    assert!(
        (24..30).contains(&row),
        "long-history prompt must stay in the bottom live band after shrink: row={row}\nscreen:\n{}",
        harness.screen_contents()
    );

    harness.resize(40, 110).expect("resize larger again");
    harness.update(Duration::from_millis(800));
    harness
        .wait_for_text(DRAFT, Duration::from_secs(10))
        .expect("draft survives grow");
    let (row, _) = harness.cursor_position();
    assert!(
        (34..40).contains(&row),
        "long-history prompt must stay in the bottom live band after grow: row={row}\nscreen:\n{}",
        harness.screen_contents()
    );
    assert_eq!(
        harness.full_text().matches(MOCK_RESPONSE_SENTINEL).count(),
        committed_count,
        "grow must preserve history without re-emitting it"
    );

    // The prompt is still functional: a second turn streams after the resize.
    content.set_response(format!("{} after resize.", turn_sentinel(2)));
    harness
        .inject_keys(b"-submitted\r")
        .expect("submit a second turn after resize");
    harness
        .wait_for_full_text(&turn_sentinel(2), Duration::from_secs(30))
        .expect("second turn streams after the resize");
    assert!(
        harness.contains_full_text(&format!("{DRAFT}-submitted")),
        "preserved draft remains editable and is submitted after resizing"
    );

    quit_minimal(&mut harness);
}
