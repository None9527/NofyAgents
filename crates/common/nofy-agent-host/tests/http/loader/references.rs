use super::*;
use nofy_agent_runtime::artifact::ArtifactBundle;
async fn inspect(server: &Serving, objects: Value) -> Value {
    let (status, value) = request(
        server,
        reqwest::Method::POST,
        "/api/v1/loader/references",
        VIEW,
        json!({"objects":objects,"sample_limit":2}),
    )
    .await;
    assert_eq!(status, 200, "{value}");
    assert_eq!(value["deletion_authorized"], false);
    value
}
#[tokio::test]
async fn reference_views_cover_drafts_unapplied_publications_jobs_execution_and_legacy_runtime_without_leaking_content()
 {
    let dir = tempfile::tempdir().unwrap();
    let (kernel, server, installed) = setup(dir.path()).await;
    let bundle = package(2);
    let digest = serde_json::from_value::<ArtifactBundle>(bundle.clone())
        .unwrap()
        .digest()
        .unwrap();
    let source = document(&installed, json!({"bundle":bundle}));
    let objects = json!([{"kind":"artifact","digest":digest},{"kind":"runtime","id":installed["id"],"revision":installed["revision"]}]);
    let absent = inspect(&server, objects.clone()).await;
    assert_eq!(absent["references"][0]["state"], "not_observed");
    let publication = post(&server, "/api/v1/import", source.clone()).await;
    let release = publication["bundle"]["digest"].as_str().unwrap();
    let first = inspect(&server, objects.clone()).await;
    assert_eq!(first["references"][0]["counts"]["publication"], 1);
    assert_eq!(first["references"][1]["counts"]["publication"], 1);
    // No apply has occurred; every publication is retained, not only active.
    assert!(
        kernel
            .control()
            .inspect()
            .await
            .unwrap()
            .unwrap()
            .data
            .active
            .is_empty()
    );
    kernel
        .control()
        .save_draft("draft", None, serde_json::from_value(source).unwrap())
        .await
        .unwrap();
    let drafted = inspect(&server, objects.clone()).await;
    assert_eq!(drafted["references"][0]["counts"]["draft"], 1);
    post(&server, "/api/v1/runs", run(release, "reference-run")).await;
    let queued = inspect(&server, objects.clone()).await;
    assert_eq!(queued["references"][0]["counts"]["job"], 1);
    assert_eq!(queued["references"][0]["more_samples"], true);
    assert_eq!(
        queued["references"][0]["samples"].as_array().unwrap().len(),
        2
    );
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let worker_kernel = kernel.clone();
    let worker = tokio::spawn(async move { worker_kernel.run_worker(signal, 1).await.unwrap() });
    let outcome_before = outcome(&server, "reference-run").await;
    assert_eq!(output(&outcome_before)["result"], 14);
    let finished = inspect(&server, objects.clone()).await;
    assert_eq!(finished["references"][0]["counts"]["execution"], 1);
    assert_eq!(finished["references"][0]["counts"]["checkpoint"], 1);
    assert_eq!(finished["runtime"]["opaque_compositions"], 0);
    assert!(!finished.to_string().contains("main.py"));
    assert!(!finished.to_string().contains("import json"));
    let again = inspect(&server, objects).await;
    assert_eq!(
        again["runtime"]["fingerprint"],
        finished["runtime"]["fingerprint"]
    );
    assert_eq!(
        outcome(&server, "reference-run").await["execution"]["outcome"],
        outcome_before["execution"]["outcome"]
    );
    assert!(dir.path().join("loader/runtimes/bin").is_dir());
    stop.cancel();
    worker.await.unwrap();
}
#[tokio::test]
async fn invalid_draft_and_opaque_checkpoint_are_unknown_not_absent_and_invalid_queries_are_rejected()
 {
    let dir = tempfile::tempdir().unwrap();
    use nofy_agent_runtime::{Checkpoint, Checkpointer, RunState, durable::SqliteStore};
    // A legacy checkpoint predates adoption of managed commit admission.
    SqliteStore::open(&dir.path().join("runtime.sqlite"))
        .unwrap()
        .save(
            "private-legacy-checkpoint",
            None,
            Checkpoint {
                version: 1,
                revision: 1,
                composition: "opaque-native-composition".into(),
                state: RunState {
                    data: json!({"private_payload":"not-reference-metadata"}),
                    ..RunState::default()
                },
            },
        )
        .await
        .unwrap();
    let kernel = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(kernel.router()).await;
    let key = json!({"kind":"image","digest":"0".repeat(64)});
    for objects in [
        json!([]),
        json!([key.clone(), key.clone()]),
        json!([{"kind":"image","digest":"../outside"}]),
        json!(
            (0..17)
                .map(|i| json!({"kind":"runtime","id":format!("r{i}"),"revision":"0".repeat(64)}))
                .collect::<Vec<_>>()
        ),
    ] {
        assert_eq!(
            request(
                &server,
                reqwest::Method::POST,
                "/api/v1/loader/references",
                VIEW,
                json!({"objects":objects})
            )
            .await
            .0,
            422
        );
    }
    let mut draft = document(&Value::Null, json!({"bundle":package(2)}));
    draft["modules"][1]["factory"] = json!("resource.process_locked");
    draft["modules"][1]["config"] = json!({});
    // The control-plane draft API deliberately permits incomplete drafts.
    kernel
        .control()
        .save_draft("incomplete", None, serde_json::from_value(draft).unwrap())
        .await
        .unwrap();
    let response = inspect(&server, json!([key])).await;
    assert_eq!(response["references"][0]["state"], "unknown");
    assert_eq!(response["opaque_declarations"], 1);
    assert!(
        response["references"][0]["samples"]
            .as_array()
            .unwrap()
            .is_empty()
    );
    let checkpoint = inspect(&server, json!([key])).await;
    assert_eq!(checkpoint["references"][0]["state"], "unknown");
    assert_eq!(checkpoint["runtime"]["opaque_compositions"], 1);
    let origin = &checkpoint["runtime"]["opaque_samples"][0];
    assert_eq!(origin["kind"], "checkpoint");
    assert!(origin["key"].as_str().unwrap().starts_with("sha256:"));
    assert!(!checkpoint.to_string().contains("private-legacy"));
    assert!(!checkpoint.to_string().contains("not-reference-metadata"));
    assert!(!dir.path().join("credentials.json").exists());
}
