use super::*;
use nofy_agent_client::Envelope;

pub(super) async fn checked(sdk: &Engine, operation: &str, input: Value) -> Envelope {
    let receipt = sdk.execute(operation, input).await;
    assert!(!receipt.is_error(), "{operation}: {receipt:?}");
    receipt
}

pub(super) fn tool_call(id: &str, name: &str, arguments: Value) -> Vec<axum::response::sse::Event> {
    let chunk = |delta: Value, reason: Value| {
        axum::response::sse::Event::default().data(
            json!({
                "id":"omni-provider", "object":"chat.completion.chunk", "model":"test-model",
                "choices":[{"index":0,"delta":delta,"finish_reason":reason}]
            })
            .to_string(),
        )
    };
    vec![
        chunk(
            json!({"role":"assistant","tool_calls":[{"index":0,"id":id,"type":"function","function":{"name":name,"arguments":arguments.to_string()}}]}),
            Value::Null,
        ),
        chunk(json!({}), json!("tool_calls")),
        axum::response::sse::Event::default().data(json!({
            "id":"omni-provider","object":"chat.completion.chunk","model":"test-model","choices":[],
            "usage":{"prompt_tokens":10,"completion_tokens":10,"total_tokens":20}
        }).to_string()),
        axum::response::sse::Event::default().data("[DONE]"),
    ]
}

fn model_frames(body: Value) -> Vec<axum::response::sse::Event> {
    let messages = body["messages"].as_array().unwrap();
    let input = messages.iter().find(|line| line["role"] == "user").unwrap()["content"].to_string();
    let last = messages.last().unwrap();
    if input.contains("author-capability") {
        if !messages
            .iter()
            .any(|line| line["tool_call_id"] == "sdk-hidden")
        {
            return tool_call(
                "sdk-hidden",
                "sdk_schema",
                json!({"operation":"system.apply"}),
            );
        }
        if last["tool_call_id"] == "sdk-hidden" {
            assert!(
                last["content"]
                    .to_string()
                    .contains("unavailable in the `development` toolset")
            );
        }
        if !messages
            .iter()
            .any(|line| line["tool_call_id"] == "sdk-contract")
        {
            return tool_call(
                "sdk-contract",
                "sdk_schema",
                json!({"operation":"module.template"}),
            );
        }
        if last["tool_call_id"] == "sdk-contract" {
            assert!(last["content"].to_string().contains("module.template"));
            return tool_call(
                "sdk-template",
                "sdk_module_template",
                json!({"name":"sum-values","version":"0.1.0","kind":"tool"}),
            );
        }
        assert_eq!(last["tool_call_id"], "sdk-template");
        assert!(last["content"].to_string().contains("sum-values"));
        let proposal = json!({
            "contract":{"name":"sum_values","description":"Add two whole numbers.","effect":"read_only",
                "input_schema":{"type":"object","additionalProperties":false,"required":["left","right"],"properties":{"left":{"type":"integer"},"right":{"type":"integer"}}}},
            "source":"#{result: args.left + args.right}"
        });
        return nofy_test_support::sse::chat_completion_events_exact(
            &proposal.to_string(),
            "test-model",
        );
    }
    let result = if input.contains("validate-capability") {
        19
    } else {
        42
    };
    if result == 42 {
        if !messages
            .iter()
            .any(|line| line["tool_call_id"] == "catalog")
        {
            return tool_call(
                "catalog",
                "sdk_module_list",
                json!({"repository":"omni-capabilities"}),
            );
        }
        if last["tool_call_id"] == "catalog" {
            let catalog: Value = serde_json::from_str(last["content"].as_str().unwrap()).unwrap();
            assert_eq!(catalog["packages"][0]["name"], "sum-values");
            assert_eq!(catalog["packages"][0]["version"], "0.1.0");
        }
    }
    if last["tool_call_id"] == "sum" {
        let decoded: Value = serde_json::from_str(last["content"].as_str().unwrap()).unwrap();
        assert_eq!(decoded["result"], result);
        return nofy_test_support::sse::chat_completion_events_exact(
            &format!("verified-sum-{result}"),
            "test-model",
        );
    }
    assert!(
        body["tools"]
            .as_array()
            .unwrap()
            .iter()
            .any(|tool| tool["function"]["name"] == "sum_values")
    );
    tool_call("sum", "sum_values", json!({"left":12,"right":result - 12}))
}

pub(super) async fn publish_release(sdk: &Engine, source: &Value) -> String {
    let build = checked(
        sdk,
        "agent.build",
        json!({"agent":"main","target":{"kind":"source","source":source}}),
    )
    .await;
    let release = checked(
        sdk,
        "system.publish",
        json!({"document_json":build.data["deployment_json"]}),
    )
    .await;
    release.refs["release"].clone().unwrap()
}

pub(super) async fn run_session(sdk: &Engine, release: &str, id: &str) -> Value {
    run_session_with_input(sdk, "omni", release, id, id).await
}

pub(super) async fn run_session_with_input(
    sdk: &Engine,
    system: &str,
    release: &str,
    id: &str,
    text: &str,
) -> Value {
    let request = json!({"run_id":id,"thread_id":id,"system":system,"release":release,"program":"main","input":{"text":text,"attachments":[]}});
    checked(sdk, "session.start", json!({"session_id":id,"command_id":id,"expected_session_revision":null,"request_json":request.to_string()})).await;
    tokio::time::timeout(Duration::from_secs(45), async {
        loop {
            let outcome = checked(sdk, "run.inspect", json!({"run_id":id,"view":"full"})).await;
            let record: Value =
                serde_json::from_str(outcome.data["native_json"].as_str().unwrap()).unwrap();
            match record["execution"]["status"].as_str() {
                Some("completed") => return record,
                Some("failed" | "paused" | "cancelled" | "budget_exceeded") => {
                    panic!("{id}: {}", record["execution"]["error"])
                }
                _ => tokio::time::sleep(Duration::from_millis(35)).await,
            }
        }
    })
    .await
    .unwrap_or_else(|_| panic!("{id} did not finish"))
}

#[tokio::test(flavor = "multi_thread", worker_threads = 3)]
async fn omni_uses_sdk_to_author_validate_publish_and_reuse_a_capability() {
    let directory = tempfile::tempdir().unwrap();
    let kernel = host(directory.path()).await;
    let server = serve(kernel.router()).await;
    let sdk = engine(&server.url, ADMIN);
    let stop = tokio_util::sync::CancellationToken::new();
    let provider = serve(axum::Router::new().route(
        "/v1/chat/completions",
        axum::routing::post(|axum::Json(body): axum::Json<Value>| async move {
            axum::response::Sse::new(futures::stream::iter(
                model_frames(body)
                    .into_iter()
                    .map(Ok::<_, std::convert::Infallible>),
            ))
        }),
    ))
    .await;
    let template = checked(&sdk, "project.template", json!({})).await;
    let source: Source = serde_json::from_value(template.data["source"].clone()).unwrap();
    assert_eq!(nofy_agent_project::agent_names(&source).unwrap(), ["main"]);
    let created = checked(
        &sdk,
        "agent.create",
        json!({"agent":"main","project_id":"omni","source":template.data["source"]}),
    )
    .await;
    let configured = checked(&sdk, "agent.configure", json!({"agent":"main","target":{"kind":"project","project_id":"omni","expected_revision":created.refs["source_revision"]},"include_source":true,"settings":{
        "connection":{"base_url":format!("{}/v1/",provider.url),"models":["test-model"],"header_credentials":{},"allow_insecure_http":true},"model":"test-model","model_settings":{"stream":true}
    }})).await;
    let base = configured.data["source"].clone();
    let initial_release = publish_release(&sdk, &base).await;
    let initial = checked(&sdk, "system.apply", json!({"system":"omni","release":initial_release,"expected_generation":null,"command_id":"activate-omni"})).await;
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { kernel.run_worker(worker_stop, 2).await.unwrap() });
    let authored = run_session(&sdk, &initial_release, "author-capability").await;
    let output = authored
        .pointer("/execution/outcome/Completed/output")
        .and_then(Value::as_str)
        .unwrap_or_else(|| panic!("proposal absent: {authored}"));
    let config: Value = serde_json::from_str(output).unwrap();
    assert_eq!(config["contract"]["name"], "sum_values");

    let seed = checked(
        &sdk,
        "module.template",
        json!({"name":"sum-values","version":"0.1.0","kind":"tool"}),
    )
    .await;
    let mut package: Source = serde_json::from_value(seed.data["source"].clone()).unwrap();
    let mut manifest = package.json("module.json").unwrap();
    manifest["modules"][0]["config"] = config.clone();
    package.put_json("module.json", &manifest).unwrap();
    package.refresh_manifest().unwrap();
    let mut candidate: Source = serde_json::from_value(base).unwrap();
    let mut settings = candidate.json("settings.schema.json").unwrap();
    settings["properties"]["allowed_tools"]["default"]
        .as_array_mut()
        .unwrap()
        .push(json!("sum_values"));
    candidate
        .put_json("settings.schema.json", &settings)
        .unwrap();
    candidate.refresh_manifest().unwrap();

    // Evaluate the generated implementation in a separate release, before publishing the package.
    let draft = checked(&sdk, "agent.module.add", json!({"agent":"main","target":{"kind":"source","source":candidate,"expected_digest":candidate.digest().unwrap()},"id":"sum-values","factory":"tool.rhai","slot":"tool_packs","config":config})).await;
    let evaluation_release = publish_release(&sdk, &draft.data["source"]).await;
    let evaluation = run_session(&sdk, &evaluation_release, "validate-capability").await;
    assert_eq!(
        evaluation.pointer("/execution/outcome/Completed/output"),
        Some(&json!("verified-sum-19")),
        "{evaluation}"
    );

    checked(
        &sdk,
        "repository.add",
        json!({"repository":"omni-capabilities"}),
    )
    .await;
    let artifact = checked(
        &sdk,
        "module.publish",
        json!({"repository":"omni-capabilities","source":package}),
    )
    .await;
    assert_eq!(
        artifact.refs["package_digest"].as_deref(),
        Some(package.digest().unwrap().as_str())
    );
    let use_package = checked(&sdk, "agent.module.use", json!({"agent":"main","target":{"kind":"source","source":candidate,"expected_digest":candidate.digest().unwrap()},"repository":"omni-capabilities","name":"sum-values","version":"0.1.0","alias":"reusable","export":"main","slot":"tool_packs"})).await;
    let imported: Source = serde_json::from_value(use_package.data["source"].clone()).unwrap();
    let imports = nofy_agent_project::repository::imports(&imported).unwrap();
    assert_eq!(
        imports["reusable"].digest,
        artifact.refs["package_digest"].as_deref().unwrap()
    );
    let final_release = publish_release(&sdk, &use_package.data["source"]).await;
    assert_ne!(initial_release, final_release);
    let activation = json!({"system":"omni","release":final_release,"expected_generation":initial.refs["generation"],"command_id":"activate-sum-values"});
    let applied = checked(&sdk, "system.apply", activation.clone()).await;
    let replay = checked(&sdk, "system.apply", activation).await;
    assert_eq!(applied.data, replay.data);
    let active = checked(&sdk, "system.active", json!({"system":"omni"})).await;
    assert_eq!(
        active.refs["release"].as_deref(),
        Some(final_release.as_str())
    );
    let reused = run_session(
        &sdk,
        active.refs["release"].as_deref().unwrap(),
        "reuse-capability",
    )
    .await;
    assert_eq!(
        reused.pointer("/execution/outcome/Completed/output"),
        Some(&json!("verified-sum-42")),
        "{reused}"
    );
    stop.cancel();
    worker.await.unwrap();
}

#[tokio::test]
async fn default_omni_template_and_explicit_empty_or_legacy_remain_reachable() {
    let directory = tempfile::tempdir().unwrap();
    let project = directory.path().join("omni");
    cli_ok(
        "http://127.0.0.1:1",
        &[
            "project",
            "init",
            project.to_str().unwrap(),
            "--preset-dir",
            presets().to_str().unwrap(),
            "--offline",
        ],
    )
    .await;
    let source = nofy_agent_project::load_directory(&project).unwrap();
    let document = source.json("preset.json").unwrap();
    assert_eq!(document["system"]["programs"].as_object().unwrap().len(), 1);
    assert_eq!(
        document["system"]["programs"]["main"]["definition"]["name"],
        "omni"
    );
    let sdk = engine("http://127.0.0.1:1", ADMIN)
        .with_templates(nofy_agent_project::TemplateRegistry::open(&presets()).unwrap());
    checked(
        &sdk,
        "project.template",
        json!({"empty":true,"agent":"blank"}),
    )
    .await;
    checked(
        &sdk,
        "project.template",
        json!({"preset":"coding","agent":"legacy"}),
    )
    .await;
    let settings = input_file(
        directory.path(),
        "settings.json",
        &json!({
            "connection":{"base_url":"https://example.invalid/v1/","models":["test-model"],"header_credentials":{}},
            "model":"test-model","workspace_enabled":true,"workspace":directory.path(),
            "workspace_environment":{"executable":"/usr/bin/python3","paths":[{"path":"/usr","execute":true}]}
        }),
    );
    cli_ok(
        "http://127.0.0.1:1",
        &[
            "agent",
            "configure",
            "main",
            "--project",
            project.to_str().unwrap(),
            "--settings",
            &format!("@{settings}"),
            "--offline",
        ],
    )
    .await;
    let path = directory.path().join("deployment.json");
    cli_ok(
        "http://127.0.0.1:1",
        &[
            "project",
            "build",
            project.to_str().unwrap(),
            "--output",
            path.to_str().unwrap(),
            "--offline",
        ],
    )
    .await;
    let built: Value = serde_json::from_slice(&std::fs::read(path).unwrap()).unwrap();
    let main = &built["system"]["programs"]["main"]["definition"];
    let packs = main["tool_packs"].as_array().unwrap();
    assert!(packs.iter().any(|pack| pack["id"] == "main-tools"));
    assert!(packs.iter().any(|pack| pack["id"] == "files.file-read"));
    assert!(packs.iter().any(|pack| pack["id"] == "files.file-edit"));
    assert!(!packs.iter().any(|pack| pack["id"] == "command.command"));
    let main_tools = built["system"]["modules"]
        .as_array()
        .unwrap()
        .iter()
        .find(|module| module["reference"]["id"] == "main-tools")
        .unwrap();
    assert!(
        main_tools["dependencies"].get("tasks").is_none(),
        "dead coordination.tools wire must be removed from omni main-tools"
    );
}

#[tokio::test]
async fn omni_supports_model_protocol_selection_and_command_isolation_backends() {
    let directory = tempfile::tempdir().unwrap();
    let kernel = host(directory.path()).await;
    let server = serve(kernel.router()).await;
    let sdk = engine(&server.url, ADMIN);
    let template = checked(&sdk, "project.template", json!({})).await;
    let base: Source = serde_json::from_value(template.data["source"].clone()).unwrap();

    for (protocol, expected_model_id, expected_script, absent_script) in [
        (
            "chat_completions",
            "provider.model",
            "chat_completions.rhai",
            "responses.rhai",
        ),
        (
            "responses",
            "provider-responses.model",
            "responses.rhai",
            "messages.rhai",
        ),
        (
            "messages",
            "provider-messages.model",
            "messages.rhai",
            "responses.rhai",
        ),
    ] {
        let configured = checked(
            &sdk,
            "agent.configure",
            json!({
                "agent": "main",
                "target": {"kind": "source", "source": base, "expected_digest": base.digest().unwrap()},
                "include_source": true,
                "settings": {
                    "model_protocol": protocol,
                    "connection": {
                        "base_url": "https://example.invalid/v1/",
                        "models": ["test-model"],
                        "header_credentials": {}
                    },
                    "model": "test-model"
                }
            }),
        )
        .await;
        let built = checked(
            &sdk,
            "agent.build",
            json!({"agent": "main", "target": {"kind": "source", "source": configured.data["source"]}}),
        )
        .await;
        let deployment: Value =
            serde_json::from_str(built.data["deployment_json"].as_str().unwrap()).unwrap();
        assert_eq!(
            deployment["system"]["programs"]["main"]["definition"]["model"]["id"],
            expected_model_id
        );
        let rendered = built.data["deployment_json"].as_str().unwrap();
        assert!(rendered.contains(expected_script), "{protocol}");
        assert!(!rendered.contains(absent_script), "{protocol}");
    }

    // Namespace isolation builds without requiring cgroup process_tree.
    let namespace_cfg = checked(
        &sdk,
        "agent.configure",
        json!({
            "agent": "main",
            "target": {"kind": "source", "source": base, "expected_digest": base.digest().unwrap()},
            "include_source": true,
            "settings": {
                "connection": {
                    "base_url": "https://example.invalid/v1/",
                    "models": ["test-model"],
                    "header_credentials": {}
                },
                "model": "test-model",
                "command_enabled": true,
                "command_isolation": "namespace",
                "workspace": "/tmp/omni-workspace",
                "command_environment": {
                    "executable": "/usr/bin/python3",
                    "paths": [{"path": "/usr", "execute": true}]
                },
                "process_namespace": {
                    "filesystem_mode": "workspace_write",
                    "cpu_seconds": 60
                }
            }
        }),
    )
    .await;
    let ns_built = checked(
        &sdk,
        "agent.build",
        json!({"agent": "main", "target": {"kind": "source", "source": namespace_cfg.data["source"]}}),
    )
    .await;
    let ns_deployment: Value =
        serde_json::from_str(ns_built.data["deployment_json"].as_str().unwrap()).unwrap();
    let ns_modules = ns_deployment["system"]["modules"].as_array().unwrap();
    assert!(
        ns_modules
            .iter()
            .any(|m| m["factory"] == "resource.process_namespace_limits")
    );
    assert!(
        !ns_modules
            .iter()
            .any(|m| m["factory"] == "resource.process_tree_limits")
    );
    let ns_cmd = ns_modules
        .iter()
        .find(|m| m["reference"]["id"] == "command.command")
        .unwrap();
    assert_eq!(
        ns_cmd["dependencies"]["tree"]["id"],
        "command.process-namespace"
    );

    // Default command_isolation ("process_tree") preserves cgroup compatibility.
    let tree_cfg = checked(
        &sdk,
        "agent.configure",
        json!({
            "agent": "main",
            "target": {"kind": "source", "source": base, "expected_digest": base.digest().unwrap()},
            "include_source": true,
            "settings": {
                "connection": {
                    "base_url": "https://example.invalid/v1/",
                    "models": ["test-model"],
                    "header_credentials": {}
                },
                "model": "test-model",
                "command_enabled": true,
                "workspace": "/tmp/omni-workspace",
                "command_environment": {
                    "executable": "/usr/bin/python3",
                    "paths": [{"path": "/usr", "execute": true}]
                },
                "process_tree": {
                    "cgroup_root": "/sys/fs/cgroup/nofy-test",
                    "limits": {"max_processes": 16, "max_memory_bytes": 134217728, "cpu_percent": 100}
                }
            }
        }),
    )
    .await;
    let tree_built = checked(
        &sdk,
        "agent.build",
        json!({"agent": "main", "target": {"kind": "source", "source": tree_cfg.data["source"]}}),
    )
    .await;
    let tree_deployment: Value =
        serde_json::from_str(tree_built.data["deployment_json"].as_str().unwrap()).unwrap();
    let tree_modules = tree_deployment["system"]["modules"].as_array().unwrap();
    assert!(
        tree_modules
            .iter()
            .any(|m| m["factory"] == "resource.process_tree_limits")
    );
    assert!(
        !tree_modules
            .iter()
            .any(|m| m["factory"] == "resource.process_namespace_limits")
    );
    let tree_cmd = tree_modules
        .iter()
        .find(|m| m["reference"]["id"] == "command.command")
        .unwrap();
    assert_eq!(
        tree_cmd["dependencies"]["tree"]["id"],
        "command.process-tree"
    );
}

#[tokio::test(flavor = "multi_thread", worker_threads = 3)]
async fn omni_compaction_v022_handles_cjk_token_pressure_and_user_parts_manual_compact() {
    let directory = tempfile::tempdir().unwrap();
    let kernel = host(directory.path()).await;
    let server = serve(kernel.router()).await;
    let sdk = engine(&server.url, ADMIN);
    let stop = tokio_util::sync::CancellationToken::new();
    let provider = serve(axum::Router::new().route(
        "/v1/chat/completions",
        axum::routing::post(|axum::Json(body): axum::Json<Value>| async move {
            let messages = body["messages"].as_array().unwrap();
            let is_compaction = messages.first().is_some_and(|m| {
                m["role"] == "system"
                    && m["content"]
                        .as_str()
                        .is_some_and(|s| s.contains("Summarize prior conversation"))
            });
            let reply = if is_compaction {
                "KEY-SUMMARY-OK"
            } else {
                "TURN-OK"
            };
            axum::response::Sse::new(futures::stream::iter(
                nofy_test_support::sse::chat_completion_events_exact(reply, "test-model")
                    .into_iter()
                    .map(Ok::<_, std::convert::Infallible>),
            ))
        }),
    ))
    .await;

    let template = checked(&sdk, "project.template", json!({})).await;
    let base: Source = serde_json::from_value(template.data["source"].clone()).unwrap();
    let configured = checked(
        &sdk,
        "agent.configure",
        json!({
            "agent": "main",
            "target": {"kind": "source", "source": base, "expected_digest": base.digest().unwrap()},
            "include_source": true,
            "settings": {
                "connection": {
                    "base_url": format!("{}/v1/", provider.url),
                    "models": ["test-model"],
                    "header_credentials": {},
                    "allow_insecure_http": true
                },
                "model": "test-model",
                "model_settings": {"stream": true},
                "context_window": 1024,
                "compaction_threshold_percent": 75,
                "compaction_keep_turns": 0
            }
        }),
    )
    .await;
    let release = publish_release(&sdk, &configured.data["source"]).await;
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { kernel.run_worker(worker_stop, 2).await.unwrap() });

    let wait_done = |id: String| {
        let sdk = engine(&server.url, ADMIN);
        async move {
            tokio::time::timeout(Duration::from_secs(30), async {
                loop {
                    let outcome =
                        checked(&sdk, "run.inspect", json!({"run_id": id, "view": "full"})).await;
                    let record: Value =
                        serde_json::from_str(outcome.data["native_json"].as_str().unwrap())
                            .unwrap();
                    match record["execution"]["status"].as_str() {
                        Some("completed") => return record,
                        Some("failed" | "paused" | "cancelled" | "budget_exceeded") => {
                            panic!("{id}: {}", record["execution"]["error"])
                        }
                        _ => tokio::time::sleep(Duration::from_millis(30)).await,
                    }
                }
            })
            .await
            .unwrap()
        }
    };

    // Case 1a (control): 180 ASCII chars stays well below 75% of 1024 tokens (768 tokens).
    let ascii_req = json!({
        "run_id": "ascii-turn-1",
        "thread_id": "ascii-session",
        "system": "omni",
        "release": release,
        "program": "main",
        "input": {"text": "a".repeat(180), "attachments": []}
    });
    let ascii_started = checked(
        &sdk,
        "session.start",
        json!({"session_id": "ascii-session", "command_id": "ascii-turn-1", "expected_session_revision": null, "request_json": ascii_req.to_string()}),
    )
    .await;
    wait_done("ascii-turn-1".into()).await;
    let ascii_turn2 = json!({
        "command_id": "ascii-turn-2",
        "source_run_id": "ascii-turn-1",
        "expected_source_revision": 0,
        "turn": {"kind": "new", "run_id": "ascii-turn-2", "input": {"text": "next", "attachments": []}}
    });
    checked(
        &sdk,
        "session.turn",
        json!({"session_id": "ascii-session", "expected_session_revision": ascii_started.data["session_revision"], "request_json": ascii_turn2.to_string()}),
    )
    .await;
    let ascii_final = wait_done("ascii-turn-2".into()).await;
    let ascii_messages = ascii_final
        .pointer("/execution/outcome/Completed/state/messages")
        .and_then(Value::as_array)
        .unwrap();
    assert!(
        !ascii_messages.iter().any(|m| {
            m["role"] == "assistant"
                && m["content"]
                    .as_str()
                    .is_some_and(|c| c.starts_with("[Compacted history]"))
        }),
        "180 ASCII chars must stay below 768-token threshold: {ascii_messages:?}"
    );

    // Case 1b: 180 Chinese characters (~270 CJK tokens) pushes total past 768 tokens
    // even though raw character count matches Case 1a (legacy chars/4 would miss this).
    let cjk_text = "中".repeat(180);
    let cjk_req = json!({
        "run_id": "cjk-turn-1",
        "thread_id": "cjk-session",
        "system": "omni",
        "release": release,
        "program": "main",
        "input": {"text": cjk_text, "attachments": []}
    });
    let started = checked(
        &sdk,
        "session.start",
        json!({"session_id": "cjk-session", "command_id": "cjk-turn-1", "expected_session_revision": null, "request_json": cjk_req.to_string()}),
    )
    .await;
    wait_done("cjk-turn-1".into()).await;
    let turn2 = json!({
        "command_id": "cjk-turn-2",
        "source_run_id": "cjk-turn-1",
        "expected_source_revision": 0,
        "turn": {"kind": "new", "run_id": "cjk-turn-2", "input": {"text": "next", "attachments": []}}
    });
    checked(
        &sdk,
        "session.turn",
        json!({"session_id": "cjk-session", "expected_session_revision": started.data["session_revision"], "request_json": turn2.to_string()}),
    )
    .await;
    let cjk_final = wait_done("cjk-turn-2".into()).await;
    let cjk_messages = cjk_final
        .pointer("/execution/outcome/Completed/state/messages")
        .and_then(Value::as_array)
        .unwrap();
    assert!(
        cjk_messages.iter().any(|m| {
            m["role"] == "assistant"
                && m["content"]
                    .as_str()
                    .is_some_and(|c| c.starts_with("[Compacted history]\nKEY-SUMMARY-OK"))
        }),
        "expected CJK auto-compaction summary: {cjk_messages:?}"
    );

    // Case 2: Manual /compact on a user_parts turn (with attachment) triggers below threshold.
    let manual_cfg = checked(
        &sdk,
        "agent.configure",
        json!({
            "agent": "main",
            "target": {"kind": "source", "source": base, "expected_digest": base.digest().unwrap()},
            "include_source": true,
            "settings": {
                "connection": {
                    "base_url": format!("{}/v1/", provider.url),
                    "models": ["test-model"],
                    "header_credentials": {},
                    "allow_insecure_http": true
                },
                "model": "test-model",
                "model_settings": {"stream": true},
                "context_window": 262144,
                "compaction_threshold_percent": 75,
                "compaction_keep_turns": 2
            }
        }),
    )
    .await;
    let manual_release = publish_release(&sdk, &manual_cfg.data["source"]).await;
    let seed_req = json!({
        "run_id": "parts-turn-1",
        "thread_id": "parts-session",
        "system": "omni",
        "release": manual_release,
        "program": "main",
        "input": {"text": "remember a long prior context ".repeat(20), "attachments": []}
    });
    let parts_started = checked(
        &sdk,
        "session.start",
        json!({"session_id": "parts-session", "command_id": "parts-turn-1", "expected_session_revision": null, "request_json": seed_req.to_string()}),
    )
    .await;
    wait_done("parts-turn-1".into()).await;
    let compact_parts = json!({
        "command_id": "parts-turn-2",
        "source_run_id": "parts-turn-1",
        "expected_source_revision": 0,
        "turn": {
            "kind": "new",
            "run_id": "parts-turn-2",
            "input": {
                "text": "/compact keep essentials",
                "attachments": [{"type": "text", "text": "attached note"}]
            }
        }
    });
    checked(
        &sdk,
        "session.turn",
        json!({"session_id": "parts-session", "expected_session_revision": parts_started.data["session_revision"], "request_json": compact_parts.to_string()}),
    )
    .await;
    let parts_final = wait_done("parts-turn-2".into()).await;
    let parts_messages = parts_final
        .pointer("/execution/outcome/Completed/state/messages")
        .and_then(Value::as_array)
        .unwrap();
    assert!(
        parts_messages.iter().any(|m| {
            m["role"] == "assistant"
                && m["content"]
                    .as_str()
                    .is_some_and(|c| c.starts_with("[Compacted history]\nKEY-SUMMARY-OK"))
        }),
        "expected /compact on user_parts turn to compact: {parts_messages:?}"
    );

    stop.cancel();
    worker.await.unwrap();
}
