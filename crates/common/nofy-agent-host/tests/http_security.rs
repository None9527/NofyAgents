use base64::Engine;
use nofy_agent_host::{
    KernelHost,
    auth::{Authorizer, Scope},
    credentials::FileCredentials,
    native,
};
use nofy_agent_runtime::{
    credentials::{CredentialProvider, EnvironmentCredentials},
    system::SystemDocument,
};
use serde_json::{Value, json};
use sha2::{Digest, Sha256};
use std::{collections::BTreeSet, sync::Arc};

const ADMIN: &str = "fixture-administrator-token-00000000000001";
const VIEW: &str = "fixture-viewer-token-000000000000000000001";
const EDIT: &str = "fixture-editor-token-000000000000000000001";
const PUBLISH_NO_RES: &str = "fixture-publisher-token-000000000000000001";

struct Serving {
    url: String,
    task: tokio::task::JoinHandle<()>,
}

impl Drop for Serving {
    fn drop(&mut self) {
        self.task.abort();
    }
}

async fn serve(router: axum::Router) -> Serving {
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let url = format!("http://{}", listener.local_addr().unwrap());
    let task = tokio::spawn(async move { axum::serve(listener, router).await.unwrap() });
    Serving { url, task }
}

fn test_auth() -> Authorizer {
    Authorizer::new(vec![
        (
            ADMIN.into(),
            BTreeSet::from([
                Scope::Read,
                Scope::Edit,
                Scope::Publish,
                Scope::Resources,
                Scope::Execute,
            ]),
        ),
        (VIEW.into(), BTreeSet::from([Scope::Read])),
        (EDIT.into(), BTreeSet::from([Scope::Read, Scope::Edit])),
        (
            PUBLISH_NO_RES.into(),
            BTreeSet::from([Scope::Read, Scope::Edit, Scope::Publish, Scope::Execute]),
        ),
    ])
    .unwrap()
}

async fn open_host(state_dir: &std::path::Path) -> KernelHost {
    let credentials = Arc::new(EnvironmentCredentials::new("sec-test", "NOFY_SEC_TEST_").unwrap());
    let registry = native::registry(credentials).unwrap();
    KernelHost::open(state_dir, registry, test_auth())
        .await
        .unwrap()
}

async fn send_json(
    server: &Serving,
    method: reqwest::Method,
    path: &str,
    token: &str,
    body: Option<Value>,
) -> (u16, Value) {
    let mut req = reqwest::Client::new()
        .request(method, format!("{}{path}", server.url))
        .bearer_auth(token);
    if let Some(body) = body {
        req = req.json(&body);
    }
    let response = req.send().await.unwrap();
    let status = response.status().as_u16();
    let bytes = response.bytes().await.unwrap();
    let value = if bytes.is_empty() {
        Value::Null
    } else {
        serde_json::from_slice(&bytes).unwrap()
    };
    (status, value)
}

fn plain_document(name: &str) -> SystemDocument {
    let reference = json!({ "id": "sdk", "version": "1" });
    serde_json::from_value(json!({
        "schema_version": 1,
        "name": name,
        "modules": [
            {
                "reference": reference,
                "factory": "tool.sdk_authoring",
                "config": {}
            }
        ],
        "programs": {
            "main": {
                "kind": "tool",
                "definition": {
                    "name": "inspect",
                    "tool_packs": [reference]
                },
                "call": {
                    "id": "inspect",
                    "name": "sdk_schema",
                    "arguments": { "operation": "describe" }
                }
            }
        }
    }))
    .unwrap()
}

fn resource_document(name: &str) -> SystemDocument {
    let mut value: Value = serde_json::from_str(include_str!("../examples/system.json")).unwrap();
    value["name"] = json!(name);
    serde_json::from_value(value).unwrap()
}

#[tokio::test]
async fn publish_checks_exact_draft_revision_before_resources_and_blocks_toctou_race() {
    let dir = tempfile::tempdir().unwrap();
    let state = dir.path().join("state");
    let host = open_host(&state).await;
    let server = serve(host.router()).await;

    // 1. Deterministic revision-mismatch checks.
    let plain = plain_document("sys-mismatch");
    let privileged = resource_document("sys-mismatch");

    let (status, saved_v1) = send_json(
        &server,
        reqwest::Method::PUT,
        "/api/v1/drafts/mismatch",
        PUBLISH_NO_RES,
        Some(json!({ "expected_revision": null, "document": plain })),
    )
    .await;
    assert_eq!(status, 200, "{saved_v1}");
    let rev1 = saved_v1["revision"].as_u64().unwrap();

    // Guessing the future revision while draft is at rev1 MUST return 409 Conflict.
    let (status, body) = send_json(
        &server,
        reqwest::Method::POST,
        "/api/v1/publish",
        PUBLISH_NO_RES,
        Some(json!({ "draft": "mismatch", "revision": rev1 + 1 })),
    )
    .await;
    assert_eq!(status, 409, "{body}");
    assert_eq!(body["error"]["code"], "conflict");

    // Admin updates the draft to a resource-bearing revision rev2.
    let (status, saved_v2) = send_json(
        &server,
        reqwest::Method::PUT,
        "/api/v1/drafts/mismatch",
        ADMIN,
        Some(json!({ "expected_revision": rev1, "document": privileged })),
    )
    .await;
    assert_eq!(status, 200, "{saved_v2}");
    let rev2 = saved_v2["revision"].as_u64().unwrap();
    assert!(rev2 > rev1);

    // Publishing stale rev1 MUST return 409 Conflict (before resources check).
    let (status, body) = send_json(
        &server,
        reqwest::Method::POST,
        "/api/v1/publish",
        PUBLISH_NO_RES,
        Some(json!({ "draft": "mismatch", "revision": rev1 })),
    )
    .await;
    assert_eq!(status, 409, "{body}");
    assert_eq!(body["error"]["code"], "conflict");

    // Publishing rev2 without Scope::Resources MUST return 403 Forbidden.
    let (status, body) = send_json(
        &server,
        reqwest::Method::POST,
        "/api/v1/publish",
        PUBLISH_NO_RES,
        Some(json!({ "draft": "mismatch", "revision": rev2 })),
    )
    .await;
    assert_eq!(status, 403, "{body}");
    assert_eq!(body["error"]["code"], "forbidden");

    // Admin (with Scope::Resources) succeeds.
    let (status, body) = send_json(
        &server,
        reqwest::Method::POST,
        "/api/v1/publish",
        ADMIN,
        Some(json!({ "draft": "mismatch", "revision": rev2 })),
    )
    .await;
    assert_eq!(status, 200, "{body}");

    // 2. Concurrent TOCTOU race: publisher without Resources tries to publish rev2
    // concurrently while admin upgrades draft from resource-free rev1 to resource-bearing rev2.
    for round in 0..16 {
        let draft_name = format!("race-{round}");
        let plain = plain_document(&draft_name);
        let privileged = resource_document(&draft_name);
        let (status, created) = send_json(
            &server,
            reqwest::Method::PUT,
            &format!("/api/v1/drafts/{draft_name}"),
            PUBLISH_NO_RES,
            Some(json!({ "expected_revision": null, "document": plain })),
        )
        .await;
        assert_eq!(status, 200, "{created}");
        let rev1 = created["revision"].as_u64().unwrap();
        let target_rev = rev1 + 1;

        let draft_path = format!("/api/v1/drafts/{draft_name}");
        let update_fut = send_json(
            &server,
            reqwest::Method::PUT,
            &draft_path,
            ADMIN,
            Some(json!({ "expected_revision": rev1, "document": privileged })),
        );
        let publish_fut = send_json(
            &server,
            reqwest::Method::POST,
            "/api/v1/publish",
            PUBLISH_NO_RES,
            Some(json!({ "draft": draft_name, "revision": target_rev })),
        );
        let ((up_status, _), (pub_status, pub_body)) = tokio::join!(update_fut, publish_fut);
        assert_eq!(up_status, 200);
        assert!(
            pub_status == 403 || pub_status == 409,
            "unprivileged publish must never succeed during race: {pub_status} {pub_body}"
        );
    }
}

#[tokio::test]
async fn read_scope_archives_stay_in_memory_without_writing_to_disk_and_serve_chunks_and_download()
{
    let dir = tempfile::tempdir().unwrap();
    let state = dir.path().join("state");
    let host = open_host(&state).await;
    let server = serve(host.router()).await;

    let (status, created) = send_json(
        &server,
        reqwest::Method::POST,
        "/api/v1/projects",
        EDIT,
        Some(json!({ "project_id": "demo-proj", "agent": "helper" })),
    )
    .await;
    assert_eq!(status, 200, "{created}");
    let source = created["source"].clone();

    // 1. POST /api/v1/projects/{id}/archive with Scope::Read
    let (status, proj_archive) = send_json(
        &server,
        reqwest::Method::POST,
        "/api/v1/projects/demo-proj/archive",
        VIEW,
        None,
    )
    .await;
    assert_eq!(status, 200, "{proj_archive}");
    let proj_sha = proj_archive["sha256"].as_str().unwrap().to_owned();
    assert_eq!(
        proj_archive["uri"],
        format!("nofy://source-archives/{proj_sha}")
    );
    assert_eq!(
        proj_archive["download_path"],
        format!("/api/v1/source-archives/{proj_sha}")
    );

    // 2. POST /api/v1/source-archives with Scope::Read
    let (status, src_archive) = send_json(
        &server,
        reqwest::Method::POST,
        "/api/v1/source-archives",
        VIEW,
        Some(json!({ "source": source })),
    )
    .await;
    assert_eq!(status, 200, "{src_archive}");
    let src_sha = src_archive["sha256"].as_str().unwrap().to_owned();
    assert_eq!(src_sha, proj_sha);

    // Verify no on-disk archive directory is created under state_dir/projects/archives/
    let archives_dir = state.join("projects").join("archives");
    assert!(
        !archives_dir.exists(),
        "read-only archive endpoints must not create an on-disk archives directory: {}",
        archives_dir.display()
    );

    // 3. Reassemble via GET /api/v1/source-archives/{digest}/chunks and verify SHA-256.
    let mut offset = 0u64;
    let mut assembled = Vec::new();
    loop {
        let (status, chunk) = send_json(
            &server,
            reqwest::Method::GET,
            &format!("/api/v1/source-archives/{src_sha}/chunks?offset={offset}&limit=128"),
            VIEW,
            None,
        )
        .await;
        assert_eq!(status, 200, "{chunk}");
        let bytes = base64::engine::general_purpose::STANDARD
            .decode(chunk["content"].as_str().unwrap())
            .unwrap();
        assembled.extend_from_slice(&bytes);
        offset = chunk["next_offset"].as_str().unwrap().parse().unwrap();
        if chunk["eof"] == true {
            break;
        }
    }
    assert_eq!(format!("{:x}", Sha256::digest(&assembled)), src_sha);

    // 4. Stream via GET /api/v1/source-archives/{digest} and verify SHA-256.
    let download = reqwest::Client::new()
        .get(format!("{}/api/v1/source-archives/{src_sha}", server.url))
        .bearer_auth(VIEW)
        .send()
        .await
        .unwrap();
    assert_eq!(download.status().as_u16(), 200);
    assert_eq!(
        download
            .headers()
            .get("content-type")
            .unwrap()
            .to_str()
            .unwrap(),
        "application/gzip"
    );
    let full = download.bytes().await.unwrap();
    assert_eq!(format!("{:x}", Sha256::digest(&full)), src_sha);
    assert_eq!(full.as_ref(), assembled.as_slice());

    // Still no on-disk archive directory created, and uncached digests return 404.
    assert!(!archives_dir.exists());
    let missing_digest = "0".repeat(64);
    let (status, body) = send_json(
        &server,
        reqwest::Method::GET,
        &format!("/api/v1/source-archives/{missing_digest}/chunks"),
        VIEW,
        None,
    )
    .await;
    assert_eq!(status, 404, "{body}");
    assert_eq!(body["error"]["code"], "not_found");
    let (status, body) = send_json(
        &server,
        reqwest::Method::GET,
        &format!("/api/v1/source-archives/{missing_digest}"),
        VIEW,
        None,
    )
    .await;
    assert_eq!(status, 404, "{body}");
    assert_eq!(body["error"]["code"], "not_found");
}

#[tokio::test]
async fn credentials_shared_reads_and_no_follow_and_private_parent_enforced() {
    let dir = tempfile::tempdir().unwrap();
    let private_dir = dir.path().join("private");
    let _guard = nofy_private_fs::ensure_private_dir(&private_dir).unwrap();
    let path = private_dir.join("credentials.json");
    let store = FileCredentials::open(&path, "sec-cred", None).unwrap();
    store
        .set("API_KEY", None, Some("secret-token-value".into()))
        .await
        .unwrap();

    // Concurrent shared reads (inspect + resolve) succeed simultaneously.
    let mut tasks = Vec::new();
    for _ in 0..8 {
        let s = store.clone();
        tasks.push(tokio::spawn(async move {
            assert_eq!(s.inspect().await.unwrap().revision, 1);
            assert_eq!(
                s.resolve("API_KEY").await.unwrap().as_deref(),
                Some("secret-token-value")
            );
        }));
    }
    for task in tasks {
        task.await.unwrap();
    }

    // Unix-specific symlink refusal and parent directory privacy check on write.
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;

        let link_dir = tempfile::tempdir().unwrap();
        let link_path = link_dir.path().join("credentials.json");
        std::os::unix::fs::symlink(&path, &link_path).unwrap();
        let linked_store = FileCredentials::open(&link_path, "sec-cred", None).unwrap();
        assert!(linked_store.inspect().await.is_err());
        assert!(linked_store.resolve("API_KEY").await.is_err());

        let open_parent = dir.path().join("open-parent");
        std::fs::create_dir(&open_parent).unwrap();
        std::fs::set_permissions(&open_parent, std::fs::Permissions::from_mode(0o755)).unwrap();
        let open_store =
            FileCredentials::open(open_parent.join("credentials.json"), "sec-cred", None).unwrap();
        assert!(
            open_store
                .set("API_KEY", None, Some("blocked".into()))
                .await
                .is_err()
        );
    }
}

async fn publish_and_activate(server: &Serving, doc: SystemDocument, command_id: &str) -> String {
    let (status, publication) = send_json(
        server,
        reqwest::Method::POST,
        "/api/v1/import",
        PUBLISH_NO_RES,
        Some(serde_json::to_value(&doc).unwrap()),
    )
    .await;
    assert_eq!(status, 200, "{publication}");
    let release = publication["bundle"]["digest"].as_str().unwrap().to_owned();
    let (status, receipt) = send_json(
        server,
        reqwest::Method::POST,
        "/api/v1/apply",
        PUBLISH_NO_RES,
        Some(json!({
            "command_id": command_id,
            "system": doc.name,
            "release": release,
            "expected_generation": null
        })),
    )
    .await;
    assert_eq!(status, 200, "{receipt}");
    release
}

#[tokio::test]
async fn systems_endpoint_discovers_active_systems_and_selects_default_system() {
    // 1. Empty state (no active systems) and authentication check.
    let empty_dir = tempfile::tempdir().unwrap();
    let empty_host = open_host(&empty_dir.path().join("state")).await;
    let empty_server = serve(empty_host.router()).await;

    let unauth = reqwest::Client::new()
        .get(format!("{}/api/v1/systems", empty_server.url))
        .send()
        .await
        .unwrap();
    assert_eq!(unauth.status().as_u16(), 401);

    let (status, body) = send_json(
        &empty_server,
        reqwest::Method::GET,
        "/api/v1/systems",
        VIEW,
        None,
    )
    .await;
    assert_eq!(status, 200, "{body}");
    assert_eq!(body["systems"], json!([]));
    assert!(body["default_system"].is_null());

    // Non-preferred systems pick lexicographically first active system, then prefer main-agent.
    let zebra_release =
        publish_and_activate(&empty_server, plain_document("zebra"), "cmd-zebra").await;
    let alpha_release =
        publish_and_activate(&empty_server, plain_document("alpha"), "cmd-alpha").await;
    let (status, body) = send_json(
        &empty_server,
        reqwest::Method::GET,
        "/api/v1/systems",
        VIEW,
        None,
    )
    .await;
    assert_eq!(status, 200, "{body}");
    assert_eq!(body["default_system"], "alpha");
    assert_eq!(
        body["systems"],
        json!([
            {
                "name": "alpha",
                "release": alpha_release,
                "generation": 1,
                "default_program": "main",
                "programs": ["main"]
            },
            {
                "name": "zebra",
                "release": zebra_release,
                "generation": 1,
                "default_program": "main",
                "programs": ["main"]
            }
        ])
    );

    let _main_release = publish_and_activate(
        &empty_server,
        plain_document("main-agent"),
        "cmd-main-agent",
    )
    .await;
    let (status, body) = send_json(
        &empty_server,
        reqwest::Method::GET,
        "/api/v1/systems",
        VIEW,
        None,
    )
    .await;
    assert_eq!(status, 200, "{body}");
    assert_eq!(body["default_system"], "main-agent");

    // 2. Host with ONLY `omni` active selects `omni`.
    let omni_dir = tempfile::tempdir().unwrap();
    let omni_host = open_host(&omni_dir.path().join("state")).await;
    let omni_server = serve(omni_host.router()).await;

    let omni_release = publish_and_activate(&omni_server, plain_document("omni"), "cmd-omni").await;
    let (status, body) = send_json(
        &omni_server,
        reqwest::Method::GET,
        "/api/v1/systems",
        VIEW,
        None,
    )
    .await;
    assert_eq!(status, 200, "{body}");
    assert_eq!(body["default_system"], "omni");
    assert_eq!(
        body["systems"],
        json!([
            {
                "name": "omni",
                "release": omni_release,
                "generation": 1,
                "default_program": "main",
                "programs": ["main"]
            }
        ])
    );

    // 3. Host with BOTH `omni` and `main-agent` active prefers `omni`.
    let main_release = publish_and_activate(
        &omni_server,
        plain_document("main-agent"),
        "cmd-main-with-omni",
    )
    .await;
    let (status, body) = send_json(
        &omni_server,
        reqwest::Method::GET,
        "/api/v1/systems",
        VIEW,
        None,
    )
    .await;
    assert_eq!(status, 200, "{body}");
    assert_eq!(body["default_system"], "omni");
    assert_eq!(
        body["systems"],
        json!([
            {
                "name": "main-agent",
                "release": main_release,
                "generation": 1,
                "default_program": "main",
                "programs": ["main"]
            },
            {
                "name": "omni",
                "release": omni_release,
                "generation": 1,
                "default_program": "main",
                "programs": ["main"]
            }
        ])
    );
}

#[tokio::test]
async fn projects_endpoint_returns_409_conflict_for_case_colliding_project_ids() {
    let dir = tempfile::tempdir().unwrap();
    let host = open_host(&dir.path().join("state")).await;
    let server = serve(host.router()).await;

    let (status, created) = send_json(
        &server,
        reqwest::Method::POST,
        "/api/v1/projects",
        EDIT,
        Some(json!({ "project_id": "demo-case", "agent": "helper" })),
    )
    .await;
    assert_eq!(status, 200, "{created}");

    let (status, conflict) = send_json(
        &server,
        reqwest::Method::POST,
        "/api/v1/projects",
        EDIT,
        Some(json!({ "project_id": "Demo-Case", "agent": "helper" })),
    )
    .await;
    assert_eq!(status, 409, "{conflict}");
    assert_eq!(conflict["error"]["code"], "conflict");

    let (status, missing) = send_json(
        &server,
        reqwest::Method::GET,
        "/api/v1/projects/Demo-Case",
        VIEW,
        None,
    )
    .await;
    assert_eq!(status, 404, "{missing}");
    assert_eq!(missing["error"]["code"], "not_found");
}
