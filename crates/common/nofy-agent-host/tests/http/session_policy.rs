use super::*;
use nofy_agent_runtime::supervisor::RunSupervisor;

fn source(url: &str, script: bool) -> SystemDocument {
    let mut d = serde_json::to_value(document(url)).unwrap();
    d["programs"]["chat"]["definition"]["schema_version"] = json!(2);
    d["programs"]["chat"]["definition"]["session_policy"] = json!({"id":"session","version":"1"});
    let module = if script {
        json!({"reference":{"id":"session","version":"1"},"factory":"session_policy.programmed","config":{"source":
        "#{decision: \"allow\", reason: \"external source\", session_id: args.request.session_id, display_name: if args.phase == \"create\" { \"source session\" } else { () }, archive: false}"}})
    } else {
        json!({"reference":{"id":"session","version":"1"},"factory":"session_policy.rules","config":{
        "naming":{"prefix":"coding"},"admission":{"when_busy":"queue"},"routing":{"mode":"labels","keys":["project"]},"history":{"archive_after_idle_seconds":null}}})
    };
    d["modules"].as_array_mut().unwrap().push(module);
    serde_json::from_value(d).unwrap()
}
fn start(release: &str, id: &str) -> Value {
    json!({"session_id":"conversation","command_id":id,"expected_session_revision":null,
        "request_json":serde_json::to_string(&run(release,"first")).unwrap(),"labels":{"project":"nofy"}})
}
fn control(id: &str, revision: &str) -> Value {
    json!({"session_id":"conversation","command_id":id,"expected_session_revision":revision})
}
async fn get(server: &Serving, path: &str) -> Value {
    let (status, value) = request(server, reqwest::Method::GET, path, ADMIN, Value::Null).await;
    assert_eq!(status, 200, "{value}");
    value
}
#[tokio::test]
async fn declared_rules_and_session_http_controls_share_exact_replay_and_quiescent_boundary() {
    let calls = Arc::new(Mutex::new(vec![]));
    let provider = serve(
        Router::new()
            .route("/v1/chat/completions", route_post(super::provider))
            .with_state(calls.clone()),
    )
    .await;
    let dir = tempfile::tempdir().unwrap();
    let kernel = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(kernel.router()).await;
    let source = source(&provider.url, false);
    let registry = kernel
        .control()
        .prepare(source.clone())
        .unwrap()
        .registry()
        .clone();
    let release = import(&server, &source).await;
    assert_eq!(
        get(&server, "/api/v1/sessions/capabilities").await["operations"]
            .as_array()
            .unwrap()
            .len(),
        20
    );
    let command = start(&release, "start");
    let first = post(&server, "/api/v1/sessions/start", command.clone()).await;
    assert_eq!(first["phase"], "applied");
    assert_eq!(first["session"]["display_name"], "coding conversation");
    assert!(calls.lock().unwrap().is_empty());
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/sessions/conversation/close",
            ADMIN,
            control("busy", "0")
        )
        .await
        .0,
        409
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/sessions/conversation/close",
            VIEW,
            control("deny", "0")
        )
        .await
        .0,
        403
    );
    RunSupervisor::new(kernel.store().clone())
        .execute_submitted(&registry, "first")
        .await
        .unwrap();
    let proposal=post(&server,"/api/v1/sessions/conversation/plan",json!({"session_id":"conversation","expected_session_revision":"0","change":{"kind":"archive"}})).await;
    assert_eq!(proposal["applicable"], true);
    assert_eq!(
        get(&server, "/api/v1/sessions/conversation").await["session_revision"],
        "0"
    );
    let mut update = control("metadata", "0");
    update["display_name"] = json!("renamed");
    update["labels"] = json!({"project":"updated"});
    let (status, edited) = request(
        &server,
        reqwest::Method::PATCH,
        "/api/v1/sessions/conversation/metadata",
        ADMIN,
        update.clone(),
    )
    .await;
    assert_eq!(status, 200, "{edited}");
    assert_eq!(edited["session_revision"], "1");
    post(
        &server,
        "/api/v1/sessions/conversation/close",
        control("close", "1"),
    )
    .await;
    post(
        &server,
        "/api/v1/sessions/conversation/archive",
        control("archive", "2"),
    )
    .await;
    assert!(
        get(&server, "/api/v1/sessions")
            .await
            .as_array()
            .unwrap()
            .is_empty()
    );
    assert_eq!(
        get(&server, "/api/v1/sessions?include_archived=true")
            .await
            .as_array()
            .unwrap()
            .len(),
        1
    );
    assert_eq!(
        first,
        post(&server, "/api/v1/sessions/start", command).await
    );
    assert_eq!(
        get(&server, "/api/v1/sessions/conversation/commands/metadata").await,
        edited
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::PATCH,
            "/api/v1/sessions/conversation/metadata",
            ADMIN,
            update
        )
        .await
        .1,
        edited
    );
    post(
        &server,
        "/api/v1/sessions/conversation/unarchive",
        control("unarchive", "3"),
    )
    .await;
    post(
        &server,
        "/api/v1/sessions/conversation/reopen",
        control("reopen", "4"),
    )
    .await;
    let route=post(&server,"/api/v1/sessions/route",json!({"system":"portable-assistant","release":release,"program":"chat","labels":{"project":"updated"}})).await;
    assert_eq!(route["selected_session_id"], "conversation");
    assert_eq!(calls.lock().unwrap().len(), 1);
    let p = get(&server, "/api/v1/sessions/conversation/policy").await;
    assert!(p["runtime_store_json"].is_string());
}

#[tokio::test]
async fn programmed_session_factory_runs_in_real_loader_and_keeps_frozen_source_after_reopen() {
    let calls = Arc::new(Mutex::new(vec![]));
    let provider = serve(
        Router::new()
            .route("/v1/chat/completions", route_post(super::provider))
            .with_state(calls.clone()),
    )
    .await;
    let dir = tempfile::tempdir().unwrap();
    let kernel = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(kernel.router()).await;
    let original = source(&provider.url, true);
    let release = import(&server, &original).await;
    let first = post(
        &server,
        "/api/v1/sessions/start",
        start(&release, "source-start"),
    )
    .await;
    assert_eq!(first["phase"], "applied");
    assert_eq!(first["session"]["display_name"], "source session");
    assert!(calls.lock().unwrap().is_empty());
    let proof = get(&server, "/api/v1/sessions/conversation/turns/first").await;
    let proof: Value =
        serde_json::from_str(proof["policy_admission_json"].as_str().unwrap()).unwrap();
    assert_eq!(proof["phase"], "allowed");
    drop(server);
    drop(kernel);
    let reopened = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(reopened.router()).await;
    assert_eq!(
        first,
        post(
            &server,
            "/api/v1/sessions/start",
            start(&release, "source-start")
        )
        .await
    );
    let state = get(&server, "/api/v1/sessions/conversation").await;
    assert_eq!(state["policy"]["module"]["id"], "session");
    assert_eq!(state["display_name"], "source session");
}

#[tokio::test]
async fn malformed_policy_output_rejects_start_without_dispatch_and_can_be_queried_without_instance()
 {
    let dir = tempfile::tempdir().unwrap();
    let kernel = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(kernel.router()).await;
    let mut d = serde_json::to_value(source("http://127.0.0.1:1", true)).unwrap();
    d["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|m| m["factory"] == "session_policy.programmed")
        .unwrap()["config"]["source"] = json!("#{decision: \"allow\"}");
    let release = import(&server, &serde_json::from_value(d).unwrap()).await;
    let failed = post(
        &server,
        "/api/v1/sessions/start",
        start(&release, "invalid-source"),
    )
    .await;
    assert_eq!(failed["phase"], "rejected");
    assert!(
        kernel
            .store()
            .execution_job("first")
            .await
            .unwrap()
            .is_none()
    );
    assert!(
        kernel
            .store()
            .session("conversation")
            .await
            .unwrap()
            .is_none()
    );
    assert_eq!(
        get(
            &server,
            "/api/v1/sessions/conversation/commands/invalid-source"
        )
        .await,
        failed
    );
}
