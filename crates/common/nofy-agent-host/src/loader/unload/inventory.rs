use super::*;
use lifecycle::{CacheKind, inventory as cache};

impl ObjectStore {
    pub(super) fn source(&self, part: &ObjectPart) -> Result<PathBuf> {
        storage::digest(&part.digest)?;
        let (directory, suffix) = match part.kind {
            PartKind::ArtifactObject => ("artifacts/objects", format!("{}.json", part.digest)),
            PartKind::ArtifactTree => ("artifacts/trees", part.digest.clone()),
            PartKind::ImageObject => ("images/objects", format!("{}.json", part.digest)),
            PartKind::ImageTree => ("images/trees", part.digest.clone()),
            PartKind::RuntimeBinary => ("runtimes/bin", part.digest.clone()),
        };
        let base = self.loader_root.join(directory);
        let metadata = std::fs::symlink_metadata(&base).map_err(storage::unavailable)?;
        if !metadata.is_dir() || std::fs::canonicalize(&base).map_err(storage::unavailable)? != base
        {
            return Err(invalid("unload source root changed"));
        }
        Ok(base.join(suffix))
    }
    pub(super) fn inspect(&self, kind: PartKind, digest: &str) -> Result<ObjectPart> {
        let mut part = ObjectPart {
            kind,
            digest: digest.into(),
            files: 0,
            bytes: 0,
            fingerprint: String::new(),
            device: 0,
            inode: 0,
        };
        let path = self.source(&part)?;
        let metadata = std::fs::symlink_metadata(&path).map_err(storage::unavailable)?;
        if !matches!(kind, PartKind::ArtifactTree | PartKind::ImageTree) && !metadata.is_file() {
            return Err(invalid("persistent unload target must be a regular file"));
        }
        let entry = cache::inspect(
            if matches!(kind, PartKind::ImageObject | PartKind::ImageTree) {
                CacheKind::Image
            } else {
                CacheKind::Artifact
            },
            digest,
            &path,
        )?;
        part.files = entry.files;
        part.bytes = entry.bytes;
        part.fingerprint = entry.fingerprint;
        part.device = entry.device;
        part.inode = entry.inode;
        if cache::identity(&self.root.join("trash"))?.map(|v| v.0) != Some(part.device) {
            return Err(invalid(
                "unload quarantine must share the target filesystem",
            ));
        }
        Ok(part)
    }
    pub(super) fn inventory(
        &self,
        loader: &Loader,
        objects: &[ObjectKey],
        lease: &MaintenanceLease,
    ) -> Result<(Vec<ObjectPart>, Vec<RuntimeRemoval>)> {
        let mut selected = BTreeSet::new();
        for object in objects {
            let (required, optional, digest) = match object {
                ObjectKey::Artifact { digest } => {
                    (PartKind::ArtifactObject, PartKind::ArtifactTree, digest)
                }
                ObjectKey::Image { digest } => (PartKind::ImageObject, PartKind::ImageTree, digest),
                ObjectKey::Runtime { .. } => continue,
            };
            let empty = ObjectPart {
                kind: required,
                digest: digest.clone(),
                files: 0,
                bytes: 0,
                fingerprint: String::new(),
                device: 0,
                inode: 0,
            };
            if cache::identity(&self.source(&empty)?)?.is_none() {
                return Err(HostError::NotFound);
            }
            selected.insert((required, digest.clone()));
            let optional_part = ObjectPart {
                kind: optional,
                ..empty
            };
            if cache::identity(&self.source(&optional_part)?)?.is_some() {
                selected.insert((optional, digest.clone()));
            }
        }
        let (bindings, binaries) = loader.runtimes.removal_plan(objects, lease)?;
        for digest in binaries {
            selected.insert((PartKind::RuntimeBinary, digest));
        }
        let mut parts = Vec::new();
        let mut bytes = 0u64;
        for (kind, digest) in selected {
            let part = self.inspect(kind, &digest)?;
            bytes = bytes.saturating_add(part.bytes);
            if bytes > 1024 * 1024 * 1024 || parts.len() >= 16 {
                return Err(invalid("unload plan exceeds bounded inventory"));
            }
            parts.push(part);
        }
        Ok((parts, bindings))
    }
}
