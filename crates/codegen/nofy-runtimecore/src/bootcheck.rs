//! BOOT self-check session (FR1.16, OC-F32): an agent-driven startup
//! health check.
//!
//! Boot runs a CHECKLIST; every item reports Ok / Degraded / Failed.
//! The verdict is fail-loud: ANY failed item blocks boot (the agent
//! then drives diagnosis), degraded items warn but never block, and an
//! empty checklist is itself a failure — a boot that checks nothing
//! proves nothing.

/// One checklist item id (stable, machine-readable).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CheckItem {
    RuntimeReachable,
    PersistenceWritable,
    EnvSnapshotPresent,
    SessionStoreReadable,
    ClockMonotonic,
}

/// One check result.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CheckResult {
    Ok,
    /// Warn, never block.
    Degraded,
    /// Block boot.
    Failed,
}

/// The overall boot verdict.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum BootVerdict {
    Go,
    /// Boot proceeds with warnings listed.
    GoDegraded {
        degraded: Vec<CheckItem>,
    },
    /// Boot is blocked; failed items drive the diagnosis session.
    Blocked {
        failed: Vec<CheckItem>,
    },
}

/// Evaluate the checklist. Deterministic: items report in enum order.
pub fn verdict(results: &[(CheckItem, CheckResult)]) -> BootVerdict {
    if results.is_empty() {
        return BootVerdict::Blocked { failed: vec![] };
    }
    let mut failed = Vec::new();
    let mut degraded = Vec::new();
    for (item, result) in results {
        match result {
            CheckResult::Ok => {}
            CheckResult::Degraded => degraded.push(*item),
            CheckResult::Failed => failed.push(*item),
        }
    }
    if !failed.is_empty() {
        BootVerdict::Blocked { failed }
    } else if !degraded.is_empty() {
        BootVerdict::GoDegraded { degraded }
    } else {
        BootVerdict::Go
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn healthy() -> Vec<(CheckItem, CheckResult)> {
        vec![
            (CheckItem::RuntimeReachable, CheckResult::Ok),
            (CheckItem::PersistenceWritable, CheckResult::Ok),
            (CheckItem::EnvSnapshotPresent, CheckResult::Ok),
            (CheckItem::SessionStoreReadable, CheckResult::Ok),
            (CheckItem::ClockMonotonic, CheckResult::Ok),
        ]
    }

    #[test]
    fn all_ok_goes() {
        assert_eq!(verdict(&healthy()), BootVerdict::Go);
    }

    #[test]
    fn degraded_warns_but_never_blocks() {
        let mut checks = healthy();
        checks[2] = (CheckItem::EnvSnapshotPresent, CheckResult::Degraded);
        assert_eq!(
            verdict(&checks),
            BootVerdict::GoDegraded {
                degraded: vec![CheckItem::EnvSnapshotPresent]
            }
        );
    }

    #[test]
    fn any_failure_blocks_boot() {
        let mut checks = healthy();
        checks[1] = (CheckItem::PersistenceWritable, CheckResult::Failed);
        checks[3] = (CheckItem::SessionStoreReadable, CheckResult::Failed);
        assert!(
            matches!(
                verdict(&checks),
                BootVerdict::Blocked { failed }
                    if failed.len() == 2 && failed.contains(&CheckItem::PersistenceWritable)
            ),
            "every failed item drives diagnosis"
        );
    }

    #[test]
    fn failure_outranks_degradation() {
        let checks = vec![
            (CheckItem::RuntimeReachable, CheckResult::Degraded),
            (CheckItem::ClockMonotonic, CheckResult::Failed),
        ];
        assert!(matches!(verdict(&checks), BootVerdict::Blocked { .. }));
    }

    #[test]
    fn empty_checklist_proves_nothing() {
        assert_eq!(verdict(&[]), BootVerdict::Blocked { failed: vec![] });
    }
}
