use std::{
    fs::File,
    io,
    os::fd::{AsRawFd, FromRawFd, OwnedFd},
    pin::Pin,
    process::Stdio,
    task::{Context, Poll},
};
use tokio::io::{AsyncRead, AsyncWrite, ReadBuf, unix::AsyncFd};
pub(super) const GATE_FD: i32 = 198;
const HIGH_FD_FLOOR: i32 = 200;

pub(super) type Reader = Box<dyn AsyncRead + Unpin + Send>;
pub(super) type Writer = Box<dyn AsyncWrite + Unpin + Send>;
pub(super) struct Pty(AsyncFd<File>);
impl Pty {
    fn new(file: File) -> io::Result<Self> {
        Ok(Self(AsyncFd::new(file)?))
    }
}
impl AsyncRead for Pty {
    fn poll_read(
        self: Pin<&mut Self>,
        cx: &mut Context<'_>,
        buf: &mut ReadBuf<'_>,
    ) -> Poll<io::Result<()>> {
        loop {
            let mut ready = std::task::ready!(self.0.poll_read_ready(cx))?;
            match ready.try_io(|fd| {
                let unfilled = buf.initialize_unfilled();
                // SAFETY: `fd` is a live non-blocking PTY master `File` owned
                // by `self.0`, and `unfilled` is an initialized writable byte
                // slice of length `unfilled.len()`. `read(2)` writes at most
                // `unfilled.len()` bytes; Linux reports `EIO` when all slaves
                // close, which maps to EOF (`Ok(0)`).
                let n = unsafe {
                    libc::read(fd.as_raw_fd(), unfilled.as_mut_ptr().cast(), unfilled.len())
                };
                if n < 0 {
                    let error = io::Error::last_os_error();
                    if error.raw_os_error() == Some(libc::EIO) {
                        Ok(0)
                    } else {
                        Err(error)
                    }
                } else {
                    Ok(n as usize)
                }
            }) {
                Ok(result) => {
                    buf.advance(result?);
                    return Poll::Ready(Ok(()));
                }
                Err(_) => continue,
            }
        }
    }
}
impl AsyncWrite for Pty {
    fn poll_write(
        self: Pin<&mut Self>,
        cx: &mut Context<'_>,
        buf: &[u8],
    ) -> Poll<io::Result<usize>> {
        loop {
            let mut ready = std::task::ready!(self.0.poll_write_ready(cx))?;
            match ready.try_io(|fd| {
                // SAFETY: `fd` is a live non-blocking PTY master `File` owned
                // by `self.0`, and `buf` is a valid readable slice of length
                // `buf.len()`. Negative return is mapped to `last_os_error()`.
                let n = unsafe { libc::write(fd.as_raw_fd(), buf.as_ptr().cast(), buf.len()) };
                if n < 0 {
                    Err(io::Error::last_os_error())
                } else {
                    Ok(n as usize)
                }
            }) {
                Ok(result) => return Poll::Ready(result),
                Err(_) => continue,
            }
        }
    }
    fn poll_flush(self: Pin<&mut Self>, _: &mut Context<'_>) -> Poll<io::Result<()>> {
        Poll::Ready(Ok(()))
    }
    fn poll_shutdown(self: Pin<&mut Self>, _: &mut Context<'_>) -> Poll<io::Result<()>> {
        Poll::Ready(Ok(()))
    }
}
pub(super) struct Terminal {
    pub master: File,
    slave: File,
}
impl Terminal {
    pub fn open(rows: u16, columns: u16) -> io::Result<Self> {
        // SAFETY: `posix_openpt` takes only flag bits and allocates a fresh
        // non-blocking, close-on-exec PTY master descriptor or returns `-1`.
        let fd = unsafe {
            libc::posix_openpt(libc::O_RDWR | libc::O_NOCTTY | libc::O_CLOEXEC | libc::O_NONBLOCK)
        };
        if fd < 0 {
            return Err(io::Error::last_os_error());
        }
        // SAFETY: `fd` was just returned >= 0 by `posix_openpt` with no other
        // owner; wrapping immediately in `File` closes it on any later error.
        let master = unsafe { File::from_raw_fd(fd) };
        // SAFETY: `master` is a live PTY master descriptor owned by this scope.
        if unsafe { libc::grantpt(master.as_raw_fd()) } != 0 {
            return Err(io::Error::last_os_error());
        }
        // SAFETY: `master` is a live PTY master descriptor owned by this scope.
        if unsafe { libc::unlockpt(master.as_raw_fd()) } != 0 {
            return Err(io::Error::last_os_error());
        }
        // `c_char` is `i8` on x86_64 but `u8` on aarch64 Linux.
        let mut name = [0 as libc::c_char; 4096];
        // SAFETY: `master` is an unlocked PTY master FD and `name` is a valid
        // writable 4096-byte buffer; `ptsname_r` writes a NUL-terminated slave
        // path within `name.len()` bytes on success.
        let status = unsafe { libc::ptsname_r(master.as_raw_fd(), name.as_mut_ptr(), name.len()) };
        if status != 0 {
            return Err(if status < 0 {
                io::Error::last_os_error()
            } else {
                io::Error::from_raw_os_error(status)
            });
        }
        if !name.contains(&0) {
            return Err(io::Error::other("unterminated PTY slave path"));
        }
        // SAFETY: `name` was populated by `ptsname_r` and verified to contain a
        // NUL terminator above; `O_NOCTTY | O_CLOEXEC` avoids acquiring a
        // controlling terminal in the host or leaking the slave FD across exec.
        let slave = unsafe {
            libc::open(
                name.as_ptr(),
                libc::O_RDWR | libc::O_NOCTTY | libc::O_CLOEXEC,
            )
        };
        if slave < 0 {
            return Err(io::Error::last_os_error());
        }
        let terminal = Self {
            master,
            // SAFETY: `slave` was just returned >= 0 by `open` above and is
            // exclusively owned by `Self`.
            slave: unsafe { File::from_raw_fd(slave) },
        };
        terminal.resize(rows, columns)?;
        Ok(terminal)
    }
    pub fn configure(&self, command: &mut tokio::process::Command) -> io::Result<()> {
        command
            .stdin(Stdio::from(self.slave.try_clone()?))
            .stdout(Stdio::from(self.slave.try_clone()?))
            .stderr(Stdio::from(self.slave.try_clone()?));
        Ok(())
    }
    pub fn streams(&self) -> io::Result<(Reader, Writer)> {
        Ok((
            Box::new(Pty::new(self.master.try_clone()?)?),
            Box::new(Pty::new(self.master.try_clone()?)?),
        ))
    }
    pub fn resize(&self, rows: u16, columns: u16) -> io::Result<()> {
        let size = libc::winsize {
            ws_row: rows,
            ws_col: columns,
            ws_xpixel: 0,
            ws_ypixel: 0,
        };
        // SAFETY: `self.master` is a live PTY master descriptor and `&size` is
        // a valid initialized `libc::winsize` matching `TIOCSWINSZ`'s argument.
        if unsafe { libc::ioctl(self.master.as_raw_fd(), libc::TIOCSWINSZ, &size) } < 0 {
            return Err(io::Error::last_os_error());
        }
        Ok(())
    }
    pub fn release_slave(&mut self) -> io::Result<()> {
        // Do not retain a slave in the host: it would suppress master EOF.
        self.slave = File::open("/dev/null")?;
        Ok(())
    }
}
fn current_nofile_limit() -> Option<(u64, u64)> {
    let mut limit = libc::rlimit {
        rlim_cur: 0,
        rlim_max: 0,
    };
    // SAFETY: `&mut limit` is a valid initialized `libc::rlimit` out-pointer
    // for `getrlimit(RLIMIT_NOFILE, ...)`; failure returns `None`.
    if unsafe { libc::getrlimit(libc::RLIMIT_NOFILE, &mut limit) } != 0 {
        return None;
    }
    let map = |value: libc::rlim_t| {
        if value == libc::RLIM_INFINITY {
            u64::MAX
        } else {
            value
        }
    };
    Some((map(limit.rlim_cur), map(limit.rlim_max)))
}
fn validate_nofile_limit(soft: u64, hard: u64, target: i32, floor: i32) -> io::Result<()> {
    let required = u64::try_from(floor)
        .ok()
        .and_then(|v| v.checked_add(1))
        .unwrap_or(u64::MAX);
    if soft < required {
        return Err(io::Error::other(format!(
            "process session handoff descriptor {target} requires RLIMIT_NOFILE >= {required} \
             (staging floor {floor}; current soft limit {soft}, hard limit {hard}); \
             raise the open-file limit before starting process sessions"
        )));
    }
    Ok(())
}
fn stage_high_fd(fd: &OwnedFd, target: i32) -> io::Result<OwnedFd> {
    if !(3..HIGH_FD_FLOOR).contains(&target) {
        return Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            format!(
                "process session handoff descriptor target {target} must be in 3..{HIGH_FD_FLOOR}"
            ),
        ));
    }
    if let Some((soft, hard)) = current_nofile_limit() {
        validate_nofile_limit(soft, hard, target, HIGH_FD_FLOOR)?;
    }
    // SAFETY: `fd` is a live owned descriptor and `HIGH_FD_FLOOR` (200) is a
    // valid non-negative minimum FD for `F_DUPFD_CLOEXEC`; duplicating above
    // all reserved target slots (198/199) prevents `pre_exec` `dup2` collisions.
    let high = unsafe { libc::fcntl(fd.as_raw_fd(), libc::F_DUPFD_CLOEXEC, HIGH_FD_FLOOR) };
    if high < 0 {
        let error = io::Error::last_os_error();
        if matches!(error.raw_os_error(), Some(libc::EINVAL | libc::EMFILE))
            && let Some((soft, hard)) = current_nofile_limit()
        {
            return Err(io::Error::other(format!(
                "cannot stage process session handoff descriptor for target {target} at fd >= \
                 {HIGH_FD_FLOOR} (RLIMIT_NOFILE soft={soft}, hard={hard}): {error}"
            )));
        }
        return Err(error);
    }
    // SAFETY: `high` was just returned >= `HIGH_FD_FLOOR` by `F_DUPFD_CLOEXEC`
    // and is uniquely owned here.
    Ok(unsafe { OwnedFd::from_raw_fd(high) })
}
pub(super) fn gate(command: &mut tokio::process::Command) -> io::Result<OwnedFd> {
    let mut pipe = [-1; 2];
    // SAFETY: `pipe` is a valid writable `[c_int; 2]` buffer as required by
    // `pipe2(2)`; `O_CLOEXEC` ensures neither end leaks across `exec`.
    if unsafe { libc::pipe2(pipe.as_mut_ptr(), libc::O_CLOEXEC) } != 0 {
        return Err(io::Error::last_os_error());
    }
    // SAFETY: `pipe2` returned 0, so `pipe[0]` is a valid newly opened read FD.
    let read = unsafe { OwnedFd::from_raw_fd(pipe[0]) };
    // SAFETY: `pipe2` returned 0, so `pipe[1]` is a valid newly opened write FD
    // distinct from `pipe[0]`.
    let write = unsafe { OwnedFd::from_raw_fd(pipe[1]) };
    inherit(command, read, GATE_FD)?;
    Ok(write)
}
pub(super) fn commit(fd: &OwnedFd) -> io::Result<()> {
    const COMMIT_SIGNAL: [u8; 1] = [1];
    loop {
        // SAFETY: `fd` is the live owned write end of the handoff pipe and
        // `COMMIT_SIGNAL` is a valid 1-byte static buffer.
        let n = unsafe { libc::write(fd.as_raw_fd(), COMMIT_SIGNAL.as_ptr().cast(), 1) };
        if n == 1 {
            return Ok(());
        }
        if n == 0 {
            return Err(io::Error::from(io::ErrorKind::WriteZero));
        }
        let error = io::Error::last_os_error();
        if error.kind() != io::ErrorKind::Interrupted {
            return Err(error);
        }
    }
}
pub(super) fn inherit(
    command: &mut tokio::process::Command,
    fd: OwnedFd,
    target: i32,
) -> io::Result<()> {
    use std::os::unix::process::CommandExt;
    let staged = stage_high_fd(&fd, target)?;
    // SAFETY: Runs between `fork` and `exec` in the child process and calls
    // only async-signal-safe `dup2`, `fcntl(F_SETFD)`, and non-allocating
    // `io::Error::last_os_error()`. `staged` has fd >= 200 (disjoint from
    // `target` in `3..200`), has `O_CLOEXEC` set so it closes on `exec` in the
    // child, and remains owned by this closure in the parent until `command` drops.
    unsafe {
        command.as_std_mut().pre_exec(move || {
            loop {
                if libc::dup2(staged.as_raw_fd(), target) >= 0 {
                    break;
                }
                let error = io::Error::last_os_error();
                if error.raw_os_error() != Some(libc::EINTR) {
                    return Err(error);
                }
            }
            if libc::fcntl(target, libc::F_SETFD, 0) < 0 {
                return Err(io::Error::last_os_error());
            }
            Ok(())
        });
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn nofile_boundary_check_reports_clear_diagnostics() {
        for low in [0, 64, 128, 198, 199, 200] {
            let error = validate_nofile_limit(low, 1024, GATE_FD, HIGH_FD_FLOOR).unwrap_err();
            let message = error.to_string();
            assert!(message.contains("RLIMIT_NOFILE"), "{message}");
            assert!(message.contains("201"), "{message}");
            assert!(message.contains(&low.to_string()), "{message}");
        }
        assert!(validate_nofile_limit(201, 201, GATE_FD, HIGH_FD_FLOOR).is_ok());
        assert!(validate_nofile_limit(1024, 4096, 199, HIGH_FD_FLOOR).is_ok());
        assert!(validate_nofile_limit(u64::MAX, u64::MAX, 199, HIGH_FD_FLOOR).is_ok());
    }

    #[test]
    fn inherit_rejects_out_of_range_target_descriptors() {
        let mut command = tokio::process::Command::new("/bin/true");
        for bad_target in [-1, 0, 1, 2, HIGH_FD_FLOOR, HIGH_FD_FLOOR + 5] {
            let file = File::open("/dev/null").unwrap();
            let error = inherit(&mut command, file.into(), bad_target).unwrap_err();
            assert_eq!(error.kind(), io::ErrorKind::InvalidInput, "{bad_target}");
        }
    }

    #[test]
    fn gate_and_commit_stage_handoff_pipe() {
        let mut command = tokio::process::Command::new("/bin/true");
        let write_end = gate(&mut command).unwrap();
        commit(&write_end).unwrap();
    }
}
