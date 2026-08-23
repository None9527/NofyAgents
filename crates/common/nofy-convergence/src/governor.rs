//! Dynamic turn budgets for unattended runs.
//!
//! A fixed turn cap is brittle: too low starves real tasks, too high
//! burns tokens on stuck loops. The [`BudgetGovernor`] splits the budget
//! into a **hard cap** (host safety bound, never exceeded) and a **soft
//! budget** (derived working bound) that the run earns extensions to:
//!
//! - near the soft boundary **with real progress** (new evidence,
//!   mutations, verification) → extend the soft budget (bounded number
//!   of times);
//! - **no progress** for a run of consecutive turns → finish early and
//!   report state instead of burning the rest;
//! - hard cap → finish unconditionally.
//!
//! Progress signals are projected from the session journal (see
//! `nofy-session-journal`), so the governor decides on facts, not on
//! heuristics about the model's tone. The governor never prescribes
//! actions — no required tools, no forced edits; it only decides whether
//! the runtime keeps paying for work.

/// Progress since the last governance check, projected from the journal.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub struct ProgressSignals {
    /// Turns consumed so far.
    pub turns_used: u64,
    /// New evidence appeared (tool results, reads with new content).
    pub new_evidence: bool,
    /// A workspace mutation happened (file edit).
    pub mutation_happened: bool,
    /// A verification ran (test/check execution).
    pub verification_happened: bool,
    /// Consecutive turns with no new information.
    pub repeated_no_new_info: u64,
    /// Open tool intents (invoked, no outcome yet) — unfinished business.
    pub open_intents: u64,
}

impl ProgressSignals {
    /// Meaningful progress = evidence, mutation, or verification.
    pub fn has_meaningful_progress(&self) -> bool {
        self.new_evidence || self.mutation_happened || self.verification_happened
    }
}

/// The governance decision for one check.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BudgetDecision {
    /// Keep running under the current soft budget.
    Continue,
    /// Extend the soft budget (the run is progressing near its
    /// boundary). `new_soft_budget` is always ≤ the hard cap.
    Extend { new_soft_budget: u64 },
    /// Stop the run and report current state.
    Finish { reason: FinishReason },
}

/// Why a run was finished by the governor.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FinishReason {
    /// The host safety bound was reached.
    HardCapReached,
    /// No progress for too many consecutive turns and nothing left open.
    NoProgress,
}

/// Environment-variable gate for the convergence governor. On by
/// default; set `NOFY_CONVERGENCE_GOVERNOR=0` (or `false`) to keep run
/// budgets exactly as configured.
pub const GOVERNOR_ENV: &str = "NOFY_CONVERGENCE_GOVERNOR";

/// Whether the convergence governor is enabled for this process.
pub fn is_governor_enabled() -> bool {
    std::env::var(GOVERNOR_ENV)
        .map(|value| !(value == "0" || value.eq_ignore_ascii_case("false")))
        .unwrap_or(true)
}

/// Dynamic budget governor.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct BudgetGovernor {
    /// Host safety bound — never exceeded, extensions included.
    pub hard_cap: u64,
    /// Initial working bound.
    pub soft_budget: u64,
    /// How many turns each extension adds.
    pub extension_step: u64,
    /// Maximum number of extensions one run may earn.
    pub max_extensions: u32,
    /// Consecutive no-progress turns that finish the run (when nothing
    /// is open).
    pub no_progress_limit: u64,
}

/// Consecutive no-progress turns that finish a run (when nothing is
/// open). Shared with hosts so they know when a consultation is worth
/// issuing.
pub const DEFAULT_NO_PROGRESS_LIMIT: u64 = 5;

impl BudgetGovernor {
    /// A conservative default: 60-turn hard cap, 30-turn soft budget,
    /// up to 2 extensions of 10 turns, finish after 5 dead turns.
    pub fn conservative() -> Self {
        Self {
            hard_cap: 60,
            soft_budget: 30,
            extension_step: 10,
            max_extensions: 2,
            no_progress_limit: DEFAULT_NO_PROGRESS_LIMIT,
        }
    }

    /// Derive a governor from an already-configured turn limit: the
    /// configured limit becomes the soft budget; the hard cap allows up
    /// to two earned extensions beyond it.
    pub fn from_configured_limit(limit: u64) -> Self {
        let extension_step = (limit / 4).max(2);
        Self {
            hard_cap: limit + 2 * extension_step,
            soft_budget: limit,
            extension_step,
            max_extensions: 2,
            no_progress_limit: DEFAULT_NO_PROGRESS_LIMIT,
        }
    }

    /// Decide at a governance checkpoint.
    ///
    /// `extensions_used` is the count of extensions already granted to
    /// this run (budget continuity across checkpoints — resume must not
    /// re-earn spent extensions).
    pub fn decide(&self, signals: &ProgressSignals, extensions_used: u32) -> BudgetDecision {
        // 1. Hard cap is absolute.
        if signals.turns_used >= self.hard_cap {
            return BudgetDecision::Finish {
                reason: FinishReason::HardCapReached,
            };
        }
        // 2. Dead runs finish early — but only when nothing is open.
        //    An in-flight intent means the next observation may still
        //    change the picture.
        if signals.repeated_no_new_info >= self.no_progress_limit && signals.open_intents == 0 {
            return BudgetDecision::Finish {
                reason: FinishReason::NoProgress,
            };
        }
        // 3. Near the soft boundary with real progress: extend (bounded).
        if signals.turns_used >= self.soft_budget
            && signals.has_meaningful_progress()
            && extensions_used < self.max_extensions
        {
            let new_soft_budget = (self.soft_budget
                + self.extension_step * (extensions_used as u64 + 1))
            .min(self.hard_cap);
            if new_soft_budget > self.soft_budget {
                return BudgetDecision::Extend { new_soft_budget };
            }
        }
        BudgetDecision::Continue
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn governor() -> BudgetGovernor {
        BudgetGovernor::conservative()
    }

    fn signals(turns_used: u64) -> ProgressSignals {
        ProgressSignals {
            turns_used,
            ..Default::default()
        }
    }

    #[test]
    fn hard_cap_is_absolute() {
        let g = governor();
        let mut s = signals(60);
        s.mutation_happened = true; // even with progress
        assert_eq!(
            g.decide(&s, 0),
            BudgetDecision::Finish {
                reason: FinishReason::HardCapReached
            }
        );
    }

    #[test]
    fn deriving_from_an_extended_limit_inflates_the_hard_cap() {
        // The invariant the host's base-limit pinning protects: a governor
        // re-derived from an already-extended limit grows its hard cap, so
        // hosts must always derive from the original configured limit.
        let base = BudgetGovernor::from_configured_limit(20);
        let extension_step = (20u64 / 4).max(2);
        let extended_limit = 20 + extension_step; // one earned extension
        let inflated = BudgetGovernor::from_configured_limit(extended_limit);
        assert!(inflated.hard_cap > base.hard_cap);
        assert!(inflated.soft_budget > base.soft_budget);
    }

    #[test]
    fn no_progress_finishes_only_when_nothing_open() {
        let g = governor();
        let mut s = signals(10);
        s.repeated_no_new_info = 5;
        s.open_intents = 0;
        assert_eq!(
            g.decide(&s, 0),
            BudgetDecision::Finish {
                reason: FinishReason::NoProgress
            }
        );
        // Same dead run but an intent in flight: keep going.
        s.open_intents = 1;
        assert_eq!(g.decide(&s, 0), BudgetDecision::Continue);
    }

    #[test]
    fn progress_near_boundary_earns_extension() {
        let g = governor();
        let mut s = signals(30); // at soft budget
        s.new_evidence = true;
        assert_eq!(
            g.decide(&s, 0),
            BudgetDecision::Extend {
                new_soft_budget: 40
            }
        );
        // Second extension is larger but still capped.
        assert_eq!(
            g.decide(&s, 1),
            BudgetDecision::Extend {
                new_soft_budget: 50
            }
        );
    }

    #[test]
    fn extensions_are_bounded() {
        let g = governor();
        let mut s = signals(50);
        s.mutation_happened = true;
        // max_extensions spent: no more extensions, but not finished
        // either (under hard cap, progress present).
        assert_eq!(g.decide(&s, 2), BudgetDecision::Continue);
    }

    #[test]
    fn extension_never_exceeds_hard_cap() {
        let g = BudgetGovernor {
            hard_cap: 35,
            soft_budget: 30,
            extension_step: 10,
            max_extensions: 3,
            no_progress_limit: DEFAULT_NO_PROGRESS_LIMIT,
        };
        let mut s = signals(30);
        s.verification_happened = true;
        assert_eq!(
            g.decide(&s, 0),
            BudgetDecision::Extend {
                new_soft_budget: 35
            }
        );
    }

    #[test]
    fn under_budget_with_progress_continues() {
        let g = governor();
        let mut s = signals(12);
        s.new_evidence = true;
        assert_eq!(g.decide(&s, 0), BudgetDecision::Continue);
    }

    #[test]
    fn budget_continuity_across_resume() {
        // A resumed run passes its spent extensions — it cannot re-earn
        // them (RTAgent: suspend/resume must not bypass the budget).
        let g = governor();
        let mut s = signals(45);
        s.new_evidence = true;
        assert_eq!(g.decide(&s, 2), BudgetDecision::Continue);
    }
}
