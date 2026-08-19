//! Cross-surface approval broker (PRD FR5.1, NOT_READY #1 cleared).
//!
//! A provider (the shell's tool pipeline) calls [`ApprovalBroker::request`]
//! over the control socket and BLOCKS its connection thread until some
//! surface (TUI/Web/IM client) answers with [`ApprovalBroker::respond`] on
//! its own connection — or the timeout expires (`ApprovalTimeout`,
//! fail-closed: no answer = deny). The daemon never decides policy itself;
//! it only routes the round-trip and enforces the deadline.

use std::collections::HashMap;
use std::sync::{Arc, Condvar, Mutex};
use std::time::{Duration, Instant};

use nofy_control_schema::methods::ApprovalDecision;

type PendingSlot = Arc<(Mutex<Option<ApprovalDecision>>, Condvar)>;

#[derive(Debug, Default)]
pub struct ApprovalBroker {
    pending: Mutex<HashMap<String, PendingSlot>>,
    /// Enveloped request summaries, registered with the request and
    /// dropped at settle (Q1 wiring: surfaces read framed text, never
    /// raw provider input — FR5.10).
    summaries: Mutex<HashMap<String, String>>,
}

impl ApprovalBroker {
    pub fn new() -> Self {
        Self::default()
    }

    /// Register a pending request. Returns false if the intent is already
    /// pending (duplicate request = protocol error, caller rejects).
    /// `summary` is stored for surfaces (callers pass the enveloped text).
    pub fn register(&self, intent_id: &str, summary: &str) -> bool {
        let mut map = self.pending.lock().unwrap();
        if map.contains_key(intent_id) {
            return false;
        }
        map.insert(
            intent_id.to_string(),
            Arc::new((Mutex::new(None), Condvar::new())),
        );
        drop(map);
        self.summaries
            .lock()
            .unwrap()
            .insert(intent_id.to_string(), summary.to_string());
        true
    }

    /// The enveloped summary for a pending intent (surfaces only).
    pub fn summary(&self, intent_id: &str) -> Option<String> {
        self.summaries.lock().unwrap().get(intent_id).cloned()
    }

    /// Block until a surface responds or the deadline passes.
    /// `None` = timeout (fail-closed deny at the caller).
    pub fn wait(&self, intent_id: &str, timeout: Duration) -> Option<ApprovalDecision> {
        let slot = {
            let map = self.pending.lock().unwrap();
            map.get(intent_id).cloned()
        }?;
        let (lock, cvar) = &*slot;
        let deadline = Instant::now() + timeout;
        let mut guard = lock.lock().unwrap();
        loop {
            if let Some(d) = *guard {
                return Some(d);
            }
            let Some(remaining) = deadline.checked_duration_since(Instant::now()) else {
                return None;
            };
            let (g, _timed_out) = cvar.wait_timeout(guard, remaining).unwrap();
            guard = g;
            if Instant::now() >= deadline && guard.is_none() {
                return None;
            }
        }
    }

    /// A surface answers. Returns false when the intent is unknown or already
    /// resolved (late answers are dropped, never resurrected).
    pub fn respond(&self, intent_id: &str, decision: ApprovalDecision) -> bool {
        let slot = {
            let map = self.pending.lock().unwrap();
            map.get(intent_id).cloned()
        };
        let Some(slot) = slot else {
            return false;
        };
        let (lock, cvar) = &*slot;
        let mut guard = lock.lock().unwrap();
        if guard.is_some() {
            return false;
        }
        *guard = Some(decision);
        cvar.notify_all();
        true
    }

    /// Drop the entry once the requester has consumed its outcome.
    pub fn settle(&self, intent_id: &str) {
        self.pending.lock().unwrap().remove(intent_id);
        self.summaries.lock().unwrap().remove(intent_id);
    }

    pub fn pending_count(&self) -> usize {
        self.pending.lock().unwrap().len()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn request_respond_roundtrip_across_threads() {
        let broker = std::sync::Arc::new(ApprovalBroker::new());
        assert!(broker.register("i1", "rm -rf things"));
        assert!(!broker.register("i1", "dup"), "duplicate must be rejected");

        let b2 = broker.clone();
        let waiter = std::thread::spawn(move || {
            let d = b2.wait("i1", Duration::from_secs(5));
            b2.settle("i1");
            d
        });
        std::thread::sleep(Duration::from_millis(50));
        assert!(broker.respond("i1", ApprovalDecision::AllowOnce));
        assert_eq!(waiter.join().unwrap(), Some(ApprovalDecision::AllowOnce));
        assert_eq!(broker.pending_count(), 0);
    }

    #[test]
    fn timeout_is_fail_closed_none() {
        let broker = ApprovalBroker::new();
        broker.register("i2", "danger");
        let got = broker.wait("i2", Duration::from_millis(80));
        assert_eq!(got, None, "no answer within deadline = deny");
    }

    #[test]
    fn late_or_unknown_respond_dropped() {
        let broker = ApprovalBroker::new();
        assert!(!broker.respond("ghost", ApprovalDecision::Deny));
        broker.register("i3", "x");
        assert!(broker.respond("i3", ApprovalDecision::Deny));
        assert!(
            !broker.respond("i3", ApprovalDecision::AllowOnce),
            "second answer must not resurrect"
        );
    }
}
