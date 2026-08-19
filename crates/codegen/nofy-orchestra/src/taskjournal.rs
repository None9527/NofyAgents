//! `task.*` journal event family (FR11.5): armed/claimed/settled/escalated.
//!
//! Task progress is journaled with the same invariants as the session
//! journal: DENSE sequence numbers (a gap = corruption, truncate there),
//! TERMINAL finality (a settled task never re-enters), and crash
//! reconciliation (claimed-but-not-settled = the re-dispatch list).

use std::collections::{BTreeMap, BTreeSet};

/// One task journal event.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum TaskEvent {
    Armed { seq: u64, task: String, run: String },
    Claimed { seq: u64, task: String, claimant: String },
    Settled { seq: u64, task: String, ok: bool },
    Escalated { seq: u64, task: String, reason: String },
    EscalationResolved { seq: u64, task: String, allow: bool },
}

impl TaskEvent {
    pub fn seq(&self) -> u64 {
        match self {
            TaskEvent::Armed { seq, .. }
            | TaskEvent::Claimed { seq, .. }
            | TaskEvent::Settled { seq, .. }
            | TaskEvent::Escalated { seq, .. }
            | TaskEvent::EscalationResolved { seq, .. } => *seq,
        }
    }

    pub fn task(&self) -> &str {
        match self {
            TaskEvent::Armed { task, .. }
            | TaskEvent::Claimed { task, .. }
            | TaskEvent::Settled { task, .. }
            | TaskEvent::Escalated { task, .. }
            | TaskEvent::EscalationResolved { task, .. } => task,
        }
    }
}

/// Lifecycle state of one task.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TaskState {
    Armed,
    Claimed,
    SettledOk,
    SettledFailed,
    Escalated,
    /// Escalation resolved: allowed = skip-and-continue.
    ResolvedAllow,
    /// Escalation resolved: denied = abort signal for the caller.
    ResolvedDeny,
}

impl TaskState {
    /// Terminal = nothing may follow. A FAILED settle is not terminal:
    /// escalation (or a retry re-claim) legitimately follows failure.
    pub fn is_terminal(&self) -> bool {
        matches!(self, TaskState::SettledOk | TaskState::ResolvedAllow | TaskState::ResolvedDeny)
    }
}

/// Fold result: per-task state + journal health.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct TaskJournal {
    pub states: BTreeMap<String, TaskState>,
    /// Last dense seq applied (0 = empty journal).
    pub last_seq: u64,
    /// Events dropped by the terminal gate (audit).
    pub terminal_violations: u64,
}

/// Fold a task journal with invariants. A seq gap truncates the fold
/// (corruption boundary); terminal tasks ignore further events.
pub fn fold_tasks(events: &[TaskEvent]) -> TaskJournal {
    let mut journal = TaskJournal::default();
    for event in events {
        let seq = event.seq();
        // Dense-seq invariant: events must advance one at a time.
        if seq != journal.last_seq + 1 {
            break; // torn/corrupt tail: stop folding here
        }
        let task = event.task().to_string();
        let current = journal.states.get(&task).copied();
        if current.is_some_and(|s| s.is_terminal()) {
            journal.terminal_violations += 1;
            journal.last_seq = seq;
            continue;
        }
        let next = match event {
            TaskEvent::Armed { .. } => TaskState::Armed,
            TaskEvent::Claimed { .. } => TaskState::Claimed,
            TaskEvent::Settled { ok: true, .. } => TaskState::SettledOk,
            TaskEvent::Settled { ok: false, .. } => TaskState::SettledFailed,
            TaskEvent::Escalated { .. } => TaskState::Escalated,
            TaskEvent::EscalationResolved { allow: true, .. } => TaskState::ResolvedAllow,
            TaskEvent::EscalationResolved { allow: false, .. } => TaskState::ResolvedDeny,
        };
        journal.states.insert(task, next);
        journal.last_seq = seq;
    }
    journal
}

/// Crash reconciliation: tasks claimed but never settled must be
/// re-dispatched (「崩溃后 task.* 对账续跑」, AC-11).
pub fn re_dispatch_list(journal: &TaskJournal) -> Vec<String> {
    journal
        .states
        .iter()
        .filter(|(_, state)| matches!(state, TaskState::Claimed | TaskState::Armed))
        .map(|(task, _)| task.clone())
        .collect()
}

/// Settled task ids (for dependency resolution).
pub fn settled_ok(journal: &TaskJournal) -> BTreeSet<String> {
    journal
        .states
        .iter()
        .filter(|(_, state)| **state == TaskState::SettledOk)
        .map(|(task, _)| task.clone())
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn armed(seq: u64, task: &str) -> TaskEvent {
        TaskEvent::Armed { seq, task: task.into(), run: "run-1".into() }
    }

    fn claimed(seq: u64, task: &str) -> TaskEvent {
        TaskEvent::Claimed { seq, task: task.into(), claimant: "provider-1".into() }
    }

    fn settled(seq: u64, task: &str, ok: bool) -> TaskEvent {
        TaskEvent::Settled { seq, task: task.into(), ok }
    }

    #[test]
    fn lifecycle_folds_in_order() {
        let journal = fold_tasks(&[armed(1, "t"), claimed(2, "t"), settled(3, "t", true)]);
        assert_eq!(journal.states["t"], TaskState::SettledOk);
        assert_eq!(journal.last_seq, 3);
    }

    #[test]
    fn seq_gap_truncates_the_fold() {
        // Gap at seq 3: everything after is untrusted.
        let journal = fold_tasks(&[armed(1, "a"), claimed(2, "a"), settled(5, "a", true)]);
        assert_eq!(journal.states["a"], TaskState::Claimed);
        assert_eq!(journal.last_seq, 2);
    }

    #[test]
    fn terminal_tasks_ignore_later_events() {
        let journal = fold_tasks(&[
            armed(1, "t"),
            claimed(2, "t"),
            settled(3, "t", true),
            claimed(4, "t"),   // terminal violation
            settled(5, "t", false), // terminal violation
        ]);
        assert_eq!(journal.states["t"], TaskState::SettledOk, "settled stays settled");
        assert_eq!(journal.terminal_violations, 2);
    }

    #[test]
    fn reconciliation_lists_unsettled_tasks() {
        let journal = fold_tasks(&[
            armed(1, "done"),
            claimed(2, "done"),
            settled(3, "done", true),
            armed(4, "in-flight"),
            claimed(5, "in-flight"),
            armed(6, "pending"),
        ]);
        let mut list = re_dispatch_list(&journal);
        list.sort();
        assert_eq!(list, vec!["in-flight".to_string(), "pending".to_string()]);
        assert!(settled_ok(&journal).contains("done"));
    }

    #[test]
    fn escalation_flow() {
        let journal = fold_tasks(&[
            armed(1, "t"),
            claimed(2, "t"),
            settled(3, "t", false),
            TaskEvent::Escalated { seq: 4, task: "t".into(), reason: "budget exhausted".into() },
            TaskEvent::EscalationResolved { seq: 5, task: "t".into(), allow: true },
        ]);
        assert_eq!(journal.states["t"], TaskState::ResolvedAllow);
        let denied = fold_tasks(&[
            armed(1, "t"),
            TaskEvent::Escalated { seq: 2, task: "t".into(), reason: "r".into() },
            TaskEvent::EscalationResolved { seq: 3, task: "t".into(), allow: false },
        ]);
        assert_eq!(denied.states["t"], TaskState::ResolvedDeny);
        assert!(denied.states["t"].is_terminal());
    }
}
