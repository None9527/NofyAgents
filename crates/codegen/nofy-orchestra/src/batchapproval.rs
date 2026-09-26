//! Batch-level approval (FR11.8): ONE Ask over N items, per-item ledger.
//!
//! A batch of high-risk items is presented to a surface as a SINGLE
//! approval request; the surface decides per item; the ledger records
//! every decision. Fail-closed: items still undecided at the deadline are
//! DENIED, never defaulted to allow.

/// One item in an approval batch.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BatchItem {
    pub id: String,
    pub summary: String,
    pub high_risk: bool,
}

/// One approval batch.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ApprovalBatch {
    pub batch_id: String,
    pub items: Vec<BatchItem>,
}

/// Per-item decision.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ItemDecision {
    Pending,
    Approved,
    Denied,
}

/// The per-item ledger.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BatchLedger {
    pub batch_id: String,
    pub decisions: Vec<(String, ItemDecision)>,
}

/// The single Ask presented to a surface.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BatchAsk {
    pub batch_id: String,
    /// Aggregated presentation: one line per item.
    pub lines: Vec<String>,
    pub high_risk_count: usize,
}

/// Build the single Ask for a batch.
pub fn ask(batch: &ApprovalBatch) -> BatchAsk {
    BatchAsk {
        batch_id: batch.batch_id.clone(),
        lines: batch
            .items
            .iter()
            .map(|item| format!("[{}] {}", item.id, item.summary))
            .collect(),
        high_risk_count: batch.items.iter().filter(|item| item.high_risk).count(),
    }
}

/// Initialize the ledger: everything starts Pending.
pub fn init_ledger(batch: &ApprovalBatch) -> BatchLedger {
    BatchLedger {
        batch_id: batch.batch_id.clone(),
        decisions: batch
            .items
            .iter()
            .map(|item| (item.id.clone(), ItemDecision::Pending))
            .collect(),
    }
}

/// Decide one item. Unknown items are refused (fail-closed).
pub fn decide_item(ledger: &mut BatchLedger, item_id: &str, decision: ItemDecision) -> bool {
    if decision == ItemDecision::Pending {
        return false; // Pending is not a decision
    }
    match ledger.decisions.iter_mut().find(|(id, _)| id == item_id) {
        Some(slot) => {
            slot.1 = decision;
            true
        }
        None => false,
    }
}

/// Expire undecided items at the deadline: they become DENIED (fail-closed).
pub fn expire_undecided(ledger: &mut BatchLedger) -> usize {
    let mut expired = 0;
    for (_, decision) in ledger.decisions.iter_mut() {
        if *decision == ItemDecision::Pending {
            *decision = ItemDecision::Denied;
            expired += 1;
        }
    }
    expired
}

/// Aggregate outcome.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum BatchOutcome {
    AllApproved,
    /// Some approved, some denied — the approved subset may proceed.
    Partial {
        approved: Vec<String>,
    },
    AnyDenied,
    /// Still undecided items remain.
    Incomplete,
}

/// Evaluate the batch.
pub fn batch_outcome(ledger: &BatchLedger) -> BatchOutcome {
    let mut approved = Vec::new();
    let mut denied = false;
    for (id, decision) in &ledger.decisions {
        match decision {
            ItemDecision::Approved => approved.push(id.clone()),
            ItemDecision::Denied => denied = true,
            ItemDecision::Pending => return BatchOutcome::Incomplete,
        }
    }
    if denied {
        BatchOutcome::AnyDenied
    } else if approved.len() == ledger.decisions.len() {
        BatchOutcome::AllApproved
    } else {
        BatchOutcome::Partial { approved }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn batch() -> ApprovalBatch {
        ApprovalBatch {
            batch_id: "cleanup-1".into(),
            items: vec![
                BatchItem {
                    id: "mv-1".into(),
                    summary: "move logs/ to archive/".into(),
                    high_risk: false,
                },
                BatchItem {
                    id: "del-1".into(),
                    summary: "trash 40 duplicate images".into(),
                    high_risk: true,
                },
                BatchItem {
                    id: "ren-1".into(),
                    summary: "rename project files".into(),
                    high_risk: false,
                },
            ],
        }
    }

    #[test]
    fn one_ask_covers_the_whole_batch() {
        let ask = ask(&batch());
        assert_eq!(ask.batch_id, "cleanup-1");
        assert_eq!(ask.lines.len(), 3, "one Ask, N lines");
        assert_eq!(ask.high_risk_count, 1);
    }

    #[test]
    fn per_item_ledger_records_each_decision() {
        let mut ledger = init_ledger(&batch());
        assert!(decide_item(&mut ledger, "mv-1", ItemDecision::Approved));
        assert!(decide_item(&mut ledger, "del-1", ItemDecision::Denied));
        assert!(decide_item(&mut ledger, "ren-1", ItemDecision::Approved));
        assert_eq!(batch_outcome(&ledger), BatchOutcome::AnyDenied);
    }

    #[test]
    fn all_approved_passes() {
        let mut ledger = init_ledger(&batch());
        for id in ["mv-1", "del-1", "ren-1"] {
            decide_item(&mut ledger, id, ItemDecision::Approved);
        }
        assert_eq!(batch_outcome(&ledger), BatchOutcome::AllApproved);
    }

    #[test]
    fn undecided_at_deadline_are_denied_fail_closed() {
        let mut ledger = init_ledger(&batch());
        decide_item(&mut ledger, "mv-1", ItemDecision::Approved);
        // Deadline: two items never decided.
        assert_eq!(expire_undecided(&mut ledger), 2);
        assert_eq!(
            batch_outcome(&ledger),
            BatchOutcome::AnyDenied,
            "expired = denied, never allowed"
        );
    }

    #[test]
    fn unknown_item_refused() {
        let mut ledger = init_ledger(&batch());
        assert!(!decide_item(&mut ledger, "ghost", ItemDecision::Approved));
        assert_eq!(batch_outcome(&ledger), BatchOutcome::Incomplete);
    }

    #[test]
    fn pending_is_not_a_decision() {
        let mut ledger = init_ledger(&batch());
        assert!(!decide_item(&mut ledger, "mv-1", ItemDecision::Pending));
    }
}
