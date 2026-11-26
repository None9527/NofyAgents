//! Trusted, single-threaded namespace init. This is not a business sandbox.
use super::*;
use std::{collections::BTreeMap, ffi::OsStr};

pub(in crate::loader) const ARG: &str = "__nofy_process_tree_v1";
const WIRE_BYTES: usize = 65536;
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub(in crate::loader) struct Bootstrap {
    pub parent_pid: u32,
    pub program: PathBuf,
    pub arguments: Vec<String>,
    pub environment: BTreeMap<String, String>,
    pub cwd: PathBuf,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sandbox: Option<super::sandbox::Sandbox>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub session: Option<super::super::process_sessions::Setup>,
}
impl Bootstrap {
    pub(in crate::loader) fn encode(&self) -> Result<String> {
        self.validate()?;
        let wire = serde_json::to_string(self).map_err(storage::unavailable)?;
        if wire.len() > WIRE_BYTES {
            return Err(HostError::Invalid(
                "process-tree bootstrap exceeds 64KiB".into(),
            ));
        }
        Ok(wire)
    }
    pub(super) fn validate(&self) -> Result<()> {
        if let Some(sandbox) = &self.sandbox {
            sandbox.validate()?;
        }
        if let Some(session) = &self.session {
            session.validate()?;
        }
        let path = |p: &Path| {
            p.is_absolute()
                && p.to_str()
                    .is_some_and(|s| s.len() <= 4096 && !s.chars().any(char::is_control))
                && p.components().all(|c| {
                    matches!(
                        c,
                        std::path::Component::RootDir | std::path::Component::Normal(_)
                    )
                })
        };
        if self.parent_pid == 0
            || !path(&self.program)
            || !path(&self.cwd)
            || self.arguments.len() > 128
            || self
                .arguments
                .iter()
                .any(|s| s.len() > 4096 || s.contains('\0'))
            || self.arguments.iter().map(String::len).sum::<usize>() > 65536
            || self.environment.len() > 32
            || self
                .environment
                .iter()
                .any(|(k, v)| k.is_empty() || k.contains(['=', '\0']) || v.contains('\0'))
            || self
                .environment
                .iter()
                .map(|(k, v)| k.len() + v.len())
                .sum::<usize>()
                > 32768
        {
            return Err(HostError::Invalid("invalid supervised command".into()));
        }
        Ok(())
    }
}

/// Call before starting any threads, alongside the single-process entry.
/// Failure is terminal: never dispatch a command without the namespaces.
pub fn worker_entry() -> Option<i32> {
    let mut args = std::env::args_os();
    args.next();
    if args.next().as_deref() != Some(OsStr::new(ARG)) {
        return None;
    }
    let result = (|| -> std::result::Result<i32, Box<dyn std::error::Error>> {
        let wire_arg = args.next().ok_or("missing process-tree bootstrap")?;
        if args.next().is_some() {
            return Err("invalid process-tree bootstrap arguments".into());
        }
        let profile: Bootstrap = super::super::isolation::read_profile_fd(&wire_arg)?;
        profile.validate()?;
        enter(profile)
    })();
    Some(match result {
        Ok(code) => code,
        Err(error) => {
            eprintln!(
                "{}: process-tree bootstrap failed: {error}",
                nofy_isolation::RUNNER_FAILURE_MARKER
            );
            nofy_isolation::RUNNER_FAILURE_EXIT_CODE
        }
    })
}

fn parent_death(parent: u32) -> std::io::Result<()> {
    // SAFETY: This runs in a fresh single-threaded post-exec helper; `getppid`
    // cannot fail, and `prctl(PR_SET_PDEATHSIG, SIGKILL, 0, 0, 0)` passes all
    // five ABI arguments. Checking `getppid` before and after closes the
    // parent-exit race without touching resident process state.
    unsafe {
        if libc::getppid() as u32 != parent
            || libc::prctl(
                libc::PR_SET_PDEATHSIG,
                libc::SIGKILL as libc::c_ulong,
                0 as libc::c_ulong,
                0 as libc::c_ulong,
                0 as libc::c_ulong,
            ) != 0
            || libc::getppid() as u32 != parent
        {
            return Err(std::io::Error::other(
                "supervisor parent no longer owns helper",
            ));
        }
    }
    Ok(())
}
fn code(status: i32) -> i32 {
    if libc::WIFEXITED(status) {
        libc::WEXITSTATUS(status)
    } else if libc::WIFSIGNALED(status) {
        128 + libc::WTERMSIG(status)
    } else {
        nofy_isolation::RUNNER_FAILURE_EXIT_CODE
    }
}
fn wait(pid: libc::pid_t) -> std::io::Result<i32> {
    loop {
        let mut status = 0;
        // SAFETY: `pid` is a child owned by this helper and `&mut status` is a
        // valid aligned writable `c_int` out-pointer for the duration of `waitpid`.
        let result = unsafe { libc::waitpid(pid, &mut status, 0) };
        if result == pid {
            return Ok(code(status));
        }
        let error = std::io::Error::last_os_error();
        if error.kind() != std::io::ErrorKind::Interrupted {
            return Err(error);
        }
    }
}
fn enter(profile: Bootstrap) -> std::result::Result<i32, Box<dyn std::error::Error>> {
    parent_death(profile.parent_pid)?;
    if let Some(session) = &profile.session {
        session.handoff()?;
    }
    let _lease = profile
        .sandbox
        .as_ref()
        .map(super::sandbox::Sandbox::lease)
        .transpose()?;
    // SAFETY: Single-threaded disposable helper; restoring `SIG_DFL` (not a
    // custom handler pointer) ensures children are waitable via `waitpid` even
    // if an embedding launcher had `SIGCHLD` ignored.
    if unsafe { libc::signal(libc::SIGCHLD, libc::SIG_DFL) } == libc::SIG_ERR {
        return Err(std::io::Error::last_os_error().into());
    }
    // SAFETY: `getuid` and `getgid` take no pointer arguments and are always
    // successful per POSIX.
    let (uid, gid) = unsafe { (libc::getuid(), libc::getgid()) };
    // Each helper has its own user/PID namespaces. No shared mount, cgroup,
    // network namespace or resident-process credentials are reconfigured.
    // SAFETY: Single-threaded disposable helper; passes all five ABI arguments
    // to disable privilege escalation before creating namespaces.
    if unsafe { libc::prctl(libc::PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0) } != 0 {
        return Err(std::io::Error::last_os_error().into());
    }
    // SAFETY: Single-threaded helper (`CLONE_NEWUSER` requires no sibling
    // threads); takes only flag bits and its non-zero failure is checked.
    if unsafe { libc::unshare(libc::CLONE_NEWUSER) } != 0 {
        return Err(std::io::Error::last_os_error().into());
    }
    std::fs::write("/proc/self/setgroups", "deny")?;
    std::fs::write("/proc/self/uid_map", format!("0 {uid} 1"))?;
    std::fs::write("/proc/self/gid_map", format!("0 {gid} 1"))?;
    parent_death(profile.parent_pid)?;
    if profile.sandbox.is_some() {
        // SAFETY: Single-threaded helper inside its private user namespace with
        // uid/gid mapped; unsharing mount, net, and IPC namespaces takes only
        // flag bits and checks non-zero errors.
        if unsafe { libc::unshare(libc::CLONE_NEWNS | libc::CLONE_NEWNET | libc::CLONE_NEWIPC) }
            != 0
        {
            return Err(std::io::Error::last_os_error().into());
        }
    }
    if profile
        .session
        .as_ref()
        .is_some_and(|s| s.network_fd.is_some())
    {
        super::super::process_sessions::network::loopback()?;
    }
    // SAFETY: Single-threaded disposable helper; passes all five ABI arguments
    // to mark the future PID 1 helper non-dumpable against guest ptrace/procfs.
    if unsafe { libc::prctl(libc::PR_SET_DUMPABLE, 0, 0, 0, 0) } != 0 {
        return Err(std::io::Error::last_os_error().into());
    }
    // SAFETY: Single-threaded helper; `CLONE_NEWPID` places the next `fork()`
    // child into a fresh PID namespace as PID 1 without affecting host tasks.
    if unsafe { libc::unshare(libc::CLONE_NEWPID) } != 0 {
        return Err(std::io::Error::last_os_error().into());
    }
    let mut life = [-1; 2];
    // SAFETY: `life` is a valid writable `[c_int; 2]` buffer as required by
    // `pipe2(2)`; `O_CLOEXEC` prevents either pipe end from leaking across exec.
    if unsafe { libc::pipe2(life.as_mut_ptr(), libc::O_CLOEXEC) } != 0 {
        return Err(std::io::Error::last_os_error().into());
    }
    // SAFETY: No Tokio runtime or background threads have been started in this
    // disposable helper (`worker_entry` runs before runtime init), so `fork()`
    // cannot inherit foreign locked mutexes or inconsistent thread state.
    let init = unsafe { libc::fork() };
    if init < 0 {
        let error = std::io::Error::last_os_error();
        // SAFETY: Both pipe descriptors were created by `pipe2` above, have no
        // other owner because `fork` failed, and are closed once here.
        unsafe {
            libc::close(life[0]);
            libc::close(life[1]);
        }
        return Err(error.into());
    }
    if init == 0 {
        // SAFETY: `life[1]` is the write end inherited by this forked child;
        // closing it once ensures only the outer helper retains the write end.
        unsafe {
            libc::close(life[1]);
        }
        let result = init_main(&profile, life[0]);
        let code = match result {
            Ok(code) => code,
            Err(error) => {
                eprintln!(
                    "{}: process-tree init failed: {error}",
                    nofy_isolation::RUNNER_FAILURE_MARKER
                );
                nofy_isolation::RUNNER_FAILURE_EXIT_CODE
            }
        };
        // SAFETY: Immediately terminates the forked PID 1 child without running
        // outer-helper destructors or flushing shared stdio buffers twice.
        unsafe {
            libc::_exit(code);
        }
    }
    // SAFETY: `life[0]` is the unused read end in the outer helper; closed once
    // and never accessed again.
    unsafe {
        libc::close(life[0]);
    }
    let result = wait(init);
    // SAFETY: `life[1]` is uniquely owned by the outer helper and closed once
    // after `init` has been reaped.
    unsafe {
        libc::close(life[1]);
    }
    result.map_err(Into::into)
}
fn init_main(profile: &Bootstrap, lifeline: i32) -> std::io::Result<i32> {
    // SAFETY: `getpid` takes no pointers and cannot fail; verifies this process
    // really entered the private PID namespace as PID 1.
    if unsafe { libc::getpid() } != 1 {
        return Err(std::io::Error::other("PID namespace init is not owned"));
    }
    // SAFETY: Single-threaded PID 1 helper; passes all five ABI arguments so
    // outer-helper death terminates this PID 1 (and all namespace descendants).
    if unsafe {
        libc::prctl(
            libc::PR_SET_PDEATHSIG,
            libc::SIGKILL as libc::c_ulong,
            0 as libc::c_ulong,
            0 as libc::c_ulong,
            0 as libc::c_ulong,
        )
    } != 0
    {
        return Err(std::io::Error::other("PID namespace init is not owned"));
    }
    // getppid is zero when the parent is outside this PID namespace. The
    // write end exists only in that parent, closing the pre-prctl death race.
    let mut event = libc::pollfd {
        fd: lifeline,
        events: libc::POLLIN,
        revents: 0,
    };
    loop {
        // SAFETY: `&mut event` is a valid initialized 1-element `pollfd` array
        // for the live `lifeline` read FD; non-blocking poll (`timeout = 0`)
        // detects whether the parent closed the write end before `PR_SET_PDEATHSIG`.
        let result = unsafe { libc::poll(&mut event, 1, 0) };
        if result >= 0 {
            if result != 0 {
                return Err(std::io::Error::other("outer helper already exited"));
            }
            break;
        }
        let error = std::io::Error::last_os_error();
        if error.kind() != std::io::ErrorKind::Interrupted {
            return Err(error);
        }
    }
    if let Some(config) = profile
        .session
        .as_ref()
        .and_then(|s| s.limits.network_proxy.as_ref())
    {
        super::super::process_sessions::network::spawn_proxy(config, lifeline)?;
    }
    // SAFETY: PID 1 remains strictly single-threaded (`spawn_proxy` forked a
    // separate process, not a thread), so `fork()` cannot inherit locked mutexes.
    let child = unsafe { libc::fork() };
    if child < 0 {
        return Err(std::io::Error::last_os_error());
    }
    if child == 0 {
        use std::os::unix::process::CommandExt;
        // SAFETY: `lifeline` is the open pipe read end inherited from PID 1;
        // closing it once prevents the workload from holding or probing it.
        unsafe {
            libc::close(lifeline);
        }
        if let Some(session) = &profile.session
            && let Err(error) = session.apply()
        {
            eprintln!(
                "{}: process session setup failed: {error}",
                nofy_isolation::RUNNER_FAILURE_MARKER
            );
            // SAFETY: Aborts the forked child immediately on session setup
            // failure without unwinding into PID 1's reap/kill path.
            unsafe {
                libc::_exit(nofy_isolation::RUNNER_FAILURE_EXIT_CODE);
            }
        }
        if let Some(sandbox) = &profile.sandbox {
            let terminal = profile.session.as_ref().is_some_and(|s| s.terminal);
            let network = profile
                .session
                .as_ref()
                .is_some_and(|s| s.network_fd.is_some());
            let confinement = if profile.session.is_some() {
                sandbox.apply_session(terminal, network)
            } else {
                sandbox.apply()
            };
            if let Err(error) = confinement {
                eprintln!(
                    "{}: required tree confinement failed: {error}",
                    nofy_isolation::RUNNER_FAILURE_MARKER
                );
                // SAFETY: Aborts the forked child immediately on confinement
                // failure so unconfined business code can never execute.
                unsafe {
                    libc::_exit(nofy_isolation::RUNNER_FAILURE_EXIT_CODE);
                }
            }
        }
        let error = std::process::Command::new(&profile.program)
            .args(&profile.arguments)
            .env_clear()
            .envs(&profile.environment)
            .current_dir(&profile.cwd)
            .exec();
        eprintln!("supervised command exec failed: {error}");
        // SAFETY: `exec()` only returns on error; `_exit(127)` terminates the
        // child immediately without returning into PID 1's control flow.
        unsafe {
            libc::_exit(127);
        }
    }
    // This PID 1 is trusted and non-dumpable; no business code ever runs in it.
    let result = loop {
        let mut status = 0;
        // SAFETY: `&mut status` is a valid aligned writable `c_int`; PID 1
        // reaps children and reparented orphans in its PID namespace until the
        // primary `child` exits.
        let reaped = unsafe { libc::waitpid(-1, &mut status, 0) };
        if reaped == child {
            break code(status);
        }
        if reaped >= 0 {
            continue;
        }
        let error = std::io::Error::last_os_error();
        if error.kind() != std::io::ErrorKind::Interrupted {
            return Err(error);
        }
    };
    // SAFETY: Entry verified `getpid() == 1` inside a private `CLONE_NEWPID`
    // namespace, so `kill(-1, SIGKILL)` targets only remaining descendants in
    // this disposable namespace (never PID 1 itself or host processes).
    if unsafe { libc::kill(-1, libc::SIGKILL) } != 0 {
        let error = std::io::Error::last_os_error();
        if error.raw_os_error() != Some(libc::ESRCH) {
            return Err(error);
        }
    }
    loop {
        // SAFETY: Passing `NULL` for `wstatus` is explicitly permitted by POSIX
        // `waitpid(2)` when exit statuses are discarded; drains all remaining
        // zombies in the namespace until `ECHILD`.
        let result = unsafe { libc::waitpid(-1, std::ptr::null_mut(), 0) };
        if result >= 0 {
            continue;
        }
        let error = std::io::Error::last_os_error();
        if error.raw_os_error() == Some(libc::ECHILD) {
            break;
        }
        if error.kind() != std::io::ErrorKind::Interrupted {
            return Err(error);
        }
    }
    Ok(result)
}
