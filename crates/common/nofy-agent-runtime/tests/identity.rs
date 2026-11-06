#![cfg(feature = "sqlite")]
use nofy_agent_runtime::{
    compile::*, context::ContextBinding, durable::*, governance::*, mailbox::*, registry::*,
    supervisor::*, *,
};
use nofy_tool_runtime::{Tool, ToolCallContext};
use nofy_tool_types::ToolDescription;
use serde_json::{Value, json};
use std::sync::{
    Arc, Mutex,
    atomic::{AtomicUsize, Ordering},
};
use tokio::sync::Notify;

struct Effect(Arc<AtomicUsize>);
impl Tool for Effect {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("effect").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        ToolDescription::new("effect", "Commit once")
    }
    async fn run(
        &self,
        _: ToolCallContext,
        _: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        self.0.fetch_add(1, Ordering::SeqCst);
        Ok(json!({"done":true}))
    }
}
struct Clear;
impl ContextBinding for Clear {
    fn bind(&self, context: &mut RunContext) -> Result<(), Error> {
        context.capabilities = Default::default();
        Ok(())
    }
}
struct Step {
    leaf: bool,
    mode: &'static str,
    calls: Arc<AtomicUsize>,
    requests: Arc<Mutex<Vec<ModelRequest>>>,
    stop: Arc<Notify>,
    dropped: Arc<Notify>,
    first: AtomicUsize,
}
struct Pending(Arc<Notify>);
impl Drop for Pending {
    fn drop(&mut self) {
        self.0.notify_one();
    }
}
#[async_trait::async_trait]
impl Model for Step {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.calls.fetch_add(1, Ordering::SeqCst);
        let after = request
            .messages
            .iter()
            .any(|message| matches!(message, Message::Tool { .. }));
        if self.leaf {
            self.requests.lock().unwrap().push(request.clone());
        }
        if after {
            if self.leaf && self.first.fetch_add(1, Ordering::SeqCst) == 0 {
                match self.mode {
                    "fail" => {
                        return Err(model::ModelFailure {
                            category: "provider".into(),
                            message: "known failure".into(),
                            status: Some(503),
                            retryable: false,
                            retry_after_ms: None,
                            code: None,
                            details: Value::Null,
                        }
                        .into());
                    }
                    "cancel" => {
                        let _pending = Pending(self.dropped.clone());
                        self.stop.notify_one();
                        std::future::pending::<()>().await;
                    }
                    _ => {}
                }
            }
            if request
                .messages
                .iter()
                .any(|message| matches!(message, Message::Tool { is_error: true, .. }))
            {
                return Err(Error::Composition("child tool failed".into()));
            }
            Ok(ModelResponse {
                output: "done".into(),
                ..Default::default()
            })
        } else {
            Ok(ModelResponse {
                tool_calls: vec![ToolCall {
                    id: "call".into(),
                    name: if self.leaf { "effect" } else { "child" }.into(),
                    arguments: if self.leaf {
                        json!({})
                    } else {
                        json!({"prompt":"task"})
                    },
                }],
                ..Default::default()
            })
        }
    }
}
fn install(registry: &mut ModuleRegistry, id: &str, instance: ModuleInstance) -> ModuleRef {
    registry
        .register_factory(Arc::new(InstanceFactory::new(id, "1", instance)))
        .unwrap();
    let reference = ModuleRef::new(id, "1");
    registry
        .define(ModuleDefinition {
            reference: reference.clone(),
            factory: id.into(),
            config: json!({}),
            dependencies: Default::default(),
        })
        .unwrap();
    reference
}
struct Fixture {
    compiled: Arc<CompiledAgent>,
    registry: ModuleRegistry,
    profile: Arc<GovernanceProfile>,
    effects: Arc<AtomicUsize>,
    calls: Arc<AtomicUsize>,
    requests: Arc<Mutex<Vec<ModelRequest>>>,
    stop: Arc<Notify>,
    dropped: Arc<Notify>,
}
fn fixture(
    store: &SqliteStore,
    depth: usize,
    mode: &'static str,
    scheme: Option<IdentityScheme>,
    conflict: bool,
) -> Fixture {
    let effects = Arc::new(AtomicUsize::new(0));
    let calls = Arc::new(AtomicUsize::new(0));
    let requests = Arc::new(Mutex::new(Vec::new()));
    let stop = Arc::new(Notify::new());
    let dropped = Arc::new(Notify::new());
    let model = |leaf| {
        Arc::new(Step {
            leaf,
            mode,
            calls: calls.clone(),
            requests: requests.clone(),
            stop: stop.clone(),
            dropped: dropped.clone(),
            first: AtomicUsize::new(0),
        }) as Arc<dyn Model>
    };
    let mut registry = ModuleRegistry::default();
    let prompt = install(
        &mut registry,
        "prompt",
        ModuleInstance::Prompt(Arc::new(StaticPrompt("system".into()))),
    );
    let parent_model = install(&mut registry, "parent", ModuleInstance::Model(model(false)));
    let leaf_model = install(&mut registry, "leaf", ModuleInstance::Model(model(true)));
    let binding = install(
        &mut registry,
        "clear",
        ModuleInstance::Binding(Arc::new(Clear)),
    );
    let limits = BudgetLimits {
        max_model_calls: Some(64),
        max_child_calls: Some(64),
        max_tool_calls: Some(64),
        max_depth: Some(16),
        max_active_children: Some(16),
        ..Default::default()
    };
    let profile = Arc::new(
        GovernanceProfile::new(
            Arc::new(
                InstalledBudget::install(Arc::new(store.clone()), limits, "tree-budget", 1)
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
    let mut child: Option<Agent> = None;
    for level in (0..=depth).rev() {
        let leaf = child.is_none();
        let mut tools = ToolCatalog::new();
        tools
            .insert(if let Some(child) = child {
                child.as_tool("child", "Delegate")
            } else {
                ToolEntry::typed(Effect(effects.clone()))
            })
            .unwrap();
        let pack = install(
            &mut registry,
            &format!("tools-{level}"),
            ModuleInstance::ToolPack(tools),
        );
        let mut definition = json!({"name":format!("level-{level}"), "model":if leaf {&leaf_model} else {&parent_model}, "prompt":prompt, "tool_packs":[pack], "bindings":[binding]});
        // Alternate explicit selections and inherited defaults, including
        // bindings that clear extensions before the runtime restores them.
        if let Some(scheme) = scheme.filter(|_| conflict || level % 2 == 0) {
            definition["settings"] = json!({"scope_identity":if conflict && leaf {IdentityScheme::Legacy} else {scheme}});
        }
        if level == 0 {
            definition["governance"] = json!([budget]);
        }
        let compiled =
            compile_agent(serde_json::from_value(definition).unwrap(), &registry).unwrap();
        if level == 0 {
            return Fixture {
                compiled: Arc::new(compiled),
                registry,
                profile,
                effects,
                calls,
                requests,
                stop,
                dropped,
            };
        }
        child = Some(compiled.agent);
    }
    unreachable!()
}
fn context() -> RunContext {
    RunContext::new("thread", "root")
}
async fn summary(store: &SqliteStore, fixture: &Fixture) -> BudgetSummary {
    store
        .inspect(&BudgetScope {
            root_run_id: "root".into(),
            identity: fixture.profile.identity().into(),
        })
        .await
        .unwrap()
        .unwrap()
}
async fn assert_tree(store: &SqliteStore, depth: usize, scheme: IdentityScheme) {
    let children = store.children("root").await.unwrap();
    assert_eq!(children.len(), depth);
    for child in &children {
        assert_eq!(child.run_id, child.thread_id);
        match scheme {
            IdentityScheme::HashedV1 => assert!(child.run_id.starts_with("child-hash-v1:")),
            IdentityScheme::HashedV2 => {
                assert!(child.run_id.starts_with("child-hash-v2:"));
                // This fixture deliberately leaves odd levels' declarations
                // unspecified. Addresses inherit at runtime; a frozen
                // component's compile format is selected by its declaration.
                let level: usize = child
                    .agent_name
                    .strip_prefix("level-")
                    .unwrap()
                    .parse()
                    .unwrap();
                if level.is_multiple_of(2) {
                    assert!(child.composition.starts_with("composition-hash-v2:"));
                    assert_eq!(child.composition.len(), "composition-hash-v2:".len() + 64);
                }
            }
            IdentityScheme::Legacy => assert!(child.run_id.starts_with("child:[")),
        }
        if scheme != IdentityScheme::Legacy {
            assert_eq!(child.run_id.len(), 78);
        }
        assert_eq!(child.status, "completed");
    }
}

#[tokio::test]
async fn sixteen_nested_agents_share_budget_and_bounded_addresses_after_binding_clear() {
    for scheme in [IdentityScheme::HashedV1, IdentityScheme::HashedV2] {
        let temp = tempfile::tempdir().unwrap();
        let path = temp.path().join("runtime.db");
        let store = SqliteStore::open(&path).unwrap();
        let fixture = fixture(&store, 16, "done", Some(scheme), false);
        let supervisor = RunSupervisor::new(store.clone());
        assert!(matches!(
            supervisor
                .execute(&fixture.compiled, RunInput::new("task"), context())
                .await
                .unwrap(),
            RunOutcome::Completed { .. }
        ));
        assert_tree(&store, 16, scheme).await;
        let totals = summary(&store, &fixture).await;
        assert_eq!(totals.used.model_calls, 34);
        assert_eq!(totals.used.child_calls, 16);
        assert_eq!(totals.active_children, 0);
        assert_eq!(fixture.effects.load(Ordering::SeqCst), 1);
        let restored = fixture
            .compiled
            .snapshot
            .restore(&fixture.registry)
            .unwrap();
        let reopened = SqliteStore::open(&path).unwrap();
        assert!(matches!(
            RunSupervisor::new(reopened)
                .execute(&restored, RunInput::resume(), context())
                .await
                .unwrap(),
            RunOutcome::Completed { .. }
        ));
        assert_eq!(fixture.calls.load(Ordering::SeqCst), 34);
    }
}

#[tokio::test]
async fn deep_model_retry_uses_same_frozen_addresses_and_request() {
    for scheme in [IdentityScheme::HashedV1, IdentityScheme::HashedV2] {
        let temp = tempfile::tempdir().unwrap();
        let path = temp.path().join("runtime.db");
        let store = SqliteStore::open(&path).unwrap();
        let fixture = fixture(&store, 12, "fail", Some(scheme), false);
        let supervisor = RunSupervisor::new(store.clone());
        assert!(
            supervisor
                .execute(&fixture.compiled, RunInput::new("task"), context())
                .await
                .is_err()
        );
        let leaf = store
            .children("root")
            .await
            .unwrap()
            .into_iter()
            .find(|c| c.agent_name == "level-12")
            .unwrap();
        let command = ModelRetryCommand {
            command_id: "retry-leaf".into(),
            ticket: supervisor
                .child_model_retry_ticket("root", &leaf.run_id)
                .await
                .unwrap()
                .unwrap(),
        };
        let restored = fixture
            .compiled
            .snapshot
            .restore(&fixture.registry)
            .unwrap();
        let reopened = SqliteStore::open(&path).unwrap();
        assert!(matches!(
            RunSupervisor::new(reopened)
                .control(&restored, RunControlCommand::RetryModel(command), context())
                .await
                .unwrap(),
            RunOutcome::Completed { .. }
        ));
        assert_tree(&store, 12, scheme).await;
        assert_eq!(fixture.effects.load(Ordering::SeqCst), 1);
        {
            let requests = fixture.requests.lock().unwrap();
            assert_eq!(requests.len(), 3);
            assert_eq!(
                serde_json::to_value(&requests[1]).unwrap(),
                serde_json::to_value(&requests[2]).unwrap()
            );
        }
        assert_eq!(summary(&store, &fixture).await.used.model_calls, 27);
        assert_eq!(summary(&store, &fixture).await.active_children, 0);
    }
}

#[tokio::test]
async fn deep_targeted_cancel_can_be_acknowledged_and_resumed() {
    for scheme in [IdentityScheme::HashedV1, IdentityScheme::HashedV2] {
        let temp = tempfile::tempdir().unwrap();
        let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
        let fixture = fixture(&store, 12, "cancel", Some(scheme), false);
        let compiled = fixture.compiled.clone();
        let worker_store = store.clone();
        let worker = tokio::spawn(async move {
            RunSupervisor::new(worker_store)
                .execute(&compiled, RunInput::new("task"), context())
                .await
        });
        tokio::time::timeout(std::time::Duration::from_secs(30), fixture.stop.notified())
            .await
            .unwrap();
        let leaf = store
            .children("root")
            .await
            .unwrap()
            .into_iter()
            .find(|c| c.agent_name == "level-12")
            .unwrap();
        let address = InputAddress {
            root_run_id: "root".into(),
            run_id: leaf.run_id,
            thread_id: leaf.thread_id,
            agent: leaf.agent_name,
        };
        let through = store.cancel(&address, "cancel-leaf").await.unwrap();
        assert!(matches!(
            tokio::time::timeout(std::time::Duration::from_secs(30), worker)
                .await
                .unwrap()
                .unwrap()
                .unwrap(),
            RunOutcome::Cancelled { .. }
        ));
        assert!(matches!(
            RunSupervisor::new(store.clone())
                .control(
                    &fixture.compiled,
                    RunControlCommand::ResumeChildCancel(ChildCancelResumeCommand {
                        command_id: "resume-leaf".into(),
                        address,
                        through
                    }),
                    context()
                )
                .await
                .unwrap(),
            RunOutcome::Completed { .. }
        ));
        assert_tree(&store, 12, scheme).await;
        assert_eq!(fixture.effects.load(Ordering::SeqCst), 1);
        let totals = summary(&store, &fixture).await;
        assert_eq!(totals.used.model_calls, 27);
        assert_eq!(totals.used.child_calls, 12);
        assert_eq!(totals.active_children, 0);
    }
}

#[tokio::test]
async fn default_preserves_legacy_addresses_and_explicit_child_conflict_does_no_child_io() {
    for conflict in [false, true] {
        let temp = tempfile::tempdir().unwrap();
        let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
        let fixture = fixture(
            &store,
            1,
            "done",
            conflict.then_some(IdentityScheme::HashedV1),
            conflict,
        );
        let supervisor = RunSupervisor::new(store.clone());
        let outcome = supervisor
            .execute(&fixture.compiled, RunInput::new("task"), context())
            .await;
        if conflict {
            assert!(outcome.is_err());
            assert_eq!(fixture.requests.lock().unwrap().len(), 0);
            assert_eq!(fixture.effects.load(Ordering::SeqCst), 0);
            assert!(store.children("root").await.unwrap().is_empty());
        } else {
            assert!(matches!(outcome.unwrap(), RunOutcome::Completed { .. }));
            assert_tree(&store, 1, IdentityScheme::Legacy).await;
            assert_eq!(
                store.children("root").await.unwrap()[0].run_id,
                r#"child:["thread","root",1,"call"]"#
            );
            assert!(matches!(
                supervisor
                    .execute(&fixture.compiled, RunInput::resume(), context())
                    .await
                    .unwrap(),
                RunOutcome::Completed { .. }
            ));
            assert_eq!(fixture.effects.load(Ordering::SeqCst), 1);
        }
    }
}

#[tokio::test]
async fn dropping_the_root_future_aborts_owned_descendant_tasks() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let fixture = fixture(&store, 12, "cancel", Some(IdentityScheme::HashedV1), false);
    let compiled = fixture.compiled.clone();
    let worker = tokio::spawn(async move {
        RunSupervisor::new(store)
            .execute(&compiled, RunInput::new("task"), context())
            .await
    });
    tokio::time::timeout(std::time::Duration::from_secs(30), fixture.stop.notified())
        .await
        .unwrap();
    worker.abort();
    assert!(worker.await.unwrap_err().is_cancelled());
    tokio::time::timeout(
        std::time::Duration::from_secs(10),
        fixture.dropped.notified(),
    )
    .await
    .unwrap();
    // The already committed primitive survives. The incomplete model has no
    // receipt; dropping it does not manufacture successful cancellation.
    assert_eq!(fixture.effects.load(Ordering::SeqCst), 1);
    assert_eq!(fixture.requests.lock().unwrap().len(), 2);
}

struct CaptureScope(Arc<Mutex<Vec<String>>>);
#[async_trait::async_trait]
impl Model for CaptureScope {
    async fn complete(
        &self,
        _: ModelRequest,
        context: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.0.lock().unwrap().push(context.run_id.clone());
        Ok(ModelResponse {
            output: "done".into(),
            ..Default::default()
        })
    }
}
#[tokio::test]
async fn model_free_tool_root_can_select_hashed_scope_and_descendants_inherit_it() {
    use nofy_agent_runtime::tool_program::*;
    let seen = Arc::new(Mutex::new(Vec::new()));
    let mut components = Components::default();
    components
        .models
        .insert("model".into(), Arc::new(CaptureScope(seen.clone())));
    components
        .prompts
        .insert("prompt".into(), Arc::new(StaticPrompt("system".into())));
    let child = AgentBuilder::new("child")
        .model("model")
        .prompt("prompt")
        .compile(&components)
        .unwrap();
    let mut tools = ToolCatalog::new();
    tools.insert(child.as_tool("child", "Delegate")).unwrap();
    let mut registry = ModuleRegistry::default();
    let pack = install(&mut registry, "tools", ModuleInstance::ToolPack(tools));
    let definition = json!({"name":"tool-root","scope_identity":"hashed_v1","tool_packs":[pack]});
    let compiled = compile_tools(serde_json::from_value(definition).unwrap(), &registry).unwrap();
    let restored = compiled.snapshot.restore(&registry).unwrap();
    let runtime = restored
        .runtime
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    for input in [RunInput::default(), RunInput::resume()] {
        assert!(matches!(
            runtime
                .invoke(
                    ToolCall {
                        id: "child-call".into(),
                        name: "child".into(),
                        arguments: json!({"prompt":"task"})
                    },
                    input,
                    context()
                )
                .await
                .unwrap(),
            RunOutcome::Completed { .. }
        ));
    }
    let seen = seen.lock().unwrap();
    assert_eq!(seen.len(), 1);
    assert!(seen[0].starts_with("child-hash-v1:"));
    assert_eq!(seen[0].len(), 78);
}

#[test]
fn absent_identity_keeps_old_json_and_unknown_schemes_are_rejected() {
    let original = json!({"max_steps":32,"model":{}});
    assert_eq!(serde_json::to_value(Settings::default()).unwrap(), original);
    assert_eq!(
        serde_json::to_value(DefinitionSettings::default()).unwrap(),
        original
    );
    let tool = json!({"schema_version":1,"name":"tool","tool_packs":[],"tool_sources":[],"policies":[],"governance":[],"hooks":[],"bindings":[],"checkpointer":null});
    let definition: nofy_agent_runtime::tool_program::ToolRuntimeDefinition =
        serde_json::from_value(tool.clone()).unwrap();
    assert_eq!(serde_json::to_value(definition).unwrap(), tool);
    assert!(Settings::from_value(json!({"scope_identity":"guess"})).is_err());
}
