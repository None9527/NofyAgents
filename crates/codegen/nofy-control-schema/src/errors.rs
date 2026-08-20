//! Closed control-plane error-code table.
//!
//! Codes are wire strings (surfaces branch on them); the set is closed so a
//! new failure mode is a deliberate schema change. `detail` carries the
//! human/agent-readable explanation; `code` carries the branchable class —
//! matching the observed ACP error shape (`{code, detail}`).

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ControlErrorCode {
    FsNotFound,
    SessionNotFound,
    CursorStale,
    VersionMismatch,
    AuthDenied,
    NotReady,
    ApprovalTimeout,
    SearchTimeout,
    Internal,
}

impl ControlErrorCode {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::FsNotFound => "FS_NOT_FOUND",
            Self::SessionNotFound => "SESSION_NOT_FOUND",
            Self::CursorStale => "CURSOR_STALE",
            Self::VersionMismatch => "VERSION_MISMATCH",
            Self::AuthDenied => "AUTH_DENIED",
            Self::NotReady => "NOT_READY",
            Self::ApprovalTimeout => "APPROVAL_TIMEOUT",
            Self::SearchTimeout => "SEARCH_TIMEOUT",
            Self::Internal => "INTERNAL",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ControlError {
    pub code: ControlErrorCode,
    pub detail: String,
}

impl ControlError {
    pub fn new(code: ControlErrorCode, detail: impl Into<String>) -> Self {
        Self {
            code,
            detail: detail.into(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn wire_codes_match_observed_acp_shape() {
        // The e2e-observed code for a missing path must stay byte-identical.
        assert_eq!(ControlErrorCode::FsNotFound.as_str(), "FS_NOT_FOUND");
        let e = ControlError::new(ControlErrorCode::CursorStale, "cursor not in ring");
        let v = serde_json::to_value(&e).unwrap();
        assert_eq!(v["code"], "CURSOR_STALE");
        assert_eq!(v["detail"], "cursor not in ring");
    }

    #[test]
    fn codes_roundtrip() {
        for c in [
            ControlErrorCode::FsNotFound,
            ControlErrorCode::SessionNotFound,
            ControlErrorCode::CursorStale,
            ControlErrorCode::VersionMismatch,
            ControlErrorCode::AuthDenied,
            ControlErrorCode::NotReady,
            ControlErrorCode::ApprovalTimeout,
            ControlErrorCode::SearchTimeout,
            ControlErrorCode::Internal,
        ] {
            let s = serde_json::to_string(&c).unwrap();
            assert_eq!(serde_json::from_str::<ControlErrorCode>(&s).unwrap(), c);
        }
    }

    #[test]
    fn as_str_matches_serde_wire_name_for_every_code() {
        // Two spellings of ONE wire vocabulary — the manual as_str table and
        // the serde SCREAMING_SNAKE_CASE derive — must never drift apart.
        for c in [
            ControlErrorCode::FsNotFound,
            ControlErrorCode::SessionNotFound,
            ControlErrorCode::CursorStale,
            ControlErrorCode::VersionMismatch,
            ControlErrorCode::AuthDenied,
            ControlErrorCode::NotReady,
            ControlErrorCode::ApprovalTimeout,
            ControlErrorCode::SearchTimeout,
            ControlErrorCode::Internal,
        ] {
            let wire = serde_json::to_value(c).unwrap();
            assert_eq!(wire.as_str().unwrap(), c.as_str());
        }
    }
}
