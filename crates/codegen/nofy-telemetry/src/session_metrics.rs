//! Session lifecycle event structs.
//!
//! Fires in both `Enabled` and `SessionMetrics` telemetry modes via
//! `log_session_event`.

use serde::Serialize;

/// The ACP method the client called, kept separate from the warm/cold
/// mechanism (`SessionStarted::restored_from_disk`) so intent and mechanism can
/// be queried independently.
#[derive(Serialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum SessionStartKind {
    New,
    Load,
    Resume,
}

#[derive(Serialize)]
pub struct SessionStarted {
    pub session_id: String,
    pub kind: SessionStartKind,
    pub setup_duration_ms: u64,
    /// Whether setup rebuilt the session from disk (cold) rather than
    /// reconnecting to a resident actor (warm). Mirrors `SessionLoad`.
    pub restored_from_disk: bool,
}

impl SessionStarted {
    pub fn new(
        session_id: String,
        kind: SessionStartKind,
        setup_duration: std::time::Duration,
        restored_from_disk: bool,
    ) -> Self {
        Self {
            session_id,
            kind,
            setup_duration_ms: setup_duration.as_millis() as u64,
            restored_from_disk,
        }
    }
}

#[derive(Serialize)]
pub struct Turn {
    pub session_id: String,
    pub turn_number: u64,
}

#[derive(Serialize)]
pub struct TurnCompletedLifecycle {
    pub session_id: String,
    pub turn_number: u64,
}

/// Doom-loop recovery acted this turn: poisoned attempts were resampled
/// and/or a response was accepted with confident signals after the budget
/// was spent. Trigger labels only — never generation content.
#[derive(Serialize)]
pub struct DoomLoopRecovery {
    pub session_id: String,
    pub turn_number: u64,
    /// Resamples this turn (doomed attempts discarded).
    pub attempts: u32,
    /// Whether the final response kept confident signals (budget spent).
    pub accepted_after_budget: bool,
    /// Tightest raw trigger label observed this turn.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_trigger: Option<String>,
    /// Model that produced the doomed attempts.
    pub model: String,
}

#[cfg(test)]
mod tests {
    /// The `nofy-shell-doom_loop_recovery` product event's name and
    /// property keys are dashboard contracts — pin them.
    #[test]
    fn doom_loop_recovery_event_shape_is_stable() {
        use crate::events::TelemetryEvent;
        assert_eq!(super::DoomLoopRecovery::NAME, "doom_loop_recovery");
        let with_trigger = serde_json::to_value(super::DoomLoopRecovery {
            session_id: "s1".to_string(),
            turn_number: 7,
            attempts: 2,
            accepted_after_budget: true,
            top_trigger: Some("tail_repetition:4@thinking".to_string()),
            model: "grok-4.5".to_string(),
        })
        .unwrap();
        assert_eq!(
            with_trigger,
            serde_json::json!({
                "session_id": "s1",
                "turn_number": 7,
                "attempts": 2,
                "accepted_after_budget": true,
                "top_trigger": "tail_repetition:4@thinking",
                "model": "grok-4.5",
            })
        );
        let no_trigger = serde_json::to_value(super::DoomLoopRecovery {
            session_id: "s1".to_string(),
            turn_number: 7,
            attempts: 1,
            accepted_after_budget: false,
            top_trigger: None,
            model: "grok-4.5".to_string(),
        })
        .unwrap();
        assert!(no_trigger.get("top_trigger").is_none(), "None is omitted");
    }
}
