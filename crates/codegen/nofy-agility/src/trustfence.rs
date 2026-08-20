//! The /api browser trust fence (FR5.4, DS-#22): four layers.
//!
//! A browser-facing API is a DNS-rebinding and cross-site-request target.
//! The fence checks, in order:
//!
//! 1. **Host normalization** — lowercase, strip port; the host must be in
//!    the allowlist (a rebinded host is not);
//! 2. **Sec-Fetch-Site** — browser-initiated requests must be
//!    `same-origin` or `same-site` (or absent for non-browser clients);
//!    `cross-site` is refused;
//! 3. **Origin** — when present, it must match the normalized host;
//! 4. **Forwarded consistency** — an `X-Forwarded-Host` that disagrees
//!    with Host is proxy confusion: refuse.
//!
//! Any layer failing refuses the whole request (fail-closed).

/// The request header set the fence inspects.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct RequestHeaders {
    pub host: Option<String>,
    pub sec_fetch_site: Option<String>,
    pub origin: Option<String>,
    pub forwarded_host: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum FenceVerdict {
    Allowed,
    Refused { layer: u8, reason: String },
}

/// Normalize a host: lowercase + strip port.
pub fn normalize_host(host: &str) -> String {
    let lower = host.trim().to_ascii_lowercase();
    match lower.rsplit_once(':') {
        Some((name, port)) if port.chars().all(|c| c.is_ascii_digit()) => name.to_string(),
        _ => lower,
    }
}

/// Extract the host part of an Origin value (`scheme://host[:port]`).
fn origin_host(origin: &str) -> Option<String> {
    let after_scheme = origin.split_once("://")?.1;
    Some(normalize_host(after_scheme.split('/').next()?))
}

/// Run the four-layer fence.
pub fn check(headers: &RequestHeaders, allowed_hosts: &[String]) -> FenceVerdict {
    // Layer 1: Host must exist, normalize, and be allowlisted.
    let Some(raw_host) = &headers.host else {
        return FenceVerdict::Refused {
            layer: 1,
            reason: "missing Host header".into(),
        };
    };
    let host = normalize_host(raw_host);
    if !allowed_hosts.iter().any(|allowed| normalize_host(allowed) == host) {
        return FenceVerdict::Refused {
            layer: 1,
            reason: format!("host '{host}' not allowlisted (DNS-rebinding defense)"),
        };
    }

    // Layer 2: Sec-Fetch-Site.
    if let Some(site) = &headers.sec_fetch_site {
        let site = site.to_ascii_lowercase();
        if site != "same-origin" && site != "same-site" && site != "none" {
            return FenceVerdict::Refused {
                layer: 2,
                reason: format!("Sec-Fetch-Site: {site}"),
            };
        }
    }

    // Layer 3: Origin must match Host when present.
    if let Some(origin) = &headers.origin {
        match origin_host(origin) {
            Some(origin_host) if origin_host == host => {}
            _ => {
                return FenceVerdict::Refused {
                    layer: 3,
                    reason: format!("Origin '{origin}' does not match Host '{host}'"),
                };
            }
        }
    }

    // Layer 4: forwarded consistency.
    if let Some(forwarded) = &headers.forwarded_host {
        if normalize_host(forwarded) != host {
            return FenceVerdict::Refused {
                layer: 4,
                reason: "X-Forwarded-Host disagrees with Host (proxy confusion)".into(),
            };
        }
    }

    FenceVerdict::Allowed
}

#[cfg(test)]
mod tests {
    use super::*;

    fn allowed() -> Vec<String> {
        vec!["localhost".into(), "nofy.internal".into()]
    }

    fn same_origin(host: &str) -> RequestHeaders {
        RequestHeaders {
            host: Some(host.into()),
            sec_fetch_site: Some("same-origin".into()),
            origin: Some(format!("http://{host}")),
            forwarded_host: None,
        }
    }

    #[test]
    fn same_origin_request_passes_all_layers() {
        assert_eq!(check(&same_origin("localhost"), &allowed()), FenceVerdict::Allowed);
        assert_eq!(check(&same_origin("localhost:8080"), &allowed()), FenceVerdict::Allowed);
    }

    #[test]
    fn dns_rebinding_refused_at_layer_1() {
        // Attacker rebinds their domain to our address: Host is not
        // allowlisted.
        let headers = same_origin("attacker.example");
        assert!(matches!(
            check(&headers, &allowed()),
            FenceVerdict::Refused { layer: 1, reason } if reason.contains("rebinding")
        ));
    }

    #[test]
    fn cross_site_fetch_refused_at_layer_2() {
        let mut headers = same_origin("localhost");
        headers.sec_fetch_site = Some("cross-site".into());
        assert!(matches!(
            check(&headers, &allowed()),
            FenceVerdict::Refused { layer: 2, .. }
        ));
    }

    #[test]
    fn mismatched_origin_refused_at_layer_3() {
        let mut headers = same_origin("localhost");
        headers.origin = Some("http://evil.example".into());
        assert!(matches!(
            check(&headers, &allowed()),
            FenceVerdict::Refused { layer: 3, .. }
        ));
    }

    #[test]
    fn proxy_confusion_refused_at_layer_4() {
        let mut headers = same_origin("localhost");
        headers.forwarded_host = Some("other-host".into());
        assert!(matches!(
            check(&headers, &allowed()),
            FenceVerdict::Refused { layer: 4, .. }
        ));
    }

    #[test]
    fn matching_forwarded_host_passes_layer_4() {
        // A proxy forwarding the same host (here with port spelling) is
        // consistent, not confused: normalization makes it match.
        let mut headers = same_origin("localhost");
        headers.forwarded_host = Some("LOCALHOST:8080".into());
        assert_eq!(check(&headers, &allowed()), FenceVerdict::Allowed);
    }

    #[test]
    fn missing_host_refused() {
        let headers = RequestHeaders::default();
        assert!(matches!(
            check(&headers, &allowed()),
            FenceVerdict::Refused { layer: 1, .. }
        ));
    }

    #[test]
    fn non_browser_client_without_fetch_headers_passes() {
        let headers = RequestHeaders {
            host: Some("nofy.internal".into()),
            sec_fetch_site: None,
            origin: None,
            forwarded_host: None,
        };
        assert_eq!(check(&headers, &allowed()), FenceVerdict::Allowed);
    }
}
