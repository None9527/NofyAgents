//! Audit storage: metadata-only + pseudonymization + retention
//! (FR4.11, OC-F12).
//!
//! Three privacy guarantees, mechanically:
//!
//! - **Metadata-only**: audit records carry action/actor/subject metadata —
//!   never content. The record type has no content field;
//! - **Pseudonymization**: identities are stored as salted BLAKE3
//!   pseudonyms — stable for correlation, irreversible without the salt
//!   (假名化);
//! - **Retention**: records past the retention window are dropped by
//!   `retain` — forget is an operation with a verifiable result
//!   (「forget 合规审计=0 残留」, PRD §9).

use serde::{Deserialize, Serialize};

/// One audit record. Deliberately metadata-only: there is NO content
/// field to store.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AuditRecord {
    pub at: u64,
    pub actor_pseudo: String,
    pub action: String,
    pub subject_pseudo: String,
}

/// Pseudonymize an identity: salted BLAKE3, truncated. Deterministic for
/// the same (identity, salt); irreversible without the salt.
pub fn pseudonymize(identity: &str, salt: &str) -> String {
    let mut hasher = blake3::Hasher::new();
    hasher.update(salt.as_bytes());
    hasher.update(b"\x1f"); // domain separator
    hasher.update(identity.as_bytes());
    hasher.finalize().to_hex()[..24].to_string()
}

/// Build a metadata-only record (content never enters).
pub fn record(at: u64, actor: &str, action: &str, subject: &str, salt: &str) -> AuditRecord {
    AuditRecord {
        at,
        actor_pseudo: pseudonymize(actor, salt),
        action: action.to_string(),
        subject_pseudo: pseudonymize(subject, salt),
    }
}

/// Retention: keep only records within the window. Returns (kept, forgotten).
pub fn retain(records: Vec<AuditRecord>, now: u64, retention_secs: u64) -> (Vec<AuditRecord>, Vec<AuditRecord>) {
    let cutoff = now.saturating_sub(retention_secs);
    let mut kept = Vec::new();
    let mut forgotten = Vec::new();
    for record in records {
        if record.at >= cutoff {
            kept.push(record);
        } else {
            forgotten.push(record);
        }
    }
    (kept, forgotten)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn pseudonyms_are_stable_but_salted() {
        let p1 = pseudonymize("user-a", "salt-1");
        let p2 = pseudonymize("user-a", "salt-1");
        assert_eq!(p1, p2, "stable for correlation");
        // Different salt = different pseudonym (no cross-depot linking).
        assert_ne!(pseudonymize("user-a", "salt-2"), p1);
        // Different identity = different pseudonym.
        assert_ne!(pseudonymize("user-b", "salt-1"), p1);
        assert_eq!(p1.len(), 24);
    }

    #[test]
    fn records_are_metadata_only() {
        let record = record(100, "user-a", "memory.read", "doc-42", "salt");
        assert_eq!(record.action, "memory.read");
        assert_ne!(record.actor_pseudo, "user-a", "identity must be pseudonymized");
        assert_ne!(record.subject_pseudo, "doc-42");
        // The record type carries no content field — enforced by shape.
        let json = serde_json::to_string(&record).unwrap();
        assert!(!json.contains("user-a"));
        assert!(!json.contains("doc-42"));
    }

    #[test]
    fn retention_forgets_expired_records() {
        let records = vec![
            AuditRecord { at: 10, actor_pseudo: "a".into(), action: "x".into(), subject_pseudo: "s".into() },
            AuditRecord { at: 90, actor_pseudo: "b".into(), action: "y".into(), subject_pseudo: "s".into() },
            AuditRecord { at: 100, actor_pseudo: "c".into(), action: "z".into(), subject_pseudo: "s".into() },
        ];
        let (kept, forgotten) = retain(records, 100, 50);
        assert_eq!(kept.len(), 2, "records within the window stay");
        assert_eq!(forgotten.len(), 1);
        assert_eq!(forgotten[0].at, 10);
        // Forget is verifiable: nothing expired remains.
        assert!(kept.iter().all(|r| r.at >= 50));
    }

    #[test]
    fn retention_zero_window_forgets_all_but_now() {
        let records = vec![
            AuditRecord { at: 99, actor_pseudo: "a".into(), action: "x".into(), subject_pseudo: "s".into() },
            AuditRecord { at: 100, actor_pseudo: "b".into(), action: "y".into(), subject_pseudo: "s".into() },
        ];
        let (kept, forgotten) = retain(records, 100, 0);
        assert_eq!(kept.len(), 1);
        assert_eq!(forgotten.len(), 1);
    }

    #[test]
    fn pseudonym_without_salt_is_unlinkable() {
        // Given only the pseudonym and no salt, the identity cannot be
        // recovered — documented property, checked by construction: the
        // pseudonym is a one-way digest, not an encoding.
        let pseudo = pseudonymize("user-a", "secret-salt");
        assert!(!pseudo.contains("user"));
        assert_ne!(pseudo, blake3::hash("user-a".as_bytes()).to_hex()[..24].to_string(),
            "salted digest must differ from unsalted");
    }
}
