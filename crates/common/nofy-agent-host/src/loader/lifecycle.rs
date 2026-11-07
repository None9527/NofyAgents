//! Cache eviction is separate from persistent artifact/reference management.
use super::*;
use serde::{Deserialize, Serialize};
use std::{collections::BTreeMap, fs::File};
pub(in crate::loader) mod inventory;
mod journal;
#[cfg(all(test, target_os = "linux"))]
mod tests;
pub use journal::{CacheCommand, CacheReceipt, CacheState};

#[derive(Clone)]
pub struct CacheLifecycle {
    root: PathBuf,
    caches: BTreeMap<CacheKind, PathBuf>,
    #[cfg(test)]
    pub(super) test_exit: Option<&'static str>,
}
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CacheKind {
    Artifact,
    Image,
    Scratch,
}
impl CacheKind {
    fn key(self) -> &'static str {
        match self {
            Self::Artifact => "artifact",
            Self::Image => "image",
            Self::Scratch => "scratch",
        }
    }
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CacheEntry {
    pub kind: CacheKind,
    pub name: String,
    pub files: u64,
    pub bytes: u64,
    pub fingerprint: String,
    pub device: u64,
    pub inode: u64,
}
impl CacheEntry {
    fn key(&self) -> String {
        format!("{}:{}", self.kind.key(), self.name)
    }
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CachePlan {
    pub after: String,
    pub limit: usize,
    pub fingerprint: String,
    pub entries: Vec<CacheEntry>,
    pub next: Option<String>,
}
#[derive(Serialize)]
pub struct CacheView {
    pub revision: u64,
    pub pending: Option<CacheReceipt>,
    pub plan: CachePlan,
}
pub(super) struct CacheUse {
    // Struct fields drop in declaration order: scratch cleanup precedes unlock.
    pub scratch: tempfile::TempDir,
    pub _lease: File,
}
fn invalid(message: &str) -> HostError {
    HostError::Invalid(message.into())
}
fn component(value: &str) -> Result<()> {
    if value.is_empty()
        || value.len() > 128
        || value == "."
        || value == ".."
        || !value
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b"._-".contains(&b))
    {
        return Err(invalid("invalid cache entry name"));
    }
    Ok(())
}
pub(super) fn shared_file(path: &Path) -> Result<File> {
    lease(path, false)
}
pub(super) fn maintenance_file(path: &Path) -> Result<File> {
    lease(path, true)
}
fn lease(path: &Path, exclusive: bool) -> Result<File> {
    let mut options = std::fs::OpenOptions::new();
    options.read(true).write(exclusive);
    #[cfg(target_os = "linux")]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.custom_flags(libc::O_NOFOLLOW | libc::O_CLOEXEC);
    }
    let file = options.open(path).map_err(storage::unavailable)?;
    if !file.metadata().map_err(storage::unavailable)?.is_file() {
        return Err(invalid("invalid cache lease file"));
    }
    // A lock held for real (a running worker, an unload in progress) outlasts
    // this wait. A brief overlap does not, e.g. a concurrently forked child
    // still sharing this open file description until it execs. Retry briefly so
    // such an overlap is not reported as the cache being in use. Under real
    // contention this blocks for up to ~180 ms, so call it from blocking
    // context (`spawn_blocking`), never directly from an async task.
    const ATTEMPTS: u32 = 10;
    const PAUSE: std::time::Duration = std::time::Duration::from_millis(20);
    for attempt in 1..=ATTEMPTS {
        let result = if exclusive {
            fs2::FileExt::try_lock_exclusive(&file)
        } else {
            fs2::FileExt::try_lock_shared(&file)
        };
        match result {
            Ok(()) => return Ok(file),
            Err(e) if nofy_durable_fs::lock_contended(&e) => {
                if attempt < ATTEMPTS {
                    std::thread::sleep(PAUSE);
                }
            }
            Err(e) => return Err(storage::unavailable(e)),
        }
    }
    Err(HostError::Unavailable(
        "loader cache is in use or undergoing maintenance".into(),
    ))
}
impl CacheLifecycle {
    pub(super) fn open(loader_root: &Path) -> Result<Self> {
        let root = storage::directory(&loader_root.join("lifecycle"))?;
        storage::directory(&root.join("trash"))?;
        storage::atomic(
            &root.join("protocol.json"),
            b"\"nofy.loader-cache/v1\"",
            0o600,
            false,
        )?;
        storage::atomic(&root.join("lease.lock"), b"", 0o600, false)?;
        Ok(Self {
            root,
            caches: BTreeMap::from([
                (
                    CacheKind::Artifact,
                    storage::directory(&loader_root.join("artifacts/trees"))?,
                ),
                (
                    CacheKind::Image,
                    storage::directory(&loader_root.join("images/trees"))?,
                ),
                (
                    CacheKind::Scratch,
                    storage::directory(&loader_root.join("scratch"))?,
                ),
            ]),
            #[cfg(test)]
            test_exit: None,
        })
    }
    pub(super) fn lease_path(&self) -> PathBuf {
        self.root.join("lease.lock")
    }
    pub(super) fn shared(&self) -> Result<File> {
        let file = shared_file(&self.lease_path())?;
        super::unload::ensure_no_pending(&self.root)?;
        Ok(file)
    }
    fn exclusive(&self) -> Result<File> {
        let file = self.maintenance_lease()?;
        super::unload::ensure_no_pending(&self.root)?;
        Ok(file)
    }
    pub(in crate::loader) fn maintenance_lease(&self) -> Result<File> {
        if !cfg!(target_os = "linux") {
            return Err(invalid("cache maintenance requires Linux"));
        }
        lease(&self.lease_path(), true)
    }
    pub(in crate::loader) fn has_pending(&self) -> Result<bool> {
        Ok(self
            .read()?
            .receipts
            .values()
            .any(|r| matches!(r.state, CacheState::Pending)))
    }
    pub fn inspect(&self, after: &str, limit: usize) -> Result<CacheView> {
        let _lease = self.exclusive()?;
        let data = self.read()?;
        Ok(CacheView {
            revision: data.revision,
            pending: data
                .receipts
                .values()
                .find(|r| matches!(r.state, CacheState::Pending))
                .cloned(),
            plan: self.plan(after, limit)?,
        })
    }
    fn source(&self, entry: &CacheEntry) -> Result<PathBuf> {
        component(&entry.name)?;
        Ok(self.caches[&entry.kind].join(&entry.name))
    }
}
