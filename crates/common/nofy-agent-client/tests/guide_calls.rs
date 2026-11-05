use nofy_agent_client::*;
use serde_json::{Value, json};
use std::time::Duration;

fn verify_calls(value: &Value) {
    match value {
        Value::Object(fields) => {
            if let Some(Value::String(name)) = fields.get("operation") {
                let descriptor = operation(name)
                    .unwrap_or_else(|_| panic!("guide references absent operation: {name}"));
                if let Some(tool) = fields.get("tool").and_then(Value::as_str) {
                    assert_eq!(descriptor.mcp_tool.as_deref(), Some(tool), "{name}");
                }
            }
            for item in fields.values() {
                verify_calls(item);
            }
        }
        Value::Array(items) => {
            for item in items {
                verify_calls(item);
            }
        }
        _ => {}
    }
}
#[tokio::test]
async fn every_guide_call_names_a_current_operation_and_human_recovery_is_explicit() {
    let engine =
        Engine::new(KernelClient::new("http://127.0.0.1:1", None, Duration::from_secs(1)).unwrap());
    for op in OPERATIONS.iter() {
        let result = engine
            .execute("schema", json!({"operation":op.operation}))
            .await;
        assert!(!result.is_error(), "{result:?}");
        verify_calls(&result.data["guide"]);
    }
    assert!(validate("run.recovery", &json!({"run_id":"original","kind":"human"})).is_ok());
    let result = engine
        .execute("schema", json!({"operation":"run.control"}))
        .await;
    assert_eq!(
        result.data["guide"]["steps"][0]["arguments"]["kind"],
        "human"
    );
}
