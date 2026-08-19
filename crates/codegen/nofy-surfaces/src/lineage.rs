//! Session lineage table (FR2.10, OC-F29): chained generations + origin
//! marks.
//!
//! Every session knows where it came from: root, fork, subagent spawn, or
//! compaction successor. Generations chain strictly (child = parent + 1),
//! parents must exist before children register — the lineage is a tree,
//! never a dangling reference.

use std::collections::BTreeMap;

/// How a session came to be.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SessionOrigin {
    /// A fresh session (no parent).
    Root,
    /// Forked from a parent (FR6.7: only the completed prefix crosses).
    Fork { parent: String },
    /// Spawned as a subagent of a parent.
    Subagent { parent: String },
    /// Compaction successor of a parent.
    Compact { parent: String },
}

impl SessionOrigin {
    pub fn parent(&self) -> Option<&str> {
        match self {
            SessionOrigin::Root => None,
            SessionOrigin::Fork { parent }
            | SessionOrigin::Subagent { parent }
            | SessionOrigin::Compact { parent } => Some(parent),
        }
    }
}

/// One lineage entry.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LineageEntry {
    pub session_id: String,
    pub generation: u64,
    pub origin: SessionOrigin,
    pub at: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum LineageError {
    /// Session already registered.
    Duplicate(String),
    /// Parent does not exist.
    MissingParent { session: String, parent: String },
    /// Generation must be parent + 1.
    GenerationMismatch { session: String, expected: u64, got: u64 },
    /// Roots must be generation 0.
    RootNotZero(String),
}

/// The lineage table.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct LineageTable {
    entries: BTreeMap<String, LineageEntry>,
}

impl LineageTable {
    /// Register a session. Validates the chain.
    pub fn register(&mut self, entry: LineageEntry) -> Result<(), LineageError> {
        if self.entries.contains_key(&entry.session_id) {
            return Err(LineageError::Duplicate(entry.session_id));
        }
        match &entry.origin {
            SessionOrigin::Root => {
                if entry.generation != 0 {
                    return Err(LineageError::RootNotZero(entry.session_id));
                }
            }
            origin => {
                let parent_id = origin.parent().unwrap();
                let Some(parent) = self.entries.get(parent_id) else {
                    return Err(LineageError::MissingParent {
                        session: entry.session_id.clone(),
                        parent: parent_id.to_string(),
                    });
                };
                let expected = parent.generation + 1;
                if entry.generation != expected {
                    return Err(LineageError::GenerationMismatch {
                        session: entry.session_id.clone(),
                        expected,
                        got: entry.generation,
                    });
                }
            }
        }
        self.entries.insert(entry.session_id.clone(), entry);
        Ok(())
    }

    pub fn get(&self, session_id: &str) -> Option<&LineageEntry> {
        self.entries.get(session_id)
    }

    /// Walk the chain from a session back to its root (inclusive, child
    /// first).
    pub fn chain(&self, session_id: &str) -> Vec<String> {
        let mut chain = Vec::new();
        let mut current = session_id.to_string();
        let mut seen = std::collections::BTreeSet::new();
        while let Some(entry) = self.entries.get(&current) {
            if !seen.insert(current.clone()) {
                break; // cycle guard
            }
            chain.push(current.clone());
            match entry.origin.parent() {
                Some(parent) => current = parent.to_string(),
                None => break,
            }
        }
        chain
    }

    /// Is `session` a descendant of `ancestor`?
    pub fn is_descendant(&self, session: &str, ancestor: &str) -> bool {
        self.chain(session).iter().skip(1).any(|id| id == ancestor)
    }

    pub fn len(&self) -> usize {
        self.entries.len()
    }

    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn entry(id: &str, generation: u64, origin: SessionOrigin) -> LineageEntry {
        LineageEntry { session_id: id.into(), generation, origin, at: 0 }
    }

    #[test]
    fn roots_register_at_generation_zero() {
        let mut table = LineageTable::default();
        assert!(table.register(entry("root", 0, SessionOrigin::Root)).is_ok());
        assert!(matches!(
            table.register(entry("bad-root", 3, SessionOrigin::Root)),
            Err(LineageError::RootNotZero(_))
        ));
    }

    #[test]
    fn children_chain_to_parents() {
        let mut table = LineageTable::default();
        table.register(entry("root", 0, SessionOrigin::Root)).unwrap();
        table
            .register(entry("fork-1", 1, SessionOrigin::Fork { parent: "root".into() }))
            .unwrap();
        table
            .register(entry("sub-1", 2, SessionOrigin::Subagent { parent: "fork-1".into() }))
            .unwrap();
        assert_eq!(table.chain("sub-1"), vec!["sub-1".to_string(), "fork-1".into(), "root".into()]);
        assert!(table.is_descendant("sub-1", "root"));
        assert!(!table.is_descendant("root", "sub-1"));
    }

    #[test]
    fn missing_parent_refused() {
        let mut table = LineageTable::default();
        assert!(matches!(
            table.register(entry("orphan", 1, SessionOrigin::Fork { parent: "ghost".into() })),
            Err(LineageError::MissingParent { .. })
        ));
    }

    #[test]
    fn generation_mismatch_refused() {
        let mut table = LineageTable::default();
        table.register(entry("root", 0, SessionOrigin::Root)).unwrap();
        assert!(matches!(
            table.register(entry("skip", 5, SessionOrigin::Fork { parent: "root".into() })),
            Err(LineageError::GenerationMismatch { expected: 1, got: 5, .. })
        ));
    }

    #[test]
    fn duplicate_refused() {
        let mut table = LineageTable::default();
        table.register(entry("root", 0, SessionOrigin::Root)).unwrap();
        assert!(matches!(
            table.register(entry("root", 0, SessionOrigin::Root)),
            Err(LineageError::Duplicate(_))
        ));
    }

    #[test]
    fn compaction_successor_chains() {
        let mut table = LineageTable::default();
        table.register(entry("s1", 0, SessionOrigin::Root)).unwrap();
        table
            .register(entry("s1-compacted", 1, SessionOrigin::Compact { parent: "s1".into() }))
            .unwrap();
        assert_eq!(table.chain("s1-compacted"), vec!["s1-compacted".to_string(), "s1".into()]);
    }
}
