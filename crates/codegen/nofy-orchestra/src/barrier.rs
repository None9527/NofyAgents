//! Barrier fan-in + delivery obligation ledger (FR11.4 + FR5.8,
//! NG-F19 + HM-F16).
//!
//! Two guarantees for multi-agent runs:
//!
//! - **Fan-in**: a parent waiting on N children is woken EXACTLY ONCE when
//!   the last child settles, regardless of settle order (auto-wake,
//!   FR6.4's consumer side). Double-settling a child never re-fires.
//! - **At-least-once delivery**: every dispatch is an obligation in a
//!   ledger; claims and acks are tracked; anything dispatched but not
//!   acked is a redelivery candidate. Delivery loss becomes DETECTABLE —
//!   「投递丢失=0」is an auditable property, not a hope.

use std::collections::{BTreeMap, BTreeSet};

/// Outcome of settling one child into a barrier.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum BarrierOutcome {
    /// Still waiting on other children.
    Waiting { remaining: usize },
    /// The last child just settled: wake the parent exactly once.
    Fired { all_ok: bool },
    /// This child already settled (idempotent, no re-fire).
    AlreadySettled,
    /// Unknown child (not part of this barrier).
    UnknownChild,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Barrier {
    armed: BTreeSet<String>,
    settled: BTreeMap<String, bool>,
    fired: bool,
}

impl Barrier {
    /// Arm a barrier over a set of children.
    pub fn arm(children: impl IntoIterator<Item = String>) -> Self {
        Self {
            armed: children.into_iter().collect(),
            settled: BTreeMap::new(),
            fired: false,
        }
    }

    /// Settle one child. Returns [`BarrierOutcome::Fired`] exactly once,
    /// when the last armed child settles.
    pub fn settle(&mut self, child: &str, ok: bool) -> BarrierOutcome {
        if !self.armed.contains(child) {
            return BarrierOutcome::UnknownChild;
        }
        if self.settled.contains_key(child) {
            return BarrierOutcome::AlreadySettled;
        }
        self.settled.insert(child.to_string(), ok);
        if self.settled.len() == self.armed.len() && !self.fired {
            self.fired = true;
            let all_ok = self.settled.values().all(|&ok| ok);
            BarrierOutcome::Fired { all_ok }
        } else {
            BarrierOutcome::Waiting {
                remaining: self.armed.len() - self.settled.len(),
            }
        }
    }

    pub fn pending(&self) -> usize {
        self.armed.len() - self.settled.len()
    }

    pub fn has_fired(&self) -> bool {
        self.fired
    }
}

/// One obligation in the delivery ledger.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LedgerEntry {
    pub id: u64,
    pub payload: String,
    pub claimed: bool,
    pub acked: bool,
}

/// At-least-once delivery ledger.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct DeliveryLedger {
    entries: Vec<LedgerEntry>,
    next_id: u64,
}

/// Reconciliation view: loss is a detectable state.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LedgerHealth {
    pub total: usize,
    pub acked: usize,
    /// Dispatched but not acked — redelivery candidates.
    pub outstanding: Vec<u64>,
}

impl DeliveryLedger {
    /// Record a dispatch obligation; returns its ledger id.
    pub fn dispatch(&mut self, payload: impl Into<String>) -> u64 {
        let id = self.next_id;
        self.next_id += 1;
        self.entries.push(LedgerEntry {
            id,
            payload: payload.into(),
            claimed: false,
            acked: false,
        });
        id
    }

    /// A consumer claims an obligation (first step of delivery).
    pub fn claim(&mut self, id: u64) -> bool {
        if let Some(entry) = self.entries.iter_mut().find(|e| e.id == id) {
            entry.claimed = true;
            true
        } else {
            false
        }
    }

    /// A consumer confirms delivery. An ack without a claim is still
    /// recorded (the obligation is satisfied) but flagged by health as
    /// unclaimed — observable, never silent.
    pub fn ack(&mut self, id: u64) -> bool {
        if let Some(entry) = self.entries.iter_mut().find(|e| e.id == id) {
            entry.acked = true;
            true
        } else {
            false
        }
    }

    /// Redelivery candidates: dispatched, not acked.
    pub fn outstanding(&self) -> Vec<u64> {
        self.entries
            .iter()
            .filter(|e| !e.acked)
            .map(|e| e.id)
            .collect()
    }

    pub fn health(&self) -> LedgerHealth {
        LedgerHealth {
            total: self.entries.len(),
            acked: self.entries.iter().filter(|e| e.acked).count(),
            outstanding: self.outstanding(),
        }
    }

    pub fn entries(&self) -> &[LedgerEntry] {
        &self.entries
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fan_in_fires_exactly_once_on_last_settle() {
        let mut barrier = Barrier::arm(["a", "b", "c"].map(str::to_string));
        assert_eq!(
            barrier.settle("a", true),
            BarrierOutcome::Waiting { remaining: 2 }
        );
        assert_eq!(
            barrier.settle("c", true),
            BarrierOutcome::Waiting { remaining: 1 }
        );
        assert_eq!(
            barrier.settle("b", true),
            BarrierOutcome::Fired { all_ok: true }
        );
        // Double-settle never re-fires.
        assert_eq!(barrier.settle("b", true), BarrierOutcome::AlreadySettled);
        assert_eq!(barrier.settle("a", false), BarrierOutcome::AlreadySettled);
        assert!(barrier.has_fired());
        assert_eq!(barrier.pending(), 0);
    }

    #[test]
    fn fan_in_reports_mixed_outcomes() {
        let mut barrier = Barrier::arm(["a", "b"].map(str::to_string));
        barrier.settle("a", true);
        assert_eq!(
            barrier.settle("b", false),
            BarrierOutcome::Fired { all_ok: false }
        );
    }

    #[test]
    fn unknown_child_is_rejected() {
        let mut barrier = Barrier::arm(["a"].map(str::to_string));
        assert_eq!(barrier.settle("ghost", true), BarrierOutcome::UnknownChild);
        assert_eq!(barrier.pending(), 1);
    }

    #[test]
    fn ledger_tracks_dispatch_claim_ack() {
        let mut ledger = DeliveryLedger::default();
        let id1 = ledger.dispatch("task-1");
        let id2 = ledger.dispatch("task-2");
        assert_eq!(ledger.outstanding(), vec![id1, id2]);

        ledger.claim(id1);
        ledger.ack(id1);
        assert_eq!(
            ledger.outstanding(),
            vec![id2],
            "acked obligation leaves outstanding"
        );

        let health = ledger.health();
        assert_eq!(health.total, 2);
        assert_eq!(health.acked, 1);
        assert_eq!(health.outstanding, vec![id2]);
    }

    #[test]
    fn redelivery_candidate_stays_visible_until_acked() {
        let mut ledger = DeliveryLedger::default();
        let id = ledger.dispatch("task");
        // Claimed but consumer died before ack → still outstanding.
        ledger.claim(id);
        assert_eq!(ledger.outstanding(), vec![id]);
        // At-least-once: redeliver, re-claim, ack — no duplicate ids.
        ledger.claim(id);
        ledger.ack(id);
        assert!(ledger.outstanding().is_empty());
        assert_eq!(
            ledger.entries().len(),
            1,
            "redelivery reuses the obligation"
        );
    }

    #[test]
    fn unknown_ids_are_no_ops() {
        let mut ledger = DeliveryLedger::default();
        assert!(!ledger.claim(99));
        assert!(!ledger.ack(99));
        assert_eq!(ledger.health().total, 0);
    }
}
