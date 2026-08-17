//! True-idle channel (FR3.3 / DS-#17).
//!
//! Maintenance work must never compete with real work. The machine has
//! THREE phases — `Active`, `Idle`, and `Maintenance` — and maintenance
//! can only start from `Idle`. A *wake latch* guarantees that once real
//! work interrupts maintenance, no further maintenance cycle can start
//! until an explicit [`MaintenanceEvent::Rearm`]: waking is sticky, so a
//! flapping workload cannot be starved by re-entering maintenance.
//!
//! Pure and event-sourced like the schedule fold: [`fold_maintenance`]
//! replays an event slice deterministically.

/// The three phases. Maintenance is the third phase — reachable only from
/// `Idle`, never directly from `Active`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Phase {
    Active,
    Idle,
    Maintenance,
}

/// Events driving the phase machine.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum MaintenanceEvent {
    /// Real work observed. From `Maintenance` this also trips the wake
    /// latch (maintenance was interrupted, not finished).
    Activity,
    /// The quiet period elapsed; `Active` becomes eligible for idle.
    IdleReached,
    /// Real work woke the host: latch maintenance off, return to `Active`.
    Wake,
    /// Maintenance work starts. Only accepted from `Idle` with the latch
    /// released.
    Start,
    /// Maintenance work finished cleanly: back to `Idle`, one cycle done.
    Finish,
    /// Explicit re-arm after a wake; the only way to release the latch.
    Rearm,
}

/// Derived maintenance state — a pure function of the event log.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MaintenanceState {
    pub phase: Phase,
    /// Wake latch: `true` = maintenance inhibited until [`MaintenanceEvent::Rearm`].
    pub wake_latch: bool,
    /// Completed maintenance cycles (projection for observability).
    pub cycles: u64,
    /// How many times activity/wake interrupted a running maintenance.
    pub interruptions: u64,
}

impl Default for MaintenanceState {
    fn default() -> Self {
        Self {
            phase: Phase::Active,
            wake_latch: false,
            cycles: 0,
            interruptions: 0,
        }
    }
}

impl MaintenanceState {
    /// Whether a maintenance cycle may start right now.
    pub fn may_start(&self) -> bool {
        self.phase == Phase::Idle && !self.wake_latch
    }
}

/// Apply one event — the machine's single-event step. Invalid transitions
/// are ignored (fail-safe: the machine never enters an illegal phase).
pub fn apply_maintenance(state: &mut MaintenanceState, event: &MaintenanceEvent) {
    match event {
        MaintenanceEvent::Activity => {
            if state.phase == Phase::Maintenance {
                state.interruptions += 1;
                state.wake_latch = true;
            }
            state.phase = Phase::Active;
        }
        MaintenanceEvent::IdleReached => {
            if state.phase == Phase::Active {
                state.phase = Phase::Idle;
            }
        }
        MaintenanceEvent::Wake => {
            if state.phase == Phase::Maintenance {
                state.interruptions += 1;
            }
            state.wake_latch = true;
            state.phase = Phase::Active;
        }
        MaintenanceEvent::Start => {
            if state.may_start() {
                state.phase = Phase::Maintenance;
            }
        }
        MaintenanceEvent::Finish => {
            if state.phase == Phase::Maintenance {
                state.phase = Phase::Idle;
                state.cycles += 1;
            }
        }
        MaintenanceEvent::Rearm => {
            if state.phase != Phase::Maintenance {
                state.wake_latch = false;
            }
        }
    }
}

/// Fold an entire maintenance event log. Pure: same log, same state.
pub fn fold_maintenance(events: &[MaintenanceEvent]) -> MaintenanceState {
    let mut state = MaintenanceState::default();
    for event in events {
        apply_maintenance(&mut state, event);
    }
    state
}

#[cfg(test)]
mod tests {
    use super::*;
    use MaintenanceEvent::*;

    #[test]
    fn full_cycle_active_idle_maintenance_idle() {
        let state = fold_maintenance(&[IdleReached, Start, Finish]);
        assert_eq!(state.phase, Phase::Idle);
        assert_eq!(state.cycles, 1);
        assert!(!state.wake_latch);
        assert_eq!(state.interruptions, 0);
    }

    #[test]
    fn maintenance_unreachable_from_active() {
        // The third phase is only reachable via Idle — direct Start is ignored.
        let state = fold_maintenance(&[Start]);
        assert_eq!(state.phase, Phase::Active);
        assert_eq!(state.cycles, 0);
    }

    #[test]
    fn wake_during_maintenance_latches_until_rearm() {
        let interrupted = fold_maintenance(&[IdleReached, Start, Wake]);
        assert_eq!(interrupted.phase, Phase::Active);
        assert!(interrupted.wake_latch);
        assert_eq!(interrupted.interruptions, 1);
        assert_eq!(interrupted.cycles, 0, "interrupted cycle must not count");

        // Quiet again — but the latch blocks maintenance.
        let still_latched = fold_maintenance(&[IdleReached, Start, Wake, IdleReached, Start]);
        assert_eq!(still_latched.phase, Phase::Idle);
        assert_eq!(still_latched.cycles, 0);

        // Only an explicit Rearm releases it.
        let rearmed = fold_maintenance(&[IdleReached, Start, Wake, IdleReached, Rearm, Start, Finish]);
        assert_eq!(rearmed.cycles, 1);
        assert!(!rearmed.wake_latch);
    }

    #[test]
    fn activity_interrupting_maintenance_trips_latch() {
        let state = fold_maintenance(&[IdleReached, Start, Activity, IdleReached, Start]);
        assert!(state.wake_latch);
        assert_eq!(state.interruptions, 1);
        assert_eq!(state.cycles, 0);
        assert_eq!(state.phase, Phase::Idle, "latched Start must be ignored");
    }

    #[test]
    fn invalid_transitions_are_ignored() {
        // Finish outside maintenance, Rearm during maintenance, IdleReached
        // while in maintenance — none may corrupt the machine.
        let state = fold_maintenance(&[Finish, Rearm, IdleReached, Start, Finish, IdleReached]);
        assert_eq!(state.phase, Phase::Idle);
        assert_eq!(state.cycles, 1);
    }

    #[test]
    fn replay_is_deterministic_at_every_prefix() {
        let log = vec![
            IdleReached, Start, Wake, IdleReached, Start, Activity, IdleReached, Rearm, Start,
            Finish, IdleReached, Start, Finish,
        ];
        let whole = fold_maintenance(&log);
        for k in 0..=log.len() {
            let mut state = fold_maintenance(&log[..k]);
            for event in &log[k..] {
                apply_maintenance(&mut state, event);
            }
            assert_eq!(state, whole, "split at {k} must equal whole fold");
        }
        assert_eq!(whole.cycles, 2);
        // Only the Wake interrupted maintenance; the later Activity hit
        // while Idle, which is not an interruption.
        assert_eq!(whole.interruptions, 1);
    }
}
