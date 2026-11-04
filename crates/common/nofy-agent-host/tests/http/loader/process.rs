use super::*;
use std::path::Path;
use tokio::io::AsyncBufReadExt;

pub(super) async fn binary(
    directory: &Path,
    source: Option<&Path>,
) -> (Serving, tokio::process::Child) {
    let access = directory.join("access.json");
    tokio::fs::write(&access, serde_json::to_vec(&json!([{"token_env":"NOFY_LOADER_TEST_ACCESS","scopes":["read","edit","publish","resources","execute"]}])).unwrap()).await.unwrap();
    let mut command = tokio::process::Command::new(env!("CARGO_BIN_EXE_nofy-agent-host"));
    command
        .args(["--listen", "127.0.0.1:0", "--state-dir"])
        .arg(directory)
        .arg("--access-file")
        .arg(access)
        .env("NOFY_LOADER_TEST_ACCESS", ADMIN)
        .env("NOFY_SECRET_MODEL_TOKEN", "fixture-provider-token")
        .kill_on_drop(true)
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::piped());
    if let Some(source) = source {
        command.arg("--system-file").arg(source);
    }
    let mut child = command.spawn().unwrap();
    let mut lines = tokio::io::BufReader::new(child.stderr.take().unwrap()).lines();
    let url = tokio::time::timeout(Duration::from_secs(20), async {
        while let Some(line) = lines.next_line().await.unwrap() {
            if let Some(url) = line.strip_prefix("Nofy kernel listening on ") {
                return url.to_owned();
            }
        }
        panic!("resident host exited before listening");
    })
    .await
    .unwrap();
    let task = tokio::spawn(async move { while lines.next_line().await.unwrap().is_some() {} });
    (Serving { url, task }, child)
}
fn running(pid: u32) -> bool {
    std::fs::read_to_string(format!("/proc/{pid}/stat")).is_ok_and(|s| {
        s.rsplit_once(") ")
            .is_some_and(|(_, tail)| !tail.starts_with('Z'))
    })
}
async fn stopped(pid: u32) {
    tokio::time::timeout(Duration::from_secs(5), async {
        while running(pid) {
            tokio::time::sleep(Duration::from_millis(10)).await;
        }
    })
    .await
    .unwrap();
}
pub(super) async fn process_pid(directory: &Path) -> u32 {
    tokio::time::timeout(Duration::from_secs(15), async {
        loop {
            for entry in std::fs::read_dir(directory.join("loader/scratch")).unwrap() {
                if let Ok(pid) = std::fs::read_to_string(entry.unwrap().path().join("process.pid"))
                {
                    if let Ok(pid) = pid.parse() {
                        return pid;
                    }
                }
            }
            tokio::time::sleep(Duration::from_millis(10)).await;
        }
    })
    .await
    .unwrap()
}
pub(super) fn sleeping(installed: &Value, timeout: u64) -> Value {
    let mut source = document(
        installed,
        json!({"bundle":{"schema_version":1,"files":{"main.py":"import os,time,json,sys\njson.load(sys.stdin)\nwith open('process.pid','w') as f:\n    f.write(str(os.getpid()))\n    f.flush()\n    os.fsync(f.fileno())\ntime.sleep(60)\nprint('{}')\n"}}}),
    );
    source["modules"][2]["config"]["scratch_files"] = json!(["process.pid"]);
    source["modules"][2]["config"]["contract"]["timeout_ms"] = json!(timeout);
    source
}

#[tokio::test]
async fn cancellation_and_timeout_reap_real_confined_processes_and_scratch() {
    let dir = tempfile::tempdir().unwrap();
    let (kernel, server, installed) = setup(dir.path()).await;
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let worker = tokio::spawn(async move { kernel.run_worker(signal, 1).await.unwrap() });
    for (name, timeout) in [("cancel", 60000), ("timeout", 8000)] {
        let imported = post(&server, "/api/v1/import", sleeping(&installed, timeout)).await;
        post(
            &server,
            "/api/v1/runs",
            run(imported["bundle"]["digest"].as_str().unwrap(), name),
        )
        .await;
        let pid = process_pid(dir.path()).await;
        assert!(running(pid));
        if name == "cancel" {
            post(
                &server,
                &format!("/api/v1/runs/{name}/cancel"),
                json!({"command_id":"cancel-loader"}),
            )
            .await;
        }
        let result = outcome(&server, name).await;
        if name == "cancel" {
            assert_eq!(result["execution"]["status"], "cancelled", "{result}");
        } else {
            assert!(
                output(&result)["error"]
                    .as_str()
                    .unwrap()
                    .contains("timed out"),
                "{result}"
            );
        }
        stopped(pid).await;
        tokio::time::timeout(Duration::from_secs(5), async {
            while std::fs::read_dir(dir.path().join("loader/scratch"))
                .unwrap()
                .count()
                != 0
            {
                tokio::time::sleep(Duration::from_millis(10)).await;
            }
        })
        .await
        .unwrap();
    }
    stop.cancel();
    worker.await.unwrap();
}

#[tokio::test]
async fn parent_exit_fixture() {
    let Ok(directory) = std::env::var("NOFY_LOADER_EXIT_FIXTURE") else {
        return;
    };
    let directory = Path::new(&directory);
    let (kernel, server, installed) = setup(directory).await;
    let source = sleeping(&installed, 60000);
    let prepared = kernel
        .control()
        .prepare(serde_json::from_value(source.clone()).unwrap())
        .unwrap();
    let imported = post(&server, "/api/v1/import", source).await;
    let release = imported["bundle"]["digest"].as_str().unwrap();
    tokio::fs::write(directory.join("fixture-release"), release)
        .await
        .unwrap();
    post(&server, "/api/v1/runs", run(release, "root")).await;
    let supervisor = nofy_agent_runtime::supervisor::RunSupervisor::new(kernel.store().clone())
        .with_lease_ttl(Duration::from_secs(2))
        .unwrap();
    tokio::spawn(async move {
        supervisor
            .execute_submitted(prepared.registry(), "root")
            .await
            .unwrap();
    });
    process_pid(directory).await;
    // No Rust destructors or graceful child cancellation: test PDEATHSIG.
    std::process::exit(97);
}

#[tokio::test]
async fn parent_death_kills_helper_and_recovery_requires_evidence_without_redispatch() {
    let dir = tempfile::tempdir().unwrap();
    let directory = dir.path().to_owned();
    let result = tokio::task::spawn_blocking(move || {
        std::process::Command::new(std::env::current_exe().unwrap())
            .args([
                "--exact",
                "loader::process::parent_exit_fixture",
                "--nocapture",
            ])
            .env("NOFY_LOADER_EXIT_FIXTURE", directory)
            .output()
            .unwrap()
    })
    .await
    .unwrap();
    assert_eq!(
        result.status.code(),
        Some(97),
        "{}",
        String::from_utf8_lossy(&result.stderr)
    );
    let pid = process_pid(dir.path()).await;
    stopped(pid).await;
    tokio::time::sleep(Duration::from_millis(2100)).await;
    let (kernel, server, _) = setup(dir.path()).await;
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let worker = tokio::spawn(async move { kernel.run_worker(signal, 1).await.unwrap() });
    assert_eq!(
        outcome(&server, "root").await["execution"]["status"],
        "paused"
    );
    let pending = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/runs/root/recovery/root",
        VIEW,
        Value::Null,
    )
    .await
    .1;
    assert_eq!(pending["call"]["name"], "compute");
    let evidence = json!({"error":"confined process terminated after its parent exited","pid":pid});
    post(&server,"/api/v1/actions",json!({"command_id":"process-exit-proof","run_id":"root","command":{"kind":"reconcile_root_tool","receipt":{"model_sequence":pending["model_sequence"],"call":pending["call"],"result":evidence,"is_error":true}}})).await;
    let settled = action_result(&server, "process-exit-proof").await;
    assert!(settled["error"].is_null(), "{settled}");
    let finished = outcome(&server, "root").await;
    assert_eq!(
        serde_json::from_str::<Value>(output(&finished)["error"].as_str().unwrap()).unwrap(),
        evidence
    );
    let release = std::fs::read_to_string(dir.path().join("fixture-release")).unwrap();
    post(&server, "/api/v1/runs", run(&release, "root")).await;
    assert_eq!(
        finished["execution"],
        outcome(&server, "root").await["execution"]
    );
    assert_eq!(process_pid(dir.path()).await, pid);
    assert_eq!(
        std::fs::read_dir(dir.path().join("loader/scratch"))
            .unwrap()
            .count(),
        1
    );
    stop.cancel();
    worker.await.unwrap();
}

#[tokio::test]
async fn shipped_resident_binary_updates_external_tool_and_hook_in_place_and_restores_file_entry() {
    let requests = Arc::new(Mutex::new(vec![]));
    let provider = serve(
        Router::new()
            .route("/v1/chat/completions", post_handler())
            .with_state(requests.clone()),
    )
    .await;
    let dir = tempfile::tempdir().unwrap();
    let (server, mut child) = binary(dir.path(), None).await;
    let pid = child.id().unwrap();
    let exe = std::fs::read_link(format!("/proc/{pid}/exe")).unwrap();
    let hash = Sha256::digest(std::fs::read(&exe).unwrap());
    post(&server, "/api/v1/runtimes/probe", json!({})).await;
    let installed = post(&server, "/api/v1/runtimes", runtime()).await;
    let mut releases = Vec::new();
    let mut final_source = Value::Null;
    for (version, factor) in [("one", 2), ("two", 3)] {
        let tool = post(&server, "/api/v1/artifacts", package(factor)).await;
        let mut source = document(&installed, json!({"digest":tool["digest"]}));
        let mut chat = serde_json::to_value(super::super::document(&provider.url)).unwrap();
        source["modules"]
            .as_array_mut()
            .unwrap()
            .extend(chat["modules"].as_array_mut().unwrap().drain(..));
        let r = |id: &str| json!({"id":id,"version":"1"});
        let script = format!(
            "import json,sys\nv=json.load(sys.stdin)\nv['payload']['request']['messages'][0]['content']='external hook {version}'\nprint(json.dumps({{'decision':'patch','payload':v['payload']}}))\n"
        );
        source["modules"].as_array_mut().unwrap().extend([
            json!({"reference":r("hook-source"),"factory":"resource.artifact","config":{"bundle":{"schema_version":1,"files":{"main.py":script}}}}),
            json!({"reference":r("hook-code"),"factory":"tool.process_artifact","config":{"entrypoint":"main.py","contract":{"name":"hook_method"}},"dependencies":{"environment":r("environment"),"artifact":r("hook-source")}}),
            json!({"reference":r("hook-handler"),"factory":"hook.executor","config":{"tool":"hook_method"},"dependencies":{"executor":r("hook-code")}}),
            json!({"reference":r("before-model"),"factory":"hook.subscription","config":{"event":"before_model"},"dependencies":{"handler":r("hook-handler")}})
        ]);
        chat["programs"]["chat"]["definition"]["hooks"] = json!([r("before-model")]);
        source["programs"]["chat"] = chat["programs"]["chat"].clone();
        let imported = post(&server, "/api/v1/import", source.clone()).await;
        let release = imported["bundle"]["digest"].as_str().unwrap().to_owned();
        post(
            &server,
            "/api/v1/runs",
            run(&release, &format!("tool-{version}")),
        )
        .await;
        assert_eq!(
            output(&outcome(&server, &format!("tool-{version}")).await)["result"],
            7 * factor
        );
        let mut chat_run = super::super::run(&release, &format!("hook-{version}"));
        chat_run["system"] = json!("artifact-system");
        post(&server, "/api/v1/runs", chat_run).await;
        assert_eq!(
            outcome(&server, &format!("hook-{version}")).await["execution"]["outcome"]["Completed"]
                ["output"],
            format!("external hook {version}")
        );
        assert_eq!(child.id(), Some(pid));
        assert!(child.try_wait().unwrap().is_none());
        assert_eq!(std::fs::read_link(format!("/proc/{pid}/exe")).unwrap(), exe);
        assert_eq!(Sha256::digest(std::fs::read(&exe).unwrap()), hash);
        releases.push(release);
        final_source = source;
    }
    post(&server, "/api/v1/runs", run(&releases[0], "binary-old")).await;
    let original = outcome(&server, "binary-old").await;
    assert_eq!(output(&original)["result"], 14);
    let source = dir.path().join("system.json");
    tokio::fs::write(&source, serde_json::to_vec(&final_source).unwrap())
        .await
        .unwrap();
    child.kill().await.unwrap();
    drop(server);
    let (server, mut child) = binary(dir.path(), Some(&source)).await;
    post(&server, "/api/v1/runs", run(&releases[0], "binary-old")).await;
    assert_eq!(
        original["execution"],
        outcome(&server, "binary-old").await["execution"]
    );
    post(&server, "/api/v1/runs", run(&releases[1], "file-entry")).await;
    assert_eq!(output(&outcome(&server, "file-entry").await)["result"], 21);
    assert_eq!(requests.lock().unwrap().len(), 2);
    child.kill().await.unwrap();
}
