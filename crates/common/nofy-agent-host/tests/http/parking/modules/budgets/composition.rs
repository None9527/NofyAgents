use super::*;
#[path = "composition/children.rs"]
mod children;
#[path = "composition/crashes.rs"]
mod crashes;
#[path = "composition/ordering.rs"]
mod ordering;
#[path = "composition/proof.rs"]
mod proof;

fn terminal_source(url: &str, event: &str, raised: bool) -> Value {
    let mut doc = base_source(url);
    doc["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|m| m["reference"] == r("quota"))
        .unwrap()["config"]["limits"] =
        json!({"max_model_calls":2,"max_tool_calls":if raised {3} else {1}});
    for (index, name) in ["first", "last"].into_iter().enumerate() {
        doc["modules"].as_array_mut().unwrap().extend([
            json!({"reference":r(&format!("{name}-tool")),"factory":"tool.http_connected","config":{"contract":{"name":format!("close_{name}")},"path":name,"method":"POST"},"dependencies":{"connection":r("service")}}),
            json!({"reference":r(&format!("{name}-handler")),"factory":"hook.executor","config":{"tool":format!("close_{name}")},"dependencies":{"executor":r(&format!("{name}-tool"))}}),
            json!({"reference":r(&format!("{name}-hook")),"factory":"hook.subscription","config":{"event":event,"priority":index},"dependencies":{"handler":r(&format!("{name}-handler"))}}),
        ]);
    }
    doc["programs"]["execute"]["definition"]["hooks"] = json!([r("first-hook"), r("last-hook")]);
    doc
}

#[tokio::test]
async fn terminal_hooks_resume_after_budget_amendment_without_repeating_completed_model_or_hook() {
    for event in ["before_stop", "turn_done"] {
        let counts = Arc::new([
            AtomicUsize::new(0),
            AtomicUsize::new(0),
            AtomicUsize::new(0),
        ]);
        let models = counts.clone();
        let first = counts.clone();
        let last = counts.clone();
        let service = serve(
            Router::new()
                .route(
                    "/v1/chat/completions",
                    route_post(move || {
                        let c = models.clone();
                        async move {
                            c[0].fetch_add(1, Ordering::SeqCst);
                            Sse::new(futures::stream::iter(
                                nofy_test_support::sse::chat_completion_events_exact(
                                    "business complete",
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
                    route_post(move || {
                        let c = first.clone();
                        async move {
                            c[1].fetch_add(1, Ordering::SeqCst);
                            Json(json!({"decision":"continue"}))
                        }
                    }),
                )
                .route(
                    "/last",
                    route_post(move || {
                        let c = last.clone();
                        async move {
                            c[2].fetch_add(1, Ordering::SeqCst);
                            Json(json!({"decision":"continue"}))
                        }
                    }),
                ),
        )
        .await;
        let dir = tempfile::tempdir().unwrap();
        let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
        let server = serve(host.router()).await;
        let source = terminal_source(&service.url, event, false);
        let compiled = host
            .control()
            .prepare(serde_json::from_value(source.clone()).unwrap())
            .unwrap();
        let reference = ModuleRef::new("quota", "1");
        let resolved = compiled
            .registry()
            .resolve(std::slice::from_ref(&reference))
            .unwrap();
        let ModuleInstance::Governance(profile) = &resolved.instances[&reference] else {
            panic!("quota")
        };
        let scope = BudgetScope {
            root_run_id: "root".into(),
            identity: profile.identity().into(),
        };
        let publication = post(&server, "/api/v1/import", source).await;
        post(&server,"/api/v1/runs",json!({"run_id":"root","thread_id":"thread","system":"model-evidence","release":publication["bundle"]["digest"],"program":"execute","input":{"text":"finish","attachments":[]}})).await;
        let stop = CancellationToken::new();
        let stopped = stop.clone();
        let worker_host = host.clone();
        let worker = tokio::spawn(async move { worker_host.run_worker(stopped, 2).await.unwrap() });
        assert_eq!(
            outcome(&server, "root").await["execution"]["status"],
            "budget_exceeded"
        );
        let record = host
            .store()
            .execution_record("root")
            .await
            .unwrap()
            .unwrap();
        let Some(nofy_agent_runtime::RunOutcome::BudgetExceeded { state }) = record.outcome else {
            panic!("budget outcome")
        };
        assert!(state.complete);
        assert!(state.has_pending_work());
        assert_eq!(state.output, "business complete");
        assert_eq!(
            counts
                .iter()
                .map(|c| c.load(Ordering::SeqCst))
                .collect::<Vec<_>>(),
            [1, 1, 0]
        );
        let before = host.store().inspect(&scope).await.unwrap().unwrap();
        post(
            &server,
            "/api/v1/actions",
            json!({"command_id":"park","run_id":"root","command":{"kind":"park"}}),
        )
        .await;
        let parked = action_result(&server, "park").await;
        assert!(parked["error"].is_null(), "{parked}");
        let publication = post(
            &server,
            "/api/v1/import",
            terminal_source(&service.url, event, true),
        )
        .await;
        post(&server,"/api/v1/actions",json!({"command_id":"raise","run_id":"root","command":{"kind":"update_modules","park_command_id":"park","expected_revision":0,"release":publication["bundle"]["digest"],"program":"execute","update":{"budget_limits":true}}})).await;
        let updated = action_result(&server, "raise").await;
        assert!(updated["error"].is_null(), "{updated}");
        let live = host.store().live_execution("root").await.unwrap().unwrap();
        assert_eq!(
            content_digest(&live.after.state).unwrap(),
            content_digest(&state).unwrap()
        );
        assert_eq!(
            host.store().inspect(&scope).await.unwrap().unwrap().used,
            before.used
        );
        post(&server,"/api/v1/actions",json!({"command_id":"unpark","run_id":"root","command":{"kind":"unpark","park_command_id":"park"}})).await;
        assert!(action_result(&server, "unpark").await["error"].is_null());
        post(
            &server,
            "/api/v1/actions",
            json!({"command_id":"resume","run_id":"root","command":{"kind":"resume"}}),
        )
        .await;
        let finished = action_result(&server, "resume").await;
        assert!(finished["error"].is_null(), "{finished}");
        assert_eq!(
            finished["outcome"]["Completed"]["output"], "business complete",
            "{finished}"
        );
        assert_eq!(
            counts
                .iter()
                .map(|c| c.load(Ordering::SeqCst))
                .collect::<Vec<_>>(),
            [1, 1, 1]
        );
        let budget = host.store().inspect(&scope).await.unwrap().unwrap();
        assert_eq!(budget.used.model_calls, 1);
        assert_eq!(budget.used.tool_calls, 2);
        assert_eq!(budget.created_at_ms, before.created_at_ms);
        assert_eq!(
            post(&server, "/api/v1/actions", finished["action"].clone()).await,
            finished
        );
        stop.cancel();
        worker.await.unwrap();
    }
}
