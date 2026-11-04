//! Portable computation data and an explicitly chosen physical executor.
use nofy_tool_runtime::ToolError;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tokio_util::sync::CancellationToken;

#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Request {
    pub source: String,
    pub input: Value,
    pub max_operations: u64,
    pub timeout_ms: u64,
    pub max_input_bytes: usize,
    pub max_output_bytes: usize,
}
impl Request {
    pub fn validate(&self) -> Result<(), ToolError> {
        if self.source.trim().is_empty()
            || self.source.len() > 1_048_576
            || !(1..=10_000_000).contains(&self.max_operations)
            || !(1..=600_000).contains(&self.timeout_ms)
            || !(1..=16_777_216).contains(&self.max_input_bytes)
            || !(1..=16_777_216).contains(&self.max_output_bytes)
        {
            return Err(crate::tool_error(
                "script_request",
                "invalid script execution bounds",
            ));
        }
        if serde_json::to_vec(&self.input)
            .map_err(|_| crate::tool_error("invalid_arguments", "script input is not JSON"))?
            .len()
            > self.max_input_bytes
        {
            return Err(crate::tool_error(
                "input_limit",
                "script input exceeds byte limit",
            ));
        }
        Ok(())
    }
    /// Synchronous VM entry. A resident host must call only after confinement;
    /// explicitly trusted SDK callers use the Trusted executor instead.
    pub fn run(self, cancel: CancellationToken) -> Result<Value, ToolError> {
        self.validate()?;
        let value = super::rhai::run(&self.source, self.input, self.max_operations, cancel)?;
        if serde_json::to_vec(&value)
            .map_err(|_| crate::tool_error("invalid_output", "script result is not JSON"))?
            .len()
            > self.max_output_bytes
        {
            return Err(crate::tool_error(
                "output_limit",
                "script result exceeds byte limit",
            ));
        }
        Ok(value)
    }
}

#[async_trait::async_trait]
pub trait Executor: Send + Sync {
    async fn evaluate(
        &self,
        request: Request,
        cancel: CancellationToken,
    ) -> Result<Value, ToolError>;
}

/// No OS confinement and no implicit selection by a resident host.
pub struct Trusted;
#[async_trait::async_trait]
impl Executor for Trusted {
    async fn evaluate(
        &self,
        request: Request,
        cancel: CancellationToken,
    ) -> Result<Value, ToolError> {
        request.validate()?;
        let cancel = cancel.child_token();
        let _on_drop = cancel.clone().drop_guard();
        let timeout = std::time::Duration::from_millis(request.timeout_ms);
        let worker_cancel = cancel.clone();
        let mut task = tokio::task::spawn_blocking(move || request.run(worker_cancel));
        tokio::select! { biased;
            _ = cancel.cancelled() => {
                let _ = task.await;
                Err(crate::tool_error("cancelled", "script method cancelled"))
            },
            _ = tokio::time::sleep(timeout) => {
                cancel.cancel();
                let _ = task.await;
                Err(crate::tool_error("timeout", "script method timed out"))
            },
            result = &mut task => result.map_err(|_|crate::tool_error("script_task", "script task failed"))?,
        }
    }
}
