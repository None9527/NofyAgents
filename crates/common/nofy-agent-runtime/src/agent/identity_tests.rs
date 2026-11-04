use super::*;
use crate::{
    IdentityScheme,
    context::ContextBinding,
    context_policy::{ContextPolicy, ContextUpdate},
    event_program::BoundEvent,
    governance::{
        BudgetLimits, GovernanceProfile, InMemoryBudgetStore, InstalledBudget, ModelRetryPolicy,
    },
    hooks::{EventCatalog, HookBus},
    recipe::RuntimeRecipe,
};
use nofy_tool_runtime::{Tool, ToolCallContext, ToolError};

struct Allow;
#[async_trait]
impl Policy for Allow {
    async fn admit(&self, _: &ToolCall, _: &RunState, _: &RunContext) -> Result<Admission, Error> {
        Ok(Admission::Allow)
    }
}
struct Binding;
impl ContextBinding for Binding {
    fn bind(&self, _: &mut RunContext) -> Result<(), Error> {
        Ok(())
    }
}
struct Context;
#[async_trait]
impl ContextPolicy for Context {
    async fn plan(&self, _: &RunState, _: &RunContext) -> Result<Option<Value>, Error> {
        Ok(None)
    }
    async fn apply(&self, _: &RunState, _: &Value, _: &RunContext) -> Result<ContextUpdate, Error> {
        Err(Error::Composition("no context plan".into()))
    }
}
struct Echo;
impl Tool for Echo {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("echo").unwrap()
    }
    fn description(
        &self,
        _: &nofy_tool_runtime::ListToolsContext,
    ) -> nofy_tool_types::ToolDescription {
        nofy_tool_types::ToolDescription::new("echo", "Echo its input")
    }
    async fn run(&self, _: ToolCallContext, value: Value) -> Result<Value, ToolError> {
        Ok(value)
    }
}
struct UnusedModel;
#[async_trait]
impl Model for UnusedModel {
    async fn complete(
        &self,
        _: ModelRequest,
        _: &RunContext,
    ) -> Result<crate::ModelResponse, Error> {
        Err(Error::Model("identity construction must not sample".into()))
    }
}
fn base(scheme: Option<IdentityScheme>) -> Agent {
    let mut tools = ToolCatalog::new();
    tools.insert(crate::ToolEntry::typed(Echo)).unwrap();
    let mut agent = Agent::tool_program("identity".into(), tools);
    agent.set_scope_identity(scheme);
    agent
}
fn bounded(agent: &Agent) -> String {
    let id = agent.composition_identity();
    assert!(id.starts_with("composition-hash-v2:"), "{id}");
    assert_eq!(id.len(), "composition-hash-v2:".len() + 64);
    id.into()
}

#[test]
fn v2_folds_each_capability_update_and_binds_tool_workflow_and_event_identity() {
    let mut agent = base(Some(IdentityScheme::HashedV2));
    let mut seen = std::collections::BTreeSet::from([bounded(&agent)]);
    agent = agent.with_hooks(HookBus::new(EventCatalog::runtime(), vec![]).unwrap());
    assert!(seen.insert(bounded(&agent)));
    agent = agent
        .with_required_policy("policy".repeat(40000), Arc::new(Allow))
        .unwrap();
    assert!(seen.insert(bounded(&agent)));
    agent = agent.with_binding("binding".repeat(40000), Arc::new(Binding));
    assert!(seen.insert(bounded(&agent)));
    let profile = GovernanceProfile::new(
        Arc::new(
            InstalledBudget::install(
                Arc::new(InMemoryBudgetStore::default()),
                BudgetLimits::default(),
                "budget",
                1,
            )
            .unwrap(),
        ),
        BudgetLimits::default(),
        ModelRetryPolicy::default(),
    )
    .unwrap();
    agent = agent.with_governance(Arc::new(profile));
    assert!(seen.insert(bounded(&agent)));
    agent = agent
        .with_context_policy("context".repeat(40000), Arc::new(Context))
        .unwrap();
    assert!(seen.insert(bounded(&agent)));
    agent = agent
        .with_recipe(Arc::new(
            RuntimeRecipe::new("recipe".repeat(40000), vec![]).unwrap(),
        ))
        .unwrap();
    assert!(seen.insert(bounded(&agent)));
    let call = ToolCall {
        id: "call".into(),
        name: "echo".into(),
        arguments: json!({"long":"界".repeat(40000)}),
    };
    let tool = agent.bind_tool_program(call.clone()).unwrap();
    assert!(seen.insert(bounded(&tool)));
    let mut changed = call;
    changed.arguments = json!({"changed":true});
    assert_ne!(
        bounded(&tool),
        bounded(&agent.bind_tool_program(changed).unwrap())
    );
    #[cfg(feature = "workflow")]
    {
        let mut workflow = Agent::tool_program("workflow".into(), ToolCatalog::new());
        workflow.set_scope_identity(Some(IdentityScheme::HashedV2));
        let empty = bounded(&workflow);
        workflow
            .add_program_tool(crate::ToolEntry::typed(Echo))
            .unwrap();
        assert_ne!(empty, bounded(&workflow));
    }
    let event = BoundEvent {
        declaration: EventCatalog::runtime().get("before_stop").unwrap().clone(),
        operation: "event:one".into(),
        payload: json!({}),
    };
    let event = agent
        .bind_event_program(event, "event-source".repeat(40000))
        .unwrap();
    assert!(seen.insert(bounded(&event)));
}

#[test]
fn v2_initial_sampled_identity_is_bounded_deterministic_and_order_sensitive() {
    let components = Components {
        models: BTreeMap::from([("model".into(), Arc::new(UnusedModel) as Arc<dyn Model>)]),
        prompts: BTreeMap::from([(
            "prompt".into(),
            Arc::new(crate::StaticPrompt("prompt".repeat(20000))) as Arc<dyn Prompt>,
        )]),
        ..Default::default()
    };
    let build = || {
        AgentBuilder::new("sampled")
            .model("model")
            .prompt("prompt")
            .settings(Settings {
                scope_identity: Some(IdentityScheme::HashedV2),
                ..Default::default()
            })
            .compile(&components)
            .unwrap()
    };
    let plain = bounded(&build());
    assert_eq!(plain, bounded(&build()));
    let a = build()
        .with_binding("a", Arc::new(Binding))
        .with_binding("b", Arc::new(Binding));
    let same = build()
        .with_binding("a", Arc::new(Binding))
        .with_binding("b", Arc::new(Binding));
    let reverse = build()
        .with_binding("b", Arc::new(Binding))
        .with_binding("a", Arc::new(Binding));
    assert_eq!(bounded(&a), bounded(&same));
    assert_ne!(bounded(&a), bounded(&reverse));
    assert_ne!(plain, bounded(&a));
}

#[test]
fn previous_framework_identity_formats_keep_exact_append_bytes() {
    for scheme in [
        None,
        Some(IdentityScheme::Legacy),
        Some(IdentityScheme::HashedV1),
    ] {
        let mut agent = base(scheme);
        let mut expected = agent.composition_identity().to_owned();
        agent = agent.with_binding("binding", Arc::new(Binding));
        expected = serde_json::to_string(&(expected, "binding")).unwrap();
        assert_eq!(agent.composition_identity(), expected);
        let bus = HookBus::new(EventCatalog::runtime(), vec![]).unwrap();
        expected = serde_json::to_string(&(&expected, "hooks", bus.identity())).unwrap();
        agent = agent.with_hooks(bus);
        assert_eq!(agent.composition_identity(), expected);
        expected = serde_json::to_string(&(&expected, "required_policy", "policy")).unwrap();
        agent = agent
            .with_required_policy("policy", Arc::new(Allow))
            .unwrap();
        assert_eq!(agent.composition_identity(), expected);
    }
}
