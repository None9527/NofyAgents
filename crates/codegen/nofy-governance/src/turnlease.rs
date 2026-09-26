//! Turn leases: cross-surface serialization per session (FR5.7, HM-F17).
//!
//! One session may be driven by several surfaces (TUI, Web, webhook), but
//! only ONE may hold the turn at a time — concurrent drivers would split
//! the transcript. A lease is the lock: acquire is refused while another
//! surface holds it (the refusal IS the audit trail), leases expire by TTL
//! so a dead surface cannot wedge the session forever.

use std::collections::BTreeMap;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Lease {
    pub surface: String,
    pub acquired_at: u64,
    pub ttl_secs: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AcquireOutcome {
    Acquired,
    /// Another surface holds the lease; try again after it expires.
    HeldBy {
        surface: String,
        expires_at: u64,
    },
    Expired,
}

#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct TurnLeaseTable {
    leases: BTreeMap<String, Lease>,
    /// Count of refused cross-surface attempts (observability).
    pub refusals: u64,
}

impl TurnLeaseTable {
    /// Try to take the turn for `surface`. Serialized against all other
    /// surfaces for the same session.
    pub fn acquire(
        &mut self,
        session: &str,
        surface: &str,
        now: u64,
        ttl_secs: u64,
    ) -> AcquireOutcome {
        if let Some(existing) = self.leases.get(session) {
            let expires_at = existing.acquired_at + existing.ttl_secs;
            if now < expires_at {
                if existing.surface == surface {
                    // Same surface re-acquires: refresh.
                    self.leases.insert(
                        session.to_string(),
                        Lease {
                            surface: surface.to_string(),
                            acquired_at: now,
                            ttl_secs,
                        },
                    );
                    return AcquireOutcome::Acquired;
                }
                self.refusals += 1;
                return AcquireOutcome::HeldBy {
                    surface: existing.surface.clone(),
                    expires_at,
                };
            }
            // Expired: falls through to grant.
        }
        self.leases.insert(
            session.to_string(),
            Lease {
                surface: surface.to_string(),
                acquired_at: now,
                ttl_secs,
            },
        );
        AcquireOutcome::Acquired
    }

    /// Release a lease (only the holder can).
    pub fn release(&mut self, session: &str, surface: &str) -> bool {
        match self.leases.get(session) {
            Some(lease) if lease.surface == surface => {
                self.leases.remove(session);
                true
            }
            _ => false,
        }
    }

    /// Sweep expired leases (maintenance call).
    pub fn expire(&mut self, now: u64) -> usize {
        let before = self.leases.len();
        self.leases
            .retain(|_, lease| now < lease.acquired_at + lease.ttl_secs);
        before - self.leases.len()
    }

    pub fn holder(&self, session: &str) -> Option<&Lease> {
        self.leases.get(session)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn second_surface_is_serialized_out() {
        let mut table = TurnLeaseTable::default();
        assert_eq!(
            table.acquire("s1", "tui", 100, 60),
            AcquireOutcome::Acquired
        );
        assert_eq!(
            table.acquire("s1", "web", 110, 60),
            AcquireOutcome::HeldBy {
                surface: "tui".into(),
                expires_at: 160
            }
        );
        assert_eq!(table.refusals, 1, "refusal is the audit trail");
        // Different session is unaffected.
        assert_eq!(
            table.acquire("s2", "web", 110, 60),
            AcquireOutcome::Acquired
        );
    }

    #[test]
    fn holder_refreshes_own_lease() {
        let mut table = TurnLeaseTable::default();
        table.acquire("s1", "tui", 100, 60);
        assert_eq!(
            table.acquire("s1", "tui", 130, 60),
            AcquireOutcome::Acquired
        );
        assert_eq!(table.holder("s1").unwrap().acquired_at, 130);
    }

    #[test]
    fn expired_lease_is_granted_to_next_surface() {
        let mut table = TurnLeaseTable::default();
        table.acquire("s1", "tui", 100, 60);
        // Past the TTL the dead surface no longer blocks.
        assert_eq!(
            table.acquire("s1", "web", 200, 60),
            AcquireOutcome::Acquired
        );
        assert_eq!(table.holder("s1").unwrap().surface, "web");
    }

    #[test]
    fn only_holder_releases() {
        let mut table = TurnLeaseTable::default();
        table.acquire("s1", "tui", 100, 60);
        assert!(!table.release("s1", "web"), "non-holder cannot release");
        assert!(table.release("s1", "tui"));
        assert_eq!(
            table.acquire("s1", "web", 110, 60),
            AcquireOutcome::Acquired
        );
    }

    #[test]
    fn expire_sweeps_stale_leases() {
        let mut table = TurnLeaseTable::default();
        table.acquire("s1", "tui", 100, 10);
        table.acquire("s2", "web", 100, 1000);
        assert_eq!(table.expire(150), 1);
        assert!(table.holder("s1").is_none());
        assert!(table.holder("s2").is_some());
    }
}
