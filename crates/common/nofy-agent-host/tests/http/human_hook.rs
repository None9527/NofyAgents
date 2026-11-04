use super::*;
#[tokio::test]
async fn human_response_resumes_original_model_hook_before_any_model_dispatch() {
    let calls = Arc::new(AtomicUsize::new(0));
    let effect_service = human::effect_service(calls.clone()).await;
    let requests = Arc::new(Mutex::new(vec![]));
    let provider = serve(
        Router::new()
            .route("/v1/chat/completions", post_handler())
            .with_state(requests.clone()),
    )
    .await;
    let mut source = human::source(&effect_service.url);
    let mut graph = source["programs"]["direct"]["document"].clone();
    let decision = json!({"type":"object","required":["decision"],"properties":{"decision":{"const":"continue"}},"additionalProperties":false});
    graph["host"]["name"] = json!("human-hook-host");
    graph["workflows"][0]["input_schema"] = json!({"type":"object"});
    graph["workflows"][0]["output_schema"] = decision.clone();
    graph["workflows"][0]["nodes"][1]["input"] =
        json!({"from":"literal","value":{"question":"continue"}});
    graph["workflows"][0]["nodes"][1]["action"]["response_schema"] = decision;
    let model_source = serde_json::to_value(document(&provider.url)).unwrap();
    source["modules"].as_array_mut().unwrap().extend([
        model_source["modules"][0].clone(),
        model_source["modules"][1].clone(),
        model_source["modules"][3].clone(),
        model_source["modules"][4].clone(),
        json!({"reference":human::r("prompt"),"factory":"prompt.static","config":{"text":"approved after human"}}),
        json!({"reference":human::r("hook-resource"),"factory":"resource.workflow","config":{"document":graph,"bindings":{"effects":"tool_pack"}},"dependencies":{"effects":human::r("effect")}}),
        json!({"reference":human::r("hook-handler"),"factory":"hook.workflow_connected","config":{},"dependencies":{"workflow":human::r("hook-resource")}}),
        json!({"reference":human::r("before-model"),"factory":"hook.subscription","config":{"event":"before_model","timeout_ms":30000},"dependencies":{"handler":human::r("hook-handler")}}),
    ]);
    source["programs"]["chat"] = json!({"kind":"agent","definition":{"name":"human-hook-agent","model":human::r("model"),"prompt":human::r("prompt"),"hooks":[human::r("before-model")]}});
    let dir = tempfile::tempdir().unwrap();
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let release = post(&server, "/api/v1/import", source).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { host.run_worker(worker_stop, 2).await.unwrap() });
    let mut run = human::run(&release, "human-hook", "chat");
    run["input"] = json!({"text":"hello","attachments":[]});
    post(&server, "/api/v1/runs", run).await;
    let target = human::target(&server, "human-hook").await;
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    assert!(requests.lock().unwrap().is_empty());
    let mut command = human::command(
        "hook-human-answer",
        "human-hook",
        &target,
        json!([human::r("hook-resource")]),
    );
    command["command"]["value"] = json!({"decision":"continue"});
    post(&server, "/api/v1/actions", command.clone()).await;
    // This multi-stage durable workflow owns its declared 30s controller
    // budget plus preparation/settlement; it is not a default-timeout test.
    let receipt = action_result_within(&server, "hook-human-answer", Duration::from_secs(45)).await;
    assert!(receipt["error"].is_null(), "{receipt}");
    let resumed = outcome(&server, "human-hook").await;
    assert_eq!(
        resumed["execution"]["outcome"]["Completed"]["output"],
        "approved after human",
        "receipt_finished={}; receipt_error={}; resumed={}; effects={}; model_requests={}",
        receipt["finished"],
        receipt["error"],
        run_diagnostics(&resumed),
        calls.load(Ordering::SeqCst),
        requests.lock().unwrap().len(),
    );
    assert_eq!(post(&server, "/api/v1/actions", command).await, receipt);
    assert_eq!(calls.load(Ordering::SeqCst), 2);
    assert_eq!(requests.lock().unwrap().len(), 1);
    stop.cancel();
    worker.await.unwrap();
}
