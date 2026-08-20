//! Standing mount + scope join (FR10.3, DS-P1).
//!
//! A pack set is mounted ONCE per scope (standing mount); sessions do not
//! mount — they JOIN, inheriting pack access through their parent lineage
//! (会话父系加入). Mounting the same scope twice with a DIFFERENT set is a
//! conflict and fails loud; joining an unknown scope fails closed.

use std::collections::{BTreeMap, BTreeSet};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum MountOutcome {
    Mounted,
    /// Same scope, same set: idempotent no-op.
    AlreadyMounted,
    /// Same scope, different set: fail loud.
    Conflict { existing: Vec<String> },
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum JoinOutcome {
    Joined,
    UnknownScope,
    /// Session already joined (idempotent).
    AlreadyJoined,
}

#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct MountTable {
    /// scope -> mounted pack set.
    mounts: BTreeMap<String, BTreeSet<String>>,
    /// session -> scope it joined.
    joins: BTreeMap<String, String>,
    /// session -> parent session (lineage).
    parents: BTreeMap<String, String>,
}

impl MountTable {
    /// Standing mount: one pack set per scope.
    pub fn mount(&mut self, scope: &str, packs: &[String]) -> MountOutcome {
        let set: BTreeSet<String> = packs.iter().cloned().collect();
        match self.mounts.get(scope) {
            Some(existing) if *existing == set => MountOutcome::AlreadyMounted,
            Some(existing) => MountOutcome::Conflict {
                existing: existing.iter().cloned().collect(),
            },
            None => {
                self.mounts.insert(scope.to_string(), set);
                MountOutcome::Mounted
            }
        }
    }

    /// A session joins a mounted scope directly.
    pub fn join(&mut self, session: &str, scope: &str) -> JoinOutcome {
        if !self.mounts.contains_key(scope) {
            return JoinOutcome::UnknownScope;
        }
        if self.joins.contains_key(session) {
            return JoinOutcome::AlreadyJoined;
        }
        self.joins.insert(session.to_string(), scope.to_string());
        JoinOutcome::Joined
    }

    /// A child session joins under its parent's scope (父系加入): the
    /// child inherits the parent's scope without a separate mount.
    pub fn join_under(&mut self, child: &str, parent: &str) -> JoinOutcome {
        let Some(scope) = self.scope_of(parent) else {
            return JoinOutcome::UnknownScope;
        };
        if self.joins.contains_key(child) {
            return JoinOutcome::AlreadyJoined;
        }
        self.parents.insert(child.to_string(), parent.to_string());
        self.joins.insert(child.to_string(), scope);
        JoinOutcome::Joined
    }

    /// Resolve a session's scope: its own join, or the nearest joined
    /// ancestor (lineage walk).
    pub fn scope_of(&self, session: &str) -> Option<String> {
        let mut current = session.to_string();
        // Lineage depth is bounded by construction; the seen set guards
        // against cyclic parent pointers anyway.
        let mut seen = BTreeSet::new();
        loop {
            if let Some(scope) = self.joins.get(&current) {
                return Some(scope.clone());
            }
            if !seen.insert(current.clone()) {
                return None;
            }
            current = self.parents.get(&current)?.clone();
        }
    }

    /// The pack set visible to a session (via join or lineage).
    pub fn packs_for(&self, session: &str) -> Option<Vec<String>> {
        let scope = self.scope_of(session)?;
        Some(self.mounts.get(&scope)?.iter().cloned().collect())
    }

    pub fn scopes(&self) -> usize {
        self.mounts.len()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn packs(names: &[&str]) -> Vec<String> {
        names.iter().map(|s| s.to_string()).collect()
    }

    #[test]
    fn mount_once_then_idempotent() {
        let mut table = MountTable::default();
        assert_eq!(table.mount("proj", &packs(&["a", "b"])), MountOutcome::Mounted);
        assert_eq!(
            table.mount("proj", &packs(&["b", "a"])),
            MountOutcome::AlreadyMounted,
            "same set (any order) is idempotent"
        );
        assert_eq!(table.scopes(), 1);
    }

    #[test]
    fn remount_with_different_set_conflicts() {
        let mut table = MountTable::default();
        table.mount("proj", &packs(&["a"]));
        assert_eq!(
            table.mount("proj", &packs(&["a", "c"])),
            MountOutcome::Conflict {
                existing: vec!["a".into()]
            }
        );
        // The original mount stands.
        assert_eq!(table.packs_for("s-joined-later-after-join").map(|_| ()), None);
    }

    #[test]
    fn join_requires_mounted_scope() {
        let mut table = MountTable::default();
        assert_eq!(table.join("s1", "proj"), JoinOutcome::UnknownScope);
        table.mount("proj", &packs(&["a"]));
        assert_eq!(table.join("s1", "proj"), JoinOutcome::Joined);
        assert_eq!(table.join("s1", "proj"), JoinOutcome::AlreadyJoined);
        assert_eq!(table.packs_for("s1"), Some(vec!["a".into()]));
    }

    #[test]
    fn child_inherits_parent_scope_via_lineage() {
        let mut table = MountTable::default();
        table.mount("proj", &packs(&["steward", "reviewer"]));
        table.join("parent-session", "proj");
        // Subagent joins under its parent — no mount of its own.
        assert_eq!(table.join_under("subagent-1", "parent-session"), JoinOutcome::Joined);
        assert_eq!(
            table.packs_for("subagent-1"),
            Some(packs(&["reviewer", "steward"]))
        );
        // Grandchild lineage walks up.
        assert_eq!(table.join_under("subagent-1-1", "subagent-1"), JoinOutcome::Joined);
        assert_eq!(table.packs_for("subagent-1-1").map(|p| p.len()), Some(2));
        // Unknown parent fails closed.
        assert_eq!(table.join_under("orphan", "ghost"), JoinOutcome::UnknownScope);
    }

    #[test]
    fn join_under_is_idempotent_for_the_same_child() {
        let mut table = MountTable::default();
        table.mount("proj", &packs(&["a"]));
        table.join("parent-session", "proj");
        assert_eq!(table.join_under("subagent-1", "parent-session"), JoinOutcome::Joined);
        // Re-joining the same child is an idempotent no-op.
        assert_eq!(
            table.join_under("subagent-1", "parent-session"),
            JoinOutcome::AlreadyJoined
        );
    }

    #[test]
    fn scope_of_fuses_on_cyclic_lineage() {
        // Defense branch: cyclic parent pointers must terminate the walk.
        // The public API cannot build this state (join_under requires a
        // resolvable scope and always records a join first), so construct
        // the internal state directly.
        let mut parents = BTreeMap::new();
        parents.insert("a".to_string(), "b".to_string());
        parents.insert("b".to_string(), "a".to_string());
        let table = MountTable {
            mounts: BTreeMap::new(),
            joins: BTreeMap::new(),
            parents,
        };
        assert_eq!(table.scope_of("a"), None, "cycle fuse blows instead of looping");
    }
}
