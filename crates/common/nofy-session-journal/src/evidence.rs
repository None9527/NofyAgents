//! Verification evidence for completion claims (RTAgent Phase D1).
//!
//! A model that changed files and then claims completion may be right —
//! but the journal can tell whether any verification (a successful
//! test/build run) actually happened after the last change. This module
//! computes that verdict from the event stream: terminal conditions and
//! completion claims need evidence, and absence of evidence is surfaced
//! as such, never silently treated as success.
//!
//! The fold takes host-provided tool classifiers (same pattern as
//! [`crate::reconcile`]): which `tool.invoked` names count as mutations,
//! which `tool.succeeded` names count as verification.

use crate::event::{Event, EventKind};

/// The verification state relative to the most recent mutation.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum VerificationState {
    /// No mutation recorded: nothing to verify.
    NoMutations,
    /// At least one verification success happened after the last
    /// mutation.
    Verified {
        last_mutation_seq: u64,
        verification_seq: u64,
    },
    /// Mutations exist and no verification success happened since the
    /// last one.
    Unverified { last_mutation_seq: u64 },
}

/// Fold an event stream into a [`VerificationState`].
///
/// `is_mutation_tool` classifies `tool.invoked` tool names (did this
/// invocation change external reality); `is_verification_tool`
/// classifies `tool.succeeded` tool names (did this success verify the
/// work, e.g. a test/build run). A verification only counts for
/// mutations strictly before it: success before the last change says
/// nothing about that change.
pub fn verification_state<'a>(
    events: impl IntoIterator<Item = &'a Event>,
    is_mutation_tool: impl Fn(&str) -> bool,
    is_verification_tool: impl Fn(&str) -> bool,
) -> VerificationState {
    let mut last_mutation_seq: Option<u64> = None;
    let mut last_verification_seq: Option<u64> = None;
    for event in events {
        match event.kind {
            EventKind::ToolInvoked => {
                let is_mutation = event.tool_name().is_some_and(&is_mutation_tool);
                if is_mutation {
                    last_mutation_seq = Some(event.seq);
                }
            }
            EventKind::ToolSucceeded => {
                let is_verification = event.tool_name().is_some_and(&is_verification_tool);
                if is_verification {
                    last_verification_seq = Some(event.seq);
                }
            }
            _ => {}
        }
    }
    match (last_mutation_seq, last_verification_seq) {
        (None, _) => VerificationState::NoMutations,
        (Some(mutation), Some(verification)) if verification > mutation => {
            VerificationState::Verified {
                last_mutation_seq: mutation,
                verification_seq: verification,
            }
        }
        (Some(mutation), _) => VerificationState::Unverified {
            last_mutation_seq: mutation,
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn tool_event(seq: u64, kind: EventKind, tool: &str) -> Event {
        Event {
            seq,
            kind,
            session_id: "s1".into(),
            at_ms: 100 + seq,
            payload: json!({ "tool": tool, "intent_id": format!("i{seq}") }),
        }
    }

    fn is_write(tool: &str) -> bool {
        tool == "search_replace"
    }

    fn is_bash(tool: &str) -> bool {
        tool == "bash"
    }

    #[test]
    fn no_mutations_means_nothing_to_verify() {
        let events = [tool_event(1, EventKind::ToolInvoked, "read_file")];
        assert_eq!(
            verification_state(&events, is_write, is_bash),
            VerificationState::NoMutations
        );
        assert_eq!(
            verification_state(std::iter::empty::<&Event>(), is_write, is_bash),
            VerificationState::NoMutations
        );
    }

    #[test]
    fn mutation_without_later_success_is_unverified() {
        let events = [tool_event(3, EventKind::ToolInvoked, "search_replace")];
        assert_eq!(
            verification_state(&events, is_write, is_bash),
            VerificationState::Unverified {
                last_mutation_seq: 3
            }
        );
    }

    #[test]
    fn success_after_mutation_verifies() {
        let events = [
            tool_event(3, EventKind::ToolInvoked, "search_replace"),
            tool_event(5, EventKind::ToolInvoked, "bash"),
            tool_event(6, EventKind::ToolSucceeded, "bash"),
        ];
        assert_eq!(
            verification_state(&events, is_write, is_bash),
            VerificationState::Verified {
                last_mutation_seq: 3,
                verification_seq: 6
            }
        );
    }

    #[test]
    fn success_before_mutation_does_not_verify_it() {
        let events = [
            tool_event(2, EventKind::ToolInvoked, "bash"),
            tool_event(3, EventKind::ToolSucceeded, "bash"),
            tool_event(7, EventKind::ToolInvoked, "search_replace"),
        ];
        assert_eq!(
            verification_state(&events, is_write, is_bash),
            VerificationState::Unverified {
                last_mutation_seq: 7
            }
        );
    }

    #[test]
    fn second_mutation_wave_reopens_the_question() {
        let events = [
            tool_event(3, EventKind::ToolInvoked, "search_replace"),
            tool_event(6, EventKind::ToolSucceeded, "bash"),
            tool_event(9, EventKind::ToolInvoked, "search_replace"),
        ];
        assert_eq!(
            verification_state(&events, is_write, is_bash),
            VerificationState::Unverified {
                last_mutation_seq: 9
            }
        );
    }

    #[test]
    fn failed_verification_does_not_count() {
        let events = [
            tool_event(3, EventKind::ToolInvoked, "search_replace"),
            tool_event(5, EventKind::ToolInvoked, "bash"),
            tool_event(6, EventKind::ToolFailed, "bash"),
        ];
        assert_eq!(
            verification_state(&events, is_write, is_bash),
            VerificationState::Unverified {
                last_mutation_seq: 3
            }
        );
    }

    #[test]
    fn unnamed_tool_events_are_neither_mutation_nor_verification() {
        let event = Event {
            seq: 1,
            kind: EventKind::ToolInvoked,
            session_id: "s1".into(),
            at_ms: 101,
            payload: serde_json::Value::Null,
        };
        assert_eq!(
            verification_state(&[event], is_write, is_bash),
            VerificationState::NoMutations
        );
    }
}
