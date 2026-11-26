use super::*;
use nofy_agent_runtime::{
    control::FileCatalogStore,
    durable::SqliteStore,
    supervisor::{RunSupervisor, jobs::ProgramSubmission},
    system::SystemFile,
};

#[tokio::test]
async fn maintenance_excludes_resource_catalog_and_runtime_commits_without_hiding_read_views() {
    let dir = tempfile::tempdir().unwrap();
    let (kernel, server, installed) = setup(dir.path()).await;
    let source = document(&installed, json!({"bundle":package(2)}));
    let release = post(&server, "/api/v1/import", source.clone()).await;
    let revision = kernel.control().inspect().await.unwrap().unwrap().revision;
    let held = kernel.loader().commits.exclusive().unwrap();
    assert!(kernel.loader().commits.shared().is_err());
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/artifacts",
            ADMIN,
            package(3)
        )
        .await
        .0,
        503
    );
    assert!(
        kernel
            .control()
            .save_draft("blocked", None, serde_json::from_value(source).unwrap())
            .await
            .is_err()
    );
    let (status, _) = request(
        &server,
        reqwest::Method::POST,
        "/api/v1/runs",
        ADMIN,
        run(release["bundle"]["digest"].as_str().unwrap(), "blocked"),
    )
    .await;
    assert!(status >= 400);
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
    drop(held);
    assert_eq!(
        kernel.control().inspect().await.unwrap().unwrap().revision,
        revision
    );
    assert!(
        kernel
            .store()
            .execution_job("blocked")
            .await
            .unwrap()
            .is_none()
    );
    assert!(SqliteStore::open(&dir.path().join("runtime.sqlite")).is_err());
    assert!(FileCatalogStore::open(dir.path().join("catalog.json")).is_err());
    post(&server, "/api/v1/artifacts", package(3)).await;
    post(
        &server,
        "/api/v1/runs",
        run(release["bundle"]["digest"].as_str().unwrap(), "accepted"),
    )
    .await;
}

#[tokio::test]
async fn cached_compilation_cannot_admit_a_missing_image_and_exact_readmission_restores_execution()
{
    let image = tokio::task::spawn_blocking(sources::image).await.unwrap();
    let digest = image.manifest.digest().unwrap();
    let dir = tempfile::tempdir().unwrap();
    let (kernel, server, _) = setup(dir.path()).await;
    post(&server, "/api/v1/runtime-images", json!(&image)).await;
    let bundle = json!({"schema_version":1,"files":{"main.sh":"IFS= read -r line || :\nn=${line#'{\"n\":'}\nn=${n%'}'}\nprintf '{\"result\":%s,\"pid\":%s}' \"$((n*2))\" \"$$\"\n"}});
    let mut source = document(&Value::Null, json!({"bundle":bundle}));
    source["modules"][1]["factory"] = json!("resource.process_locked");
    source["modules"][1]["config"] = json!({"manifest":image.manifest});
    source["modules"][2]["config"]["entrypoint"] = json!("main.sh");
    let compiled = kernel
        .control()
        .prepare(serde_json::from_value(source).unwrap())
        .unwrap();
    let program = compiled.program("compute").unwrap();
    let submission = ProgramSubmission::for_program(program, "stale", "stale", None).unwrap();
    let object = dir
        .path()
        .join("loader/images/objects")
        .join(format!("{digest}.json"));
    let backup = dir.path().join("image-backup");
    std::fs::rename(&object, &backup).unwrap();
    let supervisor = RunSupervisor::new(kernel.store().clone());
    assert!(supervisor.submit_program(submission.clone()).await.is_err());
    assert!(
        kernel
            .store()
            .execution_job("stale")
            .await
            .unwrap()
            .is_none()
    );
    assert!(
        kernel
            .control()
            .install_file(SystemFile::Locked(compiled.bundle.clone()))
            .await
            .is_err()
    );
    assert!(kernel.control().inspect().await.unwrap().is_none());
    std::fs::rename(backup, object).unwrap();
    kernel
        .control()
        .install_file(SystemFile::Locked(compiled.bundle.clone()))
        .await
        .unwrap();
    supervisor.submit_program(submission).await.unwrap();
    let result = supervisor
        .execute_submitted(compiled.registry(), "stale")
        .await
        .unwrap();
    let Some(nofy_agent_runtime::RunOutcome::Completed { output, .. }) = result else {
        panic!("unexpected execution: {result:?}");
    };
    let decoded: Value = serde_json::from_str(&output).unwrap();
    assert_eq!(decoded.get("value").unwrap_or(&decoded)["result"], 2);
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
}
