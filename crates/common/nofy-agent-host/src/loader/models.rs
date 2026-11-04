//! Physical model evaluators are shared by all protocol bindings. A slot is
//! held only for an actual step, never while waiting for a provider or Hook.
use super::*;
use nofy_agent_models::{
    declarative::Protocol,
    execution::{Evaluation, Executor},
};
use nofy_agent_runtime::Error;
use serde::Serialize;
use serde_json::Value;
use std::sync::atomic::{AtomicBool, AtomicU32, AtomicU64, Ordering};
use tokio::sync::{Mutex, Semaphore};
use tokio_util::sync::CancellationToken;
mod process;
use process::Worker;

const SLOTS: usize = 2;
fn failed() -> Error {
    Error::Composition("isolated model evaluator is unavailable or failed".into())
}
struct Slot {
    worker: Arc<Mutex<Option<Worker>>>,
    pid: AtomicU32,
}
pub(super) struct Pool {
    slots: Vec<Slot>,
    work: Arc<Semaphore>,
    started: AtomicU64,
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
                })
                .collect(),
            work: Arc::new(Semaphore::new(SLOTS)),
            started: AtomicU64::new(0),
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
    async fn evaluate(
        &self,
        loader: &Loader,
        program: Arc<Protocol>,
        input: Value,
        spent: u64,
        cap: usize,
        cancel: CancellationToken,
    ) -> std::result::Result<Evaluation, Error> {
        let (index, mut guard) = if let Some(found) =
            self.slots.iter().enumerate().find_map(|(index, slot)| {
                slot.worker
                    .clone()
                    .try_lock_owned()
                    .ok()
                    .map(|guard| (index, guard))
            }) {
            found
        } else {
            tokio::select! { biased;
                _ = self.stop.cancelled() => return Err(Error::Cancelled),
                _ = cancel.cancelled() => return Err(Error::Cancelled),
                guard = self.slots[0].worker.clone().lock_owned() => (0, guard),
            }
        };
        let slot = &self.slots[index];
        let timeout = std::time::Duration::from_millis(program.limits.step_timeout_ms)
            + std::time::Duration::from_secs(5);
        // Metadata preparation and retirement are owned to completion, even
        // when the caller is gone. Never detach a blocking preparation job.
        let ready = async {
            if let Some(worker) = guard.as_mut() {
                if worker.expired()? {
                    worker.retire().await?;
                    *guard = None;
                    slot.pid.store(0, Ordering::SeqCst);
                }
            }
            if guard.is_none() {
                let worker = Worker::start(loader, &cancel).await?;
                slot.pid.store(worker.pid(), Ordering::SeqCst);
                self.started.fetch_add(1, Ordering::SeqCst);
                *guard = Some(worker);
            }
            Ok::<_, Error>(())
        }
        .await;
        let result = if let Err(error) = ready {
            Err(error)
        } else {
            let operation = guard
                .as_mut()
                .ok_or_else(failed)?
                .evaluate(program, input, spent, cap);
            tokio::pin!(operation);
            tokio::select! { biased;
                _ = self.stop.cancelled() => Err(Error::Cancelled),
                _ = cancel.cancelled() => Err(Error::Cancelled),
                result = tokio::time::timeout(timeout, &mut operation) => result.unwrap_or_else(|_| Err(failed())),
            }
        };
        // A valid typed program failure leaves the worker usable. Broken IPC,
        // a timeout or cancellation requires physical retirement first.
        if result.is_err() {
            if let Some(worker) = guard.as_mut() {
                if worker.retire().await.is_err() {
                    self.cleanup_failed.store(true, Ordering::SeqCst);
                    return Err(failed());
                }
                *guard = None;
                slot.pid.store(0, Ordering::SeqCst);
            }
        }
        result?.map_err(nofy_agent_models::worker::Failure::into_runtime)
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
}
