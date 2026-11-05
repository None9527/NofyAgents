use super::*;
impl ProjectStore {
    pub(super) fn deleted(&self, id: &str) -> Result<Option<ProjectView>> {
        safe_id(id)?;
        let path = self.root.join("deleted").join(format!("{id}.json"));
        plain(&path)?;
        let bytes = match std::fs::read(path) {
            Ok(v) => v,
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(None),
            Err(e) => return Err(e.into()),
        };
        let view: ProjectView = serde_json::from_slice(&bytes)?;
        if view.project_id != id
            || view.source.digest()? != view.source_digest
            || view.revision.parse::<u64>().is_err()
        {
            return Err(Error::new(
                "local_io",
                "deleted project record failed integrity verification",
            ));
        }
        Ok(Some(view))
    }
    pub fn delete(&self, id: &str, expected_revision: &str) -> Result<Value> {
        let _lock = self.lock(id)?;
        let view = match self.read(id)? {
            Some(view) => view,
            None => self
                .deleted(id)?
                .ok_or_else(|| Error::new("not_found", "project not found"))?,
        };
        if view.revision != expected_revision {
            return Err(Error::new("conflict", "project revision changed"));
        }
        let directory = self.root.join("deleted");
        std::fs::create_dir_all(&directory)?;
        if directory.symlink_metadata()?.file_type().is_symlink() {
            return Err(Error::new(
                "local_io",
                "deleted project directory is a symlink",
            ));
        }
        atomic(
            &directory.join(format!("{id}.json")),
            &serde_json::to_vec(&view)?,
        )?;
        let path = self.root.join(format!("{id}.json"));
        plain(&path)?;
        match std::fs::remove_file(path) {
            Ok(()) => {}
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => {}
            Err(e) => return Err(e.into()),
        }
        std::fs::File::open(self.root.as_ref())?.sync_all()?;
        Ok(
            json!({"project_id":id,"revision":view.revision,"source_digest":view.source_digest,"deleted":true}),
        )
    }
}
