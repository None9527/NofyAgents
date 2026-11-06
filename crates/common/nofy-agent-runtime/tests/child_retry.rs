#![cfg(feature = "sqlite")]
use nofy_agent_runtime::{
    compile::*, durable::*, governance::*, hooks::*, registry::*, supervisor::RunSupervisor, *,
};
use nofy_tool_runtime::{Tool, ToolCallContext};
use nofy_tool_types::ToolDescription;
use serde_json::{Value, json};
use std::sync::{
    Arc, Mutex,
    atomic::{AtomicUsize, Ordering},
};
struct Effect(Arc<AtomicUsize>);
impl Tool for Effect {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("effect").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        ToolDescription::new("effect", "Once")
    }
    async fn run(
        &self,
        _: ToolCallContext,
        _: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        self.0.fetch_add(1, Ordering::SeqCst);
        Ok(json!({"effect":"committed"}))
    }
}
struct Parent(Arc<AtomicUsize>);
#[async_trait::async_trait]
impl Model for Parent {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.0.fetch_add(1, Ordering::SeqCst);
        Ok(
            if request
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
                        arguments: json!({"prompt":"task"}),
                    }],
                    ..Default::default()
                }
            },
        )
    }
}
struct Leaf {
    requests: Arc<Mutex<Vec<ModelRequest>>>,
    failures: AtomicUsize,
}
#[async_trait::async_trait]
impl Model for Leaf {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        let done = request
            .messages
            .iter()
            .any(|m| matches!(m, Message::Tool { .. }));
        self.requests.lock().unwrap().push(request);
        if !done {
            return Ok(ModelResponse {
                tool_calls: vec![ToolCall {
                    id: "effect-call".into(),
                    name: "effect".into(),
                    arguments: json!({}),
                }],
                ..Default::default()
            });
        }
        if self
            .failures
            .fetch_update(Ordering::SeqCst, Ordering::SeqCst, |n| n.checked_sub(1))
            .is_ok()
        {
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
        Ok(ModelResponse {
            output: "leaf done".into(),
            ..Default::default()
        })
    }
}
fn agent(name: &str, model: Arc<dyn Model>, tool: ToolEntry) -> Agent {
    let mut c = Components::default();
    c.models.insert("model".into(), model);
    c.prompts
        .insert("prompt".into(), Arc::new(StaticPrompt("system".into())));
    let mut tools = ToolCatalog::new();
    tools.insert(tool).unwrap();
    c.tool_packs.insert("tools".into(), tools);
    AgentBuilder::new(name)
        .model("model")
        .prompt("prompt")
        .tools("tools")
        .compile(&c)
        .unwrap()
}
fn context() -> RunContext {
    RunContext::new("thread", "root")
}
type SetupParts = (
    CompiledAgent,
    Arc<AtomicUsize>,
    Arc<Mutex<Vec<ModelRequest>>>,
    Arc<AtomicUsize>,
    Arc<GovernanceProfile>,
);
fn setup(
    store: &SqliteStore,
    nested: bool,
    failures: usize,
    model_limit: u64,
    events: Option<Arc<Mutex<Vec<HookEvent>>>>,
) -> SetupParts {
    let effects = Arc::new(AtomicUsize::new(0));
    let requests = Arc::new(Mutex::new(Vec::new()));
    let parents = Arc::new(AtomicUsize::new(0));
    let mut child = agent(
        "leaf",
        Arc::new(Leaf {
            requests: requests.clone(),
            failures: AtomicUsize::new(failures),
        }),
        ToolEntry::typed(Effect(effects.clone())),
    );
    if nested {
        child = agent(
            "middle",
            Arc::new(Parent(parents.clone())),
            child.as_tool("child", "Leaf"),
        );
    }
    let mut pack = ToolCatalog::new();
    pack.insert(child.as_tool("child", "Child")).unwrap();
    let profile = Arc::new(
        GovernanceProfile::new(
            Arc::new(
                InstalledBudget::install(
                    Arc::new(store.clone()),
                    BudgetLimits {
                        max_model_calls: Some(model_limit),
                        max_child_calls: Some(20),
                        max_tool_calls: Some(20),
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
    let mut registry = ModuleRegistry::default();
    for (name, instance) in [
        (
            "model",
            ModuleInstance::Model(Arc::new(Parent(parents.clone()))),
        ),
        (
            "prompt",
            ModuleInstance::Prompt(Arc::new(StaticPrompt("system".into()))),
        ),
        ("tools", ModuleInstance::ToolPack(pack)),
        ("budget", ModuleInstance::Governance(profile.clone())),
    ] {
        registry
            .register_factory(Arc::new(InstanceFactory::new(name, "1", instance)))
            .unwrap();
        registry
            .define(ModuleDefinition {
                reference: ModuleRef::new(name, "1"),
                factory: name.into(),
                config: json!({}),
                dependencies: Default::default(),
            })
            .unwrap();
    }
    let mut definition = json!({"name":"root-agent","model":{"id":"model","version":"1"},"prompt":{"id":"prompt","version":"1"},"tool_packs":[{"id":"tools","version":"1"}],"governance":[{"id":"budget","version":"1"}]});
    if let Some(events) = events {
        definition["hooks"] = json!([]);
        for name in ["turn_error", "subagent_finished"] {
            let registration = HookRegistration::new(
                format!("{name}-v1"),
                EventCatalog::runtime().get(name).unwrap().clone(),
                HookRule {
                    event: name.into(),
                    priority: 0,
                    timeout_ms: 5000,
                    failure: FailurePolicy::Closed,
                    matches: None,
                },
                Arc::new(Capture(events.clone())),
            )
            .unwrap();
            registry
                .register_factory(Arc::new(InstanceFactory::new(
                    name,
                    "1",
                    ModuleInstance::Hook(Arc::new(registration)),
                )))
                .unwrap();
            registry
                .define(ModuleDefinition {
                    reference: ModuleRef::new(name, "1"),
                    factory: name.into(),
                    config: json!({}),
                    dependencies: Default::default(),
                })
                .unwrap();
            definition["hooks"]
                .as_array_mut()
                .unwrap()
                .push(json!({"id":name,"version":"1"}));
        }
    }
    let compiled = compile_agent(serde_json::from_value(definition).unwrap(), &registry).unwrap();
    (compiled, effects, requests, parents, profile)
}
#[tokio::test]
async fn explicit_descendant_retry_reopens_failed_groups_preserves_transcript_and_total_budget() {
    for nested in [false, true] {
        let temp = tempfile::tempdir().unwrap();
        let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
        let (compiled, effects, requests, parents, profile) = setup(&store, nested, 1, 20, None);
        let supervisor = RunSupervisor::new(store.clone());
        assert!(
            supervisor
                .execute(&compiled, RunInput::new("start"), context())
                .await
                .is_err()
        );
        assert_eq!(effects.load(Ordering::SeqCst), 1);
        let before_parents = parents.load(Ordering::SeqCst);
        assert!(
            supervisor
                .execute(&compiled, RunInput::resume(), context())
                .await
                .is_err()
        );
        assert_eq!(requests.lock().unwrap().len(), 2);
        assert_eq!(parents.load(Ordering::SeqCst), before_parents);
        let child = store
            .children("root")
            .await
            .unwrap()
            .into_iter()
            .find(|c| c.agent_name == "leaf")
            .unwrap();
        let ticket = supervisor
            .child_model_retry_ticket("root", &child.run_id)
            .await
            .unwrap()
            .unwrap();
        let command = ModelRetryCommand {
            command_id: "retry-leaf".into(),
            ticket: ticket.clone(),
        };
        assert!(matches!(
            supervisor
                .execute(&compiled, RunInput::retry_model(command.clone()), context())
                .await
                .unwrap(),
            RunOutcome::Completed { .. }
        ));
        assert_eq!(effects.load(Ordering::SeqCst), 1);
        assert_eq!(requests.lock().unwrap().len(), 3);
        let seen = requests.lock().unwrap().clone();
        assert_eq!(
            serde_json::to_value(&seen[1]).unwrap(),
            serde_json::to_value(&seen[2]).unwrap()
        );
        let completed_parents = parents.load(Ordering::SeqCst);
        supervisor
            .execute(&compiled, RunInput::retry_model(command.clone()), context())
            .await
            .unwrap();
        assert_eq!(parents.load(Ordering::SeqCst), completed_parents);
        assert_eq!(requests.lock().unwrap().len(), 3);
        let summary = store
            .inspect(&BudgetScope {
                root_run_id: "root".into(),
                identity: profile.identity().into(),
            })
            .await
            .unwrap()
            .unwrap();
        assert_eq!(summary.used.model_calls, if nested { 7 } else { 5 });
        assert_eq!(summary.used.child_calls, if nested { 4 } else { 2 });
        assert_eq!(summary.used.tool_calls, if nested { 3 } else { 2 });
        assert_eq!(summary.active_children, 0);
        let mut changed = command;
        changed.ticket.request_fingerprint = "different".into();
        assert!(
            supervisor
                .execute(&compiled, RunInput::retry_model(changed), context())
                .await
                .is_err()
        );
        assert!(
            supervisor
                .execute(
                    &compiled,
                    RunInput::retry_model(ModelRetryCommand {
                        command_id: "stale".into(),
                        ticket
                    }),
                    context()
                )
                .await
                .is_err()
        );
        assert_eq!(effects.load(Ordering::SeqCst), 1);
    }
}
#[tokio::test]
async fn child_retry_cannot_reset_root_model_quota() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let (compiled, effects, requests, _, _) = setup(&store, false, 1, 3, None);
    let supervisor = RunSupervisor::new(store.clone());
    assert!(
        supervisor
            .execute(&compiled, RunInput::new("start"), context())
            .await
            .is_err()
    );
    let child = store
        .children("root")
        .await
        .unwrap()
        .into_iter()
        .find(|c| c.agent_name == "leaf")
        .unwrap();
    let ticket = supervisor
        .child_model_retry_ticket("root", &child.run_id)
        .await
        .unwrap()
        .unwrap();
    assert!(matches!(
        supervisor
            .execute(
                &compiled,
                RunInput::retry_model(ModelRetryCommand {
                    command_id: "quota".into(),
                    ticket
                }),
                context()
            )
            .await
            .unwrap(),
        RunOutcome::BudgetExceeded { .. }
    ));
    assert_eq!(requests.lock().unwrap().len(), 2);
    assert_eq!(effects.load(Ordering::SeqCst), 1);
}

struct Capture(Arc<Mutex<Vec<HookEvent>>>);
#[async_trait::async_trait]
impl HookHandler for Capture {
    async fn handle(&self, event: &HookEvent, _: &RunContext) -> Result<HookDecision, Error> {
        self.0.lock().unwrap().push(event.clone());
        Ok(HookDecision::Continue)
    }
}
async fn leaf_command(
    supervisor: &RunSupervisor,
    store: &SqliteStore,
    id: &str,
) -> ModelRetryCommand {
    let leaf = store
        .children("root")
        .await
        .unwrap()
        .into_iter()
        .find(|c| c.agent_name == "leaf")
        .unwrap();
    ModelRetryCommand {
        command_id: id.into(),
        ticket: supervisor
            .child_model_retry_ticket("root", &leaf.run_id)
            .await
            .unwrap()
            .unwrap(),
    }
}
#[tokio::test]
async fn repeated_failures_have_distinct_control_hooks_and_keep_the_same_pending_request() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let events = Arc::new(Mutex::new(Vec::new()));
    let (compiled, effects, requests, _, profile) =
        setup(&store, true, 2, 20, Some(events.clone()));
    let supervisor = RunSupervisor::new(store.clone());
    assert!(
        supervisor
            .execute(&compiled, RunInput::new("start"), context())
            .await
            .is_err()
    );
    let first = leaf_command(&supervisor, &store, "retry-1").await;
    assert!(
        supervisor
            .execute(&compiled, RunInput::retry_model(first.clone()), context())
            .await
            .is_err()
    );
    let second = leaf_command(&supervisor, &store, "retry-2").await;
    assert_eq!(second.ticket.generation, first.ticket.generation + 1);
    // An accepted old command is an idempotent replay, never another generation.
    assert!(
        supervisor
            .execute(&compiled, RunInput::retry_model(first), context())
            .await
            .is_err()
    );
    assert_eq!(requests.lock().unwrap().len(), 3);
    assert!(matches!(
        supervisor
            .execute(&compiled, RunInput::retry_model(second), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    let seen = requests.lock().unwrap().clone();
    assert_eq!(seen.len(), 4);
    assert_eq!(
        serde_json::to_value(&seen[1]).unwrap(),
        serde_json::to_value(&seen[2]).unwrap()
    );
    assert_eq!(
        serde_json::to_value(&seen[2]).unwrap(),
        serde_json::to_value(&seen[3]).unwrap()
    );
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    let statuses = {
        let events = events.lock().unwrap();
        assert_eq!(events.iter().filter(|e| e.name == "turn_error").count(), 2);
        events
            .iter()
            .filter(|e| e.name == "subagent_finished")
            .map(|e| e.payload["status"].as_str().unwrap().to_string())
            .collect::<Vec<_>>()
    };
    assert_eq!(
        statuses,
        vec![
            "failed",
            "failed",
            "failed",
            "failed",
            "completed",
            "completed"
        ]
    );
    let summary = store
        .inspect(&BudgetScope {
            root_run_id: "root".into(),
            identity: profile.identity().into(),
        })
        .await
        .unwrap()
        .unwrap();
    assert_eq!(summary.used.model_calls, 8);
    assert_eq!(summary.used.child_calls, 6);
    assert_eq!(summary.active_children, 0);
}
#[tokio::test]
async fn missing_settled_failure_proof_requires_recovery_before_retry_and_never_completes_parent() {
    let temp = tempfile::tempdir().unwrap();
    let path = temp.path().join("runtime.db");
    let store = SqliteStore::open(&path).unwrap();
    let sql = rusqlite::Connection::open(&path).unwrap();
    sql.execute_batch("CREATE TRIGGER lose_failure_proof BEFORE INSERT ON agent_runtime_checkpoints WHEN NEW.key LIKE '[\"child-controls-v1\",%' BEGIN SELECT RAISE(ABORT,'lost failure proof'); END;").unwrap();
    let (compiled, effects, requests, parents, _) = setup(&store, true, 1, 20, None);
    let supervisor = RunSupervisor::new(store.clone());
    assert!(matches!(
        supervisor
            .execute(&compiled, RunInput::new("start"), context())
            .await,
        Err(Error::Checkpoint(_))
    ));
    let command = leaf_command(&supervisor, &store, "after-proof").await;
    let before = store.record("root").await.unwrap().unwrap();
    assert!(
        supervisor
            .execute(&compiled, RunInput::retry_model(command.clone()), context())
            .await
            .is_err()
    );
    assert_eq!(
        serde_json::to_value(store.record("root").await.unwrap()).unwrap(),
        serde_json::to_value(Some(before)).unwrap()
    );
    assert_eq!(parents.load(Ordering::SeqCst), 2);
    assert_eq!(requests.lock().unwrap().len(), 2);
    sql.execute_batch("DROP TRIGGER lose_failure_proof")
        .unwrap();
    // Resume settles the already known result and old admission groups first.
    assert!(
        supervisor
            .execute(&compiled, RunInput::resume(), context())
            .await
            .is_err()
    );
    assert_eq!(requests.lock().unwrap().len(), 2);
    assert!(matches!(
        supervisor
            .execute(&compiled, RunInput::retry_model(command), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    assert_eq!(requests.lock().unwrap().len(), 3);
}
#[tokio::test]
async fn authorized_command_survives_lost_child_model_generation_commit_and_database_reopen() {
    let temp = tempfile::tempdir().unwrap();
    let path = temp.path().join("runtime.db");
    let store = SqliteStore::open(&path).unwrap();
    let (compiled, effects, requests, _, _) = setup(&store, true, 1, 20, None);
    let supervisor = RunSupervisor::new(store.clone());
    assert!(
        supervisor
            .execute(&compiled, RunInput::new("start"), context())
            .await
            .is_err()
    );
    let command = leaf_command(&supervisor, &store, "durable-authorization").await;
    let sql = rusqlite::Connection::open(&path).unwrap();
    sql.execute_batch("CREATE TRIGGER lose_generation BEFORE UPDATE ON agent_runtime_checkpoints WHEN NEW.key LIKE '[\"model-recovery-v1\",%' AND json_extract(NEW.payload,'$.state.data.sequence')=1 BEGIN SELECT RAISE(ABORT,'lost child model generation'); END;").unwrap();
    assert!(matches!(
        supervisor
            .execute(&compiled, RunInput::retry_model(command), context())
            .await,
        Err(Error::Checkpoint(_))
    ));
    assert_eq!(requests.lock().unwrap().len(), 2);
    sql.execute_batch("DROP TRIGGER lose_generation").unwrap();
    drop(supervisor);
    drop(store);
    let reopened = RunSupervisor::new(SqliteStore::open(&path).unwrap());
    assert!(matches!(
        reopened
            .execute(&compiled, RunInput::resume(), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    assert_eq!(requests.lock().unwrap().len(), 3);
}

#[tokio::test]
async fn forged_or_unrelated_tickets_preserve_run_state_and_do_not_dispatch() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let (compiled, effects, requests, _, _) = setup(&store, false, 1, 20, None);
    let supervisor = RunSupervisor::new(store.clone());
    assert!(
        supervisor
            .execute(&compiled, RunInput::new("start"), context())
            .await
            .is_err()
    );
    let valid = leaf_command(&supervisor, &store, "valid").await;
    let before = serde_json::to_value(store.record("root").await.unwrap()).unwrap();
    for variant in 0..4 {
        let mut command = valid.clone();
        command.command_id = format!("invalid-{variant}");
        match variant {
            0 => command.ticket.run_id = "another-root-child".into(),
            1 => command.ticket.thread_id = "another-thread".into(),
            2 => command.ticket.request_fingerprint = "forged".into(),
            _ => command.ticket.generation += 1,
        }
        assert!(
            supervisor
                .execute(&compiled, RunInput::retry_model(command), context())
                .await
                .is_err()
        );
        assert_eq!(
            serde_json::to_value(store.record("root").await.unwrap()).unwrap(),
            before
        );
    }
    assert_eq!(effects.load(Ordering::SeqCst), 1);
    assert_eq!(requests.lock().unwrap().len(), 2);
    assert!(matches!(
        supervisor
            .execute(&compiled, RunInput::retry_model(valid), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
}

#[tokio::test]
async fn child_retry_process_worker() {
    let Ok(directory) = std::env::var("NOFY_CHILD_RETRY_WORKER") else {
        return;
    };
    let phase = std::env::var("NOFY_CHILD_RETRY_PHASE").unwrap();
    let directory = std::path::Path::new(&directory);
    let path = directory.join("runtime.db");
    let store = SqliteStore::open(&path).unwrap();
    let (compiled, effects, requests, _, _) =
        setup(&store, true, usize::from(phase == "fail"), 20, None);
    let supervisor = RunSupervisor::new(store.clone());
    match phase.as_str() {
        "fail" => {
            assert!(
                supervisor
                    .execute(&compiled, RunInput::new("start"), context())
                    .await
                    .is_err()
            );
            std::fs::write(
                directory.join("command.json"),
                serde_json::to_vec(&leaf_command(&supervisor, &store, "restart-retry").await)
                    .unwrap(),
            )
            .unwrap();
        }
        "authorize" => {
            let sql = rusqlite::Connection::open(&path).unwrap();
            sql.execute_batch("CREATE TRIGGER lose_generation BEFORE UPDATE ON agent_runtime_checkpoints WHEN NEW.key LIKE '[\"model-recovery-v1\",%' AND json_extract(NEW.payload,'$.state.data.sequence')=1 BEGIN SELECT RAISE(ABORT,'lost child model generation'); END;").unwrap();
            let command =
                serde_json::from_slice(&std::fs::read(directory.join("command.json")).unwrap())
                    .unwrap();
            assert!(matches!(
                supervisor
                    .execute(&compiled, RunInput::retry_model(command), context())
                    .await,
                Err(Error::Checkpoint(_))
            ));
            sql.execute_batch("DROP TRIGGER lose_generation").unwrap();
        }
        "resume" | "cached" => {
            assert!(matches!(
                supervisor
                    .execute(&compiled, RunInput::resume(), context())
                    .await
                    .unwrap(),
                RunOutcome::Completed { .. }
            ));
        }
        _ => unreachable!(),
    }
    std::fs::write(directory.join(format!("{phase}.json")), serde_json::to_vec(&json!({"effects":effects.load(Ordering::SeqCst),"requests":requests.lock().unwrap().len()})).unwrap()).unwrap();
    if matches!(phase.as_str(), "fail" | "authorize") {
        std::process::exit(97);
    }
}

#[test]
fn retry_authority_and_known_child_results_survive_real_process_exit() {
    let temp = tempfile::tempdir().unwrap();
    for phase in ["fail", "authorize", "resume", "cached"] {
        let output = std::process::Command::new(std::env::current_exe().unwrap())
            .args(["--exact", "child_retry_process_worker", "--nocapture"])
            .env("NOFY_CHILD_RETRY_WORKER", temp.path())
            .env("NOFY_CHILD_RETRY_PHASE", phase)
            .output()
            .unwrap();
        assert_eq!(
            output.status.code(),
            Some(if matches!(phase, "fail" | "authorize") {
                97
            } else {
                0
            }),
            "{}{}",
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
                "fail" => json!({"effects":1,"requests":2}),
                "resume" => json!({"effects":0,"requests":1}),
                _ => json!({"effects":0,"requests":0}),
            }
        );
    }
}

#[cfg(feature = "workflow")]
mod workflows {
    use super::*;
    use nofy_agent_runtime::workflow::compile::*;
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
    struct LoopLeaf {
        leaf: Leaf,
        skipped: Arc<AtomicUsize>,
    }
    #[async_trait::async_trait]
    impl Model for LoopLeaf {
        async fn complete(
            &self,
            request: ModelRequest,
            context: &RunContext,
        ) -> Result<ModelResponse, Error> {
            if request
                .messages
                .iter()
                .any(|m| matches!(m,Message::User{content} if content=="skip"))
            {
                self.skipped.fetch_add(1, Ordering::SeqCst);
                return Ok(ModelResponse {
                    output: "task".into(),
                    ..Default::default()
                });
            }
            self.leaf.complete(request, context).await
        }
    }
    struct Outer {
        calls: Arc<AtomicUsize>,
        initial: &'static str,
    }
    #[async_trait::async_trait]
    impl Model for Outer {
        async fn complete(
            &self,
            request: ModelRequest,
            _: &RunContext,
        ) -> Result<ModelResponse, Error> {
            self.calls.fetch_add(1, Ordering::SeqCst);
            Ok(
                if request
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
                            id: "graph-call".into(),
                            name: "graph".into(),
                            arguments: json!({"input":self.initial}),
                        }],
                        ..Default::default()
                    }
                },
            )
        }
    }
    fn node(id: &str, needs: &[&str], input: Value, action: Value) -> Value {
        json!({"id":id,"needs":needs,"input":input,"action":action})
    }
    fn input() -> Value {
        json!({"from":"input"})
    }
    fn out(node: &str, pointer: &str) -> Value {
        json!({"from":"node","node":node,"pointer":pointer})
    }
    fn spec(id: &str, nodes: Vec<Value>, output: Value) -> Value {
        json!({"reference":reference(id),"nodes":nodes,"output":output,"parallelism":4,"input_schema":true,"output_schema":true})
    }
    type GraphParts = (
        CompiledAgent,
        Arc<AtomicUsize>,
        Arc<AtomicUsize>,
        Arc<AtomicUsize>,
        Arc<Mutex<Vec<ModelRequest>>>,
        Arc<GovernanceProfile>,
    );
    fn setup_graph(
        store: &SqliteStore,
        shape: &str,
        pause: bool,
        failures: usize,
        events: Arc<Mutex<Vec<HookEvent>>>,
    ) -> GraphParts {
        let mut registry = ModuleRegistry::default();
        let effects = Arc::new(AtomicUsize::new(0));
        let peers = Arc::new(AtomicUsize::new(0));
        let skipped = Arc::new(AtomicUsize::new(0));
        let requests = Arc::new(Mutex::new(Vec::new()));
        let mut tools = ToolCatalog::new();
        tools
            .insert(ToolEntry::typed(Effect(effects.clone())))
            .unwrap();
        let mut peer_tools = ToolCatalog::new();
        peer_tools
            .insert(ToolEntry::typed(Effect(peers.clone())))
            .unwrap();
        install(
            &mut registry,
            "leaf-model",
            ModuleInstance::Model(Arc::new(LoopLeaf {
                leaf: Leaf {
                    requests: requests.clone(),
                    failures: AtomicUsize::new(failures),
                },
                skipped: skipped.clone(),
            })),
        );
        install(
            &mut registry,
            "prompt",
            ModuleInstance::Prompt(Arc::new(StaticPrompt("system".into()))),
        );
        install(&mut registry, "effects", ModuleInstance::ToolPack(tools));
        install(&mut registry, "peers", ModuleInstance::ToolPack(peer_tools));
        let profile = Arc::new(
            GovernanceProfile::new(
                Arc::new(
                    InstalledBudget::install(
                        Arc::new(store.clone()),
                        BudgetLimits {
                            max_model_calls: Some(40),
                            max_child_calls: Some(40),
                            max_tool_calls: Some(40),
                            max_active_children: Some(12),
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
        let mut work = node(
            "work",
            &[],
            input(),
            json!({"kind":"agent","agent":reference("leaf")}),
        );
        if pause {
            work["on_error"] = json!({"exhausted":"pause"});
        }
        let mut workflows = vec![spec("body", vec![work], out("work", "/output"))];
        let body = if shape.contains("loop") {
            workflows.push(spec("wrapper",vec![node("loop",&[],input(),json!({"kind":"loop","workflow":reference("body"),"max_iterations":3,"until":{"value":input(),"equals":"leaf done"}}))],out("loop","")));
            "wrapper"
        } else {
            "body"
        };
        let mut main_work = if shape == "direct" {
            let mut work = node(
                "work",
                &["peer"],
                input(),
                json!({"kind":"agent","agent":reference("leaf")}),
            );
            if pause {
                work["on_error"] = json!({"exhausted":"pause"});
            }
            work
        } else {
            node(
                "work",
                &["peer"],
                input(),
                json!({"kind":"subworkflow","workflow":reference(body)}),
            )
        };
        if shape == "parallel" {
            main_work["needs"] = json!([]);
        }
        workflows.push(spec(
            "main",
            vec![
                node(
                    "peer",
                    &[],
                    json!({"from":"literal","value":{}}),
                    json!({"kind":"tool","runtime":reference("peer-runtime"),"tool":"effect"}),
                ),
                main_work,
            ],
            out("work", if shape == "direct" { "/output" } else { "" }),
        ));
        let document = json!({"entry":reference("main"),"host":{"name":"graph-host"},"agents":[{"reference":reference("leaf"),"definition":{"name":"leaf","model":reference("leaf-model"),"prompt":reference("prompt"),"tool_packs":[reference("effects")]}}],"tool_runtimes":[{"reference":reference("peer-runtime"),"definition":{"name":"peer-host","tool_packs":[reference("peers")]}}],"workflows":workflows});
        let graph = compile_workflow(serde_json::from_value(document).unwrap(), &registry).unwrap();
        let mut pack = ToolCatalog::new();
        pack.insert(graph.as_tool("graph", "Graph")).unwrap();
        install(&mut registry, "graph", ModuleInstance::ToolPack(pack));
        install(
            &mut registry,
            "outer-model",
            ModuleInstance::Model(Arc::new(Outer {
                calls: Arc::new(AtomicUsize::new(0)),
                initial: if shape.contains("loop") {
                    "skip"
                } else {
                    "task"
                },
            })),
        );
        let mut hook_refs = Vec::new();
        for name in [
            "turn_error",
            "subagent_finished",
            "node_failure",
            "node_start",
            "node_end",
            "workflow_end",
        ] {
            let registration = HookRegistration::new(
                format!("{name}-v1"),
                EventCatalog::runtime().get(name).unwrap().clone(),
                HookRule {
                    event: name.into(),
                    priority: 0,
                    timeout_ms: 5000,
                    failure: FailurePolicy::Closed,
                    matches: None,
                },
                Arc::new(Capture(events.clone())),
            )
            .unwrap();
            install(
                &mut registry,
                name,
                ModuleInstance::Hook(Arc::new(registration)),
            );
            hook_refs.push(reference(name));
        }
        let root=compile_agent(serde_json::from_value(json!({"name":"root-agent","model":reference("outer-model"),"prompt":reference("prompt"),"tool_packs":[reference("graph")],"governance":[reference("budget")],"hooks":hook_refs})).unwrap(),&registry).unwrap();
        (root, effects, peers, skipped, requests, profile)
    }
    async fn settle_root_facts(
        supervisor: &RunSupervisor,
        compiled: &CompiledAgent,
        store: &SqliteStore,
    ) {
        for _ in 0..4 {
            let cp = store
                .load(&format!(
                    "{}:{}thread",
                    compiled.agent.spec().name.len(),
                    compiled.agent.spec().name
                ))
                .await
                .unwrap()
                .unwrap();
            if cp.state.hook_progress.facts.is_empty() {
                return;
            }
            // Bounded error cleanup can leave a committed fact pending. Resume
            // it before asking for a new model generation, without new IO.
            let _ = supervisor
                .execute(compiled, RunInput::resume(), context())
                .await;
        }
        panic!("root facts did not settle");
    }
    #[tokio::test]
    async fn failed_models_resume_through_workflow_hosts_subflows_loops_and_paused_controllers() {
        for shape in ["direct", "subflow", "nested-loop", "parallel"] {
            for pause in [false, true] {
                let temp = tempfile::tempdir().unwrap();
                let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
                let events = Arc::new(Mutex::new(Vec::new()));
                let (compiled, effects, peers, skipped, requests, profile) =
                    setup_graph(&store, shape, pause, 1, events.clone());
                let supervisor = RunSupervisor::new(store.clone());
                let first = supervisor
                    .execute(&compiled, RunInput::new("start"), context())
                    .await;
                if pause {
                    assert!(
                        matches!(first, Ok(RunOutcome::Paused { .. })),
                        "{shape}: {first:?}"
                    );
                } else {
                    assert!(first.is_err(), "{shape}: {first:?}");
                }
                assert_eq!(effects.load(Ordering::SeqCst), 1, "{shape}");
                assert_eq!(peers.load(Ordering::SeqCst), 1, "{shape}");
                settle_root_facts(&supervisor, &compiled, &store).await;
                let before = store
                    .children("root")
                    .await
                    .unwrap()
                    .into_iter()
                    .find(|c| c.agent_name == "leaf" && c.status == "failed")
                    .unwrap();
                let command = ModelRetryCommand {
                    command_id: "retry-workflow-leaf".into(),
                    ticket: supervisor
                        .child_model_retry_ticket("root", &before.run_id)
                        .await
                        .unwrap()
                        .unwrap(),
                };
                let outcome = supervisor
                    .execute(&compiled, RunInput::retry_model(command.clone()), context())
                    .await;
                assert!(
                    matches!(&outcome, Ok(RunOutcome::Completed { .. })),
                    "{shape}/{pause}: {outcome:?}"
                );
                assert_eq!(effects.load(Ordering::SeqCst), 1, "{shape}");
                assert_eq!(peers.load(Ordering::SeqCst), 1, "{shape}");
                assert_eq!(
                    skipped.load(Ordering::SeqCst),
                    usize::from(shape.contains("loop")),
                    "{shape}"
                );
                let seen = requests.lock().unwrap().clone();
                assert_eq!(seen.len(), 3, "{shape}");
                assert_eq!(
                    serde_json::to_value(&seen[1]).unwrap(),
                    serde_json::to_value(&seen[2]).unwrap()
                );
                let after = store
                    .children("root")
                    .await
                    .unwrap()
                    .into_iter()
                    .find(|c| c.run_id == before.run_id)
                    .unwrap();
                assert_eq!(after.status, "completed");
                let summary = store
                    .inspect(&BudgetScope {
                        root_run_id: "root".into(),
                        identity: profile.identity().into(),
                    })
                    .await
                    .unwrap()
                    .unwrap();
                assert_eq!(summary.active_children, 0, "{shape}/{pause}");
                supervisor
                    .execute(&compiled, RunInput::retry_model(command), context())
                    .await
                    .unwrap();
                assert_eq!(requests.lock().unwrap().len(), 3);
            }
        }
    }

    #[tokio::test]
    async fn repeated_nested_workflow_failures_preserve_completed_iterations_and_hook_receipts() {
        for pause in [false, true] {
            let temp = tempfile::tempdir().unwrap();
            let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
            let (compiled, effects, peers, skipped, requests, profile) = setup_graph(
                &store,
                "nested-loop",
                pause,
                2,
                Arc::new(Mutex::new(Vec::new())),
            );
            let supervisor = RunSupervisor::new(store.clone());
            let _ = supervisor
                .execute(&compiled, RunInput::new("start"), context())
                .await;
            for attempt in 0..2 {
                settle_root_facts(&supervisor, &compiled, &store).await;
                let target = store
                    .children("root")
                    .await
                    .unwrap()
                    .into_iter()
                    .find(|c| c.agent_name == "leaf" && c.status == "failed")
                    .unwrap();
                let command = ModelRetryCommand {
                    command_id: format!("retry-{attempt}"),
                    ticket: supervisor
                        .child_model_retry_ticket("root", &target.run_id)
                        .await
                        .unwrap()
                        .unwrap(),
                };
                let outcome = supervisor
                    .execute(&compiled, RunInput::retry_model(command), context())
                    .await;
                if attempt == 1 {
                    assert!(
                        matches!(outcome, Ok(RunOutcome::Completed { .. })),
                        "{pause}: {outcome:?}"
                    );
                }
            }
            assert_eq!(effects.load(Ordering::SeqCst), 1);
            assert_eq!(peers.load(Ordering::SeqCst), 1);
            assert_eq!(skipped.load(Ordering::SeqCst), 1);
            assert_eq!(requests.lock().unwrap().len(), 4);
            let summary = store
                .inspect(&BudgetScope {
                    root_run_id: "root".into(),
                    identity: profile.identity().into(),
                })
                .await
                .unwrap()
                .unwrap();
            assert_eq!(summary.used.model_calls, 7);
            assert_eq!(summary.active_children, 0);
        }
    }

    #[tokio::test]
    async fn workflow_retry_process_worker() {
        let Ok(directory) = std::env::var("NOFY_WORKFLOW_RETRY_WORKER") else {
            return;
        };
        let phase = std::env::var("NOFY_WORKFLOW_RETRY_PHASE").unwrap();
        let directory = std::path::Path::new(&directory);
        let path = directory.join("runtime.db");
        let store = SqliteStore::open(&path).unwrap();
        let (compiled, effects, peers, skipped, requests, profile) = setup_graph(
            &store,
            "nested-loop",
            false,
            usize::from(phase == "fail"),
            Arc::new(Mutex::new(Vec::new())),
        );
        let supervisor = RunSupervisor::new(store.clone());
        match phase.as_str() {
            "fail" => {
                assert!(
                    supervisor
                        .execute(&compiled, RunInput::new("start"), context())
                        .await
                        .is_err()
                );
                settle_root_facts(&supervisor, &compiled, &store).await;
                let target = store
                    .children("root")
                    .await
                    .unwrap()
                    .into_iter()
                    .find(|c| c.agent_name == "leaf" && c.status == "failed")
                    .unwrap();
                let command = ModelRetryCommand {
                    command_id: "retry-after-process-exit".into(),
                    ticket: supervisor
                        .child_model_retry_ticket("root", &target.run_id)
                        .await
                        .unwrap()
                        .unwrap(),
                };
                std::fs::write(
                    directory.join("command.json"),
                    serde_json::to_vec(&command).unwrap(),
                )
                .unwrap();
            }
            "authorize" => {
                let sql = rusqlite::Connection::open(&path).unwrap();
                sql.execute_batch("CREATE TRIGGER lose_generation BEFORE UPDATE ON agent_runtime_checkpoints WHEN NEW.key LIKE '[\"model-recovery-v1\",%' AND json_extract(NEW.payload,'$.state.data.sequence')=1 BEGIN SELECT RAISE(ABORT,'lost workflow child generation'); END;").unwrap();
                let command =
                    serde_json::from_slice(&std::fs::read(directory.join("command.json")).unwrap())
                        .unwrap();
                assert!(matches!(
                    supervisor
                        .execute(&compiled, RunInput::retry_model(command), context())
                        .await,
                    Err(Error::Checkpoint(_))
                ));
                sql.execute_batch("DROP TRIGGER lose_generation").unwrap();
            }
            "resume" | "cached" => {
                assert!(matches!(
                    supervisor
                        .execute(&compiled, RunInput::resume(), context())
                        .await
                        .unwrap(),
                    RunOutcome::Completed { .. }
                ));
                let summary = store
                    .inspect(&BudgetScope {
                        root_run_id: "root".into(),
                        identity: profile.identity().into(),
                    })
                    .await
                    .unwrap()
                    .unwrap();
                assert_eq!(summary.active_children, 0);
            }
            _ => unreachable!(),
        }
        std::fs::write(directory.join(format!("{phase}.json")),serde_json::to_vec(&json!({"effect":effects.load(Ordering::SeqCst),"peer":peers.load(Ordering::SeqCst),"skipped":skipped.load(Ordering::SeqCst),"model":requests.lock().unwrap().len()})).unwrap()).unwrap();
        if matches!(phase.as_str(), "fail" | "authorize") {
            std::process::exit(97)
        }
    }
    #[test]
    fn workflow_retry_after_real_process_exit_preserves_peer_and_iteration_results() {
        let temp = tempfile::tempdir().unwrap();
        for phase in ["fail", "authorize", "resume", "cached"] {
            let output = std::process::Command::new(std::env::current_exe().unwrap())
                .args([
                    "--exact",
                    "workflows::workflow_retry_process_worker",
                    "--nocapture",
                ])
                .env("NOFY_WORKFLOW_RETRY_WORKER", temp.path())
                .env("NOFY_WORKFLOW_RETRY_PHASE", phase)
                .output()
                .unwrap();
            assert_eq!(
                output.status.code(),
                Some(if matches!(phase, "fail" | "authorize") {
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
                    "fail" => json!({"effect":1,"peer":1,"skipped":1,"model":2}),
                    "resume" => json!({"effect":0,"peer":0,"skipped":0,"model":1}),
                    _ => json!({"effect":0,"peer":0,"skipped":0,"model":0}),
                }
            );
        }
    }

    struct RootModel {
        calls: Arc<AtomicUsize>,
        tool: bool,
    }
    #[async_trait::async_trait]
    impl Model for RootModel {
        async fn complete(
            &self,
            request: ModelRequest,
            _: &RunContext,
        ) -> Result<ModelResponse, Error> {
            self.calls.fetch_add(1, Ordering::SeqCst);
            Ok(
                if self.tool
                    && !request
                        .messages
                        .iter()
                        .any(|m| matches!(m, Message::Tool { .. }))
                {
                    ModelResponse {
                        tool_calls: vec![ToolCall {
                            id: "effect-root".into(),
                            name: "effect".into(),
                            arguments: json!({}),
                        }],
                        ..Default::default()
                    }
                } else {
                    ModelResponse {
                        output: "parent done".into(),
                        ..Default::default()
                    }
                },
            )
        }
    }
    struct PriorHook(Arc<AtomicUsize>);
    #[async_trait::async_trait]
    impl HookHandler for PriorHook {
        async fn handle(&self, event: &HookEvent, _: &RunContext) -> Result<HookDecision, Error> {
            self.0.fetch_add(1, Ordering::SeqCst);
            if event.name == "user_input" {
                let mut payload = event.payload.clone();
                payload["message"]["content"] = json!("patched");
                Ok(HookDecision::Patch { payload })
            } else {
                Ok(HookDecision::Continue)
            }
        }
    }
    type HookParts = (
        CompiledAgent,
        Arc<AtomicUsize>,
        Arc<AtomicUsize>,
        Arc<AtomicUsize>,
        Arc<AtomicUsize>,
        Arc<Mutex<Vec<ModelRequest>>>,
        ModuleRegistry,
    );
    fn setup_hook(store: &SqliteStore, event: &str, failures: usize, pause: bool) -> HookParts {
        use nofy_agent_runtime::workflow::modules::*;
        let mut registry = ModuleRegistry::default();
        let effects = Arc::new(AtomicUsize::new(0));
        let root_effects = Arc::new(AtomicUsize::new(0));
        let root_models = Arc::new(AtomicUsize::new(0));
        let prior = Arc::new(AtomicUsize::new(0));
        let requests = Arc::new(Mutex::new(Vec::new()));
        install(
            &mut registry,
            "leaf-model",
            ModuleInstance::Model(Arc::new(Leaf {
                requests: requests.clone(),
                failures: AtomicUsize::new(failures),
            })),
        );
        install(
            &mut registry,
            "prompt",
            ModuleInstance::Prompt(Arc::new(StaticPrompt("system".into()))),
        );
        let mut tools = ToolCatalog::new();
        tools
            .insert(ToolEntry::typed(Effect(effects.clone())))
            .unwrap();
        install(&mut registry, "effects", ModuleInstance::ToolPack(tools));
        let mut root_tools = ToolCatalog::new();
        root_tools
            .insert(ToolEntry::typed(Effect(root_effects.clone())))
            .unwrap();
        install(
            &mut registry,
            "root-effects",
            ModuleInstance::ToolPack(root_tools),
        );
        let profile = Arc::new(
            GovernanceProfile::new(
                Arc::new(
                    InstalledBudget::install(
                        Arc::new(store.clone()),
                        BudgetLimits {
                            max_model_calls: Some(40),
                            max_child_calls: Some(40),
                            max_tool_calls: Some(40),
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
        install(&mut registry, "budget", ModuleInstance::Governance(profile));
        let mut work = node(
            "work",
            &[],
            json!({"from":"literal","value":"task"}),
            json!({"kind":"agent","agent":reference("leaf")}),
        );
        if pause {
            work["on_error"] = json!({"exhausted":"pause"});
        }
        let doc = json!({"entry":reference("main"),"host":{"name":"hook-host"},"agents":[{"reference":reference("leaf"),"definition":{"name":"leaf","model":reference("leaf-model"),"prompt":reference("prompt"),"tool_packs":[reference("effects")]}}],"workflows":[spec("main",vec![work],json!({"from":"literal","value":{"decision":"continue"}}))]});
        let graph = compile_workflow(serde_json::from_value(doc).unwrap(), &registry).unwrap();
        registry
            .register_factory(Arc::new(WorkflowHookFactory(
                WorkflowLibrary::new(std::collections::BTreeMap::from([(
                    "published@1".into(),
                    graph,
                )]))
                .unwrap(),
            )))
            .unwrap();
        registry
            .register_factory(Arc::new(HookFactory::new(EventCatalog::runtime())))
            .unwrap();
        registry
            .define(ModuleDefinition {
                reference: reference("handler"),
                factory: "hook.workflow".into(),
                config: json!({"workflow":"published@1"}),
                dependencies: Default::default(),
            })
            .unwrap();
        let source_graph = matches!(
            event,
            "workflow_start" | "workflow_end" | "node_start" | "node_end"
        );
        let matcher = if source_graph {
            Some(MatchValue {
                pointer: if event.starts_with("workflow") {
                    "/workflow/id"
                } else {
                    "/node"
                }
                .into(),
                equals: json!(if event.starts_with("workflow") {
                    "source"
                } else {
                    "source_effect"
                }),
            })
        } else {
            None
        };
        // These cases test durable controller recovery, with real FULL SQLite
        // commits. Dedicated workflow_hooks tests cover the timeout boundary.
        let mut hook_config = json!({"event":event,"timeout_ms":60000});
        if let Some(matcher) = &matcher {
            hook_config["matches"] = serde_json::to_value(matcher).unwrap();
        }
        registry
            .define(ModuleDefinition {
                reference: reference("hook"),
                factory: "hook.subscription".into(),
                config: hook_config,
                dependencies: std::collections::BTreeMap::from([(
                    "handler".into(),
                    reference("handler"),
                )]),
            })
            .unwrap();
        let prior_hook = HookRegistration::new(
            "prior-v1".into(),
            EventCatalog::runtime().get(event).unwrap().clone(),
            HookRule {
                event: event.into(),
                priority: -1,
                timeout_ms: 5000,
                failure: FailurePolicy::Closed,
                matches: matcher,
            },
            Arc::new(PriorHook(prior.clone())),
        )
        .unwrap();
        install(
            &mut registry,
            "prior",
            ModuleInstance::Hook(Arc::new(prior_hook)),
        );
        let root_pack = if source_graph {
            let doc = json!({"entry":reference("source"),"host":{"name":"source-host"},"tool_runtimes":[{"reference":reference("source-tools"),"definition":{"name":"source-tools","tool_packs":[reference("root-effects")]}}],"workflows":[spec("source",vec![node("source_effect",&[],json!({"from":"literal","value":{}}),json!({"kind":"tool","runtime":reference("source-tools"),"tool":"effect"}))],out("source_effect",""))]});
            let source = compile_workflow(serde_json::from_value(doc).unwrap(), &registry).unwrap();
            let mut pack = ToolCatalog::new();
            pack.insert(source.as_tool("graph", "Source")).unwrap();
            install(
                &mut registry,
                "source-graph",
                ModuleInstance::ToolPack(pack),
            );
            install(
                &mut registry,
                "root-model",
                ModuleInstance::Model(Arc::new(Outer {
                    calls: root_models.clone(),
                    initial: "task",
                })),
            );
            "source-graph"
        } else {
            install(
                &mut registry,
                "root-model",
                ModuleInstance::Model(Arc::new(RootModel {
                    calls: root_models.clone(),
                    tool: matches!(event, "before_tool" | "after_tool"),
                })),
            );
            "root-effects"
        };
        let root=compile_agent(serde_json::from_value(json!({"name":"root-agent","model":reference("root-model"),"prompt":reference("prompt"),"tool_packs":[reference(root_pack)],"hooks":[reference("prior"),reference("hook")],"governance":[reference("budget")]})).unwrap(),&registry).unwrap();
        (
            root,
            effects,
            root_effects,
            root_models,
            prior,
            requests,
            registry,
        )
    }
    #[tokio::test]
    async fn workflow_hook_model_retry_keeps_source_event_prior_handlers_and_root_boundaries() {
        for event in [
            "user_input",
            "turn_start",
            "before_model",
            "before_tool",
            "after_tool",
            "before_stop",
            "turn_done",
            "workflow_start",
            "node_start",
            "node_end",
            "workflow_end",
        ] {
            for pause in [false, true] {
                let temp = tempfile::tempdir().unwrap();
                let path = temp.path().join("runtime.db");
                let store = SqliteStore::open(&path).unwrap();
                let (compiled, effects, root_effects, root_models, prior, requests, _) =
                    setup_hook(&store, event, 1, pause);
                let supervisor = RunSupervisor::new(store.clone());
                let first = supervisor
                    .execute(&compiled, RunInput::new("start"), context())
                    .await;
                assert!(
                    !matches!(&first, Ok(RunOutcome::Completed { .. })),
                    "{event}/{pause}: {first:?}"
                );
                let target = store
                    .children("root")
                    .await
                    .unwrap()
                    .into_iter()
                    .find(|c| c.agent_name == "leaf" && c.status == "failed")
                    .unwrap_or_else(|| panic!("{event}/{pause}: {first:?}"));
                let command = ModelRetryCommand {
                    command_id: "retry-hook-leaf".into(),
                    ticket: supervisor
                        .child_model_retry_ticket("root", &target.run_id)
                        .await
                        .unwrap()
                        .unwrap(),
                };
                let outcome = supervisor
                    .execute(&compiled, RunInput::retry_model(command.clone()), context())
                    .await;
                assert!(
                    matches!(&outcome, Ok(RunOutcome::Completed { .. })),
                    "{event}/{pause}: {outcome:?}"
                );
                assert_eq!(effects.load(Ordering::SeqCst), 1, "{event}");
                assert_eq!(
                    root_effects.load(Ordering::SeqCst),
                    usize::from(matches!(
                        event,
                        "before_tool"
                            | "after_tool"
                            | "workflow_start"
                            | "node_start"
                            | "node_end"
                            | "workflow_end"
                    )),
                    "{event}"
                );
                assert_eq!(
                    root_models.load(Ordering::SeqCst),
                    if matches!(
                        event,
                        "before_tool"
                            | "after_tool"
                            | "workflow_start"
                            | "node_start"
                            | "node_end"
                            | "workflow_end"
                    ) {
                        2
                    } else {
                        1
                    },
                    "{event}"
                );
                assert_eq!(prior.load(Ordering::SeqCst), 1, "{event}");
                assert_eq!(requests.lock().unwrap().len(), 3, "{event}");
                supervisor
                    .execute(&compiled, RunInput::retry_model(command), context())
                    .await
                    .unwrap();
                assert_eq!(requests.lock().unwrap().len(), 3);
                let sql = rusqlite::Connection::open(&path).unwrap();
                let original_errors:u64=sql.query_row("SELECT COUNT(*) FROM agent_runtime_checkpoints WHERE key LIKE '[\"hook-v1\",%' AND json_extract(payload,'$.state.data.error') IS NOT NULL",[],|row|row.get(0)).unwrap();
                if !pause {
                    assert!(original_errors >= 1, "old failure receipt was removed");
                }
            }
        }
    }

    #[tokio::test]
    async fn hook_retry_survives_lost_intent_or_decision_and_reconciliation_targets_current_generation()
     {
        for fault in ["intent", "decision"] {
            let temp = tempfile::tempdir().unwrap();
            let path = temp.path().join("runtime.db");
            let store = SqliteStore::open(&path).unwrap();
            let (compiled, effects, _, models, prior, requests, _) =
                setup_hook(&store, "before_model", 1, false);
            let supervisor = RunSupervisor::new(store.clone());
            assert!(
                supervisor
                    .execute(&compiled, RunInput::new("start"), context())
                    .await
                    .is_err()
            );
            let target = store
                .children("root")
                .await
                .unwrap()
                .into_iter()
                .find(|c| c.agent_name == "leaf")
                .unwrap();
            let command = ModelRetryCommand {
                command_id: "retry-hook".into(),
                ticket: supervisor
                    .child_model_retry_ticket("root", &target.run_id)
                    .await
                    .unwrap()
                    .unwrap(),
            };
            let bus = compiled.agent.hook_bus().unwrap();
            let registration = bus.registrations().last().unwrap();
            let sql = rusqlite::Connection::open(&path).unwrap();
            let (original_key,original):(String,String)=sql.query_row("SELECT key,payload FROM agent_runtime_checkpoints WHERE key LIKE '[\"hook-v1\",%' AND json_extract(payload,'$.state.data.hook')=?1",[registration.identity()],|row|Ok((row.get(0)?,row.get(1)?))).unwrap();
            let source: Value = serde_json::from_str(&original).unwrap();
            let event: HookEvent =
                serde_json::from_value(source["state"]["data"]["event"].clone()).unwrap();
            sql.execute_batch(if fault=="intent" {
                "CREATE TRIGGER lose_hook BEFORE INSERT ON agent_runtime_checkpoints WHEN NEW.key LIKE '[\"hook-control-v1\",%' BEGIN SELECT RAISE(ABORT,'lost recovery Hook intent'); END;"
            }else {
                "CREATE TRIGGER lose_hook BEFORE UPDATE ON agent_runtime_checkpoints WHEN NEW.key LIKE '[\"hook-control-v1\",%' AND json_extract(NEW.payload,'$.state.data.decision.decision')='continue' AND json_extract(NEW.payload,'$.state.data.error') IS NULL BEGIN SELECT RAISE(ABORT,'lost recovery Hook decision'); END;"
            }).unwrap();
            assert!(matches!(
                supervisor
                    .execute(&compiled, RunInput::retry_model(command), context())
                    .await,
                Err(Error::Checkpoint(_))
            ));
            assert_eq!(models.load(Ordering::SeqCst), 0);
            let journal = HookJournal::new(Arc::new(store.clone()));
            if fault == "intent" {
                // Accepted authority points at the new intent, even before that
                // intent exists. Reconciliation cannot overwrite the old error.
                assert!(
                    journal
                        .reconcile(bus, registration, &event, HookDecision::Continue)
                        .await
                        .is_err()
                );
            }
            sql.execute_batch("DROP TRIGGER lose_hook").unwrap();
            if fault == "decision" {
                journal
                    .reconcile(bus, registration, &event, HookDecision::Continue)
                    .await
                    .unwrap();
            }
            drop(supervisor);
            let reopened = RunSupervisor::new(SqliteStore::open(&path).unwrap());
            assert!(matches!(
                reopened
                    .execute(&compiled, RunInput::resume(), context())
                    .await
                    .unwrap(),
                RunOutcome::Completed { .. }
            ));
            assert_eq!(effects.load(Ordering::SeqCst), 1);
            assert_eq!(requests.lock().unwrap().len(), 3);
            assert_eq!(prior.load(Ordering::SeqCst), 1);
            assert_eq!(models.load(Ordering::SeqCst), 1);
            let old: String = sql
                .query_row(
                    "SELECT payload FROM agent_runtime_checkpoints WHERE key=?1",
                    [original_key],
                    |row| row.get(0),
                )
                .unwrap();
            assert_eq!(old, original);
            // A later real turn gets a new event and runs the Hook normally.
            assert!(matches!(
                reopened
                    .execute(
                        &compiled,
                        RunInput::new("next"),
                        RunContext::new("thread", "next-root")
                    )
                    .await
                    .unwrap(),
                RunOutcome::Completed { .. }
            ));
            assert_eq!(effects.load(Ordering::SeqCst), 2);
            assert_eq!(prior.load(Ordering::SeqCst), 2);
        }
    }

    #[tokio::test]
    async fn repeated_hook_failures_and_stop_hook_jobs_remain_resumable_without_repeating_prior_handlers()
     {
        use nofy_agent_runtime::supervisor::jobs::*;
        for event in ["before_model", "before_stop", "turn_done"] {
            let temp = tempfile::tempdir().unwrap();
            let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
            let (compiled, effects, _, models, prior, requests, registry) =
                setup_hook(&store, event, 2, false);
            let supervisor = RunSupervisor::new(store.clone());
            let message = nofy_interjection_core::PendingInterjection {
                text: "start".into(),
                attachments: vec![],
            };
            supervisor
                .submit(JobSubmission::for_agent(
                    &compiled, "thread", "root", message,
                ))
                .await
                .unwrap();
            assert!(
                supervisor
                    .execute_submitted(&registry, "root")
                    .await
                    .is_err()
            );
            assert!(
                matches!(
                    store.job("root").await.unwrap().unwrap().status,
                    JobStatus::Waiting
                ),
                "{event}"
            );
            for attempt in 0..2 {
                let target = store
                    .children("root")
                    .await
                    .unwrap()
                    .into_iter()
                    .find(|c| c.agent_name == "leaf" && c.status == "failed")
                    .unwrap();
                let command = ModelRetryCommand {
                    command_id: format!("hook-retry-{attempt}"),
                    ticket: supervisor
                        .child_model_retry_ticket("root", &target.run_id)
                        .await
                        .unwrap()
                        .unwrap(),
                };
                let outcome = supervisor
                    .execute(&compiled, RunInput::retry_model(command), context())
                    .await;
                if attempt == 0 {
                    assert!(outcome.is_err());
                    assert!(matches!(
                        store.job("root").await.unwrap().unwrap().status,
                        JobStatus::Waiting
                    ));
                } else {
                    assert!(
                        matches!(outcome, Ok(RunOutcome::Completed { .. })),
                        "{event}: {outcome:?}"
                    );
                }
            }
            assert!(matches!(
                store.job("root").await.unwrap().unwrap().status,
                JobStatus::Closed
            ));
            assert_eq!(effects.load(Ordering::SeqCst), 1);
            assert_eq!(prior.load(Ordering::SeqCst), 1);
            assert_eq!(requests.lock().unwrap().len(), 4);
            assert_eq!(models.load(Ordering::SeqCst), 1);
        }
    }

    #[tokio::test]
    async fn hook_retry_process_worker() {
        let Ok(directory) = std::env::var("NOFY_HOOK_RETRY_WORKER") else {
            return;
        };
        let phase = std::env::var("NOFY_HOOK_RETRY_PHASE").unwrap();
        let directory = std::path::Path::new(&directory);
        let path = directory.join("runtime.db");
        let store = SqliteStore::open(&path).unwrap();
        let (compiled, effects, _, models, prior, requests, _) =
            setup_hook(&store, "before_model", usize::from(phase == "fail"), false);
        let supervisor = RunSupervisor::new(store.clone());
        match phase.as_str() {
            "fail" => {
                assert!(
                    supervisor
                        .execute(&compiled, RunInput::new("start"), context())
                        .await
                        .is_err()
                );
                let target = store
                    .children("root")
                    .await
                    .unwrap()
                    .into_iter()
                    .find(|c| c.agent_name == "leaf")
                    .unwrap();
                let command = ModelRetryCommand {
                    command_id: "hook-retry-after-exit".into(),
                    ticket: supervisor
                        .child_model_retry_ticket("root", &target.run_id)
                        .await
                        .unwrap()
                        .unwrap(),
                };
                std::fs::write(
                    directory.join("command.json"),
                    serde_json::to_vec(&command).unwrap(),
                )
                .unwrap();
            }
            "authorize" => {
                let sql = rusqlite::Connection::open(&path).unwrap();
                sql.execute_batch("CREATE TRIGGER lose_hook BEFORE INSERT ON agent_runtime_checkpoints WHEN NEW.key LIKE '[\"hook-control-v1\",%' BEGIN SELECT RAISE(ABORT,'lost recovery Hook intent'); END;").unwrap();
                let command =
                    serde_json::from_slice(&std::fs::read(directory.join("command.json")).unwrap())
                        .unwrap();
                assert!(matches!(
                    supervisor
                        .execute(&compiled, RunInput::retry_model(command), context())
                        .await,
                    Err(Error::Checkpoint(_))
                ));
                sql.execute_batch("DROP TRIGGER lose_hook").unwrap();
            }
            "resume" | "cached" => {
                assert!(matches!(
                    supervisor
                        .execute(&compiled, RunInput::resume(), context())
                        .await
                        .unwrap(),
                    RunOutcome::Completed { .. }
                ));
            }
            _ => unreachable!(),
        }
        std::fs::write(directory.join(format!("{phase}.json")),serde_json::to_vec(&json!({"effect":effects.load(Ordering::SeqCst),"model":requests.lock().unwrap().len(),"prior":prior.load(Ordering::SeqCst),"root_model":models.load(Ordering::SeqCst)})).unwrap()).unwrap();
        if matches!(phase.as_str(), "fail" | "authorize") {
            std::process::exit(97)
        }
    }
    #[test]
    fn workflow_hook_retry_after_real_process_exit_preserves_original_event_and_prior_effects() {
        let temp = tempfile::tempdir().unwrap();
        for phase in ["fail", "authorize", "resume", "cached"] {
            let output = std::process::Command::new(std::env::current_exe().unwrap())
                .args([
                    "--exact",
                    "workflows::hook_retry_process_worker",
                    "--nocapture",
                ])
                .env("NOFY_HOOK_RETRY_WORKER", temp.path())
                .env("NOFY_HOOK_RETRY_PHASE", phase)
                .output()
                .unwrap();
            assert_eq!(
                output.status.code(),
                Some(if matches!(phase, "fail" | "authorize") {
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
                    "fail" => json!({"effect":1,"model":2,"prior":1,"root_model":0}),
                    "resume" => json!({"effect":0,"model":1,"prior":0,"root_model":1}),
                    _ => json!({"effect":0,"model":0,"prior":0,"root_model":0}),
                }
            );
        }
    }

    #[tokio::test]
    async fn nested_workflow_hooks_route_one_retry_through_both_original_source_events() {
        use nofy_agent_runtime::workflow::modules::*;
        let temp = tempfile::tempdir().unwrap();
        let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
        let (_, effects, outer_effects, _, prior, requests, mut registry) =
            setup_hook(&store, "workflow_start", 1, false);
        let doc = json!({"entry":reference("source"),"host":{"name":"outer-hook-host"},"tool_runtimes":[{"reference":reference("outer-tools"),"definition":{"name":"outer-tools","tool_packs":[reference("root-effects")]}}],"workflows":[spec("source",vec![node("outer_effect",&[],json!({"from":"literal","value":{}}),json!({"kind":"tool","runtime":reference("outer-tools"),"tool":"effect"}))],json!({"from":"literal","value":{"decision":"continue"}}))]});
        let outer = compile_workflow(serde_json::from_value(doc).unwrap(), &registry).unwrap();
        let factory = WorkflowHookFactory(
            WorkflowLibrary::new(std::collections::BTreeMap::from([(
                "outer@1".into(),
                outer,
            )]))
            .unwrap(),
        );
        let ModuleInstance::HookHandler(handler) = factory
            .build(&json!({"workflow":"outer@1"}), &Default::default())
            .unwrap()
        else {
            unreachable!()
        };
        let hook = HookRegistration::new(
            "outer-before-model-v1".into(),
            EventCatalog::runtime().get("before_model").unwrap().clone(),
            HookRule {
                event: "before_model".into(),
                priority: 0,
                timeout_ms: 60000,
                failure: FailurePolicy::Closed,
                matches: None,
            },
            handler,
        )
        .unwrap();
        install(
            &mut registry,
            "outer-hook",
            ModuleInstance::Hook(Arc::new(hook)),
        );
        let models = Arc::new(AtomicUsize::new(0));
        install(
            &mut registry,
            "final-model",
            ModuleInstance::Model(Arc::new(RootModel {
                calls: models.clone(),
                tool: false,
            })),
        );
        let compiled=compile_agent(serde_json::from_value(json!({"name":"root-agent","model":reference("final-model"),"prompt":reference("prompt"),"hooks":[reference("prior"),reference("hook"),reference("outer-hook")],"governance":[reference("budget")]})).unwrap(),&registry).unwrap();
        let supervisor = RunSupervisor::new(store.clone());
        assert!(
            supervisor
                .execute(&compiled, RunInput::new("start"), context())
                .await
                .is_err()
        );
        let target = store
            .children("root")
            .await
            .unwrap()
            .into_iter()
            .find(|c| c.agent_name == "leaf")
            .unwrap();
        let command = ModelRetryCommand {
            command_id: "retry-through-two-hooks".into(),
            ticket: supervisor
                .child_model_retry_ticket("root", &target.run_id)
                .await
                .unwrap()
                .unwrap(),
        };
        let outcome = supervisor
            .execute(&compiled, RunInput::retry_model(command), context())
            .await;
        assert!(
            matches!(&outcome, Ok(RunOutcome::Completed { .. })),
            "{outcome:?}"
        );
        assert_eq!(effects.load(Ordering::SeqCst), 1);
        assert_eq!(outer_effects.load(Ordering::SeqCst), 1);
        assert_eq!(models.load(Ordering::SeqCst), 1);
        assert_eq!(prior.load(Ordering::SeqCst), 1);
        assert_eq!(requests.lock().unwrap().len(), 3);
    }

    #[tokio::test]
    async fn external_session_notification_cannot_claim_root_loop_retry_authority() {
        struct NotifyModel(Agent);
        #[async_trait::async_trait]
        impl Model for NotifyModel {
            async fn complete(
                &self,
                _: ModelRequest,
                context: &RunContext,
            ) -> Result<ModelResponse, Error> {
                self.0
                    .notify_session(SessionSignal::Idle, context.clone())
                    .await?;
                Ok(ModelResponse {
                    output: "done".into(),
                    ..Default::default()
                })
            }
        }
        let temp = tempfile::tempdir().unwrap();
        let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
        let (notification, effects, _, _, _, requests, mut registry) =
            setup_hook(&store, "session_idle", 1, false);
        install(
            &mut registry,
            "notify-model",
            ModuleInstance::Model(Arc::new(NotifyModel(notification.agent))),
        );
        let capture = Arc::new(Capture(Arc::new(Mutex::new(Vec::new()))));
        let noop = HookRegistration::new(
            "driver-hook-journal".into(),
            EventCatalog::runtime().get("turn_start").unwrap().clone(),
            HookRule {
                event: "turn_start".into(),
                priority: 0,
                timeout_ms: 5000,
                failure: FailurePolicy::Closed,
                matches: None,
            },
            capture,
        )
        .unwrap();
        install(
            &mut registry,
            "driver-hook",
            ModuleInstance::Hook(Arc::new(noop)),
        );
        let compiled=compile_agent(serde_json::from_value(json!({"name":"notification-driver","model":reference("notify-model"),"prompt":reference("prompt"),"hooks":[reference("driver-hook")],"governance":[reference("budget")]})).unwrap(),&registry).unwrap();
        let supervisor = RunSupervisor::new(store.clone());
        assert!(
            supervisor
                .execute(&compiled, RunInput::new("start"), context())
                .await
                .is_err()
        );
        let target = store
            .children("root")
            .await
            .unwrap()
            .into_iter()
            .find(|c| c.agent_name == "leaf")
            .unwrap();
        let command = ModelRetryCommand {
            command_id: "cannot-replay-notification-as-root".into(),
            ticket: supervisor
                .child_model_retry_ticket("root", &target.run_id)
                .await
                .unwrap()
                .unwrap(),
        };
        let before = serde_json::to_value(store.record("root").await.unwrap()).unwrap();
        assert!(matches!(
            supervisor
                .execute(&compiled, RunInput::retry_model(command), context())
                .await,
            Err(Error::Checkpoint(_))
        ));
        assert_eq!(
            serde_json::to_value(store.record("root").await.unwrap()).unwrap(),
            before
        );
        assert_eq!(effects.load(Ordering::SeqCst), 1);
        assert_eq!(requests.lock().unwrap().len(), 2);
    }
}
