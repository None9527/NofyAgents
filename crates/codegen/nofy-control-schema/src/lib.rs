//! Control-plane vocabulary (PRD FR2 / batch D-2).
//!
//! The control plane streams the journal itself: [`Event`] is the wire unit
//! (model-visible ⟺ logged, so every surface renders from the same stream).
//! This crate adds the request/response half — [`methods::ControlMethod`] —
//! and the closed error-code table — [`errors::ControlErrorCode`] — and hosts
//! the drift gates that keep the vocabulary honest.
//!
//! Dependency direction: surfaces and the daemon depend on this crate; this
//! crate depends only on the journal vocabulary. No transport, no semantics.

pub mod errors;
pub mod methods;

/// The streaming unit of the control plane: the journal event, re-exported
/// so surfaces never invent their own envelope.
pub use nofy_session_journal::event::{Event, EventKind};

/// Control-plane protocol version; negotiated by `nofy-channel::hello`.
pub const CONTROL_PROTOCOL_VERSION: u32 = 1;

#[cfg(test)]
mod drift_gates {
    use super::*;

    /// Adding/removing an event kind is a wire change: this gate forces the
    /// author to touch the schema crate (and bump versions) deliberately.
    #[test]
    fn event_vocabulary_is_24_kinds_with_unique_wire_names() {
        assert_eq!(EventKind::ALL.len(), 24, "wire vocabulary changed");
        let mut names: Vec<&str> = EventKind::ALL.iter().map(|k| k.as_str()).collect();
        let dedup_len = {
            names.sort_unstable();
            names.dedup();
            names.len()
        };
        assert_eq!(dedup_len, 24, "duplicate wire names in EventKind");
    }

    /// The on-disk/wire shape must keep its four stable fields.
    #[test]
    fn event_wire_shape_roundtrips() {
        let raw = r#"{"seq":3,"kind":"tool.invoked","session_id":"s","at_ms":1,"payload":{"intent_id":"i"}}"#;
        let e: Event = serde_json::from_str(raw).expect("journal line parses");
        assert_eq!(e.kind, EventKind::ToolInvoked);
        assert_eq!(e.intent_id(), Some("i"));
        let back = serde_json::to_value(&e).unwrap();
        assert_eq!(back["kind"], "tool.invoked");
    }

    /// The search answer's `sessions` field is additive: a frame from an
    /// older peer (no field) deserializes as empty, and a populated answer
    /// roundtrips the matched session identities.
    #[test]
    fn search_sessions_field_is_additive_and_roundtrips() {
        let legacy = r#"{"method":"search_result","request_id":"r1","hits":2}"#;
        let m: methods::ControlMethod = serde_json::from_str(legacy).expect("legacy frame parses");
        match m {
            methods::ControlMethod::SearchResult { hits, sessions, .. } => {
                assert_eq!(hits, 2);
                assert!(sessions.is_empty(), "absent field defaults to empty");
            }
            other => panic!("unexpected method: {other:?}"),
        }

        let resp = methods::ControlResponse::Search {
            hits: 1,
            sessions: vec!["sess-a".into()],
        };
        let back: methods::ControlResponse =
            serde_json::from_str(&serde_json::to_string(&resp).unwrap()).unwrap();
        assert_eq!(back, resp);
    }
}
