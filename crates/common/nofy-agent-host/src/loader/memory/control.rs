//! Admission policy, not canonical data or a cache-eviction receipt.
use super::*;
use nofy_agent_runtime::control::ControlError;
use serde::{Deserialize, Serialize};
use std::fs::File;

pub const PROTOCOL: &str = "nofy.memory-control/v1";
const HISTORY: usize = 64;
const MAX_RESOURCES: usize = 4096;
#[cfg(test)]
mod tests;

#[derive(Clone)]
pub struct MemoryControl {
    root: PathBuf,
}
/// Memory work stays in its admitting process. An unrelated fork snapshot is
/// not an admitted holder; close alone would leave its inherited OFD locked.
/// Executor cache leases have different handoff semantics and stay unchanged.
pub(in crate::loader) struct MemoryLease(File, u32);
impl MemoryLease {
    fn new(file: File) -> Self {
        Self(file, std::process::id())
    }
}
impl Drop for MemoryLease {
    fn drop(&mut self) {
        storage::unlock_local(&self.0, self.1);
    }
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MemoryState {
    pub protocol: String,
    pub key: String,
    pub revision: u64,
    pub open: bool,
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MemoryCommand {
    pub command_id: String,
    pub expected_revision: u64,
    pub open: bool,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MemoryReceipt {
    pub command: MemoryCommand,
    pub key: String,
    pub revision: u64,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Journal {
    state: MemoryState,
    receipts: Vec<MemoryReceipt>,
}
fn invalid(message: &str) -> HostError {
    HostError::Invalid(message.into())
}
fn unavailable() -> HostError {
    HostError::Unavailable("invalid memory admission state; explicit recovery required".into())
}
fn genesis(key: &str) -> Journal {
    Journal {
        state: MemoryState {
            protocol: PROTOCOL.into(),
            key: key.into(),
            revision: 0,
            open: true,
        },
        receipts: Vec::new(),
    }
}
impl MemoryControl {
    pub(super) fn namespace_lease(&self, namespace: &str, exclusive: bool) -> Result<MemoryLease> {
        let directory = storage::directory(&self.root.join("namespace-leases"))?;
        let path = directory.join(format!("{}.lock", storage::hash(namespace.as_bytes())));
        storage::atomic(&path, b"", 0o600, false)?;
        Ok(MemoryLease::new(if exclusive {
            super::super::lifecycle::maintenance_file(&path)?
        } else {
            super::super::lifecycle::shared_file(&path)?
        }))
    }
    pub(super) fn migration_database(&self) -> PathBuf {
        self.root.join("transfers.sqlite")
    }
    fn namespace_seal(&self, namespace: &str) -> PathBuf {
        self.root
            .join("namespace-leases")
            .join(format!("{}.managed", storage::hash(namespace.as_bytes())))
    }
    pub(super) fn namespace_sealed(&self, namespace: &str) -> Result<bool> {
        let path = self.namespace_seal(namespace);
        match std::fs::symlink_metadata(&path) {
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(false),
            Err(error) => return Err(storage::unavailable(error)),
            Ok(metadata) if metadata.is_file() && !metadata.file_type().is_symlink() => {}
            Ok(_) => return Err(unavailable()),
        }
        let bytes = storage::read(&path, 4096)?;
        if bytes != format!("nofy.memory-transfer/v1:{namespace}").as_bytes() {
            return Err(unavailable());
        }
        Ok(true)
    }
    pub(super) fn seal_namespace(&self, namespace: &str) -> Result<()> {
        storage::directory(&self.root.join("namespace-leases"))?;
        storage::atomic(
            &self.namespace_seal(namespace),
            format!("nofy.memory-transfer/v1:{namespace}").as_bytes(),
            0o600,
            false,
        )
    }
    pub(in crate::loader) fn open(root: &Path) -> Result<Self> {
        let root = storage::directory(&root.join("memory-control"))?;
        storage::atomic(
            &root.join("protocol.json"),
            &serde_json::to_vec(PROTOCOL).map_err(storage::unavailable)?,
            0o600,
            false,
        )?;
        Ok(Self { root })
    }
    fn path(&self, key: &str) -> Result<PathBuf> {
        if key.len() != 64
            || !key
                .bytes()
                .all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
        {
            return Err(invalid("invalid memory resource key"));
        }
        Ok(self.root.join(key))
    }
    fn ensure(&self, key: &str) -> Result<PathBuf> {
        let path = self.path(key)?;
        if path
            .join("lease.lock")
            .try_exists()
            .map_err(storage::unavailable)?
        {
            storage::directory(&path)?;
            return Ok(path);
        }
        let _catalog = storage::lock(&self.root)?;
        if !path.try_exists().map_err(storage::unavailable)? {
            let count = std::fs::read_dir(&self.root)
                .map_err(storage::unavailable)?
                .map(|entry| {
                    entry
                        .and_then(|entry| entry.file_type())
                        .map(|kind| usize::from(kind.is_dir()))
                })
                .try_fold(0usize, |count, item| item.map(|n| count + n))
                .map_err(storage::unavailable)?;
            if count >= MAX_RESOURCES {
                return Err(HostError::Unavailable(
                    "memory control resource limit reached".into(),
                ));
            }
        }
        storage::directory(&path)?;
        // The immutable lease inode seals initialization. Never recreate a
        // missing policy after that inode exists: that would reopen on damage.
        if !path
            .join("lease.lock")
            .try_exists()
            .map_err(storage::unavailable)?
        {
            storage::atomic(
                &path.join("state.json"),
                &serde_json::to_vec(&genesis(key)).map_err(storage::unavailable)?,
                0o600,
                false,
            )?;
            storage::atomic(&path.join("lease.lock"), b"", 0o600, false)?;
            nofy_agent_runtime::sync_directory(&self.root).map_err(storage::unavailable)?;
        }
        Ok(path)
    }
    fn read(&self, key: &str, path: &Path) -> Result<Journal> {
        let journal: Journal =
            serde_json::from_slice(&storage::read(&path.join("state.json"), 65536)?)
                .map_err(|_| unavailable())?;
        if journal.state.protocol != PROTOCOL
            || journal.state.key != key
            || journal.receipts.len() > HISTORY
        {
            return Err(unavailable());
        }
        let mut previous = None;
        let mut ids = std::collections::BTreeSet::new();
        for receipt in &journal.receipts {
            if receipt.key != key
                || receipt.command.expected_revision.checked_add(1) != Some(receipt.revision)
                || previous
                    .is_some_and(|revision: u64| revision.checked_add(1) != Some(receipt.revision))
                || !ids.insert(&receipt.command.command_id)
                || !valid_command_id(&receipt.command.command_id)
            {
                return Err(unavailable());
            }
            previous = Some(receipt.revision);
        }
        match journal.receipts.last() {
            Some(last)
                if last.revision == journal.state.revision
                    && last.command.open == journal.state.open => {}
            None if journal.state.revision == 0 && journal.state.open => {}
            _ => return Err(unavailable()),
        }
        Ok(journal)
    }
    pub(in crate::loader) fn acquire(&self, key: &str) -> Result<MemoryLease> {
        let path = self.ensure(key)?;
        let lease = MemoryLease::new(super::super::lifecycle::shared_file(
            &path.join("lease.lock"),
        )?);
        if !self.read(key, &path)?.state.open {
            return Err(HostError::Unavailable("memory resource is closed".into()));
        }
        Ok(lease)
    }
    pub fn state(&self, key: &str) -> Result<MemoryState> {
        let path = self.path(key)?;
        if !path.try_exists().map_err(storage::unavailable)? {
            return Ok(genesis(key).state);
        }
        storage::directory(&path)?;
        let _lease = MemoryLease::new(super::super::lifecycle::shared_file(
            &path.join("lease.lock"),
        )?);
        Ok(self.read(key, &path)?.state)
    }
    pub(in crate::loader) fn change(
        &self,
        key: &str,
        command: MemoryCommand,
        retire: impl FnOnce() -> Result<()>,
    ) -> Result<MemoryReceipt> {
        if !valid_command_id(&command.command_id) {
            return Err(invalid("invalid memory command id"));
        }
        let path = self.ensure(key)?;
        {
            let _read = MemoryLease::new(super::super::lifecycle::shared_file(
                &path.join("lease.lock"),
            )?);
            let journal = self.read(key, &path)?;
            if let Some(receipt) = journal
                .receipts
                .iter()
                .find(|receipt| receipt.command.command_id == command.command_id)
            {
                return if receipt.command == command {
                    Ok(receipt.clone())
                } else {
                    Err(HostError::Control(ControlError::CommandConflict))
                };
            }
        }
        // Fail busy without accepting an intent. Existing detached work owns
        // shared leases until its real terminal, even after its caller drops.
        let _lease = MemoryLease::new(super::super::lifecycle::maintenance_file(
            &path.join("lease.lock"),
        )?);
        let mut journal = self.read(key, &path)?;
        if let Some(receipt) = journal
            .receipts
            .iter()
            .find(|receipt| receipt.command.command_id == command.command_id)
        {
            return if receipt.command == command {
                Ok(receipt.clone())
            } else {
                Err(HostError::Control(ControlError::CommandConflict))
            };
        }
        if journal.state.revision != command.expected_revision {
            return Err(HostError::Control(ControlError::Conflict {
                expected: Some(command.expected_revision),
                actual: Some(journal.state.revision),
            }));
        }
        let revision = journal
            .state
            .revision
            .checked_add(1)
            .ok_or_else(unavailable)?;
        let receipt = MemoryReceipt {
            key: key.into(),
            revision,
            command,
        };
        journal.state.revision = revision;
        journal.state.open = receipt.command.open;
        journal.receipts.push(receipt.clone());
        if journal.receipts.len() > HISTORY {
            journal.receipts.remove(0);
        }
        storage::atomic(
            &path.join("state.json"),
            &serde_json::to_vec(&journal).map_err(storage::unavailable)?,
            0o600,
            true,
        )?;
        if !receipt.command.open {
            // Best-effort cache residency is not the admission fact. The
            // committed policy fences every view even if cache retirement fails.
            retire()?;
        }
        Ok(receipt)
    }
}
fn valid_command_id(value: &str) -> bool {
    !value.is_empty()
        && value.len() <= 128
        && value
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b"._-".contains(&b))
}
