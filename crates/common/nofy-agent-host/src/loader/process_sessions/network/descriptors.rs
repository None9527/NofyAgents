//! A private descriptor channel, never inherited by business code.
use std::{
    io, mem,
    os::fd::{FromRawFd, OwnedFd, RawFd},
};
pub(super) fn pair() -> io::Result<(OwnedFd, OwnedFd)> {
    let mut fds = [-1; 2];
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
    Ok(unsafe { (OwnedFd::from_raw_fd(fds[0]), OwnedFd::from_raw_fd(fds[1])) })
}
pub(super) fn send(socket: RawFd, fd: RawFd) -> io::Result<()> {
    let mut byte = 1u8;
    let mut iov = libc::iovec {
        iov_base: (&mut byte as *mut u8).cast(),
        iov_len: 1,
    };
    let mut control = [0u64; 4];
    let mut message: libc::msghdr = unsafe { mem::zeroed() };
    message.msg_iov = &mut iov;
    message.msg_iovlen = 1;
    message.msg_control = control.as_mut_ptr().cast();
    message.msg_controllen = unsafe { libc::CMSG_SPACE(mem::size_of::<RawFd>() as u32) } as usize;
    unsafe {
        let header = libc::CMSG_FIRSTHDR(&message);
        (*header).cmsg_level = libc::SOL_SOCKET;
        (*header).cmsg_type = libc::SCM_RIGHTS;
        (*header).cmsg_len = libc::CMSG_LEN(mem::size_of::<RawFd>() as u32) as usize;
        libc::CMSG_DATA(header).cast::<RawFd>().write(fd);
    }
    loop {
        if unsafe { libc::sendmsg(socket, &message, libc::MSG_NOSIGNAL) } == 1 {
            return Ok(());
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
    let mut message: libc::msghdr = unsafe { mem::zeroed() };
    message.msg_iov = &mut iov;
    message.msg_iovlen = 1;
    message.msg_control = control.as_mut_ptr().cast();
    message.msg_controllen = mem::size_of_val(&control);
    let n = unsafe { libc::recvmsg(socket, &mut message, libc::MSG_CMSG_CLOEXEC) };
    if n < 0 {
        return Err(io::Error::last_os_error());
    }
    if n == 0 {
        return Err(io::Error::from(io::ErrorKind::UnexpectedEof));
    }
    let mut received = Vec::new();
    unsafe {
        let mut header = libc::CMSG_FIRSTHDR(&message);
        while !header.is_null() {
            if (*header).cmsg_level == libc::SOL_SOCKET && (*header).cmsg_type == libc::SCM_RIGHTS {
                let length = (*header)
                    .cmsg_len
                    .saturating_sub(libc::CMSG_LEN(0) as usize)
                    / mem::size_of::<RawFd>();
                for index in 0..length {
                    received.push(OwnedFd::from_raw_fd(
                        libc::CMSG_DATA(header).cast::<RawFd>().add(index).read(),
                    ));
                }
            }
            header = libc::CMSG_NXTHDR(&message, header);
        }
    }
    if n != 1 || byte != 1 || message.msg_flags & libc::MSG_CTRUNC != 0 || received.len() != 1 {
        return Err(io::Error::other(
            "invalid network broker descriptor message",
        ));
    }
    Ok(received.pop().expect("one descriptor"))
}
