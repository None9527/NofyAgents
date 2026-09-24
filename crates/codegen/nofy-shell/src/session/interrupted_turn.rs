//! Repairs, at cold session load, a turn the previous process never finished.

use std::io::{Read as _, Seek as _, SeekFrom};
use std::path::Path;

use crate::session::persistence::Summary;

pub(crate) const INTERRUPTED_STOP_REASON: &str = "interrupted";
pub(crate) const INTERRUPTED_MESSAGE: &str = "Nofy stopped before this turn finished (the agent process exited or was restarted). Committed tool results were kept.";

/// One turn's events fit in this tail many times over, without loading an old
/// session's complete event history during restore.
const EVENTS_TAIL_BYTES: u64 = 256 * 1024;

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct InterruptedTurn {
    pub(crate) trace_turn: u64,
    pub(crate) prompt_id: String,
    pub(crate) started_at: Option<String>,
}

impl InterruptedTurn {
    pub(crate) fn model_reminder(&self) -> String {
        "The previous turn was interrupted because the agent process exited or restarted. Work before this message may have been lost."
            .to_string()
    }

    /// Close the turn on the durable replay rail so a reconnecting client does
    /// not leave it painted as permanently running.
    pub(crate) fn turn_completed_update(
        &self,
        session_id: &agent_client_protocol::SessionId,
    ) -> crate::session::storage::SessionUpdate {
        let update = crate::session::turn_completion::build_turn_completed(
            self.prompt_id.clone(),
            serde_json::json!(INTERRUPTED_STOP_REASON),
            serde_json::json!(INTERRUPTED_MESSAGE),
            None,
        );
        let notification = crate::extensions::notification::SessionNotification {
            session_id: session_id.clone(),
            update,
            meta: Some(serde_json::json!({
                "eventId": crate::util::event_id::generate_event_id(&session_id.0),
                "agentTimestampMs": chrono::Utc::now().timestamp_millis(),
            })),
        };
        crate::session::storage::SessionUpdate::Nofy(Box::new(notification))
    }

    /// Close the open event boundary. This is also the idempotence marker: a
    /// later load sees `turn_ended` and will not synthesize a second terminal.
    pub(crate) fn close_events_turn(&self, session_dir: &Path) {
        nofy_file_utils::events::EventWriter::open(session_dir).emit(
            nofy_file_utils::events::Event::TurnEnded {
                outcome: nofy_file_utils::events::TurnOutcomeLabel::Interrupted,
                cancellation_category: None,
                cancellation_context: None,
            },
        );
    }
}

/// Returns the newest turn only when it started but never ended and the
/// summary still identifies its sampler request.
pub(crate) fn detect_interrupted_turn(
    session_dir: &Path,
    summary: &Summary,
) -> Option<InterruptedTurn> {
    detect_interrupted_turn_from_parts(
        session_dir,
        summary.request_id.clone(),
        summary.next_trace_turn,
    )
}

fn detect_interrupted_turn_from_parts(
    session_dir: &Path,
    prompt_id: Option<String>,
    next_trace_turn: u64,
) -> Option<InterruptedTurn> {
    let prompt_id = prompt_id?;
    let trace_turn = next_trace_turn.checked_sub(1)?;
    let tail = read_events_tail(&session_dir.join("events.jsonl"))?;
    let started_at = open_turn_started_at(&tail)?;
    Some(InterruptedTurn {
        trace_turn,
        prompt_id,
        started_at,
    })
}

fn read_events_tail(path: &Path) -> Option<String> {
    let mut file = std::fs::File::open(path).ok()?;
    let len = file.metadata().ok()?.len();
    let start = len.saturating_sub(EVENTS_TAIL_BYTES);
    file.seek(SeekFrom::Start(start)).ok()?;
    let mut bytes = Vec::with_capacity((len - start) as usize);
    file.read_to_end(&mut bytes).ok()?;
    let mut text = String::from_utf8_lossy(&bytes).into_owned();
    if start > 0 {
        match text.find('\n') {
            Some(index) => text.drain(..=index),
            None => return None,
        };
    }
    Some(text)
}

/// Returns the timestamp of the last unclosed `turn_started`. Malformed and
/// unrelated legacy rows are ignored.
fn open_turn_started_at(tail: &str) -> Option<Option<String>> {
    let mut open: Option<Option<String>> = None;
    for line in tail.lines() {
        let Ok(event) = serde_json::from_str::<serde_json::Value>(line) else {
            continue;
        };
        match event.get("type").and_then(serde_json::Value::as_str) {
            Some("turn_started") => {
                open = Some(
                    event
                        .get("ts")
                        .and_then(serde_json::Value::as_str)
                        .map(str::to_owned),
                );
            }
            Some("turn_ended") => open = None,
            _ => {}
        }
    }
    open
}

#[cfg(test)]
mod tests {
    use std::io::Write as _;

    use super::*;

    fn write_events(dir: &Path, rows: &str) {
        std::fs::write(dir.join("events.jsonl"), rows).unwrap();
    }

    #[test]
    fn detects_only_an_unclosed_latest_turn() {
        let dir = tempfile::tempdir().unwrap();
        write_events(
            dir.path(),
            concat!(
                "{\"type\":\"turn_started\",\"ts\":\"old\"}\n",
                "{\"type\":\"turn_ended\",\"outcome\":\"completed\"}\n",
                "not-json\n",
                "{\"type\":\"phase_changed\"}\n",
                "{\"type\":\"turn_started\",\"ts\":\"latest\"}\n",
            ),
        );

        assert_eq!(
            detect_interrupted_turn_from_parts(dir.path(), Some("prompt-9".into()), 10),
            Some(InterruptedTurn {
                trace_turn: 9,
                prompt_id: "prompt-9".into(),
                started_at: Some("latest".into()),
            })
        );
    }

    #[test]
    fn completed_missing_and_legacy_sessions_are_ignored() {
        let dir = tempfile::tempdir().unwrap();
        assert!(detect_interrupted_turn_from_parts(dir.path(), Some("prompt".into()), 1).is_none());

        write_events(
            dir.path(),
            "{\"type\":\"turn_started\"}\n{\"type\":\"turn_ended\"}\n",
        );
        assert!(detect_interrupted_turn_from_parts(dir.path(), Some("prompt".into()), 1).is_none());
        assert!(detect_interrupted_turn_from_parts(dir.path(), None, 1).is_none());
        assert!(detect_interrupted_turn_from_parts(dir.path(), Some("prompt".into()), 0).is_none());
    }

    #[test]
    fn closing_the_event_makes_detection_idempotent() {
        let dir = tempfile::tempdir().unwrap();
        write_events(dir.path(), "{\"type\":\"turn_started\",\"ts\":\"start\"}\n");
        let turn = detect_interrupted_turn_from_parts(dir.path(), Some("prompt".into()), 3)
            .expect("open turn");
        turn.close_events_turn(dir.path());

        assert!(detect_interrupted_turn_from_parts(dir.path(), Some("prompt".into()), 3).is_none());
        let events = std::fs::read_to_string(dir.path().join("events.jsonl")).unwrap();
        assert!(events.contains("\"outcome\":\"interrupted\""));
    }

    #[test]
    fn tail_scan_discards_a_partial_first_line() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("events.jsonl");
        let mut file = std::fs::File::create(&path).unwrap();
        file.write_all(&vec![b'x'; EVENTS_TAIL_BYTES as usize])
            .unwrap();
        file.write_all(b"\n{\"type\":\"turn_started\",\"ts\":\"tail\"}\n")
            .unwrap();

        assert_eq!(
            open_turn_started_at(&read_events_tail(&path).unwrap()),
            Some(Some("tail".into()))
        );
    }
}
