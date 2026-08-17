//! Model-ops supplements (FR7.7–7.9).
//!
//! - **Generations** (FR7.7, OC-F24): generation artifacts are written as
//!   ATOMIC snapshots with a lease; expired leases and retention overflow
//!   are reaped explicitly — never by silent overwrite.
//! - **Auxiliary routing** (FR7.8, HM-F24): a route chain with
//!   stale-while-revalidate — when nothing is fresh, serve the best stale
//!   route and flag it for revalidation, instead of failing outright.
//! - **OAuth refresh** (FR7.9, PI-F21): double-checked locking — N
//!   concurrent refreshers produce exactly ONE underlying refresh; all
//!   callers observe the same token.

use std::collections::BTreeMap;
use std::sync::{Condvar, Mutex};

// ---- FR7.7 generations ----

/// One generation artifact.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Generation {
    pub id: String,
    pub created_at: u64,
    pub lease_expires: u64,
    pub payload: String,
}

/// Atomic snapshot store with lease + retention.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct GenerationStore {
    gens: BTreeMap<String, Generation>,
    pub retention_secs: u64,
}

impl GenerationStore {
    pub fn new(retention_secs: u64) -> Self {
        Self {
            gens: BTreeMap::new(),
            retention_secs,
        }
    }

    /// Atomic snapshot: the generation appears whole or not at all
    /// (staging → commit shape). Re-snapshotting an id replaces it
    /// atomically.
    pub fn snapshot(&mut self, id: &str, payload: &str, now: u64, lease_secs: u64) {
        let staged = Generation {
            id: id.to_string(),
            created_at: now,
            lease_expires: now + lease_secs,
            payload: payload.to_string(),
        };
        self.gens.insert(id.to_string(), staged);
    }

    pub fn get(&self, id: &str) -> Option<&Generation> {
        self.gens.get(id)
    }

    pub fn lease_expired(&self, id: &str, now: u64) -> bool {
        self.gens
            .get(id)
            .is_some_and(|g| now >= g.lease_expires)
    }

    /// Reap expired leases AND retention overflow. Returns reaped ids.
    pub fn retain(&mut self, now: u64) -> Vec<String> {
        let cutoff = now.saturating_sub(self.retention_secs);
        let reaped: Vec<String> = self
            .gens
            .iter()
            .filter(|(_, g)| now >= g.lease_expires || g.created_at < cutoff)
            .map(|(id, _)| id.clone())
            .collect();
        for id in &reaped {
            self.gens.remove(id);
        }
        reaped
    }

    pub fn len(&self) -> usize {
        self.gens.len()
    }
}

// ---- FR7.8 auxiliary routing chain ----

/// One route in the auxiliary chain.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RouteEntry {
    pub model: String,
    /// Fresh until this time.
    pub fresh_until: u64,
    /// Usable-but-stale until this time (stale-while-revalidate window).
    pub stale_until: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RouteDecision {
    /// A fresh route: use directly.
    Use(String),
    /// Nothing fresh: serve stale, revalidate in the background.
    UseStaleRevalidate(String),
    /// Nothing usable: fail closed.
    Fail,
}

/// Route through the chain: first fresh wins; else first stale (serve
/// stale + revalidate); else fail.
pub fn route(chain: &[RouteEntry], now: u64) -> RouteDecision {
    for entry in chain {
        if now < entry.fresh_until {
            return RouteDecision::Use(entry.model.clone());
        }
    }
    for entry in chain {
        if now < entry.stale_until {
            return RouteDecision::UseStaleRevalidate(entry.model.clone());
        }
    }
    RouteDecision::Fail
}

// ---- FR7.9 OAuth double-checked refresh ----

/// Token cell guarded by double-checked locking.
pub struct TokenCell {
    inner: Mutex<TokenInner>,
    cvar: Condvar,
}

struct TokenInner {
    token: Option<String>,
    expires_at: u64,
    refreshing: bool,
}

impl TokenCell {
    pub fn new() -> Self {
        Self {
            inner: Mutex::new(TokenInner {
                token: None,
                expires_at: 0,
                refreshing: false,
            }),
            cvar: Condvar::new(),
        }
    }

    /// Get a valid token, refreshing through `do_refresh` if expired.
    /// Double-checked: concurrent callers wait on the single in-flight
    /// refresh instead of issuing their own (PI-F21).
    pub fn get_or_refresh<F>(&self, now: u64, do_refresh: F) -> String
    where
        F: FnOnce() -> (String, u64),
    {
        let mut inner = self.inner.lock().unwrap();
        loop {
            // First check: still valid?
            if let Some(token) = &inner.token {
                if now < inner.expires_at {
                    return token.clone();
                }
            }
            // Second check: someone already refreshing? Wait for them.
            if inner.refreshing {
                inner = self.cvar.wait(inner).unwrap();
                continue;
            }
            // We are the refresher.
            inner.refreshing = true;
            break;
        }
        // Release the lock during the (potentially slow) refresh: the
        // Mutex is not reentrant, and waiters must be able to observe the
        // refreshing flag.
        drop(inner);
        let (token, expires_at) = do_refresh();
        let mut inner = self.inner.lock().unwrap();
        inner.token = Some(token.clone());
        inner.expires_at = expires_at;
        inner.refreshing = false;
        self.cvar.notify_all();
        token
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize, Ordering};
    use std::sync::Arc;

    #[test]
    fn generation_snapshot_is_atomic_and_leased() {
        let mut store = GenerationStore::new(1000);
        store.snapshot("g1", "image-bytes", 100, 50);
        assert_eq!(store.get("g1").unwrap().payload, "image-bytes");
        assert!(!store.lease_expired("g1", 149));
        assert!(store.lease_expired("g1", 150));
    }

    #[test]
    fn retention_reaps_expired_leases_and_old_creations() {
        let mut store = GenerationStore::new(100);
        store.snapshot("fresh", "a", 200, 500);
        store.snapshot("lease-dead", "b", 200, 10); // lease expires 210
        store.snapshot("old", "c", 50, 5000); // created before cutoff (250-100)
        let reaped = store.retain(250);
        assert!(reaped.contains(&"lease-dead".to_string()));
        assert!(reaped.contains(&"old".to_string()));
        assert!(!reaped.contains(&"fresh".to_string()));
        assert_eq!(store.len(), 1);
    }

    #[test]
    fn route_prefers_fresh_then_stale_then_fails() {
        let chain = vec![
            RouteEntry { model: "primary".into(), fresh_until: 100, stale_until: 200 },
            RouteEntry { model: "aux".into(), fresh_until: 50, stale_until: 300 },
        ];
        assert_eq!(route(&chain, 90), RouteDecision::Use("primary".into()));
        // Primary stale, aux still fresh-ish? aux fresh_until=50 passed →
        // nothing fresh → first stale = primary (stale_until 200).
        assert_eq!(route(&chain, 150), RouteDecision::UseStaleRevalidate("primary".into()));
        // Primary dead, aux stale-usable.
        assert_eq!(route(&chain, 250), RouteDecision::UseStaleRevalidate("aux".into()));
        // Everything dead: fail closed.
        assert_eq!(route(&chain, 400), RouteDecision::Fail);
    }

    #[test]
    fn oauth_double_check_refreshes_exactly_once() {
        let cell = Arc::new(TokenCell::new());
        let refreshes = Arc::new(AtomicUsize::new(0));
        let mut handles = Vec::new();
        for _ in 0..8 {
            let cell = cell.clone();
            let refreshes = refreshes.clone();
            handles.push(std::thread::spawn(move || {
                cell.get_or_refresh(100, || {
                    refreshes.fetch_add(1, Ordering::SeqCst);
                    std::thread::sleep(std::time::Duration::from_millis(20));
                    ("token-v2".to_string(), 200)
                })
            }));
        }
        let tokens: Vec<String> = handles.into_iter().map(|h| h.join().unwrap()).collect();
        assert!(tokens.iter().all(|t| t == "token-v2"));
        assert_eq!(refreshes.load(Ordering::SeqCst), 1, "exactly one underlying refresh");
    }

    #[test]
    fn valid_token_is_served_without_refresh() {
        let cell = TokenCell::new();
        let first = cell.get_or_refresh(0, || ("t1".into(), 100));
        assert_eq!(first, "t1");
        let refreshes = AtomicUsize::new(0);
        let second = cell.get_or_refresh(50, || {
            refreshes.fetch_add(1, Ordering::SeqCst);
            ("t2".into(), 200)
        });
        assert_eq!(second, "t1", "still valid: no refresh");
        assert_eq!(refreshes.load(Ordering::SeqCst), 0);
        // Expired → refresh.
        let third = cell.get_or_refresh(150, || ("t3".into(), 300));
        assert_eq!(third, "t3");
    }
}
