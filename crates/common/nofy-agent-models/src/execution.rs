//! Evaluation is an explicit binding, not part of the portable protocol's
//! identity. A resident host supplies confinement; SDK callers opt into trust.
use crate::{count_encoded, failure, program::Protocol};
use nofy_agent_runtime::Error;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Arc;
use tokio::sync::{Mutex, mpsc, oneshot};
use tokio_util::sync::CancellationToken;

#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Evaluation {
    pub value: Value,
    pub spent: u64,
}

#[async_trait::async_trait]
pub trait StreamExecutor: Send + Sync {
    async fn push_event(
        &self,
        frame: Value,
        spent: u64,
        cap: usize,
        cancel: CancellationToken,
    ) -> Result<Evaluation, Error>;

    async fn finish(
        &self,
        spent: u64,
        cap: usize,
        cancel: CancellationToken,
    ) -> Result<Evaluation, Error>;

    async fn abort(&self);
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

    /// Optional stateful SSE stream reduction keeping `exchange.state` inside
    /// the evaluator across frames. Returning `Ok(None)` falls back to
    /// stateless single-step `evaluate` calls.
    async fn begin_stream(
        &self,
        _program: Arc<Protocol>,
        _state: Value,
        _cap: usize,
        _cancel: CancellationToken,
    ) -> Result<Option<Box<dyn StreamExecutor>>, Error> {
        Ok(None)
    }
}

enum TrustedStreamCommand {
    PushEvent {
        frame: Value,
        spent: u64,
        cap: usize,
        cancel: CancellationToken,
        reply: oneshot::Sender<Result<Evaluation, Error>>,
    },
    Finish {
        spent: u64,
        cap: usize,
        cancel: CancellationToken,
        reply: oneshot::Sender<Result<Evaluation, Error>>,
    },
    Abort,
}

struct TrustedStream {
    tx: Mutex<Option<mpsc::Sender<TrustedStreamCommand>>>,
    worker: Mutex<Option<tokio::task::JoinHandle<()>>>,
}

#[async_trait::async_trait]
impl StreamExecutor for TrustedStream {
    async fn push_event(
        &self,
        frame: Value,
        spent: u64,
        cap: usize,
        cancel: CancellationToken,
    ) -> Result<Evaluation, Error> {
        let sender = self
            .tx
            .lock()
            .await
            .clone()
            .ok_or_else(|| failure("worker_closed"))?;
        let (reply_tx, reply_rx) = oneshot::channel();
        sender
            .send(TrustedStreamCommand::PushEvent {
                frame,
                spent,
                cap,
                cancel,
                reply: reply_tx,
            })
            .await
            .map_err(|_| failure("worker_closed"))?;
        reply_rx.await.map_err(|_| failure("worker_closed"))?
    }

    async fn finish(
        &self,
        spent: u64,
        cap: usize,
        cancel: CancellationToken,
    ) -> Result<Evaluation, Error> {
        let sender = self
            .tx
            .lock()
            .await
            .take()
            .ok_or_else(|| failure("worker_closed"))?;
        let (reply_tx, reply_rx) = oneshot::channel();
        sender
            .send(TrustedStreamCommand::Finish {
                spent,
                cap,
                cancel,
                reply: reply_tx,
            })
            .await
            .map_err(|_| failure("worker_closed"))?;
        drop(sender);
        let result = reply_rx.await.map_err(|_| failure("worker_closed"))?;
        if let Some(worker) = self.worker.lock().await.take() {
            let _ = worker.await;
        }
        result
    }

    async fn abort(&self) {
        if let Some(sender) = self.tx.lock().await.take() {
            let _ = sender.send(TrustedStreamCommand::Abort).await;
            drop(sender);
        }
        if let Some(worker) = self.worker.lock().await.take() {
            let _ = worker.await;
        }
    }
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

    async fn begin_stream(
        &self,
        program: Arc<Protocol>,
        state: Value,
        cap: usize,
        cancel: CancellationToken,
    ) -> Result<Option<Box<dyn StreamExecutor>>, Error> {
        if cancel.is_cancelled() {
            return Err(Error::Cancelled);
        }
        let (tx, mut rx) = mpsc::channel::<TrustedStreamCommand>(1);
        let (ready_tx, ready_rx) = oneshot::channel::<Result<(), Error>>();
        let worker = tokio::task::spawn_blocking(move || {
            let compiled = match crate::program::Compiled::new(program) {
                Ok(compiled) => compiled,
                Err(error) => {
                    let _ = ready_tx.send(Err(error));
                    return;
                }
            };
            let mut live_state = match compiled.begin_stream(state, cap) {
                Ok(dynamic) => dynamic,
                Err(error) => {
                    let _ = ready_tx.send(Err(error));
                    return;
                }
            };
            if ready_tx.send(Ok(())).is_err() {
                return;
            }
            while let Some(command) = rx.blocking_recv() {
                match command {
                    TrustedStreamCommand::PushEvent {
                        frame,
                        spent,
                        cap,
                        cancel,
                        reply,
                    } => match compiled.push_event(live_state, frame, spent, cap, cancel) {
                        Ok((next_state, evaluation)) => {
                            live_state = next_state;
                            let _ = reply.send(Ok(evaluation));
                        }
                        Err(error) => {
                            let _ = reply.send(Err(error));
                            return;
                        }
                    },
                    TrustedStreamCommand::Finish {
                        spent,
                        cap,
                        cancel,
                        reply,
                    } => {
                        let result = compiled.finish_stream(live_state, spent, cap, cancel);
                        let _ = reply.send(result);
                        return;
                    }
                    TrustedStreamCommand::Abort => return,
                }
            }
        });
        match ready_rx.await {
            Ok(Ok(())) => Ok(Some(Box::new(TrustedStream {
                tx: Mutex::new(Some(tx)),
                worker: Mutex::new(Some(worker)),
            }))),
            Ok(Err(error)) => {
                let _ = worker.await;
                Err(error)
            }
            Err(_) => {
                let _ = worker.await;
                Err(failure("worker_closed"))
            }
        }
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
        count_encoded(&reply.value, cap)?;
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
        count_encoded(request, self.program.limits.max_input_bytes)?;
        let value = self
            .pure(
                serde_json::json!({
                    "phase": "admit",
                    "model": model,
                    "request": request,
                    "max_requests": self.program.limits.max_requests,
                    "endpoint_limits": endpoint
                }),
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
                serde_json::json!({"phase": "history", "messages": messages}),
                CancellationToken::new(),
            )
            .await?;
        if value != Value::Bool(true) {
            return Err(crate::invalid("model protocol rejected retained history"));
        }
        Ok(())
    }
}

enum SessionCommand {
    Step(Value, oneshot::Sender<Result<Value, Error>>),
    BeginStream(Value, oneshot::Sender<Result<bool, Error>>),
    PushEvent(Value, oneshot::Sender<Result<Value, Error>>),
    FinishStream(oneshot::Sender<Result<Value, Error>>),
    AbortStream(oneshot::Sender<()>),
}

pub(crate) struct Session {
    tx: mpsc::Sender<SessionCommand>,
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
        let (tx, mut rx) = mpsc::channel::<SessionCommand>(1);
        let stop = cancel.clone();
        let worker = tokio::spawn(async move {
            let mut spent = 0;
            let cap = program
                .limits
                .max_input_bytes
                .max(program.limits.max_state_bytes)
                * 2;
            let mut active_stream: Option<Box<dyn StreamExecutor>> = None;
            while let Some(command) = rx.recv().await {
                match command {
                    SessionCommand::Step(input, reply) => {
                        if stop.is_cancelled() {
                            let _ = reply.send(Err(Error::Cancelled));
                            break;
                        }
                        let result = executor
                            .evaluate(program.clone(), input, spent, cap, stop.clone())
                            .await
                            .and_then(|result| {
                                if result.spent < spent
                                    || result.spent > program.limits.max_operations
                                {
                                    return Err(failure("operation_accounting"));
                                }
                                count_encoded(&result.value, cap)?;
                                spent = result.spent;
                                Ok(result.value)
                            });
                        let failed = result.is_err();
                        let _ = reply.send(result);
                        if failed {
                            break;
                        }
                    }
                    SessionCommand::BeginStream(state, reply) => {
                        if stop.is_cancelled() {
                            let _ = reply.send(Err(Error::Cancelled));
                            break;
                        }
                        if let Some(previous) = active_stream.take() {
                            previous.abort().await;
                        }
                        match executor
                            .begin_stream(program.clone(), state, cap, stop.clone())
                            .await
                        {
                            Ok(Some(stream)) => {
                                active_stream = Some(stream);
                                let _ = reply.send(Ok(true));
                            }
                            Ok(None) => {
                                let _ = reply.send(Ok(false));
                            }
                            Err(error) => {
                                let _ = reply.send(Err(error));
                                break;
                            }
                        }
                    }
                    SessionCommand::PushEvent(frame, reply) => {
                        if stop.is_cancelled() {
                            let _ = reply.send(Err(Error::Cancelled));
                            break;
                        }
                        let Some(stream) = active_stream.as_ref() else {
                            let _ = reply.send(Err(failure("stream_missing")));
                            break;
                        };
                        let result = stream
                            .push_event(frame, spent, cap, stop.clone())
                            .await
                            .and_then(|result| {
                                if result.spent < spent
                                    || result.spent > program.limits.max_operations
                                {
                                    return Err(failure("operation_accounting"));
                                }
                                count_encoded(&result.value, cap)?;
                                spent = result.spent;
                                Ok(result.value)
                            });
                        let failed = result.is_err();
                        let _ = reply.send(result);
                        if failed {
                            if let Some(stream) = active_stream.take() {
                                stream.abort().await;
                            }
                            break;
                        }
                    }
                    SessionCommand::FinishStream(reply) => {
                        if stop.is_cancelled() {
                            let _ = reply.send(Err(Error::Cancelled));
                            break;
                        }
                        let Some(stream) = active_stream.take() else {
                            let _ = reply.send(Err(failure("stream_missing")));
                            break;
                        };
                        let result =
                            stream
                                .finish(spent, cap, stop.clone())
                                .await
                                .and_then(|result| {
                                    if result.spent < spent
                                        || result.spent > program.limits.max_operations
                                    {
                                        return Err(failure("operation_accounting"));
                                    }
                                    count_encoded(&result.value, cap)?;
                                    spent = result.spent;
                                    Ok(result.value)
                                });
                        let failed = result.is_err();
                        let _ = reply.send(result);
                        if failed {
                            break;
                        }
                    }
                    SessionCommand::AbortStream(reply) => {
                        if let Some(stream) = active_stream.take() {
                            stream.abort().await;
                        }
                        let _ = reply.send(());
                    }
                }
            }
            if let Some(stream) = active_stream.take() {
                stream.abort().await;
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
            .send(SessionCommand::Step(input, tx))
            .await
            .map_err(|_| failure("worker_closed"))?;
        rx.await.map_err(|_| failure("worker_closed"))?
    }

    pub(crate) async fn begin_stream(&self, state: Value) -> Result<bool, Error> {
        let (tx, rx) = oneshot::channel();
        self.tx
            .send(SessionCommand::BeginStream(state, tx))
            .await
            .map_err(|_| failure("worker_closed"))?;
        rx.await.map_err(|_| failure("worker_closed"))?
    }

    pub(crate) async fn push_event(&self, frame: Value) -> Result<Value, Error> {
        let (tx, rx) = oneshot::channel();
        self.tx
            .send(SessionCommand::PushEvent(frame, tx))
            .await
            .map_err(|_| failure("worker_closed"))?;
        rx.await.map_err(|_| failure("worker_closed"))?
    }

    pub(crate) async fn finish_stream(&self) -> Result<Value, Error> {
        let (tx, rx) = oneshot::channel();
        self.tx
            .send(SessionCommand::FinishStream(tx))
            .await
            .map_err(|_| failure("worker_closed"))?;
        rx.await.map_err(|_| failure("worker_closed"))?
    }

    pub(crate) async fn abort_stream(&self) {
        let (tx, rx) = oneshot::channel();
        if self.tx.send(SessionCommand::AbortStream(tx)).await.is_ok() {
            let _ = rx.await;
        }
    }

    pub(crate) async fn close(self) {
        self.cancel.cancel();
        drop(self.tx);
        let _ = self.worker.await;
    }
}
