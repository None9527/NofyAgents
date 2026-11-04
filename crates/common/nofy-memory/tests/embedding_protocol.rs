use axum::{
    Json, Router,
    http::{HeaderMap, StatusCode},
    routing::post,
};
use nofy_memory::embedding::{ApiEmbeddingProvider, EmbeddingProvider};
use serde_json::{Value, json};
use std::sync::{Arc, Mutex};

struct Endpoint {
    base: String,
    requests: Arc<Mutex<Vec<(HeaderMap, Value)>>>,
    task: tokio::task::JoinHandle<()>,
}
impl Drop for Endpoint {
    fn drop(&mut self) {
        self.task.abort();
    }
}
async fn endpoint(status: StatusCode) -> Endpoint {
    let requests = Arc::new(Mutex::new(Vec::new()));
    let capture = requests.clone();
    let router = Router::new().route("/v1/embeddings", post(move |headers: HeaderMap, Json(body): Json<Value>| {
        let capture = capture.clone();
        async move {
            capture.lock().unwrap().push((headers, body.clone()));
            let value = if status.is_success() {
                let count = body["input"].as_array().unwrap().len();
                json!({"data":(0..count).rev().map(|index| json!({"index":index,"embedding":[index as f32,1.0]})).collect::<Vec<_>>()})
            } else { json!({"error":"provider-sensitive-body"}) };
            (status, Json(value))
        }
    }));
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let base = format!("http://{}/v1/", listener.local_addr().unwrap());
    let task = tokio::spawn(async move {
        axum::serve(listener, router).await.unwrap();
    });
    Endpoint {
        base,
        requests,
        task,
    }
}
fn client() -> reqwest_middleware::ClientWithMiddleware {
    let mut headers = HeaderMap::new();
    headers.insert(
        "authorization",
        "Bearer explicitly-injected".parse().unwrap(),
    );
    reqwest_middleware::ClientBuilder::new(
        reqwest::Client::builder()
            .no_proxy()
            .timeout(std::time::Duration::from_secs(3))
            .default_headers(headers)
            .build()
            .unwrap(),
    )
    .build()
}

#[tokio::test]
async fn actual_http_uses_only_declared_client_and_reorders_batched_vectors() {
    let server = endpoint(StatusCode::OK).await;
    let provider =
        ApiEmbeddingProvider::new(server.base.clone(), "declared-model".into(), 2, client())
            .unwrap();
    let texts = vec!["canonical topic"; 33];
    let vectors = provider.embed_batch(&texts).await.unwrap();
    assert_eq!(vectors.len(), 33);
    assert_eq!(vectors[0], vec![0.0, 1.0]);
    assert_eq!(vectors[31], vec![31.0, 1.0]);
    assert_eq!(vectors[32], vec![0.0, 1.0]);
    let requests = server.requests.lock().unwrap();
    assert_eq!(requests.len(), 2);
    for (headers, body) in requests.iter() {
        assert_eq!(headers["authorization"], "Bearer explicitly-injected");
        assert!(!headers.contains_key("x-nofy-token-auth"));
        assert!(!headers.contains_key("x-nofy-client-version"));
        assert_eq!(body["model"], "declared-model");
        assert_eq!(body["dimensions"], 2);
    }
    assert!(provider.embed_batch(&[]).await.unwrap().is_empty());
    assert_eq!(requests.len(), 2);
}

#[tokio::test]
async fn retry_and_provider_body_disclosure_are_not_implicit() {
    let server = endpoint(StatusCode::TOO_MANY_REQUESTS).await;
    let provider =
        ApiEmbeddingProvider::new(server.base.clone(), "declared-model".into(), 2, client())
            .unwrap();
    let error = provider
        .embed_batch(&["canonical topic"])
        .await
        .unwrap_err()
        .to_string();
    assert!(error.contains("HTTP 429"));
    assert!(!error.contains("provider-sensitive-body"));
    assert_eq!(server.requests.lock().unwrap().len(), 1);
}

#[test]
fn invalid_connections_fail_before_any_request() {
    for (url, model, dimensions) in [
        ("ftp://127.0.0.1/v1", "model", 2),
        ("https://user:password@127.0.0.1/v1", "model", 2),
        ("https://127.0.0.1/v1?key=hidden", "model", 2),
        ("https://127.0.0.1/v1#fragment", "model", 2),
        ("http://127.0.0.1/v1", "", 2),
        ("http://127.0.0.1/v1", "model", 0),
    ] {
        assert!(ApiEmbeddingProvider::new(url.into(), model.into(), dimensions, client()).is_err());
    }
}
