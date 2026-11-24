use nofy_agent_runtime::Error;
use nofy_tool_runtime::ToolError;
use std::{
    net::{IpAddr, Ipv4Addr, Ipv6Addr, ToSocketAddrs},
    sync::Arc,
    time::Duration,
};

pub(crate) const CONNECT_TIMEOUT: Duration = Duration::from_secs(15);
pub(crate) const READ_TIMEOUT: Duration = Duration::from_secs(60);
pub(crate) const POOL_IDLE_TIMEOUT: Duration = Duration::from_secs(90);

pub(crate) fn base(value: &str) -> Result<reqwest::Url, Error> {
    let base = reqwest::Url::parse(value)
        .map_err(|_| crate::composition("invalid HTTP connection base"))?;
    if !matches!(base.scheme(), "http" | "https")
        || base.host_str().is_none()
        || !base.username().is_empty()
        || base.password().is_some()
        || base.query().is_some()
        || base.fragment().is_some()
        || !base.path().ends_with('/')
    {
        return Err(crate::composition(
            "HTTP base requires an http(s) directory URL without credentials, query or fragment",
        ));
    }
    Ok(base)
}

pub(crate) fn endpoint(base: &reqwest::Url, path: &str) -> Result<reqwest::Url, Error> {
    if path.starts_with('/') || path.contains(['?', '#', '\\', '%']) {
        return Err(crate::composition(
            "HTTP path must be relative without query or fragment",
        ));
    }
    let url = base
        .join(path)
        .map_err(|_| crate::composition("invalid HTTP tool path"))?;
    if url.origin() != base.origin()
        || !url.path().starts_with(base.path())
        || !url.username().is_empty()
        || url.password().is_some()
    {
        return Err(crate::composition(
            "HTTP tool path escapes admitted connection",
        ));
    }
    Ok(url)
}

pub(crate) fn parse_host_ip(host: &str) -> Option<IpAddr> {
    let stripped = host
        .strip_prefix('[')
        .and_then(|value| value.strip_suffix(']'))
        .unwrap_or(host);
    stripped.parse::<IpAddr>().ok()
}

pub(crate) fn is_loopback_url(url: &reqwest::Url) -> bool {
    let Some(host) = url.host_str() else {
        return false;
    };
    if host.eq_ignore_ascii_case("localhost") {
        return true;
    }
    match parse_host_ip(host) {
        Some(IpAddr::V4(v4)) => v4.is_loopback(),
        Some(IpAddr::V6(v6)) => v6.is_loopback(),
        None => false,
    }
}

fn is_blocked_non_loopback_v4(v4: Ipv4Addr) -> bool {
    let [a, b, ..] = v4.octets();
    v4.is_private()
        || v4.is_link_local()
        || v4.is_unspecified()
        || a == 0
        || (a == 100 && (64..=127).contains(&b))
        || v4.is_broadcast()
        || v4.is_multicast()
        || v4.is_documentation()
        || a >= 240
}

fn is_blocked_non_loopback_v6(v6: Ipv6Addr) -> bool {
    let segments = v6.segments();
    let seg0 = segments[0];
    v6.is_unspecified()
        || v6.is_multicast()
        || (seg0 & 0xfe00) == 0xfc00
        || (seg0 & 0xffc0) == 0xfe80
        || (seg0 & 0xffc0) == 0xfec0
        || (seg0 == 0x2001 && segments[1] == 0x0db8)
}

pub(crate) fn ip_allowed(ip: IpAddr, allow_loopback: bool, allow_private_networks: bool) -> bool {
    if allow_private_networks {
        return true;
    }
    match ip {
        IpAddr::V4(v4) => {
            if v4.is_loopback() {
                allow_loopback
            } else {
                !is_blocked_non_loopback_v4(v4)
            }
        }
        IpAddr::V6(v6) => {
            if let Some(v4) = v6.to_ipv4_mapped() {
                if v4.is_loopback() {
                    allow_loopback
                } else {
                    !is_blocked_non_loopback_v4(v4)
                }
            } else if v6.is_loopback() {
                allow_loopback
            } else {
                !is_blocked_non_loopback_v6(v6)
            }
        }
    }
}

pub(crate) fn validate_network_policy(
    url: &reqwest::Url,
    has_credentials: bool,
    allow_insecure_http: bool,
    allow_private_networks: bool,
) -> Result<(), Error> {
    if has_credentials && url.scheme() == "http" && !is_loopback_url(url) && !allow_insecure_http {
        return Err(crate::composition(
            "sending credentials over plain HTTP to non-loopback hosts requires explicit allow_insecure_http",
        ));
    }
    if let Some(host) = url.host_str()
        && let Some(ip) = parse_host_ip(host)
        && !ip_allowed(ip, is_loopback_url(url), allow_private_networks)
    {
        return Err(crate::composition(
            "HTTP target IP is blocked by private/link-local network policy",
        ));
    }
    Ok(())
}

pub(crate) fn validate_runtime_request(
    url: &reqwest::Url,
    sending_credentials: bool,
    allow_insecure_http: bool,
    allow_private_networks: bool,
) -> Result<(), ToolError> {
    if sending_credentials
        && url.scheme() == "http"
        && !is_loopback_url(url)
        && !allow_insecure_http
    {
        return Err(crate::tool_error(
            "insecure_transport",
            "sending credentials over plain HTTP to non-loopback hosts requires explicit allow_insecure_http",
        ));
    }
    if let Some(host) = url.host_str()
        && let Some(ip) = parse_host_ip(host)
        && !ip_allowed(ip, is_loopback_url(url), allow_private_networks)
    {
        return Err(crate::tool_error(
            "ssrf_blocked",
            "HTTP target IP is blocked by private/link-local network policy",
        ));
    }
    Ok(())
}

pub(crate) struct GuardedResolver {
    allow_loopback: bool,
    allow_private_networks: bool,
}

impl reqwest::dns::Resolve for GuardedResolver {
    fn resolve(&self, name: reqwest::dns::Name) -> reqwest::dns::Resolving {
        let host = name.as_str().to_owned();
        let allow_loopback = self.allow_loopback;
        let allow_private_networks = self.allow_private_networks;
        Box::pin(async move {
            let resolved = tokio::task::spawn_blocking(move || {
                (host.as_str(), 0u16)
                    .to_socket_addrs()
                    .map(|addrs| addrs.collect::<Vec<_>>())
            })
            .await
            .map_err(|error| Box::new(error) as Box<dyn std::error::Error + Send + Sync>)?
            .map_err(|error| Box::new(error) as Box<dyn std::error::Error + Send + Sync>)?;
            if resolved.is_empty() {
                return Err(Box::new(std::io::Error::new(
                    std::io::ErrorKind::AddrNotAvailable,
                    "DNS resolution returned no addresses",
                ))
                    as Box<dyn std::error::Error + Send + Sync>);
            }
            if resolved
                .iter()
                .any(|addr| !ip_allowed(addr.ip(), allow_loopback, allow_private_networks))
            {
                return Err(Box::new(std::io::Error::new(
                    std::io::ErrorKind::PermissionDenied,
                    "resolved IP address is blocked by network policy",
                ))
                    as Box<dyn std::error::Error + Send + Sync>);
            }
            let addrs: reqwest::dns::Addrs = Box::new(resolved.into_iter());
            Ok(addrs)
        })
    }
}

pub(crate) fn build_client(
    base: &reqwest::Url,
    allow_private_networks: bool,
    no_retry: bool,
) -> Result<reqwest::Client, reqwest::Error> {
    let resolver = Arc::new(GuardedResolver {
        allow_loopback: is_loopback_url(base),
        allow_private_networks,
    });
    let mut builder = reqwest::Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .no_proxy()
        .connect_timeout(CONNECT_TIMEOUT)
        .read_timeout(READ_TIMEOUT)
        .pool_idle_timeout(POOL_IDLE_TIMEOUT)
        .dns_resolver(resolver);
    if no_retry {
        builder = builder.retry(reqwest::retry::never());
    }
    builder.build()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ip_policy_blocks_metadata_private_unspecified_and_mapped_addresses() {
        for blocked in [
            "169.254.169.254",
            "10.0.0.1",
            "172.16.0.1",
            "192.168.1.10",
            "100.64.0.1",
            "0.0.0.0",
            "224.0.0.1",
            "255.255.255.255",
            "fe80::1",
            "fc00::1",
            "fd12:3456::1",
            "::",
            "::ffff:169.254.169.254",
            "::ffff:10.0.0.1",
        ] {
            let ip: IpAddr = blocked.parse().unwrap();
            assert!(!ip_allowed(ip, false, false), "{blocked}");
            assert!(!ip_allowed(ip, true, false), "{blocked} with loopback");
            assert!(ip_allowed(ip, false, true), "{blocked} with opt-in");
        }
        for loopback in ["127.0.0.1", "::1", "::ffff:127.0.0.1"] {
            let ip: IpAddr = loopback.parse().unwrap();
            assert!(
                !ip_allowed(ip, false, false),
                "{loopback} non-loopback host"
            );
            assert!(ip_allowed(ip, true, false), "{loopback} loopback host");
        }
        let public: IpAddr = "93.184.216.34".parse().unwrap();
        assert!(ip_allowed(public, false, false));
    }

    #[test]
    fn credential_transport_rejects_non_loopback_plaintext_http_by_default() {
        let remote_http = reqwest::Url::parse("http://example.invalid/api/").unwrap();
        assert!(validate_network_policy(&remote_http, true, false, false).is_err());
        assert!(validate_network_policy(&remote_http, false, false, false).is_ok());
        assert!(validate_network_policy(&remote_http, true, true, false).is_ok());

        let local_http = reqwest::Url::parse("http://127.0.0.1:8080/api/").unwrap();
        assert!(validate_network_policy(&local_http, true, false, false).is_ok());

        let remote_https = reqwest::Url::parse("https://example.invalid/api/").unwrap();
        assert!(validate_network_policy(&remote_https, true, false, false).is_ok());

        let metadata = reqwest::Url::parse("http://169.254.169.254/latest/").unwrap();
        assert!(validate_network_policy(&metadata, false, false, false).is_err());
        assert!(validate_network_policy(&metadata, false, false, true).is_ok());
    }
}
