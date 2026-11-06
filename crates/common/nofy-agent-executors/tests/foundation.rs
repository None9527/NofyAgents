#![cfg(feature = "rhai")]
use nofy_agent_executors::code::{ContextPolicyFactory, Trusted};
use nofy_agent_runtime::{
    Error, Message, Model, ModelRequest, ModelResponse, RunContext, RunState, registry::*,
};
use serde_json::{Value, json};
use std::{collections::BTreeMap, path::Path, sync::Arc};
/// A negative capability: planning must not invoke any sampling at all.
struct NoSampling;
#[tokio::test]
async fn manual_compaction_prefix_plans_once_even_below_pressure_threshold() {
    let root = Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../../../modules/agent-foundation/context-compaction");
    let source = std::fs::read_to_string(root.join("compact.rhai")).unwrap();
    let parameters = json!({"mode":"tail_keep","context_window":262144,"threshold_percent":75,"keep_turns":2,"manual_prefix":"/compact","summary_prompt":"Summarize facts","model_settings":{}});
    let ModuleInstance::ContextPolicy(policy) = ContextPolicyFactory::new(Arc::new(Trusted))
        .build(
            &json!({"source":source,"model":true,"parameters":parameters}),
            &BTreeMap::from([("model".into(), ModuleInstance::Model(Arc::new(NoSampling)))]),
        )
        .unwrap()
    else {
        panic!("policy")
    };
    let mut state = RunState {
        messages: vec![
            Message::System {
                content: "system".into(),
            },
            Message::User {
                content: "prior".into(),
            },
            Message::Assistant {
                content: "prior answer".into(),
                tool_calls: vec![],
            },
            Message::User {
                content: "/compact now".into(),
            },
        ],
        ..RunState::default()
    };
    state.hook_progress.input_start_index = Some(3);
    let context = RunContext::new("thread", "run");
    let plan = policy.plan(&state, &context).await.unwrap().unwrap();
    assert_eq!(plan["manual"], true);
    assert_eq!(plan["keep"], 3);
    state.messages.remove(2);
    state.hook_progress.input_start_index = Some(2);
    assert!(policy.plan(&state, &context).await.unwrap().is_none());
}
#[async_trait::async_trait]
impl Model for NoSampling {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        Err(Error::Composition("planning attempted to sample".into()))
    }
}
#[tokio::test]
async fn external_compaction_policy_plans_without_sampling_and_requires_persistent_receipts() {
    let root = Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../../../modules/agent-foundation/context-compaction");
    let source = std::fs::read_to_string(root.join("compact.rhai")).unwrap();
    let manifest: Value =
        serde_json::from_slice(&std::fs::read(root.join("module.json")).unwrap()).unwrap();
    let mut parameters = serde_json::Map::new();
    for (key, property) in manifest["parameters_schema"]["properties"]
        .as_object()
        .unwrap()
    {
        if let Some(value) = property.get("default") {
            parameters.insert(key.clone(), value.clone());
        }
    }
    parameters.insert("context_window".into(), json!(256));
    parameters.insert("keep_turns".into(), json!(1));
    let factory = ContextPolicyFactory::new(Arc::new(Trusted));
    let ModuleInstance::ContextPolicy(policy) = factory
        .build(
            &json!({"source":source,"model":true,"parameters":parameters}),
            &BTreeMap::from([("model".into(), ModuleInstance::Model(Arc::new(NoSampling)))]),
        )
        .unwrap()
    else {
        panic!("context policy")
    };
    let mut state = RunState::default();
    state.messages.push(Message::System {
        content: "protected system".into(),
    });
    for _ in 0..4 {
        state.messages.push(Message::User {
            content: "prior evidence ".repeat(100),
        });
        state.messages.push(Message::Assistant {
            content: "prior answer".into(),
            tool_calls: vec![],
        });
    }
    state.hook_progress.input_start_index = Some(state.messages.len());
    state.messages.push(Message::User {
        content: "current instruction".into(),
    });
    let context = nofy_agent_runtime::governance::operation_context(
        &RunContext::new("context-thread", "context-run"),
        "prepared-context-operation",
    );
    let proposal = policy.plan(&state, &context).await.unwrap().unwrap();
    assert!(proposal["keep"].as_u64().unwrap() > 1);
    assert!(
        proposal["keep"].as_u64().unwrap() < state.hook_progress.input_start_index.unwrap() as u64
    );
    let error = policy
        .apply(&state, &proposal, &context)
        .await
        .err()
        .expect("missing receipts");
    assert!(
        error.to_string().contains("persistent model receipts"),
        "{error}"
    );
    let mut small = RunState {
        messages: vec![
            Message::System {
                content: "system".into(),
            },
            Message::User {
                content: "current".into(),
            },
        ],
        ..RunState::default()
    };
    small.hook_progress.input_start_index = Some(1);
    assert!(policy.plan(&small, &context).await.unwrap().is_none());
}
