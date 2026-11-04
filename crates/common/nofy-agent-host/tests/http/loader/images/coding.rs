//! Actual external preset packaging, Loader composition and isolated file effects.
use super::*;

async fn packed(
    repository: &crate::dependencies::Repository,
    image: &RuntimeImage,
    project: &Path,
) -> Value {
    packed_from(
        repository,
        image,
        project,
        Path::new(concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/../../../presets/coding"
        )),
    )
    .await
}

async fn packed_from(
    repository: &crate::dependencies::Repository,
    image: &RuntimeImage,
    project: &Path,
    root: &Path,
) -> Value {
    let lock = json!({"format":"nofy.dependencies/v1",
        "runtimes":{"files":repository.requirement(image)}});
    let project = project.to_owned();
    let root = root.to_owned();
    tokio::task::spawn_blocking(move || {
        let inputs = tempfile::tempdir().unwrap();
        let settings = inputs.path().join("settings.json");
        let dependencies = inputs.path().join("dependencies.lock.json");
        let target = inputs.path().join("deployment.json");
        std::fs::write(&settings, serde_json::to_vec(&json!({
            "workspace":project,"model":"isolated-file-check",
            "terminal_enabled":false,
            "connection":{"base_url":"http://127.0.0.1:9/v1/",
                "allow_insecure_http":true,"models":["isolated-file-check"],"header_credentials":{}}
        })).unwrap()).unwrap();
        std::fs::write(&dependencies, serde_json::to_vec(&lock).unwrap()).unwrap();
        let result = std::process::Command::new("/usr/bin/python3")
            .arg("-B")
            .arg(root.join("build.py"))
            .arg("--settings")
            .arg(settings)
            .arg("--dependency-lock")
            .arg(dependencies)
            .arg("--output")
            .arg(&target)
            .output()
            .unwrap();
        assert!(
            result.status.success(),
            "packaging: {}",
            String::from_utf8_lossy(&result.stderr)
        );
        serde_json::from_slice(&std::fs::read(target).unwrap()).unwrap()
    })
    .await
    .unwrap()
}

#[tokio::test]
async fn external_preset_source_update_keeps_resource_versions_and_applies_and_rolls_back_without_kernel_restart()
 {
    let _serial = IMAGE_RUNS.lock().await;
    let image = image().await;
    let project = tempfile::tempdir().unwrap();
    let private = tempfile::tempdir().unwrap();
    let (kernel, server) = hosted(private.path()).await;
    let repository = crate::dependencies::Repository::new(kernel.loader()).await;
    let edited_source = tempfile::tempdir().unwrap();
    let original = Path::new(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../../presets/coding"
    ));
    for name in [
        "build.py",
        "preset.json",
        "settings.schema.json",
        "prompt.md",
        "rules.md",
        "skills/review.json",
        "modules/files/files.py",
        "modules/files/workspace.py",
        "modules/files/manifest.json",
        "modules/models/manifest.json",
        "modules/models/common.rhai",
        "modules/models/chat_completions.rhai",
        "modules/models/responses.rhai",
        "modules/models/messages.rhai",
        "modules/models/parameters.schema.json",
        "modules/scopes/scope.rhai",
        "modules/scopes/parameters.schema.json",
    ] {
        let destination = edited_source.path().join(name);
        std::fs::create_dir_all(destination.parent().unwrap()).unwrap();
        std::fs::copy(original.join(name), destination).unwrap();
    }
    std::fs::write(project.path().join("read.txt"), "unchanged project state").unwrap();
    let mut first = packed(&repository, &image, project.path()).await;
    let code = edited_source.path().join("modules/files/files.py");
    let old = std::fs::read_to_string(&code).unwrap();
    let changed = old.replacen(
        "return {'path': args['path'], 'sha256':",
        "return {'edition': 'two', 'path': args['path'], 'sha256':",
        1,
    );
    assert_ne!(changed, old);
    std::fs::write(code, changed).unwrap();
    let mut next = packed_from(&repository, &image, project.path(), edited_source.path()).await;
    for id in [
        "project-read",
        "project-write",
        "ledger",
        "quota",
        "approval",
        "write-approval",
        "provider",
        "model",
        "scope",
    ] {
        assert_eq!(
            module(&first["system"], id),
            module(&next["system"], id),
            "unexpected version churn: {id}"
        );
    }
    for id in ["files-code", "file-read", "file-write", "skills"] {
        assert_ne!(
            module(&first["system"], id)["reference"],
            module(&next["system"], id)["reference"],
            "missing dependency version: {id}"
        );
    }
    add_file_entries(&mut first["system"]);
    add_file_entries(&mut next["system"]);
    let one = post(&server, "/api/v1/import", first).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    let two = post(&server, "/api/v1/import", next).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    assert_ne!(one, two);
    let activate = json!({"command_id":"coding-first","system":"coding","release":one,"expected_generation":null});
    let receipt = post(&server, "/api/v1/apply", activate.clone()).await;
    assert_eq!(post(&server, "/api/v1/apply", activate).await, receipt);
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let worker_kernel = kernel.clone();
    let worker = tokio::spawn(async move { worker_kernel.run_worker(signal, 2).await.unwrap() });
    assert!(
        successful(
            &file_run(
                &server,
                &one,
                "coding-release-one",
                "read_file",
                json!({"path":"read.txt"})
            )
            .await
        )["edition"]
            .is_null()
    );
    let diff = post(
        &server,
        "/api/v1/plan",
        json!({"system":"coding","release":two}),
    )
    .await;
    assert!(!diff["changes"].as_array().unwrap().is_empty(), "{diff}");
    post(
        &server,
        "/api/v1/apply",
        json!({"command_id":"coding-next","system":"coding","release":two,"expected_generation":1}),
    )
    .await;
    assert_eq!(
        successful(
            &file_run(
                &server,
                &two,
                "coding-release-two",
                "read_file",
                json!({"path":"read.txt"})
            )
            .await
        )["edition"],
        "two"
    );
    post(&server, "/api/v1/apply", json!({"command_id":"coding-rollback","system":"coding","release":one,"expected_generation":2})).await;
    let active = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/systems/coding/active",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(active.0, 200, "{}", active.1);
    assert_eq!(active.1["release"], one);
    assert_eq!(active.1["generation"], 3);
    assert!(
        successful(
            &file_run(
                &server,
                &one,
                "coding-rolled-back",
                "read_file",
                json!({"path":"read.txt"})
            )
            .await
        )["edition"]
            .is_null()
    );
    assert_eq!(
        std::fs::read(project.path().join("read.txt")).unwrap(),
        b"unchanged project state"
    );
    stop.cancel();
    worker.await.unwrap();
}

fn module(source: &Value, id: &str) -> Value {
    source["modules"]
        .as_array()
        .unwrap()
        .iter()
        .find(|module| module["reference"]["id"] == id)
        .unwrap()
        .clone()
}

fn add_file_entries(source: &mut Value) {
    for (name, id) in [
        ("read_file", "file-read"),
        ("write_file", "file-write"),
        ("edit_file", "file-edit"),
        ("make_directory", "directory-create"),
        ("list_files", "file-list"),
        ("search_files", "file-search"),
    ] {
        let reference = module(source, id)["reference"].clone();
        source["programs"][name] = json!({"kind":"tool",
            "definition":{"name":name,"tool_packs":[reference]},
            "call":{"id":name,"name":name,"arguments":{"path":"unused"}}});
    }
}

async fn file_run(server: &Serving, release: &str, id: &str, tool: &str, input: Value) -> Value {
    post(
        server,
        "/api/v1/runs",
        json!({"run_id":id,"thread_id":id,
        "system":"coding","release":release,"program":tool,"parameters":input}),
    )
    .await;
    settled(server, id).await
}

async fn approve(server: &Serving, id: &str) -> Value {
    let (status, approvals) = request(
        server,
        reqwest::Method::GET,
        &format!("/api/v1/runs/{id}/approvals"),
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200);
    assert_eq!(approvals.as_array().unwrap().len(), 1, "{approvals}");
    let approval = &approvals[0];
    let mut forged = approval.clone();
    forged["call"]["arguments"] = json!({"path":"other.txt"});
    assert_eq!(
        request(
            server,
            reqwest::Method::POST,
            &format!("/api/v1/runs/{id}/approvals"),
            ADMIN,
            json!({"request":forged,"allow":true})
        )
        .await
        .0,
        409
    );
    assert_eq!(
        request(
            server,
            reqwest::Method::POST,
            &format!("/api/v1/runs/{id}/approvals"),
            ADMIN,
            json!({"request":approval,"allow":true})
        )
        .await
        .0,
        204
    );
    let command = format!("resume-{id}");
    post(
        server,
        "/api/v1/actions",
        json!({"run_id":id,"command_id":command,
        "command":{"kind":"resume"}}),
    )
    .await;
    let receipt = action_result(server, &command).await;
    assert!(receipt["error"].is_null(), "{receipt}");
    settled(server, id).await
}

fn successful(record: &Value) -> Value {
    assert_eq!(
        record["execution"]["status"],
        "completed",
        "{}",
        run_diagnostics(record)
    );
    let value = output(record);
    assert_eq!(value["ok"], true, "{value}");
    value["result"].clone()
}

#[tokio::test]
async fn external_coding_preset_packages_loads_and_runs_all_file_tools_with_durable_exact_approval()
{
    let _serial = IMAGE_RUNS.lock().await;
    let image = image().await;
    let project = tempfile::tempdir().unwrap();
    let private = tempfile::tempdir().unwrap();
    let (kernel, server) = hosted(private.path()).await;
    let repository = crate::dependencies::Repository::new(kernel.loader()).await;
    std::fs::write(project.path().join("original.txt"), "原文\r\n").unwrap();
    let mut deployment = packed(&repository, &image, project.path()).await;
    assert_eq!(deployment["format"], "nofy.deployment/v2");
    assert!(deployment.get("runtime_images").is_none());
    assert_eq!(deployment["runtime_sources"].as_array().unwrap().len(), 1);
    assert_eq!(
        repository.requests(),
        0,
        "packing must not prepare dependencies"
    );
    let image_digest = image.manifest.digest().unwrap();
    assert!(matches!(
        kernel.loader().images.get(&image_digest),
        Err(nofy_agent_host::HostError::NotFound)
    ));
    assert_eq!(
        deployment["system"]["programs"].as_object().unwrap().len(),
        1
    );
    assert_eq!(deployment["system"]["programs"]["chat"]["kind"], "agent");
    // These diagnostic entry points reuse the exact packed modules/floor, not a
    // second preset or a separate filesystem implementation.
    add_file_entries(&mut deployment["system"]);
    let (status, preview) = request(
        &server,
        reqwest::Method::POST,
        "/api/v1/validate",
        VIEW,
        deployment.clone(),
    )
    .await;
    assert_eq!(status, 200, "{preview}");
    assert_eq!(
        repository.requests(),
        0,
        "preview must not prepare dependencies"
    );
    assert!(matches!(
        kernel.loader().images.get(&image_digest),
        Err(nofy_agent_host::HostError::NotFound)
    ));
    assert!(!project.path().join("created.txt").exists());
    let imported = post(&server, "/api/v1/import", deployment.clone()).await;
    assert_eq!(
        repository.requests(),
        1,
        "import must rebuild an empty target cache from the locked origin"
    );
    assert_eq!(
        serde_json::to_value(kernel.loader().images.get(&image_digest).unwrap().manifest).unwrap(),
        serde_json::to_value(&image.manifest).unwrap()
    );
    let release = imported["bundle"]["digest"].as_str().unwrap().to_owned();
    assert_eq!(
        post(&server, "/api/v1/import", deployment).await["bundle"]["digest"],
        release
    );
    assert_eq!(
        repository.requests(),
        1,
        "exact re-import must reuse the verified acquisition"
    );
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let worker_kernel = kernel.clone();
    let worker = tokio::spawn(async move { worker_kernel.run_worker(signal, 2).await.unwrap() });
    let original = file_run(
        &server,
        &release,
        "coding-read",
        "read_file",
        json!({"path":"original.txt"}),
    )
    .await;
    assert_eq!(successful(&original)["text"], "原文\r\n");
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/runs/coding-read/approvals",
            VIEW,
            Value::Null
        )
        .await
        .1,
        json!([])
    );
    let paused = file_run(
        &server,
        &release,
        "coding-create",
        "write_file",
        json!({"path":"created.txt","content":"first\r\n","expected_sha256":null}),
    )
    .await;
    assert_eq!(
        paused["execution"]["status"],
        "paused",
        "{}",
        run_diagnostics(&paused)
    );
    assert!(!project.path().join("created.txt").exists());
    stop.cancel();
    worker.await.unwrap();
    drop(server);
    drop(kernel);
    let (kernel, server) = hosted(private.path()).await;
    let restored = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/runs/coding-create",
        VIEW,
        Value::Null,
    )
    .await
    .1;
    assert_eq!(restored["execution"], paused["execution"]);
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let worker_kernel = kernel.clone();
    let worker = tokio::spawn(async move { worker_kernel.run_worker(signal, 2).await.unwrap() });
    let created = successful(&approve(&server, "coding-create").await);
    assert_eq!(
        std::fs::read(project.path().join("created.txt")).unwrap(),
        b"first\r\n"
    );
    let edited = file_run(
        &server,
        &release,
        "coding-edit",
        "edit_file",
        json!({
        "path":"created.txt","expected_sha256":created["sha256"],
        "edits":[{"old_text":"first","new_text":"second","expected_count":1}]}),
    )
    .await;
    assert_eq!(edited["execution"]["status"], "paused");
    successful(&approve(&server, "coding-edit").await);
    assert_eq!(
        std::fs::read(project.path().join("created.txt")).unwrap(),
        b"second\r\n"
    );
    file_run(
        &server,
        &release,
        "coding-stale",
        "write_file",
        json!({
        "path":"created.txt","expected_sha256":created["sha256"],"content":"must not overwrite"}),
    )
    .await;
    let conflict = output(&approve(&server, "coding-stale").await);
    assert_eq!(conflict["ok"], false);
    assert_eq!(conflict["error"]["code"], "conflict");
    assert_eq!(conflict["error"]["effect"], "none");
    assert_eq!(
        std::fs::read(project.path().join("created.txt")).unwrap(),
        b"second\r\n"
    );
    let directory = file_run(
        &server,
        &release,
        "coding-mkdir",
        "make_directory",
        json!({"path":"nested/deeper"}),
    )
    .await;
    assert_eq!(directory["execution"]["status"], "paused");
    successful(&approve(&server, "coding-mkdir").await);
    assert!(project.path().join("nested/deeper").is_dir());
    let listed = file_run(
        &server,
        &release,
        "coding-list",
        "list_files",
        json!({"path":"."}),
    )
    .await;
    assert!(
        successful(&listed)["items"]
            .as_array()
            .unwrap()
            .iter()
            .any(|e| e["path"] == "created.txt")
    );
    let searched = file_run(
        &server,
        &release,
        "coding-search",
        "search_files",
        json!({"path":".","query":"second","file_glob":"*.txt"}),
    )
    .await;
    assert_eq!(successful(&searched)["items"][0]["path"], "created.txt");
    std::os::unix::fs::symlink(
        project.path().join("original.txt"),
        project.path().join("alias"),
    )
    .unwrap();
    let linked = file_run(
        &server,
        &release,
        "coding-no-link",
        "read_file",
        json!({"path":"alias"}),
    )
    .await;
    assert_eq!(output(&linked)["ok"], false);
    assert_eq!(
        std::fs::read(project.path().join("original.txt")).unwrap(),
        "原文\r\n".as_bytes()
    );
    assert!(std::fs::read_dir(project.path()).unwrap().all(|entry| {
        !entry
            .unwrap()
            .file_name()
            .to_string_lossy()
            .starts_with(".nofy-atomic-")
    }));
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/runs/coding-create",
            VIEW,
            Value::Null
        )
        .await
        .1["execution"]["status"],
        "completed"
    );
    stop.cancel();
    worker.await.unwrap();
}
