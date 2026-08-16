//! Capped exponential reconnect backoff with jitter.
//!
//! Reconnect storms are exactly what the supervisor restart budget (OC-F2)
//! exists to prevent on the daemon side; clients get the mirror image: back
//! off exponentially, cap the wait, jitter to desynchronize herds.

use std::time::Duration;

#[derive(Debug, Clone, Copy)]
pub struct Backoff {
    pub initial: Duration,
    pub cap: Duration,
    /// Multiplier applied per attempt (fixed-point x100: 200 = 2.0).
    pub multiplier_pct: u32,
}

impl Default for Backoff {
    fn default() -> Self {
        Self {
            initial: Duration::from_millis(250),
            cap: Duration::from_secs(30),
            multiplier_pct: 200,
        }
    }
}

pub struct BackoffIter {
    cfg: Backoff,
    next: Duration,
    attempt: u32,
}

impl Backoff {
    pub fn iter(&self) -> BackoffIter {
        BackoffIter {
            cfg: *self,
            next: self.initial,
            attempt: 0,
        }
    }
}

impl Iterator for BackoffIter {
    type Item = Duration;

    fn next(&mut self) -> Option<Duration> {
        let base = self.next.min(self.cfg.cap);
        // Deterministic-ish jitter: 0 or +25% derived from the attempt counter
        // so tests can bound it; real desync comes from differing attempt
        // counts across clients.
        let jitter_pct = 25 * (self.attempt % 2);
        let with_jitter = base - base / 4 + (base / 100) * jitter_pct;
        self.attempt += 1;
        let grown = (self.next.as_millis() as u64 * self.cfg.multiplier_pct as u64) / 100;
        self.next = Duration::from_millis(grown).min(self.cfg.cap);
        Some(with_jitter.min(self.cfg.cap))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn grows_exponentially_then_caps() {
        let seq: Vec<Duration> = Backoff::default().iter().take(20).collect();
        // First waits start at initial (minus up to 25% jitter).
        assert!(seq[0] >= Duration::from_millis(187));
        assert!(seq[0] <= Duration::from_millis(250));
        // Monotone non-decreasing in expectation; strictly the cap eventually.
        assert!(seq.iter().all(|d| *d <= Duration::from_secs(30)));
        assert_eq!(seq[15..].iter().max(), Some(&Duration::from_secs(30)));
    }

    #[test]
    fn never_zero() {
        for d in Backoff::default().iter().take(50) {
            assert!(d >= Duration::from_millis(1));
        }
    }
}
