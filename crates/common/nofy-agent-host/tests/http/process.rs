use super::*;
use tokio::io::AsyncBufReadExt;
async fn binary(
    directory: &std::path::Path,
    source: &std::path::Path,
) -> (Serving, tokio::process::Child) {
    let access = directory.join("access.json");
    tokio::fs::write(&access,serde_json::to_vec(&json!([{"token_env":"NOFY_KERNEL_TEST_ACCESS","scopes":["read","edit","publish","resources","execute"]}])).unwrap()).await.unwrap();
    let mut child = tokio::process::Command::new(env!("CARGO_BIN_EXE_nofy-agent-host"))
        .args(["--listen", "127.0.0.1:0", "--state-dir"])
        .arg(directory)
        .arg("--access-file")
        .arg(access)
        .arg("--system-file")
        .arg(source)
        .env("NOFY_KERNEL_TEST_ACCESS", ADMIN)
        .env("NOFY_SECRET_MODEL_TOKEN", "fixture-provider-token")
        .kill_on_drop(true)
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .unwrap();
    let mut lines = tokio::io::BufReader::new(child.stderr.take().unwrap()).lines();
    let url = tokio::time::timeout(Duration::from_secs(15), async {
        while let Some(line) = lines.next_line().await.unwrap() {
            if let Some(url) = line.strip_prefix("Nofy kernel listening on ") {
                return url.to_owned();
            }
        }
        panic!("host exited before listening");
    })
    .await
    .unwrap();
    // Retain and drain stderr so diagnostic output cannot block the child.
    let task = tokio::spawn(async move { while lines.next_line().await.unwrap().is_some() {} });
    (Serving { url, task }, child)
}
#[tokio::test]
async fn accept_then_exit_child() {
    let Ok(directory) = std::env::var("NOFY_MANAGED_ACCEPT_CHILD") else {
        return;
    };
    let url = std::env::var("NOFY_MANAGED_PROVIDER").unwrap();
    let host = host(
        std::path::Path::new(&directory),
        Arc::new(AtomicUsize::new(0)),
    )
    .await;
    let server = serve(host.router()).await;
    let release = import(&server, &document(&url)).await;
    let receipt = post(&server, "/api/v1/runs", run(&release, "process-recovery")).await;
    assert_eq!(receipt["status"], "queued");
    let path = std::path::Path::new(&directory).join("accepted-release.json");
    use std::io::Write;
    let mut file = std::fs::File::create(path).unwrap();
    file.write_all(release.as_bytes()).unwrap();
    file.sync_all().unwrap();
    std::process::exit(97);
}
#[tokio::test]
async fn real_process_exit_after_http_acceptance_preserves_launch_and_event_replay() {
    let requests = Arc::new(Mutex::new(vec![]));
    let provider = serve(
        Router::new()
            .route("/v1/chat/completions", post_handler())
            .with_state(requests.clone()),
    )
    .await;
    let dir = tempfile::tempdir().unwrap();
    let directory = dir.path().to_owned();
    let url = provider.url.clone();
    let output = tokio::task::spawn_blocking(move || {
        std::process::Command::new(std::env::current_exe().unwrap())
            .args(["--exact", "process::accept_then_exit_child", "--nocapture"])
            .env("NOFY_MANAGED_ACCEPT_CHILD", directory)
            .env("NOFY_MANAGED_PROVIDER", url)
            .output()
            .unwrap()
    })
    .await
    .unwrap();
    assert_eq!(
        output.status.code(),
        Some(97),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    assert!(requests.lock().unwrap().is_empty());
    let release = std::fs::read_to_string(dir.path().join("accepted-release.json")).unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let restored = host(dir.path(), reads.clone()).await;
    let server = serve(restored.router()).await;
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { restored.run_worker(worker_stop, 2).await.unwrap() });
    assert_eq!(
        outcome(&server, "process-recovery").await["execution"]["status"],
        "completed"
    );
    post(&server, "/api/v1/runs", run(&release, "process-recovery")).await;
    assert_eq!(reads.load(Ordering::SeqCst), 1);
    assert_eq!(requests.lock().unwrap().len(), 1);
    let events = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/runs/process-recovery/events",
        ADMIN,
        Value::Null,
    )
    .await
    .1;
    let cursors = events["events"]
        .as_array()
        .unwrap()
        .iter()
        .map(|e| e["cursor"].as_u64().unwrap())
        .collect::<Vec<_>>();
    assert!(!cursors.is_empty());
    assert!(cursors.windows(2).all(|w| w[0] < w[1]));
    stop.cancel();
    worker.await.unwrap();
}
#[tokio::test]
async fn shipped_binary_loads_single_file_and_reuses_durable_result_after_real_restart() {
    let requests = Arc::new(Mutex::new(vec![]));
    let provider = serve(
        Router::new()
            .route("/v1/chat/completions", post_handler())
            .with_state(requests.clone()),
    )
    .await;
    let dir = tempfile::tempdir().unwrap();
    let source = dir.path().join("system.json");
    tokio::fs::write(
        &source,
        serde_json::to_vec(&document(&provider.url)).unwrap(),
    )
    .await
    .unwrap();
    let (server, mut child) = binary(dir.path(), &source).await;
    let active = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/systems/portable-assistant/active",
        ADMIN,
        Value::Null,
    )
    .await
    .1;
    let release = active["release"].as_str().unwrap().to_owned();
    post(&server, "/api/v1/runs", run(&release, "binary-run")).await;
    assert_eq!(
        outcome(&server, "binary-run").await["execution"]["status"],
        "completed"
    );
    child.kill().await.unwrap();
    drop(server);
    let (server, mut child) = binary(dir.path(), &source).await;
    post(&server, "/api/v1/runs", run(&release, "binary-run")).await;
    assert_eq!(
        outcome(&server, "binary-run").await["execution"]["outcome"]["Completed"]["output"],
        "version one"
    );
    assert_eq!(requests.lock().unwrap().len(), 1);
    child.kill().await.unwrap();
}
