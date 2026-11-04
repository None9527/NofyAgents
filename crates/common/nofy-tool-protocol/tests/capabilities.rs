use nofy_tool_protocol::{StreamingSpec, ToolCapabilities, ToolScope};
use serde_json::json;

#[test]
fn default_capabilities_have_no_hidden_service_or_hook_defaults() {
    let caps: ToolCapabilities = serde_json::from_value(json!({})).unwrap();
    assert_eq!(caps, ToolCapabilities::default());
    assert_eq!(
        serde_json::to_value(caps).unwrap(),
        json!({
            "supports_cancel": false, "is_read_only": false
        })
    );
}

#[test]
fn explicit_capabilities_round_trip_without_loss() {
    let caps = ToolCapabilities {
        streaming: Some(StreamingSpec {
            subkind: "text_delta".into(),
            max_delta_bytes: Some(2048),
        }),
        supports_cancel: true,
        max_concurrency: Some(2),
        is_read_only: false,
        behavior_version: Some("v2".into()),
        max_frame_bytes: Some(8192),
        timeout_ms: Some(4000),
        tool_scope: Some(ToolScope::Write),
    };
    let value = serde_json::to_value(&caps).unwrap();
    assert_eq!(value["tool_scope"], "write");
    assert_eq!(
        serde_json::from_value::<ToolCapabilities>(value).unwrap(),
        caps
    );
    assert_eq!(
        serde_json::from_value::<ToolScope>(json!("read")).unwrap(),
        ToolScope::Read
    );
}

#[test]
fn removed_hub_fields_and_unknown_capabilities_are_rejected() {
    for value in [
        json!({"hooks": []}),
        json!({"notification_schemas": {}}),
        json!({"server_id": "hub"}),
        json!({"supports_canel": true}),
    ] {
        assert!(serde_json::from_value::<ToolCapabilities>(value).is_err());
    }
}

#[test]
fn streaming_metadata_does_not_silently_drop_unknown_fields() {
    assert!(
        serde_json::from_value::<StreamingSpec>(json!({
            "subkind": "text_delta", "legacy_channel": "hub"
        }))
        .is_err()
    );
    assert!(serde_json::from_value::<StreamingSpec>(json!({})).is_err());
}
