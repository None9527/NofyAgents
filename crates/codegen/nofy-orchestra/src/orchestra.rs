//! Project orchestration logic half (PRD FR11): manifest parse, DAG
//! validation, batch scheduling. Execution (spawning pack-joined agents)
//! stays with the shell/provider layer; this crate owns the *plan* semantics
//! so the daemon and any surface agree on one scheduler.
//!
//! Semantics pinned here:
//! - a task is ready when all `needs` settled successfully;
//! - `on_fail`: `retry(n)` per task, then `escalate` (surface approval) or
//!   `skip` (dependents of a skipped/failed task are skipped transitively);
//! - cycles and dangling `needs` are manifest errors, fail loud at load.

use std::collections::{BTreeMap, BTreeSet};

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TaskSpec {
    pub id: String,
    pub pack: String,
    pub goal: String,
    #[serde(default)]
    pub needs: Vec<String>,
    #[serde(default)]
    pub verify: Option<String>,
    #[serde(default)]
    pub retry: u32,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "snake_case")]
pub enum OnFail {
    /// Fail-closed default: a failed task goes to a surface for a decision.
    #[default]
    Escalate,
    Skip,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ProjectManifest {
    pub packs: Vec<String>,
    #[serde(default)]
    pub on_fail: OnFail,
    #[serde(default)]
    pub parallel: u32,
    #[serde(default)]
    pub task: Vec<TaskSpec>,
}

#[derive(Debug, PartialEq, Eq)]
pub enum ManifestError {
    DuplicateTask(String),
    DanglingNeed { task: String, need: String },
    UnknownPack { task: String, pack: String },
    Cycle(Vec<String>),
}

impl ProjectManifest {
    /// Parse TOML and validate the DAG. Packs referenced by tasks must be
    /// declared in `packs` (single-agent-single-pack discipline, FR10).
    pub fn from_toml(text: &str) -> Result<Self, ManifestError> {
        let m: ProjectManifest = toml::from_str(text)
            .map_err(|_| ManifestError::Cycle(vec!["<malformed manifest>".into()]))?;
        m.validate()?;
        Ok(m)
    }

    pub fn validate(&self) -> Result<(), ManifestError> {
        let packs: BTreeSet<&str> = self.packs.iter().map(|s| s.as_str()).collect();
        let mut ids = BTreeSet::new();
        for t in &self.task {
            if !ids.insert(t.id.as_str()) {
                return Err(ManifestError::DuplicateTask(t.id.clone()));
            }
            if !packs.contains(t.pack.as_str()) {
                return Err(ManifestError::UnknownPack {
                    task: t.id.clone(),
                    pack: t.pack.clone(),
                });
            }
        }
        for t in &self.task {
            for n in &t.needs {
                if !ids.contains(n.as_str()) {
                    return Err(ManifestError::DanglingNeed {
                        task: t.id.clone(),
                        need: n.clone(),
                    });
                }
            }
        }
        // Kahn: any remainder = cycle.
        let order = self.topo_order()?;
        if order.len() != self.task.len() {
            let in_order: BTreeSet<&str> = order.iter().map(|s| s.as_str()).collect();
            let cyc: Vec<String> = self
                .task
                .iter()
                .filter(|t| !in_order.contains(t.id.as_str()))
                .map(|t| t.id.clone())
                .collect();
            return Err(ManifestError::Cycle(cyc));
        }
        Ok(())
    }

    /// Deterministic (BTree-ordered) topological order.
    pub fn topo_order(&self) -> Result<Vec<String>, ManifestError> {
        let mut done: BTreeSet<&str> = BTreeSet::new();
        let mut order = Vec::new();
        let mut by_id: BTreeMap<&str, &TaskSpec> = BTreeMap::new();
        for t in &self.task {
            by_id.insert(&t.id, t);
        }
        loop {
            let mut progressed = false;
            for (id, t) in &by_id {
                if done.contains(id) {
                    continue;
                }
                if t.needs.iter().all(|n| done.contains(n.as_str())) {
                    done.insert(id);
                    order.push((*id).to_string());
                    progressed = true;
                }
            }
            if !progressed {
                return Ok(order); // remainder (if any) is the cycle
            }
        }
    }

    /// Scheduler step: given settled outcomes, the next ready batch (capped
    /// by `parallel`). `skipped` propagates transitively.
    pub fn next_batch(
        &self,
        succeeded: &BTreeSet<String>,
        failed_or_skipped: &BTreeSet<String>,
        running: &BTreeSet<String>,
    ) -> Vec<String> {
        let cap = self.parallel.max(1) as usize;
        let mut ready = Vec::new();
        let mut ids: Vec<&str> = self.task.iter().map(|t| t.id.as_str()).collect();
        ids.sort_unstable();
        for id in ids {
            if ready.len() >= cap {
                break;
            }
            if succeeded.contains(id) || failed_or_skipped.contains(id) || running.contains(id) {
                continue;
            }
            let t = self.task.iter().find(|t| t.id == id).unwrap();
            let blocked_by_dead = t
                .needs
                .iter()
                .any(|n| failed_or_skipped.contains(n.as_str()));
            let ready_yet = t
                .needs
                .iter()
                .all(|n| succeeded.contains(n.as_str()) || failed_or_skipped.contains(n));
            if !ready_yet {
                continue;
            }
            if blocked_by_dead {
                // Transitive skip is applied by the caller via the returned
                // batch? No: skips are NOT scheduled; the caller must mark
                // them. We surface them through `transitive_skips`.
                continue;
            }
            ready.push(id.to_string());
        }
        ready
    }

    /// Tasks whose needs include a failed/skipped task (transitively) and
    /// which are not themselves settled — the caller marks them skipped.
    pub fn transitive_skips(
        &self,
        succeeded: &BTreeSet<String>,
        failed_or_skipped: &BTreeSet<String>,
    ) -> Vec<String> {
        let mut dead = failed_or_skipped.clone();
        loop {
            let mut grew = false;
            for t in &self.task {
                if succeeded.contains(&t.id) || dead.contains(&t.id) {
                    continue;
                }
                if t.needs.iter().any(|n| dead.contains(n.as_str())) {
                    dead.insert(t.id.clone());
                    grew = true;
                }
            }
            if !grew {
                break;
            }
        }
        let mut out: Vec<String> = dead
            .difference(failed_or_skipped)
            .cloned()
            .collect();
        out.sort_unstable();
        out
    }
}

/// One active orchestration run; the daemon holds it behind a Mutex and
/// drives it from provider poll/result frames.
#[derive(Debug)]
pub struct OrchRun {
    pub manifest: ProjectManifest,
    pub succeeded: BTreeSet<String>,
    /// Failed or (transitively) skipped tasks.
    pub dead: BTreeSet<String>,
    pub running: BTreeSet<String>,
    retries: BTreeMap<String, u32>,
    pub aborted: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SettleOutcome {
    /// Task settled; nothing special.
    Done,
    /// Per-task retry budget left: caller re-dispatches the same task.
    Retry(String),
    /// Budget exhausted and on_fail=escalate: caller must ask a surface.
    Escalate(String),
}

impl OrchRun {
    pub fn new(manifest: ProjectManifest) -> Self {
        Self {
            manifest,
            succeeded: BTreeSet::new(),
            dead: BTreeSet::new(),
            running: BTreeSet::new(),
            retries: BTreeMap::new(),
            aborted: false,
        }
    }

    pub fn is_done(&self) -> bool {
        self.aborted || self.succeeded.len() + self.dead.len() == self.manifest.task.len()
    }

    fn spec(&self, id: &str) -> Option<&TaskSpec> {
        self.manifest.task.iter().find(|t| t.id == id)
    }

    /// Move transitively-blocked tasks into `dead` (skip semantics).
    pub fn apply_skips(&mut self) {
        for id in self.manifest.transitive_skips(&self.succeeded, &self.dead) {
            self.running.remove(&id);
            self.dead.insert(id);
        }
    }

    /// Next ready task (respecting parallel cap), marked running.
    pub fn dispatch_next(&mut self) -> Option<TaskSpec> {
        if self.aborted {
            return None;
        }
        self.apply_skips();
        let next = self
            .manifest
            .next_batch(&self.succeeded, &self.dead, &self.running)
            .into_iter()
            .next()?;
        let spec = self.spec(&next)?.clone();
        self.running.insert(next);
        Some(spec)
    }

    /// Record a provider outcome.
    pub fn settle(&mut self, task_id: &str, ok: bool) -> SettleOutcome {
        self.running.remove(task_id);
        if ok {
            self.succeeded.insert(task_id.to_string());
            return SettleOutcome::Done;
        }
        let Some(spec) = self.spec(task_id).cloned() else {
            return SettleOutcome::Done;
        };
        let used = *self.retries.get(task_id).unwrap_or(&0);
        if used < spec.retry {
            self.retries.insert(task_id.to_string(), used + 1);
            return SettleOutcome::Retry(task_id.to_string());
        }
        match self.manifest.on_fail {
            OnFail::Skip => {
                self.dead.insert(task_id.to_string());
                SettleOutcome::Done
            }
            OnFail::Escalate => SettleOutcome::Escalate(task_id.to_string()),
        }
    }

    /// Surface answered an escalation: allow = accept failure and skip
    /// dependents; deny = abort the whole run.
    pub fn resolve_escalation(&mut self, task_id: &str, allow: bool) {
        self.running.remove(task_id);
        if allow {
            self.dead.insert(task_id.to_string());
        } else {
            self.aborted = true;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const MANIFEST: &str = r#"
packs = ["code-review", "sec-audit", "docs-zh"]
on_fail = "skip"
parallel = 2

[[task]]
id = "review"
pack = "code-review"
goal = "review branch"

[[task]]
id = "sec"
pack = "sec-audit"
goal = "audit"
needs = ["review"]

[[task]]
id = "docs"
pack = "docs-zh"
goal = "docs"
"#;

    #[test]
    fn parses_and_orders() {
        let m = ProjectManifest::from_toml(MANIFEST).unwrap();
        let order = m.topo_order().unwrap();
        assert_eq!(order.len(), 3);
        assert!(order.iter().position(|x| x == "review") < order.iter().position(|x| x == "sec"));
    }

    #[test]
    fn cycle_and_dangling_fail_loud() {
        let bad = r#"
packs = ["a"]
[[task]]
id = "x"
pack = "a"
goal = "g"
needs = ["y"]
[[task]]
id = "y"
pack = "a"
goal = "g"
needs = ["x"]
"#;
        assert!(matches!(
            ProjectManifest::from_toml(bad),
            Err(ManifestError::Cycle(_))
        ));
        let dangling = MANIFEST.replace("needs = [\"review\"]", "needs = [\"ghost\"]");
        assert!(matches!(
            ProjectManifest::from_toml(&dangling),
            Err(ManifestError::DanglingNeed { .. })
        ));
        let unknown_pack = MANIFEST.replace("pack = \"sec-audit\"", "pack = \"nope\"");
        assert!(matches!(
            ProjectManifest::from_toml(&unknown_pack),
            Err(ManifestError::UnknownPack { .. })
        ));
    }

    #[test]
    fn duplicate_task_ids_fail_loud() {
        let dup = MANIFEST.replace("id = \"docs\"", "id = \"review\"");
        assert_eq!(
            ProjectManifest::from_toml(&dup),
            Err(ManifestError::DuplicateTask("review".into()))
        );
    }

    #[test]
    fn malformed_manifest_toml_fails_loud() {
        // Unparseable TOML surfaces as the malformed-manifest marker.
        assert_eq!(
            ProjectManifest::from_toml("= not toml ["),
            Err(ManifestError::Cycle(vec!["<malformed manifest>".into()]))
        );
    }

    #[test]
    fn cycle_behind_a_ready_task_is_reported_with_members() {
        // A cycle coexisting with an independent task: topo_order keeps the
        // ready task, the remainder is named as the cycle.
        let bad = r#"
packs = ["a"]
[[task]]
id = "free"
pack = "a"
goal = "g"
[[task]]
id = "x"
pack = "a"
goal = "g"
needs = ["y"]
[[task]]
id = "y"
pack = "a"
goal = "g"
needs = ["x"]
"#;
        assert_eq!(
            ProjectManifest::from_toml(bad),
            Err(ManifestError::Cycle(vec!["x".into(), "y".into()]))
        );
    }

    #[test]
    fn batches_respect_parallel_and_deps() {
        let m = ProjectManifest::from_toml(MANIFEST).unwrap();
        let (s, f) = (BTreeSet::new(), BTreeSet::new());
        let b1 = m.next_batch(&s, &f, &s);
        assert_eq!(b1.len(), 2, "parallel=2, review+docs ready");
        // While b1 is RUNNING, nothing else is schedulable (sec needs review).
        let running: BTreeSet<String> = b1.iter().cloned().collect();
        let b2 = m.next_batch(&s, &f, &running);
        assert!(b2.is_empty(), "sec waits for review to settle");
        // review settles OK → sec becomes ready (docs still running).
        let mut s2: BTreeSet<String> = BTreeSet::new();
        s2.insert("review".into());
        let b3 = m.next_batch(&s2, &f, &running);
        assert_eq!(b3, vec!["sec".to_string()]);
    }

    #[test]
    fn failure_skips_dependents_transitively() {
        let m = ProjectManifest::from_toml(MANIFEST).unwrap();
        let s = BTreeSet::new();
        let mut f = BTreeSet::new();
        f.insert("review".to_string());
        let skips = m.transitive_skips(&s, &f);
        assert_eq!(skips, vec!["sec".to_string()], "sec depends on failed review");
        let b = m.next_batch(&s, &f, &BTreeSet::new());
        assert!(!b.contains(&"sec".to_string()));
    }

    const RETRY_MANIFEST: &str = r#"
packs = ["p"]
on_fail = "escalate"

[[task]]
id = "flaky"
pack = "p"
goal = "g"
retry = 1

[[task]]
id = "after"
pack = "p"
goal = "g2"
needs = ["flaky"]
"#;

    #[test]
    fn retry_budget_then_escalate_then_skip_or_abort() {
        let m = ProjectManifest::from_toml(RETRY_MANIFEST).unwrap();
        let mut run = OrchRun::new(m);
        let t1 = run.dispatch_next().expect("flaky ready");
        assert_eq!(t1.id, "flaky");
        // First failure: retry budget 1 → Retry.
        assert_eq!(run.settle("flaky", false), SettleOutcome::Retry("flaky".into()));
        let t2 = run.dispatch_next().expect("re-dispatch");
        assert_eq!(t2.id, "flaky");
        // Second failure: budget exhausted, on_fail=escalate.
        assert_eq!(
            run.settle("flaky", false),
            SettleOutcome::Escalate("flaky".into())
        );
        // Surface allows: flaky skipped, dependent `after` transitively dead.
        run.resolve_escalation("flaky", true);
        run.apply_skips();
        assert!(run.dead.contains("after"));
        assert!(run.is_done(), "all tasks settled");
    }

    #[test]
    fn escalate_deny_aborts_run() {
        let m = ProjectManifest::from_toml(RETRY_MANIFEST).unwrap();
        let mut run = OrchRun::new(m);
        run.dispatch_next();
        run.settle("flaky", false); // retry
        run.dispatch_next();
        run.settle("flaky", false); // escalate
        run.resolve_escalation("flaky", false);
        assert!(run.aborted);
        assert!(run.dispatch_next().is_none(), "aborted run dispatches nothing");
    }

    #[test]
    fn happy_path_completes_in_dep_order() {
        let m = ProjectManifest::from_toml(MANIFEST).unwrap();
        let mut run = OrchRun::new(m);
        let a = run.dispatch_next().unwrap();
        assert!(a.id == "review" || a.id == "docs");
        run.settle(&a.id, true);
        // drain the rest
        while let Some(t) = run.dispatch_next() {
            run.settle(&t.id, true);
        }
        assert!(run.is_done());
        assert_eq!(run.succeeded.len(), 3);
    }

    #[test]
    fn settle_unknown_task_is_a_noop_done() {
        let m = ProjectManifest::from_toml(MANIFEST).unwrap();
        let mut run = OrchRun::new(m);
        // Never-dispatched id: no spec to consult, plain Done, no panic.
        assert_eq!(run.settle("ghost", false), SettleOutcome::Done);
        assert!(run.succeeded.is_empty());
        assert!(run.dead.is_empty());
    }

    #[test]
    fn skip_policy_kills_failed_task_without_escalation() {
        // MANIFEST carries on_fail=skip and the default retry budget 0:
        // first failure exhausts the budget and the task dies outright.
        let m = ProjectManifest::from_toml(MANIFEST).unwrap();
        let mut run = OrchRun::new(m);
        let t = run.dispatch_next().expect("first batch is ready");
        assert_eq!(run.settle(&t.id, false), SettleOutcome::Done);
        assert!(run.dead.contains(&t.id), "skip policy = dead, never escalated");
    }
}
