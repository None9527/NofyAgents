//! Versioned scope identities. The root selects once; descendants inherit the
//! selection and cannot change checkpoint/mailbox/ledger addresses mid-tree.
use crate::{Error, RunContext};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum IdentityScheme {
    /// Preserves the original recursive JSON identity for existing runs.
    #[default]
    Legacy,
    /// Hashes the initial definition, retaining its original update format.
    HashedV1,
    /// Folds every composition update as well as its initial definition.
    HashedV2,
}

#[derive(Clone)]
pub(crate) struct IdentityBinding(pub IdentityScheme);

pub(crate) fn composition(scheme: Option<IdentityScheme>, identity: String) -> String {
    let prefix = match scheme {
        Some(IdentityScheme::HashedV1) => "composition-hash-v1:",
        Some(IdentityScheme::HashedV2) => "composition-hash-v2:",
        _ => return identity,
    };
    format!("{prefix}{:x}", Sha256::digest(identity.as_bytes()))
}

pub(crate) fn extend(scheme: Option<IdentityScheme>, identity: String) -> String {
    if scheme == Some(IdentityScheme::HashedV2) {
        composition(scheme, identity)
    } else {
        identity
    }
}

pub(crate) fn bind(
    context: &mut RunContext,
    explicit: Option<IdentityScheme>,
) -> Result<(), Error> {
    if let Some(inherited) = context.capabilities.get::<IdentityBinding>() {
        if explicit.is_some_and(|scheme| scheme != inherited.0) {
            return Err(Error::Composition(
                "descendant scope_identity conflicts with its root".into(),
            ));
        }
    } else {
        context
            .capabilities
            .insert(IdentityBinding(explicit.unwrap_or_default()));
    }
    Ok(())
}

pub(crate) fn child_id(
    context: &RunContext,
    parent_thread: &str,
    parent_run: &str,
    sequence: Option<u64>,
    call_id: &str,
) -> String {
    let identity = serde_json::to_vec(&(parent_thread, parent_run, sequence, call_id))
        .expect("scope identity contains strings and an integer");
    match context
        .capabilities
        .get::<IdentityBinding>()
        .map_or(IdentityScheme::Legacy, |binding| binding.0)
    {
        IdentityScheme::Legacy => {
            format!(
                "child:{}",
                String::from_utf8(identity).expect("JSON is UTF-8")
            )
        }
        IdentityScheme::HashedV1 => format!("child-hash-v1:{:x}", Sha256::digest(identity)),
        IdentityScheme::HashedV2 => format!("child-hash-v2:{:x}", Sha256::digest(identity)),
    }
}
