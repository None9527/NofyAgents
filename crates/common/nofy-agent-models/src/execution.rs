//! Evaluation is an explicit binding, not part of the portable protocol's
//! identity. A resident host supplies confinement; SDK callers opt into trust.
use crate::{encoded, failure, program::Protocol};
use nofy_agent_runtime::Error;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Arc;
use tokio::sync::{mpsc, oneshot};
use tokio_util::sync::CancellationToken;

#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Evaluation {
    pub value: Value,
    pub spent: u64,
}

#[async_trait::async_trait]
pub trait Executor: Send + Sync {
    async fn evaluate(
        &self,
        program: Arc<Protocol>,
        input: Value,
        spent: u64,
        cap: usize,
        cancel: CancellationToken,
    ) -> Result<Evaluation, Error>;
}

/// No OS confinement. Only explicitly trusted SDK programs may select this.
pub struct Trusted;
#[async_trait::async_trait]
impl Executor for Trusted {
    async fn evaluate(
        &self,
        program: Arc<Protocol>,
        input: Value,
        spent: u64,
        cap: usize,
        cancel: CancellationToken,
    ) -> Result<Evaluation, Error> {
        thread_local! {
            static CACHE: std::cell::RefCell<crate::worker::Cache> = Default::default();
        }
        let cancel = cancel.child_token();
        let _on_drop = cancel.clone().drop_guard();
        tokio::task::spawn_blocking(move || {
            CACHE.with(|cache| {
                let mut cache = cache.borrow_mut();
                let id = nofy_agent_runtime::system::content_digest(&*program)?;
                cache.prepare(id.clone(), program)?;
                cache.evaluate(&id, input, spent, cap, cancel)
            })
        })
        .await
        .map_err(|_| failure("worker_closed"))?
    }
}

pub(crate) struct Binding {
    pub program: Arc<Protocol>,
    pub executor: Arc<dyn Executor>,
}
impl std::ops::Deref for Binding {
    type Target = Protocol;
    fn deref(&self) -> &Self::Target {
        &self.program
    }
}
impl Binding {
    async fn pure(&self, input: Value, cancel: CancellationToken) -> Result<Value, Error> {
        let cap = self.program.limits.max_input_bytes;
        let reply = self
            .executor
            .evaluate(self.program.clone(), input, 0, cap, cancel)
            .await?;
        if reply.spent > self.program.limits.max_operations {
            return Err(failure("operation_accounting"));
        }
        encoded(&reply.value, cap)?;
        Ok(reply.value)
    }
    pub(crate) async fn admit(
        &self,
        request: &nofy_agent_runtime::ModelRequest,
        model: &str,
        endpoint: Option<&crate::connection::EndpointLimits>,
        cancel: CancellationToken,
    ) -> Result<crate::program::Admission, Error> {
        self.program
            .capabilities
            .validate_settings(&request.settings)?;
        encoded(request, self.program.limits.max_input_bytes)?;
        let value = self
            .pure(
                serde_json::json!({"phase":"admit","model":model,"request":request,
            "max_requests":self.program.limits.max_requests,"endpoint_limits":endpoint}),
                cancel,
            )
            .await?;
        let admission: crate::program::Admission =
            serde_json::from_value(value).map_err(|_| failure("admission_contract"))?;
        if admission.max_requests == 0
            || admission.max_requests > self.program.limits.max_requests
            || admission.max_output_tokens.is_some_and(|n| {
                n == 0 || n > u64::MAX / 8 || endpoint.is_some_and(|e| n > e.max_output_tokens)
            })
        {
            return Err(failure("admission_limit"));
        }
        Ok(admission)
    }
    pub(crate) async fn history(
        &self,
        messages: &[nofy_agent_runtime::Message],
    ) -> Result<(), Error> {
        let value = self
            .pure(
                serde_json::json!({"phase":"history","messages":messages}),
                CancellationToken::new(),
            )
            .await?;
        if value != Value::Bool(true) {
            return Err(crate::invalid("model protocol rejected retained history"));
        }
        Ok(())
    }
}
type Step = (Value, oneshot::Sender<Result<Value, Error>>);
pub(crate) struct Session {
    tx: mpsc::Sender<Step>,
    worker: tokio::task::JoinHandle<()>,
    cancel: CancellationToken,
    _on_drop: tokio_util::sync::DropGuard,
}
impl Session {
    pub(crate) fn start(
        program: Arc<Protocol>,
        executor: Arc<dyn Executor>,
        cancel: CancellationToken,
    ) -> Self {
        let (tx, mut rx) = mpsc::channel::<Step>(1);
        let stop = cancel.clone();
        let worker = tokio::spawn(async move {
            let mut spent = 0;
            let cap = program
                .limits
                .max_input_bytes
                .max(program.limits.max_state_bytes)
                * 2;
            while let Some((input, reply)) = rx.recv().await {
                if stop.is_cancelled() {
                    let _ = reply.send(Err(Error::Cancelled));
                    break;
                }
                let result = executor
                    .evaluate(program.clone(), input, spent, cap, stop.clone())
                    .await
                    .and_then(|result| {
                        if result.spent < spent || result.spent > program.limits.max_operations {
                            return Err(failure("operation_accounting"));
                        }
                        encoded(&result.value, cap)?;
                        spent = result.spent;
                        Ok(result.value)
                    });
                let failed = result.is_err();
                let _ = reply.send(result);
                if failed {
                    break;
                }
            }
        });
        Self {
            tx,
            worker,
            _on_drop: cancel.clone().drop_guard(),
            cancel,
        }
    }
    pub(crate) async fn step(&self, input: Value) -> Result<Value, Error> {
        let (tx, rx) = oneshot::channel();
        self.tx
            .send((input, tx))
            .await
            .map_err(|_| failure("worker_closed"))?;
        rx.await.map_err(|_| failure("worker_closed"))?
    }
    pub(crate) async fn close(self) {
        self.cancel.cancel();
        drop(self.tx);
        let _ = self.worker.await;
    }
}
