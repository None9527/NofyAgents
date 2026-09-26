//! Change manifest + forwarding tombstones + batch undo (FR12.14).
//!
//! Every steward change lands in a manifest (batches are the unit). Moved
//! or renamed files leave a TOMBSTONE that forwards stale references to
//! the new location (「墓碑可解析陈旧引用」, AC-12). Every batch is
//! replayable and undoable (`undo --batch`): undo is derived from the
//! manifest, never from memory.

/// One change record in the manifest.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ChangeRecord {
    pub batch_id: String,
    pub path: String,
    pub op: ChangeOp,
    pub at: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ChangeOp {
    Move { from: String, to: String },
    Rename { from: String, to: String },
    Trash { from: String, trash_path: String },
}

/// Inverse operation for undo.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum InverseOp {
    MoveBack { from: String, to: String },
    Restore { from: String, to: String },
}

/// A tombstone: forwards a stale path to its successor.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Tombstone {
    pub from: String,
    pub to: String,
}

/// Resolution of a (possibly stale) reference.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Resolved {
    /// The path is current.
    Current(String),
    /// Forwarded through tombstone(s) to the successor.
    Forwarded { stale: String, current: String },
    /// No tombstone: the reference is dead.
    Dead(String),
}

/// Build tombstones from a manifest (moves/renames/trashes all forward).
pub fn tombstones(manifest: &[ChangeRecord]) -> Vec<Tombstone> {
    manifest
        .iter()
        .filter_map(|record| match &record.op {
            ChangeOp::Move { from, to } | ChangeOp::Rename { from, to } => Some(Tombstone {
                from: from.clone(),
                to: to.clone(),
            }),
            ChangeOp::Trash { from, trash_path } => Some(Tombstone {
                from: from.clone(),
                to: trash_path.clone(),
            }),
        })
        .collect()
}

/// Resolve a reference through the tombstone chain (bounded by chain
/// length — a cycle cannot loop forever).
pub fn resolve_reference(tombstones: &[Tombstone], path: &str) -> Resolved {
    let mut current = path.to_string();
    let mut forwarded = false;
    for _ in 0..=tombstones.len() {
        match tombstones.iter().find(|t| t.from == current) {
            Some(t) => {
                current = t.to.clone();
                forwarded = true;
            }
            None => break,
        }
    }
    if !forwarded {
        // No tombstone at all: the path is either current or dead — the
        // caller checks existence; here "no forwarding" = current.
        return Resolved::Current(path.to_string());
    }
    Resolved::Forwarded {
        stale: path.to_string(),
        current,
    }
}

/// Undo a whole batch: inverse ops in reverse order (replayable).
pub fn undo_batch(manifest: &[ChangeRecord], batch_id: &str) -> Vec<InverseOp> {
    manifest
        .iter()
        .filter(|r| r.batch_id == batch_id)
        .rev()
        .map(|record| match &record.op {
            ChangeOp::Move { from, to } | ChangeOp::Rename { from, to } => InverseOp::MoveBack {
                from: to.clone(),
                to: from.clone(),
            },
            ChangeOp::Trash { from, trash_path } => InverseOp::Restore {
                from: trash_path.clone(),
                to: from.clone(),
            },
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn manifest() -> Vec<ChangeRecord> {
        vec![
            ChangeRecord {
                batch_id: "b1".into(),
                path: "/a".into(),
                op: ChangeOp::Move {
                    from: "/a".into(),
                    to: "/b".into(),
                },
                at: 10,
            },
            ChangeRecord {
                batch_id: "b1".into(),
                path: "/b".into(),
                op: ChangeOp::Rename {
                    from: "/b".into(),
                    to: "/c".into(),
                },
                at: 20,
            },
            ChangeRecord {
                batch_id: "b2".into(),
                path: "/x".into(),
                op: ChangeOp::Trash {
                    from: "/x".into(),
                    trash_path: "/.trash/x".into(),
                },
                at: 30,
            },
        ]
    }

    #[test]
    fn tombstones_parse_stale_references() {
        let stones = tombstones(&manifest());
        // /a → /b → /c chains through two tombstones.
        assert_eq!(
            resolve_reference(&stones, "/a"),
            Resolved::Forwarded {
                stale: "/a".into(),
                current: "/c".into()
            }
        );
        assert_eq!(
            resolve_reference(&stones, "/b"),
            Resolved::Forwarded {
                stale: "/b".into(),
                current: "/c".into()
            }
        );
        // Trashed file forwards to the trash location.
        assert_eq!(
            resolve_reference(&stones, "/x"),
            Resolved::Forwarded {
                stale: "/x".into(),
                current: "/.trash/x".into()
            }
        );
        // Unknown path: no forwarding.
        assert_eq!(
            resolve_reference(&stones, "/zz"),
            Resolved::Current("/zz".into())
        );
    }

    #[test]
    fn undo_batch_is_inverse_and_reversed() {
        let undo = undo_batch(&manifest(), "b1");
        assert_eq!(undo.len(), 2);
        // Reverse order: rename undone first, then the move.
        assert_eq!(
            undo[0],
            InverseOp::MoveBack {
                from: "/c".into(),
                to: "/b".into()
            }
        );
        assert_eq!(
            undo[1],
            InverseOp::MoveBack {
                from: "/b".into(),
                to: "/a".into()
            }
        );
    }

    #[test]
    fn undo_trash_restores() {
        let undo = undo_batch(&manifest(), "b2");
        assert_eq!(
            undo,
            vec![InverseOp::Restore {
                from: "/.trash/x".into(),
                to: "/x".into()
            }]
        );
    }

    #[test]
    fn undo_of_unknown_batch_is_empty() {
        assert!(undo_batch(&manifest(), "ghost").is_empty());
    }

    #[test]
    fn tombstone_chain_terminates_on_cycle() {
        // A pathological cycle must not loop forever.
        let stones = vec![
            Tombstone {
                from: "/a".into(),
                to: "/b".into(),
            },
            Tombstone {
                from: "/b".into(),
                to: "/a".into(),
            },
        ];
        let _ = resolve_reference(&stones, "/a"); // terminates by bound
    }
}
