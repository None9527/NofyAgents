//! The three persistence principles + `persistence_uncertain` tool
//! semantics (FR1.12/1.13, PI-F9~F11, DS-#4).
//!
//! The runtime persists THREE families, and every member of each family
//! is persistent — lanes, operations, deferred items. A crash must never
//! lose any of them. `persistence_uncertain` is a first-class tool
//! semantic: a tool that cannot confirm its effects survived reports
//! Uncertain, and Uncertain is NEVER silently promoted to Persistent.

/// Persistence classification.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PersistClass {
    Persistent,
    /// Anything not confirmed persistent. Fail-closed default.
    Volatile,
}

/// One runtime lane (a named stream of work).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Lane {
    pub id: String,
    pub class: PersistClass,
}

/// One operation recorded on a lane.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Operation {
    pub id: String,
    pub lane: String,
    pub class: PersistClass,
}

/// One deferred item (work postponed, not dropped).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Deferred {
    pub id: String,
    pub class: PersistClass,
}

/// The runtime's persisted universe.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct RuntimeState {
    pub lanes: Vec<Lane>,
    pub operations: Vec<Operation>,
    pub deferred: Vec<Deferred>,
}

/// A violation of one of the three principles.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Violation {
    VolatileLane(String),
    VolatileOperation(String),
    VolatileDeferred(String),
}

/// Audit the three principles: every lane, every operation, every
/// deferred item must be persistent.
pub fn audit_persistence(state: &RuntimeState) -> Vec<Violation> {
    let mut violations = Vec::new();
    for lane in &state.lanes {
        if lane.class == PersistClass::Volatile {
            violations.push(Violation::VolatileLane(lane.id.clone()));
        }
    }
    for op in &state.operations {
        if op.class == PersistClass::Volatile {
            violations.push(Violation::VolatileOperation(op.id.clone()));
        }
    }
    for item in &state.deferred {
        if item.class == PersistClass::Volatile {
            violations.push(Violation::VolatileDeferred(item.id.clone()));
        }
    }
    violations
}

/// Tool-effect persistence semantics (FR1.13).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ToolPersistSemantics {
    /// The tool confirmed its effects are persistent.
    Certain,
    /// The tool CANNOT confirm persistence. Callers must re-verify or
    /// re-apply; this never degrades to silent loss nor promotes to
    /// Certain on its own.
    Uncertain,
}

/// Decide whether a tool effect may be recorded as persistent.
pub fn may_record_persistent(semantics: ToolPersistSemantics) -> bool {
    semantics == ToolPersistSemantics::Certain
}

/// Decide whether a tool effect needs re-verification after a crash.
pub fn needs_reverify(semantics: ToolPersistSemantics) -> bool {
    semantics == ToolPersistSemantics::Uncertain
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn all_persistent_passes_the_audit() {
        let state = RuntimeState {
            lanes: vec![Lane {
                id: "main".into(),
                class: PersistClass::Persistent,
            }],
            operations: vec![Operation {
                id: "op1".into(),
                lane: "main".into(),
                class: PersistClass::Persistent,
            }],
            deferred: vec![Deferred {
                id: "d1".into(),
                class: PersistClass::Persistent,
            }],
        };
        assert!(audit_persistence(&state).is_empty());
    }

    #[test]
    fn every_volatile_member_is_a_named_violation() {
        let state = RuntimeState {
            lanes: vec![Lane {
                id: "tmp".into(),
                class: PersistClass::Volatile,
            }],
            operations: vec![Operation {
                id: "op2".into(),
                lane: "tmp".into(),
                class: PersistClass::Volatile,
            }],
            deferred: vec![Deferred {
                id: "d2".into(),
                class: PersistClass::Volatile,
            }],
        };
        let violations = audit_persistence(&state);
        assert_eq!(violations.len(), 3, "all three principles enforced");
        assert!(violations.contains(&Violation::VolatileLane("tmp".into())));
        assert!(violations.contains(&Violation::VolatileOperation("op2".into())));
        assert!(violations.contains(&Violation::VolatileDeferred("d2".into())));
    }

    #[test]
    fn uncertain_never_records_as_persistent() {
        assert!(!may_record_persistent(ToolPersistSemantics::Uncertain));
        assert!(may_record_persistent(ToolPersistSemantics::Certain));
    }

    #[test]
    fn uncertain_always_reverifies() {
        assert!(needs_reverify(ToolPersistSemantics::Uncertain));
        assert!(!needs_reverify(ToolPersistSemantics::Certain));
    }
}
