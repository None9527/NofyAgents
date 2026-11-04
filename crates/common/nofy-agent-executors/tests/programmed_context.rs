#![cfg(feature = "rhai")]
use nofy_agent_executors::code::{ContextPolicyFactory, Trusted};
use nofy_agent_runtime::{context_policy::ContextPolicy, registry::*, *};
use serde_json::{Value, json};
use std::{collections::BTreeMap, sync::Arc};

fn build(
    value: Value,
    dependencies: BTreeMap<String, ModuleInstance>,
) -> Result<Arc<dyn ContextPolicy>, Error> {
    let factory = ContextPolicyFactory::new(Arc::new(Trusted));
    let ModuleInstance::ContextPolicy(policy) = factory.build(&value, &dependencies)? else {
        panic!("context policy")
    };
    Ok(policy)
}
fn state() -> RunState {
    let mut state = RunState {
        messages: vec![
            Message::System {
                content: "system".into(),
            },
            Message::User {
                content: "old".into(),
            },
            Message::Assistant {
                content: "answer".into(),
                tool_calls: vec![],
            },
            Message::User {
                content: "current".into(),
            },
        ],
        ..Default::default()
    };
    state.hook_progress.input_start_index = Some(3);
    state
}
fn pure() -> &'static str {
    r#"if args.phase == "plan" { #{keep: args.retained_turn_start} }
    else { let messages = [args.state.messages[0], #{role:"assistant",content:args.parameters.summary,tool_calls:[]}];
      for i in args.plan.keep..args.state.messages.len() { messages.push(args.state.messages[i]); }
      #{kind:"update",update:#{messages:messages,retained_from:args.plan.keep,retained_at:2,metadata:#{source:"external"}}} }"#
}
#[tokio::test]
async fn external_pure_code_prepares_and_transforms_original_state_without_model_or_usage_claims() {
    let policy = build(
        json!({"source":pure(),"parameters":{"summary":"external summary"}}),
        BTreeMap::new(),
    )
    .unwrap();
    let state = state();
    let context = RunContext::new("thread", "run");
    let plan = policy.plan(&state, &context).await.unwrap().unwrap();
    assert_eq!(plan, json!({"keep":3}));
    let update = policy.apply(&state, &plan, &context).await.unwrap();
    assert_eq!(update.messages[0], state.messages[0]);
    assert_eq!(update.messages[2..], state.messages[3..]);
    assert_eq!(update.retained_from, 3);
    assert_eq!(update.retained_at, 2);
    assert_eq!(update.input_tokens + update.output_tokens, 0);
    assert!(
        matches!(&update.messages[1], Message::Assistant {content,..} if content == "external summary")
    );
    let mut no_boundary = state.clone();
    no_boundary.hook_progress.input_start_index = None;
    assert!(policy.apply(&no_boundary, &plan, &context).await.is_err());
    let conservative = policy.plan(&no_boundary, &context).await.unwrap().unwrap();
    assert_eq!(conservative, json!({"keep":1}));
}
#[tokio::test]
async fn programmed_context_rejects_invalid_config_ambient_functions_and_fabricated_usage() {
    for value in [
        json!({"source":""}),
        json!({"source":"eval(\"1\")"}),
        json!({"source":"1","max_operations":0}),
        json!({"source":"1","unknown":true}),
        json!({"source":"1","model":true}),
    ] {
        assert!(build(value, BTreeMap::new()).is_err());
    }
    let context = RunContext::new("t", "r");
    for source in [
        "read_file(\"/etc/passwd\")",
        "http_get(\"http://127.0.0.1/\")",
    ] {
        let policy = build(json!({"source":source}), BTreeMap::new()).unwrap();
        assert!(policy.plan(&state(), &context).await.is_err());
    }
    let policy = build(json!({"source":"#{kind:\"update\",update:#{messages:[],retained_from:0,retained_at:0,input_tokens:999999}}"}), BTreeMap::new()).unwrap();
    assert!(
        policy
            .apply(&state(), &Value::Null, &context)
            .await
            .is_err()
    );
    let cancelled = RunContext::new("t", "cancelled");
    cancelled.cancel.cancel();
    assert!(matches!(
        policy.plan(&state(), &cancelled).await,
        Err(Error::Cancelled)
    ));
}
#[tokio::test]
async fn sampling_requires_original_pending_scope_and_persistent_model_receipts_before_any_request()
{
    struct Forbidden;
    #[async_trait::async_trait]
    impl Model for Forbidden {
        async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
            panic!("must not send an unjournalled request")
        }
    }
    let source = "#{kind:\"sample\",request:#{messages:[],tools:[],settings:#{}},data:() }";
    let policy = build(
        json!({"source":source,"model":true}),
        BTreeMap::from([("model".into(), ModuleInstance::Model(Arc::new(Forbidden)))]),
    )
    .unwrap();
    assert!(
        policy
            .apply(&state(), &Value::Null, &RunContext::new("t", "r"))
            .await
            .is_err()
    );
    let scoped =
        governance::operation_context(&RunContext::new("t", "r"), "original-compact-operation");
    assert!(policy.apply(&state(), &Value::Null, &scoped).await.is_err());
}
