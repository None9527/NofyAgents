//! The webhook surface (FR13.3): signed deliveries, envelope unwrap,
//! approval routing, dedupe.
//!
//! Inbound webhook deliveries are UNTRUSTED until three gates pass:
//! signature (the sender holds the shared secret), envelope well-formedness
//! (no frame escape), and dedupe (at-least-once senders must not double-
//! fire). Only then is the payload routed — an approval answer goes to the
//! approval path, anything else is refused (the webhook surface answers
//! approvals; it does not execute).

use nofy_governance::envelope::{FRAME_BEGIN, is_well_formed, unwrap};

/// A registered webhook endpoint.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct WebhookEndpoint {
    pub endpoint_id: String,
    /// Shared secret for delivery signatures.
    pub secret: String,
}

/// One inbound delivery.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct WebhookDelivery {
    pub delivery_id: String,
    /// Enveloped payload.
    pub body: String,
    /// Signature: keyed digest over the body.
    pub signature: String,
}

/// Sign a delivery body with the endpoint secret (sender side). The key is
/// derived from the secret by BLAKE3, so any secret length is safe.
pub fn sign_body(secret: &str, body: &str) -> String {
    let key = blake3::hash(secret.as_bytes());
    let mut hasher = blake3::Hasher::new_keyed(key.as_bytes());
    hasher.update(body.as_bytes());
    hasher.finalize().to_hex().to_string()
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum DeliveryVerdict {
    /// Signature valid, envelope well-formed, not a duplicate.
    Accepted { payload: String },
    BadSignature,
    MalformedEnvelope,
    Duplicate,
}

/// The surface state: seen deliveries (dedupe ledger).
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct WebhookSurface {
    seen: std::collections::BTreeSet<String>,
}

impl WebhookSurface {
    /// Gate one delivery.
    pub fn receive(&mut self, endpoint: &WebhookEndpoint, delivery: &WebhookDelivery) -> DeliveryVerdict {
        // Gate 1: signature.
        let expected = sign_body(&endpoint.secret, &delivery.body);
        if expected != delivery.signature {
            return DeliveryVerdict::BadSignature;
        }
        // Gate 2: envelope well-formedness.
        if !is_well_formed(&delivery.body) {
            return DeliveryVerdict::MalformedEnvelope;
        }
        // Gate 3: dedupe.
        if !self.seen.insert(delivery.delivery_id.clone()) {
            return DeliveryVerdict::Duplicate;
        }
        let payload = unwrap(&delivery.body).unwrap_or_default().to_string();
        DeliveryVerdict::Accepted { payload }
    }

    pub fn processed_count(&self) -> usize {
        self.seen.len()
    }
}

/// Route an accepted payload: only approval answers are in scope.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RouteOutcome {
    ApprovalAnswer { intent_id: String, allow: bool },
    RefusedOutOfScope,
}

/// Parse a payload of the form `approve <intent>` / `deny <intent>`.
pub fn route_payload(payload: &str) -> RouteOutcome {
    let mut parts = payload.trim().splitn(2, ' ');
    let verb = parts.next().unwrap_or_default();
    let intent_id = parts.next().unwrap_or_default().trim().to_string();
    if intent_id.is_empty() {
        return RouteOutcome::RefusedOutOfScope;
    }
    match verb {
        "approve" => RouteOutcome::ApprovalAnswer { intent_id, allow: true },
        "deny" => RouteOutcome::ApprovalAnswer { intent_id, allow: false },
        _ => RouteOutcome::RefusedOutOfScope,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn endpoint() -> WebhookEndpoint {
        WebhookEndpoint {
            endpoint_id: "ops".into(),
            secret: "s3cret-secret-value-0123456789ab".into(),
        }
    }

    fn signed_delivery(id: &str, payload: &str, secret: &str) -> WebhookDelivery {
        let body = format!("{FRAME_BEGIN} [webhook]\n{payload}\n=====END UNTRUSTED CONTENT=====");
        let signature = sign_body(secret, &body);
        WebhookDelivery { delivery_id: id.into(), body, signature }
    }

    #[test]
    fn signed_delivery_is_accepted_and_routed() {
        let mut surface = WebhookSurface::default();
        let delivery = signed_delivery("d1", "approve rm-prod-db", &endpoint().secret);
        match surface.receive(&endpoint(), &delivery) {
            DeliveryVerdict::Accepted { payload } => {
                assert_eq!(route_payload(&payload), RouteOutcome::ApprovalAnswer {
                    intent_id: "rm-prod-db".into(),
                    allow: true,
                });
            }
            other => panic!("expected Accepted, got {other:?}"),
        }
    }

    #[test]
    fn bad_signature_refused() {
        let mut surface = WebhookSurface::default();
        let mut delivery = signed_delivery("d1", "approve x", &endpoint().secret);
        delivery.signature = "forged".into();
        assert_eq!(surface.receive(&endpoint(), &delivery), DeliveryVerdict::BadSignature);
        assert_eq!(surface.processed_count(), 0);
    }

    #[test]
    fn malformed_envelope_refused() {
        let mut surface = WebhookSurface::default();
        let body = "no envelope here";
        let delivery = WebhookDelivery {
            delivery_id: "d2".into(),
            body: body.into(),
            signature: sign_body(&endpoint().secret, body),
        };
        assert_eq!(surface.receive(&endpoint(), &delivery), DeliveryVerdict::MalformedEnvelope);
    }

    #[test]
    fn duplicate_delivery_deduped() {
        let mut surface = WebhookSurface::default();
        let delivery = signed_delivery("d1", "deny x", &endpoint().secret);
        assert!(matches!(surface.receive(&endpoint(), &delivery), DeliveryVerdict::Accepted { .. }));
        assert_eq!(surface.receive(&endpoint(), &delivery), DeliveryVerdict::Duplicate);
        assert_eq!(surface.processed_count(), 1);
    }

    #[test]
    fn out_of_scope_payloads_refused() {
        assert_eq!(route_payload("execute rm -rf /"), RouteOutcome::RefusedOutOfScope);
        assert_eq!(route_payload("approve"), RouteOutcome::RefusedOutOfScope);
        assert_eq!(
            route_payload("deny del-1"),
            RouteOutcome::ApprovalAnswer { intent_id: "del-1".into(), allow: false }
        );
    }
}
