//! Actual user-installed Python modules and GCC, without dependency images.
#![allow(clippy::disallowed_methods)] // test fixture processes are killed or waited on by the test that spawns them
use super::command::{approve, module, post, request, submit};
use super::*;

fn environment(dependency: &Path) -> Value {
    json!({"executable":"/usr/bin/python3","prefix_args":["-s","-B"],
        "env":{"PATH":"/usr/bin:/bin","LANG":"C.UTF-8","PYTHONPATH":dependency},
        "paths":[{"path":"/usr","execute":true},{"path":"/lib","execute":true},
            {"path":"/lib64","execute":true},{"path":"/etc/ld.so.cache"},{"path":dependency}]})
}

fn packed(work: &Path, project: &Path, dependency: &Path, venv: &Path, config: &Config) -> Value {
    let settings = work.join("local-settings.json");
    let target = work.join("local-deployment.json");
    fs::write(
        &settings,
        serde_json::to_vec(&json!({"workspace":project,
        "environment":environment(dependency),"process_tree":config,"model":"not-called",
        "connection":{"base_url":"http://127.0.0.1:9/v1/","allow_insecure_http":true,
            "models":["not-called"],"header_credentials":{}}}))
        .unwrap(),
    )
    .unwrap();
    let output = Command::new("/usr/bin/python3")
        .arg("-B")
        .arg(Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../presets/coding/build.py"))
        .arg("--settings")
        .arg(&settings)
        .arg("--output")
        .arg(&target)
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    let mut package: Value = serde_json::from_slice(&fs::read(target).unwrap()).unwrap();
    assert_eq!(package["runtime_sources"], json!([]));
    assert!(package.get("runtime_images").is_none());
    let system = &mut package["system"];
    assert_eq!(system["programs"].as_object().unwrap().len(), 1);
    let command = module(system, "command")["reference"].clone();
    system["programs"]["command-check"] = json!({"kind":"tool",
        "definition":{"name":"command-check","tool_packs":[command]},
        "call":{"id":"command","name":"run_command","arguments":{"argv":["/usr/bin/python3","-B","-c","print(42)"]}}});
    let read = module(system, "file-read")["reference"].clone();
    system["programs"]["read-check"] = json!({"kind":"tool",
        "definition":{"name":"read-check","tool_packs":[read]},
        "call":{"id":"read","name":"read_file","arguments":{"path":"source/calc.py"}}});
    let reference = |id: &str| json!({"id":id,"version":"1"});
    let runtime = module(system, "runtime")["reference"].clone();
    let code = "import os,sys,json,user_math\nassert json.load(sys.stdin)=={}\ntry:\n child=os.fork()\n if child==0: os._exit(0)\n os.waitpid(child,0)\n denied=False\nexcept PermissionError: denied=True\nprint(json.dumps({'total':user_math.total([12,20]),'fork_denied':denied}))\n";
    system["modules"].as_array_mut().unwrap().extend([
        json!({"reference":reference("local-code"),"factory":"resource.artifact","config":{"bundle":{"schema_version":1,"files":{"main.py":code}}}}),
        json!({"reference":reference("local-probe"),"factory":"tool.process_artifact","config":{"contract":{"name":"local_probe"},"entrypoint":"main.py"},
            "dependencies":{"environment":runtime,"artifact":reference("local-code")}}),
    ]);
    system["programs"]["single-check"] = json!({"kind":"tool","definition":{"name":"single-check","tool_packs":[reference("local-probe")]},
        "call":{"id":"probe","name":"local_probe","arguments":{}}});
    let mut local_venv = environment(venv);
    local_venv["executable"] = json!(venv.join("bin/python3"));
    local_venv["env"]
        .as_object_mut()
        .unwrap()
        .remove("PYTHONPATH");
    local_venv["paths"]
        .as_array_mut()
        .unwrap()
        .last_mut()
        .unwrap()["execute"] = json!(true);
    let tree = module(system, "process-tree")["reference"].clone();
    system["modules"].as_array_mut().unwrap().extend([
        json!({"reference":reference("venv-environment"),"factory":"resource.process_local","config":local_venv}),
        json!({"reference":reference("venv-code"),"factory":"resource.artifact","config":{"bundle":{"schema_version":1,
            "files":{"main.py":"import sys,json,venv_math\nassert json.load(sys.stdin)=={}\nprint(json.dumps({'total':venv_math.total([12,20]),'prefix':sys.prefix}))\n"}}}}),
        json!({"reference":reference("venv-single"),"factory":"tool.process_artifact","config":{"contract":{"name":"local_probe"},"entrypoint":"main.py"},
            "dependencies":{"environment":reference("venv-environment"),"artifact":reference("venv-code")}}),
        json!({"reference":reference("venv-tree"),"factory":"tool.process_tree_artifact","config":{"contract":{"name":"local_probe"},"entrypoint":"main.py"},
            "dependencies":{"environment":reference("venv-environment"),"artifact":reference("venv-code"),"tree":tree}}),
    ]);
    for id in ["venv-single", "venv-tree"] {
        system["programs"][id] = json!({"kind":"tool","definition":{"name":id,"tool_packs":[reference(id)]},
            "call":{"id":"probe","name":"local_probe","arguments":{}}});
    }
    // An added tool needs explicit authority, even at a diagnostic Tool root.
    // Update this known policy node and its sole upstream reference exactly.
    let floor = system["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|m| m["reference"]["id"] == "floor")
        .unwrap();
    floor["config"]["allowed"]
        .as_array_mut()
        .unwrap()
        .push(json!("local_probe"));
    let mut body = floor.as_object().unwrap().clone();
    body.remove("reference");
    body.insert("id".into(), json!("floor"));
    floor["reference"]["version"] =
        json!(nofy_agent_runtime::system::content_digest(&body).unwrap());
    let floor_reference = floor["reference"].clone();
    for reference in system["required_policies"].as_array_mut().unwrap() {
        if reference["id"] == "floor" {
            *reference = floor_reference.clone();
        }
    }
    package
}

async fn tool_run(base: &str, release: &Value, id: &str, program: &str) -> Value {
    post(
        base,
        "/runs",
        json!({"run_id":id,"thread_id":id,"system":"coding","release":release,"program":program}),
    )
    .await;
    settled(base, id).await
}

async fn command(base: &str, release: &Value, id: &str, input: Value) -> Value {
    let paused = submit(base, release, id, input).await;
    assert_eq!(paused["execution"]["status"], "paused", "{paused}");
    let record = approve(base, id).await;
    let value = output(&record);
    assert_eq!(value["ok"], true, "{value}");
    assert_eq!(value["result"]["exit_code"], 0, "{value}");
    record
}

async fn run(work: &Path, config: Config) {
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
    let state = work.join("state");
    let credentials = Arc::new(
        nofy_agent_runtime::credentials::EnvironmentCredentials::new(
            "local",
            "NOFY_LOCAL_TEST_SECRET_",
        )
        .unwrap(),
    );
    let registry = nofy_agent_host::native::registry(credentials).unwrap();
    let host = KernelHost::open(&state, registry, auth)
        .await
        .unwrap()
        .with_loader_helper(Path::new(HELPER))
        .unwrap();
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let base = format!("http://{}", listener.local_addr().unwrap());
    let server = tokio::spawn(axum::serve(listener, host.router()).into_future());
    let stop = CancellationToken::new();
    let worker_host = host.clone();
    let worker_stop = stop.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 2).await });
    let project = workspace(work, "project");
    fs::create_dir(project.join("source")).unwrap();
    fs::write(
        project.join("source/calc.py"),
        "def total(values):\n    return sum(values)\n",
    )
    .unwrap();
    let dependency = work.join("provided-environment");
    let venv = work.join("user-venv");
    let created = Command::new("/usr/bin/python3")
        .args(["-B", "-m", "venv", "--without-pip"])
        .arg(&venv)
        .output()
        .unwrap();
    assert!(
        created.status.success(),
        "{}",
        String::from_utf8_lossy(&created.stderr)
    );
    let location = Command::new(venv.join("bin/python3"))
        .args([
            "-B",
            "-c",
            "import sysconfig;print(sysconfig.get_path('purelib'))",
        ])
        .output()
        .unwrap();
    assert!(location.status.success());
    let site = PathBuf::from(String::from_utf8(location.stdout).unwrap().trim());
    assert!(site.starts_with(&venv));
    fs::write(
        site.join("venv_math.py"),
        "def total(values):\n    return sum(values)\n",
    )
    .unwrap();
    let package = packed(work, &project, &dependency, &venv, &config);
    let (status, preview) =
        request(&base, reqwest::Method::POST, "/validate", package.clone()).await;
    assert_eq!(status, 200, "{preview}");
    assert!(!dependency.exists());
    let (status, refused) = request(&base, reqwest::Method::POST, "/import", package.clone()).await;
    assert!(status >= 400, "{refused}");
    fs::create_dir(&dependency).unwrap();
    fs::write(
        dependency.join("user_math.py"),
        "def total(values):\n    return sum(values)\n",
    )
    .unwrap();
    fs::copy("/usr/bin/true", dependency.join("noexec")).unwrap();
    let imported = post(&base, "/import", package).await;
    let release = imported["bundle"]["digest"].clone();
    let apply = json!({"command_id":"local-activate","system":"coding","release":release,"expected_generation":null});
    let activated = post(&base, "/apply", apply.clone()).await;
    assert_eq!(post(&base, "/apply", apply).await, activated);
    let mut records = BTreeMap::new();
    let single = tool_run(&base, &release, "local-single", "single-check").await;
    let value = output(&single);
    assert_eq!(value["total"], 32, "local-single: {value}");
    assert_eq!(value["fork_denied"], true);
    records.insert("local-single", single);
    let read = tool_run(&base, &release, "local-file-read", "read-check").await;
    assert_eq!(
        output(&read)["result"]["text"],
        "def total(values):\n    return sum(values)\n"
    );
    records.insert("local-file-read", read);
    for (id, program) in [
        ("local-venv-single", "venv-single"),
        ("local-venv-tree", "venv-tree"),
    ] {
        let record = tool_run(&base, &release, id, program).await;
        let value = output(&record);
        assert_eq!(value["total"], 32, "{id}: {value}");
        assert_eq!(value["prefix"], venv.to_str().unwrap());
        records.insert(id, record);
    }

    // Actual GCC executes in the guest. No host-side compiler result is reused.
    fs::write(project.join("main.c"), "#include <stdio.h>\n#include <math.h>\nint main(void){volatile double v=9.0;printf(\"sum=32 sqrt=%.3f\\n\",sqrt(v));return 0;}\n").unwrap();
    let compiled = command(&base, &release, "local-gcc", json!({"argv":["/usr/bin/gcc","-Wall","-Wextra","-Werror","-O2","main.c","-lm","-o","program"],"max_output_bytes":65536})).await;
    assert!(project.join("program").is_file());
    records.insert("local-gcc", compiled);
    let executed = command(
        &base,
        &release,
        "local-native-execute",
        json!({"argv":["./program"]}),
    )
    .await;
    assert_eq!(output(&executed)["result"]["stdout"], "sum=32 sqrt=3.000\n");
    records.insert("local-native-execute", executed);
    let external = command(&base, &release, "local-python-module", json!({"argv":["/usr/bin/python3","-s","-B","-c","import user_math;print(user_math.total([12,20]))"]})).await;
    assert_eq!(output(&external)["result"]["stdout"], "32\n");
    records.insert("local-python-module", external);
    fs::write(
        dependency.join("user_math.py"),
        "def total(values):\n    return sum(values) + 1\n",
    )
    .unwrap();
    let updated = tool_run(&base, &release, "local-module-updated", "single-check").await;
    assert_eq!(output(&updated)["total"], 33);
    records.insert("local-module-updated", updated);

    let private = state.join("private-local-witness");
    fs::write(&private, b"kernel-private").unwrap();
    let probe = format!(
        r#"import json,subprocess
from pathlib import Path
checks={{}}
try: Path({:?}).read_bytes();checks['private_denied']=False
except OSError: checks['private_denied']=True
try: Path({:?}).write_text('must-not-change');checks['dependency_readonly']=False
except OSError: checks['dependency_readonly']=True
try: subprocess.run([{noexec:?}],check=True);checks['dependency_noexec']=False
except PermissionError: checks['dependency_noexec']=True
print(json.dumps(checks))
"#,
        private.to_str().unwrap(),
        dependency.join("user_math.py").to_str().unwrap(),
        noexec = dependency.join("noexec").to_str().unwrap()
    );
    let denied = command(
        &base,
        &release,
        "local-authority",
        json!({"argv":["/usr/bin/python3","-s","-B","-c",probe]}),
    )
    .await;
    let checks: Value =
        serde_json::from_str(output(&denied)["result"]["stdout"].as_str().unwrap()).unwrap();
    assert!(
        checks.as_object().unwrap().values().all(|v| v == true),
        "{checks}"
    );
    assert_eq!(fs::read(&private).unwrap(), b"kernel-private");
    assert!(
        fs::read_to_string(dependency.join("user_math.py"))
            .unwrap()
            .contains("+ 1")
    );
    records.insert("local-authority", denied);
    let once_args = json!({"argv":["/usr/bin/python3","-B","-c","from pathlib import Path;p=Path('effect-count');p.write_text(str(int(p.read_text())+1) if p.exists() else '1')"]});
    let once = command(&base, &release, "local-effect-once", once_args.clone()).await;
    records.insert("local-effect-once", once);
    assert_eq!(fs::read(project.join("effect-count")).unwrap(), b"1");

    // The ordinary cancel API must reclaim detached descendants in local mode.
    let daemon = "import os,time;from pathlib import Path\nchild=os.fork()\nif child==0:\n os.setsid()\n if os.fork(): os._exit(0)\n while True: time.sleep(.02)\nos.waitpid(child,0)\nPath('local-ready.json').write_text('{}')\nwhile True: time.sleep(.02)\n";
    let paused = submit(
        &base,
        &release,
        "local-cancel",
        json!({"argv":["/usr/bin/python3","-B","-c",daemon]}),
    )
    .await;
    assert_eq!(paused["execution"]["status"], "paused");
    let approving_base = base.clone();
    let approving = tokio::spawn(async move { approve(&approving_base, "local-cancel").await });
    wait_json(&project.join("local-ready.json")).await;
    let fds = witnesses(&only_group(&config.cgroup_root));
    post(
        &base,
        "/runs/local-cancel/cancel",
        json!({"command_id":"stop-local-tree"}),
    )
    .await;
    let cancelled = approving.await.unwrap();
    assert_eq!(cancelled["execution"]["status"], "cancelled", "{cancelled}");
    records.insert("local-cancel", cancelled);
    idle(&host.loader().process_trees).await;
    all_dead(&fds).await;

    // Missing user dependencies gate new execution, not historical facts.
    let retired = work.join("temporarily-uninstalled");
    fs::rename(&dependency, &retired).unwrap();
    let (status, unavailable) = request(
        &base,
        reqwest::Method::POST,
        "/runs",
        json!({"run_id":"local-missing-env","thread_id":"local-missing-env",
        "system":"coding","release":release,"program":"single-check"}),
    )
    .await;
    assert!(status >= 400, "{unavailable}");
    for (id, expected) in &records {
        let (status, restored) = request(
            &base,
            reqwest::Method::GET,
            &format!("/runs/{id}"),
            Value::Null,
        )
        .await;
        assert_eq!(status, 200, "{restored}");
        assert_eq!(&restored, expected);
    }
    host.shutdown();
    stop.cancel();
    worker.await.unwrap().unwrap();
    server.abort();
    let access = work.join("local-access.json");
    fs::write(&access, serde_json::to_vec(&json!([{"token_env":"NOFY_LOCAL_ACCESS","scopes":["read","edit","publish","resources","execute"]}])).unwrap()).unwrap();
    let mut cli = tokio::process::Command::new(HELPER)
        .args(["--listen", "127.0.0.1:0", "--state-dir"])
        .arg(&state)
        .arg("--access-file")
        .arg(&access)
        .env_remove("RUST_MIN_STACK")
        .env("NOFY_LOCAL_ACCESS", ADMIN)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .kill_on_drop(true)
        .spawn()
        .unwrap();
    use tokio::io::AsyncBufReadExt;
    let mut errors = tokio::io::BufReader::new(cli.stderr.take().unwrap()).lines();
    let line = tokio::time::timeout(crate::KERNEL_START, errors.next_line())
        .await
        .unwrap()
        .unwrap()
        .unwrap();
    let cli_base = line.strip_prefix("Nofy kernel listening on ").unwrap();
    for (id, expected) in &records {
        let (status, actual) = request(
            cli_base,
            reqwest::Method::GET,
            &format!("/runs/{id}"),
            Value::Null,
        )
        .await;
        assert_eq!(status, 200, "{actual}");
        assert_eq!(&actual, expected);
    }
    post(
        cli_base,
        "/runs",
        json!({"run_id":"local-effect-once","thread_id":"local-effect-once","system":"coding",
        "release":release,"program":"command-check","parameters":once_args}),
    )
    .await;
    assert_eq!(fs::read(project.join("effect-count")).unwrap(), b"1");
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
    fs::rename(&retired, &dependency).unwrap();
    for path in ["objects", "trees"] {
        assert_eq!(
            fs::read_dir(state.join("loader/images").join(path))
                .unwrap()
                .count(),
            0
        );
    }
    fs::write(work.join("local-passed.json"), serde_json::to_vec(&json!({
        "passed":true,"source_only_no_images":true,"single_process_custom_module":true,"single_process_fork_denied":true,
        "actual_guest_gcc_compile_execute":true,"user_dependency_update_without_relock":true,
        "readonly_and_noexec_dependencies":true,"private_state_denied":true,"exact_approvals":true,
        "cancel_detached_descendants":true,"missing_environment_rejects_new_work":true,
        "actual_cli_restore_without_environment":true,"completed_effect_not_repeated":true,
        "actual_venv_site_packages_single_and_tree":true,
        "restored_records":records.len(),"native_stdout":"sum=32 sqrt=3.000\n"
    })).unwrap()).unwrap();
}

#[test]
fn delegated_local_environment() {
    let Ok(work) = std::env::var("NOFY_LOCAL_ENV_WORK") else {
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
fn real_user_provisioned_dependencies_run_without_images() {
    let temporary = tempfile::tempdir().unwrap();
    let work = match std::env::var("NOFY_LOCAL_ENV_EVIDENCE") {
        Ok(path) => {
            let path = PathBuf::from(path);
            fs::create_dir(&path).unwrap();
            path
        }
        Err(_) => temporary.path().to_path_buf(),
    };
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
        .arg(format!("NOFY_LOCAL_ENV_WORK={}", work.display()))
        .arg(std::env::current_exe().unwrap())
        .args([
            "--exact",
            "confined::local::delegated_local_environment",
            "--nocapture",
        ])
        .output()
        .unwrap();
    assert!(
        output.status.success(),
        "{}\n{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    let report: Value =
        serde_json::from_slice(&fs::read(work.join("local-passed.json")).unwrap()).unwrap();
    assert_eq!(report["passed"], true);
    assert_eq!(report["restored_records"], 11);
}
