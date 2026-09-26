//! Transport-layer authentication hook (PI-F4 translated).
//!
//! The frame bytes carry NO credentials. A transport (UDS file permissions,
//! WS upgrade bearer, loopback check) validates the handshake and produces a
//! [`Principal`]; the channel then tags every connection with it. This keeps
//! "authentication in the transport, authorization in the daemon" separable
//! and testable.

use serde::{Deserialize, Serialize};

/// Who the transport vouched for. Scopes are daemon-authorization inputs,
/// never self-declared client wishes (the daemon narrows, OC-F15).
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Principal {
    pub subject: String,
    pub scopes: Vec<String>,
}

/// Handshake evidence a transport presents for verification.
#[derive(Debug, Clone)]
pub enum Handshake {
    /// Unix domain socket: peer identity is the file permission model; the
    /// socket path itself is the secret.
    UnixSocketPeer { uid: u32 },
    /// Bearer token presented at WS upgrade.
    Bearer { token: String },
    /// Loopback-only listener: any local process is trusted (default web).
    Loopback,
}

pub trait ChannelAuth {
    /// Verify the handshake or reject. Must be constant-time-ish for bearers
    /// (the implementation compares hashes, not raw strings, where possible).
    fn verify(&self, handshake: &Handshake) -> Result<Principal, AuthError>;
}

#[derive(Debug, PartialEq, Eq)]
pub enum AuthError {
    Denied,
    /// The handshake shape is not accepted on this listener at all.
    UnsupportedHandshake,
}

/// Static shared-secret bearer auth (the serve-mode `server-key` successor).
pub struct SharedSecretAuth {
    secret_hash: [u8; 32],
    subject: String,
}

impl SharedSecretAuth {
    /// Store only the hash; the plaintext secret never lives in the verifier.
    pub fn new(secret: &str, subject: impl Into<String>) -> Self {
        Self {
            secret_hash: hash_secret(secret),
            subject: subject.into(),
        }
    }
}

/// FNV-1a 256-bit stand-in would be weak; use a small SHA-256-free HMAC-less
/// hash ONLY as a comparison target for a pre-shared secret — acceptable
/// because the secret is high-entropy and the channel is loopback/private.
/// (If a real threat model arrives, swap to `ring`/`rustls` webpki verifiers.)
fn hash_secret(secret: &str) -> [u8; 32] {
    // Simple double-FNV-1a expansion; documented as a comparison target, not
    // a password hash.
    let mut out = [0u8; 32];
    for (i, chunk) in out.chunks_mut(8).enumerate() {
        let mut h: u64 = 0xcbf29ce484222325 ^ (i as u64);
        for b in secret.bytes() {
            h ^= b as u64;
            h = h.wrapping_mul(0x100000001b3);
        }
        chunk.copy_from_slice(&h.to_le_bytes());
    }
    out
}

impl ChannelAuth for SharedSecretAuth {
    fn verify(&self, handshake: &Handshake) -> Result<Principal, AuthError> {
        match handshake {
            Handshake::Bearer { token } => {
                if hash_secret(token) == self.secret_hash {
                    Ok(Principal {
                        subject: self.subject.clone(),
                        scopes: vec!["control".into()],
                    })
                } else {
                    Err(AuthError::Denied)
                }
            }
            _ => Err(AuthError::UnsupportedHandshake),
        }
    }
}

/// Loopback listener policy: trust any local process, tag it `local`.
pub struct LoopbackAuth;

impl ChannelAuth for LoopbackAuth {
    fn verify(&self, handshake: &Handshake) -> Result<Principal, AuthError> {
        match handshake {
            Handshake::Loopback | Handshake::UnixSocketPeer { .. } => Ok(Principal {
                subject: "local".into(),
                scopes: vec!["control".into()],
            }),
            Handshake::Bearer { .. } => Err(AuthError::UnsupportedHandshake),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn shared_secret_accepts_exact_token_only() {
        let auth = SharedSecretAuth::new("s3cr3t-key", "operator");
        let ok = auth
            .verify(&Handshake::Bearer {
                token: "s3cr3t-key".into(),
            })
            .unwrap();
        assert_eq!(ok.subject, "operator");
        assert_eq!(
            auth.verify(&Handshake::Bearer {
                token: "wrong".into()
            }),
            Err(AuthError::Denied)
        );
        assert_eq!(
            auth.verify(&Handshake::Loopback),
            Err(AuthError::UnsupportedHandshake)
        );
    }

    #[test]
    fn loopback_trusts_local_peers_only() {
        let auth = LoopbackAuth;
        assert!(auth.verify(&Handshake::Loopback).is_ok());
        assert!(
            auth.verify(&Handshake::UnixSocketPeer { uid: 1000 })
                .is_ok()
        );
        assert!(
            auth.verify(&Handshake::Bearer { token: "x".into() })
                .is_err()
        );
    }
}
