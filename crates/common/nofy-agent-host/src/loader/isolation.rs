//! This entry runs before Tokio starts, exclusively in a fresh helper process.
//! The resident host never receives irreversible Landlock/seccomp restrictions.
use super::*;
use serde::{Deserialize, Serialize};
pub const PROTOCOL: &str = "linux-single-process-v1";
pub const WORKER_ARG: &str = "__nofy_module_worker_v1";
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
/// Returns None for an ordinary host launch. Helper failures never fall back
/// to executing business code outside confinement.
pub fn worker_entry() -> Option<i32> {
    let mut args = std::env::args_os();
    args.next();
    if args.next().as_deref() != Some(std::ffi::OsStr::new(WORKER_ARG)) {
        return None;
    }
    let result = (|| -> std::result::Result<(), Box<dyn std::error::Error>> {
        let wire = args.next().ok_or("missing isolation profile")?;
        if wire.len() > 65536 {
            return Err("oversized isolation profile".into());
        }
        let profile: Profile =
            serde_json::from_str(wire.to_str().ok_or("invalid profile encoding")?)?;
        let program = args.next().ok_or("missing program")?;
        let arguments = args.collect::<Vec<_>>();
        let stack_bytes = if program == "--evaluate-scope" {
            Some(2 * 1024 * 1024)
        } else if program == "--evaluate-model" || program == "--evaluate-code" {
            Some(16 * 1024 * 1024)
        } else {
            None
        };
        let _lease = apply(&profile, stack_bytes)?;
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
            return nofy_agent_models::worker::run();
        }
        if program == "--evaluate-code" {
            return super::code::worker_evaluate();
        }
        #[cfg(target_os = "linux")]
        {
            use std::os::unix::process::CommandExt;
            let error = std::process::Command::new(program)
                .args(arguments)
                .env_clear()
                .envs(profile.environment)
                .exec();
            return Err(error.into());
        }
        #[cfg(not(target_os = "linux"))]
        {
            let _ = (program, arguments);
            Err("process isolation unsupported on this platform".into())
        }
    })();
    if let Err(error) = result {
        eprintln!("required module isolation or runtime launch failed: {error}");
        Some(125)
    } else {
        Some(0)
    }
}
#[cfg(not(target_os = "linux"))]
fn apply(
    _profile: &Profile,
    _stack_bytes: Option<u64>,
) -> std::result::Result<Option<std::fs::File>, Box<dyn std::error::Error>> {
    Err("Linux confinement required".into())
}

#[cfg(target_os = "linux")]
fn apply(
    profile: &Profile,
    stack_bytes: Option<u64>,
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
    // SAFETY: this is a single-threaded post-exec helper. Parent identity is
    // checked on both sides of PDEATHSIG to close the parent-death race.
    unsafe {
        if libc::getppid() as u32 != profile.parent_pid
            || libc::prctl(libc::PR_SET_PDEATHSIG, libc::SIGKILL) != 0
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
    ]);
    for syscall in denied {
        filter.push(jump(syscall as u32, 0, 1));
        filter.push(stmt(libc::BPF_RET | libc::BPF_K, DENY));
    }
    filter.push(stmt(libc::BPF_RET | libc::BPF_K, 0x7fff0000));
    let program = sock_fprog {
        len: filter.len() as u16,
        filter: filter.as_mut_ptr(),
    };
    // SAFETY: no threads, pointers are live through prctl, no external memory
    // is referenced by this classic BPF program. Restrictions survive exec.
    if unsafe { libc::prctl(libc::PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0) } != 0
        || unsafe { libc::prctl(libc::PR_SET_SECCOMP, 2, &program as *const sock_fprog) } != 0
    {
        return Err(std::io::Error::last_os_error());
    }
    Ok(())
}
