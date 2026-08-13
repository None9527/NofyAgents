//! Append-only session runtime journal (JSONL on disk).
//!
//! The journal is the runtime's fact-commitment boundary. Design follows
//! the proven `nofy-workflow` journal pattern — dense sequences, torn-tail
//! truncation on load, byte caps, `sync_data` after every append — with
//! session-specific additions:
//!
//! - a **closed event vocabulary** ([`EventKind`]);
//! - a **terminal gate**: no execution event after `session.ended` until
//!   `session.resumed` reopens the segment;
//! - a **single-session invariant**: all events carry the same
//!   `session_id`;
//! - **payload versioning** is the producer's contract (additive fields
//!   only); the journal stores payloads opaquely.
//!
//! Seqs are dense and zero-based, matching the workflow journal, so
//! `events.len() - 1 == last seq` always holds.

use std::io::{Read as _, Write as _};
use std::path::{Path, PathBuf};

use crate::event::{Event, EventKind, now_ms};

/// Byte cap for one session journal. Sessions are long-lived but the
/// journal records governance facts, not payloads: tool output bodies
/// belong in the conversation history, not here. Restore refuses files
/// beyond this size rather than loading a corrupt/giant file.
pub const MAX_JOURNAL_BYTES: u64 = 256 * 1024 * 1024;

/// Errors from journal load/append.
#[derive(Debug, thiserror::Error)]
pub enum JournalError {
    #[error("journal io: {0}")]
    Io(#[from] std::io::Error),
    #[error("journal parse at line {line}: {error}")]
    Parse { line: usize, error: String },
    #[error("journal restore rejected (limit {limit}): {reason}")]
    UnsafeRestore { limit: u64, reason: String },
    #[error("journal is not dense at entry {index}: expected sequence {expected}, found {actual}")]
    Sequence {
        index: usize,
        expected: u64,
        actual: u64,
    },
    #[error(
        "journal session mismatch at seq {seq}: journal belongs to session {expected}, \
         event carries {actual}"
    )]
    SessionMismatch {
        seq: u64,
        expected: String,
        actual: String,
    },
    #[error("journal is terminated at seq {seq}: {kind} cannot follow session.ended")]
    Terminated { seq: u64, kind: EventKind },
    #[error(
        "journal full: appending seq {seq} would exceed the {limit}-byte cap \
         that restore enforces, which would strand the session unresumable"
    )]
    Full { seq: u64, limit: u64 },
}

/// An append-only session event journal.
///
/// In-memory events mirror the file exactly; every successful append is
/// durable (line written + `sync_data`) before it becomes visible.
#[derive(Debug, Default)]
pub struct SessionJournal {
    events: Vec<Event>,
    path: Option<PathBuf>,
    bytes: u64,
    /// `session.ended` committed and not yet reopened by
    /// `session.resumed`.
    terminated: bool,
}

impl SessionJournal {
    /// A fresh journal, optionally file-backed. Without a path the
    /// journal is memory-only (tests, dry runs).
    pub fn new(path: Option<PathBuf>) -> Self {
        Self {
            events: Vec::new(),
            path,
            bytes: 0,
            terminated: false,
        }
    }

    /// Load a journal from disk.
    ///
    /// A missing file yields an empty journal (first run). A torn tail —
    /// the crash signature: an unterminated or partially written final
    /// line — is truncated away with a warning; the valid prefix is kept.
    /// Any corruption *before* the last line is a hard error: mid-file
    /// damage means the truth record is unreliable, and silently loading
    /// a prefix would hide lost events.
    pub fn load(path: PathBuf) -> Result<Self, JournalError> {
        let content = match read_bounded(&path) {
            Ok(content) => content,
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
                return Ok(Self::new(Some(path)));
            }
            Err(error) if error.kind() == std::io::ErrorKind::InvalidData => {
                return Err(JournalError::UnsafeRestore {
                    limit: MAX_JOURNAL_BYTES,
                    reason: error.to_string(),
                });
            }
            Err(error) => return Err(error.into()),
        };

        let mut journal = Self::new(Some(path.clone()));
        let mut offset = 0usize;
        let mut line_number = 0usize;
        while offset < content.len() {
            line_number += 1;
            let relative_newline = content[offset..].iter().position(|byte| *byte == b'\n');
            let (line, is_tail) = match relative_newline {
                Some(relative) => (&content[offset..offset + relative], false),
                None => (&content[offset..], true),
            };
            let line_start = offset;
            offset += line.len() + if is_tail { 0 } else { 1 };
            if line.iter().all(u8::is_ascii_whitespace) {
                // Blank tail (or a torn write that left only a newline
                // behind) ends the valid journal.
                if is_tail {
                    truncate_tail(&path, line_start as u64)?;
                    journal.bytes = line_start as u64;
                    break;
                }
                continue;
            }
            match serde_json::from_slice::<Event>(line) {
                Ok(event) => {
                    validate_committed(&journal.events, &event)?;
                    journal.terminated = (journal.terminated
                        && !matches!(event.kind, EventKind::SessionResumed))
                        || event.kind.is_terminal();
                    journal.events.push(event);
                    if is_tail {
                        // Torn tail that parsed anyway (no trailing
                        // newline): re-terminate it on disk.
                        terminate_line(&path)?;
                    }
                    journal.bytes = (line_start + line.len() + 1) as u64;
                    if is_tail {
                        break;
                    }
                }
                Err(error) if is_tail => {
                    tracing::warn!(
                        line = line_number,
                        %error,
                        "truncating torn session journal tail"
                    );
                    truncate_tail(&path, line_start as u64)?;
                    journal.bytes = line_start as u64;
                    break;
                }
                Err(error) => {
                    return Err(JournalError::Parse {
                        line: line_number,
                        error: error.to_string(),
                    });
                }
            }
        }
        Ok(journal)
    }

    /// Append an event, assigning the next dense seq and the current
    /// timestamp. The event is durable on disk before this returns.
    ///
    /// Enforced invariants:
    /// - terminal gate: execution events are rejected after
    ///   `session.ended` until `session.resumed`;
    /// - single session: `session_id` must match the journal's first
    ///   event;
    /// - byte cap: an append that would exceed [`MAX_JOURNAL_BYTES`]
    ///   fails loudly instead of stranding restore.
    pub fn append(
        &mut self,
        kind: EventKind,
        session_id: String,
        payload: serde_json::Value,
    ) -> Result<&Event, JournalError> {
        let seq = self.events.len() as u64;
        if self.terminated && kind.is_execution() {
            return Err(JournalError::Terminated { seq, kind });
        }
        if let Some(first) = self.events.first()
            && first.session_id != session_id
        {
            return Err(JournalError::SessionMismatch {
                seq,
                expected: first.session_id.clone(),
                actual: session_id,
            });
        }
        let event = Event {
            seq,
            kind,
            session_id,
            at_ms: now_ms(),
            payload,
        };
        let mut line = serde_json::to_string(&event)
            .map_err(|error| JournalError::Io(std::io::Error::other(error)))?;
        line.push('\n');
        if self.bytes.saturating_add(line.len() as u64) > MAX_JOURNAL_BYTES {
            return Err(JournalError::Full {
                seq,
                limit: MAX_JOURNAL_BYTES,
            });
        }
        if let Some(path) = &self.path {
            append_line(path, &line)?;
        }
        self.bytes = self.bytes.saturating_add(line.len() as u64);
        self.terminated = match kind {
            EventKind::SessionEnded => true,
            EventKind::SessionResumed => false,
            _ => self.terminated,
        };
        self.events.push(event);
        Ok(self.events.last().expect("just pushed"))
    }

    /// All committed events, in seq order.
    pub fn events(&self) -> &[Event] {
        &self.events
    }

    pub fn len(&self) -> usize {
        self.events.len()
    }

    pub fn is_empty(&self) -> bool {
        self.events.is_empty()
    }

    /// Seq of the most recent event, if any.
    pub fn last_seq(&self) -> Option<u64> {
        self.events.last().map(|event| event.seq)
    }

    /// Whether the journal is currently terminated (ended and not yet
    /// resumed).
    pub fn is_terminated(&self) -> bool {
        self.terminated
    }

    /// The session id this journal belongs to, once known.
    pub fn session_id(&self) -> Option<&str> {
        self.events.first().map(|event| event.session_id.as_str())
    }
}

/// Seq density + session id agreement for an event about to join
/// `events` (load path; append enforces the same via its own state).
fn validate_committed(events: &[Event], event: &Event) -> Result<(), JournalError> {
    let expected = events.len() as u64;
    if event.seq != expected {
        return Err(JournalError::Sequence {
            index: events.len(),
            expected,
            actual: event.seq,
        });
    }
    if let Some(first) = events.first()
        && first.session_id != event.session_id
    {
        return Err(JournalError::SessionMismatch {
            seq: event.seq,
            expected: first.session_id.clone(),
            actual: event.session_id.clone(),
        });
    }
    Ok(())
}

fn read_bounded(path: &Path) -> std::io::Result<Vec<u8>> {
    let metadata = std::fs::symlink_metadata(path)?;
    if metadata.file_type().is_symlink() || !metadata.is_file() {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            format!("journal is not a regular file: {}", path.display()),
        ));
    }
    if metadata.len() > MAX_JOURNAL_BYTES {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            format!("journal exceeds {MAX_JOURNAL_BYTES} bytes"),
        ));
    }
    let mut options = std::fs::OpenOptions::new();
    options.read(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.custom_flags(libc::O_NOFOLLOW);
    }
    let file = options.open(path)?;
    let opened = file.metadata()?;
    if !opened.is_file() || opened.len() > MAX_JOURNAL_BYTES {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            "journal changed during open",
        ));
    }
    let mut content = Vec::with_capacity(opened.len() as usize);
    std::io::Read::take(file, MAX_JOURNAL_BYTES.saturating_add(1)).read_to_end(&mut content)?;
    if content.len() as u64 > MAX_JOURNAL_BYTES {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            format!("journal exceeds {MAX_JOURNAL_BYTES} bytes"),
        ));
    }
    Ok(content)
}

fn truncate_tail(path: &Path, len: u64) -> std::io::Result<()> {
    let file = std::fs::OpenOptions::new().write(true).open(path)?;
    file.set_len(len)?;
    file.sync_data()
}

fn terminate_line(path: &Path) -> std::io::Result<()> {
    let mut file = std::fs::OpenOptions::new().append(true).open(path)?;
    file.write_all(b"\n")?;
    file.sync_data()
}

fn append_line(path: &Path, line: &str) -> std::io::Result<()> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let mut file = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)?;
    file.write_all(line.as_bytes())?;
    file.sync_data()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::event::EventKind::*;

    fn json(payload: serde_json::Value) -> serde_json::Value {
        payload
    }

    #[test]
    fn append_assigns_dense_seqs_and_round_trips() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("runtime_events.jsonl");
        let mut journal = SessionJournal::new(Some(path.clone()));
        journal
            .append(SessionStarted, "s1".into(), json(serde_json::json!({})))
            .unwrap();
        journal
            .append(TurnStarted, "s1".into(), serde_json::Value::Null)
            .unwrap();
        let event = journal
            .append(
                ToolInvoked,
                "s1".into(),
                json(serde_json::json!({"intent_id": "i1", "tool": "read_file"})),
            )
            .unwrap();
        assert_eq!(event.seq, 2);

        let loaded = SessionJournal::load(path).unwrap();
        assert_eq!(loaded.len(), 3);
        assert_eq!(loaded.last_seq(), Some(2));
        assert_eq!(loaded.session_id(), Some("s1"));
        assert_eq!(loaded.events()[2].intent_id(), Some("i1"));
    }

    #[test]
    fn load_of_missing_file_is_empty_journal() {
        let dir = tempfile::tempdir().unwrap();
        let journal = SessionJournal::load(dir.path().join("absent.jsonl")).unwrap();
        assert!(journal.is_empty());
    }

    #[test]
    fn torn_tail_is_truncated_and_prefix_kept() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("runtime_events.jsonl");
        let mut journal = SessionJournal::new(Some(path.clone()));
        journal
            .append(SessionStarted, "s1".into(), serde_json::Value::Null)
            .unwrap();
        journal
            .append(TurnStarted, "s1".into(), serde_json::Value::Null)
            .unwrap();
        drop(journal);

        // Crash signature: a partially written third line.
        std::fs::OpenOptions::new()
            .append(true)
            .open(&path)
            .unwrap()
            .write_all(b"{\"seq\":2,\"kind\":\"turn.comp")
            .unwrap();

        let loaded = SessionJournal::load(path.clone()).unwrap();
        assert_eq!(loaded.len(), 2, "valid prefix survives");

        // The truncation is persisted: a second load sees the same view.
        let reloaded = SessionJournal::load(path).unwrap();
        assert_eq!(reloaded.len(), 2);
    }

    #[test]
    fn missing_final_newline_is_reterminated() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("runtime_events.jsonl");
        let mut journal = SessionJournal::new(Some(path.clone()));
        journal
            .append(SessionStarted, "s1".into(), serde_json::Value::Null)
            .unwrap();
        drop(journal);
        // Simulate the newline itself being lost.
        let content = std::fs::read_to_string(&path).unwrap();
        std::fs::write(&path, content.trim_end_matches('\n')).unwrap();

        let loaded = SessionJournal::load(path.clone()).unwrap();
        assert_eq!(loaded.len(), 1);
        // File is newline-terminated again, so plain append works.
        assert!(std::fs::read_to_string(&path).unwrap().ends_with('\n'));
    }

    #[test]
    fn mid_file_corruption_is_a_hard_error() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("runtime_events.jsonl");
        let mut journal = SessionJournal::new(Some(path.clone()));
        for _ in 0..3 {
            journal
                .append(TurnStarted, "s1".into(), serde_json::Value::Null)
                .unwrap();
        }
        drop(journal);

        // Corrupt line 1 (not the tail): truth record unreliable.
        let mut lines: Vec<String> = std::fs::read_to_string(&path)
            .unwrap()
            .lines()
            .map(str::to_string)
            .collect();
        lines[1] = "not json".into();
        std::fs::write(&path, lines.join("\n") + "\n").unwrap();

        match SessionJournal::load(path) {
            Err(JournalError::Parse { line, .. }) => assert_eq!(line, 2),
            other => panic!("expected Parse error, got {other:?}"),
        }
    }

    #[test]
    fn sequence_gap_is_rejected() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("runtime_events.jsonl");
        let event = Event {
            seq: 0,
            kind: SessionStarted,
            session_id: "s1".into(),
            at_ms: 1,
            payload: serde_json::Value::Null,
        };
        let gap = Event {
            seq: 5,
            kind: TurnStarted,
            session_id: "s1".into(),
            at_ms: 2,
            payload: serde_json::Value::Null,
        };
        std::fs::write(
            &path,
            format!(
                "{}\n{}\n",
                serde_json::to_string(&event).unwrap(),
                serde_json::to_string(&gap).unwrap()
            ),
        )
        .unwrap();
        match SessionJournal::load(path) {
            Err(JournalError::Sequence {
                expected, actual, ..
            }) => {
                assert_eq!(expected, 1);
                assert_eq!(actual, 5);
            }
            other => panic!("expected Sequence error, got {other:?}"),
        }
    }

    #[test]
    fn terminal_gate_blocks_execution_until_resume() {
        let mut journal = SessionJournal::new(None);
        journal
            .append(SessionStarted, "s1".into(), serde_json::Value::Null)
            .unwrap();
        journal
            .append(SessionEnded, "s1".into(), serde_json::Value::Null)
            .unwrap();
        assert!(journal.is_terminated());

        let blocked = journal.append(TurnStarted, "s1".into(), serde_json::Value::Null);
        assert!(matches!(
            blocked,
            Err(JournalError::Terminated {
                kind: TurnStarted,
                ..
            })
        ));

        // Resume reopens the segment.
        journal
            .append(SessionResumed, "s1".into(), serde_json::Value::Null)
            .unwrap();
        assert!(!journal.is_terminated());
        journal
            .append(TurnStarted, "s1".into(), serde_json::Value::Null)
            .unwrap();
        assert_eq!(journal.len(), 4);
    }

    #[test]
    fn terminated_state_survives_reload() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("runtime_events.jsonl");
        let mut journal = SessionJournal::new(Some(path.clone()));
        journal
            .append(SessionStarted, "s1".into(), serde_json::Value::Null)
            .unwrap();
        journal
            .append(SessionEnded, "s1".into(), serde_json::Value::Null)
            .unwrap();
        drop(journal);

        let mut loaded = SessionJournal::load(path).unwrap();
        assert!(loaded.is_terminated());
        assert!(matches!(
            loaded.append(TurnStarted, "s1".into(), serde_json::Value::Null),
            Err(JournalError::Terminated { .. })
        ));
    }

    #[test]
    fn mixed_session_ids_are_rejected() {
        let mut journal = SessionJournal::new(None);
        journal
            .append(SessionStarted, "s1".into(), serde_json::Value::Null)
            .unwrap();
        match journal.append(TurnStarted, "s2".into(), serde_json::Value::Null) {
            Err(JournalError::SessionMismatch {
                expected, actual, ..
            }) => {
                assert_eq!(expected, "s1");
                assert_eq!(actual, "s2");
            }
            other => panic!("expected SessionMismatch, got {other:?}"),
        }
    }

    #[test]
    fn byte_cap_fails_loudly() {
        let mut journal = SessionJournal::new(None);
        journal
            .append(SessionStarted, "s1".into(), serde_json::Value::Null)
            .unwrap();
        // One event whose payload alone blows the cap.
        let huge = serde_json::json!({ "blob": "x".repeat((MAX_JOURNAL_BYTES + 1) as usize) });
        match journal.append(ModelResponded, "s1".into(), huge) {
            Err(JournalError::Full { .. }) => {}
            other => panic!("expected Full, got {other:?}"),
        }
        // The failed append left no trace.
        assert_eq!(journal.len(), 1);
    }

    #[test]
    fn memory_only_journal_works_without_path() {
        let mut journal = SessionJournal::new(None);
        journal
            .append(SessionStarted, "s1".into(), serde_json::Value::Null)
            .unwrap();
        assert_eq!(journal.len(), 1);
    }
}
