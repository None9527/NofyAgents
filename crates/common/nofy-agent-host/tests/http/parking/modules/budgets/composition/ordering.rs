use super::*;
use std::sync::Mutex;

fn source(url: &str, event: &str, raised: bool) -> Value {
    let mut source = terminal_source(url, event, raised);
    for module in source["modules"].as_array_mut().unwrap() {
        if module["reference"] == r("quota") {
            module["config"]["limits"]["max_tool_calls"] = json!(if raised { 8 } else { 1 });
        }
        if module["reference"] == r("provider") {
            module["config"]["endpoint_limits"] =
                json!({"test-model":{"max_input_tokens":512,"max_output_tokens":32}});
        }
    }
    source
}

async fn queued_input(event: &str, tool: bool, reopen: bool) {
    let observed = Arc::new(Mutex::new(Vec::<Value>::new()));
    let model = observed.clone();
    let first = observed.clone();
    let last = observed.clone();
    let effect = observed.clone();
    let service = serve(
        Router::new()
            .route(
                "/v1/chat/completions",
                route_post(move |Json(body): Json<Value>| {
                    let observed = model.clone();
                    async move {
                        let output = {
                            let mut log = observed.lock().unwrap();
                            let first = !log.iter().any(|entry| entry["kind"] == "model");
                            log.push(json!({"kind":"model","body":body}));
                            if first {
                                "first answer"
                            } else {
                                "second answer"
                            }
                        };
                        Sse::new(futures::stream::iter(
                            nofy_test_support::sse::chat_completion_events_exact(
                                output,
                                "test-model",
                            )
                            .into_iter()
                            .map(Ok::<_, Infallible>),
                        ))
                    }
                }),
            )
            .route(
                "/first",
                route_post(move |Json(body): Json<Value>| {
                    let observed = first.clone();
                    async move {
                        observed
                            .lock()
                            .unwrap()
                            .push(json!({"kind":"first","body":body}));
                        Json(json!({"decision":"continue"}))
                    }
                }),
            )
            .route(
                "/last",
                route_post(move |Json(body): Json<Value>| {
                    let observed = last.clone();
                    async move {
                        observed
                            .lock()
                            .unwrap()
                            .push(json!({"kind":"last","body":body}));
                        Json(json!({"decision":"continue"}))
                    }
                }),
            )
            .route(
                "/done",
                route_post(move |Json(body): Json<Value>| {
                    let observed = effect.clone();
                    async move {
                        observed
                            .lock()
                            .unwrap()
                            .push(json!({"kind":"tool","body":body}));
                        Json(json!({"user_effect":true}))
                    }
                }),
            ),
    )
    .await;
    let directory = tempfile::tempdir().unwrap();
    let initial_host = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
    let initial_server = serve(initial_host.router()).await;
    let document = source(&service.url, event, false);
    let compiled = initial_host
        .control()
        .prepare(serde_json::from_value(document.clone()).unwrap())
        .unwrap();
    let reference = ModuleRef::new("quota", "1");
    let resolved = compiled.registry().resolve(&[reference.clone()]).unwrap();
    let ModuleInstance::Governance(profile) = &resolved.instances[&reference] else {
        panic!("quota")
    };
    let scope = BudgetScope {
        root_run_id: "root".into(),
        identity: profile.identity().into(),
    };
    let publication = post(&initial_server, "/api/v1/import", document).await;
    post(&initial_server,"/api/v1/runs",json!({"run_id":"root","thread_id":"thread","system":"model-evidence","release":publication["bundle"]["digest"],"program":"execute","input":{"text":"finish","attachments":[]}})).await;
    let stop = CancellationToken::new();
    let stopped = stop.clone();
    let worker_host = initial_host.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(stopped, 2).await.unwrap() });
    assert_eq!(
        outcome(&initial_server, "root").await["execution"]["status"],
        "budget_exceeded"
    );
    let record = initial_host
        .store()
        .execution_record("root")
        .await
        .unwrap()
        .unwrap();
    let Some(nofy_agent_runtime::RunOutcome::BudgetExceeded { state }) = record.outcome else {
        panic!("budget")
    };
    assert!(state.complete && state.has_pending_work());
    assert_eq!(state.output, "first answer");
    let old_turn = state.hook_progress.turn;
    post(
        &initial_server,
        "/api/v1/actions",
        json!({"command_id":"park","run_id":"root","command":{"kind":"park"}}),
    )
    .await;
    assert!(action_result(&initial_server, "park").await["error"].is_null());
    let envelope = json!({"address":{"root_run_id":"root","run_id":"root","thread_id":"thread","agent":record.snapshot.name()},"input_id":"new-input","input":if tool {json!({"kind":"tool","call":{"id":"","name":"effect","arguments":{}}})} else {json!({"kind":"interject","message":{"text":"next request","attachments":[]}})}});
    let accepted = post(
        &initial_server,
        "/api/v1/runs/root/inputs",
        envelope.clone(),
    )
    .await;
    assert_eq!(accepted["status"], "pending");
    let additional = if tool {
        None
    } else {
        let mut extra = envelope.clone();
        extra["input_id"] = json!("additional-input");
        extra["input"]["message"]["text"] = json!("additional detail");
        Some(post(&initial_server, "/api/v1/runs/root/inputs", extra).await)
    };
    let before = initial_host.store().inspect(&scope).await.unwrap().unwrap();
    let (host, server, stop, worker) = if reopen {
        stop.cancel();
        worker.await.unwrap();
        drop(initial_server);
        drop(initial_host);
        let host = crate::host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
        let server = serve(host.router()).await;
        let stop = CancellationToken::new();
        let stopped = stop.clone();
        let worker_host = host.clone();
        let worker = tokio::spawn(async move { worker_host.run_worker(stopped, 2).await.unwrap() });
        (host, server, stop, worker)
    } else {
        (initial_host, initial_server, stop, worker)
    };
    let publication = post(&server, "/api/v1/import", source(&service.url, event, true)).await;
    post(&server,"/api/v1/actions",json!({"command_id":"raise","run_id":"root","command":{"kind":"update_modules","park_command_id":"park","expected_revision":0,"release":publication["bundle"]["digest"],"program":"execute","update":{"budget_limits":true}}})).await;
    assert!(action_result(&server, "raise").await["error"].is_null());
    assert_eq!(
        host.store().inspect(&scope).await.unwrap().unwrap().used,
        before.used
    );
    let live = host.store().live_execution("root").await.unwrap().unwrap();
    assert_eq!(
        content_digest(&live.after.state).unwrap(),
        content_digest(&state).unwrap()
    );
    post(&server,"/api/v1/actions",json!({"command_id":"unpark","run_id":"root","command":{"kind":"unpark","park_command_id":"park"}})).await;
    assert!(action_result(&server, "unpark").await["error"].is_null());
    post(
        &server,
        "/api/v1/actions",
        json!({"command_id":"resume","run_id":"root","command":{"kind":"resume"}}),
    )
    .await;
    let result = action_result(&server, "resume").await;
    assert!(result["error"].is_null(), "{result}");
    assert_eq!(
        result["outcome"]["Completed"]["output"], "second answer",
        "{result}"
    );
    let log = observed.lock().unwrap().clone();
    let kinds = log
        .iter()
        .map(|entry| entry["kind"].as_str().unwrap())
        .collect::<Vec<_>>();
    assert_eq!(
        kinds,
        if tool {
            vec!["model", "first", "last", "tool", "model", "first", "last"]
        } else {
            vec!["model", "first", "last", "model", "first", "last"]
        },
        "{log:?}"
    );
    let hooks = log
        .iter()
        .filter(|entry| entry["kind"] == "first" || entry["kind"] == "last")
        .collect::<Vec<_>>();
    assert_eq!(hooks[0]["body"]["payload"]["output"], "first answer");
    assert_eq!(hooks[1]["body"]["payload"]["output"], "first answer");
    assert_eq!(hooks[2]["body"]["payload"]["output"], "second answer");
    assert_eq!(hooks[3]["body"]["payload"]["output"], "second answer");
    assert_eq!(hooks[0]["body"]["id"], hooks[1]["body"]["id"]);
    assert_eq!(hooks[2]["body"]["id"], hooks[3]["body"]["id"]);
    assert_ne!(hooks[0]["body"]["id"], hooks[2]["body"]["id"]);
    let record = host
        .store()
        .execution_record("root")
        .await
        .unwrap()
        .unwrap();
    let Some(nofy_agent_runtime::RunOutcome::Completed { state, .. }) = record.outcome else {
        panic!("completed")
    };
    assert_eq!(state.hook_progress.turn, old_turn + 1);
    assert_eq!(state.steps, 2);
    assert_eq!(state.model_sequence, 2);
    let start = state.hook_progress.input_start_index.unwrap();
    assert!(!state.messages[start..].iter().any(|message| matches!(message,nofy_agent_runtime::Message::User { content } if content == "finish")));
    assert!(
        state
            .input_progress
            .delivered
            .contains_key(&accepted["sequence"].as_u64().unwrap())
    );
    if let Some(additional) = additional {
        assert!(
            state
                .input_progress
                .delivered
                .contains_key(&additional["sequence"].as_u64().unwrap())
        );
        let texts = state.messages[start..]
            .iter()
            .filter_map(|message| match message {
                nofy_agent_runtime::Message::User { content } => Some(content.as_str()),
                _ => None,
            })
            .collect::<Vec<_>>();
        assert_eq!(texts.len(), 2);
        assert!(texts[0].contains("next request") && texts[1].contains("additional detail"));
        assert_eq!(state.input_progress.capture.len(), 2);
    }
    assert!(!state.has_pending_work());
    let summary = host.store().inspect(&scope).await.unwrap().unwrap();
    assert_eq!(summary.used.model_calls, 2);
    assert_eq!(summary.used.tool_calls, if tool { 5 } else { 4 });
    assert_eq!(summary.reserved, Default::default());
    assert_eq!(summary.created_at_ms, before.created_at_ms);
    assert_eq!(
        post(&server, "/api/v1/actions", result["action"].clone()).await,
        result
    );
    let replayed = post(&server, "/api/v1/runs/root/inputs", envelope).await;
    assert_eq!(replayed["sequence"], accepted["sequence"]);
    assert_eq!(*observed.lock().unwrap(), log);
    stop.cancel();
    worker.await.unwrap();
}

#[tokio::test]
async fn before_stop_finishes_before_queued_interjection_or_user_tool() {
    queued_input("before_stop", false, false).await;
    queued_input("before_stop", true, true).await;
}

#[tokio::test]
async fn turn_done_finishes_before_queued_interjection_or_user_tool() {
    queued_input("turn_done", false, true).await;
    queued_input("turn_done", true, false).await;
}
