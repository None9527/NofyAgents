//! Orphan sweep: the execution half of the forensics ledger (HM-F3).
//!
//! When a daemon dies non-cleanly, processes it vouched for (providers,
//! spawned tools) can outlive it. The next daemon rotates the children
//! registry at boot and sweeps entries that are still alive — PID-reuse safe
//! via `/proc/<pid>/stat` starttime comparison, TERM-then-KILL.
//!
//! Single-instance locking makes this sound: a live predecessor cannot exist,
//! so every `children.prev.jsonl` entry belongs to a dead run.

use std::fs;
use std::path::PathBuf;
use std::time::Duration;

use serde::{Deserialize, Serialize};

pub const CHILDREN_FILE: &str = "children.jsonl";
pub const CHILDREN_PREV_FILE: &str = "children.prev.jsonl";

const TERM_GRACE: Duration = Duration::from_millis(500);

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChildEntry {
    pub pid: u32,
    /// Kernel start time (clock ticks) — the PID-reuse defense.
    pub starttime: u64,
    pub label: String,
}

/// Read `/proc/<pid>/stat` field 22 (starttime). None = no such process.
pub fn proc_starttime(pid: u32) -> Option<u64> {
    let stat = fs::read_to_string(format!("/proc/{pid}/stat")).ok()?;
    // comm may contain spaces/parens: cut after the last ')'.
    let after = stat.rsplit_once(')')?.1;
    after.split_whitespace().nth(19)?.parse().ok()
}

/// Alive AND the same process (starttime matches) — PID-reuse safe.
pub fn proc_is(entry: &ChildEntry) -> bool {
    proc_starttime(entry.pid) == Some(entry.starttime)
}

#[derive(Debug, Default)]
pub struct ChildrenRegistry {
    dir: PathBuf,
}

impl ChildrenRegistry {
    pub fn at(dir: impl Into<PathBuf>) -> Self {
        Self { dir: dir.into() }
    }

    fn live_path(&self) -> PathBuf {
        self.dir.join(CHILDREN_FILE)
    }

    fn prev_path(&self) -> PathBuf {
        self.dir.join(CHILDREN_PREV_FILE)
    }

    /// Vouch for a child the daemon co-owns.
    pub fn register(&self, pid: u32, label: &str) -> std::io::Result<()> {
        use std::io::Write;
        fs::create_dir_all(&self.dir)?;
        let entry = ChildEntry {
            pid,
            starttime: proc_starttime(pid).unwrap_or(0),
            label: label.to_string(),
        };
        let mut f = fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(self.live_path())?;
        writeln!(f, "{}", serde_json::to_string(&entry)?)?;
        f.sync_all()
    }

    /// Boot-time rotation: current becomes prev; the sweep reads prev.
    pub fn rotate(&self) -> std::io::Result<()> {
        let _ = fs::remove_file(self.prev_path());
        if self.live_path().exists() {
            fs::rename(self.live_path(), self.prev_path())?;
        }
        Ok(())
    }

    /// Sweep still-alive entries from the previous run: TERM, grace, KILL.
    /// Returns the entries that were swept.
    pub fn sweep_prev(&self) -> Vec<ChildEntry> {
        let Ok(text) = fs::read_to_string(self.prev_path()) else {
            return Vec::new();
        };
        let mut swept = Vec::new();
        for line in text.lines() {
            let Ok(entry) = serde_json::from_str::<ChildEntry>(line) else {
                continue;
            };
            if !proc_is(&entry) {
                continue; // already gone (or PID reused by another process)
            }
            unsafe {
                libc::kill(entry.pid as i32, libc::SIGTERM);
            }
            std::thread::sleep(TERM_GRACE);
            if proc_is(&entry) {
                unsafe {
                    libc::kill(entry.pid as i32, libc::SIGKILL);
                }
            }
            tracing::warn!(pid = entry.pid, label = %entry.label, "swept orphan from dead run");
            swept.push(entry);
        }
        swept
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[cfg(target_os = "linux")]
    fn spawn_sleeper() -> std::process::Child {
        std::process::Command::new("sleep").arg("30").spawn().unwrap()
    }

    #[cfg(target_os = "linux")]
    #[test]
    fn proc_is_matches_live_and_rejects_wrong_starttime() {
        let mut child = spawn_sleeper();
        let pid = child.id();
        let real = proc_starttime(pid).unwrap();
        assert!(proc_is(&ChildEntry {
            pid,
            starttime: real,
            label: "t".into()
        }));
        assert!(
            !proc_is(&ChildEntry {
                pid,
                starttime: real.wrapping_add(1),
                label: "t".into()
            }),
            "PID-reuse defense: same pid, different starttime = not ours"
        );
        child.kill().unwrap();
        let _ = child.wait();
        let gone = proc_starttime(pid).is_none();
        let not_ours = !proc_is(&ChildEntry {
            pid,
            starttime: real,
            label: "t".into(),
        });
        assert!(gone || not_ours);
    }

    #[cfg(target_os = "linux")]
    #[test]
    fn sweep_kills_orphans_of_dead_run() {
        let dir = tempfile::tempdir().unwrap();
        let reg = ChildrenRegistry::at(dir.path());

        let mut orphan = spawn_sleeper();
        let pid = orphan.id();
        reg.register(pid, "provider").unwrap();
        // Simulate daemon death + next boot: rotate then sweep.
        reg.rotate().unwrap();
        let swept = reg.sweep_prev();
        assert_eq!(swept.len(), 1);
        assert_eq!(swept[0].pid, pid);
        // The orphan must be dying: wait reaps it.
        let status = orphan.wait().unwrap();
        assert!(!status.success(), "orphan terminated by sweep");
    }

    #[cfg(target_os = "linux")]
    #[test]
    fn sweep_ignores_dead_entries() {
        let dir = tempfile::tempdir().unwrap();
        let reg = ChildrenRegistry::at(dir.path());
        let mut child = spawn_sleeper();
        let pid = child.id();
        let st = proc_starttime(pid).unwrap();
        child.kill().unwrap();
        let _ = child.wait();
        reg.register(pid, "gone").unwrap(); // starttime of a dead pid = 0 fallback
        reg.rotate().unwrap();
        let swept = reg.sweep_prev();
        assert!(
            swept.is_empty(),
            "dead entries must not be swept (no kill on reused pids)"
        );
        let _ = st;
    }

    #[test]
    fn sweep_skips_torn_journal_lines() {
        // A torn tail in the prev registry is tolerated: garbage lines are
        // skipped, never an error.
        let dir = tempfile::tempdir().unwrap();
        let reg = ChildrenRegistry::at(dir.path());
        std::fs::create_dir_all(dir.path()).unwrap();
        std::fs::write(
            dir.path().join(CHILDREN_PREV_FILE),
            "{ not json at all\n",
        )
        .unwrap();
        let swept = reg.sweep_prev();
        assert!(swept.is_empty(), "torn lines carry no sweepable entry");
    }

    #[cfg(target_os = "linux")]
    #[test]
    fn sweep_escalates_to_kill_when_term_is_ignored() {
        // A child that traps SIGTERM survives the grace window and must be
        // escalated to SIGKILL.
        let dir = tempfile::tempdir().unwrap();
        let reg = ChildrenRegistry::at(dir.path());
        let mut stubborn = std::process::Command::new("sh")
            .arg("-c")
            .arg("trap '' TERM; sleep 30")
            .spawn()
            .unwrap();
        let pid = stubborn.id();
        reg.register(pid, "stubborn").unwrap();
        reg.rotate().unwrap();
        let swept = reg.sweep_prev();
        assert_eq!(swept.len(), 1);
        assert_eq!(swept[0].pid, pid);
        let status = stubborn.wait().unwrap();
        assert!(!status.success(), "TERM-ignoring orphan dies to the escalation");
    }

    #[cfg(target_os = "linux")]
    #[test]
    fn sweep_skips_kill_when_term_already_reaped() {
        // An orphaned grandchild dies to TERM and is reaped by init within
        // the grace window: the post-grace check sees it gone and the KILL
        // escalation is skipped.
        let dir = tempfile::tempdir().unwrap();
        let reg = ChildrenRegistry::at(dir.path());
        let mut launcher = std::process::Command::new("sh")
            .arg("-c")
            // The grandchild must not inherit the stdout pipe (its write
            // end would keep the launcher's output open past its own exit).
            .arg("sh -c 'sleep 30' >/dev/null 2>&1 & echo $!")
            .stdout(std::process::Stdio::piped())
            .spawn()
            .unwrap();
        let mut out = String::new();
        use std::io::Read;
        launcher.stdout.as_mut().unwrap().read_to_string(&mut out).unwrap();
        let _ = launcher.wait(); // reap the launcher; the grandchild orphans
        let pid: u32 = out.trim().parse().unwrap();
        reg.register(pid, "orphan").unwrap();
        reg.rotate().unwrap();
        let swept = reg.sweep_prev();
        assert_eq!(swept.len(), 1);
        assert_eq!(swept[0].pid, pid);
    }
}
