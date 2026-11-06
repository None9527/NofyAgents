use super::*;

#[tokio::test]
async fn forgetting_during_embedding_discards_the_old_plan_before_primary_inference() {
    let wire = Wire::new(false);
    let remote = fixture(&wire).await;
    let dir = tempfile::tempdir().unwrap();
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let release=post(&server,"/api/v1/import",source(&remote.url,false,false)).await["bundle"]["digest"].as_str().unwrap().to_owned();
    let (stop, worker) = start(&host);
    let created = write(
        &server,
        &release,
        "fact",
        "project",
        "The Saturn launcher lifts satellites.",
    )
    .await;
    wire.hold_embedding.store(true, Ordering::SeqCst);
    post(
        &server,
        "/api/v1/runs",
        submission(&release, "root", "chat"),
    )
    .await;
    tokio::time::timeout(Duration::from_secs(30), wire.embedding_entered.notified())
        .await
        .unwrap();
    let mut forget = submission(&release, "forget-active", "remember");
    forget["parameters"] =
        json!({"operation":"forget","request":{"target":created["target"],"confirmed":true}});
    post(&server, "/api/v1/runs", forget).await;
    assert!(output(&outcome(&server, "forget-active").await).contains("forgotten"));
    let canonical_after_forget = canonical(dir.path());
    wire.hold_embedding.store(false, Ordering::SeqCst);
    wire.embedding_gate.cancel();
    assert_eq!(output(&outcome(&server, "root").await), "NO-SEMANTIC-HIT");
    assert_eq!(wire.embeddings.lock().unwrap().len(), 2);
    {
        let chats = wire.chats.lock().unwrap();
        assert_eq!(chats.len(), 1);
        assert!(!chats[0]["messages"].to_string().contains("Saturn"));
    }
    assert_eq!(canonical(dir.path()), canonical_after_forget);
    stop.cancel();
    worker.await.unwrap();
}

#[tokio::test]
async fn cancelling_an_embedding_and_explicitly_resuming_retires_its_original_plan() {
    let wire = Wire::new(false);
    let remote = fixture(&wire).await;
    let dir = tempfile::tempdir().unwrap();
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let release=post(&server,"/api/v1/import",source(&remote.url,false,false)).await["bundle"]["digest"].as_str().unwrap().to_owned();
    let (stop, worker) = start(&host);
    write(
        &server,
        &release,
        "fact",
        "project",
        "The Saturn launcher lifts satellites.",
    )
    .await;
    let original = canonical(dir.path());
    wire.hold_embedding.store(true, Ordering::SeqCst);
    post(
        &server,
        "/api/v1/runs",
        submission(&release, "root", "chat"),
    )
    .await;
    tokio::time::timeout(Duration::from_secs(30), wire.embedding_entered.notified())
        .await
        .unwrap();
    let before = host
        .store()
        .load("18:semantic-assistantroot")
        .await
        .unwrap()
        .unwrap();
    let old_scope = before
        .state
        .hook_progress
        .prepared_sources
        .unwrap()
        .pending
        .unwrap()
        .scope;
    let cancelled = post(
        &server,
        "/api/v1/runs/root/cancel",
        json!({"command_id":"cancel-embedding"}),
    )
    .await;
    assert_eq!(
        outcome(&server, "root").await["execution"]["status"],
        "cancelled"
    );
    let after = host
        .store()
        .load("18:semantic-assistantroot")
        .await
        .unwrap()
        .unwrap();
    assert!(after.state.hook_progress.prepared_sources.is_none());
    assert!(wire.chats.lock().unwrap().is_empty());
    wire.hold_embedding.store(false, Ordering::SeqCst);
    wire.embedding_gate.cancel();
    post(&server,"/api/v1/actions",json!({"command_id":"resume-cancelled-embedding","run_id":"root","command":{"kind":"resume_after_cancel","through":cancelled["cursor"]}})).await;
    let result = action_result(&server, "resume-cancelled-embedding").await;
    assert!(result["error"].is_null(), "{result}");
    // Closed roots are immutable readbacks. Continue through a newly admitted
    // root on the same thread, rather than reopening the cancelled submission.
    assert_eq!(
        result["outcome"]["Cancelled"]["state"]["hook_progress"]["source_sequence"],
        before.state.hook_progress.source_sequence,
        "{result}"
    );
    assert_eq!(wire.embeddings.lock().unwrap().len(), 1);
    let mut continued = submission(&release, "continued", "chat");
    continued["thread_id"] = json!("root");
    post(&server, "/api/v1/runs", continued).await;
    assert_eq!(
        output(&outcome(&server, "continued").await),
        "SATURN-RETRIEVED"
    );
    let final_state = host
        .store()
        .load("18:semantic-assistantroot")
        .await
        .unwrap()
        .unwrap();
    assert!(final_state.state.hook_progress.prepared_sources.is_none());
    assert!(
        final_state.state.hook_progress.source_sequence
            > before.state.hook_progress.source_sequence
    );
    assert!(!old_scope.is_empty());
    assert_eq!(wire.embeddings.lock().unwrap().len(), 3);
    assert_eq!(canonical(dir.path()), original);
    stop.cancel();
    worker.await.unwrap();
}
