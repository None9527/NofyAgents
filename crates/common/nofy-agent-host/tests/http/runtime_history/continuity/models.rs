use super::*;

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
    let value: Value = response.json().await.unwrap();
    assert_eq!(status, 200, "{value}");
    value
}
#[tokio::test]
async fn original_root_and_child_model_tickets_preserve_claims_and_history_across_migration_in_both_budget_modes()
 {
    for unmetered in [false, true] {
        for child in [false, true] {
            let initial = Arc::new(AtomicUsize::new(0));
            let followups = Arc::new(AtomicUsize::new(0));
            let effects = Arc::new(AtomicUsize::new(0));
            let started = initial.clone();
            let next = followups.clone();
            let done = effects.clone();
            let count = initial.clone();
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
            let dir = nofy_test_support::canonical_tempdir().unwrap();
            let state = dir.path().join("host");
            exited(
                "model_reconciliation::uncertain_model_process",
                vec![
                    ("NOFY_MODEL_EVIDENCE_STATE", state.to_str().unwrap().into()),
                    ("NOFY_MODEL_EVIDENCE_SERVICE", service.url.clone()),
                    (
                        "NOFY_MODEL_EVIDENCE_CHILD",
                        if child { "yes" } else { "no" }.into(),
                    ),
                    (
                        "NOFY_MODEL_EVIDENCE_UNMETERED",
                        if unmetered { "yes" } else { "no" }.into(),
                    ),
                ],
                97,
            )
            .await;
            let host = host(&state, Arc::new(AtomicUsize::new(0))).await;
            let server = serve(host.router()).await;
            expired_leases(&host).await;
            pause_original(&host, "model-evidence").await;
            let paused = read(&server, "/api/v1/runs/root").await;
            assert_eq!(paused["execution"]["status"], "paused");
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
            let scope = scoped(&host, "model-evidence", "root").await;
            assert_eq!(scope.is_none(), unmetered);
            let before = budget(&host, &scope).await;
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
            let command = json!({"command_id":"original-model-proof","run_id":"root","command":{"kind":"reconcile_model","receipt":{"ticket":page[0]["ticket"],"result":{"kind":"completed","response":response}}}});
            let accepted = post(&server, "/api/v1/actions", command.clone()).await;
            assert_eq!(accepted["finished"], false);
            let storage = storage(&server, &dir.path().join("external")).await;
            relocate(&host, &server, &storage, false, "model-forward").await;
            assert_eq!(targets(&server, &target).await, page);
            assert_eq!(budget(&host, &scope).await, before);
            assert_eq!(
                read(&server, "/api/v1/actions/original-model-proof").await,
                accepted
            );
            assert_eq!(initial.load(Ordering::SeqCst), 1);
            assert_eq!(effects.load(Ordering::SeqCst), 0);
            let (stop, worker) = start(&host);
            let receipt = action_result(&server, "original-model-proof").await;
            assert!(receipt["error"].is_null(), "{receipt}");
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
            assert_eq!(initial.load(Ordering::SeqCst), 1);
            assert_eq!(followups.load(Ordering::SeqCst), if child { 0 } else { 1 });
            assert_eq!(effects.load(Ordering::SeqCst), 1);
            if let Some(scope) = &scope {
                let after = host.store().inspect(scope).await.unwrap().unwrap();
                assert_eq!(after.used.model_calls, if child { 1 } else { 2 });
                assert_eq!(
                    after.reserved,
                    nofy_agent_runtime::governance::BudgetCost::default()
                );
                assert!(
                    after.used.input_tokens
                        >= page[0]["reserved"]["input_tokens"].as_u64().unwrap()
                );
                assert!(
                    after.used.output_tokens
                        >= page[0]["reserved"]["output_tokens"].as_u64().unwrap()
                );
            }
            let completed = read(&server, "/api/v1/runs/root").await;
            relocate(&host, &server, &storage, true, "model-reverse").await;
            assert_eq!(read(&server, "/api/v1/runs/root").await, completed);
            assert_eq!(post(&server, "/api/v1/actions", command).await, receipt);
            assert_eq!(initial.load(Ordering::SeqCst), 1);
            assert_eq!(effects.load(Ordering::SeqCst), 1);
            finish.cancel();
            stop_worker(&host, stop, worker).await;
        }
    }
}
