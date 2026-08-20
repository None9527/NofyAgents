//! Surface gateway (integration Q5): the daemon's multi-surface seam
//! over `nofy-surfaces` (FR13.3/13.4).
//!
//! - **Webhook in**: deliveries pass the surface's three gates
//!   (signature / envelope / dedupe); an accepted payload routes ONLY
//!   approval answers into the broker — the webhook surface answers
//!   approvals, it never executes;
//! - **IM out/in**: approval cards render from batch Asks; replies
//!   normalize, parse, and land as broker decisions.

use std::collections::BTreeMap;

use nofy_control_schema::methods::ApprovalDecision;
use nofy_orchestra::batchapproval::{BatchAsk, ItemDecision};
use nofy_surfaces::im::{self, ApprovalCard, ImDecision, ImKind};
use nofy_surfaces::webhook::{
    DeliveryVerdict, RouteOutcome, WebhookDelivery, WebhookEndpoint, WebhookSurface, route_payload,
};

use crate::approval::ApprovalBroker;

/// The daemon-side surface gateway.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct SurfaceGateway {
    webhook: WebhookSurface,
    endpoints: BTreeMap<String, WebhookEndpoint>,
}

/// What happened to one inbound surface message.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum GatewayOutcome {
    /// One approval answer landed in the broker.
    Answered { intent_id: String },
    /// An `approve all` / `deny all` landed for every pending intent.
    AnsweredAll { count: usize },
    /// A gate refused the message (reason is audit-visible).
    Rejected { reason: String },
    /// Accepted by the gates but not an approval answer.
    OutOfScope,
    /// No such endpoint registered.
    UnknownEndpoint,
    /// The IM reply was not a decision.
    NotADecision,
}

fn decision_to_broker(decision: ItemDecision) -> ApprovalDecision {
    match decision {
        ItemDecision::Approved => ApprovalDecision::AllowOnce,
        ItemDecision::Denied => ApprovalDecision::Deny,
        // Pending is not a decision; the parser never yields it.
        ItemDecision::Pending => ApprovalDecision::Deny,
    }
}

impl SurfaceGateway {
    pub fn new() -> Self {
        Self::default()
    }

    /// Register a webhook endpoint (shared-secret surface).
    pub fn register_endpoint(&mut self, endpoint_id: &str, secret: &str) {
        self.endpoints.insert(
            endpoint_id.to_string(),
            WebhookEndpoint {
                endpoint_id: endpoint_id.to_string(),
                secret: secret.to_string(),
            },
        );
    }

    /// Inbound webhook delivery: three gates → route → broker.
    pub fn receive_webhook(
        &mut self,
        endpoint_id: &str,
        delivery: &WebhookDelivery,
        broker: &ApprovalBroker,
    ) -> GatewayOutcome {
        let Some(endpoint) = self.endpoints.get(endpoint_id) else {
            return GatewayOutcome::UnknownEndpoint;
        };
        match self.webhook.receive(endpoint, delivery) {
            DeliveryVerdict::Accepted { payload } => match route_payload(&payload) {
                RouteOutcome::ApprovalAnswer { intent_id, allow } => {
                    let decision = if allow {
                        ApprovalDecision::AllowOnce
                    } else {
                        ApprovalDecision::Deny
                    };
                    if broker.respond(&intent_id, decision) {
                        GatewayOutcome::Answered { intent_id }
                    } else {
                        GatewayOutcome::Rejected {
                            reason: format!("unknown or settled intent {intent_id}"),
                        }
                    }
                }
                RouteOutcome::RefusedOutOfScope => GatewayOutcome::OutOfScope,
            },
            DeliveryVerdict::BadSignature => GatewayOutcome::Rejected {
                reason: "bad signature".into(),
            },
            DeliveryVerdict::MalformedEnvelope => GatewayOutcome::Rejected {
                reason: "malformed envelope".into(),
            },
            DeliveryVerdict::Duplicate => GatewayOutcome::Rejected {
                reason: "duplicate delivery".into(),
            },
        }
    }

    /// Outbound IM: render the approval card for a batch Ask.
    pub fn im_card(channel: ImKind, ask: &BatchAsk) -> ApprovalCard {
        im::format_approval_card(channel, ask)
    }

    /// Inbound IM reply: normalize → parse → broker, against the
    /// pending intents in card order (1-based).
    pub fn im_reply(
        &mut self,
        channel: ImKind,
        chat_id: &str,
        raw: &str,
        pending_intents: &[String],
        broker: &ApprovalBroker,
    ) -> GatewayOutcome {
        let message = im::normalize_message(channel, chat_id, raw);
        match im::parse_reply(&message) {
            ImDecision::NotADecision => GatewayOutcome::NotADecision,
            ImDecision::Item { index, decision } => {
                let Some(intent_id) = pending_intents.get(index - 1) else {
                    return GatewayOutcome::Rejected {
                        reason: format!("card has no item {index}"),
                    };
                };
                if broker.respond(intent_id, decision_to_broker(decision)) {
                    GatewayOutcome::Answered { intent_id: intent_id.clone() }
                } else {
                    GatewayOutcome::Rejected {
                        reason: format!("unknown or settled intent {intent_id}"),
                    }
                }
            }
            ImDecision::All { decision } => {
                let mut count = 0;
                for intent_id in pending_intents {
                    if broker.respond(intent_id, decision_to_broker(decision)) {
                        count += 1;
                    }
                }
                GatewayOutcome::AnsweredAll { count }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use nofy_governance::envelope::frame_untrusted;
    use nofy_surfaces::webhook::sign_body;

    fn delivery(secret: &str, id: &str, payload: &str) -> WebhookDelivery {
        let body = frame_untrusted("webhook", payload);
        WebhookDelivery {
            delivery_id: id.into(),
            signature: sign_body(secret, &body),
            body,
        }
    }

    #[test]
    fn webhook_approval_answer_completes_the_round_trip() {
        let broker = ApprovalBroker::new();
        assert!(broker.register("i1", "rm -rf cache"));
        let mut gw = SurfaceGateway::new();
        gw.register_endpoint("ep1", "shhh");
        let outcome = gw.receive_webhook("ep1", &delivery("shhh", "d1", "approve i1"), &broker);
        assert_eq!(outcome, GatewayOutcome::Answered { intent_id: "i1".into() });
        // The waiter sees the allow.
        let got = broker.wait("i1", std::time::Duration::from_millis(50));
        assert_eq!(got, Some(ApprovalDecision::AllowOnce));
    }

    #[test]
    fn webhook_gates_refuse_before_the_broker() {
        let broker = ApprovalBroker::new();
        assert!(broker.register("i1", "x"));
        let mut gw = SurfaceGateway::new();
        gw.register_endpoint("ep1", "shhh");
        // Bad signature.
        let mut bad = delivery("shhh", "d1", "approve i1");
        bad.signature = "forged".into();
        assert_eq!(
            gw.receive_webhook("ep1", &bad, &broker),
            GatewayOutcome::Rejected { reason: "bad signature".into() }
        );
        // Duplicate (same delivery id after an accepted one).
        let ok = delivery("shhh", "d2", "deny i1");
        assert_eq!(
            gw.receive_webhook("ep1", &ok, &broker),
            GatewayOutcome::Answered { intent_id: "i1".into() }
        );
        assert_eq!(
            gw.receive_webhook("ep1", &ok, &broker),
            GatewayOutcome::Rejected { reason: "duplicate delivery".into() }
        );
        // Unknown endpoint.
        assert_eq!(
            gw.receive_webhook("ghost", &delivery("shhh", "d3", "approve i1"), &broker),
            GatewayOutcome::UnknownEndpoint
        );
    }

    #[test]
    fn webhook_out_of_scope_payload_never_reaches_the_broker() {
        let broker = ApprovalBroker::new();
        let mut gw = SurfaceGateway::new();
        gw.register_endpoint("ep1", "shhh");
        let outcome = gw.receive_webhook("ep1", &delivery("shhh", "d1", "hello world"), &broker);
        assert_eq!(outcome, GatewayOutcome::OutOfScope);
        assert_eq!(broker.pending_count(), 0);
    }

    #[test]
    fn im_card_renders_and_reply_decides_by_number() {
        let ask = BatchAsk {
            batch_id: "b1".into(),
            lines: vec!["[mv-1] move logs".into(), "[del-1] trash dupes".into()],
            high_risk_count: 1,
        };
        let card = SurfaceGateway::im_card(ImKind::Feishu, &ask);
        assert!(card.lines.iter().any(|l| l.contains("mv-1")));
        assert!(card.hint.contains("approve <n>"));
        // Reply "approve 2" decides the second pending intent.
        let broker = ApprovalBroker::new();
        assert!(broker.register("mv-1", "x"));
        assert!(broker.register("del-1", "y"));
        let mut gw = SurfaceGateway::new();
        let pending = vec!["mv-1".to_string(), "del-1".to_string()];
        let outcome =
            gw.im_reply(ImKind::Feishu, "chat", "@nofy-bot approve 2", &pending, &broker);
        assert_eq!(outcome, GatewayOutcome::Answered { intent_id: "del-1".into() });
        assert_eq!(
            broker.wait("del-1", std::time::Duration::from_millis(50)),
            Some(ApprovalDecision::AllowOnce)
        );
    }

    #[test]
    fn im_approve_all_decides_every_pending_intent() {
        let broker = ApprovalBroker::new();
        assert!(broker.register("a", "x"));
        assert!(broker.register("b", "y"));
        let mut gw = SurfaceGateway::new();
        let pending = vec!["a".to_string(), "b".to_string()];
        let outcome = gw.im_reply(ImKind::Telegram, "chat", "approve all", &pending, &broker);
        assert_eq!(outcome, GatewayOutcome::AnsweredAll { count: 2 });
    }

    #[test]
    fn im_non_decisions_and_bad_indices_are_refused() {
        let broker = ApprovalBroker::new();
        assert!(broker.register("a", "x"));
        let mut gw = SurfaceGateway::new();
        let pending = vec!["a".to_string()];
        assert_eq!(
            gw.im_reply(ImKind::Feishu, "chat", "maybe later", &pending, &broker),
            GatewayOutcome::NotADecision
        );
        assert_eq!(
            gw.im_reply(ImKind::Feishu, "chat", "approve 9", &pending, &broker),
            GatewayOutcome::Rejected { reason: "card has no item 9".into() }
        );
        assert_eq!(broker.pending_count(), 1, "nothing was decided");
    }

    #[test]
    fn im_deny_reply_decides_through_the_broker() {
        let broker = ApprovalBroker::new();
        assert!(broker.register("a", "x"));
        let mut gw = SurfaceGateway::new();
        let pending = vec!["a".to_string()];
        let outcome = gw.im_reply(ImKind::Telegram, "chat", "deny 1", &pending, &broker);
        assert_eq!(outcome, GatewayOutcome::Answered { intent_id: "a".into() });
        assert_eq!(
            broker.wait("a", std::time::Duration::from_millis(50)),
            Some(ApprovalDecision::Deny)
        );
    }

    #[test]
    fn pending_is_mapped_to_deny_defensively() {
        // The parser never yields Pending; the mapping is fail-closed anyway.
        assert_eq!(decision_to_broker(ItemDecision::Pending), ApprovalDecision::Deny);
    }

    #[test]
    fn webhook_answer_for_unknown_intent_is_rejected_audibly() {
        let broker = ApprovalBroker::new();
        let mut gw = SurfaceGateway::new();
        gw.register_endpoint("ep1", "shhh");
        let outcome =
            gw.receive_webhook("ep1", &delivery("shhh", "d1", "approve ghost"), &broker);
        assert_eq!(
            outcome,
            GatewayOutcome::Rejected {
                reason: "unknown or settled intent ghost".into()
            }
        );
    }

    #[test]
    fn malformed_envelope_is_refused_by_the_gate() {
        // Signature valid over a body that is not an envelope: the envelope
        // gate refuses after the signature gate passes.
        let broker = ApprovalBroker::new();
        let mut gw = SurfaceGateway::new();
        gw.register_endpoint("ep1", "shhh");
        let body = "garbage, not an envelope".to_string();
        let delivery = WebhookDelivery {
            delivery_id: "d1".into(),
            signature: sign_body("shhh", &body),
            body,
        };
        assert_eq!(
            gw.receive_webhook("ep1", &delivery, &broker),
            GatewayOutcome::Rejected { reason: "malformed envelope".into() }
        );
    }

    #[test]
    fn im_reply_for_unknown_intent_is_rejected_audibly() {
        let broker = ApprovalBroker::new();
        let mut gw = SurfaceGateway::new();
        let pending = vec!["ghost".to_string()];
        let outcome = gw.im_reply(ImKind::Feishu, "chat", "approve 1", &pending, &broker);
        assert_eq!(
            outcome,
            GatewayOutcome::Rejected {
                reason: "unknown or settled intent ghost".into()
            }
        );
    }
}
