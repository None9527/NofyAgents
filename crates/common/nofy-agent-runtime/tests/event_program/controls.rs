use super::*;
use nofy_agent_runtime::{
    durable::*,
    governance::*,
    mailbox::*,
    supervisor::*,
    workflow::{compile::*, modules::*},
};
use nofy_tool_runtime::{Tool, ToolCallContext};
use nofy_tool_types::ToolDescription;
use std::sync::atomic::{AtomicBool, Ordering};
struct Leaf {
    path: PathBuf,
    first: AtomicBool,
    wait: Option<Arc<tokio::sync::Notify>>,
}
#[async_trait::async_trait]
impl Model for Leaf {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        append(&self.path, &serde_json::to_value(&request).unwrap())?;
        if self.first.swap(false, Ordering::SeqCst) {
            if let Some(notify) = &self.wait {
                notify.notify_one();
                std::future::pending::<()>().await;
            }
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
            output: "leaf result".into(),
            ..Default::default()
        })
    }
}
struct Effect(PathBuf);
impl Tool for Effect {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("effect").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        ToolDescription::new("effect", "Persist one effect")
    }
    async fn run(
        &self,
        _: ToolCallContext,
        args: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        append(&self.0, &args)
            .map_err(|e| nofy_tool_runtime::ToolError::custom("effect", e.to_string()))?;
        Ok(args)
    }
}
fn flow_setup(
    store: &SqliteStore,
    dir: &Path,
    session: bool,
    wait: Option<Arc<tokio::sync::Notify>>,
) -> (ModuleRegistry, CompiledEventProgram, Arc<GovernanceProfile>) {
    let (mut registry, event) = setup(&dir.join("prior.log"), session, None);
    let model = install(
        &mut registry,
        "model",
        ModuleInstance::Model(Arc::new(Leaf {
            path: dir.join("requests.log"),
            first: AtomicBool::new(!dir.join("requests.log").exists()),
            wait,
        })),
    );
    install(
        &mut registry,
        "prompt",
        ModuleInstance::Prompt(Arc::new(StaticPrompt("leaf".into()))),
    );
    let mut tools = ToolCatalog::new();
    tools
        .insert(ToolEntry::typed(Effect(dir.join("effects.log"))))
        .unwrap();
    install(&mut registry, "effects", ModuleInstance::ToolPack(tools));
    let limits = BudgetLimits {
        max_model_calls: Some(8),
        max_tool_calls: Some(8),
        max_child_calls: Some(16),
        ..Default::default()
    };
    let profile = Arc::new(
        GovernanceProfile::new(
            Arc::new(
                InstalledBudget::install(Arc::new(store.clone()), limits, "event-models", 1)
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
    let doc = json!({"entry":r("flow"),"host":{"name":"hook-flow"},"agents":[{"reference":r("leaf"),"definition":{"name":"leaf","model":model,"prompt":r("prompt"),"settings":{"scope_identity":"hashed_v1"}}}],"tool_runtimes":[{"reference":r("tools"),"definition":{"name":"effects","tool_packs":[r("effects")]}}],"workflows":[{"reference":r("flow"),"input_schema":{"type":"object"},"output_schema":{"type":"object"},"nodes":[
        {"id":"effect","input":{"from":"literal","value":{"committed":true}},"action":{"kind":"tool","runtime":r("tools"),"tool":"effect"}},
        {"id":"leaf","needs":["effect"],"input":{"from":"literal","value":"work"},"action":{"kind":"agent","agent":r("leaf")}},
        {"id":"decision","needs":["leaf"],"input":{"from":"literal","value":{"decision":"continue"}},"action":{"kind":"transform"}}
    ],"output":{"from":"node","node":"decision"}}]});
    let flow = compile_workflow(serde_json::from_value(doc).unwrap(), &registry).unwrap();
    let library = WorkflowLibrary::new(BTreeMap::from([("flow@1".into(), flow)])).unwrap();
    registry
        .register_factory(Arc::new(WorkflowHookFactory(library)))
        .unwrap();
    registry
        .define(ModuleDefinition {
            reference: r("flow-handler"),
            factory: "hook.workflow".into(),
            config: json!({"workflow":"flow@1"}),
            dependencies: BTreeMap::new(),
        })
        .unwrap();
    registry.define(ModuleDefinition{reference:r("flow-hook"),factory:"hook.subscription".into(),config:json!({"event":event.snapshot.definition.event,"priority":1,"timeout_ms":10000}),dependencies:BTreeMap::from([("handler".into(),r("flow-handler"))])}).unwrap();
    let patch = if !session {
        let handler = Arc::new(Recorder {
            path: dir.join("patch.log"),
            wait: None,
            decision: HookDecision::Patch {
                payload: json!({"value":8}),
            },
        });
        Some(install(
            &mut registry,
            "patch",
            ModuleInstance::Hook(Arc::new(
                HookRegistration::new(
                    "patch".into(),
                    event.snapshot.declaration.clone(),
                    HookRule {
                        event: event.snapshot.definition.event.clone(),
                        priority: -1,
                        timeout_ms: 10000,
                        failure: FailurePolicy::Closed,
                        matches: None,
                    },
                    handler,
                )
                .unwrap(),
            )),
        ))
    } else {
        None
    };
    let mut definition = event.snapshot.definition;
    if let Some(patch) = patch {
        definition.host.hooks.insert(0, patch);
    }
    definition.host.hooks.push(r("flow-hook"));
    definition.host.governance = vec![r("budget")];
    (
        registry.clone(),
        compile_event(definition, &registry).unwrap(),
        profile,
    )
}
#[tokio::test]
async fn owned_and_session_sources_route_explicit_model_retry_without_repeating_successful_peers() {
    for session in [false, true] {
        let temp = tempfile::tempdir().unwrap();
        let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
        let (registry, event, profile) = flow_setup(&store, temp.path(), session, None);
        let supervisor = RunSupervisor::new(store.clone());
        let program = CompiledProgram::for_event(&event).unwrap();
        supervisor
            .submit_program(super::durable::submit(&event, "root"))
            .await
            .unwrap();
        assert!(!matches!(
            supervisor.execute_submitted(&registry, "root").await,
            Ok(Some(RunOutcome::Completed { .. }))
        ));
        let target = store
            .children("root")
            .await
            .unwrap()
            .into_iter()
            .find(|c| c.agent_name == "leaf")
            .unwrap();
        assert_eq!(lines(&temp.path().join("requests.log")), 1);
        assert!(!matches!(
            supervisor.execute_submitted(&registry, "root").await,
            Ok(Some(RunOutcome::Completed { .. }))
        ));
        assert_eq!(lines(&temp.path().join("requests.log")), 1);
        let command = ModelRetryCommand {
            command_id: "event-retry".into(),
            ticket: supervisor
                .child_model_retry_ticket("root", &target.run_id)
                .await
                .unwrap()
                .unwrap(),
        };
        let reopened = RunSupervisor::new(SqliteStore::open(store.path()).unwrap());
        let outcome = reopened
            .control_program(
                &program,
                RunControlCommand::RetryModel(command.clone()),
                context(),
            )
            .await;
        assert!(
            matches!(&outcome, Ok(RunOutcome::Completed { .. })),
            "{session}: {outcome:?}"
        );
        let state = complete(outcome.unwrap());
        assert!(state.messages.is_empty());
        if !session {
            assert_eq!(
                serde_json::from_str::<Value>(&state.output).unwrap()["payload"],
                json!({"value":8})
            );
            assert_eq!(lines(&temp.path().join("patch.log")), 1);
        }
        complete(
            reopened
                .control_program(
                    &program,
                    RunControlCommand::RetryModel(command.clone()),
                    context(),
                )
                .await
                .unwrap(),
        );
        let mut wrong = command;
        wrong.command_id = "new-after-complete".into();
        assert!(
            reopened
                .control_program(&program, RunControlCommand::RetryModel(wrong), context())
                .await
                .is_err()
        );
        let requests = std::fs::read_to_string(temp.path().join("requests.log"))
            .unwrap()
            .lines()
            .map(|l| serde_json::from_str::<Value>(l).unwrap())
            .collect::<Vec<_>>();
        assert_eq!(requests.len(), 2);
        assert_eq!(requests[0], requests[1]);
        assert_eq!(lines(&temp.path().join("effects.log")), 1);
        assert_eq!(lines(&temp.path().join("prior.log")), 1);
        let summary = store
            .inspect(&BudgetScope {
                root_run_id: "root".into(),
                identity: profile.identity().into(),
            })
            .await
            .unwrap()
            .unwrap();
        assert_eq!(summary.used.model_calls, 2);
        assert_eq!(summary.active_children, 0);
    }
}
#[tokio::test]
async fn session_event_target_cancel_is_confirmed_on_the_original_controller_path() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let notify = Arc::new(tokio::sync::Notify::new());
    let (_, event, _) = flow_setup(&store, temp.path(), true, Some(notify.clone()));
    let program = CompiledProgram::for_event(&event).unwrap();
    let task = {
        let supervisor = RunSupervisor::new(store.clone());
        let program = program.clone();
        tokio::spawn(async move {
            supervisor
                .execute_program(&program, RunInput::default(), context())
                .await
        })
    };
    notify.notified().await;
    let target = store
        .children("root")
        .await
        .unwrap()
        .into_iter()
        .find(|c| c.agent_name == "leaf")
        .unwrap();
    let address = InputAddress {
        root_run_id: "root".into(),
        run_id: target.run_id,
        thread_id: target.thread_id,
        agent: target.agent_name,
    };
    let cursor = store.cancel(&address, "stop-leaf").await.unwrap();
    assert!(!matches!(
        task.await.unwrap(),
        Ok(RunOutcome::Completed { .. })
    ));
    let supervisor = RunSupervisor::new(store.clone());
    let outcome = supervisor
        .control_program(
            &program,
            RunControlCommand::ResumeChildCancel(ChildCancelResumeCommand {
                command_id: "resume-leaf".into(),
                address: address.clone(),
                through: cursor,
            }),
            context(),
        )
        .await;
    assert!(
        matches!(&outcome, Ok(RunOutcome::Completed { .. })),
        "{outcome:?}"
    );
    assert_eq!(lines(&temp.path().join("requests.log")), 2);
    assert_eq!(lines(&temp.path().join("effects.log")), 1);
    assert_eq!(lines(&temp.path().join("prior.log")), 1);
}
struct Deny;
#[async_trait::async_trait]
impl Policy for Deny {
    async fn admit(&self, _: &ToolCall, _: &RunState, _: &RunContext) -> Result<Admission, Error> {
        Ok(Admission::Deny("event host floor".into()))
    }
}
#[tokio::test]
async fn event_host_policy_remains_a_required_floor_inside_workflow_handlers() {
    let temp = tempfile::tempdir().unwrap();
    let store = SqliteStore::open(&temp.path().join("runtime.db")).unwrap();
    let (mut registry, event, _) = flow_setup(&store, temp.path(), false, None);
    let policy = install(
        &mut registry,
        "deny",
        ModuleInstance::Policy(Arc::new(Deny)),
    );
    let mut definition = event.snapshot.definition;
    definition.host.policies.push(policy);
    let event = compile_event(definition, &registry).unwrap();
    let program = CompiledProgram::for_event(&event).unwrap();
    let outcome = RunSupervisor::new(store)
        .execute_program(&program, RunInput::default(), context())
        .await;
    assert!(!matches!(outcome, Ok(RunOutcome::Completed { .. })));
    assert_eq!(lines(&temp.path().join("effects.log")), 0);
    assert_eq!(lines(&temp.path().join("requests.log")), 0);
}
#[tokio::test]
async fn retry_process_worker() {
    let Ok(directory) = std::env::var("NOFY_EVENT_RETRY_DIR") else {
        return;
    };
    let dir = PathBuf::from(directory);
    let phase = std::env::var("NOFY_EVENT_RETRY_PHASE").unwrap();
    let session = std::env::var("NOFY_EVENT_SESSION").unwrap() == "yes";
    let store = SqliteStore::open(&dir.join("runtime.db")).unwrap();
    let (registry, event, _) = flow_setup(&store, &dir, session, None);
    let program = CompiledProgram::for_event(&event).unwrap();
    let supervisor = RunSupervisor::new(store.clone());
    if phase == "first" {
        supervisor
            .submit_program(super::durable::submit(&event, "root"))
            .await
            .unwrap();
        assert!(!matches!(
            supervisor.execute_submitted(&registry, "root").await,
            Ok(Some(RunOutcome::Completed { .. }))
        ));
        assert_eq!(lines(&dir.join("requests.log")), 1);
        std::process::exit(97);
    }
    if phase == "retry" {
        let target = store
            .children("root")
            .await
            .unwrap()
            .into_iter()
            .find(|c| c.agent_name == "leaf")
            .unwrap();
        let command = ModelRetryCommand {
            command_id: "process-retry".into(),
            ticket: supervisor
                .child_model_retry_ticket("root", &target.run_id)
                .await
                .unwrap()
                .unwrap(),
        };
        complete(
            supervisor
                .control_program(&program, RunControlCommand::RetryModel(command), context())
                .await
                .unwrap(),
        );
    } else {
        complete(
            supervisor
                .execute_submitted(&ModuleRegistry::default(), "root")
                .await
                .unwrap()
                .unwrap(),
        );
    }
    assert_eq!(lines(&dir.join("requests.log")), 2);
    assert_eq!(lines(&dir.join("prior.log")), 1);
    assert_eq!(lines(&dir.join("effects.log")), 1);
}
#[test]
fn real_process_exit_preserves_owned_event_retry_and_original_peers() {
    for session in ["no", "yes"] {
        let temp = tempfile::tempdir().unwrap();
        for phase in ["first", "retry", "cached"] {
            let result = std::process::Command::new(std::env::current_exe().unwrap())
                .args(["--exact", "controls::retry_process_worker", "--nocapture"])
                .env("NOFY_EVENT_RETRY_DIR", temp.path())
                .env("NOFY_EVENT_RETRY_PHASE", phase)
                .env("NOFY_EVENT_SESSION", session)
                .output()
                .unwrap();
            assert_eq!(
                result.status.code(),
                Some(if phase == "first" { 97 } else { 0 }),
                "{session}/{phase}: {}{}",
                String::from_utf8_lossy(&result.stdout),
                String::from_utf8_lossy(&result.stderr)
            );
        }
    }
}
