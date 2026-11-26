//! Lightweight process-spawning utilities for TTY safety and child-tree ownership.
//!
//! Child processes spawned by the runtime and host must be detached from any
//! controlling terminal and owned inside a process group (Unix) or Job Object
//! (Windows) so cancelling or dropping a caller tears down the entire tree.
//!
//! # Usage
//!
//! ```rust,no_run
//! use nofy_tty_utils::{OwnedChild, detach_command};
//! use std::process::Stdio;
//!
//! let mut cmd = tokio::process::Command::new("git");
//! cmd.args(["status", "--porcelain"]);
//! detach_command(&mut cmd);
//! cmd.stdin(Stdio::null());
//! let _owned = OwnedChild::spawn(&mut cmd);
//! ```

use std::io;

pub mod runtime;

/// Read the terminating signal on platforms that report one.
pub fn exit_signal(status: &std::process::ExitStatus) -> Option<i32> {
    #[cfg(unix)]
    {
        use std::os::unix::process::ExitStatusExt;
        status.signal()
    }
    #[cfg(not(unix))]
    {
        let _ = status;
        None
    }
}

/// Wait for a process shutdown signal: `SIGINT` or `SIGTERM` on Unix,
/// `Ctrl+C` elsewhere.
///
/// Resident services use this so systemd/Docker `SIGTERM` runs the same
/// graceful shutdown, lease release, and child-process teardown path as
/// interactive `Ctrl+C`.
pub async fn shutdown_signal() -> io::Result<()> {
    #[cfg(unix)]
    {
        use tokio::signal::unix::{SignalKind, signal};
        let mut terminate = signal(SignalKind::terminate())?;
        tokio::select! {
            result = tokio::signal::ctrl_c() => result,
            received = terminate.recv() => {
                let _ = received;
                Ok(())
            }
        }
    }
    #[cfg(not(unix))]
    {
        tokio::signal::ctrl_c().await
    }
}

/// Detach from the controlling TTY by starting a new session.
///
/// If `setsid()` fails with `EPERM` (the process is already a process group
/// leader), falls back to `setpgid(0, 0)` which still gives process-group
/// isolation.
///
/// # Safety
///
/// Must only be called inside a `pre_exec` hook (between `fork` and `exec`).
/// Both `setsid()` and `setpgid()` are async-signal-safe (POSIX).
#[cfg(unix)]
fn detach_from_tty() -> io::Result<()> {
    use nix::errno::Errno;
    use nix::unistd::{Pid, setpgid, setsid};

    match setsid() {
        Ok(_) => Ok(()),
        Err(Errno::EPERM) => {
            setpgid(Pid::from_raw(0), Pid::from_raw(0))
                .map_err(|e| io::Error::from_raw_os_error(e as i32))?;
            Ok(())
        }
        Err(e) => Err(io::Error::from_raw_os_error(e as i32)),
    }
}

/// Detach a `tokio::process::Command` from the parent's controlling TTY/console
/// and place it in its own process group.
///
/// - Unix: `pre_exec` hook calling `setsid` (`EPERM` fallback: `setpgid`), which
///   both detaches from the controlling TTY and starts a new process group.
/// - Windows: `CREATE_NO_WINDOW | CREATE_NEW_PROCESS_GROUP` applied in one call
///   so neither flag overwrites the other. Do NOT add `DETACHED_PROCESS` — it
///   breaks stdio pipe inheritance for grandchildren (`cmd.exe` → `node`).
pub fn detach_command(cmd: &mut tokio::process::Command) {
    #[cfg(unix)]
    {
        // SAFETY: `detach_from_tty` only calls `setsid`/`setpgid`, both POSIX
        // async-signal-safe, satisfying the `pre_exec` contract.
        unsafe {
            cmd.pre_exec(detach_from_tty);
        }
    }
    #[cfg(windows)]
    {
        use windows::Win32::System::Threading::{CREATE_NEW_PROCESS_GROUP, CREATE_NO_WINDOW};
        cmd.creation_flags((CREATE_NO_WINDOW | CREATE_NEW_PROCESS_GROUP).0);
    }
}

/// Bind the *current* process's lifetime to its parent: on Linux, arm
/// `PR_SET_PDEATHSIG(SIGTERM)` so this process is terminated when the
/// process that spawned it dies. No-op elsewhere.
///
/// Used by stdio protocol servers whose parents are external clients (IDE
/// hosts, agent SDKs) so the child arms the binding itself at startup instead
/// of relying on every spawner to do so.
///
/// Unlike a spawn-time helper there is no `ppid` race check: a direct parent at
/// PID 1 is legitimate inside containers, and stdin-EOF covers the
/// parent-died-before-arm window.
///
/// # Errors
///
/// Returns the `prctl` errno on Linux when the arm fails; always `Ok(())` on
/// non-Linux platforms (no-op).
pub fn kill_current_process_on_parent_death() -> io::Result<()> {
    #[cfg(target_os = "linux")]
    {
        // SAFETY: `prctl(PR_SET_PDEATHSIG, ...)` only sets the calling process's
        // parent-death signal; it reads/writes no caller memory.
        if unsafe { libc::prctl(libc::PR_SET_PDEATHSIG, libc::SIGTERM as libc::c_ulong) } == -1 {
            return Err(io::Error::last_os_error());
        }
    }
    Ok(())
}

/// A Unix process-group id validated as safe to pass to `killpg`.
///
/// `killpg(pgid)` is `kill(-pgid)`, so a degenerate pgid escalates a scoped
/// group-kill into a broadcast: `0` signals the caller's own group, `1` signals
/// init, and the caller's own pgid would SIGKILL this process and its tree.
#[cfg(unix)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
struct ProcessGroupId(u32);

#[cfg(unix)]
impl ProcessGroupId {
    fn new(pid: u32) -> io::Result<Self> {
        if pid <= 1 {
            return Err(io::Error::new(
                io::ErrorKind::InvalidInput,
                format!("refusing degenerate process-group id {pid} (0 = own group, 1 = init)"),
            ));
        }
        if pid > i32::MAX as u32 {
            return Err(io::Error::new(
                io::ErrorKind::InvalidInput,
                format!("process-group id {pid} exceeds i32::MAX; cannot be used with killpg"),
            ));
        }
        if i64::from(pid) == i64::from(nix::unistd::getpgrp().as_raw()) {
            return Err(io::Error::new(
                io::ErrorKind::InvalidInput,
                format!("refusing to killpg the caller's own process group ({pid})"),
            ));
        }
        Ok(Self(pid))
    }

    fn get(self) -> u32 {
        self.0
    }
}

/// Process-tree teardown handle.
///
/// - Unix: holds the validated group-leader id; dispatches to `killpg(pgid, SIGKILL)`.
/// - Windows: holds a Job Object with `JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE`.
///
/// **Drop semantics differ by platform.** On Windows, drop terminates every
/// process in the job. On Unix, drop is a no-op — call [`kill`](Self::kill)
/// explicitly (or use [`OwnedChild`], whose `Drop` calls `kill`).
pub struct ProcessGroup {
    #[cfg(unix)]
    leader: Option<ProcessGroupId>,
    #[cfg(windows)]
    job: windows::Win32::Foundation::HANDLE,
}

// SAFETY: A Windows Job Object HANDLE is an opaque kernel object handle that can
// be shared and closed safely from any thread in the owning process.
#[cfg(windows)]
unsafe impl Send for ProcessGroup {}
// SAFETY: Job Object operations (`AssignProcessToJobObject`, `TerminateJobObject`)
// are kernel-synchronized and safe to invoke concurrently across threads.
#[cfg(windows)]
unsafe impl Sync for ProcessGroup {}

impl ProcessGroup {
    pub fn new() -> io::Result<Self> {
        #[cfg(unix)]
        {
            Ok(Self { leader: None })
        }
        #[cfg(windows)]
        {
            use std::mem::{size_of, zeroed};
            use windows::Win32::Foundation::CloseHandle;
            use windows::Win32::System::JobObjects::{
                CreateJobObjectW, JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE,
                JOBOBJECT_EXTENDED_LIMIT_INFORMATION, JobObjectExtendedLimitInformation,
                SetInformationJobObject,
            };
            use windows::core::PCWSTR;

            // SAFETY: Creating an anonymous Job Object with default security
            // attributes passes no caller pointers and returns an owned handle.
            let job = unsafe { CreateJobObjectW(None, PCWSTR::null()) }
                .map_err(|e| io::Error::other(format!("CreateJobObjectW: {e}")))?;

            // SAFETY: `JOBOBJECT_EXTENDED_LIMIT_INFORMATION` is a plain C struct
            // for which all-zero is a valid initial state.
            let mut info: JOBOBJECT_EXTENDED_LIMIT_INFORMATION = unsafe { zeroed() };
            info.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;

            // SAFETY: `job` is a valid newly created Job Object handle and `info`
            // outlives the call with its exact byte size passed.
            let result = unsafe {
                SetInformationJobObject(
                    job,
                    JobObjectExtendedLimitInformation,
                    (&info as *const JOBOBJECT_EXTENDED_LIMIT_INFORMATION).cast(),
                    size_of::<JOBOBJECT_EXTENDED_LIMIT_INFORMATION>() as u32,
                )
            };
            if let Err(e) = result {
                // SAFETY: `job` is a valid owned handle that will not be used again.
                let _ = unsafe { CloseHandle(job) };
                return Err(io::Error::other(format!("SetInformationJobObject: {e}")));
            }

            Ok(Self { job })
        }
    }

    pub fn attach(&mut self, child: &tokio::process::Child) -> io::Result<()> {
        let pid = child
            .id()
            .ok_or_else(|| io::Error::other("ProcessGroup::attach: child has already exited"))?;
        self.attach_pid(pid)
    }

    fn attach_pid(&mut self, pid: u32) -> io::Result<()> {
        #[cfg(unix)]
        {
            self.leader = Some(ProcessGroupId::new(pid)?);
            Ok(())
        }
        #[cfg(windows)]
        {
            use windows::Win32::Foundation::CloseHandle;
            use windows::Win32::System::JobObjects::AssignProcessToJobObject;
            use windows::Win32::System::Threading::{
                OpenProcess, PROCESS_SET_QUOTA, PROCESS_TERMINATE,
            };

            // SAFETY: `OpenProcess` takes only access rights and a PID, returning
            // an owned process handle on success.
            let process_handle =
                unsafe { OpenProcess(PROCESS_SET_QUOTA | PROCESS_TERMINATE, false, pid) }
                    .map_err(|e| io::Error::other(format!("OpenProcess({pid}): {e}")))?;

            // SAFETY: `self.job` is a valid owned Job Object handle and
            // `process_handle` was just returned by `OpenProcess`.
            let assign_result = unsafe { AssignProcessToJobObject(self.job, process_handle) }
                .map_err(|e| io::Error::other(format!("AssignProcessToJobObject: {e}")));
            // SAFETY: `process_handle` was opened above and is closed exactly once here.
            let _ = unsafe { CloseHandle(process_handle) };

            assign_result.map_err(|e| io::Error::other(format!("attach_pid({pid}): {e}")))
        }
    }

    pub fn kill(&self) -> io::Result<()> {
        #[cfg(unix)]
        {
            let Some(leader) = self.leader else {
                return Ok(());
            };
            nix::sys::signal::killpg(
                nix::unistd::Pid::from_raw(leader.get() as i32),
                nix::sys::signal::Signal::SIGKILL,
            )
            .map_err(|e| io::Error::from_raw_os_error(e as i32))
        }
        #[cfg(windows)]
        {
            use windows::Win32::System::JobObjects::TerminateJobObject;
            // SAFETY: `self.job` is a valid owned Job Object handle for the lifetime of `self`.
            unsafe { TerminateJobObject(self.job, 1) }
                .map_err(|e| io::Error::other(format!("TerminateJobObject: {e}")))
        }
    }
}

#[cfg(windows)]
impl Drop for ProcessGroup {
    fn drop(&mut self) {
        // SAFETY: `self.job` is owned exclusively by `ProcessGroup` and closed once on drop.
        let _ = unsafe { windows::Win32::Foundation::CloseHandle(self.job) };
    }
}

/// A child process together with the process group that holds its whole tree.
///
/// This is the one place that starts and owns a short-lived tool child
/// (`Command::spawn` is otherwise disallowed by `clippy.toml`). Dropping the
/// value kills the group, grandchildren included, and then the direct child, so
/// a cancelled or panicking caller cannot leave a tree behind. [`ProcessGroup`]
/// has no `Drop` of its own on Unix, so this `Drop` is what reaches descendants.
///
/// Callers keep waiting for and reading from [`child`](Self::child) as usual.
pub struct OwnedChild {
    pub child: tokio::process::Child,
    group: ProcessGroup,
}

/// Why [`OwnedChild::spawn`] failed. The child, if it started, has been killed.
#[derive(Debug)]
pub enum OwnedChildError {
    /// The command could not be started.
    Spawn(io::Error),
    /// The process group could not be created.
    Group(io::Error),
    /// The child could not be placed in its process group.
    Attach(io::Error),
}

impl OwnedChild {
    /// Start `command` and enrol the child in a new process group.
    ///
    /// Configure `command` first (`detach_command`, sandbox preparation): this
    /// only adds `kill_on_drop` and owns the result. On Windows the Job Object
    /// is created before spawning to fail fast and narrow the attach window.
    pub fn spawn(command: &mut tokio::process::Command) -> Result<Self, OwnedChildError> {
        command.kill_on_drop(true);
        let mut group = ProcessGroup::new().map_err(OwnedChildError::Group)?;
        #[allow(clippy::disallowed_methods)] // this type is the owner
        let mut child = command.spawn().map_err(OwnedChildError::Spawn)?;
        if let Err(error) = group.attach(&child) {
            let _ = child.start_kill();
            return Err(OwnedChildError::Attach(error));
        }
        Ok(Self { child, group })
    }
}

impl Drop for OwnedChild {
    fn drop(&mut self) {
        let _ = self.group.kill();
        let _ = self.child.start_kill();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detach_command_does_not_panic() {
        let mut cmd = tokio::process::Command::new("echo");
        detach_command(&mut cmd);
    }

    #[tokio::test]
    async fn process_group_kill_terminates_attached_child() {
        let mut cmd = if cfg!(windows) {
            let mut c = tokio::process::Command::new("cmd");
            c.args(["/C", "ping", "-n", "60", "127.0.0.1"]);
            c
        } else {
            let mut c = tokio::process::Command::new("sleep");
            c.arg("60");
            c
        };
        detach_command(&mut cmd);

        let mut group = ProcessGroup::new().expect("create ProcessGroup");
        #[allow(clippy::disallowed_methods)] // test: exercises ProcessGroup directly
        let mut child = cmd.spawn().expect("spawn child");
        group.attach(&child).expect("attach child to group");

        group.kill().expect("kill ProcessGroup");

        let status = tokio::time::timeout(std::time::Duration::from_secs(5), child.wait())
            .await
            .expect("child should exit within 5s of group kill")
            .expect("wait returns ok");
        assert!(
            !status.success(),
            "killed child should not exit successfully"
        );
    }

    #[cfg(unix)]
    #[tokio::test]
    async fn process_group_kill_reaps_grandchild_tree() {
        use tokio::io::{AsyncBufReadExt, BufReader};

        let mut cmd = tokio::process::Command::new("sh");
        cmd.args(["-c", "sleep 60 & echo $!; wait"]);
        cmd.stdout(std::process::Stdio::piped());
        detach_command(&mut cmd);

        let mut group = ProcessGroup::new().expect("create ProcessGroup");
        #[allow(clippy::disallowed_methods)] // test: exercises ProcessGroup + grandchild kill
        let mut child = cmd.spawn().expect("spawn leader");
        group.attach(&child).expect("attach leader to group");

        let stdout = child.stdout.take().expect("piped stdout");
        let mut line = String::new();
        BufReader::new(stdout)
            .read_line(&mut line)
            .await
            .expect("read grandchild pid");
        let gc_pid: i32 = line.trim().parse().expect("parse grandchild pid");

        let alive =
            |pid: i32| nix::sys::signal::kill(nix::unistd::Pid::from_raw(pid), None).is_ok();
        assert!(
            alive(gc_pid),
            "grandchild should be running before the kill"
        );

        group.kill().expect("kill ProcessGroup");

        tokio::time::timeout(std::time::Duration::from_secs(5), child.wait())
            .await
            .expect("leader should exit within 5s of group kill")
            .expect("wait ok");

        let deadline = std::time::Instant::now() + std::time::Duration::from_secs(5);
        while alive(gc_pid) && std::time::Instant::now() < deadline {
            tokio::time::sleep(std::time::Duration::from_millis(50)).await;
        }
        assert!(
            !alive(gc_pid),
            "killpg must reap the WHOLE group incl. the grandchild; grandchild pid {gc_pid} still alive"
        );
    }

    #[cfg(unix)]
    #[test]
    fn process_group_id_rejects_degenerate_and_own_group() {
        assert!(ProcessGroupId::new(0).is_err());
        assert!(ProcessGroupId::new(1).is_err());
        let own = nix::unistd::getpgrp().as_raw() as u32;
        assert!(ProcessGroupId::new(own).is_err());
        assert!(ProcessGroupId::new(u32::MAX).is_err());
        let foreign = if own == 2 { 3 } else { 2 };
        let id = ProcessGroupId::new(foreign).expect("foreign pgid should be accepted");
        assert_eq!(id.get(), foreign);
    }

    #[tokio::test]
    async fn owned_child_runs_to_completion_and_reports_no_signal() {
        let mut cmd = if cfg!(windows) {
            let mut c = tokio::process::Command::new("cmd");
            c.args(["/C", "exit", "0"]);
            c
        } else {
            tokio::process::Command::new("true")
        };
        detach_command(&mut cmd);
        let mut owned = OwnedChild::spawn(&mut cmd).expect("spawn owned child");
        let status = owned.child.wait().await.expect("wait");
        assert!(status.success());
        assert_eq!(exit_signal(&status), None);
    }
}
