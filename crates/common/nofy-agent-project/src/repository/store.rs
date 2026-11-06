use super::*;
mod cleanup;
use crate::*;
use fs2::FileExt;
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    io::Write,
    path::{Path, PathBuf},
    sync::Arc,
};

#[derive(Default, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Catalog {
    repositories: BTreeMap<String, RepositoryView>,
    packages: BTreeMap<String, PackageView>,
    #[serde(default)]
    removed_revisions: BTreeMap<String, String>,
}
#[derive(Clone)]
pub struct ModuleStore {
    root: Arc<PathBuf>,
}
fn key(repository: &str, name: &str, version: &str) -> Result<String> {
    for s in [repository, name, version] {
        safe_id(s)?;
    }
    Ok(format!("{repository}/{name}@{version}"))
}
fn plain(path: &Path) -> Result<()> {
    if let Ok(m) = path.symlink_metadata()
        && (!m.is_file() || m.file_type().is_symlink())
    {
        return Err(Error::new(
            "local_io",
            "module store entry is not a regular file",
        ));
    }
    Ok(())
}
fn atomic(path: &Path, value: &impl Serialize) -> Result<()> {
    let parent = path
        .parent()
        .ok_or_else(|| Error::new("local_io", "store parent missing"))?;
    let mut temp = tempfile::NamedTempFile::new_in(parent)?;
    temp.write_all(&serde_json::to_vec(value)?)?;
    temp.as_file().sync_all()?;
    temp.persist(path).map_err(|e| e.error)?;
    sync_directory(parent)?;
    Ok(())
}
fn increment(revision: &str) -> Result<String> {
    revision
        .parse::<u64>()
        .ok()
        .and_then(|v| v.checked_add(1))
        .map(|v| v.to_string())
        .ok_or_else(|| Error::new("conflict", "repository revision exhausted"))
}
fn expected(view: Option<&RepositoryView>, revision: Option<&str>) -> Result<()> {
    if view.map(|v| v.revision.as_str()) != revision {
        return Err(Error::new("conflict", "repository revision changed"));
    }
    Ok(())
}
impl ModuleStore {
    pub fn open(root: &Path) -> Result<Self> {
        if !root.is_absolute() {
            return Err(Error::new(
                "local_input",
                "module store path must be absolute",
            ));
        }
        std::fs::create_dir_all(root)?;
        if root.symlink_metadata()?.file_type().is_symlink() {
            return Err(Error::new("local_io", "module store is a symlink"));
        }
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            std::fs::set_permissions(root, std::fs::Permissions::from_mode(0o700))?;
        }
        let blobs = root.join("packages");
        std::fs::create_dir_all(&blobs)?;
        if blobs.symlink_metadata()?.file_type().is_symlink() {
            return Err(Error::new(
                "local_io",
                "module package directory is a symlink",
            ));
        }
        Ok(Self {
            root: Arc::new(root.into()),
        })
    }
    pub fn root(&self) -> &Path {
        &self.root
    }
    fn lock(&self) -> Result<std::fs::File> {
        let path = self.root.join("catalog.lock");
        plain(&path)?;
        let mut options = std::fs::OpenOptions::new();
        options.read(true).write(true).create(true).truncate(false);
        #[cfg(unix)]
        {
            use std::os::unix::fs::OpenOptionsExt;
            options.mode(0o600).custom_flags(libc::O_NOFOLLOW);
        }
        let f = options.open(path)?;
        f.lock_exclusive()?;
        Ok(f)
    }
    fn read(&self) -> Result<Catalog> {
        let path = self.root.join("catalog.json");
        plain(&path)?;
        match std::fs::read(path) {
            Ok(bytes) => serde_json::from_slice(&bytes)
                .map_err(|_| Error::new("local_io", "invalid module catalog")),
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(Catalog::default()),
            Err(e) => Err(e.into()),
        }
    }
    fn write(&self, catalog: &Catalog) -> Result<()> {
        atomic(&self.root.join("catalog.json"), catalog)
    }
    fn blob_path(&self, digest: &str) -> Result<PathBuf> {
        super::compose::check_digest(digest)?;
        let path = self.root.join("packages").join(format!("{digest}.json"));
        plain(&path)?;
        Ok(path)
    }
    fn blob(&self, digest: &str) -> Result<Source> {
        let bytes = std::fs::read(self.blob_path(digest)?).map_err(|e| {
            if e.kind() == std::io::ErrorKind::NotFound {
                Error::new("not_found", "module package source is not cached")
            } else {
                e.into()
            }
        })?;
        let source: Source = serde_json::from_slice(&bytes)
            .map_err(|_| Error::new("local_io", "invalid cached package source"))?;
        if source.digest()? != digest {
            return Err(Error::new("local_io", "cached package digest mismatch"));
        }
        Ok(source)
    }
    fn put_blob(&self, source: &Source, digest: &str) -> Result<()> {
        let path = self.blob_path(digest)?;
        if path.exists() {
            self.blob(digest)?;
        } else {
            atomic(&path, source)?;
        }
        Ok(())
    }
    pub fn get(&self, repository: &str) -> Result<RepositoryView> {
        safe_id(repository)?;
        let _guard = self.lock()?;
        self.read()?
            .repositories
            .remove(repository)
            .ok_or_else(|| Error::new("not_found", "module repository not found"))
    }
    pub fn list(&self) -> Result<Vec<RepositoryView>> {
        let _guard = self.lock()?;
        Ok(self.read()?.repositories.into_values().collect())
    }
    pub fn put(
        &self,
        repository: &str,
        revision: Option<&str>,
        origin: RepositoryOrigin,
    ) -> Result<RepositoryView> {
        safe_id(repository)?;
        origin.validate()?;
        let _guard = self.lock()?;
        let mut catalog = self.read()?;
        let before = catalog.repositories.get(repository);
        expected(before, revision)?;
        if let Some(before) = before
            && before.origin == origin
        {
            return Ok(before.clone());
        }
        let view = RepositoryView {
            repository: repository.into(),
            revision: before
                .map(|v| v.revision.as_str())
                .or_else(|| {
                    catalog
                        .removed_revisions
                        .get(repository)
                        .map(String::as_str)
                })
                .map(increment)
                .transpose()?
                .unwrap_or_else(|| "0".into()),
            origin,
            source_revision: None,
            package_count: catalog
                .packages
                .values()
                .filter(|v| v.repository == repository)
                .count(),
        };
        catalog.repositories.insert(repository.into(), view.clone());
        self.write(&catalog)?;
        Ok(view)
    }
    pub fn remove(&self, repository: &str, revision: &str) -> Result<Value> {
        safe_id(repository)?;
        let _guard = self.lock()?;
        let mut catalog = self.read()?;
        expected(catalog.repositories.get(repository), Some(revision))?;
        catalog.repositories.remove(repository);
        catalog
            .removed_revisions
            .insert(repository.into(), revision.into());
        let retained = catalog
            .packages
            .values()
            .filter(|v| v.repository == repository)
            .count();
        self.write(&catalog)?;
        Ok(json!({"repository":repository,"removed":true,"retained_packages":retained}))
    }
    pub fn package(&self, repository: &str, name: &str, version: &str) -> Result<PackageView> {
        let key = key(repository, name, version)?;
        let _guard = self.lock()?;
        self.read()?
            .packages
            .remove(&key)
            .ok_or_else(|| Error::new("not_found", "module package version not found"))
    }
    pub fn packages(&self, repository: Option<&str>, after: &str, limit: usize) -> Result<Value> {
        if !(1..=256).contains(&limit) {
            return Err(Error::new(
                "local_input",
                "module page limit must be 1..256",
            ));
        }
        if let Some(r) = repository {
            safe_id(r)?;
        }
        let _guard = self.lock()?;
        let catalog = self.read()?;
        let page: Vec<_> = catalog
            .packages
            .iter()
            .filter(|(k, v)| k.as_str() > after && repository.is_none_or(|r| v.repository == r))
            .take(limit + 1)
            .collect();
        let next = if page.len() > limit {
            page.get(limit - 1).map(|(k, _)| (*k).clone())
        } else {
            None
        };
        Ok(
            json!({"packages":page.into_iter().take(limit).map(|(_,v)|v).collect::<Vec<_>>(),"next_cursor":next}),
        )
    }
    pub fn source(&self, digest: &str) -> Result<Source> {
        super::compose::check_digest(digest)?;
        let _guard = self.lock()?;
        if !self.read()?.packages.values().any(|p| p.digest == digest) {
            return Err(Error::new(
                "not_found",
                "published module package digest not found",
            ));
        }
        self.blob(digest)
    }
    pub fn publish(
        &self,
        repository: &str,
        revision: &str,
        source: Source,
    ) -> Result<(RepositoryView, PackageView)> {
        let view = self.get(repository)?;
        if view.origin != RepositoryOrigin::Managed {
            return Err(Error::new(
                "local_input",
                "publish uploads to managed repositories; external sources use sync",
            ));
        }
        let (repo, mut packages) =
            self.commit_packages(repository, revision, vec![source], None, true)?;
        Ok((repo, packages.remove(0)))
    }
    pub fn synchronize(
        &self,
        repository: &str,
        revision: &str,
        sources: Vec<Source>,
        source_revision: String,
    ) -> Result<(RepositoryView, Vec<PackageView>)> {
        self.commit_packages(repository, revision, sources, Some(source_revision), false)
    }
    fn commit_packages(
        &self,
        repository: &str,
        revision: &str,
        sources: Vec<Source>,
        source_revision: Option<String>,
        managed: bool,
    ) -> Result<(RepositoryView, Vec<PackageView>)> {
        safe_id(repository)?;
        let mut prepared = BTreeMap::new();
        for source in sources {
            let manifest = PackageManifest::from_source(&source)?;
            let digest = source.digest()?;
            let coordinate = key(repository, &manifest.name, &manifest.version)?;
            let view = PackageView {
                yanked: false,
                repository: repository.into(),
                name: manifest.name.clone(),
                version: manifest.version.clone(),
                digest,
                manifest,
                source_revision: source_revision.clone(),
            };
            if prepared.insert(coordinate, (view, source)).is_some() {
                return Err(Error::new(
                    "local_input",
                    "duplicate package version in repository snapshot",
                ));
            }
        }
        let _guard = self.lock()?;
        let mut catalog = self.read()?;
        expected(catalog.repositories.get(repository), Some(revision))?;
        let mut repo = catalog
            .repositories
            .get(repository)
            .cloned()
            .ok_or_else(|| Error::new("not_found", "module repository not found"))?;
        if managed != matches!(repo.origin, RepositoryOrigin::Managed) {
            return Err(Error::new(
                "local_input",
                "repository acquisition mode changed",
            ));
        }
        for (key, (view, _)) in &prepared {
            if catalog
                .packages
                .get(key)
                .is_some_and(|old| old.digest != view.digest)
            {
                let mut e = Error::new(
                    "conflict",
                    "published module versions are immutable; select a new version",
                );
                e.details = json!({"package":key,"existing_digest":catalog.packages[key].digest,"candidate_digest":view.digest});
                return Err(e);
            }
        }
        let mut changed = repo.source_revision != source_revision && !managed;
        let mut result = Vec::new();
        for (key, (view, source)) in prepared {
            self.put_blob(&source, &view.digest)?;
            if let Some(old) = catalog.packages.get(&key) {
                result.push(old.clone());
            } else {
                catalog.packages.insert(key, view.clone());
                result.push(view);
                changed = true;
            }
        }
        if changed {
            repo.revision = increment(&repo.revision)?;
            if !managed {
                repo.source_revision = source_revision;
            }
            repo.package_count = catalog
                .packages
                .values()
                .filter(|p| p.repository == repository)
                .count();
            catalog.repositories.insert(repository.into(), repo.clone());
            self.write(&catalog)?;
        }
        Ok((repo, result))
    }
    /// Materialize immutable sources in a caller-owned export/build copy only.
    pub fn hydrate(&self, source: &Source) -> Result<Source> {
        let mut out = source.clone();
        let imports = imports(source)?;
        if imports.is_empty() {
            return Ok(out);
        }
        for imported in imports.values() {
            let path = package_file(&imported.digest)?;
            if !out.files.contains_key(&path) {
                let package = self.source(&imported.digest)?;
                out.put_json(&path, &serde_json::to_value(package)?)?;
            }
        }
        out.refresh_manifest()?;
        Ok(out)
    }
}
