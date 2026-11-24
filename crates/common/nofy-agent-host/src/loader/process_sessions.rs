//! Namespace-owned execution, durable receipts and interactive byte streams.
//! Cgroup aggregate quotas remain a separate, explicitly delegated backend.
use super::*;
use nofy_agent_runtime::{Error, registry::*, system::content_digest};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    sync::{
        Mutex,
        atomic::{AtomicBool, AtomicU64, Ordering},
    },
    time::{Duration, SystemTime, UNIX_EPOCH},
};
use tokio_util::{sync::CancellationToken, task::TaskTracker};
mod io;
pub mod network;
mod owner;
pub(in crate::loader) use owner::Launch;

const ONE_SHOT_RESOURCE: &str = "namespace-one-shot";
const DEFAULT_MAX_TERMINAL_RECORDS: usize = 128;
const DEFAULT_TERMINAL_TTL: Duration = Duration::from_secs(3600);
const ONE_SHOT_ORPHAN_TTL: Duration = Duration::from_secs(30);
const DRAIN_TIMEOUT: Duration = Duration::from_secs(15);

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
        .min(u128::from(u64::MAX)) as u64
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct Limits {
    pub cpu_seconds: u64,
    pub address_space_bytes: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub network_proxy: Option<network::Config>,
    pub filesystem_mode: FilesystemMode,
    pub writable_directories: std::collections::BTreeSet<String>,
}
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FilesystemMode {
    ReadOnly,
    WorkspaceWrite,
    #[default]
    FullAccess,
}
impl Default for Limits {
    fn default() -> Self {
        Self {
            cpu_seconds: 120,
            address_space_bytes: 2 * 1024 * 1024 * 1024,
            network_proxy: None,
            filesystem_mode: FilesystemMode::FullAccess,
            writable_directories: std::collections::BTreeSet::from(["WORKSPACE".into()]),
        }
    }
}
impl Limits {
    pub fn validate(&self) -> Result<()> {
        if self.writable_directories.len() > 8
            || self.writable_directories.iter().any(|alias| {
                alias.is_empty()
                    || alias.len() > 32
                    || !alias.as_bytes()[0].is_ascii_uppercase()
                    || !alias
                        .bytes()
                        .all(|b| b.is_ascii_uppercase() || b.is_ascii_digit() || b == b'_')
            })
        {
            return Err(HostError::Invalid(
                "invalid writable directory aliases".into(),
            ));
        }
        if let Some(network) = &self.network_proxy {
            network.validate()?;
        }
        if !(1..=600).contains(&self.cpu_seconds)
            || !(64 * 1024 * 1024..=16 * 1024 * 1024 * 1024).contains(&self.address_space_bytes)
        {
            return Err(HostError::Invalid(
                "invalid per-process namespace limits".into(),
            ));
        }
        Ok(())
    }
}
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
        let result = loop {
            // SAFETY: `self.gate_fd` is validated to be the inherited handoff
            // pipe descriptor (198) installed by `io::gate()`, and `&mut byte`
            // is a valid 1-byte writable stack pointer for the 1-byte read.
            let n = unsafe { libc::read(self.gate_fd, (&mut byte as *mut u8).cast(), 1) };
            if n == 1 && byte == 1 {
                break Ok(());
            }
            if n < 0 && std::io::Error::last_os_error().kind() == std::io::ErrorKind::Interrupted {
                continue;
            }
            break Err(std::io::Error::other(
                "supervisor did not commit process handoff",
            ));
        };
        // SAFETY: `self.gate_fd` is owned solely by this post-exec helper (no
        // Rust wrapper holds it) and is closed once on every exit path so it
        // cannot leak into the child process.
        unsafe {
            libc::close(self.gate_fd);
        }
        result
    }
    pub fn apply(&self) -> std::io::Result<()> {
        if self.network_fd.is_some() {
            // SAFETY: Defensively ensures the broker descriptor (`network::FD`,
            // 199) cannot survive into untrusted business code; no Rust owner
            // wraps raw FD 199 in this freshly forked child (EBADF if already
            // closed by PID 1 in `spawn_proxy` is harmless).
            unsafe {
                libc::close(network::FD);
            }
        }
        if self.terminal {
            // SAFETY: This freshly forked child is not a process group leader;
            // `setsid` takes no pointers and detaches it into a new session.
            if unsafe { libc::setsid() } < 0 {
                return Err(std::io::Error::last_os_error());
            }
            // SAFETY: FD 0 was connected to the PTY slave by `Terminal::configure`;
            // `TIOCSCTTY` takes an integer flag (`0` = do not steal) and sets
            // the controlling terminal for this new session leader.
            if unsafe { libc::ioctl(0, libc::TIOCSCTTY, 0) } < 0 {
                return Err(std::io::Error::last_os_error());
            }
        }
        for (resource, value) in [
            (libc::RLIMIT_CPU, self.limits.cpu_seconds),
            (libc::RLIMIT_AS, self.limits.address_space_bytes),
        ] {
            let limit = libc::rlimit {
                rlim_cur: value,
                rlim_max: value,
            };
            // SAFETY: `&limit` is a valid initialized `libc::rlimit` struct for
            // the duration of `setrlimit`, restricting only this disposable
            // single-threaded guest child prior to `exec`.
            if unsafe { libc::setrlimit(resource, &limit) } != 0 {
                return Err(std::io::Error::last_os_error());
            }
        }
        Ok(())
    }
}
pub(super) struct LimitsFactory;
impl ModuleFactory for LimitsFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "resource.process_namespace_limits".into(),
            revision: "1".into(),
            kind: ModuleKind::Resource,
            config_schema: json!({"type":"object","additionalProperties":false,"properties":{
                "filesystem_mode":{"enum":["read_only","workspace_write","full_access"],"default":"full_access"},
                "writable_directories":{"type":"array","maxItems":8,"uniqueItems":true,"items":{"type":"string","minLength":1,"maxLength":32,"pattern":"^[A-Z][A-Z0-9_]*$"}},
                "network_proxy":{"anyOf":[network::schema(),{"type":"null"}]},
                "cpu_seconds":{"type":"integer","minimum":1,"maximum":600},
                "address_space_bytes":{"type":"integer","minimum":67108864,"maximum":17179869184u64}}}),
            input_schema: None,
            output_schema: None,
            dependencies: Default::default(),
            required_capabilities: Default::default(),
        }
    }
    fn build(
        &self,
        value: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> std::result::Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        let limits: Limits =
            serde_json::from_value(value.clone()).map_err(|e| Error::Composition(e.to_string()))?;
        limits
            .validate()
            .map_err(|e| Error::Composition(e.to_string()))?;
        Ok(ModuleInstance::Resource(Arc::new(ResourceHandle::new(
            format!("namespace-limits:{}", content_digest(&limits)?),
            Arc::new(limits),
        )?)))
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
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub finished_at_ms: Option<u64>,
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
    persist_lock: tokio::sync::Mutex<()>,
    persisted_revision: AtomicU64,
    persist_scheduled: AtomicBool,
    removed: AtomicBool,
}
struct State {
    root: PathBuf,
    entries: Mutex<BTreeMap<String, Arc<Live>>>,
    gate: Mutex<()>,
    stop: CancellationToken,
    tasks: TaskTracker,
    slots: Arc<tokio::sync::Semaphore>,
    max_terminal_records: usize,
    terminal_ttl: Duration,
}
#[derive(Clone)]
pub struct Manager(Arc<State>);
fn unavailable(e: impl std::fmt::Display) -> HostError {
    HostError::Unavailable(format!("process session: {e}"))
}
fn conflict() -> HostError {
    HostError::Control(nofy_agent_runtime::control::ControlError::CommandConflict)
}
fn is_expired(finished_at_ms: Option<u64>, now: u64, ttl: Duration) -> bool {
    let ttl_ms = ttl.as_millis().min(u128::from(u64::MAX)) as u64;
    if ttl_ms == 0 {
        return true;
    }
    finished_at_ms.is_some_and(|finished| now.saturating_sub(finished) >= ttl_ms)
}
fn remove_record_file(path: &Path) {
    match std::fs::remove_file(path) {
        Ok(()) => {}
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}
        Err(error) => eprintln!(
            "process session cleanup failed for {}: {error}",
            path.display()
        ),
    }
}
impl Manager {
    pub fn open(root: &Path) -> Result<Self> {
        Self::open_with_retention(root, DEFAULT_MAX_TERMINAL_RECORDS, DEFAULT_TERMINAL_TTL)
    }
    pub fn open_with_retention(
        root: &Path,
        max_terminal_records: usize,
        terminal_ttl: Duration,
    ) -> Result<Self> {
        let root = storage::directory(root)?;
        let now = now_ms();
        let mut entries = BTreeMap::new();
        let mut terminal_ids: Vec<(u64, String)> = Vec::new();
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
                record.finished_at_ms = Some(now);
                record.error = Some(
                    "Host restarted; OS process is not resumable; pending input delivery is uncertain"
                        .into(),
                );
                for receipt in record.inputs.values_mut().filter(|r| r.state == "prepared") {
                    receipt.state = "uncertain".into();
                }
                if record.resource == ONE_SHOT_RESOURCE {
                    remove_record_file(&path);
                    continue;
                }
                storage::atomic(
                    &path,
                    &serde_json::to_vec(&record).map_err(unavailable)?,
                    0o600,
                    true,
                )?;
            } else {
                if record.resource == ONE_SHOT_RESOURCE
                    || is_expired(record.finished_at_ms, now, terminal_ttl)
                {
                    remove_record_file(&path);
                    continue;
                }
                if record.finished_at_ms.is_none() {
                    record.finished_at_ms = Some(now);
                }
            }
            let finished = record.finished_at_ms.unwrap_or(now);
            let persisted_revision = record.revision;
            let session_id = record.session_id.clone();
            let (commands, _) = tokio::sync::mpsc::channel(1);
            entries.insert(
                session_id.clone(),
                Arc::new(Live {
                    record: Mutex::new(record),
                    commands,
                    changed: Default::default(),
                    stop: CancellationToken::new(),
                    persist_lock: tokio::sync::Mutex::new(()),
                    persisted_revision: AtomicU64::new(persisted_revision),
                    persist_scheduled: AtomicBool::new(false),
                    removed: AtomicBool::new(false),
                }),
            );
            terminal_ids.push((finished, session_id));
        }
        if terminal_ids.len() > max_terminal_records {
            terminal_ids.sort_by(|a, b| a.0.cmp(&b.0).then_with(|| a.1.cmp(&b.1)));
            let excess = terminal_ids.len() - max_terminal_records;
            for (_, session_id) in terminal_ids.into_iter().take(excess) {
                entries.remove(&session_id);
                remove_record_file(&root.join(format!("{session_id}.json")));
            }
        }
        Ok(Self(Arc::new(State {
            root,
            entries: Mutex::new(entries),
            gate: Mutex::new(()),
            stop: CancellationToken::new(),
            tasks: TaskTracker::new(),
            slots: Arc::new(tokio::sync::Semaphore::new(8)),
            max_terminal_records,
            terminal_ttl,
        })))
    }
    pub fn record_count(&self) -> usize {
        self.0.entries.lock().map(|e| e.len()).unwrap_or(0)
    }
    async fn persist_async(&self, live: &Arc<Live>) -> Result<()> {
        let _guard = live.persist_lock.lock().await;
        if live.removed.load(Ordering::Acquire) {
            return Ok(());
        }
        let (path, bytes, revision) = {
            let record = live.record.lock().map_err(unavailable)?;
            let path = self.0.root.join(format!("{}.json", record.session_id));
            let bytes = serde_json::to_vec(&*record).map_err(unavailable)?;
            (path, bytes, record.revision)
        };
        tokio::task::spawn_blocking(move || storage::atomic(&path, &bytes, 0o600, true))
            .await
            .map_err(unavailable)??;
        live.persisted_revision
            .fetch_max(revision, Ordering::Release);
        Ok(())
    }
    fn schedule_persist(&self, live: &Arc<Live>) {
        if live.removed.load(Ordering::Acquire) {
            return;
        }
        if live
            .persist_scheduled
            .compare_exchange(false, true, Ordering::AcqRel, Ordering::Acquire)
            .is_err()
        {
            return;
        }
        if tokio::runtime::Handle::try_current().is_err() {
            live.persist_scheduled.store(false, Ordering::Release);
            return;
        }
        let manager = self.clone();
        let live = live.clone();
        let _gate = self.0.gate.lock().unwrap_or_else(|e| e.into_inner());
        if self.0.stop.is_cancelled() {
            live.persist_scheduled.store(false, Ordering::Release);
            return;
        }
        self.0.tasks.spawn(async move {
            let _ = manager.persist_async(&live).await;
            live.persist_scheduled.store(false, Ordering::Release);
        });
    }
    async fn remove_terminal_record(&self, session_id: &str, live: &Arc<Live>) {
        let _guard = live.persist_lock.lock().await;
        live.removed.store(true, Ordering::Release);
        if let Ok(mut entries) = self.0.entries.lock()
            && entries
                .get(session_id)
                .is_some_and(|current| Arc::ptr_eq(current, live))
        {
            entries.remove(session_id);
        }
        let path = self.0.root.join(format!("{session_id}.json"));
        let _ = tokio::task::spawn_blocking(move || remove_record_file(&path)).await;
    }
    async fn prune_terminal_async(&self) {
        let now = now_ms();
        let one_shot_grace_ms = ONE_SHOT_ORPHAN_TTL.as_millis() as u64;
        let mut to_remove: Vec<(String, Arc<Live>)> = Vec::new();
        let mut retained_terminal: Vec<(u64, String, Arc<Live>)> = Vec::new();
        {
            let Ok(entries) = self.0.entries.lock() else {
                return;
            };
            for (id, live) in entries.iter() {
                if live.removed.load(Ordering::Acquire) {
                    continue;
                }
                let Ok(record) = live.record.lock() else {
                    continue;
                };
                if !record.terminal() {
                    continue;
                }
                let finished = record.finished_at_ms.unwrap_or(0);
                if record.resource == ONE_SHOT_RESOURCE {
                    if now.saturating_sub(finished) >= one_shot_grace_ms {
                        to_remove.push((id.clone(), live.clone()));
                    }
                    continue;
                }
                if is_expired(record.finished_at_ms, now, self.0.terminal_ttl) {
                    to_remove.push((id.clone(), live.clone()));
                } else {
                    retained_terminal.push((finished, id.clone(), live.clone()));
                }
            }
        }
        if retained_terminal.len() > self.0.max_terminal_records {
            retained_terminal.sort_by(|a, b| a.0.cmp(&b.0).then_with(|| a.1.cmp(&b.1)));
            let excess = retained_terminal.len() - self.0.max_terminal_records;
            for (_, id, live) in retained_terminal.into_iter().take(excess) {
                to_remove.push((id, live));
            }
        }
        for (id, live) in to_remove {
            self.remove_terminal_record(&id, &live).await;
        }
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
        let (view, dirty) = {
            let record = live.record.lock().map_err(unavailable)?;
            if stdout > record.stdout.offset + record.stdout.data.len() as u64
                || stderr > record.stderr.offset + record.stderr.data.len() as u64
            {
                return Err(HostError::Invalid(
                    "output cursor is ahead of stream".into(),
                ));
            }
            let dirty = record.revision > live.persisted_revision.load(Ordering::Acquire);
            (record.view(stdout, stderr, limit), dirty)
        };
        if dirty {
            self.schedule_persist(&live);
        }
        Ok(view)
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
        let changed = {
            let record = live.record.lock().map_err(unavailable)?;
            record.revision != revision
        };
        if changed {
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
            let done = {
                let record = live.record.lock().map_err(unavailable)?;
                record.terminal()
            };
            if done {
                break;
            }
            notified.await;
        }
        self.persist_async(&live).await?;
        self.poll(id, owner, resource, 0, 0, 65536)
    }
    pub fn shutdown(&self) {
        let _gate = self.0.gate.lock().unwrap_or_else(|e| e.into_inner());
        self.0.stop.cancel();
        self.0.tasks.close();
    }
    pub async fn drain(&self) -> Result<()> {
        self.shutdown();
        tokio::time::timeout(DRAIN_TIMEOUT, self.0.tasks.wait())
            .await
            .map_err(|_| unavailable("process sessions have not drained within timeout"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn synthetic_record(
        id: &str,
        resource: &str,
        state: &str,
        finished_at_ms: Option<u64>,
    ) -> Record {
        Record {
            session_id: id.into(),
            owner: "test-owner".into(),
            resource: resource.into(),
            start_id: id.into(),
            revision: 1,
            state: state.into(),
            terminal: false,
            exit_code: Some(0),
            error: None,
            stdout: Bytes {
                offset: 0,
                data: vec![],
            },
            stderr: Bytes {
                offset: 0,
                data: vec![],
            },
            inputs: BTreeMap::new(),
            launch_digest: "digest".into(),
            finished_at_ms,
        }
    }

    fn json_count(dir: &Path) -> usize {
        std::fs::read_dir(dir)
            .unwrap()
            .filter_map(|e| e.ok())
            .filter(|e| e.path().extension().and_then(|s| s.to_str()) == Some("json"))
            .count()
    }

    #[tokio::test]
    async fn bounded_retention_evicts_expired_and_excess_terminal_records_and_prunes_one_shots() {
        let dir = tempfile::tempdir().unwrap();
        let root = dir.path().join("sessions");
        let manager = Manager::open_with_retention(&root, 3, Duration::from_secs(60)).unwrap();
        let now = now_ms();

        // Insert 5 finished interactive records (2 oldest should be evicted to keep 3),
        // 1 expired interactive record, and 1 orphaned finished one-shot record.
        let records = [
            synthetic_record("expired", "terminal-res", "closed", Some(now - 120_000)),
            synthetic_record("oneshot", ONE_SHOT_RESOURCE, "exited", Some(now - 60_000)),
            synthetic_record("t1", "terminal-res", "closed", Some(now - 5_000)),
            synthetic_record("t2", "terminal-res", "closed", Some(now - 4_000)),
            synthetic_record("t3", "terminal-res", "closed", Some(now - 3_000)),
            synthetic_record("t4", "terminal-res", "closed", Some(now - 2_000)),
            synthetic_record("t5", "terminal-res", "closed", Some(now - 1_000)),
        ];
        for record in records {
            let id = record.session_id.clone();
            let (commands, _) = tokio::sync::mpsc::channel(1);
            let live = Arc::new(Live {
                record: Mutex::new(record),
                commands,
                changed: Default::default(),
                stop: CancellationToken::new(),
                persist_lock: tokio::sync::Mutex::new(()),
                persisted_revision: AtomicU64::new(0),
                persist_scheduled: AtomicBool::new(false),
                removed: AtomicBool::new(false),
            });
            manager.persist_async(&live).await.unwrap();
            manager.0.entries.lock().unwrap().insert(id, live);
        }
        assert_eq!(manager.record_count(), 7);
        assert_eq!(json_count(&root), 7);

        manager.prune_terminal_async().await;
        assert_eq!(manager.record_count(), 3);
        assert_eq!(json_count(&root), 3);
        for kept in ["t3", "t4", "t5"] {
            assert!(
                manager
                    .poll(kept, "test-owner", "terminal-res", 0, 0, 64)
                    .is_ok()
            );
        }
        for evicted in ["expired", "t1", "t2"] {
            assert!(matches!(
                manager.poll(evicted, "test-owner", "terminal-res", 0, 0, 64),
                Err(HostError::NotFound)
            ));
        }

        // Write a crashed one-shot record on disk and verify open() cleans it on restart.
        let crashed = synthetic_record("crashed-oneshot", ONE_SHOT_RESOURCE, "running", None);
        storage::atomic(
            &root.join("crashed-oneshot.json"),
            &serde_json::to_vec(&crashed).unwrap(),
            0o600,
            true,
        )
        .unwrap();
        let reopened = Manager::open_with_retention(&root, 2, Duration::from_secs(60)).unwrap();
        assert_eq!(reopened.record_count(), 2);
        assert_eq!(json_count(&root), 2);
        assert!(!root.join("crashed-oneshot.json").exists());
        assert!(
            reopened
                .poll("t4", "test-owner", "terminal-res", 0, 0, 64)
                .is_ok()
        );
        assert!(
            reopened
                .poll("t5", "test-owner", "terminal-res", 0, 0, 64)
                .is_ok()
        );
    }
}
