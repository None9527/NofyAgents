//! fs-event → task binding (FR3.8 / HM-F21): debounce + budget + refuse
//! self-destruction.
//!
//! Filesystem noise must not storm the scheduler: events for the same
//! path are DEBOUNCED into at most one trigger per window; total triggers
//! are BUDGETED per window; and events caused by the scheduler's OWN
//! writes are refused outright — a trigger chain that could destroy its
//! own inputs («自毁型») never starts.

use std::collections::BTreeMap;

/// One observed fs event.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FsEvent {
    pub path: String,
    pub at: u64,
    /// True when the scheduler itself caused this event (its own write).
    pub self_generated: bool,
}

/// What the policy decided.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TriggerOutcome {
    /// A task trigger fires at this time.
    Triggered(u64),
    /// Absorbed by the debounce window for this path.
    Debounced,
    /// The per-window budget is exhausted.
    BudgetExhausted,
    /// Self-generated event refused (self-destruction prevention).
    RefusedSelf,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FsTriggerPolicy {
    debounce_secs: u64,
    budget_per_window: usize,
    window_secs: u64,
    /// path -> window start of the open debounce.
    open: BTreeMap<String, u64>,
    /// Trigger timestamps (for the rolling budget).
    triggers: Vec<u64>,
    /// Counters for observability.
    pub refused_self: u64,
    pub budget_exhausted: u64,
}

impl FsTriggerPolicy {
    pub fn new(debounce_secs: u64, budget_per_window: usize, window_secs: u64) -> Self {
        Self {
            debounce_secs,
            budget_per_window,
            window_secs,
            open: BTreeMap::new(),
            triggers: Vec::new(),
            refused_self: 0,
            budget_exhausted: 0,
        }
    }

    /// Ingest one event and return the policy decision. Deterministic for
    /// a deterministic event sequence.
    pub fn ingest(&mut self, event: &FsEvent) -> TriggerOutcome {
        // 1. Self-destruction refusal: never trigger off our own writes.
        if event.self_generated {
            self.refused_self += 1;
            return TriggerOutcome::RefusedSelf;
        }

        // 2. Budget: count triggers inside the rolling window ending now.
        let window_start = event.at.saturating_sub(self.window_secs);
        self.triggers.retain(|&t| t > window_start);
        if self.triggers.len() >= self.budget_per_window {
            self.budget_exhausted += 1;
            return TriggerOutcome::BudgetExhausted;
        }

        // 3. Debounce: one trigger per path per debounce window. The first
        //    event opens the window; the first event AT/after its end
        //    triggers and re-opens.
        match self.open.get(&event.path) {
            Some(&start) if event.at < start + self.debounce_secs => TriggerOutcome::Debounced,
            _ => {
                self.open.insert(event.path.clone(), event.at);
                self.triggers.push(event.at);
                TriggerOutcome::Triggered(event.at)
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn event(path: &str, at: u64) -> FsEvent {
        FsEvent {
            path: path.into(),
            at,
            self_generated: false,
        }
    }

    #[test]
    fn self_generated_events_are_refused() {
        let mut policy = FsTriggerPolicy::new(10, 100, 60);
        let own = FsEvent {
            path: "out.log".into(),
            at: 5,
            self_generated: true,
        };
        assert_eq!(policy.ingest(&own), TriggerOutcome::RefusedSelf);
        assert_eq!(policy.refused_self, 1);
        // Refused events consume no budget and open no debounce window.
        assert_eq!(
            policy.ingest(&event("out.log", 6)),
            TriggerOutcome::Triggered(6)
        );
    }

    #[test]
    fn debounce_absorbs_bursts_into_one_trigger() {
        let mut policy = FsTriggerPolicy::new(10, 100, 60);
        assert_eq!(
            policy.ingest(&event("f", 100)),
            TriggerOutcome::Triggered(100)
        );
        for at in [101, 105, 109] {
            assert_eq!(policy.ingest(&event("f", at)), TriggerOutcome::Debounced);
        }
        // At the window end the next event triggers again.
        assert_eq!(
            policy.ingest(&event("f", 110)),
            TriggerOutcome::Triggered(110)
        );
    }

    #[test]
    fn debounce_is_per_path() {
        let mut policy = FsTriggerPolicy::new(10, 100, 60);
        assert_eq!(
            policy.ingest(&event("a", 100)),
            TriggerOutcome::Triggered(100)
        );
        // A different path is not debounced by `a`'s window.
        assert_eq!(
            policy.ingest(&event("b", 101)),
            TriggerOutcome::Triggered(101)
        );
        assert_eq!(policy.ingest(&event("a", 102)), TriggerOutcome::Debounced);
    }

    #[test]
    fn budget_caps_triggers_per_window_and_refills() {
        let mut policy = FsTriggerPolicy::new(0, 2, 60);
        assert_eq!(
            policy.ingest(&event("a", 100)),
            TriggerOutcome::Triggered(100)
        );
        assert_eq!(
            policy.ingest(&event("b", 110)),
            TriggerOutcome::Triggered(110)
        );
        assert_eq!(
            policy.ingest(&event("c", 120)),
            TriggerOutcome::BudgetExhausted
        );
        assert_eq!(policy.budget_exhausted, 1);
        // Past the window, the oldest trigger falls out: budget frees up.
        assert_eq!(
            policy.ingest(&event("d", 161)),
            TriggerOutcome::Triggered(161)
        );
    }

    #[test]
    fn deterministic_for_same_sequence() {
        let seq = vec![
            event("a", 10),
            event("a", 11),
            event("b", 12),
            FsEvent {
                path: "a".into(),
                at: 13,
                self_generated: true,
            },
            event("a", 30),
        ];
        let run = |seq: &[FsEvent]| {
            let mut policy = FsTriggerPolicy::new(10, 5, 60);
            seq.iter().map(|e| policy.ingest(e)).collect::<Vec<_>>()
        };
        assert_eq!(run(&seq), run(&seq));
    }
}
