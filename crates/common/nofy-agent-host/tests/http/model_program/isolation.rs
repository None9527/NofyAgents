use super::*;
use nofy_agent_models::{
    declarative::{Protocol, ProtocolLimits},
    execution::Executor,
};
use nofy_agent_runtime::{
    Error, RunContext,
    registry::{ModuleInstance, ModuleRef},
};
use std::{
    os::fd::{AsRawFd, FromRawFd, OwnedFd},
    time::Instant,
};

fn program(source: impl Into<String>) -> Arc<Protocol> {
    Arc::new(Protocol {
        source: source.into(),
        capabilities: Default::default(),
        limits: ProtocolLimits {
            max_operations: 100_000_000,
            max_step_operations: 10_000_000,
            step_timeout_ms: 10_000,
            ..Default::default()
        },
    })
}
pub(super) fn pidfd(pid: u32) -> OwnedFd {
    // SAFETY: Linux returns a new owned descriptor, checked before wrapping.
    let descriptor = unsafe { libc::syscall(libc::SYS_pidfd_open, pid, 0) };
    assert!(descriptor >= 0, "{}", std::io::Error::last_os_error());
    unsafe { OwnedFd::from_raw_fd(descriptor as i32) }
}
pub(super) fn dead(fd: &OwnedFd) -> bool {
    let mut poll = libc::pollfd {
        fd: fd.as_raw_fd(),
        events: libc::POLLIN,
        revents: 0,
    };
    // SAFETY: the array is valid and the pidfd remains owned throughout poll.
    assert!(unsafe { libc::poll(&mut poll, 1, 0) } >= 0);
    poll.revents & libc::POLLIN != 0
}
pub(super) fn signal(fd: &OwnedFd, signal: i32) {
    // SAFETY: the owned pidfd identifies this exact test child, even if its PID
    // exits concurrently. No process-name search or recycled PID is signalled.
    assert_eq!(
        unsafe {
            libc::syscall(
                libc::SYS_pidfd_send_signal,
                fd.as_raw_fd(),
                signal,
                std::ptr::null::<libc::siginfo_t>(),
                0,
            )
        },
        0
    );
}
pub(super) async fn until(mut ready: impl FnMut() -> bool) {
    tokio::time::timeout(Duration::from_secs(10), async {
        while !ready() {
            tokio::time::sleep(Duration::from_millis(5)).await;
        }
    })
    .await
    .unwrap();
}
async fn step(
    loader: &nofy_agent_host::loader::Loader,
    source: Arc<Protocol>,
    input: Value,
    spent: u64,
) -> nofy_agent_models::execution::Evaluation {
    loader
        .evaluate(
            source,
            input,
            spent,
            4 * 1024 * 1024,
            CancellationToken::new(),
        )
        .await
        .unwrap()
}

#[tokio::test]
async fn all_evaluator_phases_are_lossless_and_worker_recreation_keeps_explicit_operation_progress()
{
    let dir = tempfile::tempdir().unwrap();
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let loader = host.loader().clone();
    let source = program("#{phase:args.phase,value:args.value}");
    let value = json!({"unsigned":u64::MAX,"signed":i64::MIN,"exact":9007199254740993u64});
    let mut spent = 0;
    for phase in [
        "admit",
        "history",
        "request",
        "event",
        "finish",
        "http_error",
    ] {
        let reply = step(
            &loader,
            source.clone(),
            json!({"phase":phase,"value":value}),
            spent,
        )
        .await;
        assert_eq!(reply.value, json!({"phase":phase,"value":value}));
        assert!(reply.spent > spent);
        spent = reply.spent;
    }
    let error = loader.evaluate(
        program("fail(#{category:\"explicit\",message:\"rejected\",retryable:false,code:\"typed\",details:args.value})"),
        json!({"value":value}), 0, 4096, CancellationToken::new(),
    ).await.err().unwrap();
    let Error::ModelFailure(error) = error else {
        panic!("typed worker failure lost");
    };
    assert_eq!(error.code.as_deref(), Some("typed"));
    assert_eq!(error.details, value);
    let status = loader.model_status();
    assert_eq!(
        (status.started, status.worker_pids.len(), status.in_flight),
        (1, 1, 0)
    );
    let pid = status.worker_pids[0];
    let fd = pidfd(pid);
    let metadata = std::fs::read_to_string(format!("/proc/{pid}/status")).unwrap();
    assert!(metadata.contains("NoNewPrivs:\t1"));
    assert!(metadata.contains("Seccomp:\t2"));
    assert!(metadata.contains("CapEff:\t0000000000000000"));
    assert!(
        std::fs::read(format!("/proc/{pid}/environ"))
            .unwrap()
            .is_empty()
    );
    let limits = std::fs::read_to_string(format!("/proc/{pid}/limits")).unwrap();
    assert!(
        limits
            .lines()
            .any(|line| line.starts_with("Max address space") && line.contains("536870912"))
    );
    for n in 0..10 {
        let other = program(format!("#{{revision:{n},value:args.value}}"));
        assert_eq!(
            step(&loader, other, json!({"value":n}), 0).await.value["revision"],
            n
        );
    }
    let reply = step(
        &loader,
        source.clone(),
        json!({"phase":"after-eviction","value":value}),
        spent,
    )
    .await;
    assert!(reply.spent > spent);
    spent = reply.spent;
    signal(&fd, libc::SIGKILL);
    until(|| dead(&fd)).await;
    let reply = step(
        &loader,
        source,
        json!({"phase":"after-recreation","value":value}),
        spent,
    )
    .await;
    assert!(reply.spent > spent);
    assert_eq!(reply.value["value"], value);
    assert_eq!(loader.model_status().started, 2);
    let last = pidfd(loader.model_status().worker_pids[0]);
    host.shutdown();
    until(|| dead(&last) && loader.model_status().worker_pids.is_empty()).await;
    assert!(!loader.model_status().cleanup_failed);
}

fn model_document(base_url: &str) -> Value {
    let r = |id: &str| json!({"id":id,"version":"1"});
    json!({"schema_version":1,"name":"isolated-model","modules":[
        {"reference":r("protocol"),"factory":"resource.model_protocol","config":{"source":{"kind":"inline","text":SOURCE},"capabilities":{}}},
        {"reference":r("connection"),"factory":"resource.model_connection","config":{"base_url":base_url,"allow_insecure_http":true,"models":["test-model"],"max_concurrency":4}},
        {"reference":r("model"),"factory":"model.programmed","config":{"model":"test-model"},"dependencies":{"protocol":r("protocol"),"connection":r("connection")}},
        {"reference":r("prompt"),"factory":"prompt.static","config":{"text":"test"}}
    ],"programs":{"chat":{"kind":"agent","definition":{"name":"chat","model":r("model"),"prompt":r("prompt")}}}})
}

#[tokio::test]
async fn model_status_is_read_only_metadata_without_work_or_private_configuration() {
    let dir = tempfile::tempdir().unwrap();
    let execute = "e".repeat(40);
    let reads = Arc::new(AtomicUsize::new(0));
    let auth = Authorizer::new(vec![
        (VIEW.into(), [Scope::Read].into()),
        (execute.clone(), [Scope::Execute].into()),
    ])
    .unwrap();
    let kernel = KernelHost::open(
        dir.path(),
        native::registry(Arc::new(Credentials(reads.clone()))).unwrap(),
        auth,
    )
    .await
    .unwrap();
    let server = serve(kernel.router()).await;
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/models/status",
            &execute,
            Value::Null
        )
        .await
        .0,
        403
    );
    let (status, metadata) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/models/status",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200);
    assert_eq!(metadata["protocol"], nofy_agent_models::worker::PROTOCOL);
    assert_eq!(metadata["slots"], 2);
    assert_eq!(metadata["started"], 0);
    assert_eq!(metadata["in_flight"], 0);
    assert_eq!(metadata["worker_pids"], json!([]));
    assert_eq!(metadata["helper_bound"], false);
    assert_eq!(reads.load(Ordering::SeqCst), 0);
    assert!(!metadata.to_string().contains(dir.path().to_str().unwrap()));
    assert!(metadata.get("source").is_none());
}

#[tokio::test]
async fn missing_model_helper_never_falls_back_and_history_and_admission_use_the_bound_executor() {
    let dir = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let kernel = unbound_host(dir.path(), reads.clone()).await;
    let document = model_document("http://127.0.0.1:9/");
    let prepared = kernel
        .control()
        .prepare(serde_json::from_value(document.clone()).unwrap())
        .unwrap();
    let digest = prepared.bundle.digest.clone();
    let resolved = prepared
        .registry()
        .resolve(&[ModuleRef::new("model", "1")])
        .unwrap();
    let ModuleInstance::Model(model) = &resolved.instances[&ModuleRef::new("model", "1")] else {
        panic!("model");
    };
    let request = nofy_agent_runtime::ModelRequest {
        messages: vec![],
        tools: vec![],
        settings: json!({}),
    };
    assert!(
        model
            .request_bound(&request, &RunContext::default())
            .await
            .is_err()
    );
    assert!(model.validate_live_history(&[]).await.is_err());
    assert_eq!(kernel.loader().model_status().started, 0);
    let kernel = kernel
        .with_loader_helper(std::path::Path::new(env!("CARGO_BIN_EXE_nofy-agent-host")))
        .unwrap();
    let rebound = kernel
        .control()
        .prepare(serde_json::from_value(document).unwrap())
        .unwrap();
    assert_eq!(rebound.bundle.digest, digest);
    assert_eq!(
        model
            .request_bound(&request, &RunContext::default())
            .await
            .unwrap()
            .max_calls,
        1
    );
    model.validate_live_history(&[]).await.unwrap();
    assert_eq!(kernel.loader().model_status().started, 1);
    assert_eq!(reads.load(Ordering::SeqCst), 0);
    let loader = kernel.loader().clone();
    let fd = pidfd(loader.model_status().worker_pids[0]);
    kernel.shutdown();
    until(|| dead(&fd) && loader.model_status().worker_pids.is_empty()).await;
}

#[tokio::test]
async fn dropped_cancelled_queued_and_stopped_calls_reap_real_workers_before_reuse() {
    let dir = tempfile::tempdir().unwrap();
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let loader = host.loader().clone();
    step(&loader, program("args.value"), json!({"value":1}), 0).await;
    let first_pid = loader.model_status().worker_pids[0];
    let first_fd = pidfd(first_pid);
    signal(&first_fd, libc::SIGSTOP);
    let first = {
        let loader = loader.clone();
        tokio::spawn(async move {
            loader
                .evaluate(
                    program("loop {}"),
                    json!({}),
                    0,
                    1024,
                    CancellationToken::new(),
                )
                .await
        })
    };
    until(|| loader.model_status().in_flight == 1).await;
    let cancel = CancellationToken::new();
    let second = {
        let loader = loader.clone();
        let cancel = cancel.clone();
        tokio::spawn(async move {
            loader
                .evaluate(program("loop {}"), json!({}), 0, 1024, cancel)
                .await
        })
    };
    until(|| loader.model_status().worker_pids.len() == 2 && loader.model_status().in_flight == 2)
        .await;
    let second_pid = *loader
        .model_status()
        .worker_pids
        .iter()
        .find(|pid| **pid != first_pid)
        .unwrap();
    let second_fd = pidfd(second_pid);
    signal(&second_fd, libc::SIGSTOP);
    let queued = CancellationToken::new();
    let third = {
        let loader = loader.clone();
        let cancel = queued.clone();
        tokio::spawn(async move {
            loader
                .evaluate(program("true"), json!({}), 0, 1024, cancel)
                .await
        })
    };
    queued.cancel();
    assert!(matches!(third.await.unwrap(), Err(Error::Cancelled)));
    assert_eq!(loader.model_status().started, 2);
    first.abort();
    assert!(matches!(first.await, Err(error) if error.is_cancelled()));
    until(|| loader.model_status().in_flight < 2).await;
    assert!(dead(&first_fd));
    cancel.cancel();
    assert!(matches!(second.await.unwrap(), Err(Error::Cancelled)));
    assert!(dead(&second_fd));
    assert_eq!(loader.model_status().in_flight, 0);
    assert!(loader.model_status().worker_pids.is_empty());
    assert_eq!(
        step(&loader, program("args.value + 1"), json!({"value":41}), 0)
            .await
            .value,
        42
    );
    let fd = pidfd(loader.model_status().worker_pids[0]);
    host.shutdown();
    until(|| dead(&fd) && loader.model_status().worker_pids.is_empty()).await;
    assert!(matches!(
        loader
            .evaluate(
                program("true"),
                json!({}),
                0,
                1024,
                CancellationToken::new()
            )
            .await,
        Err(Error::Cancelled)
    ));
}

#[tokio::test]
async fn intermediate_allocation_exhausts_only_the_confined_worker_and_host_remains_usable() {
    let dir = tempfile::tempdir().unwrap();
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let loader = host.loader().clone();
    let server = serve(host.router()).await;
    step(&loader, program("true"), json!({}), 0).await;
    let fd = pidfd(loader.model_status().worker_pids[0]);
    // Each binding remains below 16MiB and the variable count below 256, but
    // their aggregate is not bounded by a serialized input/output limit.
    let mut source = "let seed = \"x\"; for n in 0..23 { seed += seed; }\n".to_string();
    for n in 0..64 {
        source.push_str(&format!("let v{n} = seed + \"{n}\";\n"));
    }
    source.push_str("true");
    let mut stress = (*program(source)).clone();
    stress.limits.max_state_bytes = 16 * 1024 * 1024;
    stress.validate().unwrap();
    let running = {
        let loader = loader.clone();
        tokio::spawn(async move {
            loader
                .evaluate(
                    Arc::new(stress),
                    json!({}),
                    0,
                    1024,
                    CancellationToken::new(),
                )
                .await
        })
    };
    until(|| loader.model_status().in_flight == 1).await;
    let start = Instant::now();
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
    assert!(start.elapsed() < Duration::from_secs(2));
    assert!(
        tokio::time::timeout(Duration::from_secs(15), running)
            .await
            .unwrap()
            .unwrap()
            .is_err()
    );
    assert!(dead(&fd));
    assert_eq!(loader.model_status().in_flight, 0);
    assert!(loader.model_status().worker_pids.is_empty());
    assert_eq!(
        step(
            &loader,
            program("args.value"),
            json!({"value":"after-memory-fault"}),
            0
        )
        .await
        .value,
        "after-memory-fault"
    );
    let fd = pidfd(loader.model_status().worker_pids[0]);
    host.shutdown();
    until(|| dead(&fd) && loader.model_status().worker_pids.is_empty()).await;
}

#[tokio::test]
async fn waiting_provider_calls_do_not_hold_evaluator_slots_or_block_a_third_model() {
    let waiting = CancellationToken::new();
    let entered = Arc::new(AtomicUsize::new(0));
    let gate = waiting.clone();
    let count = entered.clone();
    let provider = serve(Router::new().route("/invoke", route_post(move |Json(body): Json<Value>| {
        let gate = gate.clone(); let count = count.clone();
        async move {
            let text = body["messages"].as_array().unwrap().last().unwrap()["content"].as_str().unwrap().to_string();
            if text == "wait" {
                count.fetch_add(1, Ordering::SeqCst);
                gate.cancelled().await;
            }
            Json(json!({"messages":[],"tool_calls":[],"output":text,"input_tokens":1,"output_tokens":1,"info":{"provider":{}}}))
        }
    }))).await;
    let dir = tempfile::tempdir().unwrap();
    let kernel = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let prepared = kernel
        .control()
        .prepare(serde_json::from_value(model_document(&format!("{}/", provider.url))).unwrap())
        .unwrap();
    let resolved = prepared
        .registry()
        .resolve(&[ModuleRef::new("model", "1")])
        .unwrap();
    let ModuleInstance::Model(model) = &resolved.instances[&ModuleRef::new("model", "1")] else {
        panic!("model");
    };
    let request = |text: &str| nofy_agent_runtime::ModelRequest {
        messages: vec![nofy_agent_runtime::Message::User {
            content: text.into(),
        }],
        tools: vec![],
        settings: json!({}),
    };
    let mut blocked = Vec::new();
    for _ in 0..2 {
        let model = model.clone();
        let request = request("wait");
        blocked.push(tokio::spawn(async move {
            model.complete(request, &RunContext::default()).await
        }));
    }
    until(|| entered.load(Ordering::SeqCst) == 2).await;
    assert_eq!(kernel.loader().model_status().in_flight, 0);
    let completed = tokio::time::timeout(
        Duration::from_secs(5),
        model.complete(request("fast"), &RunContext::default()),
    )
    .await
    .unwrap()
    .unwrap();
    assert_eq!(completed.output, "fast");
    assert_eq!(entered.load(Ordering::SeqCst), 2);
    waiting.cancel();
    for call in blocked {
        assert_eq!(call.await.unwrap().unwrap().output, "wait");
    }
    let loader = kernel.loader().clone();
    let workers = loader
        .model_status()
        .worker_pids
        .iter()
        .map(|pid| pidfd(*pid))
        .collect::<Vec<_>>();
    kernel.shutdown();
    until(|| workers.iter().all(dead) && loader.model_status().worker_pids.is_empty()).await;
}

#[tokio::test]
async fn model_owner_death_process() {
    let Ok(directory) = std::env::var("NOFY_MODEL_OWNER_STATE") else {
        return;
    };
    let host = host(
        std::path::Path::new(&directory),
        Arc::new(AtomicUsize::new(0)),
    )
    .await;
    let loader = host.loader().clone();
    step(&loader, program("true"), json!({}), 0).await;
    let worker = loader.model_status().worker_pids[0];
    let active = loader.clone();
    tokio::spawn(async move {
        active
            .evaluate(
                program("loop {}"),
                json!({}),
                0,
                1024,
                CancellationToken::new(),
            )
            .await
    });
    until(|| loader.model_status().in_flight == 1).await;
    std::fs::write(
        std::path::Path::new(&directory).join("model-owner.json"),
        serde_json::to_vec(&json!({"owner":std::process::id(),"worker":worker})).unwrap(),
    )
    .unwrap();
    std::future::pending::<()>().await;
}

#[tokio::test]
async fn killed_owner_retires_even_a_stopped_active_model_worker_before_any_recovery() {
    use std::os::unix::process::ExitStatusExt;
    let dir = tempfile::tempdir().unwrap();
    let child = tokio::process::Command::new(std::env::current_exe().unwrap())
        .args([
            "--exact",
            "model_program::isolation::model_owner_death_process",
            "--nocapture",
        ])
        .env("NOFY_MODEL_OWNER_STATE", dir.path())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .kill_on_drop(true)
        .spawn()
        .unwrap();
    let owner = child.id().unwrap();
    let owner_fd = pidfd(owner);
    let path = dir.path().join("model-owner.json");
    until(|| path.exists()).await;
    let mut data = None;
    until(|| {
        data = std::fs::read(&path)
            .ok()
            .and_then(|bytes| serde_json::from_slice::<Value>(&bytes).ok());
        data.is_some()
    })
    .await;
    let data = data.unwrap();
    assert_eq!(data["owner"], owner);
    let worker = u32::try_from(data["worker"].as_u64().unwrap()).unwrap();
    let fd = pidfd(worker);
    signal(&fd, libc::SIGSTOP);
    signal(&owner_fd, libc::SIGKILL);
    let output = tokio::time::timeout(Duration::from_secs(10), child.wait_with_output())
        .await
        .unwrap()
        .unwrap();
    assert_eq!(
        output.status.signal(),
        Some(libc::SIGKILL),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    // There has been no reopen, cleanup helper or runtime recovery request.
    until(|| dead(&fd)).await;
}
