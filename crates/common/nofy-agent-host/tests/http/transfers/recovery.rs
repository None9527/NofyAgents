use super::*;

#[tokio::test]
async fn default_binary_recovers_a_prepared_physical_copy_and_replays_completed_receipts() {
    let dir = nofy_test_support::canonical_tempdir().unwrap();
    let file = dir.path().join("transfer-system.json");
    tokio::fs::write(&file, serde_json::to_vec(&source()).unwrap())
        .await
        .unwrap();
    let (server, mut child) = super::super::process::binary(dir.path(), &file).await;
    let release = post(&server, "/api/v1/import", source()).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    let kept = write(
        &server,
        &release,
        "durable-keep",
        false,
        "A physical migration survives process death.",
    )
    .await;
    let erased = write(
        &server,
        &release,
        "durable-erased",
        false,
        "Erased history must never return.",
    )
    .await;
    let forgotten = operation(
        &server,
        &release,
        "durable-forget",
        false,
        json!({"operation":"forget","request":{"target":erased["target"],"confirmed":true}}),
    )
    .await;
    assert!(forgotten["error"].is_null(), "{forgotten}");
    let original = std::fs::read_dir(dir.path().join("memory"))
        .unwrap()
        .map(|entry| entry.unwrap().path())
        .find(|p| p.is_dir())
        .unwrap();
    let original_files = canonical(&original);
    assert!(!original_files.is_empty());
    let first = plan(&server, &release, false).await;
    let ready = prepare(&server, &release, false, "durable-move", &first).await;
    assert_eq!(ready["phase"], "prepared");
    let generation = ready["target"]["generation"].as_str().unwrap().to_owned();
    // The published location is a real new directory; neither an alias nor the old namespace path.
    let copied = dir
        .path()
        .join("memory/.transfers")
        .join(&generation)
        .join("store");
    assert!(copied.join("meta.sqlite").is_file());
    assert_ne!(copied, original);
    assert_eq!(canonical(&copied), original_files);
    assert_eq!(canonical(&original), original_files);
    child.kill().await.unwrap();
    assert!(!child.wait().await.unwrap().success());
    drop(server);
    let (server, mut child) = super::super::process::binary(dir.path(), &file).await;
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/memory/transfers/durable-move",
            ADMIN,
            Value::Null
        )
        .await
        .1,
        ready
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/runs",
            ADMIN,
            submission(&release, "blocked-after-exit", "list")
        )
        .await
        .0,
        503
    );
    // Recovery depends only on the durable command ID and its original fingerprint.
    let completed = apply(&server, "durable-move", &first).await;
    assert_eq!(completed["phase"], "completed");
    assert_eq!(completed["target"]["generation"], generation);
    let notes = listed(&server, &release, "after-crash", true).await;
    assert!(notes.to_string().contains("survives process death"));
    assert!(!notes.to_string().contains("must never return"));
    let undone = operation(
        &server,
        &release,
        "old-undo-after-crash",
        true,
        json!({"operation":"undo","request":kept["undo_token"]}),
    )
    .await;
    assert_eq!(undone["value"]["restored"], true, "{undone}");
    child.kill().await.unwrap();
    child.wait().await.unwrap();
    drop(server);
    let (server, mut child) = super::super::process::binary(dir.path(), &file).await;
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/memory/transfers/durable-move",
            ADMIN,
            Value::Null
        )
        .await
        .1,
        completed
    );
    assert_eq!(apply(&server, "durable-move", &first).await, completed);
    let notes = listed(&server, &release, "final-read", true).await;
    assert_eq!(notes["items"], json!([]));
    post(
        &server,
        "/api/v1/actions",
        json!({"command_id":"source-readback","run_id":"durable-keep","command":{"kind":"resume"}}),
    )
    .await;
    let replay = action_result(&server, "source-readback").await;
    assert!(replay["error"].is_null(), "{replay}");
    child.kill().await.unwrap();
    child.wait().await.unwrap();
}
