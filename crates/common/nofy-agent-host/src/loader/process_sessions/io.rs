use std::{
    fs::File,
    io,
    os::fd::{AsRawFd, FromRawFd, OwnedFd},
    pin::Pin,
    process::Stdio,
    task::{Context, Poll},
};
use tokio::io::{AsyncRead, AsyncWrite, ReadBuf, unix::AsyncFd};
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
        let fd = unsafe {
            libc::posix_openpt(libc::O_RDWR | libc::O_NOCTTY | libc::O_CLOEXEC | libc::O_NONBLOCK)
        };
        if fd < 0 {
            return Err(io::Error::last_os_error());
        }
        let master = unsafe { File::from_raw_fd(fd) };
        if unsafe { libc::grantpt(fd) } != 0 || unsafe { libc::unlockpt(fd) } != 0 {
            return Err(io::Error::last_os_error());
        }
        let mut name = [0i8; 4096];
        let status = unsafe { libc::ptsname_r(fd, name.as_mut_ptr(), name.len()) };
        if status != 0 {
            return Err(io::Error::from_raw_os_error(status));
        }
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
pub(super) fn gate(command: &mut tokio::process::Command) -> io::Result<OwnedFd> {
    use std::os::unix::process::CommandExt;
    let mut pipe = [-1; 2];
    if unsafe { libc::pipe2(pipe.as_mut_ptr(), libc::O_CLOEXEC) } != 0 {
        return Err(io::Error::last_os_error());
    }
    let read = unsafe { OwnedFd::from_raw_fd(pipe[0]) };
    let write = unsafe { OwnedFd::from_raw_fd(pipe[1]) };
    let high = unsafe { libc::fcntl(read.as_raw_fd(), libc::F_DUPFD_CLOEXEC, 200) };
    if high < 0 {
        return Err(io::Error::last_os_error());
    }
    let read = unsafe { OwnedFd::from_raw_fd(high) };
    unsafe {
        command.as_std_mut().pre_exec(move || {
            if libc::dup2(read.as_raw_fd(), 198) < 0 || libc::fcntl(198, libc::F_SETFD, 0) < 0 {
                return Err(io::Error::last_os_error());
            }
            Ok(())
        });
    }
    Ok(write)
}
pub(super) fn commit(fd: &OwnedFd) -> io::Result<()> {
    loop {
        let n = unsafe { libc::write(fd.as_raw_fd(), [1u8].as_ptr().cast(), 1) };
        if n == 1 {
            return Ok(());
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
    let high = unsafe { libc::fcntl(fd.as_raw_fd(), libc::F_DUPFD_CLOEXEC, 200) };
    if high < 0 {
        return Err(io::Error::last_os_error());
    }
    let fd = unsafe { OwnedFd::from_raw_fd(high) };
    unsafe {
        command.as_std_mut().pre_exec(move || {
            if libc::dup2(fd.as_raw_fd(), target) < 0 || libc::fcntl(target, libc::F_SETFD, 0) < 0 {
                return Err(io::Error::last_os_error());
            }
            Ok(())
        });
    }
    Ok(())
}
