use super::*;
#[path = "declaration/process.rs"]
mod process;
use nofy_agent_runtime::{
    governance::{BudgetScope, BudgetStore},
    registry::{ModuleInstance, ModuleRef},
};

fn declared(provider: &str, service: &str, allow: bool, cwd: &str) -> Value {
    let mut source = super::scope::system(provider, service, allow, 8);
    super::programs::attach(&mut source, super::programs::text());
    let skills = source["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|module| module["reference"]["id"] == "skills")
        .unwrap();
    skills["factory"] = json!("tool.skills_scoped");
    skills["config"]["skills"][0]["allowed_tools"] = json!(["workspace-read"]);
    source["modules"].as_array_mut().unwrap().push(json!({"reference":{"id":"cwd","version":"1"},"factory":"binding.cwd","config":{"cwd":cwd}}));
    source["programs"]["chat"]["definition"]["bindings"] = json!([{"id":"cwd","version":"1"}]);
    source
}
async fn provider(
    State(requests): State<Arc<Mutex<Vec<Value>>>>,
    Json(body): Json<Value>,
) -> impl IntoResponse {
    requests.lock().unwrap().push(body.clone());
    let model = body["model"].as_str().unwrap();
    let results = body["messages"]
        .as_array()
        .unwrap()
        .iter()
        .filter(|message| message["role"] == "tool")
        .count();
    let call = match (model, results) {
        ("test-model", 0) => Some(("skill", json!({"skill":"review","args":"work"}))),
        ("skill-model", 0) => Some(("lookup", json!({"file_path":"src/lib.rs"}))),
        ("skill-model", 1) => Some(("lookup", json!({"file_path":"../outside"}))),
        _ => None,
    };
    let events = if let Some((name, arguments)) = call {
        nofy_test_support::sse::chat_completions_reasoning_then_tool_call_events(
            "",
            &format!("{model}-{results}"),
            name,
            &arguments.to_string(),
            model,
        )
    } else {
        nofy_test_support::sse::chat_completion_script_exact("declaration complete", model)
    };
    Sse::new(futures::stream::iter(events.into_iter().map(|event| {
        Ok::<_, Infallible>(axum::response::sse::Event::default().data(event.data))
    })))
}
async fn pending(server: &Serving, id: &str) -> Value {
    let (status, pending) = request(
        server,
        reqwest::Method::GET,
        &format!("/api/v1/runs/{id}/approvals"),
        ADMIN,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200, "{pending}");
    pending
}
async fn approve_and_resume(server: &Serving, id: &str) -> Value {
    let pending = pending(server, id).await;
    assert_eq!(pending.as_array().unwrap().len(), 1, "{pending}");
    assert_eq!(pending[0]["call"]["arguments"]["file_path"], "src/lib.rs");
    assert_eq!(
        request(
            server,
            reqwest::Method::POST,
            &format!("/api/v1/runs/{id}/approvals"),
            ADMIN,
            json!({"request":pending[0],"allow":true})
        )
        .await
        .0,
        204
    );
    let action =
        json!({"command_id":format!("resume-{id}"),"run_id":id,"command":{"kind":"resume"}});
    post(server, "/api/v1/actions", action.clone()).await;
    let receipt = action_result(server, action["command_id"].as_str().unwrap()).await;
    assert!(receipt["error"].is_null(), "{receipt}");
    assert_eq!(
        outcome(server, id).await["execution"]["status"],
        "completed"
    );
    assert_eq!(post(server, "/api/v1/actions", action).await, receipt);
    receipt
}
fn quota(host: &KernelHost, source: Value, id: &str) -> BudgetScope {
    let compiled = host
        .control()
        .prepare(serde_json::from_value(source).unwrap())
        .unwrap();
    let reference = ModuleRef::new("quota", "1");
    let resolved = compiled.registry().resolve(&[reference.clone()]).unwrap();
    let ModuleInstance::Governance(profile) = &resolved.instances[&reference] else {
        panic!("quota")
    };
    BudgetScope {
        root_run_id: id.into(),
        identity: profile.identity().into(),
    }
}

#[tokio::test]
async fn declared_native_rules_are_pure_strict_and_leave_the_exact_factory_unchanged() {
    let root = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let host = resident(root.path(), reads.clone()).await;
    let server = serve(host.router()).await;
    let source = declared(
        "http://127.0.0.1:1",
        "http://127.0.0.1:2",
        true,
        "/declared/workspace",
    );
    let (status, valid) = request(
        &server,
        reqwest::Method::POST,
        "/api/v1/validate",
        VIEW,
        source.clone(),
    )
    .await;
    assert_eq!(status, 200, "{valid}");
    let (_, modules) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/modules",
        VIEW,
        Value::Null,
    )
    .await;
    for name in [
        "tool.skills_scoped",
        "binding.cwd",
        "resource.scope_program",
    ] {
        assert!(
            modules["factories"]
                .as_array()
                .unwrap()
                .iter()
                .any(|factory| factory["factory"] == name)
        );
    }
    for mutation in 0..5 {
        let mut invalid = source.clone();
        match mutation {
            0 => {
                config(&mut invalid, "scope")["cwd"] = json!("relative");
            }
            1 => {
                config(&mut invalid, "scope")["typo"] = json!(true);
            }
            2 => {
                config(&mut invalid, "scope")["parameters"]["grants"]["workspace-read"]["tools"] =
                    json!([]);
            }
            3 => {
                config(&mut invalid, "cwd")["cwd"] = json!("/declared/../other");
            }
            _ => {
                let module = invalid["modules"]
                    .as_array_mut()
                    .unwrap()
                    .iter_mut()
                    .find(|module| module["reference"]["id"] == "skills")
                    .unwrap();
                module["factory"] = json!("tool.skills");
                module["config"].as_object_mut().unwrap().remove("scope");
                module["dependencies"]
                    .as_object_mut()
                    .unwrap()
                    .remove("scope");
                module["config"]["skills"][0]["allowed_tools"] = json!(["Read(src/**)"]);
            }
        }
        assert_eq!(
            request(
                &server,
                reqwest::Method::POST,
                "/api/v1/validate",
                VIEW,
                invalid
            )
            .await
            .0,
            422
        );
    }
    assert_eq!(reads.load(Ordering::SeqCst), 0);
    assert_eq!(host.loader().prompt_status().started, 0);
    assert!(host.control().inspect().await.unwrap().is_none());
}

#[tokio::test]
async fn declared_rules_preserve_approval_and_success_receipts_after_reopen_and_portable_lock_import()
 {
    let requests = Arc::new(Mutex::new(Vec::<Value>::new()));
    let provider = serve(
        Router::new()
            .route("/v1/chat/completions", route_post(provider))
            .with_state(requests.clone()),
    )
    .await;
    let calls = Arc::new(Mutex::new(Vec::<Value>::new()));
    let effects = calls.clone();
    let service = serve(Router::new().route(
        "/api/lookup",
        route_post(move |Json(body): Json<Value>| {
            let effects = effects.clone();
            async move {
                effects.lock().unwrap().push(body);
                Json(json!({"evidence":"available"}))
            }
        }),
    ))
    .await;
    let source = declared(&provider.url, &service.url, true, "/declared/workspace");
    let dir = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let host = resident(dir.path(), reads.clone()).await;
    let server = serve(host.router()).await;
    let scope = quota(&host, source.clone(), "declared-reopen");
    let release = post(&server, "/api/v1/import", source).await;
    let digest = release["bundle"]["digest"].as_str().unwrap();
    let stop = CancellationToken::new();
    let worker_host = host.clone();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 1).await.unwrap() });
    post(
        &server,
        "/api/v1/runs",
        launch(digest, "declared-reopen", "chat"),
    )
    .await;
    let paused = outcome(&server, "declared-reopen").await;
    assert_eq!(paused["execution"]["status"], "paused", "{paused}");
    let before = pending(&server, "declared-reopen").await;
    assert_eq!(before.as_array().unwrap().len(), 1);
    assert!(calls.lock().unwrap().is_empty());
    assert_eq!(requests.lock().unwrap().len(), 2);
    stop.cancel();
    worker.await.unwrap();
    drop(server);
    drop(host);

    let reopened = resident(dir.path(), reads).await;
    let server = serve(reopened.router()).await;
    assert_eq!(pending(&server, "declared-reopen").await, before);
    let stop = CancellationToken::new();
    let worker_host = reopened.clone();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 1).await.unwrap() });
    approve_and_resume(&server, "declared-reopen").await;
    assert_eq!(requests.lock().unwrap().len(), 5);
    assert_eq!(calls.lock().unwrap().len(), 1);
    assert_eq!(calls.lock().unwrap()[0]["file_path"], "src/lib.rs");
    let used = reopened
        .store()
        .inspect(&scope)
        .await
        .unwrap()
        .unwrap()
        .used;
    assert_eq!(used.model_calls, 5);
    assert_eq!(used.child_calls, 1);
    stop.cancel();
    worker.await.unwrap();

    let target = tempfile::tempdir().unwrap();
    let migrated = resident(target.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(migrated.router()).await;
    let imported = post(&server, "/api/v1/import", release["bundle"].clone()).await;
    assert_eq!(imported["bundle"]["digest"], digest);
    let stop = CancellationToken::new();
    let worker_host = migrated.clone();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 1).await.unwrap() });
    post(
        &server,
        "/api/v1/runs",
        launch(digest, "declared-migrated", "chat"),
    )
    .await;
    assert_eq!(
        outcome(&server, "declared-migrated").await["execution"]["status"],
        "paused"
    );
    approve_and_resume(&server, "declared-migrated").await;
    assert_eq!(requests.lock().unwrap().len(), 10);
    assert_eq!(calls.lock().unwrap().len(), 2);
    assert!(
        calls
            .lock()
            .unwrap()
            .iter()
            .all(|body| body["file_path"] == "src/lib.rs")
    );
    stop.cancel();
    worker.await.unwrap();
}

#[tokio::test]
async fn published_scope_code_changes_new_runs_while_pending_approval_keeps_original_and_rolls_back()
 {
    use sha2::{Digest, Sha256};
    use std::io::Read;
    let binary_digest = || {
        let mut file = std::fs::File::open(env!("CARGO_BIN_EXE_nofy-agent-host")).unwrap();
        let mut digest = Sha256::new();
        let mut buffer = [0; 64 * 1024];
        loop {
            let size = file.read(&mut buffer).unwrap();
            if size == 0 {
                break digest.finalize();
            }
            digest.update(&buffer[..size]);
        }
    };
    let requests = Arc::new(Mutex::new(Vec::<Value>::new()));
    let provider = serve(
        Router::new()
            .route("/v1/chat/completions", route_post(provider))
            .with_state(requests.clone()),
    )
    .await;
    let calls = Arc::new(Mutex::new(Vec::<Value>::new()));
    let effects = calls.clone();
    let service = serve(Router::new().route(
        "/api/lookup",
        route_post(move |Json(body): Json<Value>| {
            let effects = effects.clone();
            async move {
                effects.lock().unwrap().push(body);
                Json(json!({"evidence":"published-scope"}))
            }
        }),
    ))
    .await;
    let source = declared(&provider.url, &service.url, true, "/declared/workspace");
    let dir = tempfile::tempdir().unwrap();
    let host = resident(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let pid = std::process::id();
    let binary = binary_digest();
    let first = post(&server, "/api/v1/import", source.clone()).await;
    let first = first["bundle"]["digest"].as_str().unwrap().to_owned();
    let applied = post(
        &server,
        "/api/v1/apply",
        json!({"command_id":"scope-one","system":"native-capabilities","release":first,"expected_generation":null}),
    ).await;
    assert_eq!(applied["active"], json!({"generation":1,"release":first}));
    let stop = CancellationToken::new();
    let worker_host = host.clone();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 1).await.unwrap() });
    post(
        &server,
        "/api/v1/runs",
        launch(&first, "scope-pending-original", "chat"),
    )
    .await;
    assert_eq!(
        outcome(&server, "scope-pending-original").await["execution"]["status"],
        "paused"
    );
    let original_approval = pending(&server, "scope-pending-original").await;
    assert!(calls.lock().unwrap().is_empty());

    let mut next = source;
    let changed = super::programs::text().replace(
        "fn scope(input) {",
        "fn scope(input) { if input.operation.kind == \"admit\" { return #{kind: \"admit\", allowed: false}; } ",
    );
    config(&mut next, "scope-code")["bundle"]["files"]["scope.rhai"] = json!(changed);
    for module in next["modules"].as_array_mut().unwrap() {
        if module["reference"]["id"] == "scope-code" || module["reference"]["id"] == "scope" {
            module["reference"]["version"] = json!("2");
        }
        if module["reference"]["id"] == "scope" {
            module["dependencies"]["artifact"]["version"] = json!("2");
        }
        if module["reference"]["id"] == "skills" {
            module["dependencies"]["scope"]["version"] = json!("2");
        }
    }
    let second = post(&server, "/api/v1/import", next).await;
    let second = second["bundle"]["digest"].as_str().unwrap().to_owned();
    assert_ne!(first, second);
    let applied = post(
        &server,
        "/api/v1/apply",
        json!({"command_id":"scope-two","system":"native-capabilities","release":second,"expected_generation":1}),
    ).await;
    assert_eq!(applied["active"], json!({"generation":2,"release":second}));
    assert_eq!(
        pending(&server, "scope-pending-original").await,
        original_approval
    );
    approve_and_resume(&server, "scope-pending-original").await;
    assert_eq!(calls.lock().unwrap().len(), 1);
    assert_eq!(calls.lock().unwrap()[0]["file_path"], "src/lib.rs");
    post(
        &server,
        "/api/v1/runs",
        launch(&second, "scope-new-code", "chat"),
    )
    .await;
    assert_eq!(
        outcome(&server, "scope-new-code").await["execution"]["status"],
        "completed"
    );
    assert!(
        pending(&server, "scope-new-code")
            .await
            .as_array()
            .unwrap()
            .is_empty()
    );
    assert_eq!(calls.lock().unwrap().len(), 1);

    let applied = post(
        &server,
        "/api/v1/apply",
        json!({"command_id":"scope-rollback","system":"native-capabilities","release":first,"expected_generation":2}),
    ).await;
    assert_eq!(applied["active"], json!({"generation":3,"release":first}));
    post(
        &server,
        "/api/v1/runs",
        launch(&first, "scope-rolled-back", "chat"),
    )
    .await;
    assert_eq!(
        outcome(&server, "scope-rolled-back").await["execution"]["status"],
        "paused"
    );
    approve_and_resume(&server, "scope-rolled-back").await;
    assert_eq!(calls.lock().unwrap().len(), 2);
    assert!(
        calls
            .lock()
            .unwrap()
            .iter()
            .all(|body| body["file_path"] == "src/lib.rs")
    );
    assert_eq!(std::process::id(), pid);
    assert_eq!(binary_digest(), binary);
    stop.cancel();
    worker.await.unwrap();
}

#[tokio::test]
async fn declared_cwd_conflicts_stop_before_child_model_and_native_scope_cannot_grant_parent_permissions()
 {
    let requests = Arc::new(Mutex::new(Vec::<Value>::new()));
    let provider = serve(
        Router::new()
            .route("/v1/chat/completions", route_post(provider))
            .with_state(requests.clone()),
    )
    .await;
    let effects = Arc::new(AtomicUsize::new(0));
    let calls = effects.clone();
    let service = serve(Router::new().route(
        "/api/lookup",
        route_post(move || {
            let calls = calls.clone();
            async move {
                calls.fetch_add(1, Ordering::SeqCst);
                Json(json!({"unexpected":true}))
            }
        }),
    ))
    .await;
    let dir = tempfile::tempdir().unwrap();
    let host = resident(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let stop = CancellationToken::new();
    let worker_host = host.clone();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 1).await.unwrap() });
    for (id, allow, cwd, models) in [
        ("cwd-conflict", true, "/other-workspace", 1),
        ("cwd-inherit-conflict", true, "/other-workspace", 1),
        ("floor-denied", false, "/declared/workspace", 5),
    ] {
        let mut source = declared(&provider.url, &service.url, allow, cwd);
        if id == "cwd-inherit-conflict" {
            config(&mut source, "skills")["skills"][0]["allowed_tools"] = Value::Null;
        }
        let scope = quota(&host, source.clone(), id);
        let release = post(&server, "/api/v1/import", source).await;
        let before = requests.lock().unwrap().len();
        post(
            &server,
            "/api/v1/runs",
            launch(release["bundle"]["digest"].as_str().unwrap(), id, "chat"),
        )
        .await;
        let result = outcome(&server, id).await;
        assert_eq!(
            result["execution"]["status"],
            if id.starts_with("cwd-") {
                "failed"
            } else {
                "completed"
            },
            "{result}"
        );
        let observed = requests.lock().unwrap()[before..].to_vec();
        assert_eq!(observed.len(), models);
        if id.starts_with("cwd-") {
            assert!(
                observed
                    .iter()
                    .all(|request| request["model"] == "test-model")
            );
            assert!(
                result.to_string().contains("scope cwd conflicts"),
                "{}",
                result["execution"]["error"]
            );
        }
        assert_eq!(effects.load(Ordering::SeqCst), 0);
        assert!(pending(&server, id).await.as_array().unwrap().is_empty());
        let used = host.store().inspect(&scope).await.unwrap().unwrap().used;
        assert_eq!(used.model_calls, models as u64);
        assert_eq!(used.child_calls, 1);
    }
    stop.cancel();
    worker.await.unwrap();
}
