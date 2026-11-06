use super::*;
use nofy_agent_runtime::artifact::ArtifactBundle;
use serde::Serialize;

#[derive(Clone)]
pub struct ArtifactStore {
    root: PathBuf,
    trees: PathBuf,
}
#[derive(Clone, Serialize)]
pub struct ArtifactInfo {
    pub digest: String,
    pub files: usize,
    pub bytes: usize,
}
impl ArtifactStore {
    pub fn open(root: &Path) -> Result<Self> {
        let root = storage::directory(root)?;
        let trees = storage::directory(&root.join("trees"))?;
        storage::directory(&root.join("objects"))?;
        Ok(Self { root, trees })
    }
    fn object(&self, digest: &str) -> PathBuf {
        self.root.join("objects").join(format!("{digest}.json"))
    }
    pub fn get(&self, digest: &str) -> Result<ArtifactBundle> {
        storage::digest(digest)?;
        let path = self.object(digest);
        if !path.exists() {
            return Err(HostError::NotFound);
        }
        let bytes = storage::read(&path, 4 * 1024 * 1024)?;
        let bundle: ArtifactBundle =
            serde_json::from_slice(&bytes).map_err(storage::unavailable)?;
        if bundle.digest()? != digest {
            return Err(HostError::Unavailable("artifact digest mismatch".into()));
        }
        Ok(bundle)
    }
    pub fn put(&self, bundle: ArtifactBundle) -> Result<ArtifactInfo> {
        let digest = bundle.digest()?;
        let info = ArtifactInfo {
            digest: digest.clone(),
            files: bundle.files.len(),
            bytes: bundle.bytes(),
        };
        let _lock = storage::lock(&self.root)?;
        if self.object(&digest).exists() {
            self.get(&digest)?;
            return Ok(info);
        }
        let entries = std::fs::read_dir(self.root.join("objects"))
            .map_err(storage::unavailable)?
            .collect::<std::io::Result<Vec<_>>>()
            .map_err(storage::unavailable)?;
        let mut bytes = 0u64;
        let mut count = 0usize;
        for entry in entries {
            if entry
                .file_name()
                .to_str()
                .is_some_and(|v| v.ends_with(".json"))
            {
                count += 1;
                bytes = bytes.saturating_add(entry.metadata().map_err(storage::unavailable)?.len());
            }
        }
        let encoded = serde_json::to_vec(&bundle).map_err(storage::unavailable)?;
        if count >= 1024 || bytes.saturating_add(encoded.len() as u64) > 512 * 1024 * 1024 {
            return Err(HostError::Invalid(
                "artifact store capacity exceeded".into(),
            ));
        }
        storage::atomic(&self.object(&digest), &encoded, 0o600, false)?;
        Ok(info)
    }
    pub fn list(&self, after: &str, limit: usize) -> Result<Vec<ArtifactInfo>> {
        if !after.is_empty() {
            storage::digest(after)?;
        }
        if !(1..=256).contains(&limit) {
            return Err(HostError::Invalid(
                "artifact page limit must be 1..=256".into(),
            ));
        }
        let mut ids = Vec::new();
        for entry in std::fs::read_dir(self.root.join("objects")).map_err(storage::unavailable)? {
            let entry = entry.map_err(storage::unavailable)?;
            if let Some(id) = entry
                .file_name()
                .to_str()
                .and_then(|s| s.strip_suffix(".json"))
            {
                storage::digest(id)?;
                if id > after {
                    ids.push(id.to_owned());
                }
            }
        }
        ids.sort();
        ids.truncate(limit);
        ids.into_iter()
            .map(|id| {
                let b = self.get(&id)?;
                Ok(ArtifactInfo {
                    digest: id,
                    files: b.files.len(),
                    bytes: b.bytes(),
                })
            })
            .collect()
    }
    /// No source execution here. A completed immutable directory is checked
    /// before reuse; symlinks and extra files never become ambient code inputs.
    pub(super) fn materialize(&self, bundle: &ArtifactBundle) -> Result<PathBuf> {
        let digest = bundle.digest()?;
        let target = self.trees.join(digest);
        if !target.exists() {
            let tmp = tempfile::tempdir_in(&self.trees).map_err(storage::unavailable)?;
            for (path, text) in &bundle.files {
                let file = tmp.path().join(path);
                let parent = file.parent().expect("relative artifact file");
                storage::directory(parent)?;
                storage::atomic(&file, text.as_bytes(), 0o400, false)?;
            }
            match std::fs::rename(tmp.path(), &target) {
                Ok(()) => {
                    nofy_agent_runtime::sync_directory(&self.trees)
                        .map_err(storage::unavailable)?;
                }
                Err(_) if target.exists() => {}
                Err(e) => return Err(storage::unavailable(e)),
            }
        }
        let target = storage::directory(&target)?;
        let mut directories = std::collections::BTreeSet::new();
        for name in bundle.files.keys() {
            let mut parent = Path::new(name).parent();
            while let Some(path) = parent.filter(|p| !p.as_os_str().is_empty()) {
                directories.insert(path.to_owned());
                parent = path.parent();
            }
        }
        let mut pending = vec![target.clone()];
        let mut actual = 0usize;
        while let Some(dir) = pending.pop() {
            for entry in std::fs::read_dir(&dir).map_err(storage::unavailable)? {
                let entry = entry.map_err(storage::unavailable)?;
                let path = entry.path();
                let meta = std::fs::symlink_metadata(&path).map_err(storage::unavailable)?;
                if meta.is_dir() {
                    if !directories
                        .contains(path.strip_prefix(&target).map_err(storage::unavailable)?)
                    {
                        return Err(HostError::Unavailable(
                            "unexpected artifact directory".into(),
                        ));
                    }
                    pending.push(path);
                    continue;
                }
                let relative = path
                    .strip_prefix(&target)
                    .map_err(storage::unavailable)?
                    .to_str()
                    .ok_or_else(|| HostError::Unavailable("non-UTF8 artifact path".into()))?;
                let text = bundle.files.get(relative).ok_or_else(|| {
                    HostError::Unavailable("unexpected artifact cache entry".into())
                })?;
                if storage::read(&path, 1024 * 1024)? != text.as_bytes() {
                    return Err(HostError::Unavailable(
                        "artifact materialization changed".into(),
                    ));
                }
                actual += 1;
            }
        }
        if actual != bundle.files.len() {
            return Err(HostError::Unavailable(
                "incomplete artifact materialization".into(),
            ));
        }
        Ok(target)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn bundle() -> ArtifactBundle {
        ArtifactBundle {
            schema_version: 1,
            files: [("pkg/main.py".into(), "print('ok')".into())].into(),
        }
    }
    #[test]
    fn concurrent_immutable_admission_reopen_and_cache_integrity_are_enforced() {
        let dir = tempfile::tempdir().unwrap();
        let store = ArtifactStore::open(dir.path()).unwrap();
        let tasks = (0..8)
            .map(|_| {
                let store = store.clone();
                std::thread::spawn(move || store.put(bundle()).unwrap().digest)
            })
            .collect::<Vec<_>>();
        let ids = tasks
            .into_iter()
            .map(|t| t.join().unwrap())
            .collect::<Vec<_>>();
        assert!(ids.iter().all(|v| v == &ids[0]));
        assert_eq!(store.list("", 20).unwrap().len(), 1);
        assert!(store.list(&ids[0], 20).unwrap().is_empty());
        let reopened = ArtifactStore::open(dir.path()).unwrap();
        assert_eq!(reopened.get(&ids[0]).unwrap().digest().unwrap(), ids[0]);
        let materialized = reopened.materialize(&bundle()).unwrap();
        assert_eq!(
            std::fs::read_to_string(materialized.join("pkg/main.py")).unwrap(),
            "print('ok')"
        );
        std::fs::create_dir(materialized.join("undeclared")).unwrap();
        assert!(reopened.materialize(&bundle()).is_err());
        std::fs::remove_dir(materialized.join("undeclared")).unwrap();
        std::fs::write(materialized.join("extra"), "unexpected").unwrap();
        assert!(reopened.materialize(&bundle()).is_err());
        std::fs::write(store.object(&ids[0]), "{}").unwrap();
        assert!(store.get(&ids[0]).is_err());
        assert!(store.put(bundle()).is_err());
    }
    #[test]
    #[cfg(unix)]
    fn materialization_does_not_follow_symbolic_links() {
        let dir = tempfile::tempdir().unwrap();
        let store = ArtifactStore::open(dir.path()).unwrap();
        let hash = bundle().digest().unwrap();
        let target = store.trees.join(hash);
        std::fs::create_dir_all(target.join("pkg")).unwrap();
        let outside = dir.path().join("outside");
        std::fs::write(&outside, "print('ok')").unwrap();
        std::os::unix::fs::symlink(&outside, target.join("pkg/main.py")).unwrap();
        assert!(store.materialize(&bundle()).is_err());
        assert_eq!(std::fs::read_to_string(outside).unwrap(), "print('ok')");
    }
}
