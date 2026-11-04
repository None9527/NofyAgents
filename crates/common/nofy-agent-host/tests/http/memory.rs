use super::*;
#[path = "memory/control.rs"]
mod control;
fn source() -> Value {
    serde_json::from_str(include_str!("../../examples/memory-system.json")).unwrap()
}
#[tokio::test]
async fn durable_example_restarts_undo_and_replays_its_receipt_across_actual_host_processes() {
    let dir = tempfile::tempdir().unwrap();
    let file = dir.path().join("system.json");
    tokio::fs::write(&file, serde_json::to_vec(&source()).unwrap())
        .await
        .unwrap();
    let (server, mut parent) = super::process::binary(dir.path(), &file).await;
    let release = post(&server, "/api/v1/import", source()).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    post(
        &server,
        "/api/v1/runs",
        submission(&release, "durable-write", "remember"),
    )
    .await;
    let created = value(&outcome(&server, "durable-write").await);
    let mut revise = submission(&release, "durable-revise", "remember");
    revise["parameters"] = json!({"operation":"revise","request":{"target":created["target"],"replacement":"Deployment uses a green release channel."}});
    post(&server, "/api/v1/runs", revise).await;
    let revised = value(&outcome(&server, "durable-revise").await);
    let closed = post(
        &server,
        "/api/v1/memory/resources/apply",
        control::change(&release, "process-close", 0, false),
    )
    .await;
    assert_eq!(closed["revision"], 1);
    parent.kill().await.unwrap();
    parent.wait().await.unwrap();
    drop(server);
    let (server, mut parent) = super::process::binary(dir.path(), &file).await;
    assert_eq!(
        post(
            &server,
            "/api/v1/memory/resources/inspect",
            control::selector(&release)
        )
        .await["open"],
        false
    );
    assert_eq!(
        post(
            &server,
            "/api/v1/memory/resources/apply",
            control::change(&release, "process-close", 0, false)
        )
        .await,
        closed
    );
    post(
        &server,
        "/api/v1/memory/resources/apply",
        control::change(&release, "process-open", 1, true),
    )
    .await;
    let mut undo = submission(&release, "durable-undo", "remember");
    undo["parameters"] = json!({"operation":"undo","request":revised["undo_token"]});
    post(&server, "/api/v1/runs", undo).await;
    let receipt = value(&outcome(&server, "durable-undo").await);
    assert_eq!(receipt["restored"], true);
    parent.kill().await.unwrap();
    parent.wait().await.unwrap();
    drop(server);
    let (server, mut parent) = super::process::binary(dir.path(), &file).await;
    let mut undo = submission(&release, "durable-replay", "remember");
    undo["parameters"] = json!({"operation":"undo","request":revised["undo_token"]});
    post(&server, "/api/v1/runs", undo).await;
    assert_eq!(value(&outcome(&server, "durable-replay").await), receipt);
    post(
        &server,
        "/api/v1/runs",
        submission(&release, "durable-list", "list"),
    )
    .await;
    let listed = value(&outcome(&server, "durable-list").await);
    assert_eq!(listed["items"].as_array().unwrap().len(), 1);
    assert!(listed.to_string().contains("blue release"));
    assert!(!listed.to_string().contains("green release"));
    parent.kill().await.unwrap();
    parent.wait().await.unwrap();
}

fn config<'a>(source: &'a mut Value, id: &str) -> &'a mut Value {
    &mut source["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|module| module["reference"]["id"] == id)
        .unwrap()["config"]
}
fn submission(release: &str, id: &str, program: &str) -> Value {
    json!({"system":"declared-memory","release":release,"run_id":id,"thread_id":id,"program":program})
}
fn value(outcome: &Value) -> Value {
    assert_eq!(outcome["execution"]["status"], "completed", "{outcome}");
    let output: Value = serde_json::from_str(
        outcome["execution"]["outcome"]["Completed"]["output"]
            .as_str()
            .unwrap(),
    )
    .unwrap();
    output["value"].clone()
}
async fn status(server: &Serving) -> Value {
    let (status, value) = request(
        server,
        reqwest::Method::GET,
        "/api/v1/memory/status",
        ADMIN,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200);
    value
}
#[tokio::test]
async fn declaration_is_pure_strict_and_resource_grants_are_not_manual_rust_registration() {
    let dir = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let host = host(dir.path(), reads.clone()).await;
    let server = serve(host.router()).await;
    post(&server, "/api/v1/validate", source()).await;
    assert!(!dir.path().join("memory").exists());
    assert_eq!(status(&server).await["opened"], 0);
    assert!(
        !status(&server)
            .await
            .to_string()
            .contains(dir.path().to_str().unwrap())
    );
    for (key, bad) in [
        ("namespace", json!("../escape")),
        ("project_id", json!("00000000-0000-0000-0000-000000000000")),
        (
            "index",
            json!({"max_chunk_chars":32,"chunk_overlap_chars":32}),
        ),
        ("search", json!({"unknown":1})),
        ("embedding_dimensions", json!(0)),
        ("undo_mode", json!("session")),
        ("undo_limits", json!({"max_pending":0})),
        ("search", json!({"recency_decay":0.95})),
    ] {
        let mut source = source();
        config(&mut source, "memory-store")["backend"][key] = bad;
        assert_eq!(
            request(
                &server,
                reqwest::Method::POST,
                "/api/v1/validate",
                VIEW,
                source
            )
            .await
            .0,
            422
        );
    }
    for (id, key, bad) in [
        ("memory-store", "grants", json!({"capture":true})),
        ("memory-tools", "read", json!(["personal"])),
        ("memory-tools", "child_write", json!(["project"])),
        ("memory-tools", "resource", json!("manual")),
        ("memory-context", "write", json!(["project"])),
    ] {
        let mut source = source();
        config(&mut source, id)[key] = bad;
        assert_eq!(
            request(
                &server,
                reqwest::Method::POST,
                "/api/v1/validate",
                VIEW,
                source
            )
            .await
            .0,
            422
        );
    }
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/import",
            PUBLISH,
            source()
        )
        .await
        .0,
        403
    );
    assert_eq!(reads.load(Ordering::SeqCst), 0);
    assert!(!dir.path().join("memory").exists());
}

#[tokio::test]
async fn real_memory_survives_reopen_ranking_changes_keep_undo_and_context_reaches_the_original_model()
 {
    let requests = Arc::new(Mutex::new(vec![]));
    let provider = serve(
        Router::new()
            .route("/v1/chat/completions", post_handler())
            .with_state(requests.clone()),
    )
    .await;
    let dir = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let host = host(dir.path(), reads.clone()).await;
    let server = serve(host.router()).await;
    let mut source = source();
    let baseline = serde_json::to_value(document(&provider.url)).unwrap();
    source["modules"].as_array_mut().unwrap().extend(
        baseline["modules"]
            .as_array()
            .unwrap()
            .iter()
            .filter(|module| module["reference"]["id"] != "prompt")
            .cloned(),
    );
    source["modules"].as_array_mut().unwrap().push(json!({"reference":{"id":"prompt","version":"1"},"factory":"prompt.static","config":{"text":"Use the admitted project notes."}}));
    source["programs"]["chat"] = json!({"kind":"agent","definition":{"name":"memory-assistant","model":{"id":"model","version":"1"},"prompt":{"id":"prompt","version":"1"},"context_sources":[{"id":"memory-context","version":"1"}]}});
    let release = post(&server, "/api/v1/import", source.clone()).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    assert_eq!(status(&server).await["opened"], 0);
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let running = host.clone();
    let worker = tokio::spawn(async move { running.run_worker(signal, 2).await.unwrap() });
    post(
        &server,
        "/api/v1/runs",
        submission(&release, "write-note", "remember"),
    )
    .await;
    let created = value(&outcome(&server, "write-note").await);
    post(
        &server,
        "/api/v1/runs",
        submission(&release, "read-note", "list"),
    )
    .await;
    assert!(
        value(&outcome(&server, "read-note").await)
            .to_string()
            .contains("blue release")
    );
    let mut revise = submission(&release, "revise-note", "remember");
    revise["parameters"] = json!({"operation":"revise","request":{"target":created["target"],"replacement":"Deployment uses a green release channel."}});
    post(&server, "/api/v1/runs", revise).await;
    let revised = value(&outcome(&server, "revise-note").await);
    let mut revise_again = submission(&release, "revise-note-again", "remember");
    revise_again["parameters"] = json!({"operation":"revise","request":{"target":revised["target"],"replacement":"Deployment uses an orange release channel."}});
    post(&server, "/api/v1/runs", revise_again).await;
    let latest = value(&outcome(&server, "revise-note-again").await);
    let mut conflicting = submission(&release, "conflicting-undo", "remember");
    conflicting["parameters"] = json!({"operation":"undo","request":revised["undo_token"]});
    post(&server, "/api/v1/runs", conflicting).await;
    let conflicting = outcome(&server, "conflicting-undo").await;
    // A one-tool program completes with the original structured tool error;
    // the managed root itself has not failed or lost its durable receipt.
    assert_eq!(conflicting["execution"]["status"], "completed");
    let error: Value = serde_json::from_str(
        conflicting["execution"]["outcome"]["Completed"]["output"]
            .as_str()
            .unwrap(),
    )
    .unwrap();
    assert!(
        error["error"]
            .as_str()
            .is_some_and(|error| error.contains("memory changed since it was read")),
        "{error}"
    );
    config(&mut source, "memory-store")["backend"]["search"]["mmr"] =
        json!({"enabled":true,"lambda":0.3});
    let next = post(&server, "/api/v1/import", source.clone()).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    let mut undo_latest = submission(&next, "undo-latest", "remember");
    undo_latest["parameters"] = json!({"operation":"undo","request":latest["undo_token"]});
    post(&server, "/api/v1/runs", undo_latest).await;
    value(&outcome(&server, "undo-latest").await);
    let mut undo = submission(&next, "undo-note", "remember");
    undo["parameters"] = json!({"operation":"undo","request":revised["undo_token"]});
    post(&server, "/api/v1/runs", undo).await;
    value(&outcome(&server, "undo-note").await);
    let mut chat = submission(&next, "memory-chat", "chat");
    chat["input"] = json!({"text":"deployment release channel","attachments":[]});
    post(&server, "/api/v1/runs", chat).await;
    outcome(&server, "memory-chat").await;
    assert_eq!(requests.lock().unwrap().len(), 1);
    assert!(
        requests.lock().unwrap()[0]["messages"]
            .to_string()
            .contains("blue release")
    );
    let bundle = host.control().export(&release).await.unwrap();
    let target = tempfile::tempdir().unwrap();
    let imported = super::host(target.path(), Arc::new(AtomicUsize::new(0))).await;
    let other = serve(imported.router()).await;
    let portable = post(
        &other,
        "/api/v1/import",
        serde_json::to_value(bundle).unwrap(),
    )
    .await;
    assert_eq!(portable["bundle"]["digest"], release);
    assert!(!target.path().join("memory").exists());
    let other_stop = CancellationToken::new();
    let signal = other_stop.clone();
    let running = imported.clone();
    let other_worker = tokio::spawn(async move { running.run_worker(signal, 1).await.unwrap() });
    post(
        &other,
        "/api/v1/runs",
        submission(&release, "portable-empty", "list"),
    )
    .await;
    assert_eq!(
        value(&outcome(&other, "portable-empty").await)["items"],
        json!([])
    );
    other_stop.cancel();
    other_worker.await.unwrap();
    stop.cancel();
    worker.await.unwrap();
    drop(server);
    drop(host);
    let reopened = super::host(dir.path(), reads).await;
    let server = serve(reopened.router()).await;
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let running = reopened.clone();
    let worker = tokio::spawn(async move { running.run_worker(signal, 1).await.unwrap() });
    post(
        &server,
        "/api/v1/runs",
        submission(&next, "after-reopen", "list"),
    )
    .await;
    assert!(
        value(&outcome(&server, "after-reopen").await)
            .to_string()
            .contains("blue release")
    );
    stop.cancel();
    worker.await.unwrap();
}

#[tokio::test]
async fn shipped_system_file_keeps_real_notes_after_hard_restart_and_rejects_implicit_format_migration()
 {
    let dir = tempfile::tempdir().unwrap();
    let file = dir.path().join("memory-system.json");
    tokio::fs::write(&file, serde_json::to_vec(&source()).unwrap())
        .await
        .unwrap();
    let (server, mut parent) = super::process::binary(dir.path(), &file).await;
    let release = post(&server, "/api/v1/import", source()).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    assert_eq!(status(&server).await["opened"], 0);
    post(
        &server,
        "/api/v1/runs",
        submission(&release, "file-write", "remember"),
    )
    .await;
    let first = value(&outcome(&server, "file-write").await);
    parent.kill().await.unwrap();
    parent.wait().await.unwrap();
    drop(server);
    let (server, mut parent) = super::process::binary(dir.path(), &file).await;
    assert_eq!(status(&server).await["opened"], 0);
    post(
        &server,
        "/api/v1/runs",
        submission(&release, "file-write", "remember"),
    )
    .await;
    assert_eq!(value(&outcome(&server, "file-write").await), first);
    assert_eq!(status(&server).await["opened"], 0);
    post(
        &server,
        "/api/v1/runs",
        submission(&release, "file-list", "list"),
    )
    .await;
    let notes = value(&outcome(&server, "file-list").await);
    assert_eq!(notes["items"].as_array().unwrap().len(), 1);
    assert!(notes.to_string().contains("blue release"));
    let mut incompatible = source();
    config(&mut incompatible, "memory-store")["backend"]["embedding_dimensions"] = json!(2048);
    // Offline validation cannot read local memory. The actual open checks the
    // durable format before DB work, not during pure compilation.
    let next = post(&server, "/api/v1/import", incompatible).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    post(
        &server,
        "/api/v1/runs",
        submission(&next, "wrong-format", "list"),
    )
    .await;
    let rejected = outcome(&server, "wrong-format").await;
    assert!(
        rejected
            .to_string()
            .contains("format requires explicit migration"),
        "{rejected}"
    );
    post(
        &server,
        "/api/v1/runs",
        submission(&release, "old-format-still-works", "list"),
    )
    .await;
    assert_eq!(
        value(&outcome(&server, "old-format-still-works").await),
        notes
    );
    parent.kill().await.unwrap();
    parent.wait().await.unwrap();
}
