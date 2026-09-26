//! Index is hint, disk is truth (FR12.9, PI-F3 variant).
//!
//! The index can be stale — files move, shrink, vanish between indexing
//! and action. Every OPERATION re-validates its target against the real
//! file first; a drifted or gone target aborts the operation and triggers
//! re-indexing, never a blind write (「操作前真实文件再验证」, AC-12).

/// What the index believes.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct IndexHint {
    pub path: String,
    pub size: u64,
    pub mtime: u64,
}

/// What the disk actually has (None = file does not exist).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct FileMeta {
    pub size: u64,
    pub mtime: u64,
}

/// Revalidation outcome.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RevalidateOutcome {
    /// Hint matches disk: the operation may proceed.
    Fresh,
    /// Disk differs from the hint: abort + re-index.
    Drifted { actual: FileMeta },
    /// File is gone: abort + drop the index entry.
    Gone,
}

/// Re-validate an index hint against actual disk metadata.
pub fn revalidate(hint: &IndexHint, actual: Option<&FileMeta>) -> RevalidateOutcome {
    match actual {
        None => RevalidateOutcome::Gone,
        Some(meta) => {
            if meta.size == hint.size && meta.mtime == hint.mtime {
                RevalidateOutcome::Fresh
            } else {
                RevalidateOutcome::Drifted {
                    actual: meta.clone(),
                }
            }
        }
    }
}

/// Operation gate: proceed only on Fresh.
pub fn may_proceed(outcome: &RevalidateOutcome) -> bool {
    matches!(outcome, RevalidateOutcome::Fresh)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn hint() -> IndexHint {
        IndexHint {
            path: "/f".into(),
            size: 100,
            mtime: 50,
        }
    }

    #[test]
    fn fresh_hint_proceeds() {
        let outcome = revalidate(
            &hint(),
            Some(&FileMeta {
                size: 100,
                mtime: 50,
            }),
        );
        assert_eq!(outcome, RevalidateOutcome::Fresh);
        assert!(may_proceed(&outcome));
    }

    #[test]
    fn size_drift_aborts() {
        let outcome = revalidate(
            &hint(),
            Some(&FileMeta {
                size: 200,
                mtime: 50,
            }),
        );
        assert!(matches!(outcome, RevalidateOutcome::Drifted { .. }));
        assert!(!may_proceed(&outcome));
    }

    #[test]
    fn mtime_drift_aborts() {
        let outcome = revalidate(
            &hint(),
            Some(&FileMeta {
                size: 100,
                mtime: 999,
            }),
        );
        assert!(matches!(outcome, RevalidateOutcome::Drifted { .. }));
        assert!(!may_proceed(&outcome));
    }

    #[test]
    fn gone_file_aborts() {
        let outcome = revalidate(&hint(), None);
        assert_eq!(outcome, RevalidateOutcome::Gone);
        assert!(!may_proceed(&outcome));
    }

    #[test]
    fn stale_index_never_reaches_blind_write() {
        // The whole proposition: a stale index entry cannot drive an
        // operation to disk — the gate closes on any drift.
        let stale = IndexHint {
            path: "/moved".into(),
            size: 10,
            mtime: 1,
        };
        for actual in [
            None,
            Some(FileMeta { size: 11, mtime: 1 }),
            Some(FileMeta { size: 10, mtime: 2 }),
        ] {
            assert!(!may_proceed(&revalidate(&stale, actual.as_ref())));
        }
    }
}
