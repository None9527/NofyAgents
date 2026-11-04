//! One runtime history owner and its explicitly declared physical generations.
use super::{HostError, Result, storage};
use nofy_agent_runtime::{
    Error,
    durable::{
        SqliteStore,
        placement::{PlacementPermit, SqlitePlacement},
        transport::{RuntimeSnapshot, copy_snapshot, inspect_snapshot},
    },
    registry::*,
};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::{
    fs::File,
    path::{Component, Path, PathBuf},
    sync::Arc,
};
mod protection;
mod transfer;
pub(in crate::loader) use protection::check as check_protected;
pub(crate) use transfer::{Plan, Receipt};
#[cfg(test)]
mod tests;
const PROTOCOL: &str = "nofy.runtime-history/v1";
pub(crate) const FACTORY: &str = "resource.runtime_store";
fn invalid(message: &str) -> HostError {
    HostError::Invalid(message.into())
}
fn unavailable() -> HostError {
    HostError::Unavailable(
        "runtime history ownership unavailable; restore its original control metadata".into(),
    )
}
fn runtime_error(error: impl std::fmt::Display) -> Error {
    Error::Checkpoint(format!("runtime history: {error}"))
}
fn valid_id(s: &str) -> bool {
    !s.is_empty()
        && s.len() <= 128
        && s.bytes()
            .all(|b| b.is_ascii_alphanumeric() || b"._-".contains(&b))
}
fn digest(s: &str) -> bool {
    s.len() == 64
        && s.bytes()
            .all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
}
fn encoded<T: Serialize>(v: &T) -> Result<Vec<u8>> {
    serde_json::to_vec(v).map_err(storage::unavailable)
}
fn hash<T: Serialize>(v: &T) -> Result<String> {
    Ok(storage::hash(&encoded(v)?))
}
fn absolute(path: &Path) -> bool {
    path.is_absolute()
        && path
            .to_str()
            .is_some_and(|s| s.len() <= 4096 && !s.chars().any(char::is_control))
        && path.components().all(|c| {
            matches!(
                c,
                Component::RootDir | Component::Prefix(_) | Component::Normal(_)
            )
        })
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub(crate) struct BackendDefinition {
    pub id: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub directory: Option<PathBuf>,
}
impl BackendDefinition {
    pub(crate) fn parse(value: &Value) -> Result<Self> {
        let value: Self = serde_json::from_value(value.clone())
            .map_err(|_| invalid("invalid runtime store backend"))?;
        if !valid_id(&value.id)
            || value.id == "default" && value.directory.is_some()
            || value.id != "default" && value.directory.as_ref().is_none_or(|p| !absolute(p))
        {
            return Err(invalid(
                "runtime store needs default or a named absolute directory",
            ));
        }
        Ok(value)
    }
}
pub(crate) struct BackendFactory;
impl ModuleFactory for BackendFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: FACTORY.into(),
            revision: "1".into(),
            kind: ModuleKind::Resource,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["backend"],"properties":{"backend":{"type":"object","additionalProperties":false,"required":["id"],"properties":{"id":{"type":"string","minLength":1,"maxLength":128,"pattern":"^[A-Za-z0-9._-]+$"},"directory":{"type":"string","minLength":1}}}}}),
            input_schema: None,
            output_schema: None,
            required_capabilities: Default::default(),
            dependencies: Default::default(),
        }
    }
    fn build(
        &self,
        config: &Value,
        _: &std::collections::BTreeMap<String, ModuleInstance>,
    ) -> std::result::Result<ModuleInstance, Error> {
        if config.as_object().is_none_or(|m| m.len() != 1) {
            return Err(runtime_error("invalid runtime store definition"));
        }
        let backend = BackendDefinition::parse(
            config
                .get("backend")
                .ok_or_else(|| runtime_error("missing runtime store backend"))?,
        )
        .map_err(runtime_error)?;
        let identity = format!(
            "runtime-store-declaration/v1:{}",
            nofy_agent_runtime::system::content_digest(&backend)?
        );
        Ok(ModuleInstance::Resource(Arc::new(ResourceHandle::new(
            identity,
            Arc::new(backend),
        )?)))
    }
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
struct Authority {
    protocol: String,
    authority: String,
    identity: String,
    origin: PathBuf,
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
struct Binding {
    backend: BackendDefinition,
    generation: String,
    path: PathBuf,
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
struct Pointer {
    protocol: String,
    revision: u64,
    initialized: bool,
    active: Binding,
    pending: Option<String>,
    intent: Option<Value>,
    last_commit: Option<String>,
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub(crate) struct StorageView {
    pub protocol: String,
    pub revision: u64,
    pub identity_digest: String,
    pub backend: BackendDefinition,
    pub generation: String,
    pub writable: bool,
    pub preparing: Option<String>,
}
pub(crate) struct HistoryLease(File, u32);
impl Drop for HistoryLease {
    fn drop(&mut self) {
        storage::unlock_local(&self.0, self.1)
    }
}
#[derive(Clone)]
pub(crate) struct Control {
    root: PathBuf,
    host_root: PathBuf,
    authority: Authority,
}
impl Control {
    pub(crate) fn open(host_root: &Path, origin: &Path) -> Result<Self> {
        let root = storage::directory(&host_root.join("loader/runtime-history"))?;
        for name in ["data.lock", "execution.lock"] {
            storage::atomic(&root.join(name), b"", 0o600, false)?;
        }
        let authority_file = root.join("authority.json");
        let pointer = root.join("active.json");
        let initializing = !authority_file.try_exists().map_err(storage::unavailable)?
            || !pointer.try_exists().map_err(storage::unavailable)?;
        let _lease = Self::file_lease(&root.join("data.lock"), initializing)?;
        let authority = if authority_file.try_exists().map_err(storage::unavailable)? {
            serde_json::from_slice::<Authority>(&storage::read(&authority_file, 32768)?)
                .map_err(|_| unavailable())?
        } else {
            if pointer.try_exists().map_err(storage::unavailable)?
                || nofy_agent_runtime::durable::placement::managed(origin)?
            {
                return Err(unavailable());
            }
            let mode = nofy_sqlite_journal::JournalMode::for_db_path(origin);
            let effective = mode.effective_db_path(origin);
            let file = effective.file_name().ok_or_else(unavailable)?;
            let value = Authority {
                protocol: PROTOCOL.into(),
                authority: format!(
                    "nofy.kernel.history/{}",
                    storage::hash(
                        nofy_tool_protocol::ToolCallId::new_v7()
                            .to_string()
                            .as_bytes()
                    )
                ),
                identity: effective.to_string_lossy().into_owned(),
                origin: host_root.join(file),
            };
            storage::atomic(&authority_file, &encoded(&value)?, 0o600, false)?;
            value
        };
        if authority.protocol != PROTOCOL
            || authority.identity.is_empty()
            || authority.identity.len() > 16384
            || !absolute(&authority.origin)
            || !authority.authority.starts_with("nofy.kernel.history/")
            || !digest(
                authority
                    .authority
                    .trim_start_matches("nofy.kernel.history/"),
            )
        {
            return Err(unavailable());
        }
        let control = Self {
            root,
            host_root: host_root.into(),
            authority,
        };
        if !pointer.try_exists().map_err(storage::unavailable)? {
            // An authority without a pointer is repairable only before any
            // database was sealed. Never rediscover a retired original.
            if nofy_agent_runtime::durable::placement::managed(&control.authority.origin)? {
                return Err(unavailable());
            }
            let pointer = Pointer {
                protocol: PROTOCOL.into(),
                revision: 0,
                initialized: false,
                active: Binding {
                    backend: BackendDefinition {
                        id: "default".into(),
                        directory: None,
                    },
                    generation: "origin".into(),
                    path: control.authority.origin.clone(),
                },
                pending: None,
                intent: None,
                last_commit: None,
            };
            control.write_pointer(&pointer, false)?;
        }
        control.initialize_protection()?;
        control.pointer()?;
        Ok(control)
    }
    fn pointer(&self) -> Result<Pointer> {
        let pointer: Pointer =
            serde_json::from_slice(&storage::read(&self.root.join("active.json"), 65536)?)
                .map_err(|_| unavailable())?;
        if pointer.protocol != PROTOCOL
            || pointer.pending.is_some() != pointer.intent.is_some()
            || pointer.pending.as_ref().is_some_and(|s| !valid_id(s))
            || pointer.last_commit.as_ref().is_some_and(|s| !valid_id(s))
            || !absolute(&pointer.active.path)
            || pointer.active.generation != "origin" && !digest(&pointer.active.generation)
        {
            return Err(unavailable());
        }
        if !pointer.initialized
            && (pointer.revision != 0
                || pointer.active.generation != "origin"
                || pointer.pending.is_some()
                || pointer.last_commit.is_some())
        {
            return Err(unavailable());
        }
        BackendDefinition::parse(
            &serde_json::to_value(&pointer.active.backend).map_err(storage::unavailable)?,
        )?;
        if pointer.active.generation == "origin" {
            if pointer.active.path != self.authority.origin
                || pointer.active.backend.id != "default"
            {
                return Err(unavailable());
            }
        } else {
            self.validate_binding(&pointer.active)?;
        }
        Ok(pointer)
    }
    fn write_pointer(&self, pointer: &Pointer, replace: bool) -> Result<()> {
        storage::atomic(
            &self.root.join("active.json"),
            &encoded(pointer)?,
            0o600,
            replace,
        )
    }
    fn view_of(&self, p: &Pointer) -> StorageView {
        StorageView {
            protocol: PROTOCOL.into(),
            revision: p.revision,
            identity_digest: storage::hash(self.authority.identity.as_bytes()),
            backend: p.active.backend.clone(),
            generation: p.active.generation.clone(),
            writable: p.initialized && p.pending.is_none(),
            preparing: p.pending.clone(),
        }
    }
    pub(crate) fn view(&self) -> Result<StorageView> {
        Ok(self.view_of(&self.pointer()?))
    }
    pub(crate) fn initialize(&self) -> Result<()> {
        let _lease = self.data_lease(true)?;
        let mut pointer = self.pointer()?;
        if !pointer.initialized {
            if pointer.revision != 0
                || pointer.active.generation != "origin"
                || pointer.pending.is_some()
                || !pointer.active.path.is_file()
            {
                return Err(unavailable());
            }
            pointer.initialized = true;
            self.write_pointer(&pointer, true)?;
        }
        Ok(())
    }
    fn lease(&self, name: &str, exclusive: bool) -> Result<HistoryLease> {
        Self::file_lease(&self.root.join(name), exclusive)
    }
    fn file_lease(path: &Path, exclusive: bool) -> Result<HistoryLease> {
        let mut options = std::fs::OpenOptions::new();
        options.read(true).write(exclusive);
        #[cfg(target_os = "linux")]
        {
            use std::os::unix::fs::OpenOptionsExt;
            options.custom_flags(libc::O_NOFOLLOW | libc::O_CLOEXEC);
        }
        let file = options.open(path).map_err(storage::unavailable)?;
        if !file.metadata().map_err(storage::unavailable)?.is_file() {
            return Err(unavailable());
        }
        let result = if exclusive {
            fs2::FileExt::try_lock_exclusive(&file)
        } else {
            fs2::FileExt::try_lock_shared(&file)
        };
        result.map_err(|error| {
            if error.kind() == std::io::ErrorKind::WouldBlock {
                HostError::Control(nofy_agent_runtime::control::ControlError::Busy)
            } else {
                storage::unavailable(error)
            }
        })?;
        Ok(HistoryLease(file, std::process::id()))
    }
    fn data_lease(&self, exclusive: bool) -> Result<HistoryLease> {
        self.lease("data.lock", exclusive)
    }
    pub(crate) fn exclusive_execution(&self) -> Result<HistoryLease> {
        self.lease("execution.lock", true)
    }
    pub(crate) fn execution(&self) -> Result<Option<Arc<HistoryLease>>> {
        let lease = match self.lease("execution.lock", false) {
            Ok(v) => v,
            Err(HostError::Control(nofy_agent_runtime::control::ControlError::Busy)) => {
                return Ok(None);
            }
            Err(error) => return Err(error),
        };
        let pointer = self.pointer()?;
        if !pointer.initialized || pointer.pending.is_some() {
            return Ok(None);
        }
        Ok(Some(Arc::new(lease)))
    }
    fn backend_directory(&self, backend: &BackendDefinition) -> Result<PathBuf> {
        let directory = backend
            .directory
            .clone()
            .unwrap_or_else(|| self.host_root.join("runtime-data"));
        if !absolute(&directory) {
            return Err(invalid("runtime backend directory must be absolute"));
        }
        if directory.starts_with(self.host_root.join("loader"))
            || directory.starts_with(self.host_root.join("memory"))
        {
            return Err(invalid(
                "runtime history cannot be placed inside another owned state role",
            ));
        }
        Ok(directory)
    }
    fn binding(&self, backend: &BackendDefinition, generation: &str) -> Result<Binding> {
        if !digest(generation) {
            return Err(unavailable());
        }
        let directory = self
            .backend_directory(backend)?
            .join(".nofy-runtime-history")
            .join(storage::hash(self.authority.authority.as_bytes()))
            .join(generation);
        let path = nofy_sqlite_journal::JournalMode::for_db_path(&directory.join("runtime.sqlite"))
            .effective_db_path(&directory.join("runtime.sqlite"));
        Ok(Binding {
            backend: backend.clone(),
            generation: generation.into(),
            path,
        })
    }
    fn validate_binding(&self, binding: &Binding) -> Result<()> {
        let expected = self.binding(&binding.backend, &binding.generation)?;
        let name = binding
            .path
            .file_name()
            .and_then(|n| n.to_str())
            .ok_or_else(unavailable)?;
        if binding.path.parent() != expected.path.parent()
            || !(name == "runtime.sqlite"
                || name.starts_with("runtime.h-")
                    && name.ends_with(".sqlite")
                    && name
                        .bytes()
                        .all(|b| b.is_ascii_alphanumeric() || b".-_".contains(&b)))
        {
            return Err(unavailable());
        }
        Ok(())
    }
}
impl SqlitePlacement for Control {
    fn authority(&self) -> &str {
        &self.authority.authority
    }
    fn logical_identity(&self) -> &str {
        &self.authority.identity
    }
    fn acquire(&self) -> std::result::Result<PlacementPermit, Error> {
        let lease = self.data_lease(false).map_err(runtime_error)?;
        let pointer = self.pointer().map_err(runtime_error)?;
        if pointer.initialized {
            let meta = pointer
                .active
                .path
                .symlink_metadata()
                .map_err(runtime_error)?;
            if !meta.is_file() || meta.file_type().is_symlink() {
                return Err(runtime_error("active database is missing or invalid"));
            }
        }
        PlacementPermit::new(
            pointer.active.path,
            pointer.pending.is_none(),
            !pointer.initialized,
            Box::new(lease),
        )
    }
}
