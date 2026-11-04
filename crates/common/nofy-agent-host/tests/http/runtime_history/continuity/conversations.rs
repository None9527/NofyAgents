use super::*;
use nofy_agent_runtime::supervisor::RunSupervisor;

fn conversation_document(url: &str) -> SystemDocument {
    let mut value = serde_json::to_value(document(url)).unwrap();
    value["programs"]["chat"]["definition"]["settings"]["model"]["max_output_tokens"] = json!(32);
    value["modules"].as_array_mut().unwrap().extend([
        json!({"reference":{"id":"ledger","version":"1"},"factory":"resource.budget","config":{}}),
        json!({"reference":{"id":"quota","version":"1"},"factory":"governance.budget_connected","config":{"limits":{"max_model_calls":2,"max_duration_ms":60000}},"dependencies":{"budget":{"id":"ledger","version":"1"}}})
    ]);
    value["required_governance"] = json!([{"id":"quota","version":"1"}]);
    serde_json::from_value(value).unwrap()
}
fn turn(release: &str, id: &str) -> Value {
    let mut value = run(release, id);
    value["thread_id"] = json!("stable-thread");
    value["input"]["text"] = json!(id);
    value
}
#[tokio::test]
async fn queued_session_turns_and_shared_budget_continue_after_forward_and_reverse_migration() {
    let requests = Arc::new(Mutex::new(vec![]));
    let provider = serve(
        Router::new()
            .route(
                "/v1/chat/completions",
                route_post(super::super::super::provider),
            )
            .with_state(requests.clone()),
    )
    .await;
    let dir = tempfile::tempdir().unwrap();
    let host = host(&dir.path().join("host"), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let doc = conversation_document(&provider.url);
    let registry = host
        .control()
        .prepare(doc.clone())
        .unwrap()
        .registry()
        .clone();
    let release = import(&server, &doc).await;
    let storage = storage(&server, &dir.path().join("external")).await;
    for id in ["first", "second", "third"] {
        post(&server, "/api/v1/runs", turn(&release, id)).await;
    }
    let adoption = post(
        &server,
        "/api/v1/sessions",
        json!({"session_id":"conversation","root_run_id":"first"}),
    )
    .await;
    RunSupervisor::new(host.store().clone())
        .execute_submitted(&registry, "first")
        .await
        .unwrap();
    let scope = scoped(&host, "portable-assistant", "first").await;
    let original = budget(&host, &scope).await.unwrap();
    assert_eq!(original["used"]["model_calls"], 1);
    let first_turns = read(&server, "/api/v1/sessions/conversation/turns").await;
    let first_turns = session_turn_items(&first_turns);
    let cursor = first_turns[0]["sequence"].as_u64().unwrap();
    let first_record = read(&server, "/api/v1/runs/first").await;
    let invalid = request(
        &server,
        reqwest::Method::POST,
        "/api/v1/runtime/storage/plan",
        ADMIN,
        selection(&storage, true),
    )
    .await;
    assert_eq!(invalid.0, 422, "{}", invalid.1);
    assert!(!host.loader().model_status().stopping);
    let abort_plan = plan(&server, &storage, false).await;
    prepare(&server, &storage, false, "session-abort", &abort_plan).await;
    assert_eq!(
        post(
            &server,
            "/api/v1/runtime/storage/abort",
            command("session-abort", &abort_plan)
        )
        .await["phase"],
        "aborted"
    );
    assert!(!host.loader().model_status().stopping);
    assert_eq!(budget(&host, &scope).await.unwrap(), original);
    relocate(&host, &server, &storage, false, "session-forward").await;
    assert_eq!(budget(&host, &scope).await.unwrap(), original);
    assert_eq!(read(&server, "/api/v1/runs/first").await, first_record);
    let (stop, worker) = start(&host);
    assert_eq!(
        outcome(&server, "second").await["execution"]["status"],
        "completed"
    );
    assert_eq!(
        outcome(&server, "third").await["execution"]["status"],
        "budget_exceeded"
    );
    assert_eq!(requests.lock().unwrap().len(), 2);
    let messages = requests.lock().unwrap()[1]["messages"].to_string();
    assert!(messages.contains("first") && messages.contains("second"));
    let after = budget(&host, &scope).await.unwrap();
    assert_eq!(after["used"]["model_calls"], 2);
    assert_eq!(after["deadline_ms"], original["deadline_ms"]);
    assert_eq!(after["created_at_ms"], original["created_at_ms"]);
    let mut foreign = scope.clone().unwrap();
    foreign.root_run_id = "second".into();
    assert!(host.store().inspect(&foreign).await.unwrap().is_none());
    relocate(&host, &server, &storage, true, "session-reverse").await;
    assert_eq!(budget(&host, &scope).await.unwrap(), after);
    let session = read(&server, "/api/v1/sessions/conversation").await;
    assert_eq!(session_origin(&session), session_origin(&adoption));
    assert_eq!(session["active_run_id"], "third");
    let tail = read(
        &server,
        &format!("/api/v1/sessions/conversation/turns?after={cursor}"),
    )
    .await;
    let tail = session_turn_items(&tail);
    assert_eq!(tail.as_array().unwrap().len(), 2);
    assert_eq!(tail[0]["run_id"], "second");
    assert_eq!(tail[1]["run_id"], "third");
    let retry =
        json!({"command_id":"still-exhausted","run_id":"third","command":{"kind":"resume"}});
    post(&server, "/api/v1/actions", retry).await;
    let result = action_result(&server, "still-exhausted").await;
    assert!(result["error"].is_null(), "{result}");
    assert_eq!(
        outcome(&server, "third").await["execution"]["status"],
        "budget_exceeded"
    );
    assert_eq!(requests.lock().unwrap().len(), 2);
    stop_worker(&host, stop, worker).await;
}

fn approval_document(url: &str) -> SystemDocument {
    let mut value = serde_json::to_value(document(url)).unwrap();
    value["name"] = json!("approval-continuity");
    value["required_policies"] = json!([{"id":"approval","version":"1"}]);
    value["modules"].as_array_mut().unwrap().extend([
        json!({"reference":{"id":"service","version":"1"},"factory":"resource.http","config":{"base_url":format!("{url}/"),"methods":["POST"]}}),
        json!({"reference":{"id":"effect","version":"1"},"factory":"tool.http_connected","config":{"contract":{"name":"effect"},"path":"effect","method":"POST"},"dependencies":{"connection":{"id":"service","version":"1"}}}),
        json!({"reference":{"id":"approval","version":"1"},"factory":"policy.approval","config":{}})
    ]);
    value["programs"]["chat"]["definition"]["tool_packs"] = json!([{"id":"effect","version":"1"}]);
    serde_json::from_value(value).unwrap()
}
fn approval_run(release: &str, id: &str) -> Value {
    json!({"run_id":id,"thread_id":id,"system":"approval-continuity","release":release,"program":"chat","input":{"text":id,"attachments":[]}})
}
fn pending_cancel(host: &KernelHost) -> (u64, bool) {
    let db = rusqlite::Connection::open_with_flags(
        host.store().path().unwrap(),
        rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY,
    )
    .unwrap();
    db.query_row(
        "SELECT sequence,acknowledged FROM agent_runtime_cancel WHERE command_id='cancel-original'",
        [],
        |row| Ok((row.get(0)?, row.get(1)?)),
    )
    .unwrap()
}
#[tokio::test]
async fn pending_approval_fifo_mail_and_durable_cancel_keep_original_identity_across_moves() {
    let models = Arc::new(Mutex::new(Vec::<Value>::new()));
    let model_requests = models.clone();
    let effects = Arc::new(AtomicUsize::new(0));
    let called = effects.clone();
    let service=serve(Router::new().route("/v1/chat/completions",route_post(move|Json(body):Json<Value>|{
        let requests=model_requests.clone();async move{
            let finished=body["messages"].as_array().unwrap().iter().any(|m|m["role"]=="tool");requests.lock().unwrap().push(body);
            let events=if finished{nofy_test_support::sse::chat_completion_events_exact("finished","test-model")}else{
                nofy_test_support::sse::chat_completions_reasoning_then_tool_call_events("","one-effect","effect","{}","test-model").into_iter().map(|e|axum::response::sse::Event::default().data(e.data)).collect()
            };Sse::new(futures::stream::iter(events.into_iter().map(Ok::<_,Infallible>)))
        }
    })).route("/effect",route_post(move||{let called=called.clone();async move{called.fetch_add(1,Ordering::SeqCst);Json(json!({"accepted":true}))}}))).await;
    let dir = tempfile::tempdir().unwrap();
    let host = host(&dir.path().join("host"), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let release = import(&server, &approval_document(&service.url)).await;
    let storage = storage(&server, &dir.path().join("external")).await;
    let (stop, worker) = start(&host);
    post(&server, "/api/v1/runs", approval_run(&release, "approved")).await;
    assert_eq!(
        outcome(&server, "approved").await["execution"]["status"],
        "paused"
    );
    assert_eq!(effects.load(Ordering::SeqCst), 0);
    let approvals = read(&server, "/api/v1/runs/approved/approvals").await;
    assert_eq!(approvals.as_array().unwrap().len(), 1);
    let approval = approvals[0].clone();
    let record = host
        .store()
        .execution_record("approved")
        .await
        .unwrap()
        .unwrap();
    let mut envelopes = Vec::new();
    for (id, text) in [("mail-one", "first-mail"), ("mail-two", "second-mail")] {
        let envelope = json!({"address":{"root_run_id":"approved","run_id":"approved","thread_id":record.thread_id,"agent":record.snapshot.name()},"input_id":id,"input":{"kind":"interject","message":{"text":text,"attachments":[]}}});
        let accepted = post(&server, "/api/v1/runs/approved/inputs", envelope.clone()).await;
        assert!(accepted["sequence"].as_u64().unwrap() > 0);
        envelopes.push(envelope);
    }
    relocate(&host, &server, &storage, false, "approval-forward").await;
    assert_eq!(
        read(&server, "/api/v1/runs/approved/approvals").await,
        approvals
    );
    assert_eq!(effects.load(Ordering::SeqCst), 0);
    let mut forged = approval.clone();
    forged["call"]["arguments"] = json!({"changed":true});
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/runs/approved/approvals",
            ADMIN,
            json!({"request":forged,"allow":true})
        )
        .await
        .0,
        409
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/runs/approved/approvals",
            ADMIN,
            json!({"request":approval,"allow":true})
        )
        .await
        .0,
        204
    );
    let resume =
        json!({"command_id":"resume-original","run_id":"approved","command":{"kind":"resume"}});
    post(&server, "/api/v1/actions", resume.clone()).await;
    let receipt = action_result(&server, "resume-original").await;
    assert!(receipt["error"].is_null(), "{receipt}");
    assert_eq!(
        outcome(&server, "approved").await["execution"]["status"],
        "completed"
    );
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    let requests = models.lock().unwrap().clone();
    assert_eq!(requests.len(), 2);
    let messages = requests[1]["messages"].to_string();
    assert!(messages.find("first-mail").unwrap() < messages.find("second-mail").unwrap());
    relocate(&host, &server, &storage, true, "approval-reverse").await;
    assert_eq!(post(&server, "/api/v1/actions", resume).await, receipt);
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    for envelope in envelopes {
        let body: nofy_agent_runtime::mailbox::MailEnvelope =
            serde_json::from_value(envelope).unwrap();
        let status = nofy_agent_runtime::mailbox::MailboxSender::input_status(
            host.store(),
            &body.address,
            &body.input_id,
        )
        .await
        .unwrap()
        .unwrap();
        assert_eq!(serde_json::to_value(status).unwrap()["status"], "delivered");
    }
    post(&server, "/api/v1/runs", approval_run(&release, "cancelled")).await;
    assert_eq!(
        outcome(&server, "cancelled").await["execution"]["status"],
        "paused"
    );
    let cancelled = post(
        &server,
        "/api/v1/runs/cancelled/cancel",
        json!({"command_id":"cancel-original"}),
    )
    .await;
    assert!(cancelled["cursor"].as_u64().unwrap() > 0);
    let original_cancel = pending_cancel(&host);
    assert!(!original_cancel.1);
    relocate(&host, &server, &storage, false, "cancel-forward").await;
    assert_eq!(pending_cancel(&host), original_cancel);
    post(
        &server,
        "/api/v1/actions",
        json!({"command_id":"resume-cancelled","run_id":"cancelled","command":{"kind":"resume"}}),
    )
    .await;
    let cancelled = action_result(&server, "resume-cancelled").await;
    assert!(cancelled["error"].is_null(), "{cancelled}");
    assert_eq!(
        outcome(&server, "cancelled").await["execution"]["status"],
        "cancelled"
    );
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    stop_worker(&host, stop, worker).await;
}
