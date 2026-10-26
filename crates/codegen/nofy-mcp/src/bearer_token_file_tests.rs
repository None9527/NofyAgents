use super::*;
use crate::mcp_http_client::{McpHttpClient, WarnBudget};
use futures::stream::BoxStream;
use http::{HeaderName, HeaderValue};
use rmcp::{
    model::ClientJsonRpcMessage,
    transport::streamable_http_client::{
        StreamableHttpClient, StreamableHttpError, StreamableHttpPostResponse,
    },
};
use sse_stream::{Error as SseError, Sse};
use std::collections::HashMap;

#[derive(Clone, Default)]
struct RecordingClient(Arc<parking_lot::Mutex<Vec<(String, Option<String>)>>>);
impl RecordingClient {
    fn record(
        &self,
        method: &str,
        auth: Option<String>,
        headers: HashMap<HeaderName, HeaderValue>,
    ) {
        assert!(!headers.contains_key(&http::header::AUTHORIZATION));
        self.0.lock().push((method.into(), auth));
    }
}
impl StreamableHttpClient for RecordingClient {
    type Error = io::Error;
    async fn get_stream(
        &self,
        _uri: Arc<str>,
        _session: Arc<str>,
        _last: Option<String>,
        auth: Option<String>,
        headers: HashMap<HeaderName, HeaderValue>,
    ) -> Result<BoxStream<'static, Result<Sse, SseError>>, StreamableHttpError<Self::Error>> {
        self.record("GET", auth, headers);
        Ok(Box::pin(futures::stream::empty()))
    }
    async fn post_message(
        &self,
        _uri: Arc<str>,
        _message: ClientJsonRpcMessage,
        _session: Option<Arc<str>>,
        auth: Option<String>,
        headers: HashMap<HeaderName, HeaderValue>,
    ) -> Result<StreamableHttpPostResponse, StreamableHttpError<Self::Error>> {
        self.record("POST", auth, headers);
        Ok(StreamableHttpPostResponse::Accepted)
    }
    async fn delete_session(
        &self,
        _uri: Arc<str>,
        _session: Arc<str>,
        auth: Option<String>,
        headers: HashMap<HeaderName, HeaderValue>,
    ) -> Result<(), StreamableHttpError<Self::Error>> {
        self.record("DELETE", auth, headers);
        Ok(())
    }
}

#[tokio::test]
async fn every_method_and_rebuilt_client_reads_rotated_file() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("token");
    std::fs::write(&path, " get-token \n").unwrap();
    let file = BearerTokenFile::new(path.clone()).unwrap();
    let recorder = RecordingClient::default();
    let client = McpHttpClient::new(recorder.clone(), "test", WarnBudget::default())
        .with_bearer_token_file(Some(file.clone()));
    let headers = || {
        HashMap::from([(
            http::header::AUTHORIZATION,
            HeaderValue::from_static("Bearer stale"),
        )])
    };
    drop(
        client
            .get_stream(
                "http://localhost".into(),
                "s".into(),
                None,
                Some("stale".into()),
                headers(),
            )
            .await
            .unwrap(),
    );
    std::fs::write(&path, "post-token").unwrap();
    let message = serde_json::from_value(
        serde_json::json!({"jsonrpc":"2.0","method":"notifications/initialized"}),
    )
    .unwrap();
    client
        .post_message("http://localhost".into(), message, None, None, headers())
        .await
        .unwrap();
    let rotated = dir.path().join("rotated");
    std::fs::write(&rotated, "delete-token").unwrap();
    std::fs::rename(rotated, &path).unwrap();
    client
        .delete_session("http://localhost".into(), "s".into(), None, headers())
        .await
        .unwrap();
    std::fs::write(&path, "reconnected-token").unwrap();
    let rebuilt = McpHttpClient::new(recorder.clone(), "test", WarnBudget::default())
        .with_bearer_token_file(Some(file));
    drop(
        rebuilt
            .get_stream("http://localhost".into(), "s".into(), None, None, headers())
            .await
            .unwrap(),
    );
    assert_eq!(
        *recorder.0.lock(),
        vec![
            ("GET".into(), Some("get-token".into())),
            ("POST".into(), Some("post-token".into())),
            ("DELETE".into(), Some("delete-token".into())),
            ("GET".into(), Some("reconnected-token".into()))
        ]
    );
}

#[tokio::test]
async fn invalid_tokens_fail_closed_without_echoing_secrets() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("token");
    let file = BearerTokenFile::new(path.clone()).unwrap();
    for bytes in [
        b" \n".to_vec(),
        vec![b'a'; MAX_TOKEN_FILE_BYTES as usize + 1],
        b"private-secret\nheader".to_vec(),
        vec![0xff],
    ] {
        std::fs::write(&path, bytes).unwrap();
        let error = file.read().await.unwrap_err();
        assert_eq!(error.kind(), io::ErrorKind::InvalidData);
        assert!(!error.to_string().contains("private-secret"));
        assert!(!error.to_string().contains("aaaa"));
    }
    std::fs::write(&path, vec![b'x'; MAX_TOKEN_FILE_BYTES as usize]).unwrap();
    assert_eq!(
        file.read().await.unwrap().len(),
        MAX_TOKEN_FILE_BYTES as usize
    );
    std::fs::remove_file(&path).unwrap();
    assert_eq!(
        file.read().await.unwrap_err().kind(),
        io::ErrorKind::NotFound
    );
    let recorder = RecordingClient::default();
    let client = McpHttpClient::new(recorder.clone(), "test", WarnBudget::default())
        .with_bearer_token_file(Some(file));
    assert!(
        client
            .delete_session(
                "http://localhost".into(),
                "s".into(),
                Some("fallback".into()),
                HashMap::new()
            )
            .await
            .is_err()
    );
    assert!(recorder.0.lock().is_empty());
}

#[test]
fn metadata_requires_an_absolute_path() {
    assert!(BearerTokenFile::from_meta(None).unwrap().is_none());
    assert!(BearerTokenFile::from_meta(Some(&bearer_token_file_meta("relative/token"))).is_err());
    let bad = acp::Meta::from_iter([(BEARER_TOKEN_FILE_META_KEY.into(), serde_json::json!(42))]);
    assert!(BearerTokenFile::from_meta(Some(&bad)).is_err());
}

#[cfg(unix)]
#[tokio::test(flavor = "multi_thread")]
async fn timed_out_or_cancelled_reads_keep_one_shared_blocking_slot() {
    let dir = tempfile::tempdir().unwrap();
    let path = dir.path().join("token-fifo");
    let fifo = std::ffi::CString::new(path.as_os_str().as_encoded_bytes()).unwrap();
    // SAFETY: valid null-terminated pathname and POSIX mode.
    assert_eq!(unsafe { libc::mkfifo(fifo.as_ptr(), 0o600) }, 0);
    let mut file = BearerTokenFile::new(path.clone()).unwrap();
    file.read_timeout = Duration::from_millis(30);
    assert_eq!(
        file.read().await.unwrap_err().kind(),
        io::ErrorKind::TimedOut
    );
    assert!(
        file.clone()
            .read()
            .await
            .unwrap_err()
            .to_string()
            .contains("earlier read")
    );
    std::fs::OpenOptions::new().write(true).open(&path).unwrap();
    while file.read_slot.available_permits() == 0 {
        tokio::task::yield_now().await;
    }
    let task_file = file.clone();
    let task = tokio::spawn(async move { task_file.read().await });
    while file.read_slot.available_permits() != 0 {
        tokio::task::yield_now().await;
    }
    task.abort();
    let _ = task.await;
    assert!(
        file.read()
            .await
            .unwrap_err()
            .to_string()
            .contains("earlier read")
    );
    std::fs::OpenOptions::new().write(true).open(&path).unwrap();
    while file.read_slot.available_permits() == 0 {
        tokio::task::yield_now().await;
    }
}
