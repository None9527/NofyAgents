//! Guard pair (FR9.8, DS-#27): repetition reminder + scoped timeouts.
//!
//! Two independent guards:
//!
//! - [`RepetitionGuard`] — when the SAME call signature repeats N times
//!   in a row, emit a reminder (the loop-breaker signal). Any different
//!   call resets the count;
//! - [`ScopedTimeout`] — deadlines scoped per operation scope: one
//!   scope timing out never affects another.

/// The repetition guard: detects identical consecutive calls.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RepetitionGuard {
    /// Reminder threshold (remind at the Nth consecutive repeat).
    pub threshold: u32,
    last_signature: Option<String>,
    run_length: u32,
    /// Total reminders emitted (audit).
    pub reminders: u64,
}

/// What the guard says about one call.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GuardSignal {
    /// First call or a changed signature: proceed silently.
    Fresh,
    /// A repeat, under the threshold.
    Repeat,
    /// The Nth consecutive repeat: remind the caller.
    Remind,
}

impl RepetitionGuard {
    pub fn new(threshold: u32) -> Self {
        Self {
            threshold: threshold.max(2),
            last_signature: None,
            run_length: 0,
            reminders: 0,
        }
    }

    /// Observe one call. Returns the guard's signal.
    pub fn observe(&mut self, signature: &str) -> GuardSignal {
        match &self.last_signature {
            Some(last) if last == signature => {
                self.run_length += 1;
            }
            _ => {
                self.last_signature = Some(signature.to_string());
                self.run_length = 1;
            }
        }
        if self.run_length >= self.threshold {
            self.reminders += 1;
            GuardSignal::Remind
        } else if self.run_length > 1 {
            GuardSignal::Repeat
        } else {
            GuardSignal::Fresh
        }
    }
}

/// The scoped-timeout guard: independent deadlines per scope.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct ScopedTimeout {
    /// scope -> deadline.
    deadlines: std::collections::BTreeMap<String, u64>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TimeoutState {
    Active,
    TimedOut,
    /// No deadline registered for this scope.
    Unscoped,
}

impl ScopedTimeout {
    /// Arm a scope's deadline (re-arming replaces it).
    pub fn arm(&mut self, scope: &str, deadline: u64) {
        self.deadlines.insert(scope.to_string(), deadline);
    }

    /// Check one scope at `now`.
    pub fn check(&self, scope: &str, now: u64) -> TimeoutState {
        match self.deadlines.get(scope) {
            Some(deadline) if now < *deadline => TimeoutState::Active,
            Some(_) => TimeoutState::TimedOut,
            None => TimeoutState::Unscoped,
        }
    }

    /// Disarm a scope (operation completed).
    pub fn disarm(&mut self, scope: &str) -> bool {
        self.deadlines.remove(scope).is_some()
    }

    /// All scopes timed out at `now` (deterministic order).
    pub fn timed_out(&self, now: u64) -> Vec<String> {
        self.deadlines
            .iter()
            .filter(|(_, deadline)| now >= **deadline)
            .map(|(scope, _)| scope.clone())
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reminder_fires_at_the_nth_consecutive_repeat() {
        let mut guard = RepetitionGuard::new(3);
        assert_eq!(guard.observe("ls -la"), GuardSignal::Fresh);
        assert_eq!(guard.observe("ls -la"), GuardSignal::Repeat);
        assert_eq!(
            guard.observe("ls -la"),
            GuardSignal::Remind,
            "third in a row reminds"
        );
        assert_eq!(
            guard.observe("ls -la"),
            GuardSignal::Remind,
            "the loop keeps reminding"
        );
        assert_eq!(guard.reminders, 2);
    }

    #[test]
    fn any_different_call_resets_the_run() {
        let mut guard = RepetitionGuard::new(3);
        guard.observe("ls -la");
        guard.observe("ls -la");
        assert_eq!(guard.observe("pwd"), GuardSignal::Fresh);
        assert_eq!(
            guard.observe("ls -la"),
            GuardSignal::Fresh,
            "run restarted after the change"
        );
        assert_eq!(guard.reminders, 0);
    }

    #[test]
    fn threshold_floor_is_two() {
        let mut guard = RepetitionGuard::new(0);
        assert_eq!(
            guard.observe("x"),
            GuardSignal::Fresh,
            "a single call never reminds"
        );
        assert_eq!(guard.observe("x"), GuardSignal::Remind);
    }

    #[test]
    fn timeouts_are_scoped_independently() {
        let mut t = ScopedTimeout::default();
        t.arm("build", 100);
        t.arm("test", 200);
        assert_eq!(t.check("build", 150), TimeoutState::TimedOut);
        assert_eq!(
            t.check("test", 150),
            TimeoutState::Active,
            "build's timeout must not bleed into test"
        );
        assert_eq!(t.check("docs", 150), TimeoutState::Unscoped);
        assert_eq!(t.timed_out(150), vec!["build".to_string()]);
    }

    #[test]
    fn disarm_and_rearm() {
        let mut t = ScopedTimeout::default();
        t.arm("build", 100);
        assert!(t.disarm("build"));
        assert_eq!(t.check("build", 50), TimeoutState::Unscoped);
        assert!(
            !t.disarm("build"),
            "disarming twice reports the second miss"
        );
        t.arm("build", 300);
        assert_eq!(
            t.check("build", 250),
            TimeoutState::Active,
            "re-arm replaces the old deadline"
        );
    }
}
