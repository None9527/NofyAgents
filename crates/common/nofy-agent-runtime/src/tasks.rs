//! Structured asynchronous children. The invocation owner outlives every child
//! and is dropped before the supervisor releases its root fence.
pub mod declarative;
mod journal;
mod messages;
#[cfg(test)]
mod tests;
use crate::composition::{ChildControl, ChildOutcome, ParentCheckpointer};
use crate::{Checkpointer, Error, RunContext, RunState, ToolCatalog};
use futures::{FutureExt, StreamExt};
use journal::Journal;
pub(crate) use messages::Board;
use nofy_tool_runtime::{ToolCallContext, ToolStreamItem};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    sync::{Arc, Mutex, Weak},
};
use tokio::{
    sync::{Mutex as AsyncMutex, Notify},
    task::JoinSet,
};
use tokio_util::sync::CancellationToken;

#[derive(Clone)]
pub(crate) struct Drivers(pub ToolCatalog);
#[derive(Clone, Default, Serialize, Deserialize)]
struct Ledger {
    tasks: BTreeMap<String, Task>,
}
#[derive(Clone, Serialize, Deserialize)]
struct Task {
    tool: String,
    arguments: Value,
    call_id: String,
    state: RunState,
    identity: String,
    outcome: Option<TaskOutcome>,
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(tag = "status", content = "result", rename_all = "snake_case")]
enum TaskOutcome {
    Completed(Value),
    Failed(String),
    Paused(Value),
    Cancelled,
    BudgetExceeded,
    Checkpoint(String),
}
struct Shared {
    journal: AsyncMutex<Journal<Ledger>>,
    notify: Notify,
}
/// Only the invocation owns this value. Task futures never hold it strongly.
pub(crate) struct Owner {
    tasks: Mutex<JoinSet<()>>,
    cancels: Mutex<BTreeMap<String, CancellationToken>>,
    failure: Arc<Mutex<Option<String>>>,
}
impl Owner {
    pub async fn shutdown(&self) {
        let mut tasks = std::mem::take(&mut *self.tasks.lock().expect("task owner lock"));
        tasks.abort_all();
        while tasks.join_next().await.is_some() {}
    }
}
#[derive(Clone)]
pub(crate) struct Scope {
    shared: Arc<Shared>,
    owner: Weak<Owner>,
    drivers: ToolCatalog,
    context: RunContext,
    store: Option<Arc<dyn Checkpointer>>,
}
impl Scope {
    pub async fn open(
        context: &RunContext,
        store: Option<Arc<dyn Checkpointer>>,
        composition: &str,
    ) -> Result<(Self, Arc<Owner>), Error> {
        let journal = Journal::open(
            store.clone(),
            serde_json::to_string(&("agent-tasks/v1", &context.thread_id, &context.run_id))
                .expect("task key"),
            composition.into(),
        )
        .await?;
        let owner = Arc::new(Owner {
            tasks: Mutex::new(JoinSet::new()),
            cancels: Mutex::new(BTreeMap::new()),
            failure: Arc::new(Mutex::new(None)),
        });
        Ok((
            Self {
                shared: Arc::new(Shared {
                    journal: AsyncMutex::new(journal),
                    notify: Notify::new(),
                }),
                owner: Arc::downgrade(&owner),
                drivers: context
                    .capabilities
                    .get::<Drivers>()
                    .map(|d| d.0.clone())
                    .unwrap_or_default(),
                context: context.clone(),
                store,
            },
            owner,
        ))
    }
    pub async fn recover(&self) -> Result<(), Error> {
        let mut journal = self.shared.journal.lock().await;
        let tasks = journal.value.tasks.clone();
        for (id, task) in tasks {
            if matches!(
                task.outcome,
                None | Some(TaskOutcome::Paused(_) | TaskOutcome::Checkpoint(_))
            ) {
                journal
                    .value
                    .tasks
                    .get_mut(&id)
                    .expect("recorded task")
                    .outcome = None;
                journal.commit().await?;
                self.launch(id, task, true)?;
            }
        }
        Ok(())
    }
    pub async fn spawn(
        &self,
        task_id: &str,
        tool: &str,
        arguments: Value,
        ctx: &ToolCallContext,
    ) -> Result<Value, Error> {
        valid_id(task_id)?;
        let entry = self
            .drivers
            .get(tool)
            .ok_or_else(|| Error::Tool("task tool is not in binding.agent_tasks".into()))?;
        crate::settings::validate_json_value(&entry.definition.function.parameters, &arguments)
            .map_err(|e| Error::Tool(e.to_string()))?;
        let identity = entry
            .dispatch
            .recovery_identity()
            .filter(|s| !s.is_empty())
            .ok_or_else(|| {
                Error::Composition("background tasks require a resumable child dispatch".into())
            })?;
        if !entry.dispatch.is_resumable() {
            return Err(Error::Composition("task child is not resumable".into()));
        }
        let mut journal = self.shared.journal.lock().await;
        if let Some(task) = journal.value.tasks.get(task_id) {
            if task.tool != tool || task.arguments != arguments || task.identity != identity {
                return Err(Error::Tool("task_id already names different input".into()));
            }
            return Ok(view(task_id, task));
        }
        if journal.value.tasks.len() >= 64 {
            return Err(Error::Tool(
                "task limit (64 per parent invocation) reached".into(),
            ));
        }
        let task = Task {
            tool: tool.into(),
            arguments,
            call_id: ctx.call_id.as_str().into(),
            state: ctx
                .get::<crate::context::ToolInvocationState>()
                .map(|s| s.state().clone())
                .unwrap_or_default(),
            identity,
            outcome: None,
        };
        journal.value.tasks.insert(task_id.into(), task.clone());
        journal.commit().await?;
        self.launch(task_id.into(), task.clone(), false)?;
        Ok(view(task_id, &task))
    }
    fn launch(&self, task_id: String, task: Task, resume: bool) -> Result<(), Error> {
        let owner = self.owner.upgrade().ok_or(Error::Cancelled)?;
        let entry = self
            .drivers
            .get(&task.tool)
            .ok_or_else(|| Error::Checkpoint("task driver missing on recovery".into()))?
            .clone();
        if entry.dispatch.recovery_identity().as_deref() != Some(task.identity.as_str()) {
            return Err(Error::Checkpoint("task driver changed on recovery".into()));
        }
        let token = self.context.cancel.child_token();
        owner
            .cancels
            .lock()
            .expect("task cancellation lock")
            .insert(task_id.clone(), token.clone());
        let mut context = self.context.clone();
        context.cancel = token;
        let mut ctx = crate::tools::call_context(&task.call_id, &context)?;
        ctx.insert(crate::context::ToolInvocationState(Arc::new(task.state)));
        ctx.insert(nofy_tool_runtime::ResumeInvocation(resume));
        if let Some(store) = &self.store {
            ctx.insert(ParentCheckpointer(store.clone()));
        }
        let control = ChildControl::default();
        ctx.insert(control.clone());
        let shared = self.shared.clone();
        let failure = owner.failure.clone();
        owner
            .tasks
            .lock()
            .expect("task owner lock")
            .spawn(async move {
                let run = std::panic::AssertUnwindSafe(async move {
                    let mut stream = entry
                        .dispatch
                        .call(
                            nofy_tool_protocol::ToolId::new(task.tool).expect("compiled tool name"),
                            task.arguments,
                            ctx,
                        )
                        .await;
                    let mut result = None;
                    while let Some(item) = stream.next().await {
                        if let ToolStreamItem::Terminal(terminal) = item {
                            if result.is_some() {
                                result = Some(TaskOutcome::Failed(
                                    "child returned multiple terminal results".into(),
                                ));
                                break;
                            }
                            result = Some(match terminal {
                                Ok(output) => TaskOutcome::Completed(output.value),
                                Err(e) => TaskOutcome::Failed(e.to_string()),
                            });
                        }
                    }
                    match control.0.lock().expect("task control lock").take() {
                        Some(ChildOutcome::Paused(reason)) => TaskOutcome::Paused(reason),
                        Some(ChildOutcome::Cancelled) => TaskOutcome::Cancelled,
                        Some(ChildOutcome::BudgetExceeded) => TaskOutcome::BudgetExceeded,
                        Some(ChildOutcome::Failed(error)) => TaskOutcome::Failed(error),
                        Some(ChildOutcome::Checkpoint(error)) => TaskOutcome::Checkpoint(error),
                        None => result.unwrap_or_else(|| {
                            TaskOutcome::Failed("child ended without a terminal result".into())
                        }),
                    }
                })
                // Effective only in unwinding builds (tests). Release and dev use
                // `panic = "abort"` (see the workspace Cargo.toml), where a panic
                // here ends the process and recovery restarts from checkpoints.
                .catch_unwind()
                .await;
                let outcome = run.unwrap_or_else(|_| {
                    TaskOutcome::Checkpoint(
                        "child task panicked; inspect child recovery before resuming".into(),
                    )
                });
                let mut journal = shared.journal.lock().await;
                journal
                    .value
                    .tasks
                    .get_mut(&task_id)
                    .expect("persisted task")
                    .outcome = Some(outcome);
                if let Err(error) = journal.commit().await {
                    *failure.lock().expect("task failure lock") = Some(error.to_string());
                }
                shared.notify.notify_waiters();
            });
        Ok(())
    }
    pub async fn read(&self, task_id: Option<&str>, wait_ms: u64) -> Result<Value, Error> {
        let deadline =
            tokio::time::Instant::now() + std::time::Duration::from_millis(wait_ms.min(60000));
        loop {
            let notified = self.shared.notify.notified();
            tokio::pin!(notified);
            notified.as_mut().enable();
            let result = self.peek(task_id).await?;
            if task_id.is_none()
                || result.get("status").and_then(Value::as_str) != Some("running")
                || tokio::time::Instant::now() >= deadline
            {
                return Ok(result);
            }
            tokio::select! { _ = notified => {}, _ = tokio::time::sleep_until(deadline) => return self.peek(task_id).await, _ = self.context.cancel.cancelled() => return Err(Error::Cancelled) }
        }
    }
    async fn peek(&self, task_id: Option<&str>) -> Result<Value, Error> {
        let owner = self.owner.upgrade().ok_or(Error::Cancelled)?;
        if let Some(error) = &*owner.failure.lock().expect("task failure lock") {
            return Err(Error::Checkpoint(error.clone()));
        }
        let journal = self.shared.journal.lock().await;
        if let Some(id) = task_id {
            return journal
                .value
                .tasks
                .get(id)
                .map(|task| view(id, task))
                .ok_or_else(|| Error::Tool("task not found in this parent invocation".into()));
        }
        Ok(
            json!({"tasks":journal.value.tasks.iter().map(|(id, task)| view(id, task)).collect::<Vec<_>>()}),
        )
    }
    pub async fn cancel(&self, id: &str) -> Result<Value, Error> {
        self.peek(Some(id)).await?;
        if let Some(owner) = self.owner.upgrade()
            && let Some(token) = owner
                .cancels
                .lock()
                .expect("task cancellation lock")
                .get(id)
        {
            token.cancel();
        }
        self.peek(Some(id)).await
    }
    pub async fn finish(&self) -> Result<(), Error> {
        loop {
            let notified = self.shared.notify.notified();
            tokio::pin!(notified);
            notified.as_mut().enable();
            let mut running = false;
            {
                let journal = self.shared.journal.lock().await;
                for task in journal.value.tasks.values() {
                    match &task.outcome {
                        None => running = true,
                        Some(TaskOutcome::Paused(reason)) => {
                            return Err(Error::GovernancePaused(reason.clone()));
                        }
                        Some(TaskOutcome::Checkpoint(error)) => {
                            return Err(Error::Checkpoint(error.clone()));
                        }
                        Some(TaskOutcome::BudgetExceeded) => return Err(Error::BudgetExceeded),
                        _ => {}
                    }
                }
            }
            self.peek(None).await?;
            if !running {
                return Ok(());
            }
            tokio::select! { _ = notified => {}, _ = self.context.cancel.cancelled() => return Err(crate::governance::cancellation_error(&self.context)) }
        }
    }
}
fn view(id: &str, task: &Task) -> Value {
    let mut value = task
        .outcome
        .as_ref()
        .map(|v| serde_json::to_value(v).expect("task outcome"))
        .unwrap_or(json!({"status":"running"}));
    value["task_id"] = json!(id);
    value["tool"] = json!(task.tool);
    value
}
fn valid_id(id: &str) -> Result<(), Error> {
    if id.is_empty() || id.len() > 128 || id.chars().any(char::is_control) {
        return Err(Error::Tool(
            "ID requires 1..128 bytes without control characters".into(),
        ));
    }
    Ok(())
}
