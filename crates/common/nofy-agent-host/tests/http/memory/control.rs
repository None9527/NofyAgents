use super::*;
pub(super) fn selector(release: &str) -> Value {
    json!({"system":"declared-memory","release":release,"module":{"id":"memory-store","version":"1"}})
}
pub(super) fn change(release: &str, id: &str, revision: u64, open: bool) -> Value {
    json!({"resource":selector(release),"command":{"command_id":id,"expected_revision":revision,"open":open}})
}
const INSPECT: &str = "/api/v1/memory/resources/inspect";
const APPLY: &str = "/api/v1/memory/resources/apply";

#[tokio::test]
async fn declared_resource_close_reopen_and_receipts_survive_kernel_reopen_without_data_loss() {
    let dir = tempfile::tempdir().unwrap();
    let first = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(first.router()).await;
    let release = post(&server, "/api/v1/import", source()).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    let initial = post(&server, INSPECT, selector(&release)).await;
    assert_eq!(initial["revision"], 0);
    assert_eq!(initial["open"], true);
    assert!(!dir.path().join("memory").exists());
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            INSPECT,
            VIEW,
            selector(&release)
        )
        .await
        .0,
        403
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            APPLY,
            VIEW,
            change(&release, "close", 0, false)
        )
        .await
        .0,
        403
    );
    let mut wrong = selector(&release);
    wrong["module"]["id"] = json!("memory-tools");
    assert_eq!(
        request(&server, reqwest::Method::POST, INSPECT, ADMIN, wrong)
            .await
            .0,
        422
    );
    let mut wrong = selector(&release);
    wrong["system"] = json!("other-system");
    assert_eq!(
        request(&server, reqwest::Method::POST, INSPECT, ADMIN, wrong)
            .await
            .0,
        404
    );
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let running = first.clone();
    let worker = tokio::spawn(async move { running.run_worker(signal, 1).await.unwrap() });
    post(
        &server,
        "/api/v1/runs",
        submission(&release, "managed-write", "remember"),
    )
    .await;
    let created = value(&outcome(&server, "managed-write").await);
    let receipt = post(&server, APPLY, change(&release, "close", 0, false)).await;
    assert_eq!(receipt["revision"], 1);
    assert_eq!(
        post(&server, INSPECT, selector(&release)).await["open"],
        false
    );
    post(
        &server,
        "/api/v1/runs",
        submission(&release, "closed-list", "list"),
    )
    .await;
    assert!(
        outcome(&server, "closed-list")
            .await
            .to_string()
            .contains("memory resource is closed")
    );
    assert_eq!(
        post(&server, APPLY, change(&release, "close", 0, false)).await,
        receipt
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            APPLY,
            ADMIN,
            change(&release, "close", 0, true)
        )
        .await
        .0,
        409
    );
    stop.cancel();
    worker.await.unwrap();
    drop(server);
    drop(first);
    let reopened = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(reopened.router()).await;
    assert_eq!(
        post(&server, INSPECT, selector(&release)).await["open"],
        false
    );
    assert_eq!(
        post(&server, APPLY, change(&release, "close", 0, false)).await,
        receipt
    );
    post(&server, APPLY, change(&release, "open", 1, true)).await;
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let running = reopened.clone();
    let worker = tokio::spawn(async move { running.run_worker(signal, 1).await.unwrap() });
    post(
        &server,
        "/api/v1/runs",
        submission(&release, "reopened-list", "list"),
    )
    .await;
    assert!(
        value(&outcome(&server, "reopened-list").await)
            .to_string()
            .contains("blue release")
    );
    let mut undo = submission(&release, "reopened-undo", "remember");
    undo["parameters"] = json!({"operation":"undo","request":created["undo_token"]});
    post(&server, "/api/v1/runs", undo).await;
    value(&outcome(&server, "reopened-undo").await);
    assert_eq!(
        post(&server, INSPECT, selector(&release)).await["revision"],
        2
    );
    stop.cancel();
    worker.await.unwrap();
}
