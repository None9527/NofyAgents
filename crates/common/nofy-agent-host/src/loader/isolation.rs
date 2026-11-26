//! This entry runs before Tokio starts, exclusively in a fresh helper process.
//! The resident host never receives irreversible Landlock/seccomp restrictions.
use super::*;
use serde::{Deserialize, Serialize};
pub const PROTOCOL: &str = "linux-single-process-v1";
pub const WORKER_ARG: &str = "__nofy_module_worker_v1";
#[cfg(target_os = "linux")]
const PROFILE_FD_PREFIX: &str = "fd:";
#[cfg(target_os = "linux")]
const MAX_PROFILE_BYTES: usize = 65536;
#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub(super) struct Profile {
    pub scratch: PathBuf,
    pub scratch_files: Vec<PathBuf>,
    pub read_only: Vec<PathBuf>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub local_paths: Vec<super::local::Mount>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub directories: Vec<super::directories::Grant>,
    pub private_root: PathBuf,
    pub parent_pid: u32,
    pub cpu_seconds: u64,
    #[serde(default, skip_serializing_if = "std::collections::BTreeMap::is_empty")]
    pub environment: std::collections::BTreeMap<String, String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub cache_lease: Option<PathBuf>,
}
/// Creates a read-only, sealed in-memory descriptor carrying the serialized
/// isolation profile, guaranteed to use a descriptor number >= 3 with
/// `O_CLOEXEC` set in the parent.
#[cfg(target_os = "linux")]
pub fn seal_profile_fd(wire: &[u8]) -> std::io::Result<std::os::fd::OwnedFd> {
    use std::io::Write;
    use std::os::fd::{AsRawFd, FromRawFd, OwnedFd};
    if wire.len() > MAX_PROFILE_BYTES {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "oversized isolation profile",
        ));
    }
    let name = std::ffi::CString::new("nofy-isolation-profile")
        .map_err(|_| std::io::Error::other("invalid memfd name"))?;
    // SAFETY: `name` is a valid NUL-terminated C string; memfd_create allocates
    // a fresh anonymous in-memory file descriptor owned exclusively by us.
    let raw = unsafe {
        libc::syscall(
            libc::SYS_memfd_create,
            name.as_ptr(),
            libc::MFD_CLOEXEC | libc::MFD_ALLOW_SEALING,
        )
    };
    if raw < 0 {
        return Err(std::io::Error::last_os_error());
    }
    let raw_fd =
        i32::try_from(raw).map_err(|_| std::io::Error::other("memfd descriptor out of range"))?;
    // SAFETY: `raw_fd` is a newly created descriptor >= 0 from `memfd_create`
    // and fits in `i32`; ownership transfers exclusively to `File`.
    let mut memfd = unsafe { std::fs::File::from_raw_fd(raw_fd) };
    memfd.write_all(wire)?;
    // SAFETY: `memfd` is a valid seekable regular descriptor owned by this scope.
    if unsafe { libc::lseek(memfd.as_raw_fd(), 0, libc::SEEK_SET) } < 0 {
        return Err(std::io::Error::last_os_error());
    }
    let seals = libc::F_SEAL_WRITE | libc::F_SEAL_SHRINK | libc::F_SEAL_GROW | libc::F_SEAL_SEAL;
    // SAFETY: `memfd` was created with `MFD_ALLOW_SEALING` and has no mappings.
    if unsafe { libc::fcntl(memfd.as_raw_fd(), libc::F_ADD_SEALS, seals) } != 0 {
        return Err(std::io::Error::last_os_error());
    }
    let proc_path = format!("/proc/self/fd/{}", memfd.as_raw_fd());
    let c_path = std::ffi::CString::new(proc_path)
        .map_err(|_| std::io::Error::other("invalid proc fd path"))?;
    // SAFETY: `c_path` is a valid NUL-terminated path referencing our sealed
    // memfd; opening with O_RDONLY | O_CLOEXEC yields an independent read-only handle.
    let ro_raw = unsafe { libc::open(c_path.as_ptr(), libc::O_RDONLY | libc::O_CLOEXEC) };
    if ro_raw < 0 {
        return Err(std::io::Error::last_os_error());
    }
    // SAFETY: `ro_raw` is a valid newly opened file descriptor >= 0.
    let mut current = unsafe { OwnedFd::from_raw_fd(ro_raw) };
    drop(memfd);
    while matches!(current.as_raw_fd(), 0..=2 | 198 | 199) {
        let min_fd = if current.as_raw_fd() < 3 { 3 } else { 200 };
        // SAFETY: `current` is a valid open descriptor; duplicating avoids
        // stdio (0, 1, 2) and reserved session handoff slots (198, 199)
        // while keeping CLOEXEC set in the parent.
        let high = unsafe { libc::fcntl(current.as_raw_fd(), libc::F_DUPFD_CLOEXEC, min_fd) };
        if high < 0 {
            return Err(std::io::Error::last_os_error());
        }
        // SAFETY: `high` is a newly duplicated valid file descriptor >= `min_fd`.
        current = unsafe { OwnedFd::from_raw_fd(high) };
    }
    Ok(current)
}
/// Attaches a serialized isolation profile to `command` via an inherited
/// read-only descriptor instead of exposing it on `argv`, returning the
/// `fd:<N>` argument token for `argv[2]`.
#[cfg(target_os = "linux")]
pub fn attach_profile_fd(
    command: &mut std::process::Command,
    wire: &[u8],
) -> std::io::Result<std::ffi::OsString> {
    use std::os::fd::AsRawFd;
    use std::os::unix::process::CommandExt;
    let fd = seal_profile_fd(wire)?;
    let raw = fd.as_raw_fd();
    // SAFETY: Runs between fork and exec in the child process; invokes only
    // async-signal-safe `fcntl` and `lseek` on the inherited descriptor.
    // `fd` stays owned by the closure until `command` is dropped in the parent.
    unsafe {
        command.pre_exec(move || {
            if libc::fcntl(fd.as_raw_fd(), libc::F_SETFD, 0) < 0 {
                return Err(std::io::Error::last_os_error());
            }
            if libc::lseek(fd.as_raw_fd(), 0, libc::SEEK_SET) < 0 {
                return Err(std::io::Error::last_os_error());
            }
            Ok(())
        });
    }
    Ok(std::ffi::OsString::from(format!(
        "{PROFILE_FD_PREFIX}{raw}"
    )))
}
#[cfg(target_os = "linux")]
pub(in crate::loader) fn read_profile_fd<T: serde::de::DeserializeOwned>(
    arg: &std::ffi::OsStr,
) -> std::result::Result<T, Box<dyn std::error::Error>> {
    use std::io::Read;
    use std::os::fd::FromRawFd;
    use std::os::unix::fs::FileTypeExt;
    let spec = arg.to_str().ok_or("invalid profile encoding")?;
    let raw = spec
        .strip_prefix(PROFILE_FD_PREFIX)
        .ok_or("isolation profile must be passed via read-only descriptor")?;
    let fd: i32 = raw
        .parse()
        .map_err(|_| "invalid profile descriptor number")?;
    if fd < 3 {
        return Err("invalid profile descriptor number".into());
    }
    // SAFETY: Querying file status flags on a validated descriptor number >= 3
    // before taking ownership verifies it is open and read-only.
    let flags = unsafe { libc::fcntl(fd, libc::F_GETFL) };
    if flags < 0 {
        return Err(std::io::Error::last_os_error().into());
    }
    if (flags & libc::O_ACCMODE) != libc::O_RDONLY {
        // SAFETY: `fd` was just verified open above; close before rejecting.
        unsafe {
            libc::close(fd);
        }
        return Err("isolation profile descriptor must be read-only".into());
    }
    // SAFETY: `fd` is an open inherited read-only descriptor >= 3; wrapping in
    // `File` transfers exclusive ownership so it closes on drop before `apply()`.
    let file = unsafe { std::fs::File::from_raw_fd(fd) };
    let file_type = file.metadata()?.file_type();
    if !file_type.is_file() && !file_type.is_fifo() {
        return Err("invalid isolation profile descriptor type".into());
    }
    let mut bytes = Vec::new();
    file.take(MAX_PROFILE_BYTES as u64 + 1)
        .read_to_end(&mut bytes)?;
    if bytes.len() > MAX_PROFILE_BYTES {
        bytes.fill(0);
        return Err("oversized isolation profile".into());
    }
    let parsed = serde_json::from_slice::<T>(&bytes);
    bytes.fill(0);
    Ok(parsed?)
}
#[cfg(target_os = "linux")]
fn read_profile_arg(
    arg: &std::ffi::OsStr,
) -> std::result::Result<Profile, Box<dyn std::error::Error>> {
    read_profile_fd(arg)
}
#[cfg(not(target_os = "linux"))]
fn read_profile_arg(
    _arg: &std::ffi::OsStr,
) -> std::result::Result<Profile, Box<dyn std::error::Error>> {
    Err("Linux confinement required".into())
}
/// Returns None for an ordinary host launch. Helper failures never fall back
/// to executing business code outside confinement.
pub fn worker_entry() -> Option<i32> {
    let mut args = std::env::args_os();
    args.next();
    if args.next().as_deref() != Some(std::ffi::OsStr::new(WORKER_ARG)) {
        return None;
    }
    let mut failure_code = nofy_isolation::RUNNER_FAILURE_EXIT_CODE;
    let result = (|| -> std::result::Result<(), Box<dyn std::error::Error>> {
        let profile_arg = args.next().ok_or("missing isolation profile")?;
        let profile = read_profile_arg(&profile_arg)?;
        let program = args.next().ok_or("missing program")?;
        let arguments = args.collect::<Vec<_>>();
        if program == "--evaluate-model" {
            failure_code = super::models::STARTUP_EXIT_CODE;
        }
        let stack_bytes = if program == "--evaluate-scope" {
            Some(2 * 1024 * 1024)
        } else if program == "--evaluate-model" || program == "--evaluate-code" {
            Some(16 * 1024 * 1024)
        } else {
            None
        };
        let pin_scratch_cwd = matches!(
            program.to_str(),
            Some(
                "--probe"
                    | "--render-prompt"
                    | "--evaluate-scope"
                    | "--evaluate-model"
                    | "--evaluate-code"
            )
        );
        let _lease = apply(&profile, stack_bytes, pin_scratch_cwd)?;
        if program == "--probe" {
            println!(
                "{{\"protocol\":\"nofy.isolation/v1\",\"filesystem\":\"landlock-abi3\",\"network\":\"denied\",\"processes\":\"denied\",\"enforced\":true}}"
            );
            return Ok(());
        }
        if program == "--render-prompt" {
            return super::prompts::worker_render();
        }
        if program == "--evaluate-scope" {
            return super::scopes::worker_evaluate();
        }
        if program == "--evaluate-model" {
            failure_code = nofy_isolation::RUNNER_FAILURE_EXIT_CODE;
            return nofy_agent_models::worker::run();
        }
        if program == "--evaluate-code" {
            return super::code::worker_evaluate();
        }
        #[cfg(target_os = "linux")]
        {
            use std::os::unix::process::CommandExt;
            let error = std::process::Command::new(&program)
                .args(arguments)
                .env_clear()
                .envs(profile.environment)
                .exec();
            // `exec` only returns on failure. Name the program, and for the usual
            // sandbox cause say what the kernel will not: Landlock reports EACCES
            // without saying which path lacked execute permission.
            let hint = if error.kind() == std::io::ErrorKind::PermissionDenied {
                "; the program, its ELF interpreter and its shared libraries must each be under a path declared with execute=true"
            } else {
                ""
            };
            Err(format!(
                "cannot execute {}: {error}{hint}",
                program.to_string_lossy()
            )
            .into())
        }
        #[cfg(not(target_os = "linux"))]
        {
            let _ = (program, arguments);
            Err("process isolation unsupported on this platform".into())
        }
    })();
    if let Err(error) = result {
        // The one signature a caller uses to tell "the confinement could not be
        // applied" from "the command ended on its own".
        eprintln!("{}: {error}", nofy_isolation::RUNNER_FAILURE_MARKER);
        Some(failure_code)
    } else {
        Some(0)
    }
}
/// The Landlock ABI version this kernel offers, or `None` when Landlock is
/// missing or switched off. Confinement needs version 3.
#[cfg(target_os = "linux")]
pub(crate) fn landlock_abi() -> Option<u64> {
    // SAFETY: this version query passes no pointer and creates no ruleset.
    let version = unsafe {
        libc::syscall(
            libc::SYS_landlock_create_ruleset,
            std::ptr::null::<u8>(),
            0usize,
            1u32,
        )
    };
    (version >= 0).then_some(version as u64)
}
#[cfg(not(target_os = "linux"))]
pub(crate) fn landlock_abi() -> Option<u64> {
    None
}
#[cfg(not(target_os = "linux"))]
fn apply(
    _profile: &Profile,
    _stack_bytes: Option<u64>,
    _pin_scratch_cwd: bool,
) -> std::result::Result<Option<std::fs::File>, Box<dyn std::error::Error>> {
    Err("Linux confinement required".into())
}

#[cfg(target_os = "linux")]
fn apply(
    profile: &Profile,
    stack_bytes: Option<u64>,
    pin_scratch_cwd: bool,
) -> std::result::Result<Option<std::fs::File>, Box<dyn std::error::Error>> {
    use landlock::{
        ABI, Access, AccessFs, CompatLevel, Compatible, PathBeneath, PathFd, Ruleset, RulesetAttr,
        RulesetCreatedAttr, RulesetStatus,
    };
    if profile.parent_pid == 0
        || !profile.scratch.is_absolute()
        || profile.scratch == Path::new("/")
        || profile.read_only.len() + profile.local_paths.len() > 40
        || profile.scratch_files.len() > 16
        || profile.directories.len() > 8
        || !(1..=601).contains(&profile.cpu_seconds)
        || profile.environment.len() > 32
        || profile
            .environment
            .iter()
            .map(|(k, v)| k.len() + v.len())
            .sum::<usize>()
            > 32768
    {
        return Err("invalid confinement profile".into());
    }
    let scratch = std::fs::canonicalize(&profile.scratch)?;
    if !scratch.starts_with(&profile.private_root) || scratch == profile.private_root {
        return Err("invalid scratch boundary".into());
    }
    if pin_scratch_cwd {
        std::env::set_current_dir(&scratch)?;
    }
    // SAFETY: This is a single-threaded post-exec helper; `getppid` cannot
    // fail, and `prctl(PR_SET_PDEATHSIG, SIGKILL, 0, 0, 0)` passes all five
    // ABI arguments. Parent identity is checked on both sides to close the
    // parent-exit race.
    unsafe {
        if libc::getppid() as u32 != profile.parent_pid
            || libc::prctl(
                libc::PR_SET_PDEATHSIG,
                libc::SIGKILL as libc::c_ulong,
                0 as libc::c_ulong,
                0 as libc::c_ulong,
                0 as libc::c_ulong,
            ) != 0
            || libc::getppid() as u32 != profile.parent_pid
        {
            return Err("module parent no longer owns helper".into());
        }
    }
    // Open our own description: the parent and helper must not be able to
    // release one another's flock by closing an inherited duplicate.
    let lease = if let Some(path) = &profile.cache_lease {
        if *path != profile.private_root.join("loader/lifecycle/lease.lock") {
            return Err("invalid cache lease boundary".into());
        }
        Some(lifecycle::shared_file(path)?)
    } else {
        None
    };
    let abi = ABI::V3;
    let all = AccessFs::from_all(abi);
    let read = AccessFs::from_read(abi);
    let mut rules = Ruleset::default()
        .set_compatibility(CompatLevel::HardRequirement)
        .handle_access(all)?
        .create()?;
    rules = rules.add_rule(PathBeneath::new(PathFd::new(&scratch)?, read))?;
    for path in &profile.scratch_files {
        let path = std::fs::canonicalize(path)?;
        if !path.starts_with(&scratch) || !path.is_file() {
            return Err("invalid scratch file grant".into());
        }
        rules = rules.add_rule(PathBeneath::new(
            PathFd::new(&path)?,
            AccessFs::ReadFile | AccessFs::WriteFile | AccessFs::Truncate,
        ))?;
    }
    for path in &profile.read_only {
        let path = std::fs::canonicalize(path)?;
        super::runtime_history::check_protected(&profile.private_root, &path)?;
        if !path.is_absolute() || profile.private_root.starts_with(&path) {
            return Err("read grant exposes private kernel state".into());
        }
        let rights = if path.is_file() {
            read & (AccessFs::ReadFile | AccessFs::Execute)
        } else {
            read
        };
        rules = rules.add_rule(PathBeneath::new(PathFd::new(&path)?, rights))?;
    }
    for mount in &profile.local_paths {
        let file = mount.open(&profile.private_root)?;
        let read = AccessFs::ReadFile | AccessFs::ReadDir;
        let rights = if file.metadata()?.is_dir() {
            read
        } else {
            read & AccessFs::ReadFile
        };
        let rights = if mount.execute {
            rights | AccessFs::Execute
        } else {
            rights
        };
        rules = rules.add_rule(PathBeneath::new(file, rights))?;
    }
    for directory in &profile.directories {
        let descriptor = directory.open(&profile.private_root)?;
        let read = AccessFs::ReadFile | AccessFs::ReadDir;
        let rights = match directory.access {
            super::directories::Access::ReadWriteExecute => {
                return Err("executable directories require tree confinement".into());
            }
            super::directories::Access::ReadOnly => read,
            super::directories::Access::ReadWrite => {
                read | AccessFs::WriteFile
                    | AccessFs::Truncate
                    | AccessFs::MakeReg
                    | AccessFs::MakeDir
                    | AccessFs::RemoveFile
                    | AccessFs::RemoveDir
                    | AccessFs::Refer
            }
        };
        rules = rules.add_rule(PathBeneath::new(descriptor, rights))?;
    }
    let status = rules.restrict_self()?;
    if status.ruleset != RulesetStatus::FullyEnforced {
        return Err("filesystem isolation not fully enforced".into());
    }
    drop_capabilities()?;
    let mut limits = vec![
        (libc::RLIMIT_CORE, 0),
        (libc::RLIMIT_MSGQUEUE, 0),
        (libc::RLIMIT_AS, 512 * 1024 * 1024),
        (libc::RLIMIT_FSIZE, 8 * 1024 * 1024),
        (libc::RLIMIT_NOFILE, 64),
        (libc::RLIMIT_CPU, profile.cpu_seconds),
    ];
    if let Some(bytes) = stack_bytes {
        limits.push((libc::RLIMIT_STACK, bytes));
    }
    for (resource, value) in limits {
        let limit = libc::rlimit {
            rlim_cur: value as libc::rlim_t,
            rlim_max: value as libc::rlim_t,
        };
        // SAFETY: a valid rlimit is applied only to the disposable helper.
        if unsafe { libc::setrlimit(resource, &limit) } != 0 {
            return Err(std::io::Error::last_os_error().into());
        }
    }
    use std::os::fd::AsRawFd;
    let descriptor = lease.as_ref().map(AsRawFd::as_raw_fd);
    if let Some(fd) = descriptor {
        if !(3..64).contains(&fd) {
            return Err("invalid cache lease descriptor".into());
        }
        // SAFETY: single-threaded disposable helper, exact live descriptor.
        // It is protected by seccomp below before untrusted code can run.
        unsafe {
            let flags = libc::fcntl(fd, libc::F_GETFD);
            if flags < 0 || libc::fcntl(fd, libc::F_SETFD, flags & !libc::FD_CLOEXEC) < 0 {
                return Err(std::io::Error::last_os_error().into());
            }
        }
    }
    seccomp(descriptor)?;
    Ok(lease)
}

#[cfg(target_os = "linux")]
pub(super) fn drop_capabilities() -> std::io::Result<()> {
    #[repr(C)]
    struct Header {
        version: u32,
        pid: i32,
    }
    #[repr(C)]
    #[derive(Clone, Copy, Default)]
    struct Data {
        effective: u32,
        permitted: u32,
        inheritable: u32,
    }
    let header = Header {
        version: 0x20080522,
        pid: 0,
    };
    let data = [Data::default(); 2];
    // SECBIT_NOROOT/NO_SETUID_FIXUP/NO_CAP_AMBIENT_RAISE, each locked.
    const SECUREBITS: libc::c_ulong =
        (1 << 0) | (1 << 1) | (1 << 2) | (1 << 3) | (1 << 6) | (1 << 7);
    // SAFETY: Linux capability v3 structures match linux/capability.h. The
    // helper is disposable; no ambient or root-exec capability may survive.
    unsafe {
        if libc::geteuid() == 0 && libc::prctl(libc::PR_SET_SECUREBITS, SECUREBITS, 0, 0, 0) != 0 {
            return Err(std::io::Error::last_os_error());
        }
        if libc::prctl(
            libc::PR_CAP_AMBIENT,
            libc::PR_CAP_AMBIENT_CLEAR_ALL,
            0,
            0,
            0,
        ) != 0
            || libc::syscall(libc::SYS_capset, &header as *const Header, data.as_ptr()) != 0
        {
            return Err(std::io::Error::last_os_error());
        }
    }
    Ok(())
}

#[cfg(target_os = "linux")]
fn seccomp(lease_fd: Option<i32>) -> std::io::Result<()> {
    use libc::{sock_filter, sock_fprog};
    #[cfg(target_arch = "x86_64")]
    const ARCH: u32 = 0xc000003e;
    #[cfg(target_arch = "aarch64")]
    const ARCH: u32 = 0xc00000b7;
    #[cfg(not(any(target_arch = "x86_64", target_arch = "aarch64")))]
    const ARCH: u32 = 0;
    if ARCH == 0 {
        return Err(std::io::Error::other("unsupported seccomp architecture"));
    }
    fn stmt(code: u32, k: u32) -> sock_filter {
        sock_filter {
            code: code as u16,
            jt: 0,
            jf: 0,
            k,
        }
    }
    fn jump(k: u32, jt: u8, jf: u8) -> sock_filter {
        sock_filter {
            code: (libc::BPF_JMP | libc::BPF_JEQ | libc::BPF_K) as u16,
            jt,
            jf,
            k,
        }
    }
    const DENY: u32 = 0x00050000 | libc::EPERM as u32;
    let mut filter = vec![
        stmt(libc::BPF_LD | libc::BPF_W | libc::BPF_ABS, 4),
        jump(ARCH, 1, 0),
        stmt(libc::BPF_RET | libc::BPF_K, DENY),
        stmt(libc::BPF_LD | libc::BPF_W | libc::BPF_ABS, 0),
    ];
    #[cfg(target_arch = "x86_64")]
    {
        filter.push(sock_filter {
            code: (libc::BPF_JMP | libc::BPF_JSET | libc::BPF_K) as u16,
            jt: 0,
            jf: 1,
            k: 0x40000000,
        });
        filter.push(stmt(libc::BPF_RET | libc::BPF_K, DENY));
    }
    if let Some(fd) = lease_fd {
        // x86_64 adds dup2 below; aarch64 has no dup2, so nothing is added there.
        #[cfg_attr(not(target_arch = "x86_64"), allow(unused_mut))]
        let mut protected = vec![
            (libc::SYS_close, 0),
            (libc::SYS_dup, 0),
            (libc::SYS_fcntl, 0),
            (libc::SYS_flock, 0),
            (libc::SYS_ioctl, 0),
            (libc::SYS_dup3, 0),
            (libc::SYS_dup3, 1),
        ];
        #[cfg(target_arch = "x86_64")]
        protected.extend([(libc::SYS_dup2, 0), (libc::SYS_dup2, 1)]);
        for (syscall, argument) in protected {
            filter.extend([
                jump(syscall as u32, 0, 4),
                stmt(
                    libc::BPF_LD | libc::BPF_W | libc::BPF_ABS,
                    16 + 8 * argument,
                ),
                jump(fd as u32, 0, 1),
                stmt(libc::BPF_RET | libc::BPF_K, DENY),
                stmt(libc::BPF_LD | libc::BPF_W | libc::BPF_ABS, 0),
            ]);
        }
        // close_range can close or set CLOEXEC on the protected descriptor.
        filter.extend([jump(436, 0, 1), stmt(libc::BPF_RET | libc::BPF_K, DENY)]);
    }
    // CPython sets close-on-exec with FIOCLEX when opening source files.
    // Permit only that FD-local operation; filesystem allocation/clone and
    // device ioctls remain forbidden (including alternate high request bits).
    filter.extend([
        jump(libc::SYS_ioctl as u32, 0, 7),
        stmt(libc::BPF_LD | libc::BPF_W | libc::BPF_ABS, 28),
        jump(0, 1, 0),
        stmt(libc::BPF_RET | libc::BPF_K, DENY),
        stmt(libc::BPF_LD | libc::BPF_W | libc::BPF_ABS, 24),
        jump(libc::FIOCLEX as u32, 1, 0),
        stmt(libc::BPF_RET | libc::BPF_K, DENY),
        stmt(libc::BPF_RET | libc::BPF_K, 0x7fff0000),
    ]);
    // x86_64 adds its legacy syscalls below; aarch64 has none, so nothing is added there.
    #[cfg_attr(not(target_arch = "x86_64"), allow(unused_mut))]
    let mut denied = vec![
        libc::SYS_socket,
        libc::SYS_socketpair,
        libc::SYS_clone,
        435,
        libc::SYS_unshare,
        libc::SYS_setns,
        libc::SYS_setsid,
        libc::SYS_setpgid,
        libc::SYS_kill,
        libc::SYS_tkill,
        libc::SYS_tgkill,
        libc::SYS_rt_sigqueueinfo,
        libc::SYS_rt_tgsigqueueinfo,
        424, // pidfd_send_signal
        libc::SYS_setpriority,
        libc::SYS_userfaultfd,
        libc::SYS_ptrace,
        libc::SYS_process_vm_readv,
        libc::SYS_process_vm_writev,
        434,
        438,
        425,
        libc::SYS_mount,
        libc::SYS_umount2,
        libc::SYS_chroot,
        libc::SYS_pivot_root,
        libc::SYS_open_by_handle_at,
        libc::SYS_fchmod,
        libc::SYS_fchmodat,
        libc::SYS_fchown,
        libc::SYS_fchownat,
        libc::SYS_utimensat,
        libc::SYS_prctl,
        libc::SYS_seccomp,
        libc::SYS_setrlimit,
        libc::SYS_prlimit64,
        libc::SYS_mknodat,
        libc::SYS_capset,
        libc::SYS_bpf,
        libc::SYS_perf_event_open,
        libc::SYS_shmget,
        libc::SYS_shmat,
        libc::SYS_shmdt,
        libc::SYS_shmctl,
        libc::SYS_msgget,
        libc::SYS_msgsnd,
        libc::SYS_msgrcv,
        libc::SYS_msgctl,
        libc::SYS_semget,
        libc::SYS_semctl,
        libc::SYS_semop,
        libc::SYS_semtimedop,
        libc::SYS_mq_open,
        libc::SYS_mq_unlink,
        libc::SYS_mq_timedsend,
        libc::SYS_mq_timedreceive,
        libc::SYS_mq_notify,
        libc::SYS_mq_getsetattr,
        libc::SYS_add_key,
        libc::SYS_request_key,
        libc::SYS_keyctl,
        libc::SYS_fallocate,
        // Landlock ABI3 does not mediate metadata/ACL mutation. Deny every
        // pathname, link and descriptor spelling rather than only the lease FD.
        libc::SYS_setxattr,
        libc::SYS_lsetxattr,
        libc::SYS_fsetxattr,
        libc::SYS_removexattr,
        libc::SYS_lremovexattr,
        libc::SYS_fremovexattr,
        452, // fchmodat2, including AT_EMPTY_PATH
        463, // setxattrat
        466, // removexattrat
    ];
    #[cfg(target_arch = "x86_64")]
    denied.extend([
        libc::SYS_fork,
        libc::SYS_vfork,
        libc::SYS_chmod,
        libc::SYS_chown,
        libc::SYS_lchown,
        libc::SYS_mknod,
        libc::SYS_utime,
        libc::SYS_utimes,
        libc::SYS_futimesat,
    ]);
    for syscall in denied {
        filter.push(jump(syscall as u32, 0, 1));
        filter.push(stmt(libc::BPF_RET | libc::BPF_K, DENY));
    }
    filter.push(stmt(libc::BPF_RET | libc::BPF_K, 0x7fff0000));
    let filter_len = u16::try_from(filter.len())
        .map_err(|_| std::io::Error::other("seccomp filter exceeds BPF instruction limit"))?;
    let program = sock_fprog {
        len: filter_len,
        filter: filter.as_mut_ptr(),
    };
    // SAFETY: Single-threaded disposable helper; setting `PR_SET_NO_NEW_PRIVS`
    // passes all five ABI arguments and enables unprivileged seccomp filter
    // installation below without mutating any pointer arguments.
    if unsafe { libc::prctl(libc::PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0) } != 0 {
        return Err(std::io::Error::last_os_error());
    }
    // SAFETY: `filter` stays live and unmodified for the duration of `prctl`,
    // `program.len` matches its exact instruction count, `PR_SET_NO_NEW_PRIVS`
    // is already active, and all five ABI arguments are supplied.
    if unsafe {
        libc::prctl(
            libc::PR_SET_SECCOMP,
            libc::SECCOMP_MODE_FILTER as libc::c_ulong,
            &program as *const sock_fprog,
            0 as libc::c_ulong,
            0 as libc::c_ulong,
        )
    } != 0
    {
        return Err(std::io::Error::last_os_error());
    }
    Ok(())
}

#[cfg(all(test, target_os = "linux"))]
mod tests {
    use super::*;
    use std::ffi::OsStr;
    use std::os::fd::{AsRawFd, IntoRawFd};

    fn sample_profile() -> Profile {
        Profile {
            scratch: PathBuf::from("/tmp/nofy-test/scratch"),
            scratch_files: vec![],
            read_only: vec![],
            local_paths: vec![],
            directories: vec![],
            private_root: PathBuf::from("/tmp/nofy-test"),
            parent_pid: std::process::id(),
            cpu_seconds: 5,
            environment: [("SECRET_KEY".into(), "secret-value".into())].into(),
            cache_lease: None,
        }
    }

    #[test]
    fn seal_profile_fd_returns_readonly_sealed_cloexec_descriptor() {
        let wire = serde_json::to_vec(&sample_profile()).unwrap();
        let fd = seal_profile_fd(&wire).unwrap();
        let raw = fd.as_raw_fd();
        assert!(raw >= 3);
        let fd_flags = unsafe { libc::fcntl(raw, libc::F_GETFD) };
        assert!(fd_flags >= 0 && (fd_flags & libc::FD_CLOEXEC) != 0);
        let status_flags = unsafe { libc::fcntl(raw, libc::F_GETFL) };
        assert_eq!(status_flags & libc::O_ACCMODE, libc::O_RDONLY);
        // Writing to the read-only sealed descriptor must fail.
        let written = unsafe { libc::write(raw, b"x".as_ptr().cast(), 1) };
        assert_eq!(written, -1);
        let seals = unsafe { libc::fcntl(raw, libc::F_GET_SEALS) };
        assert!(seals >= 0);
        assert_ne!(seals & libc::F_SEAL_WRITE, 0);
        assert_ne!(seals & libc::F_SEAL_SEAL, 0);
        // Oversized profiles are rejected before creating a descriptor.
        let oversized = vec![b'a'; MAX_PROFILE_BYTES + 1];
        assert!(seal_profile_fd(&oversized).is_err());
    }

    fn fd_identity(raw: i32) -> (u64, u64) {
        let mut st = std::mem::MaybeUninit::<libc::stat>::zeroed();
        assert_eq!(unsafe { libc::fstat(raw, st.as_mut_ptr()) }, 0);
        let st = unsafe { st.assume_init() };
        (st.st_dev, st.st_ino)
    }

    fn assert_fd_closed(raw: i32, orig: (u64, u64)) {
        let mut st = std::mem::MaybeUninit::<libc::stat>::zeroed();
        let rc = unsafe { libc::fstat(raw, st.as_mut_ptr()) };
        if rc == 0 {
            let st = unsafe { st.assume_init() };
            assert_ne!(
                (st.st_dev, st.st_ino),
                orig,
                "original profile descriptor {raw} remained open"
            );
        }
    }

    #[test]
    fn read_profile_arg_rejects_inline_json_and_unsafe_descriptors_and_closes_on_read() {
        let profile = sample_profile();
        let wire = serde_json::to_string(&profile).unwrap();
        // Raw JSON in argv[2] is strictly refused.
        assert!(read_profile_arg(OsStr::new(&wire)).is_err());
        // Stdio and invalid descriptor tokens are refused.
        for bad in ["", "fd:", "fd:-1", "fd:0", "fd:1", "fd:2", "fd:abc"] {
            assert!(read_profile_arg(OsStr::new(bad)).is_err(), "{bad}");
        }
        // A writable descriptor must be rejected and closed.
        let tmp = tempfile::tempfile().unwrap();
        let rw_fd = tmp.into_raw_fd();
        let rw_id = fd_identity(rw_fd);
        assert!(read_profile_arg(OsStr::new(&format!("fd:{rw_fd}"))).is_err());
        assert_fd_closed(rw_fd, rw_id);

        // Valid sealed read-only memfd is read and immediately closed.
        let ro = seal_profile_fd(wire.as_bytes()).unwrap();
        let raw = ro.into_raw_fd();
        let ro_id = fd_identity(raw);
        let parsed = read_profile_arg(OsStr::new(&format!("fd:{raw}"))).unwrap();
        assert_eq!(parsed.parent_pid, profile.parent_pid);
        assert_eq!(parsed.environment, profile.environment);
        assert_fd_closed(raw, ro_id);

        // A read-only pipe end is also accepted and immediately closed.
        let mut fds = [-1; 2];
        assert_eq!(unsafe { libc::pipe2(fds.as_mut_ptr(), libc::O_CLOEXEC) }, 0);
        let n = unsafe { libc::write(fds[1], wire.as_ptr().cast(), wire.len()) };
        assert_eq!(n as usize, wire.len());
        unsafe { libc::close(fds[1]) };
        let pipe_id = fd_identity(fds[0]);
        let parsed_pipe = read_profile_arg(OsStr::new(&format!("fd:{}", fds[0]))).unwrap();
        assert_eq!(parsed_pipe.environment, profile.environment);
        assert_fd_closed(fds[0], pipe_id);
    }
}
