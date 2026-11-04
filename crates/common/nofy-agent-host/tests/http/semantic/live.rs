use super::*;

#[tokio::test]
async fn budget_suspension_keeps_the_original_source_plan_and_successful_embeddings() {
    let wire = Wire::new(false);
    let remote = fixture(&wire).await;
    let dir = tempfile::tempdir().unwrap();
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let mut doc = source(&remote.url, false, false);
    config(&mut doc, "quota")["limits"]["max_model_calls"] = json!(1);
    let release = post(&server, "/api/v1/import", doc.clone()).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    let (stop, worker) = start(&host);
    write(
        &server,
        &release,
        "fact",
        "project",
        "The Saturn launcher lifts satellites.",
    )
    .await;
    post(
        &server,
        "/api/v1/runs",
        submission(&release, "root", "chat"),
    )
    .await;
    let paused = outcome(&server, "root").await;
    assert_eq!(paused["execution"]["status"], "budget_exceeded", "{paused}");
    assert_eq!(wire.embeddings.lock().unwrap().len(), 1);
    assert!(wire.chats.lock().unwrap().is_empty());
    let before = host
        .store()
        .load("18:semantic-assistantroot")
        .await
        .unwrap()
        .unwrap();
    assert!(
        before
            .state
            .hook_progress
            .prepared_sources
            .as_ref()
            .unwrap()
            .pending
            .is_some()
    );
    let resolved = host
        .control()
        .prepare(serde_json::from_value(doc.clone()).unwrap())
        .unwrap()
        .registry()
        .resolve(&[ModuleRef::new("quota", "1")])
        .unwrap();
    let ModuleInstance::Governance(profile) = &resolved.instances[&ModuleRef::new("quota", "1")]
    else {
        panic!("quota")
    };
    let scope = BudgetScope {
        root_run_id: "root".into(),
        identity: profile.identity().into(),
    };
    let budget = host.store().inspect(&scope).await.unwrap().unwrap();
    assert_eq!(budget.used.model_calls, 1);
    post(
        &server,
        "/api/v1/actions",
        json!({"command_id":"park-source","run_id":"root","command":{"kind":"park"}}),
    )
    .await;
    assert!(action_result(&server, "park-source").await["error"].is_null());
    config(&mut doc, "quota")["limits"]["max_model_calls"] = json!(3);
    let target = post(&server, "/api/v1/import", doc).await["bundle"]["digest"].clone();
    post(&server,"/api/v1/actions",json!({"command_id":"increase-source-budget","run_id":"root","command":{"kind":"update_modules","park_command_id":"park-source","expected_revision":0,"release":target,"program":"chat","update":{"budget_limits":true}}})).await;
    let updated = action_result(&server, "increase-source-budget").await;
    assert!(updated["error"].is_null(), "{updated}");
    let after = host
        .store()
        .load("18:semantic-assistantroot")
        .await
        .unwrap()
        .unwrap();
    assert_eq!(
        content_digest(&after.state).unwrap(),
        content_digest(&before.state).unwrap()
    );
    post(&server,"/api/v1/actions",json!({"command_id":"unpark-source","run_id":"root","command":{"kind":"unpark","park_command_id":"park-source"}})).await;
    assert!(action_result(&server, "unpark-source").await["error"].is_null());
    post(
        &server,
        "/api/v1/actions",
        json!({"command_id":"resume-source","run_id":"root","command":{"kind":"resume"}}),
    )
    .await;
    let finished = action_result(&server, "resume-source").await;
    assert!(finished["error"].is_null(), "{finished}");
    assert_eq!(
        finished["outcome"]["Completed"]["output"],
        "SATURN-RETRIEVED"
    );
    assert_eq!(wire.embeddings.lock().unwrap().len(), 2);
    assert_eq!(wire.chats.lock().unwrap().len(), 1);
    let budget = host.store().inspect(&scope).await.unwrap().unwrap();
    assert_eq!(budget.used.model_calls, 3);
    assert_eq!(budget.reserved.model_calls, 0);
    stop.cancel();
    worker.await.unwrap();
}

#[tokio::test]
async fn live_embedding_model_switch_and_rollback_preserve_state_and_the_original_effect() {
    for rollback in [false, true] {
        let wire = Wire::new(true);
        let remote = fixture(&wire).await;
        let dir = tempfile::tempdir().unwrap();
        let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
        let server = serve(host.router()).await;
        let doc = source(&remote.url, false, true);
        let registry = host
            .control()
            .prepare(serde_json::from_value(doc.clone()).unwrap())
            .unwrap()
            .registry()
            .clone();
        let publication = post(&server, "/api/v1/import", doc.clone()).await;
        let release = publication["bundle"]["digest"].as_str().unwrap();
        let supervisor = Arc::new(nofy_agent_runtime::supervisor::RunSupervisor::new(
            host.store().clone(),
        ));
        post(
            &server,
            "/api/v1/runs",
            submission(release, "fact", "remember"),
        )
        .await;
        supervisor
            .execute_submitted(&registry, "fact")
            .await
            .unwrap();
        post(&server, "/api/v1/runs", submission(release, "root", "chat")).await;
        let running = {
            let supervisor = supervisor.clone();
            let registry = registry.clone();
            tokio::spawn(async move {
                supervisor
                    .execute_submitted(&registry, "root")
                    .await
                    .unwrap()
            })
        };
        tokio::time::timeout(Duration::from_secs(30), wire.primary_entered.notified())
            .await
            .unwrap();
        post(
            &server,
            "/api/v1/actions",
            json!({"command_id":"park-semantic","run_id":"root","command":{"kind":"park"}}),
        )
        .await;
        wire.primary_gate.cancel();
        let result = running.await.unwrap();
        assert!(
            matches!(result,Some(nofy_agent_runtime::RunOutcome::Paused{ref reason,..}) if reason["kind"]=="parked")
        );
        let before = host
            .store()
            .load("18:semantic-assistantroot")
            .await
            .unwrap()
            .unwrap();
        assert!(before.state.hook_progress.prepared_sources.is_none());
        assert!(
            !before.state.complete,
            "park must precede the final inference: {:?}",
            before.state
        );
        let original = canonical(dir.path());
        let (stop, worker) = start(&host);
        let mut changed = doc;
        config(&mut changed, "embedding-model")["model"] = json!("alternate-embedding");
        let target = post(&server, "/api/v1/import", changed).await["bundle"]["digest"].clone();
        let update = |id: &str, release: Value, revision: u64| json!({"command_id":id,"run_id":"root","command":{"kind":"update_modules","park_command_id":"park-semantic","expected_revision":revision,"release":release,"program":"chat","update":{"context_sources":true}}});
        post(
            &server,
            "/api/v1/actions",
            update("switch-embedding", target, 0),
        )
        .await;
        let applied = action_result(&server, "switch-embedding").await;
        assert!(applied["error"].is_null(), "{applied}");
        if rollback {
            post(
                &server,
                "/api/v1/actions",
                update(
                    "rollback-embedding",
                    publication["bundle"]["digest"].clone(),
                    1,
                ),
            )
            .await;
            assert!(action_result(&server, "rollback-embedding").await["error"].is_null());
        }
        let after = host
            .store()
            .load("18:semantic-assistantroot")
            .await
            .unwrap()
            .unwrap();
        assert_eq!(
            content_digest(&before.state).unwrap(),
            content_digest(&after.state).unwrap()
        );
        post(&server,"/api/v1/actions",json!({"command_id":"unpark-semantic","run_id":"root","command":{"kind":"unpark","park_command_id":"park-semantic"}})).await;
        assert!(action_result(&server, "unpark-semantic").await["error"].is_null());
        post(
            &server,
            "/api/v1/actions",
            json!({"command_id":"resume-semantic","run_id":"root","command":{"kind":"resume"}}),
        )
        .await;
        let result = action_result(&server, "resume-semantic").await;
        assert!(result["error"].is_null(), "{result}");
        assert_eq!(result["outcome"]["Completed"]["output"], "SATURN-RETRIEVED");
        assert_eq!(wire.effects.load(Ordering::SeqCst), 1);
        assert_eq!(canonical(dir.path()), original);
        let requests = wire.embeddings.lock().unwrap();
        let last = requests.last().unwrap();
        assert_eq!(
            last["model"],
            if rollback {
                "local-embedding"
            } else {
                "alternate-embedding"
            },
            "embeddings: {requests:?}; primary requests: {:?}; outcome: {result}",
            wire.chats.lock().unwrap()
        );
        assert_eq!(requests.len(), if rollback { 3 } else { 4 });
        drop(requests);
        stop.cancel();
        worker.await.unwrap();
    }
}
