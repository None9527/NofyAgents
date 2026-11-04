//! Trust grants are independent from portable deployments and live credentials.
use super::*;
use base64::{Engine, engine::general_purpose::STANDARD};
use ed25519_dalek::{Signature, Signer, SigningKey, VerifyingKey};
use nofy_agent_runtime::system::content_digest;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
mod fetch;
mod store;
#[cfg(all(test, target_os = "linux", target_arch = "x86_64"))]
mod tests;
pub use store::{
    Acquisition, AcquisitionPage, AcquisitionState, BootstrapSource, SourceEntry, SourcePage,
    SourceStore, SourceView,
};
fn invalid(message: impl Into<String>) -> HostError {
    HostError::Invalid(message.into())
}
pub(super) fn name(value: &str) -> Result<()> {
    if value.is_empty()
        || value.len() > 128
        || !value
            .bytes()
            .all(|c| c.is_ascii_alphanumeric() || b"_-".contains(&c))
    {
        return Err(invalid(
            "source identifiers require 1..=128 ASCII letters/digits/_/-",
        ));
    }
    Ok(())
}
pub(super) fn fixed<const N: usize>(value: &str) -> Result<[u8; N]> {
    if value.len() > 1024 {
        return Err(invalid("source key/signature exceeds limit"));
    }
    let bytes = STANDARD
        .decode(value)
        .map_err(|_| invalid("invalid source key/signature encoding"))?;
    if STANDARD.encode(&bytes) != value {
        return Err(invalid("noncanonical source key/signature encoding"));
    }
    bytes
        .try_into()
        .map_err(|_| invalid("source key/signature length mismatch"))
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SourcePolicy {
    pub base_url: String,
    pub keys: BTreeMap<String, String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub credential_ref: Option<String>,
    #[serde(default)]
    pub allow_loopback_http: bool,
}
impl SourcePolicy {
    pub fn validate(&self) -> Result<reqwest::Url> {
        if self.base_url.len() > 2048 || self.keys.is_empty() || self.keys.len() > 16 {
            return Err(invalid("source origin/key count invalid"));
        }
        let base =
            reqwest::Url::parse(&self.base_url).map_err(|_| invalid("invalid source origin"))?;
        let loopback = matches!(base.host(),Some(url::Host::Ipv4(ip)) if ip.is_loopback())
            || matches!(base.host(),Some(url::Host::Ipv6(ip)) if ip.is_loopback());
        if !base.username().is_empty()
            || base.password().is_some()
            || base.query().is_some()
            || base.fragment().is_some()
            || base.host().is_none()
            || !base.path().ends_with('/')
            || base.path().contains('%')
            || base.as_str() != self.base_url
            || !(base.scheme() == "https"
                || (base.scheme() == "http" && self.allow_loopback_http && loopback))
        {
            return Err(invalid(
                "source requires a canonical HTTPS directory origin, or explicit numeric loopback HTTP",
            ));
        }
        for (id, key) in &self.keys {
            name(id)?;
            let key = VerifyingKey::from_bytes(&fixed(key)?)
                .map_err(|_| invalid("invalid Ed25519 public key"))?;
            if key.is_weak() {
                return Err(invalid("weak Ed25519 public key"));
            }
        }
        if self.credential_ref.as_ref().is_some_and(|s| {
            s.is_empty()
                || s.len() > 128
                || !s.bytes().all(|c| c.is_ascii_alphanumeric() || c == b'_')
        }) {
            return Err(invalid("invalid source credential reference"));
        }
        Ok(base)
    }
    pub fn digest(&self) -> Result<String> {
        self.validate()?;
        Ok(content_digest(self)?)
    }
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ImageAttestation {
    pub manifest_digest: String,
    pub payload_digest: String,
    pub payload_size: u64,
    pub key_id: String,
    pub signature: String,
}
impl ImageAttestation {
    fn message(&self) -> Result<Vec<u8>> {
        Ok(serde_json::to_vec(&(
            "nofy.runtime-image.source/v1",
            &self.manifest_digest,
            &self.payload_digest,
            self.payload_size,
            &self.key_id,
        ))
        .map_err(storage::unavailable)?)
    }
    pub fn validate(&self) -> Result<()> {
        storage::digest(&self.manifest_digest)?;
        storage::digest(&self.payload_digest)?;
        name(&self.key_id)?;
        fixed::<64>(&self.signature)?;
        if self.payload_size == 0 || self.payload_size > images::MAX_WIRE {
            return Err(invalid("source payload size invalid"));
        }
        Ok(())
    }
    pub fn verify(&self, policy: &SourcePolicy) -> Result<()> {
        self.validate()?;
        policy.validate()?;
        let encoded = policy
            .keys
            .get(&self.key_id)
            .ok_or_else(|| invalid("source signing key is not authorized"))?;
        let key = VerifyingKey::from_bytes(&fixed(encoded)?)
            .map_err(|_| invalid("invalid source public key"))?;
        key.verify_strict(
            &self.message()?,
            &Signature::from_bytes(&fixed(&self.signature)?),
        )
        .map_err(|_| invalid("source signature rejected"))
    }
    /// Signs exact transport bytes, after verifying the complete image closure.
    pub fn sign(payload: &[u8], key_id: String, seed: &[u8; 32]) -> Result<(Self, String)> {
        if payload.len() as u64 > images::MAX_WIRE {
            return Err(invalid("image signing input exceeds 24 MiB"));
        }
        name(&key_id)?;
        let image: images::RuntimeImage =
            serde_json::from_slice(payload).map_err(|_| invalid("invalid image signing input"))?;
        image.validate()?;
        let key = SigningKey::from_bytes(seed);
        let mut claim = Self {
            manifest_digest: image.manifest.digest()?,
            payload_digest: storage::hash(payload),
            payload_size: payload.len() as u64,
            key_id,
            signature: String::new(),
        };
        claim.signature = STANDARD.encode(key.sign(&claim.message()?).to_bytes());
        Ok((claim, STANDARD.encode(key.verifying_key().to_bytes())))
    }
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AcquireImage {
    pub command_id: String,
    pub source: String,
    pub policy_digest: String,
    pub path: String,
    pub attestation: ImageAttestation,
}
impl AcquireImage {
    pub fn validate(&self) -> Result<()> {
        name(&self.command_id)?;
        name(&self.source)?;
        storage::digest(&self.policy_digest)?;
        self.attestation.validate()?;
        nofy_agent_runtime::artifact::entry_path(&self.path)?;
        if !self
            .path
            .bytes()
            .all(|c| c.is_ascii_alphanumeric() || b"/._-".contains(&c))
        {
            return Err(invalid(
                "source path requires plain normalized URL segments",
            ));
        }
        Ok(())
    }
    pub fn digest(&self) -> Result<String> {
        self.validate()?;
        Ok(content_digest(self)?)
    }
}
