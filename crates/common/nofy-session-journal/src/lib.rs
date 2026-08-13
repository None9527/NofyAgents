//! # nofy-session-journal
//!
//! Append-only runtime event journal and deterministic projection for
//! agent sessions — the "journal is the only truth" layer of the agent
//! runtime.
//!
//! ## Model
//!
//! Every runtime state change that matters (session lifecycle, turns,
//! model requests, tool invocations and outcomes, permission decisions,
//! compaction, budget) is an immutable [`Event`] appended to a
//! [`SessionJournal`]. Everything else — snapshots, diagnostics, resume
//! cross-checks — is a **projection** recomputed from those events via
//! [`SessionEventReducer`]/[`project`]; nothing writes the projection
//! directly.
//!
//! ## On-disk format
//!
//! One JSONL line per event (`runtime_events.jsonl` next to the session's
//! existing `chat_history.jsonl`/`updates.jsonl`), dense zero-based
//! `seq`, durable before visible (`sync_data` after each append). A torn
//! tail — the crash signature — is truncated on load and the valid prefix
//! kept; mid-file corruption is a hard error.
//!
//! ## Invariants (P0)
//!
//! 1. Dense, strictly increasing seqs per session journal.
//! 2. Append failures surface as errors — never silent drops.
//! 3. No execution events after `session.ended` until `session.resumed`.
//! 4. Torn tails truncate with a warning; load never panics.
//! 5. `tool.invoked` carries a stable `intent_id`
//!    ([`new_intent_id`]); outcomes reference it.
//! 6. Tool outcomes record `transport_status` and `outcome_status`
//!    separately (payload convention, enforced by producers).
//!
//! On top of the journal sits [`WorldState`] — a partitioned, typed,
//! source-governed read model (partitions: task/workspace/execution/
//! agent/knowledge/governance). It is a derived projection: rebuildable,
//! replaceable, never an implicit write path.
//!
//! This crate is Layer 1: no dependencies on shell/agent/tool crates.

pub mod continuity;
pub mod evidence;
pub mod event;
pub mod journal;
pub mod reconcile;
pub mod reducer;
pub mod world_state;

pub use continuity::{BudgetContinuity, restore_budget_continuity};
pub use evidence::{VerificationState, verification_state};
pub use event::{Event, EventKind, new_intent_id, now_ms};
pub use journal::{JournalError, MAX_JOURNAL_BYTES, SessionJournal};
pub use reconcile::{IntentClass, ReconciledIntent, ReconciliationReport, reconcile_open_intents};
pub use reducer::{Lifecycle, OpenIntent, SessionEventReducer, SessionRuntimeSnapshot, project};
pub use world_state::{
    Authority, EntryStatus, Freshness, Partition, UpsertOutcome, WorldState, WorldStateEntry,
    new_entry_id,
};

/// Conventional payload key: stable tool intent id.
pub const PAYLOAD_INTENT_ID: &str = "intent_id";
/// Conventional payload key: tool name.
pub const PAYLOAD_TOOL: &str = "tool";
/// Conventional payload key: transport-level status of a tool call
/// (`"ok"` / `"error"` — did the call chain return at all).
pub const PAYLOAD_TRANSPORT_STATUS: &str = "transport_status";
/// Conventional payload key: domain-level status of a tool call
/// (`"success"` / `"failed"` / `"unknown"` — did the action achieve its
/// goal). Distinct from transport status: a call can transport fine and
/// still fail its goal (e.g. an edit anchor that matched nothing).
pub const PAYLOAD_OUTCOME_STATUS: &str = "outcome_status";
/// Conventional payload key: schema version of a payload object, for
/// additive evolution.
pub const PAYLOAD_SCHEMA_VERSION: &str = "schema_version";

/// The per-session journal file name, sitting next to
/// `chat_history.jsonl` / `updates.jsonl` in the session directory.
pub const RUNTIME_EVENTS_FILE: &str = "runtime_events.jsonl";
