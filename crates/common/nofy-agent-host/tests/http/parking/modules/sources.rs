use super::*;

fn document(url: &str, revision: Option<&str>) -> Value {
    let mut doc = base_source(url);
    doc["modules"].as_array_mut().unwrap().push(json!({
        "reference":r("project-rules"),"factory":"context.rules",
        "config":{"files":[{"file_name":"AGENTS.md","file_path":"/project/AGENTS.md","content":revision.unwrap_or("retired")} ]}
    }));
    doc["programs"]["execute"]["definition"]["context_sources"] = if revision.is_some() {
        json!([r("project-rules")])
    } else {
        json!([])
    };
    doc
}
fn command(id: &str, release: &Value, revision: u64) -> Value {
    json!({"command_id":id,"run_id":"root","command":{
        "kind":"update_modules","park_command_id":"park","expected_revision":revision,
        "release":release["bundle"]["digest"],"program":"execute","update":{"context_sources":true}
    }})
}
async fn prepare(
    host: &KernelHost,
    server: &Serving,
    url: &str,
    remove: bool,
    directory: &std::path::Path,
) -> Value {
    let doc = document(url, Some("original project instructions"));
    let system = host
        .control()
        .prepare(serde_json::from_value(doc.clone()).unwrap())
        .unwrap();
    let registry = system.registry().clone();
    let release = post(server, "/api/v1/import", doc).await;
    post(server, "/api/v1/runs", json!({"run_id":"root","thread_id":"thread","system":"model-evidence","release":release["bundle"]["digest"],"program":"execute","input":{"text":"continue","attachments":[]}})).await;
    let supervisor = Arc::new(nofy_agent_runtime::supervisor::RunSupervisor::new(
        host.store().clone(),
    ));
    let worker = {
        let supervisor = supervisor.clone();
        let registry = registry.clone();
        tokio::spawn(async move {
            supervisor
                .execute_submitted(&registry, "root")
                .await
                .unwrap()
        })
    };
    await_count(url, "models", 1).await;
    post(
        server,
        "/api/v1/actions",
        json!({"command_id":"park","run_id":"root","command":{"kind":"park"}}),
    )
    .await;
    release_model(url).await;
    assert!(
        matches!(worker.await.unwrap(), Some(nofy_agent_runtime::RunOutcome::Paused {ref reason,..}) if reason["kind"] == "parked")
    );
    let name = system.program("execute").unwrap().snapshot.name();
    let checkpoint = host
        .store()
        .load(&format!("{}:{}thread", name.len(), name))
        .await
        .unwrap()
        .unwrap();
    let reference = ModuleRef::new("quota", "1");
    let resolved = registry.resolve(&[reference.clone()]).unwrap();
    let ModuleInstance::Governance(profile) = &resolved.instances[&reference] else {
        panic!("quota")
    };
    let scope = BudgetScope {
        root_run_id: "root".into(),
        identity: profile.identity().into(),
    };
    std::fs::write(directory.join("sources-boundary.json"), serde_json::to_vec(&json!({
        "checkpoint":checkpoint,
        "submission":content_digest(&host.store().execution_job("root").await.unwrap().unwrap().submission).unwrap(),
        "scope":scope,"budget":content_digest(&host.store().inspect(&scope).await.unwrap()).unwrap()
    })).unwrap()).unwrap();
    let next = post(
        server,
        "/api/v1/import",
        document(
            url,
            if remove {
                None
            } else {
                Some("replacement project instructions")
            },
        ),
    )
    .await;
    let action = command("sources", &next, 0);
    assert_eq!(
        request(
            server,
            reqwest::Method::POST,
            "/api/v1/actions",
            VIEW,
            action.clone()
        )
        .await
        .0,
        403
    );
    let mut unselected = action.clone();
    unselected["command_id"] = json!("unselected-source");
    unselected["command"]["update"] = json!({});
    assert!(
        request(
            server,
            reqwest::Method::POST,
            "/api/v1/actions",
            ADMIN,
            unselected
        )
        .await
        .0 >= 400
    );
    assert_eq!(
        post(server, "/api/v1/actions", action.clone()).await["finished"],
        false
    );
    action
}
async fn release_model(url: &str) {
    super::release(url, "release-model").await;
}

#[tokio::test]
async fn source_update_process() {
    let Ok(directory) = std::env::var("NOFY_SOURCES_STATE") else {
        return;
    };
    let url = std::env::var("NOFY_SOURCES_SERVICE").unwrap();
    let applied = std::env::var("NOFY_SOURCES_APPLIED").unwrap() == "yes";
    let host = host(
        std::path::Path::new(&directory),
        Arc::new(AtomicUsize::new(0)),
    )
    .await;
    let server = serve(host.router()).await;
    prepare(
        &host,
        &server,
        &url,
        !applied,
        std::path::Path::new(&directory),
    )
    .await;
    if applied {
        let system = host
            .control()
            .prepare(
                serde_json::from_value(document(&url, Some("replacement project instructions")))
                    .unwrap(),
            )
            .unwrap();
        let supervisor = nofy_agent_runtime::supervisor::RunSupervisor::new(host.store().clone());
        let record = supervisor
            .execute_managed_action(system.registry(), "sources")
            .await
            .unwrap();
        assert!(record.finished && record.error.is_none(), "{record:?}");
    }
    std::process::exit(if applied { 72 } else { 73 });
}

#[tokio::test]
async fn declared_rules_update_remove_and_rollback_use_the_original_worker_after_acceptance_or_commit_crash()
 {
    for crash in [None, Some(false), Some(true)] {
        let models = Arc::new(AtomicUsize::new(0));
        let effects = Arc::new(AtomicUsize::new(0));
        let hooks = Arc::new(AtomicUsize::new(0));
        let seen = Arc::new(Mutex::new(Vec::<Value>::new()));
        let gate = CancellationToken::new();
        let (count, requests, wait, old, after, released) = (
            models.clone(),
            seen.clone(),
            gate.clone(),
            effects.clone(),
            hooks.clone(),
            gate.clone(),
        );
        let counters = (models.clone(), effects.clone(), hooks.clone());
        let service = serve(Router::new()
            .route("/v1/chat/completions", route_post(move |Json(body):Json<Value>| {
                let (count, seen, gate) = (count.clone(), requests.clone(), wait.clone());
                async move {
                    count.fetch_add(1, Ordering::SeqCst); seen.lock().unwrap().push(body.clone());
                    let done = body["messages"].as_array().unwrap().iter().any(|message| message["role"] == "tool");
                    let frames = if done {
                        nofy_test_support::sse::chat_completion_events_exact("source updated", "test-model")
                    } else {
                        gate.cancelled().await;
                        nofy_test_support::sse::chat_completions_reasoning_then_tool_call_events("", "old-call", "effect", "{}", "test-model").into_iter().map(|frame| axum::response::sse::Event::default().data(frame.data)).collect()
                    };
                    Sse::new(futures::stream::iter(frames.into_iter().map(Ok::<_, Infallible>)))
                }
            }))
            .route("/done", route_post(move || {let old = old.clone(); async move {old.fetch_add(1, Ordering::SeqCst); Json(json!({"old":true}))}}))
            .route("/after", route_post(move || {let after = after.clone(); async move {after.fetch_add(1, Ordering::SeqCst); Json(json!({"decision":"continue"}))}}))
            .route("/count", axum::routing::get(move || {let c = counters.clone(); async move {Json(json!({"models":c.0.load(Ordering::SeqCst),"effects":c.1.load(Ordering::SeqCst),"hooks":c.2.load(Ordering::SeqCst)}))}}))
            .route("/release-model", route_post(move || {let gate = released.clone(); async move {gate.cancel(); Json(json!({"released":true}))}}))
        ).await;
        let directory = tempfile::tempdir().unwrap();
        if let Some(applied) = crash {
            let path = directory.path().to_owned();
            let url = service.url.clone();
            let result = tokio::task::spawn_blocking(move || {
                std::process::Command::new(std::env::current_exe().unwrap())
                    .args([
                        "--exact",
                        "parking::modules::sources::source_update_process",
                        "--nocapture",
                    ])
                    .env("NOFY_SOURCES_STATE", path)
                    .env("NOFY_SOURCES_SERVICE", url)
                    .env("NOFY_SOURCES_APPLIED", if applied { "yes" } else { "no" })
                    .output()
                    .unwrap()
            })
            .await
            .unwrap();
            assert_eq!(
                result.status.code(),
                Some(if applied { 72 } else { 73 }),
                "{}{}",
                String::from_utf8_lossy(&result.stdout),
                String::from_utf8_lossy(&result.stderr)
            );
        }
        let host = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
        let server = serve(host.router()).await;
        let action = if crash.is_none() {
            Some(prepare(&host, &server, &service.url, false, directory.path()).await)
        } else {
            None
        };
        let before: Value = serde_json::from_slice(
            &std::fs::read(directory.path().join("sources-boundary.json")).unwrap(),
        )
        .unwrap();
        let scope: BudgetScope = serde_json::from_value(before["scope"].clone()).unwrap();
        let stop = CancellationToken::new();
        let stopped = stop.clone();
        let running = host.clone();
        let worker = tokio::spawn(async move { running.run_worker(stopped, 2).await.unwrap() });
        let applied = action_result(&server, "sources").await;
        assert!(applied["error"].is_null(), "{applied}");
        let live = host.store().live_execution("root").await.unwrap().unwrap();
        assert_eq!(live.protocol, "nofy.live/v5");
        assert!(live.modules.as_ref().unwrap().context_sources);
        assert_eq!(
            serde_json::to_value(&live.before).unwrap(),
            before["checkpoint"]
        );
        assert_eq!(
            serde_json::to_value(&live.after.state).unwrap(),
            before["checkpoint"]["state"]
        );
        assert_eq!(
            content_digest(&host.store().inspect(&scope).await.unwrap()).unwrap(),
            before["budget"].as_str().unwrap()
        );
        assert_eq!(
            content_digest(
                &host
                    .store()
                    .execution_job("root")
                    .await
                    .unwrap()
                    .unwrap()
                    .submission
            )
            .unwrap(),
            before["submission"].as_str().unwrap()
        );
        assert_eq!(
            post(
                &server,
                "/api/v1/actions",
                action.unwrap_or_else(|| applied["action"].clone())
            )
            .await,
            applied
        );
        if crash == Some(true) {
            let publication = post(
                &server,
                "/api/v1/import",
                document(&service.url, Some("original project instructions")),
            )
            .await;
            post(
                &server,
                "/api/v1/actions",
                command("rollback-sources", &publication, 1),
            )
            .await;
            assert!(action_result(&server, "rollback-sources").await["error"].is_null());
            assert_eq!(
                host.store()
                    .live_execution("root")
                    .await
                    .unwrap()
                    .unwrap()
                    .revision,
                2
            );
        }
        post(&server, "/api/v1/actions", json!({"command_id":"unpark-sources","run_id":"root","command":{"kind":"unpark","park_command_id":"park"}})).await;
        assert!(action_result(&server, "unpark-sources").await["error"].is_null());
        post(
            &server,
            "/api/v1/actions",
            json!({"command_id":"resume-sources","run_id":"root","command":{"kind":"resume"}}),
        )
        .await;
        let result = action_result_within(&server, "resume-sources", Duration::from_secs(45)).await;
        assert!(result["error"].is_null(), "{result}");
        assert_eq!(result["outcome"]["Completed"]["output"], "source updated");
        assert_eq!(models.load(Ordering::SeqCst), 2);
        assert_eq!(effects.load(Ordering::SeqCst), 1);
        assert_eq!(hooks.load(Ordering::SeqCst), 1);
        let requests = seen.lock().unwrap();
        let first = requests[0]["messages"].to_string();
        let last = requests[1]["messages"].to_string();
        assert!(first.contains("original project instructions"));
        match crash {
            None => {
                assert!(last.contains("replacement project instructions"));
                assert!(!last.contains("original project instructions"));
            }
            Some(false) => {
                assert!(!last.contains("project instructions"));
            }
            Some(true) => {
                assert!(last.contains("original project instructions"));
                assert!(!last.contains("replacement project instructions"));
            }
        }
        drop(requests);
        stop.cancel();
        worker.await.unwrap();
    }
}
