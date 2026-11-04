use super::*;
#[path = "matching/process.rs"]
mod process;
#[path = "matching/root.rs"]
mod root;
use nofy_agent_modules::scope_program::{Executor, Operation, Program, Reply};
use nofy_agent_runtime::{RunContext, ToolCall};

fn scope() -> Program {
    super::programs::resolved(super::programs::text())
}
fn busy() -> (Program, Vec<String>, Operation) {
    (
        super::programs::busy(),
        vec!["workspace-read".into()],
        Operation::Filter {
            names: vec!["inspect".into()],
        },
    )
}
fn pids(directory: &std::path::Path) -> Vec<u32> {
    pids_for(std::process::id(), directory)
}
fn pids_for(parent: u32, directory: &std::path::Path) -> Vec<u32> {
    let mut found = std::collections::BTreeSet::new();
    let Ok(tasks) = std::fs::read_dir(format!("/proc/{parent}/task")) else {
        return vec![];
    };
    for task in tasks.flatten() {
        let Ok(children) = std::fs::read_to_string(task.path().join("children")) else {
            continue;
        };
        for pid in children
            .split_whitespace()
            .filter_map(|id| id.parse::<u32>().ok())
        {
            if let Ok(command) = std::fs::read(format!("/proc/{pid}/cmdline")) {
                let command = String::from_utf8_lossy(&command);
                if command.contains("--evaluate-scope")
                    && command.contains(directory.to_str().unwrap())
                {
                    found.insert(pid);
                }
            }
        }
    }
    found.into_iter().collect()
}
async fn started(host: &KernelHost, directory: &std::path::Path, count: usize) -> Vec<u32> {
    tokio::time::timeout(Duration::from_secs(10), async {
        loop {
            let pids = pids(directory);
            if pids.len() == count && host.loader().scope_status().in_flight == count {
                break pids;
            }
            tokio::time::sleep(Duration::from_millis(5)).await;
        }
    })
    .await
    .unwrap()
}
async fn normal(host: &KernelHost) {
    let result = host
        .loader()
        .evaluate(
            &scope(),
            &["workspace-read".into()],
            Operation::Admit {
                call: ToolCall {
                    id: "allowed".into(),
                    name: "inspect".into(),
                    arguments: json!({"file_path":"src/lib.rs"}),
                },
            },
            &RunContext::new("t", "r"),
        )
        .await
        .unwrap();
    assert!(matches!(result, Reply::Admit { allowed: true }));
}

#[tokio::test]
async fn artifact_scope_enforces_declared_paths_argv_and_names_without_credentials() {
    let dir = tempfile::tempdir().unwrap();
    let reads = Arc::new(AtomicUsize::new(0));
    let host = resident(dir.path(), reads.clone()).await;
    let rules = ["workspace-read", "version-control", "issues", "custom"].map(str::to_owned);
    let reply = host
        .loader()
        .evaluate(
            &scope(),
            &rules,
            Operation::Filter {
                names: [
                    "inspect",
                    "terminal",
                    "github__issue",
                    "slack__post",
                    "custom",
                ]
                .map(str::to_owned)
                .to_vec(),
            },
            &RunContext::new("t", "r"),
        )
        .await
        .unwrap();
    let Reply::Filter { allowed } = reply else {
        panic!("filter reply")
    };
    assert_eq!(allowed, ["inspect", "terminal", "github__issue", "custom"]);
    for (name, args, expected) in [
        ("inspect", json!({"file_path":"src/lib.rs"}), true),
        ("inspect", json!({"file_path":"../secret"}), false),
        ("terminal", json!({"argv":["git","status"]}), true),
        (
            "terminal",
            json!({"argv":["sh","-c","git status && rm secret"]}),
            false,
        ),
        ("github__issue", json!({}), true),
        ("slack__post", json!({}), false),
        (
            "use_tool",
            json!({"tool_name":"use_tool","tool_input":{"tool_name":"inspect","tool_input":{"file_path":"src/lib.rs"}}}),
            false,
        ),
    ] {
        let reply = host
            .loader()
            .evaluate(
                &scope(),
                &rules,
                Operation::Admit {
                    call: ToolCall {
                        id: "call".into(),
                        name: name.into(),
                        arguments: args,
                    },
                },
                &RunContext::new("t", "r"),
            )
            .await
            .unwrap();
        let Reply::Admit { allowed } = reply else {
            panic!("admission reply")
        };
        assert_eq!(allowed, expected);
    }
    assert_eq!(reads.load(Ordering::SeqCst), 0);
    assert_eq!(host.loader().prompt_status().started, 0);
    assert!(pids(dir.path()).is_empty());
}

#[tokio::test]
async fn scope_preflight_bounds_missing_helper_and_status_never_fall_back_to_in_process_matching() {
    let dir = tempfile::tempdir().unwrap();
    let host = super::super::unbound_host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let error = host
        .loader()
        .evaluate(
            &scope(),
            &["inspect-only".into()],
            Operation::Filter {
                names: vec!["inspect".into()],
            },
            &RunContext::new("t", "r"),
        )
        .await
        .err()
        .unwrap();
    assert!(error.to_string().contains("isolated scope worker"));
    assert_eq!(host.loader().scope_status().started, 0);
    let server = serve(host.router()).await;
    let (status, metadata) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/scopes/status",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200);
    assert_eq!(metadata["helper_bound"], false);
    assert!(!metadata.to_string().contains(dir.path().to_str().unwrap()));
    let mut source = source();
    let prompt = source["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|module| module["reference"]["id"] == "prompt")
        .unwrap();
    prompt["factory"] = json!("prompt.static");
    prompt["config"] = json!({"text":"literal"});
    super::programs::attach(&mut source, super::programs::text());
    let (status, result) = request(
        &server,
        reqwest::Method::POST,
        "/api/v1/validate",
        VIEW,
        source,
    )
    .await;
    assert_eq!(status, 422, "{result}");
    assert!(result.to_string().contains("scope executor unavailable"));
    let target = tempfile::tempdir().unwrap();
    let ready = resident(target.path(), Arc::new(AtomicUsize::new(0))).await;
    for op in [
        Operation::Filter {
            names: vec!["inspect".into(); 2],
        },
        Operation::Filter {
            names: (0..1025).map(|i| format!("t{i}")).collect(),
        },
        Operation::Filter {
            names: vec!["invalid name".into()],
        },
        Operation::Admit {
            call: ToolCall {
                id: "call".into(),
                name: "inspect".into(),
                arguments: json!({"file_path":"x".repeat(65537)}),
            },
        },
    ] {
        assert!(
            ready
                .loader()
                .evaluate(
                    &scope(),
                    &["inspect-only".into()],
                    op,
                    &RunContext::new("t", "r")
                )
                .await
                .is_err()
        );
        assert_eq!(ready.loader().scope_status().started, 0);
    }
    normal(&ready).await;
}

#[tokio::test]
async fn recursive_matching_and_cpu_exhaustion_are_confined_and_next_requests_still_work() {
    let dir = tempfile::tempdir().unwrap();
    let host = resident(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let result = host
        .loader()
        .evaluate(
            &super::programs::busy(),
            &[],
            Operation::Filter {
                names: vec!["inspect".into()],
            },
            &RunContext::new("t", "r"),
        )
        .await;
    assert!(result.err().unwrap().to_string().contains("scope"));
    assert!(pids(dir.path()).is_empty());
    assert_eq!(host.loader().scope_status().in_flight, 0);
    normal(&host).await;
    let (program, rules, op) = busy();
    assert!(
        host.loader()
            .evaluate(&program, &rules, op, &RunContext::new("t", "r"))
            .await
            .is_err()
    );
    assert!(pids(dir.path()).is_empty());
    normal(&host).await;
}

#[tokio::test]
async fn dropped_callers_keep_both_work_permits_until_cancellation_and_shutdown_reap_actual_workers()
 {
    let dir = tempfile::tempdir().unwrap();
    let host = resident(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker_host = host.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 1).await.unwrap() });
    let first = RunContext::new("first", "first");
    let cancel = first.cancel.clone();
    let loader = host.loader().clone();
    let caller = tokio::spawn(async move {
        let (program, rules, op) = busy();
        loader.evaluate(&program, &rules, op, &first).await
    });
    let first_pid = started(&host, dir.path(), 1).await[0];
    caller.abort();
    let _ = caller.await;
    assert_eq!(host.loader().scope_status().in_flight, 1);
    let loader = host.loader().clone();
    let second = tokio::spawn(async move {
        let (program, rules, op) = busy();
        loader
            .evaluate(&program, &rules, op, &RunContext::new("second", "second"))
            .await
    });
    let children = started(&host, dir.path(), 2).await;
    let before = host.loader().scope_status().started;
    let queued = RunContext::new("queued", "queued");
    let queued_cancel = queued.cancel.clone();
    let loader = host.loader().clone();
    let mut queued_call = tokio::spawn(async move {
        loader
            .evaluate(
                &scope(),
                &["inspect-only".into()],
                Operation::Filter {
                    names: vec!["inspect".into()],
                },
                &queued,
            )
            .await
    });
    assert!(
        tokio::time::timeout(Duration::from_millis(50), &mut queued_call)
            .await
            .is_err()
    );
    queued_cancel.cancel();
    assert!(queued_call.await.unwrap().is_err());
    assert_eq!(host.loader().scope_status().started, before);
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/scopes/status",
            VIEW,
            Value::Null
        )
        .await
        .0,
        200
    );
    cancel.cancel();
    tokio::time::timeout(Duration::from_secs(6), async {
        while std::path::Path::new(&format!("/proc/{first_pid}")).exists() {
            tokio::time::sleep(Duration::from_millis(5)).await;
        }
    })
    .await
    .unwrap();
    stop.cancel();
    tokio::time::timeout(Duration::from_secs(6), worker)
        .await
        .unwrap()
        .unwrap();
    assert!(second.await.unwrap().is_err());
    assert_eq!(host.loader().scope_status().in_flight, 0);
    assert!(
        children
            .iter()
            .all(|pid| !std::path::Path::new(&format!("/proc/{pid}")).exists())
    );
}

#[tokio::test]
async fn resource_maintenance_does_not_lock_out_existing_scope_evaluation() {
    let dir = tempfile::tempdir().unwrap();
    let host = resident(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let commit = host.loader().commits.exclusive().unwrap();
    let usage = std::fs::OpenOptions::new()
        .read(true)
        .write(true)
        .open(dir.path().join("loader/lifecycle/lease.lock"))
        .unwrap();
    fs2::FileExt::try_lock_exclusive(&usage).unwrap();
    normal(&host).await;
    drop((commit, usage));
}
