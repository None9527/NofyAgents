#[path = "mcp_http/service.rs"]
mod service;
use nofy_agent_executors::{
    mcp::{HttpResourceFactory, ToolSourceFactory},
    resources::CredentialProvider,
};
use nofy_agent_runtime::{registry::*, *};
use nofy_tool_protocol::ToolId;
use nofy_tool_runtime::{ToolCallContext, ToolError};
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    sync::{
        Arc, Mutex,
        atomic::{AtomicUsize, Ordering},
    },
    time::Duration,
};
use tokio_util::sync::CancellationToken;

struct Credentials {
    calls: Arc<AtomicUsize>,
    token: Arc<Mutex<String>>,
}
#[async_trait::async_trait]
impl CredentialProvider for Credentials {
    async fn resolve(&self, _: &str, _: &ToolCallContext) -> Result<String, ToolError> {
        self.calls.fetch_add(1, Ordering::SeqCst);
        Ok(self.token.lock().unwrap().clone())
    }
}
fn source(
    url: &str,
    config: Value,
    calls: Arc<AtomicUsize>,
    token: Arc<Mutex<String>>,
) -> Arc<dyn ToolSource> {
    let factory = HttpResourceFactory::new(
        "local-protocol-authority",
        Arc::new(Credentials { calls, token }),
    )
    .unwrap();
    let connection = factory
        .build(
            &json!({"endpoint":url,"credential_ref":"MCP_TOKEN"}),
            &BTreeMap::new(),
        )
        .unwrap();
    let ModuleInstance::ToolSource(source) = ToolSourceFactory
        .build(
            &config,
            &BTreeMap::from([("connection".into(), connection)]),
        )
        .unwrap()
    else {
        panic!("source");
    };
    source
}
fn config() -> Value {
    json!({"namespace":"project","aliases":{"files.read":"read"}})
}
async fn snapshot(server: &service::Server, config: Value) -> Result<ToolSnapshot, Error> {
    source(
        &server.url,
        config,
        Arc::new(AtomicUsize::new(0)),
        server.state.token.clone(),
    )
    .snapshot(&RunContext::new("thread", "run"))
    .await
}
async fn invoke(
    snapshot: &ToolSnapshot,
    value: Value,
    context: ToolCallContext,
) -> Result<nofy_tool_runtime::TypedToolOutput, ToolError> {
    snapshot
        .catalog
        .get("project_read")
        .unwrap()
        .dispatch
        .call_terminal(ToolId::new("project_read").unwrap(), value, context)
        .await
}
async fn wait_count(counter: &AtomicUsize, expected: usize) {
    tokio::time::timeout(Duration::from_secs(3), async {
        while counter.load(Ordering::SeqCst) != expected {
            tokio::task::yield_now().await;
        }
    })
    .await
    .unwrap();
}

#[tokio::test]
async fn pure_binding_json_session_stable_snapshot_credentials_and_exact_remote_name() {
    let server = service::server().await;
    *server.state.token.lock().unwrap() = "synthetic-token-one".into();
    let credentials = Arc::new(AtomicUsize::new(0));
    let source = source(
        &server.url,
        config(),
        credentials.clone(),
        server.state.token.clone(),
    );
    assert_eq!(credentials.load(Ordering::SeqCst), 0);
    assert!(server.state.requests.lock().unwrap().is_empty());
    let first = source
        .snapshot(&RunContext::new("thread", "one"))
        .await
        .unwrap();
    let second = source
        .snapshot(&RunContext::new("thread", "two"))
        .await
        .unwrap();
    assert_eq!(
        first.revision, second.revision,
        "ephemeral session IDs cannot invalidate durable approval recovery"
    );
    assert_eq!(server.state.sessions.load(Ordering::SeqCst), 2);
    *server.state.token.lock().unwrap() = "synthetic-token-two".into();
    let output = invoke(&first, json!({"value":7}), ToolCallContext::default())
        .await
        .unwrap();
    assert_eq!(output.value["structuredContent"]["value"], 8);
    assert_eq!(output.value["_meta"]["local"], true);
    assert!(!output.model_output.is_empty());
    assert_eq!(server.state.calls.load(Ordering::SeqCst), 1);
    assert!(
        invoke(&first, json!({"value":"wrong"}), ToolCallContext::default())
            .await
            .is_err()
    );
    assert!(
        first
            .catalog
            .get("project_read")
            .unwrap()
            .dispatch
            .call_terminal(
                ToolId::new("other").unwrap(),
                json!({"value":7}),
                ToolCallContext::default()
            )
            .await
            .is_err()
    );
    assert_eq!(server.state.calls.load(Ordering::SeqCst), 1);
    let requests = server.state.requests.lock().unwrap();
    assert_eq!(requests[0].0["method"], "initialize");
    assert_eq!(requests[1].0["method"], "notifications/initialized");
    assert_eq!(requests[2].0["method"], "tools/list");
    assert_eq!(requests.last().unwrap().0["method"], "tools/call");
    assert_eq!(credentials.load(Ordering::SeqCst), requests.len());
    drop(requests);
    drop(first);
    drop(second);
    wait_count(&server.state.closed, 2).await;
}

#[tokio::test]
async fn sse_incremental_unicode_ping_and_unnegotiated_requests_preserve_result() {
    let server = service::server().await;
    server.state.mode("sse");
    let snap = snapshot(&server, config()).await.unwrap();
    let result = invoke(&snap, json!({"value":1}), ToolCallContext::default())
        .await
        .unwrap();
    assert_eq!(result.value["content"][0]["text"], "本地协议结果");
    let requests = server.state.requests.lock().unwrap();
    assert!(
        requests
            .iter()
            .any(|(r, _)| r["id"] == "service-ping" && r["result"] == json!({}))
    );
    assert!(
        requests
            .iter()
            .any(|(r, _)| r["id"] == "no-sampling" && r["error"]["code"] == -32601)
    );
}

#[tokio::test]
async fn pagination_catalog_limits_aliases_allowlist_and_protocol_failures_reject_before_call() {
    let server = service::server().await;
    server.state.mode("pages");
    assert!(snapshot(&server, config()).await.is_ok());
    let mut limited = config();
    limited["max_pages"] = json!(1);
    assert!(snapshot(&server, limited).await.is_err());
    for mode in [
        "version",
        "capabilities",
        "duplicate",
        "cursor",
        "schema",
        "task",
        "id",
        "malformed",
        "batch",
        "return_type",
        "changed_event",
        "redirect",
    ] {
        server.state.mode(mode);
        assert!(snapshot(&server, config()).await.is_err(), "{mode}");
    }
    server.state.mode("");
    for value in [
        json!({}),
        json!({"allowed_tools":["missing"]}),
        json!({"max_catalog_bytes":64}),
        json!({"unknown":true}),
    ] {
        if value.get("unknown").is_some() {
            assert!(ToolSourceFactory.build(&value, &BTreeMap::new()).is_err());
        } else {
            assert!(snapshot(&server, value.clone()).await.is_err(), "{value}");
        }
    }
    let mut selected = config();
    selected["allowed_tools"] = json!(["files.read"]);
    assert!(snapshot(&server, selected).await.is_ok());
    let mut empty = config();
    empty["allowed_tools"] = json!([]);
    assert!(
        snapshot(&server, empty)
            .await
            .unwrap()
            .catalog
            .names()
            .is_empty()
    );
    assert_eq!(server.state.calls.load(Ordering::SeqCst), 0);
    assert_eq!(server.state.redirects.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn catalog_drift_and_schema_errors_do_not_grant_or_repeat_remote_effects() {
    let server = service::server().await;
    let snap = snapshot(&server, config()).await.unwrap();
    server.state.epoch.fetch_add(1, Ordering::SeqCst);
    assert!(
        invoke(&snap, json!({"value":3}), ToolCallContext::default())
            .await
            .unwrap_err()
            .to_string()
            .contains("catalog differs")
    );
    assert_eq!(server.state.calls.load(Ordering::SeqCst), 0);
    let newer = snapshot(&server, config()).await.unwrap();
    assert_ne!(snap.revision, newer.revision);
    for mode in ["output", "business_error", "rpc_error"] {
        server.state.mode(mode);
        let err = invoke(&newer, json!({"value":3}), ToolCallContext::default())
            .await
            .unwrap_err();
        if mode == "business_error" {
            assert_eq!(err.details.unwrap()["isError"], true);
        }
    }
    assert_eq!(server.state.calls.load(Ordering::SeqCst), 3);
}

#[tokio::test]
async fn expired_or_disconnected_calls_never_reinitialize_and_resubmit_the_effect() {
    for mode in ["expired", "disconnect"] {
        let server = service::server().await;
        let snap = snapshot(&server, config()).await.unwrap();
        server.state.mode(mode);
        assert!(
            invoke(&snap, json!({"value":1}), ToolCallContext::default())
                .await
                .is_err()
        );
        assert!(
            invoke(&snap, json!({"value":1}), ToolCallContext::default())
                .await
                .is_err()
        );
        assert_eq!(server.state.calls.load(Ordering::SeqCst), 1);
        assert_eq!(server.state.sessions.load(Ordering::SeqCst), 1);
        server.state.mode("");
        assert!(snapshot(&server, config()).await.is_ok());
        assert_eq!(server.state.sessions.load(Ordering::SeqCst), 2);
        assert_eq!(server.state.calls.load(Ordering::SeqCst), 1);
    }
}

#[tokio::test]
async fn cancellation_timeout_and_waiting_call_do_not_repeat_or_leave_an_usable_session() {
    for timeout in [false, true] {
        let server = service::server().await;
        let mut configured = config();
        configured["timeout_ms"] = json!(if timeout { 500 } else { 3000 });
        let snap = snapshot(&server, configured).await.unwrap();
        server.state.mode("wait");
        let token = CancellationToken::new();
        let mut context = ToolCallContext::default();
        context.insert(nofy_tool_runtime::Cancellation(token.clone()));
        let entry = snap.catalog.get("project_read").unwrap().clone();
        let task = tokio::spawn(async move {
            entry
                .dispatch
                .call_terminal(
                    ToolId::new("project_read").unwrap(),
                    json!({"value":1}),
                    context,
                )
                .await
        });
        tokio::time::timeout(Duration::from_secs(2), server.state.entered.cancelled())
            .await
            .unwrap();
        // A canceled waiter must not obtain the held session or send another call.
        let cancelled = CancellationToken::new();
        cancelled.cancel();
        let mut waiting = ToolCallContext::default();
        waiting.insert(nofy_tool_runtime::Cancellation(cancelled));
        assert!(invoke(&snap, json!({"value":2}), waiting).await.is_err());
        if !timeout {
            token.cancel();
        }
        assert!(
            tokio::time::timeout(Duration::from_secs(3), task)
                .await
                .unwrap()
                .unwrap()
                .is_err()
        );
        wait_count(&server.state.cancellations, 1).await;
        assert_eq!(server.state.calls.load(Ordering::SeqCst), 1);
        assert!(
            invoke(&snap, json!({"value":3}), ToolCallContext::default())
                .await
                .is_err()
        );
        assert_eq!(server.state.calls.load(Ordering::SeqCst), 1);
    }
}

#[tokio::test]
async fn endpoint_validation_never_connects_or_reads_credentials() {
    let counter = Arc::new(AtomicUsize::new(0));
    let factory = HttpResourceFactory::new(
        "authority",
        Arc::new(Credentials {
            calls: counter.clone(),
            token: Arc::new(Mutex::new("synthetic".into())),
        }),
    )
    .unwrap();
    for endpoint in [
        "file:///tmp/mcp",
        "http://name:secret@localhost/mcp",
        "http://localhost/mcp?token=x",
        "http://localhost/mcp#other",
    ] {
        assert!(
            factory
                .build(&json!({"endpoint":endpoint}), &BTreeMap::new())
                .is_err()
        );
    }
    assert!(
        factory
            .build(
                &json!({"endpoint":"http://127.0.0.1:9/mcp","credential_ref":"bad\r\nheader"}),
                &BTreeMap::new()
            )
            .is_err()
    );
    assert_eq!(counter.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn canceled_discovery_is_pure_and_output_limit_keeps_one_sent_call() {
    let server = service::server().await;
    let calls = Arc::new(AtomicUsize::new(0));
    let source = source(
        &server.url,
        config(),
        calls.clone(),
        server.state.token.clone(),
    );
    let context = RunContext::new("t", "r");
    context.cancel.cancel();
    assert!(source.snapshot(&context).await.is_err());
    assert_eq!(calls.load(Ordering::SeqCst), 0);
    assert!(server.state.requests.lock().unwrap().is_empty());
    let mut limited = config();
    limited["max_output_bytes"] = json!(64);
    let snap = snapshot(&server, limited).await.unwrap();
    assert!(
        invoke(&snap, json!({"value":1}), ToolCallContext::default())
            .await
            .is_err()
    );
    assert_eq!(server.state.calls.load(Ordering::SeqCst), 1);
}
