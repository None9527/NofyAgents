use super::*;

async fn prepare_policy(
    host: &KernelHost,
    server: &Serving,
    url: &str,
    allow: bool,
    directory: &std::path::Path,
) -> Value {
    admit(host, server, url, false).await;
    let mut document = updated_source(url, false);
    document["modules"].as_array_mut().unwrap().push(json!({
        "reference":r("editable-policy"),"factory":"policy.tool_scope",
        "config":{"allowed":if allow {json!(["updated"])} else {json!([])}}
    }));
    document["programs"]["execute"]["definition"]["policies"] = json!([r("editable-policy")]);
    let system = host
        .control()
        .prepare(serde_json::from_value(document.clone()).unwrap())
        .unwrap();
    let reference = ModuleRef::new("quota", "1");
    let resolved = system
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
    let before = host.store().live_execution("root").await.unwrap().unwrap();
    std::fs::write(directory.join("policy-boundary.json"), serde_json::to_vec(&json!({
        "state":content_digest(&before.after.state).unwrap(),
        "submission":content_digest(&host.store().execution_job("root").await.unwrap().unwrap().submission).unwrap(),
        "scope":scope,
        "budget":content_digest(&host.store().inspect(&scope).await.unwrap()).unwrap()
    })).unwrap()).unwrap();
    let publication = post(server, "/api/v1/import", document).await;
    let command = json!({"command_id":"policies","run_id":"root","command":{
        "kind":"update_modules","park_command_id":"park","expected_revision":1,
        "release":publication["bundle"]["digest"],"program":"execute","update":{"policy_set":true}
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
async fn policy_update_process() {
    let Ok(directory) = std::env::var("NOFY_POLICY_STATE") else {
        return;
    };
    let url = std::env::var("NOFY_POLICY_SERVICE").unwrap();
    let allow = std::env::var("NOFY_POLICY_ALLOW").unwrap() == "yes";
    let applied = std::env::var("NOFY_POLICY_APPLIED").unwrap() == "yes";
    let host = host(
        std::path::Path::new(&directory),
        Arc::new(AtomicUsize::new(0)),
    )
    .await;
    let server = serve(host.router()).await;
    prepare_policy(
        &host,
        &server,
        &url,
        allow,
        std::path::Path::new(&directory),
    )
    .await;
    if applied {
        let system = host
            .control()
            .prepare(serde_json::from_value(updated_source(&url, false)).unwrap())
            .unwrap();
        let supervisor = nofy_agent_runtime::supervisor::RunSupervisor::new(host.store().clone());
        let result = supervisor
            .execute_managed_action(system.registry(), "policies")
            .await
            .unwrap();
        assert!(result.error.is_none(), "{:?}", result.error);
        assert!(result.finished);
    }
    // Terminate without draining the host, at an accepted or committed update.
    std::process::exit(if applied { 94 } else { 95 });
}

#[tokio::test]
async fn published_policy_updates_control_future_dispatch_in_place_and_after_two_crash_boundaries()
{
    for (crash, allow) in [(None, true), (Some(false), false), (Some(true), true)] {
        let models = Arc::new(AtomicUsize::new(0));
        let old_tools = Arc::new(AtomicUsize::new(0));
        let new_tools = Arc::new(AtomicUsize::new(0));
        let old_hooks = Arc::new(AtomicUsize::new(0));
        let gate = CancellationToken::new();
        let released = gate.clone();
        let waiting = gate.clone();
        let count = models.clone();
        let old = old_tools.clone();
        let next = new_tools.clone();
        let after = old_hooks.clone();
        let seen = Arc::new(Mutex::new(Vec::<Value>::new()));
        let requests = seen.clone();
        let counters = (
            models.clone(),
            old_tools.clone(),
            new_tools.clone(),
            old_hooks.clone(),
        );
        let service = serve(Router::new()
            .route("/v1/chat/completions", route_post(move |Json(body):Json<Value>| {
                let count = count.clone(); let gate = waiting.clone(); let seen = requests.clone();
                async move {
                    count.fetch_add(1, Ordering::SeqCst); seen.lock().unwrap().push(body.clone());
                    let done = body["messages"].as_array().unwrap().iter().any(|message| message["role"] == "tool" && message["tool_call_id"] == "updated-call");
                    let updated = body["tools"].as_array().unwrap().iter().any(|tool| tool["function"]["name"] == "updated");
                    let frames = if done {
                        nofy_test_support::sse::chat_completion_events_exact("policy applied", "test-model")
                    } else {
                        if !updated { gate.cancelled().await; }
                        nofy_test_support::sse::chat_completions_reasoning_then_tool_call_events("", if updated { "updated-call" } else { "old-call" }, if updated { "updated" } else { "effect" }, "{}", "test-model")
                            .into_iter().map(|frame| axum::response::sse::Event::default().data(frame.data)).collect()
                    };
                    Sse::new(futures::stream::iter(frames.into_iter().map(Ok::<_, Infallible>)))
                }
            }))
            .route("/done", route_post(move || { let old = old.clone(); async move { old.fetch_add(1, Ordering::SeqCst); Json(json!({"old":true})) } }))
            .route("/updated", route_post(move || { let next = next.clone(); async move { next.fetch_add(1, Ordering::SeqCst); Json(json!({"updated":true})) } }))
            .route("/after", route_post(move || { let after = after.clone(); async move { after.fetch_add(1, Ordering::SeqCst); Json(json!({"decision":"continue"})) } }))
            .route("/new-after", route_post(|| async { Json(json!({"decision":"continue"})) }))
            .route("/count", axum::routing::get(move || { let c = counters.clone(); async move { Json(json!({"models":c.0.load(Ordering::SeqCst),"old_tools":c.1.load(Ordering::SeqCst),"new_tools":c.2.load(Ordering::SeqCst),"old_hooks":c.3.load(Ordering::SeqCst)})) } }))
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
                        "parking::modules::policies::policy_update_process",
                        "--nocapture",
                    ])
                    .env("NOFY_POLICY_STATE", path)
                    .env("NOFY_POLICY_SERVICE", url)
                    .env("NOFY_POLICY_ALLOW", if allow { "yes" } else { "no" })
                    .env("NOFY_POLICY_APPLIED", if applied { "yes" } else { "no" })
                    .output()
                    .unwrap()
            })
            .await
            .unwrap();
            assert_eq!(
                output.status.code(),
                Some(if applied { 94 } else { 95 }),
                "{}{}",
                String::from_utf8_lossy(&output.stdout),
                String::from_utf8_lossy(&output.stderr)
            );
        }
        let host = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
        let server = serve(host.router()).await;
        let command = if crash.is_none() {
            Some(prepare_policy(&host, &server, &service.url, allow, directory.path()).await)
        } else {
            None
        };
        let before: Value = serde_json::from_slice(
            &std::fs::read(directory.path().join("policy-boundary.json")).unwrap(),
        )
        .unwrap();
        let scope: BudgetScope = serde_json::from_value(before["scope"].clone()).unwrap();
        assert_eq!(models.load(Ordering::SeqCst), 1);
        assert_eq!(old_tools.load(Ordering::SeqCst), 1);
        assert_eq!(old_hooks.load(Ordering::SeqCst), 1);
        assert_eq!(new_tools.load(Ordering::SeqCst), 0);
        let stop = CancellationToken::new();
        let stopped = stop.clone();
        let worker_host = host.clone();
        let worker = tokio::spawn(async move { worker_host.run_worker(stopped, 2).await.unwrap() });
        let applied = action_result(&server, "policies").await;
        assert!(applied["error"].is_null(), "{applied}");
        let live = host.store().live_execution("root").await.unwrap().unwrap();
        assert_eq!(live.protocol, "nofy.live/v3");
        assert!(live.modules.unwrap().policy_set);
        assert_eq!(
            content_digest(&live.after.state).unwrap(),
            before["state"].as_str().unwrap()
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
        let command = command.unwrap_or_else(|| applied["action"].clone());
        assert_eq!(post(&server, "/api/v1/actions", command).await, applied);
        post(&server, "/api/v1/actions", json!({"command_id":"unpark-policy","run_id":"root","command":{"kind":"unpark","park_command_id":"park"}})).await;
        assert!(action_result(&server, "unpark-policy").await["error"].is_null());
        post(
            &server,
            "/api/v1/actions",
            json!({"command_id":"resume-policy","run_id":"root","command":{"kind":"resume"}}),
        )
        .await;
        let result = action_result_within(&server, "resume-policy", Duration::from_secs(45)).await;
        assert!(result["error"].is_null(), "{result}");
        assert_eq!(
            result["outcome"]["Completed"]["output"], "policy applied",
            "{result}"
        );
        assert_eq!(models.load(Ordering::SeqCst), 3);
        assert_eq!(old_tools.load(Ordering::SeqCst), 1);
        assert_eq!(old_hooks.load(Ordering::SeqCst), 1);
        assert_eq!(new_tools.load(Ordering::SeqCst), usize::from(allow));
        if !allow {
            let seen = seen.lock().unwrap();
            let result = seen[2]["messages"]
                .as_array()
                .unwrap()
                .iter()
                .find(|message| {
                    message["role"] == "tool" && message["tool_call_id"] == "updated-call"
                })
                .unwrap();
            assert!(
                result["content"]
                    .as_str()
                    .unwrap()
                    .contains("outside configured scope"),
                "{result}"
            );
        }
        stop.cancel();
        worker.await.unwrap();
    }
}
