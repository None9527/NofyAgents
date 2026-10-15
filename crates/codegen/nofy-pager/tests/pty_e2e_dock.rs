//! Native PTY regression for the bottom Dock. Inference is served locally;
//! background command execution, keys, terminal resizing and stop are real.
#[path = "pty_e2e/common.rs"]
#[allow(dead_code, unused_imports)]
mod common;
use common::*;

#[cfg(unix)]
#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
#[ignore = "native PTY; set PAGER_BINARY and run with --ignored"]
async fn bottom_dock_task_open_hide_resize_and_stop() {
    let content = ContentController::start().await.expect("mock content");
    let pidfile = content.home().join("dock-task.pid");
    let args = json!({
        "command": format!("echo $$ > '{}'; echo DOCK_OUTPUT_SENTINEL; /bin/sleep 120", pidfile.display()),
        "description": "DockPTYJob",
        "is_background": true
    }).to_string();
    let _tool_turn = expect_tool_turn(&content, "dock-bg", "run_terminal_command", args);
    content.set_response("DOCK_TURN_SETTLED");
    let binary = pager_binary().unwrap();
    let mut h = PtyHarness::spawn_with_content_in_dir(
        &binary,
        DEFAULT_ROWS,
        DEFAULT_COLS,
        &content,
        &["--yolo", "--trust", "--fullscreen"],
        Some(content.home()),
    )
    .unwrap();
    h.wait_for_text(WELCOME_SCREEN_SENTINEL, WELCOME_TIMEOUT)
        .unwrap();
    h.inject_keys(b"go\r").unwrap();
    h.wait_for_text("DOCK_TURN_SETTLED", Duration::from_secs(45))
        .unwrap();
    h.wait_for_text("Tasks", Duration::from_secs(10)).unwrap();
    let screen = h.screen_contents();
    println!("Bottom Dock native PTY screen:\n{screen}");
    let task_row = screen
        .lines()
        .enumerate()
        .filter(|(_, line)| line.contains("DockPTYJob"))
        .map(|(row, _)| row)
        .last()
        .unwrap();
    assert!(
        task_row >= DEFAULT_ROWS as usize - 12,
        "not at bottom:\n{screen}"
    );
    assert_eq!(
        screen.lines().filter(|line| line.contains("Tasks")).count(),
        1,
        "{screen}"
    );

    h.inject_keys(b"\x07").unwrap();
    h.wait_for_text_absent("Tasks", Duration::from_secs(5))
        .unwrap();
    h.inject_keys(b"\x07").unwrap();
    h.wait_for_text("Tasks", Duration::from_secs(5)).unwrap();
    h.resize(16, 60).unwrap();
    h.wait_for_text("Tasks", Duration::from_secs(5)).unwrap();
    h.resize(DEFAULT_ROWS, DEFAULT_COLS).unwrap();
    h.wait_for_text("Tasks", Duration::from_secs(5)).unwrap();

    // Prompt -> conversation -> Dock header -> first task -> output viewer.
    h.inject_keys(b"\t\t\x1b[B\r").unwrap();
    h.wait_for_text_absent("Tasks", Duration::from_secs(10))
        .unwrap();
    h.wait_for_text("DOCK_OUTPUT_SENTINEL", Duration::from_secs(10))
        .unwrap();
    h.inject_keys(b"\x1b").unwrap();
    h.wait_for_text("Tasks", Duration::from_secs(5)).unwrap();
    // Viewer exits to conversation; Tab returns to the same selected Dock ID.
    h.inject_keys(b"\tx").unwrap();
    h.wait_for_text_absent("Tasks", Duration::from_secs(15))
        .unwrap();
    let pid: i32 = std::fs::read_to_string(&pidfile)
        .unwrap()
        .trim()
        .parse()
        .unwrap();
    let deadline = Instant::now() + Duration::from_secs(5);
    while unsafe { libc::kill(pid, 0) } == 0 && Instant::now() < deadline {
        h.update(Duration::from_millis(100));
    }
    assert_ne!(
        unsafe { libc::kill(pid, 0) },
        0,
        "Dock stop did not terminate task {pid}"
    );
    assert!(!h.screen_contents().contains("panicked"));
    h.quit().unwrap();
}
