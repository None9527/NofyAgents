//! A detached owner outlives the calling future until physical work is gone.
use super::*;
use std::{collections::BTreeMap, process::Stdio, sync::Mutex, time::Duration};
use tokio::{
    io::{AsyncRead, AsyncReadExt, AsyncWriteExt},
    sync::{Semaphore, oneshot},
};
use tokio_util::{sync::CancellationToken, task::TaskTracker};

/// Trusted launch input, not an authorization or sandbox profile. Callers
/// must supply confinement before exposing commands to untrusted programs.
pub struct Invocation {
    pub program: PathBuf,
    pub arguments: Vec<String>,
    pub environment: BTreeMap<String, String>,
    pub cwd: PathBuf,
    pub input: Vec<u8>,
    pub timeout: Duration,
    /// Separate strict bound for each of stdout and stderr.
    pub output_limit: usize,
}
#[derive(Debug)]
pub struct Output {
    pub status: std::process::ExitStatus,
    pub stdout: Vec<u8>,
    pub stderr: Vec<u8>,
}
#[derive(Clone)]
pub(super) struct Workers(Arc<WorkerState>);
struct WorkerState {
    gate: Mutex<()>,
    stop: CancellationToken,
    tasks: TaskTracker,
    slots: Arc<Semaphore>,
}
impl Default for Workers {
    fn default() -> Self {
        Self(Arc::new(WorkerState {
            gate: Mutex::new(()),
            stop: CancellationToken::new(),
            tasks: TaskTracker::new(),
            slots: Arc::new(Semaphore::new(2)),
        }))
    }
}
fn unavailable(message: impl std::fmt::Display) -> HostError {
    HostError::Unavailable(format!("process-tree supervision: {message}"))
}
impl Workers {
    pub(super) fn stopped(&self) -> bool {
        self.0.stop.is_cancelled()
    }
    fn spawn(&self, future: impl std::future::Future<Output = ()> + Send + 'static) -> Result<()> {
        // Serialize admission with close: TaskTracker permits spawning after
        // close, which alone would allow shutdown to observe a false idle.
        let _gate = self.0.gate.lock().map_err(unavailable)?;
        if self.stopped() {
            return Err(unavailable("manager is shutting down"));
        }
        let slot = self
            .0
            .slots
            .clone()
            .try_acquire_owned()
            .map_err(|_| unavailable("two supervised owners are still active"))?;
        self.0.tasks.spawn(async move {
            let _slot = slot;
            future.await;
        });
        Ok(())
    }
    pub(super) fn stop(&self) {
        let _gate = self.0.gate.lock().unwrap_or_else(|e| e.into_inner());
        self.0.stop.cancel();
        self.0.tasks.close();
    }
    async fn drain(&self) -> Result<()> {
        self.stop();
        tokio::time::timeout(Duration::from_secs(15), self.0.tasks.wait())
            .await
            .map_err(|_| {
                unavailable("physical owners have not drained; records and resources retained")
            })
    }
}
impl Manager {
    /// Stop admission and request cancellation. Use `drain` before disposing
    /// an embedded runtime; this nonblocking call does not claim completion.
    pub fn shutdown(&self) {
        self.workers.stop();
    }
    pub async fn drain(&self) -> Result<()> {
        self.workers.drain().await?;
        let manager = self.clone();
        tokio::task::spawn_blocking(move || {
            manager.recover()?;
            if manager.pending()? != 0 {
                return Err(unavailable(
                    "durable physical owners remain; drain is not complete",
                ));
            }
            Ok(())
        })
        .await
        .map_err(unavailable)?
    }
    pub fn active(&self) -> usize {
        self.workers.0.tasks.len()
    }

    /// Supervise trusted bootstrap inputs under hard limits and a PID tree.
    /// `hold` owns caches/scratch/permits until kill+wait+physical return. A
    /// cancelled or abandoned caller cannot drop those resources prematurely.
    pub async fn supervise<H: Send + 'static>(
        &self,
        config: Config,
        helper: PathBuf,
        invocation: Invocation,
        cancel: CancellationToken,
        hold: H,
    ) -> Result<Output> {
        self.supervise_inner(config, helper, invocation, cancel, hold, None)
            .await
    }
    pub(in crate::loader) async fn supervise_confined<H: Send + 'static>(
        &self,
        config: Config,
        helper: PathBuf,
        invocation: Invocation,
        cancel: CancellationToken,
        hold: H,
        sandbox: super::sandbox::Sandbox,
    ) -> Result<Output> {
        self.supervise_inner(config, helper, invocation, cancel, hold, Some(sandbox))
            .await
    }
    async fn supervise_inner<H: Send + 'static>(
        &self,
        config: Config,
        helper: PathBuf,
        invocation: Invocation,
        cancel: CancellationToken,
        hold: H,
        sandbox: Option<super::sandbox::Sandbox>,
    ) -> Result<Output> {
        config.validate()?;
        if !helper.is_absolute()
            || !(Duration::from_millis(1)..=Duration::from_secs(600)).contains(&invocation.timeout)
            || invocation.input.len() > 8 * 1024 * 1024
            || !(1..=8 * 1024 * 1024).contains(&invocation.output_limit)
        {
            return Err(HostError::Invalid(
                "invalid supervised IO or launch bounds".into(),
            ));
        }
        let profile = bootstrap::Bootstrap {
            parent_pid: std::process::id(),
            program: invocation.program,
            arguments: invocation.arguments,
            environment: invocation.environment,
            cwd: invocation.cwd,
            sandbox,
            session: None,
        };
        let wire = profile.encode()?;
        let (sender, receiver) = oneshot::channel();
        let dropped = CancellationToken::new();
        let _drop = dropped.clone().drop_guard();
        let manager = self.clone();
        self.workers.spawn(async move {
            let _hold = hold;
            let mut sender = Some(sender);
            let deadline = tokio::time::Instant::now() + invocation.timeout;
            let stopped = async {
                tokio::select! { biased;
                    _=dropped.cancelled()=>{},
                    _=cancel.cancelled()=>{},
                    _=manager.workers.0.stop.cancelled()=>{},
                }
            };
            tokio::pin!(stopped);
            let acquire = manager.clone();
            let job =
                if dropped.is_cancelled() || cancel.is_cancelled() || manager.workers.stopped() {
                    Err(unavailable("cancelled before acquisition"))
                } else {
                    // A bounded owner, not the caller, awaits blocking acquisition.
                    // Abandonment cannot discard a newly created physical group.
                    tokio::task::spawn_blocking(move || acquire.acquire(&config))
                        .await
                        .map_err(unavailable)
                        .and_then(|v| v)
                };
            let mut job = match job {
                Ok(job) => job,
                Err(error) => {
                    respond(&mut sender, Err(error));
                    return;
                }
            };
            let result = run_command(
                &job,
                helper,
                wire,
                invocation.input,
                invocation.output_limit,
                deadline,
                &mut stopped,
            )
            .await;
            // Always stop by the pinned original group, including setup/IO
            // errors. The child has been waited before physical return below.
            let mut result = Some(result);
            loop {
                let cleanup = tokio::task::spawn_blocking(move || {
                    let result = job.finish_inner();
                    (job, result)
                })
                .await;
                let (returned, cleanup) = match cleanup {
                    Ok(value) => value,
                    Err(error) => {
                        respond(
                            &mut sender,
                            Err(unavailable(format!(
                                "cleanup owner lost: {error}; resources retained"
                            ))),
                        );
                        // Unknown ownership is not proof of physical return.
                        // Keep held resources and the tracked slot until the
                        // host exits; the durable journal remains recoverable.
                        std::future::pending::<()>().await;
                        return;
                    }
                };
                job = returned;
                match cleanup {
                    Ok(()) => {
                        respond(&mut sender, result.take().expect("one result"));
                        break;
                    }
                    Err(error) => {
                        respond(
                            &mut sender,
                            Err(unavailable(format!(
                                "cleanup incomplete: {error}; resources retained"
                            ))),
                        );
                        tokio::time::sleep(Duration::from_secs(1)).await;
                    }
                }
            }
        })?;
        receiver
            .await
            .map_err(|_| unavailable("supervision owner stopped without a receipt"))?
    }
}
fn respond(sender: &mut Option<oneshot::Sender<Result<Output>>>, value: Result<Output>) {
    if let Some(sender) = sender.take() {
        let _ = sender.send(value);
    }
}
async fn read(mut stream: impl AsyncRead + Unpin, limit: usize) -> std::io::Result<Vec<u8>> {
    let mut bytes = Vec::new();
    let mut buffer = [0; 8192];
    loop {
        let count = stream.read(&mut buffer).await?;
        if count == 0 {
            return Ok(bytes);
        }
        if bytes.len() + count > limit {
            return Err(std::io::Error::other(
                "supervised output exceeds declared limit",
            ));
        }
        bytes.extend_from_slice(&buffer[..count]);
    }
}
async fn run_command(
    job: &Job,
    helper: PathBuf,
    wire: String,
    input: Vec<u8>,
    limit: usize,
    deadline: tokio::time::Instant,
    stopped: &mut (impl std::future::Future<Output = ()> + Unpin),
) -> Result<Output> {
    if tokio::time::Instant::now() >= deadline {
        return Err(unavailable("timed out before launch"));
    }
    // Resolve an already-completed stop before any command or pre-exec hook.
    tokio::select! { biased;
        _=&mut *stopped=>return Err(unavailable("cancelled before launch")),
        _=std::future::ready(())=>{},
    }
    let mut command = tokio::process::Command::new(helper);
    command
        .arg(bootstrap::ARG)
        .arg(wire)
        .env_clear()
        .current_dir("/")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .kill_on_drop(true);
    job.configure(command.as_std_mut())?;
    let mut child = command.spawn().map_err(unavailable)?;
    let pipes = (child.stdin.take(), child.stdout.take(), child.stderr.take());
    let (Some(mut stdin), Some(stdout), Some(stderr)) = pipes else {
        let _ = job.request_stop();
        let _ = child.start_kill();
        while child.wait().await.is_err() {
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
        return Err(unavailable("missing supervised process pipe"));
    };
    let result = {
        let io = async {
            let input = async {
                if let Err(error) = stdin.write_all(&input).await {
                    if error.kind() != std::io::ErrorKind::BrokenPipe {
                        return Err(error);
                    }
                }
                drop(stdin);
                Ok(())
            };
            let (status, stdout, stderr, ()) = tokio::try_join!(
                child.wait(),
                read(stdout, limit),
                read(stderr, limit),
                input
            )?;
            Ok::<_, std::io::Error>(Output {
                status,
                stdout,
                stderr,
            })
        };
        tokio::select! { biased;
            _=&mut *stopped=>Err(unavailable("cancelled")),
            _=tokio::time::sleep_until(deadline)=>Err(unavailable("timed out")),
            result=io=>result.map_err(unavailable),
        }
    };
    // start_kill only targets this owned, unreleased child. cgroup.kill and
    // PID init death cover descendants independently of sessions or PGIDs.
    let _ = job.request_stop();
    let _ = child.start_kill();
    loop {
        match child.wait().await {
            Ok(_) => break,
            Err(_) => tokio::time::sleep(Duration::from_millis(100)).await,
        }
    }
    result
}
