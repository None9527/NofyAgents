use super::*;
use nofy_agent_executors::resources::InstalledProgram;
use nofy_agent_runtime::system::content_digest;
use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicBool, Ordering};
use std::{collections::BTreeMap, sync::RwLock};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RuntimeManifest {
    pub id: String,
    pub revision: String,
    pub executable_digest: String,
    pub platform: String,
    pub prefix_args: Vec<String>,
    pub isolation: String,
    pub dependencies: String,
}
#[derive(Clone, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RuntimeInstall {
    pub id: String,
    pub path: PathBuf,
    pub executable_digest: String,
    #[serde(default)]
    pub prefix_args: Vec<String>,
    #[serde(default)]
    pub read_roots: Vec<PathBuf>,
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Record {
    manifest: RuntimeManifest,
    read_roots: Vec<PathBuf>,
}
#[derive(Default, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Data {
    schema_version: u32,
    entries: BTreeMap<String, Record>,
}
#[derive(Clone)]
pub(super) struct InstalledRuntime {
    pub manifest: RuntimeManifest,
    pub program: InstalledProgram,
    pub read_roots: Vec<PathBuf>,
}
#[derive(Clone)]
pub struct RuntimeStore {
    root: PathBuf,
    private_root: PathBuf,
    cache: Arc<RwLock<BTreeMap<String, InstalledRuntime>>>,
    valid: Arc<AtomicBool>,
}
fn name(id: &str) -> Result<()> {
    if id.is_empty()
        || id.len() > 128
        || !id
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b"-_".contains(&b))
    {
        return Err(HostError::Invalid(
            "runtime ID requires 1..=128 ASCII letters/digits/-/_".into(),
        ));
    }
    Ok(())
}
fn key(id: &str, revision: &str) -> String {
    format!("{id}:{revision}")
}
fn identity(manifest: &RuntimeManifest) -> Result<String> {
    Ok(content_digest(&(
        "nofy.process-runtime/v1",
        &manifest.id,
        &manifest.executable_digest,
        &manifest.platform,
        &manifest.prefix_args,
        &manifest.isolation,
        &manifest.dependencies,
    ))?)
}
impl RuntimeStore {
    pub(super) fn open(root: &Path, private_root: &Path) -> Result<Self> {
        let root = storage::directory(root)?;
        storage::directory(&root.join("bin"))?;
        let store = Self {
            root,
            private_root: private_root.into(),
            cache: Default::default(),
            valid: Arc::new(AtomicBool::new(false)),
        };
        let _ = store.refresh();
        Ok(store)
    }
    fn blob(&self, digest: &str) -> PathBuf {
        self.root.join("bin").join(digest)
    }
    fn read(&self) -> Result<Data> {
        let path = self.root.join("catalog.json");
        if !path.exists() {
            return Ok(Data {
                schema_version: 1,
                entries: Default::default(),
            });
        }
        let data: Data = serde_json::from_slice(&storage::read(&path, 1024 * 1024)?)
            .map_err(storage::unavailable)?;
        if data.schema_version != 1 || data.entries.len() > 256 {
            return Err(HostError::Unavailable("runtime catalog invalid".into()));
        }
        for (id, record) in &data.entries {
            name(&record.manifest.id)?;
            storage::digest(&record.manifest.executable_digest)?;
            if record.manifest.prefix_args.len() > 32
                || record
                    .manifest
                    .prefix_args
                    .iter()
                    .any(|s| s.len() > 4096 || s.contains('\0'))
            {
                return Err(HostError::Unavailable(
                    "runtime prefix arguments invalid".into(),
                ));
            }
            if *id != key(&record.manifest.id, &record.manifest.revision)
                || identity(&record.manifest)? != record.manifest.revision
                || record.manifest.isolation != isolation::PROTOCOL
                || record.manifest.dependencies != "host-system-libraries-unlocked-v1"
                || record.manifest.platform
                    != format!("{}-{}", std::env::consts::OS, std::env::consts::ARCH)
            {
                return Err(HostError::Unavailable("runtime manifest changed".into()));
            }
            self.check_roots(&record.read_roots)?;
        }
        Ok(data)
    }
    fn check_roots(&self, roots: &[PathBuf]) -> Result<()> {
        for path in roots {
            runtime_history::check_protected(&self.private_root, path)?;
        }
        let allowed = [
            "/usr/lib",
            "/usr/local/lib",
            "/lib",
            "/lib64",
            "/etc/ld.so.cache",
        ]
        .into_iter()
        .filter_map(|p| std::fs::canonicalize(p).ok())
        .collect::<Vec<_>>();
        if roots.len() > 32
            || roots.iter().any(|p| {
                !p.is_absolute()
                    || std::fs::canonicalize(p).ok().as_ref() != Some(p)
                    || self.private_root.starts_with(p)
                    || !allowed
                        .iter()
                        .any(|base| p == base || (base.is_dir() && p.starts_with(base)))
            })
        {
            return Err(HostError::Invalid(
                "runtime grants must stay within system library roots and not cover private kernel state".into(),
            ));
        }
        Ok(())
    }
    pub fn refresh(&self) -> Result<()> {
        let _held = match storage::lock(&self.root) {
            Ok(held) => held,
            Err(e) => {
                self.valid.store(false, Ordering::Release);
                return Err(e);
            }
        };
        let result = self.refresh_inner();
        self.valid.store(result.is_ok(), Ordering::Release);
        result
    }
    fn refresh_inner(&self) -> Result<()> {
        let data = self.read()?;
        let old = self.cache.read().map_err(storage::unavailable)?;
        let mut next = BTreeMap::new();
        for (id, record) in data.entries {
            if let Some(previous) = old.get(&id) {
                if previous.read_roots != record.read_roots
                    || content_digest(&previous.manifest)? != content_digest(&record.manifest)?
                {
                    return Err(HostError::Unavailable(
                        "immutable local runtime binding changed".into(),
                    ));
                }
                next.insert(id, previous.clone());
                continue;
            }
            let path = self.blob(&record.manifest.executable_digest);
            let bytes = storage::read(&path, 128 * 1024 * 1024)?;
            if storage::hash(&bytes) != record.manifest.executable_digest {
                return Err(HostError::Unavailable("runtime executable changed".into()));
            }
            let program = InstalledProgram::load(&path, None)
                .map_err(|e| HostError::Unavailable(e.to_string()))?;
            next.insert(
                id,
                InstalledRuntime {
                    manifest: record.manifest,
                    program,
                    read_roots: record.read_roots,
                },
            );
        }
        drop(old);
        *self.cache.write().map_err(storage::unavailable)? = next;
        Ok(())
    }
    pub fn list(&self) -> Result<Vec<RuntimeManifest>> {
        self.refresh()?;
        Ok(self
            .cache
            .read()
            .map_err(storage::unavailable)?
            .values()
            .map(|r| r.manifest.clone())
            .collect())
    }
    pub(in crate::loader) fn granted_roots(&self) -> Result<Vec<PathBuf>> {
        Ok(self
            .read()?
            .entries
            .into_values()
            .flat_map(|r| r.read_roots)
            .collect())
    }
    pub(super) fn find(&self, id: &str, revision: &str) -> Result<InstalledRuntime> {
        if !self.valid.load(Ordering::Acquire) {
            return Err(HostError::Unavailable(
                "runtime catalog is invalid or unavailable".into(),
            ));
        }
        self.cache
            .read()
            .map_err(storage::unavailable)?
            .get(&key(id, revision))
            .cloned()
            .ok_or_else(|| {
                HostError::Invalid(format!("required runtime binding missing: {id}@{revision}"))
            })
    }
    pub(in crate::loader) fn verify(&self, id: &str, revision: &str) -> Result<()> {
        self.refresh()?;
        let runtime = self.find(id, revision)?;
        let bytes = storage::read(
            &self.blob(&runtime.manifest.executable_digest),
            128 * 1024 * 1024,
        )?;
        if storage::hash(&bytes) != runtime.manifest.executable_digest {
            return Err(HostError::Unavailable("runtime executable changed".into()));
        }
        Ok(())
    }
    pub fn install(&self, request: RuntimeInstall) -> Result<RuntimeManifest> {
        name(&request.id)?;
        storage::digest(&request.executable_digest)?;
        if !request.path.is_absolute()
            || request.prefix_args.len() > 32
            || request
                .prefix_args
                .iter()
                .any(|s| s.len() > 4096 || s.contains('\0'))
        {
            return Err(HostError::Invalid(
                "invalid runtime path or prefix arguments".into(),
            ));
        }
        let path = std::fs::canonicalize(request.path).map_err(storage::unavailable)?;
        let bytes = storage::read(&path, 128 * 1024 * 1024)?;
        let machine = if cfg!(target_arch = "x86_64") {
            62u16
        } else if cfg!(target_arch = "aarch64") {
            183u16
        } else {
            0
        };
        if !cfg!(target_os = "linux")
            || machine == 0
            || bytes.len() < 64
            || &bytes[..4] != b"\x7fELF"
            || bytes[4] != 2
            || bytes[5] != 1
            || u16::from_le_bytes([bytes[18], bytes[19]]) != machine
            || !matches!(u16::from_le_bytes([bytes[16], bytes[17]]), 2 | 3)
        {
            return Err(HostError::Invalid(
                "runtime requires an executable Linux ELF64 image for this host architecture"
                    .into(),
            ));
        }
        if storage::hash(&bytes) != request.executable_digest {
            return Err(HostError::Invalid(
                "runtime executable digest mismatch".into(),
            ));
        }
        let mut roots = if request.read_roots.is_empty() {
            [
                "/usr/lib",
                "/usr/local/lib",
                "/lib",
                "/lib64",
                "/etc/ld.so.cache",
            ]
            .into_iter()
            .map(PathBuf::from)
            .filter(|p| p.exists())
            .collect()
        } else {
            request.read_roots
        };
        for p in &mut roots {
            *p = std::fs::canonicalize(&*p).map_err(storage::unavailable)?;
        }
        roots.sort();
        roots.dedup();
        self.check_roots(&roots)?;
        let mut manifest = RuntimeManifest {
            id: request.id,
            revision: String::new(),
            executable_digest: request.executable_digest,
            platform: format!("{}-{}", std::env::consts::OS, std::env::consts::ARCH),
            prefix_args: request.prefix_args,
            isolation: isolation::PROTOCOL.into(),
            dependencies: "host-system-libraries-unlocked-v1".into(),
        };
        manifest.revision = identity(&manifest)?;
        let _held = storage::lock(&self.root)?;
        let mut data = self.read()?;
        let id = key(&manifest.id, &manifest.revision);
        if let Some(old) = data.entries.get(&id) {
            if old.read_roots != roots {
                return Err(HostError::Invalid(
                    "runtime binding already installed with different local library grants".into(),
                ));
            }
            let existing = old.manifest.clone();
            if storage::read(&self.blob(&manifest.executable_digest), 128 * 1024 * 1024)? != bytes {
                return Err(HostError::Unavailable(
                    "installed runtime content changed".into(),
                ));
            }
            drop(_held);
            self.refresh()?;
            return Ok(existing);
        }
        if data.entries.len() >= 256 {
            return Err(HostError::Invalid(
                "runtime catalog capacity exceeded".into(),
            ));
        }
        if !self.blob(&manifest.executable_digest).exists() {
            let mut stored = 0u64;
            for file in std::fs::read_dir(self.root.join("bin")).map_err(storage::unavailable)? {
                stored = stored.saturating_add(
                    file.map_err(storage::unavailable)?
                        .metadata()
                        .map_err(storage::unavailable)?
                        .len(),
                );
            }
            if stored.saturating_add(bytes.len() as u64) > 1024 * 1024 * 1024 {
                return Err(HostError::Invalid(
                    "runtime image storage exceeds 1 GiB".into(),
                ));
            }
        }
        storage::atomic(
            &self.blob(&manifest.executable_digest),
            &bytes,
            0o500,
            false,
        )?;
        data.entries.insert(
            id,
            Record {
                manifest: manifest.clone(),
                read_roots: roots,
            },
        );
        let encoded = serde_json::to_vec(&data).map_err(storage::unavailable)?;
        if encoded.len() > 1024 * 1024 {
            return Err(HostError::Invalid("runtime catalog exceeds 1 MiB".into()));
        }
        storage::atomic(&self.root.join("catalog.json"), &encoded, 0o600, true)?;
        drop(_held);
        self.refresh()?;
        Ok(manifest)
    }
    pub(super) fn executable(&self, runtime: &InstalledRuntime) -> PathBuf {
        self.blob(&runtime.manifest.executable_digest)
    }
    pub(in crate::loader) fn removal_plan(
        &self,
        objects: &[super::references::ObjectKey],
        _: &super::unload::MaintenanceLease,
    ) -> Result<(Vec<super::unload::RuntimeRemoval>, Vec<String>)> {
        let data = self.read()?;
        let selected = objects
            .iter()
            .filter_map(|object| match object {
                super::references::ObjectKey::Runtime { id, revision } => Some(key(id, revision)),
                _ => None,
            })
            .collect::<std::collections::BTreeSet<_>>();
        let mut bindings = Vec::new();
        let mut binaries = std::collections::BTreeSet::new();
        for id in &selected {
            let record = data.entries.get(id).ok_or(HostError::NotFound)?;
            bindings.push(super::unload::RuntimeRemoval {
                id: record.manifest.id.clone(),
                revision: record.manifest.revision.clone(),
                executable_digest: record.manifest.executable_digest.clone(),
                fingerprint: content_digest(record)?,
            });
            binaries.insert(record.manifest.executable_digest.clone());
        }
        binaries.retain(|digest| {
            !data.entries.iter().any(|(key, record)| {
                !selected.contains(key) && record.manifest.executable_digest == *digest
            })
        });
        Ok((bindings, binaries.into_iter().collect()))
    }
    pub(in crate::loader) fn remove_bindings(
        &self,
        bindings: &[super::unload::RuntimeRemoval],
        _: &super::unload::MaintenanceLease,
    ) -> Result<()> {
        if bindings.is_empty() {
            return Ok(());
        }
        let mut data = self.read()?;
        for binding in bindings {
            let id = key(&binding.id, &binding.revision);
            if let Some(record) = data.entries.get(&id) {
                if content_digest(record)? != binding.fingerprint {
                    return Err(HostError::Control(
                        nofy_agent_runtime::control::ControlError::CommandConflict,
                    ));
                }
                data.entries.remove(&id);
            }
        }
        storage::atomic(
            &self.root.join("catalog.json"),
            &serde_json::to_vec(&data).map_err(storage::unavailable)?,
            0o600,
            true,
        )?;
        // Surviving immutable bindings remain valid. Invalidating the entire
        // cache would break pure restoration of unrelated releases until some
        // later worker/list operation happened to refresh it.
        let mut cache = self.cache.write().map_err(storage::unavailable)?;
        for binding in bindings {
            cache.remove(&key(&binding.id, &binding.revision));
        }
        Ok(())
    }
}
