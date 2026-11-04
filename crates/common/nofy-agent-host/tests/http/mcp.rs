use super::*;
#[path = "../../../nofy-agent-executors/tests/mcp_http/service.rs"]
mod protocol_service;
use nofy_agent_runtime::{
    governance::{BudgetScope, BudgetStore},
    registry::{ModuleInstance, ModuleRef},
    supervisor::RunSupervisor,
};

fn r(id: &str) -> Value {
    json!({"id":id,"version":"1"})
}
fn source(endpoint: &str, approval: bool, max_calls: u64) -> Value {
    let mut source = json!({"schema_version":1,"name":"mcp-assistant","required_governance":[r("quota")],"modules":[
        {"reference":r("connection"),"factory":"resource.mcp_http","config":{"endpoint":endpoint,"credential_ref":"MCP_TOKEN"}},
        {"reference":r("tools"),"factory":"tool_source.mcp","config":{"namespace":"project","allowed_tools":["files.read"],"aliases":{"files.read":"read"}},"dependencies":{"connection":r("connection")}},
        {"reference":r("ledger"),"factory":"resource.budget","config":{}},
        {"reference":r("quota"),"factory":"governance.budget_connected","config":{"limits":{"max_tool_calls":max_calls,"max_model_calls":0}},"dependencies":{"budget":r("ledger")}}
    ],"programs":{"execute":{"kind":"tool","definition":{"name":"mcp-tool","tool_sources":[r("tools")]},"call":{"id":"original-call","name":"project_read","arguments":{"value":7}}}}});
    if approval {
        source["required_policies"] = json!([r("approval")]);
        source["modules"]
            .as_array_mut()
            .unwrap()
            .push(json!({"reference":r("approval"),"factory":"policy.approval","config":{}}));
    }
    source
}
fn run(release: &Value) -> Value {
    json!({"run_id":"root","thread_id":"original-thread","system":"mcp-assistant","release":release,"program":"execute"})
}
async fn budget(host: &KernelHost, document: &Value) -> Value {
    let prepared = host
        .control()
        .prepare(serde_json::from_value(document.clone()).unwrap())
        .unwrap();
    let resolved = prepared
        .registry()
        .resolve(&[ModuleRef::new("quota", "1")])
        .unwrap();
    let ModuleInstance::Governance(profile) = &resolved.instances[&ModuleRef::new("quota", "1")]
    else {
        panic!("quota")
    };
    json!(
        host.store()
            .inspect(&BudgetScope {
                root_run_id: "root".into(),
                identity: profile.identity().into()
            })
            .await
            .unwrap()
    )
}
async fn execute(host: &KernelHost, document: &Value) {
    let prepared = host
        .control()
        .prepare(serde_json::from_value(document.clone()).unwrap())
        .unwrap();
    RunSupervisor::new(host.store().clone())
        .execute_submitted(prepared.registry(), "root")
        .await
        .unwrap();
}
fn worker(host: &KernelHost) -> (CancellationToken, tokio::task::JoinHandle<()>) {
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let host = host.clone();
    (
        stop,
        tokio::spawn(async move { host.run_worker(signal, 1).await.unwrap() }),
    )
}

#[tokio::test]
async fn mcp_declarations_approval_restart_credentials_budget_and_receipt_use_original_worker() {
    let protocol = protocol_service::server().await;
    *protocol.state.token.lock().unwrap() = "fixture-provider-token".into();
    let directory = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let kernel = host(directory.path(), reads.clone()).await;
    let server = serve(kernel.router()).await;
    let example: SystemDocument =
        serde_json::from_str(include_str!("../../examples/mcp-system.json")).unwrap();
    kernel.control().prepare(example).unwrap();
    let document = source(&protocol.url, true, 1);
    let validated = post(&server, "/api/v1/validate", document.clone()).await;
    let release = post(&server, "/api/v1/import", validated).await["bundle"]["digest"].clone();
    assert_eq!(reads.load(Ordering::SeqCst), 0);
    assert!(protocol.state.requests.lock().unwrap().is_empty());
    post(&server, "/api/v1/runs", run(&release)).await;
    execute(&kernel, &document).await;
    assert_eq!(
        outcome(&server, "root").await["execution"]["status"],
        "paused"
    );
    assert_eq!(
        protocol.state.calls.load(Ordering::SeqCst),
        0,
        "MCP readOnlyHint cannot bypass the original approval"
    );
    let approval = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/runs/root/approvals",
        VIEW,
        Value::Null,
    )
    .await
    .1[0]
        .clone();
    assert_eq!(approval["call"]["name"], "project_read");
    let before = budget(&kernel, &document).await;
    kernel.shutdown();
    drop(server);
    drop(kernel);

    let kernel = host(directory.path(), reads.clone()).await;
    let server = serve(kernel.router()).await;
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/runs/root/approvals",
            VIEW,
            Value::Null
        )
        .await
        .1[0],
        approval
    );
    let mut forged = approval.clone();
    forged["call"]["arguments"]["value"] = json!(99);
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/runs/root/approvals",
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
            "/api/v1/runs/root/approvals",
            ADMIN,
            json!({"request":approval,"allow":true})
        )
        .await
        .0,
        204
    );
    assert_eq!(budget(&kernel, &document).await, before);
    let (stop, task) = worker(&kernel);
    let command =
        json!({"run_id":"root","command_id":"resume-original","command":{"kind":"resume"}});
    post(&server, "/api/v1/actions", command.clone()).await;
    let receipt = action_result(&server, "resume-original").await;
    assert!(receipt["error"].is_null(), "{receipt}");
    let completed = outcome(&server, "root").await;
    assert_eq!(completed["execution"]["status"], "completed");
    let output: Value = serde_json::from_str(
        completed["execution"]["outcome"]["Completed"]["output"]
            .as_str()
            .unwrap(),
    )
    .unwrap();
    assert_eq!(output["value"]["structuredContent"]["value"], 8);
    assert_eq!(budget(&kernel, &document).await["used"]["tool_calls"], 1);
    assert_eq!(protocol.state.calls.load(Ordering::SeqCst), 1);
    assert!(protocol.state.sessions.load(Ordering::SeqCst) >= 2);
    assert_eq!(post(&server, "/api/v1/actions", command).await, receipt);
    assert_eq!(protocol.state.calls.load(Ordering::SeqCst), 1);
    stop.cancel();
    task.await.unwrap();
}

#[tokio::test]
async fn mcp_budget_floor_refuses_call_before_any_remote_effect() {
    let protocol = protocol_service::server().await;
    let directory = tempfile::tempdir().unwrap();
    let kernel = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(kernel.router()).await;
    let document = source(&protocol.url, false, 0);
    let release =
        post(&server, "/api/v1/import", document.clone()).await["bundle"]["digest"].clone();
    post(&server, "/api/v1/runs", run(&release)).await;
    let (stop, task) = worker(&kernel);
    assert_eq!(
        outcome(&server, "root").await["execution"]["status"],
        "budget_exceeded"
    );
    assert_eq!(protocol.state.calls.load(Ordering::SeqCst), 0);
    assert_eq!(budget(&kernel, &document).await["used"]["tool_calls"], 0);
    stop.cancel();
    task.await.unwrap();
}

#[tokio::test]
async fn uncertain_mcp_process() {
    let Ok(directory) = std::env::var("NOFY_MCP_CRASH_STATE") else {
        return;
    };
    let endpoint = std::env::var("NOFY_MCP_CRASH_ENDPOINT").unwrap();
    let kernel = host(
        std::path::Path::new(&directory),
        Arc::new(AtomicUsize::new(0)),
    )
    .await;
    let server = serve(kernel.router()).await;
    let document = source(&endpoint, false, 1);
    let release =
        post(&server, "/api/v1/import", document.clone()).await["bundle"]["digest"].clone();
    post(&server, "/api/v1/runs", run(&release)).await;
    let prepared = kernel
        .control()
        .prepare(serde_json::from_value(document).unwrap())
        .unwrap();
    let supervisor = RunSupervisor::new(kernel.store().clone())
        .with_lease_ttl(Duration::from_secs(2))
        .unwrap();
    tokio::spawn(async move {
        supervisor
            .execute_submitted(prepared.registry(), "root")
            .await
            .unwrap();
    });
    tokio::time::timeout(Duration::from_secs(10), async {
        loop {
            let calls: usize = reqwest::Client::new()
                .get(format!("{}/count", endpoint.trim_end_matches("/mcp")))
                .send()
                .await
                .unwrap()
                .json()
                .await
                .unwrap();
            if calls == 1 {
                break;
            }
            tokio::time::sleep(Duration::from_millis(10)).await;
        }
    })
    .await
    .unwrap();
    std::process::exit(79);
}

#[tokio::test]
async fn original_mcp_intent_recovers_after_real_exit_without_repeating_server_effect() {
    let protocol = protocol_service::server().await;
    protocol.state.mode("wait");
    let directory = tempfile::tempdir().unwrap();
    let state = directory.path().to_owned();
    let endpoint = protocol.url.clone();
    let result = tokio::task::spawn_blocking(move || {
        std::process::Command::new(std::env::current_exe().unwrap())
            .args(["--exact", "mcp::uncertain_mcp_process", "--nocapture"])
            .env("NOFY_MCP_CRASH_STATE", state)
            .env("NOFY_MCP_CRASH_ENDPOINT", endpoint)
            .output()
            .unwrap()
    })
    .await
    .unwrap();
    assert_eq!(
        result.status.code(),
        Some(79),
        "{}",
        String::from_utf8_lossy(&result.stderr)
    );
    assert_eq!(protocol.state.calls.load(Ordering::SeqCst), 1);
    let actual_effect = protocol.state.effects.lock().unwrap()[0].clone();
    protocol.state.release.cancel();
    protocol.state.mode("");
    tokio::time::sleep(Duration::from_millis(2100)).await;
    let kernel = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(kernel.router()).await;
    let document = source(&protocol.url, false, 1);
    execute(&kernel, &document).await;
    assert_eq!(
        outcome(&server, "root").await["execution"]["status"],
        "paused"
    );
    assert_eq!(protocol.state.calls.load(Ordering::SeqCst), 1);
    let (status, pending) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/runs/root/recovery/root",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200, "{pending}");
    assert_eq!(pending["call"]["name"], "project_read");
    let command = json!({"run_id":"root","command_id":"original-mcp-result","command":{"kind":"reconcile_root_tool","receipt":{"model_sequence":pending["model_sequence"],"call":pending["call"],"result":actual_effect,"is_error":false}}});
    let (stop, task) = worker(&kernel);
    post(&server, "/api/v1/actions", command.clone()).await;
    let receipt = action_result(&server, "original-mcp-result").await;
    assert!(receipt["error"].is_null(), "{receipt}");
    assert_eq!(
        outcome(&server, "root").await["execution"]["status"],
        "completed"
    );
    assert_eq!(post(&server, "/api/v1/actions", command).await, receipt);
    assert_eq!(protocol.state.calls.load(Ordering::SeqCst), 1);
    assert_eq!(budget(&kernel, &document).await["used"]["tool_calls"], 1);
    stop.cancel();
    task.await.unwrap();
}
