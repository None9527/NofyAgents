//! Event-sourced schedule state (FR3.1 / DS-#1).
//!
//! The scheduler's state is a *pure fold* of an append-only event log:
//! [`fold`] is deterministic and side-effect free, so replaying the log
//! after a crash reproduces exactly the same state, and persistence is a
//! thin separable layer ([`LogStore`]) that can be swapped or tested away.
//!
//! Fork-awareness lives in the fold itself, not in callers: a
//! [`ScheduleEvent::Forked`] event starts a child generation that keeps
//! schedule *definitions* but drops every pending firing obligation — a
//! forked child never inherits fire obligations it did not arm.
//!
//! Batch-E scope note: this crate is the state core + log codec plus the
//! batch-E policy set — catch-up ([`catch_up_events`], FR3.2), cron
//! engine ([`cron`], FR3.4), true-idle channel ([`maintenance`], FR3.3),
//! cron grammar ([`grammar`], FR3.5), one-shot timers ([`timer`], FR3.6),
//! the jobs↔session fence ([`fence`], FR3.7), the fs-trigger policy
//! ([`fstrigger`], FR3.8) and the heartbeat projection ([`heartbeat`],
//! FR3.9). Nothing here talks to the daemon or the control plane.

use std::collections::BTreeMap;
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

pub mod cron;
pub mod delivery;
pub mod fence;
pub mod fstrigger;
pub mod grammar;
pub mod heartbeat;
pub mod lock;
pub mod maintenance;
pub mod registry;
pub mod runfiles;
pub mod timer;

/// One append-only event in the schedule log.
///
/// The log is the source of truth; state is always derived from it.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum ScheduleEvent {
    /// Register (or re-register) a schedule definition. Re-adding a
    /// disabled id is an explicit re-enable: the disable mark is cleared.
    Added { id: String, spec: String },
    /// Remove a schedule definition and every pending obligation for it.
    Removed { id: String },
    /// Arm a firing obligation for `id` at logical time `due`. Ignored
    /// (fail-closed) when `id` has no live definition.
    Armed { id: String, due: u64 },
    /// Discharge the obligation `(id, due)`: it fired. Idempotent —
    /// firing an obligation that is not pending is a no-op.
    Fired { id: String, due: u64 },
    /// Catch-up audit event (FR3.2): stale overdue dues were dropped by
    /// the latest-only policy WITHOUT firing. Idempotent — dropping dues
    /// that are not pending is a no-op.
    Dropped { id: String, dues: Vec<u64> },
    /// Run lifecycle (FR3.4): a run of schedule `id` started at time `at`.
    /// Ignored (fail-closed) when `id` has no live definition.
    RunStarted { id: String, run_id: u64, at: u64 },
    /// The run completed successfully; consecutive failures reset. A
    /// result for a run_id that is not in flight is ignored (stale/replay).
    RunSucceeded { id: String, run_id: u64 },
    /// The run failed; consecutive failures increase. Same run_id gate as
    /// [`Self::RunSucceeded`].
    RunFailed { id: String, run_id: u64 },
    /// Self-disable a schedule (later produced by the cron watchdog,
    /// FR3.4). Pending obligations are dropped; later `Armed` events are
    /// ignored until an explicit re-`Added`.
    Disabled { id: String, reason: String },
    /// Fork: start generation `child`. Definitions survive the fork,
    /// pending obligations do not. A fork that names the current
    /// generation is degenerate and ignored.
    Forked { child: u64 },
}

/// A schedule definition plus its disable mark.
#[derive(Debug, Clone, PartialEq, Eq, Default, Serialize, Deserialize)]
pub struct ScheduleEntry {
    /// Opaque schedule specification (cron expression, timer, ...). The
    /// fold never interprets it; the cron engine (FR3.4) will.
    pub spec: String,
    /// `Some(reason)` when the schedule is self-disabled.
    pub disabled_reason: Option<String>,
}

/// The derived schedule state — always a function of the log.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ScheduleState {
    /// Generation identity. Only [`ScheduleEvent::Forked`] changes it.
    pub generation: u64,
    /// Live definitions keyed by schedule id.
    pub schedules: BTreeMap<String, ScheduleEntry>,
    /// Armed-but-not-fired obligations per schedule id, dues ascending.
    pub pending: BTreeMap<String, Vec<u64>>,
    /// In-flight runs: id -> (run_id, started_at). A crash leaves these
    /// behind; boot-time repair (FR3.4) marks them failed.
    pub inflight: BTreeMap<String, (u64, u64)>,
    /// Consecutive failures per schedule; reset by success. Drives backoff
    /// and self-disable (FR3.4).
    pub consecutive_failures: BTreeMap<String, u64>,
}

impl Default for ScheduleState {
    fn default() -> Self {
        Self {
            generation: 0,
            schedules: BTreeMap::new(),
            pending: BTreeMap::new(),
            inflight: BTreeMap::new(),
            consecutive_failures: BTreeMap::new(),
        }
    }
}

impl ScheduleState {
    /// Total number of pending firing obligations.
    pub fn pending_count(&self) -> usize {
        self.pending.values().map(Vec::len).sum()
    }

    /// Whether `id` has a live (non-disabled) definition.
    pub fn is_live(&self, id: &str) -> bool {
        self.schedules
            .get(id)
            .is_some_and(|e| e.disabled_reason.is_none())
    }
}

/// Apply one event to the state — the fold's single-event step.
pub fn apply(state: &mut ScheduleState, event: &ScheduleEvent) {
    match event {
        ScheduleEvent::Added { id, spec } => {
            // Explicit (re-)registration: fresh definition, disable cleared.
            state.schedules.insert(
                id.clone(),
                ScheduleEntry {
                    spec: spec.clone(),
                    disabled_reason: None,
                },
            );
        }
        ScheduleEvent::Removed { id } => {
            state.schedules.remove(id);
            state.pending.remove(id);
        }
        ScheduleEvent::Armed { id, due } => {
            // Fail-closed: obligations require a live definition.
            if !state.is_live(id) {
                return;
            }
            let dues = state.pending.entry(id.clone()).or_default();
            match dues.binary_search(due) {
                Ok(_) => {} // duplicate arm for the same due: idempotent
                Err(pos) => dues.insert(pos, *due),
            }
        }
        ScheduleEvent::Fired { id, due } => {
            if let Some(dues) = state.pending.get_mut(id) {
                if let Ok(pos) = dues.binary_search(due) {
                    dues.remove(pos);
                }
                if dues.is_empty() {
                    state.pending.remove(id);
                }
            }
        }
        ScheduleEvent::Dropped { id, dues } => {
            if let Some(pending_dues) = state.pending.get_mut(id) {
                for due in dues {
                    if let Ok(pos) = pending_dues.binary_search(due) {
                        pending_dues.remove(pos);
                    }
                }
                if pending_dues.is_empty() {
                    state.pending.remove(id);
                }
            }
        }
        ScheduleEvent::RunStarted { id, run_id, at } => {
            // Fail-closed: runs require a live definition.
            if state.is_live(id) {
                state.inflight.insert(id.clone(), (*run_id, *at));
            }
        }
        ScheduleEvent::RunSucceeded { id, run_id } => {
            // run_id gate: stale/replayed results cannot corrupt state.
            if state.inflight.get(id).map(|(rid, _)| *rid) == Some(*run_id) {
                state.inflight.remove(id);
            }
            state.consecutive_failures.remove(id);
        }
        ScheduleEvent::RunFailed { id, run_id } => {
            if state.inflight.get(id).map(|(rid, _)| *rid) == Some(*run_id) {
                state.inflight.remove(id);
            }
            *state.consecutive_failures.entry(id.clone()).or_insert(0) += 1;
        }
        ScheduleEvent::Disabled { id, reason } => {
            if let Some(entry) = state.schedules.get_mut(id) {
                entry.disabled_reason = Some(reason.clone());
            }
            state.pending.remove(id);
        }
        ScheduleEvent::Forked { child } => {
            if *child == state.generation {
                return; // degenerate fork: no identity change
            }
            state.generation = *child;
            state.pending.clear();
        }
    }
}

/// Fold an entire event log into a state. Pure: same log, same state.
pub fn fold(events: &[ScheduleEvent]) -> ScheduleState {
    let mut state = ScheduleState::default();
    for event in events {
        apply(&mut state, event);
    }
    state
}

/// Catch-up policy (FR3.2 / DS-#2): fixed-rate latest-only.
///
/// After an offline stretch, overdue obligations are NOT replayed one by
/// one — no catch-up storm. Per schedule, only the LATEST overdue due
/// fires; every older overdue due is dropped with a [`ScheduleEvent::Dropped`]
/// audit event. Emission is paced: at most `rate` schedules catch up per
/// tick, so a large backlog drains at a fixed rate instead of firing all
/// at once. Ticks are deterministic: schedules are visited in id order.
///
/// Pure event proposal: appending the returned events to the log and
/// folding reproduces the post-catch-up state. An empty result means the
/// state is fully caught up for `now`. `rate` is clamped to at least 1.
pub fn catch_up_events(state: &ScheduleState, now: u64, rate: usize) -> Vec<ScheduleEvent> {
    let rate = rate.max(1);
    let mut events = Vec::new();
    let mut caught = 0;
    for (id, dues) in &state.pending {
        if caught >= rate {
            break;
        }
        // `dues` is sorted ascending; count the overdue prefix.
        let overdue_count = dues.partition_point(|due| *due <= now);
        if overdue_count == 0 {
            continue;
        }
        let overdue = &dues[..overdue_count];
        let latest = *overdue.last().expect("non-empty overdue prefix");
        events.push(ScheduleEvent::Fired {
            id: id.clone(),
            due: latest,
        });
        if overdue.len() > 1 {
            events.push(ScheduleEvent::Dropped {
                id: id.clone(),
                dues: overdue[..overdue.len() - 1].to_vec(),
            });
        }
        caught += 1;
    }
    events
}

/// Serialize events as one JSON object per line.
pub fn render_log(events: &[ScheduleEvent]) -> String {
    let mut out = String::new();
    for event in events {
        // Serialization of this closed enum cannot fail.
        out.push_str(&serde_json::to_string(event).expect("schedule event serializes"));
        out.push('\n');
    }
    out
}

/// Parse a log, tolerating a torn tail: the first line that fails to parse
/// ends the log. A torn write can only corrupt the tail (single writer,
/// append-only), so everything after the first bad line is discarded —
/// the same truncation discipline as the session journal.
pub fn parse_log(text: &str) -> Vec<ScheduleEvent> {
    let mut events = Vec::new();
    for line in text.lines() {
        if line.trim().is_empty() {
            continue;
        }
        match serde_json::from_str::<ScheduleEvent>(line) {
            Ok(event) => events.push(event),
            Err(_) => break, // torn tail: truncate here
        }
    }
    events
}

/// Thin on-disk layer: append-only line log + fold-on-read.
///
/// Deliberately dumb — durability guarantees belong to the caller's
/// policy; this layer only appends with `sync_data` and reads back.
pub struct LogStore {
    path: PathBuf,
}

impl LogStore {
    pub fn open(path: impl Into<PathBuf>) -> Self {
        Self { path: path.into() }
    }

    pub fn path(&self) -> &Path {
        &self.path
    }

    /// Append one event durably (line + flush + `sync_data`).
    pub fn append(&self, event: &ScheduleEvent) -> std::io::Result<()> {
        let mut file = fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.path)?;
        let mut line = serde_json::to_string(event).expect("schedule event serializes");
        line.push('\n');
        file.write_all(line.as_bytes())?;
        file.sync_data()?;
        Ok(())
    }

    /// Read the log back; a missing file is an empty log. A torn tail is
    /// truncated, never an error.
    pub fn read_events(&self) -> std::io::Result<Vec<ScheduleEvent>> {
        match fs::read_to_string(&self.path) {
            Ok(text) => Ok(parse_log(&text)),
            Err(err) if err.kind() == std::io::ErrorKind::NotFound => Ok(Vec::new()),
            Err(err) => Err(err),
        }
    }

    /// The current state: fold of the on-disk log.
    pub fn state(&self) -> std::io::Result<ScheduleState> {
        Ok(fold(&self.read_events()?))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn added(id: &str) -> ScheduleEvent {
        ScheduleEvent::Added {
            id: id.into(),
            spec: format!("cron:{id}"),
        }
    }

    fn armed(id: &str, due: u64) -> ScheduleEvent {
        ScheduleEvent::Armed {
            id: id.into(),
            due,
        }
    }

    fn fired(id: &str, due: u64) -> ScheduleEvent {
        ScheduleEvent::Fired {
            id: id.into(),
            due,
        }
    }

    /// Apply a proposed event batch to a state — the log-append+fold path
    /// that the engine will take, reproduced for tests.
    fn apply_all(state: &ScheduleState, events: &[ScheduleEvent]) -> ScheduleState {
        let mut next = state.clone();
        for event in events {
            apply(&mut next, event);
        }
        next
    }

    /// A realistic mixed log: adds, arms, fires, a disable, a removal.
    fn sample_log() -> Vec<ScheduleEvent> {
        vec![
            added("nightly"),
            added("hourly"),
            armed("nightly", 100),
            armed("hourly", 10),
            armed("hourly", 20),
            fired("hourly", 10),
            ScheduleEvent::Disabled {
                id: "hourly".into(),
                reason: "three consecutive failures".into(),
            },
            added("weekly"),
            armed("weekly", 500),
            ScheduleEvent::Removed { id: "weekly".into() },
        ]
    }

    #[test]
    fn fold_of_empty_log_is_default_state() {
        assert_eq!(fold(&[]), ScheduleState::default());
    }

    #[test]
    fn replay_reproduces_state() {
        let log = sample_log();
        let once = fold(&log);
        // Same log replayed from scratch: identical state.
        assert_eq!(fold(&log), once);

        // Incremental replay equals whole-log fold at every prefix: crash
        // at any append boundary, restart, replay — same state.
        for k in 0..=log.len() {
            let mut state = fold(&log[..k]);
            for event in &log[k..] {
                apply(&mut state, event);
            }
            assert_eq!(state, once, "split at {k} must equal whole fold");
        }

        // Spot-check the derived state itself.
        assert_eq!(once.generation, 0);
        assert!(once.is_live("nightly"));
        assert!(!once.is_live("hourly")); // disabled
        assert!(!once.schedules.contains_key("weekly")); // removed
        assert_eq!(once.pending_count(), 1); // nightly@100 only
        assert_eq!(once.pending.get("nightly").map(Vec::as_slice), Some(&[100][..]));
    }

    #[test]
    fn fork_does_not_inherit_obligations() {
        let log = vec![
            added("nightly"),
            armed("nightly", 100),
            armed("nightly", 200),
            ScheduleEvent::Forked { child: 7 },
        ];

        // Parent prefix (pre-fork) keeps its obligations.
        let parent = fold(&log[..3]);
        assert_eq!(parent.generation, 0);
        assert_eq!(parent.pending_count(), 2);

        // Child generation: definitions survive, obligations do not.
        let child = fold(&log);
        assert_eq!(child.generation, 7);
        assert_eq!(child.pending_count(), 0);
        assert!(child.is_live("nightly"));
        assert_eq!(child.schedules["nightly"].spec, "cron:nightly");

        // Post-fork arms belong to the child and fire normally.
        let mut state = child;
        apply(&mut state, &armed("nightly", 300));
        apply(&mut state, &fired("nightly", 300));
        assert_eq!(state.pending_count(), 0);
        assert_eq!(state.generation, 7);
    }

    #[test]
    fn degenerate_fork_is_ignored() {
        let log = vec![added("a"), armed("a", 1), ScheduleEvent::Forked { child: 0 }];
        let state = fold(&log);
        // Fork naming the current generation changes nothing.
        assert_eq!(state.generation, 0);
        assert_eq!(state.pending_count(), 1);
    }

    #[test]
    fn armed_without_definition_is_ignored_fail_closed() {
        let state = fold(&[armed("ghost", 1)]);
        assert_eq!(state.pending_count(), 0);

        // Same for a disabled definition.
        let state = fold(&[
            added("x"),
            ScheduleEvent::Disabled {
                id: "x".into(),
                reason: "r".into(),
            },
            armed("x", 1),
        ]);
        assert_eq!(state.pending_count(), 0);

        // Explicit re-add re-enables.
        let state = fold(&[
            added("x"),
            ScheduleEvent::Disabled {
                id: "x".into(),
                reason: "r".into(),
            },
            added("x"),
            armed("x", 1),
        ]);
        assert_eq!(state.pending_count(), 1);
    }

    #[test]
    fn duplicate_arm_and_fire_are_idempotent() {
        let state = fold(&[added("a"), armed("a", 5), armed("a", 5), fired("a", 5), fired("a", 5)]);
        assert_eq!(state.pending_count(), 0);
    }

    #[test]
    fn torn_tail_truncation_tolerated() {
        let log = vec![added("a"), armed("a", 1), fired("a", 1)];
        let mut text = render_log(&log);
        // Simulate a torn write: chop the last line mid-byte.
        let cut = text.len() - 7;
        text.truncate(cut);

        let parsed = parse_log(&text);
        assert_eq!(parsed.len(), 2, "torn third event must be dropped");
        let state = fold(&parsed);
        assert!(state.is_live("a"));
        assert_eq!(state.pending_count(), 1); // arm survived, fire torn away

        // Fully garbage tail is also just a truncation.
        let mut garbage = render_log(&log[..1]);
        garbage.push_str("{\"kind\":\"ar");
        assert_eq!(parse_log(&garbage).len(), 1);
    }

    #[test]
    fn log_store_roundtrip_with_torn_tail() {
        let dir = tempfile::tempdir().unwrap();
        let store = LogStore::open(dir.path().join("schedule.jsonl"));

        // Missing file reads as empty log.
        assert_eq!(store.read_events().unwrap(), Vec::new());
        assert_eq!(store.state().unwrap(), ScheduleState::default());

        store.append(&added("nightly")).unwrap();
        store.append(&armed("nightly", 42)).unwrap();
        assert_eq!(store.state().unwrap(), fold(&[added("nightly"), armed("nightly", 42)]));

        // Reopen (new handle, same path): replay from disk reproduces state.
        let reopened = LogStore::open(store.path());
        assert_eq!(reopened.state().unwrap(), store.state().unwrap());

        // Torn tail on disk: truncate the last line, state folds cleanly.
        let raw = fs::read_to_string(store.path()).unwrap();
        let mut torn = raw.clone();
        torn.truncate(torn.len() - 5);
        fs::write(store.path(), torn).unwrap();
        let state = reopened.state().unwrap();
        assert_eq!(state.pending_count(), 0);
        assert!(state.is_live("nightly"));
    }

    // ---- E2: catch-up policy (FR3.2 / DS-#2) ----

    #[test]
    fn catch_up_backlog_collapses_to_latest_only() {
        // Three dues pass while offline; on return only the latest fires,
        // the stale two are dropped with an audit event — no replay storm.
        let state = fold(&[added("a"), armed("a", 10), armed("a", 20), armed("a", 30)]);
        let events = catch_up_events(&state, 100, 8);
        assert_eq!(
            events,
            vec![
                fired("a", 30),
                ScheduleEvent::Dropped {
                    id: "a".into(),
                    dues: vec![10, 20],
                },
            ]
        );
        let after = apply_all(&state, &events);
        assert_eq!(after.pending_count(), 0);
        // Exactly one fire for three missed dues.
        assert_eq!(
            events.iter().filter(|e| matches!(e, ScheduleEvent::Fired { .. })).count(),
            1
        );
    }

    #[test]
    fn catch_up_fixed_rate_pacing_drains_deterministically() {
        // Five schedules with backlog, rate 2: ticks fire 2/2/1, in id
        // order, latest-only per schedule.
        let mut log = Vec::new();
        for id in ["a", "b", "c", "d", "e"] {
            log.push(added(id));
            log.push(armed(id, 1));
            log.push(armed(id, 2));
        }
        let state = fold(&log);

        let tick1 = catch_up_events(&state, 100, 2);
        let s1 = apply_all(&state, &tick1);
        let tick2 = catch_up_events(&s1, 100, 2);
        let s2 = apply_all(&s1, &tick2);
        let tick3 = catch_up_events(&s2, 100, 2);
        let s3 = apply_all(&s2, &tick3);
        let tick4 = catch_up_events(&s3, 100, 2);

        let fired_ids = |events: &[ScheduleEvent]| -> Vec<(String, u64)> {
            events
                .iter()
                .filter_map(|e| match e {
                    ScheduleEvent::Fired { id, due } => Some((id.clone(), *due)),
                    _ => None,
                })
                .collect()
        };
        assert_eq!(fired_ids(&tick1), vec![("a".into(), 2), ("b".into(), 2)]);
        assert_eq!(fired_ids(&tick2), vec![("c".into(), 2), ("d".into(), 2)]);
        assert_eq!(fired_ids(&tick3), vec![("e".into(), 2)]);
        assert!(tick4.is_empty(), "drained state must produce no events");
        assert_eq!(s3.pending_count(), 0);

        // Determinism: replaying the same ticks from the same state gives
        // the identical sequences.
        assert_eq!(catch_up_events(&state, 100, 2), tick1);
        assert_eq!(catch_up_events(&apply_all(&state, &tick1), 100, 2), tick2);
    }

    #[test]
    fn catch_up_leaves_future_obligations_pending() {
        let state = fold(&[added("a"), armed("a", 10), armed("a", 500)]);
        let events = catch_up_events(&state, 100, 8);
        let after = apply_all(&state, &events);
        // Overdue due 10 fired (latest overdue = 10, no drop), 500 waits.
        assert_eq!(events, vec![fired("a", 10)]);
        assert_eq!(after.pending.get("a").map(Vec::as_slice), Some(&[500][..]));
    }

    #[test]
    fn catch_up_without_overdue_is_noop() {
        let state = fold(&[added("a"), armed("a", 500)]);
        assert!(catch_up_events(&state, 100, 8).is_empty());
        assert!(catch_up_events(&ScheduleState::default(), 100, 8).is_empty());
    }

    #[test]
    fn dropped_event_is_idempotent_and_fail_closed() {
        let drop = ScheduleEvent::Dropped {
            id: "a".into(),
            dues: vec![10, 20],
        };
        // Applying the same drop twice changes nothing the second time.
        let once = fold(&[added("a"), armed("a", 10), armed("a", 20), drop.clone()]);
        let twice = fold(&[added("a"), armed("a", 10), armed("a", 20), drop.clone(), drop]);
        assert_eq!(once, twice);
        assert_eq!(once.pending_count(), 0);
        // Dropping for an unknown id or unknown dues is a no-op.
        let unknown = fold(&[ScheduleEvent::Dropped {
            id: "ghost".into(),
            dues: vec![1],
        }]);
        assert_eq!(unknown, ScheduleState::default());
    }

    #[test]
    fn catch_up_survives_replay_through_the_log() {
        // The full engine loop shape: propose events, append to the log,
        // fold from scratch — crash-safe catch-up.
        let mut log = vec![added("a"), armed("a", 10), armed("a", 20), added("b"), armed("b", 30)];
        let mut state = fold(&log);
        loop {
            let events = catch_up_events(&state, 100, 1);
            if events.is_empty() {
                break;
            }
            log.extend(events.iter().cloned());
            state = fold(&log); // fold from scratch, as after a crash
        }
        assert_eq!(state.pending_count(), 0);
        // Log replay from zero reproduces the caught-up state exactly.
        assert_eq!(fold(&log), state);
        let fires: Vec<u64> = log
            .iter()
            .filter_map(|e| match e {
                ScheduleEvent::Fired { due, .. } => Some(*due),
                _ => None,
            })
            .collect();
        assert_eq!(fires, vec![20, 30], "latest-only per schedule, id order");
    }
}
