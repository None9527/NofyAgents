use super::*;
use nofy_agent_host::credentials::FileCredentials;
#[tokio::test]
async fn live_credential_api_rotates_without_republishing_and_never_exports_values() {
    let headers = Arc::new(Mutex::new(Vec::<String>::new()));
    let captured = headers.clone();
    let provider = serve(Router::new().route(
        "/v1/chat/completions",
        route_post(move |header: axum::http::HeaderMap| {
            let captured = captured.clone();
            async move {
                captured
                    .lock()
                    .unwrap()
                    .push(header["authorization"].to_str().unwrap().to_owned());
                Sse::new(futures::stream::iter(
                    nofy_test_support::sse::chat_completion_events_exact(
                        "live credential",
                        "test-model",
                    )
                    .into_iter()
                    .map(Ok::<_, Infallible>),
                ))
            }
        }),
    ))
    .await;
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("credentials.json");
    let credentials = Arc::new(FileCredentials::open(&path, "live-project", None).unwrap());
    let host = KernelHost::open(
        dir.path(),
        native::registry(credentials.clone()).unwrap(),
        auth(),
    )
    .await
    .unwrap()
    .with_credentials(credentials.clone())
    .with_loader_helper(std::path::Path::new(env!("CARGO_BIN_EXE_nofy-agent-host")))
    .unwrap();
    let server = serve(host.router()).await;
    let release = import(&server, &document(&provider.url)).await;
    assert!(!path.exists());
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/credentials",
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
            reqwest::Method::PUT,
            "/api/v1/credentials/MODEL_TOKEN",
            VIEW,
            json!({"value":"forbidden-secret","expected_revision":null})
        )
        .await
        .0,
        403
    );
    let set = request(
        &server,
        reqwest::Method::PUT,
        "/api/v1/credentials/MODEL_TOKEN",
        ADMIN,
        json!({"value":"private-rotation-one","expected_revision":null}),
    )
    .await;
    assert_eq!(set.0, 200);
    assert_eq!(set.1["revision"], 1);
    assert!(!set.1.to_string().contains("private-rotation-one"));
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { host.run_worker(worker_stop, 2).await.unwrap() });
    post(&server, "/api/v1/runs", run(&release, "credential-one")).await;
    assert_eq!(
        outcome(&server, "credential-one").await["execution"]["status"],
        "completed"
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::PUT,
            "/api/v1/credentials/MODEL_TOKEN",
            ADMIN,
            json!({"value":"private-rotation-two","expected_revision":1})
        )
        .await
        .0,
        200
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::PUT,
            "/api/v1/credentials/MODEL_TOKEN",
            ADMIN,
            json!({"value":"private-stale-value","expected_revision":1})
        )
        .await
        .0,
        409
    );
    post(&server, "/api/v1/runs", run(&release, "credential-two")).await;
    assert_eq!(
        outcome(&server, "credential-two").await["execution"]["status"],
        "completed"
    );
    assert_eq!(
        &*headers.lock().unwrap(),
        &["Bearer private-rotation-one", "Bearer private-rotation-two"]
    );
    for route in ["/api/v1/catalog", "/api/v1/credentials"] {
        let (_, data) = request(&server, reqwest::Method::GET, route, ADMIN, Value::Null).await;
        assert!(!data.to_string().contains("private-rotation"));
    }
    let export = request(
        &server,
        reqwest::Method::GET,
        &format!("/api/v1/releases/{release}"),
        ADMIN,
        Value::Null,
    )
    .await
    .1;
    assert_eq!(export["digest"], release);
    assert!(!export.to_string().contains("private-rotation"));
    let malformed = request(
        &server,
        reqwest::Method::PUT,
        "/api/v1/credentials/MODEL_TOKEN",
        ADMIN,
        json!({"value":{"sensitive-invalid-content":true},"expected_revision":2}),
    )
    .await;
    assert_eq!(malformed.0, 422);
    assert!(
        !malformed
            .1
            .to_string()
            .contains("sensitive-invalid-content")
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::DELETE,
            "/api/v1/credentials/MODEL_TOKEN",
            ADMIN,
            json!({"expected_revision":2})
        )
        .await
        .1["available"],
        false
    );
    post(&server, "/api/v1/runs", run(&release, "credential-revoked")).await;
    assert_eq!(
        outcome(&server, "credential-revoked").await["execution"]["status"],
        "failed"
    );
    assert_eq!(headers.lock().unwrap().len(), 2);
    stop.cancel();
    worker.await.unwrap();
    assert!(credentials.resolve("MODEL_TOKEN").await.unwrap().is_none());
    assert_eq!(credentials.inspect().await.unwrap().revision, 3);
}
