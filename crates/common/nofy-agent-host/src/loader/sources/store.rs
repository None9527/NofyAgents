use super::*;
const MAX_DATA: u64 = 8 * 1024 * 1024;
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SourceEntry {
    pub revision: u64,
    pub policy: Option<SourcePolicy>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "state", rename_all = "snake_case", deny_unknown_fields)]
pub enum AcquisitionState {
    Pending,
    Failed { code: String },
    Complete,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Acquisition {
    pub request: AcquireImage,
    pub request_digest: String,
    pub attempt: u64,
    pub policy_revision: u64,
    pub policy: SourcePolicy,
    pub status: AcquisitionState,
    pub revision: u64,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Data {
    schema_version: u32,
    revision: u64,
    sources: BTreeMap<String, SourceEntry>,
    acquisitions: BTreeMap<String, Acquisition>,
}
impl Default for Data {
    fn default() -> Self {
        Self {
            schema_version: 1,
            revision: 0,
            sources: Default::default(),
            acquisitions: Default::default(),
        }
    }
}
#[derive(Clone)]
pub struct SourceStore {
    root: PathBuf,
    pub(super) work: Arc<tokio::sync::Semaphore>,
    #[cfg(test)]
    pub(super) test_exit_after_admission: Option<i32>,
    #[cfg(test)]
    pub(super) test_fail_commit: Option<(Arc<std::sync::Barrier>, Arc<std::sync::Barrier>)>,
}
#[derive(Serialize)]
pub struct SourceView {
    pub id: String,
    pub revision: u64,
    pub policy_digest: Option<String>,
    pub policy: Option<SourcePolicy>,
}
#[derive(Serialize)]
pub struct SourcePage {
    pub revision: u64,
    pub entries: Vec<SourceView>,
    pub next: Option<String>,
}
#[derive(Serialize)]
pub struct AcquisitionPage {
    pub entries: Vec<Acquisition>,
    pub next: Option<String>,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct BootstrapSource {
    pub id: String,
    pub expected_revision: Option<u64>,
    pub policy: SourcePolicy,
}
pub(super) enum Begin {
    Complete(Acquisition),
    Attempt(Acquisition),
}
impl SourceStore {
    pub(in crate::loader) fn retained_images(&self) -> Result<(u64, Vec<(String, String)>)> {
        // Atomic replacement provides one complete read snapshot. No lock-file
        // creation or credential/network access is needed for this projection.
        let data = self.read()?;
        Ok((
            data.revision,
            data.acquisitions
                .into_iter()
                .filter(|(_, record)| !matches!(record.status, AcquisitionState::Complete))
                .map(|(id, record)| (id, record.request.attestation.manifest_digest))
                .collect(),
        ))
    }
    pub fn open(root: &Path) -> Result<Self> {
        Ok(Self {
            root: storage::directory(root)?,
            work: Arc::new(tokio::sync::Semaphore::new(2)),
            #[cfg(test)]
            test_exit_after_admission: None,
            #[cfg(test)]
            test_fail_commit: None,
        })
    }
    fn read(&self) -> Result<Data> {
        let path = self.root.join("catalog.json");
        if !path.exists() {
            return Ok(Data::default());
        }
        let data: Data = serde_json::from_slice(&storage::read(&path, MAX_DATA)?)
            .map_err(|_| HostError::Unavailable("source catalog unavailable or invalid".into()))?;
        if data.schema_version != 1 || data.sources.len() > 64 || data.acquisitions.len() > 1024 {
            return Err(invalid("source catalog limits/version invalid"));
        }
        for (id, entry) in &data.sources {
            name(id)?;
            if entry.revision == 0 || entry.revision > data.revision {
                return Err(invalid("source revision invalid"));
            }
            if let Some(policy) = &entry.policy {
                policy.validate()?;
            }
        }
        for (id, record) in &data.acquisitions {
            if id != &record.request.command_id
                || record.request.digest()? != record.request_digest
                || record.policy.digest()? != record.request.policy_digest
                || record.attempt == 0
                || record.attempt > 16
                || record.policy_revision == 0
                || record.policy_revision > record.revision
                || record.revision > data.revision
            {
                return Err(invalid("source receipt invalid"));
            }
        }
        Ok(data)
    }
    fn write(&self, data: &Data) -> Result<()> {
        let bytes = serde_json::to_vec(data).map_err(storage::unavailable)?;
        if bytes.len() as u64 > MAX_DATA {
            return Err(invalid("source catalog exceeds 8 MiB"));
        }
        storage::atomic(&self.root.join("catalog.json"), &bytes, 0o600, true)
    }
    fn advance(data: &mut Data) -> Result<u64> {
        data.revision = data
            .revision
            .checked_add(1)
            .ok_or_else(|| invalid("source revision exhausted"))?;
        Ok(data.revision)
    }
    fn view(id: String, entry: SourceEntry) -> Result<SourceView> {
        Ok(SourceView {
            id,
            revision: entry.revision,
            policy_digest: entry
                .policy
                .as_ref()
                .map(SourcePolicy::digest)
                .transpose()?,
            policy: entry.policy,
        })
    }
    pub fn get(&self, id: &str) -> Result<SourceView> {
        name(id)?;
        let _held = storage::lock(&self.root)?;
        let entry = self.read()?.sources.remove(id).ok_or(HostError::NotFound)?;
        Self::view(id.into(), entry)
    }
    pub fn set(
        &self,
        id: &str,
        expected: Option<u64>,
        policy: Option<SourcePolicy>,
    ) -> Result<SourceView> {
        name(id)?;
        if let Some(policy) = &policy {
            policy.validate()?;
        }
        let _held = storage::lock(&self.root)?;
        let mut data = self.read()?;
        let actual = data.sources.get(id).map(|entry| entry.revision);
        if actual != expected {
            return Err(HostError::Control(
                nofy_agent_runtime::control::ControlError::Conflict { expected, actual },
            ));
        }
        if actual.is_none() && data.sources.len() >= 64 {
            return Err(invalid("source capacity exceeded"));
        }
        let entry = SourceEntry {
            revision: Self::advance(&mut data)?,
            policy,
        };
        data.sources.insert(id.into(), entry.clone());
        self.write(&data)?;
        Self::view(id.into(), entry)
    }
    pub fn bootstrap(&self, definitions: Vec<BootstrapSource>) -> Result<()> {
        if definitions.len() > 64 {
            return Err(invalid("bootstrap source limit exceeded"));
        }
        let _held = storage::lock(&self.root)?;
        let mut data = self.read()?;
        let mut seen = std::collections::BTreeSet::new();
        let mut changed = false;
        for definition in definitions {
            name(&definition.id)?;
            let digest = definition.policy.digest()?;
            if !seen.insert(definition.id.clone()) {
                return Err(invalid("duplicate bootstrap source"));
            }
            let entry = data.sources.get(&definition.id);
            if entry
                .and_then(|e| e.policy.as_ref())
                .is_some_and(|p| p.digest().ok().as_ref() == Some(&digest))
            {
                continue;
            }
            let actual = entry.map(|e| e.revision);
            if actual != definition.expected_revision {
                return Err(HostError::Control(
                    nofy_agent_runtime::control::ControlError::Conflict {
                        expected: definition.expected_revision,
                        actual,
                    },
                ));
            }
            if actual.is_none() && data.sources.len() >= 64 {
                return Err(invalid("source capacity exceeded"));
            }
            let revision = Self::advance(&mut data)?;
            data.sources.insert(
                definition.id,
                SourceEntry {
                    revision,
                    policy: Some(definition.policy),
                },
            );
            changed = true;
        }
        if changed {
            self.write(&data)?;
        }
        Ok(())
    }
    pub fn bootstrap_file(&self, path: &Path) -> Result<()> {
        let path = std::fs::canonicalize(path).map_err(storage::unavailable)?;
        let entries = serde_json::from_slice(&storage::read(&path, 256 * 1024)?)
            .map_err(|_| invalid("invalid source policy file"))?;
        self.bootstrap(entries)
    }
    pub fn list(&self, after: &str, limit: usize) -> Result<SourcePage> {
        page(after, limit)?;
        let _held = storage::lock(&self.root)?;
        let data = self.read()?;
        let mut entries = data
            .sources
            .into_iter()
            .filter(|(id, _)| id.as_str() > after)
            .take(limit + 1)
            .map(|(id, entry)| Self::view(id, entry))
            .collect::<Result<Vec<_>>>()?;
        let more = entries.len() > limit;
        entries.truncate(limit);
        let next = if more {
            entries.last().map(|e| e.id.clone())
        } else {
            None
        };
        Ok(SourcePage {
            revision: data.revision,
            entries,
            next,
        })
    }
    pub fn acquisition(&self, id: &str) -> Result<Acquisition> {
        name(id)?;
        let _held = storage::lock(&self.root)?;
        self.read()?
            .acquisitions
            .remove(id)
            .ok_or(HostError::NotFound)
    }
    pub fn acquisitions(&self, after: &str, limit: usize) -> Result<AcquisitionPage> {
        page(after, limit)?;
        let _held = storage::lock(&self.root)?;
        let mut entries = self
            .read()?
            .acquisitions
            .into_iter()
            .filter(|(id, _)| id.as_str() > after)
            .map(|(_, v)| v)
            .take(limit + 1)
            .collect::<Vec<_>>();
        let more = entries.len() > limit;
        entries.truncate(limit);
        let next = if more {
            entries.last().map(|e| e.request.command_id.clone())
        } else {
            None
        };
        Ok(AcquisitionPage { entries, next })
    }
    fn authorized(data: &Data, command: &AcquireImage) -> Result<SourceEntry> {
        let entry = data
            .sources
            .get(&command.source)
            .filter(|e| e.policy.is_some())
            .ok_or_else(|| invalid("source is not authorized"))?;
        let policy = entry.policy.as_ref().unwrap();
        if policy.digest()? != command.policy_digest {
            return Err(invalid("source authorization digest changed"));
        }
        command.attestation.verify(policy)?;
        Ok(entry.clone())
    }
    pub fn preflight(&self, command: &AcquireImage) -> Result<()> {
        let digest = command.digest()?;
        let _held = storage::lock(&self.root)?;
        let data = self.read()?;
        if let Some(record) = data.acquisitions.get(&command.command_id) {
            if record.request_digest != digest {
                return Err(HostError::Control(
                    nofy_agent_runtime::control::ControlError::CommandConflict,
                ));
            }
            if matches!(record.status, AcquisitionState::Complete) {
                record.request.attestation.verify(&record.policy)?;
                return Ok(());
            }
        }
        Self::authorized(&data, command)?;
        Ok(())
    }
    pub fn locator(&self, image: &str) -> Result<AcquireImage> {
        storage::digest(image)?;
        let _held = storage::lock(&self.root)?;
        let data = self.read()?;
        let mut candidates = data
            .acquisitions
            .values()
            .filter(|r| {
                matches!(r.status, AcquisitionState::Complete)
                    && r.request.attestation.manifest_digest == image
            })
            .collect::<Vec<_>>();
        candidates.sort_by_key(|r| std::cmp::Reverse(r.revision));
        for record in candidates {
            if Self::authorized(&data, &record.request).is_ok() {
                return Ok(record.request.clone());
            }
        }
        Err(HostError::Unavailable(
            "no currently authorized signed source for this image".into(),
        ))
    }
    pub(super) fn begin(&self, command: AcquireImage) -> Result<Begin> {
        let digest = command.digest()?;
        let _held = storage::lock(&self.root)?;
        let mut data = self.read()?;
        let previous = data.acquisitions.get(&command.command_id);
        if let Some(record) = previous {
            if record.request_digest != digest {
                return Err(HostError::Control(
                    nofy_agent_runtime::control::ControlError::CommandConflict,
                ));
            }
            if matches!(record.status, AcquisitionState::Complete) {
                record.request.attestation.verify(&record.policy)?;
                return Ok(Begin::Complete(record.clone()));
            }
        }
        if previous.is_none() && data.acquisitions.len() >= 1024 {
            return Err(invalid("source acquisition capacity exceeded"));
        }
        let attempt = previous.map_or(1, |r| r.attempt + 1);
        if attempt > 16 {
            return Err(invalid("source acquisition retry limit exceeded"));
        }
        let source = Self::authorized(&data, &command)?;
        let record = Acquisition {
            request: command.clone(),
            request_digest: digest,
            attempt,
            policy_revision: source.revision,
            policy: source.policy.unwrap(),
            status: AcquisitionState::Pending,
            revision: Self::advance(&mut data)?,
        };
        data.acquisitions.insert(command.command_id, record.clone());
        self.write(&data)?;
        Ok(Begin::Attempt(record))
    }
    pub(super) fn fail(&self, attempt: &Acquisition, code: &str) -> Result<()> {
        #[cfg(test)]
        if let Some((entered, release)) = &self.test_fail_commit {
            entered.wait();
            release.wait();
        }
        let _held = storage::lock(&self.root)?;
        let mut data = self.read()?;
        let Some(current) = data.acquisitions.get(&attempt.request.command_id) else {
            return Err(HostError::NotFound);
        };
        if current.request_digest != attempt.request_digest
            || current.attempt != attempt.attempt
            || matches!(current.status, AcquisitionState::Complete)
        {
            return Ok(());
        }
        let revision = Self::advance(&mut data)?;
        let record = data
            .acquisitions
            .get_mut(&attempt.request.command_id)
            .unwrap();
        record.status = AcquisitionState::Failed { code: code.into() };
        record.revision = revision;
        self.write(&data)
    }
    pub(super) fn finish(
        &self,
        attempt: &Acquisition,
        image: images::RuntimeImage,
        images: &images::ImageStore,
    ) -> Result<Acquisition> {
        let _held = storage::lock(&self.root)?;
        let mut data = self.read()?;
        let current = data
            .acquisitions
            .get(&attempt.request.command_id)
            .ok_or(HostError::NotFound)?;
        if current.request_digest != attempt.request_digest {
            return Err(HostError::Control(
                nofy_agent_runtime::control::ControlError::CommandConflict,
            ));
        }
        if matches!(current.status, AcquisitionState::Complete) {
            return Ok(current.clone());
        }
        let source = Self::authorized(&data, &attempt.request)?;
        if source.revision != attempt.policy_revision || current.attempt != attempt.attempt {
            return Err(invalid(
                "source authorization/attempt changed before admission",
            ));
        }
        if image.manifest.digest()? != attempt.request.attestation.manifest_digest {
            return Err(invalid("source image identity mismatch"));
        }
        images.put(image)?;
        #[cfg(test)]
        if let Some(code) = self.test_exit_after_admission {
            std::process::exit(code);
        }
        let revision = Self::advance(&mut data)?;
        let record = data
            .acquisitions
            .get_mut(&attempt.request.command_id)
            .unwrap();
        record.status = AcquisitionState::Complete;
        record.revision = revision;
        let result = record.clone();
        self.write(&data)?;
        Ok(result)
    }
}
fn page(after: &str, limit: usize) -> Result<()> {
    if !after.is_empty() {
        name(after)?;
    }
    if !(1..=64).contains(&limit) {
        return Err(invalid("source page limit must be 1..=64"));
    }
    Ok(())
}
