use super::*;
use futures::StreamExt;
#[tokio::test]
async fn queued_cancel_and_disconnected_event_client_do_not_lose_or_duplicate_live_execution() {
    let calls = Arc::new(AtomicUsize::new(0));
    let observed = Arc::new(tokio::sync::Notify::new());
    let count = calls.clone();
    let signal = observed.clone();
    let provider = serve(Router::new().route(
        "/v1/chat/completions",
        route_post(move || {
            let count = count.clone();
            let signal = signal.clone();
            async move {
                count.fetch_add(1, Ordering::SeqCst);
                signal.notify_one();
                let frames = nofy_test_support::sse::chat_completion_events_exact(
                    "partial output",
                    "test-model",
                );
                let stream = async_stream::stream! {
                    for event in frames.into_iter().take(2) {yield Ok::<_,Infallible>(event);}
                    std::future::pending::<()>().await;
                };
                Sse::new(stream)
            }
        }),
    ))
    .await;
    let directory = tempfile::tempdir().unwrap();
    let host = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let release = import(&server, &document(&provider.url)).await;
    post(&server, "/api/v1/runs", run(&release, "queued-cancel")).await;
    assert_eq!(
        post(
            &server,
            "/api/v1/runs/queued-cancel/cancel",
            json!({"command_id":"cancel-queued"})
        )
        .await["queued_cancelled"],
        true
    );
    post(&server, "/api/v1/runs", run(&release, "live-cancel")).await;
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker_host = host.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 2).await.unwrap() });
    tokio::time::timeout(Duration::from_secs(10), observed.notified())
        .await
        .unwrap();
    let response = reqwest::Client::new()
        .get(format!("{}/api/v1/runs/live-cancel/stream", server.url))
        .bearer_auth(ADMIN)
        .send()
        .await
        .unwrap();
    assert_eq!(response.status(), 200);
    let mut frames = response.bytes_stream();
    let first = tokio::time::timeout(Duration::from_secs(3), frames.next())
        .await
        .unwrap()
        .unwrap()
        .unwrap();
    assert!(String::from_utf8_lossy(&first).contains("event: runtime"));
    drop(frames);
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/runs/live-cancel",
            ADMIN,
            Value::Null
        )
        .await
        .1["execution"]["status"],
        "running"
    );
    let cancelled = post(
        &server,
        "/api/v1/runs/live-cancel/cancel",
        json!({"command_id":"cancel-live"}),
    )
    .await;
    assert!(cancelled["cursor"].as_u64().unwrap() > 0);
    assert_eq!(
        outcome(&server, "live-cancel").await["execution"]["status"],
        "cancelled"
    );
    assert_eq!(calls.load(Ordering::SeqCst), 1);
    let cursor = host
        .store()
        .events("live-cancel", 0, 1000)
        .await
        .unwrap()
        .last()
        .unwrap()
        .cursor;
    let response = reqwest::Client::new()
        .get(format!("{}/api/v1/runs/live-cancel/stream", server.url))
        .bearer_auth(ADMIN)
        .header("Last-Event-ID", (cursor - 1).to_string())
        .send()
        .await
        .unwrap();
    let mut stream = response.bytes_stream();
    let frame = tokio::time::timeout(Duration::from_secs(3), stream.next())
        .await
        .unwrap()
        .unwrap()
        .unwrap();
    assert!(String::from_utf8_lossy(&frame).contains(&format!("id: {cursor}")));
    host.shutdown();
    let ended = tokio::time::timeout(Duration::from_secs(3), stream.next())
        .await
        .unwrap();
    assert!(ended.is_none());
    stop.cancel();
    worker.await.unwrap();
}
