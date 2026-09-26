//! `task.*` journal event family (FR11.5): armed/claimed/settled/escalated.
//!
//! Task progress is journaled with the same invariants as the session
//! journal: DENSE sequence numbers (a gap = corruption, truncate there),
//! TERMINAL finality (a settled task never re-enters), and crash
//! reconciliation (claimed-but-not-settled = the re-dispatch list).
//!
//! Since integration batch R1 the journal is also DURABLE: [`TaskLogStore`]
//! is a thin append-only line log (same shape as the scheduler's
//! `LogStore`) so reconciliation survives a process crash (AC-11).

use std::collections::{BTreeMap, BTreeSet};
use std::io::Write;
use std::path::{Path, PathBuf};

/// One task journal event.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub enum TaskEvent {
    Armed {
        seq: u64,
        task: String,
        run: String,
    },
    Claimed {
        seq: u64,
        task: String,
        claimant: String,
    },
    Settled {
        seq: u64,
        task: String,
        ok: bool,
    },
    Escalated {
        seq: u64,
        task: String,
        reason: String,
    },
    EscalationResolved {
        seq: u64,
        task: String,
        allow: bool,
    },
    /// User cancelled the task (W-7 `nofy task cancel`). Terminal.
    Cancelled {
        seq: u64,
        task: String,
        reason: String,
    },
    /// Transitively skipped: a dependency failed-and-was-allowed or was
    /// cancelled (W-4 audit: skips are journaled, never silent). Terminal.
    Skipped {
        seq: u64,
        task: String,
        reason: String,
    },
}

impl TaskEvent {
    pub fn seq(&self) -> u64 {
        match self {
            TaskEvent::Armed { seq, .. }
            | TaskEvent::Claimed { seq, .. }
            | TaskEvent::Settled { seq, .. }
            | TaskEvent::Escalated { seq, .. }
            | TaskEvent::EscalationResolved { seq, .. }
            | TaskEvent::Cancelled { seq, .. }
            | TaskEvent::Skipped { seq, .. } => *seq,
        }
    }

    pub fn task(&self) -> &str {
        match self {
            TaskEvent::Armed { task, .. }
            | TaskEvent::Claimed { task, .. }
            | TaskEvent::Settled { task, .. }
            | TaskEvent::Escalated { task, .. }
            | TaskEvent::EscalationResolved { task, .. }
            | TaskEvent::Cancelled { task, .. }
            | TaskEvent::Skipped { task, .. } => task,
        }
    }

    /// Shift this event's seq by `by`. The durable log is shared across
    /// runs, and reconciliation folds the WHOLE log under the dense-seq
    /// invariant — so a run attaching to a non-empty store must continue
    /// the global sequence, never restart at 1 (a restart truncates the
    /// fold and hides every later event from crash reconciliation).
    pub fn offset_seq(&mut self, by: u64) {
        if by == 0 {
            return;
        }
        match self {
            TaskEvent::Armed { seq, .. }
            | TaskEvent::Claimed { seq, .. }
            | TaskEvent::Settled { seq, .. }
            | TaskEvent::Escalated { seq, .. }
            | TaskEvent::EscalationResolved { seq, .. }
            | TaskEvent::Cancelled { seq, .. }
            | TaskEvent::Skipped { seq, .. } => *seq += by,
        }
    }
}

/// Lifecycle state of one task.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TaskState {
    Armed,
    Claimed,
    SettledOk,
    SettledFailed,
    Escalated,
    /// Escalation resolved: allowed = skip-and-continue.
    ResolvedAllow,
    /// Escalation resolved: denied = abort signal for the caller.
    ResolvedDeny,
    /// User cancelled (W-7).
    Cancelled,
    /// Transitively skipped because a dependency failed-and-was-allowed
    /// or was cancelled (W-4 audit).
    Skipped,
}

impl TaskState {
    /// Terminal = nothing may follow. A FAILED settle is not terminal:
    /// escalation (or a retry re-claim) legitimately follows failure.
    pub fn is_terminal(&self) -> bool {
        matches!(
            self,
            TaskState::SettledOk
                | TaskState::ResolvedAllow
                | TaskState::ResolvedDeny
                | TaskState::Cancelled
                | TaskState::Skipped
        )
    }
}

/// Fold result: per-task state + journal health.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct TaskJournal {
    pub states: BTreeMap<String, TaskState>,
    /// Last dense seq applied (0 = empty journal).
    pub last_seq: u64,
    /// Events dropped by the terminal gate (audit).
    pub terminal_violations: u64,
}

/// Fold a task journal with invariants. A seq gap truncates the fold
/// (corruption boundary); terminal tasks ignore further events.
pub fn fold_tasks(events: &[TaskEvent]) -> TaskJournal {
    let mut journal = TaskJournal::default();
    for event in events {
        let seq = event.seq();
        // Dense-seq invariant: events must advance one at a time.
        if seq != journal.last_seq + 1 {
            break; // torn/corrupt tail: stop folding here
        }
        let task = event.task().to_string();
        let current = journal.states.get(&task).copied();
        if current.is_some_and(|s| s.is_terminal()) {
            journal.terminal_violations += 1;
            journal.last_seq = seq;
            continue;
        }
        let next = match event {
            TaskEvent::Armed { .. } => TaskState::Armed,
            TaskEvent::Claimed { .. } => TaskState::Claimed,
            TaskEvent::Settled { ok: true, .. } => TaskState::SettledOk,
            TaskEvent::Settled { ok: false, .. } => TaskState::SettledFailed,
            TaskEvent::Escalated { .. } => TaskState::Escalated,
            TaskEvent::EscalationResolved { allow: true, .. } => TaskState::ResolvedAllow,
            TaskEvent::EscalationResolved { allow: false, .. } => TaskState::ResolvedDeny,
            TaskEvent::Cancelled { .. } => TaskState::Cancelled,
            TaskEvent::Skipped { .. } => TaskState::Skipped,
        };
        journal.states.insert(task, next);
        journal.last_seq = seq;
    }
    journal
}

/// Crash reconciliation: tasks claimed but never settled must be
/// re-dispatched (「崩溃后 task.* 对账续跑」, AC-11).
pub fn re_dispatch_list(journal: &TaskJournal) -> Vec<String> {
    journal
        .states
        .iter()
        .filter(|(_, state)| matches!(state, TaskState::Claimed | TaskState::Armed))
        .map(|(task, _)| task.clone())
        .collect()
}

/// Settled task ids (for dependency resolution).
pub fn settled_ok(journal: &TaskJournal) -> BTreeSet<String> {
    journal
        .states
        .iter()
        .filter(|(_, state)| **state == TaskState::SettledOk)
        .map(|(task, _)| task.clone())
        .collect()
}

/// Parse a task journal log: one JSON event per line; a torn tail
/// truncates (never an error).
pub fn parse_log(text: &str) -> Vec<TaskEvent> {
    let mut events = Vec::new();
    for line in text.lines() {
        if line.trim().is_empty() {
            continue;
        }
        let Ok(event) = serde_json::from_str::<TaskEvent>(line) else {
            break; // torn tail: stop here
        };
        events.push(event);
    }
    events
}

/// Thin on-disk layer for the task journal (R1): append-only line log +
/// fold-on-read, same discipline as the scheduler's `LogStore`.
/// Durability guarantees belong to the caller's policy; this layer only
/// appends with `sync_data` and reads back.
#[derive(Debug, Clone)]
pub struct TaskLogStore {
    path: PathBuf,
}

impl TaskLogStore {
    pub fn open(path: impl Into<PathBuf>) -> Self {
        Self { path: path.into() }
    }

    pub fn path(&self) -> &Path {
        &self.path
    }

    /// Append one event durably (line + flush + `sync_data`).
    pub fn append(&self, event: &TaskEvent) -> std::io::Result<()> {
        let mut file = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.path)?;
        let mut line = serde_json::to_string(event).expect("task event serializes");
        line.push('\n');
        file.write_all(line.as_bytes())?;
        file.sync_data()?;
        Ok(())
    }

    /// Read the log back; a missing file is an empty log.
    pub fn read_events(&self) -> std::io::Result<Vec<TaskEvent>> {
        match std::fs::read_to_string(&self.path) {
            Ok(text) => Ok(parse_log(&text)),
            Err(err) if err.kind() == std::io::ErrorKind::NotFound => Ok(Vec::new()),
            Err(err) => Err(err),
        }
    }

    /// The current journal: fold of the on-disk log.
    pub fn journal(&self) -> std::io::Result<TaskJournal> {
        Ok(fold_tasks(&self.read_events()?))
    }

    /// Crash reconciliation straight from disk (AC-11): tasks that were
    /// armed/claimed but never settled.
    pub fn re_dispatch(&self) -> std::io::Result<Vec<String>> {
        Ok(re_dispatch_list(&self.journal()?))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn armed(seq: u64, task: &str) -> TaskEvent {
        TaskEvent::Armed {
            seq,
            task: task.into(),
            run: "run-1".into(),
        }
    }

    fn claimed(seq: u64, task: &str) -> TaskEvent {
        TaskEvent::Claimed {
            seq,
            task: task.into(),
            claimant: "provider-1".into(),
        }
    }

    fn settled(seq: u64, task: &str, ok: bool) -> TaskEvent {
        TaskEvent::Settled {
            seq,
            task: task.into(),
            ok,
        }
    }

    #[test]
    fn lifecycle_folds_in_order() {
        let journal = fold_tasks(&[armed(1, "t"), claimed(2, "t"), settled(3, "t", true)]);
        assert_eq!(journal.states["t"], TaskState::SettledOk);
        assert_eq!(journal.last_seq, 3);
    }

    #[test]
    fn seq_gap_truncates_the_fold() {
        // Gap at seq 3: everything after is untrusted.
        let journal = fold_tasks(&[armed(1, "a"), claimed(2, "a"), settled(5, "a", true)]);
        assert_eq!(journal.states["a"], TaskState::Claimed);
        assert_eq!(journal.last_seq, 2);
    }

    #[test]
    fn terminal_tasks_ignore_later_events() {
        let journal = fold_tasks(&[
            armed(1, "t"),
            claimed(2, "t"),
            settled(3, "t", true),
            claimed(4, "t"),        // terminal violation
            settled(5, "t", false), // terminal violation
        ]);
        assert_eq!(
            journal.states["t"],
            TaskState::SettledOk,
            "settled stays settled"
        );
        assert_eq!(journal.terminal_violations, 2);
    }

    #[test]
    fn reconciliation_lists_unsettled_tasks() {
        let journal = fold_tasks(&[
            armed(1, "done"),
            claimed(2, "done"),
            settled(3, "done", true),
            armed(4, "in-flight"),
            claimed(5, "in-flight"),
            armed(6, "pending"),
        ]);
        let mut list = re_dispatch_list(&journal);
        list.sort();
        assert_eq!(list, vec!["in-flight".to_string(), "pending".to_string()]);
        assert!(settled_ok(&journal).contains("done"));
    }

    #[test]
    fn escalation_flow() {
        let journal = fold_tasks(&[
            armed(1, "t"),
            claimed(2, "t"),
            settled(3, "t", false),
            TaskEvent::Escalated {
                seq: 4,
                task: "t".into(),
                reason: "budget exhausted".into(),
            },
            TaskEvent::EscalationResolved {
                seq: 5,
                task: "t".into(),
                allow: true,
            },
        ]);
        assert_eq!(journal.states["t"], TaskState::ResolvedAllow);
        let denied = fold_tasks(&[
            armed(1, "t"),
            TaskEvent::Escalated {
                seq: 2,
                task: "t".into(),
                reason: "r".into(),
            },
            TaskEvent::EscalationResolved {
                seq: 3,
                task: "t".into(),
                allow: false,
            },
        ]);
        assert_eq!(denied.states["t"], TaskState::ResolvedDeny);
        assert!(denied.states["t"].is_terminal());
    }

    #[test]
    fn log_store_roundtrips_and_reconciles_from_disk() {
        // R1 (AC-11): the journal survives a "crash" because it is on
        // disk; reconciliation reads straight from the file.
        let dir = tempfile::tempdir().unwrap();
        let store = TaskLogStore::open(dir.path().join("task.jsonl"));
        assert!(
            store.read_events().unwrap().is_empty(),
            "missing file = empty log"
        );
        for event in [
            armed(1, "t1"),
            armed(2, "t2"),
            claimed(3, "t1"),
            settled(4, "t1", true),
            claimed(5, "t2"),
        ] {
            store.append(&event).unwrap();
        }
        // "Crash": drop everything in memory, reopen from disk.
        let reopened = TaskLogStore::open(dir.path().join("task.jsonl"));
        assert_eq!(reopened.read_events().unwrap().len(), 5);
        assert_eq!(reopened.re_dispatch().unwrap(), vec!["t2".to_string()]);
        assert!(reopened.journal().unwrap().states["t1"].is_terminal());
    }

    #[test]
    fn torn_tail_truncates_never_errors() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("task.jsonl");
        let store = TaskLogStore::open(&path);
        store.append(&armed(1, "t1")).unwrap();
        store.append(&claimed(2, "t1")).unwrap();
        // Simulate a torn write: a partial line at the tail.
        use std::io::Write;
        std::fs::OpenOptions::new()
            .append(true)
            .open(&path)
            .unwrap()
            .write_all(b"{\"seq\":3,\"task\":\"t1\",\"Sett")
            .unwrap();
        let events = store.read_events().unwrap();
        assert_eq!(events.len(), 2, "torn tail is truncated, not an error");
        assert_eq!(store.re_dispatch().unwrap(), vec!["t1".to_string()]);
    }

    #[test]
    fn parse_log_skips_blank_lines() {
        // Blank lines mixed into the log are skipped, not a torn tail.
        let text = format!(
            "{}\n\n{}\n",
            serde_json::to_string(&armed(1, "t")).unwrap(),
            serde_json::to_string(&claimed(2, "t")).unwrap()
        );
        assert_eq!(parse_log(&text), vec![armed(1, "t"), claimed(2, "t")]);
    }

    #[test]
    fn path_accessor_returns_the_store_path() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("task.jsonl");
        let store = TaskLogStore::open(&path);
        assert_eq!(store.path(), path.as_path());
    }

    #[test]
    fn read_errors_other_than_missing_propagate() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("task.jsonl");
        // Log slot occupied by a DIRECTORY: read fails, not NotFound.
        std::fs::create_dir_all(&path).unwrap();
        let store = TaskLogStore::open(&path);
        assert!(store.read_events().is_err());
    }

    fn cancelled(seq: u64, task: &str) -> TaskEvent {
        TaskEvent::Cancelled {
            seq,
            task: task.to_string(),
            reason: "user cancelled".to_string(),
        }
    }

    #[test]
    fn cancel_is_terminal_and_blocks_late_events() {
        // W-7: a cancelled task reaches a terminal state; a late settle is
        // dropped by the terminal gate (counted as a violation).
        let events = vec![
            armed(1, "t"),
            claimed(2, "t"),
            cancelled(3, "t"),
            settled(4, "t", true),
        ];
        let journal = fold_tasks(&events);
        assert_eq!(journal.states.get("t"), Some(&TaskState::Cancelled));
        assert_eq!(journal.terminal_violations, 1);
        assert!(!re_dispatch_list(&journal).contains(&"t".to_string()));
    }

    #[test]
    fn cancelled_roundtrips_through_the_log() {
        let text = format!("{}\n", serde_json::to_string(&cancelled(1, "t")).unwrap());
        assert_eq!(parse_log(&text), vec![cancelled(1, "t")]);
    }

    fn skipped(seq: u64, task: &str) -> TaskEvent {
        TaskEvent::Skipped {
            seq,
            task: task.to_string(),
            reason: "skipped: dependency failed (escalation allowed)".to_string(),
        }
    }

    #[test]
    fn skip_is_terminal_and_blocks_late_events_w4() {
        // W-4: a skipped dependent reaches a terminal state; a late claim
        // is dropped by the terminal gate, and the skip never re-dispatches.
        let events = vec![armed(1, "d"), skipped(2, "d"), claimed(3, "d")];
        let journal = fold_tasks(&events);
        assert_eq!(journal.states.get("d"), Some(&TaskState::Skipped));
        assert_eq!(journal.terminal_violations, 1);
        assert!(!re_dispatch_list(&journal).contains(&"d".to_string()));
    }

    #[test]
    fn skipped_roundtrips_through_the_log_w4() {
        let text = format!("{}\n", serde_json::to_string(&skipped(1, "d")).unwrap());
        assert_eq!(parse_log(&text), vec![skipped(1, "d")]);
    }
}
