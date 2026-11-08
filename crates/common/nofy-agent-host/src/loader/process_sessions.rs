//! Namespace-owned execution, durable receipts and interactive byte streams.
//! Cgroup aggregate quotas remain a separate, explicitly delegated backend.
use super::*;
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::{collections::BTreeMap, sync::Mutex};
use tokio_util::{sync::CancellationToken, task::TaskTracker};
mod io;
pub mod network;
mod owner;
pub(in crate::loader) use owner::Launch;

#[allow(unused_imports)]
pub(super) use super::process_policy::LimitsFactory;
pub use super::process_policy::{FilesystemMode, Limits};

#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub(in crate::loader) struct Setup {
    pub gate_fd: i32,
    pub terminal: bool,
    pub limits: Limits,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub network_fd: Option<i32>,
}
impl Setup {
    pub fn validate(&self) -> Result<()> {
        if self.gate_fd != 198
            || self.network_fd != self.limits.network_proxy.as_ref().map(|_| network::FD)
        {
            return Err(HostError::Invalid("invalid handoff descriptor".into()));
        }
        self.limits.validate()
    }
    /// Only a fresh, single-threaded helper reads the inherited handoff pipe.
    pub fn handoff(&self) -> std::io::Result<()> {
        let mut byte = 0u8;
        loop {
            let n = unsafe { libc::read(self.gate_fd, (&mut byte as *mut u8).cast(), 1) };
            if n == 1 && byte == 1 {
                break;
            }
            if n < 0 && std::io::Error::last_os_error().kind() == std::io::ErrorKind::Interrupted {
                continue;
            }
            return Err(std::io::Error::other(
                "supervisor did not commit process handoff",
            ));
        }
        unsafe {
            libc::close(self.gate_fd);
        }
        Ok(())
    }
    pub fn apply(&self) -> std::io::Result<()> {
        if self.network_fd.is_some() {
            unsafe {
                libc::close(network::FD);
            }
        }
        if self.terminal
            && (unsafe { libc::setsid() } < 0 || unsafe { libc::ioctl(0, libc::TIOCSCTTY, 0) } < 0)
        {
            return Err(std::io::Error::last_os_error());
        }
        for (resource, value) in [
            (libc::RLIMIT_CPU, self.limits.cpu_seconds),
            (libc::RLIMIT_AS, self.limits.address_space_bytes),
        ] {
            let limit = libc::rlimit {
                rlim_cur: value,
                rlim_max: value,
            };
            if unsafe { libc::setrlimit(resource, &limit) } != 0 {
                return Err(std::io::Error::last_os_error());
            }
        }
        Ok(())
    }
}
#[derive(Clone, Serialize, Deserialize)]
pub struct Bytes {
    pub offset: u64,
    pub data: Vec<u8>,
}
impl Bytes {
    fn append(&mut self, bytes: &[u8], limit: usize) {
        self.data.extend_from_slice(bytes);
        if self.data.len() > limit {
            let dropped = self.data.len() - limit;
            self.data.drain(..dropped);
            self.offset += dropped as u64;
        }
    }
    fn view(&self, cursor: u64, limit: usize) -> Value {
        let start = cursor
            .max(self.offset)
            .min(self.offset + self.data.len() as u64);
        let offset = (start - self.offset) as usize;
        let bytes = &self.data[offset..(offset + limit).min(self.data.len())];
        use base64::Engine;
        json!({"cursor":start,"next_cursor":start+bytes.len() as u64,"dropped_before":self.offset,
            "data_base64":base64::engine::general_purpose::STANDARD.encode(bytes),"text":String::from_utf8_lossy(bytes)})
    }
}
#[derive(Clone, Serialize, Deserialize)]
pub struct Receipt {
    pub digest: String,
    pub state: String,
    pub bytes: usize,
}
#[derive(Clone, Serialize, Deserialize)]
pub struct Record {
    pub session_id: String,
    pub owner: String,
    pub resource: String,
    pub start_id: String,
    pub revision: u64,
    pub state: String,
    pub terminal: bool,
    pub exit_code: Option<i32>,
    pub error: Option<String>,
    pub stdout: Bytes,
    pub stderr: Bytes,
    pub inputs: BTreeMap<String, Receipt>,
    pub launch_digest: String,
}
impl Record {
    fn terminal(&self) -> bool {
        matches!(
            self.state.as_str(),
            "exited" | "closed" | "timed_out" | "failed" | "abandoned"
        )
    }
    pub fn view(&self, stdout: u64, stderr: u64, limit: usize) -> Value {
        json!({"session_id":self.session_id,"owner":self.owner,"resource":self.resource,"start_id":self.start_id,
            "revision":self.revision,"state":self.state,"terminal":self.terminal,"exit_code":self.exit_code,
            "error":self.error,"eof":self.terminal(),"inputs":self.inputs,
            "stdout":self.stdout.view(stdout,limit),"stderr":self.stderr.view(stderr,limit)})
    }
}
struct Live {
    record: Mutex<Record>,
    commands: tokio::sync::mpsc::Sender<owner::Command>,
    changed: tokio::sync::Notify,
    stop: CancellationToken,
}
struct State {
    root: PathBuf,
    entries: Mutex<BTreeMap<String, Arc<Live>>>,
    gate: Mutex<()>,
    stop: CancellationToken,
    tasks: TaskTracker,
    slots: Arc<tokio::sync::Semaphore>,
}
#[derive(Clone)]
pub struct Manager(Arc<State>);
fn unavailable(e: impl std::fmt::Display) -> HostError {
    HostError::Unavailable(format!("process session: {e}"))
}
fn conflict() -> HostError {
    HostError::Control(nofy_agent_runtime::control::ControlError::CommandConflict)
}
impl Manager {
    pub fn open(root: &Path) -> Result<Self> {
        let root = storage::directory(root)?;
        let mut entries = BTreeMap::new();
        for entry in std::fs::read_dir(&root).map_err(unavailable)? {
            let path = entry.map_err(unavailable)?.path();
            if path.extension().and_then(|s| s.to_str()) != Some("json") {
                continue;
            }
            let mut record: Record =
                serde_json::from_slice(&storage::read(&path, 96 * 1024 * 1024)?)
                    .map_err(unavailable)?;
            if path.file_stem().and_then(|s| s.to_str()) != Some(&record.session_id) {
                return Err(unavailable("record identity changed"));
            }
            if !record.terminal() {
                record.state = "abandoned".into();
                record.revision += 1;
                record.error=Some("Host restarted; OS process is not resumable; pending input delivery is uncertain".into());
                for receipt in record.inputs.values_mut().filter(|r| r.state == "prepared") {
                    receipt.state = "uncertain".into();
                }
                storage::atomic(
                    &path,
                    &serde_json::to_vec(&record).map_err(unavailable)?,
                    0o600,
                    true,
                )?;
            }
            let (commands, _) = tokio::sync::mpsc::channel(1);
            entries.insert(
                record.session_id.clone(),
                Arc::new(Live {
                    record: Mutex::new(record),
                    commands,
                    changed: Default::default(),
                    stop: CancellationToken::new(),
                }),
            );
        }
        Ok(Self(Arc::new(State {
            root,
            entries: Mutex::new(entries),
            gate: Mutex::new(()),
            stop: CancellationToken::new(),
            tasks: TaskTracker::new(),
            slots: Arc::new(tokio::sync::Semaphore::new(8)),
        })))
    }
    fn persist(&self, live: &Live) -> Result<()> {
        let record = live.record.lock().map_err(unavailable)?;
        storage::atomic(
            &self.0.root.join(format!("{}.json", record.session_id)),
            &serde_json::to_vec(&*record).map_err(unavailable)?,
            0o600,
            true,
        )
    }
    fn entry(&self, id: &str, owner: &str, resource: &str) -> Result<Arc<Live>> {
        let live = self
            .0
            .entries
            .lock()
            .map_err(unavailable)?
            .get(id)
            .cloned()
            .ok_or(HostError::NotFound)?;
        {
            let r = live.record.lock().map_err(unavailable)?;
            if r.owner != owner || r.resource != resource {
                return Err(HostError::Forbidden);
            }
        }
        Ok(live)
    }
    pub fn poll(
        &self,
        id: &str,
        owner: &str,
        resource: &str,
        stdout: u64,
        stderr: u64,
        limit: usize,
    ) -> Result<Value> {
        if !(1..=1024 * 1024).contains(&limit) {
            return Err(HostError::Invalid(
                "poll byte limit must be 1..1048576".into(),
            ));
        }
        let live = self.entry(id, owner, resource)?;
        self.persist(&live)?;
        let record = live.record.lock().map_err(unavailable)?;
        if stdout > record.stdout.offset + record.stdout.data.len() as u64
            || stderr > record.stderr.offset + record.stderr.data.len() as u64
        {
            return Err(HostError::Invalid(
                "output cursor is ahead of stream".into(),
            ));
        }
        Ok(record.view(stdout, stderr, limit))
    }
    pub async fn wait(
        &self,
        id: &str,
        owner: &str,
        resource: &str,
        revision: u64,
        millis: u64,
    ) -> Result<()> {
        let live = self.entry(id, owner, resource)?;
        let notification = live.changed.notified();
        tokio::pin!(notification);
        notification.as_mut().enable();
        if live.record.lock().map_err(unavailable)?.revision != revision {
            return Ok(());
        }
        let _ = tokio::time::timeout(
            std::time::Duration::from_millis(millis.min(30000)),
            notification,
        )
        .await;
        Ok(())
    }
    pub async fn write(
        &self,
        id: &str,
        owner: &str,
        resource: &str,
        command_id: &str,
        bytes: Vec<u8>,
        eof: bool,
    ) -> Result<Value> {
        owner::write(self, id, owner, resource, command_id, bytes, eof).await
    }
    pub async fn resize(
        &self,
        id: &str,
        owner: &str,
        resource: &str,
        rows: u16,
        columns: u16,
    ) -> Result<Value> {
        if rows == 0 || columns == 0 || rows > 1000 || columns > 1000 {
            return Err(HostError::Invalid("invalid terminal size".into()));
        }
        let live = self.entry(id, owner, resource)?;
        let (reply, result) = tokio::sync::oneshot::channel();
        live.commands
            .send(owner::Command::Resize {
                rows,
                columns,
                reply,
            })
            .await
            .map_err(unavailable)?;
        result.await.map_err(unavailable)??;
        self.poll(id, owner, resource, 0, 0, 65536)
    }
    pub async fn close(&self, id: &str, owner: &str, resource: &str) -> Result<Value> {
        let live = self.entry(id, owner, resource)?;
        live.stop.cancel();
        loop {
            let notified = live.changed.notified();
            tokio::pin!(notified);
            notified.as_mut().enable();
            if live.record.lock().map_err(unavailable)?.terminal() {
                break;
            }
            notified.await;
        }
        self.poll(id, owner, resource, 0, 0, 65536)
    }
    pub fn shutdown(&self) {
        let _gate = self.0.gate.lock().unwrap_or_else(|e| e.into_inner());
        self.0.stop.cancel();
        self.0.tasks.close();
    }
    pub async fn drain(&self) -> Result<()> {
        self.shutdown();
        self.0.tasks.wait().await;
        Ok(())
    }
}
