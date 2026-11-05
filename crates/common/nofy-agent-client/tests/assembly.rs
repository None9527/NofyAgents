use nofy_agent_client::*;
use serde_json::{Value, json};
use std::time::Duration;
#[tokio::test]
async fn every_operation_exposes_a_typed_guide_without_framework_source_or_kernel_io() {
    let engine =
        Engine::new(KernelClient::new("http://127.0.0.1:1", None, Duration::from_secs(1)).unwrap());
    let contract = schema("AssemblyGuide").unwrap();
    let validator = jsonschema::validator_for(&contract).unwrap();
    for operation in OPERATIONS.iter() {
        let result = engine
            .execute("schema", json!({"operation":operation.operation}))
            .await;
        assert!(!result.is_error(), "{}: {result:?}", operation.operation);
        assert!(
            validator.is_valid(&result.data["guide"]),
            "{}",
            operation.operation
        );
        assert_eq!(result.data["guide"]["subject"]["name"], operation.operation);
        assert!(!result.data["guide"]["summary"].as_str().unwrap().is_empty());
    }
}
#[tokio::test]
async fn ambiguous_create_and_precise_target_errors_return_actionable_guidance() {
    let source = nofy_agent_project::Source::empty("coder", "system").unwrap();
    let input = json!({"agent":"coder","source":source,"target":{"kind":"project","project_id":"coder","expected_revision":"1"}});
    assert!(validate("agent.create", &input).is_err());
    let error = validate(
        "agent.plan",
        &json!({"agent":"coder","target":{"kind":"project"}}),
    )
    .unwrap_err();
    assert_eq!(error.details["path"], "/target/project_id");
    let engine =
        Engine::new(KernelClient::new("http://127.0.0.1:1", None, Duration::from_secs(1)).unwrap());
    let result = engine
        .execute(
            "agent.plan",
            json!({"agent":"coder","target":{"kind":"project"}}),
        )
        .await;
    let details = &result.error.as_ref().unwrap()["details"];
    assert_eq!(details["recovery"]["action"], "correct_input");
    assert!(!details["recovery"]["automatic_retry"].as_bool().unwrap());
    let schema = engine
        .execute("schema", json!({"operation":"run.start"}))
        .await;
    let native = &schema.data["guide"]["examples"][0];
    assert_eq!(native["native_json_field"], "request_json");
    assert!(native["native_json_body"].is_object());
    let _: Value = serde_json::to_value(schema).unwrap();
}
