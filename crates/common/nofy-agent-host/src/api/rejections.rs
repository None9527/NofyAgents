//! Rejections made by the HTTP framework itself reach the caller as bare text or
//! with no body at all: an unknown route, a wrong method, a body that is not JSON
//! or does not fit its type, an oversized body. Handlers answer with
//! `{"error":{"code","message","details"}}`; this layer gives the framework the
//! same shape, so one parser reads every failure and the status code is unchanged.
//!
//! Parser text is never forwarded. A serde error can quote the value that failed,
//! and a credential body may be exactly that value. Only facts the kernel defines
//! itself survive: the failure class, and the name of a required field.
use axum::{
    Json,
    extract::Request,
    http::{
        StatusCode,
        header::{CONTENT_LENGTH, CONTENT_TYPE},
    },
    middleware::Next,
    response::{IntoResponse, Response},
};
use serde_json::{Value, json};

/// Rejection texts are short; a longer body is not one of them.
const REJECTION_TEXT_LIMIT: usize = 4096;

pub(super) async fn envelope(request: Request, next: Next) -> Response {
    let response = next.run(request).await;
    let status = response.status();
    let failed = status.is_client_error() || status.is_server_error();
    let enveloped = response
        .headers()
        .get(CONTENT_TYPE)
        .and_then(|value| value.to_str().ok())
        .is_some_and(|value| value.starts_with("application/json"));
    if !failed || enveloped {
        return response;
    }
    let (mut parts, body) = response.into_parts();
    let text = match axum::body::to_bytes(body, REJECTION_TEXT_LIMIT).await {
        Ok(bytes) => String::from_utf8_lossy(&bytes).into_owned(),
        Err(_) => String::new(),
    };
    let (code, message, details) = classify(status, &text);
    parts.headers.remove(CONTENT_TYPE);
    parts.headers.remove(CONTENT_LENGTH);
    let mut response = (
        status,
        Json(json!({"error":{"code":code,"message":message,"details":details}})),
    )
        .into_response();
    // `Allow` and the like belong to the original answer.
    response.headers_mut().extend(parts.headers);
    response
}

pub(super) fn classify(status: StatusCode, text: &str) -> (&'static str, String, Value) {
    match status {
        StatusCode::NOT_FOUND => (
            "not_found",
            "no such endpoint".into(),
            json!({"reason":"unknown_endpoint"}),
        ),
        StatusCode::METHOD_NOT_ALLOWED => (
            "invalid",
            "method not allowed for this endpoint".into(),
            json!({"reason":"method_not_allowed"}),
        ),
        StatusCode::PAYLOAD_TOO_LARGE => (
            "invalid",
            "request body exceeds the kernel's size limit".into(),
            json!({"reason":"body_too_large"}),
        ),
        StatusCode::UNSUPPORTED_MEDIA_TYPE => (
            "invalid",
            "request body must be sent as application/json".into(),
            json!({"reason":"unsupported_media_type"}),
        ),
        StatusCode::BAD_REQUEST if text.starts_with("Failed to parse the request body as JSON") => {
            (
                "invalid",
                "request body is not valid JSON".into(),
                json!({"reason":"malformed_json"}),
            )
        }
        StatusCode::BAD_REQUEST => (
            "invalid",
            "a query or path parameter is invalid".into(),
            json!({"reason":"invalid_parameter"}),
        ),
        StatusCode::UNPROCESSABLE_ENTITY => match missing_field(text) {
            Some(field) => (
                "invalid",
                format!("request body is missing required field `{field}`"),
                json!({"reason":"missing_field","field":field}),
            ),
            None => (
                "invalid",
                "request body does not match the expected shape".into(),
                json!({"reason":"invalid_body"}),
            ),
        },
        // An unexplained server failure may have landed a write: unconfirmed, not
        // a retryable "unavailable".
        status if status.is_server_error() => (
            "result_unconfirmed",
            "the kernel failed while handling the request; if it was a write, inspect it by its original ids before retrying".into(),
            json!({"reason":"server_error"}),
        ),
        _ => (
            "invalid",
            "request rejected".into(),
            json!({"reason":"rejected"}),
        ),
    }
}

/// The field name comes from the target type, not from the caller, so it may be
/// repeated; anything that is not a plain identifier is not.
fn missing_field(text: &str) -> Option<&str> {
    let rest = text.split_once("missing field `")?.1;
    let field = rest.split_once('`')?.0;
    let plain = !field.is_empty()
        && field.len() <= 64
        && field
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b == b'_');
    plain.then_some(field)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn reason(status: StatusCode, text: &str) -> (String, String) {
        let (code, _, details) = classify(status, text);
        (code.into(), details["reason"].as_str().unwrap().into())
    }

    #[test]
    fn each_framework_rejection_has_a_code_and_a_reason() {
        for (status, text, code, why) in [
            (StatusCode::NOT_FOUND, "", "not_found", "unknown_endpoint"),
            (
                StatusCode::METHOD_NOT_ALLOWED,
                "",
                "invalid",
                "method_not_allowed",
            ),
            (
                StatusCode::PAYLOAD_TOO_LARGE,
                "Failed to buffer the request body: length limit exceeded",
                "invalid",
                "body_too_large",
            ),
            (
                StatusCode::UNSUPPORTED_MEDIA_TYPE,
                "Expected request with `Content-Type: application/json`",
                "invalid",
                "unsupported_media_type",
            ),
            (
                StatusCode::BAD_REQUEST,
                "Failed to parse the request body as JSON: key must be a string",
                "invalid",
                "malformed_json",
            ),
            (
                StatusCode::BAD_REQUEST,
                "Failed to deserialize query string: limit: invalid digit found in string",
                "invalid",
                "invalid_parameter",
            ),
            (
                StatusCode::UNPROCESSABLE_ENTITY,
                "Failed to deserialize the JSON body into the target type: missing field `draft`",
                "invalid",
                "missing_field",
            ),
            (
                StatusCode::UNPROCESSABLE_ENTITY,
                "Failed to deserialize the JSON body into the target type: unknown field `a`",
                "invalid",
                "invalid_body",
            ),
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                "",
                "result_unconfirmed",
                "server_error",
            ),
        ] {
            assert_eq!(reason(status, text), (code.into(), why.into()), "{status}");
        }
    }

    #[test]
    fn parser_text_that_quotes_a_value_is_never_forwarded() {
        for text in [
            "Failed to deserialize the JSON body into the target type: modules: invalid type: string \"private-business-value\", expected a sequence",
            "Failed to deserialize the JSON body into the target type: unknown variant `private-business-value`, expected `a` or `b`",
            "Failed to deserialize query string: limit: invalid digit found in string \"private-business-value\"",
        ] {
            for status in [StatusCode::UNPROCESSABLE_ENTITY, StatusCode::BAD_REQUEST] {
                let (_, message, details) = classify(status, text);
                let shown = format!("{message} {details}");
                assert!(!shown.contains("private-business-value"), "{shown}");
            }
        }
    }

    #[test]
    fn a_missing_field_name_is_repeated_only_when_it_is_a_plain_identifier() {
        assert_eq!(
            missing_field("x: missing field `command_id` at line 1"),
            Some("command_id")
        );
        assert_eq!(missing_field("missing field `a b`"), None);
        assert_eq!(missing_field("missing field `"), None);
        assert_eq!(missing_field("missing field ``"), None);
        assert_eq!(
            missing_field(&format!("missing field `{}`", "a".repeat(65))),
            None
        );
        assert_eq!(missing_field("no field named here"), None);
    }
}
