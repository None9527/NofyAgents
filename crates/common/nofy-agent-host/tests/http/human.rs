use super::*;
pub(super) fn r(id: &str) -> Value {
    json!({"id":id,"version":"1"})
}
pub(super) fn source(url: &str) -> Value {
    let graph = json!({"host":{"name":"review-host"},"entry":r("review"),"tool_runtimes":[{"reference":r("effects"),"definition":{"name":"effects","tool_packs":[r("effect")]}}],"workflows":[{
        "reference":r("review"),"input_schema":{"type":"object","required":["question"],"properties":{"question":{"type":"string"}},"additionalProperties":false},"output_schema":{"type":"boolean"},
        "nodes":[
            {"id":"before","input":{"from":"literal","value":{}},"action":{"kind":"tool","runtime":r("effects"),"tool":"effect"}},
            {"id":"human","needs":["before"],"input":{"from":"input"},"action":{"kind":"human","response_schema":{"type":"boolean"}}},
            {"id":"after","needs":["human"],"input":{"from":"literal","value":{}},"action":{"kind":"tool","runtime":r("effects"),"tool":"effect"}}
        ],"output":{"from":"node","node":"human"}
    }]});
    json!({"schema_version":1,"name":"human-system","modules":[
        {"reference":r("connection"),"factory":"resource.http","config":{"base_url":format!("{url}/service/"),"methods":["POST"]}},
        {"reference":r("effect"),"factory":"tool.http_connected","config":{"contract":{"name":"effect"},"path":"effect","method":"POST"},"dependencies":{"connection":r("connection")}},
        {"reference":r("review-resource"),"factory":"resource.workflow","config":{"document":graph,"bindings":{"effects":"tool_pack"}},"dependencies":{"effects":r("effect")}},
        {"reference":r("review-tool"),"factory":"tool.workflow_connected","config":{"name":"review"},"dependencies":{"workflow":r("review-resource")}}
    ],"programs":{
        "direct":{"kind":"workflow","document":graph,"input":{"question":"continue"}},
        "module":{"kind":"tool","definition":{"name":"review-program","tool_packs":[r("review-tool")]},"call":{"id":"review-call","name":"review","arguments":{"input":{"question":"continue"}}}}
    }})
}
pub(super) async fn effect_service(calls: Arc<AtomicUsize>) -> Serving {
    serve(Router::new().route(
        "/service/effect",
        route_post(move || {
            let calls = calls.clone();
            async move { Json(json!({"effect":calls.fetch_add(1, Ordering::SeqCst)+1})) }
        }),
    ))
    .await
}
#[tokio::test]
async fn nested_resource_path_reaches_only_the_matching_frozen_human_graph() {
    let calls = Arc::new(AtomicUsize::new(0));
    let service = effect_service(calls.clone()).await;
    let mut source = source(&service.url);
    let outer = json!({"host":{"name":"outer-host"},"entry":r("outer"),"tool_runtimes":[{"reference":r("tools"),"definition":{"name":"inner-review","tool_packs":[r("review-tool")]}}],"workflows":[{
        "reference":r("outer"),"input_schema":{"type":"object"},"output_schema":true,"nodes":[{"id":"inner","action":{"kind":"tool","runtime":r("tools"),"tool":"review"},"input":{"from":"object","fields":{"input":{"from":"input"}}}}],"output":{"from":"node","node":"inner"}
    }]});
    source["modules"].as_array_mut().unwrap().extend([
        json!({"reference":r("outer-resource"),"factory":"resource.workflow","config":{"document":outer,"bindings":{"review":"tool_pack"}},"dependencies":{"review":r("review-tool")}}),
        json!({"reference":r("outer-tool"),"factory":"tool.workflow_connected","config":{"name":"outer_review"},"dependencies":{"workflow":r("outer-resource")}}),
    ]);
    source["programs"]["nested"] = json!({"kind":"tool","definition":{"name":"nested-review","tool_packs":[r("outer-tool")]},"call":{"id":"outer-review-call","name":"outer_review","arguments":{"input":{"question":"continue"}}}});
    let dir = tempfile::tempdir().unwrap();
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let release = post(&server, "/api/v1/import", source).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { host.run_worker(worker_stop, 2).await.unwrap() });
    post(&server, "/api/v1/runs", run(&release, "nested", "nested")).await;
    let target = target(&server, "nested").await;
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    post(
        &server,
        "/api/v1/actions",
        command(
            "wrong-level",
            "nested",
            &target,
            json!([r("outer-resource")]),
        ),
    )
    .await;
    assert!(action_result(&server, "wrong-level").await["error"].is_string());
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    post(
        &server,
        "/api/v1/actions",
        command(
            "nested-answer",
            "nested",
            &target,
            json!([r("outer-resource"), r("review-resource")]),
        ),
    )
    .await;
    let receipt = action_result(&server, "nested-answer").await;
    assert!(receipt["error"].is_null(), "{receipt}");
    assert_eq!(
        outcome(&server, "nested").await["execution"]["status"],
        "completed"
    );
    assert_eq!(calls.load(Ordering::SeqCst), 2);
    stop.cancel();
    worker.await.unwrap();
}
pub(super) fn run(release: &str, id: &str, program: &str) -> Value {
    json!({"run_id":id,"thread_id":id,"system":"human-system","release":release,"program":program})
}
pub(super) fn command(id: &str, root: &str, target: &str, path: Value) -> Value {
    json!({"command_id":id,"run_id":root,"command":{"kind":"human","target_run_id":target,"workflow_path":path,"expected_request":{"question":"continue"},"value":true}})
}
pub(super) async fn target(server: &Serving, root: &str) -> String {
    let state = outcome(server, root).await;
    assert_eq!(state["execution"]["status"], "paused");
    state["children"]
        .as_array()
        .unwrap()
        .iter()
        .find(|child| child["kind"] == "workflow_human")
        .unwrap()["run_id"]
        .as_str()
        .unwrap()
        .into()
}
#[tokio::test]
async fn human_commands_bind_frozen_root_or_resource_and_preserve_completed_http_effects() {
    let calls = Arc::new(AtomicUsize::new(0));
    let service = effect_service(calls.clone()).await;
    let dir = tempfile::tempdir().unwrap();
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let release = post(&server, "/api/v1/import", source(&service.url)).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { host.run_worker(worker_stop, 3).await.unwrap() });
    post(&server, "/api/v1/runs", run(&release, "direct", "direct")).await;
    let direct = target(&server, "direct").await;
    post(&server, "/api/v1/runs", run(&release, "module", "module")).await;
    let module = target(&server, "module").await;
    assert_eq!(calls.load(Ordering::SeqCst), 2);
    let mut wrong_request = command("wrong-request", "direct", &direct, json!([]));
    wrong_request["command"]["expected_request"] = json!({"question":"changed"});
    let mut wrong_value = command("wrong-value", "direct", &direct, json!([]));
    wrong_value["command"]["value"] = json!("wrong");
    for body in [
        wrong_request,
        wrong_value,
        command("wrong-root", "direct", &module, json!([])),
        command("wrong-path", "module", &module, json!([r("connection")])),
        command(
            "missing-path",
            "module",
            &module,
            json!([r("not-in-snapshot")]),
        ),
    ] {
        post(&server, "/api/v1/actions", body.clone()).await;
        let receipt = action_result(&server, body["command_id"].as_str().unwrap()).await;
        assert!(receipt["error"].is_string(), "{receipt}");
        assert!(receipt["outcome"].is_null());
        assert_eq!(calls.load(Ordering::SeqCst), 2);
    }
    for (root, target, path) in [
        ("direct", direct, json!([])),
        ("module", module, json!([r("review-resource")])),
    ] {
        let body = command(&format!("respond-{root}"), root, &target, path);
        assert_eq!(
            request(
                &server,
                reqwest::Method::POST,
                "/api/v1/actions",
                VIEW,
                body.clone()
            )
            .await
            .0,
            403
        );
        post(&server, "/api/v1/actions", body.clone()).await;
        let receipt = action_result(&server, body["command_id"].as_str().unwrap()).await;
        assert!(receipt["error"].is_null(), "{receipt}");
        assert_eq!(
            outcome(&server, root).await["execution"]["status"],
            "completed"
        );
        assert_eq!(
            post(&server, "/api/v1/actions", body.clone()).await,
            receipt
        );
        let mut changed = body.clone();
        changed["command"]["value"] = json!(false);
        assert_eq!(
            request(
                &server,
                reqwest::Method::POST,
                "/api/v1/actions",
                ADMIN,
                changed
            )
            .await
            .0,
            409
        );
        let mut newer = body;
        newer["command_id"] = json!(format!("new-response-{root}"));
        post(&server, "/api/v1/actions", newer.clone()).await;
        assert!(
            action_result(&server, newer["command_id"].as_str().unwrap()).await["error"]
                .is_string()
        );
    }
    assert_eq!(calls.load(Ordering::SeqCst), 4);
    stop.cancel();
    worker.await.unwrap();
}
#[tokio::test]
async fn human_accept_then_exit_child() {
    let Ok(directory) = std::env::var("NOFY_HUMAN_ACCEPT_CHILD") else {
        return;
    };
    let url = std::env::var("NOFY_HUMAN_SERVICE").unwrap();
    let registry = native::registry(Arc::new(Credentials(Arc::new(AtomicUsize::new(0))))).unwrap();
    let host = KernelHost::open(std::path::Path::new(&directory), registry.clone(), auth())
        .await
        .unwrap();
    let server = serve(host.router()).await;
    let release = post(&server, "/api/v1/import", source(&url)).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    post(
        &server,
        "/api/v1/runs",
        run(&release, "restart-human", "module"),
    )
    .await;
    nofy_agent_runtime::supervisor::RunSupervisor::new(host.store().clone())
        .execute_submitted(&registry, "restart-human")
        .await
        .unwrap();
    let target = target(&server, "restart-human").await;
    let body = command(
        "respond-after-restart",
        "restart-human",
        &target,
        json!([r("review-resource")]),
    );
    assert_eq!(
        post(&server, "/api/v1/actions", body.clone()).await["finished"],
        false
    );
    use std::io::Write;
    let mut file =
        std::fs::File::create(std::path::Path::new(&directory).join("human-action.json")).unwrap();
    file.write_all(&serde_json::to_vec(&body).unwrap()).unwrap();
    file.sync_all().unwrap();
    std::process::exit(97);
}
#[tokio::test]
async fn human_acceptance_survives_actual_process_exit_and_continues_only_remaining_effect() {
    let calls = Arc::new(AtomicUsize::new(0));
    let service = effect_service(calls.clone()).await;
    let dir = tempfile::tempdir().unwrap();
    let directory = dir.path().to_owned();
    let url = service.url.clone();
    let output = tokio::task::spawn_blocking(move || {
        std::process::Command::new(std::env::current_exe().unwrap())
            .args([
                "--exact",
                "human::human_accept_then_exit_child",
                "--nocapture",
            ])
            .env("NOFY_HUMAN_ACCEPT_CHILD", directory)
            .env("NOFY_HUMAN_SERVICE", url)
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
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { host.run_worker(worker_stop, 2).await.unwrap() });
    let receipt = action_result(&server, "respond-after-restart").await;
    assert!(receipt["error"].is_null(), "{receipt}");
    assert_eq!(
        outcome(&server, "restart-human").await["execution"]["status"],
        "completed"
    );
    let body =
        serde_json::from_slice(&std::fs::read(dir.path().join("human-action.json")).unwrap())
            .unwrap();
    assert_eq!(post(&server, "/api/v1/actions", body).await, receipt);
    assert_eq!(calls.load(Ordering::SeqCst), 2);
    stop.cancel();
    worker.await.unwrap();
}
