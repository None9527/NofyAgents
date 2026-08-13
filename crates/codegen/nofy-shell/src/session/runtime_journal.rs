//! Session runtime event journal integration (runtime evolution, Phase 1).
//!
//! Wires `nofy-session-journal` into the session lifecycle:
//!
//! - [`is_enabled`] — the feature gate (`NOFY_RUNTIME_JOURNAL=1`); off by
//!   default, so the interactive path is untouched until explicitly opted
//!   in.
//! - [`RuntimeJournalHandle`] — a cheap cloneable handle over a dedicated
//!   writer task that owns the [`SessionJournal`] for one session
//!   (`runtime_events.jsonl` in the session directory). Emits are
//!   fire-and-forget; append failures warn and never crash the session.
//! - [`JournalingChatPersistence`] — a `ChatPersistence` decorator that
//!   journals the conversation-level facts visible at the persistence seam
//!   (assistant responses, reminder injections, full history rewrites)
//!   while delegating every call to the wrapped production persistence.
//!
//! Semantic events that only higher layers can see (turn boundaries, tool
//! dispatch outcomes, compaction decisions) are emitted by those layers
//! through the same handle; see `turn.rs`, `tool_calls.rs`,
//! `compaction.rs`.
//!
//! Lifecycle semantics: the writer opens the segment with
//! `session.started` (fresh journal) or `session.resumed` (existing
//! journal — clean `session.ended` before, or a crash mid-run; the journal
//! cannot tell them apart and both are resumptions). A missing
//! `session.ended` therefore means "unclean stop", which is exactly the
//! signal resume-time reconciliation needs.

use std::path::Path;

use tokio::sync::{mpsc, oneshot};
use nofy_chat_state::{ChatPersistence, StrictAppendAck, StrictAppendError};
use nofy_sampling_types::ConversationItem;
use nofy_session_journal::{EventKind, SessionJournal};

/// The journal file name inside a session directory, sibling to
/// `chat_history.jsonl` / `updates.jsonl`.
pub(crate) const RUNTIME_EVENTS_FILE: &str = "runtime_events.jsonl";

/// Environment-variable gate for the runtime journal. Off by default:
/// nothing changes for any user until opted in.
pub(crate) const RUNTIME_JOURNAL_ENV: &str = "NOFY_RUNTIME_JOURNAL";

/// Environment-variable gate for the D1 verification reminder (nudge
/// when mutations have no recorded verification). Off by default; the
/// journal itself must also be active for the signal to exist.
pub(crate) const VERIFICATION_GATE_ENV: &str = "NOFY_VERIFICATION_GATE";

/// Whether the runtime journal is enabled for this process.
pub(crate) fn is_enabled() -> bool {
    std::env::var(RUNTIME_JOURNAL_ENV)
        .is_ok_and(|value| value == "1" || value.eq_ignore_ascii_case("true"))
}

/// Whether the D1 verification reminder is enabled for this process.
pub(crate) fn is_verification_gate_enabled() -> bool {
    std::env::var(VERIFICATION_GATE_ENV)
        .is_ok_and(|value| value == "1" || value.eq_ignore_ascii_case("true"))
}

/// Sentinel for "no such seq recorded" in the verification watermarks.
const NO_SEQ: u64 = u64::MAX;

/// Resume-reconciliation classifier for the tool registry's tool names.
///
/// Read-only tools leave no side effect to reconcile; background-capable
/// tools may still be running; everything else (mutations, external API
/// effects) is `SideEffectUnknown` — and any unrecognized name stays
/// unknown, since absence of identification is not evidence of safety.
pub(crate) fn classify_tool(tool: &str) -> nofy_session_journal::IntentClass {
    use nofy_session_journal::IntentClass;
    match tool {
        "read_file" | "grep" | "list_dir" | "search_tool" | "web_search" | "web_fetch"
        | "task_output" | "ask_user_question" | "enter_plan_mode" | "exit_plan_mode"
        | "todo" | "update_goal" | "lsp" | "skills" => IntentClass::ReadOnly,
        "bash" | "task" | "monitor" => IntentClass::PossiblyRunning,
        _ => IntentClass::SideEffectUnknown,
    }
}

/// D1 evidence classifiers: which tool invocations mutate external
/// reality, and which successes verify the work. A successful `bash`
/// run (tests/build) after the last edit is the verification signal;
/// `search_replace` is the file-editing tool.
pub(crate) fn is_mutation_tool(tool: &str) -> bool {
    matches!(tool, "search_replace")
}

pub(crate) fn is_verification_tool(tool: &str) -> bool {
    tool == "bash"
}

/// Message to the journal writer task.
enum RuntimeJournalMsg {
    Append {
        kind: EventKind,
        payload: serde_json::Value,
    },
    /// Flush-and-close: commit `session.ended` (clean shutdown) and stop.
    End,
}

/// Cloneable handle to one session's journal writer task.
///
/// `noop()` handles discard everything and report `is_active() == false`;
/// call sites can hold a handle unconditionally without branching.
#[derive(Clone)]
pub(crate) struct RuntimeJournalHandle {
    tx: Option<mpsc::UnboundedSender<RuntimeJournalMsg>>,
    /// Resume reconciliation findings, when this handle opened an existing
    /// journal. `None` for fresh journals and noop handles.
    reconciliation: Option<std::sync::Arc<nofy_session_journal::ReconciliationReport>>,
    /// Budget state restored from the journal's `budget.updated` history
    /// on resume (RTAgent Phase D2), so a reopened session continues from
    /// its earned-extension count instead of re-earning spent extensions.
    /// `None` for fresh journals, noop handles, and journals without
    /// budget history.
    budget_continuity: Option<std::sync::Arc<nofy_session_journal::BudgetContinuity>>,
    /// Live gauge of tool intents invoked but not yet settled (success or
    /// failure), maintained by the writer task as events flow through.
    /// Shared with the governor so no-progress decisions never fire while
    /// work is still in flight.
    open_intents: std::sync::Arc<std::sync::atomic::AtomicUsize>,
    /// D1 verification watermarks (RTAgent Phase D1): seq of the last
    /// mutation (file edit) and the last verification success, maintained
    /// by the writer task. [`NO_SEQ`] means "none recorded". Verification
    /// only answers mutations strictly before it.
    last_mutation_seq: std::sync::Arc<std::sync::atomic::AtomicU64>,
    last_verification_seq: std::sync::Arc<std::sync::atomic::AtomicU64>,
}

impl RuntimeJournalHandle {
    /// A disabled handle: emits go nowhere.
    pub(crate) fn noop() -> Self {
        Self {
            tx: None,
            reconciliation: None,
            budget_continuity: None,
            open_intents: std::sync::Arc::new(std::sync::atomic::AtomicUsize::new(0)),
            last_mutation_seq: std::sync::Arc::new(std::sync::atomic::AtomicU64::new(NO_SEQ)),
            last_verification_seq: std::sync::Arc::new(std::sync::atomic::AtomicU64::new(
                NO_SEQ,
            )),
        }
    }

    /// Whether a real writer task backs this handle.
    pub(crate) fn is_active(&self) -> bool {
        self.tx.is_some()
    }

    /// Reconciliation findings from opening an existing journal: which tool
    /// intents were left open by the previous (possibly unclean) segment and
    /// how they relate to external reality. `None` for fresh journals.
    pub(crate) fn reconciliation_report(
        &self,
    ) -> Option<std::sync::Arc<nofy_session_journal::ReconciliationReport>> {
        self.reconciliation.clone()
    }

    /// Budget state restored from the journal on resume (RTAgent Phase
    /// D2): the base limit and earned-extension count the run had before
    /// the stop. Session spawn seeds the convergence counters from this
    /// so resume cannot bypass the budget. `None` for fresh journals and
    /// journals without budget history.
    pub(crate) fn budget_continuity(
        &self,
    ) -> Option<std::sync::Arc<nofy_session_journal::BudgetContinuity>> {
        self.budget_continuity.clone()
    }

    /// Live verification evidence (RTAgent Phase D1): whether the work
    /// since the last mutation has a recorded verification success.
    /// `None` when the journal is inactive — no observation, never
    /// "verified".
    pub(crate) fn verification_state(&self) -> Option<nofy_session_journal::VerificationState> {
        self.tx.as_ref()?;
        use nofy_session_journal::VerificationState;
        let mutation = self
            .last_mutation_seq
            .load(std::sync::atomic::Ordering::Relaxed);
        let verification = self
            .last_verification_seq
            .load(std::sync::atomic::Ordering::Relaxed);
        Some(match (mutation, verification) {
            (NO_SEQ, _) => VerificationState::NoMutations,
            (m, v) if v != NO_SEQ && v > m => VerificationState::Verified {
                last_mutation_seq: m,
                verification_seq: v,
            },
            (m, _) => VerificationState::Unverified {
                last_mutation_seq: m,
            },
        })
    }

    /// Live count of open tool intents, or `None` when the journal is
    /// inactive (no observation — callers must treat `None` as "unknown",
    /// never as zero).
    pub(crate) fn open_intent_count(&self) -> Option<usize> {
        self.tx
            .is_some()
            .then(|| self.open_intents.load(std::sync::atomic::Ordering::Relaxed))
    }

    /// Open (or reopen) the journal at `session_dir/runtime_events.jsonl`
    /// and start the writer task. The segment-opening lifecycle event
    /// (`session.started` for a fresh journal, `session.resumed` for an
    /// existing one) is committed before this returns control.
    ///
    /// Any open/load failure degrades to [`Self::noop`] with a warning —
    /// the journal is observability, never a session dependency.
    pub(crate) fn spawn(session_dir: &Path, session_id: String) -> Self {
        let path = session_dir.join(RUNTIME_EVENTS_FILE);
        let journal = match SessionJournal::load(path) {
            Ok(journal) => journal,
            Err(error) => {
                tracing::warn!(
                    %error,
                    session_id = %session_id,
                    "runtime journal load failed; continuing without journaling"
                );
                return Self::noop();
            }
        };
        let open_kind = if journal.is_empty() {
            EventKind::SessionStarted
        } else {
            EventKind::SessionResumed
        };
        let mut journal = journal;
        if let Err(error) = journal.append(open_kind, session_id.clone(), serde_json::Value::Null)
        {
            tracing::warn!(
                %error,
                session_id = %session_id,
                "runtime journal open append failed; continuing without journaling"
            );
            return Self::noop();
        }
        // Resume reconciliation (RTAgent §5.3): classify the intents the
        // previous segment left open and commit the findings, so the new
        // segment starts from a recorded view of reality instead of blindly
        // assuming the last known state.
        let reconciliation = if open_kind == EventKind::SessionResumed {
            let snapshot = nofy_session_journal::project(journal.events());
            let report =
                nofy_session_journal::reconcile_open_intents(&snapshot, classify_tool);
            if report.needs_attention() {
                tracing::info!(
                    session_id = %session_id,
                    summary = %report.summary_line(),
                    "runtime journal resume reconciliation needs attention"
                );
            }
            let payload = serde_json::to_value(&report).unwrap_or(serde_json::Value::Null);
            if let Err(error) = journal.append(
                EventKind::ReconciliationCompleted,
                session_id.clone(),
                payload,
            ) {
                tracing::warn!(
                    %error,
                    session_id = %session_id,
                    "runtime journal reconciliation append failed"
                );
            }
            Some(std::sync::Arc::new(report))
        } else {
            None
        };
        // Budget continuity (RTAgent §10, Phase D2): the convergence
        // counters live in process memory, so a resume would reset them
        // and let the run re-earn spent extensions. Restore the last
        // recorded budget state from the journal and re-journal it, so
        // the new segment starts with durable budget authority.
        let budget_continuity = if open_kind == EventKind::SessionResumed {
            let restored = nofy_session_journal::restore_budget_continuity(journal.events());
            if let Some(continuity) = &restored {
                let payload = serde_json::json!({
                    "decision": "restored",
                    "base_limit": continuity.base_limit,
                    "extensions_used": continuity.extensions_used,
                    "source_seq": continuity.source_seq,
                });
                if let Err(error) =
                    journal.append(EventKind::BudgetUpdated, session_id.clone(), payload)
                {
                    tracing::warn!(
                        %error,
                        session_id = %session_id,
                        "runtime journal budget-continuity append failed"
                    );
                }
                tracing::info!(
                    session_id = %session_id,
                    base_limit = ?continuity.base_limit,
                    extensions_used = continuity.extensions_used,
                    source_seq = continuity.source_seq,
                    "runtime journal restored budget continuity"
                );
            }
            restored.map(std::sync::Arc::new)
        } else {
            None
        };
        let open_intents = std::sync::Arc::new(std::sync::atomic::AtomicUsize::new(
            // Intents left open by the previous segment are still open.
            reconciliation
                .as_ref()
                .map(|r| r.open_total)
                .unwrap_or(0),
        ));
        // Verification evidence (RTAgent Phase D1): seed the mutation /
        // verification watermarks from the previous segment, so an
        // unverified change stays unverified across resume.
        let (seed_mutation, seed_verification) = if open_kind == EventKind::SessionResumed {
            use nofy_session_journal::VerificationState;
            match nofy_session_journal::verification_state(
                journal.events(),
                is_mutation_tool,
                is_verification_tool,
            ) {
                VerificationState::NoMutations => (NO_SEQ, NO_SEQ),
                VerificationState::Verified {
                    last_mutation_seq,
                    verification_seq,
                } => (last_mutation_seq, verification_seq),
                VerificationState::Unverified { last_mutation_seq } => {
                    (last_mutation_seq, NO_SEQ)
                }
            }
        } else {
            (NO_SEQ, NO_SEQ)
        };
        let last_mutation_seq =
            std::sync::Arc::new(std::sync::atomic::AtomicU64::new(seed_mutation));
        let last_verification_seq =
            std::sync::Arc::new(std::sync::atomic::AtomicU64::new(seed_verification));
        let (tx, mut rx) = mpsc::unbounded_channel::<RuntimeJournalMsg>();
        let writer_open_intents = open_intents.clone();
        let writer_mutation = last_mutation_seq.clone();
        let writer_verification = last_verification_seq.clone();
        tokio::spawn(async move {
            while let Some(msg) = rx.recv().await {
                match msg {
                    RuntimeJournalMsg::Append { kind, payload } => {
                        match kind {
                            EventKind::ToolInvoked => {
                                writer_open_intents
                                    .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
                            }
                            EventKind::ToolSucceeded | EventKind::ToolFailed => {
                                writer_open_intents
                                    .fetch_update(
                                        std::sync::atomic::Ordering::Relaxed,
                                        std::sync::atomic::Ordering::Relaxed,
                                        |n| n.checked_sub(1),
                                    )
                                    .ok();
                            }
                            _ => {}
                        }
                        match journal.append(kind, session_id.clone(), payload) {
                            Ok(event) => {
                                // D1 watermarks: a mutation reopens the
                                // question; a verification success answers
                                // everything before it.
                                match event.kind {
                                    EventKind::ToolInvoked
                                        if event.tool_name().is_some_and(is_mutation_tool) =>
                                    {
                                        writer_mutation.store(
                                            event.seq,
                                            std::sync::atomic::Ordering::Relaxed,
                                        );
                                    }
                                    EventKind::ToolSucceeded
                                        if event
                                            .tool_name()
                                            .is_some_and(is_verification_tool) =>
                                    {
                                        writer_verification.store(
                                            event.seq,
                                            std::sync::atomic::Ordering::Relaxed,
                                        );
                                    }
                                    _ => {}
                                }
                            }
                            Err(error) => {
                                tracing::warn!(
                                    %error,
                                    kind = %kind,
                                    session_id = %session_id,
                                    "runtime journal append failed; event dropped"
                                );
                            }
                        }
                    }
                    RuntimeJournalMsg::End => {
                        if let Err(error) = journal.append(
                            EventKind::SessionEnded,
                            session_id.clone(),
                            serde_json::Value::Null,
                        ) {
                            tracing::warn!(
                                %error,
                                session_id = %session_id,
                                "runtime journal end append failed"
                            );
                        }
                        break;
                    }
                }
            }
        });
        Self {
            tx: Some(tx),
            reconciliation,
            budget_continuity,
            open_intents,
            last_mutation_seq,
            last_verification_seq,
        }
    }

    /// Fire-and-forget event emission. Never blocks, never fails loud:
    /// a dropped writer just discards.
    pub(crate) fn emit(&self, kind: EventKind, payload: serde_json::Value) {
        if let Some(tx) = &self.tx {
            let _ = tx.send(RuntimeJournalMsg::Append { kind, payload });
        }
    }

    /// Request a clean `session.ended` commit and writer shutdown. Safe
    /// to call multiple times; a dropped handle without `end` means an
    /// unclean stop (crash), which the journal represents by the absence
    /// of the terminal event.
    pub(crate) fn end(&self) {
        if let Some(tx) = &self.tx {
            let _ = tx.send(RuntimeJournalMsg::End);
        }
    }
}

/// `ChatPersistence` decorator that journals the facts visible at the
/// persistence seam, then delegates every operation to the wrapped impl.
///
/// Emitted kinds (shared vocabulary with
/// `nofy_chat_state::JournalingPersistence`):
/// - every persisted item → `history.message_appended` with content-free
///   structural metadata (role, synthetic reason, tool-call count) —
///   never message content, never credentials;
/// - full rewrites → `history.replaced` (the reason — compaction,
///   rewind, repair, pruning — is not knowable here; the compaction
///   caller additionally emits `context.compaction_*` with details);
/// - `end_session` → clean `session.ended` commit via the writer task.
///
/// Tool outcomes and turn boundaries are deliberately NOT emitted here:
/// this layer cannot distinguish tool success from failure, nor user
/// prompts from synthetic injections. Those events come from `tool_calls`
/// and `turn` layers with full semantics.
///
/// Only ONE decorator may own a given journal file (seqs are assigned by
/// the writer); the production wiring uses this async decorator, while
/// `nofy_chat_state::JournalingPersistence` remains available as the
/// synchronous variant for harnesses/tests.
pub(crate) struct JournalingChatPersistence<P> {
    inner: P,
    journal: RuntimeJournalHandle,
}

impl<P> JournalingChatPersistence<P> {
    pub(crate) fn new(inner: P, journal: RuntimeJournalHandle) -> Self {
        Self { inner, journal }
    }
}

/// Content-free structural metadata for a persisted conversation item —
/// mirrors `nofy_chat_state::journaling::message_payload` so both
/// decorators produce interchangeable events.
fn message_payload(item: &ConversationItem, cwd_switch: bool) -> serde_json::Value {
    let mut payload = serde_json::Map::new();
    let role = match item {
        ConversationItem::System(_) => "system",
        ConversationItem::User(user) => {
            if let Some(reason) = &user.synthetic_reason {
                if let Ok(value) = serde_json::to_value(reason) {
                    payload.insert("synthetic_reason".to_string(), value);
                }
            }
            "user"
        }
        ConversationItem::Assistant(assistant) => {
            if !assistant.tool_calls.is_empty() {
                payload.insert(
                    "tool_calls".to_string(),
                    serde_json::Value::from(assistant.tool_calls.len()),
                );
            }
            "assistant"
        }
        ConversationItem::ToolResult(_) => "tool_result",
        ConversationItem::BackendToolCall(_) => "backend_tool_call",
        ConversationItem::Reasoning(_) => "reasoning",
    };
    payload.insert("role".to_string(), serde_json::Value::from(role));
    if cwd_switch {
        payload.insert("cwd_switch".to_string(), serde_json::Value::from(true));
    }
    serde_json::Value::Object(payload)
}

impl<P: ChatPersistence> ChatPersistence for JournalingChatPersistence<P> {
    fn persist_message(&mut self, item: &ConversationItem) {
        self.inner.persist_message(item);
        self.journal
            .emit(EventKind::HistoryMessageAppended, message_payload(item, false));
    }

    fn persist_working_directory_switch_and_ack(
        &mut self,
        item: &ConversationItem,
    ) -> oneshot::Receiver<Result<StrictAppendAck, StrictAppendError>> {
        let receiver = self.inner.persist_working_directory_switch_and_ack(item);
        self.journal
            .emit(EventKind::HistoryMessageAppended, message_payload(item, true));
        receiver
    }

    fn replace_history(&mut self, items: &[ConversationItem]) {
        self.journal.emit(
            EventKind::HistoryReplaced,
            serde_json::json!({ "items_len": items.len() }),
        );
        self.inner.replace_history(items);
    }

    fn flush(&mut self) {
        self.inner.flush();
    }

    fn end_session(&mut self) {
        // Clean terminal commit (`session.ended`) + writer shutdown.
        // Its absence on disk means an unclean stop (crash).
        self.journal.end();
        self.inner.end_session();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use nofy_chat_state::PersistenceRecord;

    /// A `ChatPersistence` that records calls for assertions.
    #[derive(Default)]
    struct RecordingPersistence {
        records: std::sync::Arc<std::sync::Mutex<Vec<PersistenceRecord>>>,
    }

    impl ChatPersistence for RecordingPersistence {
        fn persist_message(&mut self, item: &ConversationItem) {
            self.records
                .lock()
                .unwrap()
                .push(PersistenceRecord::Message(item.clone()));
        }

        fn persist_working_directory_switch_and_ack(
            &mut self,
            item: &ConversationItem,
        ) -> oneshot::Receiver<Result<StrictAppendAck, StrictAppendError>> {
            self.records
                .lock()
                .unwrap()
                .push(PersistenceRecord::AcknowledgedMessage(item.clone()));
            let (reply, receiver) = oneshot::channel();
            let _ = reply.send(Ok(StrictAppendAck::Appended));
            receiver
        }

        fn replace_history(&mut self, items: &[ConversationItem]) {
            self.records
                .lock()
                .unwrap()
                .push(PersistenceRecord::ReplaceHistory(items.to_vec()));
        }

        fn flush(&mut self) {
            self.records.lock().unwrap().push(PersistenceRecord::Flush);
        }
    }

    /// Wait until the journal file holds at least `count` events (writer
    /// task is async) or fail the test.
    async fn wait_for_events(path: &Path, count: usize) {
        for _ in 0..200 {
            if let Ok(journal) = SessionJournal::load(path.to_path_buf()) {
                if journal.len() >= count {
                    return;
                }
            }
            tokio::time::sleep(std::time::Duration::from_millis(10)).await;
        }
        panic!("journal did not reach {count} events in time");
    }

    #[tokio::test]
    async fn spawn_writes_session_started_and_decorator_journals_facts() {
        let dir = tempfile::tempdir().unwrap();
        let handle = RuntimeJournalHandle::spawn(dir.path(), "sess-1".to_string());
        assert!(handle.is_active());

        let records = std::sync::Arc::new(std::sync::Mutex::new(Vec::new()));
        let mut persistence = JournalingChatPersistence::new(
            RecordingPersistence {
                records: records.clone(),
            },
            handle.clone(),
        );

        // Assistant response → model.responded, delegated to inner.
        let assistant = ConversationItem::assistant("done");
        persistence.persist_message(&assistant);
        // Synthetic reminder user item → reminder.injected.
        let reminder = ConversationItem::system_reminder("note");
        persistence.persist_message(&reminder);
        // Full rewrite → context.history_replaced.
        persistence.replace_history(&[ConversationItem::system("compacted")]);
        persistence.flush();

        // Inner persistence saw every call, unmodified.
        let records = records.lock().unwrap();
        assert_eq!(records.len(), 4);
        assert!(matches!(&records[0], PersistenceRecord::Message(item) if matches!(item, ConversationItem::Assistant(_))));
        assert!(matches!(&records[2], PersistenceRecord::ReplaceHistory(items) if items.len() == 1));
        assert!(matches!(&records[3], PersistenceRecord::Flush));
        drop(records);

        // The journal file on disk carries the facts (1 open + 3 events).
        let path = dir.path().join(RUNTIME_EVENTS_FILE);
        wait_for_events(&path, 4).await;
        handle.end();
        wait_for_events(&path, 5).await;

        let journal = SessionJournal::load(path).unwrap();
        let kinds: Vec<EventKind> = journal.events().iter().map(|e| e.kind).collect();
        assert_eq!(
            kinds,
            vec![
                EventKind::SessionStarted,
                EventKind::HistoryMessageAppended,
                EventKind::HistoryMessageAppended,
                EventKind::HistoryReplaced,
                EventKind::SessionEnded,
            ]
        );
        // Every event belongs to the same session.
        assert!(journal
            .events()
            .iter()
            .all(|event| event.session_id == "sess-1"));
        // Payloads are structural: role metadata, never message content.
        let appended: Vec<_> = journal
            .events()
            .iter()
            .filter(|event| event.kind == EventKind::HistoryMessageAppended)
            .collect();
        assert_eq!(
            appended[0].payload.get("role").and_then(|v| v.as_str()),
            Some("assistant")
        );
        assert_eq!(
            appended[1].payload.get("role").and_then(|v| v.as_str()),
            Some("user")
        );
        assert_eq!(
            appended[1]
                .payload
                .get("synthetic_reason")
                .and_then(|v| v.as_str()),
            Some("system_reminder")
        );
        let serialized = serde_json::to_string(journal.events()).unwrap();
        assert!(!serialized.contains("done"), "content must not leak");
        assert!(!serialized.contains("note"), "content must not leak");
        // Projection agrees: two appends, one replacement, terminated.
        let snapshot = nofy_session_journal::project(journal.events());
        assert_eq!(snapshot.history_appends, 2);
        assert_eq!(snapshot.history_replaces, 1);
        assert_eq!(snapshot.lifecycle, nofy_session_journal::Lifecycle::Ended);
    }

    #[tokio::test]
    async fn reopen_after_clean_end_resumes_segment() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join(RUNTIME_EVENTS_FILE);

        let handle = RuntimeJournalHandle::spawn(dir.path(), "sess-2".to_string());
        handle.emit(EventKind::TurnStarted, serde_json::Value::Null);
        wait_for_events(&path, 2).await;
        handle.end();
        wait_for_events(&path, 3).await;

        // Reopen: existing journal → session.resumed + reconciliation event,
        // gate reopened.
        let reopened = RuntimeJournalHandle::spawn(dir.path(), "sess-2".to_string());
        assert!(reopened.is_active());
        // Clean first segment left no open intents: report exists but is clean.
        let report = reopened.reconciliation_report().expect("resume report");
        assert_eq!(report.open_total, 0);
        assert!(!report.needs_attention());
        reopened.emit(EventKind::TurnStarted, serde_json::Value::Null);
        wait_for_events(&path, 6).await;

        let journal = SessionJournal::load(path).unwrap();
        let kinds: Vec<EventKind> = journal.events().iter().map(|e| e.kind).collect();
        assert_eq!(
            kinds,
            vec![
                EventKind::SessionStarted,
                EventKind::TurnStarted,
                EventKind::SessionEnded,
                EventKind::SessionResumed,
                EventKind::ReconciliationCompleted,
                EventKind::TurnStarted,
            ]
        );
    }

    #[tokio::test]
    async fn reopen_with_open_intent_flags_reconciliation() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join(RUNTIME_EVENTS_FILE);

        // Segment 1: invoke a side-effecting tool, then crash (no end()).
        let handle = RuntimeJournalHandle::spawn(dir.path(), "sess-crash".to_string());
        handle.emit(
            EventKind::ToolInvoked,
            serde_json::json!({"intent_id": "i1", "tool": "bash"}),
        );
        wait_for_events(&path, 2).await;
        drop(handle); // unclean stop: no session.ended committed

        // Reopen: reconciliation must flag the open bash intent.
        let reopened = RuntimeJournalHandle::spawn(dir.path(), "sess-crash".to_string());
        assert!(reopened.is_active());
        let report = reopened.reconciliation_report().expect("resume report");
        assert_eq!(report.open_total, 1);
        assert_eq!(report.possibly_running, 1);
        assert!(report.needs_attention());
        assert!(
            report.summary_line().contains("bash(possibly still running)"),
            "summary: {}",
            report.summary_line()
        );
        reopened.end();
        // reconciliation.completed was committed on reopen (event index 3);
        // end() adds session.ended as the fifth event.
        wait_for_events(&path, 5).await;
        let journal = SessionJournal::load(path).unwrap();
        assert_eq!(
            journal.events()[3].kind,
            EventKind::ReconciliationCompleted
        );
    }

    #[tokio::test]
    async fn reopen_restores_budget_continuity_from_journal() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join(RUNTIME_EVENTS_FILE);

        // Segment 1: the governor grants an extension. The payload counter
        // is pre-decision (1), so 2 extensions are spent after it.
        let handle = RuntimeJournalHandle::spawn(dir.path(), "sess-budget".to_string());
        handle.emit(
            EventKind::BudgetUpdated,
            serde_json::json!({
                "decision": "extend",
                "base_limit": 40u64,
                "extensions_used": 1u64,
            }),
        );
        wait_for_events(&path, 2).await;
        handle.end();
        wait_for_events(&path, 3).await;

        // Reopen: continuity restored (extend → +1) and re-journaled.
        let reopened = RuntimeJournalHandle::spawn(dir.path(), "sess-budget".to_string());
        let continuity = reopened.budget_continuity().expect("budget continuity");
        assert_eq!(continuity.base_limit, Some(40));
        assert_eq!(continuity.extensions_used, 2);
        reopened.end();
        // session.resumed + reconciliation.completed + restored budget
        // event + session.ended on top of the first segment's three.
        wait_for_events(&path, 7).await;
        let journal = SessionJournal::load(path.clone()).unwrap();
        let restored_event = journal
            .events()
            .iter()
            .rev()
            .find(|e| e.kind == EventKind::BudgetUpdated)
            .expect("restored budget event");
        assert_eq!(restored_event.payload["decision"], "restored");
        assert_eq!(restored_event.payload["extensions_used"], 2);

        // Reopen again: restoring from the restored event is idempotent —
        // resume can never re-earn the spent extensions.
        let second = RuntimeJournalHandle::spawn(dir.path(), "sess-budget".to_string());
        let continuity = second.budget_continuity().expect("budget continuity");
        assert_eq!(continuity.extensions_used, 2);
        assert_eq!(continuity.base_limit, Some(40));
    }

    #[tokio::test]
    async fn fresh_journal_has_no_budget_continuity() {
        let dir = tempfile::tempdir().unwrap();
        let handle = RuntimeJournalHandle::spawn(dir.path(), "sess-fresh".to_string());
        assert!(
            handle.budget_continuity().is_none(),
            "a fresh journal has no budget history to restore"
        );
    }

    #[tokio::test]
    async fn verification_watermarks_track_mutation_and_success() {
        use nofy_session_journal::VerificationState;
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join(RUNTIME_EVENTS_FILE);
        let handle = RuntimeJournalHandle::spawn(dir.path(), "sess-d1".to_string());
        assert_eq!(
            handle.verification_state(),
            Some(VerificationState::NoMutations)
        );

        // A file edit opens the question.
        handle.emit(
            EventKind::ToolInvoked,
            serde_json::json!({"intent_id": "m1", "tool": "search_replace"}),
        );
        wait_for_events(&path, 2).await;
        assert_eq!(
            handle.verification_state(),
            Some(VerificationState::Unverified {
                last_mutation_seq: 1
            })
        );

        // A successful bash run after the edit answers it.
        handle.emit(
            EventKind::ToolInvoked,
            serde_json::json!({"intent_id": "v1", "tool": "bash"}),
        );
        handle.emit(
            EventKind::ToolSucceeded,
            serde_json::json!({"intent_id": "v1", "tool": "bash"}),
        );
        wait_for_events(&path, 4).await;
        assert_eq!(
            handle.verification_state(),
            Some(VerificationState::Verified {
                last_mutation_seq: 1,
                verification_seq: 3
            })
        );

        // A new edit reopens the question; a FAILED run does not answer.
        handle.emit(
            EventKind::ToolInvoked,
            serde_json::json!({"intent_id": "m2", "tool": "search_replace"}),
        );
        handle.emit(
            EventKind::ToolInvoked,
            serde_json::json!({"intent_id": "v2", "tool": "bash"}),
        );
        handle.emit(
            EventKind::ToolFailed,
            serde_json::json!({"intent_id": "v2", "tool": "bash"}),
        );
        wait_for_events(&path, 7).await;
        assert_eq!(
            handle.verification_state(),
            Some(VerificationState::Unverified {
                last_mutation_seq: 4
            })
        );
    }

    #[tokio::test]
    async fn reopen_seeds_verification_watermarks_from_history() {
        use nofy_session_journal::VerificationState;
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join(RUNTIME_EVENTS_FILE);

        // Segment 1: an edit with no verification, then clean end.
        let handle = RuntimeJournalHandle::spawn(dir.path(), "sess-d1r".to_string());
        handle.emit(
            EventKind::ToolInvoked,
            serde_json::json!({"intent_id": "m1", "tool": "search_replace"}),
        );
        wait_for_events(&path, 2).await;
        handle.end();
        wait_for_events(&path, 3).await;

        // Reopen: the unverified change stays unverified across resume.
        let reopened = RuntimeJournalHandle::spawn(dir.path(), "sess-d1r".to_string());
        assert_eq!(
            reopened.verification_state(),
            Some(VerificationState::Unverified {
                last_mutation_seq: 1
            })
        );
    }

    #[tokio::test]
    async fn noop_handle_discards_and_reports_inactive() {
        let handle = RuntimeJournalHandle::noop();
        assert!(!handle.is_active());
        assert_eq!(
            handle.open_intent_count(),
            None,
            "noop handle must report no observation, not zero"
        );
        handle.emit(EventKind::TurnStarted, serde_json::Value::Null);
        handle.end();
        // Nothing to assert beyond not panicking: noop is total.
    }

    #[tokio::test]
    async fn open_intent_counter_tracks_invocations_and_outcomes() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join(RUNTIME_EVENTS_FILE);
        let handle = RuntimeJournalHandle::spawn(dir.path(), "sess-intents".to_string());
        assert_eq!(handle.open_intent_count(), Some(0));

        handle.emit(
            EventKind::ToolInvoked,
            serde_json::json!({"intent_id": "a", "tool": "bash"}),
        );
        handle.emit(
            EventKind::ToolInvoked,
            serde_json::json!({"intent_id": "b", "tool": "read_file"}),
        );
        wait_for_events(&path, 3).await;
        assert_eq!(handle.open_intent_count(), Some(2));

        handle.emit(
            EventKind::ToolSucceeded,
            serde_json::json!({"intent_id": "a"}),
        );
        wait_for_events(&path, 4).await;
        assert_eq!(handle.open_intent_count(), Some(1));

        // Orphan outcomes must not push the counter below zero.
        handle.emit(
            EventKind::ToolFailed,
            serde_json::json!({"intent_id": "b"}),
        );
        handle.emit(
            EventKind::ToolFailed,
            serde_json::json!({"intent_id": "never-invoked"}),
        );
        wait_for_events(&path, 6).await;
        assert_eq!(handle.open_intent_count(), Some(0));
    }

    #[tokio::test]
    async fn corrupt_existing_journal_degrades_to_noop() {
        let dir = tempfile::tempdir().unwrap();
        // Mid-file corruption is a hard load error by journal contract.
        std::fs::write(
            dir.path().join(RUNTIME_EVENTS_FILE),
            "not json\nstill not json\n",
        )
        .unwrap();
        let handle = RuntimeJournalHandle::spawn(dir.path(), "sess-3".to_string());
        assert!(!handle.is_active(), "corrupt journal must degrade to noop");
    }

    #[test]
    fn env_gate_parses_truthy_values() {
        // Pure parse check mirroring is_enabled's predicate.
        let truthy = |value: &str| value == "1" || value.eq_ignore_ascii_case("true");
        assert!(truthy("1"));
        assert!(truthy("true"));
        assert!(truthy("TRUE"));
        assert!(!truthy("0"));
        assert!(!truthy(""));
        assert!(!truthy("yes"));
    }
}
