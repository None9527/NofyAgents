use super::*;
use crate::{
    AgentBuilder, Components, InMemoryCheckpointer, Message, Model, ModelRequest, ModelResponse,
    StaticPrompt, ToolCall, ToolEntry,
};
use nofy_tool_runtime::{ListToolsContext, Tool};
use nofy_tool_types::ToolDescription;
use std::sync::atomic::AtomicBool;
use std::sync::atomic::{AtomicUsize, Ordering};

struct Effect {
    count: Arc<AtomicUsize>,
    barrier: Arc<tokio::sync::Barrier>,
}
// Deterministic protocol fixture; actual provider acceptance is tested separately.
struct EffectDriver;
struct SpawnDriver;
#[async_trait::async_trait]
impl Model for SpawnDriver {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        Ok(
            if matches!(request.messages.last(), Some(Message::Tool { .. })) {
                ModelResponse {
                    output: "parent complete".into(),
                    ..Default::default()
                }
            } else {
                ModelResponse {
                    tool_calls: vec![ToolCall {
                        id: "spawn".into(),
                        name: "agent_tasks".into(),
                        arguments: json!({"action":"spawn","task_id":"one","tool":"child","arguments":{"prompt":"effect"}}),
                    }],
                    ..Default::default()
                }
            },
        )
    }
}
struct Approval(Arc<AtomicBool>);
#[async_trait::async_trait]
impl crate::Policy for Approval {
    async fn admit(
        &self,
        _: &ToolCall,
        _: &RunState,
        _: &RunContext,
    ) -> Result<crate::Admission, Error> {
        Ok(if self.0.load(Ordering::SeqCst) {
            crate::Admission::Allow
        } else {
            crate::Admission::Pause(json!({"kind":"approval-required"}))
        })
    }
}
struct DriverBinding(Drivers);
impl crate::context::ContextBinding for DriverBinding {
    fn bind(&self, context: &mut RunContext) -> Result<(), Error> {
        context.capabilities.insert(self.0.clone());
        Ok(())
    }
}
#[tokio::test]
async fn parent_join_pauses_and_explicit_resume_finishes_child_once() {
    use crate::registry::{ModuleFactory, ModuleInstance};
    let count = Arc::new(AtomicUsize::new(0));
    let barrier = Arc::new(tokio::sync::Barrier::new(2));
    let allowed = Arc::new(AtomicBool::new(false));
    let mut components = Components::default();
    components
        .models
        .insert("effect".into(), Arc::new(EffectDriver));
    components
        .models
        .insert("spawn".into(), Arc::new(SpawnDriver));
    components
        .prompts
        .insert("prompt".into(), Arc::new(StaticPrompt("execute".into())));
    components
        .policies
        .insert("approval".into(), Arc::new(Approval(allowed.clone())));
    let mut effects = ToolCatalog::new();
    effects
        .insert(ToolEntry::typed(Effect {
            count: count.clone(),
            barrier: barrier.clone(),
        }))
        .unwrap();
    components.tool_packs.insert("effects".into(), effects);
    let child = AgentBuilder::new("child")
        .model("effect")
        .prompt("prompt")
        .tools("effects")
        .policy("approval")
        .compile(&components)
        .unwrap();
    let mut children = ToolCatalog::new();
    children.insert(child.as_tool("child", "child")).unwrap();
    let resource = declarative::TasksResourceFactory
        .build(
            &json!({}),
            &BTreeMap::from([(
                "children".into(),
                ModuleInstance::ToolPack(children.clone()),
            )]),
        )
        .unwrap();
    let ModuleInstance::ToolPack(tasks) = declarative::TasksToolFactory
        .build(&json!({}), &BTreeMap::from([("tasks".into(), resource)]))
        .unwrap()
    else {
        panic!("tasks")
    };
    components.tool_packs.insert("tasks".into(), tasks);
    let parent = AgentBuilder::new("parent")
        .model("spawn")
        .prompt("prompt")
        .tools("tasks")
        .compile(&components)
        .unwrap()
        .with_binding("tasks", Arc::new(DriverBinding(Drivers(children))))
        .with_checkpointer(Arc::new(InMemoryCheckpointer::default()));
    let context = RunContext::new("parent", "root");
    let outcome = parent
        .invoke(crate::RunInput::new("run"), context.clone())
        .await
        .unwrap();
    assert!(
        matches!(outcome, crate::RunOutcome::Paused { .. }),
        "{outcome:?}"
    );
    assert_eq!(count.load(Ordering::SeqCst), 0);
    allowed.store(true, Ordering::SeqCst);
    let resumed =
        tokio::spawn(async move { parent.invoke(crate::RunInput::resume(), context).await });
    tokio::time::timeout(std::time::Duration::from_secs(5), barrier.wait())
        .await
        .unwrap();
    assert!(matches!(
        resumed.await.unwrap().unwrap(),
        crate::RunOutcome::Completed { .. }
    ));
    assert_eq!(count.load(Ordering::SeqCst), 1);
}
#[async_trait::async_trait]
impl Model for EffectDriver {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        Ok(
            if matches!(request.messages.last(), Some(Message::Tool { .. })) {
                ModelResponse {
                    output: "done".into(),
                    ..Default::default()
                }
            } else {
                ModelResponse {
                    tool_calls: vec![ToolCall {
                        id: "effect".into(),
                        name: "effect".into(),
                        arguments: json!({}),
                    }],
                    ..Default::default()
                }
            },
        )
    }
}
impl Tool for Effect {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("effect").unwrap()
    }
    fn description(&self, _: &ListToolsContext) -> ToolDescription {
        ToolDescription::new("effect", "Count a real effect after concurrent admission")
    }
    async fn run(
        &self,
        _: ToolCallContext,
        _: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        self.barrier.wait().await;
        Ok(json!({"count":self.count.fetch_add(1, Ordering::SeqCst) + 1}))
    }
}
#[tokio::test]
async fn asynchronous_children_run_concurrently_and_recovery_keeps_receipts() {
    let count = Arc::new(AtomicUsize::new(0));
    let barrier = Arc::new(tokio::sync::Barrier::new(3));
    let mut components = Components::default();
    components
        .models
        .insert("driver".into(), Arc::new(EffectDriver));
    components.prompts.insert(
        "prompt".into(),
        Arc::new(StaticPrompt("execute effect".into())),
    );
    let mut effects = ToolCatalog::new();
    effects
        .insert(ToolEntry::typed(Effect {
            count: count.clone(),
            barrier: barrier.clone(),
        }))
        .unwrap();
    components.tool_packs.insert("effects".into(), effects);
    let program = AgentBuilder::new("child")
        .model("driver")
        .prompt("prompt")
        .tools("effects")
        .compile(&components)
        .unwrap();
    let mut children = ToolCatalog::new();
    children
        .insert(program.as_tool("child", "Run child"))
        .unwrap();
    let store: Arc<dyn Checkpointer> = Arc::new(InMemoryCheckpointer::default());
    let mut context = RunContext::new("parent-thread", "parent-run");
    context.capabilities.insert(Drivers(children));
    let (scope, owner) = Scope::open(&context, Some(store.clone()), "parent")
        .await
        .unwrap();
    let one = crate::tools::call_context("spawn-one", &context).unwrap();
    let two = crate::tools::call_context("spawn-two", &context).unwrap();
    scope
        .spawn("one", "child", json!({"prompt":"a"}), &one)
        .await
        .unwrap();
    scope
        .spawn("two", "child", json!({"prompt":"b"}), &two)
        .await
        .unwrap();
    if tokio::time::timeout(std::time::Duration::from_secs(5), barrier.wait())
        .await
        .is_err()
    {
        panic!(
            "children failed before the concurrency barrier: {}",
            scope.peek(None).await.unwrap()
        );
    }
    tokio::time::timeout(std::time::Duration::from_secs(5), scope.finish())
        .await
        .unwrap()
        .unwrap();
    assert_eq!(count.load(Ordering::SeqCst), 2);
    assert_eq!(
        scope.read(Some("one"), 0).await.unwrap()["status"],
        "completed"
    );
    assert!(
        scope
            .spawn("one", "child", json!({"prompt":"changed"}), &one)
            .await
            .is_err()
    );
    owner.shutdown().await;
    let (restored, restored_owner) = Scope::open(&context, Some(store), "parent").await.unwrap();
    restored.recover().await.unwrap();
    restored.finish().await.unwrap();
    assert_eq!(count.load(Ordering::SeqCst), 2);
    restored_owner.shutdown().await;
}
#[tokio::test]
async fn message_board_persists_idempotence_and_filters_recipients() {
    let store: Arc<dyn Checkpointer> = Arc::new(InMemoryCheckpointer::default());
    let parent = RunContext::new("thread", "root");
    let board = Board::open(&parent, Some(store.clone()), "root-composition")
        .await
        .unwrap();
    let child = RunContext::new("child-thread", "child");
    board
        .send(&parent, "direct", "child", json!({"task":"inspect"}))
        .await
        .unwrap();
    board
        .send(&parent, "direct", "child", json!({"task":"inspect"}))
        .await
        .unwrap();
    assert!(
        board
            .send(&parent, "direct", "other", json!({}))
            .await
            .is_err()
    );
    assert_eq!(
        board.read(&child, 0, 0).await.unwrap()["messages"]
            .as_array()
            .unwrap()
            .len(),
        1
    );
    assert_eq!(
        board
            .read(&RunContext::new("t", "other"), 0, 0)
            .await
            .unwrap()["messages"],
        json!([])
    );
    let restored = Board::open(&parent, Some(store), "root-composition")
        .await
        .unwrap();
    assert_eq!(restored.read(&child, 0, 0).await.unwrap()["next_cursor"], 1);
    let unrelated = Board::open(
        &RunContext::new("other-thread", "other-root"),
        None,
        "root-composition",
    )
    .await
    .unwrap();
    assert_eq!(
        unrelated.read(&child, 0, 0).await.unwrap()["messages"],
        json!([])
    );
}
