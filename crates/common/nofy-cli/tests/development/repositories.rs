use super::*;
use nofy_agent_project::repository::load_package_directory;

fn package(label: &str, version: &str) -> Source {
    let mut source = Source {
        files: Default::default(),
        declaration: "module.json".into(),
        settings_json: None,
    };
    source.put_json("module.json",&json!({"format":"nofy.module-package/v1","name":"shared-prompt","version":version,"parameters_schema":{"type":"object","properties":{"text":{"type":"string","default":label}}},"modules":[{"reference":{"$module":"prompt"},"factory":"prompt.static","config":{"text":{"$parameter":"/text"}}}],"exports":{"main":"prompt"}})).unwrap();
    source.files.insert(
        "requirements.txt".into(),
        nofy_agent_project::File::text("# supplied by module users\n"),
    );
    source.refresh_manifest().unwrap();
    source
}
async fn ok(e: &Engine, op: &str, input: Value) -> nofy_agent_client::Envelope {
    let out = e.execute(op, input).await;
    assert!(!out.is_error(), "{out:?}");
    let schema = nofy_agent_client::schema("Result").unwrap();
    assert!(jsonschema::is_valid(
        &schema,
        &serde_json::to_value(&out).unwrap()
    ));
    out
}
pub(super) async fn mcp(
    url: &str,
    dir: &Path,
) -> rmcp::service::RunningService<rmcp::RoleClient, ClientConfig> {
    let token = dir.join("mcp-token");
    std::fs::write(&token, ADMIN).unwrap();
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(&token, std::fs::Permissions::from_mode(0o600)).unwrap();
    }
    let mut cmd = tokio::process::Command::new(env!("CARGO_BIN_EXE_nofy"));
    cmd.args([
        "mcp",
        "serve",
        "--endpoint",
        url,
        "--token-file",
        token.to_str().unwrap(),
    ]);
    client_info()
        .serve(TokioChildProcess::new(cmd).unwrap())
        .await
        .unwrap()
}
#[tokio::test(flavor = "multi_thread", worker_threads = 3)]
async fn shared_module_cli_and_mcp_pin_edit_export_and_offline_rebuild() {
    let dir = tempfile::tempdir().unwrap();
    let state = dir.path().join("kernel");
    let kernel = host(&state).await;
    let server = serve(kernel.router()).await;
    let e = engine(&server.url, ADMIN);
    let module = dir.path().join("module");
    nofy_agent_project::write_directory(&module, &package("shared", "1"), None).unwrap();
    cli_ok(&server.url, &["repository", "add", "library"]).await;
    let published = cli_ok(
        &server.url,
        &[
            "module",
            "publish",
            "library",
            "--directory",
            module.to_str().unwrap(),
        ],
    )
    .await;
    let package_digest = published["refs"]["package_digest"].clone();
    let client = mcp(&server.url, dir.path()).await;
    // The catalog says how many tools there are; a literal here only goes stale.
    assert_eq!(
        client.list_all_tools().await.unwrap().len(),
        nofy_agent_client::OPERATIONS
            .iter()
            .filter(|o| o.mcp_tool.is_some())
            .count()
    );
    let discovery = mcp_call(&client, "nofy_describe", json!({"group":"repository"})).await;
    assert_eq!(discovery["data"]["contract_revision"], "0.6");
    mcp_call(
        &client,
        "nofy_schema",
        json!({"operation":"agent.module.use"}),
    )
    .await;
    for (agent, text) in [("one", "first"), ("two", "second")] {
        cli_ok(&server.url, &["agent", "create", agent, "--empty"]).await;
        cli_ok(
            &server.url,
            &[
                "agent",
                "module",
                "add",
                agent,
                "--id",
                "model",
                "--factory",
                "model.programmed",
                "--slot",
                "model",
                "--config-json",
                "{}",
            ],
        )
        .await;
        let current = ok(
            &e,
            "agent.inspect",
            json!({"target":{"kind":"project","project_id":agent},"agent":agent}),
        )
        .await;
        let result=mcp_call(&client,"nofy_agent_module_use",json!({"include_source":true,"target":{"kind":"project","project_id":agent,"expected_revision":current.refs["source_revision"]},"agent":agent,"repository":"library","name":"shared-prompt","version":"1","alias":"shared","parameters":{"text":text},"export":"main","slot":"prompt"})).await;
        assert_eq!(
            result["data"]["source"]["files"]
                .as_object()
                .unwrap()
                .keys()
                .filter(|k| k.starts_with(".nofy-module-packages/"))
                .count(),
            0
        );
        let data = ok(
            &e,
            "agent.build",
            json!({"agent":agent,"target":{"kind":"project","project_id":agent}}),
        )
        .await;
        let deployment: Value =
            serde_json::from_str(data.data["deployment_json"].as_str().unwrap()).unwrap();
        assert_eq!(
            deployment["system"]["modules"]
                .as_array()
                .unwrap()
                .iter()
                .find(|m| m["reference"]["id"] == "shared.prompt")
                .unwrap()["config"]["text"],
            text
        );
    }
    assert_eq!(
        std::fs::read_dir(state.join("module-repositories/packages"))
            .unwrap()
            .count(),
        1
    );
    let current = ok(
        &e,
        "agent.inspect",
        json!({"agent":"one","target":{"kind":"project","project_id":"one"}}),
    )
    .await;
    let stale=e.execute("agent.module.use",json!({"agent":"one","target":{"kind":"project","project_id":"one","expected_revision":"0"},"repository":"library","name":"shared-prompt","version":"1","alias":"wrong"})).await;
    assert_eq!(stale.error.unwrap()["code"], "conflict");
    let export = dir.path().join("export.tar.gz");
    cli_ok(
        &server.url,
        &[
            "agent",
            "export",
            "one",
            "--output",
            export.to_str().unwrap(),
        ],
    )
    .await;
    let unpacked = dir.path().join("unpacked");
    std::fs::create_dir(&unpacked).unwrap();
    tar::Archive::new(flate2::read::GzDecoder::new(
        std::fs::File::open(export).unwrap(),
    ))
    .unpack(&unpacked)
    .unwrap();
    let offline = cli_ok(
        "http://127.0.0.1:1",
        &["project", "build", unpacked.to_str().unwrap(), "--offline"],
    )
    .await;
    let online = ok(
        &e,
        "agent.build",
        json!({"agent":"one","target":{"kind":"project","project_id":"one"}}),
    )
    .await;
    assert_eq!(
        offline["data"]["deployment_json"],
        online.data["deployment_json"]
    );
    let packed = dir.path().join("project.tar.gz");
    cli_ok(
        &server.url,
        &[
            "project",
            "pack",
            unpacked.to_str().unwrap(),
            "--output",
            packed.to_str().unwrap(),
        ],
    )
    .await;
    let view = ok(
        &e,
        "module.inspect",
        json!({"repository":"library","name":"shared-prompt","version":"1"}),
    )
    .await;
    assert_eq!(view.data["digest"], package_digest);
    // Local source targets retain only pins; CLI pointer parameters and archive
    // resolution must agree with the managed-project/MCP path above.
    let local = dir.path().join("local-agent");
    let path = local.to_str().unwrap();
    cli_ok(
        &server.url,
        &["project", "init", path, "--empty", "--agent", "local"],
    )
    .await;
    cli_ok(
        &server.url,
        &[
            "agent",
            "module",
            "use",
            "local",
            "--project",
            path,
            "--repository",
            "library",
            "--name",
            "shared-prompt",
            "--version",
            "1",
            "--alias",
            "prompt",
            "--set",
            "/text=local parameter",
            "--export",
            "main",
            "--slot",
            "prompt",
        ],
    )
    .await;
    let local_source = nofy_agent_project::load_directory(&local).unwrap();
    assert!(
        !local_source
            .files
            .keys()
            .any(|k| k.starts_with(".nofy-module-packages/"))
    );
    assert_eq!(
        local_source.json("preset.json").unwrap()["system"]["module_imports"]["prompt"]["parameters"]
            ["text"],
        "local parameter"
    );
    let local_digest = local_source.digest().unwrap();
    let local_archive = dir.path().join("local-agent.tar.gz");
    cli_ok(
        &server.url,
        &[
            "project",
            "pack",
            path,
            "--output",
            local_archive.to_str().unwrap(),
        ],
    )
    .await;
    assert_eq!(
        nofy_agent_project::load_directory(&local)
            .unwrap()
            .digest()
            .unwrap(),
        local_digest
    );
    let local_export = dir.path().join("local-export");
    std::fs::create_dir(&local_export).unwrap();
    tar::Archive::new(flate2::read::GzDecoder::new(
        std::fs::File::open(local_archive).unwrap(),
    ))
    .unpack(&local_export)
    .unwrap();
    assert!(
        nofy_agent_project::load_directory(&local_export)
            .unwrap()
            .files
            .keys()
            .any(|k| k.starts_with(".nofy-module-packages/"))
    );
    let before = current.refs["source_revision"].clone();
    let _=mcp_call(&client,"nofy_repository_remove",json!({"repository":"library","expected_revision":published["refs"]["repository_revision"]})).await;
    let still = ok(
        &e,
        "agent.build",
        json!({"agent":"one","target":{"kind":"project","project_id":"one"}}),
    )
    .await;
    assert_eq!(still.refs["source_revision"], before);
    client.cancel().await.unwrap();
}
#[tokio::test(flavor = "multi_thread", worker_threads = 3)]
async fn directory_and_real_git_snapshots_are_explicit_atomic_and_authorized() {
    let dir = tempfile::tempdir().unwrap();
    let state = dir.path().join("kernel");
    let kernel = host(&state).await;
    let server = serve(kernel.router()).await;
    let e = engine(&server.url, ADMIN);
    let source = dir.path().join("repository");
    nofy_agent_project::write_directory(&source, &package("directory", "1"), None).unwrap();
    std::fs::write(
        source.join("module-repository.json"),
        r#"{"format":"nofy.module-repository/v1","packages":[""]}"#,
    )
    .unwrap();
    let source = source.canonicalize().unwrap();
    let registered = cli_ok(
        &server.url,
        &[
            "repository",
            "add",
            "directory",
            "--host-directory",
            source.to_str().unwrap(),
        ],
    )
    .await;
    assert_eq!(registered["data"]["package_count"], 0);
    // The command line asks for the revision just as MCP does: the one it last read.
    let revision = registered["refs"]["repository_revision"]
        .as_str()
        .unwrap()
        .to_owned();
    let synced = cli_ok(
        &server.url,
        &[
            "repository",
            "sync",
            "directory",
            "--expected-revision",
            &revision,
        ],
    )
    .await;
    assert_eq!(synced["data"]["packages"].as_array().unwrap().len(), 1);
    assert_eq!(
        synced["data"]["packages"][0]["digest"],
        load_package_directory(&source).unwrap().digest().unwrap()
    );
    let forbidden=engine(&server.url,READ).execute("repository.sync",json!({"repository":"directory","expected_revision":synced["refs"]["repository_revision"]})).await;
    assert_eq!(forbidden.error.unwrap()["code"], "forbidden");
    let private=e.execute("repository.add",json!({"repository":"private","origin":{"kind":"directory","host_path":state.canonicalize().unwrap()},"expected_revision":null})).await;
    assert!(private.is_error());
    for args in [
        vec!["init", "--quiet"],
        vec![
            "-c",
            "user.name=ModuleTest",
            "-c",
            "user.email=module@example.invalid",
            "add",
            ".",
        ],
        vec![
            "-c",
            "user.name=ModuleTest",
            "-c",
            "user.email=module@example.invalid",
            "commit",
            "--quiet",
            "-m",
            "module source",
        ],
    ] {
        assert!(
            std::process::Command::new("git")
                .current_dir(&source)
                .args(args)
                .status()
                .unwrap()
                .success()
        );
    }
    let head = std::process::Command::new("git")
        .current_dir(&source)
        .args(["rev-parse", "HEAD"])
        .output()
        .unwrap();
    let head = String::from_utf8(head.stdout).unwrap();
    let git_added = cli_ok(
        &server.url,
        &[
            "repository",
            "add",
            "git",
            "--git-url",
            source.to_str().unwrap(),
            "--git-ref",
            head.trim(),
        ],
    )
    .await;
    let git_revision = git_added["refs"]["repository_revision"]
        .as_str()
        .unwrap()
        .to_owned();
    let git = cli_ok(
        &server.url,
        &[
            "repository",
            "sync",
            "git",
            "--expected-revision",
            &git_revision,
        ],
    )
    .await;
    assert_eq!(git["data"]["repository"]["source_revision"], head.trim());
    assert_eq!(
        git["data"]["packages"][0]["digest"],
        synced["data"]["packages"][0]["digest"]
    );
    let mut modified = load_package_directory(&source).unwrap();
    let mut manifest = modified.json("module.json").unwrap();
    manifest["description"] = json!("changed same version");
    modified.put_json("module.json", &manifest).unwrap();
    modified.refresh_manifest().unwrap();
    std::fs::write(
        source.join("module.json"),
        modified.files["module.json"].decode().unwrap(),
    )
    .unwrap();
    let conflict=e.execute("repository.sync",json!({"repository":"directory","expected_revision":synced["refs"]["repository_revision"]})).await;
    assert_eq!(conflict.error.unwrap()["code"], "conflict");
    let after = ok(&e, "repository.inspect", json!({"repository":"directory"})).await;
    assert_eq!(
        after.data["revision"],
        synced["refs"]["repository_revision"]
    );
    let reader = engine(&server.url, READ);
    assert!(
        !reader
            .execute("module.list", json!({"limit":1}))
            .await
            .is_error()
    );
}

#[tokio::test(flavor = "multi_thread", worker_threads = 3)]
async fn a_module_goes_from_template_to_agent_the_same_way_on_the_command_line_and_over_mcp() {
    let dir = tempfile::tempdir().unwrap();
    let kernel = host(&dir.path().join("kernel")).await;
    let server = serve(kernel.router()).await;

    // Command line: a package written to disk, published, selected.
    let package_dir = dir.path().join("double");
    let init = cli_ok(
        &server.url,
        &[
            "module",
            "init",
            "double",
            "--directory",
            package_dir.to_str().unwrap(),
        ],
    )
    .await;
    assert!(package_dir.join("module.json").is_file());
    assert!(package_dir.join("source-files.json").is_file());
    assert!(init["refs"]["local_directory"].is_string(), "{init}");
    // Nothing already there is ever replaced.
    let (code, _) = cli(
        &server.url,
        &[
            "module",
            "init",
            "double",
            "--directory",
            package_dir.to_str().unwrap(),
        ],
    )
    .await;
    assert_ne!(code, 0);
    cli_ok(&server.url, &["repository", "add", "by-cli"]).await;
    let published = cli_ok(
        &server.url,
        &[
            "module",
            "publish",
            "by-cli",
            "--directory",
            package_dir.to_str().unwrap(),
        ],
    )
    .await;
    cli_ok(&server.url, &["agent", "create", "coder"]).await;
    cli_ok(
        &server.url,
        &[
            "agent",
            "module",
            "use",
            "coder",
            "--repository",
            "by-cli",
            "--name",
            "double",
            "--version",
            "0.1.0",
            "--alias",
            "d",
            "--export",
            "main",
        ],
    )
    .await;

    // MCP: the same steps, naming only what the contract requires.
    let client = mcp(&server.url, dir.path()).await;
    let tools = client.list_all_tools().await.unwrap();
    assert!(tools.iter().any(|t| t.name == "nofy_module_template"));
    mcp_call(
        &client,
        "nofy_repository_add",
        json!({"repository": "by-mcp"}),
    )
    .await;
    let template = mcp_call(&client, "nofy_module_template", json!({"name": "double"})).await;
    let published_over_mcp = mcp_call(
        &client,
        "nofy_module_publish",
        json!({"repository": "by-mcp", "source": template["data"]["source"]}),
    )
    .await;
    // The two routes produce the very same package.
    assert_eq!(
        published["refs"]["package_digest"], published_over_mcp["refs"]["package_digest"],
        "{published} / {published_over_mcp}"
    );
    let created = mcp_call(
        &client,
        "nofy_agent_create",
        json!({"agent": "coder2", "empty": true}),
    )
    .await;
    mcp_call(
        &client,
        "nofy_agent_module_use",
        json!({
            "target": {"kind": "project", "project_id": "coder2",
                "expected_revision": created["refs"]["source_revision"]},
            "agent": "coder2", "repository": "by-mcp", "name": "double",
            "version": "0.1.0", "alias": "d", "export": "main"
        }),
    )
    .await;
}

#[tokio::test(flavor = "multi_thread", worker_threads = 2)]
async fn syncing_or_removing_a_repository_needs_the_revision_you_read_on_the_command_line_too() {
    let dir = tempfile::tempdir().unwrap();
    let kernel = host(&dir.path().join("kernel")).await;
    let server = serve(kernel.router()).await;
    let added = cli_ok(&server.url, &["repository", "add", "lib"]).await;
    let revision = added["refs"]["repository_revision"]
        .as_str()
        .unwrap()
        .to_owned();

    // No revision: refused before anything is sent, and the error says what to do.
    let (code, refused) = cli(&server.url, &["repository", "remove", "lib"]).await;
    assert_eq!(code, 2, "{refused}");
    let message = refused["error"]["message"].as_str().unwrap();
    assert!(
        message.contains("expected_revision") && message.contains("last read"),
        "{message}"
    );
    // Nothing was removed.
    let listed = cli_ok(&server.url, &["repository", "inspect", "lib"]).await;
    assert_eq!(listed["data"]["revision"], revision.as_str());

    // A stale revision is a conflict, as it is over MCP.
    let (code, stale) = cli(
        &server.url,
        &["repository", "remove", "lib", "--expected-revision", "999"],
    )
    .await;
    assert_ne!(code, 0, "{stale}");
    assert_eq!(stale["error"]["code"], "conflict");

    // The revision that was read removes it.
    cli_ok(
        &server.url,
        &[
            "repository",
            "remove",
            "lib",
            "--expected-revision",
            &revision,
        ],
    )
    .await;
}
