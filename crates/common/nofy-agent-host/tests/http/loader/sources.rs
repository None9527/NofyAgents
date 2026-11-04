use super::*;
#[tokio::test]
async fn source_transfer_child() {
    let Ok(directory) = std::env::var("NOFY_SOURCE_TRANSFER_CHILD") else {
        return;
    };
    let directory = Path::new(&directory);
    let (kernel, server) = hosted(directory).await;
    let policy: SourcePolicy =
        serde_json::from_slice(&std::fs::read(directory.join("policy.json")).unwrap()).unwrap();
    grant(&server, &policy).await;
    credential(&server, Value::Null, "source-token-one").await;
    let command: AcquireImage =
        serde_json::from_slice(&std::fs::read(directory.join("command.json")).unwrap()).unwrap();
    kernel
        .loader()
        .acquire_image(command, Default::default())
        .await
        .unwrap();
    panic!("parent must terminate the pending transfer");
}
#[tokio::test]
async fn hard_exit_during_source_transfer_resumes_same_durable_command_without_false_completion() {
    let image = tokio::task::spawn_blocking(image).await.unwrap();
    let (payload, claim, key, _) = signed(&image);
    let (repo, state) = repository(payload).await;
    let policy = policy(&repo.url, &key);
    let command = command(&policy, claim, "crashed", "slow.json");
    let dir = tempfile::tempdir().unwrap();
    std::fs::write(
        dir.path().join("policy.json"),
        serde_json::to_vec(&policy).unwrap(),
    )
    .unwrap();
    std::fs::write(
        dir.path().join("command.json"),
        serde_json::to_vec(&command).unwrap(),
    )
    .unwrap();
    let mut child = tokio::process::Command::new(std::env::current_exe().unwrap())
        .args([
            "--exact",
            "loader::sources::source_transfer_child",
            "--nocapture",
        ])
        .env("NOFY_SOURCE_TRANSFER_CHILD", dir.path())
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::null())
        .kill_on_drop(true)
        .spawn()
        .unwrap();
    tokio::time::timeout(Duration::from_secs(15), state.entered.cancelled())
        .await
        .unwrap();
    child.kill().await.unwrap();
    let (kernel, server) = hosted(dir.path()).await;
    let before = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/runtime-acquisitions/crashed",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(before.1["status"]["state"], "pending");
    assert_eq!(before.1["attempt"], 1);
    state.gate.cancel();
    let completed = post(&server, "/api/v1/runtime-acquisitions", json!(&command)).await;
    assert_eq!(completed["status"]["state"], "complete");
    assert_eq!(completed["attempt"], 2);
    assert_eq!(state.requests.load(Ordering::SeqCst), 2);
    assert_eq!(
        post(&server, "/api/v1/runtime-acquisitions", json!(&command)).await,
        completed
    );
    assert_eq!(state.requests.load(Ordering::SeqCst), 2);
    assert_eq!(kernel.loader().images.list("", 1).unwrap().len(), 1);
}

#[tokio::test]
async fn source_transfer_admission_is_bounded_cancellable_and_shutdown_preserves_pending_intents() {
    let image = tokio::task::spawn_blocking(image).await.unwrap();
    let (payload, claim, key, _) = signed(&image);
    let (repo, state) = repository(payload).await;
    let policy = policy(&repo.url, &key);
    let dir = tempfile::tempdir().unwrap();
    let (kernel, server) = hosted(dir.path()).await;
    grant(&server, &policy).await;
    credential(&server, Value::Null, "source-token-one").await;
    let mut tasks = Vec::new();
    for id in ["occupied-one", "occupied-two"] {
        let loader = kernel.loader().clone();
        let request = command(&policy, claim.clone(), id, "slow.json");
        tasks.push(tokio::spawn(async move {
            loader.acquire_image(request, Default::default()).await
        }));
    }
    tokio::time::timeout(Duration::from_secs(15), async {
        while state.requests.load(Ordering::SeqCst) < 2 {
            tokio::task::yield_now().await;
        }
    })
    .await
    .unwrap();
    let loader = kernel.loader().clone();
    let request_body = command(&policy, claim, "queued", "image.json");
    let cancel = CancellationToken::new();
    let signal = cancel.clone();
    let mut queued = tokio::spawn(async move { loader.acquire_image(request_body, signal).await });
    assert!(
        tokio::time::timeout(Duration::from_millis(20), &mut queued)
            .await
            .is_err()
    );
    let metadata = tokio::time::timeout(
        Duration::from_secs(2),
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/runtime-acquisitions",
            VIEW,
            Value::Null,
        ),
    )
    .await
    .unwrap();
    assert_eq!(metadata.0, 200);
    assert_eq!(metadata.1["entries"].as_array().unwrap().len(), 2);
    cancel.cancel();
    assert!(queued.await.unwrap().is_err());
    assert_eq!(state.requests.load(Ordering::SeqCst), 2);
    assert!(kernel.loader().sources.acquisition("queued").is_err());
    kernel.shutdown();
    for task in tasks {
        assert!(task.await.unwrap().is_err());
    }
    assert!(kernel.loader().images.list("", 1).unwrap().is_empty());
    for id in ["occupied-one", "occupied-two"] {
        assert!(matches!(
            kernel.loader().sources.acquisition(id).unwrap().status,
            AcquisitionState::Pending
        ));
    }
    state.gate.cancel();
}

#[tokio::test]
async fn signing_cli_and_shipped_bootstrap_use_independent_trust_and_replay_offline_after_restart()
{
    use base64::Engine;
    use std::os::unix::fs::PermissionsExt;
    use tokio::io::AsyncBufReadExt;
    let image = tokio::task::spawn_blocking(image).await.unwrap();
    let (payload, _, _, seed) = signed(&image);
    let dir = tempfile::tempdir().unwrap();
    let image_path = dir.path().join("image.json");
    let seed_path = dir.path().join("seed");
    let signature = dir.path().join("attestation.json");
    std::fs::write(&image_path, &payload).unwrap();
    std::fs::write(
        &seed_path,
        base64::engine::general_purpose::STANDARD.encode(seed),
    )
    .unwrap();
    std::fs::set_permissions(&seed_path, std::fs::Permissions::from_mode(0o600)).unwrap();
    let input = image_path.clone();
    let key_path = seed_path.clone();
    let signature_output = signature.clone();
    let signed = tokio::task::spawn_blocking(move || {
        std::process::Command::new(env!("CARGO_BIN_EXE_nofy-runtime-image-sign"))
            .arg("--image")
            .arg(input)
            .arg("--key-file")
            .arg(key_path)
            .args(["--key-id", "publisher", "--output"])
            .arg(signature_output)
            .output()
            .unwrap()
    })
    .await
    .unwrap();
    assert!(
        signed.status.success(),
        "{}",
        String::from_utf8_lossy(&signed.stderr)
    );
    let public: Value = serde_json::from_slice(&signed.stdout).unwrap();
    let claim: ImageAttestation =
        serde_json::from_slice(&std::fs::read(&signature).unwrap()).unwrap();
    let (repo, state) = repository(payload).await;
    let policy = policy(&repo.url, public["public_key"].as_str().unwrap());
    claim.verify(&policy).unwrap();
    let command = command(&policy, claim, "bootstrap", "image.json");
    let policy_path = dir.path().join("trust.json");
    let source = dir.path().join("deployment.json");
    let access = dir.path().join("access.json");
    let state_dir = dir.path().join("state");
    std::fs::write(
        &policy_path,
        serde_json::to_vec(&json!([{"id":"repository","expected_revision":null,"policy":policy}]))
            .unwrap(),
    )
    .unwrap();
    std::fs::write(
        &source,
        serde_json::to_vec(&deployment(&image, &command)).unwrap(),
    )
    .unwrap();
    std::fs::write(&access,serde_json::to_vec(&json!([{"token_env":"NOFY_SOURCE_BOOTSTRAP_ACCESS","scopes":["read","edit","publish","resources","execute"]}])).unwrap()).unwrap();
    let mut previous = Value::Null;
    for turn in 0..2 {
        let mut child = tokio::process::Command::new(env!("CARGO_BIN_EXE_nofy-agent-host"))
            .args(["--listen", "127.0.0.1:0", "--state-dir"])
            .arg(&state_dir)
            .arg("--access-file")
            .arg(&access)
            .arg("--source-policy-file")
            .arg(&policy_path)
            .arg("--system-file")
            .arg(&source)
            .env("NOFY_SOURCE_BOOTSTRAP_ACCESS", ADMIN)
            .env("NOFY_SECRET_REPO", "source-token-one")
            .stdout(std::process::Stdio::null())
            .stderr(std::process::Stdio::piped())
            .kill_on_drop(true)
            .spawn()
            .unwrap();
        let mut lines = tokio::io::BufReader::new(child.stderr.take().unwrap()).lines();
        let url = tokio::time::timeout(Duration::from_secs(20), async {
            while let Some(line) = lines.next_line().await.unwrap() {
                if let Some(url) = line.strip_prefix("Nofy kernel listening on ") {
                    return url.to_owned();
                }
            }
            panic!("bootstrap exited before listening")
        })
        .await
        .unwrap();
        let task = tokio::spawn(async move { while lines.next_line().await.unwrap().is_some() {} });
        let server = Serving { url, task };
        let active = request(
            &server,
            reqwest::Method::GET,
            "/api/v1/systems/artifact-system/active",
            ADMIN,
            Value::Null,
        )
        .await
        .1;
        let release = active["release"].as_str().unwrap();
        post(&server, "/api/v1/runs", run(release, "bootstrap-run")).await;
        let result = outcome(&server, "bootstrap-run").await;
        assert_eq!(output(&result)["result"], 14, "{result}");
        if turn == 0 {
            previous = result["execution"].clone();
        } else {
            assert_eq!(result["execution"], previous);
        }
        assert_eq!(state.requests.load(Ordering::SeqCst), 1);
        child.kill().await.unwrap();
        drop(server);
    }
    std::fs::set_permissions(&seed_path, std::fs::Permissions::from_mode(0o644)).unwrap();
    let failed = tokio::task::spawn_blocking(move || {
        std::process::Command::new(env!("CARGO_BIN_EXE_nofy-runtime-image-sign"))
            .arg("--image")
            .arg(image_path)
            .arg("--key-file")
            .arg(seed_path)
            .args(["--key-id", "publisher", "--output"])
            .arg(dir.path().join("rejected.json"))
            .output()
            .unwrap()
    })
    .await
    .unwrap();
    assert!(!failed.status.success());
    assert!(
        !String::from_utf8_lossy(&failed.stderr)
            .contains(&base64::engine::general_purpose::STANDARD.encode(seed))
    );
}
use axum::{
    http::{HeaderMap, StatusCode},
    response::Response,
    routing::get,
};
use nofy_agent_host::{
    credentials::FileCredentials,
    loader::{images::RuntimeImage, sources::*},
};
use std::{
    collections::BTreeMap,
    io::Read,
    path::{Path, PathBuf},
};
#[derive(Clone)]
struct Repository {
    payload: Arc<Vec<u8>>,
    expected: Arc<Mutex<String>>,
    seen: Arc<Mutex<Vec<String>>>,
    requests: Arc<AtomicUsize>,
    gate: CancellationToken,
    entered: CancellationToken,
}
pub(super) fn image() -> RuntimeImage {
    let program = std::fs::canonicalize("/bin/sh").unwrap();
    let output = std::process::Command::new("ldd")
        .arg(&program)
        .output()
        .unwrap();
    assert!(output.status.success());
    let mut files = BTreeMap::from([("bin/shell".to_owned(), program)]);
    let mut loader = None;
    for line in String::from_utf8_lossy(&output.stdout).lines() {
        let words = line.split_whitespace().collect::<Vec<_>>();
        if words.len() >= 3 && words[1] == "=>" && words[2].starts_with('/') {
            files.insert(format!("lib/{}", words[0]), PathBuf::from(words[2]));
        } else if words.first().is_some_and(|p| p.starts_with('/')) {
            let path = PathBuf::from(words[0]);
            let name = format!("lib/{}", path.file_name().unwrap().to_str().unwrap());
            loader = Some(name.clone());
            files.insert(name, path);
        }
    }
    RuntimeImage::capture(serde_json::from_value(json!({"id":"source-shell","executable":"bin/shell","loader":loader,"library_dirs":["lib"],"files":files})).unwrap()).unwrap()
}
async fn repository(payload: Vec<u8>) -> (Serving, Repository) {
    let state = Repository {
        payload: Arc::new(payload),
        expected: Arc::new(Mutex::new("source-token-one".into())),
        seen: Default::default(),
        requests: Arc::new(AtomicUsize::new(0)),
        gate: CancellationToken::new(),
        entered: CancellationToken::new(),
    };
    async fn reply(
        State(state): State<Repository>,
        axum::extract::Path(file): axum::extract::Path<String>,
        headers: HeaderMap,
    ) -> Response {
        state.requests.fetch_add(1, Ordering::SeqCst);
        let authorization = headers
            .get("authorization")
            .and_then(|v| v.to_str().ok())
            .unwrap_or_default()
            .to_owned();
        state.seen.lock().unwrap().push(authorization.clone());
        if authorization != format!("Bearer {}", state.expected.lock().unwrap()) {
            return axum::http::Response::builder()
                .status(401)
                .body(axum::body::Body::from("private-response-must-not-leak"))
                .unwrap();
        }
        if file == "slow.json" {
            state.entered.cancel();
            state.gate.cancelled().await;
        }
        if file == "redirect.json" {
            return axum::http::Response::builder()
                .status(302)
                .header("location", "/repo/image.json")
                .body(axum::body::Body::empty())
                .unwrap();
        }
        if file == "encoded.json" {
            return axum::http::Response::builder()
                .header("content-encoding", "gzip")
                .body(axum::body::Body::from(state.payload.as_ref().clone()))
                .unwrap();
        }
        if file == "overlong.json" {
            let chunks = vec![
                Ok::<_, Infallible>(state.payload.as_ref().clone()),
                Ok(vec![b' ']),
            ];
            return Response::new(axum::body::Body::from_stream(futures::stream::iter(chunks)));
        }
        let mut payload = state.payload.as_ref().clone();
        if file == "corrupt.json" {
            payload[0] = b'[';
        }
        Response::new(axum::body::Body::from(payload))
    }
    let server = serve(
        Router::new()
            .route("/repo/{file}", get(reply))
            .with_state(state.clone()),
    )
    .await;
    (server, state)
}
fn signed(image: &RuntimeImage) -> (Vec<u8>, ImageAttestation, String, [u8; 32]) {
    let payload = serde_json::to_vec(image).unwrap();
    let mut seed = [0; 32];
    std::fs::File::open("/dev/urandom")
        .unwrap()
        .read_exact(&mut seed)
        .unwrap();
    let (attestation, key) = ImageAttestation::sign(&payload, "publisher".into(), &seed).unwrap();
    (payload, attestation, key, seed)
}
fn policy(url: &str, key: &str) -> SourcePolicy {
    SourcePolicy {
        base_url: format!("{url}/repo/"),
        keys: [("publisher".into(), key.into())].into(),
        credential_ref: Some("REPO".into()),
        allow_loopback_http: true,
    }
}
fn command(
    policy: &SourcePolicy,
    attestation: ImageAttestation,
    id: &str,
    path: &str,
) -> AcquireImage {
    AcquireImage {
        command_id: id.into(),
        source: "repository".into(),
        policy_digest: policy.digest().unwrap(),
        path: path.into(),
        attestation,
    }
}
async fn hosted(path: &Path) -> (KernelHost, Serving) {
    let credentials = Arc::new(
        FileCredentials::open(path.join("source-credentials.json"), "sources", None).unwrap(),
    );
    let kernel = host(path, Arc::new(AtomicUsize::new(0)))
        .await
        .with_credentials(credentials);
    let server = serve(kernel.router()).await;
    (kernel, server)
}
async fn grant(server: &Serving, policy: &SourcePolicy) -> Value {
    request(
        server,
        reqwest::Method::PUT,
        "/api/v1/runtime-sources/repository",
        ADMIN,
        json!({"expected_revision":null,"policy":policy}),
    )
    .await
    .1
}
async fn credential(server: &Serving, expected: Value, value: &str) {
    let result = request(
        server,
        reqwest::Method::PUT,
        "/api/v1/credentials/REPO",
        ADMIN,
        json!({"expected_revision":expected,"value":value}),
    )
    .await;
    assert_eq!(result.0, 200, "{}", result.1);
}
fn deployment(image: &RuntimeImage, command: &AcquireImage) -> Value {
    let mut system = document(
        &Value::Null,
        json!({"bundle":{"schema_version":1,"files":{"main.sh":"IFS= read -r line || :\nn=${line#'{\"n\":'}\nn=${n%'}'}\nprintf '{\"result\":%s,\"pid\":%s}' \"$((n*2))\" \"$$\"\n"}}}),
    );
    system["modules"][1]["factory"] = json!("resource.process_locked");
    system["modules"][1]["config"] = json!({"image":image.manifest.digest().unwrap()});
    system["modules"][2]["config"]["entrypoint"] = json!("main.sh");
    json!({"format":"nofy.deployment/v2","system":system,"runtime_sources":[command]})
}
#[tokio::test]
async fn nested_workflow_sources_and_artifact_aliases_export_the_complete_relocatable_closure() {
    let image = tokio::task::spawn_blocking(image).await.unwrap();
    let (payload, claim, key, _) = signed(&image);
    let (repo, state) = repository(payload).await;
    let policy = policy(&repo.url, &key);
    let command = command(&policy, claim, "nested", "image.json");
    let dir = tempfile::tempdir().unwrap();
    let (kernel, server) = hosted(dir.path()).await;
    grant(&server, &policy).await;
    credential(&server, Value::Null, "source-token-one").await;
    let mut file = deployment(&image, &command);
    let mut modules = file["system"]["modules"].take();
    let artifact = post(
        &server,
        "/api/v1/artifacts",
        modules[0]["config"]["bundle"].clone(),
    )
    .await;
    modules[0]["config"] = json!({"digest":artifact["digest"]});
    let r = |id: &str| json!({"id":id,"version":"1"});
    let leaf = json!({"host":{"name":"leaf"},"entry":r("main"),"modules":modules,
        "tool_runtimes":[{"reference":r("tools"),"definition":{"name":"leaf-tools","tool_packs":[r("tool")]}}],
        "workflows":[{"reference":r("main"),"input_schema":{"type":"object","required":["n"],"properties":{"n":{"type":"integer"}},"additionalProperties":false},
            "output_schema":true,"nodes":[{"id":"compute","input":{"from":"input"},"action":{"kind":"tool","runtime":r("tools"),"tool":"compute"}}],
            "output":{"from":"node","node":"compute"}}]});
    file["system"]["modules"] = json!([]);
    file["system"]["programs"]["compute"] = json!({"kind":"workflow","input":{"n":1},"document":{
        "host":{"name":"outer"},"entry":r("main"),"modules":[
            {"reference":r("child"),"factory":"resource.workflow","config":{"document":leaf}},
            {"reference":r("connected"),"factory":"tool.workflow_connected","config":{"name":"nested_compute"},"dependencies":{"workflow":r("child")}}
        ],"tool_runtimes":[{"reference":r("tools"),"definition":{"name":"outer-tools","tool_packs":[r("connected")]}}],
        "workflows":[{"reference":r("main"),"input_schema":{"type":"object","required":["n"],"properties":{"n":{"type":"integer"}},"additionalProperties":false},
            "output_schema":true,"nodes":[{"id":"child","input":{"from":"object","fields":{"input":{"from":"input"}}},"action":{"kind":"tool","runtime":r("tools"),"tool":"nested_compute"}}],
            "output":{"from":"node","node":"child"}}]
    }});
    let imported = post(&server, "/api/v1/import", file).await;
    let release = imported["bundle"]["digest"].as_str().unwrap();
    assert_eq!(state.requests.load(Ordering::SeqCst), 1);
    // The existing compiler hoists inline modules into the locked system scope.
    let nested = &imported["bundle"]["document"]["modules"][0]["config"]["document"]["modules"];
    assert!(nested[0]["config"]["bundle"].is_object(), "{imported}");
    assert!(nested[1]["config"]["manifest"].is_object(), "{imported}");
    let code: nofy_agent_runtime::artifact::ArtifactBundle =
        serde_json::from_value(nested[0]["config"]["bundle"].clone()).unwrap();
    let references=request(&server,reqwest::Method::POST,"/api/v1/loader/references",VIEW,
        json!({"objects":[{"kind":"image","digest":image.manifest.digest().unwrap()},{"kind":"artifact","digest":code.digest().unwrap()}]})).await;
    assert_eq!(references.0, 200, "{}", references.1);
    for object in references.1["references"].as_array().unwrap() {
        assert_eq!(object["counts"]["publication"], 1);
        assert_eq!(object["state"], "referenced");
    }
    assert_eq!(references.1["deletion_authorized"], false);
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let worker = tokio::spawn(async move { kernel.run_worker(signal, 1).await.unwrap() });
    post(&server, "/api/v1/runs", run(release, "nested-source")).await;
    let completed = outcome(&server, "nested-source").await;
    assert_eq!(output(&completed)["result"], 14, "{completed}");
    let endpoint = format!("/api/v1/releases/{release}/deployment");
    let (status, exported) =
        request(&server, reqwest::Method::GET, &endpoint, VIEW, Value::Null).await;
    assert_eq!(status, 200, "{exported}");
    assert_eq!(exported["format"], "nofy.deployment/v2");
    assert!(exported.get("runtime_images").is_none());
    assert_eq!(exported["runtime_sources"].as_array().unwrap().len(), 1);
    let explicit = request(
        &server,
        reqwest::Method::GET,
        &format!("{endpoint}?mode=sources"),
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(explicit.0, 200);
    assert_eq!(explicit.1, exported);
    let rejected = reqwest::Client::new()
        .get(format!("{}{endpoint}?mode=full", server.url))
        .bearer_auth(VIEW)
        .send()
        .await
        .unwrap();
    assert_eq!(rejected.status(), reqwest::StatusCode::BAD_REQUEST);
    let fresh = tempfile::tempdir().unwrap();
    let (other, remote) = hosted(fresh.path()).await;
    grant(&remote, &policy).await;
    credential(&remote, Value::Null, "source-token-one").await;
    let migrated = post(&remote, "/api/v1/import", exported).await;
    assert_eq!(migrated["bundle"]["digest"], release);
    let other_stop = CancellationToken::new();
    let signal = other_stop.clone();
    let task = tokio::spawn(async move { other.run_worker(signal, 1).await.unwrap() });
    post(&remote, "/api/v1/runs", run(release, "nested-migrated")).await;
    let completed = outcome(&remote, "nested-migrated").await;
    assert_eq!(output(&completed)["result"], 14, "{completed}");
    other_stop.cancel();
    task.await.unwrap();
    assert_eq!(state.requests.load(Ordering::SeqCst), 2);
    stop.cancel();
    worker.await.unwrap();
}
#[tokio::test]
async fn signed_source_deployment_is_pure_then_acquires_with_live_credentials_and_exports_relocatable_sources()
 {
    let image = tokio::task::spawn_blocking(image).await.unwrap();
    let (payload, attestation, key, _) = signed(&image);
    let (repo, state) = repository(payload).await;
    let policy = policy(&repo.url, &key);
    let dir = tempfile::tempdir().unwrap();
    let (kernel, server) = hosted(dir.path()).await;
    assert_eq!(
        request(
            &server,
            reqwest::Method::PUT,
            "/api/v1/runtime-sources/repository",
            VIEW,
            json!({"expected_revision":null,"policy":policy})
        )
        .await
        .0,
        403
    );
    assert_eq!(
        grant(&server, &policy).await["policy_digest"],
        policy.digest().unwrap()
    );
    let command = command(&policy, attestation, "initial", "image.json");
    let file = deployment(&image, &command);
    let preview = request(
        &server,
        reqwest::Method::POST,
        "/api/v1/validate",
        ADMIN,
        file.clone(),
    )
    .await;
    assert_eq!(preview.0, 404, "{}", preview.1);
    assert_eq!(state.requests.load(Ordering::SeqCst), 0);
    // A digest alone cannot supply metadata offline. A complete manifest plus
    // a trusted exact source lock is enough for a plan, never an installation.
    let mut described = file.clone();
    described["system"]["modules"][1]["config"] = json!({"manifest":image.manifest});
    let preview = request(
        &server,
        reqwest::Method::POST,
        "/api/v1/validate",
        VIEW,
        described.clone(),
    )
    .await;
    assert_eq!(preview.0, 200, "{}", preview.1);
    assert_eq!(state.requests.load(Ordering::SeqCst), 0);
    let mut unsigned = described.clone();
    unsigned["runtime_sources"][0]["attestation"]["payload_digest"] = json!("0".repeat(64));
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/validate",
            VIEW,
            unsigned,
        )
        .await
        .0,
        422
    );
    let mut missing = described;
    missing["runtime_sources"] = json!([]);
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/validate",
            VIEW,
            missing,
        )
        .await
        .0,
        404
    );
    assert_eq!(state.requests.load(Ordering::SeqCst), 0);
    assert!(!dir.path().join("source-credentials.json.lock").exists());
    assert_eq!(
        std::fs::read_dir(dir.path().join("loader/images/objects"))
            .unwrap()
            .count(),
        0
    );
    credential(&server, Value::Null, "source-token-one").await;
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/import",
            PUBLISH,
            file.clone()
        )
        .await
        .0,
        403
    );
    let imported = post(&server, "/api/v1/import", file.clone()).await;
    let release = imported["bundle"]["digest"].as_str().unwrap();
    assert_eq!(state.requests.load(Ordering::SeqCst), 1);
    assert_eq!(
        post(&server, "/api/v1/import", file).await["bundle"]["digest"],
        release
    );
    assert_eq!(state.requests.load(Ordering::SeqCst), 1);
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let worker_kernel = kernel.clone();
    let worker = tokio::spawn(async move { worker_kernel.run_worker(signal, 1).await.unwrap() });
    post(&server, "/api/v1/runs", run(release, "sourced")).await;
    let first = outcome(&server, "sourced").await;
    assert_eq!(output(&first)["result"], 14, "{first}");
    let exported = request(
        &server,
        reqwest::Method::GET,
        &format!("/api/v1/releases/{release}/deployment?mode=sources"),
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(exported.0, 200);
    assert_eq!(exported.1["format"], "nofy.deployment/v2");
    assert!(!exported.1.to_string().contains("source-token"));
    assert_eq!(state.requests.load(Ordering::SeqCst), 1);
    *state.expected.lock().unwrap() = "source-token-two".into();
    credential(&server, json!(1), "source-token-two").await;
    let mut rotated = command.clone();
    rotated.command_id = "rotated".into();
    post(&server, "/api/v1/runtime-acquisitions", json!(&rotated)).await;
    assert_eq!(
        state.seen.lock().unwrap().as_slice(),
        ["Bearer source-token-one", "Bearer source-token-two"]
    );
    let fresh = tempfile::tempdir().unwrap();
    let (other, remote) = hosted(fresh.path()).await;
    grant(&remote, &policy).await;
    credential(&remote, Value::Null, "source-token-two").await;
    let migrated = post(&remote, "/api/v1/import", exported.1).await;
    assert_eq!(migrated["bundle"]["digest"], release);
    let other_stop = CancellationToken::new();
    let signal = other_stop.clone();
    let task = tokio::spawn(async move { other.run_worker(signal, 1).await.unwrap() });
    post(&remote, "/api/v1/runs", run(release, "remote-source")).await;
    assert_eq!(
        output(&outcome(&remote, "remote-source").await)["result"],
        14
    );
    let metadata = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/runtime-acquisitions",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(metadata.0, 200);
    assert!(!metadata.1.to_string().contains("source-token"));
    other_stop.cancel();
    task.await.unwrap();
    stop.cancel();
    worker.await.unwrap();
}

#[tokio::test]
async fn reference_inspection_retains_unfinished_acquisition_but_not_completed_provenance() {
    let image = tokio::task::spawn_blocking(image).await.unwrap();
    let (payload, attestation, key, _) = signed(&image);
    let (repo, state) = repository(payload).await;
    let policy = policy(&repo.url, &key);
    let dir = tempfile::tempdir().unwrap();
    let (kernel, server) = hosted(dir.path()).await;
    grant(&server, &policy).await;
    let command = command(&policy, attestation, "retention", "image.json");
    let query = json!({"objects":[{"kind":"image","digest":image.manifest.digest().unwrap()}]});
    let before = request(
        &server,
        reqwest::Method::POST,
        "/api/v1/loader/references",
        VIEW,
        query.clone(),
    )
    .await;
    assert_eq!(before.0, 200, "{}", before.1);
    assert!(!dir.path().join("source-credentials.json.lock").exists());
    let held = kernel.loader().commits.exclusive().unwrap();
    let blocked = request(
        &server,
        reqwest::Method::POST,
        "/api/v1/runtime-acquisitions",
        ADMIN,
        json!(&command),
    )
    .await;
    assert_eq!(blocked.0, 503);
    assert_eq!(state.requests.load(Ordering::SeqCst), 0);
    drop(held);
    let failed = request(
        &server,
        reqwest::Method::POST,
        "/api/v1/runtime-acquisitions",
        ADMIN,
        json!(&command),
    )
    .await;
    assert_eq!(failed.0, 422);
    assert_eq!(state.requests.load(Ordering::SeqCst), 0);
    let pending = request(
        &server,
        reqwest::Method::POST,
        "/api/v1/loader/references",
        VIEW,
        query.clone(),
    )
    .await;
    assert_eq!(pending.0, 200, "{}", pending.1);
    assert_eq!(pending.1["references"][0]["counts"]["acquisition"], 1);
    assert_eq!(pending.1["deletion_authorized"], false);
    credential(&server, Value::Null, "source-token-one").await;
    post(&server, "/api/v1/runtime-acquisitions", json!(&command)).await;
    let complete = request(
        &server,
        reqwest::Method::POST,
        "/api/v1/loader/references",
        VIEW,
        query,
    )
    .await;
    assert_eq!(complete.0, 200, "{}", complete.1);
    assert_eq!(complete.1["references"][0]["state"], "not_observed");
    assert_eq!(state.requests.load(Ordering::SeqCst), 1);
    assert!(!complete.1.to_string().contains("source-token-one"));
}
#[tokio::test]
async fn source_integrity_failures_and_revocation_never_admit_unverified_bytes_or_leak_credentials()
{
    let image = tokio::task::spawn_blocking(image).await.unwrap();
    let (payload, attestation, key, _) = signed(&image);
    let (repo, state) = repository(payload).await;
    let policy = policy(&repo.url, &key);
    let dir = tempfile::tempdir().unwrap();
    let (_, server) = hosted(dir.path()).await;
    let granted = grant(&server, &policy).await;
    credential(&server, Value::Null, "source-token-one").await;
    let mut forged = command(&policy, attestation.clone(), "forged", "image.json");
    forged.attestation.payload_digest = "0".repeat(64);
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/runtime-acquisitions",
            ADMIN,
            json!(forged)
        )
        .await
        .0,
        422
    );
    assert_eq!(state.requests.load(Ordering::SeqCst), 0);
    for path in [
        "redirect.json",
        "encoded.json",
        "corrupt.json",
        "overlong.json",
    ] {
        let id = path.trim_end_matches(".json");
        let request_body = command(&policy, attestation.clone(), id, path);
        let (status, error) = request(
            &server,
            reqwest::Method::POST,
            "/api/v1/runtime-acquisitions",
            ADMIN,
            json!(request_body),
        )
        .await;
        assert_eq!(status, 422, "{error}");
        assert!(!error.to_string().contains("private-response"));
        let record = request(
            &server,
            reqwest::Method::GET,
            &format!("/api/v1/runtime-acquisitions/{id}"),
            VIEW,
            Value::Null,
        )
        .await
        .1;
        assert_eq!(record["status"]["state"], "failed");
    }
    assert_eq!(state.requests.load(Ordering::SeqCst), 4);
    let slow = command(&policy, attestation, "revoked", "slow.json");
    let url = server.url.clone();
    let pending = tokio::spawn(async move {
        reqwest::Client::new()
            .post(format!("{url}/api/v1/runtime-acquisitions"))
            .bearer_auth(ADMIN)
            .json(&slow)
            .send()
            .await
            .unwrap()
    });
    tokio::time::timeout(Duration::from_secs(3), state.entered.cancelled())
        .await
        .unwrap();
    let revoked = request(
        &server,
        reqwest::Method::DELETE,
        "/api/v1/runtime-sources/repository",
        ADMIN,
        json!({"expected_revision":granted["revision"]}),
    )
    .await;
    assert_eq!(revoked.0, 200);
    state.gate.cancel();
    let result = pending.await.unwrap();
    assert_eq!(result.status(), StatusCode::UNPROCESSABLE_ENTITY);
    assert_eq!(
        std::fs::read_dir(dir.path().join("loader/images/objects"))
            .unwrap()
            .count(),
        0
    );
}
