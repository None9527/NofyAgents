#![allow(clippy::disallowed_methods)] // test fixture processes are killed or waited on by the test that spawns them
use super::*;
use nofy_agent_executors::code::{Executor, Request};
use nofy_tool_runtime::ToolError;
use std::{
    collections::BTreeSet,
    os::fd::{AsRawFd, FromRawFd, OwnedFd},
    path::Path,
};

fn request_for(source: &str) -> Request {
    Request {
        source: source.into(),
        input: json!({"n":7}),
        max_operations: 10_000_000,
        timeout_ms: 600_000,
        max_input_bytes: 1_048_576,
        max_output_bytes: 1_048_576,
    }
}
fn error_code(error: &ToolError) -> &str {
    error.details.as_ref().unwrap()["code"].as_str().unwrap()
}
fn heavy() -> Request {
    let mut request = request_for("loop {let found=args.data.contains(\"not-present\");}");
    request.input = json!({"data":"x".repeat(900000)});
    request
}
fn pidfd(pid: u32) -> OwnedFd {
    // These PIDs come only from this test's owned helper/owner. The new pidfd
    // remains tied to that process even if the numeric PID is later reused.
    let fd = unsafe { libc::syscall(libc::SYS_pidfd_open, pid, 0) };
    assert!(fd >= 0, "{}", std::io::Error::last_os_error());
    // SAFETY: pidfd_open returned a checked, newly owned file descriptor.
    unsafe { OwnedFd::from_raw_fd(fd as i32) }
}
fn dead(fd: &OwnedFd) -> bool {
    let mut poll = libc::pollfd {
        fd: fd.as_raw_fd(),
        events: libc::POLLIN,
        revents: 0,
    };
    // SAFETY: poll points to one initialized entry and its pidfd stays owned.
    assert!(unsafe { libc::poll(&mut poll, 1, 0) } >= 0);
    poll.revents & libc::POLLIN != 0
}
fn signal(fd: &OwnedFd, signal: i32) {
    // SAFETY: this exact owned pidfd identifies the child; no name lookup or
    // recycled PID is used for cancellation and failure injection.
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
async fn until(mut condition: impl FnMut() -> bool) {
    tokio::time::timeout(Duration::from_secs(10), async {
        while !condition() {
            tokio::time::sleep(Duration::from_millis(5)).await;
        }
    })
    .await
    .unwrap();
}
fn children(root: &Path) -> BTreeSet<u32> {
    let mut candidates = BTreeSet::new();
    for task in std::fs::read_dir("/proc/self/task").unwrap().flatten() {
        if let Ok(text) = std::fs::read_to_string(task.path().join("children")) {
            candidates.extend(
                text.split_whitespace()
                    .filter_map(|pid| pid.parse::<u32>().ok()),
            );
        }
    }
    candidates
        .into_iter()
        .filter(|pid| {
            let Ok(command) = std::fs::read(format!("/proc/{pid}/cmdline")) else {
                return false;
            };
            let args: Vec<_> = command.split(|byte| *byte == 0).collect();
            if args.get(1) != Some(&b"__nofy_module_worker_v1".as_slice())
                || args.get(3) != Some(&b"--evaluate-code".as_slice())
            {
                return false;
            }
            let Ok(profile) = serde_json::from_slice::<Value>(args[2]) else {
                return false;
            };
            profile["parent_pid"] == std::process::id()
                && profile["private_root"] == root.to_str().unwrap()
        })
        .collect()
}
fn spawn(
    loader: &nofy_agent_host::loader::Loader,
    source: Request,
    cancel: CancellationToken,
) -> tokio::task::JoinHandle<Result<Value, ToolError>> {
    let loader = loader.clone();
    tokio::spawn(async move { loader.evaluate(source, cancel).await })
}
async fn one_child(root: &Path) -> (u32, OwnedFd) {
    until(|| children(root).len() == 1).await;
    let pid = *children(root).first().unwrap();
    until(|| {
        std::fs::read_to_string(format!("/proc/{pid}/status"))
            .is_ok_and(|value| value.contains("NoNewPrivs:\t1") && value.contains("Seccomp:\t2"))
    })
    .await;
    (pid, pidfd(pid))
}

#[tokio::test]
async fn missing_helper_has_no_fallback_and_binding_does_not_change_portable_identity() {
    let dir = tempfile::tempdir().unwrap();
    let engines = native::registry(Arc::new(Credentials(Arc::new(AtomicUsize::new(0))))).unwrap();
    assert!(
        !engines
            .descriptors()
            .iter()
            .any(|factory| factory.factory == "tool.rhai")
    );
    let host = unbound_host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let definition: Value = json!({"schema_version":1,"name":"pure-code","modules":[{
        "reference":{"id":"method","version":"1"},"factory":"tool.rhai",
        "config":{"contract":{"name":"method"},"source":"complete(#{result:args.n*2});"}}
    ],"programs":{"compute":{"kind":"tool","definition":{"name":"compute","tool_packs":[{"id":"method","version":"1"}]},
        "call":{"id":"call","name":"method","arguments":{"n":7}}}}});
    let before = host
        .control()
        .prepare(serde_json::from_value(definition.clone()).unwrap())
        .unwrap()
        .bundle
        .digest;
    let error = host
        .loader()
        .evaluate(request_for("42"), Default::default())
        .await
        .unwrap_err();
    assert_eq!(error_code(&error), "isolated_unavailable");
    assert_eq!(host.loader().code_status().started, 0);
    let host = host
        .with_loader_helper(Path::new(env!("CARGO_BIN_EXE_nofy-agent-host")))
        .unwrap();
    let after = host
        .control()
        .prepare(serde_json::from_value(definition).unwrap())
        .unwrap()
        .bundle
        .digest;
    assert_eq!(before, after);
    assert_eq!(
        host.loader()
            .evaluate(
                request_for(
                    "fn done(n){complete(#{result:n*2});} done(args.n); throw \"unreachable\";"
                ),
                Default::default()
            )
            .await
            .unwrap(),
        json!({"result":14})
    );
    let mut limited = request_for("try {loop {}} catch(e) {42}");
    limited.max_operations = 1000;
    let error = host
        .loader()
        .evaluate(limited, Default::default())
        .await
        .unwrap_err();
    assert_eq!(error_code(&error), "operation_limit");
    let mut output = request_for("#{value:12345}");
    output.max_output_bytes = 4;
    assert_eq!(
        error_code(
            &host
                .loader()
                .evaluate(output, Default::default())
                .await
                .unwrap_err()
        ),
        "output_limit"
    );
    assert_eq!(host.loader().code_status().in_flight, 0);
    host.shutdown();
}

#[tokio::test]
async fn code_status_requires_read_and_never_runs_code_or_reads_credentials() {
    let dir = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let host = host(dir.path(), reads.clone()).await;
    let server = serve(host.router()).await;
    let (status, body) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/code/status",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200);
    assert_eq!(
        body,
        json!({"protocol":"nofy.code-program-evaluate/v1","slots":2,"in_flight":0,
        "started":0,"helper_bound":true,"stopping":false})
    );
    assert_eq!(reads.load(Ordering::SeqCst), 0);
    assert!(!body.to_string().contains(dir.path().to_str().unwrap()));
    let execute = Authorizer::new(vec![(ADMIN.into(), [Scope::Execute].into())]).unwrap();
    let other = tempfile::tempdir().unwrap();
    let limited = KernelHost::open(
        other.path(),
        native::registry(Arc::new(Credentials(reads))).unwrap(),
        execute,
    )
    .await
    .unwrap();
    let limited = serve(limited.router()).await;
    assert_eq!(
        request(
            &limited,
            reqwest::Method::GET,
            "/api/v1/code/status",
            ADMIN,
            Value::Null
        )
        .await
        .0,
        403
    );
    host.shutdown();
}

#[tokio::test]
async fn cancelled_dropped_and_queued_calls_reap_children_before_reuse_and_shutdown() {
    let dir = tempfile::tempdir().unwrap();
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let loader = host.loader();
    let first = spawn(loader, heavy(), Default::default());
    let (pid, first_fd) = one_child(dir.path()).await;
    let status = std::fs::read_to_string(format!("/proc/{pid}/status")).unwrap();
    assert!(status.contains("CapEff:\t0000000000000000"));
    assert!(
        std::fs::read(format!("/proc/{pid}/environ"))
            .unwrap()
            .is_empty()
    );
    let limits = std::fs::read_to_string(format!("/proc/{pid}/limits")).unwrap();
    for (name, value) in [
        ("Max address space", "536870912"),
        ("Max stack size", "16777216"),
        ("Max cpu time", "601"),
    ] {
        assert!(
            limits
                .lines()
                .find(|line| line.starts_with(name))
                .unwrap()
                .contains(value),
            "{limits}"
        );
    }
    signal(&first_fd, libc::SIGSTOP);
    let cancel = CancellationToken::new();
    let second = spawn(loader, heavy(), cancel.clone());
    until(|| children(dir.path()).len() == 2).await;
    let second_pid = *children(dir.path()).iter().find(|id| **id != pid).unwrap();
    let second_fd = pidfd(second_pid);
    signal(&second_fd, libc::SIGSTOP);
    assert_eq!(loader.code_status().in_flight, 2);
    let mut queued = request_for("42");
    queued.timeout_ms = 20;
    assert_eq!(
        error_code(
            &loader
                .evaluate(queued, Default::default())
                .await
                .unwrap_err()
        ),
        "timeout"
    );
    assert_eq!(loader.code_status().started, 2);
    assert!(!dead(&first_fd) && !dead(&second_fd));
    let cancelled = CancellationToken::new();
    cancelled.cancel();
    assert_eq!(
        error_code(
            &loader
                .evaluate(request_for("42"), cancelled)
                .await
                .unwrap_err()
        ),
        "cancelled"
    );
    first.abort();
    assert!(first.await.unwrap_err().is_cancelled());
    until(|| dead(&first_fd) && loader.code_status().in_flight == 1).await;
    cancel.cancel();
    assert_eq!(error_code(&second.await.unwrap().unwrap_err()), "cancelled");
    assert!(dead(&second_fd));
    assert_eq!(loader.code_status().in_flight, 0);
    assert_eq!(
        loader
            .evaluate(request_for("42"), Default::default())
            .await
            .unwrap(),
        json!(42)
    );
    let active = spawn(loader, heavy(), Default::default());
    let (_, fd) = one_child(dir.path()).await;
    signal(&fd, libc::SIGSTOP);
    let owned = host.clone();
    let worker = tokio::spawn(async move { owned.run_worker(Default::default(), 1).await });
    host.shutdown();
    worker.await.unwrap().unwrap();
    assert!(dead(&fd));
    assert_eq!(error_code(&active.await.unwrap().unwrap_err()), "cancelled");
    assert_eq!(loader.code_status().in_flight, 0);
    assert_eq!(
        error_code(
            &loader
                .evaluate(request_for("42"), Default::default())
                .await
                .unwrap_err()
        ),
        "cancelled"
    );
}

#[tokio::test]
async fn tool_deadline_is_not_replaced_by_the_prompt_and_scope_five_second_boundary() {
    let dir = tempfile::tempdir().unwrap();
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let mut source = heavy();
    source.timeout_ms = 6500;
    let begin = std::time::Instant::now();
    let task = spawn(host.loader(), source, Default::default());
    let (pid, fd) = one_child(dir.path()).await;
    signal(&fd, libc::SIGSTOP);
    let limits = std::fs::read_to_string(format!("/proc/{pid}/limits")).unwrap();
    let cpu = limits
        .lines()
        .find(|line| line.starts_with("Max cpu time"))
        .unwrap();
    assert_eq!(cpu.split_whitespace().nth(3), Some("8"));
    tokio::time::sleep(Duration::from_millis(5200)).await;
    assert!(!task.is_finished());
    assert!(!dead(&fd));
    let error = tokio::time::timeout(Duration::from_secs(5), task)
        .await
        .unwrap()
        .unwrap()
        .unwrap_err();
    assert_eq!(error_code(&error), "timeout");
    assert!(begin.elapsed() >= Duration::from_millis(6400));
    assert!(dead(&fd));
    assert_eq!(host.loader().code_status().in_flight, 0);
    host.shutdown();
}

#[tokio::test]
async fn killed_code_worker_does_not_kill_the_host_or_replay_a_failed_step() {
    let dir = tempfile::tempdir().unwrap();
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let mut task = spawn(host.loader(), heavy(), Default::default());
    let (_, fd) = tokio::select! {
        result = &mut task => panic!("worker ended before process observation: {result:?}"),
        child = one_child(dir.path()) => child,
    };
    signal(&fd, libc::SIGKILL);
    assert_eq!(
        error_code(&task.await.unwrap().unwrap_err()),
        "isolated_unavailable"
    );
    assert!(dead(&fd));
    assert_eq!(host.loader().code_status().started, 1);
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
    assert_eq!(
        host.loader()
            .evaluate(request_for("42"), Default::default())
            .await
            .unwrap(),
        json!(42)
    );
    assert_eq!(host.loader().code_status().started, 2);
    assert!(children(dir.path()).is_empty());
    host.shutdown();
}

#[tokio::test]
async fn code_owner_death_process() {
    let Some(root) = std::env::var_os("NOFY_CODE_DEATH_STATE") else {
        return;
    };
    let root = std::path::PathBuf::from(root);
    let host = host(&root, Arc::new(AtomicUsize::new(0))).await;
    assert_eq!(
        host.loader()
            .evaluate(request_for("42"), Default::default())
            .await
            .unwrap(),
        json!(42)
    );
    let _active = spawn(host.loader(), heavy(), Default::default());
    let (pid, fd) = one_child(&root).await;
    signal(&fd, libc::SIGSTOP);
    std::fs::write(
        root.join("owner-ready.json"),
        serde_json::to_vec(&json!({"owner":std::process::id(),"worker":pid})).unwrap(),
    )
    .unwrap();
    std::future::pending::<()>().await;
}

#[tokio::test]
async fn owner_death_kills_a_stopped_code_worker_before_any_recovery() {
    let dir = tempfile::tempdir().unwrap();
    let mut owner = tokio::process::Command::new(std::env::current_exe().unwrap())
        .args([
            "--exact",
            "code::isolation::code_owner_death_process",
            "--nocapture",
        ])
        .env_clear()
        .env("RUST_MIN_STACK", "16777216")
        .env("NOFY_CODE_DEATH_STATE", dir.path())
        .kill_on_drop(true)
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::inherit())
        .spawn()
        .unwrap();
    let owner_pid = owner.id().unwrap();
    let owner_fd = pidfd(owner_pid);
    let ready = dir.path().join("owner-ready.json");
    until(|| ready.exists() || owner.try_wait().unwrap().is_some()).await;
    let evidence: Value = serde_json::from_slice(&std::fs::read(ready).unwrap()).unwrap();
    assert_eq!(evidence["owner"], owner_pid);
    let worker_fd = pidfd(evidence["worker"].as_u64().unwrap() as u32);
    assert!(!dead(&worker_fd));
    signal(&owner_fd, libc::SIGKILL);
    assert!(!owner.wait().await.unwrap().success());
    until(|| dead(&worker_fd)).await;
}
