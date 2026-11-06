#![allow(clippy::disallowed_methods)] // test fixture processes are killed or waited on by the test that spawns them
use super::*;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt};
fn command(view: &Value, id: &str) -> Value {
    json!({"command_id":id,"expected_revision":view["revision"],"fingerprint":view["plan"]["fingerprint"],"after":view["plan"]["after"],"limit":view["plan"]["limit"]})
}
async fn plan(server: &Serving) -> Value {
    let (status, value) = request(
        server,
        reqwest::Method::GET,
        "/api/v1/loader/cache",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200, "{value}");
    value
}
#[tokio::test]
async fn live_original_process_blocks_eviction_but_not_queries_or_cancellation() {
    let dir = tempfile::tempdir().unwrap();
    let (kernel, server, installed) = setup(dir.path()).await;
    let view = plan(&server).await;
    let source = process::sleeping(&installed, 60000);
    let imported = post(&server, "/api/v1/import", source).await;
    let worker_host = kernel.clone();
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(signal, 1).await.unwrap() });
    post(
        &server,
        "/api/v1/runs",
        run(imported["bundle"]["digest"].as_str().unwrap(), "protected"),
    )
    .await;
    let pid = process::process_pid(dir.path()).await;
    assert!(std::fs::metadata(format!("/proc/{pid}")).is_ok());
    assert_eq!(request(&server,reqwest::Method::POST,"/api/v1/loader/unload/plan",VIEW,json!({"objects":[{"kind":"runtime","id":installed["id"],"revision":installed["revision"]}]})).await.0,503);
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/loader/cache",
            VIEW,
            Value::Null
        )
        .await
        .0,
        503
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/loader/cache",
            ADMIN,
            command(&view, "while-running")
        )
        .await
        .0,
        503
    );
    assert_eq!(
        tokio::time::timeout(
            Duration::from_secs(2),
            request(
                &server,
                reqwest::Method::GET,
                "/api/v1/runs/protected",
                VIEW,
                Value::Null
            )
        )
        .await
        .unwrap()
        .0,
        200
    );
    tokio::time::timeout(
        Duration::from_secs(2),
        post(
            &server,
            "/api/v1/runs/protected/cancel",
            json!({"command_id":"cancel-during-gc"}),
        ),
    )
    .await
    .unwrap();
    assert_eq!(
        outcome(&server, "protected").await["execution"]["status"],
        "cancelled"
    );
    let after = tokio::time::timeout(Duration::from_secs(5), async {
        loop {
            let result = request(
                &server,
                reqwest::Method::GET,
                "/api/v1/loader/cache",
                VIEW,
                Value::Null,
            )
            .await;
            if result.0 == 200 {
                break result.1;
            }
            assert_eq!(result.0, 503, "{}", result.1);
            tokio::time::sleep(Duration::from_millis(10)).await;
        }
    })
    .await
    .unwrap();
    assert_eq!(
        post(
            &server,
            "/api/v1/loader/cache",
            command(&after, "after-cancel")
        )
        .await["state"],
        "complete"
    );
    stop.cancel();
    worker.await.unwrap();
}
#[tokio::test]
async fn cache_eviction_preserves_persistent_dependencies_releases_and_successful_effects() {
    let image = tokio::task::spawn_blocking(sources::image).await.unwrap();
    let digest = image.manifest.digest().unwrap();
    let dir = tempfile::tempdir().unwrap();
    let kernel = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(kernel.router()).await;
    let bundle = json!({"schema_version":1,"files":{"main.sh":"IFS= read -r line || :\nn=${line#'{\"n\":'}\nn=${n%'}'}\nprintf '{\"result\":%s,\"pid\":%s}' \"$((n*2))\" \"$$\"\n"}});
    let artifact = post(&server, "/api/v1/artifacts", bundle.clone()).await;
    let mut source = document(&Value::Null, json!({"digest":artifact["digest"]}));
    source["modules"][1]["factory"] = json!("resource.process_locked");
    source["modules"][1]["config"] = json!({"image":digest});
    source["modules"][2]["config"]["entrypoint"] = json!("main.sh");
    let publication = post(
        &server,
        "/api/v1/import",
        json!({"format":"nofy.deployment/v1","system":source,"runtime_images":[image]}),
    )
    .await;
    let release = publication["bundle"]["digest"].as_str().unwrap();
    let worker_host = kernel.clone();
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(signal, 1).await.unwrap() });
    post(&server, "/api/v1/runs", run(release, "before-gc")).await;
    let before = outcome(&server, "before-gc").await;
    assert_eq!(output(&before)["result"], 14, "{before}");
    let view = plan(&server).await;
    assert_eq!(view["plan"]["entries"].as_array().unwrap().len(), 2);
    let page = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/loader/cache?limit=1",
        VIEW,
        Value::Null,
    )
    .await
    .1;
    assert!(page["plan"]["next"].is_string());
    let next = request(
        &server,
        reqwest::Method::GET,
        &format!(
            "/api/v1/loader/cache?limit=1&after={}",
            page["plan"]["next"].as_str().unwrap()
        ),
        VIEW,
        Value::Null,
    )
    .await
    .1;
    assert_ne!(
        page["plan"]["entries"][0]["kind"],
        next["plan"]["entries"][0]["kind"]
    );
    let request_body = command(&view, "evict");
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/loader/cache",
            VIEW,
            request_body.clone()
        )
        .await
        .0,
        403
    );
    let mut wrong = request_body.clone();
    wrong["fingerprint"] = json!("0".repeat(64));
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/loader/cache",
            ADMIN,
            wrong
        )
        .await
        .0,
        409
    );
    let receipt = post(&server, "/api/v1/loader/cache", request_body.clone()).await;
    assert_eq!(receipt["state"], "complete");
    assert!(
        plan(&server).await["plan"]["entries"]
            .as_array()
            .unwrap()
            .is_empty()
    );
    assert_eq!(
        kernel
            .loader()
            .artifacts
            .get(artifact["digest"].as_str().unwrap())
            .unwrap()
            .files,
        serde_json::from_value::<nofy_agent_runtime::artifact::ArtifactBundle>(bundle)
            .unwrap()
            .files
    );
    assert_eq!(
        kernel
            .loader()
            .images
            .get(&digest)
            .unwrap()
            .manifest
            .digest()
            .unwrap(),
        digest
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            &format!("/api/v1/releases/{release}"),
            VIEW,
            Value::Null
        )
        .await
        .1,
        publication["bundle"]
    );
    post(&server, "/api/v1/runs", run(release, "before-gc")).await;
    assert_eq!(
        outcome(&server, "before-gc").await["execution"]["outcome"],
        before["execution"]["outcome"]
    );
    assert!(
        plan(&server).await["plan"]["entries"]
            .as_array()
            .unwrap()
            .is_empty()
    );
    post(&server, "/api/v1/runs", run(release, "after-gc")).await;
    assert_eq!(output(&outcome(&server, "after-gc").await)["result"], 14);
    assert_eq!(
        plan(&server).await["plan"]["entries"]
            .as_array()
            .unwrap()
            .len(),
        2
    );
    assert_eq!(
        post(&server, "/api/v1/loader/cache", request_body).await,
        receipt
    );
    assert_eq!(
        plan(&server).await["plan"]["entries"]
            .as_array()
            .unwrap()
            .len(),
        2
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/loader/cache/receipts/1",
            VIEW,
            Value::Null
        )
        .await
        .1,
        receipt
    );
    stop.cancel();
    worker.await.unwrap();
}

#[cfg(target_arch = "x86_64")]
#[tokio::test]
async fn real_helper_cannot_release_its_own_lease_and_preserves_it_across_second_exec() {
    let dir = tempfile::tempdir().unwrap();
    let kernel = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(kernel.router()).await;
    let scratch = tempfile::tempdir_in(dir.path().join("loader/scratch")).unwrap();
    let mut roots = [
        "/usr/lib",
        "/usr/local/lib",
        "/lib",
        "/lib64",
        "/etc/ld.so.cache",
    ]
    .into_iter()
    .filter_map(|p| std::fs::canonicalize(p).ok())
    .collect::<Vec<_>>();
    let python = std::fs::canonicalize("/usr/bin/python3").unwrap();
    roots.push(python.clone());
    let profile = json!({"scratch":scratch.path(),"scratch_files":[],"read_only":roots,"private_root":dir.path(),"parent_pid":std::process::id(),"cpu_seconds":10,
        "cache_lease":dir.path().join("loader/lifecycle/lease.lock")});
    let script = r#"import os,sys,ctypes,errno,json
libc=ctypes.CDLL(None,use_errno=True)
descriptors=[]
for fd in range(3,64):
    try: os.fstat(fd); descriptors.append(fd)
    except OSError: pass
lease=[fd for fd in descriptors if (os.fstat(fd).st_dev,os.fstat(fd).st_ino)==(int(sys.argv[1]),int(sys.argv[2]))]
assert len(lease)==1,descriptors
fd=lease[0]
def denied(number,*args):
    ctypes.set_errno(0)
    result=libc.syscall(ctypes.c_long(number),*(ctypes.c_long(a) for a in args))
    assert result==-1 and ctypes.get_errno()==errno.EPERM,(number,result,ctypes.get_errno())
for high in [0,1<<32]:
    denied(3,fd|high)
    denied(32,fd|high)
    denied(33,fd|high,60)
    denied(292,fd|high,60,0)
    denied(33,0,fd|high)
    denied(292,0,fd|high,0)
    denied(73,fd|high,8)
    denied(72,fd|high,2,1)
    denied(16,fd|high,0x5451,0)
    denied(190,fd|high,0,0,0,0)
    denied(199,fd|high,0)
denied(436,fd,fd,0)
for number in [188,189,197,198,452,463,466]:
    denied(number,0,0,0,0,0,0)
os.execv('/usr/bin/python3',['python3','-I','-c',f'import os,sys,json;os.fstat({fd});print(json.dumps({{"lease_fd":{fd}}}),flush=True);sys.stdin.read(1)'])
"#;
    let before = plan(&server).await;
    // No parent-side shared lease exists here. Only the actual confined helper
    // holds it, so an early unlock would make maintenance incorrectly succeed.
    let mut child = tokio::process::Command::new(env!("CARGO_BIN_EXE_nofy-agent-host"))
        .arg(nofy_agent_host::loader::isolation::WORKER_ARG)
        .arg(profile.to_string())
        .arg(&python)
        .args(["-I", "-S", "-c", script])
        .arg({
            use std::os::unix::fs::MetadataExt;
            std::fs::metadata(dir.path().join("loader/lifecycle/lease.lock"))
                .unwrap()
                .dev()
                .to_string()
        })
        .arg({
            use std::os::unix::fs::MetadataExt;
            std::fs::metadata(dir.path().join("loader/lifecycle/lease.lock"))
                .unwrap()
                .ino()
                .to_string()
        })
        .env_clear()
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .kill_on_drop(true)
        .spawn()
        .unwrap();
    let mut lines = tokio::io::BufReader::new(child.stdout.take().unwrap()).lines();
    let line = tokio::time::timeout(Duration::from_secs(15), lines.next_line())
        .await
        .unwrap()
        .unwrap();
    if line.is_none() {
        use tokio::io::AsyncReadExt;
        let mut error = String::new();
        child
            .stderr
            .take()
            .unwrap()
            .read_to_string(&mut error)
            .await
            .unwrap();
        panic!("helper exited before lease assertion: {error}");
    }
    let ready: Value = serde_json::from_str(&line.unwrap()).unwrap();
    assert!(ready["lease_fd"].as_u64().unwrap() >= 3);
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/loader/cache",
            VIEW,
            Value::Null
        )
        .await
        .0,
        503
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/loader/cache",
            ADMIN,
            command(&before, "during-helper")
        )
        .await
        .0,
        503
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/catalog",
            VIEW,
            Value::Null
        )
        .await
        .0,
        200
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/loader/cache/receipts/1",
            VIEW,
            Value::Null
        )
        .await
        .0,
        404
    );
    child.stdin.as_mut().unwrap().write_all(b"x").await.unwrap();
    assert!(child.wait().await.unwrap().success());
    let view = plan(&server).await;
    let receipt = post(
        &server,
        "/api/v1/loader/cache",
        command(&view, "after-helper"),
    )
    .await;
    assert_eq!(receipt["state"], "complete");
    assert!(!scratch.path().exists());
}
