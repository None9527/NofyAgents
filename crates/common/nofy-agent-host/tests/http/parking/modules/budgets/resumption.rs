use super::*;

fn document(url: &str, tool_blocked: bool, raised: bool) -> Value {
    let mut doc = base_source(url);
    doc["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|module| module["reference"] == r("quota"))
        .unwrap()["config"]["limits"] = if raised {
        json!({"max_model_calls":3,"max_tool_calls":4})
    } else if tool_blocked {
        json!({"max_model_calls":3,"max_tool_calls":0})
    } else {
        json!({"max_model_calls":1,"max_tool_calls":4})
    };
    doc
}

async fn prepare(
    host: &KernelHost,
    server: &Serving,
    url: &str,
    directory: &std::path::Path,
    tool_blocked: bool,
) {
    let source = document(url, tool_blocked, false);
    let compiled = host
        .control()
        .prepare(serde_json::from_value(source.clone()).unwrap())
        .unwrap();
    let reference = ModuleRef::new("quota", "1");
    let resolved = compiled
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
    let publication = post(server, "/api/v1/import", source).await;
    post(server,"/api/v1/runs",json!({"run_id":"root","thread_id":"thread","system":"model-evidence","release":publication["bundle"]["digest"],"program":"execute","input":{"text":"continue","attachments":[]}})).await;
    let halted = outcome(server, "root").await;
    assert_eq!(halted["execution"]["status"], "budget_exceeded", "{halted}");
    let record = host
        .store()
        .execution_record("root")
        .await
        .unwrap()
        .unwrap();
    let Some(nofy_agent_runtime::RunOutcome::BudgetExceeded { state }) = record.outcome else {
        panic!("missing budget outcome")
    };
    assert_eq!(state.pending_model.is_some(), !tool_blocked);
    assert_eq!(state.in_flight.is_some(), tool_blocked);
    std::fs::write(directory.join("exhausted.json"), serde_json::to_vec(&json!({
        "scope":scope,"state":state,
        "budget":host.store().inspect(&scope).await.unwrap().unwrap(),
        "submission":content_digest(&host.store().execution_job("root").await.unwrap().unwrap().submission).unwrap()
    })).unwrap()).unwrap();
    post(
        server,
        "/api/v1/actions",
        json!({"command_id":"park","run_id":"root","command":{"kind":"park"}}),
    )
    .await;
    let parked = action_result(server, "park").await;
    assert!(parked["error"].is_null(), "{parked}");
    assert_eq!(
        parked["outcome"]["Paused"]["reason"]["parking"]["receipt"]["budget_suspended"],
        true
    );
}

async fn propose(server: &Serving, url: &str, tool_blocked: bool) -> Value {
    let published = post(server, "/api/v1/import", document(url, tool_blocked, true)).await;
    let command = json!({"command_id":"raise","run_id":"root","command":{"kind":"update_modules","park_command_id":"park","expected_revision":0,"release":published["bundle"]["digest"],"program":"execute","update":{"budget_limits":true}}});
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
    post(server, "/api/v1/actions", command.clone()).await;
    command
}

#[tokio::test]
async fn exhausted_budget_process() {
    let Ok(directory) = std::env::var("NOFY_EXHAUSTED_STATE") else {
        return;
    };
    let url = std::env::var("NOFY_EXHAUSTED_SERVICE").unwrap();
    let tool_blocked = std::env::var("NOFY_EXHAUSTED_TOOL").unwrap() == "yes";
    let applied = std::env::var("NOFY_EXHAUSTED_APPLIED").unwrap() == "yes";
    let host = host(
        std::path::Path::new(&directory),
        Arc::new(AtomicUsize::new(0)),
    )
    .await;
    let server = serve(host.router()).await;
    let stop = CancellationToken::new();
    let stopped = stop.clone();
    let worker_host = host.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(stopped, 2).await.unwrap() });
    prepare(
        &host,
        &server,
        &url,
        std::path::Path::new(&directory),
        tool_blocked,
    )
    .await;
    stop.cancel();
    worker.await.unwrap();
    drop(server);
    drop(host);
    let host = crate::host(
        std::path::Path::new(&directory),
        Arc::new(AtomicUsize::new(0)),
    )
    .await;
    let server = serve(host.router()).await;
    propose(&server, &url, tool_blocked).await;
    if applied {
        let worker_host = host.clone();
        tokio::spawn(async move {
            worker_host
                .run_worker(CancellationToken::new(), 2)
                .await
                .unwrap()
        });
        assert!(action_result(&server, "raise").await["error"].is_null());
    } else {
        assert!(host.store().live_execution("root").await.unwrap().is_none());
        assert!(
            !host
                .store()
                .managed_action("raise")
                .await
                .unwrap()
                .unwrap()
                .finished
        );
    }
    std::process::exit(if applied { 90 } else { 91 });
}

#[tokio::test]
async fn native_worker_resumes_exhausted_pending_work_in_place_and_across_hard_exits() {
    for (tool_blocked, crash) in [
        (false, None),
        (true, None),
        (false, Some(false)),
        (true, Some(true)),
    ] {
        let counts = Arc::new([
            AtomicUsize::new(0),
            AtomicUsize::new(0),
            AtomicUsize::new(0),
        ]);
        let models = counts.clone();
        let tools = counts.clone();
        let hooks = counts.clone();
        let service = serve(Router::new()
            .route("/v1/chat/completions", route_post(move |Json(body):Json<Value>| {
                let models=models.clone(); async move {
                    models[0].fetch_add(1,Ordering::SeqCst);
                    let done=body["messages"].as_array().unwrap().iter().any(|message|message["role"]=="tool" && message["tool_call_id"]=="original-call");
                    let frames = if done { nofy_test_support::sse::chat_completion_events_exact("continued original work","test-model") }
                    else { nofy_test_support::sse::chat_completions_reasoning_then_tool_call_events("","original-call","effect","{}","test-model")
                        .into_iter().map(|frame|axum::response::sse::Event::default().data(frame.data)).collect() };
                    Sse::new(futures::stream::iter(frames.into_iter().map(Ok::<_,Infallible>)))
                }
            }))
            .route("/done", route_post(move || { let tools=tools.clone(); async move {tools[1].fetch_add(1,Ordering::SeqCst);Json(json!({"once":true}))} }))
            .route("/after", route_post(move || { let hooks=hooks.clone(); async move {hooks[2].fetch_add(1,Ordering::SeqCst);Json(json!({"decision":"continue"}))} }))
        ).await;
        let directory = tempfile::tempdir().unwrap();
        if let Some(applied) = crash {
            let path = directory.path().to_owned();
            let url = service.url.clone();
            let output = tokio::task::spawn_blocking(move || {
                std::process::Command::new(std::env::current_exe().unwrap())
                    .args([
                        "--exact",
                        "parking::modules::budgets::resumption::exhausted_budget_process",
                        "--nocapture",
                    ])
                    .env("NOFY_EXHAUSTED_STATE", path)
                    .env("NOFY_EXHAUSTED_SERVICE", url)
                    .env(
                        "NOFY_EXHAUSTED_TOOL",
                        if tool_blocked { "yes" } else { "no" },
                    )
                    .env("NOFY_EXHAUSTED_APPLIED", if applied { "yes" } else { "no" })
                    .output()
                    .unwrap()
            })
            .await
            .unwrap();
            assert_eq!(
                output.status.code(),
                Some(if applied { 90 } else { 91 }),
                "{}{}",
                String::from_utf8_lossy(&output.stdout),
                String::from_utf8_lossy(&output.stderr)
            );
        }
        let host = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
        let server = serve(host.router()).await;
        let stop = CancellationToken::new();
        let stopped = stop.clone();
        let worker_host = host.clone();
        let worker = tokio::spawn(async move { worker_host.run_worker(stopped, 2).await.unwrap() });
        if crash.is_none() {
            prepare(&host, &server, &service.url, directory.path(), tool_blocked).await;
            propose(&server, &service.url, tool_blocked).await;
        }
        let before: Value = serde_json::from_slice(
            &std::fs::read(directory.path().join("exhausted.json")).unwrap(),
        )
        .unwrap();
        let scope: BudgetScope = serde_json::from_value(before["scope"].clone()).unwrap();
        let old: nofy_agent_runtime::governance::BudgetSummary =
            serde_json::from_value(before["budget"].clone()).unwrap();
        let result = action_result_within(&server, "raise", Duration::from_secs(45)).await;
        assert!(result["error"].is_null(), "{result}");
        let live = host.store().live_execution("root").await.unwrap().unwrap();
        assert_eq!(
            serde_json::to_value(&live.after.state).unwrap(),
            before["state"]
        );
        assert_eq!(
            live.modules.unwrap().budgets[0].ledger_identity,
            scope.identity
        );
        let amended = host.store().inspect(&scope).await.unwrap().unwrap();
        assert_eq!(amended.used, old.used);
        assert_eq!(amended.reserved, old.reserved);
        assert_eq!(amended.created_at_ms, old.created_at_ms);
        assert_eq!(
            post(&server, "/api/v1/actions", result["action"].clone()).await,
            result
        );
        post(&server,"/api/v1/actions",json!({"command_id":"unpark","run_id":"root","command":{"kind":"unpark","park_command_id":"park"}})).await;
        assert!(action_result(&server, "unpark").await["error"].is_null());
        post(
            &server,
            "/api/v1/actions",
            json!({"command_id":"resume","run_id":"root","command":{"kind":"resume"}}),
        )
        .await;
        let finished = action_result_within(&server, "resume", Duration::from_secs(45)).await;
        assert!(finished["error"].is_null(), "{finished}");
        assert_eq!(
            finished["outcome"]["Completed"]["output"],
            "continued original work"
        );
        assert_eq!(
            counts
                .iter()
                .map(|c| c.load(Ordering::SeqCst))
                .collect::<Vec<_>>(),
            [2, 1, 1]
        );
        let budget = host.store().inspect(&scope).await.unwrap().unwrap();
        assert_eq!(budget.used.model_calls, 2);
        assert_eq!(budget.used.tool_calls, 2);
        assert_eq!(
            budget.reserved,
            nofy_agent_runtime::governance::BudgetCost::default()
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
            before["submission"]
        );
        assert_eq!(
            post(&server, "/api/v1/actions", finished["action"].clone()).await,
            finished
        );
        assert_eq!(
            counts
                .iter()
                .map(|c| c.load(Ordering::SeqCst))
                .collect::<Vec<_>>(),
            [2, 1, 1]
        );
        stop.cancel();
        worker.await.unwrap();
        eprintln!("budget resumption verified: tool_blocked={tool_blocked}, crash={crash:?}");
    }
}
