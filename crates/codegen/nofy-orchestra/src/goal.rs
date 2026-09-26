//! Goal acceptance (FR11.2 + FR4.9, DS-#6/#7).
//!
//! Acceptance is a FOLD OVER LOGGED GOAL STATE — never the model's
//! self-report. The executor CLAIMS steps; a verifier ACCEPTS or REJECTS
//! each claim (pre-step atomic acceptance). A task is accepted only when
//! every required step carries an acceptance — claimed-but-unverified
//! steps count for nothing (all-or-nothing, the `verify` discipline).

use std::collections::{BTreeMap, BTreeSet};

/// One logged goal-state event.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum GoalEvent {
    /// The goal is stated for a task (first event per task).
    GoalStated { task: String, goal: String },
    /// The executor claims a step is done — a claim, not proof.
    StepClaimed { task: String, step: String },
    /// The verifier accepted a claimed step.
    StepAccepted { task: String, step: String },
    /// The verifier rejected a claimed step.
    StepRejected {
        task: String,
        step: String,
        reason: String,
    },
}

/// Derived goal state for one task.
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct GoalState {
    pub goal: Option<String>,
    pub claimed: BTreeSet<String>,
    pub accepted: BTreeSet<String>,
    /// step -> latest rejection reason.
    pub rejected: BTreeMap<String, String>,
}

/// Fold a goal event log (all tasks). Pure: same log, same states.
pub fn fold_goals(events: &[GoalEvent]) -> BTreeMap<String, GoalState> {
    let mut states: BTreeMap<String, GoalState> = BTreeMap::new();
    for event in events {
        match event {
            GoalEvent::GoalStated { task, goal } => {
                states.entry(task.clone()).or_default().goal = Some(goal.clone());
            }
            GoalEvent::StepClaimed { task, step } => {
                states
                    .entry(task.clone())
                    .or_default()
                    .claimed
                    .insert(step.clone());
            }
            GoalEvent::StepAccepted { task, step } => {
                let state = states.entry(task.clone()).or_default();
                // Acceptance supersedes any earlier rejection.
                state.rejected.remove(step);
                state.accepted.insert(step.clone());
            }
            GoalEvent::StepRejected { task, step, reason } => {
                let state = states.entry(task.clone()).or_default();
                // Rejection supersedes claim and any earlier acceptance:
                // the verifier is the authority.
                state.claimed.remove(step);
                state.accepted.remove(step);
                state.rejected.insert(step.clone(), reason.clone());
            }
        }
    }
    states
}

/// Acceptance verdict for one task against its required steps.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Verdict {
    /// Every required step is accepted.
    Accepted,
    /// No goal was ever stated — nothing can be accepted.
    NoGoal,
    /// Required steps still lacking acceptance (claimed-only included).
    Pending { missing: Vec<String> },
    /// At least one required step is rejected.
    Rejected { reasons: Vec<(String, String)> },
}

/// All-or-nothing verdict: required steps must ALL be accepted; a single
/// rejection fails the task; claims without acceptance are still missing.
pub fn verdict(state: &GoalState, required: &[String]) -> Verdict {
    if state.goal.is_none() {
        return Verdict::NoGoal;
    }
    let mut missing = Vec::new();
    let mut reasons = Vec::new();
    for step in required {
        if let Some(reason) = state.rejected.get(step) {
            reasons.push((step.clone(), reason.clone()));
        } else if !state.accepted.contains(step) {
            missing.push(step.clone());
        }
    }
    if !reasons.is_empty() {
        Verdict::Rejected { reasons }
    } else if missing.is_empty() {
        Verdict::Accepted
    } else {
        Verdict::Pending { missing }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn stated(task: &str) -> GoalEvent {
        GoalEvent::GoalStated {
            task: task.into(),
            goal: format!("{task} goal"),
        }
    }

    fn claimed(task: &str, step: &str) -> GoalEvent {
        GoalEvent::StepClaimed {
            task: task.into(),
            step: step.into(),
        }
    }

    fn accepted(task: &str, step: &str) -> GoalEvent {
        GoalEvent::StepAccepted {
            task: task.into(),
            step: step.into(),
        }
    }

    fn rejected(task: &str, step: &str, reason: &str) -> GoalEvent {
        GoalEvent::StepRejected {
            task: task.into(),
            step: step.into(),
            reason: reason.into(),
        }
    }

    #[test]
    fn self_report_alone_is_never_accepted() {
        // The executor claims everything; nothing is verified.
        let states = fold_goals(&[stated("t"), claimed("t", "a"), claimed("t", "b")]);
        let required = vec!["a".to_string(), "b".to_string()];
        assert_eq!(
            verdict(&states["t"], &required),
            Verdict::Pending {
                missing: vec!["a".into(), "b".into()]
            },
            "claims without acceptance must not pass"
        );
    }

    #[test]
    fn all_required_accepted_is_accepted() {
        let states = fold_goals(&[
            stated("t"),
            claimed("t", "a"),
            accepted("t", "a"),
            claimed("t", "b"),
            accepted("t", "b"),
        ]);
        assert_eq!(
            verdict(&states["t"], &["a".into(), "b".into()]),
            Verdict::Accepted
        );
    }

    #[test]
    fn one_rejection_fails_the_whole_task() {
        let states = fold_goals(&[
            stated("t"),
            accepted("t", "a"),
            claimed("t", "b"),
            rejected("t", "b", "tests still red"),
        ]);
        assert_eq!(
            verdict(&states["t"], &["a".into(), "b".into()]),
            Verdict::Rejected {
                reasons: vec![("b".into(), "tests still red".into())]
            },
            "all-or-nothing: one rejection fails the task"
        );
    }

    #[test]
    fn rejection_supersedes_earlier_acceptance() {
        let states = fold_goals(&[
            stated("t"),
            accepted("t", "a"),
            rejected("t", "a", "regressed"),
        ]);
        assert_eq!(
            verdict(&states["t"], &["a".into()]),
            Verdict::Rejected {
                reasons: vec![("a".into(), "regressed".into())]
            }
        );
    }

    #[test]
    fn re_acceptance_after_fix_clears_rejection() {
        let states = fold_goals(&[
            stated("t"),
            rejected("t", "a", "broken"),
            claimed("t", "a"),
            accepted("t", "a"),
        ]);
        assert_eq!(verdict(&states["t"], &["a".into()]), Verdict::Accepted);
    }

    #[test]
    fn no_goal_means_nothing_can_pass() {
        let states = fold_goals(&[accepted("t", "a")]);
        assert_eq!(verdict(&states["t"], &["a".into()]), Verdict::NoGoal);
    }

    #[test]
    fn fold_is_deterministic_and_multi_task() {
        let log = vec![
            stated("t1"),
            stated("t2"),
            claimed("t1", "x"),
            accepted("t1", "x"),
            claimed("t2", "y"),
        ];
        let states = fold_goals(&log);
        assert_eq!(states.len(), 2);
        assert_eq!(verdict(&states["t1"], &["x".into()]), Verdict::Accepted);
        assert_eq!(
            verdict(&states["t2"], &["y".into()]),
            Verdict::Pending {
                missing: vec!["y".into()]
            }
        );
        assert_eq!(fold_goals(&log), states, "pure fold = deterministic");
    }
}
