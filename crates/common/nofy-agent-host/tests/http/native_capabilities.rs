#![cfg(target_os = "linux")]
use super::*;
#[path = "native_capabilities/declaration.rs"]
mod declaration;
#[path = "native_capabilities/isolation.rs"]
mod isolation;
#[path = "native_capabilities/matching.rs"]
mod matching;
#[path = "native_capabilities/programs.rs"]
mod programs;
#[path = "native_capabilities/scope.rs"]
mod scope;
#[path = "native_capabilities/substitution.rs"]
mod substitution;
async fn resident(path: &std::path::Path, reads: Arc<AtomicUsize>) -> KernelHost {
    super::host(path, reads).await
}

fn source() -> Value {
    serde_json::from_str(include_str!("../../examples/native-system.json")).unwrap()
}
fn config<'a>(system: &'a mut Value, id: &str) -> &'a mut Value {
    &mut system["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|module| module["reference"]["id"] == id)
        .unwrap()["config"]
}
fn launch(release: &str, id: &str, program: &str) -> Value {
    let mut request = json!({"run_id":id,"thread_id":id,"system":"native-capabilities","release":release,"program":program});
    if program == "chat" {
        request["input"] = json!({"text":"review","attachments":[]});
    }
    request
}
fn value(outcome: &Value) -> Value {
    serde_json::from_str(
        outcome["execution"]["outcome"]["Completed"]["output"]
            .as_str()
            .unwrap(),
    )
    .unwrap()
}
fn preview_body() -> Value {
    json!({"document":config(&mut source(),"prompt"),"variables":{},"tools":["skill"]})
}

#[tokio::test]
async fn prompt_preview_is_pure_bounded_and_uses_original_schema_fragments_and_admission() {
    let dir = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let host = resident(dir.path(), reads.clone()).await;
    let server = serve(host.router()).await;
    let body = preview_body();
    let (status, preview) = request(
        &server,
        reqwest::Method::POST,
        "/api/v1/prompts/preview",
        VIEW,
        body.clone(),
    )
    .await;
    assert_eq!(status, 200, "{preview}");
    assert_eq!(
        preview["text"],
        "Help support. Tools: skill\n\nKeep {{ literal }} exactly."
    );
    let text = preview["text"].as_str().unwrap();
    for fragment in preview["fragments"].as_array().unwrap() {
        assert_eq!(
            &text[fragment["start_byte"].as_u64().unwrap() as usize
                ..fragment["end_byte"].as_u64().unwrap() as usize],
            fragment["text"].as_str().unwrap()
        );
    }
    assert_eq!(preview["fragments"][0]["source"]["reference"], "identity");
    let mut overridden = body.clone();
    overridden["variables"] = json!({"team":"audit"});
    assert!(
        post(&server, "/api/v1/prompts/preview", overridden).await["text"]
            .as_str()
            .unwrap()
            .contains("Help audit")
    );
    for (key, value) in [
        ("variables", json!({"team":3})),
        ("variables", json!({"team":"x".repeat(65537)})),
        ("variables", json!({"tool_names":"forged"})),
        ("tools", json!(["skill", "skill"])),
        ("tools", json!(["bad tool name"])),
        (
            "tools",
            json!((0..1025).map(|i| format!("t{i}")).collect::<Vec<_>>()),
        ),
    ] {
        let mut invalid = body.clone();
        invalid[key] = value;
        assert_eq!(
            request(
                &server,
                reqwest::Method::POST,
                "/api/v1/prompts/preview",
                VIEW,
                invalid
            )
            .await
            .0,
            422
        );
    }
    let response = reqwest::Client::new()
        .post(format!("{}/api/v1/prompts/preview", server.url))
        .bearer_auth(VIEW)
        .header("content-type", "application/json")
        .body(vec![b'x'; 2 * 1024 * 1024 + 1])
        .send()
        .await
        .unwrap();
    assert_eq!(response.status(), 413);
    let mut unknown = body.clone();
    unknown["execute"] = json!(true);
    let response = reqwest::Client::new()
        .post(format!("{}/api/v1/prompts/preview", server.url))
        .bearer_auth(VIEW)
        .json(&unknown)
        .send()
        .await
        .unwrap();
    assert_eq!(response.status(), 422);
    // Both requests need exactly one shared admission, not one in the body
    // middleware plus a second permit inside the handler.
    tokio::time::timeout(Duration::from_secs(3), async {
        let (left, right) = tokio::join!(
            post(&server, "/api/v1/prompts/preview", body.clone()),
            post(&server, "/api/v1/prompts/preview", body)
        );
        assert_eq!(left, right);
    })
    .await
    .unwrap();
    assert_eq!(reads.load(Ordering::SeqCst), 0);
    assert!(host.control().inspect().await.unwrap().is_none());
}

#[tokio::test]
async fn native_definitions_are_enumerated_pure_portable_and_keep_old_skill_bodies_after_reopen() {
    use nofy_agent_runtime::supervisor::RunSupervisor;
    let dir = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let host = resident(dir.path(), reads.clone()).await;
    let server = serve(host.router()).await;
    let (_, modules) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/modules",
        VIEW,
        Value::Null,
    )
    .await;
    for name in [
        "prompt.document",
        "context.rules",
        "context.skills",
        "tool.skills",
    ] {
        assert!(
            modules["factories"]
                .as_array()
                .unwrap()
                .iter()
                .any(|module| module["factory"] == name)
        );
    }
    let original = source();
    post(&server, "/api/v1/validate", original.clone()).await;
    let first = post(&server, "/api/v1/import", original).await;
    let mut next = source();
    config(&mut next, "skills")["skills"][0]["body"] = json!("Revised review of $ARGUMENTS.");
    let second = post(&server, "/api/v1/import", next).await;
    assert_ne!(first["bundle"]["digest"], second["bundle"]["digest"]);
    for (release, id, expected) in [
        (&first, "old-skill", "Distinguish verified facts"),
        (&second, "new-skill", "Revised review"),
    ] {
        post(
            &server,
            "/api/v1/runs",
            launch(
                release["bundle"]["digest"].as_str().unwrap(),
                id,
                "load-skill",
            ),
        )
        .await;
        let system = host
            .control()
            .prepare(serde_json::from_value(release["bundle"]["document"].clone()).unwrap())
            .unwrap();
        RunSupervisor::new(host.store().clone())
            .execute_submitted(system.registry(), id)
            .await
            .unwrap();
        let output = value(&outcome(&server, id).await);
        assert!(output.to_string().contains(expected), "{output}");
        assert!(output.to_string().contains("the current change"));
    }
    assert_eq!(reads.load(Ordering::SeqCst), 0);
    drop(server);
    let reopened = resident(dir.path(), reads.clone()).await;
    let server = serve(reopened.router()).await;
    let id = "reopened-skill";
    post(
        &server,
        "/api/v1/runs",
        launch(
            first["bundle"]["digest"].as_str().unwrap(),
            id,
            "load-skill",
        ),
    )
    .await;
    let system = reopened
        .control()
        .prepare(serde_json::from_value(first["bundle"]["document"].clone()).unwrap())
        .unwrap();
    RunSupervisor::new(reopened.store().clone())
        .execute_submitted(system.registry(), id)
        .await
        .unwrap();
    assert!(
        value(&outcome(&server, id).await)
            .to_string()
            .contains("Distinguish verified facts")
    );
    let target = tempfile::tempdir().unwrap();
    let migrated = resident(target.path(), Arc::new(AtomicUsize::new(0))).await;
    let compiled = migrated
        .control()
        .prepare(serde_json::from_value(first["bundle"]["document"].clone()).unwrap())
        .unwrap();
    assert!(compiled.program_names().contains(&"load-skill"));
    let migrated_server = serve(migrated.router()).await;
    let imported = post(&migrated_server, "/api/v1/import", first["bundle"].clone()).await;
    assert_eq!(imported["bundle"]["digest"], first["bundle"]["digest"]);
}

#[tokio::test]
async fn original_prompt_rules_and_skill_context_reach_real_model_with_exact_preview_text() {
    let requests = Arc::new(Mutex::new(Vec::<Value>::new()));
    let provider = serve(
        Router::new()
            .route("/v1/chat/completions", post_handler())
            .with_state(requests.clone()),
    )
    .await;
    let dir = tempfile::tempdir().unwrap();
    let host = resident(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let mut system = source();
    let model = serde_json::to_value(document(&provider.url)).unwrap();
    system["modules"].as_array_mut().unwrap().extend(
        model["modules"]
            .as_array()
            .unwrap()
            .iter()
            .filter(|module| module["reference"]["id"] != "prompt")
            .cloned(),
    );
    system["programs"]["chat"] = json!({"kind":"agent","definition":{"name":"native-agent","model":{"id":"model","version":"1"},"prompt":{"id":"prompt","version":"1"},"tool_packs":[{"id":"skills","version":"1"}],"context_sources":[{"id":"rules","version":"1"},{"id":"skill-context","version":"1"}]}});
    let release = post(&server, "/api/v1/import", system).await;
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker_host = host.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 2).await.unwrap() });
    post(
        &server,
        "/api/v1/runs",
        launch(
            release["bundle"]["digest"].as_str().unwrap(),
            "native-context",
            "chat",
        ),
    )
    .await;
    assert_eq!(
        outcome(&server, "native-context").await["execution"]["status"],
        "completed"
    );
    let preview = post(&server, "/api/v1/prompts/preview", preview_body()).await;
    let calls = requests.lock().unwrap().clone();
    assert_eq!(calls.len(), 1);
    assert_eq!(calls[0]["messages"][0]["content"], preview["text"]);
    let messages = calls[0]["messages"].to_string();
    assert!(messages.contains("Report evidence before conclusions"));
    assert!(messages.contains("Review a change using inspectable evidence"));
    assert_eq!(calls[0]["tools"][0]["function"]["name"], "skill");
    stop.cancel();
    worker.await.unwrap();
}

#[tokio::test]
async fn shipped_file_entry_loads_native_skill_and_replays_it_after_real_process_restart() {
    let dir = tempfile::tempdir().unwrap();
    let source = dir.path().join("native.json");
    tokio::fs::write(&source, include_bytes!("../../examples/native-system.json"))
        .await
        .unwrap();
    let (server, mut child) = super::process::binary(dir.path(), &source).await;
    let (_, active) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/systems/native-capabilities/active",
        ADMIN,
        Value::Null,
    )
    .await;
    let release = active["release"].as_str().unwrap().to_owned();
    let command = launch(&release, "native-binary", "load-skill");
    post(&server, "/api/v1/runs", command.clone()).await;
    let old = outcome(&server, "native-binary").await;
    assert!(
        value(&old)
            .to_string()
            .contains("Distinguish verified facts")
    );
    child.kill().await.unwrap();
    child.wait().await.unwrap();
    drop(server);
    let (server, mut child) = super::process::binary(dir.path(), &source).await;
    post(&server, "/api/v1/runs", command).await;
    assert_eq!(
        outcome(&server, "native-binary").await["execution"]["outcome"],
        old["execution"]["outcome"]
    );
    child.kill().await.unwrap();
    child.wait().await.unwrap();
}
