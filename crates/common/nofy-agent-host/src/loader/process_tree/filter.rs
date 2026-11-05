//! Inherited by all guest descendants, never installed in the resident host.
use std::io;
pub(super) fn apply() -> io::Result<()> {
    apply_network(false, false)
}
pub(super) fn apply_network(network: bool, terminal: bool) -> io::Result<()> {
    use libc::{sock_filter, sock_fprog};
    #[cfg(target_arch = "x86_64")]
    const ARCH: u32 = 0xc000003e;
    #[cfg(target_arch = "aarch64")]
    const ARCH: u32 = 0xc00000b7;
    #[cfg(not(any(target_arch = "x86_64", target_arch = "aarch64")))]
    const ARCH: u32 = 0;
    if ARCH == 0 {
        return Err(io::Error::other("unsupported tree seccomp architecture"));
    }
    fn stmt(code: u32, k: u32) -> sock_filter {
        sock_filter {
            code: code as u16,
            jt: 0,
            jf: 0,
            k,
        }
    }
    fn eq(k: u32, jt: u8, jf: u8) -> sock_filter {
        sock_filter {
            code: (libc::BPF_JMP | libc::BPF_JEQ | libc::BPF_K) as u16,
            jt,
            jf,
            k,
        }
    }
    const DENY: u32 = 0x00050000 | libc::EPERM as u32;
    const ALLOW: u32 = 0x7fff0000;
    let mut filter = vec![
        stmt(libc::BPF_LD | libc::BPF_W | libc::BPF_ABS, 4),
        eq(ARCH, 1, 0),
        stmt(libc::BPF_RET | libc::BPF_K, DENY),
        stmt(libc::BPF_LD | libc::BPF_W | libc::BPF_ABS, 0),
    ];
    #[cfg(target_arch = "x86_64")]
    filter.extend([
        sock_filter {
            code: (libc::BPF_JMP | libc::BPF_JSET | libc::BPF_K) as u16,
            jt: 0,
            jf: 1,
            k: 0x40000000,
        },
        stmt(libc::BPF_RET | libc::BPF_K, DENY),
    ]);
    // clone3 points to an opaque userspace struct. Standard libc can retry
    // clone after ENOSYS; accepting unchecked clone3 flags is not safe.
    filter.extend([
        eq(435, 0, 1),
        stmt(
            libc::BPF_RET | libc::BPF_K,
            0x00050000 | libc::ENOSYS as u32,
        ),
    ]);
    let namespace = (libc::CLONE_NEWNS
        | libc::CLONE_NEWCGROUP
        | libc::CLONE_NEWUTS
        | libc::CLONE_NEWIPC
        | libc::CLONE_NEWUSER
        | libc::CLONE_NEWPID
        | libc::CLONE_NEWNET
        | libc::CLONE_PARENT) as u32;
    filter.extend([
        eq(libc::SYS_clone as u32, 0, 7),
        stmt(libc::BPF_LD | libc::BPF_W | libc::BPF_ABS, 20),
        eq(0, 1, 0),
        stmt(libc::BPF_RET | libc::BPF_K, DENY),
        stmt(libc::BPF_LD | libc::BPF_W | libc::BPF_ABS, 16),
        sock_filter {
            code: (libc::BPF_JMP | libc::BPF_JSET | libc::BPF_K) as u16,
            jt: 0,
            jf: 1,
            k: namespace,
        },
        stmt(libc::BPF_RET | libc::BPF_K, DENY),
        stmt(libc::BPF_RET | libc::BPF_K, ALLOW),
    ]);
    // Querying limits is needed by interpreters/compilers; mutation is not.
    filter.extend([
        eq(libc::SYS_prlimit64 as u32, 0, 7),
        stmt(libc::BPF_LD | libc::BPF_W | libc::BPF_ABS, 32),
        eq(0, 1, 0),
        stmt(libc::BPF_RET | libc::BPF_K, DENY),
        stmt(libc::BPF_LD | libc::BPF_W | libc::BPF_ABS, 36),
        eq(0, 1, 0),
        stmt(libc::BPF_RET | libc::BPF_K, DENY),
        stmt(libc::BPF_RET | libc::BPF_K, ALLOW),
    ]);
    // Linux consumes ioctl's fd and request as 32-bit values. Compare that
    // kernel interpretation; unused upper register bits are not authority.
    let ioctl_start = filter.len();
    filter.extend([
        eq(libc::SYS_ioctl as u32, 0, 0),
        stmt(libc::BPF_LD | libc::BPF_W | libc::BPF_ABS, 24),
        eq(libc::FIOCLEX as u32, 0, 0),
        eq(libc::FIONBIO as u32, 0, 0),
    ]);
    if !terminal {
        filter.extend([
            stmt(libc::BPF_LD | libc::BPF_W | libc::BPF_ABS, 16),
            sock_filter {
                code: (libc::BPF_JMP | libc::BPF_JGT | libc::BPF_K) as u16,
                jt: 0,
                jf: 1,
                k: 2,
            },
            stmt(libc::BPF_RET | libc::BPF_K, DENY),
        ]);
    }
    filter.extend([stmt(libc::BPF_LD | libc::BPF_W | libc::BPF_ABS, 24)]);
    // TIOCSTI, TIOCSCTTY and arbitrary device requests remain forbidden.
    for request in [
        libc::TCGETS,
        libc::TCSETS,
        libc::TCSETSW,
        libc::TCSETSF,
        libc::TIOCGWINSZ,
        libc::TIOCSWINSZ,
        libc::TIOCGPGRP,
        libc::TIOCSPGRP,
        libc::TCFLSH,
        libc::TCSBRK,
        libc::TCGETS2,
        libc::TCSETS2,
        libc::TCSETSW2,
        libc::TCSETSF2,
    ] {
        filter.extend([
            eq(request as u32, 0, 1),
            stmt(libc::BPF_RET | libc::BPF_K, ALLOW),
        ]);
    }
    filter.push(stmt(libc::BPF_RET | libc::BPF_K, DENY));
    let allow = filter.len();
    filter.push(stmt(libc::BPF_RET | libc::BPF_K, ALLOW));
    filter[ioctl_start].jf = (filter.len() - ioctl_start - 1) as u8;
    for index in [ioctl_start + 2, ioctl_start + 3] {
        filter[index].jt = (allow - index - 1) as u8;
    }
    let denied = [
        libc::SYS_socket,
        libc::SYS_socketpair,
        libc::SYS_unshare,
        libc::SYS_setns,
        libc::SYS_mount,
        libc::SYS_umount2,
        libc::SYS_chroot,
        libc::SYS_pivot_root,
        libc::SYS_ptrace,
        libc::SYS_process_vm_readv,
        libc::SYS_process_vm_writev,
        libc::SYS_prctl,
        libc::SYS_seccomp,
        libc::SYS_capset,
        libc::SYS_setrlimit,
        libc::SYS_open_by_handle_at,
        libc::SYS_name_to_handle_at,
        libc::SYS_memfd_create,
        libc::SYS_mknodat,
        libc::SYS_bpf,
        libc::SYS_perf_event_open,
        libc::SYS_add_key,
        libc::SYS_request_key,
        libc::SYS_keyctl,
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
        425,
        426,
        427, // io_uring bypass surface
        428,
        429,
        430,
        431,
        432,
        433,
        442, // new mount API, including mount_setattr
        434,
        438, // pidfd signal/getfd; no escape through outside descriptors
    ];
    for syscall in denied {
        if network && syscall == libc::SYS_socket {
            continue;
        }
        filter.extend([
            eq(syscall as u32, 0, 1),
            stmt(libc::BPF_RET | libc::BPF_K, DENY),
        ]);
    }
    if network {
        // Only TCP-family descriptors in this fresh, loopback-only network
        // namespace. UNIX/raw/datagram sockets remain forbidden.
        filter.extend([
            eq(libc::SYS_socket as u32, 0, 10),
            stmt(libc::BPF_LD | libc::BPF_W | libc::BPF_ABS, 16),
            eq(libc::AF_INET as u32, 1, 0),
            eq(libc::AF_INET6 as u32, 0, 6),
            stmt(libc::BPF_LD | libc::BPF_W | libc::BPF_ABS, 24),
            stmt(
                libc::BPF_ALU | libc::BPF_AND | libc::BPF_K,
                !(libc::SOCK_CLOEXEC | libc::SOCK_NONBLOCK) as u32,
            ),
            eq(libc::SOCK_STREAM as u32, 0, 3),
            stmt(libc::BPF_RET | libc::BPF_K, ALLOW),
            stmt(libc::BPF_RET | libc::BPF_K, DENY),
            stmt(libc::BPF_RET | libc::BPF_K, DENY),
            stmt(libc::BPF_RET | libc::BPF_K, DENY),
        ]);
    }
    #[cfg(target_arch = "x86_64")]
    filter.extend([
        eq(libc::SYS_mknod as u32, 0, 1),
        stmt(libc::BPF_RET | libc::BPF_K, DENY),
    ]);
    filter.push(stmt(libc::BPF_RET | libc::BPF_K, ALLOW));
    let program = sock_fprog {
        len: filter.len() as u16,
        filter: filter.as_mut_ptr(),
    };
    for (resource, value) in [
        (libc::RLIMIT_CORE, 0),
        (libc::RLIMIT_FSIZE, 8 * 1024 * 1024),
        (libc::RLIMIT_NOFILE, 128),
    ] {
        let limit = libc::rlimit {
            rlim_cur: value,
            rlim_max: value,
        };
        if unsafe { libc::setrlimit(resource, &limit) } != 0 {
            return Err(io::Error::last_os_error());
        }
    }
    if unsafe { libc::prctl(libc::PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0) } != 0
        || unsafe { libc::prctl(libc::PR_SET_SECCOMP, 2, &program as *const sock_fprog) } != 0
    {
        return Err(io::Error::last_os_error());
    }
    Ok(())
}
