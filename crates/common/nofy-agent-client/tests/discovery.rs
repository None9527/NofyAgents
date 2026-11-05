use nofy_agent_client::{operation, schema, validate};
use serde_json::json;

#[test]
fn gateway_fields_are_top_level_and_selector_validation_remains_exact() {
    let selector = schema(&operation("schema").unwrap().input_schema).unwrap();
    for field in ["operation", "factory", "preset", "package"] {
        assert!(
            selector["properties"].get(field).is_some(),
            "missing {field}"
        );
    }
    assert!(validate("schema", &json!({"operation":"agent.create"})).is_ok());
    assert!(validate("schema", &json!({"factory":"tool.compose"})).is_ok());
    assert!(validate("schema", &json!({})).is_err());
    assert!(
        validate(
            "schema",
            &json!({"factory":"tool.compose","operation":"agent.create"})
        )
        .is_err()
    );
    let tool = schema(&operation("agent.tool.add").unwrap().input_schema).unwrap();
    for field in ["target", "agent", "factory", "config"] {
        assert!(tool["properties"].get(field).is_some(), "missing {field}");
    }
}
