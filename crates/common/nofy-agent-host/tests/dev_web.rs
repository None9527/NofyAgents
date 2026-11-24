use nofy_agent_host::{
    KernelHost,
    auth::{Authorizer, Scope},
    dev_web, native,
};
use nofy_agent_runtime::{
    control::ApplyCommand,
    credentials::EnvironmentCredentials,
    system::{SystemDocument, SystemFile},
};
use serde_json::{Value, json};
use std::{collections::BTreeSet, net::SocketAddr, sync::Arc};
use tokio_util::sync::CancellationToken;

struct RunningDevWeb {
    origin: String,
    ticket: String,
    shutdown: CancellationToken,
    task: tokio::task::JoinHandle<()>,
}

impl Drop for RunningDevWeb {
    fn drop(&mut self) {
        self.shutdown.cancel();
        self.task.abort();
    }
}

async fn start_dev_web(
    state_dir: &std::path::Path,
    dist_dir: &std::path::Path,
    scopes: Option<BTreeSet<Scope>>,
) -> RunningDevWeb {
    let credentials =
        Arc::new(EnvironmentCredentials::new("dev-web-test", "NOFY_DEV_WEB_TEST_").unwrap());
    let registry = native::registry(credentials).unwrap();
    let auth = Authorizer::new(vec![(
        "fixture-host-admin-token-00000000000000001".into(),
        BTreeSet::from([Scope::Read, Scope::Execute, Scope::Edit, Scope::Publish]),
    )])
    .unwrap();
    let host = KernelHost::open(state_dir, registry, auth).await.unwrap();
    let address: SocketAddr = "127.0.0.1:0".parse().unwrap();
    let web = dev_web::bind(&host, dist_dir, address, None, scopes)
        .await
        .unwrap();
    let bound = web.local_addr().unwrap();
    let ticket = web.launch_ticket().to_owned();
    let shutdown = CancellationToken::new();
    let stop = shutdown.clone();
    let task = tokio::spawn(async move {
        let _ = web.serve(stop).await;
    });
    RunningDevWeb {
        origin: format!("http://{bound}"),
        ticket,
        shutdown,
        task,
    }
}

fn write_dist(dir: &std::path::Path) {
    std::fs::write(
        dir.join("index.html"),
        "<!doctype html><html><head><title>Nofy</title></head><body>ok</body></html>",
    )
    .unwrap();
}

#[tokio::test]
async fn dev_web_requires_one_time_ticket_cookie_csrf_and_default_read_execute_scopes() {
    let dir = tempfile::tempdir().unwrap();
    let state = dir.path().join("state");
    let dist = dir.path().join("dist");
    std::fs::create_dir_all(&dist).unwrap();
    write_dist(&dist);

    let server = start_dev_web(&state, &dist, None).await;
    let client = reqwest::Client::new();

    // Index page must NOT inject the removed direct-development meta tag.
    let index = client
        .get(format!("{}/", server.origin))
        .send()
        .await
        .unwrap();
    assert_eq!(index.status().as_u16(), 200);
    let html = index.text().await.unwrap();
    assert!(!html.contains("nofy-dev-web"));

    // Unauthenticated API and session checks return 401.
    let unauth_api = client
        .get(format!("{}/api/v1/access", server.origin))
        .header("Sec-Fetch-Site", "same-origin")
        .send()
        .await
        .unwrap();
    assert_eq!(unauth_api.status().as_u16(), 401);

    let unauth_session = client
        .get(format!("{}/local/session", server.origin))
        .header("Sec-Fetch-Site", "same-origin")
        .send()
        .await
        .unwrap();
    assert_eq!(unauth_session.status().as_u16(), 401);

    // Invalid ticket returns 401; foreign Origin returns 403.
    let bad_origin = client
        .post(format!("{}/local/bootstrap", server.origin))
        .header("Origin", "http://evil.example:5173")
        .header("Sec-Fetch-Site", "cross-site")
        .json(&json!({ "ticket": server.ticket }))
        .send()
        .await
        .unwrap();
    assert_eq!(bad_origin.status().as_u16(), 403);

    let bad_ticket = client
        .post(format!("{}/local/bootstrap", server.origin))
        .header("Origin", &server.origin)
        .header("Sec-Fetch-Site", "same-origin")
        .json(&json!({ "ticket": "wrong-ticket" }))
        .send()
        .await
        .unwrap();
    assert_eq!(bad_ticket.status().as_u16(), 401);

    // Valid one-time ticket establishes HttpOnly SameSite=Strict cookie + CSRF token.
    let bootstrap = client
        .post(format!("{}/local/bootstrap", server.origin))
        .header("Origin", &server.origin)
        .header("Sec-Fetch-Site", "same-origin")
        .json(&json!({ "ticket": server.ticket }))
        .send()
        .await
        .unwrap();
    assert_eq!(bootstrap.status().as_u16(), 200);
    let set_cookie = bootstrap
        .headers()
        .get("set-cookie")
        .unwrap()
        .to_str()
        .unwrap()
        .to_owned();
    assert!(set_cookie.starts_with("nofy_session="));
    assert!(set_cookie.contains("HttpOnly"));
    assert!(set_cookie.contains("SameSite=Strict"));
    assert!(set_cookie.contains("Path=/"));
    let cookie = set_cookie.split(';').next().unwrap().to_owned();
    let body: Value = bootstrap.json().await.unwrap();
    let csrf = body["csrfToken"].as_str().unwrap().to_owned();
    assert!(!csrf.is_empty());

    // Replaying the single-use ticket MUST return 401.
    let replay = client
        .post(format!("{}/local/bootstrap", server.origin))
        .header("Origin", &server.origin)
        .header("Sec-Fetch-Site", "same-origin")
        .json(&json!({ "ticket": server.ticket }))
        .send()
        .await
        .unwrap();
    assert_eq!(replay.status().as_u16(), 401);

    // GET /local/session restores the CSRF token for the active cookie.
    let session = client
        .get(format!("{}/local/session", server.origin))
        .header("Sec-Fetch-Site", "same-origin")
        .header("Cookie", &cookie)
        .send()
        .await
        .unwrap();
    assert_eq!(session.status().as_u16(), 200);
    let session_body: Value = session.json().await.unwrap();
    assert_eq!(session_body["csrfToken"], csrf);

    // GET /api/v1/access succeeds with Cookie and grants ONLY read + execute by default.
    let access = client
        .get(format!("{}/api/v1/access", server.origin))
        .header("Sec-Fetch-Site", "same-origin")
        .header("Cookie", &cookie)
        .send()
        .await
        .unwrap();
    assert_eq!(access.status().as_u16(), 200);
    let access_body: Value = access.json().await.unwrap();
    let scopes: BTreeSet<String> = access_body["scopes"]
        .as_array()
        .unwrap()
        .iter()
        .map(|v| v.as_str().unwrap().to_owned())
        .collect();
    assert_eq!(
        scopes,
        BTreeSet::from(["read".to_owned(), "execute".to_owned()])
    );

    // Write endpoints without X-Nofy-CSRF or with wrong X-Nofy-CSRF return 403.
    let missing_csrf = client
        .post(format!("{}/api/v1/sessions/start", server.origin))
        .header("Origin", &server.origin)
        .header("Sec-Fetch-Site", "same-origin")
        .header("Cookie", &cookie)
        .json(&json!({}))
        .send()
        .await
        .unwrap();
    assert_eq!(missing_csrf.status().as_u16(), 403);

    let wrong_csrf = client
        .post(format!("{}/api/v1/sessions/start", server.origin))
        .header("Origin", &server.origin)
        .header("Sec-Fetch-Site", "same-origin")
        .header("Cookie", &cookie)
        .header("X-Nofy-CSRF", "not-the-right-csrf")
        .json(&json!({}))
        .send()
        .await
        .unwrap();
    assert_eq!(wrong_csrf.status().as_u16(), 403);

    // Default scopes deny edit and publish routes even with valid Cookie + CSRF.
    let denied_edit = client
        .put(format!("{}/api/v1/module-repositories/demo", server.origin))
        .header("Origin", &server.origin)
        .header("Sec-Fetch-Site", "same-origin")
        .header("Cookie", &cookie)
        .header("X-Nofy-CSRF", &csrf)
        .json(&json!({
            "origin": { "kind": "managed" },
            "expected_revision": null
        }))
        .send()
        .await
        .unwrap();
    assert_eq!(denied_edit.status().as_u16(), 403);

    let denied_publish = client
        .post(format!(
            "{}/api/v1/module-repositories/demo/packages",
            server.origin
        ))
        .header("Origin", &server.origin)
        .header("Sec-Fetch-Site", "same-origin")
        .header("Cookie", &cookie)
        .header("X-Nofy-CSRF", &csrf)
        .json(&json!({
            "expected_revision": "0",
            "source": { "files": {}, "declaration": "module.json" }
        }))
        .send()
        .await
        .unwrap();
    assert_eq!(denied_publish.status().as_u16(), 403);

    // POST /api/v1/module-repositories/:repo/sync is wired (returns 403 scope denied, not 404).
    let denied_sync = client
        .post(format!(
            "{}/api/v1/module-repositories/demo/sync",
            server.origin
        ))
        .header("Origin", &server.origin)
        .header("Sec-Fetch-Site", "same-origin")
        .header("Cookie", &cookie)
        .header("X-Nofy-CSRF", &csrf)
        .json(&json!({ "expected_revision": "0" }))
        .send()
        .await
        .unwrap();
    assert_eq!(denied_sync.status().as_u16(), 403);

    // Logout requires valid CSRF and destroys the session.
    let logout_no_csrf = client
        .post(format!("{}/local/logout", server.origin))
        .header("Origin", &server.origin)
        .header("Sec-Fetch-Site", "same-origin")
        .header("Cookie", &cookie)
        .send()
        .await
        .unwrap();
    assert_eq!(logout_no_csrf.status().as_u16(), 403);

    let logout_ok = client
        .post(format!("{}/local/logout", server.origin))
        .header("Origin", &server.origin)
        .header("Sec-Fetch-Site", "same-origin")
        .header("Cookie", &cookie)
        .header("X-Nofy-CSRF", &csrf)
        .send()
        .await
        .unwrap();
    assert_eq!(logout_ok.status().as_u16(), 204);

    let after_logout = client
        .get(format!("{}/api/v1/access", server.origin))
        .header("Sec-Fetch-Site", "same-origin")
        .header("Cookie", &cookie)
        .send()
        .await
        .unwrap();
    assert_eq!(after_logout.status().as_u16(), 401);
}

#[tokio::test]
async fn dev_web_explicit_scopes_unlock_edit_publish_and_sync_route() {
    let dir = tempfile::tempdir().unwrap();
    let state = dir.path().join("state");
    let dist = dir.path().join("dist");
    std::fs::create_dir_all(&dist).unwrap();
    write_dist(&dist);

    let scopes = BTreeSet::from([Scope::Read, Scope::Execute, Scope::Edit, Scope::Publish]);
    let server = start_dev_web(&state, &dist, Some(scopes)).await;
    let client = reqwest::Client::new();

    let bootstrap = client
        .post(format!("{}/local/bootstrap", server.origin))
        .header("Origin", &server.origin)
        .header("Sec-Fetch-Site", "same-origin")
        .json(&json!({ "ticket": server.ticket }))
        .send()
        .await
        .unwrap();
    assert_eq!(bootstrap.status().as_u16(), 200);
    let cookie = bootstrap
        .headers()
        .get("set-cookie")
        .unwrap()
        .to_str()
        .unwrap()
        .split(';')
        .next()
        .unwrap()
        .to_owned();
    let csrf = bootstrap.json::<Value>().await.unwrap()["csrfToken"]
        .as_str()
        .unwrap()
        .to_owned();

    let access = client
        .get(format!("{}/api/v1/access", server.origin))
        .header("Sec-Fetch-Site", "same-origin")
        .header("Cookie", &cookie)
        .send()
        .await
        .unwrap();
    assert_eq!(access.status().as_u16(), 200);
    let granted: BTreeSet<String> = access.json::<Value>().await.unwrap()["scopes"]
        .as_array()
        .unwrap()
        .iter()
        .map(|v| v.as_str().unwrap().to_owned())
        .collect();
    assert_eq!(
        granted,
        BTreeSet::from([
            "read".to_owned(),
            "execute".to_owned(),
            "edit".to_owned(),
            "publish".to_owned(),
        ])
    );

    // Explicit edit scope allows registering a managed repository.
    let created = client
        .put(format!("{}/api/v1/module-repositories/demo", server.origin))
        .header("Origin", &server.origin)
        .header("Sec-Fetch-Site", "same-origin")
        .header("Cookie", &cookie)
        .header("X-Nofy-CSRF", &csrf)
        .json(&json!({
            "origin": { "kind": "managed" },
            "expected_revision": null
        }))
        .send()
        .await
        .unwrap();
    assert_eq!(created.status().as_u16(), 200);

    // Sync route reaches the handler and rejects missing resources scope
    // rather than returning 404 from conversation_route.
    let sync = client
        .post(format!(
            "{}/api/v1/module-repositories/missing/sync",
            server.origin
        ))
        .header("Origin", &server.origin)
        .header("Sec-Fetch-Site", "same-origin")
        .header("Cookie", &cookie)
        .header("X-Nofy-CSRF", &csrf)
        .json(&json!({ "expected_revision": "0" }))
        .send()
        .await
        .unwrap();
    assert_eq!(sync.status().as_u16(), 403);
}

#[tokio::test]
async fn dev_web_refuses_non_loopback_without_origin_and_resources_scope() {
    let dir = tempfile::tempdir().unwrap();
    let state = dir.path().join("state");
    let dist = dir.path().join("dist");
    std::fs::create_dir_all(&dist).unwrap();
    write_dist(&dist);

    let credentials =
        Arc::new(EnvironmentCredentials::new("dev-web-test", "NOFY_DEV_WEB_TEST_").unwrap());
    let registry = native::registry(credentials).unwrap();
    let auth = Authorizer::new(vec![(
        "fixture-host-admin-token-00000000000000001".into(),
        BTreeSet::from([Scope::Read]),
    )])
    .unwrap();
    let host = KernelHost::open(&state, registry, auth).await.unwrap();

    let non_loopback: SocketAddr = "0.0.0.0:0".parse().unwrap();
    assert!(
        dev_web::bind(&host, &dist, non_loopback, None, None)
            .await
            .is_err()
    );

    let loopback: SocketAddr = "127.0.0.1:0".parse().unwrap();
    assert!(
        dev_web::bind(
            &host,
            &dist,
            loopback,
            None,
            Some(BTreeSet::from([Scope::Read, Scope::Resources]))
        )
        .await
        .is_err()
    );
}

#[tokio::test]
async fn dev_web_allows_systems_omni_work_and_session_branch_routes_with_cookie_and_csrf() {
    let dir = tempfile::tempdir().unwrap();
    let state = dir.path().join("state");
    let dist = dir.path().join("dist");
    std::fs::create_dir_all(&dist).unwrap();
    write_dist(&dist);

    let credentials =
        Arc::new(EnvironmentCredentials::new("dev-web-test", "NOFY_DEV_WEB_TEST_").unwrap());
    let registry = native::registry(credentials).unwrap();
    let auth = Authorizer::new(vec![(
        "fixture-host-admin-token-00000000000000001".into(),
        BTreeSet::from([Scope::Read, Scope::Execute, Scope::Edit, Scope::Publish]),
    )])
    .unwrap();
    let host = KernelHost::open(&state, registry, auth).await.unwrap();

    // Activate an `omni` system so `/api/v1/systems` and `/api/v1/systems/omni/active` return 200.
    let omni_doc: SystemDocument = serde_json::from_value(json!({
        "schema_version": 1,
        "name": "omni",
        "modules": [
            {
                "reference": { "id": "sdk", "version": "1" },
                "factory": "tool.sdk_authoring",
                "config": {}
            }
        ],
        "programs": {
            "main": {
                "kind": "tool",
                "definition": {
                    "name": "inspect",
                    "tool_packs": [{ "id": "sdk", "version": "1" }]
                },
                "call": {
                    "id": "inspect",
                    "name": "sdk_schema",
                    "arguments": { "operation": "describe" }
                }
            }
        }
    }))
    .unwrap();
    let publication = host
        .control()
        .install_file(SystemFile::Source(omni_doc))
        .await
        .unwrap();
    let release = publication.bundle.digest.clone();
    host.control()
        .apply(ApplyCommand {
            command_id: "cmd-omni-activate".into(),
            system: "omni".into(),
            release: release.clone(),
            expected_generation: None,
        })
        .await
        .unwrap();

    let address: SocketAddr = "127.0.0.1:0".parse().unwrap();
    let web = dev_web::bind(&host, &dist, address, None, None)
        .await
        .unwrap();
    let bound = web.local_addr().unwrap();
    let ticket = web.launch_ticket().to_owned();
    let shutdown = CancellationToken::new();
    let stop = shutdown.clone();
    let task = tokio::spawn(async move {
        let _ = web.serve(stop).await;
    });
    let server = RunningDevWeb {
        origin: format!("http://{bound}"),
        ticket,
        shutdown,
        task,
    };
    let client = reqwest::Client::new();

    // Unauthenticated requests to systems and work routes must be rejected with 401.
    for (method, path) in [
        (reqwest::Method::GET, "/api/v1/systems"),
        (reqwest::Method::GET, "/api/v1/systems/omni/active"),
        (reqwest::Method::POST, "/api/v1/work/list"),
        (reqwest::Method::POST, "/api/v1/sessions/fork"),
        (reqwest::Method::GET, "/api/v1/sessions/s1/tree"),
    ] {
        let mut req = client
            .request(method.clone(), format!("{}{path}", server.origin))
            .header("Sec-Fetch-Site", "same-origin");
        if method == reqwest::Method::POST {
            req = req.header("Origin", &server.origin).json(&json!({}));
        }
        let resp = req.send().await.unwrap();
        assert_eq!(
            resp.status().as_u16(),
            401,
            "unauthenticated {method} {path} must return 401"
        );
    }

    // Bootstrap session cookie + CSRF token.
    let bootstrap = client
        .post(format!("{}/local/bootstrap", server.origin))
        .header("Origin", &server.origin)
        .header("Sec-Fetch-Site", "same-origin")
        .json(&json!({ "ticket": server.ticket }))
        .send()
        .await
        .unwrap();
    assert_eq!(bootstrap.status().as_u16(), 200);
    let cookie = bootstrap
        .headers()
        .get("set-cookie")
        .unwrap()
        .to_str()
        .unwrap()
        .split(';')
        .next()
        .unwrap()
        .to_owned();
    let csrf = bootstrap.json::<Value>().await.unwrap()["csrfToken"]
        .as_str()
        .unwrap()
        .to_owned();

    // GET /api/v1/systems discovers `omni` as default_system.
    let systems_resp = client
        .get(format!("{}/api/v1/systems", server.origin))
        .header("Sec-Fetch-Site", "same-origin")
        .header("Cookie", &cookie)
        .send()
        .await
        .unwrap();
    assert_eq!(systems_resp.status().as_u16(), 200);
    let systems_body: Value = systems_resp.json().await.unwrap();
    assert_eq!(systems_body["default_system"], "omni");
    assert_eq!(systems_body["systems"][0]["name"], "omni");
    assert_eq!(systems_body["systems"][0]["release"], release);
    assert_eq!(systems_body["systems"][0]["default_program"], "main");

    // GET /api/v1/systems/omni/active succeeds without hardcoding main-agent.
    let active_resp = client
        .get(format!("{}/api/v1/systems/omni/active", server.origin))
        .header("Sec-Fetch-Site", "same-origin")
        .header("Cookie", &cookie)
        .send()
        .await
        .unwrap();
    assert_eq!(active_resp.status().as_u16(), 200);
    let active_body: Value = active_resp.json().await.unwrap();
    assert_eq!(active_body["release"], release);
    assert_eq!(active_body["generation"], 1);

    // All 6 Omni work.* routes enforce CSRF and reach the kernel WorkService under default scopes.
    for op in ["list", "inspect", "targets", "start", "wait", "control"] {
        let no_csrf = client
            .post(format!("{}/api/v1/work/{op}", server.origin))
            .header("Origin", &server.origin)
            .header("Sec-Fetch-Site", "same-origin")
            .header("Cookie", &cookie)
            .json(&json!({}))
            .send()
            .await
            .unwrap();
        assert_eq!(
            no_csrf.status().as_u16(),
            403,
            "work.{op} without CSRF must return 403"
        );

        let with_csrf = client
            .post(format!("{}/api/v1/work/{op}", server.origin))
            .header("Origin", &server.origin)
            .header("Sec-Fetch-Site", "same-origin")
            .header("Cookie", &cookie)
            .header("X-Nofy-CSRF", &csrf)
            .json(&json!({}))
            .send()
            .await
            .unwrap();
        assert_eq!(
            with_csrf.status().as_u16(),
            422,
            "work.{op} with valid cookie+CSRF must reach handler validation (422), not 403/404"
        );
        let body: Value = with_csrf.json().await.unwrap();
        assert_eq!(body["error"]["code"], "invalid");
    }

    // Unknown work operation stays blocked at conversation_route (404).
    let unknown_work = client
        .post(format!("{}/api/v1/work/unknown", server.origin))
        .header("Origin", &server.origin)
        .header("Sec-Fetch-Site", "same-origin")
        .header("Cookie", &cookie)
        .header("X-Nofy-CSRF", &csrf)
        .json(&json!({}))
        .send()
        .await
        .unwrap();
    assert_eq!(unknown_work.status().as_u16(), 404);

    // Session branch routes: POST /api/v1/sessions/fork enforces CSRF and reaches handler.
    let fork_no_csrf = client
        .post(format!("{}/api/v1/sessions/fork", server.origin))
        .header("Origin", &server.origin)
        .header("Sec-Fetch-Site", "same-origin")
        .header("Cookie", &cookie)
        .json(&json!({}))
        .send()
        .await
        .unwrap();
    assert_eq!(fork_no_csrf.status().as_u16(), 403);

    let fork_with_csrf = client
        .post(format!("{}/api/v1/sessions/fork", server.origin))
        .header("Origin", &server.origin)
        .header("Sec-Fetch-Site", "same-origin")
        .header("Cookie", &cookie)
        .header("X-Nofy-CSRF", &csrf)
        .json(&json!({}))
        .send()
        .await
        .unwrap();
    assert_eq!(fork_with_csrf.status().as_u16(), 422);

    let tree_missing = client
        .get(format!("{}/api/v1/sessions/s1/tree", server.origin))
        .header("Sec-Fetch-Site", "same-origin")
        .header("Cookie", &cookie)
        .send()
        .await
        .unwrap();
    assert_eq!(tree_missing.status().as_u16(), 404);
    let tree_body: Value = tree_missing.json().await.unwrap();
    assert_eq!(tree_body["error"]["code"], "not_found");

    // Privileged routes stay blocked even with valid cookie + CSRF.
    let blocked_catalog = client
        .get(format!("{}/api/v1/catalog", server.origin))
        .header("Sec-Fetch-Site", "same-origin")
        .header("Cookie", &cookie)
        .send()
        .await
        .unwrap();
    assert_eq!(blocked_catalog.status().as_u16(), 404);

    let blocked_import = client
        .post(format!("{}/api/v1/import", server.origin))
        .header("Origin", &server.origin)
        .header("Sec-Fetch-Site", "same-origin")
        .header("Cookie", &cookie)
        .header("X-Nofy-CSRF", &csrf)
        .json(&json!({}))
        .send()
        .await
        .unwrap();
    assert_eq!(blocked_import.status().as_u16(), 404);
}
