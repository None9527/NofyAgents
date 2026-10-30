use super::*;
fn source() -> Value {
    let mut source: Value =
        serde_json::from_str(include_str!("../../examples/code-system.json")).unwrap();
    source["programs"]["flow"] = json!({"kind":"workflow","input":7,"document":{
        "host":{"name":"parameter-flow"},"entry":{"id":"main","version":"1"},"workflows":[{
            "reference":{"id":"main","version":"1"},"input_schema":{"type":["integer","null"]},"output_schema":{"type":["integer","null"]},
            "nodes":[{"id":"result","action":{"kind":"transform"},"input":{"from":"input"}}],"output":{"from":"node","node":"result"}
        }]
    }});
    source
}
fn submission(release: &str, id: &str, program: &str) -> Value {
    json!({"run_id":id,"thread_id":id,"system":"portable-assistant","release":release,"program":program})
}
fn result(execution: &Value) -> Value {
    serde_json::from_str(
        execution["execution"]["outcome"]["Completed"]["output"]
            .as_str()
            .unwrap(),
    )
    .unwrap()
}
#[tokio::test]
async fn one_release_accepts_distinct_tool_and_workflow_parameters_without_changing_code_or_defaults()
 {
    let dir = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let host = host(dir.path(), reads.clone()).await;
    let server = serve(host.router()).await;
    let release = post(&server, "/api/v1/import", source()).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    let path = format!("/api/v1/releases/{release}/programs");
    let (status, interfaces) =
        request(&server, reqwest::Method::GET, &path, VIEW, Value::Null).await;
    assert_eq!(status, 200);
    let tool = interfaces
        .as_array()
        .unwrap()
        .iter()
        .find(|p| p["name"] == "do_work")
        .unwrap();
    assert_eq!(tool["default_parameters"], json!({"value":7}));
    assert_eq!(
        tool["parameters_schema"]["properties"]["value"]["type"],
        "integer"
    );
    let agent = interfaces
        .as_array()
        .unwrap()
        .iter()
        .find(|p| p["name"] == "chat")
        .unwrap();
    assert_eq!(agent["accepts_message"], true);
    assert!(agent.get("default_parameters").is_none());
    for (id, program, value) in [
        ("wrong-type", "do_work", json!({"value":"wrong"})),
        (
            "unknown-key",
            "do_work",
            json!({"value":7,"source":"replacement"}),
        ),
        ("wrong-flow", "flow", json!({})),
        ("tool-null", "do_work", Value::Null),
        ("agent-data", "chat", Value::Null),
    ] {
        let mut body = submission(&release, id, program);
        body["parameters"] = value;
        if program == "chat" {
            body["input"] = json!({"text":"hello","attachments":[]});
        }
        let (status, _) =
            request(&server, reqwest::Method::POST, "/api/v1/runs", ADMIN, body).await;
        assert_eq!(status, 422, "{id}");
        assert!(host.store().managed_run(id).await.unwrap().is_none());
        assert!(host.store().execution_job(id).await.unwrap().is_none());
    }
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker_host = host.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 4).await.unwrap() });
    for (id, value, expected) in [
        ("first-data", Some(json!({"value":9})), 18),
        ("second-data", Some(json!({"value":11})), 22),
        ("default-data", None, 14),
    ] {
        let mut body = submission(&release, id, "do_work");
        if let Some(value) = value {
            body["parameters"] = value;
        }
        post(&server, "/api/v1/runs", body.clone()).await;
        assert_eq!(
            result(&outcome(&server, id).await)["value"]["result"],
            expected
        );
        assert_eq!(
            request(
                &server,
                reqwest::Method::POST,
                "/api/v1/runs",
                ADMIN,
                body.clone()
            )
            .await
            .0,
            200
        );
        body["parameters"] = json!({"value":30});
        assert_eq!(
            request(&server, reqwest::Method::POST, "/api/v1/runs", ADMIN, body)
                .await
                .0,
            422
        );
    }
    for (id, value) in [("flow-data", json!(19)), ("flow-null", Value::Null)] {
        let mut body = submission(&release, id, "flow");
        body["parameters"] = value.clone();
        post(&server, "/api/v1/runs", body).await;
        assert_eq!(result(&outcome(&server, id).await)["value"], value);
        assert_eq!(
            host.store()
                .managed_run(id)
                .await
                .unwrap()
                .unwrap()
                .request
                .parameters,
            Some(value)
        );
    }
    assert_eq!(reads.load(Ordering::SeqCst), 0);
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
    stop.cancel();
    worker.await.unwrap();
}
#[tokio::test]
async fn parameter_accept_then_exit_child() {
    let Ok(directory) = std::env::var("NOFY_PARAMETER_ACCEPT_CHILD") else {
        return;
    };
    let host = host(
        std::path::Path::new(&directory),
        Arc::new(AtomicUsize::new(0)),
    )
    .await;
    let server = serve(host.router()).await;
    let release = post(&server, "/api/v1/import", source()).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    let mut body = submission(&release, "parameter-recovery", "do_work");
    body["parameters"] = json!({"value":23});
    let accepted = post(&server, "/api/v1/runs", body.clone()).await;
    assert_eq!(accepted["status"], "queued");
    let mut file =
        std::fs::File::create(std::path::Path::new(&directory).join("parameter-request.json"))
            .unwrap();
    use std::io::Write;
    file.write_all(&serde_json::to_vec(&body).unwrap()).unwrap();
    file.sync_all().unwrap();
    std::process::exit(97);
}
#[tokio::test]
async fn actual_process_exit_keeps_admitted_parameters_and_replay_receipt() {
    let dir = tempfile::tempdir().unwrap();
    let directory = dir.path().to_owned();
    let output = tokio::task::spawn_blocking(move || {
        std::process::Command::new(std::env::current_exe().unwrap())
            .args([
                "--exact",
                "parameters::parameter_accept_then_exit_child",
                "--nocapture",
            ])
            .env("NOFY_PARAMETER_ACCEPT_CHILD", directory)
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
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let body: Value =
        serde_json::from_slice(&std::fs::read(dir.path().join("parameter-request.json")).unwrap())
            .unwrap();
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { host.run_worker(worker_stop, 2).await.unwrap() });
    assert_eq!(
        result(&outcome(&server, "parameter-recovery").await)["value"]["result"],
        46
    );
    assert_eq!(
        request(&server, reqwest::Method::POST, "/api/v1/runs", ADMIN, body)
            .await
            .0,
        200
    );
    assert_eq!(
        result(&outcome(&server, "parameter-recovery").await)["value"]["result"],
        46
    );
    stop.cancel();
    worker.await.unwrap();
}
