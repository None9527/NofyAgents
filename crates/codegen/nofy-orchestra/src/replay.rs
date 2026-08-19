//! Orchestration journal + deterministic replay (FR11.3).
//!
//! An orchestration run's progress is journaled as append-only events;
//! folding the journal reproduces the run state exactly, so a daemon
//! crash mid-run loses nothing: reload manifest, replay journal, resume.
//! The fold mirrors the daemon's real [`crate::orchestra::OrchRun`]
//! semantics (retry budgets, on_fail, transitive skips), and the tests
//! cross-check both against the same scripted scenarios — the journal is
//! not a parallel truth, it is the SAME truth re-derived.

use std::collections::{BTreeMap, BTreeSet};

use crate::orchestra::{OnFail, ProjectManifest};
use serde::{Deserialize, Serialize};

/// One orchestration event. `Dispatched` covers both first dispatch and
/// retry re-dispatch; `Settled` carries the provider outcome BEFORE retry
/// policy (the fold applies the policy, same as `OrchRun::settle`).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum OrchEvent {
    Dispatched { task: String },
    Settled { task: String, ok: bool },
    EscalationResolved { task: String, allow: bool },
}

/// Replay state — the fold's output.
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct ReplayState {
    pub succeeded: BTreeSet<String>,
    /// Failed (skip policy) or transitively skipped tasks.
    pub dead: BTreeSet<String>,
    pub running: BTreeSet<String>,
    /// Failed tasks awaiting a surface decision (escalate policy).
    pub escalated: BTreeSet<String>,
    pub aborted: bool,
    /// Dispatch order, retries included — the audit trail.
    pub dispatch_order: Vec<String>,
}

fn spec_retry(manifest: &ProjectManifest, task: &str) -> Option<u32> {
    manifest.task.iter().find(|t| t.id == task).map(|t| t.retry)
}

fn apply_skips(manifest: &ProjectManifest, state: &mut ReplayState) {
    for id in manifest.transitive_skips(&state.succeeded, &state.dead) {
        state.running.remove(&id);
        state.escalated.remove(&id);
        state.dead.insert(id);
    }
}

/// Fold an orchestration journal against its manifest. Pure and
/// deterministic: same manifest + same journal = same state.
pub fn fold_orch(manifest: &ProjectManifest, events: &[OrchEvent]) -> ReplayState {
    let mut state = ReplayState::default();
    let mut retries: BTreeMap<String, u32> = BTreeMap::new();
    for event in events {
        match event {
            OrchEvent::Dispatched { task } => {
                if spec_retry(manifest, task).is_none() {
                    continue; // unknown task: fail-closed ignore
                }
                if state.succeeded.contains(task) || state.dead.contains(task) {
                    continue; // settled tasks are never re-dispatched
                }
                state.running.insert(task.clone());
                state.dispatch_order.push(task.clone());
            }
            OrchEvent::Settled { task, ok } => {
                if spec_retry(manifest, task).is_none() {
                    continue; // unknown task: fail-closed ignore
                }
                state.running.remove(task);
                if *ok {
                    state.succeeded.insert(task.clone());
                } else if let Some(budget) = spec_retry(manifest, task) {
                    let used = retries.entry(task.clone()).or_insert(0);
                    if *used < budget {
                        *used += 1; // awaits re-dispatch
                    } else {
                        match manifest.on_fail {
                            OnFail::Skip => {
                                state.dead.insert(task.clone());
                            }
                            OnFail::Escalate => {
                                state.escalated.insert(task.clone());
                            }
                        }
                    }
                }
                apply_skips(manifest, &mut state);
            }
            OrchEvent::EscalationResolved { task, allow } => {
                if state.escalated.remove(task) {
                    if *allow {
                        state.dead.insert(task.clone());
                        apply_skips(manifest, &mut state);
                    } else {
                        state.aborted = true;
                    }
                }
            }
        }
    }
    state
}

/// Serialize the journal as one JSON object per line.
pub fn render_journal(events: &[OrchEvent]) -> String {
    let mut out = String::new();
    for event in events {
        out.push_str(&serde_json::to_string(event).expect("orch event serializes"));
        out.push('\n');
    }
    out
}

/// Parse a journal, tolerating a torn tail (single-writer discipline).
pub fn parse_journal(text: &str) -> Vec<OrchEvent> {
    let mut events = Vec::new();
    for line in text.lines() {
        if line.trim().is_empty() {
            continue;
        }
        match serde_json::from_str::<OrchEvent>(line) {
            Ok(event) => events.push(event),
            Err(_) => break,
        }
    }
    events
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::orchestra::{OrchRun, SettleOutcome};

    const MANIFEST: &str = r#"
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

[[task]]
id = "solo"
pack = "p"
goal = "g3"
"#;

    fn manifest() -> ProjectManifest {
        ProjectManifest::from_toml(MANIFEST).unwrap()
    }

    /// Drive the REAL OrchRun through a scripted scenario, journaling
    /// every step as it happens.
    fn drive_real(
        manifest: &ProjectManifest,
        outcomes: &[(&str, bool)],
        resolutions: &[(&str, bool)],
    ) -> (OrchRun, Vec<OrchEvent>) {
        let mut run = OrchRun::new(manifest.clone());
        let mut journal = Vec::new();
        let mut outcomes = outcomes.iter();
        let mut resolutions = resolutions.iter();
        loop {
            match run.dispatch_next() {
                Some(task) => {
                    journal.push(OrchEvent::Dispatched { task: task.id.clone() });
                    let (id, ok) = outcomes.next().expect("scripted outcome");
                    assert_eq!(id, &task.id, "script must follow dispatch order");
                    let outcome = run.settle(id, *ok);
                    journal.push(OrchEvent::Settled {
                        task: id.to_string(),
                        ok: *ok,
                    });
                    if let SettleOutcome::Escalate(task_id) = outcome {
                        let (rid, allow) = resolutions.next().expect("scripted resolution");
                        assert_eq!(rid, &task_id);
                        run.resolve_escalation(&task_id, *allow);
                        journal.push(OrchEvent::EscalationResolved {
                            task: task_id,
                            allow: *allow,
                        });
                    }
                }
                None => break,
            }
        }
        (run, journal)
    }

    fn assert_equivalent(run: &OrchRun, state: &ReplayState) {
        assert_eq!(run.succeeded, state.succeeded, "succeeded diverges");
        assert_eq!(run.dead, state.dead, "dead diverges");
        assert_eq!(run.running, state.running, "running diverges");
        assert_eq!(run.aborted, state.aborted, "aborted diverges");
    }

    #[test]
    fn happy_path_replay_matches_real_orchrun() {
        let manifest = manifest();
        let (run, journal) = drive_real(
            &manifest,
            &[("flaky", true), ("after", true), ("solo", true)],
            &[],
        );
        let state = fold_orch(&manifest, &journal);
        assert_equivalent(&run, &state);
        assert_eq!(state.succeeded.len(), 3);
        assert!(state.dispatch_order.iter().all(|t| t == "flaky"
            || t == "after" || t == "solo"));
    }

    #[test]
    fn retry_then_escalate_allow_replay_matches_real() {
        let manifest = manifest();
        // flaky fails twice (retry budget 1 → escalate), surface allows:
        // flaky dead, `after` transitively skipped, solo still runs.
        let (run, journal) = drive_real(
            &manifest,
            &[("flaky", false), ("flaky", false), ("solo", true)],
            &[("flaky", true)],
        );
        let state = fold_orch(&manifest, &journal);
        assert_equivalent(&run, &state);
        assert!(state.dead.contains("flaky"));
        assert!(state.dead.contains("after"), "transitive skip must replay");
        assert!(state.succeeded.contains("solo"));
        assert_eq!(
            state.dispatch_order.iter().filter(|t| *t == "flaky").count(),
            2,
            "retry re-dispatch is journaled"
        );
    }

    #[test]
    fn escalate_deny_aborts_in_replay_too() {
        let manifest = manifest();
        let (run, journal) = drive_real(
            &manifest,
            &[("flaky", false), ("flaky", false)],
            &[("flaky", false)],
        );
        let state = fold_orch(&manifest, &journal);
        assert_equivalent(&run, &state);
        assert!(state.aborted);
    }

    #[test]
    fn journal_roundtrip_with_torn_tail() {
        let manifest = manifest();
        let (_, journal) = drive_real(
            &manifest,
            &[("flaky", false), ("flaky", false), ("solo", true)],
            &[("flaky", true)],
        );
        let text = render_journal(&journal);
        assert_eq!(parse_journal(&text), journal);

        // Torn tail: chop mid-line, replay the intact prefix.
        let mut torn = text.clone();
        torn.truncate(torn.len() - 6);
        let parsed = parse_journal(&torn);
        assert_eq!(parsed.len(), journal.len() - 1);
        let state = fold_orch(&manifest, &parsed);
        let prefix_state = fold_orch(&manifest, &journal[..journal.len() - 1]);
        assert_eq!(state, prefix_state, "torn replay = prefix replay");
    }

    #[test]
    fn unknown_task_events_are_ignored_fail_closed() {
        let manifest = manifest();
        let state = fold_orch(
            &manifest,
            &[
                OrchEvent::Dispatched { task: "ghost".into() },
                OrchEvent::Settled { task: "ghost".into(), ok: true },
            ],
        );
        assert_eq!(state, ReplayState::default());
    }
}
