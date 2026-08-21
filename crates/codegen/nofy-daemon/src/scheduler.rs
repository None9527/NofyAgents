//! Daemon scheduling service (integration Q4): the daemon's scheduling
//! seam over `nofy-scheduler`.
//!
//! **DEFAULT-OFF**: a fresh service schedules NOTHING until explicitly
//! enabled — every mutating or producing entry point refuses (or yields
//! nothing) while disabled. All POLICY stays in the core: the event
//! fold, missed-window catch-up (FR3.2), cron grammar (FR3.5), session
//! fence (FR3.7), and failure self-disable (FR3.4). This service is
//! thin glue that records the event log and delegates.

use nofy_scheduler::fence::{Delivery, SessionFence, SubmitOutcome};
use nofy_scheduler::{LogStore, ScheduleEvent, ScheduleState};

/// Consecutive failures before a schedule self-disables (W-5, FR3.4).
pub const SELF_DISABLE_THRESHOLD: u64 = 3;

/// The daemon-side scheduling service.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SchedulerService {
    enabled: bool,
    events: Vec<ScheduleEvent>,
    state: ScheduleState,
    fence: SessionFence,
    /// Durable log sink (R3 wiring): None = in-memory only.
    store: Option<LogStore>,
}

impl Default for SchedulerService {
    fn default() -> Self {
        Self::new()
    }
}

impl SchedulerService {
    /// A fresh service is DISABLED (default-off).
    pub fn new() -> Self {
        Self {
            enabled: false,
            events: Vec::new(),
            state: ScheduleState::default(),
            fence: SessionFence::default(),
            store: None,
        }
    }

    /// Attach the durable sink (R3): existing in-memory events are
    /// flushed to disk first, later events append to both.
    pub fn attach_store(&mut self, store: LogStore) -> std::io::Result<()> {
        for event in &self.events {
            store.append(event)?;
        }
        self.store = Some(store);
        Ok(())
    }

    /// Recover a service from the durable store (R3): fold the on-disk
    /// log. A non-empty log PROVES the service was enabled before the
    /// crash (events only enter through enabled paths), so recovery
    /// restores the enabled state; an empty/missing log yields a fresh
    /// default-off service.
    pub fn recover(store: LogStore) -> std::io::Result<Self> {
        let events = store.read_events()?;
        let state = nofy_scheduler::fold(&events);
        let enabled = !events.is_empty();
        Ok(Self { enabled, events, state, fence: SessionFence::default(), store: Some(store) })
    }

    pub fn enabled(&self) -> bool {
        self.enabled
    }

    /// Explicit opt-in: scheduling starts only by a deliberate act.
    pub fn enable(&mut self) {
        self.enabled = true;
    }

    fn apply_and_record(&mut self, event: ScheduleEvent) {
        self.persist(&event);
        nofy_scheduler::apply(&mut self.state, &event);
        self.events.push(event);
    }

    /// Disk append only (for events produced in batches by the core).
    fn persist(&self, event: &ScheduleEvent) {
        if let Some(store) = &self.store {
            if let Err(e) = store.append(event) {
                tracing::error!(?e, "schedule log append failed; durability degraded");
            }
        }
    }

    /// Add (or re-enable) a schedule. Cron specs are validated by the
    /// core grammar, fail-loud. Refused while disabled. `goal`/`cwd`
    /// carry the run payload (W-5); `once` self-disables after the first
    /// successful run.
    pub fn add_schedule(
        &mut self,
        id: &str,
        cron_spec: &str,
        goal: Option<&str>,
        cwd: Option<&str>,
        once: bool,
    ) -> Result<(), String> {
        if !self.enabled {
            return Err("scheduler disabled (default-off)".into());
        }
        // Grammar gate: an unparseable spec never enters the log.
        nofy_scheduler::grammar::parse(cron_spec)?;
        self.apply_and_record(ScheduleEvent::Added {
            id: id.to_string(),
            spec: cron_spec.to_string(),
            goal: goal.map(String::from),
            cwd: cwd.map(String::from),
            once,
        });
        Ok(())
    }

    /// Remove a schedule and every pending obligation for it.
    pub fn remove_schedule(&mut self, id: &str) -> Result<(), String> {
        if !self.enabled {
            return Err("scheduler disabled (default-off)".into());
        }
        self.apply_and_record(ScheduleEvent::Removed { id: id.to_string() });
        Ok(())
    }

    /// Arm a firing obligation. The fold ignores arms against dead ids
    /// (fail-closed), so this never resurrects a removed/disabled
    /// schedule.
    pub fn arm(&mut self, id: &str, due: u64) -> Result<(), String> {
        if !self.enabled {
            return Err("scheduler disabled (default-off)".into());
        }
        self.apply_and_record(ScheduleEvent::Armed { id: id.to_string(), due });
        Ok(())
    }

    /// Report a run outcome (drives backoff + self-disable in the core).
    /// A failure also runs the watchdog: schedules over the consecutive-
    /// failure threshold self-disable with an audit trail (W-5).
    pub fn run_failed(&mut self, id: &str, run_id: u64) -> Result<(), String> {
        if !self.enabled {
            return Err("scheduler disabled (default-off)".into());
        }
        self.apply_and_record(ScheduleEvent::RunFailed { id: id.to_string(), run_id });
        for event in self.watchdog(SELF_DISABLE_THRESHOLD) {
            let _ = event; // watchdog persists + applies internally
        }
        Ok(())
    }

    /// Report a successful run: resets consecutive failures. One-shot
    /// schedules (`once`) self-disable after their first success (W-5).
    pub fn run_succeeded(&mut self, id: &str, run_id: u64) -> Result<(), String> {
        if !self.enabled {
            return Err("scheduler disabled (default-off)".into());
        }
        let once = self
            .state
            .schedules
            .get(id)
            .map(|entry| entry.once)
            .unwrap_or(false);
        self.apply_and_record(ScheduleEvent::RunSucceeded { id: id.to_string(), run_id });
        if once {
            self.apply_and_record(ScheduleEvent::Disabled {
                id: id.to_string(),
                reason: "one-shot completed".to_string(),
            });
        }
        Ok(())
    }

    /// Start the run for an obligation the core already fired (W-5):
    /// journals `RunStarted` only — catch-up recorded the `Fired` event.
    /// The due timestamp doubles as the run id (one obligation per
    /// (id, due)).
    pub fn start_run(&mut self, id: &str, run_id: u64, now: u64) -> Result<(), String> {
        if !self.enabled {
            return Err("scheduler disabled (default-off)".into());
        }
        if !self.state.is_live(id) {
            return Err(format!("schedule '{id}' is not live"));
        }
        self.apply_and_record(ScheduleEvent::RunStarted {
            id: id.to_string(),
            run_id,
            at: now,
        });
        Ok(())
    }

    /// Wedge watchdog (W-5): in-flight runs older than `timeout` at `now`
    /// are failed — a wedged run must not hold the schedule forever. The
    /// failure path then applies the self-disable threshold.
    pub fn fail_stale_runs(&mut self, now: u64, timeout: u64) {
        if !self.enabled {
            return;
        }
        let stale = nofy_scheduler::cron::watchdog_events(&self.state, now, timeout);
        for event in &stale {
            self.persist(event);
            nofy_scheduler::apply(&mut self.state, event);
            self.events.push(event.clone());
        }
        if !stale.is_empty() {
            let _ = self.watchdog(SELF_DISABLE_THRESHOLD);
        }
    }

    /// Crash repair (W-5 boot, OC-F9): in-flight runs from the previous
    /// life are lies — mark them failed so backoff and self-disable
    /// accounting stay honest.
    pub fn repair_inflight(&mut self) {
        let repairs = nofy_scheduler::cron::startup_repair(&self.state);
        for event in &repairs {
            self.persist(event);
            nofy_scheduler::apply(&mut self.state, event);
            self.events.push(event.clone());
        }
        if !repairs.is_empty() {
            let _ = self.watchdog(SELF_DISABLE_THRESHOLD);
        }
    }

    /// Missed-window catch-up (FR3.2): the core decides which overdue
    /// dues fire and which drop, rate-capped. Yields nothing while
    /// disabled.
    pub fn catch_up(&mut self, now: u64, rate: usize) -> Vec<ScheduleEvent> {
        if !self.enabled {
            return Vec::new();
        }
        let events = nofy_scheduler::catch_up_events(&self.state, now, rate);
        for event in &events {
            self.persist(event);
            nofy_scheduler::apply(&mut self.state, event);
        }
        self.events.extend(events.clone());
        events
    }

    /// Failure watchdog (FR3.4): self-disable schedules over the
    /// threshold, leaving an audit trail. Yields nothing while disabled.
    pub fn watchdog(&mut self, threshold: u64) -> Vec<ScheduleEvent> {
        if !self.enabled {
            return Vec::new();
        }
        let events = nofy_scheduler::cron::self_disable_events(&self.state, threshold);
        for event in &events {
            self.persist(event);
            nofy_scheduler::apply(&mut self.state, event);
        }
        self.events.extend(events.clone());
        events
    }

    // Session fence pass-throughs (FR3.7): scheduled deliveries hold
    // while their session works; the controller gate releases them.

    pub fn session_active(&mut self, session: &str) {
        self.fence.session_active(session);
    }

    pub fn session_idle(&mut self, session: &str) {
        self.fence.session_idle(session);
    }

    pub fn submit_delivery(&mut self, delivery: Delivery) -> SubmitOutcome {
        self.fence.submit(delivery)
    }

    pub fn release(&mut self, session: &str) -> Vec<Delivery> {
        self.fence.release(session)
    }

    pub fn pending_count(&self) -> usize {
        self.state.pending_count()
    }

    /// Project the live schedule table for the control surface (batch U):
    /// (id, spec, disable reason, pending obligations, goal, once). Pure
    /// projection of core state — the fold stays the only authority.
    pub fn snapshot(&self) -> Vec<(String, String, Option<String>, usize, Option<String>, bool)> {
        self.state
            .schedules
            .iter()
            .map(|(id, entry)| {
                let pending = self.state.pending.get(id).map(Vec::len).unwrap_or(0);
                (
                    id.clone(),
                    entry.spec.clone(),
                    entry.disabled_reason.clone(),
                    pending,
                    entry.goal.clone(),
                    entry.once,
                )
            })
            .collect()
    }

    pub fn is_live(&self, id: &str) -> bool {
        self.state.is_live(id)
    }

    /// Consecutive failures for a schedule (W-5 strike accounting).
    pub fn consecutive_failures(&self, id: &str) -> u64 {
        self.state.consecutive_failures.get(id).copied().unwrap_or(0)
    }

    /// Discharge a due obligation and start its run (W-5): journals
    /// `Fired` + `RunStarted`. The due timestamp doubles as the run id —
    /// one obligation per (id, due) makes it unique per schedule.
    pub fn fire(&mut self, id: &str, due: u64, now: u64) -> Result<u64, String> {
        if !self.enabled {
            return Err("scheduler disabled (default-off)".into());
        }
        if !self.state.is_live(id) {
            return Err(format!("schedule '{id}' is not live"));
        }
        self.apply_and_record(ScheduleEvent::Fired { id: id.to_string(), due });
        self.apply_and_record(ScheduleEvent::RunStarted {
            id: id.to_string(),
            run_id: due,
            at: now,
        });
        Ok(due)
    }

    /// Live schedules with everything the clock thread needs (W-5):
    /// (id, spec, goal, cwd, pending dues, has in-flight run).
    pub fn live_with_payload(
        &self,
    ) -> Vec<(String, String, Option<String>, Option<String>, Vec<u64>, bool)> {
        self.state
            .schedules
            .iter()
            .filter(|(_, entry)| entry.disabled_reason.is_none())
            .map(|(id, entry)| {
                (
                    id.clone(),
                    entry.spec.clone(),
                    entry.goal.clone(),
                    entry.cwd.clone(),
                    self.state.pending.get(id).cloned().unwrap_or_default(),
                    self.state.inflight.contains_key(id),
                )
            })
            .collect()
    }

    pub fn event_count(&self) -> usize {
        self.events.len()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_off_refuses_everything_until_enabled() {
        let mut svc = SchedulerService::new();
        assert!(!svc.enabled());
        assert!(svc.add_schedule("j1", "* * * * *", None, None, false).is_err());
        assert!(svc.arm("j1", 10).is_err());
        assert!(svc.catch_up(100, 4).is_empty(), "disabled service produces nothing");
        assert!(svc.watchdog(3).is_empty());
        assert_eq!(svc.event_count(), 0, "nothing entered the log while off");
        svc.enable();
        svc.add_schedule("j1", "* * * * *", None, None, false).unwrap();
        assert!(svc.is_live("j1"));
    }

    #[test]
    fn grammar_gate_refuses_bad_specs_before_the_log() {
        let mut svc = SchedulerService::new();
        svc.enable();
        assert!(svc.add_schedule("bad", "not a cron", None, None, false).is_err());
        assert_eq!(svc.event_count(), 0, "unparseable specs never enter the log");
        assert!(!svc.is_live("bad"));
    }

    #[test]
    fn catch_up_fires_overdue_through_core_policy() {
        let mut svc = SchedulerService::new();
        svc.enable();
        svc.add_schedule("j1", "* * * * *", None, None, false).unwrap();
        svc.arm("j1", 10).unwrap();
        svc.arm("j1", 20).unwrap();
        assert_eq!(svc.pending_count(), 2);
        let events = svc.catch_up(100, 4);
        assert!(!events.is_empty(), "overdue dues fire via the core fold");
        assert_eq!(svc.pending_count(), 0, "catch-up discharged the obligations");
    }

    #[test]
    fn watchdog_self_disables_repeated_failures() {
        let mut svc = SchedulerService::new();
        svc.enable();
        svc.add_schedule("flaky", "* * * * *", None, None, false).unwrap();
        for run in 1..=3 {
            svc.run_failed("flaky", run).unwrap();
        }
        // W-5: run_failed runs the watchdog itself — the third failure
        // crosses the threshold and self-disables immediately.
        assert!(!svc.is_live("flaky"), "self-disabled schedule is not live");
        assert!(svc.watchdog(3).is_empty(), "already disabled: nothing left to do");
    }

    #[test]
    fn fence_holds_deliveries_for_active_sessions() {
        let mut svc = SchedulerService::new();
        svc.enable();
        svc.session_active("sess-1");
        let held = svc.submit_delivery(Delivery { job_id: 1, session: "sess-1".into() });
        assert_eq!(held, SubmitOutcome::Held);
        let direct = svc.submit_delivery(Delivery { job_id: 2, session: "sess-2".into() });
        assert_eq!(direct, SubmitOutcome::Delivered);
        // Idle alone does not release; the controller gate does.
        svc.session_idle("sess-1");
        let released = svc.release("sess-1");
        assert_eq!(released, vec![Delivery { job_id: 1, session: "sess-1".into() }]);
    }

    #[test]
    fn durable_store_survives_restart_and_restores_enabled_state() {
        // R3: schedules armed before a crash come back from disk, and a
        // non-empty log proves the service was enabled.
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("schedule.jsonl");
        {
            let mut svc = SchedulerService::new();
            svc.enable();
            svc.add_schedule("j1", "* * * * *", None, None, false).unwrap();
            svc.arm("j1", 10).unwrap();
            svc.attach_store(LogStore::open(&path)).unwrap();
            svc.arm("j1", 20).unwrap();
        }
        // "Crash": everything in memory is gone. Recover from disk.
        let recovered = SchedulerService::recover(LogStore::open(&path)).unwrap();
        assert!(recovered.enabled(), "a non-empty log proves prior enablement");
        assert!(recovered.is_live("j1"));
        assert_eq!(recovered.pending_count(), 2, "both armed dues survived");
        assert_eq!(recovered.event_count(), 3);
    }

    #[test]
    fn recovery_from_empty_log_is_default_off() {
        let dir = tempfile::tempdir().unwrap();
        let svc = SchedulerService::recover(LogStore::open(dir.path().join("missing.jsonl"))).unwrap();
        assert!(!svc.enabled(), "no history = default-off");
        assert_eq!(svc.event_count(), 0);
    }

    #[test]
    fn default_is_a_fresh_disabled_service() {
        let svc = SchedulerService::default();
        assert_eq!(svc, SchedulerService::new());
        assert!(!svc.enabled());
    }

    #[test]
    fn remove_and_run_failed_refuse_while_disabled() {
        let mut svc = SchedulerService::new();
        assert!(svc.remove_schedule("j1").is_err());
        assert!(svc.run_failed("j1", 1).is_err());
        assert_eq!(svc.event_count(), 0, "refusals never enter the log");
    }

    #[test]
    fn disk_failure_degrades_durability_not_service() {
        // The durable sink's path occupied by a directory: appends fail,
        // the service degrades loud (log line) and keeps working in memory.
        let dir = tempfile::tempdir().unwrap();
        std::fs::create_dir_all(dir.path().join("schedule.jsonl")).unwrap();
        let mut svc = SchedulerService::new();
        svc.attach_store(LogStore::open(dir.path().join("schedule.jsonl")))
            .unwrap();
        svc.enable();
        svc.add_schedule("j1", "* * * * *", None, None, false).unwrap();
        assert_eq!(svc.event_count(), 1, "the event stays in memory");
        assert!(svc.is_live("j1"));
    }

    #[test]
    fn payload_survives_the_fold_and_projects_for_the_clock() {
        // W-5: goal/cwd/once travel through Added into the entry and back
        // out through live_with_payload for the trigger bridge.
        let mut svc = SchedulerService::new();
        svc.enable();
        svc.add_schedule("daily", "0 9 * * *", Some("water the plants"), Some("/home/a"), true)
            .unwrap();
        let rows = svc.live_with_payload();
        assert_eq!(rows.len(), 1);
        let (id, spec, goal, cwd, dues, inflight) = &rows[0];
        assert_eq!(id, "daily");
        assert_eq!(spec, "0 9 * * *");
        assert_eq!(goal.as_deref(), Some("water the plants"));
        assert_eq!(cwd.as_deref(), Some("/home/a"));
        assert!(dues.is_empty(), "nothing armed yet");
        assert!(!inflight);
    }

    #[test]
    fn fire_discharges_a_due_and_starts_the_run() {
        let mut svc = SchedulerService::new();
        svc.enable();
        svc.add_schedule("j1", "* * * * *", Some("goal"), None, false).unwrap();
        svc.arm("j1", 100).unwrap();
        let run_id = svc.fire("j1", 100, 101).unwrap();
        assert_eq!(run_id, 100, "the due timestamp doubles as the run id");
        assert_eq!(svc.pending_count(), 0, "the obligation is discharged");
        let (_, _, _, _, dues, inflight) = &svc.live_with_payload()[0];
        assert!(dues.is_empty());
        assert!(inflight, "the run is in flight until settled");
    }

    #[test]
    fn fire_refuses_dead_schedules() {
        let mut svc = SchedulerService::new();
        svc.enable();
        assert!(svc.fire("ghost", 1, 1).is_err(), "never-defined id fails loud");
        svc.add_schedule("j1", "* * * * *", None, None, false).unwrap();
        svc.remove_schedule("j1").unwrap();
        assert!(svc.fire("j1", 1, 1).is_err(), "removed id fails loud");
    }

    #[test]
    fn one_shot_self_disables_after_first_success() {
        let mut svc = SchedulerService::new();
        svc.enable();
        svc.add_schedule("once", "* * * * *", Some("single goal"), None, true).unwrap();
        svc.arm("once", 50).unwrap();
        let run_id = svc.fire("once", 50, 51).unwrap();
        svc.run_succeeded("once", run_id).unwrap();
        assert!(!svc.is_live("once"), "one-shot completed: self-disabled");
        let rows = svc.live_with_payload();
        assert!(rows.is_empty(), "disabled schedules are not live rows");
    }

    #[test]
    fn success_resets_failures_below_the_threshold() {
        let mut svc = SchedulerService::new();
        svc.enable();
        svc.add_schedule("j1", "* * * * *", None, None, false).unwrap();
        svc.run_failed("j1", 1).unwrap();
        svc.run_failed("j1", 2).unwrap();
        svc.run_succeeded("j1", 3).unwrap();
        assert!(svc.is_live("j1"), "a success resets the streak before the threshold");
        svc.run_failed("j1", 4).unwrap();
        svc.run_failed("j1", 5).unwrap();
        assert!(svc.is_live("j1"), "the reset streak needs three fresh failures");
    }
}
