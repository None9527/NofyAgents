use super::*;
use lifecycle::inventory::identity;

#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub(super) struct Data {
    version: u32,
    pub revision: u64,
    pub receipts: BTreeMap<u64, UnloadReceipt>,
}
impl Default for Data {
    fn default() -> Self {
        Self {
            version: 1,
            revision: 0,
            receipts: BTreeMap::new(),
        }
    }
}
impl Data {
    pub(super) fn pending(&self) -> Option<&UnloadReceipt> {
        self.receipts
            .values()
            .find(|r| r.state == UnloadState::Pending)
    }
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Envelope {
    checksum: String,
    data: Data,
}
#[derive(Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
struct Barrier {
    version: u32,
    revision: u64,
    pending: bool,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct BarrierEnvelope {
    checksum: String,
    data: Barrier,
}
pub(super) fn barrier_pending(lifecycle: &Path) -> Result<Option<bool>> {
    let path = lifecycle.join("objects/barrier.json");
    match std::fs::symlink_metadata(&path) {
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(None),
        Err(e) => return Err(storage::unavailable(e)),
        Ok(_) => {}
    }
    let envelope: BarrierEnvelope =
        serde_json::from_slice(&storage::read(&path, 1024)?).map_err(storage::unavailable)?;
    if envelope.data.version != 1 || content_digest(&envelope.data)? != envelope.checksum {
        return Err(invalid("invalid unload admission barrier"));
    }
    Ok(Some(envelope.data.pending))
}
pub(super) fn read_at(lifecycle: &Path) -> Result<Data> {
    let root = lifecycle.join("objects");
    match std::fs::symlink_metadata(&root) {
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(Data::default()),
        Err(e) => return Err(storage::unavailable(e)),
        Ok(meta)
            if !meta.is_dir()
                || std::fs::canonicalize(&root).map_err(storage::unavailable)? != root =>
        {
            return Err(invalid("unload journal root changed"));
        }
        Ok(_) => {}
    }
    let path = root.join("gc.json");
    match std::fs::symlink_metadata(&path) {
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(Data::default()),
        Err(e) => return Err(storage::unavailable(e)),
        Ok(_) => {}
    }
    let envelope: Envelope = serde_json::from_slice(&storage::read(&path, 8 * 1024 * 1024)?)
        .map_err(storage::unavailable)?;
    if content_digest(&envelope.data)? != envelope.checksum {
        return Err(invalid("unload journal checksum changed"));
    }
    let data = envelope.data;
    if data.version != 1 || data.receipts.len() > 64 {
        return Err(invalid("unsupported unload journal"));
    }
    for (revision, receipt) in &data.receipts {
        receipt.command.validate()?;
        storage::digest(&receipt.cut.runtime_fingerprint)?;
        storage::digest(&receipt.cut.reference_fingerprint)?;
        if *revision != receipt.revision
            || receipt.command.expected_revision.checked_add(1) != Some(*revision)
            || *revision > data.revision
            || receipt.parts.len() > 16
            || receipt.bindings.len() > 8
            || receipt.state == UnloadState::Pending && *revision != data.revision
            || receipt.state == UnloadState::Complete
                && (!receipt.bindings_checked
                    || receipt.source_checked.len() != receipt.parts.len())
        {
            return Err(invalid("invalid unload receipt"));
        }
        let mut parts = BTreeSet::new();
        for part in &receipt.parts {
            storage::digest(&part.digest)?;
            storage::digest(&part.fingerprint)?;
            if !parts.insert((part.kind, &part.digest))
                || part.bytes > 1024 * 1024 * 1024
                || part.files > 65536
            {
                return Err(invalid("invalid unload part"));
            }
            let belongs =
                receipt
                    .command
                    .objects
                    .iter()
                    .any(|object| match (object, part.kind) {
                        (
                            ObjectKey::Artifact { digest },
                            PartKind::ArtifactObject | PartKind::ArtifactTree,
                        )
                        | (
                            ObjectKey::Image { digest },
                            PartKind::ImageObject | PartKind::ImageTree,
                        ) => digest == &part.digest,
                        (ObjectKey::Runtime { .. }, PartKind::RuntimeBinary) => receipt
                            .bindings
                            .iter()
                            .any(|binding| binding.executable_digest == part.digest),
                        _ => false,
                    });
            if !belongs {
                return Err(invalid("unload part is outside its command"));
            }
        }
        let mut bindings = BTreeSet::new();
        for binding in &receipt.bindings {
            storage::digest(&binding.revision)?;
            storage::digest(&binding.executable_digest)?;
            storage::digest(&binding.fingerprint)?;
            if !bindings.insert((&binding.id, &binding.revision))
                || !receipt.command.objects.contains(&ObjectKey::Runtime {
                    id: binding.id.clone(),
                    revision: binding.revision.clone(),
                })
            {
                return Err(invalid("invalid unload binding"));
            }
        }
        for index in receipt
            .source_checked
            .iter()
            .chain(receipt.retained_new.iter())
        {
            if *index >= receipt.parts.len() {
                return Err(invalid("invalid unload progress"));
            }
        }
    }
    if data.revision != 0 && !data.receipts.contains_key(&data.revision) {
        return Err(invalid("unload latest receipt missing"));
    }
    Ok(data)
}
impl ObjectStore {
    pub(super) fn read(&self) -> Result<Data> {
        read_at(self.root.parent().expect("unload lifecycle root"))
    }
    fn write(&self, data: &Data) -> Result<()> {
        let bytes =
            serde_json::to_vec(&serde_json::json!({"checksum":content_digest(data)?,"data":data}))
                .map_err(storage::unavailable)?;
        if bytes.len() > 8 * 1024 * 1024 {
            return Err(invalid("unload journal exceeds 8 MiB"));
        }
        storage::atomic(&self.root.join("gc.json"), &bytes, 0o600, true)
    }
    fn set_barrier(&self, revision: u64, pending: bool) -> Result<()> {
        let data = Barrier {
            version: 1,
            revision,
            pending,
        };
        storage::atomic(
            &self.root.join("barrier.json"),
            &serde_json::to_vec(&BarrierEnvelope {
                checksum: content_digest(&data)?,
                data,
            })
            .map_err(storage::unavailable)?,
            0o600,
            true,
        )
    }
    pub(super) fn settle_barrier(&self, data: &Data) -> Result<()> {
        self.set_barrier(data.revision, data.pending().is_some())
    }
    pub(super) fn begin(&self, command: UnloadCommand, plan: UnloadPlan) -> Result<()> {
        if !plan.eligible
            || plan.fingerprint != command.fingerprint
            || plan.revision != command.expected_revision
            || plan.objects != command.objects
        {
            return Err(HostError::Control(ControlError::CommandConflict));
        }
        let mut data = self.read()?;
        if data.pending().is_some() || data.revision != command.expected_revision {
            return Err(HostError::Control(ControlError::Busy));
        }
        let revision = data
            .revision
            .checked_add(1)
            .ok_or_else(|| invalid("unload revision exhausted"))?;
        data.revision = revision;
        data.receipts
            .retain(|r, _| *r > revision.saturating_sub(64));
        data.receipts.insert(
            revision,
            UnloadReceipt {
                revision,
                command,
                state: UnloadState::Pending,
                parts: plan.parts,
                bindings: plan.bindings,
                bindings_checked: false,
                source_checked: BTreeSet::new(),
                retained_new: BTreeSet::new(),
                cut: UnloadCut {
                    catalog_revision: plan.references.catalog_revision,
                    source_revision: plan.references.source_revision,
                    runtime_fingerprint: plan.references.runtime.fingerprint.clone(),
                    reference_fingerprint: content_digest(&plan.references)?,
                },
            },
        );
        // Admission closes before the durable deletion intent. If this write
        // succeeds but the intent does not, recovery may safely reopen it.
        self.set_barrier(revision, true)?;
        self.write(&data)
    }
    pub(super) fn resume(
        &self,
        loader: &Loader,
        mut data: Data,
        lease: &MaintenanceLease,
    ) -> Result<UnloadReceipt> {
        let mut receipt = data.pending().cloned().ok_or(HostError::NotFound)?;
        let revision = receipt.revision;
        self.set_barrier(revision, true)?;
        #[cfg(test)]
        if let Some((entered, wait)) = &self.test_pause {
            if let Some(wait) = wait.lock().map_err(storage::unavailable)?.take() {
                entered.notify_one();
                wait.recv_timeout(std::time::Duration::from_secs(5))
                    .map_err(storage::unavailable)?;
            }
        }
        if !receipt.bindings_checked {
            loader.runtimes.remove_bindings(&receipt.bindings, lease)?;
            #[cfg(test)]
            if self.test_exit == Some("bindings") {
                std::process::exit(96);
            }
            receipt.bindings_checked = true;
            data.receipts.insert(revision, receipt.clone());
            self.write(&data)?;
        }
        let trash = storage::directory(&self.root.join("trash").join(revision.to_string()))?;
        for (index, part) in receipt.parts.clone().into_iter().enumerate() {
            let source = self.source(&part)?;
            let target = trash.join(index.to_string());
            let expected = Some((part.device, part.inode));
            if !receipt.source_checked.contains(&index) {
                let original = identity(&source)?;
                match identity(&target)? {
                    Some(actual) if Some(actual) != expected => {
                        return Err(invalid("unload quarantine identity changed"));
                    }
                    Some(_) => {}
                    None if original == expected
                        && self.inspect(part.kind, &part.digest)?.fingerprint
                            == part.fingerprint =>
                    {
                        std::fs::rename(&source, &target).map_err(storage::unavailable)?;
                        sync(source.parent().expect("unload source parent"))?;
                        sync(&trash)?;
                        #[cfg(test)]
                        if self.test_exit == Some("move") {
                            std::process::exit(97);
                        }
                    }
                    None if original.is_some() => {
                        receipt.retained_new.insert(index);
                    }
                    None => {}
                }
                receipt.source_checked.insert(index);
                data.receipts.insert(revision, receipt.clone());
                self.write(&data)?;
            }
            if identity(&source)?.is_some() {
                receipt.retained_new.insert(index);
            }
            if let Some(actual) = identity(&target)? {
                if Some(actual) != expected {
                    return Err(invalid("unload quarantine identity changed"));
                }
                let metadata = std::fs::symlink_metadata(&target).map_err(storage::unavailable)?;
                if metadata.is_dir() {
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
        sync(trash.parent().expect("unload quarantine parent"))?;
        receipt.state = UnloadState::Complete;
        data.receipts.insert(revision, receipt.clone());
        self.write(&data)?;
        self.set_barrier(revision, false)?;
        Ok(receipt)
    }
}
fn sync(path: &Path) -> Result<()> {
    File::open(path).and_then(|f| f.sync_all()).map_err(|_| {
        HostError::Control(ControlError::CommitUncertain(
            "unload may have committed; inspect and resume its receipt".into(),
        ))
    })
}
