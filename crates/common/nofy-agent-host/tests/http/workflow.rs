use super::*;
#[tokio::test]
async fn inline_workflow_resources_require_resource_scope_before_any_publication_or_draft_write() {
    let dir = tempfile::tempdir().unwrap();
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let source = json!({"schema_version":1,"name":"inline-resource","modules":[],"programs":{"flow":{"kind":"workflow","input":{},"document":{
        "modules":[{"reference":{"id":"service","version":"1"},"factory":"resource.http","config":{"base_url":"http://127.0.0.1:9/api/","methods":["POST"]}}],
        "host":{"name":"inline-host"},"entry":{"id":"main","version":"1"},"workflows":[{"reference":{"id":"main","version":"1"},"input_schema":true,"output_schema":true,"nodes":[{"id":"one","action":{"kind":"transform"},"input":{"from":"literal","value":{"ok":true}}}],"output":{"from":"node","node":"one"}}]
    }}}});
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/import",
            PUBLISH,
            source.clone()
        )
        .await
        .0,
        403
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::PUT,
            "/api/v1/drafts/inline",
            PUBLISH,
            json!({"document":source,"expected_revision":null})
        )
        .await
        .0,
        403
    );
    assert!(host.control().inspect().await.unwrap().is_none());
    let imported = post(&server, "/api/v1/import", source).await;
    assert_eq!(imported["bundle"]["document"]["name"], "inline-resource");
}
fn module<'a>(value: &'a mut Value, id: &str) -> &'a mut Value {
    value["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|m| m["reference"]["id"] == id)
        .unwrap()
}
fn result(value: &Value) -> Value {
    serde_json::from_str(
        value["execution"]["outcome"]["Completed"]["output"]
            .as_str()
            .unwrap(),
    )
    .unwrap()
}
#[tokio::test]
async fn one_file_loads_reusable_workflow_tools_hooks_and_agents_with_frozen_dependencies() {
    let calls = Arc::new(Mutex::new(vec![]));
    let provider = serve(
        Router::new()
            .route("/v1/chat/completions", post_handler())
            .with_state(calls.clone()),
    )
    .await;
    let dir = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let host = host(dir.path(), reads.clone()).await;
    let server = serve(host.router()).await;
    let mut source: Value =
        serde_json::from_str(include_str!("../../examples/workflow-system.json")).unwrap();
    module(&mut source, "provider")["config"]["connection"] = json!({"base_url":format!("{}/v1",provider.url),"api_backend":"chat_completions","auth_scheme":"bearer","max_retries":0});
    module(&mut source, "provider")["config"]["models"] = json!(["test-model"]);
    module(&mut source, "model")["config"]["model"] = json!("test-model");
    let dependency=post(&server,"/api/v1/modules/dependencies",json!({"factory":"resource.workflow","config":module(&mut source,"calculator-workflow")["config"]})).await;
    assert_eq!(dependency["dependencies"]["calculator"], "tool_pack");
    let preview = post(&server, "/api/v1/validate", source.clone()).await;
    assert_eq!(reads.load(Ordering::SeqCst), 0);
    assert!(calls.lock().unwrap().is_empty());
    // A parent definition exists but is unavailable without a declared wire.
    let mut hidden = source.clone();
    module(&mut hidden, "calculator-workflow")["config"]["bindings"] = json!({});
    module(&mut hidden, "calculator-workflow")["dependencies"] = json!({});
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/validate",
            ADMIN,
            hidden
        )
        .await
        .0,
        422
    );
    let mut wrong = source.clone();
    module(&mut wrong, "calculator-workflow")["dependencies"]["calculator"] =
        json!({"id":"prompt","version":"1"});
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
    let mut unrelated = source.clone();
    unrelated["modules"].as_array_mut().unwrap().push(json!({"reference":{"id":"unrelated","version":"1"},"factory":"prompt.static","config":{"text":"extra"}}));
    assert_eq!(
        post(&server, "/api/v1/validate", unrelated).await["lock"]["programs"]["do_work"]["composition_digest"],
        preview["lock"]["programs"]["do_work"]["composition_digest"]
    );
    let release = post(&server, "/api/v1/import", preview).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker_host = host.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 4).await.unwrap() });
    let submit = |release: &str, id: &str, program: &str| json!({"run_id":id,"thread_id":id,"system":"portable-assistant","release":release,"program":program});
    post(
        &server,
        "/api/v1/runs",
        submit(&release, "wf-tool", "do_work"),
    )
    .await;
    let first = outcome(&server, "wf-tool").await;
    assert_eq!(first["execution"]["status"], "completed");
    assert_eq!(result(&first)["value"]["result"], 14);
    assert_eq!(reads.load(Ordering::SeqCst), 0);
    post(&server, "/api/v1/runs", run(&release, "wf-hook")).await;
    assert_eq!(
        outcome(&server, "wf-hook").await["execution"]["outcome"]["Completed"]["output"],
        "code hook one"
    );
    post(
        &server,
        "/api/v1/runs",
        submit(&release, "wf-agent", "delegate"),
    )
    .await;
    assert_eq!(
        outcome(&server, "wf-agent").await["execution"]["status"],
        "completed"
    );
    assert!(
        host.store()
            .children("wf-agent")
            .await
            .unwrap()
            .iter()
            .any(|c| c.agent_name == "child-agent")
    );
    assert_eq!(calls.lock().unwrap().len(), 2);
    module(&mut source, "calculate")["config"]["source"] = json!("#{result:args.value * 3}");
    module(&mut source, "hook-code")["config"]["source"] = json!(
        "let payload=args.payload;payload.request.messages[0].content=\"workflow source two\";#{decision:\"patch\",payload:payload}"
    );
    let next = post(&server, "/api/v1/import", source).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    post(
        &server,
        "/api/v1/runs",
        submit(&next, "wf-tool-two", "do_work"),
    )
    .await;
    assert_eq!(
        result(&outcome(&server, "wf-tool-two").await)["value"]["result"],
        21
    );
    post(&server, "/api/v1/runs", run(&next, "wf-hook-two")).await;
    assert_eq!(
        outcome(&server, "wf-hook-two").await["execution"]["outcome"]["Completed"]["output"],
        "workflow source two"
    );
    post(
        &server,
        "/api/v1/runs",
        submit(&release, "wf-old", "do_work"),
    )
    .await;
    assert_eq!(
        result(&outcome(&server, "wf-old").await)["value"]["result"],
        14
    );
    let events = host.store().events("wf-tool", 0, 1000).await.unwrap().len();
    post(
        &server,
        "/api/v1/runs",
        submit(&release, "wf-tool", "do_work"),
    )
    .await;
    assert_eq!(
        host.store().events("wf-tool", 0, 1000).await.unwrap().len(),
        events
    );
    stop.cancel();
    worker.await.unwrap();
    let restored = host.control().export(&release).await.unwrap();
    let target = tempfile::tempdir().unwrap();
    let target_host = super::host(target.path(), Arc::new(AtomicUsize::new(0))).await;
    assert_eq!(
        target_host
            .control()
            .import(restored)
            .await
            .unwrap()
            .bundle
            .digest,
        release
    );
}
