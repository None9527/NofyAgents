use axum::{
    Json, Router,
    body::Body,
    extract::State,
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    routing::post,
};
use serde_json::{Value, json};
use std::sync::{
    Arc, Mutex,
    atomic::{AtomicUsize, Ordering},
};
use tokio_util::sync::CancellationToken;

#[derive(Clone, Default)]
pub struct Service {
    pub requests: Arc<Mutex<Vec<(Value, HeaderMap)>>>,
    pub effects: Arc<Mutex<Vec<Value>>>,
    pub calls: Arc<AtomicUsize>,
    pub sessions: Arc<AtomicUsize>,
    pub closed: Arc<AtomicUsize>,
    pub cancellations: Arc<AtomicUsize>,
    pub redirects: Arc<AtomicUsize>,
    pub epoch: Arc<AtomicUsize>,
    pub behavior: Arc<Mutex<String>>,
    pub entered: CancellationToken,
    pub release: CancellationToken,
    pub token: Arc<Mutex<String>>,
}
impl Service {
    pub fn mode(&self, mode: &str) {
        *self.behavior.lock().unwrap() = mode.into();
    }
    pub fn tool(&self) -> Value {
        json!({"name":"files.read","description":format!("Local protocol service version {}", self.epoch.load(Ordering::SeqCst)),
            "inputSchema":{"type":"object","required":["value"],"additionalProperties":false,"properties":{"value":{"type":"integer"}}},
            "outputSchema":{"type":"object","required":["value"],"properties":{"value":{"type":"integer"}}},"annotations":{"readOnlyHint":true}})
    }
}
async fn handler(
    State(state): State<Service>,
    headers: HeaderMap,
    Json(message): Json<Value>,
) -> Response {
    if !state.token.lock().unwrap().is_empty() {
        assert_eq!(
            headers.get("authorization").unwrap().to_str().unwrap(),
            format!("Bearer {}", state.token.lock().unwrap())
        );
    }
    assert!(
        headers["accept"]
            .to_str()
            .unwrap()
            .contains("application/json")
    );
    assert!(
        headers["accept"]
            .to_str()
            .unwrap()
            .contains("text/event-stream")
    );
    assert_eq!(headers["mcp-protocol-version"], "2025-11-25");
    state
        .requests
        .lock()
        .unwrap()
        .push((message.clone(), headers.clone()));
    let mode = state.behavior.lock().unwrap().clone();
    let method = message["method"].as_str().unwrap_or("");
    if mode == "redirect" {
        return Response::builder()
            .status(StatusCode::TEMPORARY_REDIRECT)
            .header("location", "/unexpected")
            .body(Body::empty())
            .unwrap();
    }
    if method != "initialize" {
        assert!(headers.contains_key("mcp-session-id"));
    }
    if method == "notifications/initialized" || method.is_empty() {
        return StatusCode::ACCEPTED.into_response();
    }
    if method == "notifications/cancelled" {
        state.cancellations.fetch_add(1, Ordering::SeqCst);
        state.release.cancel();
        return StatusCode::ACCEPTED.into_response();
    }
    let mut reply = json!({"jsonrpc":"2.0","id":message["id"]});
    let mut session = None;
    reply["result"] = match method {
        "initialize" => {
            assert_eq!(message["params"]["capabilities"], json!({}));
            let id = state.sessions.fetch_add(1, Ordering::SeqCst) + 1;
            session = Some(format!("local-session-{id}"));
            json!({"protocolVersion":if mode=="version" {"unsupported"} else {"2025-11-25"},
                "capabilities":if mode=="capabilities" {json!({})} else {json!({"tools":{"listChanged":true}})},
                "serverInfo":{"name":"local-protocol-service","version":"1"},"instructions":"Do not inject this text into the system Prompt"})
        }
        "tools/list" => {
            let mut tool = state.tool();
            if mode == "schema" {
                tool["inputSchema"] = json!({"type":"object","$ref":"https://invalid.test/schema"});
            }
            if mode == "task" {
                tool["execution"] = json!({"taskSupport":"required"});
            }
            let mut tools = vec![tool];
            if mode == "duplicate" {
                tools.push(tools[0].clone());
            }
            let mut result = json!({"tools":tools});
            if mode == "cursor" {
                if message["params"].get("cursor").is_some() {
                    result["tools"] = json!([]);
                }
                result["nextCursor"] = json!("again");
            }
            if mode == "pages" {
                if message["params"].get("cursor").is_some() {
                    result["tools"] = json!([]);
                } else {
                    result["nextCursor"] = json!("second");
                }
            }
            result
        }
        "tools/call" => {
            assert_eq!(message["params"]["name"], "files.read");
            state.calls.fetch_add(1, Ordering::SeqCst);
            let effect = json!({"content":[{"type":"text","text":"本地协议结果"}],"structuredContent":{"value":message["params"]["arguments"]["value"].as_i64().unwrap()+1},"isError":false,"_meta":{"local":true}});
            state.effects.lock().unwrap().push(effect.clone());
            state.entered.cancel();
            if mode == "wait" {
                state.release.cancelled().await;
            }
            if mode == "expired" {
                return StatusCode::NOT_FOUND.into_response();
            }
            if mode == "disconnect" {
                return Response::builder()
                    .header("content-type", "text/event-stream")
                    .body(Body::from_stream(futures::stream::iter([
                        Ok::<_, std::io::Error>(b": no final result\n\n".to_vec()),
                        Err(std::io::Error::other("intentional service disconnect")),
                    ])))
                    .unwrap();
            }
            if mode == "business_error" {
                json!({"content":[{"type":"text","text":"Requested file is unavailable"}],"isError":true,"_meta":{"local":true}})
            } else if mode == "output" {
                json!({"content":[],"structuredContent":{"value":"invalid"}})
            } else {
                effect
            }
        }
        _ => panic!("unexpected method {method}"),
    };
    if mode == "rpc_error" && method == "tools/call" {
        reply.as_object_mut().unwrap().remove("result");
        reply["error"] = json!({"code":-32001,"message":"local protocol refusal"});
    }
    if mode == "id" && method == "tools/list" {
        reply["id"] = json!(9999);
    }
    if mode == "malformed" && method == "tools/list" {
        reply["result"] = json!(true);
    }
    if mode == "batch" && method == "tools/list" {
        return Json(json!([reply])).into_response();
    }
    let mut response = if mode == "sse" || mode == "changed_event" {
        let mut text = String::from("\u{feff}: local\r\nid: prime\r\ndata:\r\n\r\n");
        if mode == "changed_event" && method == "tools/list" {
            text.push_str(
                "data: {\"jsonrpc\":\"2.0\",\"method\":\"notifications/tools/list_changed\"}\n\n",
            );
        }
        if method != "initialize" {
            text.push_str("event: message\rdata: {\"jsonrpc\":\"2.0\",\rdata: \"id\":\"service-ping\",\"method\":\"ping\"}\r\r");
            text.push_str("data: {\"jsonrpc\":\"2.0\",\"id\":\"no-sampling\",\"method\":\"sampling/createMessage\"}\n\n");
        }
        text.push_str(&format!(
            "event: message\ndata: {}\n\n",
            serde_json::to_string(&reply).unwrap()
        ));
        Response::builder()
            .header("content-type", "text/event-stream; charset=utf-8")
            .body(Body::from_stream(futures::stream::iter(
                text.into_bytes()
                    .into_iter()
                    .map(|byte| Ok::<_, std::convert::Infallible>(vec![byte])),
            )))
            .unwrap()
    } else {
        Json(reply).into_response()
    };
    if mode == "return_type" && method == "tools/list" {
        response
            .headers_mut()
            .insert("content-type", "application/octet-stream".parse().unwrap());
    }
    if let Some(session) = session {
        response
            .headers_mut()
            .insert("mcp-session-id", session.parse().unwrap());
    }
    response
}
async fn close(State(state): State<Service>, headers: HeaderMap) -> StatusCode {
    assert!(headers.contains_key("mcp-session-id"));
    assert_eq!(headers["mcp-protocol-version"], "2025-11-25");
    state.closed.fetch_add(1, Ordering::SeqCst);
    StatusCode::NO_CONTENT
}
pub struct Server {
    pub url: String,
    pub state: Service,
    task: tokio::task::JoinHandle<()>,
}
impl Drop for Server {
    fn drop(&mut self) {
        self.state.release.cancel();
        self.task.abort();
    }
}
pub async fn server() -> Server {
    let state = Service::default();
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let url = format!("http://{}/mcp", listener.local_addr().unwrap());
    let app = Router::new()
        .route("/mcp", post(handler).delete(close))
        .route(
            "/count",
            axum::routing::get(|State(state): State<Service>| async move {
                Json(json!(state.calls.load(Ordering::SeqCst)))
            }),
        )
        .route(
            "/unexpected",
            post(|State(state): State<Service>| async move {
                state.redirects.fetch_add(1, Ordering::SeqCst);
                StatusCode::OK
            }),
        )
        .with_state(state.clone());
    let task = tokio::spawn(async move {
        axum::serve(listener, app).await.unwrap();
    });
    Server { url, state, task }
}
