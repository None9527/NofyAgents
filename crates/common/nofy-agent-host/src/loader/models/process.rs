use super::*;
use nofy_agent_models::worker::{self as abi, Operation, Reply, Request};
use std::{collections::BTreeSet, process::Stdio};
use tokio::io::{AsyncReadExt, AsyncWriteExt};

pub(super) struct Worker {
    child: tokio::process::Child,
    stdin: tokio::process::ChildStdin,
    stdout: tokio::process::ChildStdout,
    cache: BTreeSet<String>,
    sequence: u64,
    retired: bool,
    pid: u32,
}
impl Worker {
    pub(super) async fn start(
        loader: &Loader,
        cancel: &CancellationToken,
    ) -> std::result::Result<Self, Error> {
        let prepared = loader.clone();
        let helper = tokio::task::spawn_blocking(move || {
            if !cfg!(target_os = "linux") {
                return Err(failed());
            }
            let metadata =
                std::fs::symlink_metadata(&prepared.prompt_root).map_err(|_| failed())?;
            if !metadata.is_dir()
                || std::fs::canonicalize(&prepared.prompt_root).map_err(|_| failed())?
                    != prepared.prompt_root
            {
                return Err(failed());
            }
            prepared.helper().map_err(|_| failed())
        })
        .await
        .map_err(|_| failed())??;
        if loader.models.stop.is_cancelled() || cancel.is_cancelled() {
            return Err(Error::Cancelled);
        }
        let profile = isolation::Profile {
            scratch: loader.prompt_root.clone(),
            scratch_files: vec![],
            read_only: vec![],
            local_paths: vec![],
            directories: vec![],
            private_root: loader.private_root.clone(),
            parent_pid: std::process::id(),
            cpu_seconds: 601,
            environment: Default::default(),
            cache_lease: None,
        };
        // Owner: the returned worker handle holds `child` (kill_on_drop); a
        // failed handoff below kills and waits for it before returning.
        #[allow(clippy::disallowed_methods)]
        let mut child = tokio::process::Command::new(helper)
            .arg(isolation::WORKER_ARG)
            .arg(serde_json::to_string(&profile).map_err(|_| failed())?)
            .arg("--evaluate-model")
            .env_clear()
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .kill_on_drop(true)
            .spawn()
            .map_err(|_| failed())?;
        let parts = (child.id(), child.stdin.take(), child.stdout.take());
        let (Some(pid), Some(stdin), Some(stdout)) = parts else {
            let _ = child.start_kill();
            let _ = child.wait().await;
            return Err(failed());
        };
        Ok(Self {
            child,
            stdin,
            stdout,
            cache: BTreeSet::new(),
            sequence: 0,
            retired: false,
            pid,
        })
    }
    pub(super) fn pid(&self) -> u32 {
        self.pid
    }
    pub(super) fn expired(&mut self) -> std::result::Result<bool, Error> {
        if self.retired || self.child.try_wait().map_err(|_| failed())?.is_some() {
            return Ok(true);
        }
        cpu_seconds(self.pid)
            .map(|seconds| seconds >= 540)
            .map_err(|_| failed())
    }
    pub(super) async fn retire(&mut self) -> std::result::Result<(), Error> {
        self.retired = true;
        let _ = self.child.start_kill();
        self.child.wait().await.map(|_| ()).map_err(|_| failed())
    }
    async fn exchange(&mut self, operation: Operation) -> std::result::Result<Reply, Error> {
        self.sequence = self.sequence.checked_add(1).ok_or_else(failed)?;
        let bytes = abi::encode(&Request {
            protocol: abi::PROTOCOL.into(),
            sequence: self.sequence,
            operation,
        })?;
        self.stdin
            .write_u32_le(bytes.len() as u32)
            .await
            .map_err(|_| failed())?;
        self.stdin.write_all(&bytes).await.map_err(|_| failed())?;
        self.stdin.flush().await.map_err(|_| failed())?;
        let size = self.stdout.read_u32_le().await.map_err(|_| failed())? as usize;
        if size == 0 || size > abi::MAX_FRAME {
            return Err(failed());
        }
        let mut bytes = Vec::new();
        bytes.try_reserve_exact(size).map_err(|_| failed())?;
        bytes.resize(size, 0);
        self.stdout
            .read_exact(&mut bytes)
            .await
            .map_err(|_| failed())?;
        let reply: Reply = serde_json::from_slice(&bytes).map_err(|_| failed())?;
        if reply.protocol != abi::PROTOCOL
            || reply.sequence != self.sequence
            || reply.cache.len() > abi::CACHE_ENTRIES
            || reply.cache.iter().any(|id| !abi::valid_id(id))
        {
            return Err(failed());
        }
        let cache = reply.cache.iter().cloned().collect::<BTreeSet<_>>();
        if cache.len() != reply.cache.len() {
            return Err(failed());
        }
        self.cache = cache;
        Ok(reply)
    }
    pub(super) async fn evaluate(
        &mut self,
        program: Arc<Protocol>,
        input: Value,
        spent: u64,
        cap: usize,
    ) -> std::result::Result<std::result::Result<Evaluation, abi::Failure>, Error> {
        let id = nofy_agent_runtime::system::content_digest(&*program)?;
        if !self.cache.contains(&id) {
            let reply = self
                .exchange(Operation::Prepare {
                    id: id.clone(),
                    definition: (*program).clone(),
                })
                .await?;
            match reply.result {
                Ok(None) if self.cache.contains(&id) => {}
                Err(error) => return Ok(Err(error)),
                _ => return Err(failed()),
            }
        }
        let reply = self
            .exchange(Operation::Evaluate {
                id: id.clone(),
                input,
                spent,
                cap,
            })
            .await?;
        if !self.cache.contains(&id) {
            return Err(failed());
        }
        match reply.result {
            Ok(Some(reply))
                if reply.spent >= spent && reply.spent <= program.limits.max_operations =>
            {
                Ok(Ok(reply))
            }
            Err(error) => Ok(Err(error)),
            _ => Err(failed()),
        }
    }
}
#[cfg(target_os = "linux")]
fn cpu_seconds(pid: u32) -> std::io::Result<u64> {
    let mut clock = 0;
    let mut time = libc::timespec {
        tv_sec: 0,
        tv_nsec: 0,
    };
    // SAFETY: both outputs are valid initialized C ABI structures. The owned
    // Child is not reaped/reused while this read runs under the slot mutex.
    unsafe {
        let result = libc::clock_getcpuclockid(pid as libc::pid_t, &mut clock);
        if result != 0 {
            return Err(std::io::Error::from_raw_os_error(result));
        }
        if libc::clock_gettime(clock, &mut time) != 0 {
            return Err(std::io::Error::last_os_error());
        }
    }
    u64::try_from(time.tv_sec).map_err(std::io::Error::other)
}
#[cfg(not(target_os = "linux"))]
fn cpu_seconds(_: u32) -> std::io::Result<u64> {
    Err(std::io::Error::other("Linux model confinement required"))
}
