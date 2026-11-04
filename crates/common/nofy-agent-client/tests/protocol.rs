use nofy_agent_client::*;
use serde_json::{Value, json};
use std::{
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
    },
    time::Duration,
};
struct Serving {
    url: String,
    task: tokio::task::JoinHandle<()>,
}
impl Drop for Serving {
    fn drop(&mut self) {
        self.task.abort();
    }
}
async fn serve(router: axum::Router) -> Serving {
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let url = format!("http://{}", listener.local_addr().unwrap());
    let task = tokio::spawn(async move {
        axum::serve(listener, router).await.unwrap();
    });
    Serving { url, task }
}
#[tokio::test]
async fn native_u64_versions_remain_exact_without_rewriting_business_json() {
    let server=serve(axum::Router::new().route("/api/v1/apply",axum::routing::post(|axum::Json(body):axum::Json<Value>|async move{
        assert_eq!(body["expected_generation"].as_u64(),Some(u64::MAX));axum::Json(json!({"command":{"command_id":"same-id"},"active":{"generation":u64::MAX,"release":"published"}}))
    })).route("/api/v1/runs",axum::routing::post(|body:String|async move{assert!(body.contains("18446744073709551615"));axum::Json(json!({"sequence":u64::MAX,"request":{"run_id":"original","thread_id":"thread","parameters":{"generation":u64::MAX}}}))}))).await;
    let engine = Engine::new(KernelClient::new(&server.url, None, Duration::from_secs(2)).unwrap());
    let apply=engine.execute("system.apply",json!({"system":"coder","release":"published","command_id":"same-id","expected_generation":u64::MAX.to_string()})).await;
    assert!(!apply.is_error(), "{apply:?}");
    assert_eq!(apply.refs["generation"], Some(u64::MAX.to_string()));
    let run=engine.execute("run.start",json!({"request_json":"{\"run_id\":\"original\",\"parameters\":{\"generation\":18446744073709551615}}"})).await;
    assert!(!run.is_error());
    let native: Value = serde_json::from_str(run.data["native_json"].as_str().unwrap()).unwrap();
    assert_eq!(
        native["request"]["parameters"]["generation"].as_u64(),
        Some(u64::MAX)
    );
    assert_eq!(run.refs["sequence"], Some(u64::MAX.to_string()));
}
#[tokio::test]
async fn interrupted_writes_keep_original_business_ids_and_never_retry() {
    let calls = Arc::new(AtomicUsize::new(0));
    let counter = calls.clone();
    let server = serve(axum::Router::new().route(
        "/api/v1/apply",
        axum::routing::post(move || {
            let calls = counter.clone();
            async move {
                calls.fetch_add(1, Ordering::SeqCst);
                tokio::time::sleep(Duration::from_secs(1)).await;
                axum::Json(json!({}))
            }
        }),
    ))
    .await;
    let engine =
        Engine::new(KernelClient::new(&server.url, None, Duration::from_millis(40)).unwrap());
    let output=engine.execute("system.apply",json!({"system":"coder","release":"published","command_id":"original-command","expected_generation":null})).await;
    assert_eq!(output.status, "unconfirmed");
    assert_eq!(output.refs["command_id"], Some("original-command".into()));
    assert_eq!(calls.load(Ordering::SeqCst), 1);
}
#[tokio::test]
async fn redirects_do_not_forward_identity_and_native_schemas_are_closed() {
    let calls = Arc::new(AtomicUsize::new(0));
    let count = calls.clone();
    let target = serve(axum::Router::new().route(
        "/capture",
        axum::routing::get(move || {
            let count = count.clone();
            async move {
                count.fetch_add(1, Ordering::SeqCst);
                "captured"
            }
        }),
    ))
    .await;
    let location = format!("{}/capture", target.url);
    let server = serve(axum::Router::new().route(
        "/api/v1/access",
        axum::routing::get(move || {
            let location = location.clone();
            async move { axum::response::Redirect::temporary(&location) }
        }),
    ))
    .await;
    let client = KernelClient::new(
        &server.url,
        Some("private-test-token-value".into()),
        Duration::from_secs(2),
    )
    .unwrap();
    assert!(client.authorize().await.is_err());
    assert_eq!(calls.load(Ordering::SeqCst), 0);
    assert!(validate("system.apply",&json!({"system":"x","release":"y","command_id":"z","expected_generation":9007199254740993u64})).is_err());
    assert!(validate("resource.list", &json!({"kind":"http://arbitrary.invalid"})).is_err());
    assert!(
        KernelClient::new(
            "http://user:secret@localhost:7331",
            None,
            Duration::from_secs(1)
        )
        .is_err()
    );
}

#[tokio::test]
async fn opaque_native_budget_and_source_cursors_are_returned_and_forwarded_unchanged() {
    let opaque = r#"["scope",9007199254740993]"#;
    let server = serve(
        axum::Router::new()
            .route(
                "/api/v1/budgets",
                axum::routing::get(
                    move |axum::extract::Query(query): axum::extract::Query<
                        std::collections::BTreeMap<String, String>,
                    >| async move {
                        if let Some(after) = query.get("after") {
                            assert_eq!(after, opaque);
                        }
                        axum::Json(
                            json!({"protocol":"nofy.budget-page/v1","ledgers":[],"next":opaque}),
                        )
                    },
                ),
            )
            .route(
                "/api/v1/runtime-sources",
                axum::routing::get(|| async {
                    axum::Json(
                        json!({"revision":9007199254740993u64,"entries":[],"next":"source-z"}),
                    )
                }),
            )
            .route(
                "/api/v1/artifacts",
                axum::routing::get(|| async {
                    axum::Json(json!([{"digest":"original-digest","files":1}]))
                }),
            ),
    )
    .await;
    let engine = Engine::new(KernelClient::new(&server.url, None, Duration::from_secs(2)).unwrap());
    let first = engine.execute("budget.list", json!({})).await;
    assert_eq!(first.next_cursor.as_deref(), Some(opaque));
    let next = engine
        .execute("budget.list", json!({"after":first.next_cursor}))
        .await;
    assert!(!next.is_error());
    let sources = engine
        .execute("resource.list", json!({"kind":"runtime_sources"}))
        .await;
    assert_eq!(sources.next_cursor.as_deref(), Some("source-z"));
    let artifacts = engine
        .execute("resource.list", json!({"kind":"artifacts"}))
        .await;
    assert_eq!(artifacts.next_cursor.as_deref(), Some("original-digest"));
}

#[tokio::test]
async fn original_run_without_a_live_update_exposes_native_revision_zero() {
    let server = serve(axum::Router::new().route(
        "/api/v1/runs/original",
        axum::routing::get(|| async {
            axum::Json(
                json!({"run":{"request":{"run_id":"original","thread_id":"thread"}},"live":null}),
            )
        }),
    ))
    .await;
    let engine = Engine::new(KernelClient::new(&server.url, None, Duration::from_secs(2)).unwrap());
    let result = engine
        .execute("run.inspect", json!({"run_id":"original"}))
        .await;
    assert!(!result.is_error());
    assert_eq!(result.refs["live_revision"], Some("0".into()));
    let native: Value = serde_json::from_str(result.data["native_json"].as_str().unwrap()).unwrap();
    assert!(native["live"].is_null());
}
