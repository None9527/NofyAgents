//! Remote file headers belong to VS Code's current remote filesystem.
#[path = "pty_e2e/common.rs"]
#[allow(dead_code, unused_imports)]
mod common;
use common::*;

#[cfg(unix)]
#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
#[ignore = "native PTY; set PAGER_BINARY and run with --ignored"]
async fn vscode_ssh_image_header_exposes_absolute_path_without_external_url() {
    let content = ContentController::start().await.unwrap();
    let path = content.home().join("ida_shot.png");
    image::RgbImage::new(1, 1).save(&path).unwrap();
    let path = dunce::canonicalize(path).unwrap();
    let full_path = path.to_string_lossy().into_owned();
    let _turn = seed_read_file_tool_call(&content, &path);
    seed_ui_config(&content, "group_tool_verbs = false");
    let env = [
        ("TERM_PROGRAM", "vscode"),
        ("SSH_CONNECTION", "127.0.0.1 1234 127.0.0.1 22"),
        (
            "VSCODE_GIT_ASKPASS_MAIN",
            "/home/none/.vscode-server/extensions/git/dist/askpass-main.js",
        ),
    ];
    let mut h = PtyHarness::spawn_with_content_env_in_dir(
        &pager_binary().unwrap(),
        DEFAULT_ROWS,
        180,
        &content,
        &["--trust", "--fullscreen"],
        &env,
        Some(content.home()),
    )
    .unwrap();
    h.wait_for_text(WELCOME_SCREEN_SENTINEL, WELCOME_TIMEOUT)
        .unwrap();
    h.inject_keys(b"read the image\r").unwrap();
    h.wait_for_text(READ_HDR_SENTINEL, Duration::from_secs(45))
        .unwrap();
    h.wait_for_turn_idle(Duration::from_secs(10)).unwrap();
    let screen = h.screen_contents();
    let raw = String::from_utf8_lossy(h.raw_output()).into_owned();
    h.quit().unwrap();
    println!("VS Code SSH image header:\n{screen}");
    assert!(
        screen
            .lines()
            .any(|line| line.contains("Read ") && line.contains(&full_path)),
        "{screen}"
    );
    assert!(screen.contains("(image)"), "{screen}");
    assert!(
        !raw.contains("file://"),
        "remote files must not become external URLs"
    );
}
