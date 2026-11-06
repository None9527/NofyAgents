//! Actual external preset, selected runtime dependencies and command effects.
#![allow(clippy::disallowed_methods)] // test fixture processes are killed or waited on by the test that spawns them
use super::*;

fn selected_image(work: &Path) -> RuntimeImage {
    let compiled = Command::new("/usr/bin/cc")
        .args(["-Wall", "-Wextra", "-Werror", "-O2", "-pthread"])
        .arg(Path::new(env!("CARGO_MANIFEST_DIR")).join("tests/process_tree/probe.c"))
        .arg("-o")
        .arg(work.join("native-probe"))
        .output()
        .unwrap();
    assert!(
        compiled.status.success(),
        "{}",
        String::from_utf8_lossy(&compiled.stderr)
    );
    // Fixture-only discovery over trusted installed modules. Production capture
    // still requires an explicit definition and executes no user source.
    let output = Command::new("/usr/bin/python3").args(["-I", "-S", "-B", "-c", r#"
import sys,sysconfig,json
from pathlib import Path
from importlib import import_module
for name in ('selectors','signal','subprocess','threading','dataclasses','fcntl','hashlib','uuid','fnmatch','unittest','compileall','py_compile','shutil','textwrap','encodings.ascii','encodings.latin_1'):
 import_module(name)
root=Path(sysconfig.get_path('stdlib')).resolve()
files={}
for module in list(sys.modules.values()):
 name=getattr(module,'__file__',None)
 if name:
  path=Path(name).resolve()
  if path.is_file() and path.is_relative_to(root): files[str(path.relative_to(root))]=str(path)
for name in ('unittest/__main__.py',): files[name]=str(root/name)
print(json.dumps({'version':str(sys.version_info.major)+'.'+str(sys.version_info.minor),'files':files}))
"#]).output().unwrap();
    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    let info: Value = serde_json::from_slice(&output.stdout).unwrap();
    let version = info["version"].as_str().unwrap();
    let mut files = BTreeMap::from([
        (
            "bin/python".to_owned(),
            fs::canonicalize("/usr/bin/python3").unwrap(),
        ),
        ("bin/probe".to_owned(), work.join("native-probe")),
    ]);
    for (name, source) in info["files"].as_object().unwrap() {
        files.insert(
            format!("lib/python{version}/{name}"),
            PathBuf::from(source.as_str().unwrap()),
        );
    }
    let binaries: Vec<_> = files
        .iter()
        .filter(|(name, _)| name.starts_with("bin/") || name.ends_with(".so"))
        .map(|(_, path)| path.clone())
        .collect();
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
                let original = path.strip_prefix("/").unwrap().to_str().unwrap().to_owned();
                files.insert(original.clone(), path.clone());
                if name.starts_with("ld-linux-") {
                    loader = Some(original);
                }
            }
        }
    }
    let image = RuntimeImage::capture(serde_json::from_value(json!({
        "id":"coding-command-selected", "executable":"bin/python", "loader":loader.unwrap(),
        "library_dirs":["lib"], "prefix_args":["-S","-s","-B"],
        "env":{"PYTHONHOME":{"kind":"path","path":"."},"LD_LIBRARY_PATH":{"kind":"path","path":"lib"}},
        "files":files, "executable_files":["bin/probe"]
    })).unwrap()).unwrap();
    let wire = serde_json::to_vec(&image).unwrap().len();
    assert!(
        image.manifest.files.len() < 250,
        "selected closure unexpectedly grew"
    );
    assert!(
        wire < 12 * 1024 * 1024,
        "selected closure unexpectedly grew: {wire}"
    );
    fs::write(
        work.join("command-image-size.json"),
        serde_json::to_vec(&json!({
            "files":image.manifest.files.len(), "wire_bytes":wire,
            "decoded_bytes":image.manifest.files.values().map(|file| file.size).sum::<u64>(),
            "gcc_included":false, "full_standard_library_included":false
        }))
        .unwrap(),
    )
    .unwrap();
    image
}

pub(super) fn module(system: &Value, id: &str) -> Value {
    system["modules"]
        .as_array()
        .unwrap()
        .iter()
        .find(|m| m["reference"]["id"] == id)
        .unwrap()
        .clone()
}

fn packed(
    repository: &crate::dependencies::Repository,
    work: &Path,
    image: &RuntimeImage,
    config: &Config,
    project: &Path,
    enabled: bool,
    source: Option<&Path>,
    terminal: Option<&RuntimeImage>,
) -> Value {
    let input = tempfile::tempdir_in(work).unwrap();
    let settings = input.path().join("settings.json");
    let dependencies = input.path().join("dependencies.lock.json");
    let target = input.path().join("deployment.json");
    let mut values = json!({"workspace":project,"terminal_enabled":enabled,"model":"no-model-is-called",
        "connection":{"base_url":"http://127.0.0.1:9/v1/","allow_insecure_http":true,
        "models":["no-model-is-called"],"header_credentials":{}}});
    if enabled {
        values["process_tree"] = serde_json::to_value(config).unwrap();
    }
    fs::write(&settings, serde_json::to_vec(&values).unwrap()).unwrap();
    let mut runtimes = json!({"files":repository.requirement(image)});
    if let Some(image) = terminal {
        runtimes["command"] = repository.requirement(image);
    }
    fs::write(
        &dependencies,
        serde_json::to_vec(&json!({
            "format":"nofy.dependencies/v1","runtimes":runtimes
        }))
        .unwrap(),
    )
    .unwrap();
    let default_source = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../presets/coding");
    let mut command = Command::new("/usr/bin/python3");
    command
        .args(["-B"])
        .arg(source.unwrap_or(&default_source).join("build.py"))
        .arg("--settings")
        .arg(settings)
        .arg("--dependency-lock")
        .arg(dependencies)
        .arg("--output")
        .arg(&target);
    let output = command.output().unwrap();
    assert!(
        output.status.success(),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    serde_json::from_slice(&fs::read(target).unwrap()).unwrap()
}

fn copy_source(source: &Path, destination: &Path) {
    fs::create_dir_all(destination).unwrap();
    for entry in fs::read_dir(source).unwrap() {
        let entry = entry.unwrap();
        if entry.file_name() == "tests" || entry.file_name() == "__pycache__" {
            continue;
        }
        let target = destination.join(entry.file_name());
        if entry.file_type().unwrap().is_dir() {
            copy_source(&entry.path(), &target);
        } else {
            assert!(entry.file_type().unwrap().is_file());
            fs::copy(entry.path(), target).unwrap();
        }
    }
}

fn add_entry(source: &mut Value) {
    let command = module(source, "command")["reference"].clone();
    source["programs"]["command-check"] = json!({"kind":"tool",
        "definition":{"name":"command-check","tool_packs":[command]},
        "call":{"id":"command","name":"run_command","arguments":{"argv":["/bin/probe"]}}});
    let read = module(source, "file-read")["reference"].clone();
    source["programs"]["read-check"] = json!({"kind":"tool",
        "definition":{"name":"read-check","tool_packs":[read]},
        "call":{"id":"read","name":"read_file","arguments":{"path":"source/calc.py"}}});
}

pub(super) async fn post(base: &str, path: &str, value: Value) -> Value {
    let (status, result) = request(base, reqwest::Method::POST, path, value).await;
    assert!(status < 300, "{path}: {status}: {result}");
    result
}

pub(super) async fn request(
    base: &str,
    method: reqwest::Method,
    path: &str,
    value: Value,
) -> (u16, Value) {
    let response = reqwest::Client::new()
        .request(method, format!("{base}/api/v1{path}"))
        .bearer_auth(ADMIN)
        .json(&value)
        .send()
        .await
        .unwrap();
    let status = response.status().as_u16();
    let bytes = response.bytes().await.unwrap();
    let value = if bytes.is_empty() {
        Value::Null
    } else {
        serde_json::from_slice(&bytes).unwrap_or_else(|_| json!({"non_json_response":String::from_utf8_lossy(&bytes).chars().take(4096).collect::<String>()}))
    };
    (status, value)
}

pub(super) async fn submit(base: &str, release: &Value, id: &str, input: Value) -> Value {
    post(
        base,
        "/runs",
        json!({"run_id":id,"thread_id":id,"system":"coding",
        "release":release,"program":"command-check","parameters":input}),
    )
    .await;
    settled(base, id).await
}

pub(super) async fn approve(base: &str, id: &str) -> Value {
    let (status, approvals) = request(
        base,
        reqwest::Method::GET,
        &format!("/runs/{id}/approvals"),
        Value::Null,
    )
    .await;
    assert_eq!(status, 200);
    assert_eq!(approvals.as_array().unwrap().len(), 1, "{approvals}");
    let approval = &approvals[0];
    assert_eq!(approval["call"]["name"], "run_command");
    let mut forged = approval.clone();
    forged["call"]["arguments"]["argv"] = json!(["/unapproved-forged-command"]);
    assert_eq!(
        request(
            base,
            reqwest::Method::POST,
            &format!("/runs/{id}/approvals"),
            json!({"request":forged,"allow":true})
        )
        .await
        .0,
        409
    );
    assert_eq!(
        request(
            base,
            reqwest::Method::POST,
            &format!("/runs/{id}/approvals"),
            json!({"request":approval,"allow":true})
        )
        .await
        .0,
        204
    );
    let command = format!("resume-{id}");
    post(
        base,
        "/actions",
        json!({"command_id":command,"run_id":id,"command":{"kind":"resume"}}),
    )
    .await;
    tokio::time::timeout(Duration::from_secs(15), async {
        loop {
            let (status, receipt) = request(
                base,
                reqwest::Method::GET,
                &format!("/actions/{command}"),
                Value::Null,
            )
            .await;
            assert_eq!(status, 200, "{receipt}");
            if receipt["finished"] == true {
                assert!(receipt["error"].is_null(), "{receipt}");
                break;
            }
            tokio::time::sleep(Duration::from_millis(20)).await;
        }
    })
    .await
    .expect("command resume did not settle");
    settled(base, id).await
}

pub(super) async fn run(
    base: &str,
    host: &KernelHost,
    work: &Path,
    config: &Config,
    project: &Path,
) {
    let image = selected_image(work);
    let repository = crate::dependencies::Repository::new(host.loader()).await;
    assert_eq!(repository.requests(), 0);
    let probe = document(
        &image,
        &config.cgroup_root,
        project,
        "read_write",
        "import json,subprocess\np=subprocess.run(['/bin/probe'],stdout=subprocess.PIPE)\nprint(json.dumps({'exit_code':p.returncode,'native':json.loads(p.stdout)}))",
    );
    let diagnostic = execute(
        base,
        json!({"format":"nofy.deployment/v2","system":probe,
            "runtime_sources":[repository.requirement(&image)["source"]]}),
        "command-native-diagnostic",
    )
    .await;
    let native = output(&diagnostic);
    assert_eq!(native["native"]["pipe_nonblocking"], true, "{native}");
    assert_eq!(native["native"]["ioctl_denials"], true, "{native}");
    assert_eq!(native["exit_code"], 0, "{native}");
    assert_eq!(repository.requests(), 1);
    idle(&host.loader().process_trees).await;
    let disabled = packed(
        &repository,
        work,
        &image,
        config,
        project,
        false,
        None,
        None,
    );
    let absent = [
        "command",
        "command-code",
        "terminal-runtime",
        "process-tree",
        "project-execute",
    ];
    assert!(
        disabled["system"]["modules"]
            .as_array()
            .unwrap()
            .iter()
            .all(|m| !absent.contains(&m["reference"]["id"].as_str().unwrap()))
    );
    let (status, preview) =
        request_as(base, reqwest::Method::POST, "/validate", disabled, VIEW).await;
    assert_eq!(status, 200, "{preview}");
    let mut deployment = packed(&repository, work, &image, config, project, true, None, None);
    assert!(deployment.get("runtime_images").is_none());
    assert_eq!(deployment["runtime_sources"].as_array().unwrap().len(), 1);
    assert_eq!(
        repository.requests(),
        1,
        "packing and preview must not fetch dependencies"
    );
    let source = &mut deployment["system"];
    assert_eq!(source["programs"].as_object().unwrap().len(), 1);
    assert!(
        module(source, "write-approval")["config"]["tools"]
            .as_array()
            .unwrap()
            .contains(&json!("run_command"))
    );
    assert!(
        !module(source, "skills")["config"]["execution"]["tool_packs"]
            .as_array()
            .unwrap()
            .contains(&json!("command"))
    );
    add_entry(source);
    let first_source = source.clone();
    let (status, preview) = request_as(
        base,
        reqwest::Method::POST,
        "/validate",
        deployment.clone(),
        VIEW,
    )
    .await;
    assert_eq!(status, 200, "{preview}");
    let imported = post(base, "/import", deployment).await;
    assert_eq!(
        repository.requests(),
        1,
        "shared dependency must not be acquired twice"
    );
    let release = &imported["bundle"]["digest"];
    let activate = json!({"command_id":"command-activate","system":"coding","release":release,"expected_generation":null});
    let applied = post(base, "/apply", activate.clone()).await;
    assert_eq!(post(base, "/apply", activate).await, applied);
    // A real project compiles bytecode and runs its actual unit tests in guest.
    fs::create_dir(project.join("source")).unwrap();
    fs::write(
        project.join("source/calc.py"),
        "def total(values):\n    return sum(values)\n",
    )
    .unwrap();
    fs::write(project.join("source/test_calc.py"), "import unittest\nfrom calc import total\nclass Calc(unittest.TestCase):\n def test_total(self): self.assertEqual(total([3,5]),8)\n").unwrap();
    let code = "import compileall,subprocess,sys;from pathlib import Path;p=Path('command-count');p.write_text(str(int(p.read_text())+1) if p.exists() else '1');assert compileall.compile_dir('.',quiet=1);raise SystemExit(subprocess.call([sys.executable,'-S','-s','-B','-m','unittest','discover','-v']))";
    let input = json!({"argv":["/bin/python","-S","-s","-B","-c",code],"cwd":"source","max_output_bytes":65536});
    let paused = submit(base, release, "command-project-check", input.clone()).await;
    assert_eq!(paused["execution"]["status"], "paused", "{paused}");
    assert!(!project.join("source/__pycache__").exists());
    let complete = approve(base, "command-project-check").await;
    let result = output(&complete);
    assert_eq!(result["ok"], true, "{result}");
    assert_eq!(result["result"]["exit_code"], 0, "{result}");
    assert!(
        result["result"]["stderr"]
            .as_str()
            .unwrap()
            .contains("Ran 1 test"),
        "{result}"
    );
    assert!(project.join("source/__pycache__").is_dir());
    assert_eq!(
        fs::read(project.join("source/command-count")).unwrap(),
        b"1"
    );
    idle(&host.loader().process_trees).await;
    post(
        base,
        "/runs",
        json!({"run_id":"selected-runtime-file-read","thread_id":"selected-runtime-file-read",
        "system":"coding","release":release,"program":"read-check"}),
    )
    .await;
    let read = output(&settled(base, "selected-runtime-file-read").await);
    assert_eq!(read["ok"], true, "{read}");
    assert_eq!(
        read["result"]["text"], "def total(values):\n    return sum(values)\n",
        "{read}"
    );
    let duplex = json!({"argv":["/bin/python","-c","import os,sys;os.write(2,b'e'*60000);data=sys.stdin.buffer.read();os.write(1,data);os.write(2,b'done')"],"stdin":"x".repeat(65536),"max_output_bytes":131072});
    assert_eq!(
        submit(base, release, "command-duplex", duplex).await["execution"]["status"],
        "paused"
    );
    let duplex = output(&approve(base, "command-duplex").await);
    assert_eq!(duplex["ok"], true, "{duplex}");
    assert_eq!(duplex["result"]["stdout"], "x".repeat(65536));
    assert_eq!(
        duplex["result"]["stderr"],
        format!("{}done", "e".repeat(60000))
    );
    assert_eq!(duplex["result"]["stdin_bytes_written"], 65536);
    assert_eq!(duplex["result"]["observed_stderr_bytes"], 60004);
    idle(&host.loader().process_trees).await;
    // Failure is an application result, never a completed=success shortcut.
    for (id, input, error) in [
        (
            "command-nonzero",
            json!({"argv":["/bin/python","-c","from pathlib import Path;Path('failed-effect').write_text('once');raise SystemExit(7)"]}),
            "command_failed",
        ),
        (
            "command-deadline",
            json!({"argv":["/bin/python","-c","import time;time.sleep(30)"],"timeout_ms":100}),
            "timed_out",
        ),
        (
            "command-output-limit",
            json!({"argv":["/bin/python","-c","import os;os.write(1,b'x'*10000)"],"max_output_bytes":1024}),
            "output_limit",
        ),
    ] {
        assert_eq!(
            submit(base, release, id, input).await["execution"]["status"],
            "paused"
        );
        let result = output(&approve(base, id).await);
        assert_eq!(result["ok"], false, "{result}");
        assert_eq!(result["error"]["code"], error, "{result}");
        assert_eq!(result["error"]["effect"], "unknown");
        idle(&host.loader().process_trees).await;
    }
    assert_eq!(fs::read(project.join("failed-effect")).unwrap(), b"once");
    // Ordinary API cancellation must reap descendants that setsid/double-fork.
    let daemon = "import os,time;from pathlib import Path\np=os.fork()\nif p==0:\n os.setsid()\n if os.fork():os._exit(0)\n while True:time.sleep(.02)\nos.waitpid(p,0)\nPath('command-daemon-ready').write_text('{}')\nwhile True:time.sleep(.02)";
    assert_eq!(
        submit(
            base,
            release,
            "command-cancel",
            json!({"argv":["/bin/python","-c",daemon]})
        )
        .await["execution"]["status"],
        "paused"
    );
    // Resume asynchronously, since cancellation deliberately prevents completion.
    let (_, approvals) = request(
        base,
        reqwest::Method::GET,
        "/runs/command-cancel/approvals",
        Value::Null,
    )
    .await;
    assert_eq!(
        request(
            base,
            reqwest::Method::POST,
            "/runs/command-cancel/approvals",
            json!({"request":approvals[0],"allow":true})
        )
        .await
        .0,
        204
    );
    post(base, "/actions", json!({"command_id":"resume-command-cancel","run_id":"command-cancel","command":{"kind":"resume"}})).await;
    wait_json(&project.join("command-daemon-ready")).await;
    let fds = witnesses(&only_group(&config.cgroup_root));
    post(
        base,
        "/runs/command-cancel/cancel",
        json!({"command_id":"cancel-command"}),
    )
    .await;
    let cancelled = settled(base, "command-cancel").await;
    assert_eq!(cancelled["execution"]["status"], "cancelled", "{cancelled}");
    idle(&host.loader().process_trees).await;
    all_dead(&fds).await;
    // The pending run must keep its original external code across publication.
    assert_eq!(
        submit(
            base,
            release,
            "command-pending-v1",
            json!({"argv":["/bin/probe"]})
        )
        .await["execution"]["status"],
        "paused"
    );
    let source_root = work.join("preset-next");
    copy_source(
        &Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../presets/coding"),
        &source_root,
    );
    let code = source_root.join("modules/command/command.py");
    let before = fs::read_to_string(&code).unwrap();
    let after = before.replacen(
        "'status': reason,",
        "'edition': 'two', 'status': reason,",
        1,
    );
    assert_ne!(before, after);
    fs::write(code, after).unwrap();
    let mut separate = image.clone();
    separate.manifest.id = "coding-command-separate".into();
    let mut next = packed(
        &repository,
        work,
        &image,
        config,
        project,
        true,
        Some(&source_root),
        Some(&separate),
    );
    assert!(next.get("runtime_images").is_none());
    assert_eq!(next["runtime_sources"].as_array().unwrap().len(), 2);
    for id in [
        "runtime",
        "project-read",
        "project-write",
        "project-execute",
        "ledger",
        "quota",
        "approval",
        "write-approval",
        "floor",
        "scope",
        "skills",
        "process-tree",
    ] {
        assert_eq!(
            module(&first_source, id),
            module(&next["system"], id),
            "unexpected version churn: {id}"
        );
    }
    for id in ["command-code", "command", "terminal-runtime"] {
        assert_ne!(
            module(&first_source, id)["reference"],
            module(&next["system"], id)["reference"],
            "missing changed dependency: {id}"
        );
    }
    add_entry(&mut next["system"]);
    let next = post(base, "/import", next).await;
    assert_eq!(
        repository.requests(),
        2,
        "only the separately locked command dependency is new"
    );
    let next_release = &next["bundle"]["digest"];
    let plan = post(
        base,
        "/plan",
        json!({"system":"coding","release":next_release}),
    )
    .await;
    assert!(!plan["changes"].as_array().unwrap().is_empty(), "{plan}");
    post(base,"/apply",json!({"command_id":"command-next","system":"coding","release":next_release,"expected_generation":1})).await;
    let pinned = output(&approve(base, "command-pending-v1").await);
    assert_eq!(pinned["ok"], true, "{pinned}");
    assert!(pinned["result"]["edition"].is_null(), "{pinned}");
    assert_eq!(
        submit(
            base,
            next_release,
            "command-next-code",
            json!({"argv":["/bin/probe"]})
        )
        .await["execution"]["status"],
        "paused"
    );
    let changed = output(&approve(base, "command-next-code").await);
    assert_eq!(changed["ok"], true, "{changed}");
    assert_eq!(changed["result"]["edition"], "two", "{changed}");
    let native: Value =
        serde_json::from_str(changed["result"]["stdout"].as_str().unwrap()).unwrap();
    assert_eq!(native["pipe_nonblocking"], true, "{native}");
    assert_eq!(native["ioctl_denials"], true, "{native}");
    post(base,"/apply",json!({"command_id":"command-rollback","system":"coding","release":release,"expected_generation":2})).await;
    assert_eq!(
        submit(
            base,
            release,
            "command-old-code",
            json!({"argv":["/bin/probe"]})
        )
        .await["execution"]["status"],
        "paused"
    );
    let rolled_back = output(&approve(base, "command-old-code").await);
    assert_eq!(rolled_back["ok"], true, "{rolled_back}");
    assert!(rolled_back["result"]["edition"].is_null(), "{rolled_back}");
    post(base,"/runs",json!({"run_id":"command-project-check","thread_id":"command-project-check","system":"coding","release":release,"program":"command-check","parameters":input})).await;
    assert_eq!(
        request(
            base,
            reqwest::Method::GET,
            "/runs/command-project-check",
            Value::Null
        )
        .await
        .1,
        complete
    );
    assert_eq!(
        fs::read(project.join("source/command-count")).unwrap(),
        b"1"
    );
    idle(&host.loader().process_trees).await;
    fs::write(
        work.join("command-completed-record.json"),
        serde_json::to_vec(&complete).unwrap(),
    )
    .unwrap();
}

#[test]
fn delegated_commands() {
    let Ok(work) = std::env::var("NOFY_TREE_COMMAND_WORK") else {
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
    tokio::runtime::Builder::new_multi_thread().worker_threads(2)
        .thread_stack_size(nofy_agent_host::WORKER_STACK_BYTES).enable_all().build().unwrap()
        .block_on(async {
            let credentials = Arc::new(nofy_agent_runtime::credentials::EnvironmentCredentials::new("local", "NOFY_COMMAND_TEST_SECRET_").unwrap());
            let registry = nofy_agent_host::native::registry(credentials).unwrap();
            let auth = Authorizer::new(vec![
                (ADMIN.into(),[Scope::Read,Scope::Edit,Scope::Publish,Scope::Resources,Scope::Execute].into()),
                (VIEW.into(),[Scope::Read].into()),
            ]).unwrap();
            let host = KernelHost::open(&work.join("state"), registry, auth).await.unwrap()
                .with_loader_helper(Path::new(HELPER)).unwrap();
            let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
            let base = format!("http://{}",listener.local_addr().unwrap());
            let server = tokio::spawn(axum::serve(listener,host.router()).into_future());
            let stop = CancellationToken::new();
            let signal = stop.clone();
            let worker_host = host.clone();
            let worker = tokio::spawn(async move { worker_host.run_worker(signal,2).await });
            let project = workspace(&work,"project");
            run(&base,&host,&work,&Config{cgroup_root:root,limits:Limits::default()},&project).await;
            host.shutdown();stop.cancel();worker.await.unwrap().unwrap();server.abort();
            let access = work.join("access.json");
            fs::write(&access,serde_json::to_vec(&json!([{"token_env":"NOFY_COMMAND_ACCESS","scopes":["read","edit","publish","resources","execute"]}])).unwrap()).unwrap();
            let mut cli = tokio::process::Command::new(HELPER).args(["--listen","127.0.0.1:0","--state-dir"])
                .arg(work.join("state")).arg("--access-file").arg(access).env_remove("RUST_MIN_STACK")
                .env("NOFY_COMMAND_ACCESS",ADMIN).stdin(Stdio::null()).stdout(Stdio::null()).stderr(Stdio::piped())
                .kill_on_drop(true).spawn().unwrap();
            use tokio::io::AsyncBufReadExt;
            let mut errors = tokio::io::BufReader::new(cli.stderr.take().unwrap()).lines();
            let line = tokio::time::timeout(Duration::from_secs(10),errors.next_line()).await.unwrap().unwrap().unwrap();
            let base = line.strip_prefix("Nofy kernel listening on ").unwrap();
            let saved: Value = serde_json::from_slice(&fs::read(work.join("command-completed-record.json")).unwrap()).unwrap();
            let (status,restored)=request(base,reqwest::Method::GET,"/runs/command-project-check",Value::Null).await;
            assert_eq!(status,200);assert_eq!(restored,saved);
            assert_eq!(fs::read(project.join("failed-effect")).unwrap(),b"once");
            unsafe { assert_eq!(libc::kill(cli.id().unwrap() as i32,libc::SIGINT),0); }
            assert!(tokio::time::timeout(Duration::from_secs(15),cli.wait()).await.unwrap().unwrap().success());
            fs::write(work.join("command-passed.json"),b"{\"passed\":true}").unwrap();
        });
}

#[test]
fn real_external_command_preset_runs_with_selected_dependencies_and_reaps_cancellation() {
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
            "NOFY_TREE_COMMAND_WORK={}",
            directory.path().display()
        ))
        .arg(std::env::current_exe().unwrap())
        .args([
            "--exact",
            "confined::command::delegated_commands",
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
    assert_eq!(
        fs::read(directory.path().join("command-passed.json")).unwrap(),
        b"{\"passed\":true}"
    );
    println!(
        "selected runtime: {}",
        fs::read_to_string(directory.path().join("command-image-size.json")).unwrap()
    );
}
