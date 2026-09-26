//! Startup health check (FR1.16, batch V): boot runs a CHECKLIST and the
//! verdict is fail-loud — any failed item blocks boot before the agent
//! serves anything. All POLICY (items, results, verdict fold) stays in
//! `nofy_runtimecore::bootcheck`; this module maps the shell's real state
//! onto the checklist.
//!
//! `EnvSnapshotPresent` checks the session-env snapshot persisted by
//! `crate::session::env_capture` (batch W): missing = nothing captured
//! yet (Degraded, never blocks a fresh boot); present-but-corrupt =
//! Failed. One item remains deliberately unchecked (no real subject):
//! `RuntimeReachable` — the sanitized build has no cheap runtime probe.
//! A checklist that checked nothing would prove nothing, and padding it
//! would be theater.

use nofy_runtimecore::bootcheck::{BootVerdict, CheckItem, CheckResult, verdict};
use std::path::Path;

/// PersistenceWritable: a probe file must write and delete under the home.
fn check_persistence_writable(home: &Path) -> CheckResult {
    let probe = home.join(".bootcheck_probe");
    match std::fs::write(&probe, b"probe") {
        Ok(()) => {
            let _ = std::fs::remove_file(&probe);
            CheckResult::Ok
        }
        Err(_) => CheckResult::Failed,
    }
}

/// SessionStoreReadable: a MISSING sessions dir is a fresh state (Ok);
/// a present-but-unreadable one is Failed.
fn check_session_store_readable(home: &Path) -> CheckResult {
    match std::fs::read_dir(home.join("sessions")) {
        Ok(_) => CheckResult::Ok,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => CheckResult::Ok,
        Err(_) => CheckResult::Failed,
    }
}

/// EnvSnapshotPresent (W wiring): a MISSING snapshot means nothing was
/// captured yet — Degraded, never a fresh-boot blocker. A present file
/// must reparse through the core dump; corruption is Failed.
fn check_env_snapshot_present(home: &Path) -> CheckResult {
    let path = home.join(crate::session::env_capture::SNAPSHOT_FILE_NAME);
    match std::fs::read_to_string(&path) {
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => CheckResult::Degraded,
        Err(_) => CheckResult::Failed,
        Ok(text) => match nofy_runtimecore::envsnapshot::parse_dump(&text) {
            Ok(_) => CheckResult::Ok,
            Err(_) => CheckResult::Failed,
        },
    }
}

/// ClockMonotonic: two instants must never go backwards.
fn check_clock_monotonic() -> CheckResult {
    let a = std::time::Instant::now();
    let b = std::time::Instant::now();
    if b >= a {
        CheckResult::Ok
    } else {
        CheckResult::Failed
    }
}

/// Run the startup checklist against a shell home. Pure over the given
/// path (tests drive tempdirs; production passes `nofy_home()`).
pub fn run_checks(home: &Path) -> Vec<(CheckItem, CheckResult)> {
    vec![
        (
            CheckItem::PersistenceWritable,
            check_persistence_writable(home),
        ),
        (
            CheckItem::SessionStoreReadable,
            check_session_store_readable(home),
        ),
        (
            CheckItem::EnvSnapshotPresent,
            check_env_snapshot_present(home),
        ),
        (CheckItem::ClockMonotonic, check_clock_monotonic()),
    ]
}

/// The boot gate: core verdict over the shell checklist.
pub fn boot_gate(home: &Path) -> BootVerdict {
    verdict(&run_checks(home))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn write_valid_snapshot(home: &std::path::Path) {
        std::fs::write(home.join("env_snapshot"), "A=1\nPATH=/bin\n").unwrap();
    }

    #[test]
    fn healthy_home_passes_the_gate() {
        let dir = tempfile::tempdir().unwrap();
        std::fs::create_dir_all(dir.path().join("sessions")).unwrap();
        write_valid_snapshot(dir.path());
        assert_eq!(boot_gate(dir.path()), BootVerdict::Go);
    }

    #[test]
    fn fresh_home_is_degraded_never_blocked() {
        // A missing sessions dir is first boot, not corruption; a missing
        // snapshot means nothing was captured yet — degraded, not failed.
        let dir = tempfile::tempdir().unwrap();
        assert_eq!(
            boot_gate(dir.path()),
            BootVerdict::GoDegraded {
                degraded: vec![CheckItem::EnvSnapshotPresent]
            },
            "a fresh boot warns, never blocks"
        );
    }

    #[test]
    fn corrupt_snapshot_blocks_boot() {
        let dir = tempfile::tempdir().unwrap();
        std::fs::write(dir.path().join("env_snapshot"), "NOT A VALID DUMP LINE\n").unwrap();
        let verdict = boot_gate(dir.path());
        assert_eq!(
            verdict,
            BootVerdict::Blocked {
                failed: vec![CheckItem::EnvSnapshotPresent]
            },
            "a snapshot that fails the core parse is an integrity violation"
        );
    }

    #[test]
    fn unwritable_home_blocks_boot() {
        let dir = tempfile::tempdir().unwrap();
        let mut perms = std::fs::metadata(dir.path()).unwrap().permissions();
        perms.set_readonly(true);
        std::fs::set_permissions(dir.path(), perms).unwrap();
        let verdict = boot_gate(dir.path());
        assert_eq!(
            verdict,
            BootVerdict::Blocked {
                failed: vec![CheckItem::PersistenceWritable]
            },
            "an unwritable state dir must block boot, never limp on"
        );
    }

    #[test]
    fn unreadable_sessions_dir_blocks_boot() {
        let dir = tempfile::tempdir().unwrap();
        let sessions = dir.path().join("sessions");
        std::fs::create_dir_all(&sessions).unwrap();
        std::fs::set_permissions(
            &sessions,
            std::os::unix::fs::PermissionsExt::from_mode(0o000),
        )
        .unwrap();
        let verdict = boot_gate(dir.path());
        assert_eq!(
            verdict,
            BootVerdict::Blocked {
                failed: vec![CheckItem::SessionStoreReadable]
            },
            "a present-but-unreadable store must block boot"
        );
        // restore so tempdir cleanup succeeds
        std::fs::set_permissions(
            &sessions,
            std::os::unix::fs::PermissionsExt::from_mode(0o755),
        )
        .unwrap();
    }

    #[test]
    fn checklist_reports_every_item_in_order() {
        let dir = tempfile::tempdir().unwrap();
        let checks = run_checks(dir.path());
        let items: Vec<CheckItem> = checks.iter().map(|(i, _)| *i).collect();
        assert_eq!(
            items,
            vec![
                CheckItem::PersistenceWritable,
                CheckItem::SessionStoreReadable,
                CheckItem::EnvSnapshotPresent,
                CheckItem::ClockMonotonic,
            ],
            "the checklist is the contract; items never silently drop"
        );
    }
}
