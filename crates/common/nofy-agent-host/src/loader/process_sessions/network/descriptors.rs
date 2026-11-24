//! A private descriptor channel, never inherited by business code.
use std::{
    io, mem,
    os::fd::{FromRawFd, OwnedFd, RawFd},
};
pub(super) fn pair() -> io::Result<(OwnedFd, OwnedFd)> {
    let mut fds = [-1; 2];
    // SAFETY: `fds` is a valid writable `[c_int; 2]` buffer as required by
    // `socketpair(2)`; `SOCK_CLOEXEC | SOCK_NONBLOCK` prevents descriptor leaks
    // across `exec` and enables non-blocking `AsyncFd` polling.
    if unsafe {
        libc::socketpair(
            libc::AF_UNIX,
            libc::SOCK_DGRAM | libc::SOCK_CLOEXEC | libc::SOCK_NONBLOCK,
            0,
            fds.as_mut_ptr(),
        )
    } != 0
    {
        return Err(io::Error::last_os_error());
    }
    // SAFETY: `socketpair` returned 0, guaranteeing `fds[0]` and `fds[1]` are
    // distinct valid open descriptors (>= 0) with no other owners.
    Ok(unsafe { (OwnedFd::from_raw_fd(fds[0]), OwnedFd::from_raw_fd(fds[1])) })
}
pub(super) fn send(socket: RawFd, fd: RawFd) -> io::Result<()> {
    if fd < 0 {
        return Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            "invalid descriptor for network broker handoff",
        ));
    }
    let mut byte = 1u8;
    let mut iov = libc::iovec {
        iov_base: (&mut byte as *mut u8).cast(),
        iov_len: 1,
    };
    let mut control = [0u64; 4];
    // SAFETY: `CMSG_SPACE` is a pure size calculation on the known `RawFd` payload size.
    let space = unsafe { libc::CMSG_SPACE(mem::size_of::<RawFd>() as u32) } as usize;
    if space > mem::size_of_val(&control) {
        return Err(io::Error::other("control message buffer too small"));
    }
    // SAFETY: `libc::msghdr` is a C ABI struct of pointers/integers where the
    // all-zero bit pattern is valid and clears unused name/flags fields.
    let mut message: libc::msghdr = unsafe { mem::zeroed() };
    message.msg_iov = &mut iov;
    message.msg_iovlen = 1;
    message.msg_control = control.as_mut_ptr().cast();
    message.msg_controllen = space;
    // SAFETY: `message.msg_control` points to the 8-byte-aligned `control`
    // buffer with `msg_controllen == space <= size_of_val(&control)`, so
    // `CMSG_FIRSTHDR` returns a valid pointer within `control` (checked
    // non-null below) and `CMSG_DATA` has room for one `RawFd` written with
    // `write_unaligned` to avoid any alignment assumption.
    unsafe {
        let header = libc::CMSG_FIRSTHDR(&message);
        if header.is_null() {
            return Err(io::Error::other("missing control message header"));
        }
        (*header).cmsg_level = libc::SOL_SOCKET;
        (*header).cmsg_type = libc::SCM_RIGHTS;
        (*header).cmsg_len = libc::CMSG_LEN(mem::size_of::<RawFd>() as u32) as usize;
        libc::CMSG_DATA(header).cast::<RawFd>().write_unaligned(fd);
    }
    loop {
        // SAFETY: `message`, `iov`, `byte`, and `control` remain live and
        // valid for the duration of `sendmsg`; `MSG_NOSIGNAL` suppresses SIGPIPE.
        let sent = unsafe { libc::sendmsg(socket, &message, libc::MSG_NOSIGNAL) };
        if sent == 1 {
            return Ok(());
        }
        if sent >= 0 {
            return Err(io::Error::from(io::ErrorKind::WriteZero));
        }
        let error = io::Error::last_os_error();
        if error.kind() != io::ErrorKind::Interrupted {
            return Err(error);
        }
    }
}
pub(super) fn receive(socket: RawFd) -> io::Result<OwnedFd> {
    let mut byte = 0u8;
    let mut iov = libc::iovec {
        iov_base: (&mut byte as *mut u8).cast(),
        iov_len: 1,
    };
    let mut control = [0u64; 32];
    // SAFETY: `libc::msghdr` is a C ABI struct of pointers/integers where the
    // all-zero bit pattern is valid.
    let mut message: libc::msghdr = unsafe { mem::zeroed() };
    message.msg_iov = &mut iov;
    message.msg_iovlen = 1;
    message.msg_control = control.as_mut_ptr().cast();
    message.msg_controllen = mem::size_of_val(&control);
    let n = loop {
        // SAFETY: `message`, `iov`, `byte`, and `control` are valid writable
        // buffers for `recvmsg`; `MSG_CMSG_CLOEXEC` marks received descriptors
        // close-on-exec atomically.
        let n = unsafe { libc::recvmsg(socket, &mut message, libc::MSG_CMSG_CLOEXEC) };
        if n >= 0 {
            break n;
        }
        let error = io::Error::last_os_error();
        if error.kind() != io::ErrorKind::Interrupted {
            return Err(error);
        }
    };
    if n == 0 {
        return Err(io::Error::from(io::ErrorKind::UnexpectedEof));
    }
    let mut received = Vec::new();
    let mut invalid_fd = false;
    // SAFETY: `recvmsg` succeeded and updated `message.msg_controllen` within
    // `control` (`size_of_val(&control)`). Every header iterated by
    // `CMSG_FIRSTHDR`/`CMSG_NXTHDR` lies inside `control`; each `SCM_RIGHTS`
    // payload slice is bounded by both `cmsg_len` and `control_end` before
    // reading `RawFd` values via `read_unaligned`. Every non-negative FD is
    // immediately wrapped in `OwnedFd` so error paths drop and close them all.
    unsafe {
        let control_end = (message.msg_control as usize)
            .saturating_add(message.msg_controllen.min(mem::size_of_val(&control)));
        let mut header = libc::CMSG_FIRSTHDR(&message);
        while !header.is_null() {
            if (*header).cmsg_level == libc::SOL_SOCKET && (*header).cmsg_type == libc::SCM_RIGHTS {
                let data_ptr = libc::CMSG_DATA(header);
                let header_end = (header as usize).saturating_add((*header).cmsg_len);
                let valid_end = header_end.min(control_end);
                let data_bytes = valid_end.saturating_sub(data_ptr as usize);
                let count = data_bytes / mem::size_of::<RawFd>();
                for index in 0..count {
                    let raw = data_ptr.cast::<RawFd>().add(index).read_unaligned();
                    if raw >= 0 {
                        received.push(OwnedFd::from_raw_fd(raw));
                    } else {
                        invalid_fd = true;
                    }
                }
            }
            header = libc::CMSG_NXTHDR(&message, header);
        }
    }
    if n != 1
        || byte != 1
        || message.msg_flags & libc::MSG_CTRUNC != 0
        || invalid_fd
        || received.len() != 1
    {
        return Err(io::Error::other(
            "invalid network broker descriptor message",
        ));
    }
    received
        .pop()
        .ok_or_else(|| io::Error::other("missing network broker descriptor"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::{Read, Write};
    use std::os::fd::AsRawFd;

    #[test]
    fn pair_transfers_descriptor_with_cloexec_and_rejects_invalid_fd() {
        let (host, guest) = pair().unwrap();
        assert!(send(guest.as_raw_fd(), -1).is_err());

        let (mut tx, rx) = std::os::unix::net::UnixStream::pair().unwrap();
        send(guest.as_raw_fd(), rx.as_raw_fd()).unwrap();
        drop(rx);

        let received = receive(host.as_raw_fd()).unwrap();
        // SAFETY: `received` is a live owned FD; querying FD flags is read-only.
        let flags = unsafe { libc::fcntl(received.as_raw_fd(), libc::F_GETFD) };
        assert!(flags >= 0 && (flags & libc::FD_CLOEXEC) != 0);

        tx.write_all(b"ok").unwrap();
        let mut peer = std::os::unix::net::UnixStream::from(received);
        let mut buf = [0u8; 2];
        peer.read_exact(&mut buf).unwrap();
        assert_eq!(&buf, b"ok");
    }
}
