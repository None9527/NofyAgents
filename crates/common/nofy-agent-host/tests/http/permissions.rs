//! Real Rhai tools exercise persisted approvals without a model fixture.
use super::*;
fn r(id: &str) -> Value {
    json!({"id":id,"version":"1"})
}
fn document() -> Value {
    json!({"schema_version":1,"name":"permission-system","modules":[
        {"reference":r("approval"),"factory":"policy.approval","config":{}},
        {"reference":r("rules"),"factory":"policy.tool_rules","config":{"default":"deny","rules":[{"id":"named-read","category":"workspace.read","action":"ask","tools":["read_value"],"arguments_schema":{"type":"object","required":["value"],"properties":{"value":{"type":"integer","minimum":0,"maximum":10}},"additionalProperties":false}}]},"dependencies":{"approval":r("approval")}},
        {"reference":r("tool"),"factory":"tool.rhai","config":{"contract":{"name":"read_value","input_schema":{"type":"object","required":["value"],"properties":{"value":{"type":"integer"}}}},"source":"#{value:args.value + 1}"}}
    ],"required_policies":[r("rules")],"programs":{"read":{"kind":"tool","definition":{"name":"read","tool_packs":[r("tool")]},"call":{"id":"read","name":"read_value","arguments":{"value":1}}}}})
}
fn worker(kernel: &KernelHost) -> (CancellationToken, tokio::task::JoinHandle<()>) {
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let kernel = kernel.clone();
    (
        stop,
        tokio::spawn(async move { kernel.run_worker(signal, 2).await.unwrap() }),
    )
}
async fn submit(server: &Serving, release: &Value, run: &str, thread: &str, value: u64) -> Value {
    post(server,"/api/v1/runs",json!({"run_id":run,"thread_id":thread,"system":"permission-system","release":release,"program":"read","parameters":{"value":value}})).await;
    outcome(server, run).await
}
async fn approve(server: &Serving, run: &str, scope: &str) -> Value {
    let approval = request(
        server,
        reqwest::Method::GET,
        &format!("/api/v1/runs/{run}/approvals"),
        ADMIN,
        Value::Null,
    )
    .await
    .1[0]
        .clone();
    assert!(approval["policy_id"].as_str().is_some());
    post(
        server,
        &format!("/api/v1/runs/{run}/approvals"),
        json!({"request":approval,"allow":true,"scope":scope}),
    )
    .await;
    post(
        server,
        "/api/v1/actions",
        json!({"command_id":format!("resume-{run}"),"run_id":run,"command":{"kind":"resume"}}),
    )
    .await;
    action_result(server, &format!("resume-{run}")).await
}
#[tokio::test]
async fn remembered_thread_rule_survives_restart_is_bounded_and_exactly_revocable() {
    let directory = tempfile::tempdir().unwrap();
    let kernel = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(kernel.router()).await;
    let imported = post(&server, "/api/v1/import", document()).await;
    let release = imported["bundle"]["digest"].clone();
    let (stop, worker) = self::worker(&kernel);
    assert_eq!(
        submit(&server, &release, "first", "same-thread", 1).await["execution"]["status"],
        "paused"
    );
    let accepted = approve(&server, "first", "thread").await;
    assert!(accepted["error"].is_null(), "{accepted}");
    assert_eq!(
        submit(&server, &release, "second", "same-thread", 1).await["execution"]["status"],
        "completed"
    );
    assert_eq!(
        submit(&server, &release, "outside", "outside-thread", 99).await["execution"]["status"],
        "completed"
    );
    let original = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/runs/outside",
        ADMIN,
        Value::Null,
    )
    .await
    .1;
    assert!(
        original
            .to_string()
            .contains("outside the declared permission rules"),
        "{original}"
    );
    assert_eq!(
        submit(&server, &release, "other", "other-thread", 3).await["execution"]["status"],
        "paused"
    );
    let grants = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/approval-grants",
        ADMIN,
        Value::Null,
    )
    .await
    .1;
    assert_eq!(grants.as_array().unwrap().len(), 1);
    let grant = grants[0].clone();
    stop.cancel();
    worker.await.unwrap();
    drop(server);
    drop(kernel);
    let kernel = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(kernel.router()).await;
    let (stop, worker) = self::worker(&kernel);
    assert_eq!(
        submit(&server, &release, "after-restart", "same-thread", 1).await["execution"]["status"],
        "completed"
    );
    let revoke = json!({"expected_revision":"0","command_id":"revoke-original"});
    let path = format!(
        "/api/v1/approval-grants/{}/revoke",
        grant["grant_id"].as_str().unwrap()
    );
    let first = post(&server, &path, revoke.clone()).await;
    assert_eq!(first["active"], false);
    assert_eq!(post(&server, &path, revoke).await, first);
    assert_eq!(
        submit(&server, &release, "after-revoke", "same-thread", 1).await["execution"]["status"],
        "paused"
    );
    stop.cancel();
    worker.await.unwrap();
}
#[tokio::test]
async fn remembered_policy_never_approves_another_policy_namespace() {
    let directory = tempfile::tempdir().unwrap();
    let kernel = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(kernel.router()).await;
    let mut source = document();
    let mut second = source["modules"]
        .as_array()
        .unwrap()
        .iter()
        .find(|m| m["reference"]["id"] == "rules")
        .unwrap()
        .clone();
    second["reference"] = r("second-rules");
    source["modules"].as_array_mut().unwrap().push(second);
    source["required_policies"]
        .as_array_mut()
        .unwrap()
        .push(r("second-rules"));
    let imported = post(&server, "/api/v1/import", source).await;
    let release = imported["bundle"]["digest"].clone();
    let (stop, worker) = self::worker(&kernel);
    assert_eq!(
        submit(&server, &release, "double", "double-thread", 1).await["execution"]["status"],
        "paused"
    );
    let mut identities = Vec::new();
    for (index, scope) in ["thread", "once"].into_iter().enumerate() {
        let requests = request(
            &server,
            reqwest::Method::GET,
            "/api/v1/runs/double/approvals",
            ADMIN,
            Value::Null,
        )
        .await
        .1;
        assert_eq!(requests.as_array().unwrap().len(), 1, "{requests}");
        identities.push(requests[0]["policy_id"].clone());
        post(
            &server,
            "/api/v1/runs/double/approvals",
            json!({"request":requests[0],"allow":true,"scope":scope}),
        )
        .await;
        let id = format!("double-resume-{index}");
        post(
            &server,
            "/api/v1/actions",
            json!({"command_id":id,"run_id":"double","command":{"kind":"resume"}}),
        )
        .await;
        let action = action_result(&server, &id).await;
        assert!(action["error"].is_null(), "{action}");
        if index == 0 {
            assert_eq!(
                outcome(&server, "double").await["execution"]["status"],
                "paused"
            );
        }
    }
    assert_ne!(identities[0], identities[1]);
    assert_eq!(
        outcome(&server, "double").await["execution"]["status"],
        "completed"
    );
    assert_eq!(
        submit(&server, &release, "double-next", "double-thread", 1).await["execution"]["status"],
        "paused"
    );
    let pending = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/runs/double-next/approvals",
        ADMIN,
        Value::Null,
    )
    .await
    .1;
    assert_eq!(pending[0]["policy_id"], identities[1]);
    stop.cancel();
    worker.await.unwrap();
}
