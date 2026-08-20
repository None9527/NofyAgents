//! File-steward runtime behavior (PRD FR12): suggestion batches with
//! trash-only semantics, converted into orchestration tasks (FR11) so a
//! steward proposal executes through the same plan/approval machinery as
//! any project work.
//!
//! Since integration batch Q2 the POLICY lives in `nofy-stewardcore`;
//! this module is the runtime seam that delegates to it:
//!
//! - **root confinement** → [`nofy_stewardcore::roots`] classification;
//! - **lease gate at load** (AC-12) → [`nofy_stewardcore::lease`];
//! - **two-phase intent + trash-over-delete + rollback snapshots**
//!   → [`nofy_stewardcore::mgmt`] (FR12.6).
//!
//! Invariants pinned here, by construction where possible:
//! - **no delete**: the op set has no destructive variant; removals are
//!   `Trash` moves the provider executes (trash-over-delete);
//! - **batch is one approval unit**: approve-all or reject-all; partial
//!   approval is not representable, keeping the audit ledger simple.

use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use nofy_stewardcore::lease::LeaseTable;
use nofy_stewardcore::mgmt;
use nofy_stewardcore::roots::{PathClass, RootTable, RootTier};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum StewardOp {
    Move { from: PathBuf, to: PathBuf },
    Dedupe { keep: PathBuf, trash: PathBuf },
    Trash { path: PathBuf },
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SuggestionBatch {
    pub root: PathBuf,
    pub rationale: String,
    pub ops: Vec<StewardOp>,
}

#[derive(Debug, PartialEq, Eq)]
pub enum StewardError {
    EmptyBatch,
    OutsideRoot { path: PathBuf },
}

/// Load-time gate refusal (AC-12): a leased path refuses the whole batch
/// BEFORE any execution planning.
#[derive(Debug, PartialEq, Eq)]
pub enum StewardGateError {
    Leased { path: PathBuf, holder: String },
}

impl SuggestionBatch {
    /// Every path this batch reads or writes.
    fn touched_paths(&self) -> Vec<&PathBuf> {
        self.ops
            .iter()
            .flat_map(|op| match op {
                StewardOp::Move { from, to } => vec![from, to],
                StewardOp::Dedupe { keep, trash } => vec![keep, trash],
                StewardOp::Trash { path } => vec![path],
            })
            .collect()
    }

    /// The opted-in root table for this batch's root (Manage tier).
    fn root_table(&self) -> RootTable {
        let mut roots = RootTable::new();
        roots.add_root(&self.root.to_string_lossy(), RootTier::Manage);
        roots
    }

    /// Validate confinement: every path in every op under `root`,
    /// classified by the stewardcore root table (Q2 wiring).
    pub fn validate(&self) -> Result<(), StewardError> {
        if self.ops.is_empty() {
            return Err(StewardError::EmptyBatch);
        }
        let roots = self.root_table();
        for p in self.touched_paths() {
            if !matches!(roots.classify(&p.to_string_lossy()), PathClass::Inside { .. }) {
                return Err(StewardError::OutsideRoot { path: p.clone() });
            }
        }
        Ok(())
    }

    /// Lease gate at LOAD time (AC-12, Q2 wiring): any touched path under
    /// a live lease refuses the whole batch, holder named.
    pub fn gate(&self, leases: &LeaseTable, now: u64) -> Result<(), StewardGateError> {
        for p in self.touched_paths() {
            let path = p.to_string_lossy();
            if let Some(holder) = leases.lease_holder(&path, now) {
                return Err(StewardGateError::Leased {
                    path: p.clone(),
                    holder: holder.to_string(),
                });
            }
        }
        Ok(())
    }

    /// Map into the stewardcore two-phase intent model (FR12.6). Trash is
    /// the only destructive exit: `Dedupe` keeps one copy, `Trash`
    /// lowers to cleanup.
    pub fn to_intent(&self, batch_id: &str) -> mgmt::MgmtIntent {
        mgmt::MgmtIntent {
            batch_id: batch_id.to_string(),
            ops: self
                .ops
                .iter()
                .map(|op| match op {
                    StewardOp::Move { from, to } => mgmt::MgmtOp::Move {
                        from: from.to_string_lossy().into_owned(),
                        to: to.to_string_lossy().into_owned(),
                    },
                    StewardOp::Dedupe { keep, trash } => mgmt::MgmtOp::Dedupe {
                        keep: keep.to_string_lossy().into_owned(),
                        duplicates: vec![trash.to_string_lossy().into_owned()],
                    },
                    StewardOp::Trash { path } => mgmt::MgmtOp::Cleanup {
                        path: path.to_string_lossy().into_owned(),
                    },
                })
                .collect(),
        }
    }

    /// Two-phase commit (FR12.6, Q2 wiring): validate the intent at LOAD
    /// time against the root table + lease table, then commit into
    /// manifest records with a rollback snapshot.
    pub fn commit_two_phase(
        &self,
        batch_id: &str,
        leases: &LeaseTable,
        now: u64,
        at: u64,
    ) -> Result<mgmt::CommittedBatch, mgmt::IntentError> {
        let intent = self.to_intent(batch_id);
        let roots = self.root_table();
        let existing = std::collections::BTreeSet::new();
        let ctx = mgmt::IntentContext { roots: &roots, leases, now, existing: &existing };
        mgmt::validate_intent(&intent, &ctx)?;
        Ok(mgmt::commit_intent(&intent, at))
    }

    /// One orchestration task per batch (single approval unit), bound to the
    /// built-in `file-steward` pack. The goal carries the rationale; the
    /// provider executes ops and reports; `verify` is a gate the executor
    /// must satisfy (all ops applied or none).
    pub fn as_task(&self, task_id: &str) -> crate::orchestra::TaskSpec {
        crate::orchestra::TaskSpec {
            id: task_id.to_string(),
            pack: "file-steward".into(),
            goal: format!(
                "apply {} steward ops: {}",
                self.ops.len(),
                self.rationale
            ),
            needs: Vec::new(),
            verify: Some("all-or-nothing".into()),
            retry: 0,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn batch(root: &str, ops: Vec<StewardOp>) -> SuggestionBatch {
        SuggestionBatch {
            root: PathBuf::from(root),
            rationale: "dedupe downloads".into(),
            ops,
        }
    }

    #[test]
    fn confined_batch_validates_and_becomes_one_task() {
        let b = batch(
            "/home/u/Downloads",
            vec![
                StewardOp::Dedupe {
                    keep: "/home/u/Downloads/a.pdf".into(),
                    trash: "/home/u/Downloads/a (copy).pdf".into(),
                },
                StewardOp::Trash {
                    path: "/home/u/Downloads/tmp.bin".into(),
                },
            ],
        );
        b.validate().unwrap();
        let t = b.as_task("steward-1");
        assert_eq!(t.pack, "file-steward");
        assert_eq!(t.verify.as_deref(), Some("all-or-nothing"));
        assert!(t.goal.contains("2 steward ops"));
    }

    #[test]
    fn outside_root_rejected_fail_loud() {
        let b = batch(
            "/home/u/Downloads",
            vec![StewardOp::Move {
                from: "/home/u/Downloads/a".into(),
                to: "/etc/a".into(),
            }],
        );
        assert_eq!(
            b.validate(),
            Err(StewardError::OutsideRoot {
                path: PathBuf::from("/etc/a")
            })
        );
    }

    #[test]
    fn empty_batch_rejected() {
        let b = batch("/home/u/Downloads", vec![]);
        assert_eq!(b.validate(), Err(StewardError::EmptyBatch));
    }

    #[test]
    fn lease_hit_is_refused_at_load_with_holder_named() {
        // Q2 wiring (AC-12): a management batch touching a leased path is
        // refused AT LOAD, before any execution planning.
        let b = batch(
            "/home/u/Downloads",
            vec![StewardOp::Trash { path: "/home/u/Downloads/wip.zip".into() }],
        );
        let mut leases = LeaseTable::default();
        leases.declare("sess-9", &["/home/u/Downloads/wip.zip".to_string()], 100, 300);
        assert_eq!(
            b.gate(&leases, 150),
            Err(StewardGateError::Leased {
                path: "/home/u/Downloads/wip.zip".into(),
                holder: "sess-9".into()
            })
        );
        // Unleased paths pass the gate.
        assert!(b.gate(&LeaseTable::default(), 150).is_ok());
    }

    #[test]
    fn two_phase_commit_lowers_to_trash_and_rolls_back() {
        // Q2 wiring (FR12.6): the batch commits through the stewardcore
        // two-phase intent model — trash-only records + rollback snapshot.
        let b = batch(
            "/home/u/Downloads",
            vec![
                StewardOp::Dedupe {
                    keep: "/home/u/Downloads/a.pdf".into(),
                    trash: "/home/u/Downloads/a (copy).pdf".into(),
                },
                StewardOp::Trash { path: "/home/u/Downloads/tmp.bin".into() },
            ],
        );
        let leases = LeaseTable::default();
        let committed = b.commit_two_phase("steward-b1", &leases, 100, 200).unwrap();
        // Both removals lowered to Trash — nothing deleted.
        assert_eq!(committed.records.len(), 2);
        assert!(committed.records.iter().all(|r| matches!(
            r.op,
            nofy_stewardcore::tombstone::ChangeOp::Trash { .. }
        )));
        // The rollback snapshot restores everything, in reverse.
        let inverses = nofy_stewardcore::mgmt::rollback(&committed.snapshot);
        assert_eq!(inverses.len(), 2);
        assert!(inverses.iter().all(|op| matches!(
            op,
            nofy_stewardcore::tombstone::InverseOp::Restore { .. }
        )));
    }

    #[test]
    fn two_phase_commit_refuses_leased_batches() {
        let b = batch(
            "/home/u/Downloads",
            vec![StewardOp::Trash { path: "/home/u/Downloads/wip.zip".into() }],
        );
        let mut leases = LeaseTable::default();
        leases.declare("sess-9", &["/home/u/Downloads/wip.zip".to_string()], 100, 300);
        assert!(matches!(
            b.commit_two_phase("steward-b2", &leases, 150, 200),
            Err(mgmt::IntentError::LeaseHit { .. })
        ));
    }

    #[test]
    fn move_batches_commit_through_the_intent_model() {
        // Move ops map onto the stewardcore Move intent and commit with a
        // rollback snapshot, same as the trash-lowering ops.
        let b = batch(
            "/home/u/Downloads",
            vec![StewardOp::Move {
                from: "/home/u/Downloads/a".into(),
                to: "/home/u/Downloads/sorted/a".into(),
            }],
        );
        b.validate().unwrap();
        let committed = b
            .commit_two_phase("steward-mv", &LeaseTable::default(), 100, 200)
            .unwrap();
        assert_eq!(committed.records.len(), 1);
        let inverses = nofy_stewardcore::mgmt::rollback(&committed.snapshot);
        assert_eq!(inverses.len(), 1, "the move is rollback-able");
    }
}
