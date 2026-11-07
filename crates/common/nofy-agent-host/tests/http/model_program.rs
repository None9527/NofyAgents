use super::*;
#[cfg(target_os = "linux")]
#[path = "model_program/isolation.rs"]
mod isolation;
#[cfg(target_os = "linux")]
#[path = "model_program/streams.rs"]
mod streams;
/// The model evaluator's confinement and stream tests watch workers through
/// `pidfd_open` and `/proc`; they compile for Linux only. A stand-in keeps the units
/// in every platform's results.
#[cfg(not(target_os = "linux"))]
mod isolation {
    #[test]
    fn unit_model_worker_confinement_and_streams() {
        nofy_test_support::skip(
            "an isolated model worker observed through pidfd and /proc",
            "tests/http/model_program/{isolation,streams}.rs are compiled for Linux only",
        );
    }
}

const SOURCE: &str = r#"
if args.phase == "admit" {return #{max_requests:1};}
if args.phase == "http_error" {return ();}
if args.phase == "history" { return true; }
if args.phase == "request" {
    return #{path: "invoke", mode: "json", state: #{},
        body: #{marker: "protocol-one", model: args.model, messages: args.request.messages}};
}
if args.phase == "event" {
    return #{state: json_parse(args.frame.data), deltas: [], finished: true};
}
if args.phase == "finish" { return #{response: args.state}; }
throw "unknown phase";
"#;

fn protocol_artifact() -> Value {
    json!({"schema_version":1,"files":{
        "common.rhai":include_str!("../../../../../presets/coding/modules/models/common.rhai"),
        "chat_completions.rhai":include_str!("../../../../../presets/coding/modules/models/chat_completions.rhai"),
        "responses.rhai":include_str!("../../../../../presets/coding/modules/models/responses.rhai"),
        "messages.rhai":include_str!("../../../../../presets/coding/modules/models/messages.rhai"),
        "parameters.schema.json":include_str!("../../../../../presets/coding/modules/models/parameters.schema.json"),
        "manifest.json":include_str!("../../../../../presets/coding/modules/models/manifest.json")
    }})
}

fn model_examples() -> [(&'static str, &'static str); 6] {
    [
        ("system", include_str!("../../examples/system.json")),
        ("http", include_str!("../../examples/http-system.json")),
        (
            "workflow",
            include_str!("../../examples/workflow-system.json"),
        ),
        ("code", include_str!("../../examples/code-system.json")),
        (
            "journal",
            include_str!("../../examples/model-journal-system.json"),
        ),
        (
            "recovery",
            include_str!("../../examples/model-recovery-system.json"),
        ),
    ]
}

#[test]
fn packaged_model_examples_use_exact_external_artifacts_and_no_legacy_factories() {
    let reads = Arc::new(AtomicUsize::new(0));
    let registry = native::registry(Arc::new(Credentials(reads.clone()))).unwrap();
    let factories = registry
        .descriptors()
        .into_iter()
        .map(|d| d.factory)
        .collect::<Vec<_>>();
    for old in ["resource.sampler", "model.connected"] {
        assert!(!factories.iter().any(|f| f == old));
    }
    for new in ["resource.model_connection", "model.programmed"] {
        assert!(factories.iter().any(|f| f == new));
    }
    // Protocol execution requires the Loader's injected physical owner, just
    // like prompts and scopes. Bare native engines do not select trust for it.
    assert!(!factories.iter().any(|f| f == "resource.model_protocol"));
    let artifact = protocol_artifact();
    let manifest: Value =
        serde_json::from_str(artifact["files"]["manifest.json"].as_str().unwrap()).unwrap();
    for (name, text) in model_examples() {
        let source: Value = serde_json::from_str(text).unwrap();
        let modules = source["modules"].as_array().unwrap();
        for old in ["resource.sampler", "model.connected"] {
            assert!(!modules.iter().any(|m| m["factory"] == old), "{name}");
        }
        let get = |id: &str| modules.iter().find(|m| m["reference"]["id"] == id).unwrap();
        assert_eq!(
            get("provider")["factory"],
            "resource.model_connection",
            "{name}"
        );
        assert!(
            get("provider")["config"].get("connection").is_none(),
            "{name}"
        );
        assert_eq!(get("model")["factory"], "model.programmed", "{name}");
        assert_eq!(
            get("model")["dependencies"]["protocol"],
            json!({"id":"protocol","version":"1"}),
            "{name}"
        );
        assert_eq!(
            get("protocol")["config"],
            manifest["profiles"]["chat_completions"]["protocol"],
            "{name}"
        );
        let files = &get("protocol-code")["config"]["bundle"]["files"];
        assert_eq!(files.as_object().unwrap().len(), 3, "{name}");
        for file in [
            "common.rhai",
            "chat_completions.rhai",
            "parameters.schema.json",
        ] {
            assert_eq!(files[file], artifact["files"][file], "{name}: {file}");
        }
    }
    assert_eq!(reads.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn managed_preview_accepts_new_examples_and_rejects_removed_factories_without_credentials() {
    let dir = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let host = host(dir.path(), reads.clone()).await;
    let server = serve(host.router()).await;
    for (name, text) in model_examples() {
        let source: Value = serde_json::from_str(text).unwrap();
        let (status, result) = request(
            &server,
            reqwest::Method::POST,
            "/api/v1/validate",
            ADMIN,
            source,
        )
        .await;
        assert_eq!(status, 200, "{name}: {result}");
    }
    for (index, old) in [(0, "resource.sampler"), (1, "model.connected")] {
        let mut source = serde_json::to_value(document("http://127.0.0.1:9")).unwrap();
        source["modules"][index]["factory"] = json!(old);
        let (status, result) = request(
            &server,
            reqwest::Method::POST,
            "/api/v1/validate",
            ADMIN,
            source,
        )
        .await;
        assert!((400..500).contains(&status), "{old}: {status}: {result}");
        assert!(result.to_string().contains(old), "{result}");
    }
    assert_eq!(reads.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn external_three_protocol_modules_run_through_one_resident_host_without_sampler_declarations()
 {
    let calls = Arc::new(Mutex::new(Vec::<(String, Value)>::new()));
    let captured = calls.clone();
    let provider=serve(Router::new().route("/v1/{*path}",route_post(move |axum::extract::Path(path):axum::extract::Path<String>,headers:axum::http::HeaderMap,Json(body):Json<Value>| {
        let captured=captured.clone();
        async move {
            assert_eq!(body["stream"],false);
            if path=="messages" {assert_eq!(headers["anthropic-version"],"2023-06-01");assert_eq!(headers["x-api-key"],"fixture-provider-token");}
            else {assert_eq!(headers["authorization"],"Bearer fixture-provider-token");}
            captured.lock().unwrap().push((path.clone(),body));
            Json(match path.as_str() {
                "chat/completions"=>json!({"choices":[{"index":0,"message":{"role":"assistant","content":"external-chat"},"finish_reason":"stop"}],"usage":{"prompt_tokens":3,"completion_tokens":2}}),
                "responses"=>json!({"status":"completed","output":[{"type":"message","role":"assistant","content":[{"type":"output_text","text":"external-responses"}]}],"usage":{"input_tokens":3,"output_tokens":2}}),
                "messages"=>json!({"role":"assistant","content":[{"type":"text","text":"external-messages"}],"stop_reason":"end_turn","usage":{"input_tokens":3,"output_tokens":2}}),
                _=>panic!("unexpected model endpoint"),
            })
        }
    }))).await;
    let dir = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let host = host(dir.path(), reads.clone()).await;
    let server = serve(host.router()).await;
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { host.run_worker(worker_stop, 4).await.unwrap() });
    let manifest: Value = serde_json::from_str(include_str!(
        "../../../../../presets/coding/modules/models/manifest.json"
    ))
    .unwrap();
    for (index, (profile, expected)) in [
        ("chat_completions", "external-chat"),
        ("responses", "external-responses"),
        ("messages", "external-messages"),
    ]
    .into_iter()
    .enumerate()
    {
        let mut source: Value = serde_json::to_value(document(&provider.url)).unwrap();
        source["modules"][0]["factory"] = json!("resource.model_connection");
        let mut connection = manifest["profiles"][profile]["connection"].clone();
        connection["base_url"] = json!(format!("{}/v1/", provider.url));
        connection["allow_insecure_http"] = json!(true);
        connection["models"] = json!(["test-model"]);
        source["modules"][0]["config"] = connection;
        source["modules"][1]["factory"] = json!("model.programmed");
        source["modules"][1]["dependencies"]["protocol"] = json!({"id":"protocol","version":"1"});
        source["modules"][3] = json!({"reference":{"id":"protocol","version":"1"},"factory":"resource.model_protocol",
            "config":manifest["profiles"][profile]["protocol"],"dependencies":{"artifact":{"id":"protocol-code","version":"1"}}});
        source["modules"][4] = json!({"reference":{"id":"protocol-code","version":"1"},"factory":"resource.artifact","config":{"bundle":protocol_artifact()}});
        source["programs"]["chat"]["definition"]["settings"]["model"] = json!({"stream":false});
        assert!(!source.to_string().contains("resource.sampler"));
        assert!(!source.to_string().contains("model.connected"));
        let release = post(&server, "/api/v1/import", source).await["bundle"]["digest"]
            .as_str()
            .unwrap()
            .to_owned();
        assert_eq!(reads.load(Ordering::SeqCst), index);
        let id = format!("external-{profile}");
        post(&server, "/api/v1/runs", run(&release, &id)).await;
        assert_eq!(
            outcome(&server, &id).await["execution"]["outcome"]["Completed"]["output"],
            expected
        );
        assert_eq!(reads.load(Ordering::SeqCst), index + 1);
    }
    assert_eq!(calls.lock().unwrap().len(), 3);
    stop.cancel();
    worker.await.unwrap();
}

#[tokio::test]
async fn protocol_source_is_managed_in_the_system_document_and_changes_without_kernel_restart() {
    let calls = Arc::new(Mutex::new(Vec::<(axum::http::HeaderMap, Value)>::new()));
    let captured = calls.clone();
    let provider = serve(Router::new().route(
        "/invoke",
        route_post(
            move |headers: axum::http::HeaderMap, Json(body): Json<Value>| {
                let captured = captured.clone();
                async move {
                    captured.lock().unwrap().push((headers, body.clone()));
                    Json(
                        json!({"messages":[],"tool_calls":[],"output":body["marker"],
                "input_tokens":4,"output_tokens":2,"info":{"provider":{"wire":"kept"}}}),
                    )
                }
            },
        ),
    ))
    .await;
    let dir = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let host = host(dir.path(), reads.clone()).await;
    let server = serve(host.router()).await;
    let mut source: Value = serde_json::to_value(document(&provider.url)).unwrap();
    source["modules"][0]["factory"] = json!("resource.model_connection");
    source["modules"][0]["config"] = json!({"base_url":format!("{}/",provider.url),"allow_insecure_http":true,"models":["test-model"],
        "header_credentials":{"authorization":{"reference":"MODEL_TOKEN","prefix":"Bearer "}}});
    source["modules"][1]["factory"] = json!("model.programmed");
    source["modules"][1]["dependencies"]["protocol"] = json!({"id":"protocol","version":"1"});
    source["modules"][3] = json!({"reference":{"id":"protocol","version":"1"},
        "factory":"resource.model_protocol","config":{"source":{"kind":"artifact","entries":["protocol.rhai"]},"capabilities":{"streaming":false}},
        "dependencies":{"artifact":{"id":"protocol-code","version":"1"}}});
    source["modules"][4] = json!({"reference":{"id":"protocol-code","version":"1"},
        "factory":"resource.artifact","config":{"bundle":{"schema_version":1,"files":{"protocol.rhai":SOURCE}}}});
    assert!(!source.to_string().contains("resource.sampler"));
    assert!(!source.to_string().contains("model.connected"));
    let first = post(&server, "/api/v1/import", source.clone()).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    assert_eq!(reads.load(Ordering::SeqCst), 0);
    assert!(calls.lock().unwrap().is_empty());
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { host.run_worker(worker_stop, 4).await.unwrap() });
    post(&server, "/api/v1/runs", run(&first, "protocol-one")).await;
    assert_eq!(
        outcome(&server, "protocol-one").await["execution"]["outcome"]["Completed"]["output"],
        "protocol-one"
    );
    source["modules"][4]["config"]["bundle"]["files"]["protocol.rhai"] =
        json!(SOURCE.replace("protocol-one", "protocol-two"));
    let second = post(&server, "/api/v1/import", source.clone()).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    assert_ne!(first, second);
    post(&server, "/api/v1/runs", run(&second, "protocol-two")).await;
    assert_eq!(
        outcome(&server, "protocol-two").await["execution"]["outcome"]["Completed"]["output"],
        "protocol-two"
    );
    // The pinned previous release remains executable; no mutable global parser
    // or implicit product sampler participates in either release.
    post(&server, "/api/v1/runs", run(&first, "protocol-pinned")).await;
    assert_eq!(
        outcome(&server, "protocol-pinned").await["execution"]["outcome"]["Completed"]["output"],
        "protocol-one"
    );
    {
        let calls = calls.lock().unwrap();
        assert_eq!(calls.len(), 3);
        for (headers, body) in calls.iter() {
            assert_eq!(headers["authorization"], "Bearer fixture-provider-token");
            assert_eq!(body["model"], "test-model");
            assert!(!body.to_string().contains("fixture-provider-token"));
        }
    }
    assert_eq!(reads.load(Ordering::SeqCst), 3);
    stop.cancel();
    worker.await.unwrap();
}
