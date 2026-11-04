use super::*;
use nofy_agent_runtime::{
    AgentBuilder, Checkpoint, Components, InMemoryCheckpointer, Model, ModelRequest, ModelResponse,
    RunContext, RunInput, StaticPrompt,
    governance::GovernanceProfile,
    hooks::{
        EventCatalog, FailurePolicy, HookBus, HookDecision, HookEvent, HookHandler, HookJournal,
        HookJournalBinding, HookRegistration, HookRule,
    },
    registry::ModuleFactory,
};
use nofy_tool_runtime::{Tool, ToolCallContext, ToolError};
use std::collections::BTreeMap;

struct Effect(String);
impl Tool for Effect {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("probe").unwrap()
    }
    fn description(
        &self,
        _: &nofy_tool_runtime::ListToolsContext,
    ) -> nofy_tool_types::ToolDescription {
        nofy_tool_types::ToolDescription::new("probe", "Recorded HTTP effect")
    }
    async fn run(&self, _: ToolCallContext, input: Value) -> Result<Value, ToolError> {
        reqwest::Client::new()
            .post(format!("{}/last", self.0))
            .json(&input)
            .send()
            .await
            .unwrap()
            .json()
            .await
            .map_err(|error| ToolError::custom("http", error.to_string()))
    }
}

struct Capture(Arc<Mutex<Option<RunContext>>>);
#[async_trait::async_trait]
impl HookHandler for Capture {
    async fn handle(&self, _: &HookEvent, context: &RunContext) -> Result<HookDecision, Error> {
        *self.0.lock().unwrap() = Some(context.clone());
        Ok(HookDecision::Deny {
            reason: "context captured".into(),
        })
    }
}
struct Unused;
#[async_trait::async_trait]
impl Model for Unused {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        panic!("the capture gate must stop before model dispatch")
    }
}
fn registration(identity: &str, handler: Arc<dyn HookHandler>) -> Arc<HookRegistration> {
    Arc::new(
        HookRegistration::new(
            identity.into(),
            EventCatalog::runtime().get("before_model").unwrap().clone(),
            HookRule {
                event: "before_model".into(),
                priority: 0,
                timeout_ms: 3000,
                failure: FailurePolicy::Closed,
                matches: None,
            },
            handler,
        )
        .unwrap(),
    )
}
async fn context(profile: Option<Arc<GovernanceProfile>>) -> RunContext {
    let captured = Arc::new(Mutex::new(None));
    let mut components = Components::default();
    components.models.insert("model".into(), Arc::new(Unused));
    components
        .prompts
        .insert("prompt".into(), Arc::new(StaticPrompt("capture".into())));
    let mut agent = AgentBuilder::new("proof-agent")
        .model("model")
        .prompt("prompt")
        .compile(&components)
        .unwrap()
        .with_hooks(
            HookBus::new(
                EventCatalog::runtime(),
                vec![registration("capture", Arc::new(Capture(captured.clone())))],
            )
            .unwrap(),
        );
    if let Some(profile) = profile {
        agent = agent.with_governance(profile);
    }
    agent
        .invoke(
            RunInput::new("capture"),
            RunContext::new("proof-thread", "proof-run"),
        )
        .await
        .unwrap();
    captured.lock().unwrap().take().unwrap()
}
struct LoseAck {
    inner: Arc<dyn Checkpointer>,
    fail: std::sync::atomic::AtomicBool,
}
#[async_trait::async_trait]
impl Checkpointer for LoseAck {
    fn is_durable(&self) -> bool {
        self.inner.is_durable()
    }
    async fn load(&self, key: &str) -> Result<Option<Checkpoint>, Error> {
        self.inner.load(key).await
    }
    async fn save(
        &self,
        key: &str,
        expected: Option<u64>,
        checkpoint: Checkpoint,
    ) -> Result<(), Error> {
        if checkpoint.state.data.get("hook").is_some()
            && checkpoint
                .state
                .data
                .get("decision")
                .is_some_and(|v| !v.is_null())
            && self.fail.swap(false, Ordering::SeqCst)
        {
            return Err(Error::Checkpoint("lost original hook completion".into()));
        }
        self.inner.save(key, expected, checkpoint).await
    }
}

#[tokio::test]
async fn newly_attached_durable_budget_cannot_promote_an_originally_unmetered_hook_intent() {
    let effects = Arc::new(AtomicUsize::new(0));
    let observed = effects.clone();
    let service = serve(Router::new().route(
        "/last",
        route_post(move || {
            let c = observed.clone();
            async move {
                c.fetch_add(1, Ordering::SeqCst);
                Json(json!({"decision":"continue"}))
            }
        }),
    ))
    .await;
    let dir = tempfile::tempdir().unwrap();
    let host = host(dir.path(), Arc::new(AtomicUsize::new(0))).await;
    let system = host
        .control()
        .prepare(
            serde_json::from_value(terminal_source(&service.url, "before_stop", true)).unwrap(),
        )
        .unwrap();
    let budget_ref = ModuleRef::new("quota", "1");
    let resolved = system.registry().resolve(&[budget_ref.clone()]).unwrap();
    let ModuleInstance::Governance(profile) = &resolved.instances[&budget_ref] else {
        panic!("quota")
    };
    let mut tools = nofy_agent_runtime::ToolCatalog::new();
    tools
        .insert(nofy_agent_runtime::ToolEntry::typed(Effect(
            service.url.clone(),
        )))
        .unwrap();
    let ModuleInstance::HookHandler(handler) = nofy_agent_executors::hooks::ExecutorHookFactory
        .build(
            &json!({"tool":"probe"}),
            &BTreeMap::from([("executor".into(), ModuleInstance::ToolPack(tools))]),
        )
        .unwrap()
    else {
        panic!("handler")
    };
    let registration = registration("authority-probe", handler.clone());
    let owner = registration.declaration().owner.clone();
    let bus = HookBus::new(EventCatalog::runtime(), vec![registration]).unwrap();
    let journal = HookJournalBinding(HookJournal::new(Arc::new(LoseAck {
        inner: Arc::new(InMemoryCheckpointer::default()),
        fail: std::sync::atomic::AtomicBool::new(true),
    })));
    let mut original = context(None).await;
    original.capabilities.insert(journal.clone());
    let first_error = bus
        .emit(
            &owner,
            "before_model",
            "external-proof",
            json!({}),
            &original,
        )
        .await
        .unwrap_err();
    assert!(
        first_error
            .to_string()
            .contains("lost original hook completion"),
        "{first_error}"
    );
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    let mut current = context(Some(profile.clone())).await;
    current.capabilities.insert(journal);
    let result = bus
        .emit(
            &owner,
            "before_model",
            "external-proof",
            json!({}),
            &current,
        )
        .await
        .unwrap();
    eprintln!(
        "recovery authority probe: decision={:?}, effects={}",
        result.control,
        effects.load(Ordering::SeqCst)
    );
    assert!(
        matches!(result.control,HookDecision::Pause{ref reason} if reason["kind"]=="uncertain_hook"),
        "{:?}",
        result.control
    );
    assert_eq!(effects.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn same_logical_profile_on_another_storage_cannot_reissue_a_recorded_hook_effect() {
    use nofy_agent_runtime::{
        durable::SqliteStore,
        governance::{BudgetLimits, InstalledBudget, ModelRetryPolicy},
    };
    let effects = Arc::new(AtomicUsize::new(0));
    let observed = effects.clone();
    let service = serve(Router::new().route(
        "/last",
        route_post(move || {
            let c = observed.clone();
            async move {
                c.fetch_add(1, Ordering::SeqCst);
                Json(json!({"decision":"continue"}))
            }
        }),
    ))
    .await;
    let dir = tempfile::tempdir().unwrap();
    let profile = |name: &str| {
        Arc::new(
            GovernanceProfile::new(
                Arc::new(
                    InstalledBudget::install_named(
                        Arc::new(SqliteStore::open(&dir.path().join(name)).unwrap()),
                        Default::default(),
                        "same-logical-resource",
                        "1",
                        1,
                    )
                    .unwrap(),
                ),
                BudgetLimits::default(),
                ModelRetryPolicy::default(),
            )
            .unwrap(),
        )
    };
    let first = profile("first.sqlite");
    let second = profile("second.sqlite");
    assert_eq!(first.identity(), second.identity());
    let mut tools = nofy_agent_runtime::ToolCatalog::new();
    tools
        .insert(nofy_agent_runtime::ToolEntry::typed(Effect(
            service.url.clone(),
        )))
        .unwrap();
    let ModuleInstance::HookHandler(handler) = nofy_agent_executors::hooks::ExecutorHookFactory
        .build(
            &json!({"tool":"probe"}),
            &BTreeMap::from([("executor".into(), ModuleInstance::ToolPack(tools))]),
        )
        .unwrap()
    else {
        panic!("handler")
    };
    let registration = registration("storage-probe", handler);
    let owner = registration.declaration().owner.clone();
    let bus = HookBus::new(EventCatalog::runtime(), vec![registration]).unwrap();
    let journal = HookJournalBinding(HookJournal::new(Arc::new(LoseAck {
        inner: Arc::new(InMemoryCheckpointer::default()),
        fail: std::sync::atomic::AtomicBool::new(true),
    })));
    let mut original = context(Some(first)).await;
    original.capabilities.insert(journal.clone());
    assert!(
        bus.emit(
            &owner,
            "before_model",
            "storage-proof",
            json!({}),
            &original
        )
        .await
        .unwrap_err()
        .to_string()
        .contains("lost original hook completion")
    );
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    let mut current = context(Some(second)).await;
    current.capabilities.insert(journal);
    assert!(
        bus.emit(&owner, "before_model", "storage-proof", json!({}), &current)
            .await
            .unwrap_err()
            .to_string()
            .contains("recovery authority changed")
    );
    assert_eq!(effects.load(Ordering::SeqCst), 1);
}
