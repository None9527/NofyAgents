//! Process registry (FR6.1 / HM-F15): rolling buffer + checkpoint
//! recovery + watch fuse.
//!
//! The registry tracks processes the scheduler vouched for (spawned
//! runners, providers). Three guarantees:
//!
//! - **Rolling buffer**: bounded capacity, oldest entries evicted first —
//!   the registry can never grow unbounded under churn.
//! - **Checkpoint recovery**: the registry serializes to a jsonl
//!   checkpoint; recovery tolerates a torn tail (single-writer append
//!   discipline, same as the schedule log).
//! - **Watch fuse**: OS watch mechanisms fail in the field (P0 found
//!   inotify watches exhausted by an unrelated process). After a
//!   threshold of watch failures the fuse BLOWS permanently: callers must
//!   fall back to conservative liveness checks instead of trusting watch
//!   events. A blown fuse is visible state, never a silent degradation.
//!
//! PID identity follows the daemon's orphan-sweep defense: (pid,
//! starttime) pairs, so PID reuse can never alias two processes.

use serde::{Deserialize, Serialize};

/// One registered process.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ProcEntry {
    pub pid: u32,
    /// Kernel start time — the PID-reuse defense.
    pub starttime: u64,
    pub label: String,
    pub registered_at: u64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProcessRegistry {
    entries: Vec<ProcEntry>,
    capacity: usize,
    watch_failures: u64,
    fuse_threshold: u64,
    fused: bool,
}

impl ProcessRegistry {
    pub fn new(capacity: usize, fuse_threshold: u64) -> Self {
        Self {
            entries: Vec::new(),
            capacity: capacity.max(1),
            watch_failures: 0,
            fuse_threshold: fuse_threshold.max(1),
            fused: false,
        }
    }

    /// Register a process. At capacity, the OLDEST entry is evicted
    /// (rolling buffer).
    pub fn register(&mut self, entry: ProcEntry) {
        // Re-registration of the same identity refreshes in place.
        if let Some(slot) = self
            .entries
            .iter_mut()
            .find(|e| e.pid == entry.pid && e.starttime == entry.starttime)
        {
            *slot = entry;
            return;
        }
        if self.entries.len() >= self.capacity {
            self.entries.remove(0);
        }
        self.entries.push(entry);
    }

    /// Unregister by full identity. A stale pid with a different starttime
    /// (PID reuse) does NOT remove the live entry.
    pub fn unregister(&mut self, pid: u32, starttime: u64) -> bool {
        let before = self.entries.len();
        self.entries
            .retain(|e| !(e.pid == pid && e.starttime == starttime));
        self.entries.len() < before
    }

    pub fn is_registered(&self, pid: u32, starttime: u64) -> bool {
        self.entries
            .iter()
            .any(|e| e.pid == pid && e.starttime == starttime)
    }

    pub fn entries(&self) -> &[ProcEntry] {
        &self.entries
    }

    /// Remove entries the liveness predicate reports dead. Returns the
    /// swept entries (for the caller's cleanup actions).
    pub fn sweep<F: Fn(u32, u64) -> bool>(&mut self, alive: F) -> Vec<ProcEntry> {
        let (dead, live): (Vec<_>, Vec<_>) = self
            .entries
            .drain(..)
            .partition(|e| !alive(e.pid, e.starttime));
        self.entries = live;
        dead
    }

    // ---- watch fuse ----

    /// Record a watch-layer failure. At the threshold the fuse blows.
    pub fn record_watch_failure(&mut self) {
        self.watch_failures += 1;
        if self.watch_failures >= self.fuse_threshold {
            self.fused = true;
        }
    }

    /// A blown fuse is permanent until an operator explicitly resets it —
    /// silent recovery would hide a broken watch layer.
    pub fn watch_fused(&self) -> bool {
        self.fused
    }

    pub fn watch_failures(&self) -> u64 {
        self.watch_failures
    }

    pub fn reset_fuse(&mut self) {
        self.fused = false;
        self.watch_failures = 0;
    }

    // ---- checkpoint / recovery ----

    /// Serialize as jsonl: one entry per line.
    pub fn checkpoint(&self) -> String {
        let mut out = String::new();
        for entry in &self.entries {
            out.push_str(&serde_json::to_string(entry).expect("proc entry serializes"));
            out.push('\n');
        }
        out
    }

    /// Recover from checkpoint text, tolerating a torn tail (first bad
    /// line truncates the log). Capacity/fuse policy come from the caller;
    /// the checkpoint carries data only.
    pub fn recover(text: &str, capacity: usize, fuse_threshold: u64) -> Self {
        let mut registry = Self::new(capacity, fuse_threshold);
        for line in text.lines() {
            if line.trim().is_empty() {
                continue;
            }
            match serde_json::from_str::<ProcEntry>(line) {
                Ok(entry) => registry.entries.push(entry),
                Err(_) => break, // torn tail
            }
        }
        // A checkpoint deeper than the current capacity keeps only the
        // newest entries (rolling semantics survive recovery).
        if registry.entries.len() > registry.capacity {
            let excess = registry.entries.len() - registry.capacity;
            registry.entries.drain(..excess);
        }
        registry
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn entry(pid: u32, starttime: u64, label: &str) -> ProcEntry {
        ProcEntry {
            pid,
            starttime,
            label: label.into(),
            registered_at: starttime,
        }
    }

    #[test]
    fn rolling_buffer_evicts_oldest_at_capacity() {
        let mut registry = ProcessRegistry::new(2, 3);
        registry.register(entry(1, 100, "a"));
        registry.register(entry(2, 200, "b"));
        registry.register(entry(3, 300, "c")); // evicts pid 1
        assert_eq!(registry.entries().len(), 2);
        assert!(!registry.is_registered(1, 100));
        assert!(registry.is_registered(2, 200));
        assert!(registry.is_registered(3, 300));
    }

    #[test]
    fn pid_reuse_never_aliases() {
        let mut registry = ProcessRegistry::new(8, 3);
        registry.register(entry(42, 1000, "original"));
        // Same pid, new starttime = a DIFFERENT process.
        assert!(!registry.unregister(42, 9999));
        assert!(registry.is_registered(42, 1000), "live entry must survive");
        registry.register(entry(42, 2000, "reused"));
        assert!(registry.unregister(42, 1000));
        assert!(registry.is_registered(42, 2000));
    }

    #[test]
    fn re_registration_refreshes_in_place() {
        let mut registry = ProcessRegistry::new(2, 3);
        registry.register(entry(1, 100, "old-label"));
        registry.register(entry(1, 100, "new-label"));
        assert_eq!(registry.entries().len(), 1);
        assert_eq!(registry.entries()[0].label, "new-label");
    }

    #[test]
    fn sweep_removes_only_dead_entries() {
        let mut registry = ProcessRegistry::new(8, 3);
        registry.register(entry(1, 100, "dead"));
        registry.register(entry(2, 200, "alive"));
        let swept = registry.sweep(|pid, _| pid != 1);
        assert_eq!(swept, vec![entry(1, 100, "dead")]);
        assert_eq!(registry.entries().len(), 1);
    }

    #[test]
    fn watch_fuse_blows_at_threshold_and_stays() {
        let mut registry = ProcessRegistry::new(8, 3);
        registry.record_watch_failure();
        registry.record_watch_failure();
        assert!(!registry.watch_fused());
        registry.record_watch_failure();
        assert!(registry.watch_fused(), "fuse must blow at threshold");
        // No silent recovery.
        assert!(registry.watch_fused());
        // Only an explicit operator reset clears it.
        registry.reset_fuse();
        assert!(!registry.watch_fused());
        assert_eq!(registry.watch_failures(), 0);
    }

    #[test]
    fn checkpoint_roundtrip_and_torn_tail_recovery() {
        let mut registry = ProcessRegistry::new(8, 3);
        registry.register(entry(1, 100, "a"));
        registry.register(entry(2, 200, "b"));
        let checkpoint = registry.checkpoint();
        assert_eq!(ProcessRegistry::recover(&checkpoint, 8, 3), registry);

        // Torn tail: chop the last line mid-byte.
        let mut torn = checkpoint.clone();
        torn.truncate(torn.len() - 5);
        let recovered = ProcessRegistry::recover(&torn, 8, 3);
        assert_eq!(recovered.entries().len(), 1, "torn entry dropped");
        assert!(recovered.is_registered(1, 100));
    }

    #[test]
    fn recovery_applies_capacity_to_deep_checkpoints() {
        let mut registry = ProcessRegistry::new(8, 3);
        for pid in 1..=5 {
            registry.register(entry(pid, pid as u64 * 100, "x"));
        }
        let checkpoint = registry.checkpoint();
        // Recover with a smaller capacity: newest survive.
        let recovered = ProcessRegistry::recover(&checkpoint, 2, 3);
        assert_eq!(recovered.entries().len(), 2);
        assert!(recovered.is_registered(5, 500));
        assert!(recovered.is_registered(4, 400));
        assert!(!recovered.is_registered(1, 100));
    }

    #[test]
    fn recovery_skips_blank_lines() {
        let mut registry = ProcessRegistry::new(8, 3);
        registry.register(entry(1, 100, "a"));
        registry.register(entry(2, 200, "b"));
        // Blank lines mixed into the checkpoint are skipped, not fatal.
        let with_blanks = format!("\n{}\n", registry.checkpoint().trim_end());
        assert_eq!(ProcessRegistry::recover(&with_blanks, 8, 3), registry);
    }
}
