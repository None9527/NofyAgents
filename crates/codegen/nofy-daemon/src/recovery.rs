//! Crash-recovery decision state machine (HM-F5, translated).
//!
//! Classifies the previous run from the forensics ledger and picks the
//! resume strategy for this run:
//!
//! - `Fresh` — no predecessor, or it exited cleanly: start normally;
//! - `Resume` — predecessor died non-cleanly once or twice: resume sessions
//!   through the journal reconciliation path (B0 e2e-proven);
//! - `Escalate` — a stuck-loop signature (≥ [`ESCALATE_AFTER_UNCLEAN`]
//!   consecutive non-clean deaths with no clean shutdown between): the
//!   supervisor must NOT auto-resume; surface to the operator instead.
//!   Auto-resuming a wedged daemon in a loop is exactly the restart storm
//!   the budgeted watchdog (OC-F2) exists to prevent.

use std::fs;
use std::path::Path;

use serde_json::Value;

/// Consecutive non-clean deaths before auto-resume is refused.
pub const ESCALATE_AFTER_UNCLEAN: u32 = 3;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RecoveryDecision {
    Fresh,
    Resume,
    Escalate,
}

/// Decide from the ledger written by [`crate::forensics::ForensicsLedger`].
/// Reads the tail backwards, counting `unclean_death_detected` entries until
/// a `clean_shutdown` belonging to an earlier healthy cycle appears.
pub fn decide(state_dir: &Path) -> RecoveryDecision {
    let Ok(text) = fs::read_to_string(state_dir.join("forensics.jsonl")) else {
        return RecoveryDecision::Fresh;
    };
    let owned: Vec<String> = text
        .lines()
        .filter_map(|l| serde_json::from_str::<Value>(l).ok())
        .filter_map(|v| v.get("kind").and_then(|k| k.as_str()).map(str::to_owned))
        .collect();
    let kinds: Vec<&str> = owned.iter().map(|s| s.as_str()).collect();
    decide_from_kinds(&kinds)
}

fn decide_from_kinds(kinds: &[&str]) -> RecoveryDecision {
    // Walk from the newest entry (this run's own `startup` is appended by the
    // caller AFTER decide(), so the tail here is the predecessor's record).
    let mut unclean_streak = 0u32;
    let mut saw_predecessor = false;
    for kind in kinds.iter().rev() {
        match *kind {
            "unclean_death_detected" => unclean_streak += 1,
            "startup" => saw_predecessor = true,
            "clean_shutdown" => break, // an earlier healthy cycle ends the streak
            _ => {}
        }
    }
    if unclean_streak >= ESCALATE_AFTER_UNCLEAN {
        RecoveryDecision::Escalate
    } else if unclean_streak > 0 || saw_predecessor_and_died(kinds) {
        RecoveryDecision::Resume
    } else if saw_predecessor {
        // predecessor started and (by reaching here) never logged clean nor
        // unclean detection => it is the one flagged by our startup record.
        RecoveryDecision::Resume
    } else {
        RecoveryDecision::Fresh
    }
}

fn saw_predecessor_and_died(kinds: &[&str]) -> bool {
    // A predecessor that started but has no clean_shutdown after its startup.
    if let Some(idx) = kinds.iter().rposition(|k| *k == "startup") {
        !kinds[idx + 1..].contains(&"clean_shutdown")
    } else {
        false
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn d(kinds: &[&str]) -> RecoveryDecision {
        decide_from_kinds(kinds)
    }

    #[test]
    fn empty_ledger_is_fresh() {
        assert_eq!(d(&[]), RecoveryDecision::Fresh);
    }

    #[test]
    fn clean_predecessor_is_resume_free() {
        // prev: startup → clean_shutdown
        assert_eq!(d(&["startup", "clean_shutdown"]), RecoveryDecision::Fresh);
    }

    #[test]
    fn crashed_predecessor_resumes() {
        // prev started, never cleaned; this run's record_startup will add the
        // unclean_death_detected entry, but decide() runs before that append:
        assert_eq!(d(&["startup"]), RecoveryDecision::Resume);
        assert_eq!(
            d(&["startup", "unclean_death_detected"]),
            RecoveryDecision::Resume
        );
    }

    #[test]
    fn stuck_loop_escalates() {
        assert_eq!(
            d(&[
                "startup",
                "unclean_death_detected",
                "startup",
                "unclean_death_detected",
                "startup",
                "unclean_death_detected"
            ]),
            RecoveryDecision::Escalate
        );
    }

    #[test]
    fn healthy_cycle_resets_streak() {
        // Predecessor chain ends with a clean cycle: at decide() time the
        // ledger tail is the predecessor's clean_shutdown.
        assert_eq!(
            d(&[
                "startup",
                "startup",
                "unclean_death_detected",
                "startup",
                "unclean_death_detected",
                "startup",
                "clean_shutdown"
            ]),
            RecoveryDecision::Fresh,
            "a clean cycle must break the streak"
        );
    }

    #[test]
    fn clean_cycle_caps_streak_at_one() {
        // Two crashes, then a clean cycle, then one crash: streak must be 1
        // (Resume), not 2 — the clean cycle resets it.
        assert_eq!(
            d(&[
                "startup",
                "unclean_death_detected",
                "startup",
                "clean_shutdown",
                "startup",
                "unclean_death_detected"
            ]),
            RecoveryDecision::Resume
        );
    }

    #[test]
    fn missing_ledger_file_is_fresh() {
        // No forensics.jsonl on disk: first boot on this host.
        let dir = tempfile::tempdir().unwrap();
        assert_eq!(decide(dir.path()), RecoveryDecision::Fresh);
    }

    #[test]
    fn unknown_entry_kinds_are_ignored() {
        // Foreign/legacy entries never count toward the streak.
        assert_eq!(d(&["weird"]), RecoveryDecision::Fresh);
        assert_eq!(
            d(&["startup", "unclean_death_detected", "mystery"]),
            RecoveryDecision::Resume
        );
    }
}
