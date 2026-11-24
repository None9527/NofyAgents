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
use zeroize::Zeroizing;
const MAX_BYTES: u64 = 1024 * 1024;
#[derive(Clone)]
pub struct FileCredentials {
    path: Arc<PathBuf>,
    identity: String,
    fallback: Option<Arc<dyn CredentialProvider>>,
}
struct SecretValue(Zeroizing<String>);
impl SecretValue {
    fn new(value: String) -> Self {
        Self(Zeroizing::new(value))
    }
    fn as_str(&self) -> &str {
        self.0.as_str()
    }
    fn into_zeroizing(self) -> Zeroizing<String> {
        self.0
    }
}
impl Serialize for SecretValue {
    fn serialize<S: serde::Serializer>(
        &self,
        serializer: S,
    ) -> std::result::Result<S::Ok, S::Error> {
        serializer.serialize_str(self.0.as_str())
    }
}
impl<'de> Deserialize<'de> for SecretValue {
    fn deserialize<D: serde::Deserializer<'de>>(
        deserializer: D,
    ) -> std::result::Result<Self, D::Error> {
        String::deserialize(deserializer).map(Self::new)
    }
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
    value: Option<SecretValue>,
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
fn value_valid_str(value: Option<&str>) -> bool {
    value.is_none_or(|v| !v.trim().is_empty() && v.len() <= 16384)
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
    fn lock_file(&self, exclusive: bool) -> Result<File> {
        let mut name = self.path.as_os_str().to_owned();
        name.push(".lock");
        let lock_path = PathBuf::from(name);
        let mut options = OpenOptions::new();
        options.read(true).write(true).create(true);
        #[cfg(unix)]
        {
            use std::os::unix::fs::OpenOptionsExt;
            options.mode(0o600);
        }
        let file =
            nofy_host_path::open_no_follow(&options, &lock_path).map_err(|_| unavailable())?;
        if !file.metadata().map_err(|_| unavailable())?.is_file() {
            return Err(unavailable());
        }
        let start = Instant::now();
        loop {
            let result = if exclusive {
                fs2::FileExt::try_lock_exclusive(&file)
            } else {
                fs2::FileExt::try_lock_shared(&file)
            };
            match result {
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
    fn lock_exclusive(&self) -> Result<File> {
        self.lock_file(true)
    }
    fn lock_shared(&self) -> Result<File> {
        self.lock_file(false)
    }
    fn read(&self) -> Result<Data> {
        let mut data = Data {
            schema_version: 1,
            authority: self.identity.clone(),
            revision: 0,
            entries: Default::default(),
        };
        let mut options = OpenOptions::new();
        options.read(true);
        let file = match nofy_host_path::open_no_follow(&options, &self.path) {
            Ok(file) => file,
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(data),
            Err(_) => return Err(unavailable()),
        };
        let metadata = file.metadata().map_err(|_| unavailable())?;
        if !metadata.is_file() || metadata.len() > MAX_BYTES {
            return Err(unavailable());
        }
        // Owner-only, verified directly on the opened handle on Unix and by ACL on
        // Windows. A store that others can open is not trusted with secrets.
        nofy_private_fs::verify_private_open_file(&file, &self.path).map_err(|_| unavailable())?;
        let mut bytes = Zeroizing::new(Vec::new());
        file.take(MAX_BYTES + 1)
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
                    || !value_valid_str(entry.value.as_ref().map(SecretValue::as_str))
                    || entry.revision == 0
                    || entry.revision > data.revision
            })
        {
            return Err(unavailable());
        }
        Ok(data)
    }
    fn write(&self, data: &Data) -> Result<()> {
        let bytes = Zeroizing::new(serde_json::to_vec(data).map_err(|_| unavailable())?);
        if bytes.len() > MAX_BYTES as usize {
            return Err(HostError::Invalid(
                "credential store capacity exceeded".into(),
            ));
        }
        let parent = self.path.parent().ok_or_else(unavailable)?;
        // Verify parent directory ownership and privacy on all platforms before
        // creating temporary files or replacing the credential store.
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
            let _held = store.lock_shared()?;
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
        let value = value.map(SecretValue::new);
        reference(name)?;
        if !value_valid_str(value.as_ref().map(SecretValue::as_str)) {
            return Err(HostError::Invalid(
                "credential value requires 1..=16384 bytes".into(),
            ));
        }
        let store = self.clone();
        let name = name.to_owned();
        tokio::task::spawn_blocking(move || {
            let _held = store.lock_exclusive()?;
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
    async fn local(&self, name: &str) -> Result<Option<Option<Zeroizing<String>>>> {
        reference(name)?;
        let store = self.clone();
        let name = name.to_owned();
        tokio::task::spawn_blocking(move || {
            let _held = store.lock_shared()?;
            let mut data = store.read()?;
            Ok(data
                .entries
                .remove(&name)
                .map(|e| e.value.map(SecretValue::into_zeroizing)))
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
            Some(value) => Ok(value.map(|mut secret| std::mem::take(&mut *secret))),
            None => match &self.fallback {
                Some(fallback) => fallback.resolve(name).await,
                None => Ok(None),
            },
        }
    }
}
