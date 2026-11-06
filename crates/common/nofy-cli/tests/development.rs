use nofy_agent_client::{Engine, KernelClient};
use nofy_agent_host::{
    KernelHost,
    auth::{Authorizer, Scope},
    native,
};
use nofy_agent_project::Source;
use nofy_agent_runtime::credentials::EnvironmentCredentials;
use rmcp::{
    ServiceExt,
    model::*,
    transport::{
        StreamableHttpClientTransport, TokioChildProcess,
        streamable_http_client::StreamableHttpClientTransportConfig,
    },
};
use serde_json::{Value, json};
use std::{
    path::{Path, PathBuf},
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
    },
    time::Duration,
};

const ADMIN: &str = "development-test-admin-000000000000000000000001";
const READ: &str = "development-test-reader-00000000000000000000001";
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
    let task = tokio::spawn(async move {
        axum::serve(listener, router).await.unwrap();
    });
    Serving { url, task }
}
fn presets() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../../../presets")
        .canonicalize()
        .unwrap()
}
async fn host(path: &Path) -> KernelHost {
    let credentials = Arc::new(
        EnvironmentCredentials::new("development-test", "NOFY_DEVELOPMENT_TEST_SECRET_").unwrap(),
    );
    let auth = Authorizer::new(vec![
        (
            ADMIN.into(),
            [
                Scope::Read,
                Scope::Edit,
                Scope::Publish,
                Scope::Execute,
                Scope::Resources,
            ]
            .into(),
        ),
        (READ.into(), [Scope::Read].into()),
    ])
    .unwrap();
    let binary = std::env::current_exe()
        .unwrap()
        .parent()
        .unwrap()
        .parent()
        .unwrap()
        .join(format!("nofy-agent-host{}", std::env::consts::EXE_SUFFIX));
    // The helper belongs to another package, so `cargo test -p nofy-cli` does not
    // build it. Say so, rather than failing later with a bare "No such file".
    assert!(
        binary.is_file(),
        "these tests run the real kernel helper at {}; build it first with `cargo build -p nofy-agent-host`",
        binary.display()
    );
    KernelHost::open(path, native::registry(credentials).unwrap(), auth)
        .await
        .unwrap()
        .with_templates(&presets())
        .unwrap()
        .with_loader_helper(&binary)
        .unwrap()
}
fn engine(url: &str, token: &str) -> Engine {
    Engine::new(KernelClient::new(url, Some(token.into()), Duration::from_secs(10)).unwrap())
}
async fn cli(url: &str, args: &[&str]) -> (i32, Value) {
    let config = tempfile::NamedTempFile::new().unwrap();
    std::fs::write(config.path(), "[profiles.local]\n").unwrap();
    let output = tokio::process::Command::new(env!("CARGO_BIN_EXE_nofy"))
        .env("NOFY_ACCESS_TOKEN", ADMIN)
        .env_remove("NOFY_CONFIG")
        .env_remove("NOFY_PROFILE")
        .args(["--endpoint", url])
        .args([
            "--config",
            config.path().to_str().unwrap(),
            "--token-env",
            "NOFY_ACCESS_TOKEN",
            "--format",
            "json",
        ])
        .args(args)
        .output()
        .await
        .unwrap();
    let value = serde_json::from_slice(&output.stdout).unwrap_or_else(|_| {
        panic!(
            "invalid stdout: {} stderr: {}",
            String::from_utf8_lossy(&output.stdout),
            String::from_utf8_lossy(&output.stderr)
        )
    });
    (output.status.code().unwrap_or(-1), value)
}
async fn cli_ok(url: &str, args: &[&str]) -> Value {
    let (code, value) = cli(url, args).await;
    assert_eq!(code, 0, "{value}");
    value
}
fn input_file(dir: &Path, name: &str, value: &Value) -> String {
    let path = dir.join(name);
    std::fs::write(&path, serde_json::to_vec(value).unwrap()).unwrap();
    path.to_string_lossy().into_owned()
}
fn client_info() -> ClientConfig {
    ClientConfig::new(
        ClientCapabilities::default(),
        Implementation::new("nofy-acceptance", "1"),
    )
    .with_protocol_version(ProtocolVersion::V_2025_11_25)
}
async fn mcp_call(peer: &rmcp::Peer<rmcp::RoleClient>, tool: &str, args: Value) -> Value {
    let result = peer
        .call_tool(
            CallToolRequestParams::new(tool.to_owned())
                .with_arguments(args.as_object().unwrap().clone()),
        )
        .await
        .unwrap();
    let value = result.structured_content.unwrap();
    assert_ne!(result.is_error, Some(true), "{value}");
    value
}
#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn local_cli_edits_literal_sources_offline_and_packages_exact_bytes() {
    let dir = tempfile::tempdir().unwrap();
    let project = dir.path().join("source");
    let p = project.to_str().unwrap();
    cli_ok(
        "http://127.0.0.1:1",
        &["project", "init", p, "--empty", "--agent", "coder"],
    )
    .await;
    cli_ok(
        "http://127.0.0.1:1",
        &[
            "agent",
            "module",
            "add",
            "coder",
            "--project",
            p,
            "--offline",
            "--id",
            "prompt",
            "--factory",
            "prompt.static",
            "--slot",
            "prompt",
            "--set",
            "/text=literal $file text",
        ],
    )
    .await;
    let check = cli_ok(
        "http://127.0.0.1:1",
        &[
            "agent",
            "module",
            "inspect",
            "coder",
            "prompt",
            "--project",
            p,
            "--offline",
        ],
    )
    .await;
    assert!(
        check["data"]["module_json"]
            .as_str()
            .unwrap()
            .contains("literal $file text")
    );
    let archive = dir.path().join("source.tar.gz");
    let code = dir.path().join("method.rhai");
    for (id, body) in [
        ("tools/read", "args.value * 2"),
        ("tools_read", "args.value * 3"),
    ] {
        std::fs::write(&code, body).unwrap();
        let binding = format!("/source=@{}", code.display());
        cli_ok(
            "http://127.0.0.1:1",
            &[
                "agent",
                "module",
                "add",
                "coder",
                "--project",
                p,
                "--offline",
                "--id",
                id,
                "--factory",
                "tool.rhai",
                "--slot",
                "tool_packs",
                "--source",
                &binding,
            ],
        )
        .await;
    }
    let source = nofy_agent_project::load_directory(&project).unwrap();
    let bodies: std::collections::BTreeSet<_> = source
        .files
        .iter()
        .filter(|(p, _)| p.ends_with("method.rhai"))
        .map(|(_, f)| f.utf8().unwrap())
        .collect();
    assert_eq!(
        bodies,
        ["args.value * 2".to_owned(), "args.value * 3".to_owned()].into()
    );
    let a = archive.to_str().unwrap();
    cli_ok("http://127.0.0.1:1", &["project", "pack", p, "--output", a]).await;
    assert!(archive.metadata().unwrap().len() > 0);
    assert_eq!(
        cli("http://127.0.0.1:1", &["project", "pack", p, "--output", a])
            .await
            .0,
        9
    );
    assert_eq!(
        cli(
            "http://127.0.0.1:1",
            &[
                "agent",
                "module",
                "set",
                "coder",
                "prompt",
                "--project",
                p,
                "--offline",
                "--expected-digest",
                "wrong",
                "--set",
                "/text=must not land"
            ]
        )
        .await
        .0,
        4
    );
    assert!(
        !nofy_agent_project::load_directory(&project)
            .unwrap()
            .raw("preset.json")
            .unwrap()
            .contains("must not land")
    );
}
#[tokio::test(flavor = "multi_thread", worker_threads = 3)]
async fn cli_and_official_stdio_client_share_source_publish_run_and_session_state() {
    let calls = Arc::new(AtomicUsize::new(0));
    let counter = calls.clone();
    let provider = serve(axum::Router::new().route(
        "/v1/chat/completions",
        axum::routing::post(move || {
            let counter = counter.clone();
            async move {
                counter.fetch_add(1, Ordering::SeqCst);
                let frames = nofy_test_support::sse::chat_completion_events_exact(
                    "session reply",
                    "test-model",
                );
                axum::response::Sse::new(futures::stream::iter(
                    frames.into_iter().map(Ok::<_, std::convert::Infallible>),
                ))
            }
        }),
    ))
    .await;
    let dir = tempfile::tempdir().unwrap();
    let kernel = host(dir.path()).await;
    let server = serve(kernel.router()).await;
    let mut system: Value = serde_json::from_str(include_str!(
        "../../nofy-agent-host/examples/code-system.json"
    ))
    .unwrap();
    system["name"] = json!("coder");
    for m in system["modules"].as_array_mut().unwrap() {
        match m["reference"]["id"].as_str().unwrap() {
            "provider" => {
                m["config"]["base_url"] = json!(format!("{}/v1/", provider.url));
                m["config"]["models"] = json!(["test-model"]);
                m["config"]["header_credentials"] = json!({});
            }
            "model" => m["config"]["model"] = json!("test-model"),
            _ => {}
        }
    }
    let program = system["programs"]
        .as_object_mut()
        .unwrap()
        .remove("chat")
        .unwrap();
    system["programs"]["coder"] = program;
    let mut source = Source::empty("coder", "coder").unwrap();
    source
        .put_json(
            "preset.json",
            &json!({"format":"nofy.preset/v1","system":system}),
        )
        .unwrap();
    source.refresh_manifest().unwrap();
    let create = input_file(
        dir.path(),
        "create.json",
        &json!({"agent":"coder","source":source}),
    );
    let created = cli_ok(&server.url, &["agent", "create", "--input", &create]).await;
    assert_eq!(created["refs"]["source_revision"], "0");
    cli_ok(
        &server.url,
        &[
            "agent",
            "module",
            "add",
            "coder",
            "--id",
            "session",
            "--factory",
            "session_policy.rules",
            "--slot",
            "session",
            "--config-json",
            r#"{"naming":{"prefix":"coder"},"admission":{"when_busy":"queue"},"routing":{"mode":"explicit","keys":[]},"history":{"archive_after_idle_seconds":null}}"#,
        ],
    )
    .await;
    let build = dir.path().join("deployment.json");
    cli_ok(
        &server.url,
        &[
            "agent",
            "build",
            "coder",
            "--output",
            build.to_str().unwrap(),
        ],
    )
    .await;
    let plan = cli_ok(&server.url, &["agent", "plan", "coder"]).await;
    assert_eq!(plan["data"]["published"], false);
    assert_eq!(
        kernel
            .control()
            .inspect()
            .await
            .unwrap()
            .map_or(0, |catalog| catalog.data.publications.len()),
        0
    );
    let applied = cli_ok(
        &server.url,
        &["agent", "apply", "coder", "--command-id", "initial-apply"],
    )
    .await;
    let release = applied["refs"]["release"].as_str().unwrap().to_owned();
    assert_eq!(calls.load(Ordering::SeqCst), 0);
    let token_path = dir.path().join("access-token");
    std::fs::write(&token_path, ADMIN).unwrap();
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(&token_path, std::fs::Permissions::from_mode(0o600)).unwrap();
    }
    let mut command = tokio::process::Command::new(env!("CARGO_BIN_EXE_nofy"));
    command.args([
        "mcp",
        "serve",
        "--endpoint",
        &server.url,
        "--token-file",
        token_path.to_str().unwrap(),
    ]);
    let client = client_info()
        .serve(TokioChildProcess::new(command).unwrap())
        .await
        .unwrap();
    assert_eq!(
        client.peer_info().unwrap().protocol_version,
        ProtocolVersion::V_2025_11_25
    );
    let tools = client.list_all_tools().await.unwrap();
    assert_eq!(tools.len(), 95);
    assert!(!tools.iter().any(|t| t.name == "nofy_credential_put"));
    let inspect = mcp_call(
        &client,
        "nofy_agent_inspect",
        json!({"target":{"kind":"project","project_id":"coder"},"agent":"coder"}),
    )
    .await;
    let revision = inspect["refs"]["source_revision"].as_str().unwrap();
    let edited=mcp_call(&client,"nofy_agent_module_set",json!({"target":{"kind":"project","project_id":"coder","expected_revision":revision},"agent":"coder","module":"prompt","set":{"/text":"edited through MCP"}})).await;
    let conflict=client.call_tool(CallToolRequestParams::new("nofy_agent_module_set").with_arguments(json!({"target":{"kind":"project","project_id":"coder","expected_revision":revision},"agent":"coder","module":"prompt","set":{"/text":"stale"}}).as_object().unwrap().clone())).await.unwrap();
    assert_eq!(conflict.is_error, Some(true));
    assert_eq!(
        conflict.structured_content.unwrap()["error"]["code"],
        "conflict"
    );
    let cli_view = cli_ok(&server.url, &["agent", "inspect", "coder"]).await;
    assert_eq!(
        cli_view["refs"]["source_revision"],
        edited["refs"]["source_revision"]
    );
    let request = json!({"run_id":"first","thread_id":"thread","system":"coder","release":release,"program":"coder","input":{"text":"hello","attachments":[]}});
    let started=mcp_call(&client,"nofy_session_start",json!({"session_id":"conversation","command_id":"start","expected_session_revision":null,"request_json":request.to_string()})).await;
    assert_eq!(started["data"]["phase"], "applied");
    let stop = tokio_util::sync::CancellationToken::new();
    let worker_host = kernel.clone();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move {
        worker_host.run_worker(worker_stop, 2).await.unwrap();
    });
    tokio::time::timeout(Duration::from_secs(15), async {
        loop {
            let inspect = engine(&server.url, ADMIN)
                .execute("run.inspect", json!({"run_id":"first"}))
                .await;
            let native: Value =
                serde_json::from_str(inspect.data["native_json"].as_str().unwrap()).unwrap();
            if native.pointer("/execution/status").and_then(Value::as_str) == Some("completed") {
                break;
            }
            tokio::time::sleep(Duration::from_millis(40)).await;
        }
    })
    .await
    .unwrap();
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    let closed = mcp_call(
        &client,
        "nofy_session_close",
        json!({"session_id":"conversation","command_id":"close","expected_session_revision":"0"}),
    )
    .await;
    assert_eq!(closed["data"]["session_revision"], "1");
    let replay=mcp_call(&client,"nofy_session_start",json!({"session_id":"conversation","command_id":"start","expected_session_revision":null,"request_json":request.to_string()})).await;
    assert_eq!(replay["data"], started["data"]);
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    let exported = dir.path().join("export.tar.gz");
    cli_ok(
        &server.url,
        &[
            "agent",
            "export",
            "coder",
            "--output",
            exported.to_str().unwrap(),
        ],
    )
    .await;
    assert!(exported.metadata().unwrap().len() > 0);
    client.cancel().await.unwrap();
    stop.cancel();
    worker.await.unwrap();
}
#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn http_mcp_forwards_each_identity_and_rejects_untrusted_origins() {
    let dir = tempfile::tempdir().unwrap();
    let kernel = host(dir.path()).await;
    let server = serve(kernel.router()).await;
    let base = engine(&server.url, ADMIN);
    let bridge = serve(nofy_agent_mcp::http_router(
        base,
        vec!["https://allowed.example".into()],
        vec![],
        tokio_util::sync::CancellationToken::new(),
    ))
    .await;
    let url = format!("{}/mcp", bridge.url);
    let http = reqwest::Client::new();
    assert_eq!(
        http.post(&url)
            .json(&json!({}))
            .send()
            .await
            .unwrap()
            .status(),
        401
    );
    assert_eq!(
        http.post(&url)
            .bearer_auth(ADMIN)
            .header("origin", "https://denied.example")
            .json(&json!({}))
            .send()
            .await
            .unwrap()
            .status(),
        403
    );
    let transport = StreamableHttpClientTransport::from_config(
        StreamableHttpClientTransportConfig::with_uri(url.clone()).auth_header(READ),
    );
    let reader = client_info().serve(transport).await.unwrap();
    let denied = reader
        .call_tool(
            CallToolRequestParams::new("nofy_agent_create").with_arguments(
                json!({"agent":"must-not-exist"})
                    .as_object()
                    .unwrap()
                    .clone(),
            ),
        )
        .await
        .unwrap();
    assert_eq!(denied.is_error, Some(true));
    assert_eq!(
        denied.structured_content.unwrap()["error"]["code"],
        "forbidden"
    );
    let transport = StreamableHttpClientTransport::from_config(
        StreamableHttpClientTransportConfig::with_uri(url).auth_header(ADMIN),
    );
    let admin = client_info().serve(transport).await.unwrap();
    let created = mcp_call(
        &admin,
        "nofy_agent_create",
        json!({"agent":"http-agent","include_source":true}),
    )
    .await;
    let source = created["data"]["source"].clone();
    let archive = mcp_call(&admin, "nofy_project_pack", json!({"source":source})).await;
    let uri = archive["data"]["uri"].as_str().unwrap();
    let chunk = admin
        .read_resource(ReadResourceRequestParams::new(format!(
            "{uri}?offset=0&limit=128"
        )))
        .await
        .unwrap();
    let text = match &chunk.contents[0] {
        ResourceContents::TextResourceContents { text, .. } => text,
        _ => panic!("text chunk expected"),
    };
    let chunk: Value = serde_json::from_str(text).unwrap();
    assert_eq!(chunk["offset"], "0");
    assert_eq!(chunk["next_offset"], "128");
    assert_eq!(chunk["eof"], false);
    assert!(
        admin
            .read_resource(ReadResourceRequestParams::new("file:///etc/passwd"))
            .await
            .is_err()
    );
    reader.cancel().await.unwrap();
    admin.cancel().await.unwrap();
}

#[path = "development/repositories.rs"]
mod repositories;

#[path = "development/assembly.rs"]
mod assembly;
