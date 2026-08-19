//! Cleanup suggestion DAG → FR11 orchestration → batch approval
//! (FR12.8).
//!
//! Suggestions flow through REAL orchestration cores — no parallel
//! re-implementation:
//!
//! 1. forbidden-zone verdicts ([`crate::trust`]) filter suggestions at
//!    construction: a forbidden suggestion never enters the DAG or a
//!    batch (dependents of excluded suggestions are excluded
//!    transitively);
//! 2. the survivors become a [`nofy_orchestra::dag::Dag`] (fail-loud
//!    build, per-task on_fail = Escalate: a failed cleanup goes to a
//!    surface, never silently retried);
//! 3. the same survivors become ONE [`nofy_orchestra::batchapproval`]
//!    batch — a single Ask over all items with a per-item ledger.

use nofy_orchestra::batchapproval::{ApprovalBatch, BatchItem};
use nofy_orchestra::dag::{Dag, DagError, DagTask, OnFailPolicy};

use crate::trust::CleanupVerdict;

/// One cleanup suggestion.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CleanupSuggestion {
    pub id: String,
    pub summary: String,
    /// Suggestions may depend on each other (e.g. "empty dir" needs
    /// "move files out" first).
    pub needs: Vec<String>,
    pub high_risk: bool,
}

/// The compiled cleanup plan.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CleanupPlan {
    pub dag: Dag,
    pub batch: ApprovalBatch,
    /// Excluded by forbidden zones (id + reason), transitively closed.
    pub excluded: Vec<(String, String)>,
}

/// Build the plan. `verdict` supplies the forbidden-zone verdict per
/// suggestion id. Uncertain (Ask) suggestions STAY IN — asking is exactly
/// what the batch approval does.
pub fn plan(
    batch_id: &str,
    suggestions: &[CleanupSuggestion],
    verdict: &dyn Fn(&str) -> CleanupVerdict,
) -> Result<CleanupPlan, DagError> {
    // Direct forbidden exclusions.
    let mut excluded: Vec<(String, String)> = Vec::new();
    for s in suggestions {
        if let CleanupVerdict::Forbidden { reason } = verdict(&s.id) {
            excluded.push((s.id.clone(), reason));
        }
    }
    // Transitive closure: dependents of excluded suggestions cannot run.
    loop {
        let mut grew = false;
        for s in suggestions {
            let already = excluded.iter().any(|(id, _)| id == &s.id);
            if already {
                continue;
            }
            if let Some((dep_id, _)) = excluded
                .iter()
                .find(|(id, _)| s.needs.iter().any(|n| n == id))
            {
                excluded.push((
                    s.id.clone(),
                    format!("depends on excluded {dep_id}"),
                ));
                grew = true;
            }
        }
        if !grew {
            break;
        }
    }
    excluded.sort();

    let survivors: Vec<&CleanupSuggestion> = suggestions
        .iter()
        .filter(|s| !excluded.iter().any(|(id, _)| id == &s.id))
        .collect();

    let dag = Dag::build(
        survivors
            .iter()
            .map(|s| DagTask {
                id: s.id.clone(),
                needs: s.needs.clone(),
                // A failed cleanup escalates to a surface — destructive
                // work is never silently retried.
                on_fail: OnFailPolicy::Escalate,
            })
            .collect(),
    )?;

    let batch = ApprovalBatch {
        batch_id: batch_id.to_string(),
        items: survivors
            .iter()
            .map(|s| BatchItem {
                id: s.id.clone(),
                summary: s.summary.clone(),
                high_risk: s.high_risk,
            })
            .collect(),
    };

    Ok(CleanupPlan { dag, batch, excluded })
}

#[cfg(test)]
mod tests {
    use super::*;
    use nofy_orchestra::batchapproval::{
        ItemDecision, ask, batch_outcome, decide_item, expire_undecided, init_ledger,
    };
    use std::collections::BTreeSet;

    fn suggestions() -> Vec<CleanupSuggestion> {
        vec![
            CleanupSuggestion {
                id: "mv-logs".into(),
                summary: "move logs/ to archive/".into(),
                needs: vec![],
                high_risk: false,
            },
            CleanupSuggestion {
                id: "trash-dupes".into(),
                summary: "trash 40 duplicate images".into(),
                needs: vec![],
                high_risk: true,
            },
            CleanupSuggestion {
                id: "empty-dir".into(),
                summary: "remove emptied logs/ dir".into(),
                needs: vec!["mv-logs".into()],
                high_risk: false,
            },
        ]
    }

    fn all_clean(_: &str) -> CleanupVerdict {
        CleanupVerdict::Cleanable
    }

    #[test]
    fn plan_drives_real_dag_and_one_batch_ask() {
        let p = plan("cleanup-1", &suggestions(), &all_clean).unwrap();
        assert!(p.excluded.is_empty());
        // Real DAG dispatch: mv-logs and trash-dupes first (parallel),
        // empty-dir only after mv-logs succeeds.
        let empty: BTreeSet<String> = BTreeSet::new();
        let first = p.dag.dispatch_batch(&empty, &empty, &empty, 8);
        assert_eq!(first, vec!["mv-logs".to_string(), "trash-dupes".to_string()]);
        let mut done = BTreeSet::new();
        done.insert("mv-logs".to_string());
        done.insert("trash-dupes".to_string());
        let second = p.dag.dispatch_batch(&done, &empty, &empty, 8);
        assert_eq!(second, vec!["empty-dir".to_string()]);
        // ONE Ask covers every survivor.
        let ask = ask(&p.batch);
        assert_eq!(ask.lines.len(), 3);
        assert_eq!(ask.high_risk_count, 1);
    }

    #[test]
    fn forbidden_suggestions_never_enter_dag_or_batch() {
        let verdict = |id: &str| {
            if id == "trash-dupes" {
                CleanupVerdict::Forbidden { reason: "leased".into() }
            } else {
                CleanupVerdict::Cleanable
            }
        };
        let p = plan("cleanup-2", &suggestions(), &verdict).unwrap();
        let ids: Vec<&str> = p.dag.tasks.iter().map(|t| t.id.as_str()).collect();
        assert!(!ids.contains(&"trash-dupes"));
        assert!(p.batch.items.iter().all(|i| i.id != "trash-dupes"));
        assert_eq!(p.excluded, vec![("trash-dupes".to_string(), "leased".to_string())]);
    }

    #[test]
    fn exclusion_is_transitive() {
        let verdict = |id: &str| {
            if id == "mv-logs" {
                CleanupVerdict::Forbidden { reason: "gitignored".into() }
            } else {
                CleanupVerdict::Cleanable
            }
        };
        let p = plan("cleanup-3", &suggestions(), &verdict).unwrap();
        // empty-dir depends on mv-logs → excluded transitively.
        assert_eq!(p.excluded.len(), 2);
        assert!(p.excluded.iter().any(|(id, r)| id == "empty-dir" && r.contains("mv-logs")));
        assert_eq!(p.dag.tasks.len(), 1, "only trash-dupes survives");
    }

    #[test]
    fn uncertain_suggestions_stay_in_and_get_asked() {
        // Ask = must be presented; the batch approval IS the presentation.
        let verdict = |id: &str| {
            if id == "trash-dupes" {
                CleanupVerdict::Ask { reason: "touch history unknown".into() }
            } else {
                CleanupVerdict::Cleanable
            }
        };
        let p = plan("cleanup-4", &suggestions(), &verdict).unwrap();
        assert!(p.excluded.is_empty());
        assert!(p.batch.items.iter().any(|i| i.id == "trash-dupes"));
    }

    #[test]
    fn batch_approval_chain_decides_per_item_fail_closed() {
        let p = plan("cleanup-5", &suggestions(), &all_clean).unwrap();
        let mut ledger = init_ledger(&p.batch);
        assert!(decide_item(&mut ledger, "mv-logs", ItemDecision::Approved));
        assert!(decide_item(&mut ledger, "trash-dupes", ItemDecision::Denied));
        // Deadline: empty-dir never decided → denied, never allowed.
        assert_eq!(expire_undecided(&mut ledger), 1);
        assert!(matches!(batch_outcome(&ledger), nofy_orchestra::batchapproval::BatchOutcome::AnyDenied));
    }

    #[test]
    fn dangling_needs_fail_loud() {
        let bad = vec![CleanupSuggestion {
            id: "x".into(),
            summary: "x".into(),
            needs: vec!["ghost".into()],
            high_risk: false,
        }];
        assert!(matches!(plan("b", &bad, &all_clean), Err(DagError::DanglingNeed { .. })));
    }
}
