use super::*;
#[path = "modules/budgets.rs"]
mod budgets;
#[path = "modules/external.rs"]
mod external;
#[path = "modules/memory.rs"]
mod memory;
#[path = "modules/policies.rs"]
mod policies;
#[path = "modules/sources.rs"]
mod sources;

fn base_source(url: &str) -> Value {
    let mut doc = source(url, false);
    doc["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|m| m["reference"] == r("quota"))
        .unwrap()["config"]["limits"] = json!({"max_model_calls":5,"max_tool_calls":8});
    doc
}
fn updated_source(url: &str, human: bool) -> Value {
    let mut doc = base_source(url);
    doc["modules"].as_array_mut().unwrap().extend([
        json!({"reference":r("updated"),"factory":"tool.http_connected","config":{"contract":{"name":"updated"},"path":"updated","method":"POST"},"dependencies":{"connection":r("service")}}),
        json!({"reference":r("updated-hook-tool"),"factory":"tool.http_connected","config":{"contract":{"name":"new_after"},"path":"new-after","method":"POST"},"dependencies":{"connection":r("service")}}),
        json!({"reference":r("updated-handler"),"factory":"hook.executor","config":{"tool":"new_after"},"dependencies":{"executor":r("updated-hook-tool")}}),
        json!({"reference":r("updated-hook"),"factory":"hook.subscription","config":{"event":"after_tool"},"dependencies":{"handler":r("updated-handler")}}),
    ]);
    doc["programs"]["execute"]["definition"]["tool_packs"] = json!([r("updated")]);
    doc["programs"]["execute"]["definition"]["hooks"] = json!([r("updated-hook")]);
    if human {
        let decision = json!({"type":"object","required":["decision"],"additionalProperties":false,"properties":{"decision":{"const":"continue"}}});
        let graph = json!({"host":{"name":"live-human-host"},"entry":r("approval"),"workflows":[{
            "reference":r("approval"),"input_schema":{"type":"object"},"output_schema":decision,
            "nodes":[{"id":"human","input":{"from":"literal","value":{"question":"continue"}},"action":{"kind":"human","response_schema":decision}}],
            "output":{"from":"node","node":"human"}
        }]});
        doc["modules"].as_array_mut().unwrap().extend([
            json!({"reference":r("live-human"),"factory":"resource.workflow","config":{"document":graph}}),
            json!({"reference":r("human-handler"),"factory":"hook.workflow_connected","config":{},"dependencies":{"workflow":r("live-human")}}),
            json!({"reference":r("human-hook"),"factory":"hook.subscription","config":{"event":"before_stop","timeout_ms":30000},"dependencies":{"handler":r("human-handler")}}),
        ]);
        doc["programs"]["execute"]["definition"]["hooks"]
            .as_array_mut()
            .unwrap()
            .push(r("human-hook"));
    }
    doc
}
async fn admit(host: &KernelHost, server: &Serving, url: &str, human: bool) {
    let doc = base_source(url);
    let registry = host
        .control()
        .prepare(serde_json::from_value(doc.clone()).unwrap())
        .unwrap()
        .registry()
        .clone();
    let published = post(server, "/api/v1/import", doc).await;
    post(server,"/api/v1/runs",json!({"run_id":"root","thread_id":"thread","system":"model-evidence","release":published["bundle"]["digest"],"program":"execute","input":{"text":"continue","attachments":[]}})).await;
    let supervisor = Arc::new(nofy_agent_runtime::supervisor::RunSupervisor::new(
        host.store().clone(),
    ));
    let worker = {
        let s = supervisor.clone();
        let r = registry.clone();
        tokio::spawn(async move { s.execute_submitted(&r, "root").await.unwrap() })
    };
    await_count(url, "models", 1).await;
    post(
        server,
        "/api/v1/actions",
        json!({"command_id":"park","run_id":"root","command":{"kind":"park"}}),
    )
    .await;
    release(url, "release-model").await;
    worker.await.unwrap();
    assert!(action_result(server, "park").await["error"].is_null());
    let original = content_digest(
        &host
            .store()
            .execution_job("root")
            .await
            .unwrap()
            .unwrap()
            .submission,
    )
    .unwrap();
    let resolved = registry.resolve(&[ModuleRef::new("quota", "1")]).unwrap();
    let ModuleInstance::Governance(profile) = &resolved.instances[&ModuleRef::new("quota", "1")]
    else {
        panic!("quota")
    };
    let scope = BudgetScope {
        root_run_id: "root".into(),
        identity: profile.identity().into(),
    };
    let budget = content_digest(&host.store().inspect(&scope).await.unwrap()).unwrap();
    let next = post(server, "/api/v1/import", updated_source(url, human)).await;
    let command = json!({"command_id":"modules","run_id":"root","command":{"kind":"update_modules","park_command_id":"park","expected_revision":0,"release":next["bundle"]["digest"],"program":"execute","update":{"tool_catalog":true,"hook_subscriptions":true}}});
    assert_eq!(
        request(
            server,
            reqwest::Method::POST,
            "/api/v1/actions",
            VIEW,
            command.clone()
        )
        .await
        .0,
        403
    );
    post(server, "/api/v1/actions", command.clone()).await;
    let applied = supervisor
        .execute_managed_action(&registry, "modules")
        .await
        .unwrap();
    assert!(applied.error.is_none(), "{:?}", applied.error);
    assert_eq!(
        post(server, "/api/v1/actions", command).await["finished"],
        true
    );
    assert_eq!(
        content_digest(&host.store().inspect(&scope).await.unwrap()).unwrap(),
        budget
    );
    assert_eq!(
        content_digest(
            &host
                .store()
                .execution_job("root")
                .await
                .unwrap()
                .unwrap()
                .submission
        )
        .unwrap(),
        original
    );
    assert_eq!(
        host.store()
            .live_execution("root")
            .await
            .unwrap()
            .unwrap()
            .protocol,
        "nofy.live/v2"
    );
}

#[tokio::test]
async fn module_update_process() {
    let Ok(path) = std::env::var("NOFY_MODULE_STATE") else {
        return;
    };
    let url = std::env::var("NOFY_MODULE_SERVICE").unwrap();
    let human = std::env::var("NOFY_MODULE_HUMAN").unwrap() == "yes";
    let host = host(std::path::Path::new(&path), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    admit(&host, &server, &url, human).await;
    std::process::exit(96);
}

#[tokio::test]
async fn live_tools_hooks_and_new_human_graph_run_after_same_process_update_or_hard_restart() {
    for (crash, human) in [(false, false), (true, true)] {
        let seen = Arc::new(Mutex::new(Vec::<Value>::new()));
        let models = Arc::new(AtomicUsize::new(0));
        let old_tools = Arc::new(AtomicUsize::new(0));
        let new_tools = Arc::new(AtomicUsize::new(0));
        let old_hooks = Arc::new(AtomicUsize::new(0));
        let new_hooks = Arc::new(AtomicUsize::new(0));
        let gate = CancellationToken::new();
        let waiting = gate.clone();
        let released = gate.clone();
        let calls = models.clone();
        let requests = seen.clone();
        let old = old_tools.clone();
        let new = new_tools.clone();
        let old_after = old_hooks.clone();
        let new_after = new_hooks.clone();
        let count = (
            models.clone(),
            old_tools.clone(),
            new_tools.clone(),
            old_hooks.clone(),
            new_hooks.clone(),
        );
        let service=serve(Router::new()
            .route("/v1/chat/completions",route_post(move |Json(body):Json<Value>|{let calls=calls.clone();let requests=requests.clone();let gate=waiting.clone();async move {
                calls.fetch_add(1,Ordering::SeqCst);requests.lock().unwrap().push(body.clone());
                let updated=body["tools"].as_array().unwrap().iter().any(|t|t["function"]["name"]=="updated");
                let done=body["messages"].as_array().unwrap().iter().any(|m|m["role"]=="tool"&&m["tool_call_id"]=="updated-call");
                let frames=if done {nofy_test_support::sse::chat_completion_events_exact("modules applied","test-model")}
                    else {if !updated {gate.cancelled().await;} nofy_test_support::sse::chat_completions_reasoning_then_tool_call_events("",if updated {"updated-call"} else {"old-call"},if updated {"updated"} else {"effect"},"{}","test-model").into_iter().map(|frame|axum::response::sse::Event::default().data(frame.data)).collect()};
                Sse::new(futures::stream::iter(frames.into_iter().map(Ok::<_,Infallible>)))
            }}))
            .route("/done",route_post(move ||{let old=old.clone();async move {old.fetch_add(1,Ordering::SeqCst);Json(json!({"old":true}))}}))
            .route("/updated",route_post(move ||{let new=new.clone();async move {new.fetch_add(1,Ordering::SeqCst);Json(json!({"new":true}))}}))
            .route("/after",route_post(move ||{let old=old_after.clone();async move {old.fetch_add(1,Ordering::SeqCst);Json(json!({"decision":"continue"}))}}))
            .route("/new-after",route_post(move ||{let new=new_after.clone();async move {new.fetch_add(1,Ordering::SeqCst);Json(json!({"decision":"continue"}))}}))
            .route("/count",axum::routing::get(move ||{let c=count.clone();async move {Json(json!({"models":c.0.load(Ordering::SeqCst),"old_tools":c.1.load(Ordering::SeqCst),"new_tools":c.2.load(Ordering::SeqCst),"old_hooks":c.3.load(Ordering::SeqCst),"new_hooks":c.4.load(Ordering::SeqCst)}))}}))
            .route("/release-model",route_post(move ||{let gate=released.clone();async move {gate.cancel();Json(json!({"ok":true}))}}))
        ).await;
        let directory = tempfile::tempdir().unwrap();
        if crash {
            let path = directory.path().to_owned();
            let url = service.url.clone();
            let output = tokio::task::spawn_blocking(move || {
                std::process::Command::new(std::env::current_exe().unwrap())
                    .args([
                        "--exact",
                        "parking::modules::module_update_process",
                        "--nocapture",
                    ])
                    .env("NOFY_MODULE_STATE", path)
                    .env("NOFY_MODULE_SERVICE", url)
                    .env("NOFY_MODULE_HUMAN", if human { "yes" } else { "no" })
                    .output()
                    .unwrap()
            })
            .await
            .unwrap();
            assert_eq!(
                output.status.code(),
                Some(96),
                "{}\n{}",
                String::from_utf8_lossy(&output.stdout),
                String::from_utf8_lossy(&output.stderr)
            );
        }
        let host = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
        let server = serve(host.router()).await;
        if !crash {
            admit(&host, &server, &service.url, human).await;
        }
        assert_eq!(
            service_count(&service.url).await,
            json!({"models":1,"old_tools":1,"new_tools":0,"old_hooks":1,"new_hooks":0})
        );
        let stop = CancellationToken::new();
        let stopped = stop.clone();
        let worker_host = host.clone();
        let worker = tokio::spawn(async move { worker_host.run_worker(stopped, 2).await.unwrap() });
        post(&server,"/api/v1/actions",json!({"command_id":"unpark","run_id":"root","command":{"kind":"unpark","park_command_id":"park"}})).await;
        assert!(action_result(&server, "unpark").await["error"].is_null());
        assert_eq!(models.load(Ordering::SeqCst), 1);
        post(
            &server,
            "/api/v1/actions",
            json!({"command_id":"resume","run_id":"root","command":{"kind":"resume"}}),
        )
        .await;
        // Snapshot preparation, three model turns and persistent hook/tool
        // settlement are one asynchronous action, not a 15s API guarantee.
        let mut result = action_result_within(&server, "resume", Duration::from_secs(45)).await;
        assert!(result["error"].is_null(), "{result}");
        if human {
            let target = super::super::human::target(&server, "root").await;
            let command = json!({"command_id":"human-answer","run_id":"root","command":{"kind":"human","target_run_id":target,"workflow_path":[r("live-human")],"expected_request":{"question":"continue"},"value":{"decision":"continue"}}});
            post(&server, "/api/v1/actions", command.clone()).await;
            result = action_result_within(&server, "human-answer", Duration::from_secs(45)).await;
            assert!(result["error"].is_null(), "{result}");
            assert_eq!(post(&server, "/api/v1/actions", command).await, result);
        }
        assert_eq!(
            result["outcome"]["Completed"]["output"], "modules applied",
            "{result}"
        );
        assert_eq!(
            service_count(&service.url).await,
            json!({"models":3,"old_tools":1,"new_tools":1,"old_hooks":1,"new_hooks":1})
        );
        assert_eq!(seen.lock().unwrap().len(), 3);
        assert!(
            seen.lock().unwrap()[1]["messages"]
                .as_array()
                .unwrap()
                .iter()
                .any(|m| m["role"] == "tool" && m["tool_call_id"] == "old-call")
        );
        let inspected = outcome(&server, "root").await;
        assert_eq!(inspected["live"]["protocol"], "nofy.live/v2");
        assert!(inspected["live"]["modules"]["hook_epoch"].is_string());
        stop.cancel();
        worker.await.unwrap();
    }
}
