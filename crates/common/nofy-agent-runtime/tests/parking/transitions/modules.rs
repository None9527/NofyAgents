use super::*;
use nofy_agent_runtime::hooks::{EventCatalog, HookDecision, HookEvent, HookFactory, HookHandler};
#[path = "modules/budgets.rs"]
mod budgets;
#[path = "modules/policies.rs"]
mod policies;
#[path = "modules/sessions.rs"]
mod sessions;
#[path = "modules/sources.rs"]
mod sources;

#[derive(Default)]
struct ModelProbe {
    started: Notify,
    released: Notify,
    block_first: std::sync::atomic::AtomicBool,
    buses: Mutex<Vec<String>>,
}
struct UpdatedModel(Arc<Mutex<Vec<ModelRequest>>>, Arc<ModelProbe>);
#[async_trait::async_trait]
impl Model for UpdatedModel {
    async fn request_bound(
        &self,
        _: &ModelRequest,
        _: &RunContext,
    ) -> Result<model::ModelRequestBound, Error> {
        Ok(model::ModelRequestBound {
            max_calls: 1,
            max_input_tokens: Some(10),
            max_output_tokens: Some(5),
        })
    }
    async fn complete(
        &self,
        request: ModelRequest,
        context: &RunContext,
    ) -> Result<ModelResponse, Error> {
        let finished = request
            .messages
            .iter()
            .rev()
            .take_while(|m| !matches!(m, Message::User { .. } | Message::UserParts { .. }))
            .any(|m| matches!(m,Message::Tool {call_id,..} if call_id=="updated-call"));
        self.0.lock().unwrap().push(request);
        if let Some(bus) = context
            .capabilities
            .get::<nofy_agent_runtime::hooks::HookBusBinding>()
        {
            self.1
                .buses
                .lock()
                .unwrap()
                .push(bus.0.identity().to_owned());
        }
        if self.1.block_first.swap(false, Ordering::SeqCst) {
            self.1.started.notify_one();
            self.1.released.notified().await;
        }
        Ok(if finished {
            ModelResponse {
                output: "updated done".into(),
                input_tokens: 3,
                output_tokens: 2,
                ..Default::default()
            }
        } else {
            ModelResponse {
                tool_calls: vec![ToolCall {
                    id: "updated-call".into(),
                    name: "updated".into(),
                    arguments: json!({}),
                }],
                input_tokens: 3,
                output_tokens: 2,
                ..Default::default()
            }
        })
    }
}
struct UpdatedTool {
    path: PathBuf,
    calls: Arc<AtomicUsize>,
    started: Arc<Notify>,
    wait: bool,
}
impl Tool for UpdatedTool {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("updated").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        ToolDescription::new("updated", "Versioned external effect")
    }
    async fn run(
        &self,
        _: ToolCallContext,
        _: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        use std::io::Write;
        let mut file = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.path)
            .unwrap();
        file.write_all(b"updated\n").unwrap();
        file.sync_all().unwrap();
        self.calls.fetch_add(1, Ordering::SeqCst);
        self.started.notify_one();
        if self.wait {
            std::future::pending::<()>().await;
        }
        Ok(json!({"updated":true}))
    }
}
struct Observe(Arc<Mutex<Vec<String>>>);
#[async_trait::async_trait]
impl HookHandler for Observe {
    async fn handle(&self, event: &HookEvent, _: &RunContext) -> Result<HookDecision, Error> {
        self.0.lock().unwrap().push(event.name.clone());
        Ok(HookDecision::Continue)
    }
}
struct Updated {
    system: CompiledSystem,
    requests: Arc<Mutex<Vec<ModelRequest>>>,
    effects: Arc<AtomicUsize>,
    started: Arc<Notify>,
    hooks: Arc<Mutex<Vec<String>>>,
    probe: Arc<ModelProbe>,
}
fn updated(
    registry: &mut ModuleRegistry,
    base: &CompiledSystem,
    path: &Path,
    wait: bool,
) -> Updated {
    let requests = Arc::new(Mutex::new(Vec::new()));
    let probe = Arc::new(ModelProbe::default());
    let effects = Arc::new(AtomicUsize::new(0));
    let started = Arc::new(Notify::new());
    let hooks = Arc::new(Mutex::new(Vec::new()));
    let mut tools = ToolCatalog::new();
    tools
        .insert(ToolEntry::typed(UpdatedTool {
            path: path.join("updated-effects"),
            calls: effects.clone(),
            started: started.clone(),
            wait,
        }))
        .unwrap();
    for factory in [
        Arc::new(InstanceFactory::new(
            "model.updated",
            "1",
            ModuleInstance::Model(Arc::new(UpdatedModel(requests.clone(), probe.clone()))),
        )) as Arc<dyn ModuleFactory>,
        Arc::new(InstanceFactory::new(
            "tools.updated",
            "1",
            ModuleInstance::ToolPack(tools),
        )),
        Arc::new(InstanceFactory::new(
            "hooks.observe",
            "1",
            ModuleInstance::HookHandler(Arc::new(Observe(hooks.clone()))),
        )),
        Arc::new(HookFactory::new(EventCatalog::runtime())),
    ] {
        registry.register_factory(factory).unwrap();
    }
    let mut doc = serde_json::to_value(&base.bundle.document).unwrap();
    doc["modules"].as_array_mut().unwrap().extend([
        json!({"reference":r("updated-model"),"factory":"model.updated","config":{}}),
        json!({"reference":r("updated-tools"),"factory":"tools.updated","config":{}}),
        json!({"reference":r("observer"),"factory":"hooks.observe","config":{}}),
    ]);
    let events = [
        "session_start",
        "turn_start",
        "user_input",
        "before_model",
        "after_tool",
        "turn_done",
    ];
    for event in events {
        doc["modules"].as_array_mut().unwrap().push(json!({"reference":r(event),"factory":"hook.subscription","config":{"event":event},"dependencies":{"handler":r("observer")}}));
    }
    let agent = &mut doc["programs"]["chat"]["definition"];
    agent["model"] = r("updated-model");
    agent["tool_packs"] = json!([r("updated-tools")]);
    agent["hooks"] = json!(events.map(r));
    let system = compile_system(serde_json::from_value(doc).unwrap(), registry).unwrap();
    Updated {
        system,
        requests,
        effects,
        started,
        hooks,
        probe,
    }
}
fn update(
    id: &str,
    system: &CompiledSystem,
    revision: u64,
    tools: bool,
    hooks: bool,
) -> ManagedAction {
    action(
        id,
        ManagedCommand::UpdateModules {
            park_command_id: "park".into(),
            expected_revision: revision,
            release: system.bundle.digest.clone(),
            program: "chat".into(),
            update: ModuleUpdate {
                tool_catalog: tools,
                hook_subscriptions: hooks,
                ..Default::default()
            },
        },
    )
}

#[tokio::test]
async fn prompt_only_update_preserves_active_hook_receipt_identity_across_real_boundaries() {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, _) = setup(dir.path(), true, false);
    let next = updated(&mut registry, &base, dir.path(), false);
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    park(&supervisor, &store, &registry, &base, &gates).await;
    supervisor
        .submit_transition(update("modules", &next.system, 0, true, true), &next.system)
        .await
        .unwrap();
    execute(&supervisor, &registry, "modules").await;
    release(&supervisor, &store).await;
    next.probe.block_first.store(true, Ordering::SeqCst);
    let worker = {
        let s = supervisor.clone();
        let r = registry.clone();
        tokio::spawn(async move { s.execute_submitted(&r, "run").await })
    };
    wake(&next.probe.started).await;
    store
        .enqueue_managed_action(action("park-2", ManagedCommand::Park))
        .await
        .unwrap();
    next.probe.released.notify_one();
    assert!(
        matches!(worker.await.unwrap().unwrap().unwrap(),RunOutcome::Paused {ref reason,..} if reason["kind"]=="parked")
    );
    let mut doc = serde_json::to_value(&next.system.bundle.document).unwrap();
    doc["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|m| m["reference"] == r("prompt"))
        .unwrap()["config"]["text"] = json!("new text, unchanged hook implementation");
    let target = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
    let mut command = change("prompt", &target, 1);
    let ManagedCommand::Transition {
        park_command_id, ..
    } = &mut command.command
    else {
        unreachable!()
    };
    *park_command_id = "park-2".into();
    supervisor
        .submit_transition(command, &target)
        .await
        .unwrap();
    execute(&supervisor, &registry, "prompt").await;
    store
        .enqueue_managed_action(action(
            "unpark-2",
            ManagedCommand::Unpark {
                park_command_id: "park-2".into(),
            },
        ))
        .await
        .unwrap();
    execute(&supervisor, &registry, "unpark-2").await;
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "run")
            .await
            .unwrap()
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    let buses = next.probe.buses.lock().unwrap();
    assert_eq!(buses.len(), 2);
    assert_eq!(buses[0], buses[1]);
    let requests = next.requests.lock().unwrap();
    assert_eq!(
        requests[1].messages[0],
        Message::System {
            content: "new text, unchanged hook implementation".into()
        }
    );
    assert_eq!(next.effects.load(Ordering::SeqCst), 1);
}

struct ProtectedBinding;
impl context::ContextBinding for ProtectedBinding {
    fn bind(&self, _: &mut RunContext) -> Result<(), Error> {
        Ok(())
    }
}
struct ProtectedBindingFactory;
impl ModuleFactory for ProtectedBindingFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "binding.protected_tool".into(),
            revision: "1".into(),
            kind: ModuleKind::Binding,
            config_schema: json!({"type":"object","additionalProperties":false}),
            input_schema: None,
            output_schema: None,
            required_capabilities: Default::default(),
            dependencies: std::collections::BTreeMap::from([(
                "tools".into(),
                ModuleKind::ToolPack,
            )]),
        }
    }
    fn build(
        &self,
        _: &Value,
        _: &std::collections::BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        Ok(ModuleInstance::Binding(Arc::new(ProtectedBinding)))
    }
}
#[tokio::test]
async fn explicit_tool_hook_selection_never_changes_governance_or_shared_protected_dependencies() {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, _) = setup(dir.path(), true, false);
    registry
        .register_factory(Arc::new(ProtectedBindingFactory))
        .unwrap();
    let mut doc = serde_json::to_value(&base.bundle.document).unwrap();
    doc["modules"].as_array_mut().unwrap().push(json!({"reference":r("protected"),"factory":"binding.protected_tool","config":{},"dependencies":{"tools":r("tools")}}));
    doc["programs"]["chat"]["definition"]["bindings"]
        .as_array_mut()
        .unwrap()
        .push(r("protected"));
    let base = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
    let next = updated(&mut registry, &base, dir.path(), false);
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    park(&supervisor, &store, &registry, &base, &gates).await;
    let before = content_digest(&checkpoint(&store, &base).await).unwrap();
    assert!(
        supervisor
            .submit_transition(update("empty", &next.system, 0, false, false), &next.system)
            .await
            .is_err()
    );
    for id in ["steps", "budget", "shared"] {
        let mut doc = serde_json::to_value(&next.system.bundle.document).unwrap();
        if id == "steps" {
            doc["programs"]["chat"]["definition"]["settings"]["max_steps"] = json!(33);
        } else if id == "budget" {
            doc["modules"]
                .as_array_mut()
                .unwrap()
                .iter_mut()
                .find(|m| m["reference"] == r("budget"))
                .unwrap()["config"]["limits"]["max_model_calls"] = json!(9);
        } else {
            doc["modules"]
                .as_array_mut()
                .unwrap()
                .iter_mut()
                .find(|m| m["reference"] == r("tools"))
                .unwrap()["factory"] = json!("tools.updated");
        }
        let invalid = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
        assert!(
            supervisor
                .submit_transition(update(id, &invalid, 0, true, true), &invalid)
                .await
                .is_err()
        );
        assert!(store.managed_action(id).await.unwrap().is_none());
    }
    assert!(store.live_execution("run").await.unwrap().is_none());
    assert_eq!(
        content_digest(&checkpoint(&store, &base).await).unwrap(),
        before
    );
}

#[tokio::test]
async fn tools_and_future_hooks_update_and_recover_without_replaying_old_effects_or_lifecycle() {
    for metered in [false, true] {
        let dir = tempfile::tempdir().unwrap();
        let (store, mut registry, base, gates, _) = setup(dir.path(), metered, true);
        let next = updated(&mut registry, &base, dir.path(), false);
        let supervisor = Arc::new(RunSupervisor::new(store.clone()));
        park(&supervisor, &store, &registry, &base, &gates).await;
        let before = checkpoint(&store, &base).await;
        supervisor
            .submit_managed(request(&base, "next-run"), &base)
            .await
            .unwrap();
        let original = content_digest(
            &store
                .execution_job("run")
                .await
                .unwrap()
                .unwrap()
                .submission,
        )
        .unwrap();
        assert!(
            supervisor
                .submit_transition(change("no-selection", &next.system, 0), &next.system)
                .await
                .is_err()
        );
        assert!(
            supervisor
                .submit_transition(
                    update("only-tools", &next.system, 0, true, false),
                    &next.system
                )
                .await
                .is_err()
        );
        assert!(
            supervisor
                .submit_transition(
                    update("only-hooks", &next.system, 0, false, true),
                    &next.system
                )
                .await
                .is_err()
        );
        let command = update("modules", &next.system, 0, true, true);
        assert!(store.enqueue_managed_action(command.clone()).await.is_err());
        supervisor
            .submit_transition(command.clone(), &next.system)
            .await
            .unwrap();
        if metered {
            let sql = rusqlite::Connection::open(dir.path().join("runtime.sqlite")).unwrap();
            sql.execute_batch("CREATE TRIGGER lose_v2_ack BEFORE UPDATE OF result ON agent_runtime_managed_actions WHEN NEW.command_id='modules' BEGIN SELECT RAISE(ABORT,'v2 ack lost'); END;").unwrap();
            assert!(
                supervisor
                    .execute_managed_action(&registry, "modules")
                    .await
                    .is_err()
            );
            assert!(store.live_execution("run").await.unwrap().is_none());
            assert_eq!(
                content_digest(&checkpoint(&store, &base).await).unwrap(),
                content_digest(&before).unwrap()
            );
            sql.execute_batch("DROP TRIGGER lose_v2_ack").unwrap();
        }
        let reopened = SqliteStore::open(dir.path().join("runtime.sqlite").as_path()).unwrap();
        let recovery = RunSupervisor::new(reopened.clone());
        execute(&recovery, &registry, "modules").await;
        let live = reopened.live_execution("run").await.unwrap().unwrap();
        assert_eq!(live.protocol, "nofy.live/v2");
        assert!(live.modules.as_ref().unwrap().tool_catalog);
        assert!(live.modules.as_ref().unwrap().hook_epoch.is_some());
        assert_eq!(live.after.state.messages, before.state.messages);
        assert_eq!(live.after.state.model_sequence, before.state.model_sequence);
        assert!(next.hooks.lock().unwrap().is_empty());
        assert_eq!(next.effects.load(Ordering::SeqCst), 0);
        execute(&recovery, &registry, "modules").await;
        release(&recovery, &reopened).await;
        let done = recovery
            .execute_submitted(&registry, "run")
            .await
            .unwrap()
            .unwrap();
        assert!(matches!(done,RunOutcome::Completed {ref output,..} if output=="updated done"));
        assert_eq!(next.effects.load(Ordering::SeqCst), 1);
        assert_eq!(gates.calls.load(Ordering::SeqCst), 1);
        let seen = next.requests.lock().unwrap();
        assert_eq!(seen.len(), 2);
        assert!(seen[0].tools.iter().any(|t| t.function.name == "updated"));
        assert!(!seen[0].tools.iter().any(|t| t.function.name == "append"));
        assert_eq!(
            next.hooks.lock().unwrap().as_slice(),
            ["before_model", "after_tool", "before_model", "turn_done"]
        );
        assert_eq!(
            std::fs::read_to_string(dir.path().join("effects")).unwrap(),
            "effect\n"
        );
        assert_eq!(
            std::fs::read_to_string(dir.path().join("updated-effects")).unwrap(),
            "updated\n"
        );
        assert_eq!(
            content_digest(
                &reopened
                    .execution_job("run")
                    .await
                    .unwrap()
                    .unwrap()
                    .submission
            )
            .unwrap(),
            original
        );
        let final_checkpoint = content_digest(&checkpoint(&reopened, &base).await).unwrap();
        assert!(
            recovery
                .execute_submitted(&registry, "next-run")
                .await
                .unwrap_err()
                .to_string()
                .contains("session handoff")
        );
        assert!(matches!(
            reopened
                .execution_job("next-run")
                .await
                .unwrap()
                .unwrap()
                .status,
            JobStatus::Queued
        ));
        assert_eq!(
            content_digest(&checkpoint(&reopened, &base).await).unwrap(),
            final_checkpoint
        );
    }
}

#[tokio::test]
async fn new_tool_uncertain_effect_uses_original_root_receipt_after_update() {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, clock) = setup(dir.path(), true, false);
    let next = updated(&mut registry, &base, dir.path(), true);
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    park(&supervisor, &store, &registry, &base, &gates).await;
    supervisor
        .submit_transition(update("modules", &next.system, 0, true, true), &next.system)
        .await
        .unwrap();
    execute(&supervisor, &registry, "modules").await;
    release(&supervisor, &store).await;
    let worker = {
        let s = supervisor.clone();
        let r = registry.clone();
        tokio::spawn(async move { s.execute_submitted(&r, "run").await })
    };
    wake(&next.started).await;
    worker.abort();
    let _ = worker.await;
    clock.0.store(32000, Ordering::SeqCst);
    let target = store.root_recovery_target("run").await.unwrap().unwrap();
    assert_eq!(target.call.name, "updated");
    store
        .enqueue_managed_action(action(
            "evidence",
            ManagedCommand::ReconcileRootTool {
                receipt: nofy_agent_runtime::supervisor::RootToolReconciliation {
                    model_sequence: target.model_sequence,
                    call: target.call,
                    result: json!({"updated":true}),
                    is_error: false,
                },
            },
        ))
        .await
        .unwrap();
    let done = execute(&supervisor, &registry, "evidence").await;
    assert!(matches!(done.outcome, Some(RunOutcome::Completed { .. })));
    assert_eq!(next.effects.load(Ordering::SeqCst), 1);
    assert_eq!(
        std::fs::read_to_string(dir.path().join("updated-effects")).unwrap(),
        "updated\n"
    );
}

#[tokio::test]
async fn legacy_model_update_keeps_current_modules_and_explicit_rollback_retires_hooks() {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, _) = setup(dir.path(), false, false);
    let next = updated(&mut registry, &base, dir.path(), false);
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    park(&supervisor, &store, &registry, &base, &gates).await;
    supervisor
        .submit_transition(update("modules", &next.system, 0, true, true), &next.system)
        .await
        .unwrap();
    execute(&supervisor, &registry, "modules").await;
    let first = store.live_execution("run").await.unwrap().unwrap();
    assert!(
        supervisor
            .submit_transition(change("implicit-rollback", &base, 1), &base)
            .await
            .is_err()
    );
    let mut doc = serde_json::to_value(&next.system.bundle.document).unwrap();
    doc["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|m| m["reference"] == r("prompt"))
        .unwrap()["config"]["text"] = json!("version three");
    let third = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
    supervisor
        .submit_transition(change("prompt", &third, 1), &third)
        .await
        .unwrap();
    execute(&supervisor, &registry, "prompt").await;
    assert_eq!(
        store.live_execution("run").await.unwrap().unwrap().modules,
        first.modules
    );
    supervisor
        .submit_transition(update("rollback", &base, 2, true, true), &base)
        .await
        .unwrap();
    execute(&supervisor, &registry, "rollback").await;
    let reverted = store.live_execution("run").await.unwrap().unwrap();
    assert_eq!(reverted.revision, 3);
    assert!(reverted.after.state.hook_progress.stop_done);
    release(&supervisor, &store).await;
    let done = supervisor
        .execute_submitted(&registry, "run")
        .await
        .unwrap()
        .unwrap();
    assert!(matches!(done,RunOutcome::Completed {ref state,..} if !state.has_pending_work()));
    assert!(next.hooks.lock().unwrap().is_empty());
    assert_eq!(next.effects.load(Ordering::SeqCst), 0);
    supervisor
        .submit_managed(request(&base, "after-rollback"), &base)
        .await
        .unwrap();
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "after-rollback")
            .await
            .unwrap()
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
}

#[tokio::test]
async fn updated_catalog_does_not_weaken_the_original_tool_permission() {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, _) = setup(dir.path(), true, false);
    registry
        .register_factory(Arc::new(nofy_agent_runtime::policy::ToolAllowListFactory))
        .unwrap();
    let mut doc = serde_json::to_value(&base.bundle.document).unwrap();
    doc["modules"].as_array_mut().unwrap().push(json!({"reference":r("scope"),"factory":"policy.tool_scope","config":{"allowed":["append"]}}));
    doc["programs"]["chat"]["definition"]["policies"] = json!([r("scope")]);
    let base = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
    let next = updated(&mut registry, &base, dir.path(), false);
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    park(&supervisor, &store, &registry, &base, &gates).await;
    supervisor
        .submit_transition(update("modules", &next.system, 0, true, true), &next.system)
        .await
        .unwrap();
    execute(&supervisor, &registry, "modules").await;
    release(&supervisor, &store).await;
    assert!(matches!(
        supervisor
            .execute_submitted(&registry, "run")
            .await
            .unwrap()
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(next.effects.load(Ordering::SeqCst), 0);
    assert!(
        next.requests.lock().unwrap()[1].messages.iter().any(
            |m| matches!(m,Message::Tool {call_id,is_error:true,..} if call_id=="updated-call")
        )
    );
}

struct DynamicView(ToolCatalog, Arc<AtomicUsize>);
#[async_trait::async_trait]
impl tools::ToolSource for DynamicView {
    async fn snapshot(&self, _: &RunContext) -> Result<tools::ToolSnapshot, Error> {
        self.1.fetch_add(1, Ordering::SeqCst);
        Ok(tools::ToolSnapshot {
            revision: "stable-dynamic".into(),
            catalog: self.0.clone(),
        })
    }
}
#[tokio::test]
async fn update_preflight_rejects_dynamic_name_collision_without_polling_or_mutation() {
    let dir = tempfile::tempdir().unwrap();
    let (store, mut registry, base, gates, _) = setup(dir.path(), false, false);
    let polls = Arc::new(AtomicUsize::new(0));
    let mut catalog = ToolCatalog::new();
    catalog
        .insert(ToolEntry::typed(UpdatedTool {
            path: dir.path().join("dynamic-effects"),
            calls: Arc::new(AtomicUsize::new(0)),
            started: Arc::new(Notify::new()),
            wait: false,
        }))
        .unwrap();
    registry
        .register_factory(Arc::new(InstanceFactory::new(
            "source.dynamic",
            "1",
            ModuleInstance::ToolSource(Arc::new(DynamicView(catalog, polls.clone()))),
        )))
        .unwrap();
    let mut doc = serde_json::to_value(&base.bundle.document).unwrap();
    doc["modules"]
        .as_array_mut()
        .unwrap()
        .push(json!({"reference":r("dynamic"),"factory":"source.dynamic","config":{}}));
    doc["programs"]["chat"]["definition"]["tool_sources"] = json!([r("dynamic")]);
    let base = compile_system(serde_json::from_value(doc).unwrap(), &registry).unwrap();
    let next = updated(&mut registry, &base, dir.path(), false);
    let supervisor = Arc::new(RunSupervisor::new(store.clone()));
    park(&supervisor, &store, &registry, &base, &gates).await;
    let before = content_digest(&checkpoint(&store, &base).await).unwrap();
    assert_eq!(polls.load(Ordering::SeqCst), 1);
    let error = supervisor
        .submit_transition(
            update("collision", &next.system, 0, true, true),
            &next.system,
        )
        .await
        .unwrap_err();
    assert!(
        error
            .to_string()
            .contains("conflicts with admitted dynamic tool")
    );
    assert_eq!(polls.load(Ordering::SeqCst), 1);
    assert!(store.managed_action("collision").await.unwrap().is_none());
    assert_eq!(
        content_digest(&checkpoint(&store, &base).await).unwrap(),
        before
    );
}
