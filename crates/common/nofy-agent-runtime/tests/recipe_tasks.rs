use nofy_agent_runtime::{
    recipe::{tasks::*, *},
    registry::*,
    *,
};
use serde_json::{Value, json};
use std::sync::{
    Arc, Mutex,
    atomic::{AtomicBool, AtomicUsize, Ordering},
};

struct Finish {
    calls: Arc<AtomicUsize>,
    info: CompletionInfo,
}
#[async_trait::async_trait]
impl Model for Finish {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.calls.fetch_add(1, Ordering::SeqCst);
        for message in &request.messages {
            if let Message::User { content } = message {
                assert!(!content.contains("tools.by_kind.plan"));
            }
        }
        Ok(ModelResponse {
            output: "done".into(),
            info: self.info.clone(),
            ..Default::default()
        })
    }
}
struct Snapshot {
    value: Value,
    reads: Arc<Mutex<Vec<usize>>>,
    models: Arc<AtomicUsize>,
}
#[async_trait::async_trait]
impl StageSource for Snapshot {
    fn identity(&self) -> &str {
        "tasks:1"
    }
    async fn snapshot(&self, _: &RunState, _: &RunContext) -> Result<Value, Error> {
        self.reads
            .lock()
            .unwrap()
            .push(self.models.load(Ordering::SeqCst));
        Ok(self.value.clone())
    }
}
fn context() -> RunContext {
    RunContext::new("thread", "run")
}
fn agent(model: Arc<AtomicUsize>, info: CompletionInfo, source: Arc<dyn StageSource>) -> Agent {
    let mut components = Components::default();
    components
        .models
        .insert("m".into(), Arc::new(Finish { calls: model, info }));
    components
        .prompts
        .insert("p".into(), Arc::new(StaticPrompt("tasks".into())));
    AgentBuilder::new("task-test")
        .model("m")
        .prompt("p")
        .compile(&components)
        .unwrap()
        .with_recipe(Arc::new(
            RuntimeRecipe::new(
                "task-recipe-1",
                vec![StageBinding {
                    name: "todo".into(),
                    at: Boundary::BeforeStop,
                    stage: Arc::new(
                        TodoStage::new(TodoConfig {
                            plan_tool: "update_plan".into(),
                            ..Default::default()
                        })
                        .unwrap(),
                    ),
                }],
            )
            .unwrap()
            .with_source("todo", source)
            .unwrap(),
        ))
        .unwrap()
}
#[tokio::test]
async fn task_observations_use_original_backing_partition_and_bounded_continuation() {
    for (value, info, expected) in [
        (
            json!({"pending":["finish work"]}),
            CompletionInfo::default(),
            3,
        ),
        (
            json!({"in_progress":["backed"],"backing_tasks":1}),
            CompletionInfo::default(),
            1,
        ),
        (
            json!({"in_progress":["backed","unbacked"],"backing_tasks":1}),
            CompletionInfo::default(),
            3,
        ),
        (
            json!({"pending":["work"],"goal_active":true}),
            CompletionInfo::default(),
            1,
        ),
        (
            json!({"pending":["work"]}),
            CompletionInfo {
                refusal: Some("declined".into()),
                ..Default::default()
            },
            1,
        ),
        (
            json!({"pending":["work"]}),
            CompletionInfo {
                structured_output: Some(json!({"ok":true})),
                ..Default::default()
            },
            1,
        ),
    ] {
        let models = Arc::new(AtomicUsize::new(0));
        let source = Arc::new(Snapshot {
            value,
            reads: Default::default(),
            models: models.clone(),
        });
        assert!(matches!(
            agent(models.clone(), info, source)
                .invoke(RunInput::new("go"), context())
                .await
                .unwrap(),
            RunOutcome::Completed { .. }
        ));
        assert_eq!(models.load(Ordering::SeqCst), expected);
    }
}
struct LostDecision {
    inner: InMemoryCheckpointer,
    failed: AtomicBool,
}
#[async_trait::async_trait]
impl Checkpointer for LostDecision {
    async fn load(&self, key: &str) -> Result<Option<Checkpoint>, Error> {
        self.inner.load(key).await
    }
    async fn save(&self, key: &str, expected: Option<u64>, row: Checkpoint) -> Result<(), Error> {
        if row.state.recipe_progress.stage_data("todo").is_some()
            && !self.failed.swap(true, Ordering::SeqCst)
        {
            return Err(Error::Checkpoint("lost decision commit".into()));
        }
        self.inner.save(key, expected, row).await
    }
}
#[tokio::test]
async fn a_saved_observation_is_reused_after_losing_the_decision_commit() {
    let models = Arc::new(AtomicUsize::new(0));
    let reads = Arc::new(Mutex::new(Vec::new()));
    let source = Arc::new(Snapshot {
        value: json!({"pending":["work"]}),
        reads: reads.clone(),
        models: models.clone(),
    });
    let store = Arc::new(LostDecision {
        inner: Default::default(),
        failed: AtomicBool::new(false),
    });
    let agent = agent(models.clone(), Default::default(), source).with_checkpointer(store);
    assert!(matches!(
        agent.invoke(RunInput::new("go"), context()).await,
        Err(Error::Checkpoint(_))
    ));
    assert_eq!(*reads.lock().unwrap(), vec![1]);
    let RunOutcome::Completed { state, .. } =
        agent.invoke(RunInput::resume(), context()).await.unwrap()
    else {
        panic!("complete")
    };
    assert_eq!(*reads.lock().unwrap(), vec![1, 2, 3]);
    assert_eq!(
        state.recipe_progress.stage_data("todo").unwrap()["fires"],
        2
    );
}
struct Approval(Arc<AtomicBool>);
#[async_trait::async_trait]
impl StageSource for Approval {
    fn identity(&self) -> &str {
        "approval:1"
    }
    async fn snapshot(&self, _: &RunState, _: &RunContext) -> Result<Value, Error> {
        Ok(json!(self.0.load(Ordering::SeqCst)))
    }
}
struct Approve;
impl AgentStage for Approve {
    fn evaluate(&self, input: &StageInput<'_>, _: &RunContext) -> Result<StageEffect, Error> {
        Ok(StageEffect {
            action: if input.observation == Some(&json!(true)) {
                StageAction::Next
            } else {
                StageAction::Pause {
                    reason: json!({"kind":"task_pause"}),
                }
            },
            ..Default::default()
        })
    }
}
#[tokio::test]
async fn explicit_resume_refreshes_a_paused_read_only_observation() {
    let approved = Arc::new(AtomicBool::new(false));
    let models = Arc::new(AtomicUsize::new(0));
    let mut components = Components::default();
    components.models.insert(
        "m".into(),
        Arc::new(Finish {
            calls: models.clone(),
            info: Default::default(),
        }),
    );
    components
        .prompts
        .insert("p".into(), Arc::new(StaticPrompt("p".into())));
    let recipe = RuntimeRecipe::new(
        "approval-recipe",
        vec![StageBinding {
            name: "approval".into(),
            at: Boundary::BeforeStop,
            stage: Arc::new(Approve),
        }],
    )
    .unwrap()
    .with_source("approval", Arc::new(Approval(approved.clone())))
    .unwrap();
    let agent = AgentBuilder::new("approval")
        .model("m")
        .prompt("p")
        .compile(&components)
        .unwrap()
        .with_recipe(Arc::new(recipe))
        .unwrap()
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    assert!(matches!(
        agent.invoke(RunInput::new("go"), context()).await.unwrap(),
        RunOutcome::Paused { .. }
    ));
    approved.store(true, Ordering::SeqCst);
    assert!(matches!(
        agent.invoke(RunInput::resume(), context()).await.unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(models.load(Ordering::SeqCst), 1);
}
struct Waiting {
    started: Arc<tokio::sync::Notify>,
    timeout: u64,
}
#[async_trait::async_trait]
impl StageSource for Waiting {
    fn identity(&self) -> &str {
        "waiting:1"
    }
    fn timeout_ms(&self) -> u64 {
        self.timeout
    }
    async fn snapshot(&self, _: &RunState, _: &RunContext) -> Result<Value, Error> {
        self.started.notify_one();
        std::future::pending().await
    }
}
#[tokio::test]
async fn observation_waits_are_cancelled_and_time_bounded() {
    let started = Arc::new(tokio::sync::Notify::new());
    let c = context();
    let cancel = c.cancel.clone();
    let agent = agent(
        Default::default(),
        Default::default(),
        Arc::new(Waiting {
            started: started.clone(),
            timeout: 5000,
        }),
    );
    let (result, ()) = tokio::join!(agent.invoke(RunInput::new("go"), c), async {
        started.notified().await;
        cancel.cancel();
    });
    assert!(matches!(result.unwrap(), RunOutcome::Cancelled { .. }));
    let agent = crate_agent_for_timeout();
    assert!(
        matches!(agent.invoke(RunInput::new("go"),context()).await,Err(Error::Composition(message)) if message.contains("timed out"))
    );
}
fn crate_agent_for_timeout() -> Agent {
    agent(
        Default::default(),
        Default::default(),
        Arc::new(Waiting {
            started: Default::default(),
            timeout: 10,
        }),
    )
}
#[tokio::test]
async fn source_dependencies_are_typed_and_snapshotted_without_reading_during_compile() {
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(TodoStageFactory))
        .unwrap();
    registry.register_factory(Arc::new(RecipeFactory)).unwrap();
    let models = Arc::new(AtomicUsize::new(0));
    let reads = Arc::new(Mutex::new(Vec::new()));
    for (id, instance) in [
        (
            "m",
            ModuleInstance::Model(Arc::new(Finish {
                calls: models.clone(),
                info: Default::default(),
            })),
        ),
        (
            "p",
            ModuleInstance::Prompt(Arc::new(StaticPrompt("p".into()))),
        ),
        (
            "source",
            ModuleInstance::StageSource(Arc::new(Snapshot {
                value: json!({}),
                reads: reads.clone(),
                models,
            })),
        ),
    ] {
        registry
            .register_factory(Arc::new(InstanceFactory::new(id, "1", instance)))
            .unwrap();
    }
    let document = json!({"modules":[
        {"reference":{"id":"m","version":"1"},"factory":"m","config":{}},
        {"reference":{"id":"p","version":"1"},"factory":"p","config":{}},
        {"reference":{"id":"source","version":"1"},"factory":"source","config":{}},
        {"reference":{"id":"todo","version":"1"},"factory":"stage.todo","config":{}},
        {"reference":{"id":"recipe","version":"1"},"factory":"runtime.recipe","config":{"stages":[{"name":"todo","at":"before_stop","stage":"decision","source":"observation"}]},"dependencies":{"decision":{"id":"todo","version":"1"},"observation":{"id":"source","version":"1"}}}
    ],"agent":{"name":"task","model":{"id":"m","version":"1"},"prompt":{"id":"p","version":"1"},"recipe":{"id":"recipe","version":"1"}}});
    let compiled =
        compile::compile_document(serde_json::from_value(document.clone()).unwrap(), &registry)
            .unwrap();
    assert!(reads.lock().unwrap().is_empty());
    let restored = compiled.snapshot.restore(&registry).unwrap();
    assert!(matches!(
        restored
            .agent
            .invoke(RunInput::new("go"), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    let mut wrong = document;
    wrong["modules"][4]["dependencies"]["observation"] = json!({"id":"p","version":"1"});
    assert!(compile::compile_document(serde_json::from_value(wrong).unwrap(), &registry).is_err());
    assert!(RecipeFactory.config_dependencies(&json!({"stages":[{"name":"todo","at":"before_stop","stage":"same","source":"same"}]})).is_err());
}
