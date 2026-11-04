//! One-shot pure methods use the same confined process supervisor as Scope
//! and Prompt. Network, tool governance and Hook orchestration stay outside.
use super::*;
use nofy_agent_executors::code::{Executor, Request};
use nofy_tool_runtime::ToolError;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tokio_util::sync::CancellationToken;

pub const PROTOCOL: &str = "nofy.code-program-evaluate/v1";
const MAX_INPUT: usize = 32 * 1024 * 1024;
const MAX_OUTPUT: usize = 32 * 1024 * 1024;
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Input {
    protocol: String,
    request: Request,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Output {
    protocol: String,
    result: std::result::Result<Value, ToolError>,
}
#[derive(Serialize)]
pub struct CodeStatus {
    pub protocol: &'static str,
    pub slots: usize,
    pub in_flight: usize,
    pub started: u64,
    pub helper_bound: bool,
    pub stopping: bool,
}
fn failed() -> ToolError {
    ToolError::custom(
        "isolated_unavailable",
        "isolated script worker is unavailable or failed",
    )
}
fn stopped() -> ToolError {
    ToolError::custom(
        "cancelled",
        "script method cancelled or host is shutting down",
    )
}
fn timed_out() -> ToolError {
    ToolError::custom("timeout", "script method timed out")
}
impl Loader {
    pub fn code_status(&self) -> CodeStatus {
        CodeStatus {
            protocol: PROTOCOL,
            slots: 2,
            in_flight: 2 - self.code_work.available_permits(),
            started: self.code_started.load(std::sync::atomic::Ordering::Relaxed),
            helper_bound: self.helper_ready(),
            stopping: self.acquisition_stop.is_cancelled(),
        }
    }
    pub(crate) async fn drain_code_workers(&self) -> Result<()> {
        let _idle = self
            .code_work
            .clone()
            .acquire_many_owned(2)
            .await
            .map_err(storage::unavailable)?;
        Ok(())
    }
}
#[async_trait::async_trait]
impl Executor for Loader {
    async fn evaluate(
        &self,
        request: Request,
        cancel: CancellationToken,
    ) -> std::result::Result<Value, ToolError> {
        request.validate()?;
        let cancel = cancel.child_token();
        let _on_drop = cancel.clone().drop_guard();
        let deadline =
            tokio::time::Instant::now() + std::time::Duration::from_millis(request.timeout_ms);
        let permit = tokio::select! { biased;
            _ = cancel.cancelled() => return Err(stopped()),
            _ = self.acquisition_stop.cancelled() => return Err(stopped()),
            _ = tokio::time::sleep_until(deadline) => return Err(timed_out()),
            permit = self.code_work.clone().acquire_owned() => permit.map_err(|_|failed())?,
        };
        let loader = self.clone();
        // Neither a dropped caller nor a timeout can release the permit before
        // the actual supervisor has finished preparation and reaped its child.
        tokio::spawn(async move {
            let _permit = permit;
            let job = super::evaluation::Job {
                mode: "--evaluate-code",
                max_output: MAX_OUTPUT,
                started: loader.code_started.clone(),
                unavailable: "isolated script worker is unavailable or failed",
                cancelled: "script method cancelled or host is shutting down",
                cpu_seconds: request.timeout_ms.div_ceil(1000) + 1,
                deadline: Some(deadline),
            };
            let result = super::evaluation::run(&loader, job, cancel.clone(), move || {
                let bytes = serde_json::to_vec(&Input {
                    protocol: PROTOCOL.into(),
                    request,
                })
                .map_err(storage::unavailable)?;
                if bytes.len() > MAX_INPUT {
                    return Err(HostError::Invalid(
                        "script input envelope exceeds its limit".into(),
                    ));
                }
                Ok(bytes)
            })
            .await;
            if cancel.is_cancelled() || loader.acquisition_stop.is_cancelled() {
                return Err(stopped());
            }
            if tokio::time::Instant::now() >= deadline {
                return Err(timed_out());
            }
            let bytes = result.map_err(|_| failed())?;
            let output: Output = serde_json::from_slice(&bytes).map_err(|_| failed())?;
            if output.protocol != PROTOCOL {
                return Err(failed());
            }
            output.result
        })
        .await
        .map_err(|_| failed())?
    }
}
/// Entry is dispatched only after applying the shared Linux confinement.
pub(in crate::loader) fn worker_evaluate() -> std::result::Result<(), Box<dyn std::error::Error>> {
    use std::io::{Read, Write};
    let mut bytes = Vec::new();
    std::io::stdin()
        .take(MAX_INPUT as u64 + 1)
        .read_to_end(&mut bytes)?;
    if bytes.len() > MAX_INPUT {
        return Err("script input envelope exceeds its limit".into());
    }
    let input: Input = serde_json::from_slice(&bytes)?;
    if input.protocol != PROTOCOL {
        return Err("unsupported script worker protocol".into());
    }
    let output = Output {
        protocol: PROTOCOL.into(),
        result: input.request.run(CancellationToken::new()),
    };
    let bytes = serde_json::to_vec(&output)?;
    if bytes.len() > MAX_OUTPUT {
        return Err("script output envelope exceeds its limit".into());
    }
    let mut stdout = std::io::stdout().lock();
    stdout.write_all(&bytes)?;
    stdout.flush()?;
    Ok(())
}
