//! Cron engine policy (FR3.4 / OC-F9): startup repair, watchdog, graded
//! backoff, consecutive-failure self-disable.
//!
//! Spec interpretation (the cron grammar) is a separate concern; this
//! module is engine policy over the schedule fold, and it is pure: every
//! policy PROPOSES events, the log stays the source of truth. The engine
//! loop shape is: propose → append → fold (crash at any point replays).

use crate::{ScheduleEvent, ScheduleState};

/// Startup repair (OC-F9): after a crash, every in-flight run is a lie —
/// the process that owned it is gone. Mark each one failed so backoff and
/// self-disable accounting stay honest. Deterministic: id order.
pub fn startup_repair(state: &ScheduleState) -> Vec<ScheduleEvent> {
    state
        .inflight
        .iter()
        .map(|(id, (run_id, _))| ScheduleEvent::RunFailed {
            id: id.clone(),
            run_id: *run_id,
        })
        .collect()
}

/// Watchdog: in-flight runs older than `timeout` at `now` are failed.
/// A wedged run must not hold the schedule forever.
pub fn watchdog_events(state: &ScheduleState, now: u64, timeout: u64) -> Vec<ScheduleEvent> {
    state
        .inflight
        .iter()
        .filter(|(_, (_, at))| now >= at.saturating_add(timeout))
        .map(|(id, (run_id, _))| ScheduleEvent::RunFailed {
            id: id.clone(),
            run_id: *run_id,
        })
        .collect()
}

/// Graded backoff: delay before the next attempt after `failures` in a
/// row — `base * 2^(failures-1)`, capped. `failures == 0` means no
/// backoff at all. Saturation-safe.
pub fn backoff_delay(failures: u64, base: u64, cap: u64) -> u64 {
    if failures == 0 {
        return 0;
    }
    let shift = (failures - 1).min(63);
    base.saturating_mul(1u64 << shift).min(cap)
}

/// Self-disable (OC-F9): live schedules at/over the consecutive-failure
/// threshold are disabled, and the [`ScheduleEvent::Disabled`] reason IS
/// the audit trail (「连续失败自禁用留痕」). Already-disabled schedules
/// are not re-disabled. Deterministic: id order.
pub fn self_disable_events(state: &ScheduleState, threshold: u64) -> Vec<ScheduleEvent> {
    state
        .consecutive_failures
        .iter()
        .filter(|(id, failures)| **failures >= threshold && state.is_live(id))
        .map(|(id, failures)| ScheduleEvent::Disabled {
            id: id.clone(),
            reason: format!("{failures} consecutive failures"),
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{apply, fold};

    fn added(id: &str) -> ScheduleEvent {
        ScheduleEvent::Added {
            id: id.into(),
            spec: format!("cron:{id}"),
            goal: None,
            cwd: None,
            once: false,
        }
    }

    fn started(id: &str, run_id: u64, at: u64) -> ScheduleEvent {
        ScheduleEvent::RunStarted {
            id: id.into(),
            run_id,
            at,
        }
    }

    fn apply_all(state: &ScheduleState, events: &[ScheduleEvent]) -> ScheduleState {
        let mut next = state.clone();
        for event in events {
            apply(&mut next, event);
        }
        next
    }

    #[test]
    fn startup_repair_marks_inflight_failed() {
        let state = fold(&[added("a"), started("a", 1, 100), added("b"), started("b", 7, 200)]);
        assert_eq!(state.inflight.len(), 2);

        let repair = startup_repair(&state);
        assert_eq!(repair.len(), 2, "both in-flight runs must be repaired");
        let after = apply_all(&state, &repair);
        assert!(after.inflight.is_empty());
        assert_eq!(after.consecutive_failures.get("a"), Some(&1));
        assert_eq!(after.consecutive_failures.get("b"), Some(&1));
        // Repair is deterministic (id order).
        assert_eq!(startup_repair(&state), repair);
    }

    #[test]
    fn three_crashes_then_self_disable_with_trail() {
        // Simulate three crash cycles: start → crash → repair, ×3.
        let mut log = vec![added("flaky")];
        for run in 1..=3u64 {
            log.push(started("flaky", run, run * 100));
            let state = fold(&log);
            log.extend(startup_repair(&state));
        }
        let state = fold(&log);
        assert_eq!(state.consecutive_failures.get("flaky"), Some(&3));

        let disables = self_disable_events(&state, 3);
        assert_eq!(disables.len(), 1);
        // The disable reason must carry the failure count.
        assert!(matches!(
            &disables[0],
            ScheduleEvent::Disabled { id, reason } if id == "flaky" && reason.contains("3")
        ));
        let after = apply_all(&state, &disables);
        assert!(!after.is_live("flaky"));
        // Already disabled: no re-disable.
        assert!(self_disable_events(&after, 3).is_empty());
    }

    #[test]
    fn success_resets_failure_streak() {
        let log = vec![
            added("a"),
            started("a", 1, 10),
            ScheduleEvent::RunFailed {
                id: "a".into(),
                run_id: 1,
            },
            started("a", 2, 20),
            ScheduleEvent::RunSucceeded {
                id: "a".into(),
                run_id: 2,
            },
        ];
        let state = fold(&log);
        assert!(!state.consecutive_failures.contains_key("a"));
        assert!(self_disable_events(&state, 1).is_empty());
    }

    #[test]
    fn stale_result_with_wrong_run_id_is_ignored() {
        let state = fold(&[
            added("a"),
            started("a", 5, 10),
            ScheduleEvent::RunSucceeded {
                id: "a".into(),
                run_id: 4, // stale: run 4 is not in flight
            },
        ]);
        assert_eq!(state.inflight.get("a"), Some(&(5, 10)), "in-flight must survive stale result");
    }

    #[test]
    fn run_lifecycle_is_fail_closed_without_definition() {
        let state = fold(&[started("ghost", 1, 10)]);
        assert!(state.inflight.is_empty());
    }

    #[test]
    fn watchdog_fails_only_stale_runs() {
        let state = fold(&[added("a"), started("a", 1, 100), added("b"), started("b", 2, 900)]);
        let events = watchdog_events(&state, 1000, 300);
        assert_eq!(events.len(), 1, "only the run older than the timeout");
        assert!(matches!(
            &events[0],
            ScheduleEvent::RunFailed { id, run_id } if id == "a" && *run_id == 1
        ));
        let after = apply_all(&state, &events);
        assert_eq!(after.inflight.len(), 1);
        assert!(after.inflight.contains_key("b"));
    }

    #[test]
    fn backoff_is_graded_and_capped() {
        assert_eq!(backoff_delay(0, 10, 10_000), 0);
        assert_eq!(backoff_delay(1, 10, 10_000), 10);
        assert_eq!(backoff_delay(2, 10, 10_000), 20);
        assert_eq!(backoff_delay(3, 10, 10_000), 40);
        assert_eq!(backoff_delay(4, 10, 10_000), 80);
        assert_eq!(backoff_delay(30, 10, 10_000), 10_000, "must cap");
        assert_eq!(backoff_delay(u64::MAX, 10, 10_000), 10_000, "no overflow");
    }

    #[test]
    fn engine_loop_catch_up_plus_repair_replays_from_scratch() {
        // Full boot shape: missed dues caught up latest-only, crashed run
        // repaired — then fold-from-scratch reproduces it all.
        let mut log = vec![added("a"), crate::ScheduleEvent::Armed { id: "a".into(), due: 10 }, started("a", 1, 50)];
        let state = fold(&log);
        log.extend(crate::catch_up_events(&state, 200, 4));
        log.extend(startup_repair(&fold(&log)));
        let final_state = fold(&log);
        assert_eq!(final_state.pending_count(), 0);
        assert!(final_state.inflight.is_empty());
        assert_eq!(final_state.consecutive_failures.get("a"), Some(&1));
    }
}
