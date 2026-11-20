use super::*;
use std::collections::BTreeSet;

fn names(operations: &Value) -> BTreeSet<String> {
    operations
        .as_array()
        .unwrap()
        .iter()
        .filter_map(|op| op["mcp_tool"].as_str().map(str::to_owned))
        .collect()
}

pub(super) async fn connect(
    url: &str,
    toolset: Option<Toolset>,
) -> rmcp::service::RunningService<rmcp::RoleClient, ClientConfig> {
    let mut command = tokio::process::Command::new(env!("CARGO_BIN_EXE_nofy"));
    command
        .env("NOFY_ACCESS_TOKEN", ADMIN)
        .env_remove("NOFY_CONFIG")
        .env_remove("NOFY_PROFILE")
        .args([
            "mcp",
            "serve",
            "--endpoint",
            url,
            "--token-env",
            "NOFY_ACCESS_TOKEN",
        ])
        .args(
            toolset
                .into_iter()
                .flat_map(|view| ["--toolset", view.name()]),
        );
    client_info()
        .serve(TokioChildProcess::new(command).unwrap())
        .await
        .unwrap()
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn sdk_cli_and_mcp_share_the_profile_and_hidden_calls_stay_hidden() {
    let directory = tempfile::tempdir().unwrap();
    let kernel = host(directory.path()).await;
    let server = serve(kernel.router()).await;
    for (selection, toolset) in [
        (None, Toolset::Run),
        (Some(Toolset::Development), Toolset::Development),
        (Some(Toolset::Operations), Toolset::Operations),
        (Some(Toolset::Full), Toolset::Full),
    ] {
        let client = connect(&server.url, selection).await;
        let listed: BTreeSet<_> = client
            .list_all_tools()
            .await
            .unwrap()
            .iter()
            .map(|tool| tool.name.to_string())
            .collect();
        let described = mcp_call(&client, "nofy_describe", json!({"include_details":true})).await;
        assert_eq!(described["data"]["toolset"], toolset.name());
        assert_eq!(names(&described["data"]["operations"]), listed);
        let sdk_client =
            KernelClient::new(&server.url, Some(ADMIN.into()), Duration::from_secs(10)).unwrap();
        let mut sdk = Engine::new(sdk_client);
        if let Some(toolset) = selection {
            sdk = sdk.with_operation_view(toolset.sdk());
        }
        let result = sdk.execute("describe", json!({})).await;
        assert!(!result.is_error(), "{result:?}");
        assert_eq!(result.data["toolset"], toolset.name());
        assert_eq!(names(&result.data["operations"]), listed);
        let (exit, cli) = cli_with_toolset(&server.url, &["describe"], selection).await;
        assert_eq!(exit, 0, "{cli}");
        assert_eq!(names(&cli["data"]["operations"]), listed);
        if toolset == Toolset::Run {
            assert_eq!(listed.len(), 21);
            assert!(listed.contains("nofy_work_list"));
            assert!(listed.contains("nofy_work_inspect"));
            let hidden = client
                .call_tool(CallToolRequestParams::new("nofy_system_apply"))
                .await;
            assert!(hidden.is_err(), "hidden tool calls must be rejected");
            let schema = sdk
                .execute("schema", json!({"operation":"system.apply"}))
                .await;
            assert_eq!(schema.error.unwrap()["code"], "unsupported_operation");
            let (exit, denied) =
                cli_with_toolset(&server.url, &["call", "system.apply"], None).await;
            assert_ne!(exit, 0);
            assert_eq!(denied["error"]["code"], "unsupported_operation");
            let scoped_schema = client
                .call_tool(
                    CallToolRequestParams::new("nofy_schema").with_arguments(
                        json!({"operation":"system.apply"})
                            .as_object()
                            .unwrap()
                            .clone(),
                    ),
                )
                .await
                .unwrap();
            assert_eq!(scoped_schema.is_error, Some(true));
            let catalog = client
                .read_resource(ReadResourceRequestParams::new("nofy://schemas/operations"))
                .await
                .unwrap();
            let ResourceContents::TextResourceContents { text, .. } = &catalog.contents[0] else {
                panic!("expected text catalog")
            };
            let catalog: Value = serde_json::from_str(text).unwrap();
            assert_eq!(names(&catalog["operations"]), listed);
        }
        if toolset == Toolset::Development {
            assert!(listed.contains("nofy_agent_build"));
            assert!(!listed.contains("nofy_system_apply"));
        }
        if toolset == Toolset::Operations {
            assert!(listed.contains("nofy_system_apply"));
            assert!(!listed.contains("nofy_agent_build"));
        }
        if toolset == Toolset::Full {
            assert_eq!(listed.len(), 102);
            assert!(!listed.contains("nofy_credential_put"));
        }
        client.cancel().await.unwrap();
    }
}

async fn wait_for_status(client: &rmcp::Peer<rmcp::RoleClient>, status: &str) {
    tokio::time::timeout(Duration::from_secs(20), async {
        loop {
            let result =
                mcp_call(client, "nofy_run_inspect", json!({"run_id":"approval-run"})).await;
            let record: Value =
                serde_json::from_str(result["data"]["native_json"].as_str().unwrap()).unwrap();
            if record["execution"]["status"] == status {
                break;
            }
            assert_ne!(record["execution"]["status"], "failed", "{record}");
            tokio::time::sleep(Duration::from_millis(50)).await;
        }
    })
    .await
    .unwrap_or_else(|_| panic!("run never reached {status}"));
}

#[tokio::test(flavor = "multi_thread", worker_threads = 3)]
async fn default_mcp_starts_session_approves_and_completes_one_effect() {
    let effects = Arc::new(AtomicUsize::new(0));
    let counted = effects.clone();
    let destination = serve(axum::Router::new().route(
        "/apply",
        axum::routing::post(move || {
            let counted = counted.clone();
            async move {
                counted.fetch_add(1, Ordering::SeqCst);
                axum::Json(json!({"applied":true}))
            }
        }),
    ))
    .await;
    let provider = serve(axum::Router::new().route(
        "/v1/chat/completions",
        axum::routing::post(|axum::Json(body): axum::Json<Value>| async move {
            let last = body["messages"].as_array().unwrap().last().unwrap();
            let frames = if last["role"] == "tool" {
                assert!(last["content"].to_string().contains("applied"));
                nofy_test_support::sse::chat_completion_events_exact(
                    "Effect applied",
                    "local-model",
                )
            } else {
                super::omni::tool_call("one-effect", "apply_effect", json!({}))
            };
            axum::response::Sse::new(futures::stream::iter(
                frames.into_iter().map(Ok::<_, std::convert::Infallible>),
            ))
        }),
    ))
    .await;
    let directory = tempfile::tempdir().unwrap();
    let kernel = host(directory.path()).await;
    let server = serve(kernel.router()).await;
    let mut document: Value = serde_json::from_str(include_str!(
        "../../../nofy-agent-host/examples/code-system.json"
    ))
    .unwrap();
    document["name"] = json!("approval-system");
    let reference = |id: &str| json!({"id":id,"version":"1"});
    let modules = document["modules"].as_array_mut().unwrap();
    modules.retain(|module| {
        matches!(
            module["reference"]["id"].as_str(),
            Some("provider" | "model" | "protocol" | "protocol-code" | "prompt")
        )
    });
    let connection = modules
        .iter_mut()
        .find(|module| module["reference"]["id"] == "provider")
        .unwrap();
    connection["config"]["base_url"] = json!(format!("{}/v1/", provider.url));
    connection["config"]["header_credentials"] = json!({});
    modules.extend([
        json!({"reference":reference("service"),"factory":"resource.http","config":{"base_url":format!("{}/",destination.url),"methods":["POST"]}}),
        json!({"reference":reference("effect"),"factory":"tool.http_connected","config":{"contract":{"name":"apply_effect"},"path":"apply","method":"POST"},"dependencies":{"connection":reference("service")}}),
        json!({"reference":reference("require-approval"),"factory":"policy.approval","config":{}}),
    ]);
    document["required_policies"] = json!([reference("require-approval")]);
    document["programs"]
        .as_object_mut()
        .unwrap()
        .retain(|name, _| name == "chat");
    let main = document["programs"]["chat"]["definition"]
        .as_object_mut()
        .unwrap();
    main.remove("hooks");
    main.insert("tool_packs".into(), json!([reference("effect")]));
    let release = engine(&server.url, ADMIN)
        .execute(
            "system.publish",
            json!({"document_json":document.to_string()}),
        )
        .await;
    assert!(!release.is_error(), "{release:?}");
    let request = json!({"run_id":"approval-run","thread_id":"approval-thread","system":"approval-system","release":release.refs["release"],"program":"chat","input":{"text":"Apply the effect","attachments":[]}});
    let client = connect(&server.url, None).await;
    let start = json!({"session_id":"approval-session","command_id":"start-once","expected_session_revision":null,"request_json":request.to_string()});
    let submitted = mcp_call(&client, "nofy_session_start", start.clone()).await;
    assert_eq!(submitted["data"]["phase"], "applied");
    let shutdown = tokio_util::sync::CancellationToken::new();
    let worker_stop = shutdown.clone();
    let worker = tokio::spawn(async move { kernel.run_worker(worker_stop, 2).await.unwrap() });
    wait_for_status(&client, "paused").await;
    assert_eq!(effects.load(Ordering::SeqCst), 0);
    let selection = json!({"run_id":"approval-run","work_id":"approval-run"});
    let projected = mcp_call(&client, "nofy_work_inspect", selection.clone()).await;
    assert_eq!(projected["data"]["blocked_by"]["kind"], "approval");
    let sdk_work = engine(&server.url, READ)
        .execute("work.inspect", selection)
        .await;
    assert_eq!(projected["data"], sdk_work.data);
    let (exit, cli_work) = cli_with_toolset(
        &server.url,
        &[
            "work",
            "inspect",
            "--run-id",
            "approval-run",
            "--work-id",
            "approval-run",
        ],
        None,
    )
    .await;
    assert_eq!(exit, 0, "{cli_work}");
    assert_eq!(projected["data"], cli_work["data"]);
    let approvals = mcp_call(
        &client,
        "nofy_run_approvals",
        json!({"run_id":"approval-run"}),
    )
    .await;
    let approvals: Value =
        serde_json::from_str(approvals["data"]["native_json"].as_str().unwrap()).unwrap();
    assert_eq!(approvals.as_array().unwrap().len(), 1);
    let decision = json!({"request":approvals[0],"allow":true,"continue_run":true});
    mcp_call(
        &client,
        "nofy_run_decide",
        json!({"run_id":"approval-run","decision_json":decision.to_string()}),
    )
    .await;
    wait_for_status(&client, "completed").await;
    let settled = mcp_call(&client, "nofy_work_list", json!({"run_id":"approval-run"})).await;
    assert_eq!(settled["data"]["root"]["status"], "completed");
    assert!(settled["data"]["root"]["blocked_by"].is_null());
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    let replay = mcp_call(&client, "nofy_session_start", start).await;
    assert_eq!(replay["data"], submitted["data"]);
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    client.cancel().await.unwrap();
    shutdown.cancel();
    worker.await.unwrap();
}
