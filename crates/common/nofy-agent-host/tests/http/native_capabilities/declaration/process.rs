use super::*;

#[tokio::test]
async fn shipped_file_entry_restores_declared_scope_and_pending_approval_after_hard_exit() {
    let requests = Arc::new(Mutex::new(Vec::<Value>::new()));
    let provider = serve(
        Router::new()
            .route("/v1/chat/completions", route_post(provider))
            .with_state(requests.clone()),
    )
    .await;
    let effects = Arc::new(AtomicUsize::new(0));
    let calls = effects.clone();
    let service = serve(Router::new().route(
        "/api/lookup",
        route_post(move |Json(body): Json<Value>| {
            let calls = calls.clone();
            async move {
                assert_eq!(body["file_path"], "src/lib.rs");
                calls.fetch_add(1, Ordering::SeqCst);
                Json(json!({"evidence":"available"}))
            }
        }),
    ))
    .await;
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("declared-system.json");
    tokio::fs::write(
        &path,
        serde_json::to_vec(&declared(
            &provider.url,
            &service.url,
            true,
            "/declared/workspace",
        ))
        .unwrap(),
    )
    .await
    .unwrap();
    let (server, mut child) = super::super::super::process::binary(dir.path(), &path).await;
    let (status, active) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/systems/native-capabilities/active",
        ADMIN,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200, "{active}");
    let release = active["release"].as_str().unwrap();
    post(
        &server,
        "/api/v1/runs",
        launch(release, "declared-process", "chat"),
    )
    .await;
    let paused = outcome(&server, "declared-process").await;
    assert_eq!(paused["execution"]["status"], "paused", "{paused}");
    let before = pending(&server, "declared-process").await;
    assert_eq!(before.as_array().unwrap().len(), 1);
    assert_eq!(requests.lock().unwrap().len(), 2);
    assert_eq!(effects.load(Ordering::SeqCst), 0);
    child.kill().await.unwrap();
    child.wait().await.unwrap();
    drop(server);
    let (server, mut child) = super::super::super::process::binary(dir.path(), &path).await;
    assert_eq!(pending(&server, "declared-process").await, before);
    approve_and_resume(&server, "declared-process").await;
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    assert_eq!(requests.lock().unwrap().len(), 5);
    let result = outcome(&server, "declared-process").await;
    child.kill().await.unwrap();
    child.wait().await.unwrap();
    drop(server);
    let (server, mut child) = super::super::super::process::binary(dir.path(), &path).await;
    post(
        &server,
        "/api/v1/runs",
        launch(release, "declared-process", "chat"),
    )
    .await;
    assert_eq!(
        outcome(&server, "declared-process").await["execution"]["outcome"],
        result["execution"]["outcome"]
    );
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    assert_eq!(requests.lock().unwrap().len(), 5);
    child.kill().await.unwrap();
    child.wait().await.unwrap();
}
