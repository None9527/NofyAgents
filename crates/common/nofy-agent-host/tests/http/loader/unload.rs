use super::*;

async fn preview(server: &Serving, objects: Value) -> Value {
    let (status, value) = request(
        server,
        reqwest::Method::POST,
        "/api/v1/loader/unload/plan",
        VIEW,
        json!({"objects":objects}),
    )
    .await;
    assert_eq!(status, 200, "{value}");
    value
}
fn command(plan: &Value, id: &str) -> Value {
    json!({"command_id":id,"expected_revision":plan["revision"],"fingerprint":plan["fingerprint"],"objects":plan["objects"]})
}
#[tokio::test]
async fn scoped_http_unload_is_explicit_cas_bound_and_completed_replay_preserves_readmission() {
    let dir = tempfile::tempdir().unwrap();
    let (_host, server, _) = setup(dir.path()).await;
    let bundle = package(3);
    let info = post(&server, "/api/v1/artifacts", bundle.clone()).await;
    let key = json!({"kind":"artifact","digest":info["digest"]});
    for objects in [
        json!([]),
        json!([key.clone(), key.clone()]),
        json!([{"kind":"artifact","digest":"../outside"}]),
        json!([{"kind":"runtime","id":"r0","revision":"0".repeat(64)}]),
        json!(
            (0..9)
                .map(|i| json!({"kind":"artifact","digest":format!("{i:064x}")}))
                .collect::<Vec<_>>()
        ),
    ] {
        assert_eq!(
            request(
                &server,
                reqwest::Method::POST,
                "/api/v1/loader/unload/plan",
                VIEW,
                json!({"objects":objects})
            )
            .await
            .0,
            422
        );
    }
    let plan = preview(&server, json!([key])).await;
    assert_eq!(plan["eligible"], true);
    assert!(!plan.to_string().contains("main.py"));
    assert_eq!(plan["references"]["deletion_authorized"], false);
    let command = command(&plan, "delete-unused");
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/loader/unload",
            VIEW,
            command.clone()
        )
        .await
        .0,
        403
    );
    let mut wrong = command.clone();
    wrong["fingerprint"] = json!("0".repeat(64));
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/loader/unload",
            ADMIN,
            wrong
        )
        .await
        .0,
        409
    );
    let receipt = post(&server, "/api/v1/loader/unload", command.clone()).await;
    assert_eq!(receipt["state"], "complete");
    assert_eq!(receipt["revision"], 1);
    let path = format!("/api/v1/artifacts/{}", info["digest"].as_str().unwrap());
    assert_eq!(
        request(&server, reqwest::Method::GET, &path, VIEW, Value::Null)
            .await
            .0,
        404
    );
    post(&server, "/api/v1/artifacts", bundle).await;
    assert_eq!(
        post(&server, "/api/v1/loader/unload", command).await,
        receipt
    );
    assert_eq!(
        request(&server, reqwest::Method::GET, &path, VIEW, Value::Null)
            .await
            .0,
        200
    );
    let (status, stored) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/loader/unload/receipts/1",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200);
    assert_eq!(stored, receipt);
    let (status, state) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/loader/unload",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200);
    assert_eq!(state["pending"], Value::Null);
    assert_eq!(state["admission_blocked"], false);
}

#[tokio::test]
async fn preview_before_publication_cannot_delete_unapplied_release_queued_job_or_successful_history()
 {
    use nofy_agent_runtime::supervisor::RunSupervisor;
    let dir = tempfile::tempdir().unwrap();
    let (host, server, installed) = setup(dir.path()).await;
    let bundle = package(2);
    let artifact = post(&server, "/api/v1/artifacts", bundle.clone()).await;
    let key = json!({"kind":"artifact","digest":artifact["digest"]});
    let before = preview(&server, json!([key.clone()])).await;
    let source = document(&installed, json!({"bundle":bundle}));
    let compiled = host
        .control()
        .prepare(serde_json::from_value(source.clone()).unwrap())
        .unwrap();
    let publication = post(&server, "/api/v1/import", source).await;
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/loader/unload",
            ADMIN,
            command(&before, "stale-preview")
        )
        .await
        .0,
        409
    );
    let objects = json!([key]);
    let pinned = preview(&server, objects.clone()).await;
    assert_eq!(pinned["eligible"], false);
    assert_eq!(
        pinned["references"]["references"][0]["counts"]["publication"],
        1
    );
    assert!(
        host.control()
            .inspect()
            .await
            .unwrap()
            .unwrap()
            .data
            .active
            .is_empty()
    );
    post(
        &server,
        "/api/v1/runs",
        run(
            publication["bundle"]["digest"].as_str().unwrap(),
            "retained-history",
        ),
    )
    .await;
    let queued = preview(&server, objects.clone()).await;
    assert_eq!(queued["references"]["references"][0]["counts"]["job"], 1);
    let supervisor = RunSupervisor::new(host.store().clone());
    supervisor
        .execute_submitted(compiled.registry(), "retained-history")
        .await
        .unwrap();
    let successful = outcome(&server, "retained-history").await;
    assert_eq!(output(&successful)["result"], 14);
    let finished = preview(&server, objects).await;
    assert_eq!(finished["eligible"], false);
    assert_eq!(
        finished["references"]["references"][0]["counts"]["execution"],
        1
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/loader/unload",
            ADMIN,
            command(&finished, "history-is-not-garbage")
        )
        .await
        .0,
        409
    );
    assert_eq!(
        outcome(&server, "retained-history").await["execution"]["outcome"],
        successful["execution"]["outcome"]
    );
    assert_eq!(host.loader().unload.status().unwrap().revision, 0);
}

#[tokio::test]
async fn exclusive_commit_maintenance_keeps_run_views_and_cancel_acceptance_available() {
    use nofy_agent_runtime::supervisor::RunSupervisor;
    let dir = tempfile::tempdir().unwrap();
    let (host, server, installed) = setup(dir.path()).await;
    let source = document(&installed, json!({"bundle":package(2)}));
    let compiled = host
        .control()
        .prepare(serde_json::from_value(source.clone()).unwrap())
        .unwrap();
    let publication = post(&server, "/api/v1/import", source).await;
    post(
        &server,
        "/api/v1/runs",
        run(
            publication["bundle"]["digest"].as_str().unwrap(),
            "cancel-maintenance",
        ),
    )
    .await;
    let held = host.loader().commits.exclusive().unwrap();
    let (status, view) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/runs/cancel-maintenance",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200, "{view}");
    tokio::time::timeout(
        Duration::from_secs(2),
        post(
            &server,
            "/api/v1/runs/cancel-maintenance/cancel",
            json!({"command_id":"cancel-under-fence"}),
        ),
    )
    .await
    .unwrap();
    drop(held);
    let supervisor = RunSupervisor::new(host.store().clone());
    let result = supervisor
        .execute_submitted(compiled.registry(), "cancel-maintenance")
        .await
        .unwrap();
    assert!(result.is_none());
    let (status, view) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/runs/cancel-maintenance",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200, "{view}");
    assert!(matches!(
        host.store()
            .execution_job("cancel-maintenance")
            .await
            .unwrap()
            .unwrap()
            .status,
        nofy_agent_runtime::supervisor::jobs::JobStatus::Cancelled
    ));
    assert_eq!(view["execution"], Value::Null);
}

#[tokio::test]
async fn unloading_an_unused_artifact_keeps_an_old_release_immediately_usable_without_refresh() {
    use nofy_agent_runtime::supervisor::RunSupervisor;
    let dir = tempfile::tempdir().unwrap();
    let (host, server, installed) = setup(dir.path()).await;
    let source = document(&installed, json!({"bundle":package(2)}));
    let publication = post(&server, "/api/v1/import", source.clone()).await;
    let release = publication["bundle"]["digest"].as_str().unwrap();
    let unused = post(&server, "/api/v1/artifacts", package(5)).await;
    let plan = preview(
        &server,
        json!([{"kind":"artifact","digest":unused["digest"]}]),
    )
    .await;
    assert_eq!(plan["eligible"], true);
    assert_eq!(plan["parts"].as_array().unwrap().len(), 1);
    let receipt = post(
        &server,
        "/api/v1/loader/unload",
        command(&plan, "remove-unused-artifact"),
    )
    .await;
    assert_eq!(receipt["state"], "complete");
    // No worker, list, or import may be needed before existing entry points
    // use the still-retained release.
    let (status, programs) = request(
        &server,
        reqwest::Method::GET,
        &format!("/api/v1/releases/{release}/programs"),
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200, "{programs}");
    post(&server, "/api/v1/runs", run(release, "after-unload")).await;
    let compiled = host
        .control()
        .prepare(serde_json::from_value(source).unwrap())
        .unwrap();
    RunSupervisor::new(host.store().clone())
        .execute_submitted(compiled.registry(), "after-unload")
        .await
        .unwrap();
    assert_eq!(
        output(&outcome(&server, "after-unload").await)["result"],
        14
    );
}
