//! Reconciliation of open tool intents at resume time.
//!
//! The reducer's `open_intents` is the resume-time danger list: tool
//! invocations committed to the journal without an outcome event. After an
//! unclean stop the external side effect may have succeeded, partially
//! succeeded, or never happened — the journal alone cannot tell. This module
//! classifies each open intent so the host can re-confirm reality before the
//! session continues, instead of blindly assuming the last known state.

use serde::{Deserialize, Serialize};

use crate::reducer::SessionRuntimeSnapshot;

/// How an open intent relates to external reality.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum IntentClass {
    /// Read-only tool: no side effect to reconcile. The stale invocation is
    /// a bookkeeping artifact only.
    ReadOnly,
    /// Tool with external side effects: the outcome is unknown and reality
    /// must be re-checked before relying on any assumed result.
    SideEffectUnknown,
    /// Background/long-running tool: the work may still be executing.
    PossiblyRunning,
}

/// One open intent with its reconciliation classification.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ReconciledIntent {
    pub intent_id: String,
    /// Seq of the `tool.invoked` event.
    pub seq: u64,
    /// Tool name from the invocation payload, if present.
    pub tool: Option<String>,
    pub class: IntentClass,
}

/// The outcome of reconciling a snapshot's open intents.
#[derive(Debug, Clone, PartialEq, Default, Serialize, Deserialize)]
pub struct ReconciliationReport {
    /// Total open intents found.
    pub open_total: usize,
    /// Intents classified [`IntentClass::ReadOnly`].
    pub read_only: usize,
    /// Intents classified [`IntentClass::SideEffectUnknown`].
    pub unknown_outcome: usize,
    /// Intents classified [`IntentClass::PossiblyRunning`].
    pub possibly_running: usize,
    pub intents: Vec<ReconciledIntent>,
}

impl ReconciliationReport {
    /// True when at least one intent needs the host's attention (anything
    /// beyond read-only bookkeeping).
    pub fn needs_attention(&self) -> bool {
        self.unknown_outcome > 0 || self.possibly_running > 0
    }

    /// One-line human summary for context injection / logging.
    pub fn summary_line(&self) -> String {
        if self.open_total == 0 {
            return "no open tool intents at resume".to_string();
        }
        let tools: Vec<String> = self
            .intents
            .iter()
            .filter(|i| i.class != IntentClass::ReadOnly)
            .map(|i| {
                format!(
                    "{}({})",
                    i.tool.as_deref().unwrap_or("unknown"),
                    match i.class {
                        IntentClass::PossiblyRunning => "possibly still running",
                        IntentClass::SideEffectUnknown => "outcome unknown",
                        IntentClass::ReadOnly => "read-only",
                    }
                )
            })
            .collect();
        format!(
            "open tool intents at resume: {} total ({} read-only, {} unknown outcome, {} possibly running){}",
            self.open_total,
            self.read_only,
            self.unknown_outcome,
            self.possibly_running,
            if tools.is_empty() {
                String::new()
            } else {
                format!("; needs attention: {}", tools.join(", "))
            }
        )
    }
}

/// Classify every open intent in `snapshot` using the host-provided `classify`
/// (tool name → class). Intents without a tool name are classified
/// [`IntentClass::SideEffectUnknown`] — absence of identification is not
/// evidence of safety.
pub fn reconcile_open_intents(
    snapshot: &SessionRuntimeSnapshot,
    classify: impl Fn(&str) -> IntentClass,
) -> ReconciliationReport {
    let mut report = ReconciliationReport::default();
    for (intent_id, open) in &snapshot.open_intents {
        let class = match open.tool.as_deref() {
            Some(tool) => classify(tool),
            None => IntentClass::SideEffectUnknown,
        };
        match class {
            IntentClass::ReadOnly => report.read_only += 1,
            IntentClass::SideEffectUnknown => report.unknown_outcome += 1,
            IntentClass::PossiblyRunning => report.possibly_running += 1,
        }
        report.intents.push(ReconciledIntent {
            intent_id: intent_id.clone(),
            seq: open.seq,
            tool: open.tool.clone(),
            class,
        });
    }
    report.open_total = report.intents.len();
    report.intents.sort_by_key(|i| i.seq);
    report
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::event::{Event, EventKind};
    use crate::reducer::project;

    fn event(seq: u64, kind: EventKind, payload: serde_json::Value) -> Event {
        Event {
            seq,
            kind,
            session_id: "s1".into(),
            at_ms: 1000 + seq,
            payload,
        }
    }

    fn classifier(tool: &str) -> IntentClass {
        match tool {
            "read_file" | "grep" => IntentClass::ReadOnly,
            "bash" | "task" => IntentClass::PossiblyRunning,
            _ => IntentClass::SideEffectUnknown,
        }
    }

    #[test]
    fn empty_snapshot_reconciles_clean() {
        let snapshot = project(&[event(0, EventKind::SessionStarted, serde_json::Value::Null)]);
        let report = reconcile_open_intents(&snapshot, classifier);
        assert_eq!(report.open_total, 0);
        assert!(!report.needs_attention());
        assert_eq!(report.summary_line(), "no open tool intents at resume");
    }

    #[test]
    fn open_intents_are_classified_and_counted() {
        let snapshot = project(&[
            event(0, EventKind::SessionStarted, serde_json::Value::Null),
            event(
                1,
                EventKind::ToolInvoked,
                serde_json::json!({"intent_id": "a", "tool": "read_file"}),
            ),
            event(
                2,
                EventKind::ToolInvoked,
                serde_json::json!({"intent_id": "b", "tool": "bash"}),
            ),
            event(
                3,
                EventKind::ToolInvoked,
                serde_json::json!({"intent_id": "c", "tool": "search_replace"}),
            ),
        ]);
        let report = reconcile_open_intents(&snapshot, classifier);
        assert_eq!(report.open_total, 3);
        assert_eq!(report.read_only, 1);
        assert_eq!(report.possibly_running, 1);
        assert_eq!(report.unknown_outcome, 1);
        assert!(report.needs_attention());
        // Sorted by seq for stable presentation.
        let ids: Vec<&str> = report
            .intents
            .iter()
            .map(|i| i.intent_id.as_str())
            .collect();
        assert_eq!(ids, vec!["a", "b", "c"]);
        let summary = report.summary_line();
        assert!(
            summary.contains("bash(possibly still running)"),
            "{summary}"
        );
        assert!(
            summary.contains("search_replace(outcome unknown)"),
            "{summary}"
        );
        assert!(!summary.contains("read_file("), "{summary}");
    }

    #[test]
    fn closed_intents_are_not_reconciled() {
        let snapshot = project(&[
            event(0, EventKind::SessionStarted, serde_json::Value::Null),
            event(
                1,
                EventKind::ToolInvoked,
                serde_json::json!({"intent_id": "a", "tool": "bash"}),
            ),
            event(
                2,
                EventKind::ToolSucceeded,
                serde_json::json!({"intent_id": "a"}),
            ),
        ]);
        let report = reconcile_open_intents(&snapshot, classifier);
        assert_eq!(report.open_total, 0);
        assert!(!report.needs_attention());
    }

    #[test]
    fn unidentified_tool_is_unknown_not_safe() {
        let snapshot = project(&[
            event(0, EventKind::SessionStarted, serde_json::Value::Null),
            event(
                1,
                EventKind::ToolInvoked,
                serde_json::json!({"intent_id": "a"}),
            ),
        ]);
        let report = reconcile_open_intents(&snapshot, classifier);
        assert_eq!(report.unknown_outcome, 1);
        assert!(report.needs_attention());
    }

    #[test]
    fn report_round_trips_through_json() {
        let snapshot = project(&[
            event(0, EventKind::SessionStarted, serde_json::Value::Null),
            event(
                1,
                EventKind::ToolInvoked,
                serde_json::json!({"intent_id": "a", "tool": "bash"}),
            ),
        ]);
        let report = reconcile_open_intents(&snapshot, classifier);
        let value = serde_json::to_value(&report).unwrap();
        let back: ReconciliationReport = serde_json::from_value(value).unwrap();
        assert_eq!(back, report);
    }
}
