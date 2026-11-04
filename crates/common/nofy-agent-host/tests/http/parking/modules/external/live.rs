use super::*;

#[tokio::test]
async fn external_catalog_and_isolated_context_program_update_and_rollback_through_default_host() {
    for (rollback, deny) in [(false, false), (true, false), (false, true)] {
        let service = Service::new(false);
        let serving = fixture(&service).await;
        let dir = tempfile::tempdir().unwrap();
        let credentials = Arc::new(AtomicUsize::new(0));
        let host = host(dir.path(), credentials.clone()).await;
        let server = serve(host.router()).await;
        let doc = document(&serving.url, "one", false, deny, false);
        let compiled = host
            .control()
            .prepare(serde_json::from_value(doc.clone()).unwrap())
            .unwrap();
        let registry = compiled.registry().clone();
        let publication = post(&server, "/api/v1/import", doc).await;
        assert_eq!(credentials.load(Ordering::SeqCst), 0);
        assert_eq!(service.counts[1].load(Ordering::SeqCst), 0);
        assert_eq!(host.loader().code_status().started, 0);
        post(&server,"/api/v1/runs",json!({"run_id":"root","thread_id":"thread","system":"model-evidence","release":publication["bundle"]["digest"],"program":"execute","input":{"text":"continue","attachments":[]}})).await;
        let supervisor = Arc::new(nofy_agent_runtime::supervisor::RunSupervisor::new(
            host.store().clone(),
        ));
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
        await_count(&serving.url, "models", 1).await;
        post(
            &server,
            "/api/v1/actions",
            json!({"command_id":"park","run_id":"root","command":{"kind":"park"}}),
        )
        .await;
        service.start_release.cancel();
        assert!(
            matches!(running.await.unwrap(),Some(RunOutcome::Paused {ref reason,..}) if reason["kind"]=="parked")
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
        let next = post(
            &server,
            "/api/v1/import",
            document(&serving.url, "two", false, deny, false),
        )
        .await;
        let stop = CancellationToken::new();
        let signal = stop.clone();
        let running_host = host.clone();
        let worker = tokio::spawn(async move { running_host.run_worker(signal, 2).await.unwrap() });
        post(
            &server,
            "/api/v1/actions",
            update("external-modules", &next, 0),
        )
        .await;
        assert!(action_result(&server, "external-modules").await["error"].is_null());
        let live = host.store().live_execution("root").await.unwrap().unwrap();
        assert_eq!(live.protocol, "nofy.live/v5");
        let mut expected = before.state.clone();
        expected.tool_revision.clear();
        assert_eq!(
            content_digest(&live.after.state).unwrap(),
            content_digest(&expected).unwrap()
        );
        assert_eq!(
            content_digest(&host.store().inspect(&scope).await.unwrap()).unwrap(),
            budget
        );
        if rollback {
            let old = post(
                &server,
                "/api/v1/import",
                document(&serving.url, "one", false, deny, false),
            )
            .await;
            post(
                &server,
                "/api/v1/actions",
                update("rollback-external", &old, 1),
            )
            .await;
            assert!(action_result(&server, "rollback-external").await["error"].is_null());
        }
        post(&server,"/api/v1/actions",json!({"command_id":"unpark-external","run_id":"root","command":{"kind":"unpark","park_command_id":"park"}})).await;
        assert!(action_result(&server, "unpark-external").await["error"].is_null());
        post(
            &server,
            "/api/v1/actions",
            json!({"command_id":"resume-external","run_id":"root","command":{"kind":"resume"}}),
        )
        .await;
        let result =
            action_result_within(&server, "resume-external", Duration::from_secs(45)).await;
        assert!(result["error"].is_null(), "{result}");
        assert_eq!(
            result["outcome"]["Completed"]["output"],
            "external complete"
        );
        let new_effects = usize::from(!rollback && !deny);
        assert_eq!(service.counts[2].load(Ordering::SeqCst), 1);
        assert_eq!(service.counts[3].load(Ordering::SeqCst), new_effects);
        assert_eq!(service.counts[4].load(Ordering::SeqCst), 1 + new_effects);
        assert_eq!(service.counts[1].load(Ordering::SeqCst), 2);
        assert!(host.loader().code_status().started >= 3);
        let requests = service.requests.lock().unwrap();
        let latest = requests.last().unwrap()["messages"].to_string();
        assert!(latest.contains(if rollback {
            "context-one"
        } else {
            "context-two"
        }));
        drop(requests);
        stop.cancel();
        worker.await.unwrap();
    }
}
