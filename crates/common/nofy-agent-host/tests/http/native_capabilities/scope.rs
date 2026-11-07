use super::*;
use nofy_agent_runtime::{
    governance::{BudgetScope, BudgetStore},
    registry::{ModuleInstance, ModuleRef},
};

async fn model(
    State(requests): State<Arc<Mutex<Vec<Value>>>>,
    Json(body): Json<Value>,
) -> impl IntoResponse {
    requests.lock().unwrap().push(body.clone());
    let name = body["model"].as_str().unwrap();
    let has_result = body["messages"]
        .as_array()
        .unwrap()
        .iter()
        .any(|m| m["role"] == "tool");
    let events = if has_result {
        nofy_test_support::sse::chat_completion_script_exact(
            if name == "skill-model" {
                "scoped complete"
            } else {
                "parent complete"
            },
            name,
        )
    } else {
        let (tool, args) = if name == "skill-model" {
            ("lookup", json!({}))
        } else {
            ("skill", json!({"skill":"review","args":"work"}))
        };
        nofy_test_support::sse::chat_completions_reasoning_then_tool_call_events(
            "",
            &format!("{name}-call"),
            tool,
            &args.to_string(),
            name,
        )
    };
    Sse::new(futures::stream::iter(events.into_iter().map(|event| {
        Ok::<_, Infallible>(axum::response::sse::Event::default().data(event.data))
    })))
}
pub(super) fn system(provider: &str, service: &str, allow_lookup: bool, model_calls: u64) -> Value {
    let r = |id: &str| json!({"id":id,"version":"1"});
    let mut system = source();
    let baseline = serde_json::to_value(document(provider)).unwrap();
    system["modules"].as_array_mut().unwrap().extend(
        baseline["modules"]
            .as_array()
            .unwrap()
            .iter()
            .filter(|module| module["reference"]["id"] != "prompt")
            .cloned(),
    );
    config(&mut system, "provider")["models"] = json!(["test-model", "skill-model"]);
    let skill = config(&mut system, "skills");
    skill["skills"][0]["body"] = json!("Research task: $ARGUMENTS");
    skill["skills"][0]["model"] = json!("fast");
    skill["skills"][0]["effort"] = json!("high");
    skill["skills"][0]["allowed_tools"] = json!(["lookup"]);
    skill["execution"] = json!({"default_model":"child","models":{"fast":"child"},"tool_packs":["work","forbidden"],"policies":["approval"],"model_settings":{"temperature":0.2},"max_steps":8});
    let skills = system["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|module| module["reference"]["id"] == "skills")
        .unwrap();
    skills["dependencies"] = json!({"child":r("child-model"),"work":r("lookup"),"forbidden":r("write"),"approval":r("approval")});
    system["modules"].as_array_mut().unwrap().extend([
        json!({"reference":r("child-model"),"factory":"model.programmed","config":{"model":"skill-model"},"dependencies":{"connection":r("provider"),"protocol":r("protocol")}}),
        json!({"reference":r("service"),"factory":"resource.http","config":{"base_url":format!("{service}/api/"),"methods":["POST"]}}),
        json!({"reference":r("lookup"),"factory":"tool.http_connected","config":{"contract":{"name":"lookup"},"path":"lookup","method":"POST"},"dependencies":{"connection":r("service")}}),
        json!({"reference":r("write"),"factory":"tool.http_connected","config":{"contract":{"name":"write"},"path":"write","method":"POST"},"dependencies":{"connection":r("service")}}),
        json!({"reference":r("approval"),"factory":"policy.approval","config":{}}),
        json!({"reference":r("floor"),"factory":"policy.tool_scope","config":{"allowed":if allow_lookup {json!(["skill","lookup"])} else {json!(["skill"])}}}),
        json!({"reference":r("ledger"),"factory":"resource.budget","config":{}}),
        json!({"reference":r("quota"),"factory":"governance.budget_connected","config":{"limits":{"max_model_calls":model_calls,"max_tool_calls":8,"max_child_calls":2}},"dependencies":{"budget":r("ledger")}}),
    ]);
    system["required_policies"] = json!([r("floor")]);
    system["required_governance"] = json!([r("quota")]);
    system["programs"] = json!({"chat":{"kind":"agent","definition":{"name":"native-parent","model":r("model"),"prompt":r("prompt"),"tool_packs":[r("skills")],"settings":{"max_steps":8,"model":{"temperature":0.1,"reasoning_effort":"low"}}}}});
    system
}

#[tokio::test]
async fn resident_scoped_substitution_failure_does_not_start_child_or_reset_root_budget() {
    if !workers_confined() {
        return;
    }
    let requests = Arc::new(Mutex::new(Vec::<Value>::new()));
    let observed = requests.clone();
    let provider = serve(Router::new().route(
        "/v1/chat/completions",
        route_post(move |Json(body): Json<Value>| {
            let observed = observed.clone();
            async move {
                observed.lock().unwrap().push(body.clone());
                let has_result = body["messages"]
                    .as_array()
                    .unwrap()
                    .iter()
                    .any(|message| message["role"] == "tool");
                let events = if has_result {
                    nofy_test_support::sse::chat_completion_script_exact(
                        "parent observed substitution failure",
                        "test-model",
                    )
                } else {
                    nofy_test_support::sse::chat_completions_reasoning_then_tool_call_events(
                        "",
                        "oversized-skill",
                        "skill",
                        &json!({"skill":"review","args":"x".repeat(65_536)}).to_string(),
                        "test-model",
                    )
                };
                Sse::new(futures::stream::iter(events.into_iter().map(|event| {
                    Ok::<_, Infallible>(axum::response::sse::Event::default().data(event.data))
                })))
            }
        }),
    ))
    .await;
    let effects = Arc::new(AtomicUsize::new(0));
    let calls = effects.clone();
    let service = serve(Router::new().route(
        "/api/lookup",
        route_post(move || {
            let calls = calls.clone();
            async move {
                calls.fetch_add(1, Ordering::SeqCst);
                Json(json!({"effect":true}))
            }
        }),
    ))
    .await;
    let reads = Arc::new(AtomicUsize::new(0));
    let dir = tempfile::tempdir().unwrap();
    let host = resident(dir.path(), reads.clone()).await;
    let server = serve(host.router()).await;
    let mut source = system(&provider.url, &service.url, true, 4);
    config(&mut source, "skills")["skills"][0]["body"] = json!("$ARGUMENTS".repeat(1024));
    let compiled = host
        .control()
        .prepare(serde_json::from_value(source.clone()).unwrap())
        .unwrap();
    let quota_ref = ModuleRef::new("quota", "1");
    let resolved = compiled
        .registry()
        .resolve(std::slice::from_ref(&quota_ref))
        .unwrap();
    let ModuleInstance::Governance(quota) = &resolved.instances[&quota_ref] else {
        panic!("quota")
    };
    let scope = BudgetScope {
        root_run_id: "scoped-expansion".into(),
        identity: quota.identity().into(),
    };
    let release = post(&server, "/api/v1/import", source).await;
    let stop = CancellationToken::new();
    let worker_host = host.clone();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 1).await.unwrap() });
    post(
        &server,
        "/api/v1/runs",
        launch(
            release["bundle"]["digest"].as_str().unwrap(),
            "scoped-expansion",
            "chat",
        ),
    )
    .await;
    let outcome = outcome(&server, "scoped-expansion").await;
    assert_eq!(outcome["execution"]["status"], "completed", "{outcome}");
    let requests = requests.lock().unwrap().clone();
    assert_eq!(requests.len(), 2);
    assert!(
        requests
            .iter()
            .all(|request| request["model"] == "test-model")
    );
    let result = requests[1]["messages"]
        .as_array()
        .unwrap()
        .iter()
        .find(|message| message["role"] == "tool")
        .unwrap();
    assert!(
        result
            .to_string()
            .contains("substitution output exceeds byte limit"),
        "{result}"
    );
    assert!(!result.to_string().contains("xxxx"));
    assert_eq!(effects.load(Ordering::SeqCst), 0);
    assert_eq!(reads.load(Ordering::SeqCst), 2);
    assert!(
        host.store()
            .children("scoped-expansion")
            .await
            .unwrap()
            .is_empty()
    );
    let (status, approvals) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/runs/scoped-expansion/approvals",
        ADMIN,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200, "{approvals}");
    assert!(approvals.as_array().unwrap().is_empty(), "{approvals}");
    let summary = host.store().inspect(&scope).await.unwrap().unwrap();
    assert_eq!(summary.used.model_calls, 2);
    assert_eq!(summary.used.tool_calls, 1);
    assert_eq!(summary.used.child_calls, 0);
    stop.cancel();
    worker.await.unwrap();
}

#[tokio::test]
async fn native_skill_child_keeps_model_scope_parent_floor_approval_budget_and_completed_effects() {
    if !workers_confined() {
        return;
    }
    let requests = Arc::new(Mutex::new(Vec::<Value>::new()));
    let provider = serve(
        Router::new()
            .route("/v1/chat/completions", route_post(model))
            .with_state(requests.clone()),
    )
    .await;
    let calls = Arc::new(AtomicUsize::new(0));
    let effects = calls.clone();
    let writes = Arc::new(AtomicUsize::new(0));
    let denied = writes.clone();
    let service = serve(
        Router::new()
            .route(
                "/api/lookup",
                route_post(move || {
                    let effects = effects.clone();
                    async move {
                        effects.fetch_add(1, Ordering::SeqCst);
                        Json(json!({"evidence":"available"}))
                    }
                }),
            )
            .route(
                "/api/write",
                route_post(move || {
                    let denied = denied.clone();
                    async move {
                        denied.fetch_add(1, Ordering::SeqCst);
                        Json(json!({"written":true}))
                    }
                }),
            ),
    )
    .await;
    let dir = tempfile::tempdir().unwrap();
    let host = resident(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker_host = host.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 2).await.unwrap() });
    for (id, allowed, limit, status) in [
        ("floor-denied", false, 4, "completed"),
        ("approved-child", true, 4, "completed"),
        ("limited-child", true, 3, "budget_exceeded"),
    ] {
        let source = system(&provider.url, &service.url, allowed, limit);
        let compiled = host
            .control()
            .prepare(serde_json::from_value(source.clone()).unwrap())
            .unwrap();
        let resolved = compiled
            .registry()
            .resolve(&[ModuleRef::new("quota", "1")])
            .unwrap();
        let ModuleInstance::Governance(quota) = &resolved.instances[&ModuleRef::new("quota", "1")]
        else {
            panic!("quota")
        };
        let scope = BudgetScope {
            root_run_id: id.into(),
            identity: quota.identity().into(),
        };
        let release = post(&server, "/api/v1/import", source).await;
        post(
            &server,
            "/api/v1/runs",
            launch(release["bundle"]["digest"].as_str().unwrap(), id, "chat"),
        )
        .await;
        if allowed {
            let paused = outcome(&server, id).await;
            assert_eq!(paused["execution"]["status"], "paused", "{paused}");
            let before = calls.load(Ordering::SeqCst);
            let (_, pending) = request(
                &server,
                reqwest::Method::GET,
                &format!("/api/v1/runs/{id}/approvals"),
                VIEW,
                Value::Null,
            )
            .await;
            assert_eq!(pending.as_array().unwrap().len(), 1, "{pending}");
            assert_eq!(pending[0]["call"]["name"], "lookup");
            let model_before = requests.lock().unwrap().len();
            assert_eq!(model_before % 4, 2);
            let (status, _) = request(
                &server,
                reqwest::Method::POST,
                &format!("/api/v1/runs/{id}/approvals"),
                ADMIN,
                json!({"request":pending[0],"allow":true}),
            )
            .await;
            assert_eq!(status, 204);
            let action = json!({"run_id":id,"command_id":format!("resume-{id}"),"command":{"kind":"resume"}});
            post(&server, "/api/v1/actions", action.clone()).await;
            let receipt = action_result(&server, action["command_id"].as_str().unwrap()).await;
            assert!(receipt["error"].is_null(), "{receipt}");
            assert_eq!(calls.load(Ordering::SeqCst), before + 1);
            assert_eq!(post(&server, "/api/v1/actions", action).await, receipt);
        }
        let result = outcome(&server, id).await;
        assert_eq!(result["execution"]["status"], status, "{result}");
        if !allowed {
            assert_eq!(calls.load(Ordering::SeqCst), 0);
        }
        let summary = host.store().inspect(&scope).await.unwrap().unwrap();
        assert_eq!(summary.used.model_calls, limit);
        assert_eq!(summary.used.child_calls, 1);
        assert_eq!(writes.load(Ordering::SeqCst), 0);
        let children = host.store().children(id).await.unwrap();
        assert!(
            children
                .iter()
                .any(|child| child.agent_name == "skill:review")
        );
        if status == "budget_exceeded" {
            let before = requests.lock().unwrap().len();
            let effects = calls.load(Ordering::SeqCst);
            post(
                &server,
                "/api/v1/actions",
                json!({"run_id":id,"command_id":"same-budget","command":{"kind":"resume"}}),
            )
            .await;
            assert!(action_result(&server, "same-budget").await["error"].is_null());
            assert_eq!(requests.lock().unwrap().len(), before);
            assert_eq!(calls.load(Ordering::SeqCst), effects);
            assert_eq!(
                host.store().inspect(&scope).await.unwrap().unwrap().used,
                summary.used
            );
        }
    }
    let requests = requests.lock().unwrap().clone();
    for request in requests {
        let child = request["model"] == "skill-model";
        assert_eq!(
            request["temperature"],
            if child { json!(0.2) } else { json!(0.1) }
        );
        assert_eq!(
            request["reasoning_effort"],
            if child { "high" } else { "low" }
        );
        let names = request["tools"]
            .as_array()
            .unwrap()
            .iter()
            .map(|tool| tool["function"]["name"].as_str().unwrap())
            .collect::<Vec<_>>();
        assert_eq!(names, if child { vec!["lookup"] } else { vec!["skill"] });
        if child {
            assert!(
                request["messages"][0]["content"]
                    .as_str()
                    .unwrap()
                    .contains("Research task: work")
            );
        }
    }
    assert_eq!(calls.load(Ordering::SeqCst), 2);
    stop.cancel();
    worker.await.unwrap();
}
