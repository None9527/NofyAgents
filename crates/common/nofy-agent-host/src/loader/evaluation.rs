//! One process supervisor for bounded, pure computations in the pinned helper.
use super::*;
use std::process::Stdio;
use tokio::io::{AsyncRead, AsyncReadExt, AsyncWriteExt};
use tokio_util::sync::CancellationToken;

pub(super) struct Job {
    pub mode: &'static str,
    pub max_output: usize,
    pub started: Arc<std::sync::atomic::AtomicU64>,
    pub unavailable: &'static str,
    pub cancelled: &'static str,
    pub cpu_seconds: u64,
    /// None preserves the existing five-second IO boundary after preparation.
    pub deadline: Option<tokio::time::Instant>,
}
impl Job {
    fn failed(&self) -> HostError {
        HostError::Unavailable(self.unavailable.into())
    }
    fn stopped(&self) -> HostError {
        HostError::Unavailable(self.cancelled.into())
    }
}
pub(super) async fn run(
    loader: &Loader,
    job: Job,
    cancel: CancellationToken,
    prepare: impl FnOnce() -> Result<Vec<u8>> + Send + 'static,
) -> Result<Vec<u8>> {
    let prepared = loader.clone();
    let unavailable = job.unavailable;
    let (helper, bytes) = tokio::task::spawn_blocking(move || -> Result<_> {
        let bytes = prepare()?;
        let fail = || HostError::Unavailable(unavailable.into());
        if !cfg!(target_os = "linux") {
            return Err(fail());
        }
        let metadata = std::fs::symlink_metadata(&prepared.prompt_root).map_err(|_| fail())?;
        if !metadata.is_dir()
            || std::fs::canonicalize(&prepared.prompt_root).map_err(|_| fail())?
                != prepared.prompt_root
        {
            return Err(fail());
        }
        Ok((prepared.helper().map_err(|_| fail())?, bytes))
    })
    .await
    .map_err(storage::unavailable)??;
    if cancel.is_cancelled() || loader.acquisition_stop.is_cancelled() {
        return Err(job.stopped());
    }
    if job
        .deadline
        .is_some_and(|deadline| deadline <= tokio::time::Instant::now())
    {
        return Err(job.failed());
    }
    let profile = isolation::Profile {
        local_paths: vec![],
        scratch: loader.prompt_root.clone(),
        scratch_files: vec![],
        read_only: vec![],
        directories: vec![],
        private_root: loader.private_root.clone(),
        parent_pid: std::process::id(),
        cpu_seconds: job.cpu_seconds,
        environment: Default::default(),
        cache_lease: None,
    };
    // Owner: this function (kill_on_drop; waited under the job deadline below,
    // killed on the missing-pipe path).
    #[allow(clippy::disallowed_methods)]
    let mut child = tokio::process::Command::new(helper)
        .arg(isolation::WORKER_ARG)
        .arg(serde_json::to_string(&profile).map_err(|_| job.failed())?)
        .arg(job.mode)
        .env_clear()
        .kill_on_drop(true)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|_| job.failed())?;
    job.started
        .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    let (Some(mut stdin), Some(stdout), Some(stderr)) =
        (child.stdin.take(), child.stdout.take(), child.stderr.take())
    else {
        let _ = child.start_kill();
        child.wait().await.map_err(|_| job.failed())?;
        return Err(job.failed());
    };
    let deadline = job
        .deadline
        .unwrap_or_else(|| tokio::time::Instant::now() + std::time::Duration::from_secs(5));
    let outcome = {
        let io = async {
            let (_, output, _, status) = tokio::try_join!(
                async move {
                    stdin.write_all(&bytes).await?;
                    stdin.shutdown().await
                },
                read(stdout, job.max_output),
                read(stderr, 65536),
                child.wait()
            )?;
            Ok::<_, std::io::Error>((output, status))
        };
        tokio::pin!(io);
        tokio::select! {biased;
            _=cancel.cancelled()=>Err(job.stopped()),
            _=loader.acquisition_stop.cancelled()=>Err(job.stopped()),
            _=tokio::time::sleep_until(deadline)=>Err(job.failed()),
            result=&mut io=>result.map_err(|_|job.failed()),
        }
    };
    let (bytes, status) = match outcome {
        Ok(result) => result,
        Err(error) => {
            let _ = child.start_kill();
            child.wait().await.map_err(|_| job.failed())?;
            return Err(error);
        }
    };
    if !status.success() {
        return Err(job.failed());
    }
    Ok(bytes)
}
async fn read(input: impl AsyncRead + Unpin, limit: usize) -> std::io::Result<Vec<u8>> {
    let mut bytes = Vec::new();
    input.take(limit as u64 + 1).read_to_end(&mut bytes).await?;
    if bytes.len() > limit {
        return Err(std::io::Error::other("evaluation worker output limit"));
    }
    Ok(bytes)
}
