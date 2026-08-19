//! Dreaming: three-phase distillation with rollback-capable preimages
//! (FR4.13, OC-F11).
//!
//! Dreaming distills memory offline in THREE phases, in order:
//!
//! 1. **Collect** — gather distillation candidates;
//! 2. **Distill** — produce the distilled items;
//! 3. **Commit** — apply the distillation to the store.
//!
//! Construction-level guarantees:
//!
//! - phases cannot be skipped or reordered (a commit without a completed
//!   distill is refused);
//! - every commit emits a PREIMAGE capturing exactly what it replaced;
//! - rollback(preimage) is the exact inverse of its commit.

/// One distillation candidate.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Candidate {
    pub id: String,
    pub content: String,
}

/// One distilled item replacing one or more candidates.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Distilled {
    pub id: String,
    pub replaces: Vec<String>,
    pub content: String,
}

/// The three phases, in the only legal order.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Phase {
    Collect,
    Distill,
    Commit,
}

/// Dream run state (pure fold over phase transitions).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DreamRun {
    pub phase: Phase,
    pub candidates: Vec<Candidate>,
    pub distilled: Vec<Distilled>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum DreamError {
    /// Phase order violated (e.g. commit before distill, distill after
    /// commit).
    BadPhase { at: Phase, wanted: Phase },
    /// Nothing was collected (or distill tried to skip collect).
    EmptyCollect,
    /// A distilled item replaces unknown candidates.
    DanglingReplace { distilled: String, unknown: String },
    /// A distilled item replaces nothing.
    EmptyReplace { distilled: String },
    /// Commit with no distillation.
    EmptyDistill,
}

impl DreamRun {
    pub fn new() -> Self {
        Self { phase: Phase::Collect, candidates: Vec::new(), distilled: Vec::new() }
    }

    /// Phase 1: collect candidates.
    pub fn collect(&mut self, candidates: Vec<Candidate>) -> Result<(), DreamError> {
        if self.phase != Phase::Collect {
            return Err(DreamError::BadPhase { at: self.phase, wanted: Phase::Collect });
        }
        if candidates.is_empty() {
            return Err(DreamError::EmptyCollect);
        }
        self.candidates = candidates;
        Ok(())
    }

    /// Phase 2: distill. Collect must have happened (non-empty
    /// candidates); every replacement target must exist and every
    /// distilled item must replace at least one candidate.
    pub fn distill(&mut self, distilled: Vec<Distilled>) -> Result<(), DreamError> {
        if self.phase != Phase::Collect {
            return Err(DreamError::BadPhase { at: self.phase, wanted: Phase::Collect });
        }
        if self.candidates.is_empty() {
            return Err(DreamError::EmptyCollect);
        }
        if distilled.is_empty() {
            return Err(DreamError::EmptyDistill);
        }
        for item in &distilled {
            if item.replaces.is_empty() {
                return Err(DreamError::EmptyReplace { distilled: item.id.clone() });
            }
            for target in &item.replaces {
                if !self.candidates.iter().any(|c| &c.id == target) {
                    return Err(DreamError::DanglingReplace {
                        distilled: item.id.clone(),
                        unknown: target.clone(),
                    });
                }
            }
        }
        self.distilled = distilled;
        self.phase = Phase::Distill;
        Ok(())
    }

    /// Phase 3: commit. Returns the preimage — everything the commit
    /// replaces — so the dream is rollback-capable.
    pub fn commit(&mut self) -> Result<Preimage, DreamError> {
        if self.phase != Phase::Distill {
            return Err(DreamError::BadPhase { at: self.phase, wanted: Phase::Distill });
        }
        let replaced: Vec<Candidate> = self
            .candidates
            .iter()
            .filter(|c| self.distilled.iter().any(|d| d.replaces.iter().any(|r| r == &c.id)))
            .cloned()
            .collect();
        self.phase = Phase::Commit;
        Ok(Preimage { replaced, applied: self.distilled.clone() })
    }
}

/// Everything a commit replaced, plus what it applied. Rollback is the
/// exact inverse: restore `replaced`, remove `applied`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Preimage {
    pub replaced: Vec<Candidate>,
    pub applied: Vec<Distilled>,
}

/// The store dreaming operates on (items keyed by id).
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct DreamStore {
    pub items: Vec<Candidate>,
}

/// Apply a committed dream to the store.
pub fn apply_dream(store: &mut DreamStore, preimage: &Preimage) {
    store.items.retain(|item| !preimage.replaced.iter().any(|r| r.id == item.id));
    for d in &preimage.applied {
        store.items.push(Candidate { id: d.id.clone(), content: d.content.clone() });
    }
}

/// Rollback: the exact inverse of [`apply_dream`].
pub fn rollback_dream(store: &mut DreamStore, preimage: &Preimage) {
    store.items.retain(|item| !preimage.applied.iter().any(|d| d.id == item.id));
    store.items.extend(preimage.replaced.iter().cloned());
}

#[cfg(test)]
mod tests {
    use super::*;

    fn run() -> DreamRun {
        let mut run = DreamRun::new();
        run.collect(vec![
            Candidate { id: "c1".into(), content: "verbose one".into() },
            Candidate { id: "c2".into(), content: "verbose two".into() },
            Candidate { id: "c3".into(), content: "untouched".into() },
        ])
        .unwrap();
        run
    }

    #[test]
    fn phases_cannot_skip_or_reorder() {
        let mut run = DreamRun::new();
        // Distill without collect is refused (collect skipped).
        assert!(matches!(
            run.distill(vec![Distilled { id: "d".into(), replaces: vec!["c1".into()], content: "x".into() }]),
            Err(DreamError::EmptyCollect)
        ));
        // Commit before distill is refused.
        assert!(matches!(run.commit(), Err(DreamError::BadPhase { .. })));
        // Empty collect is refused.
        assert!(matches!(run.collect(vec![]), Err(DreamError::EmptyCollect)));
    }

    #[test]
    fn distill_validates_replacement_targets() {
        let mut run = run();
        assert!(matches!(
            run.distill(vec![Distilled { id: "d".into(), replaces: vec!["ghost".into()], content: "x".into() }]),
            Err(DreamError::DanglingReplace { .. })
        ));
        assert!(matches!(
            run.distill(vec![Distilled { id: "d".into(), replaces: vec![], content: "x".into() }]),
            Err(DreamError::EmptyReplace { .. })
        ));
        assert!(matches!(run.distill(vec![]), Err(DreamError::EmptyDistill)));
    }

    #[test]
    fn commit_emits_the_full_preimage() {
        let mut run = run();
        run.distill(vec![Distilled {
            id: "d1".into(),
            replaces: vec!["c1".into(), "c2".into()],
            content: "distilled pair".into(),
        }])
        .unwrap();
        let pre = run.commit().unwrap();
        assert_eq!(pre.replaced.len(), 2, "only replaced candidates enter the preimage");
        assert!(!pre.replaced.iter().any(|c| c.id == "c3"), "untouched items stay out");
        assert_eq!(pre.applied.len(), 1);
        // A second commit is refused: the dream already landed.
        assert!(matches!(run.commit(), Err(DreamError::BadPhase { .. })));
    }

    #[test]
    fn rollback_is_the_exact_inverse_of_apply() {
        let mut store = DreamStore {
            items: vec![
                Candidate { id: "c1".into(), content: "verbose one".into() },
                Candidate { id: "c2".into(), content: "verbose two".into() },
                Candidate { id: "c3".into(), content: "untouched".into() },
            ],
        };
        let before = store.clone();
        let pre = Preimage {
            replaced: vec![
                Candidate { id: "c1".into(), content: "verbose one".into() },
                Candidate { id: "c2".into(), content: "verbose two".into() },
            ],
            applied: vec![Distilled { id: "d1".into(), replaces: vec!["c1".into(), "c2".into()], content: "distilled pair".into() }],
        };
        apply_dream(&mut store, &pre);
        assert_eq!(store.items.len(), 2, "c3 + d1");
        assert!(store.items.iter().any(|i| i.id == "d1"));
        rollback_dream(&mut store, &pre);
        // Exact inverse: the store is precisely what it was before.
        let mut restored = store.items.clone();
        restored.sort_by(|a, b| a.id.cmp(&b.id));
        let mut original = before.items.clone();
        original.sort_by(|a, b| a.id.cmp(&b.id));
        assert_eq!(restored, original);
    }
}
