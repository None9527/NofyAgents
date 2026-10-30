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
        if !cfg!(unix) {
            return Err(ControlError::Invalid("file catalog requires Unix atomic rename and directory fsync; use another CatalogStore on this platform".into()));
        }
        let path = path.as_ref();
        if !path.is_absolute() || path.file_name().is_none() {
            return Err(ControlError::Invalid(
                "catalog requires an absolute file path".into(),
            ));
        }
        let parent = path
            .parent()
            .ok_or_else(|| ControlError::Invalid("catalog parent missing".into()))?;
        std::fs::create_dir_all(parent).map_err(storage)?;
        Ok(Self {
            path: Arc::new(path.to_owned()),
        })
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
                Err(e) if e.kind() == std::io::ErrorKind::WouldBlock => {
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
        let result = (|| {
            let mut options = OpenOptions::new();
            options.write(true).create_new(true);
            #[cfg(unix)]
            {
                use std::os::unix::fs::OpenOptionsExt;
                options.mode(0o600);
            }
            let mut file = options.open(&temporary).map_err(storage)?;
            file.write_all(&bytes).map_err(storage)?;
            file.sync_all().map_err(storage)?;
            std::fs::rename(&temporary, &*self.path).map_err(storage)?;
            File::open(parent)
                .and_then(|file| file.sync_all())
                .map_err(|e| ControlError::CommitUncertain(e.to_string()))?;
            Ok(())
        })();
        if temporary.exists() {
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
            let _guard = store.lock()?;
            let old = store.read()?;
            let actual = old.as_ref().map(|v| v.revision);
            if actual != expected {
                return Err(ControlError::Conflict { expected, actual });
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
