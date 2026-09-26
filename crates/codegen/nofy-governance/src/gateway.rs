//! Non-TUI approval proof unit (G11, D-1 milestone 「webhook 批高危」).
//!
//! Defined by the PROPOSITION, not surface completeness: an approval
//! request can be answered from OUTSIDE the TUI (webhook-originated), the
//! answer flows through the daemon's real approval broker, and any store
//! corruption fails CLOSED (deny). Full webhook surface parity (message
//! formatting, threading, bot state) remains P2 (FR13.3).
//!
//! The gateway is the logic half: it validates webhook answers against
//! the pending ledger, records decisions, and hands the decision to the
//! broker. Transport (HTTP) is a later wiring step; the proposition is
//! proven here against the real broker.

use serde::{Deserialize, Serialize};

/// One pending approval request.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ApprovalRequest {
    pub intent_id: String,
    pub summary: String,
    /// High-risk requests require an explicit answer; they never time out
    /// into an implicit allow.
    pub high_risk: bool,
}

/// A webhook-originated answer.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WebhookAnswer {
    pub intent_id: String,
    pub allow: bool,
    /// Which non-TUI surface answered (audit).
    pub surface: String,
}

/// Gateway outcome for one answer.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum GatewayOutcome {
    /// Answer accepted and routed to the broker.
    Routed { allow: bool },
    /// No such pending intent.
    UnknownIntent,
    /// The ledger is corrupt: fail-closed deny.
    CorruptDeny,
}

/// Load a request ledger from jsonl; corruption = Err (fail-closed).
pub fn load_ledger(text: &str) -> Result<Vec<ApprovalRequest>, ()> {
    let mut requests = Vec::new();
    for line in text.lines() {
        if line.trim().is_empty() {
            continue;
        }
        let request: ApprovalRequest = serde_json::from_str(line).map_err(|_| ())?;
        requests.push(request);
    }
    Ok(requests)
}

/// Serialize the ledger.
pub fn render_ledger(requests: &[ApprovalRequest]) -> String {
    let mut out = String::new();
    for request in requests {
        out.push_str(&serde_json::to_string(request).expect("request serializes"));
        out.push('\n');
    }
    out
}

/// Process one webhook answer against the ledger.
pub fn process_answer(ledger: &[ApprovalRequest], answer: &WebhookAnswer) -> GatewayOutcome {
    let known = ledger.iter().any(|r| r.intent_id == answer.intent_id);
    if !known {
        return GatewayOutcome::UnknownIntent;
    }
    GatewayOutcome::Routed {
        allow: answer.allow,
    }
}

/// Process an answer when the ledger text may be corrupt: corruption is a
/// fail-closed deny, never a pass-through.
pub fn process_answer_checked(ledger_text: &str, answer: &WebhookAnswer) -> GatewayOutcome {
    match load_ledger(ledger_text) {
        Ok(ledger) => process_answer(&ledger, answer),
        Err(()) => GatewayOutcome::CorruptDeny,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use nofy_control_schema::methods::ApprovalDecision;
    use nofy_daemon::approval::ApprovalBroker;
    use std::sync::Arc;
    use std::time::Duration;

    fn request(intent: &str, high_risk: bool) -> ApprovalRequest {
        ApprovalRequest {
            intent_id: intent.into(),
            summary: format!("{intent} summary"),
            high_risk,
        }
    }

    fn answer(intent: &str, allow: bool) -> WebhookAnswer {
        WebhookAnswer {
            intent_id: intent.into(),
            allow,
            surface: "webhook:ops-channel".into(),
        }
    }

    #[test]
    fn webhook_answer_completes_high_risk_approval_through_real_broker() {
        // The proposition: a NON-TUI surface completes one high-risk
        // approval via the real daemon broker.
        let broker = Arc::new(ApprovalBroker::new());
        let ledger = vec![request("rm-prod-db", true)];
        assert!(broker.register("rm-prod-db", "drop production database"));

        // The requester blocks (as the shell tool pipeline would).
        let waiter_broker = broker.clone();
        let waiter = std::thread::spawn(move || {
            let decision = waiter_broker.wait("rm-prod-db", Duration::from_secs(5));
            waiter_broker.settle("rm-prod-db");
            decision
        });

        // A webhook answer arrives (outside the TUI) and is routed.
        let webhook = answer("rm-prod-db", false); // ops says NO
        assert_eq!(
            process_answer(&ledger, &webhook),
            GatewayOutcome::Routed { allow: false }
        );
        assert!(broker.respond("rm-prod-db", ApprovalDecision::Deny));
        assert_eq!(waiter.join().unwrap(), Some(ApprovalDecision::Deny));
        assert_eq!(broker.pending_count(), 0);
    }

    #[test]
    fn allow_path_routes_allow_once() {
        let broker = Arc::new(ApprovalBroker::new());
        let ledger = vec![request("deploy", true)];
        broker.register("deploy", "deploy to prod");
        let waiter_broker = broker.clone();
        let waiter =
            std::thread::spawn(move || waiter_broker.wait("deploy", Duration::from_secs(5)));

        let webhook = answer("deploy", true);
        assert_eq!(
            process_answer(&ledger, &webhook),
            GatewayOutcome::Routed { allow: true }
        );
        broker.respond("deploy", ApprovalDecision::AllowOnce);
        assert_eq!(waiter.join().unwrap(), Some(ApprovalDecision::AllowOnce));
    }

    #[test]
    fn unknown_intent_is_rejected() {
        let ledger = vec![request("known", true)];
        assert_eq!(
            process_answer(&ledger, &answer("ghost", true)),
            GatewayOutcome::UnknownIntent
        );
    }

    #[test]
    fn corrupt_ledger_fails_closed() {
        let good = render_ledger(&[request("i1", true)]);
        assert_eq!(
            process_answer_checked(&good, &answer("i1", true)),
            GatewayOutcome::Routed { allow: true }
        );
        // Torn/corrupt jsonl: deny, never pass-through.
        let mut corrupt = good.clone();
        corrupt.push_str("{\"intent_id\": \"i1\", \"high_risk\": tru");
        assert_eq!(
            process_answer_checked(&corrupt, &answer("i1", true)),
            GatewayOutcome::CorruptDeny
        );
    }

    #[test]
    fn ledger_roundtrips() {
        let requests = vec![request("a", true), request("b", false)];
        let text = render_ledger(&requests);
        assert_eq!(load_ledger(&text), Ok(requests));
    }

    #[test]
    fn blank_ledger_lines_are_skipped() {
        // 空行/纯空白行不是损坏:跳过,不拒绝加载。
        let mut text = render_ledger(&[request("a", true)]);
        text.push_str("\n   \n");
        assert_eq!(load_ledger(&text), Ok(vec![request("a", true)]));
    }
}
