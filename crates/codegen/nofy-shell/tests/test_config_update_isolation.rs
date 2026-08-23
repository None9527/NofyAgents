//! Regression test: `update_config` must not leak values from
//! `managed_config.toml` or `requirements.toml` into the user's `config.toml`.
//!
//! Bug: `update_config` used `load_effective_config()` (which merges all config
//! layers) to populate the `Config` struct, then `save_config` wrote that merged
//! result back to the user's `config.toml`. If `requirements.toml` contained
//! `show_tips = false`, any unrelated config write (theme change, model
//! preference, yolo toggle) would permanently poison the user's config.

use std::fs;
use std::path::PathBuf;
use std::sync::OnceLock;

use serial_test::serial;

/// Shared temp directory that lives for the entire test binary.
/// All tests share this as NOFY_HOME (the `OnceLock` in nofy-config
/// only allows one value per process).
fn test_home() -> &'static PathBuf {
    static HOME: OnceLock<PathBuf> = OnceLock::new();
    HOME.get_or_init(|| {
        let dir = tempfile::TempDir::new().unwrap();
        // Keep so the directory survives the entire test process.
        let path = dir.keep();
        // SAFETY: called once at init before other threads touch this var.
        unsafe { std::env::set_var("NOFY_HOME", &path) };
        path
    })
}

/// Clean up config files between tests.
fn reset_config_files(home: &std::path::Path) {
    let _ = fs::remove_file(home.join("config.toml"));
    let _ = fs::remove_file(home.join("requirements.toml"));
    let _ = fs::remove_file(home.join("managed_config.toml"));
}

#[tokio::test]
#[serial]
async fn update_config_does_not_leak_requirements_into_user_config() {
    let home = test_home();
    reset_config_files(home);

    // --- Arrange ---

    // User's config.toml: show_tips = true
    fs::write(home.join("config.toml"), "[cli]\nshow_tips = true\n").unwrap();

    // Enterprise requirements.toml overrides show_tips to false
    fs::write(home.join("requirements.toml"), "[cli]\nshow_tips = false\n").unwrap();

    // Sanity-check: effective config should show show_tips = false
    // (requirements wins over user config).
    let effective = nofy_shell::config::load_effective_config().unwrap();
    let effective_cfg = nofy_shell::util::config::load_config_from_toml(&effective);
    assert_eq!(
        effective_cfg.cli.show_tips,
        Some(false),
        "precondition: effective config should merge requirements (show_tips=false)"
    );

    // --- Act ---
    // Simulate an unrelated config write (e.g. persisting a model preference).
    nofy_shell::util::config::update_config(|cfg| {
        cfg.models.default = Some("test-model".to_string());
    })
    .await
    .expect("update_config should succeed");

    // --- Assert ---
    // Read the user's config.toml back from disk (raw, no merge).
    let raw = fs::read_to_string(home.join("config.toml")).unwrap();
    let user_toml: toml::Value = toml::from_str(&raw).unwrap();
    let user_cfg = nofy_shell::util::config::load_config_from_toml(&user_toml);

    assert_eq!(
        user_cfg.cli.show_tips,
        Some(true),
        "BUG REPRODUCED: show_tips in user config.toml was overwritten by \
         requirements.toml value. The raw file contents:\n{raw}"
    );

    // Also verify the unrelated write succeeded.
    assert_eq!(user_cfg.models.default.as_deref(), Some("test-model"));
}

#[tokio::test]
#[serial]
async fn update_config_preserves_none_when_only_requirements_sets_value() {
    let home = test_home();
    reset_config_files(home);

    // User config has no show_tips field at all
    fs::write(home.join("config.toml"), "[ui]\nyolo = false\n").unwrap();

    // requirements.toml sets show_tips = false
    fs::write(home.join("requirements.toml"), "[cli]\nshow_tips = false\n").unwrap();

    // Write an unrelated field
    nofy_shell::util::config::update_config(|cfg| {
        cfg.ui.yolo = true;
    })
    .await
    .expect("update_config should succeed");

    // Read back
    let raw = fs::read_to_string(home.join("config.toml")).unwrap();
    let user_toml: toml::Value = toml::from_str(&raw).unwrap();
    let user_cfg = nofy_shell::util::config::load_config_from_toml(&user_toml);

    assert_eq!(
        user_cfg.cli.show_tips, None,
        "show_tips should remain absent in user config — requirements.toml \
         value must not leak. Raw file:\n{raw}"
    );
}

#[tokio::test]
#[serial]
async fn update_config_does_not_leak_managed_config_values() {
    let home = test_home();
    reset_config_files(home);

    // User config has no show_tips — only a ui field
    fs::write(home.join("config.toml"), "[ui]\nyolo = false\n").unwrap();

    // managed_config.toml sets show_tips = false and worktree_type = "linked"
    fs::write(
        home.join("managed_config.toml"),
        "[cli]\nshow_tips = false\nworktree_type = \"linked\"\n",
    )
    .unwrap();

    nofy_shell::util::config::update_config(|cfg| {
        cfg.models.default = Some("test-model".to_string());
    })
    .await
    .expect("update_config should succeed");

    let raw = fs::read_to_string(home.join("config.toml")).unwrap();
    let user_toml: toml::Value = toml::from_str(&raw).unwrap();
    let user_cfg = nofy_shell::util::config::load_config_from_toml(&user_toml);

    assert_eq!(
        user_cfg.cli.show_tips, None,
        "show_tips from managed_config.toml leaked into user config. Raw:\n{raw}"
    );
    assert_eq!(
        user_cfg.cli.worktree_type, None,
        "worktree_type from managed_config.toml leaked into user config. Raw:\n{raw}"
    );
}
