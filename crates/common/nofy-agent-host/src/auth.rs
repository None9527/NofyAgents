use crate::{HostError, Result};
use axum::http::HeaderMap;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::BTreeSet;

#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Scope {
    Read,
    Edit,
    Publish,
    Resources,
    Execute,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct AccessKeyReference {
    pub token_env: String,
    pub scopes: BTreeSet<Scope>,
}
struct Key {
    digest: [u8; 32],
    scopes: BTreeSet<Scope>,
}
pub struct Authorizer {
    keys: Vec<Key>,
}
impl Authorizer {
    pub fn new(keys: Vec<(String, BTreeSet<Scope>)>) -> Result<Self> {
        if keys.is_empty() || keys.len() > 64 {
            return Err(HostError::Invalid("1..=64 access keys required".into()));
        }
        let mut result = Vec::new();
        let mut seen = BTreeSet::new();
        for (token, scopes) in keys {
            if token.len() < 32
                || token.len() > 4096
                || token.bytes().any(|b| b.is_ascii_whitespace())
                || scopes.is_empty()
            {
                return Err(HostError::Invalid(
                    "access key requires 32..=4096 non-whitespace bytes and scopes".into(),
                ));
            }
            let digest: [u8; 32] = Sha256::digest(token.as_bytes()).into();
            if !seen.insert(digest) {
                return Err(HostError::Invalid("duplicate access key".into()));
            }
            result.push(Key { digest, scopes });
        }
        Ok(Self { keys: result })
    }
    pub fn from_environment(references: Vec<AccessKeyReference>) -> Result<Self> {
        let mut keys = Vec::new();
        for reference in references {
            if reference.token_env.is_empty()
                || reference.token_env.len() > 128
                || !reference
                    .token_env
                    .bytes()
                    .all(|b| b.is_ascii_alphanumeric() || b == b'_')
            {
                return Err(HostError::Invalid(
                    "invalid access key environment reference".into(),
                ));
            }
            let token = std::env::var(&reference.token_env).map_err(|_| {
                HostError::Invalid(format!(
                    "access key environment reference unavailable: {}",
                    reference.token_env
                ))
            })?;
            keys.push((token, reference.scopes));
        }
        Self::new(keys)
    }
    pub(crate) fn authenticate(&self, headers: &HeaderMap) -> Result<()> {
        self.check(headers, None)
    }
    pub(crate) fn require(&self, headers: &HeaderMap, scope: Scope) -> Result<()> {
        self.check(headers, Some(scope))
    }
    fn check(&self, headers: &HeaderMap, scope: Option<Scope>) -> Result<()> {
        let token = headers
            .get(axum::http::header::AUTHORIZATION)
            .and_then(|v| v.to_str().ok())
            .and_then(|s| s.strip_prefix("Bearer "))
            .filter(|s| s.len() <= 4096)
            .ok_or(HostError::Unauthorized)?;
        let digest: [u8; 32] = Sha256::digest(token.as_bytes()).into();
        let mut authenticated = false;
        let mut permitted = false;
        for key in &self.keys {
            let difference = key
                .digest
                .iter()
                .zip(digest)
                .fold(0u8, |v, (a, b)| v | (a ^ b));
            let matched = difference == 0;
            authenticated |= matched;
            permitted |= matched && scope.is_none_or(|scope| key.scopes.contains(&scope));
        }
        if !authenticated {
            Err(HostError::Unauthorized)
        } else if !permitted {
            Err(HostError::Forbidden)
        } else {
            Ok(())
        }
    }
}
