//! Quiescent canonical snapshots. Admission and publication belong to the host.
//! No source mutation, dependency installation, path discovery or model IO.
use serde::{Deserialize, Serialize};
use std::{
    fs::{File, OpenOptions},
    io::{self, Read},
    path::{Component, Path, PathBuf},
};

mod database;
#[cfg(test)]
mod tests;

#[derive(Debug, thiserror::Error)]
pub enum TransportError {
    #[error("memory snapshot IO failed: {0}")]
    Io(#[from] io::Error),
    #[error("memory snapshot database failed: {0}")]
    Sql(#[from] rusqlite::Error),
    #[error("memory snapshot invalid: {0}")]
    Invalid(String),
}
pub type TransportResult<T> = Result<T, TransportError>;
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct SnapshotStats {
    pub files: u64,
    pub bytes: u64,
    pub databases: u64,
    pub projects: u64,
    pub tombstones: u64,
    pub undo_tokens: u64,
    pub capture_jobs: u64,
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct SnapshotInventory {
    pub protocol: String,
    /// Raw source files, including nonempty SQLite WAL but excluding SHM/cache.
    pub fingerprint: String,
    /// Canonical rows and file bytes, with only owned absolute paths normalized.
    pub content_digest: String,
    pub stats: SnapshotStats,
}
#[derive(Clone, Debug)]
struct Entry {
    path: PathBuf,
    hash: String,
    bytes: u64,
    database: bool,
    wal: bool,
}
fn invalid(message: &str) -> TransportError {
    TransportError::Invalid(message.into())
}
fn scope_file(path: &Path) -> bool {
    let components = path.components().collect::<Vec<_>>();
    components.len() == 2 && components[0].as_os_str() == "personal"
        || components.len() == 3 && components[0].as_os_str() == "projects"
}
fn skipped(path: &Path) -> bool {
    if path
        .components()
        .next()
        .is_some_and(|p| p.as_os_str() == "contexts")
    {
        return true;
    }
    if path == Path::new("schema.json") {
        return true;
    }
    let name = path.file_name().and_then(|s| s.to_str()).unwrap_or("");
    if scope_file(path)
        && (name == ".write.lock"
            || name == "index.sqlite"
            || name == "index.sqlite-wal"
            || name == "index.sqlite-shm")
    {
        return true;
    }
    name.ends_with("-shm")
        && (path == Path::new("meta.sqlite-shm") || scope_file(path) && name == "state.sqlite-shm")
}
fn database_path(path: &Path) -> bool {
    path == Path::new("meta.sqlite")
        || scope_file(path) && path.file_name().is_some_and(|s| s == "state.sqlite")
}
fn wal_path(path: &Path) -> bool {
    path == Path::new("meta.sqlite-wal")
        || scope_file(path) && path.file_name().is_some_and(|s| s == "state.sqlite-wal")
}
fn regular(path: &Path) -> TransportResult<File> {
    let mut options = OpenOptions::new();
    options.read(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.custom_flags(nix::libc::O_NOFOLLOW | nix::libc::O_NONBLOCK);
    }
    let file = options.open(path)?;
    if !file.metadata()?.is_file() {
        return Err(invalid("snapshot requires regular files"));
    }
    Ok(file)
}
fn digest_file(path: &Path) -> TransportResult<(String, u64)> {
    let mut file = regular(path)?;
    let mut hash = blake3::Hasher::new();
    let mut size = 0;
    let mut buffer = [0; 65536];
    loop {
        let n = file.read(&mut buffer)?;
        if n == 0 {
            break;
        }
        hash.update(&buffer[..n]);
        size += n as u64;
    }
    Ok((hash.finalize().to_hex().to_string(), size))
}
fn entries(root: &Path) -> TransportResult<Vec<Entry>> {
    if !root.is_absolute() || root.symlink_metadata()?.file_type().is_symlink() || !root.is_dir() {
        return Err(invalid("snapshot root must be a real absolute directory"));
    }
    let mut pending = vec![PathBuf::new()];
    let mut result = vec![];
    while let Some(relative) = pending.pop() {
        for item in std::fs::read_dir(root.join(&relative))? {
            let item = item?;
            let path = relative.join(item.file_name());
            if path.to_str().is_none() {
                return Err(invalid("non-Unicode canonical path"));
            }
            if skipped(&path) {
                continue;
            }
            let kind = item.file_type()?;
            if kind.is_symlink() {
                return Err(invalid("canonical snapshot contains a symlink"));
            }
            if kind.is_dir() {
                pending.push(path);
                continue;
            }
            if !kind.is_file() {
                return Err(invalid("canonical snapshot contains a special file"));
            }
            if path.components().any(|c| c.as_os_str() == ".undo-delete") {
                return Err(invalid(
                    "unfinished or unowned undo stage requires original recovery",
                ));
            }
            let (hash, bytes) = digest_file(&root.join(&path))?;
            result.push(Entry {
                database: database_path(&path),
                wal: wal_path(&path),
                path,
                hash,
                bytes,
            });
        }
    }
    result.sort_by(|a, b| a.path.cmp(&b.path));
    Ok(result)
}
fn feed(hash: &mut blake3::Hasher, value: &[u8]) {
    hash.update(&(value.len() as u64).to_le_bytes());
    hash.update(value);
}
/// Read a stable inventory while the caller holds its namespace barrier.
/// Incomplete native operations are rejected, never discarded or reclassified.
pub fn inspect_snapshot(root: &Path) -> TransportResult<SnapshotInventory> {
    let entries = entries(root)?;
    let mut raw = blake3::Hasher::new();
    let mut content = blake3::Hasher::new();
    let mut stats = SnapshotStats {
        files: 0,
        bytes: 0,
        databases: 0,
        projects: 0,
        tombstones: 0,
        undo_tokens: 0,
        capture_jobs: 0,
    };
    let mut projects = std::collections::BTreeSet::new();
    for entry in &entries {
        let name = entry
            .path
            .to_str()
            .ok_or_else(|| invalid("invalid canonical path"))?;
        // SQLite may create an empty WAL even for a read-only connection.
        // It carries no committed rows; inspecting it must not stale a plan.
        if !entry.wal || entry.bytes != 0 {
            feed(&mut raw, name.as_bytes());
            feed(&mut raw, entry.hash.as_bytes());
            feed(&mut raw, &entry.bytes.to_le_bytes());
        }
        if entry.wal {
            continue;
        }
        feed(&mut content, name.as_bytes());
        if entry.database {
            let summary = database::inspect(
                &root.join(&entry.path),
                root,
                entry.path == Path::new("meta.sqlite"),
            )?;
            feed(&mut content, summary.digest.as_bytes());
            stats.databases += 1;
            stats.tombstones += summary.tombstones;
            stats.undo_tokens += summary.undo_tokens;
            stats.capture_jobs += summary.capture_jobs;
        } else {
            feed(&mut content, entry.hash.as_bytes());
        }
        let mut parts = entry.path.components();
        if parts.next().is_some_and(|p| p.as_os_str() == "projects")
            && let Some(id) = parts.next()
        {
            projects.insert(id.as_os_str().to_owned());
        }
        stats.files += 1;
        stats.bytes += entry.bytes;
    }
    stats.projects = projects.len() as u64;
    if stats.databases == 0 {
        return Err(invalid("canonical snapshot has no state database"));
    }
    Ok(SnapshotInventory {
        protocol: "nofy.memory-snapshot/v1".into(),
        fingerprint: raw.finalize().to_hex().to_string(),
        content_digest: content.finalize().to_hex().to_string(),
        stats,
    })
}
fn directory(path: &Path) -> TransportResult<()> {
    let mut builder = std::fs::DirBuilder::new();
    builder.recursive(true);
    #[cfg(unix)]
    {
        use std::os::unix::fs::DirBuilderExt;
        builder.mode(0o700);
    }
    builder.create(path)?;
    Ok(())
}
/// Build a real independent snapshot at its final, still-unpublished location.
/// The destination must not exist. The source and its fingerprint stay intact.
pub fn copy_snapshot(
    source: &Path,
    target: &Path,
    expected: &SnapshotInventory,
) -> TransportResult<SnapshotInventory> {
    if !target.is_absolute() || target.starts_with(source) || source.starts_with(target) {
        return Err(invalid(
            "snapshot source and target must be separate absolute roots",
        ));
    }
    if inspect_snapshot(source)? != *expected {
        return Err(invalid("snapshot source changed"));
    }
    if target.try_exists()? {
        return Err(invalid("snapshot output already exists"));
    }
    directory(target)?;
    for entry in entries(source)? {
        if entry.wal {
            continue;
        }
        let output = target.join(&entry.path);
        directory(
            output
                .parent()
                .ok_or_else(|| invalid("snapshot has no parent"))?,
        )?;
        if entry.database {
            database::copy(&source.join(&entry.path), &output, source, target)?;
        } else {
            let mut input = regular(&source.join(&entry.path))?;
            let mut options = OpenOptions::new();
            options.write(true).create_new(true);
            #[cfg(unix)]
            {
                use std::os::unix::fs::OpenOptionsExt;
                options.mode(0o600);
            }
            let mut file = options.open(&output)?;
            std::io::copy(&mut input, &mut file)?;
            file.sync_all()?;
            if digest_file(&output)?.0 != entry.hash {
                return Err(invalid("canonical file changed while copying"));
            }
        }
    }
    let copied = inspect_snapshot(target)?;
    if copied.content_digest != expected.content_digest || inspect_snapshot(source)? != *expected {
        return Err(invalid("canonical snapshot verification failed"));
    }
    // Sync all directory entries before the owner publishes this generation.
    let mut directories = vec![target.to_path_buf()];
    for entry in entries(target)? {
        let mut parent = target.join(entry.path).parent().map(Path::to_path_buf);
        while let Some(path) = parent {
            if !path.starts_with(target) {
                break;
            }
            directories.push(path.clone());
            parent = path.parent().map(Path::to_path_buf);
        }
    }
    directories.sort();
    directories.dedup();
    for path in directories.into_iter().rev() {
        File::open(path)?.sync_all()?;
    }
    Ok(copied)
}
