use super::*;
#[cfg(target_os = "linux")]
#[path = "code/isolation.rs"]
mod isolation;
/// The code worker's confinement tests watch workers through `pidfd_open` and
/// `/proc`; they compile for Linux only. A stand-in keeps the unit in every
/// platform's results.
#[cfg(not(target_os = "linux"))]
mod isolation {
    #[test]
    fn unit_code_worker_confinement() {
        nofy_test_support::skip(
            "an isolated code worker observed through pidfd and /proc",
            "tests/http/code/isolation.rs is compiled for Linux only",
        );
    }
}
#[tokio::test]
async fn source_code_from_one_file_runs_as_tool_and_hook_then_changes_in_the_same_kernel() {
    let requests = Arc::new(Mutex::new(vec![]));
    let provider = serve(
        Router::new()
            .route("/v1/chat/completions", post_handler())
            .with_state(requests.clone()),
    )
    .await;
    let dir = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let host = host(dir.path(), reads.clone()).await;
    let server = serve(host.router()).await;
    let mut source: Value =
        serde_json::from_str(include_str!("../../examples/code-system.json")).unwrap();
    let module = |value: &mut Value, id: &str, field: &str, new: Value| {
        value["modules"]
            .as_array_mut()
            .unwrap()
            .iter_mut()
            .find(|m| m["reference"]["id"] == id)
            .unwrap()["config"][field] = new;
    };
    module(
        &mut source,
        "provider",
        "base_url",
        json!(format!("{}/v1/", provider.url)),
    );
    module(&mut source, "provider", "models", json!(["test-model"]));
    module(&mut source, "model", "model", json!("test-model"));
    let release = post(&server, "/api/v1/import", source.clone()).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    assert_eq!(reads.load(Ordering::SeqCst), 0);
    assert!(requests.lock().unwrap().is_empty());
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { host.run_worker(worker_stop, 4).await.unwrap() });
    let submit = |release: &str, id: &str| json!({"run_id":id,"thread_id":id,"system":"portable-assistant","release":release,"program":"do_work"});
    post(&server, "/api/v1/runs", submit(&release, "code-one")).await;
    let first = outcome(&server, "code-one").await;
    assert_eq!(first["execution"]["status"], "completed");
    let first_output: Value = serde_json::from_str(
        first["execution"]["outcome"]["Completed"]["output"]
            .as_str()
            .unwrap(),
    )
    .unwrap();
    assert_eq!(first_output["value"]["result"], 14);
    assert_eq!(reads.load(Ordering::SeqCst), 0);
    post(&server, "/api/v1/runs", run(&release, "source-hook-one")).await;
    assert_eq!(
        outcome(&server, "source-hook-one").await["execution"]["outcome"]["Completed"]["output"],
        "code hook one"
    );
    module(
        &mut source,
        "calculate",
        "source",
        json!("complete(#{result: args.value * 3});"),
    );
    module(
        &mut source,
        "hook-code",
        "source",
        json!(
            "let payload=args.payload;payload.request.messages[0].content=\"code hook two\";#{decision:\"patch\",payload:payload}"
        ),
    );
    let next = post(&server, "/api/v1/import", source).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    post(&server, "/api/v1/runs", submit(&next, "code-two")).await;
    let second = outcome(&server, "code-two").await;
    assert_eq!(second["execution"]["status"], "completed");
    let second_output: Value = serde_json::from_str(
        second["execution"]["outcome"]["Completed"]["output"]
            .as_str()
            .unwrap(),
    )
    .unwrap();
    assert_eq!(second_output["value"]["result"], 21);
    post(&server, "/api/v1/runs", run(&next, "source-hook-two")).await;
    assert_eq!(
        outcome(&server, "source-hook-two").await["execution"]["outcome"]["Completed"]["output"],
        "code hook two"
    );
    post(&server, "/api/v1/runs", submit(&release, "code-old")).await;
    assert_eq!(
        outcome(&server, "code-old").await["execution"]["status"],
        "completed"
    );
    post(&server, "/api/v1/runs", submit(&release, "code-one")).await;
    assert_eq!(requests.lock().unwrap().len(), 2);
    stop.cancel();
    worker.await.unwrap();
}
