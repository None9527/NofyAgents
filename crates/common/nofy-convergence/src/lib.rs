//! # nofy-convergence
//!
//! Convergence governance for **unattended** agent runs (headless,
//! subagents, workflows) — runtime evolution Phase 4.
//!
//! Two mechanisms, both pure and policy-explicit:
//!
//! - [`failure`] — classify tool failures so the runtime treats
//!   recoverable failures as *observations* (the model sees them and
//!   decides) instead of run-terminators. Only `RuntimeFailure` stops a
//!   run. This is the RTAgent self-healing discipline: invalid regex,
//!   path escape, edit-anchor miss, and inconclusive timeouts are facts
//!   about the world, not reasons to abort.
//! - [`governor`] — a dynamic turn budget that extends when the run is
//!   making real progress near its boundary and finishes early when it
//!   is not, using progress signals projected from the session journal.
//!
//! Explicitly out of scope (anti-intelligence gates, never implemented):
//! required-tool completion gates, forced edits, action-space shrinking.
//! The governor controls whether the runtime keeps paying for work — it
//! never tells the model what to do.

pub mod failure;
pub mod governor;

pub use failure::{FailureClass, classify_tool_failure, is_run_terminal};
pub use governor::{
    BudgetDecision, BudgetGovernor, DEFAULT_NO_PROGRESS_LIMIT, FinishReason, GOVERNOR_ENV,
    ProgressSignals, is_governor_enabled,
};
