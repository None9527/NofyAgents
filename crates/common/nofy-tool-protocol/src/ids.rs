//! Identifier newtypes.
//!
//! Tool definitions and individual invocations have separate identities.
//! Constructors validate; `Deserialize` re-uses the constructor, so values
//! that round-trip from the wire share the same invariants as values built
//! locally.

use std::fmt;
use std::str::FromStr;

use serde::{Deserialize, Deserializer, Serialize};

/// Errors produced by id constructors and validators.
#[derive(thiserror::Error, Debug, Clone, PartialEq, Eq)]
pub enum IdError {
    #[error("identifier must not be empty")]
    Empty,
    #[error("identifier {value:?} has invalid format")]
    InvalidFormat { value: String },
}

#[inline]
fn is_id_char(c: char) -> bool {
    c.is_ascii_alphanumeric() || c == '_' || c == '-'
}

fn is_valid_segment(s: &str) -> bool {
    !s.is_empty() && s.chars().all(is_id_char)
}

fn ensure_non_empty(s: &str) -> Result<(), IdError> {
    if s.is_empty() {
        Err(IdError::Empty)
    } else {
        Ok(())
    }
}

/// Generate a string-backed opaque id newtype.
///
/// Emits `new`, `as_str`, `into_inner`, `AsRef<str>`, `Display`, `FromStr`,
/// `TryFrom<String>`, and a validating `Deserialize` (which routes through
/// `Self::new`). `Serialize` is derived transparently.
///
/// An optional `extra_validator = $path` clause accepts a
/// `fn(&str) -> Result<(), IdError>` that runs after the empty-string
/// check.
macro_rules! opaque_id {
    ($(#[$meta:meta])* $name:ident $(, extra_validator = $validator:path)?) => {
        $(#[$meta])*
        #[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize)]
        #[serde(transparent)]
        pub struct $name(String);

        impl $name {
            /// Construct, validating the id's invariants.
            pub fn new(value: impl Into<String>) -> Result<Self, IdError> {
                let value = value.into();
                ensure_non_empty(&value)?;
                $($validator(&value)?;)?
                Ok(Self(value))
            }

            pub fn as_str(&self) -> &str {
                &self.0
            }

            pub fn into_inner(self) -> String {
                self.0
            }
        }

        impl AsRef<str> for $name {
            fn as_ref(&self) -> &str {
                &self.0
            }
        }

        impl fmt::Display for $name {
            fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
                f.write_str(&self.0)
            }
        }

        impl FromStr for $name {
            type Err = IdError;
            fn from_str(s: &str) -> Result<Self, Self::Err> {
                Self::new(s)
            }
        }

        impl TryFrom<String> for $name {
            type Error = IdError;
            fn try_from(value: String) -> Result<Self, Self::Error> {
                Self::new(value)
            }
        }

        impl<'de> Deserialize<'de> for $name {
            fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
                let raw = String::deserialize(deserializer)?;
                Self::new(raw).map_err(serde::de::Error::custom)
            }
        }
    };
}

opaque_id!(
    /// End-to-end identifier for a single tool invocation.
    ///
    /// SDKs SHOULD use UUID v7 (see [`ToolCallId::new_v7`]).
    ToolCallId
);

impl ToolCallId {
    /// Generate a fresh UUID v7-backed `ToolCallId`.
    pub fn new_v7() -> Self {
        Self(uuid::Uuid::now_v7().to_string())
    }
}

fn validate_tool_id(s: &str) -> Result<(), IdError> {
    if !is_well_formed_tool_id(s) {
        return Err(IdError::InvalidFormat {
            value: s.to_owned(),
        });
    }
    Ok(())
}

fn is_well_formed_tool_id(s: &str) -> bool {
    let mut parts = s.splitn(3, ':');
    let Some(first) = parts.next() else {
        return false;
    };
    match (parts.next(), parts.next()) {
        (None, _) => is_valid_segment(first),
        (Some(second), None) => is_valid_segment(first) && is_valid_segment(second),
        _ => false,
    }
}

opaque_id!(
    /// Tool identifier.
    ///
    /// Format: `{namespace}:{name}` or `{name}`. Each segment must match
    /// `[a-zA-Z0-9_-]+`.
    ToolId,
    extra_validator = validate_tool_id
);
