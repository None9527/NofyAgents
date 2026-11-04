//! cgroup v2 objects are pinned by descriptors and journaled before handoff.
use super::*;
use std::{
    fs::{File, OpenOptions},
    io::{Read, Write},
    os::{
        fd::{AsRawFd, FromRawFd},
        unix::{fs::MetadataExt, process::CommandExt},
    },
    time::{Duration, Instant},
};

const MAX_JOBS: usize = 2;
const RECORD_LIMIT: u64 = 8192;

fn failed(message: &str) -> HostError {
    HostError::Unavailable(format!("process tree: {message}"))
}
fn io(error: std::io::Error) -> HostError {
    failed(&error.to_string())
}
fn name(value: &str) -> Result<std::ffi::CString> {
    if value.is_empty()
        || value.len() > 255
        || value
            .bytes()
            .any(|b| !b.is_ascii_alphanumeric() && !b"-_.@\\".contains(&b))
    {
        return Err(failed("invalid managed control name"));
    }
    std::ffi::CString::new(value).map_err(|_| failed("invalid control name"))
}
fn control(directory: &File, field: &str, write: bool) -> Result<File> {
    let field = name(field)?;
    // SAFETY: the directory is a live owned descriptor; field is one component.
    let fd = unsafe {
        libc::openat(
            directory.as_raw_fd(),
            field.as_ptr(),
            (if write {
                libc::O_WRONLY
            } else {
                libc::O_RDONLY
            }) | libc::O_NOFOLLOW
                | libc::O_CLOEXEC,
        )
    };
    if fd < 0 {
        return Err(io(std::io::Error::last_os_error()));
    }
    Ok(unsafe { File::from_raw_fd(fd) })
}
fn read(directory: &File, field: &str) -> Result<String> {
    let mut result = String::new();
    control(directory, field, false)?
        .take(8193)
        .read_to_string(&mut result)
        .map_err(io)?;
    if result.len() > 8192 {
        return Err(failed("control value exceeds limit"));
    }
    Ok(result)
}
fn write(directory: &File, field: &str, value: &str) -> Result<()> {
    control(directory, field, true)?
        .write_all(value.as_bytes())
        .map_err(io)
}
fn child(directory: &File, value: &str) -> Result<File> {
    let value = name(value)?;
    let fd = unsafe {
        libc::openat(
            directory.as_raw_fd(),
            value.as_ptr(),
            libc::O_RDONLY | libc::O_DIRECTORY | libc::O_NOFOLLOW | libc::O_CLOEXEC,
        )
    };
    if fd < 0 {
        return Err(io(std::io::Error::last_os_error()));
    }
    Ok(unsafe { File::from_raw_fd(fd) })
}
fn mkdir(directory: &File, value: &str) -> Result<()> {
    let value = name(value)?;
    if unsafe { libc::mkdirat(directory.as_raw_fd(), value.as_ptr(), 0o700) } != 0 {
        return Err(io(std::io::Error::last_os_error()));
    }
    Ok(())
}
fn remove(directory: &File, value: &str) -> Result<()> {
    let value = name(value)?;
    if unsafe { libc::unlinkat(directory.as_raw_fd(), value.as_ptr(), libc::AT_REMOVEDIR) } != 0 {
        return Err(io(std::io::Error::last_os_error()));
    }
    Ok(())
}
fn open(path: &Path) -> Result<File> {
    let mut current = File::open("/").map_err(io)?;
    for component in path.components() {
        match component {
            std::path::Component::RootDir => {}
            std::path::Component::Normal(part) => {
                current = child(
                    &current,
                    part.to_str()
                        .ok_or_else(|| failed("non-UTF8 cgroup path"))?,
                )?;
            }
            _ => return Err(failed("noncanonical cgroup path")),
        }
    }
    let mut filesystem: libc::statfs = unsafe { std::mem::zeroed() };
    if unsafe { libc::fstatfs(current.as_raw_fd(), &mut filesystem) } != 0 {
        return Err(io(std::io::Error::last_os_error()));
    }
    if filesystem.f_type as u64 != 0x63677270 {
        return Err(failed("root is not cgroup v2"));
    }
    if current.metadata().map_err(io)?.uid() != unsafe { libc::geteuid() } {
        return Err(failed("delegation root is not owned by the current UID"));
    }
    Ok(current)
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
struct Identity {
    device: u64,
    inode: u64,
}
impl Identity {
    fn of(file: &File) -> Result<Self> {
        let meta = file.metadata().map_err(io)?;
        Ok(Self {
            device: meta.dev(),
            inode: meta.ino(),
        })
    }
    fn verify(&self, file: &File) -> Result<()> {
        if *self != Self::of(file)? {
            return Err(failed("recorded cgroup identity changed"));
        }
        Ok(())
    }
}

/// Read-only facility check. No process moves or controller reconfiguration.
pub(super) fn preflight(config: &Config) -> Result<File> {
    config.validate()?;
    let root = open(&config.cgroup_root)?;
    if read(&root, "cgroup.type")?.trim() != "domain"
        || !read(&root, "cgroup.procs")?.trim().is_empty()
    {
        return Err(failed("delegation root must be an empty domain parent"));
    }
    let enabled = read(&root, "cgroup.subtree_control")?;
    for controller in ["cpu", "memory", "pids"] {
        if !enabled.split_whitespace().any(|s| s == controller) {
            return Err(failed(
                "cpu/memory/pids must already be delegated and enabled",
            ));
        }
    }
    let current = std::fs::read_to_string("/proc/self/cgroup").map_err(io)?;
    let relative = current
        .lines()
        .find_map(|l| l.strip_prefix("0::"))
        .filter(|s| s.starts_with('/'))
        .ok_or_else(|| failed("unified process membership is unavailable"))?;
    let current = Path::new("/sys/fs/cgroup").join(relative.trim_start_matches('/'));
    let common = config
        .cgroup_root
        .ancestors()
        .find(|ancestor| current.starts_with(ancestor))
        .filter(|p| p.starts_with("/sys/fs/cgroup"))
        .ok_or_else(|| failed("no delegated common ancestor"))?;
    // Opening for write checks effective ACL/ownership without moving anything.
    let common = open(common)?;
    control(&common, "cgroup.procs", true)?;
    control(&root, "cgroup.procs", true)?;
    Ok(root)
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Record {
    version: u32,
    root: PathBuf,
    root_identity: Identity,
    name: String,
    group_identity: Option<Identity>,
}
impl Record {
    fn validate(&self, directory: &Path) -> Result<()> {
        Config {
            cgroup_root: self.root.clone(),
            limits: Limits::default(),
        }
        .validate()?;
        if self.version != 1
            || !self.name.starts_with("job-")
            || self.name.len() > 64
            || directory.file_name().and_then(|p| p.to_str()) != Some(self.name.as_str())
        {
            return Err(failed("invalid recovery record"));
        }
        name(&self.name)?;
        Ok(())
    }
    fn put(&self, directory: &Path, replace: bool) -> Result<()> {
        storage::atomic(
            &directory.join("record.json"),
            &serde_json::to_vec(self).map_err(storage::unavailable)?,
            0o600,
            replace,
        )
    }
    fn group(&self) -> Result<(File, Option<File>)> {
        let root = open(&self.root)?;
        self.root_identity.verify(&root)?;
        match child(&root, &self.name) {
            Ok(group) => {
                if let Some(identity) = &self.group_identity {
                    identity.verify(&group)?;
                } else {
                    return Err(failed(
                        "uncommitted group identity is unknown; explicit evidence is required",
                    ));
                }
                Ok((root, Some(group)))
            }
            Err(_) if !self.root.join(&self.name).try_exists().map_err(io)? => Ok((root, None)),
            Err(e) => Err(e),
        }
    }
}
fn empty(group: &File) -> Result<bool> {
    let events = read(group, "cgroup.events")?;
    match events.lines().find_map(|l| l.strip_prefix("populated ")) {
        Some("0") => Ok(true),
        Some("1") => Ok(false),
        _ => Err(failed("invalid cgroup population evidence")),
    }
}
fn stop(group: &File) -> Result<()> {
    if !empty(group)? {
        write(group, "cgroup.kill", "1")?;
    }
    let deadline = Instant::now() + Duration::from_secs(5);
    while !empty(group)? {
        if Instant::now() >= deadline {
            return Err(failed(
                "killed tree has not become empty; recovery record retained",
            ));
        }
        std::thread::sleep(Duration::from_millis(10));
    }
    Ok(())
}
fn erase_record(directory: &Path) -> Result<()> {
    // Never discard evidence first and discover unknown files afterwards.
    // A failed cleanup can be retried without losing its durable identity.
    for entry in std::fs::read_dir(directory).map_err(io)? {
        let entry = entry.map_err(io)?;
        if !matches!(
            entry.file_name().to_str(),
            Some("record.json" | "active.lock")
        ) || !entry.file_type().map_err(io)?.is_file()
        {
            return Err(failed("unknown file in process record; evidence retained"));
        }
    }
    // Only the exact two private files created by this manager; never recurse.
    for name in ["record.json", "active.lock"] {
        match std::fs::remove_file(directory.join(name)) {
            Ok(()) => {}
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => {}
            Err(e) => return Err(io(e)),
        }
    }
    std::fs::remove_dir(directory).map_err(io)?;
    File::open(
        directory
            .parent()
            .ok_or_else(|| failed("missing journal parent"))?,
    )
    .and_then(|f| f.sync_all())
    .map_err(io)
}
struct JournalLease(File, u32);
impl Drop for JournalLease {
    fn drop(&mut self) {
        storage::unlock_local(&self.0, self.1);
    }
}
fn try_lock(path: &Path) -> Result<Option<JournalLease>> {
    use std::os::unix::fs::OpenOptionsExt;
    let file = OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .mode(0o600)
        .custom_flags(libc::O_NOFOLLOW | libc::O_CLOEXEC)
        .open(path)
        .map_err(io)?;
    match fs2::FileExt::try_lock_exclusive(&file) {
        Ok(()) => Ok(Some(JournalLease(file, std::process::id()))),
        Err(error) if error.kind() == std::io::ErrorKind::WouldBlock => Ok(None),
        Err(error) => Err(io(error)),
    }
}
fn lock(path: &Path) -> Result<JournalLease> {
    let deadline = Instant::now() + Duration::from_secs(2);
    loop {
        if let Some(lease) = try_lock(path)? {
            return Ok(lease);
        }
        if Instant::now() >= deadline {
            return Err(failed("another live instance owns this journal"));
        }
        std::thread::sleep(Duration::from_millis(5));
    }
}
#[derive(Clone)]
pub struct Manager {
    root: PathBuf,
    pub(super) workers: super::supervisor::Workers,
}
impl Manager {
    pub fn open(private_directory: &Path) -> Result<Self> {
        let root = storage::directory(private_directory)?;
        let metadata = std::fs::symlink_metadata(&root).map_err(io)?;
        if root != private_directory
            || metadata.uid() != unsafe { libc::geteuid() }
            || metadata.mode() & 0o077 != 0
        {
            return Err(failed(
                "journal requires an explicit private owner-only directory",
            ));
        }
        let manager = Self {
            root,
            workers: Default::default(),
        };
        // An unavailable old facility must not prevent ordinary record reads
        // or checkpoint receipts. New acquisitions retry and require recovery.
        let _ = manager.recover();
        Ok(manager)
    }
    pub fn pending(&self) -> Result<usize> {
        self.records().map(|records| records.len())
    }
    fn records(&self) -> Result<Vec<PathBuf>> {
        let mut records = Vec::new();
        for entry in std::fs::read_dir(&self.root).map_err(io)?.take(130) {
            let entry = entry.map_err(io)?;
            if entry.file_name() == "catalog.lock" {
                continue;
            }
            if !entry.file_type().map_err(io)?.is_dir()
                || !entry.file_name().to_string_lossy().starts_with("job-")
            {
                return Err(failed("unknown entry in process journal"));
            }
            records.push(entry.path());
            if records.len() > 128 {
                return Err(failed("recovery journal exceeds entry limit"));
            }
        }
        Ok(records)
    }
    fn recover_locked(&self) -> Result<()> {
        for directory in self.records()? {
            let _active = match try_lock(&directory.join("active.lock"))? {
                Some(l) => l,
                None => continue,
            };
            let bytes = match storage::read(&directory.join("record.json"), RECORD_LIMIT) {
                Ok(bytes) => bytes,
                Err(_) if !directory.join("record.json").try_exists().map_err(io)? => {
                    erase_record(&directory)?;
                    continue;
                }
                Err(e) => return Err(e),
            };
            let record: Record = serde_json::from_slice(&bytes)
                .map_err(|_| failed("invalid process recovery JSON"))?;
            record.validate(&directory)?;
            let (root, group) = record.group()?;
            if let Some(group) = group {
                stop(&group)?;
                // Recheck the named object before removing it, not just its FD.
                Identity::of(&group)?.verify(&child(&root, &record.name)?)?;
                remove(&root, &record.name)?;
            }
            erase_record(&directory)?;
        }
        Ok(())
    }
    pub fn recover(&self) -> Result<()> {
        let _transaction = lock(&self.root.join("catalog.lock"))?;
        self.recover_locked()
    }
    pub(super) fn acquire(&self, config: &Config) -> Result<Job> {
        if self.workers.stopped() {
            return Err(failed("manager is shutting down"));
        }
        let root = preflight(config)?;
        let _transaction = lock(&self.root.join("catalog.lock"))?;
        if self.workers.stopped() {
            return Err(failed("manager is shutting down"));
        }
        self.recover_locked()?;
        if self.records()?.len() >= MAX_JOBS {
            return Err(failed("two physical process trees are still owned"));
        }
        let directory = tempfile::Builder::new()
            .prefix("job-")
            .tempdir_in(&self.root)
            .map_err(io)?;
        let directory = directory.keep();
        let active = lock(&directory.join("active.lock"))?;
        let record = Record {
            version: 1,
            root: config.cgroup_root.clone(),
            root_identity: Identity::of(&root)?,
            name: directory
                .file_name()
                .and_then(|s| s.to_str())
                .ok_or_else(|| failed("invalid job identity"))?
                .into(),
            group_identity: None,
        };
        record.put(&directory, false)?;
        let mut job = Job {
            directory,
            record,
            root,
            group: None,
            _active: active,
            owner: std::process::id(),
            finished: false,
        };
        if let Err(error) = mkdir(&job.root, &job.record.name) {
            // A failed kernfs mkdir did not acquire a group. Never use this
            // intent to remove a pre-existing same-named object on recovery.
            erase_record(&job.directory)?;
            job.finished = true;
            return Err(error);
        }
        let group = child(&job.root, &job.record.name)?;
        job.record.group_identity = Some(Identity::of(&group)?);
        job.group = Some(group);
        job.record.put(&job.directory, true)?;
        let group = job.group.as_ref().expect("created group");
        write(group, "pids.max", &config.limits.max_processes.to_string())?;
        write(
            group,
            "memory.max",
            &config.limits.max_memory_bytes.to_string(),
        )?;
        write(group, "memory.swap.max", "0")?;
        write(group, "memory.oom.group", "1")?;
        write(
            group,
            "cpu.max",
            &format!("{} 100000", config.limits.cpu_percent * 1000),
        )?;
        write(group, "cgroup.max.depth", "0")?;
        write(group, "cgroup.max.descendants", "0")?;
        // The recorded identity is durable before a membership FD can escape.
        Ok(job)
    }
}

pub(super) struct Job {
    directory: PathBuf,
    record: Record,
    root: File,
    group: Option<File>,
    _active: JournalLease,
    owner: u32,
    finished: bool,
}
impl Job {
    #[cfg(test)]
    pub fn path(&self) -> PathBuf {
        self.record.root.join(&self.record.name)
    }
    #[cfg(test)]
    pub fn control(&self, field: &str) -> Result<String> {
        read(
            self.group
                .as_ref()
                .ok_or_else(|| failed("job is not prepared"))?,
            field,
        )
    }
    /// Only configures a future child: the caller is never migrated. This raw
    /// post-fork hook performs no allocation and closes at exec via CLOEXEC.
    pub fn configure(&self, command: &mut std::process::Command) -> Result<()> {
        if self.owner != std::process::id() || self.finished {
            return Err(failed("job is owned by another process or finished"));
        }
        let membership = control(
            self.group
                .as_ref()
                .ok_or_else(|| failed("job is not prepared"))?,
            "cgroup.procs",
            true,
        )?;
        unsafe {
            command.pre_exec(move || {
                if libc::write(membership.as_raw_fd(), b"0".as_ptr().cast(), 1) != 1 {
                    return Err(std::io::Error::last_os_error());
                }
                Ok(())
            });
        }
        Ok(())
    }
    pub(super) fn request_stop(&self) -> Result<()> {
        if self.owner != std::process::id() || self.finished {
            return Err(failed("job is not owned by this process"));
        }
        write(
            self.group
                .as_ref()
                .ok_or_else(|| failed("job is not prepared"))?,
            "cgroup.kill",
            "1",
        )
    }
    pub(super) fn finish_inner(&mut self) -> Result<()> {
        if self.owner != std::process::id() {
            return Err(failed("fork child does not own parent process tree"));
        }
        if self.finished {
            return Ok(());
        }
        let _transaction = lock(
            &self
                .directory
                .parent()
                .ok_or_else(|| failed("missing journal parent"))?
                .join("catalog.lock"),
        )?;
        let (root, group) = self.record.group()?;
        if let Some(group) = group {
            stop(&group)?;
            Identity::of(&group)?.verify(&child(&root, &self.record.name)?)?;
            remove(&root, &self.record.name)?;
        }
        erase_record(&self.directory)?;
        self.finished = true;
        Ok(())
    }
    #[cfg(test)]
    pub fn finish(mut self) -> Result<()> {
        self.finish_inner()
    }
}
impl Drop for Job {
    fn drop(&mut self) {
        if self.owner != std::process::id() || self.finished {
            return;
        }
        // Never block Drop or erase uncertain ownership. Explicit finish/reopen
        // owns waiting; this backstop only requests kernel termination.
        if let Some(group) = &self.group {
            let _ = write(group, "cgroup.kill", "1");
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn inherited_short_lock_description_does_not_outlive_its_original_owner() {
        let directory = tempfile::tempdir().unwrap();
        let path = directory.path().join("short.lock");
        let lease = lock(&path).unwrap();
        let inherited = crate::loader::test_support::inherited_descriptors();
        assert!(try_lock(&path).unwrap().is_none());
        drop(lease);
        // The real fork child is still alive and holds the duplicated open
        // description. Parent unlock, not child exit, makes the lock available.
        let next = try_lock(&path).unwrap().expect("parent released its lease");
        drop(inherited);
        assert!(try_lock(&path).unwrap().is_none());
        drop(next);
        assert!(try_lock(&path).unwrap().is_some());
    }
}
