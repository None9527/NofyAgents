//! Session runtime event types.
//!
//! The event vocabulary follows the RTAgent-style truth hierarchy: every
//! state change that the runtime cares about is an immutable event. Kinds
//! are grouped as:
//!
//! - **session lifecycle** (`session.*`) — start, end, resume boundaries;
//! - **turns** (`turn.*`) — one user-prompt → final-response cycle;
//! - **model** (`model.*`) — request/response pairs with usage accounting;
//! - **tools** (`tool.*`) — invocation and outcome, keyed by stable
//!   `intent_id` so later reconciliation can match effects to intents;
//! - **permissions** (`permission.*`) — approval decisions;
//! - **context** (`context.*`, `reminder.*`) — compaction and injection;
//! - **checkpoints/budget/reconciliation** — recovery and governance.
//!
//! Payloads are free-form JSON with a conventional shape documented per
//! kind; consumers must tolerate unknown fields (schema drift is handled
//! by additive fields, never by redefining existing ones).

/// Canonical runtime event kinds.
///
/// Serialized as dotted strings (`"turn.started"`) so journal files stay
/// greppable and host-agnostic. Unknown kinds on disk are a load error —
/// the journal is a closed vocabulary, and a typo must not silently become
/// a new event class.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
pub enum EventKind {
    // -- session lifecycle -------------------------------------------------
    #[serde(rename = "session.started")]
    SessionStarted,
    #[serde(rename = "session.ended")]
    SessionEnded,
    #[serde(rename = "session.resumed")]
    SessionResumed,

    // -- turns ---------------------------------------------------------------
    #[serde(rename = "turn.started")]
    TurnStarted,
    #[serde(rename = "turn.completed")]
    TurnCompleted,
    #[serde(rename = "turn.failed")]
    TurnFailed,
    #[serde(rename = "turn.cancelled")]
    TurnCancelled,

    // -- model ----------------------------------------------------------------
    #[serde(rename = "model.requested")]
    ModelRequested,
    #[serde(rename = "model.responded")]
    ModelResponded,

    // -- tools -----------------------------------------------------------------
    #[serde(rename = "tool.invoked")]
    ToolInvoked,
    #[serde(rename = "tool.succeeded")]
    ToolSucceeded,
    #[serde(rename = "tool.failed")]
    ToolFailed,

    // -- permissions ---------------------------------------------------------
    #[serde(rename = "permission.requested")]
    PermissionRequested,
    #[serde(rename = "permission.granted")]
    PermissionGranted,
    #[serde(rename = "permission.denied")]
    PermissionDenied,

    // -- context ---------------------------------------------------------------
    #[serde(rename = "context.compaction_triggered")]
    CompactionTriggered,
    #[serde(rename = "context.compacted")]
    Compacted,
    #[serde(rename = "reminder.injected")]
    ReminderInjected,

    // -- conversation history persistence ------------------------------------
    /// One conversation item was appended to the durable chat history.
    #[serde(rename = "history.message_appended")]
    HistoryMessageAppended,
    /// The durable chat history was wholesale replaced (compaction,
    /// rewind, repair). The pre-replace content is lost by this
    /// operation; the event records that fact and the new length.
    #[serde(rename = "history.replaced")]
    HistoryReplaced,

    // -- recovery / governance ----------------------------------------------
    #[serde(rename = "checkpoint.created")]
    CheckpointCreated,
    #[serde(rename = "checkpoint.consumed")]
    CheckpointConsumed,
    #[serde(rename = "budget.updated")]
    BudgetUpdated,
    #[serde(rename = "reconciliation.completed")]
    ReconciliationCompleted,
}

impl EventKind {
    /// Session boundary events (`session.*`). These delimit journal
    /// segments; everything else is an execution event.
    pub fn is_session_lifecycle(self) -> bool {
        matches!(
            self,
            Self::SessionStarted | Self::SessionEnded | Self::SessionResumed
        )
    }

    /// The terminal boundary: no execution event may be appended after a
    /// [`Self::SessionEnded`] until a [`Self::SessionResumed`] reopens the
    /// segment.
    pub fn is_terminal(self) -> bool {
        matches!(self, Self::SessionEnded)
    }

    /// Events that represent runtime work (as opposed to segment
    /// boundaries). These are what the terminal gate blocks.
    pub fn is_execution(self) -> bool {
        !self.is_session_lifecycle()
    }

    /// Tool outcome events that close a previously opened intent.
    pub fn is_tool_outcome(self) -> bool {
        matches!(self, Self::ToolSucceeded | Self::ToolFailed)
    }

    /// The stable string form (e.g. `"turn.started"`), for logging and
    /// diagnostics.
    pub fn as_str(self) -> &'static str {
        match self {
            Self::SessionStarted => "session.started",
            Self::SessionEnded => "session.ended",
            Self::SessionResumed => "session.resumed",
            Self::TurnStarted => "turn.started",
            Self::TurnCompleted => "turn.completed",
            Self::TurnFailed => "turn.failed",
            Self::TurnCancelled => "turn.cancelled",
            Self::ModelRequested => "model.requested",
            Self::ModelResponded => "model.responded",
            Self::ToolInvoked => "tool.invoked",
            Self::ToolSucceeded => "tool.succeeded",
            Self::ToolFailed => "tool.failed",
            Self::PermissionRequested => "permission.requested",
            Self::PermissionGranted => "permission.granted",
            Self::PermissionDenied => "permission.denied",
            Self::CompactionTriggered => "context.compaction_triggered",
            Self::Compacted => "context.compacted",
            Self::ReminderInjected => "reminder.injected",
            Self::HistoryMessageAppended => "history.message_appended",
            Self::HistoryReplaced => "history.replaced",
            Self::CheckpointCreated => "checkpoint.created",
            Self::CheckpointConsumed => "checkpoint.consumed",
            Self::BudgetUpdated => "budget.updated",
            Self::ReconciliationCompleted => "reconciliation.completed",
        }
    }
}

impl std::fmt::Display for EventKind {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.as_str())
    }
}

/// A single immutable runtime event.
///
/// Serialization is the on-disk JSONL line format; field order is stable
/// because serde emits struct fields in declaration order.
#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
pub struct Event {
    /// Dense, zero-based sequence within the session journal.
    pub seq: u64,
    /// What happened.
    pub kind: EventKind,
    /// Owning session; every event in one journal file must carry the
    /// same id (enforced on append).
    pub session_id: String,
    /// Unix epoch milliseconds when the event was committed.
    pub at_ms: u64,
    /// Kind-specific conventional payload; `Null` when the kind carries
    /// no extra data.
    #[serde(default)]
    pub payload: serde_json::Value,
}

impl Event {
    /// The tool intent id for `tool.*` events, when the payload carries
    /// one (`payload.intent_id`). Intents are how outcomes and later
    /// reconciliation are matched back to invocations.
    pub fn intent_id(&self) -> Option<&str> {
        self.payload.get("intent_id")?.as_str()
    }

    /// The tool name for `tool.*` events, when present
    /// (`payload.tool`).
    pub fn tool_name(&self) -> Option<&str> {
        self.payload.get("tool")?.as_str()
    }
}

/// Generate a fresh, time-ordered tool intent id (UUIDv7).
///
/// Dispatch layers stamp this into `tool.invoked` payloads so outcomes —
/// even across a crash — can be matched to their intent.
pub fn new_intent_id() -> String {
    uuid::Uuid::now_v7().to_string()
}

/// Current wall clock as Unix epoch milliseconds (0 if the clock is
/// before the epoch — never expected, but the journal must not panic).
pub fn now_ms() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| u64::try_from(d.as_millis()).unwrap_or(u64::MAX))
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn kind_serializes_as_dotted_string() {
        assert_eq!(
            serde_json::to_string(&EventKind::TurnStarted).unwrap(),
            "\"turn.started\""
        );
        assert_eq!(
            serde_json::from_str::<EventKind>("\"tool.failed\"").unwrap(),
            EventKind::ToolFailed
        );
    }

    #[test]
    fn unknown_kind_is_rejected() {
        // Closed vocabulary: a typo must not become a new event class.
        assert!(serde_json::from_str::<EventKind>("\"turn.startedd\"").is_err());
    }

    #[test]
    fn classifications_partition() {
        for kind in [
            EventKind::SessionStarted,
            EventKind::SessionEnded,
            EventKind::SessionResumed,
            EventKind::TurnStarted,
            EventKind::ModelRequested,
            EventKind::ToolInvoked,
            EventKind::PermissionGranted,
            EventKind::Compacted,
            EventKind::BudgetUpdated,
        ] {
            assert_eq!(kind.is_session_lifecycle(), !kind.is_execution());
        }
        assert!(EventKind::SessionEnded.is_terminal());
        assert!(!EventKind::SessionStarted.is_terminal());
        assert!(EventKind::ToolSucceeded.is_tool_outcome());
        assert!(EventKind::ToolFailed.is_tool_outcome());
        assert!(!EventKind::ToolInvoked.is_tool_outcome());
    }

    #[test]
    fn event_round_trips_and_reads_conventional_fields() {
        let event = Event {
            seq: 3,
            kind: EventKind::ToolInvoked,
            session_id: "s1".into(),
            at_ms: 123,
            payload: serde_json::json!({ "intent_id": "abc", "tool": "read_file" }),
        };
        let line = serde_json::to_string(&event).unwrap();
        let back: Event = serde_json::from_str(&line).unwrap();
        assert_eq!(back, event);
        assert_eq!(back.intent_id(), Some("abc"));
        assert_eq!(back.tool_name(), Some("read_file"));
    }

    #[test]
    fn intent_ids_are_unique_and_ordered() {
        let a = new_intent_id();
        let b = new_intent_id();
        assert_ne!(a, b);
        // UUIDv7 is time-ordered: lexicographic order tracks creation.
        assert!(a < b);
    }
}
