use super::*;
#[path = "transitions/sessions.rs"]
mod sessions;

fn target_source(base: &str, target: &str) -> Value {
    let mut doc = source(base, false);
    doc["modules"][0]["config"]["base_url"] = json!(format!("{target}/v1/"));
    doc["modules"][2]["config"]["text"] = json!("live prompt version two");
    doc["programs"]["execute"]["definition"]["settings"] = json!({"model":{"temperature":0.25}});
    doc
}
async fn admit(host: &KernelHost, server: &Serving, base: &str, target: &str) {
    let document = source(base, false);
    let registry = host
        .control()
        .prepare(serde_json::from_value(document.clone()).unwrap())
        .unwrap()
        .registry()
        .clone();
    let publication = post(server, "/api/v1/import", document).await;
    post(server,"/api/v1/runs",json!({"run_id":"root","thread_id":"thread","system":"model-evidence","release":publication["bundle"]["digest"],"program":"execute","input":{"text":"continue","attachments":[]}})).await;
    let supervisor = nofy_agent_runtime::supervisor::RunSupervisor::new(host.store().clone())
        .with_lease_ttl(Duration::from_secs(2))
        .unwrap();
    let worker = tokio::spawn(async move {
        supervisor
            .execute_submitted(&registry, "root")
            .await
            .unwrap()
    });
    await_count(base, "models", 1).await;
    post(
        server,
        "/api/v1/actions",
        json!({"command_id":"park","run_id":"root","command":{"kind":"park"}}),
    )
    .await;
    release(base, "release-model").await;
    worker.await.unwrap();
    assert!(action_result(server, "park").await["error"].is_null());
    let published = post(server, "/api/v1/import", target_source(base, target)).await;
    let command = json!({"command_id":"transition","run_id":"root","command":{"kind":"transition","park_command_id":"park","expected_revision":0,"release":published["bundle"]["digest"],"program":"execute"}});
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
    post(server, "/api/v1/actions", command).await;
}

#[tokio::test]
async fn accepted_transition_process() {
    let Ok(directory) = std::env::var("NOFY_LIVE_STATE") else {
        return;
    };
    let base = std::env::var("NOFY_LIVE_BASE").unwrap();
    let target = std::env::var("NOFY_LIVE_TARGET").unwrap();
    let host = host(
        std::path::Path::new(&directory),
        Arc::new(AtomicUsize::new(0)),
    )
    .await;
    let server = serve(host.router()).await;
    admit(&host, &server, &base, &target).await;
    assert!(
        !host
            .store()
            .managed_action("transition")
            .await
            .unwrap()
            .unwrap()
            .finished
    );
    std::process::exit(97);
}

#[tokio::test]
async fn published_connection_prompt_and_settings_switch_in_place_and_after_acceptance_crash() {
    for crash in [false, true] {
        let models = Arc::new(AtomicUsize::new(0));
        let tools = Arc::new(AtomicUsize::new(0));
        let hooks = Arc::new(AtomicUsize::new(0));
        let gate = CancellationToken::new();
        let count = models.clone();
        let effects = tools.clone();
        let after = hooks.clone();
        let waiting = gate.clone();
        let released = gate.clone();
        let counts = (models.clone(), tools.clone(), hooks.clone());
        let base=serve(Router::new()
            .route("/v1/chat/completions",route_post(move |Json(_):Json<Value>| { let count=count.clone();let gate=waiting.clone();async move {
                count.fetch_add(1,Ordering::SeqCst);gate.cancelled().await;
                let frames=nofy_test_support::sse::chat_completions_reasoning_then_tool_call_events("","effect-once","effect","{}","test-model")
                    .into_iter().map(|frame|axum::response::sse::Event::default().data(frame.data)).collect::<Vec<_>>();
                Sse::new(futures::stream::iter(frames.into_iter().map(Ok::<_,Infallible>)))
            }}))
            .route("/done",route_post(move || {let effects=effects.clone();async move {effects.fetch_add(1,Ordering::SeqCst);Json(json!({"done":true}))}}))
            .route("/after",route_post(move || {let after=after.clone();async move {after.fetch_add(1,Ordering::SeqCst);Json(json!({"decision":"continue"}))}}))
            .route("/count",axum::routing::get(move || {let counts=counts.clone();async move {Json(json!({"models":counts.0.load(Ordering::SeqCst),"tools":counts.1.load(Ordering::SeqCst),"hooks":counts.2.load(Ordering::SeqCst)}))}}))
            .route("/release-model",route_post(move || {let gate=released.clone();async move {gate.cancel();Json(json!({"released":true}))}}))
        ).await;
        let requests = Arc::new(Mutex::new(Vec::<Value>::new()));
        let target = serve(
            Router::new()
                .route("/v1/chat/completions", route_post(provider))
                .with_state(requests.clone()),
        )
        .await;
        let directory = tempfile::tempdir().unwrap();
        if crash {
            let path = directory.path().to_owned();
            let url = base.url.clone();
            let target_url = target.url.clone();
            let output = tokio::task::spawn_blocking(move || {
                std::process::Command::new(std::env::current_exe().unwrap())
                    .args([
                        "--exact",
                        "parking::transitions::accepted_transition_process",
                        "--nocapture",
                    ])
                    .env("NOFY_LIVE_STATE", path)
                    .env("NOFY_LIVE_BASE", url)
                    .env("NOFY_LIVE_TARGET", target_url)
                    .output()
                    .unwrap()
            })
            .await
            .unwrap();
            assert_eq!(
                output.status.code(),
                Some(97),
                "{}\n{}",
                String::from_utf8_lossy(&output.stdout),
                String::from_utf8_lossy(&output.stderr)
            );
        }
        let host = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
        let server = serve(host.router()).await;
        if !crash {
            admit(&host, &server, &base.url, &target.url).await;
        }
        let original = content_digest(
            &host
                .store()
                .execution_job("root")
                .await
                .unwrap()
                .unwrap()
                .submission,
        )
        .unwrap();
        let parked = content_digest(&host.store().parking("root").await.unwrap()).unwrap();
        let prepared = host
            .control()
            .prepare(serde_json::from_value(source(&base.url, false)).unwrap())
            .unwrap();
        let resolved = prepared
            .registry()
            .resolve(&[ModuleRef::new("quota", "1")])
            .unwrap();
        let ModuleInstance::Governance(profile) =
            &resolved.instances[&ModuleRef::new("quota", "1")]
        else {
            panic!("quota");
        };
        let scope = BudgetScope {
            root_run_id: "root".into(),
            identity: profile.identity().into(),
        };
        let budget = content_digest(&host.store().inspect(&scope).await.unwrap()).unwrap();
        let stop = CancellationToken::new();
        let shutdown = stop.clone();
        let worker_host = host.clone();
        let worker =
            tokio::spawn(async move { worker_host.run_worker(shutdown, 2).await.unwrap() });
        let changed = action_result(&server, "transition").await;
        assert!(changed["error"].is_null(), "{changed}");
        let state = outcome(&server, "root").await;
        assert_eq!(state["live"]["protocol"], "nofy.live/v1");
        assert_eq!(state["live"]["revision"], 1);
        let (status, history) = request(
            &server,
            reqwest::Method::GET,
            "/api/v1/runs/root/versions?after=0&limit=1",
            VIEW,
            Value::Null,
        )
        .await;
        assert_eq!(status, 200);
        assert_eq!(history.as_array().unwrap().len(), 1);
        assert_eq!(history[0]["revision"], 1);
        assert_eq!(
            request(
                &server,
                reqwest::Method::GET,
                "/api/v1/runs/root/versions?limit=33",
                VIEW,
                Value::Null
            )
            .await
            .0,
            422
        );
        assert_eq!(
            content_digest(&host.store().inspect(&scope).await.unwrap()).unwrap(),
            budget
        );
        assert_eq!(
            content_digest(&host.store().parking("root").await.unwrap()).unwrap(),
            parked
        );
        assert!(requests.lock().unwrap().is_empty());
        assert_eq!(
            service_count(&base.url).await,
            json!({"models":1,"tools":1,"hooks":1})
        );
        post(&server,"/api/v1/actions",json!({"command_id":"unpark","run_id":"root","command":{"kind":"unpark","park_command_id":"park"}})).await;
        assert!(action_result(&server, "unpark").await["error"].is_null());
        assert!(requests.lock().unwrap().is_empty());
        post(
            &server,
            "/api/v1/actions",
            json!({"command_id":"resume","run_id":"root","command":{"kind":"resume"}}),
        )
        .await;
        let done = action_result(&server, "resume").await;
        assert!(done["error"].is_null(), "{done}");
        assert_eq!(
            done["outcome"]["Completed"]["output"], "live prompt version two",
            "{done}"
        );
        {
            let seen = requests.lock().unwrap();
            assert_eq!(seen.len(), 1);
            assert_eq!(seen[0]["temperature"], 0.25);
            assert!(
                seen[0]["messages"]
                    .as_array()
                    .unwrap()
                    .iter()
                    .any(|m| m["role"] == "tool")
            );
        }
        assert_eq!(
            service_count(&base.url).await,
            json!({"models":1,"tools":1,"hooks":1})
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
            original
        );
        stop.cancel();
        worker.await.unwrap();
    }
}
