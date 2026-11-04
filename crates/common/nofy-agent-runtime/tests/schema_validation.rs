use nofy_agent_runtime::{
    hooks::{EventCatalog, HookFactory},
    registry::ModuleFactory,
    settings::{validate_json_schema, validate_json_value},
};
use serde_json::json;

#[test]
fn repeated_declarations_still_validate_each_value_and_changed_schema() {
    let schema = HookFactory::new(EventCatalog::runtime())
        .descriptor()
        .config_schema;
    let value = json!({"event":"before_model"});
    let started = std::time::Instant::now();
    for _ in 0..512 {
        validate_json_value(&schema, &value).unwrap();
        assert!(
            validate_json_value(&schema, &json!({"event":"before_model","timeout_ms":0})).is_err()
        );
    }
    eprintln!(
        "512 valid+invalid real Hook schema pairs: {:?}",
        started.elapsed()
    );
    let mut changed = schema.clone();
    changed["properties"]["timeout_ms"]["minimum"] = json!(0);
    validate_json_value(&changed, &json!({"event":"before_model","timeout_ms":0})).unwrap();
    assert!(validate_json_value(&schema, &json!({"event":"before_model","timeout_ms":0})).is_err());
    for key in ["$ref", "$dynamicRef", "$recursiveRef"] {
        let external = json!({"type":"object",key:"file:///not-a-schema"});
        assert!(validate_json_schema(&external).is_err());
        assert!(validate_json_value(&external, &json!({})).is_err());
    }
}
