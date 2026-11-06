//! Only the disposable trusted init calls these before business confinement.
use super::*;
use std::{
    io,
    os::fd::{AsRawFd, FromRawFd},
    sync::atomic::{AtomicUsize, Ordering},
};
pub(in crate::loader) fn loopback() -> io::Result<()> {
    let fd = unsafe { libc::socket(libc::AF_INET, libc::SOCK_DGRAM | libc::SOCK_CLOEXEC, 0) };
    if fd < 0 {
        return Err(io::Error::last_os_error());
    }
    let fd = unsafe { OwnedFd::from_raw_fd(fd) };
    let mut request: libc::ifreq = unsafe { std::mem::zeroed() };
    // `ifr_name` is `[c_char; 16]`: `i8` on x86_64 but `u8` on aarch64 Linux.
    request.ifr_name[0] = b'l' as libc::c_char;
    request.ifr_name[1] = b'o' as libc::c_char;
    if unsafe { libc::ioctl(fd.as_raw_fd(), libc::SIOCGIFFLAGS, &mut request) } < 0 {
        return Err(io::Error::last_os_error());
    }
    unsafe {
        request.ifr_ifru.ifru_flags |= (libc::IFF_UP | libc::IFF_RUNNING) as i16;
    }
    if unsafe { libc::ioctl(fd.as_raw_fd(), libc::SIOCSIFFLAGS, &request) } < 0 {
        return Err(io::Error::last_os_error());
    }
    Ok(())
}
pub(in crate::loader) fn spawn_proxy(config: &Config, lifeline: i32) -> io::Result<()> {
    let listener = std::net::TcpListener::bind((std::net::Ipv4Addr::LOCALHOST, PORT))?;
    let child = unsafe { libc::fork() };
    if child < 0 {
        return Err(io::Error::last_os_error());
    }
    if child == 0 {
        unsafe {
            libc::close(lifeline);
        }
        let result = serve(listener, config);
        if let Err(error) = result {
            eprintln!("network proxy stopped: {error}");
        }
        unsafe {
            libc::_exit(0);
        }
    }
    drop(listener);
    unsafe {
        libc::close(FD);
    }
    Ok(())
}
fn serve(listener: std::net::TcpListener, config: &Config) -> io::Result<()> {
    let active = Arc::new(AtomicUsize::new(0));
    for socket in listener.incoming() {
        let mut socket = socket?;
        if active.fetch_add(1, Ordering::AcqRel) >= config.max_connections as usize {
            active.fetch_sub(1, Ordering::AcqRel);
            continue;
        }
        let result = (|| -> io::Result<_> {
            let (stream, host) = std::os::unix::net::UnixStream::pair()?;
            descriptors::send(FD, host.as_raw_fd())?;
            let timeout = Some(Duration::from_millis(config.idle_timeout_ms));
            stream.set_read_timeout(timeout)?;
            stream.set_write_timeout(timeout)?;
            socket.set_read_timeout(timeout)?;
            socket.set_write_timeout(timeout)?;
            let incoming = stream.try_clone()?;
            let output = socket.try_clone()?;
            Ok((stream, incoming, output))
        })();
        let (mut stream, mut incoming, mut output) = match result {
            Ok(value) => value,
            Err(_) => {
                active.fetch_sub(1, Ordering::AcqRel);
                continue;
            }
        };
        let active = active.clone();
        std::thread::spawn(move || {
            let forward = std::thread::spawn(move || {
                let result = io::copy(&mut socket, &mut stream);
                let _ = stream.shutdown(std::net::Shutdown::Write);
                result
            });
            let _ = io::copy(&mut incoming, &mut output);
            let _ = output.shutdown(std::net::Shutdown::Both);
            let _ = incoming.shutdown(std::net::Shutdown::Both);
            let _ = forward.join();
            active.fetch_sub(1, Ordering::AcqRel);
        });
    }
    Ok(())
}
