//! Live event fan-out for control-plane attach (NOT_READY #2 cleared).
//!
//! Attach is two-phase: the daemon replays the journal delta from disk
//! (it owns the state root, so history needs no provider), then switches the
//! connection to LIVE mode where events arrive from a registered provider
//! (the shell's resident runtime) via [`LiveBus::publish`] and are fanned out
//! to every attached subscriber. The bus keeps a bounded ring per session so
//! a slow subscriber cannot OOM the daemon; falling off the ring is
//! `CursorStale` at the attach site, never silent loss.

use std::collections::{HashMap, VecDeque};
use std::sync::{Arc, Mutex};

use nofy_session_journal::event::Event;

/// Bounded live ring per session.
const RING_CAP: usize = 1024;

#[derive(Debug, Default)]
struct SessionHub {
    ring: VecDeque<Event>,
    next_sub_id: u64,
    subscribers: HashMap<u64, std::sync::mpsc::SyncSender<Event>>,
}

#[derive(Debug, Default)]
pub struct LiveBus {
    sessions: Mutex<HashMap<String, SessionHub>>,
}

impl LiveBus {
    pub fn new() -> Arc<Self> {
        Arc::new(Self::default())
    }

    /// A provider pushes a live event; fanned out to attached clients.
    /// Events must arrive in seq order per session (the provider's journal
    /// guarantees it; the bus does not reorder).
    pub fn publish(&self, event: Event) {
        let mut map = self.sessions.lock().unwrap();
        let hub = map.entry(event.session_id.clone()).or_default();
        if hub.ring.len() == RING_CAP {
            hub.ring.pop_front();
        }
        hub.ring.push_back(event.clone());
        // Drop subscribers whose client went away (send fails).
        hub.subscribers
            .retain(|_, tx| tx.try_send(event.clone()).is_ok());
    }

    /// Subscribe to a session's live stream. Returns the subscription id and
    /// the channel; events published after this call are delivered.
    pub fn subscribe(&self, session_id: &str) -> (u64, std::sync::mpsc::Receiver<Event>) {
        let (tx, rx) = std::sync::mpsc::sync_channel(256);
        let mut map = self.sessions.lock().unwrap();
        let hub = map.entry(session_id.to_string()).or_default();
        hub.next_sub_id += 1;
        let id = hub.next_sub_id;
        hub.subscribers.insert(id, tx);
        (id, rx)
    }

    pub fn unsubscribe(&self, session_id: &str, sub_id: u64) {
        let mut map = self.sessions.lock().unwrap();
        if let Some(hub) = map.get_mut(session_id) {
            hub.subscribers.remove(&sub_id);
        }
    }

    /// The newest seq seen for a session (attach sites use it to detect a
    /// gap between the disk replay tail and the live ring head).
    pub fn latest_seq(&self, session_id: &str) -> Option<u64> {
        let map = self.sessions.lock().unwrap();
        map.get(session_id)
            .and_then(|h| h.ring.back().map(|e| e.seq))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use nofy_session_journal::event::EventKind;

    fn ev(session: &str, seq: u64) -> Event {
        Event {
            seq,
            kind: EventKind::TurnStarted,
            session_id: session.to_string(),
            at_ms: 1,
            payload: serde_json::Value::Null,
        }
    }

    #[test]
    fn publish_fans_out_to_subscribers() {
        let bus = LiveBus::new();
        let (id, rx) = bus.subscribe("s1");
        bus.publish(ev("s1", 0));
        bus.publish(ev("s1", 1));
        assert_eq!(rx.try_recv().unwrap().seq, 0);
        assert_eq!(rx.try_recv().unwrap().seq, 1);
        bus.unsubscribe("s1", id);
        bus.publish(ev("s1", 2));
        assert!(rx.try_recv().is_err(), "unsubscribed must not receive");
    }

    #[test]
    fn ring_bounds_memory_and_reports_latest() {
        let bus = LiveBus::new();
        for i in 0..(RING_CAP as u64 + 10) {
            bus.publish(ev("s2", i));
        }
        assert_eq!(bus.latest_seq("s2"), Some(RING_CAP as u64 + 9));
    }

    #[test]
    fn gone_subscribers_are_pruned_on_publish() {
        let bus = LiveBus::new();
        let (_id, rx) = bus.subscribe("s3");
        drop(rx); // client went away
        bus.publish(ev("s3", 0)); // prune happens here, must not panic
        let map = bus.sessions.lock().unwrap();
        assert!(
            map.get("s3").unwrap().subscribers.is_empty(),
            "dead subscriber pruned"
        );
    }
}
