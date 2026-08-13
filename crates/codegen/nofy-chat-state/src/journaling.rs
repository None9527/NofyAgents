//! Flag-gated journaling decorator for [`ChatPersistence`].
//!
//! Wraps any persistence implementation and mirrors its operations into a
//! per-session runtime event journal (`nofy-session-journal`). The journal
//! is strictly observational:
//!
//! - the inner persistence is always called first, unchanged;
//! - a journal failure (open or append) degrades to pass-through with a
//!   warning — it never breaks the session;
//! - payloads carry structural metadata only (role, synthetic reason,
//!   counts) — never message content, never credentials.
//!
//! When constructed via [`JournalingPersistence::disabled`] the decorator
//! performs no file I/O at all and is observationally identical to the
//! inner implementation.

use std::path::PathBuf;

use tokio::sync::oneshot;
use nofy_sampling_types::ConversationItem;
use nofy_session_journal::{EventKind, SessionJournal};

use crate::commands::{StrictAppendAck, StrictAppendError};
use crate::persistence::ChatPersistence;

/// Decorator that mirrors [`ChatPersistence`] operations into a runtime
/// event journal.
pub struct JournalingPersistence<P> {
    inner: P,
    /// `None` when disabled or after an unrecoverable journal failure —
    /// the decorator then behaves exactly like `inner`.
    journal: Option<SessionJournal>,
    session_id: String,
}

impl<P: ChatPersistence> JournalingPersistence<P> {
    /// Pass-through decorator: no journal file, no I/O beyond `inner`.
    pub fn disabled(inner: P) -> Self {
        Self {
            inner,
            journal: None,
            session_id: String::new(),
        }
    }

    /// Journaling decorator: opens (or creates) the journal at
    /// `journal_path`, commits `session.started` (fresh journal) or
    /// `session.resumed` (existing journal), then mirrors persistence
    /// operations.
    ///
    /// Any open/commit failure degrades to [`Self::disabled`] with a
    /// warning — session durability never depends on the journal.
    pub fn enabled(inner: P, session_id: String, journal_path: PathBuf) -> Self {
        let mut journal = match SessionJournal::load(journal_path) {
            Ok(journal) => journal,
            Err(error) => {
                tracing::warn!(%error, "session journal load failed; disabling journaling");
                return Self::disabled(inner);
            }
        };
        let boundary = if journal.is_empty() {
            EventKind::SessionStarted
        } else {
            EventKind::SessionResumed
        };
        if let Err(error) = journal.append(boundary, session_id.clone(), serde_json::Value::Null) {
            tracing::warn!(%error, "session journal start event failed; disabling journaling");
            return Self::disabled(inner);
        }
        Self {
            inner,
            journal: Some(journal),
            session_id,
        }
    }

    /// Whether this decorator is actively journaling.
    pub fn is_journal_enabled(&self) -> bool {
        self.journal.is_some()
    }

    /// Append an event, degrading to pass-through on failure (a
    /// persistent error such as a terminated or full journal would
    /// otherwise spam warnings on every operation).
    fn record(&mut self, kind: EventKind, payload: serde_json::Value) {
        let Some(journal) = &mut self.journal else {
            return;
        };
        if let Err(error) = journal.append(kind, self.session_id.clone(), payload) {
            tracing::warn!(%error, %kind, "session journal append failed; disabling journaling");
            self.journal = None;
        }
    }
}

impl<P: ChatPersistence> ChatPersistence for JournalingPersistence<P> {
    fn persist_message(&mut self, item: &ConversationItem) {
        self.inner.persist_message(item);
        self.record(
            EventKind::HistoryMessageAppended,
            message_payload(item, false),
        );
    }

    fn persist_working_directory_switch_and_ack(
        &mut self,
        item: &ConversationItem,
    ) -> oneshot::Receiver<Result<StrictAppendAck, StrictAppendError>> {
        let receiver = self.inner.persist_working_directory_switch_and_ack(item);
        self.record(
            EventKind::HistoryMessageAppended,
            message_payload(item, true),
        );
        receiver
    }

    fn replace_history(&mut self, items: &[ConversationItem]) {
        self.inner.replace_history(items);
        self.record(
            EventKind::HistoryReplaced,
            serde_json::json!({ "items_len": items.len() }),
        );
    }

    fn flush(&mut self) {
        // A flush is a durability barrier, not a fact — the journal's own
        // appends are already durable, so nothing to record.
        self.inner.flush();
    }

    fn end_session(&mut self) {
        self.record(EventKind::SessionEnded, serde_json::Value::Null);
    }
}

/// Structural metadata for an appended conversation item. Deliberately
/// content-free: role, synthetic origin, and counts only.
fn message_payload(item: &ConversationItem, cwd_switch: bool) -> serde_json::Value {
    let mut payload = serde_json::Map::new();
    let role = match item {
        ConversationItem::System(_) => "system",
        ConversationItem::User(user) => {
            if let Some(reason) = &user.synthetic_reason
                && let Ok(value) = serde_json::to_value(reason)
            {
                payload.insert("synthetic_reason".to_string(), value);
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::persistence::{MockChatPersistence, PersistenceRecord};
    use std::io::Write as _;
    use nofy_session_journal::project;

    fn temp_journal_path(dir: &tempfile::TempDir) -> PathBuf {
        dir.path().join("runtime_events.jsonl")
    }

    #[test]
    fn enabled_records_events_to_real_file() {
        let dir = tempfile::tempdir().unwrap();
        let path = temp_journal_path(&dir);
        let (mock, mut receiver) = MockChatPersistence::new();
        let mut persistence = JournalingPersistence::enabled(mock, "s1".into(), path.clone());
        assert!(persistence.is_journal_enabled());

        persistence.persist_message(&ConversationItem::user("hello"));
        persistence.persist_message(&ConversationItem::assistant("world"));
        persistence.replace_history(&[ConversationItem::system("compact")]);
        persistence.flush();
        persistence.end_session();

        // Inner persistence got everything, unchanged.
        let records = receiver.drain();
        assert_eq!(records.len(), 4);
        assert!(matches!(&records[0], PersistenceRecord::Message(_)));
        assert!(matches!(&records[2], PersistenceRecord::ReplaceHistory(_)));
        assert!(matches!(&records[3], PersistenceRecord::Flush));

        // The journal file is real, loads with the shipped reader, and
        // carries the expected dense event sequence.
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
        for (idx, event) in journal.events().iter().enumerate() {
            assert_eq!(event.seq, idx as u64, "seqs must be dense");
            assert_eq!(event.session_id, "s1");
        }

        // The shipped reducer agrees.
        let snapshot = project(journal.events());
        assert_eq!(snapshot.history_appends, 2);
        assert_eq!(snapshot.history_replaces, 1);
        assert_eq!(
            snapshot.lifecycle,
            nofy_session_journal::Lifecycle::Ended
        );
    }

    #[test]
    fn message_payloads_carry_structural_metadata_only() {
        let dir = tempfile::tempdir().unwrap();
        let (mock, _receiver) = MockChatPersistence::new();
        let mut persistence =
            JournalingPersistence::enabled(mock, "s1".into(), temp_journal_path(&dir));

        persistence.persist_message(&ConversationItem::system_reminder("secret-ish content"));
        persistence.persist_message(&ConversationItem::assistant("body"));

        let journal = SessionJournal::load(temp_journal_path(&dir)).unwrap();
        let appended: Vec<_> = journal
            .events()
            .iter()
            .filter(|e| e.kind == EventKind::HistoryMessageAppended)
            .collect();
        assert_eq!(appended.len(), 2);
        let user_payload = &appended[0].payload;
        assert_eq!(user_payload.get("role").and_then(|v| v.as_str()), Some("user"));
        assert_eq!(
            user_payload.get("synthetic_reason").and_then(|v| v.as_str()),
            Some("system_reminder")
        );
        // Content must never leak into the journal.
        let serialized = serde_json::to_string(&journal.events()).unwrap();
        assert!(!serialized.contains("secret-ish content"));
        assert!(!serialized.contains("body"));
    }

    #[test]
    fn disabled_creates_no_file_and_passes_through() {
        let dir = tempfile::tempdir().unwrap();
        let (mock, mut receiver) = MockChatPersistence::new();
        let mut persistence = JournalingPersistence::disabled(mock);
        assert!(!persistence.is_journal_enabled());

        persistence.persist_message(&ConversationItem::user("a"));
        persistence.persist_message(&ConversationItem::assistant("b"));
        persistence.replace_history(&[ConversationItem::system("c")]);
        persistence.flush();
        persistence.end_session();

        let records = receiver.drain();
        assert_eq!(records.len(), 4);
        assert!(matches!(&records[0], PersistenceRecord::Message(_)));
        assert!(matches!(&records[1], PersistenceRecord::Message(_)));
        assert!(matches!(&records[2], PersistenceRecord::ReplaceHistory(_)));
        assert!(matches!(&records[3], PersistenceRecord::Flush));

        // No journal file (or any file) appeared.
        assert_eq!(
            std::fs::read_dir(dir.path()).unwrap().count(),
            0,
            "disabled decorator must not create files"
        );
    }

    #[test]
    fn resume_appends_session_resumed() {
        let dir = tempfile::tempdir().unwrap();
        let path = temp_journal_path(&dir);
        let (mock, _receiver) = MockChatPersistence::new();
        let mut first = JournalingPersistence::enabled(mock, "s1".into(), path.clone());
        first.persist_message(&ConversationItem::user("a"));
        first.end_session();
        drop(first);

        let (mock2, _receiver2) = MockChatPersistence::new();
        let mut second = JournalingPersistence::enabled(mock2, "s1".into(), path.clone());
        second.persist_message(&ConversationItem::user("b"));
        drop(second);

        let journal = SessionJournal::load(path).unwrap();
        let kinds: Vec<EventKind> = journal.events().iter().map(|e| e.kind).collect();
        assert_eq!(
            kinds,
            vec![
                EventKind::SessionStarted,
                EventKind::HistoryMessageAppended,
                EventKind::SessionEnded,
                EventKind::SessionResumed,
                EventKind::HistoryMessageAppended,
            ]
        );
        assert_eq!(
            project(journal.events()).lifecycle,
            nofy_session_journal::Lifecycle::Running
        );
    }

    #[test]
    fn torn_tail_is_recovered_on_reopen() {
        let dir = tempfile::tempdir().unwrap();
        let path = temp_journal_path(&dir);
        let (mock, _receiver) = MockChatPersistence::new();
        let mut persistence = JournalingPersistence::enabled(mock, "s1".into(), path.clone());
        persistence.persist_message(&ConversationItem::user("a"));
        drop(persistence);

        // Crash signature: a partially written line appended to the file.
        std::fs::OpenOptions::new()
            .append(true)
            .open(&path)
            .unwrap()
            .write_all(b"{\"seq\":2,\"kind\":\"history.mess")
            .unwrap();

        // Reopening heals the torn tail and resumes on the valid prefix.
        let (mock2, _receiver2) = MockChatPersistence::new();
        let reopened = JournalingPersistence::enabled(mock2, "s1".into(), path.clone());
        assert!(reopened.is_journal_enabled());
        drop(reopened);

        let journal = SessionJournal::load(path).unwrap();
        let kinds: Vec<EventKind> = journal.events().iter().map(|e| e.kind).collect();
        assert_eq!(
            kinds,
            vec![
                EventKind::SessionStarted,
                EventKind::HistoryMessageAppended,
                EventKind::SessionResumed,
            ]
        );
    }

    #[test]
    fn terminal_gate_blocks_further_events_after_end() {
        let dir = tempfile::tempdir().unwrap();
        let path = temp_journal_path(&dir);
        let (mock, _receiver) = MockChatPersistence::new();
        let mut persistence = JournalingPersistence::enabled(mock, "s1".into(), path.clone());
        persistence.end_session();
        // The terminal gate rejects the append; the decorator degrades to
        // pass-through rather than erroring.
        persistence.persist_message(&ConversationItem::user("late"));
        assert!(!persistence.is_journal_enabled());

        let journal = SessionJournal::load(path).unwrap();
        assert_eq!(journal.len(), 2); // started + ended only
    }
}
