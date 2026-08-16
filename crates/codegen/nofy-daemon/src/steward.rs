//! File-steward runtime behavior (PRD FR12): suggestion batches with
//! trash-only semantics, converted into orchestration tasks (FR11) so a
//! steward proposal executes through the same plan/approval machinery as
//! any project work.
//!
//! Invariants pinned here, by construction where possible:
//! - **no delete**: the op set has no destructive variant; removals are
//!   `Trash` moves the provider executes (trash-over-delete);
//! - **root confinement**: every path must live inside one of the opted-in
//!   roots; anything else is rejected at validation, fail-loud;
//! - **batch is one approval unit**: approve-all or reject-all; partial
//!   approval is not representable, keeping the audit ledger simple.

use std::path::PathBuf;

use serde::{Deserialize, Serialize};

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

impl SuggestionBatch {
    /// Validate confinement: every path in every op under `root`.
    pub fn validate(&self) -> Result<(), StewardError> {
        if self.ops.is_empty() {
            return Err(StewardError::EmptyBatch);
        }
        let paths = self.ops.iter().flat_map(|op| match op {
            StewardOp::Move { from, to } => vec![from, to],
            StewardOp::Dedupe { keep, trash } => vec![keep, trash],
            StewardOp::Trash { path } => vec![path],
        });
        for p in paths {
            if !p.starts_with(&self.root) {
                return Err(StewardError::OutsideRoot { path: p.clone() });
            }
        }
        Ok(())
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
}
