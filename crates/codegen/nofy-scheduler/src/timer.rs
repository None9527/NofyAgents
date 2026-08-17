//! One-shot timers (FR3.6 / DS-#3): clamped targets + wall-clock
//! revalidation against a monotonic anchor.
//!
//! Wall clocks jump (NTP steps, suspend/resume); the monotonic clock
//! does not. A one-shot timer therefore anchors to the MONOTONIC clock at
//! arm time: due-ness is decided by monotonic elapsed, and the wall fire
//! time is only ever DERIVED from the monotonic remainder. A wall jump
//! can thus never fire a timer early or strand it forever — `revalidate`
//! simply re-derives the wall fire time from the unchanged remainder.

/// Clamp floor: no zero-delay timers (they degenerate into busy loops).
pub const MIN_DELAY_SECS: u64 = 1;
/// Clamp ceiling: no absurd timers (one year); a target beyond this is
/// treated as a bug or an attack, not a promise.
pub const MAX_DELAY_SECS: u64 = 365 * 24 * 3600;

/// A one-shot timer. Cheap to clone, pure value semantics.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct OneShot {
    pub id: String,
    /// Monotonic seconds remaining at the last anchor.
    monotonic_remaining: u64,
    /// Wall time at the last anchor (derivation base, never trusted).
    anchor_wall: u64,
    /// Derived wall fire time — informational and for delivery scheduling.
    pub fire_at_wall: u64,
    pub fired: bool,
}

/// Arm a one-shot timer. `target_wall` is CLAMPED: a past target becomes
/// `MIN_DELAY_SECS`, an absurd one becomes `MAX_DELAY_SECS`.
pub fn arm(id: impl Into<String>, now_wall: u64, target_wall: u64) -> OneShot {
    let raw_delay = target_wall.saturating_sub(now_wall);
    let delay = raw_delay.clamp(MIN_DELAY_SECS, MAX_DELAY_SECS);
    OneShot {
        id: id.into(),
        monotonic_remaining: delay,
        anchor_wall: now_wall,
        fire_at_wall: now_wall + delay,
        fired: false,
    }
}

impl OneShot {
    /// Re-anchor after time passed. `mono_elapsed` is the monotonic truth
    /// since the last anchor; `now_wall` is the (possibly jumped) wall
    /// clock. The remainder shrinks monotonically; the wall fire time is
    /// re-derived, so wall jumps shift the display, never the due-ness.
    pub fn revalidate(&mut self, mono_elapsed: u64, now_wall: u64) {
        self.monotonic_remaining = self.monotonic_remaining.saturating_sub(mono_elapsed);
        self.anchor_wall = now_wall;
        self.fire_at_wall = now_wall + self.monotonic_remaining;
    }

    /// Due-ness is monotonic-only: elapsed since the last anchor covers
    /// the whole remainder.
    pub fn is_due(&self, mono_elapsed_since_anchor: u64) -> bool {
        !self.fired && mono_elapsed_since_anchor >= self.monotonic_remaining
    }

    /// Fire once. Returns true exactly once over the timer's lifetime.
    pub fn fire(&mut self) -> bool {
        if self.fired {
            return false;
        }
        self.fired = true;
        true
    }

    pub fn monotonic_remaining(&self) -> u64 {
        self.monotonic_remaining
    }

    pub fn anchor_wall(&self) -> u64 {
        self.anchor_wall
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn past_target_is_clamped_to_minimum() {
        let timer = arm("t", 1000, 500); // target in the past
        assert_eq!(timer.monotonic_remaining(), MIN_DELAY_SECS);
        assert_eq!(timer.fire_at_wall, 1000 + MIN_DELAY_SECS);
    }

    #[test]
    fn absurd_target_is_clamped_to_maximum() {
        let timer = arm("t", 1000, u64::MAX);
        assert_eq!(timer.monotonic_remaining(), MAX_DELAY_SECS);
        assert_eq!(timer.fire_at_wall, 1000 + MAX_DELAY_SECS);
    }

    #[test]
    fn normal_target_arms_exactly() {
        let timer = arm("t", 1000, 1600);
        assert_eq!(timer.monotonic_remaining(), 600);
        assert!(!timer.is_due(599));
        assert!(timer.is_due(600));
    }

    #[test]
    fn wall_jump_forward_does_not_fire_early() {
        let mut timer = arm("t", 1000, 2000); // 1000s out
        // The wall clock jumps +1h, but only 10 monotonic seconds passed.
        timer.revalidate(10, 1000 + 3600);
        assert_eq!(timer.monotonic_remaining(), 990, "monotonic remainder is truth");
        assert_eq!(timer.fire_at_wall, 1000 + 3600 + 990, "wall fire time re-derived");
        assert!(!timer.is_due(10), "wall jump must not fire the timer");
        assert!(timer.is_due(990));
    }

    #[test]
    fn wall_jump_backward_does_not_strand() {
        let mut timer = arm("t", 1000, 2000);
        // NTP steps the wall clock backwards; monotonic still advances.
        timer.revalidate(500, 200);
        assert_eq!(timer.monotonic_remaining(), 500);
        assert!(timer.is_due(500), "timer still due by monotonic elapsed");
    }

    #[test]
    fn fires_exactly_once() {
        let mut timer = arm("t", 0, 10);
        assert!(timer.fire());
        assert!(!timer.fire(), "one-shot means exactly once");
        assert!(!timer.is_due(100), "fired timer is never due again");
    }
}
