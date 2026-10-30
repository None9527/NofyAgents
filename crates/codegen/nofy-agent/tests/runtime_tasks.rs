use nofy_agent::runtime::{tasks::*, tool_catalog_durable};
use nofy_agent_runtime::{
    recipe::{tasks::*, *},
    registry::*,
    *,
};
use nofy_tools::{
    computer::local::LocalTerminalBackend,
    implementations::nofy_build::todo::{TodoState, TodoStatus},
    notification::ToolNotificationHandle,
    types::resources::State,
};
use serde_json::json;
use std::{
    collections::BTreeMap,
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
    },
};

async fn legacy(root: &std::path::Path) -> nofy_agent::Agent {
    nofy_agent::AgentBuilder::new(
        root.to_owned(),
        Arc::new(LocalTerminalBackend::new()),
        ToolNotificationHandle::noop(),
    )
    .with_tools(vec!["todo_write".into()])
    .with_preloaded_skills(vec![])
    .with_agents_md(false)
    .with_memory_enabled(false)
    .with_state_path(root.join("tool-state.json"))
    .build()
    .await
    .unwrap()
}
struct FinishWork(Arc<AtomicUsize>);
#[async_trait::async_trait]
impl Model for FinishWork {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        let call = self.0.fetch_add(1, Ordering::SeqCst);
        Ok(if call == 1 {
            assert!(request.messages.iter().any(|message|matches!(message,Message::User {content} if content.contains("outstanding todos")&&content.contains("todo_write")&&!content.contains("tools.by_kind.plan"))));
            ModelResponse {
                tool_calls: vec![ToolCall {
                    id: "complete-work".into(),
                    name: "todo_write".into(),
                    arguments: json!({"merge":true,"todos":[{"id":"work","status":"completed"}]}),
                }],
                ..Default::default()
            }
        } else {
            ModelResponse {
                output: "done".into(),
                ..Default::default()
            }
        })
    }
}
#[tokio::test]
async fn task_recipe_reads_the_original_todo_tool_state_and_observes_real_tool_updates() {
    let root = tempfile::tempdir().unwrap();
    let legacy = legacy(root.path()).await;
    let bridge = legacy.tool_bridge().clone();
    let source = Arc::new(
        NofyTodoSource::new(
            bridge.clone(),
            "thread".into(),
            "tools-1",
            Arc::new(NoTaskActivity),
        )
        .unwrap(),
    );
    let c = RunContext::new("thread", "run");
    assert_eq!(
        source.snapshot(&RunState::default(), &c).await.unwrap()["pending"],
        json!([])
    );
    bridge
        .call(
            "todo_write",
            json!({"todos":[{"id":"work","content":"finish real work","status":"pending"}]}),
            "seed",
        )
        .await
        .unwrap();
    let factory = TodoSourceFactory::new(BTreeMap::from([("actual-tools".into(), source.clone())]));
    let ModuleInstance::StageSource(bound) = factory
        .build(&json!({"source":"actual-tools"}), &BTreeMap::new())
        .unwrap()
    else {
        panic!("source")
    };
    assert!(
        factory
            .build(&json!({"source":"other"}), &BTreeMap::new())
            .is_err()
    );
    assert_eq!(
        bound.snapshot(&RunState::default(), &c).await.unwrap()["pending"],
        json!(["finish real work"])
    );
    assert!(
        bound
            .snapshot(
                &RunState::default(),
                &RunContext::new("other-thread", "run")
            )
            .await
            .is_err()
    );
    let calls = Arc::new(AtomicUsize::new(0));
    let mut components = Components::default();
    components
        .models
        .insert("m".into(), Arc::new(FinishWork(calls.clone())));
    components.prompts.insert(
        "p".into(),
        Arc::new(StaticPrompt("complete the work".into())),
    );
    let native = tool_catalog_durable(&legacy).await.unwrap();
    let mut tools = ToolCatalog::new();
    tools
        .insert(native.get("todo_write").unwrap().clone())
        .unwrap();
    components.tool_packs.insert("tools".into(), tools);
    let recipe = RuntimeRecipe::new(
        "todo-recipe-1",
        vec![StageBinding {
            name: "todo".into(),
            at: Boundary::BeforeStop,
            stage: Arc::new(
                TodoStage::new(TodoConfig {
                    plan_tool: "todo_write".into(),
                    ..Default::default()
                })
                .unwrap(),
            ),
        }],
    )
    .unwrap()
    .with_source("todo", bound)
    .unwrap();
    let agent = AgentBuilder::new("tasks")
        .model("m")
        .prompt("p")
        .tools("tools")
        .compile(&components)
        .unwrap()
        .with_recipe(Arc::new(recipe))
        .unwrap()
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    let RunOutcome::Completed { state, .. } = agent
        .invoke(RunInput::new("work"), c.clone())
        .await
        .unwrap()
    else {
        panic!("complete")
    };
    assert_eq!(calls.load(Ordering::SeqCst), 3);
    assert_eq!(
        state.recipe_progress.stage_data("todo").unwrap()["fires"],
        1
    );
    assert_eq!(
        bridge
            .read_resource::<State<TodoState>>()
            .await
            .unwrap()
            .0
            .todo_items()
            .next()
            .unwrap()
            .status,
        TodoStatus::Completed
    );
    assert_eq!(
        source.snapshot(&state, &c).await.unwrap()["pending"],
        json!([])
    );
    // Rebuild the actual legacy tool store from its original persisted format.
    let reopened = crate::legacy(root.path()).await;
    assert_eq!(
        reopened
            .tool_bridge()
            .read_resource::<State<TodoState>>()
            .await
            .unwrap()
            .0
            .todo_items()
            .next()
            .unwrap()
            .status,
        TodoStatus::Completed
    );
}
struct Activity;
#[async_trait::async_trait]
impl TaskActivitySource for Activity {
    fn identity(&self) -> &str {
        "real-coordinator-1"
    }
    async fn snapshot(&self, _: &RunContext) -> Result<TaskActivity, Error> {
        Ok(TaskActivity {
            outstanding_agents: 1,
            goal_active: true,
        })
    }
}
#[tokio::test]
async fn canonical_todo_order_and_host_activity_are_preserved_without_copying_state() {
    let root = tempfile::tempdir().unwrap();
    let legacy = legacy(root.path()).await;
    let bridge = legacy.tool_bridge().clone();
    bridge.call("todo_write",json!({"todos":[{"id":"a","content":"first","status":"in_progress"},{"id":"b","content":"second","status":"in_progress"},{"id":"c","content":"pending","status":"pending"}]}),"seed").await.unwrap();
    let source =
        NofyTodoSource::new(bridge, "thread".into(), "tools-1", Arc::new(Activity)).unwrap();
    let value = source
        .snapshot(&Default::default(), &RunContext::new("thread", "run"))
        .await
        .unwrap();
    assert_eq!(value["in_progress"], json!(["first", "second"]));
    assert_eq!(value["backing_tasks"], 1);
    assert_eq!(value["goal_active"], true);
}

#[tokio::test]
async fn durable_native_tool_reports_resource_write_failure_instead_of_a_success_receipt() {
    let root = tempfile::tempdir().unwrap();
    let legacy = legacy(root.path()).await;
    let bridge = legacy.tool_bridge().clone();
    bridge
        .call(
            "todo_write",
            json!({"todos":[{"id":"work","content":"work","status":"pending"}]}),
            "seed",
        )
        .await
        .unwrap();
    bridge
        .toolset()
        .save_and_flush_persistence_checked()
        .await
        .unwrap();
    let path = root.path().join("resources_state.json.tmp");
    std::fs::create_dir(&path).unwrap();
    let calls = Arc::new(AtomicUsize::new(1));
    let mut components = Components::default();
    components
        .models
        .insert("m".into(), Arc::new(FinishWork(calls)));
    components
        .prompts
        .insert("p".into(), Arc::new(StaticPrompt("p".into())));
    components
        .tool_packs
        .insert("t".into(), tool_catalog_durable(&legacy).await.unwrap());
    // This model's second call is the tool dispatch; provide the real reminder
    // in its initial user input to satisfy the same scripted model assertion.
    let agent = AgentBuilder::new("persist-failure")
        .model("m")
        .prompt("p")
        .tools("t")
        .compile(&components)
        .unwrap();
    let RunOutcome::Completed { state, .. } = agent
        .invoke(
            RunInput::new("outstanding todos: todo_write"),
            RunContext::new("thread", "run"),
        )
        .await
        .unwrap()
    else {
        panic!("complete")
    };
    assert!(state.messages.iter().any(|message|matches!(message,Message::Tool {content,is_error:true,..} if content.to_string().contains("not confirmed durable"))));
    assert_eq!(
        bridge
            .read_resource::<State<TodoState>>()
            .await
            .unwrap()
            .0
            .todo_items()
            .next()
            .unwrap()
            .status,
        TodoStatus::Completed
    );
}
