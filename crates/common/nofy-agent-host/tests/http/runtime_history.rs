use super::*;
use nofy_agent_runtime::durable::transport::inspect_snapshot;
#[path = "runtime_history/continuity.rs"]
mod continuity;
fn source(directory: &std::path::Path) -> Value {
    let mut value: Value =
        serde_json::from_str(include_str!("../../examples/runtime-history-system.json")).unwrap();
    value["modules"][1]["config"]["backend"]["directory"] = json!(directory);
    value
}
fn selection(release: &str, reverse: bool) -> Value {
    json!({"scope":"instance-runtime","target":{"system":"runtime-history","release":release,"module":{"id":if reverse{"default-history"}else{"external-history"},"version":"1"}}})
}
fn submission(release: &str, id: &str) -> Value {
    json!({"run_id":id,"thread_id":id,"system":"runtime-history","release":release,"program":"compute"})
}
/// The run record closes in a write after the execution result is visible.
/// `outcome` returns in between; this waits for the settled view, so a view read
/// after a storage move is compared with one that cannot be a step older.
async fn closed(server: &Serving, id: &str) -> Value {
    tokio::time::timeout(Duration::from_secs(15), async {
        loop {
            let view = outcome(server, id).await;
            if view["run"]["status"] == "closed" {
                return view;
            }
            tokio::time::sleep(Duration::from_millis(20)).await;
        }
    })
    .await
    .unwrap()
}
fn command(id: &str, plan: &Value) -> Value {
    json!({"command_id":id,"fingerprint":plan["fingerprint"]})
}
async fn plan(server: &Serving, release: &str, reverse: bool) -> Value {
    tokio::time::timeout(Duration::from_secs(8), async {
        loop {
            let (status, value) = request(
                server,
                reqwest::Method::POST,
                "/api/v1/runtime/storage/plan",
                ADMIN,
                selection(release, reverse),
            )
            .await;
            if status == 200 {
                return value;
            }
            assert_eq!(status, 503, "{value}");
            assert_eq!(value["error"]["code"], "busy", "{value}");
            tokio::time::sleep(Duration::from_millis(25)).await;
        }
    })
    .await
    .unwrap()
}
async fn prepare(server: &Serving, release: &str, reverse: bool, id: &str, plan: &Value) -> Value {
    let mut body = selection(release, reverse);
    body["command_id"] = json!(id);
    body["fingerprint"] = plan["fingerprint"].clone();
    tokio::time::timeout(Duration::from_secs(8), async {
        loop {
            let (status, value) = request(
                server,
                reqwest::Method::POST,
                "/api/v1/runtime/storage/prepare",
                ADMIN,
                body.clone(),
            )
            .await;
            if status == 200 {
                return value;
            }
            assert_eq!(status, 503, "{value}");
            assert_eq!(value["error"]["code"], "busy", "{value}");
            tokio::time::sleep(Duration::from_millis(25)).await;
        }
    })
    .await
    .unwrap()
}
async fn current(server: &Serving) -> Value {
    let (status, value) = request(
        server,
        reqwest::Method::GET,
        "/api/v1/runtime/storage",
        ADMIN,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200, "{value}");
    value
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
#[tokio::test]
async fn whole_instance_migration_preserves_real_runs_budgets_queue_and_latest_reverse_data() {
    let dir = nofy_test_support::canonical_tempdir().unwrap();
    let host = host(&dir.path().join("host"), Arc::new(AtomicUsize::new(0))).await;
    let other = host.store().clone();
    let server = serve(host.router()).await;
    let doc = source(&dir.path().join("external"));
    let release = post(&server, "/api/v1/import", doc).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    post(
        &server,
        "/api/v1/runs",
        submission(&release, "queued-original"),
    )
    .await;
    let origin = host.store().path().unwrap();
    let original = inspect_snapshot(&origin).unwrap();
    let identity = host.store().logical_identity().to_owned();
    let first = plan(&server, &release, false).await;
    assert_eq!(first["inventory"], json!(original));
    let ready = prepare(&server, &release, false, "move", &first).await;
    assert_eq!(ready["phase"], "prepared");
    assert_eq!(current(&server).await["writable"], false);
    let rejected = request(
        &server,
        reqwest::Method::POST,
        "/api/v1/runs",
        ADMIN,
        submission(&release, "blocked"),
    )
    .await;
    assert_eq!(rejected.0, 409, "{}", rejected.1);
    assert_eq!(rejected.1["error"]["code"], "runtime_conflict");
    assert!(host.store().managed_run("blocked").await.unwrap().is_none());
    let moved = post(
        &server,
        "/api/v1/runtime/storage/apply",
        command("move", &first),
    )
    .await;
    assert_eq!(moved["phase"], "completed");
    let external = host.store().path().unwrap();
    assert_ne!(external, origin);
    assert_eq!(other.path().unwrap(), external);
    assert_eq!(host.store().logical_identity(), identity);
    assert_eq!(inspect_snapshot(&external).unwrap(), original);
    let (stop, worker) = start(&host);
    let finished = closed(&server, "queued-original").await;
    assert_eq!(finished["execution"]["status"], "completed");
    let budget = rusqlite::Connection::open(&external)
        .unwrap()
        .query_row("SELECT COUNT(*) FROM agent_runtime_budget_roots", [], |r| {
            r.get::<_, i64>(0)
        })
        .unwrap();
    assert!(budget > 0);
    let latest = plan(&server, &release, true).await;
    prepare(&server, &release, true, "reverse", &latest).await;
    post(
        &server,
        "/api/v1/runtime/storage/apply",
        command("reverse", &latest),
    )
    .await;
    let returned = host.store().path().unwrap();
    assert_ne!(returned, origin);
    assert_ne!(returned, external);
    assert_eq!(
        json!(inspect_snapshot(&returned).unwrap()),
        latest["inventory"]
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/runs/queued-original",
            ADMIN,
            Value::Null
        )
        .await
        .1,
        finished
    );
    post(
        &server,
        "/api/v1/runs",
        submission(&release, "after-reverse"),
    )
    .await;
    assert_eq!(
        outcome(&server, "after-reverse").await["execution"]["status"],
        "completed"
    );
    assert_eq!(
        post(
            &server,
            "/api/v1/runtime/storage/apply",
            command("move", &first)
        )
        .await,
        moved
    );
    assert_eq!(current(&server).await["backend"]["id"], "default");
    let retired = rusqlite::Connection::open(&origin).unwrap();
    assert!(
        retired
            .execute(
                "INSERT INTO agent_runtime_leases VALUES('late','old',1,1)",
                []
            )
            .is_err()
    );
    stop.cancel();
    worker.await.unwrap();
}
#[tokio::test]
async fn scope_permissions_stale_plans_and_abort_are_explicit() {
    let dir = nofy_test_support::canonical_tempdir().unwrap();
    let host = unbound_host(&dir.path().join("host"), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let release = post(
        &server,
        "/api/v1/import",
        source(&dir.path().join("external")),
    )
    .await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/runtime/storage",
            VIEW,
            Value::Null
        )
        .await
        .0,
        403
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/runtime/storage/plan",
            VIEW,
            selection(&release, false)
        )
        .await
        .0,
        403
    );
    let mut wrong = selection(&release, false);
    wrong["scope"] = json!("agent");
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/runtime/storage/plan",
            ADMIN,
            wrong
        )
        .await
        .0,
        422
    );
    let first = plan(&server, &release, false).await;
    let lease = host
        .store()
        .acquire("change", "worker", Duration::from_secs(1))
        .await
        .unwrap();
    host.store().release(&lease).await.unwrap();
    let mut stale = selection(&release, false);
    stale["command_id"] = json!("stale");
    stale["fingerprint"] = first["fingerprint"].clone();
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/runtime/storage/prepare",
            ADMIN,
            stale
        )
        .await
        .0,
        409
    );
    assert_eq!(current(&server).await["writable"], true);
    let fresh = plan(&server, &release, false).await;
    prepare(&server, &release, false, "abort", &fresh).await;
    let receipt = post(
        &server,
        "/api/v1/runtime/storage/abort",
        command("abort", &fresh),
    )
    .await;
    assert_eq!(receipt["phase"], "aborted");
    assert_eq!(
        post(
            &server,
            "/api/v1/runtime/storage/apply",
            command("abort", &fresh)
        )
        .await,
        receipt
    );
    assert_eq!(current(&server).await["writable"], true);
    assert_eq!(
        host.store().path().unwrap(),
        dir.path().join("host/runtime.sqlite")
    );
}
#[tokio::test]
async fn conflicting_existing_grants_are_rejected_before_source_or_protection_changes() {
    let dir = nofy_test_support::canonical_tempdir().unwrap();
    let external = dir.path().join("external");
    std::fs::create_dir(&external).unwrap();
    let host = unbound_host(&dir.path().join("host"), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let mut doc = source(&external);
    doc["modules"].as_array_mut().unwrap().push(json!({"reference":{"id":"files","version":"1"},"factory":"resource.directory","config":{"path":external,"access":"read_only"}}));
    let release = post(&server, "/api/v1/import", doc).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    let before = current(&server).await;
    let rejected = request(
        &server,
        reqwest::Method::POST,
        "/api/v1/runtime/storage/plan",
        ADMIN,
        selection(&release, false),
    )
    .await;
    assert_eq!(rejected.0, 422, "{}", rejected.1);
    assert_eq!(current(&server).await, before);
    assert!(!external.join(".nofy-runtime-history").exists());
}
#[tokio::test]
async fn real_cli_recovers_prepared_read_only_store_then_replays_after_another_restart() {
    let dir = nofy_test_support::canonical_tempdir().unwrap();
    let doc = source(&dir.path().join("external"));
    let file = dir.path().join("system.json");
    std::fs::write(&file, serde_json::to_vec(&doc).unwrap()).unwrap();
    let (server, mut child) = super::process::binary(dir.path(), &file).await;
    let release = post(&server, "/api/v1/import", doc).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    post(&server, "/api/v1/runs", submission(&release, "before-exit")).await;
    let old = outcome(&server, "before-exit").await;
    let first = plan(&server, &release, false).await;
    let ready = prepare(&server, &release, false, "durable", &first).await;
    child.kill().await.unwrap();
    child.wait().await.unwrap();
    drop(server);
    let (server, mut child) = super::process::binary(dir.path(), &file).await;
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/runtime/storage/transfers/durable",
            ADMIN,
            Value::Null
        )
        .await
        .1,
        ready
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/runs/before-exit",
            ADMIN,
            Value::Null
        )
        .await
        .1,
        old
    );
    let moved = post(
        &server,
        "/api/v1/runtime/storage/apply",
        command("durable", &first),
    )
    .await;
    post(&server, "/api/v1/runs", submission(&release, "after-exit")).await;
    assert_eq!(
        outcome(&server, "after-exit").await["execution"]["status"],
        "completed"
    );
    child.kill().await.unwrap();
    child.wait().await.unwrap();
    drop(server);
    let (server, mut child) = super::process::binary(dir.path(), &file).await;
    assert_eq!(
        post(
            &server,
            "/api/v1/runtime/storage/apply",
            command("durable", &first)
        )
        .await,
        moved
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/runs/before-exit",
            ADMIN,
            Value::Null
        )
        .await
        .1,
        old
    );
    child.kill().await.unwrap();
    child.wait().await.unwrap();
}
