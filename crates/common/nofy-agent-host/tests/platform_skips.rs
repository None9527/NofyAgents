//! The integration test crates of this package that are compiled for Linux only,
//! and why. Each stand-in always exists and, on any other platform, prints one skip
//! line (`nofy-skip: ...`, see `nofy_test_support::capability`), so those units
//! appear in the platform's results instead of being absent from them. On Linux
//! the real crate runs and the stand-in does nothing.
//!
//! When the product has a process-tree and terminal backend on another platform,
//! make the real crate compile there, gate it on the probe, and delete its entry.
use nofy_test_support::skip_unless;

/// `tests/process_tree.rs`: the namespace and cgroup lifecycle of confined tool
/// processes. It drives `loader::process_tree::Manager`, which is built on cgroup v2
/// and namespaces and compiled for Linux only, plus `/proc`, `pidfd_open` and the
/// system C compiler.
#[test]
fn unit_process_tree_lifecycle() {
    skip_unless(
        cfg!(target_os = "linux"),
        "cgroup v2 and namespaces (tree_kill, private_mounts, process_count_limit)",
        "tests/process_tree.rs needs loader::process_tree::Manager, compiled for Linux only",
    );
}

/// `tests/process_sessions.rs`: terminal IO, durable inputs and stdio MCP through
/// real namespace processes (`process_sessions`, compiled for Linux only).
#[test]
fn unit_process_sessions_terminal_and_stdio() {
    skip_unless(
        cfg!(target_os = "linux"),
        "pseudo-terminals and namespaced processes (tree_kill, private_mounts)",
        "tests/process_sessions.rs needs loader::process_sessions, compiled for Linux only",
    );
}
