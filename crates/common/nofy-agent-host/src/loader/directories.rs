//! Directory authority is explicit, immutable and independent of tool semantics.
use super::*;
use nofy_agent_runtime::{Error, registry::*, system::content_digest};
use nofy_host_path::Syntax;
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
#[cfg(test)]
mod tests;

pub(super) const ENV_PREFIX: &str = "NOFY_DIRECTORY_";
// The variant names are the wire vocabulary (`read_only`, `read_write`,
// `read_write_execute`), so they are not renamed to satisfy the prefix lint.
#[allow(clippy::enum_variant_names)]
#[derive(Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub(super) enum Access {
    ReadOnly,
    ReadWrite,
    ReadWriteExecute,
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub(super) struct Grant {
    pub path: PathBuf,
    pub access: Access,
}
/// Pure declaration rules. Windows syntax can also be checked on Unix hosts.
/// This grants no filesystem authority: Windows preflight remains unavailable,
/// Unix preflight requires exact canonical equality, and Linux acquisition still
/// checks the opened descriptor. Case folding is only a conservative deny rule
/// for private overlap, never proof that a path is canonical or not a link.
fn validate_path(path: &Path, private_root: &Path, syntax: Syntax) -> Result<()> {
    use std::path::Component;
    let unsafe_root = || HostError::Invalid("directory grant has an unsafe root".into());
    let text = path.to_str().ok_or_else(unsafe_root)?;
    let (invalid, private, reserved) = match syntax {
        Syntax::Posix => (
            // Preserve the existing directory contract, which is less strict
            // than process_local's normalized path rule: backslashes are legal
            // names, and Path components already normalize repeated separators,
            // interior "." and trailing separators. Do not reject those here.
            !path.is_absolute()
                || path == Path::new("/")
                || text.len() > 4096
                || text.chars().any(char::is_control)
                || path
                    .components()
                    .any(|part| !matches!(part, Component::RootDir | Component::Normal(_))),
            path.starts_with(private_root) || private_root.starts_with(path),
            ["/proc", "/sys", "/dev", "/run"]
                .iter()
                .any(|root| path.starts_with(root)),
        ),
        Syntax::Windows => (
            syntax.check_normalized_absolute(text, 4096).is_err(),
            private_root.to_str().is_none_or(|root| {
                syntax.starts_with(text, root) || syntax.starts_with(root, text)
            }),
            false,
        ),
    };
    if invalid || private || reserved {
        return Err(unsafe_root());
    }
    Ok(())
}
impl Grant {
    fn validate(&self, private_root: &Path) -> Result<()> {
        validate_path(&self.path, private_root, Syntax::HOST)
    }
    fn preflight(&self, private_root: &Path) -> Result<()> {
        self.validate(private_root)?;
        // Protected history may retain an 8.3 spelling even after a generation
        // is retired or missing. Neither lexical folding nor canonicalizing the
        // live grant proves it is disjoint from that protected Windows alias.
        // Keep declaration preview portable, but do not admit new authority
        // until a native path-identity protocol can verify every protected root.
        if cfg!(windows) {
            return Err(HostError::Unavailable(
                "directory authorization requires verified Windows protected-path identity".into(),
            ));
        }
        runtime_history::check_protected(private_root, &self.path)?;
        let canonical = std::fs::canonicalize(&self.path)
            .map_err(|_| HostError::Invalid("declared directory is unavailable".into()))?;
        if canonical != self.path || !canonical.is_dir() {
            return Err(HostError::Invalid(
                "directory must be an existing canonical directory".into(),
            ));
        }
        Ok(())
    }
    /// Validate the opened object, then give that same descriptor to Landlock.
    #[cfg(target_os = "linux")]
    pub(super) fn open(&self, private_root: &Path) -> Result<landlock::PathFd> {
        use std::os::fd::{AsFd, AsRawFd};
        self.validate(private_root)?;
        runtime_history::check_protected(private_root, &self.path)?;
        let descriptor = landlock::PathFd::new(&self.path).map_err(storage::unavailable)?;
        let actual =
            std::fs::read_link(format!("/proc/self/fd/{}", descriptor.as_fd().as_raw_fd()))
                .map_err(storage::unavailable)?;
        let file = std::fs::File::from(
            descriptor
                .as_fd()
                .try_clone_to_owned()
                .map_err(storage::unavailable)?,
        );
        if actual != self.path || !file.metadata().map_err(storage::unavailable)?.is_dir() {
            return Err(HostError::Invalid(
                "directory grant changed or is not canonical".into(),
            ));
        }
        runtime_history::check_protected(private_root, &actual)?;
        Ok(descriptor)
    }
}
pub(super) struct Directory {
    grant: Grant,
    private_root: PathBuf,
}
impl Directory {
    /// Immutable declaration only: no filesystem probe or new authority.
    pub fn declaration(&self) -> &Grant {
        &self.grant
    }
    pub fn requires_tree(&self) -> bool {
        matches!(self.grant.access, Access::ReadWriteExecute)
    }
    pub fn prepare(&self) -> Result<Grant> {
        self.grant.preflight(&self.private_root)?;
        Ok(self.grant.clone())
    }
}
pub(super) struct Factory {
    private_root: PathBuf,
}
impl Factory {
    pub fn new(private_root: PathBuf) -> Self {
        Self { private_root }
    }
}
fn config(value: &Value, private_root: &Path) -> Result<Grant> {
    let grant: Grant = serde_json::from_value(value.clone())
        .map_err(|_| HostError::Invalid("invalid directory resource".into()))?;
    grant.validate(private_root)?;
    Ok(grant)
}
impl ModuleFactory for Factory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "resource.directory".into(),
            revision: "1".into(),
            kind: ModuleKind::Resource,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["path","access"],"properties":{"path":{"type":"string","minLength":1,"maxLength":4096},"access":{"enum":["read_only","read_write","read_write_execute"]}}}),
            input_schema: None,
            output_schema: None,
            dependencies: Default::default(),
            required_capabilities: Default::default(),
        }
    }
    fn build(
        &self,
        value: &Value,
        _: &std::collections::BTreeMap<String, ModuleInstance>,
    ) -> std::result::Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        let grant =
            config(value, &self.private_root).map_err(|e| Error::Composition(e.to_string()))?;
        let identity = format!("directory-v1:{}", content_digest(&grant)?);
        Ok(ModuleInstance::Resource(Arc::new(ResourceHandle::new(
            identity,
            Arc::new(Directory {
                grant,
                private_root: self.private_root.clone(),
            }),
        )?)))
    }
}
/// Called only at persistent resource admission, never a read-only preview.
pub(super) fn preflight(document: &SystemDocument, private_root: &Path) -> Result<()> {
    for module in module_walk::collect(document)? {
        if module.factory == "resource.directory" {
            preflight_config(&module.config, private_root)?;
        }
    }
    Ok(())
}
pub(super) fn preflight_config(value: &Value, private_root: &Path) -> Result<()> {
    config(value, private_root)?.preflight(private_root)
}
