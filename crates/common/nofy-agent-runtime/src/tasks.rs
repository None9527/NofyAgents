//! Structured asynchronous children. The invocation owner outlives every child
//! and is dropped before the supervisor releases its root fence.
pub mod declarative;
#[cfg(test)]
mod duplex_tests;
mod journal;
mod messages;
#[cfg(test)]
mod tests;
use crate::composition::{ChildControl, ChildOutcome, ParentCheckpointer};
use crate::{Checkpointer, Error, RunContext, RunState, ToolCatalog};
use futures::StreamExt;
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
struct PreparedLaunch {
    task_id: String,
    tool_id: nofy_tool_protocol::ToolId,
    entry: crate::ToolEntry,
    arguments: Value,
    token: CancellationToken,
    ctx: ToolCallContext,
    control: ChildControl,
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
        let owner = self.owner.upgrade().ok_or(Error::Cancelled)?;
        let mut journal = self.shared.journal.lock().await;
        let mut pending_ids = Vec::new();
        let mut prepared = Vec::new();
        for (id, task) in &journal.value.tasks {
            if matches!(
                task.outcome,
                None | Some(TaskOutcome::Paused(_) | TaskOutcome::Checkpoint(_))
            ) {
                prepared.push(self.prepare_launch(id.clone(), task.clone(), true)?);
                pending_ids.push(id.clone());
            }
        }
        if prepared.is_empty() {
            return Ok(());
        }
        let previous: Vec<(String, Option<TaskOutcome>)> = pending_ids
            .iter()
            .filter_map(|id| {
                let task = journal.value.tasks.get_mut(id)?;
                Some((id.clone(), task.outcome.take()))
            })
            .collect();
        if let Err(error) = journal.commit().await {
            for (id, old) in previous {
                if let Some(task) = journal.value.tasks.get_mut(&id) {
                    task.outcome = old;
                }
            }
            return Err(error);
        }
        for launch in prepared {
            self.start_prepared(&owner, launch);
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
        let owner = self.owner.upgrade().ok_or(Error::Cancelled)?;
        let prepared = self.prepare_launch(task_id.into(), task.clone(), false)?;
        journal.value.tasks.insert(task_id.into(), task.clone());
        if let Err(error) = journal.commit().await {
            journal.value.tasks.remove(task_id);
            return Err(error);
        }
        self.start_prepared(&owner, prepared);
        Ok(view(task_id, &task))
    }
    fn prepare_launch(
        &self,
        task_id: String,
        task: Task,
        resume: bool,
    ) -> Result<PreparedLaunch, Error> {
        let entry = self
            .drivers
            .get(&task.tool)
            .ok_or_else(|| Error::Checkpoint("task driver missing on recovery".into()))?
            .clone();
        if entry.dispatch.recovery_identity().as_deref() != Some(task.identity.as_str()) {
            return Err(Error::Checkpoint("task driver changed on recovery".into()));
        }
        let tool_id = nofy_tool_protocol::ToolId::new(task.tool)
            .map_err(|e| Error::Checkpoint(format!("invalid task tool name on recovery: {e}")))?;
        let token = self.context.cancel.child_token();
        let mut context = self.context.clone();
        context.cancel = token.clone();
        let mut ctx = crate::tools::call_context(&task.call_id, &context)?;
        ctx.insert(crate::context::ToolInvocationState(Arc::new(task.state)));
        ctx.insert(nofy_tool_runtime::ResumeInvocation(resume));
        if let Some(store) = &self.store {
            ctx.insert(ParentCheckpointer(store.clone()));
        }
        let control = ChildControl::default();
        ctx.insert(control.clone());
        Ok(PreparedLaunch {
            task_id,
            tool_id,
            entry,
            arguments: task.arguments,
            token,
            ctx,
            control,
        })
    }
    fn start_prepared(&self, owner: &Arc<Owner>, prepared: PreparedLaunch) {
        let PreparedLaunch {
            task_id,
            tool_id,
            entry,
            arguments,
            token,
            ctx,
            control,
        } = prepared;
        owner
            .cancels
            .lock()
            .expect("task cancellation lock")
            .insert(task_id.clone(), token);
        let shared = self.shared.clone();
        let failure = owner.failure.clone();
        owner
            .tasks
            .lock()
            .expect("task owner lock")
            .spawn(async move {
                let mut stream = entry.dispatch.call(tool_id, arguments, ctx).await;
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
                let outcome = match control.0.lock().expect("task control lock").take() {
                    Some(ChildOutcome::Paused(reason)) => TaskOutcome::Paused(reason),
                    Some(ChildOutcome::Cancelled) => TaskOutcome::Cancelled,
                    Some(ChildOutcome::BudgetExceeded) => TaskOutcome::BudgetExceeded,
                    Some(ChildOutcome::Failed(error)) => TaskOutcome::Failed(error),
                    Some(ChildOutcome::Checkpoint(error)) => TaskOutcome::Checkpoint(error),
                    None => result.unwrap_or_else(|| {
                        TaskOutcome::Failed("child ended without a terminal result".into())
                    }),
                };
                let mut journal = shared.journal.lock().await;
                if let Some(task) = journal.value.tasks.get_mut(&task_id) {
                    task.outcome = Some(outcome);
                }
                if let Err(error) = journal.commit().await {
                    *failure.lock().expect("task failure lock") = Some(error.to_string());
                }
                shared.notify.notify_waiters();
            });
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
    /// Nonblocking join preflight for the agent's idle safe point. Preserve
    /// the same fail-closed child outcomes as the ordinary invocation join.
    pub async fn has_running(&self) -> Result<bool, Error> {
        let owner = self.owner.upgrade().ok_or(Error::Cancelled)?;
        let journal = self.shared.journal.lock().await;
        // Terminal outcomes and a failed commit are published under this same
        // lock. Check failure after acquiring it, never against an older view.
        if let Some(error) = &*owner
            .failure
            .lock()
            .map_err(|_| Error::Checkpoint("task failure lock poisoned".into()))?
        {
            return Err(Error::Checkpoint(error.clone()));
        }
        let mut running = false;
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
        Ok(running)
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
