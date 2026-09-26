//! Cross-process session index (PRD FR4.3 / HM-F8 translated).
//!
//! The on-disk layout is `{root}/sessions/{cwd_key}/{session_id}/` with
//! `chat_history.jsonl` as the durable truth. This crate walks that tree
//! directly — no shell, no storage-adapter dependency — so the daemon and
//! foreign tools can list/lookup sessions of ANY nofy process sharing the
//! root. `cwd_key` stays opaque (the encoding belongs to `nofy-config`);
//! freshness comes from file mtimes, which is what a registry needs; content
//! reads stay with the owner.

use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

pub const HISTORY_FILE: &str = "chat_history.jsonl";

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SessionRecord {
    pub session_id: String,
    /// Encoded cwd directory name (opaque here).
    pub cwd_key: String,
    /// mtime of the history file, unix ms; 0 when unreadable.
    pub updated_at_ms: u64,
    pub history_bytes: u64,
}

#[derive(Debug, Default)]
pub struct Registry {
    root: PathBuf,
}

impl Registry {
    /// `root` is the NOFY_HOME state root (contains `sessions/`).
    pub fn at(root: impl Into<PathBuf>) -> Self {
        Self { root: root.into() }
    }

    /// The NOFY_HOME state root this registry walks.
    pub fn root(&self) -> &std::path::Path {
        &self.root
    }

    fn sessions_dir(&self) -> PathBuf {
        self.root.join("sessions")
    }

    /// All sessions under the root, newest first. Missing root = empty (a
    /// fresh host has no sessions, not an error).
    pub fn list(&self) -> Vec<SessionRecord> {
        let mut out = Vec::new();
        let Ok(cwds) = fs::read_dir(self.sessions_dir()) else {
            return out;
        };
        for cwd in cwds.flatten() {
            let cwd_key = cwd.file_name().to_string_lossy().to_string();
            let Ok(ids) = fs::read_dir(cwd.path()) else {
                continue;
            };
            for sid in ids.flatten() {
                let history = sid.path().join(HISTORY_FILE);
                let meta = fs::metadata(&history).ok();
                out.push(SessionRecord {
                    session_id: sid.file_name().to_string_lossy().to_string(),
                    cwd_key: cwd_key.clone(),
                    updated_at_ms: meta
                        .as_ref()
                        .and_then(|m| m.modified().ok())
                        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                        .map(|d| d.as_millis() as u64)
                        .unwrap_or(0),
                    history_bytes: meta.map(|m| m.len()).unwrap_or(0),
                });
            }
        }
        out.sort_by(|a, b| b.updated_at_ms.cmp(&a.updated_at_ms));
        out
    }

    /// Find one session anywhere under the root.
    pub fn lookup(&self, session_id: &str) -> Option<SessionRecord> {
        self.list().into_iter().find(|r| r.session_id == session_id)
    }

    /// Absolute session directory, when the session exists.
    pub fn session_dir(&self, session_id: &str) -> Option<PathBuf> {
        let rec = self.lookup(session_id)?;
        Some(self.sessions_dir().join(&rec.cwd_key).join(&rec.session_id))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn seed(root: &std::path::Path, cwd_key: &str, session_id: &str, bytes: usize) {
        let dir = root.join("sessions").join(cwd_key).join(session_id);
        fs::create_dir_all(&dir).unwrap();
        fs::write(dir.join(HISTORY_FILE), "x".repeat(bytes)).unwrap();
    }

    #[test]
    fn missing_root_lists_empty() {
        let tmp = tempfile::tempdir().unwrap();
        let reg = Registry::at(tmp.path().join("nope"));
        assert!(reg.list().is_empty());
        assert!(reg.lookup("s1").is_none());
    }

    #[test]
    fn lists_across_cwds_newest_first() {
        let tmp = tempfile::tempdir().unwrap();
        seed(tmp.path(), "cw1", "old", 10);
        std::thread::sleep(std::time::Duration::from_millis(15));
        seed(tmp.path(), "cw2", "new", 20);
        let reg = Registry::at(tmp.path());
        let all = reg.list();
        assert_eq!(all.len(), 2);
        assert_eq!(all[0].session_id, "new", "newest first");
        assert_eq!(all[0].history_bytes, 20);
        assert_eq!(all[1].cwd_key, "cw1");
    }

    #[test]
    fn lookup_and_dir_resolution() {
        let tmp = tempfile::tempdir().unwrap();
        seed(tmp.path(), "cw1", "s1", 5);
        let reg = Registry::at(tmp.path());
        let dir = reg.session_dir("s1").unwrap();
        assert!(dir.join(HISTORY_FILE).exists());
        assert!(reg.session_dir("absent").is_none());
    }

    #[test]
    fn stray_file_where_a_cwd_dir_should_be_is_skipped() {
        let tmp = tempfile::tempdir().unwrap();
        seed(tmp.path(), "cw1", "s1", 5);
        // A stray file where a cwd directory is expected: unreadable as a
        // directory, skipped — never a crash, never a phantom session.
        fs::write(tmp.path().join("sessions").join("stray"), "x").unwrap();
        let reg = Registry::at(tmp.path());
        let all = reg.list();
        assert_eq!(all.len(), 1, "stray non-directory entry skipped");
        assert_eq!(all[0].session_id, "s1");
    }
}
