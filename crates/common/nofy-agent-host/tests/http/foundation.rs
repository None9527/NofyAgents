//! Exercise the shipped source packages, their real HTTP effects and Human API.
use super::*;
use nofy_agent_project::{FactoryKinds, Source, build, repository::*};

fn package_system(root: &std::path::Path, service: &str) -> Value {
    let store = ModuleStore::open(&root.join("library")).unwrap();
    let mut repo = store
        .put("foundation", None, RepositoryOrigin::Managed)
        .unwrap();
    let packages =
        std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../modules/agent-foundation");
    let kinds: FactoryKinds = [
        ("resource.workflow".into(), "resource".into()),
        ("tool.workflow_connected".into(), "tool_pack".into()),
        ("resource.http".into(), "resource".into()),
        ("tool.http_connected".into(), "tool_pack".into()),
    ]
    .into();
    let mut source = Source::empty("unused", "foundation-system").unwrap();
    let modules = json!([
        {"reference":{"$module":"http"},"factory":"resource.http","config":{"base_url":format!("{service}/effects/"),"methods":["POST"]}},
        {"reference":{"$module":"normal"},"factory":"tool.http_connected","config":{"contract":{"name":"normal"},"method":"POST","path":"normal"},"dependencies":{"connection":{"$module":"http"}}},
        {"reference":{"$module":"elevated"},"factory":"tool.http_connected","config":{"contract":{"name":"elevated"},"method":"POST","path":"elevated"},"dependencies":{"connection":{"$module":"http"}}}
    ]);
    source.put_json(&source.declaration.clone(), &json!({"schema_version":1,"name":"foundation-system","modules":modules,"programs":{
        "unused":{"kind":"agent","definition":{"schema_version":1,"name":"unused"}},
        "ask":{"kind":"tool","definition":{"name":"ask","tool_packs":[{"$module":"ask.tool"}]},"call":{"id":"ask-call","name":"ask_user","arguments":{"input":{"question":"Choose a branch","options":["A","B"]}}}},
        "escalate":{"kind":"tool","definition":{"name":"escalate","tool_packs":[{"$module":"escalate.tool"}]},"call":{"id":"escalate-call","name":"execution_escalation","arguments":{"input":{"fail":true}}}},
        "success":{"kind":"tool","definition":{"name":"success","tool_packs":[{"$module":"escalate.tool"}]},"call":{"id":"success-call","name":"execution_escalation","arguments":{"input":{"fail":false}}}}
    }})).unwrap();
    for (name, alias, input) in [
        ("ask-user", "ask", json!({})),
        (
            "execution-escalation",
            "escalate",
            json!({"parameters":{"normal_tool":"normal","elevated_tool":"elevated"},"bindings":{"normal":"normal","elevated":"elevated"}}),
        ),
    ] {
        let (next, package) = store
            .publish(
                "foundation",
                &repo.revision,
                load_package_directory(&packages.join(name)).unwrap(),
            )
            .unwrap();
        repo = next;
        let mut args = input;
        args["alias"] = json!(alias);
        args["agent"] = json!("unused");
        use_package(&mut source, &package, &args, &kinds).unwrap();
    }
    // Packages are assembled against a source Agent; these executions use
    // Tool roots so Human and escalation behavior needs no model substitute.
    let mut declaration = source.json(&source.declaration).unwrap();
    declaration["programs"]
        .as_object_mut()
        .unwrap()
        .remove("unused");
    source
        .put_json(&source.declaration.clone(), &declaration)
        .unwrap();
    let built = build(&store.hydrate(&source).unwrap(), &kinds).unwrap();
    serde_json::from_str::<Value>(built["deployment_json"].as_str().unwrap()).unwrap()["system"]
        .clone()
}
async fn answer(server: &Serving, root: &str, value: Value) -> Value {
    let recovery = read_humans(server, root).await;
    assert_eq!(
        recovery["targets"].as_array().unwrap().len(),
        1,
        "{recovery}"
    );
    let target = &recovery["targets"][0];
    let mut command = target["command"].clone();
    assert_eq!(command["kind"], "human");
    assert_eq!(command["workflow_path"].as_array().unwrap().len(), 1);
    assert!(!command["expected_request"].is_null());
    let validator = jsonschema_for_answer(&target["response_schema"], &value);
    assert!(validator);
    command["value"] = value;
    let id = format!("answer-{root}");
    let action = json!({"run_id":root,"command_id":id,"command":command});
    post(server, "/api/v1/actions", action.clone()).await;
    let receipt = action_result(server, &id).await;
    assert!(receipt["error"].is_null(), "{receipt}");
    assert_eq!(post(server, "/api/v1/actions", action).await, receipt);
    assert!(
        read_humans(server, root).await["targets"]
            .as_array()
            .unwrap()
            .is_empty()
    );
    outcome(server, root).await
}
async fn read_humans(server: &Serving, root: &str) -> Value {
    let (status, body) = request(
        server,
        reqwest::Method::GET,
        &format!("/api/v1/runs/{root}/recovery/humans"),
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200, "{body}");
    body
}
// Use the same production JSON validator as compilation, not a test substitute.
fn jsonschema_for_answer(schema: &Value, value: &Value) -> bool {
    nofy_agent_runtime::settings::validate_json_value(schema, value).is_ok()
}
#[tokio::test]
async fn shipped_human_and_escalation_packages_resume_only_remaining_real_effects() {
    let narrow = Arc::new(AtomicUsize::new(0));
    let wide = Arc::new(AtomicUsize::new(0));
    let n = narrow.clone();
    let w = wide.clone();
    let service = serve(
        Router::new()
            .route(
                "/effects/normal",
                route_post(move |Json(input): Json<Value>| {
                    let n = n.clone();
                    async move {
                        n.fetch_add(1, Ordering::SeqCst);
                        if input["fail"] == true {
                            (
                                axum::http::StatusCode::FORBIDDEN,
                                Json(json!({"denied":true})),
                            )
                        } else {
                            (axum::http::StatusCode::OK, Json(json!({"normal":true})))
                        }
                    }
                }),
            )
            .route(
                "/effects/elevated",
                route_post(move || {
                    let w = w.clone();
                    async move { Json(json!({"effect":w.fetch_add(1, Ordering::SeqCst)+1})) }
                }),
            ),
    )
    .await;
    let directory = tempfile::tempdir().unwrap();
    let host = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let document = package_system(directory.path(), &service.url);
    let release = post(&server, "/api/v1/import", document).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { host.run_worker(worker_stop, 3).await.unwrap() });
    for (id, program) in [
        ("question", "ask"),
        ("allow", "escalate"),
        ("deny", "escalate"),
        ("plain", "success"),
    ] {
        post(&server, "/api/v1/runs", json!({"run_id":id,"thread_id":id,"system":"foundation-system","release":release,"program":program})).await;
        let state = outcome(&server, id).await;
        assert_eq!(
            state["execution"]["status"],
            if id == "plain" { "completed" } else { "paused" },
            "{state}"
        );
    }
    assert_eq!(narrow.load(Ordering::SeqCst), 3);
    assert_eq!(wide.load(Ordering::SeqCst), 0);
    for (root, reply) in [
        ("question", json!({"answer":"B"})),
        (
            "allow",
            json!({"allow":true,"acknowledge_partial_effects":true}),
        ),
        (
            "deny",
            json!({"allow":false,"acknowledge_partial_effects":true}),
        ),
    ] {
        let state = answer(&server, root, reply).await;
        assert_eq!(state["execution"]["status"], "completed", "{state}");
    }
    assert_eq!(
        narrow.load(Ordering::SeqCst),
        3,
        "completed narrower attempts must not replay"
    );
    assert_eq!(
        wide.load(Ordering::SeqCst),
        1,
        "only the explicitly allowed branch may execute"
    );
    stop.cancel();
    worker.await.unwrap();
}

#[tokio::test]
async fn human_recovery_discovers_direct_and_nested_frozen_paths_without_client_guesses() {
    let effects = Arc::new(AtomicUsize::new(0));
    let service = human::effect_service(effects.clone()).await;
    let mut document = human::source(&service.url);
    let r = human::r;
    let mut nested_modules = document["modules"].clone();
    nested_modules[2]["config"]["document"]["host"]["name"] = json!("nested-review-host");
    let outer = json!({"host":{"name":"outer"},"entry":r("outer"),"modules":nested_modules,"tool_runtimes":[{"reference":r("inner"),"definition":{"name":"inner","tool_packs":[r("review-tool")]}}],"workflows":[{"reference":r("outer"),"input_schema":{"type":"object"},"output_schema":true,"nodes":[{"id":"inner","action":{"kind":"tool","runtime":r("inner"),"tool":"review"},"input":{"from":"object","fields":{"input":{"from":"input"}}}}],"output":{"from":"node","node":"inner"}}]});
    document["modules"].as_array_mut().unwrap().extend([
        json!({"reference":r("outer-resource"),"factory":"resource.workflow","config":{"document":outer,"bindings":{}},"dependencies":{}}),
        json!({"reference":r("outer-tool"),"factory":"tool.workflow_connected","config":{"name":"outer_review"},"dependencies":{"workflow":r("outer-resource")}}),
    ]);
    document["programs"]["nested"] = json!({"kind":"tool","definition":{"name":"nested","tool_packs":[r("outer-tool")]},"call":{"id":"outer-call","name":"outer_review","arguments":{"input":{"question":"continue"}}}});
    let directory = tempfile::tempdir().unwrap();
    let host = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let release = post(&server, "/api/v1/import", document).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { host.run_worker(worker_stop, 3).await.unwrap() });
    for (program, path_length) in [("direct", 0), ("module", 1), ("nested", 2)] {
        post(
            &server,
            "/api/v1/runs",
            human::run(&release, program, program),
        )
        .await;
        assert_eq!(
            outcome(&server, program).await["execution"]["status"],
            "paused"
        );
        let page = read_humans(&server, program).await;
        let target = &page["targets"][0];
        assert_eq!(page["targets"].as_array().unwrap().len(), 1, "{page}");
        assert_eq!(target["response_schema"], json!({"type":"boolean"}));
        let mut command = target["command"].clone();
        assert_eq!(
            command["workflow_path"].as_array().unwrap().len(),
            path_length,
            "{page}"
        );
        assert_eq!(command["expected_request"], json!({"question":"continue"}));
        command["value"] = json!(true);
        let id = format!("template-{program}");
        post(
            &server,
            "/api/v1/actions",
            json!({"run_id":program,"command_id":id,"command":command}),
        )
        .await;
        assert!(action_result(&server, &id).await["error"].is_null());
        assert_eq!(
            outcome(&server, program).await["execution"]["status"],
            "completed"
        );
    }
    assert_eq!(effects.load(Ordering::SeqCst), 6);
    stop.cancel();
    worker.await.unwrap();
}
