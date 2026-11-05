use super::*;

#[tokio::test]
async fn bounded_status_preserves_unicode_preview_lengths_and_full_evidence() {
    let text = "界".repeat(8192);
    let document = json!({"schema_version":1,"name":"status-system","modules":[
        {"reference":{"id":"double","version":"1"},"factory":"tool.rhai","config":{"contract":{"name":"double","input_schema":{"type":"object"},"output_schema":{"type":"string"}},"source":"args.text + args.text"}}
    ],"programs":{"compute":{"kind":"tool","definition":{"name":"compute","tool_packs":[{"id":"double","version":"1"}]},"call":{"id":"double-call","name":"double","arguments":{"text":text}}}}});
    let directory = tempfile::tempdir().unwrap();
    let host = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let release = post(&server, "/api/v1/import", document).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { host.run_worker(worker_stop, 1).await.unwrap() });
    post(&server,"/api/v1/runs",json!({"run_id":"status-run","thread_id":"status-thread","system":"status-system","release":release,"program":"compute"})).await;
    let full = outcome(&server, "status-run").await;
    assert_eq!(full["execution"]["status"], "completed", "{full}");
    let (code, summary) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/runs/status-run?view=status",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(code, 200, "{summary}");
    assert_eq!(summary["format"], "nofy.run-status/v1");
    assert_eq!(summary["execution"]["status"], "completed");
    assert!(summary["execution"].get("snapshot").is_none());
    assert!(summary["run"]["request"].get("input").is_none());
    let original = full["execution"]["outcome"]["Completed"]["output"]
        .as_str()
        .unwrap();
    let output = &summary["execution"]["output"];
    assert_eq!(output["bytes"].as_u64().unwrap(), original.len() as u64);
    assert_eq!(output["truncated"], true);
    assert!(original.starts_with(output["preview"].as_str().unwrap()));
    assert!(serde_json::to_vec(&summary).unwrap().len() < 20_000);
    assert!(full["execution"]["snapshot"].is_object());
    stop.cancel();
    worker.await.unwrap();
}
