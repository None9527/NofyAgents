//! Cross-process compaction leases (FR9.7, HM-F29).
//!
//! Compaction mutates shared memory; TWO compactors at once would
//! corrupt it. The lease book guarantees exactly one live compactor per
//! store across processes: acquire refuses while another holder's lease
//! is live, an expired lease may be taken over, and every grant is
//! visible (holder + expiry) for audit.

/// One compaction lease.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CompactionLease {
    pub holder: String,
    pub expires: u64,
}

/// The lease book for one store.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct LeaseBook {
    lease: Option<CompactionLease>,
    /// Count of takeovers of expired leases (audit signal).
    pub takeovers: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum LeaseError {
    /// Another holder's lease is still live.
    Held { holder: String, expires: u64 },
    /// Renew/release by a non-holder.
    NotHolder { caller: String },
}

impl LeaseBook {
    /// Acquire the lease. Refused while another holder's lease is live;
    /// an expired lease is taken over (and counted).
    pub fn acquire(&mut self, holder: &str, now: u64, ttl_secs: u64) -> Result<(), LeaseError> {
        if let Some(lease) = &self.lease {
            if now < lease.expires && lease.holder != holder {
                return Err(LeaseError::Held {
                    holder: lease.holder.clone(),
                    expires: lease.expires,
                });
            }
            if now >= lease.expires && lease.holder != holder {
                self.takeovers += 1;
            }
        }
        self.lease = Some(CompactionLease {
            holder: holder.to_string(),
            expires: now + ttl_secs,
        });
        Ok(())
    }

    /// Renew: only the current holder may extend.
    pub fn renew(&mut self, holder: &str, now: u64, ttl_secs: u64) -> Result<(), LeaseError> {
        match &self.lease {
            Some(lease) if lease.holder == holder && now < lease.expires => {
                self.lease = Some(CompactionLease {
                    holder: holder.to_string(),
                    expires: now + ttl_secs,
                });
                Ok(())
            }
            _ => Err(LeaseError::NotHolder { caller: holder.to_string() }),
        }
    }

    /// Release: only the current holder may release.
    pub fn release(&mut self, holder: &str) -> Result<(), LeaseError> {
        match &self.lease {
            Some(lease) if lease.holder == holder => {
                self.lease = None;
                Ok(())
            }
            _ => Err(LeaseError::NotHolder { caller: holder.to_string() }),
        }
    }

    /// Current live holder, if any.
    pub fn holder(&self, now: u64) -> Option<&str> {
        self.lease
            .as_ref()
            .filter(|l| now < l.expires)
            .map(|l| l.holder.as_str())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_one_live_compactor() {
        let mut book = LeaseBook::default();
        book.acquire("proc-a", 100, 60).unwrap();
        assert_eq!(
            book.acquire("proc-b", 120, 60),
            Err(LeaseError::Held { holder: "proc-a".into(), expires: 160 }),
            "a second live compactor is refused"
        );
        assert_eq!(book.holder(120), Some("proc-a"));
    }

    #[test]
    fn reentrant_acquire_by_same_holder() {
        let mut book = LeaseBook::default();
        book.acquire("proc-a", 100, 60).unwrap();
        book.acquire("proc-a", 120, 60).unwrap();
        assert_eq!(book.holder(150), Some("proc-a"));
        assert_eq!(book.takeovers, 0, "same-holder re-acquire is not a takeover");
    }

    #[test]
    fn expired_lease_is_taken_over_and_counted() {
        let mut book = LeaseBook::default();
        book.acquire("proc-a", 100, 60).unwrap();
        assert_eq!(book.holder(160), None, "expired = no holder");
        book.acquire("proc-b", 200, 60).unwrap();
        assert_eq!(book.holder(210), Some("proc-b"));
        assert_eq!(book.takeovers, 1, "takeover is visible for audit");
    }

    #[test]
    fn renew_and_release_are_holder_only() {
        let mut book = LeaseBook::default();
        book.acquire("proc-a", 100, 60).unwrap();
        assert!(matches!(
            book.renew("proc-b", 120, 60),
            Err(LeaseError::NotHolder { .. })
        ));
        book.renew("proc-a", 120, 60).unwrap();
        assert_eq!(book.holder(170), Some("proc-a"), "renew extended to 180");
        assert!(matches!(book.release("proc-b"), Err(LeaseError::NotHolder { .. })));
        book.release("proc-a").unwrap();
        assert_eq!(book.holder(130), None);
    }

    #[test]
    fn renew_after_expiry_fails_closed() {
        let mut book = LeaseBook::default();
        book.acquire("proc-a", 100, 60).unwrap();
        // The lease died at 160; renewing at 170 must fail, not extend.
        assert!(matches!(
            book.renew("proc-a", 170, 60),
            Err(LeaseError::NotHolder { .. })
        ));
    }
}
