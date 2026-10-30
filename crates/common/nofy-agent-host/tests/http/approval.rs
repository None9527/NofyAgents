use super::*;
use nofy_agent_executors::{
    http::{HttpConnection, HttpToolFactory, Method},
    resources::NoCredentials,
};
#[tokio::test]
async fn exact_approval_and_durable_resume_execute_one_http_effect_through_the_original_supervisor()
{
    let calls = Arc::new(AtomicUsize::new(0));
    let effects = calls.clone();
    let service = serve(Router::new().route(
        "/service/execute",
        route_post(move || {
            let effects = effects.clone();
            async move {
                effects.fetch_add(1, Ordering::SeqCst);
                Json(json!({"accepted":true}))
            }
        }),
    ))
    .await;
    let directory = tempfile::tempdir().unwrap();
    let mut registry =
        native::registry(Arc::new(Credentials(Arc::new(AtomicUsize::new(0))))).unwrap();
    let connection = HttpConnection::install(
        &format!("{}/service/", service.url),
        "1",
        [Method::Post].into(),
        Default::default(),
        Arc::new(NoCredentials),
    )
    .unwrap();
    registry
        .register_factory(Arc::new(
            HttpToolFactory::new("1", [("service".into(), Arc::new(connection))].into()).unwrap(),
        ))
        .unwrap();
    let host = KernelHost::open(directory.path(), registry, auth())
        .await
        .unwrap();
    let server = serve(host.router()).await;
    let document=serde_json::from_value(json!({"schema_version":1,"name":"managed-http-tool","required_policies":[{"id":"approval","version":"1"}],"modules":[
        {"reference":{"id":"tools","version":"1"},"factory":"tool.http","config":{"contract":{"name":"effect"},"connection":"service","path":"execute","method":"POST"}},
        {"reference":{"id":"approval","version":"1"},"factory":"policy.approval","config":{}}
    ],"programs":{"execute":{"kind":"tool","definition":{"name":"effect-program","tool_packs":[{"id":"tools","version":"1"}]},"call":{"id":"one-effect","name":"effect","arguments":{}}}}})).unwrap();
    let release = import(&server, &document).await;
    post(&server,"/api/v1/runs",json!({"run_id":"approval-run","thread_id":"approval-thread","system":"managed-http-tool","release":release,"program":"execute"})).await;
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { host.run_worker(worker_stop, 2).await.unwrap() });
    assert_eq!(
        outcome(&server, "approval-run").await["execution"]["status"],
        "paused"
    );
    assert_eq!(calls.load(Ordering::SeqCst), 0);
    let approvals = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/runs/approval-run/approvals",
        VIEW,
        Value::Null,
    )
    .await
    .1;
    assert_eq!(approvals.as_array().unwrap().len(), 1);
    let approval = approvals[0].clone();
    let mut forged = approval.clone();
    forged["call"]["arguments"] = json!({"changed":true});
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/runs/approval-run/approvals",
            ADMIN,
            json!({"request":forged,"allow":true})
        )
        .await
        .0,
        409
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/runs/approval-run/approvals",
            ADMIN,
            json!({"request":approval,"allow":true})
        )
        .await
        .0,
        204
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/runs/approval-run/approvals",
            ADMIN,
            json!({"request":approval,"allow":false})
        )
        .await
        .0,
        409
    );
    let action =
        json!({"run_id":"approval-run","command_id":"resume-approval","command":{"kind":"resume"}});
    post(&server, "/api/v1/actions", action.clone()).await;
    let receipt = action_result(&server, "resume-approval").await;
    assert!(receipt["error"].is_null());
    assert_eq!(
        outcome(&server, "approval-run").await["execution"]["status"],
        "completed"
    );
    assert_eq!(post(&server, "/api/v1/actions", action).await, receipt);
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    stop.cancel();
    worker.await.unwrap();
}
