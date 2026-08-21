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
        assert!(
            matches!(
                &m,
                methods::ControlMethod::SearchResult { hits: 2, sessions, .. }
                    if sessions.is_empty()
            ),
            "legacy frame deserializes as SearchResult with empty sessions: {m:?}"
        );

        let resp = methods::ControlResponse::Search {
            hits: 1,
            sessions: vec!["sess-a".into()],
        };
        let back: methods::ControlResponse =
            serde_json::from_str(&serde_json::to_string(&resp).unwrap()).unwrap();
        assert_eq!(back, resp);
    }

    /// The schedule methods are additive wire vocabulary: tagged snake_case,
    /// and the listing's entry fields roundtrip with additive defaults.
    #[test]
    fn schedule_methods_are_tagged_and_entries_roundtrip() {
        let add = serde_json::to_value(methods::ControlMethod::ScheduleAdd {
            id: "nightly".into(),
            cron_spec: "0 3 * * *".into(),
            goal: Some("water the plants".into()),
            cwd: None,
            once: false,
        })
        .unwrap();
        assert_eq!(add["method"], "schedule_add");
        assert_eq!(add["goal"], "water the plants");
        let listed = methods::ControlResponse::ScheduleListed {
            entries: vec![methods::ScheduleEntryInfo {
                id: "nightly".into(),
                spec: "0 3 * * *".into(),
                disabled_reason: None,
                pending: 1,
                goal: Some("water the plants".into()),
                once: false,
            }],
        };
        let back: methods::ControlResponse =
            serde_json::from_str(&serde_json::to_string(&listed).unwrap()).unwrap();
        assert_eq!(back, listed);
        // An entry from an older peer without the additive fields parses.
        let legacy = r#"{"id":"x","spec":"* * * * *"}"#;
        let e: methods::ScheduleEntryInfo = serde_json::from_str(legacy).unwrap();
        assert_eq!(e.disabled_reason, None);
        assert_eq!(e.pending, 0);
        assert_eq!(e.goal, None);
        assert!(!e.once);
        // A ScheduleAdd from an older peer without the payload parses.
        let legacy_add = r#"{"method":"schedule_add","id":"x","cron_spec":"* * * * *"}"#;
        let m: methods::ControlMethod = serde_json::from_str(legacy_add).unwrap();
        assert!(matches!(
            m,
            methods::ControlMethod::ScheduleAdd { goal: None, once: false, .. }
        ));
    }
}
