//! Tool failure classification for unattended runs.
//!
//! The runtime must distinguish "the world pushed back" (recoverable —
//! feed it to the model as an observation and continue) from "the
//! runtime itself is broken" (terminal). v1 classes:
//!
//! | Class | Example | Run continues? |
//! |---|---|---|
//! | [`FailureClass::InvalidInput`] | invalid regex, bad arguments | yes |
//! | [`FailureClass::PathEscape`] | path outside the workspace | yes |
//! | [`FailureClass::AnchorMiss`] | edit anchor matched nothing / multiple | yes |
//! | [`FailureClass::TimeoutInconclusive`] | command timed out, outcome unknown | yes |
//! | [`FailureClass::RuntimeFailure`] | dispatch crash, transport death | **no** |
//!
//! Classification is heuristic over the tool name + error text and is
//! deliberately conservative: anything unrecognized is
//! [`FailureClass::RuntimeFailure`] only when the text carries runtime
//! markers; otherwise it falls to [`FailureClass::InvalidInput`] —
//! continuing the run with the error visible to the model is the safer
//! default for unattended work (a wrong early stop wastes the whole
//! run; a wrong continuation costs a few turns).

/// The class of a tool failure.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FailureClass {
    /// The arguments were invalid (bad regex, malformed input). The
    /// model can fix its own input.
    InvalidInput,
    /// The operation targeted a path outside the allowed workspace.
    PathEscape,
    /// An edit anchor matched nothing (or ambiguously many). The model
    /// needs a fresher view of the file.
    AnchorMiss,
    /// The operation timed out; its outcome is unknown, not failed.
    TimeoutInconclusive,
    /// The runtime itself failed (transport, dispatch, crash). The only
    /// class that terminates a run.
    RuntimeFailure,
}

/// Markers used by the classifier (lowercased matching).
const PATH_ESCAPE_MARKERS: &[&str] = &[
    "outside the workspace",
    "outside workspace",
    "path escape",
    "escapes the workspace",
    "not within the workspace",
];
const ANCHOR_MISS_MARKERS: &[&str] = &[
    "no matches found",
    "not found in",
    "anchor",
    "old_str",
    "multiple matches",
    "appears multiple times",
    "string to replace",
];
const TIMEOUT_MARKERS: &[&str] = &[
    "timed out",
    "timeout",
    "deadline exceeded",
    "exceeded the timeout",
];
const INVALID_INPUT_MARKERS: &[&str] = &[
    "invalid regex",
    "invalid argument",
    "invalid input",
    "parse error",
    "malformed",
    "invalid json",
    "invalid pattern",
];
const RUNTIME_MARKERS: &[&str] = &[
    "transport",
    "connection reset",
    "connection closed",
    "dispatch failed",
    "internal error",
    "panicked",
    "broken pipe",
    "process exited unexpectedly",
];

/// Classify a tool failure from the tool name and its error text.
///
/// Deterministic and pure — safe to call from any layer, and stable
/// enough to journal (`tool.failed` payloads carry the class).
pub fn classify_tool_failure(tool_name: &str, error_text: &str) -> FailureClass {
    let lower = error_text.to_lowercase();

    if contains_any(&lower, PATH_ESCAPE_MARKERS) {
        return FailureClass::PathEscape;
    }
    if contains_any(&lower, TIMEOUT_MARKERS) {
        return FailureClass::TimeoutInconclusive;
    }
    // Edit tools get anchor-miss priority over generic invalid-input:
    // "not found" on search_replace means the anchor, not the argument.
    if is_edit_tool(tool_name) && contains_any(&lower, ANCHOR_MISS_MARKERS) {
        return FailureClass::AnchorMiss;
    }
    if contains_any(&lower, INVALID_INPUT_MARKERS) {
        return FailureClass::InvalidInput;
    }
    if contains_any(&lower, RUNTIME_MARKERS) {
        return FailureClass::RuntimeFailure;
    }
    // Conservative default: treat the unknown as recoverable input-side
    // trouble; the model sees the full error text either way.
    FailureClass::InvalidInput
}

/// Whether this failure class terminates the run.
///
/// Only [`FailureClass::RuntimeFailure`] does — every other class is an
/// observation the model can act on.
pub fn is_run_terminal(class: FailureClass) -> bool {
    matches!(class, FailureClass::RuntimeFailure)
}

fn contains_any(haystack: &str, markers: &[&str]) -> bool {
    markers.iter().any(|marker| haystack.contains(marker))
}

fn is_edit_tool(tool_name: &str) -> bool {
    let lower = tool_name.to_lowercase();
    lower.contains("search_replace")
        || lower.contains("str_replace")
        || lower == "edit"
        || lower == "write"
        || lower.contains("apply_patch")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn anchor_miss_on_edit_tools() {
        assert_eq!(
            classify_tool_failure("search_replace", "No matches found for old_str"),
            FailureClass::AnchorMiss
        );
        assert_eq!(
            classify_tool_failure("edit", "string to replace appears multiple times"),
            FailureClass::AnchorMiss
        );
    }

    #[test]
    fn path_escape_wins_over_others() {
        assert_eq!(
            classify_tool_failure("write", "path escapes the workspace: /etc/passwd"),
            FailureClass::PathEscape
        );
    }

    #[test]
    fn timeout_is_inconclusive_not_failed() {
        assert_eq!(
            classify_tool_failure("run_terminal_cmd", "command timed out after 120s"),
            FailureClass::TimeoutInconclusive
        );
    }

    #[test]
    fn invalid_regex_is_invalid_input() {
        assert_eq!(
            classify_tool_failure("grep", "invalid regex: unclosed group"),
            FailureClass::InvalidInput
        );
    }

    #[test]
    fn runtime_markers_are_terminal() {
        assert_eq!(
            classify_tool_failure("any_tool", "transport error: connection reset"),
            FailureClass::RuntimeFailure
        );
        assert!(is_run_terminal(FailureClass::RuntimeFailure));
    }

    #[test]
    fn only_runtime_failure_terminates() {
        for class in [
            FailureClass::InvalidInput,
            FailureClass::PathEscape,
            FailureClass::AnchorMiss,
            FailureClass::TimeoutInconclusive,
        ] {
            assert!(!is_run_terminal(class), "{class:?} must not terminate");
        }
    }

    #[test]
    fn unknown_errors_default_to_recoverable() {
        assert_eq!(
            classify_tool_failure("some_tool", "something odd happened"),
            FailureClass::InvalidInput
        );
    }

    #[test]
    fn class_serializes_stable() {
        assert_eq!(
            serde_json::to_string(&FailureClass::AnchorMiss).unwrap(),
            "\"anchor_miss\""
        );
    }
}
