//! Physical model evaluators are shared by all protocol bindings. A slot is
//! held only for an actual step, never while waiting for a provider or Hook.
use super::*;
use nofy_agent_models::{
    declarative::Protocol,
    execution::{Evaluation, Executor, StreamExecutor},
};
use nofy_agent_runtime::{
    Error,
    model::{MODEL_EVALUATOR_FAILURE_CATEGORY, ModelFailure},
};
use serde::Serialize;
use serde_json::{Value, json};
use std::sync::atomic::{AtomicBool, AtomicU32, AtomicU64, AtomicUsize, Ordering};
use tokio::sync::{Mutex, Semaphore};
use tokio_util::sync::CancellationToken;
mod process;
use process::Worker;

const SLOTS: usize = 2;
pub(super) const STARTUP_EXIT_CODE: i32 = 126;
fn failed() -> Error {
    Error::Composition("isolated model evaluator is unavailable or failed".into())
}

#[derive(Clone, Copy)]
enum EvaluatorFailure {
    Startup,
    Ipc,
    Timeout,
    AbnormalExit,
}

impl EvaluatorFailure {
    fn code(self) -> &'static str {
        match self {
            Self::Startup => "startup_failed",
            Self::Ipc => "ipc_interrupted",
            Self::Timeout => "timeout",
            Self::AbnormalExit => "abnormal_exit",
        }
    }

    fn failure(self, details: Value) -> ModelFailure {
        let message = match self {
            Self::Startup => "isolated model evaluator failed to start",
            Self::Ipc => "isolated model evaluator IPC was interrupted",
            Self::Timeout => "isolated model evaluator exceeded its deadline",
            Self::AbnormalExit => "isolated model evaluator exited abnormally",
        };
        ModelFailure {
            category: MODEL_EVALUATOR_FAILURE_CATEGORY.into(),
            message: message.into(),
            status: None,
            retryable: false,
            retry_after_ms: None,
            code: Some(self.code().into()),
            details,
        }
    }
}

struct Slot {
    worker: Arc<Mutex<Option<Worker>>>,
    pid: AtomicU32,
    active_streams: AtomicUsize,
}
pub(super) struct Pool {
    slots: Vec<Slot>,
    work: Arc<Semaphore>,
    started: AtomicU64,
    next_stream_id: AtomicU64,
    watching: AtomicBool,
    cleanup_failed: AtomicBool,
    stop: CancellationToken,
}
impl Drop for Pool {
    fn drop(&mut self) {
        self.stop.cancel();
    }
}
#[derive(Serialize)]
pub struct ModelStatus {
    pub protocol: &'static str,
    pub slots: usize,
    pub in_flight: usize,
    pub started: u64,
    pub worker_pids: Vec<u32>,
    pub helper_bound: bool,
    pub stopping: bool,
    pub cleanup_failed: bool,
}
impl Pool {
    pub(super) fn new(stop: CancellationToken) -> Self {
        Self {
            slots: (0..SLOTS)
                .map(|_| Slot {
                    worker: Arc::new(Mutex::new(None)),
                    pid: AtomicU32::new(0),
                    active_streams: AtomicUsize::new(0),
                })
                .collect(),
            work: Arc::new(Semaphore::new(SLOTS)),
            started: AtomicU64::new(0),
            next_stream_id: AtomicU64::new(1),
            watching: AtomicBool::new(false),
            cleanup_failed: AtomicBool::new(false),
            stop,
        }
    }
    fn watch(pool: &Arc<Self>) {
        if pool.watching.swap(true, Ordering::SeqCst) {
            return;
        }
        let weak = Arc::downgrade(pool);
        let stop = pool.stop.clone();
        tokio::spawn(async move {
            stop.cancelled().await;
            if let Some(pool) = weak.upgrade() {
                let _ = pool.drain().await;
            }
        });
    }
    async fn drain(&self) -> std::result::Result<(), Error> {
        let _idle = self
            .work
            .clone()
            .acquire_many_owned(SLOTS as u32)
            .await
            .map_err(|_| failed())?;
        let mut error = None;
        for slot in &self.slots {
            let mut worker = slot.worker.lock().await;
            if let Some(child) = worker.as_mut() {
                if child.retire().await.is_err() {
                    self.cleanup_failed.store(true, Ordering::SeqCst);
                    error = Some(failed());
                } else {
                    *worker = None;
                    slot.pid.store(0, Ordering::SeqCst);
                }
            }
        }
        if error.is_none() {
            self.cleanup_failed.store(false, Ordering::SeqCst);
        }
        error.map_or(Ok(()), Err)
    }
    async fn acquire_slot(
        &self,
        cancel: &CancellationToken,
    ) -> std::result::Result<(usize, tokio::sync::OwnedMutexGuard<Option<Worker>>), Error> {
        let mut order: Vec<usize> = (0..self.slots.len()).collect();
        order.sort_by_key(|index| self.slots[*index].active_streams.load(Ordering::Relaxed));
        if let Some(found) = order.into_iter().find_map(|index| {
            self.slots[index]
                .worker
                .clone()
                .try_lock_owned()
                .ok()
                .map(|guard| (index, guard))
        }) {
            return Ok(found);
        }
        tokio::select! { biased;
            _ = self.stop.cancelled() => Err(Error::Cancelled),
            _ = cancel.cancelled() => Err(Error::Cancelled),
            guard = self.slots[0].worker.clone().lock_owned() => Ok((0, guard)),
        }
    }
    async fn ensure_worker(
        &self,
        loader: &Loader,
        slot: &Slot,
        guard: &mut Option<Worker>,
        cancel: &CancellationToken,
    ) -> std::result::Result<(), Error> {
        // Metadata preparation and retirement are owned to completion, even
        // when the caller is gone. Never detach a blocking preparation job.
        if let Some(worker) = guard.as_mut()
            && worker.expired()?
        {
            worker.retire().await?;
            *guard = None;
            slot.pid.store(0, Ordering::SeqCst);
        }
        if guard.is_none() {
            let worker = Worker::start(loader, cancel).await?;
            slot.pid.store(worker.pid(), Ordering::SeqCst);
            self.started.fetch_add(1, Ordering::SeqCst);
            *guard = Some(worker);
        }
        Ok(())
    }
    async fn finish_step<T>(
        &self,
        slot: &Slot,
        guard: &mut Option<Worker>,
        mut result: std::result::Result<
            std::result::Result<T, nofy_agent_models::worker::Failure>,
            Error,
        >,
        phase: Option<String>,
    ) -> std::result::Result<T, Error> {
        let failed_step = result.is_err();
        let diagnostic = match &mut result {
            Err(Error::ModelFailure(failure))
                if failure.category == MODEL_EVALUATOR_FAILURE_CATEGORY =>
            {
                if let Some(phase) = phase {
                    failure.details["phase"] = json!(phase);
                }
                Some(failure)
            }
            _ => None,
        };
        // A valid typed program failure leaves the worker usable. Broken IPC,
        // a timeout or cancellation requires physical retirement first.
        if failed_step && let Some(worker) = guard.as_mut() {
            if let Some(failure) = diagnostic
                && failure.code.as_deref() == Some(EvaluatorFailure::Ipc.code())
            {
                worker.observe_exit(failure).await;
            }
            if worker.retire().await.is_err() {
                self.cleanup_failed.store(true, Ordering::SeqCst);
            } else {
                *guard = None;
                slot.pid.store(0, Ordering::SeqCst);
            }
        }
        result?.map_err(nofy_agent_models::worker::Failure::into_runtime)
    }
    async fn evaluate(
        &self,
        loader: &Loader,
        program: Arc<Protocol>,
        input: Value,
        spent: u64,
        cap: usize,
        cancel: CancellationToken,
    ) -> std::result::Result<Evaluation, Error> {
        let (index, mut guard) = self.acquire_slot(&cancel).await?;
        let slot = &self.slots[index];
        let timeout = std::time::Duration::from_millis(program.limits.step_timeout_ms)
            + std::time::Duration::from_secs(5);
        let phase = match input.get("phase").and_then(Value::as_str) {
            Some(phase @ ("admit" | "history" | "request" | "event" | "finish" | "http_error")) => {
                Some(phase.to_owned())
            }
            _ => None,
        };
        let ready = self.ensure_worker(loader, slot, &mut guard, &cancel).await;
        let result = if let Err(error) = ready {
            Err(error)
        } else {
            let worker = guard.as_mut().ok_or_else(failed)?;
            let pid = worker.pid();
            let operation = worker.evaluate(program, input, spent, cap);
            tokio::pin!(operation);
            tokio::select! { biased;
                _ = self.stop.cancelled() => Err(Error::Cancelled),
                _ = cancel.cancelled() => Err(Error::Cancelled),
                result = tokio::time::timeout(timeout, &mut operation) => result.unwrap_or_else(|_| {
                    Err(EvaluatorFailure::Timeout.failure(json!({
                        "stage": "exchange", "timeout_ms": timeout.as_millis(), "worker_pid": pid,
                    })).into())
                }),
            }
        };
        self.finish_step(slot, &mut guard, result, phase).await
    }
    async fn begin_stream(
        &self,
        loader: &Loader,
        program: Arc<Protocol>,
        state: Value,
        cap: usize,
        cancel: CancellationToken,
    ) -> std::result::Result<(usize, u32, u64), Error> {
        let (index, mut guard) = self.acquire_slot(&cancel).await?;
        let slot = &self.slots[index];
        let timeout = std::time::Duration::from_millis(program.limits.step_timeout_ms)
            + std::time::Duration::from_secs(5);
        let stream_id = self.next_stream_id.fetch_add(1, Ordering::SeqCst);
        let ready = self.ensure_worker(loader, slot, &mut guard, &cancel).await;
        let (pid, result) = if let Err(error) = ready {
            (0, Err(error))
        } else {
            let worker = guard.as_mut().ok_or_else(failed)?;
            let pid = worker.pid();
            let operation = worker.begin_stream(program, stream_id, state, cap);
            tokio::pin!(operation);
            let result = tokio::select! { biased;
                _ = self.stop.cancelled() => Err(Error::Cancelled),
                _ = cancel.cancelled() => Err(Error::Cancelled),
                result = tokio::time::timeout(timeout, &mut operation) => result.unwrap_or_else(|_| {
                    Err(EvaluatorFailure::Timeout.failure(json!({
                        "stage": "begin_stream", "timeout_ms": timeout.as_millis(), "worker_pid": pid,
                    })).into())
                }),
            };
            (pid, result)
        };
        self.finish_step(slot, &mut guard, result, Some("event".into()))
            .await?;
        slot.active_streams.fetch_add(1, Ordering::Relaxed);
        Ok((index, pid, stream_id))
    }
    async fn push_event(
        &self,
        slot_index: usize,
        worker_pid: u32,
        stream_id: u64,
        program: Arc<Protocol>,
        frame: Value,
        spent: u64,
        cap: usize,
        cancel: CancellationToken,
    ) -> std::result::Result<Evaluation, Error> {
        let slot = &self.slots[slot_index];
        let mut guard = tokio::select! { biased;
            _ = self.stop.cancelled() => return Err(Error::Cancelled),
            _ = cancel.cancelled() => return Err(Error::Cancelled),
            guard = slot.worker.clone().lock_owned() => guard,
        };
        let timeout = std::time::Duration::from_millis(program.limits.step_timeout_ms)
            + std::time::Duration::from_secs(5);
        let result = match guard.as_mut() {
            Some(worker) if worker.pid() == worker_pid => {
                if worker.expired()? {
                    Err(EvaluatorFailure::Ipc
                        .failure(json!({
                            "stage": "stream_worker_expired",
                            "worker_pid": worker_pid,
                        }))
                        .into())
                } else {
                    let operation = worker.push_event(program, stream_id, frame, spent, cap);
                    tokio::pin!(operation);
                    tokio::select! { biased;
                        _ = self.stop.cancelled() => Err(Error::Cancelled),
                        _ = cancel.cancelled() => Err(Error::Cancelled),
                        result = tokio::time::timeout(timeout, &mut operation) => result.unwrap_or_else(|_| {
                            Err(EvaluatorFailure::Timeout.failure(json!({
                                "stage": "push_event", "timeout_ms": timeout.as_millis(), "worker_pid": worker_pid,
                            })).into())
                        }),
                    }
                }
            }
            _ => Err(EvaluatorFailure::Ipc
                .failure(json!({
                    "stage": "stream_worker_lost",
                    "worker_pid": worker_pid,
                }))
                .into()),
        };
        self.finish_step(slot, &mut guard, result, Some("event".into()))
            .await
    }
    async fn finish_stream(
        &self,
        slot_index: usize,
        worker_pid: u32,
        stream_id: u64,
        program: Arc<Protocol>,
        spent: u64,
        cap: usize,
        cancel: CancellationToken,
    ) -> std::result::Result<Evaluation, Error> {
        let slot = &self.slots[slot_index];
        let mut guard = tokio::select! { biased;
            _ = self.stop.cancelled() => return Err(Error::Cancelled),
            _ = cancel.cancelled() => return Err(Error::Cancelled),
            guard = slot.worker.clone().lock_owned() => guard,
        };
        let timeout = std::time::Duration::from_millis(program.limits.step_timeout_ms)
            + std::time::Duration::from_secs(5);
        let result = match guard.as_mut() {
            Some(worker) if worker.pid() == worker_pid => {
                if worker.expired()? {
                    Err(EvaluatorFailure::Ipc
                        .failure(json!({
                            "stage": "stream_worker_expired",
                            "worker_pid": worker_pid,
                        }))
                        .into())
                } else {
                    let operation = worker.finish_stream(program, stream_id, spent, cap);
                    tokio::pin!(operation);
                    tokio::select! { biased;
                        _ = self.stop.cancelled() => Err(Error::Cancelled),
                        _ = cancel.cancelled() => Err(Error::Cancelled),
                        result = tokio::time::timeout(timeout, &mut operation) => result.unwrap_or_else(|_| {
                            Err(EvaluatorFailure::Timeout.failure(json!({
                                "stage": "finish_stream", "timeout_ms": timeout.as_millis(), "worker_pid": worker_pid,
                            })).into())
                        }),
                    }
                }
            }
            _ => Err(EvaluatorFailure::Ipc
                .failure(json!({
                    "stage": "stream_worker_lost",
                    "worker_pid": worker_pid,
                }))
                .into()),
        };
        self.finish_step(slot, &mut guard, result, Some("finish".into()))
            .await
    }
    async fn abort_stream(&self, slot_index: usize, worker_pid: u32, stream_id: u64) {
        if self.stop.is_cancelled() {
            return;
        }
        let Ok(Ok(_permit)) = tokio::time::timeout(
            std::time::Duration::from_millis(500),
            self.work.clone().acquire_owned(),
        )
        .await
        else {
            return;
        };
        let slot = &self.slots[slot_index];
        let Ok(mut guard) = tokio::time::timeout(
            std::time::Duration::from_millis(500),
            slot.worker.clone().lock_owned(),
        )
        .await
        else {
            return;
        };
        let Some(worker) = guard.as_mut() else {
            return;
        };
        if worker.pid() != worker_pid {
            return;
        }
        let failed_abort = match worker.expired() {
            Ok(false) => {
                let operation = worker.abort_stream(stream_id);
                !matches!(
                    tokio::time::timeout(std::time::Duration::from_millis(500), operation).await,
                    Ok(Ok(()))
                )
            }
            _ => true,
        };
        if failed_abort {
            if worker.retire().await.is_err() {
                self.cleanup_failed.store(true, Ordering::SeqCst);
            } else {
                *guard = None;
                slot.pid.store(0, Ordering::SeqCst);
            }
        }
    }
}

struct HostStream {
    loader: Loader,
    slot_index: usize,
    worker_pid: u32,
    stream_id: u64,
    program: Arc<Protocol>,
    active: AtomicBool,
}

impl HostStream {
    fn deactivate(&self) -> bool {
        if self.active.swap(false, Ordering::SeqCst) {
            self.loader.models.slots[self.slot_index]
                .active_streams
                .fetch_sub(1, Ordering::Relaxed);
            true
        } else {
            false
        }
    }
}

impl Drop for HostStream {
    fn drop(&mut self) {
        if self.deactivate() {
            let pool = self.loader.models.clone();
            let slot_index = self.slot_index;
            let worker_pid = self.worker_pid;
            let stream_id = self.stream_id;
            if let Ok(handle) = tokio::runtime::Handle::try_current() {
                handle.spawn(async move {
                    pool.abort_stream(slot_index, worker_pid, stream_id).await;
                });
            }
        }
    }
}

#[async_trait::async_trait]
impl StreamExecutor for HostStream {
    async fn push_event(
        &self,
        frame: Value,
        spent: u64,
        cap: usize,
        cancel: CancellationToken,
    ) -> std::result::Result<Evaluation, Error> {
        let cancel = cancel.child_token();
        let _on_drop = cancel.clone().drop_guard();
        let permit = tokio::select! { biased;
            _ = self.loader.models.stop.cancelled() => return Err(Error::Cancelled),
            _ = cancel.cancelled() => return Err(Error::Cancelled),
            permit = self.loader.models.work.clone().acquire_owned() => permit.map_err(|_| failed())?,
        };
        let loader = self.loader.clone();
        let slot_index = self.slot_index;
        let worker_pid = self.worker_pid;
        let stream_id = self.stream_id;
        let program = self.program.clone();
        tokio::spawn(async move {
            let _permit = permit;
            loader
                .models
                .push_event(
                    slot_index, worker_pid, stream_id, program, frame, spent, cap, cancel,
                )
                .await
        })
        .await
        .map_err(|_| failed())?
    }

    async fn finish(
        &self,
        spent: u64,
        cap: usize,
        cancel: CancellationToken,
    ) -> std::result::Result<Evaluation, Error> {
        self.deactivate();
        let cancel = cancel.child_token();
        let _on_drop = cancel.clone().drop_guard();
        let permit = tokio::select! { biased;
            _ = self.loader.models.stop.cancelled() => return Err(Error::Cancelled),
            _ = cancel.cancelled() => return Err(Error::Cancelled),
            permit = self.loader.models.work.clone().acquire_owned() => permit.map_err(|_| failed())?,
        };
        let loader = self.loader.clone();
        let slot_index = self.slot_index;
        let worker_pid = self.worker_pid;
        let stream_id = self.stream_id;
        let program = self.program.clone();
        tokio::spawn(async move {
            let _permit = permit;
            loader
                .models
                .finish_stream(
                    slot_index, worker_pid, stream_id, program, spent, cap, cancel,
                )
                .await
        })
        .await
        .map_err(|_| failed())?
    }

    async fn abort(&self) {
        if self.deactivate() {
            self.loader
                .models
                .abort_stream(self.slot_index, self.worker_pid, self.stream_id)
                .await;
        }
    }
}

impl Loader {
    pub fn model_status(&self) -> ModelStatus {
        ModelStatus {
            protocol: nofy_agent_models::worker::PROTOCOL,
            slots: SLOTS,
            in_flight: SLOTS - self.models.work.available_permits(),
            started: self.models.started.load(Ordering::SeqCst),
            worker_pids: self
                .models
                .slots
                .iter()
                .map(|s| s.pid.load(Ordering::SeqCst))
                .filter(|pid| *pid != 0)
                .collect(),
            helper_bound: self.helper_ready(),
            stopping: self.models.stop.is_cancelled(),
            cleanup_failed: self.models.cleanup_failed.load(Ordering::SeqCst),
        }
    }
    pub(crate) async fn drain_model_workers(&self) -> Result<()> {
        // Quiescing for state migration retires evaluators for later reuse.
        // Host shutdown already cancels their parent acquisition token.
        self.models.drain().await.map_err(HostError::Runtime)
    }
}
#[async_trait::async_trait]
impl Executor for Loader {
    async fn evaluate(
        &self,
        program: Arc<Protocol>,
        input: Value,
        spent: u64,
        cap: usize,
        cancel: CancellationToken,
    ) -> std::result::Result<Evaluation, Error> {
        let cancel = cancel.child_token();
        let _on_drop = cancel.clone().drop_guard();
        let permit = tokio::select! { biased;
            _ = self.models.stop.cancelled() => return Err(Error::Cancelled),
            _ = cancel.cancelled() => return Err(Error::Cancelled),
            permit = self.models.work.clone().acquire_owned() => permit.map_err(|_| failed())?,
        };
        Pool::watch(&self.models);
        let loader = self.clone();
        tokio::spawn(async move {
            let _permit = permit;
            loader
                .models
                .evaluate(&loader, program, input, spent, cap, cancel)
                .await
        })
        .await
        .map_err(|_| failed())?
    }

    async fn begin_stream(
        &self,
        program: Arc<Protocol>,
        state: Value,
        cap: usize,
        cancel: CancellationToken,
    ) -> std::result::Result<Option<Box<dyn StreamExecutor>>, Error> {
        let cancel = cancel.child_token();
        let _on_drop = cancel.clone().drop_guard();
        let permit = tokio::select! { biased;
            _ = self.models.stop.cancelled() => return Err(Error::Cancelled),
            _ = cancel.cancelled() => return Err(Error::Cancelled),
            permit = self.models.work.clone().acquire_owned() => permit.map_err(|_| failed())?,
        };
        Pool::watch(&self.models);
        let loader = self.clone();
        let stream_program = program.clone();
        let (slot_index, worker_pid, stream_id) = tokio::spawn(async move {
            let _permit = permit;
            loader
                .models
                .begin_stream(&loader, program, state, cap, cancel)
                .await
        })
        .await
        .map_err(|_| failed())??;
        Ok(Some(Box::new(HostStream {
            loader: self.clone(),
            slot_index,
            worker_pid,
            stream_id,
            program: stream_program,
            active: AtomicBool::new(true),
        })))
    }
}
