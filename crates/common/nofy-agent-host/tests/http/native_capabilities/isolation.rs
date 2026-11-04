#![cfg(target_os = "linux")]
use super::*;
use nofy_agent_runtime::{
    RunContext,
    registry::{ModuleInstance, ModuleRef},
};
const BUSY: &str = "{{ (range(100000) * 100000) | sum }}";

fn body(template: &str) -> Value {
    let mut body = preview_body();
    body["document"]["fragments"] = json!([{"id":"isolated","content":{"kind":"template","text":template},"source":{"kind":"test","reference":"isolation","version":"1"}}]);
    body
}
fn pids(directory: &std::path::Path) -> Vec<u32> {
    pids_for(std::process::id(), directory)
}
fn pids_for(parent: u32, directory: &std::path::Path) -> Vec<u32> {
    let mut pids = std::collections::BTreeSet::new();
    let Ok(tasks) = std::fs::read_dir(format!("/proc/{parent}/task")) else {
        return vec![];
    };
    for task in tasks.flatten() {
        let Ok(children) = std::fs::read_to_string(task.path().join("children")) else {
            continue;
        };
        for child in children
            .split_whitespace()
            .filter_map(|id| id.parse::<u32>().ok())
        {
            let Ok(command) = std::fs::read(format!("/proc/{child}/cmdline")) else {
                continue;
            };
            let command = String::from_utf8_lossy(&command);
            if command.contains("--render-prompt") && command.contains(directory.to_str().unwrap())
            {
                pids.insert(child);
            }
        }
    }
    pids.into_iter().collect()
}
async fn started(host: &KernelHost, directory: &std::path::Path, count: usize) -> Vec<u32> {
    tokio::time::timeout(Duration::from_secs(10), async {
        loop {
            let children = pids(directory);
            if children.len() == count && host.loader().prompt_status().in_flight == count {
                return children;
            }
            tokio::time::sleep(Duration::from_millis(5)).await;
        }
    })
    .await
    .unwrap()
}
async fn idle(host: &KernelHost) {
    tokio::time::timeout(Duration::from_secs(6), async {
        while host.loader().prompt_status().in_flight != 0 {
            tokio::time::sleep(Duration::from_millis(5)).await;
        }
    })
    .await
    .unwrap();
}
#[tokio::test]
async fn missing_helper_fails_closed_and_status_is_lightweight_metadata() {
    let dir = tempfile::tempdir().unwrap();
    let host = super::super::unbound_host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let (status, metadata) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/prompts/status",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200);
    assert_eq!(metadata["helper_bound"], false);
    assert_eq!(metadata["started"], 0);
    assert!(!metadata.to_string().contains(dir.path().to_str().unwrap()));
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/prompts/preview",
            VIEW,
            preview_body()
        )
        .await
        .0,
        503
    );
    assert_eq!(host.loader().prompt_status().started, 0);
    assert_eq!(host.loader().prompt_status().in_flight, 0);
}
#[tokio::test]
async fn constant_folding_and_intermediate_memory_cpu_and_output_limits_never_kill_the_host() {
    let dir = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let host = resident(dir.path(), reads.clone()).await;
    let server = serve(host.router()).await;
    let mut system = source();
    config(&mut system, "prompt")["fragments"] =
        body("{{ 'x' * 1099511627776 }}")["document"]["fragments"].clone();
    let before = host.loader().prompt_status().started;
    post(&server, "/api/v1/validate", system).await;
    assert_eq!(
        host.loader().prompt_status().started,
        before,
        "pure validation must not start a process"
    );
    for template in [
        "{{ 'x' * 1099511627776 }}",
        "{{ team * 1099511627776 }}",
        "{% set huge %}{{ team * 1099511627776 }}{% endset %}{{ huge[:1] }}",
        BUSY,
    ] {
        let (status, value) = request(
            &server,
            reqwest::Method::POST,
            "/api/v1/prompts/preview",
            VIEW,
            body(template),
        )
        .await;
        assert_eq!(status, 503, "{template}: {value}");
        assert!(pids(dir.path()).is_empty());
        assert_eq!(host.loader().prompt_status().in_flight, 0);
        assert_eq!(
            request(
                &server,
                reqwest::Method::GET,
                "/api/v1/modules",
                VIEW,
                Value::Null
            )
            .await
            .0,
            200
        );
    }
    for template in [
        "{{ env.NOFY_SECRET_MODEL_TOKEN }}",
        "{% include '/etc/passwd' %}",
        "{% for i in range(65) %}{{ team }}{% endfor %}",
    ] {
        let mut oversized = body(template);
        if template.contains("range") {
            oversized["variables"] = json!({"team":"é".repeat(8192)});
        }
        assert_eq!(
            request(
                &server,
                reqwest::Method::POST,
                "/api/v1/prompts/preview",
                VIEW,
                oversized
            )
            .await
            .0,
            422
        );
    }
    let mut complex = body("{% set x %}{{ team * 2 }}{% endset %}{{ x[:3] }} {{ range(5)|sum }}");
    complex["variables"] = json!({"team":"proof"});
    assert_eq!(
        post(&server, "/api/v1/prompts/preview", complex).await["text"],
        "pro 10"
    );
    let mut too_complex = body(&"{{ team }}".repeat(1500));
    too_complex["document"]["values"]["team"] = json!("short");
    let before = host.loader().prompt_status().started;
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/prompts/preview",
            VIEW,
            too_complex
        )
        .await
        .0,
        422
    );
    assert_eq!(host.loader().prompt_status().started, before);
    assert_eq!(reads.load(Ordering::SeqCst), 0);
}
#[tokio::test]
async fn dropped_prompt_caller_keeps_its_actual_worker_permit_and_context_cancel_reaps_the_pid() {
    let dir = tempfile::tempdir().unwrap();
    let host = resident(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let mut source = source();
    config(&mut source, "prompt")["fragments"] = body(BUSY)["document"]["fragments"].clone();
    let system = host
        .control()
        .prepare(serde_json::from_value(source).unwrap())
        .unwrap();
    let resolved = system
        .registry()
        .resolve(&[ModuleRef::new("prompt", "1")])
        .unwrap();
    let ModuleInstance::Prompt(prompt) = &resolved.instances[&ModuleRef::new("prompt", "1")] else {
        panic!("prompt")
    };
    let prompt = prompt.clone();
    let context = RunContext::new("render-thread", "render-run");
    let cancel = context.cancel.clone();
    let caller = tokio::spawn(async move { prompt.render(&context, &[]).await });
    let children = started(&host, dir.path(), 1).await;
    caller.abort();
    assert!(caller.await.unwrap_err().is_cancelled());
    assert_eq!(host.loader().prompt_status().in_flight, 1);
    cancel.cancel();
    idle(&host).await;
    assert!(
        children
            .iter()
            .all(|pid| !std::path::Path::new(&format!("/proc/{pid}")).exists())
    );
    let server = serve(host.router()).await;
    assert_eq!(
        post(&server, "/api/v1/prompts/preview", preview_body()).await["text"],
        "Help support. Tools: skill\n\nKeep {{ literal }} exactly."
    );
}
#[tokio::test]
async fn disconnected_previews_hold_management_admission_until_shutdown_reaps_both_real_workers() {
    let dir = tempfile::tempdir().unwrap();
    let host = resident(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let stop = CancellationToken::new();
    let worker_host = host.clone();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 1).await.unwrap() });
    let spawn = || {
        let url = server.url.clone();
        tokio::spawn(async move {
            reqwest::Client::new()
                .post(format!("{url}/api/v1/prompts/preview"))
                .bearer_auth(VIEW)
                .json(&body(BUSY))
                .send()
                .await
        })
    };
    let left = spawn();
    let right = spawn();
    let children = started(&host, dir.path(), 2).await;
    left.abort();
    right.abort();
    let _ = left.await;
    let _ = right.await;
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/prompts/status",
            VIEW,
            Value::Null
        )
        .await
        .0,
        200
    );
    let url = server.url.clone();
    let mut pending = tokio::spawn(async move {
        reqwest::Client::new()
            .post(format!("{url}/api/v1/prompts/preview"))
            .bearer_auth(VIEW)
            .header("content-type", "application/json")
            .body("{")
            .send()
            .await
            .unwrap()
    });
    assert!(
        tokio::time::timeout(Duration::from_millis(50), &mut pending)
            .await
            .is_err()
    );
    stop.cancel();
    tokio::time::timeout(Duration::from_secs(6), worker)
        .await
        .unwrap()
        .unwrap();
    assert_eq!(pending.await.unwrap().status(), 503);
    assert_eq!(host.loader().prompt_status().in_flight, 0);
    assert!(
        children
            .iter()
            .all(|pid| !std::path::Path::new(&format!("/proc/{pid}")).exists())
    );
}
#[tokio::test]
async fn resource_maintenance_fences_do_not_block_existing_document_prompt_rendering() {
    let dir = tempfile::tempdir().unwrap();
    let host = resident(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let commit = host.loader().commits.exclusive().unwrap();
    let usage = std::fs::OpenOptions::new()
        .read(true)
        .write(true)
        .open(dir.path().join("loader/lifecycle/lease.lock"))
        .unwrap();
    fs2::FileExt::try_lock_exclusive(&usage).unwrap();
    let server = serve(host.router()).await;
    assert_eq!(
        post(&server, "/api/v1/prompts/preview", preview_body()).await["text"],
        "Help support. Tools: skill\n\nKeep {{ literal }} exactly."
    );
    drop((commit, usage));
}

#[tokio::test]
async fn actual_model_root_compiles_and_renders_only_in_confinement_before_credentials_or_dispatch()
{
    let requests = Arc::new(Mutex::new(Vec::<Value>::new()));
    let provider = serve(
        Router::new()
            .route("/v1/chat/completions", post_handler())
            .with_state(requests.clone()),
    )
    .await;
    let dir = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let host = resident(dir.path(), reads.clone()).await;
    let server = serve(host.router()).await;
    let mut source = source();
    let baseline = serde_json::to_value(document(&provider.url)).unwrap();
    source["modules"].as_array_mut().unwrap().extend(
        baseline["modules"]
            .as_array()
            .unwrap()
            .iter()
            .filter(|module| module["reference"]["id"] != "prompt")
            .cloned(),
    );
    source["programs"]["chat"] = json!({"kind":"agent","definition":{"name":"isolated-root","model":{"id":"model","version":"1"},"prompt":{"id":"prompt","version":"1"}}});
    config(&mut source, "prompt")["fragments"] =
        body("{{ 'x' * 1099511627776 }}")["document"]["fragments"].clone();
    let bad = post(&server, "/api/v1/import", source.clone()).await;
    assert_eq!(host.loader().prompt_status().started, 0);
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker_host = host.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 1).await.unwrap() });
    post(
        &server,
        "/api/v1/runs",
        launch(
            bad["bundle"]["digest"].as_str().unwrap(),
            "isolated-bad",
            "chat",
        ),
    )
    .await;
    let failed = outcome(&server, "isolated-bad").await;
    assert_eq!(failed["execution"]["status"], "failed", "{failed}");
    assert!(requests.lock().unwrap().is_empty());
    assert_eq!(reads.load(Ordering::SeqCst), 0);
    assert_eq!(host.loader().prompt_status().started, 1);
    config(&mut source, "prompt")["fragments"] =
        body("normal after isolated failure")["document"]["fragments"].clone();
    let good = post(&server, "/api/v1/import", source).await;
    post(
        &server,
        "/api/v1/runs",
        launch(
            good["bundle"]["digest"].as_str().unwrap(),
            "isolated-good",
            "chat",
        ),
    )
    .await;
    assert_eq!(
        outcome(&server, "isolated-good").await["execution"]["status"],
        "completed"
    );
    assert_eq!(requests.lock().unwrap().len(), 1);
    assert_eq!(reads.load(Ordering::SeqCst), 1);
    stop.cancel();
    worker.await.unwrap();
}

#[tokio::test]
async fn hard_parent_exit_stops_the_real_confined_renderer_and_restart_has_no_stale_work() {
    let dir = tempfile::tempdir().unwrap();
    let source = dir.path().join("native.json");
    tokio::fs::write(
        &source,
        include_bytes!("../../../examples/native-system.json"),
    )
    .await
    .unwrap();
    let (server, mut parent) = super::super::process::binary(dir.path(), &source).await;
    let parent_pid = parent.id().unwrap();
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/prompts/status",
            ADMIN,
            Value::Null
        )
        .await
        .0,
        200
    );
    let url = server.url.clone();
    let call = tokio::spawn(async move {
        reqwest::Client::new()
            .post(format!("{url}/api/v1/prompts/preview"))
            .bearer_auth(ADMIN)
            .json(&body(BUSY))
            .send()
            .await
    });
    let children = tokio::time::timeout(Duration::from_secs(10), async {
        loop {
            let children = pids_for(parent_pid, dir.path());
            if !children.is_empty() {
                break children;
            }
            tokio::time::sleep(Duration::from_millis(5)).await;
        }
    })
    .await
    .unwrap();
    parent.kill().await.unwrap();
    parent.wait().await.unwrap();
    let _ = call.await;
    drop(server);
    tokio::time::timeout(Duration::from_secs(5), async {
        loop {
            let alive = children.iter().any(|pid| {
                std::fs::read_to_string(format!("/proc/{pid}/stat"))
                    .ok()
                    .and_then(|stat| {
                        stat.rsplit_once(") ")
                            .map(|(_, rest)| !rest.starts_with('Z') && !rest.starts_with('X'))
                    })
                    .unwrap_or(false)
            });
            if !alive {
                break;
            }
            tokio::time::sleep(Duration::from_millis(10)).await;
        }
    })
    .await
    .unwrap();
    // A dead parent cannot wait on a child; an adopted zombie is not a live
    // renderer. Normal cancellation/shutdown tests separately prove reaping.
    let (server, mut parent) = super::super::process::binary(dir.path(), &source).await;
    let (_, status) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/prompts/status",
        ADMIN,
        Value::Null,
    )
    .await;
    assert_eq!(status["in_flight"], 0);
    assert_eq!(status["started"], 0);
    assert_eq!(
        post(&server, "/api/v1/prompts/preview", preview_body()).await["tools"],
        json!(["skill"])
    );
    parent.kill().await.unwrap();
    parent.wait().await.unwrap();
}
