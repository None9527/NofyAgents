use super::*;
use nofy_agent_runtime::{RunContext, RunInput, RunOutcome, supervisor::RunSupervisor};
#[path = "transfers/live.rs"]
mod live;
#[path = "transfers/recovery.rs"]
mod recovery;

fn source() -> Value {
    serde_json::from_str(include_str!("../../examples/memory-transfer-system.json")).unwrap()
}
fn config<'a>(doc: &'a mut Value, id: &str) -> &'a mut Value {
    &mut doc["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|m| m["reference"]["id"] == id)
        .unwrap()["config"]
}
fn selector(release: &str, target: bool) -> Value {
    json!({"system":"memory-transfer","release":release,"module":{"id":if target{"target-store"}else{"memory-store"},"version":"1"}})
}
fn selection(release: &str, reverse: bool) -> Value {
    json!({"source":selector(release,reverse),"target":selector(release,!reverse),"scope":"namespace"})
}
fn submission(release: &str, id: &str, program: &str) -> Value {
    json!({"system":"memory-transfer","release":release,"run_id":id,"thread_id":id,"program":program})
}
fn start(host: &KernelHost) -> (CancellationToken, tokio::task::JoinHandle<()>) {
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let host = host.clone();
    (
        stop,
        tokio::spawn(async move { host.run_worker(signal, 2).await.unwrap() }),
    )
}
fn value(record: &Value) -> Value {
    assert_eq!(record["execution"]["status"], "completed", "{record}");
    serde_json::from_str::<Value>(
        record["execution"]["outcome"]["Completed"]["output"]
            .as_str()
            .unwrap(),
    )
    .unwrap()
}
async fn operation(
    server: &Serving,
    release: &str,
    id: &str,
    target: bool,
    parameters: Value,
) -> Value {
    let mut body = submission(
        release,
        id,
        if target {
            "remember-target"
        } else {
            "remember"
        },
    );
    body["parameters"] = parameters;
    post(server, "/api/v1/runs", body).await;
    value(&outcome(server, id).await)
}
async fn write(server: &Serving, release: &str, id: &str, target: bool, text: &str) -> Value {
    let output=operation(server,release,id,target,json!({"operation":"remember","request":{"area":"project","statement":text,"confirm_sensitive":false}})).await;
    assert!(output["error"].is_null(), "{output}");
    output["value"].clone()
}
async fn listed(server: &Serving, release: &str, id: &str, target: bool) -> Value {
    post(
        server,
        "/api/v1/runs",
        submission(release, id, if target { "list-target" } else { "list" }),
    )
    .await;
    let output = value(&outcome(server, id).await);
    assert!(output["error"].is_null(), "{output}");
    output["value"].clone()
}
async fn plan(server: &Serving, release: &str, reverse: bool) -> Value {
    post(
        server,
        "/api/v1/memory/transfers/plan",
        selection(release, reverse),
    )
    .await
}
async fn prepare(server: &Serving, release: &str, reverse: bool, id: &str, plan: &Value) -> Value {
    let mut command = selection(release, reverse);
    command["command_id"] = json!(id);
    command["fingerprint"] = plan["fingerprint"].clone();
    post(server, "/api/v1/memory/transfers/prepare", command).await
}
fn command(id: &str, plan: &Value) -> Value {
    json!({"command_id":id,"fingerprint":plan["fingerprint"]})
}
fn canonical(root: &std::path::Path) -> std::collections::BTreeMap<std::path::PathBuf, Vec<u8>> {
    let mut pending = vec![root.to_path_buf()];
    let mut result = std::collections::BTreeMap::new();
    while let Some(path) = pending.pop() {
        for entry in std::fs::read_dir(&path).unwrap() {
            let path = entry.unwrap().path();
            if path.is_dir() {
                pending.push(path);
            } else if path.extension().is_some_and(|v| v == "md") {
                result.insert(
                    path.strip_prefix(root).unwrap().to_owned(),
                    std::fs::read(path).unwrap(),
                );
            }
        }
    }
    result
}
async fn apply(server: &Serving, id: &str, plan: &Value) -> Value {
    post(server, "/api/v1/memory/transfers/apply", command(id, plan)).await
}
async fn cached_list(
    supervisor: &RunSupervisor,
    system: &nofy_agent_runtime::system::CompiledSystem,
    id: &str,
) -> Value {
    let context = RunContext {
        run_id: id.into(),
        thread_id: id.into(),
        ..RunContext::default()
    };
    let result = supervisor
        .execute_program(
            system.program("list").unwrap(),
            RunInput::default(),
            context,
        )
        .await
        .unwrap();
    let RunOutcome::Completed { output, .. } = result else {
        panic!("{result:?}")
    };
    serde_json::from_str::<Value>(&output).unwrap()["value"].clone()
}

#[tokio::test]
async fn real_history_moves_back_with_latest_writes_undo_and_retained_compilation() {
    let dir = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let host = host(dir.path(), reads.clone()).await;
    let server = serve(host.router()).await;
    let doc = source();
    post(&server, "/api/v1/validate", doc.clone()).await;
    let compiled = host
        .control()
        .prepare(serde_json::from_value(doc.clone()).unwrap())
        .unwrap();
    let release = post(&server, "/api/v1/import", doc).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    assert!(!dir.path().join("memory").exists());
    let (stop, worker) = start(&host);
    let kept = write(
        &server,
        &release,
        "keep",
        false,
        "The migration keeps this observation.",
    )
    .await;
    let forgotten = write(
        &server,
        &release,
        "forget-me",
        false,
        "This observation must remain forgotten.",
    )
    .await;
    let erased = operation(
        &server,
        &release,
        "forget",
        false,
        json!({"operation":"forget","request":{"target":forgotten["target"],"confirmed":true}}),
    )
    .await;
    assert!(erased["error"].is_null(), "{erased}");
    let supervisor = RunSupervisor::new(host.store().clone());
    assert!(
        cached_list(&supervisor, &compiled, "warm-cached-source")
            .await
            .to_string()
            .contains("keeps this")
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/memory/transfers/plan",
            VIEW,
            selection(&release, false)
        )
        .await
        .0,
        403
    );
    let mut invalid = selection(&release, false);
    invalid["target"]["module"]["id"] = json!("prompt");
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/memory/transfers/plan",
            ADMIN,
            invalid
        )
        .await
        .0,
        422
    );
    let first = plan(&server, &release, false).await;
    let original = std::fs::read_dir(dir.path().join("memory"))
        .unwrap()
        .map(|entry| entry.unwrap().path())
        .find(|p| p.is_dir())
        .unwrap();
    let original_files = canonical(&original);
    assert!(!original_files.is_empty());
    let mut stale = selection(&release, false);
    stale["command_id"] = json!("stale");
    stale["fingerprint"] = json!("0".repeat(64));
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/memory/transfers/prepare",
            ADMIN,
            stale
        )
        .await
        .0,
        409
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/memory/transfers/stale",
            ADMIN,
            Value::Null
        )
        .await
        .0,
        404
    );
    let ready = prepare(&server, &release, false, "forward", &first).await;
    assert_eq!(ready["phase"], "prepared");
    for (target, id) in [(false, "blocked-source"), (true, "blocked-target")] {
        assert_eq!(
            post(
                &server,
                "/api/v1/memory/resources/inspect",
                selector(&release, target)
            )
            .await["effective_open"],
            false
        );
        assert_eq!(
            request(
                &server,
                reqwest::Method::POST,
                "/api/v1/runs",
                ADMIN,
                submission(&release, id, if target { "list-target" } else { "list" })
            )
            .await
            .0,
            503
        );
        assert!(host.store().managed_run(id).await.unwrap().is_none());
    }
    assert_eq!(
        prepare(&server, &release, false, "forward", &first).await,
        ready
    );
    let moved = apply(&server, "forward", &first).await;
    assert_eq!(moved["phase"], "completed");
    assert!(
        dir.path()
            .join("memory/.transfers")
            .join(moved["target"]["generation"].as_str().unwrap())
            .join("store/schema.json")
            .is_file()
    );
    assert_eq!(canonical(&original), original_files);
    assert_eq!(request(&server,reqwest::Method::POST,"/api/v1/memory/resources/apply",ADMIN,json!({"resource":selector(&release,false),"command":{"command_id":"bypass-retired","expected_revision":0,"open":true}})).await.0,503);
    let items = listed(&server, &release, "target-read", true).await;
    assert!(items.to_string().contains("keeps this"));
    assert!(!items.to_string().contains("must remain forgotten"));
    write(
        &server,
        &release,
        "later",
        true,
        "A later target write must survive reverse migration.",
    )
    .await;
    let reverse = plan(&server, &release, true).await;
    prepare(&server, &release, true, "reverse", &reverse).await;
    let restored = apply(&server, "reverse", &reverse).await;
    assert_ne!(restored["target"]["generation"], "origin");
    let cached = cached_list(&supervisor, &compiled, "reuse-retained-source").await;
    assert!(
        cached.to_string().contains("later target write"),
        "{cached}"
    );
    let undo = operation(
        &server,
        &release,
        "old-token",
        false,
        json!({"operation":"undo","request":kept["undo_token"]}),
    )
    .await;
    assert_eq!(undo["value"]["restored"], true, "{undo}");
    let rejected = operation(
        &server,
        &release,
        "forgotten-token",
        false,
        json!({"operation":"undo","request":forgotten["undo_token"]}),
    )
    .await;
    assert!(
        !rejected["error"].is_null() || rejected["value"]["restored"] != true,
        "{rejected}"
    );
    assert_eq!(apply(&server, "forward", &first).await, moved);
    assert_eq!(
        post(
            &server,
            "/api/v1/memory/resources/inspect",
            selector(&release, false)
        )
        .await["namespace"]["active"],
        true
    );
    // A completed root is a durable readback even though its old namespace retired.
    post(
        &server,
        "/api/v1/actions",
        json!({"command_id":"read-old-target","run_id":"target-read","command":{"kind":"resume"}}),
    )
    .await;
    let replay = action_result(&server, "read-old-target").await;
    assert!(replay["error"].is_null(), "{replay}");
    assert_eq!(reads.load(Ordering::SeqCst), 0);
    stop.cancel();
    worker.await.unwrap();
    assert_eq!(canonical(&original), original_files);
}

#[tokio::test]
async fn queued_roots_block_migration_and_abort_reopens_only_original_ownership() {
    let dir = tempfile::tempdir().unwrap();
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let compiled = host
        .control()
        .prepare(serde_json::from_value(source()).unwrap())
        .unwrap();
    let registry = compiled.registry().clone();
    let release = post(&server, "/api/v1/import", source()).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    post(
        &server,
        "/api/v1/runs",
        submission(&release, "seed", "remember"),
    )
    .await;
    RunSupervisor::new(host.store().clone())
        .execute_submitted(&registry, "seed")
        .await
        .unwrap();
    post(
        &server,
        "/api/v1/runs",
        submission(&release, "queued", "list"),
    )
    .await;
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/memory/transfers/plan",
            ADMIN,
            selection(&release, false)
        )
        .await
        .0,
        422
    );
    assert_eq!(
        post(
            &server,
            "/api/v1/runs/queued/cancel",
            json!({"command_id":"cancel-queued"})
        )
        .await["queued_cancelled"],
        true
    );
    let first = plan(&server, &release, false).await;
    prepare(&server, &release, false, "abandon-copy", &first).await;
    let aborted = post(
        &server,
        "/api/v1/memory/transfers/abort",
        command("abandon-copy", &first),
    )
    .await;
    assert_eq!(aborted["phase"], "aborted");
    assert_eq!(
        post(
            &server,
            "/api/v1/memory/transfers/abort",
            command("abandon-copy", &first)
        )
        .await,
        aborted
    );
    assert_eq!(apply(&server, "abandon-copy", &first).await, aborted);
    let next = plan(&server, &release, false).await;
    assert_ne!(next["fingerprint"], first["fingerprint"]);
    let (stop, worker) = start(&host);
    assert!(
        listed(&server, &release, "original", false)
            .await
            .to_string()
            .contains("blue release")
    );
    write(
        &server,
        &release,
        "independent-target",
        true,
        "This target belongs to independent data.",
    )
    .await;
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/memory/transfers/plan",
            ADMIN,
            selection(&release, false)
        )
        .await
        .0,
        422
    );
    stop.cancel();
    worker.await.unwrap();
}

#[tokio::test]
async fn ordinary_tool_payloads_are_not_treated_as_memory_definitions() {
    let wire = serve(Router::new().route(
        "/echo",
        route_post(|Json(value): Json<Value>| async move { Json(value) }),
    ))
    .await;
    let dir = tempfile::tempdir().unwrap();
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let mut doc = source();
    doc["modules"].as_array_mut().unwrap().extend([
        json!({"reference":{"id":"http","version":"1"},"factory":"resource.http","config":{"base_url":format!("{}/",wire.url),"methods":["POST"]}}),
        json!({"reference":{"id":"echo","version":"1"},"factory":"tool.http_connected","config":{"contract":{"name":"echo","input_schema":{"type":"object","additionalProperties":true}},"method":"POST","path":"echo"},"dependencies":{"connection":{"id":"http","version":"1"}}})
    ]);
    doc["programs"]["echo"] = json!({"kind":"tool","definition":{"name":"payload-echo","tool_packs":[{"id":"echo","version":"1"}]},"call":{"id":"echo-call","name":"echo","arguments":{"factory":"resource.memory","config":{"backend":{"namespace":"project-notes"}}}}});
    let release = post(&server, "/api/v1/import", doc).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    let (stop, worker) = start(&host);
    write(&server, &release, "seed", false, "A real source note.").await;
    let first = plan(&server, &release, false).await;
    prepare(&server, &release, false, "move", &first).await;
    apply(&server, "move", &first).await;
    post(
        &server,
        "/api/v1/runs",
        submission(&release, "echo-root", "echo"),
    )
    .await;
    let output = value(&outcome(&server, "echo-root").await);
    assert!(output["error"].is_null(), "{output}");
    assert!(output.to_string().contains("resource.memory"), "{output}");
    stop.cancel();
    worker.await.unwrap();
}
