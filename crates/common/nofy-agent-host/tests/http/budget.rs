use super::*;
use nofy_agent_runtime::{
    governance::{BudgetScope, BudgetStore},
    registry::{ModuleInstance, ModuleRef},
};
#[tokio::test]
async fn single_file_budget_is_portable_and_shared_workflow_limits_survive_resume() {
    let calls = Arc::new(AtomicUsize::new(0));
    let effects = calls.clone();
    let service = serve(Router::new().route(
        "/service/compute",
        route_post(move || {
            let effects = effects.clone();
            async move {
                effects.fetch_add(1, Ordering::SeqCst);
                Json(json!({"result":14}))
            }
        }),
    ))
    .await;
    let dir = tempfile::tempdir().unwrap();
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let mut source: Value =
        serde_json::from_str(include_str!("../../examples/budget-system.json")).unwrap();
    source["modules"][2] = json!({"reference":{"id":"compute","version":"1"},"factory":"tool.http_connected","config":{"contract":{"name":"compute"},"path":"compute","method":"POST"},"dependencies":{"connection":{"id":"connection","version":"1"}}});
    source["modules"].as_array_mut().unwrap().push(json!({"reference":{"id":"connection","version":"1"},"factory":"resource.http","config":{"base_url":format!("{}/service/",service.url),"methods":["POST"]}}));
    let prepared = host
        .control()
        .prepare(serde_json::from_value(source.clone()).unwrap())
        .unwrap();
    let resolved = prepared
        .registry()
        .resolve(&[ModuleRef::new("quota", "1")])
        .unwrap();
    let ModuleInstance::Governance(profile) = &resolved.instances[&ModuleRef::new("quota", "1")]
    else {
        panic!("quota")
    };
    let identity = profile.identity().to_owned();
    let scope = |root: &str| BudgetScope {
        root_run_id: root.into(),
        identity: identity.clone(),
    };
    assert!(
        host.store()
            .inspect(&scope("single"))
            .await
            .unwrap()
            .is_none()
    );
    assert!(
        !serde_json::to_string(&prepared.bundle)
            .unwrap()
            .contains(dir.path().to_str().unwrap())
    );
    let bundle = post(&server, "/api/v1/validate", source).await;
    let release = post(&server, "/api/v1/import", bundle.clone()).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker_host = host.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 2).await.unwrap() });
    let run = |root: &str, program: &str| json!({"run_id":root,"thread_id":root,"system":"portable-budget","release":release,"program":program});
    post(&server, "/api/v1/runs", run("single", "compute")).await;
    assert_eq!(
        outcome(&server, "single").await["execution"]["status"],
        "completed"
    );
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    assert_eq!(
        host.store()
            .inspect(&scope("single"))
            .await
            .unwrap()
            .unwrap()
            .used
            .tool_calls,
        1
    );
    post(&server, "/api/v1/runs", run("limited", "limited_flow")).await;
    assert_eq!(
        outcome(&server, "limited").await["execution"]["status"],
        "budget_exceeded"
    );
    assert_eq!(calls.load(Ordering::SeqCst), 2);
    let before = host
        .store()
        .inspect(&scope("limited"))
        .await
        .unwrap()
        .unwrap();
    assert_eq!(before.used.tool_calls + before.reserved.tool_calls, 2);
    post(
        &server,
        "/api/v1/actions",
        json!({"command_id":"resume-limited","run_id":"limited","command":{"kind":"resume"}}),
    )
    .await;
    let receipt = action_result(&server, "resume-limited").await;
    assert!(receipt["error"].is_null(), "{receipt}");
    assert_eq!(calls.load(Ordering::SeqCst), 2);
    let after = host
        .store()
        .inspect(&scope("limited"))
        .await
        .unwrap()
        .unwrap();
    assert_eq!(before.used, after.used);
    assert_eq!(before.reserved, after.reserved);
    let target_dir = tempfile::tempdir().unwrap();
    let target = super::host(target_dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let target_server = serve(target.router()).await;
    assert_eq!(
        post(&target_server, "/api/v1/import", bundle).await["bundle"]["digest"],
        release
    );
    assert!(
        target
            .store()
            .inspect(&scope("single"))
            .await
            .unwrap()
            .is_none()
    );
    post(&target_server, "/api/v1/runs", run("migrated", "compute")).await;
    let target_stop = CancellationToken::new();
    let worker_stop = target_stop.clone();
    let target_worker =
        tokio::spawn(async move { target.run_worker(worker_stop, 2).await.unwrap() });
    assert_eq!(
        outcome(&target_server, "migrated").await["execution"]["status"],
        "completed"
    );
    assert_eq!(calls.load(Ordering::SeqCst), 3);
    stop.cancel();
    target_stop.cancel();
    worker.await.unwrap();
    target_worker.await.unwrap();
}
