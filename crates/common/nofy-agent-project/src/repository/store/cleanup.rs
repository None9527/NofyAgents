use super::*;
impl ModuleStore {
    pub fn set_yanked(
        &self,
        repository: &str,
        name: &str,
        version: &str,
        revision: &str,
        yanked: bool,
    ) -> Result<Value> {
        let coordinate = key(repository, name, version)?;
        let _guard = self.lock()?;
        let mut catalog = self.read()?;
        expected(catalog.repositories.get(repository), Some(revision))?;
        let package = catalog
            .packages
            .get_mut(&coordinate)
            .ok_or_else(|| Error::new("not_found", "module version not found"))?;
        if package.yanked != yanked {
            package.yanked = yanked;
            catalog
                .repositories
                .get_mut(repository)
                .expect("checked repository")
                .revision = increment(revision)?;
            self.write(&catalog)?;
        }
        Ok(
            json!({"repository":catalog.repositories[repository],"package":catalog.packages[&coordinate]}),
        )
    }
    /// Reclaim interrupted/unreferenced uploads only. Published identities,
    /// including yanked versions and external digest pins, retain their bytes.
    pub fn garbage_collect(&self, dry_run: bool) -> Result<Value> {
        let _guard = self.lock()?;
        let catalog = self.read()?;
        let retained = catalog
            .packages
            .values()
            .map(|p| p.digest.as_str())
            .collect::<std::collections::BTreeSet<_>>();
        let mut candidates = vec![];
        let mut bytes = 0u64;
        for entry in std::fs::read_dir(self.root.join("packages"))? {
            let entry = entry?;
            let path = entry.path();
            if path.extension().and_then(|s| s.to_str()) != Some("json") {
                continue;
            }
            let Some(digest) = path.file_stem().and_then(|s| s.to_str()) else {
                continue;
            };
            crate::repository::compose::check_digest(digest)?;
            plain(&path)?;
            if retained.contains(digest) {
                continue;
            }
            self.blob(digest)?;
            bytes = bytes.saturating_add(path.metadata()?.len());
            candidates.push(digest.to_owned());
        }
        candidates.sort();
        if !dry_run {
            for digest in &candidates {
                std::fs::remove_file(self.blob_path(digest)?)?;
            }
            sync_directory(&self.root.join("packages"))?;
        }
        Ok(
            json!({"dry_run":dry_run,"digests":candidates,"bytes":bytes,"published_versions_retained":retained.len()}),
        )
    }
}
