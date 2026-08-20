//! Management tool surface (FR12.6): move / rename / tag / dedupe /
//! cleanup.
//!
//! Three construction-level guarantees:
//!
//! - **trash-over-delete**: [`MgmtOp`] has NO delete variant — the only
//!   destructive exit is `Trash` (dedupe and cleanup both lower to it);
//! - **two-phase intent**: ops first validate as an INTENT at load time
//!   (root confinement, lease hits, target collisions), and only a
//!   validated intent may commit;
//! - **rollback snapshots**: a committed batch derives its rollback from
//!   manifest records ([`crate::tombstone`]), never from memory.

use std::collections::BTreeSet;

use crate::lease::LeaseTable;
use crate::roots::{PathClass, RootTable};
use crate::tombstone::{ChangeOp, ChangeRecord, InverseOp, undo_batch};

/// One management operation. Deliberately no `Delete` variant: the only
/// destructive exit is trash.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum MgmtOp {
    Move { from: String, to: String },
    Rename { from: String, to: String },
    /// Metadata-only: tags never move or destroy bytes.
    Tag { path: String, tag: String },
    /// Keep one copy, trash the rest.
    Dedupe { keep: String, duplicates: Vec<String> },
    /// Trash a path (cleanup).
    Cleanup { path: String },
}

/// Phase one: a proposed batch, not yet executable.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MgmtIntent {
    pub batch_id: String,
    pub ops: Vec<MgmtOp>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum IntentError {
    EmptyBatch,
    OutsideRoot { path: String },
    /// 「租约命中的管理操作加载期即拒」(AC-12): refused AT LOAD.
    LeaseHit { path: String, holder: String },
    TargetCollision { to: String },
    EmptyTag,
    DedupeKeepIsDuplicate { keep: String },
    EmptyDedupe,
}

/// Load-time validation context.
pub struct IntentContext<'a> {
    pub roots: &'a RootTable,
    pub leases: &'a LeaseTable,
    pub now: u64,
    /// Paths currently on disk (collision source for move/rename targets).
    pub existing: &'a BTreeSet<String>,
}

impl MgmtOp {
    /// Every path this op reads or writes.
    pub fn touched_paths(&self) -> Vec<&str> {
        match self {
            MgmtOp::Move { from, to } | MgmtOp::Rename { from, to } => {
                vec![from.as_str(), to.as_str()]
            }
            MgmtOp::Tag { path, .. } => vec![path.as_str()],
            MgmtOp::Dedupe { keep, duplicates } => {
                let mut out = vec![keep.as_str()];
                out.extend(duplicates.iter().map(|s| s.as_str()));
                out
            }
            MgmtOp::Cleanup { path } => vec![path.as_str()],
        }
    }

    /// Move/rename targets (collision candidates).
    fn target(&self) -> Option<&str> {
        match self {
            MgmtOp::Move { to, .. } | MgmtOp::Rename { to, .. } => Some(to.as_str()),
            _ => None,
        }
    }
}

/// Phase one gate: validate the whole intent at LOAD time. Any violation
/// refuses the ENTIRE batch (fail-loud, no partial intents).
pub fn validate_intent(intent: &MgmtIntent, ctx: &IntentContext) -> Result<(), IntentError> {
    if intent.ops.is_empty() {
        return Err(IntentError::EmptyBatch);
    }
    let mut targets: BTreeSet<&str> = BTreeSet::new();
    for op in &intent.ops {
        for path in op.touched_paths() {
            if !matches!(ctx.roots.classify(path), PathClass::Inside { .. }) {
                return Err(IntentError::OutsideRoot { path: path.to_string() });
            }
            if let Some(holder) = ctx.leases.lease_holder(path, ctx.now) {
                return Err(IntentError::LeaseHit {
                    path: path.to_string(),
                    holder: holder.to_string(),
                });
            }
        }
        if let MgmtOp::Tag { tag, .. } = op {
            if tag.trim().is_empty() {
                return Err(IntentError::EmptyTag);
            }
        }
        if let MgmtOp::Dedupe { keep, duplicates } = op {
            if duplicates.is_empty() {
                return Err(IntentError::EmptyDedupe);
            }
            if duplicates.iter().any(|d| d == keep) {
                return Err(IntentError::DedupeKeepIsDuplicate { keep: keep.clone() });
            }
        }
        if let Some(to) = op.target() {
            if ctx.existing.contains(to) || !targets.insert(to) {
                return Err(IntentError::TargetCollision { to: to.to_string() });
            }
        }
    }
    Ok(())
}

/// A committed batch: manifest records + tag entries + rollback snapshot.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CommittedBatch {
    pub batch_id: String,
    pub records: Vec<ChangeRecord>,
    pub tags: Vec<(String, String)>,
    pub snapshot: RollbackSnapshot,
}

/// Rollback for one committed batch, derived from the manifest.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RollbackSnapshot {
    pub batch_id: String,
    pub inverses: Vec<InverseOp>,
}

fn trash_path(batch_id: &str, from: &str) -> String {
    let name = from.rsplit('/').next().unwrap_or(from);
    format!("/.trash/{batch_id}/{name}")
}

/// Phase two: commit a VALIDATED intent into manifest records. Trash is
/// the only destructive exit: dedupe and cleanup both lower to
/// [`ChangeOp::Trash`].
pub fn commit_intent(intent: &MgmtIntent, at: u64) -> CommittedBatch {
    let mut records = Vec::new();
    let mut tags = Vec::new();
    for op in &intent.ops {
        match op {
            MgmtOp::Move { from, to } => records.push(ChangeRecord {
                batch_id: intent.batch_id.clone(),
                path: from.clone(),
                op: ChangeOp::Move { from: from.clone(), to: to.clone() },
                at,
            }),
            MgmtOp::Rename { from, to } => records.push(ChangeRecord {
                batch_id: intent.batch_id.clone(),
                path: from.clone(),
                op: ChangeOp::Rename { from: from.clone(), to: to.clone() },
                at,
            }),
            MgmtOp::Tag { path, tag } => tags.push((path.clone(), tag.clone())),
            MgmtOp::Dedupe { duplicates, .. } => {
                for dup in duplicates {
                    records.push(ChangeRecord {
                        batch_id: intent.batch_id.clone(),
                        path: dup.clone(),
                        op: ChangeOp::Trash {
                            from: dup.clone(),
                            trash_path: trash_path(&intent.batch_id, dup),
                        },
                        at,
                    });
                }
            }
            MgmtOp::Cleanup { path } => records.push(ChangeRecord {
                batch_id: intent.batch_id.clone(),
                path: path.clone(),
                op: ChangeOp::Trash {
                    from: path.clone(),
                    trash_path: trash_path(&intent.batch_id, path),
                },
                at,
            }),
        }
    }
    let snapshot = RollbackSnapshot {
        batch_id: intent.batch_id.clone(),
        inverses: undo_batch(&records, &intent.batch_id),
    };
    CommittedBatch {
        batch_id: intent.batch_id.clone(),
        records,
        tags,
        snapshot,
    }
}

/// Apply a rollback snapshot: the inverse ops, in manifest order.
pub fn rollback(snapshot: &RollbackSnapshot) -> &[InverseOp] {
    &snapshot.inverses
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::roots::RootTier;

    fn ctx<'a>(
        roots: &'a RootTable,
        leases: &'a LeaseTable,
        existing: &'a BTreeSet<String>,
    ) -> IntentContext<'a> {
        IntentContext { roots, leases, now: 100, existing }
    }

    fn roots() -> RootTable {
        let mut r = RootTable::new();
        r.add_root("/media", RootTier::Manage);
        r
    }

    #[test]
    fn outside_root_refused_at_load() {
        let (leases, existing) = (LeaseTable::default(), BTreeSet::new());
        let intent = MgmtIntent {
            batch_id: "b1".into(),
            ops: vec![MgmtOp::Cleanup { path: "/etc/passwd".into() }],
        };
        assert_eq!(
            validate_intent(&intent, &ctx(&roots(), &leases, &existing)),
            Err(IntentError::OutsideRoot { path: "/etc/passwd".into() })
        );
    }

    #[test]
    fn lease_hit_refused_at_load_with_holder_named() {
        let mut leases = LeaseTable::default();
        leases.declare("sess-7", &["/media/wip.txt".to_string()], 50, 300);
        let existing = BTreeSet::new();
        let intent = MgmtIntent {
            batch_id: "b1".into(),
            ops: vec![MgmtOp::Move { from: "/media/wip.txt".into(), to: "/media/done.txt".into() }],
        };
        assert_eq!(
            validate_intent(&intent, &ctx(&roots(), &leases, &existing)),
            Err(IntentError::LeaseHit { path: "/media/wip.txt".into(), holder: "sess-7".into() })
        );
    }

    #[test]
    fn target_collision_refused() {
        let leases = LeaseTable::default();
        let mut existing = BTreeSet::new();
        existing.insert("/media/keep.txt".to_string());
        let intent = MgmtIntent {
            batch_id: "b1".into(),
            ops: vec![MgmtOp::Rename { from: "/media/a.txt".into(), to: "/media/keep.txt".into() }],
        };
        assert!(matches!(
            validate_intent(&intent, &ctx(&roots(), &leases, &existing)),
            Err(IntentError::TargetCollision { .. })
        ));
        // Two ops claiming the same target also collide.
        let intent2 = MgmtIntent {
            batch_id: "b1".into(),
            ops: vec![
                MgmtOp::Rename { from: "/media/a.txt".into(), to: "/media/t.txt".into() },
                MgmtOp::Rename { from: "/media/b.txt".into(), to: "/media/t.txt".into() },
            ],
        };
        assert!(matches!(
            validate_intent(&intent2, &ctx(&roots(), &leases, &existing)),
            Err(IntentError::TargetCollision { .. })
        ));
    }

    #[test]
    fn degenerate_ops_refused() {
        let (leases, existing) = (LeaseTable::default(), BTreeSet::new());
        let roots = roots();
        let c = ctx(&roots, &leases, &existing);
        assert_eq!(
            validate_intent(&MgmtIntent { batch_id: "b".into(), ops: vec![] }, &c),
            Err(IntentError::EmptyBatch)
        );
        assert_eq!(
            validate_intent(
                &MgmtIntent {
                    batch_id: "b".into(),
                    ops: vec![MgmtOp::Tag { path: "/media/f".into(), tag: "  ".into() }]
                },
                &c
            ),
            Err(IntentError::EmptyTag)
        );
        assert_eq!(
            validate_intent(
                &MgmtIntent {
                    batch_id: "b".into(),
                    ops: vec![MgmtOp::Dedupe { keep: "/media/a".into(), duplicates: vec![] }]
                },
                &c
            ),
            Err(IntentError::EmptyDedupe)
        );
        assert_eq!(
            validate_intent(
                &MgmtIntent {
                    batch_id: "b".into(),
                    ops: vec![MgmtOp::Dedupe {
                        keep: "/media/a".into(),
                        duplicates: vec!["/media/a".into()]
                    }]
                },
                &c
            ),
            Err(IntentError::DedupeKeepIsDuplicate { keep: "/media/a".into() })
        );
    }

    #[test]
    fn legal_intent_passes_load_validation() {
        // 全部合法:根内、无租约、无碰撞——加载期放行。
        let leases = LeaseTable::default();
        let mut existing = BTreeSet::new();
        existing.insert("/media/src.txt".to_string());
        let intent = MgmtIntent {
            batch_id: "b-ok".into(),
            ops: vec![
                MgmtOp::Move { from: "/media/src.txt".into(), to: "/media/dst.txt".into() },
                MgmtOp::Tag { path: "/media/dst.txt".into(), tag: "sorted".into() },
                MgmtOp::Dedupe {
                    keep: "/media/img-1.jpg".into(),
                    duplicates: vec!["/media/img-2.jpg".into()],
                },
                MgmtOp::Cleanup { path: "/media/junk".into() },
            ],
        };
        assert_eq!(
            validate_intent(&intent, &ctx(&roots(), &leases, &existing)),
            Ok(())
        );
    }

    #[test]
    fn commit_lowers_every_destructive_op_to_trash() {
        let intent = MgmtIntent {
            batch_id: "b9".into(),
            ops: vec![
                MgmtOp::Move { from: "/media/a".into(), to: "/media/b".into() },
                MgmtOp::Tag { path: "/media/b".into(), tag: "sorted".into() },
                MgmtOp::Dedupe {
                    keep: "/media/img-1.jpg".into(),
                    duplicates: vec!["/media/img-1 (2).jpg".into()],
                },
                MgmtOp::Cleanup { path: "/media/junk".into() },
            ],
        };
        let committed = commit_intent(&intent, 200);
        // No op deleted anything: move + two trashes, all reversible
        // (tags are metadata-only and carry no manifest record).
        assert_eq!(committed.records.len(), 3);
        let trash_paths: Vec<&str> = committed
            .records
            .iter()
            .filter_map(|r| match &r.op {
                ChangeOp::Trash { trash_path, .. } => Some(trash_path.as_str()),
                _ => None,
            })
            .collect();
        assert_eq!(trash_paths.len(), 2, "dedupe dup + cleanup both lower to trash");
        assert!(
            trash_paths.iter().all(|p| p.starts_with("/.trash/b9/")),
            "trash stays under the trash root"
        );
        assert_eq!(committed.tags, vec![("/media/b".to_string(), "sorted".to_string())]);
    }

    #[test]
    fn rename_commits_to_the_manifest_and_rolls_back() {
        let intent = MgmtIntent {
            batch_id: "b-r".into(),
            ops: vec![MgmtOp::Rename { from: "/media/old.txt".into(), to: "/media/new.txt".into() }],
        };
        let committed = commit_intent(&intent, 300);
        assert_eq!(committed.records.len(), 1);
        assert_eq!(
            committed.records[0].op,
            ChangeOp::Rename { from: "/media/old.txt".into(), to: "/media/new.txt".into() }
        );
        // Rename 的逆操作与 Move 同形:新名 → 旧名。
        assert_eq!(
            rollback(&committed.snapshot),
            &[InverseOp::MoveBack { from: "/media/new.txt".into(), to: "/media/old.txt".into() }]
        );
    }

    #[test]
    fn rollback_snapshot_restores_everything() {
        let intent = MgmtIntent {
            batch_id: "b9".into(),
            ops: vec![
                MgmtOp::Move { from: "/media/a".into(), to: "/media/b".into() },
                MgmtOp::Cleanup { path: "/media/junk".into() },
            ],
        };
        let committed = commit_intent(&intent, 200);
        let inverses = rollback(&committed.snapshot);
        assert_eq!(inverses.len(), 2);
        // Reverse order: cleanup restored first, then the move undone.
        assert_eq!(
            inverses[0],
            InverseOp::Restore { from: "/.trash/b9/junk".into(), to: "/media/junk".into() }
        );
        assert_eq!(
            inverses[1],
            InverseOp::MoveBack { from: "/media/b".into(), to: "/media/a".into() }
        );
    }
}
