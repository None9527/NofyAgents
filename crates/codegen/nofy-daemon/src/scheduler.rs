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
    /// core grammar, fail-loud. Refused while disabled.
    pub fn add_schedule(&mut self, id: &str, cron_spec: &str) -> Result<(), String> {
        if !self.enabled {
            return Err("scheduler disabled (default-off)".into());
        }
        // Grammar gate: an unparseable spec never enters the log.
        nofy_scheduler::grammar::parse(cron_spec)?;
        self.apply_and_record(ScheduleEvent::Added {
            id: id.to_string(),
            spec: cron_spec.to_string(),
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
    pub fn run_failed(&mut self, id: &str, run_id: u64) -> Result<(), String> {
        if !self.enabled {
            return Err("scheduler disabled (default-off)".into());
        }
        self.apply_and_record(ScheduleEvent::RunFailed { id: id.to_string(), run_id });
        Ok(())
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
    /// (id, spec, disable reason, pending obligations). Pure projection of
    /// core state — the fold stays the only authority.
    pub fn snapshot(&self) -> Vec<(String, String, Option<String>, usize)> {
        self.state
            .schedules
            .iter()
            .map(|(id, entry)| {
                let pending = self.state.pending.get(id).map(Vec::len).unwrap_or(0);
                (id.clone(), entry.spec.clone(), entry.disabled_reason.clone(), pending)
            })
            .collect()
    }

    pub fn is_live(&self, id: &str) -> bool {
        self.state.is_live(id)
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
        assert!(svc.add_schedule("j1", "* * * * *").is_err());
        assert!(svc.arm("j1", 10).is_err());
        assert!(svc.catch_up(100, 4).is_empty(), "disabled service produces nothing");
        assert!(svc.watchdog(3).is_empty());
        assert_eq!(svc.event_count(), 0, "nothing entered the log while off");
        svc.enable();
        svc.add_schedule("j1", "* * * * *").unwrap();
        assert!(svc.is_live("j1"));
    }

    #[test]
    fn grammar_gate_refuses_bad_specs_before_the_log() {
        let mut svc = SchedulerService::new();
        svc.enable();
        assert!(svc.add_schedule("bad", "not a cron").is_err());
        assert_eq!(svc.event_count(), 0, "unparseable specs never enter the log");
        assert!(!svc.is_live("bad"));
    }

    #[test]
    fn catch_up_fires_overdue_through_core_policy() {
        let mut svc = SchedulerService::new();
        svc.enable();
        svc.add_schedule("j1", "* * * * *").unwrap();
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
        svc.add_schedule("flaky", "* * * * *").unwrap();
        for run in 1..=3 {
            svc.run_failed("flaky", run).unwrap();
        }
        let events = svc.watchdog(3);
        assert!(!events.is_empty(), "three consecutive failures cross the threshold");
        assert!(!svc.is_live("flaky"), "self-disabled schedule is not live");
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
            svc.add_schedule("j1", "* * * * *").unwrap();
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
}
