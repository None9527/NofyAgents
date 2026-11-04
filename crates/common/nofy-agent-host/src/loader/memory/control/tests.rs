use super::*;
#[cfg(target_os = "linux")]
mod fork;
fn control(root: &Path) -> MemoryControl {
    let loader = storage::directory(&root.join("loader")).unwrap();
    MemoryControl::open(&loader).unwrap()
}
fn key() -> String {
    storage::hash(b"declared-memory")
}
fn command(id: &str, revision: u64, open: bool) -> MemoryCommand {
    MemoryCommand {
        command_id: id.into(),
        expected_revision: revision,
        open,
    }
}

#[test]
fn close_is_real_admission_not_cache_eviction_and_busy_does_not_commit() {
    let temp = tempfile::tempdir().unwrap();
    let control = control(temp.path());
    let key = key();
    let first = control.acquire(&key).unwrap();
    let second = control.acquire(&key).unwrap();
    let close = command("close", 0, false);
    assert!(
        control
            .change(&key, close.clone(), || panic!("must not retire live work"))
            .is_err()
    );
    assert_eq!(control.state(&key).unwrap().revision, 0);
    drop(first);
    assert!(
        control
            .change(&key, close.clone(), || panic!("second use is live"))
            .is_err()
    );
    drop(second);
    let receipt = control.change(&key, close.clone(), || Ok(())).unwrap();
    assert_eq!(receipt.revision, 1);
    assert!(!control.state(&key).unwrap().open);
    assert!(control.acquire(&key).is_err());
    let reopened = MemoryControl::open(&temp.path().join("loader")).unwrap();
    assert!(!reopened.state(&key).unwrap().open);
    assert_eq!(
        reopened
            .change(&key, close, || panic!("replay has no cache effect"))
            .unwrap()
            .revision,
        1
    );
    assert!(
        reopened
            .change(&key, command("close", 0, true), || Ok(()))
            .is_err()
    );
    assert!(
        reopened
            .change(&key, command("stale", 0, true), || Ok(()))
            .is_err()
    );
    reopened
        .change(&key, command("open", 1, true), || Ok(()))
        .unwrap();
    let _use = reopened.acquire(&key).unwrap();
    assert_eq!(
        reopened
            .change(&key, command("close", 0, false), || panic!(
                "old receipt replay"
            ))
            .unwrap()
            .revision,
        1
    );
    assert!(reopened.state(&key).unwrap().open);
    assert!(!temp.path().join("memory").exists());
}

#[test]
fn missing_closed_policy_never_resurrects_an_open_resource() {
    let temp = tempfile::tempdir().unwrap();
    let control = control(temp.path());
    let key = key();
    control
        .change(&key, command("close", 0, false), || Ok(()))
        .unwrap();
    std::fs::remove_file(control.path(&key).unwrap().join("state.json")).unwrap();
    assert!(control.acquire(&key).is_err());
    assert!(control.state(&key).is_err());
}

#[test]
fn bounded_history_cannot_reapply_an_expired_command_with_its_old_cas() {
    let temp = tempfile::tempdir().unwrap();
    let control = control(temp.path());
    let key = key();
    for index in 0..66 {
        control
            .change(
                &key,
                command(&format!("change-{index}"), index, index % 2 != 0),
                || Ok(()),
            )
            .unwrap();
    }
    assert!(
        control
            .change(&key, command("change-0", 0, false), || Ok(()))
            .is_err()
    );
    assert_eq!(control.state(&key).unwrap().revision, 66);
    assert!(control.state(&key).unwrap().open);
}

#[cfg(target_os = "linux")]
#[test]
fn actual_process_use_fences_close_and_exit_releases_only_the_lease() {
    let temp = tempfile::tempdir().unwrap();
    let control = control(temp.path());
    let mut child = std::process::Command::new(std::env::current_exe().unwrap())
        .args(["--exact", "loader::memory::control::tests::lease_child"])
        .env("NOFY_MEMORY_CONTROL_TEST_ROOT", temp.path())
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::null())
        .spawn()
        .unwrap();
    let deadline = std::time::Instant::now() + std::time::Duration::from_secs(5);
    while !temp.path().join("ready").exists() {
        assert!(child.try_wait().unwrap().is_none(), "lease child exited");
        assert!(
            std::time::Instant::now() < deadline,
            "lease child did not start"
        );
        std::thread::sleep(std::time::Duration::from_millis(5));
    }
    assert!(
        control
            .change(&key(), command("close", 0, false), || Ok(()))
            .is_err()
    );
    child.kill().unwrap();
    child.wait().unwrap();
    control
        .change(&key(), command("close", 0, false), || Ok(()))
        .unwrap();
    assert!(!control.state(&key()).unwrap().open);
    assert!(control.acquire(&key()).is_err());
}

#[test]
fn lease_child() {
    let Some(root) = std::env::var_os("NOFY_MEMORY_CONTROL_TEST_ROOT") else {
        return;
    };
    let root = PathBuf::from(root);
    let control = control(&root);
    let _use = control.acquire(&key()).unwrap();
    std::fs::write(root.join("ready"), b"ready").unwrap();
    use std::io::Read;
    let _ = std::io::stdin().read(&mut [0]);
}
