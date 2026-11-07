//! A test that needs something this machine may not provide says so, out loud.
//!
//! The old way was `#[cfg(target_os = "linux")]` on the test: on the other
//! platforms the test did not exist, so a green run there said nothing about it
//! and the coverage of the platforms could not be compared. A test that goes
//! through this module exists everywhere, asks the machine what it can do, and
//! when the answer is "not this" it returns early after printing one line:
//!
//! ```text
//! nofy-skip: loader::tests::a_worker_is_confined | needs filesystem=enforced | linux-landlock on macos: filesystem is unavailable (Landlock is missing)
//! ```
//!
//! The line goes straight to the process's stderr, not through the test
//! harness's capture, so it shows in a passing run too. Count the skips of a run
//! with `grep -c 'nofy-skip:'` on its output, or set [`REPORT_ENV`] to a file
//! and every skipped test appends its line there, whichever process ran it.
//!
//! The decision is never made from the operating system's name. A caller hands
//! in a [`Probe`], the backend's own account of what it enforces here, and the
//! test is skipped only when the probe says a needed capability is not
//! [`Level::Enforced`]. Where the product itself does not exist on a platform yet
//! (so the test body cannot even compile there), use [`skip`] from a stub with
//! the reason; it prints the same line.

use nofy_isolation::{Capabilities, Capability, Level, Probe};
use serde_json::Value;
use std::io::Write;

/// Every skip line contains this, so a run's skips are counted by searching for it.
pub const SKIP_MARK: &str = "nofy-skip:";

/// When this environment variable names a file, each skipped test appends its
/// line there as well. It survives a test that runs in a child process.
pub const REPORT_ENV: &str = "NOFY_SKIP_REPORT";

/// The name of the test that is running, as the harness gave it to its thread.
fn current_test() -> String {
    std::thread::current()
        .name()
        .filter(|name| *name != "main")
        .unwrap_or("<unnamed test>")
        .to_owned()
}

fn emit(line: &str) {
    emit_to(
        line,
        std::env::var_os(REPORT_ENV)
            .as_deref()
            .map(std::path::Path::new),
    );
}

fn emit_to(line: &str, report: Option<&std::path::Path>) {
    // The standard error stream itself, not `eprintln!`: the test harness
    // captures what `eprintln!` prints and shows it only for a failed test.
    let mut stderr = std::io::stderr().lock();
    let _ = writeln!(stderr, "{line}");
    let _ = stderr.flush();
    if let Some(path) = report
        && let Ok(mut file) = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(path)
    {
        let _ = writeln!(file, "{line}");
    }
}

/// The text of a skip line. Separate from printing so the format is tested.
pub fn skip_line(test: &str, needs: &str, reason: &str) -> String {
    format!("{SKIP_MARK} {test} | needs {needs} | {reason}")
}

/// Report that the running test is skipped and why. For a test whose body cannot
/// exist on this platform; the product it drives is not built here yet.
pub fn skip(needs: &str, reason: &str) {
    emit(&skip_line(&current_test(), needs, reason));
}

/// Why `probe` does not deliver `need` at `level`, or `None` when it does.
fn shortfall(probe: &Probe, need: Capability, level: Level) -> Option<String> {
    let have = probe.capabilities.level(need);
    if have >= level {
        return None;
    }
    let note = probe
        .notes
        .get(&need)
        .map(|note| format!(" ({note})"))
        .unwrap_or_default();
    Some(format!(
        "{} on {}: {} is {}{note}",
        probe.backend,
        probe.platform,
        need.name(),
        have.name()
    ))
}

/// Whether the running test may go on. `needs` are capabilities the backend must
/// enforce at least at `level`. When one falls short the skip line is printed
/// and this returns `false`; the test returns right away.
pub fn require_level(probe: &Probe, needs: &[Capability], level: Level) -> bool {
    let missing: Vec<String> = needs
        .iter()
        .filter_map(|need| shortfall(probe, *need, level))
        .collect();
    if missing.is_empty() {
        return true;
    }
    let wanted = needs
        .iter()
        .map(|need| format!("{}={}", need.name(), level.name()))
        .collect::<Vec<_>>()
        .join(",");
    emit(&skip_line(&current_test(), &wanted, &missing.join("; ")));
    false
}

/// [`require_level`] at [`Level::Enforced`]: the protection must really be there,
/// because a test that checks it holds proves nothing against a partial one.
pub fn require_capability(probe: &Probe, needs: &[Capability]) -> bool {
    require_level(probe, needs, Level::Enforced)
}

/// For a stand-in test that holds the place of a unit which only compiles where
/// `runs_here` is true: elsewhere it prints the skip line, so the unit shows up in
/// that platform's results instead of being absent from them. Where the unit does
/// run, the real tests are in the results and this does nothing.
pub fn skip_unless(runs_here: bool, needs: &str, reason: &str) {
    if !runs_here {
        skip(needs, reason);
    }
}

/// Whether the running test may go on, given a program or file its fixture drives
/// that only some machines have (for example `/bin/sh` on Windows). Absent: the
/// skip line names it and this returns `false`.
pub fn require_program(path: &str) -> bool {
    if std::path::Path::new(path).exists() {
        return true;
    }
    emit(&skip_line(
        &current_test(),
        path,
        &format!("{path} is not installed on this machine"),
    ));
    false
}

/// A [`Probe`] rebuilt from a kernel's discovery report
/// (`development.worker_isolation`): `backend`, `platform`, a level per capability
/// name and the notes. `None` when the report is not in that shape, which a test
/// should treat as a failure, not as permission to skip.
pub fn probe_from_report(report: &Value) -> Option<Probe> {
    let backend = report.get("backend")?.as_str()?;
    let platform = report.get("platform")?.as_str()?;
    let levels = report.get("capabilities")?.as_object()?;
    let mut capabilities = Capabilities::new();
    for capability in Capability::ALL {
        let level = match levels.get(capability.name())?.as_str()? {
            "enforced" => Level::Enforced,
            "partial" => Level::Partial,
            "unavailable" => Level::Unavailable,
            _ => return None,
        };
        capabilities = capabilities.with(capability, level);
    }
    let mut probe = Probe::new(backend, platform, capabilities);
    if let Some(notes) = report.get("notes").and_then(Value::as_object) {
        for capability in Capability::ALL {
            if let Some(text) = notes.get(capability.name()).and_then(Value::as_str) {
                probe = probe.note(capability, text);
            }
        }
    }
    Some(probe)
}

/// `return` from the running test, after the skip line, unless `$probe` enforces
/// every listed capability.
///
/// ```text
/// nofy_test_support::require_capability!(&probe, Capability::Filesystem);
/// ```
#[macro_export]
macro_rules! require_capability {
    ($probe:expr, $($need:expr),+ $(,)?) => {
        if !$crate::capability::require_capability($probe, &[$($need),+]) {
            return;
        }
    };
}

/// `return` from the running test, after the skip line, unless `$path` exists.
#[macro_export]
macro_rules! require_program {
    ($path:expr) => {
        if !$crate::capability::require_program($path) {
            return;
        }
    };
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn landlock(level: Level) -> Probe {
        Probe::new(
            "linux-landlock",
            "linux",
            Capabilities::new().with(Capability::Filesystem, level),
        )
        .note(Capability::TreeKill, "one process, no descendants")
    }

    #[test]
    fn a_capability_the_backend_enforces_lets_the_test_run() {
        assert!(require_capability(
            &landlock(Level::Enforced),
            &[Capability::Filesystem]
        ));
    }

    #[test]
    fn a_missing_or_partial_capability_skips_and_names_why() {
        let probe = landlock(Level::Enforced);
        assert!(!require_capability(&probe, &[Capability::TreeKill]));
        // A partial protection is not enough for a test that checks it holds.
        assert!(!require_capability(
            &landlock(Level::Partial),
            &[Capability::Filesystem]
        ));
        assert!(require_level(
            &landlock(Level::Partial),
            &[Capability::Filesystem],
            Level::Partial
        ));
        let why = shortfall(&probe, Capability::TreeKill, Level::Enforced).unwrap();
        assert_eq!(
            why,
            "linux-landlock on linux: tree_kill is unavailable (one process, no descendants)"
        );
        assert_eq!(
            shortfall(&probe, Capability::Filesystem, Level::Enforced),
            None
        );
    }

    #[test]
    fn the_skip_line_is_one_countable_line() {
        let line = skip_line("a::test", "filesystem=enforced", "no landlock");
        assert_eq!(
            line,
            "nofy-skip: a::test | needs filesystem=enforced | no landlock"
        );
        assert!(line.contains(SKIP_MARK) && !line.contains('\n'));
    }

    #[test]
    fn a_program_that_is_not_there_skips() {
        assert!(require_program(env!("CARGO_MANIFEST_DIR")));
        assert!(!require_program("/definitely/not/installed/here"));
    }

    #[test]
    fn a_discovery_report_becomes_the_probe_it_was_made_from() {
        let report = json!({
            "backend": "linux-landlock",
            "platform": "linux",
            "capabilities": {
                "filesystem": "enforced", "protected_paths": "unavailable",
                "execute_allowlist": "enforced", "private_mounts": "unavailable",
                "network_deny": "enforced", "network_loopback_only": "unavailable",
                "process_spawn_deny": "enforced", "die_with_parent": "enforced",
                "tree_kill": "partial", "cpu_limit": "enforced",
                "memory_limit": "enforced", "process_count_limit": "unavailable"
            },
            "notes": {"tree_kill": "one process"}
        });
        let probe = probe_from_report(&report).unwrap();
        assert_eq!(probe.backend, "linux-landlock");
        assert_eq!(
            probe.capabilities.level(Capability::TreeKill),
            Level::Partial
        );
        assert_eq!(
            probe.capabilities.level(Capability::PrivateMounts),
            Level::Unavailable
        );
        assert_eq!(probe.notes[&Capability::TreeKill], "one process");
        // A report that lacks a capability, or names an unknown level, is not a probe.
        let mut missing = report.clone();
        missing["capabilities"]
            .as_object_mut()
            .unwrap()
            .remove("cpu_limit");
        assert!(probe_from_report(&missing).is_none());
        let mut unknown = report;
        unknown["capabilities"]["filesystem"] = json!("mostly");
        assert!(probe_from_report(&unknown).is_none());
    }

    #[test]
    fn a_skip_is_appended_to_the_report_file_when_one_is_named() {
        let dir = tempfile::tempdir().unwrap();
        let report = dir.path().join("skips.log");
        emit_to(&skip_line("a::one", "x=enforced", "why"), Some(&report));
        emit_to(&skip_line("a::two", "y=enforced", "why"), Some(&report));
        let text = std::fs::read_to_string(&report).unwrap();
        assert_eq!(text.lines().count(), 2);
        assert!(text.lines().all(|line| line.starts_with(SKIP_MARK)));
    }
}
