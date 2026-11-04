use super::*;

fn configuration(base: &str, target: Option<&str>) -> Value {
    let mut doc = target.map_or_else(|| source(base, false), |target| target_source(base, target));
    doc["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|m| m["reference"] == r("quota"))
        .unwrap()["config"]["limits"]["max_model_calls"] = json!(4);
    doc
}
async fn arrange(
    host: &KernelHost,
    server: &Serving,
    base: &str,
    target: &str,
) -> nofy_agent_runtime::registry::ModuleRegistry {
    let doc = configuration(base, None);
    let credentials = Arc::new(Credentials(Arc::new(AtomicUsize::new(0))));
    let mut registry = native::registry(credentials).unwrap();
    registry
        .register_factory(Arc::new(
            nofy_agent_models::declarative::ProtocolFactory::new(Arc::new(host.loader().clone())),
        ))
        .unwrap();
    registry
        .register_factory(Arc::new(nofy_agent_runtime::artifact::ArtifactFactory))
        .unwrap();
    registry
        .register_factory(Arc::new(
            nofy_agent_runtime::governance::declarative::BudgetResourceFactory::new(
                Arc::new(host.store().clone()),
                "nofy.kernel.budget",
                nofy_agent_runtime::governance::BudgetLimits::default(),
                5,
            )
            .unwrap(),
        ))
        .unwrap();
    registry
        .register_factory(Arc::new(
            nofy_agent_runtime::governance::declarative::ConnectedBudgetFactory,
        ))
        .unwrap();
    let release = post(server, "/api/v1/import", doc).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    post(server,"/api/v1/runs",json!({"run_id":"root","thread_id":"thread","system":"model-evidence","release":release,"program":"execute","input":{"text":"initial","attachments":[]}})).await;
    let supervisor = nofy_agent_runtime::supervisor::RunSupervisor::new(host.store().clone())
        .with_lease_ttl(Duration::from_secs(2))
        .unwrap();
    let task = {
        let s = nofy_agent_runtime::supervisor::RunSupervisor::new(host.store().clone())
            .with_lease_ttl(Duration::from_secs(2))
            .unwrap();
        let r = registry.clone();
        tokio::spawn(async move { s.execute_submitted(&r, "root").await.unwrap() })
    };
    await_count(base, "models", 1).await;
    post(
        server,
        "/api/v1/actions",
        json!({"command_id":"park","run_id":"root","command":{"kind":"park"}}),
    )
    .await;
    super::super::release(base, "release-model").await;
    task.await.unwrap();
    post(
        server,
        "/api/v1/sessions",
        json!({"session_id":"conversation","root_run_id":"root"}),
    )
    .await;
    post(server,"/api/v1/runs",json!({"run_id":"two","thread_id":"thread","system":"model-evidence","release":release,"program":"execute","input":{"text":"preserved queued input","attachments":[]}})).await;
    let digest = host
        .store()
        .execution_job("two")
        .await
        .unwrap()
        .unwrap()
        .digest;
    let command = json!({"command_id":"bind-two","source_run_id":"root","expected_source_revision":1,"turn":{"kind":"queued","run_id":"two","submission_digest":digest}});
    assert_eq!(
        request(
            server,
            reqwest::Method::POST,
            "/api/v1/sessions/conversation/turns",
            VIEW,
            session_turn_request(command.clone())
        )
        .await
        .0,
        403
    );
    let receipt = post(
        server,
        "/api/v1/sessions/conversation/turns",
        session_turn_request(command.clone()),
    )
    .await;
    assert_eq!(
        receipt,
        post(
            server,
            "/api/v1/sessions/conversation/turns",
            session_turn_request(command)
        )
        .await
    );
    for (run, source) in [("three", "two"), ("four", "three")] {
        post(server,"/api/v1/sessions/conversation/turns",session_turn_request(json!({"command_id":format!("bind-{run}"),"source_run_id":source,"expected_source_revision":0,"turn":{"kind":"new","run_id":run,"input":{"text":format!("input {run}"),"attachments":[]}}}))).await;
    }
    let published = post(server, "/api/v1/import", configuration(base, Some(target))).await;
    post(server,"/api/v1/actions",json!({"command_id":"transition","run_id":"root","command":{"kind":"transition","park_command_id":"park","expected_revision":0,"release":published["bundle"]["digest"],"program":"execute"}})).await;
    let result = supervisor
        .execute_managed_action(&registry, "transition")
        .await
        .unwrap();
    assert!(result.error.is_none(), "{:?}", result.error);
    post(server,"/api/v1/actions",json!({"command_id":"unpark","run_id":"root","command":{"kind":"unpark","park_command_id":"park"}})).await;
    supervisor
        .execute_managed_action(&registry, "unpark")
        .await
        .unwrap();
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "root")
            .await
            .unwrap(),
        Some(nofy_agent_runtime::RunOutcome::Completed { .. })
    ));
    registry
}

#[tokio::test]
async fn seeded_turn_process() {
    let Ok(directory) = std::env::var("NOFY_HANDOFF_STATE") else {
        return;
    };
    let base = std::env::var("NOFY_HANDOFF_BASE").unwrap();
    let target = std::env::var("NOFY_HANDOFF_TARGET").unwrap();
    let host = host(
        std::path::Path::new(&directory),
        Arc::new(AtomicUsize::new(0)),
    )
    .await;
    let server = serve(host.router()).await;
    let registry = arrange(&host, &server, &base, &target).await;
    let supervisor = nofy_agent_runtime::supervisor::RunSupervisor::new(host.store().clone())
        .with_lease_ttl(Duration::from_secs(2))
        .unwrap();
    tokio::spawn(async move {
        supervisor
            .execute_submitted(&registry, "two")
            .await
            .unwrap()
    });
    tokio::time::timeout(Duration::from_secs(15), async {
        loop {
            let count: usize = reqwest::Client::new()
                .get(format!("{target}/count"))
                .send()
                .await
                .unwrap()
                .json()
                .await
                .unwrap();
            if count == 2 {
                break;
            }
            tokio::time::sleep(Duration::from_millis(10)).await;
        }
    })
    .await
    .unwrap();
    assert!(host.store().session_seed("two").await.unwrap().is_some());
    std::process::exit(94);
}

#[tokio::test]
async fn live_config_handoff_runs_queued_native_turns_and_recovers_a_crashed_seed_without_resetting_quota()
 {
    for crash in [false, true] {
        let models = Arc::new(AtomicUsize::new(0));
        let effects = Arc::new(AtomicUsize::new(0));
        let hooks = Arc::new(AtomicUsize::new(0));
        let gate = CancellationToken::new();
        let base=serve(Router::new()
            .route("/v1/chat/completions",route_post({let models=models.clone();let gate=gate.clone();move||{let models=models.clone();let gate=gate.clone();async move {
                models.fetch_add(1,Ordering::SeqCst);gate.cancelled().await;
                let frames=nofy_test_support::sse::chat_completions_reasoning_then_tool_call_events("","old-effect","effect","{}","test-model").into_iter().map(|frame|axum::response::sse::Event::default().data(frame.data)).collect::<Vec<_>>();
                Sse::new(futures::stream::iter(frames.into_iter().map(Ok::<_,Infallible>)))
            }}}))
            .route("/done",route_post({let effects=effects.clone();move||{let effects=effects.clone();async move{effects.fetch_add(1,Ordering::SeqCst);Json(json!({"done":true}))}}}))
            .route("/after",route_post({let hooks=hooks.clone();move||{let hooks=hooks.clone();async move{hooks.fetch_add(1,Ordering::SeqCst);Json(json!({"decision":"continue"}))}}}))
            .route("/count",axum::routing::get({let models=models.clone();let effects=effects.clone();let hooks=hooks.clone();move||{let models=models.clone();let effects=effects.clone();let hooks=hooks.clone();async move{Json(json!({"models":models.load(Ordering::SeqCst),"tools":effects.load(Ordering::SeqCst),"hooks":hooks.load(Ordering::SeqCst)}))}}}))
            .route("/release-model",route_post({let gate=gate.clone();move||{let gate=gate.clone();async move{gate.cancel();Json(json!({"released":true}))}}}))
        ).await;
        let requests = Arc::new(Mutex::new(Vec::<Value>::new()));
        let target = serve(
            Router::new()
                .route(
                    "/count",
                    axum::routing::get({
                        let requests = requests.clone();
                        move || {
                            let requests = requests.clone();
                            async move { Json(requests.lock().unwrap().len()) }
                        }
                    }),
                )
                .route(
                    "/v1/chat/completions",
                    route_post({
                        let requests = requests.clone();
                        move |Json(body): Json<Value>| {
                            let requests = requests.clone();
                            async move {
                                let ordinal = {
                                    let mut seen = requests.lock().unwrap();
                                    seen.push(body);
                                    seen.len()
                                };
                                if crash && ordinal == 2 {
                                    std::future::pending::<()>().await;
                                }
                                let events = nofy_test_support::sse::chat_completion_events_exact(
                                    "effective answer",
                                    "test-model",
                                );
                                Sse::new(futures::stream::iter(
                                    events.into_iter().map(Ok::<_, Infallible>),
                                ))
                            }
                        }
                    }),
                ),
        )
        .await;
        let directory = tempfile::tempdir().unwrap();
        if crash {
            let path = directory.path().to_owned();
            let base = base.url.clone();
            let target = target.url.clone();
            let output = tokio::time::timeout(
                Duration::from_secs(40),
                tokio::task::spawn_blocking(move || {
                    std::process::Command::new(std::env::current_exe().unwrap())
                        .args([
                            "--exact",
                            "parking::transitions::sessions::seeded_turn_process",
                            "--nocapture",
                        ])
                        .env("NOFY_HANDOFF_STATE", path)
                        .env("NOFY_HANDOFF_BASE", base)
                        .env("NOFY_HANDOFF_TARGET", target)
                        .output()
                        .unwrap()
                }),
            )
            .await
            .unwrap()
            .unwrap();
            assert_eq!(
                output.status.code(),
                Some(94),
                "{}\n{}",
                String::from_utf8_lossy(&output.stdout),
                String::from_utf8_lossy(&output.stderr)
            );
            tokio::time::sleep(Duration::from_millis(2100)).await;
        }
        let host = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
        let server = serve(host.router()).await;
        if !crash {
            arrange(&host, &server, &base.url, &target.url).await;
        }
        let original = host.store().execution_job("two").await.unwrap().unwrap();
        let registry = host
            .control()
            .prepare(serde_json::from_value(configuration(&base.url, None)).unwrap())
            .unwrap();
        let resolved = registry
            .registry()
            .resolve(&[ModuleRef::new("quota", "1")])
            .unwrap();
        let ModuleInstance::Governance(profile) =
            &resolved.instances[&ModuleRef::new("quota", "1")]
        else {
            panic!("quota")
        };
        let scope = BudgetScope {
            root_run_id: "root".into(),
            identity: profile.identity().into(),
        };
        let before = host.store().inspect(&scope).await.unwrap().unwrap();
        let stop = CancellationToken::new();
        let shutdown = stop.clone();
        let worker_host = host.clone();
        let worker =
            tokio::spawn(async move { worker_host.run_worker(shutdown, 2).await.unwrap() });
        if crash {
            assert_eq!(before.used.model_calls, 2);
            assert_eq!(before.reserved.model_calls, 1);
            assert_eq!(
                outcome(&server, "two").await["execution"]["status"],
                "paused"
            );
            let page = request(
                &server,
                reqwest::Method::GET,
                "/api/v1/runs/two/recovery/models",
                VIEW,
                Value::Null,
            )
            .await
            .1;
            assert_eq!(page.as_array().unwrap().len(), 1);
            let response = nofy_agent_runtime::ModelResponse {
                output: "handoff recovered".into(),
                input_tokens: 3,
                output_tokens: 2,
                ..Default::default()
            };
            post(&server,"/api/v1/actions",json!({"command_id":"proof-two","run_id":"two","command":{"kind":"reconcile_model","receipt":{"ticket":page[0]["ticket"],"result":{"kind":"completed","response":response}}}})).await;
            let result = action_result(&server, "proof-two").await;
            assert!(result["error"].is_null(), "{result}");
        }
        assert_eq!(
            outcome(&server, "two").await["execution"]["status"],
            "completed"
        );
        assert_eq!(
            outcome(&server, "three").await["execution"]["status"],
            "completed"
        );
        assert_eq!(
            outcome(&server, "four").await["execution"]["status"],
            "budget_exceeded"
        );
        assert_eq!(models.load(Ordering::SeqCst), 1);
        assert_eq!(effects.load(Ordering::SeqCst), 1);
        assert_eq!(hooks.load(Ordering::SeqCst), 1);
        let seen = requests.lock().unwrap();
        assert_eq!(seen.len(), 3);
        assert_eq!(seen[1]["temperature"], 0.25);
        assert!(
            seen[1]["messages"]
                .to_string()
                .contains("preserved queued input")
        );
        assert!(
            seen[1]["messages"]
                .to_string()
                .contains("live prompt version two")
        );
        drop(seen);
        let after = host.store().inspect(&scope).await.unwrap().unwrap();
        assert_eq!(after.used.model_calls, 4);
        assert_eq!(after.reserved.model_calls, 0);
        assert_eq!(after.created_at_ms, before.created_at_ms);
        assert_eq!(
            host.store()
                .execution_job("two")
                .await
                .unwrap()
                .unwrap()
                .digest,
            original.digest
        );
        let (status, binding) = request(
            &server,
            reqwest::Method::GET,
            "/api/v1/sessions/conversation/turns/two",
            VIEW,
            Value::Null,
        )
        .await;
        assert_eq!(status, 200);
        let binding = json!({"admission":binding["native_admission_json"].as_str().map(|s|serde_json::from_str::<Value>(s).unwrap()),"seed":binding["seed_json"].as_str().map(|s|serde_json::from_str::<Value>(s).unwrap())});
        assert_eq!(binding["seed"]["source_revision"], 1);
        assert_eq!(binding["seed"]["source_command_id"], "transition");
        assert_eq!(binding["seed"]["submission_digest"], original.digest);
        assert!(binding["seed"].get("snapshot").is_none());
        let three = host.store().session_seed("three").await.unwrap().unwrap();
        assert_eq!(three.source_seed_command_id.as_deref(), Some("bind-two"));
        let retained = host
            .store()
            .inspect_retained_modules(
                nofy_agent_runtime::durable::retention::RetentionLimits::default(),
                std::collections::BTreeSet::new(),
                |kinds, origin, modules| {
                    if !modules.is_empty() {
                        kinds.insert(origin.kind.clone());
                    }
                    Ok(())
                },
            )
            .await
            .unwrap();
        for kind in [
            "job",
            "execution",
            "transition",
            "live_version",
            "session_seed",
            "checkpoint",
        ] {
            assert!(
                retained.value.contains(kind),
                "missing {kind}: {:?}",
                retained.value
            );
        }
        stop.cancel();
        worker.await.unwrap();
    }
}
