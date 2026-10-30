#![cfg(feature = "sqlite")]
use nofy_agent_runtime::{
    compile::*, durable::*, governance::*, mailbox::*, registry::*, supervisor::*, *,
};
use nofy_tool_runtime::{Tool, ToolCallContext};
use nofy_tool_types::ToolDescription;
use serde_json::{Value, json};
use std::sync::{
    Arc, Mutex,
    atomic::{AtomicBool, AtomicU64, AtomicUsize, Ordering},
};
use tokio::sync::Notify;

struct Effect(Arc<AtomicUsize>);
struct UnknownEffect {
    count: Arc<AtomicUsize>,
    started: Arc<Notify>,
}
impl Tool for UnknownEffect {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("effect").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        ToolDescription::new("effect", "A dispatched effect without a receipt")
    }
    async fn run(
        &self,
        _: ToolCallContext,
        _: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        self.count.fetch_add(1, Ordering::SeqCst);
        self.started.notify_one();
        std::future::pending().await
    }
}
impl Tool for Effect {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("effect").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        ToolDescription::new("effect", "Count the committed effect")
    }
    async fn run(
        &self,
        _: ToolCallContext,
        _: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        self.0.fetch_add(1, Ordering::SeqCst);
        Ok(json!({"committed":true}))
    }
}
struct Leaf {
    seen: Arc<Mutex<Vec<ModelRequest>>>,
    started: Arc<Notify>,
    release: Arc<Notify>,
    wait: AtomicBool,
}
#[async_trait::async_trait]
impl Model for Leaf {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        let after = request
            .messages
            .iter()
            .any(|m| matches!(m, Message::Tool { .. }));
        self.seen.lock().unwrap().push(request);
        if !after {
            return Ok(ModelResponse {
                tool_calls: vec![ToolCall {
                    id: "effect-call".into(),
                    name: "effect".into(),
                    arguments: json!({}),
                }],
                ..Default::default()
            });
        }
        if self.wait.swap(false, Ordering::SeqCst) {
            self.started.notify_one();
            self.release.notified().await;
        }
        Ok(ModelResponse {
            output: "leaf done".into(),
            ..Default::default()
        })
    }
}
struct ApprovalGate(Arc<AtomicBool>);
#[async_trait::async_trait]
impl Policy for ApprovalGate {
    async fn admit(
        &self,
        call: &ToolCall,
        _: &RunState,
        _: &RunContext,
    ) -> Result<Admission, Error> {
        Ok(if call.name == "effect" && !self.0.load(Ordering::SeqCst) {
            Admission::Pause(json!({"approval":true}))
        } else {
            Admission::Allow
        })
    }
}
struct Parent {
    seen: Arc<AtomicUsize>,
    graph: bool,
    final_only: bool,
}
#[async_trait::async_trait]
impl Model for Parent {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.seen.fetch_add(1, Ordering::SeqCst);
        Ok(
            if self.final_only
                || request
                    .messages
                    .iter()
                    .any(|m| matches!(m, Message::Tool { .. }))
            {
                ModelResponse {
                    output: "parent done".into(),
                    ..Default::default()
                }
            } else {
                ModelResponse {
                    tool_calls: vec![ToolCall {
                        id: "child-call".into(),
                        name: "child".into(),
                        arguments: if self.graph {
                            json!({"input":"task"})
                        } else {
                            json!({"prompt":"task"})
                        },
                    }],
                    ..Default::default()
                }
            },
        )
    }
}
fn reference(id: &str) -> ModuleRef {
    ModuleRef::new(id, "1")
}
fn install(registry: &mut ModuleRegistry, id: &str, instance: ModuleInstance) {
    registry
        .register_factory(Arc::new(InstanceFactory::new(id, "1", instance)))
        .unwrap();
    registry
        .define(ModuleDefinition {
            reference: reference(id),
            factory: id.into(),
            config: json!({}),
            dependencies: Default::default(),
        })
        .unwrap();
}
struct Fixture {
    compiled: Arc<CompiledAgent>,
    effects: Arc<AtomicUsize>,
    parents: Arc<AtomicUsize>,
    requests: Arc<Mutex<Vec<ModelRequest>>>,
    started: Arc<Notify>,
    release: Arc<Notify>,
    approval: Arc<AtomicBool>,
    profile: Arc<GovernanceProfile>,
}
fn fixture(store: &SqliteStore, shape: &str, duration: Option<u64>) -> Fixture {
    let effects = Arc::new(AtomicUsize::new(0));
    let parents = Arc::new(AtomicUsize::new(0));
    let requests = Arc::new(Mutex::new(Vec::new()));
    let started = Arc::new(Notify::new());
    let release = Arc::new(Notify::new());
    let approval = Arc::new(AtomicBool::new(shape != "approval"));
    let mut registry = ModuleRegistry::default();
    if shape == "approval" {
        install(
            &mut registry,
            "approval",
            ModuleInstance::Policy(Arc::new(ApprovalGate(approval.clone()))),
        );
        registry.require_policy(reference("approval"));
    }
    install(
        &mut registry,
        "leaf-model",
        ModuleInstance::Model(Arc::new(Leaf {
            seen: requests.clone(),
            started: started.clone(),
            release: release.clone(),
            wait: AtomicBool::new(true),
        })),
    );
    install(
        &mut registry,
        "prompt",
        ModuleInstance::Prompt(Arc::new(StaticPrompt("system".into()))),
    );
    let mut tools = ToolCatalog::new();
    tools
        .insert(if shape == "uncertain" {
            ToolEntry::typed(UnknownEffect {
                count: effects.clone(),
                started: started.clone(),
            })
        } else {
            ToolEntry::typed(Effect(effects.clone()))
        })
        .unwrap();
    install(&mut registry, "effects", ModuleInstance::ToolPack(tools));
    let profile = Arc::new(
        GovernanceProfile::new(
            Arc::new(
                InstalledBudget::install(
                    Arc::new(store.clone()),
                    BudgetLimits {
                        max_model_calls: Some(20),
                        max_tool_calls: Some(20),
                        max_child_calls: Some(20),
                        max_duration_ms: duration,
                        ..Default::default()
                    },
                    "root-budget",
                    1,
                )
                .unwrap(),
            ),
            BudgetLimits::default(),
            ModelRetryPolicy::default(),
        )
        .unwrap(),
    );
    install(
        &mut registry,
        "budget",
        ModuleInstance::Governance(profile.clone()),
    );
    install(
        &mut registry,
        "parent-model",
        ModuleInstance::Model(Arc::new(Parent {
            seen: parents.clone(),
            graph: matches!(shape, "graph" | "subflow"),
            final_only: shape == "hook",
        })),
    );
    let leaf=compile_agent(serde_json::from_value(json!({"name":"leaf","model":reference("leaf-model"),"prompt":reference("prompt"),"tool_packs":[reference("effects")]})).unwrap(),&registry).unwrap();
    let entry = if shape == "nested" {
        let mut pack = ToolCatalog::new();
        pack.insert(leaf.agent.as_tool("child", "Leaf")).unwrap();
        install(
            &mut registry,
            "middle-tools",
            ModuleInstance::ToolPack(pack),
        );
        let middle=compile_agent(serde_json::from_value(json!({"name":"middle","model":reference("parent-model"),"prompt":reference("prompt"),"tool_packs":[reference("middle-tools")]})).unwrap(),&registry).unwrap();
        Some(middle.agent.as_tool("child", "Middle"))
    } else if matches!(shape, "graph" | "subflow" | "hook") {
        #[cfg(feature = "workflow")]
        {
            use nofy_agent_runtime::workflow::{compile::*, modules::*};
            let body = json!({"reference":reference("body"),"input_schema":true,"output_schema":true,"nodes":[{"id":"work","input":{"from":"literal","value":"task"},"action":{"kind":"agent","agent":reference("leaf")}}],"output":{"from":"node","node":"work","pointer":"/output"}});
            let workflows = if shape == "subflow" {
                vec![
                    body,
                    json!({"reference":reference("main"),"input_schema":true,"output_schema":true,"nodes":[{"id":"inner","input":{"from":"input"},"action":{"kind":"subworkflow","workflow":reference("body")}}],"output":{"from":"node","node":"inner"}}),
                ]
            } else {
                vec![body]
            };
            let mut doc = json!({"entry":reference(if shape=="subflow" {"main"}else{"body"}),"host":{"name":"graph-host"},"agents":[{"reference":reference("leaf"),"definition":{"name":"leaf","model":reference("leaf-model"),"prompt":reference("prompt"),"tool_packs":[reference("effects")]}}],"workflows":workflows});
            if shape == "hook" {
                doc["workflows"][0]["output"] =
                    json!({"from":"literal","value":{"decision":"continue"}});
            }
            let graph = compile_workflow(serde_json::from_value(doc).unwrap(), &registry).unwrap();
            if shape == "hook" {
                registry
                    .register_factory(Arc::new(WorkflowHookFactory(
                        WorkflowLibrary::new(std::collections::BTreeMap::from([(
                            "hook@1".into(),
                            graph,
                        )]))
                        .unwrap(),
                    )))
                    .unwrap();
                registry
                    .register_factory(Arc::new(hooks::HookFactory::new(
                        hooks::EventCatalog::runtime(),
                    )))
                    .unwrap();
                registry
                    .define(ModuleDefinition {
                        reference: reference("handler"),
                        factory: "hook.workflow".into(),
                        config: json!({"workflow":"hook@1"}),
                        dependencies: Default::default(),
                    })
                    .unwrap();
                registry
                    .define(ModuleDefinition {
                        reference: reference("hook"),
                        factory: "hook.subscription".into(),
                        config: json!({"event":"before_model","timeout_ms":60000}),
                        dependencies: std::collections::BTreeMap::from([(
                            "handler".into(),
                            reference("handler"),
                        )]),
                    })
                    .unwrap();
                None
            } else {
                Some(graph.as_tool("child", "Graph"))
            }
        }
        #[cfg(not(feature = "workflow"))]
        {
            panic!("workflow feature required")
        }
    } else {
        Some(leaf.agent.as_tool("child", "Leaf"))
    };
    let mut pack = ToolCatalog::new();
    if let Some(entry) = entry {
        pack.insert(entry).unwrap();
    }
    install(&mut registry, "root-tools", ModuleInstance::ToolPack(pack));
    let mut definition = json!({"name":"root-agent","model":reference("parent-model"),"prompt":reference("prompt"),"tool_packs":[reference("root-tools")],"governance":[reference("budget")]});
    if shape == "hook" {
        definition["hooks"] = json!([reference("hook")]);
    }
    let compiled = compile_agent(serde_json::from_value(definition).unwrap(), &registry).unwrap();
    Fixture {
        compiled: Arc::new(compiled),
        effects,
        parents,
        requests,
        started,
        release,
        approval,
        profile,
    }
}
fn context() -> RunContext {
    RunContext::new("thread", "root")
}
async fn cancel_leaf(store: &SqliteStore, fixture: &Fixture) -> (InputAddress, u64) {
    tokio::time::timeout(
        std::time::Duration::from_secs(10),
        fixture.started.notified(),
    )
    .await
    .unwrap();
    let leaf = store
        .children("root")
        .await
        .unwrap()
        .into_iter()
        .find(|c| c.agent_name == "leaf")
        .unwrap();
    let address = InputAddress {
        root_run_id: "root".into(),
        run_id: leaf.run_id,
        thread_id: leaf.thread_id,
        agent: leaf.agent_name,
    };
    let cursor = store.cancel(&address, "cancel-leaf").await.unwrap();
    (address, cursor)
}
async fn cancelled_fixture(store: &SqliteStore, fixture: &Fixture) -> (InputAddress, u64) {
    let worker_store = store.clone();
    let compiled = fixture.compiled.clone();
    let invocation = context();
    let caller_cancel = invocation.cancel.clone();
    let worker = tokio::spawn(async move {
        RunSupervisor::new(worker_store)
            .execute(&compiled, RunInput::new("start"), invocation)
            .await
    });
    let result = cancel_leaf(store, fixture).await;
    assert!(matches!(
        tokio::time::timeout(std::time::Duration::from_secs(10), worker)
            .await
            .unwrap()
            .unwrap()
            .unwrap(),
        RunOutcome::Cancelled { .. }
    ));
    assert!(!caller_cancel.is_cancelled());
    assert_eq!(
        store
            .children("root")
            .await
            .unwrap()
            .into_iter()
            .find(|c| c.agent_name == "leaf")
            .unwrap()
            .status,
        "cancelled"
    );
    result
}
#[tokio::test]
async fn explicit_child_cancel_resume_preserves_effects_hierarchy_and_total_quota() {
    #[cfg(not(feature = "workflow"))]
    let shapes = vec!["direct", "nested"];
    #[cfg(feature = "workflow")]
    let shapes = vec!["direct", "nested", "graph", "subflow", "hook"];
    for shape in shapes {
        let temp = tempfile::tempdir().unwrap();
        let path = temp.path().join("runtime.db");
        let store = SqliteStore::open(&path).unwrap();
        let fixture = fixture(&store, shape, None);
        let (address, cursor) = cancelled_fixture(&store, &fixture).await;
        let supervisor = RunSupervisor::new(store.clone());
        assert!(matches!(
            supervisor
                .execute(&fixture.compiled, RunInput::resume(), context())
                .await
                .unwrap(),
            RunOutcome::Cancelled { .. }
        ));
        assert_eq!(fixture.requests.lock().unwrap().len(), 2);
        let command = ChildCancelResumeCommand {
            command_id: "resume-leaf".into(),
            address: address.clone(),
            through: cursor,
        };
        let outcome = supervisor
            .control(
                &fixture.compiled,
                RunControlCommand::ResumeChildCancel(command.clone()),
                context(),
            )
            .await;
        assert!(
            matches!(&outcome, Ok(RunOutcome::Completed { .. })),
            "{shape}: {outcome:?}"
        );
        assert_eq!(fixture.effects.load(Ordering::SeqCst), 1, "{shape}");
        assert_eq!(fixture.requests.lock().unwrap().len(), 3, "{shape}");
        let seen = fixture.requests.lock().unwrap().clone();
        assert_eq!(
            serde_json::to_value(&seen[1]).unwrap(),
            serde_json::to_value(&seen[2]).unwrap()
        );
        let summary = store
            .inspect(&BudgetScope {
                root_run_id: "root".into(),
                identity: fixture.profile.identity().into(),
            })
            .await
            .unwrap()
            .unwrap();
        assert_eq!(
            summary.used.model_calls,
            if shape == "nested" {
                7
            } else if shape == "hook" {
                4
            } else {
                5
            },
            "{shape}"
        );
        assert_eq!(
            summary.used.child_calls,
            match shape {
                "nested" | "graph" | "subflow" | "hook" => 2,
                _ => 1,
            },
            "{shape}"
        );
        assert_eq!(summary.active_children, 0, "{shape}");
        supervisor
            .control(
                &fixture.compiled,
                RunControlCommand::ResumeChildCancel(command.clone()),
                context(),
            )
            .await
            .unwrap();
        assert_eq!(fixture.requests.lock().unwrap().len(), 3);
        let mut invalid = command;
        invalid.through += 1;
        assert!(
            supervisor
                .control(
                    &fixture.compiled,
                    RunControlCommand::ResumeChildCancel(invalid),
                    context()
                )
                .await
                .is_err()
        );
        let ack: bool = rusqlite::Connection::open(&path)
            .unwrap()
            .query_row(
                "SELECT acknowledged FROM agent_runtime_cancel WHERE sequence=?1",
                [cursor],
                |r| r.get(0),
            )
            .unwrap();
        assert!(ack);
    }
}

struct ManualClock(AtomicU64);
impl Clock for ManualClock {
    fn now_ms(&self) -> u64 {
        self.0.load(Ordering::SeqCst)
    }
}

#[tokio::test]
async fn an_old_cancel_resume_never_acknowledges_a_newer_cancel() {
    let temp = tempfile::tempdir().unwrap();
    let path = temp.path().join("runtime.db");
    let store = SqliteStore::open(&path).unwrap();
    let fixture = fixture(&store, "direct", None);
    let (address, first) = cancelled_fixture(&store, &fixture).await;
    let second = store.cancel(&address, "new-cancel").await.unwrap();
    assert!(second > first);
    let supervisor = RunSupervisor::new(store.clone());
    let old = ChildCancelResumeCommand {
        command_id: "resume-old".into(),
        address: address.clone(),
        through: first,
    };
    assert!(matches!(
        supervisor
            .control(
                &fixture.compiled,
                RunControlCommand::ResumeChildCancel(old.clone()),
                context()
            )
            .await
            .unwrap(),
        RunOutcome::Cancelled { .. }
    ));
    assert_eq!(fixture.requests.lock().unwrap().len(), 2);
    let sql = rusqlite::Connection::open(&path).unwrap();
    let ack: bool = sql
        .query_row(
            "SELECT acknowledged FROM agent_runtime_cancel WHERE sequence=?1",
            [second],
            |r| r.get(0),
        )
        .unwrap();
    assert!(!ack);
    let new = ChildCancelResumeCommand {
        command_id: "resume-new".into(),
        address,
        through: second,
    };
    assert!(matches!(
        supervisor
            .control(
                &fixture.compiled,
                RunControlCommand::ResumeChildCancel(new),
                context()
            )
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    supervisor
        .control(
            &fixture.compiled,
            RunControlCommand::ResumeChildCancel(old),
            context(),
        )
        .await
        .unwrap();
    assert_eq!(fixture.requests.lock().unwrap().len(), 3);
    assert_eq!(fixture.effects.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn cancel_resume_cannot_replay_an_uncertain_primitive() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let fixture = fixture(&store, "uncertain", None);
    let (address, cursor) = cancelled_fixture(&store, &fixture).await;
    let command = ChildCancelResumeCommand {
        command_id: "resume-uncertain".into(),
        address,
        through: cursor,
    };
    let outcome = RunSupervisor::new(store.clone())
        .control(
            &fixture.compiled,
            RunControlCommand::ResumeChildCancel(command),
            context(),
        )
        .await
        .unwrap();
    assert!(matches!(outcome, RunOutcome::Paused { .. }), "{outcome:?}");
    assert_eq!(fixture.effects.load(Ordering::SeqCst), 1);
    assert_eq!(fixture.requests.lock().unwrap().len(), 1);
}

#[tokio::test]
async fn cancelled_child_without_its_first_checkpoint_initializes_once_after_confirmation() {
    let temp = tempfile::tempdir().unwrap();
    let path = temp.path().join("runtime.db");
    let store = SqliteStore::open(&path).unwrap();
    let fixture = fixture(&store, "direct", None);
    let sql = rusqlite::Connection::open(&path).unwrap();
    sql.execute_batch("CREATE TRIGGER cancel_first_child AFTER INSERT ON agent_runtime_children WHEN json_extract(NEW.payload,'$.agent_name')='leaf' BEGIN INSERT INTO agent_runtime_cancel(address,command_id,acknowledged) VALUES(json_object('root_run_id',json_extract(NEW.payload,'$.root_run_id'),'run_id',json_extract(NEW.payload,'$.run_id'),'thread_id',json_extract(NEW.payload,'$.thread_id'),'agent',json_extract(NEW.payload,'$.agent_name')),'cancel-before-checkpoint',0); END;").unwrap();
    let supervisor = RunSupervisor::new(store.clone());
    assert!(matches!(
        supervisor
            .execute(&fixture.compiled, RunInput::new("start"), context())
            .await
            .unwrap(),
        RunOutcome::Cancelled { .. }
    ));
    let child = store
        .children("root")
        .await
        .unwrap()
        .into_iter()
        .find(|c| c.agent_name == "leaf")
        .unwrap();
    assert!(
        store
            .load(child.checkpoint_key.as_deref().unwrap())
            .await
            .unwrap()
            .is_none()
    );
    assert_eq!(fixture.effects.load(Ordering::SeqCst), 0);
    assert!(fixture.requests.lock().unwrap().is_empty());
    let cursor = sql
        .query_row(
            "SELECT sequence FROM agent_runtime_cancel WHERE command_id='cancel-before-checkpoint'",
            [],
            |r| r.get(0),
        )
        .unwrap();
    let address = InputAddress {
        root_run_id: "root".into(),
        run_id: child.run_id,
        thread_id: child.thread_id,
        agent: child.agent_name,
    };
    fixture.release.notify_one();
    let outcome = supervisor
        .control(
            &fixture.compiled,
            RunControlCommand::ResumeChildCancel(ChildCancelResumeCommand {
                command_id: "start-cancelled-child".into(),
                address,
                through: cursor,
            }),
            context(),
        )
        .await;
    assert!(
        matches!(&outcome, Ok(RunOutcome::Completed { .. })),
        "{outcome:?}"
    );
    assert_eq!(fixture.effects.load(Ordering::SeqCst), 1);
    assert_eq!(fixture.requests.lock().unwrap().len(), 2);
}
#[tokio::test]
async fn child_cancel_ack_survives_expired_root_deadline_without_model_or_tool_io() {
    let temp = tempfile::tempdir().unwrap();
    let path = temp.path().join("runtime.db");
    let clock = Arc::new(ManualClock(AtomicU64::new(1000)));
    let store = SqliteStore::open_with_clock(&path, clock.clone()).unwrap();
    let fixture = fixture(&store, "direct", Some(10000));
    let (address, cursor) = cancelled_fixture(&store, &fixture).await;
    clock.0.store(12000, Ordering::SeqCst);
    let command = ChildCancelResumeCommand {
        command_id: "expired-resume".into(),
        address,
        through: cursor,
    };
    let outcome = RunSupervisor::new(store.clone())
        .control(
            &fixture.compiled,
            RunControlCommand::ResumeChildCancel(command),
            context(),
        )
        .await
        .unwrap();
    assert!(matches!(outcome, RunOutcome::BudgetExceeded { .. }));
    assert_eq!(fixture.effects.load(Ordering::SeqCst), 1);
    assert_eq!(fixture.requests.lock().unwrap().len(), 2);
    assert_eq!(fixture.parents.load(Ordering::SeqCst), 1);
    let ack: bool = rusqlite::Connection::open(&path)
        .unwrap()
        .query_row(
            "SELECT acknowledged FROM agent_runtime_cancel WHERE sequence=?1",
            [cursor],
            |r| r.get(0),
        )
        .unwrap();
    assert!(ack);
    let summary = store
        .inspect(&BudgetScope {
            root_run_id: "root".into(),
            identity: fixture.profile.identity().into(),
        })
        .await
        .unwrap()
        .unwrap();
    assert_eq!(summary.deadline_ms, Some(11000));
    assert_eq!(summary.used.model_calls, 3);
}

#[tokio::test]
async fn invalid_recipient_cursor_or_command_body_preserves_the_previous_run_receipt() {
    let temp = tempfile::tempdir().unwrap();
    let path = temp.path().join("runtime.db");
    let store = SqliteStore::open(&path).unwrap();
    let fixture = fixture(&store, "direct", None);
    let (address, cursor) = cancelled_fixture(&store, &fixture).await;
    let supervisor = RunSupervisor::new(store.clone());
    let command = ChildCancelResumeCommand {
        command_id: "resume-valid".into(),
        address,
        through: cursor,
    };
    let before = serde_json::to_value(store.record("root").await.unwrap()).unwrap();
    for variant in 0..7 {
        let mut invalid = command.clone();
        invalid.command_id = format!("invalid-{variant}");
        match variant {
            0 => invalid.address.root_run_id = "foreign".into(),
            1 => invalid.address.run_id = "root".into(),
            2 => invalid.address.agent = "wrong".into(),
            3 => invalid.address.thread_id = "wrong".into(),
            4 => invalid.through = 0,
            5 => invalid.through += 100,
            _ => invalid.command_id.clear(),
        }
        assert!(
            supervisor
                .control(
                    &fixture.compiled,
                    RunControlCommand::ResumeChildCancel(invalid),
                    context()
                )
                .await
                .is_err()
        );
        assert_eq!(
            serde_json::to_value(store.record("root").await.unwrap()).unwrap(),
            before
        );
    }
    assert_eq!(fixture.effects.load(Ordering::SeqCst), 1);
    assert_eq!(fixture.requests.lock().unwrap().len(), 2);
    supervisor
        .control(
            &fixture.compiled,
            RunControlCommand::ResumeChildCancel(command.clone()),
            context(),
        )
        .await
        .unwrap();
    let complete = serde_json::to_value(store.record("root").await.unwrap()).unwrap();
    let conflict = ModelRetryCommand {
        command_id: command.command_id,
        ticket: ModelRetryTicket {
            thread_id: "thread".into(),
            run_id: "root".into(),
            operation_id: "forged".into(),
            operation_scope: None,
            request_fingerprint: "forged".into(),
            generation: 0,
        },
    };
    assert!(
        supervisor
            .control(
                &fixture.compiled,
                RunControlCommand::RetryModel(conflict),
                context()
            )
            .await
            .is_err()
    );
    assert_eq!(
        serde_json::to_value(store.record("root").await.unwrap()).unwrap(),
        complete
    );
    assert_eq!(fixture.requests.lock().unwrap().len(), 3);
}

#[tokio::test]
async fn lost_cancel_ack_resumes_accepted_authority_after_database_reopen() {
    let temp = tempfile::tempdir().unwrap();
    let path = temp.path().join("runtime.db");
    let store = SqliteStore::open(&path).unwrap();
    let fixture = fixture(&store, "direct", None);
    let (address, cursor) = cancelled_fixture(&store, &fixture).await;
    let sql = rusqlite::Connection::open(&path).unwrap();
    sql.execute_batch("CREATE TRIGGER lose_cancel_ack BEFORE UPDATE ON agent_runtime_cancel WHEN NEW.acknowledged=1 BEGIN SELECT RAISE(ABORT,'lost cancel ack'); END;").unwrap();
    let command = ChildCancelResumeCommand {
        command_id: "durable-cancel-confirmation".into(),
        address,
        through: cursor,
    };
    assert!(matches!(
        RunSupervisor::new(store.clone())
            .control(
                &fixture.compiled,
                RunControlCommand::ResumeChildCancel(command),
                context()
            )
            .await,
        Err(Error::Checkpoint(_))
    ));
    assert_eq!(fixture.requests.lock().unwrap().len(), 2);
    assert_eq!(fixture.effects.load(Ordering::SeqCst), 1);
    sql.execute_batch("DROP TRIGGER lose_cancel_ack").unwrap();
    let reopened = RunSupervisor::new(SqliteStore::open(&path).unwrap());
    assert!(matches!(
        reopened
            .execute(&fixture.compiled, RunInput::resume(), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(fixture.requests.lock().unwrap().len(), 3);
    assert_eq!(fixture.effects.load(Ordering::SeqCst), 1);
}

#[tokio::test]
async fn pending_cancel_of_an_already_paused_child_can_be_confirmed_without_a_spurious_run() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let fixture = fixture(&store, "approval", None);
    let supervisor = RunSupervisor::new(store.clone());
    assert!(matches!(
        supervisor
            .execute(&fixture.compiled, RunInput::new("start"), context())
            .await
            .unwrap(),
        RunOutcome::Paused { .. }
    ));
    let target = store
        .children("root")
        .await
        .unwrap()
        .into_iter()
        .find(|c| c.agent_name == "leaf")
        .unwrap();
    assert_eq!(target.status, "paused");
    let address = InputAddress {
        root_run_id: "root".into(),
        run_id: target.run_id,
        thread_id: target.thread_id,
        agent: target.agent_name,
    };
    let cursor = store.cancel(&address, "cancel-while-paused").await.unwrap();
    fixture.approval.store(true, Ordering::SeqCst);
    fixture.release.notify_one();
    let outcome = supervisor
        .control(
            &fixture.compiled,
            RunControlCommand::ResumeChildCancel(ChildCancelResumeCommand {
                command_id: "continue-paused-child".into(),
                address,
                through: cursor,
            }),
            context(),
        )
        .await
        .unwrap();
    assert!(matches!(outcome, RunOutcome::Completed { .. }));
    assert_eq!(fixture.effects.load(Ordering::SeqCst), 1);
    assert_eq!(fixture.requests.lock().unwrap().len(), 2);
}

#[tokio::test]
async fn child_cancel_process_worker() {
    let Ok(directory) = std::env::var("NOFY_CHILD_CANCEL_WORKER") else {
        return;
    };
    let phase = std::env::var("NOFY_CHILD_CANCEL_PHASE").unwrap();
    let directory = std::path::Path::new(&directory);
    let path = directory.join("runtime.db");
    let store = SqliteStore::open(&path).unwrap();
    let fixture = fixture(&store, "direct", None);
    let supervisor = RunSupervisor::new(store.clone());
    match phase.as_str() {
        "cancel" => {
            let (address, cursor) = cancelled_fixture(&store, &fixture).await;
            let command = ChildCancelResumeCommand {
                command_id: "resume-after-process-exit".into(),
                address,
                through: cursor,
            };
            std::fs::write(
                directory.join("command.json"),
                serde_json::to_vec(&command).unwrap(),
            )
            .unwrap();
            std::fs::write(
                directory.join("request.json"),
                serde_json::to_vec(&fixture.requests.lock().unwrap()[1]).unwrap(),
            )
            .unwrap();
        }
        "authorize" => {
            let sql = rusqlite::Connection::open(&path).unwrap();
            sql.execute_batch("CREATE TRIGGER lose_cancel_ack BEFORE UPDATE ON agent_runtime_cancel WHEN NEW.acknowledged=1 BEGIN SELECT RAISE(ABORT,'lost cancel ack'); END;").unwrap();
            let command =
                serde_json::from_slice(&std::fs::read(directory.join("command.json")).unwrap())
                    .unwrap();
            assert!(matches!(
                supervisor
                    .control(
                        &fixture.compiled,
                        RunControlCommand::ResumeChildCancel(command),
                        context()
                    )
                    .await,
                Err(Error::Checkpoint(_))
            ));
            sql.execute_batch("DROP TRIGGER lose_cancel_ack").unwrap();
        }
        "resume" => {
            fixture.release.notify_one();
            assert!(matches!(
                supervisor
                    .execute(&fixture.compiled, RunInput::resume(), context())
                    .await
                    .unwrap(),
                RunOutcome::Completed { .. }
            ));
            let previous: Value =
                serde_json::from_slice(&std::fs::read(directory.join("request.json")).unwrap())
                    .unwrap();
            assert_eq!(
                serde_json::to_value(&fixture.requests.lock().unwrap()[0]).unwrap(),
                previous
            );
            let summary = store
                .inspect(&BudgetScope {
                    root_run_id: "root".into(),
                    identity: fixture.profile.identity().into(),
                })
                .await
                .unwrap()
                .unwrap();
            assert_eq!(summary.active_children, 0);
            assert_eq!(summary.used.model_calls, 5);
            assert_eq!(summary.used.child_calls, 1);
        }
        "cached" => {
            let command =
                serde_json::from_slice(&std::fs::read(directory.join("command.json")).unwrap())
                    .unwrap();
            assert!(matches!(
                supervisor
                    .control(
                        &fixture.compiled,
                        RunControlCommand::ResumeChildCancel(command),
                        context()
                    )
                    .await
                    .unwrap(),
                RunOutcome::Completed { .. }
            ));
        }
        _ => unreachable!(),
    }
    std::fs::write(directory.join(format!("{phase}.json")),serde_json::to_vec(&json!({"effects":fixture.effects.load(Ordering::SeqCst),"models":fixture.requests.lock().unwrap().len(),"parents":fixture.parents.load(Ordering::SeqCst)})).unwrap()).unwrap();
    if matches!(phase.as_str(), "cancel" | "authorize") {
        std::process::exit(97)
    }
}
#[test]
fn cancel_confirmation_survives_real_process_exit_without_repeating_effects_or_resetting_quota() {
    let temp = tempfile::tempdir().unwrap();
    for phase in ["cancel", "authorize", "resume", "cached"] {
        let output = std::process::Command::new(std::env::current_exe().unwrap())
            .args(["--exact", "child_cancel_process_worker", "--nocapture"])
            .env("NOFY_CHILD_CANCEL_WORKER", temp.path())
            .env("NOFY_CHILD_CANCEL_PHASE", phase)
            .output()
            .unwrap();
        assert_eq!(
            output.status.code(),
            Some(if matches!(phase, "cancel" | "authorize") {
                97
            } else {
                0
            }),
            "{phase}: {}{}",
            String::from_utf8_lossy(&output.stdout),
            String::from_utf8_lossy(&output.stderr)
        );
        let counts: Value = serde_json::from_slice(
            &std::fs::read(temp.path().join(format!("{phase}.json"))).unwrap(),
        )
        .unwrap();
        assert_eq!(
            counts,
            match phase {
                "cancel" => json!({"effects":1,"models":2,"parents":1}),
                "resume" => json!({"effects":0,"models":1,"parents":1}),
                _ => json!({"effects":0,"models":0,"parents":0}),
            }
        );
    }
}
