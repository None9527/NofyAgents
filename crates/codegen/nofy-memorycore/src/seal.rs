//! Sealed protection (FR9.9, HM-F30): trajectory head/tail guards +
//! sealed-test registry.
//!
//! Two seals:
//!
//! - **Trajectory head/tail**: compaction may summarize the MIDDLE of a
//!   trajectory, but the FIRST and LAST entries are protected — they
//!   carry origin and final state, and no compaction plan may drop
//!   them;
//! - **Sealed tests**: invariant tests can be SEALED; a sealed test
//!   that disappears is a violation — removing one requires an
//!   explicit unseal with a recorded reason (never silent).

/// One trajectory entry.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TrajectoryEntry {
    pub seq: u64,
    pub body: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SealError {
    /// Compaction dropped the first entry.
    HeadDropped,
    /// Compaction dropped the last entry.
    TailDropped,
    /// Compaction reordered or forged entries.
    ForgedEntry { seq: u64 },
}

/// Verify a compacted trajectory against the original: head and tail
/// survive verbatim, and every surviving entry is an unchanged original.
pub fn verify_compaction(
    original: &[TrajectoryEntry],
    compacted: &[TrajectoryEntry],
) -> Result<(), SealError> {
    if original.is_empty() {
        return Ok(());
    }
    let head = &original[0];
    let tail = &original[original.len() - 1];
    if !compacted.first().is_some_and(|e| e == head) {
        return Err(SealError::HeadDropped);
    }
    if !compacted.last().is_some_and(|e| e == tail) {
        return Err(SealError::TailDropped);
    }
    for entry in compacted {
        if !original.iter().any(|o| o == entry) {
            return Err(SealError::ForgedEntry { seq: entry.seq });
        }
    }
    Ok(())
}

/// The sealed-test registry.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct SealRegistry {
    /// test name -> seal reason.
    seals: std::collections::BTreeMap<String, String>,
    /// Unseal audit trail: (test name, reason).
    pub unseal_log: Vec<(String, String)>,
}

impl SealRegistry {
    /// Seal an invariant test.
    pub fn seal(&mut self, test_name: &str, reason: &str) {
        self.seals.insert(test_name.to_string(), reason.to_string());
    }

    /// Unseal REQUIRES a reason; the removal is logged.
    pub fn unseal(&mut self, test_name: &str, reason: &str) -> bool {
        if reason.trim().is_empty() {
            return false;
        }
        if self.seals.remove(test_name).is_some() {
            self.unseal_log.push((test_name.to_string(), reason.to_string()));
            true
        } else {
            false
        }
    }

    pub fn sealed_names(&self) -> Vec<String> {
        self.seals.keys().cloned().collect()
    }

    /// Sealed tests that are missing from `present` — each is a
    /// violation (silent removal is impossible to miss).
    pub fn missing(&self, present: &[String]) -> Vec<String> {
        self.seals
            .keys()
            .filter(|name| !present.iter().any(|p| p == *name))
            .cloned()
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn trajectory() -> Vec<TrajectoryEntry> {
        (0..5)
            .map(|i| TrajectoryEntry { seq: i, body: format!("entry {i}") })
            .collect()
    }

    #[test]
    fn middle_may_compact_head_tail_must_survive() {
        let original = trajectory();
        // Keep head + one middle summary survivor + tail.
        let compacted = vec![original[0].clone(), original[2].clone(), original[4].clone()];
        assert!(verify_compaction(&original, &compacted).is_ok());
    }

    #[test]
    fn dropping_head_or_tail_is_refused() {
        let original = trajectory();
        let no_head: Vec<_> = original[1..].to_vec();
        assert_eq!(verify_compaction(&original, &no_head), Err(SealError::HeadDropped));
        let no_tail: Vec<_> = original[..4].to_vec();
        assert_eq!(verify_compaction(&original, &no_tail), Err(SealError::TailDropped));
    }

    #[test]
    fn forged_entries_are_refused() {
        let original = trajectory();
        let forged = vec![
            original[0].clone(),
            TrajectoryEntry { seq: 99, body: "injected".into() },
            original[4].clone(),
        ];
        assert_eq!(verify_compaction(&original, &forged), Err(SealError::ForgedEntry { seq: 99 }));
    }

    #[test]
    fn sealed_tests_cannot_vanish_silently() {
        let mut registry = SealRegistry::default();
        registry.seal("fail_closed_test", "AC-12 invariant");
        let present = vec!["other_test".to_string()];
        assert_eq!(registry.missing(&present), vec!["fail_closed_test".to_string()]);
        let present2 = vec!["fail_closed_test".to_string()];
        assert!(registry.missing(&present2).is_empty());
    }

    #[test]
    fn unseal_requires_a_reason_and_is_logged() {
        let mut registry = SealRegistry::default();
        registry.seal("t1", "invariant");
        assert!(!registry.unseal("t1", "  "), "empty reason refused");
        assert!(registry.unseal("t1", "superseded by t2"));
        assert_eq!(registry.unseal_log, vec![("t1".to_string(), "superseded by t2".to_string())]);
        assert!(registry.sealed_names().is_empty());
        assert!(!registry.unseal("ghost", "reason"), "unknown seals cannot be unsealed");
    }
}
