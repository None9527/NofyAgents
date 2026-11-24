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
    let host = KernelHost::open(&directory.path().join("state"), registry, auth())
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
    let store = host.store().clone();
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

    for (id, decision) in [
        ("auto-allow", Some(true)),
        ("auto-deny", Some(false)),
        ("abort", None),
    ] {
        post(&server,"/api/v1/runs",json!({"run_id":id,"thread_id":id,"system":"managed-http-tool","release":release,"program":"execute"})).await;
        assert_eq!(outcome(&server, id).await["execution"]["status"], "paused");
        let approval = store.pending_approvals(id).await.unwrap().pop().unwrap();
        let expected = if let Some(allow) = decision {
            for _ in 0..2 {
                store
                    .decide_scoped_and_continue(id, &approval, allow, Default::default())
                    .await
                    .unwrap();
            }
            "completed"
        } else {
            post(
                &server,
                &format!("/api/v1/runs/{id}/cancel"),
                json!({"command_id":"abort-approval"}),
            )
            .await;
            "cancelled"
        };
        tokio::time::timeout(Duration::from_secs(10), async {
            loop {
                if outcome(&server, id).await["execution"]["status"] == expected {
                    break;
                }
                tokio::time::sleep(Duration::from_millis(20)).await;
            }
        })
        .await
        .unwrap();
        assert!(store.pending_approvals(id).await.unwrap().is_empty());
        assert_eq!(calls.load(Ordering::SeqCst), 2);
        if decision.is_none() {
            assert!(
                store
                    .decide_scoped_and_continue(id, &approval, true, Default::default())
                    .await
                    .is_err()
            );
        }
    }
    let mut document = document;
    document.required_policies.clear();
    let release = import(&server, &document).await;
    for (id, mode, scope, expected_effects) in [
        ("mode-build-first", "build", Some("thread"), 3),
        ("mode-build-repeat", "build", None, 4),
        ("mode-guarded-first", "guarded", None, 5),
        ("mode-guarded-repeat", "guarded", None, 6),
        ("mode-full", "yolo", None, 7),
    ] {
        let thread = mode;
        post(
            &server,
            "/api/v1/runs",
            json!({
                "run_id":id,"thread_id":thread,"system":"managed-http-tool","release":release,
                "program":"execute","approval_mode":mode
            }),
        )
        .await;
        if let Some(scope) = scope {
            assert_eq!(outcome(&server, id).await["execution"]["status"], "paused");
            let approval = store.pending_approvals(id).await.unwrap().pop().unwrap();
            assert_eq!(calls.load(Ordering::SeqCst), expected_effects - 1);
            assert_eq!(
                request(
                    &server,
                    reqwest::Method::POST,
                    &format!("/api/v1/runs/{id}/approvals"),
                    ADMIN,
                    json!({"request":approval,"allow":true,"scope":scope,"continue_run":true})
                )
                .await
                .0,
                204
            );
        }
        tokio::time::timeout(Duration::from_secs(10), async {
            loop {
                if outcome(&server, id).await["execution"]["status"] == "completed" {
                    break;
                }
                tokio::time::sleep(Duration::from_millis(20)).await;
            }
        })
        .await
        .unwrap();
        assert_eq!(calls.load(Ordering::SeqCst), expected_effects);
    }
    let mut guarded_document = serde_json::to_value(&document).unwrap();
    guarded_document["programs"]["execute"]["call"]["arguments"] =
        json!({"command":"git reset --hard HEAD"});
    let release = import(&server, &serde_json::from_value(guarded_document).unwrap()).await;
    for (id, mode, expected) in [
        ("guarded-risk-one", "guarded", "paused"),
        ("guarded-risk-repeat", "guarded", "paused"),
        ("yolo-risk", "yolo", "completed"),
    ] {
        post(
            &server,
            "/api/v1/runs",
            json!({
                "run_id":id,"thread_id":id,"system":"managed-http-tool","release":release,
                "program":"execute","approval_mode":mode
            }),
        )
        .await;
        assert_eq!(outcome(&server, id).await["execution"]["status"], expected);
        if expected == "paused" {
            let pending = store.pending_approvals(id).await.unwrap().pop().unwrap();
            assert!(pending.policy_id.is_none());
            assert!(
                store
                    .decide_scoped_and_continue(
                        id,
                        &pending,
                        true,
                        nofy_agent_runtime::supervisor::ApprovalScope::Thread
                    )
                    .await
                    .is_err()
            );
            store
                .decide_scoped_and_continue(id, &pending, true, Default::default())
                .await
                .unwrap();
            tokio::time::timeout(Duration::from_secs(10), async {
                loop {
                    if outcome(&server, id).await["execution"]["status"] == "completed" {
                        break;
                    }
                    tokio::time::sleep(Duration::from_millis(20)).await;
                }
            })
            .await
            .unwrap();
        }
    }
    assert_eq!(calls.load(Ordering::SeqCst), 10);
    let mut read_document = serde_json::to_value(&document).unwrap();
    read_document["modules"][0]["config"]["contract"]["effect"] = json!("read_only");
    let release = import(&server, &serde_json::from_value(read_document).unwrap()).await;
    post(
        &server,
        "/api/v1/runs",
        json!({
            "run_id":"build-read","thread_id":"build-read","system":"managed-http-tool",
            "release":release,"program":"execute","approval_mode":"build"
        }),
    )
    .await;
    assert_eq!(
        outcome(&server, "build-read").await["execution"]["status"],
        "completed"
    );
    assert!(
        store
            .pending_approvals("build-read")
            .await
            .unwrap()
            .is_empty()
    );
    assert_eq!(calls.load(Ordering::SeqCst), 11);
    stop.cancel();
    worker.await.unwrap();
}
