//! The guest has only loopback. Only this host broker owns outbound sockets.
use super::*;
use std::{
    collections::BTreeSet,
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
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Destination {
    pub host: String,
    pub ports: BTreeSet<u16>,
    #[serde(default)]
    pub allow_private: bool,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct Config {
    pub allowed: Vec<Destination>,
    pub max_connections: u16,
    pub max_bytes_per_connection: u64,
    pub idle_timeout_ms: u64,
}
impl Default for Config {
    fn default() -> Self {
        Self {
            allowed: vec![],
            max_connections: 16,
            max_bytes_per_connection: 16 * 1024 * 1024,
            idle_timeout_ms: 30000,
        }
    }
}
fn invalid() -> HostError {
    HostError::Invalid("invalid network proxy policy".into())
}
impl Config {
    pub fn validate(&self) -> Result<()> {
        if self.allowed.is_empty()
            || self.allowed.len() > 64
            || !(1..=32).contains(&self.max_connections)
            || !(1024..=1024 * 1024 * 1024).contains(&self.max_bytes_per_connection)
            || !(100..=120000).contains(&self.idle_timeout_ms)
        {
            return Err(invalid());
        }
        let mut seen = BTreeSet::new();
        for rule in &self.allowed {
            let host = rule.host.strip_prefix("*.").unwrap_or(&rule.host);
            if host.is_empty()
                || host.len() > 253
                || host != host.to_ascii_lowercase()
                || host.ends_with('.')
                || host.chars().any(|c| c.is_whitespace() || c.is_control())
                || rule.ports.is_empty()
                || rule.ports.len() > 64
                || rule.ports.contains(&0)
                || !seen.insert(&rule.host)
                || (host
                    .trim_start_matches('[')
                    .trim_end_matches(']')
                    .parse::<IpAddr>()
                    .is_err()
                    && url::Host::parse(host).is_err())
                || (rule.host.starts_with("*.")
                    && (host.parse::<IpAddr>().is_ok() || !host.contains('.')))
            {
                return Err(invalid());
            }
        }
        Ok(())
    }
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
pub(in crate::loader) fn schema() -> Value {
    json!({"type":"object","additionalProperties":false,"required":["allowed"],"properties":{
        "allowed":{"type":"array","minItems":1,"maxItems":64,"items":{"type":"object","additionalProperties":false,"required":["host","ports"],"properties":{
            "host":{"type":"string","minLength":1,"maxLength":253},"ports":{"type":"array","uniqueItems":true,"minItems":1,"maxItems":64,"items":{"type":"integer","minimum":1,"maximum":65535}},"allow_private":{"type":"boolean"}}}},
        "max_connections":{"type":"integer","minimum":1,"maximum":32},"max_bytes_per_connection":{"type":"integer","minimum":1024,"maximum":1073741824},"idle_timeout_ms":{"type":"integer","minimum":100,"maximum":120000}}})
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
const CONNECT_ESTABLISHED: &[u8] = b"HTTP/1.1 200 Connection Established\r\n\r\n";

struct ParsedRequest {
    host: String,
    port: u16,
    request: Option<Vec<u8>>,
}

fn is_http_token(value: &str) -> bool {
    !value.is_empty()
        && value.bytes().all(|b| {
            b.is_ascii_alphanumeric()
                || matches!(
                    b,
                    b'!' | b'#'
                        | b'$'
                        | b'%'
                        | b'&'
                        | b'\''
                        | b'*'
                        | b'+'
                        | b'-'
                        | b'.'
                        | b'^'
                        | b'_'
                        | b'`'
                        | b'|'
                        | b'~'
                )
        })
}

fn parse_proxy_head(head: &str) -> std::io::Result<ParsedRequest> {
    let head = head
        .strip_suffix("\r\n\r\n")
        .ok_or_else(|| std::io::Error::other("invalid proxy header"))?;
    let mut lines = head.split("\r\n");
    let first = lines.next().unwrap_or("");
    if first.bytes().any(|b| b < 0x20 || b == 0x7f) {
        return Err(std::io::Error::other("invalid proxy request line"));
    }
    let parts = first.split(' ').collect::<Vec<_>>();
    if parts.len() != 3 || !is_http_token(parts[0]) || !matches!(parts[2], "HTTP/1.0" | "HTTP/1.1")
    {
        return Err(std::io::Error::other("invalid proxy request line"));
    }
    let mut headers = Vec::new();
    let mut has_transfer_encoding = false;
    let mut content_length_count = 0usize;
    for line in lines {
        if line.is_empty()
            || line.starts_with([' ', '\t'])
            || line.chars().any(|c| c.is_control() && c != '\t')
        {
            return Err(std::io::Error::other("invalid proxy header field"));
        }
        let (raw_name, value) = line
            .split_once(':')
            .ok_or_else(|| std::io::Error::other("invalid proxy header field"))?;
        let name = raw_name.trim();
        if !is_http_token(name) {
            return Err(std::io::Error::other("invalid proxy header field"));
        }
        let lower = name.to_ascii_lowercase();
        if lower == "transfer-encoding" {
            has_transfer_encoding = true;
        } else if lower == "content-length" {
            let trimmed_value = value.trim();
            if trimmed_value.is_empty()
                || !trimmed_value.bytes().all(|b| b.is_ascii_digit())
                || trimmed_value.parse::<u64>().is_err()
            {
                return Err(std::io::Error::other("invalid Content-Length header"));
            }
            content_length_count += 1;
        }
        headers.push((name, lower, value));
    }
    if content_length_count > 1 {
        return Err(std::io::Error::other("duplicate Content-Length header"));
    }
    if has_transfer_encoding && content_length_count > 0 {
        return Err(std::io::Error::other(
            "conflicting Transfer-Encoding and Content-Length headers",
        ));
    }
    if parts[0] == "CONNECT" {
        let authority = parts[1]
            .parse::<axum::http::uri::Authority>()
            .map_err(|_| std::io::Error::other("invalid CONNECT authority"))?;
        if authority.as_str().contains('@') {
            return Err(std::io::Error::other("CONNECT credentials forbidden"));
        }
        let port = authority
            .port_u16()
            .ok_or_else(|| std::io::Error::other("CONNECT requires explicit port"))?;
        return Ok(ParsedRequest {
            host: authority
                .host()
                .trim_matches(['[', ']'])
                .to_ascii_lowercase(),
            port,
            request: None,
        });
    }
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
    for (name, lower, value) in headers {
        if !matches!(
            lower.as_str(),
            "host" | "connection" | "proxy-connection" | "proxy-authorization"
        ) {
            request.push_str(name);
            request.push(':');
            request.push_str(value);
            request.push_str("\r\n");
        }
    }
    request.push_str("\r\n");
    Ok(ParsedRequest {
        host,
        port,
        request: Some(request.into_bytes()),
    })
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
            if (header.len() as u64) > config.max_bytes_per_connection {
                return Err(std::io::Error::other(
                    "proxy connection byte limit exceeded",
                ));
            }
        };
        if end > 16384 {
            return Err(std::io::Error::other("proxy header exceeds 16 KiB"));
        }
        let head = std::str::from_utf8(&header[..end])
            .map_err(|_| std::io::Error::other("invalid proxy header"))?;
        let parsed = parse_proxy_head(head)?;
        let trailing = &header[end..];
        let initial_bytes = if let Some(request) = &parsed.request {
            let written = (request.len() as u64).saturating_add(trailing.len() as u64);
            (header.len() as u64).max(written)
        } else {
            (header.len() as u64).saturating_add(CONNECT_ESTABLISHED.len() as u64)
        };
        if initial_bytes > config.max_bytes_per_connection {
            return Err(std::io::Error::other(
                "proxy connection byte limit exceeded",
            ));
        }
        let mut remote =
            match tokio::time::timeout(idle, connect(config, &parsed.host, parsed.port)).await {
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
        if let Some(request) = parsed.request {
            tokio::time::timeout(idle, remote.write_all(&request))
                .await
                .map_err(|_| {
                    std::io::Error::new(std::io::ErrorKind::TimedOut, "proxy write timeout")
                })??;
        } else {
            tokio::time::timeout(idle, client.write_all(CONNECT_ESTABLISHED))
                .await
                .map_err(|_| {
                    std::io::Error::new(std::io::ErrorKind::TimedOut, "proxy write timeout")
                })??;
        }
        if !trailing.is_empty() {
            tokio::time::timeout(idle, remote.write_all(trailing))
                .await
                .map_err(|_| {
                    std::io::Error::new(std::io::ErrorKind::TimedOut, "proxy write timeout")
                })??;
        }
        let count = Arc::new(std::sync::atomic::AtomicU64::new(initial_bytes));
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

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize, Ordering};

    fn local_config(port: u16, max_bytes_per_connection: u64) -> Config {
        Config {
            allowed: vec![Destination {
                host: "127.0.0.1".into(),
                ports: [port].into_iter().collect(),
                allow_private: true,
            }],
            max_connections: 4,
            max_bytes_per_connection,
            idle_timeout_ms: 5000,
        }
    }

    #[test]
    fn rejects_invalid_http_method_tokens_and_request_line_injection() {
        for bad in [
            "GET\nInjected: 1 http://127.0.0.1:8080/ HTTP/1.1\r\n\r\n",
            "GET\rInjected: 1 http://127.0.0.1:8080/ HTTP/1.1\r\n\r\n",
            "GET\t http://127.0.0.1:8080/ HTTP/1.1\r\n\r\n",
            "G\x00ET http://127.0.0.1:8080/ HTTP/1.1\r\n\r\n",
            "GET/1 http://127.0.0.1:8080/ HTTP/1.1\r\n\r\n",
            " http://127.0.0.1:8080/ HTTP/1.1\r\n\r\n",
            "GET http://127.0.0.1:8080/\nEvil HTTP/1.1\r\n\r\n",
            "CONNECT\nEvil 127.0.0.1:443 HTTP/1.1\r\n\r\n",
        ] {
            assert!(parse_proxy_head(bad).is_err(), "accepted: {bad:?}");
        }
        assert!(parse_proxy_head("GET http://127.0.0.1:8080/ok HTTP/1.1\r\n\r\n").is_ok());
        assert!(parse_proxy_head("MKCOL http://127.0.0.1:8080/ok HTTP/1.1\r\n\r\n").is_ok());
    }

    #[test]
    fn trims_header_names_before_filtering_and_rejects_smuggling() {
        // Spaced hop-by-hop and Host headers must be stripped after trim.
        let parsed = parse_proxy_head(
            "GET http://127.0.0.1:8080/path HTTP/1.1\r\n\
             Host : evil.example\r\n\
             Host\t: evil2.example\r\n\
             Connection : keep-alive\r\n\
             Proxy-Connection : keep-alive\r\n\
             Proxy-Authorization : Basic secret\r\n\
             X-Allowed : value\r\n\r\n",
        )
        .unwrap();
        let forwarded = String::from_utf8(parsed.request.unwrap()).unwrap();
        assert!(
            forwarded
                .starts_with("GET /path HTTP/1.1\r\nHost: 127.0.0.1:8080\r\nConnection: close\r\n")
        );
        assert!(!forwarded.contains("evil.example"), "{forwarded}");
        assert!(!forwarded.contains("evil2.example"), "{forwarded}");
        assert!(!forwarded.contains("keep-alive"), "{forwarded}");
        assert!(!forwarded.contains("secret"), "{forwarded}");
        assert!(forwarded.contains("X-Allowed: value\r\n"), "{forwarded}");

        // Invalid header field names must be rejected.
        for bad_header in [
            "GET http://127.0.0.1:8080/ HTTP/1.1\r\nBad Name: 1\r\n\r\n",
            "GET http://127.0.0.1:8080/ HTTP/1.1\r\n: value\r\n\r\n",
            "GET http://127.0.0.1:8080/ HTTP/1.1\r\nFoo\nBar: 1\r\n\r\n",
            "GET http://127.0.0.1:8080/ HTTP/1.1\r\n\tFolded: 1\r\n\r\n",
        ] {
            assert!(parse_proxy_head(bad_header).is_err(), "{bad_header:?}");
        }

        // Request smuggling combinations must be rejected.
        for smuggling in [
            "POST http://127.0.0.1:8080/ HTTP/1.1\r\nTransfer-Encoding: chunked\r\nContent-Length: 5\r\n\r\n",
            "POST http://127.0.0.1:8080/ HTTP/1.1\r\nContent-Length: 5\r\nTransfer-Encoding: chunked\r\n\r\n",
            "POST http://127.0.0.1:8080/ HTTP/1.1\r\nTransfer-Encoding : chunked\r\nContent-Length : 5\r\n\r\n",
            "POST http://127.0.0.1:8080/ HTTP/1.1\r\nContent-Length: 5\r\nContent-Length: 5\r\n\r\n",
            "POST http://127.0.0.1:8080/ HTTP/1.1\r\nContent-Length: 5\r\nContent-Length : 10\r\n\r\n",
            "POST http://127.0.0.1:8080/ HTTP/1.1\r\nContent-Length: 5, 5\r\n\r\n",
            "POST http://127.0.0.1:8080/ HTTP/1.1\r\nContent-Length: -1\r\n\r\n",
            "CONNECT 127.0.0.1:8080 HTTP/1.1\r\nTransfer-Encoding: chunked\r\nContent-Length: 0\r\n\r\n",
            "CONNECT 127.0.0.1:8080 HTTP/1.1\r\nContent-Length: 1\r\nContent-Length: 1\r\n\r\n",
        ] {
            assert!(
                parse_proxy_head(smuggling).is_err(),
                "accepted: {smuggling:?}"
            );
        }
    }

    #[tokio::test]
    async fn enforces_max_bytes_per_connection_including_initial_header_and_trailing_bytes() {
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let port = listener.local_addr().unwrap().port();
        let hits = Arc::new(AtomicUsize::new(0));
        let hits_clone = hits.clone();
        let server = tokio::spawn(async move {
            loop {
                let Ok((mut socket, _)) = listener.accept().await else {
                    break;
                };
                hits_clone.fetch_add(1, Ordering::SeqCst);
                tokio::spawn(async move {
                    let mut buf = [0u8; 2048];
                    let _ = socket.read(&mut buf).await;
                    let body = "r".repeat(512);
                    let resp = format!(
                        "HTTP/1.1 200 OK\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
                        body.len(),
                        body
                    );
                    let _ = socket.write_all(resp.as_bytes()).await;
                });
            }
        });

        let config = local_config(port, 1024);

        // 1. Initial header + trailing body exceeding 1024 bytes is rejected before upstream connect.
        let (mut client, mut broker_side) = tokio::net::UnixStream::pair().unwrap();
        let body = "A".repeat(1000);
        let oversized = format!(
            "POST http://127.0.0.1:{port}/upload HTTP/1.1\r\nContent-Length: {}\r\n\r\n{}",
            body.len(),
            body
        );
        assert!(oversized.len() > 1024);
        client.write_all(oversized.as_bytes()).await.unwrap();
        client.shutdown().await.unwrap();
        let err = proxy(&mut broker_side, &config).await.unwrap_err();
        assert!(err.to_string().contains("byte limit"), "{err}");
        assert_eq!(hits.load(Ordering::SeqCst), 0);

        // 2. Initial header + trailing body under 1024 counts against total budget, so a 512-byte
        // upstream response pushes total > 1024 and aborts the connection.
        let (mut client, mut broker_side) = tokio::net::UnixStream::pair().unwrap();
        let body = "B".repeat(600);
        let under = format!(
            "POST http://127.0.0.1:{port}/upload HTTP/1.1\r\nContent-Length: {}\r\n\r\n{}",
            body.len(),
            body
        );
        assert!(under.len() < 1024);
        let proxy_task = tokio::spawn(async move { proxy(&mut broker_side, &config).await });
        client.write_all(under.as_bytes()).await.unwrap();
        let mut response = Vec::new();
        let _ = client.read_to_end(&mut response).await;
        let err = proxy_task.await.unwrap().unwrap_err();
        assert!(err.to_string().contains("byte limit"), "{err}");
        assert_eq!(hits.load(Ordering::SeqCst), 1);

        // 3. CONNECT request with trailing payload exceeding 1024 bytes is rejected before connect.
        let config = local_config(port, 1024);
        let (mut client, mut broker_side) = tokio::net::UnixStream::pair().unwrap();
        let connect_req = format!(
            "CONNECT 127.0.0.1:{port} HTTP/1.1\r\nHost: 127.0.0.1:{port}\r\n\r\n{}",
            "C".repeat(1000)
        );
        client.write_all(connect_req.as_bytes()).await.unwrap();
        client.shutdown().await.unwrap();
        let err = proxy(&mut broker_side, &config).await.unwrap_err();
        assert!(err.to_string().contains("byte limit"), "{err}");
        assert_eq!(hits.load(Ordering::SeqCst), 1);

        server.abort();
    }
}
