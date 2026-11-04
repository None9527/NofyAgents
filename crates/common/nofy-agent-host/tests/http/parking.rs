use super::*;
#[path = "parking/modules.rs"]
mod modules;
#[path = "parking/transitions.rs"]
mod transitions;
use nofy_agent_runtime::{
    Checkpointer,
    governance::{BudgetScope, BudgetStore},
    registry::{ModuleInstance, ModuleRef},
    system::content_digest,
};

fn r(id: &str) -> Value {
    json!({"id":id,"version":"1"})
}
fn source(url: &str, unmetered: bool) -> Value {
    let mut source = super::model_reconciliation::source(url, false, unmetered);
    source["programs"]["execute"]["definition"]["settings"]["model"]["max_output_tokens"] =
        json!(32);
    source["modules"].as_array_mut().unwrap().extend([
        json!({"reference":r("hook-tool"),"factory":"tool.http_connected","config":{"contract":{"name":"after_effect"},"path":"after","method":"POST"},"dependencies":{"connection":r("service")}}),
        json!({"reference":r("hook-handler"),"factory":"hook.executor","config":{"tool":"after_effect"},"dependencies":{"executor":r("hook-tool")}}),
        json!({"reference":r("after-effect"),"factory":"hook.subscription","config":{"event":"after_tool"},"dependencies":{"handler":r("hook-handler")}}),
    ]);
    source["programs"]["execute"]["definition"]["hooks"] = json!([r("after-effect")]);
    source
}
async fn service_count(url: &str) -> Value {
    reqwest::Client::new()
        .get(format!("{url}/count"))
        .send()
        .await
        .unwrap()
        .json()
        .await
        .unwrap()
}
async fn await_count(url: &str, key: &str, expected: usize) {
    tokio::time::timeout(Duration::from_secs(10), async {
        loop {
            if service_count(url).await[key] == expected {
                break;
            }
            tokio::time::sleep(Duration::from_millis(10)).await;
        }
    })
    .await
    .unwrap();
}
async fn release(url: &str, route: &str) {
    assert!(
        reqwest::Client::new()
            .post(format!("{url}/{route}"))
            .send()
            .await
            .unwrap()
            .status()
            .is_success()
    );
}

#[tokio::test]
async fn parked_host_process() {
    let Ok(directory) = std::env::var("NOFY_PARK_STATE") else {
        return;
    };
    let url = std::env::var("NOFY_PARK_SERVICE").unwrap();
    let unmetered = std::env::var("NOFY_PARK_UNMETERED").unwrap() == "yes";
    let host = host(
        std::path::Path::new(&directory),
        Arc::new(AtomicUsize::new(0)),
    )
    .await;
    let document = source(&url, unmetered);
    let registry = host
        .control()
        .prepare(serde_json::from_value(document.clone()).unwrap())
        .unwrap()
        .registry()
        .clone();
    let server = serve(host.router()).await;
    let publication = post(&server, "/api/v1/import", document).await;
    post(&server, "/api/v1/runs", json!({"run_id":"root","thread_id":"thread","system":"model-evidence","release":publication["bundle"]["digest"],"program":"execute","input":{"text":"continue","attachments":[]}})).await;
    let supervisor = nofy_agent_runtime::supervisor::RunSupervisor::new(host.store().clone())
        .with_lease_ttl(Duration::from_secs(2))
        .unwrap();
    tokio::spawn(async move {
        supervisor
            .execute_submitted(&registry, "root")
            .await
            .unwrap()
    });
    await_count(&url, "models", 1).await;
    let command = json!({"command_id":"park","run_id":"root","command":{"kind":"park"}});
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
    assert_eq!(
        post(&server, "/api/v1/actions", command.clone()).await["finished"],
        false
    );
    assert_eq!(
        post(&server, "/api/v1/actions", command).await["finished"],
        false
    );
    release(&url, "release-model").await;
    await_count(&url, "hooks", 1).await;
    let pending = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/runs/root",
        VIEW,
        Value::Null,
    )
    .await
    .1;
    assert_eq!(pending["parking"]["status"], "requested");
    assert_eq!(service_count(&url).await["models"], 1);
    release(&url, "release-hook").await;
    let receipt = action_result(&server, "park").await;
    assert!(receipt["error"].is_null(), "{receipt}");
    assert_eq!(receipt["outcome"]["Paused"]["reason"]["kind"], "parked");
    // Exit without draining the serving host or the original execution task.
    std::process::exit(98);
}

#[tokio::test]
async fn actual_host_exit_preserves_parked_model_tool_hook_state_and_budget_until_explicit_release()
{
    for unmetered in [false, true] {
        let models = Arc::new(AtomicUsize::new(0));
        let tools = Arc::new(AtomicUsize::new(0));
        let hooks = Arc::new(AtomicUsize::new(0));
        let model_gate = CancellationToken::new();
        let hook_gate = CancellationToken::new();
        let count = models.clone();
        let effects = tools.clone();
        let after = hooks.clone();
        let counts = (models.clone(), tools.clone(), hooks.clone());
        let provider_gate = model_gate.clone();
        let after_gate = hook_gate.clone();
        let release_model = model_gate.clone();
        let release_hook = hook_gate.clone();
        let provider=serve(Router::new()
            .route("/v1/chat/completions",route_post(move |Json(body):Json<Value>| {
                let count=count.clone();let gate=provider_gate.clone();
                async move {
                    count.fetch_add(1,Ordering::SeqCst);
                    let frames=if body["messages"].as_array().unwrap().iter().any(|m| m["role"]=="tool") {
                        nofy_test_support::sse::chat_completion_events_exact("settled","test-model")
                    } else {
                        gate.cancelled().await;
                        nofy_test_support::sse::chat_completions_reasoning_then_tool_call_events("","one-effect","effect","{}","test-model")
                            .into_iter().map(|frame| axum::response::sse::Event::default().data(frame.data)).collect()
                    };
                    Sse::new(futures::stream::iter(frames.into_iter().map(Ok::<_,Infallible>)))
                }
            }))
            .route("/done",route_post(move || {let effects=effects.clone();async move {effects.fetch_add(1,Ordering::SeqCst);Json(json!({"done":true}))}}))
            .route("/after",route_post(move || {let after=after.clone();let gate=after_gate.clone();async move {after.fetch_add(1,Ordering::SeqCst);gate.cancelled().await;Json(json!({"decision":"continue"}))}}))
            .route("/count",axum::routing::get(move || {let counts=counts.clone();async move {Json(json!({"models":counts.0.load(Ordering::SeqCst),"tools":counts.1.load(Ordering::SeqCst),"hooks":counts.2.load(Ordering::SeqCst)}))}}))
            .route("/release-model",route_post(move || {let gate=release_model.clone();async move {gate.cancel();Json(json!({"released":true}))}}))
            .route("/release-hook",route_post(move || {let gate=release_hook.clone();async move {gate.cancel();Json(json!({"released":true}))}}))
        ).await;
        let directory = tempfile::tempdir().unwrap();
        let path = directory.path().to_owned();
        let url = provider.url.clone();
        let output = tokio::task::spawn_blocking(move || {
            std::process::Command::new(std::env::current_exe().unwrap())
                .args(["--exact", "parking::parked_host_process", "--nocapture"])
                .env("NOFY_PARK_STATE", path)
                .env("NOFY_PARK_SERVICE", url)
                .env("NOFY_PARK_UNMETERED", if unmetered { "yes" } else { "no" })
                .output()
                .unwrap()
        })
        .await
        .unwrap();
        assert_eq!(
            output.status.code(),
            Some(98),
            "{}\n{}",
            String::from_utf8_lossy(&output.stdout),
            String::from_utf8_lossy(&output.stderr)
        );
        assert_eq!(
            service_count(&provider.url).await,
            json!({"models":1,"tools":1,"hooks":1})
        );
        tokio::time::sleep(Duration::from_millis(2100)).await;
        let host = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
        let scope = if unmetered {
            None
        } else {
            let prepared = host
                .control()
                .prepare(serde_json::from_value(source(&provider.url, false)).unwrap())
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
        };
        let budget = if let Some(scope) = &scope {
            Some(content_digest(&host.store().inspect(scope).await.unwrap()).unwrap())
        } else {
            None
        };
        let before =
            content_digest(&host.store().load("13:sampled-agentthread").await.unwrap()).unwrap();
        let original = content_digest(
            &host
                .store()
                .execution_job("root")
                .await
                .unwrap()
                .unwrap()
                .submission,
        )
        .unwrap();
        let server = serve(host.router()).await;
        let stop = CancellationToken::new();
        let worker_stop = stop.clone();
        let worker_host = host.clone();
        let worker =
            tokio::spawn(async move { worker_host.run_worker(worker_stop, 2).await.unwrap() });
        post(
            &server,
            "/api/v1/actions",
            json!({"command_id":"blocked","run_id":"root","command":{"kind":"resume"}}),
        )
        .await;
        assert!(
            action_result(&server, "blocked").await["error"]
                .as_str()
                .unwrap()
                .contains("parked")
        );
        let state = outcome(&server, "root").await;
        assert_eq!(state["parking"]["status"], "parked");
        assert_eq!(
            content_digest(&host.store().load("13:sampled-agentthread").await.unwrap()).unwrap(),
            before
        );
        post(&server,"/api/v1/actions",json!({"command_id":"unpark","run_id":"root","command":{"kind":"unpark","park_command_id":"park"}})).await;
        assert!(action_result(&server, "unpark").await["error"].is_null());
        assert_eq!(
            content_digest(&host.store().load("13:sampled-agentthread").await.unwrap()).unwrap(),
            before
        );
        if let Some(scope) = &scope {
            assert_eq!(
                Some(content_digest(&host.store().inspect(scope).await.unwrap()).unwrap()),
                budget
            );
        }
        assert_eq!(
            service_count(&provider.url).await,
            json!({"models":1,"tools":1,"hooks":1})
        );
        post(
            &server,
            "/api/v1/actions",
            json!({"command_id":"resume","run_id":"root","command":{"kind":"resume"}}),
        )
        .await;
        let completed = action_result(&server, "resume").await;
        assert!(completed["error"].is_null(), "{completed}");
        assert_eq!(completed["outcome"]["Completed"]["output"], "settled");
        assert_eq!(
            service_count(&provider.url).await,
            json!({"models":2,"tools":1,"hooks":1})
        );
        assert_eq!(
            content_digest(
                &host
                    .store()
                    .execution_job("root")
                    .await
                    .unwrap()
                    .unwrap()
                    .submission
            )
            .unwrap(),
            original
        );
        stop.cancel();
        worker.await.unwrap();
    }
}
