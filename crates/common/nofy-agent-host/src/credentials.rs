//! Private live credentials are independent of portable system documents.
//! Reads never return values through management DTOs or parsing diagnostics.
use crate::{HostError, Result};
use nofy_agent_runtime::control::ControlError;
use nofy_agent_runtime::credentials::CredentialProvider;
use serde::{Deserialize, Serialize};
use std::{
    collections::BTreeMap,
    fs::{File, OpenOptions},
    io::{Read, Write},
    path::{Path, PathBuf},
    sync::Arc,
    time::{Duration, Instant},
};
const MAX_BYTES: u64 = 1024 * 1024;
#[derive(Clone)]
pub struct FileCredentials {
    path: Arc<PathBuf>,
    identity: String,
    fallback: Option<Arc<dyn CredentialProvider>>,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Data {
    schema_version: u32,
    authority: String,
    revision: u64,
    entries: BTreeMap<String, Entry>,
}
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Entry {
    revision: u64,
    value: Option<String>,
}
#[derive(Clone, Debug, Serialize)]
pub struct CredentialMetadata {
    pub revision: u64,
    pub available: bool,
}
#[derive(Clone, Debug, Serialize)]
pub struct CredentialView {
    pub revision: u64,
    pub entries: BTreeMap<String, CredentialMetadata>,
}
fn unavailable() -> HostError {
    HostError::Unavailable("credential store unavailable or invalid".into())
}
fn reference(value: &str) -> Result<()> {
    if value.is_empty()
        || value.len() > 128
        || !value
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b == b'_')
    {
        return Err(HostError::Invalid(
            "credential reference requires 1..=128 ASCII letters, digits or underscores".into(),
        ));
    }
    Ok(())
}
fn value_valid(value: &Option<String>) -> bool {
    value
        .as_ref()
        .is_none_or(|v| !v.trim().is_empty() && v.len() <= 16384)
}
impl FileCredentials {
    /// Construction validates names only. Preparing a module does not create
    /// a secret file, lock, or resolve fallback credentials.
    pub fn open(
        path: impl AsRef<Path>,
        authority: &str,
        fallback: Option<Arc<dyn CredentialProvider>>,
    ) -> Result<Self> {
        let path = path.as_ref();
        if !path.is_absolute()
            || path.file_name().is_none()
            || authority.trim().is_empty()
            || authority.len() > 1024
        {
            return Err(HostError::Invalid(
                "credentials require an absolute file path and logical authority".into(),
            ));
        }
        let identity = format!("credentials-v1:{authority}");
        if fallback.as_ref().is_some_and(|f| f.identity() != identity) {
            return Err(HostError::Invalid(
                "fallback credential authority differs".into(),
            ));
        }
        Ok(Self {
            path: Arc::new(path.to_owned()),
            identity,
            fallback,
        })
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
        let file = options
            .open(PathBuf::from(name))
            .map_err(|_| unavailable())?;
        let start = Instant::now();
        loop {
            match fs2::FileExt::try_lock_exclusive(&file) {
                Ok(()) => return Ok(file),
                Err(error)
                    if nofy_durable_fs::lock_contended(&error)
                        && start.elapsed() < Duration::from_secs(2) =>
                {
                    std::thread::sleep(Duration::from_millis(5))
                }
                Err(_) => return Err(unavailable()),
            }
        }
    }
    fn read(&self) -> Result<Data> {
        let mut data = Data {
            schema_version: 1,
            authority: self.identity.clone(),
            revision: 0,
            entries: Default::default(),
        };
        let metadata = match std::fs::symlink_metadata(&*self.path) {
            Ok(metadata) => metadata,
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(data),
            Err(_) => return Err(unavailable()),
        };
        if !metadata.is_file() || metadata.len() > MAX_BYTES {
            return Err(unavailable());
        }
        // Owner-only, by mode on Unix and by access list on Windows. A store that
        // others can open is not trusted with secrets.
        nofy_private_fs::verify_private_file(&self.path).map_err(|_| unavailable())?;
        let mut bytes = Vec::new();
        File::open(&*self.path)
            .map_err(|_| unavailable())?
            .take(MAX_BYTES + 1)
            .read_to_end(&mut bytes)
            .map_err(|_| unavailable())?;
        if bytes.len() > MAX_BYTES as usize {
            return Err(unavailable());
        }
        data = serde_json::from_slice(&bytes).map_err(|_| unavailable())?;
        if data.schema_version != 1
            || data.authority != self.identity
            || data.entries.len() > 1024
            || data.revision == 0
            || data.entries.iter().any(|(name, entry)| {
                reference(name).is_err()
                    || !value_valid(&entry.value)
                    || entry.revision == 0
                    || entry.revision > data.revision
            })
        {
            return Err(unavailable());
        }
        Ok(data)
    }
    fn write(&self, data: &Data) -> Result<()> {
        let bytes = serde_json::to_vec(data).map_err(|_| unavailable())?;
        if bytes.len() > MAX_BYTES as usize {
            return Err(HostError::Invalid(
                "credential store capacity exceeded".into(),
            ));
        }
        let parent = self.path.parent().ok_or_else(unavailable)?;
        // Unix creates the file `0600` itself. On Windows a new file is exactly as
        // private as the directory it is created in, so the directory is checked
        // rather than trusted.
        #[cfg(windows)]
        nofy_private_fs::verify_private_dir(parent).map_err(|_| {
            HostError::Unavailable(
                "the credential store's directory is not private to the current user".into(),
            )
        })?;
        let mut temp = tempfile::NamedTempFile::new_in(parent).map_err(|_| unavailable())?;
        temp.write_all(&bytes).map_err(|_| unavailable())?;
        temp.as_file().sync_all().map_err(|_| unavailable())?;
        nofy_durable_fs::persist_file(temp, &self.path).map_err(|_| unavailable())?;
        nofy_durable_fs::sync_directory(parent).map_err(|_| {
            HostError::Control(ControlError::CommitUncertain(
                "credential update may have committed; read metadata before retrying".into(),
            ))
        })?;
        Ok(())
    }
    pub async fn inspect(&self) -> Result<CredentialView> {
        let store = self.clone();
        tokio::task::spawn_blocking(move || {
            let _held = store.lock()?;
            let data = store.read()?;
            Ok(CredentialView {
                revision: data.revision,
                entries: data
                    .entries
                    .into_iter()
                    .map(|(name, e)| {
                        (
                            name,
                            CredentialMetadata {
                                revision: e.revision,
                                available: e.value.is_some(),
                            },
                        )
                    })
                    .collect(),
            })
        })
        .await
        .map_err(|_| unavailable())?
    }
    /// None writes an explicit tombstone and suppresses bootstrap fallback.
    /// Revisions are global monotonic values, so deletion cannot create ABA.
    pub async fn set(
        &self,
        name: &str,
        expected: Option<u64>,
        value: Option<String>,
    ) -> Result<CredentialMetadata> {
        reference(name)?;
        if !value_valid(&value) {
            return Err(HostError::Invalid(
                "credential value requires 1..=16384 bytes".into(),
            ));
        }
        let store = self.clone();
        let name = name.to_owned();
        tokio::task::spawn_blocking(move || {
            let _held = store.lock()?;
            let mut data = store.read()?;
            let actual = data.entries.get(&name).map(|e| e.revision);
            if actual != expected {
                return Err(HostError::Control(ControlError::Conflict {
                    expected,
                    actual,
                }));
            }
            if actual.is_none() && data.entries.len() >= 1024 {
                return Err(HostError::Invalid(
                    "credential entry capacity exceeded".into(),
                ));
            }
            let revision = data.revision.checked_add(1).ok_or_else(unavailable)?;
            let metadata = CredentialMetadata {
                revision,
                available: value.is_some(),
            };
            data.revision = revision;
            data.entries.insert(name, Entry { revision, value });
            store.write(&data)?;
            Ok(metadata)
        })
        .await
        .map_err(|_| unavailable())?
    }
    async fn local(&self, name: &str) -> Result<Option<Option<String>>> {
        reference(name)?;
        let store = self.clone();
        let name = name.to_owned();
        tokio::task::spawn_blocking(move || {
            let _held = store.lock()?;
            let mut data = store.read()?;
            Ok(data.entries.remove(&name).map(|e| e.value))
        })
        .await
        .map_err(|_| unavailable())?
    }
}
#[async_trait::async_trait]
impl CredentialProvider for FileCredentials {
    fn identity(&self) -> &str {
        &self.identity
    }
    async fn resolve(
        &self,
        name: &str,
    ) -> std::result::Result<Option<String>, nofy_agent_runtime::Error> {
        let local =
            self.local(name)
                .await
                .map_err(|_| nofy_agent_runtime::model::ModelFailure {
                    category: "configuration".into(),
                    message: "credential store unavailable or invalid".into(),
                    status: None,
                    retryable: false,
                    retry_after_ms: None,
                    code: Some("credential_store_unavailable".into()),
                    details: serde_json::Value::Null,
                })?;
        match local {
            Some(value) => Ok(value),
            None => match &self.fallback {
                Some(fallback) => fallback.resolve(name).await,
                None => Ok(None),
            },
        }
    }
}
