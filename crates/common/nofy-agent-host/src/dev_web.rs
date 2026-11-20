//! Opt-in development listener for the built frontend and its in-process API.
use crate::{HostError, KernelHost, auth::Authorizer};
use axum::{
    Router,
    extract::{ConnectInfo, Request, State},
    http::{HeaderValue, Method, Uri, header},
    middleware::{self, Next},
    response::{IntoResponse, Response},
    routing::get,
};
use std::{
    net::SocketAddr,
    path::{Component, Path, PathBuf},
    sync::Arc,
};
use tokio::net::TcpListener;
use tokio_util::sync::CancellationToken;

pub struct DevWeb {
    listener: TcpListener,
    router: Router,
}

struct Origins {
    loopback: [String; 4],
    extra: Option<String>,
}

pub async fn bind(
    host: &KernelHost,
    dist: &Path,
    address: SocketAddr,
    extra_origin: Option<&str>,
) -> Result<DevWeb, Box<dyn std::error::Error>> {
    if !address.ip().is_loopback() && extra_origin.is_none() {
        return Err("--dev-web-origin is required for a non-loopback development listener".into());
    }
    let dist = tokio::fs::canonicalize(dist).await?;
    if !tokio::fs::read_to_string(dist.join("index.html"))
        .await?
        .contains("</head>")
    {
        return Err("development frontend index.html is missing </head>".into());
    }
    let listener = TcpListener::bind(address).await?;
    let address = listener.local_addr()?;
    let port = address.port();
    if let Some(origin) = extra_origin {
        let url = url::Url::parse(origin)?;
        if url.scheme() != "http"
            || url.origin().ascii_serialization() != origin
            || url.port_or_known_default() != Some(port)
        {
            return Err(
                "--dev-web-origin must be an HTTP origin matching the listener port".into(),
            );
        }
    }
    let origins = Arc::new(Origins {
        loopback: [
            format!("http://127.0.0.1:{port}"),
            format!("http://[::1]:{port}"),
            format!("http://localhost:{port}"),
            if address.ip().is_loopback() {
                format!("http://{address}")
            } else {
                format!("http://127.0.0.1:{port}")
            },
        ],
        extra: extra_origin.map(str::to_owned),
    });
    let mut local = host.clone();
    local.auth = Arc::new(Authorizer::development());
    let router = local
        .router()
        .fallback_service(get(move |uri| static_file(dist.clone(), uri)))
        .layer(middleware::from_fn_with_state(origins, check_request));
    eprintln!("Nofy development Web listening on http://{address}");
    Ok(DevWeb { listener, router })
}

impl DevWeb {
    pub async fn serve(self, shutdown: CancellationToken) -> std::io::Result<()> {
        axum::serve(
            self.listener,
            self.router
                .into_make_service_with_connect_info::<SocketAddr>(),
        )
        .with_graceful_shutdown(shutdown.cancelled_owned())
        .await
    }
}

async fn check_request(
    State(origins): State<Arc<Origins>>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    request: Request,
    next: Next,
) -> Response {
    let headers = request.headers();
    let Some(authority) = headers
        .get(header::HOST)
        .and_then(|value| value.to_str().ok())
    else {
        return HostError::Forbidden.into_response();
    };
    let origin = format!("http://{authority}");
    if !(origins.extra.as_deref() == Some(&origin)
        || peer.ip().to_canonical().is_loopback() && origins.loopback.contains(&origin))
    {
        return HostError::Forbidden.into_response();
    }
    let path = request.uri().path();
    if path.starts_with("/api/") {
        let request_origin = headers.get(header::ORIGIN);
        let same_origin = request_origin.is_some_and(|value| *value == origin);
        if (request_origin.is_some() && !same_origin)
            || (*request.method() != Method::GET && !same_origin)
            || headers
                .get("sec-fetch-site")
                .is_some_and(|value| value != "same-origin" && value != "none")
        {
            return HostError::Forbidden.into_response();
        }
        if !conversation_route(request.method(), path) {
            return HostError::NotFound.into_response();
        }
    }
    let mut response = next.run(request).await;
    let headers = response.headers_mut();
    headers.insert(
        header::X_CONTENT_TYPE_OPTIONS,
        HeaderValue::from_static("nosniff"),
    );
    headers.insert(
        header::REFERRER_POLICY,
        HeaderValue::from_static("no-referrer"),
    );
    headers.insert(
        header::CONTENT_SECURITY_POLICY,
        HeaderValue::from_static("default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"),
    );
    response
}

fn conversation_route(method: &Method, path: &str) -> bool {
    let Some(path) = path.strip_prefix("/api/v1/") else {
        return false;
    };
    let segments: Vec<_> = path.split('/').collect();
    matches!(
        (method, segments.as_slice()),
        (
            &Method::GET,
            ["access"
                | "protocol"
                | "sessions"
                | "modules"
                | "module-repositories"
                | "module-packages"]
                | ["workspace", "changes"]
                | ["composer", "models"]
                | ["systems", "main-agent", "active"]
                | ["releases", _, "programs"]
                | ["sessions" | "actions" | "runs", _]
                | ["sessions", _, "turns"]
                | ["sessions", _, "commands" | "turns", _]
                | ["runs", _, "approvals" | "events" | "stream"]
                | ["runs", _, "recovery", "humans"]
                | ["runs", _, "inputs", _]
                | ["module-repositories", _]
                | ["module-packages", _]
                | ["module-repositories", _, "packages", _, _]
        ) | (
            &Method::POST,
            ["sessions", "start"]
                | ["sessions", _, "turns" | "archive" | "unarchive"]
                | ["runs", _, "inputs" | "cancel" | "approvals"]
                | ["actions"]
                | ["modules", "dependencies"]
                | ["composer", "model"]
                | ["module-repositories", _, "packages"]
                | ["module-repositories", _, "packages", _, _, "yank"]
        ) | (&Method::PATCH, ["sessions", _, "metadata"])
          | (&Method::PUT | &Method::DELETE, ["module-repositories", _])
    )
}

async fn static_file(dist: PathBuf, uri: Uri) -> Result<Response, HostError> {
    let path = match uri.path() {
        "/" | "/index.html" => "index.html",
        path if path.starts_with("/assets/") => &path[1..],
        _ => return Err(HostError::NotFound),
    };
    let relative = Path::new(path);
    if path.contains(['%', '\\'])
        || !relative
            .components()
            .all(|part| matches!(part, Component::Normal(_)))
    {
        return Err(HostError::NotFound);
    }
    let file = tokio::fs::canonicalize(dist.join(relative))
        .await
        .map_err(|_| HostError::NotFound)?;
    if !file.starts_with(&dist) {
        return Err(HostError::NotFound);
    }
    let bytes = tokio::fs::read(file)
        .await
        .map_err(|_| HostError::NotFound)?;
    let (mime, bytes) = match relative.extension().and_then(|ext| ext.to_str()) {
        Some("html") if path == "index.html" => {
            let html = String::from_utf8(bytes)
                .map_err(|_| HostError::Unavailable("invalid development frontend HTML".into()))?;
            let html = html.replacen(
                "</head>",
                "<meta name=\"nofy-dev-web\" content=\"nofy.dev-web/v1\"></head>",
                1,
            );
            ("text/html; charset=utf-8", html.into_bytes())
        }
        Some("js") => ("text/javascript; charset=utf-8", bytes),
        Some("css") => ("text/css; charset=utf-8", bytes),
        Some("svg") => ("image/svg+xml", bytes),
        Some("woff2") => ("font/woff2", bytes),
        _ => return Err(HostError::NotFound),
    };
    Ok((
        [
            (header::CONTENT_TYPE, mime),
            (header::CACHE_CONTROL, "no-store"),
        ],
        bytes,
    )
        .into_response())
}
