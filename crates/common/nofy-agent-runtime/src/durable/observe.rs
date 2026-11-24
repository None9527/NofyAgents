use super::db_error;
use crate::Error;
use rusqlite::{Connection, OptionalExtension, Transaction, hooks::Action};
use std::{
    collections::HashMap,
    sync::{
        Arc, Mutex,
        atomic::{AtomicU8, Ordering},
    },
};
use tokio::sync::watch;

const SESSIONS: u8 = 1;
const RUNS: u8 = 2;
const EVENTS: u8 = 4;
const WORK: u8 = 8;
const MAX_TRACKED_EVENT_ROWIDS: usize = 64;
const PRUNE_RUNS_THRESHOLD: usize = 64;

/// Invalidation counters, independent of the durable journal's replay cursor.
#[derive(Clone, Copy, Default)]
pub struct RuntimeChanges {
    pub sessions: u64,
    pub runs: u64,
    pub events: u64,
}

/// Workspace invalidation counters for sessions and runs (quiet during token streams).
#[derive(Clone, Copy, Default, Debug, PartialEq, Eq)]
pub struct WorkspaceChanges {
    pub sessions: u64,
    pub runs: u64,
}

#[derive(Default)]
struct PendingEvents {
    rowids: Vec<i64>,
    overflow: bool,
}

pub(super) enum CommittedEvents {
    None,
    Runs(Vec<String>),
    All,
}

pub(super) struct Observer {
    pending: Arc<AtomicU8>,
    pending_events: Arc<Mutex<PendingEvents>>,
    changes: watch::Sender<RuntimeChanges>,
    workspace: watch::Sender<WorkspaceChanges>,
    work: watch::Sender<u64>,
    runs: Mutex<HashMap<String, watch::Sender<u64>>>,
}

impl Observer {
    pub(super) fn new() -> Self {
        Self {
            pending: Arc::default(),
            pending_events: Arc::default(),
            changes: watch::channel(RuntimeChanges::default()).0,
            workspace: watch::channel(WorkspaceChanges::default()).0,
            work: watch::channel(0u64).0,
            runs: Mutex::new(HashMap::new()),
        }
    }

    pub(super) fn attach(&self, connection: &Connection) {
        let pending = self.pending.clone();
        let pending_events = self.pending_events.clone();
        connection.update_hook(Some(move |action, _: &str, table: &str, rowid: i64| {
            let topics = match table {
                "agent_runtime_sessions"
                | "agent_runtime_session_profiles"
                | "agent_runtime_session_titles" => SESSIONS,
                "agent_runtime_runs"
                | "agent_runtime_threads"
                | "agent_runtime_jobs"
                | "agent_runtime_managed_runs"
                | "agent_runtime_session_turns" => SESSIONS | RUNS | WORK,
                "agent_runtime_approvals"
                | "agent_runtime_children"
                | "agent_runtime_parks"
                | "agent_runtime_managed_actions"
                | "agent_runtime_cancel" => RUNS | WORK,
                "agent_runtime_mailbox" => RUNS,
                "agent_runtime_work_changes"
                | "agent_runtime_work_owners"
                | "agent_runtime_work_commands" => WORK,
                "agent_runtime_events" => {
                    if matches!(action, Action::SQLITE_INSERT | Action::SQLITE_UPDATE)
                        && let Ok(mut events) = pending_events.lock()
                        && !events.overflow
                        && !events.rowids.contains(&rowid)
                    {
                        if events.rowids.len() < MAX_TRACKED_EVENT_ROWIDS {
                            events.rowids.push(rowid);
                        } else {
                            events.overflow = true;
                            events.rowids.clear();
                        }
                    }
                    EVENTS
                }
                _ => return,
            };
            pending.fetch_or(topics, Ordering::Relaxed);
        }));
    }

    pub(super) fn clear(&self) {
        self.pending.store(0, Ordering::Relaxed);
        if let Ok(mut events) = self.pending_events.lock() {
            events.rowids.clear();
            events.overflow = false;
        }
    }

    pub(super) fn resolve_event_roots(
        &self,
        tx: &Transaction<'_>,
    ) -> Result<CommittedEvents, Error> {
        let (rowids, overflow) = {
            let mut events = self
                .pending_events
                .lock()
                .unwrap_or_else(|poisoned| poisoned.into_inner());
            let overflow = events.overflow;
            let rowids = std::mem::take(&mut events.rowids);
            events.overflow = false;
            (rowids, overflow)
        };
        if overflow {
            return Ok(CommittedEvents::All);
        }
        if rowids.is_empty() {
            return Ok(CommittedEvents::None);
        }
        let mut roots = Vec::with_capacity(rowids.len());
        let mut statement = tx
            .prepare_cached("SELECT root_id FROM agent_runtime_events WHERE id=?1")
            .map_err(db_error)?;
        for rowid in rowids {
            if let Some(root_id) = statement
                .query_row([rowid], |row| row.get::<_, String>(0))
                .optional()
                .map_err(db_error)?
                && !roots.iter().any(|existing| existing == &root_id)
            {
                roots.push(root_id);
            }
        }
        Ok(if roots.is_empty() {
            CommittedEvents::None
        } else {
            CommittedEvents::Runs(roots)
        })
    }

    pub(super) fn committed(&self, event_roots: CommittedEvents) {
        let topics = self.pending.swap(0, Ordering::Relaxed);
        if topics == 0 {
            return;
        }
        self.changes.send_modify(|changes| {
            if topics & SESSIONS != 0 {
                changes.sessions = changes.sessions.wrapping_add(1);
            }
            if topics & RUNS != 0 {
                changes.runs = changes.runs.wrapping_add(1);
            }
            if topics & EVENTS != 0 {
                changes.events = changes.events.wrapping_add(1);
            }
        });
        if topics & (SESSIONS | RUNS) != 0 {
            self.workspace.send_modify(|workspace| {
                if topics & SESSIONS != 0 {
                    workspace.sessions = workspace.sessions.wrapping_add(1);
                }
                if topics & RUNS != 0 {
                    workspace.runs = workspace.runs.wrapping_add(1);
                }
            });
        }
        if topics & WORK != 0 {
            self.work.send_modify(|value| {
                *value = value.wrapping_add(1);
            });
        }
        if topics & EVENTS != 0 {
            let mut runs = self
                .runs
                .lock()
                .unwrap_or_else(|poisoned| poisoned.into_inner());
            match event_roots {
                CommittedEvents::None => {}
                CommittedEvents::Runs(roots) => {
                    for root_id in roots {
                        if let Some(sender) = runs.get(&root_id) {
                            if sender.is_closed() {
                                runs.remove(&root_id);
                            } else {
                                sender.send_modify(|value| {
                                    *value = value.wrapping_add(1);
                                });
                            }
                        }
                    }
                    if runs.len() > PRUNE_RUNS_THRESHOLD {
                        runs.retain(|_, sender| !sender.is_closed());
                    }
                }
                CommittedEvents::All => {
                    runs.retain(|_, sender| {
                        if sender.is_closed() {
                            false
                        } else {
                            sender.send_modify(|value| {
                                *value = value.wrapping_add(1);
                            });
                            true
                        }
                    });
                }
            }
        }
    }

    pub(super) fn subscribe(&self) -> watch::Receiver<RuntimeChanges> {
        self.changes.subscribe()
    }

    pub(super) fn subscribe_workspace(&self) -> watch::Receiver<WorkspaceChanges> {
        self.workspace.subscribe()
    }

    pub(super) fn subscribe_work(&self) -> watch::Receiver<u64> {
        self.work.subscribe()
    }

    pub(super) fn watch_run(&self, run_id: &str) -> watch::Receiver<u64> {
        let mut runs = self
            .runs
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        runs.retain(|_, sender| !sender.is_closed());
        if let Some(sender) = runs.get(run_id) {
            return sender.subscribe();
        }
        let (sender, receiver) = watch::channel(0u64);
        runs.insert(run_id.to_owned(), sender);
        receiver
    }

    #[cfg(test)]
    pub(super) fn tracked_run_watchers(&self) -> usize {
        self.runs
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner())
            .len()
    }
}

#[cfg(test)]
mod tests {
    use super::super::SqliteStore;
    use crate::Error;
    use rusqlite::params;

    #[tokio::test]
    async fn publishes_only_committed_changes_and_leaves_reads_quiet() {
        let directory = tempfile::tempdir().unwrap();
        let store = SqliteStore::open(&directory.path().join("runtime.sqlite")).unwrap();
        let mut changes = store.observe();
        let result: Result<(), Error> = store
            .transaction(|tx| {
                tx.execute(
                    "INSERT INTO agent_runtime_threads VALUES('rollback','run')",
                    [],
                )
                .unwrap();
                Err(Error::Checkpoint("rollback".into()))
            })
            .await;
        assert!(result.is_err());
        assert!(!changes.has_changed().unwrap());
        store.transaction(|_| Ok(())).await.unwrap();
        assert!(!changes.has_changed().unwrap());
        store
            .clone()
            .transaction(|tx| {
                tx.execute(
                    "INSERT INTO agent_runtime_threads VALUES('commit','run')",
                    [],
                )
                .unwrap();
                Ok(())
            })
            .await
            .unwrap();
        assert!(changes.has_changed().unwrap());
        let current = *changes.borrow_and_update();
        assert_eq!((current.sessions, current.runs, current.events), (1, 1, 0));
    }

    #[tokio::test]
    async fn per_run_event_commits_do_not_wake_other_runs_work_or_workspace_and_reap_closed() {
        let directory = tempfile::tempdir().unwrap();
        let store = SqliteStore::open(&directory.path().join("runtime.sqlite")).unwrap();

        let mut run_a = store.watch_run("run_a");
        let run_b = store.watch_run("run_b");
        let mut work = store.observe_work();
        let workspace = store.observe_workspace();
        let mut global = store.observe();

        // Rolled-back event writes must not notify any watcher.
        let rolled_back: Result<(), Error> = store
            .transaction(|tx| {
                tx.execute(
                    "INSERT INTO agent_runtime_events(root_id, payload) VALUES('run_a', '{}')",
                    [],
                )
                .unwrap();
                Err(Error::Checkpoint("abort".into()))
            })
            .await;
        assert!(rolled_back.is_err());
        assert!(!run_a.has_changed().unwrap());
        assert!(!run_b.has_changed().unwrap());
        assert!(!work.has_changed().unwrap());
        assert!(!workspace.has_changed().unwrap());

        // High-frequency commits to run_a wake ONLY run_a (and backward-compatible global),
        // never run_b, work, or workspace.
        for seq in 0..32 {
            store
                .transaction(move |tx| {
                    tx.execute(
                        "INSERT INTO agent_runtime_events(root_id, payload) VALUES(?1, ?2)",
                        params!["run_a", format!(r#"{{"seq":{seq}}}"#)],
                    )
                    .unwrap();
                    Ok(())
                })
                .await
                .unwrap();
        }
        assert!(run_a.has_changed().unwrap());
        assert_eq!(*run_a.borrow_and_update(), 32);
        assert!(
            !run_b.has_changed().unwrap(),
            "events on run_a must not wake run_b"
        );
        assert!(
            !work.has_changed().unwrap(),
            "pure event writes must not wake wait_work"
        );
        assert!(
            !workspace.has_changed().unwrap(),
            "pure event writes must not wake workspace/changes"
        );
        assert!(global.has_changed().unwrap());
        assert_eq!(global.borrow_and_update().events, 32);

        // Work/run-table commits wake work and workspace, not per-run event streams.
        store
            .transaction(|tx| {
                tx.execute(
                    "INSERT INTO agent_runtime_work_changes(root_id, run_id, change_kind, native_status)
                     VALUES('run_a', 'run_a', 'run', 'running')",
                    [],
                )
                .unwrap();
                Ok(())
            })
            .await
            .unwrap();
        assert!(work.has_changed().unwrap());
        assert_eq!(*work.borrow_and_update(), 1);
        assert!(!run_a.has_changed().unwrap());
        assert!(!run_b.has_changed().unwrap());

        // Dropping subscribers reaps closed entries without leaking memory.
        drop(run_a);
        drop(run_b);
        store
            .transaction(|tx| {
                tx.execute(
                    "INSERT INTO agent_runtime_events(root_id, payload) VALUES('run_a', '{}')",
                    [],
                )
                .unwrap();
                Ok(())
            })
            .await
            .unwrap();
        let run_c = store.watch_run("run_c");
        assert_eq!(store.observer.tracked_run_watchers(), 1);
        drop(run_c);
    }
}
