//! First-frame version negotiation (PI-F2 translated).
//!
//! Every control-plane connection opens with a `Hello`; the daemon answers
//! `HelloAck`. A peer whose major version differs gets a structured
//! `VersionMismatch` — never a silently misparsed stream.

use serde::{Deserialize, Serialize};

/// Control-plane protocol version. Major bumps break framing/vocabulary;
/// minor bumps are additive and compatible.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct ProtocolVersion {
    pub major: u32,
    pub minor: u32,
}

impl ProtocolVersion {
    pub const CURRENT: ProtocolVersion = ProtocolVersion { major: 1, minor: 0 };

    pub fn compatible_with(&self, other: &ProtocolVersion) -> bool {
        self.major == other.major
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Hello {
    pub version: ProtocolVersion,
    /// Opaque client identifier for diagnostics (NOT an auth credential —
    /// authentication is the transport layer's job, see `auth`).
    pub client_id: String,
    /// Capabilities the client declares; the daemon may only narrow, never
    /// widen (OC-F15 monotonic-narrowing idea at connect time).
    pub caps: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind")]
pub enum HelloAck {
    Accepted {
        version: ProtocolVersion,
        /// Daemon can serve delta-resume for this connection family.
        resume_supported: bool,
    },
    VersionMismatch {
        daemon: ProtocolVersion,
        client: ProtocolVersion,
    },
}

/// Daemon-side negotiation: accept same-major, reject otherwise.
pub fn negotiate(hello: &Hello) -> HelloAck {
    if hello.version.compatible_with(&ProtocolVersion::CURRENT) {
        HelloAck::Accepted {
            version: ProtocolVersion::CURRENT,
            resume_supported: true,
        }
    } else {
        HelloAck::VersionMismatch {
            daemon: ProtocolVersion::CURRENT,
            client: hello.version,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn hello(major: u32, minor: u32) -> Hello {
        Hello {
            version: ProtocolVersion { major, minor },
            client_id: "test".into(),
            caps: vec!["resume".into()],
        }
    }

    #[test]
    fn same_major_accepted() {
        assert!(matches!(
            negotiate(&hello(1, 7)),
            HelloAck::Accepted { version, .. } if version == ProtocolVersion::CURRENT
        ));
    }

    #[test]
    fn different_major_rejected_structured() {
        assert!(matches!(
            negotiate(&hello(2, 0)),
            HelloAck::VersionMismatch { daemon, client }
                if daemon == ProtocolVersion::CURRENT && client.major == 2
        ));
    }

    #[test]
    fn hello_serializes_stable_shape() {
        let v = serde_json::to_value(hello(1, 0)).unwrap();
        assert_eq!(v["version"]["major"], 1);
        assert!(v["caps"].is_array());
    }
}
