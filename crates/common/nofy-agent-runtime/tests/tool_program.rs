use nofy_agent_runtime::{governance::*, hooks::*, registry::*, tool_program::*, *};
use nofy_tool_runtime::{Tool, ToolCallContext};
use nofy_tool_types::ToolDescription;
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    sync::{
        Arc,
        atomic::{AtomicBool, AtomicUsize, Ordering},
    },
};

struct Effect(Arc<AtomicUsize>);
impl Tool for Effect {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("effect").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        let mut d = ToolDescription::new("effect", "One effect");
        d.arguments_schema = Some(
            json!({"type":"object","properties":{"value":{"type":"integer"}},"required":["value"],"additionalProperties":false}),
        );
        d
    }
    async fn run(
        &self,
        context: ToolCallContext,
        args: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        assert!(context.get::<mailbox::UserToolInvocation>().is_none());
        self.0.fetch_add(1, Ordering::SeqCst);
        Ok(args)
    }
}
struct Gate(Arc<AtomicBool>);
#[async_trait::async_trait]
impl Policy for Gate {
    async fn admit(&self, _: &ToolCall, _: &RunState, _: &RunContext) -> Result<Admission, Error> {
        Ok(if self.0.load(Ordering::SeqCst) {
            Admission::Allow
        } else {
            Admission::Pause(json!({"approval":"exact"}))
        })
    }
}
struct Rewrite;
#[async_trait::async_trait]
impl HookHandler for Rewrite {
    async fn handle(&self, event: &HookEvent, _: &RunContext) -> Result<HookDecision, Error> {
        let mut payload = event.payload.clone();
        payload["call"]["arguments"]["value"] = json!("invalid");
        Ok(HookDecision::Patch { payload })
    }
}
fn install(registry: &mut ModuleRegistry, id: &str, instance: ModuleInstance) -> ModuleRef {
    registry
        .register_factory(Arc::new(InstanceFactory::new(id, "1", instance)))
        .unwrap();
    let r = ModuleRef::new(id, "1");
    registry
        .define(ModuleDefinition {
            reference: r.clone(),
            factory: id.into(),
            config: json!({}),
            dependencies: BTreeMap::new(),
        })
        .unwrap();
    r
}
fn call() -> ToolCall {
    ToolCall {
        id: "node-1".into(),
        name: "effect".into(),
        arguments: json!({"value":7}),
    }
}
fn context() -> RunContext {
    RunContext::new("thread", "run")
}
fn setup(
    gate: Option<Arc<AtomicBool>>,
    hook: bool,
) -> (
    CompiledToolRuntime,
    ModuleRegistry,
    Arc<AtomicUsize>,
    Arc<InMemoryBudgetStore>,
    Arc<GovernanceProfile>,
) {
    let effects = Arc::new(AtomicUsize::new(0));
    let mut pack = ToolCatalog::new();
    pack.insert(ToolEntry::typed(Effect(effects.clone())))
        .unwrap();
    let mut registry = ModuleRegistry::default();
    let tools = install(&mut registry, "tools", ModuleInstance::ToolPack(pack));
    let ledger = Arc::new(InMemoryBudgetStore::default());
    let profile = Arc::new(
        GovernanceProfile::new(
            Arc::new(
                InstalledBudget::install(
                    ledger.clone(),
                    BudgetLimits {
                        max_model_calls: Some(0),
                        max_tool_calls: Some(1),
                        max_steps: Some(0),
                        ..Default::default()
                    },
                    "host",
                    1,
                )
                .unwrap(),
            ),
            BudgetLimits::default(),
            ModelRetryPolicy::default(),
        )
        .unwrap(),
    );
    let governance = install(
        &mut registry,
        "budget",
        ModuleInstance::Governance(profile.clone()),
    );
    registry.require_governance(governance);
    if let Some(gate) = gate {
        let r = install(
            &mut registry,
            "floor",
            ModuleInstance::Policy(Arc::new(Gate(gate))),
        );
        registry.require_policy(r);
    }
    let mut hooks = vec![];
    if hook {
        let registration = HookRegistration::new(
            "rewrite-v1".into(),
            EventCatalog::runtime().get("before_tool").unwrap().clone(),
            HookRule {
                event: "before_tool".into(),
                priority: 0,
                timeout_ms: 1000,
                failure: FailurePolicy::Closed,
                matches: None,
            },
            Arc::new(Rewrite),
        )
        .unwrap();
        hooks.push(install(
            &mut registry,
            "hook",
            ModuleInstance::Hook(Arc::new(registration)),
        ));
    }
    let compiled = compile_tools(
        ToolRuntimeDefinition {
            schema_version: 1,
            name: "tool-host".into(),
            scope_identity: None,
            tool_packs: vec![tools],
            tool_sources: vec![],
            policies: vec![],
            governance: vec![],
            hooks,
            bindings: vec![],
            checkpointer: None,
        },
        &registry,
    )
    .unwrap();
    (compiled, registry, effects, ledger, profile)
}
#[tokio::test]
async fn model_free_tool_uses_no_model_or_step_quota_and_replays_without_effect() {
    let (compiled, registry, effects, ledger, profile) = setup(None, false);
    let store = Arc::new(InMemoryCheckpointer::default());
    let runtime = compiled
        .snapshot
        .restore(&registry)
        .unwrap()
        .runtime
        .with_checkpointer(store);
    for input in [RunInput::default(), RunInput::resume(), RunInput::resume()] {
        let RunOutcome::Completed { state, .. } =
            runtime.invoke(call(), input, context()).await.unwrap()
        else {
            panic!("not completed")
        };
        assert_eq!(state.steps, 0);
        assert_eq!(state.model_sequence, 0);
        assert_eq!(state.messages.len(), 2);
        assert!(matches!(
            &state.messages[1],
            Message::Tool {
                is_error: false,
                ..
            }
        ));
    }
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    let summary = ledger
        .inspect(&BudgetScope {
            root_run_id: "run".into(),
            identity: profile.identity().into(),
        })
        .await
        .unwrap()
        .unwrap();
    assert_eq!(summary.used.model_calls, 0);
    assert_eq!(summary.used.tool_calls, 1);
    assert_eq!(summary.used.steps, 0);
}
#[tokio::test]
async fn tool_runtime_respects_host_floor_approval_and_call_identity_on_resume() {
    let gate = Arc::new(AtomicBool::new(false));
    let (compiled, registry, effects, _, _) = setup(Some(gate.clone()), false);
    let runtime = compiled
        .runtime
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    assert!(matches!(
        runtime
            .invoke(call(), RunInput::default(), context())
            .await
            .unwrap(),
        RunOutcome::Paused { .. }
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 0);
    let mut changed = call();
    changed.arguments = json!({"value":8});
    assert!(
        runtime
            .invoke(changed, RunInput::resume(), context())
            .await
            .is_err()
    );
    gate.store(true, Ordering::SeqCst);
    assert!(matches!(
        runtime
            .invoke(call(), RunInput::resume(), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    assert!(
        compiled
            .snapshot
            .restore(&ModuleRegistry::default())
            .is_err()
    );
    assert!(compiled.snapshot.restore(&registry).is_ok());
}
#[tokio::test]
async fn actual_hook_rewrite_is_validated_before_primitive_effect() {
    let (compiled, _, effects, _, _) = setup(None, true);
    let outcome = compiled
        .runtime
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()))
        .invoke(call(), RunInput::default(), context())
        .await
        .unwrap();
    let RunOutcome::Completed { state, .. } = outcome else {
        panic!("not completed")
    };
    assert!(matches!(
        state.messages.last(),
        Some(Message::Tool { is_error: true, .. })
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 0);
}
#[tokio::test]
async fn invalid_arguments_and_cancelled_context_do_not_dispatch() {
    let (compiled, _, effects, _, _) = setup(None, false);
    let mut invalid = call();
    invalid.arguments = json!({"value":"wrong"});
    let outcome = compiled
        .runtime
        .invoke(invalid, RunInput::default(), context())
        .await
        .unwrap();
    assert!(matches!(outcome, RunOutcome::Completed { .. }));
    assert_eq!(effects.load(Ordering::SeqCst), 0);
    let cancelled = context();
    cancelled.cancel.cancel();
    assert!(matches!(
        compiled
            .runtime
            .invoke(call(), RunInput::default(), cancelled)
            .await
            .unwrap(),
        RunOutcome::Cancelled { .. }
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 0);
    assert!(
        compiled
            .runtime
            .invoke(call(), RunInput::new("bad"), context())
            .await
            .is_err()
    );
}

struct LoseResult {
    inner: InMemoryCheckpointer,
    lose: AtomicBool,
}
#[async_trait::async_trait]
impl Checkpointer for LoseResult {
    async fn load(&self, key: &str) -> Result<Option<Checkpoint>, Error> {
        self.inner.load(key).await
    }
    async fn save(&self, key: &str, expected: Option<u64>, cp: Checkpoint) -> Result<(), Error> {
        if cp
            .state
            .messages
            .iter()
            .any(|m| matches!(m, Message::Tool { .. }))
            && self.lose.swap(false, Ordering::SeqCst)
        {
            return Err(Error::Checkpoint("lost tool result checkpoint".into()));
        }
        self.inner.save(key, expected, cp).await
    }
}
#[tokio::test]
async fn lost_result_checkpoint_replays_real_ledger_receipt_without_model_or_effect() {
    let (compiled, _, effects, ledger, profile) = setup(None, false);
    let runtime = compiled.runtime.with_checkpointer(Arc::new(LoseResult {
        inner: Default::default(),
        lose: AtomicBool::new(true),
    }));
    assert!(
        runtime
            .invoke(call(), RunInput::default(), context())
            .await
            .unwrap_err()
            .to_string()
            .contains("lost tool result")
    );
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    assert!(matches!(
        runtime
            .invoke(call(), RunInput::resume(), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    let summary = ledger
        .inspect(&BudgetScope {
            root_run_id: "run".into(),
            identity: profile.identity().into(),
        })
        .await
        .unwrap()
        .unwrap();
    assert_eq!(summary.used.tool_calls, 1);
    assert_eq!(summary.active_operations, 0);
    assert_eq!(summary.used.model_calls, 0);
}
struct BlockedEffect {
    started: Arc<tokio::sync::Notify>,
    effects: Arc<AtomicUsize>,
}
impl Tool for BlockedEffect {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("effect").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        ToolDescription::new("effect", "Unknown external effect")
    }
    async fn run(
        &self,
        _: ToolCallContext,
        _: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        self.effects.fetch_add(1, Ordering::SeqCst);
        self.started.notify_one();
        std::future::pending().await
    }
}
#[tokio::test]
async fn lost_worker_requires_explicit_primitive_reconciliation_in_tool_program() {
    let effects = Arc::new(AtomicUsize::new(0));
    let started = Arc::new(tokio::sync::Notify::new());
    let mut catalog = ToolCatalog::new();
    catalog
        .insert(ToolEntry::typed(BlockedEffect {
            started: started.clone(),
            effects: effects.clone(),
        }))
        .unwrap();
    let mut registry = ModuleRegistry::default();
    let tools = install(&mut registry, "tools", ModuleInstance::ToolPack(catalog));
    let ledger = Arc::new(InMemoryBudgetStore::default());
    let profile = Arc::new(
        GovernanceProfile::new(
            Arc::new(
                InstalledBudget::install(
                    ledger.clone(),
                    BudgetLimits {
                        max_model_calls: Some(0),
                        max_concurrent_operations: Some(1),
                        max_tool_calls: Some(1),
                        ..Default::default()
                    },
                    "blocked-host",
                    1,
                )
                .unwrap(),
            ),
            BudgetLimits::default(),
            ModelRetryPolicy::default(),
        )
        .unwrap(),
    );
    let budget = install(
        &mut registry,
        "budget",
        ModuleInstance::Governance(profile.clone()),
    );
    registry.require_governance(budget);
    let compiled = compile_tools(
        serde_json::from_value(json!({"name":"primitive","tool_packs":[tools]})).unwrap(),
        &registry,
    )
    .unwrap();
    let runtime = compiled
        .runtime
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    let worker_runtime = runtime.clone();
    let worker = tokio::spawn(async move {
        worker_runtime
            .invoke(call(), RunInput::default(), context())
            .await
    });
    tokio::time::timeout(std::time::Duration::from_secs(2), started.notified())
        .await
        .unwrap();
    worker.abort();
    assert!(worker.await.unwrap_err().is_cancelled());
    assert!(matches!(
        runtime
            .invoke(call(), RunInput::resume(), context())
            .await
            .unwrap(),
        RunOutcome::Paused { .. }
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    let mut input = RunInput::resume();
    input.reconciled = Some((call().id, json!({"observed":true}), false));
    let RunOutcome::Completed { state, .. } =
        runtime.invoke(call(), input, context()).await.unwrap()
    else {
        panic!("did not reconcile")
    };
    assert!(state.in_flight.is_none());
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    let summary = ledger
        .inspect(&BudgetScope {
            root_run_id: "run".into(),
            identity: profile.identity().into(),
        })
        .await
        .unwrap()
        .unwrap();
    assert_eq!(summary.active_operations, 0);
    assert_eq!(summary.used.tool_calls, 1);
}
