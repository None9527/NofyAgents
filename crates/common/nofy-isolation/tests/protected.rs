//! Paths that stay unwritable inside a writable root: the vocabulary every
//! backend shares, and the runner-failure signature.
use nofy_isolation::*;
use std::{collections::BTreeSet, path::PathBuf};

fn writable(root: &str) -> Confinement {
    Confinement {
        filesystem: Some(Filesystem {
            read_write: vec![root.into()],
            ..Filesystem::default()
        }),
        ..Confinement::default()
    }
}

#[test]
fn protecting_paths_adds_a_requirement_only_when_there_are_any() {
    let plain = writable("/work");
    assert!(
        !plain
            .requirements()
            .iter()
            .any(|r| r.capability == Capability::ProtectedPaths)
    );
    let mut protected = writable("/work");
    protected.filesystem.as_mut().unwrap().protect_mandatory();
    let needs: Vec<_> = protected
        .requirements()
        .into_iter()
        .map(|r| r.capability)
        .collect();
    assert!(needs.contains(&Capability::Filesystem));
    assert!(needs.contains(&Capability::ProtectedPaths));
}

#[test]
fn the_mandatory_list_covers_what_runs_outside_the_confinement_later() {
    let mut files = Filesystem {
        read_write: vec!["/work".into(), "/other".into()],
        ..Filesystem::default()
    };
    files.protect_mandatory();
    for root in ["/work", "/other"] {
        for relative in [
            ".git/hooks",
            ".git/config",
            ".bashrc",
            ".zshrc",
            ".vscode",
            ".idea",
        ] {
            let path: PathBuf = [root, relative].iter().collect();
            assert!(files.protected.contains(&path), "{path:?}");
        }
    }
    // Idempotent: asking twice must not repeat entries.
    let before = files.protected.len();
    files.protect_mandatory();
    assert_eq!(files.protected.len(), before);
    assert_eq!(before, 2 * MANDATORY_PROTECTED.len());
}

#[test]
fn a_backend_without_the_capability_refuses_a_confinement_that_protects_paths() {
    let mut policy = writable("/work");
    policy.filesystem.as_mut().unwrap().protect_mandatory();
    let landlock_like = Probe::new(
        "landlock-like",
        "linux",
        Capabilities::new().with(Capability::Filesystem, Level::Enforced),
    )
    .note(
        Capability::ProtectedPaths,
        "an exception inside a granted root cannot be expressed",
    );
    let refusal = admit(&landlock_like, &policy).unwrap_err();
    assert_eq!(refusal.shortfalls.len(), 1);
    assert_eq!(refusal.shortfalls[0].capability, Capability::ProtectedPaths);
    assert!(refusal.to_string().contains("protected_paths"));
    // Accepting partial enforcement never excuses an unavailable capability.
    policy.accept_partial = BTreeSet::from([Capability::ProtectedPaths]);
    assert!(admit(&landlock_like, &policy).is_err());
}

#[test]
fn a_runner_failure_needs_both_the_exit_status_and_the_marker() {
    let said = format!("note\n{RUNNER_FAILURE_MARKER}: Landlock is unavailable\nmore\n");
    assert_eq!(
        runner_failure(Some(RUNNER_FAILURE_EXIT_CODE), said.as_bytes()).as_deref(),
        Some("required module isolation or runtime launch failed: Landlock is unavailable")
    );
    // The command exited with the same number on its own: not the runner's failure.
    assert_eq!(
        runner_failure(Some(RUNNER_FAILURE_EXIT_CODE), b"tests failed\n"),
        None
    );
    // The marker without the status: a command that merely printed it.
    assert_eq!(runner_failure(Some(1), said.as_bytes()), None);
    assert_eq!(runner_failure(None, said.as_bytes()), None);
}

#[test]
fn a_runner_cannot_make_the_caller_carry_unbounded_text() {
    let long = format!("{RUNNER_FAILURE_MARKER} {}", "x".repeat(10_000));
    let line = runner_failure(Some(RUNNER_FAILURE_EXIT_CODE), long.as_bytes()).unwrap();
    assert_eq!(line.chars().count(), 300);
}
