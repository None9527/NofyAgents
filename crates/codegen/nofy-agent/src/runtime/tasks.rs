//! Read-only adapters over the canonical Nofy task resources. No second Todo
//! store is maintained by the modular runtime.
use nofy_agent_runtime::{
    Error, RunContext, RunState,
    recipe::{StageSource, tasks::TodoObservation},
    registry::*,
};
use nofy_tools::{
    bridge::ToolBridge,
    implementations::nofy_build::todo::{TodoState, TodoStatus},
    types::resources::State,
};
use serde_json::{Value, json};
use sha2::{Digest, Sha256};
use std::{collections::BTreeMap, sync::Arc};

#[derive(Default)]
pub struct TaskActivity {
    pub outstanding_agents: usize,
    pub goal_active: bool,
}
/// The host reads its real coordinator. This is deliberately separate from the
/// terminal backend; counting a task twice would incorrectly back an open Todo.
#[async_trait::async_trait]
pub trait TaskActivitySource: Send + Sync {
    fn identity(&self) -> &str;
    async fn snapshot(&self, context: &RunContext) -> Result<TaskActivity, Error>;
}
/// Explicit selection for hosts that do not run background agents or Goal mode.
pub struct NoTaskActivity;
#[async_trait::async_trait]
impl TaskActivitySource for NoTaskActivity {
    fn identity(&self) -> &str {
        "no-background-agents-or-goal:1"
    }
    async fn snapshot(&self, _: &RunContext) -> Result<TaskActivity, Error> {
        Ok(TaskActivity::default())
    }
}
pub struct NofyTodoSource {
    bridge: Arc<ToolBridge>,
    owner_thread: String,
    activity: Arc<dyn TaskActivitySource>,
    identity: String,
}
impl NofyTodoSource {
    pub fn new(
        bridge: Arc<ToolBridge>,
        owner_thread: String,
        revision: &str,
        activity: Arc<dyn TaskActivitySource>,
    ) -> Result<Self, Error> {
        if owner_thread.trim().is_empty()
            || revision.trim().is_empty()
            || activity.identity().trim().is_empty()
        {
            return Err(Error::Composition(
                "task source requires an owner and resource revisions".into(),
            ));
        }
        let identity = format!(
            "nofy-todo:{:x}",
            Sha256::digest(
                serde_json::to_vec(&(&owner_thread, revision, activity.identity()))
                    .map_err(|e| Error::Composition(e.to_string()))?
            )
        );
        Ok(Self {
            bridge,
            owner_thread,
            activity,
            identity,
        })
    }
}
#[async_trait::async_trait]
impl StageSource for NofyTodoSource {
    fn identity(&self) -> &str {
        &self.identity
    }
    async fn snapshot(&self, _: &RunState, context: &RunContext) -> Result<Value, Error> {
        if context.thread_id != self.owner_thread {
            return Err(Error::Composition(
                "task source belongs to another thread".into(),
            ));
        }
        let todos = match self.bridge.read_resource::<State<TodoState>>().await {
            Some(todos) => todos,
            None if self
                .bridge
                .tool_for_kind(nofy_tools::types::tool::ToolKind::Plan)
                .await
                .is_some() =>
            {
                State(TodoState::default())
            }
            None => {
                return Err(Error::Composition(
                    "canonical Todo resource is not installed".into(),
                ));
            }
        };
        let activity = self.activity.snapshot(context).await?;
        let terminal = self
            .bridge
            .list_background_tasks()
            .await
            .into_iter()
            .filter(nofy_tools::computer::types::TaskSnapshot::is_outstanding)
            .count();
        let mut observation = TodoObservation {
            backing_tasks: activity.outstanding_agents.saturating_add(terminal),
            goal_active: activity.goal_active,
            ..Default::default()
        };
        for (_, todo) in todos.0.todo_items_with_ids() {
            match todo.status {
                TodoStatus::Pending => observation.pending.push(todo.content.clone()),
                TodoStatus::InProgress => observation.in_progress.push(todo.content.clone()),
                TodoStatus::Completed | TodoStatus::Cancelled => {}
            }
        }
        serde_json::to_value(observation).map_err(|e| Error::Composition(e.to_string()))
    }
}
pub struct TodoSourceFactory {
    sources: BTreeMap<String, Arc<NofyTodoSource>>,
    revision: String,
}
impl TodoSourceFactory {
    pub fn new(sources: BTreeMap<String, Arc<NofyTodoSource>>) -> Self {
        let identities = sources
            .iter()
            .map(|(name, source)| (name, source.identity()))
            .collect::<BTreeMap<_, _>>();
        let revision = format!(
            "1:{:x}",
            Sha256::digest(serde_json::to_vec(&identities).expect("source identities"))
        );
        Self { sources, revision }
    }
}
impl ModuleFactory for TodoSourceFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "source.nofy_todo".into(),
            revision: self.revision.clone(),
            kind: ModuleKind::StageSource,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["source"],"properties":{"source":{"type":"string","enum":self.sources.keys().collect::<Vec<_>>()}}}),
            input_schema: None,
            output_schema: None,
            dependencies: Default::default(),
            required_capabilities: Default::default(),
        }
    }
    fn build(
        &self,
        config: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        #[derive(serde::Deserialize)]
        #[serde(deny_unknown_fields)]
        struct Config {
            source: String,
        }
        let config: Config = serde_json::from_value(config.clone())
            .map_err(|e| Error::Composition(e.to_string()))?;
        let source = self
            .sources
            .get(&config.source)
            .ok_or_else(|| Error::Composition("task source is not installed".into()))?;
        Ok(ModuleInstance::StageSource(source.clone()))
    }
}
