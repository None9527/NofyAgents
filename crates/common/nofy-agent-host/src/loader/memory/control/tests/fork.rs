//! A fork snapshot is not a separately admitted memory operation.
use super::*;
use crate::loader::test_support::inherited_descriptors;
use crate::loader::test_support::inherited_descriptors_with;
#[test]
fn unrelated_fork_cannot_extend_a_completed_memory_operation() {
    let temp = tempfile::tempdir().unwrap();
    let control = control(temp.path());
    let key = key();
    let admitted = control.acquire(&key).unwrap();
    let _child = inherited_descriptors();
    assert!(
        control
            .change(&key, command("busy", 0, false), || Ok(()))
            .is_err()
    );
    drop(admitted);
    control
        .change(&key, command("closed", 0, false), || Ok(()))
        .unwrap();
    assert!(!control.state(&key).unwrap().open);
}

#[test]
fn child_dropping_an_inherited_memory_guard_cannot_unlock_its_live_parent() {
    let temp = tempfile::tempdir().unwrap();
    let control = control(temp.path());
    let key = key();
    let lease = control.acquire(&key).unwrap();
    let child = inherited_descriptors_with(|| {
        // Only the forked copy is closed. Its original frame ends via _exit.
        drop(unsafe { std::ptr::read(&lease) });
    });
    assert!(
        control
            .change(&key, command("must-stay-busy", 0, false), || Ok(()))
            .is_err()
    );
    drop(lease);
    control
        .change(&key, command("closed", 0, false), || Ok(()))
        .unwrap();
    drop(child);
}
#[test]
fn unrelated_fork_cannot_extend_a_completed_memory_management_fence() {
    let temp = tempfile::tempdir().unwrap();
    let control = control(temp.path());
    let key = key();
    let mut child = None;
    control
        .change(&key, command("closed", 0, false), || {
            child = Some(inherited_descriptors());
            Ok(())
        })
        .unwrap();
    control
        .change(&key, command("opened", 1, true), || Ok(()))
        .unwrap();
    assert!(control.state(&key).unwrap().open);
    drop(child);
}
