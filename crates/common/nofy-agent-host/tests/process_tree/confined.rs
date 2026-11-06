#![allow(clippy::disallowed_methods)] // test fixture processes are killed or waited on by the test that spawns them
use super::*;
use nofy_agent_host::loader::images::RuntimeImage;
use std::collections::BTreeMap;
#[path = "command.rs"]
mod command;
#[path = "local.rs"]
mod local;
const ADMIN: &str = "tree-guest-test-access-not-a-real-secret";
const VIEW: &str = "tree-guest-read-access-not-a-real-secret";
const PUBLISHER: &str = "tree-guest-publish-access-not-a-real-secret";

fn image(work: &Path) -> RuntimeImage {
    let info=Command::new("/usr/bin/python3").args(["-I","-c","import sys,sysconfig,json;print(json.dumps({'stdlib':sysconfig.get_path('stdlib'),'version':str(sys.version_info.major)+'.'+str(sys.version_info.minor)}))"]).output().unwrap();
    assert!(info.status.success());
    let info: Value = serde_json::from_slice(&info.stdout).unwrap();
    let stdlib = PathBuf::from(info["stdlib"].as_str().unwrap());
    let version = info["version"].as_str().unwrap();
    let probe = work.join("native-probe");
    let compiled = Command::new("/usr/bin/cc")
        .args(["-Wall", "-Wextra", "-Werror", "-O2", "-pthread"])
        .arg(Path::new(env!("CARGO_MANIFEST_DIR")).join("tests/process_tree/probe.c"))
        .arg("-o")
        .arg(&probe)
        .output()
        .unwrap();
    assert!(
        compiled.status.success(),
        "{}",
        String::from_utf8_lossy(&compiled.stderr)
    );
    let mut files: BTreeMap<String, PathBuf> = [
        (
            "bin/python".into(),
            fs::canonicalize("/usr/bin/python3").unwrap(),
        ),
        ("bin/probe".into(), probe),
    ]
    .into();
    let mut binaries = vec![files["bin/python"].clone(), files["bin/probe"].clone()];
    let mut pending = vec![stdlib.clone()];
    let mut excludes = Vec::new();
    while let Some(dir) = pending.pop() {
        for entry in fs::read_dir(dir).unwrap() {
            let path = entry.unwrap().path();
            let suffix = path.strip_prefix(&stdlib).unwrap();
            let meta = fs::symlink_metadata(&path).unwrap();
            if meta.is_dir() {
                let name = path.file_name().unwrap().to_str().unwrap();
                if name == "__pycache__" || name.starts_with("config-") {
                    excludes.push(suffix.to_str().unwrap().to_owned());
                } else {
                    pending.push(path);
                }
                continue;
            }
            if meta.file_type().is_symlink() {
                excludes.push(suffix.to_str().unwrap().to_owned());
                let real = fs::canonicalize(&path).unwrap();
                if real.is_file() {
                    files.insert(format!("lib/python{version}/{}", suffix.display()), real);
                }
            }
            if path.extension().is_some_and(|s| s == "so") {
                binaries.push(path);
            }
        }
    }
    let mut loader = None;
    for binary in binaries {
        let output = Command::new("ldd").arg(binary).output().unwrap();
        assert!(output.status.success());
        for line in String::from_utf8_lossy(&output.stdout).lines() {
            let words: Vec<_> = line.split_whitespace().collect();
            let path = if words.len() >= 3 && words[1] == "=>" && words[2].starts_with('/') {
                Some(PathBuf::from(words[2]))
            } else if words.first().is_some_and(|w| w.starts_with('/')) {
                Some(PathBuf::from(words[0]))
            } else {
                None
            };
            if let Some(path) = path {
                let name = path.file_name().unwrap().to_str().unwrap();
                files.insert(format!("lib/{name}"), path.clone());
                files.insert(
                    path.strip_prefix("/").unwrap().to_str().unwrap().into(),
                    path.clone(),
                );
                if name.starts_with("ld-linux-") {
                    loader = Some(path.strip_prefix("/").unwrap().to_str().unwrap().to_owned());
                }
            }
        }
    }
    RuntimeImage::capture(serde_json::from_value(json!({"id":"tree-guest","executable":"bin/python","loader":loader.unwrap(),"library_dirs":["lib"],"prefix_args":["-S","-s","-B"],"env":{"PYTHONHOME":{"kind":"path","path":"."},"LD_LIBRARY_PATH":{"kind":"path","path":"lib"}},"files":files,"trees":{format!("lib/python{version}"):{"path":stdlib,"exclude":excludes}},"executable_files":["bin/probe"]})).unwrap()).unwrap()
}
fn document(image: &RuntimeImage, root: &Path, project: &Path, access: &str, code: &str) -> Value {
    let r = |id: &str| json!({"id":id,"version":"1"});
    json!({"schema_version":1,"name":"tree-system","modules":[
        {"reference":r("code"),"factory":"resource.artifact","config":{"bundle":{"schema_version":1,"files":{"main.py":code}}}},
        {"reference":r("env"),"factory":"resource.process_locked","config":{"manifest":image.manifest}},
        {"reference":r("limits"),"factory":"resource.process_tree_limits","config":{"cgroup_root":root}},
        {"reference":r("project"),"factory":"resource.directory","config":{"path":project,"access":access}},
        {"reference":r("tool"),"factory":"tool.process_tree_artifact","config":{"contract":{"name":"probe","timeout_ms":30000},"entrypoint":"main.py","directories":{"PROJECT":"project"}},"dependencies":{"environment":r("env"),"artifact":r("code"),"tree":r("limits"),"project":r("project")}}
    ],"programs":{"probe":{"kind":"tool","definition":{"name":"probe","tool_packs":[r("tool")]},"call":{"id":"probe","name":"probe","arguments":{}}}}})
}
async fn request(base: &str, method: reqwest::Method, path: &str, value: Value) -> (u16, Value) {
    request_as(base, method, path, value, ADMIN).await
}
async fn request_as(
    base: &str,
    method: reqwest::Method,
    path: &str,
    value: Value,
    token: &str,
) -> (u16, Value) {
    let response = reqwest::Client::new()
        .request(method, format!("{base}/api/v1{path}"))
        .bearer_auth(token)
        .json(&value)
        .send()
        .await
        .unwrap();
    let status = response.status().as_u16();
    let value = response.json().await.unwrap();
    (status, value)
}
async fn launch(base: &str, source: Value, id: &str) {
    let (status, published) = request(base, reqwest::Method::POST, "/import", source).await;
    assert_eq!(status, 200, "{published}");
    let (status,submitted)=request(base,reqwest::Method::POST,"/runs",json!({"run_id":id,"thread_id":id,"system":"tree-system","release":published["bundle"]["digest"],"program":"probe"})).await;
    assert!(status < 300, "{submitted}");
}
async fn settled(base: &str, id: &str) -> Value {
    tokio::time::timeout(Duration::from_secs(40), async {
        loop {
            let (status, record) = request(
                base,
                reqwest::Method::GET,
                &format!("/runs/{id}"),
                Value::Null,
            )
            .await;
            assert_eq!(status, 200, "{record}");
            if record["execution"]["status"].as_str().is_some_and(|s| {
                matches!(
                    s,
                    "completed" | "failed" | "cancelled" | "uncertain" | "paused"
                )
            }) && matches!(
                record["run"]["status"].as_str(),
                Some("waiting" | "closed" | "cancelled" | "abandoned")
            ) {
                // The execution checkpoint precedes the queue commit. Capture
                // both after settling before comparing records across restart.
                return record;
            }
            tokio::time::sleep(Duration::from_millis(20)).await;
        }
    })
    .await
    .expect("declared guest command did not finish")
}
async fn execute(base: &str, source: Value, id: &str) -> Value {
    launch(base, source, id).await;
    settled(base, id).await
}
fn output(record: &Value) -> Value {
    assert_eq!(record["execution"]["status"], "completed", "{record}");
    let value: Value = serde_json::from_str(
        record["execution"]["outcome"]["Completed"]["output"]
            .as_str()
            .unwrap(),
    )
    .unwrap();
    value.get("value").cloned().unwrap_or(value)
}
async fn run(work: &Path, config: Config) {
    let captured = image(work);
    let auth = Authorizer::new(vec![
        (
            ADMIN.into(),
            [
                Scope::Read,
                Scope::Edit,
                Scope::Publish,
                Scope::Resources,
                Scope::Execute,
            ]
            .into(),
        ),
        (VIEW.into(), [Scope::Read].into()),
        (
            PUBLISHER.into(),
            [Scope::Read, Scope::Publish, Scope::Execute].into(),
        ),
    ])
    .unwrap();
    let host = KernelHost::open(&work.join("state"), Default::default(), auth)
        .await
        .unwrap()
        .with_loader_helper(Path::new(HELPER))
        .unwrap();
    host.loader().images.put(captured.clone()).unwrap();
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let base = format!("http://{}", listener.local_addr().unwrap());
    let server = tokio::spawn(axum::serve(listener, host.router()).into_future());
    let stop = CancellationToken::new();
    let worker_host = host.clone();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 2).await });
    let project = workspace(work, "project");
    let code = "import os,sys,json,subprocess,threading\nchild=subprocess.check_output([sys.executable,'-S','-s','-B','-c','print(42)'],text=True).strip()\nprobe=json.loads(subprocess.check_output(['/bin/probe']))\nprint(json.dumps({'pid':os.getpid(),'child':child,'native':probe}))\n";
    let source = document(&captured, &config.cgroup_root, &project, "read_write", code);
    let pure = document(
        &captured,
        Path::new("/sys/fs/cgroup/absent-guest-delegation/jobs"),
        &project,
        "read_write",
        code,
    );
    let (status, preview) = request_as(&base, reqwest::Method::POST, "/validate", pure, VIEW).await;
    assert_eq!(status, 200, "{preview}");
    assert!(host.control().inspect().await.unwrap().is_none());
    assert_eq!(host.loader().process_trees.pending().unwrap(), 0);
    assert_eq!(
        fs::read_dir(work.join("state/loader/scratch"))
            .unwrap()
            .count(),
        0
    );
    for variant in 0..6 {
        let mut invalid = source.clone();
        match variant {
            0 => {
                invalid["modules"][4]["dependencies"]
                    .as_object_mut()
                    .unwrap()
                    .remove("tree");
            }
            1 => invalid["modules"][4]["config"]["scratch_files"] = json!([]),
            2 => invalid["modules"][4]["config"]["directories"] = json!({"PROJECT":"tree"}),
            3 => invalid["modules"][4]["config"]["contract"]["max_output_bytes"] = json!(8388609),
            4 => {
                invalid["modules"][4]["dependencies"]["tree"] =
                    json!({"id":"project","version":"1"})
            }
            _ => {
                invalid["modules"][4]["factory"] = json!("tool.process_artifact");
                invalid["modules"][4]["dependencies"]
                    .as_object_mut()
                    .unwrap()
                    .remove("tree");
                invalid["modules"][3]["config"]["access"] = json!("read_write_execute");
            }
        }
        let (status, result) = request(&base, reqwest::Method::POST, "/validate", invalid).await;
        assert_eq!(status, 422, "variant {variant}: {result}");
    }
    for variant in 0..3 {
        let mut invalid = source.clone();
        invalid["modules"][2]["config"]["cgroup_root"] =
            json!("/sys/fs/cgroup/absent-pure-tree-launch/jobs");
        if variant == 0 {
            invalid["modules"][4]["config"]["args"] = json!(vec!["arg"; 128]);
        } else {
            let (count, value) = if variant == 1 {
                (32, "value".into())
            } else {
                (8, "\\".repeat(4078))
            };
            invalid["modules"][1]["config"]["manifest"]["env"] = json!(
                (0..count)
                    .map(|n| (format!("E{n}"), json!({"kind":"literal","value":value})))
                    .collect::<BTreeMap<_, _>>()
            );
            // Changed metadata has a new image identity. A portable preview
            // supplies the matching bytes, without installing them in state.
            let mut changed = captured.clone();
            changed.manifest =
                serde_json::from_value(invalid["modules"][1]["config"]["manifest"].clone())
                    .unwrap();
            invalid =
                json!({"format":"nofy.deployment/v1","system":invalid,"runtime_images":[changed]});
        }
        let (status, result) =
            request_as(&base, reqwest::Method::POST, "/validate", invalid, VIEW).await;
        assert_eq!(status, 422, "combined variant {variant}: {result}");
        assert!(
            result.to_string().contains(if variant == 2 {
                "64KiB"
            } else {
                "invalid supervised command"
            }),
            "{result}"
        );
    }
    assert!(host.control().inspect().await.unwrap().is_none());
    assert_eq!(host.loader().process_trees.pending().unwrap(), 0);
    assert_eq!(host.loader().images.list("", 8).unwrap().len(), 1);
    for kind in ["scratch", "images/trees", "artifacts/trees"] {
        assert_eq!(
            fs::read_dir(work.join("state/loader").join(kind))
                .unwrap()
                .count(),
            0,
            "{kind}"
        );
    }
    assert_eq!(
        request_as(
            &base,
            reqwest::Method::POST,
            "/import",
            source.clone(),
            PUBLISHER
        )
        .await
        .0,
        403
    );
    let record = execute(&base, source, "smoke").await;
    let result = output(&record);
    assert_eq!(result["pid"], 2, "{result}");
    assert_eq!(result["child"], "42");
    assert_eq!(
        result["native"],
        json!({"capabilities_empty":true,"denials":true,"threads":true,"pipe_nonblocking":true,"ioctl_denials":true})
    );
    idle(&host.loader().process_trees).await;
    let mut bounded_image = captured.clone();
    bounded_image.manifest.env.insert(
        "LC_CTYPE".into(),
        serde_json::from_value(json!({"kind":"literal","value":"C.UTF-8"})).unwrap(),
    );
    for n in 0..28 {
        bounded_image.manifest.env.insert(
            format!("E{n}"),
            serde_json::from_value(json!({"kind":"literal","value":"declared"})).unwrap(),
        );
    }
    assert_eq!(bounded_image.manifest.env.len(), 31);
    host.loader().images.put(bounded_image.clone()).unwrap();
    let mut bounded = document(
        &bounded_image,
        &config.cgroup_root,
        &project,
        "read_only",
        "import os,sys,json\nprint(json.dumps({'argc':len(sys.argv),'environment':len(os.environ),'pid':os.getpid()}))\n",
    );
    bounded["modules"][4]["config"]["args"] = json!(vec!["arg"; 120]);
    let bounded = execute(&base, bounded, "combined-valid-boundary").await;
    assert_eq!(
        output(&bounded),
        json!({"argc":121,"environment":32,"pid":2})
    );
    idle(&host.loader().process_trees).await;
    use std::os::unix::fs::PermissionsExt;
    fs::copy(work.join("native-probe"), project.join("existing-probe")).unwrap();
    fs::set_permissions(
        project.join("existing-probe"),
        fs::Permissions::from_mode(0o700),
    )
    .unwrap();
    fs::write(project.join("note"), b"protected-note").unwrap();
    fs::set_permissions(project.join("note"), fs::Permissions::from_mode(0o644)).unwrap();
    let outside = work.join("outside-secret");
    fs::write(&outside, b"not in guest").unwrap();
    std::os::unix::fs::symlink(&outside, project.join("outside-link")).unwrap();
    let original_mounts = fs::read_to_string("/proc/self/mountinfo").unwrap();
    for access in ["read_only", "read_write", "read_write_execute"] {
        let probe = format!(
            r#"import os,json,subprocess
from pathlib import Path
root=Path(os.environ['NOFY_DIRECTORY_PROJECT'])
def refused(action):
 try: action();return False
 except OSError:return True
assert refused(lambda:Path({:?}).read_bytes())
assert refused(lambda:(root/'outside-link').read_bytes())
assert refused(lambda:Path('/proc/self/status').read_bytes())
assert refused(lambda:Path('/sys/fs/cgroup/cgroup.procs').write_text('0'))
assert refused(lambda:os.chmod('/bin/python',0o777))
assert refused(lambda:Path('/nofy/artifact/forged').write_text('x'))
assert all(refused(lambda fd=fd:os.fstat(fd)) for fd in range(3,128))
Path('/tmp/scratch').write_text('scratch')
report={{'boundaries':True,'pid':os.getpid()}}
access={:?}
if access=='read_only':
 assert refused(lambda:(root/'new').write_text('bad'))
 assert refused(lambda:os.chmod(root/'note',0o777))
 assert refused(lambda:os.utime(root/'note',(1,1)))
 fd=os.open(root/'note',os.O_RDONLY)
 assert refused(lambda:os.fchmod(fd,0o777))
 os.close(fd)
else:
 (root/'new').write_text('declared write')
if access=='read_write_execute':
 report['executed']=json.loads(subprocess.check_output([str(root/'existing-probe')]))['threads']
else:
 assert refused(lambda:subprocess.check_output([str(root/'existing-probe')]))
 report['noexec']=True
print(json.dumps(report))
"#,
            outside.to_str().unwrap(),
            access
        );
        let record = execute(
            &base,
            document(&captured, &config.cgroup_root, &project, access, &probe),
            access,
        )
        .await;
        let value = output(&record);
        assert_eq!(value["boundaries"], true, "{value}");
        if access == "read_write_execute" {
            assert_eq!(value["executed"], true);
        } else {
            assert_eq!(value["noexec"], true);
        }
        assert_eq!(fs::read(project.join("note")).unwrap(), b"protected-note");
        assert_eq!(
            fs::metadata(project.join("note"))
                .unwrap()
                .permissions()
                .mode()
                & 0o777,
            0o644
        );
        idle(&host.loader().process_trees).await;
    }
    assert!(!original_mounts.contains(work.to_str().unwrap()));
    assert!(
        !fs::read_to_string("/proc/self/mountinfo")
            .unwrap()
            .contains(work.to_str().unwrap())
    );

    // Executability is declared authority, not a mutable cache mode bit.
    let mut nonexec = captured.clone();
    nonexec
        .manifest
        .files
        .get_mut("bin/probe")
        .unwrap()
        .executable = false;
    host.loader().images.put(nonexec.clone()).unwrap();
    let seed = execute(
        &base,
        document(
            &nonexec,
            &config.cgroup_root,
            &project,
            "read_only",
            "print('{}')",
        ),
        "nonexec-seed",
    )
    .await;
    output(&seed);
    idle(&host.loader().process_trees).await;
    let cached_probe = work
        .join("state/loader/images/trees")
        .join(nonexec.manifest.digest().unwrap())
        .join("bin/probe");
    fs::set_permissions(&cached_probe, fs::Permissions::from_mode(0o500)).unwrap();
    let noexec = "import json,subprocess\ntry:\n subprocess.check_output(['/bin/probe'])\n denied=False\nexcept PermissionError: denied=True\nprint(json.dumps({'manifest_exec_denied':denied}))\n";
    let denied = execute(
        &base,
        document(&nonexec, &config.cgroup_root, &project, "read_only", noexec),
        "manifest-noexec",
    )
    .await;
    assert_eq!(output(&denied)["manifest_exec_denied"], true);
    idle(&host.loader().process_trees).await;

    // Cancellation passes through the ordinary run API, not a test-only kill.
    let daemon = "import os,time,json\nfrom pathlib import Path\np=Path(os.environ['NOFY_DIRECTORY_PROJECT'])\nchild=os.fork()\nif child==0:\n os.setsid()\n if os.fork(): os._exit(0)\n while True: time.sleep(.02)\nos.waitpid(child,0)\n(p/'daemon-ready').write_text('{}')\nwhile True: time.sleep(.02)\n";
    launch(
        &base,
        document(
            &captured,
            &config.cgroup_root,
            &project,
            "read_write",
            daemon,
        ),
        "cancel-guest",
    )
    .await;
    wait_json(&project.join("daemon-ready")).await;
    let fds = witnesses(&only_group(&config.cgroup_root));
    let (status, cancelled) = request(
        &base,
        reqwest::Method::POST,
        "/runs/cancel-guest/cancel",
        json!({"command_id":"stop-tree"}),
    )
    .await;
    assert_eq!(status, 200, "{cancelled}");
    let result = settled(&base, "cancel-guest").await;
    assert_eq!(result["execution"]["status"], "cancelled", "{result}");
    idle(&host.loader().process_trees).await;
    all_dead(&fds).await;
    host.shutdown();
    stop.cancel();
    worker.await.unwrap().unwrap();
    server.abort();
    // The actual shipped binary must work without Cargo's stack environment.
    let access_file = work.join("access.json");
    fs::write(&access_file,serde_json::to_vec(&json!([{"token_env":"NOFY_GUEST_ACCESS","scopes":["read","edit","publish","resources","execute"]}])).unwrap()).unwrap();
    let mut cli = tokio::process::Command::new(HELPER)
        .args(["--listen", "127.0.0.1:0", "--state-dir"])
        .arg(work.join("state"))
        .arg("--access-file")
        .arg(&access_file)
        .env_remove("RUST_MIN_STACK")
        .env("NOFY_GUEST_ACCESS", ADMIN)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .kill_on_drop(true)
        .spawn()
        .unwrap();
    use tokio::io::AsyncBufReadExt;
    let mut errors = tokio::io::BufReader::new(cli.stderr.take().unwrap()).lines();
    let line = tokio::time::timeout(Duration::from_secs(10), errors.next_line())
        .await
        .unwrap()
        .unwrap()
        .unwrap();
    let cli_base = line.strip_prefix("Nofy kernel listening on ").unwrap();
    let actual = execute(
        cli_base,
        document(&captured, &config.cgroup_root, &project, "read_write", code),
        "cli-default-stack",
    )
    .await;
    assert_eq!(output(&actual)["native"]["threads"], true);
    let (status, restored) =
        request(cli_base, reqwest::Method::GET, "/runs/smoke", Value::Null).await;
    assert_eq!(status, 200);
    assert_eq!(restored, record);
    unsafe {
        assert_eq!(libc::kill(cli.id().unwrap() as i32, libc::SIGINT), 0);
    }
    assert!(
        tokio::time::timeout(Duration::from_secs(15), cli.wait())
            .await
            .unwrap()
            .unwrap()
            .success()
    );
    // The real helper is exec'd through a trusted test launcher that asks
    // seccomp to deny mounts. Confinement failure must never run the artifact.
    let wrapper = work.join("mount-denying-helper");
    let compiled = Command::new("/usr/bin/cc")
        .args(["-Wall", "-Wextra", "-Werror", "-O2"])
        .arg(format!("-DREAL_HELPER={HELPER:?}"))
        .arg(Path::new(env!("CARGO_MANIFEST_DIR")).join("tests/process_tree/probe.c"))
        .arg("-o")
        .arg(&wrapper)
        .output()
        .unwrap();
    assert!(
        compiled.status.success(),
        "{}",
        String::from_utf8_lossy(&compiled.stderr)
    );
    let auth = Authorizer::new(vec![(
        ADMIN.into(),
        [
            Scope::Read,
            Scope::Edit,
            Scope::Publish,
            Scope::Resources,
            Scope::Execute,
        ]
        .into(),
    )])
    .unwrap();
    let denied = KernelHost::open(&work.join("denied-state"), Default::default(), auth)
        .await
        .unwrap()
        .with_loader_helper(&wrapper)
        .unwrap();
    denied.loader().images.put(captured.clone()).unwrap();
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let base = format!("http://{}", listener.local_addr().unwrap());
    let server = tokio::spawn(axum::serve(listener, denied.router()).into_future());
    let worker_host = denied.clone();
    let worker =
        tokio::spawn(async move { worker_host.run_worker(CancellationToken::new(), 1).await });
    let forbidden = "import os\nfrom pathlib import Path\nPath(os.environ['NOFY_DIRECTORY_PROJECT'],'must-not-run').write_text('unconfined')\nprint('{}')\n";
    let result = execute(
        &base,
        document(
            &captured,
            &config.cgroup_root,
            &project,
            "read_write",
            forbidden,
        ),
        "mount-denied",
    )
    .await;
    assert!(
        result["execution"]
            .to_string()
            .contains("required tree confinement failed"),
        "{result}"
    );
    assert!(!project.join("must-not-run").exists());
    idle(&denied.loader().process_trees).await;
    denied.shutdown();
    worker.await.unwrap().unwrap();
    server.abort();
    fs::write(work.join("guest-passed.json"), b"{\"passed\":true}").unwrap();
}
#[test]
fn delegated_guest() {
    let Ok(work) = std::env::var("NOFY_TREE_GUEST_WORK") else {
        return;
    };
    let work = PathBuf::from(work);
    let own = fs::read_to_string("/proc/self/cgroup").unwrap();
    let unit = Path::new("/sys/fs/cgroup").join(
        own.lines()
            .find_map(|l| l.strip_prefix("0::"))
            .unwrap()
            .trim_start_matches('/'),
    );
    fs::create_dir(unit.join("kernel")).unwrap();
    fs::write(unit.join("kernel/cgroup.procs"), "0").unwrap();
    fs::write(unit.join("cgroup.subtree_control"), "+cpu +memory +pids").unwrap();
    let root = unit.join("jobs");
    fs::create_dir(&root).unwrap();
    fs::write(root.join("cgroup.subtree_control"), "+cpu +memory +pids").unwrap();
    tokio::runtime::Builder::new_multi_thread()
        .worker_threads(2)
        .thread_stack_size(nofy_agent_host::WORKER_STACK_BYTES)
        .enable_all()
        .build()
        .unwrap()
        .block_on(run(
            &work,
            Config {
                cgroup_root: root,
                limits: Limits::default(),
            },
        ));
}
#[test]
fn real_confined_declarative_tool_runs_in_separate_delegation() {
    let directory = tempfile::tempdir().unwrap();
    let output = Command::new("systemd-run")
        .args([
            "--user",
            "--wait",
            "--pipe",
            "--collect",
            "--quiet",
            "--property",
            "Delegate=yes",
            "--setenv",
        ])
        .arg(format!(
            "NOFY_TREE_GUEST_WORK={}",
            directory.path().display()
        ))
        .arg(std::env::current_exe().unwrap())
        .args(["--exact", "confined::delegated_guest", "--nocapture"])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "{}\n{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    assert_eq!(
        fs::read(directory.path().join("guest-passed.json")).unwrap(),
        b"{\"passed\":true}"
    );
}
