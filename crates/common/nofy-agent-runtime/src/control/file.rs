//! Explicit file-backed configuration catalog. This does not replace the
//! execution store or grant exactly-once semantics to external side effects.
use super::*;
use std::{
    fs::{File, OpenOptions},
    io::{Read, Write},
    path::{Path, PathBuf},
    time::{Duration, Instant},
};
#[derive(Clone)]
pub struct FileCatalogStore {
    path: Arc<PathBuf>,
    admission: Option<Arc<dyn crate::admission::CommitAdmission>>,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Envelope {
    version: u32,
    checksum: String,
    view: CatalogView,
}
fn storage(error: impl std::fmt::Display) -> ControlError {
    ControlError::Storage(error.to_string())
}
impl FileCatalogStore {
    pub fn open(path: impl AsRef<Path>) -> Result<Self> {
        Self::open_inner(path.as_ref(), None)
    }
    pub fn open_with_admission(
        path: impl AsRef<Path>,
        admission: Arc<dyn crate::admission::CommitAdmission>,
    ) -> Result<Self> {
        Self::open_inner(path.as_ref(), Some(admission))
    }
    fn open_inner(
        path: &Path,
        admission: Option<Arc<dyn crate::admission::CommitAdmission>>,
    ) -> Result<Self> {
        crate::admission::marker::check(path, admission.as_deref())?;
        if !path.is_absolute() || path.file_name().is_none() {
            return Err(ControlError::Invalid(
                "catalog requires an absolute file path".into(),
            ));
        }
        let parent = path
            .parent()
            .ok_or_else(|| ControlError::Invalid("catalog parent missing".into()))?;
        std::fs::create_dir_all(parent).map_err(storage)?;
        let store = Self {
            path: Arc::new(path.to_owned()),
            admission,
        };
        let _permit = store.admission.as_ref().map(|p| p.enter()).transpose()?;
        let _lock = store.lock()?;
        crate::admission::marker::check(path, store.admission.as_deref())?;
        if let Some(policy) = &store.admission {
            crate::admission::marker::install(path, policy.as_ref())?;
        }
        Ok(store)
    }
    pub fn path(&self) -> &Path {
        &self.path
    }
    fn lock(&self) -> Result<File> {
        let mut name = self.path.as_os_str().to_owned();
        name.push(".lock");
        let mut options = OpenOptions::new();
        options.read(true).write(true).create(true);
        #[cfg(unix)]
        {
            use std::os::unix::fs::OpenOptionsExt;
            options.mode(0o600);
        }
        let lock = options.open(PathBuf::from(name)).map_err(storage)?;
        let start = Instant::now();
        loop {
            match fs2::FileExt::try_lock_exclusive(&lock) {
                Ok(()) => return Ok(lock),
                Err(e) if nofy_durable_fs::lock_contended(&e) => {
                    if start.elapsed() > Duration::from_secs(2) {
                        return Err(ControlError::Busy);
                    }
                    std::thread::sleep(Duration::from_millis(5));
                }
                Err(e) => return Err(storage(e)),
            }
        }
    }
    fn read(&self) -> Result<Option<CatalogView>> {
        let file = match File::open(&*self.path) {
            Ok(file) => file,
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => return Ok(None),
            Err(e) => return Err(storage(e)),
        };
        let mut bytes = Vec::new();
        file.take(64 * 1024 * 1024 + 1)
            .read_to_end(&mut bytes)
            .map_err(storage)?;
        if bytes.len() > 64 * 1024 * 1024 {
            return Err(ControlError::Invalid("catalog file exceeds 64 MiB".into()));
        }
        let envelope: Envelope = serde_json::from_slice(&bytes).map_err(storage)?;
        if envelope.version != 1
            || envelope.view.revision == 0
            || digest(&envelope.view)? != envelope.checksum
        {
            return Err(ControlError::Invalid(
                "catalog version/checksum changed".into(),
            ));
        }
        envelope.view.data.validate()?;
        Ok(Some(envelope.view))
    }
    fn write(&self, view: &CatalogView) -> Result<()> {
        let envelope = Envelope {
            version: 1,
            checksum: digest(view)?,
            view: view.clone(),
        };
        let bytes = serde_json::to_vec(&envelope).map_err(storage)?;
        if bytes.len() > 64 * 1024 * 1024 {
            return Err(ControlError::Invalid("catalog file exceeds 64 MiB".into()));
        }
        let parent = self.path.parent().expect("validated catalog parent");
        let temporary = parent.join(format!(
            ".nofy-catalog-{}.tmp",
            nofy_tool_protocol::ToolCallId::new_v7()
        ));
        #[cfg(test)]
        let temporary = cleanup_tests::temporary_path(temporary);
        let mut created = false;
        let result = (|| {
            let mut options = OpenOptions::new();
            options.write(true).create_new(true);
            #[cfg(unix)]
            {
                use std::os::unix::fs::OpenOptionsExt;
                options.mode(0o600);
            }
            let mut file = options.open(&temporary).map_err(storage)?;
            created = true;
            file.write_all(&bytes).map_err(storage)?;
            file.sync_all().map_err(storage)?;
            // A failure to replace means nothing committed; a failure to make the
            // replacement durable means it may have.
            nofy_durable_fs::replace_file(&temporary, &self.path).map_err(storage)?;
            nofy_durable_fs::sync_directory(parent)
                .map_err(|e| ControlError::CommitUncertain(e.to_string()))?;
            Ok(())
        })();
        #[cfg(test)]
        cleanup_tests::before_cleanup(&temporary);
        if created && temporary.exists() {
            let _ = std::fs::remove_file(&temporary);
        }
        result
    }
}
#[async_trait::async_trait]
impl CatalogStore for FileCatalogStore {
    fn is_durable(&self) -> bool {
        true
    }
    async fn load(&self) -> Result<Option<CatalogView>> {
        let store = self.clone();
        tokio::task::spawn_blocking(move || {
            let _guard = store.lock()?;
            store.read()
        })
        .await
        .map_err(storage)?
    }
    async fn compare_exchange(
        &self,
        expected: Option<u64>,
        data: CatalogData,
    ) -> Result<CatalogView> {
        data.validate()?;
        let store = self.clone();
        tokio::task::spawn_blocking(move || {
            let permit = store.admission.as_ref().map(|p| p.enter()).transpose()?;
            let _guard = store.lock()?;
            crate::admission::marker::check(&store.path, store.admission.as_deref())?;
            let old = store.read()?;
            let actual = old.as_ref().map(|v| v.revision);
            if actual != expected {
                return Err(ControlError::Conflict { expected, actual });
            }
            if let Some(permit) = &permit {
                let old_data = old.as_ref().map(|v| &v.data);
                for (id, publication) in &data.publications {
                    if old_data.is_none_or(|d| !d.publications.contains_key(id)) {
                        let modules = &publication.bundle.document.modules;
                        permit.validate("publication", &modules.iter().collect::<Vec<_>>())?;
                        for program in publication.bundle.document.programs.values() {
                            if let crate::system::ProgramDefinition::Workflow { document, .. } =
                                program
                            {
                                permit.validate(
                                    "publication",
                                    &document.modules.iter().collect::<Vec<_>>(),
                                )?;
                            }
                        }
                    }
                }
                for (id, draft) in &data.drafts {
                    let changed = match old_data.and_then(|d| d.drafts.get(id)) {
                        None => true,
                        Some(previous) => {
                            previous.revision != draft.revision
                                || digest(&previous.document)? != digest(&draft.document)?
                        }
                    };
                    if changed {
                        permit.validate(
                            "draft",
                            &draft.document.modules.iter().collect::<Vec<_>>(),
                        )?;
                        for program in draft.document.programs.values() {
                            if let crate::system::ProgramDefinition::Workflow { document, .. } =
                                program
                            {
                                permit.validate(
                                    "draft",
                                    &document.modules.iter().collect::<Vec<_>>(),
                                )?;
                            }
                        }
                    }
                }
            }
            let revision = actual
                .unwrap_or(0)
                .checked_add(1)
                .ok_or_else(|| ControlError::Invalid("catalog revision exhausted".into()))?;
            let view = CatalogView { revision, data };
            store.write(&view)?;
            Ok(view)
        })
        .await
        .map_err(storage)?
    }
}

#[cfg(test)]
mod cleanup_tests;
