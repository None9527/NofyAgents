//! Pure completion discipline; the host supplies its task observations.
/// Stable reason for a completion-discipline decision.
/// Hosts can map this to telemetry without consulting session state.
/// The original Nofy wire label is preserved by `as_str`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TodoGateReason {
    /// The turn ended with pending or unbacked in-progress todos.
    InFlight,
}

/// Outcome of `evaluate_todo_gate`. `Nudge` carries the rendered
/// reminder text AND the typed reason so the producer can emit
/// telemetry without re-deriving the reason from the input.
///
/// Hosts consume this reusable result without a session actor.
/// They own reminder delivery, telemetry and continuation budgets.
/// No I/O is performed by this policy.
pub enum TodoGateDecision {
    /// Gate is satisfied — the turn may end.
    Continue,
    /// Inject `reminder` as a `<system-reminder>` and force another turn.
    Nudge {
        reminder: String,
        reason: TodoGateReason,
    },
}

pub struct TodoGateInput<'a> {
    pub pending: Vec<&'a str>,
    pub in_progress_unbacked: Vec<&'a str>,
    pub in_progress_backed: Vec<&'a str>,
    pub backing_task_count: usize,
}
impl TodoGateReason {
    /// Stable wire-string form, shared with the original Nofy telemetry.
    /// It does not depend on a host event implementation.
    pub fn as_str(self) -> &'static str {
        match self {
            Self::InFlight => "in_flight",
        }
    }
}
/// Pure decision function: does the gate fire, and with what reminder?
///
/// The function does NOT consult the cap — the caller folds the cap check
/// in around this function. Keeping cap logic out makes `evaluate_todo_gate`
/// trivially testable.
///
/// Callers supply task observations from their own state implementation.
/// The same function is used by the Nofy adapter and standalone hosts.
/// It does not discover tasks or create background work.
pub fn evaluate_todo_gate(input: &TodoGateInput<'_>) -> TodoGateDecision {
    if input.pending.is_empty() && input.in_progress_unbacked.is_empty() {
        return TodoGateDecision::Continue;
    }
    TodoGateDecision::Nudge {
        reminder: build_todo_gate_reminder(&input.pending, &input.in_progress_unbacked),
        reason: TodoGateReason::InFlight,
    }
}
/// Build the in-flight TodoGate reminder text.
///
/// Uses the doubled-`${{{{ tools.by_kind.* }}}}` convention so the
/// caller's `format!` pass leaves a single `${{ tools.by_kind.* }}`
/// for `TemplateRenderer` / `render_prompt` to resolve into the
/// model-facing tool name.
pub fn build_todo_gate_reminder(pending: &[&str], unbacked_in_progress: &[&str]) -> String {
    use std::fmt::Write as _;
    let mut buf =
        String::from("You have outstanding todos but ended your turn without a tool call.\n\n");
    if !unbacked_in_progress.is_empty() {
        buf.push_str("In-progress (no backing background task):\n");
        for c in unbacked_in_progress {
            let _ = writeln!(buf, "- {c}");
        }
        buf.push('\n');
    }
    if !pending.is_empty() {
        buf.push_str("Pending:\n");
        for c in pending {
            let _ = writeln!(buf, "- {c}");
        }
        buf.push('\n');
    }
    let _ = write!(
        buf,
        "Per <task_completion_discipline>, advance the next pending todo \
         with the appropriate tool call NOW. If you have a genuine external \
         blocker (missing credential, denied permission, network unreachable), \
         state it explicitly AND mark the affected todos `cancelled` via \
         ${{{{ tools.by_kind.plan }}}} with a reason in the same turn."
    );
    buf
}
