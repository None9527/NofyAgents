//! Device identity + capability declaration (FR2.6/FR2.7, OC-F14/OC-F15).
//!
//! - **Identity = public-key derivation**: a device's identity is the
//!   BLAKE3 digest of its Ed25519 public key — no registry, no shared
//!   secret, identity cannot be forged without the key.
//! - **Challenge signing**: authentication is a challenge-response; the
//!   device signs `nonce || issued_at`, the verifier checks against the
//!   declared public key. Authentication lives at the transport edge only.
//! - **Caps declaration**: a device declares capabilities up front; a
//!   session may only NARROW them (runtime approval never widens —
//!   OC-F15, the same discipline as `nofy_orchestra::caps`).

use nofy_orchestra::caps::SubagentCapabilities;
use ring::rand::SystemRandom;
use ring::signature::{Ed25519KeyPair, KeyPair, UnparsedPublicKey, ED25519};

/// Derive the device identity from its public key.
pub fn device_id(public_key: &[u8]) -> String {
    let digest = blake3::hash(public_key);
    digest.to_hex()[..16].to_string()
}

/// One authentication challenge.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Challenge {
    pub nonce: [u8; 32],
    pub issued_at: u64,
}

impl Challenge {
    pub fn new(issued_at: u64) -> Self {
        let rng = SystemRandom::new();
        let mut nonce = [0u8; 32];
        ring::rand::SecureRandom::fill(&rng, &mut nonce)
            .expect("system RNG available");
        Self { nonce, issued_at }
    }

    /// The bytes that get signed: nonce || issued_at (big-endian).
    pub fn signing_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::with_capacity(40);
        bytes.extend_from_slice(&self.nonce);
        bytes.extend_from_slice(&self.issued_at.to_be_bytes());
        bytes
    }
}

/// Generate a fresh Ed25519 keypair (provisioning/tests).
pub fn generate_keypair() -> (Vec<u8>, Ed25519KeyPair) {
    let rng = SystemRandom::new();
    let document = Ed25519KeyPair::generate_pkcs8(&rng).expect("keygen");
    let keypair = Ed25519KeyPair::from_pkcs8(document.as_ref()).expect("valid document");
    (keypair.public_key().as_ref().to_vec(), keypair)
}

/// Sign a challenge with the device key.
pub fn sign_challenge(keypair: &Ed25519KeyPair, challenge: &Challenge) -> Vec<u8> {
    keypair.sign(&challenge.signing_bytes()).as_ref().to_vec()
}

/// Verify a challenge signature against the declared public key.
pub fn verify_challenge(public_key: &[u8], challenge: &Challenge, signature: &[u8]) -> bool {
    UnparsedPublicKey::new(&ED25519, public_key)
        .verify(&challenge.signing_bytes(), signature)
        .is_ok()
}

/// Session capability authorization: the intersection of declared caps and
/// the session's request — runtime can only narrow, never widen.
pub fn authorize_caps(
    declared: SubagentCapabilities,
    requested: SubagentCapabilities,
) -> SubagentCapabilities {
    SubagentCapabilities(declared.0 & requested.0)
}

#[cfg(test)]
mod tests {
    use super::*;
    use nofy_orchestra::caps::SubagentCapabilities as Caps;

    #[test]
    fn identity_is_derived_from_public_key() {
        let (public, _keypair) = generate_keypair();
        let id1 = device_id(&public);
        let id2 = device_id(&public);
        assert_eq!(id1, id2, "deterministic derivation");
        assert_eq!(id1.len(), 16);
        // A different key = a different identity.
        let (other_public, _) = generate_keypair();
        assert_ne!(device_id(&other_public), id1);
    }

    #[test]
    fn challenge_roundtrip_verifies() {
        let (public, keypair) = generate_keypair();
        let challenge = Challenge::new(1234);
        let signature = sign_challenge(&keypair, &challenge);
        assert!(verify_challenge(&public, &challenge, &signature));
    }

    #[test]
    fn tampered_challenge_or_signature_fails() {
        let (public, keypair) = generate_keypair();
        let challenge = Challenge::new(1234);
        let signature = sign_challenge(&keypair, &challenge);

        // Tampered timestamp.
        let mut forged = challenge.clone();
        forged.issued_at = 9999;
        assert!(!verify_challenge(&public, &forged, &signature));

        // Tampered signature.
        let mut bad_sig = signature.clone();
        bad_sig[0] ^= 0xff;
        assert!(!verify_challenge(&public, &challenge, &bad_sig));

        // Wrong key.
        let (other_public, _) = generate_keypair();
        assert!(!verify_challenge(&other_public, &challenge, &signature));
    }

    #[test]
    fn session_caps_only_narrow_declared() {
        let declared = Caps(Caps::READ | Caps::WRITE);
        // Requesting more than declared yields only the declared subset.
        let session = authorize_caps(declared, Caps::full());
        assert_eq!(session.0, declared.0, "cannot widen past declaration");
        // Requesting less narrows.
        let narrow = authorize_caps(declared, Caps(Caps::READ));
        assert_eq!(narrow.0, Caps::READ);
        assert!(narrow.is_narrowing_of(declared));
    }
}
