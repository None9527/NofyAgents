//! Opt-in development listener for the built frontend and its in-process API.
use crate::{
    HostError, KernelHost,
    auth::{Authorizer, Scope, ct_eq_digest},
};
use axum::{
    Json, Router,
    body::Bytes,
    extract::{ConnectInfo, DefaultBodyLimit, Request, State},
    http::{HeaderMap, HeaderValue, Method, StatusCode, Uri, header},
    middleware::{self, Next},
    response::{IntoResponse, Response},
    routing::{get, post},
};
use base64::Engine;
use serde::Deserialize;
use serde_json::json;
use sha2::{Digest, Sha256};
use std::{
    collections::{BTreeSet, VecDeque, hash_map::RandomState},
    hash::BuildHasher,
    io::Read,
    net::SocketAddr,
    path::{Component, Path, PathBuf},
    sync::{
        Arc, Mutex,
        atomic::{AtomicU64, Ordering},
    },
    time::{Duration, Instant, SystemTime, UNIX_EPOCH},
};
use tokio::net::TcpListener;
use tokio_util::sync::CancellationToken;
use zeroize::Zeroizing;

const SESSION_COOKIE_NAME: &str = "nofy_session";
const CSRF_HEADER_NAME: &str = "x-nofy-csrf";
const MAX_SESSIONS: usize = 64;
const SESSION_TTL: Duration = Duration::from_secs(12 * 60 * 60);
const LOCAL_AUTH_BODY_LIMIT: usize = 16 * 1024;
const CSP_HEADER: &str = "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'";

pub struct DevWeb {
    listener: TcpListener,
    router: Router,
    launch_ticket: Zeroizing<String>,
}

struct Origins {
    loopback: [String; 4],
    extra: Option<String>,
}

struct SessionRecord {
    id_digest: [u8; 32],
    csrf_token: Zeroizing<String>,
    csrf_digest: [u8; 32],
    expires_at: Instant,
}

struct SessionState {
    launch_ticket_digest: Option<[u8; 32]>,
    sessions: VecDeque<SessionRecord>,
}

struct SessionStore {
    state: Mutex<SessionState>,
    max_sessions: usize,
    ttl: Duration,
}

struct RequestGuard {
    origins: Origins,
    sessions: Arc<SessionStore>,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct BootstrapRequest {
    ticket: String,
}

impl SessionStore {
    fn new(launch_ticket: &str) -> Self {
        Self::with_limits(launch_ticket, MAX_SESSIONS, SESSION_TTL)
    }

    fn with_limits(launch_ticket: &str, max_sessions: usize, ttl: Duration) -> Self {
        let digest: [u8; 32] = Sha256::digest(launch_ticket.as_bytes()).into();
        Self {
            state: Mutex::new(SessionState {
                launch_ticket_digest: Some(digest),
                sessions: VecDeque::new(),
            }),
            max_sessions,
            ttl,
        }
    }

    fn prune_expired(state: &mut SessionState, now: Instant) {
        state.sessions.retain(|record| record.expires_at > now);
    }

    fn bootstrap(&self, candidate_ticket: &str) -> Result<(Zeroizing<String>, String), HostError> {
        if candidate_ticket.is_empty() || candidate_ticket.len() > 4096 {
            return Err(HostError::Unauthorized);
        }
        let candidate_digest: [u8; 32] = Sha256::digest(candidate_ticket.as_bytes()).into();
        let now = Instant::now();
        let mut state = self
            .state
            .lock()
            .map_err(|_| HostError::Unavailable("session store unavailable".into()))?;
        Self::prune_expired(&mut state, now);
        let Some(expected) = state.launch_ticket_digest else {
            return Err(HostError::Unauthorized);
        };
        if ct_eq_digest(&expected, &candidate_digest) != 1 {
            return Err(HostError::Unauthorized);
        }
        state.launch_ticket_digest = None;
        let session_id =
            random_token().map_err(|e| HostError::Unavailable(format!("entropy failed: {e}")))?;
        let csrf_token =
            random_token().map_err(|e| HostError::Unavailable(format!("entropy failed: {e}")))?;
        let csrf_public = (*csrf_token).clone();
        Self::insert_record(
            &mut state,
            self.max_sessions,
            self.ttl,
            now,
            &session_id,
            csrf_token,
        );
        Ok((session_id, csrf_public))
    }

    fn insert_record(
        state: &mut SessionState,
        max_sessions: usize,
        ttl: Duration,
        now: Instant,
        session_id: &str,
        csrf_token: Zeroizing<String>,
    ) {
        Self::prune_expired(state, now);
        while state.sessions.len() >= max_sessions {
            state.sessions.pop_front();
        }
        let id_digest: [u8; 32] = Sha256::digest(session_id.as_bytes()).into();
        let csrf_digest: [u8; 32] = Sha256::digest(csrf_token.as_bytes()).into();
        state.sessions.push_back(SessionRecord {
            id_digest,
            csrf_token,
            csrf_digest,
            expires_at: now + ttl,
        });
    }

    fn verify_session(&self, session_id: &str) -> Result<Option<(String, [u8; 32])>, HostError> {
        if session_id.is_empty() || session_id.len() > 4096 {
            return Ok(None);
        }
        let candidate_digest: [u8; 32] = Sha256::digest(session_id.as_bytes()).into();
        let now = Instant::now();
        let mut state = self
            .state
            .lock()
            .map_err(|_| HostError::Unavailable("session store unavailable".into()))?;
        Self::prune_expired(&mut state, now);
        let mut matched_index = None;
        for (index, record) in state.sessions.iter().enumerate() {
            if ct_eq_digest(&record.id_digest, &candidate_digest) == 1 {
                matched_index = Some(index);
            }
        }
        let Some(index) = matched_index else {
            return Ok(None);
        };
        if let Some(record) = state.sessions.get_mut(index) {
            record.expires_at = now + self.ttl;
            return Ok(Some(((*record.csrf_token).clone(), record.csrf_digest)));
        }
        Ok(None)
    }

    fn logout(&self, session_id: &str, csrf_header: Option<&str>) -> Result<(), HostError> {
        if session_id.is_empty() || session_id.len() > 4096 {
            return Err(HostError::Unauthorized);
        }
        let candidate_digest: [u8; 32] = Sha256::digest(session_id.as_bytes()).into();
        let now = Instant::now();
        let mut state = self
            .state
            .lock()
            .map_err(|_| HostError::Unavailable("session store unavailable".into()))?;
        Self::prune_expired(&mut state, now);
        let mut matched_index = None;
        for (index, record) in state.sessions.iter().enumerate() {
            if ct_eq_digest(&record.id_digest, &candidate_digest) == 1 {
                matched_index = Some(index);
            }
        }
        let Some(index) = matched_index else {
            return Err(HostError::Unauthorized);
        };
        let Some(record) = state.sessions.get(index) else {
            return Err(HostError::Unauthorized);
        };
        let Some(csrf) = csrf_header.filter(|value| !value.is_empty() && value.len() <= 4096)
        else {
            return Err(HostError::Forbidden);
        };
        let csrf_digest: [u8; 32] = Sha256::digest(csrf.as_bytes()).into();
        if ct_eq_digest(&record.csrf_digest, &csrf_digest) != 1 {
            return Err(HostError::Forbidden);
        }
        state.sessions.remove(index);
        Ok(())
    }
}

fn fill_csprng(output: &mut [u8; 32]) -> std::io::Result<()> {
    match std::fs::File::open("/dev/urandom") {
        Ok(mut file) => file.read_exact(output),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
            // Non-Unix fallback (e.g., Windows): fresh threads seed std's
            // RandomState from the OS CSPRNG (BCryptGenRandom on Windows).
            static COUNTER: AtomicU64 = AtomicU64::new(0);
            let mut hasher = Sha256::new();
            for round in 0..2u64 {
                let seed_pair = std::thread::spawn(move || {
                    let state = RandomState::new();
                    (state.hash_one(round), state.hash_one(round ^ 0xa5a5_5a5a))
                })
                .join()
                .map_err(|_| std::io::Error::other("CSPRNG fallback thread failed"))?;
                hasher.update(seed_pair.0.to_le_bytes());
                hasher.update(seed_pair.1.to_le_bytes());
            }
            hasher.update(COUNTER.fetch_add(1, Ordering::Relaxed).to_le_bytes());
            hasher.update(std::process::id().to_le_bytes());
            if let Ok(since_epoch) = SystemTime::now().duration_since(UNIX_EPOCH) {
                hasher.update(since_epoch.as_nanos().to_le_bytes());
            }
            let digest: [u8; 32] = hasher.finalize().into();
            output.copy_from_slice(&digest);
            Ok(())
        }
        Err(error) => Err(error),
    }
}

fn random_token() -> std::io::Result<Zeroizing<String>> {
    let mut raw = Zeroizing::new([0u8; 32]);
    fill_csprng(&mut raw)?;
    Ok(Zeroizing::new(
        base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(raw.as_slice()),
    ))
}

fn session_cookie(headers: &HeaderMap) -> Option<String> {
    let mut found = None;
    for value in headers.get_all(header::COOKIE) {
        let Ok(raw) = value.to_str() else {
            return None;
        };
        for part in raw.split(';') {
            let trimmed = part.trim();
            if let Some(candidate) = trimmed.strip_prefix("nofy_session=") {
                if candidate.is_empty() || found.is_some() {
                    return None;
                }
                found = Some(candidate.to_owned());
            }
        }
    }
    found
}

fn verify_csrf_header(headers: &HeaderMap, expected_digest: &[u8; 32]) -> bool {
    let Some(value) = headers
        .get(CSRF_HEADER_NAME)
        .and_then(|v| v.to_str().ok())
        .filter(|s| !s.is_empty() && s.len() <= 4096)
    else {
        return false;
    };
    let digest: [u8; 32] = Sha256::digest(value.as_bytes()).into();
    ct_eq_digest(expected_digest, &digest) == 1
}

pub async fn bind(
    host: &KernelHost,
    dist: &Path,
    address: SocketAddr,
    extra_origin: Option<&str>,
    scopes: Option<BTreeSet<Scope>>,
) -> Result<DevWeb, Box<dyn std::error::Error>> {
    if !address.ip().is_loopback() && extra_origin.is_none() {
        return Err("--dev-web-origin is required for a non-loopback development listener".into());
    }
    let scopes = scopes.unwrap_or_else(Authorizer::default_development_scopes);
    let authorizer = Authorizer::development_with_scopes(scopes)?;
    let dist = tokio::fs::canonicalize(dist).await?;
    let index = tokio::fs::read(dist.join("index.html")).await?;
    std::str::from_utf8(&index)
        .map_err(|_| "development frontend index.html is not valid UTF-8")?;
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
    let launch_ticket = random_token()?;
    let sessions = Arc::new(SessionStore::new(&launch_ticket));
    let guard = Arc::new(RequestGuard {
        origins: Origins {
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
        },
        sessions: sessions.clone(),
    });
    let mut local = host.clone();
    local.auth = Arc::new(authorizer);
    let local_routes = Router::new()
        .route("/local/bootstrap", post(local_bootstrap))
        .route("/local/session", get(local_session))
        .route("/local/logout", post(local_logout))
        .layer(DefaultBodyLimit::max(LOCAL_AUTH_BODY_LIMIT))
        .with_state(sessions);
    let router = Router::new()
        .merge(local_routes)
        .merge(local.router())
        .fallback_service(get(move |uri| static_file(dist.clone(), uri)))
        .layer(middleware::from_fn_with_state(guard, check_request));
    let display_origin = extra_origin
        .map(str::to_owned)
        .unwrap_or_else(|| format!("http://{address}"));
    eprintln!("Nofy development Web listening on http://{address}");
    eprintln!(
        "Nofy Web launch URL: {display_origin}/#ticket={}",
        launch_ticket.as_str()
    );
    Ok(DevWeb {
        listener,
        router,
        launch_ticket,
    })
}

impl DevWeb {
    pub fn local_addr(&self) -> std::io::Result<SocketAddr> {
        self.listener.local_addr()
    }

    pub fn launch_ticket(&self) -> &str {
        self.launch_ticket.as_str()
    }

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

async fn local_bootstrap(
    State(sessions): State<Arc<SessionStore>>,
    headers: HeaderMap,
    body: Bytes,
) -> Result<Response, HostError> {
    let media_type = headers
        .get(header::CONTENT_TYPE)
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.split(';').next())
        .map(str::trim);
    if media_type != Some("application/json") {
        return Err(HostError::Invalid(
            "bootstrap request requires application/json".into(),
        ));
    }
    let request: BootstrapRequest = serde_json::from_slice(&body)
        .map_err(|_| HostError::Invalid("invalid bootstrap payload".into()))?;
    let (session_id, csrf_token) = sessions.bootstrap(&request.ticket)?;
    let cookie_value = format!(
        "{SESSION_COOKIE_NAME}={}; HttpOnly; SameSite=Strict; Path=/",
        session_id.as_str()
    );
    let cookie_header = HeaderValue::from_str(&cookie_value)
        .map_err(|_| HostError::Unavailable("invalid session cookie value".into()))?;
    let mut response = Json(json!({ "csrfToken": csrf_token })).into_response();
    response
        .headers_mut()
        .insert(header::SET_COOKIE, cookie_header);
    response
        .headers_mut()
        .insert(header::CACHE_CONTROL, HeaderValue::from_static("no-store"));
    Ok(response)
}

async fn local_session(
    State(sessions): State<Arc<SessionStore>>,
    headers: HeaderMap,
) -> Result<Response, HostError> {
    let Some(session_id) = session_cookie(&headers) else {
        return Err(HostError::Unauthorized);
    };
    let Some((csrf_token, _)) = sessions.verify_session(&session_id)? else {
        return Err(HostError::Unauthorized);
    };
    let mut response = Json(json!({ "csrfToken": csrf_token })).into_response();
    response
        .headers_mut()
        .insert(header::CACHE_CONTROL, HeaderValue::from_static("no-store"));
    Ok(response)
}

async fn local_logout(
    State(sessions): State<Arc<SessionStore>>,
    headers: HeaderMap,
) -> Result<Response, HostError> {
    let Some(session_id) = session_cookie(&headers) else {
        return Err(HostError::Unauthorized);
    };
    let csrf = headers
        .get(CSRF_HEADER_NAME)
        .and_then(|value| value.to_str().ok());
    sessions.logout(&session_id, csrf)?;
    let mut response = StatusCode::NO_CONTENT.into_response();
    response.headers_mut().insert(
        header::SET_COOKIE,
        HeaderValue::from_static("nofy_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0"),
    );
    response
        .headers_mut()
        .insert(header::CACHE_CONTROL, HeaderValue::from_static("no-store"));
    Ok(response)
}

async fn check_request(
    State(guard): State<Arc<RequestGuard>>,
    ConnectInfo(peer): ConnectInfo<SocketAddr>,
    request: Request,
    next: Next,
) -> Response {
    let headers = request.headers();
    let Some(authority) = headers
        .get(header::HOST)
        .and_then(|value| value.to_str().ok())
    else {
        return with_security_headers(HostError::Forbidden.into_response());
    };
    let origin = format!("http://{authority}");
    if !(guard.origins.extra.as_deref() == Some(&origin)
        || peer.ip().to_canonical().is_loopback() && guard.origins.loopback.contains(&origin))
    {
        return with_security_headers(HostError::Forbidden.into_response());
    }
    let path = request.uri().path();
    let safe_method = matches!(*request.method(), Method::GET | Method::HEAD);
    if path.starts_with("/api/") || path.starts_with("/local/") {
        let request_origin = headers.get(header::ORIGIN);
        let same_origin = request_origin.is_some_and(|value| *value == origin);
        if (!same_origin && (request_origin.is_some() || !safe_method))
            || headers
                .get("sec-fetch-site")
                .is_some_and(|value| value != "same-origin" && value != "none")
        {
            return with_security_headers(HostError::Forbidden.into_response());
        }
    }
    if path.starts_with("/api/") {
        let Some(session_id) = session_cookie(headers) else {
            return with_security_headers(HostError::Unauthorized.into_response());
        };
        let verified = match guard.sessions.verify_session(&session_id) {
            Ok(Some(session)) => session,
            Ok(None) => return with_security_headers(HostError::Unauthorized.into_response()),
            Err(error) => return with_security_headers(error.into_response()),
        };
        if !safe_method && !verify_csrf_header(headers, &verified.1) {
            return with_security_headers(HostError::Forbidden.into_response());
        }
        if !conversation_route(request.method(), path) {
            return with_security_headers(HostError::NotFound.into_response());
        }
    }
    with_security_headers(next.run(request).await)
}

fn with_security_headers(mut response: Response) -> Response {
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
        HeaderValue::from_static(CSP_HEADER),
    );
    response
}

fn conversation_route(method: &Method, path: &str) -> bool {
    let Some(path) = path.strip_prefix("/api/v1/") else {
        return false;
    };
    let segments: Vec<_> = path.split('/').collect();
    if segments
        .iter()
        .any(|segment| segment.is_empty() || *segment == "." || *segment == "..")
    {
        return false;
    }
    matches!(
        (method, segments.as_slice()),
        (
            &Method::GET,
            ["access"
                | "protocol"
                | "systems"
                | "sessions"
                | "modules"
                | "module-repositories"
                | "module-packages"]
                | ["workspace", "changes"]
                | ["composer", "models"]
                | ["systems", _, "active"]
                | ["releases", _, "programs"]
                | ["sessions" | "actions" | "runs", _]
                | ["sessions", _, "turns" | "tree"]
                | ["sessions", _, "commands" | "turns", _]
                | ["runs", _, "approvals" | "events" | "stream"]
                | ["runs", _, "recovery", "humans"]
                | ["runs", _, "inputs", _]
                | ["module-repositories", _]
                | ["module-packages", _]
                | ["module-repositories", _, "packages", _, _]
        ) | (
            &Method::POST,
            ["sessions", "start" | "fork"]
                | ["sessions", _, "turns" | "archive" | "unarchive"]
                | ["runs", _, "inputs" | "cancel" | "approvals"]
                | [
                    "work",
                    "list" | "inspect" | "targets" | "start" | "wait" | "control"
                ]
                | ["actions"]
                | ["modules", "dependencies"]
                | ["composer", "model"]
                | ["module-repositories", _, "packages" | "sync"]
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
    if !nofy_host_path::starts_with(&file, &dist) {
        return Err(HostError::NotFound);
    }
    let bytes = tokio::fs::read(file)
        .await
        .map_err(|_| HostError::NotFound)?;
    let mime = match relative.extension().and_then(|ext| ext.to_str()) {
        Some("html") if path == "index.html" => "text/html; charset=utf-8",
        Some("js") => "text/javascript; charset=utf-8",
        Some("css") => "text/css; charset=utf-8",
        Some("svg") => "image/svg+xml",
        Some("woff2") => "font/woff2",
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn session_store_enforces_single_use_ticket_fifo_eviction_and_csrf_logout() {
        let store = SessionStore::with_limits("ticket-one", 2, Duration::from_secs(60));
        assert!(matches!(
            store.bootstrap("wrong"),
            Err(HostError::Unauthorized)
        ));
        let (sid1, csrf1) = store.bootstrap("ticket-one").unwrap();
        assert!(matches!(
            store.bootstrap("ticket-one"),
            Err(HostError::Unauthorized)
        ));
        assert_eq!(store.verify_session(&sid1).unwrap().unwrap().0, csrf1);

        // Insert two more sessions directly to verify FIFO cap = 2 evicts sid1.
        {
            let mut state = store.state.lock().unwrap();
            let now = Instant::now();
            SessionStore::insert_record(
                &mut state,
                2,
                Duration::from_secs(60),
                now,
                "sid-2",
                Zeroizing::new("csrf-2".into()),
            );
            SessionStore::insert_record(
                &mut state,
                2,
                Duration::from_secs(60),
                now,
                "sid-3",
                Zeroizing::new("csrf-3".into()),
            );
        }
        assert!(store.verify_session(&sid1).unwrap().is_none());
        assert_eq!(store.verify_session("sid-2").unwrap().unwrap().0, "csrf-2");
        assert_eq!(store.verify_session("sid-3").unwrap().unwrap().0, "csrf-3");

        assert!(matches!(
            store.logout("sid-2", None),
            Err(HostError::Forbidden)
        ));
        assert!(matches!(
            store.logout("sid-2", Some("wrong")),
            Err(HostError::Forbidden)
        ));
        store.logout("sid-2", Some("csrf-2")).unwrap();
        assert!(store.verify_session("sid-2").unwrap().is_none());
    }

    #[test]
    fn conversation_route_allows_repository_sync_and_blocks_traversal() {
        assert!(conversation_route(
            &Method::POST,
            "/api/v1/module-repositories/nofy/sync"
        ));
        assert!(!conversation_route(
            &Method::POST,
            "/api/v1/module-repositories/../sync"
        ));
        assert!(!conversation_route(
            &Method::GET,
            "/api/v1/module-repositories//sync"
        ));
    }

    #[test]
    fn conversation_route_allows_systems_work_and_session_branches_and_blocks_privileged_routes() {
        assert!(conversation_route(&Method::GET, "/api/v1/systems"));
        assert!(conversation_route(
            &Method::GET,
            "/api/v1/systems/omni/active"
        ));
        assert!(conversation_route(
            &Method::GET,
            "/api/v1/systems/main-agent/active"
        ));
        assert!(!conversation_route(
            &Method::GET,
            "/api/v1/systems/../active"
        ));
        assert!(!conversation_route(
            &Method::GET,
            "/api/v1/systems/omni/history"
        ));

        for op in ["list", "inspect", "targets", "start", "wait", "control"] {
            assert!(
                conversation_route(&Method::POST, &format!("/api/v1/work/{op}")),
                "expected work.{op} to be allowed"
            );
            assert!(
                !conversation_route(&Method::GET, &format!("/api/v1/work/{op}")),
                "work.{op} must require POST"
            );
        }
        assert!(!conversation_route(&Method::POST, "/api/v1/work/unknown"));

        assert!(conversation_route(&Method::POST, "/api/v1/sessions/fork"));
        assert!(conversation_route(
            &Method::GET,
            "/api/v1/sessions/sess-1/tree"
        ));
        assert!(!conversation_route(
            &Method::GET,
            "/api/v1/sessions/../tree"
        ));

        // Privileged or control-plane write/catalog routes remain blocked.
        for (method, path) in [
            (Method::GET, "/api/v1/catalog"),
            (Method::POST, "/api/v1/import"),
            (Method::POST, "/api/v1/publish"),
            (Method::POST, "/api/v1/apply"),
            (Method::PUT, "/api/v1/drafts/omni"),
        ] {
            assert!(
                !conversation_route(&method, path),
                "privileged route {method} {path} must not be allowed"
            );
        }
    }

    #[test]
    fn session_cookie_rejects_duplicates_and_extracts_unique_value() {
        let mut headers = HeaderMap::new();
        headers.insert(
            header::COOKIE,
            HeaderValue::from_static("other=1; nofy_session=abc123; foo=bar"),
        );
        assert_eq!(session_cookie(&headers).as_deref(), Some("abc123"));

        headers.insert(
            header::COOKIE,
            HeaderValue::from_static("nofy_session=a; nofy_session=b"),
        );
        assert!(session_cookie(&headers).is_none());
    }

    #[test]
    fn static_file_containment_handles_windows_verbatim_and_plain_prefixes() {
        let win = nofy_host_path::Syntax::Windows;
        assert!(win.starts_with(r"\\?\C:\app\dist\assets\main.js", r"C:\app\dist"));
        assert!(win.starts_with(r"C:\app\dist\index.html", r"\\?\c:\APP\DIST"));
        assert!(!win.starts_with(r"\\?\C:\app\dist-secret\index.html", r"C:\app\dist"));
    }
}
