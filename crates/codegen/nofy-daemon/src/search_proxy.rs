//! Search proxy: clients block on `SessionSearch`, providers long-poll with
//! `SearchPoll` and answer with `SearchResult` (last NOT_READY cleared).
//!
//! The daemon holds the pending queue and the blocked client's slot; it never
//! searches itself (the index lives in the shell). Polling keeps connection
//! ownership simple: the daemon never writes into another connection's
//! stream, providers pull work on their own loop.

use std::collections::{HashMap, VecDeque};
use std::sync::{Arc, Condvar, Mutex};
use std::time::{Duration, Instant};

/// Answer payload: hit count + the matched session identities.
pub type SearchAnswer = (u32, Vec<String>);

type SearchSlot = Arc<(Mutex<Option<SearchAnswer>>, Condvar)>;

#[derive(Debug, Default)]
pub struct SearchProxy {
    queue: Mutex<VecDeque<(String, String)>>,
    slots: Mutex<HashMap<String, SearchSlot>>,
    next_id: Mutex<u64>,
}

impl SearchProxy {
    pub fn new() -> Self {
        Self::default()
    }

    /// Client side: enqueue and block until a provider answers or timeout.
    pub fn request(&self, query: &str, timeout: Duration) -> Option<SearchAnswer> {
        let (request_id, slot) = {
            let mut n = self.next_id.lock().unwrap();
            *n += 1;
            let id = format!("srch-{n}");
            let slot: SearchSlot = Arc::new((Mutex::new(None), Condvar::new()));
            self.slots.lock().unwrap().insert(id.clone(), slot.clone());
            self.queue
                .lock()
                .unwrap()
                .push_back((id.clone(), query.to_string()));
            (id, slot)
        };
        let (lock, cvar) = &*slot;
        let deadline = Instant::now() + timeout;
        let mut guard = lock.lock().unwrap();
        let outcome = loop {
            if let Some(answer) = guard.take() {
                break Some(answer);
            }
            let Some(remaining) = deadline.checked_duration_since(Instant::now()) else {
                break None;
            };
            let (g, _) = cvar.wait_timeout(guard, remaining).unwrap();
            guard = g;
            if Instant::now() >= deadline && guard.is_none() {
                break None;
            }
        };
        self.slots.lock().unwrap().remove(&request_id);
        outcome
    }

    /// Provider side: pull the next job, if any.
    pub fn poll(&self) -> Option<(String, String)> {
        self.queue.lock().unwrap().pop_front()
    }

    /// Provider side: answer a job. False when unknown/late.
    pub fn result(&self, request_id: &str, answer: SearchAnswer) -> bool {
        let slot = {
            let map = self.slots.lock().unwrap();
            map.get(request_id).cloned()
        };
        let Some(slot) = slot else {
            return false;
        };
        let (lock, cvar) = &*slot;
        let mut guard = lock.lock().unwrap();
        if guard.is_some() {
            return false;
        }
        *guard = Some(answer);
        cvar.notify_all();
        true
    }

    pub fn pending_count(&self) -> usize {
        self.queue.lock().unwrap().len()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn request_poll_result_roundtrip() {
        let proxy = std::sync::Arc::new(SearchProxy::new());
        let p2 = proxy.clone();
        let waiter = std::thread::spawn(move || p2.request("文件管家", Duration::from_secs(5)));
        std::thread::sleep(Duration::from_millis(50));
        let (id, query) = proxy.poll().expect("job queued");
        assert_eq!(query, "文件管家");
        assert!(proxy.result(&id, (7, vec!["s1".into()])));
        assert_eq!(waiter.join().unwrap(), Some((7, vec!["s1".into()])));
        assert_eq!(proxy.pending_count(), 0);
    }

    #[test]
    fn empty_poll_is_none_and_timeout_is_none() {
        let proxy = SearchProxy::new();
        assert!(proxy.poll().is_none());
        assert_eq!(
            proxy.request("x", Duration::from_millis(60)),
            None,
            "no provider = search timeout (fail-closed empty)"
        );
    }

    #[test]
    fn late_result_dropped() {
        let proxy = SearchProxy::new();
        assert!(!proxy.result("ghost", (1, Vec::new())));
    }
}
