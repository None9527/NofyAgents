use nofy_agent_runtime::{
    Error, RunContext,
    settings::{SettingsResolver, SettingsSource, StaticSettings},
};
use serde_json::{Value, json};
use std::sync::Arc;

struct PerRun;
#[async_trait::async_trait]
impl SettingsSource for PerRun {
    async fn load(&self, context: &RunContext) -> Result<Value, Error> {
        Ok(json!({"model":{"tenant":context.thread_id}}))
    }
}
#[tokio::test]
async fn settings_layers_are_ordered_explicit_and_isolated() {
    let resolver = SettingsResolver::new(vec![
        Arc::new(StaticSettings(
            json!({"max_steps":10,"model":{"temperature":0.2,"tags":["old"],"nested":{"a":1}}}),
        )),
        Arc::new(StaticSettings(
            json!({"model":{"temperature":0.8,"tags":["new"],"nested":{"b":2}}}),
        )),
        Arc::new(PerRun),
    ]);
    let context_a = RunContext::new("a", "1");
    let context_b = RunContext::new("b", "2");
    let (a, b) = tokio::join!(resolver.resolve(&context_a), resolver.resolve(&context_b));
    let a = a.unwrap();
    let b = b.unwrap();
    assert_eq!(a.max_steps, 10);
    assert_eq!(
        a.model,
        json!({"temperature":0.8,"tags":["new"],"nested":{"a":1,"b":2},"tenant":"a"})
    );
    assert_eq!(b.model["tenant"], "b");
}
#[tokio::test]
async fn invalid_sources_fail_closed_and_defaults_need_no_sources() {
    assert_eq!(
        SettingsResolver::default()
            .resolve(&RunContext::default())
            .await
            .unwrap()
            .max_steps,
        32
    );
    for value in [json!([]), json!({"max_steps":0})] {
        let resolver = SettingsResolver::new(vec![Arc::new(StaticSettings(value))]);
        assert!(resolver.resolve(&RunContext::default()).await.is_err());
    }
}
