//! Cleanup forbidden zones + dry-run trial + per-root trust ramp
//! (FR12.15).
//!
//! Three protections against an over-eager cleaner:
//!
//! - **Forbidden zones**: leased files, gitignored paths, and files
//!   touched within N days are UNCLEANABLE — and when uncertain, the
//!   answer is always Ask (不确定必 Ask);
//! - **Dry-run trial**: a newly added root runs its first THREE batches
//!   as dry-runs (「新根前三批强制 dry-run」, AC-12);
//! - **Trust ramp**: trust grows per root, per completed clean batch —
//!   never globally.

/// Inputs to the forbidden-zone check.
#[derive(Debug, Clone)]
pub struct ZoneContext<'a> {
    pub leased: bool,
    pub gitignored: bool,
    /// Days since the file was last touched (None = unknown).
    pub days_since_touch: Option<u64>,
    /// The N-day recency window.
    pub recent_window_days: u64,
    pub now: u64,
    pub path: &'a str,
}

/// Forbidden-zone verdict.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CleanupVerdict {
    Cleanable,
    Forbidden { reason: String },
    /// Uncertain state: must Ask, never assume.
    Ask { reason: String },
}

/// Forbidden-zone check: leased / gitignored / recently touched =
/// uncleanable; unknown touch history = Ask.
pub fn cleanup_verdict(ctx: &ZoneContext) -> CleanupVerdict {
    if ctx.leased {
        return CleanupVerdict::Forbidden {
            reason: "leased by an active session".into(),
        };
    }
    if ctx.gitignored {
        return CleanupVerdict::Forbidden {
            reason: "gitignored".into(),
        };
    }
    match ctx.days_since_touch {
        Some(days) if days <= ctx.recent_window_days => CleanupVerdict::Forbidden {
            reason: format!("touched {days} days ago (window {})", ctx.recent_window_days),
        },
        Some(_) => CleanupVerdict::Cleanable,
        None => CleanupVerdict::Ask {
            reason: "touch history unknown; uncertain must Ask".into(),
        },
    }
}

/// Batch execution mode for a root.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BatchMode {
    DryRun,
    Live,
}

/// Per-root trust ramp.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TrustRamp {
    pub root: String,
    /// Completed clean batches (dry-run batches count toward the trial).
    pub completed_batches: u64,
}

/// Trial length: the first three batches of a new root are dry-runs.
pub const TRIAL_BATCHES: u64 = 3;

impl TrustRamp {
    pub fn new(root: &str) -> Self {
        Self {
            root: root.to_string(),
            completed_batches: 0,
        }
    }

    /// Mode for the NEXT batch: forced dry-run during the trial.
    pub fn next_batch_mode(&self) -> BatchMode {
        if self.completed_batches < TRIAL_BATCHES {
            BatchMode::DryRun
        } else {
            BatchMode::Live
        }
    }

    /// Record a completed batch (trust grows per root).
    pub fn record_batch(&mut self) {
        self.completed_batches += 1;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ctx(leased: bool, gitignored: bool, days: Option<u64>) -> ZoneContext<'static> {
        ZoneContext {
            leased,
            gitignored,
            days_since_touch: days,
            recent_window_days: 7,
            now: 1000,
            path: "/f",
        }
    }

    #[test]
    fn leased_gitignored_recent_are_forbidden() {
        assert!(matches!(
            cleanup_verdict(&ctx(true, false, Some(30))),
            CleanupVerdict::Forbidden { .. }
        ));
        assert!(matches!(
            cleanup_verdict(&ctx(false, true, Some(30))),
            CleanupVerdict::Forbidden { .. }
        ));
        assert!(matches!(
            cleanup_verdict(&ctx(false, false, Some(3))),
            CleanupVerdict::Forbidden { .. }
        ));
    }

    #[test]
    fn old_unmanaged_files_are_cleanable() {
        assert_eq!(cleanup_verdict(&ctx(false, false, Some(30))), CleanupVerdict::Cleanable);
    }

    #[test]
    fn uncertainty_must_ask() {
        assert!(matches!(
            cleanup_verdict(&ctx(false, false, None)),
            CleanupVerdict::Ask { .. }
        ));
    }

    #[test]
    fn new_root_first_three_batches_forced_dry_run() {
        let mut ramp = TrustRamp::new("/data");
        for batch in 0..3 {
            assert_eq!(
                ramp.next_batch_mode(),
                BatchMode::DryRun,
                "batch {batch} of the trial must be dry-run (AC-12)"
            );
            ramp.record_batch();
        }
        // Fourth batch: trust earned, live allowed.
        assert_eq!(ramp.next_batch_mode(), BatchMode::Live);
    }

    #[test]
    fn trust_is_per_root() {
        let mut a = TrustRamp::new("/a");
        let b = TrustRamp::new("/b");
        for _ in 0..3 {
            a.record_batch();
        }
        assert_eq!(a.next_batch_mode(), BatchMode::Live);
        assert_eq!(b.next_batch_mode(), BatchMode::DryRun, "other roots keep their trial");
    }
}
