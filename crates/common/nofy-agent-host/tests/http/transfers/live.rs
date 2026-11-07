use super::*;
use nofy_agent_runtime::{
    Checkpointer,
    governance::{BudgetScope, BudgetStore},
    registry::{ModuleInstance, ModuleRef},
    system::content_digest,
};

#[derive(Clone, Default)]
struct Wire {
    requests: Arc<Mutex<Vec<Value>>>,
    entered: Arc<tokio::sync::Notify>,
    gate: CancellationToken,
    effects: Arc<AtomicUsize>,
}
async fn fixture(wire: &Wire) -> Serving {
    let primary = wire.clone();
    let effects = wire.effects.clone();
    serve(Router::new().route("/v1/chat/completions",route_post(move|Json(body):Json<Value>|{
        let wire=primary.clone();async move {
            let first={let mut requests=wire.requests.lock().unwrap();requests.push(body.clone());requests.len()==1};
            let events=if first{
                wire.entered.notify_one();wire.gate.cancelled().await;
                nofy_test_support::sse::chat_completions_reasoning_then_tool_call_events("","effect-once","effect","{}","local-model").into_iter().map(|frame|axum::response::sse::Event::default().data(frame.data)).collect()
            }else{
                assert!(body["messages"].to_string().contains("canonical history"),"{body}");
                nofy_test_support::sse::chat_completion_events_exact("history-verified","local-model")
            };
            Sse::new(futures::stream::iter(events.into_iter().map(Ok::<_,Infallible>)))
        }
    })).route("/service/effect",route_post(move||{let effects=effects.clone();async move{effects.fetch_add(1,Ordering::SeqCst);Json(json!({"done":true}))}}))).await
}
fn document(url: &str) -> Value {
    let mut doc = source();
    config(&mut doc, "provider")["base_url"] = json!(format!("{url}/v1/"));
    config(&mut doc, "provider")["models"] = json!(["local-model"]);
    config(&mut doc, "model")["model"] = json!("local-model");
    let r = |id: &str| json!({"id":id,"version":"1"});
    doc["modules"].as_array_mut().unwrap().extend([
        json!({"reference":r("effect-connection"),"factory":"resource.http","config":{"base_url":format!("{url}/service/"),"methods":["POST"]}}),
        json!({"reference":r("effect"),"factory":"tool.http_connected","config":{"contract":{"name":"effect"},"path":"effect","method":"POST"},"dependencies":{"connection":r("effect-connection")}})
    ]);
    doc["programs"]["chat"]["definition"]["tool_packs"]
        .as_array_mut()
        .unwrap()
        .push(r("effect"));
    doc
}

#[tokio::test]
async fn parked_root_transfers_memory_switches_modules_and_rolls_back_without_repeating_effects() {
    for rollback in [false, true] {
        let wire = Wire::default();
        let remote = fixture(&wire).await;
        let dir = nofy_test_support::canonical_tempdir().unwrap();
        let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
        let server = serve(host.router()).await;
        let original = document(&remote.url);
        let compiled = host
            .control()
            .prepare(serde_json::from_value(original.clone()).unwrap())
            .unwrap();
        let resolved = compiled
            .registry()
            .resolve(&[ModuleRef::new("quota", "1")])
            .unwrap();
        let ModuleInstance::Governance(profile) =
            &resolved.instances[&ModuleRef::new("quota", "1")]
        else {
            panic!("quota")
        };
        let scope = BudgetScope {
            root_run_id: "root".into(),
            identity: profile.identity().into(),
        };
        let release = post(&server, "/api/v1/import", original.clone()).await["bundle"]["digest"]
            .as_str()
            .unwrap()
            .to_owned();
        let (stop, worker) = start(&host);
        write(
            &server,
            &release,
            "fact",
            false,
            "The canonical history records a lunar launch.",
        )
        .await;
        let mut body = submission(&release, "root", "chat");
        body["input"] = json!({"text":"canonical history","attachments":[]});
        post(&server, "/api/v1/runs", body).await;
        tokio::time::timeout(Duration::from_secs(30), wire.entered.notified())
            .await
            .unwrap();
        assert_eq!(
            request(
                &server,
                reqwest::Method::POST,
                "/api/v1/memory/transfers/plan",
                ADMIN,
                selection(&release, false)
            )
            .await
            .0,
            422
        );
        post(
            &server,
            "/api/v1/actions",
            json!({"command_id":"park-root","run_id":"root","command":{"kind":"park"}}),
        )
        .await;
        wire.gate.cancel();
        let parked = action_result(&server, "park-root").await;
        assert!(parked["error"].is_null(), "{parked}");
        let name = "memory-transfer-agent";
        let key = format!("{}:{name}root", name.len());
        let before = host.store().load(&key).await.unwrap().unwrap();
        assert!(!before.state.complete);
        assert!(!before.state.has_pending_work());
        assert_eq!(wire.effects.load(Ordering::SeqCst), 1);
        let budget = host.store().inspect(&scope).await.unwrap().unwrap();
        assert_eq!(budget.used.model_calls, 1);
        assert_eq!(budget.used.tool_calls, 1);
        let first = plan(&server, &release, false).await;
        prepare(&server, &release, false, "move-live", &first).await;
        apply(&server, "move-live", &first).await;
        let mut changed = original;
        let backend = config(&mut changed, "target-store")["backend"].clone();
        config(&mut changed, "memory-store")["backend"] = backend;
        let target = post(&server, "/api/v1/import", changed).await["bundle"]["digest"].clone();
        let update = |id: &str, release: Value, revision: u64| json!({"command_id":id,"run_id":"root","command":{"kind":"update_modules","park_command_id":"park-root","expected_revision":revision,"release":release,"program":"chat","update":{"tool_catalog":true,"context_sources":true}}});
        post(
            &server,
            "/api/v1/actions",
            update("switch-store", target, 0),
        )
        .await;
        let updated = action_result(&server, "switch-store").await;
        assert!(updated["error"].is_null(), "{updated}");
        if rollback {
            write(
                &server,
                &release,
                "after-switch",
                true,
                "The canonical history has a later observation.",
            )
            .await;
            let reverse = plan(&server, &release, true).await;
            prepare(&server, &release, true, "reverse-live", &reverse).await;
            apply(&server, "reverse-live", &reverse).await;
            post(
                &server,
                "/api/v1/actions",
                update("restore-modules", json!(release), 1),
            )
            .await;
            let result = action_result(&server, "restore-modules").await;
            assert!(result["error"].is_null(), "{result}");
        }
        let after = host.store().load(&key).await.unwrap().unwrap();
        assert_eq!(
            content_digest(&before.state).unwrap(),
            content_digest(&after.state).unwrap()
        );
        let preserved = host.store().inspect(&scope).await.unwrap().unwrap();
        assert_eq!(preserved.used, budget.used);
        assert_eq!(preserved.reserved, budget.reserved);
        post(&server,"/api/v1/actions",json!({"command_id":"unpark-root","run_id":"root","command":{"kind":"unpark","park_command_id":"park-root"}})).await;
        let unpark = action_result(&server, "unpark-root").await;
        assert!(unpark["error"].is_null(), "{unpark}");
        post(
            &server,
            "/api/v1/actions",
            json!({"command_id":"resume-root","run_id":"root","command":{"kind":"resume"}}),
        )
        .await;
        let result = action_result(&server, "resume-root").await;
        assert!(result["error"].is_null(), "{result}");
        assert_eq!(result["outcome"]["Completed"]["output"], "history-verified");
        assert_eq!(wire.effects.load(Ordering::SeqCst), 1);
        assert_eq!(wire.requests.lock().unwrap().len(), 2);
        let finished = host.store().inspect(&scope).await.unwrap().unwrap();
        assert_eq!(finished.used.model_calls, 2);
        assert_eq!(finished.used.tool_calls, 1);
        let items = listed(&server, &release, "after-live", !rollback).await;
        assert!(items.to_string().contains("lunar launch"));
        if rollback {
            assert!(items.to_string().contains("later observation"));
        }
        stop.cancel();
        worker.await.unwrap();
    }
}
