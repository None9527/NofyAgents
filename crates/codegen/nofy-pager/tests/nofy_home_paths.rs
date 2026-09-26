//! `NOFY_HOME` override tests in an isolated binary so `nofy_home()`'s
//! process-wide `OnceLock` initializes from the overridden env var.

use std::path::PathBuf;

#[test]
#[serial_test::serial(NOFY_HOME)]
fn nofy_home_override_path_helpers() {
    let tmp = tempfile::tempdir().expect("tempdir");
    let nofy_home = tmp.path().to_path_buf();
    unsafe {
        std::env::set_var("NOFY_HOME", &nofy_home);
    }

    assert_eq!(
        nofy_pager::util::pager_toml_path(),
        nofy_home.join("pager.toml")
    );
    assert_eq!(nofy_pager::util::display_nofy_home_prefix(), "$NOFY_HOME");
    assert_eq!(
        nofy_pager::util::display_user_nofy_path("config.toml"),
        "$NOFY_HOME/config.toml"
    );

    let memory_path = nofy_home.join("memory/MEMORY.md");
    assert_eq!(
        nofy_pager::util::abbreviate_path(&memory_path.display().to_string()),
        "$NOFY_HOME/memory/MEMORY.md"
    );

    // Copy-toast paths follow the same abbreviation convention, so a custom
    // $NOFY_HOME outside $HOME still displays short.
    assert_eq!(
        nofy_pager::clipboard::display_copy_path(&nofy_home.join("last-copy.txt")),
        "$NOFY_HOME/last-copy.txt"
    );

    assert!(nofy_pager::util::is_under_user_nofy_home(&memory_path));
    assert!(!nofy_pager::util::is_under_user_nofy_home(
        PathBuf::from("/tmp/other").as_path()
    ));
}

/// Isolated because `nofy_home()`'s `OnceLock` is already initialized by the
/// time the shared lib-test binary reaches a case like this.
#[test]
#[serial_test::serial(NOFY_HOME)]
fn disk_usage_run_creates_no_nofy_home() {
    let tmp = tempfile::tempdir().expect("tempdir");
    let ghost = tmp.path().join("ghost-home");
    unsafe {
        std::env::set_var("NOFY_HOME", &ghost);
    }

    for json in [false, true] {
        nofy_pager::disk_usage_cmd::run(nofy_pager::disk_usage_cmd::DiskUsageArgs { json })
            .expect("a missing home is not an error");
        assert!(
            !ghost.exists(),
            "nofy du must not create the home it reports on (json={json})"
        );
    }
}
