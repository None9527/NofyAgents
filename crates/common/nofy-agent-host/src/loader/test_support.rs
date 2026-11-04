//! Fork-only ownership tests; children use only async-signal-safe syscalls.
use std::{
    io::Read,
    os::{fd::AsRawFd, unix::net::UnixStream},
};
pub(super) struct Holder {
    pid: libc::pid_t,
    _stream: UnixStream,
}
impl Drop for Holder {
    fn drop(&mut self) {
        // This exact child is owned by this test and has never been reaped.
        unsafe {
            libc::kill(self.pid, libc::SIGKILL);
            while libc::waitpid(self.pid, std::ptr::null_mut(), 0) < 0 {
                if std::io::Error::last_os_error().kind() != std::io::ErrorKind::Interrupted {
                    break;
                }
            }
        }
    }
}
pub(super) fn inherited_descriptors() -> Holder {
    inherited_descriptors_with(|| {})
}
pub(super) fn inherited_descriptors_with(child_action: impl FnOnce()) -> Holder {
    let (parent, child) = UnixStream::pair().unwrap();
    parent
        .set_read_timeout(Some(std::time::Duration::from_secs(5)))
        .unwrap();
    let (parent_fd, child_fd) = (parent.as_raw_fd(), child.as_raw_fd());
    // The child touches no Rust allocator, mutex or destructor after fork.
    let pid = unsafe { libc::fork() };
    assert!(pid >= 0);
    if pid == 0 {
        child_action();
        unsafe {
            libc::close(parent_fd);
            let byte = [1u8];
            libc::write(child_fd, byte.as_ptr().cast(), 1);
            let mut received = [0u8];
            libc::read(child_fd, received.as_mut_ptr().cast(), 1);
            libc::_exit(0);
        }
    }
    drop(child);
    let mut holder = Holder {
        pid,
        _stream: parent,
    };
    let mut ready = [0u8];
    holder._stream.read_exact(&mut ready).unwrap();
    assert_eq!(ready, [1]);
    holder
}
