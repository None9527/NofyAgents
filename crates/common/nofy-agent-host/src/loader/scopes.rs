//! Same confined evaluator for a scope's tool view and every admission.
use super::*;
use nofy_agent_modules::scope_program::{Executor, Operation, Program, Reply};
use nofy_agent_runtime::{Error, RunContext};
use serde::{Deserialize, Serialize};
use std::io::Write;
use tokio_util::sync::CancellationToken;

mod process;
pub(super) use process::worker_evaluate;
pub const PROTOCOL: &str = "nofy.scope-program-evaluate/v1";
const MAX_INPUT: usize = 2 * 1024 * 1024;
const MAX_OUTPUT: usize = 512 * 1024;
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Input {
    protocol: String,
    program: Program,
    rules: Vec<String>,
    operation: Operation,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Output {
    protocol: String,
    result: std::result::Result<Reply, String>,
}
#[derive(Serialize)]
pub struct ScopeStatus {
    pub protocol: &'static str,
    pub slots: usize,
    pub in_flight: usize,
    pub started: u64,
    pub helper_bound: bool,
    pub stopping: bool,
}
struct Count {
    bytes: usize,
    max: usize,
}
impl Write for Count {
    fn write(&mut self, bytes: &[u8]) -> std::io::Result<usize> {
        self.bytes = self
            .bytes
            .checked_add(bytes.len())
            .filter(|size| *size <= self.max)
            .ok_or_else(|| std::io::Error::other("scope byte limit"))?;
        Ok(bytes.len())
    }
    fn flush(&mut self) -> std::io::Result<()> {
        Ok(())
    }
}
fn bounded(value: &impl Serialize, max: usize) -> std::result::Result<(), Error> {
    serde_json::to_writer(Count { bytes: 0, max }, value)
        .map_err(|_| Error::Composition("scope data exceeds its byte limit".into()))
}
fn failed() -> HostError {
    HostError::Unavailable("isolated scope worker failed or exceeded its limits".into())
}
impl Input {
    fn validate(&self) -> std::result::Result<(), Error> {
        if self.protocol != PROTOCOL {
            return Err(Error::Composition(
                "unsupported scope program protocol".into(),
            ));
        }
        self.program.validate()?;
        self.program.validate_request(
            &self.rules,
            &self.operation,
            &RunContext::new("scope-worker", "scope-worker"),
        )?;
        bounded(self, MAX_INPUT)
    }
}

impl Loader {
    pub fn scope_status(&self) -> ScopeStatus {
        ScopeStatus {
            protocol: PROTOCOL,
            slots: 2,
            in_flight: 2 - self.scope_work.available_permits(),
            started: self
                .scope_started
                .load(std::sync::atomic::Ordering::Relaxed),
            helper_bound: self.helper_ready(),
            stopping: self.acquisition_stop.is_cancelled(),
        }
    }
    async fn evaluate_scope(&self, input: Input, cancel: CancellationToken) -> Result<Reply> {
        let permit = tokio::select! {biased;
            _=self.acquisition_stop.cancelled()=>return Err(failed()),
            _=cancel.cancelled()=>return Err(failed()),
            permit=self.scope_work.clone().acquire_owned()=>permit.map_err(storage::unavailable)?,
        };
        let loader = self.clone();
        // Actual work, not the caller's future, owns admission until reaping.
        tokio::spawn(async move {
            let _permit = permit;
            process::evaluate(&loader, input, cancel).await
        })
        .await
        .map_err(storage::unavailable)?
    }
    pub(crate) async fn drain_scope_workers(&self) -> Result<()> {
        let _idle = self
            .scope_work
            .clone()
            .acquire_many_owned(2)
            .await
            .map_err(storage::unavailable)?;
        Ok(())
    }
}
#[async_trait::async_trait]
impl Executor for Loader {
    fn identity(&self) -> &str {
        PROTOCOL
    }
    fn available(&self) -> bool {
        cfg!(target_os = "linux") && self.helper_ready()
    }
    async fn evaluate(
        &self,
        program: &Program,
        rules: &[String],
        operation: Operation,
        context: &RunContext,
    ) -> std::result::Result<Reply, Error> {
        program.validate_request(rules, &operation, context)?;
        self.evaluate_scope(
            Input {
                protocol: PROTOCOL.into(),
                program: program.clone(),
                rules: rules.to_vec(),
                operation,
            },
            context.cancel.clone(),
        )
        .await
        .map_err(|error| match error {
            HostError::Runtime(error) => error,
            other => Error::Composition(other.to_string()),
        })
    }
}
