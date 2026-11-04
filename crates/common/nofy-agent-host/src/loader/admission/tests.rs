use super::*;
use crate::loader::test_support::inherited_descriptors;
use crate::loader::test_support::inherited_descriptors_with;
fn setup() -> (tempfile::TempDir, PathBuf, CommitFence) {
    let temp = tempfile::tempdir().unwrap();
    let root = storage::directory(&temp.path().join("loader")).unwrap();
    let fence = CommitFence::open(&root).unwrap();
    (temp, root, fence)
}
#[test]
fn unrelated_fork_does_not_extend_a_finished_commit_reader() {
    let (_temp, _root, fence) = setup();
    let lease = fence.shared().unwrap();
    let _child = inherited_descriptors();
    assert!(fence.exclusive().is_err());
    drop(lease);
    fence.exclusive().unwrap();
}
#[test]
fn unrelated_fork_does_not_extend_a_finished_commit_writer() {
    let (_temp, _root, fence) = setup();
    let lease = fence.exclusive().unwrap();
    let _child = inherited_descriptors();
    assert!(fence.shared().is_err());
    drop(lease);
    fence.shared().unwrap();
}
#[test]
fn unrelated_fork_does_not_extend_a_finished_catalog_transaction() {
    let (_temp, root, fence) = setup();
    let catalog = storage::directory(&root.join("catalog")).unwrap();
    let lease = storage::lock(&catalog).unwrap();
    let _child = inherited_descriptors();
    assert!(fence.exclusive().is_err());
    drop(lease);
    let _next = storage::lock(&catalog).unwrap();
}
#[test]
fn actual_work_lease_still_survives_parent_descriptor_close() {
    const PROBE: &str = "NOFY_ACTUAL_WORK_LEASE_PROBE";
    if std::env::var(PROBE).as_deref() != Ok("owned-probe-v1") {
        // Other concurrent fork tests legitimately inherit every currently
        // open work lease. Create this probe's file only after exec, so its
        // final release assertion has an exact, known set of inheritors.
        let output = std::process::Command::new(std::env::current_exe().unwrap())
            .args([
                "--exact",
                "loader::admission::tests::actual_work_lease_still_survives_parent_descriptor_close",
                "--nocapture",
            ])
            .env(PROBE, "owned-probe-v1")
            .stdin(std::process::Stdio::null())
            .output()
            .unwrap();
        assert!(
            output.status.success(),
            "{}\n{}",
            String::from_utf8_lossy(&output.stdout),
            String::from_utf8_lossy(&output.stderr)
        );
        return;
    }
    let (_temp, root, _fence) = setup();
    let path = root.join("actual-work.lock");
    storage::atomic(&path, b"", 0o600, false).unwrap();
    let lease = lifecycle::shared_file(&path).unwrap();
    let child = inherited_descriptors();
    let other_inheritor = inherited_descriptors();
    drop(lease);
    assert!(lifecycle::maintenance_file(&path).is_err());
    drop(child);
    // Any surviving inheritor must keep actual work fenced, even when it is
    // unrelated to the operation. Do not replace this File with unlock-on-drop.
    assert!(lifecycle::maintenance_file(&path).is_err());
    drop(other_inheritor);
    lifecycle::maintenance_file(&path).unwrap();
}

#[test]
fn child_drop_cannot_unlock_a_live_parent_commit() {
    let (_temp, _root, fence) = setup();
    let lease = fence.shared().unwrap();
    let child = inherited_descriptors_with(|| drop(unsafe { std::ptr::read(&lease) }));
    assert!(fence.exclusive().is_err());
    drop(lease);
    fence.exclusive().unwrap();
    drop(child);
}
#[test]
fn child_drop_cannot_unlock_a_live_parent_catalog_transaction() {
    let (_temp, root, _fence) = setup();
    let catalog = storage::directory(&root.join("catalog")).unwrap();
    let lease = storage::lock(&catalog).unwrap();
    let child = inherited_descriptors_with(|| drop(unsafe { std::ptr::read(&lease) }));
    assert!(storage::lock(&catalog).is_err());
    drop(lease);
    storage::lock(&catalog).unwrap();
    drop(child);
}
