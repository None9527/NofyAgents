use super::*;
use nofy_agent_runtime::system::content_digest;
use nofy_host_path::{FileIdentity, FileKind};
/// One node of a cache tree as it was read. The fingerprint of a plan is the
/// digest of these, so a plan applies only to the tree it was made from.
#[derive(Serialize)]
struct Stamp {
    path: String,
    kind: u8,
    device: u64,
    inode: u64,
    size: u64,
    mtime: i64,
    mtime_ns: i64,
    ctime: i64,
    ctime_ns: i64,
}
impl CacheLifecycle {
    pub(super) fn plan(&self, after: &str, limit: usize) -> Result<CachePlan> {
        if !(1..=16).contains(&limit) {
            return Err(invalid("cache page limit must be 1..=16"));
        }
        if !after.is_empty() {
            let (kind, name) = after
                .split_once(':')
                .ok_or_else(|| invalid("invalid cache cursor"))?;
            if !["artifact", "image", "scratch"].contains(&kind) {
                return Err(invalid("invalid cache cursor"));
            }
            component(name)?;
        }
        let mut candidates = Vec::new();
        for (kind, root) in &self.caches {
            // Never traverse a replaced cache root, even for a read-only plan.
            let metadata = std::fs::symlink_metadata(root).map_err(storage::unavailable)?;
            if !metadata.is_dir()
                || std::fs::canonicalize(root).map_err(storage::unavailable)? != *root
            {
                return Err(invalid("cache root identity changed"));
            }
            let mut count = 0;
            for child in std::fs::read_dir(root).map_err(storage::unavailable)? {
                count += 1;
                if count > 8192 {
                    return Err(invalid("cache inventory exceeds 8192 entries"));
                }
                let child = child.map_err(storage::unavailable)?;
                let name = child
                    .file_name()
                    .into_string()
                    .map_err(|_| invalid("non-UTF8 cache name"))?;
                if name == "catalog.lock" {
                    continue;
                }
                component(&name)?;
                if !(storage::digest(&name).is_ok() || name.starts_with('.')) {
                    return Err(invalid("unrecognized cache entry"));
                }
                if format!("{}:{name}", kind.key()).as_str() > after {
                    candidates.push((*kind, name));
                }
                if candidates.len() > 8192 {
                    return Err(invalid("cache inventory exceeds 8192 entries"));
                }
            }
        }
        candidates.sort();
        let more = candidates.len() > limit;
        candidates.truncate(limit);
        let mut entries = Vec::new();
        for (kind, name) in candidates {
            let entry = inspect(kind, &name, &self.caches[&kind].join(&name))?;
            if identity(&self.root.join("trash"))?.map(|v| v.0) != Some(entry.device) {
                return Err(invalid("cache and quarantine must share a filesystem"));
            }
            entries.push(entry);
        }
        let next = if more {
            entries.last().map(CacheEntry::key)
        } else {
            None
        };
        let fingerprint =
            content_digest(&("nofy.loader-cache-plan/v1", after, limit, &entries, &next))?;
        Ok(CachePlan {
            after: after.into(),
            limit,
            fingerprint,
            entries,
            next,
        })
    }
}
/// The volume and file number of what `path` names, or `None` when nothing is
/// there. Two paths on one volume can be moved between with a single rename.
pub(in crate::loader) fn identity(path: &Path) -> Result<Option<(u64, u64)>> {
    match FileIdentity::of_path(path) {
        Ok(identity) => Ok(Some((identity.volume(), identity.index()))),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(e) => Err(storage::unavailable(e)),
    }
}
pub(in crate::loader) fn inspect(kind: CacheKind, name: &str, root: &Path) -> Result<CacheEntry> {
    let mut pending = vec![root.to_owned()];
    let mut stamps = Vec::new();
    let mut files = 0u64;
    let mut bytes = 0u64;
    let (device, inode) = identity(root)?.ok_or(HostError::NotFound)?;
    while let Some(path) = pending.pop() {
        let node = FileIdentity::of_path(&path).map_err(storage::unavailable)?;
        if node.volume() != device {
            return Err(invalid("cache crosses a filesystem boundary"));
        }
        let relative = path
            .strip_prefix(root)
            .map_err(storage::unavailable)?
            .to_str()
            .ok_or_else(|| invalid("non-UTF8 cache path"))?
            .to_owned();
        let kind = match node.kind() {
            FileKind::Directory => 0,
            FileKind::File => 1,
            FileKind::Symlink => 2,
            FileKind::Other => return Err(invalid("unsupported cache node type")),
        };
        if kind == 0 {
            for child in std::fs::read_dir(&path).map_err(storage::unavailable)? {
                pending.push(child.map_err(storage::unavailable)?.path());
                if stamps.len().saturating_add(pending.len()) > 65536 {
                    return Err(invalid("cache tree exceeds bounded inventory"));
                }
            }
        } else {
            files += 1;
            bytes = bytes.saturating_add(node.len());
        }
        stamps.push(Stamp {
            path: relative,
            kind,
            device: node.volume(),
            inode: node.index(),
            size: node.len(),
            mtime: node.modified().secs,
            mtime_ns: i64::from(node.modified().nanos),
            ctime: node.changed().secs,
            ctime_ns: i64::from(node.changed().nanos),
        });
        if stamps.len().saturating_add(pending.len()) > 65536 || bytes > 1024 * 1024 * 1024 {
            return Err(invalid("cache tree exceeds bounded inventory"));
        }
    }
    stamps.sort_by(|a, b| a.path.cmp(&b.path));
    Ok(CacheEntry {
        kind,
        name: name.into(),
        files,
        bytes,
        fingerprint: content_digest(&stamps)?,
        device,
        inode,
    })
}
