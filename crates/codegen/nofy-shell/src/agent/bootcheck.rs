//! Startup health check (FR1.16, batch V): boot runs a CHECKLIST and the
//! verdict is fail-loud — any failed item blocks boot before the agent
//! serves anything. All POLICY (items, results, verdict fold) stays in
//! `nofy_runtimecore::bootcheck`; this module maps the shell's real state
//! onto the checklist.
//!
//! Items deliberately NOT checked yet (no real subject to verify):
//! - `RuntimeReachable` — the sanitized build has no cheap runtime probe;
//! - `EnvSnapshotPresent` — the spawn-env seam has not landed.
//! They join the checklist when their seams do; a checklist that checked
//! nothing would prove nothing, and padding it would be theater.

use nofy_runtimecore::bootcheck::{verdict, BootVerdict, CheckItem, CheckResult};
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
        (CheckItem::PersistenceWritable, check_persistence_writable(home)),
        (CheckItem::SessionStoreReadable, check_session_store_readable(home)),
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

    #[test]
    fn healthy_home_passes_the_gate() {
        let dir = tempfile::tempdir().unwrap();
        std::fs::create_dir_all(dir.path().join("sessions")).unwrap();
        assert_eq!(boot_gate(dir.path()), BootVerdict::Go);
    }

    #[test]
    fn fresh_home_without_sessions_is_not_a_failure() {
        // A missing sessions dir is first boot, not corruption.
        let dir = tempfile::tempdir().unwrap();
        assert_eq!(boot_gate(dir.path()), BootVerdict::Go);
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
            BootVerdict::Blocked { failed: vec![CheckItem::PersistenceWritable] },
            "an unwritable state dir must block boot, never limp on"
        );
    }

    #[test]
    fn unreadable_sessions_dir_blocks_boot() {
        let dir = tempfile::tempdir().unwrap();
        let sessions = dir.path().join("sessions");
        std::fs::create_dir_all(&sessions).unwrap();
        std::fs::set_permissions(&sessions, std::os::unix::fs::PermissionsExt::from_mode(0o000))
            .unwrap();
        let verdict = boot_gate(dir.path());
        assert_eq!(
            verdict,
            BootVerdict::Blocked { failed: vec![CheckItem::SessionStoreReadable] },
            "a present-but-unreadable store must block boot"
        );
        // restore so tempdir cleanup succeeds
        std::fs::set_permissions(&sessions, std::os::unix::fs::PermissionsExt::from_mode(0o755))
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
                CheckItem::ClockMonotonic,
            ],
            "the checklist is the contract; items never silently drop"
        );
    }
}
