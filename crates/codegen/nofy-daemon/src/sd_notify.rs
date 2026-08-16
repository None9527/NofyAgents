//! Minimal systemd `sd_notify` client (no libsystemd dependency).
//!
//! The protocol is a single AF_UNIX datagram to `$NOTIFY_SOCKET` per state
//! change; absent socket (non-systemd supervisor) makes every call a no-op
//! returning `false`, so the daemon runs unchanged under launchd/foreground.

use std::os::unix::net::UnixDatagram;

/// Send one notify state string (`"READY=1"`, `"WATCHDOG=1"`,
/// `"STOPPING=1"`, `"STATUS=..."`). Returns whether a socket was configured
/// and the datagram sent.
pub fn sd_notify(state: &str) -> bool {
    let Ok(sock_path) = std::env::var("NOTIFY_SOCKET") else {
        return false;
    };
    if sock_path.is_empty() {
        return false;
    }
    // Abstract namespace sockets start with '@' → NUL prefix.
    let path = if let Some(rest) = sock_path.strip_prefix('@') {
        format!("\0{rest}")
    } else {
        sock_path
    };
    let Ok(sock) = UnixDatagram::unbound() else {
        return false;
    };
    sock.send_to(state.as_bytes(), &path).is_ok()
}

/// Tell the supervisor the daemon is up; call once after the control plane is
/// listening.
pub fn ready() -> bool {
    sd_notify("READY=1")
}

/// One watchdog ping; the supervisor restarts us if pings stop for
/// `WatchdogSec`.
pub fn watchdog_ping() -> bool {
    sd_notify("WATCHDOG=1")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn absent_socket_is_noop() {
        // SAFETY: no other test in this crate reads NOTIFY_SOCKET.
        unsafe { std::env::remove_var("NOTIFY_SOCKET") };
        assert!(!sd_notify("READY=1"));
    }

    #[test]
    fn delivers_to_configured_socket() {
        let dir = tempfile::tempdir().unwrap();
        let sock_path = dir.path().join("notify.sock");
        let listener = UnixDatagram::bind(&sock_path).unwrap();
        // SAFETY: no other test in this crate reads NOTIFY_SOCKET.
        unsafe { std::env::set_var("NOTIFY_SOCKET", &sock_path) };
        assert!(sd_notify("READY=1"));
        let mut buf = [0u8; 64];
        let (n, _) = listener.recv_from(&mut buf).unwrap();
        assert_eq!(&buf[..n], b"READY=1");
        unsafe { std::env::remove_var("NOTIFY_SOCKET") };
    }
}
