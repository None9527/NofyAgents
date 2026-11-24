//! Operational lifecycle regression tests:
//! - Pinned helper FD surviving in-place binary hot upgrades
//! - Bounded cleanup of finished one-shot process_sessions records
//! - Graceful SIGTERM shutdown of the resident host binary
#![allow(clippy::disallowed_methods)]
use nofy_agent_host::{
    KernelHost,
    auth::{Authorizer, Scope},
    credentials::FileCredentials,
    native,
};
use serde_json::{Value, json};
use std::{path::Path, sync::Arc, time::Duration};
use tokio_util::sync::CancellationToken;

const HELPER: &str = env!("CARGO_BIN_EXE_nofy-agent-host");
const TOKEN: &str = "ops-lifecycle-test-administrator-000000000001";

async fn open_host(state_dir: &Path, helper: &Path) -> KernelHost {
    std::fs::create_dir_all(state_dir).unwrap();
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(state_dir, std::fs::Permissions::from_mode(0o700)).unwrap();
    }
    let credentials = Arc::new(
        FileCredentials::open(state_dir.join("credentials.json"), "ops-lifecycle", None).unwrap(),
    );
    KernelHost::open(
        state_dir,
        native::registry(credentials).unwrap(),
        Authorizer::new(vec![(
            TOKEN.into(),
            [
                Scope::Read,
                Scope::Edit,
                Scope::Publish,
                Scope::Resources,
                Scope::Execute,
            ]
            .into(),
        )])
        .unwrap(),
    )
    .await
    .unwrap()
    .with_loader_helper(helper)
    .unwrap()
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn helper_pinned_fd_survives_in_place_binary_hot_upgrade() {
    let dir = tempfile::tempdir().unwrap();
    let live_bin = dir.path().join("nofy-agent-host-live");
    std::fs::copy(HELPER, &live_bin).unwrap();
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(&live_bin, std::fs::Permissions::from_mode(0o755)).unwrap();
    }

    let host = open_host(&dir.path().join("state"), &live_bin).await;
    let initial = match host.loader().probe() {
        Ok(report) => report,
        Err(error) if error.to_string().contains("isolation_unavailable") => return,
        Err(error) => panic!("initial helper probe failed: {error}"),
    };
    assert_eq!(initial["enforced"], true, "{initial}");

    // Atomic in-place upgrade: replace the path on disk with a completely
    // different v2 file while the resident host is still running.
    let v2_bin = dir.path().join("nofy-agent-host-v2");
    std::fs::write(&v2_bin, b"upgraded-v2-binary-different-sha256").unwrap();
    std::fs::rename(&v2_bin, &live_bin).unwrap();

    let after_replace = host
        .loader()
        .probe()
        .expect("pinned helper FD must keep working after atomic on-disk replacement");
    assert_eq!(after_replace["enforced"], true, "{after_replace}");

    // Unlinking and swapping in a symlink on disk must still keep executing
    // the original verified inode via the pinned descriptor.
    #[cfg(unix)]
    {
        std::fs::remove_file(&live_bin).unwrap();
        std::os::unix::fs::symlink(dir.path().join("nonexistent-target"), &live_bin).unwrap();
        let after_symlink = host
            .loader()
            .probe()
            .expect("pinned helper FD must ignore later path removal or symlink swap");
        assert_eq!(after_symlink["enforced"], true, "{after_symlink}");
    }

    host.shutdown();
}

#[tokio::test(flavor = "multi_thread", worker_threads = 3)]
async fn process_sessions_one_shot_runs_are_bounded_and_cleaned_up() {
    let dir = tempfile::tempdir().unwrap();
    let state_dir = dir.path().join("state");
    let host = open_host(&state_dir, Path::new(HELPER)).await;
    if let Err(error) = host.loader().probe() {
        if error.to_string().contains("isolation_unavailable") {
            return;
        }
        panic!("probe failed: {error}");
    }

    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let url = format!("http://{}", listener.local_addr().unwrap());
    let router = host.router();
    let server = tokio::spawn(async move { axum::serve(listener, router).await.unwrap() });

    let r = |id: &str| json!({"id": id, "version": "1"});
    let mut programs = serde_json::Map::new();
    for index in 0..6 {
        programs.insert(
            format!("shot-{index}"),
            json!({
                "kind": "tool",
                "definition": {"name": format!("shot-{index}"), "tool_packs": [r("command")]},
                "call": {"id": format!("call-{index}"), "name": "command", "arguments": {"value": index}}
            }),
        );
    }
    let document = json!({
        "schema_version": 1,
        "name": "oneshot-cleanup",
        "modules": [
            {
                "reference": r("environment"),
                "factory": "resource.process_local",
                "config": {
                    "executable": "/usr/bin/python3",
                    "prefix_args": ["-s", "-B", "-u"],
                    "env": {"PATH": "/usr/bin:/bin", "LANG": "C.UTF-8"},
                    "paths": [
                        {"path": "/usr", "execute": true},
                        {"path": "/lib", "execute": true},
                        {"path": "/lib64", "execute": true}
                    ]
                }
            },
            {
                "reference": r("limits"),
                "factory": "resource.process_namespace_limits",
                "config": {"cpu_seconds": 10}
            },
            {
                "reference": r("artifact"),
                "factory": "resource.artifact",
                "config": {
                    "bundle": {
                        "schema_version": 1,
                        "files": {
                            "entry.py": "import sys, json\nargs = json.load(sys.stdin)\nprint(json.dumps({'echo': args['value']}))\n"
                        }
                    }
                }
            },
            {
                "reference": r("command"),
                "factory": "tool.process_tree_artifact",
                "config": {"contract": {"name": "command"}, "entrypoint": "entry.py"},
                "dependencies": {
                    "environment": r("environment"),
                    "artifact": r("artifact"),
                    "tree": r("limits")
                }
            }
        ],
        "programs": Value::Object(programs)
    });

    let http = reqwest::Client::new();
    let imported: Value = http
        .post(format!("{url}/api/v1/import"))
        .bearer_auth(TOKEN)
        .json(&document)
        .send()
        .await
        .unwrap()
        .json()
        .await
        .unwrap();
    let release = imported["bundle"]["digest"].as_str().unwrap().to_string();

    let stop = CancellationToken::new();
    let worker_host = host.clone();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 2).await.unwrap() });

    for index in 0..6 {
        let run_id = format!("oneshot-{index}");
        let program = format!("shot-{index}");
        let start_resp = http
            .post(format!("{url}/api/v1/runs"))
            .bearer_auth(TOKEN)
            .json(&json!({
                "run_id": run_id,
                "thread_id": run_id,
                "system": "oneshot-cleanup",
                "release": release,
                "program": program
            }))
            .send()
            .await
            .unwrap();
        assert!(start_resp.status().is_success(), "{}", start_resp.status());

        let result = tokio::time::timeout(Duration::from_secs(20), async {
            loop {
                let view: Value = http
                    .get(format!("{url}/api/v1/runs/{run_id}"))
                    .bearer_auth(TOKEN)
                    .send()
                    .await
                    .unwrap()
                    .json()
                    .await
                    .unwrap();
                if !view["execution"].is_null() && view["execution"]["status"] != "running" {
                    break view;
                }
                tokio::time::sleep(Duration::from_millis(20)).await;
            }
        })
        .await
        .unwrap();
        assert_eq!(result["execution"]["status"], "completed", "{result}");
        assert!(
            result.to_string().contains(&format!("\"echo\":{index}"))
                || result.to_string().contains(&format!("\"echo\": {index}")),
            "{result}"
        );
    }

    let sessions_dir = state_dir.join("loader/process-sessions");
    let remaining_json = std::fs::read_dir(&sessions_dir)
        .unwrap()
        .filter_map(|e| e.ok())
        .filter(|e| e.path().extension().and_then(|s| s.to_str()) == Some("json"))
        .count();
    assert_eq!(
        remaining_json, 0,
        "finished one-shot process_sessions records must be cleaned up instead of leaking on disk"
    );

    stop.cancel();
    worker.await.unwrap();
    server.abort();
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn sigterm_triggers_graceful_shutdown_without_orphans() {
    #[cfg(not(unix))]
    {
        return;
    }

    #[cfg(unix)]
    {
        use std::process::Stdio;
        use tokio::io::{AsyncBufReadExt, BufReader};
        let dir = tempfile::tempdir().unwrap();
        let state_dir = dir.path().join("state");
        let access_file = dir.path().join("access.json");
        std::fs::write(
            &access_file,
            serde_json::to_vec(&json!([
                {"token_env": "NOFY_OPS_TEST_TOKEN", "scopes": ["read", "execute"]}
            ]))
            .unwrap(),
        )
        .unwrap();

        let mut child = tokio::process::Command::new(HELPER)
            .arg("--state-dir")
            .arg(&state_dir)
            .arg("--access-file")
            .arg(&access_file)
            .arg("--listen")
            .arg("127.0.0.1:0")
            .env("NOFY_OPS_TEST_TOKEN", TOKEN)
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::piped())
            .kill_on_drop(true)
            .spawn()
            .unwrap();

        let stderr = child.stderr.take().unwrap();
        let mut reader = BufReader::new(stderr);
        let url = tokio::time::timeout(Duration::from_secs(30), async {
            let mut line = String::new();
            loop {
                line.clear();
                let n = reader.read_line(&mut line).await.unwrap();
                assert!(n > 0, "nofy-agent-host exited before listening");
                if let Some(rest) = line.trim().strip_prefix("Nofy kernel listening on ") {
                    return rest.to_string();
                }
            }
        })
        .await
        .expect("timed out waiting for nofy-agent-host to start listening");

        let http = reqwest::Client::new();
        let status = http
            .get(format!("{url}/api/v1/catalog"))
            .bearer_auth(TOKEN)
            .send()
            .await
            .unwrap()
            .status();
        assert_eq!(status, reqwest::StatusCode::OK);

        let pid = child.id().expect("child pid") as libc::pid_t;
        // SAFETY: Sending SIGTERM to the test-owned child PID we just spawned.
        let rc = unsafe { libc::kill(pid, libc::SIGTERM) };
        assert_eq!(rc, 0, "kill(SIGTERM): {}", std::io::Error::last_os_error());

        let exit = tokio::time::timeout(Duration::from_secs(10), child.wait())
            .await
            .expect("nofy-agent-host did not exit promptly after SIGTERM")
            .unwrap();
        assert!(
            exit.success(),
            "expected graceful exit code 0 on SIGTERM, got {exit:?}"
        );

        // Confirm the listener closed and the state directory reopens cleanly.
        assert!(
            http.get(format!("{url}/api/v1/catalog"))
                .bearer_auth(TOKEN)
                .send()
                .await
                .is_err()
        );
        let reopened = open_host(&state_dir, Path::new(HELPER)).await;
        reopened.shutdown();
    }
}
