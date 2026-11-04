use super::*;
use nofy_agent_runtime::{
    governance::{BudgetScope, BudgetStore},
    registry::{ModuleInstance, ModuleRef},
};

fn source(url: &str) -> SystemDocument {
    let mut value = serde_json::to_value(document(url)).unwrap();
    value["programs"]["chat"]["definition"]["settings"]["model"]["max_output_tokens"] = json!(32);
    value["modules"].as_array_mut().unwrap().extend([
        json!({"reference":{"id":"ledger","version":"1"},"factory":"resource.budget","config":{}}),
        json!({"reference":{"id":"quota","version":"1"},"factory":"governance.budget_connected","config":{"limits":{"max_model_calls":2,"max_duration_ms":60000}},"dependencies":{"budget":{"id":"ledger","version":"1"}}}),
    ]);
    value["required_governance"] = json!([{"id":"quota","version":"1"}]);
    serde_json::from_value(value).unwrap()
}
fn turn(release: &str, id: &str) -> Value {
    let mut value = run(release, id);
    value["thread_id"] = json!("stable-thread");
    value["input"]["text"] = json!(id);
    value
}
fn scope(host: &KernelHost, source: &SystemDocument) -> BudgetScope {
    let prepared = host.control().prepare(source.clone()).unwrap();
    let resolved = prepared
        .registry()
        .resolve(&[ModuleRef::new("quota", "1")])
        .unwrap();
    let ModuleInstance::Governance(profile) = &resolved.instances[&ModuleRef::new("quota", "1")]
    else {
        panic!("quota")
    };
    BudgetScope {
        root_run_id: "first".into(),
        identity: profile.identity().into(),
    }
}

#[tokio::test]
async fn real_http_sessions_enforce_scopes_queue_ownership_and_shared_budget_across_host_reopen() {
    let requests = Arc::new(Mutex::new(vec![]));
    let provider = serve(
        Router::new()
            .route("/v1/chat/completions", route_post(super::provider))
            .with_state(requests.clone()),
    )
    .await;
    let dir = tempfile::tempdir().unwrap();
    let original = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(original.router()).await;
    let source = source(&provider.url);
    let scope = scope(&original, &source);
    let release = import(&server, &source).await;
    for id in ["first", "second", "third"] {
        post(&server, "/api/v1/runs", turn(&release, id)).await;
    }
    let admission = json!({"session_id":"conversation","root_run_id":"first"});
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/sessions",
            VIEW,
            admission.clone()
        )
        .await
        .0,
        403
    );
    let receipt = post(&server, "/api/v1/sessions", admission.clone()).await;
    assert_eq!(session_origin(&receipt)["protocol"], "nofy.session/v2");
    assert_eq!(session_origin(&receipt)["budget_root_run_id"], "first");
    assert_eq!(
        receipt,
        post(&server, "/api/v1/sessions", admission.clone()).await
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/sessions",
            ADMIN,
            json!({"session_id":"conversation","root_run_id":"second"})
        )
        .await
        .0,
        409
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/sessions",
            ADMIN,
            json!({"session_id":"other","root_run_id":"first"})
        )
        .await
        .0,
        409
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/sessions/missing",
            VIEW,
            Value::Null
        )
        .await
        .0,
        404
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/sessions?limit=0",
            VIEW,
            Value::Null
        )
        .await
        .0,
        422
    );
    let registry = original
        .control()
        .prepare(source.clone())
        .unwrap()
        .registry()
        .clone();
    nofy_agent_runtime::supervisor::RunSupervisor::new(original.store().clone())
        .execute_submitted(&registry, "first")
        .await
        .unwrap();
    let before = original.store().inspect(&scope).await.unwrap().unwrap();
    assert_eq!(before.used.model_calls, 1);
    drop(server);
    drop(original);
    let reopened = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(reopened.router()).await;
    let readback = post(&server, "/api/v1/sessions", admission).await;
    assert_eq!(session_origin(&readback), session_origin(&receipt));
    assert_eq!(readback["active_run_id"], "first");
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker_host = reopened.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 2).await.unwrap() });
    assert_eq!(
        outcome(&server, "second").await["execution"]["status"],
        "completed"
    );
    assert_eq!(
        outcome(&server, "third").await["execution"]["status"],
        "budget_exceeded"
    );
    assert_eq!(requests.lock().unwrap().len(), 2);
    let second_request = requests.lock().unwrap()[1].clone();
    let transcript = second_request["messages"].to_string();
    assert!(transcript.contains("first") && transcript.contains("second"));
    let after = reopened.store().inspect(&scope).await.unwrap().unwrap();
    assert_eq!(after.used.model_calls, 2);
    assert_eq!(after.deadline_ms, before.deadline_ms);
    assert_eq!(after.created_at_ms, before.created_at_ms);
    let mut second_scope = scope;
    second_scope.root_run_id = "second".into();
    assert!(
        reopened
            .store()
            .inspect(&second_scope)
            .await
            .unwrap()
            .is_none()
    );
    let (status, session) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/sessions/conversation",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200);
    assert_eq!(session["active_run_id"], "third");
    let (status, turns) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/sessions/conversation/turns?limit=2",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200);
    let turns = session_turn_items(&turns);
    assert_eq!(turns.as_array().unwrap().len(), 2);
    assert_eq!(turns[0]["run_id"], "first");
    assert_eq!(turns[1]["run_id"], "second");
    let after_cursor = turns[1]["sequence"].as_u64().unwrap();
    let (status, tail) = request(
        &server,
        reqwest::Method::GET,
        &format!("/api/v1/sessions/conversation/turns?after={after_cursor}"),
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200);
    let tail = session_turn_items(&tail);
    assert_eq!(tail[0]["run_id"], "third");
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/sessions",
            VIEW,
            Value::Null
        )
        .await
        .1
        .as_array()
        .unwrap()
        .len(),
        1
    );
    stop.cancel();
    worker.await.unwrap();
}

#[tokio::test]
async fn session_host_process() {
    let Ok(path) = std::env::var("NOFY_SESSION_STATE") else {
        return;
    };
    let url = std::env::var("NOFY_SESSION_SERVICE").unwrap();
    let host = host(std::path::Path::new(&path), Arc::new(AtomicUsize::new(0))).await;
    let source = source(&url);
    let registry = host
        .control()
        .prepare(source.clone())
        .unwrap()
        .registry()
        .clone();
    let server = serve(host.router()).await;
    let release = import(&server, &source).await;
    for id in ["first", "second", "third"] {
        post(&server, "/api/v1/runs", turn(&release, id)).await;
    }
    post(
        &server,
        "/api/v1/sessions",
        json!({"session_id":"conversation","root_run_id":"first"}),
    )
    .await;
    let supervisor = nofy_agent_runtime::supervisor::RunSupervisor::new(host.store().clone())
        .with_lease_ttl(Duration::from_secs(2))
        .unwrap();
    supervisor
        .execute_submitted(&registry, "first")
        .await
        .unwrap();
    tokio::spawn(async move {
        supervisor
            .execute_submitted(&registry, "second")
            .await
            .unwrap()
    });
    tokio::time::timeout(Duration::from_secs(15), async {
        loop {
            let count: usize = reqwest::Client::new()
                .get(format!("{url}/count"))
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
    // Deliberately abandon the second dispatched request without unwinding.
    std::process::exit(93);
}

#[tokio::test]
async fn hard_exit_during_a_later_root_reconciles_against_original_session_reservation_without_redispatch()
 {
    let count = Arc::new(AtomicUsize::new(0));
    let provider = serve(
        Router::new()
            .route(
                "/count",
                axum::routing::get({
                    let count = count.clone();
                    move || {
                        let count = count.clone();
                        async move { Json(count.load(Ordering::SeqCst)) }
                    }
                }),
            )
            .route(
                "/v1/chat/completions",
                route_post({
                    let count = count.clone();
                    move || {
                        let count = count.clone();
                        async move {
                            if count.fetch_add(1, Ordering::SeqCst) == 1 {
                                std::future::pending::<()>().await;
                            }
                            let events = nofy_test_support::sse::chat_completion_events_exact(
                                "first answer",
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
    let path = directory.path().to_owned();
    let url = provider.url.clone();
    let output = tokio::time::timeout(
        Duration::from_secs(30),
        tokio::task::spawn_blocking(move || {
            std::process::Command::new(std::env::current_exe().unwrap())
                .args(["--exact", "sessions::session_host_process", "--nocapture"])
                .env("NOFY_SESSION_STATE", path)
                .env("NOFY_SESSION_SERVICE", url)
                .output()
                .unwrap()
        }),
    )
    .await
    .unwrap()
    .unwrap();
    assert_eq!(
        output.status.code(),
        Some(93),
        "{}\n{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    assert_eq!(count.load(Ordering::SeqCst), 2);
    tokio::time::sleep(Duration::from_millis(2100)).await;
    let reopened = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
    let scope = scope(&reopened, &source(&provider.url));
    let before = reopened.store().inspect(&scope).await.unwrap().unwrap();
    assert_eq!(before.used.model_calls, 1);
    assert_eq!(before.reserved.model_calls, 1);
    let server = serve(reopened.router()).await;
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker_host = reopened.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 2).await.unwrap() });
    assert_eq!(
        outcome(&server, "second").await["execution"]["status"],
        "paused"
    );
    let (status, targets) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/runs/second/recovery/models",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200, "{targets}");
    assert_eq!(targets.as_array().unwrap().len(), 1);
    assert_eq!(targets[0]["ticket"]["request"]["run_id"], "second");
    let response = nofy_agent_runtime::ModelResponse {
        output: "recovered answer".into(),
        input_tokens: 3,
        output_tokens: 2,
        ..Default::default()
    };
    post(&server,"/api/v1/actions",json!({"command_id":"proof","run_id":"second","command":{"kind":"reconcile_model","receipt":{"ticket":targets[0]["ticket"],"result":{"kind":"completed","response":response}}}})).await;
    let action = action_result(&server, "proof").await;
    assert!(action["error"].is_null(), "{action}");
    assert_eq!(action["outcome"]["Completed"]["output"], "recovered answer");
    assert_eq!(
        outcome(&server, "third").await["execution"]["status"],
        "budget_exceeded"
    );
    assert_eq!(count.load(Ordering::SeqCst), 2);
    let after = reopened.store().inspect(&scope).await.unwrap().unwrap();
    assert_eq!(after.used.model_calls, 2);
    assert_eq!(after.reserved.model_calls, 0);
    assert_eq!(after.created_at_ms, before.created_at_ms);
    assert_eq!(after.deadline_ms, before.deadline_ms);
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/sessions/conversation",
            VIEW,
            Value::Null
        )
        .await
        .1["active_run_id"],
        "third"
    );
    assert_eq!(post(&server,"/api/v1/actions",json!({"command_id":"proof","run_id":"second","command":{"kind":"reconcile_model","receipt":{"ticket":targets[0]["ticket"],"result":{"kind":"completed","response":response}}}})).await,action);
    assert_eq!(count.load(Ordering::SeqCst), 2);
    stop.cancel();
    worker.await.unwrap();
}
