use super::*;

#[tokio::test]
async fn memory_bindings_switch_and_rollback_with_original_effects_budget_and_history() {
    for rollback in [false, true] {
        let service = Service::new(false, true);
        let serving = fixture(&service).await;
        let dir = tempfile::tempdir().unwrap();
        let credentials = Arc::new(AtomicUsize::new(0));
        let host = host(dir.path(), credentials.clone()).await;
        let server = serve(host.router()).await;
        let doc = document(&serving.url, "one", false);
        let registry = host
            .control()
            .prepare(serde_json::from_value(doc.clone()).unwrap())
            .unwrap()
            .registry()
            .clone();
        let publication = post(&server, "/api/v1/import", doc).await;
        assert_eq!(credentials.load(Ordering::SeqCst), 0);
        assert!(!dir.path().join("memory").exists());
        let supervisor = Arc::new(nofy_agent_runtime::supervisor::RunSupervisor::new(
            host.store().clone(),
        ));
        post(
            &server,
            "/api/v1/runs",
            run(&publication, "original-memory", "write-memory"),
        )
        .await;
        assert!(matches!(
            supervisor
                .execute_submitted(&registry, "original-memory")
                .await
                .unwrap(),
            Some(RunOutcome::Completed { .. })
        ));
        post(
            &server,
            "/api/v1/runs",
            run(&publication, "root", "execute"),
        )
        .await;
        let running = {
            let s = supervisor.clone();
            let r = registry.clone();
            tokio::spawn(async move { s.execute_submitted(&r, "root").await.unwrap() })
        };
        await_count(&serving.url, "models", 1).await;
        post(
            &server,
            "/api/v1/actions",
            json!({"command_id":"park","run_id":"root","command":{"kind":"park"}}),
        )
        .await;
        service.root.cancel();
        assert!(
            matches!(running.await.unwrap(),Some(RunOutcome::Paused{ref reason,..}) if reason["kind"]=="parked")
        );
        let before = host
            .store()
            .load("14:evidence-agentthread")
            .await
            .unwrap()
            .unwrap();
        let resolved = registry.resolve(&[ModuleRef::new("quota", "1")]).unwrap();
        let ModuleInstance::Governance(profile) =
            &resolved.instances[&ModuleRef::new("quota", "1")]
        else {
            panic!("quota")
        };
        let scope = BudgetScope {
            root_run_id: "root".into(),
            identity: profile.identity().into(),
        };
        let budget = content_digest(&host.store().inspect(&scope).await.unwrap()).unwrap();
        let stop = CancellationToken::new();
        let signal = stop.clone();
        let running = host.clone();
        let worker = tokio::spawn(async move { running.run_worker(signal, 2).await.unwrap() });
        let next = post(
            &server,
            "/api/v1/import",
            document(&serving.url, "two", false),
        )
        .await;
        let (status, refused) = request(
            &server,
            reqwest::Method::POST,
            "/api/v1/actions",
            ADMIN,
            update("unselected-memory", &next, 0, false),
        )
        .await;
        assert_eq!(status, 422, "{refused}");
        assert!(
            refused.to_string().contains("preserved dependency"),
            "{refused}"
        );
        assert!(host.store().live_execution("root").await.unwrap().is_none());
        post(
            &server,
            "/api/v1/actions",
            update("switch-memory", &next, 0, true),
        )
        .await;
        assert!(action_result(&server, "switch-memory").await["error"].is_null());
        let live = host.store().live_execution("root").await.unwrap().unwrap();
        assert_eq!(live.protocol, "nofy.live/v5");
        assert_eq!(
            content_digest(&live.after.state).unwrap(),
            content_digest(&before.state).unwrap()
        );
        assert_eq!(
            content_digest(&host.store().inspect(&scope).await.unwrap()).unwrap(),
            budget
        );
        if rollback {
            post(
                &server,
                "/api/v1/actions",
                update("rollback-memory", &publication, 1, true),
            )
            .await;
            assert!(action_result(&server, "rollback-memory").await["error"].is_null());
        }
        post(&server,"/api/v1/actions",json!({"command_id":"unpark-memory","run_id":"root","command":{"kind":"unpark","park_command_id":"park"}})).await;
        assert!(action_result(&server, "unpark-memory").await["error"].is_null());
        post(
            &server,
            "/api/v1/actions",
            json!({"command_id":"resume-memory","run_id":"root","command":{"kind":"resume"}}),
        )
        .await;
        let completed =
            action_result_within(&server, "resume-memory", Duration::from_secs(45)).await;
        assert!(completed["error"].is_null(), "{completed}");
        assert_eq!(
            completed["outcome"]["Completed"]["output"],
            "memory complete"
        );
        assert_eq!(service.counts[0].load(Ordering::SeqCst), 2);
        assert_eq!(service.counts[1].load(Ordering::SeqCst), 1);
        assert_eq!(service.counts[2].load(Ordering::SeqCst), 1);
        assert_eq!(service.counts[3].load(Ordering::SeqCst), 1);
        let selected = if rollback { &publication } else { &next };
        let listed = memory(&server, selected, "selected-notes", "list-memory").await;
        assert!(
            listed.to_string().contains(if rollback {
                "one release"
            } else {
                "two release"
            }),
            "{listed}"
        );
        let original = memory(&server, &publication, "old-notes", "list-memory").await;
        assert!(
            original.to_string().contains("Original manually"),
            "{original}"
        );
        assert_eq!(
            original["items"].as_array().unwrap().len(),
            if rollback { 2 } else { 1 }
        );
        let quota = host.store().inspect(&scope).await.unwrap().unwrap();
        assert_eq!(quota.used.model_calls, 3);
        assert_eq!(
            quota.reserved,
            nofy_agent_runtime::governance::BudgetCost::default()
        );
        stop.cancel();
        worker.await.unwrap();
    }
}

#[tokio::test]
async fn a_closed_memory_resource_pauses_capture_then_reopens_without_resampling() {
    let service = Service::new(true, false);
    let serving = fixture(&service).await;
    let dir = tempfile::tempdir().unwrap();
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let publication = post(
        &server,
        "/api/v1/import",
        document(&serving.url, "one", false),
    )
    .await;
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let running = host.clone();
    let worker = tokio::spawn(async move { running.run_worker(signal, 2).await.unwrap() });
    post(
        &server,
        "/api/v1/runs",
        run(&publication, "root", "execute"),
    )
    .await;
    await_count(&serving.url, "captures", 1).await;
    let closed=post(&server,"/api/v1/memory/resources/apply",json!({"resource":selector(&publication),"command":{"command_id":"close-learning","expected_revision":0,"open":false}})).await;
    assert_eq!(closed["command"]["open"], false, "{closed}");
    service.capture.cancel();
    let paused = outcome(&server, "root").await;
    assert_eq!(paused["execution"]["status"], "paused", "{paused}");
    assert!(
        paused.to_string().contains("memory_capture_pending"),
        "{paused}"
    );
    assert!(files(dir.path()).is_empty());
    // The provider's namespace layout is public storage data, independent of
    // the declaration's portable resource identity.
    let namespace = std::fs::read_dir(dir.path().join("memory"))
        .unwrap()
        .map(|e| e.unwrap().path())
        .find(|p| p.is_dir())
        .unwrap();
    let project = serde_json::from_value::<nofy_memory::model::ProjectId>(json!(PROJECT)).unwrap();
    let topics = nofy_memory::layout::UnifiedMemoryLayout::new(namespace)
        .project_scope(project)
        .topics_directory();
    let held = topics.with_extension("held-by-test");
    let existed = topics.is_dir();
    if existed {
        assert_eq!(std::fs::read_dir(&topics).unwrap().count(), 0);
        std::fs::rename(&topics, &held).unwrap();
    } else {
        std::fs::create_dir_all(topics.parent().unwrap()).unwrap();
    }
    std::fs::write(&topics, b"test-owned consolidation destination fault").unwrap();
    post(&server,"/api/v1/memory/resources/apply",json!({"resource":selector(&publication),"command":{"command_id":"reopen-learning","expected_revision":1,"open":true}})).await;
    post(
        &server,
        "/api/v1/actions",
        json!({"command_id":"resume-capture","run_id":"root","command":{"kind":"resume"}}),
    )
    .await;
    let interrupted =
        action_result_within(&server, "resume-capture", Duration::from_secs(45)).await;
    assert!(interrupted["error"].is_null(), "{interrupted}");
    assert!(
        interrupted["outcome"]["Paused"]["reason"]
            .to_string()
            .contains("memory_capture_pending"),
        "{interrupted}"
    );
    let captured = files(dir.path());
    assert_eq!(captured.len(), 1, "{captured:?}");
    let observation = std::path::PathBuf::from(captured.keys().next().unwrap());
    assert_eq!(service.counts[3].load(Ordering::SeqCst), 1);
    stop.cancel();
    worker.await.unwrap();
    drop(server);
    drop(host);
    std::fs::remove_file(&topics).unwrap();
    if existed {
        std::fs::rename(&held, &topics).unwrap();
    } else {
        std::fs::create_dir(&topics).unwrap();
    }
    let reopened = super::reopen(dir.path()).await;
    let server = serve(reopened.router()).await;
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let running = reopened.clone();
    let worker = tokio::spawn(async move { running.run_worker(signal, 2).await.unwrap() });
    post(
        &server,
        "/api/v1/actions",
        json!({"command_id":"finish-capture","run_id":"root","command":{"kind":"resume"}}),
    )
    .await;
    let completed = action_result_within(&server, "finish-capture", Duration::from_secs(45)).await;
    assert!(completed["error"].is_null(), "{completed}");
    assert_eq!(
        completed["outcome"]["Completed"]["output"],
        "memory complete"
    );
    let archived = files(dir.path());
    let original = &captured[&observation.to_string_lossy().into_owned()];
    assert_eq!(
        archived.values().filter(|bytes| *bytes == original).count(),
        1
    );
    let listed = memory(&server, &publication, "learned-notes", "list-memory").await;
    assert_eq!(listed["items"].as_array().unwrap().len(), 1, "{listed}");
    let before = files(dir.path());
    assert_eq!(
        post(
            &server,
            "/api/v1/actions",
            json!({"command_id":"finish-capture","run_id":"root","command":{"kind":"resume"}})
        )
        .await,
        completed
    );
    assert_eq!(files(dir.path()), before);
    stop.cancel();
    worker.await.unwrap();
}
