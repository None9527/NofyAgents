use super::*;
#[cfg(feature = "sqlite")]
use std::sync::atomic::AtomicBool;

#[cfg(feature = "sqlite")]
struct FailingCheckpoint {
    inner: Arc<dyn Checkpointer>,
    tool: bool,
    failed: AtomicBool,
}
#[cfg(feature = "sqlite")]
#[async_trait::async_trait]
impl Checkpointer for FailingCheckpoint {
    fn is_durable(&self) -> bool {
        self.inner.is_durable()
    }
    async fn load(&self, key: &str) -> Result<Option<Checkpoint>, Error> {
        self.inner.load(key).await
    }
    async fn save(&self, key: &str, expected: Option<u64>, row: Checkpoint) -> Result<(), Error> {
        if let Some(old) = self.inner.load(key).await? {
            let is_result = if self.tool {
                old.state.in_flight.is_some() && row.state.in_flight.is_none()
            } else {
                old.state.pending_model.is_some() && row.state.pending_model.is_none()
            };
            if is_result && !self.failed.swap(true, Ordering::SeqCst) {
                return Err(Error::Checkpoint("simulated result commit loss".into()));
            }
        }
        self.inner.save(key, expected, row).await
    }
}
#[cfg(feature = "sqlite")]
#[tokio::test]
async fn durable_model_and_tool_receipts_survive_reopen_without_redispatch() {
    for tool in [false, true] {
        let temp = tempfile::tempdir().unwrap();
        let path = temp.path().join("runtime.sqlite");
        let ledger = Arc::new(durable::SqliteStore::open(&path).unwrap());
        let p = profile(
            ledger.clone(),
            BudgetLimits {
                max_model_calls: Some(2),
                max_concurrent_operations: Some(1),
                ..Default::default()
            },
            1,
            0,
        );
        let calls = Arc::new(AtomicUsize::new(0));
        let effects = Arc::new(AtomicUsize::new(0));
        let model = script(calls.clone(), tool.then_some("effect"));
        let entries = if tool {
            vec![ToolEntry::typed(Effect(effects.clone()))]
        } else {
            vec![]
        };
        let bare = build(model, entries);
        let agent = bare
            .clone()
            .with_checkpointer(Arc::new(FailingCheckpoint {
                inner: ledger.clone(),
                tool,
                failed: AtomicBool::new(false),
            }))
            .with_governance(p.clone());
        assert!(matches!(
            agent.invoke(RunInput::new("query"), context()).await,
            Err(Error::Checkpoint(_))
        ));
        drop(agent);
        drop(p);
        drop(ledger);
        let reopened = Arc::new(durable::SqliteStore::open(&path).unwrap());
        let p = profile(
            reopened.clone(),
            BudgetLimits {
                max_model_calls: Some(2),
                max_concurrent_operations: Some(1),
                ..Default::default()
            },
            1,
            0,
        );
        let agent = bare
            .with_checkpointer(reopened.clone())
            .with_governance(p.clone());
        assert!(matches!(
            agent.invoke(RunInput::resume(), context()).await.unwrap(),
            RunOutcome::Completed { .. }
        ));
        assert_eq!(calls.load(Ordering::SeqCst), if tool { 2 } else { 1 });
        assert_eq!(effects.load(Ordering::SeqCst), usize::from(tool));
        let summary = reopened.inspect(&scope(&p)).await.unwrap().unwrap();
        assert_eq!(summary.used.model_calls, if tool { 2 } else { 1 });
        assert_eq!(summary.reserved, BudgetCost::default());
    }
}
struct LostModel {
    calls: Arc<AtomicUsize>,
    started: Arc<Notify>,
}
#[async_trait::async_trait]
impl Model for LostModel {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        self.calls.fetch_add(1, Ordering::SeqCst);
        self.started.notify_one();
        std::future::pending().await
    }
}
#[tokio::test]
async fn lost_model_dispatch_pauses_instead_of_resending_and_rejects_another_run_id() {
    let store = Arc::new(InMemoryCheckpointer::default());
    let ledger = Arc::new(InMemoryBudgetStore::default());
    let p = profile(ledger, BudgetLimits::default(), 1, 0);
    let calls = Arc::new(AtomicUsize::new(0));
    let started = Arc::new(Notify::new());
    let agent = build(
        Arc::new(LostModel {
            calls: calls.clone(),
            started: started.clone(),
        }),
        vec![],
    )
    .with_checkpointer(store)
    .with_governance(p);
    let task_agent = agent.clone();
    let task =
        tokio::spawn(async move { task_agent.invoke(RunInput::new("query"), context()).await });
    started.notified().await;
    task.abort();
    let _ = task.await;
    assert!(matches!(
        agent
            .invoke(RunInput::resume(), RunContext::new("thread", "another-run"))
            .await,
        Err(Error::Checkpoint(_))
    ));
    assert!(
        matches!(agent.invoke(RunInput::resume(), context()).await.unwrap(), RunOutcome::Paused {reason,..} if reason["kind"]=="budget_uncertain")
    );
    assert_eq!(calls.load(Ordering::SeqCst), 1);
}

struct ResetBindings;
impl context::ContextBinding for ResetBindings {
    fn bind(&self, context: &mut RunContext) -> Result<(), Error> {
        context.capabilities = Default::default();
        Ok(())
    }
}
#[tokio::test]
async fn configured_host_floor_survives_omission_restore_and_child_binding_reset() {
    use registry::*;
    use std::collections::BTreeMap;
    let ledger = Arc::new(InMemoryBudgetStore::default());
    let mut registry = ModuleRegistry::default();
    let resource = Arc::new(
        InstalledBudget::install(
            ledger,
            BudgetLimits {
                max_model_calls: Some(0),
                ..Default::default()
            },
            "host-1",
            1,
        )
        .unwrap(),
    );
    let factory = GovernanceFactory::new(BTreeMap::from([("budget".into(), resource)])).unwrap();
    assert!(
        factory
            .build(
                &json!({"resource":"budget","limits":{"max_model_calls":1}}),
                &BTreeMap::new()
            )
            .is_err()
    );
    registry.register_factory(Arc::new(factory)).unwrap();
    let calls = Arc::new(AtomicUsize::new(0));
    for (id, instance) in [
        ("model", ModuleInstance::Model(script(calls.clone(), None))),
        (
            "prompt",
            ModuleInstance::Prompt(Arc::new(StaticPrompt("test".into()))),
        ),
    ] {
        registry
            .register_factory(Arc::new(InstanceFactory::new(id, "1", instance)))
            .unwrap();
        registry
            .define(ModuleDefinition {
                reference: ModuleRef::new(id, "1"),
                factory: id.into(),
                config: json!({}),
                dependencies: BTreeMap::new(),
            })
            .unwrap();
    }
    registry
        .define(ModuleDefinition {
            reference: ModuleRef::new("floor", "1"),
            factory: "governance.budget".into(),
            config: json!({"resource":"budget"}),
            dependencies: BTreeMap::new(),
        })
        .unwrap();
    let weaker = registry.clone();
    registry.require_governance(ModuleRef::new("floor", "1"));
    let definition = serde_json::from_value(json!({"name":"configured","model":{"id":"model","version":"1"},"prompt":{"id":"prompt","version":"1"},"governance":[]})).unwrap();
    let compiled = compile::compile_agent(definition, &registry).unwrap();
    assert_eq!(
        compiled.snapshot.required_governance,
        vec![ModuleRef::new("floor", "1")]
    );
    assert!(compiled.snapshot.restore(&registry).is_ok());
    assert!(compiled.snapshot.restore(&weaker).is_err());
    assert!(matches!(
        compiled
            .agent
            .invoke(RunInput::new("query"), context())
            .await
            .unwrap(),
        RunOutcome::BudgetExceeded { .. }
    ));
    assert_eq!(calls.load(Ordering::SeqCst), 0);
    let parent_calls = Arc::new(AtomicUsize::new(0));
    let child =
        build(script(calls.clone(), None), vec![]).with_binding("reset-1", Arc::new(ResetBindings));
    let profile = profile(
        Arc::new(InMemoryBudgetStore::default()),
        BudgetLimits {
            max_model_calls: Some(1),
            ..Default::default()
        },
        1,
        0,
    );
    let agent = build(
        script(parent_calls.clone(), Some("child")),
        vec![child.as_tool("child", "child")],
    )
    .with_governance(profile);
    assert!(matches!(
        agent
            .invoke(RunInput::new("query"), context())
            .await
            .unwrap(),
        RunOutcome::BudgetExceeded { .. }
    ));
    assert_eq!(parent_calls.load(Ordering::SeqCst), 1);
    assert_eq!(calls.load(Ordering::SeqCst), 0);
}
struct LostTool {
    calls: Arc<AtomicUsize>,
    started: Arc<Notify>,
}
#[async_trait::async_trait]
impl nofy_tool_runtime::ToolDispatch for LostTool {
    async fn call(
        &self,
        _: nofy_tool_protocol::ToolId,
        _: Value,
        _: ToolCallContext,
    ) -> nofy_tool_runtime::ToolStream<nofy_tool_runtime::TypedToolOutput> {
        self.calls.fetch_add(1, Ordering::SeqCst);
        self.started.notify_one();
        std::future::pending().await
    }
}
#[tokio::test]
async fn uncertain_primitive_requires_explicit_reconciliation_and_releases_its_slot() {
    let effects = Arc::new(AtomicUsize::new(0));
    let started = Arc::new(Notify::new());
    let ledger = Arc::new(InMemoryBudgetStore::default());
    let p = profile(
        ledger.clone(),
        BudgetLimits {
            max_concurrent_operations: Some(1),
            ..Default::default()
        },
        1,
        0,
    );
    let entry = ToolEntry {
        definition: nofy_tool_types::ToolDefinition::function(
            "effect",
            Some("effect"),
            json!({"type":"object"}),
        ),
        dispatch: Arc::new(LostTool {
            calls: effects.clone(),
            started: started.clone(),
        }),
    };
    let agent = build(
        script(Arc::new(AtomicUsize::new(0)), Some("effect")),
        vec![entry],
    )
    .with_checkpointer(Arc::new(InMemoryCheckpointer::default()))
    .with_governance(p.clone());
    let task_agent = agent.clone();
    let task =
        tokio::spawn(async move { task_agent.invoke(RunInput::new("query"), context()).await });
    started.notified().await;
    task.abort();
    let _ = task.await;
    assert!(
        matches!(agent.invoke(RunInput::resume(), context()).await.unwrap(), RunOutcome::Paused {reason,..} if reason["kind"]=="budget_uncertain")
    );
    let mut input = RunInput::resume();
    input.reconciled = Some((
        "provider-id".into(),
        json!({"external_receipt":"confirmed"}),
        false,
    ));
    assert!(matches!(
        agent.invoke(input, context()).await.unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    let summary = ledger.inspect(&scope(&p)).await.unwrap().unwrap();
    assert_eq!(summary.used.tool_calls, 1);
    assert_eq!(summary.active_operations, 0);
    assert_eq!(summary.reserved, BudgetCost::default());
}

#[cfg(feature = "sqlite")]
#[tokio::test]
async fn supervised_governance_uses_the_root_fence_and_rejects_an_unrelated_database() {
    use registry::*;
    use std::collections::BTreeMap;
    for same_database in [true, false] {
        let root = tempfile::tempdir().unwrap();
        let checkpoint =
            Arc::new(durable::SqliteStore::open(&root.path().join("root.sqlite")).unwrap());
        let budget = if same_database {
            checkpoint.clone()
        } else {
            Arc::new(durable::SqliteStore::open(&root.path().join("other.sqlite")).unwrap())
        };
        let profile = profile(
            budget.clone(),
            BudgetLimits {
                max_model_calls: Some(1),
                ..Default::default()
            },
            1,
            0,
        );
        let calls = Arc::new(AtomicUsize::new(0));
        let mut registry = ModuleRegistry::default();
        for (id, instance) in [
            ("m", ModuleInstance::Model(script(calls.clone(), None))),
            (
                "p",
                ModuleInstance::Prompt(Arc::new(StaticPrompt("test".into()))),
            ),
            ("g", ModuleInstance::Governance(profile.clone())),
        ] {
            registry
                .register_factory(Arc::new(InstanceFactory::new(id, "1", instance)))
                .unwrap();
            registry
                .define(ModuleDefinition {
                    reference: ModuleRef::new(id, "1"),
                    factory: id.into(),
                    config: json!({}),
                    dependencies: BTreeMap::new(),
                })
                .unwrap();
        }
        registry.require_governance(ModuleRef::new("g", "1"));
        let definition = serde_json::from_value(json!({"name":"supervised-budget","model":{"id":"m","version":"1"},"prompt":{"id":"p","version":"1"}})).unwrap();
        let compiled = compile::compile_agent(definition, &registry).unwrap();
        let outcome = supervisor::RunSupervisor::new((*checkpoint).clone())
            .execute(&compiled, RunInput::new("go"), context())
            .await;
        if same_database {
            assert!(matches!(outcome.unwrap(), RunOutcome::Completed { .. }));
            assert_eq!(calls.load(Ordering::SeqCst), 1);
            assert_eq!(
                budget
                    .inspect(&scope(&profile))
                    .await
                    .unwrap()
                    .unwrap()
                    .used
                    .model_calls,
                1
            );
        } else {
            assert!(matches!(outcome, Err(Error::Composition(_))));
            assert_eq!(calls.load(Ordering::SeqCst), 0);
        }
    }
}
