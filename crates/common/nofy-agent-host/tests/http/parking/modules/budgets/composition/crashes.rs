use super::*;

fn source(url: &str, case: &str, raised: bool) -> Value {
    if case == "child" {
        children::source(url, raised)
    } else {
        terminal_source(url, case, raised)
    }
}

async fn start(
    host: &KernelHost,
    server: &Serving,
    url: &str,
    case: &str,
    raised: bool,
) -> BudgetScope {
    let doc = source(url, case, raised);
    let compiled = host
        .control()
        .prepare(serde_json::from_value(doc.clone()).unwrap())
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
    let publication = post(server, "/api/v1/import", doc).await;
    post(server,"/api/v1/runs",json!({"run_id":"root","thread_id":"thread","system":"model-evidence","release":publication["bundle"]["digest"],"program":"execute","input":{"text":"finish","attachments":[]}})).await;
    scope
}

#[tokio::test]
async fn composite_update_process() {
    let Ok(directory) = std::env::var("NOFY_COMPOSITE_STATE") else {
        return;
    };
    let url = std::env::var("NOFY_COMPOSITE_SERVICE").unwrap();
    let case = std::env::var("NOFY_COMPOSITE_CASE").unwrap();
    let applied = std::env::var("NOFY_COMPOSITE_APPLIED").unwrap() == "yes";
    let host = host(
        std::path::Path::new(&directory),
        Arc::new(AtomicUsize::new(0)),
    )
    .await;
    let server = serve(host.router()).await;
    let scope = start(&host, &server, &url, &case, false).await;
    let stop = CancellationToken::new();
    let stopped = stop.clone();
    let worker_host = host.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(stopped, 2).await.unwrap() });
    assert_eq!(
        outcome(&server, "root").await["execution"]["status"],
        "budget_exceeded"
    );
    let record = host
        .store()
        .execution_record("root")
        .await
        .unwrap()
        .unwrap();
    let Some(nofy_agent_runtime::RunOutcome::BudgetExceeded { state }) = record.outcome else {
        panic!("budget outcome")
    };
    let children = host.store().children("root").await.unwrap();
    let mut checkpoints = Vec::new();
    for child in &children {
        let key = child.checkpoint_key.clone().unwrap();
        checkpoints
            .push(json!({"key":key,"checkpoint":host.store().load(&key).await.unwrap().unwrap()}));
    }
    std::fs::write(std::path::Path::new(&directory).join("composite-before.json"),serde_json::to_vec(&json!({"scope":scope,"state":state,"budget":host.store().inspect(&scope).await.unwrap().unwrap(),"children":children,"checkpoints":checkpoints,"submission":content_digest(&host.store().execution_job("root").await.unwrap().unwrap().submission).unwrap()})).unwrap()).unwrap();
    post(
        &server,
        "/api/v1/actions",
        json!({"command_id":"park","run_id":"root","command":{"kind":"park"}}),
    )
    .await;
    assert!(action_result(&server, "park").await["error"].is_null());
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
    let publication = post(&server, "/api/v1/import", source(&url, &case, true)).await;
    post(&server,"/api/v1/actions",json!({"command_id":"raise","run_id":"root","command":{"kind":"update_modules","park_command_id":"park","expected_revision":0,"release":publication["bundle"]["digest"],"program":"execute","update":{"budget_limits":true}}})).await;
    if applied {
        let worker_host = host.clone();
        tokio::spawn(async move {
            worker_host
                .run_worker(CancellationToken::new(), 2)
                .await
                .unwrap()
        });
        let result = action_result(&server, "raise").await;
        assert!(result["error"].is_null(), "{result}");
    } else {
        assert!(host.store().live_execution("root").await.unwrap().is_none());
    }
    std::process::exit(if applied { 87 } else { 88 });
}

async fn crashed(directory: &std::path::Path, url: &str, case: &str, applied: bool, entry: &str) {
    let path = directory.to_owned();
    let url = url.to_owned();
    let case = case.to_owned();
    let entry = entry.to_owned();
    let output = tokio::task::spawn_blocking(move || {
        std::process::Command::new(std::env::current_exe().unwrap())
            .args(["--exact", &entry, "--nocapture"])
            .env("NOFY_COMPOSITE_STATE", path)
            .env("NOFY_COMPOSITE_SERVICE", url)
            .env("NOFY_COMPOSITE_CASE", case)
            .env("NOFY_COMPOSITE_APPLIED", if applied { "yes" } else { "no" })
            .output()
            .unwrap()
    })
    .await
    .unwrap();
    assert_eq!(
        output.status.code(),
        Some(if applied { 87 } else { 88 }),
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
}

async fn fixture(case: &str, unknown: bool) -> (Serving, Arc<[AtomicUsize; 3]>, CancellationToken) {
    let counts = Arc::new([
        AtomicUsize::new(0),
        AtomicUsize::new(0),
        AtomicUsize::new(0),
    ]);
    let models = counts.clone();
    let first = counts.clone();
    let last = counts.clone();
    let effects = counts.clone();
    let observed = counts.clone();
    let child = case == "child";
    let gate = CancellationToken::new();
    let pending = gate.clone();
    let service=serve(Router::new()
        .route("/v1/chat/completions",route_post(move |Json(body):Json<Value>| {let c=models.clone();async move{
            let worker=child && body["model"]=="worker-model";c[usize::from(worker)].fetch_add(1,Ordering::SeqCst);
            let model=if worker {"worker-model"} else {"test-model"};let done=body["messages"].as_array().unwrap().iter().any(|m|m["role"]=="tool");
            let frames=if !child || done {nofy_test_support::sse::chat_completion_events_exact(if child {"nested complete"} else {"business complete"},model)}
            else {nofy_test_support::sse::chat_completions_reasoning_then_tool_call_events("",if worker {"child-call"} else {"parent-call"},if worker {"effect"} else {"skill"},if worker {"{}"} else {"{\"skill\":\"review\",\"args\":\"continue\"}"},model).into_iter().map(|frame|axum::response::sse::Event::default().data(frame.data)).collect()};
            Sse::new(futures::stream::iter(frames.into_iter().map(Ok::<_,Infallible>)))
        }}))
        .route("/first",route_post(move || {let c=first.clone();async move{c[1].fetch_add(1,Ordering::SeqCst);Json(json!({"decision":"continue"}))}}))
        .route("/last",route_post(move || {let c=last.clone();let gate=pending.clone();async move{c[2].fetch_add(1,Ordering::SeqCst);if unknown {gate.cancelled().await;}Json(json!({"decision":"continue"}))}}))
        .route("/done",route_post(move || {let c=effects.clone();async move{c[2].fetch_add(1,Ordering::SeqCst);Json(json!({"once":true}))}}))
        .route("/count",axum::routing::get(move || {let c=observed.clone();async move{Json(json!({"last":c[2].load(Ordering::SeqCst)}))}}))
    ).await;
    (service, counts, gate)
}

#[tokio::test]
async fn nested_and_terminal_progress_survive_hard_exit_before_and_after_budget_commit() {
    for (case, applied) in [
        ("before_stop", false),
        ("turn_done", true),
        ("child", false),
        ("child", true),
    ] {
        let (service, counts, _) = fixture(case, false).await;
        let dir = tempfile::tempdir().unwrap();
        crashed(
            dir.path(),
            &service.url,
            case,
            applied,
            "parking::modules::budgets::composition::crashes::composite_update_process",
        )
        .await;
        assert_eq!(
            counts
                .iter()
                .map(|c| c.load(Ordering::SeqCst))
                .collect::<Vec<_>>(),
            if case == "child" {
                vec![1, 1, 1]
            } else {
                vec![1, 1, 0]
            }
        );
        let before: Value = serde_json::from_slice(
            &std::fs::read(dir.path().join("composite-before.json")).unwrap(),
        )
        .unwrap();
        let scope: BudgetScope = serde_json::from_value(before["scope"].clone()).unwrap();
        let old: nofy_agent_runtime::governance::BudgetSummary =
            serde_json::from_value(before["budget"].clone()).unwrap();
        let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
        let server = serve(host.router()).await;
        for item in before["checkpoints"].as_array().unwrap() {
            assert_eq!(
                serde_json::to_value(
                    host.store()
                        .load(item["key"].as_str().unwrap())
                        .await
                        .unwrap()
                        .unwrap()
                )
                .unwrap(),
                item["checkpoint"]
            );
        }
        let stop = CancellationToken::new();
        let stopped = stop.clone();
        let worker_host = host.clone();
        let worker = tokio::spawn(async move { worker_host.run_worker(stopped, 2).await.unwrap() });
        let updated = action_result_within(&server, "raise", Duration::from_secs(45)).await;
        assert!(updated["error"].is_null(), "{updated}");
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
            post(&server, "/api/v1/actions", updated["action"].clone()).await,
            updated
        );
        // A committed receipt can be observed before the dying owner releases
        // its 30-second fence. Recovery waits for expiry; it never steals it.
        let unpark_started = std::time::Instant::now();
        post(&server,"/api/v1/actions",json!({"command_id":"unpark","run_id":"root","command":{"kind":"unpark","park_command_id":"park"}})).await;
        assert!(
            action_result_within(&server, "unpark", Duration::from_secs(45)).await["error"]
                .is_null()
        );
        eprintln!(
            "composite unpark verified: case={case}, applied={applied}, elapsed_ms={}",
            unpark_started.elapsed().as_millis()
        );
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
            if case == "child" {
                "nested complete"
            } else {
                "business complete"
            },
            "{finished}"
        );
        assert_eq!(
            counts
                .iter()
                .map(|c| c.load(Ordering::SeqCst))
                .collect::<Vec<_>>(),
            if case == "child" {
                vec![2, 2, 1]
            } else {
                vec![1, 1, 1]
            }
        );
        let final_budget = host.store().inspect(&scope).await.unwrap().unwrap();
        assert_eq!(
            final_budget.used.model_calls,
            if case == "child" { 4 } else { 1 }
        );
        assert_eq!(final_budget.used.tool_calls, 2);
        assert_eq!(
            final_budget.reserved,
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
        if case == "child" {
            let children = host.store().children("root").await.unwrap();
            assert_eq!(children.len(), 1);
            assert_eq!(
                serde_json::to_value(&children[0].run_id).unwrap(),
                before["children"][0]["run_id"]
            );
            assert_eq!(children[0].status, "completed");
            assert_eq!(final_budget.used.child_calls, 1);
        }
        assert_eq!(
            post(&server, "/api/v1/actions", finished["action"].clone()).await,
            finished
        );
        stop.cancel();
        worker.await.unwrap();
        eprintln!("composite hard exit verified: case={case}, applied={applied}");
    }
}

#[tokio::test]
async fn unknown_terminal_effect_process() {
    let Ok(directory) = std::env::var("NOFY_COMPOSITE_STATE") else {
        return;
    };
    let url = std::env::var("NOFY_COMPOSITE_SERVICE").unwrap();
    let host = host(
        std::path::Path::new(&directory),
        Arc::new(AtomicUsize::new(0)),
    )
    .await;
    let server = serve(host.router()).await;
    let scope = start(&host, &server, &url, "before_stop", true).await;
    let registry = host
        .control()
        .prepare(serde_json::from_value(terminal_source(&url, "before_stop", true)).unwrap())
        .unwrap()
        .registry()
        .clone();
    let supervisor = nofy_agent_runtime::supervisor::RunSupervisor::new(host.store().clone())
        .with_lease_ttl(Duration::from_secs(2))
        .unwrap();
    tokio::spawn(async move {
        supervisor
            .execute_submitted(&registry, "root")
            .await
            .unwrap()
    });
    await_count(&url, "last", 1).await;
    std::fs::write(
        std::path::Path::new(&directory).join("unknown-before.json"),
        serde_json::to_vec(
            &json!({"scope":scope,"budget":host.store().inspect(&scope).await.unwrap().unwrap()}),
        )
        .unwrap(),
    )
    .unwrap();
    // The HTTP effect exists, while its response and both completion receipts do not.
    std::process::exit(88);
}

#[tokio::test]
async fn claimed_terminal_http_effect_after_hard_exit_stays_unknown_without_a_second_request() {
    let (service, counts, gate) = fixture("before_stop", true).await;
    let dir = tempfile::tempdir().unwrap();
    crashed(
        dir.path(),
        &service.url,
        "before_stop",
        false,
        "parking::modules::budgets::composition::crashes::unknown_terminal_effect_process",
    )
    .await;
    assert_eq!(
        counts
            .iter()
            .map(|c| c.load(Ordering::SeqCst))
            .collect::<Vec<_>>(),
        [1, 1, 1]
    );
    let before: Value =
        serde_json::from_slice(&std::fs::read(dir.path().join("unknown-before.json")).unwrap())
            .unwrap();
    let scope: BudgetScope = serde_json::from_value(before["scope"].clone()).unwrap();
    let old: nofy_agent_runtime::governance::BudgetSummary =
        serde_json::from_value(before["budget"].clone()).unwrap();
    assert_eq!(old.reserved.tool_calls, 1);
    // The exited owner's explicit two-second lease expires; the original run remains.
    tokio::time::sleep(Duration::from_millis(2100)).await;
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    post(
        &server,
        "/api/v1/actions",
        json!({"command_id":"resume","run_id":"root","command":{"kind":"resume"}}),
    )
    .await;
    let stop = CancellationToken::new();
    let stopped = stop.clone();
    let worker_host = host.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(stopped, 2).await.unwrap() });
    let result = action_result(&server, "resume").await;
    assert!(result["error"].is_null(), "{result}");
    assert_eq!(
        result["outcome"]["Paused"]["reason"]["kind"], "budget_uncertain",
        "{result}"
    );
    assert_eq!(
        counts
            .iter()
            .map(|c| c.load(Ordering::SeqCst))
            .collect::<Vec<_>>(),
        [1, 1, 1]
    );
    let after = host.store().inspect(&scope).await.unwrap().unwrap();
    assert_eq!(after.used, old.used);
    assert_eq!(after.reserved, old.reserved);
    assert_eq!(after.operation_count, old.operation_count);
    assert_eq!(
        post(&server, "/api/v1/actions", result["action"].clone()).await,
        result
    );
    gate.cancel();
    stop.cancel();
    worker.await.unwrap();
}
