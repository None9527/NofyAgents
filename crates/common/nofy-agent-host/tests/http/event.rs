use super::*;
fn source() -> Value {
    serde_json::from_str(include_str!("../../examples/event-system.json")).unwrap()
}
fn run(release: &str, id: &str) -> Value {
    json!({"run_id":id,"thread_id":id,"system":"portable-business-event","release":release,"program":"received"})
}
fn result(record: &Value) -> Value {
    serde_json::from_str(
        record["execution"]["outcome"]["Completed"]["output"]
            .as_str()
            .unwrap(),
    )
    .unwrap()
}
#[tokio::test]
async fn one_file_declares_business_event_and_source_hook_then_migrates_its_lock_without_native_registration()
 {
    let dir = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let host = host(dir.path(), reads.clone()).await;
    let server = serve(host.router()).await;
    let source = source();
    let bundle = post(&server, "/api/v1/validate", source.clone()).await;
    assert_eq!(reads.load(Ordering::SeqCst), 0);
    let release = post(&server, "/api/v1/import", bundle.clone()).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    let mut wrong = source.clone();
    wrong["modules"][0]["config"]["events"][0]["name"] = json!("before_model");
    let mut owner = source.clone();
    owner["modules"][0]["config"]["owner"] = json!({"id":"nofy.runtime","version":"1"});
    let mut namespace = source.clone();
    namespace["modules"][0]["reference"]["id"] = json!("nofy.runtime");
    let mut missing = source.clone();
    missing["modules"][3]["config"]["event"] = json!("business.missing");
    let mut wrong_type = source.clone();
    wrong_type["modules"][3]["dependencies"]["producer"] = json!({"id":"event-code","version":"1"});
    let mut other_owner = source.clone();
    let mut other = source["modules"][0].clone();
    other["reference"]["id"] = json!("other-producer");
    other_owner["modules"].as_array_mut().unwrap().push(other);
    other_owner["modules"][3]["dependencies"]["producer"] =
        json!({"id":"other-producer","version":"1"});
    for invalid in [wrong, owner, namespace, missing, wrong_type, other_owner] {
        assert_eq!(
            request(
                &server,
                reqwest::Method::POST,
                "/api/v1/import",
                ADMIN,
                invalid
            )
            .await
            .0,
            422
        );
    }
    assert_eq!(
        host.control()
            .inspect()
            .await
            .unwrap()
            .unwrap()
            .data
            .publications
            .len(),
        1
    );
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker_host = host.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 3).await.unwrap() });
    let mut request_body = run(&release, "event-data");
    request_body["parameters"] = json!({"value":9});
    post(&server, "/api/v1/runs", request_body.clone()).await;
    let first = outcome(&server, "event-data").await;
    assert_eq!(result(&first)["payload"], json!({"value":18}));
    assert_eq!(
        first["execution"]["outcome"]["Completed"]["state"]["messages"],
        json!([])
    );
    let state: nofy_agent_runtime::RunState =
        serde_json::from_value(first["execution"]["outcome"]["Completed"]["state"].clone())
            .unwrap();
    assert_eq!(state.model_sequence, 0);
    assert_eq!(
        first["execution"]["snapshot"]["program"]["snapshot"]["declaration"]["owner"],
        json!({"id":"business-events","version":"1"})
    );
    let events = host
        .store()
        .events("event-data", 0, 1000)
        .await
        .unwrap()
        .len();
    assert_eq!(
        post(&server, "/api/v1/runs", request_body).await["status"],
        "closed"
    );
    assert_eq!(
        host.store()
            .events("event-data", 0, 1000)
            .await
            .unwrap()
            .len(),
        events
    );
    let mut bad = run(&release, "bad-event");
    bad["parameters"] = json!({"value":"wrong"});
    assert_eq!(
        request(&server, reqwest::Method::POST, "/api/v1/runs", ADMIN, bad)
            .await
            .0,
        422
    );
    assert!(
        host.store()
            .managed_run("bad-event")
            .await
            .unwrap()
            .is_none()
    );
    post(&server, "/api/v1/runs", run(&release, "event-default")).await;
    assert_eq!(
        result(&outcome(&server, "event-default").await)["payload"]["value"],
        14
    );
    assert_eq!(reads.load(Ordering::SeqCst), 0);
    let second_dir = tempfile::tempdir().unwrap();
    let second = super::host(second_dir.path(), reads.clone()).await;
    let second_server = serve(second.router()).await;
    assert_eq!(
        post(&second_server, "/api/v1/import", bundle).await["bundle"]["digest"],
        release
    );
    post(
        &second_server,
        "/api/v1/runs",
        run(&release, "migrated-event"),
    )
    .await;
    let second_stop = CancellationToken::new();
    let worker_stop = second_stop.clone();
    let second_worker =
        tokio::spawn(async move { second.run_worker(worker_stop, 2).await.unwrap() });
    assert_eq!(
        result(&outcome(&second_server, "migrated-event").await)["payload"]["value"],
        14
    );
    stop.cancel();
    second_stop.cancel();
    worker.await.unwrap();
    second_worker.await.unwrap();
}
#[tokio::test]
async fn business_event_workflow_human_response_keeps_original_owned_source_and_payload() {
    let mut source = source();
    let graph = json!({"host":{"name":"owned-human-host"},"entry":{"id":"review","version":"1"},"workflows":[{
        "reference":{"id":"review","version":"1"},"input_schema":{"type":"object"},"output_schema":{"type":"object"},
        "nodes":[{"id":"human","input":{"from":"literal","value":{"question":"continue"}},"action":{"kind":"human","response_schema":{"type":"object","required":["decision","payload"],"properties":{"decision":{"const":"patch"},"payload":{"type":"object","required":["value"],"properties":{"value":{"type":"integer"}},"additionalProperties":false}},"additionalProperties":false}}}],
        "output":{"from":"node","node":"human"}
    }]});
    source["modules"].as_array_mut().unwrap().push(json!({"reference":{"id":"event-review","version":"1"},"factory":"resource.workflow","config":{"document":graph}}));
    source["modules"][2] = json!({"reference":{"id":"event-handler","version":"1"},"factory":"hook.workflow_connected","config":{},"dependencies":{"workflow":{"id":"event-review","version":"1"}}});
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
    post(&server, "/api/v1/runs", run(&release, "human-event")).await;
    let target = human::target(&server, "human-event").await;
    let mut command = human::command(
        "event-answer",
        "human-event",
        &target,
        json!([{"id":"event-review","version":"1"}]),
    );
    command["command"]["value"] = json!({"decision":"patch","payload":{"value":17}});
    post(&server, "/api/v1/actions", command.clone()).await;
    let receipt = action_result(&server, "event-answer").await;
    assert!(receipt["error"].is_null(), "{receipt}");
    let completed = outcome(&server, "human-event").await;
    assert!(
        completed["execution"]["outcome"]["Completed"].is_object(),
        "business human event did not complete: receipt={receipt}; state={}",
        run_diagnostics(&completed)
    );
    assert_eq!(result(&completed)["payload"], json!({"value":17}));
    assert_eq!(post(&server, "/api/v1/actions", command).await, receipt);
    stop.cancel();
    worker.await.unwrap();
}
