//! Control-plane request methods (the req/res half; streaming is [`crate::Event`]).
//!
//! Kept deliberately small: everything a surface needs is (a) list/attach/
//! load-delta over sessions, (b) approval round-trips, (c) liveness. New
//! methods are additive minor versions; removing one is a major bump.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "method", rename_all = "snake_case")]
pub enum ControlMethod {
    /// List sessions across workspaces (global registry view, HM-F8).
    SessionList {
        #[serde(default)]
        cwd: Option<String>,
        #[serde(default)]
        limit: Option<u32>,
    },
    /// Attach to a live session stream from a cursor (BufferedDelta): the
    /// daemon replays `Event`s after `cursor` then goes live.
    SessionAttach {
        session_id: String,
        #[serde(default)]
        cursor: Option<String>,
    },
    /// Cross-project text search (CJK-aware index, batch C-1).
    SessionSearch { query: String },
    /// Approval round-trip (FR5.1 cross-surface approval).
    ApprovalRequest {
        intent_id: String,
        summary: String,
    },
    ApprovalRespond {
        intent_id: String,
        decision: ApprovalDecision,
    },
    /// Liveness probe; answered with [`ControlResponse::Pong`].
    Ping,
    /// A resident runtime (the shell) registers as event provider for the
    /// sessions it hosts. Additive capability declaration; the daemon only
    /// narrows.
    ProviderRegister { provider_id: String },
    /// Provider pushes a live journal event; the daemon fans it out to
    /// attached control-plane clients (and relies on the provider's own
    /// journal for durability — the bus is a hint channel, disk is truth).
    SessionEventPush { event: crate::Event },
    /// Client submits a project manifest (TOML text) plus the pack manifests
    /// it references; the daemon validates plane ownership (DS-P4) and realm
    /// isolation (DS-P2) at submit, fail-loud.
    TaskSubmit {
        manifest: String,
        #[serde(default)]
        packs: Vec<serde_json::Value>,
    },
    /// Provider-side: pull the next ready task of the active run.
    TaskPoll,
    /// Provider-side: report a task outcome.
    TaskResult { task_id: String, succeeded: bool },
    /// Provider-side: long-poll for a search job the daemon is holding on
    /// behalf of a blocked client connection.
    SearchPoll,
    /// Provider-side: answer a dispatched search job. `sessions` carries the
    /// matched session identities so surfaces can present/open the hits
    /// (additive field; absent on older peers deserializes as empty).
    SearchResult {
        request_id: String,
        hits: u32,
        #[serde(default)]
        sessions: Vec<String>,
    },
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ApprovalDecision {
    AllowOnce,
    AllowSession,
    Deny,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum ControlResponse {
    Pong,
    SessionList {
        count: u32,
    },
    Search {
        hits: u32,
        /// Matched session identities from the provider's index (additive;
        /// empty when the answering provider predates this field).
        #[serde(default)]
        sessions: Vec<String>,
    },
    /// Surface-side ack: the answer was recorded.
    ApprovalNoted,
    /// Provider-side ack: registration accepted.
    ProviderNoted,
    /// Client-side ack: manifest accepted; `total` tasks in the plan.
    ProjectAccepted { total: u32 },
    /// Provider-side: a dispatched task (pack join + goal). `persona` and
    /// `skills` come from the validated pack manifest so the provider joins
    /// the exact composition the plan was validated against.
    TaskDispatch {
        task_id: String,
        pack: String,
        goal: String,
        #[serde(default)]
        persona: Option<String>,
        #[serde(default)]
        skills: Vec<String>,
    },
    /// Provider-side: result recorded.
    TaskNoted,
    /// Provider-side: no search job pending.
    NoPending,
    /// Provider-side: a dispatched search job.
    SearchDispatch { request_id: String, query: String },
    /// One live/replayed journal event on an attached stream.
    SessionEvent { event: crate::Event },
    /// Provider-side outcome: a surface decided (or the broker timed out —
    /// in which case the method frame is a ControlError instead).
    ApprovalResolved { decision: ApprovalDecision },
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn method_wire_shape_is_tagged_and_stable() {
        let v = serde_json::to_value(ControlMethod::SessionAttach {
            session_id: "s1".into(),
            cursor: Some("evt-1".into()),
        })
        .unwrap();
        assert_eq!(v["method"], "session_attach");
        assert_eq!(v["cursor"], "evt-1");
    }

    #[test]
    fn decisions_are_closed_set() {
        for d in [
            ApprovalDecision::AllowOnce,
            ApprovalDecision::AllowSession,
            ApprovalDecision::Deny,
        ] {
            let s = serde_json::to_string(&d).unwrap();
            assert!(serde_json::from_str::<ApprovalDecision>(&s).is_ok());
        }
    }
}
