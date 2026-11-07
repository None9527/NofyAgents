use super::*;

#[tokio::test]
async fn actual_model_admission_overflow_fails_only_the_scope_worker_and_a_new_definition_runs_normally()
 {
    if !workers_confined() {
        return;
    }
    let requests = Arc::new(Mutex::new(Vec::<Value>::new()));
    let observed = requests.clone();
    let hostile = Arc::new(std::sync::atomic::AtomicBool::new(true));
    let mode = hostile.clone();
    let provider = serve(Router::new().route("/v1/chat/completions", route_post(move |Json(body): Json<Value>| {
        let observed = observed.clone(); let mode = mode.clone();
        async move {
            observed.lock().unwrap().push(body.clone());
            let model = body["model"].as_str().unwrap();
            let result = body["messages"].as_array().unwrap().iter().any(|message| message["role"] == "tool");
            let events = if result {
                nofy_test_support::sse::chat_completion_script_exact("normal after confined overflow", model)
            } else {
                let (tool, args) = if model == "skill-model" {
                    ("lookup", json!({"file_path":if mode.load(Ordering::SeqCst) {"a".repeat(6_000) + "c"} else {"src/lib.rs".into()}}))
                } else { ("skill", json!({"skill":"review","args":"work"})) };
                nofy_test_support::sse::chat_completions_reasoning_then_tool_call_events("", &format!("{model}-call"), tool, &args.to_string(), model)
            };
            Sse::new(futures::stream::iter(events.into_iter().map(|event| Ok::<_, Infallible>(axum::response::sse::Event::default().data(event.data)))))
        }
    }))).await;
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
    let mut source = super::super::scope::system(&provider.url, &service.url, true, 8);
    let hostile_program=super::super::programs::text().replace("fn scope(input) {",
        "fn scope(input) { if input.operation.kind == \"admit\" && input.operation[\"call\"].arguments.file_path.len() > 1000 { loop {} } ");
    super::super::programs::attach(&mut source, &hostile_program);
    let module = source["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|module| module["reference"]["id"] == "skills")
        .unwrap();
    module["factory"] = json!("tool.skills_scoped");
    module["config"]["skills"][0]["allowed_tools"] = json!(["workspace-read"]);
    module["config"]["execution"]["policies"] = json!([]);
    module["dependencies"]
        .as_object_mut()
        .unwrap()
        .remove("approval");
    let dir = tempfile::tempdir().unwrap();
    let host = resident(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    post(&server, "/api/v1/validate", source.clone()).await;
    assert_eq!(host.loader().scope_status().started, 0);
    let release = post(&server, "/api/v1/import", source.clone()).await;
    assert_eq!(host.loader().scope_status().started, 0);
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker_host = host.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 1).await.unwrap() });
    post(
        &server,
        "/api/v1/runs",
        launch(
            release["bundle"]["digest"].as_str().unwrap(),
            "scope-overflow",
            "chat",
        ),
    )
    .await;
    let failed = outcome(&server, "scope-overflow").await;
    assert_eq!(failed["execution"]["status"], "failed", "{failed}");
    assert!(failed.to_string().contains("scope program"), "{failed}");
    assert_eq!(requests.lock().unwrap().len(), 2);
    assert_eq!(effects.load(Ordering::SeqCst), 0);
    assert_eq!(host.loader().scope_status().in_flight, 0);
    assert!(pids(dir.path()).is_empty());
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/modules",
            VIEW,
            Value::Null
        )
        .await
        .0,
        200
    );
    hostile.store(false, Ordering::SeqCst);
    config(&mut source, "scope-code")["bundle"]["files"]["scope.rhai"] =
        json!(super::super::programs::text());
    config(&mut source, "skills")["skills"][0]["allowed_tools"] = json!(["workspace-read"]);
    let release = post(&server, "/api/v1/import", source).await;
    post(
        &server,
        "/api/v1/runs",
        launch(
            release["bundle"]["digest"].as_str().unwrap(),
            "scope-normal",
            "chat",
        ),
    )
    .await;
    let normal = outcome(&server, "scope-normal").await;
    assert_eq!(normal["execution"]["status"], "completed", "{normal}");
    assert_eq!(requests.lock().unwrap().len(), 6);
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    stop.cancel();
    worker.await.unwrap();
}
