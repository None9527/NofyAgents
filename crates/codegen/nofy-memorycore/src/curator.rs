//! Curator hard invariants (FR4.7, HM-F18).
//!
//! The memory curator is a restricted actor with three HARD invariants —
//! invariants, not policies: they hold in every state, enforced at the
//! operation boundary:
//!
//! 1. **Self-created only**: the curator may only touch entries it created;
//! 2. **Archive, never delete**: the curator has no delete operation —
//!    archival is the terminal action (「curator 不删任何条目」, AC-4);
//! 3. **Pinned exempt**: pinned entries are untouchable regardless.
//!
//! Every refusal is recorded — the audit trail is part of the invariant.

/// One curated entry with its governance metadata.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CuratorEntry {
    pub id: String,
    pub created_by_curator: bool,
    pub pinned: bool,
    pub archived: bool,
}

/// Operations the curator may attempt. Note: there is NO Delete variant —
/// the type system encodes invariant 2.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CuratorOp {
    Archive { id: String },
    Modify { id: String },
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CuratorVerdict {
    Allowed,
    Refused { reason: String },
}

/// Validate one operation against an entry.
pub fn validate(op: &CuratorOp, entry: &CuratorEntry) -> CuratorVerdict {
    let id = match op {
        CuratorOp::Archive { id } | CuratorOp::Modify { id } => id,
    };
    if entry.id != *id {
        return CuratorVerdict::Refused {
            reason: "entry mismatch".into(),
        };
    }
    if entry.pinned {
        return CuratorVerdict::Refused {
            reason: "pinned entries are exempt".into(),
        };
    }
    if !entry.created_by_curator {
        return CuratorVerdict::Refused {
            reason: "curator may only touch its own entries".into(),
        };
    }
    if entry.archived {
        return CuratorVerdict::Refused {
            reason: "archived entries are terminal".into(),
        };
    }
    CuratorVerdict::Allowed
}

/// The curator's audit ledger: every attempt, allowed or refused.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct CuratorAudit {
    pub allowed: Vec<String>,
    pub refused: Vec<(String, String)>, // (entry id, reason)
}

/// Apply an operation through the invariant gate, recording the outcome.
pub fn apply_curator(
    op: &CuratorOp,
    entry: &mut CuratorEntry,
    audit: &mut CuratorAudit,
) -> CuratorVerdict {
    let verdict = validate(op, entry);
    let id = match op {
        CuratorOp::Archive { id } | CuratorOp::Modify { id } => id.clone(),
    };
    match &verdict {
        CuratorVerdict::Allowed => {
            if matches!(op, CuratorOp::Archive { .. }) {
                entry.archived = true;
            }
            audit.allowed.push(id);
        }
        CuratorVerdict::Refused { reason } => {
            audit.refused.push((id, reason.clone()));
        }
    }
    verdict
}

#[cfg(test)]
mod tests {
    use super::*;

    fn entry(created_by_curator: bool, pinned: bool) -> CuratorEntry {
        CuratorEntry {
            id: "e1".into(),
            created_by_curator,
            pinned,
            archived: false,
        }
    }

    #[test]
    fn curator_archives_its_own_unpinned_entry() {
        let mut entry = entry(true, false);
        let mut audit = CuratorAudit::default();
        assert_eq!(
            apply_curator(&CuratorOp::Archive { id: "e1".into() }, &mut entry, &mut audit),
            CuratorVerdict::Allowed
        );
        assert!(entry.archived);
        assert_eq!(audit.allowed, vec!["e1".to_string()]);
    }

    #[test]
    fn curator_never_deletes() {
        // Invariant 2 is encoded in the type: CuratorOp has no Delete.
        // This test documents the terminal semantics of archive instead.
        let mut entry = entry(true, false);
        let mut audit = CuratorAudit::default();
        apply_curator(&CuratorOp::Archive { id: "e1".into() }, &mut entry, &mut audit);
        // The entry still EXISTS — archived, not gone.
        assert!(entry.archived);
        // And further operations on it are refused (terminal).
        assert!(matches!(
            apply_curator(&CuratorOp::Modify { id: "e1".into() }, &mut entry, &mut audit),
            CuratorVerdict::Refused { .. }
        ));
    }

    #[test]
    fn foreign_entries_are_untouchable() {
        let mut entry = entry(false, false);
        let mut audit = CuratorAudit::default();
        assert!(matches!(
            apply_curator(&CuratorOp::Archive { id: "e1".into() }, &mut entry, &mut audit),
            CuratorVerdict::Refused { .. }
        ));
        assert!(!entry.archived);
        assert_eq!(audit.refused.len(), 1);
    }

    #[test]
    fn pinned_entries_are_exempt_even_from_their_creator() {
        let mut entry = entry(true, true);
        let mut audit = CuratorAudit::default();
        assert!(matches!(
            apply_curator(&CuratorOp::Modify { id: "e1".into() }, &mut entry, &mut audit),
            CuratorVerdict::Refused { .. }
        ));
    }

    #[test]
    fn every_attempt_is_audited() {
        let mut entry = entry(false, true);
        let mut audit = CuratorAudit::default();
        apply_curator(&CuratorOp::Archive { id: "e1".into() }, &mut entry, &mut audit);
        apply_curator(&CuratorOp::Modify { id: "e1".into() }, &mut entry, &mut audit);
        assert_eq!(audit.refused.len(), 2, "refusals are the audit trail");
        assert!(audit.allowed.is_empty());
    }
}
