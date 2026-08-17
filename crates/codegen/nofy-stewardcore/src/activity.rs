//! File-activity graph (FR12.4): journal `tool.*` file side-effects are
//! globalized into a per-file actor graph with hunk confluence — who
//! touched what, and who touched it LAST. The steward is a FIRST-CLASS
//! actor in the graph (not a hidden side channel), which is what makes
//! 「steward 改动被 hunk 外部对账识别为外部编辑并可见归因」(AC-12) possible.

use std::collections::BTreeMap;

/// Who touched a file.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub enum FileActor {
    Session(String),
    Steward,
    External,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ActivityKind {
    Read,
    Write,
    Delete,
}

/// One file side-effect from the journal.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ActivityEvent {
    pub path: String,
    pub actor: FileActor,
    pub kind: ActivityKind,
    pub at: u64,
}

/// Per-file activity history.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct ActivityGraph {
    by_path: BTreeMap<String, Vec<ActivityEvent>>,
}

/// Confluence result for one file: the last writer and whether the
/// steward's view agrees with the graph (external-edit detection).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Confluence {
    pub last_writer: FileActor,
    pub last_write_at: u64,
    /// True when the most recent write is NOT the steward's — i.e. an
    /// external edit the steward must re-validate against.
    pub external_since_steward: bool,
}

impl ActivityGraph {
    pub fn record(&mut self, event: ActivityEvent) {
        self.by_path.entry(event.path.clone()).or_default().push(event);
    }

    pub fn history(&self, path: &str) -> &[ActivityEvent] {
        self.by_path.get(path).map(Vec::as_slice).unwrap_or(&[])
    }

    pub fn paths(&self) -> Vec<String> {
        self.by_path.keys().cloned().collect()
    }

    /// Hunk confluence: attribute the current state of a file to its last
    /// writer, and detect edits that happened after the steward's last
    /// write.
    pub fn confluence(&self, path: &str) -> Option<Confluence> {
        let history = self.by_path.get(path)?;
        let last_write = history
            .iter()
            .filter(|e| e.kind == ActivityKind::Write || e.kind == ActivityKind::Delete)
            .max_by_key(|e| e.at)?;
        let last_steward_write = history
            .iter()
            .filter(|e| e.actor == FileActor::Steward
                && (e.kind == ActivityKind::Write || e.kind == ActivityKind::Delete))
            .max_by_key(|e| e.at)
            .map(|e| e.at);
        Some(Confluence {
            last_writer: last_write.actor.clone(),
            last_write_at: last_write.at,
            external_since_steward: last_steward_write.is_none_or(|t| last_write.at > t)
                && last_write.actor != FileActor::Steward,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn write(path: &str, actor: FileActor, at: u64) -> ActivityEvent {
        ActivityEvent { path: path.into(), actor, kind: ActivityKind::Write, at }
    }

    #[test]
    fn steward_is_a_first_class_actor() {
        let mut graph = ActivityGraph::default();
        graph.record(write("/f", FileActor::Steward, 10));
        let conf = graph.confluence("/f").unwrap();
        assert_eq!(conf.last_writer, FileActor::Steward);
        assert!(!conf.external_since_steward);
    }

    #[test]
    fn external_edit_after_steward_is_attributed() {
        let mut graph = ActivityGraph::default();
        graph.record(write("/f", FileActor::Steward, 10));
        graph.record(write("/f", FileActor::Session("s1".into()), 20));
        let conf = graph.confluence("/f").unwrap();
        assert_eq!(conf.last_writer, FileActor::Session("s1".into()));
        assert!(
            conf.external_since_steward,
            "post-steward session edit must be visible as external"
        );
    }

    #[test]
    fn steward_write_after_external_clears_flag() {
        let mut graph = ActivityGraph::default();
        graph.record(write("/f", FileActor::External, 10));
        graph.record(write("/f", FileActor::Steward, 20));
        let conf = graph.confluence("/f").unwrap();
        assert_eq!(conf.last_writer, FileActor::Steward);
        assert!(!conf.external_since_steward);
    }

    #[test]
    fn reads_do_not_count_as_writes() {
        let mut graph = ActivityGraph::default();
        graph.record(write("/f", FileActor::Steward, 10));
        graph.record(ActivityEvent {
            path: "/f".into(),
            actor: FileActor::Session("s".into()),
            kind: ActivityKind::Read,
            at: 20,
        });
        let conf = graph.confluence("/f").unwrap();
        assert_eq!(conf.last_writer, FileActor::Steward, "reads don't change authorship");
        assert!(!conf.external_since_steward);
    }

    #[test]
    fn unknown_path_has_no_confluence() {
        let graph = ActivityGraph::default();
        assert!(graph.confluence("/missing").is_none());
    }
}
