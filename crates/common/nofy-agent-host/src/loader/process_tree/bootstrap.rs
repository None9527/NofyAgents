//! Trusted, single-threaded namespace init. This is not a business sandbox.
use super::*;
use std::{collections::BTreeMap, ffi::OsStr};

pub(super) const ARG: &str = "__nofy_process_tree_v1";
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
        let wire = args.next().ok_or("missing process-tree bootstrap")?;
        if wire.len() > WIRE_BYTES || args.next().is_some() {
            return Err("invalid process-tree bootstrap length".into());
        }
        let profile: Bootstrap = serde_json::from_str(wire.to_str().ok_or("non-UTF8 bootstrap")?)?;
        profile.validate()?;
        enter(profile)
    })();
    Some(match result {
        Ok(code) => code,
        Err(error) => {
            eprintln!("required process-tree bootstrap failed: {error}");
            125
        }
    })
}

fn parent_death(parent: u32) -> std::io::Result<()> {
    // The helper is a fresh single-threaded exec. Do not move this into the
    // resident process or rely on getppid alone before installing PDEATHSIG.
    unsafe {
        if libc::getppid() as u32 != parent
            || libc::prctl(libc::PR_SET_PDEATHSIG, libc::SIGKILL) != 0
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
        125
    }
}
fn wait(pid: libc::pid_t) -> std::io::Result<i32> {
    loop {
        let mut status = 0;
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
    let _lease = profile
        .sandbox
        .as_ref()
        .map(super::sandbox::Sandbox::lease)
        .transpose()?;
    // SIGCHLD may have been ignored by an embedding launcher. We own only
    // this disposable helper and must have waitable children of our own.
    unsafe {
        libc::signal(libc::SIGCHLD, libc::SIG_DFL);
    }
    let (uid, gid) = unsafe { (libc::getuid(), libc::getgid()) };
    // Each helper has its own user/PID namespaces. No shared mount, cgroup,
    // network namespace or resident-process credentials are reconfigured.
    if unsafe { libc::prctl(libc::PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0) } != 0
        || unsafe { libc::unshare(libc::CLONE_NEWUSER) } != 0
    {
        return Err(std::io::Error::last_os_error().into());
    }
    std::fs::write("/proc/self/setgroups", "deny")?;
    std::fs::write("/proc/self/uid_map", format!("0 {uid} 1"))?;
    std::fs::write("/proc/self/gid_map", format!("0 {gid} 1"))?;
    parent_death(profile.parent_pid)?;
    if profile.sandbox.is_some()
        && unsafe { libc::unshare(libc::CLONE_NEWNS | libc::CLONE_NEWNET | libc::CLONE_NEWIPC) }
            != 0
    {
        return Err(std::io::Error::last_os_error().into());
    }
    if unsafe { libc::prctl(libc::PR_SET_DUMPABLE, 0, 0, 0, 0) } != 0
        || unsafe { libc::unshare(libc::CLONE_NEWPID) } != 0
    {
        return Err(std::io::Error::last_os_error().into());
    }
    let mut life = [-1; 2];
    if unsafe { libc::pipe2(life.as_mut_ptr(), libc::O_CLOEXEC) } != 0 {
        return Err(std::io::Error::last_os_error().into());
    }
    // No runtime or threads exist here. The only post-fork Rust execution is
    // in this disposable, single-threaded helper, never in the resident host.
    let init = unsafe { libc::fork() };
    if init < 0 {
        unsafe {
            libc::close(life[0]);
            libc::close(life[1]);
        }
        return Err(std::io::Error::last_os_error().into());
    }
    if init == 0 {
        unsafe {
            libc::close(life[1]);
        }
        let result = init_main(&profile, life[0]);
        let code = match result {
            Ok(code) => code,
            Err(error) => {
                eprintln!("process-tree init failed: {error}");
                125
            }
        };
        unsafe {
            libc::_exit(code);
        }
    }
    unsafe {
        libc::close(life[0]);
    }
    let result = wait(init);
    unsafe {
        libc::close(life[1]);
    }
    result.map_err(Into::into)
}
fn init_main(profile: &Bootstrap, lifeline: i32) -> std::io::Result<i32> {
    if unsafe { libc::getpid() } != 1
        || unsafe { libc::prctl(libc::PR_SET_PDEATHSIG, libc::SIGKILL) } != 0
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
    let child = unsafe { libc::fork() };
    if child < 0 {
        return Err(std::io::Error::last_os_error());
    }
    if child == 0 {
        use std::os::unix::process::CommandExt;
        unsafe {
            libc::close(lifeline);
        }
        if let Some(sandbox) = &profile.sandbox {
            if let Err(error) = sandbox.apply() {
                eprintln!("required tree confinement failed: {error}");
                unsafe {
                    libc::_exit(125);
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
        unsafe {
            libc::_exit(127);
        }
    }
    // This PID 1 is trusted and non-dumpable; no business code ever runs in it.
    let result = loop {
        let mut status = 0;
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
    if unsafe { libc::kill(-1, libc::SIGKILL) } != 0 {
        let error = std::io::Error::last_os_error();
        if error.raw_os_error() != Some(libc::ESRCH) {
            return Err(error);
        }
    }
    loop {
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
