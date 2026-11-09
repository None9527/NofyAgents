//! The guest has only loopback. Only this host broker owns outbound sockets.
use super::*;
use std::{
    net::{IpAddr, SocketAddr},
    os::fd::OwnedFd,
    time::Duration,
};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
mod descriptors;
mod guest;
pub(in crate::loader) use guest::{loopback, spawn_proxy};
pub(in crate::loader) const FD: i32 = 199;
pub(in crate::loader) const PORT: u16 = 19753;
#[allow(unused_imports)]
pub(in crate::loader) use crate::loader::process_policy::network::schema;
pub use crate::loader::process_policy::network::{Config, Destination};

impl Config {
    fn destination(&self, host: &str, port: u16) -> Option<&Destination> {
        self.allowed.iter().find(|rule| {
            rule.ports.contains(&port)
                && (rule.host.trim_start_matches('[').trim_end_matches(']') == host
                    || (host.parse::<IpAddr>().ok().is_some()
                        && host.parse::<IpAddr>().ok()
                            == rule
                                .host
                                .trim_start_matches('[')
                                .trim_end_matches(']')
                                .parse::<IpAddr>()
                                .ok())
                    || rule.host.strip_prefix("*.").is_some_and(|suffix| {
                        host.len() > suffix.len() + 1 && host.ends_with(&format!(".{suffix}"))
                    }))
        })
    }
}
pub(super) struct Broker {
    socket: tokio::io::unix::AsyncFd<OwnedFd>,
    config: Config,
}
impl Broker {
    pub fn prepare(command: &mut tokio::process::Command, config: Config) -> Result<Self> {
        use std::os::fd::AsRawFd;
        config.validate()?;
        let (host, guest) = descriptors::pair().map_err(unavailable)?;
        super::io::inherit(command, guest, FD).map_err(unavailable)?;
        let socket = tokio::io::unix::AsyncFd::new(host).map_err(unavailable)?;
        debug_assert!(socket.as_raw_fd() >= 0);
        Ok(Self { socket, config })
    }
    pub async fn run(self, stop: CancellationToken) -> Result<()> {
        use std::os::fd::AsRawFd;
        let slots = Arc::new(tokio::sync::Semaphore::new(
            self.config.max_connections as usize,
        ));
        let mut tasks = tokio::task::JoinSet::new();
        loop {
            let incoming = async {
                loop {
                    let mut ready = self.socket.readable().await?;
                    match ready.try_io(|fd| descriptors::receive(fd.get_ref().as_raw_fd())) {
                        Ok(value) => return value,
                        Err(_) => continue,
                    }
                }
            };
            tokio::select! {biased;
                _=stop.cancelled()=>break,
                Some(_)=tasks.join_next(),if !tasks.is_empty()=>{},
                socket=incoming=>{
                    let socket=match socket{Ok(socket)=>socket,Err(error) if error.kind()==std::io::ErrorKind::UnexpectedEof=>break,Err(error)=>{tasks.abort_all();while tasks.join_next().await.is_some(){}return Err(unavailable(error));}};
                    let permit=slots.clone().try_acquire_owned();let config=self.config.clone();let stop=stop.clone();
                    tasks.spawn(async move {
                        let file=std::os::unix::net::UnixStream::from(socket);let _=file.set_nonblocking(true);
                        if let Ok(mut stream)=tokio::net::UnixStream::from_std(file) {
                            if let Ok(_permit)=permit {tokio::select!{_=stop.cancelled()=>{},_=proxy(&mut stream,&config)=>{}}}
                            else {let _=stream.write_all(b"HTTP/1.1 503 Service Unavailable\r\nConnection: close\r\nContent-Length: 0\r\n\r\n").await;}
                        }
                    });
                }
            }
        }
        tasks.abort_all();
        while tasks.join_next().await.is_some() {}
        Ok(())
    }
}
fn public_address(ip: IpAddr) -> bool {
    match ip {
        IpAddr::V4(v) => {
            let [a, b, c, _] = v.octets();
            !(v.is_private()
                || v.is_loopback()
                || v.is_link_local()
                || v.is_multicast()
                || v.is_broadcast()
                || v.is_unspecified()
                || a == 0
                || a >= 240
                || (a == 100 && (64..=127).contains(&b))
                || (a == 192 && b == 0)
                || (a == 192 && b == 88 && c == 99)
                || (a == 198 && (b == 18 || b == 19))
                || (a == 198 && b == 51 && c == 100)
                || (a == 203 && b == 0 && c == 113))
        }
        IpAddr::V6(v) => v
            .to_ipv4_mapped()
            .map(|v| public_address(IpAddr::V4(v)))
            .unwrap_or_else(|| {
                let segments = v.segments();
                segments[0] & 0xe000 == 0x2000
                    && !(segments[0] == 0x2001 && (segments[1] < 0x200 || segments[1] == 0xdb8))
                    && segments[0] != 0x2002
                    && !(segments[0] == 0x3fff && segments[1] < 0x1000)
            }),
    }
}
async fn connect(config: &Config, host: &str, port: u16) -> std::io::Result<tokio::net::TcpStream> {
    let rule = config.destination(host, port).ok_or_else(|| {
        std::io::Error::new(
            std::io::ErrorKind::PermissionDenied,
            "destination not allowed",
        )
    })?;
    let addresses = tokio::net::lookup_host((host, port))
        .await?
        .collect::<Vec<SocketAddr>>();
    let mut last = None;
    for address in addresses {
        if address.ip().is_unspecified()
            || address.ip().is_multicast()
            || (!rule.allow_private && !public_address(address.ip()))
        {
            continue;
        }
        // Connect the verified numeric address; do not resolve a second time.
        match tokio::time::timeout(
            Duration::from_secs(5),
            tokio::net::TcpStream::connect(address),
        )
        .await
        {
            Ok(Ok(stream)) => return Ok(stream),
            Ok(Err(error)) => last = Some(error),
            Err(_) => {
                last = Some(std::io::Error::new(
                    std::io::ErrorKind::TimedOut,
                    "destination connect timeout",
                ))
            }
        }
    }
    Err(last.unwrap_or_else(|| {
        std::io::Error::new(
            std::io::ErrorKind::PermissionDenied,
            "resolved addresses are forbidden",
        )
    }))
}
async fn proxy(client: &mut tokio::net::UnixStream, config: &Config) -> std::io::Result<()> {
    let idle = Duration::from_millis(config.idle_timeout_ms);
    let operation = async {
        let mut header = Vec::new();
        let mut buffer = [0u8; 4096];
        let end = loop {
            if let Some(end) = header.windows(4).position(|v| v == b"\r\n\r\n") {
                break end + 4;
            }
            if header.len() >= 16384 {
                return Err(std::io::Error::other("proxy header exceeds 16 KiB"));
            }
            let n = tokio::time::timeout(idle, client.read(&mut buffer))
                .await
                .map_err(|_| {
                    std::io::Error::new(std::io::ErrorKind::TimedOut, "proxy header timeout")
                })??;
            if n == 0 {
                return Ok(());
            }
            header.extend_from_slice(&buffer[..n]);
        };
        if end > 16384 {
            return Err(std::io::Error::other("proxy header exceeds 16 KiB"));
        }
        let head = std::str::from_utf8(&header[..end])
            .map_err(|_| std::io::Error::other("invalid proxy header"))?;
        let mut lines = head.split("\r\n");
        let first = lines.next().unwrap_or("");
        let parts = first.split(' ').collect::<Vec<_>>();
        if parts.len() != 3 || !matches!(parts[2], "HTTP/1.0" | "HTTP/1.1") {
            return Err(std::io::Error::other("invalid proxy request line"));
        }
        let (host, port, request) = if parts[0] == "CONNECT" {
            let authority = parts[1]
                .parse::<axum::http::uri::Authority>()
                .map_err(|_| std::io::Error::other("invalid CONNECT authority"))?;
            if authority.as_str().contains('@') {
                return Err(std::io::Error::other("CONNECT credentials forbidden"));
            }
            let port = authority
                .port_u16()
                .ok_or_else(|| std::io::Error::other("CONNECT requires explicit port"))?;
            (
                authority
                    .host()
                    .trim_matches(['[', ']'])
                    .to_ascii_lowercase(),
                port,
                None,
            )
        } else {
            let url = url::Url::parse(parts[1])
                .map_err(|_| std::io::Error::other("HTTP proxy requires absolute URI"))?;
            if url.scheme() != "http"
                || !url.username().is_empty()
                || url.password().is_some()
                || url.fragment().is_some()
            {
                return Err(std::io::Error::other("invalid HTTP proxy URL"));
            }
            let host = url
                .host_str()
                .ok_or_else(|| std::io::Error::other("proxy host missing"))?
                .trim_matches(['[', ']'])
                .to_ascii_lowercase();
            let port = url
                .port_or_known_default()
                .ok_or_else(|| std::io::Error::other("proxy port missing"))?;
            let path = format!(
                "{}{}",
                url.path(),
                url.query().map(|q| format!("?{q}")).unwrap_or_default()
            );
            let mut request = format!(
                "{} {} {}\r\nHost: {}\r\nConnection: close\r\n",
                parts[0],
                path,
                parts[2],
                &url[url::Position::BeforeHost..url::Position::AfterPort]
            );
            for line in lines.filter(|line| !line.is_empty()) {
                if line.starts_with([' ', '\t'])
                    || line.chars().any(|c| c.is_control() && c != '\t')
                {
                    return Err(std::io::Error::other("invalid proxy header field"));
                }
                let (name, _) = line
                    .split_once(':')
                    .ok_or_else(|| std::io::Error::other("invalid proxy header field"))?;
                if !matches!(
                    name.to_ascii_lowercase().as_str(),
                    "host" | "connection" | "proxy-connection" | "proxy-authorization"
                ) {
                    request.push_str(line);
                    request.push_str("\r\n");
                }
            }
            request.push_str("\r\n");
            (host, port, Some(request.into_bytes()))
        };
        let mut remote = match tokio::time::timeout(idle, connect(config, &host, port)).await {
            Ok(Ok(stream)) => stream,
            _ => {
                client
                    .write_all(
                        b"HTTP/1.1 403 Forbidden\r\nConnection: close\r\nContent-Length: 0\r\n\r\n",
                    )
                    .await?;
                return Ok(());
            }
        };
        if let Some(request) = request {
            remote.write_all(&request).await?;
        } else {
            client
                .write_all(b"HTTP/1.1 200 Connection Established\r\n\r\n")
                .await?;
        }
        if end < header.len() {
            remote.write_all(&header[end..]).await?;
        }
        let count = Arc::new(std::sync::atomic::AtomicU64::new(header.len() as u64));
        let (cr, cw) = client.split();
        let (rr, rw) = remote.split();
        tokio::try_join!(
            copy(cr, rw, count.clone(), config.max_bytes_per_connection, idle),
            copy(rr, cw, count, config.max_bytes_per_connection, idle)
        )?;
        Ok(())
    };
    tokio::time::timeout(Duration::from_secs(600), operation)
        .await
        .map_err(|_| {
            std::io::Error::new(
                std::io::ErrorKind::TimedOut,
                "proxy connection lifetime exceeded",
            )
        })?
}
async fn copy(
    mut read: impl tokio::io::AsyncRead + Unpin,
    mut write: impl tokio::io::AsyncWrite + Unpin,
    count: Arc<std::sync::atomic::AtomicU64>,
    limit: u64,
    idle: Duration,
) -> std::io::Result<()> {
    let mut buffer = [0; 8192];
    loop {
        let n = tokio::time::timeout(idle, read.read(&mut buffer))
            .await
            .map_err(|_| {
                std::io::Error::new(std::io::ErrorKind::TimedOut, "proxy idle timeout")
            })??;
        if n == 0 {
            return write.shutdown().await;
        }
        if count
            .fetch_add(n as u64, std::sync::atomic::Ordering::Relaxed)
            .saturating_add(n as u64)
            > limit
        {
            return Err(std::io::Error::other(
                "proxy connection byte limit exceeded",
            ));
        }
        tokio::time::timeout(idle, write.write_all(&buffer[..n]))
            .await
            .map_err(|_| {
                std::io::Error::new(std::io::ErrorKind::TimedOut, "proxy write timeout")
            })??;
    }
}
