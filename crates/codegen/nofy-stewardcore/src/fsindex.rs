//! fs-index v1 (FR12.2, HM-F9 + DS-#17).
//!
//! Metadata + text index over opted-in roots. Three disciplines:
//!
//! - **Idle-gated rebuild**: index mutations from pending watcher events
//!   apply ONLY in the maintenance phase (the true-idle channel, FR3.3 —
//!   「真 idle 增量」);
//! - **Watch budget**: watchers are bounded; when the budget is exhausted
//!   the index DEGRADES to scan mode instead of failing (the field lesson:
//!   inotify watches are a shared, exhaustible resource);
//! - **CJK-friendly search**: character-level containment, so CJK text
//!   without word boundaries still hits.

/// One indexed file.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct IndexEntry {
    pub path: String,
    pub size: u64,
    pub mtime: u64,
    /// Extracted text (metadata + content digest for search).
    pub text: String,
}

/// Maintenance phase gate (mirrors `nofy_scheduler::maintenance::Phase`).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Phase {
    Active,
    Idle,
    Maintenance,
}

#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct FsIndex {
    entries: Vec<IndexEntry>,
}

impl FsIndex {
    pub fn upsert(&mut self, entry: IndexEntry) {
        if let Some(slot) = self.entries.iter_mut().find(|e| e.path == entry.path) {
            *slot = entry;
        } else {
            self.entries.push(entry);
        }
    }

    pub fn remove(&mut self, path: &str) {
        self.entries.retain(|e| e.path != path);
    }

    /// Character-level containment search (case-insensitive on ASCII,
    /// CJK-safe: no word-boundary requirement).
    pub fn search(&self, query: &str) -> Vec<String> {
        let query = query.to_lowercase();
        let mut hits: Vec<String> = self
            .entries
            .iter()
            .filter(|e| e.text.to_lowercase().contains(&query))
            .map(|e| e.path.clone())
            .collect();
        hits.sort();
        hits
    }

    pub fn len(&self) -> usize {
        self.entries.len()
    }

    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }
}

/// Pending watcher event.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct WatchEvent {
    pub path: String,
    pub entry: Option<IndexEntry>, // None = deletion
}

/// Apply pending events ONLY in the maintenance phase. Returns the number
/// applied (0 outside maintenance — events stay pending).
pub fn idle_rebuild(index: &mut FsIndex, pending: &mut Vec<WatchEvent>, phase: Phase) -> usize {
    if phase != Phase::Maintenance {
        return 0;
    }
    let events = std::mem::take(pending);
    let count = events.len();
    for event in events {
        match event.entry {
            Some(entry) => index.upsert(entry),
            None => index.remove(&event.path),
        }
    }
    count
}

/// Watch budget with degrade (fuse semantics).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct WatchBudget {
    pub max_watches: usize,
    pub used: usize,
    /// Budget exhausted: degrade to scan mode, never fail.
    pub degraded: bool,
}

impl WatchBudget {
    pub fn new(max_watches: usize) -> Self {
        Self {
            max_watches,
            used: 0,
            degraded: false,
        }
    }

    /// Request a watch. Over budget: degrade, refuse the watch, keep going.
    pub fn request_watch(&mut self) -> bool {
        if self.degraded {
            return false;
        }
        if self.used >= self.max_watches {
            self.degraded = true;
            return false;
        }
        self.used += 1;
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn entry(path: &str, text: &str) -> IndexEntry {
        IndexEntry {
            path: path.into(),
            size: text.len() as u64,
            mtime: 1,
            text: text.into(),
        }
    }

    #[test]
    fn cjk_search_hits_without_word_boundaries() {
        let mut index = FsIndex::default();
        index.upsert(entry("/notes/zh.md", "项目施工进度记录"));
        index.upsert(entry("/notes/en.md", "construction log"));
        assert_eq!(index.search("施工"), vec!["/notes/zh.md".to_string()]);
        assert_eq!(index.search("CONS"), vec!["/notes/en.md".to_string()]);
        assert!(index.search("不存在").is_empty());
    }

    #[test]
    fn rebuild_only_in_maintenance_phase() {
        let mut index = FsIndex::default();
        let mut pending = vec![WatchEvent {
            path: "/a".into(),
            entry: Some(entry("/a", "hello")),
        }];
        // Active/Idle: nothing applies, events stay pending.
        assert_eq!(idle_rebuild(&mut index, &mut pending, Phase::Active), 0);
        assert_eq!(idle_rebuild(&mut index, &mut pending, Phase::Idle), 0);
        assert!(index.is_empty());
        assert_eq!(pending.len(), 1);
        // Maintenance: applies and drains.
        assert_eq!(idle_rebuild(&mut index, &mut pending, Phase::Maintenance), 1);
        assert_eq!(index.len(), 1);
        assert!(pending.is_empty());
    }

    #[test]
    fn deletion_events_remove_entries() {
        let mut index = FsIndex::default();
        index.upsert(entry("/a", "x"));
        let mut pending = vec![WatchEvent { path: "/a".into(), entry: None }];
        idle_rebuild(&mut index, &mut pending, Phase::Maintenance);
        assert!(index.is_empty());
    }

    #[test]
    fn watch_budget_degrades_instead_of_failing() {
        let mut budget = WatchBudget::new(2);
        assert!(budget.request_watch());
        assert!(budget.request_watch());
        // Third request exhausts the budget: degrade, refuse, keep going.
        assert!(!budget.request_watch());
        assert!(budget.degraded);
        // Degraded state is sticky (scan mode until an operator resets).
        assert!(!budget.request_watch());
    }
}
