//! Delivery ledger governance projection (FR5.8, HM-F16 — the G4 half).
//!
//! `barrier::DeliveryLedger` is the ledger body (at-least-once delivery).
//! This module is its GOVERNANCE projection: the ledger re-derived as an
//! event journal (audit + deterministic replay), plus dead-letter policy —
//! obligations that exhaust redelivery attempts are moved somewhere
//! visible, never silently dropped. 「投递丢失=0」stays an auditable
//! property (PRD §9).

use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

use crate::barrier::DeliveryLedger;

/// One ledger event — the journal form of the ledger.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum LedgerEvent {
    Dispatched { id: u64, payload: String },
    Claimed { id: u64 },
    Acked { id: u64 },
}

/// Fold a ledger journal into a ledger. Pure: replay reproduces state.
pub fn fold_ledger(events: &[LedgerEvent]) -> DeliveryLedger {
    let mut ledger = DeliveryLedger::default();
    let mut id_map: BTreeMap<u64, u64> = BTreeMap::new(); // journal id -> ledger id
    for event in events {
        match event {
            LedgerEvent::Dispatched { id, payload } => {
                let ledger_id = ledger.dispatch(payload.clone());
                id_map.insert(*id, ledger_id);
            }
            LedgerEvent::Claimed { id } => {
                if let Some(ledger_id) = id_map.get(id) {
                    ledger.claim(*ledger_id);
                }
            }
            LedgerEvent::Acked { id } => {
                if let Some(ledger_id) = id_map.get(id) {
                    ledger.ack(*ledger_id);
                }
            }
        }
    }
    ledger
}

/// Journal a ledger's current state (audit export).
pub fn audit_events(ledger: &DeliveryLedger) -> Vec<LedgerEvent> {
    let mut events = Vec::new();
    for entry in ledger.entries() {
        events.push(LedgerEvent::Dispatched {
            id: entry.id,
            payload: entry.payload.clone(),
        });
        if entry.claimed {
            events.push(LedgerEvent::Claimed { id: entry.id });
        }
        if entry.acked {
            events.push(LedgerEvent::Acked { id: entry.id });
        }
    }
    events
}

/// Dead-letter policy: obligations redelivered more than `max_attempts`
/// times without an ack are dead letters — surfaced for an operator,
/// never silently dropped.
pub fn dead_letters(ledger: &DeliveryLedger, attempts: &BTreeMap<u64, u64>, max_attempts: u64) -> Vec<u64> {
    ledger
        .outstanding()
        .into_iter()
        .filter(|id| attempts.get(id).copied().unwrap_or(0) > max_attempts)
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn journal_replay_reproduces_ledger() {
        let mut ledger = DeliveryLedger::default();
        let a = ledger.dispatch("task-a");
        let b = ledger.dispatch("task-b");
        ledger.claim(a);
        ledger.ack(a);
        ledger.claim(b);

        let journal = audit_events(&ledger);
        let replayed = fold_ledger(&journal);
        assert_eq!(replayed.health().total, ledger.health().total);
        assert_eq!(replayed.health().acked, ledger.health().acked);
        assert_eq!(replayed.outstanding(), ledger.outstanding());
        assert_eq!(replayed.entries(), ledger.entries());
    }

    #[test]
    fn replay_is_deterministic() {
        let events = vec![
            LedgerEvent::Dispatched { id: 0, payload: "x".into() },
            LedgerEvent::Claimed { id: 0 },
            LedgerEvent::Dispatched { id: 1, payload: "y".into() },
            LedgerEvent::Acked { id: 0 },
        ];
        assert_eq!(fold_ledger(&events), fold_ledger(&events));
    }

    #[test]
    fn claim_ack_for_unknown_ids_are_ignored() {
        let events = vec![
            LedgerEvent::Claimed { id: 99 },
            LedgerEvent::Acked { id: 99 },
            LedgerEvent::Dispatched { id: 0, payload: "x".into() },
        ];
        let ledger = fold_ledger(&events);
        assert_eq!(ledger.health().total, 1);
        assert_eq!(ledger.health().acked, 0);
    }

    #[test]
    fn dead_letters_surface_exhausted_redeliveries() {
        let mut ledger = DeliveryLedger::default();
        let stuck = ledger.dispatch("stuck");
        let fresh = ledger.dispatch("fresh");
        let mut attempts = BTreeMap::new();
        attempts.insert(stuck, 4); // over the limit
        attempts.insert(fresh, 1);

        let dead = dead_letters(&ledger, &attempts, 3);
        assert_eq!(dead, vec![stuck]);
        // The dead letter is still VISIBLE in the ledger (never dropped).
        assert!(ledger.outstanding().contains(&stuck));
        assert!(ledger.outstanding().contains(&fresh));
    }
}
