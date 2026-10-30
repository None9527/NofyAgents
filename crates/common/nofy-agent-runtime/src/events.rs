//! Versioned execution observation. A durable sink is independent of a live
//! client, while the live channel applies backpressure instead of dropping.
use crate::{Error, RunContext, ToolCall};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Arc;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum RunStatus {
    Completed,
    Refused,
    Truncated,
    Paused,
    Cancelled,
    BudgetExceeded,
    Failed,
}

#[derive(Debug, Clone)]
pub struct RunLineage {
    pub root_run_id: String,
    pub parent_run_id: Option<String>,
    pub node_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventScope {
    pub root_run_id: String,
    pub run_id: String,
    pub thread_id: String,
    pub parent_run_id: Option<String>,
    pub node_id: Option<String>,
    pub agent: String,
}
impl EventScope {
    pub fn new(agent: impl Into<String>, context: &RunContext) -> Self {
        let lineage = context.capabilities.get::<RunLineage>();
        Self {
            root_run_id: lineage.as_ref().map_or_else(
                || context.run_id.clone(),
                |lineage| lineage.root_run_id.clone(),
            ),
            run_id: context.run_id.clone(),
            thread_id: context.thread_id.clone(),
            parent_run_id: lineage
                .as_ref()
                .and_then(|lineage| lineage.parent_run_id.clone()),
            node_id: lineage.as_ref().and_then(|lineage| lineage.node_id.clone()),
            agent: agent.into(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventEnvelope {
    pub version: u32,
    pub cursor: u64,
    pub timestamp_ms: u64,
    pub scope: EventScope,
    pub event: RunEvent,
}

#[async_trait::async_trait]
pub trait EventSink: Send + Sync {
    async fn record(&self, scope: EventScope, event: RunEvent) -> Result<(), Error>;
    /// Stable producer key for checkpointed outboxes. Backends may deduplicate
    /// atomically; the default preserves existing sinks and may redeliver.
    async fn record_once(
        &self,
        scope: EventScope,
        event: RunEvent,
        _key: &str,
    ) -> Result<(), Error> {
        self.record(scope, event).await
    }
}
#[derive(Clone)]
pub struct EventSinkBinding(pub Arc<dyn EventSink>);

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum RunEvent {
    #[cfg(feature = "workflow")]
    Workflow {
        reference: crate::registry::ModuleRef,
        operation_id: String,
        name: String,
        node_id: Option<String>,
        payload: Value,
    },
    Input {
        input_id: String,
        sequence: u64,
        kind: crate::mailbox::InputKind,
        status: crate::mailbox::InputStatus,
        reason: Option<String>,
    },
    RunStarted {
        resume: bool,
    },
    Hook {
        event_id: String,
        event_name: String,
        hook: String,
        status: String,
        detail: Option<String>,
    },
    ModelStarted {
        step: usize,
    },
    ModelCompleted {
        output: String,
    },
    ModelDelta {
        delta: crate::ModelDelta,
    },
    ModelUsage {
        input_tokens: u64,
        output_tokens: u64,
        info: crate::CompletionInfo,
    },
    ToolStarted {
        call: ToolCall,
    },
    ToolResumed {
        call: ToolCall,
    },
    ToolProgress {
        call_id: String,
        progress: nofy_tool_runtime::ToolProgress,
    },
    ToolCompleted {
        call_id: String,
        result: Value,
        is_error: bool,
    },
    Finished,
    Terminated {
        status: crate::events::RunStatus,
        reason: Option<Value>,
    },
}

pub(crate) async fn publish_event(
    name: &str,
    middleware: &[Arc<dyn crate::agent::Middleware>],
    context: &RunContext,
    live: Option<&tokio::sync::mpsc::Sender<RunEvent>>,
    event: RunEvent,
) -> Result<(), Error> {
    if let Some(sink) = context
        .capabilities
        .get::<crate::events::EventSinkBinding>()
    {
        sink.0
            .record(EventScope::new(name, context), event.clone())
            .await?;
    }
    for middleware in middleware {
        middleware.observe(&event, context).await;
    }
    if let Some(live) = live {
        if context.cancel.is_cancelled() {
            let _ = live.try_send(event);
        } else {
            tokio::select! {_=context.cancel.cancelled()=>{},_=live.send(event)=>{}}
        }
    }
    Ok(())
}
