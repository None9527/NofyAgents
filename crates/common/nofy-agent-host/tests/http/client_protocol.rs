//! Browser transport contract, exercised through the authenticated real router.
use super::*;
use futures::StreamExt;
use nofy_agent_runtime::events::{EventEnvelope, EventScope, RunEvent};

async fn frame(server: &Serving, after: &str, resume: Option<&str>) -> String {
    let mut request = reqwest::Client::new()
        .get(format!(
            "{}/api/v1/runs/exact-run/stream?encoding=exact&after={after}&limit=1",
            server.url
        ))
        .bearer_auth(VIEW);
    if let Some(cursor) = resume {
        request = request.header("Last-Event-ID", cursor);
    }
    let response = request.send().await.unwrap();
    assert_eq!(response.status(), 200);
    assert!(
        response.headers()["content-type"]
            .to_str()
            .unwrap()
            .starts_with("text/event-stream")
    );
    let mut bytes = response.bytes_stream();
    tokio::time::timeout(Duration::from_secs(3), async {
        let mut text = String::new();
        while !text.contains("\n\n") {
            text.push_str(std::str::from_utf8(&bytes.next().await.unwrap().unwrap()).unwrap());
        }
        text.split("\n\n").next().unwrap().to_owned()
    })
    .await
    .unwrap()
}

#[tokio::test]
async fn exact_http_events_preserve_u64_resume_and_native_compatibility() {
    let dir = tempfile::tempdir().unwrap();
    let kernel = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(kernel.router()).await;
    let release = import(&server, &document("http://127.0.0.1:9")).await;
    post(&server, "/api/v1/runs", run(&release, "exact-run")).await;
    // Controlled fixture state, not a production cursor-rewriting operation.
    // Include values above Number.MAX_SAFE_INTEGER and business data at u64::MAX.
    let first = 9_007_199_254_740_993u64;
    let connection = rusqlite::Connection::open(kernel.store().path().unwrap()).unwrap();
    for cursor in [first, first + 1] {
        let event = EventEnvelope {
            version: 1,
            cursor,
            timestamp_ms: u64::MAX,
            scope: EventScope {
                root_run_id: "exact-run".into(),
                run_id: "exact-run".into(),
                thread_id: "exact-run".into(),
                parent_run_id: None,
                node_id: None,
                agent: "fixture".into(),
            },
            event: RunEvent::RunStarted { resume: false },
        };
        connection
            .execute(
                "INSERT INTO agent_runtime_events(id,root_id,payload) VALUES(?1,?2,?3)",
                rusqlite::params![
                    cursor as i64,
                    "exact-run",
                    serde_json::to_string(&event).unwrap()
                ],
            )
            .unwrap();
    }
    drop(connection);
    let get = |path: String| {
        let server = &server;
        async move { request(server, reqwest::Method::GET, &path, VIEW, Value::Null).await }
    };
    let (status, native) = get("/api/v1/runs/exact-run/events?limit=1".into()).await;
    assert_eq!(status, 200);
    assert_eq!(native["events"][0]["cursor"].as_u64(), Some(first));
    assert_eq!(native.as_object().unwrap().len(), 1);
    let (status, exact) = get("/api/v1/runs/exact-run/events?encoding=exact&limit=1".into()).await;
    assert_eq!(status, 200);
    assert_eq!(exact["protocol"], "nofy.events/v1");
    assert_eq!(exact["next_cursor"], first.to_string());
    assert_eq!(exact["events"][0]["cursor"], first.to_string());
    let decoded: Value =
        serde_json::from_str(exact["events"][0]["event_json"].as_str().unwrap()).unwrap();
    assert_eq!(decoded, native["events"][0]);
    assert_eq!(decoded["timestamp_ms"].as_u64(), Some(u64::MAX));
    let (_, next) = get(format!(
        "/api/v1/runs/exact-run/events?encoding=exact&after={first}&limit=1"
    ))
    .await;
    assert_eq!(next["events"][0]["cursor"], (first + 1).to_string());
    let (_, empty) = get(format!(
        "/api/v1/runs/exact-run/events?encoding=exact&after={}",
        first + 1
    ))
    .await;
    assert_eq!(empty["events"], json!([]));
    assert_eq!(empty["next_cursor"], (first + 1).to_string());
    let first_frame = frame(&server, "0", None).await;
    assert!(first_frame.contains(&format!("id: {first}")));
    let first_data: Value = serde_json::from_str(
        first_frame
            .lines()
            .find_map(|l| l.strip_prefix("data: "))
            .unwrap(),
    )
    .unwrap();
    assert_eq!(first_data, exact["events"][0]);
    // A disconnected reader catches up exclusively; the header overrides after.
    let resumed = frame(&server, "0", Some(&first.to_string())).await;
    assert!(resumed.contains(&format!("id: {}", first + 1)));
    for query in [
        "encoding=unknown",
        "encoding=exact&after=01",
        "encoding=exact&after=9223372036854775808",
        "encoding=exact&limit=0",
    ] {
        assert!(
            [400, 422].contains(
                &get(format!("/api/v1/runs/exact-run/events?{query}"))
                    .await
                    .0
            )
        );
    }
    assert_eq!(
        get("/api/v1/runs/missing/events?encoding=exact".into())
            .await
            .0,
        404
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/runs/exact-run/events?encoding=exact",
            "wrong",
            Value::Null
        )
        .await
        .0,
        401
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/runs/exact-run/stream?encoding=exact",
            "wrong",
            Value::Null
        )
        .await
        .0,
        401
    );
}

#[tokio::test]
async fn protocol_discovery_and_session_receipts_preserve_server_authority() {
    let dir = tempfile::tempdir().unwrap();
    let kernel = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(kernel.router()).await;
    let (status, contract) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/protocol",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200);
    assert_eq!(contract["protocol"], "nofy.client/v1");
    assert_eq!(contract["transports"], json!(["http-sse"]));
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/protocol",
            "wrong",
            Value::Null
        )
        .await
        .0,
        401
    );
    let release = import(&server, &document("http://127.0.0.1:9")).await;
    let command = json!({"session_id":"exact-session","command_id":"stable-start","expected_session_revision":null,"request_json":serde_json::to_string(&run(&release,"receipt-run")).unwrap(),"labels":{}});
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/sessions/start",
            VIEW,
            command.clone()
        )
        .await
        .0,
        403
    );
    let receipt = post(&server, "/api/v1/sessions/start", command.clone()).await;
    assert_eq!(receipt["phase"], "applied");
    assert_eq!(receipt["session_revision"], "0");
    assert_eq!(
        receipt,
        post(&server, "/api/v1/sessions/start", command.clone()).await
    );
    let (status, readback) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/sessions/exact-session/commands/stable-start",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status, 200);
    assert_eq!(receipt, readback);
    let mut changed = command;
    changed["labels"] = json!({"changed":"payload"});
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/sessions/start",
            ADMIN,
            changed
        )
        .await
        .0,
        409
    );
    // Applied admission is not execution completion. No worker was started.
    let (_, status) = request(
        &server,
        reqwest::Method::GET,
        "/api/v1/runs/receipt-run",
        VIEW,
        Value::Null,
    )
    .await;
    assert_eq!(status["run"]["status"], "queued");
}
