use super::*;
use nofy_agent_runtime::{control::ControlError, system::content_digest};
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct CacheCommand {
    pub command_id: String,
    pub expected_revision: u64,
    pub fingerprint: String,
    #[serde(default)]
    pub after: String,
    pub limit: usize,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CacheState {
    Pending,
    Complete,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct CacheReceipt {
    pub command: CacheCommand,
    pub revision: u64,
    pub state: CacheState,
    pub entries: Vec<CacheEntry>,
    pub source_checked: Vec<String>,
    pub retained_new: Vec<String>,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub(super) struct Data {
    schema_version: u32,
    pub revision: u64,
    pub receipts: BTreeMap<u64, CacheReceipt>,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Envelope {
    checksum: String,
    data: Data,
}
impl Default for Data {
    fn default() -> Self {
        Self {
            schema_version: 1,
            revision: 0,
            receipts: Default::default(),
        }
    }
}
impl CacheCommand {
    fn validate(&self) -> Result<()> {
        component(&self.command_id)?;
        storage::digest(&self.fingerprint)?;
        if !(1..=16).contains(&self.limit) {
            return Err(invalid("cache page limit must be 1..=16"));
        }
        Ok(())
    }
}
impl CacheLifecycle {
    pub(super) fn read(&self) -> Result<Data> {
        let path = self.root.join("gc.json");
        if !path.exists() {
            return Ok(Data::default());
        }
        let envelope: Envelope = serde_json::from_slice(&storage::read(&path, 8 * 1024 * 1024)?)
            .map_err(storage::unavailable)?;
        if content_digest(&envelope.data)? != envelope.checksum {
            return Err(invalid("cache journal checksum changed"));
        }
        let data = envelope.data;
        if data.schema_version != 1 || data.receipts.len() > 64 {
            return Err(invalid("invalid cache journal"));
        }
        for (revision, receipt) in &data.receipts {
            receipt.command.validate()?;
            if *revision != receipt.revision
                || receipt.command.expected_revision.checked_add(1) != Some(*revision)
                || *revision > data.revision
                || receipt.entries.len() > 16
                || receipt.source_checked.len() > 16
                || receipt.retained_new.len() > 16
                || matches!(receipt.state, CacheState::Complete)
                    && receipt.source_checked.len() != receipt.entries.len()
                || matches!(receipt.state, CacheState::Pending) && *revision != data.revision
            {
                return Err(invalid("invalid cache receipt"));
            }
            let mut keys = std::collections::BTreeSet::new();
            for entry in &receipt.entries {
                component(&entry.name)?;
                storage::digest(&entry.fingerprint)?;
                if !keys.insert(entry.key()) {
                    return Err(invalid("duplicate cache receipt entry"));
                }
            }
            for progress in [&receipt.source_checked, &receipt.retained_new] {
                let unique = progress.iter().collect::<std::collections::BTreeSet<_>>();
                if unique.len() != progress.len() || progress.iter().any(|key| !keys.contains(key))
                {
                    return Err(invalid("invalid cache progress"));
                }
            }
        }
        if data.revision > 0 && !data.receipts.contains_key(&data.revision) {
            return Err(invalid("cache latest receipt missing"));
        }
        Ok(data)
    }
    fn write(&self, data: &Data) -> Result<()> {
        let bytes =
            serde_json::to_vec(&serde_json::json!({"checksum":content_digest(data)?,"data":data}))
                .map_err(storage::unavailable)?;
        if bytes.len() > 8 * 1024 * 1024 {
            return Err(invalid("cache journal exceeds 8 MiB"));
        }
        storage::atomic(&self.root.join("gc.json"), &bytes, 0o600, true)
    }
    pub fn receipt(&self, revision: u64) -> Result<CacheReceipt> {
        self.read()?
            .receipts
            .remove(&revision)
            .ok_or(HostError::NotFound)
    }
    pub(in crate::loader) fn quarantined_bytes(&self, kind: CacheKind) -> Result<u64> {
        // Called under a process-use lease: no collector can rename or purge
        // these entries while the allocation decision is being made.
        let mut bytes = 0u64;
        for receipt in self
            .read()?
            .receipts
            .values()
            .filter(|r| matches!(r.state, CacheState::Pending))
        {
            for entry in receipt.entries.iter().filter(|e| e.kind == kind) {
                let target = self
                    .root
                    .join("trash")
                    .join(receipt.revision.to_string())
                    .join(entry.key());
                if let Some(identity) = inventory::identity(&target)? {
                    if identity != (entry.device, entry.inode) {
                        return Err(invalid("cache quarantine identity changed"));
                    }
                    bytes = bytes.saturating_add(entry.bytes);
                }
            }
        }
        Ok(bytes)
    }
    pub fn collect(&self, command: CacheCommand) -> Result<CacheReceipt> {
        command.validate()?;
        let _lease = self.exclusive()?;
        let mut data = self.read()?;
        let revision = command
            .expected_revision
            .checked_add(1)
            .ok_or_else(|| invalid("cache revision exhausted"))?;
        if let Some(receipt) = data.receipts.get(&revision) {
            if receipt.command != command {
                return Err(HostError::Control(ControlError::CommandConflict));
            }
            if matches!(receipt.state, CacheState::Complete) {
                return Ok(receipt.clone());
            }
        } else {
            if command.expected_revision != data.revision {
                return Err(HostError::Control(ControlError::Conflict {
                    expected: Some(command.expected_revision),
                    actual: Some(data.revision),
                }));
            }
            if data
                .receipts
                .values()
                .any(|r| matches!(r.state, CacheState::Pending))
            {
                return Err(HostError::Control(ControlError::Busy));
            }
            let plan = self.plan(&command.after, command.limit)?;
            if plan.fingerprint != command.fingerprint {
                return Err(HostError::Control(ControlError::CommandConflict));
            }
            data.revision = revision;
            data.receipts
                .retain(|r, _| *r > revision.saturating_sub(64));
            data.receipts.insert(
                revision,
                CacheReceipt {
                    command: command.clone(),
                    revision,
                    state: CacheState::Pending,
                    entries: plan.entries,
                    source_checked: Vec::new(),
                    retained_new: Vec::new(),
                },
            );
            self.write(&data)?;
        }
        let mut receipt = data.receipts[&revision].clone();
        let trash = storage::directory(&self.root.join("trash").join(revision.to_string()))?;
        for entry in receipt.entries.clone() {
            let source = self.source(&entry)?;
            let target = trash.join(entry.key());
            let expected = Some((entry.device, entry.inode));
            let original = inventory::identity(&source)?;
            if !receipt.source_checked.contains(&entry.key()) {
                match inventory::identity(&target)? {
                    Some(identity) if Some(identity) != expected => {
                        return Err(invalid("cache quarantine identity changed"));
                    }
                    Some(_) => {}
                    None if original == expected
                        && inventory::inspect(entry.kind, &entry.name, &source)?.fingerprint
                            == entry.fingerprint =>
                    {
                        std::fs::rename(&source, &target).map_err(storage::unavailable)?;
                        sync(
                            source
                                .parent()
                                .ok_or_else(|| invalid("cache source parent missing"))?,
                        )?;
                        sync(&trash)?;
                        #[cfg(test)]
                        if self.test_exit == Some("move") {
                            std::process::exit(97);
                        }
                    }
                    None if original.is_some() => {
                        if !receipt.retained_new.contains(&entry.key()) {
                            receipt.retained_new.push(entry.key());
                        }
                    }
                    None => {}
                }
                // Persist this fence before purging. After a crash, a recreated
                // source is never moved again, even if its inode was recycled.
                receipt.source_checked.push(entry.key());
                data.receipts.insert(revision, receipt.clone());
                self.write(&data)?;
            }
            // A new invocation may have rebuilt the same logical directory
            // after an interrupted collection. Only the recorded inode moves.
            if original.is_some()
                && (original != expected || inventory::identity(&target)?.is_none())
                && !receipt.retained_new.contains(&entry.key())
            {
                receipt.retained_new.push(entry.key());
            }
            if let Some(identity) = inventory::identity(&target)? {
                if Some(identity) != expected {
                    return Err(invalid("cache quarantine identity changed"));
                }
                let meta = std::fs::symlink_metadata(&target).map_err(storage::unavailable)?;
                if meta.is_dir() {
                    std::fs::remove_dir_all(&target).map_err(storage::unavailable)?;
                } else {
                    std::fs::remove_file(&target).map_err(storage::unavailable)?;
                }
                sync(&trash)?;
            }
            #[cfg(test)]
            if self.test_exit == Some("purge") {
                std::process::exit(98);
            }
        }
        std::fs::remove_dir(&trash).map_err(storage::unavailable)?;
        sync(
            trash
                .parent()
                .ok_or_else(|| invalid("cache quarantine parent missing"))?,
        )?;
        receipt.state = CacheState::Complete;
        data.receipts.insert(revision, receipt.clone());
        self.write(&data)?;
        Ok(receipt)
    }
}
fn sync(path: &Path) -> Result<()> {
    nofy_agent_runtime::sync_directory(path).map_err(|_| {
        HostError::Control(ControlError::CommitUncertain(
            "cache operation may have committed; inspect and resume its receipt".into(),
        ))
    })
}
