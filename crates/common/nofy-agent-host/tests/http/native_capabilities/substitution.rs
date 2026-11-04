use super::*;

#[tokio::test]
async fn resident_plain_skill_rejects_expansion_and_utf8_byte_overflow_then_runs_new_definition() {
    let dir = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let host = resident(dir.path(), reads.clone()).await;
    let server = serve(host.router()).await;
    let stop = CancellationToken::new();
    let worker_host = host.clone();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 2).await.unwrap() });
    for (id, body, args, expected) in [
        (
            "plain-expand",
            "$ARGUMENTS".repeat(1024),
            "x".repeat(65_536),
            "substitution output exceeds byte limit",
        ),
        (
            "plain-utf8",
            "$ARGUMENTS".to_owned(),
            "界".repeat(22_000),
            "skill arguments exceed 64 KiB",
        ),
        (
            "plain-work",
            (0..800)
                .map(|i| format!("${i}"))
                .collect::<String>()
                .repeat(20),
            "x ".repeat(800),
            "substitution work exceeds byte limit",
        ),
        (
            "plain-good",
            "Review $ARGUMENTS[1]0 ${SESSION_ID}".to_owned(),
            "X $".to_owned(),
            "Review X plain-good",
        ),
    ] {
        let mut source = source();
        config(&mut source, "skills")["skills"][0]["body"] = json!(body);
        source["programs"]["load-skill"]["call"]["arguments"]["args"] = json!(args);
        let release = post(&server, "/api/v1/import", source).await;
        post(
            &server,
            "/api/v1/runs",
            launch(
                release["bundle"]["digest"].as_str().unwrap(),
                id,
                "load-skill",
            ),
        )
        .await;
        let outcome = outcome(&server, id).await;
        assert_eq!(outcome["execution"]["status"], "completed", "{outcome}");
        let output = value(&outcome);
        assert!(output.to_string().contains(expected), "{output}");
        if id != "plain-good" {
            assert!(
                output.get("value").is_none() || output["value"]["skill_message"].is_null(),
                "{output}"
            );
            assert!(!output.to_string().contains("xxxx"));
        }
        assert!(host.store().children(id).await.unwrap().is_empty());
    }
    assert_eq!(reads.load(Ordering::SeqCst), 0);
    assert_eq!(host.loader().prompt_status().started, 0);
    stop.cancel();
    worker.await.unwrap();
}
