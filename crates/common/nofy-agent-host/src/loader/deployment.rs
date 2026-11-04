use super::{
    images::{ImageManifest, RuntimeImage},
    *,
};
use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, BTreeSet};
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Deployment {
    pub format: String,
    pub system: SystemFile,
    pub runtime_images: Vec<RuntimeImage>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SourcedDeployment {
    pub format: String,
    pub system: SystemFile,
    pub runtime_sources: Vec<super::sources::AcquireImage>,
}
#[derive(Clone, Debug, Serialize)]
#[serde(untagged)]
pub enum DeploymentFile {
    Sourced(SourcedDeployment),
    Portable(Deployment),
    Legacy(SystemFile),
}
impl<'de> Deserialize<'de> for DeploymentFile {
    fn deserialize<D: serde::Deserializer<'de>>(
        deserializer: D,
    ) -> std::result::Result<Self, D::Error> {
        let value = serde_json::Value::deserialize(deserializer)?;
        if value.get("runtime_sources").is_some()
            || value
                .get("format")
                .is_some_and(|v| v == "nofy.deployment/v2")
        {
            return serde_json::from_value(value)
                .map(Self::Sourced)
                .map_err(serde::de::Error::custom);
        }
        if value.get("format").is_some()
            || value.get("runtime_images").is_some()
            || value.get("system").is_some()
        {
            serde_json::from_value(value)
                .map(Self::Portable)
                .map_err(serde::de::Error::custom)
        } else {
            serde_json::from_value(value)
                .map(Self::Legacy)
                .map_err(serde::de::Error::custom)
        }
    }
}
impl DeploymentFile {
    pub fn read(path: &Path) -> Result<Self> {
        use std::fs::OpenOptions;
        let path = std::fs::canonicalize(path).map_err(storage::unavailable)?;
        let mut options = OpenOptions::new();
        options.read(true);
        #[cfg(target_os = "linux")]
        {
            use std::os::unix::fs::OpenOptionsExt;
            options.custom_flags(libc::O_NOFOLLOW | libc::O_NONBLOCK);
        }
        let file = options.open(path).map_err(storage::unavailable)?;
        if !file.metadata().map_err(storage::unavailable)?.is_file() {
            return Err(HostError::Invalid(
                "deployment must be a regular file".into(),
            ));
        }
        serde_json::from_reader(std::io::BufReader::new(file))
            .map_err(|e| HostError::Invalid(e.to_string()))
    }
    pub fn from_json(bytes: &[u8]) -> Result<Self> {
        serde_json::from_slice(bytes).map_err(|e| HostError::Invalid(e.to_string()))
    }
    pub fn document(&self) -> &SystemDocument {
        let file = match self {
            Self::Sourced(d) => &d.system,
            Self::Portable(d) => &d.system,
            Self::Legacy(f) => f,
        };
        match file {
            SystemFile::Source(d) => d,
            SystemFile::Locked(b) => &b.document,
        }
    }
    pub fn carries_images(&self) -> bool {
        matches!(self,Self::Portable(d) if !d.runtime_images.is_empty())
            || matches!(self,Self::Sourced(d) if !d.runtime_sources.is_empty())
    }
}
impl SourcedDeployment {
    fn preflight(&self, store: &super::sources::SourceStore) -> Result<()> {
        if self.format != "nofy.deployment/v2" || self.runtime_sources.len() > 16 {
            return Err(HostError::Invalid(
                "invalid sourced deployment format/count".into(),
            ));
        }
        let document = match &self.system {
            SystemFile::Source(d) => d,
            SystemFile::Locked(b) => {
                b.validate()?;
                &b.document
            }
        };
        let mut required = BTreeSet::new();
        for module in module_walk::collect(document)? {
            if module.factory != "resource.process_locked" {
                continue;
            }
            let digest = if module.config.get("image").is_some() {
                #[derive(Deserialize)]
                #[serde(deny_unknown_fields)]
                struct Ref {
                    image: String,
                }
                let reference: Ref = serde_json::from_value(module.config.clone())
                    .map_err(|e| HostError::Invalid(e.to_string()))?;
                storage::digest(&reference.image)?;
                reference.image
            } else {
                manifest(&module.config)?.digest()?
            };
            required.insert(digest);
        }
        let mut provided = BTreeSet::new();
        for source in &self.runtime_sources {
            source.validate()?;
            if !required.contains(&source.attestation.manifest_digest)
                || !provided.insert(source.attestation.manifest_digest.clone())
            {
                return Err(HostError::Invalid(
                    "unused/duplicate deployment source".into(),
                ));
            }
            store.preflight(source)?;
        }
        Ok(())
    }
}
pub(super) fn manifest(value: &serde_json::Value) -> Result<ImageManifest> {
    #[derive(Deserialize)]
    #[serde(deny_unknown_fields)]
    struct Config {
        manifest: ImageManifest,
    }
    let config: Config =
        serde_json::from_value(value.clone()).map_err(|e| HostError::Invalid(e.to_string()))?;
    config.manifest.validate()?;
    Ok(config.manifest)
}
impl Loader {
    pub async fn export_sourced_deployment(
        &self,
        bundle: nofy_agent_runtime::system::SystemBundle,
    ) -> Result<SourcedDeployment> {
        let loader = self.clone();
        tokio::task::spawn_blocking(move || {
            bundle.validate()?;
            let mut seen = BTreeSet::new();
            let mut runtime_sources = Vec::new();
            for module in module_walk::collect(&bundle.document)? {
                if module.factory == "resource.process_locked" {
                    let digest = manifest(&module.config)?.digest()?;
                    if seen.insert(digest.clone()) {
                        runtime_sources.push(loader.sources.locator(&digest)?);
                    }
                }
            }
            if runtime_sources.len() > 16 {
                return Err(HostError::Invalid(
                    "sourced deployment exceeds 16 source references".into(),
                ));
            }
            Ok(SourcedDeployment {
                format: "nofy.deployment/v2".into(),
                system: SystemFile::Locked(bundle),
                runtime_sources,
            })
        })
        .await
        .map_err(storage::unavailable)?
    }
    pub async fn prepare_deployment(
        &self,
        file: DeploymentFile,
        persist: bool,
    ) -> Result<SystemFile> {
        let mut deferred = BTreeSet::new();
        let file = match file {
            DeploymentFile::Sourced(deployment) => {
                let store = self.sources.clone();
                let preflight = deployment.clone();
                tokio::task::spawn_blocking(move || preflight.preflight(&store))
                    .await
                    .map_err(storage::unavailable)??;
                if persist {
                    for command in &deployment.runtime_sources {
                        self.acquire_image(command.clone(), Default::default())
                            .await?;
                    }
                } else {
                    // Only preflighted, signed source claims can defer missing
                    // payloads in a pure preview. They do not admit resources.
                    deferred.extend(
                        deployment
                            .runtime_sources
                            .iter()
                            .map(|source| source.attestation.manifest_digest.clone()),
                    );
                }
                DeploymentFile::Portable(Deployment {
                    format: "nofy.deployment/v1".into(),
                    system: deployment.system,
                    runtime_images: Vec::new(),
                })
            }
            other => other,
        };
        let loader = self.clone();
        tokio::task::spawn_blocking(move || {
            loader.prepare_deployment_blocking(file, persist, deferred)
        })
        .await
        .map_err(storage::unavailable)?
    }
    fn prepare_deployment_blocking(
        &self,
        file: DeploymentFile,
        persist: bool,
        deferred: BTreeSet<String>,
    ) -> Result<SystemFile> {
        let (mut system, images) = match file {
            DeploymentFile::Sourced(_) => {
                return Err(HostError::Invalid(
                    "sourced deployment requires asynchronous acquisition boundary".into(),
                ));
            }
            DeploymentFile::Legacy(file) => (file, Vec::new()),
            DeploymentFile::Portable(d) => {
                if d.format != "nofy.deployment/v1" || d.runtime_images.len() > 64 {
                    return Err(HostError::Invalid("invalid deployment format/count".into()));
                }
                (d.system, d.runtime_images)
            }
        };
        let mut embedded = BTreeMap::new();
        let mut encoded = 0usize;
        for image in images {
            image.validate()?;
            encoded += serde_json::to_vec(&image)
                .map_err(storage::unavailable)?
                .len();
            if encoded > 24 * 1024 * 1024 {
                return Err(HostError::Invalid("deployment images exceed 24 MiB".into()));
            }
            if embedded.insert(image.manifest.digest()?, image).is_some() {
                return Err(HostError::Invalid("duplicate deployment image".into()));
            }
        }
        if let SystemFile::Source(document) = &mut system {
            self.resolve_document(document)?;
            module_walk::visit(document, &mut |module| {
                if module.factory == "resource.process_locked"
                    && module.config.get("image").is_some()
                {
                    #[derive(Deserialize)]
                    #[serde(deny_unknown_fields)]
                    struct Ref {
                        image: String,
                    }
                    let reference: Ref = serde_json::from_value(module.config.clone())
                        .map_err(|e| HostError::Invalid(e.to_string()))?;
                    storage::digest(&reference.image)?;
                    let metadata = match embedded.get(&reference.image) {
                        Some(image) => image.manifest.clone(),
                        None => self.images.get(&reference.image)?.manifest,
                    };
                    module.config = serde_json::json!({"manifest":metadata});
                }
                Ok(())
            })?;
        } else if let SystemFile::Locked(bundle) = &system {
            bundle.validate()?;
        }
        let document = match &system {
            SystemFile::Source(d) => d,
            SystemFile::Locked(b) => &b.document,
        };
        let mut used = BTreeSet::new();
        for module in module_walk::collect(document)? {
            if module.factory != "resource.process_locked" {
                continue;
            }
            let metadata = manifest(&module.config)?;
            let digest = metadata.digest()?;
            if !used.insert(digest.clone()) {
                continue;
            }
            let image = match embedded.get(&digest) {
                Some(image) => image.clone(),
                None => match self.images.get(&digest) {
                    Ok(image) => image,
                    Err(HostError::NotFound) if !persist && deferred.contains(&digest) => continue,
                    Err(error) => return Err(error),
                },
            };
            if image.manifest.digest()? != digest {
                return Err(HostError::Invalid(
                    "deployment image identity mismatch".into(),
                ));
            }
        }
        if embedded.keys().any(|id| !used.contains(id)) {
            return Err(HostError::Invalid(
                "deployment contains unused runtime image".into(),
            ));
        }
        // Image preflight precedes admission. Compilation/publication remain
        // separate control-plane transactions, not a fake batch rollback.
        if persist {
            super::directories::preflight(document, &self.private_root)?;
            super::local::preflight(document, &self.private_root)?;
            super::process_tree::preflight(document)?;
        }
        let resolved = self.resolve(system)?;
        if persist {
            for image in embedded.into_values() {
                self.images.put(image)?;
            }
        }
        Ok(resolved)
    }
}

#[cfg(test)]
mod tests;
