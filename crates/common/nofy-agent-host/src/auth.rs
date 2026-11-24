use crate::{HostError, Result};
use axum::http::HeaderMap;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::BTreeSet;
use zeroize::Zeroizing;

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
    development_scopes: Option<BTreeSet<Scope>>,
}

/// Branchless constant-time comparison of two 32-byte digests.
/// Returns `1` when equal and `0` otherwise.
pub(crate) fn ct_eq_digest(a: &[u8; 32], b: &[u8; 32]) -> u8 {
    let mut diff = 0u8;
    for i in 0..32 {
        diff |= std::hint::black_box(a[i] ^ b[i]);
    }
    let mut folded = std::hint::black_box(diff);
    folded |= folded >> 4;
    folded |= folded >> 2;
    folded |= folded >> 1;
    std::hint::black_box((folded ^ 1) & 1)
}

impl Authorizer {
    pub fn new(keys: Vec<(String, BTreeSet<Scope>)>) -> Result<Self> {
        let wrapped = keys
            .into_iter()
            .map(|(token, scopes)| (Zeroizing::new(token), scopes))
            .collect();
        Self::from_zeroizing(wrapped)
    }
    fn from_zeroizing(keys: Vec<(Zeroizing<String>, BTreeSet<Scope>)>) -> Result<Self> {
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
        Ok(Self {
            keys: result,
            development_scopes: None,
        })
    }
    pub fn default_development_scopes() -> BTreeSet<Scope> {
        BTreeSet::from([Scope::Read, Scope::Execute])
    }
    pub fn parse_development_scopes(items: &[String]) -> Result<BTreeSet<Scope>> {
        let mut scopes = BTreeSet::new();
        for raw in items {
            let name = raw.trim();
            if name.is_empty() {
                return Err(HostError::Invalid(
                    "--dev-web-scopes contains an empty scope".into(),
                ));
            }
            let scope = match name {
                "read" => Scope::Read,
                "execute" => Scope::Execute,
                "edit" => Scope::Edit,
                "publish" => Scope::Publish,
                _ => {
                    return Err(HostError::Invalid(format!(
                        "unsupported --dev-web-scopes value `{name}` (allowed: read, execute, edit, publish)"
                    )));
                }
            };
            scopes.insert(scope);
        }
        if scopes.is_empty() {
            return Err(HostError::Invalid(
                "--dev-web-scopes requires at least one scope".into(),
            ));
        }
        Ok(scopes)
    }
    pub fn development_with_scopes(scopes: BTreeSet<Scope>) -> Result<Self> {
        if scopes.is_empty() {
            return Err(HostError::Invalid(
                "development authorizer requires at least one scope".into(),
            ));
        }
        if scopes.contains(&Scope::Resources) {
            return Err(HostError::Invalid(
                "development authorizer cannot grant resources scope".into(),
            ));
        }
        Ok(Self {
            keys: Vec::new(),
            development_scopes: Some(scopes),
        })
    }
    #[cfg(test)]
    pub(crate) fn development() -> Self {
        Self {
            keys: Vec::new(),
            development_scopes: Some(Self::default_development_scopes()),
        }
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
            let token = Zeroizing::new(std::env::var(&reference.token_env).map_err(|_| {
                HostError::Invalid(format!(
                    "access key environment reference unavailable: {}",
                    reference.token_env
                ))
            })?);
            keys.push((token, reference.scopes));
        }
        Self::from_zeroizing(keys)
    }
    pub(crate) fn authenticate(&self, headers: &HeaderMap) -> Result<()> {
        self.check(headers, None)
    }
    pub(crate) fn grants(&self, headers: &HeaderMap) -> Result<BTreeSet<Scope>> {
        let mut granted = BTreeSet::new();
        for scope in [
            Scope::Read,
            Scope::Edit,
            Scope::Publish,
            Scope::Resources,
            Scope::Execute,
        ] {
            match self.require(headers, scope) {
                Ok(()) => {
                    granted.insert(scope);
                }
                Err(HostError::Forbidden) => {}
                Err(error) => return Err(error),
            }
        }
        Ok(granted)
    }
    pub(crate) fn require(&self, headers: &HeaderMap, scope: Scope) -> Result<()> {
        self.check(headers, Some(scope))
    }
    fn check(&self, headers: &HeaderMap, scope: Option<Scope>) -> Result<()> {
        if let Some(scopes) = &self.development_scopes {
            return if scope.is_none_or(|scope| scopes.contains(&scope)) {
                Ok(())
            } else {
                Err(HostError::Forbidden)
            };
        }
        let token = headers
            .get(axum::http::header::AUTHORIZATION)
            .and_then(|v| v.to_str().ok())
            .and_then(|s| s.strip_prefix("Bearer "))
            .filter(|s| s.len() <= 4096)
            .ok_or(HostError::Unauthorized)?;
        let digest: [u8; 32] = Sha256::digest(token.as_bytes()).into();
        let mut authenticated = 0u8;
        let mut permitted = 0u8;
        for key in &self.keys {
            let matched = ct_eq_digest(&key.digest, &digest);
            let has_scope = u8::from(scope.is_none_or(|scope| key.scopes.contains(&scope)));
            authenticated |= matched;
            permitted |= std::hint::black_box(matched & has_scope);
        }
        if authenticated == 0 {
            Err(HostError::Unauthorized)
        } else if permitted == 0 {
            Err(HostError::Forbidden)
        } else {
            Ok(())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ct_eq_digest_compares_accurately() {
        let a = [0x5au8; 32];
        assert_eq!(ct_eq_digest(&a, &a), 1);
        for bit in 0..256 {
            let mut b = a;
            b[bit / 8] ^= 1 << (bit % 8);
            assert_eq!(ct_eq_digest(&a, &b), 0);
        }
    }

    #[test]
    fn development_scopes_default_to_read_and_execute_and_refuse_resources() {
        let auth =
            Authorizer::development_with_scopes(Authorizer::default_development_scopes()).unwrap();
        let headers = HeaderMap::new();
        assert!(auth.require(&headers, Scope::Read).is_ok());
        assert!(auth.require(&headers, Scope::Execute).is_ok());
        assert!(matches!(
            auth.require(&headers, Scope::Edit),
            Err(HostError::Forbidden)
        ));
        assert!(matches!(
            auth.require(&headers, Scope::Publish),
            Err(HostError::Forbidden)
        ));
        assert!(matches!(
            auth.require(&headers, Scope::Resources),
            Err(HostError::Forbidden)
        ));

        assert!(Authorizer::development_with_scopes(BTreeSet::new()).is_err());
        assert!(Authorizer::development_with_scopes(BTreeSet::from([Scope::Resources])).is_err());
        assert_eq!(
            Authorizer::parse_development_scopes(&["read".into(), "edit".into()]).unwrap(),
            BTreeSet::from([Scope::Read, Scope::Edit])
        );
        assert!(Authorizer::parse_development_scopes(&["resources".into()]).is_err());
        assert!(Authorizer::parse_development_scopes(&["unknown".into()]).is_err());
        assert!(Authorizer::parse_development_scopes(&[]).is_err());
    }
}
