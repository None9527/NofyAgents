use super::*;
fn r(id: &str) -> Value {
    json!({"id":id,"version":"1"})
}
fn source(url: &str) -> Value {
    json!({"schema_version":1,"name":"recover-effect","modules":[
        {"reference":r("service"),"factory":"resource.http","config":{"base_url":format!("{url}/service/"),"methods":["POST"]}},
        {"reference":r("effect"),"factory":"tool.http_connected","config":{"contract":{"name":"effect"},"path":"effect","method":"POST"},"dependencies":{"connection":r("service")}}
    ],"programs":{"execute":{"kind":"workflow","input":{},"document":{
        "host":{"name":"effect-root"},"entry":r("main"),"tool_runtimes":[{"reference":r("tools"),"definition":{"name":"effects","tool_packs":[r("effect")]}}],"workflows":[{"reference":r("main"),"input_schema":true,"output_schema":true,
            "nodes":[{"id":"effect","input":{"from":"literal","value":{}},"action":{"kind":"tool","runtime":r("tools"),"tool":"effect"}}],"output":{"from":"node","node":"effect"}
        }]
    }}}})
}
#[tokio::test]
async fn uncertain_child_process() {
    let Ok(directory) = std::env::var("NOFY_UNCERTAIN_CHILD") else {
        return;
    };
    let url = std::env::var("NOFY_UNCERTAIN_SERVICE").unwrap();
    let registry = native::registry(Arc::new(Credentials(Arc::new(AtomicUsize::new(0))))).unwrap();
    let host = KernelHost::open(std::path::Path::new(&directory), registry.clone(), auth())
        .await
        .unwrap();
    let server = serve(host.router()).await;
    let release = post(&server, "/api/v1/import", source(&url)).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    post(&server, "/api/v1/runs", json!({"run_id":"uncertain-root","thread_id":"thread","system":"recover-effect","release":release,"program":"execute"})).await;
    let supervisor = nofy_agent_runtime::supervisor::RunSupervisor::new(host.store().clone())
        .with_lease_ttl(Duration::from_secs(2))
        .unwrap();
    tokio::spawn(async move {
        supervisor
            .execute_submitted(&registry, "uncertain-root")
            .await
            .unwrap()
    });
    tokio::time::timeout(Duration::from_secs(10), async {
        loop {
            let count: usize = reqwest::Client::new()
                .get(format!("{url}/count"))
                .send()
                .await
                .unwrap()
                .json()
                .await
                .unwrap();
            if count == 1 {
                break;
            }
            tokio::time::sleep(Duration::from_millis(10)).await;
        }
    })
    .await
    .unwrap();
    std::process::exit(97);
}
async fn recovery(server: &Serving) -> Value {
    let (status, page) = request(
        server,
        reqwest::Method::GET,
        "/api/v1/runs/uncertain-root/recovery?limit=1",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200, "{page}");
    page
}
#[tokio::test]
async fn operator_child_evidence_continues_original_workflow_after_real_process_exit_without_repeating_http_effect()
 {
    let calls = Arc::new(AtomicUsize::new(0));
    let finish_service = CancellationToken::new();
    let effects = calls.clone();
    let finish = finish_service.clone();
    let count = calls.clone();
    let service = serve(
        Router::new()
            .route(
                "/service/effect",
                route_post(move || {
                    let effects = effects.clone();
                    let finish = finish.clone();
                    async move {
                        effects.fetch_add(1, Ordering::SeqCst);
                        finish.cancelled().await;
                        Json(json!({"accepted":true}))
                    }
                }),
            )
            .route(
                "/count",
                axum::routing::get(move || {
                    let count = count.clone();
                    async move { Json(count.load(Ordering::SeqCst)) }
                }),
            ),
    )
    .await;
    let dir = tempfile::tempdir().unwrap();
    let directory = dir.path().to_owned();
    let url = service.url.clone();
    let output = tokio::task::spawn_blocking(move || {
        std::process::Command::new(std::env::current_exe().unwrap())
            .args([
                "--exact",
                "reconciliation::uncertain_child_process",
                "--nocapture",
            ])
            .env("NOFY_UNCERTAIN_CHILD", directory)
            .env("NOFY_UNCERTAIN_SERVICE", url)
            .output()
            .unwrap()
    })
    .await
    .unwrap();
    assert_eq!(
        output.status.code(),
        Some(97),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    // The crashed helper used a 2s root lease. Let that explicit lease expire.
    tokio::time::sleep(Duration::from_millis(2100)).await;
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker_host = host.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 2).await.unwrap() });
    let paused = outcome(&server, "uncertain-root").await;
    assert_eq!(paused["execution"]["status"], "paused");
    let (status, root) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/runs/uncertain-root/recovery/root",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200, "{root}");
    assert!(root["call"].is_object(), "{root}");
    post(&server,"/api/v1/actions",json!({"command_id":"reject-root-controller","run_id":"uncertain-root","command":{"kind":"reconcile_root_tool","receipt":{"model_sequence":root["model_sequence"],"call":root["call"],"result":{"forged":"skip workflow"},"is_error":false}}})).await;
    assert!(action_result(&server, "reject-root-controller").await["error"].is_string());
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    let marker = paused["children"]
        .as_array()
        .unwrap()
        .iter()
        .find(|c| c["kind"] == "workflow_tool")
        .unwrap()["run_id"]
        .clone();
    let page = recovery(&server).await;
    assert_eq!(page["targets"].as_array().unwrap().len(), 1, "{page}");
    let target = &page["targets"][0];
    assert_eq!(target["kind"], "tool_program");
    assert_eq!(target["call"]["name"], "effect");
    let receipt = json!({"child_run_id":target["run_id"],"model_sequence":target["model_sequence"],"call":target["call"],"result":{"accepted":true},"is_error":false});
    let command = json!({"command_id":"confirm-effect","run_id":"uncertain-root","command":{"kind":"reconcile_child","receipt":receipt}});
    let mut missing = command.clone();
    missing["command_id"] = json!("missing-epoch");
    missing["command"]["receipt"]
        .as_object_mut()
        .unwrap()
        .remove("model_sequence");
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/actions",
            ADMIN,
            missing
        )
        .await
        .0,
        422
    );
    for (id, field, value) in [
        ("foreign-child", "child_run_id", json!("unknown-child")),
        ("wrong-epoch", "model_sequence", json!(1)),
        ("graph-marker", "child_run_id", marker),
        (
            "wrong-call",
            "call",
            json!({"id":"changed","name":"effect","arguments":{}}),
        ),
    ] {
        let mut bad = command.clone();
        bad["command_id"] = json!(id);
        bad["command"]["receipt"][field] = value;
        post(&server, "/api/v1/actions", bad).await;
        assert!(action_result(&server, id).await["error"].is_string());
        assert_eq!(calls.load(Ordering::SeqCst), 1);
    }
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
    post(&server, "/api/v1/actions", command.clone()).await;
    let settled = action_result(&server, "confirm-effect").await;
    assert!(settled["error"].is_null(), "{settled}");
    assert_eq!(
        outcome(&server, "uncertain-root").await["execution"]["status"],
        "completed"
    );
    assert_eq!(post(&server, "/api/v1/actions", command).await, settled);
    assert!(
        recovery(&server).await["targets"]
            .as_array()
            .unwrap()
            .is_empty()
    );
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    finish_service.cancel();
    stop.cancel();
    worker.await.unwrap();
}
