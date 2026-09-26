//! W-5 trigger bridge: the clock that turns live schedule definitions
//! into provider runs.
//!
//! The scheduler core is pure policy (fold + catch-up + watchdog); this
//! module is the daemon-side loop that gives it a notion of wall time:
//! every [`TICK`] it fires overdue obligations (core catch-up policy,
//! latest-only), arms the next due for idle schedules (cron grammar), and
//! fails wedged in-flight runs. Fired runs are enqueued on
//! `DaemonStores::sched_runs` for provider pickup via `TaskPoll`; the
//! matching `TaskResult` settles them back through the service.

use std::time::Duration;

use crate::runlife::DaemonStores;

/// Clock granularity: how often the bridge scans for dues.
pub const TICK: Duration = Duration::from_secs(5);
/// Catch-up pace: schedules drained per tick (core policy is latest-only).
pub const CATCH_RATE: usize = 4;
/// An in-flight run older than this is wedged and failed (30 minutes).
pub const RUN_TIMEOUT_SECS: u64 = 30 * 60;

/// Spawn the clock thread. It lives as long as the daemon.
pub fn spawn(stores: DaemonStores) -> std::thread::JoinHandle<()> {
    std::thread::Builder::new()
        .name("nofy-sched-clock".into())
        .spawn(move || {
            loop {
                std::thread::sleep(TICK);
                tick(&stores);
            }
        })
        .expect("schedule clock thread spawns")
}

/// One clock scan. Returns the fired runs as
/// (schedule id, run id, goal, cwd) — the exact entries enqueued for
/// provider pickup (exposed for tests).
pub fn tick(stores: &DaemonStores) -> Vec<(String, u64, String, Option<String>)> {
    let now = crate::wire::secs_now();
    let mut fired = Vec::new();
    let mut svc = stores.scheduler.lock().unwrap();
    if !svc.enabled() {
        return fired;
    }
    // Payload snapshot before firing: catch-up events carry only ids.
    let payload: std::collections::BTreeMap<String, (Option<String>, Option<String>)> = svc
        .live_with_payload()
        .into_iter()
        .map(|(id, _, goal, cwd, _, _)| (id, (goal, cwd)))
        .collect();
    // 1. Missed-window catch-up fires overdue dues (latest-only, paced).
    for event in svc.catch_up(now, CATCH_RATE) {
        if let nofy_scheduler::ScheduleEvent::Fired { id, due } = event {
            if let Err(e) = svc.start_run(&id, due, now) {
                tracing::warn!(schedule = %id, error = %e, "fired run could not start");
                continue;
            }
            let (goal, cwd) = payload.get(&id).cloned().unwrap_or((None, None));
            match goal {
                Some(goal) => {
                    stores.sched_runs.lock().unwrap().push_back((
                        id.clone(),
                        due,
                        goal.clone(),
                        cwd.clone(),
                    ));
                    fired.push((id, due, goal, cwd));
                }
                None => {
                    // A schedule without a goal has nothing to run: fail
                    // loud instead of dispatching an empty run. Three
                    // strikes self-disable it with an audit trail.
                    tracing::warn!(schedule = %id, "schedule has no goal; run failed");
                    let _ = svc.run_failed(&id, due);
                }
            }
        }
    }
    // 2. Arm the next obligation for idle live schedules.
    for (id, spec, _, _, dues, inflight) in svc.live_with_payload() {
        if !dues.is_empty() || inflight {
            continue;
        }
        if let Some(due) = next_due_unix(&spec, now) {
            let _ = svc.arm(&id, due);
        }
    }
    // 3. Wedged in-flight runs fail loud.
    svc.fail_stale_runs(now, RUN_TIMEOUT_SECS);
    fired
}

/// Next fire time of a cron spec as unix seconds, strictly after `now`.
/// Unparseable specs arm nothing (the grammar gate already refused them
/// at add time; this guards against hand-edited logs).
fn next_due_unix(spec: &str, now: u64) -> Option<u64> {
    let expr = nofy_scheduler::grammar::parse(spec).ok()?;
    let from = chrono::DateTime::from_timestamp(now as i64, 0)?.naive_utc();
    let next = expr.next_after(from)?;
    Some(next.and_utc().timestamp().max(0) as u64)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::scheduler::SchedulerService;
    use std::sync::{Arc, Mutex};

    fn stores_at(dir: &std::path::Path) -> DaemonStores {
        DaemonStores {
            journal: nofy_orchestra::taskjournal::TaskLogStore::open(
                dir.join("task_journal.jsonl"),
            ),
            runs: crate::runstore::RunStore::open(dir.join("run_store.json")),
            scheduler: Arc::new(Mutex::new(SchedulerService::new())),
            sched_runs: Arc::new(Mutex::new(std::collections::VecDeque::new())),
        }
    }

    #[test]
    fn disabled_clock_does_nothing() {
        let dir = tempfile::tempdir().unwrap();
        let stores = stores_at(dir.path());
        assert!(tick(&stores).is_empty());
        assert!(stores.sched_runs.lock().unwrap().is_empty());
    }

    #[test]
    fn armed_overdue_due_fires_and_enqueues_with_payload() {
        let dir = tempfile::tempdir().unwrap();
        let stores = stores_at(dir.path());
        let now = crate::wire::secs_now();
        {
            let mut svc = stores.scheduler.lock().unwrap();
            svc.enable();
            svc.add_schedule("j1", "* * * * *", Some("water plants"), Some("/tmp"), false)
                .unwrap();
            svc.arm("j1", now - 5).unwrap();
        }
        let fired = tick(&stores);
        assert_eq!(fired.len(), 1, "the overdue due fires via catch-up");
        let (id, run_id, goal, cwd) = &fired[0];
        assert_eq!(id, "j1");
        assert_eq!(goal, "water plants");
        assert_eq!(cwd.as_deref(), Some("/tmp"));
        let queue = stores.sched_runs.lock().unwrap();
        assert_eq!(queue.len(), 1);
        assert_eq!(queue[0].1, *run_id);
        let svc = stores.scheduler.lock().unwrap();
        assert_eq!(svc.pending_count(), 0, "obligation discharged");
    }

    #[test]
    fn idle_live_schedule_gets_armed_next_due() {
        let dir = tempfile::tempdir().unwrap();
        let stores = stores_at(dir.path());
        {
            let mut svc = stores.scheduler.lock().unwrap();
            svc.enable();
            svc.add_schedule("j1", "* * * * *", Some("goal"), None, false)
                .unwrap();
        }
        assert!(tick(&stores).is_empty(), "nothing due yet");
        let svc = stores.scheduler.lock().unwrap();
        assert_eq!(svc.pending_count(), 1, "the next minute boundary is armed");
    }

    #[test]
    fn goalless_schedule_fails_loud_instead_of_dispatching() {
        let dir = tempfile::tempdir().unwrap();
        let stores = stores_at(dir.path());
        let now = crate::wire::secs_now();
        {
            let mut svc = stores.scheduler.lock().unwrap();
            svc.enable();
            svc.add_schedule("empty", "* * * * *", None, None, false)
                .unwrap();
            svc.arm("empty", now - 5).unwrap();
        }
        assert!(tick(&stores).is_empty(), "no run dispatched");
        assert!(stores.sched_runs.lock().unwrap().is_empty());
        let svc = stores.scheduler.lock().unwrap();
        // The strike is recorded: three of these self-disable the schedule.
        assert_eq!(svc.consecutive_failures("empty"), 1);
        assert!(svc.is_live("empty"), "one strike is not yet the threshold");
    }

    #[test]
    fn next_due_unix_roundtrips_a_minute_spec() {
        let now = crate::wire::secs_now();
        let due = next_due_unix("* * * * *", now).unwrap();
        assert!(due > now, "strictly in the future");
        assert!(due <= now + 61, "a minute spec fires within a minute");
        assert!(next_due_unix("not a cron", now).is_none());
    }
}
