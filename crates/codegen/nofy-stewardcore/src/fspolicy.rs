//! `fs/*` policy events + structured FS_SANDBOX_DENIED (FR12.3, DS-06).
//!
//! Every steward fs operation passes a policy check; denials are not
//! strings — they are STRUCTURED events (code + reason + path + op), so
//! the audit stream can answer "why was this refused" mechanically.

use crate::roots::{RootTable, StewardError};

/// File operations the steward may attempt.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum FsOp {
    Read,
    Write,
    Move,
    Trash,
}

/// Structured denial codes (the FS_SANDBOX_DENIED vocabulary).
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum FsDenyCode {
    OutsideRoot,
    IndexOnlyRoot,
    /// Operation would escape the root (path traversal).
    ConfinementBreach,
}

/// One structured policy event (allow or deny — both are auditable).
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum FsPolicyEvent {
    Allowed {
        op: FsOp,
        path: String,
    },
    Denied {
        code: FsDenyCode,
        op: FsOp,
        path: String,
        reason: String,
    },
}

/// Check one operation against the root table + confinement.
pub fn check(op: FsOp, path: &str, roots: &RootTable) -> FsPolicyEvent {
    // Confinement: normalized path must not escape via `..`.
    if path.split('/').any(|seg| seg == "..") {
        return FsPolicyEvent::Denied {
            code: FsDenyCode::ConfinementBreach,
            op,
            path: path.to_string(),
            reason: "path traversal segment".into(),
        };
    }
    let result = match op {
        FsOp::Read => roots.validate_read(path),
        FsOp::Write | FsOp::Move | FsOp::Trash => roots.validate_write(path),
    };
    match result {
        Ok(()) => FsPolicyEvent::Allowed {
            op,
            path: path.to_string(),
        },
        Err(StewardError::OutsideRoot { .. }) => FsPolicyEvent::Denied {
            code: FsDenyCode::OutsideRoot,
            op,
            path: path.to_string(),
            reason: "no root covers this path; escalate".into(),
        },
        Err(StewardError::IndexOnlyRoot { root }) => FsPolicyEvent::Denied {
            code: FsDenyCode::IndexOnlyRoot,
            op,
            path: path.to_string(),
            reason: format!("root {root} is index-only"),
        },
    }
}

/// Convenience: is this event a denial?
pub fn is_denied(event: &FsPolicyEvent) -> bool {
    matches!(event, FsPolicyEvent::Denied { .. })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::roots::RootTier;

    fn table() -> RootTable {
        let mut roots = RootTable::new();
        roots.add_root("/docs", RootTier::IndexOnly);
        roots.add_root("/proj", RootTier::Manage);
        roots
    }

    #[test]
    fn denials_are_structured() {
        // 拒绝是结构化事件:code/op/path/reason 全量相等,可机械审计。
        assert_eq!(
            check(FsOp::Trash, "/docs/a.md", &table()),
            FsPolicyEvent::Denied {
                code: FsDenyCode::IndexOnlyRoot,
                op: FsOp::Trash,
                path: "/docs/a.md".into(),
                reason: "root /docs is index-only".into(),
            }
        );
    }

    #[test]
    fn outside_root_denied_with_code() {
        let event = check(FsOp::Read, "/nope/x", &table());
        assert!(matches!(
            event,
            FsPolicyEvent::Denied {
                code: FsDenyCode::OutsideRoot,
                ..
            }
        ));
    }

    #[test]
    fn traversal_is_a_confinement_breach() {
        let event = check(FsOp::Read, "/proj/../etc/passwd", &table());
        assert!(matches!(
            event,
            FsPolicyEvent::Denied {
                code: FsDenyCode::ConfinementBreach,
                ..
            }
        ));
    }

    #[test]
    fn allowed_ops_are_audited_too() {
        let event = check(FsOp::Write, "/proj/f.txt", &table());
        assert_eq!(
            event,
            FsPolicyEvent::Allowed {
                op: FsOp::Write,
                path: "/proj/f.txt".into()
            }
        );
        assert!(!is_denied(&event));
        let read_docs = check(FsOp::Read, "/docs/a.md", &table());
        assert!(!is_denied(&read_docs), "reads are fine in index-only roots");
    }
}
