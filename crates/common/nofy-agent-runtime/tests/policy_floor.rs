use nofy_agent_runtime::{registry::*, *};
use nofy_tool_runtime::{ToolCallContext, ToolDispatch, ToolStream, TypedToolOutput};
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
    },
};

struct CallModel(&'static str);
#[async_trait::async_trait]
impl Model for CallModel {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        if request
            .messages
            .iter()
            .any(|message| matches!(message, Message::Tool { .. }))
        {
            return Ok(ModelResponse {
                output: "done".into(),
                ..Default::default()
            });
        }
        Ok(ModelResponse {
            tool_calls: vec![ToolCall {
                id: "call-1".into(),
                name: self.0.into(),
                arguments: if self.0 == "delegate" {
                    json!({"prompt":"go"})
                } else {
                    json!({})
                },
            }],
            ..Default::default()
        })
    }
}
struct Effect(Arc<AtomicUsize>);
#[async_trait::async_trait]
impl ToolDispatch for Effect {
    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        _: Value,
        _: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        self.0.fetch_add(1, Ordering::SeqCst);
        nofy_tool_runtime::terminal_only(Ok(TypedToolOutput::from_value(
            id,
            json!({"executed":true}),
        )))
    }
}
struct DenyEffect;
#[async_trait::async_trait]
impl Policy for DenyEffect {
    async fn admit(
        &self,
        call: &ToolCall,
        _: &RunState,
        _: &RunContext,
    ) -> Result<Admission, Error> {
        Ok(if call.name == "effect" {
            Admission::Deny("host policy denied effect".into())
        } else {
            Admission::Allow
        })
    }
}
fn agent(name: &str, tool: &'static str, entry: ToolEntry) -> Agent {
    let mut components = Components::default();
    components
        .models
        .insert("model".into(), Arc::new(CallModel(tool)));
    components
        .prompts
        .insert("prompt".into(), Arc::new(StaticPrompt("system".into())));
    let mut catalog = ToolCatalog::new();
    catalog.insert(entry).unwrap();
    components.tool_packs.insert("tools".into(), catalog);
    AgentBuilder::new(name)
        .model("model")
        .prompt("prompt")
        .tools("tools")
        .compile(&components)
        .unwrap()
}
fn effect(counter: Arc<AtomicUsize>) -> ToolEntry {
    ToolEntry {
        definition: nofy_tool_types::ToolDefinition::function(
            "effect",
            Some("Effect"),
            json!({"type":"object"}),
        ),
        dispatch: Arc::new(Effect(counter)),
    }
}

struct ResetBindings;
impl nofy_agent_runtime::context::ContextBinding for ResetBindings {
    fn bind(&self, context: &mut RunContext) -> Result<(), Error> {
        context.capabilities = Default::default();
        Ok(())
    }
}

#[tokio::test]
async fn inherited_host_policy_cannot_be_removed_by_a_child_or_its_bindings() {
    let count = Arc::new(AtomicUsize::new(0));
    let child = agent("child", "effect", effect(count.clone()))
        .with_binding("reset-v1", Arc::new(ResetBindings));
    let parent = agent("parent", "delegate", child.as_tool("delegate", "child"))
        .with_required_policy("deny-effect-v1", Arc::new(DenyEffect))
        .unwrap();
    assert!(matches!(
        parent
            .invoke(RunInput::new("run"), RunContext::new("thread", "run"))
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(count.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn client_omission_cannot_remove_host_floor_and_restoring_without_it_fails() {
    let count = Arc::new(AtomicUsize::new(0));
    let mut catalog = ToolCatalog::new();
    catalog.insert(effect(count.clone())).unwrap();
    let mut host = ModuleRegistry::default();
    for (id, instance) in [
        (
            "model",
            ModuleInstance::Model(Arc::new(CallModel("effect"))),
        ),
        ("tools", ModuleInstance::ToolPack(catalog)),
        (
            "prompt",
            ModuleInstance::Prompt(Arc::new(StaticPrompt("system".into()))),
        ),
        ("floor", ModuleInstance::Policy(Arc::new(DenyEffect))),
    ] {
        host.register_factory(Arc::new(InstanceFactory::new(id, "impl-1", instance)))
            .unwrap();
        host.define(ModuleDefinition {
            reference: ModuleRef::new(id, "1"),
            factory: id.into(),
            config: json!({}),
            dependencies: BTreeMap::new(),
        })
        .unwrap();
    }
    let weaker = host.clone();
    host.require_policy(ModuleRef::new("floor", "1"));
    let definition=serde_json::from_value(json!({"name":"configured","model":{"id":"model","version":"1"},"prompt":{"id":"prompt","version":"1"},"tool_packs":[{"id":"tools","version":"1"}],"policies":[]})).unwrap();
    let compiled = nofy_agent_runtime::compile::compile_agent(definition, &host).unwrap();
    assert_eq!(
        compiled.snapshot.required_policies,
        vec![ModuleRef::new("floor", "1")]
    );
    compiled
        .agent
        .invoke(RunInput::new("go"), RunContext::new("thread", "run"))
        .await
        .unwrap();
    assert_eq!(count.load(Ordering::SeqCst), 0);
    assert!(compiled.snapshot.restore(&host).is_ok());
    assert!(
        compiled
            .snapshot
            .restore(&weaker)
            .err()
            .unwrap()
            .to_string()
            .contains("floor changed")
    );
}

struct CancelDuringAdmission;
#[async_trait::async_trait]
impl Policy for CancelDuringAdmission {
    async fn admit(
        &self,
        _: &ToolCall,
        _: &RunState,
        context: &RunContext,
    ) -> Result<Admission, Error> {
        context.cancel.cancel();
        Ok(Admission::Pause(json!({"kind":"cancelled"})))
    }
}
#[tokio::test]
async fn cancellation_during_permission_does_not_turn_into_a_pause_or_dispatch() {
    let count = Arc::new(AtomicUsize::new(0));
    let agent = agent("cancel", "effect", effect(count.clone()))
        .with_required_policy("cancel-v1", Arc::new(CancelDuringAdmission))
        .unwrap();
    assert!(matches!(
        agent
            .invoke(RunInput::new("go"), RunContext::new("thread", "run"))
            .await
            .unwrap(),
        RunOutcome::Cancelled { .. }
    ));
    assert_eq!(count.load(Ordering::SeqCst), 0);
}

#[tokio::test]
async fn configured_tool_scope_only_narrows_and_rejects_unknown_options() {
    let factory = nofy_agent_runtime::policy::ToolAllowListFactory;
    let ModuleInstance::Policy(scope) = factory
        .build(&json!({"allowed":["read"]}), &BTreeMap::new())
        .unwrap()
    else {
        panic!("policy")
    };
    let context = RunContext::new("thread", "run");
    let state = RunState::default();
    for (name, allowed) in [("read", true), ("write", false)] {
        let call = ToolCall {
            id: "id".into(),
            name: name.into(),
            arguments: json!({}),
        };
        assert_eq!(
            matches!(
                scope.admit(&call, &state, &context).await.unwrap(),
                Admission::Allow
            ),
            allowed
        );
    }
    assert!(
        factory
            .build(
                &json!({"allowed":["read"],"allow_all":true}),
                &BTreeMap::new()
            )
            .is_err()
    );
    assert!(
        factory
            .build(&json!({"allowed":["read","read"]}), &BTreeMap::new())
            .is_err()
    );
}
