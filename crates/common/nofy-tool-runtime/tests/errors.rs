//! Canonical errors serialize directly, with no transport-specific projection.

use nofy_tool_protocol::ToolId;
use nofy_tool_runtime::{ToolError, ToolErrorKind};
use serde_json::json;

fn tid() -> ToolId {
    ToolId::new("files:read").unwrap()
}

#[test]
fn every_error_kind_round_trips_with_unchanged_details() {
    let kinds = [
        ToolErrorKind::NotImplemented,
        ToolErrorKind::InvalidArguments,
        ToolErrorKind::NotFound,
        ToolErrorKind::PermissionDenied,
        ToolErrorKind::Unauthorized,
        ToolErrorKind::Timeout,
        ToolErrorKind::Cancelled,
        ToolErrorKind::RateLimited,
        ToolErrorKind::ServiceUnavailable,
        ToolErrorKind::NetworkError,
        ToolErrorKind::Execution,
        ToolErrorKind::BehaviorVersionUnsupported,
        ToolErrorKind::TerminalError,
        ToolErrorKind::Custom,
    ];
    let mut names = std::collections::HashSet::new();
    for kind in kinds {
        names.insert(kind.as_str());
        for details in [
            json!({"code":"business_code","retry_after_ms":1500}),
            json!([1, 2, 3]),
            json!("detail"),
            json!(42),
            json!(null),
        ] {
            let err = ToolError::new(kind, "declared error").with_details(details.clone());
            assert_eq!(err.variant_name(), kind.as_str());
            let value = serde_json::to_value(&err).unwrap();
            assert_eq!(value.as_object().unwrap().len(), 3);
            assert_eq!(value["details"], details);
            let decoded: ToolError = serde_json::from_value(value).unwrap();
            assert_eq!(decoded.kind, kind);
            assert_eq!(decoded.detail, "declared error");
            // JSON null follows serde's existing Option<Value> semantics.
            assert_eq!(
                decoded.details,
                if details.is_null() {
                    None
                } else {
                    Some(details)
                }
            );
        }
    }
    assert_eq!(names.len(), 14);
}

#[test]
fn canonical_error_keeps_structured_data_without_injecting_subcodes() {
    let err =
        ToolError::service_unavailable("not ready").with_details(json!({"retry_after_ms":1500}));
    let value = serde_json::to_value(err).unwrap();
    assert_eq!(value["details"], json!({"retry_after_ms":1500}));
    assert!(value.get("subcode").is_none());
    assert_eq!(
        serde_json::to_value(ToolError::custom("quota", "limit")).unwrap()["details"],
        json!({"code":"quota"})
    );
}

#[test]
fn source_is_debug_only_and_never_serialized_or_displayed() {
    let err = ToolError::execution(tid(), "operation failed")
        .with_source(anyhow::anyhow!("private internal cause"));
    assert!(std::error::Error::source(&err).is_some());
    assert!(format!("{err:?}").contains("private internal cause"));
    assert_eq!(err.to_string(), "operation failed");
    let value = serde_json::to_value(&err).unwrap();
    assert!(value.get("source").is_none());
    assert!(!value.to_string().contains("private internal cause"));
    let decoded: ToolError = serde_json::from_value(value).unwrap();
    assert!(std::error::Error::source(&decoded).is_none());
}

#[test]
fn id_aware_constructors_preserve_tool_identity() {
    for err in [
        ToolError::not_found(tid(), "missing"),
        ToolError::timeout(tid(), "slow"),
        ToolError::cancelled(tid(), "stopped"),
        ToolError::execution(tid(), "failed"),
        ToolError::terminal_error(tid(), "process failed"),
    ] {
        assert_eq!(err.details.unwrap()["tool_id"], "files:read");
    }
}

#[test]
fn common_constructors_preserve_categories() {
    for (err, expected) in [
        (
            ToolError::not_implemented("none"),
            ToolErrorKind::NotImplemented,
        ),
        (
            ToolError::invalid_arguments("bad"),
            ToolErrorKind::InvalidArguments,
        ),
        (
            ToolError::permission_denied("denied"),
            ToolErrorKind::PermissionDenied,
        ),
        (
            ToolError::unauthorized("expired"),
            ToolErrorKind::Unauthorized,
        ),
        (ToolError::rate_limited("slow"), ToolErrorKind::RateLimited),
        (
            ToolError::network_error("offline"),
            ToolErrorKind::NetworkError,
        ),
    ] {
        assert_eq!(err.kind, expected);
    }
}

#[test]
fn serde_failure_is_invalid_arguments_and_ui_kind_is_not_accepted() {
    let err: ToolError = serde_json::from_str::<u32>("\"bad\"").unwrap_err().into();
    assert_eq!(err.kind, ToolErrorKind::InvalidArguments);
    for old in ["RenderLimited", "render_limited"] {
        assert!(serde_json::from_value::<ToolErrorKind>(json!(old)).is_err());
    }
}
