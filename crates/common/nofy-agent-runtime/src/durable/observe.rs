use rusqlite::Connection;
use std::sync::{
    Arc,
    atomic::{AtomicU8, Ordering},
};
use tokio::sync::watch;

const SESSIONS: u8 = 1;
const RUNS: u8 = 2;
const EVENTS: u8 = 4;

/// Invalidation counters, independent of the durable journal's replay cursor.
#[derive(Clone, Copy, Default)]
pub struct RuntimeChanges {
    pub sessions: u64,
    pub runs: u64,
    pub events: u64,
}

pub(super) struct Observer {
    pending: Arc<AtomicU8>,
    changes: watch::Sender<RuntimeChanges>,
}

impl Observer {
    pub(super) fn new() -> Self {
        Self {
            pending: Arc::default(),
            changes: watch::channel(RuntimeChanges::default()).0,
        }
    }

    pub(super) fn attach(&self, connection: &Connection) {
        let pending = self.pending.clone();
        connection.update_hook(Some(move |_, _: &str, table: &str, _| {
            let topics = match table {
                "agent_runtime_sessions"
                | "agent_runtime_session_profiles"
                | "agent_runtime_session_titles" => SESSIONS,
                "agent_runtime_runs"
                | "agent_runtime_threads"
                | "agent_runtime_jobs"
                | "agent_runtime_managed_runs"
                | "agent_runtime_session_turns" => SESSIONS | RUNS,
                "agent_runtime_approvals"
                | "agent_runtime_children"
                | "agent_runtime_parks"
                | "agent_runtime_managed_actions"
                | "agent_runtime_mailbox"
                | "agent_runtime_cancel" => RUNS,
                "agent_runtime_events" => EVENTS,
                _ => return,
            };
            pending.fetch_or(topics, Ordering::Relaxed);
        }));
    }

    pub(super) fn clear(&self) {
        self.pending.store(0, Ordering::Relaxed);
    }

    pub(super) fn committed(&self) {
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
    }

    pub(super) fn subscribe(&self) -> watch::Receiver<RuntimeChanges> {
        self.changes.subscribe()
    }
}

#[cfg(test)]
mod tests {
    use super::super::SqliteStore;
    use crate::Error;

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
}
