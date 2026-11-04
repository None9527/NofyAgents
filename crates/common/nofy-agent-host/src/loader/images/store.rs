use super::*;
#[derive(Clone)]
pub struct ImageStore {
    root: PathBuf,
    trees: PathBuf,
    verified: Arc<std::sync::Mutex<std::collections::BTreeMap<String, FileStamp>>>,
}
#[derive(Clone, PartialEq, Eq)]
struct FileStamp {
    length: u64,
    modified: std::time::SystemTime,
    #[cfg(unix)]
    identity: (u64, u64, i64, i64),
}
impl FileStamp {
    fn read(path: &Path) -> Result<Self> {
        let metadata = std::fs::symlink_metadata(path).map_err(storage::unavailable)?;
        if !metadata.is_file() || metadata.len() > MAX_WIRE {
            return Err(invalid("invalid runtime image object"));
        }
        #[cfg(unix)]
        use std::os::unix::fs::MetadataExt;
        Ok(Self {
            length: metadata.len(),
            modified: metadata.modified().map_err(storage::unavailable)?,
            #[cfg(unix)]
            identity: (
                metadata.dev(),
                metadata.ino(),
                metadata.ctime(),
                metadata.ctime_nsec(),
            ),
        })
    }
}
#[derive(Serialize)]
pub struct ImageInfo {
    pub digest: String,
    pub id: String,
    pub platform: String,
    pub files: usize,
    pub decoded_bytes: u64,
}
impl ImageInfo {
    fn new(digest: String, manifest: &ImageManifest) -> Self {
        Self {
            digest,
            id: manifest.id.clone(),
            platform: manifest.platform.clone(),
            files: manifest.files.len(),
            decoded_bytes: manifest.files.values().map(|f| f.size).sum(),
        }
    }
}
impl ImageStore {
    pub fn open(root: &Path) -> Result<Self> {
        let root = storage::directory(root)?;
        let trees = storage::directory(&root.join("trees"))?;
        storage::directory(&root.join("objects"))?;
        Ok(Self {
            root,
            trees,
            verified: Default::default(),
        })
    }
    fn object(&self, digest: &str) -> PathBuf {
        self.root.join("objects").join(format!("{digest}.json"))
    }
    fn metadata(&self, digest: &str) -> Result<ImageManifest> {
        #[derive(Deserialize)]
        struct Metadata {
            manifest: ImageManifest,
        }
        let metadata: Metadata =
            serde_json::from_slice(&storage::read(&self.object(digest), MAX_WIRE)?)
                .map_err(storage::unavailable)?;
        if metadata.manifest.digest()? != digest {
            return Err(invalid("runtime image metadata digest mismatch"));
        }
        Ok(metadata.manifest)
    }
    pub fn get(&self, digest: &str) -> Result<RuntimeImage> {
        storage::digest(digest)?;
        let path = self.object(digest);
        if !path.exists() {
            return Err(HostError::NotFound);
        }
        let before = FileStamp::read(&path)?;
        let image: RuntimeImage = serde_json::from_slice(&storage::read(&path, MAX_WIRE)?)
            .map_err(storage::unavailable)?;
        image.validate()?;
        if image.manifest.digest()? != digest {
            return Err(invalid("stored runtime manifest digest mismatch"));
        }
        if before != FileStamp::read(&path)? {
            return Err(invalid("runtime image changed during validation"));
        }
        self.remember(digest, before)?;
        Ok(image)
    }
    pub(in crate::loader) fn verify(&self, digest: &str) -> Result<()> {
        storage::digest(digest)?;
        let stamp = FileStamp::read(&self.object(digest))?;
        if self
            .verified
            .lock()
            .map_err(storage::unavailable)?
            .get(digest)
            == Some(&stamp)
        {
            return Ok(());
        }
        self.get(digest)?;
        Ok(())
    }
    fn remember(&self, digest: &str, stamp: FileStamp) -> Result<()> {
        let mut verified = self.verified.lock().map_err(storage::unavailable)?;
        if verified.len() >= 64 && !verified.contains_key(digest) {
            verified.pop_first();
        }
        verified.insert(digest.into(), stamp);
        Ok(())
    }
    pub fn put(&self, image: RuntimeImage) -> Result<ImageInfo> {
        image.validate()?;
        let digest = image.manifest.digest()?;
        let info = ImageInfo::new(digest.clone(), &image.manifest);
        let encoded = serde_json::to_vec(&image).map_err(storage::unavailable)?;
        let _held = storage::lock(&self.root)?;
        if self.object(&digest).exists() {
            self.get(&digest)?;
            return Ok(info);
        }
        let mut count = 0;
        let mut size = 0u64;
        let mut decoded = 0u64;
        for entry in std::fs::read_dir(self.root.join("objects")).map_err(storage::unavailable)? {
            let entry = entry.map_err(storage::unavailable)?;
            count += 1;
            size = size.saturating_add(entry.metadata().map_err(storage::unavailable)?.len());
            decoded = decoded.saturating_add(
                match entry
                    .file_name()
                    .to_str()
                    .and_then(|s| s.strip_suffix(".json"))
                {
                    Some(id) => self.metadata(id)?.files.values().map(|f| f.size).sum(),
                    None => 256 * 1024 * 1024,
                },
            );
        }
        if count >= 64
            || size.saturating_add(encoded.len() as u64) > 1024 * 1024 * 1024
            || decoded.saturating_add(info.decoded_bytes) > 1024 * 1024 * 1024
        {
            return Err(invalid("runtime image store capacity exceeded"));
        }
        storage::atomic(&self.object(&digest), &encoded, 0o600, false)?;
        let before = FileStamp::read(&self.object(&digest))?;
        if storage::read(&self.object(&digest), MAX_WIRE)? != encoded
            || before != FileStamp::read(&self.object(&digest))?
        {
            return Err(invalid("runtime image changed during admission"));
        }
        self.remember(&digest, before)?;
        Ok(info)
    }
    pub fn list(&self, after: &str, limit: usize) -> Result<Vec<ImageInfo>> {
        if !after.is_empty() {
            storage::digest(after)?;
        }
        if !(1..=16).contains(&limit) {
            return Err(invalid("runtime image page limit must be 1..=16"));
        }
        let mut ids = Vec::new();
        for entry in std::fs::read_dir(self.root.join("objects")).map_err(storage::unavailable)? {
            let entry = entry.map_err(storage::unavailable)?;
            let file = entry.file_name();
            let name = file
                .to_str()
                .ok_or_else(|| invalid("non-UTF8 runtime object"))?;
            if name.starts_with(".tmp") {
                continue;
            }
            let digest = name
                .strip_suffix(".json")
                .ok_or_else(|| invalid("invalid runtime object name"))?;
            storage::digest(digest)?;
            ids.push(digest.to_owned());
            if ids.len() > 64 {
                return Err(invalid("runtime image catalog exceeds limit"));
            }
        }
        ids.sort();
        ids.retain(|id| id.as_str() > after);
        ids.truncate(limit);
        ids.into_iter()
            .map(|digest| {
                // Metadata listing intentionally skips payload decompression;
                // full reads and execution independently verify every blob.
                let metadata = self.metadata(&digest)?;
                Ok(ImageInfo::new(digest, &metadata))
            })
            .collect()
    }
    pub(in crate::loader) fn materialize(
        &self,
        manifest: &ImageManifest,
        quarantined_bytes: u64,
    ) -> Result<PathBuf> {
        let digest = manifest.digest()?;
        let image = self.get(&digest)?;
        let target = self.trees.join(&digest);
        if !target.exists() {
            let tmp = {
                let _held = storage::lock(&self.trees)?;
                let mut size = quarantined_bytes;
                let mut count = 0usize;
                for entry in std::fs::read_dir(&self.trees).map_err(storage::unavailable)? {
                    let entry = entry.map_err(storage::unavailable)?;
                    let name = entry.file_name();
                    let name = name
                        .to_str()
                        .ok_or_else(|| invalid("invalid image tree name"))?;
                    if name == "catalog.lock" {
                        continue;
                    }
                    if !std::fs::symlink_metadata(entry.path())
                        .map_err(storage::unavailable)?
                        .is_dir()
                    {
                        return Err(invalid("invalid image tree type"));
                    }
                    count += 1;
                    let id = if storage::digest(name).is_ok() {
                        Some(name)
                    } else {
                        name.strip_prefix('.')
                            .and_then(|s| s.get(..64))
                            .filter(|id| storage::digest(id).is_ok())
                    };
                    size = size.saturating_add(match id {
                        Some(id) => self.metadata(id)?.files.values().map(|f| f.size).sum(),
                        None => 256 * 1024 * 1024,
                    });
                    if count > 128 {
                        return Err(invalid("runtime image staging capacity exceeded"));
                    }
                }
                if size.saturating_add(manifest.files.values().map(|f| f.size).sum::<u64>())
                    > 1024 * 1024 * 1024
                {
                    return Err(invalid("runtime image decoded cache capacity exceeded"));
                }
                tempfile::Builder::new()
                    .prefix(&format!(".{digest}."))
                    .tempdir_in(&self.trees)
                    .map_err(storage::unavailable)?
            };
            for (name, file) in &manifest.files {
                let path = tmp.path().join(name);
                storage::directory(path.parent().unwrap())?;
                storage::atomic(
                    &path,
                    &decode(&image.blobs[&file.digest], file)?,
                    if file.executable { 0o500 } else { 0o400 },
                    false,
                )?;
            }
            match std::fs::rename(tmp.path(), &target) {
                Ok(()) => std::fs::File::open(&self.trees)
                    .and_then(|f| f.sync_all())
                    .map_err(storage::unavailable)?,
                Err(_) if target.exists() => {}
                Err(e) => return Err(storage::unavailable(e)),
            }
        }
        let root = storage::directory(&target)?;
        let dirs = directories(&manifest.files);
        let mut pending = vec![root.clone()];
        let mut count = 0;
        while let Some(dir) = pending.pop() {
            for entry in std::fs::read_dir(dir).map_err(storage::unavailable)? {
                let path = entry.map_err(storage::unavailable)?.path();
                let relative = path.strip_prefix(&root).map_err(storage::unavailable)?;
                let meta = std::fs::symlink_metadata(&path).map_err(storage::unavailable)?;
                if meta.is_dir() {
                    if !dirs.contains(relative) {
                        return Err(invalid("unexpected runtime cache directory"));
                    }
                    pending.push(path);
                    continue;
                }
                let file = relative
                    .to_str()
                    .and_then(|p| manifest.files.get(p))
                    .ok_or_else(|| invalid("unexpected runtime cache entry"))?;
                let bytes = storage::read(&path, file.size)?;
                if bytes.len() as u64 != file.size || storage::hash(&bytes) != file.digest {
                    return Err(invalid("runtime cache content changed"));
                }
                count += 1;
            }
        }
        if count != manifest.files.len() {
            return Err(invalid("runtime cache incomplete"));
        }
        Ok(root)
    }
}
