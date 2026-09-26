//! Budget continuity across session resume (RTAgent Phase D2).
//!
//! The convergence governor's counters (base limit, earned extensions)
//! live in process memory; a session resume would otherwise reset them
//! and let a run re-earn spent extensions — "reopen the session to
//! bypass the budget". The journal already records every `budget.updated`
//! decision, so the counters can be restored from it: resume re-reads
//! the last recorded budget state instead of starting from zero.
//!
//! Restoring from the journal keeps budget authority durable without
//! adding any new storage — the journal is the only truth.

use crate::event::{Event, EventKind};

/// Budget state restored from a journal's `budget.updated` history.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct BudgetContinuity {
    /// The base configured limit the governor was pinned to, if recorded.
    pub base_limit: Option<u64>,
    /// Extensions already earned (and spent) by the run so far. A resume
    /// must continue from this count, never from zero.
    pub extensions_used: u32,
    /// Seq of the `budget.updated` event this state was restored from.
    pub source_seq: u64,
}

/// Restore budget continuity from a journal's event history.
///
/// Scans every `budget.updated` event and folds to the last parseable
/// one. The payload's `extensions_used` is the pre-decision counter, so
/// an `extend` decision means one more extension was actually spent
/// after the event was written. Malformed payloads are skipped — a
/// corrupt governance event must not break resume, only lose fidelity.
/// `None` when the journal has no parseable budget history.
pub fn restore_budget_continuity<'a>(
    events: impl IntoIterator<Item = &'a Event>,
) -> Option<BudgetContinuity> {
    let mut restored: Option<BudgetContinuity> = None;
    for event in events {
        if event.kind != EventKind::BudgetUpdated {
            continue;
        }
        let payload = &event.payload;
        let extensions = match payload.get("extensions_used").and_then(|v| v.as_u64()) {
            Some(extensions) => extensions,
            None => continue,
        };
        let base_limit = payload.get("base_limit").and_then(|v| v.as_u64());
        // The journaled counter is pre-decision; an extend decision spent
        // one more extension after the snapshot was taken.
        let decision = payload
            .get("decision")
            .and_then(|v| v.as_str())
            .unwrap_or("");
        let spent = if decision == "extend" {
            extensions.saturating_add(1)
        } else {
            extensions
        };
        restored = Some(BudgetContinuity {
            base_limit,
            extensions_used: u32::try_from(spent).unwrap_or(u32::MAX),
            source_seq: event.seq,
        });
    }
    restored
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn budget_event(seq: u64, decision: &str, base_limit: u64, extensions_used: u64) -> Event {
        Event {
            seq,
            kind: EventKind::BudgetUpdated,
            session_id: "s1".into(),
            at_ms: 100 + seq,
            payload: json!({
                "decision": decision,
                "base_limit": base_limit,
                "extensions_used": extensions_used,
            }),
        }
    }

    #[test]
    fn empty_history_restores_nothing() {
        assert_eq!(
            restore_budget_continuity(std::iter::empty::<&Event>()),
            None
        );
    }

    #[test]
    fn non_budget_events_are_ignored() {
        let event = Event {
            seq: 1,
            kind: EventKind::TurnStarted,
            session_id: "s1".into(),
            at_ms: 100,
            payload: serde_json::Value::Null,
        };
        assert_eq!(restore_budget_continuity(&[event]), None);
    }

    #[test]
    fn continue_decision_restores_counters_verbatim() {
        let events = [budget_event(5, "continue", 40, 1)];
        let restored = restore_budget_continuity(&events).unwrap();
        assert_eq!(restored.base_limit, Some(40));
        assert_eq!(restored.extensions_used, 1);
        assert_eq!(restored.source_seq, 5);
    }

    #[test]
    fn extend_decision_accounts_for_the_spent_extension() {
        // Payload counter is pre-decision: the extend spent one more.
        let events = [budget_event(7, "extend", 40, 1)];
        let restored = restore_budget_continuity(&events).unwrap();
        assert_eq!(restored.extensions_used, 2);
    }

    #[test]
    fn last_parseable_budget_event_wins() {
        let events = [
            budget_event(5, "extend", 40, 0),
            budget_event(9, "continue", 40, 1),
            budget_event(12, "finish", 40, 1),
        ];
        let restored = restore_budget_continuity(&events).unwrap();
        assert_eq!(restored.source_seq, 12);
        assert_eq!(restored.extensions_used, 1);
    }

    #[test]
    fn malformed_payload_is_skipped_not_fatal() {
        let good = budget_event(5, "extend", 40, 0);
        let bad = Event {
            seq: 9,
            kind: EventKind::BudgetUpdated,
            session_id: "s1".into(),
            at_ms: 200,
            payload: json!({ "decision": "continue" }), // no counters
        };
        let restored = restore_budget_continuity([&good, &bad]).unwrap();
        assert_eq!(restored.source_seq, 5);
        assert_eq!(restored.extensions_used, 1);
    }

    #[test]
    fn restored_event_is_idempotent() {
        // A resume re-journals the restored state with decision
        // "restored"; restoring again must yield the same counters.
        let events = [budget_event(5, "extend", 40, 0)];
        let first = restore_budget_continuity(&events).unwrap();
        let rejournaled = Event {
            seq: 20,
            kind: EventKind::BudgetUpdated,
            session_id: "s1".into(),
            at_ms: 300,
            payload: json!({
                "decision": "restored",
                "base_limit": first.base_limit,
                "extensions_used": first.extensions_used,
                "source_seq": first.source_seq,
            }),
        };
        let second = restore_budget_continuity([&events[0], &rejournaled]).unwrap();
        assert_eq!(second.extensions_used, first.extensions_used);
        assert_eq!(second.base_limit, first.base_limit);
        assert_eq!(second.source_seq, 20);
    }
}
