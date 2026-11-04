use super::*;
#[path = "hook_recovery/bounded_identity.rs"]
mod bounded_identity;
use nofy_agent_runtime::{
    governance::{BudgetScope, BudgetStore},
    registry::{ModuleInstance, ModuleRef},
};

fn r(id: &str) -> Value {
    json!({"id":id,"version":"1"})
}
fn source(url: &str, unmetered: bool, event: &str, child: bool) -> Value {
    let mut doc = super::model_reconciliation::source(url, child, unmetered);
    if child && !unmetered {
        doc["modules"]
            .as_array_mut()
            .unwrap()
            .iter_mut()
            .find(|m| m["reference"] == r("quota"))
            .unwrap()["config"]["limits"] =
            json!({"max_model_calls":4,"max_tool_calls":8,"max_child_calls":8});
    }
    doc["modules"].as_array_mut().unwrap().extend([
        json!({"reference":r("close-tool"),"factory":"tool.http_connected","config":{"contract":{"name":"close_effect"},"path":"effect","method":"POST"},"dependencies":{"connection":r("service")}}),
        json!({"reference":r("close-handler"),"factory":"hook.executor","config":{"tool":"close_effect"},"dependencies":{"executor":r("close-tool")}}),
        json!({"reference":r("close-hook"),"factory":"hook.subscription","config":{"event":event,"timeout_ms":30000},"dependencies":{"handler":r("close-handler")}}),
    ]);
    if child {
        doc["programs"]["execute"]["document"]["host"]["scope_identity"] = json!("hashed_v1");
        doc["programs"]["execute"]["document"]["agents"][0]["definition"]["settings"]["scope_identity"] =
            json!("hashed_v1");
        if unmetered {
            doc["programs"]["execute"]["document"]["agents"][0]["definition"]["hooks"] =
                json!([r("close-hook")]);
        } else {
            doc["programs"]["execute"]["document"]["tool_runtimes"][0]["definition"]["hooks"] =
                json!([r("close-hook")]);
        }
    } else {
        doc["programs"]["execute"]["definition"]["hooks"] = json!([r("close-hook")]);
    }
    doc
}
async fn fixture(hold: bool, pause: bool) -> (Serving, Arc<[AtomicUsize; 3]>, CancellationToken) {
    let counts = Arc::new([
        AtomicUsize::new(0),
        AtomicUsize::new(0),
        AtomicUsize::new(0),
    ]);
    let model = counts.clone();
    let effect = counts.clone();
    let work = counts.clone();
    let observed = counts.clone();
    let gate = CancellationToken::new();
    let waiting = gate.clone();
    let service=serve(Router::new()
        .route("/v1/chat/completions",route_post(move||{let c=model.clone();async move {
            c[0].fetch_add(1,Ordering::SeqCst);
            Sse::new(futures::stream::iter(nofy_test_support::sse::chat_completion_events_exact("complete","test-model").into_iter().map(Ok::<_,Infallible>)))
        }}))
        .route("/effect",route_post(move||{let c=effect.clone();let gate=waiting.clone();async move {
            c[1].fetch_add(1,Ordering::SeqCst);if hold {gate.cancelled().await;}
            Json(if pause {json!({"decision":"pause","reason":{"kind":"external_gate"}})}else {json!({"decision":"continue"})})
        }}))
        .route("/done",route_post(move||{let c=work.clone();async move {c[2].fetch_add(1,Ordering::SeqCst);Json(json!({"work":true}))}}))
        .route("/count",axum::routing::get(move||{let c=observed.clone();async move {Json(json!({"models":c[0].load(Ordering::SeqCst),"effects":c[1].load(Ordering::SeqCst),"work":c[2].load(Ordering::SeqCst)}))}}))
    ).await;
    (service, counts, gate)
}
async fn page(server: &Serving) -> Value {
    let (status, value) = request(
        server,
        reqwest::Method::GET,
        "/api/v1/runs/root/recovery/hooks",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200, "{value}");
    value
}
async fn submit(
    host: &KernelHost,
    server: &Serving,
    url: &str,
    unmetered: bool,
    event: &str,
    child: bool,
) -> (
    nofy_agent_runtime::registry::ModuleRegistry,
    Option<BudgetScope>,
) {
    let doc = source(url, unmetered, event, child);
    let compiled = host
        .control()
        .prepare(serde_json::from_value(doc.clone()).unwrap())
        .unwrap();
    let scope = if unmetered {
        None
    } else {
        let reference = ModuleRef::new("quota", "1");
        let resolved = compiled.registry().resolve(&[reference.clone()]).unwrap();
        let ModuleInstance::Governance(profile) = &resolved.instances[&reference] else {
            panic!("quota")
        };
        Some(BudgetScope {
            root_run_id: "root".into(),
            identity: profile.identity().into(),
        })
    };
    let registry = compiled.registry().clone();
    let release = post(server, "/api/v1/import", doc).await["bundle"]["digest"].clone();
    let mut body = json!({"run_id":"root","thread_id":"thread","system":"model-evidence","release":release,"program":"execute"});
    if !child {
        body["input"] = json!({"text":"finish","attachments":[]});
    }
    post(server, "/api/v1/runs", body).await;
    (registry, scope)
}
async fn effect_started(url: &str) {
    tokio::time::timeout(Duration::from_secs(20), async {
        loop {
            let count: Value = reqwest::get(format!("{url}/count"))
                .await
                .unwrap()
                .json()
                .await
                .unwrap();
            if count["effects"] == 1 {
                break;
            }
            tokio::time::sleep(Duration::from_millis(10)).await;
        }
    })
    .await
    .unwrap();
}
fn values(counts: &[AtomicUsize; 3]) -> Vec<usize> {
    counts.iter().map(|n| n.load(Ordering::SeqCst)).collect()
}

#[tokio::test]
async fn hook_permission_pause_requires_original_approval_and_is_not_an_effect_target() {
    let (service, counts, _) = fixture(false, false).await;
    let directory = tempfile::tempdir().unwrap();
    let host = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let mut doc = source(&service.url, true, "before_model", false);
    doc["required_policies"] = json!([r("approval")]);
    doc["modules"]
        .as_array_mut()
        .unwrap()
        .push(json!({"reference":r("approval"),"factory":"policy.approval","config":{}}));
    let release = post(&server, "/api/v1/import", doc).await["bundle"]["digest"].clone();
    post(&server, "/api/v1/runs", json!({"run_id":"root","thread_id":"thread","system":"model-evidence","release":release,"program":"execute","input":{"text":"finish","attachments":[]}})).await;
    let stop = CancellationToken::new();
    let stopped = stop.clone();
    let worker_host = host.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(stopped, 2).await.unwrap() });
    assert_eq!(
        outcome(&server, "root").await["execution"]["status"],
        "paused"
    );
    assert_eq!(values(&counts), [0, 0, 0]);
    assert!(
        page(&server).await["targets"]
            .as_array()
            .unwrap()
            .is_empty()
    );
    let (status, approvals) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/runs/root/approvals",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200);
    assert_eq!(approvals.as_array().unwrap().len(), 1, "{approvals}");
    assert_eq!(approvals[0]["call"]["name"], "close_effect");
    let (status, _) = request(
        &server,
        reqwest::Method::POST,
        "/api/v1/runs/root/approvals",
        ADMIN,
        json!({"request":approvals[0],"allow":true}),
    )
    .await;
    assert_eq!(status, 204);
    post(
        &server,
        "/api/v1/actions",
        json!({"run_id":"root","command_id":"approve-hook","command":{"kind":"resume"}}),
    )
    .await;
    let result = action_result(&server, "approve-hook").await;
    assert!(result["error"].is_null(), "{result}");
    assert!(result["outcome"]["Completed"].is_object(), "{result}");
    assert_eq!(values(&counts), [1, 1, 0]);
    stop.cancel();
    worker.await.unwrap();
}

#[tokio::test]
async fn workflow_fact_hook_recovers_against_its_original_graph_checkpoint() {
    let (service, counts, gate) = fixture(true, false).await;
    let directory = tempfile::tempdir().unwrap();
    let host = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let mut doc = source(&service.url, false, "workflow_start", true);
    doc["programs"]["execute"]["document"]["tool_runtimes"][0]["definition"]
        .as_object_mut()
        .unwrap()
        .remove("hooks");
    doc["programs"]["execute"]["document"]["host"]["hooks"] = json!([r("close-hook")]);
    let registry = host
        .control()
        .prepare(serde_json::from_value(doc.clone()).unwrap())
        .unwrap()
        .registry()
        .clone();
    let release = post(&server, "/api/v1/import", doc).await["bundle"]["digest"].clone();
    post(&server, "/api/v1/runs", json!({"run_id":"root","thread_id":"thread","system":"model-evidence","release":release,"program":"execute"})).await;
    let supervisor = nofy_agent_runtime::supervisor::RunSupervisor::new(host.store().clone())
        .with_lease_ttl(Duration::from_secs(2))
        .unwrap();
    let mut running =
        tokio::spawn(async move { supervisor.execute_submitted(&registry, "root").await });
    tokio::select! {
        () = effect_started(&service.url) => {},
        result = &mut running => panic!("graph stopped before Hook dispatch: {result:?}"),
    }
    running.abort();
    let _ = running.await;
    assert_eq!(values(&counts), [0, 1, 0]);
    let target = page(&server).await;
    assert_eq!(target["targets"].as_array().unwrap().len(), 1, "{target}");
    assert_eq!(target["targets"][0]["event"]["name"], "workflow_start");
    post(&server, "/api/v1/actions", json!({"command_id":"graph-hook","run_id":"root","command":{"kind":"reconcile_hook","receipt":{"ticket":target["targets"][0]["ticket"],"resolution":{"kind":"decision","decision":{"decision":"continue"}}}}})).await;
    tokio::time::sleep(Duration::from_millis(2100)).await;
    let stop = CancellationToken::new();
    let stopped = stop.clone();
    let worker_host = host.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(stopped, 2).await.unwrap() });
    let done = action_result(&server, "graph-hook").await;
    assert!(done["error"].is_null(), "{done}");
    assert!(done["outcome"]["Completed"].is_object(), "{done}");
    assert_eq!(values(&counts), [1, 1, 1]);
    assert!(
        page(&server).await["targets"]
            .as_array()
            .unwrap()
            .is_empty()
    );
    gate.cancel();
    stop.cancel();
    worker.await.unwrap();
}

#[tokio::test]
async fn effect_exit_process() {
    let Ok(path) = std::env::var("NOFY_HOOK_RECOVERY_STATE") else {
        return;
    };
    let url = std::env::var("NOFY_HOOK_RECOVERY_SERVICE").unwrap();
    let unmetered = std::env::var("NOFY_HOOK_RECOVERY_UNMETERED").unwrap() == "yes";
    let host = host(std::path::Path::new(&path), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let (registry, _) = submit(&host, &server, &url, unmetered, "before_stop", false).await;
    let supervisor = nofy_agent_runtime::supervisor::RunSupervisor::new(host.store().clone())
        .with_lease_ttl(Duration::from_secs(2))
        .unwrap();
    tokio::spawn(async move {
        supervisor
            .execute_submitted(&registry, "root")
            .await
            .unwrap()
    });
    effect_started(&url).await;
    let view = page(&server).await;
    assert_eq!(view["targets"].as_array().unwrap().len(), 1, "{view}");
    std::fs::write(
        std::path::Path::new(&path).join("ticket.json"),
        serde_json::to_vec(&view["targets"][0]["ticket"]).unwrap(),
    )
    .unwrap();
    std::process::exit(76);
}

#[tokio::test]
async fn unknown_hook_effect_is_reconciled_after_real_exit_with_and_without_budget() {
    for unmetered in [false, true] {
        let (service, counts, gate) = fixture(true, false).await;
        let directory = tempfile::tempdir().unwrap();
        let path = directory.path().to_owned();
        let url = service.url.clone();
        let output = tokio::task::spawn_blocking(move || {
            std::process::Command::new(std::env::current_exe().unwrap())
                .args([
                    "--exact",
                    "hook_recovery::effect_exit_process",
                    "--nocapture",
                ])
                .env("NOFY_HOOK_RECOVERY_STATE", path)
                .env("NOFY_HOOK_RECOVERY_SERVICE", url)
                .env(
                    "NOFY_HOOK_RECOVERY_UNMETERED",
                    if unmetered { "yes" } else { "no" },
                )
                .output()
                .unwrap()
        })
        .await
        .unwrap();
        assert_eq!(
            output.status.code(),
            Some(76),
            "{}{}",
            String::from_utf8_lossy(&output.stdout),
            String::from_utf8_lossy(&output.stderr)
        );
        assert_eq!(values(&counts), [1, 1, 0]);
        let host = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
        let server = serve(host.router()).await;
        let target = page(&server).await;
        let ticket = target["targets"][0]["ticket"].clone();
        assert_eq!(ticket["kind"], "effect");
        assert_eq!(
            ticket,
            serde_json::from_slice::<Value>(
                &std::fs::read(directory.path().join("ticket.json")).unwrap()
            )
            .unwrap()
        );
        let before = host
            .store()
            .execution_record("root")
            .await
            .unwrap()
            .unwrap();
        let scope = if unmetered {
            None
        } else {
            let doc = source(&service.url, false, "before_stop", false);
            let compiled = host
                .control()
                .prepare(serde_json::from_value(doc).unwrap())
                .unwrap();
            let reference = ModuleRef::new("quota", "1");
            let resolved = compiled.registry().resolve(&[reference.clone()]).unwrap();
            let ModuleInstance::Governance(profile) = &resolved.instances[&reference] else {
                panic!("quota")
            };
            Some(BudgetScope {
                root_run_id: "root".into(),
                identity: profile.identity().into(),
            })
        };
        if let Some(scope) = &scope {
            let budget = host.store().inspect(scope).await.unwrap().unwrap();
            assert_eq!(budget.used.tool_calls, 0);
            assert_eq!(budget.reserved.tool_calls, 1);
        }
        let command = json!({"command_id":"resolve","run_id":"root","command":{"kind":"reconcile_hook","receipt":{"ticket":ticket,"resolution":{"kind":"decision","decision":{"decision":"continue"}}}}});
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
        let accepted = post(&server, "/api/v1/actions", command.clone()).await;
        assert!(!accepted["finished"].as_bool().unwrap());
        tokio::time::sleep(Duration::from_millis(2100)).await;
        let stop = CancellationToken::new();
        let stopped = stop.clone();
        let worker_host = host.clone();
        let worker = tokio::spawn(async move { worker_host.run_worker(stopped, 2).await.unwrap() });
        let finished = action_result(&server, "resolve").await;
        assert!(finished["error"].is_null(), "{finished}");
        assert!(finished["outcome"]["Completed"].is_object(), "{finished}");
        assert_eq!(values(&counts), [1, 1, 0]);
        assert!(
            page(&server).await["targets"]
                .as_array()
                .unwrap()
                .is_empty()
        );
        assert_eq!(post(&server, "/api/v1/actions", command).await, finished);
        let current = host
            .store()
            .execution_record("root")
            .await
            .unwrap()
            .unwrap();
        assert_eq!(current.thread_id, before.thread_id);
        assert_eq!(current.composition, before.composition);
        if let Some(scope) = scope {
            let budget = host.store().inspect(&scope).await.unwrap().unwrap();
            assert_eq!(budget.used.tool_calls, 1);
            assert_eq!(budget.reserved.tool_calls, 0);
            assert_eq!(budget.used.model_calls, 1);
        }
        let events = host.store().events("root", 0, 100).await.unwrap();
        assert!(
            serde_json::to_value(&events)
                .unwrap()
                .to_string()
                .contains("reconciled")
        );
        gate.cancel();
        stop.cancel();
        worker.await.unwrap();
    }
}

#[tokio::test]
async fn known_hook_gate_keeps_its_tool_receipt_and_does_not_repeat_http() {
    for unmetered in [false, true] {
        let (service, counts, _) = fixture(false, true).await;
        let directory = tempfile::tempdir().unwrap();
        let host = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
        let server = serve(host.router()).await;
        let (_, scope) = submit(
            &host,
            &server,
            &service.url,
            unmetered,
            "before_stop",
            false,
        )
        .await;
        let stop = CancellationToken::new();
        let stopped = stop.clone();
        let worker_host = host.clone();
        let worker = tokio::spawn(async move { worker_host.run_worker(stopped, 2).await.unwrap() });
        assert_eq!(
            outcome(&server, "root").await["execution"]["status"],
            "paused"
        );
        let target = page(&server).await;
        assert_eq!(target["targets"][0]["ticket"]["kind"], "gate", "{target}");
        let before = if let Some(scope) = &scope {
            Some(host.store().inspect(scope).await.unwrap().unwrap())
        } else {
            None
        };
        post(&server,"/api/v1/actions",json!({"command_id":"gate","run_id":"root","command":{"kind":"reconcile_hook","receipt":{"ticket":target["targets"][0]["ticket"],"resolution":{"kind":"decision","decision":{"decision":"continue"}}}}})).await;
        let done = action_result(&server, "gate").await;
        assert!(done["error"].is_null(), "{done}");
        assert!(done["outcome"]["Completed"].is_object(), "{done}");
        assert_eq!(values(&counts), [1, 1, 0]);
        if let (Some(scope), Some(before)) = (scope, before) {
            let after = host.store().inspect(&scope).await.unwrap().unwrap();
            assert_eq!(after.used, before.used);
            assert_eq!(after.reserved, before.reserved);
            assert_eq!(after.operation_count, before.operation_count);
        }
        stop.cancel();
        worker.await.unwrap();
    }
}

#[tokio::test]
async fn original_child_hook_effect_settles_and_resumes_its_workflow_without_new_model_or_http() {
    // Cover a governed Tool leaf and an unmetered Agent leaf on the same
    // ancestor recovery path. Already completed work must remain committed.
    for unmetered in [false, true] {
        let (service, counts, gate) = fixture(true, false).await;
        let directory = tempfile::tempdir().unwrap();
        let host = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
        let server = serve(host.router()).await;
        let (registry, scope) =
            submit(&host, &server, &service.url, unmetered, "before_stop", true).await;
        let supervisor = nofy_agent_runtime::supervisor::RunSupervisor::new(host.store().clone())
            .with_lease_ttl(Duration::from_secs(2))
            .unwrap();
        let mut running =
            tokio::spawn(async move { supervisor.execute_submitted(&registry, "root").await });
        tokio::select! {
            () = effect_started(&service.url) => {},
            result = &mut running => panic!("child stopped before Hook dispatch: {result:?}; child identity sizes: {:?}; events: {:?}", host.store().children("root").await.unwrap().iter().map(|c| (&c.agent_name, c.composition.len(), c.run_id.len(), c.thread_id.len())).collect::<Vec<_>>(), host.store().events("root", 0, 100).await.unwrap()),
        }
        running.abort();
        let _ = running.await;
        let target = page(&server).await;
        if target["targets"].as_array().unwrap().is_empty() {
            panic!(
                "missing child target; preserved state {}",
                directory.keep().display()
            );
        }
        assert_eq!(target["targets"].as_array().unwrap().len(), 1, "{target}");
        assert_ne!(target["targets"][0]["event"]["scope"]["run_id"], "root");
        let before = host.store().children("root").await.unwrap();
        post(&server,"/api/v1/actions",json!({"command_id":"child-hook","run_id":"root","command":{"kind":"reconcile_hook","receipt":{"ticket":target["targets"][0]["ticket"],"resolution":{"kind":"decision","decision":{"decision":"continue"}}}}})).await;
        tokio::time::sleep(Duration::from_millis(2100)).await;
        let stop = CancellationToken::new();
        let stopped = stop.clone();
        let worker_host = host.clone();
        let worker = tokio::spawn(async move { worker_host.run_worker(stopped, 2).await.unwrap() });
        let done = action_result(&server, "child-hook").await;
        assert!(done["error"].is_null(), "{done}");
        assert!(done["outcome"]["Completed"].is_object(), "{done}");
        assert_eq!(values(&counts), [1, 1, 1]);
        let after = host.store().children("root").await.unwrap();
        for original in before {
            let restored = after
                .iter()
                .find(|child| child.run_id == original.run_id)
                .expect("original child retained");
            assert_eq!(restored.thread_id, original.thread_id);
            assert_eq!(restored.composition, original.composition);
            assert_eq!(restored.checkpoint_key, original.checkpoint_key);
        }
        if let Some(scope) = scope {
            let budget = host.store().inspect(&scope).await.unwrap().unwrap();
            assert_eq!(budget.reserved, Default::default());
            assert_eq!(budget.used.model_calls, 1);
        }
        gate.cancel();
        stop.cancel();
        worker.await.unwrap();
    }
}
