use super::*;
#[path = "budgets/composition.rs"]
mod composition;
#[path = "budgets/resumption.rs"]
mod resumption;

async fn prepare_budget(
    host: &KernelHost,
    server: &Serving,
    url: &str,
    directory: &std::path::Path,
) -> Value {
    admit(host, server, url, false).await;
    let source = host
        .control()
        .prepare(serde_json::from_value(base_source(url)).unwrap())
        .unwrap();
    let reference = ModuleRef::new("quota", "1");
    let resolved = source
        .registry()
        .resolve(std::slice::from_ref(&reference))
        .unwrap();
    let ModuleInstance::Governance(profile) = &resolved.instances[&reference] else {
        panic!("quota")
    };
    let scope = BudgetScope {
        root_run_id: "root".into(),
        identity: profile.identity().into(),
    };
    let live = host.store().live_execution("root").await.unwrap().unwrap();
    std::fs::write(directory.join("budget-boundary.json"), serde_json::to_vec(&json!({
        "scope":scope,"budget":host.store().inspect(&scope).await.unwrap().unwrap(),
        "state":content_digest(&live.after.state).unwrap(),
        "submission":content_digest(&host.store().execution_job("root").await.unwrap().unwrap().submission).unwrap()
    })).unwrap()).unwrap();
    let mut target = updated_source(url, false);
    let budget = target["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|module| module["reference"] == r("quota"))
        .unwrap();
    budget["config"]["limits"] = json!({"max_model_calls":8,"max_tool_calls":16});
    budget["config"]["retry"] = json!({"max_attempts":2,"base_delay_ms":0,"max_delay_ms":0});
    let published = post(server, "/api/v1/import", target).await;
    let command = json!({"command_id":"budget","run_id":"root","command":{
        "kind":"update_modules","park_command_id":"park","expected_revision":1,
        "release":published["bundle"]["digest"],"program":"execute","update":{"budget_limits":true}
    }});
    assert_eq!(
        request(
            server,
            reqwest::Method::POST,
            "/api/v1/actions",
            VIEW,
            command.clone()
        )
        .await
        .0,
        403
    );
    assert_eq!(
        post(server, "/api/v1/actions", command.clone()).await["finished"],
        false
    );
    command
}

#[tokio::test]
async fn budget_update_process() {
    let Ok(directory) = std::env::var("NOFY_LIVE_BUDGET_STATE") else {
        return;
    };
    let url = std::env::var("NOFY_LIVE_BUDGET_SERVICE").unwrap();
    let applied = std::env::var("NOFY_LIVE_BUDGET_APPLIED").unwrap() == "yes";
    let host = host(
        std::path::Path::new(&directory),
        Arc::new(AtomicUsize::new(0)),
    )
    .await;
    let server = serve(host.router()).await;
    prepare_budget(&host, &server, &url, std::path::Path::new(&directory)).await;
    if applied {
        let stopped = CancellationToken::new();
        let worker_host = host.clone();
        tokio::spawn(async move { worker_host.run_worker(stopped, 2).await.unwrap() });
        let result = action_result(&server, "budget").await;
        assert!(result["error"].is_null(), "{result}");
        assert_eq!(
            host.store()
                .live_execution("root")
                .await
                .unwrap()
                .unwrap()
                .protocol,
            "nofy.live/v4"
        );
    }
    // Exit without draining, either before application or after its atomic ack.
    std::process::exit(if applied { 92 } else { 93 });
}

#[tokio::test]
async fn published_budget_changes_preserve_usage_and_effects_in_place_and_after_two_hard_exits() {
    for crash in [None, Some(false), Some(true)] {
        let counts = Arc::new([
            AtomicUsize::new(0),
            AtomicUsize::new(0),
            AtomicUsize::new(0),
            AtomicUsize::new(0),
            AtomicUsize::new(0),
        ]);
        let model = counts.clone();
        let old = counts.clone();
        let new = counts.clone();
        let after = counts.clone();
        let new_after = counts.clone();
        let observed = counts.clone();
        let gate = CancellationToken::new();
        let waiting = gate.clone();
        let released = gate.clone();
        let service = serve(Router::new()
            .route("/v1/chat/completions", route_post(move |Json(body):Json<Value>| {
                let calls = model.clone(); let gate = waiting.clone();
                async move {
                    calls[0].fetch_add(1, Ordering::SeqCst);
                    let updated = body["tools"].as_array().unwrap().iter().any(|tool| tool["function"]["name"] == "updated");
                    let done = body["messages"].as_array().unwrap().iter().any(|message| message["role"] == "tool" && message["tool_call_id"] == "updated-call");
                    let frames = if done { nofy_test_support::sse::chat_completion_events_exact("budget applied", "test-model") }
                    else {
                        if !updated { gate.cancelled().await; }
                        nofy_test_support::sse::chat_completions_reasoning_then_tool_call_events("", if updated { "updated-call" } else { "old-call" }, if updated { "updated" } else { "effect" }, "{}", "test-model")
                            .into_iter().map(|frame| axum::response::sse::Event::default().data(frame.data)).collect()
                    };
                    Sse::new(futures::stream::iter(frames.into_iter().map(Ok::<_, Infallible>)))
                }
            }))
            .route("/done", route_post(move || { let c = old.clone(); async move { c[1].fetch_add(1, Ordering::SeqCst); Json(json!({"old":true})) } }))
            .route("/updated", route_post(move || { let c = new.clone(); async move { c[2].fetch_add(1, Ordering::SeqCst); Json(json!({"updated":true})) } }))
            .route("/after", route_post(move || { let c = after.clone(); async move { c[3].fetch_add(1, Ordering::SeqCst); Json(json!({"decision":"continue"})) } }))
            .route("/new-after", route_post(move || { let c = new_after.clone(); async move { c[4].fetch_add(1, Ordering::SeqCst); Json(json!({"decision":"continue"})) } }))
            .route("/count", axum::routing::get(move || { let c = observed.clone(); async move { Json(json!({"models":c[0].load(Ordering::SeqCst),"old_tools":c[1].load(Ordering::SeqCst),"new_tools":c[2].load(Ordering::SeqCst),"old_hooks":c[3].load(Ordering::SeqCst),"new_hooks":c[4].load(Ordering::SeqCst)})) } }))
            .route("/release-model", route_post(move || { let gate = released.clone(); async move { gate.cancel(); Json(json!({"released":true})) } }))
        ).await;
        let directory = tempfile::tempdir().unwrap();
        if let Some(applied) = crash {
            let path = directory.path().to_owned();
            let url = service.url.clone();
            let output = tokio::task::spawn_blocking(move || {
                std::process::Command::new(std::env::current_exe().unwrap())
                    .args([
                        "--exact",
                        "parking::modules::budgets::budget_update_process",
                        "--nocapture",
                    ])
                    .env("NOFY_LIVE_BUDGET_STATE", path)
                    .env("NOFY_LIVE_BUDGET_SERVICE", url)
                    .env(
                        "NOFY_LIVE_BUDGET_APPLIED",
                        if applied { "yes" } else { "no" },
                    )
                    .output()
                    .unwrap()
            })
            .await
            .unwrap();
            assert_eq!(
                output.status.code(),
                Some(if applied { 92 } else { 93 }),
                "{}{}",
                String::from_utf8_lossy(&output.stdout),
                String::from_utf8_lossy(&output.stderr)
            );
        }
        let host = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
        let server = serve(host.router()).await;
        let command = if crash.is_none() {
            Some(prepare_budget(&host, &server, &service.url, directory.path()).await)
        } else {
            None
        };
        let before: Value = serde_json::from_slice(
            &std::fs::read(directory.path().join("budget-boundary.json")).unwrap(),
        )
        .unwrap();
        let scope: BudgetScope = serde_json::from_value(before["scope"].clone()).unwrap();
        let previous: nofy_agent_runtime::governance::BudgetSummary =
            serde_json::from_value(before["budget"].clone()).unwrap();
        assert_eq!(
            counts
                .iter()
                .map(|count| count.load(Ordering::SeqCst))
                .collect::<Vec<_>>(),
            [1, 1, 0, 1, 0]
        );
        let stop = CancellationToken::new();
        let stopped = stop.clone();
        let worker_host = host.clone();
        let worker = tokio::spawn(async move { worker_host.run_worker(stopped, 2).await.unwrap() });
        let result = action_result(&server, "budget").await;
        assert!(result["error"].is_null(), "{result}");
        let live = host.store().live_execution("root").await.unwrap().unwrap();
        assert_eq!(live.protocol, "nofy.live/v4");
        assert_eq!(
            live.modules.unwrap().budgets[0].ledger_identity,
            scope.identity
        );
        assert_eq!(
            content_digest(&live.after.state).unwrap(),
            before["state"].as_str().unwrap()
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
        let current = host.store().inspect(&scope).await.unwrap().unwrap();
        assert_eq!(current.used, previous.used);
        assert_eq!(current.reserved, previous.reserved);
        assert_eq!(current.operation_count, previous.operation_count);
        assert_eq!(current.created_at_ms, previous.created_at_ms);
        assert_eq!(current.deadline_ms, previous.deadline_ms);
        assert_eq!(current.spec.limits.max_model_calls, Some(8));
        let command = command.unwrap_or_else(|| result["action"].clone());
        assert_eq!(post(&server, "/api/v1/actions", command).await, result);
        post(&server, "/api/v1/actions", json!({"command_id":"unpark-budget","run_id":"root","command":{"kind":"unpark","park_command_id":"park"}})).await;
        assert!(action_result(&server, "unpark-budget").await["error"].is_null());
        post(
            &server,
            "/api/v1/actions",
            json!({"command_id":"resume-budget","run_id":"root","command":{"kind":"resume"}}),
        )
        .await;
        let finished =
            action_result_within(&server, "resume-budget", Duration::from_secs(45)).await;
        assert!(finished["error"].is_null(), "{finished}");
        assert_eq!(finished["outcome"]["Completed"]["output"], "budget applied");
        assert_eq!(
            counts
                .iter()
                .map(|count| count.load(Ordering::SeqCst))
                .collect::<Vec<_>>(),
            [3, 1, 1, 1, 1]
        );
        let usage = host.store().inspect(&scope).await.unwrap().unwrap();
        assert_eq!(usage.used.model_calls, 3);
        assert_eq!(usage.used.tool_calls, 4);
        assert_eq!(
            usage.reserved,
            nofy_agent_runtime::governance::BudgetCost::default()
        );
        stop.cancel();
        worker.await.unwrap();
    }
}
