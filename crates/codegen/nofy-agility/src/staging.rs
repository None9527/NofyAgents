//! Staging area + rule of three (FR14.5): a pack/script promotes into the
//! Rust core only after ≥3 DISTINCT verified scenarios.
//!
//! The staging area is the 「预演区」: everything experimental lives here
//! first; the promotion ledger records what actually earned core status —
//! discipline made mechanical instead of aspirational.

/// One staged artifact's verification record.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct StagingRecord {
    pub artifact: String,
    /// Distinct verified scenarios (deduplicated).
    pub scenarios_passed: Vec<String>,
}

/// The promotion threshold (三次法则).
pub const PROMOTION_THRESHOLD: usize = 3;

impl StagingRecord {
    pub fn new(artifact: &str) -> Self {
        Self {
            artifact: artifact.to_string(),
            scenarios_passed: Vec::new(),
        }
    }

    /// Record a verified scenario (duplicates don't count twice).
    pub fn record_scenario(&mut self, scenario: &str) {
        if !self.scenarios_passed.iter().any(|s| s == scenario) {
            self.scenarios_passed.push(scenario.to_string());
        }
    }

    /// May this artifact promote to the Rust core?
    pub fn may_promote(&self) -> bool {
        self.scenarios_passed.len() >= PROMOTION_THRESHOLD
    }
}

/// The promotion ledger: what earned core status, and when.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct PromotionLedger {
    pub promotions: Vec<(String, Vec<String>)>, // (artifact, scenarios)
}

impl PromotionLedger {
    /// Promote if the record qualifies; refuse otherwise.
    pub fn promote(&mut self, record: &StagingRecord) -> bool {
        if !record.may_promote() {
            return false;
        }
        self.promotions
            .push((record.artifact.clone(), record.scenarios_passed.clone()));
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rule_of_three_enforced() {
        let mut record = StagingRecord::new("code-review-pack");
        record.record_scenario("scenario-a");
        record.record_scenario("scenario-b");
        assert!(!record.may_promote(), "two scenarios are not enough");
        record.record_scenario("scenario-c");
        assert!(record.may_promote());
    }

    #[test]
    fn duplicate_scenarios_do_not_count() {
        let mut record = StagingRecord::new("x");
        for _ in 0..5 {
            record.record_scenario("same-scenario");
        }
        assert_eq!(record.scenarios_passed.len(), 1);
        assert!(!record.may_promote());
    }

    #[test]
    fn promotion_ledger_refuses_unqualified() {
        let mut ledger = PromotionLedger::default();
        let mut record = StagingRecord::new("young-pack");
        record.record_scenario("only-one");
        assert!(!ledger.promote(&record));
        assert!(ledger.promotions.is_empty());
    }

    #[test]
    fn qualified_promotion_is_recorded() {
        let mut ledger = PromotionLedger::default();
        let mut record = StagingRecord::new("proven-pack");
        record.record_scenario("s1");
        record.record_scenario("s2");
        record.record_scenario("s3");
        assert!(ledger.promote(&record));
        assert_eq!(ledger.promotions.len(), 1);
        assert_eq!(ledger.promotions[0].0, "proven-pack");
    }
}
