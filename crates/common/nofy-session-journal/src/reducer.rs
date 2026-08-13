//! Projection of the event journal into a runtime snapshot.
//!
//! The snapshot is a **read-side view**: it is recomputed from events,
//! never written directly. Two consumers folding the same events see the
//! same snapshot — this is what makes resume cross-checks and replay
//! diagnostics possible.
//!
//! The snapshot deliberately stays small and factual: counters, lifecycle
//! state, and the set of *open tool intents* (invocations without an
//! outcome yet). Richer projections (world-state style frames) can build
//! on the same events later without touching the write path.

use std::collections::BTreeMap;

use crate::event::{Event, EventKind};

/// Session lifecycle as seen from the event stream.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum Lifecycle {
    /// No events yet (or journal empty).
    #[default]
    NotStarted,
    /// `session.started` (or `session.resumed`) committed, no
    /// `session.ended` since.
    Running,
    /// `session.ended` committed and not reopened.
    Ended,
}

/// A tool invocation that has no outcome event yet.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct OpenIntent {
    /// Seq of the `tool.invoked` event.
    pub seq: u64,
    /// When the invocation was committed.
    pub at_ms: u64,
    /// Tool name from the payload, if present.
    pub tool: Option<String>,
}

/// The folded runtime state of one session journal.
#[derive(Debug, Clone, PartialEq, Default)]
pub struct SessionRuntimeSnapshot {
    /// Session id from the first event, once present.
    pub session_id: Option<String>,
    /// Lifecycle position.
    pub lifecycle: Lifecycle,
    /// Seq of the last folded event.
    pub last_seq: Option<u64>,

    /// `turn.started` count.
    pub turns_started: u64,
    /// Turns that reached any terminal state (completed/failed/cancelled).
    pub turns_terminal: u64,

    /// `model.requested` count.
    pub model_requests: u64,
    /// `model.responded` count.
    pub model_responses: u64,

    /// Invocations without an outcome yet, keyed by intent id.
    pub open_intents: BTreeMap<String, OpenIntent>,
    /// Invocations that received an outcome (succeeded or failed).
    pub closed_intents: u64,
    /// Outcome events whose intent id was never seen invoked (recorded,
    /// never silently dropped — a nonzero value indicates a journal or
    /// dispatch bug worth surfacing).
    pub orphan_outcomes: u64,

    /// Compaction events committed (`context.compacted`).
    pub compactions: u64,
    /// Reminder injections committed.
    pub reminders_injected: u64,

    /// Conversation items appended to the durable chat history.
    pub history_appends: u64,
    /// Wholesale chat-history replacements (compaction/rewind/repair).
    /// An append-only consumer must never assume the conversation only
    /// grows.
    pub history_replaces: u64,

    /// Permission grants committed.
    pub permission_grants: u64,
    /// Permission denials committed.
    pub permission_denials: u64,

    /// Payload of the most recent `budget.updated`, if any.
    pub last_budget: Option<serde_json::Value>,
    /// Payload of the most recent `reconciliation.completed`, if any.
    pub last_reconciliation: Option<serde_json::Value>,
}

impl SessionRuntimeSnapshot {
    /// Invocations still awaiting an outcome — the resume-time danger
    /// list: each one may need reconciliation with external reality
    /// before the session continues.
    pub fn has_open_intents(&self) -> bool {
        !self.open_intents.is_empty()
    }
}

/// Incremental folder: feed events in seq order via [`Self::apply`].
#[derive(Debug, Default)]
pub struct SessionEventReducer {
    snapshot: SessionRuntimeSnapshot,
}

impl SessionEventReducer {
    pub fn new() -> Self {
        Self::default()
    }

    /// Fold one event into the snapshot. Events must arrive in dense seq
    /// order (the journal guarantees this); a gap or reorder is a caller
    /// bug and panics in debug builds, degrades gracefully in release.
    pub fn apply(&mut self, event: &Event) {
        let expected = self.snapshot.last_seq.map_or(0, |seq| seq + 1);
        debug_assert_eq!(
            event.seq, expected,
            "reducer fed out-of-order event (expected seq {expected})"
        );
        let snapshot = &mut self.snapshot;
        if snapshot.session_id.is_none() {
            snapshot.session_id = Some(event.session_id.clone());
        }
        snapshot.last_seq = Some(event.seq);
        match event.kind {
            EventKind::SessionStarted | EventKind::SessionResumed => {
                snapshot.lifecycle = Lifecycle::Running;
            }
            EventKind::SessionEnded => snapshot.lifecycle = Lifecycle::Ended,
            EventKind::TurnStarted => snapshot.turns_started += 1,
            EventKind::TurnCompleted | EventKind::TurnFailed | EventKind::TurnCancelled => {
                snapshot.turns_terminal += 1;
            }
            EventKind::ModelRequested => snapshot.model_requests += 1,
            EventKind::ModelResponded => snapshot.model_responses += 1,
            EventKind::ToolInvoked => {
                if let Some(intent_id) = event.intent_id() {
                    snapshot.open_intents.insert(
                        intent_id.to_string(),
                        OpenIntent {
                            seq: event.seq,
                            at_ms: event.at_ms,
                            tool: event.tool_name().map(str::to_string),
                        },
                    );
                }
            }
            EventKind::ToolSucceeded | EventKind::ToolFailed => match event.intent_id() {
                Some(intent_id) if snapshot.open_intents.remove(intent_id).is_some() => {
                    snapshot.closed_intents += 1;
                }
                _ => snapshot.orphan_outcomes += 1,
            },
            EventKind::PermissionGranted => snapshot.permission_grants += 1,
            EventKind::PermissionDenied => snapshot.permission_denials += 1,
            EventKind::Compacted => snapshot.compactions += 1,
            EventKind::ReminderInjected => snapshot.reminders_injected += 1,
            EventKind::HistoryMessageAppended => snapshot.history_appends += 1,
            EventKind::HistoryReplaced => snapshot.history_replaces += 1,
            EventKind::BudgetUpdated => snapshot.last_budget = Some(event.payload.clone()),
            EventKind::ReconciliationCompleted => {
                snapshot.last_reconciliation = Some(event.payload.clone());
            }
            // Recorded, no projection state yet.
            EventKind::PermissionRequested
            | EventKind::CompactionTriggered
            | EventKind::CheckpointCreated
            | EventKind::CheckpointConsumed => {}
        }
    }

    /// The current projection.
    pub fn snapshot(&self) -> &SessionRuntimeSnapshot {
        &self.snapshot
    }

    pub fn into_snapshot(self) -> SessionRuntimeSnapshot {
        self.snapshot
    }
}

/// Fold a whole event slice — the deterministic projection entry point
/// (same events ⇒ same snapshot).
pub fn project(events: &[Event]) -> SessionRuntimeSnapshot {
    let mut reducer = SessionEventReducer::new();
    for event in events {
        reducer.apply(event);
    }
    reducer.into_snapshot()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::event::EventKind::*;

    fn event(seq: u64, kind: EventKind, payload: serde_json::Value) -> Event {
        Event {
            seq,
            kind,
            session_id: "s1".into(),
            at_ms: 1000 + seq,
            payload,
        }
    }

    #[test]
    fn lifecycle_and_counters_fold() {
        let events = vec![
            event(0, SessionStarted, serde_json::Value::Null),
            event(1, TurnStarted, serde_json::Value::Null),
            event(2, ModelRequested, serde_json::Value::Null),
            event(3, ModelResponded, serde_json::Value::Null),
            event(4, TurnCompleted, serde_json::Value::Null),
            event(5, SessionEnded, serde_json::Value::Null),
        ];
        let snapshot = project(&events);
        assert_eq!(snapshot.lifecycle, Lifecycle::Ended);
        assert_eq!(snapshot.turns_started, 1);
        assert_eq!(snapshot.turns_terminal, 1);
        assert_eq!(snapshot.model_requests, 1);
        assert_eq!(snapshot.model_responses, 1);
        assert_eq!(snapshot.last_seq, Some(5));
        assert_eq!(snapshot.session_id.as_deref(), Some("s1"));
    }

    #[test]
    fn intents_open_and_close_by_id() {
        let events = vec![
            event(0, SessionStarted, serde_json::Value::Null),
            event(
                1,
                ToolInvoked,
                serde_json::json!({"intent_id": "a", "tool": "read_file"}),
            ),
            event(
                2,
                ToolInvoked,
                serde_json::json!({"intent_id": "b", "tool": "search_replace"}),
            ),
            event(
                3,
                ToolSucceeded,
                serde_json::json!({"intent_id": "a", "outcome_status": "success"}),
            ),
        ];
        let snapshot = project(&events);
        assert_eq!(snapshot.closed_intents, 1);
        assert!(snapshot.has_open_intents());
        let open = snapshot.open_intents.get("b").unwrap();
        assert_eq!(open.tool.as_deref(), Some("search_replace"));
        assert_eq!(open.seq, 2);
    }

    #[test]
    fn orphan_outcomes_are_counted_not_dropped() {
        let events = vec![
            event(0, SessionStarted, serde_json::Value::Null),
            event(
                1,
                ToolSucceeded,
                serde_json::json!({"intent_id": "never-invoked"}),
            ),
        ];
        let snapshot = project(&events);
        assert_eq!(snapshot.orphan_outcomes, 1);
        assert_eq!(snapshot.closed_intents, 0);
    }

    #[test]
    fn projection_is_deterministic() {
        let events = vec![
            event(0, SessionStarted, serde_json::Value::Null),
            event(1, TurnStarted, serde_json::Value::Null),
            event(
                2,
                ToolInvoked,
                serde_json::json!({"intent_id": "a", "tool": "read_file"}),
            ),
            event(
                3,
                BudgetUpdated,
                serde_json::json!({"soft": 40, "hard": 60}),
            ),
            event(4, Compacted, serde_json::Value::Null),
            event(5, ReminderInjected, serde_json::Value::Null),
            event(6, PermissionGranted, serde_json::Value::Null),
            event(7, PermissionDenied, serde_json::Value::Null),
        ];
        // Same events, folded twice (whole-slice and incremental) —
        // identical snapshots.
        let whole = project(&events);
        let mut reducer = SessionEventReducer::new();
        for event in &events {
            reducer.apply(event);
        }
        assert_eq!(whole, reducer.into_snapshot());
        assert_eq!(whole.compactions, 1);
        assert_eq!(whole.reminders_injected, 1);
        assert_eq!(whole.permission_grants, 1);
        assert_eq!(whole.permission_denials, 1);
        assert_eq!(
            whole.last_budget,
            Some(serde_json::json!({"soft": 40, "hard": 60}))
        );
    }

    #[test]
    fn resume_reopens_lifecycle() {
        let events = vec![
            event(0, SessionStarted, serde_json::Value::Null),
            event(1, SessionEnded, serde_json::Value::Null),
            event(2, SessionResumed, serde_json::Value::Null),
        ];
        assert_eq!(project(&events).lifecycle, Lifecycle::Running);
    }
}
