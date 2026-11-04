use crate::{execution::Session, failure};
use nofy_agent_runtime::{Error, model::ModelFailure};
use serde_json::{Value, json};
use std::time::{Duration, SystemTime};

fn retry_after(value: &str, now: SystemTime) -> Option<u64> {
    if let Ok(seconds) = value.parse::<u64>() {
        return seconds.checked_mul(1000);
    }
    let date = httpdate::parse_http_date(value).ok()?;
    u64::try_from(date.duration_since(now).unwrap_or_default().as_millis()).ok()
}
pub(crate) async fn http_failure(
    mut response: reqwest::Response,
    session: &Session,
    cap: usize,
    idle_ms: u64,
) -> Error {
    let status = response.status();
    let retry_after_ms = response
        .headers()
        .get("retry-after")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| retry_after(v, SystemTime::now()));
    let mut body = Vec::new();
    loop {
        let chunk =
            match tokio::time::timeout(Duration::from_millis(idle_ms), response.chunk()).await {
                Ok(Ok(Some(chunk))) => chunk,
                Ok(Ok(None)) => break,
                _ => return failure("error_response_transport"),
            };
        if chunk.len() > cap.saturating_sub(body.len()) {
            return failure("error_response_limit");
        }
        body.extend_from_slice(&chunk);
    }
    let result = session
        .step(json!({"phase":"http_error","status":status.as_u16(),
        "retry_after_ms":retry_after_ms,"body":String::from_utf8_lossy(&body)}))
        .await;
    if let Err(Error::ModelFailure(mut error)) = result {
        error.status = Some(status.as_u16());
        error.retry_after_ms = error.retry_after_ms.or(retry_after_ms);
        return error.into();
    }
    ModelFailure {
        category: "http".into(),
        message: "model endpoint rejected request".into(),
        status: Some(status.as_u16()),
        retryable: status.as_u16() == 429 || status.is_server_error(),
        retry_after_ms,
        code: None,
        details: Value::Null,
    }
    .into()
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn retry_after_supports_seconds_dates_past_dates_and_overflow() {
        let now = SystemTime::UNIX_EPOCH + Duration::from_secs(1445412478);
        assert_eq!(retry_after("2", now), Some(2000));
        assert_eq!(
            retry_after("Wed, 21 Oct 2015 07:27:59 GMT", now),
            Some(1000)
        );
        assert_eq!(retry_after("Wed, 21 Oct 2015 07:27:57 GMT", now), Some(0));
        assert_eq!(retry_after("18446744073709551615", now), None);
        assert_eq!(retry_after("not-a-date", now), None);
    }
}
