//! Full DAG engine with per-task on_fail (FR11.6): retry / escalate /
//! skip, parallel batches, dependency edges.
//!
//! The daemon's `ProjectManifest` carries a GLOBAL on_fail; P2 promotes
//! the policy to PER-TASK, adds explicit parallel batching, and keeps the
//! fail-loud construction discipline (cycles and dangling edges refuse to
//! build).

use std::collections::{BTreeMap, BTreeSet};

/// Per-task failure policy.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum OnFailPolicy {
    /// Retry up to N times, then escalate.
    Retry { attempts: u32 },
    /// Go straight to a surface decision.
    Escalate,
    /// Skip and let dependents skip transitively.
    Skip,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DagTask {
    pub id: String,
    pub needs: Vec<String>,
    pub on_fail: OnFailPolicy,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum DagError {
    DuplicateTask(String),
    DanglingNeed { task: String, need: String },
    Cycle(Vec<String>),
}

/// A validated DAG.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Dag {
    pub tasks: Vec<DagTask>,
}

impl Dag {
    /// Build with fail-loud validation.
    pub fn build(tasks: Vec<DagTask>) -> Result<Self, DagError> {
        let mut ids = BTreeSet::new();
        for task in &tasks {
            if !ids.insert(task.id.clone()) {
                return Err(DagError::DuplicateTask(task.id.clone()));
            }
        }
        for task in &tasks {
            for need in &task.needs {
                if !ids.contains(need) {
                    return Err(DagError::DanglingNeed {
                        task: task.id.clone(),
                        need: need.clone(),
                    });
                }
            }
        }
        // Kahn: remainder = cycle.
        let mut done: BTreeSet<&str> = BTreeSet::new();
        let mut progressed = true;
        while progressed {
            progressed = false;
            for task in &tasks {
                if done.contains(task.id.as_str()) {
                    continue;
                }
                if task.needs.iter().all(|n| done.contains(n.as_str())) {
                    done.insert(&task.id);
                    progressed = true;
                }
            }
        }
        if done.len() != tasks.len() {
            let cycle: Vec<String> = tasks
                .iter()
                .filter(|t| !done.contains(t.id.as_str()))
                .map(|t| t.id.clone())
                .collect();
            return Err(DagError::Cycle(cycle));
        }
        Ok(Self { tasks })
    }

    fn task(&self, id: &str) -> Option<&DagTask> {
        self.tasks.iter().find(|t| t.id == id)
    }

    /// Ready batch: all deps settled-ok, capped by parallel, deterministic
    /// (id order).
    pub fn dispatch_batch(
        &self,
        succeeded: &BTreeSet<String>,
        dead: &BTreeSet<String>,
        running: &BTreeSet<String>,
        parallel: usize,
    ) -> Vec<String> {
        let mut batch = Vec::new();
        let mut ids: Vec<&str> = self.tasks.iter().map(|t| t.id.as_str()).collect();
        ids.sort_unstable();
        for id in ids {
            if batch.len() >= parallel.max(1) {
                break;
            }
            if succeeded.contains(id) || dead.contains(id) || running.contains(id) {
                continue;
            }
            let task = self.task(id).unwrap();
            if task.needs.iter().all(|n| succeeded.contains(n.as_str())) {
                batch.push(id.to_string());
            }
        }
        batch
    }

    /// Transitive skips: dependents of dead tasks, as a diff against the
    /// input dead set (only the NEWLY dead).
    pub fn transitive_skips(
        &self,
        succeeded: &BTreeSet<String>,
        input_dead: &BTreeSet<String>,
    ) -> Vec<String> {
        let mut dead = input_dead.clone();
        loop {
            let mut grew = false;
            for task in &self.tasks {
                if succeeded.contains(&task.id) || dead.contains(&task.id) {
                    continue;
                }
                if task.needs.iter().any(|n| dead.contains(n.as_str())) {
                    dead.insert(task.id.clone());
                    grew = true;
                }
            }
            if !grew {
                break;
            }
        }
        let mut out: Vec<String> = dead.difference(input_dead).cloned().collect();
        out.sort_unstable();
        out
    }
}

/// Run state over a DAG.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct DagRun {
    pub succeeded: BTreeSet<String>,
    pub dead: BTreeSet<String>,
    pub running: BTreeSet<String>,
    pub retries: BTreeMap<String, u32>,
    pub aborted: bool,
}

/// Outcome of settling a failed task under its per-task policy.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum FailOutcome {
    Retry(String),
    Escalate(String),
    Skipped(String),
}

/// Settle one task under its PER-TASK policy.
pub fn settle_failed(dag: &Dag, run: &mut DagRun, task_id: &str) -> Option<FailOutcome> {
    run.running.remove(task_id);
    let task = dag.task(task_id)?;
    match &task.on_fail {
        OnFailPolicy::Retry { attempts } => {
            let used = run.retries.entry(task_id.to_string()).or_insert(0);
            if *used < *attempts {
                *used += 1;
                Some(FailOutcome::Retry(task_id.to_string()))
            } else {
                Some(FailOutcome::Escalate(task_id.to_string()))
            }
        }
        OnFailPolicy::Escalate => Some(FailOutcome::Escalate(task_id.to_string())),
        OnFailPolicy::Skip => {
            run.dead.insert(task_id.to_string());
            Some(FailOutcome::Skipped(task_id.to_string()))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn task(id: &str, needs: &[&str], policy: OnFailPolicy) -> DagTask {
        DagTask {
            id: id.into(),
            needs: needs.iter().map(|s| s.to_string()).collect(),
            on_fail: policy,
        }
    }

    fn dag() -> Dag {
        Dag::build(vec![
            task("build", &[], OnFailPolicy::Retry { attempts: 1 }),
            task("test", &["build"], OnFailPolicy::Escalate),
            task("docs", &[], OnFailPolicy::Skip),
            task("ship", &["test", "docs"], OnFailPolicy::Escalate),
        ])
        .unwrap()
    }

    #[test]
    fn build_validates_fail_loud() {
        assert!(matches!(
            Dag::build(vec![task("a", &["ghost"], OnFailPolicy::Skip)]),
            Err(DagError::DanglingNeed { .. })
        ));
        assert!(matches!(
            Dag::build(vec![
                task("a", &["b"], OnFailPolicy::Skip),
                task("b", &["a"], OnFailPolicy::Skip),
            ]),
            Err(DagError::Cycle(_))
        ));
        assert!(matches!(
            Dag::build(vec![task("a", &[], OnFailPolicy::Skip), task("a", &[], OnFailPolicy::Skip)]),
            Err(DagError::DuplicateTask(_))
        ));
    }

    #[test]
    fn parallel_batches_respect_deps_and_cap() {
        let dag = dag();
        let (s, d, r) = (BTreeSet::new(), BTreeSet::new(), BTreeSet::new());
        let batch = dag.dispatch_batch(&s, &d, &r, 2);
        assert_eq!(batch, vec!["build".to_string(), "docs".to_string()]);
        // Cap 1: deterministic first id.
        let batch1 = dag.dispatch_batch(&s, &d, &r, 1);
        assert_eq!(batch1, vec!["build".to_string()]);
        // build done → test ready.
        let mut s2 = BTreeSet::new();
        s2.insert("build".to_string());
        let batch2 = dag.dispatch_batch(&s2, &d, &r, 4);
        assert!(batch2.contains(&"test".to_string()));
    }

    #[test]
    fn per_task_retry_then_escalate() {
        let dag = dag();
        let mut run = DagRun::default();
        run.running.insert("build".into());
        assert_eq!(
            settle_failed(&dag, &mut run, "build"),
            Some(FailOutcome::Retry("build".into()))
        );
        run.running.insert("build".into());
        assert_eq!(
            settle_failed(&dag, &mut run, "build"),
            Some(FailOutcome::Escalate("build".into())),
            "budget exhausted → escalate"
        );
    }

    #[test]
    fn per_task_skip_kills_dependents() {
        let dag = dag();
        let mut run = DagRun::default();
        run.running.insert("docs".into());
        assert_eq!(
            settle_failed(&dag, &mut run, "docs"),
            Some(FailOutcome::Skipped("docs".into()))
        );
        let skips = dag.transitive_skips(&run.succeeded, &run.dead);
        assert!(skips.contains(&"ship".to_string()), "ship depends on skipped docs");
    }

    #[test]
    fn escalate_policy_skips_retry() {
        let dag = dag();
        let mut run = DagRun::default();
        run.running.insert("test".into());
        assert_eq!(
            settle_failed(&dag, &mut run, "test"),
            Some(FailOutcome::Escalate("test".into())),
            "escalate policy goes straight to a surface"
        );
        assert!(!run.retries.contains_key("test"));
    }
}
