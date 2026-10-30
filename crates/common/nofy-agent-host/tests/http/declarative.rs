use super::*;
use nofy_agent_host::credentials::FileCredentials;
use nofy_agent_runtime::system::SystemBundle;
fn config<'a>(value: &'a mut Value, name: &str) -> &'a mut Value {
    &mut value["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|m| m["reference"]["id"] == name)
        .unwrap()["config"]
}
fn source(service: &str, provider: &str) -> Value {
    let mut value: Value =
        serde_json::from_str(include_str!("../../examples/http-system.json")).unwrap();
    config(&mut value, "provider")["connection"]["base_url"] = json!(format!("{provider}/v1"));
    config(&mut value, "provider")["models"] = json!(["test-model"]);
    config(&mut value, "model")["model"] = json!("test-model");
    config(&mut value, "service")["base_url"] = json!(format!("{service}/api/"));
    value
}
async fn hook(Json(event): Json<Value>) -> Json<Value> {
    let mut payload = event["payload"].clone();
    payload["request"]["messages"][0]["content"] = json!("hook version one");
    Json(json!({"decision":"patch","payload":payload}))
}
async fn hook_two(Json(event): Json<Value>) -> Json<Value> {
    let mut payload = event["payload"].clone();
    payload["request"]["messages"][0]["content"] = json!("hook version two");
    Json(json!({"decision":"patch","payload":payload}))
}
async fn tool_request(server: &Serving, release: &str, id: &str) -> Value {
    post(server,"/api/v1/runs",json!({"run_id":id,"thread_id":id,"system":"portable-assistant","release":release,"program":"do_work"})).await
}
#[tokio::test]
async fn system_file_registers_http_tool_and_hook_then_edits_them_without_host_registration() {
    let calls = Arc::new(Mutex::new(Vec::<(String, String)>::new()));
    let captured = calls.clone();
    let service = serve(
        Router::new()
            .route(
                "/api/tool",
                route_post(|| async { Json(json!({"version":1})) }),
            )
            .route(
                "/api/tool2",
                route_post(|| async { Json(json!({"version":2})) }),
            )
            .route("/api/hook", route_post(hook))
            .route("/api/hook2", route_post(hook_two))
            .layer(axum::middleware::from_fn(
                move |request: axum::extract::Request, next: axum::middleware::Next| {
                    let captured = captured.clone();
                    async move {
                        captured.lock().unwrap().push((
                            request.uri().path().to_owned(),
                            request.headers()["authorization"]
                                .to_str()
                                .unwrap()
                                .to_owned(),
                        ));
                        next.run(request).await
                    }
                },
            )),
    )
    .await;
    let model_calls = Arc::new(Mutex::new(vec![]));
    let provider = serve(
        Router::new()
            .route("/v1/chat/completions", post_handler())
            .with_state(model_calls.clone()),
    )
    .await;
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("credentials.json");
    let credentials = Arc::new(FileCredentials::open(&path, "http-project", None).unwrap());
    let host = KernelHost::open(
        dir.path(),
        native::registry(credentials.clone()).unwrap(),
        auth(),
    )
    .await
    .unwrap()
    .with_credentials(credentials);
    let server = serve(host.router()).await;
    let source = source(&service.url, &provider.url);
    let locked = post(&server, "/api/v1/validate", source.clone()).await;
    assert!(!path.exists());
    assert!(calls.lock().unwrap().is_empty());
    assert!(model_calls.lock().unwrap().is_empty());
    let bundle: SystemBundle = serde_json::from_value(locked.clone()).unwrap();
    let target = tempfile::tempdir().unwrap();
    let target_credentials = Arc::new(
        FileCredentials::open(target.path().join("credentials.json"), "http-project", None)
            .unwrap(),
    );
    assert_eq!(
        bundle
            .restore(&native::registry(target_credentials).unwrap())
            .unwrap()
            .bundle
            .digest,
        bundle.digest
    );
    let mut unrelated = source.clone();
    let mut extra = unrelated["modules"]
        .as_array()
        .unwrap()
        .iter()
        .find(|m| m["reference"]["id"] == "service")
        .unwrap()
        .clone();
    extra["reference"]["id"] = json!("unrelated-service");
    unrelated["modules"].as_array_mut().unwrap().push(extra);
    let extra = post(&server, "/api/v1/validate", unrelated).await;
    assert_eq!(
        extra["lock"]["programs"]["chat"]["composition_digest"],
        locked["lock"]["programs"]["chat"]["composition_digest"]
    );
    for (module, field, value) in [
        (
            "service",
            "base_url",
            json!("http://name:password@127.0.0.1/api/"),
        ),
        ("remote-tool", "path", json!("../escape")),
        ("remote-tool", "method", json!("DELETE")),
        ("remote-tool", "credential_ref", json!("UNADMITTED")),
        ("remote-tool", "unknown", json!(true)),
    ] {
        let mut invalid = source.clone();
        config(&mut invalid, module)[field] = value;
        assert_eq!(
            request(
                &server,
                reqwest::Method::POST,
                "/api/v1/validate",
                ADMIN,
                invalid
            )
            .await
            .0,
            422
        );
    }
    let mut wrong = source.clone();
    wrong["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|m| m["reference"]["id"] == "remote-tool")
        .unwrap()["dependencies"]["connection"] = json!({"id":"provider","version":"1"});
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/validate",
            ADMIN,
            wrong
        )
        .await
        .0,
        422
    );
    assert!(calls.lock().unwrap().is_empty());
    assert!(!path.exists());
    for (reference, value) in [
        ("MODEL_TOKEN", "model-value"),
        ("SERVICE_TOKEN", "service-value-one"),
    ] {
        assert_eq!(
            request(
                &server,
                reqwest::Method::PUT,
                &format!("/api/v1/credentials/{reference}"),
                ADMIN,
                json!({"expected_revision":null,"value":value})
            )
            .await
            .0,
            200
        );
    }
    let release = post(&server, "/api/v1/import", locked.clone()).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { host.run_worker(worker_stop, 4).await.unwrap() });
    tool_request(&server, &release, "external-one").await;
    assert_eq!(
        outcome(&server, "external-one").await["execution"]["status"],
        "completed"
    );
    post(&server, "/api/v1/runs", run(&release, "hook-one")).await;
    assert_eq!(
        outcome(&server, "hook-one").await["execution"]["outcome"]["Completed"]["output"],
        "hook version one"
    );
    let mut next = source.clone();
    config(&mut next, "remote-tool")["path"] = json!("tool2");
    config(&mut next, "hook-tool")["path"] = json!("hook2");
    let next = post(&server, "/api/v1/import", next).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    assert_eq!(
        request(
            &server,
            reqwest::Method::PUT,
            "/api/v1/credentials/SERVICE_TOKEN",
            ADMIN,
            json!({"expected_revision":2,"value":"service-value-two"})
        )
        .await
        .0,
        200
    );
    tool_request(&server, &next, "external-two").await;
    assert_eq!(
        outcome(&server, "external-two").await["execution"]["status"],
        "completed"
    );
    post(&server, "/api/v1/runs", run(&next, "hook-two")).await;
    assert_eq!(
        outcome(&server, "hook-two").await["execution"]["outcome"]["Completed"]["output"],
        "hook version two"
    );
    tool_request(&server, &release, "external-old").await;
    assert_eq!(
        outcome(&server, "external-old").await["execution"]["status"],
        "completed"
    );
    let captured = calls.lock().unwrap().clone();
    assert_eq!(captured.len(), 5);
    assert_eq!(
        captured.iter().map(|c| c.0.as_str()).collect::<Vec<_>>(),
        [
            "/api/tool",
            "/api/hook",
            "/api/tool2",
            "/api/hook2",
            "/api/tool"
        ]
    );
    assert!(
        captured[..2]
            .iter()
            .all(|c| c.1 == "Bearer service-value-one")
    );
    assert!(
        captured[2..]
            .iter()
            .all(|c| c.1 == "Bearer service-value-two")
    );
    assert_eq!(model_calls.lock().unwrap().len(), 2);
    tool_request(&server, &release, "external-one").await;
    assert_eq!(calls.lock().unwrap().len(), 5);
    assert!(!locked.to_string().contains("service-value"));
    stop.cancel();
    worker.await.unwrap();
}
