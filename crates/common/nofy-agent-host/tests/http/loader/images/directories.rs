use super::*;

fn directory_source(
    image: &RuntimeImage,
    path: &Path,
    access: &str,
    code: &str,
    bind: bool,
) -> Value {
    let mut source = system(image, 2);
    source["modules"][0]["config"]["bundle"]["files"] = json!({"main.py":code});
    source["modules"][2]["config"]["contract"]["input_schema"] = json!({"type":"object"});
    source["modules"][2]["config"]["contract"]["effect"] = json!("non_idempotent");
    source["modules"]
        .as_array_mut()
        .unwrap()
        .push(json!({"reference":{"id":"project","version":"1"},
        "factory":"resource.directory","config":{"path":path,"access":access}}));
    if bind {
        source["modules"][2]["config"]["directories"] = json!({"WORKSPACE":"workspace"});
        source["modules"][2]["dependencies"]["workspace"] = json!({"id":"project","version":"1"});
    }
    source
}
fn portable(image: &RuntimeImage, system: Value) -> Value {
    json!({"format":"nofy.deployment/v1","system":system,"runtime_images":[image]})
}
async fn execute(server: &Serving, release: &str, id: &str, parameters: Value) -> Value {
    let mut request = run(release, id);
    request["parameters"] = parameters;
    post(server, "/api/v1/runs", request).await;
    settled(server, id).await
}
fn assert_completed(record: &Value) {
    assert_eq!(
        record["execution"]["status"], "completed",
        "{}",
        record["execution"]["error"]
    );
}
fn directory_config(source: &mut Value) -> &mut Value {
    &mut source["modules"][3]["config"]
}

#[tokio::test]
async fn directory_preview_is_pure_and_schema_bindings_and_persistent_preflight_are_strict() {
    let _serial = IMAGE_RUNS.lock().await;
    let image = image().await;
    let private = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    let (kernel, server) = hosted(private.path()).await;
    kernel.loader().images.put(image.clone()).unwrap();
    let missing = project.path().join("missing");
    let source = directory_source(&image, &missing, "read_only", "print('{}')", true);
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/validate",
            VIEW,
            source.clone()
        )
        .await
        .0,
        200
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/import",
            ADMIN,
            source.clone()
        )
        .await
        .0,
        422
    );
    assert!(!missing.exists());
    assert!(kernel.control().inspect().await.unwrap().is_none());
    let mut source = source;
    directory_config(&mut source)["path"] = json!(project.path());
    for mutation in 0..10 {
        let mut invalid = source.clone();
        match mutation {
            0 => directory_config(&mut invalid)["path"] = json!("/"),
            1 => directory_config(&mut invalid)["path"] = json!(private.path()),
            2 => directory_config(&mut invalid)["access"] = json!("all"),
            3 => directory_config(&mut invalid)["unknown"] = json!(true),
            4 => invalid["modules"][2]["config"]["directories"] = json!({"workspace":"workspace"}),
            5 => invalid["modules"][2]["config"]["directories"] = json!({"WORKSPACE":"artifact"}),
            6 => {
                invalid["modules"][2]["config"]["directories"] =
                    json!({"FIRST":"workspace","SECOND":"workspace"})
            }
            7 => {
                invalid["modules"][2]["dependencies"]["workspace"] =
                    json!({"id":"code","version":"1"})
            }
            8 => {
                invalid["modules"][2]["dependencies"]
                    .as_object_mut()
                    .unwrap()
                    .remove("workspace");
            }
            _ => invalid["modules"][2]["config"]["directories"] = json!({"9ROOT":"workspace"}),
        }
        let (status, error) = request(
            &server,
            reqwest::Method::POST,
            "/api/v1/validate",
            VIEW,
            invalid,
        )
        .await;
        assert_eq!(status, 422, "mutation {mutation}: {error}");
    }
    let (status, required) = request(
        &server,
        reqwest::Method::POST,
        "/api/v1/modules/dependencies",
        VIEW,
        json!({"factory":"tool.process_artifact","config":source["modules"][2]["config"]}),
    )
    .await;
    assert_eq!(status, 200);
    assert_eq!(required["dependencies"]["workspace"], "resource");
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/import",
            PUBLISH,
            source.clone()
        )
        .await
        .0,
        403
    );
    let alias = project.path().join("alias");
    std::os::unix::fs::symlink(private.path(), &alias).unwrap();
    directory_config(&mut source)["path"] = json!(alias);
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/import",
            ADMIN,
            source
        )
        .await
        .0,
        422
    );
    assert!(kernel.control().inspect().await.unwrap().is_none());
}

#[tokio::test]
async fn cached_directory_authority_is_rechecked_before_publication_and_direct_job_admission() {
    use nofy_agent_runtime::{
        supervisor::{RunSupervisor, jobs::ProgramSubmission},
        system::SystemFile,
    };
    let _serial = IMAGE_RUNS.lock().await;
    let image = image().await;
    let private = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    let root = project.path().join("project");
    std::fs::create_dir(&root).unwrap();
    let (kernel, _server) = hosted(private.path()).await;
    kernel.loader().images.put(image.clone()).unwrap();
    let source = directory_source(&image, &root, "read_only", "print('{}')", true);
    let file = kernel
        .loader()
        .resolve_file(serde_json::from_value(source).unwrap())
        .await
        .unwrap();
    let SystemFile::Source(source) = file else {
        panic!("source");
    };
    let compiled = kernel.control().prepare(source).unwrap();
    let submission = ProgramSubmission::for_program(
        compiled.program("compute").unwrap(),
        "missing-directory",
        "missing-directory",
        None,
    )
    .unwrap();
    std::fs::rename(&root, project.path().join("backup")).unwrap();
    assert!(
        kernel
            .control()
            .install_file(SystemFile::Locked(compiled.bundle.clone()))
            .await
            .is_err()
    );
    let supervisor = RunSupervisor::new(kernel.store().clone());
    assert!(supervisor.submit_program(submission.clone()).await.is_err());
    assert!(
        kernel
            .store()
            .execution_job("missing-directory")
            .await
            .unwrap()
            .is_none()
    );
    assert!(kernel.control().inspect().await.unwrap().is_none());
    std::fs::rename(project.path().join("backup"), &root).unwrap();
    kernel
        .control()
        .install_file(SystemFile::Locked(compiled.bundle.clone()))
        .await
        .unwrap();
    supervisor.submit_program(submission).await.unwrap();
}

const PROBE: &str = r#"import json, os, socket, sys
from pathlib import Path
args = json.load(sys.stdin)
root = Path(os.environ.get('NOFY_DIRECTORY_WORKSPACE', args['root']))
def attempt(function):
    try:
        return {'allowed': True, 'value': function()}
    except OSError as error:
        return {'allowed': False, 'errno': error.errno}
def mutate():
    directory = root / 'nested'
    directory.mkdir()
    (root / 'created.txt').write_text('external artifact write')
    (root / 'created.txt').rename(directory / 'result.txt')
    (root / 'temporary.txt').write_text('temporary')
    (root / 'temporary.txt').unlink()
    return (directory / 'result.txt').read_text()
def fork_probe():
    child = os.fork()
    if child == 0:
        os._exit(17)
    os.waitpid(child, 0)
    return True
result = {'read': attempt(lambda: (root / 'read.txt').read_text()),
    'write': attempt(mutate), 'outside': attempt(lambda: Path(args['outside']).read_text()),
    'link': attempt(lambda: (root / 'escape').read_text()),
    'metadata': attempt(lambda: os.chmod(root / 'read.txt', 0o777)),
    'spawn': attempt(fork_probe), 'network': attempt(lambda: socket.socket().close()),
    'symlink': attempt(lambda: (root / 'new-link').symlink_to(args['outside']))}
result['execute'] = attempt(lambda: os.execv(str(root / 'program'), ['program']))
print(json.dumps(result))
"#;

#[tokio::test]
async fn real_helper_enforces_per_tool_read_write_authority_without_ambient_project_or_process_access()
 {
    use std::os::unix::fs::PermissionsExt;
    let _serial = IMAGE_RUNS.lock().await;
    let image = image().await;
    let private = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    let secret = private.path().join("private-evidence.txt");
    std::fs::write(&secret, "kernel private evidence").unwrap();
    std::fs::write(project.path().join("read.txt"), "project evidence").unwrap();
    std::os::unix::fs::symlink(&secret, project.path().join("escape")).unwrap();
    std::fs::copy("/usr/bin/true", project.path().join("program")).unwrap();
    std::fs::set_permissions(
        project.path().join("program"),
        std::fs::Permissions::from_mode(0o700),
    )
    .unwrap();
    let (kernel, server) = hosted(private.path()).await;
    let stop = CancellationToken::new();
    let worker_host = kernel.clone();
    let signal = stop.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(signal, 1).await.unwrap() });
    for (id, access, bound, readable, writable) in [
        ("directory-read", "read_only", true, true, false),
        ("directory-unbound", "read_write", false, false, false),
        ("directory-write", "read_write", true, true, true),
    ] {
        let source = directory_source(&image, project.path(), access, PROBE, bound);
        let release = post(&server, "/api/v1/import", portable(&image, source)).await;
        let record = execute(
            &server,
            release["bundle"]["digest"].as_str().unwrap(),
            id,
            json!({"root":project.path(),"outside":secret}),
        )
        .await;
        assert_completed(&record);
        let result = output(&record);
        assert_eq!(result["read"]["allowed"], readable, "{result}");
        assert_eq!(result["write"]["allowed"], writable, "{result}");
        for action in [
            "outside", "link", "metadata", "spawn", "network", "symlink", "execute",
        ] {
            assert_eq!(result[action]["allowed"], false, "{id}/{action}: {result}");
        }
        assert_eq!(result["execute"]["errno"], 13, "{result}");
    }
    assert_eq!(
        std::fs::read_to_string(project.path().join("nested/result.txt")).unwrap(),
        "external artifact write"
    );
    assert_eq!(
        std::fs::read_to_string(&secret).unwrap(),
        "kernel private evidence"
    );
    stop.cancel();
    worker.await.unwrap();
}

#[tokio::test]
async fn reserved_runtime_environment_cannot_forge_directory_authority() {
    let _serial = IMAGE_RUNS.lock().await;
    let mut image = image().await;
    let private = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    image.manifest.env.insert(
        "NOFY_DIRECTORY_WORKSPACE".into(),
        nofy_agent_host::loader::images::EnvironmentValue::Literal {
            value: project.path().to_str().unwrap().into(),
        },
    );
    let (kernel, server) = hosted(private.path()).await;
    let source = directory_source(
        &image,
        project.path(),
        "read_write",
        "import os; open(os.environ['NOFY_DIRECTORY_WORKSPACE']+'/forged','w').write('bad'); print('{}')",
        false,
    );
    let release = post(&server, "/api/v1/import", portable(&image, source)).await;
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let worker = tokio::spawn(async move { kernel.run_worker(signal, 1).await.unwrap() });
    let record = execute(
        &server,
        release["bundle"]["digest"].as_str().unwrap(),
        "directory-forgery",
        json!({}),
    )
    .await;
    assert_completed(&record);
    let result = output(&record);
    assert_eq!(result.as_object().unwrap().len(), 1, "{result}");
    assert!(
        result["error"]
            .as_str()
            .unwrap()
            .contains("reserved directory prefix"),
        "{result}"
    );
    assert!(!project.path().join("forged").exists());
    stop.cancel();
    worker.await.unwrap();
}

fn writer(version: &str) -> String {
    format!(
        "import json, os, sys\njson.load(sys.stdin)\npath = os.environ['NOFY_DIRECTORY_WORKSPACE'] + '/effects.txt'\nwith open(path, 'a') as file:\n    file.write('{version}\\n')\n    file.flush()\n    os.fsync(file.fileno())\nprint(json.dumps({{'version':'{version}'}}))\n"
    )
}
async fn activate(server: &Serving, release: &str, generation: u64) {
    let previous = generation.checked_sub(1).filter(|value| *value != 0);
    let receipt = post(server, "/api/v1/apply",
        json!({"command_id":format!("directory-generation-{generation}"),"system":"artifact-system", "release":release,"expected_generation":previous})).await;
    assert_eq!(
        receipt["active"],
        json!({"generation":generation,"release":release})
    );
}

#[tokio::test]
async fn external_directory_writes_update_and_roll_back_without_restarting_or_repeating_success_after_reopen()
 {
    let _serial = IMAGE_RUNS.lock().await;
    let image = image().await;
    let private = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    let (kernel, server) = hosted(private.path()).await;
    let pid = std::process::id();
    let original = directory_source(&image, project.path(), "read_write", &writer("one"), true);
    let publication = post(
        &server,
        "/api/v1/import",
        portable(&image, original.clone()),
    )
    .await;
    let first = publication["bundle"]["digest"].as_str().unwrap().to_owned();
    let repository = crate::dependencies::Repository::new(kernel.loader()).await;
    kernel
        .loader()
        .acquire_image(
            serde_json::from_value(repository.requirement(&image)["source"].clone()).unwrap(),
            Default::default(),
        )
        .await
        .unwrap();
    activate(&server, &first, 1).await;
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let worker_host = kernel.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(signal, 1).await.unwrap() });
    let first_record = execute(&server, &first, "directory-original-write", json!({})).await;
    assert_completed(&first_record);
    assert_eq!(output(&first_record)["version"], "one");
    let mut changed = original;
    changed["modules"][0]["config"]["bundle"]["files"]["main.py"] = json!(writer("two"));
    changed["modules"][0]["reference"]["version"] = json!("2");
    changed["modules"][2]["reference"]["version"] = json!("2");
    changed["modules"][2]["dependencies"]["artifact"]["version"] = json!("2");
    changed["programs"]["compute"]["definition"]["tool_packs"][0]["version"] = json!("2");
    let publication = post(&server, "/api/v1/import", changed).await;
    let second = publication["bundle"]["digest"].as_str().unwrap().to_owned();
    assert_ne!(first, second);
    activate(&server, &second, 2).await;
    let record = execute(&server, &second, "directory-updated-write", json!({})).await;
    assert_completed(&record);
    assert_eq!(output(&record)["version"], "two");
    activate(&server, &first, 3).await;
    let record = execute(&server, &first, "directory-rollback-write", json!({})).await;
    assert_completed(&record);
    assert_eq!(output(&record)["version"], "one");
    assert_eq!(std::process::id(), pid);
    assert_eq!(
        std::fs::read_to_string(project.path().join("effects.txt")).unwrap(),
        "one\ntwo\none\n"
    );
    assert!(
        execute(&server, &first, "directory-original-write", json!({})).await == first_record,
        "idempotent admission changed the original result"
    );
    let (status, deployment) = request(
        &server,
        reqwest::Method::GET,
        &format!("/api/v1/releases/{first}/deployment"),
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200);
    assert_eq!(deployment["format"], "nofy.deployment/v2");
    assert!(deployment.get("runtime_images").is_none());
    assert_eq!(deployment["runtime_sources"].as_array().unwrap().len(), 1);
    stop.cancel();
    worker.await.unwrap();
    drop(server);
    drop(kernel);

    let (reopened, server) = hosted(private.path()).await;
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let worker = tokio::spawn(async move { reopened.run_worker(signal, 1).await.unwrap() });
    assert!(
        execute(&server, &first, "directory-original-write", json!({})).await == first_record,
        "reopen changed the original successful execution"
    );
    assert_eq!(
        std::fs::read_to_string(project.path().join("effects.txt")).unwrap(),
        "one\ntwo\none\n"
    );
    stop.cancel();
    worker.await.unwrap();

    let target = tempfile::tempdir().unwrap();
    let (migrated, server) = hosted(target.path()).await;
    assert!(migrated.loader().runtimes.list().unwrap().is_empty());
    let refused = request(
        &server,
        reqwest::Method::POST,
        "/api/v1/import",
        ADMIN,
        deployment.clone(),
    )
    .await;
    assert_eq!(refused.0, 422, "{}", refused.1);
    assert!(
        refused.1["error"]["message"]
            .as_str()
            .unwrap()
            .contains("source is not authorized")
    );
    assert_eq!(
        repository.requests(),
        1,
        "untrusted metadata must not start a download"
    );
    assert!(matches!(
        migrated
            .loader()
            .images
            .get(&image.manifest.digest().unwrap()),
        Err(nofy_agent_host::HostError::NotFound)
    ));
    repository.authorize(migrated.loader());
    let imported = post(&server, "/api/v1/import", deployment).await;
    assert_eq!(
        repository.requests(),
        2,
        "independently authorized target must reconstruct its empty cache"
    );
    assert_eq!(imported["bundle"]["digest"], first);
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let worker = tokio::spawn(async move { migrated.run_worker(signal, 1).await.unwrap() });
    let record = execute(&server, &first, "directory-portable-write", json!({})).await;
    assert_completed(&record);
    assert_eq!(
        std::fs::read_to_string(project.path().join("effects.txt")).unwrap(),
        "one\ntwo\none\none\n"
    );
    stop.cancel();
    worker.await.unwrap();
}

#[tokio::test]
async fn losing_a_directory_after_a_real_write_does_not_prevent_its_success_receipt() {
    let _serial = IMAGE_RUNS.lock().await;
    let image = image().await;
    let private = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    let root = project.path().join("project");
    let moved = project.path().join("moved");
    std::fs::create_dir(&root).unwrap();
    std::fs::write(root.join("gate"), "").unwrap();
    let code = r#"import json, os, sys, time
from pathlib import Path
json.load(sys.stdin)
root = Path(os.environ['NOFY_DIRECTORY_WORKSPACE'])
with (root / 'gate').open() as gate:
    with (root / 'effects').open('a') as effect:
        effect.write('once\n')
        effect.flush()
        os.fsync(effect.fileno())
    (root / 'ready').write_text('ready')
    while not gate.read():
        gate.seek(0)
        time.sleep(0.02)
print(json.dumps({'committed': True}))
"#;
    let (kernel, server) = hosted(private.path()).await;
    let mut source = directory_source(&image, &root, "read_write", code, true);
    source["modules"][2]["config"]["contract"]["timeout_ms"] = json!(120000);
    let publication = post(&server, "/api/v1/import", portable(&image, source)).await;
    let release = publication["bundle"]["digest"].as_str().unwrap();
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let worker_host = kernel.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(signal, 1).await.unwrap() });
    post(
        &server,
        "/api/v1/runs",
        run(release, "directory-effect-ack"),
    )
    .await;
    tokio::time::timeout(Duration::from_secs(60), async {
        while !root.join("ready").exists() {
            tokio::time::sleep(Duration::from_millis(20)).await;
        }
    })
    .await
    .unwrap();
    assert_eq!(
        std::fs::read_to_string(root.join("effects")).unwrap(),
        "once\n"
    );
    std::fs::rename(&root, &moved).unwrap();
    let (status, _) = request(
        &server,
        reqwest::Method::POST,
        "/api/v1/runs",
        ADMIN,
        run(release, "directory-unavailable-job"),
    )
    .await;
    assert!(status >= 400);
    assert!(
        kernel
            .store()
            .execution_job("directory-unavailable-job")
            .await
            .unwrap()
            .is_none()
    );
    std::fs::write(moved.join("gate"), "acknowledge").unwrap();
    let record = settled(&server, "directory-effect-ack").await;
    assert_completed(&record);
    assert_eq!(output(&record)["committed"], true);
    assert_eq!(
        std::fs::read_to_string(moved.join("effects")).unwrap(),
        "once\n"
    );
    std::fs::rename(&moved, &root).unwrap();
    stop.cancel();
    worker.await.unwrap();
}
