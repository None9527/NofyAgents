//! Real HTTP receipt reads, with no isolated-worker or platform probe.
use super::*;

fn receipt_url(server: &Serving, root: &str, input: &str, address: &Value) -> reqwest::Url {
    let mut url = reqwest::Url::parse(&server.url).unwrap();
    url.path_segments_mut()
        .unwrap()
        .extend(["api", "v1", "runs", root, "inputs", input]);
    url.query_pairs_mut()
        .append_pair("run_id", address["run_id"].as_str().unwrap())
        .append_pair("thread_id", address["thread_id"].as_str().unwrap())
        .append_pair("agent", address["agent"].as_str().unwrap());
    url
}

async fn lookup(url: reqwest::Url, token: Option<&str>) -> (u16, Value) {
    let mut request = reqwest::Client::new().get(url);
    if let Some(token) = token {
        request = request.bearer_auth(token);
    }
    let response = request.send().await.unwrap();
    let status = response.status().as_u16();
    if status == 200 {
        assert_eq!(response.headers()["cache-control"], "no-store");
    }
    let text = response.text().await.unwrap();
    let body = serde_json::from_str(&text).unwrap_or_else(|_| json!(text));
    (status, body)
}

#[tokio::test]
async fn input_receipt_http_is_read_only_scoped_and_payload_bound() {
    let dir = tempfile::tempdir().unwrap();
    let kernel = KernelHost::open(
        &dir.path().join("state"),
        native::registry(Arc::new(Credentials(Arc::new(AtomicUsize::new(0))))).unwrap(),
        Authorizer::new(vec![
            (
                ADMIN.into(),
                [
                    Scope::Read,
                    Scope::Execute,
                    Scope::Publish,
                    Scope::Edit,
                    Scope::Resources,
                ]
                .into(),
            ),
            (VIEW.into(), [Scope::Read].into()),
            (EDIT.into(), [Scope::Edit].into()),
        ])
        .unwrap(),
    )
    .await
    .unwrap();
    let server = serve(kernel.router()).await;
    let doc = document("http://127.0.0.1:9");
    let release = import(&server, &doc).await;
    for id in ["receipt-root", "other-root", "queued-root"] {
        post(&server, "/api/v1/runs", run(&release, id)).await;
    }
    // Populate only fixture execution facts from the actual admitted jobs.
    // No evaluator, worker, model request or confinement probe is needed.
    for id in ["receipt-root", "other-root"] {
        let job = kernel.store().execution_job(id).await.unwrap().unwrap();
        let record = nofy_agent_runtime::supervisor::ExecutionRecord {
            submission: Some(job.digest),
            run_id: id.into(),
            thread_id: job.submission.thread_id,
            snapshot: job.submission.snapshot,
            composition: job.submission.composition_digest,
            status: "running".into(),
            outcome: None,
            error: None,
            model_failure: None,
        };
        let key = format!("fixture:{id}");
        let connection = rusqlite::Connection::open(kernel.store().path().unwrap()).unwrap();
        connection
            .execute(
                "INSERT INTO agent_runtime_runs(id,thread_key,payload) VALUES(?1,?2,?3)",
                rusqlite::params![id, key, serde_json::to_string(&record).unwrap()],
            )
            .unwrap();
        connection
            .execute(
                "INSERT INTO agent_runtime_threads(key,active_run) VALUES(?1,?2)",
                rusqlite::params![key, id],
            )
            .unwrap();
    }
    let record = kernel
        .store()
        .execution_record("receipt-root")
        .await
        .unwrap()
        .unwrap();
    let address = json!({
        "root_run_id": "receipt-root", "run_id": "receipt-root",
        "thread_id": record.thread_id, "agent": record.snapshot.name()
    });
    let input_id = "receipt +/界?";
    let envelope = json!({
        "address": address, "input_id": input_id,
        "input": {"kind": "follow_up", "message": {"text": "original private input", "attachments": []}}
    });
    let accepted = post(
        &server,
        "/api/v1/runs/receipt-root/inputs",
        envelope.clone(),
    )
    .await;
    assert_eq!(accepted["status"], "pending");
    let url = receipt_url(&server, "receipt-root", input_id, &address);
    let before_events = kernel
        .store()
        .events("receipt-root", 0, 1000)
        .await
        .unwrap();
    for _ in 0..3 {
        let (status, receipt) = lookup(url.clone(), Some(VIEW)).await;
        assert_eq!(status, 200, "{receipt}");
        assert_eq!(receipt, accepted);
    }
    let after_events = kernel
        .store()
        .events("receipt-root", 0, 1000)
        .await
        .unwrap();
    assert_eq!(
        serde_json::to_value(before_events).unwrap(),
        serde_json::to_value(after_events).unwrap()
    );
    for token in [None, Some("incorrect-token"), Some(EDIT)] {
        let (status, body) = lookup(url.clone(), token).await;
        assert_eq!(
            status,
            if token == Some(EDIT) { 403 } else { 401 },
            "{body}"
        );
        assert!(!body.to_string().contains("original private input"));
    }
    let not_found = json!({"error": {"code": "not_found", "message": "not found"}});
    let mut missing_urls = vec![
        receipt_url(&server, "receipt-root", "unsubmitted", &address),
        receipt_url(&server, "absent-root", input_id, &address),
        receipt_url(&server, "queued-root", input_id, &address),
        receipt_url(&server, "other-root", input_id, &address),
    ];
    for (field, value) in [
        ("run_id", "other-root"),
        ("thread_id", "foreign-thread"),
        ("agent", "foreign-agent"),
    ] {
        let mut mismatch = address.clone();
        mismatch[field] = json!(value);
        missing_urls.push(receipt_url(&server, "receipt-root", input_id, &mismatch));
    }
    for url in missing_urls {
        let (status, body) = lookup(url, Some(VIEW)).await;
        assert_eq!(status, 404, "{body}");
        assert_eq!(body, not_found);
    }
    let mut changed = envelope.clone();
    changed["input"]["message"]["text"] = json!("changed payload");
    let (status, error) = request(
        &server,
        reqwest::Method::POST,
        "/api/v1/runs/receipt-root/inputs",
        ADMIN,
        changed,
    )
    .await;
    assert_eq!(status, 409, "{error}");
    assert_eq!(lookup(url.clone(), Some(VIEW)).await.1, accepted);
    assert_eq!(
        post(&server, "/api/v1/runs/receipt-root/inputs", envelope).await,
        accepted
    );

    // A recorded child is addressable only inside its original root tree.
    // These rows belong only to this fixture's temporary database.
    let child = nofy_agent_runtime::supervisor::ChildRunRecord {
        root_run_id: "receipt-root".into(),
        parent_run_id: "receipt-root".into(),
        run_id: "receipt-child".into(),
        thread_id: "child-thread".into(),
        agent_name: "child-agent".into(),
        composition: "fixture".into(),
        status: "running".into(),
        error: None,
        kind: Some("agent".into()),
        checkpoint_key: None,
        workflow_ref: None,
        node_id: None,
    };
    let connection = rusqlite::Connection::open(kernel.store().path().unwrap()).unwrap();
    connection
        .execute(
            "INSERT INTO agent_runtime_children(key,root_id,payload) VALUES(?1,?2,?3)",
            rusqlite::params![
                serde_json::to_string(&("receipt-root", "receipt-child")).unwrap(),
                "receipt-root",
                serde_json::to_string(&child).unwrap()
            ],
        )
        .unwrap();
    drop(connection);
    let child_address = json!({
        "root_run_id": "receipt-root", "run_id": "receipt-child",
        "thread_id": "child-thread", "agent": "child-agent"
    });
    let child_envelope = json!({
        "address": child_address, "input_id": input_id,
        "input": {"kind": "follow_up", "message": {"text": "child private input", "attachments": []}}
    });
    let child_receipt = post(&server, "/api/v1/runs/receipt-root/inputs", child_envelope).await;
    let child_url = receipt_url(&server, "receipt-root", input_id, &child_address);
    assert_eq!(
        lookup(child_url.clone(), Some(VIEW)).await,
        (200, child_receipt.clone())
    );
    assert_eq!(
        lookup(
            receipt_url(&server, "other-root", input_id, &child_address),
            Some(VIEW)
        )
        .await,
        (404, not_found.clone())
    );
    let mut wrong_child = child_address.clone();
    wrong_child["thread_id"] = json!("receipt-root");
    assert_eq!(
        lookup(
            receipt_url(&server, "receipt-root", input_id, &wrong_child),
            Some(VIEW)
        )
        .await,
        (404, not_found)
    );
    for bad_query in ["root_run_id=other-root", "payload=changed"] {
        let mut unknown = url.clone();
        unknown.set_query(Some(&format!("{}&{bad_query}", unknown.query().unwrap())));
        assert_eq!(lookup(unknown, Some(VIEW)).await.0, 400);
    }
    assert_eq!(
        lookup(
            receipt_url(&server, "receipt-root", &"x".repeat(257), &address),
            Some(VIEW)
        )
        .await
        .0,
        422
    );
    assert_eq!(lookup(url.clone(), Some(VIEW)).await.1, accepted);
    // No active-thread ownership requirement is added to historical reads.
    let connection = rusqlite::Connection::open(kernel.store().path().unwrap()).unwrap();
    connection.execute(
        "UPDATE agent_runtime_threads SET active_run='newer-turn' WHERE active_run='receipt-root'", [],
    ).unwrap();
    let count: i64 = connection
        .query_row("SELECT COUNT(*) FROM agent_runtime_mailbox", [], |row| {
            row.get(0)
        })
        .unwrap();
    assert_eq!(lookup(child_url, Some(VIEW)).await, (200, child_receipt));
    assert_eq!(lookup(url, Some(VIEW)).await.0, 200);
    assert_eq!(
        connection
            .query_row("SELECT COUNT(*) FROM agent_runtime_mailbox", [], |row| row
                .get::<_, i64>(
                0
            ))
            .unwrap(),
        count
    );
}
