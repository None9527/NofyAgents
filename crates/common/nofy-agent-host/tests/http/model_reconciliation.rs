use super::*;
use nofy_agent_runtime::{
    governance::{BudgetScope, BudgetStore},
    registry::{ModuleInstance, ModuleRef},
};
fn r(id: &str) -> Value {
    json!({"id":id,"version":"1"})
}
pub(super) fn source(url: &str, child: bool, unmetered: bool) -> Value {
    let mut source: Value =
        serde_json::from_str(include_str!("../../examples/system.json")).unwrap();
    source["name"] = json!("model-evidence");
    source["modules"][0]["config"]["connection"]["base_url"] = json!(format!("{url}/v1"));
    source["modules"][0]["config"]["connection"]["max_completion_tokens"] = json!(16);
    source["modules"][0]["config"]["models"] = json!(["test-model"]);
    source["modules"][0]["config"]["request_limits"] =
        json!({"test-model":{"max_input_tokens":64,"max_output_tokens":32}});
    source["modules"][1]["config"]["model"] = json!("test-model");
    source["required_governance"] = json!([r("quota")]);
    source["modules"].as_array_mut().unwrap().extend([
        json!({"reference":r("ledger"),"factory":"resource.budget","config":{}}),
        json!({"reference":r("quota"),"factory":"governance.budget_connected","config":{"limits":{"max_model_calls":2,"max_tool_calls":3}},"dependencies":{"budget":r("ledger")}}),
        json!({"reference":r("service"),"factory":"resource.http","config":{"base_url":format!("{url}/"),"methods":["POST"]}}),
        json!({"reference":r("effect"),"factory":"tool.http_connected","config":{"contract":{"name":"effect"},"path":"done","method":"POST"},"dependencies":{"connection":r("service")}})
    ]);
    let definition = json!({"name":"sampled-agent","model":r("model"),"prompt":r("prompt"),"tool_packs":[r("effect")]});
    source["programs"] = if child {
        json!({"execute":{"kind":"workflow","input":{},"document":{"host":{"name":"workflow-root"},"entry":r("main"),"agents":[{"reference":r("worker"),"definition":definition}],"tool_runtimes":[{"reference":r("tools"),"definition":{"name":"effects","tool_packs":[r("effect")]}}],"workflows":[{"reference":r("main"),"input_schema":true,"output_schema":true,"nodes":[
            {"id":"agent","input":{"from":"literal","value":"continue"},"action":{"kind":"agent","agent":r("worker")}},
            {"id":"effect","needs":["agent"],"input":{"from":"literal","value":{}},"action":{"kind":"tool","runtime":r("tools"),"tool":"effect"}}
        ],"output":{"from":"node","node":"effect"}}]}}})
    } else {
        json!({"execute":{"kind":"agent","definition":definition}})
    };
    if unmetered {
        source
            .as_object_mut()
            .unwrap()
            .remove("required_governance");
        source["modules"].as_array_mut().unwrap().retain(|m| {
            m["factory"] != "resource.budget" && m["factory"] != "governance.budget_connected"
        });
        source["modules"]
            .as_array_mut()
            .unwrap()
            .push(json!({"reference":r("journal"),"factory":"binding.model_journal","config":{}}));
        if child {
            source["programs"]["execute"]["document"]["host"]["bindings"] = json!([r("journal")]);
        } else {
            source["programs"]["execute"]["definition"]["bindings"] = json!([r("journal")]);
        }
    }
    source
}
#[tokio::test]
async fn uncertain_model_process() {
    let Ok(directory) = std::env::var("NOFY_MODEL_EVIDENCE_STATE") else {
        return;
    };
    let url = std::env::var("NOFY_MODEL_EVIDENCE_SERVICE").unwrap();
    let child = std::env::var("NOFY_MODEL_EVIDENCE_CHILD").unwrap() == "yes";
    let unmetered = std::env::var("NOFY_MODEL_EVIDENCE_UNMETERED").unwrap_or_default() == "yes";
    let host = host(
        std::path::Path::new(&directory),
        Arc::new(AtomicUsize::new(0)),
    )
    .await;
    let document = source(&url, child, unmetered);
    let registry = host
        .control()
        .prepare(serde_json::from_value(document.clone()).unwrap())
        .unwrap()
        .registry()
        .clone();
    let server = serve(host.router()).await;
    let release = post(&server, "/api/v1/import", document).await["bundle"]["digest"].clone();
    let mut run = json!({"run_id":"root","thread_id":"thread","system":"model-evidence","release":release,"program":"execute"});
    if !child {
        run["input"] = json!({"text":"continue","attachments":[]});
    }
    post(&server, "/api/v1/runs", run).await;
    let supervisor = nofy_agent_runtime::supervisor::RunSupervisor::new(host.store().clone())
        .with_lease_ttl(Duration::from_secs(2))
        .unwrap();
    tokio::spawn(async move {
        supervisor
            .execute_submitted(&registry, "root")
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
async fn targets(server: &Serving, target: &str) -> Value {
    let mut url =
        reqwest::Url::parse(&format!("{}/api/v1/runs/root/recovery/models", server.url)).unwrap();
    url.query_pairs_mut().append_pair("target_run_id", target);
    let response = reqwest::Client::new()
        .get(url)
        .bearer_auth(VIEW)
        .send()
        .await
        .unwrap();
    let status = response.status();
    let body: Value = response.json().await.unwrap();
    assert_eq!(status, 200, "{body}");
    body
}
#[tokio::test]
async fn real_model_intent_reconciles_root_or_workflow_child_without_repeating_the_original_request()
 {
    for unmetered in [false, true] {
        for child in [false, true] {
            let initial = Arc::new(AtomicUsize::new(0));
            let followups = Arc::new(AtomicUsize::new(0));
            let effects = Arc::new(AtomicUsize::new(0));
            let count = initial.clone();
            let started = initial.clone();
            let next = followups.clone();
            let done = effects.clone();
            let finish = CancellationToken::new();
            let pending = finish.clone();
            let service = serve(
                Router::new()
                    .route(
                        "/v1/chat/completions",
                        route_post(move |Json(body): Json<Value>| {
                            let started = started.clone();
                            let next = next.clone();
                            let pending = pending.clone();
                            async move {
                                if body["messages"]
                                    .as_array()
                                    .unwrap()
                                    .iter()
                                    .any(|m| m["role"] == "tool")
                                {
                                    next.fetch_add(1, Ordering::SeqCst);
                                } else {
                                    started.fetch_add(1, Ordering::SeqCst);
                                    pending.cancelled().await;
                                }
                                Sse::new(futures::stream::iter(
                                    nofy_test_support::sse::chat_completion_events_exact(
                                        "finished",
                                        "test-model",
                                    )
                                    .into_iter()
                                    .map(Ok::<_, Infallible>),
                                ))
                            }
                        }),
                    )
                    .route(
                        "/done",
                        route_post(move || {
                            let done = done.clone();
                            async move {
                                done.fetch_add(1, Ordering::SeqCst);
                                Json(json!({"done":true}))
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
                        "model_reconciliation::uncertain_model_process",
                        "--nocapture",
                    ])
                    .env("NOFY_MODEL_EVIDENCE_STATE", directory)
                    .env("NOFY_MODEL_EVIDENCE_SERVICE", url)
                    .env(
                        "NOFY_MODEL_EVIDENCE_CHILD",
                        if child { "yes" } else { "no" },
                    )
                    .env(
                        "NOFY_MODEL_EVIDENCE_UNMETERED",
                        if unmetered { "yes" } else { "no" },
                    )
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
            tokio::time::sleep(Duration::from_millis(2100)).await;
            let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
            let prepared = host
                .control()
                .prepare(serde_json::from_value(source(&service.url, child, unmetered)).unwrap())
                .unwrap();
            let scope = if unmetered {
                None
            } else {
                let resolved = prepared
                    .registry()
                    .resolve(&[ModuleRef::new("quota", "1")])
                    .unwrap();
                let ModuleInstance::Governance(profile) =
                    &resolved.instances[&ModuleRef::new("quota", "1")]
                else {
                    panic!("quota")
                };
                Some(BudgetScope {
                    root_run_id: "root".into(),
                    identity: profile.identity().into(),
                })
            };
            let server = serve(host.router()).await;
            let stop = CancellationToken::new();
            let worker_stop = stop.clone();
            let worker_host = host.clone();
            let worker =
                tokio::spawn(async move { worker_host.run_worker(worker_stop, 1).await.unwrap() });
            let paused = outcome(&server, "root").await;
            assert_eq!(paused["execution"]["status"], "paused", "{paused}");
            let target = if child {
                paused["children"]
                    .as_array()
                    .unwrap()
                    .iter()
                    .find(|c| c["kind"] == "agent")
                    .unwrap()["run_id"]
                    .as_str()
                    .unwrap()
                    .to_owned()
            } else {
                "root".into()
            };
            let page = targets(&server, &target).await;
            assert_eq!(page.as_array().unwrap().len(), 1, "{page}");
            assert_eq!(
                page[0]
                    .get("unmetered")
                    .and_then(Value::as_bool)
                    .unwrap_or(false),
                unmetered
            );
            let response = nofy_agent_runtime::ModelResponse {
                output: "evidence-result".into(),
                input_tokens: 3,
                output_tokens: 2,
                tool_calls: if child {
                    vec![]
                } else {
                    vec![nofy_agent_runtime::ToolCall {
                        id: "finish".into(),
                        name: "effect".into(),
                        arguments: json!({}),
                    }]
                },
                ..Default::default()
            };
            let command = json!({"command_id":"model-proof","run_id":"root","command":{"kind":"reconcile_model","receipt":{"ticket":page[0]["ticket"],"result":{"kind":"completed","response":response}}}});
            for (id, field, value) in [
                ("wrong-generation", "generation", json!(1)),
                (
                    "wrong-fingerprint",
                    "request_fingerprint",
                    json!("0".repeat(64)),
                ),
                ("foreign-run", "run_id", json!("foreign")),
                ("wrong-scope", "operation_scope", json!("other")),
            ] {
                let mut bad = command.clone();
                bad["command_id"] = json!(id);
                bad["command"]["receipt"]["ticket"]["request"][field] = value;
                post(&server, "/api/v1/actions", bad).await;
                assert!(action_result(&server, id).await["error"].is_string());
                assert_eq!(initial.load(Ordering::SeqCst), 1);
                assert_eq!(effects.load(Ordering::SeqCst), 0);
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
            let settled = action_result(&server, "model-proof").await;
            assert!(settled["error"].is_null(), "{settled}");
            assert_eq!(
                outcome(&server, "root").await["execution"]["status"],
                "completed"
            );
            assert!(
                targets(&server, &target)
                    .await
                    .as_array()
                    .unwrap()
                    .is_empty()
            );
            assert_eq!(
                post(&server, "/api/v1/actions", command.clone()).await,
                settled
            );
            let mut bad = command.clone();
            bad["command_id"] = json!("changed-response");
            bad["command"]["receipt"]["result"]["response"]["output"] = json!("replacement");
            post(&server, "/api/v1/actions", bad).await;
            assert!(action_result(&server, "changed-response").await["error"].is_string());
            let mut same = command;
            same["command_id"] = json!("same-response");
            post(&server, "/api/v1/actions", same).await;
            assert!(action_result(&server, "same-response").await["error"].is_null());
            if let Some(scope) = &scope {
                let summary = host.store().inspect(scope).await.unwrap().unwrap();
                assert_eq!(summary.used.model_calls, if child { 1 } else { 2 });
                assert!(
                    summary.used.input_tokens
                        >= page[0]["reserved"]["input_tokens"].as_u64().unwrap()
                        && summary.used.output_tokens
                            >= page[0]["reserved"]["output_tokens"].as_u64().unwrap()
                );
                assert_eq!(
                    summary.reserved,
                    nofy_agent_runtime::governance::BudgetCost::default()
                );
            } else {
                assert_eq!(
                    page[0]["reserved"],
                    serde_json::to_value(nofy_agent_runtime::governance::BudgetCost::default())
                        .unwrap()
                );
            }
            assert_eq!(initial.load(Ordering::SeqCst), 1);
            assert_eq!(followups.load(Ordering::SeqCst), usize::from(!child));
            assert_eq!(effects.load(Ordering::SeqCst), 1);
            finish.cancel();
            stop.cancel();
            worker.await.unwrap();
        }
    }
}
