use super::*;
use nofy_agent_runtime::{
    governance::{BudgetScope, BudgetStore},
    registry::{ModuleInstance, ModuleRef},
};

fn r(id: &str) -> Value {
    json!({"id":id,"version":"1"})
}
fn source(url: &str, budget: bool) -> Value {
    let mut source = json!({"schema_version":1,"name":"root-evidence","modules":[
        {"reference":r("service"),"factory":"resource.http","config":{"base_url":format!("{url}/service/"),"methods":["POST"]}},
        {"reference":r("effect"),"factory":"tool.http_connected","config":{"contract":{"name":"effect"},"path":"effect","method":"POST"},"dependencies":{"connection":r("service")}}
    ],"programs":{"execute":{"kind":"tool","definition":{"name":"root-effect","tool_packs":[r("effect")]},"call":{"id":"external-effect","name":"effect","arguments":{}}}}});
    if budget {
        source["required_governance"] = json!([r("quota")]);
        source["modules"].as_array_mut().unwrap().extend([
            json!({"reference":r("ledger"),"factory":"resource.budget","config":{}}),
            json!({"reference":r("quota"),"factory":"governance.budget_connected","config":{"limits":{"max_tool_calls":1,"max_model_calls":0}},"dependencies":{"budget":r("ledger")}})
        ]);
    }
    source
}
#[tokio::test]
async fn uncertain_root_process() {
    let Ok(directory) = std::env::var("NOFY_ROOT_EVIDENCE_STATE") else {
        return;
    };
    let url = std::env::var("NOFY_ROOT_EVIDENCE_SERVICE").unwrap();
    let budget = std::env::var("NOFY_ROOT_EVIDENCE_BUDGET").unwrap() == "yes";
    let host = host(
        std::path::Path::new(&directory),
        Arc::new(AtomicUsize::new(0)),
    )
    .await;
    let document = source(&url, budget);
    let registry = host
        .control()
        .prepare(serde_json::from_value(document.clone()).unwrap())
        .unwrap()
        .registry()
        .clone();
    let server = serve(host.router()).await;
    let release = post(&server, "/api/v1/import", document).await["bundle"]["digest"].clone();
    post(&server,"/api/v1/runs",json!({"run_id":"root","thread_id":"thread","system":"root-evidence","release":release,"program":"execute"})).await;
    let supervisor = nofy_agent_runtime::supervisor::RunSupervisor::new(host.store().clone())
        .with_lease_ttl(Duration::from_secs(2))
        .unwrap();
    tokio::spawn(async move {
        supervisor
            .execute_submitted(&registry, "root")
            .await
            .unwrap()
    });
    tokio::time::timeout(Duration::from_secs(10), async {
        loop {
            let count: usize = reqwest::Client::new()
                .get(format!("{url}/count"))
                .send()
                .await
                .unwrap()
                .json()
                .await
                .unwrap();
            if count == 1 {
                break;
            }
            tokio::time::sleep(Duration::from_millis(10)).await;
        }
    })
    .await
    .unwrap();
    std::process::exit(97);
}
async fn target(server: &Serving, token: &str) -> (u16, Value) {
    request(
        server,
        reqwest::Method::GET,
        "/api/v1/runs/root/recovery/root",
        token,
        Value::Null,
    )
    .await
}
#[tokio::test]
async fn real_root_effect_is_reconciled_after_process_exit_with_and_without_budget() {
    for budget in [false, true] {
        let calls = Arc::new(AtomicUsize::new(0));
        let effects = calls.clone();
        let count = calls.clone();
        let finish = CancellationToken::new();
        let pending = finish.clone();
        let service = serve(
            Router::new()
                .route(
                    "/service/effect",
                    route_post(move || {
                        let effects = effects.clone();
                        let pending = pending.clone();
                        async move {
                            effects.fetch_add(1, Ordering::SeqCst);
                            pending.cancelled().await;
                            Json(json!({"accepted":true}))
                        }
                    }),
                )
                .route(
                    "/count",
                    axum::routing::get(move || {
                        let count = count.clone();
                        async move { Json(count.load(Ordering::SeqCst)) }
                    }),
                ),
        )
        .await;
        let dir = tempfile::tempdir().unwrap();
        let directory = dir.path().to_owned();
        let url = service.url.clone();
        let output = tokio::task::spawn_blocking(move || {
            std::process::Command::new(std::env::current_exe().unwrap())
                .args([
                    "--exact",
                    "root_reconciliation::uncertain_root_process",
                    "--nocapture",
                ])
                .env("NOFY_ROOT_EVIDENCE_STATE", directory)
                .env("NOFY_ROOT_EVIDENCE_SERVICE", url)
                .env(
                    "NOFY_ROOT_EVIDENCE_BUDGET",
                    if budget { "yes" } else { "no" },
                )
                .output()
                .unwrap()
        })
        .await
        .unwrap();
        assert_eq!(
            output.status.code(),
            Some(97),
            "{}",
            String::from_utf8_lossy(&output.stderr)
        );
        assert_eq!(calls.load(Ordering::SeqCst), 1);
        tokio::time::sleep(Duration::from_millis(2100)).await;
        let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
        let scope = if budget {
            let prepared = host
                .control()
                .prepare(serde_json::from_value(source(&service.url, true)).unwrap())
                .unwrap();
            let resolved = prepared
                .registry()
                .resolve(&[ModuleRef::new("quota", "1")])
                .unwrap();
            let ModuleInstance::Governance(profile) =
                &resolved.instances[&ModuleRef::new("quota", "1")]
            else {
                panic!("quota")
            };
            Some(BudgetScope {
                root_run_id: "root".into(),
                identity: profile.identity().into(),
            })
        } else {
            None
        };
        let server = serve(host.router()).await;
        let stop = CancellationToken::new();
        let worker_stop = stop.clone();
        let worker_host = host.clone();
        let worker =
            tokio::spawn(async move { worker_host.run_worker(worker_stop, 1).await.unwrap() });
        assert_eq!(
            outcome(&server, "root").await["execution"]["status"],
            "paused"
        );
        let (status, pending) = target(&server, VIEW).await;
        assert_eq!(status, 200, "{pending}");
        assert_eq!(pending["call"]["name"], "effect");
        assert_eq!(
            reqwest::Client::new()
                .get(format!("{}/api/v1/runs/root/recovery/root", server.url))
                .bearer_auth("invalid")
                .send()
                .await
                .unwrap()
                .status(),
            401
        );
        let receipt = json!({"model_sequence":pending["model_sequence"],"call":pending["call"],"result":{"accepted":true},"is_error":false});
        let command = json!({"command_id":"root-proof","run_id":"root","command":{"kind":"reconcile_root_tool","receipt":receipt}});
        let mut missing = command.clone();
        missing["command"]["receipt"]
            .as_object_mut()
            .unwrap()
            .remove("model_sequence");
        assert_eq!(
            reqwest::Client::new()
                .post(format!("{}/api/v1/actions", server.url))
                .bearer_auth(ADMIN)
                .json(&missing)
                .send()
                .await
                .unwrap()
                .status(),
            422
        );
        assert_eq!(
            request(
                &server,
                reqwest::Method::POST,
                "/api/v1/actions",
                VIEW,
                command.clone()
            )
            .await
            .0,
            403
        );
        for (id, field, value) in [
            ("wrong-epoch", "model_sequence", json!(99)),
            (
                "wrong-call",
                "call",
                json!({"id":"other","name":"effect","arguments":{}}),
            ),
        ] {
            let mut bad = command.clone();
            bad["command_id"] = json!(id);
            bad["command"]["receipt"][field] = value;
            post(&server, "/api/v1/actions", bad).await;
            assert!(action_result(&server, id).await["error"].is_string());
            assert_eq!(calls.load(Ordering::SeqCst), 1);
        }
        if let Some(scope) = &scope {
            let before = host.store().inspect(scope).await.unwrap().unwrap();
            assert_eq!(before.used.tool_calls, 0);
            assert_eq!(before.reserved.tool_calls, 1);
        }
        post(&server, "/api/v1/actions", command.clone()).await;
        let settled = action_result(&server, "root-proof").await;
        assert!(settled["error"].is_null(), "{settled}");
        assert_eq!(
            outcome(&server, "root").await["execution"]["status"],
            "completed"
        );
        assert!(target(&server, VIEW).await.1.is_null());
        assert_eq!(
            post(&server, "/api/v1/actions", command.clone()).await,
            settled
        );
        let mut changed = command.clone();
        changed["command_id"] = json!("changed-result");
        changed["command"]["receipt"]["result"] = json!({"forged":true});
        post(&server, "/api/v1/actions", changed).await;
        assert!(action_result(&server, "changed-result").await["error"].is_string());
        let mut same = command;
        same["command_id"] = json!("same-evidence");
        post(&server, "/api/v1/actions", same).await;
        assert!(action_result(&server, "same-evidence").await["error"].is_null());
        if let Some(scope) = &scope {
            let after = host.store().inspect(scope).await.unwrap().unwrap();
            assert_eq!(after.used.tool_calls, 1);
            assert_eq!(after.reserved.tool_calls, 0);
            assert_eq!(after.active_operations, 0);
        }
        assert_eq!(calls.load(Ordering::SeqCst), 1);
        finish.cancel();
        stop.cancel();
        worker.await.unwrap();
    }
}
