//! Pre-auth hardening: connection budget + flood guard (FR5.13, OC-F22).
//!
//! The control socket must not be exhaustible by unauthenticated peers:
//!
//! - **Budget**: each peer may hold at most N open pre-auth connections;
//!   beyond that, new connections are refused (memory/fd exhaustion guard).
//! - **Flood guard**: connection ATTEMPTS are rate-limited per window; a
//!   peer that churns attempts is refused until the window rolls —
//!  「预算尽即拒」, and the refusal state is observable.

use std::collections::BTreeMap;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum PreAuthOutcome {
    Accepted,
    RefusedBudget,
    RefusedFlood,
}

#[derive(Debug, Clone, Default, PartialEq, Eq)]
struct PeerState {
    open: u32,
    attempts: u64,
    window_start: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PreAuthGuard {
    peers: BTreeMap<String, PeerState>,
    pub max_open_per_peer: u32,
    pub max_attempts_per_window: u64,
    pub window_secs: u64,
    /// Total refusals (observability).
    pub refusals: u64,
}

impl PreAuthGuard {
    pub fn new(max_open_per_peer: u32, max_attempts_per_window: u64, window_secs: u64) -> Self {
        Self {
            peers: BTreeMap::new(),
            max_open_per_peer,
            max_attempts_per_window,
            window_secs,
            refusals: 0,
        }
    }

    /// A peer attempts a connection at time `now`.
    pub fn accept_connect(&mut self, peer: &str, now: u64) -> PreAuthOutcome {
        let state = self.peers.entry(peer.to_string()).or_default();
        // Roll the attempt window.
        if now >= state.window_start + self.window_secs {
            state.window_start = now;
            state.attempts = 0;
        }
        state.attempts += 1;
        if state.attempts > self.max_attempts_per_window {
            self.refusals += 1;
            return PreAuthOutcome::RefusedFlood;
        }
        if state.open >= self.max_open_per_peer {
            self.refusals += 1;
            return PreAuthOutcome::RefusedBudget;
        }
        state.open += 1;
        PreAuthOutcome::Accepted
    }

    /// A connection closed (authenticated session ended or dropped).
    pub fn close_connect(&mut self, peer: &str) {
        if let Some(state) = self.peers.get_mut(peer) {
            state.open = state.open.saturating_sub(1);
        }
    }

    pub fn open_count(&self, peer: &str) -> u32 {
        self.peers.get(peer).map(|s| s.open).unwrap_or(0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn guard() -> PreAuthGuard {
        PreAuthGuard::new(2, 3, 60)
    }

    #[test]
    fn budget_caps_open_connections() {
        let mut guard = guard();
        assert_eq!(guard.accept_connect("p1", 0), PreAuthOutcome::Accepted);
        assert_eq!(guard.accept_connect("p1", 1), PreAuthOutcome::Accepted);
        assert_eq!(guard.accept_connect("p1", 2), PreAuthOutcome::RefusedBudget);
        assert_eq!(guard.open_count("p1"), 2);
        // Close one: budget frees. (A fresh window, so the flood guard's
        // attempt counter does not interfere with the budget assertion.)
        guard.close_connect("p1");
        assert_eq!(guard.accept_connect("p1", 100), PreAuthOutcome::Accepted);
    }

    #[test]
    fn flood_guard_refuses_attempt_churn() {
        let mut guard = guard();
        // 3 attempts allowed per window (each accepted then closed).
        for t in 0..3 {
            assert_eq!(guard.accept_connect("p1", t), PreAuthOutcome::Accepted);
            guard.close_connect("p1");
        }
        // 4th attempt in the same window: flood.
        assert_eq!(guard.accept_connect("p1", 4), PreAuthOutcome::RefusedFlood);
        assert_eq!(guard.refusals, 1);
    }

    #[test]
    fn window_roll_restores_attempts() {
        let mut guard = guard();
        for t in 0..3 {
            guard.accept_connect("p1", t);
            guard.close_connect("p1");
        }
        assert_eq!(guard.accept_connect("p1", 4), PreAuthOutcome::RefusedFlood);
        // Past the window, attempts reset.
        assert_eq!(guard.accept_connect("p1", 100), PreAuthOutcome::Accepted);
    }

    #[test]
    fn peers_are_independent() {
        let mut guard = guard();
        guard.accept_connect("p1", 0);
        guard.accept_connect("p1", 1);
        guard.accept_connect("p1", 2); // budget for p1
        assert_eq!(guard.accept_connect("p2", 3), PreAuthOutcome::Accepted);
    }
}
