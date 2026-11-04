//! Dependency validation and deterministic readiness, without product policy.
use std::collections::BTreeSet;

#[derive(Debug, PartialEq, Eq)]
pub(super) enum DagError {
    DuplicateTask(String),
    DanglingNeed { task: String, need: String },
    Cycle(Vec<String>),
}

#[derive(Clone)]
pub(super) struct Dag {
    tasks: Vec<(String, Vec<String>)>,
}

impl Dag {
    pub(super) fn build(tasks: Vec<(String, Vec<String>)>) -> Result<Self, DagError> {
        let mut ids = BTreeSet::new();
        for (id, _) in &tasks {
            if !ids.insert(id.as_str()) {
                return Err(DagError::DuplicateTask(id.clone()));
            }
        }
        for (id, needs) in &tasks {
            for need in needs {
                if !ids.contains(need.as_str()) {
                    return Err(DagError::DanglingNeed {
                        task: id.clone(),
                        need: need.clone(),
                    });
                }
            }
        }
        let mut done = BTreeSet::new();
        loop {
            let before = done.len();
            for (id, needs) in &tasks {
                if needs.iter().all(|need| done.contains(need.as_str())) {
                    done.insert(id.as_str());
                }
            }
            if done.len() == before {
                break;
            }
        }
        if done.len() != tasks.len() {
            return Err(DagError::Cycle(
                tasks
                    .iter()
                    .filter(|(id, _)| !done.contains(id.as_str()))
                    .map(|(id, _)| id.clone())
                    .collect(),
            ));
        }
        Ok(Self { tasks })
    }

    pub(super) fn dispatch_batch(
        &self,
        settled: &BTreeSet<String>,
        running: &BTreeSet<String>,
        parallel: usize,
    ) -> Vec<String> {
        let mut ready = self
            .tasks
            .iter()
            .filter(|(id, needs)| {
                !settled.contains(id)
                    && !running.contains(id)
                    && needs.iter().all(|need| settled.contains(need))
            })
            .map(|(id, _)| id.clone())
            .collect::<Vec<_>>();
        ready.sort_unstable();
        ready.truncate(parallel.max(1));
        ready
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn task(id: &str, needs: &[&str]) -> (String, Vec<String>) {
        (id.into(), needs.iter().map(|need| (*need).into()).collect())
    }

    #[test]
    fn rejects_duplicate_missing_and_cyclic_dependencies() {
        assert!(matches!(Dag::build(vec![task("a", &[]), task("a", &[])]),
            Err(DagError::DuplicateTask(id)) if id == "a"));
        assert!(matches!(Dag::build(vec![task("a", &["missing"])]),
            Err(DagError::DanglingNeed { task, need }) if task == "a" && need == "missing"));
        assert!(
            matches!(Dag::build(vec![task("b", &["a"]), task("a", &["b"])]),
            Err(DagError::Cycle(ids)) if ids == ["b", "a"])
        );
    }

    #[test]
    fn readiness_is_sorted_bounded_and_excludes_running_or_settled_nodes() {
        let dag = Dag::build(vec![task("z", &[]), task("b", &["a"]), task("a", &[])]).unwrap();
        let empty = BTreeSet::new();
        assert_eq!(dag.dispatch_batch(&empty, &empty, 1), ["a"]);
        assert_eq!(dag.dispatch_batch(&empty, &empty, 2), ["a", "z"]);
        let running = BTreeSet::from(["a".into()]);
        assert_eq!(dag.dispatch_batch(&empty, &running, 2), ["z"]);
        let settled = BTreeSet::from(["a".into()]);
        assert_eq!(dag.dispatch_batch(&settled, &empty, 2), ["b", "z"]);
        assert_eq!(
            dag.dispatch_batch(&settled, &BTreeSet::from(["z".into()]), 2),
            ["b"]
        );
    }
}
