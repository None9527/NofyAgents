use super::*;

#[tokio::test]
async fn memory_capture_crash_process() {
    let Ok(directory) = std::env::var("NOFY_CAPTURE_STATE") else {
        return;
    };
    let url = std::env::var("NOFY_CAPTURE_SERVICE").unwrap();
    let unmetered = std::env::var("NOFY_CAPTURE_UNMETERED").unwrap() == "yes";
    let host = host(
        std::path::Path::new(&directory),
        Arc::new(AtomicUsize::new(0)),
    )
    .await;
    let doc = document(&url, "one", unmetered);
    let registry = host
        .control()
        .prepare(serde_json::from_value(doc.clone()).unwrap())
        .unwrap()
        .registry()
        .clone();
    let server = serve(host.router()).await;
    let publication = post(&server, "/api/v1/import", doc).await;
    post(
        &server,
        "/api/v1/runs",
        run(&publication, "root", "execute"),
    )
    .await;
    let supervisor = nofy_agent_runtime::supervisor::RunSupervisor::new(host.store().clone())
        .with_lease_ttl(Duration::from_secs(2))
        .unwrap();
    tokio::spawn(async move {
        supervisor
            .execute_submitted(&registry, "root")
            .await
            .unwrap()
    });
    await_count(&url, "captures", 1).await;
    std::process::exit(69);
}

#[tokio::test]
async fn capture_model_unknown_effect_reconciles_in_original_scope_after_real_hard_exit() {
    for unmetered in [false, true] {
        let service = Service::new(true, false);
        let serving = fixture(&service).await;
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().to_owned();
        let url = serving.url.clone();
        let output = tokio::task::spawn_blocking(move || {
            std::process::Command::new(std::env::current_exe().unwrap())
                .args([
                    "--exact",
                    "parking::modules::memory::recovery::memory_capture_crash_process",
                    "--nocapture",
                ])
                .env("NOFY_CAPTURE_STATE", path)
                .env("NOFY_CAPTURE_SERVICE", url)
                .env(
                    "NOFY_CAPTURE_UNMETERED",
                    if unmetered { "yes" } else { "no" },
                )
                .output()
                .unwrap()
        })
        .await
        .unwrap();
        assert_eq!(
            output.status.code(),
            Some(69),
            "{}{}",
            String::from_utf8_lossy(&output.stdout),
            String::from_utf8_lossy(&output.stderr)
        );
        let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
        let server = serve(host.router()).await;
        let stop = CancellationToken::new();
        let signal = stop.clone();
        let running = host.clone();
        let worker = tokio::spawn(async move { running.run_worker(signal, 2).await.unwrap() });
        let paused = outcome(&server, "root").await;
        assert_eq!(paused["execution"]["status"], "paused", "{paused}");
        assert!(files(dir.path()).is_empty());
        let (status, page) = request(
            &server,
            reqwest::Method::GET,
            "/api/v1/runs/root/recovery/models?target_run_id=root",
            VIEW,
            Value::Null,
        )
        .await;
        assert_eq!(status, 200, "{page}");
        assert_eq!(page.as_array().unwrap().len(), 1, "{page}");
        assert!(
            page[0]["ticket"]["request"]["operation_id"]
                .as_str()
                .unwrap()
                .starts_with("memory-capture:"),
            "{page}"
        );
        assert!(
            page[0]["ticket"]["request"]["operation_scope"].is_string(),
            "{page}"
        );
        let response = ModelResponse {
            output: drafts("one"),
            input_tokens: 3,
            output_tokens: 2,
            ..Default::default()
        };
        let command = json!({"command_id":"capture-proof","run_id":"root","command":{"kind":"reconcile_model","receipt":{"ticket":page[0]["ticket"],"result":{"kind":"completed","response":response}}}});
        assert_eq!(
            request(
                &server,
                reqwest::Method::POST,
                "/api/v1/actions",
                VIEW,
                command.clone()
            )
            .await
            .0,
            403
        );
        post(&server, "/api/v1/actions", command.clone()).await;
        let finished =
            action_result_within(&server, "capture-proof", Duration::from_secs(45)).await;
        assert!(finished["error"].is_null(), "{finished}");
        assert_eq!(
            finished["outcome"]["Completed"]["output"],
            "memory complete"
        );
        assert_eq!(post(&server, "/api/v1/actions", command).await, finished);
        assert_eq!(service.counts[0].load(Ordering::SeqCst), 2);
        assert_eq!(service.counts[1].load(Ordering::SeqCst), 1);
        assert_eq!(service.counts[2].load(Ordering::SeqCst), 1);
        assert_eq!(service.counts[3].load(Ordering::SeqCst), 1);
        let publication = post(
            &server,
            "/api/v1/import",
            document(&serving.url, "one", unmetered),
        )
        .await;
        let listed = memory(&server, &publication, "recovered-notes", "list-memory").await;
        assert_eq!(listed["items"].as_array().unwrap().len(), 1, "{listed}");
        assert!(listed.to_string().contains("one release"), "{listed}");
        let before = files(dir.path());
        assert_eq!(before.len(), 2);
        stop.cancel();
        worker.await.unwrap();
        drop(server);
        drop(host);
        let reopened = host_reopen(dir.path()).await;
        let server = serve(reopened.router()).await;
        let stop = CancellationToken::new();
        let signal = stop.clone();
        let running = reopened.clone();
        let worker = tokio::spawn(async move { running.run_worker(signal, 2).await.unwrap() });
        let after = memory(&server, &publication, "reopened-notes", "list-memory").await;
        assert_eq!(after, listed);
        assert_eq!(files(dir.path()), before);
        assert_eq!(service.counts[3].load(Ordering::SeqCst), 1);
        stop.cancel();
        worker.await.unwrap();
        service.capture.cancel();
    }
}
async fn host_reopen(path: &std::path::Path) -> KernelHost {
    host(path, Arc::new(AtomicUsize::new(0))).await
}

#[tokio::test]
async fn strict_drafts_and_host_resolved_areas_reject_forged_writes_before_canonical_effects() {
    for output in [
        r#"[{"statement":"A private preference.","kind":"preference","scope":"project","confidence":"certain"}]"#,
        r#"[{"statement":"A project fact.","kind":"project_fact","scope":"project","confidence":"certain","forged":true}]"#,
    ] {
        let mut service = Service::new(true, true);
        service.output = Some(output.into());
        let serving = fixture(&service).await;
        let dir = tempfile::tempdir().unwrap();
        let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
        let server = serve(host.router()).await;
        let publication = post(
            &server,
            "/api/v1/import",
            document(&serving.url, "one", false),
        )
        .await;
        let stop = CancellationToken::new();
        let signal = stop.clone();
        let running = host.clone();
        let worker = tokio::spawn(async move { running.run_worker(signal, 2).await.unwrap() });
        post(
            &server,
            "/api/v1/runs",
            run(&publication, "root", "execute"),
        )
        .await;
        let failed = outcome(&server, "root").await;
        assert_eq!(failed["execution"]["status"], "failed", "{failed}");
        assert!(files(dir.path()).is_empty());
        assert_eq!(service.counts[3].load(Ordering::SeqCst), 1);
        let checkpoint = host
            .store()
            .load("14:evidence-agentthread")
            .await
            .unwrap()
            .unwrap();
        assert_eq!(checkpoint.state.output, "memory complete");
        assert!(checkpoint.state.complete);
        stop.cancel();
        worker.await.unwrap();
    }
}

#[tokio::test]
async fn capture_declaration_is_pure_and_requires_explicit_resource_grants() {
    let dir = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let host = host(dir.path(), reads.clone()).await;
    let server = serve(host.router()).await;
    let doc = document("http://127.0.0.1:9", "one", false);
    post(&server, "/api/v1/validate", doc.clone()).await;
    let example: Value = serde_json::from_str(include_str!(
        "../../../../../examples/memory-learning-system.json"
    ))
    .unwrap();
    post(&server, "/api/v1/validate", example).await;
    for (id, path, value) in [
        ("memory-store", vec!["factory"], json!("resource.memory")),
        (
            "memory-store",
            vec!["config", "grants", "capture"],
            json!(false),
        ),
        (
            "capture-handler",
            vec!["config", "write"],
            json!(["personal"]),
        ),
        ("capture-handler", vec!["config", "max_items"], json!(21)),
        ("capture-handler", vec!["config", "unexpected"], json!(true)),
    ] {
        let mut bad = doc.clone();
        let mut entry = bad["modules"]
            .as_array_mut()
            .unwrap()
            .iter_mut()
            .find(|m| m["reference"] == r(id))
            .unwrap();
        for key in &path[..path.len() - 1] {
            entry = &mut entry[*key];
        }
        entry[path[path.len() - 1]] = value;
        let (status, error) = request(
            &server,
            reqwest::Method::POST,
            "/api/v1/validate",
            VIEW,
            bad,
        )
        .await;
        assert_eq!(status, 422, "{error}");
    }
    assert_eq!(reads.load(Ordering::SeqCst), 0);
    assert!(!dir.path().join("memory").exists());
}
