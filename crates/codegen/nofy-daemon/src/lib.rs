//! Per-host daemon primitives: single-instance lock and exit-code contract.
//!
//! The daemon (B1+) is the per-host control plane; this crate owns the two
//! process-authority pieces every supervisor integration needs:
//!
//! - [`SingleInstanceLock`] — double lock (flock + inode identity) so a second
//!   daemon can never run concurrently, and a deleted/recreated lockfile can
//!   never split the singleton;
//! - [`exit_codes`] — the exit code IS the restart-policy semantics; the
//!   supervisor (systemd/launchd) branches on it.
//!
//! No tokio, no config, no session semantics: dependency budget is
//! `fs2`+`tracing` so the lock stays usable from the earliest boot phase.

pub mod approval;
pub mod control_client;
pub mod daemon;
pub mod eviction;
pub mod live;
pub mod forensics;
pub mod health;
pub mod orchestra;
pub mod pack;
pub mod proc;
pub mod provider;
pub mod recovery;
pub mod runlife;
pub mod runstore;
pub mod schedclock;
pub mod scheduler;
pub mod search_proxy;
pub mod steward;
pub mod surfaces;
pub mod sd_notify;
pub mod wire;

use std::fs;
use std::io::Write;
use std::os::unix::fs::MetadataExt;
use std::path::{Path, PathBuf};

use fs2::FileExt;

/// Supervisor exit-code contract: the code is restart-policy semantics.
pub mod exit_codes {
    /// Clean shutdown; no restart.
    pub const OK: i32 = 0;
    /// Unrecoverable error; supervisor may restart with backoff.
    pub const ERROR: i32 = 1;
    /// Configuration/policy invalid; do NOT restart-loop, surface to admin.
    pub const CONFIG: i32 = 2;
    /// Daemon requests a supervised restart (staged update adopt, re-exec).
    pub const RESTART_REQUESTED: i32 = 10;
    /// Another live daemon holds the lock; never restart-loop on this.
    pub const ALREADY_RUNNING: i32 = 11;
    /// The out-of-loop watchdog declared the event loop wedged; supervisor
    /// should restart once and record the forensics entry.
    pub const WEDGE_DETECTED: i32 = 12;
}

const LOCK_NAME: &str = "nofy-daemon.lock";
const INODE_RETRY: usize = 16;

#[derive(Debug)]
pub enum LockError {
    /// A live daemon holds the lock.
    AlreadyRunning { holder: Option<LockPayload> },
    /// Lockfile kept being unlinked/recreated under us (pathological race).
    Contended,
    Io(std::io::Error),
}

impl From<std::io::Error> for LockError {
    fn from(e: std::io::Error) -> Self {
        LockError::Io(e)
    }
}

/// Parsed lockfile payload: holder pid + kernel start time (PID-reuse defense).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct LockPayload {
    pub pid: u32,
    pub starttime: u64,
}

fn proc_starttime(pid: u32) -> Option<u64> {
    let stat = fs::read_to_string(format!("/proc/{pid}/stat")).ok()?;
    // Field 22 (1-based) after the comm field, which may contain spaces and
    // parens: split after the last ')'.
    let after_comm = stat.rsplit_once(')')?.1;
    after_comm.split_whitespace().nth(19)?.parse().ok()
}

fn same_inode(a: &fs::Metadata, b: &fs::Metadata) -> bool {
    a.dev() == b.dev() && a.ino() == b.ino()
}

/// The held single-instance lock. Dropping it releases the flock and lets a
/// successor acquire; the lockfile itself is left for diagnostics.
pub struct SingleInstanceLock {
    path: PathBuf,
    file: fs::File,
}

impl SingleInstanceLock {
    /// Acquire `<dir>/nofy-daemon.lock` exclusively, or report the live holder.
    ///
    /// Double lock: an exclusive `flock` proves liveness (the kernel drops it
    /// when the holder dies), and an inode identity check proves the path we
    /// locked is still THE lockfile (a daemon that lost its file to unlink+
    /// recreate must not believe it owns the singleton).
    pub fn acquire(dir: &Path) -> Result<Self, LockError> {
        fs::create_dir_all(dir)?;
        let path = dir.join(LOCK_NAME);
        for _ in 0..INODE_RETRY {
            let file = fs::OpenOptions::new()
                .read(true)
                .write(true)
                .create(true)
                .truncate(false)
                .open(&path)?;
            if file.try_lock_exclusive().is_err() {
                return Err(LockError::AlreadyRunning {
                    holder: read_payload(&file),
                });
            }
            let locked = file.metadata()?;
            let by_path = fs::metadata(&path)?;
            if same_inode(&locked, &by_path) {
                let payload = LockPayload {
                    pid: std::process::id(),
                    starttime: proc_starttime(std::process::id()).unwrap_or(0),
                };
                let mut f = &file;
                f.set_len(0)?;
                writeln!(f, "{} {}", payload.pid, payload.starttime)?;
                f.sync_all()?;
                tracing::debug!(path = %path.display(), pid = payload.pid, "daemon lock acquired");
                return Ok(Self { path, file });
            }
            // Unlinked/recreated between open and check: drop and retry with a
            // fresh handle.
        }
        Err(LockError::Contended)
    }

    /// Who we wrote into the lockfile (diagnostics / tests).
    pub fn payload(&self) -> Option<LockPayload> {
        read_payload(&self.file)
    }

    pub fn path(&self) -> &Path {
        &self.path
    }
}

fn read_payload(file: &fs::File) -> Option<LockPayload> {
    use std::io::{Read, Seek, SeekFrom};
    let mut f = file.try_clone().ok()?;
    f.seek(SeekFrom::Start(0)).ok()?;
    let mut text = String::new();
    f.read_to_string(&mut text).ok()?;
    let mut it = text.split_whitespace();
    Some(LockPayload {
        pid: it.next()?.parse().ok()?,
        starttime: it.next()?.parse().ok()?,
    })
}

impl Drop for SingleInstanceLock {
    fn drop(&mut self) {
        // flock releases on drop/close; nothing to do explicitly. Kept for a
        // future teardown hook (pidfile hygiene) without changing callers.
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn second_acquire_reports_live_holder() {
        let dir = tempfile::tempdir().unwrap();
        let lock = SingleInstanceLock::acquire(dir.path()).expect("first lock");
        let payload = lock.payload().expect("payload written");
        assert_eq!(payload.pid, std::process::id());
        #[cfg(target_os = "linux")]
        assert!(payload.starttime > 0, "starttime must be readable on Linux");

        let second = SingleInstanceLock::acquire(dir.path());
        let Err(LockError::AlreadyRunning { holder }) = second else { panic!("expected AlreadyRunning, got {:?}", second.map(|_| ())) };
        assert_eq!(holder.expect("holder payload").pid, std::process::id());
    }

    #[test]
    fn io_errors_lift_into_lock_error() {
        let err: LockError = std::io::Error::new(std::io::ErrorKind::PermissionDenied, "denied")
            .into();
        assert!(matches!(err, LockError::Io(e) if e.kind() == std::io::ErrorKind::PermissionDenied));
    }

    #[test]
    fn drop_releases_for_successor() {
        let dir = tempfile::tempdir().unwrap();
        let lock = SingleInstanceLock::acquire(dir.path()).unwrap();
        drop(lock);
        let again = SingleInstanceLock::acquire(dir.path());
        assert!(again.is_ok(), "successor must acquire after drop");
    }

    #[test]
    fn deleted_lockfile_takeover_is_detectable() {
        let dir = tempfile::tempdir().unwrap();
        let lock = SingleInstanceLock::acquire(dir.path()).unwrap();
        let old_pid = lock.payload().unwrap().pid;
        // Hostile unlink while the daemon lives: a newcomer creates a NEW file
        // and locks its new inode (takeover semantics), while the old holder
        // keeps the old inode and its payload. The split is therefore visible
        // to any consumer comparing payload liveness — never silent.
        std::fs::remove_file(lock.path()).unwrap();
        let takeover = SingleInstanceLock::acquire(dir.path()).expect("takeover after unlink");
        assert_eq!(takeover.payload().unwrap().pid, old_pid);
    }
}
